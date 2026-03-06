import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function BannersAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);

  const { data: banners = [] } = useQuery<any[]>({ queryKey: ["/api/banners"] });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editing?.id ? apiRequest("PUT", `/api/banners/${editing.id}`, data) : apiRequest("POST", "/api/banners", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/banners"] }); toast({ title: t("Сохранено", "Saved") }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/banners/${id}`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/banners"] }); },
  });

  return (
    <AdminLayout title={t("Баннеры", "Banners")}>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setEditing({ titleRu: "", titleEn: "", imageUrl: "", order: 0, isActive: true })} className="gap-2">
          <Plus className="h-4 w-4" />{t("Добавить баннер", "Add Banner")}
        </Button>
      </div>
      <div className="space-y-3">
        {banners.map((b: any) => (
          <Card key={b.id}><CardContent className="pt-3 pb-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={b.imageUrl} alt="" className="w-16 h-10 object-cover rounded" />
                <div>
                  <p className="font-medium text-sm">{lang === "ru" ? b.titleRu : b.titleEn}</p>
                  <p className="text-xs text-muted-foreground">{t("Порядок:", "Order:")} {b.order} · {b.isActive ? t("Активен", "Active") : t("Скрыт", "Hidden")}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setEditing(b)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(b.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      {editing !== null && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing.id ? t("Редактировать баннер", "Edit Banner") : t("Новый баннер", "New Banner")}</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(editing); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t("Заголовок (RU)", "Title (RU)")}</Label><Input value={editing.titleRu || ""} onChange={e => setEditing((p: any) => ({ ...p, titleRu: e.target.value }))} className="mt-1" required /></div>
                <div><Label>{t("Заголовок (EN)", "Title (EN)")}</Label><Input value={editing.titleEn || ""} onChange={e => setEditing((p: any) => ({ ...p, titleEn: e.target.value }))} className="mt-1" required /></div>
              </div>
              <div><Label>{t("Изображение (URL)", "Image URL")}</Label><Input value={editing.imageUrl || ""} onChange={e => setEditing((p: any) => ({ ...p, imageUrl: e.target.value }))} className="mt-1" required /></div>
              <div><Label>{t("Ссылка (URL)", "Link URL")}</Label><Input value={editing.linkUrl || ""} onChange={e => setEditing((p: any) => ({ ...p, linkUrl: e.target.value }))} className="mt-1" /></div>
              <div><Label>{t("Порядок", "Order")}</Label><Input type="number" value={editing.order || 0} onChange={e => setEditing((p: any) => ({ ...p, order: Number(e.target.value) }))} className="mt-1" /></div>
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
