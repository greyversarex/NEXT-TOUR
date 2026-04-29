import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import path from "path";
import { sendPasswordResetEmail, sendWelcomeEmail, sendBookingConfirmationEmail, sendBulkEmail, sendVerificationEmail } from "./email";
import { initiateAlifPayment, checkAlifTransaction, verifyCallbackToken, normalizeAlifStatus } from "./payment";
import multer from "multer";
import { storage } from "./storage";
import {
  insertUserSchema, insertTourSchema, insertTourDateSchema,
  insertPriceComponentSchema, insertTourOptionSchema,
  insertBannerSchema, insertTourFeedSchema,
  insertReviewSchema, insertBookingSchema,
  insertNewsSchema, insertCountrySchema, insertCitySchema, insertCategorySchema,
  insertHotelSchema,
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

const ah = (fn: (req: Request, res: Response, next: any) => Promise<any>) =>
  (req: Request, res: Response, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  app.set("trust proxy", 1);

  app.use(session({
    store: new PgSession({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || "travel-platform-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      sameSite: "lax" as const,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) return done(null, false, { message: "Invalid credentials" });
      if (!user.password) return done(null, false, { message: "This account uses social login. Please sign in with Google, Facebook, or Mail.ru." });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return done(null, false, { message: "Invalid credentials" });
      return done(null, user);
    } catch (e) { return done(e); }
  }));

  // Google OAuth
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const appUrl = process.env.APP_URL || "http://localhost:5000";
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${appUrl}/api/auth/google/callback`,
    }, async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `${profile.id}@google.com`;
        const avatar = profile.photos?.[0]?.value;
        const user = await storage.upsertOAuthUser({ provider: "google", providerId: profile.id, email, name: profile.displayName, avatar });
        done(null, user);
      } catch (e) { done(e as Error); }
    }));
  }

  // Facebook OAuth
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    const appUrl = process.env.APP_URL || "http://localhost:5000";
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${appUrl}/api/auth/facebook/callback`,
      profileFields: ["id", "emails", "name", "picture"],
    }, async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `${profile.id}@facebook.com`;
        const name = [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(" ") || profile.displayName;
        const avatar = profile.photos?.[0]?.value;
        const user = await storage.upsertOAuthUser({ provider: "facebook", providerId: profile.id, email, name, avatar });
        done(null, user);
      } catch (e) { done(e as Error); }
    }));
  }

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
      const body = { ...req.body };
      if (!body.username) {
        const base = (body.email || "").split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_");
        let candidate = base;
        let attempt = 0;
        while (await storage.getUserByUsername(candidate)) {
          attempt++;
          candidate = `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
          if (attempt > 10) candidate = `${base}_${Date.now()}`;
        }
        body.username = candidate;
      }
      const data = insertUserSchema.parse(body);
      const existing = await storage.getUserByEmail(data.email);
      if (existing) return res.status(400).json({ message: "Email already registered" });
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const user = await storage.createUser({ ...data, emailVerificationToken: verificationToken } as any);
      const appUrl = process.env.APP_URL || `https://${process.env.REPLIT_DEV_DOMAIN || "localhost:5000"}`;
      const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}`;
      sendVerificationEmail(data.email, data.name || data.username, verifyUrl).catch(() => {});
      res.json({ needsVerification: true, message: "Verification email sent" });
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Registration failed" });
    }
  });

  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") return res.status(400).json({ message: "Invalid token" });
      const user = await storage.getUserByVerificationToken(token);
      if (!user) return res.status(400).json({ message: "Invalid or expired verification link" });
      if (user.emailVerified) {
        return req.login(user, (err) => {
          if (err) return res.json({ success: true, alreadyVerified: true });
          res.json({ success: true, alreadyVerified: true });
        });
      }
      const updated = await storage.updateUser(user.id, { emailVerified: true, emailVerificationToken: null });
      sendWelcomeEmail(user.email, user.name).catch(() => {});
      req.login(updated || user, (err) => {
        if (err) return res.json({ success: true });
        res.json({ success: true });
      });
    } catch (e: any) {
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email required" });
      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.emailVerified) return res.json({ success: true, alreadyVerified: true });
      const newToken = crypto.randomBytes(32).toString("hex");
      await storage.updateUser(user.id, { emailVerificationToken: newToken });
      const appUrl = process.env.APP_URL || `https://${process.env.REPLIT_DEV_DOMAIN || "localhost:5000"}`;
      const verifyUrl = `${appUrl}/verify-email?token=${newToken}`;
      await sendVerificationEmail(email, user.name, verifyUrl);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: "Failed to resend" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ message: "Authentication error" });
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      if (user.provider === "local" && !user.emailVerified) {
        return res.status(403).json({ message: "Email not verified", needsVerification: true, email: user.email });
      }
      req.login(user, (loginErr) => {
        if (loginErr) return res.status(500).json({ message: "Login failed" });
        const { password: _, emailVerificationToken: _t, ...safeUser } = user;
        res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => res.json({ success: true }));
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    const { password: _, emailVerificationToken: _t, ...safeUser } = req.user as any;
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

  // Endpoint to check which OAuth providers are configured
  app.get("/api/auth/providers", (_req, res) => {
    res.json({
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      facebook: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
      mailru: !!(process.env.MAILRU_APP_ID && process.env.MAILRU_APP_SECRET),
    });
  });

  // Google OAuth routes
  app.get("/api/auth/google", (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({ message: "Google OAuth not configured" });
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });

  app.get("/api/auth/google/callback",
    (req, res, next) => {
      passport.authenticate("google", (err: any, user: any, _info: any) => {
        if (err) {
          console.error("[google oauth] passport error:", err);
          return res.redirect("/?auth=error&provider=google");
        }
        if (!user) {
          console.error("[google oauth] no user returned");
          return res.redirect("/?auth=error&provider=google");
        }
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error("[google oauth] login error:", loginErr);
            return res.redirect("/?auth=error&provider=google");
          }
          console.log("[google oauth] success, user:", user.id, user.email);
          res.redirect("/?auth=success");
        });
      })(req, res, next);
    }
  );

  // Facebook OAuth routes
  app.get("/api/auth/facebook", (req, res, next) => {
    if (!process.env.FACEBOOK_APP_ID) return res.status(503).json({ message: "Facebook OAuth not configured" });
    passport.authenticate("facebook", { scope: ["email"] })(req, res, next);
  });

  app.get("/api/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/?auth=error&provider=facebook" }),
    (req, res) => res.redirect("/?auth=success")
  );

  // Mail.ru OAuth routes (manual OAuth2 flow since no official passport strategy)
  app.get("/api/auth/mailru", (req, res) => {
    const clientId = process.env.MAILRU_APP_ID;
    if (!clientId) return res.status(503).json({ message: "Mail.ru OAuth not configured" });
    const appUrl = process.env.APP_URL || `http://localhost:5000`;
    const redirectUri = encodeURIComponent(`${appUrl}/api/auth/mailru/callback`);
    res.redirect(`https://oauth.mail.ru/login?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=userinfo`);
  });

  app.get("/api/auth/mailru/callback", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) return res.redirect("/?auth=error&provider=mailru");
      const clientId = process.env.MAILRU_APP_ID!;
      const clientSecret = process.env.MAILRU_APP_SECRET!;
      const appUrl = process.env.APP_URL || `http://localhost:5000`;
      const redirectUri = `${appUrl}/api/auth/mailru/callback`;
      // Exchange code for token
      const tokenRes = await fetch("https://oauth.mail.ru/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ code: String(code), client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
      });
      const tokenData = await tokenRes.json() as any;
      if (!tokenData.access_token) return res.redirect("/?auth=error&provider=mailru");
      // Get user info
      const userRes = await fetch(`https://oauth.mail.ru/userinfo?access_token=${tokenData.access_token}`);
      const profile = await userRes.json() as any;
      const user = await storage.upsertOAuthUser({
        provider: "mailru",
        providerId: profile.id,
        email: profile.email,
        name: profile.name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
        avatar: profile.image,
      });
      req.login(user, (err) => {
        if (err) return res.redirect("/?auth=error&provider=mailru");
        res.redirect("/?auth=success");
      });
    } catch (e) {
      console.error("[mailru oauth]", e);
      res.redirect("/?auth=error&provider=mailru");
    }
  });

  // Countries
  app.get("/api/countries", async (req, res) => {
    const showOnHome = req.query.showOnHome === "true";
    res.json(await storage.getCountries(showOnHome || undefined));
  });
  app.post("/api/countries", requireAdmin, async (req, res) => {
    const data = insertCountrySchema.parse(req.body);
    res.json(await storage.createCountry(data));
  });
  app.put("/api/countries/:id", requireAdmin, async (req, res) => {
    res.json(await storage.updateCountry(req.params.id, req.body));
  });
  app.delete("/api/countries/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteCountry(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Cannot delete country" });
    }
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
    try {
      await storage.deleteCity(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Cannot delete city" });
    }
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
      includeInactive: req.query.includeInactive === "true" && req.isAuthenticated() && (req.user as any)?.role === "admin",
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
      const { categoryIds, feedIds, hotelIds, ...tourData } = req.body;
      const tour = await storage.createTour(tourData);
      if (Array.isArray(categoryIds) && categoryIds.length > 0) {
        await storage.setTourCategories(tour.id, categoryIds);
      } else if (tour.categoryId) {
        await storage.setTourCategories(tour.id, [tour.categoryId]);
      }
      if (Array.isArray(feedIds)) {
        await storage.setTourFeeds(tour.id, feedIds);
      }
      if (Array.isArray(hotelIds)) {
        await storage.setTourHotels(tour.id, hotelIds);
      }
      res.json(tour);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.put("/api/tours/:id", requireAdmin, async (req, res) => {
    const { categoryIds, feedIds, hotelIds, ...tourData } = req.body;
    const tour = await storage.updateTour(req.params.id, tourData);
    if (tour) {
      if (Array.isArray(categoryIds)) {
        await storage.setTourCategories(tour.id, categoryIds);
      }
      if (Array.isArray(feedIds)) {
        await storage.setTourFeeds(tour.id, feedIds);
      }
      if (Array.isArray(hotelIds)) {
        await storage.setTourHotels(tour.id, hotelIds);
      }
    }
    res.json(tour);
  });

  app.get("/api/tours/:id/feeds", async (req, res) => {
    const feedIds = await storage.getFeedIdsForTour(req.params.id);
    res.json({ feedIds });
  });

  app.put("/api/tours/:id/feeds", requireAdmin, async (req, res) => {
    const feedIds = Array.isArray(req.body?.feedIds) ? req.body.feedIds : [];
    await storage.setTourFeeds(req.params.id, feedIds);
    res.json({ success: true, feedIds });
  });

  app.delete("/api/tours/:id", requireAdmin, async (req, res) => {
    await storage.deleteTour(req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/tours/:id/permanent", requireAdmin, async (req, res) => {
    try {
      await storage.permanentDeleteTour(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Cannot delete tour" });
    }
  });

  app.post("/api/tours/:id/clone", requireAdmin, async (req, res) => {
    try {
      const cloned = await storage.cloneTour(req.params.id);
      res.json(cloned);
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Cannot clone tour" });
    }
  });

  app.get("/api/tours/:id/categories", async (req, res) => {
    const categoryIds = await storage.getTourCategoryIds(req.params.id);
    res.json({ categoryIds });
  });

  // Tour full details
  app.get("/api/tours/:id/full", async (req, res) => {
    const tour = await storage.getTour(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    const [dates, priceComponents, options, days, allStops, reviews, priceTiers, country, city, category, categoryIds, hotels] = await Promise.all([
      storage.getTourDates(req.params.id),
      storage.getTourPriceComponents(req.params.id),
      storage.getTourOptions(req.params.id),
      storage.getTourItinerary(req.params.id),
      storage.getAllStopsForTour(req.params.id),
      storage.getReviews(req.params.id, "approved"),
      storage.getTourPriceTiers(req.params.id),
      tour.countryId ? storage.getCountry(tour.countryId) : Promise.resolve(undefined),
      tour.cityId ? storage.getCity(tour.cityId) : Promise.resolve(undefined),
      tour.categoryId ? storage.getCategory(tour.categoryId) : Promise.resolve(undefined),
      storage.getTourCategoryIds(req.params.id),
      storage.getTourHotels(req.params.id),
    ]);
    const itinerary = days.map(day => ({
      ...day,
      stops: allStops.filter(s => s.itineraryDayId === day.id).sort((a, b) => a.stopOrder - b.stopOrder),
    }));
    let isFavorite = false;
    if (req.user) {
      isFavorite = await storage.isFavorite((req.user as any).id, req.params.id);
    }
    const allCategories = await storage.getCategories();
    const categories = allCategories.filter(c => categoryIds.includes(c.id));
    res.json({ tour, dates, priceComponents, options, itinerary, reviews, priceTiers, isFavorite, country, city, category, categories, categoryIds, hotels });
  });

  // Tour Dates
  app.get("/api/tours/:id/price-tiers", ah(async (req, res) => {
    res.json(await storage.getTourPriceTiers(req.params.id));
  }));
  app.post("/api/tours/:id/price-tiers", requireAdmin, ah(async (req, res) => {
    const { minPeople, maxPeople, pricePerPerson, labelRu, labelEn } = req.body;
    const maxPeopleVal = maxPeople != null && maxPeople !== "" ? Number(maxPeople) : null;
    if (!minPeople || !pricePerPerson || minPeople < 1 || (maxPeopleVal !== null && maxPeopleVal < minPeople) || Number(pricePerPerson) <= 0) {
      return res.status(400).json({ message: "Invalid tier data: minPeople must be >= 1, maxPeople >= minPeople (optional), price > 0" });
    }
    res.json(await storage.createTourPriceTier({ minPeople: Number(minPeople), maxPeople: maxPeopleVal, pricePerPerson: String(pricePerPerson), labelRu: labelRu || null, labelEn: labelEn || null, tourId: req.params.id }));
  }));
  app.put("/api/tour-price-tiers/:id", requireAdmin, ah(async (req, res) => {
    res.json(await storage.updateTourPriceTier(req.params.id, req.body));
  }));
  app.delete("/api/tour-price-tiers/:id", requireAdmin, ah(async (req, res) => {
    await storage.deleteTourPriceTier(req.params.id);
    res.json({ success: true });
  }));

  app.get("/api/tours/:id/dates", ah(async (req, res) => {
    res.json(await storage.getTourDates(req.params.id));
  }));
  app.post("/api/tours/:id/dates", requireAdmin, ah(async (req, res) => {
    const data = insertTourDateSchema.parse({ ...req.body, tourId: req.params.id });
    res.json(await storage.createTourDate(data));
  }));
  app.put("/api/tour-dates/:id", requireAdmin, ah(async (req, res) => {
    res.json(await storage.updateTourDate(req.params.id, req.body));
  }));
  app.delete("/api/tour-dates/:id", requireAdmin, ah(async (req, res) => {
    await storage.deleteTourDate(req.params.id);
    res.json({ success: true });
  }));

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
    const days = await storage.getTourItinerary(req.params.id);
    const allStops = await storage.getAllStopsForTour(req.params.id);
    const daysWithStops = days.map(day => ({
      ...day,
      stops: allStops.filter(s => s.itineraryDayId === day.id).sort((a, b) => a.stopOrder - b.stopOrder),
    }));
    res.json(daysWithStops);
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

  // Itinerary Stops
  app.get("/api/itinerary/:dayId/stops", async (req, res) => {
    res.json(await storage.getItineraryStops(req.params.dayId));
  });
  app.post("/api/itinerary/:dayId/stops", requireAdmin, async (req, res) => {
    res.json(await storage.createItineraryStop({ ...req.body, itineraryDayId: req.params.dayId }));
  });
  app.put("/api/itinerary-stops/:id", requireAdmin, async (req, res) => {
    res.json(await storage.updateItineraryStop(req.params.id, req.body));
  });
  app.delete("/api/itinerary-stops/:id", requireAdmin, async (req, res) => {
    await storage.deleteItineraryStop(req.params.id);
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
  app.patch("/api/banners/reorder", requireAdmin, async (req, res) => {
    const { orderedIds } = req.body as { orderedIds: string[] };
    if (!Array.isArray(orderedIds)) return res.status(400).json({ error: "orderedIds required" });
    await Promise.all(orderedIds.map((id, idx) => storage.updateBanner(id, { order: idx })));
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
    const includeInactive = req.query.includeInactive === "true" && req.isAuthenticated() && (req.user as any)?.role === "admin";
    res.json(await storage.getTourFeedItems(req.params.id, includeInactive));
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
  app.post("/api/bookings", async (req, res) => {
    try {
      const user = req.user as any;
      const { guestName, guestEmail, guestPhone, ...rest } = req.body;

      // Require either authenticated user or guest contact info
      if (!user && !guestEmail && !guestPhone) {
        return res.status(400).json({ message: "Укажите email или телефон для связи" });
      }

      const bookingData: any = { ...rest };
      if (user) {
        bookingData.userId = user.id;
      } else {
        bookingData.guestName = guestName || null;
        bookingData.guestEmail = guestEmail || null;
        bookingData.guestPhone = guestPhone || null;
      }

      const booking = await storage.createBooking(bookingData);

      // Send confirmation email
      const toEmail = user?.email || guestEmail;
      const toName = user?.name || guestName || "Уважаемый клиент";
      if (toEmail) {
        const tour = await storage.getTour(booking.tourId);
        let startDate: string | undefined;
        let endDate: string | undefined;
        if (booking.tourDateId) {
          const dates = await storage.getTourDates(booking.tourId);
          const d = dates.find((x: any) => x.id === booking.tourDateId);
          if (d) {
            startDate = new Date(d.startDate).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
            endDate = new Date(d.endDate).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
          }
        }
        sendBookingConfirmationEmail({
          toEmail,
          name: toName,
          tourTitle: tour?.titleRu || "Тур",
          bookingId: booking.id,
          adults: booking.adults,
          children: booking.children,
          totalPrice: booking.totalPrice,
          startDate,
          endDate,
        }).catch(err => console.error("[email] booking confirmation error:", err));
      }

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

  // Hotels
  app.get("/api/hotels", async (req, res) => {
    const filters: { countryId?: string; cityId?: string } = {};
    if (req.query.countryId) filters.countryId = req.query.countryId as string;
    if (req.query.cityId) filters.cityId = req.query.cityId as string;
    res.json(await storage.getHotels(filters));
  });
  app.get("/api/hotels/:id", async (req, res) => {
    const hotel = await storage.getHotel(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json(hotel);
  });
  app.post("/api/hotels", requireAdmin, async (req, res) => {
    try {
      const data = insertHotelSchema.parse(req.body);
      res.json(await storage.createHotel(data));
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });
  app.put("/api/hotels/:id", requireAdmin, async (req, res) => {
    res.json(await storage.updateHotel(req.params.id, req.body));
  });
  app.delete("/api/hotels/:id", requireAdmin, async (req, res) => {
    await storage.deleteHotel(req.params.id);
    res.json({ success: true });
  });

  // Tour Hotels (selection per tour)
  app.get("/api/tours/:id/hotels", async (req, res) => {
    res.json(await storage.getTourHotels(req.params.id));
  });
  app.put("/api/tours/:id/hotels", requireAdmin, async (req, res) => {
    const hotelIds = Array.isArray(req.body?.hotelIds) ? req.body.hotelIds : [];
    await storage.setTourHotels(req.params.id, hotelIds);
    res.json({ success: true, hotelIds });
  });

  // Inquiries
  app.get("/api/inquiries", requireAdmin, async (req, res) => {
    res.json(await storage.getInquiries());
  });
  app.post("/api/inquiries", async (req, res) => {
    try {
      const { tourId, name, phone, email, message } = req.body;
      if (!tourId || !name) {
        return res.status(400).json({ message: "Укажите имя и тур" });
      }
      if (!phone && !email) {
        return res.status(400).json({ message: "Укажите телефон или email" });
      }
      const inquiry = await storage.createInquiry({ tourId, name, phone: phone || null, email: email || null, message: message || null });
      res.json(inquiry);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });
  app.put("/api/inquiries/:id", requireAdmin, async (req, res) => {
    const inquiry = await storage.getInquiry(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Not found" });
    res.json(await storage.updateInquiry(req.params.id, req.body));
  });
  app.delete("/api/inquiries/:id", requireAdmin, async (req, res) => {
    await storage.deleteInquiry(req.params.id);
    res.json({ success: true });
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
    res.json(allUsers.map(({ password: _, emailVerificationToken: _t, ...u }) => u));
  });
  app.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
    const user = await storage.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ message: "Not found" });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });
  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "Not found" });
    if (user.role === "admin") return res.status(400).json({ message: "Cannot delete admin user" });
    await storage.deleteUser(req.params.id);
    res.json({ success: true });
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
  // Uploads are stored in a persistent directory at the project root,
  // outside of dist/ so they survive npm run build without requiring a redeploy.
  const uploadsDir = path.join(process.cwd(), "uploads");
  const upload = multer({
    storage: multer.diskStorage({
      destination: uploadsDir,
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith("image/") || ["video/mp4", "video/quicktime", "video/webm"].includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Неподдерживаемый тип файла: ${file.mimetype}`));
      }
    },
    limits: { fileSize: 200 * 1024 * 1024 },
  });

  app.post("/api/upload", requireAuth, (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message || "Upload error" });
      if (!req.file) return res.status(400).json({ message: "Файл не загружен или неподдерживаемый тип" });
      res.json({ url: `/uploads/${req.file.filename}` });
    });
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
  app.get("/api/settings/home-layout", async (req, res) => {
    res.json(await storage.getHomeLayout());
  });
  app.post("/api/settings/home-layout", requireAdmin, async (req, res) => {
    const { order } = req.body as { order: string[] };
    if (!Array.isArray(order)) return res.status(400).json({ error: "order required" });
    await storage.setHomeLayout(order);
    res.json({ success: true });
  });

  app.get("/api/settings/site-background", async (req, res) => {
    const bg = await storage.getSiteBackground();
    res.json(bg ?? { imageUrl: "", overlay: 25, position: "50% 50%" });
  });
  app.post("/api/settings/site-background", requireAdmin, async (req, res) => {
    const { imageUrl, overlay, position } = req.body as { imageUrl: string; overlay: number; position: string };
    await storage.setSiteBackground({
      imageUrl: imageUrl || "",
      overlay: Number(overlay) || 25,
      position: position || "50% 50%",
    });
    res.json({ success: true });
  });

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

  // Currencies (public)
  app.get("/api/currencies", ah(async (req, res) => {
    res.json(await storage.getCurrencies(true));
  }));

  // Currencies (admin)
  app.get("/api/admin/currencies", requireAdmin, ah(async (req, res) => {
    res.json(await storage.getCurrencies(false));
  }));
  app.post("/api/admin/currencies", requireAdmin, ah(async (req, res) => {
    const { code, symbol, nameRu, nameEn, rateToBase, isBase, isActive, sortOrder } = req.body;
    if (!code || !symbol || !nameRu || !nameEn || rateToBase === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (isBase) {
      const existing = await storage.getCurrencies(false);
      for (const c of existing) {
        if (c.isBase) await storage.updateCurrency(c.id, { isBase: false });
      }
    }
    res.json(await storage.createCurrency({ code, symbol, nameRu, nameEn, rateToBase: String(rateToBase), isBase: isBase || false, isActive: isActive !== false, sortOrder: sortOrder || 0 }));
  }));
  app.put("/api/admin/currencies/:id", requireAdmin, ah(async (req, res) => {
    if (req.body.isBase) {
      const existing = await storage.getCurrencies(false);
      for (const c of existing) {
        if (c.isBase && c.id !== req.params.id) await storage.updateCurrency(c.id, { isBase: false });
      }
    }
    res.json(await storage.updateCurrency(req.params.id, req.body));
  }));
  app.delete("/api/admin/currencies/:id", requireAdmin, ah(async (req, res) => {
    await storage.deleteCurrency(req.params.id);
    res.json({ success: true });
  }));

  const existing = await storage.getCurrencies(false);
  if (existing.length === 0) {
    await storage.createCurrency({ code: "TJS", symbol: "TJS", nameRu: "Сомони", nameEn: "Somoni", rateToBase: "1", isBase: true, isActive: true, sortOrder: 0 });
    await storage.createCurrency({ code: "USD", symbol: "$", nameRu: "Доллар США", nameEn: "US Dollar", rateToBase: "10.89", isBase: false, isActive: true, sortOrder: 1 });
    await storage.createCurrency({ code: "EUR", symbol: "€", nameRu: "Евро", nameEn: "Euro", rateToBase: "11.85", isBase: false, isActive: true, sortOrder: 2 });
    await storage.createCurrency({ code: "RUB", symbol: "₽", nameRu: "Рубль", nameEn: "Ruble", rateToBase: "0.13", isBase: false, isActive: true, sortOrder: 3 });
    console.log("[currencies] Seeded default currencies (TJS, USD, EUR, RUB)");
  }

  // Email broadcast (admin only)
  app.post("/api/admin/email/broadcast", requireAdmin, ah(async (req, res) => {
    const { subject, html, audience } = req.body;
    if (!subject || !html) return res.status(400).json({ message: "subject and html are required" });

    const allUsers = await storage.getAllUsers();
    const verified = allUsers.filter(u => u.emailVerified);

    let recipients: Array<{ email: string; name: string }>;
    if (audience === "all") {
      recipients = verified.map(u => ({ email: u.email, name: u.name }));
    } else if (audience === "booked") {
      const allBookings = await storage.getBookings();
      const bookedUserIds = new Set(allBookings.map((b: any) => b.userId));
      recipients = verified.filter(u => bookedUserIds.has(u.id)).map(u => ({ email: u.email, name: u.name }));
    } else {
      recipients = verified.filter(u => u.role === "user").map(u => ({ email: u.email, name: u.name }));
    }

    if (recipients.length === 0) return res.json({ sent: 0, failed: 0, total: 0 });

    const result = await sendBulkEmail({ recipients, subject, html });
    res.json({ ...result, total: recipients.length });
  }));

  // Send booking confirmation manually (admin)
  app.post("/api/admin/email/booking/:id", requireAdmin, ah(async (req, res) => {
    const booking = await storage.getBooking(req.params.id) as any;
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const user = await storage.getUser(booking.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let startDate: string | undefined;
    let endDate: string | undefined;
    if (booking.tourDateId) {
      const dates = await storage.getTourDates(booking.tourId);
      const d = dates.find((x: any) => x.id === booking.tourDateId);
      if (d) {
        startDate = new Date(d.startDate).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
        endDate = new Date(d.endDate).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
      }
    }

    const ok = await sendBookingConfirmationEmail({
      toEmail: user.email,
      name: user.name,
      tourTitle: booking.tour?.titleRu || "Тур",
      bookingId: booking.id,
      adults: booking.adults,
      children: booking.children,
      totalPrice: booking.totalPrice,
      startDate,
      endDate,
    });

    res.json({ success: ok });
  }));

  // ── Alif Acquiring Payments ──────────────────────────────────────────────
  const getAppBaseUrl = (req: Request) => {
    const proto = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    return `${proto}://${host}`;
  };

  app.post("/api/payments/initiate", ah(async (req, res) => {
    const user = req.user as any;
    const { bookingId, gate = "vsa" } = req.body;
    if (!bookingId) return res.status(400).json({ message: "bookingId required" });

    const booking = await storage.getBooking(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (user && user.role !== "admin" && booking.userId && booking.userId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const existing = await storage.getAlifPaymentByBookingId(bookingId);
    if (existing && existing.status === "ok") {
      return res.status(400).json({ message: "Booking already paid" });
    }

    const paymentType = booking.paymentType;
    const totalPrice = Number(booking.totalPrice);
    const amount = paymentType === "prepay" ? totalPrice * 0.3 : totalPrice;

    const appUrl = process.env.APP_URL || getAppBaseUrl(req);
    const orderId = String(Date.now());
    const callbackUrl = `${appUrl}/api/payments/callback`;
    const returnUrl = `${appUrl}/payment/result?orderId=${orderId}`;

    try {
      await storage.createAlifPayment({
        bookingId,
        orderId,
        amount: amount.toFixed(2),
        gate,
      });

      const result = await initiateAlifPayment({
        orderId,
        amount,
        gate,
        callbackUrl,
        returnUrl,
        info: `Тур: ${(booking as any).tour?.titleRu || "Бронирование"}`,
        email: user?.email || (booking as any).guestEmail || "",
        phone: (booking as any).guestPhone || "",
      });

      if (result.type === "redirect" && result.url) {
        if (req.query.redirect === "true") {
          return res.redirect(result.url);
        }
        return res.json({ success: true, url: result.url, orderId });
      }

      if (result.type === "form" && result.formHtml) {
        if (req.query.redirect === "true") {
          res.setHeader("Content-Type", "text/html");
          return res.send(result.formHtml);
        }
        return res.json({ success: true, formHtml: result.formHtml, orderId });
      }

      return res.status(500).json({ message: "Payment initiation failed" });
    } catch (err: any) {
      console.error("[alif] payment error:", err.message);
      return res.status(500).json({ message: err.message || "Payment service error" });
    }
  }));

  app.post("/api/payments/callback", async (req, res) => {
    try {
      const body = req.body || {};

      const orderId = String(body.orderId || body.order_id || "");
      const rawStatus = body.status || body.Status || body.STATUS;
      const transactionId = body.transactionId || body.transaction_id;
      const callbackToken = body.token || body.Token;
      const rawAmount = body.amount || body.Amount;

      console.log(`[alif] Callback: orderId=${orderId} status=${rawStatus} txn=${transactionId} body=${JSON.stringify(body)}`);

      if (!orderId) {
        console.warn("[alif] Callback missing orderId, ignoring");
        return res.status(200).send("OK");
      }

      const payment = await storage.getAlifPaymentByOrderId(orderId);
      if (!payment) {
        console.warn(`[alif] Payment not found for orderId=${orderId}`);
        return res.status(200).send("OK");
      }

      if (callbackToken) {
        const txnId = String(transactionId || "");
        const status = String(rawStatus || "");
        const isValid = verifyCallbackToken(orderId, status, txnId, String(callbackToken));
        if (!isValid) {
          console.error(`[alif] Callback token verification FAILED for orderId=${orderId}`);
          return res.status(200).send("OK");
        }
        console.log(`[alif] Callback token verified OK`);
      } else {
        console.warn(`[alif] Callback has no token — skipping verification for orderId=${orderId}`);
      }

      const alifStatus = normalizeAlifStatus(rawStatus);
      console.log(`[alif] Status: raw="${rawStatus}" → normalized="${alifStatus}"`);

      if (alifStatus === null || alifStatus === "pending") {
        console.log(`[alif] Ignoring transient status="${rawStatus}" for orderId=${orderId}`);
        return res.status(200).send("OK");
      }

      await storage.updateAlifPayment(payment.id, {
        status: (alifStatus === "ok" ? "ok" : "failed") as any,
        transactionId: transactionId?.toString(),
        alifResponse: body,
      });

      if (alifStatus === "ok") {
        const booking = await storage.getBooking(payment.bookingId);
        if (booking) {
          const newBookingStatus = booking.paymentType === "prepay" ? "prepaid" : "paid";
          const paidAmount = rawAmount != null
            ? Number(rawAmount).toFixed(2)
            : payment.amount;
          await storage.updateBooking(payment.bookingId, {
            bookingStatus: newBookingStatus as any,
            paidAmount,
          });
          console.log(`[alif] Payment ${orderId} SUCCESS → booking ${payment.bookingId} → ${newBookingStatus}`);
        }
      } else {
        console.log(`[alif] Payment ${orderId} status=${alifStatus} — booking NOT updated`);
      }

      res.status(200).send("OK");
    } catch (err) {
      console.error("[alif] callback error:", err);
      res.status(200).send("OK");
    }
  });

  // Get payment status for a booking
  app.get("/api/payments/booking/:bookingId", requireAuth, ah(async (req, res) => {
    const user = req.user as any;
    const booking = await storage.getBooking(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (user.role !== "admin" && booking.userId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const payment = await storage.getAlifPaymentByBookingId(req.params.bookingId);
    res.json(payment || null);
  }));

  // Get payment status by orderId (for result page — guests allowed via orderId)
  app.get("/api/payments/order/:orderId", ah(async (req, res) => {
    const user = req.user as any;
    const payment = await storage.getAlifPaymentByOrderId(req.params.orderId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    const booking = await storage.getBooking(payment.bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (user && user.role !== "admin" && booking.userId && booking.userId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json({ payment, booking });
  }));

  // Check txn status from Alif directly
  app.post("/api/payments/check/:orderId", requireAuth, ah(async (req, res) => {
    const user = req.user as any;
    const payment = await storage.getAlifPaymentByOrderId(req.params.orderId);
    if (!payment) return res.status(404).json({ message: "Not found" });
    const booking = await storage.getBooking(payment.bookingId);
    if (!booking) return res.status(404).json({ message: "Not found" });
    if (user.role !== "admin" && booking.userId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const result = await checkAlifTransaction({ orderId: payment.orderId });
    res.json(result);
  }));

  return httpServer;
}
