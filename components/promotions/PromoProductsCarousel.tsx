"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromoProductCard } from "@/lib/promotions";
import { PromoOfferCard } from "@/components/promotions/PromoOfferCard";

type PromoProductsCarouselProps = {
  items: PromoProductCard[];
  className?: string;
};

type ProductCarouselSlideProps = {
  item: PromoProductCard;
  index: number;
  isActive: boolean;
  offset: number;
  onSelect: () => void;
};

function ProductCarouselSlide({
  item,
  index,
  isActive,
  offset,
  onSelect,
}: ProductCarouselSlideProps) {
  const isSide = Math.abs(offset) === 1;
  const isHidden = Math.abs(offset) > 1;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      layout
      animate={{
        scale: isActive ? 1 : isSide ? 0.86 : 0.72,
        opacity: isActive ? 1 : isSide ? 0.72 : isHidden ? 0 : 0.45,
        y: isActive ? 0 : 18,
        filter: isActive ? "blur(0px)" : "blur(0.4px)",
      }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className={cn(
        "relative flex-shrink-0 cursor-pointer border-0 bg-transparent p-0 text-left outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#1f4d3f]/30 focus-visible:ring-offset-4",
        isHidden && "pointer-events-none"
      )}
      style={{
        width: isActive ? 300 : 252,
        zIndex: isActive ? 20 : 10 - Math.abs(offset),
      }}
      aria-current={isActive ? "true" : undefined}
    >
      <div className="w-full">
        <PromoOfferCard item={item} index={index} disableEntrance dimmed={!isActive} />
      </div>
    </motion.button>
  );
}

export function PromoProductsCarousel({ items, className }: PromoProductsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const count = items.length;

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) {
        return;
      }
      const normalized = ((index % count) + count) % count;
      setActiveIndex(normalized);
    },
    [count]
  );

  useEffect(() => {
    if (activeIndex >= count && count > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, count]);

  const slideOffsets = useMemo(() => {
    if (count <= 1) {
      return [0];
    }

    return items.map((_, index) => {
      let offset = index - activeIndex;
      if (offset > count / 2) {
        offset -= count;
      }
      if (offset < -count / 2) {
        offset += count;
      }
      return offset;
    });
  }, [activeIndex, count, items]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -60) {
      goTo(activeIndex + 1);
    } else if (info.offset.x > 60) {
      goTo(activeIndex - 1);
    }
  }

  if (count === 0) {
    return null;
  }

  return (
    <div className={cn("relative overflow-visible", className)}>
      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            className="absolute left-0 top-1/2 z-30 hidden -translate-y-1/2 rounded-full border border-[#d8ddd3] bg-white/90 p-2.5 text-[#1f4d3f] shadow-md backdrop-blur-sm transition hover:bg-white sm:flex"
            aria-label="Produit precedent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="absolute right-0 top-1/2 z-30 hidden -translate-y-1/2 rounded-full border border-[#d8ddd3] bg-white/90 p-2.5 text-[#1f4d3f] shadow-md backdrop-blur-sm transition hover:bg-white sm:flex"
            aria-label="Produit suivant"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      <motion.div
        drag={count > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.08}
        onDragEnd={handleDragEnd}
        className="flex items-end justify-center gap-1 overflow-visible px-2 py-4 sm:gap-3 sm:px-12"
      >
        {slideOffsets.map((offset, index) => {
          const item = items[index];
          if (Math.abs(offset) > 1) {
            return null;
          }

          return (
            <ProductCarouselSlide
              key={item.id}
              item={item}
              index={index}
              isActive={offset === 0}
              offset={offset}
              onSelect={() => {
                if (offset !== 0) {
                  goTo(index);
                }
              }}
            />
          );
        })}
      </motion.div>

      {count > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Afficher ${item.name}`}
              className={cn(
                "h-2 rounded-full transition-all",
                index === activeIndex ? "w-7 bg-[#1f4d3f]" : "w-2 bg-[#cfd5cb] hover:bg-[#aeb6a8]"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
