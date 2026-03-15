import { useQuery } from "@tanstack/react-query";
import TourCard from "@/components/TourCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { Flame, Tag, Sparkles } from "lucide-react";
import type { Tour } from "@shared/schema";

export default function Promotions() {
  const { t } = useI18n();
  const { data: hotTours = [], isLoading: hotLoading } = useQuery<Tour[]>({ queryKey: ["/api/tours?isHot=true"] });
  const { data: discountTours = [], isLoading: discLoading } = useQuery<Tour[]>({ queryKey: ["/api/tours"] });

  const discounted = (discountTours as Tour[]).filter(t => t.discountPercent > 0 && !t.isHot);

  return (
    <div className="min-h-screen">
      {/* Hero header — glass */}
      <div className="relative overflow-hidden bg-white/15 backdrop-blur-2xl border-b border-white/20">
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <p className="text-white/80 font-semibold text-sm uppercase tracking-widest">{t("Специальные предложения", "Special Offers")}</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight text-white drop-shadow-md">{t("Акции и скидки", "Promotions & Deals")}</h1>
          <p className="text-white/75 text-base max-w-xl leading-relaxed">
            {t("Лучшие цены на незабываемые путешествия — успейте забронировать", "Best prices for unforgettable journeys — book while they last")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {hotTours.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-md shrink-0">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight text-white drop-shadow">{t("Горящие туры", "Hot Deals")}</h2>
                <p className="text-sm text-white/70 mt-0.5">{t("Ограниченные предложения — бронируйте скорее!", "Limited time offers — book fast!")}</p>
              </div>
              <Badge className="ml-auto bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-0 rounded-full text-sm px-3 py-1 font-bold">
                {hotTours.length}
              </Badge>
            </div>
            {hotLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {hotTours.map(tour => <TourCard key={tour.id} tour={tour} />)}
              </div>
            )}
          </section>
        )}

        {discounted.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-md shrink-0">
                <Tag className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight text-white drop-shadow">{t("Туры со скидкой", "Discounted Tours")}</h2>
                <p className="text-sm text-white/70 mt-0.5">{t("Специальные цены для вас", "Special prices just for you")}</p>
              </div>
            </div>
            {discLoading ? (
              <div className="grid grid-cols-4 gap-6">{[1,2,3,4].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {discounted.map(tour => <TourCard key={tour.id} tour={tour} />)}
              </div>
            )}
          </section>
        )}

        {hotTours.length === 0 && discounted.length === 0 && !hotLoading && (
          <div className="text-center py-24 text-muted-foreground">
            <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center mx-auto mb-5">
              <Flame className="h-9 w-9 text-orange-300" />
            </div>
            <p className="text-xl font-semibold mb-2">{t("Нет активных акций", "No active promotions")}</p>
            <p className="text-sm">{t("Следите за обновлениями — скидки скоро появятся!", "Stay tuned — deals coming soon!")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
