import { LocalPreviewClient } from "@/components/local-preview-client";
import { PageViewTracker } from "@/components/page-view-tracker";

export default function PreviewPage() {
  return (
    <>
      <PageViewTracker metadata={{ page: "preview" }} />
      <LocalPreviewClient />
    </>
  );
}
