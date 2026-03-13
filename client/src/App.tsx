import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { CurrencyProvider } from "@/lib/currency";
import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IntroScreen from "@/components/IntroScreen";

// User-facing pages — eager (критичны для первой загрузки)
import Home from "@/pages/Home";
import Tours from "@/pages/Tours";
import TourDetail from "@/pages/TourDetail";
import Profile from "@/pages/Profile";
import NewsPage, { NewsDetail } from "@/pages/NewsPage";
import Promotions from "@/pages/Promotions";
import About from "@/pages/About";
import ResetPassword from "@/pages/ResetPassword";

// Admin pages — lazy (грузятся только при открытии /admin/*)
const Dashboard          = lazy(() => import("@/pages/admin/Dashboard"));
const ToursAdmin         = lazy(() => import("@/pages/admin/ToursAdmin"));
const ReviewsAdmin       = lazy(() => import("@/pages/admin/ReviewsAdmin"));
const BookingsAdmin      = lazy(() => import("@/pages/admin/BookingsAdmin"));
const UsersAdmin         = lazy(() => import("@/pages/admin/UsersAdmin"));
const CountriesAdmin     = lazy(() => import("@/pages/admin/CountriesAdmin"));
const CitiesAdmin        = lazy(() => import("@/pages/admin/CitiesAdmin"));
const CategoriesAdmin    = lazy(() => import("@/pages/admin/CategoriesAdmin"));
const FeedsAdmin         = lazy(() => import("@/pages/admin/FeedsAdmin"));
const NewsAdmin          = lazy(() => import("@/pages/admin/NewsAdmin"));
const BannersAdmin       = lazy(() => import("@/pages/admin/BannersAdmin"));
const HeroSlidesAdmin    = lazy(() => import("@/pages/admin/HeroSlidesAdmin"));
const StatisticsAdmin    = lazy(() => import("@/pages/admin/StatisticsAdmin"));
const LoyaltyAdmin       = lazy(() => import("@/pages/admin/LoyaltyAdmin"));
const IntroScreenAdmin   = lazy(() => import("@/pages/admin/IntroScreenAdmin"));
const CurrenciesAdmin    = lazy(() => import("@/pages/admin/CurrenciesAdmin"));

function AdminFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tours" component={Tours} />
      <Route path="/tours/:id" component={TourDetail} />
      <Route path="/profile" component={Profile} />
      <Route path="/profile/:tab" component={Profile} />
      <Route path="/news" component={NewsPage} />
      <Route path="/news/:id" component={NewsDetail} />
      <Route path="/promotions" component={Promotions} />
      <Route path="/about" component={About} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/admin">
        {() => <Suspense fallback={<AdminFallback />}><Dashboard /></Suspense>}
      </Route>
      <Route path="/admin/tours">
        {() => <Suspense fallback={<AdminFallback />}><ToursAdmin /></Suspense>}
      </Route>
      <Route path="/admin/reviews">
        {() => <Suspense fallback={<AdminFallback />}><ReviewsAdmin /></Suspense>}
      </Route>
      <Route path="/admin/bookings">
        {() => <Suspense fallback={<AdminFallback />}><BookingsAdmin /></Suspense>}
      </Route>
      <Route path="/admin/users">
        {() => <Suspense fallback={<AdminFallback />}><UsersAdmin /></Suspense>}
      </Route>
      <Route path="/admin/countries">
        {() => <Suspense fallback={<AdminFallback />}><CountriesAdmin /></Suspense>}
      </Route>
      <Route path="/admin/cities">
        {() => <Suspense fallback={<AdminFallback />}><CitiesAdmin /></Suspense>}
      </Route>
      <Route path="/admin/categories">
        {() => <Suspense fallback={<AdminFallback />}><CategoriesAdmin /></Suspense>}
      </Route>
      <Route path="/admin/feeds">
        {() => <Suspense fallback={<AdminFallback />}><FeedsAdmin /></Suspense>}
      </Route>
      <Route path="/admin/news">
        {() => <Suspense fallback={<AdminFallback />}><NewsAdmin /></Suspense>}
      </Route>
      <Route path="/admin/banners">
        {() => <Suspense fallback={<AdminFallback />}><BannersAdmin /></Suspense>}
      </Route>
      <Route path="/admin/hero-slides">
        {() => <Suspense fallback={<AdminFallback />}><HeroSlidesAdmin /></Suspense>}
      </Route>
      <Route path="/admin/statistics">
        {() => <Suspense fallback={<AdminFallback />}><StatisticsAdmin /></Suspense>}
      </Route>
      <Route path="/admin/loyalty">
        {() => <Suspense fallback={<AdminFallback />}><LoyaltyAdmin /></Suspense>}
      </Route>
      <Route path="/admin/intro-screen">
        {() => <Suspense fallback={<AdminFallback />}><IntroScreenAdmin /></Suspense>}
      </Route>
      <Route path="/admin/currencies">
        {() => <Suspense fallback={<AdminFallback />}><CurrenciesAdmin /></Suspense>}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppShell() {
  const [path] = useLocation();
  const adminMode = path.startsWith("/admin");

  if (adminMode) {
    return (
      <div className="min-h-screen bg-background">
        <Router />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <IntroScreen />
      <Header />
      <main className="flex-1">
        <Router />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <CurrencyProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <AppShell />
            </TooltipProvider>
          </AuthProvider>
        </CurrencyProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
