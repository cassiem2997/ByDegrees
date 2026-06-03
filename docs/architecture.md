# 기온별플리 / By Degrees Architecture

## 1. Product Positioning

- 대표 서비스명: `기온별플리`
- 영문 표기: `By Degrees`
- 핵심 제품 형태: 팬이 직접 곡을 고르고, 기온 구간별로 배치한 뒤, 한 장의 9:16 플레이리스트 이미지를 저장/공유하는 모바일 우선 툴

### Naming Feedback

- `By Degrees`는 더 짧고 브랜드처럼 들리며, 감성적인 서비스명으로 쓰기 좋습니다.
- 영어권에서 `degree`가 학위 의미로도 쓰이긴 하지만, 단독 브랜드명으로는 오히려 패션/에디토리얼한 느낌이 강합니다.
- 다만 이름만 보고 음악 서비스라는 점이 바로 드러나진 않을 수 있어, 대외 노출은 `기온별플리`를 메인으로 두고 `By Degrees`를 서브 브랜드처럼 붙이는 방향이 안전합니다.
- 결론: 지금 MVP에서는 `기온별플리` 메인, `By Degrees` 서브로 유지

## 2. IA

- `/`
  - 로고가 포함된 CTA와 서비스 목업을 보여주는 모바일 우선 랜딩
- `/en`
  - 영어 문구 랜딩
- `/create`
  - 모바일 우선 플레이리스트 이미지 생성 화면
- `/en/create`
  - 영어 문구 생성 화면
- `/preview`
  - 로컬 세션 기반 저장용 이미지 미리보기
- `/en/preview`
  - 영어 문구 저장용 이미지 미리보기
- `/boards/[slug]`
  - 저장된 보드 조회 화면
  - 현재 기본 사용자 공유 흐름에서는 서비스 홈 URL 복사를 사용하므로, 공개 보드 링크 공유는 기본 노출하지 않음
- `/admin/login`
  - 운영자 패스코드 진입
- `/admin`
  - 기간별 방문 / 생성 / 저장 / 공유 / 인기 데이터 / 국가 / 대륙 지표 / 점검 알림 운영 확인

## 3. MVP User Flow

1. 사용자가 이름 또는 닉네임 입력
2. 단일 아티스트 / 복수 아티스트 옵션 선택
3. 단일 아티스트 선택 시 아티스트 검색
4. 자동 생성된 제목 확인
5. 8개 기온 구간, 각 3칸 슬롯에 곡 선택
6. 모든 기온 구간에 한 곡 이상 선택하면 결과 이미지 생성
7. 결과 이미지를 길게 눌러 저장하거나 X/링크로 공유
8. 운영자는 `/admin`에서 지표 확인

## 4. Screen Structure

### Landing

- 로고가 들어간 CTA와 플레이리스트 생성 화면 목업 중심
- 설명형 카피보다 바로 시작하는 흐름을 우선

### Step Flow

- 이름 / 닉네임 입력 단계
- 아티스트 옵션 선택 단계
- 플레이리스트 편집 단계

초기 구현은 멀티 페이지보다 단일 흐름 / 단계형 UI로 묶는 것이 효율적입니다.

### Create Screen

- 결과물 규격 기준: `9:16`
- 편집 화면은 스크롤 허용
- 최종 저장 이미지는 3x8 전체가 한 장에 들어오도록 렌더
- 온도 숫자는 좌측 세로 인디케이터에만 표기
- 각 행은 3칸 고정
- 제목은 자동 생성, 사용자는 수정 불가

## 5. Title Rules

- 이름 또는 닉네임: 사용자가 입력
- 아티스트 옵션
  - 단일 아티스트
  - 복수 아티스트

### Auto Title

- 단일 아티스트: `기온별 {아티스트명} by {닉네임}`
- 복수 아티스트: `기온별 플리 by {닉네임}`

## 6. Localization

- 기본 언어: 한국어
- `/`는 한국어, `/en`은 영어
- 랜딩 좌상단 `KOR | ENG` 스위치로 언어별 랜딩 이동
- 생성과 미리보기 플로우는 locale route를 유지
- X 공유 텍스트는 언어별 문구를 쓰되 해시태그 정책은 동일하게 유지

## 7. Sharing Policy

- 이미지 저장: 최종 결과 PNG를 길게 눌러 저장하도록 안내
- X 공유: 기본 문구 + 해시태그 intent
- 링크 공유: 별도 링크 복사 버튼
- 링크 복사는 서비스 홈 URL을 사용
- X intent에는 URL을 넣지 않음. 사용자가 작성 화면에서 저장 이미지를 직접 첨부할 수 있게 하기 위함
- 인스타그램 / 카카오 직접 공유는 현재 범위에서 제외

## 8. Tracking Policy

### Visitor

- 기준: `session_id`
- 지표
  - 일일 / 주간 / 월간 / 누적
  - 국가별 / 대륙별

### Save

- 기준: 저장용 이미지를 650ms 이상 길게 누른 시도
- 지표
  - 일일 / 주간 / 월간 / 누적

### Share

- 기준: 공유 액션 트리거
- 지표
  - 일일 / 주간 / 월간 / 누적

### Note

- 현재 웹 환경에서 "실제 외부 앱 업로드 완료"를 100% 보장해 잡는 것은 어렵습니다.
- 따라서 MVP에서는 실제 공유 완료가 아니라, 공유 액션 실행을 기준으로 두는 쪽이 현실적입니다.
- 인기 아티스트 / 곡은 생성 완료 기준을 우선 집계합니다.
- 국가 / 대륙 지표는 방문자 수와 생성 완료 이용자 수를 분리해 봅니다.
- 관리자 로그인 쿠키가 있는 요청은 내부 테스트로 간주해 이벤트 기록을 건너뛰고, 생성 보드는 `is_internal`로 표시해 집계에서 제외합니다.

## 9. Tech Notes

- 음악 메타데이터: iTunes Search API 기본, Spotify provider fallback 코드 유지
- 음악 검색 route: `/api/music/search`, `/api/music/artists`
- 기존 `/api/spotify/search`, `/api/spotify/artists`는 alias로 유지
- 음악 검색 안정화: server memory cache + Neon search cache + stale fallback
- DB: Neon Postgres
- Hosting: Vercel
- Admin 보호: `ADMIN_PASSCODE` + cookie gate
- 국가 / 대륙 추적: Vercel geo headers
- Image export: client-side Canvas PNG
- OG image: Next.js `ImageResponse`
- 장애 알림: 같은 검색 오류가 짧은 시간 안에 반복되면 점검 공지 ON + Discord webhook 알림
- 점검 완료 알림: 이메일 신청 저장, admin Gmail BCC prefill, 발송 후 `notified_at` 수동 처리
- 점검 알림 cleanup: Vercel Cron이 발송 완료 3일 후 신청자 삭제
- SEO: App Router metadata + `app/icon.tsx`

## 10. Current Non-Goals

- 공개 보드 탐색
- 공개 보드 URL 중심 공유
- 로그인 사용자 계정 체계
- 보드 수정 기능
- 커뮤니티 기능
- 멀티 provider 동시 운영
- X 이미지 자동 첨부
