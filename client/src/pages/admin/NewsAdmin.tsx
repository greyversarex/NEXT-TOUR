import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { format } from "date-fns";

export default function NewsAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);

  const { data: newsList = [] } = useQuery<any[]>({ queryKey: ["/api/news?all=true"] });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editing?.id ? apiRequest("PUT", `/api/news/${editing.id}`, data) : apiRequest("POST", "/api/news", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/news"] }); toast({ title: t("Сохранено", "Saved") }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/news/${id}`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/news"] }); },
  });

  return (
    <AdminLayout title={t("Новости", "News")}>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setEditing({ titleRu: "", titleEn: "", contentRu: "", contentEn: "", isPublished: true })} className="gap-2">
          <Plus className="h-4 w-4" />{t("Добавить новость", "Add News")}
        </Button>
      </div>
      <div className="space-y-3">
        {newsList.map((item: any) => (
          <Card key={item.id}><CardContent className="pt-3 pb-3">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{lang === "ru" ? item.titleRu : item.titleEn}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(item.publishedAt), "dd.MM.yyyy")} · {item.isPublished ? t("Опубликовано", "Published") : t("Черновик", "Draft")}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setEditing(item)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      {editing !== null && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing.id ? t("Редактировать новость", "Edit News") : t("Новая новость", "New Article")}</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(editing); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("Заголовок (RU)", "Title (RU)")}</Label><Input value={editing.titleRu || ""} onChange={e => setEditing((p: any) => ({ ...p, titleRu: e.target.value }))} className="mt-1" required /></div>
                <div><Label>{t("Заголовок (EN)", "Title (EN)")}</Label><Input value={editing.titleEn || ""} onChange={e => setEditing((p: any) => ({ ...p, titleEn: e.target.value }))} className="mt-1" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("Текст (RU)", "Content (RU)")}</Label><Textarea value={editing.contentRu || ""} onChange={e => setEditing((p: any) => ({ ...p, contentRu: e.target.value }))} className="mt-1 min-h-[120px]" required /></div>
                <div><Label>{t("Текст (EN)", "Content (EN)")}</Label><Textarea value={editing.contentEn || ""} onChange={e => setEditing((p: any) => ({ ...p, contentEn: e.target.value }))} className="mt-1 min-h-[120px]" required /></div>
              </div>
              <div><Label>{t("Изображение", "Image")}</Label><div className="mt-1"><ImageUpload value={editing.imageUrl || ""} onChange={v => setEditing((p: any) => ({ ...p, imageUrl: v }))} /></div></div>
              <div className="flex items-center gap-2">
                <Switch checked={editing.isPublished !== false} onCheckedChange={v => setEditing((p: any) => ({ ...p, isPublished: v }))} id="pub" />
                <Label htmlFor="pub">{t("Опубликовано", "Published")}</Label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saveMutation.isPending}>{t("Сохранить", "Save")}</Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>{t("Отмена", "Cancel")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
