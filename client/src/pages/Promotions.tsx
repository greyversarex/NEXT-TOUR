import { useQuery } from "@tanstack/react-query";
import TourCard from "@/components/TourCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { Flame, Tag } from "lucide-react";
import type { Tour } from "@shared/schema";

export default function Promotions() {
  const { t } = useI18n();
  const { data: hotTours = [], isLoading: hotLoading } = useQuery<Tour[]>({ queryKey: ["/api/tours?isHot=true"] });
  const { data: discountTours = [], isLoading: discLoading } = useQuery<Tour[]>({ queryKey: ["/api/tours"] });

  const discounted = (discountTours as Tour[]).filter(t => t.discountPercent > 0 && !t.isHot);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">{t("Акции и специальные предложения", "Promotions & Special Offers")}</h1>
        <p className="text-muted-foreground">{t("Лучшие цены на незабываемые путешествия", "Best prices for unforgettable journeys")}</p>
      </div>

      {hotTours.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Flame className="h-5 w-5 text-orange-500" />
            {t("Горящие туры", "Hot Deals")}
            <Badge className="bg-orange-100 text-orange-700 ml-1">{hotTours.length}</Badge>
          </h2>
          {hotLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-64" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {hotTours.map(tour => <TourCard key={tour.id} tour={tour} />)}
            </div>
          )}
        </section>
      )}

      {discounted.length > 0 && (
        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Tag className="h-5 w-5 text-primary" />
            {t("Туры со скидкой", "Discounted Tours")}
          </h2>
          {discLoading ? (
            <div className="grid grid-cols-4 gap-5">{[1,2,3,4].map(i => <Skeleton key={i} className="h-64" />)}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {discounted.map(tour => <TourCard key={tour.id} tour={tour} />)}
            </div>
          )}
        </section>
      )}

      {hotTours.length === 0 && discounted.length === 0 && !hotLoading && (
        <div className="text-center py-16 text-muted-foreground">
          <Flame className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>{t("Нет активных акций", "No active promotions")}</p>
        </div>
      )}
    </div>
  );
}
