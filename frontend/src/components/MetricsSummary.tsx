import type { SentimentSegment } from '../context/SentimentContext.tsx';

interface MetricsSummaryProps {
  timeline: SentimentSegment[];
}

export function MetricsSummary({ timeline }: MetricsSummaryProps) {
  const { average, highestPositive, highestNegative } = computeMetrics(timeline);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <p className="text-xs uppercase tracking-wide text-slate-400">Average sentiment</p>
        <div className="mt-3 flex gap-4 text-sm">
          <MetricPill label="Positive" value={average.positive} className="text-sentiment-positive" />
          <MetricPill label="Neutral" value={average.neutral} className="text-sentiment-neutral" />
          <MetricPill label="Negative" value={average.negative} className="text-sentiment-negative" />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <p className="text-xs uppercase tracking-wide text-slate-400">Most positive span</p>
        {highestPositive ? (
          <div className="mt-3 text-sm text-slate-200">
            <p className="font-semibold">{formatRange(highestPositive.start, highestPositive.end)}</p>
            <p className="text-slate-400">Positive score {(highestPositive.sentiment.positive * 100).toFixed(1)}%</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Select a call to populate metrics.</p>
        )}
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <p className="text-xs uppercase tracking-wide text-slate-400">Most negative span</p>
        {highestNegative ? (
          <div className="mt-3 text-sm text-slate-200">
            <p className="font-semibold">{formatRange(highestNegative.start, highestNegative.end)}</p>
            <p className="text-slate-400">Negative score {(highestNegative.sentiment.negative * 100).toFixed(1)}%</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Select a call to populate metrics.</p>
        )}
      </div>
    </div>
  );
}

function MetricPill({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className={`flex flex-col rounded-lg bg-slate-900/70 px-3 py-2 ${className}`}>
      <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-base font-semibold text-slate-100">{(value * 100).toFixed(1)}%</span>
    </div>
  );
}

function computeMetrics(timeline: SentimentSegment[]) {
  if (!timeline.length) {
    return {
      average: { positive: 0, neutral: 0, negative: 0 },
      highestPositive: undefined as SentimentSegment | undefined,
      highestNegative: undefined as SentimentSegment | undefined
    };
  }

  const totals = timeline.reduce(
    (acc, segment) => {
      const weight = Math.max(segment.end - segment.start, 0.1);
      acc.duration += weight;
      acc.positive += segment.sentiment.positive * weight;
      acc.neutral += segment.sentiment.neutral * weight;
      acc.negative += segment.sentiment.negative * weight;
      return acc;
    },
    { duration: 0, positive: 0, neutral: 0, negative: 0 }
  );

  const average = {
    positive: totals.duration ? totals.positive / totals.duration : 0,
    neutral: totals.duration ? totals.neutral / totals.duration : 0,
    negative: totals.duration ? totals.negative / totals.duration : 0
  };

  const highestPositive = [...timeline].sort((a, b) => b.sentiment.positive - a.sentiment.positive)[0];
  const highestNegative = [...timeline].sort((a, b) => b.sentiment.negative - a.sentiment.negative)[0];

  return { average, highestPositive, highestNegative };
}

function formatRange(start: number, end: number) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
