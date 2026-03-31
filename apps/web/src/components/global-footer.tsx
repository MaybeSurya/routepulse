"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

// Pages that render their own footer — suppress the global one
const PAGES_WITH_OWN_FOOTER = ["/", "/contact", "/privacy", "/terms"];

export default function GlobalFooter() {
  const pathname = usePathname();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  if (PAGES_WITH_OWN_FOOTER.includes(pathname)) return null;

  return (
    <footer className="w-full py-6 px-8 border-t border-zinc-800/30 bg-[#131315]/50 backdrop-blur-md relative z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500">
          <span>Designed &amp; Developed with</span>
          <motion.span
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-indigo-500 mx-0.5 inline-block"
          >
            ♥
          </motion.span>
          <span>by</span>
          <a
            href="https://maybesurya.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-white transition-colors"
          >
            MaybeSurya
          </a>
        </div>

        <div className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-600">
          © {mounted ? new Date().getFullYear() : "2026"}{" "}
          <a href="https://devnexis.in" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400">
            DevNexis
          </a>. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
