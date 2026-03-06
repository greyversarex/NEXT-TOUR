import { useI18n } from "@/lib/i18n";
import { MapPin, Phone, Mail, Clock, Award, Users, Globe, Heart } from "lucide-react";

export default function About() {
  const { t } = useI18n();

  const stats = [
    { icon: Globe, value: "50+", label: t("Стран", "Countries") },
    { icon: Users, value: "10,000+", label: t("Довольных клиентов", "Happy Clients") },
    { icon: Award, value: "12", label: t("Лет опыта", "Years of Experience") },
    { icon: Heart, value: "98%", label: t("Рекомендуют нас", "Recommend Us") },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t("О компании TravelPro", "About TravelPro")}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t(
            "Мы помогаем людям открывать мир с 2012 года. Наша миссия — сделать каждое путешествие незабываемым.",
            "We help people discover the world since 2012. Our mission is to make every journey unforgettable."
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="bg-card border border-card-border rounded-xl p-6 text-center hover-elevate">
            <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold text-primary">{value}</div>
            <div className="text-sm text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-4">{t("Наша история", "Our Story")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t(
              "TravelPro был основан в 2012 году группой энтузиастов путешествий. Мы начинали как небольшое агентство с несколькими направлениями, а сегодня предлагаем туры более чем в 50 стран мира.",
              "TravelPro was founded in 2012 by a group of travel enthusiasts. We started as a small agency with a few destinations, and today we offer tours to more than 50 countries."
            )}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              "Наша команда — это профессионалы, влюблённые в путешествия. Мы лично проверяем каждый тур и отель, чтобы гарантировать вам лучший опыт.",
              "Our team are professionals who love travel. We personally check every tour and hotel to guarantee you the best experience."
            )}
          </p>
        </div>
        <div>
          <img
            src="/images/hero-banner.png"
            alt="About"
            className="w-full rounded-2xl object-cover h-64"
          />
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">{t("Контакты", "Contact Us")}</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{t("Адрес", "Address")}</p>
                <p className="text-muted-foreground text-sm">{t("г. Москва, ул. Тверская, д. 12, офис 34", "Moscow, Tverskaya St. 12, Office 34")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{t("Телефон", "Phone")}</p>
                <p className="text-muted-foreground text-sm">+7 (495) 123-45-67</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground text-sm">info@travelpro.ru</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{t("Часы работы", "Working Hours")}</p>
                <p className="text-muted-foreground text-sm">{t("Пн–Пт: 9:00–19:00, Сб: 10:00–16:00", "Mon–Fri: 9:00–19:00, Sat: 10:00–16:00")}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-border h-52">
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
    </div>
  );
}
