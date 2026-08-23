"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function IconChevronRight({ color = "white" }: { color?: string }) {
  return (
    <svg fill="none" viewBox="0 0 16 16" width="16" height="16">
      <path d="M6 12L10 8L6 4" stroke={color} strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

const LEGAL_LINKS = [
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Refund Policy", href: "/legal/refund-policy" },
  { label: "Fair Usage Policy", href: "/legal/fair-usage" },
];

export function LandingNav() {
  const navLinks = [
    { label: "How it Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
  ];
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      className={`fixed top-0 w-full flex justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] items-center px-6 lg:px-20 h-[95px] z-[100] transition-all duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{
        background: isScrolled ? "#153322" : "transparent",
        boxShadow: isScrolled ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 justify-self-start">
        <span
          className="text-white text-[32px] font-extrabold"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          NutriSafe
        </span>
      </div>

      {/* Nav links — true center column, independent of logo/CTA widths */}
      <div className="hidden lg:flex items-center gap-8 justify-self-center">
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
        <div className="group relative">
          <button
            type="button"
            className="flex items-center gap-1 text-white text-[15px] font-semibold hover:text-[#4aa366] transition-colors cursor-pointer"
            style={{ fontFamily: "'Figtree', sans-serif" }}
          >
            Legal
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="mt-px transition-transform group-hover:rotate-180">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-3 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
            <div
              className="flex w-56 flex-col overflow-hidden rounded-2xl border border-white/10 py-2 shadow-xl"
              style={{ background: "#153322" }}
            >
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2.5 text-[14px] text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  style={{ fontFamily: "'Figtree', sans-serif" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="flex items-center justify-self-end lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white p-2"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {/* CTA Desktop */}
      <div className="hidden lg:flex items-center gap-3 justify-self-end">
        <Link
          href="/auth/signin"
          className="px-7 py-4 text-white text-base font-semibold rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          style={{ fontFamily: "'Figtree', sans-serif" }}
        >
          Sign In
        </Link>
        <Link
          href="/auth/signup"
          className="flex items-center gap-2 px-7 py-4 rounded-full bg-[#153322] text-white text-base font-bold hover:bg-[#1e4630] transition-colors cursor-pointer border border-white/20"
          style={{ fontFamily: "'Figtree', sans-serif" }}
        >
          Check My Foods
          <IconChevronRight />
        </Link>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-[95px] left-0 w-full bg-[#153322] flex flex-col p-6 shadow-xl lg:hidden border-t border-white/10">
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-white text-lg font-semibold hover:text-[#4aa366] transition-colors"
                style={{ fontFamily: "'Figtree', sans-serif" }}
              >
                {link.label}
              </a>
            ))}

            <div className="flex flex-col gap-4 mt-2">
              <span className="text-white/60 text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "'Figtree', sans-serif" }}>Legal</span>
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/80 text-base font-medium hover:text-[#4aa366] transition-colors"
                  style={{ fontFamily: "'Figtree', sans-serif" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col mt-4 gap-4 border-t border-white/10 pt-8">
              <Link
                href="/auth/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-4 text-center text-white text-base font-semibold rounded-full border border-white/20 hover:bg-white/10 transition-colors"
                style={{ fontFamily: "'Figtree', sans-serif" }}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[#4aa366] text-[#153322] text-base font-bold hover:bg-[#3d8c56] transition-colors"
                style={{ fontFamily: "'Figtree', sans-serif" }}
              >
                Check My Foods
                <IconChevronRight color="#153322" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
