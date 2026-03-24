interface BrandPawIconProps {
  className?: string;
  size?: number;
  color?: string;
}

const BrandPawIcon = ({
  className,
  size = 24,
  color = "currentColor",
}: BrandPawIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 1000 1000"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Main pad */}
    <path d="M500,500 C430,500 300,580 300,700 C300,800 380,850 500,850 C620,850 700,800 700,700 C700,580 570,500 500,500 Z" />
    {/* Top-left toe */}
    <ellipse cx="250" cy="480" rx="90" ry="120" transform="rotate(-15 250 480)" />
    {/* Upper-left toe */}
    <ellipse cx="380" cy="300" rx="85" ry="115" transform="rotate(-5 380 300)" />
    {/* Upper-right toe */}
    <ellipse cx="620" cy="300" rx="85" ry="115" transform="rotate(5 620 300)" />
    {/* Top-right toe */}
    <ellipse cx="750" cy="480" rx="90" ry="120" transform="rotate(15 750 480)" />
  </svg>
);

export default BrandPawIcon;
