"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

interface ColorChangeWrapperProps {
  children: React.ReactNode;
  sections: {
    id: string;
    color: string;
  }[];
}

const ColorChangeWrapper: React.FC<ColorChangeWrapperProps> = ({ children, sections }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      
      // Create color animations for each section
      sections.forEach(section => {
        gsap.to("body", {
          "--bg-color": section.color,
          immediateRender: false,
          scrollTrigger: {
            trigger: `#${section.id}`,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            // markers: true, // Uncomment for debugging
          }
        });
      });
    }

    return () => {
      // Clean up ScrollTrigger instances when component unmounts
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [sections]);

  return (
    <div ref={wrapperRef}>
      {children}
    </div>
  );
};

export default ColorChangeWrapper;