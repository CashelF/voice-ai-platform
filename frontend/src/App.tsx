import { CallSelector } from './components/CallSelector.tsx';
import { HeatmapChart } from './components/HeatmapChart.tsx';
import { MetricsSummary } from './components/MetricsSummary.tsx';
import { AudioPlayer } from './components/AudioPlayer.tsx';
import { useSentiment } from './context/SentimentContext.tsx';

export default function App() {
  const { state } = useSentiment();
  const timeline = state.data?.timeline ?? [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-72 border-r border-slate-800 p-6 space-y-6 bg-slate-900/40">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Voice AI Sentiment Explorer</h1>
          <p className="mt-1 text-sm text-slate-400">
            Select a call to explore the sentiment journey alongside the audio timeline.
          </p>
        </div>
        <CallSelector />
        <div className="text-sm text-slate-400">
          {state.loading && <p>Loading timeline…</p>}
          {state.error && <p className="text-sentiment-negative">{state.error}</p>}
          {!state.loading && !state.error && !state.data && <p>Select a call to begin.</p>}
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <section className="flex-1 overflow-y-auto p-6 space-y-6">
          <MetricsSummary timeline={timeline} />
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Sentiment Heatmap</h2>
                <p className="text-sm text-slate-400">
                  Hover to inspect each segment and click to jump the audio playback.
                </p>
              </div>
              {state.data?.duration && (
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Duration: {formatDuration(state.data.duration)}
                </span>
              )}
            </div>
            <div className="mt-6 h-72">
              <HeatmapChart timeline={timeline} />
            </div>
          </div>
        </section>
        <footer className="border-t border-slate-800 bg-slate-900/60 p-4">
          <AudioPlayer />
        </footer>
      </main>
    </div>
  );
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
