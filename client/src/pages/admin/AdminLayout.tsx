import { Link, useLocation, Redirect } from "wouter";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard, Map, Tag, Image, Layers,
  Users, BookOpen, MessageSquare, Newspaper,
  ChevronRight, Globe, BarChart3,
  Award, Monitor, Coins, Mail, Trash2, FileText, ImageIcon
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", labelRu: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/statistics", label: "Statistics", labelRu: "Статистика", icon: BarChart3 },
  { href: "/admin/site-settings", label: "Site Background", labelRu: "Фон сайта", icon: ImageIcon },
  { href: "/admin/loyalty", label: "Loyalty Program", labelRu: "Программа лояльности", icon: Award },
  { href: "/admin/tours", label: "Tours", labelRu: "Туры", icon: Globe },
  { href: "/admin/countries", label: "Countries & Cities", labelRu: "Страны и города", icon: Map },
  { href: "/admin/categories", label: "Categories", labelRu: "Категории", icon: Tag },
  { href: "/admin/banners", label: "Banners", labelRu: "Баннеры", icon: Image },
  { href: "/admin/feeds", label: "Tour Feeds", labelRu: "Ленты", icon: Layers },
  { href: "/admin/hero-slides", label: "Hero Slides", labelRu: "Слайды", icon: Image },
  { href: "/admin/intro-screen", label: "Intro Screen", labelRu: "Вступ. экран", icon: Monitor },
  { href: "/admin/news", label: "News", labelRu: "Новости", icon: Newspaper },
  { href: "/admin/reviews", label: "Reviews", labelRu: "Отзывы", icon: MessageSquare },
  { href: "/admin/inquiries", label: "Inquiries", labelRu: "Заявки", icon: FileText },
  { href: "/admin/bookings", label: "Bookings", labelRu: "Бронирования", icon: BookOpen },
  { href: "/admin/users", label: "Users", labelRu: "Пользователи", icon: Users },
  { href: "/admin/currencies", label: "Currencies", labelRu: "Валюты", icon: Coins },
  { href: "/admin/email", label: "Email Broadcasts", labelRu: "Email-рассылки", icon: Mail },
  { href: "/admin/trash", label: "Trash", labelRu: "Корзина", icon: Trash2 },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();
  const { lang } = useI18n();
  const [location] = useLocation();

  if (isLoading) return <div className="flex justify-center p-16"><Skeleton className="h-64 w-full" /></div>;
  if (!user || user.role !== "admin") return <Redirect to="/" />;

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-sidebar border-r border-sidebar-border shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/admin">
            <span className="font-bold text-primary text-sm cursor-pointer">✈ NEXT TOUR Admin</span>
          </Link>
        </div>
        <nav className="p-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <span className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer mb-0.5 transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`} data-testid={`nav-admin-${item.href.split("/").pop()}`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {lang === "ru" ? item.labelRu : item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-sidebar-border mt-2">
          <Link href="/">
            <span className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer text-sidebar-foreground/60 hover:text-sidebar-foreground">
              <ChevronRight className="h-4 w-4" />
              {lang === "ru" ? "На сайт" : "Back to site"}
            </span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
