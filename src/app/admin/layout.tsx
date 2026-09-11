import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminPageClient } from "@/lib/auth";
import { supabaseConfig } from "@/lib/config";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!supabaseConfig()) redirect("/login");
  await adminPageClient();
  return <div className="shell page-space">{children}</div>;
}
