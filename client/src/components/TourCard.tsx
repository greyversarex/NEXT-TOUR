import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Clock, Heart, ArrowRight, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Tour } from "@shared/schema";
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
    <Link href={`/tours/${tour.id}`}>
      <div
        className="group relative rounded-2xl overflow-hidden bg-card border border-card-border cursor-pointer h-full flex flex-col
          shadow-sm
          hover:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.22)]
          hover:-translate-y-2
          transition-all duration-350 ease-out"
        style={{ transition: "transform 0.35s ease-out, box-shadow 0.35s ease-out" }}
        data-testid={`card-tour-${tour.id}`}
      >
        {/* Top accent bar — slides in from left on hover */}
        <div className="absolute top-0 left-0 right-0 h-[3px] z-20 overflow-hidden rounded-t-2xl">
          <div className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/50 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out" />
        </div>

        {/* Image area */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
          {/* Photo with smooth zoom */}
          <img
            src={tour.mainImage || "/images/hero-banner.png"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
          />

          {/* Base gradient — deepens on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent transition-opacity duration-350 group-hover:opacity-90" />

          {/* Sheen / glare flash on hover */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)",
            }}
          />

          {/* Badges: discount / hot */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {tour.discountPercent > 0 && (
              <Badge
                className="bg-red-500 text-white border-0 shadow-md text-xs font-bold"
                data-testid={`badge-discount-${tour.id}`}
              >
                -{tour.discountPercent}%
              </Badge>
            )}
            {tour.isHot && (
              <Badge className="bg-orange-500 text-white border-0 shadow-md text-xs font-bold">
                🔥 {t("Горящий", "Hot")}
              </Badge>
            )}
          </div>

          {/* Favorite button */}
          {user && (
            <button
              onClick={handleFavorite}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/30 backdrop-blur-sm
                hover:bg-black/55 hover:scale-110 active:scale-95
                transition-all duration-200"
              data-testid={`button-fav-${tour.id}`}
            >
              <Heart className={`h-4 w-4 transition-colors ${favState ? "fill-red-500 text-red-500" : "text-white"}`} />
            </button>
          )}

          {/* Duration badge — bottom left */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 text-white text-xs">
            <Clock className="h-3.5 w-3.5 opacity-80" />
            <span className="font-semibold">{tour.duration} {t("дн.", "days")}</span>
          </div>

          {/* "View tour" CTA — slides up from bottom on hover */}
          <div className="absolute bottom-0 inset-x-0 z-10 flex items-center justify-center pb-4 pt-8
            opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0
            transition-all duration-300 ease-out pointer-events-none">
            <span className="flex items-center gap-1.5 text-white text-sm font-semibold
              bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              {t("Смотреть тур", "View Tour")} <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* Text content */}
        <div className="p-4 flex flex-col flex-1">
          <h3
            className="font-bold text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-primary transition-colors duration-200"
            data-testid={`text-tour-title-${tour.id}`}
          >
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">
            {description}
          </p>

          {/* Price row */}
          <div className="flex items-end justify-between border-t border-card-border pt-3 mt-auto">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t("от", "from")}</p>
              <div className="flex items-baseline gap-1.5">
                {tour.discountPercent > 0 && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${price.toFixed(0)}
                  </span>
                )}
                <span
                  className="text-xl font-bold text-primary"
                  data-testid={`text-tour-price-${tour.id}`}
                >
                  ${discountedPrice.toFixed(0)}
                </span>
                <span className="text-xs text-muted-foreground">/ {t("чел.", "p.")}</span>
              </div>
            </div>

            {/* Arrow link — hidden until hover, slides in from right */}
            <div className="flex items-center gap-1 text-primary text-sm font-semibold
              opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0
              transition-all duration-250 ease-out">
              {t("Подробнее", "Details")} <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
