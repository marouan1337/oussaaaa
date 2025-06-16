import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/jwt";
import { DashboardNav } from "@/components/dashboard/nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
