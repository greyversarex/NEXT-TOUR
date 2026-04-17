import { db } from "./db";
import {
  users, countries, cities, categories, tours, tourDates,
  priceComponents, tourOptions, tourItinerary,
  banners, tourFeeds, tourFeedItems, reviews,
  news, introScreen, heroSlides
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

const TOUR_IMAGES = [
  "/images/tour-santorini.png",
  "/images/tour-bali.png",
  "/images/tour-swiss.png",
  "/images/tour-tokyo.png",
  "/images/tour-maldives.png",
  "/images/tour-paris.png",
  "/images/tour-peru.png",
  "/images/hero-banner.png",
];

export async function seedDatabase() {
  const existing = await db.select({ count: sql<number>`count(*)` }).from(tours);
  if (Number(existing[0]?.count) > 0) {
    console.log("[seed] Database already seeded, skipping.");
    return;
  }

  console.log("[seed] Seeding database with demo data...");

  const adminPass = await bcrypt.hash("admin123", 10);
  const userPass = await bcrypt.hash("user123", 10);

  const [admin] = await db.insert(users).values([
    { email: "admin@travelpro.ru", username: "admin", name: "Администратор", password: adminPass, role: "admin", emailVerified: true },
    { email: "user@travelpro.ru", username: "user", name: "Иван Петров", password: userPass, role: "user", emailVerified: true },
    { email: "premium@travelpro.ru", username: "premium_user", name: "Анна Иванова", password: userPass, role: "user", loyaltyLevel: "premium", bookingsCount: 8, emailVerified: true },
  ]).returning();

  const countryRows = await db.insert(countries).values([
    { nameRu: "Греция", nameEn: "Greece", imageUrl: TOUR_IMAGES[0], showOnHome: true },
    { nameRu: "Индонезия", nameEn: "Indonesia", imageUrl: TOUR_IMAGES[1], showOnHome: true },
    { nameRu: "Швейцария", nameEn: "Switzerland", imageUrl: TOUR_IMAGES[2], showOnHome: true },
    { nameRu: "Япония", nameEn: "Japan", imageUrl: TOUR_IMAGES[3], showOnHome: true },
    { nameRu: "Мальдивы", nameEn: "Maldives", imageUrl: TOUR_IMAGES[4], showOnHome: true },
    { nameRu: "Франция", nameEn: "France", imageUrl: TOUR_IMAGES[5], showOnHome: true },
    { nameRu: "Перу", nameEn: "Peru", imageUrl: TOUR_IMAGES[6], showOnHome: true },
  ]).returning();

  const [greece, indonesia, switzerland, japan, maldives, france, peru] = countryRows;

  const cityRows = await db.insert(cities).values([
    { countryId: greece.id, nameRu: "Санторини", nameEn: "Santorini" },
    { countryId: greece.id, nameRu: "Афины", nameEn: "Athens" },
    { countryId: indonesia.id, nameRu: "Бали", nameEn: "Bali" },
    { countryId: switzerland.id, nameRu: "Женева", nameEn: "Geneva" },
    { countryId: japan.id, nameRu: "Токио", nameEn: "Tokyo" },
    { countryId: japan.id, nameRu: "Киото", nameEn: "Kyoto" },
    { countryId: maldives.id, nameRu: "Мале", nameEn: "Male" },
    { countryId: france.id, nameRu: "Париж", nameEn: "Paris" },
    { countryId: peru.id, nameRu: "Лима", nameEn: "Lima" },
  ]).returning();

  const [santorini, athens, bali, geneva, tokyo, kyoto, male, paris, lima] = cityRows;

  const catRows = await db.insert(categories).values([
    { nameRu: "Пляжный отдых", nameEn: "Beach" },
    { nameRu: "Культура и история", nameEn: "Culture & History" },
    { nameRu: "Горы", nameEn: "Mountains" },
    { nameRu: "Экзотика", nameEn: "Exotic" },
    { nameRu: "Романтика", nameEn: "Romance" },
    { nameRu: "Приключения", nameEn: "Adventures" },
  ]).returning();

  const [beach, culture, mountains, exotic, romance, adventures] = catRows;

  const pcRows = await db.insert(priceComponents).values([
    { nameRu: "Авиаперелёт", nameEn: "Flights" },
    { nameRu: "Проживание", nameEn: "Accommodation" },
    { nameRu: "Питание", nameEn: "Meals" },
    { nameRu: "Трансфер", nameEn: "Transfer" },
    { nameRu: "Экскурсии", nameEn: "Excursions" },
  ]).returning();

  const tourData = [
    {
      titleRu: "Романтический Санторини",
      titleEn: "Romantic Santorini",
      descriptionRu: "Откройте для себя магию греческого острова Санторини. Белоснежные дома, синие купола церквей, потрясающие закаты над Эгейским морем и незабываемые моменты в одном из красивейших мест на земле.",
      descriptionEn: "Discover the magic of the Greek island of Santorini. White houses, blue church domes, stunning sunsets over the Aegean Sea and unforgettable moments in one of the most beautiful places on earth.",
      countryId: greece.id,
      cityId: santorini.id,
      categoryId: romance.id,
      duration: 7,
      basePrice: "1290",
      discountPercent: 0,
      mainImage: TOUR_IMAGES[0],
      images: [TOUR_IMAGES[0], TOUR_IMAGES[5], TOUR_IMAGES[7]],
      isHot: false,
      isFeatured: true,
      isActive: true,
      includedRu: "Авиаперелёт Москва-Афины-Москва\nПроживание в 4* отеле 7 ночей\nЗавтраки ежедневно\nТрансфер из аэропорта\nЭкскурсия по острову",
      includedEn: "Round trip flights Moscow-Athens\n7 nights in 4* hotel\nDaily breakfasts\nAirport transfers\nIsland tour",
      notIncludedRu: "Виза (не требуется для РФ)\nМедицинская страховка\nЛичные расходы",
      notIncludedEn: "Visa (not required)\nTravel insurance\nPersonal expenses",
    },
    {
      titleRu: "Экзотический Бали",
      titleEn: "Exotic Bali",
      descriptionRu: "Бали — остров богов, где уникальная культура встречается с тропической природой. Рисовые террасы, храмы, сёрфинг, спа-процедуры и великолепная кухня ждут вас на этом волшебном острове.",
      descriptionEn: "Bali — the island of gods, where unique culture meets tropical nature. Rice terraces, temples, surfing, spa treatments and superb cuisine await you on this magical island.",
      countryId: indonesia.id,
      cityId: bali.id,
      categoryId: beach.id,
      duration: 10,
      basePrice: "1490",
      discountPercent: 15,
      mainImage: TOUR_IMAGES[1],
      images: [TOUR_IMAGES[1], TOUR_IMAGES[4], TOUR_IMAGES[7]],
      isHot: true,
      isFeatured: true,
      isActive: true,
      includedRu: "Авиаперелёт Москва-Денпасар-Москва\nПроживание на вилле 10 ночей\nЗавтраки и ужины\nТрансфер\nЭкскурсия на Убуд",
      includedEn: "Round trip flights\n10 nights villa stay\nBreakfasts and dinners\nTransfers\nUbud tour",
      notIncludedRu: "Виза по прилёту ($35)\nСтраховка\nЛичные расходы",
      notIncludedEn: "Visa on arrival ($35)\nInsurance\nPersonal expenses",
    },
    {
      titleRu: "Швейцарские Альпы",
      titleEn: "Swiss Alps",
      descriptionRu: "Исследуйте величественные Швейцарские Альпы. Горные деревушки, кристальные озёра, Женева и незабываемые виды — это путешествие оставит вас в восхищении от красоты природы.",
      descriptionEn: "Explore the majestic Swiss Alps. Mountain villages, crystal lakes, Geneva and unforgettable views — this journey will leave you in awe of nature's beauty.",
      countryId: switzerland.id,
      cityId: geneva.id,
      categoryId: mountains.id,
      duration: 8,
      basePrice: "2190",
      discountPercent: 0,
      mainImage: TOUR_IMAGES[2],
      images: [TOUR_IMAGES[2], TOUR_IMAGES[7]],
      isHot: false,
      isFeatured: true,
      isActive: true,
      includedRu: "Авиаперелёт Москва-Женева-Москва\nПроживание в 4* отеле 8 ночей\nЗавтраки ежедневно\nЖД-проездной по Швейцарии",
      includedEn: "Round trip flights\n8 nights in 4* hotel\nDaily breakfasts\nSwiss rail pass",
      notIncludedRu: "Виза Шенген\nСтраховка\nОбеды и ужины",
      notIncludedEn: "Schengen visa\nInsurance\nLunches and dinners",
    },
    {
      titleRu: "Страна восходящего солнца — Япония",
      titleEn: "Land of the Rising Sun — Japan",
      descriptionRu: "Погрузитесь в мир японской культуры: токийские небоскрёбы и традиционные храмы Киото, сакура и суши, гора Фудзи и чайные церемонии. Японий полон контрастов!",
      descriptionEn: "Immerse yourself in Japanese culture: Tokyo skyscrapers and traditional Kyoto temples, cherry blossoms and sushi, Mount Fuji and tea ceremonies. Japan is full of contrasts!",
      countryId: japan.id,
      cityId: tokyo.id,
      categoryId: culture.id,
      duration: 12,
      basePrice: "2890",
      discountPercent: 10,
      mainImage: TOUR_IMAGES[3],
      images: [TOUR_IMAGES[3], TOUR_IMAGES[7]],
      isHot: true,
      isFeatured: true,
      isActive: true,
      includedRu: "Авиаперелёт Москва-Токио-Москва\nПроживание в 4* отелях 12 ночей\nЗавтраки ежедневно\nJR Pass на 7 дней\nЭкскурсии в Токио и Киото",
      includedEn: "Round trip flights\n12 nights in 4* hotels\nDaily breakfasts\n7-day JR Pass\nTours in Tokyo and Kyoto",
      notIncludedRu: "Виза (безвизовый въезд для РФ)\nСтраховка\nОбеды и ужины",
      notIncludedEn: "Visa-free entry\nInsurance\nLunches and dinners",
    },
    {
      titleRu: "Рай на Мальдивах",
      titleEn: "Paradise in Maldives",
      descriptionRu: "Бирюзовые воды, коралловые рифы, белоснежный песок и роскошные бунгало над водой — Мальдивы воплощают идеал тропического рая. Идеально для медового месяца и романтического отдыха.",
      descriptionEn: "Turquoise waters, coral reefs, white sand and luxury overwater bungalows — the Maldives embody the ideal tropical paradise. Perfect for honeymoons and romantic getaways.",
      countryId: maldives.id,
      cityId: male.id,
      categoryId: beach.id,
      duration: 9,
      basePrice: "3490",
      discountPercent: 0,
      mainImage: TOUR_IMAGES[4],
      images: [TOUR_IMAGES[4], TOUR_IMAGES[7]],
      isHot: false,
      isFeatured: false,
      isActive: true,
      includedRu: "Авиаперелёт Москва-Мале-Москва\nПроживание в бунгало над водой 9 ночей\nПолный пансион\nСпидботы\nДайвинг (1 погружение)",
      includedEn: "Round trip flights\n9 nights overwater bungalow\nAll inclusive\nSpeedboats\nDiving (1 dive)",
      notIncludedRu: "Страховка\nАлкоголь\nДополнительные активности",
      notIncludedEn: "Insurance\nAlcohol\nExtra activities",
    },
    {
      titleRu: "Романтичный Париж",
      titleEn: "Romantic Paris",
      descriptionRu: "Эйфелева башня, Лувр, прогулки по Монмартру, круиз по Сене — Париж, город любви, откроет вам свои лучшие секреты. Искусство, мода, кухня и история в одном путешествии.",
      descriptionEn: "Eiffel Tower, Louvre, walks through Montmartre, cruise on the Seine — Paris, the city of love, will reveal its best secrets. Art, fashion, cuisine and history in one trip.",
      countryId: france.id,
      cityId: paris.id,
      categoryId: culture.id,
      duration: 6,
      basePrice: "1890",
      discountPercent: 20,
      mainImage: TOUR_IMAGES[5],
      images: [TOUR_IMAGES[5], TOUR_IMAGES[0], TOUR_IMAGES[7]],
      isHot: true,
      isFeatured: true,
      isActive: true,
      includedRu: "Авиаперелёт Москва-Париж-Москва\nПроживание в 4* отеле 6 ночей\nЗавтраки ежедневно\nТрансфер из аэропорта\nВходные билеты в Лувр",
      includedEn: "Round trip flights\n6 nights in 4* hotel\nDaily breakfasts\nAirport transfers\nLouvre tickets",
      notIncludedRu: "Виза Шенген\nСтраховка\nОбеды и ужины",
      notIncludedEn: "Schengen visa\nInsurance\nLunches and dinners",
    },
    {
      titleRu: "Мистическое Перу — Мачу-Пикчу",
      titleEn: "Mystical Peru — Machu Picchu",
      descriptionRu: "Следуйте тропой инков к знаменитому Мачу-Пикчу — одному из семи чудес света. Амазонские джунгли, озеро Титикака, Лима с её гастрономией — незабываемое приключение в Южной Америке.",
      descriptionEn: "Follow the Inca Trail to the famous Machu Picchu — one of the seven wonders of the world. Amazon jungle, Lake Titicaca, Lima gastronomy — an unforgettable South American adventure.",
      countryId: peru.id,
      cityId: lima.id,
      categoryId: adventures.id,
      duration: 14,
      basePrice: "2590",
      discountPercent: 0,
      mainImage: TOUR_IMAGES[6],
      images: [TOUR_IMAGES[6], TOUR_IMAGES[7]],
      isHot: false,
      isFeatured: false,
      isActive: true,
      includedRu: "Авиаперелёт Москва-Лима-Москва\nПроживание в 4* отелях 14 ночей\nЗавтраки\nЭкскурсия в Мачу-Пикчу\nТрансферы",
      includedEn: "Round trip flights\n14 nights in 4* hotels\nBreakfasts\nMachu Picchu tour\nTransfers",
      notIncludedRu: "Виза\nСтраховка\nОбеды и ужины",
      notIncludedEn: "Visa\nInsurance\nLunches and dinners",
    },
    {
      titleRu: "Культура Киото",
      titleEn: "Kyoto Culture",
      descriptionRu: "Старая столица Японии, Киото, хранит более 1600 буддийских храмов и синтоистских святилищ. Чайные церемонии, гейши в квартале Гион, золотой павильон Кинкакудзи — история на каждом шагу.",
      descriptionEn: "Japan's ancient capital, Kyoto, houses over 1,600 Buddhist temples and Shinto shrines. Tea ceremonies, geishas in Gion district, the golden Kinkakuji pavilion — history at every step.",
      countryId: japan.id,
      cityId: kyoto.id,
      categoryId: culture.id,
      duration: 8,
      basePrice: "2490",
      discountPercent: 5,
      mainImage: TOUR_IMAGES[3],
      images: [TOUR_IMAGES[3], TOUR_IMAGES[2]],
      isHot: false,
      isFeatured: false,
      isActive: true,
      includedRu: "Авиаперелёт Москва-Осака-Москва\nПроживание в рёкане 8 ночей\nЗавтраки ежедневно\nЧайная церемония",
      includedEn: "Round trip flights\n8 nights in ryokan\nDaily breakfasts\nTea ceremony",
      notIncludedRu: "Страховка\nОбеды и ужины\nЛичные расходы",
      notIncludedEn: "Insurance\nLunches and dinners\nPersonal expenses",
    },
  ];

  const insertedTours = await db.insert(tours).values(tourData as any).returning();

  const now = new Date();
  for (const tour of insertedTours) {
    const d1 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const d2 = new Date(d1.getTime() + tour.duration * 24 * 60 * 60 * 1000);
    const d3 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const d4 = new Date(d3.getTime() + tour.duration * 24 * 60 * 60 * 1000);

    await db.insert(tourDates).values([
      { tourId: tour.id, startDate: d1, endDate: d2, maxPeople: 15, bookedCount: 3 },
      { tourId: tour.id, startDate: d3, endDate: d4, maxPeople: 20, bookedCount: 0 },
    ]);

    await db.insert(tourOptions).values([
      { tourId: tour.id, nameRu: "Страховая защита", nameEn: "Travel Insurance", price: "89" },
      { tourId: tour.id, nameRu: "Трансфер бизнес-класс", nameEn: "Business Class Transfer", price: "150" },
    ]);

    await db.insert(tourItinerary).values([
      {
        tourId: tour.id,
        dayNumber: 1,
        titleRu: "Прибытие и заселение",
        titleEn: "Arrival and check-in",
        descriptionRu: "Встреча в аэропорту, трансфер в отель, заселение. Вечерняя прогулка по окрестностям.",
        descriptionEn: "Airport meeting, hotel transfer, check-in. Evening walk around the area.",
        durationHours: 8,
      },
      {
        tourId: tour.id,
        dayNumber: 2,
        titleRu: "Знакомство с достопримечательностями",
        titleEn: "Sightseeing",
        descriptionRu: "Обзорная экскурсия по главным достопримечательностям. Обед в местном ресторане.",
        descriptionEn: "Guided tour of main attractions. Lunch at a local restaurant.",
        durationHours: 10,
      },
    ]);
  }

  const [feedHot, feedFeatured, feedAll] = await db.insert(tourFeeds).values([
    { nameRu: "🔥 Горящие туры", nameEn: "🔥 Hot Deals", order: 1, isActive: true },
    { nameRu: "⭐ Рекомендуемые", nameEn: "⭐ Featured Tours", order: 2, isActive: true },
    { nameRu: "🌍 Все направления", nameEn: "🌍 All Destinations", order: 3, isActive: true },
  ]).returning();

  const hotTours = insertedTours.filter(t => t.isHot);
  const featuredTours = insertedTours.filter(t => t.isFeatured);

  for (let i = 0; i < hotTours.length; i++) {
    await db.insert(tourFeedItems).values({ feedId: feedHot.id, tourId: hotTours[i].id, order: i });
  }
  for (let i = 0; i < featuredTours.length; i++) {
    await db.insert(tourFeedItems).values({ feedId: feedFeatured.id, tourId: featuredTours[i].id, order: i });
  }
  for (let i = 0; i < Math.min(6, insertedTours.length); i++) {
    await db.insert(tourFeedItems).values({ feedId: feedAll.id, tourId: insertedTours[i].id, order: i });
  }

  await db.insert(heroSlides).values([
    {
      titleRu: "Откройте мир путешествий",
      titleEn: "Discover the World",
      subtitleRu: "Лучшие туры по всему миру по доступным ценам",
      subtitleEn: "Best tours worldwide at affordable prices",
      buttonTextRu: "Найти тур",
      buttonTextEn: "Find a Tour",
      buttonLink: "/tours",
      mediaUrl: "/images/hero-banner.png",
      mediaType: "image",
      order: 1,
      isActive: true,
    },
    {
      titleRu: "Горящие предложения!",
      titleEn: "Hot Deals!",
      subtitleRu: "Скидки до 20% на популярные направления",
      subtitleEn: "Up to 20% off on popular destinations",
      buttonTextRu: "Смотреть акции",
      buttonTextEn: "View Deals",
      buttonLink: "/promotions",
      mediaUrl: "/images/tour-bali.png",
      mediaType: "image",
      order: 2,
      isActive: true,
    },
  ]);

  await db.insert(banners).values([
    {
      titleRu: "Специальное предложение: Бали со скидкой 15%!",
      titleEn: "Special Offer: Bali 15% off!",
      imageUrl: "/images/tour-bali.png",
      linkUrl: "/promotions",
      order: 1,
      isActive: true,
    },
    {
      titleRu: "Раннее бронирование — сэкономьте до 25%",
      titleEn: "Early Booking — Save up to 25%",
      imageUrl: "/images/tour-paris.png",
      linkUrl: "/tours",
      order: 2,
      isActive: true,
    },
  ]);

  await db.insert(news).values([
    {
      titleRu: "Топ-5 направлений лета 2024",
      titleEn: "Top 5 Summer 2024 Destinations",
      contentRu: "Лето 2024 обещает быть насыщенным на путешествия! Мы собрали для вас лучшие направления, которые стоит посетить этим летом.\n\n1. Санторини, Греция — невероятные закаты и белоснежная архитектура.\n\n2. Бали, Индонезия — тропический рай для любителей природы и культуры.\n\n3. Париж, Франция — вечная романтика и искусство.\n\n4. Токио, Япония — будущее и традиции в одном городе.\n\n5. Мальдивы — идеальный пляжный отдых.",
      contentEn: "Summer 2024 promises to be full of travel opportunities! We have gathered the best destinations worth visiting this summer.\n\n1. Santorini, Greece — incredible sunsets and white architecture.\n\n2. Bali, Indonesia — a tropical paradise for nature and culture lovers.\n\n3. Paris, France — eternal romance and art.\n\n4. Tokyo, Japan — future and tradition in one city.\n\n5. Maldives — perfect beach vacation.",
      imageUrl: "/images/tour-santorini.png",
      isPublished: true,
    },
    {
      titleRu: "Советы опытного путешественника",
      titleEn: "Tips from an Experienced Traveler",
      contentRu: "Опытные путешественники знают, как сделать любую поездку комфортнее и дешевле. Вот несколько проверенных советов.\n\nБронируйте заранее — ранее бронирование может сэкономить до 40% стоимости тура.\n\nПакуйте разумно — список необходимых вещей поможет не взять лишнего.\n\nИзучайте культуру — знание местных обычаев сделает путешествие богаче.\n\nВсегда берите страховку — это небольшие расходы, которые могут спасти вас в непредвиденных ситуациях.",
      contentEn: "Experienced travelers know how to make any trip more comfortable and affordable. Here are some proven tips.\n\nBook early — early booking can save up to 40% of tour costs.\n\nPack wisely — a packing list helps avoid unnecessary items.\n\nLearn the culture — knowing local customs enriches travel.\n\nAlways get insurance — a small expense that can save you in unforeseen situations.",
      imageUrl: "/images/tour-swiss.png",
      isPublished: true,
    },
    {
      titleRu: "Новый сезон в Японии: сакура 2024",
      titleEn: "New Season in Japan: Cherry Blossom 2024",
      contentRu: "Весенний сезон в Японии — это время цветения сакуры, одного из самых завораживающих природных явлений в мире. В 2024 году прогнозируется особенно красивое цветение. Лучшие места для наблюдения: парк Уэно в Токио, Философская тропа в Киото, замок Химэдзи.",
      contentEn: "Spring season in Japan is cherry blossom time, one of the most mesmerizing natural phenomena in the world. 2024 forecasts particularly beautiful blooming. Best viewing spots: Ueno Park in Tokyo, Philosopher's Path in Kyoto, Himeji Castle.",
      imageUrl: "/images/tour-tokyo.png",
      isPublished: true,
    },
  ]);

  const [userRecord] = await db.select().from(users).where(sql`email = 'user@travelpro.ru'`);

  if (userRecord && insertedTours.length > 0) {
    await db.insert(reviews).values([
      {
        userId: userRecord.id,
        tourId: insertedTours[0].id,
        rating: 5,
        textRu: "Потрясающее путешествие! Санторини — это сказка. Всё было организовано на высшем уровне, гид был замечательным. Рекомендую всем!",
        textEn: "Amazing trip! Santorini is a fairy tale. Everything was organized at the highest level, the guide was wonderful. I recommend it to everyone!",
        status: "approved",
        inFeaturedFeed: true,
      },
      {
        userId: userRecord.id,
        tourId: insertedTours[1].id,
        rating: 5,
        textRu: "Бали превзошёл все ожидания! Природа, культура, еда — всё на 10 из 10. TravelPro — лучшее агентство!",
        textEn: "Bali exceeded all expectations! Nature, culture, food — all 10 out of 10. TravelPro is the best agency!",
        status: "approved",
        inFeaturedFeed: true,
      },
      {
        userId: userRecord.id,
        tourId: insertedTours[2].id,
        rating: 4,
        textRu: "Великолепная Швейцария! Горы, озёра, шоколад — что ещё нужно для счастья? Отличная организация тура.",
        textEn: "Magnificent Switzerland! Mountains, lakes, chocolate — what else does happiness need? Excellent tour organization.",
        status: "approved",
        inFeaturedFeed: true,
      },
    ]);
  }

  await db.insert(introScreen).values({
    titleRu: "TravelPro",
    titleEn: "TravelPro",
    sloganRu: "Открой мир путешествий",
    sloganEn: "Discover the World",
    isActive: false,
  });

  console.log("[seed] Database seeded successfully!");
  console.log("[seed] Admin: admin@travelpro.ru / admin123");
  console.log("[seed] User: user@travelpro.ru / user123");
}
