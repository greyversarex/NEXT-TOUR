import { useState } from "react";
import { useRoute, Link, Redirect } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Heart, BookOpen, Trophy, Star, Calendar, DollarSign } from "lucide-react";
import TourCard from "@/components/TourCard";
import { format } from "date-fns";
import type { Tour } from "@shared/schema";

const LOYALTY_INFO = {
  beginner: { color: "bg-gray-100 text-gray-700", icon: "🌱", label_ru: "Новичок", label_en: "Beginner" },
  traveler: { color: "bg-blue-100 text-blue-700", icon: "🧭", label_ru: "Путешественник", label_en: "Traveler" },
  premium: { color: "bg-yellow-100 text-yellow-700", icon: "👑", label_ru: "Премиум", label_en: "Premium" },
};

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { t, lang } = useI18n();

  if (isLoading) return <div className="flex justify-center p-16"><Skeleton className="h-64 w-full max-w-lg" /></div>;
  if (!user) return <Redirect to="/" />;

  const loyalty = LOYALTY_INFO[user.loyaltyLevel] || LOYALTY_INFO.beginner;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-start gap-6">
        <Avatar className="h-20 w-20 ring-2 ring-primary/20">
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground text-sm">@{user.username} · {user.email}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${loyalty.color}`}>
              {loyalty.icon} {lang === "ru" ? loyalty.label_ru : loyalty.label_en}
            </span>
            <span className="text-sm text-muted-foreground">{user.bookingsCount} {t("туров", "tours")}</span>
            {user.discountsLeft > 0 && (
              <Badge variant="secondary">
                {user.discountsLeft} {t("скидок осталось", "discounts left")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="mb-6">
          <TabsTrigger value="info" className="gap-2"><User className="h-4 w-4" />{t("Профиль", "Profile")}</TabsTrigger>
          <TabsTrigger value="bookings" className="gap-2"><BookOpen className="h-4 w-4" />{t("Бронирования", "Bookings")}</TabsTrigger>
          <TabsTrigger value="favorites" className="gap-2"><Heart className="h-4 w-4" />{t("Избранное", "Favorites")}</TabsTrigger>
          <TabsTrigger value="loyalty" className="gap-2"><Trophy className="h-4 w-4" />{t("Лояльность", "Loyalty")}</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <EditProfileForm />
        </TabsContent>
        <TabsContent value="bookings">
          <BookingsTab />
        </TabsContent>
        <TabsContent value="favorites">
          <FavoritesTab />
        </TabsContent>
        <TabsContent value="loyalty">
          <LoyaltyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EditProfileForm() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", "/api/auth/me", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: t("Профиль обновлён", "Profile updated") });
    },
  });

  return (
    <Card>
      <CardHeader><CardTitle>{t("Редактировать профиль", "Edit Profile")}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={e => { e.preventDefault(); mutation.mutate({ name, avatar }); }} className="space-y-4 max-w-sm">
          <div>
            <Label>{t("Имя", "Full Name")}</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="mt-1" data-testid="input-profile-name" />
          </div>
          <div>
            <Label>{t("Фото (URL)", "Photo (URL)")}</Label>
            <Input value={avatar} onChange={e => setAvatar(e.target.value)} className="mt-1" placeholder="https://..." data-testid="input-profile-avatar" />
          </div>
          <Button type="submit" disabled={mutation.isPending} data-testid="button-profile-save">
            {t("Сохранить", "Save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function BookingsTab() {
  const { t, lang } = useI18n();
  const { data: bookings = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/bookings"] });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const statusLabels: Record<string, { ru: string; en: string; color: string }> = {
    new: { ru: "Новое", en: "New", color: "bg-blue-100 text-blue-700" },
    prepaid: { ru: "Предоплата", en: "Deposit Paid", color: "bg-yellow-100 text-yellow-700" },
    paid: { ru: "Оплачено", en: "Paid", color: "bg-green-100 text-green-700" },
    cancelled: { ru: "Отменено", en: "Cancelled", color: "bg-red-100 text-red-700" },
  };

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/bookings/${id}`, { bookingStatus: "cancelled" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: t("Бронирование отменено", "Booking cancelled") });
    },
  });

  if (isLoading) return <Skeleton className="h-64" />;

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>{t("Нет бронирований", "No bookings yet")}</p>
        <Link href="/tours"><Button variant="outline" className="mt-4">{t("Найти тур", "Find a Tour")}</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking: any) => {
        const status = statusLabels[booking.bookingStatus] || statusLabels.new;
        const tourTitle = lang === "ru" ? booking.tour?.titleRu : booking.tour?.titleEn;
        return (
          <Card key={booking.id} data-testid={`card-booking-${booking.id}`}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  {booking.tour?.mainImage && (
                    <img src={booking.tour.mainImage} alt="" className="w-16 h-12 object-cover rounded-md shrink-0" />
                  )}
                  <div>
                    <h4 className="font-semibold text-sm">{tourTitle}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(booking.createdAt), "dd.MM.yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        ${Number(booking.totalPrice).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                    {lang === "ru" ? status.ru : status.en}
                  </span>
                  {booking.bookingStatus === "new" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive text-xs h-7"
                      onClick={() => cancelMutation.mutate(booking.id)}
                    >
                      {t("Отменить", "Cancel")}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function FavoritesTab() {
  const { t } = useI18n();
  const { data: favorites = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/favorites"] });

  if (isLoading) return <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3].map(i => <Skeleton key={i} className="h-64" />)}</div>;

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Heart className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>{t("Нет избранных туров", "No favorite tours yet")}</p>
        <Link href="/tours"><Button variant="outline" className="mt-4">{t("Посмотреть туры", "Browse Tours")}</Button></Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {favorites.map((fav: any) => <TourCard key={fav.id} tour={fav.tour} isFavorite />)}
    </div>
  );
}

function LoyaltyTab() {
  const { user } = useAuth();
  const { t, lang } = useI18n();

  const levels = [
    {
      key: "beginner",
      nameRu: "Новичок", nameEn: "Beginner",
      toursMin: 0, toursMax: 2,
      descRu: "0–2 тура. Начало путешествий.", descEn: "0–2 tours. Start your journey.",
      discount: 0,
      icon: "🌱",
    },
    {
      key: "traveler",
      nameRu: "Путешественник", nameEn: "Traveler",
      toursMin: 3, toursMax: 5,
      descRu: "3+ туров. 2 персональные скидки 10%.", descEn: "3+ tours. 2 personal 10% discounts.",
      discount: 10,
      icon: "🧭",
    },
    {
      key: "premium",
      nameRu: "Премиум", nameEn: "Premium",
      toursMin: 6, toursMax: 999,
      descRu: "6+ туров. Постоянная скидка 5% на все туры.", descEn: "6+ tours. Permanent 5% discount on all tours.",
      discount: 5,
      icon: "👑",
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm mb-6">
        {t("Чем больше туров вы покупаете, тем выше ваш уровень и лучше условия.", "The more tours you book, the higher your level and better the perks.")}
      </p>
      {levels.map(level => {
        const isCurrent = user?.loyaltyLevel === level.key;
        return (
          <Card key={level.key} className={isCurrent ? "ring-2 ring-primary" : ""}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{level.icon}</div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      {lang === "ru" ? level.nameRu : level.nameEn}
                      {isCurrent && <Badge>{t("Ваш уровень", "Your Level")}</Badge>}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{lang === "ru" ? level.descRu : level.descEn}</p>
                  </div>
                </div>
                {level.discount > 0 && (
                  <Badge variant="secondary" className="shrink-0">{level.discount}% off</Badge>
                )}
              </div>
              <div className="mt-3 h-1.5 bg-muted rounded-full">
                <div
                  className={`h-full rounded-full transition-all ${isCurrent ? "bg-primary" : (user?.bookingsCount ?? 0) > level.toursMax ? "bg-primary" : "bg-muted"}`}
                  style={{ width: isCurrent ? `${Math.min(100, ((user?.bookingsCount ?? 0) - level.toursMin) / (level.toursMax - level.toursMin + 1) * 100)}%` : "0%" }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
