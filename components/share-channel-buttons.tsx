"use client";

type ShareChannelButtonsProps = {
  onInstagramShare: () => void | Promise<void>;
  onKakaoShare: () => void | Promise<void>;
  onXShare: () => void | Promise<void>;
};

export function ShareChannelButtons({
  onInstagramShare,
  onKakaoShare,
  onXShare
}: ShareChannelButtonsProps) {
  return (
    <div className="rounded-[30px] border border-black/[0.04] bg-white/72 px-6 py-5 text-center shadow-[0_18px_34px_rgba(0,0,0,0.07)] backdrop-blur-xl">
      <p className="text-[15px] font-bold tracking-[-0.03em] text-[#1c1b1b]">
        내 기온별플리 공유하기
      </p>
      <div className="mt-5 flex justify-center gap-5">
        <button
          aria-label="인스타그램 공유"
          className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-white text-[#1c1b1b] shadow-[0_10px_22px_rgba(0,0,0,0.08)] transition active:scale-95"
          onClick={onInstagramShare}
          type="button"
        >
          <img
            alt=""
            className="h-9 w-9 rounded-[10px] object-cover"
            src="/images/instagram_logo.svg"
          />
        </button>
        <button
          aria-label="X 공유"
          className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-white text-[#1c1b1b] shadow-[0_10px_22px_rgba(0,0,0,0.08)] transition active:scale-95"
          onClick={onXShare}
          type="button"
        >
          <img
            alt=""
            className="h-9 w-9 rounded-[9px] object-cover"
            src="/images/twitter_logo.avif"
          />
        </button>
        <button
          aria-label="카톡 공유"
          className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-white text-[#1c1b1b] shadow-[0_10px_22px_rgba(0,0,0,0.08)] transition active:scale-95"
          onClick={onKakaoShare}
          type="button"
        >
          <img
            alt=""
            className="h-9 w-9 rounded-[9px] object-cover"
            src="/images/kakaotalk_logo.jpg"
          />
        </button>
      </div>
    </div>
  );
}
