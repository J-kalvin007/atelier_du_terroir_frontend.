"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Loader2, Tag, Zap } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useApplyPromoCode } from "@/hooks/useApplyPromoCode";
import { useCartStore } from "@/store/cartStore";
import type { PublicPromoCode, PublicPromoProduct } from "@/lib/ecommerce-api";

type PromoCodesCarouselProps = {
  promos: PublicPromoCode[];
  className?: string;
};

function promoLabel(promo: PublicPromoCode) {
  if (promo.type === "percentage") {
    return `-${parseFloat(promo.value)}%`;
  }
  if (promo.type === "free_shipping") {
    return "Livraison offerte";
  }
  return formatCurrency(parseFloat(promo.value), "FCFA");
}

function getFeaturedProduct(promo: PublicPromoCode): PublicPromoProduct | null {
  return promo.applicable_product_labels?.[0] ?? null;
}

type PromoCarouselCardProps = {
  promo: PublicPromoCode;
  isActive: boolean;
  offset: number;
  onSelect: () => void;
};

function PromoCarouselCard({ promo, isActive, offset, onSelect }: PromoCarouselCardProps) {
  const { applyCode, applyingCode, activePromoCode } = useApplyPromoCode();
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [burst, setBurst] = useState(false);

  const product = getFeaturedProduct(promo);
  const isApplying = applyingCode === promo.code.toUpperCase();
  const isApplied = activePromoCode === promo.code.toUpperCase();
  const isSide = Math.abs(offset) === 1;
  const isHidden = Math.abs(offset) > 1;

  async function handleUse(event: React.MouseEvent) {
    event.stopPropagation();

    if (!isActive || isApplying) {
      return;
    }

    if (isApplied) {
      toggleDrawer(true);
      setFeedback("Code deja applique");
      return;
    }

    setFeedback(null);
    const result = await applyCode(promo.code, { promo });
    if (result.ok) {
      setBurst(true);
      window.setTimeout(() => setBurst(false), 900);
      setFeedback(result.message);
    } else if (result.reason !== "login") {
      setFeedback(result.message || "Impossible d'appliquer le code.");
    }
  }

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
      style={{ width: isActive ? 280 : 240, zIndex: isActive ? 20 : 10 - Math.abs(offset) }}
      aria-current={isActive ? "true" : undefined}
    >
      <div className="relative mx-auto w-full pt-24">
        <motion.div
          animate={{
            y: isActive ? -8 : 0,
            scale: isActive ? 1.08 : 0.82,
            opacity: isActive ? 1 : 0.75,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="pointer-events-none absolute left-1/2 top-0 z-20 h-44 w-36 -translate-x-1/2"
        >
          {product?.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="160px"
              className="object-contain drop-shadow-[0_22px_28px_rgba(0,0,0,0.28)]"
              priority={isActive}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white/80 shadow-[0_18px_30px_rgba(0,0,0,0.12)]">
              <Tag className={cn("h-14 w-14", isActive ? "text-[#1f4d3f]" : "text-gray-400")} />
            </div>
          )}
        </motion.div>

        <motion.div
          animate={{
            backgroundColor: isActive ? "#1f4d3f" : "#eceee9",
            color: isActive ? "#ffffff" : "#8a9488",
          }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={cn(
            "relative overflow-visible rounded-[2rem] px-6 pb-6 pt-16 shadow-[0_24px_48px_rgba(15,23,42,0.14)]",
            isActive ? "min-h-[320px]" : "min-h-[280px]"
          )}
        >
          <AnimatePresence>
            {burst ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.span
                    key={`burst-${promo.id}-${i}`}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos((i / 6) * Math.PI * 2) * 36,
                      y: Math.sin((i / 6) * Math.PI * 2) * 36,
                      opacity: [1, 0.7, 0],
                    }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-[#ef8219]"
                  />
                ))}
              </>
            ) : null}
          </AnimatePresence>

          <motion.p
            animate={{ opacity: isActive ? 1 : 0.85 }}
            className={cn(
              "line-clamp-2 text-center text-lg font-semibold leading-snug",
              isActive ? "text-white" : "text-[#6b7568]"
            )}
          >
            {product?.name || promo.description || "Offre speciale"}
          </motion.p>

          <div
            className={cn(
              "my-4 border-t",
              isActive ? "border-white/15" : "border-[#d8ddd3]"
            )}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className={cn("text-xs uppercase tracking-[0.18em]", isActive ? "text-white/60" : "text-[#9aa297]")}>
                Code promo
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                  isActive ? "bg-[#ef8219] text-white" : "bg-[#dfe3dc] text-[#6b7568]"
                )}
              >
                <Zap className="h-3 w-3" />
                {promoLabel(promo)}
              </span>
            </div>

            <p
              className={cn(
                "text-center font-mono text-2xl font-black tracking-[0.22em]",
                isActive ? "text-white" : "text-[#5f6a5d]"
              )}
            >
              {promo.code}
            </p>

            {promo.description && product?.name ? (
              <p className={cn("line-clamp-2 text-center text-xs leading-5", isActive ? "text-white/65" : "text-[#9aa297]")}>
                {promo.description}
              </p>
            ) : null}
          </div>

          <motion.span
            role="presentation"
            onClick={(event) => void handleUse(event)}
            animate={{
              scale: isActive ? 1 : 0.94,
              opacity: isActive ? 1 : 0.55,
            }}
            whileHover={isActive ? { scale: 1.02 } : undefined}
            whileTap={isActive ? { scale: 0.98 } : undefined}
            className={cn(
              "mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors",
              isActive
                ? isApplied
                  ? "cursor-pointer bg-emerald-500 text-white"
                  : "cursor-pointer bg-[#163a30] text-white hover:bg-black"
                : "cursor-default bg-[#dfe3dc] text-[#8a9488]"
            )}
          >
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Application...
              </>
            ) : isApplied ? (
              <>
                <Check className="h-4 w-4" />
                Code actif
              </>
            ) : (
              "Utiliser le code"
            )}
          </motion.span>

          {feedback && isActive ? (
            <p className="mt-2 text-center text-[11px] font-medium text-emerald-200">{feedback}</p>
          ) : null}
        </motion.div>
      </div>
    </motion.button>
  );
}

export function PromoCodesCarousel({ promos, className }: PromoCodesCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const count = promos.length;

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

    return promos.map((_, index) => {
      let offset = index - activeIndex;
      if (offset > count / 2) {
        offset -= count;
      }
      if (offset < -count / 2) {
        offset += count;
      }
      return offset;
    });
  }, [activeIndex, count, promos]);

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
    <div className={cn("relative", className)}>
      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            className="absolute left-0 top-1/2 z-30 hidden -translate-y-1/2 rounded-full border border-[#d8ddd3] bg-white/90 p-2.5 text-[#1f4d3f] shadow-md backdrop-blur-sm transition hover:bg-white sm:flex"
            aria-label="Code promo precedent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="absolute right-0 top-1/2 z-30 hidden -translate-y-1/2 rounded-full border border-[#d8ddd3] bg-white/90 p-2.5 text-[#1f4d3f] shadow-md backdrop-blur-sm transition hover:bg-white sm:flex"
            aria-label="Code promo suivant"
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
          const promo = promos[index];
          if (Math.abs(offset) > 1) {
            return null;
          }

          return (
            <PromoCarouselCard
              key={promo.id}
              promo={promo}
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
          {promos.map((promo, index) => (
            <button
              key={promo.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Afficher ${promo.code}`}
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
