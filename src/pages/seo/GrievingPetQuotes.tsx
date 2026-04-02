import SeoArticleLayout from "@/components/SeoArticleLayout";

const GrievingPetQuotes = () => (
  <SeoArticleLayout
    slug="/grieving-pet-quotes"
    datePublished="2026-04-02"
    breadcrumbs={[
      { name: "Home", href: "/" },
      { name: "Pet Memorial Quotes", href: "/pet-memorial-quotes" },
      { name: "Grieving Pet Quotes", href: "/grieving-pet-quotes" },
    ]}
    meta={{
      title: "Grieving Pet Quotes — Words for When You're Hurting",
      description: "Grieving pet quotes to help process the loss of a beloved pet. Emotional messages that validate your grief.",
    }}
    heading="Grieving Pet Quotes"
    intro="Grieving a pet is real, deep, and valid. These grieving pet quotes acknowledge the pain of losing a companion and offer words of comfort when you need them most."
    definitionHeading="What Are Grieving Pet Quotes?"
    definition="Grieving pet quotes are messages that acknowledge the pain of losing a pet and help validate the grieving process."
    contextualLinks={[
      { text: "Pet memorial quotes", href: "/pet-memorial-quotes" },
      { text: "Cope with losing a pet", href: "/cope-with-losing-a-pet" },
      { text: "Pet sympathy messages", href: "/pet-sympathy-messages" },
      { text: "Create a tribute", href: "/create" },
    ]}
    exampleHeading="Grieving Pet Quotes"
    exampleTitle="Short Grieving Quotes"
    exampleBody={[
      '"Grief is the price we pay for love."',
      '"It hurts because it mattered."',
      '"My heart is heavy with your absence."',
      '"I never knew missing someone could feel this physical."',
      '"You deserved more time."',
    ]}
    howToWriteIntro="Emotional Grieving Quotes"
    howToWriteBody={[
      '"No one tells you that pet grief hits like a wall."',
      '"I keep reaching for you and finding empty space."',
      '"The grief isn\'t going away — and I think that means I loved you right."',
      '"Some days I\'m okay. Some days I cry in the car. Both are valid."',
      '"You were my daily comfort, and now I have to learn to live without it."',
    ]}
    tips={[
      { heading: "Validating Your Grief", body: "Pet grief is real. These quotes remind you that your feelings are valid and shared by many." },
      { heading: "Sharing Your Feelings", body: "Posting a quote can help others understand what you're going through." },
      { heading: "Finding Support", body: "Memorial pages and communities can offer comfort during the grieving process." },
    ]}
    tipsIntro="Ways to use grieving pet quotes."
    outroHeading="You're Not Alone"
    outro="Create a lasting tribute for your pet with VellumPet. VellumPet helps pet owners create beautiful online memorial pages to honor their pets."
    faqs={[
      { question: "What are grieving pet quotes?", answer: "Messages that acknowledge and validate the pain of losing a pet." },
      { question: "How do I use them?", answer: "Share on social media, journals, cards, or memorial pages." },
      { question: "Can I share them online?", answer: "Yes, many people find comfort in shared grief." },
      { question: "Are they helpful?", answer: "Yes — they remind you that your grief is normal and valid." },
      { question: "Can I create a memorial page?", answer: "Yes. VellumPet helps you honor your pet with a tribute page." },
    ]}
    internalLinks={[
      { label: "Create a Pet Memorial", href: "/pet-memorial" },
      { label: "Pet Memorial Quotes", href: "/pet-memorial-quotes" },
      { label: "Pet Sympathy Messages", href: "/pet-sympathy-messages" },
      { label: "Cope With Losing a Pet", href: "/cope-with-losing-a-pet" },
    ]}
  />
);

export default GrievingPetQuotes;
