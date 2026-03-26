import { Link } from "wouter";
import { Clock, Heart, ArrowRight, MapPin, Settings2, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useAuth } from "@/lib/auth";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Tour, Country, City } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImagePositionPicker } from "@/components/ui/image-position-picker";

interface TourCardProps {
  tour: Tour;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

export default function TourCard({ tour, isFavorite = false, onFavoriteToggle }: TourCardProps) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [favState, setFavState] = useState(isFavorite);
  const [showPositionEditor, setShowPositionEditor] = useState(false);
  const [pendingPosition, setPendingPosition] = useState((tour as any).mainImagePosition || "50% 50%");
  const isAdmin = (user as any)?.role === "admin";

  const savePositionMutation = useMutation({
    mutationFn: (position: string) =>
      apiRequest("PATCH", `/api/tours/${tour.id}`, { mainImagePosition: position }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      setShowPositionEditor(false);
    },
  });

  const { formatPrice } = useCurrency();
  const title = lang === "ru" ? tour.titleRu : tour.titleEn;
  const price = Number(tour.basePrice);
  const discountedPrice = tour.discountPercent > 0
    ? price * (1 - tour.discountPercent / 100)
    : price;

  const { data: countries = [] } = useQuery<Country[]>({ queryKey: ["/api/countries"] });
  const { data: cities = [] } = useQuery<City[]>({ queryKey: ["/api/cities"] });
  const country = countries.find(c => c.id === tour.countryId);
  const city = cities.find(c => c.id === tour.cityId);
  const countryName = country ? (lang === "ru" ? country.nameRu : country.nameEn) : null;
  const cityName = city ? (lang === "ru" ? city.nameRu : city.nameEn) : null;
  const locationLabel = [cityName, countryName].filter(Boolean).join(", ");

  const favMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/favorites/${tour.id}`, {}),
    onSuccess: (data: any) => {
      setFavState(data.isFavorite);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      onFavoriteToggle?.();
    },
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    favMutation.mutate();
  };

  return (
    <>
    <Link href={`/tours/${tour.id}`} className="block h-full">
      <div
        className="group relative rounded-2xl overflow-hidden cursor-pointer h-[300px] sm:h-[320px]
          shadow-[0_4px_20px_rgba(0,0,0,0.10)]
          hover:shadow-[0_20px_56px_-8px_rgba(0,0,0,0.30)]
          hover:-translate-y-1.5
          transition-all duration-500"
        data-testid={`card-tour-${tour.id}`}
      >
        {/* Full-bleed image */}
        <img
          src={tour.mainImage || "/images/hero-banner.png"}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          style={{ objectPosition: (tour as any).mainImagePosition || "50% 50%" }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        {/* Hover shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] z-20 overflow-hidden rounded-t-2xl">
          <div className="h-full bg-gradient-to-r from-primary via-cyan-400 to-sky-300 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
        </div>

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {tour.discountPercent > 0 && (
            <div
              className="flex items-center bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md"
              data-testid={`badge-discount-${tour.id}`}
            >
              -{tour.discountPercent}%
            </div>
          )}
          {tour.isHot && (
            <div className="flex items-center gap-0.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md">
              🔥 {t("Горящий", "Hot")}
            </div>
          )}
        </div>

        {/* Top-right: duration + fav + admin */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold rounded-full px-2.5 py-1">
            <Clock className="h-3 w-3 opacity-80" />
            {tour.duration} {t("дн.", "d.")}
          </div>
          {isAdmin && tour.mainImage && (
            <button
              className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/60"
              title="Настроить позицию"
              data-testid={`btn-position-${tour.id}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPendingPosition((tour as any).mainImagePosition || "50% 50%");
                setShowPositionEditor(true);
              }}
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          )}
          {user && (
            <button
              onClick={handleFavorite}
              className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center
                hover:bg-black/60 hover:scale-110 active:scale-95 transition-all duration-200"
              data-testid={`button-fav-${tour.id}`}
            >
              <Heart className={`h-3.5 w-3.5 transition-colors ${favState ? "fill-red-400 text-red-400" : "text-white"}`} />
            </button>
          )}
        </div>

        {/* Bottom overlay content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          {locationLabel && (
            <div className="flex items-center gap-1 mb-1.5">
              <MapPin className="h-3 w-3 text-white/70 shrink-0" />
              <span className="text-white/70 text-xs truncate">{locationLabel}</span>
            </div>
          )}

          <h3
            className="font-bold text-white text-base sm:text-lg leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors duration-300 drop-shadow-sm"
            data-testid={`text-tour-title-${tour.id}`}
          >
            {title}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-white/60 text-xs font-medium">{t("от", "from")}</span>
              {tour.discountPercent > 0 && (
                <span className="text-white/50 text-xs line-through font-medium">
                  {formatPrice(price)}
                </span>
              )}
              <span
                className="text-xl sm:text-2xl font-extrabold leading-none text-white drop-shadow-sm"
                data-testid={`text-tour-price-${tour.id}`}
              >
                {formatPrice(discountedPrice)}
              </span>
              <span className="text-white/60 text-xs font-medium">/ {t("чел.", "p.")}</span>
            </div>

            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm text-white border border-white/20
              group-hover:bg-primary group-hover:border-primary
              transition-all duration-300">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>

    {isAdmin && showPositionEditor && tour.mainImage && (
      <Dialog open={showPositionEditor} onOpenChange={setShowPositionEditor}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Позиция изображения — {lang === "ru" ? tour.titleRu : tour.titleEn}</DialogTitle>
          </DialogHeader>
          <ImagePositionPicker
            src={tour.mainImage}
            value={pendingPosition}
            onChange={setPendingPosition}
            hint="Тяните изображение чтобы выбрать область кадрирования"
            height={220}
          />
          <div className="flex gap-2 mt-2">
            <Button
              className="flex-1"
              onClick={() => savePositionMutation.mutate(pendingPosition)}
              disabled={savePositionMutation.isPending}
            >
              <Check className="w-4 h-4 mr-1.5" />
              {savePositionMutation.isPending ? "Сохраняется…" : "Сохранить"}
            </Button>
            <Button variant="outline" onClick={() => setShowPositionEditor(false)}>
              Отмена
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}
