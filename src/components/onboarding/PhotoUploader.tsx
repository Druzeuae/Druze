import { useRef } from "react";
import { Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
}

export function PhotoUploader({ photos, onChange, max = 6 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files)
      .slice(0, max - photos.length)
      .map((f) => URL.createObjectURL(f));
    onChange([...photos, ...urls]);
  };

  const removeAt = (idx: number) => onChange(photos.filter((_, i) => i !== idx));

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {Array.from({ length: max }).map((_, idx) => {
        const photo = photos[idx];
        if (photo) {
          return (
            <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
              <img src={photo} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
              {idx === 0 && (
                <span className="absolute start-1 top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Main
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute end-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        }
        return (
          <button
            key={idx}
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
              idx === 0 && "border-primary-300 text-primary-400"
            )}
          >
            <Camera className="h-5 w-5" />
            <span className="text-[10px] font-medium">Add</span>
          </button>
        );
      })}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
