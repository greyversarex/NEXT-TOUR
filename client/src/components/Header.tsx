import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Globe, User, LogOut, Settings, Heart, BookOpen, ShieldCheck } from "lucide-react";
import AuthModal from "./AuthModal";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useI18n();
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: t("Главная", "Home") },
    { href: "/tours", label: t("Туры", "Tours") },
    { href: "/promotions", label: t("Акции", "Deals") },
    { href: "/news", label: t("Новости", "News") },
    { href: "/about", label: t("О компании", "About") },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <span className="text-xl font-bold text-primary cursor-pointer tracking-tight" data-testid="link-logo">
                ✈ TravelPro
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1" data-testid="nav-main">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}>
                  <span className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                    isActive(link.href)
                      ? "text-primary bg-primary/10"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`} data-testid={`link-nav-${link.href.replace("/", "") || "home"}`}>
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLang(lang === "ru" ? "en" : "ru")}
                className="text-muted-foreground gap-1.5"
                data-testid="button-lang-toggle"
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-semibold">{lang.toUpperCase()}</span>
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 pl-2" data-testid="button-user-menu">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm hidden sm:block max-w-24 truncate">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="h-4 w-4 mr-2" />
                        {t("Мой профиль", "My Profile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/bookings">
                        <BookOpen className="h-4 w-4 mr-2" />
                        {t("Мои бронирования", "My Bookings")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/favorites">
                        <Heart className="h-4 w-4 mr-2" />
                        {t("Избранное", "Favorites")}
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            {t("Админ-панель", "Admin Panel")}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive" data-testid="button-logout">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("Выйти", "Sign Out")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button size="sm" onClick={() => setAuthOpen(true)} data-testid="button-auth-open">
                  {t("Войти", "Sign In")}
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                data-testid="button-mobile-menu"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="flex flex-col px-4 py-2 gap-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`block px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      isActive(link.href) ? "text-primary bg-primary/10" : "text-foreground/70"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
