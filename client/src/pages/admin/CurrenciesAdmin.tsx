import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Star } from "lucide-react";
import type { Currency } from "@shared/schema";

export default function CurrenciesAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);

  const { data: currencies = [] } = useQuery<Currency[]>({ queryKey: ["/api/admin/currencies"] });

  const mutation = useMutation({
    mutationFn: (data: any) => editing?.id
      ? apiRequest("PUT", `/api/admin/currencies/${editing.id}`, data)
      : apiRequest("POST", "/api/admin/currencies", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/currencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/currencies"] });
      toast({ title: t("Сохранено", "Saved") });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/currencies/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/currencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/currencies"] });
      toast({ title: t("Удалено", "Deleted") });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mutation.mutate({
      code: (fd.get("code") as string).toUpperCase(),
      symbol: fd.get("symbol") as string,
      nameRu: fd.get("nameRu") as string,
      nameEn: fd.get("nameEn") as string,
      rateToBase: fd.get("rateToBase") as string,
      isBase: editing?.isBase || false,
      isActive: editing?.isActive !== false,
      sortOrder: Number(fd.get("sortOrder") || 0),
    });
  };

  return (
    <AdminLayout title={t("Валюты", "Currencies")}>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setEditing({ isActive: true, isBase: false, sortOrder: 0 })} className="gap-2" data-testid="button-add-currency">
          <Plus className="h-4 w-4" />
          {t("Добавить валюту", "Add Currency")}
        </Button>
      </div>

      <div className="space-y-2">
        {currencies.map(c => (
          <Card key={c.id} data-testid={`card-currency-${c.id}`}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold w-10 text-center">{c.symbol}</span>
                  <div>
                    <p className="font-medium text-sm flex items-center gap-1.5" data-testid={`text-currency-code-${c.id}`}>
                      {c.code}
                      {c.isBase && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />}
                      {!c.isActive && <span className="text-xs text-muted-foreground">({t("неактивна", "inactive")})</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{lang === "ru" ? c.nameRu : c.nameEn}</p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    {c.isBase ? t("Базовая", "Base") : `1 ${c.code} = ${c.rateToBase} TJS`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(c)} data-testid={`button-edit-currency-${c.id}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!c.isBase && (
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-currency-${c.id}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={v => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? t("Редактировать валюту", "Edit Currency") : t("Новая валюта", "New Currency")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("Код", "Code")}</Label>
                <Input name="code" defaultValue={editing?.code || ""} placeholder="USD" maxLength={5} required data-testid="input-currency-code" />
              </div>
              <div>
                <Label>{t("Символ", "Symbol")}</Label>
                <Input name="symbol" defaultValue={editing?.symbol || ""} placeholder="$" maxLength={5} required data-testid="input-currency-symbol" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("Название (рус)", "Name (RU)")}</Label>
                <Input name="nameRu" defaultValue={editing?.nameRu || ""} required data-testid="input-currency-name-ru" />
              </div>
              <div>
                <Label>{t("Название (англ)", "Name (EN)")}</Label>
                <Input name="nameEn" defaultValue={editing?.nameEn || ""} required data-testid="input-currency-name-en" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("Курс к базовой (TJS)", "Rate to base (TJS)")}</Label>
                <Input name="rateToBase" type="number" step="0.0001" defaultValue={editing?.rateToBase || "1"} required data-testid="input-currency-rate" />
                <p className="text-xs text-muted-foreground mt-1">{t("Сколько TJS стоит 1 единица этой валюты", "How many TJS per 1 unit of this currency")}</p>
              </div>
              <div>
                <Label>{t("Порядок", "Sort Order")}</Label>
                <Input name="sortOrder" type="number" defaultValue={editing?.sortOrder || 0} data-testid="input-currency-sort" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={editing?.isActive !== false}
                  onCheckedChange={v => setEditing((p: any) => ({ ...p, isActive: v }))}
                  data-testid="switch-currency-active"
                />
                <Label>{t("Активна", "Active")}</Label>
              </div>
              {!editing?.id && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editing?.isBase || false}
                    onCheckedChange={v => setEditing((p: any) => ({ ...p, isBase: v }))}
                    data-testid="switch-currency-base"
                  />
                  <Label>{t("Базовая валюта", "Base Currency")}</Label>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)} data-testid="button-cancel-currency">
                {t("Отмена", "Cancel")}
              </Button>
              <Button type="submit" disabled={mutation.isPending} data-testid="button-save-currency">
                {t("Сохранить", "Save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
