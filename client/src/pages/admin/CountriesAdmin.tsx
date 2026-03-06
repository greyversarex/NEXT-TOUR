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

function EntityForm({ item, fields, onSave, onClose, title, isSaving }: any) {
  const { t } = useI18n();
  const [form, setForm] = useState(item || {});
  const set = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
          {fields.map((f: any) => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Input value={form[f.key] || ""} onChange={e => set(f.key, e.target.value)} className="mt-1" required={f.required} placeholder={f.placeholder} />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSaving}>{isSaving ? t("Сохранение...", "Saving...") : t("Сохранить", "Save")}</Button>
            <Button type="button" variant="outline" onClick={onClose}>{t("Отмена", "Cancel")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CountriesAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [editingCity, setEditingCity] = useState<any>(null);
  const [tab, setTab] = useState<"countries" | "cities">("countries");

  const { data: countries = [] } = useQuery<Country[]>({ queryKey: ["/api/countries"] });
  const { data: cities = [] } = useQuery<City[]>({ queryKey: ["/api/cities"] });

  const countryMutation = useMutation({
    mutationFn: (data: any) => editing?.id ? apiRequest("PUT", `/api/countries/${editing.id}`, data) : apiRequest("POST", "/api/countries", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/countries"] }); toast({ title: t("Сохранено", "Saved") }); setEditing(null); },
  });

  const deleteCountryMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/countries/${id}`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/countries"] }); },
  });

  const cityMutation = useMutation({
    mutationFn: (data: any) => editingCity?.id ? apiRequest("PUT", `/api/cities/${editingCity.id}`, data) : apiRequest("POST", "/api/cities", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cities"] }); toast({ title: t("Сохранено", "Saved") }); setEditingCity(null); },
  });

  const deleteCityMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cities/${id}`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cities"] }); },
  });

  return (
    <AdminLayout title={t("Страны и города", "Countries & Cities")}>
      <div className="flex gap-4 mb-6">
        <Button variant={tab === "countries" ? "default" : "outline"} onClick={() => setTab("countries")}>{t("Страны", "Countries")}</Button>
        <Button variant={tab === "cities" ? "default" : "outline"} onClick={() => setTab("cities")}>{t("Города", "Cities")}</Button>
      </div>

      {tab === "countries" && (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setEditing({})} className="gap-2"><Plus className="h-4 w-4" />{t("Добавить страну", "Add Country")}</Button>
          </div>
          <div className="space-y-2">
            {countries.map(c => (
              <Card key={c.id}><CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{c.nameRu} / {c.nameEn}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(c)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteCountryMutation.mutate(c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent></Card>
            ))}
          </div>
        </>
      )}

      {tab === "cities" && (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setEditingCity({ countryId: countries[0]?.id || "" })} className="gap-2"><Plus className="h-4 w-4" />{t("Добавить город", "Add City")}</Button>
          </div>
          <div className="space-y-2">
            {cities.map(c => {
              const country = countries.find(co => co.id === c.countryId);
              return (
                <Card key={c.id}><CardContent className="pt-3 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{c.nameRu} / {c.nameEn}</p>
                      <p className="text-xs text-muted-foreground">{country?.nameRu} / {country?.nameEn}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingCity(c)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteCityMutation.mutate(c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent></Card>
              );
            })}
          </div>
        </>
      )}

      {editing !== null && (
        <EntityForm
          item={editing}
          title={editing.id ? t("Редактировать страну", "Edit Country") : t("Добавить страну", "Add Country")}
          fields={[
            { key: "nameRu", label: t("Название (RU)", "Name (RU)"), required: true },
            { key: "nameEn", label: t("Название (EN)", "Name (EN)"), required: true },
            { key: "imageUrl", label: t("Изображение (URL)", "Image URL") },
          ]}
          onSave={countryMutation.mutate}
          onClose={() => setEditing(null)}
          isSaving={countryMutation.isPending}
        />
      )}

      {editingCity !== null && (
        <Dialog open onOpenChange={() => setEditingCity(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingCity.id ? t("Редактировать город", "Edit City") : t("Добавить город", "Add City")}</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); cityMutation.mutate(editingCity); }} className="space-y-4">
              <div>
                <Label>{t("Страна", "Country")}</Label>
                <select
                  className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm bg-background"
                  value={editingCity.countryId || ""}
                  onChange={e => setEditingCity((p: any) => ({ ...p, countryId: e.target.value }))}
                  required
                >
                  <option value="">{t("Выберите", "Select")}</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</option>)}
                </select>
              </div>
              <div>
                <Label>{t("Название (RU)", "Name (RU)")}</Label>
                <Input value={editingCity.nameRu || ""} onChange={e => setEditingCity((p: any) => ({ ...p, nameRu: e.target.value }))} className="mt-1" required />
              </div>
              <div>
                <Label>{t("Название (EN)", "Name (EN)")}</Label>
                <Input value={editingCity.nameEn || ""} onChange={e => setEditingCity((p: any) => ({ ...p, nameEn: e.target.value }))} className="mt-1" required />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={cityMutation.isPending}>{t("Сохранить", "Save")}</Button>
                <Button type="button" variant="outline" onClick={() => setEditingCity(null)}>{t("Отмена", "Cancel")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
