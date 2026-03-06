import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Clock, Heart, ArrowRight } from "lucide-react";
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
        className="group relative rounded-2xl overflow-hidden bg-card border border-card-border cursor-pointer h-full flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        data-testid={`card-tour-${tour.id}`}
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
          <img
            src={tour.mainImage || "/images/hero-banner.png"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {tour.discountPercent > 0 && (
              <Badge className="bg-red-500 text-white border-0 shadow-md text-xs font-bold" data-testid={`badge-discount-${tour.id}`}>
                -{tour.discountPercent}%
              </Badge>
            )}
            {tour.isHot && (
              <Badge className="bg-orange-500 text-white border-0 shadow-md text-xs font-bold">
                🔥 {t("Горящий", "Hot")}
              </Badge>
            )}
          </div>

          {user && (
            <button
              onClick={handleFavorite}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 hover:scale-110 transition-all duration-200"
              data-testid={`button-fav-${tour.id}`}
            >
              <Heart className={`h-4 w-4 transition-colors ${favState ? "fill-red-500 text-red-500" : "text-white"}`} />
            </button>
          )}

          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs">
            <Clock className="h-3.5 w-3.5 opacity-80" />
            <span className="font-medium">{tour.duration} {t("дн.", "days")}</span>
          </div>
        </div>

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
            <div className="flex items-center gap-1 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200">
              {t("Смотреть", "View")} <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
