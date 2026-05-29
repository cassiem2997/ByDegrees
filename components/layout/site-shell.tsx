import Link from "next/link";

export function SiteShell({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-temptracks-glow text-ink">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-full border border-white/60 bg-white/60 px-5 py-3 backdrop-blur">
          <Link className="flex items-center" href="/">
            <div>
              <p className="text-base font-semibold">기온별플리</p>
              <p className="text-xs text-ink/55">By Degrees</p>
            </div>
          </Link>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
