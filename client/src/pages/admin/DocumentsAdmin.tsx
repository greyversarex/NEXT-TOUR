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
import { Plus, Edit, Trash2, FileText, ExternalLink, Lock } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import type { SiteDocument } from "@shared/schema";

export default function DocumentsAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);

  const KEY = "/api/documents?includeInactive=1";
  const { data: docs = [] } = useQuery<SiteDocument[]>({ queryKey: [KEY] });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editing?.id
      ? apiRequest("PUT", `/api/documents/${editing.id}`, data)
      : apiRequest("POST", "/api/documents", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: t("Сохранено", "Saved") });
      setEditing(null);
    },
    onError: (err: any) => {
      toast({ title: t("Ошибка", "Error"), description: err?.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/documents/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: t("Документ удалён", "Document deleted") });
    },
    onError: (err: any) => {
      toast({ title: t("Ошибка", "Error"), description: err?.message, variant: "destructive" });
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing.titleRu?.trim() || !editing.titleEn?.trim()) {
      toast({ title: t("Введите название", "Enter a title"), variant: "destructive" });
      return;
    }
    if (!editing.isSystem && !editing.slug?.trim()) {
      toast({ title: t("Введите идентификатор (slug)", "Enter a slug"), variant: "destructive" });
      return;
    }
    const payload: any = {
      titleRu: editing.titleRu,
      titleEn: editing.titleEn,
      descriptionRu: editing.descriptionRu || null,
      descriptionEn: editing.descriptionEn || null,
      fileUrl: editing.fileUrl || null,
      fileName: editing.fileName || null,
      isActive: editing.isActive !== false,
      sortOrder: Number(editing.sortOrder) || 0,
    };
    if (!editing.isSystem) payload.slug = editing.slug?.trim();
    saveMutation.mutate(payload);
  };

  return (
    <AdminLayout title={t("Документы", "Documents")}>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <p className="text-sm text-muted-foreground max-w-2xl">
          {t(
            "Загружайте и заменяйте файлы документов (PDF, Word). Кнопки и ссылки на сайте будут открывать актуальный файл. Если файл не загружен, для системных документов показывается стандартный текст страницы.",
            "Upload and replace document files (PDF, Word). Buttons and links across the site open the current file. If no file is uploaded, built-in documents fall back to their default page text."
          )}
        </p>
        <Button
          onClick={() => setEditing({ isActive: true, sortOrder: (docs.length || 0), isSystem: false })}
          className="gap-2"
          data-testid="button-add-document"
        >
          <Plus className="h-4 w-4" />{t("Добавить документ", "Add Document")}
        </Button>
      </div>

      <div className="grid gap-2">
        {docs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("Документов пока нет", "No documents yet")}
          </p>
        )}
        {docs.map(d => (
          <Card key={d.id} data-testid={`card-document-${d.id}`}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm flex items-center gap-2 flex-wrap" data-testid={`text-document-title-${d.id}`}>
                      {lang === "ru" ? d.titleRu : d.titleEn}
                      {d.isSystem && (
                        <span className="text-xs text-muted-foreground border rounded px-1.5 py-0.5 inline-flex items-center gap-1">
                          <Lock className="h-3 w-3" />{t("системный", "built-in")}
                        </span>
                      )}
                      {d.isActive === false && (
                        <span className="text-xs text-muted-foreground border rounded px-1.5 py-0.5">
                          {t("скрыт", "hidden")}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                      <span className="font-mono">/{d.slug}</span>
                      {d.fileUrl ? (
                        <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                          {t("файл загружен", "file uploaded")} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-amber-600">{t("файл не загружен", "no file")}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(d)} data-testid={`button-edit-document-${d.id}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!d.isSystem && (
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => {
                        if (confirm(t("Удалить документ?", "Delete document?"))) deleteMutation.mutate(d.id);
                      }}
                      className="text-destructive"
                      data-testid={`button-delete-document-${d.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editing !== null && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing.id ? t("Редактировать документ", "Edit Document") : t("Добавить документ", "Add Document")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("Название (RU)", "Title (RU)")}</Label>
                  <Input
                    value={editing.titleRu || ""}
                    onChange={e => setEditing((p: any) => ({ ...p, titleRu: e.target.value }))}
                    className="mt-1" required
                    placeholder={t("Договор-оферта", "Public Offer")}
                    data-testid="input-document-title-ru"
                  />
                </div>
                <div>
                  <Label>{t("Название (EN)", "Title (EN)")}</Label>
                  <Input
                    value={editing.titleEn || ""}
                    onChange={e => setEditing((p: any) => ({ ...p, titleEn: e.target.value }))}
                    className="mt-1" required
                    placeholder="Public Offer Agreement"
                    data-testid="input-document-title-en"
                  />
                </div>
              </div>

              <div>
                <Label>{t("Идентификатор (slug)", "Identifier (slug)")}</Label>
                <Input
                  value={editing.slug || ""}
                  onChange={e => setEditing((p: any) => ({ ...p, slug: e.target.value.toLowerCase() }))}
                  className="mt-1 font-mono"
                  placeholder="my-document"
                  disabled={editing.isSystem}
                  data-testid="input-document-slug"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {editing.isSystem
                    ? t("Системный идентификатор изменить нельзя.", "Built-in identifier cannot be changed.")
                    : t("Только латинские буквы, цифры и дефис. Используется в ссылке на сайте.", "Lowercase letters, numbers and hyphens only. Used in the site link.")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("Описание (RU)", "Description (RU)")}</Label>
                  <Input
                    value={editing.descriptionRu || ""}
                    onChange={e => setEditing((p: any) => ({ ...p, descriptionRu: e.target.value }))}
                    className="mt-1"
                    data-testid="input-document-desc-ru"
                  />
                </div>
                <div>
                  <Label>{t("Описание (EN)", "Description (EN)")}</Label>
                  <Input
                    value={editing.descriptionEn || ""}
                    onChange={e => setEditing((p: any) => ({ ...p, descriptionEn: e.target.value }))}
                    className="mt-1"
                    data-testid="input-document-desc-en"
                  />
                </div>
              </div>

              <div>
                <Label>{t("Файл документа", "Document file")}</Label>
                <div className="mt-1">
                  <FileUpload
                    value={editing.fileUrl || ""}
                    fileName={editing.fileName || ""}
                    onChange={(url, name) => setEditing((p: any) => ({ ...p, fileUrl: url, fileName: name }))}
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
                    data-testid="input-document-sort"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm h-9 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.isActive !== false}
                    onChange={e => setEditing((p: any) => ({ ...p, isActive: e.target.checked }))}
                    data-testid="checkbox-document-active"
                  />
                  {t("Показывать на сайте", "Show on site")}
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saveMutation.isPending} data-testid="button-save-document">
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
