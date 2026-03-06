import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IntroScreen from "@/components/IntroScreen";
import Home from "@/pages/Home";
import Tours from "@/pages/Tours";
import TourDetail from "@/pages/TourDetail";
import Profile from "@/pages/Profile";
import NewsPage, { NewsDetail } from "@/pages/NewsPage";
import Promotions from "@/pages/Promotions";
import About from "@/pages/About";
import Dashboard from "@/pages/admin/Dashboard";
import ToursAdmin from "@/pages/admin/ToursAdmin";
import ReviewsAdmin from "@/pages/admin/ReviewsAdmin";
import BookingsAdmin from "@/pages/admin/BookingsAdmin";
import UsersAdmin from "@/pages/admin/UsersAdmin";
import CountriesAdmin from "@/pages/admin/CountriesAdmin";
import CategoriesAdmin from "@/pages/admin/CategoriesAdmin";
import FeedsAdmin from "@/pages/admin/FeedsAdmin";
import NewsAdmin from "@/pages/admin/NewsAdmin";
import BannersAdmin from "@/pages/admin/BannersAdmin";
import PriceComponentsAdmin from "@/pages/admin/PriceComponentsAdmin";
import HeroSlidesAdmin from "@/pages/admin/HeroSlidesAdmin";

const ADMIN_PATHS = ["/admin", "/admin/tours", "/admin/reviews", "/admin/bookings",
  "/admin/users", "/admin/countries", "/admin/categories", "/admin/feeds",
  "/admin/news", "/admin/banners", "/admin/price-components", "/admin/hero-slides"];

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
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/tours" component={ToursAdmin} />
      <Route path="/admin/reviews" component={ReviewsAdmin} />
      <Route path="/admin/bookings" component={BookingsAdmin} />
      <Route path="/admin/users" component={UsersAdmin} />
      <Route path="/admin/countries" component={CountriesAdmin} />
      <Route path="/admin/categories" component={CategoriesAdmin} />
      <Route path="/admin/feeds" component={FeedsAdmin} />
      <Route path="/admin/news" component={NewsAdmin} />
      <Route path="/admin/banners" component={BannersAdmin} />
      <Route path="/admin/price-components" component={PriceComponentsAdmin} />
      <Route path="/admin/hero-slides" component={HeroSlidesAdmin} />
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
    <div className="min-h-screen bg-background flex flex-col">
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
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <AppShell />
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
