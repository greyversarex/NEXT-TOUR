import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Plane, Mail, Lock, User, AtSign } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { t } = useI18n();
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", username: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast({ title: t("Добро пожаловать!", "Welcome back!") });
      onClose();
    } catch {
      toast({ title: t("Ошибка входа", "Login failed"), description: t("Неверный email или пароль", "Invalid email or password"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(registerData);
      toast({ title: t("Регистрация успешна!", "Registration successful!") });
      onClose();
    } catch (err: any) {
      toast({ title: t("Ошибка регистрации", "Registration failed"), description: err?.message || t("Попробуйте снова", "Please try again"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-primary/80 px-6 py-8 text-primary-foreground text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20 mx-auto mb-3">
            <Plane className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-xl font-bold">
            {tab === "login" ? t("Вход в аккаунт", "Sign In") : t("Создать аккаунт", "Create Account")}
          </h2>
          <p className="text-sm text-white/75 mt-1">
            {tab === "login"
              ? t("Войдите чтобы бронировать туры", "Sign in to book your dream trips")
              : t("Присоединяйтесь к TravelPro", "Join TravelPro today")}
          </p>
        </div>

        <div className="px-6 pb-6 pt-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2 mb-5">
              <TabsTrigger value="login" data-testid="tab-login">{t("Войти", "Sign In")}</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">{t("Регистрация", "Register")}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
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
                  <Label htmlFor="login-password" className="text-sm font-medium">{t("Пароль", "Password")}</Label>
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
                <Button type="submit" className="w-full mt-2 h-11 text-base font-semibold" disabled={loading} data-testid="button-login-submit">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {t("Войти", "Sign In")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-name" className="text-sm font-medium">{t("Имя", "Full Name")}</Label>
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
                    <Label htmlFor="reg-username" className="text-sm font-medium">{t("Логин", "Username")}</Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-username"
                        data-testid="input-reg-username"
                        placeholder="ivan_petrov"
                        className="pl-9"
                        value={registerData.username}
                        onChange={e => setRegisterData(p => ({ ...p, username: e.target.value }))}
                        required
                      />
                    </div>
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
                <Button type="submit" className="w-full mt-2 h-11 text-base font-semibold" disabled={loading} data-testid="button-register-submit">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {t("Зарегистрироваться", "Create Account")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
