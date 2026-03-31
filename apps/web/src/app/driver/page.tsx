"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { 
  Navigation, 
  Signal, 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Ban, 
  MessageSquare, 
  Home, 
  Route as RouteIcon, 
  AlertCircle, 
  UserCircle,
  Menu,
  ChevronRight,
  Phone,
  MapPin,
  Clock,
  LogOut,
  Zap,
  ShieldAlert
} from "lucide-react";
import dynamic from "next/dynamic";

import { Avatar, Button, Chip, Divider, Progress, ScrollShadow } from "@heroui/react";
import { useAuthStore } from "@/store/auth";
import { trpc } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGravatarUrl } from "@/utils/user";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

// ─── SOS Slider Component ───────────────────────────────────────────────────
interface SOSSliderProps {
  onTrigger: () => void;
  isPending: boolean;
}

function SOSSlider({ onTrigger, isPending }: SOSSliderProps) {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [0, 200],
    ["rgba(153, 27, 27, 0.1)", "rgba(220, 38, 38, 0.9)"]
  );
  
  const handleDragEnd = () => {
    if (x.get() > 180 && !isPending) {
      onTrigger();
      x.set(0);
    } else {
      x.set(0);
    }
  };

  return (
    <div className="relative w-full h-16 bg-red-950/10 rounded-2xl flex items-center p-1.5 border border-red-500/10 overflow-hidden shadow-inner">
      <motion.div style={{ background }} className="absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500/40 animate-pulse">Slide to Trigger SOS</span>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 280 }}
        dragElastic={0.1}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="h-13 w-13 bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] cursor-grab active:cursor-grabbing z-10 border border-red-400/50"
      >
        <ShieldAlert size={24} className="text-white" fill="currentColor" />
      </motion.div>
    </div>
  );
}

// ─── Main Interface ──────────────────────────────────────────────────────────
export default function DriverInterface() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"route" | "sos" | "support">("route");
  const [isShiftStarted, setIsShiftStarted] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setIsMounted(true);
    if (!accessToken || user?.role !== "driver") router.push("/auth/login");
  }, [accessToken, user, router]);

  const { data: routeData, isLoading } = useQuery(trpc.driver.getAssignedBus.queryOptions(undefined, {
    enabled: !!accessToken && user?.role === "driver",
    refetchInterval: 10000,
  }));

  const updateLocationMutation = useMutation(trpc.driver.updateLocation.mutationOptions());
  const markReachedMutation = useMutation(trpc.driver.markStopReached.mutationOptions());
  const triggerSOSMutation = useMutation(trpc.driver.triggerSOS.mutationOptions({
    onSuccess: () => {
        toast.error("SOS ALERT SENT! Authorities notified.", {
            duration: 8000,
            className: "bg-red-600 text-white font-black animate-pulse shadow-2xl border-2 border-white/20"
        });
        setActiveTab("route");
    },
    onError: (err: any) => toast.error(err.message),
  }));

  const [coords, setCoords] = useState<{ lat: number; lng: number; speed: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const bus = routeData?.success ? routeData.data.bus : null;
    
    // We start watching immediately for safety (SOS data readiness)
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed } = pos.coords;
        setCoords({ lat: latitude, lng: longitude, speed: speed || 0 });
        
        // We only persist the trail/history to the DB if the shift is active
        if (isShiftStarted && bus?.id) {
          updateLocationMutation.mutate({
            busId: bus.id,
            lat: latitude,
            lng: longitude,
            speed: speed || 0,
            heading: pos.coords.heading || undefined,
          });
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
           toast.error("GPS Access Denied: Enable location services for emergency safety features.");
        } else {
           console.warn("GPS watch error:", err.message);
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [routeData, isShiftStarted]);

  const bus = routeData?.success ? routeData.data.bus : null;
  const stops = bus?.route?.stops || [];
  const lastStopIndex = stops.findIndex((s: any) => s.id === bus?.lastStopId);
  const nextStop = stops[lastStopIndex + 1];

  // --- Navigation metrics to next stop ---
  const navMetrics = useMemo(() => {
    if (!coords || !nextStop) return null;
    const toRad = (d: number) => d * Math.PI / 180;
    const R = 6371000; // meters
    const dLat = toRad(nextStop.lat - coords.lat);
    const dLng = toRad(nextStop.lng - coords.lng);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(coords.lat)) * Math.cos(toRad(nextStop.lat)) * Math.sin(dLng/2)**2;
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    const y = Math.sin(toRad(nextStop.lng - coords.lng)) * Math.cos(toRad(nextStop.lat));
    const x = Math.cos(toRad(coords.lat)) * Math.sin(toRad(nextStop.lat)) - Math.sin(toRad(coords.lat)) * Math.cos(toRad(nextStop.lat)) * Math.cos(toRad(nextStop.lng - coords.lng));
    const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    const directions = ["N","NE","E","SE","S","SW","W","NW"];
    const cardinal = directions[Math.round(bearing / 45) % 8];
    
    return {
      distanceM: Math.round(distance),
      distanceStr: distance < 1000 ? `${Math.round(distance)}m` : `${(distance/1000).toFixed(1)}km`,
      bearing: Math.round(bearing),
      cardinal,
      eta: coords.speed > 0 ? Math.round((distance / coords.speed) / 60) : null,
    };
  }, [coords, nextStop]);

  const handleMarkReached = async () => {
    if (!bus?.id || !nextStop?.id) return;
    try {
      await markReachedMutation.mutateAsync({ busId: bus.id, stopId: nextStop.id });
      toast.success(`Arrived at ${nextStop.name.split("(")[0]}`);
      queryClient.invalidateQueries(trpc.driver.getAssignedBus.queryFilter());
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSOS = async () => {
    if (!bus?.id) {
       toast.error("Internal Error: Bus ID missing for emergency broadcast.");
       return;
    }

    const trigger = (lat: number, lng: number, speed: number) => {
      triggerSOSMutation.mutate({
        busId: bus.id,
        lat,
        lng,
        speed,
        message: "CRITICAL SOS: Emergency triggered from driver tactical terminal"
      });
    };

    // If we have reactive coords, send immediately
    if (coords) {
       trigger(coords.lat, coords.lng, coords.speed);
       return;
    }

    // Fallback: Immediate one-off GPS fix
    if (navigator.geolocation) {
       const loadingToast = toast.loading("Acquiring emergency telemetry...");
       navigator.geolocation.getCurrentPosition(
         (pos) => {
           toast.dismiss(loadingToast);
           trigger(pos.coords.latitude, pos.coords.longitude, pos.coords.speed || 0);
         },
         (err) => {
           toast.dismiss(loadingToast);
           toast.error("GPS Failure: Manual SOS triggered WITHOUT telemetry. Please contact dispatch via voice.");
           // Send a message-only SOS even without GPS as a last resort
           trigger(0, 0, 0); 
         },
         { enableHighAccuracy: true, timeout: 5000 }
       );
    } else {
       toast.error("SOS Triggered: GPS unavailable on this device.");
       trigger(0, 0, 0);
    }
  };

  if (!isMounted || !accessToken) return null;

  return (
    <div className="bg-zinc-950 text-zinc-100 h-[100dvh] overflow-hidden flex flex-col relative font-sans selection:bg-primary/30">
      
      {/* ─── MAP LAYER (Full Visibility) ─── */}
      <div className="absolute inset-0 z-0">
        <MapComponent 
          center={coords ? [coords.lat, coords.lng] : [30.3837, 77.9330]} 
          zoom={17} 
          followMode={isShiftStarted && !!coords}
          markers={[
            // Bus marker (only when tracking)
            ...(coords ? [{ id: "bus", position: [coords.lat, coords.lng] as [number, number], label: bus?.plateNumber || "My Bus", type: "bus" as const }] : []),
            // Route stop markers (only when shift active)
            ...(isShiftStarted && bus?.route?.stops ? (bus.route.stops as any[]).map((stop: any) => ({
              id: stop.id,
              position: [stop.lat, stop.lng] as [number, number],
              label: stop.name,
              type: "stop" as const,
              isNext: stop.id === nextStop?.id,
            })) : []),
          ]}
          polyline={isShiftStarted ? (bus?.route?.polyline ?? undefined) : undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-transparent to-zinc-950/80 pointer-events-none" />
      </div>


      {/* ─── INTEGRATED HUD ─── */}
      <div className="absolute top-0 w-full z-20 px-4 pt-6 pointer-events-none">
        <div className="flex justify-between items-start">
           <div className="flex flex-col gap-2 pointer-events-auto">
             <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/5 p-3 rounded-2xl flex items-center gap-3 shadow-2xl">
               <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                 <Navigation size={16} className="text-primary animate-pulse" />
               </div>
               <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">Fleet ID</p>
                  <p className="text-xs font-bold">{bus?.plateNumber || "SCANNING..."}</p>
               </div>
             </div>
             {bus?.route && (
               <Chip 
                 variant="dot" 
                 color="success" 
                 className="bg-zinc-950/60 backdrop-blur-md border border-white/5 font-black uppercase text-[9px] tracking-widest px-3"
               >
                 {bus.route.name}
               </Chip>
             )}
           </div>

           <div className="flex flex-col gap-2 items-end pointer-events-auto">
             <div className="flex gap-2">
                <Button isIconOnly variant="flat" size="sm" className="bg-zinc-950/60 backdrop-blur-md border border-white/5 rounded-xl">
                  <Signal size={14} className="text-emerald-500" />
                </Button>
                <Button isIconOnly variant="flat" size="sm" className="bg-zinc-950/60 backdrop-blur-md border border-white/5 rounded-xl">
                  <Bell size={14} className="text-zinc-400" />
                </Button>
             </div>
             <div className="bg-zinc-950/60 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-bold uppercase tracking-widest">LIVE DATA</span>
             </div>
           </div>
        </div>

        {/* Navigation Direction Banner — shows when shift active and next stop exists */}
        {isShiftStarted && navMetrics && nextStop && (
          <div className="mt-3 mx-auto w-fit pointer-events-auto">
            <div className="bg-indigo-950/80 backdrop-blur-xl border border-indigo-500/30 px-4 py-2 rounded-2xl flex items-center gap-4 shadow-2xl">
              {/* Bearing arrow */}
              <div
                className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30 flex-shrink-0"
                style={{ transform: `rotate(${navMetrics.bearing}deg)` }}
              >
                <Navigation size={16} className="text-indigo-400" fill="currentColor" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-500">Next Stop</p>
                <p className="text-xs font-black text-white">{nextStop.name.split("(")[0]}</p>
              </div>
              <div className="h-6 w-px bg-indigo-500/20" />
              <div className="text-center">
                <p className="text-lg font-black text-indigo-200 leading-none">{navMetrics.distanceStr}</p>
                <p className="text-[8px] text-indigo-500 uppercase font-bold">{navMetrics.cardinal}</p>
              </div>
              {navMetrics.eta !== null && (
                <>
                  <div className="h-6 w-px bg-indigo-500/20" />
                  <div className="text-center">
                    <p className="text-lg font-black text-indigo-200 leading-none">{navMetrics.eta}<span className="text-[10px] ml-0.5">min</span></p>
                    <p className="text-[8px] text-indigo-500 uppercase font-bold">ETA</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

// MISSION CONTROL CENTER
// (Truncated mapping content)

      <main className="flex-1 relative z-10 flex flex-col justify-end px-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === "route" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full space-y-4"
            >
              {/* Speed & Stats Overlay */}
              <div className="flex justify-between items-end px-2 mb-2">
                <div className="flex flex-col">
                  <span className="text-5xl font-black italic tracking-tighter tabular-nums drop-shadow-2xl">
                    {coords ? (coords.speed * 3.6).toFixed(0) : "0"}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">KILOMETERS PER HOUR</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-1">
                    <Clock size={10} className="text-indigo-400" />
                    <span className="text-[9px] font-black tracking-widest text-indigo-200 uppercase">On Schedule</span>
                  </div>
                </div>
              </div>

              {/* MISSION CARD */}
              <CardGlass className="p-5 space-y-6">
                 {bus?.status === "inactive" || !isShiftStarted ? (
                    <div className="py-8 text-center space-y-4">
                      <Zap size={40} className="mx-auto text-primary animate-bounce" fill="currentColor" />
                      <div className="space-y-1">
                        <h3 className="text-lg font-black uppercase italic tracking-tighter">
                          {!isShiftStarted ? "Ready for Duty?" : "Standby for Deployment"}
                        </h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          {!isShiftStarted ? "You must manually start your shift to begin tracking" : "Waiting for administration to assign route"}
                        </p>
                      </div>
                      {!isShiftStarted && (
                        <Button 
                          className="kinetic-gradient text-white font-black uppercase italic w-full" 
                          size="lg"
                          onClick={() => {
                            setIsShiftStarted(true);
                            toast.success("Shift started! Satellite link established.");
                          }}
                        >
                          START SHIFT
                        </Button>
                      )}
                      {isShiftStarted && !bus?.route && (
                         <div className="flex items-center justify-center gap-2 text-zinc-500">
                           <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Tactical Standby Active</span>
                         </div>
                      )}
                    </div>
                  ) : (
                    <>
                     <div className="flex items-start justify-between">
                       <div className="space-y-1">
                         <div className="flex items-center gap-2">
                           <MapPin size={12} className="text-primary" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Next Objective</span>
                         </div>
                         <h2 className="text-2xl font-black uppercase tracking-tighter italic leading-none">
                           {nextStop?.name.split("(")[0] || "Terminal Point"}
                         </h2>
                         {nextStop?.name.includes("(") && (
                           <p className="text-[11px] font-bold text-primary uppercase italic">
                             {nextStop.name.split("(")[1].replace(")", "")}
                           </p>
                         )}
                         {!nextStop && (
                           <Chip size="sm" color="success" variant="flat" className="font-black uppercase text-[10px] italic">Route Completed</Chip>
                         )}
                       </div>
                       <div className="text-right">
                         <p className="text-2xl font-black italic tracking-tighter leading-none">4<span className="text-xs ml-0.5">MIN</span></p>
                         <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">EST. ARRIVAL</p>
                       </div>
                     </div>

                     <Divider className="bg-white/5 shadow-inner" />

                     <div className="space-y-3">
                       <div className="flex justify-between items-center">
                         <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Assigned Riders ({stops.length > 0 ? 24 : 0})</span>
                         <Button size="sm" variant="light" className="text-[9px] font-bold uppercase tracking-widest min-w-0 h-auto p-0 text-primary">Manifest Details</Button>
                       </div>
                       <div className="flex gap-2.5">
                         {stops.length > 0 && Array.from({ length: 4 }).map((_, i) => (
                           <Avatar key={i} size="sm" src={`https://i.pravatar.cc/150?u=${i + 10}`} className="border border-white/10 ring-2 ring-zinc-950" />
                         ))}
                         {stops.length > 0 && (
                           <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] font-bold text-zinc-500">+12</div>
                         )}
                       </div>
                     </div>

                     <Button 
                       onClick={handleMarkReached}
                       disabled={markReachedMutation.isPending || !nextStop}
                       className="w-full h-16 bg-primary text-white font-black uppercase italic text-xl tracking-tighter transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(var(--heroui-primary-rgb),0.3)]"
                     >
                       {markReachedMutation.isPending ? "Engaging Stop..." : (
                         <>
                           <CheckCircle2 size={24} fill="currentColor" className="text-white/20" />
                           Mark Arrival
                         </>
                       )}
                     </Button>

                     <div className="grid grid-cols-2 gap-3">
                        <Button variant="flat" className="h-12 bg-zinc-900/50 backdrop-blur-md border border-white/5 font-black uppercase text-[10px] tracking-widest text-zinc-400">
                           <Ban size={14} className="mr-2" />
                           Skip Node
                        </Button>
                        <Button 
                          variant="flat" 
                          className="h-12 bg-zinc-900/50 backdrop-blur-md border border-white/5 font-black uppercase text-[10px] tracking-widest text-zinc-400"
                          onClick={() => setActiveTab("support")}
                        >
                           <MessageSquare size={14} className="mr-2" />
                           Tactical Support
                        </Button>
                     </div>
                    </>
                  )}
              </CardGlass>
            </motion.div>
          )}

          {activeTab === "sos" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full"
            >
              <CardGlass className="p-8 space-y-8 bg-red-950/20 border-red-500/30 overflow-hidden relative">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/10 blur-[60px] rounded-full" />
                 <div className="text-center space-y-2 relative z-10">
                    <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto border-2 border-red-600/40 animate-pulse">
                       <AlertTriangle size={40} className="text-red-500" fill="currentColor" />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-red-100">Tactical SOS</h2>
                    <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest px-8 leading-relaxed">
                      Emergency signal will be broadcasted to central command and authorities with live telemetry.
                    </p>
                 </div>

                 <SOSSlider 
                   onTrigger={handleSOS} 
                   isPending={triggerSOSMutation.isPending}
                 />

                 <Button 
                   variant="light" 
                   className="w-full font-black uppercase tracking-widest text-[10px] text-zinc-500"
                   onClick={() => setActiveTab("route")}
                 >
                   Disarm Signal
                 </Button>
              </CardGlass>
            </motion.div>
          )}

          {activeTab === "support" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full"
            >
              <CardGlass className="p-6 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                       <MessageSquare size={24} className="text-indigo-400" />
                    </div>
                    <div>
                       <h2 className="text-xl font-black uppercase italic tracking-tighter">Tactical Support</h2>
                       <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Connect with fleet dispatch</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-3">
                    <Button 
                      size="lg" 
                      variant="faded" 
                      className="w-full justify-start h-16 border-white/5 bg-zinc-900/50"
                      startContent={<Phone size={20} className="text-primary mr-2" />}
                    >
                      <div className="text-left">
                        <p className="text-xs font-bold uppercase tracking-tight">Emergency Hot-Line</p>
                        <p className="text-[10px] text-zinc-500">Priority voice communication</p>
                      </div>
                    </Button>
                    <Button 
                      size="lg" 
                      variant="faded" 
                      className="w-full justify-start h-16 border-white/5 bg-zinc-900/50"
                      startContent={<MessageSquare size={20} className="text-indigo-400 mr-2" />}
                    >
                      <div className="text-left">
                        <p className="text-xs font-bold uppercase tracking-tight">Text Relay</p>
                        <p className="text-[10px] text-zinc-500">Low-bandwidth text assistance</p>
                      </div>
                    </Button>
                 </div>

                 <Button variant="light" className="w-full font-black uppercase tracking-widest text-[10px]" onClick={() => setActiveTab("route")}>
                   Return to Navigation
                 </Button>
              </CardGlass>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ─── TACTICAL NAVIGATION ─── */}
      <nav className="fixed bottom-0 w-full flex justify-around items-center px-4 pb-8 pt-4 z-50 bg-zinc-950/80 backdrop-blur-2xl border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
        <NavButton 
          active={activeTab === "route"} 
          onClick={() => setActiveTab("route")}
          icon={<RouteIcon size={20} />}
          label="MISSION"
        />
        <NavButton 
          active={activeTab === "sos"} 
          onClick={() => setActiveTab("sos")}
          icon={<AlertTriangle size={20} />}
          label="SOS"
          danger
        />
        <NavButton 
          active={false} 
          onClick={() => router.push("/profile" as any)}
          icon={<Avatar src={getGravatarUrl(user?.email, 100)} size="sm" className="w-6 h-6 border border-white/10" />}
          label="PROFILE"
        />
        <div className="relative group">
           <Button 
             isIconOnly 
             variant="light" 
             className="text-zinc-500 hover:text-white"
             onClick={() => { useAuthStore.getState().logout(); router.push("/auth/login"); }}
           >
             <LogOut size={20} />
           </Button>
           <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] px-2 py-1 rounded font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Abort Mission</span>
        </div>
      </nav>

    </div>
  );
}

// ─── HELPER COMPONENTS ───────────────────────────────────────────────────────

function CardGlass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-zinc-950/40 backdrop-blur-3xl border border-white/5 rounded-[32px] shadow-2xl relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function NavButton({ active, onClick, icon, label, danger }: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
  danger?: boolean 
}) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center transition-all duration-300 relative px-6 py-2 rounded-2xl ${
        active 
          ? danger ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary" 
          : "text-zinc-600 hover:text-zinc-400"
      }`}
    >
      <div className={`${active ? "scale-110" : "scale-100"} transition-transform`}>
        {icon}
      </div>
      <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-1.5">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-glow"
          className={`absolute -bottom-1 w-6 h-[2px] rounded-full blur-[2px] ${danger ? "bg-red-500" : "bg-primary"}`}
        />
      )}
    </button>
  );
}
