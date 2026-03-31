"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone as PhoneIcon, 
  Hash, 
  School, 
  Calendar, 
  Key,
  ShieldCheck,
  Bell,
  Navigation
} from "lucide-react";

import { useAuthStore } from "@/store/auth";
import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { Button, Input, Select, SelectItem } from "@heroui/react";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    erpId: "",
    password: "",
    universityId: "UNI-123",
    enrollmentYear: new Date().getFullYear(),
    departmentName: "",
  });

  const registerMutation = useMutation(trpc.auth.register.mutationOptions());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error("Email is required for registration");
      return;
    }

    try {
      const res = await registerMutation.mutateAsync({
        ...formData,
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        erpId: formData.erpId.trim() || undefined,
      });

      if (res.success) {
        setAuth(res.data.user as any, res.data.accessToken, res.data.refreshToken);
        toast.success("Registration successful");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "enrollmentYear" ? parseInt(value) || new Date().getFullYear() : value,
    }));
  };

  return (
    <div suppressHydrationWarning className="bg-[#131315] text-[#e5e1e4] font-sans overflow-x-hidden min-h-screen selection:bg-indigo-500/30 selection:text-indigo-400">
      
      {/* Top Navigation */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-[#131315]/70 backdrop-blur-xl z-50">
        <Link href="/auth/login" className="text-xl font-bold tracking-tighter text-[#c0c1ff]">RoutePulse</Link>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">Sign In</Link>
          <Button 
            className="kinetic-gradient text-[#0d0096] font-bold rounded-xl active:scale-95 transition-transform"
          >
            Support
          </Button>
        </div>
      </header>

      <main className="min-h-screen flex flex-col md:flex-row pt-20" suppressHydrationWarning>
        
        {/* Left Section: Context */}
        <section className="hidden md:flex flex-1 flex-col justify-center px-8 md:px-24" suppressHydrationWarning>
          <div className="max-w-xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">Joint the network</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-[-0.04em] leading-[0.9] text-indigo-200 mb-6 uppercase italic">
              SECURE YOUR <br/>PASS TODAY.
            </h1>
            <p className="text-zinc-500 text-lg leading-relaxed mb-10 max-w-md font-medium">
              Join the elite transport ecosystem of your university. Intelligent routing, guaranteed seating, and live tracking at your fingertips.
            </p>
            <div className="grid grid-cols-2 gap-6 opacity-40">
              <div className="space-y-2">
                <ShieldCheck size={32} className="text-indigo-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-white">Encrypted Auth</p>
              </div>
              <div className="space-y-2">
                <Navigation size={32} className="text-indigo-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-white">Live Telemetry</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Section: Registration Form */}
        <section className="flex-1 relative bg-[#0e0e10] flex items-center justify-center p-6 md:p-12 overflow-hidden" suppressHydrationWarning>
          
          {/* Background Viz */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #353437 1px, transparent 0)", backgroundSize: "40px 40px" }} />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-lg z-10 glass-panel border border-zinc-800/50 rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] p-8 my-8"
            suppressHydrationWarning
          >
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Registration</h2>
              <p className="text-zinc-500 text-sm font-medium">Create your credentials for the RoutePulse network.</p>
            </div>

            <form suppressHydrationWarning onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 px-1">Email Address</label>
                  <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input name="email" value={formData.email} onChange={handleChange} required className="w-full bg-zinc-950 rounded-xl py-3.5 pl-11 pr-4 border-none ring-1 ring-zinc-800/80 focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none font-medium" placeholder="stu@devnexis.in" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 px-1">Phone (Optional)</label>
                  <div className="relative group">
                    <PhoneIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-zinc-950 rounded-xl py-3.5 pl-11 pr-4 border-none ring-1 ring-zinc-800/80 focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none font-medium" placeholder="+91..." />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 px-1">ERP ID / Student ID</label>
                <div className="relative group">
                  <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input name="erpId" value={formData.erpId} onChange={handleChange} required className="w-full bg-zinc-950 rounded-xl py-3.5 pl-11 pr-4 border-none ring-1 ring-zinc-800/80 focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none font-medium" placeholder="e.g. 25BCAFSD001" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 px-1">Department</label>
                <div className="relative group">
                  <School size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input name="departmentName" value={formData.departmentName} onChange={handleChange} required className="w-full bg-zinc-950 rounded-xl py-3.5 pl-11 pr-4 border-none ring-1 ring-zinc-800/80 focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none font-medium" placeholder="e.g. Computer Science" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 px-1">Enrollment Year</label>
                  <div className="relative group">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input type="number" name="enrollmentYear" value={formData.enrollmentYear} onChange={handleChange} required className="w-full bg-zinc-950 rounded-xl py-3.5 pl-11 pr-4 border-none ring-1 ring-zinc-800/80 focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 px-1">Password</label>
                  <div className="relative group">
                    <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={8} className="w-full bg-zinc-950 rounded-xl py-3.5 pl-11 pr-4 border-none ring-1 ring-zinc-800/80 focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none font-medium" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full h-14 kinetic-gradient text-indigo-950 rounded-xl font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/20"
                >
                  {registerMutation.isPending ? "Generating Identity..." : "Finalize Registration"}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-zinc-500 font-medium">
                Already part of the network? <Link href="/auth/login" className="text-indigo-400 font-black hover:underline">Authorize Here</Link>
              </p>
            </div>
          </motion.div>
        </section>
      </main>

    </div>
  );
}
