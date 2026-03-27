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
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Soft circular background */}
    <circle cx="50" cy="50" r="48" fill="#EFE7DF" />

    {/* Dog silhouette (left, facing right) */}
    <g fill={color}>
      {/* Dog head */}
      <ellipse cx="34" cy="46" rx="10" ry="11" />
      {/* Dog ear (floppy) */}
      <path d="M25,38 Q20,28 24,24 Q28,22 30,30 Q31,34 28,38 Z" />
      {/* Dog snout */}
      <ellipse cx="42" cy="50" rx="5" ry="4" />
      {/* Dog body hint */}
      <ellipse cx="32" cy="60" rx="8" ry="5" />
      {/* Dog nose */}
      <circle cx="45" cy="48" r="1.5" />
    </g>

    {/* Cat silhouette (right, facing left) */}
    <g fill={color}>
      {/* Cat head */}
      <ellipse cx="66" cy="44" rx="9.5" ry="10" />
      {/* Cat ear left (pointed) */}
      <path d="M58,36 L56,22 L63,32 Z" />
      {/* Cat ear right (pointed) */}
      <path d="M72,34 L76,21 L70,31 Z" />
      {/* Cat snout */}
      <ellipse cx="59" cy="48" rx="4" ry="3" />
      {/* Cat body hint */}
      <ellipse cx="68" cy="58" rx="7.5" ry="5" />
      {/* Cat nose */}
      <circle cx="56.5" cy="46.5" r="1.2" />
    </g>

    {/* Small heart between them */}
    <path
      d="M50,52 C50,50 48,48 46.5,48 C44.5,48 44,50 44,50.5 C44,52.5 50,56 50,56 C50,56 56,52.5 56,50.5 C56,50 55.5,48 53.5,48 C52,48 50,50 50,52 Z"
      fill={color}
      opacity="0.35"
    />
  </svg>
);

export default BrandPawIcon;
