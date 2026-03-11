CREATE TYPE "public"."booking_status" AS ENUM('new', 'prepaid', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."loyalty_level" AS ENUM('beginner', 'traveler', 'premium');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('prepay', 'full');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "banners" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_ru" text NOT NULL,
	"title_en" text NOT NULL,
	"subtitle_ru" text,
	"subtitle_en" text,
	"image_url" text NOT NULL,
	"link_url" text,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tour_id" varchar NOT NULL,
	"tour_date_id" varchar,
	"adults" integer DEFAULT 1 NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"selected_options" jsonb DEFAULT '[]' NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"paid_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"payment_type" "payment_type" NOT NULL,
	"booking_status" "booking_status" DEFAULT 'new' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_ru" text NOT NULL,
	"name_en" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_id" varchar NOT NULL,
	"name_ru" text NOT NULL,
	"name_en" text NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_ru" text NOT NULL,
	"name_en" text NOT NULL,
	"image_url" text,
	"country_code" varchar(2),
	"tags_ru" text[],
	"tags_en" text[],
	"card_size" varchar(10) DEFAULT 'normal' NOT NULL,
	"show_on_home" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tour_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hero_slides" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_ru" text NOT NULL,
	"title_en" text NOT NULL,
	"subtitle_ru" text,
	"subtitle_en" text,
	"button_text_ru" text,
	"button_text_en" text,
	"button_link" text,
	"media_url" text NOT NULL,
	"media_type" text DEFAULT 'image' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intro_screen" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_ru" text NOT NULL,
	"title_en" text NOT NULL,
	"slogan_ru" text NOT NULL,
	"slogan_en" text NOT NULL,
	"video_url" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_ru" text NOT NULL,
	"title_en" text NOT NULL,
	"content_ru" text NOT NULL,
	"content_en" text NOT NULL,
	"image_url" text,
	"is_published" boolean DEFAULT true NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "price_components" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_ru" text NOT NULL,
	"name_en" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tour_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"text_ru" text NOT NULL,
	"text_en" text,
	"status" "review_status" DEFAULT 'pending' NOT NULL,
	"in_featured_feed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tour_dates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"max_people" integer DEFAULT 20 NOT NULL,
	"booked_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_feed_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feed_id" varchar NOT NULL,
	"tour_id" varchar NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_feeds" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_ru" text NOT NULL,
	"name_en" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"card_width" varchar DEFAULT 'medium' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_itinerary" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" varchar NOT NULL,
	"day_number" integer NOT NULL,
	"title_ru" text NOT NULL,
	"title_en" text NOT NULL,
	"description_ru" text NOT NULL,
	"description_en" text NOT NULL,
	"duration_hours" integer
);
--> statement-breakpoint
CREATE TABLE "tour_options" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" varchar NOT NULL,
	"name_ru" text NOT NULL,
	"name_en" text NOT NULL,
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_price_components" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" varchar NOT NULL,
	"component_id" varchar NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"included" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tours" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_ru" text NOT NULL,
	"title_en" text NOT NULL,
	"description_ru" text NOT NULL,
	"description_en" text NOT NULL,
	"city_id" varchar,
	"country_id" varchar,
	"category_id" varchar,
	"duration" integer NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"discount_percent" integer DEFAULT 0 NOT NULL,
	"main_image" text,
	"images" text[] DEFAULT '{}' NOT NULL,
	"is_hot" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"included_ru" text,
	"included_en" text,
	"not_included_ru" text,
	"not_included_en" text,
	"map_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"name" text NOT NULL,
	"password" text,
	"avatar" text,
	"provider" text DEFAULT 'local' NOT NULL,
	"provider_id" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"loyalty_level" "loyalty_level" DEFAULT 'beginner' NOT NULL,
	"bookings_count" integer DEFAULT 0 NOT NULL,
	"discounts_left" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tour_date_id_tour_dates_id_fk" FOREIGN KEY ("tour_date_id") REFERENCES "public"."tour_dates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_dates" ADD CONSTRAINT "tour_dates_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_feed_items" ADD CONSTRAINT "tour_feed_items_feed_id_tour_feeds_id_fk" FOREIGN KEY ("feed_id") REFERENCES "public"."tour_feeds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_feed_items" ADD CONSTRAINT "tour_feed_items_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_itinerary" ADD CONSTRAINT "tour_itinerary_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_options" ADD CONSTRAINT "tour_options_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_price_components" ADD CONSTRAINT "tour_price_components_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_price_components" ADD CONSTRAINT "tour_price_components_component_id_price_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."price_components"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;