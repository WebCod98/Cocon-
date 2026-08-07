import React, { useRef } from 'react';
import { CameraIcon, ImagePlusIcon } from 'lucide-react';
import { compressImage } from '../lib/media';

interface PhotoPickerProps {
  onPick: (dataURL: string) => void;
  captureLabel?: string;
  galleryLabel?: string;
  compact?: boolean;
}

/** Deux entrees : l'appareil photo (capture directe) et la galerie. */
export function PhotoPicker({
  onPick,
  captureLabel = 'Prendre une photo',
  galleryLabel = 'Importer depuis la galerie',
  compact = false,
}: PhotoPickerProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    onPick(await compressImage(file));
  };

  return (
    <div className={compact ? 'flex gap-2' : 'grid gap-2'}>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handle} className="hidden" />
      <input ref={galleryRef} type="file" accept="image/*" onChange={handle} className="hidden" />
      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        className={`flex flex-1 items-center justify-center gap-2 rounded-3xl bg-night font-semibold text-paper ${
          compact ? 'py-2.5 text-xs' : 'py-4 text-sm'
        }`}>
        <CameraIcon size={compact ? 14 : 17} aria-hidden="true" />
        {captureLabel}
      </button>
      <button
        type="button"
        onClick={() => galleryRef.current?.click()}
        className={`flex flex-1 items-center justify-center gap-2 rounded-3xl border border-ice bg-frost font-semibold text-ink ${
          compact ? 'py-2.5 text-xs' : 'py-4 text-sm'
        }`}>
        <ImagePlusIcon size={compact ? 14 : 17} aria-hidden="true" />
        {galleryLabel}
      </button>
    </div>
  );
}
