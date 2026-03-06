import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function PriceComponentsAdmin() {
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);

  const { data: components = [] } = useQuery<any[]>({ queryKey: ["/api/price-components"] });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editing?.id ? apiRequest("PUT", `/api/price-components/${editing.id}`, data) : apiRequest("POST", "/api/price-components", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/price-components"] }); toast({ title: t("Сохранено", "Saved") }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/price-components/${id}`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/price-components"] }); },
  });

  return (
    <AdminLayout title={t("Компоненты цены", "Price Components")}>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setEditing({ nameRu: "", nameEn: "" })} className="gap-2">
          <Plus className="h-4 w-4" />{t("Добавить компонент", "Add Component")}
        </Button>
      </div>
      <div className="space-y-2">
        {components.map((c: any) => (
          <Card key={c.id}><CardContent className="pt-3 pb-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">{c.nameRu} / {c.nameEn}</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setEditing(c)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      {editing !== null && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing.id ? t("Редактировать", "Edit") : t("Добавить компонент", "Add Component")}</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(editing); }} className="space-y-4">
              <div><Label>{t("Название (RU)", "Name (RU)")}</Label><Input value={editing.nameRu || ""} onChange={e => setEditing((p: any) => ({ ...p, nameRu: e.target.value }))} className="mt-1" required /></div>
              <div><Label>{t("Название (EN)", "Name (EN)")}</Label><Input value={editing.nameEn || ""} onChange={e => setEditing((p: any) => ({ ...p, nameEn: e.target.value }))} className="mt-1" required /></div>
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
