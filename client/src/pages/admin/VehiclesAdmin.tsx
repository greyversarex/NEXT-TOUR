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
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import type { Vehicle, Country, City } from "@shared/schema";

export default function VehiclesAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [filterCountry, setFilterCountry] = useState<string>("");
  const [filterCity, setFilterCity] = useState<string>("");

  const { data: vehicles = [] } = useQuery<Vehicle[]>({ queryKey: ["/api/vehicles?includeInactive=1"] });
  const { data: countries = [] } = useQuery<Country[]>({ queryKey: ["/api/countries"] });
  const { data: cities = [] } = useQuery<City[]>({ queryKey: ["/api/cities"] });

  const filteredVehicles = vehicles.filter(v => {
    if (filterCountry && v.countryId !== filterCountry) return false;
    if (filterCity && v.cityId !== filterCity) return false;
    return true;
  });

  const filteredFormCities = cities.filter(c =>
    !editing?.countryId || c.countryId === editing.countryId
  );

  const saveMutation = useMutation({
    mutationFn: (data: any) => editing?.id
      ? apiRequest("PUT", `/api/vehicles/${editing.id}`, data)
      : apiRequest("POST", "/api/vehicles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles?includeInactive=1"] });
      toast({ title: t("Сохранено", "Saved") });
      setEditing(null);
    },
    onError: (err: any) => {
      toast({ title: t("Ошибка", "Error"), description: err?.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/vehicles/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles?includeInactive=1"] });
      toast({ title: t("Машина удалена", "Vehicle deleted") });
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing.nameRu?.trim() || !editing.nameEn?.trim()) {
      toast({ title: t("Введите название", "Enter a name"), variant: "destructive" });
      return;
    }
    const payload = {
      nameRu: editing.nameRu,
      nameEn: editing.nameEn,
      image: editing.image || null,
      capacity: Number(editing.capacity) || 1,
      pricePerDay: String(editing.pricePerDay ?? "0"),
      countryId: editing.countryId || null,
      cityId: editing.cityId || null,
      isActive: editing.isActive !== false,
      sortOrder: Number(editing.sortOrder) || 0,
    };
    saveMutation.mutate(payload);
  };

  return (
    <AdminLayout title={t("Автопарк", "Vehicle Fleet")}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          value={filterCountry}
          onChange={e => { setFilterCountry(e.target.value); setFilterCity(""); }}
          className="h-9 rounded-md border border-input px-3 text-sm bg-background"
          data-testid="select-filter-vehicle-country"
        >
          <option value="">{t("Все страны", "All countries")}</option>
          {countries.map(c => <option key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</option>)}
        </select>
        <select
          value={filterCity}
          onChange={e => setFilterCity(e.target.value)}
          className="h-9 rounded-md border border-input px-3 text-sm bg-background"
          data-testid="select-filter-vehicle-city"
        >
          <option value="">{t("Все города", "All cities")}</option>
          {cities.filter(c => !filterCountry || c.countryId === filterCountry).map(c => (
            <option key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</option>
          ))}
        </select>
        <div className="ml-auto">
          <Button
            onClick={() => setEditing({ capacity: 4, pricePerDay: "0", isActive: true, sortOrder: 0 })}
            className="gap-2"
            data-testid="button-add-vehicle"
          >
            <Plus className="h-4 w-4" />{t("Добавить машину", "Add Vehicle")}
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        {filteredVehicles.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("Машин пока нет", "No vehicles yet")}
          </p>
        )}
        {filteredVehicles.map(v => {
          const country = countries.find(c => c.id === v.countryId);
          const city = cities.find(c => c.id === v.cityId);
          return (
            <Card key={v.id} data-testid={`card-vehicle-${v.id}`}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {v.image ? (
                      <img src={v.image} alt={v.nameRu} className="h-12 w-16 rounded object-cover shrink-0" />
                    ) : (
                      <div className="h-12 w-16 rounded bg-muted shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm flex items-center gap-2" data-testid={`text-vehicle-name-${v.id}`}>
                        {lang === "ru" ? v.nameRu : v.nameEn}
                        {v.isActive === false && (
                          <span className="text-xs text-muted-foreground border rounded px-1.5 py-0.5">
                            {t("скрыта", "hidden")}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{v.capacity}</span>
                        <span>· {Number(v.pricePerDay).toLocaleString()} TJS/{t("сутки", "day")}</span>
                        <span>
                          {[country && (lang === "ru" ? country.nameRu : country.nameEn),
                            city && (lang === "ru" ? city.nameRu : city.nameEn)]
                            .filter(Boolean).join(" • ")}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(v)} data-testid={`button-edit-vehicle-${v.id}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => {
                        if (confirm(t("Удалить машину?", "Delete vehicle?"))) {
                          deleteMutation.mutate(v.id);
                        }
                      }}
                      className="text-destructive"
                      data-testid={`button-delete-vehicle-${v.id}`}
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing.id ? t("Редактировать машину", "Edit Vehicle") : t("Добавить машину", "Add Vehicle")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("Название (RU)", "Name (RU)")}</Label>
                  <Input
                    value={editing.nameRu || ""}
                    onChange={e => setEditing((p: any) => ({ ...p, nameRu: e.target.value }))}
                    className="mt-1" required
                    placeholder={t("Toyota Prado", "Toyota Prado")}
                    data-testid="input-vehicle-name-ru"
                  />
                </div>
                <div>
                  <Label>{t("Название (EN)", "Name (EN)")}</Label>
                  <Input
                    value={editing.nameEn || ""}
                    onChange={e => setEditing((p: any) => ({ ...p, nameEn: e.target.value }))}
                    className="mt-1" required
                    placeholder="Toyota Prado"
                    data-testid="input-vehicle-name-en"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("Вместимость (пассажиров)", "Capacity (passengers)")}</Label>
                  <Input
                    type="number" min={1} max={100}
                    value={editing.capacity ?? 1}
                    onChange={e => setEditing((p: any) => ({ ...p, capacity: e.target.value }))}
                    className="mt-1" required
                    data-testid="input-vehicle-capacity"
                  />
                </div>
                <div>
                  <Label>{t("Цена за сутки (TJS)", "Price per day (TJS)")}</Label>
                  <Input
                    type="number" min={0} step="0.01"
                    value={editing.pricePerDay ?? "0"}
                    onChange={e => setEditing((p: any) => ({ ...p, pricePerDay: e.target.value }))}
                    className="mt-1" required
                    data-testid="input-vehicle-price"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("Страна", "Country")}</Label>
                  <select
                    className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm bg-background"
                    value={editing.countryId || ""}
                    onChange={e => setEditing((p: any) => ({ ...p, countryId: e.target.value, cityId: "" }))}
                    data-testid="select-vehicle-country"
                  >
                    <option value="">{t("Не выбрана", "Not selected")}</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</option>)}
                  </select>
                </div>
                <div>
                  <Label>{t("Город", "City")}</Label>
                  <select
                    className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm bg-background"
                    value={editing.cityId || ""}
                    onChange={e => setEditing((p: any) => ({ ...p, cityId: e.target.value }))}
                    data-testid="select-vehicle-city"
                  >
                    <option value="">{t("Не выбран", "Not selected")}</option>
                    {filteredFormCities.map(c => <option key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <Label>{t("Фото", "Photo")}</Label>
                <div className="mt-1">
                  <ImageUpload
                    value={editing.image || ""}
                    onChange={v => setEditing((p: any) => ({ ...p, image: v }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <Label>{t("Порядок сортировки", "Sort order")}</Label>
                  <Input
                    type="number"
                    value={editing.sortOrder ?? 0}
                    onChange={e => setEditing((p: any) => ({ ...p, sortOrder: e.target.value }))}
                    className="mt-1"
                    data-testid="input-vehicle-sort"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm h-9 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.isActive !== false}
                    onChange={e => setEditing((p: any) => ({ ...p, isActive: e.target.checked }))}
                    data-testid="checkbox-vehicle-active"
                  />
                  {t("Показывать в форме бронирования", "Show in booking form")}
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saveMutation.isPending} data-testid="button-save-vehicle">
                  {saveMutation.isPending ? t("Сохранение...", "Saving...") : t("Сохранить", "Save")}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
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
