import Image from "next/image";
import Link from "next/link";

import { PageViewTracker } from "@/components/page-view-tracker";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fcf8f7] text-[#1c1b1b]">
      <PageViewTracker metadata={{ page: "landing" }} />
      <div className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col px-10">
        <header className="flex items-center py-10">
          <Image
            alt="기온별플리"
            className="h-auto w-[132px]"
            height={40}
            priority
            src="/images/gion-logo-transparent.png"
            width={132}
          />
        </header>

        <section className="flex flex-1 flex-col items-center justify-center pb-28 text-center">
          <Image
            alt="기온별플리"
            className="mb-16 h-auto w-full max-w-[370px]"
            height={290}
            priority
            src="/images/gion-logo-transparent.png"
            width={948}
          />

          <p className="mb-36 text-[21px] font-medium leading-[1.35] tracking-[-0.04em]">
            음악으로 기록하는 여러분의
            <br />
            계절을 공유해주세요 🎧
          </p>

          <Link
            className="flex h-16 w-full items-center justify-center rounded-full bg-[#1a1a1a] text-[22px] font-extrabold tracking-[-0.05em] text-white shadow-[0_24px_42px_rgba(0,0,0,0.16)] transition active:scale-95"
            href="/create"
          >
            시작하기
          </Link>
        </section>
      </div>
    </main>
  );
}
