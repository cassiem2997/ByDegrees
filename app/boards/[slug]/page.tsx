import Image from "next/image";
import { notFound } from "next/navigation";

import { BoardPreview } from "@/components/board-preview";
import { PageViewTracker } from "@/components/page-view-tracker";
import { ShareActions } from "@/components/share-actions";
import { absoluteUrl } from "@/lib/utils";
import { getBoardBySlug } from "@/lib/db/queries";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);

  if (!board) {
    return {};
  }

  return {
    title: `${board.title} | By Degrees`,
    description: `${board.artistName}의 기온별 팬메이드 플레이리스트`,
    openGraph: {
      title: `${board.title} | By Degrees`,
      description: `${board.artistName}의 기온별 팬메이드 플레이리스트`,
      images: [absoluteUrl(`/boards/${slug}/opengraph-image`)]
    }
  };
}

export default async function BoardResultPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);

  if (!board) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fcf8f7] text-[#1c1b1b]">
      <PageViewTracker metadata={{ page: "board", slug: board.slug }} />
      <div className="mx-auto min-h-screen w-full max-w-[450px] px-6 pb-24 pt-8 sm:px-10">
        <header className="mb-14 flex items-center justify-between">
          <Image
            alt="기온별플리"
            className="h-auto w-[124px]"
            height={38}
            src="/images/gion-logo-transparent.png"
            width={124}
          />
          <button className="text-[13px] font-bold tracking-[0.18em] text-[#8c8b89]" type="button">
            KOR <span className="mx-2 font-normal text-[#c6c2c0]">|</span> ENG
          </button>
        </header>

        <div id="board-capture">
          <BoardPreview
            artistName={board.artistName}
            rows={board.rows}
            title={board.title}
          />
        </div>

        <div className="mt-16">
          <ShareActions
            artistName={board.artistName}
            boardId={board.id}
            boardSlug={board.slug}
            boardTitle={board.title}
            captureId="board-capture"
          />
        </div>

      </div>
    </main>
  );
}
