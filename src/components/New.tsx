"use client";
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { useEffect, useRef } from 'react';

// TypeScript interfaces
interface ItemData {
  element: HTMLElement;
  column: number;
  wrapper: HTMLElement;
  image: HTMLElement | null;
}

export default function SeeACommentSection(): JSX.Element {
  // Create a ref to store the Lenis instance
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const grid = document.querySelector('.columns') as HTMLElement;
    if (!grid) return;
    
    const columns = Array.from(grid.querySelectorAll('.column')) as HTMLElement[];

    // Fix: corrected the variable name from 'columns' to 'column'
    const items: ItemData[][] = columns.map((column, pos) => {
      return Array.from(column.querySelectorAll('.col-item')).map((item) => ({
        element: item as HTMLElement,
        column: pos,
        wrapper: item.querySelector('.img-wrap') as HTMLElement,
        image: item.querySelector('.img') as HTMLElement | null,
      }));
    });

    const mergedItems: ItemData[] = items.flat();

    const SmoothScroll = (): void => {
      // Initialize Lenis
      lenisRef.current = new Lenis({
        lerp: 0.15,
        smoothWheel: true,
      });
      
      // Connect Lenis to ScrollTrigger
      lenisRef.current.on('scroll', ScrollTrigger.update);

      const scrollFn = (time: number): void => {
        if (lenisRef.current) {
          lenisRef.current.raf(time);
        }
        requestAnimationFrame(scrollFn);
      };
      
      requestAnimationFrame(scrollFn);
    };

    const ScrollAni = (): void => {
      mergedItems.forEach((item) => {
        let xPercentValue: number,
        scaleXvalue: number, 
        scaleYvalue: number, 
        transformOrigin: string,
        filterValue: string;

        switch(item.column) {
          case 0:
            xPercentValue = -400;
            transformOrigin = '0% 50%';
            scaleXvalue = 6;
            scaleYvalue = 0.3;
            filterValue = 'blur(10px)';
            break;
          case 1:
            xPercentValue = 0;
            transformOrigin = '50% 50%';
            scaleXvalue = 0.7;
            scaleYvalue = 0.7;
            filterValue = 'blur(5px)';
            break;
          case 2:
            xPercentValue = 400;
            transformOrigin = '100% 50%';
            scaleXvalue = 6;
            scaleYvalue = 0.3;
            filterValue = 'blur(10px)';
            break;
          default:
            // Default values in case none of the cases match
            xPercentValue = 0;
            transformOrigin = '50% 50%';
            scaleXvalue = 1;
            scaleYvalue = 1;
            filterValue = 'blur(0px)';
        }

        gsap.fromTo(item.wrapper, {
          willChange: 'filter',
          xPercent: xPercentValue,
          opacity: 0,
          scaleX: scaleXvalue,
          scaleY: scaleYvalue,
          filter: filterValue,
        }, {
          startAt: { transformOrigin },
          scrollTrigger: {
            trigger: item.element, 
            start: 'clamp(top bottom)',
            end: 'clamp(bottom top)',
            scrub: true,
          },
          xPercent: 0,
          opacity: 1,
          scaleX: 1,
          scaleY: 1,
          filter: 'blur(0px)'
        });
      });
    };

    SmoothScroll();
    ScrollAni();

    // Cleanup function
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="overflow-x-hidden">
      <div className="absolute h-[100vh] w-full flex justify-center items-center text-white z-10">
        SCROLL DOWN
      </div>
      <div className="grid place-items-center w-[100%] relative">
        <div className="columns max-w-[1200px] w-full relative px-[0] grid place-items-center grid-cols-[repeat(3,_1fr)] gap-[2vw] mt-[500px]">
          <div className="column w-full relative grid gap-[2vw] grid-cols-[100%]">
            <div className="col-item m-0 relative z-1">
              <div className="img-wrap w-full h-auto relative">
                <Image src="/test.png" width={1000} height={3000} alt='testing' />
              </div>
            </div>
            <div className="col-item m-0 relative z-1">
              <div className="img-wrap w-full [aspect-ratio:0.6] h-auto relative overflow-hidden rounded-none">
                <Image src="/test.png" width={1000} height={3000} alt='testing' />
              </div>
            </div>
            <div className="col-item m-0 relative z-1">
              <div className="img-wrap w-full [aspect-ratio:0.6] h-auto relative overflow-hidden rounded-none">
                <Image src="/test.png" width={1000} height={3000} alt='testing' />
              </div>
            </div>
          </div>
          <div className="column w-full relative grid gap-[2vw] grid-cols-[100%]">
            <div className="col-item m-0 relative z-1">
              <div className="img-wrap w-full h-auto relative">
                <Image src="/test.png" width={1000} height={3000} alt='testing' />
              </div>
            </div>
            <div className="col-item m-0 relative z-1">
              <div className="img-wrap w-full [aspect-ratio:0.6] h-auto relative overflow-hidden rounded-none">
                <Image src="/test.png" width={1000} height={3000} alt='testing' />
              </div>
            </div>
            <div className="col-item m-0 relative z-1">
              <div className="img-wrap w-full [aspect-ratio:0.6] h-auto relative overflow-hidden rounded-none">
                <Image src="/test.png" width={1000} height={3000} alt='testing' />
              </div>
            </div>
          </div>
          <div className="column w-full relative grid gap-[2vw] grid-cols-[100%]">
            <div className="col-item m-0 relative z-1">
              <div className="img-wrap w-full h-auto relative">
                <Image src="/test.png" width={1000} height={3000} alt='testing' />
              </div>
            </div>
            <div className="col-item m-0 relative z-1">
              <div className="img-wrap w-full [aspect-ratio:0.6] h-auto relative overflow-hidden rounded-none">
                <Image src="/test.png" width={1000} height={3000} alt='testing' />
              </div>
            </div>
            <div className="col-item m-0 relative z-1">
              <div className="img-wrap w-full [aspect-ratio:0.6] h-auto relative overflow-hidden rounded-none">
                <Image src="/test.png" width={1000} height={3000} alt='testing' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}