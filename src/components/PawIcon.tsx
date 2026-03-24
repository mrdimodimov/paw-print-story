import { cn } from "@/lib/utils";

interface PawIconProps {
  className?: string;
  size?: number;
  color?: string;
}

/**
 * Solid-filled paw icon traced from brand reference.
 * Faithful reproduction of the leather-embossed paw silhouette.
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
    {/* Inner left toe */}
    <ellipse cx="8.2" cy="3.8" rx="2.3" ry="2.9" transform="rotate(-5 8.2 3.8)" />
    {/* Inner right toe */}
    <ellipse cx="15.8" cy="3.8" rx="2.3" ry="2.9" transform="rotate(5 15.8 3.8)" />
    {/* Outer left toe */}
    <ellipse cx="4.2" cy="7.6" rx="1.9" ry="2.5" transform="rotate(-18 4.2 7.6)" />
    {/* Outer right toe */}
    <ellipse cx="19.8" cy="7.6" rx="1.9" ry="2.5" transform="rotate(18 19.8 7.6)" />
    {/* Main pad — wide bean/heart shape with concave top */}
    <path d="M4.8 14.2 C4.2 12.4 5.4 10.6 7.6 9.8 C9.2 9.2 10.8 9.6 12 10.4 C13.2 9.6 14.8 9.2 16.4 9.8 C18.6 10.6 19.8 12.4 19.2 14.2 C18.4 16.6 16.0 19.4 14.0 20.8 C12.8 21.6 11.2 21.6 10.0 20.8 C8.0 19.4 5.6 16.6 4.8 14.2Z" />
  </svg>
);

export default PawIcon;
