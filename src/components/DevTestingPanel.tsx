import { Bug, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TributeFormData, TributeStyle } from "@/lib/types";

const EXAMPLE_DATA: Partial<TributeFormData> = {
  pet_name: "Bella",
  pet_type: "Dog",
  breed: "Golden Retriever",
  years_of_life: "2012–2024",
  owner_name: "Emma",
  personality_traits: ["Gentle", "Playful", "Loyal"],
  personality_description:
    "Bella loved carrying socks around the house and greeting everyone at the door with a toy.",
  memories: ["She waited every evening by the window for her dad to come home."],
  special_habits: "Slept on the same corner of the couch every night.",
  favorite_activities: "Swimming in the lake and chasing tennis balls.",
  favorite_people_or_animals: "Followed the younger brother everywhere.",
  owner_message: "Thank you for growing up with us.",
  tone: "warm" as TributeStyle,
};

const TONE_OPTIONS: { value: TributeStyle; label: string }[] = [
  { value: "warm", label: "Warm" },
  { value: "celebratory", label: "Celebratory" },
  { value: "gentle", label: "Gentle" },
  { value: "lighthearted", label: "Lighthearted" },
  { value: "rainbow_bridge", label: "Rainbow Bridge" },
];

interface DevTestingPanelProps {
  onFill: (data: Partial<TributeFormData>) => void;
  onToneChange: (tone: TributeStyle) => void;
  currentTone: TributeStyle;
}

export function DevTestingPanel({ onFill, onToneChange, currentTone }: DevTestingPanelProps) {
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-64 rounded-lg border border-dashed border-yellow-500/50 bg-card p-3 shadow-lg">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-yellow-600">
        <Bug className="h-3.5 w-3.5" />
        Dev Testing
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => onFill(EXAMPLE_DATA)}
        >
          <FlaskConical className="mr-1.5 h-3.5 w-3.5" />
          Fill Example Data
        </Button>

        <div>
          <label className="mb-1 block text-[10px] font-medium text-muted-foreground uppercase">
            Test Tone
          </label>
          <Select value={currentTone} onValueChange={(v) => onToneChange(v as TributeStyle)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONE_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value} className="text-xs">
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
