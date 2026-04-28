import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Image } from "lucide-react";

export default function SiteSettingsAdmin() {
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bg, isLoading } = useQuery<{ imageUrl: string; overlay: number }>({
    queryKey: ["/api/settings/site-background"],
  });

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<number | null>(null);

  const currentImage = imageUrl ?? bg?.imageUrl ?? "";
  const currentOverlay = overlay ?? bg?.overlay ?? 25;

  const saveMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/settings/site-background", {
        imageUrl: currentImage,
        overlay: currentOverlay,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/site-background"] });
      toast({ title: t("Сохранено", "Saved") });
    },
    onError: () => {
      toast({ title: t("Ошибка", "Error"), variant: "destructive" });
    },
  });

  return (
    <AdminLayout title={t("Фон сайта", "Site Background")}>
      <div className="max-w-xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Image className="h-4 w-4" />
              {t("Фоновое изображение", "Background Image")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {!isLoading && (
              <>
                <div>
                  <Label className="mb-2 block">{t("Изображение", "Image")}</Label>
                  <ImageUpload
                    value={currentImage}
                    onChange={v => setImageUrl(v)}
                  />
                  {currentImage && (
                    <p className="text-xs text-muted-foreground mt-2 break-all">{currentImage}</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>{t("Затемнение", "Overlay darkness")}</Label>
                    <span className="text-sm text-muted-foreground">{currentOverlay}%</span>
                  </div>
                  <Slider
                    min={0}
                    max={80}
                    step={5}
                    value={[currentOverlay]}
                    onValueChange={([v]) => setOverlay(v)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("0% — без затемнения, 80% — почти чёрный фон", "0% — no overlay, 80% — nearly black background")}
                  </p>
                </div>

                {/* Live preview */}
                {currentImage && (
                  <div>
                    <Label className="mb-2 block">{t("Предпросмотр", "Preview")}</Label>
                    <div
                      className="w-full h-32 rounded-lg overflow-hidden relative"
                      style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,${currentOverlay / 100}),rgba(0,0,0,${currentOverlay / 100})),url(${currentImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-white text-sm font-semibold drop-shadow">
                          {t("Предпросмотр фона", "Background preview")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                  >
                    {t("Сохранить", "Save")}
                  </Button>
                  {(imageUrl !== null || overlay !== null) && (
                    <Button
                      variant="outline"
                      onClick={() => { setImageUrl(null); setOverlay(null); }}
                    >
                      {t("Отмена", "Cancel")}
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">
              {t(
                "Загрузите изображение, которое будет использоваться как фон всего сайта. Рекомендуется использовать горизонтальные фотографии с разрешением не менее 1920×1080 пикселей.",
                "Upload an image to use as the site-wide background. Recommended: landscape photos at least 1920×1080 pixels.",
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
