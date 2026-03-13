import { useState, useCallback, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastNotification from "@/components/ToastNotification";
import LoadingScreen from "@/components/LoadingScreen";

// Lazy load pages for performance
const HomePage = lazy(() => import("@/pages/HomePage"));
const PropertyPage = lazy(() => import("@/pages/PropertyPage"));
const StaysPage = lazy(() => import("@/pages/StaysPage"));
const VehiclesPage = lazy(() => import("@/pages/VehiclesPage"));
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const SearchResultsPage = lazy(() => import("@/pages/SearchResultsPage"));
const SocialPage = lazy(() => import("@/pages/SocialPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const ForBusinessPage = lazy(() => import("@/pages/ForBusinessPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-12 h-12 rounded-full mx-auto mb-4 animate-gold-glow" style={{ background: "linear-gradient(135deg, hsl(42 52% 54%), hsl(33 46% 41%))" }} />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const AppLayout = () => (
  <>
    <Header />
    <Suspense fallback={<PageLoader />}>
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
        <Route path="/for-business" element={<ForBusinessPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    <Footer />
    <ToastNotification />
  </>
);

const App = () => {
  const [showLoading, setShowLoading] = useState(true);
  const handleLoadComplete = useCallback(() => setShowLoading(false), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppProvider>
              {showLoading && <LoadingScreen onComplete={handleLoadComplete} />}
              <AppLayout />
            </AppProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
