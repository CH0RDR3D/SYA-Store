"use client"

import React, { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import hero1 from "../../../../assets/images/hero/hero1.webp"
import hero2 from "../../../../assets/images/hero/hero2.webp"
import hero3 from "../../../../assets/images/hero/hero3.webp"
import hero4 from "../../../../assets/images/hero/hero4.webp"
import hero5 from "../../../../assets/images/hero/hero5.webp"

const slides = [
  {
    id: 1,
    title: "Signature Collection",
    subtitle: "Timeless pieces. Curated with purpose.",
    image: hero1,
    cta: "Discover Now",
    link: "/store",
    tag: "New Season",
  },
  {
    id: 2,
    title: "Swift Checkout",
    subtitle: "From cart to door — effortlessly fast.",
    image: hero2,
    cta: "Start Shopping",
    link: "/store",
    tag: "Featured",
  },
  {
    id: 3,
    title: "Crafted for Moments",
    subtitle: "Products built for experiences that matter.",
    image: hero3,
    cta: "Explore Range",
    link: "/store",
    tag: "Top Picks",
  },
  {
    id: 4,
    title: "Bold. Original.",
    subtitle: "Push boundaries with every purchase.",
    image: hero4,
    cta: "Shop Now",
    link: "/store",
    tag: "Trending",
  },
  {
    id: 5,
    title: "Limited Edition",
    subtitle: "Exclusive pieces for the discerning collector.",
    image: hero5,
    cta: "Shop Now",
    link: "/store",
    tag: "New Arrivals",
  }
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(next, 6500)
    return () => clearInterval(interval)
  }, [isPaused, next])

  return (
    <section
      className="relative w-full h-[600px] md:h-[720px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => {
        const isActive = index === current

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-[opacity,transform] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isActive ? "opacity-100 scale-100" : "opacity-0 scale-110"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className={`object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isActive ? "scale-100" : "scale-110"
              }`}
              priority={index === 0}
            />

            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent dark:from-black/80 dark:via-black/50 dark:to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8 md:px-20 max-w-3xl">
              <span className="inline-block self-start px-3 py-1 bg-amber-400/90 text-black text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full mb-4 sm:mb-6">
                {slide.tag}
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-[var(--text-primary)] leading-tight tracking-tight drop-shadow-lg">
                {slide.title}
              </h1>

              <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-xl text-[var(--text-secondary)] max-w-md leading-relaxed">
                {slide.subtitle}
              </p>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <Link
                  href={slide.link}
                  className="px-6 sm:px-8 py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-xl transition-all duration-200 hover:shadow-amber-400/40 hover:scale-[1.02]"
                >
                  {slide.cta}
                </Link>
                <Link
                  href="/store"
                  className="px-5 sm:px-6 py-3 border border-[var(--nav-border)] text-[var(--text-primary)] text-xs sm:text-sm font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition backdrop-blur-sm"
                >
                  View All
                </Link>
              </div>
            </div>
          </div>
        )
      })}

      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/60 dark:bg-black/30 dark:hover:bg-black/60 text-[var(--text-primary)] border border-black/10 dark:border-white/20 backdrop-blur-sm transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/60 dark:bg-black/30 dark:hover:bg-black/60 text-[var(--text-primary)] border border-black/10 dark:border-white/20 backdrop-blur-sm transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-0 left-0 w-full h-24 sm:h-40 pointer-events-none" style={{ background: "linear-gradient(to top, var(--bg-base), transparent)" }} />
    </section>
  )
}
