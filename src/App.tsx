import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useSearchParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import Landing from "./pages/Landing";
import Questionnaire from "./pages/Questionnaire";
import TributePage from "./pages/TributePage";
import PublicMemorialPage from "./pages/PublicMemorialPage";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";
import DogObituaryExample from "./pages/seo/DogObituaryExample";
import CatMemorialTributeExample from "./pages/seo/CatMemorialTributeExample";
import PetMemorialMessage from "./pages/seo/PetMemorialMessage";
import WhatToWriteWhenDogDies from "./pages/seo/WhatToWriteWhenDogDies";
import ExampleTribute from "./pages/ExampleTribute";

const queryClient = new QueryClient();

// TEMPORARY: Set to false to disable coming soon mode and launch the full site
const COMING_SOON_ENABLED = true;
const PREVIEW_KEY = "founder";

const PreviewGate = ({ children }: { children: React.ReactNode }) => {
  const [searchParams] = useSearchParams();
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (searchParams.get("preview") === PREVIEW_KEY) {
      sessionStorage.setItem("preview_unlocked", "true");
      setUnlocked(true);
    } else if (sessionStorage.getItem("preview_unlocked") === "true") {
      setUnlocked(true);
    }
  }, [searchParams]);

  if (COMING_SOON_ENABLED && !unlocked) {
    return <ComingSoon />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PreviewGate>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/create" element={<Questionnaire />} />
            <Route path="/tribute" element={<TributePage />} />
            <Route path="/tribute/:id" element={<TributePage />} />
            <Route path="/memory/:slug" element={<PublicMemorialPage />} />
            <Route path="/dog-obituary-example" element={<DogObituaryExample />} />
            <Route path="/cat-memorial-tribute-example" element={<CatMemorialTributeExample />} />
            <Route path="/pet-memorial-message" element={<PetMemorialMessage />} />
            <Route path="/what-to-write-when-a-dog-dies" element={<WhatToWriteWhenDogDies />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PreviewGate>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
