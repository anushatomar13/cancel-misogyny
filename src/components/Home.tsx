import React, { useEffect, useRef } from "react";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import Lenis, { LenisOptions } from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

export default function HomeSection() {
    const lenisRef = useRef<Lenis | null>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const paragraphRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Initialize Lenis smooth scroll
        const lenisOptions: LenisOptions = { lerp: 0.2 };
        lenisRef.current = new Lenis(lenisOptions);

        lenisRef.current.on('scroll', ScrollTrigger.update);

        const scrollFn = (time: number) => {
            lenisRef.current?.raf(time);
            requestAnimationFrame(scrollFn);
        };
        requestAnimationFrame(scrollFn);

        // Split and animate text
        if (textRef.current) {
            // Split headings and paragraph into chars
            const split = new SplitType(
                textRef.current.querySelectorAll('.target, .colorChange'),
                { types: 'chars' }
            );
            const chars = split.chars;

            if (chars) {
                chars.forEach((char) => {
                    gsap.set(char.parentNode, { perspective: 1000 });
                });

                // Animate headings (opacity, z)
                gsap.fromTo(
                    chars.filter(c => (c.parentNode as HTMLElement).classList.contains('target')),
                    {
                        willChange: 'opacity, transform',
                        opacity: 0.2,
                        z: -800
                    },
                    {
                        ease: 'back.out(1.2)',
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

        // Paragraph color change animation
        if (paragraphRef.current) {
            const paragraphSplit = new SplitType(paragraphRef.current, { types: 'chars' });
            const paragraphChars = paragraphSplit.chars;

            if (paragraphChars) {
                // Set initial state
                gsap.set(paragraphChars, { 
                    color: 'white',
                    willChange: 'color'
                });

                // Create color transition animation
                const colorAnimation = gsap.timeline({
                    scrollTrigger: {
                        trigger: paragraphRef.current,
                        start: "top 80%",
                        end: "bottom 20%",
                        scrub: true,
                        // markers: true, // Uncomment for debugging
                    }
                });

                colorAnimation.to(paragraphChars, {
                    color: 'red',
                    stagger: {
                        each: 0.05,
                        from: 'start'
                    },
                    ease: "none"
                });
            }
        }

        // Cleanup
        return () => {
            lenisRef.current?.destroy();
            lenisRef.current = null;
        };
    }, []);

    return (
        <div>
            <div className="absolute top-0 w-full h-[100vh] flex justify-center items-center text-4xl">
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
                    className="max-w-[660px] mx-[auto] mt-40 text-[1.25rem] leading-normal"
                >
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minus maiores qui corrupti, 
                    quis illum adipisci ullam nemo dicta beatae libero soluta eaque? Recusandae officia 
                    ullam quam nesciunt. Voluptatibus, dolorum quos!
                </p>
            </div>

            <div className="flex flex-col w-screen relative px-8 py-6 mb-[350px]">
                <p className="max-w-[660px] mx-[auto] my-6 text-[1.25rem] leading-normal">
                </p>
            </div>
        </div>
    )};