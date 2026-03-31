"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Key, 
  Bell, 
  ChevronRight, 
  ShieldCheck, 
  Circle,
  Navigation
} from "lucide-react";

import { useAuthStore } from "@/store/auth";
import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { Button, Input, Checkbox } from "@heroui/react";
import { showErrorToast } from "@/utils/toast";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<any>("student");
  const [rememberMe, setRememberMe] = useState(true);

  const loginStudentMutation = useMutation(trpc.auth.loginStudent.mutationOptions());
  const loginDriverMutation = useMutation(trpc.auth.loginDriver.mutationOptions());
  const loginAdminMutation = useMutation(trpc.auth.loginAdmin.mutationOptions());

  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (accessToken && user) {
      if (user.role === "student") router.push("/dashboard");
      else if (user.role === "driver") router.push("/driver");
      else if (["transport_admin", "super_admin"].includes(user.role)) router.push("/admin");
    }
  }, [accessToken, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (role === "student") {
        const res = await loginStudentMutation.mutateAsync({ identifier, password });
        if (res.success) {
          setAuth(res.data.user, res.data.accessToken, res.data.refreshToken, rememberMe);
          toast.success("Logged in successfully");
        }
      } else if (role === "driver") {
        const res = await loginDriverMutation.mutateAsync({ driverId: identifier, pin: password });
        if (res.success) {
          setAuth(
            { id: res.data.driver.id, role: res.data.driver.role, email: null, phone: null, erpId: res.data.driver.driverId, isVerified: true },
            res.data.accessToken,
            res.data.refreshToken,
            rememberMe
          );
          toast.success("Driver login successful");
        }
      } else if (role === "admin") {
        const res = await loginAdminMutation.mutateAsync({ email: identifier, password });
        if (res.success) {
          setAuth(
            { id: res.data.user.id, role: res.data.user.role as any, email: res.data.user.email, phone: null, erpId: null, isVerified: true },
            res.data.accessToken,
            res.data.refreshToken,
            rememberMe
          );
          toast.success("Admin login successful");
        }
      }
    } catch (error: any) {
      showErrorToast(error.message || "Login failed");
    }
  };

  const isLoading = loginStudentMutation.isPending || loginDriverMutation.isPending || loginAdminMutation.isPending;

  return (
    <div suppressHydrationWarning className="bg-[#131315] text-[#e5e1e4] font-sans overflow-x-hidden min-h-screen selection:bg-indigo-500/30 selection:text-indigo-400">
      
      {/* Top Navigation */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-[#131315]/70 backdrop-blur-xl z-50">
        <div className="text-xl font-bold tracking-tighter text-[#c0c1ff]">RoutePulse</div>
        <nav className="hidden md:flex items-center gap-8 font-bold tracking-[-0.04em] text-sm">
          <a className="text-[#c7c4d7] hover:text-white transition-colors" href="#">Schedules</a>
          <a className="text-[#c7c4d7] hover:text-white transition-colors" href="#">Routes</a>
          <a className="text-[#c7c4d7] hover:text-white transition-colors" href="#">Live Map</a>
          <a className="text-[#c7c4d7] hover:text-white transition-colors" href="#">Support</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="p-2 text-[#c0c1ff] hover:bg-[#353437]/50 rounded-full transition-all duration-200">
            <Bell size={20} />
          </button>
          <Button 
            className="kinetic-gradient text-[#0d0096] font-bold rounded-xl active:scale-95 transition-transform"
          >
            Get Started
          </Button>
        </div>
      </header>

      <main className="min-h-screen flex flex-col md:flex-row pt-20">
        
        {/* Left Section: Content & Brand Authority */}
        <section className="flex-1 flex flex-col justify-center px-8 md:px-24 py-12 md:py-0">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">Live Transit Network Active</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-[-0.04em] leading-[0.9] text-indigo-200 mb-6 uppercase italic">
              THE KINETIC <br/>CONDUCTOR.
            </h1>
            <p className="text-zinc-500 text-lg md:text-xl leading-relaxed mb-10 max-w-md font-medium">
              Precision logistics for high-frequency university transport ecosystems. Orchestrate your fleet with surgical accuracy.
            </p>
            <div className="flex flex-wrap gap-4 mb-16">
              <Button className="px-10 h-14 kinetic-gradient text-indigo-950 rounded-xl font-bold text-lg shadow-[0_20px_40px_rgba(128,131,255,0.2)]">
                Launch Dashboard
              </Button>
              <Button variant="bordered" className="px-10 h-14 border border-zinc-800 text-white rounded-xl font-bold text-lg hover:bg-zinc-900 transition-all">
                View Network
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="pt-10 border-t border-zinc-800/50">
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-600 mb-6 underline decoration-indigo-500/50 underline-offset-4">Trusted by Elite Institutions</p>
              <div className="flex flex-wrap gap-8 opacity-20 grayscale hover:opacity-50 transition-all duration-500">
                <span className="text-xl font-bold italic tracking-tighter">DBUU</span>
                <span className="text-xl font-bold italic tracking-tighter">DBUU</span>
                <span className="text-xl font-bold italic tracking-tighter">DBUU</span>
                <span className="text-xl font-bold italic tracking-tighter">DBUU</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Section: Auth & Visualization */}
        <section className="flex-1 relative bg-[#0e0e10] flex items-center justify-center p-6 md:p-12 overflow-hidden">
          
          {/* Background Visualization */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #353437 1px, transparent 0)", backgroundSize: "40px 40px" }} />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 800">
              <path d="M100 100 L700 100 L700 700 L100 700 Z" fill="none" stroke="#6366f1" strokeDasharray="10 5" strokeWidth="0.5" />
              <motion.circle 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ duration: 4, repeat: Infinity }}
                cx="200" cy="200" fill="#6366f1" r="4" 
              />
              <motion.circle 
                animate={{ scale: [1, 1.5, 1] }} 
                transition={{ duration: 5, repeat: Infinity }}
                cx="600" cy="300" fill="#6366f1" r="4" 
              />
              <path d="M200 200 Q 400 100 600 300 T 400 600" fill="none" stroke="#6366f1" strokeOpacity="0.3" strokeWidth="1" />
            </svg>
          </div>

          {/* Auth Card */}
          <div className="relative w-full max-w-md z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="glass-panel border border-zinc-800/50 rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] p-8"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Command Center</h2>
                <p className="text-zinc-500 text-sm font-medium">Authenticate to orchestrate transit operations.</p>
              </div>

              {/* Identity Tabs */}
              <div className="flex p-1 bg-zinc-900/50 rounded-xl mb-8">
                {["student", "driver", "admin"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      role === r ? "bg-indigo-500 text-indigo-950 shadow-lg" : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 px-1">
                    {role === "student" ? "ERP ID / Email" : role === "driver" ? "Driver ID" : "Admin Email"}
                  </label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                      type={role === "admin" ? "email" : "text"}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      className="w-full bg-zinc-950 rounded-xl py-4 pl-12 pr-4 border-none ring-1 ring-zinc-800/80 focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none font-medium" 
                      placeholder={role === "student" ? "e.g. 25BCAFSD001" : role === "driver" ? "e.g. DRV-001" : "admin@devnexis.in"}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500">
                      {role === "driver" ? "PIN Code" : "Password"}
                    </label>
                    <Link href={"/auth/forgot-password" as any} className="text-[10px] uppercase tracking-widest font-black text-indigo-400 hover:underline hover:text-indigo-300 transition-colors">Lost access ?</Link>
                  </div>
                  <div className="relative group">
                    <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-zinc-950 rounded-xl py-4 pl-12 pr-4 border-none ring-1 ring-zinc-800/80 focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none font-medium" 
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div 
                  className="group flex items-center gap-2.5 px-1 pb-1.5 cursor-pointer select-none"
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  <div className={`
                    w-3 h-3 rounded-[3px] border flex items-center justify-center transition-all duration-200 flex-shrink-0
                    ${rememberMe 
                      ? "bg-indigo-500 border-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" 
                      : "bg-transparent border-zinc-800 group-hover:border-zinc-700"}
                  `}>
                    {rememberMe && (
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-indigo-950 stroke-[5px]" fill="none" stroke="currentColor">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-zinc-500 font-bold text-[9px] uppercase tracking-[0.12em] group-hover:text-zinc-400 transition-colors">
                    Remember me
                  </span>
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 kinetic-gradient text-indigo-950 rounded-xl font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/20"
                >
                  {isLoading ? "Authenticating..." : "Authorize Access"}
                </Button>
              </form>

              {role === "student" && (
                <div className="mt-8 text-center">
                  <p className="text-xs text-zinc-500 font-medium">
                    New to the network? <Link href="/auth/register" className="text-indigo-400 font-black hover:underline">Request Access</Link>
                  </p>
                </div>
              )}
            </motion.div>

            {/* Status Pill */}
            <div className="mt-6 flex justify-center">
              <div className="glass-panel px-4 py-2 rounded-full border border-zinc-800/50 flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">System Health: 99.9% Operational</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Decorative Blur */}
      <div className="fixed bottom-0 left-0 p-12 pointer-events-none opacity-20 hidden md:block">
        <div className="w-64 h-64 bg-indigo-500/20 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
}
