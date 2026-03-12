import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import TourCard from "@/components/TourCard";
import { useI18n } from "@/lib/i18n";
import { format } from "date-fns";
import {
  Search, Star, ChevronLeft, ChevronRight, MapPin, Clock,
  Users, ArrowRight, Quote, Flame, CalendarDays, ChevronDown,
  Award, Globe, Shield, Gem, ThumbsUp, TrendingUp
} from "lucide-react";
import type { Tour, Country, City } from "@shared/schema";

function isVideo(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

function MediaDisplay({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [ready, setReady] = useState(false);

  if (isVideo(src)) {
    return (
      <>
        {!ready && (
          <div className="absolute inset-0 bg-gray-900" />
        )}
        <video
          src={src}
          className={`${className} transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setReady(true)}
        />
      </>
    );
  }
  return <img src={src} alt={alt} className={className} />;
}

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
  const [current, setCurrent] = useState(0);
  const { data: slides = [] } = useQuery<any[]>({ queryKey: ["/api/hero-slides?active=true"] });

  const heroImages = slides.length > 0
    ? slides.map((s: any) => s.mediaUrl)
    : ["/images/hero-banner.png", "/images/tour-maldives.png", "/images/tour-bali.png"];

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % heroImages.length), 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const slide = slides[current];
  const slideTitle = slide ? (lang === "ru" ? slide.titleRu : slide.titleEn) : null;
  const slideSubtitle = slide ? (lang === "ru" ? slide.subtitleRu : slide.subtitleEn) : null;

  return (
    <section className="relative w-full h-[70svh] sm:h-[85svh] md:h-[100svh] min-h-[420px] sm:min-h-[520px] md:min-h-[640px] max-h-[960px] overflow-hidden">
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

      {/* Title/subtitle — centred in upper portion */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white" style={{ paddingBottom: "clamp(80px, 20vw, 160px)" }}>
        <div className="max-w-4xl w-full">
          <div className="hero-fade-in-up-1">
            <Badge className="mb-5 bg-white/15 backdrop-blur-md text-white border-white/30 px-5 py-2 text-sm font-semibold tracking-widest uppercase">
              ✈&nbsp; {t("Лучшие туры 2025", "Best Tours 2025")}
            </Badge>
          </div>

          <h1
            className="hero-fade-in-up-2 text-3xl sm:text-5xl md:text-7xl font-extrabold leading-[1.05] mb-3 sm:mb-5 tracking-tight"
            style={{ textShadow: "0 4px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(0,0,0,0.3)" }}
          >
            {slideTitle || t("Мир ждёт тебя", "The World Awaits")}
          </h1>

          <p className="hero-fade-in-up-3 text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-light px-2">
            {slideSubtitle || t(
              "Незабываемые путешествия по всему миру. Премиальный сервис, лучшие цены, идеальные воспоминания.",
              "Unforgettable journeys worldwide. Premium service, best prices, perfect memories."
            )}
          </p>
        </div>
      </div>


      {/* Slide controls */}
      {heroImages.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(c => (c - 1 + heroImages.length) % heroImages.length)}
            className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/25 backdrop-blur-sm text-white hover:bg-black/45 transition-all hover:scale-110 items-center justify-center"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrent(c => (c + 1) % heroImages.length)}
            className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/25 backdrop-blur-sm text-white hover:bg-black/45 transition-all hover:scale-110 items-center justify-center"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1 rounded-full transition-all duration-500 ${i === current ? "w-8 bg-white" : "w-2.5 bg-white/35 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

const TRAVELER_OPTIONS = [
  { value: "1", labelRu: "1 турист", labelEn: "1 traveler" },
  { value: "2", labelRu: "2 туриста", labelEn: "2 travelers" },
  { value: "3", labelRu: "3 туриста", labelEn: "3 travelers" },
  { value: "4+", labelRu: "4+ туристов", labelEn: "4+ travelers" },
];

function SearchSection() {
  const { t, lang } = useI18n();
  const [, setLocation] = useLocation();

  const [destination, setDestination] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [travelers, setTravelers] = useState("2");
  const [travelersOpen, setTravelersOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [dateOpen, setDateOpen] = useState(false);
  const [pickingDate, setPickingDate] = useState<"from" | "to">("from");

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const travelersRef = useRef<HTMLDivElement>(null);

  const { data: countries = [] } = useQuery<Country[]>({ queryKey: ["/api/countries"] });
  const { data: cities = [] } = useQuery<City[]>({ queryKey: ["/api/cities"] });
  const { data: tours = [] } = useQuery<Tour[]>({ queryKey: ["/api/tours"] });

  const suggestions = useMemo(() => {
    if (!destination.trim()) return [];
    const q = destination.toLowerCase();
    const results: { label: string; sub: string; type: string }[] = [];

    countries.forEach(c => {
      const name = lang === "ru" ? c.nameRu : c.nameEn;
      if (name.toLowerCase().includes(q)) results.push({ label: name, sub: t("Страна", "Country"), type: "country" });
    });

    cities.forEach(c => {
      const name = lang === "ru" ? c.nameRu : c.nameEn;
      if (name.toLowerCase().includes(q)) results.push({ label: name, sub: t("Город", "City"), type: "city" });
    });

    tours.forEach(tour => {
      const name = lang === "ru" ? tour.titleRu : tour.titleEn;
      if (name.toLowerCase().includes(q)) results.push({ label: name, sub: t("Тур", "Tour"), type: "tour" });
    });

    return results.slice(0, 6);
  }, [destination, countries, cities, tours, lang]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (travelersRef.current && !travelersRef.current.contains(e.target as Node)) {
        setTravelersOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent, overrideDest?: string) => {
    e.preventDefault();
    const q = (overrideDest ?? destination).trim();
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    setLocation(`/tours${params.toString() ? `?${params}` : ""}`);
    setShowSuggestions(false);
  };

  const formatDateRange = () => {
    if (dateFrom && dateTo) return `${format(dateFrom, "dd.MM")} – ${format(dateTo, "dd.MM")}`;
    if (dateFrom) return format(dateFrom, "dd MMM");
    return t("Выбрать даты", "Select dates");
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    if (pickingDate === "from") {
      setDateFrom(date);
      setDateTo(undefined);
      setPickingDate("to");
    } else {
      if (dateFrom && date < dateFrom) {
        setDateFrom(date);
        setDateTo(undefined);
        setPickingDate("to");
      } else {
        setDateTo(date);
        setDateOpen(false);
        setPickingDate("from");
      }
    }
  };

  return (
    <div className="relative -mt-8 z-20 max-w-4xl mx-auto px-4 sm:px-6 pb-4">
      <Reveal y={12}>
        <form onSubmit={handleSearch}>
          <div
            className="flex flex-col md:flex-row rounded-2xl overflow-visible shadow-2xl border border-border/40 bg-white dark:bg-card"
          >
            {/* Destination field with autocomplete */}
            <div className="relative flex-1 border-b md:border-b-0 md:border-r border-border/40">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
              <input
                ref={inputRef}
                type="text"
                placeholder={t("Куда хотите поехать?", "Where do you want to go?")}
                value={destination}
                onChange={e => { setDestination(e.target.value); setShowSuggestions(true); }}
                onFocus={() => destination && setShowSuggestions(true)}
                className="w-full bg-transparent pl-12 pr-5 py-5 text-foreground placeholder:text-muted-foreground focus:outline-none text-base rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
                data-testid="input-hero-search"
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-card rounded-2xl shadow-2xl border border-border/40 overflow-hidden z-50"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={e => { setDestination(s.label); setShowSuggestions(false); handleSearch(e as any, s.label); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/8 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        {s.type === "country" ? <Globe className="h-4 w-4 text-primary" /> :
                          s.type === "city" ? <MapPin className="h-4 w-4 text-primary" /> :
                            <Search className="h-4 w-4 text-primary" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date range picker */}
            <div className="relative border-b md:border-b-0 md:border-r border-border/40">
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2.5 px-5 py-5 text-foreground hover:bg-primary/8 transition-colors text-sm w-full md:w-auto whitespace-nowrap"
                    data-testid="button-date-picker"
                  >
                    <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span className={dateFrom ? "text-foreground" : "text-muted-foreground"}>{formatDateRange()}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 rounded-2xl shadow-2xl" align="start">
                  <div className="mb-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPickingDate("from")}
                      className={`flex-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${pickingDate === "from" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      {t("Начало", "Start")} {dateFrom ? format(dateFrom, "dd.MM") : "—"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickingDate("to")}
                      className={`flex-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${pickingDate === "to" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      {t("Конец", "End")} {dateTo ? format(dateTo, "dd.MM") : "—"}
                    </button>
                  </div>
                  <Calendar
                    mode="single"
                    selected={pickingDate === "from" ? dateFrom : dateTo}
                    onSelect={handleCalendarSelect}
                    disabled={{ before: pickingDate === "to" && dateFrom ? dateFrom : new Date() }}
                    initialFocus
                  />
                  {(dateFrom || dateTo) && (
                    <button
                      type="button"
                      onClick={() => { setDateFrom(undefined); setDateTo(undefined); setPickingDate("from"); }}
                      className="mt-2 w-full text-center text-xs text-destructive hover:underline"
                    >
                      {t("Сбросить даты", "Clear dates")}
                    </button>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {/* Travelers dropdown */}
            <div className="relative border-b md:border-b-0 md:border-r border-border/40" ref={travelersRef}>
              <button
                type="button"
                onClick={() => setTravelersOpen(!travelersOpen)}
                className="flex items-center gap-2.5 px-5 py-5 text-foreground hover:bg-primary/8 transition-colors text-sm w-full md:w-auto whitespace-nowrap"
                data-testid="button-travelers-picker"
              >
                <Users className="h-5 w-5 text-muted-foreground shrink-0" />
                <span>{TRAVELER_OPTIONS.find(o => o.value === travelers)?.[lang === "ru" ? "labelRu" : "labelEn"]}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
              </button>
              {travelersOpen && (
                <div className="absolute top-full mt-2 left-0 bg-white dark:bg-card rounded-2xl shadow-2xl border border-border/40 overflow-hidden z-50 min-w-[180px]">
                  {TRAVELER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setTravelers(opt.value); setTravelersOpen(false); }}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-primary/8 transition-colors font-medium ${travelers === opt.value ? "text-primary bg-primary/5" : "text-foreground"}`}
                      data-testid={`option-travelers-${opt.value}`}
                    >
                      {lang === "ru" ? opt.labelRu : opt.labelEn}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="rounded-none md:rounded-r-2xl px-7 py-5 text-base font-bold h-auto shrink-0"
              data-testid="button-hero-search-submit"
            >
              <Search className="h-5 w-5 mr-2" />
              {t("Найти тур", "Search Tours")}
            </Button>
          </div>
        </form>
      </Reveal>
    </div>
  );
}

const CARD_WIDTHS: Record<string, number> = { small: 220, medium: 260, large: 320 };
const CARD_WIDTHS_MD: Record<string, number> = { small: 280, medium: 340, large: 420 };

function TourScrollFeed({ tours, cardWidth = "medium" }: { tours: Tour[]; cardWidth?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMd, setIsMd] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsMd(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMd(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  const px = isMd ? (CARD_WIDTHS_MD[cardWidth] ?? 340) : (CARD_WIDTHS[cardWidth] ?? 260);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -(px * 2 + 16) : (px * 2 + 16), behavior: "smooth" });
  };

  return (
    <div className="relative group">
      <div ref={scrollRef} className="feed-scroll overflow-x-auto pb-2 sm:pb-3">
        <div className="flex gap-3 sm:gap-5">
          {tours.map(tour => (
            <div key={tour.id} className="flex-shrink-0" style={{ width: `${px}px` }}>
              <TourCard tour={tour} />
            </div>
          ))}
        </div>
      </div>

      {/* Arrows: always visible on mobile, fade in on hover on desktop */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 backdrop-blur-sm flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 shadow-xl"
        aria-label="Scroll left"
        data-testid="button-scroll-left"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 backdrop-blur-sm flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 shadow-xl"
        aria-label="Scroll right"
        data-testid="button-scroll-right"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function PopularToursSection({ tours, cardWidth }: { tours: Tour[]; cardWidth?: string }) {
  const { t } = useI18n();
  if (tours.length === 0) return null;
  return (
    <section className="pt-8 pb-6 sm:pt-14 sm:pb-12 md:pt-24 md:pb-20 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="flex items-end justify-between mb-5 sm:mb-8 md:mb-12">
          <div>
            <p className="text-cyan-300 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-1.5 sm:mb-3 flex items-center gap-1.5" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
              <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {t("Лучшие предложения", "Top Offers")}
            </p>
            <h2 className="text-xl sm:text-2xl md:text-5xl font-bold leading-tight text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{t("Популярные туры", "Popular Tours")}</h2>
          </div>
          <Link href="/tours">
            <Button className="hidden md:flex items-center gap-2 rounded-full px-7 py-5 text-sm font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/40 backdrop-blur-sm hover:-translate-y-0.5 transition-all duration-200 shadow-lg">
              {t("Все туры", "All Tours")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Reveal>
        <TourScrollFeed tours={tours} cardWidth={cardWidth} />
        <div className="mt-8 flex justify-center md:hidden">
          <Link href="/tours">
            <Button className="rounded-full px-8 py-4 bg-white/15 hover:bg-white/25 text-white border border-white/40 backdrop-blur-sm">
              {t("Все туры", "All Tours")} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function HotToursSection({ tours, cardWidth }: { tours: Tour[]; cardWidth?: string }) {
  const { t } = useI18n();
  if (tours.length === 0) return null;
  return (
    <section className="py-6 sm:py-12 md:py-20 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="flex items-end justify-between mb-5 sm:mb-8 md:mb-12">
          <div>
            <p className="text-orange-300 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-1.5 sm:mb-3 flex items-center gap-1.5" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
              <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {t("Акции", "Special Deals")}
            </p>
            <h2 className="text-xl sm:text-2xl md:text-5xl font-bold leading-tight text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{t("Горящие туры", "Hot Deals")}</h2>
          </div>
          <Link href="/promotions">
            <Button className="hidden md:flex items-center gap-2 rounded-full px-7 py-5 text-sm font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/40 backdrop-blur-sm hover:-translate-y-0.5 transition-all duration-200 shadow-lg">
              {t("Все акции", "All Deals")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Reveal>
        <TourScrollFeed tours={tours} cardWidth={cardWidth} />
        <div className="mt-8 flex justify-center md:hidden">
          <Link href="/promotions">
            <Button className="rounded-full px-8 py-4 bg-white/15 hover:bg-white/25 text-white border border-white/40 backdrop-blur-sm">
              {t("Все акции", "All Deals")} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function DestinationCard({ dest, lang, aspectClass = "aspect-[8/9]" }: {
  dest: Country;
  lang: string;
  aspectClass?: string;
}) {
  const name = lang === "ru" ? dest.nameRu : dest.nameEn;
  const tags: string[] = (lang === "ru" ? dest.tagsRu : dest.tagsEn) || [];
  const image = dest.imageUrl || "/images/hero-banner.png";
  return (
    <Link href={`/tours`} className="block h-full">
      <div
        className={`group relative rounded-2xl overflow-hidden cursor-pointer h-full ${aspectClass}
          shadow-md hover:shadow-[0_24px_64px_-10px_rgba(0,0,0,0.40)]
          hover:-translate-y-2
          transition-all duration-500 ease-out`}
        data-testid={`card-destination-${dest.id}`}
      >
        <MediaDisplay
          src={image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.10]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: "linear-gradient(135deg, transparent 35%, rgba(255,255,255,0.07) 55%, transparent 75%)" }}
        />

        {dest.countryCode && (
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="text-2xl drop-shadow-md">{countryFlag(dest.countryCode)}</span>
          </div>
        )}

        <div className="absolute top-3.5 right-3.5 z-10 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 ease-out">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 z-10 translate-y-1 group-hover:translate-y-0 transition-transform duration-400 ease-out">
          <h3
            className="text-white font-extrabold leading-tight mb-1 sm:mb-2.5 text-sm sm:text-lg md:text-xl"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}
          >
            {name}
          </h3>
          {tags.length > 0 && (
            <div className="hidden md:flex flex-wrap gap-1.5">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs text-white/95 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 border border-white/25 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function DestinationsSection() {
  const { t, lang } = useI18n();
  const { data: countries = [], isLoading } = useQuery<Country[]>({ queryKey: ["/api/countries?showOnHome=true"] });

  const destinations = countries;

  return (
    <section className="py-6 sm:py-12 md:py-20 relative overflow-hidden">
      <div className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal className="text-center mb-6 sm:mb-10 md:mb-14">
          <p className="text-cyan-300 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-1.5 sm:mb-3 flex items-center justify-center gap-1.5" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
            <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {t("Исследуйте", "Explore")}
          </p>
          <h2 className="text-xl sm:text-2xl md:text-5xl font-bold mb-2 sm:mb-4 leading-tight text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{t("Направления мечты", "Dream Destinations")}</h2>
          <p className="text-white/70 max-w-xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed px-2" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>
            {t("Откройте для себя самые красивые уголки планеты с нашими эксклюзивными турами", "Discover the most beautiful corners of the planet with our exclusive tours")}
          </p>
        </Reveal>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className={`rounded-xl sm:rounded-2xl ${i === 0 ? "col-span-2 aspect-[16/9]" : i === 5 ? "col-span-2 md:col-span-3 aspect-[21/9]" : "aspect-[4/5] sm:aspect-[8/9]"}`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
            {destinations.map((dest, i) => {
              const size = (dest as any).cardSize || "normal";
              let wrapClass = "";
              let aspect = "aspect-[4/5] sm:aspect-[8/9]";

              if (size === "wide") {
                wrapClass = "col-span-2";
                aspect = "aspect-[16/9]";
              } else if (size === "full") {
                wrapClass = "col-span-2 md:col-span-3";
                aspect = "aspect-[21/9]";
              }

              return (
                <Reveal key={dest.id} delay={i * 80} y={20} className={wrapClass}>
                  <DestinationCard dest={dest} lang={lang} aspectClass={aspect} />
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function PromoBanner({ banners }: { banners: any[] }) {
  const { t, lang } = useI18n();
  const banner = banners[0];

  const content = (src: string, titleEl: React.ReactNode, subtitleEl?: React.ReactNode, linkUrl = "/promotions") => (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-4 sm:py-8">
      <Reveal y={16}>
        <div className="group relative rounded-2xl sm:rounded-3xl overflow-hidden h-48 sm:h-72 md:h-96 shadow-2xl hover:shadow-[0_32px_80px_rgba(0,0,0,0.28)] transition-shadow duration-500 cursor-pointer">
          <MediaDisplay src={src} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Decorative accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary/0" />

          <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 md:px-16 py-5 sm:py-8 md:py-12 gap-3 sm:gap-5">
            <div className="text-white text-center md:text-left">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-2 sm:mb-4 text-[10px] sm:text-xs tracking-widest uppercase px-3 py-1 sm:px-4 sm:py-1.5">
                🔥 {t("Специальное предложение", "Special Offer")}
              </Badge>
              <h3 className="text-lg sm:text-2xl md:text-5xl font-extrabold mb-1 sm:mb-2 leading-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
                {titleEl}
              </h3>
              {subtitleEl && (
                <p className="text-white/75 text-sm md:text-base mt-2 max-w-md leading-relaxed">{subtitleEl}</p>
              )}
            </div>
            <Link href={linkUrl} className="shrink-0">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/95 font-bold px-8 py-5 rounded-2xl shadow-xl text-base hover:scale-105 hover:shadow-2xl transition-all duration-200"
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
    <section className="py-6 sm:py-12 md:py-20 relative overflow-hidden">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-6 sm:mb-10 md:mb-14">
          <p className="text-cyan-300 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-1.5 sm:mb-3 flex items-center justify-center gap-1.5" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
            <ThumbsUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {t("Отзывы", "Testimonials")}
          </p>
          <h2 className="text-xl sm:text-2xl md:text-5xl font-bold leading-tight text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{t("Что говорят наши клиенты", "What Our Clients Say")}</h2>
        </Reveal>

        <div className="max-w-2xl md:max-w-3xl mx-auto">
          <div className={`transition-all duration-200 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            <div
              className="bg-white dark:bg-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-12 relative"
              style={{ boxShadow: "0 12px 60px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.9) inset" }}
            >
              <div className="absolute top-4 left-5 sm:top-6 sm:left-8 opacity-[0.07]">
                <Quote className="h-12 w-12 sm:h-20 sm:w-20 text-primary fill-primary" />
              </div>

              <div className="flex justify-center gap-0.5 sm:gap-1 mb-4 sm:mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                    style={{ filter: i < rev.rating ? "drop-shadow(0 1px 4px rgba(251,191,36,0.4))" : undefined }}
                  />
                ))}
              </div>

              <blockquote className="text-sm sm:text-lg md:text-xl text-foreground/80 italic text-center leading-relaxed mb-6 sm:mb-8 font-light relative z-10">
                "{lang === "ru" ? rev.textRu : (rev.textEn || rev.textRu)}"
              </blockquote>

              <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto mb-5 sm:mb-7" />

              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg"
                  style={{ background: "linear-gradient(135deg, hsl(210 85% 45%), hsl(200 90% 55%))" }}
                >
                  {rev.user?.name?.[0] || "?"}
                </div>
                <div className="text-left">
                  <div className="font-bold text-foreground text-sm sm:text-base">{rev.user?.name}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
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
    <section className="py-6 sm:py-12 md:py-20 relative overflow-hidden">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-6 sm:mb-10 md:mb-14">
          <p className="text-cyan-300 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-1.5 sm:mb-3" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>{t("Наши преимущества", "Our Advantages")}</p>
          <h2 className="text-xl sm:text-2xl md:text-5xl font-bold leading-tight text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{t("Почему выбирают нас", "Why Choose Us")}</h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-7">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 100} y={20}>
              <div
                className={`group bg-black/30 backdrop-blur-sm border border-white/20
                  rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center h-full
                  shadow-[0_2px_16px_rgba(0,0,0,0.20)]
                  hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)]
                  hover:bg-black/40 hover:border-white/30
                  hover:-translate-y-1.5
                  transition-all duration-300 ease-out`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg mb-3 sm:mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <item.Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                </div>
                <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1.5 sm:mb-2 text-white group-hover:text-cyan-200 transition-colors duration-200">
                  {t(item.titleRu, item.titleEn)}
                </h3>
                <p className="text-xs sm:text-sm text-white/65 leading-relaxed">
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
  const hotCardWidth: string = hotFeed?.cardWidth || "medium";
  const popularCardWidth: string = (featuredFeed || allFeed || feeds[0])?.cardWidth || "medium";

  return (
    <div className="min-h-screen">
      <CinematicHero />
      <SearchSection />

      {isLoading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-32 space-y-10">
          <Skeleton className="h-8 w-56 md:w-72 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-7">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-60 md:h-80 rounded-2xl" />)}
          </div>
        </div>
      ) : (
        <>
          <PopularToursSection tours={popularTours} cardWidth={popularCardWidth} />
          <div className="py-2 sm:py-6 md:py-8" />
          <DestinationsSection />
          <PromoBanner banners={banners} />
          <div className="py-2 sm:py-4 md:py-6" />
          <HotToursSection tours={hotTours} cardWidth={hotCardWidth} />
          <WhyUsSection />
          <ReviewsSection />
        </>
      )}
    </div>
  );
}
