import { cn } from "@/lib/utils";

function IconFrame({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/80 shadow-[0_8px_20px_rgba(22,25,55,0.06)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function TankTop({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 40 40">
      <path
        d="M14 8c1.3 2 3 3 6 3s4.7-1 6-3l4 3-3 6v14H13V17l-3-6 4-3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function Tee({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 40 40">
      <path
        d="M10 12l6-4c1.5 1.4 2.6 2 4 2s2.5-.6 4-2l6 4-3 7-4-2v14H13V17l-4 2-3-7Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function Cardigan({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 40 40">
      <path
        d="M11 13l7-5c.8 1.3 1.5 1.8 2 1.8s1.2-.5 2-1.8l7 5-3 7-4-2v13H18V18l-4 13h-2V18l-4 2-3-7Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M20 12v19" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function Hoodie({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 40 40">
      <path
        d="M14 14c0-3.3 2.7-6 6-6s6 2.7 6 6v2l4 3-2 10H12l-2-10 4-3v-2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M17 17c1 1 1.8 1.5 3 1.5s2-.5 3-1.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function Coat({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 40 40">
      <path
        d="M14 9l6-2 6 2 3 8-3 3v11H14V20l-3-3 3-8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M20 10v21M16.5 15h7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function Scarf({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 40 40">
      <path
        d="M15 9c0 3 2.2 5 5 5 4.5 0 6.5 3 6.5 6.5S24.5 27 20 27c-3.7 0-6-2.6-6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M16 14v15c0 1.7 1.3 3 3 3h2V19c0-1.7-1.3-3-3-3h-2Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function Puffer({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 40 40">
      <path
        d="M13 13l7-5 7 5 2 7-3 2v9H14v-9l-3-2 2-7Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M14 18h12M14 22h12M20 13v18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

type TemperatureMoodIconsProps = {
  level: number;
};

const STYLES = [
  {
    text: "text-[#ff6c62]",
    badge: "from-[#ffe3df] to-[#eef6ff]",
    label: "한여름",
    icons: [TankTop, Tee]
  },
  {
    text: "text-[#ff8b4f]",
    badge: "from-[#ffe7d8] to-[#fff5e8]",
    label: "초가을",
    icons: [Tee, Cardigan]
  },
  {
    text: "text-[#ffb23e]",
    badge: "from-[#fff1d2] to-[#fff7e5]",
    label: "간절기",
    icons: [Cardigan, Tee]
  },
  {
    text: "text-[#8bb85b]",
    badge: "from-[#edf7df] to-[#f3faeb]",
    label: "선선함",
    icons: [Hoodie, Cardigan]
  },
  {
    text: "text-[#58b3d4]",
    badge: "from-[#def5fb] to-[#edfaff]",
    label: "초겨울",
    icons: [Coat, Cardigan]
  },
  {
    text: "text-[#5877df]",
    badge: "from-[#e1e8ff] to-[#eef2ff]",
    label: "차가움",
    icons: [Coat, Scarf]
  },
  {
    text: "text-[#4057d7]",
    badge: "from-[#dfe3ff] to-[#ecefff]",
    label: "한겨울",
    icons: [Puffer, Scarf]
  },
  {
    text: "text-[#5a4ed8]",
    badge: "from-[#ece5ff] to-[#f4efff]",
    label: "강추위",
    icons: [Puffer, Coat]
  }
] as const;

export function getTemperatureMoodStyle(level: number) {
  return STYLES[Math.min(Math.max(level - 1, 0), STYLES.length - 1)];
}

export function TemperatureMoodIcons({
  level
}: TemperatureMoodIconsProps) {
  const style = getTemperatureMoodStyle(level);

  return (
    <div className="flex items-center gap-2">
      {style.icons.map((Icon, index) => (
        <IconFrame key={`${style.label}-${index}`}>
          <Icon className={cn("h-6 w-6 sm:h-7 sm:w-7", style.text)} />
        </IconFrame>
      ))}
    </div>
  );
}
