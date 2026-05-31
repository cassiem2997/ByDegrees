"use client";

import { toPng } from "html-to-image";

async function flattenDataUrlBackground(dataUrl: string, backgroundColor = "#fcf8f7") {
  const image = new Image();
  image.decoding = "async";
  image.src = dataUrl;

  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext("2d");
  if (!context) return dataUrl;

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const alpha = pixels[index + 3];

    if (alpha > 245 && red > 248 && green > 248 && blue > 248) {
      pixels[index] = 252;
      pixels[index + 1] = 248;
      pixels[index + 2] = 247;
    }
  }

  context.putImageData(imageData, 0, 0);

  return canvas.toDataURL("image/png");
}

export async function captureElementAsPngDataUrl(element: HTMLElement) {
  const dataUrl = await toPng(element, {
    backgroundColor: "#fcf8f7",
    cacheBust: true,
    pixelRatio: 2,
    skipFonts: true
  });

  return flattenDataUrlBackground(dataUrl);
}

export async function captureElementAsPngFile(element: HTMLElement, filename: string) {
  const dataUrl = await captureElementAsPngDataUrl(element);
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  return {
    dataUrl,
    file: new File([blob], filename, { type: "image/png" })
  };
}

export async function shareImageFile(file: File, title: string) {
  const shareData = {
    files: [file],
    title
  };

  if (!navigator.canShare?.(shareData)) {
    return false;
  }

  try {
    await navigator.share(shareData);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return true;
    }

    return false;
  }
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
