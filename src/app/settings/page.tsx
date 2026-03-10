'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Check, User, Target, Dumbbell } from 'lucide-react';
import type { Goal, ExperienceLevel } from '@/types';

const GOALS: { value: Goal; label: string }[] = [
  { value: 'fat_loss', label: 'Fat Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'general_health', label: 'General Health' },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const EQUIPMENT = [
  'barbell', 'dumbbells', 'bench', 'pull_up_bar', 'cable_machine',
  'bands', 'kettlebell', 'treadmill', 'bike', 'rowing_machine',
];

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [goal, setGoal] = useState<Goal>('general_health');
  const [experience, setExperience] = useState<ExperienceLevel>('intermediate');
  const [age, setAge] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [minutesPerSession, setMinutesPerSession] = useState('45');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setGoal(data.primary_goal || 'general_health');
          setExperience(data.experience_level || 'intermediate');
          setAge(data.age?.toString() || '');
          setWeightKg(data.weight_kg?.toString() || '');
          setHeightCm(data.height_cm?.toString() || '');
          setSelectedDays(data.available_days || []);
          setMinutesPerSession(data.minutes_per_session?.toString() || '45');
          setSelectedEquipment(data.available_equipment || []);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_goal: goal,
          experience_level: experience,
          age: age ? parseInt(age) : null,
          weight_kg: weightKg ? parseFloat(weightKg) : null,
          height_cm: heightCm ? parseFloat(heightCm) : null,
          available_days: selectedDays,
          minutes_per_session: parseInt(minutesPerSession) || 45,
          available_equipment: selectedEquipment,
          onboarding_completed: true,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = (day: string) =>
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const toggleEquipment = (eq: string) =>
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    );

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            <Check className="h-4 w-4" />
            Settings saved!
          </div>
        )}

        <div className="space-y-6">
          {/* Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary-600" />
                Goal & Experience
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Primary Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as Goal)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {GOALS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Experience Level</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Body stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary-600" />
                Body Stats
              </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
              <Input label="Weight (kg)" type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
              <Input label="Height (cm)" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            </div>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary-600" />
                Training Setup
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                        selectedDays.includes(day)
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                label="Minutes per session"
                type="number"
                value={minutesPerSession}
                onChange={(e) => setMinutesPerSession(e.target.value)}
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Equipment</label>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT.map((eq) => (
                    <button
                      key={eq}
                      onClick={() => toggleEquipment(eq)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                        selectedEquipment.includes(eq)
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {eq.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Button onClick={handleSave} disabled={isSaving} className="w-full" size="lg">
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>

          <p className="text-center text-xs text-gray-400">
            Your data is stored securely and never shared.
          </p>
        </div>
      </main>
    </>
  );
}
