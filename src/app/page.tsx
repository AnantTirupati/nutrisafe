"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import svgPaths from "../imports/svg-qhd1v7nqm0";
import { LandingNav } from "@/components/LandingNav";

const CTA_BG =
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1440&h=600&fit=crop&auto=format";
const FOOD_IMG =
  "https://images.unsplash.com/photo-1547592180-85f173990554?w=480&h=400&fit=crop&auto=format";

// ─── Utilities ────────────────────────────────────────────────────────────────

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// ─── 3D Tilt Card ─────────────────────────────────────────────────────────────

function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({
    transform:
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
    transition: "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
  });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReduced || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 12;
      const rotateY = (x - 0.5) * 12;
      setCardStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`,
        transition: "transform 0.06s linear",
      });
      setGlare({ x: x * 100, y: y * 100, opacity: 0.18 });
    },
    [prefersReduced]
  );

  const handleMouseLeave = useCallback(() => {
    setCardStyle({
      transform:
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
      transition: "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
    });
    setGlare((g) => ({ ...g, opacity: 0 }));
  }, []);

  return (
    <div style={{ transformStyle: "preserve-3d" }} className={`flex-1 min-w-0 ${className}`}>
      <div
        ref={cardRef}
        style={cardStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-full"
      >
        {children}
        <div
          aria-hidden
          className="absolute inset-0 rounded-[24px] pointer-events-none overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}) 0%, transparent 65%)`,
            transition:
              "background 0.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s",
          }}
        />
      </div>
    </div>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#edf2ee] flex items-center justify-center rounded-[28px] size-14 shrink-0">
      {children}
    </div>
  );
}

function IconUserPlus({ color = "#153322" }: { color?: string }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" width="24" height="24">
      <path d={svgPaths.p1dc7d800} stroke={color} strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
function IconSearch({ color = "#153322" }: { color?: string }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" width="24" height="24">
      <path d={svgPaths.p1cfabb40} stroke={color} strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
function IconGift({ color = "#153322" }: { color?: string }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" width="24" height="24">
      <path d={svgPaths.p12e12c00} stroke={color} strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
function IconCircleCheck({ color = "#4AA366" }: { color?: string }) {
  return (
    <svg fill="none" viewBox="0 0 18 18" width="18" height="18" className="shrink-0">
      <clipPath id="cc">
        <rect fill="white" height="18" width="18" />
      </clipPath>
      <g clipPath="url(#cc)">
        <path d={svgPaths.p1e29ca40} stroke={color} strokeLinecap="round" strokeWidth="2" />
      </g>
    </svg>
  );
}
function IconCircleX({ color = "#153322" }: { color?: string }) {
  return (
    <svg fill="none" viewBox="0 0 20 20" width="20" height="20">
      <clipPath id="cx">
        <rect fill="white" height="20" width="20" />
      </clipPath>
      <g clipPath="url(#cx)">
        <path d={svgPaths.p30a06080} stroke={color} strokeLinecap="round" strokeWidth="2" />
      </g>
    </svg>
  );
}
function IconChevronRight({ color = "white" }: { color?: string }) {
  return (
    <svg fill="none" viewBox="0 0 16 16" width="16" height="16">
      <path d="M6 12L10 8L6 4" stroke={color} strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function PrimaryBtn({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-7 py-4 rounded-full bg-[#153322] text-white text-base font-bold hover:bg-[#1e4630] transition-colors cursor-pointer"
      style={{ fontFamily: "'Figtree', sans-serif" }}
    >
      {label}
      <IconChevronRight />
    </button>
  );
}

function GhostBtn({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <button
      className="flex items-center px-7 py-4 rounded-full border text-base font-semibold transition-colors cursor-pointer"
      style={{
        fontFamily: "'Figtree', sans-serif",
        borderColor: dark ? "#ccd8d1" : "#ccd8d1",
        color: dark ? "#f5faf2" : "#153322",
        background: "transparent",
      }}
    >
      {label}
    </button>
  );
}



// ─── Hero Section (Sticky Curtain) ────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      className="sticky top-0 min-h-screen overflow-hidden bg-[#153322]"
      style={{ zIndex: 10 }}
    >
      {/* Hero content area */}
      <div className="relative w-full h-screen" style={{ minHeight: "720px" }}>
        {/* Background video */}
        <video
          src="/features/untitled_video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Top left hero copy */}
        <div className="absolute left-6 top-28 lg:left-32 w-[calc(100%-48px)] lg:w-auto z-10">
          <p
            className="text-[#4aa366] leading-none"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(64px, 7vw, 112px)",
            }}
          >
            Nutri
          </p>
          <p
            className="text-white leading-none -mt-4 ml-16 lg:ml-28"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 400,
              fontSize: "clamp(64px, 7vw, 112px)",
            }}
          >
            Safe
          </p>
        </div>

        {/* Middle left hero copy */}
        <div className="absolute w-full lg:w-auto left-0 lg:left-32 top-[55%] -translate-y-1/2 flex flex-col items-center lg:items-start text-center lg:text-left px-4 lg:px-0">
          <p
            className="leading-tight"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 400,
              fontSize: "clamp(36px, 4.5vw, 56px)",
            }}
          >
            <span className="text-[#4aa366]">Eat</span>{" "}
            <span className="text-white">What You Want</span>
          </p>
          <p
            className="text-white leading-tight lg:ml-32 mt-2 lg:mt-0"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: "clamp(36px, 4.5vw, 56px)",
            }}
          >
            Just, Safe
          </p>
        </div>

        {/* Right hero copy */}
        <div className="absolute w-full lg:w-auto right-0 lg:right-32 bottom-7 flex flex-col items-center lg:items-end text-center lg:text-right px-4 lg:px-0">
          <p
            className="leading-tight"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(32px, 4vw, 56px)",
            }}
          >
            <span className="text-white">Your </span>
            <span className="text-[#4aa366]">healthy</span>
          </p>
          <p
            className="text-white leading-tight mt-1"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(32px, 4vw, 56px)",
            }}
          >
            alternative
          </p>
          <p
            className="mt-4"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 400,
              fontSize: "clamp(28px, 3vw, 44px)",
            }}
          >
            <span className="text-white">A </span>
            <span className="text-[#4aa366]">pocket</span>
            <span className="text-white"> advisor</span>
          </p>
        </div>


      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    icon: <IconUserPlus />,
    step: "01",
    title: "Build Health Profile",
    desc: "Securely add your conditions, allergies, and diet preferences to get personalized analysis.",
  },
  {
    icon: <IconSearch />,
    step: "02",
    title: "Scan or Type",
    desc: "Barcode scan, upload a label photo for OCR, or use manual input to fetch ingredients.",
  },
  {
    icon: <IconGift />,
    step: "03",
    title: "Instant Verdict",
    desc: "Get a clear Good Fit, Use Caution, or Not Recommended verdict with plain-language AI explanations per ingredient.",
  },
  {
    icon: <IconCircleCheck color="#153322" />,
    step: "04",
    title: "Safe Alternatives",
    desc: "Discover low-risk foods and build a custom list of safe choices tailored to you.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative bg-white scroll-mt-24" style={{ zIndex: 20 }}>
      {/* Section header */}
      <div className="border-t border-b border-[#e4ece6] py-10 flex justify-center">
        <h2
          className="text-4xl lg:text-[48px] text-black uppercase"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
          }}
        >
          How It Works
        </h2>
      </div>

      {/* Step cards */}
      <div className="px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1360px] mx-auto">
        {HOW_IT_WORKS.map((item) => (
          <div
            key={item.step}
            className="relative flex flex-col gap-6 p-10 rounded-[24px] bg-[#e1f2e7] border border-[#e4ece6]"
          >
            <div className="flex items-center justify-between">
              <IconWrapper>{item.icon}</IconWrapper>
              <span
                className="text-[32px] text-[#99bfa6]"
                style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}
              >
                {item.step}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <p
                className="text-[#153322] text-xl"
                style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}
              >
                {item.title}
              </p>
              <p
                className="text-[#5f6b63] text-[15px] leading-6"
                style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 400 }}
              >
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────

function FeatureMarquee({
  cards,
}: {
  cards: { title: string; desc: string; icon: React.ReactNode; cta: string; image: string }[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const progressRef = useRef(0);

  // Triple the cards for smooth infinite scroll
  const displayCards = [...cards, ...cards, ...cards];
  const CARD_WIDTH = 280;
  const GAP = 24;
  const SET_WIDTH = cards.length * (CARD_WIDTH + GAP);

  useEffect(() => {
    let animationFrameId: number;
    
    const update = () => {
      if (!isHovered) {
        progressRef.current -= 1; // Speed
        if (Math.abs(progressRef.current) >= SET_WIDTH) {
          progressRef.current = 0; // Reset seamlessly
        }
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${progressRef.current}px, 0, 0)`;
        
        // Calculate scale for each card
        const windowCenter = window.innerWidth / 2;
        const cardElements = trackRef.current.children;
        
        for (let i = 0; i < cardElements.length; i++) {
          const card = cardElements[i] as HTMLElement;
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          
          // Distance from center
          const dist = Math.abs(windowCenter - cardCenter);
          const maxDist = window.innerWidth / 1.5; // Wider falloff
          
          // Scale logic: 1.05 at center, 0.85 at edges
          let scale = 1.05 - (dist / maxDist) * 0.2;
          if (scale < 0.85) scale = 0.85;
          if (scale > 1.05) scale = 1.05;
          
          let opacity = 1 - (dist / maxDist) * 0.4;
          if (opacity < 0.3) opacity = 0.3;
          if (opacity > 1) opacity = 1;

          card.style.transform = `scale(${scale})`;
          card.style.opacity = opacity.toString();
        }
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, SET_WIDTH]);

  return (
    <div 
      className="relative w-full overflow-hidden py-12" 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div 
        ref={trackRef} 
        className="flex items-center gap-[24px]" 
        style={{ width: 'max-content', willChange: 'transform' }}
      >
        {displayCards.map((card, i) => (
          <div 
            key={i} 
            className="relative w-[280px] h-[400px] flex-shrink-0 bg-white rounded-[32px] p-2 flex flex-col justify-between cursor-pointer shadow-xl transition-all duration-300"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="relative w-full h-[45%] rounded-[24px] overflow-hidden bg-slate-100">
              <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
              <div className="absolute top-3 left-3 size-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-[#153322]">
                {card.icon}
              </div>
            </div>
            <div className="flex flex-col relative z-10 flex-1 p-5">
              <h3 className="text-[20px] font-bold text-[#153322] mb-2 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>{card.title}</h3>
              <p className="text-[14px] text-[#5f6b63] leading-relaxed flex-1" style={{ fontFamily: "'Figtree', sans-serif" }}>{card.desc}</p>
              <Link
                href="/auth/signup"
                className="block w-full py-3 mt-4 rounded-[16px] bg-[#153322] text-white font-bold text-[14px] text-center transition-all hover:bg-[#b75233]"
                style={{ fontFamily: "'Figtree', sans-serif" }}
              >
                {card.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturesSection() {
  const cards = [
    { title: "AI-Powered Analysis", desc: "Every ingredient analyzed by NutriSafe AI against your health profile.", icon: <IconCircleCheck color="currentColor" />, cta: "Try It Free", image: "/features/card_dietary_filters_1787225989249.jpg" },
    { title: "Allergen Detection", desc: "Instantly flags allergens like Nuts, Gluten, Dairy, Soy, and more.", icon: <IconSearch color="currentColor" />, cta: "Try It Free", image: "/features/card_allergen_alerts_1787226002275.jpg" },
    { title: "Real-Time Parse", desc: "Decodes complex ingredients into plain language.", icon: <IconCircleX color="currentColor" />, cta: "Try It Free", image: "/features/card_ingredient_breakdown_1787226032562.jpg" },
    { title: "Personalized Verdicts", desc: "Tailored fit ratings for conditions like Diabetes, Hypertension, or PCOS.", icon: <IconUserPlus color="currentColor" />, cta: "Try It Free", image: "/features/card_health_sync_1787226059744.jpg" },
    { title: "Photo OCR Scan", desc: "Just snap a picture of a label and let AI extract the ingredients.", icon: <IconGift color="currentColor" />, cta: "Try It Free", image: "/features/card_meal_intel_1787226084980.jpg" },
    { title: "Scan History", desc: "Keep track of past scans and easily build your list of safe foods.", icon: <IconCircleCheck color="currentColor" />, cta: "Try It Free", image: "/features/card_special_modes_1787226448509.jpg" },
  ];

  return (
    <section
      id="features"
      className="sticky top-0 w-full min-h-screen bg-[#E1F2E7] pt-24 lg:pt-32 overflow-hidden flex flex-col justify-between scroll-mt-24"
      style={{
        zIndex: 20,
        backgroundImage: 'linear-gradient(to right, rgba(21, 51, 34, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(21, 51, 34, 0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}
    >
      {/* Top: Heading */}
      <div className="w-full flex flex-col items-start px-10 lg:px-20 relative z-10">
        <h2
          className="text-[#153322] uppercase leading-none flex flex-col w-full max-w-[400px]"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          <span className="text-[64px] lg:text-[100px] font-bold text-left">Features</span>
          <span className="text-[24px] lg:text-[36px] font-medium opacity-80 mt-2 text-left">We Offer</span>
        </h2>
      </div>
      
      {/* Bottom: Marquee Cards */}
      <div className="w-full flex-1 flex flex-col items-center justify-center pb-12 lg:pb-20 relative z-10 mt-8">
        <FeatureMarquee cards={cards} />
      </div>
    </section>
  );
}

// ─── Pricing Section ──────────────────────────────────────────────────────────

type PricingFeature = string;

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: PricingFeature[];
  cta: string;
  highlight: boolean;
  badge?: string;
}

const PLANS: PricingPlan[] = [
  {
    name: "Free Scanner",
    price: "₹0",
    period: "",
    desc: "Everything you need to check a product against your health profile before you buy.",
    features: [
      "Health profile: conditions, allergies, diet",
      "Barcode scanning via Open Food Facts",
      "Label photo OCR & manual ingredient entry",
      "NutriSafe AI fit analysis (Good Fit / Use Caution / Not Recommended)",
      "Scan history & Safe for Me list",
      "10 scans/day, 15 AI chat messages/day",
    ],
    cta: "Start Scanning Free",
    highlight: false,
  },
  {
    name: "NutriSafe Premium",
    price: "₹500",
    period: "/month",
    desc: "Higher limits, plus the AI Diet & Workout Plan generator.",
    features: [
      "60 scans/day, 60 AI chat messages/day",
      "Up to 10 AI diet & workout plans per month",
      "Save and edit unlimited saved plans",
      "Advanced ingredient risk analysis",
      "Priority NutriSafe AI generation speed",
      "30 days of access per payment — renew anytime",
    ],
    cta: "Upgrade to Premium",
    highlight: true,
    badge: "MOST POPULAR",
  },
];

function PricingCard({ plan }: { plan: PricingPlan }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const baseScale = plan.highlight ? 1.05 : 1;
  const [transform, setTransform] = useState(`rotateY(0deg) rotateX(0deg) scale3d(${baseScale}, ${baseScale}, 1) translateZ(0px)`);
  const [transition, setTransition] = useState("transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)");

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cardWidth = rect.width;
    const cardHeight = rect.height;
    
    const midPointX = cardWidth / 2;
    const midPointY = cardHeight / 2;
    
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    
    const maxAngleY = 15;
    const maxAngleX = 5;
    
    const rotateY = (cursorX - midPointX) * (maxAngleY / (cardWidth / 2));
    const rotateX = (cursorY - midPointY) * (maxAngleX / (cardHeight / 2));

    setTransform(`rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale3d(${baseScale + 0.05}, ${baseScale + 0.05}, 1.05) translateZ(50px)`);
    setTransition("transform 0.1s linear");
  }, [prefersReduced, baseScale]);

  const handleMouseLeave = useCallback(() => {
    setTransform(`rotateY(0deg) rotateX(0deg) scale3d(${baseScale}, ${baseScale}, 1) translateZ(0px)`);
    setTransition("transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)");
  }, [baseScale]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`flex flex-col gap-8 p-10 rounded-[24px] h-full ${plan.highlight ? 'z-10' : 'z-0'}`}
      style={{
        background: plan.highlight ? "#153322" : "white",
        border: plan.highlight ? "1px solid transparent" : "1px solid #e4ece6",
        boxShadow: plan.highlight ? "0 16px 40px rgba(21,51,34,0.18)" : "none",
        transform,
        transition,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p
            className="text-lg"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              color: plan.highlight ? "#4aa366" : "#153322",
            }}
          >
            {plan.name}
          </p>
          {plan.badge && (
            <span
              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#4aa366] text-[#153322]"
              style={{ fontFamily: "'Figtree', sans-serif" }}
            >
              {plan.badge}
            </span>
          )}
        </div>

        <div>
          <span
            className="text-[44px] leading-none"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              color: plan.highlight ? "white" : "#153322",
            }}
          >
            {plan.price}
          </span>
          <span
            className="text-base ml-1"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 500,
              color: plan.highlight ? "#ccd8d1" : "#5f6b63",
            }}
          >
            {plan.period}
          </span>
        </div>

        <p
          className="text-[14px] leading-5"
          style={{
            fontFamily: "'Figtree', sans-serif",
            color: plan.highlight ? "#ccd8d1" : "#5f6b63",
          }}
        >
          {plan.desc}
        </p>
      </div>

      {/* Divider */}
      <div
        className="h-px w-full"
        style={{
          background: plan.highlight ? "rgba(255,255,255,0.12)" : "#e4ece6",
        }}
      />

      {/* Features */}
      <div className="flex flex-col gap-4 flex-1">
        {plan.features.map((feat) => (
          <div key={feat} className="flex items-start gap-3">
            <div className="mt-0.5">
              <IconCircleCheck color={plan.highlight ? "white" : "currentColor"} />
            </div>
            <p
              className="text-[14px] leading-5"
              style={{
                fontFamily: "'Figtree', sans-serif",
                color: plan.highlight ? "white" : "#1f2421",
              }}
            >
              {feat}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/auth/signup"
        className="block w-full py-4 rounded-full text-base font-bold transition-all cursor-pointer hover:opacity-90 mt-auto text-center"
        style={{
          fontFamily: "'Figtree', sans-serif",
          background: plan.highlight ? "#4aa366" : "#153322",
          color: "white",
        }}
      >
        {plan.cta}
      </Link>
    </div>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="relative bg-[#f9f8f3] scroll-mt-24" style={{ zIndex: 20 }}>
      <div className="px-10 lg:px-20 py-24 max-w-[1440px] mx-auto flex flex-col gap-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-4">
          <h2
            className="text-[#153322] text-[40px] text-center max-w-[600px] leading-tight"
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}
          >
            Start Free, Unlock Full AI Diet &amp; Workout Plans Anytime
          </h2>
        </div>

        {/* Cards */}
        <div 
          className="flex flex-col lg:flex-row gap-6 items-center justify-center lg:items-center py-10"
          style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
        >
          {PLANS.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        <p
          className="text-center text-sm text-[#5f6b63] -mt-8"
          style={{ fontFamily: "'Figtree', sans-serif" }}
        >
          Daily and monthly limits reset automatically — see the full breakdown in our{" "}
          <Link href="/legal/fair-usage" className="underline hover:text-[#153322]">
            Fair Usage Policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCtaSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ zIndex: 20, background: "#153322" }}
    >
      {/* BG Image */}
      <img
        src={CTA_BG}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />
      <div
        className="absolute inset-0"
        style={{ background: "rgba(21,51,34,0.88)" }}
      />

      <div className="relative flex flex-col lg:flex-row items-center gap-20 px-10 lg:px-20 py-24 max-w-[1440px] mx-auto min-h-[551px]">
        {/* Left copy */}
        <div className="flex-1 flex flex-col gap-6">
          <h2
            className="text-white text-[40px] lg:text-[48px] leading-[1.15]"
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}
          >
            Never Choose Between Joy and Your Health Again
          </h2>
          <p
            className="text-[#ccd8d1] text-[18px] leading-7 max-w-[560px]"
            style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 400 }}
          >
            Built for people managing diabetes, PCOS, allergies, and other dietary
            constraints — with safety, certainty, and flavor.
          </p>
          <div className="flex flex-wrap gap-4 pt-3">
            <Link href="/auth/signup">
              <PrimaryBtn label="Build Free Health Profile" />
            </Link>
            <Link href="/auth/signin">
              <GhostBtn label="Chat with NutriSafe AI" dark />
            </Link>
          </div>
        </div>

        {/* Right image */}
        <div className="shrink-0 rounded-[24px] overflow-hidden w-full lg:w-[480px] h-[360px]">
          <img
            src={FOOD_IMG}
            alt="Nutritious meal bowl with colorful vegetables"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

const FOOTER_SOLUTIONS = ["Diabetes Management", "PCOS Diet", "Nut & Allergen Guard", "Gluten-Free"];
const FOOTER_POWERED_BY = ["Open Food Facts Barcode Data", "NutriSafe AI Ingredient Analysis"];
const FOOTER_LEGAL = [
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Refund Policy", href: "/legal/refund-policy" },
  { label: "Fair Usage Policy", href: "/legal/fair-usage" },
];

function Footer() {
  return (
    <footer
      className="relative bg-[#153322]"
      style={{ zIndex: 20 }}
    >
      <div className="px-10 lg:px-20 pt-20 pb-10 max-w-[1440px] mx-auto flex flex-col gap-16">
        <div className="flex flex-col lg:flex-row justify-between gap-16">
          {/* Brand */}
          <div className="flex flex-col gap-6 max-w-[320px]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-[#4aa366]">
                <IconCircleX />
              </div>
              <span
                className="text-white text-[22px] font-extrabold"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                NutriSafe
              </span>
            </div>
            <p
              className="text-[#ccd8d1] text-[14px] leading-[22px]"
              style={{ fontFamily: "'Figtree', sans-serif" }}
            >
              AI-analyzed food safety insights, tailored dynamically for
              chronic conditions, food sensitivities, and allergen safety.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-16">
            <div className="flex flex-col gap-4 w-[180px]">
              <p
                className="text-[#4aa366] text-[15px] font-bold"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Solutions
              </p>
              <div className="flex flex-col gap-3">
                {FOOTER_SOLUTIONS.map((link) => (
                  <Link
                    key={link}
                    href="/auth/signup"
                    className="text-white text-[14px] hover:text-[#4aa366] transition-colors"
                    style={{ fontFamily: "'Figtree', sans-serif" }}
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4 w-[220px]">
              <p
                className="text-[#4aa366] text-[15px] font-bold"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Powered By
              </p>
              <div className="flex flex-col gap-3">
                {FOOTER_POWERED_BY.map((item) => (
                  <span
                    key={item}
                    className="text-[#ccd8d1] text-[14px]"
                    style={{ fontFamily: "'Figtree', sans-serif" }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4 w-[180px]">
              <p
                className="text-[#4aa366] text-[15px] font-bold"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Legal
              </p>
              <div className="flex flex-col gap-3">
                {FOOTER_LEGAL.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-white text-[14px] hover:text-[#4aa366] transition-colors"
                    style={{ fontFamily: "'Figtree', sans-serif" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.13)" }} />

        {/* Bottom bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <p
            className="text-[#ccd8d1] text-[12px]"
            style={{ fontFamily: "'Figtree', sans-serif" }}
          >
            © 2026 NutriSafe. All rights reserved.
          </p>
          <p
            className="text-[#ccd8d1] text-[11px] leading-relaxed lg:text-right max-w-[600px]"
            style={{ fontFamily: "'Figtree', sans-serif" }}
          >
            Disclaimer: NutriSafe and its AI system are designed for supplemental dietary
            exploration. Always coordinate with your doctor or dietitian before making significant dietary changes if managing chronic illnesses.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="relative bg-white">
      {/* GLOBAL NAVBAR */}
      <LandingNav />

      {/* HERO — sticky, sits behind scrolling content */}
      <HeroSection />

      {/* Spacer to increase scroll duration before Features slide up */}
      <div className="w-full h-[75vh] pointer-events-none" />

      {/* FEATURES — sticky, slides over hero, sits behind remaining content */}
      <FeaturesSection />

      {/* Spacer to increase scroll duration before remaining content slides up */}
      <div className="w-full h-[75vh] pointer-events-none" />

      {/* CONTENT — slides up over the features */}
      <div className="relative" style={{ zIndex: 30, background: "white" }}>
        <HowItWorksSection />
        <PricingSection />
        <FinalCtaSection />
        <Footer />
      </div>
    </div>
  );
}
