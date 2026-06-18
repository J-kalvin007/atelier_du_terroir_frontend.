"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Sparkles, Leaf, Award, Heart, X } from "lucide-react";
import {
  pimentHeroImage,
  poivronsImage,
  tomateHeroImage,
} from "@/assets/images";

const HERO_BADGE = "Le terroir agricole dans toute sa splendeur";
const HERO_WATERMARK = "ATELIER DU TERROIR";
const HERO_TITLE = "Atelier du Terroir";
const HERO_SUBTITLE = "Des produits sains, frais et prets pour le monde.";
const HERO_PRIMARY_CTA = "Explorer la Boutique";
const HERO_SECONDARY_CTA = "Notre Histoire";
const HERO_STORY_VIDEO_ID = "vYjrGxlKjYo";
const HERO_HIGHLIGHT = "L'authenticite qui se savoure";
const HERO_HIGHLIGHT_SECOND =
  "Plus qu'un choix alimentaire, une nouvelle facon de vivre et de consommer.";

const ROTATING_TEXTS = [
  {
    title: "Cultives avec respect",
    body:
      "A l'atelier du terroir, nos produits sont cultives et eleves selon des methodes respectueuses de l'environnement et de l'agriculture durable.",
  },
  {
    title: "Le meilleur du terroir",
    body:
      "Qu'il s'agisse de fruits frais, de viande blanche, de produits seches ou transformes, nous privilegions des pratiques responsables pour offrir le meilleur, localement et a l'international.",
  },
  {
    title: "Le terroir agricole dans toute sa splendeur",
    body: "L'alimentation naturelle est aujourd'hui au coeur de toutes les attentions.",
  },
];

const HERO_IMAGES = [tomateHeroImage, pimentHeroImage, poivronsImage];

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [showStoryVideo, setShowStoryVideo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % ROTATING_TEXTS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showStoryVideo) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowStoryVideo(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showStoryVideo]);

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-background">
      <div className="absolute inset-0">
        {HERO_IMAGES.map((image, index) => (
          <motion.div
            key={index}
            initial={false}
            animate={{
              opacity: currentImageIndex === index ? 1 : 0,
              scale: currentImageIndex === index ? 1 : 1.03,
            }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={image}
              alt={`Atelier du Terroir ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a1f]/85 via-[#2a4a25]/45 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(194,230,98,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(0,0,0,0.2)_100%)]" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-0 overflow-hidden px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <p className="select-none text-center font-sans text-[2.4rem] font-black uppercase tracking-[0.12em] text-white/10 sm:text-[4rem] lg:text-center lg:text-[5rem] xl:text-[6rem] [text-shadow:0_2px_20px_rgba(0,0,0,0.3)] [font-stretch:ultra-condensed]">
          {HERO_WATERMARK}
        </p>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1800px] items-center px-4 pb-10 pt-24 sm:px-6 sm:pt-28 md:px-8 lg:px-12 lg:pt-32 xl:px-16 2xl:px-20">
        <div className="grid w-full items-start gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.1, 1] }}
            className="space-y-6 lg:space-y-7"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-md shadow-lg">
              <Sparkles className="h-4 w-4 text-[#c2e662] drop-shadow-sm" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/90 sm:text-xs">
                {HERO_BADGE}
              </span>
            </div>

            <div className="relative">
              <div className="absolute -left-5 top-1/2 hidden h-10 w-0.5 -translate-y-1/2 bg-[#c2e662]/60 lg:block" />
              <h1 className="font-display text-4xl font-black leading-[1.02] tracking-tight text-white drop-shadow-xl sm:text-5xl lg:text-6xl xl:text-7xl">
                {HERO_TITLE}
              </h1>
            </div>

            <p className="max-w-xl text-xl font-medium leading-snug tracking-wide text-white/95 drop-shadow-md sm:text-2xl lg:text-[2rem]">
              {HERO_SUBTITLE}
            </p>

            <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row lg:justify-start">
              <Link
                href="/products"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-hover px-7 py-3.5 text-base font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl sm:text-lg"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {HERO_PRIMARY_CTA}
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-0" />
              </Link>

              <button
                type="button"
                onClick={() => setShowStoryVideo(true)}
                className="group flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-base font-bold text-white backdrop-blur-md transition-all duration-300 hover:border-white/50 hover:bg-white/20 hover:shadow-lg sm:text-lg"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-all duration-300 group-hover:bg-white/25">
                  <Play className="h-4 w-4 text-[#c2e662] drop-shadow-sm" />
                </div>
                {HERO_SECONDARY_CTA}
              </button>
            </div>

            <div className="flex items-center gap-3 pt-4">
              {HERO_IMAGES.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`Afficher l'image ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    currentImageIndex === index
                      ? "w-8 bg-[#c2e662] shadow-[0_0_12px_rgba(194,230,98,0.5)]"
                      : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.1, 1], delay: 0.1 }}
            className="flex justify-center lg:justify-end lg:pt-4"
          >
            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur-md lg:max-w-md lg:p-7">
              <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-[#c2e662]/10 blur-3xl" />

              <div className="relative border-l-3 border-[#c2e662] pl-5">
                <Leaf className="absolute -left-3 -top-2 h-5 w-5 text-[#c2e662] drop-shadow-md" />
                <p className="font-display text-2xl font-semibold italic leading-tight text-primary drop-shadow-md sm:text-3xl lg:text-[2.6rem]">
                  {HERO_HIGHLIGHT}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-px w-8 bg-primary/60" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white sm:text-[11px]">
                    {HERO_HIGHLIGHT_SECOND}
                  </p>
                </div>
              </div>

              <div className="my-5 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <Award className="h-4 w-4 text-white/40" />
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>

              <div className="relative min-h-[170px] rounded-2xl bg-black/20 p-4 text-center sm:min-h-[180px] sm:p-5">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#c2e662]/5 to-transparent" />
                <div className="relative flex h-full flex-col items-center justify-center gap-2">
                  <Heart className="h-5 w-5 text-[#c2e662]/80" />
                  <div className="relative h-28 w-full overflow-hidden sm:h-32">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={textIndex}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.7, ease: "easeInOut" }}
                        className="absolute inset-x-0 space-y-3 text-center"
                      >
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary sm:text-base">
                          {ROTATING_TEXTS[textIndex].title}
                        </p>
                        <p className="text-sm font-medium leading-relaxed text-white drop-shadow-sm sm:text-[15px]">
                          {ROTATING_TEXTS[textIndex].body}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {ROTATING_TEXTS.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 w-4 rounded-full transition-all duration-500 ${
                          textIndex === idx ? "bg-[#c2e662]" : "bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showStoryVideo ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-6"
            onClick={() => setShowStoryVideo(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Video Notre Histoire"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowStoryVideo(false)}
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                aria-label="Fermer la video"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${HERO_STORY_VIDEO_ID}?autoplay=1&rel=0`}
                  title="Notre Histoire - Atelier du Terroir"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
