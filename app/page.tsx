import Image from "next/image";
import Link from "next/link";

import { PageViewTracker } from "@/components/page-view-tracker";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fcf8f7] text-[#1c1b1b]">
      <PageViewTracker metadata={{ page: "landing" }} />
      <div className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col px-10">
        <section className="flex flex-1 flex-col items-center justify-center pb-28 pt-12 text-center">
          <Image
            alt="기온별플리 플레이리스트 생성 화면 목업"
            className="mb-10 h-auto w-full max-w-[270px] sm:max-w-[320px]"
            height={3096}
            priority
            src="/images/landing-mockup.png"
            width={1857}
          />

          <Link
            className="flex h-16 w-full items-center justify-center gap-3 rounded-full bg-[#1a1a1a] px-6 text-[21px] font-extrabold tracking-[-0.05em] text-white shadow-[0_24px_42px_rgba(0,0,0,0.16)] transition active:scale-95"
            href="/create"
          >
            <Image
              alt=""
              aria-hidden="true"
              className="h-auto w-[104px]"
              height={26}
              priority
              src="/images/gion-logo-transparent.png"
              width={104}
            />
            시작하기
          </Link>
        </section>
      </div>
    </main>
  );
}
