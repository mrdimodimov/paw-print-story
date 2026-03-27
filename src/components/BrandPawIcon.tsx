import logoIcon from "@/assets/logo-icon.png";

interface BrandPawIconProps {
  className?: string;
  size?: number;
  color?: string;
}

const BrandPawIcon = ({
  className,
  size = 24,
}: BrandPawIconProps) => (
  <img
    src={logoIcon}
    alt=""
    width={size}
    height={size}
    className={className}
    style={{ width: `${size}px`, height: `${size}px`, objectFit: "contain" }}
  />
);

export default BrandPawIcon;
