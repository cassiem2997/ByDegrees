import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";

import { MaintenanceNotificationForm } from "@/components/maintenance-notification-form";
import { PageViewTracker } from "@/components/page-view-tracker";
import { getMaintenanceNoticeState } from "@/lib/db/maintenance-notice";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const maintenanceNotice = await getMaintenanceNoticeState();
  const showMaintenanceNotice = maintenanceNotice.active;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fcf8f7] text-[#1c1b1b]">
      <PageViewTracker metadata={{ page: "landing" }} />
      <a
        className="fixed right-4 top-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-[#e1dbd8] bg-[#fcf8f7]/86 px-3.5 py-2 text-[13px] font-bold tracking-[-0.04em] text-[#5f5e5e] shadow-[0_10px_28px_rgba(28,27,27,0.08)] backdrop-blur transition hover:border-[#1c1b1b]/18 hover:text-[#1c1b1b] focus:outline-none focus:ring-2 focus:ring-[#1c1b1b]/15"
        href="mailto:adminbydegrees@gmail.com?subject=%EA%B8%B0%EC%98%A8%EB%B3%84%ED%94%8C%EB%A6%AC%20%EB%AC%B8%EC%9D%98"
      >
        <Mail aria-hidden="true" className="h-3.5 w-3.5" />
        문의하기
      </a>
      <div
        className={[
          "mx-auto flex min-h-screen w-full max-w-[450px] flex-col px-10",
          showMaintenanceNotice ? "opacity-35 blur-[1px]" : ""
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
      {showMaintenanceNotice ? (
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
