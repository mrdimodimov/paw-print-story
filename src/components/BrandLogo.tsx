import logoIcon from "@/assets/logo-icon.png";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  sm: { icon: 36, fontSize: "1.25rem", gap: 10 },
  md: { icon: 44, fontSize: "1.5rem", gap: 12 },
  lg: { icon: 56, fontSize: "1.875rem", gap: 14 },
};

const BrandLogo = ({
  size = "md",
  className = "",
  onClick,
}: BrandLogoProps) => {
  const { icon, fontSize, gap } = sizeMap[size];

  const content = (
    <div className="flex items-center" style={{ gap: `${gap}px` }}>
      <img
        src={logoIcon}
        alt=""
        style={{ height: `${icon}px`, width: "auto" }}
        className="block"
      />
      <span
        className="font-display font-bold leading-none"
        style={{ fontSize }}
      >
        <span style={{ color: "#2C1A14" }}>Vellum</span>
        <span style={{ color: "#B07A3F" }}>Pet</span>
      </span>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`flex items-center cursor-pointer ${className}`}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {content}
    </div>
  );
};

export default BrandLogo;
