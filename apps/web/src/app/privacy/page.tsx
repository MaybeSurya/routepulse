"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Clock } from "lucide-react";

const LAST_UPDATED = "March 31, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4">{title}</h2>
      <div className="text-zinc-400 font-medium leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="bg-[#131315] text-[#e5e1e4] font-sans min-h-screen">

      {/* Nav */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-[#131315]/70 backdrop-blur-xl z-50 border-b border-white/5">
        <Link href="/" className="text-xl font-bold tracking-tighter text-[#c0c1ff]">RoutePulse</Link>
        <div className="hidden md:flex items-center gap-8 font-bold tracking-[-0.04em] text-sm">
          <Link href="/contact" className="text-[#c7c4d7] hover:text-white transition-colors">Contact</Link>
          <Link href="/terms" className="text-[#c7c4d7] hover:text-white transition-colors">Terms</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">Sign In</Link>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors">
              <ArrowLeft size={12} /> Back to Home
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
              <Shield size={12} className="text-indigo-400" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-400">Legal Document</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black uppercase italic tracking-tighter text-white mb-6">
              Privacy <span className="text-primary">Policy.</span>
            </h1>
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
              <Clock size={12} />
              <span>Last updated: {LAST_UPDATED}</span>
            </div>
            <div className="mt-6 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                <span className="text-indigo-400 font-black">TL;DR:</span> We collect only what's necessary to run the transit platform, we never sell your data, and you stay in control of your information.
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>

            <Section title="1. Who We Are">
              <p>
                RoutePulse ("we," "us," "our") is a university transit intelligence platform developed by <strong className="text-white">DevNexis</strong>. Our platform enables universities to manage campus bus fleets, and enables students and drivers to interact with that fleet in real time.
              </p>
              <p>
                This Privacy Policy applies to all users of RoutePulse — including students, drivers, and administrators — whether accessing via our web application or any associated services.
              </p>
            </Section>

            <Section title="2. Information We Collect">
              <p>We collect the following categories of personal information:</p>
              <h3 className="text-white font-black text-sm uppercase italic tracking-tight mt-4 mb-2">2.1 Account Information</h3>
              <ul className="list-disc list-inside space-y-1.5 text-zinc-500">
                <li>Full name and email address</li>
                <li>University enrollment or employee ID (where applicable)</li>
                <li>User role (student, driver, or administrator)</li>
                <li>Hashed password (we never store plain-text passwords)</li>
                <li>Profile photo (optional, uploaded by the user)</li>
              </ul>
              <h3 className="text-white font-black text-sm uppercase italic tracking-tight mt-4 mb-2">2.2 Location Data</h3>
              <ul className="list-disc list-inside space-y-1.5 text-zinc-500">
                <li>Real-time GPS coordinates of bus drivers during active shifts</li>
                <li>Approximate location of students for ETA calculations (requested, not continuous)</li>
                <li>Route history for completed bus journeys</li>
              </ul>
              <h3 className="text-white font-black text-sm uppercase italic tracking-tight mt-4 mb-2">2.3 Usage & Device Data</h3>
              <ul className="list-disc list-inside space-y-1.5 text-zinc-500">
                <li>Browser type, operating system, and device identifiers</li>
                <li>IP address and approximate geographic region</li>
                <li>Pages visited, features used, and session duration</li>
                <li>Error logs and crash reports for debugging</li>
              </ul>
              <h3 className="text-white font-black text-sm uppercase italic tracking-tight mt-4 mb-2">2.4 Transit Data</h3>
              <ul className="list-disc list-inside space-y-1.5 text-zinc-500">
                <li>Seat booking records linked to your account</li>
                <li>Bus boarding and alighting events</li>
                <li>Route preferences and frequency patterns</li>
              </ul>
            </Section>

            <Section title="3. How We Use Your Information">
              <p>We use your information strictly to provide and improve the RoutePulse platform:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-zinc-500">
                <li>Authenticating your identity and securing your account</li>
                <li>Displaying live bus locations to eligible platform users</li>
                <li>Processing and confirming seat reservations</li>
                <li>Sending real-time push notifications for bus arrivals and alerts</li>
                <li>Generating anonymized ridership analytics for university administrators</li>
                <li>Diagnosing platform issues and improving performance</li>
                <li>Complying with legal obligations</li>
              </ul>
              <p className="mt-4">
                We do <strong className="text-white">not</strong> use your data for advertising, behavioral profiling, or any purpose unrelated to campus transit operations.
              </p>
            </Section>

            <Section title="4. Data Sharing & Disclosure">
              <p>We do not sell, rent, or trade your personal data. We may share limited data in these circumstances:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-zinc-500">
                <li><strong className="text-zinc-300">University Administrators:</strong> Your booking history and transit usage may be visible to administrators of your institution for operational management.</li>
                <li><strong className="text-zinc-300">Service Providers:</strong> We use trusted third-party infrastructure providers (e.g., cloud hosting, database services) under strict data processing agreements.</li>
                <li><strong className="text-zinc-300">Legal Requirements:</strong> We may disclose data if required by law, court order, or to protect the rights and safety of users.</li>
              </ul>
            </Section>

            <Section title="5. Data Retention">
              <p>
                We retain your personal data only for as long as necessary to provide the service and meet legal obligations:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-zinc-500">
                <li>Active account data is retained for the lifetime of your account</li>
                <li>Driver GPS logs are retained for 30 days then anonymized</li>
                <li>Deleted accounts are purged within 30 days of deletion request</li>
                <li>Anonymized and aggregated analytics may be retained indefinitely</li>
              </ul>
            </Section>

            <Section title="6. Security">
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-zinc-500">
                <li>All data transmitted using TLS 1.3 encryption</li>
                <li>Passwords hashed with bcrypt (minimum 12 rounds)</li>
                <li>AES-256 encryption for sensitive data at rest</li>
                <li>Role-based access controls limiting data visibility per user type</li>
                <li>Regular security audits following OWASP guidelines</li>
                <li>Input sanitization to prevent injection attacks</li>
              </ul>
              <p className="mt-3">
                While we take security seriously, no system is 100% impenetrable. Please report any vulnerability to <a href="mailto:security@maybesurya.dev" className="text-indigo-400 hover:text-white transition-colors">security@maybesurya.dev</a>.
              </p>
            </Section>

            <Section title="7. Your Rights">
              <p>Depending on your jurisdiction, you may have the following rights regarding your data:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-zinc-500">
                <li><strong className="text-zinc-300">Access:</strong> Request a copy of personal data we hold about you</li>
                <li><strong className="text-zinc-300">Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong className="text-zinc-300">Erasure:</strong> Request deletion of your account and associated data</li>
                <li><strong className="text-zinc-300">Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong className="text-zinc-300">Objection:</strong> Object to certain types of data processing</li>
                <li><strong className="text-zinc-300">Restriction:</strong> Request limited processing under certain circumstances</li>
              </ul>
              <p className="mt-3">
                To exercise any right, contact us at <a href="mailto:privacy@maybesurya.dev" className="text-indigo-400 hover:text-white transition-colors">privacy@maybesurya.dev</a>. We will respond within 30 days.
              </p>
            </Section>

            <Section title="8. Cookies">
              <p>
                RoutePulse uses minimal, strictly necessary cookies to maintain your session state and authentication. We do not use third-party advertising cookies or tracking pixels.
              </p>
              <p>
                You can control cookie preferences in your browser settings, though disabling essential cookies may impair platform functionality.
              </p>
            </Section>

            <Section title="9. Children's Privacy">
              <p>
                RoutePulse is intended for university-level users (age 18+). We do not knowingly collect personal data from individuals under 18 years of age. If we discover that a minor has submitted data, we will delete it promptly.
              </p>
            </Section>

            <Section title="10. Changes to This Policy">
              <p>
                We may update this Privacy Policy to reflect changes in our practices or legal requirements. We'll notify registered users of material changes via email or a prominent notice on the platform. The "Last updated" date at the top of this page reflects the most recent revision.
              </p>
            </Section>

            <Section title="11. Contact">
              <p>
                For privacy-related questions, please contact us:
              </p>
              <div className="mt-4 p-5 rounded-2xl bg-zinc-900 border border-white/5 space-y-2">
                <p className="text-sm"><span className="text-zinc-600 font-medium">Email:</span> <a href="mailto:privacy@maybesurya.dev" className="text-indigo-400 hover:text-white transition-colors font-medium">privacy@maybesurya.dev</a></p>
                <p className="text-sm"><span className="text-zinc-600 font-medium">Company:</span> <span className="text-zinc-400 font-medium">DevNexis</span></p>
                <p className="text-sm"><span className="text-zinc-600 font-medium">Platform:</span> <Link href="/" className="text-indigo-400 hover:text-white transition-colors font-medium">maybesurya.dev</Link></p>
              </div>
            </Section>

          </motion.div>

          {/* Bottom nav */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4"
          >
            <Link href="/terms" className="text-sm font-black text-zinc-600 hover:text-indigo-400 transition-colors uppercase tracking-widest flex items-center gap-2">
              Terms & Conditions →
            </Link>
            <Link href="/contact" className="text-sm font-black text-zinc-600 hover:text-indigo-400 transition-colors uppercase tracking-widest flex items-center gap-2">
              Contact Us →
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
