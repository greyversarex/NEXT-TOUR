import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Globe, User, LogOut, Settings, Heart, BookOpen, ShieldCheck, Plane } from "lucide-react";
import AuthModal from "./AuthModal";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useI18n();
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0b1f3a]/97 backdrop-blur-xl shadow-[0_2px_24px_rgba(0,0,0,0.25)] border-b border-white/10"
            : "bg-black/20 backdrop-blur-sm border-b border-white/10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">
            {/* Logo */}
            <Link href="/">
              <span
                className="flex items-center gap-2 cursor-pointer"
                data-testid="link-logo"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-sm">
                  <Plane className="h-4 w-4 text-white -rotate-45" />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                  TravelPro
                </span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5" data-testid="nav-main">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`relative px-3.5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                      isActive(link.href)
                        ? "text-white font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                        : "text-white/85 font-semibold hover:text-white hover:bg-white/10"
                    }`}
                    data-testid={`link-nav-${link.href.replace("/", "") || "home"}`}
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-white" />
                    )}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLang(lang === "ru" ? "en" : "ru")}
                className="gap-1.5 h-9 px-3 rounded-lg transition-all duration-200 text-white/90 hover:text-white hover:bg-white/15"
                data-testid="button-lang-toggle"
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-bold">{lang.toUpperCase()}</span>
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-2 pl-2 pr-3 h-9 rounded-xl transition-all duration-200 text-white hover:bg-white/15"
                      data-testid="button-user-menu"
                    >
                      <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-cyan-400 text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm hidden sm:block max-w-24 truncate font-medium">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-border/60 p-1.5">
                    <DropdownMenuItem asChild className="rounded-lg">
                      <Link href="/profile">
                        <User className="h-4 w-4 mr-2 text-primary" />
                        {t("Мой профиль", "My Profile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg">
                      <Link href="/profile/bookings">
                        <BookOpen className="h-4 w-4 mr-2 text-primary" />
                        {t("Мои бронирования", "My Bookings")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg">
                      <Link href="/profile/favorites">
                        <Heart className="h-4 w-4 mr-2 text-primary" />
                        {t("Избранное", "Favorites")}
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href="/admin">
                            <ShieldCheck className="h-4 w-4 mr-2 text-violet-500" />
                            {t("Админ-панель", "Admin Panel")}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive rounded-lg"
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("Выйти", "Sign Out")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setAuthOpen(true)}
                  className="h-9 px-5 rounded-xl font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  data-testid="button-auth-open"
                >
                  {t("Войти", "Sign In")}
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 rounded-lg transition-colors duration-200 text-white hover:bg-white/15"
                onClick={() => setMenuOpen(!menuOpen)}
                data-testid="button-mobile-menu"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0b1f3a]/97 backdrop-blur-xl">
            <nav className="flex flex-col px-4 py-3 gap-0.5">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`block px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 ${
                      isActive(link.href)
                        ? "text-white font-bold bg-white/10"
                        : "text-white/85 font-semibold hover:text-white hover:bg-white/10"
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
