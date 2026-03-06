import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import TourCard from "@/components/TourCard";
import { useI18n } from "@/lib/i18n";
import {
  Search, Star, ChevronLeft, ChevronRight, MapPin, Clock,
  Users, Calendar, ArrowRight, Quote, Sparkles, Flame, TrendingUp
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
  { valueRu: "50 000+", valueEn: "50,000+", labelRu: "довольных клиентов", labelEn: "happy clients" },
  { valueRu: "120+", valueEn: "120+", labelRu: "направлений", labelEn: "destinations" },
  { valueRu: "15 лет", valueEn: "15 years", labelRu: "на рынке", labelEn: "of experience" },
  { valueRu: "4.9 ★", valueEn: "4.9 ★", labelRu: "средняя оценка", labelEn: "average rating" },
];

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
          className="absolute inset-0 transition-opacity duration-1500"
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      {/* Vignette edge darkening */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)"
      }} />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white pb-12">
        <div className="max-w-5xl w-full">
          {/* Badge */}
          <div className="hero-fade-in-up-1">
            <Badge className="mb-6 bg-white/15 backdrop-blur-md text-white border-white/30 px-5 py-2 text-sm font-semibold tracking-widest uppercase">
              ✈&nbsp; {t("Лучшие туры 2025", "Best Tours 2025")}
            </Badge>
          </div>

          {/* Title */}
          <h1
            className="hero-fade-in-up-2 text-6xl sm:text-7xl md:text-8xl lg:text-[5.5rem] font-extrabold leading-[1.0] mb-6 tracking-tight"
            style={{ textShadow: "0 4px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(0,0,0,0.3)" }}
          >
            {slideTitle || t("Мир ждёт тебя", "The World Awaits")}
          </h1>

          {/* Subtitle */}
          <p className="hero-fade-in-up-3 text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            {slideSubtitle || t(
              "Незабываемые путешествия по всему миру. Премиальный сервис, лучшие цены, идеальные воспоминания.",
              "Unforgettable journeys worldwide. Premium service, best prices, perfect memories."
            )}
          </p>

          {/* Glassmorphism search bar */}
          <form
            onSubmit={handleSearch}
            className="hero-fade-in-up-4 hero-glass-glow relative max-w-3xl mx-auto"
          >
            <div
              className="flex flex-col md:flex-row gap-0 md:gap-0 rounded-2xl overflow-hidden md:overflow-visible border border-white/25 shadow-2xl"
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
              }}
            >
              {/* Destination input */}
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

              {/* Travelers picker */}
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

              {/* Search button */}
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
    <div className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-primary-foreground/20">
          {STATS.map((stat, i) => (
            <div key={i} className="py-5 px-6 text-center">
              <div className="text-2xl md:text-3xl font-bold">{lang === "ru" ? stat.valueRu : stat.valueEn}</div>
              <div className="text-sm text-primary-foreground/75 mt-0.5">{lang === "ru" ? stat.labelRu : stat.labelEn}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PopularToursSection({ tours }: { tours: Tour[] }) {
  const { t } = useI18n();
  if (tours.length === 0) return null;
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">{t("Лучшие предложения", "Top Offers")}</p>
          <h2 className="text-3xl md:text-4xl font-bold">{t("Популярные туры", "Popular Tours")}</h2>
        </div>
        <Link href="/tours">
          <Button variant="outline" className="hidden md:flex items-center gap-2 rounded-full px-6">
            {t("Все туры", "All Tours")} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tours.slice(0, 8).map(tour => <TourCard key={tour.id} tour={tour} />)}
      </div>
      <div className="mt-8 flex justify-center md:hidden">
        <Link href="/tours">
          <Button variant="outline" className="rounded-full px-8">
            {t("Все туры", "All Tours")} <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

function HotToursSection({ tours }: { tours: Tour[] }) {
  const { t } = useI18n();
  if (tours.length === 0) return null;
  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Flame className="h-4 w-4" /> {t("Акции", "Special Deals")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">{t("Горящие туры", "Hot Deals")}</h2>
          </div>
          <Link href="/promotions">
            <Button variant="outline" className="hidden md:flex items-center gap-2 rounded-full px-6">
              {t("Все акции", "All Deals")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tours.slice(0, 4).map(tour => <TourCard key={tour.id} tour={tour} />)}
        </div>
      </div>
    </section>
  );
}

function DestinationCard({ dest, lang }: { dest: typeof DESTINATIONS[0]; lang: string }) {
  const name = lang === "ru" ? dest.nameRu : dest.nameEn;
  const tags = lang === "ru" ? dest.tagsRu : dest.tagsEn;
  return (
    <Link href={`/tours`}>
      <div className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500" data-testid={`card-destination-${dest.id}`}>
        <img
          src={dest.image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-white text-xl font-bold mb-2">{name}</h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span key={i} className="text-xs text-white/90 bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-0.5 border border-white/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function DestinationsSection() {
  const { t, lang } = useI18n();
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">{t("Исследуйте", "Explore")}</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("Направления мечты", "Dream Destinations")}</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {t("Откройте для себя самые красивые уголки планеты с нашими эксклюзивными турами", "Discover the most beautiful corners of the planet with our exclusive tours")}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {DESTINATIONS.map(dest => (
          <DestinationCard key={dest.id} dest={dest} lang={lang} />
        ))}
      </div>
    </section>
  );
}

function PromoBanner({ banners }: { banners: any[] }) {
  const { t, lang } = useI18n();
  const banner = banners[0];
  if (!banner) return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-4">
      <div className="relative rounded-3xl overflow-hidden h-56 md:h-72 bg-gradient-to-r from-primary via-blue-600 to-cyan-500 shadow-xl">
        <div className="absolute inset-0 opacity-20">
          <img src="/images/tour-maldives.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between px-8 md:px-14 py-8 gap-6">
          <div className="text-white text-center md:text-left">
            <Badge className="bg-white/20 text-white border-white/30 mb-3">🔥 {t("Специальное предложение", "Special Offer")}</Badge>
            <h3 className="text-2xl md:text-4xl font-bold mb-2">{t("Скидки до 30% на летние туры", "Up to 30% off summer tours")}</h3>
            <p className="text-white/80 text-sm md:text-base">{t("Успейте забронировать по лучшим ценам", "Book now at the best prices")}</p>
          </div>
          <Link href="/promotions" className="shrink-0">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-8 rounded-xl shadow-lg">
              {t("Смотреть акции", "View Offers")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-4">
      <div className="relative rounded-3xl overflow-hidden h-56 md:h-72 shadow-xl">
        <img src={banner.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between px-8 md:px-14 py-8 gap-6">
          <div className="text-white text-center md:text-left">
            <Badge className="bg-white/20 text-white border-white/30 mb-3">🔥 {t("Специальное предложение", "Special Offer")}</Badge>
            <h3 className="text-2xl md:text-4xl font-bold mb-2">{lang === "ru" ? banner.titleRu : (banner.titleEn || banner.titleRu)}</h3>
            {banner.subtitleRu && <p className="text-white/80 text-sm md:text-base">{lang === "ru" ? banner.subtitleRu : (banner.subtitleEn || banner.subtitleRu)}</p>}
          </div>
          <Link href={banner.linkUrl || "/promotions"} className="shrink-0">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-8 rounded-xl shadow-lg">
              {t("Смотреть", "View")} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
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
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">{t("Отзывы", "Testimonials")}</p>
          <h2 className="text-3xl md:text-4xl font-bold">{t("Что говорят наши клиенты", "What Our Clients Say")}</h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className={`transition-all duration-200 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            <div className="bg-white dark:bg-card rounded-3xl shadow-xl p-8 md:p-12 relative">
              <Quote className="h-10 w-10 text-primary/20 absolute top-8 left-8" />
              <div className="flex justify-center mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                ))}
              </div>
              <blockquote className="text-lg md:text-xl text-foreground/80 italic text-center leading-relaxed mb-8">
                "{lang === "ru" ? rev.textRu : (rev.textEn || rev.textRu)}"
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                  {rev.user?.name?.[0] || "?"}
                </div>
                <div>
                  <div className="font-bold text-foreground">{rev.user?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {lang === "ru" ? rev.tour?.titleRu : rev.tour?.titleEn}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {reviews.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button onClick={() => go(-1)}
                className="p-3 rounded-full border-2 border-border hover:border-primary hover:text-primary transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                {reviews.map((_, i) => (
                  <button key={i} onClick={() => { setIdx(i); }}
                    className={`h-2 rounded-full transition-all duration-300 ${i === idx ? "w-8 bg-primary" : "w-2 bg-gray-300"}`} />
                ))}
              </div>
              <button onClick={() => go(1)}
                className="p-3 rounded-full border-2 border-border hover:border-primary hover:text-primary transition-colors">
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
    { icon: "🛡️", titleRu: "Надёжность", titleEn: "Reliability", descRu: "15 лет работаем на рынке, тысячи довольных клиентов", descEn: "15 years in the market, thousands of happy clients" },
    { icon: "💎", titleRu: "Премиум сервис", titleEn: "Premium Service", descRu: "Персональный менеджер для каждого клиента 24/7", descEn: "Personal manager for every client 24/7" },
    { icon: "💰", titleRu: "Лучшие цены", titleEn: "Best Prices", descRu: "Гарантируем лучшую цену или вернём разницу", descEn: "Best price guarantee or we refund the difference" },
    { icon: "🌍", titleRu: "Любое направление", titleEn: "Any Destination", descRu: "Более 120 направлений по всему миру", descEn: "Over 120 destinations worldwide" },
  ];
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">{t("Наши преимущества", "Our Advantages")}</p>
        <h2 className="text-3xl md:text-4xl font-bold">{t("Почему выбирают нас", "Why Choose Us")}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, i) => (
          <div key={i} className="group bg-card border border-card-border rounded-2xl p-6 text-center hover:border-primary/40 hover:shadow-lg transition-all duration-300">
            <div className="text-4xl mb-4">{item.icon}</div>
            <h3 className="font-bold text-lg mb-2">{t(item.titleRu, item.titleEn)}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{t(item.descRu, item.descEn)}</p>
          </div>
        ))}
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
        <div className="max-w-7xl mx-auto px-4 py-16 space-y-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        </div>
      ) : (
        <>
          <PopularToursSection tours={popularTours} />
          <DestinationsSection />
          <PromoBanner banners={banners} />
          <HotToursSection tours={hotTours} />
          <WhyUsSection />
          <ReviewsSection />
        </>
      )}
    </div>
  );
}
