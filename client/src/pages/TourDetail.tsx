import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Clock, MapPin, Star, Heart, Users, CheckCircle,
  XCircle, ChevronLeft, ChevronRight, Calendar, Tag, Loader2, ChevronDown, Send
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import TourCard from "@/components/TourCard";
import { format } from "date-fns";

export default function TourDetail() {
  const [, params] = useRoute("/tours/:id");
  const id = params?.id || "";
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentImg, setCurrentImg] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const [datesOpen, setDatesOpen] = useState(!isMobile);

  const { data, isLoading } = useQuery<any>({
    queryKey: [`/api/tours/${id}/full`],
    enabled: !!id,
  });

  const { data: allTours = [] } = useQuery<any[]>({ queryKey: ["/api/tours"] });

  const favMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/favorites/${id}`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [`/api/tours/${id}/full`] });
      toast({ title: data.isFavorite ? t("Добавлено в избранное", "Added to favorites") : t("Удалено из избранного", "Removed from favorites") });
    },
  });

  if (isLoading || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-80 rounded-2xl mb-6" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const { tour, dates, options, itinerary, reviews, priceTiers = [], isFavorite, country, city, category } = data;
  const title = lang === "ru" ? tour.titleRu : tour.titleEn;
  const description = lang === "ru" ? tour.descriptionRu : tour.descriptionEn;
  const included = lang === "ru" ? tour.includedRu : tour.includedEn;
  const notIncluded = lang === "ru" ? tour.notIncludedRu : tour.notIncludedEn;
  const countryName = country ? (lang === "ru" ? country.nameRu : country.nameEn) : null;
  const cityName = city ? (lang === "ru" ? city.nameRu : city.nameEn) : null;
  const categoryName = category ? (lang === "ru" ? category.nameRu : category.nameEn) : null;

  const { formatPrice, convertPrice, currentSymbol } = useCurrency();
  const price = Number(tour.basePrice);
  const discountedPrice = tour.discountPercent > 0 ? price * (1 - tour.discountPercent / 100) : price;

  const images = [tour.mainImage, ...(tour.images || [])].filter(Boolean);
  const recommendedTours = allTours.filter((t: any) => t.id !== id && t.countryId === tour.countryId).slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cinematic Gallery */}
      <div className="relative mb-0 rounded-t-3xl overflow-hidden bg-muted h-80 md:h-[480px] shadow-[0_8px_48px_rgba(0,0,0,0.18)]">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImg]}
              alt={title}
              className="w-full h-full object-cover transition-all duration-700"
              style={(() => {
                if (currentImg === 0) {
                  return {
                    objectPosition: tour.mainImagePosition || "50% 50%",
                  };
                }
                const meta = (tour as any).imagesMeta?.[currentImg - 1];
                const pos = meta?.position || "50% 50%";
                const sc = meta?.scale || 1;
                return {
                  objectPosition: pos,
                  transform: sc !== 1 ? `scale(${sc})` : undefined,
                  transformOrigin: pos,
                };
              })()}
            />
            {/* Bottom gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImg(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentImg(i => (i + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImg(i)}
                      className={`rounded-full transition-all duration-300 ${i === currentImg ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"}`}
                    />
                  ))}
                </div>
              </>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-5 right-5 flex gap-2">
                {images.slice(0, 4).map((img: string, i: number) => {
                  const thumbMeta = i === 0
                    ? { position: tour.mainImagePosition || "50% 50%", scale: 1 }
                    : { position: (tour as any).imagesMeta?.[i - 1]?.position || "50% 50%", scale: (tour as any).imagesMeta?.[i - 1]?.scale || 1 };
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentImg(i)}
                      className={`w-16 h-11 rounded-xl border-2 overflow-hidden transition-all duration-200 hover:scale-105 ${i === currentImg ? "border-white shadow-lg" : "border-white/40 opacity-70 hover:opacity-100"}`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: thumbMeta.position,
                          transform: thumbMeta.scale !== 1 ? `scale(${thumbMeta.scale})` : undefined,
                          transformOrigin: thumbMeta.position,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            {t("Нет фото", "No photos")}
          </div>
        )}
        {tour.discountPercent > 0 && (
          <Badge className="absolute top-5 left-5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm px-4 py-1.5 rounded-full shadow-lg border-0 font-bold">
            -{tour.discountPercent}% {t("скидка", "off")}
          </Badge>
        )}
        {tour.isHot && (
          <Badge className="absolute top-5 left-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm px-4 py-1.5 rounded-full shadow-lg border-0 font-bold">
            🔥 {t("Горящий", "Hot Deal")}
          </Badge>
        )}
      </div>

      {/* Content card — connects to gallery above */}
      <div className="bg-card border border-card-border border-t-0 rounded-b-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Main Content */}
          <div className="lg:col-span-2 p-6 md:p-8 border-r border-border/30">
            <div className="flex items-start justify-between mb-5">
              <h1 className="text-2xl md:text-4xl font-extrabold leading-tight" data-testid="text-tour-detail-title">{title}</h1>
              <button
                onClick={() => user ? favMutation.mutate() : setAuthOpen(true)}
                className="w-11 h-11 rounded-2xl bg-muted/60 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-all duration-200 hover:scale-110 shrink-0 ml-3"
                data-testid="button-toggle-favorite"
              >
                <Heart className={`h-5 w-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-7">
              {/* Duration */}
              <span className="flex items-center gap-1.5 text-sm font-medium bg-muted/60 rounded-full px-3 py-1.5">
                <Clock className="h-4 w-4 text-primary" /> {tour.duration} {t("дней", "days")}
              </span>

              {/* Country */}
              {countryName && (
                <span className="flex items-center gap-1.5 text-sm font-medium bg-muted/60 rounded-full px-3 py-1.5">
                  {country?.countryCode
                    ? <span className="text-base leading-none">{String.fromCodePoint(...[...country.countryCode.toUpperCase()].map(c => 0x1F1E0 - 65 + c.charCodeAt(0)))}</span>
                    : <MapPin className="h-4 w-4 text-primary" />
                  }
                  {countryName}
                </span>
              )}

              {/* City */}
              {cityName && (
                <span className="flex items-center gap-1.5 text-sm font-medium bg-muted/60 rounded-full px-3 py-1.5">
                  <MapPin className="h-4 w-4 text-primary/70" />
                  {cityName}
                </span>
              )}

              {/* Category */}
              {categoryName && (
                <span className="flex items-center gap-1.5 text-sm font-medium bg-primary/10 text-primary rounded-full px-3 py-1.5">
                  <Tag className="h-4 w-4" />
                  {categoryName}
                </span>
              )}

              {/* Hot deal */}
              {tour.isHot && (
                <span className="flex items-center gap-1.5 text-sm font-bold bg-orange-100 dark:bg-orange-950/30 text-orange-600 rounded-full px-3 py-1.5">
                  🔥 {t("Горящий", "Hot Deal")}
                </span>
              )}

              {/* Discount */}
              {tour.discountPercent > 0 && (
                <span className="flex items-center gap-1 text-sm font-bold bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-full px-3 py-1.5">
                  −{tour.discountPercent}% {t("скидка", "off")}
                </span>
              )}

              {/* Stars */}
              <div className="flex items-center gap-1 ml-auto">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(tour.rating || 0)) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                ))}
              </div>
            </div>

            <Tabs defaultValue="description">
            <TabsList className="mb-6 flex-wrap gap-1 h-auto">
              <TabsTrigger value="description">{t("Описание", "Description")}</TabsTrigger>
              <TabsTrigger value="program">{t("Программа", "Itinerary")}</TabsTrigger>
              <TabsTrigger value="included">{t("Включено", "Included")}</TabsTrigger>
              {reviews.length > 0 && <TabsTrigger value="reviews">{t("Отзывы", "Reviews")} ({reviews.length})</TabsTrigger>}
              {tour.mapUrl && <TabsTrigger value="map">{t("На карте", "On the Map")}</TabsTrigger>}
            </TabsList>

            <TabsContent value="description">
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{description}</p>
            </TabsContent>

            <TabsContent value="program">
              {itinerary.length === 0 ? (
                <p className="text-muted-foreground">{t("Программа не добавлена", "No itinerary available")}</p>
              ) : (
                <div className="space-y-6">
                  {itinerary.map((item: any) => (
                    <div key={item.id} className="relative">
                      <div className="flex gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {item.dayNumber}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{lang === "ru" ? item.titleRu : item.titleEn}</h4>
                          {(lang === "ru" ? item.descriptionRu : item.descriptionEn) && (
                            <p className="text-sm text-muted-foreground mt-1">{lang === "ru" ? item.descriptionRu : item.descriptionEn}</p>
                          )}
                          {item.durationHours && (
                            <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {item.durationHours} {t("ч.", "hrs.")}
                            </span>
                          )}
                          {item.stops && item.stops.length > 0 && (
                            <div className="mt-3 ml-1 border-l-2 border-primary/20 pl-4 space-y-3">
                              {item.stops.map((stop: any, idx: number) => (
                                <div key={stop.id} className="relative">
                                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary/40 border-2 border-background" />
                                  <div>
                                    <p className="text-sm font-medium">{idx + 1}. {lang === "ru" ? stop.titleRu : stop.titleEn}</p>
                                    {(lang === "ru" ? stop.descriptionRu : stop.descriptionEn) && (
                                      <p className="text-xs text-muted-foreground mt-0.5">{lang === "ru" ? stop.descriptionRu : stop.descriptionEn}</p>
                                    )}
                                    {stop.durationMinutes && (
                                      <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {stop.durationMinutes} {t("мин.", "min.")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="included">
              <div className="grid md:grid-cols-2 gap-6">
                {included && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" /> {t("Включено", "Included")}
                    </h4>
                    <ul className="space-y-2">
                      {included.split("\n").filter(Boolean).map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {notIncluded && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-destructive">
                      <XCircle className="h-4 w-4" /> {t("Не включено", "Not Included")}
                    </h4>
                    <ul className="space-y-2">
                      {notIncluded.split("\n").filter(Boolean).map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-4">
                {reviews.map((rev: any) => (
                  <div key={rev.id} className="bg-card border border-card-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-medium text-sm">{rev.user?.name}</span>
                        <div className="flex mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{format(new Date(rev.createdAt), "dd.MM.yyyy")}</span>
                    </div>
                    <p className="text-sm text-foreground/80">{lang === "ru" ? rev.textRu : (rev.textEn || rev.textRu)}</p>
                  </div>
                ))}
              </div>
              {user && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">{t("Оставить отзыв", "Write a Review")}</h4>
                  <ReviewForm tourId={id} />
                </div>
              )}
            </TabsContent>

            {tour.mapUrl && (
              <TabsContent value="map">
                <div className="rounded-2xl overflow-hidden shadow-lg border-0 bg-muted">
                  <iframe
                    src={tour.mapUrl.includes("maps.google.com/maps?") && !tour.mapUrl.includes("output=embed")
                      ? tour.mapUrl.replace("maps.google.com/maps?", "maps.google.com/maps?output=embed&")
                      : tour.mapUrl
                    }
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1 p-6 md:p-8">
          <div className="sticky top-24">
            <div className="rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.18)] border border-white/50 dark:border-white/10">
              {/* Sidebar header gradient */}
              <div className="bg-gradient-to-br from-primary to-cyan-500 px-6 py-5">
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">{t("Стоимость", "Price")}</p>
                {priceTiers.length > 0 ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-white">
                        {t("от", "from")} {formatPrice(Math.min(...priceTiers.map((t: any) => Number(t.pricePerPerson))))}
                      </span>
                      <span className="text-white/70 text-sm">/ {t("чел.", "person")}</span>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {priceTiers.map((tier: any) => (
                        <div key={tier.id} className="flex items-center justify-between bg-white/15 rounded-xl px-3 py-1.5">
                          <span className="text-white/90 text-xs">{tier.minPeople}–{tier.maxPeople} {t("чел.", "ppl")}{(tier.labelRu || tier.labelEn) ? ` · ${lang === "ru" ? (tier.labelRu || tier.labelEn) : (tier.labelEn || tier.labelRu)}` : ""}</span>
                          <span className="text-white font-bold text-sm">{formatPrice(tier.pricePerPerson)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-white/60 text-xs mt-2">{t("Цена зависит от размера группы", "Price depends on group size")}</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2">
                      {tour.discountPercent > 0 && (
                        <span className="text-white/50 line-through text-base">{formatPrice(price)}</span>
                      )}
                      <span className="text-3xl font-extrabold text-white">{formatPrice(discountedPrice)}</span>
                      <span className="text-white/70 text-sm">/ {t("чел.", "person")}</span>
                    </div>
                    {tour.discountPercent > 0 && (
                      <div className="mt-2 inline-flex items-center bg-white/20 rounded-full px-3 py-1 text-white text-xs font-bold">
                        -{tour.discountPercent}% {t("скидка", "discount")}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="bg-card p-4 md:p-5">
                {(tour.customDatesTextRu || tour.customDatesTextEn) ? (
                  <div className="mb-3 md:mb-5">
                    <p className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {t("Доступные даты:", "Available dates:")}
                    </p>
                    <p className="text-sm text-foreground/80 p-3 bg-muted/40 rounded-xl whitespace-pre-line">
                      {lang === "ru" ? (tour.customDatesTextRu || tour.customDatesTextEn) : (tour.customDatesTextEn || tour.customDatesTextRu)}
                    </p>
                  </div>
                ) : dates.length > 0 ? (
                  <div className="mb-3 md:mb-5">
                    <button
                      type="button"
                      className="text-sm font-semibold flex items-center gap-1.5 mb-3 w-full md:cursor-default"
                      onClick={() => setDatesOpen(p => !p)}
                      data-testid="toggle-dates"
                    >
                      <Calendar className="h-4 w-4 text-primary" />
                      {t("Доступные даты:", "Available dates:")}
                      <ChevronDown className={`h-4 w-4 ml-auto md:hidden transition-transform ${datesOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`space-y-2 ${datesOpen ? "" : "hidden md:block"}`}>
                      {dates.slice(0, 3).map((d: any) => (
                        <div key={d.id} className="flex justify-between items-center text-sm bg-muted/60 rounded-xl px-3.5 py-2 md:py-2.5 border border-border/40">
                          <span className="flex items-center gap-1.5 text-foreground/80">
                            {format(new Date(d.startDate), "dd MMM")} – {format(new Date(d.endDate), "dd MMM yyyy")}
                          </span>
                          <Badge variant="secondary" className="text-xs rounded-full">
                            {d.maxPeople - d.bookedCount} {t("мест", "spots")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-3 md:mb-5 p-3 bg-muted/40 rounded-xl">
                    {t("Уточняйте даты у менеджера", "Contact us for available dates")}
                  </p>
                )}

                <Button
                  className="w-full h-12 rounded-2xl font-bold text-base shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  onClick={() => user ? setBookingOpen(true) : setAuthOpen(true)}
                  data-testid="button-book-now"
                >
                  {t("Забронировать", "Book Now")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-10 rounded-2xl text-sm font-medium mt-2.5"
                  onClick={() => {
                    const tourTitle = lang === "ru" ? tour.titleRu : tour.titleEn;
                    const msg = encodeURIComponent(t(
                      `Здравствуйте! Хочу узнать подробнее о туре "${tourTitle}".`,
                      `Hello! I'd like to learn more about the tour "${tourTitle}".`
                    ));
                    window.open(`https://wa.me/992885260101?text=${msg}`, "_blank");
                  }}
                  data-testid="button-send-request"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {t("Отправить заявку", "Send Request")}
                </Button>
                {!user && (
                  <p className="text-xs text-muted-foreground text-center mt-2.5">
                    {t("Войдите чтобы забронировать", "Sign in to book")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {recommendedTours.length > 0 && (
        <div className="mt-16 pt-12 border-t border-border/40">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-8">{t("Похожие туры", "Similar Tours")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedTours.map((tour: any) => <TourCard key={tour.id} tour={tour} />)}
          </div>
        </div>
      )}

      {bookingOpen && (
        <BookingModal
          tour={tour}
          dates={dates}
          options={options}
          priceTiers={priceTiers}
          onClose={() => setBookingOpen(false)}
        />
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

function ReviewForm({ tourId }: { tourId: string }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/reviews", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tours/${tourId}/full`] });
      toast({ title: t("Отзыв отправлен на модерацию", "Review submitted for moderation") });
      setText("");
    },
  });

  const ratingLabels = [
    t("Ужасно", "Terrible"),
    t("Плохо", "Bad"),
    t("Нормально", "Okay"),
    t("Хорошо", "Good"),
    t("Отлично", "Excellent"),
  ];

  return (
    <form onSubmit={e => { e.preventDefault(); mutation.mutate({ tourId, rating, textRu: text }); }} className="bg-muted/30 rounded-xl border border-border p-4 space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">{t("Ваша оценка", "Your rating")}</p>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button key={i} type="button" onClick={() => setRating(i + 1)} className="transition-transform hover:scale-110">
              <Star className={`h-7 w-7 cursor-pointer transition-colors ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-300"}`} />
            </button>
          ))}
          <span className="ml-2 text-sm font-medium text-muted-foreground">{ratingLabels[rating - 1]}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium mb-2">{t("Ваш отзыв", "Your review")}</p>
        <textarea
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          placeholder={t("Расскажите о впечатлениях от тура...", "Share your experience with this tour...")}
          value={text}
          onChange={e => setText(e.target.value)}
          required
          data-testid="input-review-text"
        />
      </div>
      <Button type="submit" className="h-10 px-6" disabled={mutation.isPending} data-testid="button-review-submit">
        {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />{t("Отправка...", "Sending...")}</> : t("Отправить отзыв", "Submit Review")}
      </Button>
    </form>
  );
}

function CounterField({ label, subLabel, value, min, max, onChange }: { label: string; subLabel?: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {subLabel && <p className="text-xs text-muted-foreground">{subLabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-lg font-bold transition-colors hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
        >−</button>
        <span className="w-6 text-center font-semibold text-base">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-lg font-bold transition-colors hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
        >+</button>
      </div>
    </div>
  );
}

function BookingModal({ tour, dates, options, priceTiers = [], preselectedOptions = [], initialAdults = 1, initialChildren = 0, onClose }: any) {
  const { t, lang } = useI18n();
  const { formatPrice, convertPrice, currentSymbol } = useCurrency();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [selectedDateId, setSelectedDateId] = useState(dates[0]?.id || "");
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(preselectedOptions);
  const [paymentType, setPaymentType] = useState<"prepay" | "full">("full");
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [payGate, setPayGate] = useState("korti_milli");

  const totalPeople = adults + children;

  const getTierPrice = () => {
    if (priceTiers.length === 0) return null;
    const sorted = [...priceTiers].sort((a: any, b: any) => a.minPeople - b.minPeople);
    const tier = sorted.find((t: any) => totalPeople >= t.minPeople && totalPeople <= t.maxPeople);
    if (tier) return Number(tier.pricePerPerson);
    if (totalPeople > sorted[sorted.length - 1].maxPeople) return Number(sorted[sorted.length - 1].pricePerPerson);
    const nextTier = sorted.find((t: any) => totalPeople < t.minPeople);
    if (nextTier) return Number(nextTier.pricePerPerson);
    return Number(sorted[0].pricePerPerson);
  };

  const tierPrice = getTierPrice();
  const activeTier = priceTiers.length > 0 ? priceTiers.find((t: any) => totalPeople >= t.minPeople && totalPeople <= t.maxPeople) : null;
  const basePrice = tierPrice !== null ? tierPrice : Number(tour.basePrice) * (1 - tour.discountPercent / 100);
  const optionsTotal = options
    .filter((o: any) => selectedOptions.includes(o.id))
    .reduce((sum: number, o: any) => sum + Number(o.price), 0);
  const travelers = adults + children * 0.5;
  const totalPrice = tierPrice !== null
    ? (tierPrice + optionsTotal) * totalPeople
    : (basePrice + optionsTotal) * travelers;
  const toPay = paymentType === "prepay" ? totalPrice * 0.3 : totalPrice;

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/bookings", data),
    onSuccess: (booking: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setCreatedBookingId(booking.id);
    },
  });

  const payMutation = useMutation({
    mutationFn: ({ bookingId, gate }: { bookingId: string; gate: string }) =>
      apiRequest("POST", "/api/payments/initiate", { bookingId, gate }),
    onSuccess: (data: any) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (err: any) => {
      toast({ title: t("Ошибка оплаты", "Payment error"), description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      tourId: tour.id,
      tourDateId: selectedDateId || null,
      adults,
      children,
      selectedOptions,
      totalPrice: totalPrice.toFixed(2),
      paymentType,
    });
  };

  const selectedDate = dates.find((d: any) => d.id === selectedDateId);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 text-primary-foreground shrink-0">
          <DialogTitle className="text-lg font-bold text-white">
            {createdBookingId ? t("Бронирование создано!", "Booking Created!") : t("Бронирование тура", "Book Tour")}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-0.5 truncate">{lang === "ru" ? tour.titleRu : tour.titleEn}</p>
        </div>

        {createdBookingId ? (
          <div className="px-6 py-8 space-y-6 text-center">
            <div className="space-y-2">
              <CheckCircle className="h-14 w-14 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold">{t("Заявка принята!", "Request Accepted!")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("Оплатите тур онлайн прямо сейчас через Alif Bank или наш менеджер свяжется с вами.", "Pay for your tour online now via Alif Bank, or our manager will contact you.")}
              </p>
            </div>

            <div className="bg-muted/40 rounded-xl px-5 py-4 text-left space-y-2 text-sm border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("К оплате", "Amount due")}</span>
                <span className="font-bold text-primary text-base">{formatPrice(toPay)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("Тип оплаты", "Payment type")}</span>
                <span className="font-medium">{paymentType === "prepay" ? t("Предоплата 30%", "Deposit 30%") : t("Полная оплата", "Full payment")}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-left font-medium mb-1">{t("Способ оплаты:", "Payment method:")}</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "korti_milli", label: "Корти Милли" },
                  { value: "wallet", label: "Alif Mobi" },
                  { value: "salom", label: "Рассрочка Salom" },
                  { value: "invoice", label: t("Наличными", "Cash Invoice") },
                ].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setPayGate(g.value)}
                    className={`rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all text-left ${payGate === g.value ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                data-testid="button-pay-later"
              >
                {t("Позже", "Later")}
              </Button>
              <Button
                type="button"
                className="flex-1 font-semibold"
                disabled={payMutation.isPending}
                onClick={() => payMutation.mutate({ bookingId: createdBookingId!, gate: payGate })}
                data-testid="button-pay-online"
              >
                {payMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {t("Оплатить онлайн", "Pay Online")}
              </Button>
            </div>
          </div>
        ) : (

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-4 space-y-5">

            {dates.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  {t("Выберите дату", "Select Date")}
                </p>
                <Select value={selectedDateId} onValueChange={setSelectedDateId}>
                  <SelectTrigger data-testid="select-booking-date" className="h-11">
                    <SelectValue placeholder={t("Выберите дату", "Select date")} />
                  </SelectTrigger>
                  <SelectContent>
                    {dates.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>
                        {format(new Date(d.startDate), "dd.MM.yyyy")} – {format(new Date(d.endDate), "dd.MM.yyyy")}
                        {"  "}({d.maxPeople - d.bookedCount} {t("мест", "spots")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDate && (
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {tour.duration} {t("дней", "days")} · {t("Свободно:", "Available:")} {selectedDate.maxPeople - selectedDate.bookedCount} {t("мест", "spots")}
                  </p>
                )}
              </div>
            )}

            <div className="rounded-xl border border-border divide-y divide-border">
              <div className="px-4">
                <p className="text-sm font-semibold pt-3 pb-1 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary" />
                  {t("Туристы", "Travelers")}
                </p>
                <CounterField
                  label={t("Взрослые", "Adults")}
                  value={adults}
                  min={1}
                  max={10}
                  onChange={setAdults}
                />
              </div>
              <div className="px-4 pb-2">
                <CounterField
                  label={t("Дети", "Children")}
                  subLabel={priceTiers.length > 0 ? t("учитываются в кол-ве участников", "counted in group size") : t("до 12 лет — 50% цены", "under 12 — 50% price")}
                  value={children}
                  min={0}
                  max={6}
                  onChange={setChildren}
                />
              </div>
              {priceTiers.length > 0 && activeTier && (
                <div className="px-4 py-2 bg-primary/5 border-t border-border">
                  <p className="text-xs text-primary font-semibold flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {totalPeople} {t("чел.", "ppl")} — {formatPrice(activeTier.pricePerPerson)}/{t("чел.", "person")}
                    {(activeTier.labelRu || activeTier.labelEn) && (
                      <span className="text-muted-foreground font-normal">({lang === "ru" ? (activeTier.labelRu || activeTier.labelEn) : (activeTier.labelEn || activeTier.labelRu)})</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {options.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-primary" />
                  {t("Дополнительные опции", "Add-ons")}
                </p>
                <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                  {options.map((opt: any) => {
                    const checked = selectedOptions.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${checked ? "bg-primary/8" : "hover:bg-muted/60"}`}
                        data-testid={`modal-addon-${opt.id}`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={v => setSelectedOptions(prev =>
                            v ? [...prev, opt.id] : prev.filter(id => id !== opt.id)
                          )}
                        />
                        <span className="flex-1 text-sm">{lang === "ru" ? opt.nameRu : opt.nameEn}</span>
                        <span className={`text-sm font-semibold ${checked ? "text-primary" : "text-muted-foreground"}`}>
                          +{formatPrice(opt.price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-semibold mb-3">{t("Способ оплаты", "Payment Option")}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "prepay", label: t("Предоплата", "Deposit"), sub: "30%", amount: totalPrice * 0.3 },
                  { value: "full", label: t("Полная оплата", "Full Payment"), sub: "100%", amount: totalPrice },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPaymentType(opt.value as any)}
                    className={`rounded-xl border-2 px-4 py-3 text-left transition-all ${paymentType === opt.value
                      ? "border-primary bg-primary/8 shadow-sm"
                      : "border-border hover:border-primary/50"}`}
                    data-testid={`payment-option-${opt.value}`}
                  >
                    <div className="text-xs text-muted-foreground mb-0.5">{opt.label}</div>
                    <div className={`text-lg font-bold ${paymentType === opt.value ? "text-primary" : ""}`}>
                      {formatPrice(opt.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">{opt.sub} {t("от суммы", "of total")}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="rounded-xl bg-muted/50 border border-border p-4 mb-4 space-y-1.5">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{tierPrice !== null ? `${formatPrice(tierPrice)} × ${totalPeople} ${t("чел.", "ppl")}` : `${t("Базовая цена", "Base price")} × ${travelers}`}</span>
                <span>{formatPrice(tierPrice !== null ? tierPrice * totalPeople : basePrice * travelers)}</span>
              </div>
              {optionsTotal > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t("Дополнительные опции", "Add-ons")} × {tierPrice !== null ? totalPeople : travelers}</span>
                  <span>+{formatPrice(optionsTotal * (tierPrice !== null ? totalPeople : travelers))}</span>
                </div>
              )}
              {paymentType === "prepay" && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t("Полная стоимость", "Full amount")}</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="font-semibold">{t("К оплате сейчас", "To pay now")}</span>
                <span className="text-xl font-bold text-primary">{formatPrice(toPay)}</span>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={mutation.isPending} data-testid="button-confirm-booking">
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />{t("Создание...", "Creating...")}</>
              ) : (
                t("Подтвердить бронирование", "Confirm Booking")
              )}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
