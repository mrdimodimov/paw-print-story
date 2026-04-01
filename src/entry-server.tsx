import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";

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

export function render(url: string) {
  const helmetContext: { helmet?: any } = {};
  const queryClient = new QueryClient();

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <StaticRouter location={url}>
            <Routes>
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
            </Routes>
          </StaticRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );

  const { helmet } = helmetContext;

  return {
    html,
    head: [
      helmet?.title?.toString() ?? "",
      helmet?.meta?.toString() ?? "",
      helmet?.link?.toString() ?? "",
      helmet?.script?.toString() ?? "",
    ].join("\n"),
  };
}
