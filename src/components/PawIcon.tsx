import { cn } from "@/lib/utils";

interface PawIconProps {
  className?: string;
  size?: number;
  color?: string;
}

/**
 * Solid-filled paw icon — wax-seal / imprint aesthetic.
 * 4 identical oval toe pads on a gentle arc + 1 larger base pad.
 * Compact, symmetrical, no outlines or inner details.
 */
const PawIcon = ({
  className,
  size = 24,
  color = "currentColor",
}: PawIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    stroke="none"
    className={cn("lucide", className)}
  >
    {/* Toe pad 1 — far left */}
    <ellipse cx="5.5" cy="7.2" rx="2.0" ry="2.6" />
    {/* Toe pad 2 — inner left */}
    <ellipse cx="9.4" cy="5.0" rx="2.0" ry="2.6" />
    {/* Toe pad 3 — inner right */}
    <ellipse cx="14.6" cy="5.0" rx="2.0" ry="2.6" />
    {/* Toe pad 4 — far right */}
    <ellipse cx="18.5" cy="7.2" rx="2.0" ry="2.6" />
    {/* Base pad — wider, centered, heart-like bottom */}
    <path d="M7.8 13.2C7.8 11.2 9.6 9.8 12 9.8C14.4 9.8 16.2 11.2 16.2 13.2C16.2 15.6 14.4 18.8 12 20.4C9.6 18.8 7.8 15.6 7.8 13.2Z" />
  </svg>
);

export default PawIcon;
