import logoIcon from "@/assets/logo-icon.png";
import logoIconWhite from "@/assets/logo-icon-white.png";

interface PawIconProps {
  className?: string;
  size?: number;
  color?: string;
  variant?: "dark" | "white";
}

const PawIcon = ({
  className,
  size = 24,
  variant = "dark",
}: PawIconProps) => (
  <img
    src={variant === "white" ? logoIconWhite : logoIcon}
    alt=""
    width={size}
    height={size}
    className={className}
    style={{ width: `${size}px`, height: `${size}px`, objectFit: "contain" }}
  />
);

export default PawIcon;
