import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useSearchParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TestModeBadge } from "@/components/TestModeBadge";
import { useTestMode } from "@/hooks/use-test-mode";
import { useEffect, useState } from "react";
import Landing from "./pages/Landing";
import Questionnaire from "./pages/Questionnaire";
import TributePage from "./pages/TributePage";
import PublicMemorialPage from "./pages/PublicMemorialPage";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";
import MemoriesGallery from "./pages/MemoriesGallery";
import DogObituaryExample from "./pages/seo/DogObituaryExample";
import CatMemorialTributeExample from "./pages/seo/CatMemorialTributeExample";
import PetMemorialMessage from "./pages/seo/PetMemorialMessage";
import WhatToWriteWhenDogDies from "./pages/seo/WhatToWriteWhenDogDies";
import PetMemorial from "./pages/seo/PetMemorial";
import PetMemorialQuotes from "./pages/seo/PetMemorialQuotes";
import RainbowBridgeQuotes from "./pages/seo/RainbowBridgeQuotes";
import CopeWithLosingAPet from "./pages/seo/CopeWithLosingAPet";
import PetSympathyMessages from "./pages/seo/PetSympathyMessages";
import ShortDogMemorialQuotes from "./pages/seo/ShortDogMemorialQuotes";
import DogMemorialQuotes from "./pages/seo/DogMemorialQuotes";
import CatMemorialQuotes from "./pages/seo/CatMemorialQuotes";
import PetRemembranceQuotes from "./pages/seo/PetRemembranceQuotes";
import WhatToWriteWhenCatDies from "./pages/seo/WhatToWriteWhenCatDies";
import PetCondolenceMessages from "./pages/seo/PetCondolenceMessages";
import ExampleTribute from "./pages/ExampleTribute";
import ExampleTributeOliver from "./pages/ExampleTributeOliver";
import ExampleTributeMax from "./pages/ExampleTributeMax";
import ExampleTributeClover from "./pages/ExampleTributeClover";
import PaymentSuccess from "./pages/PaymentSuccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

// TEMPORARY: Set to false to disable coming soon mode and launch the full site
const COMING_SOON_ENABLED = true;
const PREVIEW_KEY = "founder";

const PreviewGate = ({ children }: { children: React.ReactNode }) => {
  const [searchParams] = useSearchParams();
  const [unlocked, setUnlocked] = useState(false);
  const { isTestMode, isFounderMode, toggleTestMode, disableFounderMode } = useTestMode();

  useEffect(() => {
    // Unlock via URL param or persisted founder/session state
    if (searchParams.get("preview") === PREVIEW_KEY) {
      sessionStorage.setItem("preview_unlocked", "true");
      setUnlocked(true);
    } else if (localStorage.getItem("founderMode") === "true") {
      setUnlocked(true);
    } else if (sessionStorage.getItem("preview_unlocked") === "true") {
      setUnlocked(true);
    }
  }, [searchParams]);

  if (COMING_SOON_ENABLED && !unlocked) {
    return <ComingSoon />;
  }

  return (
    <>
      <TestModeBadge
        isTestMode={isTestMode}
        isFounderMode={isFounderMode}
        onToggleOff={toggleTestMode}
        onDisableFounder={disableFounderMode}
      />
      {children}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <PreviewGate>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/create" element={<Questionnaire />} />
            <Route path="/tribute" element={<TributePage />} />
            <Route path="/tribute/:id" element={<TributePage />} />
            <Route path="/tribute/s/:slug" element={<TributePage />} />
            <Route path="/memorial/:slug" element={<PublicMemorialPage />} />
            <Route path="/memory/:slug" element={<PublicMemorialPage />} />
            <Route path="/memories" element={<MemoriesGallery />} />
            <Route path="/dog-obituary-example" element={<DogObituaryExample />} />
            <Route path="/cat-memorial-tribute-example" element={<CatMemorialTributeExample />} />
            <Route path="/pet-memorial-message" element={<PetMemorialMessage />} />
            <Route path="/what-to-write-when-a-dog-dies" element={<WhatToWriteWhenDogDies />} />
            <Route path="/pet-memorial" element={<PetMemorial />} />
            <Route path="/pet-memorial-quotes" element={<PetMemorialQuotes />} />
            <Route path="/rainbow-bridge-quotes" element={<RainbowBridgeQuotes />} />
            <Route path="/cope-with-losing-a-pet" element={<CopeWithLosingAPet />} />
            <Route path="/pet-sympathy-messages" element={<PetSympathyMessages />} />
            <Route path="/short-dog-memorial-quotes" element={<ShortDogMemorialQuotes />} />
            <Route path="/example-tribute" element={<ExampleTribute />} />
            <Route path="/example-tribute/oliver" element={<ExampleTributeOliver />} />
            <Route path="/example-tribute/max" element={<ExampleTributeMax />} />
            <Route path="/example-tribute/clover" element={<ExampleTributeClover />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PreviewGate>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
