import { Link } from "wouter";
import { Clock, Heart, ArrowRight, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Tour, Country, City } from "@shared/schema";
import { useState } from "react";

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

  const title = lang === "ru" ? tour.titleRu : tour.titleEn;
  const description = lang === "ru" ? tour.descriptionRu : tour.descriptionEn;
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
    <Link href={`/tours/${tour.id}`} className="block h-full">
      <div
        className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-card border border-transparent cursor-pointer
          shadow-[0_2px_12px_rgba(0,0,0,0.06)]
          hover:shadow-[0_24px_60px_-8px_rgba(0,0,0,0.25)]
          hover:-translate-y-1.5
          hover:border-primary/20
          transition-all duration-500
          flex flex-col h-full"
        data-testid={`card-tour-${tour.id}`}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] z-20 overflow-hidden rounded-t-xl sm:rounded-t-2xl">
          <div className="h-full bg-gradient-to-r from-primary via-cyan-400 to-sky-300 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
        </div>

        <div className="relative h-[140px] sm:h-[160px] overflow-hidden shrink-0">
          <img
            src={tour.mainImage || "/images/hero-banner.png"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
            {tour.discountPercent > 0 && (
              <div
                className="flex items-center gap-0.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shadow-md"
                data-testid={`badge-discount-${tour.id}`}
              >
                -{tour.discountPercent}%
              </div>
            )}
            {tour.isHot && (
              <div className="flex items-center gap-0.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shadow-md">
                🔥 {t("Горящий", "Hot")}
              </div>
            )}
          </div>

          {user && (
            <button
              onClick={handleFavorite}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center
                hover:bg-black/55 hover:scale-110 active:scale-95 transition-all duration-200"
              data-testid={`button-fav-${tour.id}`}
            >
              <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${favState ? "fill-red-400 text-red-400" : "text-white"}`} />
            </button>
          )}

          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-10 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] sm:text-xs font-semibold rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-80" />
            {tour.duration} {t("дн.", "d.")}
          </div>
        </div>

        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          {locationLabel && (
            <div className="flex items-center gap-1 mb-1 overflow-hidden">
              <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 text-primary/70" />
              <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{locationLabel}</span>
            </div>
          )}

          <h3
            className="font-bold text-sm sm:text-base leading-snug line-clamp-2 mb-1 sm:mb-1.5 group-hover:text-primary transition-colors duration-200 min-h-[2.5em] sm:min-h-[2.75em]"
            data-testid={`text-tour-title-${tour.id}`}
          >
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed overflow-hidden min-h-[2.4em] sm:min-h-[2.6em]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {description}
          </p>

          <div className="flex items-center justify-between pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-border/50">
            <div className="flex flex-col">
              <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">
                {t("от", "from")}
              </p>
              <div className="flex items-baseline gap-1">
                {tour.discountPercent > 0 && (
                  <span className="text-xs text-muted-foreground/70 line-through font-medium">
                    ${price.toFixed(0)}
                  </span>
                )}
                <span
                  className="text-lg sm:text-xl font-extrabold leading-none bg-gradient-to-br from-primary to-cyan-500 bg-clip-text text-transparent"
                  data-testid={`text-tour-price-${tour.id}`}
                >
                  ${discountedPrice.toFixed(0)}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  / {t("чел.", "p.")}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary/8 text-primary
              group-hover:bg-primary group-hover:text-white
              md:opacity-0 md:translate-x-1 md:group-hover:opacity-100 md:group-hover:translate-x-0
              transition-all duration-300">
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
