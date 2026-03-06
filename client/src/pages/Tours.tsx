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
import { Search, SlidersHorizontal, X } from "lucide-react";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("Все туры", "All Tours")}</h1>
        <p className="text-muted-foreground">{t("Найдите идеальное путешествие из нашей коллекции", "Find your perfect journey from our collection")}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t("Поиск туров...", "Search tours...")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="input-tours-search"
          />
        </div>

        <Select value={countryId} onValueChange={setCountryId}>
          <SelectTrigger className="w-full md:w-48" data-testid="select-country">
            <SelectValue placeholder={t("Страна", "Country")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("Все страны", "All Countries")}</SelectItem>
            {countries.map(c => (
              <SelectItem key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-full md:w-48" data-testid="select-category">
            <SelectValue placeholder={t("Категория", "Category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("Все категории", "All Categories")}</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-44" data-testid="select-sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("Новые", "Newest")}</SelectItem>
            <SelectItem value="price_asc">{t("Цена ↑", "Price ↑")}</SelectItem>
            <SelectItem value="price_desc">{t("Цена ↓", "Price ↓")}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="gap-2"
          data-testid="button-toggle-filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t("Фильтры", "Filters")}
        </Button>
      </div>

      {filtersOpen && (
        <div className="bg-card border border-card-border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="mb-2 block">{t("Цена ($/чел.)", "Price ($/person)")}: ${priceRange[0]} – ${priceRange[1]}</Label>
              <Slider
                min={0} max={10000} step={100}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="hot"
                checked={isHot}
                onCheckedChange={v => setIsHot(!!v)}
                data-testid="checkbox-hot"
              />
              <Label htmlFor="hot">{t("Только горящие туры", "Hot deals only")}</Label>
            </div>
          </div>
        </div>
      )}

      {hasFilters && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {search && <Badge variant="secondary">{t("Поиск:", "Search:")} {search} <button onClick={() => setSearch("")}><X className="h-3 w-3 ml-1" /></button></Badge>}
          {countryId !== "all" && <Badge variant="secondary">{countries.find(c => c.id === countryId)?.[lang === "ru" ? "nameRu" : "nameEn"]} <button onClick={() => setCountryId("all")}><X className="h-3 w-3 ml-1" /></button></Badge>}
          {isHot && <Badge variant="secondary">{t("Горящие", "Hot")} <button onClick={() => setIsHot(false)}><X className="h-3 w-3 ml-1" /></button></Badge>}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive text-xs">
            {t("Сбросить всё", "Clear all")}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">{t("Туры не найдены", "No tours found")}</p>
          <p className="text-sm mt-1">{t("Попробуйте изменить параметры поиска", "Try adjusting your search filters")}</p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>{t("Сбросить фильтры", "Clear filters")}</Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {t(`Найдено туров: ${filtered.length}`, `Found: ${filtered.length} tours`)}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(tour => <TourCard key={tour.id} tour={tour} />)}
          </div>
        </>
      )}
    </div>
  );
}
