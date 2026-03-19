import { useRef, useCallback, useEffect } from "react";
import { Label } from "@/components/ui/label";

interface ImagePositionPickerProps {
  src: string;
  value: string;
  onChange: (v: string) => void;
  label?: string;
  hint?: string;
  height?: number;
}

export function ImagePositionPicker({ src, value, onChange, label, hint, height = 200 }: ImagePositionPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPct = useRef({ x: 50, y: 50 });

  const parsePos = (v: string) => {
    const parts = v.split(" ");
    return { x: parseFloat(parts[0]) || 50, y: parseFloat(parts[1]) || 50 };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPct.current = parsePos(value);
    e.preventDefault();
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = e.clientX - startMouse.current.x;
    const dy = e.clientY - startMouse.current.y;
    const newX = Math.max(0, Math.min(100, startPct.current.x - (dx / rect.width) * 100));
    const newY = Math.max(0, Math.min(100, startPct.current.y - (dy / rect.height) * 100));
    onChange(`${Math.round(newX)}% ${Math.round(newY)}%`);
  }, [onChange]);

  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const { x, y } = parsePos(value);

  return (
    <div>
      {label && <Label>{label}</Label>}
      {hint && <p className="text-xs text-muted-foreground mt-0.5 mb-2">{hint}</p>}
      <div
        ref={containerRef}
        className="relative w-full rounded-lg overflow-hidden border-2 border-primary/40 select-none cursor-grab active:cursor-grabbing"
        style={{
          height,
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: value,
          backgroundRepeat: "no-repeat",
        }}
        onMouseDown={onMouseDown}
      >
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-8 h-8 relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/80 -translate-x-1/2 shadow-[0_0_3px_rgba(0,0,0,0.8)]" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/80 -translate-y-1/2 shadow-[0_0_3px_rgba(0,0,0,0.8)]" />
            <div className="absolute inset-1 rounded-full border-2 border-white/80 shadow-[0_0_3px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
        <div className="absolute top-2 left-2 bg-black/50 text-white text-[11px] px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
          Тяните для настройки позиции
        </div>
        <div className="absolute bottom-2 right-2 font-mono text-[10px] text-white/80 bg-black/40 px-1.5 py-0.5 rounded pointer-events-none">
          {Math.round(x)}% {Math.round(y)}%
        </div>
      </div>
    </div>
  );
}
