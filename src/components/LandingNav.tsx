"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export function IconChevronRight({ color = "white" }: { color?: string }) {
  return (
    <svg fill="none" viewBox="0 0 16 16" width="16" height="16">
      <path d="M6 12L10 8L6 4" stroke={color} strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function LandingNav() {
  const navLinks = [
    { label: "How it Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
  ];
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Update background state (transparent until we pass features section)
      setIsScrolled(currentScrollY > window.innerHeight * 3.5);

      // Update hidden state for smart scroll
      if (currentScrollY > lastScrollY.current && currentScrollY > 200) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY.current) {
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full flex items-center justify-between px-10 lg:px-20 h-[95px] z-[100] transition-all duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{
        background: isScrolled ? "#153322" : "transparent",
        boxShadow: isScrolled ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <span
          className="text-white text-[32px] font-extrabold"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          NutriSafe
        </span>
      </div>

      {/* Nav links */}
      <div className="hidden lg:flex items-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-white text-[15px] font-semibold hover:text-[#4aa366] transition-colors"
            style={{ fontFamily: "'Figtree', sans-serif" }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-3">
        <Link
          href="/auth/signin"
          className="px-7 py-4 text-white text-base font-semibold rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          style={{ fontFamily: "'Figtree', sans-serif" }}
        >
          Sign In
        </Link>
        <Link
          href="/auth/signup"
          className="flex items-center gap-2 px-7 py-4 rounded-full bg-[#153322] text-white text-base font-bold hover:bg-[#1e4630] transition-colors cursor-pointer"
          style={{ fontFamily: "'Figtree', sans-serif" }}
        >
          Check My Foods
          <IconChevronRight />
        </Link>
      </div>
    </nav>
  );
}
