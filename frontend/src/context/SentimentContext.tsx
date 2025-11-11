import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  type ReactNode
} from 'react';

export interface SentimentScores {
  positive: number;
  neutral: number;
  negative: number;
}

export interface SentimentSegment {
  start: number;
  end: number;
  sentiment: SentimentScores;
  label?: string;
}

export interface SentimentResponse {
  callId: string;
  audioUrl: string;
  duration: number;
  timeline: SentimentSegment[];
}

type SentimentState = {
  callId?: string;
  data?: SentimentResponse;
  loading: boolean;
  error?: string;
};

interface SentimentContextValue {
  state: SentimentState;
  selectCall: (callId: string) => void;
  registerAudio: (el: HTMLAudioElement | null) => void;
  scrubTo: (seconds: number) => void;
}

const SentimentContext = createContext<SentimentContextValue | undefined>(undefined);

export function SentimentProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<SentimentState>({ loading: false });

  const callId = state.callId;

  useEffect(() => {
    if (!callId) {
      return;
    }

    const controller = new AbortController();
    const fetchTimeline = async () => {
      setState((prev) => ({ ...prev, loading: true, error: undefined }));
      try {
        const response = await fetch(`/sentiment/${callId}`, {
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const payload = (await response.json()) as SentimentResponse;
        setState({ callId, data: payload, loading: false });
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }
        setState((prev) => ({
          ...prev,
          loading: false,
          error: (error as Error).message || 'Failed to load sentiment timeline.'
        }));
      }
    };

    void fetchTimeline();

    return () => controller.abort();
  }, [callId]);

  const selectCall = useCallback((callId: string) => {
    setState((prev) => ({ ...prev, callId, data: undefined, error: undefined }));
  }, []);

  const registerAudio = useCallback((el: HTMLAudioElement | null) => {
    audioRef.current = el;
  }, []);

  const scrubTo = useCallback((seconds: number) => {
    if (!audioRef.current) {
      return;
    }
    const audio = audioRef.current;
    const clamped = Math.max(0, Math.min(seconds, audio.duration || seconds));
    audio.currentTime = clamped;
    void audio.play().catch(() => {
      /* ignore autoplay rejection */
    });
  }, []);

  const value = useMemo(
    () => ({
      state,
      selectCall,
      registerAudio,
      scrubTo
    }),
    [state, selectCall, registerAudio, scrubTo]
  );

  return <SentimentContext.Provider value={value}>{children}</SentimentContext.Provider>;
}

export function useSentiment() {
  const context = useContext(SentimentContext);
  if (!context) {
    throw new Error('useSentiment must be used within a SentimentProvider');
  }
  return context;
}
