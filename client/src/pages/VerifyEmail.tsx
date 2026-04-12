import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"loading" | "success" | "already" | "error">("loading");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      return;
    }
    fetch(`/api/auth/verify-email?token=${token}`, { credentials: "include" })
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setStatus("error");
        } else if (data.alreadyVerified) {
          setStatus("already");
          queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        } else {
          setStatus("success");
          queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    if (status !== "success" && status !== "already") return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setLocation("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            <h1 className="text-xl font-semibold">{t("Подтверждаем ваш email...", "Verifying your email...")}</h1>
          </>
        )}
        {status === "success" && (
          <>
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{t("Email подтверждён!", "Email verified!")}</h1>
            <p className="text-muted-foreground">
              {t(
                "Ваш аккаунт активирован. Вы автоматически вошли в систему.",
                "Your account is activated. You are now signed in."
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {t(`Переход на главную через ${countdown}...`, `Redirecting in ${countdown}...`)}
            </p>
            <Button className="w-full h-11 text-base font-semibold" onClick={() => setLocation("/")} data-testid="button-go-home">
              {t("Перейти на главную", "Go to homepage")}
            </Button>
          </>
        )}
        {status === "already" && (
          <>
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mx-auto">
              <CheckCircle2 className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{t("Email уже подтверждён", "Email already verified")}</h1>
            <p className="text-muted-foreground">
              {t("Ваш аккаунт уже активирован. Вы вошли в систему.", "Your account is already activated. You are signed in.")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t(`Переход на главную через ${countdown}...`, `Redirecting in ${countdown}...`)}
            </p>
            <Button className="w-full h-11 text-base font-semibold" onClick={() => setLocation("/")} data-testid="button-go-home-already">
              {t("Перейти на главную", "Go to homepage")}
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mx-auto">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{t("Ошибка подтверждения", "Verification failed")}</h1>
            <p className="text-muted-foreground">
              {t(
                "Ссылка недействительна или уже была использована. Попробуйте войти — если email не подтверждён, вы сможете запросить новое письмо.",
                "The link is invalid or has already been used. Try signing in — if your email is not verified, you can request a new verification email."
              )}
            </p>
            <Button className="w-full h-11 text-base font-semibold" onClick={() => setLocation("/")} data-testid="button-go-home-error">
              {t("На главную", "Go to homepage")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
