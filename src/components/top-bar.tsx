"use client";

import { Button } from "@/components/ui/button";
import { useDateNavigation } from "@/lib/hooks/use-date-navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function TopBar() {
  const { displayDate, isToday, goToday, goNext, goPrev } = useDateNavigation();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-3 md:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goPrev} className="h-8 w-8">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-bold md:text-lg">{displayDate}</h1>
        <Button variant="ghost" size="icon" onClick={goNext} className="h-8 w-8">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {!isToday && (
        <Button variant="outline" size="sm" onClick={goToday} className="text-xs font-semibold">
          Today
        </Button>
      )}
    </header>
  );
}
