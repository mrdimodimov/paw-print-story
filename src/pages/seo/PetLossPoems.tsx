import SeoArticleLayout from "@/components/SeoArticleLayout";

const PetLossPoems = () => (
  <SeoArticleLayout
    slug="/pet-loss-poems"
    datePublished="2026-04-02"
    breadcrumbs={[
      { name: "Home", href: "/" },
      { name: "Pet Memorial Quotes", href: "/pet-memorial-quotes" },
      { name: "Pet Loss Poems", href: "/pet-loss-poems" },
    ]}
    meta={{
      title: "Pet Loss Poems — Beautiful Words to Honor Your Pet",
      description: "Pet loss poems to help express grief and celebrate your pet's life. Heartfelt verses for memorials and tributes.",
    }}
    heading="Pet Loss Poems"
    intro="Sometimes prose isn't enough. These pet loss poems offer a poetic way to express grief, honor your pet's memory, and find comfort in the beauty of language."
    definitionHeading="What Are Pet Loss Poems?"
    definition="Pet loss poems are short verses written to express grief, love, and remembrance after a pet passes away."
    contextualLinks={[
      { text: "Pet memorial quotes", href: "/pet-memorial-quotes" },
      { text: "Rainbow Bridge quotes", href: "/rainbow-bridge-quotes" },
      { text: "Pet remembrance quotes", href: "/pet-remembrance-quotes" },
      { text: "Create a tribute", href: "/create" },
    ]}
    exampleHeading="Pet Loss Poems"
    exampleTitle="Short Pet Loss Verses"
    exampleBody={[
      '"Four paws, one heart, a lifetime of love — gone too soon, but never forgotten."',
      '"You came into my life on four quiet feet and left with a piece of my soul."',
      '"In the garden of memory, you bloom eternal."',
      '"A whisper of fur, a flash of joy — you were here, and you were everything."',
      '"The space you filled was bigger than you, and the space you left is infinite."',
    ]}
    howToWriteIntro="Longer Pet Loss Verses"
    howToWriteBody={[
      '"You slept beside me every night, a warm and steady light. Now the bed feels cold and wide, missing you by my side."',
      '"They say you crossed a bridge of rainbow light. I believe you did, and I believe you\'re alright."',
      '"I held you close, I let you go. The hardest thing I\'ll ever know."',
      '"You were a chapter, not a footnote. You were a story worth every word."',
      '"If love could have saved you, you would have lived forever."',
    ]}
    tips={[
      { heading: "Using Pet Loss Poems", body: "Include in memorial cards, tribute pages, photo albums, or social media posts." },
      { heading: "Writing Your Own", body: "Start with a memory or feeling — even a few lines can become a meaningful poem." },
      { heading: "Sharing With Others", body: "Poems can comfort friends and family who also loved your pet." },
    ]}
    tipsIntro="Ways to use pet loss poems."
    outroHeading="Honor Your Pet Through Poetry"
    outro="Create a lasting tribute for your pet with VellumPet. VellumPet helps pet owners create beautiful online memorial pages to honor their pets."
    faqs={[
      { question: "What are pet loss poems?", answer: "Short verses written to express grief and honor a pet who has passed." },
      { question: "How do I use them?", answer: "On cards, memorial pages, social media, or personal journals." },
      { question: "Can I share them online?", answer: "Yes, poems are widely shared as tributes to pets." },
      { question: "Are they meaningful?", answer: "Yes — poetry can express feelings that prose cannot." },
      { question: "Can I create a memorial page?", answer: "Yes. VellumPet lets you build a tribute with poems, photos, and stories." },
    ]}
    internalLinks={[
      { label: "Create a Pet Memorial", href: "/pet-memorial" },
      { label: "Pet Memorial Quotes", href: "/pet-memorial-quotes" },
      { label: "Pet Sympathy Messages", href: "/pet-sympathy-messages" },
      { label: "Rainbow Bridge Quotes", href: "/rainbow-bridge-quotes" },
    ]}
  />
);

export default PetLossPoems;
