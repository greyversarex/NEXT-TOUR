import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Send, Users, CheckCircle, AlertCircle, Info } from "lucide-react";

const AUDIENCE_OPTIONS = [
  { value: "users", labelRu: "Все пользователи", labelEn: "All users" },
  { value: "booked", labelRu: "Только с бронированиями", labelEn: "Users with bookings" },
  { value: "all", labelRu: "Все (включая администраторов)", labelEn: "All incl. admins" },
];

const TEMPLATES = [
  {
    labelRu: "Горящие туры",
    labelEn: "Hot deals",
    subject: "🔥 Горящие предложения от NEXT TOUR",
    html: `<h2 style="color:#0b1f3a;margin:0 0 12px;">Горящие туры этой недели!</h2>
<p style="color:#475569;line-height:1.6;margin:0 0 20px;">Специальные предложения с ограниченным сроком действия — только для наших клиентов.</p>
<a href="${window.location.origin}/tours?hot=true" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Смотреть горящие туры →</a>`,
  },
  {
    labelRu: "Сезонная скидка",
    labelEn: "Seasonal discount",
    subject: "🌴 Специальная скидка от NEXT TOUR",
    html: `<h2 style="color:#0b1f3a;margin:0 0 12px;">Специальная скидка этого сезона</h2>
<p style="color:#475569;line-height:1.6;margin:0 0 20px;">Успейте забронировать тур по выгодной цене. Предложение ограничено по времени.</p>
<a href="${window.location.origin}/promotions" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Смотреть акции →</a>`,
  },
];

export default function EmailAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();

  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [audience, setAudience] = useState("users");
  const [lastResult, setLastResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  const broadcastMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/email/broadcast", { subject, html, audience });
    },
    onSuccess: (data: any) => {
      setLastResult(data);
      toast({
        title: t("Рассылка выполнена", "Broadcast sent"),
        description: t(`Отправлено: ${data.sent}, ошибок: ${data.failed}`, `Sent: ${data.sent}, failed: ${data.failed}`),
      });
    },
    onError: () => {
      toast({ title: t("Ошибка", "Error"), description: t("Не удалось отправить рассылку", "Failed to send broadcast"), variant: "destructive" });
    },
  });

  function applyTemplate(tpl: typeof TEMPLATES[0]) {
    setSubject(tpl.subject);
    setHtml(tpl.html);
  }

  return (
    <AdminLayout title={t("Email-рассылки", "Email Broadcasts")}>
      <div className="space-y-6 max-w-3xl">

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4 text-blue-500" />
              {t("Как это работает", "How it works")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>• {t("Письма отправляются через SendGrid от имени NEXT TOUR", "Emails are sent via SendGrid on behalf of NEXT TOUR")}</p>
            <p>• {t("При бронировании тура клиент автоматически получает письмо-подтверждение", "Booking confirmation is sent automatically when a tour is booked")}</p>
            <p>• {t("Здесь можно запустить ручную рассылку по всей базе или отдельным группам", "Here you can send a manual broadcast to all users or specific groups")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4 text-primary" />
              {t("Новая рассылка", "New broadcast")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            <div>
              <Label className="mb-1.5 block">{t("Быстрые шаблоны", "Quick templates")}</Label>
              <div className="flex gap-2 flex-wrap">
                {TEMPLATES.map((tpl, i) => (
                  <Button key={i} variant="outline" size="sm" onClick={() => applyTemplate(tpl)}>
                    {lang === "ru" ? tpl.labelRu : tpl.labelEn}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="email-audience" className="mb-1.5 block">{t("Аудитория", "Audience")}</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger id="email-audience" data-testid="select-audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>
                      {lang === "ru" ? o.labelRu : o.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email-subject" className="mb-1.5 block">{t("Тема письма", "Subject")}</Label>
              <Input
                id="email-subject"
                data-testid="input-email-subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder={t("Введите тему письма...", "Enter subject...")}
              />
            </div>

            <div>
              <Label htmlFor="email-html" className="mb-1.5 block">{t("Содержимое (HTML)", "Content (HTML)")}</Label>
              <Textarea
                id="email-html"
                data-testid="input-email-html"
                value={html}
                onChange={e => setHtml(e.target.value)}
                rows={10}
                placeholder={t("<h2>Заголовок</h2><p>Текст письма...</p>", "<h2>Heading</h2><p>Email body...</p>")}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">{t("Введите HTML-содержимое. Шапка и подвал NEXT TOUR добавляются автоматически.", "Enter HTML content. NEXT TOUR header and footer are added automatically.")}</p>
            </div>

            {lastResult && (
              <div className={`flex items-center gap-3 p-3 rounded-xl text-sm ${lastResult.failed === 0 ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                {lastResult.failed === 0 ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>
                  {t(`Рассылка: отправлено ${lastResult.sent} из ${lastResult.total}`, `Broadcast: sent ${lastResult.sent} of ${lastResult.total}`)}
                  {lastResult.failed > 0 && t(`, ошибок: ${lastResult.failed}`, `, failed: ${lastResult.failed}`)}
                </span>
              </div>
            )}

            <Button
              data-testid="button-send-broadcast"
              disabled={!subject.trim() || !html.trim() || broadcastMutation.isPending}
              onClick={() => broadcastMutation.mutate()}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {broadcastMutation.isPending
                ? t("Отправка...", "Sending...")
                : t("Отправить рассылку", "Send broadcast")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
