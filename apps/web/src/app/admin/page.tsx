"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Bus, 
  Route as RouteIcon, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  Plus,
  ChevronRight,
  MoreVertical,
  Map as MapIcon,
  ShieldCheck,
  ShieldAlert,
  X,
  User,
  MapPin
} from "lucide-react";
import dynamic from "next/dynamic";

import { useAuthStore } from "@/store/auth";
import { trpc } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Button, 
  Input, 
  Avatar, 
  Chip, 
  Progress, 
  Tabs, 
  Tab, 
  Card, 
  CardBody,
  useDisclosure
} from "@heroui/react";

import { RouteModal } from "./components/RouteModal";
import { UserActions } from "./components/UserActions";
import { BusModal } from "./components/BusModal";
import { DriverModal } from "./components/DriverModal";
import { supabase } from "@/lib/supabase";
import { DispatchModal } from "./components/DispatchModal";
import { getGravatarUrl } from "@/utils/user";
import { ComplaintsTable } from "./components/ComplaintsTable";
import { ConfirmationModal } from "@/components/ConfirmationModal";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

// ─── Sidebar Component ────────────────────────────────────────────────────────
function AdminSidebar({ activeTab, onTabChange, onDispatchOpen }: { activeTab: string; onTabChange: (t: any) => void; onDispatchOpen: () => void }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const menu = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "fleet", label: "Fleet Management", icon: Bus },
    { id: "routes", label: "Route Optimization", icon: RouteIcon },
    { id: "users", label: "Personnel", icon: Users, hidden: user?.role !== "super_admin" },
    { id: "complaints", label: "Feedback Desk", icon: AlertCircle },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 p-4 gap-2 bg-background border-r border-default-100 flex-shrink-0">
      <div className="text-xl font-bold text-primary px-4 mb-8">RoutePulse</div>
      <div className="flex flex-col gap-1 flex-grow">
        {menu.filter(i => !i.hidden).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-label={`Switch to ${item.label}`}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${
                activeTab === item.id 
                  ? "text-primary bg-primary/10" 
                  : "text-default-500 hover:bg-content1 hover:text-foreground"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      <Button 
        aria-label="Create New Dispatch"
        className="kinetic-gradient text-white font-bold py-6 rounded-xl mb-6 shadow-lg shadow-primary/20"
        onPress={onDispatchOpen}
      >
        New Dispatch
      </Button>
      <div className="flex flex-col gap-1 border-t border-default-100 pt-4">
        <button 
          aria-label="Open Profile" 
          onClick={() => router.push("/profile" as any)}
          className={`flex items-center gap-3 px-4 py-2 transition-colors text-sm font-medium ${activeTab === 'profile' ? 'text-primary' : 'text-default-500 hover:text-foreground'}`}
        >
          <User size={20} />
          <span>My Profile</span>
        </button>
        <button aria-label="Open Settings" className="flex items-center gap-3 px-4 py-2 text-default-500 hover:text-foreground transition-colors text-sm font-medium">
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button 
          aria-label="Logout"
          onClick={() => { logout(); router.push("/auth/login"); }}
          className="flex items-center gap-3 px-4 py-2 text-default-500 hover:text-red-500 transition-colors text-sm font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
import { showErrorToast } from "@/utils/toast";

export default function AdminPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const { isOpen: isRouteOpen, onOpen: onRouteOpen, onOpenChange: onRouteOpenChange } = useDisclosure();
  const { isOpen: isBusOpen, onOpen: onBusOpen, onOpenChange: onBusOpenChange } = useDisclosure();
  const { isOpen: isDriverOpen, onOpen: onDriverOpen, onOpenChange: onDriverOpenChange } = useDisclosure();
  const { isOpen: isDispatchOpen, onOpen: onDispatchOpen, onOpenChange: onDispatchOpenChange } = useDisclosure();
  
  const router = useRouter();
  const [sosAlerts, setSosAlerts] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const [confirmData, setConfirmData] = useState<{ isOpen: boolean; type: "bus" | "route"; id: string; label: string }>({
    isOpen: false,
    type: "bus",
    id: "",
    label: ""
  });

  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    setIsMounted(true);
    if (isMounted && (!accessToken || (user?.role !== "transport_admin" && user?.role !== "super_admin"))) {
      router.push("/auth/login");
    }
  }, [isMounted, accessToken, user, router]);

  useEffect(() => {
    if (!accessToken) return;

    const alertChannel = supabase
      .channel("admin:alerts")
      .on("broadcast", { event: "sos" }, (payload) => {
        const newAlert = { ...payload.payload, id: Date.now() };
        setSosAlerts(prev => [newAlert, ...prev]);
        
        // Play critical alert sound
        try {
          const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
          audio.play().catch(e => console.warn("Audio autoplay blocked:", e));
        } catch (e) {
          console.error("Audio playback failure:", e);
        }

        showErrorToast(`🚨 SOS ALERT: Unit ${newAlert.busId}`, 
            `${newAlert.userName || "Driver"} reports: ${newAlert.message || "Emergency"}`
        );
      })
      .subscribe();

    const logChannel = supabase
      .channel("admin:logs")
      .on("broadcast", { event: "new" }, (payload) => {
        queryClient.setQueryData(trpc.admin.listLogs.queryKey({ limit: 50, offset: 0 }), (prev: any) => {
          if (!prev) return prev;
          return { ...prev, data: [payload.payload, ...prev.data.slice(0, 49)] };
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(alertChannel);
      supabase.removeChannel(logChannel);
    };
  }, [accessToken, queryClient]);

  // Data Fetching
  const analyticsRes = useQuery(trpc.admin.getSystemAnalytics.queryOptions(undefined, { enabled: !!accessToken }));
  const routesRes = useQuery(trpc.admin.getRoutes.queryOptions({ includeBuses: true }, { enabled: !!accessToken }));
  const busesRes = useQuery(trpc.admin.listBuses.queryOptions(undefined, { enabled: !!accessToken }));
  const complaintsRes = useQuery(trpc.admin.listComplaints.queryOptions(undefined, { enabled: activeTab === "complaints" && !!accessToken }));
  const logsRes = useQuery(trpc.admin.listLogs.queryOptions({ limit: 50, offset: 0 }, { enabled: activeTab === "overview" && !!accessToken }));
  const usersRes = useQuery(trpc.admin.listAllUsers.queryOptions(undefined, { 
    enabled: !!accessToken && user?.role === "super_admin" 
  }));

  const deleteBusMutation = useMutation(trpc.admin.deleteBus.mutationOptions({
    onSuccess: () => {
      toast.success("Bus decommissioned");
      queryClient.invalidateQueries(trpc.admin.listBuses.queryFilter());
    }
  }));

  const deleteRouteMutation = useMutation(trpc.admin.deleteRoute.mutationOptions({
    onSuccess: () => {
      toast.success("Route permanently removed");
      queryClient.invalidateQueries(trpc.admin.getRoutes.queryFilter());
    }
  }));

  if (!isMounted || !accessToken) return null;

  const stats = analyticsRes?.data?.data;
  const routes = routesRes?.data?.success ? (routesRes.data.data as any[]) : [];
  
  // Map Markers
  const fleetMarkers = routes.flatMap(r => (r.buses || []).map((b: any) => ({ 
    id: b.id, position: [Number(b.lat) || 0, Number(b.lng) || 0], label: `${r.name}`, type: "bus" as const 
  })));
  const stopMarkers = routes.flatMap(r => (r.stops || []).map((s: any) => ({ 
    id: s.id, position: [Number(s.lat) || 0, Number(s.lng) || 0], label: s.name, type: "stop" as const 
  })));


  const handleManageRoute = (route: any) => {
    setSelectedRoute(route);
    onRouteOpen();
  };

  const handleCreateRoute = () => {
    setSelectedRoute(null);
    onRouteOpen();
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative font-sans text-zinc-100">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} onDispatchOpen={onDispatchOpen} />
      
      <main className="flex-grow flex flex-col h-screen overflow-y-auto no-scrollbar relative">
        
        {/* Header */}
        <header className="sticky top-0 w-full flex justify-between items-center px-8 py-4 bg-background/80 backdrop-blur-md z-50 border-b border-default-100">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-primary lg:hidden">RoutePulse</h1>
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <button aria-label="Overview Tab" className={`${activeTab === "overview" ? "text-primary border-b-2 border-primary" : "text-default-500"} pb-1`} onClick={() => setActiveTab("overview")}>Overview</button>
              <button aria-label="Routes Tab" className={`${activeTab === "routes" ? "text-primary border-b-2 border-primary" : "text-default-500"} pb-1`} onClick={() => setActiveTab("routes")}>Routes</button>
              <button aria-label="Live Map Tab" className={`${activeTab === "fleet" ? "text-primary border-b-2 border-primary" : "text-default-500"} pb-1`} onClick={() => setActiveTab("fleet")}>Live Map</button>
              {user?.role === "super_admin" && (
                <button aria-label="Personnel Tab" className={`${activeTab === "users" ? "text-primary border-b-2 border-primary" : "text-default-500"} pb-1`} onClick={() => setActiveTab("users")}>Personnel</button>
              )}
              <button aria-label="Analytics Tab" className={`${activeTab === "analytics" ? "text-primary border-b-2 border-primary" : "text-default-500"} pb-1`} onClick={() => setActiveTab("analytics")}>Analytics</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-content1 px-3 py-1.5 rounded-xl border border-default-100 flex items-center gap-2">
              <Search aria-hidden="true" size={18} className="text-default-500" />
              <input 
                aria-label="Global Search"
                className="bg-transparent border-none focus:ring-0 text-sm text-foreground placeholder-default-500 w-32 lg:w-48" 
                placeholder="Search..." 
                type="text"
              />
            </div>
            <button aria-label="Notifications" className="text-default-500 hover:text-foreground active:scale-95 transition-transform"><Bell size={20} /></button>
            <button 
              aria-label="User Profile" 
              onClick={() => router.push("/profile" as any)}
              className="transition-transform active:scale-95"
            >
              <Avatar 
                size="sm" 
                src={getGravatarUrl(user?.email, 150)} 
                className="border border-default-100 cursor-pointer" 
              />
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Headline */}
          <section>
            <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic">Command Center</h1>
            <p className="text-default-400 font-medium">Precision Logistics & Real-time Fleet Oversight</p>
          </section>

          {activeTab === "overview" && (
            <>
              {/* KPI Grid */}
                <div className="bg-content1 p-6 rounded-2xl border border-default-100 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Bus size={64} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-default-500 mb-2">Fleet Availability</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black text-foreground">{stats?.buses?.active || 0}</h2>
                    <span className="text-xs font-bold text-success">/ {stats?.buses?.total || 0} UNITS</span>
                  </div>
                  <Progress size="sm" value={((stats?.buses?.active || 0) / (stats?.buses?.total || 1)) * 100} color="success" className="mt-4" />
                </div>

                <div className="bg-content1 p-6 rounded-2xl border border-default-100 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Users size={64} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-default-500 mb-2">Live Ridership</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black text-foreground">{stats?.bookings?.confirmed || 0}</h2>
                    <span className="text-xs font-bold text-primary">BOARDED</span>
                  </div>
                  <p className="text-[10px] font-black text-default-400 mt-4 uppercase italic tracking-tighter">Current shift active bookings</p>
                </div>

                <div className="bg-content1 p-6 rounded-2xl border border-default-100 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <AlertTriangle size={64} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-default-500 mb-2">System Alerts</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black text-danger">{sosAlerts.length}</h2>
                    <span className="text-xs font-bold text-danger">CRITICAL</span>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-black text-success uppercase tracking-tighter">System Pulse Healthy</span>
                  </div>
                </div>

              {/* SOS Emergency Panel */}
              <AnimatePresence>
                {sosAlerts.length > 0 && (
                  <motion.section 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-danger animate-ping" />
                      <h3 className="text-xl font-black text-danger uppercase tracking-tighter italic">Emergency Pulse</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sosAlerts.map((alert) => (
                        <div key={alert.id} className="bg-danger/10 border-2 border-danger/30 p-6 rounded-3xl shadow-[0_20px_50px_rgba(243,18,96,0.15)] relative overflow-hidden group">
                          <div className="absolute -top-4 -right-4 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ShieldAlert size={80} className="text-danger" />
                          </div>
                          <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-danger mb-1 opacity-60">Unit Identity</p>
                                <h4 className="text-2xl font-black text-foreground">Bus {alert.busId.slice(-4).toUpperCase()}</h4>
                            </div>
                            <button onClick={() => setSosAlerts(prev => prev.filter(a => a.id !== alert.id))} className="p-2 hover:bg-danger/20 rounded-full transition-colors text-danger">
                                <X size={20} />
                            </button>
                          </div>
                          
                          <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center text-danger">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-danger/60">Dispatcher Alias</p>
                                    <p className="font-bold text-foreground leading-none">{alert.userName || "Unknown Operator"}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-background/40 rounded-2xl border border-danger/10">
                                    <p className="text-[9px] font-black uppercase text-danger/60 mb-1">Velocity</p>
                                    <p className="text-lg font-black text-foreground">{alert.speed || 0} <span className="text-[10px]">KM/H</span></p>
                                </div>
                                <div className="p-3 bg-background/40 rounded-2xl border border-danger/10">
                                    <p className="text-[9px] font-black uppercase text-danger/60 mb-1">Incident Time</p>
                                    <p className="text-[11px] font-black text-foreground uppercase">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-danger/5 rounded-2xl border-l-4 border-danger">
                                <p className="text-[10px] font-black uppercase text-danger/60 mb-1 italic">Message from Deck</p>
                                <p className="text-sm font-bold text-foreground leading-tight italic">"{alert.message || "NO MESSAGE PROVIDED"}"</p>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <MapPin size={14} className="text-danger" />
                                <span className="text-[10px] font-black text-foreground uppercase tracking-tighter">
                                    GEO: {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}
                                </span>
                            </div>
                            
                            <Button size="sm" color="danger" variant="shadow" className="w-full font-black uppercase italic mt-2" onClick={() => {
                                // Logic to focus map on this alert
                                toast.info("Locking satellite on incident coordinates...");
                            }}>
                                ENGAGE SAT-LINK
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Map & Logs Preview */}
              <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-content1 rounded-2xl border border-default-100 overflow-hidden h-[450px] relative shadow-2xl">
                  <div className="absolute top-4 left-4 z-10 glass-panel px-4 py-2 rounded-xl border border-white/10">
                    <p className="text-[10px] font-black uppercase text-primary">Live Ops Map</p>
                  </div>
                  <MapComponent markers={[...fleetMarkers, ...stopMarkers]} />
                </div>
                <div className="bg-content1 rounded-2xl border border-default-100 flex flex-col shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-default-100 flex justify-between items-center bg-content2/50">
                    <h3 className="font-black tracking-tight text-foreground uppercase italic">Live Route Logs</h3>
                    <Button size="sm" variant="flat" color="primary" className="font-bold">View All</Button>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
                    <table className="w-full text-left">
                      <thead className="bg-background text-[10px] font-black uppercase tracking-widest text-default-400">
                        <tr>
                          <th className="px-6 py-4">Event</th>
                          <th className="px-6 py-4">Level</th>
                          <th className="px-6 py-4 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-default-100">
                        {((logsRes?.data?.data as any[]) || []).slice(0, 10).map((log: any) => (
                          <tr key={log.id} className="hover:bg-content2/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-sm text-foreground">{log.event.replace('_', ' ')}</span>
                                <span className="text-[10px] text-default-500 uppercase tracking-tighter">{log.message || "Manual Entry"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Chip size="sm" variant="dot" color={log.type === "CRITICAL" ? "danger" : log.type === "WARNING" ? "warning" : "primary"} className="font-bold uppercase text-[9px]">
                                {log.type}
                              </Chip>
                            </td>
                            <td className="px-6 py-4 text-right text-[10px] font-bold text-default-400">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === "complaints" && (
            <ComplaintsTable complaints={complaintsRes?.data?.data || []} />
          )}

          {activeTab === "routes" && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routes.map((route: any) => (
                <Card key={route.id} className="bg-content1 border-none shadow-xl hover:-translate-y-1 transition-all">
                  <CardBody className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary" style={{ color: route.color }}>
                        <RouteIcon size={24} />
                      </div>
                      <Chip color={route.isActive ? "success" : "default"} variant="flat" size="sm" className="font-bold">
                        {route.isActive ? "Active" : "Parked"}
                      </Chip>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{route.name}</h3>
                    <p className="text-xs text-default-500 mb-6">{route.stops?.length || 0} stops defined</p>
                    <div className="flex items-center justify-between pt-4 border-t border-default-100">
                      <div className="flex items-center gap-2">
                        <Avatar size="sm" src={`https://i.pravatar.cc/150?u=${route.id}`} />
                        <span className="text-[10px] font-bold text-default-400">Assigned Driver</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          aria-label={`Manage route ${route.name}`}
                          size="sm" variant="flat" className="font-bold" onClick={() => handleManageRoute(route)}>Manage</Button>
                        <Button 
                          isIconOnly
                          size="sm" variant="flat" color="danger" className="min-w-0" 
                          onClick={() => setConfirmData({ isOpen: true, type: "route", id: route.id, label: route.name })}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
              <Card 
                aria-label="Create New Route"
                isPressable
                className="bg-background border-2 border-dashed border-default-100 flex items-center justify-center cursor-pointer hover:bg-content1 transition-all"
                onPress={handleCreateRoute}
              >
                <CardBody className="flex flex-col items-center justify-center py-10">
                  <div className="w-12 h-12 rounded-full bg-default-100 flex items-center justify-center text-default-500 mb-2">
                    <Plus size={24} />
                  </div>
                  <p className="text-xs font-bold text-default-500">Create New Route</p>
                </CardBody>
              </Card>
            </section>
          )}

          {activeTab === "users" && (
            <section className="bg-content1 rounded-2xl border border-default-100 shadow-2xl overflow-hidden">
              <div className="p-6 flex justify-between items-center border-b border-default-100">
                <h3 className="font-black uppercase tracking-tight text-foreground italic">Personnel Directory</h3>
                <div className="flex gap-4">
                  <Input 
                    aria-label="Search personnels"
                    size="sm" 
                    className="w-64" 
                    placeholder="Search users..." 
                    startContent={<Search size={16} />} 
                  />
                  <Button 
                    aria-label="Add New Driver"
                    size="sm" 
                    color="primary" 
                    className="font-bold uppercase italic"
                    onPress={onDriverOpen}
                    startContent={<Plus size={16} />}
                  >
                    Add Driver
                  </Button>
                </div>
              </div>
              <table className="w-full text-left">
                <thead className="bg-background/50 text-[10px] font-black uppercase tracking-widest text-default-400">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Security</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100">
                  {(usersRes?.data?.data as any[] || []).map((u) => (
                    <tr key={u.id} className="hover:bg-content2/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" radius="md" src={`https://i.pravatar.cc/150?u=${u.id}`} />
                          <div>
                            <p className="text-sm font-bold text-foreground">{u.email}</p>
                            <p className="text-[10px] text-default-500">ID: {u.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 uppercase text-[10px] font-black tracking-tighter text-primary">{u.role?.replace('_', ' ')}</td>
                      <td className="px-6 py-4"><Chip size="sm" variant="flat" color="success" startContent={<ShieldCheck size={12} />} className="font-bold">VERIFIED</Chip></td>
                      <td className="px-6 py-4 text-right">
                        <UserActions user={u} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {activeTab === "analytics" && (
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-content1 border-none shadow-xl">
                  <CardBody className="p-6">
                    <p className="text-[10px] font-black uppercase text-default-500 mb-1">Peak Rider Volume</p>
                    <h4 className="text-2xl font-black">1,284 <span className="text-xs text-success">+12%</span></h4>
                    <Progress size="sm" value={85} color="success" className="mt-4" />
                  </CardBody>
                </Card>
                <Card className="bg-content1 border-none shadow-xl">
                  <CardBody className="p-6">
                    <p className="text-[10px] font-black uppercase text-default-500 mb-1">Fleet Efficiency</p>
                    <h4 className="text-2xl font-black">94.2% <span className="text-xs text-primary">Optimal</span></h4>
                    <Progress size="sm" value={94} color="primary" className="mt-4" />
                  </CardBody>
                </Card>
                <Card className="bg-content1 border-none shadow-xl">
                  <CardBody className="p-6">
                    <p className="text-[10px] font-black uppercase text-default-500 mb-1">Fuel Consumption</p>
                    <h4 className="text-2xl font-black">4,120L <span className="text-xs text-danger">-3%</span></h4>
                    <Progress size="sm" value={60} color="danger" className="mt-4" />
                  </CardBody>
                </Card>
                <Card className="bg-content1 border-none shadow-xl">
                  <CardBody className="p-6">
                    <p className="text-[10px] font-black uppercase text-default-500 mb-1">Safety Incidents</p>
                    <h4 className="text-2xl font-black">0 <span className="text-xs text-success">Perfect</span></h4>
                    <Progress size="sm" value={100} color="success" className="mt-4" />
                  </CardBody>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-content1 border-none shadow-2xl p-6">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="font-black uppercase italic text-foreground">Route Popularity</h3>
                     <TrendingUp size={20} className="text-primary" />
                   </div>
                   <div className="space-y-6">
                     {routes.slice(0, 4).map((r, i) => (
                       <div key={r.id}>
                         <div className="flex justify-between text-xs font-bold mb-2">
                           <span>{r.name}</span>
                           <span>{85 - i * 15}%</span>
                         </div>
                         <Progress value={85 - i * 15} color={i % 2 === 0 ? "primary" : "secondary"} size="md" />
                       </div>
                     ))}
                   </div>
                </Card>
                <Card className="bg-content1 border-none shadow-2xl p-10 flex flex-col items-center justify-center min-h-[400px]">
                  <BarChart3 size={48} className="text-primary mb-4 opacity-50" />
                  <h3 className="text-xl font-black text-foreground mb-2 italic uppercase">System Intel</h3>
                  <p className="text-sm text-default-500 text-center max-w-xs uppercase tracking-tighter font-bold">Heuristic analysis of fleet data is ongoing. Predictive maintenance alerts will populate here once baseline is reached.</p>
                  <Button aria-label="Refresh Neural Analytics Engine" variant="flat" color="primary" size="sm" className="mt-6 font-bold uppercase italic">Refresh Neural Engine</Button>
                </Card>
              </div>
            </section>
          )}

          {activeTab === "fleet" && (
            <div className="space-y-8 h-full flex flex-col">
              <section className="bg-content1 rounded-2xl border border-default-100 shadow-2xl overflow-hidden h-[500px] relative flex-shrink-0">
                <MapComponent markers={[...fleetMarkers, ...stopMarkers]} />
                <div className="absolute bottom-6 left-6 z-10 glass-panel p-4 rounded-2xl border border-white/10 w-64">
                  <p className="text-xs font-black uppercase tracking-widest text-primary mb-3">Live Fleet Status</p>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-foreground/80 mb-1">
                        <span>VESSELS ON MISSION</span>
                        <span>{stats?.buses?.active || 0}/{stats?.buses?.total || 0}</span>
                      </div>
                      <Progress size="sm" value={stats?.buses?.total ? (stats.buses.active / stats.buses.total) * 100 : 0} color="primary" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-content1 rounded-2xl border border-default-100 shadow-2xl overflow-hidden flex-grow flex flex-col">
                <div className="p-6 flex justify-between items-center border-b border-default-100 bg-content2/30">
                  <h3 className="font-black uppercase tracking-tight text-foreground italic">Unit Registry</h3>
                  <Button 
                    aria-label="Add New Bus"
                    size="sm" 
                    color="primary" 
                    className="font-bold uppercase italic"
                    onPress={onBusOpen}
                    startContent={<Plus size={16} />}
                  >
                    Add Bus
                  </Button>
                </div>
                <div className="overflow-y-auto no-scrollbar flex-grow">
                  <table className="w-full text-left">
                    <thead className="bg-background/50 text-[10px] font-black uppercase tracking-widest text-default-400">
                      <tr>
                        <th className="px-6 py-4">Plate Number</th>
                        <th className="px-6 py-4">Route</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Driver</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-default-100">
                      {(busesRes?.data?.data as any[] || []).map((bus) => (
                        <tr key={bus.id} className="hover:bg-content2/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-sm">{bus.plateNumber}</td>
                          <td className="px-6 py-4 text-xs font-medium text-default-500">{bus.route?.name || "Unassigned"}</td>
                          <td className="px-6 py-4">
                            <Chip size="sm" variant="dot" color={bus.status === "en_route" ? "success" : "default"} className="font-bold uppercase text-[9px]">
                              {bus.status.replace('_', ' ')}
                            </Chip>
                          </td>
                          <td className="px-6 py-4 text-xs">{bus.driver?.user?.email || "No Driver"}</td>
                          <td className="px-6 py-4 text-right">
                            <Button 
                              isIconOnly 
                              size="sm" 
                              variant="flat" 
                              color="danger"
                              className="min-w-0"
                              onClick={() => setConfirmData({ isOpen: true, type: "bus", id: bus.id, label: bus.plateNumber })}
                            >
                              <X size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

        </div>
      </main>

      <RouteModal 
        isOpen={isRouteOpen} 
        onOpenChange={onRouteOpenChange} 
        route={selectedRoute} 
      />
      <BusModal 
        isOpen={isBusOpen} 
        onOpenChange={onBusOpenChange} 
      />
      <DriverModal 
        isOpen={isDriverOpen} 
        onOpenChange={onDriverOpenChange} 
      />
      <DispatchModal
        isOpen={isDispatchOpen}
        onOpenChange={onDispatchOpenChange}
      />

      <ConfirmationModal
        isOpen={confirmData.isOpen}
        onOpenChange={(open) => setConfirmData(prev => ({ ...prev, isOpen: open }))}
        title={confirmData.type === "bus" ? "Decommission Vessel" : "Permanently Delete Route"}
        message={confirmData.type === "bus" 
          ? `Are you sure you want to decommission unit ${confirmData.label}? This will remove it from active fleet records.`
          : `Are you sure you want to permanently delete the ${confirmData.label} route? All strategic nodes and path data will be lost.`
        }
        confirmLabel={confirmData.type === "bus" ? "Decommission Unit" : "Delete Route"}
        isLoading={deleteBusMutation.isPending || deleteRouteMutation.isPending}
        onConfirm={() => {
          if (confirmData.type === "bus") {
            deleteBusMutation.mutate({ id: confirmData.id });
          } else {
            deleteRouteMutation.mutate({ id: confirmData.id });
          }
        }}
      />
    </div>
  );
}
