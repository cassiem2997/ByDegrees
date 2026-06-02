import Image from "next/image";
import Link from "next/link";

import { MaintenanceNotificationForm } from "@/components/maintenance-notification-form";
import { PageViewTracker } from "@/components/page-view-tracker";

const SHOW_MAINTENANCE_NOTICE = true;

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fcf8f7] text-[#1c1b1b]">
      <PageViewTracker metadata={{ page: "landing" }} />
      <div
        className={[
          "mx-auto flex min-h-screen w-full max-w-[450px] flex-col px-10",
          SHOW_MAINTENANCE_NOTICE ? "opacity-35 blur-[1px]" : ""
        ].join(" ")}
      >
        <section className="flex flex-1 flex-col items-center justify-center pb-28 pt-12 text-center">
          <Image
            alt="음악으로 기록하는 여러분의 계절을 공유해주세요 🎧"
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
      {SHOW_MAINTENANCE_NOTICE ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fcf8f7]/58 px-8 backdrop-blur-[2px]">
          <section className="w-full max-w-[350px] rounded-[28px] border border-[#e1dbd8] bg-[#fcf8f7]/95 px-7 py-7 text-center shadow-[0_24px_60px_rgba(28,27,27,0.16)]">
            <p className="text-[34px] leading-none" aria-hidden="true">
              🚧
            </p>
            <h1 className="mt-4 text-[24px] font-extrabold tracking-[-0.06em] text-[#1c1b1b]">
              잠시 점검 중입니다
            </h1>
            <p className="mt-4 text-[15px] font-semibold leading-[1.55] tracking-[-0.04em] text-[#5f5e5e]">
              음악 검색 요청이 몰려 잠시 쉬어가고 있어요.
              <br />
              조금 뒤 다시 찾아와주세요.
            </p>
            <MaintenanceNotificationForm />
          </section>
        </div>
      ) : null}
    </main>
  );
}
