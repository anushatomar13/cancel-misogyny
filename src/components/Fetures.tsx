import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

const TakeActionSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const container = containerRef.current;
      const text = textRef.current;
      const arrow = arrowRef.current;

      if (section && container && text && arrow) {
        // Set initial positions
        gsap.set(container, {
          xPercent: -50,
          yPercent: -50,
          left: "50%",
          top: "50%",
          position: "absolute"
        });

        gsap.set(text, { scale: 0.8 });
        gsap.set(arrow, { rotation: 0 });

        // Create animation timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          }
        });

        // Container animation (scale and maintain center)
        tl.to(container, {
          scale: 1.5,
          xPercent: -50,
          yPercent: -50,
          ease: "power2.inOut",
        }, 0);

        // Text scaling animation
        tl.to(text, {
          scale: 1,
          ease: "power2.inOut",
        }, 0);

        // Button position adjustment
        tl.to(buttonRef.current, {
          x: 40, // Maintain gap during scale
          ease: "power2.inOut",
        }, 0);

        // Arrow rotation animation (fast)
        tl.to(arrow, {
          rotation: 360,
          ease: "power2.inOut",
        }, 0)
        .to(arrow, {}, 0.1);
      }
    }

    return () => ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="relative h-screen bg-black overflow-hidden"
    >
      <div 
        ref={containerRef}
        className="flex items-center" // Using flex gap for spacing
      >
        <div 
          ref={textRef}
          className="text-white text-6xl font-bold tracking-wider"
        >
          TAKE ACTION
        </div>
        
        <div 
          ref={buttonRef}
          className="w-16 h-16 bg-transparent border-2 border-white rounded-full flex items-center justify-center cursor-pointer"
        >
          <svg 
            ref={arrowRef}
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path 
              d="M5 12H19M19 12L12 5M19 12L12 19" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TakeActionSection;
