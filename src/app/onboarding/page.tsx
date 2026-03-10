'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Activity, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import type { Goal, ExperienceLevel } from '@/types';

const GOALS: { value: Goal; label: string; desc: string }[] = [
  { value: 'fat_loss', label: 'Fat Loss', desc: 'Lose body fat while preserving muscle' },
  { value: 'muscle_gain', label: 'Muscle Gain', desc: 'Build muscle and strength' },
  { value: 'maintenance', label: 'Maintenance', desc: 'Stay fit and healthy' },
  { value: 'endurance', label: 'Endurance', desc: 'Improve stamina and cardio' },
  { value: 'general_health', label: 'General Health', desc: 'Overall wellness' },
];

const EXPERIENCE: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Beginner', desc: 'New to structured training' },
  { value: 'intermediate', label: 'Intermediate', desc: '1-3 years of training' },
  { value: 'advanced', label: 'Advanced', desc: '3+ years of consistent training' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EQUIPMENT = [
  'barbell', 'dumbbells', 'bench', 'pull_up_bar', 'cable_machine',
  'bands', 'kettlebell', 'treadmill', 'bike', 'rowing_machine',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [goal, setGoal] = useState<Goal>('general_health');
  const [experience, setExperience] = useState<ExperienceLevel>('intermediate');
  const [age, setAge] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [minutesPerSession, setMinutesPerSession] = useState('45');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  const steps = [
    'Goal',
    'Experience',
    'Body Stats',
    'Schedule',
    'Equipment',
    'Done',
  ];

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    );
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
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
        router.push('/today');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        <Activity className="h-8 w-8 text-primary-600" />
        <span className="text-2xl font-bold text-gray-900">TFit Setup</span>
      </div>

      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                i < step
                  ? 'bg-primary-600 text-white'
                  : i === step
                    ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-600'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-6 ${
                  i < step ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="w-full max-w-lg">
        {/* Step 0: Goal */}
        {step === 0 && (
          <div>
            <h2 className="mb-1 text-xl font-semibold">What&apos;s your primary goal?</h2>
            <p className="mb-6 text-sm text-gray-500">We&apos;ll tailor everything around this.</p>
            <div className="space-y-2">
              {GOALS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setGoal(value)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    goal === value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      goal === value
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-gray-300'
                    }`}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Experience */}
        {step === 1 && (
          <div>
            <h2 className="mb-1 text-xl font-semibold">Experience level?</h2>
            <p className="mb-6 text-sm text-gray-500">This affects exercise selection and volume.</p>
            <div className="space-y-2">
              {EXPERIENCE.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setExperience(value)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    experience === value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      experience === value
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-gray-300'
                    }`}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Body stats */}
        {step === 2 && (
          <div>
            <h2 className="mb-1 text-xl font-semibold">Your stats</h2>
            <p className="mb-6 text-sm text-gray-500">
              Optional but helps us calculate better targets.
            </p>
            <div className="space-y-4">
              <Input
                label="Age"
                type="number"
                placeholder="e.g., 28"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
              <Input
                label="Weight (kg)"
                type="number"
                placeholder="e.g., 75"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
              <Input
                label="Height (cm)"
                type="number"
                placeholder="e.g., 175"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div>
            <h2 className="mb-1 text-xl font-semibold">Training schedule</h2>
            <p className="mb-6 text-sm text-gray-500">
              Which days can you train, and for how long?
            </p>
            <div className="mb-6 grid grid-cols-2 gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day.toLowerCase())}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    selectedDays.includes(day.toLowerCase())
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <Input
              label="Minutes per session"
              type="number"
              placeholder="45"
              value={minutesPerSession}
              onChange={(e) => setMinutesPerSession(e.target.value)}
            />
          </div>
        )}

        {/* Step 4: Equipment */}
        {step === 4 && (
          <div>
            <h2 className="mb-1 text-xl font-semibold">Available equipment</h2>
            <p className="mb-6 text-sm text-gray-500">
              Select what you have access to. Leave empty for bodyweight-only.
            </p>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT.map((eq) => (
                <button
                  key={eq}
                  onClick={() => toggleEquipment(eq)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium capitalize transition-colors ${
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
        )}

        {/* Step 5: Done */}
        {step === 5 && (
          <div className="text-center py-4">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold">You&apos;re all set!</h2>
            <p className="mb-6 text-sm text-gray-500">
              Your personalized AI fitness plan is ready to go. Hit the button
              below to see your first daily plan.
            </p>
            <Button
              size="lg"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Setting up...' : 'Start My Journey'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Navigation */}
        {step < 5 && (
          <div className="mt-6 flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => setStep(step + 1)}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
