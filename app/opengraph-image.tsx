import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "기온별플리 | By Degrees";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

const TEMPERATURES = ["28°C+", "27~23°C", "22~20°C", "19~17°C", "16~12°C", "11~9°C", "8~5°C", "4°C-"];
const COLORS = ["#ff6c62", "#ff8b4f", "#ffb23e", "#8bb85b", "#58b3d4", "#5877df", "#4057d7", "#5a4ed8"];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#fcf8f7",
          color: "#1c1b1b",
          fontFamily: "sans-serif",
          padding: 58
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            borderRadius: 42,
            background: "rgba(255,255,255,0.42)",
            border: "2px solid #eee7e3",
            padding: 48,
            gap: 54
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div
              style={{
                width: 12,
                height: 430,
                borderRadius: 999,
                background:
                  "linear-gradient(180deg,#ff5e5e 0%,#ff985c 15%,#f2d559 30%,#63e68a 50%,#61a9f2 75%,#a17cf0 100%)"
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 430 }}>
              {TEMPERATURES.map((temperature, index) => (
                <div
                  key={temperature}
                  style={{
                    display: "flex",
                    color: COLORS[index],
                    fontSize: 28,
                    fontWeight: 600,
                    lineHeight: 1
                  }}
                >
                  {temperature}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
            <div style={{ display: "flex", fontSize: 86, fontWeight: 900, letterSpacing: -7 }}>
              기온별플리
            </div>
            <div style={{ display: "flex", marginTop: 12, fontSize: 46, fontWeight: 700, color: "#4f4a47" }}>
              By Degrees
            </div>
            <div style={{ display: "flex", marginTop: 36, fontSize: 31, fontWeight: 600, color: "#6f6a67" }}>
              음악으로 기록하는 여러분의 계절을 공유해주세요
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
