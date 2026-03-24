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
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M22 32C22 25 28 20 34 22C40 24 41 31 38 36C35 41 28 41 24 38C22 36 22 34 22 32Z" />
    <path d="M38 20C38 13 45 10 50 13C55 16 55 23 52 27C49 31 42 30 39 26C38 24 38 22 38 20Z" />
    <path d="M52 20C52 13 59 10 64 13C69 16 69 23 66 27C63 31 56 30 53 26C52 24 52 22 52 20Z" />
    <path d="M66 32C66 25 72 20 78 22C84 24 85 31 82 36C79 41 72 41 68 38C66 36 66 34 66 32Z" />
    <path d="M30 58C30 48 40 44 50 44C60 44 70 48 70 58C70 70 60 80 50 80C40 80 30 70 30 58Z" />
  </svg>
);

export default BrandPawIcon;
