import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import TourCard from "@/components/TourCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { Search, SlidersHorizontal, X, Compass } from "lucide-react";
import type { Tour, Country, Category } from "@shared/schema";

export default function Tours() {
  const { t, lang } = useI18n();
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);

  const [search, setSearch] = useState(params.get("search") || "");
  const [countryId, setCountryId] = useState(params.get("countryId") || "all");
  const [categoryId, setCategoryId] = useState(params.get("categoryId") || "all");
  const [isHot, setIsHot] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: countries = [] } = useQuery<Country[]>({ queryKey: ["/api/countries"] });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["/api/categories"] });

  const qp = new URLSearchParams();
  if (search) qp.set("search", search);
  if (countryId && countryId !== "all") qp.set("countryId", countryId);
  if (categoryId && categoryId !== "all") qp.set("categoryId", categoryId);
  if (isHot) qp.set("isHot", "true");

  const { data: tours = [], isLoading } = useQuery<Tour[]>({
    queryKey: [`/api/tours?${qp.toString()}`],
  });

  const sorted = [...tours].sort((a, b) => {
    if (sortBy === "price_asc") return Number(a.basePrice) - Number(b.basePrice);
    if (sortBy === "price_desc") return Number(b.basePrice) - Number(a.basePrice);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filtered = sorted.filter(t => {
    const p = Number(t.basePrice) * (1 - t.discountPercent / 100);
    return p >= priceRange[0] && p <= priceRange[1];
  });

  const clearFilters = () => {
    setSearch(""); setCountryId("all"); setCategoryId("all"); setIsHot(false); setPriceRange([0, 10000]);
  };

  const hasFilters = search || (countryId !== "all") || (categoryId !== "all") || isHot;

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50/40 dark:from-blue-950/20 dark:via-background dark:to-background border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-md">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <p className="text-primary font-semibold text-sm uppercase tracking-widest">{t("Каталог", "Catalog")}</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">{t("Все туры", "All Tours")}</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">
            {t("Найдите идеальное путешествие из нашей коллекции эксклюзивных маршрутов", "Find your perfect journey from our collection of exclusive routes")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & filter bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10 h-11 rounded-xl border-border/60 bg-white dark:bg-card shadow-sm focus:shadow-md transition-shadow"
              placeholder={t("Поиск туров...", "Search tours...")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-testid="input-tours-search"
            />
          </div>

          <Select value={countryId} onValueChange={setCountryId}>
            <SelectTrigger className="w-full md:w-48 h-11 rounded-xl border-border/60 bg-white dark:bg-card shadow-sm" data-testid="select-country">
              <SelectValue placeholder={t("Страна", "Country")} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">{t("Все страны", "All Countries")}</SelectItem>
              {countries.map(c => (
                <SelectItem key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full md:w-48 h-11 rounded-xl border-border/60 bg-white dark:bg-card shadow-sm" data-testid="select-category">
              <SelectValue placeholder={t("Категория", "Category")} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">{t("Все категории", "All Categories")}</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-44 h-11 rounded-xl border-border/60 bg-white dark:bg-card shadow-sm" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="newest">{t("Новые", "Newest")}</SelectItem>
              <SelectItem value="price_asc">{t("Цена ↑", "Price ↑")}</SelectItem>
              <SelectItem value="price_desc">{t("Цена ↓", "Price ↓")}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`h-11 gap-2 rounded-xl border-border/60 shadow-sm hover:shadow-md transition-all duration-200 ${filtersOpen ? "bg-primary/8 border-primary/30 text-primary" : ""}`}
            data-testid="button-toggle-filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("Фильтры", "Filters")}
          </Button>
        </div>

        {filtersOpen && (
          <div className="bg-white dark:bg-card border border-border/60 rounded-2xl p-6 mb-5 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-3 block text-sm font-medium">
                  {t("Цена ($/чел.)", "Price ($/person)")}: <span className="text-primary font-semibold">${priceRange[0]} – ${priceRange[1]}</span>
                </Label>
                <Slider
                  min={0} max={10000} step={100}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mt-2"
                />
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                <Checkbox
                  id="hot"
                  checked={isHot}
                  onCheckedChange={v => setIsHot(!!v)}
                  data-testid="checkbox-hot"
                />
                <Label htmlFor="hot" className="cursor-pointer font-medium">
                  🔥 {t("Только горящие туры", "Hot deals only")}
                </Label>
              </div>
            </div>
          </div>
        )}

        {hasFilters && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {search && (
              <Badge variant="secondary" className="gap-1.5 pr-1.5 rounded-full text-xs font-medium">
                {t("Поиск:", "Search:")} {search}
                <button onClick={() => setSearch("")} className="hover:text-destructive transition-colors"><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {countryId !== "all" && (
              <Badge variant="secondary" className="gap-1.5 pr-1.5 rounded-full text-xs font-medium">
                {countries.find(c => c.id === countryId)?.[lang === "ru" ? "nameRu" : "nameEn"]}
                <button onClick={() => setCountryId("all")} className="hover:text-destructive transition-colors"><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {isHot && (
              <Badge variant="secondary" className="gap-1.5 pr-1.5 rounded-full text-xs font-medium">
                🔥 {t("Горящие", "Hot")}
                <button onClick={() => setIsHot(false)} className="hover:text-destructive transition-colors"><X className="h-3 w-3" /></button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive text-xs h-7 rounded-full hover:bg-destructive/10">
              {t("Сбросить всё", "Clear all")}
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-5">
              <Search className="h-9 w-9 opacity-30" />
            </div>
            <p className="text-xl font-semibold mb-2">{t("Туры не найдены", "No tours found")}</p>
            <p className="text-sm max-w-sm mx-auto">{t("Попробуйте изменить параметры поиска", "Try adjusting your search filters")}</p>
            <Button variant="outline" className="mt-6 rounded-full px-8" onClick={clearFilters}>
              {t("Сбросить фильтры", "Clear filters")}
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-5 font-medium">
              {t(`Найдено туров: ${filtered.length}`, `Found: ${filtered.length} tours`)}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(tour => <TourCard key={tour.id} tour={tour} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
