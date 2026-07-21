import { Link } from "wouter";
import { Phone, Mail, MapPin, Clock, Send, Instagram } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import type { SiteDocument } from "@shared/schema";

export default function Footer() {
  const { lang } = useI18n();
  const { data: documents = [] } = useQuery<SiteDocument[]>({ queryKey: ["/api/documents"] });
  return (
    <footer className="relative mt-12 sm:mt-24 overflow-hidden bg-black/20 backdrop-blur-xl border-t border-white/10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-0">

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <div>
              <img
                src="/images/nexttour-logo-lockup-light.png"
                alt="NEXT TOUR — Explore Tajikistan"
                style={{ height: 56, width: "auto", display: "block" }}
              />
              <p className="mt-4 text-white/80 text-sm leading-relaxed">
                Ваш надёжный партнёр в мире путешествий. Лучшие туры по всему миру по доступным ценам.
              </p>
            </div>
            {/* Social */}
            <div className="flex items-center gap-3 mt-1">
              <a
                href="https://t.me/+992885260101"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-blue-500/30 border border-white/15 hover:border-blue-400/40 flex items-center justify-center text-white/80 hover:text-blue-300 transition-all duration-200"
                data-testid="link-telegram"
              >
                <Send size={15} />
              </a>
              <a
                href="https://wa.me/992885260101"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-green-500/30 border border-white/15 hover:border-green-400/40 flex items-center justify-center text-white/80 hover:text-green-400 transition-all duration-200"
                data-testid="link-whatsapp"
              >
                <FaWhatsapp size={15} />
              </a>
              <a
                href="https://www.instagram.com/nexttour.tj/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-pink-500/30 border border-white/15 hover:border-pink-400/40 flex items-center justify-center text-white/80 hover:text-pink-300 transition-all duration-200"
                data-testid="link-instagram"
              >
                <Instagram size={15} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-widest mb-5">Навигация</h4>
            <ul className="flex flex-col gap-3">
              {[
                { href: "/", label: "Главная" },
                { href: "/tours", label: "Туры" },
                { href: "/promotions", label: "Акции" },
                { href: "/news", label: "Новости" },
                { href: "/about", label: "О компании" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-white/75 hover:text-white text-sm transition-colors duration-150 flex items-center gap-2 group"
                    data-testid={`link-footer-${label.toLowerCase()}`}
                  >
                    <span className="w-1 h-1 rounded-full bg-blue-400/60 group-hover:bg-blue-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-widest mb-5">Информация</h4>
            <ul className="flex flex-col gap-3">
              {documents.filter((doc) => doc.fileUrl || doc.isSystem).map((doc) => {
                const label = lang === "ru" ? doc.titleRu : doc.titleEn;
                const dot = <span className="w-1 h-1 rounded-full bg-blue-400/60 group-hover:bg-blue-400 transition-colors" />;
                const cls = "text-white/75 hover:text-white text-sm transition-colors duration-150 flex items-center gap-2 group";
                return (
                  <li key={doc.id}>
                    {doc.fileUrl ? (
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" className={cls}>
                        {dot}{label}
                      </a>
                    ) : (
                      <Link href={`/${doc.slug}`} className={cls}>
                        {dot}{label}
                      </Link>
                    )}
                  </li>
                );
              })}
              <li>
                <Link
                  href="/profile"
                  className="text-white/75 hover:text-white text-sm transition-colors duration-150 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-blue-400/60 group-hover:bg-blue-400 transition-colors" />
                  {lang === "ru" ? "Личный кабинет" : "Personal Account"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-widest mb-5">Контакты</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                  <Phone size={13} className="text-blue-400" />
                </div>
                <div className="flex flex-col gap-1 mt-0.5">
                  <a href="tel:+992885260101" className="text-white/85 hover:text-white text-sm transition-colors">+992 885 260 101</a>
                  <a href="tel:+992550505133" className="text-white/85 hover:text-white text-sm transition-colors">+992 550 505 133</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                  <Mail size={13} className="text-blue-400" />
                </div>
                <a href="mailto:nexttour23@gmail.com" className="text-white/85 hover:text-white text-sm transition-colors mt-0.5">nexttour23@gmail.com</a>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                  <MapPin size={13} className="text-blue-400" />
                </div>
                <span className="text-white/80 text-sm leading-relaxed">г. Душанбе, ул. Гаффора Валаматзаде, 8/1</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                  <Clock size={13} className="text-blue-400" />
                </div>
                <span className="text-white/80 text-sm leading-relaxed">Пн–Сб: 9:00–18:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-0 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/55">
          <span>© {new Date().getFullYear()} NEXT TOUR. Все права защищены.</span>
          <span className="text-white/40">Лицензия ГТРТ №0012 · Таджикистан</span>
        </div>
      </div>
    </footer>
  );
}
