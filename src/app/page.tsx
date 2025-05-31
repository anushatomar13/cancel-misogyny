"use client";
import HomeSection from "@/components/Home";
import StackingCards from "@/components/SeeSuchComments";
import ButtonGsap from "@/components/ui/gsap-button";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useScroll, motion } from "framer-motion";
import TakeActionSection from "@/components/Features";
import LFTSection from "@/components/LetsFightThis";
import { useGSAP } from "@gsap/react";
import Footer from "@/components/Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [isCardSectionVisible, setIsCardSectionVisible] = useState(false);
  const showcaseRef = useRef(null);
  const imageRef = useRef(null);        // left image
  const imageRightRef = useRef(null);   // right image
  const buttonRef = useRef(null);       // button reference
  const headingRef = useRef(null);

  const {  } = useScroll({
    target: showcaseRef,
    offset: ["start end", "start start"],
  });

  useGSAP(() => {
    // Heading animation
    gsap.fromTo(
      headingRef.current,
      {
        y: 30,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        // No delay for the heading since it should appear first
      }
    );

    // Button animation on page load
    gsap.fromTo(
      buttonRef.current,
      {
        y: 30,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.8 // Delay to let the heading render first
      }
    );

    const colorSections = document.querySelectorAll<HTMLElement>(".color-section");

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



      // Slide in from LEFT
      gsap.fromTo(
        imageRef.current,
        { x: "-100vw", opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top bottom",
            toggleActions: "play none none none"
          }
        }
      );

      // Slide in from RIGHT
      gsap.fromTo(
        imageRightRef.current,
        { x: "100vw", opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: imageRightRef.current,
            start: "top bottom",
            toggleActions: "play none none none"
          }
        }
      );
    });

  useEffect(() => {
  const sectionEl = showcaseRef.current; 

  const observer = new IntersectionObserver(
    ([entry]) => setIsCardSectionVisible(entry.isIntersecting),
    { threshold: 0.1 }
  );

  if (sectionEl) observer.observe(sectionEl);

  return () => {
    if (sectionEl) observer.unobserve(sectionEl);
  };
}, []);

    return (
      <div>
        <div className="absolute top-0 w-full h-[100vh] flex flex-col justify-center items-center mt-15">

          {/* Left Image */}
          <div className="absolute" style={{ left: "11%", transform: "translateX(-50%)" }}>
            <div
              ref={imageRef}
              className="relative mb-6"
              style={{
                height: "100vh",
                width: "350px",
              }}
            >
              <Image
                src="/images/women.png"
                alt="Women empowerment"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Right Image */}
          <div className="absolute" style={{ right: "11%", transform: "translateX(50%)" }}>
            <div
              ref={imageRightRef}
              className="relative mb-6"
              style={{
                height: "100vh",
                width: "350px",
              }}
            >
              <Image
                src="/images/women-l.png"
                alt="Women empowerment right"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Main Heading - Centered Properly */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center">
            <h1 ref={headingRef} className="font-nohemi-bold font-semibold text-[#d17199] leading-snug mb-10" style={{ opacity: 0 }}>
              <span className="-ml-50">TIRED OF <br /></span>
              SEEING MISOGYNISTIC<br />
              COMMENTS ONLINE?
            </h1>
            <div ref={buttonRef} style={{ opacity: 0 }}>
              <Link href="/pages/analyze">
                <ButtonGsap label="Explore Now" />
              </Link>
            </div>
          </div>
        </div>

        <HomeSection
          className="color-section"
          data-bg-color="#500073"
        />

        <LFTSection />
        <div
          ref={showcaseRef}
          className="color-section flex flex-row items-center justify-center gap-x-150"
          data-bg-color="#9a0001"
        >
          <StackingCards />

          {isCardSectionVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-center"
            >
              <h1 className="font-bold text-[#00246b] leading-snug mt-120" style={{ fontSize: "50px" }}>
                <br />SEE SUCH <br />COMMENTS <br />ONLINE?
              </h1>
            </motion.div>
          )}

          <StackingCards />
        </div>

        <TakeActionSection
          className="color-section"
          data-bg-color="#8E1616"
        />
        <Footer />
      </div>
    );
  }