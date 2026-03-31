"use client";

import { HeroUIProvider } from "@heroui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { useState, useEffect } from "react";

import { queryClient } from "@/utils/trpc";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem 
      disableTransitionOnChange
    >
      <HeroUIProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          {mounted && <ReactQueryDevtools />}
          {mounted && <Toaster richColors position="top-right" closeButton />}
        </QueryClientProvider>
      </HeroUIProvider>
    </ThemeProvider>
  );
}
