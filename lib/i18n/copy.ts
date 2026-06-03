export const SUPPORTED_LOCALES = ["ko", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ko";

export function isLocale(value: string | null | undefined): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function getCopy(locale: string | null | undefined = DEFAULT_LOCALE) {
  return copy[isLocale(locale) ? locale : DEFAULT_LOCALE];
}

export const copy = {
  ko: {
    common: {
      appName: "기온별플리",
      appNameWithEnglish: "기온별플리 | By Degrees",
      contact: "문의하기",
      close: "닫기",
      cancel: "취소",
      add: "추가하기",
      search: "검색",
      save: "저장",
      retry: "다시 시도해주세요.",
      copied: "복사됨",
      copyLink: "링크 복사"
    },
    landing: {
      heroAlt: "음악으로 기록하는 여러분의 계절을 공유해주세요 🎧",
      start: "시작하기",
      contactSubject: "기온별플리 문의",
      maintenanceTitle: "잠시 점검 중입니다",
      maintenanceDescription: "음악 검색 요청이 몰려 잠시 쉬어가고 있어요.\n조금 뒤 다시 찾아와주세요."
    },
    maintenanceNotification: {
      button: "점검 완료 알림 받기",
      title: "점검 완료 알림",
      description: "점검 완료 시 메일로 안내드려요.",
      emailPlaceholder: "email@example.com",
      submit: "알림 신청하기",
      success: "점검 완료 시 메일로 안내드려요.",
      invalidEmail: "이메일 주소를 확인해주세요.",
      saveFailed: "알림 신청을 저장하지 못했어요. 잠시 후 다시 시도해주세요.",
      requestFailed: "알림 신청에 실패했어요.",
      networkFailed: "네트워크 오류로 알림 신청에 실패했어요.",
      privacy:
        "입력한 이메일은 점검 완료 1회 안내 목적으로만 수집합니다. 메일 발송 후 발송 여부 기록과 함께 3일간 보관되며, 이후에는 즉시 삭제됩니다."
    },
    create: {
      backToLanding: "랜딩 페이지로 돌아가기",
      nicknameTitle: "이름 또는 닉네임을\n적어주세요",
      next: "다음 단계로",
      previous: "이전 단계",
      modeTitle: "플레이리스트를\n이렇게 구성하고 싶어요",
      singleArtistMode: "모두 같은 아티스트의 곡으로",
      multiArtistMode: "다양한 아티스트의 곡으로",
      artistTitle: "아티스트를\n선택해주세요",
      artistSearchPlaceholder: "아티스트명 검색",
      artistLoading: "아티스트를 불러오는 중",
      artistSearchError: "아티스트 검색 중 오류가 발생했습니다.",
      artistNetworkError: "네트워크 오류로 아티스트 검색에 실패했습니다.",
      multiArtistName: "다양한 아티스트",
      boardTitleFallback: "기온별 플리 by {nickname} 🎶",
      singleBoardTitle: "기온별 {artistName} by {nickname} 🎶",
      multiBoardTitle: "기온별 플레이리스트 by {nickname} 🎶",
      titlePlaceholder: "내 기온별 플레이리스트 제목",
      missingSongs: "모든 기온 구간에 한 곡 이상을 선택해주세요.",
      preview: "플레이리스트 미리보기",
      preparingImage: "이미지 준비 중...",
      previewFailed: "플레이리스트 미리보기를 준비하지 못했어요. 다시 시도해주세요.",
      imagePreviewFailed: "이미지 미리보기를 준비하지 못했어요. 다시 시도해주세요.",
      maintenanceTitle: "잠시 점검 중입니다",
      maintenanceDescription: "음악 검색 요청이 몰려\n잠시 쉬어가고 있어요.\n조금 뒤 다시 시도해주세요."
    },
    boardPreview: {
      titleFallback: "기온별 플리",
      titlePlaceholder: "기온별 플레이리스트",
      artistPlaceholder: "아티스트명 입력",
      brandText: "© 2026 기온별플리 By Degrees. All rights reserved."
    },
    searchDialog: {
      title: "곡 선택하기",
      placeholder: "곡명 또는 아티스트명으로 검색",
      loading: "곡을 불러오는 중",
      providerFooter: "iTunes 검색 결과를 불러옵니다.",
      searchError: "곡 검색 중 오류가 발생했습니다.",
      networkError: "네트워크 오류로 곡 검색에 실패했습니다.",
      duplicateTitle: "이미 추가한 곡입니다.",
      duplicateDescription: "그래도 추가하시겠어요?"
    },
    songCard: {
      replace: "다른 곡으로 교체",
      replaceAriaLabel: "{title} 교체하기"
    },
    share: {
      sectionTitle: "내 기온별플리 저장하기",
      buttonsTitle: "내 기온별플리 공유하기",
      xShare: "X 공유",
      xShareText: "음악으로 기록하는 여러분의 계절도 공유해주세요 🎧",
      linkShare: "링크 공유",
      linkCopied: "링크가 복사되었습니다.",
      longPressToSave: "이미지를 길게 눌러 사진 앱에 저장하세요.",
      previewLongPressLine1: "위 이미지를 길게 👆",
      previewLongPressLine2: "눌러 저장해주세요.",
      saveImageAlt: "{title} 저장용 이미지",
      hashtags: {
        base: "#기온별플리",
        englishBase: "#ByDegrees",
        artistPrefix: "#기온별",
        artistSuffix: "ByDegrees"
      },
      saveFailed: "이미지를 준비하지 못했어요. 새로고침 후 다시 시도해주세요.",
      previewPreparing: "이미지 미리보기를 준비 중이에요. 잠시 후 다시 눌러주세요."
    },
    localPreview: {
      noDataTitle: "미리보기 데이터가 없어요.",
      remake: "다시 만들기",
      preparing: "미리보기 이미지를 준비 중이에요.",
      previewAlt: "{title} 미리보기 이미지",
      newBoard: "새로 만들기",
      previewFailed: "이미지를 준비하지 못했어요. 새로고침 후 다시 시도해주세요."
    },
    email: {
      maintenanceSubject: "기온별플리 점검이 완료됐어요",
      maintenanceTitle: "점검이 완료됐어요",
      maintenanceDescription: "기온별플리를 다시 이용하실 수 있어요. 기다려주셔서 감사합니다.",
      openApp: "기온별플리 열기",
      oneTimeNotice: "이 메일은 점검 완료 알림 신청에 따라 1회 발송되었습니다.",
      text: "기온별플리 점검이 완료됐어요.\n다시 이용하실 수 있습니다: {siteUrl}\n\n이 메일은 점검 완료 알림 신청에 따라 1회 발송되었습니다."
    },
    apiErrors: {
      spotifyRateLimited: "Spotify 검색이 요청이 몰려 잠시 쉬는 중이에요.\n잠시 후 다시 시도해주세요.",
      musicSearchUnstable: "음악 검색 연결이 잠시 불안정해요. 다시 검색해보세요.",
      boardInvalid: "플레이리스트 데이터를 확인하지 못했어요. 다시 시도해주세요.",
      boardImageFailed: "플레이리스트 이미지를 생성하지 못했어요. 다시 시도해주세요."
    },
    metadata: {
      title: "기온별플리 | By Degrees",
      description: "음악으로 기록하는 여러분의 계절을 공유해주세요 🎧",
      boardTitle: "{title} | 기온별플리"
    }
  },
  en: {
    common: {
      appName: "By Degrees",
      appNameWithEnglish: "By Degrees",
      contact: "Contact",
      close: "Close",
      cancel: "Cancel",
      add: "Add",
      search: "Search",
      save: "Save",
      retry: "Please try again.",
      copied: "Copied",
      copyLink: "Copy link"
    },
    landing: {
      heroAlt: "Share your season through music 🎧",
      start: "Start",
      contactSubject: "By Degrees Inquiry",
      maintenanceTitle: "Temporarily Under Maintenance",
      maintenanceDescription: "Music search is taking a short break due to high traffic.\nPlease come back in a bit."
    },
    maintenanceNotification: {
      button: "Get notified when we are back",
      title: "Maintenance Notification",
      description: "We will email you once maintenance is complete.",
      emailPlaceholder: "email@example.com",
      submit: "Notify me",
      success: "We will email you once maintenance is complete.",
      invalidEmail: "Please check your email address.",
      saveFailed: "We could not save your request. Please try again shortly.",
      requestFailed: "We could not register your notification request.",
      networkFailed: "Network error. We could not register your notification request.",
      privacy:
        "Your email is collected only for a one-time maintenance completion notice. After the email is sent, it will be stored with the delivery record for 3 days, then deleted immediately."
    },
    create: {
      backToLanding: "Back to landing page",
      nicknameTitle: "What should\nwe call you?",
      next: "Next",
      previous: "Previous",
      modeTitle: "I want to build\nmy playlist with",
      singleArtistMode: "Songs from one artist",
      multiArtistMode: "Songs from various artists",
      artistTitle: "Choose\nan artist",
      artistSearchPlaceholder: "Search artist",
      artistLoading: "Loading artists",
      artistSearchError: "Something went wrong while searching artists.",
      artistNetworkError: "Network error. Artist search failed.",
      multiArtistName: "Various Artists",
      boardTitleFallback: "My Playlist By Degrees • {nickname} 🎶",
      singleBoardTitle: "{artistName} By Degrees • {nickname} 🎶",
      multiBoardTitle: "My Playlist By Degrees • {nickname} 🎶",
      titlePlaceholder: "My By Degrees playlist title",
      missingSongs: "Please choose at least one song for every temperature range.",
      preview: "Playlist Preview",
      preparingImage: "Preparing image...",
      previewFailed: "We could not prepare your playlist preview. Please try again.",
      imagePreviewFailed: "We could not prepare the image preview. Please try again.",
      maintenanceTitle: "Temporarily Under Maintenance",
      maintenanceDescription: "Music search is taking\na short break due to high traffic.\nPlease try again in a bit."
    },
    boardPreview: {
      titleFallback: "By Degrees Playlist",
      titlePlaceholder: "By Degrees Playlist",
      artistPlaceholder: "Artist name",
      brandText: "© 2026 By Degrees. All rights reserved."
    },
    searchDialog: {
      title: "Choose a song",
      placeholder: "Search by song or artist",
      loading: "Loading songs",
      providerFooter: "Showing iTunes search results.",
      searchError: "Something went wrong while searching songs.",
      networkError: "Network error. Song search failed.",
      duplicateTitle: "This song is already added.",
      duplicateDescription: "Do you still want to add it?"
    },
    songCard: {
      replace: "Replace song",
      replaceAriaLabel: "Replace {title}"
    },
    share: {
      sectionTitle: "Save my playlist image",
      buttonsTitle: "Share my playlist image",
      xShare: "Share on X",
      xShareText: "Share the season you are feeling through music 🎧",
      linkShare: "Share link",
      linkCopied: "Link copied.",
      longPressToSave: "Long-press the image to save it to your photos.",
      previewLongPressLine1: "Long-press the image 👆",
      previewLongPressLine2: "to save it.",
      saveImageAlt: "{title} image for saving",
      hashtags: {
        base: "#기온별플리",
        englishBase: "#ByDegrees",
        artistPrefix: "#기온별",
        artistSuffix: "ByDegrees"
      },
      saveFailed: "We could not prepare the image. Please refresh and try again.",
      previewPreparing: "The image preview is still loading. Please try again shortly."
    },
    localPreview: {
      noDataTitle: "No preview data found.",
      remake: "Make it again",
      preparing: "Preparing your preview image.",
      previewAlt: "{title} preview image",
      newBoard: "Create another playlist",
      previewFailed: "We could not prepare the image. Please refresh and try again."
    },
    email: {
      maintenanceSubject: "By Degrees maintenance is complete",
      maintenanceTitle: "Maintenance is complete",
      maintenanceDescription: "By Degrees is back online. Thank you for waiting.",
      openApp: "Open By Degrees",
      oneTimeNotice: "This one-time email was sent because you requested a maintenance completion notice.",
      text: "By Degrees maintenance is complete.\nYou can use it again here: {siteUrl}\n\nThis one-time email was sent because you requested a maintenance completion notice."
    },
    apiErrors: {
      spotifyRateLimited: "Music search is temporarily unavailable due to high traffic.\nPlease try again shortly.",
      musicSearchUnstable: "Music search is temporarily unstable. Please search again.",
      boardInvalid: "We could not verify the playlist data. Please try again.",
      boardImageFailed: "We could not generate the playlist image. Please try again."
    },
    metadata: {
      title: "By Degrees",
      description: "Share your season through music 🎧",
      boardTitle: "{title} | By Degrees"
    }
  }
} as const;
