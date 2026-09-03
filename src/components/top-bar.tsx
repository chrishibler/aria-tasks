"use client";

import { Button } from "@/components/ui/button";
import { useDateNavigation } from "@/lib/hooks/use-date-navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebarHidden } from "@/lib/hooks/use-sidebar-visibility";
import { UhOhButton } from "@/components/uh-oh-button";

export function TopBar() {
  const { displayDate, isToday, goToday, goNext, goPrev } = useDateNavigation();
  const { hidden, setHidden } = useSidebarHidden();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-3 md:px-6">
      <div className="flex items-center gap-2">
        {/* Lives in the top bar rather than floating over content, so the way
            back is always in the same place whether or not the nav is open.
            Hidden on mobile, which uses the bottom bar instead. */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setHidden(!hidden)}
          aria-label={hidden ? "Show navigation" : "Hide navigation"}
          aria-expanded={!hidden}
          aria-controls="family-sidebar"
          className="hidden h-8 w-8 rounded-lg md:inline-flex"
        >
          {hidden ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
        <span aria-hidden className="hidden h-5 w-px bg-border md:block" />

        <Button variant="ghost" size="icon" onClick={goPrev} className="h-8 w-8 rounded-lg">
          <ChevronLeftIcon className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-bold md:text-lg">{displayDate}</h1>
        <Button variant="ghost" size="icon" onClick={goNext} className="h-8 w-8 rounded-lg">
          <ChevronRightIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {!isToday && (
          <Button variant="outline" size="sm" onClick={goToday} className="text-xs font-semibold">
            Today
          </Button>
        )}
        <UhOhButton />
      </div>
    </header>
  );
}
