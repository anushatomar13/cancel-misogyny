import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import Lenis from '@studio-freight/lenis';

interface CommentImage {
  imageSrc: string;
  color: string;
}

interface CardProps {
  i: number;
  imageSrc: string;
  color: string;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
  zIndex: number;
}

const Card: React.FC<CardProps> = ({
  i,
  imageSrc,
  color,
  progress,
  range,
  targetScale,
  zIndex,
}) => {
  const scale = useTransform(progress, range, [1, targetScale]);
  const zIndexValue = useTransform(progress, range, [zIndex, zIndex + 1]);

  return (
    <div className="h-screen flex items-center justify-center sticky top-1 mt-100">
      <motion.div
        className={`${color} h-[400px] w-[700px] sm:w-4/5 md:w-2/3 lg:w-[400px] relative`}
        style={{
          scale,
          zIndex: zIndexValue,
          top: `calc(-10% + ${i * 30}px)`,
        }}
      >
        <img
          src={imageSrc}
          alt={`Comment Screenshot ${i + 1}`}
          className="object-contain max-h-96 w-full "
        />
      </motion.div>
    </div>
  );
};

const StackingCards: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number): void {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const comments: CommentImage[] = [
    { imageSrc: '/comments/1.jpeg', color: '' },
    { imageSrc: '/comments/2.jpeg', color: '' },
    { imageSrc: '/images/image3.jpg', color: '' },
    { imageSrc: '/images/image4.jpg', color: '' }
  ];

  return (
    <div ref={container} className="relative -mb-24">
      {comments.map((comment, i) => {
        const targetScale = 1 - (comments.length - i) * 0.05;
        return (
          <Card
            key={i}
            i={i}
            imageSrc={comment.imageSrc}
            color={comment.color}
            progress={scrollYProgress}
            range={[i * 0.25, 1]}
            targetScale={targetScale}
            zIndex={comments.length - i}
          />
        );
      })}
    </div>
  );
};

export default StackingCards;