"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebarHidden } from "@/lib/hooks/use-sidebar-visibility";
import {
  CheckCircleIcon,
  CalendarDaysIcon,
  StarIcon,
  ListBulletIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/tasks", label: "Tasks", icon: CheckCircleIcon, activeColor: "bg-sky-100 text-sky-700" },
  { href: "/calendar", label: "Calendar", icon: CalendarDaysIcon, activeColor: "bg-violet-100 text-violet-700" },
  { href: "/rewards", label: "Rewards", icon: StarIcon, activeColor: "bg-amber-100 text-amber-700" },
  { href: "/lists", label: "Lists", icon: ListBulletIcon, activeColor: "bg-emerald-100 text-emerald-700" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { hidden } = useSidebarHidden();

  return (
    <>
      {/* Desktop sidebar */}
      {/* `inert` keeps the collapsed links out of the tab order and off screen
          readers, which visibility alone wouldn't do. */}
      <aside
        id="family-sidebar"
        aria-label="Main navigation"
        inert={hidden}
        className={cn(
          "hidden shrink-0 flex-col overflow-hidden bg-slate-50/50 transition-[width] duration-300 ease-in-out md:flex motion-reduce:transition-none",
          hidden ? "w-0 border-r-0" : "w-[200px] border-r"
        )}
      >
        <div className="flex w-[200px] flex-1 flex-col gap-1.5 p-3 pt-5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? item.activeColor
                    : "text-muted-foreground hover:bg-white hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="w-[200px] border-t p-3">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-white hover:text-foreground transition-colors"
          >
            <Cog6ToothIcon className="h-5 w-5" />
            Admin
          </Link>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t bg-white md:hidden">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors",
                isActive ? item.activeColor.split(" ")[1] : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/admin"
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold text-muted-foreground"
        >
          <Cog6ToothIcon className="h-5 w-5" />
          Admin
        </Link>
      </nav>
    </>
  );
}
