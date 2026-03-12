import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Questionnaire from "./pages/Questionnaire";
import TributePage from "./pages/TributePage";
import PublicMemorialPage from "./pages/PublicMemorialPage";
import NotFound from "./pages/NotFound";
import DogObituaryExample from "./pages/seo/DogObituaryExample";
import CatMemorialTributeExample from "./pages/seo/CatMemorialTributeExample";
import PetMemorialMessage from "./pages/seo/PetMemorialMessage";
import WhatToWriteWhenDogDies from "./pages/seo/WhatToWriteWhenDogDies";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<Questionnaire />} />
          <Route path="/tribute" element={<TributePage />} />
          <Route path="/dog-obituary-example" element={<DogObituaryExample />} />
          <Route path="/cat-memorial-tribute-example" element={<CatMemorialTributeExample />} />
          <Route path="/pet-memorial-message" element={<PetMemorialMessage />} />
          <Route path="/what-to-write-when-a-dog-dies" element={<WhatToWriteWhenDogDies />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
