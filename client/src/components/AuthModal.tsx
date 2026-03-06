import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            {tab === "login" ? t("Вход в аккаунт", "Sign In") : t("Регистрация", "Create Account")}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" data-testid="tab-login">{t("Войти", "Sign In")}</TabsTrigger>
            <TabsTrigger value="register" data-testid="tab-register">{t("Регистрация", "Register")}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="login-email">{t("Email", "Email")}</Label>
                <Input
                  id="login-email"
                  data-testid="input-login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginData.email}
                  onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">{t("Пароль", "Password")}</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    data-testid="input-login-password"
                    type={showPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading} data-testid="button-login-submit">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t("Войти", "Sign In")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="reg-name">{t("Имя", "Full Name")}</Label>
                <Input
                  id="reg-name"
                  data-testid="input-reg-name"
                  placeholder={t("Иван Петров", "John Smith")}
                  value={registerData.name}
                  onChange={e => setRegisterData(p => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">{t("Email", "Email")}</Label>
                <Input
                  id="reg-email"
                  data-testid="input-reg-email"
                  type="email"
                  placeholder="you@example.com"
                  value={registerData.email}
                  onChange={e => setRegisterData(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-username">{t("Логин", "Username")}</Label>
                <Input
                  id="reg-username"
                  data-testid="input-reg-username"
                  placeholder={t("ivan_petrov", "john_smith")}
                  value={registerData.username}
                  onChange={e => setRegisterData(p => ({ ...p, username: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">{t("Пароль", "Password")}</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    data-testid="input-reg-password"
                    type={showPassword ? "text" : "password"}
                    value={registerData.password}
                    onChange={e => setRegisterData(p => ({ ...p, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading} data-testid="button-register-submit">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t("Зарегистрироваться", "Create Account")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
