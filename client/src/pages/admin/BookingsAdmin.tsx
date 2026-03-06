import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, DollarSign, Users } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const STATUS_LABELS: Record<string, { ru: string; en: string; color: string }> = {
  new: { ru: "Новое", en: "New", color: "bg-blue-100 text-blue-700" },
  prepaid: { ru: "Предоплата", en: "Deposit Paid", color: "bg-yellow-100 text-yellow-700" },
  paid: { ru: "Оплачено", en: "Paid", color: "bg-green-100 text-green-700" },
  cancelled: { ru: "Отменено", en: "Cancelled", color: "bg-red-100 text-red-700" },
};

export default function BookingsAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: bookings = [] } = useQuery<any[]>({ queryKey: ["/api/bookings"] });
  const filtered = statusFilter !== "all" ? bookings.filter((b: any) => b.bookingStatus === statusFilter) : bookings;

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: any) => apiRequest("PUT", `/api/bookings/${id}`, { bookingStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: t("Статус обновлён", "Status updated") });
    },
  });

  return (
    <AdminLayout title={t("Бронирования", "Bookings")}>
      <div className="flex items-center gap-4 mb-6">
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

      <div className="space-y-3">
        {filtered.map((booking: any) => {
          const st = STATUS_LABELS[booking.bookingStatus] || STATUS_LABELS.new;
          const tourTitle = lang === "ru" ? booking.tour?.titleRu : booking.tour?.titleEn;
          return (
            <Card key={booking.id}>
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
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(booking.createdAt), "dd.MM.yyyy HH:mm")}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{booking.adults + booking.children} {t("чел.", "pax")}</span>
                          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${Number(booking.totalPrice).toFixed(0)} ({booking.paymentType === "prepay" ? t("Предоплата 30%", "Deposit 30%") : t("Полная", "Full")})</span>
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
                      <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([key, v]) => (
                          <SelectItem key={key} value={key}>{lang === "ru" ? v.ru : v.en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AdminLayout>
  );
}
