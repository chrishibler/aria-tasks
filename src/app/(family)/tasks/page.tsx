"use client";

import { ProfileColumn } from "@/components/profile-column";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { Skeleton } from "@/components/ui/skeleton";

export default function TasksPage() {
  const { profiles, loading } = useProfiles();

  if (loading) {
    return (
      <div className="flex h-full">
        {[1, 2].map((i) => (
          <div key={i} className="flex-1 border-r p-4 space-y-4">
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
    <div className="flex h-full overflow-x-auto">
      {profiles.map((profile) => (
        <ProfileColumn key={profile.id} profile={profile} />
      ))}
    </div>
  );
}
