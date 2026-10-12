import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#153322",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#4aa366",
          borderRadius: 8,
          fontWeight: 800,
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
