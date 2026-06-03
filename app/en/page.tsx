import type { Metadata } from "next";

import { HomePageContent } from "@/components/home-page-content";
import { copy } from "@/lib/i18n/copy";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: copy.en.metadata.title,
  description: copy.en.metadata.description
};

export default function EnglishHomePage() {
  return <HomePageContent locale="en" />;
}
