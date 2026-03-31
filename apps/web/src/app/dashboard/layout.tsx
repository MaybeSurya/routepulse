import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Workspace | RoutePulse",
  description: "Track your bus, book seats, and view live routes.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
