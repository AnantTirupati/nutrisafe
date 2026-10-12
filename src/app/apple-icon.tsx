import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 108,
          background: "#153322",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#4aa366",
          borderRadius: 36,
          fontWeight: 800,
          border: "4px solid rgba(74, 163, 102, 0.4)",
        }}
      >
        N
      </div>
    ),
    {
      ...size,
    }
  );
}
