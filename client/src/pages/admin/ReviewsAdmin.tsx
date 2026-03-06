import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Star, Check, X, Bookmark } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export default function ReviewsAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const qp = new URLSearchParams();
  if (statusFilter && statusFilter !== "all") qp.set("status", statusFilter);
  const { data: reviews = [] } = useQuery<any[]>({ queryKey: [`/api/reviews?${qp.toString()}`] });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, inFeaturedFeed }: any) =>
      apiRequest("PUT", `/api/reviews/${id}/status`, { status, inFeaturedFeed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: t("Обновлено", "Updated") });
    },
  });

  const statusBadge: Record<string, any> = {
    pending: { label_ru: "На модерации", label_en: "Pending", color: "bg-yellow-100 text-yellow-700" },
    approved: { label_ru: "Одобрен", label_en: "Approved", color: "bg-green-100 text-green-700" },
    rejected: { label_ru: "Отклонён", label_en: "Rejected", color: "bg-red-100 text-red-700" },
  };

  return (
    <AdminLayout title={t("Отзывы", "Reviews")}>
      <div className="flex items-center gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("Все статусы", "All statuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("Все", "All")}</SelectItem>
            <SelectItem value="pending">{t("На модерации", "Pending")}</SelectItem>
            <SelectItem value="approved">{t("Одобренные", "Approved")}</SelectItem>
            <SelectItem value="rejected">{t("Отклонённые", "Rejected")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">{t("Отзывов нет", "No reviews")}</p>
        ) : reviews.map((review: any) => {
          const st = statusBadge[review.status] || statusBadge.pending;
          return (
            <Card key={review.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{review.user?.name}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{format(new Date(review.createdAt), "dd.MM.yyyy")}</span>
                    </div>
                    <p className="text-sm text-foreground/80 mb-2">{review.textRu}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>
                        {lang === "ru" ? st.label_ru : st.label_en}
                      </span>
                      {review.inFeaturedFeed && (
                        <Badge variant="secondary" className="text-xs"><Bookmark className="h-3 w-3 mr-1" />{t("В ленте", "In Feed")}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {review.status !== "approved" && (
                      <Button variant="ghost" size="icon" className="text-green-600 h-8 w-8"
                        onClick={() => updateMutation.mutate({ id: review.id, status: "approved" })}
                        title={t("Одобрить", "Approve")}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {review.status !== "rejected" && (
                      <Button variant="ghost" size="icon" className="text-destructive h-8 w-8"
                        onClick={() => updateMutation.mutate({ id: review.id, status: "rejected" })}
                        title={t("Отклонить", "Reject")}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {review.status === "approved" && !review.inFeaturedFeed && (
                      <Button variant="ghost" size="icon" className="text-primary h-8 w-8"
                        onClick={() => updateMutation.mutate({ id: review.id, status: "approved", inFeaturedFeed: true })}
                        title={t("Добавить в ленту", "Add to feed")}>
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    )}
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
