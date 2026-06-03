import { CreateBoardClient } from "@/components/create-board-client";
import { PageViewTracker } from "@/components/page-view-tracker";
import { getTemperaturePresets } from "@/lib/db/queries";

export default async function EnglishCreatePage() {
  const presets = await getTemperaturePresets();

  return (
    <div className="min-h-screen bg-[#fcf8f7] text-ink">
      <PageViewTracker metadata={{ page: "create_en" }} />
      <CreateBoardClient locale="en" presets={presets} />
    </div>
  );
}
