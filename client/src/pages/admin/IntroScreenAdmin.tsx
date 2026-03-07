import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ImageUpload } from "@/components/ui/image-upload";
import { Save, Monitor } from "lucide-react";
import type { IntroScreen } from "@shared/schema";

export default function IntroScreenAdmin() {
  const { t } = useI18n();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: intro, isLoading } = useQuery<IntroScreen>({ queryKey: ["/api/intro-screen"] });

  const [form, setForm] = useState({
    titleRu: "",
    titleEn: "",
    sloganRu: "",
    sloganEn: "",
    videoUrl: "",
    isActive: true,
  });

  useEffect(() => {
    if (intro) {
      setForm({
        titleRu: intro.titleRu || "",
        titleEn: intro.titleEn || "",
        sloganRu: intro.sloganRu || "",
        sloganEn: intro.sloganEn || "",
        videoUrl: intro.videoUrl || "",
        isActive: intro.isActive,
      });
    }
  }, [intro]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/intro-screen", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/intro-screen"] });
      toast({ title: t("Сохранено", "Saved") });
    },
  });

  const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

  const handleVideoUpload = (url: string) => {
    const updated = { ...form, videoUrl: url };
    setForm(updated);
    if (url.startsWith("/uploads/")) {
      saveMutation.mutate(updated);
    }
  };

  if (isLoading) return <AdminLayout title={t("Вступительный экран", "Intro Screen")}><div className="h-40 animate-pulse bg-muted rounded-xl" /></AdminLayout>;

  return (
    <AdminLayout title={t("Вступительный экран", "Intro Screen")}>
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Monitor className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{t("Вступительный экран", "Intro Screen")}</p>
                <p className="text-xs text-muted-foreground">{t("Отображается при первом визите на сайт", "Shown on first visit to the site")}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Label className="text-sm">{t("Активен", "Active")}</Label>
                <Switch checked={form.isActive} onCheckedChange={v => set("isActive", v)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("Заголовок (RU)", "Title (RU)")}</Label>
                <Input value={form.titleRu} onChange={e => set("titleRu", e.target.value)} className="mt-1" placeholder="Добро пожаловать" />
              </div>
              <div>
                <Label>{t("Заголовок (EN)", "Title (EN)")}</Label>
                <Input value={form.titleEn} onChange={e => set("titleEn", e.target.value)} className="mt-1" placeholder="Welcome" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("Слоган (RU)", "Slogan (RU)")}</Label>
                <Input value={form.sloganRu} onChange={e => set("sloganRu", e.target.value)} className="mt-1" placeholder="Откройте мир путешествий" />
              </div>
              <div>
                <Label>{t("Слоган (EN)", "Slogan (EN)")}</Label>
                <Input value={form.sloganEn} onChange={e => set("sloganEn", e.target.value)} className="mt-1" placeholder="Discover the world" />
              </div>
            </div>

            <div>
              <Label>{t("Видео (URL)", "Video (URL)")}</Label>
              <p className="text-xs text-muted-foreground mb-1">{t("Поддерживается MP4 и GIF — загрузите файл или вставьте ссылку", "Supports MP4 and GIF — upload a file or paste a link")}</p>
              <ImageUpload value={form.videoUrl} onChange={handleVideoUpload} placeholder="https://... или /uploads/animation.gif" />
            </div>

            <div className="pt-2">
              <Button
                className="gap-2"
                onClick={() => saveMutation.mutate(form)}
                disabled={saveMutation.isPending}
                data-testid="button-save-intro"
              >
                <Save className="h-4 w-4" />
                {saveMutation.isPending ? t("Сохранение...", "Saving...") : t("Сохранить", "Save")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {form.videoUrl && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-semibold mb-3">{t("Предпросмотр фона", "Background Preview")}</p>
              {form.videoUrl.toLowerCase().endsWith(".gif") ? (
                <img src={form.videoUrl} alt="preview" className="w-full rounded-lg max-h-60 object-cover bg-black" />
              ) : (
                <video src={form.videoUrl} controls className="w-full rounded-lg max-h-60 object-cover bg-black" />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
