import { HTMLAttributes } from "react";
import { VelocityScroll } from "./magicui/scroll-based-velocity";

interface LFTSectionProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function LFTSection({
  className,
  ...props
}: LFTSectionProps) {
  return (
    <div
      className={`color-section min-h-screen flex items-center justify-center ${className || ""}`}
      data-bg-color="#ed52cb"
      {...props}
    >
      <VelocityScroll className="text-5xl mt-70 mb-30 font-nohemi-bold text-black text-center">
        LET&apos;S FIGHT THIS
      </VelocityScroll>
    </div>
  );
}
