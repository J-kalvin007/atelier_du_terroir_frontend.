"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Marie Dupont",
    location: "Paris, France",
    avatar: "MD",
    rating: 5,
    comment:
      "La qualite des produits du terroir est incomparable. Les legumes frais et la viande blanche ont transforme ma cuisine. Le programme de fidelite est un vrai plus — j'ai deja atteint le palier Or !",
    tier: "GOLD",
  },
  {
    id: 2,
    name: "Amadou Diallo",
    location: "Dakar, Senegal",
    avatar: "AD",
    rating: 5,
    comment:
      "Enfin une plateforme qui accepte le Mobile Money ! La recharge du wallet est instantanee et la livraison au Senegal est rapide. Je recommande a 100%.",
    tier: "SILVER",
  },
  {
    id: 3,
    name: "Sophie Chen",
    location: "Montreal, Canada",
    avatar: "SC",
    rating: 5,
    comment:
      "Les produits transformes et seches sont d'une qualite remarquable. L'emballage est soigne et la livraison internationale s'est faite en 5 jours.",
    tier: "PLATINUM",
  },
  {
    id: 4,
    name: "Luca Rossi",
    location: "Milan, Italie",
    avatar: "LR",
    rating: 4,
    comment:
      "Des produits authentiques et de qualite premium. Les epices et cereales locales sont excellentes. Un vrai pont entre l'Afrique et le reste du monde.",
    tier: "BRONZE",
  },
] as const;

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () =>
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  const prevTestimonial = () =>
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section className="bg-surface/30 py-16 lg:py-24">
      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
            Temoignages
          </p>
          <h2 className="font-display text-3xl font-bold lg:text-4xl">
            Ce Que Disent Nos Clients
          </h2>
        </motion.div>

        <div className="relative mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-3xl border border-border bg-surface-elevated p-8 shadow-lg sm:p-12"
            >
              <Quote className="absolute right-8 top-8 h-12 w-12 text-primary/10" />

              <div className="mb-6 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= TESTIMONIALS[activeIndex].rating
                        ? "fill-highlight text-highlight"
                        : "fill-border text-border"
                    )}
                  />
                ))}
              </div>

              <blockquote className="text-lg leading-relaxed text-foreground sm:text-xl">
                &ldquo;{TESTIMONIALS[activeIndex].comment}&rdquo;
              </blockquote>

              <div className="mt-8 flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white",
                    TESTIMONIALS[activeIndex].tier === "PLATINUM"
                      ? "bg-gradient-to-br from-gray-300 to-gray-500"
                      : TESTIMONIALS[activeIndex].tier === "GOLD"
                        ? "bg-gradient-to-br from-yellow-400 to-amber-600"
                        : TESTIMONIALS[activeIndex].tier === "SILVER"
                          ? "bg-gradient-to-br from-gray-300 to-gray-400"
                          : "bg-gradient-to-br from-amber-600 to-amber-800"
                  )}
                >
                  {TESTIMONIALS[activeIndex].avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {TESTIMONIALS[activeIndex].name}
                  </p>
                  <p className="text-sm text-muted">{TESTIMONIALS[activeIndex].location}</p>
                </div>
                <span
                  className={cn(
                    "ml-auto rounded-full px-3 py-1 text-xs font-semibold",
                    `tier-${TESTIMONIALS[activeIndex].tier.toLowerCase()}`
                  )}
                  style={{
                    background: "var(--tier-gradient)",
                    color: "white",
                  }}
                >
                  {TESTIMONIALS[activeIndex].tier}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prevTestimonial}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-elevated transition-all hover:border-primary/30 hover:bg-surface-alt"
              aria-label="Temoignage precedent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === activeIndex ? "w-6 bg-primary" : "w-2 bg-border hover:bg-primary/30"
                  )}
                  aria-label={`Temoignage ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={nextTestimonial}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-elevated transition-all hover:border-primary/30 hover:bg-surface-alt"
              aria-label="Temoignage suivant"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
