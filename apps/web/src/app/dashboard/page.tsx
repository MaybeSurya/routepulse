"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  Search, 
  ShieldAlert, 
  Navigation, 
  Layers, 
  ExternalLink, 
  Armchair, 
  User, 
  Users, 
  Phone, 
  Route as RouteIcon,
  Home,
  ChevronRight,
  X
} from "lucide-react";
import dynamic from "next/dynamic";

import { useAuthStore } from "@/store/auth";
import { trpc } from "@/utils/trpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRealtimeBus, useRealtimeSeats } from "@/hooks/useRealtimeBus";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button, Progress, Avatar, Chip } from "@heroui/react";
import { calculateETA } from "@/utils/geo";
import { getGravatarUrl } from "@/utils/user";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────
type DashboardView = "tracking" | "booking";

// ─── Seat Component ────────────────────────────────────────────────────────────
function Seat({ status, onClick, seatNumber }: { status: any; onClick?: () => void; seatNumber: string }) {
  const isOccupied = status === "booked" || status === "held" && status !== "selected";
  const isSelected = status === "selected";
  
  return (
    <button
      onClick={onClick}
      disabled={isOccupied}
      className={`aspect-square rounded-xl flex items-center justify-center transition-all active:scale-90 ${
        isSelected 
          ? "bg-primary border border-primary-container shadow-[0_8px_16px_rgba(128,131,255,0.2)] text-on-primary" 
          : isOccupied
          ? "bg-surface-container border border-outline-variant/10 text-on-surface-variant opacity-30 cursor-not-allowed"
          : "bg-surface-container-highest border border-outline-variant/20 text-on-surface-variant/40 hover:bg-surface-container-high"
      }`}
    >
      {isOccupied ? (
        <User size={20} fill="currentColor" />
      ) : (
        <Armchair size={20} fill={isSelected ? "currentColor" : "none"} />
      )}
    </button>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [view, setView] = useState<DashboardView>("tracking");
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const router = useRouter();

  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    setIsMounted(true);
    if (!accessToken) router.push("/auth/login");
  }, [accessToken, router]);

  // Data Fetching
  const { data: routeData, isLoading: isBusLoading, refetch: refetchBus } = useQuery(
    trpc.student.getAssignedBus.queryOptions(undefined, { enabled: !!accessToken })
  );

  const { data: routesList, isLoading: isRoutesLoading } = useQuery(
    trpc.routes.list.queryOptions(undefined, { enabled: view === "booking" })
  );

  const bookMutation = useMutation(trpc.student.bookRoute.mutationOptions());
  
  const bus = (routeData?.success && (routeData.data as any)?.bookings?.[0]?.bus) 
    ? (routeData.data as any).bookings[0].bus : null;

  const { data: seatsData, refetch: refetchSeats } = useQuery(
    trpc.seats.getSeats.queryOptions({ busId: bus?.id! }, { enabled: !!bus?.id })
  );

  const holdMutation = useMutation(trpc.seats.holdSeat.mutationOptions());
  const confirmMutation = useMutation(trpc.seats.confirmSeat.mutationOptions());
  const sosMutation = useMutation(trpc.student.triggerSOS.mutationOptions());

  // Realtime
  const [liveLocation, setLiveLocation] = useState<any>(null);
  useRealtimeBus(bus?.id, (payload) => setLiveLocation(payload));
  useRealtimeSeats(bus?.id, () => refetchSeats());

  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

  // Handlers
  const handleBook = async (routeId: string) => {
    try {
      const res = await bookMutation.mutateAsync({ routeId });
      if (res.success) {
        toast.success("Route booked!");
        refetchBus();
        setView("tracking");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSeatClick = async (seatId: string) => {
    if (!bus?.id) return;
    try {
      const res = await holdMutation.mutateAsync({ busId: bus.id, seatId });
      if (res.success) {
        setSelectedSeatId(seatId);
        toast.success("Seat held for 2 minutes.");
        refetchSeats();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleConfirmBooking = async () => {
    if (!bus?.id || !selectedSeatId) return;
    try {
      const res = await confirmMutation.mutateAsync({ 
        busId: bus.id, 
        seatId: selectedSeatId,
        routeId: bus.routeId 
      });
      if (res.success) {
        toast.success("Seat confirmed! Enjoy your ride.");
        setSelectedSeatId(null);
        refetchSeats();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSOS = async () => {
    if (!bus?.id || !liveLocation) {
        toast.error("No active trip to report SOS.");
        return;
    }
    try {
        await sosMutation.mutateAsync({
            busId: bus.id,
            lat: liveLocation.lat,
            lng: liveLocation.lng,
            speed: liveLocation.speed,
            message: "Student Emergency"
        });
        toast.success("SOS Broadcasted! Help is on the way.");
    } catch (err: any) {
        toast.error(err.message);
    }
  };

  if (!isMounted || !accessToken) return null;

  // Map Data
  const routeStops = bus?.route?.stops || [];
  const nextStop = routeStops.find((s: any) => s.id === bus?.nextStopId) || routeStops[0];
  
  const eta = (liveLocation && nextStop) 
    ? calculateETA(liveLocation.lat, liveLocation.lng, nextStop.lat, nextStop.lng)
    : 0;

  const center: [number, number] = liveLocation 
    ? [liveLocation.lat, liveLocation.lng] 
    : routeStops.length > 0 ? [routeStops[0].lat, routeStops[0].lng] : [30.3837, 77.9330];
  
  const markers = [
    ...(liveLocation ? [{ id: "bus", position: [liveLocation.lat, liveLocation.lng] as [number, number], label: "Bus", type: "bus" }] : []),
    ...routeStops.map((s: any) => ({ id: s.id, position: [s.lat, s.lng] as [number, number], label: s.name, type: "stop" }))
  ];

  return (
    <div className="bg-background text-on-surface font-body overflow-hidden h-screen w-full select-none relative">
      
      {/* ─── MAP LAYER ─── */}
      <div className="absolute inset-0 z-0 bg-surface">
        <MapComponent 
          center={center} 
          zoom={15} 
          markers={markers} 
          polyline={bus?.route?.polyline ?? undefined}
        />
      </div>

      {/* ─── TOP BAR ─── */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => setIsSheetOpen(true)}
            className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-on-surface active:scale-90 transition-transform shadow-2xl border border-outline-variant/10"
          >
            <Menu size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold tracking-tighter text-primary leading-none">RoutePulse</h1>
            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant opacity-60">Live Tracking</span>
          </div>
        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
          <button 
            onClick={() => router.push("/profile" as any)}
            className="w-12 h-12 glass-panel rounded-full flex items-center justify-center p-1.5 border border-outline-variant/10 active:scale-95 transition-transform overflow-hidden shadow-2xl"
          >
            <Avatar src={getGravatarUrl(user?.email, 100)} className="w-full h-full text-tiny rounded-full" />
          </button>
          <button className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-error active:scale-95 transition-transform border border-error/20 shadow-[0_0_20px_rgba(255,180,171,0.2)]">
            <ShieldAlert size={20} fill="currentColor" />
          </button>
        </div>
      </header>

      {/* ─── UTILITIES ─── */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
        <button className="w-12 h-12 glass-panel rounded-xl flex items-center justify-center text-on-surface-variant border border-outline-variant/10">
          <Navigation size={20} />
        </button>
        <button className="w-12 h-12 glass-panel rounded-xl flex items-center justify-center text-on-surface-variant border border-outline-variant/10">
          <Layers size={20} />
        </button>
        <button 
          onClick={() => setView(view === "tracking" ? "booking" : "tracking")}
          className="w-12 h-12 glass-panel rounded-xl flex items-center justify-center text-primary border border-primary/20"
        >
          <ExternalLink size={20} />
        </button>
      </div>

      {/* ─── KINETIC BOTTOM SHEET ─── */}
      <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        {view === "tracking" ? (
          <div className="space-y-8">
            {/* Header */}
            <section className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black tracking-tighter text-on-surface mb-1">
                  {bus?.route?.name || "No Active Trip"}
                </h2>
                <p className="text-sm text-on-surface-variant font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  {bus?.plateNumber ? `Bus ${bus.plateNumber}` : "Book a route to start tracking"}
                </p>
              </div>
              {bus && (
                <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
                  <p className="text-[10px] uppercase tracking-widest font-extrabold text-primary mb-0.5">ETA</p>
                  <p className="text-xl font-black text-primary leading-none">
                    {eta > 0 ? `${String(eta).padStart(2, '0')} MIN` : "ARRIVED"}
                  </p>
                </div>
              )}
            </section>

            {!bus ? (
              <Button 
                className="w-full kinetic-gradient py-7 rounded-2xl text-on-primary-container font-black text-lg"
                onClick={() => setView("booking")}
              >
                + NEW BOOKING
              </Button>
            ) : (
              <>
                {/* Status Indicator */}
                <div className="p-5 rounded-3xl bg-surface-container border border-outline-variant/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Live Crowding</span>
                    <span className="text-[11px] font-bold text-tertiary">
                      {((seatsData?.data as any)?.filter((s: any) => s.status !== "available").length / (seatsData?.data as any)?.length * 100 > 80) ? "Critical" : "Active"}
                    </span>
                  </div>
                  <Progress 
                    size="sm" 
                    value={((seatsData?.data as any)?.filter((s: any) => s.status !== "available").length / (seatsData?.data as any)?.length * 100) || 0} 
                    color="primary" 
                    className="h-2" 
                  />
                  <div className="mt-4 flex items-center justify-between text-xs text-on-surface-variant font-medium">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} />
                      <span>{(seatsData?.data as any)?.filter((s: any) => s.status === "booked").length || 0} Booked Seats</span>
                    </div>
                    <button className="text-primary font-bold flex items-center gap-1">
                      Support <Phone size={12} />
                    </button>
                  </div>
                </div>

                {/* Seat Selection */}
                <section>
                  <div className="flex justify-between items-end mb-4 px-1">
                    <h3 className="text-lg font-bold tracking-tight text-on-surface">Secure a Seat</h3>
                    <span className="text-xs text-on-surface-variant opacity-60 font-medium">
                      {(seatsData?.data as any)?.filter((s: any) => s.status === "available").length || 0} available
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-3 mb-8">
                    {/* A robust grid that handles exactly 4 seats per row + 1 aisle */}
                    {((seatsData?.data as any) || Array.from({ length: 40 })).map((s: any, i: number) => {
                      const row = Math.floor(i / 4);
                      const colInRow = i % 4;
                      // Logic: 2 seats, 1 aisle, 2 seats
                      return (
                        <React.Fragment key={s?.id || `seat-${i}`}>
                          {colInRow === 2 && <div className="col-span-1" />}
                          <Seat 
                            status={selectedSeatId === s?.id ? "selected" : s?.status || "available"} 
                            seatNumber={s?.seatNumber || `${row + 1}${String.fromCharCode(65 + colInRow)}`}
                            onClick={() => s?.id && handleSeatClick(s?.id)}
                          />
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <Button 
                    isDisabled={!selectedSeatId || confirmMutation.isPending}
                    onClick={handleConfirmBooking}
                    className="w-full py-7 bg-gradient-to-br from-primary to-primary-container rounded-2xl text-on-primary-container font-black tracking-tight text-lg shadow-[0_20px_40px_rgba(128,131,255,0.3)] hover:-translate-y-1 transition-all"
                  >
                    {confirmMutation.isPending ? "CONFIRMING..." : selectedSeatId ? `BOOK SEAT ${selectedSeatId.slice(-2)}` : "SELECT A SEAT"}
                  </Button>
                </section>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold tracking-tight text-on-surface">Book Your Route</h2>
              <button 
                onClick={() => setView("tracking")}
                className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant"
              >
                <X size={20} />
              </button>
            </header>
            
            <div className="space-y-4">
              {isRoutesLoading ? (
                <div className="py-10 text-center text-on-surface-variant opacity-50">Fetching active routes...</div>
              ) : (routesList?.data || []).map((route: any) => (
                <button
                  key={route.id}
                  onClick={() => handleBook(route.id)}
                  className="w-full flex items-center justify-between p-5 rounded-3xl bg-surface-container-low border border-outline-variant/10 hover:border-primary/40 transition-all group group text-left"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      <RouteIcon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">{route.name}</h4>
                      <p className="text-xs text-on-surface-variant line-clamp-1">{route.description || "Campus Shuttle"}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-on-surface-variant opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}
      </BottomSheet>

      {/* ─── BOTTOM NAV ─── */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 z-[60] glass-panel border-t border-outline-variant/10">
        <a className="flex flex-col items-center justify-center bg-primary text-background rounded-xl px-4 py-1 active:scale-90 transition-all" href="#">
          <Home size={18} fill="currentColor" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Home</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-white transition-all" href="#">
          <Navigation size={18} />
          <span className="text-[10px] uppercase tracking-widest font-bold">Routes</span>
        </a>
        <button 
          onClick={handleSOS}
          disabled={sosMutation.isPending}
          className="flex flex-col items-center justify-center text-error hover:text-white transition-all disabled:opacity-50"
        >
          <ShieldAlert size={18} />
          <span className="text-[10px] uppercase tracking-widest font-bold">
            {sosMutation.isPending ? "ALARM..." : "SOS"}
          </span>
        </button>
        <button 
          onClick={() => { logout(); router.push("/auth/login"); }}
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-white transition-all"
        >
          <User size={18} />
          <span className="text-[10px] uppercase tracking-widest font-bold">Logout</span>
        </button>
      </nav>

      {/* ─── PATH BUTTON ─── */}
      <div className="fixed bottom-[380px] left-6 z-40">
        <button className="w-14 h-14 bg-white/5 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center border border-white/10 shadow-2xl active:scale-90 transition-transform">
          <RouteIcon size={24} className="text-primary" />
          <span className="text-[8px] font-black uppercase mt-0.5 text-on-surface-variant">View Path</span>
        </button>
      </div>

    </div>
  );
}
