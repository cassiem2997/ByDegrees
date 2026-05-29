# By Degrees | 기온별플리

'기온별 옷차림' 이미지에서 착안하여 기온 구간별로 어울리는 곡을 배치하고, 9:16 플레이리스트 이미지로 저장하거나 SNS에 공유하는 Next.js App Router 서비스입니다.

## Features

- 닉네임 기반 플레이리스트 생성 플로우
- 단일 아티스트 또는 다양한 아티스트 모드
- Spotify Web API 기반 아티스트/트랙 검색
- 기온 구간별 3곡 선택 UI
- 9:16 모바일 세로형 플레이리스트 이미지 미리보기
- iOS/Android에서 길게 눌러 저장할 수 있는 실제 이미지 미리보기
- X, Instagram, KakaoTalk 공유 진입점
- Kakao JavaScript SDK 공유 연동
- 페이지 조회, 곡 선택, 이미지 저장, 공유 이벤트 수집
- 관리자 통계 대시보드

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Neon Postgres
- Spotify Web API
- Kakao JavaScript SDK
- Vercel

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run migrate
npm run dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다. 같은 Wi-Fi의 모바일 기기에서 테스트하려면 터미널에 표시되는 Network URL을 사용하세요.

## Environment Variables

`.env.local`은 로컬 개발 전용입니다. Vercel 배포에서는 Project Settings의 Environment Variables에 같은 값을 따로 등록해야 합니다.

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgres://user:password@host:5432/temptracks
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSCODE=change-me
NEXT_PUBLIC_SITE_NAME=Tracks by Degrees
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your_kakao_javascript_key
```

배포 후 `NEXT_PUBLIC_APP_URL`은 실제 Vercel URL로 설정하세요.

## Database

마이그레이션은 `migrations/*.sql`과 `scripts/apply-migrations.mjs`로 관리합니다.

```bash
npm run migrate:status
npm run migrate
```

초기 스키마는 `migrations/001_init.sql`과 `sql/schema.sql`을 참고하세요.

## Sharing Notes

- 이미지 미리보기는 DOM을 PNG로 캡처한 뒤 실제 `<img>`로 표시합니다.
- iOS/Android에서는 미리보기 이미지를 길게 눌러 사진 앱 또는 다운로드 폴더에 저장할 수 있습니다.
- Kakao 공유를 테스트하려면 Kakao Developers의 Web 플랫폼 도메인에 배포 도메인을 등록해야 합니다.
- 로컬 IP 또는 HTTP 환경에서는 일부 모바일 공유 기능이 브라우저 정책에 따라 제한될 수 있습니다.

## Deploy on Vercel

1. GitHub에 repository를 생성합니다.
2. 로컬 repository에 remote를 연결하고 `main` 브랜치를 push합니다.
3. Vercel에서 GitHub repository를 import합니다.
4. Vercel Project Settings에 Environment Variables를 등록합니다.
5. Neon database에 migration을 적용합니다.
6. 배포 URL을 `NEXT_PUBLIC_APP_URL`과 Kakao Developers Web platform domain에 반영합니다.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run migrate
npm run migrate:status
```

## Important Files

- `app/create/page.tsx`: 플레이리스트 생성 화면
- `app/preview/page.tsx`: 로컬 이미지 미리보기 화면
- `app/boards/[slug]/page.tsx`: 공개 보드/공유 화면
- `app/admin/page.tsx`: 관리자 통계 화면
- `components/board-preview.tsx`: 9:16 플레이리스트 이미지 레이아웃
- `components/create-board-client.tsx`: 생성 플로우 클라이언트 UI
- `components/local-preview-client.tsx`: 미리보기 이미지 캡처 및 저장 안내
- `components/share-actions.tsx`: 저장/공유 액션
- `lib/providers/music`: 음악 provider abstraction
- `lib/kakao-share.ts`: Kakao Share SDK helper
- `lib/image-file.ts`: DOM to PNG capture helper
- `lib/analytics.ts`: 이벤트 통계 집계
