'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { ReadinessRing } from '@/components/ReadinessRing';
import { ActionCard } from '@/components/ActionCard';
import { CoachChat } from '@/components/CoachChat';
import { QuickLogModal } from '@/components/QuickLogModal';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { DailyPlan, TrainingBlock } from '@/types';
import {
  RefreshCw,
  Plus,
  Clock,
  Target,
  Dumbbell,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function TodayPage() {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTraining, setShowTraining] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  const loadPlan = async () => {
    try {
      const res = await fetch('/api/plan/today');
      const data = await res.json();
      if (data.plan) {
        setPlan(data.plan);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/plan/generate', { method: 'POST' });
      const data = await res.json();
      if (data.plan) {
        setPlan(data.plan);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

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
      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Today</h1>
            <p className="text-sm text-gray-500">{formatDate(new Date())}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowLogModal(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Log
            </Button>
            <Button
              size="sm"
              onClick={generatePlan}
              disabled={isGenerating}
            >
              <RefreshCw
                className={`mr-1 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`}
              />
              {plan ? 'Refresh' : 'Generate'} Plan
            </Button>
          </div>
        </div>

        {!plan ? (
          <Card className="text-center py-12">
            <Dumbbell className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h2 className="mb-2 text-lg font-semibold text-gray-700">
              No plan yet
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              Generate your personalized daily plan based on your profile, metrics, and recent activity.
            </p>
            <Button onClick={generatePlan} disabled={isGenerating}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`}
              />
              Generate Today&apos;s Plan
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Readiness + Targets */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="flex flex-col items-center py-8">
                <ReadinessRing
                  score={plan.readiness.score}
                  level={plan.readiness.level}
                />
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary-600" />
                    Daily Targets
                  </CardTitle>
                </CardHeader>
                <div className="space-y-3">
                  <TargetRow
                    label="Steps"
                    value={plan.targets.step_target.toLocaleString()}
                  />
                  {plan.targets.calorie_target && (
                    <TargetRow
                      label="Calories"
                      value={`${Math.round(plan.targets.calorie_target)} kcal`}
                    />
                  )}
                  {plan.targets.protein_target_g && (
                    <TargetRow
                      label="Protein"
                      value={`${plan.targets.protein_target_g}g`}
                    />
                  )}
                  {plan.targets.carb_target_g && (
                    <TargetRow
                      label="Carbs"
                      value={`${plan.targets.carb_target_g}g`}
                    />
                  )}
                  {plan.targets.fat_target_g && (
                    <TargetRow
                      label="Fat"
                      value={`${plan.targets.fat_target_g}g`}
                    />
                  )}
                </div>
              </Card>
            </div>

            {/* Training plan */}
            <Card>
              <button
                onClick={() => setShowTraining(!showTraining)}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Dumbbell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">
                      {plan.training.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {plan.training.estimated_duration_minutes} min
                      <Badge variant="info">RPE {plan.training.target_rpe}</Badge>
                    </div>
                  </div>
                </div>
                {showTraining ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {showTraining && (
                <div className="mt-4 space-y-4">
                  {plan.training.blocks.map((block: TrainingBlock, i: number) => (
                    <div key={i}>
                      <h4 className="mb-2 text-sm font-medium text-gray-600">
                        {block.name}
                        {block.duration_minutes && (
                          <span className="ml-2 text-xs text-gray-400">
                            ~{block.duration_minutes} min
                          </span>
                        )}
                      </h4>
                      <div className="space-y-1">
                        {block.exercises.map((ex, j) => (
                          <div
                            key={j}
                            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                          >
                            <span className="font-medium text-gray-800">
                              {ex.name}
                            </span>
                            <span className="text-gray-500">
                              {ex.sets && ex.reps
                                ? `${ex.sets} x ${ex.reps}`
                                : ex.reps ?? ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Action items */}
            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s Actions</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {plan.actions.map((action, i) => (
                  <ActionCard
                    key={i}
                    category={action.category}
                    action={action.action}
                    priority={action.priority}
                  />
                ))}
              </div>
            </Card>

            {/* Confidence + explanations */}
            {plan.explanations.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Why this plan?</CardTitle>
                    <Badge variant="info">
                      {Math.round(plan.overall_confidence * 100)}% confidence
                    </Badge>
                  </div>
                </CardHeader>
                <div className="space-y-2">
                  {plan.explanations.slice(0, 6).map((exp, i) => (
                    <div key={i} className="rounded-lg bg-gray-50 p-3 text-sm">
                      <span className="font-medium text-gray-700">
                        {exp.factor}:
                      </span>{' '}
                      <span className="text-gray-600">{exp.observation}</span>
                      <span className="text-primary-600"> — {exp.impact}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </main>

      <QuickLogModal isOpen={showLogModal} onClose={() => setShowLogModal(false)} />
      <CoachChat />
    </>
  );
}

function TargetRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
