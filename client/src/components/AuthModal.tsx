import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Plane, Mail, Lock, User } from "lucide-react";
import { SiGoogle, SiFacebook, SiMaildotru } from "react-icons/si";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

interface OAuthProviders {
  google: boolean;
  facebook: boolean;
  mailru: boolean;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { t } = useI18n();
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("login");
  const [mode, setMode] = useState<"auth" | "forgotPassword">("auth");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetInfo, setResetInfo] = useState<{ resetUrl: string; emailSent: boolean } | null>(null);
  const [providers, setProviders] = useState<OAuthProviders>({ google: false, facebook: false, mailru: false });

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    fetch("/api/auth/providers").then(r => r.json()).then(setProviders).catch(() => {});
  }, []);

  // Check URL for OAuth success/error on mount
  useEffect(() => {
    if (!open) return;
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");
    if (auth === "success") {
      window.history.replaceState({}, "", window.location.pathname);
      toast({ title: t("Вход выполнен!", "Signed in!"), description: t("Добро пожаловать в NEXT TOUR!", "Welcome to NEXT TOUR!") });
      onClose();
    } else if (auth === "error") {
      const provider = params.get("provider") || "";
      window.history.replaceState({}, "", window.location.pathname);
      toast({ title: t("Ошибка входа", "Sign-in failed"), description: t(`Не удалось войти через ${provider}`, `Could not sign in with ${provider}`), variant: "destructive" });
    }
  }, [open]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast({ title: t("Добро пожаловать!", "Welcome back!") });
      onClose();
    } catch (err: any) {
      toast({ title: t("Ошибка входа", "Login failed"), description: err?.message || t("Неверный email или пароль", "Invalid email or password"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(registerData);
      toast({ title: t("Регистрация успешна!", "Registration successful!"), description: t("Добро пожаловать в NEXT TOUR!", "Welcome to NEXT TOUR!") });
      onClose();
    } catch (err: any) {
      toast({ title: t("Ошибка регистрации", "Registration failed"), description: err?.message || t("Попробуйте снова", "Please try again"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResetInfo({ resetUrl: data.resetUrl, emailSent: data.emailSent });
    } catch (err: any) {
      toast({ title: t("Ошибка", "Error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: "google" | "facebook" | "mailru") => {
    window.location.href = `/api/auth/${provider}`;
  };

  const resetForm = () => {
    setMode("auth");
    setTab("login");
    setResetInfo(null);
    setForgotEmail("");
  };

  const hasOAuth = providers.google || providers.facebook || providers.mailru;

  const OAuthButtons = () => (
    <div className="space-y-3">
      {providers.google && (
        <button
          type="button"
          data-testid="button-oauth-google"
          onClick={() => handleOAuth("google")}
          className="w-full flex items-center gap-3 px-4 h-11 rounded-lg border border-border bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors text-sm font-medium text-foreground shadow-sm"
        >
          <span className="flex items-center justify-center w-6 h-6 flex-shrink-0">
            <SiGoogle className="w-4 h-4 text-[#4285F4]" />
          </span>
          <span className="flex-1 text-center">{t("Войти через Google", "Continue with Google")}</span>
        </button>
      )}
      {providers.mailru && (
        <button
          type="button"
          data-testid="button-oauth-mailru"
          onClick={() => handleOAuth("mailru")}
          className="w-full flex items-center gap-3 px-4 h-11 rounded-lg border border-border bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors text-sm font-medium text-foreground shadow-sm"
        >
          <span className="flex items-center justify-center w-6 h-6 flex-shrink-0">
            <SiMaildotru className="w-4 h-4 text-[#FF4D4D]" />
          </span>
          <span className="flex-1 text-center">{t("Войти через Mail.ru", "Continue with Mail.ru")}</span>
        </button>
      )}
      {providers.facebook && (
        <button
          type="button"
          data-testid="button-oauth-facebook"
          onClick={() => handleOAuth("facebook")}
          className="w-full flex items-center gap-3 px-4 h-11 rounded-lg border border-border bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors text-sm font-medium text-foreground shadow-sm"
        >
          <span className="flex items-center justify-center w-6 h-6 flex-shrink-0">
            <SiFacebook className="w-4 h-4 text-[#1877F2]" />
          </span>
          <span className="flex-1 text-center">{t("Войти через Facebook", "Continue with Facebook")}</span>
        </button>
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{t("или", "or")}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={() => { onClose(); resetForm(); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-primary/80 px-6 py-8 text-primary-foreground text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20 mx-auto mb-3">
            <Plane className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-xl font-bold">
            {mode === "forgotPassword"
              ? t("Восстановление пароля", "Password Recovery")
              : tab === "login" ? t("Вход в аккаунт", "Sign In") : t("Создать аккаунт", "Create Account")}
          </h2>
          <p className="text-sm text-white/75 mt-1">
            {mode === "forgotPassword"
              ? t("Введите ваш email для сброса пароля", "Enter your email to reset password")
              : tab === "login"
                ? t("Войдите чтобы бронировать туры", "Sign in to book your dream trips")
                : t("Присоединяйтесь к NEXT TOUR", "Join NEXT TOUR today")}
          </p>
        </div>

        <div className="px-6 pb-6 pt-4">
          {mode === "auth" ? (
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2 mb-5">
                <TabsTrigger value="login" data-testid="tab-login">{t("Войти", "Sign In")}</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">{t("Регистрация", "Register")}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <div className="space-y-4">
                  {hasOAuth && <OAuthButtons />}
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="login-email" className="text-sm font-medium">{t("Email", "Email")}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          data-testid="input-login-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-9"
                          value={loginData.email}
                          onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-sm font-medium">{t("Пароль", "Password")}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-0 h-auto text-xs text-primary border-none hover:bg-transparent"
                          onClick={() => setMode("forgotPassword")}
                        >
                          {t("Забыли пароль?", "Forgot password?")}
                        </Button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          data-testid="input-login-password"
                          type={showPassword ? "text" : "password"}
                          className="pl-9 pr-10"
                          value={loginData.password}
                          onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors bg-transparent border-0 p-0 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full mt-2 h-11 text-base font-semibold" disabled={loading} data-testid="button-login-submit">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {t("Войти", "Sign In")}
                    </Button>
                  </form>
                </div>
              </TabsContent>

              <TabsContent value="register">
                <div className="space-y-4">
                  {hasOAuth && <OAuthButtons />}
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-name" className="text-sm font-medium">{t("Ваше имя", "Full Name")}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg-name"
                          data-testid="input-reg-name"
                          placeholder={t("Иван Петров", "John Smith")}
                          className="pl-9"
                          value={registerData.name}
                          onChange={e => setRegisterData(p => ({ ...p, name: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-email" className="text-sm font-medium">{t("Email", "Email")}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg-email"
                          data-testid="input-reg-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-9"
                          value={registerData.email}
                          onChange={e => setRegisterData(p => ({ ...p, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-password" className="text-sm font-medium">{t("Пароль", "Password")}</Label>
                      <p className="text-xs text-muted-foreground">{t("Минимум 6 символов", "Minimum 6 characters")}</p>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg-password"
                          data-testid="input-reg-password"
                          type={showPassword ? "text" : "password"}
                          className="pl-9 pr-10"
                          value={registerData.password}
                          onChange={e => setRegisterData(p => ({ ...p, password: e.target.value }))}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors bg-transparent border-0 p-0 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full mt-2 h-11 text-base font-semibold" disabled={loading} data-testid="button-register-submit">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {t("Зарегистрироваться", "Create Account")}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      {t("Регистрируясь, вы соглашаетесь с условиями использования", "By registering, you agree to our Terms of Service")}
                    </p>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              {!resetInfo ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "Введите email, указанный при регистрации. Мы отправим вам ссылку для сброса пароля.",
                      "Enter the email you registered with. We'll send you a password reset link."
                    )}
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-email" className="text-sm font-medium">{t("Email", "Email")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        data-testid="input-forgot-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-9"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading} data-testid="button-forgot-submit">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {t("Отправить ссылку", "Send Reset Link")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setMode("auth")}
                  >
                    {t("← Назад ко входу", "← Back to login")}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  {resetInfo.emailSent ? (
                    <>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-left">
                        <p className="font-semibold text-green-800 mb-1">{t("Письмо отправлено!", "Email sent!")}</p>
                        <p className="text-green-700">
                          {t(`Мы отправили инструкции по сбросу пароля на ${forgotEmail}. Проверьте почту и перейдите по ссылке в письме.`,
                            `We sent password reset instructions to ${forgotEmail}. Please check your inbox and follow the link in the email.`)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("Письмо не пришло? Проверьте папку «Спам»", "Didn't receive it? Check your spam folder")}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-primary/10 rounded-lg text-sm text-left break-all">
                        <p className="font-semibold mb-2">{t("Ссылка для сброса пароля", "Password Reset Link")}:</p>
                        <code className="text-primary block p-2 bg-white rounded border select-all cursor-pointer" onClick={() => {
                          window.location.href = resetInfo.resetUrl;
                          onClose();
                          resetForm();
                        }}>
                          {resetInfo.resetUrl}
                        </code>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("Нажмите на ссылку выше, чтобы перейти на страницу сброса пароля", "Click the link above to proceed to the password reset page")}
                      </p>
                    </>
                  )}
                  <Button variant="outline" className="w-full" onClick={resetForm}>
                    {t("Готово", "Done")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
