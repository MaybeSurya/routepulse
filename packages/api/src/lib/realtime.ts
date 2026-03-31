import { createClient } from "@supabase/supabase-js";
import { env } from "@route-pulse/env/server";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

/**
 * Broadcast a bus location update via Supabase Realtime.
 * Frontend subscribes to channel `bus:{busId}` event `location`.
 */
export async function broadcastLocation(
  busId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await supabase.channel(`bus:${busId}`).send({
    type: "broadcast",
    event: "location",
    payload,
  });
}

/**
 * Broadcast a seat status update for a bus.
 * Frontend subscribes to channel `seats:{busId}` event `update`.
 */
export async function broadcastSeatUpdate(
  busId: string,
  seatId: string,
  status: "available" | "held" | "booked",
  studentId?: string,
): Promise<void> {
  await supabase.channel(`seats:${busId}`).send({
    type: "broadcast",
    event: "update",
    payload: { seatId, status, studentId, timestamp: new Date().toISOString() },
  });
}

/**
 * Broadcast an announcement to all clients.
 * Frontend subscribes to channel `announcements` event `new`.
 */
export async function broadcastAnnouncement(
  announcement: Record<string, unknown>,
): Promise<void> {
  await supabase.channel("announcements").send({
    type: "broadcast",
    event: "new",
    payload: announcement,
  });
}

export async function broadcastSOS(
  payload: { busId: string; userId: string; lat: number; lng: number; message?: string },
): Promise<void> {
  await supabase.channel("admin:alerts").send({
    type: "broadcast",
    event: "sos",
    payload: { ...payload, timestamp: new Date().toISOString() },
  });
}

/**
 * Broadcast a system log event to the admin dashboard.
 * Frontend subscribes to channel `admin:logs` event `new`.
 */
export async function broadcastLog(
  log: Record<string, unknown>,
): Promise<void> {
  await supabase.channel("admin:logs").send({
    type: "broadcast",
    event: "new",
    payload: log,
  });
}

export { supabase as supabaseAdmin };
