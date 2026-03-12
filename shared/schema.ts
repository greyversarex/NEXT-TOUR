import { sql } from "drizzle-orm";
import {
  pgTable, text, varchar, integer, boolean, timestamp, decimal, pgEnum, jsonb
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const loyaltyLevelEnum = pgEnum("loyalty_level", ["beginner", "traveler", "premium"]);
export const reviewStatusEnum = pgEnum("review_status", ["pending", "approved", "rejected"]);
export const bookingStatusEnum = pgEnum("booking_status", ["new", "prepaid", "paid", "cancelled"]);
export const paymentTypeEnum = pgEnum("payment_type", ["prepay", "full"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  password: text("password"),
  avatar: text("avatar"),
  provider: text("provider").notNull().default("local"),
  providerId: text("provider_id"),
  role: userRoleEnum("role").notNull().default("user"),
  loyaltyLevel: loyaltyLevelEnum("loyalty_level").notNull().default("beginner"),
  bookingsCount: integer("bookings_count").notNull().default(0),
  discountsLeft: integer("discounts_left").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const countries = pgTable("countries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameRu: text("name_ru").notNull(),
  nameEn: text("name_en").notNull(),
  imageUrl: text("image_url"),
  countryCode: varchar("country_code", { length: 2 }),
  tagsRu: text("tags_ru").array(),
  tagsEn: text("tags_en").array(),
  cardSize: varchar("card_size", { length: 10 }).notNull().default("normal"),
  showOnHome: boolean("show_on_home").notNull().default(false),
});

export const cities = pgTable("cities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryId: varchar("country_id").notNull().references(() => countries.id),
  nameRu: text("name_ru").notNull(),
  nameEn: text("name_en").notNull(),
  imageUrl: text("image_url"),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameRu: text("name_ru").notNull(),
  nameEn: text("name_en").notNull(),
});

export const tours = pgTable("tours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleRu: text("title_ru").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionRu: text("description_ru").notNull(),
  descriptionEn: text("description_en").notNull(),
  cityId: varchar("city_id").references(() => cities.id),
  countryId: varchar("country_id").references(() => countries.id),
  categoryId: varchar("category_id").references(() => categories.id),
  duration: integer("duration").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  discountPercent: integer("discount_percent").notNull().default(0),
  mainImage: text("main_image"),
  images: text("images").array().notNull().default(sql`'{}'`),
  isHot: boolean("is_hot").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  includedRu: text("included_ru"),
  includedEn: text("included_en"),
  notIncludedRu: text("not_included_ru"),
  notIncludedEn: text("not_included_en"),
  mapUrl: text("map_url"),
  customDatesTextRu: text("custom_dates_text_ru"),
  customDatesTextEn: text("custom_dates_text_en"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tourPriceTiers = pgTable("tour_price_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: varchar("tour_id").notNull().references(() => tours.id, { onDelete: "cascade" }),
  minPeople: integer("min_people").notNull(),
  maxPeople: integer("max_people").notNull(),
  pricePerPerson: decimal("price_per_person", { precision: 10, scale: 2 }).notNull(),
  labelRu: text("label_ru"),
  labelEn: text("label_en"),
});

export const tourDates = pgTable("tour_dates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: varchar("tour_id").notNull().references(() => tours.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  maxPeople: integer("max_people").notNull().default(20),
  bookedCount: integer("booked_count").notNull().default(0),
});

export const priceComponents = pgTable("price_components", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameRu: text("name_ru").notNull(),
  nameEn: text("name_en").notNull(),
});

export const tourPriceComponents = pgTable("tour_price_components", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: varchar("tour_id").notNull().references(() => tours.id),
  componentId: varchar("component_id").notNull().references(() => priceComponents.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  included: boolean("included").notNull().default(true),
});

export const tourOptions = pgTable("tour_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: varchar("tour_id").notNull().references(() => tours.id),
  nameRu: text("name_ru").notNull(),
  nameEn: text("name_en").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const tourItinerary = pgTable("tour_itinerary", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: varchar("tour_id").notNull().references(() => tours.id),
  dayNumber: integer("day_number").notNull(),
  titleRu: text("title_ru").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionRu: text("description_ru").notNull(),
  descriptionEn: text("description_en").notNull(),
  durationHours: integer("duration_hours"),
});

export const itineraryStops = pgTable("itinerary_stops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itineraryDayId: varchar("itinerary_day_id").notNull().references(() => tourItinerary.id, { onDelete: "cascade" }),
  stopOrder: integer("stop_order").notNull(),
  titleRu: text("title_ru").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionRu: text("description_ru").notNull().default(""),
  descriptionEn: text("description_en").notNull().default(""),
  durationMinutes: integer("duration_minutes"),
});

export const banners = pgTable("banners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleRu: text("title_ru").notNull(),
  titleEn: text("title_en").notNull(),
  subtitleRu: text("subtitle_ru"),
  subtitleEn: text("subtitle_en"),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const tourFeeds = pgTable("tour_feeds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameRu: text("name_ru").notNull(),
  nameEn: text("name_en").notNull(),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  cardWidth: varchar("card_width").notNull().default("medium"),
});

export const tourFeedItems = pgTable("tour_feed_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  feedId: varchar("feed_id").notNull().references(() => tourFeeds.id),
  tourId: varchar("tour_id").notNull().references(() => tours.id),
  order: integer("order").notNull().default(0),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tourId: varchar("tour_id").notNull().references(() => tours.id),
  rating: integer("rating").notNull(),
  textRu: text("text_ru").notNull(),
  textEn: text("text_en"),
  status: reviewStatusEnum("status").notNull().default("pending"),
  inFeaturedFeed: boolean("in_featured_feed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tourId: varchar("tour_id").notNull().references(() => tours.id),
  tourDateId: varchar("tour_date_id").references(() => tourDates.id),
  adults: integer("adults").notNull().default(1),
  children: integer("children").notNull().default(0),
  selectedOptions: jsonb("selected_options").notNull().default(sql`'[]'`),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  paymentType: paymentTypeEnum("payment_type").notNull(),
  bookingStatus: bookingStatusEnum("booking_status").notNull().default("new"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const news = pgTable("news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleRu: text("title_ru").notNull(),
  titleEn: text("title_en").notNull(),
  contentRu: text("content_ru").notNull(),
  contentEn: text("content_en").notNull(),
  imageUrl: text("image_url"),
  isPublished: boolean("is_published").notNull().default(true),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tourId: varchar("tour_id").notNull().references(() => tours.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const introScreen = pgTable("intro_screen", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleRu: text("title_ru").notNull(),
  titleEn: text("title_en").notNull(),
  sloganRu: text("slogan_ru").notNull(),
  sloganEn: text("slogan_en").notNull(),
  videoUrl: text("video_url"),
  isActive: boolean("is_active").notNull().default(true),
});

export const heroSlides = pgTable("hero_slides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleRu: text("title_ru").notNull(),
  titleEn: text("title_en").notNull(),
  subtitleRu: text("subtitle_ru"),
  subtitleEn: text("subtitle_en"),
  buttonTextRu: text("button_text_ru"),
  buttonTextEn: text("button_text_en"),
  buttonLink: text("button_link"),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").notNull().default("image"),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, loyaltyLevel: true, bookingsCount: true, discountsLeft: true }).extend({
  password: z.string().optional(),
  provider: z.string().optional(),
  providerId: z.string().optional(),
});
export const insertCountrySchema = createInsertSchema(countries).omit({ id: true });
export const insertCitySchema = createInsertSchema(cities).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertTourSchema = createInsertSchema(tours).omit({ id: true, createdAt: true });
export const insertTourPriceTierSchema = createInsertSchema(tourPriceTiers).omit({ id: true });
export const insertTourDateSchema = createInsertSchema(tourDates).omit({ id: true }).extend({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
export const insertPriceComponentSchema = createInsertSchema(priceComponents).omit({ id: true });
export const insertTourPriceComponentSchema = createInsertSchema(tourPriceComponents).omit({ id: true });
export const insertTourOptionSchema = createInsertSchema(tourOptions).omit({ id: true });
export const insertTourItinerarySchema = createInsertSchema(tourItinerary).omit({ id: true });
export const insertItineraryStopSchema = createInsertSchema(itineraryStops).omit({ id: true });
export const insertBannerSchema = createInsertSchema(banners).omit({ id: true });
export const insertTourFeedSchema = createInsertSchema(tourFeeds).omit({ id: true });
export const insertTourFeedItemSchema = createInsertSchema(tourFeedItems).omit({ id: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true, status: true, inFeaturedFeed: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, bookingStatus: true, paidAmount: true });
export const insertNewsSchema = createInsertSchema(news).omit({ id: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
export const insertIntroScreenSchema = createInsertSchema(introScreen).omit({ id: true });
export const insertHeroSlideSchema = createInsertSchema(heroSlides).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Country = typeof countries.$inferSelect;
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type City = typeof cities.$inferSelect;
export type InsertCity = z.infer<typeof insertCitySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Tour = typeof tours.$inferSelect;
export type InsertTour = z.infer<typeof insertTourSchema>;
export type TourPriceTier = typeof tourPriceTiers.$inferSelect;
export type InsertTourPriceTier = z.infer<typeof insertTourPriceTierSchema>;
export type TourDate = typeof tourDates.$inferSelect;
export type InsertTourDate = z.infer<typeof insertTourDateSchema>;
export type PriceComponent = typeof priceComponents.$inferSelect;
export type InsertPriceComponent = z.infer<typeof insertPriceComponentSchema>;
export type TourPriceComponent = typeof tourPriceComponents.$inferSelect;
export type TourOption = typeof tourOptions.$inferSelect;
export type InsertTourOption = z.infer<typeof insertTourOptionSchema>;
export type TourItinerary = typeof tourItinerary.$inferSelect;
export type ItineraryStop = typeof itineraryStops.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type TourFeed = typeof tourFeeds.$inferSelect;
export type TourFeedItem = typeof tourFeedItems.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type IntroScreen = typeof introScreen.$inferSelect;
export type HeroSlide = typeof heroSlides.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type Settings = typeof settings.$inferSelect;

export interface AnalyticsData {
  totalBookings: number;
  totalTourists: number;
  totalRevenue: number;
  prepaidRevenue: number;
  fullRevenue: number;
  revenueByDay: Array<{ date: string; revenue: number; bookings: number }>;
  revenueByMonth: Array<{ month: string; revenue: number; bookings: number }>;
  topTours: Array<{ tourId: string; titleRu: string; titleEn: string; bookings: number; tourists: number; revenue: number }>;
  topCountries: Array<{ countryId: string; nameRu: string; nameEn: string; tourists: number; revenue: number }>;
}

export interface LoyaltySettings {
  beginner: { minBookings: number; discount: number };
  traveler: { minBookings: number; discount: number; discountCount: number };
  premium: { minBookings: number; discount: number };
}
