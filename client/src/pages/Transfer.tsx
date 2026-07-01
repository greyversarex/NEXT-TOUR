import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Car, MapPin, Calendar, Clock, Users, CheckCircle2,
  Phone, Mail, User, ArrowRight, Shield, Zap, HeadphonesIcon
} from "lucide-react";

const PHONE_CODE = "+992";

export default function TransferPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    departureCity: "",
    pickupLocation: "",
    dropoffLocation: "",
    startDate: "",
    endDate: "",
    pickupTime: "",
    passengers: 1,
    notes: "",
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      apiRequest("POST", "/api/transfer-inquiries", {
        ...data,
        phone: data.phone ? `${PHONE_CODE} ${data.phone}` : undefined,
        passengers: Number(data.passengers),
      }),
    onSuccess: () => {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: () => {
      toast({
        title: t("Ошибка отправки", "Submission error"),
        description: t("Пожалуйста, попробуйте снова.", "Please try again."),
        variant: "destructive",
      });
    },
  });

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: t("Введите ФИО", "Enter your name"), variant: "destructive" });
      return;
    }
    mutation.mutate(form);
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3">
            {t("Заявка отправлена!", "Request submitted!")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t(
              "Мы получили вашу заявку на трансфер и свяжемся с вами в ближайшее время.",
              "We received your transfer request and will contact you shortly."
            )}
          </p>
          <Button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", country: "", departureCity: "", pickupLocation: "", dropoffLocation: "", startDate: "", endDate: "", pickupTime: "", passengers: 1, notes: "" }); }}>
            {t("Подать ещё одну заявку", "Submit another request")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0b1f3a] via-[#1a3a6b] to-[#0b2d5a] py-16 px-4 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-cyan-400 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-5 border border-white/20">
            <Car className="h-4 w-4" />
            {t("Трансфер по всему миру", "Worldwide transfer")}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            {t("Трансфер", "Transfer")}
          </h1>
          <p className="text-lg text-white/80 mb-2">
            {t(
              "Закажите трансфер куда вам необходимо. Быстро, удобно и надёжно.",
              "Book a transfer to any destination. Fast, comfortable and reliable."
            )}
          </p>
          <p className="text-sm text-white/60">
            {t(
              "Примечание: Туристам рекомендуется внимательно ознакомиться с информацией о каждом транспорте и водителе, включая зону обслуживания, перед бронированием.",
              "Note: Tourists are advised to carefully review each vehicle and driver's service area before booking."
            )}
          </p>
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-white border-b border-border py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          {[
            { icon: Zap, ru: "Быстрый ответ", en: "Quick response" },
            { icon: Shield, ru: "Безопасность", en: "Safety guaranteed" },
            { icon: HeadphonesIcon, ru: "Поддержка 24/7", en: "24/7 support" },
          ].map(({ icon: Icon, ru, en }) => (
            <div key={ru} className="flex items-center gap-2 font-medium text-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              {t(ru, en)}
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="bg-gradient-to-r from-[#0b1f3a] to-[#1a3a6b] px-8 py-6 text-white">
              <h2 className="text-xl font-bold">{t("Заказать трансфер", "Book a transfer")}</h2>
              <p className="text-white/70 text-sm mt-1">
                {t("Заполните форму и мы свяжемся с вами в ближайшее время", "Fill out the form and we will contact you shortly")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("ФИО", "Full Name")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    data-testid="input-transfer-name"
                    placeholder={t("Введите ваше полное имя", "Enter your full name")}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("Email", "Email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="input-transfer-email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-medium">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("Телефон", "Phone")}
                </Label>
                <div className="flex">
                  <div className="flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md text-sm text-muted-foreground font-medium whitespace-nowrap">
                    🇹🇯 +992
                  </div>
                  <Input
                    id="phone"
                    data-testid="input-transfer-phone"
                    className="rounded-l-none"
                    placeholder="XXX XX XX XX"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
              </div>

              {/* Country + City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="country" className="flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("Страна", "Country")}
                  </Label>
                  <Input
                    id="country"
                    data-testid="input-transfer-country"
                    placeholder={t("Например: Таджикистан", "E.g.: Tajikistan")}
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="departureCity" className="flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("Город отправления", "Departure city")}
                  </Label>
                  <Input
                    id="departureCity"
                    data-testid="input-transfer-departure-city"
                    placeholder={t("Например: Душанбе", "E.g.: Dushanbe")}
                    value={form.departureCity}
                    onChange={(e) => set("departureCity", e.target.value)}
                  />
                </div>
              </div>

              {/* Pickup + Dropoff */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pickupLocation" className="flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="h-3.5 w-3.5 text-green-500" />
                    {t("Место приёма", "Pickup location")}
                  </Label>
                  <Input
                    id="pickupLocation"
                    data-testid="input-transfer-pickup"
                    placeholder={t("Откуда забрать (адрес, отель, аэропорт)", "Where to pick up (address, hotel, airport)")}
                    value={form.pickupLocation}
                    onChange={(e) => set("pickupLocation", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dropoffLocation" className="flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="h-3.5 w-3.5 text-red-500" />
                    {t("Место высадки", "Dropoff location")}
                  </Label>
                  <Input
                    id="dropoffLocation"
                    data-testid="input-transfer-dropoff"
                    placeholder={t("Куда доставить (адрес, отель)", "Where to deliver (address, hotel)")}
                    value={form.dropoffLocation}
                    onChange={(e) => set("dropoffLocation", e.target.value)}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="startDate" className="flex items-center gap-1.5 text-sm font-medium">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("Дата начала", "Start date")}
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    data-testid="input-transfer-start-date"
                    value={form.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endDate" className="flex items-center gap-1.5 text-sm font-medium">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("Дата окончания", "End date")}
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    data-testid="input-transfer-end-date"
                    value={form.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                  />
                </div>
              </div>

              {/* Time + Passengers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pickupTime" className="flex items-center gap-1.5 text-sm font-medium">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("Время подачи", "Pickup time")}
                  </Label>
                  <Input
                    id="pickupTime"
                    type="time"
                    data-testid="input-transfer-time"
                    value={form.pickupTime}
                    onChange={(e) => set("pickupTime", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="passengers" className="flex items-center gap-1.5 text-sm font-medium">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("Количество пассажиров", "Number of passengers")}
                  </Label>
                  <Input
                    id="passengers"
                    type="number"
                    min={1}
                    max={50}
                    data-testid="input-transfer-passengers"
                    value={form.passengers}
                    onChange={(e) => set("passengers", Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-sm font-medium">
                  {t("Дополнительные пожелания", "Additional notes")}
                </Label>
                <Textarea
                  id="notes"
                  data-testid="input-transfer-notes"
                  placeholder={t(
                    "Детское автокресло, остановки в пути, особые требования...",
                    "Child seat, stops along the way, special requirements..."
                  )}
                  rows={3}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold gap-2"
                disabled={mutation.isPending}
                data-testid="button-transfer-submit"
              >
                {mutation.isPending ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {t("Отправить заявку", "Submit request")}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
