import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import path from "path";
import { sendPasswordResetEmail } from "./email";
import multer from "multer";
import { storage } from "./storage";
import {
  insertUserSchema, insertTourSchema, insertTourDateSchema,
  insertPriceComponentSchema, insertTourOptionSchema,
  insertBannerSchema, insertTourFeedSchema,
  insertReviewSchema, insertBookingSchema,
  insertNewsSchema, insertCountrySchema, insertCitySchema, insertCategorySchema,
} from "@shared/schema";
import { z } from "zod";

const PgSession = connectPgSimple(session);

function requireAuth(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
  next();
}

function requireAdmin(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
  if ((req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  app.use(session({
    store: new PgSession({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || "travel-platform-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) return done(null, false, { message: "Invalid credentials" });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return done(null, false, { message: "Invalid credentials" });
      return done(null, user);
    } catch (e) { return done(e); }
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (e) { done(e); }
  });

  // Auth
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByEmail(data.email);
      if (existing) return res.status(400).json({ message: "Email already registered" });
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) return res.status(400).json({ message: "Username already taken" });
      const user = await storage.createUser(data);
      const { password: _, ...safeUser } = user;
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        res.json(safeUser);
      });
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ message: "Authentication error" });
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      req.login(user, (loginErr) => {
        if (loginErr) return res.status(500).json({ message: "Login failed" });
        const { password: _, ...safeUser } = user;
        res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => res.json({ success: true }));
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    const { password: _, ...safeUser } = req.user as any;
    res.json(safeUser);
  });

  app.patch("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { password: _, role: __, ...updateData } = req.body;
      const updated = await storage.updateUser(user.id, updateData);
      if (!updated) return res.status(404).json({ message: "User not found" });
      const { password: _p, ...safeUser } = updated;
      res.json(safeUser);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Countries
  app.get("/api/countries", async (req, res) => {
    res.json(await storage.getCountries());
  });
  app.post("/api/countries", requireAdmin, async (req, res) => {
    const data = insertCountrySchema.parse(req.body);
    res.json(await storage.createCountry(data));
  });
  app.put("/api/countries/:id", requireAdmin, async (req, res) => {
    res.json(await storage.updateCountry(req.params.id, req.body));
  });
  app.delete("/api/countries/:id", requireAdmin, async (req, res) => {
    await storage.deleteCountry(req.params.id);
    res.json({ success: true });
  });

  // Cities
  app.get("/api/cities", async (req, res) => {
    res.json(await storage.getCities(req.query.countryId as string));
  });
  app.post("/api/cities", requireAdmin, async (req, res) => {
    const data = insertCitySchema.parse(req.body);
    res.json(await storage.createCity(data));
  });
  app.put("/api/cities/:id", requireAdmin, async (req, res) => {
    res.json(await storage.updateCity(req.params.id, req.body));
  });
  app.delete("/api/cities/:id", requireAdmin, async (req, res) => {
    await storage.deleteCity(req.params.id);
    res.json({ success: true });
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    res.json(await storage.getCategories());
  });
  app.post("/api/categories", requireAdmin, async (req, res) => {
    const data = insertCategorySchema.parse(req.body);
    res.json(await storage.createCategory(data));
  });
  app.put("/api/categories/:id", requireAdmin, async (req, res) => {
    res.json(await storage.updateCategory(req.params.id, req.body));
  });
  app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
    await storage.deleteCategory(req.params.id);
    res.json({ success: true });
  });

  // Tours
  app.get("/api/tours", async (req, res) => {
    const filters = {
      countryId: req.query.countryId as string,
      cityId: req.query.cityId as string,
      categoryId: req.query.categoryId as string,
      search: req.query.search as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      duration: req.query.duration ? Number(req.query.duration) : undefined,
      isHot: req.query.isHot === "true",
    };
    res.json(await storage.getTours(filters));
  });

  app.get("/api/tours/:id", async (req, res) => {
    const tour = await storage.getTour(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json(tour);
  });

  app.post("/api/tours", requireAdmin, async (req, res) => {
    try {
      const tour = await storage.createTour(req.body);
      res.json(tour);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.put("/api/tours/:id", requireAdmin, async (req, res) => {
    const tour = await storage.updateTour(req.params.id, req.body);
    res.json(tour);
  });

  app.delete("/api/tours/:id", requireAdmin, async (req, res) => {
    await storage.deleteTour(req.params.id);
    res.json({ success: true });
  });

  // Tour full details
  app.get("/api/tours/:id/full", async (req, res) => {
    const tour = await storage.getTour(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    const [dates, priceComponents, options, itinerary, reviews, country, city, category] = await Promise.all([
      storage.getTourDates(req.params.id),
      storage.getTourPriceComponents(req.params.id),
      storage.getTourOptions(req.params.id),
      storage.getTourItinerary(req.params.id),
      storage.getReviews(req.params.id, "approved"),
      tour.countryId ? storage.getCountry(tour.countryId) : Promise.resolve(undefined),
      tour.cityId ? storage.getCity(tour.cityId) : Promise.resolve(undefined),
      tour.categoryId ? storage.getCategory(tour.categoryId) : Promise.resolve(undefined),
    ]);
    let isFavorite = false;
    if (req.user) {
      isFavorite = await storage.isFavorite((req.user as any).id, req.params.id);
    }
    res.json({ tour, dates, priceComponents, options, itinerary, reviews, isFavorite, country, city, category });
  });

  // Tour Dates
  app.get("/api/tours/:id/dates", async (req, res) => {
    res.json(await storage.getTourDates(req.params.id));
  });
  app.post("/api/tours/:id/dates", requireAdmin, async (req, res) => {
    const data = insertTourDateSchema.parse({ ...req.body, tourId: req.params.id });
    res.json(await storage.createTourDate(data));
  });
  app.put("/api/tour-dates/:id", requireAdmin, async (req, res) => {
    res.json(await storage.updateTourDate(req.params.id, req.body));
  });
  app.delete("/api/tour-dates/:id", requireAdmin, async (req, res) => {
    await storage.deleteTourDate(req.params.id);
    res.json({ success: true });
  });

  // Price Components
  app.get("/api/price-components", async (req, res) => {
    res.json(await storage.getPriceComponents());
  });
  app.post("/api/price-components", requireAdmin, async (req, res) => {
    const data = insertPriceComponentSchema.parse(req.body);
    res.json(await storage.createPriceComponent(data));
  });
  app.put("/api/price-components/:id", requireAdmin, async (req, res) => {
    res.json(await storage.updatePriceComponent(req.params.id, req.body));
  });
  app.delete("/api/price-components/:id", requireAdmin, async (req, res) => {
    await storage.deletePriceComponent(req.params.id);
    res.json({ success: true });
  });

  // Tour Price Components
  app.get("/api/tours/:id/price-components", async (req, res) => {
    res.json(await storage.getTourPriceComponents(req.params.id));
  });
  app.post("/api/tours/:id/price-components", requireAdmin, async (req, res) => {
    await storage.setTourPriceComponents(req.params.id, req.body);
    res.json({ success: true });
  });

  // Tour Options
  app.get("/api/tours/:id/options", async (req, res) => {
    res.json(await storage.getTourOptions(req.params.id));
  });
  app.post("/api/tours/:id/options", requireAdmin, async (req, res) => {
    const data = insertTourOptionSchema.parse({ ...req.body, tourId: req.params.id });
    res.json(await storage.createTourOption(data));
  });
  app.put("/api/tour-options/:id", requireAdmin, async (req, res) => {
    res.json(await storage.updateTourOption(req.params.id, req.body));
  });
  app.delete("/api/tour-options/:id", requireAdmin, async (req, res) => {
    await storage.deleteTourOption(req.params.id);
    res.json({ success: true });
  });

  // Tour Itinerary
  app.get("/api/tours/:id/itinerary", async (req, res) => {
    res.json(await storage.getTourItinerary(req.params.id));
  });
  app.post("/api/tours/:id/itinerary", requireAdmin, async (req, res) => {
    res.json(await storage.createItineraryItem({ ...req.body, tourId: req.params.id }));
  });
  app.put("/api/itinerary/:id", requireAdmin, async (req, res) => {
    res.json(await storage.updateItineraryItem(req.params.id, req.body));
  });
  app.delete("/api/itinerary/:id", requireAdmin, async (req, res) => {
    await storage.deleteItineraryItem(req.params.id);
    res.json({ success: true });
  });

  // Banners
  app.get("/api/banners", async (req, res) => {
    res.json(await storage.getBanners(req.query.active === "true"));
  });
  app.post("/api/banners", requireAdmin, async (req, res) => {
    res.json(await storage.createBanner(req.body));
  });
  app.put("/api/banners/:id", requireAdmin, async (req, res) => {
    res.json(await storage.updateBanner(req.params.id, req.body));
  });
  app.delete("/api/banners/:id", requireAdmin, async (req, res) => {
    await storage.deleteBanner(req.params.id);
    res.json({ success: true });
  });

  // Tour Feeds
  app.get("/api/tour-feeds", async (req, res) => {
    const feeds = await storage.getTourFeeds(req.query.active === "true");
    if (req.query.withTours === "true") {
      const result = [];
      for (const feed of feeds) {
        const items = await storage.getTourFeedItems(feed.id);
        result.push({ ...feed, tours: items.map(i => i.tour) });
      }
      return res.json(result);
    }
    res.json(feeds);
  });
  app.post("/api/tour-feeds", requireAdmin, async (req, res) => {
    res.json(await storage.createTourFeed(req.body));
  });
  app.put("/api/tour-feeds/:id", requireAdmin, async (req, res) => {
    res.json(await storage.updateTourFeed(req.params.id, req.body));
  });
  app.delete("/api/tour-feeds/:id", requireAdmin, async (req, res) => {
    await storage.deleteTourFeed(req.params.id);
    res.json({ success: true });
  });
  app.get("/api/tour-feeds/:id/tours", async (req, res) => {
    res.json(await storage.getTourFeedItems(req.params.id));
  });
  app.post("/api/tour-feeds/:id/tours", requireAdmin, async (req, res) => {
    res.json(await storage.addTourToFeed(req.params.id, req.body.tourId));
  });
  app.delete("/api/tour-feeds/:feedId/tours/:tourId", requireAdmin, async (req, res) => {
    await storage.removeTourFromFeed(req.params.feedId, req.params.tourId);
    res.json({ success: true });
  });

  // Reviews
  app.get("/api/reviews", async (req, res) => {
    res.json(await storage.getReviews(req.query.tourId as string, req.query.status as string));
  });
  app.get("/api/reviews/featured", async (req, res) => {
    res.json(await storage.getFeaturedReviews());
  });
  app.post("/api/reviews", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const data = insertReviewSchema.parse({ ...req.body, userId: user.id });
      const review = await storage.createReview(data);
      res.json(review);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });
  app.put("/api/reviews/:id/status", requireAdmin, async (req, res) => {
    const { status, inFeaturedFeed } = req.body;
    res.json(await storage.updateReviewStatus(req.params.id, status, inFeaturedFeed));
  });

  // Bookings
  app.get("/api/bookings", requireAuth, async (req, res) => {
    const user = req.user as any;
    if (user.role === "admin") {
      res.json(await storage.getBookings());
    } else {
      res.json(await storage.getBookings(user.id));
    }
  });
  app.get("/api/bookings/:id", requireAuth, async (req, res) => {
    const booking = await storage.getBooking(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    const user = req.user as any;
    if (user.role !== "admin" && booking.userId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(booking);
  });
  app.post("/api/bookings", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const booking = await storage.createBooking({ ...req.body, userId: user.id });
      res.json(booking);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });
  app.put("/api/bookings/:id", requireAuth, async (req, res) => {
    const user = req.user as any;
    const booking = await storage.getBooking(req.params.id);
    if (!booking) return res.status(404).json({ message: "Not found" });
    if (user.role !== "admin" && booking.userId !== user.id) return res.status(403).json({ message: "Forbidden" });
    res.json(await storage.updateBooking(req.params.id, req.body));
  });

  // News
  app.get("/api/news", async (req, res) => {
    const publishedOnly = req.query.all !== "true" || !(req.user && (req.user as any).role === "admin");
    res.json(await storage.getNews(publishedOnly));
  });
  app.get("/api/news/:id", async (req, res) => {
    const item = await storage.getNewsItem(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });
  app.post("/api/news", requireAdmin, async (req, res) => {
    res.json(await storage.createNews(req.body));
  });
  app.put("/api/news/:id", requireAdmin, async (req, res) => {
    res.json(await storage.updateNews(req.params.id, req.body));
  });
  app.delete("/api/news/:id", requireAdmin, async (req, res) => {
    await storage.deleteNews(req.params.id);
    res.json({ success: true });
  });

  // Favorites
  app.get("/api/favorites", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.getFavorites(user.id));
  });
  app.post("/api/favorites/:tourId", requireAuth, async (req, res) => {
    const user = req.user as any;
    const isFav = await storage.toggleFavorite(user.id, req.params.tourId);
    res.json({ isFavorite: isFav });
  });

  // Intro Screen
  app.get("/api/intro-screen", async (req, res) => {
    res.json(await storage.getIntroScreen());
  });
  app.post("/api/intro-screen", requireAdmin, async (req, res) => {
    res.json(await storage.upsertIntroScreen(req.body));
  });

  // Hero Slides
  app.get("/api/hero-slides", async (req, res) => {
    res.json(await storage.getHeroSlides(req.query.active === "true"));
  });
  app.post("/api/hero-slides", requireAdmin, async (req, res) => {
    res.json(await storage.createHeroSlide(req.body));
  });
  app.put("/api/hero-slides/:id", requireAdmin, async (req, res) => {
    res.json(await storage.updateHeroSlide(req.params.id, req.body));
  });
  app.delete("/api/hero-slides/:id", requireAdmin, async (req, res) => {
    await storage.deleteHeroSlide(req.params.id);
    res.json({ success: true });
  });

  // Admin Users
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    const allUsers = await storage.getAllUsers();
    res.json(allUsers.map(({ password: _, ...u }) => u));
  });
  app.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
    const user = await storage.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ message: "Not found" });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  // Stats
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    res.json(await storage.getStats());
  });

  // Password Recovery
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email required" });
      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(404).json({ message: "Email not found" });
      const token = crypto.randomBytes(32).toString("hex");
      await storage.createPasswordResetToken(user.id, token);
      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
      const resetUrl = `${appUrl}/reset-password?token=${token}`;
      const emailSent = await sendPasswordResetEmail(email, resetUrl);
      res.json({ success: true, emailSent, resetUrl: `/reset-password?token=${token}` });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) return res.status(400).json({ message: "Token and new password required" });
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) return res.status(400).json({ message: "Invalid token" });
      if (resetToken.used) return res.status(400).json({ message: "Token already used" });
      if (new Date() > resetToken.expiresAt) return res.status(400).json({ message: "Token expired" });
      const hashed = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(resetToken.userId, hashed);
      await storage.markTokenUsed(token);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // File Upload
  const upload = multer({
    storage: multer.diskStorage({
      destination: path.join(process.cwd(), "client/public/uploads"),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      cb(null, allowed.includes(file.mimetype));
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  app.post("/api/upload", requireAuth, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded or invalid type" });
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  // Analytics
  app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      const { startDate, endDate, paymentType, status } = req.query;
      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (paymentType) filters.paymentType = paymentType;
      if (status) filters.status = status;
      res.json(await storage.getAnalytics(filters));
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Loyalty Settings
  app.get("/api/admin/loyalty-settings", requireAdmin, async (req, res) => {
    res.json(await storage.getLoyaltySettings());
  });

  app.put("/api/admin/loyalty-settings", requireAdmin, async (req, res) => {
    try {
      res.json(await storage.updateLoyaltySettings(req.body));
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  return httpServer;
}
