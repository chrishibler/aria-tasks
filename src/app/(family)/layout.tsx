"use client";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { DateNavigationProvider } from "@/lib/hooks/use-date-navigation";

export default function FamilyLayout({ children }: { children: React.ReactNode }) {
  return (
    <DateNavigationProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
        </div>
      </div>
    </DateNavigationProvider>
  );
}
