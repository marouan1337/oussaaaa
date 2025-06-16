"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  PlusCircle,
} from "lucide-react";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Propriétés", href: "/dashboard/properties", icon: Building2 },
  {
    name: "Ajouter une propriété",
    href: "/dashboard/properties/insert",
    icon: PlusCircle,
  },
  { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth/login";
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-card">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Building2 className="h-6 w-6" />
          <span className="font-bold">Gestion Immobilière</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-2 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
