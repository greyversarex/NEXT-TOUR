import { db } from "./db";
import { eq, and, desc, asc, ilike, or, inArray, sql, ne } from "drizzle-orm";
import {
  users, countries, cities, categories, tours, tourDates,
  priceComponents, tourPriceComponents, tourOptions, tourItinerary,
  banners, tourFeeds, tourFeedItems, reviews, bookings, news,
  favorites, introScreen, heroSlides,
  type User, type InsertUser, type Country, type InsertCountry,
  type City, type InsertCity, type Category, type InsertCategory,
  type Tour, type InsertTour, type TourDate, type InsertTourDate,
  type PriceComponent, type InsertPriceComponent, type TourPriceComponent,
  type TourOption, type InsertTourOption, type TourItinerary,
  type Banner, type InsertBanner, type TourFeed, type TourFeedItem,
  type Review, type InsertReview, type Booking, type InsertBooking,
  type News, type InsertNews, type Favorite, type IntroScreen, type HeroSlide,
} from "@shared/schema";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Countries
  getCountries(): Promise<Country[]>;
  getCountry(id: string): Promise<Country | undefined>;
  createCountry(data: InsertCountry): Promise<Country>;
  updateCountry(id: string, data: Partial<Country>): Promise<Country | undefined>;
  deleteCountry(id: string): Promise<void>;

  // Cities
  getCities(countryId?: string): Promise<City[]>;
  getCity(id: string): Promise<City | undefined>;
  createCity(data: InsertCity): Promise<City>;
  updateCity(id: string, data: Partial<City>): Promise<City | undefined>;
  deleteCity(id: string): Promise<void>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(data: InsertCategory): Promise<Category>;
  updateCategory(id: string, data: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;

  // Tours
  getTours(filters?: { countryId?: string; cityId?: string; categoryId?: string; search?: string; minPrice?: number; maxPrice?: number; duration?: number; isHot?: boolean }): Promise<Tour[]>;
  getTour(id: string): Promise<Tour | undefined>;
  createTour(data: InsertTour): Promise<Tour>;
  updateTour(id: string, data: Partial<Tour>): Promise<Tour | undefined>;
  deleteTour(id: string): Promise<void>;

  // Tour Dates
  getTourDates(tourId: string): Promise<TourDate[]>;
  createTourDate(data: InsertTourDate): Promise<TourDate>;
  updateTourDate(id: string, data: Partial<TourDate>): Promise<TourDate | undefined>;
  deleteTourDate(id: string): Promise<void>;

  // Price Components
  getPriceComponents(): Promise<PriceComponent[]>;
  createPriceComponent(data: InsertPriceComponent): Promise<PriceComponent>;
  updatePriceComponent(id: string, data: Partial<PriceComponent>): Promise<PriceComponent | undefined>;
  deletePriceComponent(id: string): Promise<void>;

  // Tour Price Components
  getTourPriceComponents(tourId: string): Promise<(TourPriceComponent & { component: PriceComponent })[]>;
  setTourPriceComponents(tourId: string, components: { componentId: string; price: number; included: boolean }[]): Promise<void>;

  // Tour Options
  getTourOptions(tourId: string): Promise<TourOption[]>;
  createTourOption(data: InsertTourOption): Promise<TourOption>;
  updateTourOption(id: string, data: Partial<TourOption>): Promise<TourOption | undefined>;
  deleteTourOption(id: string): Promise<void>;

  // Tour Itinerary
  getTourItinerary(tourId: string): Promise<TourItinerary[]>;
  createItineraryItem(data: any): Promise<TourItinerary>;
  updateItineraryItem(id: string, data: Partial<TourItinerary>): Promise<TourItinerary | undefined>;
  deleteItineraryItem(id: string): Promise<void>;

  // Banners
  getBanners(activeOnly?: boolean): Promise<Banner[]>;
  createBanner(data: InsertBanner): Promise<Banner>;
  updateBanner(id: string, data: Partial<Banner>): Promise<Banner | undefined>;
  deleteBanner(id: string): Promise<void>;

  // Tour Feeds
  getTourFeeds(activeOnly?: boolean): Promise<TourFeed[]>;
  getTourFeed(id: string): Promise<TourFeed | undefined>;
  createTourFeed(data: any): Promise<TourFeed>;
  updateTourFeed(id: string, data: Partial<TourFeed>): Promise<TourFeed | undefined>;
  deleteTourFeed(id: string): Promise<void>;
  getTourFeedItems(feedId: string): Promise<(TourFeedItem & { tour: Tour })[]>;
  addTourToFeed(feedId: string, tourId: string): Promise<TourFeedItem>;
  removeTourFromFeed(feedId: string, tourId: string): Promise<void>;

  // Reviews
  getReviews(tourId?: string, status?: string): Promise<(Review & { user: Pick<User, "id" | "name" | "avatar"> })[]>;
  getFeaturedReviews(): Promise<(Review & { user: Pick<User, "id" | "name" | "avatar">; tour: Pick<Tour, "id" | "titleRu" | "titleEn"> })[]>;
  createReview(data: InsertReview): Promise<Review>;
  updateReviewStatus(id: string, status: "approved" | "rejected", inFeatured?: boolean): Promise<Review | undefined>;

  // Bookings
  getBookings(userId?: string): Promise<(Booking & { tour: Tour; tourDate?: TourDate })[]>;
  getBooking(id: string): Promise<(Booking & { tour: Tour; tourDate?: TourDate }) | undefined>;
  createBooking(data: InsertBooking): Promise<Booking>;
  updateBooking(id: string, data: Partial<Booking>): Promise<Booking | undefined>;

  // News
  getNews(publishedOnly?: boolean): Promise<News[]>;
  getNewsItem(id: string): Promise<News | undefined>;
  createNews(data: InsertNews): Promise<News>;
  updateNews(id: string, data: Partial<News>): Promise<News | undefined>;
  deleteNews(id: string): Promise<void>;

  // Favorites
  getFavorites(userId: string): Promise<(Favorite & { tour: Tour })[]>;
  toggleFavorite(userId: string, tourId: string): Promise<boolean>;
  isFavorite(userId: string, tourId: string): Promise<boolean>;

  // Intro Screen
  getIntroScreen(): Promise<IntroScreen | undefined>;
  upsertIntroScreen(data: any): Promise<IntroScreen>;

  // Hero Slides
  getHeroSlides(activeOnly?: boolean): Promise<HeroSlide[]>;
  createHeroSlide(data: any): Promise<HeroSlide>;
  updateHeroSlide(id: string, data: Partial<HeroSlide>): Promise<HeroSlide | undefined>;
  deleteHeroSlide(id: string): Promise<void>;

  // Stats
  getStats(): Promise<{ tours: number; bookings: number; users: number; revenue: string }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(data: InsertUser) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const [user] = await db.insert(users).values({ ...data, password: hashedPassword }).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async getAllUsers() {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getCountries() {
    return db.select().from(countries).orderBy(asc(countries.nameEn));
  }

  async getCountry(id: string) {
    const [c] = await db.select().from(countries).where(eq(countries.id, id));
    return c;
  }

  async createCountry(data: InsertCountry) {
    const [c] = await db.insert(countries).values(data).returning();
    return c;
  }

  async updateCountry(id: string, data: Partial<Country>) {
    const [c] = await db.update(countries).set(data).where(eq(countries.id, id)).returning();
    return c;
  }

  async deleteCountry(id: string) {
    await db.delete(countries).where(eq(countries.id, id));
  }

  async getCities(countryId?: string) {
    const q = db.select().from(cities);
    if (countryId) return q.where(eq(cities.countryId, countryId)).orderBy(asc(cities.nameEn));
    return q.orderBy(asc(cities.nameEn));
  }

  async getCity(id: string) {
    const [c] = await db.select().from(cities).where(eq(cities.id, id));
    return c;
  }

  async createCity(data: InsertCity) {
    const [c] = await db.insert(cities).values(data).returning();
    return c;
  }

  async updateCity(id: string, data: Partial<City>) {
    const [c] = await db.update(cities).set(data).where(eq(cities.id, id)).returning();
    return c;
  }

  async deleteCity(id: string) {
    await db.delete(cities).where(eq(cities.id, id));
  }

  async getCategories() {
    return db.select().from(categories).orderBy(asc(categories.nameEn));
  }

  async getCategory(id: string) {
    const [c] = await db.select().from(categories).where(eq(categories.id, id));
    return c;
  }

  async createCategory(data: InsertCategory) {
    const [c] = await db.insert(categories).values(data).returning();
    return c;
  }

  async updateCategory(id: string, data: Partial<Category>) {
    const [c] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return c;
  }

  async deleteCategory(id: string) {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getTours(filters?: { countryId?: string; cityId?: string; categoryId?: string; search?: string; minPrice?: number; maxPrice?: number; duration?: number; isHot?: boolean }) {
    let q = db.select().from(tours).where(eq(tours.isActive, true));
    const conditions = [eq(tours.isActive, true)];
    if (filters?.countryId) conditions.push(eq(tours.countryId, filters.countryId));
    if (filters?.cityId) conditions.push(eq(tours.cityId, filters.cityId));
    if (filters?.categoryId) conditions.push(eq(tours.categoryId, filters.categoryId));
    if (filters?.isHot) conditions.push(eq(tours.isHot, true));
    if (filters?.duration) conditions.push(eq(tours.duration, filters.duration));
    if (filters?.search) {
      conditions.push(or(
        ilike(tours.titleRu, `%${filters.search}%`),
        ilike(tours.titleEn, `%${filters.search}%`),
      )!);
    }
    return db.select().from(tours).where(and(...conditions)).orderBy(desc(tours.createdAt));
  }

  async getTour(id: string) {
    const [t] = await db.select().from(tours).where(eq(tours.id, id));
    return t;
  }

  async createTour(data: InsertTour) {
    const [t] = await db.insert(tours).values(data as any).returning();
    return t;
  }

  async updateTour(id: string, data: Partial<Tour>) {
    const [t] = await db.update(tours).set(data as any).where(eq(tours.id, id)).returning();
    return t;
  }

  async deleteTour(id: string) {
    await db.update(tours).set({ isActive: false }).where(eq(tours.id, id));
  }

  async getTourDates(tourId: string) {
    return db.select().from(tourDates).where(eq(tourDates.tourId, tourId)).orderBy(asc(tourDates.startDate));
  }

  async createTourDate(data: InsertTourDate) {
    const [d] = await db.insert(tourDates).values(data as any).returning();
    return d;
  }

  async updateTourDate(id: string, data: Partial<TourDate>) {
    const [d] = await db.update(tourDates).set(data as any).where(eq(tourDates.id, id)).returning();
    return d;
  }

  async deleteTourDate(id: string) {
    await db.delete(tourDates).where(eq(tourDates.id, id));
  }

  async getPriceComponents() {
    return db.select().from(priceComponents).orderBy(asc(priceComponents.nameEn));
  }

  async createPriceComponent(data: InsertPriceComponent) {
    const [c] = await db.insert(priceComponents).values(data).returning();
    return c;
  }

  async updatePriceComponent(id: string, data: Partial<PriceComponent>) {
    const [c] = await db.update(priceComponents).set(data).where(eq(priceComponents.id, id)).returning();
    return c;
  }

  async deletePriceComponent(id: string) {
    await db.delete(priceComponents).where(eq(priceComponents.id, id));
  }

  async getTourPriceComponents(tourId: string) {
    const items = await db.select().from(tourPriceComponents)
      .leftJoin(priceComponents, eq(tourPriceComponents.componentId, priceComponents.id))
      .where(eq(tourPriceComponents.tourId, tourId));
    return items.map(i => ({ ...i.tour_price_components, component: i.price_components! }));
  }

  async setTourPriceComponents(tourId: string, components: { componentId: string; price: number; included: boolean }[]) {
    await db.delete(tourPriceComponents).where(eq(tourPriceComponents.tourId, tourId));
    if (components.length > 0) {
      await db.insert(tourPriceComponents).values(components.map(c => ({
        tourId,
        componentId: c.componentId,
        price: String(c.price),
        included: c.included,
      })));
    }
  }

  async getTourOptions(tourId: string) {
    return db.select().from(tourOptions).where(eq(tourOptions.tourId, tourId));
  }

  async createTourOption(data: InsertTourOption) {
    const [o] = await db.insert(tourOptions).values(data as any).returning();
    return o;
  }

  async updateTourOption(id: string, data: Partial<TourOption>) {
    const [o] = await db.update(tourOptions).set(data as any).where(eq(tourOptions.id, id)).returning();
    return o;
  }

  async deleteTourOption(id: string) {
    await db.delete(tourOptions).where(eq(tourOptions.id, id));
  }

  async getTourItinerary(tourId: string) {
    return db.select().from(tourItinerary)
      .where(eq(tourItinerary.tourId, tourId))
      .orderBy(asc(tourItinerary.dayNumber));
  }

  async createItineraryItem(data: any) {
    const [i] = await db.insert(tourItinerary).values(data).returning();
    return i;
  }

  async updateItineraryItem(id: string, data: Partial<TourItinerary>) {
    const [i] = await db.update(tourItinerary).set(data).where(eq(tourItinerary.id, id)).returning();
    return i;
  }

  async deleteItineraryItem(id: string) {
    await db.delete(tourItinerary).where(eq(tourItinerary.id, id));
  }

  async getBanners(activeOnly = false) {
    if (activeOnly) {
      return db.select().from(banners).where(eq(banners.isActive, true)).orderBy(asc(banners.order));
    }
    return db.select().from(banners).orderBy(asc(banners.order));
  }

  async createBanner(data: InsertBanner) {
    const [b] = await db.insert(banners).values(data).returning();
    return b;
  }

  async updateBanner(id: string, data: Partial<Banner>) {
    const [b] = await db.update(banners).set(data).where(eq(banners.id, id)).returning();
    return b;
  }

  async deleteBanner(id: string) {
    await db.delete(banners).where(eq(banners.id, id));
  }

  async getTourFeeds(activeOnly = false) {
    if (activeOnly) {
      return db.select().from(tourFeeds).where(eq(tourFeeds.isActive, true)).orderBy(asc(tourFeeds.order));
    }
    return db.select().from(tourFeeds).orderBy(asc(tourFeeds.order));
  }

  async getTourFeed(id: string) {
    const [f] = await db.select().from(tourFeeds).where(eq(tourFeeds.id, id));
    return f;
  }

  async createTourFeed(data: any) {
    const [f] = await db.insert(tourFeeds).values(data).returning();
    return f;
  }

  async updateTourFeed(id: string, data: Partial<TourFeed>) {
    const [f] = await db.update(tourFeeds).set(data).where(eq(tourFeeds.id, id)).returning();
    return f;
  }

  async deleteTourFeed(id: string) {
    await db.delete(tourFeedItems).where(eq(tourFeedItems.feedId, id));
    await db.delete(tourFeeds).where(eq(tourFeeds.id, id));
  }

  async getTourFeedItems(feedId: string) {
    const items = await db.select().from(tourFeedItems)
      .leftJoin(tours, eq(tourFeedItems.tourId, tours.id))
      .where(eq(tourFeedItems.feedId, feedId))
      .orderBy(asc(tourFeedItems.order));
    return items.map(i => ({ ...i.tour_feed_items, tour: i.tours! }));
  }

  async addTourToFeed(feedId: string, tourId: string) {
    const [item] = await db.insert(tourFeedItems).values({ feedId, tourId, order: 0 }).returning();
    return item;
  }

  async removeTourFromFeed(feedId: string, tourId: string) {
    await db.delete(tourFeedItems).where(and(eq(tourFeedItems.feedId, feedId), eq(tourFeedItems.tourId, tourId)));
  }

  async getReviews(tourId?: string, status?: string) {
    const conditions: any[] = [];
    if (tourId) conditions.push(eq(reviews.tourId, tourId));
    if (status) conditions.push(eq(reviews.status, status as any));
    const items = await db.select({
      review: reviews,
      user: { id: users.id, name: users.name, avatar: users.avatar },
    }).from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(reviews.createdAt));
    return items.map(i => ({ ...i.review, user: i.user! }));
  }

  async getFeaturedReviews() {
    const items = await db.select({
      review: reviews,
      user: { id: users.id, name: users.name, avatar: users.avatar },
      tour: { id: tours.id, titleRu: tours.titleRu, titleEn: tours.titleEn },
    }).from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .leftJoin(tours, eq(reviews.tourId, tours.id))
      .where(and(eq(reviews.inFeaturedFeed, true), eq(reviews.status, "approved")))
      .orderBy(desc(reviews.createdAt));
    return items.map(i => ({ ...i.review, user: i.user!, tour: i.tour! }));
  }

  async createReview(data: InsertReview) {
    const [r] = await db.insert(reviews).values(data as any).returning();
    return r;
  }

  async updateReviewStatus(id: string, status: "approved" | "rejected", inFeatured?: boolean) {
    const updateData: any = { status };
    if (inFeatured !== undefined) updateData.inFeaturedFeed = inFeatured;
    const [r] = await db.update(reviews).set(updateData).where(eq(reviews.id, id)).returning();
    return r;
  }

  async getBookings(userId?: string) {
    const conditions: any[] = [];
    if (userId) conditions.push(eq(bookings.userId, userId));
    const items = await db.select({
      booking: bookings,
      tour: tours,
    }).from(bookings)
      .leftJoin(tours, eq(bookings.tourId, tours.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(bookings.createdAt));
    const result = [];
    for (const item of items) {
      let tourDate;
      if (item.booking.tourDateId) {
        const [d] = await db.select().from(tourDates).where(eq(tourDates.id, item.booking.tourDateId));
        tourDate = d;
      }
      result.push({ ...item.booking, tour: item.tour!, tourDate });
    }
    return result;
  }

  async getBooking(id: string) {
    const [item] = await db.select({
      booking: bookings,
      tour: tours,
    }).from(bookings)
      .leftJoin(tours, eq(bookings.tourId, tours.id))
      .where(eq(bookings.id, id));
    if (!item) return undefined;
    let tourDate;
    if (item.booking.tourDateId) {
      const [d] = await db.select().from(tourDates).where(eq(tourDates.id, item.booking.tourDateId));
      tourDate = d;
    }
    return { ...item.booking, tour: item.tour!, tourDate };
  }

  async createBooking(data: InsertBooking) {
    const [b] = await db.insert(bookings).values(data as any).returning();
    // Update user loyalty
    if (b.bookingStatus === "paid" || b.bookingStatus === "prepaid") {
      await this.updateUserLoyalty(b.userId);
    }
    return b;
  }

  async updateBooking(id: string, data: Partial<Booking>) {
    const [b] = await db.update(bookings).set(data as any).where(eq(bookings.id, id)).returning();
    if (data.bookingStatus === "paid") {
      await this.updateUserLoyalty(b.userId);
    }
    return b;
  }

  private async updateUserLoyalty(userId: string) {
    const userBookings = await db.select().from(bookings)
      .where(and(eq(bookings.userId, userId), eq(bookings.bookingStatus, "paid")));
    const count = userBookings.length;
    let level: "beginner" | "traveler" | "premium" = "beginner";
    let discountsLeft = 0;
    if (count >= 6) { level = "premium"; discountsLeft = 0; }
    else if (count >= 3) { level = "traveler"; discountsLeft = Math.max(0, 2 - (count - 3)); }
    await db.update(users).set({ loyaltyLevel: level, bookingsCount: count, discountsLeft }).where(eq(users.id, userId));
  }

  async getNews(publishedOnly = true) {
    if (publishedOnly) {
      return db.select().from(news).where(eq(news.isPublished, true)).orderBy(desc(news.publishedAt));
    }
    return db.select().from(news).orderBy(desc(news.publishedAt));
  }

  async getNewsItem(id: string) {
    const [n] = await db.select().from(news).where(eq(news.id, id));
    return n;
  }

  async createNews(data: InsertNews) {
    const [n] = await db.insert(news).values(data as any).returning();
    return n;
  }

  async updateNews(id: string, data: Partial<News>) {
    const [n] = await db.update(news).set(data as any).where(eq(news.id, id)).returning();
    return n;
  }

  async deleteNews(id: string) {
    await db.delete(news).where(eq(news.id, id));
  }

  async getFavorites(userId: string) {
    const items = await db.select({
      fav: favorites,
      tour: tours,
    }).from(favorites)
      .leftJoin(tours, eq(favorites.tourId, tours.id))
      .where(eq(favorites.userId, userId));
    return items.map(i => ({ ...i.fav, tour: i.tour! }));
  }

  async toggleFavorite(userId: string, tourId: string) {
    const [existing] = await db.select().from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.tourId, tourId)));
    if (existing) {
      await db.delete(favorites).where(eq(favorites.id, existing.id));
      return false;
    } else {
      await db.insert(favorites).values({ userId, tourId });
      return true;
    }
  }

  async isFavorite(userId: string, tourId: string) {
    const [f] = await db.select().from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.tourId, tourId)));
    return !!f;
  }

  async getIntroScreen() {
    const [i] = await db.select().from(introScreen);
    return i;
  }

  async upsertIntroScreen(data: any) {
    const existing = await this.getIntroScreen();
    if (existing) {
      const [i] = await db.update(introScreen).set(data).where(eq(introScreen.id, existing.id)).returning();
      return i;
    } else {
      const [i] = await db.insert(introScreen).values(data).returning();
      return i;
    }
  }

  async getHeroSlides(activeOnly = false) {
    if (activeOnly) {
      return db.select().from(heroSlides).where(eq(heroSlides.isActive, true)).orderBy(asc(heroSlides.order));
    }
    return db.select().from(heroSlides).orderBy(asc(heroSlides.order));
  }

  async createHeroSlide(data: any) {
    const [s] = await db.insert(heroSlides).values(data).returning();
    return s;
  }

  async updateHeroSlide(id: string, data: Partial<HeroSlide>) {
    const [s] = await db.update(heroSlides).set(data as any).where(eq(heroSlides.id, id)).returning();
    return s;
  }

  async deleteHeroSlide(id: string) {
    await db.delete(heroSlides).where(eq(heroSlides.id, id));
  }

  async getStats() {
    const [toursCount] = await db.select({ count: sql<number>`count(*)` }).from(tours).where(eq(tours.isActive, true));
    const [bookingsCount] = await db.select({ count: sql<number>`count(*)` }).from(bookings);
    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "user"));
    const [revenue] = await db.select({ total: sql<string>`coalesce(sum(paid_amount), 0)` }).from(bookings);
    return {
      tours: Number(toursCount.count),
      bookings: Number(bookingsCount.count),
      users: Number(usersCount.count),
      revenue: revenue.total || "0",
    };
  }
}

export const storage = new DatabaseStorage();
