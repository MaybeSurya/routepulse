import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";
import GlobalFooter from "@/components/global-footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RoutePulse – Track Your Campus Bus In Real Time",
  description:
    "The next-generation transportation platform for modern universities. Predict arrivals, book seats, and navigate campus with precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <div className="min-h-screen flex flex-col">
          <Providers>
            <main className="flex-1">
              {children}
            </main>
            <GlobalFooter />
          </Providers>
        </div>
      </body>
    </html>
  );
}
