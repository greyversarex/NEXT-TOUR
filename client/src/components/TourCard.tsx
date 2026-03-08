import { Link } from "wouter";
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
        className="group relative rounded-2xl overflow-hidden bg-white dark:bg-card border border-transparent cursor-pointer h-full flex flex-col
          shadow-[0_2px_16px_rgba(0,0,0,0.07)]
          hover:shadow-[0_32px_80px_-8px_rgba(0,0,0,0.30)]
          hover:-translate-y-2.5
          hover:border-primary/20
          transition-all duration-500"
        data-testid={`card-tour-${tour.id}`}
      >
        {/* Top accent bar — slides in on hover */}
        <div className="absolute top-0 left-0 right-0 h-[3px] z-20 overflow-hidden rounded-t-2xl">
          <div className="h-full bg-gradient-to-r from-primary via-cyan-400 to-sky-300 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
        </div>

        {/* ── IMAGE ─────────────────────────────────────────── */}
        {/* 16:10 ratio — wider & more cinematic than 4:3 */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "16/10" }}>
          <img
            src={tour.mainImage || "/images/hero-banner.png"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.12]"
          />

          {/* Persistent bottom fade for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Hover brightening sheen */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-600"
            style={{ background: "linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.07) 50%, transparent 80%)" }}
          />

          {/* ── Badges top-left ── */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {tour.discountPercent > 0 && (
              <div
                className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-lg"
                data-testid={`badge-discount-${tour.id}`}
              >
                -{tour.discountPercent}%
              </div>
            )}
            {tour.isHot && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-lg">
                🔥 {t("Горящий", "Hot")}
              </div>
            )}
          </div>

          {/* ── Favorite button top-right ── */}
          {user && (
            <button
              onClick={handleFavorite}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center
                hover:bg-black/55 hover:scale-110 active:scale-95
                transition-all duration-200"
              data-testid={`button-fav-${tour.id}`}
            >
              <Heart className={`h-4 w-4 transition-colors ${favState ? "fill-red-400 text-red-400" : "text-white"}`} />
            </button>
          )}

          {/* ── Duration pill — bottom-left ── */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold rounded-full px-2.5 py-1">
            <Clock className="h-3 w-3 opacity-80" />
            {tour.duration} {t("дн.", "d.")}
          </div>

        </div>

        {/* ── TEXT CONTENT ──────────────────────────────────── */}
        <div className="p-5 flex flex-col flex-1">
          <h3
            className="font-bold text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-primary transition-colors duration-200"
            data-testid={`text-tour-title-${tour.id}`}
          >
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">
            {description}
          </p>

          {/* ── Price row ── */}
          <div className="flex items-end justify-between pt-4 mt-auto border-t border-border/50">
            {/* Price block — elevated on hover */}
            <div className="flex flex-col">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">
                {t("от", "from")}
              </p>
              <div className="flex items-baseline gap-1.5">
                {tour.discountPercent > 0 && (
                  <span className="text-sm text-muted-foreground/70 line-through font-medium">
                    ${price.toFixed(0)}
                  </span>
                )}
                <span
                  className="text-3xl font-extrabold leading-none bg-gradient-to-br from-primary to-cyan-500 bg-clip-text text-transparent
                    transition-all duration-300"
                  data-testid={`text-tour-price-${tour.id}`}
                >
                  ${discountedPrice.toFixed(0)}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  / {t("чел.", "p.")}
                </span>
              </div>
            </div>

            {/* Arrow — slides in on hover */}
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/8 text-primary
              group-hover:bg-primary group-hover:text-white
              opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0
              transition-all duration-300">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
