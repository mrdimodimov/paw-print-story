import logoFull from "@/assets/logo-full.png";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  sm: { height: 28 },
  md: { height: 36 },
  lg: { height: 46 },
};

const BrandLogo = ({
  size = "md",
  className = "",
  onClick,
}: BrandLogoProps) => {
  const { height } = sizeMap[size];

  const img = (
    <img
      src={logoFull}
      alt="VellumPet"
      style={{ height: `${height}px`, width: "auto" }}
      className="block"
    />
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`flex items-center cursor-pointer ${className}`}
        onClick={onClick}
      >
        {img}
      </button>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {img}
    </div>
  );
};

export default BrandLogo;
