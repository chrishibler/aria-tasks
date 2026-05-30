"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/lib/hooks/use-settings";
import { updateSettings } from "@/lib/actions/admin";

export default function AdminSettingsPage() {
  const { settings, loading } = useSettings();
  const [familyName, setFamilyName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saved, setSaved] = useState(false);

  if (!loading && familyName === "" && settings.familyName) {
    setFamilyName(settings.familyName);
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    await updateSettings({ familyName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSavePin(e: React.FormEvent) {
    e.preventDefault();
    if (newPin.length < 4) return;
    if (newPin !== confirmPin) return;
    await updateSettings({ pin: newPin });
    setNewPin("");
    setConfirmPin("");
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
            <Button type="submit" disabled={!familyName.trim()}>
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change PIN</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePin} className="space-y-3">
            <div>
              <Label htmlFor="newPin">New PIN (4+ digits)</Label>
              <Input
                id="newPin"
                type="password"
                inputMode="numeric"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirmPin">Confirm PIN</Label>
              <Input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
              />
              {newPin && confirmPin && newPin !== confirmPin && (
                <p className="text-sm text-destructive mt-1">PINs don&apos;t match</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={newPin.length < 4 || newPin !== confirmPin}
            >
              Update PIN
            </Button>
          </form>
        </CardContent>
      </Card>

      {saved && (
        <p className="text-sm text-green-600 font-medium">Saved successfully!</p>
      )}
    </div>
  );
}
