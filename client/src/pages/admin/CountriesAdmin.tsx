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
import { Plus, Edit, Trash2, Home } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
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
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {c.imageUrl && (
                      <img src={c.imageUrl} alt={c.nameRu} className="h-10 w-16 rounded object-cover shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {c.countryCode && (
                          <span className="text-lg" title={c.countryCode}>
                            {c.countryCode.toUpperCase().replace(/./g, ch => String.fromCodePoint(127397 + ch.charCodeAt(0)))}
                          </span>
                        )}
                        <p className="font-medium text-sm">{c.nameRu} / {c.nameEn}</p>
                        {c.countryCode && <span className="text-xs text-muted-foreground font-mono">{c.countryCode}</span>}
                        {(c as any).showOnHome && (
                          <span className="flex items-center gap-1 text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            <Home className="h-3 w-3" />{t("На главной", "On Home")}
                          </span>
                        )}
                      </div>
                      {c.tagsRu && c.tagsRu.length > 0 && (
                        <p className="text-xs text-muted-foreground truncate">{c.tagsRu.join(" • ")}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
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
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing.id ? t("Редактировать страну", "Edit Country") : t("Добавить страну", "Add Country")}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault();
                const raw = editing;
                countryMutation.mutate({
                  ...raw,
                  tagsRu: typeof raw.tagsRu === "string" ? raw.tagsRu.split(",").map((s: string) => s.trim()).filter(Boolean) : raw.tagsRu,
                  tagsEn: typeof raw.tagsEn === "string" ? raw.tagsEn.split(",").map((s: string) => s.trim()).filter(Boolean) : raw.tagsEn,
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("Название (RU)", "Name (RU)")}</Label>
                  <Input
                    value={editing.nameRu || ""}
                    onChange={e => setEditing((p: any) => ({ ...p, nameRu: e.target.value }))}
                    className="mt-1" required
                  />
                </div>
                <div>
                  <Label>{t("Название (EN)", "Name (EN)")}</Label>
                  <Input
                    value={editing.nameEn || ""}
                    onChange={e => setEditing((p: any) => ({ ...p, nameEn: e.target.value }))}
                    className="mt-1" required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label>{t("Изображение", "Image")}</Label>
                  <div className="mt-1">
                    <ImageUpload value={editing.imageUrl || ""} onChange={v => setEditing((p: any) => ({ ...p, imageUrl: v }))} />
                  </div>
                </div>
                <div>
                  <Label>{t("Код страны", "Country Code")}</Label>
                  <Input
                    value={editing.countryCode || ""}
                    onChange={e => setEditing((p: any) => ({ ...p, countryCode: e.target.value.toUpperCase().slice(0, 2) }))}
                    className="mt-1 uppercase"
                    placeholder="FR"
                    maxLength={2}
                  />
                </div>
              </div>
              <div>
                <Label>{t("Теги (RU, через запятую)", "Tags (RU, comma separated)")}</Label>
                <Input
                  value={Array.isArray(editing.tagsRu) ? editing.tagsRu.join(", ") : (editing.tagsRu || "")}
                  onChange={e => setEditing((p: any) => ({ ...p, tagsRu: e.target.value }))}
                  className="mt-1"
                  placeholder="Пляжи, Острова, Кораллы"
                />
              </div>
              <div>
                <Label>{t("Теги (EN, через запятую)", "Tags (EN, comma separated)")}</Label>
                <Input
                  value={Array.isArray(editing.tagsEn) ? editing.tagsEn.join(", ") : (editing.tagsEn || "")}
                  onChange={e => setEditing((p: any) => ({ ...p, tagsEn: e.target.value }))}
                  className="mt-1"
                  placeholder="Beaches, Islands, Corals"
                />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                <input
                  type="checkbox"
                  id="showOnHome"
                  checked={!!(editing.showOnHome)}
                  onChange={e => setEditing((p: any) => ({ ...p, showOnHome: e.target.checked }))}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
                <label htmlFor="showOnHome" className="cursor-pointer select-none">
                  <p className="text-sm font-medium">{t("Показывать на главной странице", "Show on Home Page")}</p>
                  <p className="text-xs text-muted-foreground">{t("Страна появится в разделе «Направления мечты»", "Country will appear in the Dream Destinations section")}</p>
                </label>
              </div>
              {editing.showOnHome && (
                <div>
                  <Label>{t("Размер карточки", "Card Size")}</Label>
                  <select
                    className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm bg-background"
                    value={editing.cardSize || "normal"}
                    onChange={e => setEditing((p: any) => ({ ...p, cardSize: e.target.value }))}
                  >
                    <option value="normal">{t("Обычная (1×)", "Normal (1×)")}</option>
                    <option value="wide">{t("Широкая (2 колонки)", "Wide (2 columns)")}</option>
                    <option value="full">{t("Полная (3 колонки)", "Full width (3 columns)")}</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={countryMutation.isPending}>
                  {countryMutation.isPending ? t("Сохранение...", "Saving...") : t("Сохранить", "Save")}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>{t("Отмена", "Cancel")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
