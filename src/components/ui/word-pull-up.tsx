"use client";

import { motion, Variants, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface WordPullUpProps {
  words: string;
  delayMultiple?: number;
  wrapperFramerProps?: Variants;
  framerProps?: Variants;
  className?: string;
}

function WordPullUp({
  words,
  delayMultiple = 0.1,
  wrapperFramerProps = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  },
  framerProps = {
    hidden: { 
      y: 20, 
      opacity: 0 
    },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      }
    },
  },
  className,
}: WordPullUpProps) {
  const controls = useAnimation();

  useEffect(() => {
    const showVariant = wrapperFramerProps.show as any;
    const repeat = showVariant?.transition?.repeat;
    const repeatDelaySec = Number(showVariant?.transition?.repeatDelay ?? 5);

    let intervalId: number | undefined;

    const tick = async () => {
      await controls.start("hidden");
      await controls.start("show");
    };

    // Run once on mount
    controls.set("hidden");
    controls.start("show");

    if (repeat === Infinity) {
      intervalId = window.setInterval(() => {
        void tick();
      }, repeatDelaySec * 1000);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [controls, (wrapperFramerProps.show as any)?.transition?.repeat, (wrapperFramerProps.show as any)?.transition?.repeatDelay]);
  return (
    <motion.h1
      variants={wrapperFramerProps}
      initial="hidden"
      animate={controls}
      className={cn(
        "font-display text-center text-4xl font-bold leading-[5rem] tracking-[-0.02em] drop-shadow-sm",
        className,
      )}
    >
      {words.split(" ").map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={framerProps}
          style={{ 
            display: "inline-block", 
            paddingRight: "8px",
            transformOrigin: "bottom"
          }}
        >
          {word === "" ? <span>&nbsp;</span> : word}
        </motion.span>
      ))}
    </motion.h1>
  );
}

export { WordPullUp };