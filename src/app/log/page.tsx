'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { CoachChat } from '@/components/CoachChat';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  UtensilsCrossed,
  Dumbbell,
  AlertTriangle,
  Activity,
  Moon,
  Check,
} from 'lucide-react';
import { todayISO } from '@/lib/utils';

type TabType = 'metrics' | 'nutrition' | 'workout' | 'symptom';

export default function LogPage() {
  const [activeTab, setActiveTab] = useState<TabType>('metrics');
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Metrics state
  const [sleepHours, setSleepHours] = useState('');
  const [sleepScore, setSleepScore] = useState('');
  const [hrv, setHrv] = useState('');
  const [steps, setSteps] = useState('');
  const [energy, setEnergy] = useState('7');
  const [weight, setWeight] = useState('');

  // Nutrition state
  const [items, setItems] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  // Workout state
  const [workoutType, setWorkoutType] = useState('');
  const [duration, setDuration] = useState('');
  const [rpe, setRpe] = useState('');

  // Symptom state
  const [painLocation, setPainLocation] = useState('');
  const [severity, setSeverity] = useState('5');
  const [notes, setNotes] = useState('');

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const submitMetrics = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/logs/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayISO(),
          sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
          sleep_score: sleepScore ? parseInt(sleepScore) : null,
          hrv: hrv ? parseInt(hrv) : null,
          steps: steps ? parseInt(steps) : null,
          subjective_energy: energy ? parseInt(energy) : null,
          weight_kg: weight ? parseFloat(weight) : null,
        }),
      });
      if (res.ok) showSuccess('Daily metrics saved!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitNutrition = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/logs/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          calories: calories ? parseFloat(calories) : null,
          protein_g: protein ? parseFloat(protein) : null,
          carbs_g: carbs ? parseFloat(carbs) : null,
          fat_g: fat ? parseFloat(fat) : null,
        }),
      });
      if (res.ok) {
        showSuccess('Meal logged!');
        setItems('');
        setCalories('');
        setProtein('');
        setCarbs('');
        setFat('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitWorkout = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/logs/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workout_type: workoutType || 'general',
          duration_minutes: duration ? parseInt(duration) : null,
          rpe: rpe ? parseInt(rpe) : null,
        }),
      });
      if (res.ok) {
        showSuccess('Workout logged!');
        setWorkoutType('');
        setDuration('');
        setRpe('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitSymptom = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/logs/symptom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pain_location: painLocation,
          severity: parseInt(severity),
          notes,
        }),
      });
      if (res.ok) {
        showSuccess('Symptom logged!');
        setPainLocation('');
        setSeverity('5');
        setNotes('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: { type: TabType; label: string; icon: React.ElementType }[] = [
    { type: 'metrics', label: 'Daily Metrics', icon: Activity },
    { type: 'nutrition', label: 'Meal', icon: UtensilsCrossed },
    { type: 'workout', label: 'Workout', icon: Dumbbell },
    { type: 'symptom', label: 'Symptom', icon: AlertTriangle },
  ];

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Log</h1>

        {/* Success toast */}
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            <Check className="h-4 w-4" />
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
          {tabs.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === type
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Metrics form */}
        {activeTab === 'metrics' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-indigo-600" />
                Today&apos;s Metrics
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Sleep hours" type="number" step="0.5" placeholder="7.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} />
                <Input label="Sleep score (0-100)" type="number" placeholder="80" value={sleepScore} onChange={(e) => setSleepScore(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="HRV (ms)" type="number" placeholder="55" value={hrv} onChange={(e) => setHrv(e.target.value)} />
                <Input label="Steps" type="number" placeholder="8000" value={steps} onChange={(e) => setSteps(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Weight (kg)" type="number" step="0.1" placeholder="75.0" value={weight} onChange={(e) => setWeight(e.target.value)} />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Energy: {energy}/10
                  </label>
                  <input type="range" min="1" max="10" value={energy} onChange={(e) => setEnergy(e.target.value)} className="mt-2 w-full accent-primary-600" />
                </div>
              </div>
              <Button onClick={submitMetrics} disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Saving...' : 'Save Metrics'}
              </Button>
            </div>
          </Card>
        )}

        {/* Nutrition form */}
        {activeTab === 'nutrition' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-amber-600" />
                Log a Meal
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <Input label="What did you eat?" placeholder="e.g., Grilled chicken with rice and veggies" value={items} onChange={(e) => setItems(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Calories" type="number" placeholder="450" value={calories} onChange={(e) => setCalories(e.target.value)} />
                <Input label="Protein (g)" type="number" placeholder="35" value={protein} onChange={(e) => setProtein(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Carbs (g)" type="number" placeholder="50" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
                <Input label="Fat (g)" type="number" placeholder="15" value={fat} onChange={(e) => setFat(e.target.value)} />
              </div>
              <Button onClick={submitNutrition} disabled={isSubmitting || !items} className="w-full">
                {isSubmitting ? 'Saving...' : 'Log Meal'}
              </Button>
            </div>
          </Card>
        )}

        {/* Workout form */}
        {activeTab === 'workout' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-blue-600" />
                Log a Workout
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Workout Type</label>
                <select value={workoutType} onChange={(e) => setWorkoutType(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                  <option value="">Select type...</option>
                  <option value="push">Push</option>
                  <option value="pull">Pull</option>
                  <option value="legs">Legs</option>
                  <option value="full_body">Full Body</option>
                  <option value="cardio">Cardio</option>
                  <option value="mobility">Mobility</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Duration (min)" type="number" placeholder="45" value={duration} onChange={(e) => setDuration(e.target.value)} />
                <Input label="RPE (1-10)" type="number" min="1" max="10" placeholder="7" value={rpe} onChange={(e) => setRpe(e.target.value)} />
              </div>
              <Button onClick={submitWorkout} disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Saving...' : 'Log Workout'}
              </Button>
            </div>
          </Card>
        )}

        {/* Symptom form */}
        {activeTab === 'symptom' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Log a Symptom
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <Input label="Pain Location" placeholder="e.g., Lower back" value={painLocation} onChange={(e) => setPainLocation(e.target.value)} />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Severity: {severity}/10</label>
                <input type="range" min="0" max="10" value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full accent-primary-600" />
                <div className="flex justify-between text-xs text-gray-400"><span>No pain</span><span>Severe</span></div>
              </div>
              <Input label="Notes" placeholder="Additional details..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Button onClick={submitSymptom} disabled={isSubmitting || !painLocation} className="w-full">
                {isSubmitting ? 'Saving...' : 'Log Symptom'}
              </Button>
            </div>
          </Card>
        )}

        <div className="mt-4 text-center">
          <Badge variant="info">
            Tip: You can also log via the AI Coach chat!
          </Badge>
        </div>
      </main>
      <CoachChat />
    </>
  );
}
