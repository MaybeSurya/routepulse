import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Driver Interface | RoutePulse",
  description: "Premium driver interface for real-time route navigation.",
};

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
