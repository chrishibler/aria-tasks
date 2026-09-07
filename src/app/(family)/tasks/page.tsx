"use client";

import { ProfileColumn } from "@/components/profile-column";
import { DailiesColumn } from "@/components/dailies-column";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { Skeleton } from "@/components/ui/skeleton";

// How long the skeletons may sit before we point the user at /debug. The
// Home Screen app has no URL bar, so this link is the only way to get there.
const SLOW_AFTER_MS = 10_000;

export default function TasksPage() {
  const { profiles, loading } = useProfiles();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(id);
  }, [loading]);

  if (loading) {
    return (
      <div className="relative flex h-full">
        {slow && (
          <div className="absolute inset-x-0 top-0 z-10 m-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Still loading after 10 seconds. The data connection may be blocked on this device.{" "}
            <Link href="/debug" className="font-semibold underline">
              Open diagnostics
            </Link>
          </div>
        )}
        {[1, 2].map((i) => (
          <div key={i} className="w-full flex-none border-r p-4 space-y-4 sm:w-auto sm:flex-1">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-8 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">No profiles yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Go to Admin to add family members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain sm:snap-none">
      {profiles.map((profile) => (
        <ProfileColumn key={profile.id} profile={profile} />
      ))}
      <DailiesColumn profiles={profiles} />
    </div>
  );
}
