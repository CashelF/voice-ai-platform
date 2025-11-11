import { FormEvent, useMemo, useState } from 'react';
import { useSentiment } from '../context/SentimentContext.tsx';

const SUGGESTED_CALLS = ['call-001', 'call-002', 'call-003'];

export function CallSelector() {
  const { state, selectCall } = useSentiment();
  const [callId, setCallId] = useState(state.callId ?? '');

  const options = useMemo(() => Array.from(new Set(SUGGESTED_CALLS)), []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!callId) {
      return;
    }
    selectCall(callId.trim());
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-slate-200" htmlFor="callId">
        Call identifier
      </label>
      <select
        id="callId"
        value={options.includes(callId) ? callId : ''}
        onChange={(event) => setCallId(event.target.value)}
        className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
      >
        <option value="" disabled>
          Select a recent call
        </option>
        {options.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={callId}
          onChange={(event) => setCallId(event.target.value)}
          placeholder="Or paste a call ID"
          className="flex-1 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!callId || state.loading}
        >
          {state.loading ? 'Loading…' : 'Load'}
        </button>
      </div>
    </form>
  );
}
