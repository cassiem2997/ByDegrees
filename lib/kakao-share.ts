const KAKAO_SDK_URL = "https://developers.kakao.com/sdk/js/kakao.js";

type KakaoShareOptions = {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
};

type KakaoSdk = {
  init: (javascriptKey: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (options: {
      objectType: "feed";
      content: {
        title: string;
        description: string;
        imageUrl: string;
        link: {
          mobileWebUrl: string;
          webUrl: string;
        };
      };
      buttons: Array<{
        title: string;
        link: {
          mobileWebUrl: string;
          webUrl: string;
        };
      }>;
    }) => void;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

function loadKakaoSdk() {
  if (window.Kakao) {
    return Promise.resolve();
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[src="${KAKAO_SDK_URL}"]`
  );

  if (existingScript) {
    return new Promise<void>((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(), { once: true });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.src = KAKAO_SDK_URL;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(), { once: true });
    document.head.appendChild(script);
  });
}

export async function shareToKakao({
  title,
  description,
  url,
  imageUrl
}: KakaoShareOptions) {
  const javascriptKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;

  if (!javascriptKey || typeof window === "undefined") {
    return false;
  }

  try {
    await loadKakaoSdk();

    if (!window.Kakao) {
      return false;
    }

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(javascriptKey);
    }

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description,
        imageUrl,
        link: {
          mobileWebUrl: url,
          webUrl: url
        }
      },
      buttons: [
        {
          title: "기온별플리 보기",
          link: {
            mobileWebUrl: url,
            webUrl: url
          }
        }
      ]
    });

    return true;
  } catch {
    return false;
  }
}
