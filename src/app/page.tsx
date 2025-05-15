"use client";
import HomeSection from "@/components/Home";
import StackingCards from "@/components/New";
import { useRef, useState, useEffect } from "react";
import { useScroll, motion } from "framer-motion";
import TakeActionSection from "@/components/Features";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [isCardSectionVisible, setIsCardSectionVisible] = useState(false);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: showcaseRef,
    offset: ["start end", "start start"],
  });

  // Color transition logic
  useGSAP(() => {
    const colorSections = gsap.utils.toArray<HTMLElement>(".color-section");
    
    colorSections.forEach((section) => {
      const color = section.dataset.bgColor || "#2A004E";
      
      gsap.to("html", {
        "--bg-color": color,
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: "top center",
          end: "bottom center",
          scrub: 1.5,
        }
      });
    });
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsCardSectionVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    
    if (showcaseRef.current) observer.observe(showcaseRef.current);
    
    return () => {
      if (showcaseRef.current) observer.unobserve(showcaseRef.current);
    };
  }, []);

  return (
    <div>
      <HomeSection 
        className="color-section" 
        data-bg-color="#500073" 
      />
      
      <div 
        ref={showcaseRef} 
        className="color-section flex flex-row items-center justify-center gap-x-200"
        data-bg-color="#C62300"
      >
        <StackingCards />
        
        {isCardSectionVisible && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-center"
          >
            <h1 className="text-4xl font-bold text-white leading-snug mt-60">
              <br/>SEE SUCH <br/>COMMENTS <br/>ONLINE?
            </h1>
          </motion.div>
        )}
        
        <StackingCards />
      </div>

      <TakeActionSection 
        className="color-section" 
        data-bg-color="#8E1616" 
      />
    </div>
  );
}
