import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, Plane } from "lucide-react";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="relative mt-24 overflow-hidden" style={{ background: "linear-gradient(160deg, hsl(215 40% 12%) 0%, hsl(220 45% 9%) 100%)" }}>
      {/* Accent top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      {/* Decorative orbs */}
      <div className="absolute w-96 h-96 rounded-full bg-primary/6 blur-[120px] -top-24 -left-24 pointer-events-none" />
      <div className="absolute w-72 h-72 rounded-full bg-cyan-500/5 blur-[100px] bottom-0 right-0 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg">
                <Plane className="h-4 w-4 text-white -rotate-45" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">TravelPro</span>
            </div>
            <p className="text-sm text-white/45 leading-relaxed mb-6">
              {t(
                "Ваш надёжный партнёр в мире путешествий. Открывайте мир вместе с нами.",
                "Your trusted partner in the world of travel. Explore the world with us."
              )}
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Youtube, label: "YouTube" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-white/50
                    hover:bg-primary hover:border-primary hover:text-white
                    transition-all duration-200 hover:scale-105"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-5 text-xs uppercase tracking-widest text-white/35">
              {t("Навигация", "Navigation")}
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/", label: t("Главная", "Home") },
                { href: "/tours", label: t("Все туры", "All Tours") },
                { href: "/promotions", label: t("Акции", "Promotions") },
                { href: "/news", label: t("Новости", "News") },
                { href: "/about", label: t("О компании", "About") },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-white/45 hover:text-white cursor-pointer transition-colors duration-200 hover:translate-x-0.5 inline-block">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For clients */}
          <div>
            <h4 className="font-semibold mb-5 text-xs uppercase tracking-widest text-white/35">
              {t("Клиентам", "For Clients")}
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                t("Как забронировать", "How to Book"),
                t("Оплата", "Payment"),
                t("Страхование", "Insurance"),
                t("Визы", "Visas"),
                t("FAQ", "FAQ"),
              ].map(item => (
                <li key={item}>
                  <span className="text-white/45 hover:text-white cursor-pointer transition-colors duration-200 hover:translate-x-0.5 inline-block">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-semibold mb-5 text-xs uppercase tracking-widest text-white/35">
              {t("Контакты", "Contacts")}
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3 text-white/45">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="leading-relaxed">{t("г. Москва, ул. Тверская, д. 12, офис 34", "Moscow, Tverskaya St. 12, Office 34")}</span>
              </li>
              <li className="flex items-center gap-3 text-white/45">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                </div>
                +7 (495) 123-45-67
              </li>
              <li className="flex items-center gap-3 text-white/45">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                </div>
                info@travelpro.ru
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
          <span>© {new Date().getFullYear()} TravelPro. {t("Все права защищены.", "All rights reserved.")}</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-white/50 cursor-pointer transition-colors">{t("Политика конфиденциальности", "Privacy Policy")}</span>
            <span className="hover:text-white/50 cursor-pointer transition-colors">{t("Условия использования", "Terms of Use")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
