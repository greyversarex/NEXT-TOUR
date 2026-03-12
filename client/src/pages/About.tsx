import { useI18n } from "@/lib/i18n";
import { MapPin, Phone, Mail, Clock, Award, Shield, Plane, Star, Headphones } from "lucide-react";
import officePhoto from "@assets/Generated_Image_March_13,_2026_-_2_17AM_1773350294824.png";

export default function About() {
  const { t } = useI18n();


  const values = [
    {
      icon: Shield,
      titleRu: "Надёжность",
      titleEn: "Reliability",
      descRu: "Мы работаем только с проверенными партнёрами и несём полную ответственность за каждое бронирование.",
      descEn: "We work only with trusted partners and take full responsibility for every booking.",
    },
    {
      icon: Headphones,
      titleRu: "Поддержка 24/7",
      titleEn: "24/7 Support",
      descRu: "Наши менеджеры на связи в любое время — до, во время и после поездки.",
      descEn: "Our managers are available at any time — before, during, and after your trip.",
    },
    {
      icon: Star,
      titleRu: "Индивидуальный подход",
      titleEn: "Personal Approach",
      descRu: "Мы подбираем туры с учётом ваших пожеланий, бюджета и предпочтений.",
      descEn: "We select tours based on your preferences, budget, and wishes.",
    },
    {
      icon: Plane,
      titleRu: "Лучшие цены",
      titleEn: "Best Prices",
      descRu: "Прямые контракты с отелями и авиакомпаниями позволяют нам предлагать выгодные цены.",
      descEn: "Direct contracts with hotels and airlines allow us to offer competitive prices.",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden bg-white/15 backdrop-blur-2xl border-b border-white/20 mb-8 sm:mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white border border-white/25 rounded-full px-4 py-1.5 text-sm font-semibold mb-5 backdrop-blur-sm">
            <Award className="h-4 w-4" />
            {t("Наша компания", "About Us")}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight text-white drop-shadow-md">{t("О компании NEXT TOUR", "About NEXT TOUR")}</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed px-2">
            {t(
              "Ваш надёжный партнёр в мире путешествий. Организуем незабываемые туры по всему миру с 2017 года.",
              "Your reliable partner in the world of travel. Organizing unforgettable tours worldwide since 2017."
            )}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
       <div className="bg-white/90 dark:bg-card/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl border border-white/30">

        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold mb-5">{t("О нас", "About Us")}</h2>
          <img
            src={officePhoto}
            alt={t("О компании NEXT TOUR", "About NEXT TOUR")}
            className="w-full rounded-2xl object-cover object-[center_25%] h-56 sm:h-72 md:h-80 shadow-lg mb-6"
          />
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              {t(
                "NEXT TOUR — туристическая компания из Душанбе, основанная в 2017 году. Мы специализируемся на организации групповых и индивидуальных туров по самым популярным направлениям мира: от пляжного отдыха в Юго-Восточной Азии до экскурсионных программ по Европе и Ближнему Востоку.",
                "NEXT TOUR is a travel company from Dushanbe, founded in 2017. We specialize in organizing group and individual tours to the world's most popular destinations: from beach holidays in Southeast Asia to sightseeing programs across Europe and the Middle East."
              )}
            </p>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              {t(
                "За годы работы мы помогли тысячам клиентов организовать идеальный отдых. Наша команда опытных менеджеров лично знает каждое направление и подберёт тур, который подойдёт именно вам — будь то романтическое путешествие, семейный отдых или приключение с друзьями.",
                "Over the years, we have helped thousands of clients organize the perfect vacation. Our team of experienced managers personally knows every destination and will find a tour that suits you — whether it's a romantic trip, a family holiday, or an adventure with friends."
              )}
            </p>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              {t(
                "Мы работаем напрямую с авиакомпаниями, отелями и принимающими сторонами, что позволяет нам гарантировать лучшие цены и качество обслуживания на каждом этапе вашего путешествия.",
                "We work directly with airlines, hotels, and local partners, which allows us to guarantee the best prices and service quality at every stage of your journey."
              )}
            </p>
          </div>
        </div>

        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">{t("Почему выбирают нас", "Why Choose Us")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {values.map((item, i) => (
              <div key={i} className="flex gap-4 bg-card border border-card-border rounded-xl sm:rounded-2xl p-5 sm:p-6 hover-elevate transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base mb-1">{t(item.titleRu, item.titleEn)}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t(item.descRu, item.descEn)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">{t("Контакты", "Contact Us")}</h2>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">{t("Адрес", "Address")}</p>
                  <p className="text-muted-foreground text-xs sm:text-sm">{t("г. Душанбе, ул. Гаффора Валаматзаде, 8/1", "Dushanbe, Gaffor Valamatzade St. 8/1")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">{t("Телефон", "Phone")}</p>
                  <a href="tel:+992988988087" className="text-muted-foreground text-xs sm:text-sm hover:text-primary transition-colors">+992 988 988 087</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">Email</p>
                  <a href="mailto:nexttour23@gmail.com" className="text-muted-foreground text-xs sm:text-sm hover:text-primary transition-colors">nexttour23@gmail.com</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">{t("Часы работы", "Working Hours")}</p>
                  <p className="text-muted-foreground text-xs sm:text-sm">{t("Пн–Сб: 9:00–18:00", "Mon–Sat: 9:00–18:00")}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-border h-52 sm:h-60">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3057.8!2d68.7738!3d38.5598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38b5d17e5db5b1f7%3A0x6c06d1fa43d6e7e0!2sDushanbe!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                title={t("Расположение офиса", "Office location")}
                data-testid="iframe-about-map"
              />
            </div>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}
