import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-card border-t border-card-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="text-xl font-bold text-primary mb-3">✈ TravelPro</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(
                "Ваш надёжный партнёр в мире путешествий. Открывайте мир вместе с нами.",
                "Your trusted partner in the world of travel. Explore the world with us."
              )}
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-foreground/60">
              {t("Навигация", "Navigation")}
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: t("Главная", "Home") },
                { href: "/tours", label: t("Все туры", "All Tours") },
                { href: "/promotions", label: t("Акции", "Promotions") },
                { href: "/news", label: t("Новости", "News") },
                { href: "/about", label: t("О компании", "About") },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-foreground/60">
              {t("Клиентам", "For Clients")}
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                t("Как забронировать", "How to Book"),
                t("Оплата", "Payment"),
                t("Страхование", "Insurance"),
                t("Визы", "Visas"),
                t("FAQ", "FAQ"),
              ].map(item => (
                <li key={item}>
                  <span className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-foreground/60">
              {t("Контакты", "Contacts")}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                {t("г. Москва, ул. Тверская, д. 12, офис 34", "Moscow, Tverskaya St. 12, Office 34")}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                +7 (495) 123-45-67
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                info@travelpro.ru
              </li>
            </ul>

            <div className="mt-4 rounded-md overflow-hidden border border-border h-24">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2245.2827338655744!2d37.60573761590082!3d55.764789980548166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54a4b5e7a9527%3A0x88fff9d4862a2c0c!2sTverskaya+St%2C+12%2C+Moscow!5e0!3m2!1sen!2sru!4v1605000000000!5m2!1sen!2sru"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                title="Office location"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} TravelPro. {t("Все права защищены.", "All rights reserved.")}
        </div>
      </div>
    </footer>
  );
}
