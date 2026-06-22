import { db } from "./db";
import { countries, banners } from "@shared/schema";
import { eq } from "drizzle-orm";

const HOME_COUNTRIES = [
  { nameRu: "Греция", nameEn: "Greece", imageUrl: "/images/tour-santorini.png" },
  { nameRu: "Индонезия", nameEn: "Indonesia", imageUrl: "/images/tour-bali.png" },
  { nameRu: "Швейцария", nameEn: "Switzerland", imageUrl: "/images/tour-swiss.png" },
  { nameRu: "Япония", nameEn: "Japan", imageUrl: "/images/tour-tokyo.png" },
  { nameRu: "Мальдивы", nameEn: "Maldives", imageUrl: "/images/tour-maldives.png" },
  { nameRu: "Франция", nameEn: "France", imageUrl: "/images/tour-paris.png" },
  { nameRu: "Перу", nameEn: "Peru", imageUrl: "/images/tour-peru.png" },
];

const HOME_BANNERS = [
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
];

async function seedHomeContent() {
  console.log("[seed-home] Начинаю добавление контента для главной страницы...");

  let countriesAdded = 0;
  let countriesShown = 0;
  for (const c of HOME_COUNTRIES) {
    const existing = await db.select().from(countries).where(eq(countries.nameRu, c.nameRu));
    if (existing.length === 0) {
      await db.insert(countries).values({ ...c, showOnHome: true });
      countriesAdded++;
      console.log(`[seed-home] + Добавлена страна: ${c.nameRu}`);
    } else {
      const row = existing[0];
      if (!row.showOnHome) {
        await db.update(countries).set({ showOnHome: true }).where(eq(countries.id, row.id));
        countriesShown++;
        console.log(`[seed-home] ~ Страна уже была, включил показ на главной: ${c.nameRu}`);
      } else {
        console.log(`[seed-home] = Страна уже есть и показывается, пропускаю: ${c.nameRu}`);
      }
    }
  }

  let bannersAdded = 0;
  for (const b of HOME_BANNERS) {
    const existing = await db.select().from(banners).where(eq(banners.titleRu, b.titleRu));
    if (existing.length === 0) {
      await db.insert(banners).values(b);
      bannersAdded++;
      console.log(`[seed-home] + Добавлен баннер: ${b.titleRu}`);
    } else {
      console.log(`[seed-home] = Баннер уже есть, пропускаю: ${b.titleRu}`);
    }
  }

  console.log(
    `[seed-home] Готово. Стран добавлено: ${countriesAdded}, включено на главной: ${countriesShown}, баннеров добавлено: ${bannersAdded}.`,
  );
}

seedHomeContent()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("[seed-home] Ошибка:", e);
    process.exit(1);
  });
