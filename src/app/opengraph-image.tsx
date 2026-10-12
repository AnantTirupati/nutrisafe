import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NutriSafe – AI Food Safety & Diet Assistant";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #153322 0%, #0d2116 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#4aa366",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
              color: "#153322",
            }}
          >
            N
          </div>
          <span
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            NutriSafe
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 960 }}>
          <div
            style={{
              fontSize: 60,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            Personalized Food Safety &amp; AI Diet Assistant
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.4,
              color: "#ccd8d1",
              maxWidth: 820,
            }}
          >
            Instantly analyze packaged food ingredients against Diabetes, Hypertension, PCOS, and Allergies. Get plain-language health verdicts.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 24px",
              borderRadius: 999,
              background: "rgba(74, 163, 102, 0.2)",
              border: "1px solid #4aa366",
              color: "#4aa366",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            Good Fit • Use Caution • Not Recommended
          </div>
          <div style={{ fontSize: 20, color: "#99bfa6" }}>
            Barcode • Label Photo OCR • 10 Indian Languages
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
