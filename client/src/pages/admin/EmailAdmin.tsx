import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Send, CheckCircle, AlertCircle, Eye, Sparkles } from "lucide-react";

const AUDIENCE_OPTIONS = [
  { value: "users", labelRu: "Все пользователи", labelEn: "All users" },
  { value: "booked", labelRu: "Только с бронированиями", labelEn: "Users with bookings" },
  { value: "all", labelRu: "Все (включая администраторов)", labelEn: "All incl. admins" },
];

const TEMPLATES = [
  {
    labelRu: "Горящие туры",
    labelEn: "Hot deals",
    subject: "Горящие предложения от NEXT TOUR",
    html: `<h2 style="color:#0b1f3a;margin:0 0 12px;">Горящие туры этой недели!</h2>
<p style="color:#475569;line-height:1.6;margin:0 0 20px;">Специальные предложения с ограниченным сроком действия — только для наших клиентов.</p>
<a href="https://nexttour.tj/tours?hot=true" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Смотреть горящие туры →</a>`,
  },
  {
    labelRu: "Сезонная скидка",
    labelEn: "Seasonal discount",
    subject: "Специальная скидка от NEXT TOUR",
    html: `<h2 style="color:#0b1f3a;margin:0 0 12px;">Специальная скидка этого сезона</h2>
<p style="color:#475569;line-height:1.6;margin:0 0 20px;">Успейте забронировать тур по выгодной цене. Предложение ограничено по времени.</p>
<a href="https://nexttour.tj/promotions" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Смотреть акции →</a>`,
  },
  {
    labelRu: "Новые направления",
    labelEn: "New destinations",
    subject: "Новые направления от NEXT TOUR",
    html: `<h2 style="color:#0b1f3a;margin:0 0 12px;">Открывайте новые горизонты!</h2>
<p style="color:#475569;line-height:1.6;margin:0 0 20px;">Мы добавили новые направления в наш каталог. Загляните и выберите своё следующее путешествие!</p>
<a href="https://nexttour.tj/tours" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Смотреть все туры →</a>`,
  },
];

export default function EmailAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();

  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [audience, setAudience] = useState("users");
  const [lastResult, setLastResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editMode, setEditMode] = useState<"visual" | "html">("visual");
  const [visualContent, setVisualContent] = useState({ heading: "", body: "", buttonText: "", buttonUrl: "" });

  const { data: users = [] } = useQuery<any[]>({ queryKey: ["/api/admin/users"] });

  const recipientCount = (() => {
    if (audience === "all") return users.length;
    if (audience === "booked") return users.filter((u: any) => u.bookingsCount > 0).length;
    return users.filter((u: any) => u.role === "user").length;
  })();

  const broadcastMutation = useMutation({
    mutationFn: async () => {
      const finalHtml = editMode === "visual" ? buildVisualHtml() : html;
      return await apiRequest("POST", "/api/admin/email/broadcast", { subject, html: finalHtml, audience });
    },
    onSuccess: (data: any) => {
      setLastResult(data);
      setShowConfirm(false);
      toast({
        title: t("Рассылка выполнена", "Broadcast sent"),
        description: t(`Отправлено: ${data.sent}, ошибок: ${data.failed}`, `Sent: ${data.sent}, failed: ${data.failed}`),
      });
    },
    onError: () => {
      setShowConfirm(false);
      toast({ title: t("Ошибка", "Error"), description: t("Не удалось отправить рассылку", "Failed to send broadcast"), variant: "destructive" });
    },
  });

  function buildVisualHtml() {
    let result = "";
    if (visualContent.heading) {
      result += `<h2 style="color:#0b1f3a;margin:0 0 12px;">${visualContent.heading}</h2>\n`;
    }
    if (visualContent.body) {
      const paragraphs = visualContent.body.split("\n").filter(Boolean).map(p => 
        `<p style="color:#475569;line-height:1.6;margin:0 0 12px;">${p}</p>`
      ).join("\n");
      result += paragraphs + "\n";
    }
    if (visualContent.buttonText && visualContent.buttonUrl) {
      result += `<div style="margin-top:20px;"><a href="${visualContent.buttonUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">${visualContent.buttonText}</a></div>`;
    }
    return result;
  }

  function applyTemplate(tpl: typeof TEMPLATES[0]) {
    setSubject(tpl.subject);
    setHtml(tpl.html);
    setEditMode("html");
  }

  function getPreviewHtml() {
    const content = editMode === "visual" ? buildVisualHtml() : html;
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;">
        <div style="background:linear-gradient(135deg,#0b1f3a 0%,#1e3a5f 100%);padding:36px 32px;text-align:center;border-radius:8px 8px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:.08em;">NEXT TOUR</h1>
          <p style="color:rgba(255,255,255,.7);margin:6px 0 0;font-size:13px;">Специальное предложение</p>
        </div>
        <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;box-shadow:0 4px 24px rgba(0,0,0,.08);">
          ${content}
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0 20px;">
          <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">© 2026 NEXT TOUR · nexttour.tj</p>
        </div>
      </div>`;
  }

  const isReady = subject.trim() && (editMode === "visual" 
    ? (visualContent.heading || visualContent.body) 
    : html.trim());

  const audienceLabel = AUDIENCE_OPTIONS.find(o => o.value === audience);

  return (
    <AdminLayout title={t("Email-рассылки", "Email Broadcasts")}>
      <div className="space-y-6 max-w-3xl">

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
                  <Button key={i} variant="outline" size="sm" onClick={() => applyTemplate(tpl)} data-testid={`button-template-${i}`}>
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
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
                      {lang === "ru" ? o.labelRu : o.labelEn} ({
                        o.value === "all" ? users.length :
                        o.value === "booked" ? users.filter((u: any) => u.bookingsCount > 0).length :
                        users.filter((u: any) => u.role === "user").length
                      })
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
              <div className="flex items-center justify-between mb-1.5">
                <Label>{t("Содержимое", "Content")}</Label>
                <div className="flex gap-1">
                  <Button
                    variant={editMode === "visual" ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setEditMode("visual")}
                  >
                    {t("Визуальный", "Visual")}
                  </Button>
                  <Button
                    variant={editMode === "html" ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setEditMode("html")}
                  >
                    HTML
                  </Button>
                </div>
              </div>

              {editMode === "visual" ? (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                  <div>
                    <Label className="text-xs mb-1 block">{t("Заголовок", "Heading")}</Label>
                    <Input
                      value={visualContent.heading}
                      onChange={e => setVisualContent(p => ({ ...p, heading: e.target.value }))}
                      placeholder={t("Заголовок письма", "Email heading")}
                      data-testid="input-visual-heading"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">{t("Текст", "Body text")}</Label>
                    <Textarea
                      value={visualContent.body}
                      onChange={e => setVisualContent(p => ({ ...p, body: e.target.value }))}
                      rows={5}
                      placeholder={t("Текст письма (каждая строка — отдельный абзац)", "Email body (each line is a paragraph)")}
                      data-testid="input-visual-body"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs mb-1 block">{t("Текст кнопки", "Button text")}</Label>
                      <Input
                        value={visualContent.buttonText}
                        onChange={e => setVisualContent(p => ({ ...p, buttonText: e.target.value }))}
                        placeholder={t("Смотреть →", "View →")}
                        data-testid="input-visual-btn-text"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">{t("Ссылка кнопки", "Button URL")}</Label>
                      <Input
                        value={visualContent.buttonUrl}
                        onChange={e => setVisualContent(p => ({ ...p, buttonUrl: e.target.value }))}
                        placeholder="https://nexttour.tj/tours"
                        data-testid="input-visual-btn-url"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Textarea
                    data-testid="input-email-html"
                    value={html}
                    onChange={e => setHtml(e.target.value)}
                    rows={10}
                    placeholder={t("<h2>Заголовок</h2><p>Текст письма...</p>", "<h2>Heading</h2><p>Email body...</p>")}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t("Шапка и подвал NEXT TOUR добавляются автоматически.", "NEXT TOUR header and footer are added automatically.")}</p>
                </>
              )}
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

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                disabled={!isReady}
                onClick={() => setShowPreview(true)}
                data-testid="button-preview"
              >
                <Eye className="h-4 w-4 mr-2" />
                {t("Предпросмотр", "Preview")}
              </Button>
              <Button
                data-testid="button-send-broadcast"
                disabled={!isReady}
                onClick={() => setShowConfirm(true)}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {t("Отправить", "Send")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Предпросмотр письма", "Email Preview")}</DialogTitle>
            <DialogDescription>{t("Тема", "Subject")}: {subject}</DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden bg-gray-100 p-4">
            <div dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              {t("Закрыть", "Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Подтвердите отправку", "Confirm sending")}</DialogTitle>
            <DialogDescription>
              {t(
                `Вы собираетесь отправить рассылку «${subject}» для ${recipientCount} получателей (${lang === "ru" ? audienceLabel?.labelRu : audienceLabel?.labelEn}). Это действие нельзя отменить.`,
                `You are about to send "${subject}" to ${recipientCount} recipients (${lang === "ru" ? audienceLabel?.labelRu : audienceLabel?.labelEn}). This action cannot be undone.`
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)} data-testid="button-cancel-broadcast">
              {t("Отмена", "Cancel")}
            </Button>
            <Button
              disabled={broadcastMutation.isPending}
              onClick={() => broadcastMutation.mutate()}
              data-testid="button-confirm-broadcast"
            >
              <Send className="h-4 w-4 mr-2" />
              {broadcastMutation.isPending
                ? t("Отправка...", "Sending...")
                : t(`Отправить (${recipientCount})`, `Send (${recipientCount})`)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
