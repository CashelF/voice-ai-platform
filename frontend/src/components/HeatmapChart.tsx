import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import type { SentimentSegment } from '../context/SentimentContext.tsx';
import { useMemo } from 'react';
import { useSentiment } from '../context/SentimentContext.tsx';

interface HeatmapChartProps {
  timeline: SentimentSegment[];
}

interface ChartRow {
  label: string;
  start: number;
  end: number;
  positive: number;
  neutral: number;
  negative: number;
}

const sentimentOrder = ['positive', 'neutral', 'negative'] as const;

export function HeatmapChart({ timeline }: HeatmapChartProps) {
  const { scrubTo } = useSentiment();
  const rows = useMemo<ChartRow[]>(() => {
    if (!timeline.length) {
      return [];
    }

    return timeline.map((segment) => ({
      label: formatTime(segment.start),
      start: segment.start,
      end: segment.end,
      positive: Math.round(segment.sentiment.positive * 100),
      neutral: Math.round(segment.sentiment.neutral * 100),
      negative: Math.round(segment.sentiment.negative * 100)
    }));
  }, [timeline]);

  if (!rows.length) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-700 text-sm text-slate-400">
        Select a call to visualise its sentiment timeline.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} stackOffset="expand" margin={{ top: 10, left: -24, right: 0 }}>
        <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.25)" strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fill: '#cbd5f5', fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis hide />
        <Tooltip content={<HeatmapTooltip timeline={timeline} />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
        {sentimentOrder.map((sentiment) => (
          <Bar
            key={sentiment}
            dataKey={sentiment}
            stackId="sentiment"
            radius={sentiment === 'negative' ? [0, 0, 6, 6] : sentiment === 'positive' ? [6, 6, 0, 0] : 0}
            onClick={(_, index) => {
              const target = timeline[index];
              if (target) {
                scrubTo(target.start);
              }
            }}
          >
            {rows.map((_, index) => (
              <Cell key={`${sentiment}-${index}`} fill={getSentimentColor(sentiment)} className="cursor-pointer transition hover:opacity-80" />
            ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function getSentimentColor(sentiment: (typeof sentimentOrder)[number]) {
  switch (sentiment) {
    case 'positive':
      return 'rgba(34, 197, 94, 0.9)';
    case 'neutral':
      return 'rgba(250, 204, 21, 0.85)';
    case 'negative':
      return 'rgba(239, 68, 68, 0.9)';
    default:
      return '#94a3b8';
  }
}

interface HeatmapTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartRow }>;
  label?: string;
  timeline: SentimentSegment[];
}

function HeatmapTooltip({ active, payload, label, timeline }: HeatmapTooltipProps) {
  if (!active || !payload?.length || !label) {
    return null;
  }

  const segment = timeline.find((item) => formatTime(item.start) === label);
  if (!segment) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 shadow-lg backdrop-blur">
      <p className="font-semibold text-slate-100">{formatTime(segment.start)} - {formatTime(segment.end)}</p>
      <ul className="mt-1 space-y-1">
        <li className="flex justify-between gap-4">
          <span className="text-slate-400">Positive</span>
          <span className="text-sentiment-positive font-medium">{(segment.sentiment.positive * 100).toFixed(1)}%</span>
        </li>
        <li className="flex justify-between gap-4">
          <span className="text-slate-400">Neutral</span>
          <span className="text-sentiment-neutral font-medium">{(segment.sentiment.neutral * 100).toFixed(1)}%</span>
        </li>
        <li className="flex justify-between gap-4">
          <span className="text-slate-400">Negative</span>
          <span className="text-sentiment-negative font-medium">{(segment.sentiment.negative * 100).toFixed(1)}%</span>
        </li>
      </ul>
    </div>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
