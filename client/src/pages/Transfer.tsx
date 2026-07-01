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
  Phone, Mail, User, ArrowRight, Shield, Zap, HeadphonesIcon, Navigation
} from "lucide-react";

const COUNTRY_CODES = [
  { code: "+992", flag: "🇹🇯", name: "Таджикистан",  short: "TJ" },
  { code: "+7",   flag: "🇷🇺", name: "Россия",        short: "RU" },
  { code: "+998", flag: "🇺🇿", name: "Узбекистан",    short: "UZ" },
  { code: "+996", flag: "🇰🇬", name: "Кыргызстан",    short: "KG" },
  { code: "+77",  flag: "🇰🇿", name: "Казахстан",     short: "KZ" },
  { code: "+993", flag: "🇹🇲", name: "Туркменистан",  short: "TM" },
  { code: "+971", flag: "🇦🇪", name: "ОАЭ",           short: "AE" },
  { code: "+90",  flag: "🇹🇷", name: "Турция",        short: "TR" },
  { code: "+1",   flag: "🇺🇸", name: "США",           short: "US" },
  { code: "+44",  flag: "🇬🇧", name: "Великобритания",short: "GB" },
  { code: "+49",  flag: "🇩🇪", name: "Германия",      short: "DE" },
  { code: "+33",  flag: "🇫🇷", name: "Франция",       short: "FR" },
  { code: "+86",  flag: "🇨🇳", name: "Китай",         short: "CN" },
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

  const resetForm = () => {
    setSubmitted(false);
    setForm({
      name: "", email: "", phone: "", country: "", departureCity: "",
      pickupLocation: "", dropoffLocation: "", startDate: "", endDate: "",
      pickupTime: "", passengers: 1, notes: "",
    });
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-10">
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
          <Button onClick={resetForm} className="w-full h-11">
            {t("Подать ещё одну заявку", "Submit another request")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      {/* ── Hero — glass ── */}
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
          <p className="text-white/75 text-base max-w-xl leading-relaxed mb-1">
            {t(
              "Закажите трансфер куда вам необходимо — быстро, удобно и надёжно.",
              "Book a transfer to any destination — fast, comfortable and reliable."
            )}
          </p>
          <p className="text-white/50 text-sm max-w-2xl leading-relaxed">
            {t(
              "Рекомендуем уточнить зону обслуживания перед оформлением заявки. По любым вопросам свяжитесь с нами.",
              "We recommend confirming the service area before submitting. Contact us with any questions."
            )}
          </p>
          <div className="flex flex-wrap gap-2.5 mt-6">
            {[
              { icon: Zap,             ru: "Быстрый ответ",  en: "Quick response"   },
              { icon: Shield,          ru: "Безопасность",   en: "Safety guaranteed" },
              { icon: HeadphonesIcon,  ru: "Поддержка 24/7", en: "24/7 support"      },
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

      {/* ── Form card — wider, more spacious ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/30 overflow-hidden">

          {/* Card header */}
          <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-border/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
              <Navigation className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {t("Оформить заявку на трансфер", "Submit a transfer request")}
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                {t(
                  "Заполните форму — мы свяжемся с вами в ближайшее время",
                  "Fill out the form — we'll contact you shortly"
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 sm:px-10 py-8 space-y-6">

            {/* ── Section: Контактные данные ── */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                {t("Контактные данные", "Contact details")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("ФИО", "Full Name")}
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Input
                    id="name"
                    data-testid="input-transfer-name"
                    className="h-11"
                    placeholder={t("Ваше полное имя", "Your full name")}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="input-transfer-email"
                    className="h-11"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
              </div>

              {/* Phone — full width with country code selector */}
              <div className="mt-4 space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("Телефон", "Phone number")}
                </Label>
                <div className="flex gap-2">
                  <Select value={selectedShort} onValueChange={setSelectedShort}>
                    <SelectTrigger
                      className="h-11 w-32 sm:w-40 shrink-0"
                      data-testid="select-transfer-dial-code"
                    >
                      <SelectValue>
                        {(() => {
                          const c = COUNTRY_CODES.find(x => x.short === selectedShort);
                          return c ? (
                            <span className="flex items-center gap-1.5">
                              <span className="text-base leading-none">{c.flag}</span>
                              <span className="font-semibold">{c.code}</span>
                            </span>
                          ) : dialCode;
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((c) => (
                        <SelectItem key={c.short} value={c.short}>
                          <span className="flex items-center gap-2.5">
                            <span className="text-base leading-none">{c.flag}</span>
                            <span className="font-semibold tabular-nums">{c.code}</span>
                            <span className="text-muted-foreground text-xs">{c.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    data-testid="input-transfer-phone"
                    className="h-11 flex-1"
                    placeholder={t("Номер без кода страны", "Number without country code")}
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border/50" />

            {/* ── Section: Маршрут ── */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                {t("Маршрут", "Route")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("Страна", "Country")}
                  </Label>
                  <Input
                    id="country"
                    data-testid="input-transfer-country"
                    className="h-11"
                    placeholder={t("Таджикистан, Россия...", "Tajikistan, Russia...")}
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departureCity" className="flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("Город отправления", "Departure city")}
                  </Label>
                  <Input
                    id="departureCity"
                    data-testid="input-transfer-departure-city"
                    className="h-11"
                    placeholder={t("Душанбе, Москва...", "Dushanbe, Moscow...")}
                    value={form.departureCity}
                    onChange={(e) => set("departureCity", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupLocation" className="flex items-center gap-1.5 text-sm font-medium">
                    <span className="inline-flex w-3.5 h-3.5 rounded-full bg-green-500 items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                    {t("Откуда забрать", "Pickup location")}
                  </Label>
                  <Input
                    id="pickupLocation"
                    data-testid="input-transfer-pickup"
                    className="h-11"
                    placeholder={t("Адрес, отель, аэропорт...", "Address, hotel, airport...")}
                    value={form.pickupLocation}
                    onChange={(e) => set("pickupLocation", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dropoffLocation" className="flex items-center gap-1.5 text-sm font-medium">
                    <span className="inline-flex w-3.5 h-3.5 rounded-full bg-red-500 items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                    {t("Куда доставить", "Dropoff location")}
                  </Label>
                  <Input
                    id="dropoffLocation"
                    data-testid="input-transfer-dropoff"
                    className="h-11"
                    placeholder={t("Адрес, отель...", "Address, hotel...")}
                    value={form.dropoffLocation}
                    onChange={(e) => set("dropoffLocation", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border/50" />

            {/* ── Section: Дата и время ── */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                {t("Дата, время и пассажиры", "Date, time & passengers")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="flex items-center gap-1.5 text-sm font-medium">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("Дата начала", "Start date")}
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    data-testid="input-transfer-start-date"
                    className="h-11"
                    value={form.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="flex items-center gap-1.5 text-sm font-medium">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("Дата окончания", "End date")}
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    data-testid="input-transfer-end-date"
                    className="h-11"
                    value={form.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupTime" className="flex items-center gap-1.5 text-sm font-medium">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("Время подачи", "Pickup time")}
                  </Label>
                  <Input
                    id="pickupTime"
                    type="time"
                    data-testid="input-transfer-time"
                    className="h-11"
                    value={form.pickupTime}
                    onChange={(e) => set("pickupTime", e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4 sm:max-w-xs space-y-2">
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
                  className="h-11"
                  value={form.passengers}
                  onChange={(e) => set("passengers", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="border-t border-border/50" />

            {/* ── Notes ── */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                {t("Дополнительные пожелания", "Additional notes")}
              </Label>
              <Textarea
                id="notes"
                data-testid="input-transfer-notes"
                placeholder={t(
                  "Детское кресло, остановки в пути, особые требования к автомобилю...",
                  "Child seat, stops along the way, special vehicle requirements..."
                )}
                rows={4}
                className="resize-none"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>

            {/* ── Submit ── */}
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full h-13 text-base font-semibold gap-2"
                disabled={mutation.isPending}
                data-testid="button-transfer-submit"
              >
                {mutation.isPending ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {t("Отправить заявку", "Submit request")}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                {t(
                  "Нажимая «Отправить», вы соглашаетесь с обработкой персональных данных",
                  "By clicking «Submit», you agree to the processing of personal data"
                )}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
