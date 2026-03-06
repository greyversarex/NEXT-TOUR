import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function HeroSlidesAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);

  const { data: slides = [] } = useQuery<any[]>({ queryKey: ["/api/hero-slides"] });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editing?.id ? apiRequest("PUT", `/api/hero-slides/${editing.id}`, data) : apiRequest("POST", "/api/hero-slides", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/hero-slides"] }); toast({ title: t("Сохранено", "Saved") }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/hero-slides/${id}`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/hero-slides"] }); },
  });

  return (
    <AdminLayout title={t("Слайды Hero", "Hero Slides")}>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setEditing({ titleRu: "", titleEn: "", mediaUrl: "", mediaType: "image", order: 0, isActive: true })} className="gap-2">
          <Plus className="h-4 w-4" />{t("Добавить слайд", "Add Slide")}
        </Button>
      </div>
      <div className="space-y-3">
        {slides.map((s: any) => (
          <Card key={s.id}><CardContent className="pt-3 pb-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {s.mediaType === "image" && <img src={s.mediaUrl} alt="" className="w-16 h-10 object-cover rounded" />}
                <div>
                  <p className="font-medium text-sm">{lang === "ru" ? s.titleRu : s.titleEn}</p>
                  <p className="text-xs text-muted-foreground">{s.mediaType} · {t("Порядок:", "Order:")} {s.order} · {s.isActive ? t("Активен", "Active") : t("Скрыт", "Hidden")}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setEditing(s)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(s.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      {editing !== null && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing.id ? t("Редактировать слайд", "Edit Slide") : t("Новый слайд", "New Slide")}</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(editing); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t("Заголовок (RU)", "Title (RU)")}</Label><Input value={editing.titleRu || ""} onChange={e => setEditing((p: any) => ({ ...p, titleRu: e.target.value }))} className="mt-1" required /></div>
                <div><Label>{t("Заголовок (EN)", "Title (EN)")}</Label><Input value={editing.titleEn || ""} onChange={e => setEditing((p: any) => ({ ...p, titleEn: e.target.value }))} className="mt-1" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t("Подзаголовок (RU)", "Subtitle (RU)")}</Label><Input value={editing.subtitleRu || ""} onChange={e => setEditing((p: any) => ({ ...p, subtitleRu: e.target.value }))} className="mt-1" /></div>
                <div><Label>{t("Подзаголовок (EN)", "Subtitle (EN)")}</Label><Input value={editing.subtitleEn || ""} onChange={e => setEditing((p: any) => ({ ...p, subtitleEn: e.target.value }))} className="mt-1" /></div>
              </div>
              <div><Label>{t("URL медиа", "Media URL")}</Label><Input value={editing.mediaUrl || ""} onChange={e => setEditing((p: any) => ({ ...p, mediaUrl: e.target.value }))} className="mt-1" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("Тип медиа", "Media Type")}</Label>
                  <Select value={editing.mediaType || "image"} onValueChange={v => setEditing((p: any) => ({ ...p, mediaType: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>{t("Порядок", "Order")}</Label><Input type="number" value={editing.order || 0} onChange={e => setEditing((p: any) => ({ ...p, order: Number(e.target.value) }))} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t("Текст кнопки (RU)", "Button (RU)")}</Label><Input value={editing.buttonTextRu || ""} onChange={e => setEditing((p: any) => ({ ...p, buttonTextRu: e.target.value }))} className="mt-1" /></div>
                <div><Label>{t("Текст кнопки (EN)", "Button (EN)")}</Label><Input value={editing.buttonTextEn || ""} onChange={e => setEditing((p: any) => ({ ...p, buttonTextEn: e.target.value }))} className="mt-1" /></div>
              </div>
              <div><Label>{t("Ссылка кнопки", "Button Link")}</Label><Input value={editing.buttonLink || ""} onChange={e => setEditing((p: any) => ({ ...p, buttonLink: e.target.value }))} className="mt-1" /></div>
              <div className="flex items-center gap-2">
                <Switch checked={editing.isActive !== false} onCheckedChange={v => setEditing((p: any) => ({ ...p, isActive: v }))} id="active" />
                <Label htmlFor="active">{t("Активен", "Active")}</Label>
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
