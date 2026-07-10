import { useI18n } from "@/lib/i18n";
import { FileText } from "lucide-react";

export default function Offer() {
  const { t } = useI18n();

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
      <div className="bg-white/95 dark:bg-card/98 backdrop-blur-xl rounded-2xl sm:rounded-3xl px-6 sm:px-10 py-10 sm:py-12 shadow-xl border border-white/30">
      <div className="flex items-center gap-3 mb-2">
        <FileText className="h-7 w-7 text-primary shrink-0" />
        <h1 className="text-3xl font-bold">{t("Публичный договор-оферта", "Public Offer Agreement")}</h1>
      </div>
      <p className="text-muted-foreground text-sm mb-2">
        {t(
          "на оказание комплекса туристических и экскурсионных услуг",
          "for the provision of a complex of tourist and excursion services"
        )}
      </p>
      <p className="text-muted-foreground text-xs mb-10">{t("Действующая редакция", "Current edition")}</p>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground">

        <section>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              "Общество с ограниченной ответственностью «Ояндаи Соф», зарегистрированное и действующее в соответствии с законодательством Республики Таджикистан, именуемое в дальнейшем «Организатор», настоящим предлагает любому дееспособному физическому или юридическому лицу, именуемому в дальнейшем «Клиент», заключить настоящий договор на оказание туристических и экскурсионных услуг на условиях, изложенных ниже.",
              "LLC «Oyandai Sof», registered and operating in accordance with the legislation of the Republic of Tajikistan, hereinafter referred to as the «Organizer», hereby offers any capable individual or legal entity, hereinafter referred to as the «Client», to conclude this agreement for the provision of tourist and excursion services under the terms set forth below."
            )}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            {t(
              "Настоящий документ является публичной офертой в соответствии со статьей 469 Гражданского кодекса Республики Таджикистан.",
              "This document is a public offer in accordance with Article 469 of the Civil Code of the Republic of Tajikistan."
            )}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            {t(
              "Акцептом настоящей оферты, то есть полным и безоговорочным принятием Клиентом её условий, считается совершение Клиентом одного или нескольких следующих действий:",
              "Acceptance of this offer, i.e., full and unconditional acceptance of its terms by the Client, is considered to be the Client's performance of one or more of the following actions:"
            )}
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
            <li>{t("оформление заявки на бронирование туристического продукта;", "filing an application for booking a tourist product;")}</li>
            <li>{t("подтверждение бронирования посредством электронных средств связи;", "confirmation of booking via electronic means of communication;")}</li>
            <li>{t("внесение полной либо частичной оплаты (депозита).", "making full or partial payment (deposit).")}</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            {t(
              "С момента акцепта оферты настоящий договор считается заключённым и имеет юридическую силу, равную договору, подписанному сторонами в письменной форме.",
              "From the moment of acceptance of the offer, this agreement is considered concluded and has legal force equal to an agreement signed by the parties in writing."
            )}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("1. Термины и определения", "1. Terms and Definitions")}</h2>
          <div className="space-y-3 text-muted-foreground">
            <p><strong className="text-foreground">{t("1.1. Туристический продукт (Тур)", "1.1. Tourist product (Tour)")}</strong> — {t("сформированный Организатором комплекс услуг, включающий, но не ограничиваясь: разработку маршрута, транспортное обслуживание, размещение, экскурсионное сопровождение, организационную поддержку и иные услуги, предусмотренные программой Тура.", "a set of services formed by the Organizer, including but not limited to: route development, transport services, accommodation, excursion support, organizational support and other services provided by the Tour program.")}</p>
            <p><strong className="text-foreground">{t("1.2. Программа Тура", "1.2. Tour Program")}</strong> — {t("описание маршрута, перечень услуг, сроки, условия проживания, транспортного обслуживания и иные существенные характеристики туристического продукта, направляемые Клиенту в подтверждении бронирования.", "description of the route, list of services, dates, accommodation conditions, transport services and other essential characteristics of the tourist product sent to the Client in the booking confirmation.")}</p>
            <p><strong className="text-foreground">{t("1.3. Депозит", "1.3. Deposit")}</strong> — {t("обеспечительный платёж в размере 30% от общей стоимости Тура, вносимый Клиентом в целях подтверждения бронирования и покрытия фактически понесённых расходов Организатора, связанных с резервированием услуг третьих лиц.", "a security payment in the amount of 30% of the total cost of the Tour, made by the Client to confirm the booking and cover the actual costs incurred by the Organizer related to the reservation of third-party services.")}</p>
            <p><strong className="text-foreground">{t("1.4. Форс-мажор", "1.4. Force Majeure")}</strong> — {t("чрезвычайные и непредотвратимые при данных условиях обстоятельства, не зависящие от воли сторон, включая, но не ограничиваясь: стихийные бедствия, экстремальные погодные условия, эпидемии и пандемии, военные действия, террористические акты, гражданские беспорядки, решения органов государственной власти, ограничения на передвижение.", "extraordinary and unavoidable circumstances beyond the control of the parties, including but not limited to: natural disasters, extreme weather conditions, epidemics and pandemics, military actions, terrorist acts, civil unrest, decisions of state authorities, restrictions on movement.")}</p>
            <p><strong className="text-foreground">{t("1.5. Субъективная оценка", "1.5. Subjective assessment")}</strong> — {t("индивидуальное мнение Клиента о качестве, уровне комфорта или эмоциональном восприятии услуг, не основанное на объективных критериях и не свидетельствующее о ненадлежащем исполнении обязательств Организатором.", "the Client's individual opinion about the quality, level of comfort or emotional perception of services, not based on objective criteria and not indicating improper performance of obligations by the Organizer.")}</p>
            <p><strong className="text-foreground">{t("1.6. Третьи лица", "1.6. Third parties")}</strong> — {t("поставщики услуг (отели, перевозчики, гиды и др.), не являющиеся сотрудниками Организатора.", "service providers (hotels, carriers, guides, etc.) who are not employees of the Organizer.")}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("2. Предмет договора", "2. Subject of the Agreement")}</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>{t("2.1. Организатор обязуется организовать и обеспечить оказание Клиенту комплекса туристических услуг в соответствии с выбранной Программой Тура, а Клиент обязуется принять и оплатить указанные услуги.", "2.1. The Organizer undertakes to organize and ensure the provision of a complex of tourist services to the Client in accordance with the selected Tour Program, and the Client undertakes to accept and pay for the specified services.")}</p>
            <p>{t("2.2. Существенные условия Тура, включая маршрут, сроки, стоимость, перечень включённых и дополнительных услуг, доводятся до сведения Клиента посредством электронных средств связи (электронная почта, мессенджеры, сайт) и являются неотъемлемой частью настоящего договора.", "2.2. The essential terms of the Tour, including the route, dates, cost, list of included and additional services, are communicated to the Client via electronic means of communication (email, messengers, website) and are an integral part of this agreement.")}</p>
            <p>{t("2.3. Организатор вправе привлекать третьих лиц (перевозчиков, гостиницы, гидов, партнёрские организации) для исполнения своих обязательств по настоящему договору, оставаясь ответственным в пределах, установленных настоящей офертой.", "2.3. The Organizer may engage third parties (carriers, hotels, guides, partner organizations) to fulfill its obligations under this agreement, remaining responsible within the limits established by this offer.")}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("3. Порядок бронирования и расчётов", "3. Booking and Payment Procedure")}</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>{t("3.1. Бронирование туристического продукта осуществляется посредством: веб-сайта Организатора; электронной почты; мессенджеров и иных средств дистанционной связи.", "3.1. Booking of a tourist product is carried out through: the Organizer's website; email; messengers and other means of remote communication.")}</p>
            <p>{t("3.2. После оформления заявки Клиенту направляется подтверждение бронирования с указанием всех существенных условий Тура.", "3.2. After submitting the application, the Client is sent a booking confirmation indicating all essential terms of the Tour.")}</p>
            <p>{t("3.3. Все банковские комиссии, валютные разницы и транзакционные издержки несёт Клиент.", "3.3. All bank commissions, currency differences and transaction costs are borne by the Client.")}</p>
            <p>{t("3.4. Неоплата остатка = автоматическая отмена бронирования без возврата депозита.", "3.4. Non-payment of the balance = automatic cancellation of the booking without refund of the deposit.")}</p>
            <p>{t("3.5. Оплата Тура может быть произведена: в полном объёме (100% стоимости), либо частично в виде Депозита (30% стоимости Тура).", "3.5. Payment for the Tour can be made: in full (100% of the cost), or partially in the form of a Deposit (30% of the Tour cost).")}</p>
            <p>{t("3.6. Внесение Депозита подтверждает согласие Клиента с условиями настоящей оферты и фиксирует бронирование.", "3.6. The deposit confirms the Client's agreement with the terms of this offer and fixes the booking.")}</p>
            <p>{t("3.7. Оставшаяся часть стоимости Тура подлежит оплате в срок, согласованный с Организатором, но не позднее даты начала Тура, если иное не указано.", "3.7. The remaining part of the Tour cost is subject to payment within the period agreed with the Organizer, but no later than the date of the Tour start, unless otherwise specified.")}</p>
            <p>{t("3.8. Все расчёты осуществляются в национальной валюте Республики Таджикистан (сомони), если иное не согласовано сторонами.", "3.8. All settlements are made in the national currency of the Republic of Tajikistan (somoni), unless otherwise agreed by the parties.")}</p>
            <p>{t("3.9. В случае оплаты в иностранной валюте, пересчёт осуществляется по курсу, установленному на дату оплаты.", "3.9. In case of payment in foreign currency, the conversion is made at the exchange rate established on the date of payment.")}</p>
            <p>{t("4.0. Депозит является невозвратным платежом, поскольку покрывает фактически понесённые расходы Организатора по бронированию услуг третьих лиц.", "4.0. The deposit is a non-refundable payment, as it covers the actual costs incurred by the Organizer for booking third-party services.")}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("4. Права и обязанности сторон", "4. Rights and Obligations of the Parties")}</h2>
          <div className="space-y-3 text-muted-foreground">
            <p className="font-medium text-foreground">{t("4.1. Клиент обязан:", "4.1. The Client is obligated to:")}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t("предоставить достоверные и актуальные персональные данные;", "provide accurate and up-to-date personal data;")}</li>
              <li>{t("иметь при себе действующие документы, необходимые для участия в Туре (паспорт, визы, разрешения, включая ГБАО и иные специальные зоны);", "have valid documents required for participation in the Tour (passport, visas, permits, including GBAO and other special zones);")}</li>
              <li>{t("соблюдать законодательство Республики Таджикистан;", "comply with the legislation of the Republic of Tajikistan;")}</li>
              <li>{t("выполнять указания гида и представителей Организатора, направленные на обеспечение безопасности;", "follow the instructions of the guide and representatives of the Organizer aimed at ensuring safety;")}</li>
              <li>{t("соблюдать нормы поведения, уважать других участников Тура.", "observe norms of conduct, respect other Tour participants.")}</li>
            </ul>
            <p className="font-medium text-foreground mt-3">{t("4.2. Клиент несёт полную ответственность за:", "4.2. The Client bears full responsibility for:")}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t("своё физическое и психическое состояние;", "their physical and mental condition;")}</li>
              <li>{t("соответствие уровня здоровья условиям Тура;", "the compliance of their health level with the conditions of the Tour;")}</li>
              <li>{t("сохранность личных вещей, документов и денежных средств;", "the safety of personal belongings, documents and funds;")}</li>
              <li>{t("последствия нарушения правил поведения и безопасности;", "consequences of violation of rules of conduct and safety;")}</li>
              <li>{t("ущерб, причинённый третьим лицам;", "damage caused to third parties;")}</li>
              <li>{t("нарушение законодательства;", "violation of legislation;")}</li>
              <li>{t("свои действия в состоянии опьянения.", "their actions while intoxicated.")}</li>
            </ul>
            <p>{t("4.3. Клиент подтверждает, что он обладает полной дееспособностью, действует добровольно, осознанно и в своих интересах, без какого-либо принуждения со стороны третьих лиц.", "4.3. The Client confirms that they are fully capable, acts voluntarily, consciously and in their own interests, without any coercion from third parties.")}</p>
            <p className="font-medium text-foreground mt-3">{t("4.4. Организатор обязан:", "4.4. The Organizer is obligated to:")}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t("обеспечить организацию Тура в соответствии с Программой;", "ensure the organization of the Tour in accordance with the Program;")}</li>
              <li>{t("предоставить услуги, соответствующие заявленным характеристикам;", "provide services that meet the stated characteristics;")}</li>
              <li>{t("своевременно информировать Клиента об условиях Тура;", "timely inform the Client about the conditions of the Tour;")}</li>
              <li>{t("предпринимать разумные меры для обеспечения безопасности участников.", "take reasonable measures to ensure the safety of participants.")}</li>
            </ul>
            <p className="font-medium text-foreground mt-3">{t("4.5. Организатор имеет право:", "4.5. The Organizer has the right to:")}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t("изменять маршрут, последовательность посещения объектов и логистику в целях безопасности или при объективной необходимости;", "change the route, sequence of visits and logistics for safety or objective necessity;")}</li>
              <li>{t("заменять услуги (гостиницы, транспорт и т.д.) на аналогичные без ухудшения общего объёма и качества;", "replace services (hotels, transport, etc.) with similar ones without deteriorating the overall volume and quality;")}</li>
              <li>{t("прекратить участие Клиента в Туре без возврата средств в случае нахождения в состоянии алкогольного или наркотического опьянения, агрессивного поведения, игнорирования требований безопасности.", "terminate the Client's participation in the Tour without refund in case of alcoholic or drug intoxication, aggressive behavior, or ignoring safety requirements.")}</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("5. Особенности туров и принятие рисков", "5. Tour Features and Risk Acceptance")}</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>{t("5.1. Клиент самостоятельно несёт ответственность за наличие медицинской страховки.", "5.1. The Client is solely responsible for having medical insurance.")}</p>
            <p>{t("5.2. Организатор не обязан обеспечивать медицинское обслуживание.", "5.2. The Organizer is not obligated to provide medical services.")}</p>
            <p>{t("5.3. Все медицинские расходы несёт Клиент.", "5.3. All medical expenses are borne by the Client.")}</p>
            <p>{t("5.4. Клиент осознаёт, что туристические маршруты по территории Республики Таджикистан могут включать повышенные риски, в том числе: сложные и горные дорожные условия; резкие изменения погодных условий; ограниченную доступность медицинской помощи; повышенные физические нагрузки.", "5.4. The Client understands that tourist routes in the Republic of Tajikistan may include elevated risks, including: difficult and mountainous road conditions; sudden changes in weather conditions; limited access to medical care; increased physical exertion.")}</p>
            <p>{t("5.5. Клиент подтверждает, что: его физическое состояние соответствует условиям Тура; он добровольно принимает указанные риски; он несёт ответственность за своё здоровье.", "5.5. The Client confirms that: their physical condition meets the conditions of the Tour; they voluntarily accept the specified risks; they are responsible for their own health.")}</p>
            <p>{t("5.6. Клиент добровольно принимает участие и освобождает Организатора от ответственности за любые риски.", "5.6. The Client voluntarily participates and releases the Organizer from liability for any risks.")}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("6. Ответственность сторон", "6. Liability of the Parties")}</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>{t("6.1. Организатор несёт ответственность исключительно за надлежащую организацию и координацию услуг.", "6.1. The Organizer is responsible exclusively for the proper organization and coordination of services.")}</p>
            <p>{t("6.2. Организатор не несёт ответственности за: действия или бездействие третьих лиц (гостиницы, транспортные компании и т.д.); задержки рейсов, поломки транспорта; отказ в выдаче виз или разрешений; утрату, повреждение багажа или имущества Клиента.", "6.2. The Organizer is not liable for: actions or inactions of third parties (hotels, transport companies, etc.); flight delays, vehicle breakdowns; refusal to issue visas or permits; loss or damage to the Client's luggage or property.")}</p>
            <p>{t("6.3. Услуги считаются оказанными надлежащим образом, если они соответствуют Программе Тура.", "6.3. Services are considered to have been properly rendered if they comply with the Tour Program.")}</p>
            <p>{t("6.4. Претензии, основанные на субъективной оценке, не являются основанием для признания услуг ненадлежащими.", "6.4. Claims based on subjective assessment are not grounds for recognizing services as improper.")}</p>
            <p>{t("6.5. Максимальный размер ответственности Организатора по любым требованиям ограничивается стоимостью фактически оплаченного Тура.", "6.5. The maximum amount of the Organizer's liability for any claims is limited to the cost of the actually paid Tour.")}</p>
            <p>{t("6.6. Невозможность участия в Туре по причинам, зависящим от Клиента (документы, опоздание, состояние здоровья), приравнивается к одностороннему отказу от Тура.", "6.6. The inability to participate in the Tour due to reasons depending on the Client (documents, late arrival, health condition) is equivalent to a unilateral refusal from the Tour.")}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("7. Условия отмены и возврата", "7. Cancellation and Refund Terms")}</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>{t("7.1. Клиент вправе отказаться от Тура при условии письменного уведомления Организатора.", "7.1. The Client has the right to refuse the Tour subject to written notification to the Organizer.")}</p>
            <p>{t("7.2. В случае отказа применяются следующие условия удержаний:", "7.2. In case of refusal, the following retention conditions apply:")}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t("более чем за 30 календарных дней — возврат за вычетом Депозита;", "more than 30 calendar days before — refund minus the Deposit;")}</li>
              <li>{t("от 30 до 7 дней — удержание 50% стоимости;", "30 to 7 days before — retention of 50% of the cost;")}</li>
              <li>{t("менее 7 дней — удержание 100% стоимости.", "less than 7 days before — retention of 100% of the cost.")}</li>
            </ul>
            <p>{t("7.3. Возврат денежных средств осуществляется в разумный срок с учётом банковских процедур.", "7.3. Refund of funds is made within a reasonable time taking into account banking procedures.")}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("8. Форс-мажор", "8. Force Majeure")}</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>{t("8.1. Стороны освобождаются от ответственности за неисполнение обязательств при наступлении форс-мажора.", "8.1. The parties are released from liability for non-fulfillment of obligations upon the occurrence of force majeure.")}</p>
            <p>{t("8.2. В таких случаях стороны согласовывают: перенос Тура; изменение маршрута; либо иные альтернативные решения.", "8.2. In such cases, the parties agree on: postponement of the Tour; change of route; or other alternative solutions.")}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("9. Фото и видео", "9. Photo and Video")}</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>{t("9.1. Клиент даёт согласие на использование фото- и видеоматериалов с его участием в рекламных и маркетинговых целях Организатора.", "9.1. The Client consents to the use of photo and video materials featuring them for the Organizer's advertising and marketing purposes.")}</p>
            <p>{t("9.2. Клиент вправе отказаться от использования изображений при условии письменного уведомления до начала Тура.", "9.2. The Client has the right to refuse the use of their images subject to written notification before the start of the Tour.")}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("10. Персональные данные", "10. Personal Data")}</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>{t("10.1. Клиент даёт согласие на обработку персональных данных.", "10.1. The Client consents to the processing of personal data.")}</p>
            <p>{t("10.2. Данные могут передаваться третьим лицам для исполнения договора.", "10.2. Data may be transferred to third parties to fulfill the agreement.")}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("11. Порядок рассмотрения претензий", "11. Claims Procedure")}</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>{t("11.1. Претензии принимаются исключительно в письменной форме в течение 5 календарных дней после окончания Тура.", "11.1. Claims are accepted exclusively in writing within 5 calendar days after the end of the Tour.")}</p>
            <p>{t("11.2. Стороны обязуются предпринять меры для досудебного урегулирования спора.", "11.2. The parties undertake to take measures for pre-trial settlement of the dispute.")}</p>
            <p>{t("11.3. При невозможности урегулирования спор подлежит рассмотрению в судебных органах г. Душанбе.", "11.3. If settlement is impossible, the dispute shall be resolved in the courts of the city of Dushanbe.")}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("12. Заключительные положения", "12. Final Provisions")}</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>{t("12.1. Оплата Тура означает полное и безоговорочное согласие Клиента с условиями настоящей оферты.", "12.1. Payment for the Tour means the Client's full and unconditional agreement with the terms of this offer.")}</p>
            <p>{t("12.2. Организатор вправе вносить изменения в текст оферты без предварительного уведомления.", "12.2. The Organizer has the right to make changes to the text of the offer without prior notice.")}</p>
            <p>{t("12.3. К отношениям сторон применяется редакция оферты, действующая на момент акцепта.", "12.3. The edition of the offer in effect at the time of acceptance applies to the relations of the parties.")}</p>
            <p>{t("12.4. Во всём, что не урегулировано настоящим договором, стороны руководствуются законодательством Республики Таджикистан.", "12.4. In all matters not regulated by this agreement, the parties are guided by the legislation of the Republic of Tajikistan.")}</p>
          </div>
        </section>

        <section className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">{t("13. Реквизиты", "13. Details")}</h2>
          <div className="bg-muted/40 rounded-xl p-5 space-y-4 text-muted-foreground text-sm">
            <div>
              <p className="font-semibold text-foreground">{t("ООО «Ояндаи Соф»", "LLC «Oyandai Sof»")}</p>
              <p>{t("Республика Таджикистан, г. Душанбе, улица Валаматзаде, 8", "Republic of Tajikistan, Dushanbe, Valamatzade street, 8")}</p>
              <p>{t("Тел:", "Tel:")} +992 885 260 101; +992 988 988 087; +992 550 505 133</p>
              <p>Email: <a href="mailto:nexttour23@gmail.com" className="text-primary hover:underline">nexttour23@gmail.com</a></p>
              <p>ИНН: 010106136</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">{t("Банковские реквизиты (USD)", "Bank Details (USD)")}</p>
              <p>{t("Банк:", "Bank:")} ALIF BANK OJSC</p>
              <p>{t("Адрес:", "Address:")} 9 Bahovuddinov St., Dushanbe, Tajikistan</p>
              <p>Swift: ALIFTJ22</p>
              <p>{t("Счёт:", "Account:")} 20206840300046041201</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">{t("Корреспондентский банк", "Correspondent Bank")}</p>
              <p>{t("Банк:", "Bank:")} JSC BANK OF GEORGIA</p>
              <p>Swift: BAGAGE22</p>
            </div>
          </div>
        </section>

        <section className="border-t pt-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t(
              "Настоящий Договор, оформленный в электронной форме, считается принятым и вступает в законную силу с момента подачи заявки на бронирование туристического продукта.",
              "This Agreement, executed in electronic form, is considered accepted and enters into legal force from the moment of filing an application for booking a tourist product."
            )}
          </p>
        </section>

      </div>
      </div>
    </div>
  );
}
