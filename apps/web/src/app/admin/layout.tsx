import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Workspace | RoutePulse",
  description: "Manage routes, students, and fleet operations.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
