"use client";

import { toPng } from "html-to-image";

export async function captureElementAsPngDataUrl(element: HTMLElement) {
  return toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    skipFonts: true
  });
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
