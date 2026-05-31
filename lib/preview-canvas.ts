import { BoardSongSlot, BoardSummary } from "@/lib/types";

const TEMPERATURE_EMOJIS = ["🥵", "🌞", "🌼", "🌱", "🍁", "🍂", "❄️", "🥶"];
const TEMPERATURE_COLORS = [
  "#ff6c62",
  "#ff8b4f",
  "#ffb23e",
  "#8bb85b",
  "#58b3d4",
  "#5877df",
  "#4057d7",
  "#5a4ed8"
];
const BACKGROUND = "#fcf8f7";

function compactSongs(songs: BoardSongSlot[]) {
  const filledSongs = songs.filter((song): song is NonNullable<BoardSongSlot> => Boolean(song));
  return [filledSongs[0] ?? null, filledSongs[1] ?? null, filledSongs[2] ?? null];
}

function titleFont(size: number, weight: number) {
  return `${weight} ${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  size: number,
  radius: number
) {
  const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
  const sw = size / scale;
  const sh = size / scale;
  const sx = (image.naturalWidth - sw) / 2;
  const sy = (image.naturalHeight - sh) / 2;

  ctx.save();
  drawRoundRect(ctx, x, y, size, size, radius);
  ctx.clip();
  ctx.drawImage(image, sx, sy, sw, sh, x, y, size, size);
  ctx.restore();
}

function truncateCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text;

  let next = text;
  while (next.length > 1 && ctx.measureText(`${next}…`).width > maxWidth) {
    next = next.slice(0, -1);
  }

  return `${next}…`;
}

function getSongTitleSize(title: string) {
  if (title.length <= 8) return 8.6;
  if (title.length <= 14) return 7.4;
  return 6.2;
}

function drawTitle(ctx: CanvasRenderingContext2D, title: string) {
  const displayTitle = title || "기온별 플리";
  const [mainTitle, nickname] = displayTitle.split(" by ");
  const byText = nickname ? ` by ${nickname}` : "";
  const mainTitleSize = 22;
  const byTextSize = mainTitleSize * 0.7;

  ctx.textBaseline = "alphabetic";
  ctx.font = titleFont(mainTitleSize, 800);
  const mainWidth = ctx.measureText(mainTitle).width;
  ctx.font = titleFont(byTextSize, 500);
  const byWidth = ctx.measureText(byText).width;
  let x = (370 - mainWidth - byWidth) / 2;

  ctx.font = titleFont(mainTitleSize, 800);
  ctx.fillStyle = "#1c1b1b";
  ctx.fillText(mainTitle, x, 32);
  x += mainWidth;

  if (byText) {
    ctx.font = titleFont(byTextSize, 500);
    ctx.fillStyle = "#4f4a47";
    ctx.fillText(byText, x, 32);
  }
}

export async function generateBoardPreviewDataUrl(board: BoardSummary) {
  const canvas = document.createElement("canvas");
  canvas.width = 740;
  canvas.height = 1316;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  ctx.scale(2, 2);
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, 370, 658);

  drawTitle(ctx, board.title);

  const gridX = 39;
  const gridY = 48;
  const rowHeight = 68;
  const rowGap = 6;
  const barHeight = rowHeight * 8 + rowGap * 7;
  const barX = gridX;
  const barWidth = 5;
  const songX = 104;
  const cardSize = 68;
  const cardGap = 8.5;

  const gradient = ctx.createLinearGradient(0, gridY, 0, gridY + barHeight);
  gradient.addColorStop(0, "#ff5e5e");
  gradient.addColorStop(0.15, "#ff985c");
  gradient.addColorStop(0.3, "#f2d559");
  gradient.addColorStop(0.5, "#63e68a");
  gradient.addColorStop(0.75, "#61a9f2");
  gradient.addColorStop(1, "#a17cf0");
  ctx.fillStyle = gradient;
  drawRoundRect(ctx, barX, gridY, barWidth, barHeight, 2.5);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#4f4a47";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(barX + barWidth / 2, gridY + 8, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const imageCache = new Map<string, HTMLImageElement | null>();
  const imageUrls = board.rows
    .flatMap((row) => row.songs)
    .filter((song): song is NonNullable<BoardSongSlot> => Boolean(song?.albumArtUrl))
    .map((song) => song.albumArtUrl);

  await Promise.all(
    Array.from(new Set(imageUrls)).map(async (url) => {
      imageCache.set(url, await loadImage(url));
    })
  );

  board.rows.forEach((row) => {
    const rowIndex = row.preset.sortOrder - 1;
    const rowY = gridY + rowIndex * (rowHeight + rowGap);
    const color = TEMPERATURE_COLORS[rowIndex] ?? "#1c1b1b";

    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = color;
    ctx.font = titleFont(11.5, 350);
    ctx.fillText(row.preset.label, 96, rowY + 12);
    ctx.font = titleFont(13, 400);
    ctx.fillText(TEMPERATURE_EMOJIS[rowIndex] ?? "", 96, rowY + 29);

    compactSongs(row.songs).forEach((song, slotIndex) => {
      if (!song) return;

      const cardX = songX + slotIndex * (cardSize + cardGap);
      const image = imageCache.get(song.albumArtUrl);

      ctx.fillStyle = "#ffffff";
      drawRoundRect(ctx, cardX, rowY, cardSize, cardSize, 6);
      ctx.fill();

      if (image) {
        drawCoverImage(ctx, image, cardX, rowY, cardSize, 6);
      }

      const fontSize = getSongTitleSize(song.title);
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.font = titleFont(fontSize, 800);
      const text = truncateCanvasText(ctx, song.title, cardSize - 4);
      const textX = cardX + cardSize / 2;
      const textY = rowY + cardSize - 7;
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(0,0,0,0.95)";
      ctx.lineWidth = 2.4;
      ctx.strokeText(text, textX, textY);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(text, textX, textY);
    });
  });

  ctx.textAlign = "center";
  ctx.font = titleFont(6.7, 600);
  ctx.fillStyle = "#b7b2af";
  ctx.fillText("© 2026 기온별플리 By Degrees. All rights reserved.", 185, 650);

  return canvas.toDataURL("image/png");
}
