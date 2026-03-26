import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, ListPlus, X, LayoutGrid } from "lucide-react";
import type { Tour } from "@shared/schema";

export default function FeedsAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [manageFeed, setManageFeed] = useState<any>(null);
  const [addTourId, setAddTourId] = useState("");

  const { data: feeds = [] } = useQuery<any[]>({ queryKey: ["/api/tour-feeds"] });
  const { data: allTours = [] } = useQuery<Tour[]>({ queryKey: ["/api/tours"] });
  const { data: feedTours = [] } = useQuery<any[]>({
    queryKey: [`/api/tour-feeds/${manageFeed?.id}/tours`],
    enabled: !!manageFeed?.id,
  });

  const invalidateFeeds = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/tour-feeds"] });
    queryClient.invalidateQueries({ queryKey: ["/api/tour-feeds?withTours=true&active=true"] });
  };

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      const { id, createdAt, updatedAt, tours, ...payload } = data;
      return editing?.id
        ? apiRequest("PUT", `/api/tour-feeds/${editing.id}`, payload)
        : apiRequest("POST", "/api/tour-feeds", payload);
    },
    onSuccess: () => { invalidateFeeds(); toast({ title: t("Сохранено", "Saved") }); setEditing(null); },
    onError: (err: any) => { toast({ title: t("Ошибка", "Error"), description: err.message, variant: "destructive" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tour-feeds/${id}`, {}),
    onSuccess: () => { invalidateFeeds(); },
    onError: (err: any) => { toast({ title: t("Ошибка", "Error"), description: err.message, variant: "destructive" }); },
  });

  const addToFeedMutation = useMutation({
    mutationFn: ({ feedId, tourId }: any) => apiRequest("POST", `/api/tour-feeds/${feedId}/tours`, { tourId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/tour-feeds/${manageFeed?.id}/tours`] }); setAddTourId(""); },
  });

  const removeFromFeedMutation = useMutation({
    mutationFn: ({ feedId, tourId }: any) => apiRequest("DELETE", `/api/tour-feeds/${feedId}/tours/${tourId}`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/tour-feeds/${manageFeed?.id}/tours`] }); },
  });

  return (
    <AdminLayout title={t("Ленты туров", "Tour Feeds")}>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setEditing({ nameRu: "", nameEn: "", order: 0, isActive: true })} className="gap-2">
          <Plus className="h-4 w-4" />{t("Добавить ленту", "Add Feed")}
        </Button>
      </div>
      <div className="space-y-3">
        {feeds.map((feed: any) => (
          <Card key={feed.id}><CardContent className="pt-3 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{lang === "ru" ? feed.nameRu : feed.nameEn}</p>
                <p className="text-xs text-muted-foreground">{t("Порядок:", "Order:")} {feed.order} · {feed.isActive ? t("Активна", "Active") : t("Скрыта", "Hidden")} · {t("Карточки:", "Cards:")} {feed.cardWidth === "small" ? t("узкие", "narrow") : feed.cardWidth === "large" ? t("широкие", "wide") : t("средние", "medium")}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setManageFeed(feed)} title={t("Управлять турами", "Manage tours")}><ListPlus className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setEditing(feed)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(feed.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      {editing !== null && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing.id ? t("Редактировать ленту", "Edit Feed") : t("Новая лента", "New Feed")}</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(editing); }} className="space-y-4">
              <div><Label>{t("Название (RU)", "Name (RU)")}</Label><Input value={editing.nameRu || ""} onChange={e => setEditing((p: any) => ({ ...p, nameRu: e.target.value }))} className="mt-1" required /></div>
              <div><Label>{t("Название (EN)", "Name (EN)")}</Label><Input value={editing.nameEn || ""} onChange={e => setEditing((p: any) => ({ ...p, nameEn: e.target.value }))} className="mt-1" required /></div>
              <div><Label>{t("Порядок", "Order")}</Label><Input type="number" value={editing.order || 0} onChange={e => setEditing((p: any) => ({ ...p, order: Number(e.target.value) }))} className="mt-1" /></div>
              <div>
                <Label className="flex items-center gap-1.5 mb-1"><LayoutGrid className="h-3.5 w-3.5" />{t("Ширина карточек", "Card Width")}</Label>
                <Select value={editing.cardWidth || "medium"} onValueChange={v => setEditing((p: any) => ({ ...p, cardWidth: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">{t("Узкие — 210px", "Narrow — 210px")}</SelectItem>
                    <SelectItem value="medium">{t("Средние — 272px", "Medium — 272px")}</SelectItem>
                    <SelectItem value="large">{t("Широкие — 340px", "Wide — 340px")}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">{t("Определяет ширину карточек тура в этой ленте", "Sets the width of tour cards in this feed")}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saveMutation.isPending}>{t("Сохранить", "Save")}</Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>{t("Отмена", "Cancel")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {manageFeed && (
        <Dialog open onOpenChange={() => setManageFeed(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{t("Туры в ленте:", "Tours in feed:")} {lang === "ru" ? manageFeed.nameRu : manageFeed.nameEn}</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {feedTours.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm truncate">{lang === "ru" ? item.tour?.titleRu : item.tour?.titleEn}</span>
                  <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7 text-destructive"
                    onClick={() => removeFromFeedMutation.mutate({ feedId: manageFeed.id, tourId: item.tourId })}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {feedTours.length === 0 && <p className="text-sm text-muted-foreground">{t("Нет туров", "No tours")}</p>}
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <Select value={addTourId} onValueChange={setAddTourId}>
                <SelectTrigger className="flex-1"><SelectValue placeholder={t("Добавить тур...", "Add tour...")} /></SelectTrigger>
                <SelectContent>
                  {allTours.filter((t: any) => !feedTours.some((ft: any) => ft.tourId === t.id)).map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{lang === "ru" ? t.titleRu : t.titleEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => addTourId && addToFeedMutation.mutate({ feedId: manageFeed.id, tourId: addTourId })} disabled={!addTourId}>
                {t("Добавить", "Add")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
