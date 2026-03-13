import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface ImageUploadProps {
  bucket: "listings" | "avatars";
  maxFiles?: number;
  onUpload: (urls: string[]) => void;
  existingUrls?: string[];
  className?: string;
  label?: string;
  circular?: boolean;
}

const ImageUpload = ({ bucket, maxFiles = 5, onUpload, existingUrls = [], className = "", label = "Upload Photos", circular = false }: ImageUploadProps) => {
  const { user } = useAuth();
  const [previews, setPreviews] = useState<string[]>(existingUrls);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = useCallback(async (files: File[]) => {
    if (!user) return;
    const remaining = maxFiles - previews.length;
    const toUpload = files.slice(0, remaining);
    if (toUpload.length === 0) return;

    setUploading(true);
    setProgress(0);
    const newUrls: string[] = [];

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) {
        console.error("Upload error:", error);
        continue;
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
      setProgress(Math.round(((i + 1) / toUpload.length) * 100));
    }

    const updated = [...previews, ...newUrls];
    setPreviews(updated);
    onUpload(updated);
    setUploading(false);
    setProgress(0);
  }, [user, bucket, maxFiles, previews, onUpload]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) uploadFiles(Array.from(e.dataTransfer.files));
  };

  const removeImage = (idx: number) => {
    const updated = previews.filter((_, i) => i !== idx);
    setPreviews(updated);
    onUpload(updated);
  };

  if (circular) {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 rounded-full border-2 border-dashed border-input hover:border-primary/50 cursor-pointer overflow-hidden flex items-center justify-center bg-background transition-all relative"
        >
          {previews.length > 0 ? (
            <img src={previews[0]} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">📷</span>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-xs font-bold">{progress}%</span>
            </div>
          )}
        </div>
        <button type="button" onClick={() => inputRef.current?.click()} className="text-xs text-primary font-semibold hover:underline">
          {previews.length > 0 ? "Change Photo" : "Upload Photo"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFiles} className="hidden" />
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-xs font-semibold mb-1.5">{label} ({previews.length}/{maxFiles})</label>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => previews.length < maxFiles && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
          dragOver ? "border-primary bg-primary/5" : "border-input hover:border-primary/30"
        } ${previews.length >= maxFiles ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-full max-w-[200px] h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">Uploading… {progress}%</span>
          </div>
        ) : (
          <div className="text-muted-foreground">
            <span className="text-2xl block mb-1">📁</span>
            <span className="text-xs">Drag & drop or click to browse</span>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />

      {previews.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {previews.map((url, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
