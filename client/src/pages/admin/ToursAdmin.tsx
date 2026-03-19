import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Edit, Trash2, Eye, CalendarDays, ListChecks, Route, ChevronDown, ChevronRight, MapPin, Clock, DollarSign, X } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { Tour, Country, Category } from "@shared/schema";

export default function ToursAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editTour, setEditTour] = useState<Partial<Tour> | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: tours = [] } = useQuery<Tour[]>({ queryKey: ["/api/tours"] });
  const { data: countries = [] } = useQuery<Country[]>({ queryKey: ["/api/countries"] });
  const { data: categories = [] } = useQuery<any[]>({ queryKey: ["/api/categories"] });
  const { data: cities = [] } = useQuery<any[]>({ queryKey: ["/api/cities"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tours/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      toast({ title: t("Удалено", "Deleted") });
    },
  });

  const openNew = () => { setEditTour({}); setShowForm(true); };
  const openEdit = (tour: Tour) => { setEditTour(tour); setShowForm(true); };

  return (
    <AdminLayout title={t("Управление турами", "Tours Management")}>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">{t("Всего туров:", "Total tours:")} {tours.length}</p>
        <Button onClick={openNew} className="gap-2" data-testid="button-new-tour">
          <Plus className="h-4 w-4" /> {t("Добавить тур", "Add Tour")}
        </Button>
      </div>

      <div className="space-y-3">
        {tours.map(tour => (
          <Card key={tour.id} data-testid={`card-admin-tour-${tour.id}`}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {tour.mainImage && (
                    <img src={tour.mainImage} alt="" className="w-12 h-9 object-cover rounded shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{lang === "ru" ? tour.titleRu : tour.titleEn}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{tour.duration} {t("дн.", "days")} · ${Number(tour.basePrice).toFixed(0)}</span>
                      {tour.isHot && <Badge className="text-xs py-0 bg-orange-100 text-orange-700">{t("Горящий", "Hot")}</Badge>}
                      {tour.discountPercent > 0 && <Badge variant="secondary" className="text-xs py-0">-{tour.discountPercent}%</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/tours/${tour.id}`}>
                    <Button variant="ghost" size="icon" title="View"><Eye className="h-4 w-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(tour)} data-testid={`button-edit-tour-${tour.id}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(tour.id)} className="text-destructive" data-testid={`button-delete-tour-${tour.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && (
        <TourForm
          tour={editTour || {}}
          countries={countries}
          categories={categories}
          cities={cities}
          onSaved={() => { setShowForm(false); setEditTour(null); }}
          onClose={() => { setShowForm(false); setEditTour(null); }}
        />
      )}
    </AdminLayout>
  );
}

function TourForm({ tour, countries, categories, cities, onSaved, onClose }: any) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!tour.id;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titleRu: tour.titleRu || "",
    titleEn: tour.titleEn || "",
    descriptionRu: tour.descriptionRu || "",
    descriptionEn: tour.descriptionEn || "",
    countryId: tour.countryId || "",
    cityId: tour.cityId || "",
    categoryId: tour.categoryId || "",
    duration: tour.duration || 7,
    basePrice: tour.basePrice || 500,
    discountPercent: tour.discountPercent || 0,
    mainImage: tour.mainImage || "",
    images: (tour.images || []) as string[],
    mapUrl: tour.mapUrl || "",
    isHot: tour.isHot || false,
    isFeatured: tour.isFeatured || false,
    isActive: tour.isActive !== false,
    includedRu: tour.includedRu || "",
    includedEn: tour.includedEn || "",
    notIncludedRu: tour.notIncludedRu || "",
    notIncludedEn: tour.notIncludedEn || "",
    customDatesTextRu: tour.customDatesTextRu || "",
    customDatesTextEn: tour.customDatesTextEn || "",
  });

  const [localDates, setLocalDates] = useState<any[]>([]);
  const [localOptions, setLocalOptions] = useState<any[]>([]);
  const [localItinerary, setLocalItinerary] = useState<any[]>([]);
  const [localPriceTiers, setLocalPriceTiers] = useState<any[]>([]);

  const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiRequest(
        isEdit ? "PUT" : "POST",
        isEdit ? `/api/tours/${tour.id}` : "/api/tours",
        form
      );
      const saved = await res.json();
      const tourId = saved.id;
      if (!isEdit && (localDates.length || localOptions.length || localItinerary.length || localPriceTiers.length)) {
        await Promise.all([
          ...localDates.map(d => apiRequest("POST", `/api/tours/${tourId}/dates`, { ...d, tourId })),
          ...localOptions.map(o => apiRequest("POST", `/api/tours/${tourId}/options`, { ...o, tourId })),
          ...localPriceTiers.map(pt => apiRequest("POST", `/api/tours/${tourId}/price-tiers`, { ...pt, tourId })),
        ]);
        for (const day of localItinerary) {
          const dayRes = await apiRequest("POST", `/api/tours/${tourId}/itinerary`, { ...day, tourId });
          const savedDay = await dayRes.json();
          if (day.stops && day.stops.length > 0) {
            await Promise.all(day.stops.map((s: any) => apiRequest("POST", `/api/itinerary/${savedDay.id}/stops`, { titleRu: s.titleRu, titleEn: s.titleEn, descriptionRu: s.descriptionRu || "", descriptionEn: s.descriptionEn || "", durationMinutes: s.durationMinutes, stopOrder: s.stopOrder })));
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      toast({ title: t("Сохранено", "Saved") });
      onSaved();
    } catch (err: any) {
      toast({ title: t("Ошибка", "Error"), description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveBtn = (
    <div className="flex gap-3 pt-2 border-t mt-4">
      <Button type="submit" form="tour-form" disabled={saving}>
        {saving ? t("Сохранение...", "Saving...") : t("Сохранить тур", "Save Tour")}
      </Button>
      <Button type="button" variant="outline" onClick={onClose}>{t("Отмена", "Cancel")}</Button>
    </div>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("Редактировать тур", "Edit Tour") : t("Новый тур", "New Tour")}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info">
          <TabsList className="w-full mb-2">
            <TabsTrigger value="info" className="flex-1">{t("Основное", "Info")}</TabsTrigger>
            <TabsTrigger value="dates" className="flex-1 gap-1"><CalendarDays className="h-3.5 w-3.5" />{t("Даты", "Dates")}</TabsTrigger>
            <TabsTrigger value="options" className="flex-1 gap-1"><ListChecks className="h-3.5 w-3.5" />{t("Опции", "Options")}</TabsTrigger>
            <TabsTrigger value="itinerary" className="flex-1 gap-1"><Route className="h-3.5 w-3.5" />{t("Программа", "Itinerary")}</TabsTrigger>
            <TabsTrigger value="pricing" className="flex-1 gap-1"><DollarSign className="h-3.5 w-3.5" />{t("Цены", "Pricing")}</TabsTrigger>
          </TabsList>

          <form id="tour-form" onSubmit={handleSubmit}>
            <TabsContent value="info">
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>{t("Название (RU)", "Title (RU)")}</Label><Input value={form.titleRu} onChange={e => set("titleRu", e.target.value)} required className="mt-1" /></div>
                  <div><Label>{t("Название (EN)", "Title (EN)")}</Label><Input value={form.titleEn} onChange={e => set("titleEn", e.target.value)} required className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>{t("Описание (RU)", "Description (RU)")}</Label><Textarea value={form.descriptionRu} onChange={e => set("descriptionRu", e.target.value)} className="mt-1 min-h-[80px]" required /></div>
                  <div><Label>{t("Описание (EN)", "Description (EN)")}</Label><Textarea value={form.descriptionEn} onChange={e => set("descriptionEn", e.target.value)} className="mt-1 min-h-[80px]" required /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>{t("Страна", "Country")}</Label>
                    <Select value={form.countryId} onValueChange={v => set("countryId", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder={t("Выберите", "Select")} /></SelectTrigger>
                      <SelectContent>{countries.map((c: any) => <SelectItem key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t("Город", "City")}</Label>
                    <Select value={form.cityId} onValueChange={v => set("cityId", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder={t("Выберите", "Select")} /></SelectTrigger>
                      <SelectContent>{cities.filter((c: any) => !form.countryId || c.countryId === form.countryId).map((c: any) => <SelectItem key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t("Категория", "Category")}</Label>
                    <Select value={form.categoryId} onValueChange={v => set("categoryId", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder={t("Выберите", "Select")} /></SelectTrigger>
                      <SelectContent>{categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>{t("Длительность (дней)", "Duration (days)")}</Label><Input type="number" value={form.duration} onChange={e => set("duration", Number(e.target.value))} className="mt-1" min={1} /></div>
                  <div><Label>{t("Цена ($)", "Price ($)")}</Label><Input type="number" value={form.basePrice} onChange={e => set("basePrice", e.target.value)} className="mt-1" min={0} /></div>
                  <div><Label>{t("Скидка (%)", "Discount (%)")}</Label><Input type="number" value={form.discountPercent} onChange={e => set("discountPercent", Number(e.target.value))} className="mt-1" min={0} max={100} /></div>
                </div>
                <div><Label>{t("Главное фото", "Main Image")}</Label><div className="mt-1"><ImageUpload value={form.mainImage} onChange={v => set("mainImage", v)} /></div></div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>{t("Галерея фото", "Photo Gallery")}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={() => set("images", [...form.images, ""])}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t("Добавить фото", "Add Photo")}
                    </Button>
                  </div>
                  {form.images.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2">{t("Нет дополнительных фото", "No additional photos")}</p>
                  )}
                  <div className="space-y-2">
                    {form.images.map((img: string, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <div className="flex-1">
                          <ImageUpload
                            value={img}
                            onChange={v => {
                              const updated = [...form.images];
                              updated[idx] = v;
                              set("images", updated);
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => set("images", form.images.filter((_: string, i: number) => i !== idx))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div><Label>{t("Ссылка на карту (iframe URL)", "Map URL (iframe)")}</Label><Input value={form.mapUrl} onChange={e => set("mapUrl", e.target.value)} className="mt-1" placeholder="https://www.google.com/maps/embed?..." /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>{t("Включено (RU)", "Included (RU)")}</Label><Textarea value={form.includedRu} onChange={e => set("includedRu", e.target.value)} className="mt-1" placeholder={t("Каждый пункт на новой строке", "One item per line")} /></div>
                  <div><Label>{t("Включено (EN)", "Included (EN)")}</Label><Textarea value={form.includedEn} onChange={e => set("includedEn", e.target.value)} className="mt-1" placeholder="One item per line" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>{t("Не включено (RU)", "Not Included (RU)")}</Label><Textarea value={form.notIncludedRu} onChange={e => set("notIncludedRu", e.target.value)} className="mt-1" placeholder={t("Каждый пункт на новой строке", "One item per line")} /></div>
                  <div><Label>{t("Не включено (EN)", "Not Included (EN)")}</Label><Textarea value={form.notIncludedEn} onChange={e => set("notIncludedEn", e.target.value)} className="mt-1" placeholder="One item per line" /></div>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2"><Switch checked={form.isHot} onCheckedChange={v => set("isHot", v)} id="isHot" /><Label htmlFor="isHot">{t("Горящий", "Hot Deal")}</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={form.isFeatured} onCheckedChange={v => set("isFeatured", v)} id="isFeatured" /><Label htmlFor="isFeatured">{t("Рекомендуемый", "Featured")}</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={v => set("isActive", v)} id="isActive" /><Label htmlFor="isActive">{t("Активный", "Active")}</Label></div>
                </div>
              </div>
              {saveBtn}
            </TabsContent>

            <TabsContent value="dates" className="pt-2">
              <div className="border rounded-xl p-4 space-y-3 bg-muted/30 mb-4">
                <p className="text-sm font-semibold">{t("Текст вместо дат (необязательно)", "Text instead of dates (optional)")}</p>
                <p className="text-xs text-muted-foreground">{t("Если заполнено, отображается вместо списка дат", "If filled, shows instead of the dates list")}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">{t("Текст (RU)", "Text (RU)")}</Label><Input value={form.customDatesTextRu} onChange={e => set("customDatesTextRu", e.target.value)} className="mt-1 h-9 text-sm" placeholder={t("Например: Даты уточняйте", "E.g.: Dates upon request")} /></div>
                  <div><Label className="text-xs">{t("Текст (EN)", "Text (EN)")}</Label><Input value={form.customDatesTextEn} onChange={e => set("customDatesTextEn", e.target.value)} className="mt-1 h-9 text-sm" placeholder="E.g.: Dates upon request" /></div>
                </div>
              </div>
              {isEdit
                ? <DatesManager tourId={tour.id} />
                : <LocalDatesManager dates={localDates} setDates={setLocalDates} />}
              {saveBtn}
            </TabsContent>

            <TabsContent value="options" className="pt-2">
              {isEdit
                ? <OptionsManager tourId={tour.id} />
                : <LocalOptionsManager options={localOptions} setOptions={setLocalOptions} />}
              {saveBtn}
            </TabsContent>

            <TabsContent value="itinerary" className="pt-2">
              {isEdit
                ? <ItineraryManager tourId={tour.id} />
                : <LocalItineraryManager items={localItinerary} setItems={setLocalItinerary} />}
              {saveBtn}
            </TabsContent>

            <TabsContent value="pricing" className="pt-2">
              {isEdit
                ? <PriceTiersManager tourId={tour.id} />
                : <LocalPriceTiersManager tiers={localPriceTiers} setTiers={setLocalPriceTiers} />}
              {saveBtn}
            </TabsContent>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function LocalDatesManager({ dates, setDates }: { dates: any[]; setDates: (d: any[]) => void }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ startDate: "", endDate: "", maxPeople: 20 });
  const add = () => {
    if (!form.startDate || !form.endDate) return;
    setDates([...dates, { ...form, id: "local-" + Date.now() + "-" + Math.random().toString(36).slice(2) }]);
    setForm({ startDate: "", endDate: "", maxPeople: 20 });
  };
  return (
    <div className="space-y-4">
      <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
        <p className="text-sm font-semibold">{t("Новая дата", "New Date")}</p>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs">{t("Начало", "Start")}</Label><Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          <div><Label className="text-xs">{t("Конец", "End")}</Label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          <div><Label className="text-xs">{t("Макс. мест", "Max spots")}</Label><Input type="number" value={form.maxPeople} onChange={e => setForm(p => ({ ...p, maxPeople: Number(e.target.value) }))} className="mt-1 h-9 text-sm" min={1} /></div>
        </div>
        <Button type="button" size="sm" onClick={add}>{t("Добавить", "Add")}</Button>
      </div>
      {dates.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">{t("Нет дат", "No dates yet")}</p> : (
        <div className="space-y-2">
          {dates.map((d: any) => (
            <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg">
              <p className="text-sm font-medium">{d.startDate} — {d.endDate} · {t("Мест:", "Spots:")} {d.maxPeople}</p>
              <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => setDates(dates.filter((x: any) => x.id !== d.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function LocalOptionsManager({ options, setOptions }: { options: any[]; setOptions: (o: any[]) => void }) {
  const { t, lang } = useI18n();
  const [form, setForm] = useState({ nameRu: "", nameEn: "", price: 0 });
  const add = () => {
    if (!form.nameRu) return;
    setOptions([...options, { ...form, id: "local-" + Date.now() + "-" + Math.random().toString(36).slice(2) }]);
    setForm({ nameRu: "", nameEn: "", price: 0 });
  };
  return (
    <div className="space-y-4">
      <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
        <p className="text-sm font-semibold">{t("Новая опция", "New Option")}</p>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs">{t("Название (RU)", "Name (RU)")}</Label><Input value={form.nameRu} onChange={e => setForm(p => ({ ...p, nameRu: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          <div><Label className="text-xs">{t("Название (EN)", "Name (EN)")}</Label><Input value={form.nameEn} onChange={e => setForm(p => ({ ...p, nameEn: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          <div><Label className="text-xs">{t("Цена ($)", "Price ($)")}</Label><Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} className="mt-1 h-9 text-sm" min={0} /></div>
        </div>
        <Button type="button" size="sm" onClick={add}>{t("Добавить", "Add")}</Button>
      </div>
      {options.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">{t("Нет опций", "No options yet")}</p> : (
        <div className="space-y-2">
          {options.map((o: any) => (
            <div key={o.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div><p className="text-sm font-medium">{lang === "ru" ? o.nameRu : o.nameEn}</p><p className="text-xs text-muted-foreground">+${o.price}</p></div>
              <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => setOptions(options.filter((x: any) => x.id !== o.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LocalItineraryManager({ items, setItems }: { items: any[]; setItems: (i: any[]) => void }) {
  const { t, lang } = useI18n();
  const [form, setForm] = useState({ dayNumber: 1, titleRu: "", titleEn: "", descriptionRu: "", descriptionEn: "", durationHours: "" as any });
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [stopForm, setStopForm] = useState({ titleRu: "", titleEn: "", descriptionRu: "", descriptionEn: "", durationMinutes: "" as any });

  const addDay = () => {
    if (!form.titleRu) return;
    setItems([...items, { ...form, durationHours: form.durationHours ? Number(form.durationHours) : null, stops: [], id: "local-" + Date.now() + "-" + Math.random().toString(36).slice(2) }]);
    setForm({ dayNumber: items.length + 2, titleRu: "", titleEn: "", descriptionRu: "", descriptionEn: "", durationHours: "" });
  };

  const addStop = (dayId: string) => {
    if (!stopForm.titleRu) return;
    const day = items.find((d: any) => d.id === dayId);
    if (!day) return;
    const stops = day.stops || [];
    const newStop = { ...stopForm, durationMinutes: stopForm.durationMinutes ? Number(stopForm.durationMinutes) : null, stopOrder: stops.length + 1, id: "local-stop-" + Date.now() + "-" + Math.random().toString(36).slice(2) };
    setItems(items.map((d: any) => d.id === dayId ? { ...d, stops: [...stops, newStop] } : d));
    setStopForm({ titleRu: "", titleEn: "", descriptionRu: "", descriptionEn: "", durationMinutes: "" });
  };

  const removeStop = (dayId: string, stopId: string) => {
    setItems(items.map((d: any) => d.id === dayId ? { ...d, stops: (d.stops || []).filter((s: any) => s.id !== stopId) } : d));
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
        <p className="text-sm font-semibold">{t("Добавить день", "Add Day")}</p>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">{t("День №", "Day #")}</Label><Input type="number" value={form.dayNumber} onChange={e => setForm(p => ({ ...p, dayNumber: Number(e.target.value) }))} className="mt-1 h-9 text-sm" min={1} /></div>
          <div><Label className="text-xs">{t("Часов", "Hours")}</Label><Input type="number" value={form.durationHours} onChange={e => setForm(p => ({ ...p, durationHours: e.target.value }))} className="mt-1 h-9 text-sm" min={1} placeholder="—" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">{t("Заголовок (RU)", "Title (RU)")}</Label><Input value={form.titleRu} onChange={e => setForm(p => ({ ...p, titleRu: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          <div><Label className="text-xs">{t("Заголовок (EN)", "Title (EN)")}</Label><Input value={form.titleEn} onChange={e => setForm(p => ({ ...p, titleEn: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">{t("Описание (RU)", "Desc (RU)")}</Label><Textarea value={form.descriptionRu} onChange={e => setForm(p => ({ ...p, descriptionRu: e.target.value }))} className="mt-1 text-sm min-h-[60px]" /></div>
          <div><Label className="text-xs">{t("Описание (EN)", "Desc (EN)")}</Label><Textarea value={form.descriptionEn} onChange={e => setForm(p => ({ ...p, descriptionEn: e.target.value }))} className="mt-1 text-sm min-h-[60px]" /></div>
        </div>
        <Button type="button" size="sm" onClick={addDay}>{t("Добавить", "Add")}</Button>
      </div>
      {items.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">{t("Программа не добавлена", "No itinerary yet")}</p> : (
        <div className="space-y-2">
          {items.map((item: any) => (
            <div key={item.id} className="border rounded-lg overflow-hidden">
              <div className="flex items-start justify-between p-3 gap-3 cursor-pointer" onClick={() => setExpandedDay(expandedDay === item.id ? null : item.id)}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {expandedDay === item.id ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{t("День", "Day")} {item.dayNumber}: {lang === "ru" ? item.titleRu : item.titleEn}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{(item.stops || []).length} {t("остановок", "stops")}</p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={(e) => { e.stopPropagation(); setItems(items.filter((x: any) => x.id !== item.id)); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
              {expandedDay === item.id && (
                <div className="border-t px-3 pb-3 pt-2 space-y-3 bg-muted/20">
                  {(item.stops || []).map((stop: any, idx: number) => (
                    <div key={stop.id} className="flex items-start gap-2 p-2 border rounded bg-background">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{idx + 1}. {lang === "ru" ? stop.titleRu : stop.titleEn}</p>
                        {stop.durationMinutes && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{stop.durationMinutes} {t("мин.", "min.")}</p>}
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeStop(item.id, stop.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  ))}
                  <div className="border rounded p-3 space-y-2 bg-muted/30">
                    <p className="text-xs font-semibold">{t("Добавить остановку", "Add Stop")}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder={t("Название (RU)", "Title (RU)")} value={stopForm.titleRu} onChange={e => setStopForm(p => ({ ...p, titleRu: e.target.value }))} className="h-8 text-xs" />
                      <Input placeholder={t("Название (EN)", "Title (EN)")} value={stopForm.titleEn} onChange={e => setStopForm(p => ({ ...p, titleEn: e.target.value }))} className="h-8 text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder={t("Описание (RU)", "Desc (RU)")} value={stopForm.descriptionRu} onChange={e => setStopForm(p => ({ ...p, descriptionRu: e.target.value }))} className="h-8 text-xs" />
                      <Input placeholder={t("Описание (EN)", "Desc (EN)")} value={stopForm.descriptionEn} onChange={e => setStopForm(p => ({ ...p, descriptionEn: e.target.value }))} className="h-8 text-xs" />
                    </div>
                    <div className="flex gap-2 items-end">
                      <Input type="number" placeholder={t("Минут", "Minutes")} value={stopForm.durationMinutes} onChange={e => setStopForm(p => ({ ...p, durationMinutes: e.target.value }))} className="h-8 text-xs w-24" min={1} />
                      <Button type="button" size="sm" className="h-8 text-xs" onClick={() => addStop(item.id)}>{t("Добавить", "Add")}</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function DatesManager({ tourId }: { tourId: string }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: dates = [], isLoading } = useQuery<any[]>({ queryKey: [`/api/tours/${tourId}/dates`] });
  const [form, setForm] = useState({ startDate: "", endDate: "", maxPeople: 20 });
  const [editing, setEditing] = useState<any>(null);

  const addMutation = useMutation({
    mutationFn: (d: any) => apiRequest("POST", `/api/tours/${tourId}/dates`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/tours/${tourId}/dates`] }); setForm({ startDate: "", endDate: "", maxPeople: 20 }); toast({ title: t("Дата добавлена", "Date added") }); },
    onError: (err: any) => toast({ title: t("Ошибка", "Error"), description: err.message || t("Не удалось добавить дату", "Failed to add date"), variant: "destructive" }),
  });
  const editMutation = useMutation({
    mutationFn: (d: any) => apiRequest("PUT", `/api/tour-dates/${d.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/tours/${tourId}/dates`] }); setEditing(null); toast({ title: t("Сохранено", "Saved") }); },
    onError: (err: any) => toast({ title: t("Ошибка", "Error"), description: err.message || t("Не удалось сохранить дату", "Failed to save date"), variant: "destructive" }),
  });
  const delMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tour-dates/${id}`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: [`/api/tours/${tourId}/dates`] }),
    onError: (err: any) => toast({ title: t("Ошибка", "Error"), description: err.message, variant: "destructive" }),
  });

  const activeForm = editing || form;
  const setF = (k: string, v: any) => editing ? setEditing((p: any) => ({ ...p, [k]: v })) : setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
        <p className="text-sm font-semibold">{editing ? t("Редактировать дату", "Edit Date") : t("Новая дата", "New Date")}</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">{t("Начало", "Start")}</Label>
            <Input type="date" value={editing ? (editing.startDate ? editing.startDate.slice(0,10) : "") : form.startDate} onChange={e => setF("startDate", e.target.value)} className="mt-1 h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{t("Конец", "End")}</Label>
            <Input type="date" value={editing ? (editing.endDate ? editing.endDate.slice(0,10) : "") : form.endDate} onChange={e => setF("endDate", e.target.value)} className="mt-1 h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{t("Макс. мест", "Max spots")}</Label>
            <Input type="number" value={activeForm.maxPeople} onChange={e => setF("maxPeople", Number(e.target.value))} className="mt-1 h-9 text-sm" min={1} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            disabled={addMutation.isPending || editMutation.isPending}
            onClick={() => {
              if (editing) {
                if (!editing.startDate || !editing.endDate) {
                  toast({ title: t("Ошибка", "Error"), description: t("Заполните даты начала и конца", "Please fill in start and end dates"), variant: "destructive" });
                  return;
                }
                editMutation.mutate(editing);
              } else {
                if (!form.startDate || !form.endDate) {
                  toast({ title: t("Ошибка", "Error"), description: t("Заполните даты начала и конца", "Please fill in start and end dates"), variant: "destructive" });
                  return;
                }
                addMutation.mutate({ startDate: form.startDate, endDate: form.endDate, maxPeople: form.maxPeople, tourId });
              }
            }}
          >
            {(addMutation.isPending || editMutation.isPending) ? t("Сохранение...", "Saving...") : editing ? t("Сохранить", "Save") : t("Добавить", "Add")}
          </Button>
          {editing && <Button type="button" size="sm" variant="outline" onClick={() => setEditing(null)}>{t("Отмена", "Cancel")}</Button>}
        </div>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">{t("Загрузка...", "Loading...")}</p> : dates.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">{t("Нет дат", "No dates yet")}</p>
      ) : (
        <div className="space-y-2">
          {dates.map((d: any) => (
            <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">{format(new Date(d.startDate), "dd.MM.yyyy")} — {format(new Date(d.endDate), "dd.MM.yyyy")}</p>
                <p className="text-xs text-muted-foreground">{t("Мест:", "Spots:")} {d.maxPeople - d.bookedCount} / {d.maxPeople}</p>
              </div>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => setEditing(d)}><Edit className="h-3.5 w-3.5" /></Button>
                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => delMutation.mutate(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function OptionsManager({ tourId }: { tourId: string }) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: options = [], isLoading } = useQuery<any[]>({ queryKey: [`/api/tours/${tourId}/options`] });
  const [form, setForm] = useState({ nameRu: "", nameEn: "", price: 0 });
  const [editing, setEditing] = useState<any>(null);

  const addMutation = useMutation({
    mutationFn: (d: any) => apiRequest("POST", `/api/tours/${tourId}/options`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/tours/${tourId}/options`] }); setForm({ nameRu: "", nameEn: "", price: 0 }); toast({ title: t("Опция добавлена", "Option added") }); },
  });
  const editMutation = useMutation({
    mutationFn: (d: any) => apiRequest("PUT", `/api/tour-options/${d.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/tours/${tourId}/options`] }); setEditing(null); },
  });
  const delMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tour-options/${id}`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: [`/api/tours/${tourId}/options`] }),
  });

  const activeForm = editing || form;
  const setF = (k: string, v: any) => editing ? setEditing((p: any) => ({ ...p, [k]: v })) : setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
        <p className="text-sm font-semibold">{editing ? t("Редактировать опцию", "Edit Option") : t("Новая опция", "New Option")}</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">{t("Название (RU)", "Name (RU)")}</Label>
            <Input value={activeForm.nameRu} onChange={e => setF("nameRu", e.target.value)} className="mt-1 h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{t("Название (EN)", "Name (EN)")}</Label>
            <Input value={activeForm.nameEn} onChange={e => setF("nameEn", e.target.value)} className="mt-1 h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{t("Цена ($)", "Price ($)")}</Label>
            <Input type="number" value={activeForm.price} onChange={e => setF("price", Number(e.target.value))} className="mt-1 h-9 text-sm" min={0} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={() => editing ? editMutation.mutate(editing) : addMutation.mutate({ ...form, tourId })}>
            {editing ? t("Сохранить", "Save") : t("Добавить", "Add")}
          </Button>
          {editing && <Button type="button" size="sm" variant="outline" onClick={() => setEditing(null)}>{t("Отмена", "Cancel")}</Button>}
        </div>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">{t("Загрузка...", "Loading...")}</p> : options.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">{t("Нет опций", "No options yet")}</p>
      ) : (
        <div className="space-y-2">
          {options.map((o: any) => (
            <div key={o.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">{lang === "ru" ? o.nameRu : o.nameEn}</p>
                <p className="text-xs text-muted-foreground">+${Number(o.price).toFixed(0)}</p>
              </div>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => setEditing(o)}><Edit className="h-3.5 w-3.5" /></Button>
                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => delMutation.mutate(o.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ItineraryManager({ tourId }: { tourId: string }) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery<any[]>({ queryKey: [`/api/tours/${tourId}/itinerary`] });
  const [form, setForm] = useState({ dayNumber: 1, titleRu: "", titleEn: "", descriptionRu: "", descriptionEn: "", durationHours: null as number | null });
  const [editing, setEditing] = useState<any>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [stopForm, setStopForm] = useState({ titleRu: "", titleEn: "", descriptionRu: "", descriptionEn: "", durationMinutes: "" as any });

  const addMutation = useMutation({
    mutationFn: (d: any) => apiRequest("POST", `/api/tours/${tourId}/itinerary`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/tours/${tourId}/itinerary`] }); setForm({ dayNumber: (items.length + 2), titleRu: "", titleEn: "", descriptionRu: "", descriptionEn: "", durationHours: null }); toast({ title: t("День добавлен", "Day added") }); },
  });
  const editMutation = useMutation({
    mutationFn: (d: any) => apiRequest("PUT", `/api/itinerary/${d.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/tours/${tourId}/itinerary`] }); setEditing(null); },
  });
  const delMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/itinerary/${id}`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: [`/api/tours/${tourId}/itinerary`] }),
  });
  const addStopMutation = useMutation({
    mutationFn: (d: any) => apiRequest("POST", `/api/itinerary/${d.dayId}/stops`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/tours/${tourId}/itinerary`] }); setStopForm({ titleRu: "", titleEn: "", descriptionRu: "", descriptionEn: "", durationMinutes: "" }); toast({ title: t("Остановка добавлена", "Stop added") }); },
  });
  const delStopMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/itinerary-stops/${id}`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: [`/api/tours/${tourId}/itinerary`] }),
  });

  const activeForm = editing || form;
  const setF = (k: string, v: any) => editing ? setEditing((p: any) => ({ ...p, [k]: v })) : setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
        <p className="text-sm font-semibold">{editing ? t("Редактировать день", "Edit Day") : t("Добавить день", "Add Day")}</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">{t("День №", "Day #")}</Label>
            <Input type="number" value={activeForm.dayNumber} onChange={e => setF("dayNumber", Number(e.target.value))} className="mt-1 h-9 text-sm" min={1} />
          </div>
          <div>
            <Label className="text-xs">{t("Часов", "Hours")}</Label>
            <Input type="number" value={activeForm.durationHours ?? ""} onChange={e => setF("durationHours", e.target.value ? Number(e.target.value) : null)} className="mt-1 h-9 text-sm" min={1} placeholder="—" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">{t("Заголовок (RU)", "Title (RU)")}</Label>
            <Input value={activeForm.titleRu} onChange={e => setF("titleRu", e.target.value)} className="mt-1 h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{t("Заголовок (EN)", "Title (EN)")}</Label>
            <Input value={activeForm.titleEn} onChange={e => setF("titleEn", e.target.value)} className="mt-1 h-9 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">{t("Описание (RU)", "Description (RU)")}</Label>
            <Textarea value={activeForm.descriptionRu} onChange={e => setF("descriptionRu", e.target.value)} className="mt-1 text-sm min-h-[60px]" />
          </div>
          <div>
            <Label className="text-xs">{t("Описание (EN)", "Description (EN)")}</Label>
            <Textarea value={activeForm.descriptionEn} onChange={e => setF("descriptionEn", e.target.value)} className="mt-1 text-sm min-h-[60px]" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={() => editing ? editMutation.mutate(editing) : addMutation.mutate({ ...form, tourId })}>
            {editing ? t("Сохранить", "Save") : t("Добавить", "Add")}
          </Button>
          {editing && <Button type="button" size="sm" variant="outline" onClick={() => setEditing(null)}>{t("Отмена", "Cancel")}</Button>}
        </div>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">{t("Загрузка...", "Loading...")}</p> : items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">{t("Программа не добавлена", "No itinerary yet")}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item: any) => (
            <div key={item.id} className="border rounded-lg overflow-hidden">
              <div className="flex items-start justify-between p-3 gap-3 cursor-pointer" onClick={() => setExpandedDay(expandedDay === item.id ? null : item.id)}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {expandedDay === item.id ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{t("День", "Day")} {item.dayNumber}: {lang === "ru" ? item.titleRu : item.titleEn}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(item.stops || []).length} {t("остановок", "stops")}
                      {item.durationHours ? ` · ${item.durationHours} ${t("ч.", "hrs.")}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button type="button" variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditing(item); }}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={(e) => { e.stopPropagation(); delMutation.mutate(item.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              {expandedDay === item.id && (
                <div className="border-t px-3 pb-3 pt-2 space-y-3 bg-muted/20">
                  {(item.stops || []).map((stop: any, idx: number) => (
                    <div key={stop.id} className="flex items-start gap-2 p-2 border rounded bg-background">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{idx + 1}. {lang === "ru" ? stop.titleRu : stop.titleEn}</p>
                        {(lang === "ru" ? stop.descriptionRu : stop.descriptionEn) && <p className="text-xs text-muted-foreground mt-0.5">{lang === "ru" ? stop.descriptionRu : stop.descriptionEn}</p>}
                        {stop.durationMinutes && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" />{stop.durationMinutes} {t("мин.", "min.")}</p>}
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => delStopMutation.mutate(stop.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  ))}
                  <div className="border rounded p-3 space-y-2 bg-muted/30">
                    <p className="text-xs font-semibold">{t("Добавить остановку", "Add Stop")}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder={t("Название (RU)", "Title (RU)")} value={stopForm.titleRu} onChange={e => setStopForm(p => ({ ...p, titleRu: e.target.value }))} className="h-8 text-xs" />
                      <Input placeholder={t("Название (EN)", "Title (EN)")} value={stopForm.titleEn} onChange={e => setStopForm(p => ({ ...p, titleEn: e.target.value }))} className="h-8 text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder={t("Описание (RU)", "Desc (RU)")} value={stopForm.descriptionRu} onChange={e => setStopForm(p => ({ ...p, descriptionRu: e.target.value }))} className="h-8 text-xs" />
                      <Input placeholder={t("Описание (EN)", "Desc (EN)")} value={stopForm.descriptionEn} onChange={e => setStopForm(p => ({ ...p, descriptionEn: e.target.value }))} className="h-8 text-xs" />
                    </div>
                    <div className="flex gap-2 items-end">
                      <Input type="number" placeholder={t("Минут", "Minutes")} value={stopForm.durationMinutes} onChange={e => setStopForm(p => ({ ...p, durationMinutes: e.target.value }))} className="h-8 text-xs w-24" min={1} />
                      <Button type="button" size="sm" className="h-8 text-xs" disabled={addStopMutation.isPending} onClick={() => addStopMutation.mutate({ dayId: item.id, titleRu: stopForm.titleRu, titleEn: stopForm.titleEn, descriptionRu: stopForm.descriptionRu, descriptionEn: stopForm.descriptionEn, durationMinutes: stopForm.durationMinutes ? Number(stopForm.durationMinutes) : null, stopOrder: (item.stops || []).length + 1 })}>
                        {addStopMutation.isPending ? "..." : t("Добавить", "Add")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LocalPriceTiersManager({ tiers, setTiers }: { tiers: any[]; setTiers: (t: any[]) => void }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ minPeople: "", maxPeople: "", pricePerPerson: "", labelRu: "", labelEn: "" });
  const add = () => {
    if (!form.minPeople || !form.maxPeople || !form.pricePerPerson) return;
    setTiers([...tiers, { ...form, minPeople: Number(form.minPeople), maxPeople: Number(form.maxPeople), id: "local-" + Date.now() + "-" + Math.random().toString(36).slice(2) }]);
    setForm({ minPeople: "", maxPeople: "", pricePerPerson: "", labelRu: "", labelEn: "" });
  };
  return (
    <div className="space-y-4">
      <div className="border rounded-xl p-4 bg-muted/30 space-y-3">
        <p className="text-sm font-semibold">{t("Ценообразование по количеству людей", "Group size pricing")}</p>
        <p className="text-xs text-muted-foreground">{t("Задайте цену за человека для разного количества участников. Если уровни заданы, они заменят базовую цену.", "Set per-person price for different group sizes. If tiers are set, they replace the base price.")}</p>
        <div className="grid grid-cols-5 gap-2">
          <div><Label className="text-xs">{t("Мин. чел.", "Min ppl")}</Label><Input type="number" min={1} value={form.minPeople} onChange={e => setForm(p => ({ ...p, minPeople: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          <div><Label className="text-xs">{t("Макс. чел.", "Max ppl")}</Label><Input type="number" min={1} value={form.maxPeople} onChange={e => setForm(p => ({ ...p, maxPeople: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          <div><Label className="text-xs">{t("Цена ($)", "Price ($)")}</Label><Input type="number" min={0} step="0.01" value={form.pricePerPerson} onChange={e => setForm(p => ({ ...p, pricePerPerson: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          <div><Label className="text-xs">{t("Метка (RU)", "Label (RU)")}</Label><Input value={form.labelRu} onChange={e => setForm(p => ({ ...p, labelRu: e.target.value }))} className="mt-1 h-9 text-sm" placeholder={t("Малая группа", "Small group")} /></div>
          <div><Label className="text-xs">{t("Метка (EN)", "Label (EN)")}</Label><Input value={form.labelEn} onChange={e => setForm(p => ({ ...p, labelEn: e.target.value }))} className="mt-1 h-9 text-sm" placeholder="Small group" /></div>
        </div>
        <Button type="button" size="sm" disabled={!form.minPeople || !form.maxPeople || !form.pricePerPerson} onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" />{t("Добавить уровень", "Add Tier")}
        </Button>
      </div>
      {tiers.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">{t("Нет ценовых уровней", "No price tiers yet")}</p> : (
        <div className="space-y-2">
          <p className="text-sm font-semibold">{t("Ценовые уровни", "Price Tiers")}</p>
          {tiers.map((tier: any) => (
            <div key={tier.id} className="flex items-center justify-between border rounded-lg px-4 py-3 bg-card">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-xs">{tier.minPeople}–{tier.maxPeople} {t("чел.", "ppl")}</Badge>
                <span className="text-sm font-bold text-primary">${Number(tier.pricePerPerson).toFixed(0)}</span>
                <span className="text-xs text-muted-foreground">{t("за человека", "per person")}</span>
                {(tier.labelRu || tier.labelEn) && (
                  <span className="text-xs text-muted-foreground italic">({tier.labelRu || tier.labelEn})</span>
                )}
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setTiers(tiers.filter((x: any) => x.id !== tier.id))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PriceTiersManager({ tourId }: { tourId: string }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ minPeople: "", maxPeople: "", pricePerPerson: "", labelRu: "", labelEn: "" });

  const { data: tiers = [] } = useQuery<any[]>({ queryKey: ["/api/tours", tourId, "price-tiers"], queryFn: () => fetch(`/api/tours/${tourId}/price-tiers`).then(r => r.json()) });

  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/tours/${tourId}/price-tiers`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours", tourId, "price-tiers"] });
      setForm({ minPeople: "", maxPeople: "", pricePerPerson: "", labelRu: "", labelEn: "" });
      toast({ title: t("Уровень цены добавлен", "Price tier added") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tour-price-tiers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours", tourId, "price-tiers"] });
      toast({ title: t("Удалено", "Deleted") });
    },
  });

  return (
    <div className="space-y-4">
      <div className="border rounded-xl p-4 bg-muted/30 space-y-3">
        <p className="text-sm font-semibold">{t("Ценообразование по количеству людей", "Group size pricing")}</p>
        <p className="text-xs text-muted-foreground">{t("Задайте цену за человека для разного количества участников. Если уровни заданы, они заменят базовую цену.", "Set per-person price for different group sizes. If tiers are set, they replace the base price.")}</p>
        <div className="grid grid-cols-5 gap-2">
          <div><Label className="text-xs">{t("Мин. чел.", "Min ppl")}</Label><Input type="number" min={1} value={form.minPeople} onChange={e => setForm(p => ({ ...p, minPeople: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          <div><Label className="text-xs">{t("Макс. чел.", "Max ppl")}</Label><Input type="number" min={1} value={form.maxPeople} onChange={e => setForm(p => ({ ...p, maxPeople: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          <div><Label className="text-xs">{t("Цена ($)", "Price ($)")}</Label><Input type="number" min={0} step="0.01" value={form.pricePerPerson} onChange={e => setForm(p => ({ ...p, pricePerPerson: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          <div><Label className="text-xs">{t("Метка (RU)", "Label (RU)")}</Label><Input value={form.labelRu} onChange={e => setForm(p => ({ ...p, labelRu: e.target.value }))} className="mt-1 h-9 text-sm" placeholder={t("Малая группа", "Small group")} /></div>
          <div><Label className="text-xs">{t("Метка (EN)", "Label (EN)")}</Label><Input value={form.labelEn} onChange={e => setForm(p => ({ ...p, labelEn: e.target.value }))} className="mt-1 h-9 text-sm" placeholder="Small group" /></div>
        </div>
        <Button type="button" size="sm" disabled={!form.minPeople || !form.maxPeople || !form.pricePerPerson || addMutation.isPending} onClick={() => addMutation.mutate({ minPeople: Number(form.minPeople), maxPeople: Number(form.maxPeople), pricePerPerson: form.pricePerPerson, labelRu: form.labelRu || null, labelEn: form.labelEn || null })}>
          <Plus className="h-3.5 w-3.5 mr-1" />{t("Добавить уровень", "Add Tier")}
        </Button>
      </div>

      {tiers.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">{t("Ценовые уровни", "Price Tiers")}</p>
          {tiers.map((tier: any) => (
            <div key={tier.id} className="flex items-center justify-between border rounded-lg px-4 py-3 bg-card">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-xs">{tier.minPeople}–{tier.maxPeople} {t("чел.", "ppl")}</Badge>
                <span className="text-sm font-bold text-primary">${Number(tier.pricePerPerson).toFixed(0)}</span>
                <span className="text-xs text-muted-foreground">{t("за человека", "per person")}</span>
                {(tier.labelRu || tier.labelEn) && (
                  <span className="text-xs text-muted-foreground italic">({tier.labelRu || tier.labelEn})</span>
                )}
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(tier.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
