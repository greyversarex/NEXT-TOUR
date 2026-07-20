import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Calendar, DollarSign, Users, Table as TableIcon, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Phone, Mail, MapPin, Info, User as UserIcon,
  CreditCard, FileText, Hash, Clock, CheckCircle2, XCircle, PackagePlus, Trash2,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";

const GATE_LABELS: Record<string, string> = {
  vsa: "Visa",
  mcr: "Mastercard",
  km: "Корти Милли",
};

const PAYMENT_STATUS_LABELS: Record<string, { ru: string; en: string; color: string }> = {
  pending: { ru: "Ожидание", en: "Pending", color: "bg-yellow-100 text-yellow-700" },
  ok: { ru: "Успешно", en: "Success", color: "bg-green-100 text-green-700" },
  failed: { ru: "Ошибка", en: "Failed", color: "bg-red-100 text-red-700" },
};

const STATUS_LABELS: Record<string, { ru: string; en: string; color: string; badgeColor: string }> = {
  new: { ru: "Новое", en: "New", color: "bg-blue-100 text-blue-700", badgeColor: "bg-blue-500" },
  prepaid: { ru: "Предоплата", en: "Deposit Paid", color: "bg-yellow-100 text-yellow-700", badgeColor: "bg-yellow-500" },
  paid: { ru: "Оплачено", en: "Paid", color: "bg-green-100 text-green-700", badgeColor: "bg-green-500" },
  cancelled: { ru: "Отменено", en: "Cancelled", color: "bg-red-100 text-red-700", badgeColor: "bg-red-500" },
};

function BookingDetailModal({ booking, onClose, onStatusChange }: { booking: any; onClose: () => void; onStatusChange: (id: string, status: string) => void }) {
  const { t, lang } = useI18n();

  const { data: options = [] } = useQuery<any[]>({
    queryKey: [`/api/tours/${booking.tourId}/options`],
    enabled: !!booking.tourId,
  });
  const { data: payment } = useQuery<any>({
    queryKey: [`/api/payments/booking/${booking.id}`],
    enabled: !!booking.id,
  });

  const st = STATUS_LABELS[booking.bookingStatus] || STATUS_LABELS.new;
  const tourTitle = lang === "ru" ? booking.tour?.titleRu : booking.tour?.titleEn;
  const isGuest = !booking.userId;
  const customerName = isGuest ? booking.guestName : booking.user?.name;
  const customerEmail = isGuest ? booking.guestEmail : booking.user?.email;
  const customerPhone = booking.guestPhone;

  const selectedOptionIds: string[] = Array.isArray(booking.selectedOptions) ? booking.selectedOptions : [];
  const selectedOptionRows = options.filter((o: any) => selectedOptionIds.includes(o.id));
  const optionsTotal = selectedOptionRows.reduce((sum: number, o: any) => sum + Number(o.price || 0), 0);

  const totalPrice = Number(booking.totalPrice || 0);
  const paidAmount = Number(booking.paidAmount || 0);
  const remaining = Math.max(totalPrice - paidAmount, 0);

  const paymentStatus = payment ? (PAYMENT_STATUS_LABELS[payment.status] || PAYMENT_STATUS_LABELS.pending) : null;

  const Row = ({ icon: Icon, label, value, mono }: { icon: any; label: string; value: any; mono?: boolean }) => {
    if (value === undefined || value === null || value === "") return null;
    return (
      <div className="flex items-start gap-2 text-sm">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <span className="text-muted-foreground shrink-0">{label}:</span>
        <span className={`font-medium break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
      </div>
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-[calc(100%-2rem)] max-h-[90svh] p-0 flex flex-col gap-0 overflow-hidden" data-testid="dialog-booking-detail">
        <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Info className="h-5 w-5 text-primary shrink-0" />
            {t("Детали бронирования", "Booking Details")}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            {/* Status + meta */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color}`}>
                {lang === "ru" ? st.ru : st.en}
              </span>
              <Select value={booking.bookingStatus} onValueChange={v => onStatusChange(booking.id, v)}>
                <SelectTrigger className="w-40 h-8 text-xs" data-testid="select-status-detail">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([key, v]) => (
                    <SelectItem key={key} value={key}>{lang === "ru" ? v.ru : v.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Row icon={Hash} label={t("ID бронирования", "Booking ID")} value={booking.id} mono />
            <Row icon={Clock} label={t("Создано", "Created")} value={format(new Date(booking.createdAt), "dd.MM.yyyy HH:mm:ss")} />

            <Separator />

            {/* Tour */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />{t("Тур", "Tour")}
              </h4>
              <div className="flex gap-3">
                {booking.tour?.mainImage && (
                  <img src={booking.tour.mainImage} alt="" className="w-20 h-16 object-cover rounded shrink-0" />
                )}
                <div className="space-y-1 min-w-0">
                  <p className="font-medium">{tourTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("ID тура", "Tour ID")}: <span className="font-mono">{booking.tourId}</span>
                  </p>
                  {booking.tour?.duration && (
                    <p className="text-xs text-muted-foreground">{t("Длительность", "Duration")}: {booking.tour.duration} {t("дн.", "days")}</p>
                  )}
                </div>
              </div>
              {booking.tourDate && (
                <div className="mt-2 text-sm flex items-center gap-2 text-primary font-medium">
                  <CalendarIcon className="h-4 w-4" />
                  {format(new Date(booking.tourDate.startDate), "dd.MM.yyyy")} — {format(new Date(booking.tourDate.endDate), "dd.MM.yyyy")}
                  <span className="text-xs text-muted-foreground font-normal">
                    ({t("занято", "booked")} {booking.tourDate.bookedCount}/{booking.tourDate.maxPeople})
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Customer */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <UserIcon className="h-4 w-4" />{t("Клиент", "Customer")}
              </h4>
              <div className="space-y-1.5">
                <Row icon={UserIcon} label={t("Имя", "Name")} value={
                  <>{customerName || "—"}{isGuest && <span className="text-xs text-amber-600 ml-1">({t("гость", "guest")})</span>}</>
                } />
                <Row icon={Mail} label="Email" value={customerEmail} />
                <Row icon={Phone} label={t("Телефон", "Phone")} value={customerPhone} />
                {!isGuest && <Row icon={Hash} label={t("ID пользователя", "User ID")} value={booking.userId} mono />}
              </div>
            </div>

            <Separator />

            {/* Guests & options */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />{t("Участники и опции", "Guests & Options")}
              </h4>
              <div className="space-y-1.5">
                <Row icon={Users} label={t("Взрослые", "Adults")} value={booking.adults} />
                <Row icon={Users} label={t("Дети", "Children")} value={booking.children} />
              </div>
              {selectedOptionRows.length > 0 ? (
                <div className="mt-2 border rounded-lg divide-y">
                  {selectedOptionRows.map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="flex items-center gap-2">
                        <PackagePlus className="h-3.5 w-3.5 text-muted-foreground" />
                        {lang === "ru" ? o.nameRu : o.nameEn}
                      </span>
                      <span className="font-medium">${Number(o.price).toFixed(0)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 py-2 text-sm bg-muted/50">
                    <span className="text-muted-foreground">{t("Итого по опциям", "Options total")}</span>
                    <span className="font-semibold">${optionsTotal.toFixed(0)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">{t("Дополнительные опции не выбраны", "No add-on options selected")}</p>
              )}
            </div>

            <Separator />

            {/* Pricing */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />{t("Оплата", "Payment")}
              </h4>
              <div className="space-y-1.5">
                <Row icon={DollarSign} label={t("Тип оплаты", "Payment type")} value={booking.paymentType === "prepay" ? t("Предоплата 30%", "30% deposit") : t("Полная оплата", "Full payment")} />
                <Row icon={DollarSign} label={t("Сумма бронирования", "Total price")} value={`${totalPrice.toFixed(2)}`} />
                <Row icon={CheckCircle2} label={t("Оплачено", "Paid amount")} value={`${paidAmount.toFixed(2)}`} />
                {remaining > 0 && (
                  <Row icon={XCircle} label={t("Остаток к оплате", "Remaining balance")} value={`${remaining.toFixed(2)}`} />
                )}
              </div>

              {payment ? (
                <div className="mt-3 border rounded-lg p-3 space-y-1.5 bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" />Alif
                    </span>
                    {paymentStatus && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${paymentStatus.color}`}>
                        {lang === "ru" ? paymentStatus.ru : paymentStatus.en}
                      </span>
                    )}
                  </div>
                  <Row icon={Hash} label={t("ID заказа (orderId)", "Order ID")} value={payment.orderId} mono />
                  <Row icon={Hash} label={t("ID транзакции", "Transaction ID")} value={payment.transactionId} mono />
                  <Row icon={CreditCard} label={t("Способ оплаты", "Card brand")} value={GATE_LABELS[payment.gate] || payment.gate} />
                  <Row icon={DollarSign} label={t("Сумма платежа", "Payment amount")} value={`${Number(payment.amount).toFixed(2)}`} />
                  <Row icon={Clock} label={t("Создан", "Created")} value={format(new Date(payment.createdAt), "dd.MM.yyyy HH:mm:ss")} />
                  <Row icon={Clock} label={t("Обновлён", "Updated")} value={format(new Date(payment.updatedAt), "dd.MM.yyyy HH:mm:ss")} />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-2">{t("Данные об онлайн-платеже отсутствуют (ручное бронирование)", "No online payment record (manual booking)")}</p>
              )}
            </div>

            {booking.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />{t("Примечания", "Notes")}
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">{booking.notes}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function BookingsAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("confirmed");
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [detailBookingId, setDetailBookingId] = useState<string | null>(null);

  const { data: bookings = [] } = useQuery<any[]>({ queryKey: ["/api/bookings"] });
  const detailBooking = detailBookingId ? bookings.find((b: any) => b.id === detailBookingId) || null : null;
  
  const filtered = useMemo(() => {
    let result = bookings;
    if (statusFilter === "confirmed") {
      result = result.filter((b: any) => b.bookingStatus === "prepaid" || b.bookingStatus === "paid");
    } else if (statusFilter !== "all") {
      result = result.filter((b: any) => b.bookingStatus === statusFilter);
    }
    if (viewMode === "calendar" && selectedDay) {
      result = result.filter((b: any) => isSameDay(new Date(b.createdAt), selectedDay));
    }
    return result;
  }, [bookings, statusFilter, viewMode, selectedDay]);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: any) => apiRequest("PUT", `/api/bookings/${id}`, { bookingStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: t("Статус обновлён", "Status updated") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/bookings/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setDetailBookingId(null);
      toast({ title: t("Бронирование удалено", "Booking deleted") });
    },
    onError: (err: any) => {
      toast({ title: t("Ошибка удаления", "Delete error"), description: err?.message, variant: "destructive" });
    },
  });

  const locale = lang === "ru" ? ru : enUS;

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const weekDays = lang === "ru" 
    ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const bookingsByDay = useMemo(() => {
    const map: Record<string, any[]> = {};
    bookings.forEach(b => {
      const dateKey = format(new Date(b.createdAt), "yyyy-MM-dd");
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(b);
    });
    return map;
  }, [bookings]);

  return (
    <AdminLayout title={t("Бронирования", "Bookings")}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("Все статусы", "All Statuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmed">{t("Оплаченные", "Confirmed")}</SelectItem>
              <SelectItem value="all">{t("Все", "All")}</SelectItem>
              {Object.entries(STATUS_LABELS).map(([key, v]) => (
                <SelectItem key={key} value={key}>{lang === "ru" ? v.ru : v.en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">{filtered.length} {t("записей", "records")}</span>
        </div>

        <div className="flex items-center bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              setViewMode("table");
              setSelectedDay(null);
            }}
            className="gap-2"
            data-testid="button-view-table"
          >
            <TableIcon className="h-4 w-4" />
            {t("Таблица", "Table")}
          </Button>
          <Button
            variant={viewMode === "calendar" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            className="gap-2"
            data-testid="button-view-calendar"
          >
            <CalendarIcon className="h-4 w-4" />
            {t("Календарь", "Calendar")}
          </Button>
        </div>
      </div>

      {viewMode === "calendar" && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">
              {format(currentMonth, "LLLL yyyy", { locale })}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                data-testid="button-prev-month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                data-testid="button-next-month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border">
              {weekDays.map(day => (
                <div key={day} className="bg-background p-2 text-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              {calendarDays.map(day => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayBookings = bookingsByDay[dateKey] || [];
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());

                const countsByStatus = dayBookings.reduce((acc, b) => {
                  acc[b.bookingStatus] = (acc[b.bookingStatus] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);

                return (
                  <div
                    key={day.toString()}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`
                      min-h-[80px] p-2 bg-background cursor-pointer hover:bg-muted/50 transition-colors
                      ${!isCurrentMonth ? "opacity-30" : ""}
                      ${isSelected ? "ring-2 ring-primary ring-inset" : ""}
                    `}
                    data-testid={`calendar-day-${dateKey}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`
                        text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center
                        ${isToday ? "bg-primary text-primary-foreground" : ""}
                      `}>
                        {format(day, "d")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(countsByStatus).map(([status, count]) => (
                        <Badge
                          key={status}
                          className={`${STATUS_LABELS[status]?.badgeColor || "bg-gray-500"} text-[10px] px-1 h-4 min-w-[16px] justify-center`}
                        >
                          {String(count)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "calendar" && selectedDay && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            {t("Бронирования на", "Bookings for")} {format(selectedDay, "d MMMM yyyy", { locale })}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setSelectedDay(null)}>
            {t("Показать все", "Show all")}
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {t("Нет бронирований", "No bookings found")}
          </div>
        ) : (
          filtered.map((booking: any) => {
            const st = STATUS_LABELS[booking.bookingStatus] || STATUS_LABELS.new;
            const tourTitle = lang === "ru" ? booking.tour?.titleRu : booking.tour?.titleEn;
            const customerName = booking.userId ? booking.user?.name : booking.guestName;
            const customerEmail = booking.userId ? booking.user?.email : booking.guestEmail;
            const customerPhone = booking.guestPhone;
            const tourDate = booking.tourDate;
            return (
              <Card key={booking.id} data-testid={`card-booking-${booking.id}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        {booking.tour?.mainImage && (
                          <img src={booking.tour.mainImage} alt="" className="w-14 h-10 object-cover rounded shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{tourTitle}</p>
                          {customerName && (
                            <p className="text-sm font-semibold text-foreground mt-0.5">
                              {customerName}
                              {!booking.userId && <span className="text-xs text-amber-600 ml-1">({t("гость", "guest")})</span>}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {format(new Date(booking.createdAt), "dd.MM.yyyy HH:mm")}
                            </span>
                            {tourDate && (
                              <span className="flex items-center gap-1 text-primary font-medium">
                                <MapPin className="h-3 w-3" />
                                {format(new Date(tourDate.startDate), "dd.MM.yyyy")} — {format(new Date(tourDate.endDate), "dd.MM.yyyy")}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {booking.adults} {t("взр.", "ad.")}
                              {booking.children > 0 && <>, {booking.children} {t("дет.", "ch.")}</>}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${Number(booking.totalPrice).toFixed(0)} ({booking.paymentType === "prepay" ? t("30%", "30%") : t("Полная", "Full")})
                            </span>
                            {customerEmail && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />{customerEmail}
                              </span>
                            )}
                            {customerPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />{customerPhone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>
                        {lang === "ru" ? st.ru : st.en}
                      </span>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 h-8 text-xs"
                        onClick={() => setDetailBookingId(booking.id)}
                        data-testid={`button-detail-${booking.id}`}
                      >
                        <Info className="h-3.5 w-3.5" />
                        {t("Подробнее", "Details")}
                      </Button>
                      <Select
                        value={booking.bookingStatus}
                        onValueChange={v => updateMutation.mutate({ id: booking.id, status: v })}
                      >
                        <SelectTrigger className="w-36 h-8 text-xs" data-testid={`select-status-${booking.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([key, v]) => (
                            <SelectItem key={key} value={key} data-testid={`select-item-${key}-${booking.id}`}>{lang === "ru" ? v.ru : v.en}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 h-8 text-xs text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm(t(
                            "Удалить запись о бронировании? Это действие необратимо.",
                            "Delete this booking record? This cannot be undone."
                          ))) {
                            deleteMutation.mutate(booking.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${booking.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t("Удалить", "Delete")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking}
          onClose={() => setDetailBookingId(null)}
          onStatusChange={(id, status) => updateMutation.mutate({ id, status })}
        />
      )}
    </AdminLayout>
  );
}
