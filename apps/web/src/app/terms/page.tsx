"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, ArrowLeft, Clock, AlertTriangle } from "lucide-react";

const LAST_UPDATED = "March 31, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4">{title}</h2>
      <div className="text-zinc-400 font-medium leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="bg-[#131315] text-[#e5e1e4] font-sans min-h-screen">

      {/* Nav */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-[#131315]/70 backdrop-blur-xl z-50 border-b border-white/5">
        <Link href="/" className="text-xl font-bold tracking-tighter text-[#c0c1ff]">RoutePulse</Link>
        <div className="hidden md:flex items-center gap-8 font-bold tracking-[-0.04em] text-sm">
          <Link href="/contact" className="text-[#c7c4d7] hover:text-white transition-colors">Contact</Link>
          <Link href="/privacy" className="text-[#c7c4d7] hover:text-white transition-colors">Privacy</Link>
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
              <FileText size={12} className="text-indigo-400" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-400">Legal Document</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black uppercase italic tracking-tighter text-white mb-6">
              Terms & <span className="text-primary">Conditions.</span>
            </h1>
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
              <Clock size={12} />
              <span>Last updated: {LAST_UPDATED}</span>
            </div>
            <div className="mt-6 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
              <div className="flex items-start gap-3">
                <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                  <span className="text-amber-400 font-black">Important:</span> By registering for or using RoutePulse, you agree to these terms. Please read them carefully. If you do not agree, do not use the platform.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>

            <Section title="1. Acceptance of Terms">
              <p>
                These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and DevNexis ("RoutePulse," "we," "us," or "our"), governing your access to and use of the RoutePulse platform, including the web application and all related services.
              </p>
              <p>
                By creating an account, accessing the platform, or using any feature of RoutePulse, you confirm that you have read, understood, and agree to be bound by these Terms. If you are using RoutePulse on behalf of a university or organization, you represent that you have the authority to bind that organization to these Terms.
              </p>
            </Section>

            <Section title="2. Eligibility">
              <p>To use RoutePulse, you must:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-zinc-500">
                <li>Be at least 18 years of age, or the age of majority in your jurisdiction</li>
                <li>Be a currently enrolled student, employed driver, or authorized administrator of a participating university</li>
                <li>Provide accurate, truthful, and complete registration information</li>
                <li>Have the legal capacity to enter into a binding agreement</li>
              </ul>
              <p>We reserve the right to refuse service or terminate accounts that do not meet these requirements.</p>
            </Section>

            <Section title="3. User Accounts & Roles">
              <h3 className="text-white font-black text-sm uppercase italic tracking-tight mt-4 mb-2">3.1 Account Security</h3>
              <p>
                You are responsible for maintaining the confidentiality of your credentials. You must notify us immediately at <a href="mailto:routepulse@maybesurya.dev" className="text-indigo-400 hover:text-white transition-colors">routepulse@maybesurya.dev</a> if you suspect unauthorized access to your account.
              </p>

              <h3 className="text-white font-black text-sm uppercase italic tracking-tight mt-4 mb-2">3.2 Role-Based Access</h3>
              <p>RoutePulse operates with three distinct user roles:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-zinc-500">
                <li><strong className="text-zinc-300">Students</strong> may view bus locations, book seats, and receive transit notifications</li>
                <li><strong className="text-zinc-300">Drivers</strong> may activate shifts, broadcast GPS location, and manage passenger manifests during assigned routes</li>
                <li><strong className="text-zinc-300">Administrators</strong> may manage fleet operations, assign drivers, and access platform analytics</li>
              </ul>
              <p>Users may not attempt to access features or data outside their assigned role.</p>

              <h3 className="text-white font-black text-sm uppercase italic tracking-tight mt-4 mb-2">3.3 One Account Per User</h3>
              <p>Each person may register only one account. Creating multiple accounts or sharing account credentials with others is prohibited.</p>
            </Section>

            <Section title="4. Acceptable Use">
              <p>You agree to use RoutePulse only for its intended purposes. You must not:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-zinc-500">
                <li>Attempt to access, probe, or disrupt other users' accounts or platform infrastructure</li>
                <li>Submit false or misleading information, including GPS coordinates or shift records</li>
                <li>Reverse engineer, decompile, or extract source code from the platform</li>
                <li>Use the platform to transmit spam, malware, or malicious content</li>
                <li>Circumvent authentication, rate limiting, or any security mechanisms</li>
                <li>Scrape, harvest, or mass-collect data from the platform using automated tools</li>
                <li>Use the platform in any manner that violates applicable law or regulation</li>
                <li>Impersonate another user, driver, or administrator</li>
                <li>Misuse the seat booking system, including booking seats with no intention to board</li>
              </ul>
              <p>Violations may result in immediate account suspension and notification of your university.</p>
            </Section>

            <Section title="5. Driver-Specific Obligations">
              <p>Drivers using the RoutePulse platform agree to the following additional obligations:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-zinc-500">
                <li>Activate only your assigned bus and route during your designated shift</li>
                <li>Maintain accurate GPS broadcasting during active duty — deliberate signal spoofing is prohibited</li>
                <li>Not allow unauthorized individuals to operate your assigned vehicle</li>
                <li>Report any platform issues, incidents, or discrepancies to your administrator promptly</li>
                <li>One driver may be assigned to one bus per shift at a time — simultaneous multi-bus assignments are not permitted</li>
              </ul>
            </Section>

            <Section title="6. Seat Booking Policy">
              <ul className="list-disc list-inside space-y-2 mt-3 text-zinc-500">
                <li>Seat bookings are confirmed on a first-come, first-served basis for each route</li>
                <li>Completing a seat booking creates a reservation obligation — repeated no-shows may result in booking privileges being suspended</li>
                <li>Administrators may cancel or modify bookings for operational reasons</li>
                <li>We do not process payments for seat bookings — RoutePulse is a logistics platform, not a ticketing service</li>
              </ul>
            </Section>

            <Section title="7. Intellectual Property">
              <p>
                All content, design, software, and technology within RoutePulse — including but not limited to code, UI elements, logos, and documentation — is the exclusive intellectual property of DevNexis, protected by copyright, trademark, and related laws.
              </p>
              <p>
                You are granted a limited, non-exclusive, non-transferable license to access and use the platform solely for its intended transit management purposes. You may not copy, reproduce, distribute, or create derivative works without express written consent from DevNexis.
              </p>
            </Section>

            <Section title="8. Data and Privacy">
              <p>
                Your use of RoutePulse is also governed by our <Link href="/privacy" className="text-indigo-400 hover:text-white transition-colors font-bold">Privacy Policy</Link>, which is incorporated by reference into these Terms. By using the platform, you consent to the data practices described therein.
              </p>
            </Section>

            <Section title="9. Availability & Service Interruptions">
              <p>
                We strive to maintain 99.9% uptime but do not guarantee uninterrupted availability. The platform may be temporarily unavailable due to scheduled maintenance, infrastructure updates, or events beyond our reasonable control (force majeure).
              </p>
              <p>
                RoutePulse is not liable for disruptions to campus transit operations arising from platform unavailability, GPS signal failure, or third-party infrastructure issues.
              </p>
            </Section>

            <Section title="10. Disclaimers & Limitation of Liability">
              <p className="text-amber-400/80 text-sm font-black uppercase tracking-wider mb-3">Important Legal Notice</p>
              <p>
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p>
                IN NO EVENT SHALL DEVNEXIS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE ROUTEPULSE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p>
                Our total liability to you for any claim arising from these Terms or your use of the platform shall not exceed the amount you paid us in the twelve (12) months preceding the claim (where applicable).
              </p>
            </Section>

            <Section title="11. Termination">
              <p>
                We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or for any reason we deem appropriate in our sole discretion, with or without notice.
              </p>
              <p>
                You may terminate your account at any time by contacting <a href="mailto:routepulse@maybesurya.dev" className="text-indigo-400 hover:text-white transition-colors">routepulse@maybesurya.dev</a>. Upon termination, your data will be handled in accordance with our Privacy Policy.
              </p>
              <p>
                Sections relating to intellectual property, disclaimers, limitation of liability, and governing law shall survive termination.
              </p>
            </Section>

            <Section title="12. Governing Law & Disputes">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict-of-law principles. Any disputes arising from these Terms or your use of RoutePulse shall be subject to the exclusive jurisdiction of the courts of India.
              </p>
              <p>
                Before pursuing formal legal action, you agree to first attempt to resolve any dispute informally by contacting us at <a href="mailto:legal@maybesurya.dev" className="text-indigo-400 hover:text-white transition-colors">legal@maybesurya.dev</a>.
              </p>
            </Section>

            <Section title="13. Changes to These Terms">
              <p>
                We may update these Terms from time to time. We will notify registered users of material changes by email or prominent notice on the platform. Continued use of RoutePulse after changes take effect constitutes your acceptance of the revised Terms.
              </p>
            </Section>

            <Section title="14. Contact">
              <p>For questions about these Terms:</p>
              <div className="mt-4 p-5 rounded-2xl bg-zinc-900 border border-white/5 space-y-2">
                <p className="text-sm"><span className="text-zinc-600 font-medium">Email:</span> <a href="mailto:legal@maybesurya.dev" className="text-indigo-400 hover:text-white transition-colors font-medium">legal@maybesurya.dev</a></p>
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
            <Link href="/privacy" className="text-sm font-black text-zinc-600 hover:text-indigo-400 transition-colors uppercase tracking-widest">
              ← Privacy Policy
            </Link>
            <Link href="/contact" className="text-sm font-black text-zinc-600 hover:text-indigo-400 transition-colors uppercase tracking-widest">
              Contact Us →
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
