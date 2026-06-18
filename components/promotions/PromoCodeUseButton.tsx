"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Sparkles, Tag, Zap } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useApplyPromoCode } from "@/hooks/useApplyPromoCode";
import { useCartStore } from "@/store/cartStore";
import type { PublicPromoCode } from "@/lib/ecommerce-api";

type PromoCodeUseButtonProps = {
  promo: PublicPromoCode;
  className?: string;
  variant?: "home" | "page";
  showDescription?: boolean;
  index?: number;
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

const SPARKLE_POSITIONS = [
  { top: "12%", left: "8%", delay: "promo-sparkle-delay-1" },
  { top: "18%", right: "10%", delay: "promo-sparkle-delay-2" },
  { top: "72%", left: "14%", delay: "promo-sparkle-delay-3" },
  { top: "65%", right: "12%", delay: "" },
] as const;

export function PromoCodeUseButton({
  promo,
  className,
  variant = "page",
  showDescription = true,
  index = 0,
}: PromoCodeUseButtonProps) {
  const { applyCode, applyingCode, activePromoCode } = useApplyPromoCode();
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [burst, setBurst] = useState(false);

  const isApplying = applyingCode === promo.code.toUpperCase();
  const isActive = activePromoCode === promo.code.toUpperCase();
  const isHome = variant === "home";
  const codeChars = promo.code.split("");

  async function handleUse() {
    if (isApplying) {
      return;
    }

    if (isActive) {
      toggleDrawer(true);
      setFeedback({ type: "success", message: "Code deja applique — panier ouvert." });
      return;
    }

    setFeedback(null);
    const result = await applyCode(promo.code, { promo });
    if (result.ok) {
      setBurst(true);
      window.setTimeout(() => setBurst(false), 1200);
      setFeedback({ type: "success", message: result.message });
    } else if (result.reason !== "login") {
      setFeedback({ type: "error", message: result.message || "Impossible d'appliquer le code." });
    }
  }

  return (
    <div className={cn("flex h-full flex-col gap-2", className)}>
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.94 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 22,
          delay: index * 0.08,
        }}
        className={cn("promo-card-shell h-full", isActive && "is-active")}
      >
        <motion.button
          type="button"
          onClick={() => void handleUse()}
          disabled={isApplying}
          aria-pressed={isActive}
          whileHover={{ y: -5, scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            "group relative flex h-48 w-full cursor-pointer flex-col overflow-hidden rounded-2xl border-2 border-dashed text-left",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight/40",
            "disabled:cursor-wait disabled:opacity-80",
            !isActive && "promo-card-glow",
            isHome ? "p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)]" : "p-5 shadow-sm",
            isActive
              ? "border-success/60 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/80"
              : isHome
                ? "border-highlight/45 bg-gradient-to-br from-[#fff8f0] via-white to-[#fff3e6] hover:border-highlight/70"
                : "border-[#ef8219]/40 bg-gradient-to-br from-[#fff8f0] via-white to-[#fff3e6] hover:border-[#ef8219]/70"
          )}
        >
          <div className="promo-card-shimmer" aria-hidden="true" />

          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-4 promo-ticket-notch opacity-60"
            aria-hidden="true"
          />

          {SPARKLE_POSITIONS.map((pos, sparkleIndex) => (
            <Sparkles
              key={`sparkle-${sparkleIndex}`}
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute h-3.5 w-3.5 text-highlight/50 promo-sparkle",
                pos.delay
              )}
              style={{
                top: pos.top,
                left: "left" in pos ? pos.left : undefined,
                right: "right" in pos ? pos.right : undefined,
              }}
            />
          ))}

          <AnimatePresence>
            {burst ? (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.span
                    key={`burst-${i}`}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                    animate={{
                      scale: [0, 1.2, 0],
                      x: Math.cos((i / 8) * Math.PI * 2) * 48,
                      y: Math.sin((i / 8) * Math.PI * 2) * 48,
                      opacity: [1, 0.8, 0],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-highlight"
                    aria-hidden="true"
                  />
                ))}
              </>
            ) : null}
          </AnimatePresence>

          {showDescription ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="relative mb-3 min-h-12 flex-shrink-0 line-clamp-2 pl-2 text-sm leading-6 text-gray-600"
            >
              {promo.description || "\u00A0"}
            </motion.p>
          ) : (
            <div className="mb-3 min-h-12 flex-shrink-0" aria-hidden="true" />
          )}

          <span className="relative mt-auto flex min-h-[4.5rem] items-center justify-between gap-3 pl-2">
            <span className="flex min-w-0 flex-1 items-center gap-3">
              <motion.span
                animate={
                  isActive
                    ? { scale: [1, 1.12, 1], rotate: [0, 8, 0] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-inner transition-colors",
                  isActive ? "bg-success/20 promo-success-ring" : "bg-highlight/15 group-hover:bg-highlight/25"
                )}
              >
                {isApplying ? (
                  <Loader2 className="h-5 w-5 animate-spin text-highlight" />
                ) : isActive ? (
                  <Check className="h-5 w-5 text-success" />
                ) : (
                  <Tag className="h-5 w-5 text-highlight" />
                )}
              </motion.span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-nowrap gap-0.5 overflow-hidden font-mono text-lg font-black tracking-wider text-[#1f241c]">
                  {codeChars.map((char, charIndex) => (
                    <motion.span
                      key={`${promo.id}-char-${charIndex}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3, color: "#ef8219" }}
                      transition={{
                        delay: 0.2 + charIndex * 0.04,
                        type: "spring",
                        stiffness: 500,
                        damping: 18,
                      }}
                      className="inline-block shrink-0 group-hover:text-highlight"
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
                <motion.span
                  key={isActive ? "active" : isApplying ? "loading" : "idle"}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mt-1 block truncate text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {isActive ? "Applique — voir le panier" : isApplying ? "Application..." : "Cliquer pour utiliser"}
                </motion.span>
              </span>
            </span>

            <motion.span
              animate={isActive ? { scale: 1 } : { scale: [1, 1.04, 1] }}
              transition={
                isActive
                  ? undefined
                  : { repeat: Infinity, duration: 2.4, ease: "easeInOut" }
              }
              className={cn(
                "inline-flex h-10 min-w-[7.5rem] shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-bold text-white shadow-md sm:text-sm",
                isActive
                  ? "bg-success"
                  : "bg-gradient-to-r from-highlight to-[#ff9a3c] promo-badge-live group-hover:from-[#d86d14] group-hover:to-highlight"
              )}
            >
              {isActive ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Actif</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>{promoLabel(promo)}</span>
                </>
              )}
            </motion.span>
          </span>
        </motion.button>
      </motion.div>

      <AnimatePresence mode="wait">
        {feedback ? (
          <motion.p
            key={feedback.message}
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className={cn(
              "overflow-hidden text-xs font-medium",
              feedback.type === "success" ? "text-success" : "text-red-600"
            )}
          >
            {feedback.message}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
