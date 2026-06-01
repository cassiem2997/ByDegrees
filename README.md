<p align="center">
  <img src="./public/images/gion-logo-transparent.png" alt="기온별플리" width="320" />
</p>

# 기온별플리 | By Degrees

**기온별플리**는 '기온별 옷차림' 이미지에서 착안해, 기온 구간마다 어울리는 곡을 배치하고 9:16 플레이리스트 이미지로 저장하거나 공유할 수 있는 Next.js App Router 서비스입니다.

음악으로 기록하고 싶은 계절감을 고르고, 완성된 이미지를 모바일에서 길게 눌러 저장한 뒤 X 또는 링크로 공유할 수 있습니다.

## Product Flow

1. 이름 또는 닉네임을 입력합니다.
2. 한 아티스트의 곡으로 만들지, 여러 아티스트의 곡으로 만들지 선택합니다.
3. Spotify 검색으로 아티스트와 곡을 고릅니다.
4. 8개 기온 구간마다 최대 3곡씩 배치합니다.
5. 모든 기온 구간에 한 곡 이상을 넣으면 플레이리스트 미리보기로 이동합니다.
6. 9:16 이미지를 길게 눌러 저장하거나 X/링크로 공유합니다.
7. 공개 보드 URL에서는 저장, X 공유, 링크 복사를 다시 실행할 수 있습니다.

## Highlights

- 모바일 중심의 9:16 플레이리스트 이미지
- 기온 구간별 컬러, 계절 이모지, 앨범아트 레이아웃
- Canvas 기반 미리보기 PNG 생성으로 모바일 저장 UX 안정화
- X intent 공유와 링크 복사 분리
- 중복곡 추가 확인, 빈 기온 구간 안내 토스트
- 생성 완료, 탐색, 저장, 공유 이벤트 로깅
- 기간 네비게이션과 퍼널 지표가 있는 관리자 통계 대시보드
- 루트/공개 보드별 Open Graph 링크 미리보기

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Neon Postgres
- Spotify Web API
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
NEXT_PUBLIC_APP_URL=https://by-degrees.vercel.app
DATABASE_URL=postgres://user:password@host:5432/temptracks
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSCODE=change-me
NEXT_PUBLIC_SITE_NAME=기온별플리 | By Degrees
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your_kakao_javascript_key
```

`NEXT_PUBLIC_APP_URL`은 X 공유, 링크 복사, Open Graph 이미지 URL의 기준이 되므로 배포 URL과 일치해야 합니다.

## Database

마이그레이션은 `migrations/*.sql`과 `scripts/apply-migrations.mjs`로 관리합니다.

```bash
npm run migrate:status
npm run migrate
```

초기 스키마는 `migrations/001_init.sql`과 `sql/schema.sql`을 참고하세요.

## Sharing Notes

- `/preview`는 sessionStorage에 저장된 임시 플레이리스트를 Canvas PNG로 변환해 실제 `<img>`로 보여줍니다.
- iOS/Android에서는 미리보기 이미지를 길게 눌러 사진 앱 또는 다운로드 폴더에 저장할 수 있습니다.
- 링크 복사는 `NEXT_PUBLIC_APP_URL` 기준의 배포 URL을 사용합니다.
- X 공유 문구는 플레이리스트 제목, 서비스 소개 문구, 해시태그로 구성됩니다.
- X intent에는 URL을 넣지 않습니다. 모바일 X 작성 화면에서 사용자가 저장한 이미지를 직접 첨부할 수 있게 하기 위함입니다.
- 카카오톡 링크 미리보기는 Open Graph 메타데이터를 사용합니다. 배포 후 미리보기가 갱신되지 않으면 Kakao Developers의 공유 디버거에서 캐시를 초기화해야 합니다.

## Analytics

관리자 페이지는 `/admin/login`에서 패스코드로 진입합니다. 통계는 기간 단위로 이동하며 확인할 수 있습니다.

- 방문 수
- 플레이리스트 생성 완료 수
- 방문 대비 생성 완료율
- 생성 완료 대비 이미지 저장률
- 생성 완료 대비 공유율
- 평균 선택 곡 수
- 가장 많이 비는 / 채워지는 기온 구간
- 완성 기준 인기 아티스트 / 곡
- 검색 및 탐색 기준 인기 아티스트 / 곡
- 국가 / 대륙별 방문 지표

관리자 로그인 쿠키가 있는 요청은 방문, 검색, 선택, 생성, 저장, 공유 통계에서 제외됩니다.

## Deploy on Vercel

1. GitHub repository를 Vercel에서 import합니다.
2. Vercel Project Settings에 Environment Variables를 등록합니다.
3. Neon database에 migration을 적용합니다.
4. 배포 URL을 `NEXT_PUBLIC_APP_URL`에 반영합니다.
5. 배포 후 모바일 Safari/Chrome에서 생성, 저장, X 공유, 링크 복사를 확인합니다.

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
- `app/opengraph-image.tsx`: 루트 링크 미리보기 이미지
- `app/boards/[slug]/opengraph-image.tsx`: 공개 보드 링크 미리보기 이미지
- `app/admin/page.tsx`: 관리자 통계 화면
- `components/board-preview.tsx`: 9:16 플레이리스트 이미지 레이아웃
- `components/create-board-client.tsx`: 생성 플로우 클라이언트 UI
- `components/local-preview-client.tsx`: 미리보기 이미지 생성, 저장 안내, 공유 액션
- `components/share-actions.tsx`: 공개 보드 저장/공유 액션
- `components/share-channel-buttons.tsx`: X/링크 공유 버튼
- `lib/preview-canvas.ts`: Canvas 기반 저장용 이미지 생성
- `lib/image-file.ts`: DOM to PNG capture helper
- `lib/providers/music`: 음악 provider abstraction
- `lib/analytics.ts`: 이벤트 통계 집계
- `lib/db`: Neon Postgres 연결과 쿼리
