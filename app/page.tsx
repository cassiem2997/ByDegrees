import Image from "next/image";
import Link from "next/link";

import { PageViewTracker } from "@/components/page-view-tracker";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fcf8f7] text-[#1c1b1b]">
      <PageViewTracker metadata={{ page: "landing" }} />
      <div className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col px-10">
        <header className="flex items-center justify-between py-10">
          <Image
            alt="기온별플리"
            className="h-auto w-[132px]"
            height={40}
            priority
            src="/images/gion-logo-transparent.png"
            width={132}
          />
          <button className="text-[17px] font-bold tracking-[0.12em] text-[#8c8b89]" type="button">
            KOR | ENG
          </button>
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

          <p className="mb-36 text-[21px] font-medium tracking-[-0.04em]">
            음악으로 기억하는 나의 계절
          </p>

          <Link
            className="rounded-full bg-[#1a1a1a] px-16 py-7 text-[27px] font-extrabold tracking-[-0.04em] text-white shadow-[0_24px_45px_rgba(0,0,0,0.2)] transition active:scale-95"
            href="/create"
          >
            시작하기
          </Link>
        </section>
      </div>
    </main>
  );
}
