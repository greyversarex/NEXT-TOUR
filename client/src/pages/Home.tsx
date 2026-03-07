import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import TourCard from "@/components/TourCard";
import { useI18n } from "@/lib/i18n";
import {
  Search, Star, ChevronLeft, ChevronRight, MapPin, Clock,
  Users, ArrowRight, Quote, Flame, ChevronDown,
  Award, Globe, Shield, Gem, ThumbsUp, TrendingUp
} from "lucide-react";
import type { Tour } from "@shared/schema";

const DESTINATIONS = [
  {
    id: "maldives",
    nameRu: "Мальдивы",
    nameEn: "Maldives",
    image: "/images/tour-maldives.png",
    tagsRu: ["Пляжи", "Острова", "Кораллы"],
    tagsEn: ["Beaches", "Islands", "Corals"],
    country: "MV",
  },
  {
    id: "japan",
    nameRu: "Япония",
    nameEn: "Japan",
    image: "/images/tour-tokyo.png",
    tagsRu: ["Культура", "Сакура", "Кухня"],
    tagsEn: ["Culture", "Cherry Blossoms", "Cuisine"],
    country: "JP",
  },
  {
    id: "italy",
    nameRu: "Италия",
    nameEn: "Italy",
    image: "/images/dest-italy.jpg",
    tagsRu: ["История", "Море", "Гастрономия"],
    tagsEn: ["History", "Sea", "Gastronomy"],
    country: "IT",
  },
  {
    id: "turkey",
    nameRu: "Турция",
    nameEn: "Turkey",
    image: "/images/dest-turkey.jpg",
    tagsRu: ["Пейзажи", "Культура", "Природа"],
    tagsEn: ["Landscapes", "Culture", "Nature"],
    country: "TR",
  },
  {
    id: "greece",
    nameRu: "Греция",
    nameEn: "Greece",
    image: "/images/tour-santorini.png",
    tagsRu: ["Острова", "Архитектура", "Закаты"],
    tagsEn: ["Islands", "Architecture", "Sunsets"],
    country: "GR",
  },
  {
    id: "uae",
    nameRu: "ОАЭ",
    nameEn: "UAE",
    image: "/images/dest-uae.jpg",
    tagsRu: ["Роскошь", "Небоскрёбы", "Пустыня"],
    tagsEn: ["Luxury", "Skyscrapers", "Desert"],
    country: "AE",
  },
];

const STATS = [
  {
    Icon: Users,
    color: "from-blue-500 to-cyan-400",
    bgLight: "from-blue-50 to-cyan-50",
    valueRu: "50 000+", valueEn: "50,000+",
    labelRu: "Довольных клиентов", labelEn: "Happy Clients",
  },
  {
    Icon: Globe,
    color: "from-emerald-500 to-teal-400",
    bgLight: "from-emerald-50 to-teal-50",
    valueRu: "120+", valueEn: "120+",
    labelRu: "Направлений", labelEn: "Destinations",
  },
  {
    Icon: Award,
    color: "from-violet-500 to-purple-400",
    bgLight: "from-violet-50 to-purple-50",
    valueRu: "15 лет", valueEn: "15 Years",
    labelRu: "На рынке", labelEn: "Of Experience",
  },
  {
    Icon: Star,
    color: "from-amber-500 to-yellow-400",
    bgLight: "from-amber-50 to-yellow-50",
    valueRu: "4.9 ★", valueEn: "4.9 ★",
    labelRu: "Средняя оценка", labelEn: "Average Rating",
  },
];

function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.08, rootMargin: "0px 0px -48px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translateY(${y}px)`,
        transition: `opacity 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function CinematicHero() {
  const { t, lang } = useI18n();
  const [, setLocation] = useLocation();
  const [current, setCurrent] = useState(0);
  const [destination, setDestination] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [travelersOpen, setTravelersOpen] = useState(false);
  const { data: slides = [] } = useQuery<any[]>({ queryKey: ["/api/hero-slides?active=true"] });

  const heroImages = slides.length > 0
    ? slides.map((s: any) => s.mediaUrl)
    : ["/images/hero-banner.png", "/images/tour-maldives.png", "/images/tour-bali.png"];

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % heroImages.length), 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set("search", destination.trim());
    setLocation(`/tours${params.toString() ? `?${params}` : ""}`);
  };

  const slide = slides[current];
  const slideTitle = slide ? (lang === "ru" ? slide.titleRu : slide.titleEn) : null;
  const slideSubtitle = slide ? (lang === "ru" ? slide.subtitleRu : slide.subtitleEn) : null;

  return (
    <section className="relative w-full h-[100svh] min-h-[640px] max-h-[960px] overflow-hidden">
      {/* Background images with Ken Burns zoom */}
      {heroImages.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{ opacity: i === current ? 1 : 0, transition: "opacity 1.4s ease" }}
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            style={{
              transform: i === current ? "scale(1.08)" : "scale(1)",
              transition: "transform 10s ease-out",
            }}
          />
        </div>
      ))}

      {/* Multi-layer cinematic gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/35" />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)"
      }} />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white pb-12">
        <div className="max-w-5xl w-full">
          <div className="hero-fade-in-up-1">
            <Badge className="mb-6 bg-white/15 backdrop-blur-md text-white border-white/30 px-5 py-2 text-sm font-semibold tracking-widest uppercase">
              ✈&nbsp; {t("Лучшие туры 2025", "Best Tours 2025")}
            </Badge>
          </div>

          <h1
            className="hero-fade-in-up-2 text-6xl sm:text-7xl md:text-8xl lg:text-[5.5rem] font-extrabold leading-[1.0] mb-6 tracking-tight"
            style={{ textShadow: "0 4px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(0,0,0,0.3)" }}
          >
            {slideTitle || t("Мир ждёт тебя", "The World Awaits")}
          </h1>

          <p className="hero-fade-in-up-3 text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            {slideSubtitle || t(
              "Незабываемые путешествия по всему миру. Премиальный сервис, лучшие цены, идеальные воспоминания.",
              "Unforgettable journeys worldwide. Premium service, best prices, perfect memories."
            )}
          </p>

          {/* Glassmorphism search bar */}
          <form onSubmit={handleSearch} className="hero-fade-in-up-4 hero-glass-glow relative max-w-3xl mx-auto">
            <div
              className="flex flex-col md:flex-row rounded-2xl overflow-hidden md:overflow-visible border border-white/25 shadow-2xl"
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
              }}
            >
              <div className="relative flex-1 border-b md:border-b-0 md:border-r border-white/20">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t("Куда хотите поехать?", "Where do you want to go?")}
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="w-full bg-transparent pl-12 pr-5 py-5 text-white placeholder:text-white/55 focus:outline-none text-base md:text-lg"
                  data-testid="input-hero-search"
                />
              </div>

              <div className="relative border-b md:border-b-0 md:border-r border-white/20">
                <button
                  type="button"
                  onClick={() => setTravelersOpen(!travelersOpen)}
                  className="flex items-center gap-2.5 px-5 py-5 text-white hover:bg-white/10 transition-colors text-base w-full md:w-auto whitespace-nowrap"
                  data-testid="button-travelers-picker"
                >
                  <Users className="h-5 w-5 text-white/60 shrink-0" />
                  <span>{travelers} {t("туристов", "travelers")}</span>
                </button>
                {travelersOpen && (
                  <div className="absolute top-full mt-3 left-0 md:left-1/2 md:-translate-x-1/2 bg-white rounded-2xl shadow-2xl p-5 z-50 min-w-[220px]">
                    <p className="text-sm font-semibold text-foreground mb-4 text-center">{t("Количество туристов", "Number of travelers")}</p>
                    <div className="flex items-center justify-center gap-5">
                      <button type="button" onClick={() => setTravelers(v => Math.max(1, v - 1))}
                        className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 hover:border-primary hover:text-primary transition-colors">−</button>
                      <span className="text-2xl font-bold text-foreground w-8 text-center">{travelers}</span>
                      <button type="button" onClick={() => setTravelers(v => Math.min(20, v + 1))}
                        className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 hover:border-primary hover:text-primary transition-colors">+</button>
                    </div>
                    <button type="button" onClick={() => setTravelersOpen(false)}
                      className="mt-4 w-full text-center text-sm text-primary font-semibold">{t("Готово", "Done")}</button>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="rounded-none md:rounded-2xl px-8 py-5 text-base font-bold h-auto shrink-0"
                data-testid="button-hero-search-submit"
              >
                <Search className="h-5 w-5 mr-2" />
                {t("Найти", "Search")}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/50 pointer-events-none"
        style={{ animation: "heroFadeInUp 1s ease 1.8s both" }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Scroll</span>
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </div>

      {/* Slide controls */}
      {heroImages.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(c => (c - 1 + heroImages.length) % heroImages.length)}
            className="absolute left-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/25 backdrop-blur-sm text-white hover:bg-black/45 transition-all hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrent(c => (c + 1) % heroImages.length)}
            className="absolute right-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/25 backdrop-blur-sm text-white hover:bg-black/45 transition-all hover:scale-110"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1 rounded-full transition-all duration-500 ${i === current ? "w-10 bg-white" : "w-3 bg-white/35 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function StatsBar() {
  const { t, lang } = useI18n();
  return (
    <div className="relative -mt-16 z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-0">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <Reveal key={i} delay={i * 80} y={16}>
            <div
              className={`group bg-gradient-to-br ${stat.bgLight} dark:from-card dark:to-card
                border border-white/80 dark:border-card-border
                rounded-2xl p-5 text-center
                shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.18)]
                hover:-translate-y-1.5 transition-all duration-300 cursor-default`}
            >
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} shadow-md mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <stat.Icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                {lang === "ru" ? stat.valueRu : stat.valueEn}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                {lang === "ru" ? stat.labelRu : stat.labelEn}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function PopularToursSection({ tours }: { tours: Tour[] }) {
  const { t } = useI18n();
  if (tours.length === 0) return null;
  return (
    <section className="pt-28 pb-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="flex items-end justify-between mb-14">
          <div>
            <p className="text-cyan-300 font-semibold text-sm uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
              <TrendingUp className="h-3.5 w-3.5" /> {t("Лучшие предложения", "Top Offers")}
            </p>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{t("Популярные туры", "Popular Tours")}</h2>
          </div>
          <Link href="/tours">
            <Button className="hidden md:flex items-center gap-2 rounded-full px-7 py-5 text-sm font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/40 backdrop-blur-sm hover:-translate-y-0.5 transition-all duration-200 shadow-lg">
              {t("Все туры", "All Tours")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {tours.slice(0, 8).map((tour, i) => (
            <Reveal key={tour.id} delay={i * 80} y={20}>
              <TourCard tour={tour} />
            </Reveal>
          ))}
        </div>
        <div className="mt-10 flex justify-center md:hidden">
          <Link href="/tours">
            <Button className="rounded-full px-8 py-5 bg-white/15 hover:bg-white/25 text-white border border-white/40 backdrop-blur-sm">
              {t("Все туры", "All Tours")} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function HotToursSection({ tours }: { tours: Tour[] }) {
  const { t } = useI18n();
  if (tours.length === 0) return null;
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="flex items-end justify-between mb-14">
          <div>
            <p className="text-orange-300 font-semibold text-sm uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
              <Flame className="h-4 w-4" /> {t("Акции", "Special Deals")}
            </p>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{t("Горящие туры", "Hot Deals")}</h2>
          </div>
          <Link href="/promotions">
            <Button className="hidden md:flex items-center gap-2 rounded-full px-7 py-5 text-sm font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/40 backdrop-blur-sm hover:-translate-y-0.5 transition-all duration-200 shadow-lg">
              {t("Все акции", "All Deals")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {tours.slice(0, 4).map((tour, i) => (
            <Reveal key={tour.id} delay={i * 90} y={20}>
              <TourCard tour={tour} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function DestinationCard({ dest, lang, aspectClass = "aspect-[3/4]" }: {
  dest: typeof DESTINATIONS[0];
  lang: string;
  aspectClass?: string;
}) {
  const name = lang === "ru" ? dest.nameRu : dest.nameEn;
  const tags = lang === "ru" ? dest.tagsRu : dest.tagsEn;
  return (
    <Link href="/tours" className="block h-full">
      <div
        className={`group relative rounded-2xl overflow-hidden cursor-pointer h-full
          ${aspectClass}
          shadow-md hover:shadow-[0_24px_64px_-10px_rgba(0,0,0,0.40)]
          hover:-translate-y-2
          transition-all duration-500 ease-out`}
        data-testid={`card-destination-${dest.id}`}
      >
        <img
          src={dest.image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.10]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: "linear-gradient(135deg, transparent 35%, rgba(255,255,255,0.07) 55%, transparent 75%)" }}
        />

        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="text-2xl drop-shadow-md">{countryFlag(dest.country)}</span>
        </div>

        <div className="absolute top-3.5 right-3.5 z-10 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 ease-out">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 z-10 translate-y-1 group-hover:translate-y-0 transition-transform duration-400 ease-out">
          <h3
            className="text-white font-extrabold leading-tight mb-2.5"
            style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}
          >
            {name}
          </h3>
          <p className="text-white/75 text-xs font-medium tracking-wide mb-2.5 group-hover:text-white/90 transition-colors duration-300">
            {tags.join(" • ")}
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-0 overflow-hidden group-hover:max-h-12 transition-all duration-400 ease-out">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="text-[11px] text-white/95 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 border border-white/25 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function DestinationsSection() {
  const { t, lang } = useI18n();
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />
      <div className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Reveal className="text-center mb-16">
        <p className="text-cyan-300 font-semibold text-sm uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
          <MapPin className="h-3.5 w-3.5" /> {t("Исследуйте", "Explore")}
        </p>
        <h2 className="text-3xl md:text-5xl font-bold mb-5 leading-tight text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{t("Направления мечты", "Dream Destinations")}</h2>
        <p className="text-white/70 max-w-xl mx-auto text-base leading-relaxed" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>
          {t("Откройте для себя самые красивые уголки планеты с нашими эксклюзивными турами", "Discover the most beautiful corners of the planet with our exclusive tours")}
        </p>
      </Reveal>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
        {DESTINATIONS.map((dest, i) => {
          let wrapClass = "";
          let aspect = "aspect-[3/4]";

          if (i === 0) {
            wrapClass = "col-span-2 md:col-span-2";
            aspect = "aspect-[4/3] md:aspect-[16/9]";
          } else if (i === DESTINATIONS.length - 1) {
            wrapClass = "col-span-2 md:col-span-3";
            aspect = "aspect-[2/1] md:aspect-[21/9]";
          }

          return (
            <Reveal key={dest.id} delay={i * 80} y={20} className={wrapClass}>
              <DestinationCard dest={dest} lang={lang} aspectClass={aspect} />
            </Reveal>
          );
        })}
      </div>
      </div>
    </section>
  );
}

function PromoBanner({ banners }: { banners: any[] }) {
  const { t, lang } = useI18n();
  const banner = banners[0];

  const content = (src: string, titleEl: React.ReactNode, subtitleEl?: React.ReactNode, linkUrl = "/promotions") => (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
      <Reveal y={16}>
        <div className="group relative rounded-3xl overflow-hidden h-72 md:h-96 shadow-2xl hover:shadow-[0_32px_80px_rgba(0,0,0,0.28)] transition-shadow duration-500 cursor-pointer">
          <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Decorative accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary/0" />

          <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between px-10 md:px-16 py-12 gap-6">
            <div className="text-white text-center md:text-left">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-5 text-xs tracking-widest uppercase px-4 py-1.5">
                🔥 {t("Специальное предложение", "Special Offer")}
              </Badge>
              <h3 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
                {titleEl}
              </h3>
              {subtitleEl && (
                <p className="text-white/75 text-sm md:text-base mt-2 max-w-md leading-relaxed">{subtitleEl}</p>
              )}
            </div>
            <Link href={linkUrl} className="shrink-0">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/95 font-bold px-10 py-6 rounded-2xl shadow-xl text-base hover:scale-105 hover:shadow-2xl transition-all duration-200"
              >
                {t("Смотреть акции", "View Offers")} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );

  if (!banner) return content(
    "/images/tour-maldives.png",
    t("Скидки до 30% на летние туры", "Up to 30% off summer tours"),
    t("Успейте забронировать по лучшим ценам сезона", "Book now at the best prices of the season")
  );

  return content(
    banner.imageUrl,
    lang === "ru" ? banner.titleRu : (banner.titleEn || banner.titleRu),
    banner.subtitleRu ? (lang === "ru" ? banner.subtitleRu : (banner.subtitleEn || banner.subtitleRu)) : undefined,
    banner.linkUrl || "/promotions"
  );
}

function ReviewsSection() {
  const { t, lang } = useI18n();
  const { data: reviews = [] } = useQuery<any[]>({ queryKey: ["/api/reviews/featured"] });
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(() => go(1), 7000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const go = (dir: number) => {
    setAnimating(true);
    setTimeout(() => {
      setIdx(i => (i + dir + reviews.length) % reviews.length);
      setAnimating(false);
    }, 200);
  };

  if (reviews.length === 0) return null;
  const rev = reviews[idx];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <p className="text-cyan-300 font-semibold text-sm uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
            <ThumbsUp className="h-3.5 w-3.5" /> {t("Отзывы", "Testimonials")}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{t("Что говорят наши клиенты", "What Our Clients Say")}</h2>
        </Reveal>

        <div className="max-w-3xl mx-auto">
          <div className={`transition-all duration-200 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            <div
              className="bg-white dark:bg-card rounded-3xl p-10 md:p-14 relative"
              style={{ boxShadow: "0 12px 60px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.9) inset" }}
            >
              {/* Large decorative quote */}
              <div className="absolute top-6 left-8 opacity-[0.07]">
                <Quote className="h-20 w-20 text-primary fill-primary" />
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-1 mb-7">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 transition-colors ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                    style={{ filter: i < rev.rating ? "drop-shadow(0 1px 4px rgba(251,191,36,0.4))" : undefined }}
                  />
                ))}
              </div>

              {/* Quote text */}
              <blockquote className="text-lg md:text-2xl text-foreground/80 italic text-center leading-relaxed mb-10 font-light relative z-10">
                "{lang === "ru" ? rev.textRu : (rev.textEn || rev.textRu)}"
              </blockquote>

              {/* Divider */}
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto mb-8" />

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{ background: "linear-gradient(135deg, hsl(210 85% 45%), hsl(200 90% 55%))" }}
                >
                  {rev.user?.name?.[0] || "?"}
                </div>
                <div className="text-left">
                  <div className="font-bold text-foreground text-base">{rev.user?.name}</div>
                  <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {lang === "ru" ? rev.tour?.titleRu : rev.tour?.titleEn}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {reviews.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => go(-1)}
                className="p-3 rounded-full border-2 border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === idx ? "w-8 bg-primary" : "w-2 bg-gray-300 hover:bg-gray-400"}`}
                  />
                ))}
              </div>
              <button
                onClick={() => go(1)}
                className="p-3 rounded-full border-2 border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function WhyUsSection() {
  const { t } = useI18n();
  const items = [
    {
      Icon: Shield,
      gradient: "from-blue-500 to-cyan-400",
      bg: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20",
      titleRu: "Надёжность",
      titleEn: "Reliability",
      descRu: "15 лет работаем на рынке, тысячи довольных клиентов по всему миру",
      descEn: "15 years in the market, thousands of happy clients worldwide",
    },
    {
      Icon: Gem,
      gradient: "from-violet-500 to-purple-400",
      bg: "from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20",
      titleRu: "Премиум сервис",
      titleEn: "Premium Service",
      descRu: "Персональный менеджер для каждого клиента, доступен 24/7",
      descEn: "Personal manager for every client, available 24/7",
    },
    {
      Icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-400",
      bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20",
      titleRu: "Лучшие цены",
      titleEn: "Best Prices",
      descRu: "Гарантируем лучшую цену на рынке или вернём разницу",
      descEn: "Best price guarantee or we refund the difference",
    },
    {
      Icon: Globe,
      gradient: "from-amber-500 to-orange-400",
      bg: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20",
      titleRu: "Любое направление",
      titleEn: "Any Destination",
      descRu: "Более 120 направлений по всему миру — найдём тур для вас",
      descEn: "Over 120 destinations worldwide — we'll find the right tour",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <p className="text-cyan-300 font-semibold text-sm uppercase tracking-widest mb-3" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>{t("Наши преимущества", "Our Advantages")}</p>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{t("Почему выбирают нас", "Why Choose Us")}</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 100} y={20}>
              <div
                className={`group bg-black/30 backdrop-blur-sm border border-white/20
                  rounded-2xl p-8 text-center h-full
                  shadow-[0_2px_16px_rgba(0,0,0,0.20)]
                  hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)]
                  hover:bg-black/40 hover:border-white/30
                  hover:-translate-y-2
                  transition-all duration-300 ease-out`}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <item.Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-white group-hover:text-cyan-200 transition-colors duration-200">
                  {t(item.titleRu, item.titleEn)}
                </h3>
                <p className="text-sm text-white/65 leading-relaxed">
                  {t(item.descRu, item.descEn)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useI18n();
  const { data: feeds = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/tour-feeds?withTours=true&active=true"],
  });
  const { data: banners = [] } = useQuery<any[]>({ queryKey: ["/api/banners?active=true"] });

  const hotFeed = feeds.find((f: any) => f.slug === "hot" || f.nameRu?.includes("Горящ"));
  const featuredFeed = feeds.find((f: any) => f.slug === "featured" || f.nameRu?.includes("Рекоменд") || f.nameRu?.includes("Популяр"));
  const allFeed = feeds.find((f: any) => f.slug === "all" || (!hotFeed && !featuredFeed));

  const hotTours: Tour[] = hotFeed?.tours || [];
  const popularTours: Tour[] = featuredFeed?.tours || allFeed?.tours || (feeds[0]?.tours ?? []);

  return (
    <div className="min-h-screen">
      <CinematicHero />
      <StatsBar />

      {isLoading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 space-y-10">
          <Skeleton className="h-9 w-72 mb-6" />
          <div className="grid grid-cols-4 gap-7">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        </div>
      ) : (
        <>
          <PopularToursSection tours={popularTours} />
          {/* Nature gap */}
          <div className="py-8 md:py-12" />
          <DestinationsSection />
          <PromoBanner banners={banners} />
          {/* Nature gap */}
          <div className="py-6 md:py-10" />
          <HotToursSection tours={hotTours} />
          <WhyUsSection />
          <ReviewsSection />
        </>
      )}
    </div>
  );
}
