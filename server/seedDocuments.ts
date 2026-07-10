import { db } from "./db";
import { documents } from "@shared/schema";
import { eq } from "drizzle-orm";

// Built-in documents that are linked from fixed places in the site (footer, About page,
// and their own /offer, /privacy, /terms routes). We ensure the records exist so admins
// can upload/replace their files, but we never overwrite an admin's edits.
const SYSTEM_DOCUMENTS = [
  {
    slug: "offer",
    titleRu: "Договор-оферта",
    titleEn: "Public Offer Agreement",
    descriptionRu: "Публичный договор на оказание туристических услуг",
    descriptionEn: "Public agreement for tourist services",
    sortOrder: 0,
  },
  {
    slug: "privacy",
    titleRu: "Политика конфиденциальности",
    titleEn: "Privacy Policy",
    descriptionRu: "Как мы обрабатываем и защищаем ваши данные",
    descriptionEn: "How we process and protect your data",
    sortOrder: 1,
  },
  {
    slug: "terms",
    titleRu: "Условия использования",
    titleEn: "Terms of Service",
    descriptionRu: "Правила пользования сервисом NEXT TOUR",
    descriptionEn: "Rules for using the NEXT TOUR service",
    sortOrder: 2,
  },
];

export async function seedDocuments() {
  for (const doc of SYSTEM_DOCUMENTS) {
    const [existing] = await db.select().from(documents).where(eq(documents.slug, doc.slug));
    if (!existing) {
      await db.insert(documents).values({ ...doc, isSystem: true });
      console.log(`[seed] Created system document '${doc.slug}'`);
    }
  }
}
