import logoIcon from "@/assets/logo-icon.png";

interface PawIconProps {
  className?: string;
  size?: number;
  color?: string;
}

const PawIcon = ({
  className,
  size = 24,
}: PawIconProps) => (
  <img
    src={logoIcon}
    alt=""
    width={size}
    height={size}
    className={className}
    style={{ width: `${size}px`, height: `${size}px`, objectFit: "contain" }}
  />
);

export default PawIcon;
