import { motion } from "framer-motion";
import Link from "next/link";

export default function FeaturesSection() {
  const headerText = "HOW DOES IT WORK?";
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };
  
  const characterVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };
  
  const linkContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 1 
      }
    }
  };
  
  const linkItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100
      }
    }
  };
  
  return (
    <div className="p-8 bg-white rounded-lg shadow-sm">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-3xl font-bold text-gray-800 overflow-hidden"
      >
        {headerText.split("").map((char, index) => (
          <motion.span
            key={index}
            variants={characterVariants}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.div>
      
      <motion.div 
        variants={linkContainerVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 flex gap-4 text-indigo-600 text-sm"
      >
        <motion.div variants={linkItemVariants}>
          <Link href="/about" className="underline hover:text-indigo-800 transition-colors">About</Link>
        </motion.div>
        <motion.div variants={linkItemVariants}>
          <Link href="/log-comment" className="underline hover:text-indigo-800 transition-colors">Log Comment</Link>
        </motion.div>
        <motion.div variants={linkItemVariants}>
          <Link href="/logbook" className="underline hover:text-indigo-800 transition-colors">Logbook</Link>
        </motion.div>
        <motion.div variants={linkItemVariants}>
          <Link href="/learn" className="underline hover:text-indigo-800 transition-colors">Learn</Link>
        </motion.div>
      </motion.div>
    </div>
  );
}