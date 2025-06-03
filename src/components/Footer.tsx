"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const footerLinks = [
  { name: "Analyze", href: "/pages/analyze" },
  { name: "Log a Comment", href: "/pages/log-comment" },
  { name: "Logbook", href: "/pages/logbook" },
  { name: "Learn", href: "/pages/learn" },
];

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const copyrightRef = useRef<HTMLParagraphElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  const titleEl = titleRef.current;
  const linksEl = linksRef.current;

  if (!footerRef.current || !titleEl || !linksEl || !copyrightRef.current)
    return;

  const ctx = gsap.context(() => {
    // Use narrowed variables
    const titleText = titleEl.textContent || '';
    titleEl.innerHTML = titleText.split('').map(char =>
      char === ' ' ? '<span>&nbsp;</span>' : `<span class="char">${char}</span>`
    ).join('');

    
  }, footerRef);

  return () => {
    ctx.revert();
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  };
}, []);


  return (
    <footer
      ref={footerRef}
      className="relative bg-gradient-to-b from-gray-900 via-black to-gray-900 text-gray-300 py-20 px-8 sm:px-16 border-t-2 border-purple-500/30 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 3px 3px, rgba(168, 85, 247, 0.4) 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Floating Particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none"></div>

      {/* Animated Glow */}
      <div
        ref={glowRef}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600 rounded-full opacity-15 filter blur-3xl pointer-events-none"
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Main Content Container */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-12 mb-16">
          {/* Title Section */}
          <div className="text-center lg:text-left">
            <div
              ref={titleRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white cursor-pointer select-none mb-4"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textShadow: '0 0 15px rgba(168, 85, 247, 0.5), 0 0 30px rgba(168, 85, 247, 0.3)'
              }}
            >
              Cancel Misogyny
            </div>
            <p className="text-lg sm:text-xl text-gray-400 max-w-md">
              Building a more equitable future through awareness and action
            </p>
          </div>

          {/* Navigation Links */}
          <div ref={linksRef} className="flex flex-wrap justify-center gap-8 text-base sm:text-lg">
            {footerLinks.map((link, idx) => (
              <div key={idx} className="link-item">
                <Link
                  href={link.href}
                  className="relative transition-all duration-300 hover:text-purple-400 cursor-pointer px-4 py-2 rounded-lg font-medium text-gray-200"
                >
                  {link.name}
                  <div className="absolute inset-0 bg-purple-600 opacity-0 rounded-lg blur-sm transition-opacity duration-300 hover:opacity-25"></div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-center md:text-left">
          <div>
            <h4 className="text-xl font-semibold text-white mb-3">Mission</h4>
            <p className="text-gray-400 leading-relaxed">
              Challenging harmful narratives and promoting gender equality through education and community engagement.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white mb-3">Vision</h4>
            <p className="text-gray-400 leading-relaxed">
              A world where every voice is valued and respected, free from discrimination and prejudice.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white mb-3">Impact</h4>
            <p className="text-gray-400 leading-relaxed">
              Creating lasting change through awareness, advocacy, and meaningful conversations.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8">
          <p
            ref={copyrightRef}
            className="text-center text-base sm:text-lg text-gray-500"
          >
            © {new Date().getFullYear()} Cancel Misogyny. All rights reserved. | Together for equality.
          </p>
        </div>
      </div>

      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60"></div>

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-br-full"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-tl-full"></div>
    </footer>
  );
};

export default Footer;
