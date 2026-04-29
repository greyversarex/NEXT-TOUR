import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Upload, X } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import type { Hotel, Country, City } from "@shared/schema";

export default function HotelsAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [filterCountry, setFilterCountry] = useState<string>("");
  const [filterCity, setFilterCity] = useState<string>("");
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: hotels = [] } = useQuery<Hotel[]>({ queryKey: ["/api/hotels"] });
  const { data: countries = [] } = useQuery<Country[]>({ queryKey: ["/api/countries"] });
  const { data: cities = [] } = useQuery<City[]>({ queryKey: ["/api/cities"] });

  const filteredHotels = hotels.filter(h => {
    if (filterCountry && h.countryId !== filterCountry) return false;
    if (filterCity && h.cityId !== filterCity) return false;
    return true;
  });

  const filteredFormCities = cities.filter(c =>
    !editing?.countryId || c.countryId === editing.countryId
  );

  const saveMutation = useMutation({
    mutationFn: (data: any) => editing?.id
      ? apiRequest("PUT", `/api/hotels/${editing.id}`, data)
      : apiRequest("POST", "/api/hotels", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels"] });
      toast({ title: t("Сохранено", "Saved") });
      setEditing(null);
    },
    onError: (err: any) => {
      toast({ title: t("Ошибка", "Error"), description: err?.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/hotels/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels"] });
      toast({ title: t("Гостиница удалена", "Hotel deleted") });
    },
  });

  async function handleGalleryUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        if (data?.url) uploaded.push(data.url);
      }
      setEditing((p: any) => ({ ...p, images: [...(p.images || []), ...uploaded] }));
    } catch (e: any) {
      toast({ title: t("Ошибка загрузки", "Upload failed"), description: e?.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nameRu: editing.nameRu,
      nameEn: editing.nameEn,
      descriptionRu: editing.descriptionRu || null,
      descriptionEn: editing.descriptionEn || null,
      countryId: editing.countryId || null,
      cityId: editing.cityId || null,
      mainImage: editing.mainImage || null,
      images: editing.images || [],
    };
    saveMutation.mutate(payload);
  };

  return (
    <AdminLayout title={t("Гостиницы", "Hotels")}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          value={filterCountry}
          onChange={e => { setFilterCountry(e.target.value); setFilterCity(""); }}
          className="h-9 rounded-md border border-input px-3 text-sm bg-background"
          data-testid="select-filter-country"
        >
          <option value="">{t("Все страны", "All countries")}</option>
          {countries.map(c => <option key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</option>)}
        </select>
        <select
          value={filterCity}
          onChange={e => setFilterCity(e.target.value)}
          className="h-9 rounded-md border border-input px-3 text-sm bg-background"
          data-testid="select-filter-city"
        >
          <option value="">{t("Все города", "All cities")}</option>
          {cities.filter(c => !filterCountry || c.countryId === filterCountry).map(c => (
            <option key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</option>
          ))}
        </select>
        <div className="ml-auto">
          <Button
            onClick={() => setEditing({ images: [] })}
            className="gap-2"
            data-testid="button-add-hotel"
          >
            <Plus className="h-4 w-4" />{t("Добавить гостиницу", "Add Hotel")}
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        {filteredHotels.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("Гостиниц пока нет", "No hotels yet")}
          </p>
        )}
        {filteredHotels.map(h => {
          const country = countries.find(c => c.id === h.countryId);
          const city = cities.find(c => c.id === h.cityId);
          return (
            <Card key={h.id} data-testid={`card-hotel-${h.id}`}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {h.mainImage && (
                      <img src={h.mainImage} alt={h.nameRu} className="h-12 w-16 rounded object-cover shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm" data-testid={`text-hotel-name-${h.id}`}>
                        {lang === "ru" ? h.nameRu : h.nameEn}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[country && (lang === "ru" ? country.nameRu : country.nameEn),
                          city && (lang === "ru" ? city.nameRu : city.nameEn)]
                          .filter(Boolean).join(" • ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(h)} data-testid={`button-edit-hotel-${h.id}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => {
                        if (confirm(t("Удалить гостиницу?", "Delete hotel?"))) {
                          deleteMutation.mutate(h.id);
                        }
                      }}
                      className="text-destructive"
                      data-testid={`button-delete-hotel-${h.id}`}
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
                {editing.id ? t("Редактировать гостиницу", "Edit Hotel") : t("Добавить гостиницу", "Add Hotel")}
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
                    data-testid="input-hotel-name-ru"
                  />
                </div>
                <div>
                  <Label>{t("Название (EN)", "Name (EN)")}</Label>
                  <Input
                    value={editing.nameEn || ""}
                    onChange={e => setEditing((p: any) => ({ ...p, nameEn: e.target.value }))}
                    className="mt-1" required
                    data-testid="input-hotel-name-en"
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
                    data-testid="select-hotel-country"
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
                    data-testid="select-hotel-city"
                  >
                    <option value="">{t("Не выбран", "Not selected")}</option>
                    {filteredFormCities.map(c => <option key={c.id} value={c.id}>{lang === "ru" ? c.nameRu : c.nameEn}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <Label>{t("Описание (RU)", "Description (RU)")}</Label>
                <Textarea
                  value={editing.descriptionRu || ""}
                  onChange={e => setEditing((p: any) => ({ ...p, descriptionRu: e.target.value }))}
                  className="mt-1" rows={3}
                  data-testid="input-hotel-desc-ru"
                />
              </div>
              <div>
                <Label>{t("Описание (EN)", "Description (EN)")}</Label>
                <Textarea
                  value={editing.descriptionEn || ""}
                  onChange={e => setEditing((p: any) => ({ ...p, descriptionEn: e.target.value }))}
                  className="mt-1" rows={3}
                  data-testid="input-hotel-desc-en"
                />
              </div>

              <div>
                <Label>{t("Главное фото", "Main Image")}</Label>
                <div className="mt-1">
                  <ImageUpload
                    value={editing.mainImage || ""}
                    onChange={v => setEditing((p: any) => ({ ...p, mainImage: v }))}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>{t("Галерея фото", "Photo Gallery")}</Label>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => handleGalleryUpload(e.target.files)}
                  />
                  <Button
                    type="button" variant="outline" size="sm"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={uploading}
                    data-testid="button-upload-gallery"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? t("Загрузка...", "Uploading...") : t("Загрузить", "Upload")}
                  </Button>
                </div>
                {(editing.images || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t("Нет фотографий", "No photos")}</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {(editing.images || []).map((img: string, i: number) => (
                      <div key={i} className="relative group">
                        <img src={img} className="w-full aspect-square object-cover rounded" alt="" />
                        <button
                          type="button"
                          onClick={() => setEditing((p: any) => ({
                            ...p, images: p.images.filter((_: any, idx: number) => idx !== i)
                          }))}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`button-remove-gallery-${i}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saveMutation.isPending} data-testid="button-save-hotel">
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
