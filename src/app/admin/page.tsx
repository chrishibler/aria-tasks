"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompletions } from "@/lib/hooks/use-completions";
import { useStars } from "@/lib/hooks/use-stars";
import { useRedemptions } from "@/lib/hooks/use-redemptions";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { useTasks } from "@/lib/hooks/use-tasks";
import { PROFILE_COLORS } from "@/lib/constants";
import { Star, CheckCircle, Gift, Users } from "lucide-react";

export default function AdminDashboard() {
  const { profiles } = useProfiles();
  const { balance, earned } = useStars();
  const { completions } = useCompletions({ todayOnly: true });
  const { redemptions } = useRedemptions();
  const { tasks } = useTasks();

  const stats = [
    {
      label: "Total Stars Balance",
      value: balance,
      icon: Star,
      color: "text-yellow-500",
    },
    {
      label: "Tasks Done Today",
      value: completions.length,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      label: "Total Stars Earned",
      value: earned,
      icon: Star,
      color: "text-blue-500",
    },
    {
      label: "Total Redemptions",
      value: redemptions.length,
      icon: Gift,
      color: "text-indigo-500",
    },
  ];

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5" />
              Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profiles.length === 0 ? (
              <p className="text-sm text-gray-600">No profiles yet</p>
            ) : (
              <div className="flex gap-3">
                {profiles.map((profile) => {
                  const colors = PROFILE_COLORS[profile.color];
                  return (
                    <div key={profile.id} className="flex items-center gap-2">
                      <div
                        className={`h-8 w-8 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-sm font-bold`}
                      >
                        {profile.avatarInitial}
                      </div>
                      <span className="text-sm font-medium">{profile.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift className="h-5 w-5" />
              Recent Redemptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {redemptions.length === 0 ? (
              <p className="text-sm text-gray-600">No redemptions yet</p>
            ) : (
              <ul className="space-y-1">
                {redemptions.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex justify-between text-sm">
                    <span>{r.rewardName}</span>
                    <span className="text-gray-500">-{r.starCost} stars</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
