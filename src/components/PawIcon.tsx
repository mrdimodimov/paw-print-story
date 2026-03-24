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
    {/* Inner left toe — larger */}
    <ellipse cx="8.4" cy="4.2" rx="2.4" ry="3.0" />
    {/* Inner right toe — larger */}
    <ellipse cx="15.6" cy="4.2" rx="2.4" ry="3.0" />
    {/* Outer left toe — smaller, angled */}
    <ellipse cx="4.6" cy="6.8" rx="2.0" ry="2.6" transform="rotate(-12 4.6 6.8)" />
    {/* Outer right toe — smaller, angled */}
    <ellipse cx="19.4" cy="6.8" rx="2.0" ry="2.6" transform="rotate(12 19.4 6.8)" />
    {/* Base pad — wide rounded shield */}
    <path d="M5.2 13.4C5.2 11.0 7.8 9.4 12 9.4C16.2 9.4 18.8 11.0 18.8 13.4C18.8 16.0 16.4 19.2 14.0 20.6C12.8 21.3 11.2 21.3 10.0 20.6C7.6 19.2 5.2 16.0 5.2 13.4Z" />
  </svg>
);

export default PawIcon;
