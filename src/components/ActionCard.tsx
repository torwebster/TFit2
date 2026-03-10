'use client';

import { useState } from 'react';
import { Check, Dumbbell, Footprints, Droplets, Heart, UtensilsCrossed } from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  training: Dumbbell,
  steps: Footprints,
  nutrition: UtensilsCrossed,
  hydration: Droplets,
  recovery: Heart,
};

const categoryColors: Record<string, string> = {
  training: 'text-blue-600 bg-blue-50',
  steps: 'text-green-600 bg-green-50',
  nutrition: 'text-amber-600 bg-amber-50',
  hydration: 'text-cyan-600 bg-cyan-50',
  recovery: 'text-purple-600 bg-purple-50',
};

interface ActionCardProps {
  category: string;
  action: string;
  priority: number;
}

export function ActionCard({ category, action }: ActionCardProps) {
  const [completed, setCompleted] = useState(false);
  const Icon = categoryIcons[category] ?? Check;
  const colorClasses = categoryColors[category] ?? 'text-gray-600 bg-gray-50';

  return (
    <button
      onClick={() => setCompleted(!completed)}
      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
        completed
          ? 'border-green-200 bg-green-50/50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
          completed ? 'bg-green-100 text-green-600' : colorClasses
        }`}
      >
        {completed ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
      </div>
      <span
        className={`text-sm font-medium ${
          completed ? 'text-green-700 line-through' : 'text-gray-800'
        }`}
      >
        {action}
      </span>
    </button>
  );
}
