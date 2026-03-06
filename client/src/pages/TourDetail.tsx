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
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Clock, MapPin, Star, Heart, Users, CheckCircle,
  XCircle, ChevronLeft, ChevronRight, Calendar, Tag, Loader2
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
  const [sidebarOptions, setSidebarOptions] = useState<string[]>([]);

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

  const { tour, dates, priceComponents, options, itinerary, reviews, isFavorite } = data;
  const title = lang === "ru" ? tour.titleRu : tour.titleEn;
  const description = lang === "ru" ? tour.descriptionRu : tour.descriptionEn;
  const included = lang === "ru" ? tour.includedRu : tour.includedEn;
  const notIncluded = lang === "ru" ? tour.notIncludedRu : tour.notIncludedEn;

  const price = Number(tour.basePrice);
  const discountedPrice = tour.discountPercent > 0 ? price * (1 - tour.discountPercent / 100) : price;

  const images = [tour.mainImage, ...(tour.images || [])].filter(Boolean);
  const recommendedTours = allTours.filter((t: any) => t.id !== id && t.countryId === tour.countryId).slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Gallery */}
      <div className="relative mb-8 rounded-2xl overflow-hidden bg-muted h-72 md:h-[420px]">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImg]}
              alt={title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button onClick={() => setCurrentImg(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={() => setCurrentImg(i => (i + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_: any, i: number) => (
                    <button key={i} onClick={() => setCurrentImg(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentImg ? "bg-white" : "bg-white/50"}`} />
                  ))}
                </div>
              </>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                {images.slice(0, 4).map((img: string, i: number) => (
                  <button key={i} onClick={() => setCurrentImg(i)}
                    className={`w-14 h-10 rounded border-2 overflow-hidden transition-all ${i === currentImg ? "border-white" : "border-white/40"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            {t("Нет фото", "No photos")}
          </div>
        )}
        {tour.discountPercent > 0 && (
          <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm px-3 py-1">
            -{tour.discountPercent}% {t("скидка", "off")}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-tour-detail-title">{title}</h1>
            <button
              onClick={() => user ? favMutation.mutate() : setAuthOpen(true)}
              className="p-2 rounded-full hover:bg-muted transition-colors shrink-0 ml-2"
              data-testid="button-toggle-favorite"
            >
              <Heart className={`h-6 w-6 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {tour.duration} {t("дней", "days")}</span>
            {tour.isHot && <Badge className="bg-orange-500 text-white">{t("Горящий", "Hot Deal")}</Badge>}
          </div>

          <Tabs defaultValue="description">
            <TabsList className="mb-6 flex-wrap gap-1 h-auto">
              <TabsTrigger value="description">{t("Описание", "Description")}</TabsTrigger>
              <TabsTrigger value="program">{t("Программа", "Itinerary")}</TabsTrigger>
              <TabsTrigger value="included">{t("Включено", "Included")}</TabsTrigger>
              {reviews.length > 0 && <TabsTrigger value="reviews">{t("Отзывы", "Reviews")} ({reviews.length})</TabsTrigger>}
            </TabsList>

            <TabsContent value="description">
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{description}</p>
            </TabsContent>

            <TabsContent value="program">
              {itinerary.length === 0 ? (
                <p className="text-muted-foreground">{t("Программа не добавлена", "No itinerary available")}</p>
              ) : (
                <div className="space-y-4">
                  {itinerary.map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {item.dayNumber}
                      </div>
                      <div>
                        <h4 className="font-semibold">{lang === "ru" ? item.titleRu : item.titleEn}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{lang === "ru" ? item.descriptionRu : item.descriptionEn}</p>
                        {item.durationHours && (
                          <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {item.durationHours}h
                          </span>
                        )}
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
                {priceComponents.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("Состав цены", "Price Components")}</h4>
                    <div className="space-y-2">
                      {priceComponents.map((pc: any) => (
                        <div key={pc.id} className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {pc.included ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                            {lang === "ru" ? pc.component?.nameRu : pc.component?.nameEn}
                          </span>
                          <span className="font-medium">${Number(pc.price).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
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
          </Tabs>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t("Забронировать", "Book Now")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-4">
                {tour.discountPercent > 0 && (
                  <span className="text-muted-foreground line-through text-sm">${price.toFixed(0)}</span>
                )}
                <span className="text-2xl font-bold text-primary">${discountedPrice.toFixed(0)}</span>
                <span className="text-sm text-muted-foreground">/ {t("чел.", "person")}</span>
              </div>

              {dates.length > 0 ? (
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium">{t("Доступные даты:", "Available dates:")}</p>
                  {dates.slice(0, 3).map((d: any) => (
                    <div key={d.id} className="flex justify-between items-center text-sm bg-muted rounded-md px-3 py-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {format(new Date(d.startDate), "dd MMM")} – {format(new Date(d.endDate), "dd MMM yyyy")}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {d.maxPeople - d.bookedCount} {t("мест", "spots")}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">{t("Уточняйте даты у менеджера", "Contact us for available dates")}</p>
              )}

              {options.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-primary" />
                    {t("Дополнительно:", "Add-ons:")}
                  </p>
                  <div className="space-y-2 rounded-lg border border-border p-3 bg-muted/30">
                    {options.map((opt: any) => {
                      const checked = sidebarOptions.includes(opt.id);
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center justify-between gap-2 cursor-pointer rounded-md px-2 py-1.5 transition-colors ${checked ? "bg-primary/10" : "hover:bg-muted"}`}
                          data-testid={`checkbox-addon-${opt.id}`}
                        >
                          <span className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={v =>
                                setSidebarOptions(prev =>
                                  v ? [...prev, opt.id] : prev.filter(x => x !== opt.id)
                                )
                              }
                            />
                            {lang === "ru" ? opt.nameRu : opt.nameEn}
                          </span>
                          <span className={`text-xs font-semibold shrink-0 ${checked ? "text-primary" : "text-muted-foreground"}`}>
                            +${Number(opt.price).toFixed(0)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {sidebarOptions.length > 0 && (
                    <p className="text-xs text-primary font-medium mt-2 text-right">
                      +${options.filter((o: any) => sidebarOptions.includes(o.id)).reduce((s: number, o: any) => s + Number(o.price), 0).toFixed(0)} {t("доп. опции", "add-ons")}
                    </p>
                  )}
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => user ? setBookingOpen(true) : setAuthOpen(true)}
                data-testid="button-book-now"
              >
                {t("Забронировать", "Book Now")}
              </Button>
              {!user && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {t("Войдите чтобы забронировать", "Sign in to book")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {recommendedTours.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">{t("Похожие туры", "Similar Tours")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendedTours.map((tour: any) => <TourCard key={tour.id} tour={tour} />)}
          </div>
        </div>
      )}

      {bookingOpen && (
        <BookingModal
          tour={tour}
          dates={dates}
          options={options}
          preselectedOptions={sidebarOptions}
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

function BookingModal({ tour, dates, options, preselectedOptions = [], onClose }: any) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [selectedDateId, setSelectedDateId] = useState(dates[0]?.id || "");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(preselectedOptions);
  const [paymentType, setPaymentType] = useState<"prepay" | "full">("full");

  const basePrice = Number(tour.basePrice) * (1 - tour.discountPercent / 100);
  const optionsTotal = options
    .filter((o: any) => selectedOptions.includes(o.id))
    .reduce((sum: number, o: any) => sum + Number(o.price), 0);
  const travelers = adults + children * 0.5;
  const totalPrice = (basePrice + optionsTotal) * travelers;
  const toPay = paymentType === "prepay" ? totalPrice * 0.3 : totalPrice;

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/bookings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: t("Бронирование создано!", "Booking created!"), description: t(`К оплате: $${toPay.toFixed(0)}`, `To pay: $${toPay.toFixed(0)}`) });
      onClose();
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
          <DialogTitle className="text-lg font-bold text-white">{t("Бронирование тура", "Book Tour")}</DialogTitle>
          <p className="text-sm text-white/80 mt-0.5 truncate">{lang === "ru" ? tour.titleRu : tour.titleEn}</p>
        </div>

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
                  subLabel={t("до 12 лет — 50% цены", "under 12 — 50% price")}
                  value={children}
                  min={0}
                  max={6}
                  onChange={setChildren}
                />
              </div>
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
                          +${Number(opt.price).toFixed(0)}
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
                      ${opt.amount.toFixed(0)}
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
                <span>{t("Базовая цена", "Base price")} × {travelers}</span>
                <span>${(basePrice * travelers).toFixed(0)}</span>
              </div>
              {optionsTotal > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t("Дополнительные опции", "Add-ons")} × {travelers}</span>
                  <span>+${(optionsTotal * travelers).toFixed(0)}</span>
                </div>
              )}
              {paymentType === "prepay" && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t("Полная стоимость", "Full amount")}</span>
                  <span>${totalPrice.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="font-semibold">{t("К оплате сейчас", "To pay now")}</span>
                <span className="text-xl font-bold text-primary">${toPay.toFixed(0)}</span>
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
      </DialogContent>
    </Dialog>
  );
}
