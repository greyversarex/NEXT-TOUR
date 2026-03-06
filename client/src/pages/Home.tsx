import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import TourCard from "@/components/TourCard";
import { useI18n } from "@/lib/i18n";
import { Search, Star, ChevronLeft, ChevronRight, Flame, Sparkles, TrendingUp } from "lucide-react";
import type { Tour } from "@shared/schema";

function HeroSlider() {
  const { t, lang } = useI18n();
  const [current, setCurrent] = useState(0);
  const { data: slides = [] } = useQuery<any[]>({ queryKey: ["/api/hero-slides?active=true"] });

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="relative h-[520px] md:h-[640px] overflow-hidden rounded-none md:rounded-2xl bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-500">
        <img src="/images/hero-banner.png" alt="hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-white/30 text-sm">
            {t("Лучшие туры 2024", "Best Tours 2024")}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl leading-tight">
            {t("Открой мир путешествий", "Discover the World")}
          </h1>
          <p className="text-lg md:text-xl opacity-85 max-w-xl mb-8">
            {t("Незабываемые туры по всему миру по лучшим ценам", "Unforgettable tours worldwide at the best prices")}
          </p>
          <Link href="/tours">
            <Button size="lg" className="text-base px-8" data-testid="button-hero-cta">
              {t("Найти тур", "Find a Tour")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const slide = slides[current];
  const title = lang === "ru" ? slide.titleRu : slide.titleEn;
  const subtitle = lang === "ru" ? slide.subtitleRu : slide.subtitleEn;
  const btnText = lang === "ru" ? slide.buttonTextRu : slide.buttonTextEn;

  return (
    <div className="relative h-[520px] md:h-[640px] overflow-hidden rounded-none md:rounded-2xl">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {s.mediaType === "video" ? (
            <video src={s.mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
          ) : (
            <img src={s.mediaUrl} alt={title} className="w-full h-full object-cover" />
          )}
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl leading-tight">{title}</h1>
        {subtitle && <p className="text-lg md:text-xl opacity-85 max-w-xl mb-8">{subtitle}</p>}
        {btnText && (
          <Link href={slide.buttonLink || "/tours"}>
            <Button size="lg" className="text-base px-8">{btnText}</Button>
          </Link>
        )}
      </div>
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrent(c => (c + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SearchBar() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [, navigate] = [null, (url: string) => window.location.href = url];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) window.location.href = `/tours?search=${encodeURIComponent(query.trim())}`;
  };

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm -mt-8 relative z-10 mx-4 md:mx-8">
      <h2 className="text-lg font-semibold mb-4 text-center">{t("Найдите свой идеальный тур", "Find Your Perfect Tour")}</h2>
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t("Поиск по названию, стране, городу...", "Search by name, country, city...")}
            value={query}
            onChange={e => setQuery(e.target.value)}
            data-testid="input-hero-search"
          />
        </div>
        <Button type="submit" data-testid="button-hero-search-submit">
          {t("Найти", "Search")}
        </Button>
      </form>
    </div>
  );
}

function TourFeedSection({ feed }: { feed: any }) {
  const { lang, t } = useI18n();
  const name = lang === "ru" ? feed.nameRu : feed.nameEn;
  const tours: Tour[] = feed.tours || [];

  const icons: Record<string, any> = {
    "hot": <Flame className="h-5 w-5 text-orange-500" />,
    "featured": <Sparkles className="h-5 w-5 text-yellow-500" />,
    "popular": <TrendingUp className="h-5 w-5 text-blue-500" />,
  };

  if (tours.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {name}
        </h2>
        <Link href="/tours">
          <Button variant="ghost" size="sm" className="text-primary">
            {t("Все туры", "All tours")} →
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {tours.slice(0, 8).map(tour => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </section>
  );
}

function ReviewsSection() {
  const { t, lang } = useI18n();
  const { data: reviews = [] } = useQuery<any[]>({ queryKey: ["/api/reviews/featured"] });
  const [idx, setIdx] = useState(0);

  if (reviews.length === 0) return null;

  const rev = reviews[idx];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{t("Отзывы клиентов", "Client Reviews")}</h2>
      <div className="relative bg-card border border-card-border rounded-2xl p-8 max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-5 w-5 ${i < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
          ))}
        </div>
        <blockquote className="text-base text-foreground/80 italic mb-6 leading-relaxed">
          "{lang === "ru" ? rev.textRu : (rev.textEn || rev.textRu)}"
        </blockquote>
        <div className="font-semibold">{rev.user?.name}</div>
        <div className="text-sm text-muted-foreground mt-1">
          {lang === "ru" ? rev.tour?.titleRu : rev.tour?.titleEn}
        </div>

        {reviews.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => setIdx(i => (i - 1 + reviews.length) % reviews.length)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-muted-foreground">{idx + 1} / {reviews.length}</span>
            <button onClick={() => setIdx(i => (i + 1) % reviews.length)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
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

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <HeroSlider />
        <SearchBar />

        <div className="px-4 sm:px-6 lg:px-8 mt-12">
          {isLoading ? (
            <div className="space-y-8">
              {[1, 2].map(i => (
                <div key={i}>
                  <Skeleton className="h-8 w-48 mb-6" />
                  <div className="grid grid-cols-4 gap-5">
                    {[1,2,3,4].map(j => <Skeleton key={j} className="h-64 rounded-lg" />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            feeds.map((feed, idx) => (
              <div key={feed.id}>
                <TourFeedSection feed={feed} />
                {banners[idx] && (
                  <div className="mb-12 rounded-2xl overflow-hidden relative h-40">
                    <img src={banners[idx].imageUrl} alt={banners[idx].titleRu} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="text-white text-center">
                        <h3 className="text-2xl font-bold">{banners[idx].titleRu}</h3>
                        {banners[idx].linkUrl && (
                          <Link href={banners[idx].linkUrl}>
                            <Button variant="outline" className="mt-3 text-white border-white">
                              {t("Подробнее", "Learn More")}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          <ReviewsSection />
        </div>
      </div>
    </div>
  );
}
