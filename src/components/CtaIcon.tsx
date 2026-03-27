import ctaIconWhite from "@/assets/cta-icon-white.png";

interface CtaIconProps {
  className?: string;
  size?: number;
}

const CtaIcon = ({ className, size = 22 }: CtaIconProps) => (
  <img
    src={ctaIconWhite}
    alt=""
    width={size}
    height={size}
    className={className}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      objectFit: "contain",
    }}
  />
);

export default CtaIcon;
