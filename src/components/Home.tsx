import React, { useEffect, useRef } from "react";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

export default function HomeSection(
  { className, ...props }: { className?: string; [key: string]: any }
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
          color: 'pink',
          stagger: 0.05,
          ease: "none"
        });
      }
    }
  }, []);

  return (
    <div className={`${className} relative h-screen`} {...props}>
      <div className="absolute top-0 w-full h-[100vh] flex justify-center items-center text-4xl ">
        TIRED OF SEEING MISOGYNISTIC COMMENTS ONLINE?
      </div>
      
      <div 
        ref={textRef} 
        className="flex flex-col w-screen relative px-8 py-6 mt-[750px]"
      >
        <h2 className="content_title text-8xl leading-[0.8] text-center grid gap-8">
          <span className="uppercase target">LET US</span>
          <span className="uppercase target">FIGHT THIS</span>
          <span className="uppercase target mb-[100px]">TOGETHER</span>
        </h2>

        <p 
          ref={paragraphRef}
          className="max-w-[1000px] mx-auto mt-50 text-2xl leading-normal text-justify"
        >
          Online spaces are flooded with subtle and blatant misogyny-often overlooked, normalized, <br/>or dismissed.
          This project was born from the need to recognize, understand, and respond to such harmful behavior.
          Whether it&apos;s a copied comment or a screenshot, our platform uses AI to break down why a statement may be misogynistic, suggest thoughtful responses,
          and open it up for community voting. It&apos;s not just about calling out-it&apos;s about creating awareness,
          encouraging conversation, and building a collective voice
          against everyday sexism.
        </p>
      </div>
    </div>
  );
}
