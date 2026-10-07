"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface RevealTextProps {
  text?: string;
  textColor?: string;
  overlayColor?: string;
  fontSize?: string;
  letterDelay?: number;
  overlayDelay?: number;
  overlayDuration?: number;
  springDuration?: number;
  letterImages?: string[];
  onClick?: () => void;
}

export function RevealText({
  text = "ENTER",
  textColor = "text-white",
  overlayColor = "text-amber-400",
  fontSize = "text-[clamp(4rem,10vw,10rem)]",
  letterDelay = 0.08,
  overlayDelay = 0.05,
  overlayDuration = 0.4,
  springDuration = 600,
  letterImages = [
    "/ورود/۰۷.png",
    "/ورود/Camera_push_in_on_sword_20260915183317.jpeg",
    "/ورود/Character_looking_at_camera_2K_20260915172812.jpeg",
    "/ورود/ChatGPT Image Sep 15, 2026, 05_54_02 PM.png",
    "/ورود/Warrior_holding_sword_in_guard_20260915182713.jpeg"
  ],
  onClick,
}: RevealTextProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showOverlayText, setShowOverlayText] = useState(false);

  useEffect(() => {
    const lastLetterDelay = (text.length - 1) * letterDelay;
    const totalDelay = lastLetterDelay * 1000 + springDuration;

    const timer = setTimeout(() => {
      setShowOverlayText(true);
    }, totalDelay);

    return () => clearTimeout(timer);
  }, [text.length, letterDelay, springDuration]);

  return (
    <div className="flex items-center justify-center relative select-none">
      <div className="flex cursor-pointer" onClick={onClick}>
        {text.split("").map((letter, index) => (
          <motion.span
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`${fontSize} font-black tracking-tight cursor-pointer relative overflow-hidden inline-block`}
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              delay: index * letterDelay,
              type: "spring",
              damping: 8,
              stiffness: 200,
              mass: 0.8,
            }}
          >
            {/* Base text layer */}
            <motion.span
              className={`absolute inset-0 ${textColor}`}
              animate={{
                opacity: hoveredIndex === index ? 0 : 1,
              }}
              transition={{ duration: 0.1 }}
            >
              {letter}
            </motion.span>

            {/* Image text layer with background panning */}
            <motion.span
              className="text-transparent bg-clip-text bg-cover bg-no-repeat"
              animate={{
                opacity: hoveredIndex === index ? 1 : 0,
                backgroundPosition:
                  hoveredIndex === index ? "20% center" : "0% center",
              }}
              transition={{
                opacity: { duration: 0.15 },
                backgroundPosition: {
                  duration: 2.5,
                  ease: "easeInOut",
                },
              }}
              style={{
                backgroundImage: `url('${letterImages[index % letterImages.length]}')`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {letter}
            </motion.span>

            {/* Overlay text layer that sweeps across each letter */}
            {showOverlayText && (
              <motion.span
                className={`absolute inset-0 ${overlayColor} pointer-events-none`}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  delay: index * overlayDelay,
                  duration: overlayDuration,
                  times: [0, 0.1, 0.7, 1],
                  ease: "easeInOut",
                }}
              >
                {letter}
              </motion.span>
            )}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
