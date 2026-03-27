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
  as = "div",
}: BrandLogoProps) => {
  const { icon, text } = sizeMap[size];
  const Tag = as as keyof JSX.IntrinsicElements;

  return (
    <Tag
      className={`flex items-center gap-2 ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      {...(as === "button" ? { type: "button" as const } : {})}
    >
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
