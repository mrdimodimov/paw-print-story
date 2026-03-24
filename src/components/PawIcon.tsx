import { cn } from "@/lib/utils";

interface PawIconProps {
  className?: string;
  size?: number;
  color?: string;
}

/**
 * Solid-filled paw icon — hand-traced from brand reference image.
 * Five organic paths (4 toes + 1 main pad), no geometric primitives.
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
    {/* Inner-left toe — larger, slight inward tilt */}
    <path d="M6.8 1.4C7.6 0.9 8.7 1.0 9.6 1.6C10.4 2.2 10.9 3.2 10.8 4.2C10.7 5.4 10.2 6.4 9.4 6.9C8.5 7.5 7.4 7.3 6.6 6.6C5.9 5.9 5.5 4.8 5.6 3.6C5.7 2.6 6.1 1.8 6.8 1.4Z" />
    {/* Inner-right toe — larger, slight outward tilt */}
    <path d="M17.2 1.4C16.4 0.9 15.3 1.0 14.4 1.6C13.6 2.2 13.1 3.2 13.2 4.2C13.3 5.4 13.8 6.4 14.6 6.9C15.5 7.5 16.6 7.3 17.4 6.6C18.1 5.9 18.5 4.8 18.4 3.6C18.3 2.6 17.9 1.8 17.2 1.4Z" />
    {/* Outer-left toe — smaller, tilted outward */}
    <path d="M3.2 5.6C3.8 4.8 4.8 4.6 5.6 5.0C6.4 5.5 6.8 6.4 6.8 7.4C6.7 8.4 6.2 9.3 5.4 9.8C4.6 10.2 3.6 10.0 2.9 9.2C2.3 8.5 2.0 7.4 2.2 6.5C2.3 6.1 2.7 5.8 3.2 5.6Z" />
    {/* Outer-right toe — smaller, tilted outward */}
    <path d="M20.8 5.6C20.2 4.8 19.2 4.6 18.4 5.0C17.6 5.5 17.2 6.4 17.2 7.4C17.3 8.4 17.8 9.3 18.6 9.8C19.4 10.2 20.4 10.0 21.1 9.2C21.7 8.5 22.0 7.4 21.8 6.5C21.7 6.1 21.3 5.8 20.8 5.6Z" />
    {/* Main pad — wide organic shape, concave top, rounded base */}
    <path d="M5.0 13.8C4.6 12.2 5.2 10.8 7.0 9.8C8.4 9.1 10.0 9.2 11.2 9.8L12.0 10.2L12.8 9.8C14.0 9.2 15.6 9.1 17.0 9.8C18.8 10.8 19.4 12.2 19.0 13.8C18.4 16.0 16.4 18.6 14.4 20.2C13.4 21.0 12.6 21.4 12.0 21.6C11.4 21.4 10.6 21.0 9.6 20.2C7.6 18.6 5.6 16.0 5.0 13.8Z" />
  </svg>
);

export default PawIcon;
