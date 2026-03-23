import { cn } from "@/lib/utils";

interface PawIconProps {
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Custom geometric paw icon built from basic shapes.
 * 4 symmetrical toe ellipses + 1 centered main pad.
 * Designed for clarity at 16px+.
 */
const PawIcon = ({
  className,
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
}: PawIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide", className)}
  >
    {/* Toe pad 1 — far left */}
    <ellipse cx="5.2" cy="6.8" rx="2.1" ry="2.7" />
    {/* Toe pad 2 — inner left */}
    <ellipse cx="9.2" cy="4.6" rx="2.0" ry="2.5" />
    {/* Toe pad 3 — inner right */}
    <ellipse cx="14.8" cy="4.6" rx="2.0" ry="2.5" />
    {/* Toe pad 4 — far right */}
    <ellipse cx="18.8" cy="6.8" rx="2.1" ry="2.7" />
    {/* Main pad — centered, wider, heart-like bottom */}
    <path d="M7.5 13.5 C7.5 11, 9.5 10, 12 10 C14.5 10, 16.5 11, 16.5 13.5 C16.5 16, 14.5 19.5, 12 21 C9.5 19.5, 7.5 16, 7.5 13.5Z" />
  </svg>
);

export default PawIcon;
