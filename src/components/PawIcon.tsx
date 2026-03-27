import logoIcon from "@/assets/logo-icon.png";

interface PawIconProps {
  className?: string;
  size?: number;
  color?: string;
  variant?: "dark" | "white";
}

const PawIcon = ({
  className,
  size = 22,
  variant = "dark",
}: PawIconProps) => (
  <img
    src={logoIcon}
    alt=""
    width={size}
    height={size}
    className={className}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      objectFit: "contain",
      filter: variant === "white" ? "brightness(0) invert(1)" : "none",
    }}
  />
);

export default PawIcon;
