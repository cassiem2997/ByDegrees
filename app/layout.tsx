import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "By Degrees | 기온별플리",
  description: "기온에 맞는 노래를 직접 고르고 이미지로 공유하는 팬메이드 플레이리스트",
  openGraph: {
    title: "By Degrees | 기온별플리",
    description: "온도에 따라 노래를 배치하고 공유하는 팬메이드 플레이리스트",
    siteName: "By Degrees"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-mist font-[var(--font-body)] text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
