import { useI18n } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Privacy() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl font-bold mb-2">{t("Политика конфиденциальности", "Privacy Policy")}</h1>
        <p className="text-muted-foreground text-sm mb-10">{t("Последнее обновление: 12 апреля 2026 г.", "Last updated: April 12, 2026")}</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("1. Общие положения", "1. General Provisions")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "Настоящая Политика конфиденциальности описывает, как NEXT TOUR (далее — «Компания», «мы») собирает, использует и защищает персональные данные пользователей сайта nexttour.tj (далее — «Сайт»). Используя Сайт, вы соглашаетесь с условиями настоящей Политики.",
                "This Privacy Policy describes how NEXT TOUR (hereinafter — 'Company', 'we') collects, uses, and protects the personal data of users of the nexttour.tj website (hereinafter — 'Site'). By using the Site, you agree to the terms of this Policy."
              )}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("2. Какие данные мы собираем", "2. What Data We Collect")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              {t("Мы можем собирать следующие персональные данные:", "We may collect the following personal data:")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>{t("Имя и фамилия", "Full name")}</li>
              <li>{t("Адрес электронной почты", "Email address")}</li>
              <li>{t("Номер телефона", "Phone number")}</li>
              <li>{t("Данные аккаунта Google (при входе через Google)", "Google account data (when signing in via Google)")}</li>
              <li>{t("История бронирований", "Booking history")}</li>
              <li>{t("Технические данные: IP-адрес, тип браузера, страницы просмотра", "Technical data: IP address, browser type, pages visited")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("3. Как мы используем ваши данные", "3. How We Use Your Data")}</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>{t("Обработка бронирований и платежей", "Processing bookings and payments")}</li>
              <li>{t("Связь с вами по вопросам заказа", "Communicating with you regarding your order")}</li>
              <li>{t("Отправка информационных писем (с вашего согласия)", "Sending informational emails (with your consent)")}</li>
              <li>{t("Улучшение качества сервиса", "Improving service quality")}</li>
              <li>{t("Соблюдение требований законодательства", "Compliance with legal requirements")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("4. Передача данных третьим лицам", "4. Data Sharing with Third Parties")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "Мы не продаём и не передаём ваши персональные данные третьим лицам без вашего согласия, за исключением случаев, необходимых для исполнения договора (платёжные системы, партнёры-отели и авиакомпании) или предусмотренных законодательством.",
                "We do not sell or transfer your personal data to third parties without your consent, except where necessary to fulfill the contract (payment systems, hotel and airline partners) or as required by law."
              )}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("5. Защита данных", "5. Data Protection")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "Мы принимаем все разумные технические и организационные меры для защиты ваших персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения. Соединение с сайтом защищено протоколом HTTPS.",
                "We take all reasonable technical and organizational measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. The connection to the site is secured by the HTTPS protocol."
              )}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("6. Ваши права", "6. Your Rights")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              {t("Вы имеете право:", "You have the right to:")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>{t("Получить доступ к своим персональным данным", "Access your personal data")}</li>
              <li>{t("Исправить неточные данные", "Correct inaccurate data")}</li>
              <li>{t("Запросить удаление данных", "Request deletion of data")}</li>
              <li>{t("Отозвать согласие на обработку данных", "Withdraw consent to data processing")}</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              {t("Для реализации прав обратитесь к нам: ", "To exercise your rights, contact us: ")}
              <a href="mailto:nexttour23@gmail.com" className="text-primary hover:underline">nexttour23@gmail.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("7. Cookies", "7. Cookies")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "Сайт использует файлы cookie для обеспечения корректной работы, сохранения настроек пользователя и аналитики. Продолжая использование Сайта, вы соглашаетесь с использованием cookie.",
                "The Site uses cookies to ensure proper functionality, save user preferences, and for analytics. By continuing to use the Site, you agree to the use of cookies."
              )}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("8. Изменения политики", "8. Policy Changes")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "Мы вправе обновлять настоящую Политику конфиденциальности. При внесении существенных изменений мы уведомим вас через Сайт или по электронной почте.",
                "We reserve the right to update this Privacy Policy. In the event of significant changes, we will notify you through the Site or by email."
              )}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("9. Контакты", "9. Contact")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("По вопросам конфиденциальности обращайтесь:", "For privacy-related inquiries, contact us:")}
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
