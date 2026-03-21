import { Bug, Crown, X } from "lucide-react";

interface TestModeBadgeProps {
  isTestMode: boolean;
  isFounderMode: boolean;
  onToggleOff: () => void;
  onDisableFounder?: () => void;
}

export function TestModeBadge({ isTestMode, isFounderMode, onToggleOff, onDisableFounder }: TestModeBadgeProps) {
  if (!import.meta.env.DEV) return null;
  if (!isTestMode && !isFounderMode) return null;

  return (
    <div className="fixed top-3 right-3 z-[9999] flex items-center gap-2 rounded-full border border-yellow-500/50 bg-card px-3 py-1.5 text-xs font-semibold text-yellow-700 shadow-md dark:text-yellow-300">
      {isFounderMode ? (
        <Crown className="h-3.5 w-3.5" />
      ) : (
        <Bug className="h-3.5 w-3.5" />
      )}
      {isFounderMode ? "Founder Mode" : "Test Mode"}
      <button
        onClick={isFounderMode ? onDisableFounder : onToggleOff}
        className="ml-1 rounded-full p-0.5 transition-colors hover:bg-accent"
        title={isFounderMode ? "Disable Founder Mode" : "Exit Test Mode"}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
