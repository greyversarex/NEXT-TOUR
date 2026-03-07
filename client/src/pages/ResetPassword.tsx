import { useState } from "react";
import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({ title: t("Ошибка", "Error"), description: t("Токен отсутствует", "Token is missing"), variant: "destructive" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: t("Ошибка", "Error"), description: t("Пароли не совпадают", "Passwords do not match"), variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: formData.password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(true);
      toast({ title: t("Успех", "Success"), description: t("Пароль успешно изменен", "Password changed successfully") });
      
      setTimeout(() => {
        setLocation("/");
      }, 3000);
    } catch (err: any) {
      toast({ title: t("Ошибка", "Error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container max-w-md mx-auto py-20 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("Ошибка доступа", "Access Error")}</h1>
        <p className="text-muted-foreground mb-6">{t("Некорректная или просроченная ссылка для сброса пароля.", "Invalid or expired password reset link.")}</p>
        <Button onClick={() => setLocation("/")}>{t("Вернуться на главную", "Back to Home")}</Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container max-w-md mx-auto py-20 px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>{t("Пароль изменен", "Password Changed")}</CardTitle>
            <CardDescription>
              {t("Ваш пароль был успешно обновлен. Сейчас вы будете перенаправлены на главную страницу.", "Your password has been successfully updated. You will be redirected to the home page shortly.")}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => setLocation("/")}>{t("Перейти на главную", "Go to Home")}</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-20 px-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("Новый пароль", "New Password")}</CardTitle>
          <CardDescription>
            {t("Введите новый пароль для вашего аккаунта", "Enter a new password for your account")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("Новый пароль", "New Password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  data-testid="input-reset-password"
                  type={showPassword ? "text" : "password"}
                  className="pl-9 pr-10"
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{t("Подтвердите пароль", "Confirm Password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  data-testid="input-reset-confirm-password"
                  type={showPassword ? "text" : "password"}
                  className="pl-9 pr-10"
                  value={formData.confirmPassword}
                  onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading} data-testid="button-reset-submit">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("Сохранить пароль", "Save Password")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
