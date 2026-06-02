import type { Metadata } from "next";

import "@/app/globals.css";

const siteTitle = "기온별플리 | By Degrees";
const siteDescription = "음악으로 기록하는 여러분의 계절을 공유해주세요 🎧";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  applicationName: siteTitle,
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: "/icon"
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: siteTitle,
    type: "website",
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: siteTitle
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/opengraph-image"]
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
