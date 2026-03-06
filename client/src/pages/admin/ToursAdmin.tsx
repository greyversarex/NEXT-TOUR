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
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Link } from "wouter";
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

  const saveMutation = useMutation({
    mutationFn: (data: any) => editTour?.id
      ? apiRequest("PUT", `/api/tours/${editTour.id}`, data)
      : apiRequest("POST", "/api/tours", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      toast({ title: t("Сохранено", "Saved") });
      setShowForm(false);
      setEditTour(null);
    },
  });

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
                <div className="flex items-center gap-2 shrink-0">
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
          onSave={saveMutation.mutate}
          onClose={() => { setShowForm(false); setEditTour(null); }}
          isSaving={saveMutation.isPending}
        />
      )}
    </AdminLayout>
  );
}

function TourForm({ tour, countries, categories, cities, onSave, onClose, isSaving }: any) {
  const { t, lang } = useI18n();
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
    isHot: tour.isHot || false,
    isFeatured: tour.isFeatured || false,
    isActive: tour.isActive !== false,
    includedRu: tour.includedRu || "",
    includedEn: tour.includedEn || "",
    notIncludedRu: tour.notIncludedRu || "",
    notIncludedEn: tour.notIncludedEn || "",
  });

  const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tour.id ? t("Редактировать тур", "Edit Tour") : t("Новый тур", "New Tour")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("Название (RU)", "Title (RU)")}</Label>
              <Input value={form.titleRu} onChange={e => set("titleRu", e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label>{t("Название (EN)", "Title (EN)")}</Label>
              <Input value={form.titleEn} onChange={e => set("titleEn", e.target.value)} required className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("Описание (RU)", "Description (RU)")}</Label>
              <Textarea value={form.descriptionRu} onChange={e => set("descriptionRu", e.target.value)} className="mt-1 min-h-[80px]" required />
            </div>
            <div>
              <Label>{t("Описание (EN)", "Description (EN)")}</Label>
              <Textarea value={form.descriptionEn} onChange={e => set("descriptionEn", e.target.value)} className="mt-1 min-h-[80px]" required />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>{t("Страна", "Country")}</Label>
              <Select value={form.countryId} onValueChange={v => set("countryId", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t("Выберите", "Select")} /></SelectTrigger>
                <SelectContent>
                  {countries.map((c: any) => <SelectItem key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("Город", "City")}</Label>
              <Select value={form.cityId} onValueChange={v => set("cityId", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t("Выберите", "Select")} /></SelectTrigger>
                <SelectContent>
                  {cities.filter((c: any) => !form.countryId || c.countryId === form.countryId).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("Категория", "Category")}</Label>
              <Select value={form.categoryId} onValueChange={v => set("categoryId", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t("Выберите", "Select")} /></SelectTrigger>
                <SelectContent>
                  {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>{t("Длительность (дней)", "Duration (days)")}</Label>
              <Input type="number" value={form.duration} onChange={e => set("duration", Number(e.target.value))} className="mt-1" min={1} />
            </div>
            <div>
              <Label>{t("Цена ($)", "Price ($)")}</Label>
              <Input type="number" value={form.basePrice} onChange={e => set("basePrice", e.target.value)} className="mt-1" min={0} />
            </div>
            <div>
              <Label>{t("Скидка (%)", "Discount (%)")}</Label>
              <Input type="number" value={form.discountPercent} onChange={e => set("discountPercent", Number(e.target.value))} className="mt-1" min={0} max={100} />
            </div>
          </div>

          <div>
            <Label>{t("Главное фото (URL)", "Main Image (URL)")}</Label>
            <Input value={form.mainImage} onChange={e => set("mainImage", e.target.value)} className="mt-1" placeholder="https://..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("Включено (RU)", "Included (RU)")}</Label>
              <Textarea value={form.includedRu} onChange={e => set("includedRu", e.target.value)} className="mt-1" placeholder={t("Каждый пункт на новой строке", "One item per line")} />
            </div>
            <div>
              <Label>{t("Не включено (RU)", "Not Included (RU)")}</Label>
              <Textarea value={form.notIncludedRu} onChange={e => set("notIncludedRu", e.target.value)} className="mt-1" placeholder={t("Каждый пункт на новой строке", "One item per line")} />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.isHot} onCheckedChange={v => set("isHot", v)} id="isHot" />
              <Label htmlFor="isHot">{t("Горящий", "Hot Deal")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isFeatured} onCheckedChange={v => set("isFeatured", v)} id="isFeatured" />
              <Label htmlFor="isFeatured">{t("Рекомендуемый", "Featured")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={v => set("isActive", v)} id="isActive" />
              <Label htmlFor="isActive">{t("Активный", "Active")}</Label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSaving}>{isSaving ? t("Сохранение...", "Saving...") : t("Сохранить", "Save")}</Button>
            <Button type="button" variant="outline" onClick={onClose}>{t("Отмена", "Cancel")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
