import { SITE_URL } from "@/lib/seo";

export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": "NutriSafe",
        "alternateName": ["NutriSafe AI", "Nutri Safe", "NutriSafe App"],
        "description":
          "AI-driven food safety & personalized diet assistant for chronic health conditions and allergies.",
        "inLanguage": "en-IN",
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "NutriSafe",
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/icon.png`,
          "width": "512",
          "height": "512",
        },
        "sameAs": ["https://github.com/AnantTirupati/NutriSafe"],
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#webapp`,
        "name": "NutriSafe",
        "url": SITE_URL,
        "applicationCategory": "HealthApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "offers": [
          {
            "@type": "Offer",
            "name": "Free Scanner",
            "price": "0",
            "priceCurrency": "INR",
          },
          {
            "@type": "Offer",
            "name": "NutriSafe Premium",
            "price": "500",
            "priceCurrency": "INR",
          },
        ],
        "featureList": [
          "Barcode scanner for packaged food products",
          "Label photo OCR ingredient extraction",
          "Condition-specific risk verdicts: Good Fit, Use Caution, Not Recommended",
          "Support for Diabetes, Hypertension, PCOS, Thyroid, and 12+ conditions",
          "Deterministic allergen backstop for Nuts, Gluten, Dairy, Soy, Shellfish",
          "Multi-language support in 10 Indian languages and English",
          "AI-generated personalized Indian diet & workout plans",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is NutriSafe?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "NutriSafe is an AI-powered food safety and personalized diet assistant. It analyzes ingredients in packaged foods against your specific health conditions (like Diabetes, Hypertension, PCOS) and allergies to deliver an instant verdict: Good Fit, Use Caution, or Not Recommended.",
            },
          },
          {
            "@type": "Question",
            "name": "How does NutriSafe check packaged foods?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "NutriSafe provides three input methods: barcode scanning via Open Food Facts and web search, ingredient label photo OCR using advanced vision AI, or direct manual text input.",
            },
          },
          {
            "@type": "Question",
            "name": "Does NutriSafe guarantee allergen detection?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. NutriSafe uses a deterministic allergen safety backstop that cross-checks all declared allergies (such as peanuts, tree nuts, gluten, lactose, soy, and eggs) against extensive alias lists. If any declared allergen is detected, the product is immediately flagged as Not Recommended.",
            },
          },
          {
            "@type": "Question",
            "name": "Does NutriSafe support Indian packaged foods and Indian languages?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. NutriSafe is built India-first, with dedicated support for Indian packaged foods and analysis output in English and 10 Indian languages including Hindi, Marathi, Gujarati, Tamil, Telugu, Kannada, Malayalam, Bengali, and Punjabi.",
            },
          },
          {
            "@type": "Question",
            "name": "Is NutriSafe free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. NutriSafe offers a generous free tier including 10 ingredient scans per day, 15 AI health chatbot messages per day, scan history, and custom safe food lists. A Premium tier is available for higher limits and custom AI meal plans.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
