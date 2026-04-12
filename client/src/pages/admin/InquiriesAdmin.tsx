import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Phone, Mail, MessageSquare, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, { ru: string; en: string; color: string }> = {
  new: { ru: "Новая", en: "New", color: "bg-blue-100 text-blue-700" },
  processing: { ru: "В работе", en: "Processing", color: "bg-yellow-100 text-yellow-700" },
  completed: { ru: "Завершена", en: "Completed", color: "bg-green-100 text-green-700" },
  rejected: { ru: "Отклонена", en: "Rejected", color: "bg-red-100 text-red-700" },
};

export default function InquiriesAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: inquiries = [] } = useQuery<any[]>({ queryKey: ["/api/inquiries"] });

  const filtered = useMemo(() => {
    if (statusFilter === "all") return inquiries;
    return inquiries.filter((i: any) => i.status === statusFilter);
  }, [inquiries, statusFilter]);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: any) => apiRequest("PUT", `/api/inquiries/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: t("Статус обновлён", "Status updated") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/inquiries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: t("Заявка удалена", "Inquiry deleted") });
    },
  });

  const locale = lang === "ru" ? ru : enUS;

  return (
    <AdminLayout title={t("Заявки", "Inquiries")}>
      <div className="flex items-center gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-inquiry-filter">
            <SelectValue />
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
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {t("Нет заявок", "No inquiries found")}
          </div>
        ) : (
          filtered.map((inquiry: any) => {
            const st = STATUS_LABELS[inquiry.status] || STATUS_LABELS.new;
            const tourTitle = lang === "ru" ? inquiry.tour?.titleRu : inquiry.tour?.titleEn;
            return (
              <Card key={inquiry.id} data-testid={`card-inquiry-${inquiry.id}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        {inquiry.tour?.mainImage && (
                          <img src={inquiry.tour.mainImage} alt="" className="w-14 h-10 object-cover rounded shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{tourTitle}</p>
                          <p className="text-sm font-semibold text-foreground mt-0.5">{inquiry.name}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(inquiry.createdAt), "dd.MM.yyyy HH:mm", { locale })}
                            </span>
                            {inquiry.phone && (
                              <a href={`tel:${inquiry.phone}`} className="flex items-center gap-1 hover:text-primary">
                                <Phone className="h-3 w-3" />{inquiry.phone}
                              </a>
                            )}
                            {inquiry.email && (
                              <a href={`mailto:${inquiry.email}`} className="flex items-center gap-1 hover:text-primary">
                                <Mail className="h-3 w-3" />{inquiry.email}
                              </a>
                            )}
                          </div>
                          {inquiry.message && (
                            <div className="mt-2 p-2.5 bg-muted/50 rounded-lg text-sm text-foreground flex items-start gap-2">
                              <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                              <span>{inquiry.message}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>
                        {lang === "ru" ? st.ru : st.en}
                      </span>
                    </div>
                    <div className="shrink-0 flex flex-col gap-2">
                      <Select
                        value={inquiry.status}
                        onValueChange={v => updateMutation.mutate({ id: inquiry.id, status: v })}
                      >
                        <SelectTrigger className="w-36 h-8 text-xs" data-testid={`select-inquiry-status-${inquiry.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([key, v]) => (
                            <SelectItem key={key} value={key}>{lang === "ru" ? v.ru : v.en}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm(t("Удалить заявку?", "Delete inquiry?"))) {
                            deleteMutation.mutate(inquiry.id);
                          }
                        }}
                        data-testid={`button-delete-inquiry-${inquiry.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
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
    </AdminLayout>
  );
}
