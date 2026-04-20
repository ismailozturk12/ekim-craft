import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F6F1E7",
          color: "#1A1F1C",
          fontFamily: "serif",
          fontSize: 90,
          fontWeight: 500,
          letterSpacing: "-0.03em",
        }}
      >
        <span>E</span>
        <span
          style={{
            background: "#BF6A3A",
            borderRadius: "50%",
            width: 12,
            height: 12,
            margin: "0 6px",
            alignSelf: "flex-end",
            marginBottom: 30,
          }}
        />
      </div>
    ),
    size,
  );
}
