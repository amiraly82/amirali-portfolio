"use client";

import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";

// Your images live here. Swap these out or pass your own via the `cards` prop.
const defaultCards = [
  {
    id: "solaris",
    img: "/assets/projects/solaris_1.jpg",
    title: "سولاریس — عصاره‌های گیاهی و کیمیاگری",
    category: "هویت بصری / طراحی بسته‌بندی",
    year: "۱۴۰۴ (2026)",
    count: "۳ اثر بصری 🖼"
  },
  {
    id: "ironclad",
    img: "/assets/projects/ironclad_1.jpg",
    title: "تک‌نگاری آستورا — فصلنامه تخصصی تایپوگرافی",
    category: "طراحی نشر / کارگردانی هنری",
    year: "۱۴۰۳ (2025)",
    count: "۲ اثر بصری 🖼"
  },
  {
    id: "kinetics",
    img: "/assets/projects/kinetics_1.jpg",
    title: "پاویون دیجیتال کینتیکس",
    category: "تجسم سه‌بعدی / استیج موشن",
    year: "۱۴۰۳ (2025)",
    count: "۲ اثر بصری 🖼"
  },
  {
    id: "elysium",
    img: "/assets/projects/elysium_1.jpg",
    title: "الیسیوم — ساعت‌سازی اشرافی سوئیس",
    category: "هویت برند / هدایت خلاقیت",
    year: "۱۴۰۲ (2024)",
    count: "۳ اثر بصری 🖼"
  },
  {
    id: "mythos",
    img: "/assets/projects/mythos_1.jpg",
    title: "روایت شوالیه — کی‌ویژوال و فتومونتاژ",
    category: "آرت دیجیتال و فتومونتاژ",
    year: "۱۴۰۳ (2025)",
    count: "۲ اثر بصری 🖼"
  },
  {
    id: "aura",
    img: "/assets/projects/aura_1.jpg",
    title: "اورا سلستیال — عطرسازی لوکس و بطری سه‌بعدی",
    category: "بسته‌بندی سه‌بعدی / عطرسازی لوکس",
    year: "۱۴۰۲ (2024)",
    count: "۲ اثر بصری 🖼"
  }
];

// Change how the stack looks and feels here — no need to touch the logic below.
const defaultSettings = {
  width: 360, // card width in px (this is the desktop/base size)
  height: 520, // card height in px (this is the desktop/base size)
  radius: 20, // corner roundness in px
  swipeThreshold: 120, // how far someone has to drag before the card flies off
  stackRotation: 4.5, // degrees each card behind the front one tilts
  stackScale: 0.035, // how much smaller each card behind the front one gets
  tiltStrength: 25, // how far the card tilts while dragging (3D effect)
  springStiffness: 300, // how snappy the drag/return animation feels
  springDamping: 30, // how quickly the bounce settles
  // Below this viewport width, cards shrink by mobileScale. Tweak either value
  // to control how small (or whether) the stack shrinks on phones.
  mobileBreakpoint: 480,
  mobileScale: 0.85,
};

export type SwipeCardsSettings = typeof defaultSettings;

export interface SwipeCardItem {
  id: number | string;
  img: string;
  title?: string;
  category?: string;
  year?: string;
  count?: string;
}

interface SwipeCardProps {
  children: React.ReactNode;
  isFront: boolean;
  zIndex: number;
  onSendToBack: () => void;
  settings: SwipeCardsSettings;
}

function SwipeCard({
  children,
  isFront,
  zIndex,
  onSendToBack,
  settings,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // These turn your drag distance into a 3D tilt. Bigger tiltStrength = more dramatic tilt.
  const rotateX = useTransform(
    y,
    [-200, 200],
    [settings.tiltStrength, -settings.tiltStrength],
  );
  const rotateY = useTransform(
    x,
    [-200, 200],
    [-settings.tiltStrength, settings.tiltStrength],
  );

  function handleDragEnd(
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) {
    const draggedFarEnough =
      Math.abs(info.offset.x) > settings.swipeThreshold ||
      Math.abs(info.offset.y) > settings.swipeThreshold;

    if (draggedFarEnough) {
      onSendToBack();
    } else {
      // Didn't drag far enough — snap back to center.
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="absolute cursor-grab select-none active:cursor-grabbing"
      style={{
        width: settings.width,
        height: settings.height,
        x: isFront ? x : 0,
        y: isFront ? y : 0,
        rotateX: isFront ? rotateX : 0,
        rotateY: isFront ? rotateY : 0,
        zIndex,
      }}
      drag={isFront}
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.5}
      onDragEnd={handleDragEnd}
      whileHover={isFront ? { scale: 1.02 } : {}}
      transition={{
        type: "spring",
        stiffness: settings.springStiffness,
        damping: settings.springDamping,
      }}
    >
      {children}
    </motion.div>
  );
}

interface SwipeCardsProps {
  cards?: SwipeCardItem[];
  // Override any of the defaults above without touching this file again.
  settings?: Partial<SwipeCardsSettings>;
  className?: string;
}

// Shrinks the stack a bit on small screens so it doesn't feel oversized on mobile.
// Returns 1 on the server / before mount to avoid a layout jump on first paint.
function useResponsiveScale(breakpoint: number, mobileScale: number) {
  const [scale, setScale] = useState(1);

  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setScale(mq.matches ? mobileScale : 1);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint, mobileScale]);

  return scale;
}

export function SwipeCards({
  cards = defaultCards,
  settings,
  className = "",
}: SwipeCardsProps) {
  const baseConfig = { ...defaultSettings, ...settings };
  const scale = useResponsiveScale(
    baseConfig.mobileBreakpoint,
    baseConfig.mobileScale,
  );
  const config = {
    ...baseConfig,
    width: Math.round(baseConfig.width * scale),
    height: Math.round(baseConfig.height * scale),
  };
  const [cardList, setCardList] = useState(cards);

  // Sends the front card to the back of the pile after a swipe.
  const moveToBack = (id: number | string) => {
    setCardList((prev) => {
      const updated = [...prev];
      const cardIndex = updated.findIndex((card) => card.id === id);
      if (cardIndex !== -1) {
        const [movedCard] = updated.splice(cardIndex, 1);
        updated.push(movedCard);
      }
      return updated;
    });
  };

  return (
    <div
      className={`flex items-center justify-center p-6 select-none ${className}`}
    >
      <div
        className="relative mx-auto"
        style={{
          width: config.width,
          height: config.height,
          perspective: 1200,
        }}
      >
        {cardList.map((card, index) => {
          const isFront = index === 0;
          const zIndex = cardList.length - index;

          return (
            <SwipeCard
              key={card.id}
              isFront={isFront}
              zIndex={zIndex}
              settings={config}
              onSendToBack={() => moveToBack(card.id)}
            >
              <motion.div
                className="relative h-full w-full overflow-hidden bg-white shadow-2xl border border-neutral-200/80 flex flex-col"
                style={{ borderRadius: config.radius }}
                animate={{
                  rotateZ: index * config.stackRotation,
                  scale: 1 - index * config.stackScale,
                  transformOrigin: "85% 85%",
                }}
                initial={false}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              >
                <div className="relative w-full h-[58%] overflow-hidden bg-neutral-900">
                  <Image
                    src={card.img}
                    alt={card.title || `card-${card.id}`}
                    fill
                    className="pointer-events-none object-cover"
                    sizes={`${config.width}px`}
                    priority={isFront}
                  />
                  {card.count && (
                    <div className="absolute bottom-2.5 right-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
                      {card.count}
                    </div>
                  )}
                </div>
                <div className="flex-1 p-5 flex flex-col justify-between text-right">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-semibold mb-1">
                      <span>{card.year}</span>
                      <span>{card.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 leading-tight">
                      {card.title}
                    </h3>
                  </div>
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-emerald-900 font-bold text-xs flex items-center gap-1">
                      مشاهده پروژه ↗
                    </span>
                  </div>
                </div>
              </motion.div>
            </SwipeCard>
          );
        })}
      </div>
    </div>
  );
}

export default SwipeCards;
