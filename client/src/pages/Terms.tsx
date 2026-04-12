import { useI18n } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Terms() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl font-bold mb-2">{t("Условия использования", "Terms of Service")}</h1>
        <p className="text-muted-foreground text-sm mb-10">{t("Последнее обновление: 12 апреля 2026 г.", "Last updated: April 12, 2026")}</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("1. Принятие условий", "1. Acceptance of Terms")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "Используя сайт nexttour.tj и сервисы NEXT TOUR, вы подтверждаете, что ознакомились с настоящими Условиями использования и согласны с ними. Если вы не согласны с какими-либо условиями, пожалуйста, прекратите использование Сайта.",
                "By using the nexttour.tj website and NEXT TOUR services, you confirm that you have read and agree to these Terms of Service. If you do not agree with any of the terms, please stop using the Site."
              )}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("2. Описание услуг", "2. Description of Services")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "NEXT TOUR — туристическое агентство, предоставляющее услуги по организации туров, бронированию гостиниц и авиабилетов. Мы выступаем посредником между клиентом и поставщиками туристических услуг.",
                "NEXT TOUR is a travel agency providing services for organizing tours, booking hotels, and airline tickets. We act as an intermediary between the client and travel service providers."
              )}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("3. Регистрация и аккаунт", "3. Registration and Account")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "Для оформления бронирования вы можете создать аккаунт на Сайте. Вы несёте ответственность за сохранность данных для входа и за все действия, совершённые под вашей учётной записью. При обнаружении несанкционированного доступа немедленно уведомите нас.",
                "To make a booking, you may create an account on the Site. You are responsible for keeping your login credentials secure and for all actions performed under your account. If you discover unauthorized access, notify us immediately."
              )}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("4. Бронирование и оплата", "4. Booking and Payment")}</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>{t("Бронирование считается подтверждённым после получения оплаты.", "A booking is considered confirmed upon receipt of payment.")}</li>
              <li>{t("Оплата производится через защищённый платёжный шлюз Alif Bank.", "Payment is made through the secure Alif Bank payment gateway.")}</li>
              <li>{t("Предоплата составляет 30% от стоимости тура.", "The deposit is 30% of the tour price.")}</li>
              <li>{t("Цены указаны в таджикских сомони (TJS), если не указано иное.", "Prices are listed in Tajik Somoni (TJS) unless otherwise stated.")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("5. Отмена и возврат", "5. Cancellation and Refunds")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "Условия отмены и возврата зависят от конкретного тура и поставщика услуг. Подробные условия указываются при оформлении бронирования. В случае отмены по инициативе компании клиент получает полный возврат средств.",
                "Cancellation and refund terms depend on the specific tour and service provider. Detailed terms are specified during the booking process. In the event of cancellation initiated by the company, the client receives a full refund."
              )}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("6. Ответственность", "6. Liability")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "NEXT TOUR не несёт ответственности за форс-мажорные обстоятельства (стихийные бедствия, действия государственных органов, пандемии и т.д.), а также за действия третьих лиц — поставщиков услуг. Мы обязуемся прилагать максимальные усилия для решения любых проблем, возникших в ходе путешествия.",
                "NEXT TOUR is not liable for force majeure circumstances (natural disasters, government actions, pandemics, etc.) or for the actions of third-party service providers. We commit to making every effort to resolve any issues that arise during travel."
              )}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("7. Интеллектуальная собственность", "7. Intellectual Property")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "Все материалы на Сайте (тексты, фотографии, логотипы, дизайн) являются собственностью NEXT TOUR или используются на законных основаниях. Запрещается копировать или использовать их без письменного разрешения.",
                "All materials on the Site (texts, photos, logos, design) are the property of NEXT TOUR or are used on a lawful basis. Copying or using them without written permission is prohibited."
              )}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("8. Применимое право", "8. Governing Law")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "Настоящие Условия регулируются законодательством Республики Таджикистан. Все споры разрешаются в судебном порядке по месту нахождения Компании.",
                "These Terms are governed by the laws of the Republic of Tajikistan. All disputes shall be resolved in court at the Company's location."
              )}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("9. Контакты", "9. Contact")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("По вопросам, связанным с условиями использования:", "For questions related to the Terms of Service:")}
            </p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>NEXT TOUR</li>
              <li>{t("г. Душанбе, Таджикистан", "Dushanbe, Tajikistan")}</li>
              <li><a href="mailto:nexttour23@gmail.com" className="text-primary hover:underline">nexttour23@gmail.com</a></li>
              <li><a href="https://nexttour.tj" className="text-primary hover:underline">nexttour.tj</a></li>
            </ul>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
