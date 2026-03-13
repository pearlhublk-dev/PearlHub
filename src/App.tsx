import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastNotification from "@/components/ToastNotification";
import HomePage from "@/pages/HomePage";
import PropertyPage from "@/pages/PropertyPage";
import StaysPage from "@/pages/StaysPage";
import VehiclesPage from "@/pages/VehiclesPage";
import EventsPage from "@/pages/EventsPage";
import DashboardPage from "@/pages/DashboardPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import SettingsPage from "@/pages/SettingsPage";
import AuthPage from "@/pages/AuthPage";
import SearchResultsPage from "@/pages/SearchResultsPage";
import SocialPage from "@/pages/SocialPage";
import TermsPage from "@/pages/TermsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = () => (
  <>
    <Header />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/property" element={<PropertyPage />} />
      <Route path="/stays" element={<StaysPage />} />
      <Route path="/vehicles" element={<VehiclesPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/social" element={<SocialPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<TermsPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Footer />
    <ToastNotification />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <AppLayout />
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
