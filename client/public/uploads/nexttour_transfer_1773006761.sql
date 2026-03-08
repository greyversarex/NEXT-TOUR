--
-- PostgreSQL database dump
--

\restrict I7iD3EzOWycWVcdh0daMhKVp0jlTmgd6XMiWFEnAfmHFGbgJlzL6xketAMbw2fR

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: booking_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_status AS ENUM (
    'new',
    'prepaid',
    'paid',
    'cancelled'
);


--
-- Name: loyalty_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.loyalty_level AS ENUM (
    'beginner',
    'traveler',
    'premium'
);


--
-- Name: payment_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_type AS ENUM (
    'prepay',
    'full'
);


--
-- Name: review_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.review_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'admin'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banners (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title_ru text NOT NULL,
    title_en text NOT NULL,
    subtitle_ru text,
    subtitle_en text,
    image_url text NOT NULL,
    link_url text,
    "order" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    tour_id character varying NOT NULL,
    tour_date_id character varying,
    adults integer DEFAULT 1 NOT NULL,
    children integer DEFAULT 0 NOT NULL,
    selected_options jsonb DEFAULT '[]'::jsonb NOT NULL,
    total_price numeric(10,2) NOT NULL,
    paid_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    payment_type public.payment_type NOT NULL,
    booking_status public.booking_status DEFAULT 'new'::public.booking_status NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name_ru text NOT NULL,
    name_en text NOT NULL
);


--
-- Name: cities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cities (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    country_id character varying NOT NULL,
    name_ru text NOT NULL,
    name_en text NOT NULL,
    image_url text
);


--
-- Name: countries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.countries (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name_ru text NOT NULL,
    name_en text NOT NULL,
    image_url text,
    country_code character varying(2),
    tags_ru text[],
    tags_en text[],
    card_size character varying(10) DEFAULT 'normal'::character varying NOT NULL,
    show_on_home boolean DEFAULT false NOT NULL
);


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    tour_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: hero_slides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hero_slides (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title_ru text NOT NULL,
    title_en text NOT NULL,
    subtitle_ru text,
    subtitle_en text,
    button_text_ru text,
    button_text_en text,
    button_link text,
    media_url text NOT NULL,
    media_type text DEFAULT 'image'::text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: intro_screen; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.intro_screen (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title_ru text NOT NULL,
    title_en text NOT NULL,
    slogan_ru text NOT NULL,
    slogan_en text NOT NULL,
    video_url text,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title_ru text NOT NULL,
    title_en text NOT NULL,
    content_ru text NOT NULL,
    content_en text NOT NULL,
    image_url text,
    is_published boolean DEFAULT true NOT NULL,
    published_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: price_components; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_components (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name_ru text NOT NULL,
    name_en text NOT NULL
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    tour_id character varying NOT NULL,
    rating integer NOT NULL,
    text_ru text NOT NULL,
    text_en text,
    status public.review_status DEFAULT 'pending'::public.review_status NOT NULL,
    in_featured_feed boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL
);


--
-- Name: tour_dates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_dates (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tour_id character varying NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    max_people integer DEFAULT 20 NOT NULL,
    booked_count integer DEFAULT 0 NOT NULL
);


--
-- Name: tour_feed_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_feed_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    feed_id character varying NOT NULL,
    tour_id character varying NOT NULL,
    "order" integer DEFAULT 0 NOT NULL
);


--
-- Name: tour_feeds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_feeds (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name_ru text NOT NULL,
    name_en text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    card_width character varying DEFAULT 'medium'::character varying NOT NULL
);


--
-- Name: tour_itinerary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_itinerary (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tour_id character varying NOT NULL,
    day_number integer NOT NULL,
    title_ru text NOT NULL,
    title_en text NOT NULL,
    description_ru text NOT NULL,
    description_en text NOT NULL,
    duration_hours integer
);


--
-- Name: tour_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_options (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tour_id character varying NOT NULL,
    name_ru text NOT NULL,
    name_en text NOT NULL,
    price numeric(10,2) NOT NULL
);


--
-- Name: tour_price_components; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_price_components (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tour_id character varying NOT NULL,
    component_id character varying NOT NULL,
    price numeric(10,2) NOT NULL,
    included boolean DEFAULT true NOT NULL
);


--
-- Name: tours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tours (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title_ru text NOT NULL,
    title_en text NOT NULL,
    description_ru text NOT NULL,
    description_en text NOT NULL,
    city_id character varying,
    country_id character varying,
    category_id character varying,
    duration integer NOT NULL,
    base_price numeric(10,2) NOT NULL,
    discount_percent integer DEFAULT 0 NOT NULL,
    main_image text,
    images text[] DEFAULT '{}'::text[] NOT NULL,
    is_hot boolean DEFAULT false NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    included_ru text,
    included_en text,
    not_included_ru text,
    not_included_en text,
    map_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    name text NOT NULL,
    password text NOT NULL,
    avatar text,
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    loyalty_level public.loyalty_level DEFAULT 'beginner'::public.loyalty_level NOT NULL,
    bookings_count integer DEFAULT 0 NOT NULL,
    discounts_left integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banners (id, title_ru, title_en, subtitle_ru, subtitle_en, image_url, link_url, "order", is_active) FROM stdin;
0af2141d-7ebf-4bd4-a874-c78716c200e9	Специальное предложение: Бали со скидкой 15%!	Special Offer: Bali 15% off!	\N	\N	/images/tour-bali.png	/promotions	1	t
fa675397-ea67-417d-a7e6-230703efefc1	Раннее бронирование — сэкономьте до 25%	Early Booking — Save up to 25%	\N	\N	/images/tour-paris.png	/tours	2	t
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (id, user_id, tour_id, tour_date_id, adults, children, selected_options, total_price, paid_amount, payment_type, booking_status, notes, created_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name_ru, name_en) FROM stdin;
4bfc4c72-2f87-4d49-961d-3914101052d7	Пляжный отдых	Beach
cfb172d7-6613-4076-82ea-7e8556f455f3	Культура и история	Culture & History
9674b9b3-66e9-49d9-8134-06458353248e	Горы	Mountains
8c9302ca-1dbc-4270-9f04-67d041ffbfb0	Экзотика	Exotic
908cd3c8-ac00-4241-a91f-a01ed817953a	Романтика	Romance
98a58cc1-e353-469d-a292-f122a582212f	Приключения	Adventures
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cities (id, country_id, name_ru, name_en, image_url) FROM stdin;
27948356-9ad8-469a-b380-36b567b1690e	2a1ef1f5-cbb1-4efe-ae64-3f07d2d0e940	Санторини	Santorini	\N
8977b438-916e-4781-92ff-c53a0db8321c	2a1ef1f5-cbb1-4efe-ae64-3f07d2d0e940	Афины	Athens	\N
2b105fd6-576a-4f64-a5dd-3ac9023b803f	65b36981-4d71-41d5-b601-402d67816fa6	Бали	Bali	\N
a3e0fb0f-ca95-42e6-b745-90c495134b74	26591d55-4360-41a0-bfd7-50f291bb6e0f	Женева	Geneva	\N
b40fe296-12f3-4a81-9533-9d4881fffa5c	2fa4b10f-04b7-4605-bcaa-54c46bfad7b1	Токио	Tokyo	\N
ead7ec54-b088-467b-9d25-a17ece1224d8	2fa4b10f-04b7-4605-bcaa-54c46bfad7b1	Киото	Kyoto	\N
46a21180-30b2-45e6-a5fa-44845225c20c	7d72c8e9-6115-44db-922f-adf3264f69d7	Мале	Male	\N
1295200c-bd7b-4c9e-bb81-7f9b4e7979ec	b238150d-1115-4f25-bb69-fea81b4979f8	Париж	Paris	\N
f206213c-6797-4aa3-8cb8-f5dc4fcc3737	12a16b6b-e8c5-4a1f-b1b3-6e63fd5711d5	Лима	Lima	\N
\.


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.countries (id, name_ru, name_en, image_url, country_code, tags_ru, tags_en, card_size, show_on_home) FROM stdin;
65b36981-4d71-41d5-b601-402d67816fa6	Индонезия	Indonesia	/images/tour-bali.png	ID	{Тропики,Культура,Сёрфинг}	{Tropics,Culture,Surfing}	normal	t
2fa4b10f-04b7-4605-bcaa-54c46bfad7b1	Япония	Japan	/images/tour-tokyo.png	JP	{Культура,Сакура,Кухня}	{Culture,"Cherry Blossoms",Cuisine}	normal	t
7d72c8e9-6115-44db-922f-adf3264f69d7	Мальдивы	Maldives	/images/tour-maldives.png	MV	{Пляжи,Острова,Кораллы}	{Beaches,Islands,Corals}	normal	t
70f6d772-4552-43d4-8b3b-3581eaa63508	Нидерланды	Nigerlands	/uploads/1772992661547-g00siuxhtnn.gif	NR	{Просторы,Красота,Жизнь}	\N	normal	t
12a16b6b-e8c5-4a1f-b1b3-6e63fd5711d5	Перу	Peru	/images/tour-peru.png	\N	\N	\N	wide	t
26591d55-4360-41a0-bfd7-50f291bb6e0f	Швейцария	Switzerland	/images/tour-swiss.png	CH	{Горы,Природа,Люкс}	{Mountains,Nature,Luxury}	full	t
b238150d-1115-4f25-bb69-fea81b4979f8	Франция	France	/images/tour-paris.png	FR	{Романтика,Искусство,Кухня}	{Romance,Art,Cuisine}	wide	t
2a1ef1f5-cbb1-4efe-ae64-3f07d2d0e940	Греция	Greece	/images/tour-santorini.png	GR	{Острова,Архитектура,Закаты}	{Islands,Architecture,Sunsets}	normal	t
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.favorites (id, user_id, tour_id, created_at) FROM stdin;
\.


--
-- Data for Name: hero_slides; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hero_slides (id, title_ru, title_en, subtitle_ru, subtitle_en, button_text_ru, button_text_en, button_link, media_url, media_type, "order", is_active) FROM stdin;
854d818c-7ec2-47cf-aa27-122c61b60b94	Откройте мир путешествий	Discover the World	Лучшие туры по всему миру по доступным ценам	Best tours worldwide at affordable prices	Найти тур	Find a Tour	/tours	/images/hero-banner.png	image	1	t
8bee105f-614b-4bba-b26e-dc7c1d67fd3b	Горящие предложения!	Hot Deals!	Скидки до 20% на популярные направления	Up to 20% off on popular destinations	Смотреть акции	View Deals	/promotions	/images/tour-bali.png	image	2	t
\.


--
-- Data for Name: intro_screen; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.intro_screen (id, title_ru, title_en, slogan_ru, slogan_en, video_url, is_active) FROM stdin;
f322a793-1396-4bbb-9d1c-4c2a5626f816	NEXT TOUR	NEXT TOUR	Открой мир путешествий	Discover the World	/uploads/1772924879855-mnnzmbv737o.gif	t
\.


--
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.news (id, title_ru, title_en, content_ru, content_en, image_url, is_published, published_at) FROM stdin;
c70758b4-8081-4ccb-bb48-9c745a62ba59	Топ-5 направлений лета 2024	Top 5 Summer 2024 Destinations	Лето 2024 обещает быть насыщенным на путешествия! Мы собрали для вас лучшие направления, которые стоит посетить этим летом.\n\n1. Санторини, Греция — невероятные закаты и белоснежная архитектура.\n\n2. Бали, Индонезия — тропический рай для любителей природы и культуры.\n\n3. Париж, Франция — вечная романтика и искусство.\n\n4. Токио, Япония — будущее и традиции в одном городе.\n\n5. Мальдивы — идеальный пляжный отдых.	Summer 2024 promises to be full of travel opportunities! We have gathered the best destinations worth visiting this summer.\n\n1. Santorini, Greece — incredible sunsets and white architecture.\n\n2. Bali, Indonesia — a tropical paradise for nature and culture lovers.\n\n3. Paris, France — eternal romance and art.\n\n4. Tokyo, Japan — future and tradition in one city.\n\n5. Maldives — perfect beach vacation.	/images/tour-santorini.png	t	2026-03-06 18:01:35.404297
adb5af36-78c6-4f2c-b93d-6e9629055a3b	Советы опытного путешественника	Tips from an Experienced Traveler	Опытные путешественники знают, как сделать любую поездку комфортнее и дешевле. Вот несколько проверенных советов.\n\nБронируйте заранее — ранее бронирование может сэкономить до 40% стоимости тура.\n\nПакуйте разумно — список необходимых вещей поможет не взять лишнего.\n\nИзучайте культуру — знание местных обычаев сделает путешествие богаче.\n\nВсегда берите страховку — это небольшие расходы, которые могут спасти вас в непредвиденных ситуациях.	Experienced travelers know how to make any trip more comfortable and affordable. Here are some proven tips.\n\nBook early — early booking can save up to 40% of tour costs.\n\nPack wisely — a packing list helps avoid unnecessary items.\n\nLearn the culture — knowing local customs enriches travel.\n\nAlways get insurance — a small expense that can save you in unforeseen situations.	/images/tour-swiss.png	t	2026-03-06 18:01:35.404297
46d61a3a-dfe0-4fce-9563-c34429d9a610	Новый сезон в Японии: сакура 2024	New Season in Japan: Cherry Blossom 2024	Весенний сезон в Японии — это время цветения сакуры, одного из самых завораживающих природных явлений в мире. В 2024 году прогнозируется особенно красивое цветение. Лучшие места для наблюдения: парк Уэно в Токио, Философская тропа в Киото, замок Химэдзи.	Spring season in Japan is cherry blossom time, one of the most mesmerizing natural phenomena in the world. 2024 forecasts particularly beautiful blooming. Best viewing spots: Ueno Park in Tokyo, Philosopher's Path in Kyoto, Himeji Castle.	/images/tour-tokyo.png	t	2026-03-06 18:01:35.404297
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, used, created_at) FROM stdin;
\.


--
-- Data for Name: price_components; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.price_components (id, name_ru, name_en) FROM stdin;
27072d53-c2df-42c1-b46f-493bb91acb00	Авиаперелёт	Flights
8b045626-99ac-49e3-bd07-8c9a9f47d116	Проживание	Accommodation
72fe4b26-6fec-49aa-a837-a77f8b41fff3	Питание	Meals
8f70a975-0836-480d-bc99-8330b4766aac	Трансфер	Transfer
283bd77f-903f-4fbd-bec3-ab65861cd9f3	Экскурсии	Excursions
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, user_id, tour_id, rating, text_ru, text_en, status, in_featured_feed, created_at) FROM stdin;
c7f8b768-cf71-48d5-87b8-254b70d495f9	55906ec1-a840-4bcb-9310-e84758d68c6c	d2f38f0f-7472-4ff5-8734-7ba754bb1ba3	5	Потрясающее путешествие! Санторини — это сказка. Всё было организовано на высшем уровне, гид был замечательным. Рекомендую всем!	Amazing trip! Santorini is a fairy tale. Everything was organized at the highest level, the guide was wonderful. I recommend it to everyone!	approved	t	2026-03-06 18:01:35.407428
9ffa74f2-c9dc-4259-8c7d-6bfa11b7529a	55906ec1-a840-4bcb-9310-e84758d68c6c	0af41af7-b393-40f3-89f8-fda40717aa84	5	Бали превзошёл все ожидания! Природа, культура, еда — всё на 10 из 10. TravelPro — лучшее агентство!	Bali exceeded all expectations! Nature, culture, food — all 10 out of 10. TravelPro is the best agency!	approved	t	2026-03-06 18:01:35.407428
cde0ee23-bc5c-48f1-820b-af25483eefce	55906ec1-a840-4bcb-9310-e84758d68c6c	16724083-8f58-45b2-acbf-10d7a48b6b10	4	Великолепная Швейцария! Горы, озёра, шоколад — что ещё нужно для счастья? Отличная организация тура.	Magnificent Switzerland! Mountains, lakes, chocolate — what else does happiness need? Excellent tour organization.	approved	t	2026-03-06 18:01:35.407428
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
R6fPNvblZYReqdrqcBh_1YF9wuVedIZD	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-04-07T18:38:02.579Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":"ad568552-531b-46d6-9caf-f45774eef09d"}}	2026-04-07 21:27:35
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, key, value) FROM stdin;
\.


--
-- Data for Name: tour_dates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tour_dates (id, tour_id, start_date, end_date, max_people, booked_count) FROM stdin;
d166676c-07f6-43ba-a60e-df902da50ab7	d2f38f0f-7472-4ff5-8734-7ba754bb1ba3	2026-04-05 18:01:35.303	2026-04-12 18:01:35.303	15	3
a20f9ef1-e2d2-43a4-9eba-ac98e3d87256	d2f38f0f-7472-4ff5-8734-7ba754bb1ba3	2026-05-05 18:01:35.303	2026-05-12 18:01:35.303	20	0
34ec8709-71ac-45d6-9a48-2913a23dc5df	0af41af7-b393-40f3-89f8-fda40717aa84	2026-04-05 18:01:35.303	2026-04-15 18:01:35.303	15	3
4546e485-200c-4c42-a829-0455f8b71629	0af41af7-b393-40f3-89f8-fda40717aa84	2026-05-05 18:01:35.303	2026-05-15 18:01:35.303	20	0
eddf6516-c790-4d04-a0a9-1baab8a9aff5	16724083-8f58-45b2-acbf-10d7a48b6b10	2026-04-05 18:01:35.303	2026-04-13 18:01:35.303	15	3
0eafb321-cc75-41f5-921a-a593416dcf01	16724083-8f58-45b2-acbf-10d7a48b6b10	2026-05-05 18:01:35.303	2026-05-13 18:01:35.303	20	0
acd63465-4408-489a-ae34-eea6aab0832d	b8b17239-0275-4ca9-b6ca-bc49b106c247	2026-04-05 18:01:35.303	2026-04-17 18:01:35.303	15	3
aae0c995-ef4d-4e41-8ed6-0c107ae5efd9	b8b17239-0275-4ca9-b6ca-bc49b106c247	2026-05-05 18:01:35.303	2026-05-17 18:01:35.303	20	0
28d72484-1e35-4e37-b119-f7a68538b0b9	d07bedad-48d6-4f26-a814-95f5b79d9510	2026-04-05 18:01:35.303	2026-04-14 18:01:35.303	15	3
bf0f79ba-c497-4056-8dc6-4319ee27eca7	d07bedad-48d6-4f26-a814-95f5b79d9510	2026-05-05 18:01:35.303	2026-05-14 18:01:35.303	20	0
dc0d682d-7c74-435a-86ac-2d03374fca6b	5a51c1d7-6674-4697-a837-4db57a05e2ee	2026-04-05 18:01:35.303	2026-04-11 18:01:35.303	15	3
edeb8aa2-fe34-4aab-a266-c357fef791b2	5a51c1d7-6674-4697-a837-4db57a05e2ee	2026-05-05 18:01:35.303	2026-05-11 18:01:35.303	20	0
16184678-38ab-4209-8083-efc07a1de492	73537b34-fcc9-4239-9258-52304b1f88a3	2026-04-05 18:01:35.303	2026-04-19 18:01:35.303	15	3
eec83841-dde8-4cc4-8c71-9d857fb72b27	73537b34-fcc9-4239-9258-52304b1f88a3	2026-05-05 18:01:35.303	2026-05-19 18:01:35.303	20	0
81dece5f-5d51-4a4a-a8ae-0321cdd483cc	85c4c4e3-e11d-4d1c-afb0-d03f548021cf	2026-04-05 18:01:35.303	2026-04-13 18:01:35.303	15	3
7a6c77ec-a837-4310-8d5b-103cbcf91849	85c4c4e3-e11d-4d1c-afb0-d03f548021cf	2026-05-05 18:01:35.303	2026-05-13 18:01:35.303	20	0
\.


--
-- Data for Name: tour_feed_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tour_feed_items (id, feed_id, tour_id, "order") FROM stdin;
8ae46541-724b-4ee7-9939-4c71834fc65b	d9d86597-0079-4a9d-910d-c97e55582f03	0af41af7-b393-40f3-89f8-fda40717aa84	0
fbd21239-e059-42b0-bb3d-4e512521f18c	d9d86597-0079-4a9d-910d-c97e55582f03	b8b17239-0275-4ca9-b6ca-bc49b106c247	1
2a76a983-7807-4033-b840-e5a529615952	d9d86597-0079-4a9d-910d-c97e55582f03	5a51c1d7-6674-4697-a837-4db57a05e2ee	2
ffb6cef7-3e75-4b50-b1f1-44bf9f83f255	dbe3f3b6-9d14-46ca-b489-a7e35900c0db	d2f38f0f-7472-4ff5-8734-7ba754bb1ba3	0
71183f7b-0b4e-44c8-8b5a-0009f8acbd2c	dbe3f3b6-9d14-46ca-b489-a7e35900c0db	0af41af7-b393-40f3-89f8-fda40717aa84	1
5b1e84c5-7420-4dfe-8bdf-7d7556ffff23	dbe3f3b6-9d14-46ca-b489-a7e35900c0db	16724083-8f58-45b2-acbf-10d7a48b6b10	2
dfe2148b-5712-4906-980a-468537a83855	dbe3f3b6-9d14-46ca-b489-a7e35900c0db	b8b17239-0275-4ca9-b6ca-bc49b106c247	3
108831d7-353b-4f16-b08c-7555995a0c2c	dbe3f3b6-9d14-46ca-b489-a7e35900c0db	5a51c1d7-6674-4697-a837-4db57a05e2ee	4
0c514250-299c-47a9-8e39-e76aed8518ca	7575f58a-45f4-4ac3-b5b2-c1e1be7b3df6	d2f38f0f-7472-4ff5-8734-7ba754bb1ba3	0
d87f7037-696b-4ecc-9057-6a74f022bd94	7575f58a-45f4-4ac3-b5b2-c1e1be7b3df6	0af41af7-b393-40f3-89f8-fda40717aa84	1
b18fa47d-345b-4062-828c-c35703ed73b0	7575f58a-45f4-4ac3-b5b2-c1e1be7b3df6	16724083-8f58-45b2-acbf-10d7a48b6b10	2
9c93370a-fe63-43c8-a5be-db3ee7c420ab	7575f58a-45f4-4ac3-b5b2-c1e1be7b3df6	b8b17239-0275-4ca9-b6ca-bc49b106c247	3
6eb7ec65-2ce1-48e6-9cc5-3953992b55b2	7575f58a-45f4-4ac3-b5b2-c1e1be7b3df6	d07bedad-48d6-4f26-a814-95f5b79d9510	4
6526cec5-840f-4081-af9c-e03f219bfb44	7575f58a-45f4-4ac3-b5b2-c1e1be7b3df6	5a51c1d7-6674-4697-a837-4db57a05e2ee	5
\.


--
-- Data for Name: tour_feeds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tour_feeds (id, name_ru, name_en, "order", is_active, card_width) FROM stdin;
d9d86597-0079-4a9d-910d-c97e55582f03	🔥 Горящие туры	🔥 Hot Deals	1	t	medium
dbe3f3b6-9d14-46ca-b489-a7e35900c0db	⭐ Рекомендуемые	⭐ Featured Tours	2	t	medium
7575f58a-45f4-4ac3-b5b2-c1e1be7b3df6	🌍 Все направления	🌍 All Destinations	3	t	medium
\.


--
-- Data for Name: tour_itinerary; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tour_itinerary (id, tour_id, day_number, title_ru, title_en, description_ru, description_en, duration_hours) FROM stdin;
2500e13a-7352-463e-8eb2-4f0ced8147e5	d2f38f0f-7472-4ff5-8734-7ba754bb1ba3	1	Прибытие и заселение	Arrival and check-in	Встреча в аэропорту, трансфер в отель, заселение. Вечерняя прогулка по окрестностям.	Airport meeting, hotel transfer, check-in. Evening walk around the area.	8
999fe553-653b-44fe-8115-a77821bb284e	d2f38f0f-7472-4ff5-8734-7ba754bb1ba3	2	Знакомство с достопримечательностями	Sightseeing	Обзорная экскурсия по главным достопримечательностям. Обед в местном ресторане.	Guided tour of main attractions. Lunch at a local restaurant.	10
d7c8fbcc-b23a-45d3-9b53-86250d411037	0af41af7-b393-40f3-89f8-fda40717aa84	1	Прибытие и заселение	Arrival and check-in	Встреча в аэропорту, трансфер в отель, заселение. Вечерняя прогулка по окрестностям.	Airport meeting, hotel transfer, check-in. Evening walk around the area.	8
7b43cc01-7a42-4ea0-94ea-8edd876f0d67	0af41af7-b393-40f3-89f8-fda40717aa84	2	Знакомство с достопримечательностями	Sightseeing	Обзорная экскурсия по главным достопримечательностям. Обед в местном ресторане.	Guided tour of main attractions. Lunch at a local restaurant.	10
f4931bab-3732-44c7-a9fb-bb2d1fc273b9	16724083-8f58-45b2-acbf-10d7a48b6b10	1	Прибытие и заселение	Arrival and check-in	Встреча в аэропорту, трансфер в отель, заселение. Вечерняя прогулка по окрестностям.	Airport meeting, hotel transfer, check-in. Evening walk around the area.	8
a537c49b-bedf-40c4-97f3-37e72d30f8cf	16724083-8f58-45b2-acbf-10d7a48b6b10	2	Знакомство с достопримечательностями	Sightseeing	Обзорная экскурсия по главным достопримечательностям. Обед в местном ресторане.	Guided tour of main attractions. Lunch at a local restaurant.	10
aa3ac87e-4c5d-4280-b8ec-ab4ab0afab1c	b8b17239-0275-4ca9-b6ca-bc49b106c247	1	Прибытие и заселение	Arrival and check-in	Встреча в аэропорту, трансфер в отель, заселение. Вечерняя прогулка по окрестностям.	Airport meeting, hotel transfer, check-in. Evening walk around the area.	8
ccdc8418-dca2-4845-b954-65911e532201	b8b17239-0275-4ca9-b6ca-bc49b106c247	2	Знакомство с достопримечательностями	Sightseeing	Обзорная экскурсия по главным достопримечательностям. Обед в местном ресторане.	Guided tour of main attractions. Lunch at a local restaurant.	10
857a846b-2ffc-4c74-b16a-4c8e59e2fbb8	d07bedad-48d6-4f26-a814-95f5b79d9510	1	Прибытие и заселение	Arrival and check-in	Встреча в аэропорту, трансфер в отель, заселение. Вечерняя прогулка по окрестностям.	Airport meeting, hotel transfer, check-in. Evening walk around the area.	8
425f886d-c685-4dc7-a7e3-8e5a545f942f	d07bedad-48d6-4f26-a814-95f5b79d9510	2	Знакомство с достопримечательностями	Sightseeing	Обзорная экскурсия по главным достопримечательностям. Обед в местном ресторане.	Guided tour of main attractions. Lunch at a local restaurant.	10
c549d678-36dd-4258-9381-1040d0f1560b	5a51c1d7-6674-4697-a837-4db57a05e2ee	1	Прибытие и заселение	Arrival and check-in	Встреча в аэропорту, трансфер в отель, заселение. Вечерняя прогулка по окрестностям.	Airport meeting, hotel transfer, check-in. Evening walk around the area.	8
a2ca4b7d-1d3a-4a9c-9c25-a6bd082c0a42	5a51c1d7-6674-4697-a837-4db57a05e2ee	2	Знакомство с достопримечательностями	Sightseeing	Обзорная экскурсия по главным достопримечательностям. Обед в местном ресторане.	Guided tour of main attractions. Lunch at a local restaurant.	10
994b33be-0198-4ec7-ba62-454708c8a9d7	73537b34-fcc9-4239-9258-52304b1f88a3	1	Прибытие и заселение	Arrival and check-in	Встреча в аэропорту, трансфер в отель, заселение. Вечерняя прогулка по окрестностям.	Airport meeting, hotel transfer, check-in. Evening walk around the area.	8
a8cff27d-9448-439f-937a-698d509ee180	73537b34-fcc9-4239-9258-52304b1f88a3	2	Знакомство с достопримечательностями	Sightseeing	Обзорная экскурсия по главным достопримечательностям. Обед в местном ресторане.	Guided tour of main attractions. Lunch at a local restaurant.	10
3788280d-040c-4f51-b359-dcf7748f14d0	85c4c4e3-e11d-4d1c-afb0-d03f548021cf	1	Прибытие и заселение	Arrival and check-in	Встреча в аэропорту, трансфер в отель, заселение. Вечерняя прогулка по окрестностям.	Airport meeting, hotel transfer, check-in. Evening walk around the area.	8
71e4c517-2d6b-4a91-86ac-120e9a04fd2d	85c4c4e3-e11d-4d1c-afb0-d03f548021cf	2	Знакомство с достопримечательностями	Sightseeing	Обзорная экскурсия по главным достопримечательностям. Обед в местном ресторане.	Guided tour of main attractions. Lunch at a local restaurant.	10
\.


--
-- Data for Name: tour_options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tour_options (id, tour_id, name_ru, name_en, price) FROM stdin;
b47956bf-6701-4b6f-8211-964ddb08a049	d2f38f0f-7472-4ff5-8734-7ba754bb1ba3	Страховая защита	Travel Insurance	89.00
5bf91412-ab0c-47ce-8ab2-bc514bfe8ba7	d2f38f0f-7472-4ff5-8734-7ba754bb1ba3	Трансфер бизнес-класс	Business Class Transfer	150.00
e0372c84-051b-4cf4-9a2a-08767afe541c	0af41af7-b393-40f3-89f8-fda40717aa84	Страховая защита	Travel Insurance	89.00
dc4d74d0-3fbb-4e86-9392-c49f89afc672	0af41af7-b393-40f3-89f8-fda40717aa84	Трансфер бизнес-класс	Business Class Transfer	150.00
2659b6ba-eb68-472d-a4ed-8e6e612e2200	16724083-8f58-45b2-acbf-10d7a48b6b10	Страховая защита	Travel Insurance	89.00
13bb13da-d46c-4c22-add1-75981c6ca770	16724083-8f58-45b2-acbf-10d7a48b6b10	Трансфер бизнес-класс	Business Class Transfer	150.00
c9ad2b0c-c55b-48dc-835d-5754cfb3b230	b8b17239-0275-4ca9-b6ca-bc49b106c247	Страховая защита	Travel Insurance	89.00
7cee56af-363b-45b4-a420-fba13335111f	b8b17239-0275-4ca9-b6ca-bc49b106c247	Трансфер бизнес-класс	Business Class Transfer	150.00
49d0552d-5592-4b3e-853f-062f5aaa9deb	d07bedad-48d6-4f26-a814-95f5b79d9510	Страховая защита	Travel Insurance	89.00
d867da0e-8f93-4084-9940-c22f782c1892	d07bedad-48d6-4f26-a814-95f5b79d9510	Трансфер бизнес-класс	Business Class Transfer	150.00
68262e98-72f1-4f53-9290-c96afb13a2c6	5a51c1d7-6674-4697-a837-4db57a05e2ee	Страховая защита	Travel Insurance	89.00
a668a353-278c-4459-9f08-a03af4416d2a	5a51c1d7-6674-4697-a837-4db57a05e2ee	Трансфер бизнес-класс	Business Class Transfer	150.00
7876a50d-7167-4f0a-9419-8c61376a8903	73537b34-fcc9-4239-9258-52304b1f88a3	Страховая защита	Travel Insurance	89.00
eb271d73-0370-4640-a473-6fcf0764c1f7	73537b34-fcc9-4239-9258-52304b1f88a3	Трансфер бизнес-класс	Business Class Transfer	150.00
38bbb88d-d43f-404a-9706-979a0bad3e48	85c4c4e3-e11d-4d1c-afb0-d03f548021cf	Страховая защита	Travel Insurance	89.00
f82dd2e2-7bb1-40e2-869b-7833b7cc4023	85c4c4e3-e11d-4d1c-afb0-d03f548021cf	Трансфер бизнес-класс	Business Class Transfer	150.00
\.


--
-- Data for Name: tour_price_components; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tour_price_components (id, tour_id, component_id, price, included) FROM stdin;
\.


--
-- Data for Name: tours; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tours (id, title_ru, title_en, description_ru, description_en, city_id, country_id, category_id, duration, base_price, discount_percent, main_image, images, is_hot, is_featured, is_active, included_ru, included_en, not_included_ru, not_included_en, map_url, created_at) FROM stdin;
d2f38f0f-7472-4ff5-8734-7ba754bb1ba3	Романтический Санторини	Romantic Santorini	Откройте для себя магию греческого острова Санторини. Белоснежные дома, синие купола церквей, потрясающие закаты над Эгейским морем и незабываемые моменты в одном из красивейших мест на земле.	Discover the magic of the Greek island of Santorini. White houses, blue church domes, stunning sunsets over the Aegean Sea and unforgettable moments in one of the most beautiful places on earth.	27948356-9ad8-469a-b380-36b567b1690e	2a1ef1f5-cbb1-4efe-ae64-3f07d2d0e940	908cd3c8-ac00-4241-a91f-a01ed817953a	7	1290.00	0	/images/tour-santorini.png	{/images/tour-santorini.png,/images/tour-paris.png,/images/hero-banner.png}	f	t	t	Авиаперелёт Москва-Афины-Москва\nПроживание в 4* отеле 7 ночей\nЗавтраки ежедневно\nТрансфер из аэропорта\nЭкскурсия по острову	Round trip flights Moscow-Athens\n7 nights in 4* hotel\nDaily breakfasts\nAirport transfers\nIsland tour	Виза (не требуется для РФ)\nМедицинская страховка\nЛичные расходы	Visa (not required)\nTravel insurance\nPersonal expenses	\N	2026-03-06 18:01:35.299777
0af41af7-b393-40f3-89f8-fda40717aa84	Экзотический Бали	Exotic Bali	Бали — остров богов, где уникальная культура встречается с тропической природой. Рисовые террасы, храмы, сёрфинг, спа-процедуры и великолепная кухня ждут вас на этом волшебном острове.	Bali — the island of gods, where unique culture meets tropical nature. Rice terraces, temples, surfing, spa treatments and superb cuisine await you on this magical island.	2b105fd6-576a-4f64-a5dd-3ac9023b803f	65b36981-4d71-41d5-b601-402d67816fa6	4bfc4c72-2f87-4d49-961d-3914101052d7	10	1490.00	15	/images/tour-bali.png	{/images/tour-bali.png,/images/tour-maldives.png,/images/hero-banner.png}	t	t	t	Авиаперелёт Москва-Денпасар-Москва\nПроживание на вилле 10 ночей\nЗавтраки и ужины\nТрансфер\nЭкскурсия на Убуд	Round trip flights\n10 nights villa stay\nBreakfasts and dinners\nTransfers\nUbud tour	Виза по прилёту ($35)\nСтраховка\nЛичные расходы	Visa on arrival ($35)\nInsurance\nPersonal expenses	\N	2026-03-06 18:01:35.299777
16724083-8f58-45b2-acbf-10d7a48b6b10	Швейцарские Альпы	Swiss Alps	Исследуйте величественные Швейцарские Альпы. Горные деревушки, кристальные озёра, Женева и незабываемые виды — это путешествие оставит вас в восхищении от красоты природы.	Explore the majestic Swiss Alps. Mountain villages, crystal lakes, Geneva and unforgettable views — this journey will leave you in awe of nature's beauty.	a3e0fb0f-ca95-42e6-b745-90c495134b74	26591d55-4360-41a0-bfd7-50f291bb6e0f	9674b9b3-66e9-49d9-8134-06458353248e	8	2190.00	0	/images/tour-swiss.png	{/images/tour-swiss.png,/images/hero-banner.png}	f	t	t	Авиаперелёт Москва-Женева-Москва\nПроживание в 4* отеле 8 ночей\nЗавтраки ежедневно\nЖД-проездной по Швейцарии	Round trip flights\n8 nights in 4* hotel\nDaily breakfasts\nSwiss rail pass	Виза Шенген\nСтраховка\nОбеды и ужины	Schengen visa\nInsurance\nLunches and dinners	\N	2026-03-06 18:01:35.299777
b8b17239-0275-4ca9-b6ca-bc49b106c247	Страна восходящего солнца — Япония	Land of the Rising Sun — Japan	Погрузитесь в мир японской культуры: токийские небоскрёбы и традиционные храмы Киото, сакура и суши, гора Фудзи и чайные церемонии. Японий полон контрастов!	Immerse yourself in Japanese culture: Tokyo skyscrapers and traditional Kyoto temples, cherry blossoms and sushi, Mount Fuji and tea ceremonies. Japan is full of contrasts!	b40fe296-12f3-4a81-9533-9d4881fffa5c	2fa4b10f-04b7-4605-bcaa-54c46bfad7b1	cfb172d7-6613-4076-82ea-7e8556f455f3	12	2890.00	10	/images/tour-tokyo.png	{/images/tour-tokyo.png,/images/hero-banner.png}	t	t	t	Авиаперелёт Москва-Токио-Москва\nПроживание в 4* отелях 12 ночей\nЗавтраки ежедневно\nJR Pass на 7 дней\nЭкскурсии в Токио и Киото	Round trip flights\n12 nights in 4* hotels\nDaily breakfasts\n7-day JR Pass\nTours in Tokyo and Kyoto	Виза (безвизовый въезд для РФ)\nСтраховка\nОбеды и ужины	Visa-free entry\nInsurance\nLunches and dinners	\N	2026-03-06 18:01:35.299777
d07bedad-48d6-4f26-a814-95f5b79d9510	Рай на Мальдивах	Paradise in Maldives	Бирюзовые воды, коралловые рифы, белоснежный песок и роскошные бунгало над водой — Мальдивы воплощают идеал тропического рая. Идеально для медового месяца и романтического отдыха.	Turquoise waters, coral reefs, white sand and luxury overwater bungalows — the Maldives embody the ideal tropical paradise. Perfect for honeymoons and romantic getaways.	46a21180-30b2-45e6-a5fa-44845225c20c	7d72c8e9-6115-44db-922f-adf3264f69d7	4bfc4c72-2f87-4d49-961d-3914101052d7	9	3490.00	0	/images/tour-maldives.png	{/images/tour-maldives.png,/images/hero-banner.png}	f	f	t	Авиаперелёт Москва-Мале-Москва\nПроживание в бунгало над водой 9 ночей\nПолный пансион\nСпидботы\nДайвинг (1 погружение)	Round trip flights\n9 nights overwater bungalow\nAll inclusive\nSpeedboats\nDiving (1 dive)	Страховка\nАлкоголь\nДополнительные активности	Insurance\nAlcohol\nExtra activities	\N	2026-03-06 18:01:35.299777
5a51c1d7-6674-4697-a837-4db57a05e2ee	Романтичный Париж	Romantic Paris	Эйфелева башня, Лувр, прогулки по Монмартру, круиз по Сене — Париж, город любви, откроет вам свои лучшие секреты. Искусство, мода, кухня и история в одном путешествии.	Eiffel Tower, Louvre, walks through Montmartre, cruise on the Seine — Paris, the city of love, will reveal its best secrets. Art, fashion, cuisine and history in one trip.	1295200c-bd7b-4c9e-bb81-7f9b4e7979ec	b238150d-1115-4f25-bb69-fea81b4979f8	cfb172d7-6613-4076-82ea-7e8556f455f3	6	1890.00	20	/images/tour-paris.png	{/images/tour-paris.png,/images/tour-santorini.png,/images/hero-banner.png}	t	t	t	Авиаперелёт Москва-Париж-Москва\nПроживание в 4* отеле 6 ночей\nЗавтраки ежедневно\nТрансфер из аэропорта\nВходные билеты в Лувр	Round trip flights\n6 nights in 4* hotel\nDaily breakfasts\nAirport transfers\nLouvre tickets	Виза Шенген\nСтраховка\nОбеды и ужины	Schengen visa\nInsurance\nLunches and dinners	\N	2026-03-06 18:01:35.299777
73537b34-fcc9-4239-9258-52304b1f88a3	Мистическое Перу — Мачу-Пикчу	Mystical Peru — Machu Picchu	Следуйте тропой инков к знаменитому Мачу-Пикчу — одному из семи чудес света. Амазонские джунгли, озеро Титикака, Лима с её гастрономией — незабываемое приключение в Южной Америке.	Follow the Inca Trail to the famous Machu Picchu — one of the seven wonders of the world. Amazon jungle, Lake Titicaca, Lima gastronomy — an unforgettable South American adventure.	f206213c-6797-4aa3-8cb8-f5dc4fcc3737	12a16b6b-e8c5-4a1f-b1b3-6e63fd5711d5	98a58cc1-e353-469d-a292-f122a582212f	14	2590.00	0	/images/tour-peru.png	{/images/tour-peru.png,/images/hero-banner.png}	f	f	t	Авиаперелёт Москва-Лима-Москва\nПроживание в 4* отелях 14 ночей\nЗавтраки\nЭкскурсия в Мачу-Пикчу\nТрансферы	Round trip flights\n14 nights in 4* hotels\nBreakfasts\nMachu Picchu tour\nTransfers	Виза\nСтраховка\nОбеды и ужины	Visa\nInsurance\nLunches and dinners	\N	2026-03-06 18:01:35.299777
85c4c4e3-e11d-4d1c-afb0-d03f548021cf	Культура Киото	Kyoto Culture	Старая столица Японии, Киото, хранит более 1600 буддийских храмов и синтоистских святилищ. Чайные церемонии, гейши в квартале Гион, золотой павильон Кинкакудзи — история на каждом шагу.	Japan's ancient capital, Kyoto, houses over 1,600 Buddhist temples and Shinto shrines. Tea ceremonies, geishas in Gion district, the golden Kinkakuji pavilion — history at every step.	ead7ec54-b088-467b-9d25-a17ece1224d8	2fa4b10f-04b7-4605-bcaa-54c46bfad7b1	cfb172d7-6613-4076-82ea-7e8556f455f3	8	2490.00	5	/images/tour-tokyo.png	{/images/tour-tokyo.png,/images/tour-swiss.png}	f	f	t	Авиаперелёт Москва-Осака-Москва\nПроживание в рёкане 8 ночей\nЗавтраки ежедневно\nЧайная церемония	Round trip flights\n8 nights in ryokan\nDaily breakfasts\nTea ceremony	Страховка\nОбеды и ужины\nЛичные расходы	Insurance\nLunches and dinners\nPersonal expenses	\N	2026-03-06 18:01:35.299777
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, username, name, password, avatar, role, loyalty_level, bookings_count, discounts_left, created_at) FROM stdin;
ad568552-531b-46d6-9caf-f45774eef09d	admin@travelpro.ru	admin	Администратор	$2b$10$/wRLO2MPdJLlUFF6Rew6/uU9bFB0tEPvb.1y3NNJcv62GCDfH1Pqi	\N	admin	beginner	0	0	2026-03-06 18:01:35.085526
55906ec1-a840-4bcb-9310-e84758d68c6c	user@travelpro.ru	user	Иван Петров	$2b$10$odlKd1Av9AOzvy4hSSDiauFvDJ6WgekLGgHE6fJGJP1LlQqtwcFHu	\N	user	beginner	0	0	2026-03-06 18:01:35.085526
ec2b3a46-5f26-4834-9e59-f8f156a1d025	premium@travelpro.ru	premium_user	Анна Иванова	$2b$10$odlKd1Av9AOzvy4hSSDiauFvDJ6WgekLGgHE6fJGJP1LlQqtwcFHu	\N	user	premium	8	0	2026-03-06 18:01:35.085526
\.


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: hero_slides hero_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hero_slides
    ADD CONSTRAINT hero_slides_pkey PRIMARY KEY (id);


--
-- Name: intro_screen intro_screen_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intro_screen
    ADD CONSTRAINT intro_screen_pkey PRIMARY KEY (id);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_unique UNIQUE (token);


--
-- Name: price_components price_components_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_components
    ADD CONSTRAINT price_components_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: settings settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_unique UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: tour_dates tour_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_dates
    ADD CONSTRAINT tour_dates_pkey PRIMARY KEY (id);


--
-- Name: tour_feed_items tour_feed_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_feed_items
    ADD CONSTRAINT tour_feed_items_pkey PRIMARY KEY (id);


--
-- Name: tour_feeds tour_feeds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_feeds
    ADD CONSTRAINT tour_feeds_pkey PRIMARY KEY (id);


--
-- Name: tour_itinerary tour_itinerary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_itinerary
    ADD CONSTRAINT tour_itinerary_pkey PRIMARY KEY (id);


--
-- Name: tour_options tour_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_options
    ADD CONSTRAINT tour_options_pkey PRIMARY KEY (id);


--
-- Name: tour_price_components tour_price_components_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_price_components
    ADD CONSTRAINT tour_price_components_pkey PRIMARY KEY (id);


--
-- Name: tours tours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT tours_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: bookings bookings_tour_date_id_tour_dates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_tour_date_id_tour_dates_id_fk FOREIGN KEY (tour_date_id) REFERENCES public.tour_dates(id);


--
-- Name: bookings bookings_tour_id_tours_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_tour_id_tours_id_fk FOREIGN KEY (tour_id) REFERENCES public.tours(id);


--
-- Name: bookings bookings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: cities cities_country_id_countries_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_country_id_countries_id_fk FOREIGN KEY (country_id) REFERENCES public.countries(id);


--
-- Name: favorites favorites_tour_id_tours_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_tour_id_tours_id_fk FOREIGN KEY (tour_id) REFERENCES public.tours(id);


--
-- Name: favorites favorites_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: password_reset_tokens password_reset_tokens_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: reviews reviews_tour_id_tours_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_tour_id_tours_id_fk FOREIGN KEY (tour_id) REFERENCES public.tours(id);


--
-- Name: reviews reviews_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: tour_dates tour_dates_tour_id_tours_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_dates
    ADD CONSTRAINT tour_dates_tour_id_tours_id_fk FOREIGN KEY (tour_id) REFERENCES public.tours(id);


--
-- Name: tour_feed_items tour_feed_items_feed_id_tour_feeds_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_feed_items
    ADD CONSTRAINT tour_feed_items_feed_id_tour_feeds_id_fk FOREIGN KEY (feed_id) REFERENCES public.tour_feeds(id);


--
-- Name: tour_feed_items tour_feed_items_tour_id_tours_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_feed_items
    ADD CONSTRAINT tour_feed_items_tour_id_tours_id_fk FOREIGN KEY (tour_id) REFERENCES public.tours(id);


--
-- Name: tour_itinerary tour_itinerary_tour_id_tours_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_itinerary
    ADD CONSTRAINT tour_itinerary_tour_id_tours_id_fk FOREIGN KEY (tour_id) REFERENCES public.tours(id);


--
-- Name: tour_options tour_options_tour_id_tours_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_options
    ADD CONSTRAINT tour_options_tour_id_tours_id_fk FOREIGN KEY (tour_id) REFERENCES public.tours(id);


--
-- Name: tour_price_components tour_price_components_component_id_price_components_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_price_components
    ADD CONSTRAINT tour_price_components_component_id_price_components_id_fk FOREIGN KEY (component_id) REFERENCES public.price_components(id);


--
-- Name: tour_price_components tour_price_components_tour_id_tours_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_price_components
    ADD CONSTRAINT tour_price_components_tour_id_tours_id_fk FOREIGN KEY (tour_id) REFERENCES public.tours(id);


--
-- Name: tours tours_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT tours_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: tours tours_city_id_cities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT tours_city_id_cities_id_fk FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: tours tours_country_id_countries_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT tours_country_id_countries_id_fk FOREIGN KEY (country_id) REFERENCES public.countries(id);


--
-- PostgreSQL database dump complete
--

\unrestrict I7iD3EzOWycWVcdh0daMhKVp0jlTmgd6XMiWFEnAfmHFGbgJlzL6xketAMbw2fR

