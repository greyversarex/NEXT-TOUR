import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, DollarSign, Users, Table as TableIcon, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, { ru: string; en: string; color: string; badgeColor: string }> = {
  new: { ru: "Новое", en: "New", color: "bg-blue-100 text-blue-700", badgeColor: "bg-blue-500" },
  prepaid: { ru: "Предоплата", en: "Deposit Paid", color: "bg-yellow-100 text-yellow-700", badgeColor: "bg-yellow-500" },
  paid: { ru: "Оплачено", en: "Paid", color: "bg-green-100 text-green-700", badgeColor: "bg-green-500" },
  cancelled: { ru: "Отменено", en: "Cancelled", color: "bg-red-100 text-red-700", badgeColor: "bg-red-500" },
};

export default function BookingsAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const { data: bookings = [] } = useQuery<any[]>({ queryKey: ["/api/bookings"] });
  
  const filtered = useMemo(() => {
    let result = bookings;
    if (statusFilter !== "all") {
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
            return (
              <Card key={booking.id} data-testid={`card-booking-${booking.id}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        {booking.tour?.mainImage && (
                          <img src={booking.tour.mainImage} alt="" className="w-12 h-9 object-cover rounded shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{tourTitle}</p>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{format(new Date(booking.createdAt), "dd.MM.yyyy HH:mm")}</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{booking.adults + booking.children} {t("чел.", "pax")}</span>
                            <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${Number(booking.totalPrice).toFixed(0)} ({booking.paymentType === "prepay" ? t("Предоплата 30%", "Deposit 30%") : t("Полная", "Full")})</span>
                            {!booking.userId && (booking.guestEmail || booking.guestPhone) && (
                              <span className="flex items-center gap-1 text-amber-600 font-medium">
                                👤 {t("Гость:", "Guest:")} {booking.guestName || ""}{booking.guestName && (booking.guestEmail || booking.guestPhone) ? " · " : ""}{booking.guestEmail || ""}{booking.guestEmail && booking.guestPhone ? " · " : ""}{booking.guestPhone || ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>
                        {lang === "ru" ? st.ru : st.en}
                      </span>
                    </div>
                    <div className="shrink-0">
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
}
