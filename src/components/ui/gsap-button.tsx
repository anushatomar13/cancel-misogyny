'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const ButtonGsap = ({ label = "Get GSAP", onClick }: { label?: string; onClick?: () => void }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const flairRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const flair = flairRef.current;
    if (!button || !flair) return;

    const xSet = gsap.quickSetter(flair, "xPercent");
    const ySet = gsap.quickSetter(flair, "yPercent");

    const getXY = (e: MouseEvent) => {
      const { left, top, width, height } = button.getBoundingClientRect();

      const xTransformer = gsap.utils.pipe(
        gsap.utils.mapRange(0, width, 0, 100),
        gsap.utils.clamp(0, 100)
      );

      const yTransformer = gsap.utils.pipe(
        gsap.utils.mapRange(0, height, 0, 100),
        gsap.utils.clamp(0, 100)
      );

      return {
        x: xTransformer(e.clientX - left),
        y: yTransformer(e.clientY - top)
      };
    };

    const handleEnter = (e: MouseEvent) => {
      const { x, y } = getXY(e);
      xSet(x);
      ySet(y);

      gsap.to(flair, {
        scale: 1,
        duration: 0.4,
        ease: "power2.out"
      });
    };

    const handleLeave = (e: MouseEvent) => {
      const { x, y } = getXY(e);
      gsap.killTweensOf(flair);

      gsap.to(flair, {
        xPercent: x > 90 ? x + 20 : x < 10 ? x - 20 : x,
        yPercent: y > 90 ? y + 20 : y < 10 ? y - 20 : y,
        scale: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const handleMove = (e: MouseEvent) => {
      const { x, y } = getXY(e);

      gsap.to(flair, {
        xPercent: x,
        yPercent: y,
        duration: 0.4,
        ease: "power2"
      });
    };

    button.addEventListener("mouseenter", handleEnter);
    button.addEventListener("mouseleave", handleLeave);
    button.addEventListener("mousemove", handleMove);

    return () => {
      button.removeEventListener("mouseenter", handleEnter);
      button.removeEventListener("mouseleave", handleLeave);
      button.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className="relative inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white border border-[#7a2048]  border-2 rounded-[15px] overflow-hidden cursor-pointer group transition-colors duration-200"
      style={{
        background: 'transparent',
        fontSize: '1.2rem',
        lineHeight: '1.04545',
        letterSpacing: '-0.01em'
      }}
    >
      <span
        ref={flairRef}
        className="absolute inset-0 pointer-events-none scale-0 origin-top-left will-change-transform"
        style={{
          transform: 'scale(0)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            content: '""',
            display: 'block',
            backgroundColor: 'black',
            borderRadius: '50%',
            width: '170%',
            aspectRatio: '1 / 1',
            top: '0',
            left: '0',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
        ></span>
      </span>
      <span className="relative z-10">{label}</span>
    </button>
  );
};

export default ButtonGsap;
