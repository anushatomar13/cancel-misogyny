"use client";
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

const CancelMisogynyHomepage = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-black text-white"
      onMouseMove={handleMouseMove}
      style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      {/* Static dot grid background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23666666' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Interactive hover effect */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a855f7' fill-opacity='0.6'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          maskImage: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 70%)`,
          WebkitMaskImage: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 70%)`,
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle background gradients */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-10"
        style={{
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600 rounded-full blur-3xl opacity-10"
        style={{
          animation: 'float 10s ease-in-out infinite reverse',
          animationDelay: '2s',
        }}
      />

      {/* Main content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Main Title */}
        <h1
          className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-8 select-none cursor-pointer transition-all duration-300 ease-out"
          style={{
            color: '#ffffff',
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.9), 0 0 20px rgba(168, 85, 247, 0.4)',
            letterSpacing: '-0.02em',
            animation: 'fadeInUp 1s ease-out 0.2s both',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLHeadingElement>) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.color = '#a855f7';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLHeadingElement>) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.color = '#ffffff';
          }}
        >
          Cancel Misogyny
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-4xl leading-relaxed mb-12 font-medium"
          style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
            animation: 'fadeInUp 1s ease-out 0.6s both',
          }}
        >
          Empowering voices, challenging narratives, and building a more equitable future for all
        </p>

        {/* Action buttons */}
        <div
          className="flex flex-col sm:flex-row gap-6 mb-20"
          style={{ animation: 'fadeInUp 1s ease-out 1s both' }}
        >
          <Link href="/pages/analyze">
          <button
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            style={{
              boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(168, 85, 247, 0.5)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(168, 85, 247, 0.3)';
            }}
          >
            Get Started
          </button>
          </Link>

<Link href="/pages/logbook">
          <button
            className="px-8 py-4 bg-transparent border-2 border-gray-600 hover:border-purple-400 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.borderColor = '#a855f7';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.3)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.borderColor = '#6b7280';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            See Logged Comments
          </button>
          </Link>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl"
          style={{ animation: 'fadeInUp 1s ease-out 1.4s both' }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">10K+</div>
            <div className="text-gray-400">Voices Empowered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">500+</div>
            <div className="text-gray-400">Communities Reached</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
            <div className="text-gray-400">Support Available</div>
          </div>
        </div>
        
      </div>
                    <Footer/>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-30" />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-purple-400 opacity-30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-purple-400 opacity-30" />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(1deg);
          }
          66% {
            transform: translateY(10px) rotate(-1deg);
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CancelMisogynyHomepage;
