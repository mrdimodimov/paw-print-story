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
    <ellipse cx="5.8" cy="7.0" rx="2.6" ry="3.2" />
    {/* Toe pad 2 — inner left */}
    <ellipse cx="9.6" cy="4.6" rx="2.6" ry="3.2" />
    {/* Toe pad 3 — inner right */}
    <ellipse cx="14.4" cy="4.6" rx="2.6" ry="3.2" />
    {/* Toe pad 4 — far right */}
    <ellipse cx="18.2" cy="7.0" rx="2.6" ry="3.2" />
    {/* Base pad — wide, flat, soft bottom */}
    <path d="M5.8 14.0C5.8 11.6 8.4 10.0 12 10.0C15.6 10.0 18.2 11.6 18.2 14.0C18.2 16.8 15.8 20.0 12 21.6C8.2 20.0 5.8 16.8 5.8 14.0Z" />
  </svg>
);

export default PawIcon;
