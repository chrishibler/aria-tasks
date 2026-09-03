"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PinModal } from "@/components/pin-modal";
import { usePinAuth } from "@/lib/hooks/use-pin-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  GiftIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowLeftIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: HomeIcon, exact: true },
  { href: "/admin/profiles", label: "Profiles", icon: UsersIcon },
  { href: "/admin/tasks", label: "Tasks", icon: ClipboardDocumentListIcon },
  { href: "/admin/rewards", label: "Rewards", icon: GiftIcon },
  { href: "/admin/history", label: "History", icon: ClockIcon },
  { href: "/admin/settings", label: "Settings", icon: Cog6ToothIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, verify, logout } = usePinAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <PinModal onVerify={verify} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </Button>
          <h1 className="text-lg font-bold text-gray-900">Admin</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/tasks">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Family View</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - desktop */}
        <nav className="hidden md:flex w-56 flex-col gap-1 border-r bg-white p-3 min-h-[calc(100vh-57px)]">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            <div className="absolute inset-0 bg-black/20" onClick={() => setMenuOpen(false)} />
            <nav className="absolute left-0 top-[57px] w-64 bg-white border-r p-3 min-h-[calc(100vh-57px)] flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
