'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { CoachChat } from '@/components/CoachChat';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  Calendar,
} from 'lucide-react';

interface WorkoutEntry {
  workout_type: string;
  duration_minutes?: number;
  rpe?: number;
  logged_at: string;
  calories_burned?: number;
}

interface NutritionEntry {
  items: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  logged_at: string;
}

interface MetricsEntry {
  date: string;
  sleep_hours?: number;
  sleep_score?: number;
  hrv?: number;
  steps?: number;
  subjective_energy?: number;
  weight_kg?: number;
  body_battery?: number;
}

interface DashboardData {
  profile: Record<string, unknown> | null;
  metrics: MetricsEntry[];
  today_plan: Record<string, unknown> | null;
  recent_workouts: WorkoutEntry[];
  recent_nutrition: NutritionEntry[];
  user: { name: string; email: string; picture?: string };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !data) {
    return (
      <>
        <Navigation />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      </>
    );
  }

  const weeklyWorkouts = data.recent_workouts.length;
  const weeklyCalories = data.recent_nutrition.reduce(
    (sum, m) => sum + ((m.calories as number) ?? 0),
    0
  );
  const avgProtein =
    data.recent_nutrition.length > 0
      ? Math.round(
          data.recent_nutrition.reduce(
            (sum, m) => sum + ((m.protein_g as number) ?? 0),
            0
          ) / data.recent_nutrition.length
        )
      : 0;

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{data.user.name ? `, ${data.user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm text-gray-500">Your 7-day overview</p>
        </div>

        {/* Stats grid */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Dumbbell}
            label="Workouts"
            value={`${weeklyWorkouts}`}
            subtitle="this week"
            color="blue"
          />
          <StatCard
            icon={UtensilsCrossed}
            label="Avg Protein"
            value={`${avgProtein}g`}
            subtitle="per meal"
            color="amber"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Calories"
            value={Math.round(weeklyCalories).toLocaleString()}
            subtitle="this week"
            color="green"
          />
          <StatCard
            icon={Calendar}
            label="Metrics Logged"
            value={`${data.metrics.length}`}
            subtitle="days this week"
            color="purple"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent workouts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-blue-600" />
                Recent Workouts
              </CardTitle>
            </CardHeader>
            {data.recent_workouts.length === 0 ? (
              <p className="text-sm text-gray-500">No workouts logged yet.</p>
            ) : (
              <div className="space-y-2">
                {data.recent_workouts.slice(0, 5).map((w, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-800 capitalize">
                        {String(w.workout_type).replace('_', ' ')}
                      </span>
                      {w.duration_minutes && (
                        <span className="ml-2 text-xs text-gray-500">
                          {Number(w.duration_minutes)} min
                        </span>
                      )}
                    </div>
                    {w.rpe && (
                      <Badge variant={Number(w.rpe) >= 8 ? 'danger' : 'info'}>
                        RPE {Number(w.rpe)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent nutrition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-amber-600" />
                Recent Meals
              </CardTitle>
            </CardHeader>
            {data.recent_nutrition.length === 0 ? (
              <p className="text-sm text-gray-500">No meals logged yet.</p>
            ) : (
              <div className="space-y-2">
                {data.recent_nutrition.slice(0, 5).map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <span className="text-sm text-gray-800 truncate max-w-[200px]">
                      {m.items as string}
                    </span>
                    <div className="flex gap-2 text-xs text-gray-500">
                      {m.calories && <span>{Number(m.calories)} kcal</span>}
                      {m.protein_g && <span>{Number(m.protein_g)}g P</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Readiness trend */}
          {data.metrics.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Daily Metrics (Last 7 Days)</CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Sleep</th>
                      <th className="pb-2 font-medium">HRV</th>
                      <th className="pb-2 font-medium">Steps</th>
                      <th className="pb-2 font-medium">Energy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.metrics.map((m, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="py-2 text-gray-700">
                          {m.date as string}
                        </td>
                        <td className="py-2">
                          {m.sleep_hours ? `${m.sleep_hours}h` : '—'}
                        </td>
                        <td className="py-2">
                          {m.hrv ? `${m.hrv}ms` : '—'}
                        </td>
                        <td className="py-2">
                          {m.steps
                            ? (m.steps as number).toLocaleString()
                            : '—'}
                        </td>
                        <td className="py-2">
                          {m.subjective_energy
                            ? `${m.subjective_energy}/10`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>
      <CoachChat />
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <Card>
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[color]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>
    </Card>
  );
}
