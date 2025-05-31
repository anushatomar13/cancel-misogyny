import React, { useEffect, useRef } from "react";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

export default function HomeSection(
  { className, ...props }: React.HTMLAttributes<HTMLDivElement>
) {

  const textRef = useRef<HTMLDivElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const split = new SplitType(
        textRef.current.querySelectorAll('.target, .colorChange'),
        { types: 'chars' }
      );
      const chars = split.chars;

      if (chars) {
        chars.forEach((char) => {
          gsap.set(char.parentNode, { perspective: 1000 });
        });

        gsap.fromTo(
          chars.filter(c => (c.parentNode as HTMLElement).classList.contains('target')),
          {
            opacity: 0.2,
            z: -800
          },
          {
            opacity: 1,
            z: 0,
            stagger: 0.04,
            scrollTrigger: {
              trigger: textRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            }
          }
        );
      }
    }

    if (paragraphRef.current) {
      const paragraphSplit = new SplitType(paragraphRef.current, { types: 'chars' });
      const paragraphChars = paragraphSplit.chars;

      if (paragraphChars) {
        gsap.set(paragraphChars, { 
          color: 'white',
          willChange: 'color'
        });

        const colorAnimation = gsap.timeline({
          scrollTrigger: {
            trigger: paragraphRef.current,
            start: "top 80%",
            end: "bottom 20%",
            scrub: true,
          }
        });

        colorAnimation.to(paragraphChars, {
          color: 'yellow',
          stagger: 0.05,
          ease: "none"
        });
      }
    }
  }, []);

  return (
    <div className={`${className} relative h-screen`} {...props}>
     
      
      <div 
        ref={textRef} 
        className="flex flex-col w-screen relative  mt-[750px] "
      >


        <p 
          ref={paragraphRef}
          className="max-w-[1000px] mx-auto mt-50 text-3xl leading-normal text-center font-nohemi-bold"
        >
          Online spaces are flooded with subtle and blatant misogyny-often <br/> overlooked, normalized, or dismissed.
          This project was born from <br/> the need to recognize, understand, and respond to such<br/> harmful behavior.
          Whether it&apos;s a copied comment or a screenshot, <br/>our platform uses AI to break down why a statement may be <br/> misogynistic, suggest thoughtful responses,
          and open it up for <br/>community voting. It&apos;s not just about calling out-it&apos;s about creating awareness,<br/>
          encouraging conversation, and building <br/>a collective voice
          against everyday sexism.
        </p>
      </div>
      
    </div>
  );
}
