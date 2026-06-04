import { LocalPreviewClient } from "@/components/local-preview-client";
import { PageViewTracker } from "@/components/page-view-tracker";

export default function EnglishPreviewPage() {
  return (
    <>
      <PageViewTracker metadata={{ page: "preview_en" }} />
      <LocalPreviewClient locale="en" />
    </>
  );
}
