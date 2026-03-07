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
import type { Country, City } from "@shared/schema";

export default function CitiesAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);

  const { data: countries = [] } = useQuery<Country[]>({ queryKey: ["/api/countries"] });
  const { data: cities = [] } = useQuery<City[]>({ queryKey: ["/api/cities"] });

  const cityMutation = useMutation({
    mutationFn: (data: any) => editing?.id ? apiRequest("PUT", `/api/cities/${editing.id}`, data) : apiRequest("POST", "/api/cities", data),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] }); 
      toast({ title: t("Сохранено", "Saved") }); 
      setEditing(null); 
    },
  });

  const deleteCityMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cities/${id}`, {}),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] }); 
      toast({ title: t("Удалено", "Deleted") });
    },
  });

  return (
    <AdminLayout title={t("Города", "Cities")}>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setEditing({ countryId: countries[0]?.id || "" })} className="gap-2" data-testid="button-add-city">
          <Plus className="h-4 w-4" />
          {t("Добавить город", "Add City")}
        </Button>
      </div>

      <div className="space-y-2">
        {cities.map(c => {
          const country = countries.find(co => co.id === c.countryId);
          return (
            <Card key={c.id} data-testid={`card-city-${c.id}`}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm" data-testid={`text-city-name-${c.id}`}>
                      {c.nameRu} / {c.nameEn}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`text-city-country-${c.id}`}>
                      {country ? (lang === "ru" ? country.nameRu : country.nameEn) : t("Неизвестная страна", "Unknown Country")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setEditing(c)}
                      data-testid={`button-edit-city-${c.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        if (confirm(t("Вы уверены?", "Are you sure?"))) {
                          deleteCityMutation.mutate(c.id);
                        }
                      }} 
                      className="text-destructive"
                      data-testid={`button-delete-city-${c.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editing !== null && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing.id ? t("Редактировать город", "Edit City") : t("Добавить город", "Add City")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); cityMutation.mutate(editing); }} className="space-y-4">
              <div>
                <Label>{t("Страна", "Country")}</Label>
                <select
                  className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm bg-background"
                  value={editing.countryId || ""}
                  onChange={e => setEditing((p: any) => ({ ...p, countryId: e.target.value }))}
                  required
                  data-testid="select-country"
                >
                  <option value="">{t("Выберите", "Select")}</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>
                      {lang === "ru" ? c.nameRu : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>{t("Название (RU)", "Name (RU)")}</Label>
                <Input 
                  value={editing.nameRu || ""} 
                  onChange={e => setEditing((p: any) => ({ ...p, nameRu: e.target.value }))} 
                  className="mt-1" 
                  required 
                  data-testid="input-name-ru"
                />
              </div>
              <div>
                <Label>{t("Название (EN)", "Name (EN)")}</Label>
                <Input 
                  value={editing.nameEn || ""} 
                  onChange={e => setEditing((p: any) => ({ ...p, nameEn: e.target.value }))} 
                  className="mt-1" 
                  required 
                  data-testid="input-name-en"
                />
              </div>
              <div>
                <Label>{t("Изображение (URL)", "Image URL")}</Label>
                <Input 
                  value={editing.imageUrl || ""} 
                  onChange={e => setEditing((p: any) => ({ ...p, imageUrl: e.target.value }))} 
                  className="mt-1"
                  data-testid="input-image-url"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={cityMutation.isPending} data-testid="button-save-city">
                  {cityMutation.isPending ? t("Сохранение...", "Saving...") : t("Сохранить", "Save")}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)} data-testid="button-cancel-city">
                  {t("Отмена", "Cancel")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
