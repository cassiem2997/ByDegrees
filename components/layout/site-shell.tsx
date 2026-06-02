import Link from "next/link";
import Image from "next/image";

export function SiteShell({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-temptracks-glow text-ink">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <header className="mb-8 flex justify-center py-4">
          <Link aria-label="기온별플리 홈" className="block" href="/">
            <Image
              alt="기온별플리"
              className="h-auto w-[132px]"
              height={40}
              priority
              src="/images/gion-logo-transparent.png"
              width={132}
            />
          </Link>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
