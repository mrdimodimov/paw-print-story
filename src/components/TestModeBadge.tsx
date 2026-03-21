import { Bug, X } from "lucide-react";

interface TestModeBadgeProps {
  isTestMode: boolean;
  onToggleOff: () => void;
}

export function TestModeBadge({ isTestMode, onToggleOff }: TestModeBadgeProps) {
  if (!import.meta.env.DEV) return null;
  if (!isTestMode) return null;

  return (
    <div className="fixed top-3 right-3 z-[9999] flex items-center gap-2 rounded-full border border-yellow-500/50 bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-700 shadow-md dark:bg-yellow-950 dark:text-yellow-300">
      <Bug className="h-3.5 w-3.5" />
      Test Mode
      <button
        onClick={onToggleOff}
        className="ml-1 rounded-full p-0.5 transition-colors hover:bg-yellow-200 dark:hover:bg-yellow-800"
        title="Exit Test Mode"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
