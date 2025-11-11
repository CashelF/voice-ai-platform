import { useEffect, useRef } from 'react';
import { useSentiment } from '../context/SentimentContext.tsx';

export function AudioPlayer() {
  const { state, registerAudio } = useSentiment();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    registerAudio(audioRef.current);
    return () => registerAudio(null);
  }, [registerAudio]);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    const audioElement = audioRef.current;
    if (state.data?.audioUrl) {
      audioElement.src = state.data.audioUrl;
      audioElement.load();
    } else {
      audioElement.removeAttribute('src');
    }
  }, [state.data?.audioUrl]);

  return (
    <div className="flex items-center gap-4">
      <audio
        ref={audioRef}
        controls
        className="w-full max-w-3xl"
        preload="metadata"
      >
        Your browser does not support the audio element.
      </audio>
      {state.data?.callId && (
        <span className="text-xs uppercase tracking-wide text-slate-400">{state.data.callId}</span>
      )}
    </div>
  );
}
