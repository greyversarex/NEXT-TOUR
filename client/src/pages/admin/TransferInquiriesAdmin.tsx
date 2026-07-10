import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Car, Phone, Mail, User, MapPin, Calendar, Clock, Users,
  Trash2, ChevronDown, ChevronUp, MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { useState, useMemo } from "react";

const STATUS_LABELS: Record<string, { ru: string; en: string; color: string }> = {
  new: { ru: "Новая", en: "New", color: "bg-blue-100 text-blue-700" },
  processing: { ru: "В работе", en: "Processing", color: "bg-yellow-100 text-yellow-700" },
  completed: { ru: "Завершена", en: "Completed", color: "bg-green-100 text-green-700" },
  rejected: { ru: "Отклонена", en: "Rejected", color: "bg-red-100 text-red-700" },
};

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground break-words">{value}</span>
    </div>
  );
}

export default function TransferInquiriesAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const { data: inquiries = [] } = useQuery<any[]>({
    queryKey: ["/api/transfer-inquiries"],
  });

  const filtered = useMemo(() => {
    if (statusFilter === "all") return inquiries;
    return inquiries.filter((i: any) => i.status === statusFilter);
  }, [inquiries, statusFilter]);

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PUT", `/api/transfer-inquiries/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transfer-inquiries"] });
      toast({ title: t("Обновлено", "Updated") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/transfer-inquiries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transfer-inquiries"] });
      toast({ title: t("Заявка удалена", "Inquiry deleted") });
    },
  });

  const locale = lang === "ru" ? ru : enUS;

  return (
    <AdminLayout title={t("Заявки на трансфер", "Transfer Inquiries")}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48" data-testid="select-transfer-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("Все заявки", "All inquiries")}</SelectItem>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{lang === "ru" ? v.ru : v.en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filtered.length} {t("заявок", "inquiries")}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Car className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>{t("Заявок нет", "No inquiries found")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item: any) => {
            const statusInfo = STATUS_LABELS[item.status] || STATUS_LABELS.new;
            const isExpanded = expandedId === item.id;
            const note = adminNotes[item.id] ?? (item.adminNotes || "");

            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Header row */}
                  <div
                    className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Car className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{item.name}</span>
                        <Badge className={`text-xs px-2 py-0.5 ${statusInfo.color} border-0`}>
                          {lang === "ru" ? statusInfo.ru : statusInfo.en}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        {item.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{item.phone}</span>}
                        {item.departureCity && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.departureCity}</span>}
                        {item.startDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{item.startDate}</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm", { locale })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select
                        value={item.status}
                        onValueChange={(val) => updateMutation.mutate({ id: item.id, status: val })}
                      >
                        <SelectTrigger
                          className="h-8 text-xs w-36"
                          data-testid={`select-transfer-status-${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{lang === "ru" ? v.ru : v.en}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-delete-transfer-${item.id}`}
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-border px-5 py-4 bg-muted/20 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoRow icon={User} label={t("ФИО", "Name")} value={item.name} />
                        <InfoRow icon={Mail} label="Email" value={item.email} />
                        <InfoRow icon={Phone} label={t("Телефон", "Phone")} value={item.phone} />
                        <InfoRow icon={MapPin} label={t("Страна", "Country")} value={item.country} />
                        <InfoRow icon={MapPin} label={t("Город отправления", "Departure city")} value={item.departureCity} />
                        <InfoRow icon={Users} label={t("Пассажиров", "Passengers")} value={item.passengers} />
                        <InfoRow icon={Car} label={t("Автомобиль", "Vehicle")} value={item.vehicleName} />
                        <InfoRow icon={MapPin} label={t("Место приёма", "Pickup")} value={item.pickupLocation} />
                        <InfoRow icon={MapPin} label={t("Место высадки", "Dropoff")} value={item.dropoffLocation} />
                        <InfoRow icon={Calendar} label={t("Дата начала", "Start date")} value={item.startDate} />
                        <InfoRow icon={Calendar} label={t("Дата окончания", "End date")} value={item.endDate} />
                        <InfoRow icon={Clock} label={t("Время подачи", "Pickup time")} value={item.pickupTime} />
                      </div>

                      {item.notes && (
                        <div className="bg-white rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">{t("Пожелания клиента", "Client notes")}</p>
                          <p className="text-sm">{item.notes}</p>
                        </div>
                      )}

                      {/* Admin notes */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {t("Заметки администратора", "Admin notes")}
                        </Label>
                        <Textarea
                          rows={2}
                          placeholder={t("Добавить заметку...", "Add a note...")}
                          value={note}
                          onChange={(e) => setAdminNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          data-testid={`textarea-transfer-notes-${item.id}`}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMutation.mutate({ id: item.id, adminNotes: note })}
                          disabled={updateMutation.isPending}
                          data-testid={`button-save-transfer-notes-${item.id}`}
                        >
                          {t("Сохранить заметку", "Save note")}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium ${className || ""}`}>{children}</label>;
}
