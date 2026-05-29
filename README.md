<p align="center">
  <img src="./public/images/gion-logo-transparent.png" alt="기온별플리" width="320" />
</p>

# By Degrees | 기온별플리

**기온별플리**는 '기온별 옷차림' 이미지에서 착안하여 기온 구간별로 어울리는 곡을 배치하고, 9:16 플레이리스트 이미지로 저장하거나 SNS에 공유하는 서비스입니다.

“28도에 듣고 싶은 곡”, “초겨울에 어울리는 곡”처럼 온도별 감각을 기준으로 음악을 고르고, 완성된 플레이리스트를 인스타그램 스토리나 X, 카카오톡에 공유하는 경험을 목표로 만들었습니다.

## Product Flow

1. 이름 또는 닉네임을 입력합니다.
2. 한 아티스트의 곡으로 만들지, 여러 아티스트 곡으로 만들지 선택합니다.
3. Spotify 검색으로 아티스트와 곡을 고릅니다.
4. 8개 기온 구간마다 최대 3곡씩 배치합니다.
5. 9:16 플레이리스트 이미지를 미리보고 저장합니다.
6. Instagram, X, KakaoTalk로 공유합니다.

## Highlights

- 모바일 중심의 9:16 플레이리스트 이미지
- 기온 구간별 컬러, 이모지, 앨범아트 레이아웃
- iOS/Android에서 길게 눌러 저장할 수 있는 실제 이미지 미리보기
- Kakao JavaScript SDK 기반 카카오톡 공유
- X intent, Instagram caption/save flow
- 생성, 곡 선택, 저장, 공유 이벤트 로깅
- 관리자 통계 대시보드

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Neon Postgres
- Spotify Web API
- Kakao JavaScript SDK
- Vercel

## Local Development

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

1. GitHub repository를 Vercel에서 import합니다.
2. Vercel Project Settings에 Environment Variables를 등록합니다.
3. Neon database에 migration을 적용합니다.
4. 배포 URL을 `NEXT_PUBLIC_APP_URL`과 Kakao Developers Web platform domain에 반영합니다.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run migrate
npm run migrate:status
```

## Project Structure

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
