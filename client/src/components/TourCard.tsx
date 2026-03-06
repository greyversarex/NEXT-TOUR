import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Heart } from "lucide-react";
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
      <div className="group rounded-lg overflow-hidden bg-card border border-card-border hover-elevate cursor-pointer h-full flex flex-col" data-testid={`card-tour-${tour.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={tour.mainImage || "/images/hero-banner.png"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {tour.discountPercent > 0 && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground" data-testid={`badge-discount-${tour.id}`}>
              -{tour.discountPercent}%
            </Badge>
          )}
          {tour.isHot && (
            <Badge className="absolute top-3 left-3 bg-orange-500 text-white">
              {t("Горящий", "Hot Deal")}
            </Badge>
          )}

          {user && (
            <button
              onClick={handleFavorite}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/30 backdrop-blur-sm transition-colors hover:bg-black/50"
              data-testid={`button-fav-${tour.id}`}
            >
              <Heart className={`h-4 w-4 ${favState ? "fill-red-500 text-red-500" : "text-white"}`} />
            </button>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-base leading-snug mb-1 line-clamp-2" data-testid={`text-tour-title-${tour.id}`}>{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{description}</p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {tour.duration} {t("дн.", "days")}
            </span>
          </div>

          <div className="flex items-end justify-between pt-2 border-t border-card-border">
            <div>
              {tour.discountPercent > 0 && (
                <span className="text-sm text-muted-foreground line-through mr-1">
                  ${price.toFixed(0)}
                </span>
              )}
              <span className="text-lg font-bold text-primary" data-testid={`text-tour-price-${tour.id}`}>
                ${discountedPrice.toFixed(0)}
              </span>
              <span className="text-xs text-muted-foreground ml-1">/ {t("чел.", "person")}</span>
            </div>
            <Button size="sm" variant="outline" data-testid={`button-view-${tour.id}`}>
              {t("Подробнее", "View")}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
