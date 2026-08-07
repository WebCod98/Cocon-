import { useEffect, useRef, useState } from 'react';
import { MicIcon, SquareIcon, Trash2Icon } from 'lucide-react';
import { blobToDataURL, supportsRecording } from '../lib/media';

interface VoiceRecorderProps {
  value?: string;
  onChange: (dataURL: string | undefined) => void;
  maxSeconds?: number;
  label?: string;
}

/** Enregistreur de note vocale : rituels du soir, lettres et mimes audio. */
export function VoiceRecorder({
  value,
  onChange,
  maxSeconds = 45,
  label = 'Ajouter un vocal',
}: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const ticker = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (ticker.current) window.clearInterval(ticker.current);
      recorder.current?.stream.getTracks().forEach((track) => track.stop());
    },
    []
  );

  const stop = () => {
    recorder.current?.stop();
    setRecording(false);
    if (ticker.current) window.clearInterval(ticker.current);
  };

  const start = async () => {
    if (!supportsRecording()) {
      setError('Votre navigateur ne permet pas l’enregistrement audio.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const instance = new MediaRecorder(stream);
      chunks.current = [];
      instance.ondataavailable = (event) => chunks.current.push(event.data);
      instance.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks.current, { type: instance.mimeType || 'audio/webm' });
        onChange(await blobToDataURL(blob));
      };
      instance.start();
      recorder.current = instance;
      setRecording(true);
      setSeconds(0);
      setError(null);
      ticker.current = window.setInterval(() => {
        setSeconds((current) => {
          if (current + 1 >= maxSeconds) stop();
          return current + 1;
        });
      }, 1000);
    } catch {
      setError('Micro refusé. Vous pouvez écrire votre message à la place.');
    }
  };

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-3xl border border-ice bg-frost p-2.5">
        <audio controls src={value} className="h-9 flex-1" />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          aria-label="Supprimer le vocal"
          className="rounded-full border border-ice bg-cream p-2 text-muted">
          <Trash2Icon size={15} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={recording ? stop : start}
        className={`flex w-full items-center justify-center gap-2 rounded-3xl border py-3 text-sm font-semibold transition-colors ${
          recording ? 'border-coral bg-coral text-paper' : 'border-ice bg-frost text-ink'
        }`}>
        {recording ? <SquareIcon size={15} aria-hidden="true" /> : <MicIcon size={15} aria-hidden="true" />}
        {recording ? `Enregistrement… ${seconds} s (appuyer pour arrêter)` : label}
      </button>
      {error && <p className="mt-1.5 text-[11px] text-coral">{error}</p>}
    </div>
  );
}
