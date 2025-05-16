import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

const TakeActionSection = (
  { className, ...props }: { className?: string; [key: string]: any }
) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const container = containerRef.current;
    const text = textRef.current;
    const arrow = arrowRef.current;

    if (section && container && text && arrow) {
      gsap.set(container, {
        xPercent: -50,
        yPercent: -50,
        left: "50%",
        top: "50%",
        position: "absolute"
      });

      gsap.set(text, { scale: 0.8 });
      gsap.set(arrow, { rotation: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        }
      });

      tl.to(container, {
        scale: 1.5,
        ease: "power2.inOut",
      }, 0)
      .to(text, { scale: 1 }, 0)
      .to(buttonRef.current, { x: 40 }, 0)
      .to(arrow, { rotation: 360 }, 0)
      .to(arrow, {}, 0.1);
    }

    return () => ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }, []);

  return (
    <div 
      ref={sectionRef}
      className={`${className} relative h-screen overflow-hidden`}
      {...props}
    >
      <div 
        ref={containerRef}
        className="flex items-center" 
      >
       <div ref={textRef} className="text-center text-white">
  <div className="text-6xl font-bold tracking-wider">TAKE ACTION</div>
  <p className="text-[14px] font-nohemi-medium mt-2 tracking-wide opacity-80">analyse comments • log comments • learn about online sexism</p>
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
