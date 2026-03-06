import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";

export default function IntroScreen() {
  const { t, lang } = useI18n();
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);

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
      const timer = setTimeout(() => {
        setHiding(true);
        setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem("intro_shown", "1");
        }, 800);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [intro]);

  if (!visible) return null;

  const title = intro ? (lang === "ru" ? intro.titleRu : intro.titleEn) : "TravelPro";
  const slogan = intro ? (lang === "ru" ? intro.sloganRu : intro.sloganEn) : t("Открой мир путешествий", "Discover the World");

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-800 ${hiding ? "opacity-0" : "opacity-100"}`}
      style={{ transition: "opacity 0.8s ease" }}
    >
      {intro?.videoUrl ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay muted loop playsInline
          src={intro.videoUrl}
        />
      ) : (
        <img
          src="/images/hero-banner.png"
          alt="intro"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 text-center text-white px-4">
        <div className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
          ✈ {title}
        </div>
        <p className="text-xl md:text-2xl font-light opacity-90 tracking-wide">{slogan}</p>
        <div className="mt-8 flex justify-center">
          <div className="w-12 h-1 bg-white/60 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
