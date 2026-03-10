'use client';

import { useState } from 'react';
import { X, UtensilsCrossed, Dumbbell, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type LogType = 'nutrition' | 'workout' | 'symptom';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: LogType;
}

export function QuickLogModal({ isOpen, onClose, defaultType = 'nutrition' }: QuickLogModalProps) {
  const [logType, setLogType] = useState<LogType>(defaultType);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nutrition state
  const [items, setItems] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');

  // Workout state
  const [workoutType, setWorkoutType] = useState('');
  const [duration, setDuration] = useState('');
  const [rpe, setRpe] = useState('');

  // Symptom state
  const [painLocation, setPainLocation] = useState('');
  const [severity, setSeverity] = useState('5');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let endpoint = '';
      let body = {};

      switch (logType) {
        case 'nutrition':
          endpoint = '/api/logs/nutrition';
          body = {
            items,
            calories: calories ? parseFloat(calories) : null,
            protein_g: protein ? parseFloat(protein) : null,
          };
          break;
        case 'workout':
          endpoint = '/api/logs/workout';
          body = {
            workout_type: workoutType || 'general',
            duration_minutes: duration ? parseInt(duration) : null,
            rpe: rpe ? parseInt(rpe) : null,
          };
          break;
        case 'symptom':
          endpoint = '/api/logs/symptom';
          body = {
            pain_location: painLocation,
            severity: parseInt(severity),
            notes,
          };
          break;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onClose();
        // Reset form
        setItems('');
        setCalories('');
        setProtein('');
        setWorkoutType('');
        setDuration('');
        setRpe('');
        setPainLocation('');
        setSeverity('5');
        setNotes('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: { type: LogType; label: string; icon: React.ElementType }[] = [
    { type: 'nutrition', label: 'Meal', icon: UtensilsCrossed },
    { type: 'workout', label: 'Workout', icon: Dumbbell },
    { type: 'symptom', label: 'Symptom', icon: AlertTriangle },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Log</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Type tabs */}
        <div className="flex gap-1 border-b px-6 pt-2">
          {tabs.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setLogType(type)}
              className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                logType === type
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-4 px-6 py-5">
          {logType === 'nutrition' && (
            <>
              <Input
                label="What did you eat?"
                placeholder="e.g., Chicken breast with rice and broccoli"
                value={items}
                onChange={(e) => setItems(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Calories"
                  type="number"
                  placeholder="e.g., 450"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
                <Input
                  label="Protein (g)"
                  type="number"
                  placeholder="e.g., 35"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </div>
            </>
          )}

          {logType === 'workout' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Workout Type
                </label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">Select type...</option>
                  <option value="push">Push (Chest, Shoulders, Triceps)</option>
                  <option value="pull">Pull (Back, Biceps)</option>
                  <option value="legs">Legs</option>
                  <option value="full_body">Full Body</option>
                  <option value="cardio">Cardio</option>
                  <option value="mobility">Mobility/Stretching</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Duration (min)"
                  type="number"
                  placeholder="e.g., 45"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
                <Input
                  label="RPE (1-10)"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="e.g., 7"
                  value={rpe}
                  onChange={(e) => setRpe(e.target.value)}
                />
              </div>
            </>
          )}

          {logType === 'symptom' && (
            <>
              <Input
                label="Pain Location"
                placeholder="e.g., Lower back, Right knee"
                value={painLocation}
                onChange={(e) => setPainLocation(e.target.value)}
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Severity: {severity}/10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>No pain</span>
                  <span>Severe</span>
                </div>
              </div>
              <Input
                label="Notes"
                placeholder="Any additional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
