import BrandPawIcon from "@/components/BrandPawIcon";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  as?: "button" | "div" | "span";
}

const sizeMap = {
  sm: { icon: 28, text: "text-lg" },
  md: { icon: 34, text: "text-xl" },
  lg: { icon: 42, text: "text-2xl" },
};

const BrandLogo = ({
  size = "md",
  className = "",
  onClick,
}: BrandLogoProps) => {
  const { icon, text } = sizeMap[size];

  const inner = (
    <>
      <BrandPawIcon size={icon} color="#2C1F1A" />
      <span
        className={`font-display ${text} font-medium`}
        style={{ letterSpacing: "0.04em" }}
      >
        <span style={{ color: "#2C1F1A" }}>Vellum</span>
        <span style={{ color: "#A46B3E" }}>Pet</span>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`flex items-center gap-2 cursor-pointer ${className}`}
        onClick={onClick}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <BrandPawIcon size={icon} color="#2C1F1A" />
      <span
        className={`font-display ${text} font-medium`}
        style={{ letterSpacing: "0.04em" }}
      >
        <span style={{ color: "#2C1F1A" }}>Vellum</span>
        <span style={{ color: "#A46B3E" }}>Pet</span>
      </span>
    </Tag>
  );
};

export default BrandLogo;
