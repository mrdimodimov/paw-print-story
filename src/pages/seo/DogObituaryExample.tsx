import SeoArticleLayout from "@/components/SeoArticleLayout";

const DogObituaryExample = () => (
  <SeoArticleLayout
    slug="/dog-obituary-example"
    datePublished="2025-01-15"
    meta={{
      title: "Dog Obituary Example | How to Write a Beautiful Tribute",
      description:
        "See a heartfelt dog obituary example and learn how to write a meaningful tribute for your beloved pet.",
    }}
    heading="Dog Obituary Example: How to Write a Beautiful Tribute"
    intro="Losing a dog is one of the hardest goodbyes. They fill our days with loyalty, joy, and unconditional love — and when they're gone, the silence can feel overwhelming. Writing an obituary or tribute for your dog is a gentle way to honor everything they meant to you. It doesn't have to be long or perfect. It just has to be real. Below you'll find an example to guide you, along with tips for writing your own."
    contextualLinks={[
      { text: "Cat memorial tribute guide", href: "/cat-memorial-tribute-example" },
      { text: "What to write when a dog dies", href: "/what-to-write-when-a-dog-dies" },
    ]}
    exampleTitle="In Loving Memory of Max"
    exampleBody={[
      "Max came into our lives on a rainy Saturday afternoon. A bundle of golden fur with oversized paws and a tail that never stopped wagging. From that very first day, he claimed the living room couch and our hearts in equal measure.",
      "He was the kind of dog who greeted every person as if they were his best friend. Walks through the park were never quick — Max had to stop and investigate every stick, every leaf, every passing squirrel. He had a particular fondness for tennis balls, often carrying two at once with a look of pure determination.",
      "On quiet evenings, Max would rest his head on your lap and sigh the kind of contented sigh that made everything feel okay. He had a gift for knowing when someone needed comfort, always appearing at your side on the hardest days.",
      "Max was with us for twelve wonderful years. He taught us about patience, loyalty, and the simple happiness of a walk on a sunny day. The house is quieter now, but the love he left behind fills every corner.",
      "Rest easy, Max. You were the very best boy.",
    ]}
    tips={[
      "Start with how your dog came into your life — the first memory often sets the tone.",
      "Mention the small habits that made them unique: the way they greeted you, their favorite spot, or a toy they loved.",
      "Describe their personality honestly — were they calm, mischievous, brave, or gentle?",
      "Include a favorite memory or moment that captures who they were.",
      "End with a simple farewell. You don't need grand words — sincerity is what matters most.",
    ]}
  />
);

export default DogObituaryExample;
