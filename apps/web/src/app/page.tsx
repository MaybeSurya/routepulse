"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Navigation,
  ShieldCheck,
  Zap,
  Map as MapIcon,
  Users,
  ArrowRight,
  Bell,
  Radio,
  BrainCircuit,
  Clock,
  CheckCircle,
  Star,
  ChevronRight,
  Bus,
  Cpu,
  Wifi,
  Lock,
  BarChart3,
  Smartphone,
  Mail,
  Github,
  Twitter,
  Layers,
  Route,
  Activity,
} from "lucide-react";
import { Button } from "@heroui/react";

// ─── Reusable fade-in wrapper ──────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Landing Page ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="bg-[#131315] text-[#e5e1e4] font-sans selection:bg-indigo-500/30 selection:text-indigo-400 overflow-x-hidden min-h-screen">

      {/* ── Top Navigation ─────────────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-[#131315]/70 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="text-xl font-bold tracking-tighter text-[#c0c1ff]">RoutePulse</div>
        <nav className="hidden md:flex items-center gap-8 font-bold tracking-[-0.04em] text-sm">
          <a className="text-[#c7c4d7] hover:text-white transition-colors" href="#features">Features</a>
          <a className="text-[#c7c4d7] hover:text-white transition-colors" href="#how-it-works">How It Works</a>
          <a className="text-[#c7c4d7] hover:text-white transition-colors" href="#testimonials">Stories</a>
          <Link className="text-[#c7c4d7] hover:text-white transition-colors" href="/contact">Contact</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">Sign In</Link>
          <Button
            as={Link}
            href="/auth/register"
            className="kinetic-gradient text-[#0d0096] font-bold rounded-xl active:scale-95 transition-transform"
          >
            Join Network
          </Button>
        </div>
      </header>

      <main className="relative">

        {/* ── HERO ───────────────────────────────────────────────────────────────── */}
        <section className="min-h-screen flex flex-col items-center justify-center pt-20 px-6 relative overflow-hidden">

          {/* Background grid + route animation */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #353437 1px, transparent 0)", backgroundSize: "40px 40px" }} />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800">
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ duration: 3, ease: "easeInOut" }}
                d="M100 600 Q 300 200 600 400 T 1100 200"
                fill="none" stroke="#6366f1" strokeWidth="1.5"
              />
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.2 }}
                transition={{ duration: 4, delay: 1, ease: "easeInOut" }}
                d="M0 400 Q 400 100 700 500 T 1200 300"
                fill="none" stroke="#818cf8" strokeWidth="1"
              />
              <motion.circle
                animate={{ x: [100, 300, 600, 1100], y: [600, 200, 400, 200] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                r="6" fill="#6366f1"
              />
              <motion.circle
                animate={{ x: [0, 400, 700, 1200], y: [400, 100, 500, 300] }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear", delay: 2 }}
                r="4" fill="#818cf8"
              />
            </svg>
          </div>

          {/* Glow orbs */}
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-violet-600/5 blur-[100px] pointer-events-none" />

          <div className="max-w-5xl w-full text-center z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-10"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-400">
                Precision Logistics Interface v2.0
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-white uppercase italic mb-10"
            >
              The Kinetic <br /> <span className="text-primary">Conductor.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-zinc-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Orchestrating high-frequency university transit ecosystems with surgical telemetry and neural routing intelligence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6"
            >
              <Button
                as={Link}
                href="/auth/login"
                className="h-16 px-10 kinetic-gradient text-indigo-950 font-black text-lg rounded-2xl shadow-[0_20px_60px_rgba(99,102,241,0.3)] hover:-translate-y-1 transition-all"
              >
                Launch System <ArrowRight className="ml-2" />
              </Button>
              <Button
                variant="bordered"
                as="a"
                href="#features"
                className="h-16 px-10 border-zinc-800 text-white font-black text-lg rounded-2xl hover:bg-zinc-900 transition-all"
              >
                Explore Features
              </Button>
            </motion.div>

            {/* Trusted-by strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-20 flex flex-wrap justify-center gap-x-10 gap-y-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600"
            >
              {["State University", "Tech Institute", "City College", "Metro Campus", "National Academy"].map((u) => (
                <span key={u} className="hover:text-zinc-400 transition-colors cursor-default">{u}</span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── STATS STRIP ────────────────────────────────────────────────────────── */}
        <section className="py-20 border-y border-white/5 bg-[#0e0e10]">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Network Uptime", value: "99.9%" },
              { label: "Daily Missions", value: "1,200+" },
              { label: "Active Vessels", value: "48" },
              { label: "Avg Precision", value: "0.2s" },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="text-center group">
                  <p className="text-4xl md:text-5xl font-black text-white group-hover:text-primary transition-colors">{s.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-2">{s.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── FEATURES GRID ──────────────────────────────────────────────────────── */}
        <section id="features" className="py-32 px-6 bg-[#131315]">
          <div className="max-w-7xl mx-auto">
            <FadeIn className="text-center mb-20">
              <span className="inline-block text-[10px] uppercase tracking-[0.25em] font-black text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-full mb-6">
                Core Capabilities
              </span>
              <h2 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
                Built for <span className="text-primary">Precision.</span>
              </h2>
              <p className="text-zinc-500 max-w-xl mx-auto mt-4 text-lg leading-relaxed">
                Every feature engineered for the demands of modern university transit — fast, reliable, and always on.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Radio size={28} />,
                  title: "Live Telemetry",
                  desc: "Real-time sub-second GPS tracking with neural path prediction for pinpoint accuracy across your entire fleet.",
                  tag: "Real-time",
                },
                {
                  icon: <ShieldCheck size={28} />,
                  title: "Secure Logistics",
                  desc: "Military-grade authentication and verified seat allocation for campus security — every student, every trip.",
                  tag: "Security",
                },
                {
                  icon: <Zap size={28} />,
                  title: "Kinetic UX",
                  desc: "High-performance mobile-first interfaces optimized for high-pressure transit environments without latency.",
                  tag: "Performance",
                },
                {
                  icon: <BrainCircuit size={28} />,
                  title: "Neural Routing",
                  desc: "AI-driven route optimization that adapts to campus events, traffic density, and historical ridership patterns.",
                  tag: "AI",
                },
                {
                  icon: <Bell size={28} />,
                  title: "Smart Alerts",
                  desc: "Push notifications for arrivals, delays, seat availability, and service disruptions — delivered instantly.",
                  tag: "Notifications",
                },
                {
                  icon: <BarChart3 size={28} />,
                  title: "Mission Control",
                  desc: "Comprehensive administrative dashboards with fleet analytics, driver management, and real-time oversight.",
                  tag: "Analytics",
                },
                {
                  icon: <Lock size={28} />,
                  title: "Role-Based Access",
                  desc: "Granular permission architecture separating student, driver, and admin workflows with zero overlap.",
                  tag: "Access Control",
                },
                {
                  icon: <Smartphone size={28} />,
                  title: "Mobile-Native",
                  desc: "Progressive web app with offline-capable features — reliable even in campus dead zones and poor connectivity.",
                  tag: "Offline Ready",
                },
                {
                  icon: <Cpu size={28} />,
                  title: "Edge Processing",
                  desc: "Location data processed at the edge for ultra-low latency updates — under 200ms from GPS to your screen.",
                  tag: "Low Latency",
                },
              ].map((f, i) => (
                <FadeIn key={i} delay={(i % 3) * 0.1}>
                  <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-5 group hover:border-indigo-500/20 hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                        {f.icon}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500/60 bg-indigo-500/5 px-2.5 py-1 rounded-full">
                        {f.tag}
                      </span>
                    </div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">{f.title}</h3>
                    <p className="text-zinc-500 font-medium leading-relaxed text-sm">{f.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-32 px-6 bg-[#0e0e10]">
          <div className="max-w-7xl mx-auto">
            <FadeIn className="text-center mb-20">
              <span className="inline-block text-[10px] uppercase tracking-[0.25em] font-black text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-full mb-6">
                Protocol
              </span>
              <h2 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
                Three Roles. <span className="text-primary">One System.</span>
              </h2>
              <p className="text-zinc-500 max-w-xl mx-auto mt-4 text-lg leading-relaxed">
                RoutePulse unifies students, drivers, and administrators into a seamlessly connected transit ecosystem.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  role: "Students",
                  icon: <Users size={24} />,
                  color: "indigo",
                  steps: [
                    "Register with university credentials",
                    "View live bus locations on the map",
                    "Book a seat for upcoming routes",
                    "Receive real-time arrival alerts",
                    "Track your ride end-to-end",
                  ],
                },
                {
                  role: "Drivers",
                  icon: <Bus size={24} />,
                  color: "violet",
                  steps: [
                    "Log in to Mission Control",
                    "Start your assigned shift & route",
                    "Broadcast live GPS telemetry",
                    "Manage passenger seat manifests",
                    "Report incidents instantly",
                  ],
                },
                {
                  role: "Admins",
                  icon: <Activity size={24} />,
                  color: "purple",
                  steps: [
                    "Oversee the full fleet from dashboard",
                    "Assign drivers to buses and routes",
                    "Monitor live locations globally",
                    "Analyze ridership & utilization data",
                    "Manage users and system settings",
                  ],
                },
              ].map((role, i) => (
                <FadeIn key={i} delay={i * 0.15}>
                  <div className="glass-panel p-8 rounded-3xl border border-white/5 h-full">
                    <div className={`w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6`}>
                      {role.icon}
                    </div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">{role.role}</h3>
                    <ol className="space-y-3">
                      {role.steps.map((step, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-zinc-400 font-medium">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-black mt-0.5">
                            {j + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURE SPOTLIGHT ──────────────────────────────────────────────────── */}
        <section className="py-32 px-6 bg-[#131315]">
          <div className="max-w-7xl mx-auto space-y-32">

            {/* Spotlight 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <FadeIn>
                <span className="inline-block text-[10px] uppercase tracking-[0.25em] font-black text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-full mb-6">
                  Live Map
                </span>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-6">
                  See Every Bus, <br /><span className="text-primary">Right Now.</span>
                </h2>
                <p className="text-zinc-500 font-medium leading-relaxed mb-8">
                  Our interactive map renders the real-time position of every campus bus with sub-second refresh. Historical route trails, predicted ETAs, and seat availability — all on one screen, no refresh required.
                </p>
                <ul className="space-y-3">
                  {["Sub-200ms GPS refresh", "Predictive ETA with ML", "Live seat availability overlay", "Route trail visualization"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                      <CheckCircle size={16} className="text-indigo-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="glass-panel rounded-3xl border border-white/5 p-1 aspect-video flex items-center justify-center bg-gradient-to-br from-indigo-500/5 to-violet-500/5 relative overflow-hidden group">
                  <div className="absolute inset-0 opacity-20">
                    <div style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #353437 1px, transparent 0)", backgroundSize: "24px 24px" }} className="w-full h-full" />
                  </div>
                  <div className="relative z-10 text-center p-8">
                    <MapIcon size={48} className="text-indigo-400 mx-auto mb-4 opacity-60" />
                    <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">Interactive Map Preview</p>
                    <div className="mt-4 flex gap-3 justify-center">
                      {[1, 2, 3].map((b) => (
                        <motion.div
                          key={b}
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: b * 0.4 }}
                          className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center"
                        >
                          <Bus size={12} className="text-indigo-400" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Spotlight 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <FadeIn delay={0.2} className="order-2 md:order-1">
                <div className="glass-panel rounded-3xl border border-white/5 p-8 bg-gradient-to-br from-violet-500/5 to-indigo-500/5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-600">
                      <span>Fleet Health</span>
                      <span className="text-emerald-400">All Systems Nominal</span>
                    </div>
                    {[
                      { label: "Bus Alpha-01", status: "On Route", pct: 87 },
                      { label: "Bus Beta-04", status: "Boarding", pct: 34 },
                      { label: "Bus Gamma-07", status: "On Route", pct: 62 },
                      { label: "Bus Delta-12", status: "Depot", pct: 0 },
                    ].map((bus) => (
                      <div key={bus.label} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium text-zinc-400">
                          <span>{bus.label}</span>
                          <span className={bus.status === "Depot" ? "text-zinc-600" : "text-emerald-400"}>{bus.status}</span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${bus.pct}%` }}
                            transition={{ duration: 1.2, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
              <FadeIn className="order-1 md:order-2">
                <span className="inline-block text-[10px] uppercase tracking-[0.25em] font-black text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-full mb-6">
                  Admin Dashboard
                </span>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-6">
                  Mission Control <br /><span className="text-primary">Centralized.</span>
                </h2>
                <p className="text-zinc-500 font-medium leading-relaxed mb-8">
                  Administrators command the full transit network from a single dashboard. Assign drivers, monitor fleet health, resolve incidents, and analyze ridership — all in real time.
                </p>
                <ul className="space-y-3">
                  {["Full fleet oversight panel", "Driver assignment engine", "Ridership analytics & trends", "Incident management system"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                      <CheckCircle size={16} className="text-indigo-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ───────────────────────────────────────────────────────── */}
        <section id="testimonials" className="py-32 px-6 bg-[#0e0e10]">
          <div className="max-w-7xl mx-auto">
            <FadeIn className="text-center mb-20">
              <span className="inline-block text-[10px] uppercase tracking-[0.25em] font-black text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-full mb-6">
                Field Reports
              </span>
              <h2 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
                From the <span className="text-primary">Network.</span>
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "RoutePulse completely transformed how our students commute. Late buses are now a thing of the past — everyone knows exactly where their bus is.",
                  name: "Dr. Ananya Sharma",
                  role: "Transport Director, State University",
                  stars: 5,
                },
                {
                  quote: "The Mission Control interface is incredibly intuitive. I can see the whole fleet in one glance and reassign drivers in seconds. It's like having a co-pilot.",
                  name: "Rohan Mehta",
                  role: "Fleet Administrator, Tech Institute",
                  stars: 5,
                },
                {
                  quote: "As a driver, the shift activation and route trail features are a game-changer. I always know my path and students always know I'm coming.",
                  name: "Priya Kapoor",
                  role: "Campus Bus Driver, City College",
                  stars: 5,
                },
                {
                  quote: "The seat booking feature alone has reduced boarding chaos by 80%. Students arrive prepared and buses depart on time.",
                  name: "Prof. Samuel Okonkwo",
                  role: "Campus Operations, National Academy",
                  stars: 5,
                },
                {
                  quote: "Security was our top concern. RoutePulse's role-based access and verified boarding system gave us complete peace of mind.",
                  name: "Nisha Patel",
                  role: "Security Lead, Metro Campus",
                  stars: 5,
                },
                {
                  quote: "The real-time alerts mean I've never missed my bus since switching to RoutePulse. The map is incredibly accurate — I can see the bus turning the corner.",
                  name: "Arjun Krishnan",
                  role: "Engineering Student, Tech Institute",
                  stars: 5,
                },
              ].map((t, i) => (
                <FadeIn key={i} delay={(i % 3) * 0.1}>
                  <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6 h-full group hover:border-indigo-500/20 transition-all">
                    <div className="flex gap-1">
                      {Array.from({ length: t.stars }).map((_, s) => (
                        <Star key={s} size={14} className="text-indigo-400 fill-indigo-400" />
                      ))}
                    </div>
                    <p className="text-zinc-400 font-medium leading-relaxed text-sm italic">"{t.quote}"</p>
                    <div>
                      <p className="text-white font-black text-sm">{t.name}</p>
                      <p className="text-zinc-600 text-[11px] font-medium">{t.role}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECH STACK BANNER ──────────────────────────────────────────────────── */}
        <section className="py-20 px-6 bg-[#131315] border-y border-white/5">
          <div className="max-w-5xl mx-auto">
            <FadeIn className="text-center mb-12">
              <p className="text-[10px] uppercase tracking-[0.25em] font-black text-zinc-600">Engineered With</p>
            </FadeIn>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                "Next.js 15", "React 19", "TypeScript", "tRPC", "Prisma ORM",
                "PostgreSQL", "WebSockets", "Leaflet Maps", "Framer Motion", "HeroUI",
              ].map((tech) => (
                <FadeIn key={tech}>
                  <span className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 font-black text-xs uppercase tracking-widest hover:text-indigo-400 hover:border-indigo-500/20 transition-all cursor-default">
                    {tech}
                  </span>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────────────────── */}
        <section className="py-40 px-6 bg-[#0e0e10] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-[120px]" />
          </div>
          <FadeIn className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-400">Ready to Deploy</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white mb-8">
              Join the <br /><span className="text-primary">Network.</span>
            </h2>
            <p className="text-zinc-500 text-xl font-medium max-w-xl mx-auto mb-12 leading-relaxed">
              Transform your campus transportation from chaos into a precision-engineered ecosystem. Setup takes minutes.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                as={Link}
                href="/auth/register"
                className="h-16 px-12 kinetic-gradient text-indigo-950 font-black text-lg rounded-2xl shadow-[0_20px_60px_rgba(99,102,241,0.3)] hover:-translate-y-1 transition-all"
              >
                Get Started — It's Free <ArrowRight className="ml-2" />
              </Button>
              <Button
                as={Link}
                href="/contact"
                variant="bordered"
                className="h-16 px-12 border-zinc-800 text-white font-black text-lg rounded-2xl hover:bg-zinc-900 transition-all"
              >
                Contact Us
              </Button>
            </div>
          </FadeIn>
        </section>

      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0a0a0b] border-t border-white/5 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

            {/* Brand */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">R</div>
                <span className="text-xl font-black tracking-tighter text-white">RoutePulse</span>
              </div>
              <p className="text-zinc-600 text-sm font-medium leading-relaxed">
                Precision transit intelligence for modern university campuses.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600 hover:text-indigo-400 hover:border-indigo-500/20 transition-all">
                  <Twitter size={14} />
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600 hover:text-indigo-400 hover:border-indigo-500/20 transition-all">
                  <Github size={14} />
                </a>
                <a href="mailto:hey@maybesurya.dev" className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600 hover:text-indigo-400 hover:border-indigo-500/20 transition-all">
                  <Mail size={14} />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-5">Product</h4>
              <ul className="space-y-3">
                {[
                  { label: "Features", href: "#features" },
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Student Portal", href: "/auth/login" },
                  { label: "Driver Console", href: "/auth/login" },
                  { label: "Admin Dashboard", href: "/auth/login" },
                ].map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-zinc-600 font-medium hover:text-zinc-300 transition-colors">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-5">Company</h4>
              <ul className="space-y-3">
                {[
                  { label: "Contact Us", href: "/contact" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms & Conditions", href: "/terms" },
                  { label: "Support", href: "/contact" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-zinc-600 font-medium hover:text-zinc-300 transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-5">Stay Updated</h4>
              <p className="text-sm text-zinc-600 font-medium mb-4 leading-relaxed">
                Get updates on new features and network expansions.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="you@university.edu"
                  className="flex-1 min-w-0 bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/40 transition-colors font-medium"
                />
                <button className="px-4 py-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/30 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-700">
              © {new Date().getFullYear()} RoutePulse by{" "}
              <a href="https://devnexis.in" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-400 transition-colors">DevNexis</a>. All Rights Reserved.
            </p>
            <div className="flex gap-6 text-[11px] font-black uppercase tracking-widest text-zinc-700">
              <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-zinc-400 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
