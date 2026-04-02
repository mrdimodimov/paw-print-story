import SeoArticleLayout from "@/components/SeoArticleLayout";

const PetGriefQuotes = () => (
  <SeoArticleLayout
    slug="/pet-grief-quotes"
    datePublished="2026-04-02"
    breadcrumbs={[
      { name: "Home", href: "/" },
      { name: "Pet Memorial Quotes", href: "/pet-memorial-quotes" },
      { name: "Pet Grief Quotes", href: "/pet-grief-quotes" },
    ]}
    meta={{
      title: "Pet Grief Quotes — Words That Understand Your Pain",
      description: "Pet grief quotes to validate your feelings after losing a pet. Emotional messages that acknowledge the depth of pet loss.",
    }}
    heading="Pet Grief Quotes"
    intro="Pet grief is real, and it runs deep. These pet grief quotes put words to the pain, offering validation and comfort when you're struggling with the loss of your companion."
    definitionHeading="What Are Pet Grief Quotes?"
    definition="Pet grief quotes are messages that acknowledge the pain and emotional weight of losing a beloved pet."
    contextualLinks={[
      { text: "Pet memorial quotes", href: "/pet-memorial-quotes" },
      { text: "Cope with losing a pet", href: "/cope-with-losing-a-pet" },
      { text: "Pet sympathy messages", href: "/pet-sympathy-messages" },
      { text: "Create a tribute", href: "/create" },
    ]}
    exampleHeading="Pet Grief Quotes"
    exampleTitle="Short Grief Quotes"
    exampleBody={[
      '"The grief is proof of how real the love was."',
      '"I didn\'t lose a pet. I lost a family member."',
      '"This pain is the cost of a love that was worth it."',
      '"My heart is broken in ways I can\'t explain."',
      '"You were my whole routine. Now there is none."',
    ]}
    howToWriteIntro="Emotional Grief Quotes"
    howToWriteBody={[
      '"People who\'ve never lost a pet don\'t understand how it rearranges your entire life."',
      '"I keep expecting to hear your nails on the floor."',
      '"The emptiness isn\'t just in the house — it\'s in me."',
      '"I grieve you openly because you deserve to be mourned."',
      '"They were small, but the hole they left is immeasurable."',
    ]}
    tips={[
      { heading: "Validating Your Feelings", body: "Pet grief is real grief. These quotes remind you that your pain is valid." },
      { heading: "Sharing Grief", body: "Posting a quote can help others understand what you're experiencing." },
      { heading: "Seeking Support", body: "Consider creating a memorial page as part of your healing process." },
    ]}
    tipsIntro="Ways to process pet grief."
    outroHeading="Your Grief Is Valid"
    outro="Create a lasting tribute for your pet with VellumPet. VellumPet helps pet owners create beautiful online memorial pages to honor their pets."
    faqs={[
      { question: "What are pet grief quotes?", answer: "Messages that acknowledge the emotional pain of losing a pet." },
      { question: "How do I use them?", answer: "Share on social media, journals, or memorial pages." },
      { question: "Can I share them online?", answer: "Yes, sharing grief can connect you with others who understand." },
      { question: "Are they helpful?", answer: "Yes — they validate your feelings and remind you that you're not alone." },
      { question: "Can I create a memorial page?", answer: "Yes. VellumPet helps you honor your pet with a lasting tribute." },
    ]}
    internalLinks={[
      { label: "Create a Pet Memorial", href: "/pet-memorial" },
      { label: "Pet Memorial Quotes", href: "/pet-memorial-quotes" },
      { label: "Pet Sympathy Messages", href: "/pet-sympathy-messages" },
      { label: "Cope With Losing a Pet", href: "/cope-with-losing-a-pet" },
    ]}
  />
);

export default PetGriefQuotes;
