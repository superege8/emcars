import { useRef, useState } from "react";
import { CarImage } from "../types";
import { api } from "../api/client";

interface Props {
  carId: string;
  images: CarImage[];
  onChange: (images: CarImage[]) => void;
}

export default function ImageUploader({ carId, images, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    setError("");
    setProgress(`Uploader ${files.length} billede(r)...`);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("images", f));
      const res = await api.upload<{ images: CarImage[] }>(`/admin/cars/${carId}/images`, form);
      onChange([...images, ...res.images].sort((a, b) => a.order - b.order));
    } catch (e: any) {
      setError(e.message || "Upload fejlede.");
    } finally {
      setUploading(false);
      setProgress("");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removeImage(id: string) {
    if (!confirm("Slet dette billede?")) return;
    await api.del(`/admin/cars/${carId}/images/${id}`);
    onChange(images.filter((i) => i.id !== id));
  }

  async function persistOrder(newOrder: CarImage[]) {
    onChange(newOrder);
    await api.put(`/admin/cars/${carId}/images/order`, { order: newOrder.map((i) => i.id) });
  }

  function onDrop(index: number) {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(null);
    persistOrder(next);
  }

  return (
    <div>
      <div
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/20 bg-white p-8 text-center cursor-pointer hover:border-accent transition"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <p className="text-sm text-ink/60">Træk billeder hertil, eller klik for at vælge filer</p>
        <p className="text-xs text-ink/40 mt-1">JPEG, PNG, WEBP – flere billeder på én gang</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {uploading && <p className="mt-2 text-sm text-accent">{progress}</p>}
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(index)}
              className="relative group rounded-lg overflow-hidden ring-1 ring-ink/10 bg-ink/5 aspect-square cursor-move"
            >
              <img src={img.url} className="h-full w-full object-cover" alt="" />
              {index === 0 && (
                <span className="absolute top-1 left-1 rounded bg-ink/80 text-cream text-[10px] px-1.5 py-0.5">
                  Hovedbillede
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 rounded-full bg-rose-600 text-white text-xs w-6 h-6 opacity-0 group-hover:opacity-100 transition"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-ink/40">Træk i billederne for at ændre rækkefølge. Det første billede bruges som hovedbillede.</p>
    </div>
  );
}
