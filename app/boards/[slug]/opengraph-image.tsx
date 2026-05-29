import { ImageResponse } from "next/og";

import { getBoardBySlug } from "@/lib/db/queries";

export const runtime = "edge";
export const alt = "By Degrees board preview";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default async function Image({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background:
            "radial-gradient(circle at top left, rgba(255,122,109,0.26), transparent 30%), radial-gradient(circle at right top, rgba(106,184,255,0.22), transparent 34%), linear-gradient(180deg, #fff9f6 0%, #f8f8ff 46%, #eff7ff 100%)",
          padding: 42,
          color: "#171723",
          fontFamily: "sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            borderRadius: 36,
            background: "rgba(255,255,255,0.88)",
            border: "1px solid rgba(255,255,255,0.8)",
            padding: 32
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "inline-flex",
                  fontSize: 16,
                  background: "#171723",
                  color: "white",
                  borderRadius: 999,
                  padding: "8px 14px"
                }}
              >
                #기온별플리
              </div>
              <div style={{ fontSize: 44, fontWeight: 700 }}>
                {board?.title ?? "By Degrees"}
              </div>
              <div style={{ fontSize: 22, color: "rgba(23,23,35,0.62)" }}>
                {board?.artistName ?? "기온별플리"}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 18,
                color: "rgba(23,23,35,0.54)"
              }}
            >
              © 2026 기온별플리 (By Degrees)
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, flex: 1 }}>
            <div
              style={{
                width: 150,
                borderRadius: 28,
                background: "rgba(255,255,255,0.76)",
                padding: 18,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              {board?.rows.map((row) => (
                <div key={row.preset.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 999,
                      background: "#171723"
                    }}
                  />
                  <div style={{ fontSize: 16 }}>{row.preset.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {board?.rows.slice(0, 5).map((row) => (
                <div
                  key={row.preset.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    borderRadius: 28,
                    background: "rgba(255,255,255,0.76)",
                    padding: 12
                  }}
                >
                  {row.songs.map((song, index) => (
                    <div
                      key={`${row.preset.id}-${index}`}
                      style={{
                        width: 150,
                        height: 150,
                        borderRadius: 20,
                        overflow: "hidden",
                        background: song ? "#ddd" : "rgba(23,23,35,0.06)",
                        display: "flex"
                      }}
                    >
                      {song ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt={song.title}
                          src={song.albumArtUrl}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
