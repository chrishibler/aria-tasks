"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileForm } from "@/components/admin/profile-form";
import { useConfirm } from "@/components/confirm-provider";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { createProfile, updateProfile, deleteProfile } from "@/lib/actions/admin";
import { PROFILE_COLORS } from "@/lib/constants";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { Profile, ProfileColor } from "@/types";

export default function AdminProfilesPage() {
  const { profiles, loading } = useProfiles();
  const confirm = useConfirm();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | undefined>();

  function handleEdit(profile: Profile) {
    setEditing(profile);
    setFormOpen(true);
  }

  async function handleSubmit(data: {
    name: string;
    color: ProfileColor;
    avatarInitial: string;
    order: number;
  }) {
    if (editing) {
      await updateProfile(editing.id, data);
    } else {
      await createProfile(data);
    }
    setEditing(undefined);
  }

  async function handleDelete(id: string) {
    if (
      await confirm({
        title: "Delete this profile?",
        description:
          "Their tasks and completed history will be deleted too. This cannot be undone.",
        confirmLabel: "Delete profile",
      })
    ) {
      await deleteProfile(id);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profiles</h2>
        <Button
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          className="gap-1"
        >
          <PlusIcon className="h-4 w-4" />
          Add Profile
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : profiles.length === 0 ? (
        <p className="text-gray-500">No profiles yet. Create your first one!</p>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => {
            const colors = PROFILE_COLORS[profile.color];
            return (
              <Card key={profile.id}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${colors.bg} ${colors.text} text-xl font-bold`}
                  >
                    {profile.avatarInitial}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{profile.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{profile.color}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(profile)}>
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(profile.id)}>
                      <TrashIcon className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ProfileForm
        // Remount so the form re-seeds its state from `initial`, which is
        // only read on mount.
        key={editing?.id ?? "new"}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(undefined);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        nextOrder={profiles.length}
      />
    </div>
  );
}
