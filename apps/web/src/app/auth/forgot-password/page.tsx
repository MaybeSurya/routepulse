"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Bell, ArrowLeft } from "lucide-react";
import { Button } from "@heroui/react";
import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const requestResetMutation = useMutation(trpc.auth.requestPasswordReset.mutationOptions());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await requestResetMutation.mutateAsync({ email });
      if (res.success) {
        toast.success(res.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const isLoading = requestResetMutation.isPending;

  return (
    <div suppressHydrationWarning className="bg-[#131315] text-[#e5e1e4] font-sans overflow-x-hidden min-h-screen selection:bg-indigo-500/30 selection:text-indigo-400">
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-[#131315]/70 backdrop-blur-xl z-50">
        <div className="text-xl font-bold tracking-tighter text-[#c0c1ff]">RoutePulse</div>
        <Link 
          href="/auth/login"
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-zinc-500 hover:text-white transition-all"
        >
          <ArrowLeft size={14} />
          Back to Login
        </Link>
      </header>

      <main className="min-h-screen flex items-center justify-center p-6 pt-20">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #353437 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative w-full max-w-md z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel border border-zinc-800/50 rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] p-8"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Recover Access</h2>
              <p className="text-zinc-500 text-sm font-medium">Enter your email to receive a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 px-1">
                  Registered Email
                </label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-zinc-950 rounded-xl py-4 pl-12 pr-4 border-none ring-1 ring-zinc-800/80 focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none font-medium" 
                    placeholder="e.g. user@example.com"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-14 kinetic-gradient text-indigo-950 rounded-xl font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/20"
              >
                {isLoading ? "Processing..." : "Submit Request"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
              <p className="text-[10px] uppercase tracking-widest font-black text-zinc-600">
                Secure Token Authentication • RoutePulse Transit Net
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
