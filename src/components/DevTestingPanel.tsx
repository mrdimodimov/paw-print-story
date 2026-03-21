import { Bug, FlaskConical, SkipForward, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEST_PRESETS } from "@/lib/test-presets";
import type { TributeFormData, TributeStyle } from "@/lib/types";

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
  onSkipToPreview?: () => void;
  isTestMode?: boolean;
}

export function DevTestingPanel({
  onFill,
  onToneChange,
  currentTone,
  onSkipToPreview,
  isTestMode,
}: DevTestingPanelProps) {
  // Show panel in DEV mode OR when test mode is active
  if (!import.meta.env.DEV && !isTestMode) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-lg border border-dashed border-yellow-500/50 bg-card p-3 shadow-lg">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-yellow-600">
        <Bug className="h-3.5 w-3.5" />
        {isTestMode ? "Test Mode" : "Dev Testing"}
      </div>

      <div className="space-y-2">
        {/* Preset selector */}
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">
            Test Scenario
          </label>
          <Select
            onValueChange={(presetId) => {
              const preset = TEST_PRESETS.find((p) => p.id === presetId);
              if (preset) {
                onFill(preset.data);
                if (preset.data.tone) onToneChange(preset.data.tone);
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Choose preset…" />
            </SelectTrigger>
            <SelectContent>
              {TEST_PRESETS.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  <span className="font-medium">{p.label}</span>
                  <span className="ml-1 text-muted-foreground">— {p.description}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick fill */}
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => {
            const medium = TEST_PRESETS.find((p) => p.id === "medium");
            if (medium) {
              onFill(medium.data);
              if (medium.data.tone) onToneChange(medium.data.tone);
            }
          }}
        >
          <FlaskConical className="mr-1.5 h-3.5 w-3.5" />
          Auto-Fill (Medium)
        </Button>

        {/* Tone override */}
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">
            Override Tone
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

        {/* Skip to preview */}
        {onSkipToPreview && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs border-yellow-500/40 text-yellow-700 hover:bg-yellow-50"
            onClick={onSkipToPreview}
          >
            <SkipForward className="mr-1.5 h-3.5 w-3.5" />
            Skip to Preview
          </Button>
        )}
      </div>
    </div>
  );
}
