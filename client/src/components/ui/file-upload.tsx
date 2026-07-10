import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, FileText, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  value: string;
  fileName?: string;
  onChange: (url: string, name?: string) => void;
  accept?: string;
  className?: string;
}

export function FileUpload({
  value,
  fileName,
  onChange,
  accept = ".pdf,.doc,.docx,.xls,.xlsx",
  className,
}: FileUploadProps) {
  const { toast } = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) {
        if (res.status === 413) throw new Error("Файл слишком большой.");
        if (res.status === 401) throw new Error("Необходимо войти в систему.");
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Не удалось загрузить файл");
      }
      const { url, name } = await res.json();
      onChange(url, name || file.name);
    } catch (err: any) {
      toast({ title: "Ошибка загрузки", description: err.message || "Не удалось загрузить файл", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => ref.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Загрузка..." : value ? "Заменить файл" : "Загрузить файл"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-destructive" onClick={() => onChange("", "")}>
            <X className="h-4 w-4" /> Убрать
          </Button>
        )}
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
      {value ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline break-all"
        >
          <FileText className="h-4 w-4 shrink-0" />
          <span>{fileName || value.split("/").pop()}</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
        </a>
      ) : (
        <p className="text-xs text-muted-foreground">Файл не загружен. Поддерживаются PDF, Word, Excel.</p>
      )}
    </div>
  );
}
