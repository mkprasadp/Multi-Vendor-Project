import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag, Zap, Tag, Truck } from "lucide-react";

// ─── Slide data ────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 1,
    tag: "New Season",
    headline: ["Summer", "Collection", "2026"],
    accentWord: 1, // index of headline word to colorise
    sub: "Handpicked styles from top Indian designers. Delivered in 24 hrs.",
    cta: "Shop Now",
    ctaSecondary: "View Lookbook",
    badge: { top: "UP TO", value: "55%", bottom: "OFF" },
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&auto=format&fit=crop&q=80",
    accent: "#FF6B00",
    accentLight: "rgba(255,107,0,0.12)",
    stats: [{ label: "Brands", value: "500+" }, { label: "New Arrivals", value: "2.4K" }],
  },
  {
    id: 2,
    tag: "Electronics Sale",
    headline: ["Power Up", "Your", "World."],
    accentWord: 2,
    sub: "Top gadgets, smartwatches & audio gear. Zero-cost EMI available.",
    cta: "Explore Deals",
    ctaSecondary: "Compare Models",
    badge: { top: "STARTING", value: "₹999", bottom: "ONLY" },
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1000&auto=format&fit=crop&q=80",
    accent: "#2563EB",
    accentLight: "rgba(37,99,235,0.12)",
    stats: [{ label: "Products", value: "10K+" }, { label: "Brands", value: "120+" }],
  },
  {
    id: 3,
    tag: "Home Refresh",
    headline: ["Your Home,", "Your", "Story."],
    accentWord: 2,
    sub: "Furniture, décor & kitchen essentials — all under one roof.",
    cta: "Shop Home",
    ctaSecondary: "Get Inspired",
    badge: { top: "FLAT", value: "40%", bottom: "OFF" },
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000&auto=format&fit=crop&q=80",
    accent: "#059669",
    accentLight: "rgba(5,150,105,0.12)",
    stats: [{ label: "Categories", value: "80+" }, { label: "Happy Homes", value: "1.2L" }],
  },
  {
    id: 4,
    tag: "Beauty Edit",
    headline: ["Glow Up", "With", "Confidence."],
    accentWord: 0,
    sub: "Skincare, makeup & wellness. 100% authentic. Easy returns.",
    cta: "Shop Beauty",
    ctaSecondary: "Take Skin Quiz",
    badge: { top: "BUY 2", value: "GET 1", bottom: "FREE" },
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1000&auto=format&fit=crop&q=80",
    accent: "#DB2777",
    accentLight: "rgba(219,39,119,0.12)",
    stats: [{ label: "Brands", value: "300+" }, { label: "Reviews", value: "4.8★" }],
  },
];

const PROMO_STRIP = [
  { icon: <Truck size={13} />, text: "Free delivery on orders above ₹499" },
  { icon: <Zap size={13} />, text: "Same-day dispatch before 2 PM" },
  { icon: <Tag size={13} />, text: "Extra 10% off with code HERO10" },
  { icon: <ShoppingBag size={13} />, text: "30-day hassle-free returns" },
];

const TICKER_ITEMS = [
  "🔥 Flash Sale LIVE — Up to 70% off",
  "✦",
  "New arrivals every Monday",
  "✦",
  "Pay in 0% EMI — No extra charges",
  "✦",
  "Shop from 10,000+ brands",
  "✦",
  "Track your order in real time",
  "✦",
];

const DURATION = 5200;

// ─── Component ─────────────────────────────────────────────────────────────────
export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused]   = useState(false);
  const [promoIdx, setPromoIdx] = useState(0);

  const timerRef   = useRef(null);
  const rafRef     = useRef(null);
  const startRef   = useRef(null);

  // ── slide transition ──────────────────────────────────────────────────────
  const goTo = useCallback((idx) => {
    const next = ((idx % SLIDES.length) + SLIDES.length) % SLIDES.length;
    setPrev(current);
    setCurrent(next);
    setProgress(0);
    startRef.current = performance.now();
  }, [current]);

  const nextSlide = useCallback(() => goTo(current + 1), [current, goTo]);
  const prevSlide = useCallback(() => goTo(current - 1), [current, goTo]);

  // ── auto-advance ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(nextSlide, DURATION);
    return () => clearInterval(timerRef.current);
  }, [paused, nextSlide]);

  // ── progress bar RAF ──────────────────────────────────────────────────────
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (paused) return;
    startRef.current = performance.now();
    const tick = (now) => {
      const pct = Math.min(((now - startRef.current) / DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [current, paused]);

  // ── promo strip rotation ──────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setPromoIdx(i => (i + 1) % PROMO_STRIP.length), 2800);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className="relative w-full font-sans" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── PROMO STRIP ──────────────────────────────────────────────────── */}
      <div
        className="w-full flex items-center justify-center gap-2 py-2 px-4 text-white text-xs font-semibold tracking-wide overflow-hidden transition-colors duration-700"
        style={{ background: slide.accent }}
      >
        <span className="flex items-center gap-1.5 transition-all duration-500">
          {PROMO_STRIP[promoIdx].icon}
          {PROMO_STRIP[promoIdx].text}
        </span>
        <span className="hidden sm:flex items-center gap-4 ml-4 opacity-60 text-[10px]">
          {PROMO_STRIP.map((_, i) => (
            <button
              key={i}
              onClick={() => setPromoIdx(i)}
              className={`w-1 h-1 rounded-full transition-all ${i === promoIdx ? "bg-white scale-150" : "bg-white/40"}`}
            />
          ))}
        </span>
      </div>

      {/* ── MAIN HERO ────────────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden bg-[#0D0D0D]"
        style={{ minHeight: "clamp(480px, 82vh, 720px)" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* slides */}
        {SLIDES.map((s, i) => {
          const isActive = i === current;
          const isPrev   = i === prev;
          return (
            <div
              key={s.id}
              className="absolute inset-0"
              style={{
                opacity:    isActive ? 1 : 0,
                zIndex:     isActive ? 20 : isPrev ? 10 : 0,
                transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              {/* ── image (right 55%) with diagonal clip ── */}
              <div
                className="absolute inset-0"
                style={{
                  clipPath: "polygon(38% 0%, 100% 0%, 100% 100%, 30% 100%)",
                }}
              >
                <img
                  src={s.image}
                  alt={s.tag}
                  className="w-full h-full object-cover"
                  style={{
                    transform: isActive ? "scale(1.05)" : "scale(1.12)",
                    transition: `transform ${DURATION}ms ease-out`,
                  }}
                />
                {/* dark right-edge gradient so image doesn't float */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent opacity-60" />
                {/* accent tint overlay */}
                <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 70% 40%, ${s.accentLight} 0%, transparent 55%)` }} />
              </div>

              {/* ── left text panel ── */}
              <div className="relative z-10 h-full flex flex-col justify-center px-7 sm:px-14 lg:px-20 pb-16 pt-10 max-w-2xl">

                {/* tag */}
                <div
                  className="flex items-center gap-2 mb-5"
                  style={{
                    opacity:   isActive ? 1 : 0,
                    transform: isActive ? "translateY(0)" : "translateY(12px)",
                    transition: "opacity 0.55s 0.1s, transform 0.55s 0.1s",
                  }}
                >
                  <span
                    className="text-[9px] font-black tracking-[0.22em] uppercase px-3 py-1 rounded-full"
                    style={{ background: s.accentLight, color: s.accent, border: `1px solid ${s.accent}55` }}
                  >
                    {s.tag}
                  </span>
                </div>

                {/* headline */}
                <h1
                  className="font-black leading-[0.88] text-white mb-5"
                  style={{
                    fontSize: "clamp(40px, 6.5vw, 80px)",
                    letterSpacing: "-0.04em",
                    opacity:   isActive ? 1 : 0,
                    transform: isActive ? "translateY(0)" : "translateY(20px)",
                    transition: "opacity 0.6s 0.2s, transform 0.6s 0.2s",
                  }}
                >
                  {s.headline.map((line, j) => (
                    <span key={j} className="block">
                      {j === s.accentWord
                        ? <span style={{ color: s.accent }}>{line}</span>
                        : line}
                    </span>
                  ))}
                </h1>

                {/* sub */}
                <p
                  className="text-[#8A8E99] leading-relaxed mb-7 max-w-xs"
                  style={{
                    fontSize: "clamp(12px, 1.3vw, 15px)",
                    opacity:   isActive ? 1 : 0,
                    transform: isActive ? "translateY(0)" : "translateY(16px)",
                    transition: "opacity 0.6s 0.32s, transform 0.6s 0.32s",
                  }}
                >
                  {s.sub}
                </p>

                {/* CTAs */}
                <div
                  className="flex flex-wrap gap-3 mb-8"
                  style={{
                    opacity:   isActive ? 1 : 0,
                    transform: isActive ? "translateY(0)" : "translateY(12px)",
                    transition: "opacity 0.6s 0.44s, transform 0.6s 0.44s",
                  }}
                >
                  <button
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold tracking-wide text-white relative overflow-hidden group"
                    style={{ background: s.accent }}
                  >
                    <ShoppingBag size={14} />
                    {s.cta}
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.15] transition-opacity duration-200" />
                  </button>
                  <button className="px-6 py-3 rounded-full text-sm font-semibold tracking-wide text-white border border-white/20 hover:border-white/50 hover:bg-white/5 transition-all duration-200">
                    {s.ctaSecondary}
                  </button>
                </div>

                {/* Stats */}
                <div
                  className="flex items-center gap-6"
                  style={{
                    opacity:   isActive ? 1 : 0,
                    transform: isActive ? "translateY(0)" : "translateY(10px)",
                    transition: "opacity 0.6s 0.56s, transform 0.6s 0.56s",
                  }}
                >
                  {s.stats.map((st, j) => (
                    <div key={j} className="flex flex-col">
                      <span className="text-lg font-black text-white leading-none">{st.value}</span>
                      <span className="text-[10px] text-[#8A8E99] mt-0.5 uppercase tracking-widest">{st.label}</span>
                    </div>
                  ))}
                  <div className="w-px h-8 bg-white/15 mx-1" />
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(n => (
                      <svg key={n} width="11" height="11" viewBox="0 0 24 24" fill={n <= 4 ? s.accent : "transparent"} stroke={s.accent} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                    <span className="text-[10px] text-[#8A8E99] ml-1">4.8 (12K reviews)</span>
                  </div>
                </div>
              </div>

              {/* ── Deal badge ── */}
              <div
                className="absolute z-30 flex flex-col items-center justify-center text-center font-black text-white"
                style={{
                  top: "18%",
                  right: "6%",
                  width: 86,
                  height: 86,
                  borderRadius: "50%",
                  background: s.accent,
                  transform: isActive ? "rotate(-14deg) scale(1)" : "rotate(-14deg) scale(0.5)",
                  opacity: isActive ? 1 : 0,
                  transition: "opacity 0.5s 0.6s, transform 0.5s 0.6s",
                  boxShadow: `0 0 0 4px ${s.accentLight}, 0 8px 28px ${s.accent}66`,
                  lineHeight: 1.15,
                }}
              >
                <span style={{ fontSize: 8, letterSpacing: "0.15em", opacity: 0.85 }}>{s.badge.top}</span>
                <span style={{ fontSize: 22 }}>{s.badge.value}</span>
                <span style={{ fontSize: 8, letterSpacing: "0.15em", opacity: 0.85 }}>{s.badge.bottom}</span>
              </div>
            </div>
          );
        })}

        {/* ── ARROWS ── */}
        {[
          { side: "left-3 sm:left-6", fn: prevSlide, icon: <ChevronLeft size={18} /> },
          { side: "right-3 sm:right-6", fn: nextSlide, icon: <ChevronRight size={18} /> },
        ].map(({ side, fn, icon }, i) => (
          <button
            key={i}
            onClick={fn}
            className={`absolute ${side} top-1/2 -translate-y-1/2 z-40 w-10 h-10 flex items-center justify-center rounded-full border border-white/15 text-white bg-white/10 hover:bg-white/22 hover:border-white/40 backdrop-blur-sm transition-all duration-200`}
          >
            {icon}
          </button>
        ))}

        {/* ── BOTTOM CONTROLS ── */}
        <div className="absolute bottom-5 left-7 sm:left-14 lg:left-20 z-40 flex items-center gap-5">
          {/* Dot progress */}
          <div className="flex items-center gap-2">
            {SLIDES.map((s, i) => {
              const isActive = i === current;
              return (
                <button
                  key={s.id}
                  onClick={() => goTo(i)}
                  className="relative flex items-center"
                  aria-label={`Go to slide ${i + 1}`}
                >
                  <span
                    className="block rounded-full overflow-hidden transition-all duration-300"
                    style={{
                      width:  isActive ? 32 : 8,
                      height: 8,
                      background: isActive ? slide.accent : "rgba(255,255,255,0.25)",
                    }}
                  >
                    {isActive && (
                      <span
                        className="block h-full rounded-full bg-white/40 origin-left"
                        style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Counter */}
          <span className="text-[10px] font-bold tracking-widest text-white/35 tabular-nums">
            {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </span>

          {/* Pause / play */}
          <button
            onClick={() => setPaused(p => !p)}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-white/20 text-white/50 hover:text-white hover:border-white/50 transition-all duration-200"
          >
            {paused ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            )}
          </button>
        </div>

        {/* ── SLIDE THUMBNAILS (desktop) ── */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className="w-14 h-10 rounded-lg overflow-hidden transition-all duration-300"
              style={{
                opacity:    i === current ? 1 : 0.4,
                border:     `2px solid ${i === current ? s.accent : "transparent"}`,
                transform:  i === current ? "scale(1.1)" : "scale(1)",
              }}
            >
              <img src={s.image} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* ── TICKER STRIP ─────────────────────────────────────────────────── */}
      <div className="w-full overflow-hidden bg-[#111110] border-t border-white/5" style={{ height: 34 }}>
        <div
          className="flex items-center h-full whitespace-nowrap"
          style={{ animation: "tickerMove 28s linear infinite" }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span
              key={i}
              className="text-[10px] font-bold tracking-[0.18em] uppercase px-7"
              style={{ color: t === "✦" ? slide.accent : "#8A8E99" }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── MINI PROMO CARDS ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Truck size={16} />, title: "Free Delivery", sub: "On orders above ₹499" },
            { icon: <Zap size={16} />, title: "Same Day Dispatch", sub: "Order before 2 PM" },
            { icon: <Tag size={16} />, title: "Best Prices", sub: "Lowest price guarantee" },
            { icon: <ShoppingBag size={16} />, title: "Easy Returns", sub: "30-day hassle-free" },
          ].map((card, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors duration-150 cursor-default">
              <div
                className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ background: slide.accentLight, color: slide.accent }}
              >
                {card.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 leading-tight">{card.title}</p>
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* keyframes */}
      <style>{`
        @keyframes tickerMove {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </section>
  );
}