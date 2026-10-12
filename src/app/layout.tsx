import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { StructuredData } from "@/components/StructuredData";
import { SITE_URL, SITE_KEYWORDS, GOOGLE_VERIFICATION_TOKEN } from "@/lib/seo";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#153322",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NutriSafe – AI Food Safety & Personalized Diet Assistant",
    template: "%s | NutriSafe",
  },
  description:
    "Analyze packaged food ingredients against your health conditions and allergies. Get instant food fit verdicts (Good Fit, Use Caution, Not Recommended), plain-language ingredient explanations, and personalized Indian diet recommendations.",
  keywords: SITE_KEYWORDS,
  authors: [{ name: "NutriSafe Team" }],
  creator: "NutriSafe",
  publisher: "NutriSafe",
  applicationName: "NutriSafe",
  category: "Health & Fitness",
  alternates: {
    canonical: "/",
  },
  verification: {
    google: GOOGLE_VERIFICATION_TOKEN,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "NutriSafe",
    title: "NutriSafe – AI Food Safety & Personalized Diet Assistant",
    description:
      "Analyze packaged food ingredients against your health conditions and allergies. Instant personalized fit verdicts for Diabetes, Hypertension, PCOS, and Allergies.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "NutriSafe – AI Food Safety & Diet Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriSafe – AI Food Safety & Personalized Diet Assistant",
    description:
      "Analyze packaged food ingredients against Diabetes, Hypertension, PCOS, and allergies. Instant plain-language verdicts.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-slate-50 text-slate-900`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
