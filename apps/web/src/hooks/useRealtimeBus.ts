"use client";
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface BusLocationPayload {
  lat: number;
  lng: number;
  speed: number;
  heading?: number;
  timestamp: string;
  reachedStopId?: string | null;
  isFinalStop?: boolean;
}

/**
 * Subscribe to real-time bus location updates via Supabase channel.
 * Calls `onLocation` every time the driver sends a GPS update.
 */
export function useRealtimeBus(
  busId: string | null | undefined,
  onLocation: (payload: BusLocationPayload) => void,
) {
  const callbackRef = useRef(onLocation);
  callbackRef.current = onLocation;

  const stableCallback = useCallback((payload: BusLocationPayload) => {
    callbackRef.current(payload);
  }, []);

  useEffect(() => {
    if (!busId) return;

    const channel = supabase
      .channel(`bus:${busId}`)
      .on("broadcast", { event: "location" }, (msg) => {
        stableCallback(msg.payload as BusLocationPayload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [busId, stableCallback]);
}

export interface SeatUpdatePayload {
  seatId: string;
  status: "available" | "held" | "booked";
  studentId?: string;
  timestamp: string;
}

/**
 * Subscribe to real-time seat status changes for a bus.
 */
export function useRealtimeSeats(
  busId: string | null | undefined,
  onUpdate: (payload: SeatUpdatePayload) => void,
) {
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  const stableCallback = useCallback((payload: SeatUpdatePayload) => {
    callbackRef.current(payload);
  }, []);

  useEffect(() => {
    if (!busId) return;

    const channel = supabase
      .channel(`seats:${busId}`)
      .on("broadcast", { event: "update" }, (msg) => {
        stableCallback(msg.payload as SeatUpdatePayload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [busId, stableCallback]);
}

/**
 * Subscribe to system announcements.
 */
export function useRealtimeAnnouncements(
  onAnnouncement: (payload: Record<string, unknown>) => void,
) {
  const callbackRef = useRef(onAnnouncement);
  callbackRef.current = onAnnouncement;

  useEffect(() => {
    const channel = supabase
      .channel("announcements")
      .on("broadcast", { event: "new" }, (msg) => {
        callbackRef.current(msg.payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
