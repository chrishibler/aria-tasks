"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/lib/hooks/use-settings";
import { updateSettings } from "@/lib/actions/admin";
import { getRotatingPin } from "@/lib/constants";

export default function AdminSettingsPage() {
  const { settings, loading } = useSettings();
  const [familyName, setFamilyName] = useState("");
  const [saved, setSaved] = useState(false);
  // Safe to read the local date during render: the admin layout gates on
  // sessionStorage, whose server snapshot is always false, so this page is
  // only ever rendered on the client.
  const todayPin = getRotatingPin();

  if (!loading && familyName === "" && settings.familyName) {
    setFamilyName(settings.familyName);
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    await updateSettings({ familyName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Family Name</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveName} className="space-y-3">
            <div>
              <Label htmlFor="familyName">Name</Label>
              <Input
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
              />
            </div>
            <Button type="submit" isDisabled={!familyName.trim()}>
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parent PIN</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            The PIN changes every day. It is today&apos;s date: the two-digit day
            followed by the two-digit month.
          </p>
          <div className="rounded-xl bg-muted px-4 py-3">
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Today&apos;s PIN
            </span>
            <span className="font-mono text-3xl font-bold tracking-[0.3em] text-foreground">
              {todayPin}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            It rolls over at midnight, so anyone who knows the date can work it
            out — treat it as a speed bump rather than a lock.
          </p>
        </CardContent>
      </Card>

      {saved && (
        <p className="text-sm text-green-600 font-medium">Saved successfully!</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            If tasks never load on a device, open this page there. It tests the
            connection to the database and shows the build it is running.
          </p>
          <Link href="/debug" className="text-sm font-semibold underline underline-offset-4">
            Open diagnostics
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
