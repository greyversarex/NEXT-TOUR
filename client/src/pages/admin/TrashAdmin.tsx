import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { RotateCcw, Trash2, Inbox } from "lucide-react";
import type { Tour } from "@shared/schema";

export default function TrashAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allTours = [], isLoading } = useQuery<Tour[]>({
    queryKey: ["/api/tours", "trash"],
    queryFn: () => fetch("/api/tours?includeInactive=true", { credentials: "include" }).then(r => r.json()),
  });

  const trashedTours = allTours.filter(t => !!(t as any).deletedAt);

  const restoreMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/tours/${id}`, { isActive: true, deletedAt: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours", "trash"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tours", "admin"] });
      toast({ title: t("Тур восстановлен", "Tour restored") });
    },
    onError: (err: any) => {
      toast({ title: t("Ошибка", "Error"), description: err?.message, variant: "destructive" });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tours/${id}/permanent`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours", "trash"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tours", "admin"] });
      toast({ title: t("Тур удалён навсегда", "Tour permanently deleted") });
    },
    onError: (err: any) => {
      const msg = err?.message || "";
      toast({
        title: t("Нельзя удалить", "Cannot delete"),
        description: msg.includes("foreign key") || msg.includes("referenced") || msg.includes("booking")
          ? t("Нельзя удалить тур у которого есть бронирования. Сначала удалите все бронирования этого тура.", "Cannot delete a tour that has bookings. Delete all bookings first.")
          : msg,
        variant: "destructive",
      });
    },
  });

  const restoreAll = () => {
    trashedTours.forEach(tour => restoreMutation.mutate(tour.id));
  };

  return (
    <AdminLayout title={t("Корзина", "Trash")}>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? t("Загрузка...", "Loading...")
            : trashedTours.length === 0
              ? t("Корзина пуста", "Trash is empty")
              : t(`${trashedTours.length} тур(ов) в корзине`, `${trashedTours.length} tour(s) in trash`)}
        </p>
        {trashedTours.length > 0 && (
          <Button variant="outline" size="sm" onClick={restoreAll} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            {t("Восстановить все", "Restore all")}
          </Button>
        )}
      </div>

      {trashedTours.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <Inbox className="h-12 w-12 opacity-30" />
          <p className="text-sm">{t("Удалённых туров нет", "No deleted tours")}</p>
        </div>
      )}

      <div className="space-y-3">
        {trashedTours.map(tour => (
          <Card key={tour.id} className="border-dashed opacity-80" data-testid={`card-trash-tour-${tour.id}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {tour.mainImage && (
                    <img
                      src={tour.mainImage}
                      alt=""
                      className="w-12 h-9 object-cover rounded shrink-0 grayscale"
                      style={{ objectPosition: tour.mainImagePosition || "50% 50%" }}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate text-muted-foreground">
                      {lang === "ru" ? tour.titleRu : tour.titleEn}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground/60">
                        {tour.duration} {t("дн.", "days")} · {Number(tour.basePrice).toFixed(0)} TJS
                      </span>
                      <Badge variant="outline" className="text-xs py-0 text-muted-foreground">
                        {t("Удалён", "Deleted")}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8"
                    onClick={() => restoreMutation.mutate(tour.id)}
                    disabled={restoreMutation.isPending}
                    data-testid={`button-restore-tour-${tour.id}`}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t("Восстановить", "Restore")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 h-8 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm(t("Удалить тур навсегда? Это действие необратимо.", "Delete tour permanently? This cannot be undone."))) {
                        permanentDeleteMutation.mutate(tour.id);
                      }
                    }}
                    disabled={permanentDeleteMutation.isPending}
                    data-testid={`button-permanent-delete-tour-${tour.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("Удалить навсегда", "Delete permanently")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
