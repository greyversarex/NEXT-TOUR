import { useState } from "react";
import { Send, X, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-center gap-3">

      {/* Telegram */}
      <a
        href="https://t.me/+992885260101"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="floating-telegram"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(16px) scale(0.7)",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s cubic-bezier(0.34,1.56,0.64,1), transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          transitionDelay: open ? "60ms" : "0ms",
        }}
        className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#229ED9] shadow-[0_4px_20px_rgba(34,158,217,0.5)] hover:shadow-[0_6px_28px_rgba(34,158,217,0.65)] hover:scale-110 transition-transform duration-150"
      >
        <Send size={20} className="text-white" />
        {/* Label */}
        <span className="absolute right-14 whitespace-nowrap bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
          Telegram
        </span>
      </a>

      {/* WhatsApp */}
      <a
        href="https://wa.me/992885260101"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="floating-whatsapp"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(16px) scale(0.7)",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s cubic-bezier(0.34,1.56,0.64,1), transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          transitionDelay: open ? "0ms" : "40ms",
        }}
        className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] shadow-[0_4px_20px_rgba(37,211,102,0.5)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.65)] hover:scale-110 transition-transform duration-150"
      >
        <FaWhatsapp size={22} className="text-white" />
        {/* Label */}
        <span className="absolute right-14 whitespace-nowrap bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
          WhatsApp
        </span>
      </a>

      {/* Main toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        data-testid="floating-contact-toggle"
        className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-[0_6px_28px_rgba(59,130,246,0.55)] hover:shadow-[0_8px_36px_rgba(59,130,246,0.7)] transition-all duration-200 hover:scale-105 active:scale-95 outline-none"
        style={{ background: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)" }}
        aria-label="Связаться с нами"
      >
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping bg-blue-400/40" />
        )}
        <span
          style={{
            transform: open ? "rotate(90deg) scale(1)" : "rotate(0deg) scale(1)",
            transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            display: "flex",
          }}
        >
          {open
            ? <X size={22} className="text-white" />
            : <MessageCircle size={22} className="text-white" />
          }
        </span>
      </button>
    </div>
  );
}
