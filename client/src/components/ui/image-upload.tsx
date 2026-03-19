import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, ZoomIn } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
}

function isVideo(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

export function ImageUpload({ value, onChange, placeholder = "https://...", className }: ImageUploadProps) {
  const { toast } = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      onChange(url);
    } catch {
      toast({ title: "Ошибка загрузки", description: "Не удалось загрузить файл", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-8"
          />
          {value && (
            <button type="button" onClick={() => onChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => ref.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "..." : "Загрузить"}
        </Button>
        <input
          ref={ref}
          type="file"
          accept="image/*,video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {value && (
          isVideo(value) ? (
            <video
              src={value}
              className="h-10 w-14 object-cover rounded border border-border shrink-0"
              muted
              playsInline
            />
          ) : (
            <div
              className="relative h-10 w-14 shrink-0 group cursor-pointer"
              onClick={() => setLightbox(true)}
              title="Нажмите для просмотра"
            >
              <img
                src={value}
                alt=""
                className="h-10 w-14 object-cover rounded border border-border"
                onError={e => (e.currentTarget.style.display = "none")}
              />
              <div className="absolute inset-0 rounded bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )
        )}
      </div>

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-w-3xl p-2 bg-black border-0">
          <img
            src={value}
            alt=""
            className="w-full max-h-[80vh] object-contain rounded"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
