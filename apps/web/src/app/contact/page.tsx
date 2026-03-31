"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Github,
  Twitter,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Clock,
  Headphones,
  Zap,
  Send,
} from "lucide-react";
import { Button } from "@heroui/react";

const faqs = [
  {
    q: "How do I get RoutePulse for my university?",
    a: "Contact us via the form below or email us at hey@maybesurya.dev. We'll arrange a demo, walk you through the setup process, and help onboard your fleet and users. Deployment typically takes less than one week.",
  },
  {
    q: "Is RoutePulse free to use for students?",
    a: "Yes. The student-facing app is completely free. Universities subscribe to the platform to provide it to their students, staff, and transport team.",
  },
  {
    q: "What devices and operating systems does RoutePulse support?",
    a: "RoutePulse is a Progressive Web App (PWA) and works on any modern browser — Chrome, Safari, Firefox, Edge — on both desktop and mobile. No app store download is required.",
  },
  {
    q: "How accurate is the real-time bus tracking?",
    a: "GPS telemetry is refreshed every 200ms, giving sub-second accuracy in most conditions. Positions are processed at the edge to minimize latency between the bus GPS and your screen.",
  },
  {
    q: "Does RoutePulse work in areas with poor connectivity?",
    a: "Our PWA includes offline caching for routes and schedules. Live tracking requires internet but gracefully degrades — students still see the last-known position and ETA.",
  },
  {
    q: "How is student data protected?",
    a: "All data is encrypted at rest and in transit using AES-256 and TLS 1.3. We follow OWASP security standards, enforce role-based access control, and never sell user data to third parties.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-6 text-left hover:bg-zinc-900/50 transition-colors gap-4"
      >
        <span className="text-sm font-black text-white">{q}</span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-zinc-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0 }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-6 text-sm text-zinc-500 font-medium leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
}

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "student", subject: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Simulate sending
    setSent(true);
  }

  return (
    <div className="bg-[#131315] text-[#e5e1e4] font-sans min-h-screen">

      {/* Nav */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-[#131315]/70 backdrop-blur-xl z-50 border-b border-white/5">
        <Link href="/" className="text-xl font-bold tracking-tighter text-[#c0c1ff]">RoutePulse</Link>
        <nav className="hidden md:flex items-center gap-8 font-bold tracking-[-0.04em] text-sm">
          <Link className="text-[#c7c4d7] hover:text-white transition-colors" href="/#features">Features</Link>
          <Link className="text-[#c7c4d7] hover:text-white transition-colors" href="/#how-it-works">How It Works</Link>
          <Link className="text-indigo-400" href="/contact">Contact</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">Sign In</Link>
          <Button as={Link} href="/auth/register" className="kinetic-gradient text-[#0d0096] font-bold rounded-xl">
            Join Network
          </Button>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Page heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
              <MessageSquare size={12} className="text-indigo-400" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-400">Get In Touch</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white mb-6">
              Let's <span className="text-primary">Connect.</span>
            </h1>
            <p className="text-zinc-500 text-xl font-medium max-w-xl mx-auto leading-relaxed">
              Whether you're looking to deploy RoutePulse at your campus or need support, we're here to help — fast.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">

            {/* Contact info cards */}
            <div className="space-y-4">
              {[
                {
                  icon: <Mail size={20} />,
                  title: "Email Us",
                  desc: "For general inquiries and partnership discussions",
                  value: "hey@maybesurya.dev",
                  href: "mailto:hey@maybesurya.dev",
                },
                {
                  icon: <Headphones size={20} />,
                  title: "Technical Support",
                  desc: "For bugs, platform issues, and integrations",
                  value: "routepulse@maybesurya.dev",
                  href: "mailto:routepulse@maybesurya.dev",
                },
                {
                  icon: <Clock size={20} />,
                  title: "Response Time",
                  desc: "We aim to respond within",
                  value: "< 24 hours",
                  href: null,
                },
                {
                  icon: <Zap size={20} />,
                  title: "Emergency Support",
                  desc: "Critical fleet issues get priority response",
                  value: "Under 2 hours",
                  href: null,
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-panel p-6 rounded-2xl border border-white/5 group hover:border-indigo-500/20 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                      {card.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{card.title}</h3>
                      <p className="text-xs text-zinc-600 font-medium mt-0.5">{card.desc}</p>
                      {card.href ? (
                        <a href={card.href} className="text-indigo-400 text-sm font-bold mt-1.5 block hover:text-white transition-colors">
                          {card.value}
                        </a>
                      ) : (
                        <p className="text-white text-sm font-bold mt-1.5">{card.value}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Social links */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel p-6 rounded-2xl border border-white/5"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">Follow & Connect</p>
                <div className="flex gap-3">
                  <a href="#" className="flex-1 py-3 bg-zinc-900 rounded-xl border border-white/5 flex items-center justify-center gap-2 text-zinc-600 hover:text-indigo-400 hover:border-indigo-500/20 transition-all text-xs font-black uppercase tracking-wider">
                    <Twitter size={14} /> Twitter
                  </a>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-zinc-900 rounded-xl border border-white/5 flex items-center justify-center gap-2 text-zinc-600 hover:text-indigo-400 hover:border-indigo-500/20 transition-all text-xs font-black uppercase tracking-wider">
                    <Github size={14} /> GitHub
                  </a>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-2" suppressHydrationWarning>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-8 md:p-10 rounded-3xl border border-white/5 h-full"
              >
                {sent ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
                      <CheckCircle size={32} />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-3">Message Sent!</h2>
                    <p className="text-zinc-500 font-medium max-w-sm">
                      We've received your message and will get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSent(false)}
                      className="mt-8 text-sm font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest"
                    >
                      Send Another →
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-8">Send a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Full Name</label>
                          <input
                            required
                            suppressHydrationWarning
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="Your full name"
                            className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/40 transition-colors font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Email Address</label>
                          <input
                            required
                            type="email"
                            suppressHydrationWarning
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            placeholder="you@university.edu"
                            className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/40 transition-colors font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">I am a...</label>
                          <select
                            value={form.role}
                            suppressHydrationWarning
                            onChange={e => setForm({ ...form, role: e.target.value })}
                            className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/40 transition-colors font-medium appearance-none"
                          >
                            <option value="student">Student</option>
                            <option value="admin">University Administrator</option>
                            <option value="driver">Bus Driver</option>
                            <option value="partner">Potential Partner</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Subject</label>
                          <input
                            required
                            value={form.subject}
                            onChange={e => setForm({ ...form, subject: e.target.value })}
                            placeholder="What's this about?"
                            className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/40 transition-colors font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Message</label>
                        <textarea
                          required
                          rows={6}
                          value={form.message}
                          onChange={e => setForm({ ...form, message: e.target.value })}
                          placeholder="Tell us what's on your mind..."
                          className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/40 transition-colors font-medium resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-14 kinetic-gradient text-indigo-950 font-black text-base rounded-2xl shadow-[0_10px_40px_rgba(99,102,241,0.2)] hover:-translate-y-0.5 transition-all"
                      >
                        Send Message <Send size={16} className="ml-2" />
                      </Button>
                    </form>
                  </>
                )}
              </motion.div>
            </div>
          </div>

          {/* FAQ */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-12"
            >
              <span className="inline-block text-[10px] uppercase tracking-[0.25em] font-black text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-full mb-6">
                Common Questions
              </span>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
                Frequently <span className="text-primary">Asked.</span>
              </h2>
            </motion.div>
            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                  <FAQItem q={faq.q} a={faq.a} />
                </motion.div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
