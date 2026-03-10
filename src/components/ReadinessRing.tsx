'use client';

interface ReadinessRingProps {
  score: number; // 0-100
  level: string;
  size?: number;
}

const levelColors: Record<string, string> = {
  high: '#22c55e',
  moderate: '#f59e0b',
  low: '#ef4444',
  rest: '#6b7280',
};

export function ReadinessRing({ score, level, size = 120 }: ReadinessRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = levelColors[level] ?? '#6b7280';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{Math.round(score)}</span>
          <span className="text-xs text-gray-500">readiness</span>
        </div>
      </div>
      <span
        className="rounded-full px-3 py-1 text-xs font-medium capitalize"
        style={{
          backgroundColor: color + '20',
          color,
        }}
      >
        {level}
      </span>
    </div>
  );
}
