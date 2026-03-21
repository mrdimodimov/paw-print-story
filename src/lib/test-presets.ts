import type { TributeFormData, TributeStyle } from "@/lib/types";

export interface TestPreset {
  id: string;
  label: string;
  description: string;
  data: Partial<TributeFormData>;
}

export const TEST_PRESETS: TestPreset[] = [
  {
    id: "low",
    label: "Low Input",
    description: "1–2 short memories, minimal detail",
    data: {
      pet_name: "Daisy",
      pet_type: "Cat",
      breed: "Tabby",
      years_of_life: "2015–2025",
      owner_name: "Sarah",
      personality_traits: ["Calm", "Sweet"],
      personality_description: "She loved sitting in sunbeams.",
      memories: ["She used to curl up on the windowsill every morning."],
      special_habits: "",
      favorite_activities: "Watching birds",
      favorite_people_or_animals: "",
      owner_message: "",
      tone: "gentle" as TributeStyle,
    },
  },
  {
    id: "medium",
    label: "Medium Input",
    description: "3–5 memories, moderate detail",
    data: {
      pet_name: "Milo",
      pet_type: "Dog",
      breed: "Golden Retriever",
      years_of_life: "2012–2026",
      owner_name: "Emma",
      personality_traits: ["Gentle", "Playful", "Loyal"],
      personality_description:
        "Milo loved carrying socks around the house and greeting everyone at the door with a toy.",
      memories: [
        "He waited every evening by the window for his dad to come home.",
        "On rainy days he'd press his nose against the glass and whine softly.",
        "He once stole an entire loaf of bread from the counter and hid it under the bed.",
        "Every Sunday morning he'd nudge the bedroom door open and lay his head on the pillow.",
      ],
      special_habits: "Slept on the same corner of the couch every night.",
      favorite_activities: "Swimming in the lake and chasing tennis balls.",
      favorite_people_or_animals: "Followed the younger brother everywhere.",
      owner_message: "Thank you for growing up with us.",
      tone: "warm" as TributeStyle,
    },
  },
  {
    id: "high",
    label: "High Input",
    description: "Rich, detailed memories",
    data: {
      pet_name: "Bear",
      pet_type: "Dog",
      breed: "Bernese Mountain Dog",
      years_of_life: "2014–2026",
      owner_name: "James",
      personality_traits: ["Brave", "Gentle", "Loyal", "Calm", "Sweet"],
      personality_description:
        "Bear was the kind of dog who made strangers feel like old friends. He had this way of leaning into you, all 110 pounds, and looking up like he was asking permission to love you.",
      memories: [
        "The first night we brought him home, he cried until we put a ticking clock wrapped in a blanket next to him. He slept through the night after that and never cried again.",
        "He used to walk the kids to the bus stop every morning. He'd sit at the end of the driveway until the bus disappeared, then trot back inside.",
        "During the snowstorm of 2019, he refused to come inside. We found him lying in the yard, completely covered, with just his nose poking out—happier than we'd ever seen him.",
        "He could sense when someone was upset. He'd find them, sit beside them, and rest his head on their lap without making a sound.",
        "His favorite thing was the car ride to the lake. He'd stick his whole head out the window, ears flapping, drool everywhere.",
        "The last time we took him to the lake, he walked slowly to the edge, waded in up to his chest, and just stood there looking at the water. We like to think he was remembering.",
      ],
      special_habits:
        "He circled exactly three times before lying down. He always stole the warmest spot on the couch. He barked at every delivery truck but was terrified of the vacuum.",
      favorite_activities:
        "Hiking, swimming, snow days, riding in the truck, and stealing food off the counter when no one was looking.",
      favorite_people_or_animals:
        "His best friend was a tiny rescue cat named Pepper. They slept curled up together every night.",
      owner_message:
        "You were the best thing that ever happened to our family. The house is too quiet without you.",
      tone: "warm" as TributeStyle,
    },
  },
  {
    id: "edge",
    label: "Edge Case",
    description: "Minimal / unusual input",
    data: {
      pet_name: "Bubbles",
      pet_type: "Fish",
      breed: "",
      years_of_life: "3 years",
      owner_name: "",
      personality_traits: [],
      personality_description: "",
      memories: ["He always swam to the glass when I tapped."],
      special_habits: "",
      favorite_activities: "",
      favorite_people_or_animals: "",
      owner_message: "Such a small life, but I miss you.",
      tone: "gentle" as TributeStyle,
    },
  },
  {
    id: "funny",
    label: "Funny Tone",
    description: "Lighthearted, playful memories",
    data: {
      pet_name: "Pickles",
      pet_type: "Dog",
      breed: "French Bulldog",
      years_of_life: "2018–2026",
      owner_name: "Tom",
      personality_traits: ["Mischievous", "Funny", "Stubborn"],
      personality_description:
        "Pickles had zero respect for personal space and believed every couch cushion was his personal throne.",
      memories: [
        "He once ate an entire stick of butter off the counter and spent the rest of the day looking incredibly pleased with himself.",
        "He snored so loudly the neighbors asked if we were doing construction.",
        "He refused to walk past the fire hydrant on Oak Street. We never found out why.",
      ],
      special_habits:
        "Would dramatically flop onto his back whenever he wanted attention.",
      favorite_activities: "Destroying squeaky toys, stealing shoes, supervised napping.",
      favorite_people_or_animals: "Obsessed with the mail carrier. It was not mutual.",
      owner_message: "You made us laugh every single day, you ridiculous little gremlin.",
      tone: "lighthearted" as TributeStyle,
    },
  },
  {
    id: "emotional",
    label: "Emotional Tone",
    description: "Deep, reflective memories",
    data: {
      pet_name: "Shadow",
      pet_type: "Dog",
      breed: "German Shepherd",
      years_of_life: "2010–2024",
      owner_name: "Maria",
      personality_traits: ["Loyal", "Brave", "Gentle"],
      personality_description:
        "Shadow was my protector. He knew when I was sad before I did.",
      memories: [
        "When I went through my divorce, he slept on my side of the bed every night. He never left my side.",
        "He used to walk me to the car every morning and watch from the window until I drove away.",
        "The day I brought my daughter home from the hospital, he sniffed her gently, then laid down at the foot of her crib and didn't move for hours.",
      ],
      special_habits: "He'd lean against my legs whenever we stood still.",
      favorite_activities: "Long walks at dusk, just the two of us.",
      favorite_people_or_animals: "He loved my daughter more than anything in this world.",
      owner_message: "You saved me in ways I'll never be able to explain.",
      tone: "warm" as TributeStyle,
    },
  },
];
