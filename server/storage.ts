import { db } from "./db";
import { eq, and, desc, asc, ilike, or, inArray, sql, ne, isNull, isNotNull } from "drizzle-orm";
import {
  users, countries, cities, categories, tours, tourCategories, tourDates, tourPriceTiers,
  priceComponents, tourPriceComponents, tourOptions, tourItinerary, itineraryStops,
  banners, tourFeeds, tourFeedItems, reviews, bookings, news,
  favorites, introScreen, heroSlides, passwordResetTokens, currencies, settings,
  alifPayments, inquiries, hotels, tourHotels,
  type User, type InsertUser, type Country, type InsertCountry,
  type City, type InsertCity, type Category, type InsertCategory,
  type Tour, type InsertTour, type TourDate, type InsertTourDate,
  type PriceComponent, type InsertPriceComponent, type TourPriceComponent,
  type TourPriceTier, type InsertTourPriceTier,
  type TourOption, type InsertTourOption, type TourItinerary, type ItineraryStop,
  type Banner, type InsertBanner, type TourFeed, type TourFeedItem,
  type Review, type InsertReview, type Booking, type InsertBooking,
  type AlifPayment,
  type News, type InsertNews, type Favorite, type IntroScreen, type HeroSlide,
  type PasswordResetToken, type Currency, type InsertCurrency,
  type Inquiry, type InsertInquiry,
  type Hotel, type InsertHotel,
  type AnalyticsData, type LoyaltySettings,
} from "@shared/schema";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByProviderId(provider: string, providerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertOAuthUser(profile: { provider: string; providerId: string; email: string; name: string; avatar?: string }): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;

  // Countries
  getCountries(showOnHome?: boolean): Promise<Country[]>;
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
  getTourCategoryIds(tourId: string): Promise<string[]>;
  setTourCategories(tourId: string, categoryIds: string[]): Promise<void>;
  createTour(data: InsertTour): Promise<Tour>;
  updateTour(id: string, data: Partial<Tour>): Promise<Tour | undefined>;
  deleteTour(id: string): Promise<void>;
  cloneTour(id: string): Promise<Tour>;

  // Tour Price Tiers
  getTourPriceTiers(tourId: string): Promise<TourPriceTier[]>;
  createTourPriceTier(data: any): Promise<TourPriceTier>;
  updateTourPriceTier(id: string, data: Partial<TourPriceTier>): Promise<TourPriceTier | undefined>;
  deleteTourPriceTier(id: string): Promise<void>;

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

  // Itinerary Stops
  getItineraryStops(dayId: string): Promise<ItineraryStop[]>;
  getAllStopsForTour(tourId: string): Promise<ItineraryStop[]>;
  createItineraryStop(data: any): Promise<ItineraryStop>;
  updateItineraryStop(id: string, data: Partial<ItineraryStop>): Promise<ItineraryStop | undefined>;
  deleteItineraryStop(id: string): Promise<void>;

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
  getTourFeedItems(feedId: string, includeInactive?: boolean): Promise<(TourFeedItem & { tour: Tour })[]>;
  addTourToFeed(feedId: string, tourId: string): Promise<TourFeedItem>;
  removeTourFromFeed(feedId: string, tourId: string): Promise<void>;
  getFeedIdsForTour(tourId: string): Promise<string[]>;
  setTourFeeds(tourId: string, feedIds: string[]): Promise<void>;

  // Reviews
  getReviews(tourId?: string, status?: string): Promise<(Review & { user: Pick<User, "id" | "name" | "avatar"> })[]>;
  getFeaturedReviews(): Promise<(Review & { user: Pick<User, "id" | "name" | "avatar">; tour: Pick<Tour, "id" | "titleRu" | "titleEn"> })[]>;
  createReview(data: InsertReview): Promise<Review>;
  updateReviewStatus(id: string, status: "approved" | "rejected", inFeatured?: boolean): Promise<Review | undefined>;

  // Bookings
  getBookings(userId?: string): Promise<(Booking & { tour: Tour; tourDate?: TourDate; user?: Pick<User, "id" | "name" | "email"> })[]>;
  getBooking(id: string): Promise<(Booking & { tour: Tour; tourDate?: TourDate; user?: Pick<User, "id" | "name" | "email"> }) | undefined>;
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
  getStats(): Promise<{ tours: number; bookings: number; users: number; revenue: string; inquiries: number }>;

  // Password Reset
  createPasswordResetToken(userId: string, token: string): Promise<void>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markTokenUsed(token: string): Promise<void>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;

  // Analytics
  getAnalytics(filters?: { startDate?: Date; endDate?: Date; paymentType?: string; status?: string }): Promise<AnalyticsData>;

  // Loyalty Settings
  getLoyaltySettings(): Promise<LoyaltySettings>;
  updateLoyaltySettings(data: LoyaltySettings): Promise<LoyaltySettings>;
  getHomeLayout(): Promise<string[]>;
  setHomeLayout(order: string[]): Promise<void>;
  getSiteBackground(): Promise<{ imageUrl: string; overlay: number; position: string } | null>;
  setSiteBackground(data: { imageUrl: string; overlay: number; position: string }): Promise<void>;

  // Alif Payments
  createAlifPayment(data: { bookingId: string; orderId: string; amount: string; gate: string }): Promise<AlifPayment>;
  getAlifPaymentByOrderId(orderId: string): Promise<AlifPayment | undefined>;
  getAlifPaymentByBookingId(bookingId: string): Promise<AlifPayment | undefined>;
  updateAlifPayment(id: string, data: Partial<AlifPayment>): Promise<AlifPayment | undefined>;

  // Inquiries
  getInquiries(): Promise<any[]>;
  getInquiry(id: string): Promise<Inquiry | undefined>;
  createInquiry(data: InsertInquiry): Promise<Inquiry>;
  updateInquiry(id: string, data: Partial<Inquiry>): Promise<Inquiry | undefined>;
  deleteInquiry(id: string): Promise<void>;

  // Currencies
  getCurrencies(activeOnly?: boolean): Promise<Currency[]>;
  createCurrency(data: any): Promise<Currency>;
  updateCurrency(id: string, data: Partial<Currency>): Promise<Currency | undefined>;
  deleteCurrency(id: string): Promise<void>;

  // Hotels
  getHotels(filters?: { countryId?: string; cityId?: string }): Promise<Hotel[]>;
  getHotel(id: string): Promise<Hotel | undefined>;
  createHotel(data: InsertHotel): Promise<Hotel>;
  updateHotel(id: string, data: Partial<Hotel>): Promise<Hotel | undefined>;
  deleteHotel(id: string): Promise<void>;
  getTourHotels(tourId: string): Promise<Hotel[]>;
  getTourHotelIds(tourId: string): Promise<string[]>;
  setTourHotels(tourId: string, hotelIds: string[]): Promise<void>;
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

  async getUserByProviderId(provider: string, providerId: string) {
    const [user] = await db.select().from(users).where(
      and(eq(users.provider, provider), eq(users.providerId, providerId))
    );
    return user;
  }

  async createUser(data: InsertUser) {
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null;
    const [user] = await db.insert(users).values({ ...data, password: hashedPassword }).returning();
    return user;
  }

  async upsertOAuthUser(profile: { provider: string; providerId: string; email: string; name: string; avatar?: string }) {
    // Check if user exists by provider+id
    let user = await this.getUserByProviderId(profile.provider, profile.providerId);
    if (user) {
      // Update avatar/name if changed
      const [updated] = await db.update(users).set({
        name: profile.name,
        avatar: profile.avatar || user.avatar,
      }).where(eq(users.id, user.id)).returning();
      return updated;
    }
    // Check if email already exists (link accounts)
    user = await this.getUserByEmail(profile.email);
    if (user) {
      const [updated] = await db.update(users).set({
        provider: profile.provider,
        providerId: profile.providerId,
        avatar: profile.avatar || user.avatar,
      }).where(eq(users.id, user.id)).returning();
      return updated;
    }
    // Create new user
    const base = profile.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_");
    let username = base;
    let attempt = 0;
    while (await this.getUserByUsername(username)) {
      attempt++;
      username = `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
      if (attempt > 10) username = `${base}_${Date.now()}`;
    }
    const [created] = await db.insert(users).values({
      email: profile.email,
      username,
      name: profile.name,
      password: null,
      avatar: profile.avatar || null,
      provider: profile.provider,
      providerId: profile.providerId,
      emailVerified: true,
    }).returning();
    return created;
  }

  async updateUser(id: string, data: Partial<User>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async getUserByVerificationToken(token: string) {
    const [u] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return u;
  }

  async deleteUser(id: string) {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, id));
    await db.delete(favorites).where(eq(favorites.userId, id));
    await db.delete(reviews).where(eq(reviews.userId, id));
    await db.update(bookings).set({ userId: null }).where(eq(bookings.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers() {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getCountries(showOnHome?: boolean) {
    if (showOnHome) {
      return db.select().from(countries).where(eq(countries.showOnHome, true)).orderBy(asc(countries.nameEn));
    }
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
    const citiesInCountry = await db.select({ id: cities.id }).from(cities).where(eq(cities.countryId, id));
    const cityIds = citiesInCountry.map(c => c.id);

    const activeToursByCountry = await db.select({ id: tours.id }).from(tours)
      .where(and(eq(tours.countryId, id), eq(tours.isActive, true))).limit(1);
    if (activeToursByCountry.length > 0) {
      throw new Error("Невозможно удалить страну: есть активные туры, привязанные к этой стране.");
    }

    if (cityIds.length > 0) {
      for (const cityId of cityIds) {
        const activeToursByCity = await db.select({ id: tours.id }).from(tours)
          .where(and(eq(tours.cityId, cityId), eq(tours.isActive, true))).limit(1);
        if (activeToursByCity.length > 0) {
          throw new Error("Невозможно удалить страну: один из её городов используется в активных турах.");
        }
      }
      await db.update(tours).set({ cityId: null }).where(and(inArray(tours.cityId, cityIds), eq(tours.isActive, false)));
      await db.delete(cities).where(inArray(cities.id, cityIds));
    }

    await db.update(tours).set({ countryId: null }).where(and(eq(tours.countryId, id), eq(tours.isActive, false)));
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
    const activeTours = await db.select({ id: tours.id }).from(tours)
      .where(and(eq(tours.cityId, id), eq(tours.isActive, true))).limit(1);
    if (activeTours.length > 0) {
      throw new Error("Невозможно удалить город: есть активные туры, привязанные к этому городу.");
    }
    await db.update(tours).set({ cityId: null }).where(and(eq(tours.cityId, id), eq(tours.isActive, false)));
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

  async getTours(filters?: { countryId?: string; cityId?: string; categoryId?: string; search?: string; minPrice?: number; maxPrice?: number; duration?: number; isHot?: boolean; includeInactive?: boolean; deletedOnly?: boolean }) {
    const conditions = [];
    if (filters?.deletedOnly) {
      // Trash view: only deleted tours (deletedAt IS NOT NULL)
      conditions.push(isNotNull(tours.deletedAt));
    } else {
      // Normal view: always exclude deleted tours
      conditions.push(isNull(tours.deletedAt));
      if (!filters?.includeInactive) conditions.push(eq(tours.isActive, true));
    }
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
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(tours).where(whereClause).orderBy(desc(tours.createdAt));
  }

  async getTour(id: string) {
    const [t] = await db.select().from(tours).where(eq(tours.id, id));
    return t;
  }

  async getTourCategoryIds(tourId: string): Promise<string[]> {
    const rows = await db.select({ categoryId: tourCategories.categoryId })
      .from(tourCategories).where(eq(tourCategories.tourId, tourId));
    return rows.map(r => r.categoryId);
  }

  async setTourCategories(tourId: string, categoryIds: string[]): Promise<void> {
    await db.delete(tourCategories).where(eq(tourCategories.tourId, tourId));
    if (categoryIds.length > 0) {
      await db.insert(tourCategories).values(categoryIds.map(cid => ({ tourId, categoryId: cid })));
    }
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
    await db.update(tours).set({ isActive: false, deletedAt: new Date() }).where(eq(tours.id, id));
  }

  async cloneTour(id: string) {
    const original = await this.getTour(id);
    if (!original) throw new Error("Tour not found");

    const { id: _id, createdAt: _ca, ...tourData } = original as any;
    const [cloned] = await db.insert(tours).values({
      ...tourData,
      titleRu: `${original.titleRu} (копия)`,
      titleEn: `${original.titleEn} (copy)`,
      isActive: false,
    }).returning();

    const [categoryIds, priceTiers, options, itineraryDays] = await Promise.all([
      this.getTourCategoryIds(id),
      db.select().from(tourPriceTiers).where(eq(tourPriceTiers.tourId, id)),
      db.select().from(tourOptions).where(eq(tourOptions.tourId, id)),
      db.select().from(tourItinerary).where(eq(tourItinerary.tourId, id)).orderBy(asc(tourItinerary.dayNumber)),
    ]);

    if (categoryIds.length > 0) await this.setTourCategories(cloned.id, categoryIds);

    if (priceTiers.length > 0) {
      await db.insert(tourPriceTiers).values(priceTiers.map(({ id: _id, ...t }) => ({ ...t, tourId: cloned.id })));
    }
    if (options.length > 0) {
      await db.insert(tourOptions).values(options.map(({ id: _id, ...o }) => ({ ...o, tourId: cloned.id })));
    }
    for (const day of itineraryDays) {
      const { id: dayId, ...dayData } = day;
      const [newDay] = await db.insert(tourItinerary).values({ ...dayData, tourId: cloned.id }).returning();
      const stops = await db.select().from(itineraryStops).where(eq(itineraryStops.itineraryDayId, dayId));
      if (stops.length > 0) {
        await db.insert(itineraryStops).values(stops.map(({ id: _id, ...s }) => ({ ...s, itineraryDayId: newDay.id })));
      }
    }

    return cloned;
  }

  async permanentDeleteTour(id: string) {
    const existingBookings = await db.select({ id: bookings.id }).from(bookings).where(eq(bookings.tourId, id)).limit(1);
    if (existingBookings.length > 0) {
      throw new Error("Cannot permanently delete a tour that has bookings. Remove or reassign bookings first.");
    }
    await db.delete(favorites).where(eq(favorites.tourId, id));
    await db.delete(tourFeedItems).where(eq(tourFeedItems.tourId, id));
    await db.delete(reviews).where(eq(reviews.tourId, id));
    await db.delete(tourOptions).where(eq(tourOptions.tourId, id));
    await db.delete(tourPriceComponents).where(eq(tourPriceComponents.tourId, id));
    await db.delete(tourItinerary).where(eq(tourItinerary.tourId, id));
    await db.delete(tourDates).where(eq(tourDates.tourId, id));
    await db.delete(tours).where(eq(tours.id, id));
  }

  async getTourPriceTiers(tourId: string) {
    return db.select().from(tourPriceTiers).where(eq(tourPriceTiers.tourId, tourId)).orderBy(asc(tourPriceTiers.minPeople));
  }

  async createTourPriceTier(data: any) {
    const [t] = await db.insert(tourPriceTiers).values(data).returning();
    return t;
  }

  async updateTourPriceTier(id: string, data: Partial<TourPriceTier>) {
    const [t] = await db.update(tourPriceTiers).set(data as any).where(eq(tourPriceTiers.id, id)).returning();
    return t;
  }

  async deleteTourPriceTier(id: string) {
    await db.delete(tourPriceTiers).where(eq(tourPriceTiers.id, id));
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
    await db.delete(itineraryStops).where(eq(itineraryStops.itineraryDayId, id));
    await db.delete(tourItinerary).where(eq(tourItinerary.id, id));
  }

  async getItineraryStops(dayId: string) {
    return db.select().from(itineraryStops)
      .where(eq(itineraryStops.itineraryDayId, dayId))
      .orderBy(asc(itineraryStops.stopOrder));
  }

  async getAllStopsForTour(tourId: string) {
    const days = await this.getTourItinerary(tourId);
    if (days.length === 0) return [];
    const dayIds = days.map(d => d.id);
    return db.select().from(itineraryStops)
      .where(inArray(itineraryStops.itineraryDayId, dayIds))
      .orderBy(asc(itineraryStops.stopOrder));
  }

  async createItineraryStop(data: any) {
    const [s] = await db.insert(itineraryStops).values(data).returning();
    return s;
  }

  async updateItineraryStop(id: string, data: Partial<ItineraryStop>) {
    const [s] = await db.update(itineraryStops).set(data).where(eq(itineraryStops.id, id)).returning();
    return s;
  }

  async deleteItineraryStop(id: string) {
    await db.delete(itineraryStops).where(eq(itineraryStops.id, id));
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

  async getTourFeedItems(feedId: string, includeInactive = false) {
    const conditions = [eq(tourFeedItems.feedId, feedId)];
    if (!includeInactive) conditions.push(eq(tours.isActive, true));
    const items = await db.select().from(tourFeedItems)
      .leftJoin(tours, eq(tourFeedItems.tourId, tours.id))
      .where(and(...conditions))
      .orderBy(asc(tourFeedItems.order));
    return items
      .filter(i => i.tours)
      .map(i => ({ ...i.tour_feed_items, tour: i.tours! }));
  }

  async addTourToFeed(feedId: string, tourId: string) {
    const existing = await db.select().from(tourFeedItems)
      .where(and(eq(tourFeedItems.feedId, feedId), eq(tourFeedItems.tourId, tourId)));
    if (existing.length > 0) return existing[0];
    const [item] = await db.insert(tourFeedItems).values({ feedId, tourId, order: 0 }).returning();
    return item;
  }

  async removeTourFromFeed(feedId: string, tourId: string) {
    await db.delete(tourFeedItems).where(and(eq(tourFeedItems.feedId, feedId), eq(tourFeedItems.tourId, tourId)));
  }

  async getFeedIdsForTour(tourId: string): Promise<string[]> {
    const rows = await db.select({ feedId: tourFeedItems.feedId })
      .from(tourFeedItems).where(eq(tourFeedItems.tourId, tourId));
    return rows.map(r => r.feedId);
  }

  async setTourFeeds(tourId: string, feedIds: string[]): Promise<void> {
    await db.delete(tourFeedItems).where(eq(tourFeedItems.tourId, tourId));
    if (feedIds.length > 0) {
      await db.insert(tourFeedItems).values(feedIds.map(feedId => ({ feedId, tourId, order: 0 })));
    }
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
      user: { id: users.id, name: users.name, email: users.email },
    }).from(bookings)
      .leftJoin(tours, eq(bookings.tourId, tours.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(bookings.createdAt));
    const result = [];
    for (const item of items) {
      let tourDate;
      if (item.booking.tourDateId) {
        const [d] = await db.select().from(tourDates).where(eq(tourDates.id, item.booking.tourDateId));
        tourDate = d;
      }
      result.push({ ...item.booking, tour: item.tour!, tourDate, user: item.user || undefined });
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
    // Update user loyalty (only for registered users)
    if (b.userId && (b.bookingStatus === "paid" || b.bookingStatus === "prepaid")) {
      await this.updateUserLoyalty(b.userId);
    }
    return b;
  }

  async updateBooking(id: string, data: Partial<Booking>) {
    const [b] = await db.update(bookings).set(data as any).where(eq(bookings.id, id)).returning();
    if (b.userId && data.bookingStatus === "paid") {
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
    const [bookingsCount] = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(or(eq(bookings.bookingStatus, "prepaid"), eq(bookings.bookingStatus, "paid")));
    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "user"));
    const [revenue] = await db.select({ total: sql<string>`coalesce(sum(paid_amount), 0)` }).from(bookings);
    const [inquiriesCount] = await db.select({ count: sql<number>`count(*)` }).from(inquiries).where(eq(inquiries.status, "new"));
    return {
      tours: Number(toursCount.count),
      bookings: Number(bookingsCount.count),
      users: Number(usersCount.count),
      revenue: revenue.total || "0",
      inquiries: Number(inquiriesCount.count),
    };
  }

  async createPasswordResetToken(userId: string, token: string) {
    const expiresAt = new Date(Date.now() + 3600 * 1000);
    await db.insert(passwordResetTokens).values({ userId, token, expiresAt });
  }

  async getPasswordResetToken(token: string) {
    const [t] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return t;
  }

  async markTokenUsed(token: string) {
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.token, token));
  }

  async updateUserPassword(userId: string, hashedPassword: string) {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
  }

  async getAnalytics(filters?: { startDate?: Date; endDate?: Date; paymentType?: string; status?: string }): Promise<AnalyticsData> {
    const conditions: any[] = [ne(bookings.bookingStatus, "cancelled")];
    if (filters?.startDate) conditions.push(sql`${bookings.createdAt} >= ${filters.startDate}`);
    if (filters?.endDate) conditions.push(sql`${bookings.createdAt} <= ${filters.endDate}`);
    if (filters?.paymentType && filters.paymentType !== "all") conditions.push(eq(bookings.paymentType, filters.paymentType as any));
    if (filters?.status && filters.status !== "all") conditions.push(eq(bookings.bookingStatus, filters.status as any));

    const whereClause = and(...conditions);

    const [summary] = await db.select({
      totalBookings: sql<number>`count(${bookings.id})::int`,
      totalTourists: sql<number>`sum(${bookings.adults} + ${bookings.children})::int`,
      totalRevenue: sql<number>`sum(${bookings.totalPrice})::float`,
      prepaidRevenue: sql<number>`sum(case when ${bookings.paymentType} = 'prepay' then ${bookings.paidAmount} else 0 end)::float`,
      fullRevenue: sql<number>`sum(case when ${bookings.paymentType} = 'full' then ${bookings.paidAmount} else 0 end)::float`,
    }).from(bookings).where(whereClause);

    const revenueByDay = await db.select({
      date: sql<string>`to_char(${bookings.createdAt}, 'YYYY-MM-DD')`,
      revenue: sql<number>`sum(${bookings.totalPrice})::float`,
      bookings: sql<number>`count(${bookings.id})::int`,
    }).from(bookings)
      .where(whereClause)
      .groupBy(sql`to_char(${bookings.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(asc(sql`to_char(${bookings.createdAt}, 'YYYY-MM-DD')`));

    const revenueByMonth = await db.select({
      month: sql<string>`to_char(${bookings.createdAt}, 'YYYY-MM')`,
      revenue: sql<number>`sum(${bookings.totalPrice})::float`,
      bookings: sql<number>`count(${bookings.id})::int`,
    }).from(bookings)
      .where(whereClause)
      .groupBy(sql`to_char(${bookings.createdAt}, 'YYYY-MM')`)
      .orderBy(asc(sql`to_char(${bookings.createdAt}, 'YYYY-MM')`));

    const topTours = await db.select({
      tourId: tours.id,
      titleRu: tours.titleRu,
      titleEn: tours.titleEn,
      bookings: sql<number>`count(${bookings.id})::int`,
      tourists: sql<number>`sum(${bookings.adults} + ${bookings.children})::int`,
      revenue: sql<number>`sum(${bookings.totalPrice})::float`,
    }).from(bookings)
      .innerJoin(tours, eq(bookings.tourId, tours.id))
      .where(whereClause)
      .groupBy(tours.id, tours.titleRu, tours.titleEn)
      .orderBy(desc(sql`revenue`))
      .limit(10);

    const topCountries = await db.select({
      countryId: countries.id,
      nameRu: countries.nameRu,
      nameEn: countries.nameEn,
      tourists: sql<number>`sum(${bookings.adults} + ${bookings.children})::int`,
      revenue: sql<number>`sum(${bookings.totalPrice})::float`,
    }).from(bookings)
      .innerJoin(tours, eq(bookings.tourId, tours.id))
      .innerJoin(countries, eq(tours.countryId, countries.id))
      .where(whereClause)
      .groupBy(countries.id, countries.nameRu, countries.nameEn)
      .orderBy(desc(sql`revenue`))
      .limit(10);

    return {
      totalBookings: summary?.totalBookings || 0,
      totalTourists: summary?.totalTourists || 0,
      totalRevenue: summary?.totalRevenue || 0,
      prepaidRevenue: summary?.prepaidRevenue || 0,
      fullRevenue: summary?.fullRevenue || 0,
      revenueByDay: revenueByDay || [],
      revenueByMonth: revenueByMonth || [],
      topTours: topTours || [],
      topCountries: topCountries || [],
    };
  }

  async getLoyaltySettings(): Promise<LoyaltySettings> {
    const [row] = await db.select().from(settings).where(eq(settings.key, "loyalty"));
    if (row) return row.value as LoyaltySettings;
    return {
      beginner: { minBookings: 0, discount: 0 },
      traveler: { minBookings: 3, discount: 10, discountCount: 2 },
      premium: { minBookings: 6, discount: 5 },
    };
  }

  async updateLoyaltySettings(data: LoyaltySettings): Promise<LoyaltySettings> {
    const existing = await db.select().from(settings).where(eq(settings.key, "loyalty"));
    if (existing.length > 0) {
      await db.update(settings).set({ value: data as any }).where(eq(settings.key, "loyalty"));
    } else {
      await db.insert(settings).values({ key: "loyalty", value: data as any });
    }
    return data;
  }

  async getHomeLayout(): Promise<string[]> {
    const [row] = await db.select().from(settings).where(eq(settings.key, "home-layout"));
    return (row?.value as string[]) ?? ["popular", "destinations", "banners", "hot", "reviews"];
  }

  async setHomeLayout(order: string[]): Promise<void> {
    const [existing] = await db.select().from(settings).where(eq(settings.key, "home-layout"));
    if (existing) {
      await db.update(settings).set({ value: order as any }).where(eq(settings.key, "home-layout"));
    } else {
      await db.insert(settings).values({ key: "home-layout", value: order as any });
    }
  }

  async getSiteBackground(): Promise<{ imageUrl: string; overlay: number; position: string } | null> {
    const [row] = await db.select().from(settings).where(eq(settings.key, "site-background"));
    return row ? (row.value as { imageUrl: string; overlay: number; position: string }) : null;
  }

  async setSiteBackground(data: { imageUrl: string; overlay: number; position: string }): Promise<void> {
    const [existing] = await db.select().from(settings).where(eq(settings.key, "site-background"));
    if (existing) {
      await db.update(settings).set({ value: data as any }).where(eq(settings.key, "site-background"));
    } else {
      await db.insert(settings).values({ key: "site-background", value: data as any });
    }
  }

  async createAlifPayment(data: { bookingId: string; orderId: string; amount: string; gate: string }) {
    const [p] = await db.insert(alifPayments).values({ ...data, status: "pending" }).returning();
    return p;
  }

  async getAlifPaymentByOrderId(orderId: string) {
    const [p] = await db.select().from(alifPayments).where(eq(alifPayments.orderId, orderId));
    return p;
  }

  async getAlifPaymentByBookingId(bookingId: string) {
    const [p] = await db.select().from(alifPayments).where(eq(alifPayments.bookingId, bookingId)).orderBy(desc(alifPayments.createdAt));
    return p;
  }

  async updateAlifPayment(id: string, data: Partial<AlifPayment>) {
    const [p] = await db.update(alifPayments).set({ ...data, updatedAt: new Date() } as any).where(eq(alifPayments.id, id)).returning();
    return p;
  }

  async getCurrencies(activeOnly = false) {
    if (activeOnly) {
      return db.select().from(currencies).where(eq(currencies.isActive, true)).orderBy(asc(currencies.sortOrder));
    }
    return db.select().from(currencies).orderBy(asc(currencies.sortOrder));
  }

  async createCurrency(data: any) {
    const [c] = await db.insert(currencies).values(data).returning();
    return c;
  }

  async updateCurrency(id: string, data: Partial<Currency>) {
    const [c] = await db.update(currencies).set(data as any).where(eq(currencies.id, id)).returning();
    return c;
  }

  async deleteCurrency(id: string) {
    await db.delete(currencies).where(eq(currencies.id, id));
  }

  async getInquiries() {
    const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
    const result = [];
    for (const row of rows) {
      const tour = await this.getTour(row.tourId);
      result.push({ ...row, tour });
    }
    return result;
  }

  async getInquiry(id: string) {
    const [row] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return row;
  }

  async createInquiry(data: InsertInquiry) {
    const [row] = await db.insert(inquiries).values(data).returning();
    return row;
  }

  async updateInquiry(id: string, data: Partial<Inquiry>) {
    const [row] = await db.update(inquiries).set(data as any).where(eq(inquiries.id, id)).returning();
    return row;
  }

  async deleteInquiry(id: string) {
    await db.delete(inquiries).where(eq(inquiries.id, id));
  }

  async getHotels(filters?: { countryId?: string; cityId?: string }) {
    const conds = [];
    if (filters?.countryId) conds.push(eq(hotels.countryId, filters.countryId));
    if (filters?.cityId) conds.push(eq(hotels.cityId, filters.cityId));
    const whereClause = conds.length > 0 ? and(...conds) : undefined;
    return db.select().from(hotels).where(whereClause).orderBy(asc(hotels.nameRu));
  }

  async getHotel(id: string) {
    const [h] = await db.select().from(hotels).where(eq(hotels.id, id));
    return h;
  }

  async createHotel(data: InsertHotel) {
    const [h] = await db.insert(hotels).values(data as any).returning();
    return h;
  }

  async updateHotel(id: string, data: Partial<Hotel>) {
    const [h] = await db.update(hotels).set(data as any).where(eq(hotels.id, id)).returning();
    return h;
  }

  async deleteHotel(id: string) {
    await db.delete(tourHotels).where(eq(tourHotels.hotelId, id));
    await db.delete(hotels).where(eq(hotels.id, id));
  }

  async getTourHotelIds(tourId: string): Promise<string[]> {
    const rows = await db.select({ hotelId: tourHotels.hotelId })
      .from(tourHotels).where(eq(tourHotels.tourId, tourId));
    return rows.map(r => r.hotelId);
  }

  async getTourHotels(tourId: string): Promise<Hotel[]> {
    const ids = await this.getTourHotelIds(tourId);
    if (ids.length === 0) return [];
    return db.select().from(hotels).where(inArray(hotels.id, ids)).orderBy(asc(hotels.nameRu));
  }

  async setTourHotels(tourId: string, hotelIds: string[]): Promise<void> {
    await db.delete(tourHotels).where(eq(tourHotels.tourId, tourId));
    if (hotelIds.length > 0) {
      await db.insert(tourHotels).values(hotelIds.map(hid => ({ tourId, hotelId: hid })));
    }
  }
}

export const storage = new DatabaseStorage();
