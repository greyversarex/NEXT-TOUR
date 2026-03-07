import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";

const PARTICLE_COUNT = 60;

function useParticles() {
  return useRef(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      drift: (Math.random() - 0.5) * 30,
    }))
  ).current;
}

function useTypingEffect(text: string, started: boolean, speed = 45) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!started || !text) return;
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, started, speed]);
  return displayed;
}

export default function IntroScreen() {
  const { t, lang } = useI18n();
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const particles = useParticles();
  const DURATION = 4000;

  const { data: intro } = useQuery({
    queryKey: ["/api/intro-screen"],
    queryFn: async () => {
      const res = await fetch("/api/intro-screen");
      if (!res.ok) return null;
      return res.json();
    },
  });

  useEffect(() => {
    const shown = sessionStorage.getItem("intro_shown");
    if (!shown && intro?.isActive) {
      setVisible(true);
      const t1 = setTimeout(() => setPhase(1), 200);
      const t2 = setTimeout(() => setPhase(2), 900);
      const t3 = setTimeout(() => setPhase(3), 1600);
      const start = Date.now();
      const raf = requestAnimationFrame(function tick() {
        const elapsed = Date.now() - start;
        setProgress(Math.min(elapsed / DURATION, 1));
        if (elapsed < DURATION) requestAnimationFrame(tick);
      });
      const hide = setTimeout(() => {
        setHiding(true);
        setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem("intro_shown", "1");
        }, 900);
      }, DURATION);
      return () => {
        clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
        clearTimeout(hide); cancelAnimationFrame(raf);
      };
    }
  }, [intro]);

  const title = intro ? (lang === "ru" ? intro.titleRu : intro.titleEn) : "TravelPro";
  const slogan = intro
    ? (lang === "ru" ? intro.sloganRu : intro.sloganEn)
    : t("Открой мир путешествий", "Discover the World");

  const typedSlogan = useTypingEffect(slogan, phase >= 3, 40);

  if (!visible) return null;

  const hasMedia = !!intro?.videoUrl;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        opacity: hiding ? 0 : 1,
        transition: "opacity 0.9s cubic-bezier(0.4,0,0.2,1)",
        background: hasMedia
          ? "#000"
          : "linear-gradient(135deg, #020d1f 0%, #0b1f3a 45%, #0d2847 70%, #051020 100%)",
        overflow: "hidden",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}
    >
      {hasMedia ? (
        intro!.videoUrl!.toLowerCase().endsWith(".gif") ? (
          <img
            src={intro!.videoUrl!}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <video
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            autoPlay muted loop playsInline src={intro!.videoUrl!}
          />
        )
      ) : null}

      {/* Dark overlay for text readability — only when media is present */}
      {hasMedia && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.52)", zIndex: 1 }} />
      )}

      {/* Stars and glow orbs — only without media */}
      {!hasMedia && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {particles.map(p => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: "50%",
                background: p.size > 2 ? "#60a5fa" : "#ffffff",
                opacity: p.opacity,
                animation: `float-star ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
                boxShadow: p.size > 1.8 ? `0 0 ${p.size * 3}px ${p.size}px rgba(96,165,250,0.4)` : "none",
              }}
            />
          ))}
          <div style={{
            position: "absolute", top: "15%", right: "12%",
            width: 180, height: 180, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
            animation: "pulse-glow 4s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: "20%", left: "8%",
            width: 120, height: 120, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
            animation: "pulse-glow 5s 1s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 65%)",
          }} />
        </div>
      )}

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 24px", maxWidth: 680 }}>

        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 32,
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? "scale(1) translateY(0)" : "scale(0.6) translateY(20px)",
            transition: "opacity 0.8s cubic-bezier(0.34,1.56,0.64,1), transform 0.8s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <div style={{ position: "relative" }}>
            <div style={{
              width: 88, height: 88, borderRadius: "50%",
              background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(59,130,246,0.5), 0 0 80px rgba(59,130,246,0.2)",
              animation: "logo-spin 20s linear infinite",
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div style={{
              position: "absolute", inset: -8, borderRadius: "50%",
              border: "1.5px solid rgba(96,165,250,0.4)",
              animation: "ring-pulse 2s ease-in-out infinite",
            }} />
            <div style={{
              position: "absolute", inset: -18, borderRadius: "50%",
              border: "1px solid rgba(96,165,250,0.2)",
              animation: "ring-pulse 2s 0.5s ease-in-out infinite",
            }} />
          </div>
        </div>

        <div
          style={{
            fontSize: "clamp(2.8rem, 8vw, 5rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: 16,
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <span style={{
            background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 50%, #60a5fa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            {title}
          </span>
        </div>

        <div
          style={{
            height: 2, width: phase >= 2 ? "100%" : "0%",
            background: "linear-gradient(90deg, transparent, #3b82f6, #60a5fa, #3b82f6, transparent)",
            margin: "0 auto 24px",
            transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
            borderRadius: 2,
          }}
        />

        <div
          style={{
            fontSize: "clamp(1rem, 3vw, 1.35rem)",
            color: "rgba(219,234,254,0.88)",
            fontWeight: 300,
            letterSpacing: "0.08em",
            minHeight: "2em",
            opacity: phase >= 3 ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          {typedSlogan}
          {phase >= 3 && typedSlogan.length < slogan.length && (
            <span style={{
              display: "inline-block", width: 2, height: "1em",
              background: "#60a5fa", marginLeft: 2,
              animation: "cursor-blink 0.7s step-end infinite", verticalAlign: "text-bottom",
            }} />
          )}
        </div>

        <div style={{ marginTop: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#3b82f6",
              animation: `dot-bounce 1.4s ${i * 0.2}s ease-in-out infinite`,
              opacity: 0.7,
            }} />
          ))}
        </div>
      </div>

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 3, zIndex: 11,
        background: "rgba(255,255,255,0.08)",
      }}>
        <div style={{
          height: "100%",
          width: `${progress * 100}%`,
          background: "linear-gradient(90deg, #1d4ed8, #3b82f6, #60a5fa)",
          boxShadow: "0 0 12px rgba(96,165,250,0.8)",
          transition: "width 0.1s linear",
          borderRadius: "0 2px 2px 0",
        }} />
      </div>

      <style>{`
        @keyframes float-star {
          from { transform: translateY(0px) translateX(0px); }
          to { transform: translateY(-20px) translateX(var(--drift, 15px)); }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes logo-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ring-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.12); opacity: 0.5; }
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
