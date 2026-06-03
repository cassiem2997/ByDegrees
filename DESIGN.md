# DESIGN

## 1. Product Summary

- 서비스명
  - 메인 한글명: `기온별플리`
  - 영문 서브브랜드: `By Degrees`
- 서비스 성격
  - 팬이 직접 곡을 고르고, 기온 구간별로 배치한 뒤, 한 장의 세로형 플레이리스트 이미지를 저장하고 공유하는 모바일 웹 툴
- 핵심 가치
  - 복잡한 커뮤니티 기능보다, 예쁘고 직관적인 결과 이미지 생성에 집중

---

## 2. Brand Direction

### Core Tone

- 감성적이지만 과하게 귀엽지 않을 것
- K-pop 팬메이드 툴 느낌이 나되, 정돈되고 세련될 것
- 모바일 캡처만 봐도 예뻐야 함
- “앱”보다는 “결과물 중심 이미지 메이커”로 느껴져야 함

### Visual Keywords

- premium
- minimal
- airy
- soft
- elegant
- fan-made
- album-art-first

### Naming Use

- 대외 메인 표기는 `기온별플리`
- 영문명은 `By Degrees`
- 둘을 함께 쓸 때는 `기온별플리`를 더 우선해서 보여줄 것

---

## 3. Design Principles

1. 앨범아트가 주인공이어야 한다.
2. 화면보다 결과 이미지가 더 중요하다.
3. 구조는 직관적이어야 하고, 장식은 절제되어야 한다.
4. 정보량은 적게, 완성도는 높게.
5. 모바일 퍼스트로 설계한다.

### Must Avoid

- 개발자 대시보드처럼 보이는 UI
- 정보가 과도하게 많은 마케팅 페이지
- 불필요한 헤더 메뉴 / 푸터 링크 / 하단 네비게이션
- 너무 유치한 팬시 요소
- 원본 기온별 옷차림표를 그대로 연상시키는 복제형 표현

---

## 4. Output Format

- 최종 결과물 기본 비율: `9:16`
- 편집 화면은 스크롤 허용
- 최종 저장 이미지에는 `3 x 8` 구조 전체가 한 장에 들어와야 함

### Result Board Rules

- 총 8개 온도 행
- 각 행은 3칸 고정
- 즉 전체는 `3 x 8` 카드형 구조
- 온도 구간은 숫자 기준
  - `28°C+`
  - `27~23°C`
  - `22~20°C`
  - `19~17°C`
  - `16~12°C`
  - `11~9°C`
  - `8~5°C`
  - `4°C-`

---

## 5. Create Screen Design

### Layout Summary

- 상단 큰 헤더/푸터 없이 바로 생성 화면에 집중
- 제목 입력 영역
- 아티스트 입력 영역
- 좌측 세로 온도 그라디언트 바
- 우측에 8개 온도 행
- 각 행은 가로 3칸 카드 슬롯
- 최하단 고정 CTA 버튼

### Temperature Area

- 좌측에는 얇은 세로 gradient bar
- 온도 숫자는 각 행 제목으로 한 번만 표기
- 온도 텍스트 옆 장식선은 없음
- 각 행은 `[카드][카드][카드]` 3칸 고정

### Card Rules

- 모든 카드 크기는 동일
- 정사각형 비율
- 빈 슬롯은 `+` 중심의 미니멀한 dashed card
- 곡이 들어간 카드에는
  - 앨범아트
  - 곡명
  - 아티스트명
  만 간단히 표시

### Input Rules

- 제목은 자동 생성
- 사용자는 제목 수정 불가
- 아티스트명 입력에 따라 제목이 정해짐

#### Auto Title

- 단일 아티스트: `기온별 {아티스트명} by {닉네임}`
- 복수 아티스트: `기온별 플리 by {닉네임}`

### Bottom CTA

- 하단 고정형 버튼
- 문구: `이미지 생성하기`
- 모바일에서 엄지로 누르기 쉬운 크기

### Bottom Credit

- 결과물 하단 브랜드 문구:
  - `© 2026 기온별플리 (By Degrees)`

---

## 6. Modal Design

### Song Search Modal

- 메인 제목: `곡 선택하기`
- 검색 input placeholder: `곡명 또는 아티스트명으로 검색`
- 로딩 문구: `곡을 불러오는 중`
- 빈 상태 문구: `플리에 넣을 곡을 검색해보세요.`
- 선택 버튼 문구: `선택`

### Modal Tone

- 음악 provider 자체 UI처럼 보일 필요 없음
- `기온별플리` 서비스 톤에 맞는 자체 UI
- 앨범아트가 먼저 보이게
- 결과 리스트는 단정하고 가볍게

---

## 7. Landing Page Direction

### Goal

- 사용자가 첫 화면에서 “이 서비스 예쁘다”라고 느껴야 함
- 설명보다 비주얼 설득이 먼저여야 함

### Recommended Structure

1. 중앙 히어로
   - 스마트폰 목업 1개
   - 안에는 완성된 플레이리스트 결과 이미지
2. 메인 CTA
   - 로고 + `시작하기`
3. 장애 대응 시 닫히지 않는 점검 팝업을 임시 노출

### Landing Should Feel Like

- Apple 스타일의 정제된 제품 소개 페이지
- 공기감 있는 여백
- 은은한 블러와 소프트 그라디언트
- “프리미엄한 결과물 생성 툴”

---

## 8. Color & Typography

### Background

- 아주 밝은 아이보리/오프화이트 기반
- 은은한 웜톤 + 쿨톤 혼합 그라디언트 가능
- 과한 채도 금지

### Accent Colors

- coral
- orange
- gold
- mint
- sky blue
- violet / purple

이 색들은 주로 온도 구간, 세로 bar, 포인트 요소에만 사용

### Typography

- 깔끔하고 세련된 산세리프
- 얇은 굵기와 중간 굵기의 대비가 중요
- 헤드라인은 강하지만 무겁지 않게
- 전반적으로 여백을 살릴 것

---

## 9. Localization

- 기본 언어는 한국어
- 랜딩 좌상단에 `KOR | ENG` 스위치를 둠
- 영어 플로우는 `/en`, `/en/create`, `/en/preview`
- 결과물의 해시태그 정책은 언어와 무관하게 동일하게 유지

---

## 10. Share UX

- 결과 이미지는 저장이 가장 우선
- X 공유는 문구 + 해시태그 intent
- Instagram은 prefill보다
  - 이미지 저장
  - 앱 전환 유도
  방식 우선

### Hashtag Direction

- 기본: `#기온별플리`
- 단일 아티스트 예시: `#기온별레드벨벳`
- 복수 아티스트: `#기온별플리 #ByDegrees`
- 단일 아티스트: `#기온별플리 #기온별{아티스트명} #{아티스트명}ByDegrees`

---

## 11. What Stitch Should Prioritize

If this document is attached to a design tool like Google Stitch, prioritize:

1. mobile-first layout
2. beautiful hero composition
3. clear 3x8 playlist board structure
4. album-art-centered UI
5. minimal premium tone
6. no unnecessary navigation or footer clutter

---

## 12. Short Prompt Summary

For design tools, this project can be summarized as:

> A premium, mobile-first K-pop fan-made playlist image creator. The interface should feel minimal, elegant, and highly visual, with album art as the star. The core UI is a 3x8 temperature-based playlist board with a thin vertical temperature gradient bar, clean typography, soft premium colors, and a 9:16 result-oriented layout.
