import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 128,
  height: 128
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#fcf8f7",
          borderRadius: 28,
          display: "flex",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          width: "100%"
        }}
      >
        <div
          style={{
            bottom: 0,
            height: 18,
            left: 0,
            position: "absolute",
            width: "100%",
            background:
              "linear-gradient(90deg,#45b7f0 0%,#ffd24a 40%,#ff7a45 68%,#ee4b86 100%)"
          }}
        />
        <div
          style={{
            alignItems: "center",
            background: "white",
            border: "4px solid #2fb6ef",
            borderRadius: 999,
            color: "#ff6c62",
            display: "flex",
            fontFamily: "sans-serif",
            fontSize: 72,
            fontWeight: 900,
            height: 94,
            justifyContent: "center",
            lineHeight: 1,
            width: 94
          }}
        >
          기
        </div>
      </div>
    ),
    size
  );
}
