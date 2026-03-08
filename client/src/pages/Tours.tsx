import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import TourCard from "@/components/TourCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { Search, SlidersHorizontal, X, Compass, ChevronDown, ChevronUp } from "lucide-react";
import type { Tour, Country, City, Category } from "@shared/schema";

const DURATION_RANGES = [
  { key: "1-5", labelRu: "1–5 дней", labelEn: "1–5 days", min: 1, max: 5 },
  { key: "6-8", labelRu: "6–8 дней", labelEn: "6–8 days", min: 6, max: 8 },
  { key: "9-14", labelRu: "9–14 дней", labelEn: "9–14 days", min: 9, max: 14 },
  { key: "15+", labelRu: "15+ дней", labelEn: "15+ days", min: 15, max: 999 },
];

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/40 pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-left mb-3 group"
      >
        <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

export default function Tours() {
  const { t, lang } = useI18n();
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);

  const [search, setSearch] = useState(params.get("search") || "");
  const [countryId, setCountryId] = useState(params.get("countryId") || "all");
  const [cityId, setCityId] = useState("all");
  const [categoryId, setCategoryId] = useState(params.get("categoryId") || "all");
  const [isHot, setIsHot] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [durations, setDurations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: countries = [] } = useQuery<Country[]>({ queryKey: ["/api/countries"] });
  const { data: allCities = [] } = useQuery<City[]>({ queryKey: ["/api/cities"] });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["/api/categories"] });

  const filteredCities = useMemo(() =>
    countryId === "all" ? allCities : allCities.filter(c => c.countryId === countryId),
    [allCities, countryId]
  );

  const qp = new URLSearchParams();
  if (search) qp.set("search", search);
  if (countryId && countryId !== "all") qp.set("countryId", countryId);
  if (categoryId && categoryId !== "all") qp.set("categoryId", categoryId);
  if (isHot) qp.set("isHot", "true");

  const { data: tours = [], isLoading } = useQuery<Tour[]>({
    queryKey: [`/api/tours?${qp.toString()}`],
  });

  const sorted = useMemo(() => [...tours].sort((a, b) => {
    if (sortBy === "price_asc") return Number(a.basePrice) - Number(b.basePrice);
    if (sortBy === "price_desc") return Number(b.basePrice) - Number(a.basePrice);
    if (sortBy === "popular") return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }), [tours, sortBy]);

  const filtered = useMemo(() => sorted.filter(tour => {
    const effectivePrice = Number(tour.basePrice) * (1 - tour.discountPercent / 100);
    if (effectivePrice < priceRange[0] || effectivePrice > priceRange[1]) return false;
    if (cityId !== "all" && tour.cityId !== cityId) return false;
    if (discountOnly && tour.discountPercent === 0) return false;
    if (durations.length > 0) {
      const match = durations.some(key => {
        const range = DURATION_RANGES.find(r => r.key === key);
        return range && tour.duration >= range.min && tour.duration <= range.max;
      });
      if (!match) return false;
    }
    return true;
  }), [sorted, priceRange, cityId, discountOnly, durations]);

  const toggleDuration = (key: string) => {
    setDurations(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const clearFilters = () => {
    setSearch(""); setCountryId("all"); setCityId("all"); setCategoryId("all");
    setIsHot(false); setDiscountOnly(false); setPriceRange([0, 5000]); setDurations([]);
  };

  const activeFilterCount = [
    search, countryId !== "all", cityId !== "all", categoryId !== "all",
    isHot, discountOnly, durations.length > 0,
    priceRange[0] > 0 || priceRange[1] < 5000
  ].filter(Boolean).length;

  const Sidebar = () => (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="bg-white dark:bg-card border border-border/50 rounded-2xl p-6 shadow-sm sticky top-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-base text-foreground">{t("Фильтры", "Filters")}</h2>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-destructive hover:underline font-medium flex items-center gap-1"
              data-testid="button-clear-filters"
            >
              <X className="h-3 w-3" />
              {t("Сбросить", "Clear all")}
            </button>
          )}
        </div>

        <FilterSection title={t("Страна", "Country")}>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio" name="country" value="all" checked={countryId === "all"}
                onChange={() => { setCountryId("all"); setCityId("all"); }}
                className="accent-primary"
              />
              <span className="text-sm group-hover:text-primary transition-colors">{t("Все страны", "All countries")}</span>
            </label>
            {countries.map(c => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio" name="country" value={c.id} checked={countryId === c.id}
                  onChange={() => { setCountryId(c.id); setCityId("all"); }}
                  className="accent-primary"
                />
                <span className="text-sm group-hover:text-primary transition-colors">
                  {lang === "ru" ? c.nameRu : c.nameEn}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {filteredCities.length > 0 && (
          <FilterSection title={t("Город", "City")}>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio" name="city" value="all" checked={cityId === "all"}
                  onChange={() => setCityId("all")}
                  className="accent-primary"
                />
                <span className="text-sm group-hover:text-primary transition-colors">{t("Все города", "All cities")}</span>
              </label>
              {filteredCities.map(c => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio" name="city" value={c.id} checked={cityId === c.id}
                    onChange={() => setCityId(c.id)}
                    className="accent-primary"
                  />
                  <span className="text-sm group-hover:text-primary transition-colors">
                    {lang === "ru" ? c.nameRu : c.nameEn}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        <FilterSection title={t("Цена ($/чел.)", "Price ($/person)")}>
          <div className="mb-4">
            <div className="flex justify-between text-sm font-semibold text-primary mb-3">
              <span>${priceRange[0].toLocaleString()}</span>
              <span>${priceRange[1].toLocaleString()}</span>
            </div>
            <Slider
              min={0} max={5000} step={50}
              value={priceRange}
              onValueChange={setPriceRange}
              className="mt-1"
              data-testid="slider-price"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>$0</span>
              <span>$5,000</span>
            </div>
          </div>
        </FilterSection>

        <FilterSection title={t("Длительность", "Duration")}>
          <div className="space-y-2.5">
            {DURATION_RANGES.map(range => (
              <label key={range.key} className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox
                  id={`dur-${range.key}`}
                  checked={durations.includes(range.key)}
                  onCheckedChange={() => toggleDuration(range.key)}
                  data-testid={`checkbox-duration-${range.key}`}
                />
                <Label htmlFor={`dur-${range.key}`} className="text-sm cursor-pointer group-hover:text-primary transition-colors font-normal">
                  {lang === "ru" ? range.labelRu : range.labelEn}
                </Label>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title={t("Категория", "Category")}>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio" name="category" value="all" checked={categoryId === "all"}
                onChange={() => setCategoryId("all")}
                className="accent-primary"
              />
              <span className="text-sm group-hover:text-primary transition-colors">{t("Все категории", "All categories")}</span>
            </label>
            {categories.map(c => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio" name="category" value={c.id} checked={categoryId === c.id}
                  onChange={() => setCategoryId(c.id)}
                  className="accent-primary"
                />
                <span className="text-sm group-hover:text-primary transition-colors">
                  {lang === "ru" ? c.nameRu : c.nameEn}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title={t("Специальные предложения", "Special Offers")} defaultOpen>
          <div className="space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer group p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 hover:border-orange-300 transition-colors">
              <Checkbox
                id="hot-filter"
                checked={isHot}
                onCheckedChange={v => setIsHot(!!v)}
                data-testid="checkbox-hot"
              />
              <Label htmlFor="hot-filter" className="text-sm cursor-pointer font-medium">
                🔥 {t("Горящие туры", "Hot deals")}
              </Label>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 hover:border-red-300 transition-colors">
              <Checkbox
                id="discount-filter"
                checked={discountOnly}
                onCheckedChange={v => setDiscountOnly(!!v)}
                data-testid="checkbox-discount"
              />
              <Label htmlFor="discount-filter" className="text-sm cursor-pointer font-medium">
                🏷️ {t("Только со скидкой", "Discounted only")}
              </Label>
            </label>
          </div>
        </FilterSection>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="relative overflow-hidden bg-white/15 backdrop-blur-2xl border-b border-white/20">
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-md">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <p className="text-white/80 font-semibold text-sm uppercase tracking-widest">{t("Каталог", "Catalog")}</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight text-white drop-shadow-md">{t("Все туры", "All Tours")}</h1>
          <p className="text-white/75 text-base max-w-xl leading-relaxed">
            {t("Найдите идеальное путешествие из нашей коллекции эксклюзивных маршрутов", "Find your perfect journey from our collection of exclusive routes")}
          </p>

          {/* Search bar inside header */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder={t("Поиск по названию, стране, городу...", "Search by name, country, city...")}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/30 bg-white text-gray-800 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 text-sm transition-all"
                data-testid="input-tours-search"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="gap-2 rounded-xl"
            data-testid="button-toggle-filters-mobile"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("Фильтры", "Filters")}
            {activeFilterCount > 0 && (
              <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">{activeFilterCount}</Badge>
            )}
          </Button>
          {sidebarOpen && <div className="mt-4"><Sidebar /></div>}
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                {isLoading ? (
                  <Skeleton className="h-5 w-36" />
                ) : (
                  <p className="font-semibold text-foreground">
                    {lang === "ru"
                      ? `Найдено туров: ${filtered.length}`
                      : `${filtered.length} tour${filtered.length !== 1 ? "s" : ""} found`}
                  </p>
                )}
                {activeFilterCount > 0 && !isLoading && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("Применены фильтры", "Filters applied")} ({activeFilterCount})
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">{t("Сортировка:", "Sort by:")}</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44 h-9 rounded-xl border-border/60 bg-white dark:bg-card shadow-sm text-sm" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="newest">{t("Новые", "Newest")}</SelectItem>
                    <SelectItem value="popular">{t("Популярные", "Popular")}</SelectItem>
                    <SelectItem value="price_asc">{t("Цена: дешевле", "Price: low to high")}</SelectItem>
                    <SelectItem value="price_desc">{t("Цена: дороже", "Price: high to low")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {search && (
                  <Badge variant="secondary" className="gap-1.5 pr-1.5 rounded-full text-xs">
                    🔍 {search}
                    <button onClick={() => setSearch("")} className="hover:text-destructive ml-0.5"><X className="h-3 w-3" /></button>
                  </Badge>
                )}
                {countryId !== "all" && (
                  <Badge variant="secondary" className="gap-1.5 pr-1.5 rounded-full text-xs">
                    {countries.find(c => c.id === countryId)?.[lang === "ru" ? "nameRu" : "nameEn"]}
                    <button onClick={() => { setCountryId("all"); setCityId("all"); }} className="hover:text-destructive ml-0.5"><X className="h-3 w-3" /></button>
                  </Badge>
                )}
                {cityId !== "all" && (
                  <Badge variant="secondary" className="gap-1.5 pr-1.5 rounded-full text-xs">
                    {allCities.find(c => c.id === cityId)?.[lang === "ru" ? "nameRu" : "nameEn"]}
                    <button onClick={() => setCityId("all")} className="hover:text-destructive ml-0.5"><X className="h-3 w-3" /></button>
                  </Badge>
                )}
                {isHot && (
                  <Badge variant="secondary" className="gap-1.5 pr-1.5 rounded-full text-xs">
                    🔥 {t("Горящие", "Hot")}
                    <button onClick={() => setIsHot(false)} className="hover:text-destructive ml-0.5"><X className="h-3 w-3" /></button>
                  </Badge>
                )}
                {discountOnly && (
                  <Badge variant="secondary" className="gap-1.5 pr-1.5 rounded-full text-xs">
                    🏷️ {t("Скидки", "Discounts")}
                    <button onClick={() => setDiscountOnly(false)} className="hover:text-destructive ml-0.5"><X className="h-3 w-3" /></button>
                  </Badge>
                )}
                {durations.map(key => {
                  const range = DURATION_RANGES.find(r => r.key === key);
                  return range ? (
                    <Badge key={key} variant="secondary" className="gap-1.5 pr-1.5 rounded-full text-xs">
                      ⏱ {lang === "ru" ? range.labelRu : range.labelEn}
                      <button onClick={() => toggleDuration(key)} className="hover:text-destructive ml-0.5"><X className="h-3 w-3" /></button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            {/* Tour grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 text-muted-foreground">
                <div className="w-24 h-24 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 opacity-25" />
                </div>
                <p className="text-xl font-bold mb-2 text-foreground">{t("Туры не найдены", "No tours found")}</p>
                <p className="text-sm max-w-xs mx-auto leading-relaxed">
                  {t("Попробуйте изменить параметры поиска или сбросить фильтры", "Try adjusting your search or clearing the filters")}
                </p>
                <Button variant="outline" className="mt-6 rounded-full px-8" onClick={clearFilters} data-testid="button-empty-clear">
                  {t("Сбросить фильтры", "Clear filters")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(tour => <TourCard key={tour.id} tour={tour} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
