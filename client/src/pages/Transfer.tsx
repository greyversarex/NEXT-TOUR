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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Car, MapPin, Calendar, Clock, Users, CheckCircle2,
  Phone, Mail, User, ArrowRight, Shield, Zap, HeadphonesIcon
} from "lucide-react";

const COUNTRY_CODES = [
  { code: "+992", flag: "🇹🇯", name: "Tajikistan",   short: "TJ" },
  { code: "+7",   flag: "🇷🇺", name: "Russia",        short: "RU" },
  { code: "+998", flag: "🇺🇿", name: "Uzbekistan",    short: "UZ" },
  { code: "+996", flag: "🇰🇬", name: "Kyrgyzstan",    short: "KG" },
  { code: "+77",  flag: "🇰🇿", name: "Kazakhstan",    short: "KZ" },
  { code: "+993", flag: "🇹🇲", name: "Turkmenistan",  short: "TM" },
  { code: "+971", flag: "🇦🇪", name: "UAE",           short: "AE" },
  { code: "+90",  flag: "🇹🇷", name: "Turkey",        short: "TR" },
  { code: "+1",   flag: "🇺🇸", name: "USA",           short: "US" },
  { code: "+44",  flag: "🇬🇧", name: "UK",            short: "GB" },
  { code: "+49",  flag: "🇩🇪", name: "Germany",       short: "DE" },
  { code: "+33",  flag: "🇫🇷", name: "France",        short: "FR" },
  { code: "+86",  flag: "🇨🇳", name: "China",         short: "CN" },
];

export default function TransferPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [selectedShort, setSelectedShort] = useState("TJ");
  const dialCode = COUNTRY_CODES.find(c => c.short === selectedShort)?.code ?? "+992";

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
        phone: data.phone ? `${dialCode} ${data.phone}` : undefined,
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
        <div className="text-center max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3">
            {t("Заявка отправлена!", "Request submitted!")}
          </h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            {t(
              "Мы получили вашу заявку на трансфер и свяжемся с вами в ближайшее время.",
              "We received your transfer request and will contact you shortly."
            )}
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setForm({ name: "", email: "", phone: "", country: "", departureCity: "", pickupLocation: "", dropoffLocation: "", startDate: "", endDate: "", pickupTime: "", passengers: 1, notes: "" });
            }}
          >
            {t("Подать ещё одну заявку", "Submit another request")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      {/* ── Hero — glass, same pattern as About / News / Promotions ── */}
      <div className="relative overflow-hidden bg-white/15 backdrop-blur-2xl border-b border-white/20 mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
              <Car className="h-5 w-5 text-white" />
            </div>
            <p className="text-white/80 font-semibold text-sm uppercase tracking-widest">
              {t("Трансфер", "Transfer")}
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight text-white drop-shadow-md">
            {t("Заказ трансфера", "Book a Transfer")}
          </h1>
          <p className="text-white/75 text-base max-w-xl leading-relaxed mb-2">
            {t(
              "Закажите трансфер куда вам необходимо. Быстро, удобно и надёжно.",
              "Book a transfer to any destination. Fast, comfortable and reliable."
            )}
          </p>
          <p className="text-white/55 text-sm max-w-2xl leading-relaxed">
            {t(
              "Примечание: Туристам рекомендуется внимательно ознакомиться с информацией о каждом транспорте и водителе, включая зону обслуживания, перед бронированием. Если у вас возникнут вопросы, пожалуйста, свяжитесь с нами.",
              "Note: Tourists are advised to carefully review each vehicle and driver's service area before booking. If you have any questions, please contact us."
            )}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { icon: Zap, ru: "Быстрый ответ", en: "Quick response" },
              { icon: Shield, ru: "Безопасность", en: "Safety guaranteed" },
              { icon: HeadphonesIcon, ru: "Поддержка 24/7", en: "24/7 support" },
            ].map(({ icon: Icon, ru, en }) => (
              <div
                key={ru}
                className="inline-flex items-center gap-2 bg-white/15 text-white border border-white/25 rounded-full px-3.5 py-1.5 text-sm font-medium backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5" />
                {t(ru, en)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/30 overflow-hidden">

          {/* Form header */}
          <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-border/60">
            <h2 className="text-xl font-bold text-foreground">
              {t("Заказать трансфер", "Book a transfer")}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {t(
                "Заполните форму и мы свяжемся с вами в ближайшее время",
                "Fill out the form and we will contact you shortly"
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 sm:px-10 py-8 space-y-5">

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("ФИО", "Full Name")} <span className="text-destructive">*</span>
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
                <Label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email
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

            {/* Phone with country code selector */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                {t("Телефон", "Phone")}
              </Label>
              <div className="flex gap-2">
                <Select value={selectedShort} onValueChange={setSelectedShort}>
                  <SelectTrigger
                    className="w-36 shrink-0"
                    data-testid="select-transfer-dial-code"
                  >
                    <SelectValue>
                      {(() => {
                        const found = COUNTRY_CODES.find(c => c.short === selectedShort);
                        return found ? (
                          <span className="flex items-center gap-1.5">
                            <span>{found.flag}</span>
                            <span className="font-medium">{found.code}</span>
                          </span>
                        ) : dialCode;
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((c) => (
                      <SelectItem key={c.short} value={c.short}>
                        <span className="flex items-center gap-2">
                          <span>{c.flag}</span>
                          <span className="font-medium">{c.code}</span>
                          <span className="text-muted-foreground text-xs">{c.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  data-testid="input-transfer-phone"
                  className="flex-1"
                  placeholder={t("Номер телефона", "Phone number")}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/50 pt-1" />

            {/* Country + Departure city */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="country" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
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
                <Label htmlFor="departureCity" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
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
                <Label htmlFor="pickupLocation" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <span className="w-3.5 h-3.5 rounded-full bg-green-500 inline-flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                  {t("Место приёма", "Pickup location")}
                </Label>
                <Input
                  id="pickupLocation"
                  data-testid="input-transfer-pickup"
                  placeholder={t("Откуда забрать (адрес, отель, аэропорт)", "Where to pick up")}
                  value={form.pickupLocation}
                  onChange={(e) => set("pickupLocation", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dropoffLocation" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500 inline-flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                  {t("Место высадки", "Dropoff location")}
                </Label>
                <Input
                  id="dropoffLocation"
                  data-testid="input-transfer-dropoff"
                  placeholder={t("Куда доставить (адрес, отель)", "Where to deliver")}
                  value={form.dropoffLocation}
                  onChange={(e) => set("dropoffLocation", e.target.value)}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/50 pt-1" />

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("Дата начала аренды", "Start date")}
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
                <Label htmlFor="endDate" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("Дата окончания аренды", "End date")}
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
                <Label htmlFor="pickupTime" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
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
                <Label htmlFor="passengers" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("Количество пассажиров", "Passengers")}
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
              <Label htmlFor="notes" className="text-sm font-medium text-foreground">
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

            {/* Submit */}
            <div className="pt-2">
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
              <p className="text-xs text-muted-foreground text-center mt-3">
                {t(
                  "Нажимая кнопку, вы соглашаетесь с обработкой персональных данных",
                  "By submitting, you agree to the processing of personal data"
                )}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
