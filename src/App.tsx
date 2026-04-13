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
import Memorials from "./pages/Memorials";
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
import ShortPetMemorialQuotes from "./pages/seo/ShortPetMemorialQuotes";
import DogLossQuotes from "./pages/seo/DogLossQuotes";
import CatLossQuotes from "./pages/seo/CatLossQuotes";
import PetMemorialCaptions from "./pages/seo/PetMemorialCaptions";
import InstagramPetMemorialCaptions from "./pages/seo/InstagramPetMemorialCaptions";
import SuddenPetDeathQuotes from "./pages/seo/SuddenPetDeathQuotes";
import PetAnniversaryQuotes from "./pages/seo/PetAnniversaryQuotes";
import RestInPeaceDogQuotes from "./pages/seo/RestInPeaceDogQuotes";
// Batch 1 — Dog Breeds
import LabradorMemorialQuotes from "./pages/seo/LabradorMemorialQuotes";
import GoldenRetrieverMemorialQuotes from "./pages/seo/GoldenRetrieverMemorialQuotes";
import GermanShepherdMemorialQuotes from "./pages/seo/GermanShepherdMemorialQuotes";
import FrenchBulldogMemorialQuotes from "./pages/seo/FrenchBulldogMemorialQuotes";
import PoodleMemorialQuotes from "./pages/seo/PoodleMemorialQuotes";
import BeagleMemorialQuotes from "./pages/seo/BeagleMemorialQuotes";
import RottweilerMemorialQuotes from "./pages/seo/RottweilerMemorialQuotes";
import YorkieMemorialQuotes from "./pages/seo/YorkieMemorialQuotes";
import DachshundMemorialQuotes from "./pages/seo/DachshundMemorialQuotes";
import BoxerDogMemorialQuotes from "./pages/seo/BoxerDogMemorialQuotes";
// Batch 2 — Pet Names
import PetMemorialQuotesBella from "./pages/seo/PetMemorialQuotesBella";
import PetMemorialQuotesMax from "./pages/seo/PetMemorialQuotesMax";
import PetMemorialQuotesLuna from "./pages/seo/PetMemorialQuotesLuna";
import PetMemorialQuotesCharlie from "./pages/seo/PetMemorialQuotesCharlie";
import PetMemorialQuotesLucy from "./pages/seo/PetMemorialQuotesLucy";
import PetMemorialQuotesDaisy from "./pages/seo/PetMemorialQuotesDaisy";
import PetMemorialQuotesMilo from "./pages/seo/PetMemorialQuotesMilo";
import PetMemorialQuotesCooper from "./pages/seo/PetMemorialQuotesCooper";
import PetMemorialQuotesBailey from "./pages/seo/PetMemorialQuotesBailey";
import PetMemorialQuotesSadie from "./pages/seo/PetMemorialQuotesSadie";
// Batch 3 — Emotional Long-Tail
import LosingAPetQuotes from "./pages/seo/LosingAPetQuotes";
import GrievingPetQuotes from "./pages/seo/GrievingPetQuotes";
import PetLossPoems from "./pages/seo/PetLossPoems";
import PetMemorialPrayers from "./pages/seo/PetMemorialPrayers";
import ShortPetLossMessages from "./pages/seo/ShortPetLossMessages";
import LongPetMemorialMessages from "./pages/seo/LongPetMemorialMessages";
import PetLossInstagramCaptions from "./pages/seo/PetLossInstagramCaptions";
import PetRemembranceMessages from "./pages/seo/PetRemembranceMessages";
import PetGriefQuotes from "./pages/seo/PetGriefQuotes";
import MissingMyPetQuotes from "./pages/seo/MissingMyPetQuotes";
// Batch 4 — New long-tail
import ShortCatMemorialQuotes from "./pages/seo/ShortCatMemorialQuotes";
import LossOfDogMessagesToAFriend from "./pages/seo/LossOfDogMessagesToAFriend";
import SuddenDogDeathQuotes from "./pages/seo/SuddenDogDeathQuotes";
import PetGriefQuotesForInstagram from "./pages/seo/PetGriefQuotesForInstagram";

import ExampleTribute from "./pages/ExampleTribute";
import ExampleTributeOliver from "./pages/ExampleTributeOliver";
import ExampleTributeMax from "./pages/ExampleTributeMax";
import ExampleTributeClover from "./pages/ExampleTributeClover";
import PaymentSuccess from "./pages/PaymentSuccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AdminDashboard from "./pages/AdminDashboard";
import Unsubscribe from "./pages/Unsubscribe";
import MemorialManage from "./pages/MemorialManage";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

// TEMPORARY: Set to false to disable coming soon mode and launch the full site
const COMING_SOON_ENABLED = false;
const PREVIEW_KEY = "founder";

const PreviewGate = ({ children }: { children: React.ReactNode }) => {
  const [searchParams] = useSearchParams();
  const { isTestMode, isFounderMode, toggleTestMode, disableFounderMode } = useTestMode();

  const [unlocked, setUnlocked] = useState(() => {
    const hasPreview = searchParams.get("preview") === PREVIEW_KEY;
    const hasTesterParam = !!searchParams.get("tester");
    const isTester = localStorage.getItem("is_tester") === "true";
    const hasTesterToken = !!localStorage.getItem("tester_token");
    const isFounder = localStorage.getItem("founderMode") === "true";
    const previewSession = sessionStorage.getItem("preview_unlocked") === "true";
    return hasPreview || hasTesterParam || isTester || hasTesterToken || isFounder || previewSession;
  });

  useEffect(() => {
    if (searchParams.get("preview") === PREVIEW_KEY) {
      sessionStorage.setItem("preview_unlocked", "true");
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
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/create" element={<Questionnaire />} />
            <Route path="/tribute" element={<TributePage />} />
            <Route path="/tribute/:id" element={<TributePage />} />
            <Route path="/tribute/s/:slug" element={<TributePage />} />
            <Route path="/memorial/:slug" element={<PublicMemorialPage />} />
            <Route path="/memorial/manage/:slug" element={<MemorialManage />} />
            <Route path="/memory/:slug" element={<PublicMemorialPage />} />
            <Route path="/memories" element={<MemoriesGallery />} />
            <Route path="/memorials" element={<Memorials />} />
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
            <Route path="/dog-memorial-quotes" element={<DogMemorialQuotes />} />
            <Route path="/cat-memorial-quotes" element={<CatMemorialQuotes />} />
            <Route path="/pet-remembrance-quotes" element={<PetRemembranceQuotes />} />
            <Route path="/what-to-write-when-a-cat-dies" element={<WhatToWriteWhenCatDies />} />
            <Route path="/pet-condolence-messages" element={<PetCondolenceMessages />} />
            <Route path="/short-pet-memorial-quotes" element={<ShortPetMemorialQuotes />} />
            <Route path="/dog-loss-quotes" element={<DogLossQuotes />} />
            <Route path="/cat-loss-quotes" element={<CatLossQuotes />} />
            <Route path="/pet-memorial-captions" element={<PetMemorialCaptions />} />
            <Route path="/instagram-pet-memorial-captions" element={<InstagramPetMemorialCaptions />} />
            <Route path="/sudden-pet-death-quotes" element={<SuddenPetDeathQuotes />} />
            <Route path="/pet-anniversary-quotes" element={<PetAnniversaryQuotes />} />
            <Route path="/rest-in-peace-dog-quotes" element={<RestInPeaceDogQuotes />} />
            {/* Batch 1 — Dog Breeds */}
            <Route path="/labrador-memorial-quotes" element={<LabradorMemorialQuotes />} />
            <Route path="/golden-retriever-memorial-quotes" element={<GoldenRetrieverMemorialQuotes />} />
            <Route path="/german-shepherd-memorial-quotes" element={<GermanShepherdMemorialQuotes />} />
            <Route path="/french-bulldog-memorial-quotes" element={<FrenchBulldogMemorialQuotes />} />
            <Route path="/poodle-memorial-quotes" element={<PoodleMemorialQuotes />} />
            <Route path="/beagle-memorial-quotes" element={<BeagleMemorialQuotes />} />
            <Route path="/rottweiler-memorial-quotes" element={<RottweilerMemorialQuotes />} />
            <Route path="/yorkie-memorial-quotes" element={<YorkieMemorialQuotes />} />
            <Route path="/dachshund-memorial-quotes" element={<DachshundMemorialQuotes />} />
            <Route path="/boxer-dog-memorial-quotes" element={<BoxerDogMemorialQuotes />} />
            {/* Batch 2 — Pet Names */}
            <Route path="/pet-memorial-quotes-bella" element={<PetMemorialQuotesBella />} />
            <Route path="/pet-memorial-quotes-max" element={<PetMemorialQuotesMax />} />
            <Route path="/pet-memorial-quotes-luna" element={<PetMemorialQuotesLuna />} />
            <Route path="/pet-memorial-quotes-charlie" element={<PetMemorialQuotesCharlie />} />
            <Route path="/pet-memorial-quotes-lucy" element={<PetMemorialQuotesLucy />} />
            <Route path="/pet-memorial-quotes-daisy" element={<PetMemorialQuotesDaisy />} />
            <Route path="/pet-memorial-quotes-milo" element={<PetMemorialQuotesMilo />} />
            <Route path="/pet-memorial-quotes-cooper" element={<PetMemorialQuotesCooper />} />
            <Route path="/pet-memorial-quotes-bailey" element={<PetMemorialQuotesBailey />} />
            <Route path="/pet-memorial-quotes-sadie" element={<PetMemorialQuotesSadie />} />
            {/* Batch 3 — Emotional Long-Tail */}
            <Route path="/losing-a-pet-quotes" element={<LosingAPetQuotes />} />
            <Route path="/grieving-pet-quotes" element={<GrievingPetQuotes />} />
            <Route path="/pet-loss-poems" element={<PetLossPoems />} />
            <Route path="/pet-memorial-prayers" element={<PetMemorialPrayers />} />
            <Route path="/short-pet-loss-messages" element={<ShortPetLossMessages />} />
            <Route path="/long-pet-memorial-messages" element={<LongPetMemorialMessages />} />
            <Route path="/pet-loss-instagram-captions" element={<PetLossInstagramCaptions />} />
            <Route path="/pet-remembrance-messages" element={<PetRemembranceMessages />} />
            <Route path="/pet-grief-quotes" element={<PetGriefQuotes />} />
            <Route path="/missing-my-pet-quotes" element={<MissingMyPetQuotes />} />
            {/* Batch 4 — New long-tail */}
            <Route path="/short-cat-memorial-quotes" element={<ShortCatMemorialQuotes />} />
            <Route path="/loss-of-dog-messages-to-a-friend" element={<LossOfDogMessagesToAFriend />} />
            <Route path="/sudden-dog-death-quotes" element={<SuddenDogDeathQuotes />} />
            <Route path="/pet-grief-quotes-for-instagram" element={<PetGriefQuotesForInstagram />} />

            <Route path="/example-tribute" element={<ExampleTribute />} />
            <Route path="/example-tribute/oliver" element={<ExampleTributeOliver />} />
            <Route path="/example-tribute/max" element={<ExampleTributeMax />} />
            <Route path="/example-tribute/clover" element={<ExampleTributeClover />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
