<p align="center">
  <img src="./public/images/gion-logo-transparent.png" alt="기온별플리" width="320" />
</p>

# 기온별플리 | By Degrees

**기온별플리**는 '기온별 옷차림' 이미지에서 착안해, 기온 구간마다 어울리는 곡을 배치하고 9:16 플레이리스트 이미지로 저장하거나 공유할 수 있는 Next.js App Router 서비스입니다.

음악으로 기록하고 싶은 계절감을 고르고, 완성된 이미지를 모바일에서 길게 눌러 저장한 뒤 X 또는 링크로 공유할 수 있습니다.

## Product Flow

1. 이름 또는 닉네임을 입력합니다.
2. 한 아티스트의 곡으로 만들지, 여러 아티스트의 곡으로 만들지 선택합니다.
3. iTunes 검색으로 아티스트와 곡을 고릅니다.
4. 8개 기온 구간마다 최대 3곡씩 배치합니다.
5. 모든 기온 구간에 한 곡 이상을 넣으면 플레이리스트 미리보기로 이동합니다.
6. 9:16 이미지를 길게 눌러 저장하거나 X/링크로 공유합니다.

## Highlights

- 모바일 중심의 9:16 플레이리스트 이미지
- 기온 구간별 컬러, 계절 이모지, 앨범아트 레이아웃
- Canvas 기반 미리보기 PNG 생성으로 모바일 저장 UX 안정화
- X intent 공유와 링크 복사 분리
- 링크 복사는 서비스 홈 URL 기준으로 고정
- 중복곡 추가 확인, 빈 기온 구간 안내 토스트
- 생성 완료, 검색, 저장, 공유 이벤트 로깅
- 기간 네비게이션과 퍼널 지표가 있는 관리자 통계 대시보드
- 국가 / 대륙별 방문자와 생성 완료 이용자 donut chart
- iTunes 검색 결과 메모리 캐시 + Neon 캐시
- 검색 실패 시 stale cache fallback
- 반복 검색 오류 감지 시 랜딩 점검 공지 ON + Discord webhook 알림
- 점검 완료 알림 신청, Gmail BCC prefill, 3일 후 알림 신청자 자동 삭제
- 한국어 / 영어 랜딩, 생성, 미리보기 플로우
- 루트 Open Graph 링크 미리보기와 사이트 아이콘

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Neon Postgres
- iTunes Search API
- Spotify Web API fallback/provider code
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
MUSIC_PROVIDER=itunes
NEXT_PUBLIC_MUSIC_PROVIDER=itunes
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSCODE=change-me
NEXT_PUBLIC_SITE_NAME=기온별플리 | By Degrees
DISCORD_ALERT_WEBHOOK_URL=https://discord.com/api/webhooks/...
ALERT_COOLDOWN_SECONDS=1800
SEARCH_ERROR_NOTICE_THRESHOLD=3
SEARCH_ERROR_NOTICE_WINDOW_SECONDS=600
MAINTENANCE_NOTIFY_BATCH_SIZE=100
CRON_SECRET=change-me-to-a-long-random-string
```

`NEXT_PUBLIC_APP_URL`은 X 공유, 링크 복사, Open Graph 이미지 URL의 기준이 되므로 배포 URL과 일치해야 합니다.

`MUSIC_PROVIDER` / `NEXT_PUBLIC_MUSIC_PROVIDER`는 현재 `itunes`를 기본값으로 사용합니다. Spotify provider 코드는 fallback으로 남아 있어 Spotify env schema는 유지되어 있습니다.

`DISCORD_ALERT_WEBHOOK_URL`은 선택값입니다. 값이 있으면 같은 route/query/error 조합의 검색 오류가 `SEARCH_ERROR_NOTICE_THRESHOLD`회 이상 `SEARCH_ERROR_NOTICE_WINDOW_SECONDS` 안에 반복될 때 Discord로 알림을 보내고 랜딩 점검 공지를 켭니다. `ALERT_COOLDOWN_SECONDS` 동안 같은 route의 반복 알림을 억제합니다.

`CRON_SECRET`은 Vercel Cron이 점검 완료 알림 신청자 cleanup API를 호출할 때 사용하는 비밀값입니다.

## Database

마이그레이션은 `migrations/*.sql`과 `scripts/apply-migrations.mjs`로 관리합니다.

```bash
npm run migrate:status
npm run migrate
```

`migrations/003_music_search_cache.sql`은 음악 검색 결과를 Neon에 캐싱하기 위한 테이블입니다. 검색 결과는 24시간 동안 fresh cache로 사용하고, 외부 API 검색 실패 시 14일 이내 stale cache까지 fallback으로 사용합니다.

`migrations/007_search_error_incidents.sql`은 반복 검색 오류 감지를 위한 incident 카운터입니다.

## Sharing Notes

- `/preview`는 sessionStorage에 저장된 임시 플레이리스트를 Canvas PNG로 변환해 실제 `<img>`로 보여줍니다.
- iOS/Android에서는 미리보기 이미지를 길게 눌러 사진 앱 또는 다운로드 폴더에 저장할 수 있습니다.
- 링크 복사는 `NEXT_PUBLIC_APP_URL` 기준의 서비스 홈 URL을 사용합니다.
- X 공유 문구는 플레이리스트 제목, 서비스 소개 문구, 해시태그로 구성됩니다.
- X intent에는 URL을 넣지 않습니다. 모바일 X 작성 화면에서 사용자가 저장한 이미지를 직접 첨부할 수 있게 하기 위함입니다.
- `/en`, `/en/create`, `/en/preview`는 동일한 생성/저장/공유 플로우를 영어 문구로 제공합니다.

## Analytics

관리자 페이지는 `/admin/login`에서 패스코드로 진입합니다. 통계는 기간 단위로 이동하며 확인할 수 있습니다.

- 방문 수
- 플레이리스트 생성 완료 수
- 방문 대비 생성 완료율
- 생성 완료 대비 이미지 길게 누른 비율
- 생성 완료 대비 공유율
- 평균 선택 곡 수
- 가장 많이 비는 / 채워지는 기온 구간
- 완성 기준 인기 아티스트 TOP 10 / 인기 곡
- 국가 / 대륙별 방문 지표
- 국가 / 대륙별 생성 완료 이용자 지표

이미지 저장 지표는 브라우저가 실제 사진 앱 저장 완료 여부를 알려주지 않기 때문에, 저장용 이미지를 650ms 이상 길게 누른 시도를 기준으로 집계합니다.

관리자 로그인 쿠키가 있는 요청은 방문, 검색, 선택, 생성, 저장, 공유 통계에서 제외됩니다.

## Operations

- 음악 검색은 `/api/music/search`, `/api/music/artists`를 사용합니다. 기존 `/api/spotify/*` route는 alias로 유지됩니다.
- iTunes 검색은 먼저 서버 메모리 캐시를 확인하고, 없으면 Neon 검색 캐시를 확인한 뒤 iTunes Search API를 호출합니다.
- 외부 API 검색 실패 시 stale cache를 fallback으로 사용합니다. 캐시가 없고 같은 오류가 짧은 시간 안에 반복될 때만 랜딩 점검 공지를 켭니다.
- `DISCORD_ALERT_WEBHOOK_URL`이 설정되어 있으면 반복 검색 오류로 점검 공지가 켜질 때 Discord 알림을 보냅니다.
- 장애 대응용 점검 공지는 DB 상태로 관리되며 `/admin`에서 수동으로 내릴 수 있습니다.
- 점검 완료 알림 버튼은 `notified_at`이 없는 이메일을 comma-separated list로 복사하고 Gmail compose를 BCC prefill로 엽니다. 실제 발송 후 `notified_at` 처리는 별도 수동 작업으로 진행합니다.
- Vercel Cron은 발송 완료 후 3일이 지난 점검 알림 신청자를 삭제합니다.
- Google 검색결과는 `app/layout.tsx` metadata와 `app/icon.tsx` 사이트 아이콘을 사용합니다. 반영은 Google 재크롤링 이후 적용됩니다.

## Deploy on Vercel

1. GitHub repository를 Vercel에서 import합니다.
2. Vercel Project Settings에 Environment Variables를 등록합니다.
3. Neon database에 migration을 적용합니다.
4. 배포 URL을 `NEXT_PUBLIC_APP_URL`에 반영합니다.
5. Discord 알림을 사용한다면 `DISCORD_ALERT_WEBHOOK_URL`을 등록합니다.
6. Cron cleanup을 사용한다면 `CRON_SECRET`을 등록합니다.
7. 배포 후 모바일 Safari/Chrome에서 한국어/영어 생성, 저장, X 공유, 링크 복사를 확인합니다.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run migrate
npm run migrate:status
npm run seed:itunes-cache
```

## Project Structure

- `app/create/page.tsx`: 플레이리스트 생성 화면
- `app/en/page.tsx`: 영어 랜딩 화면
- `app/en/create/page.tsx`: 영어 플레이리스트 생성 화면
- `app/en/preview/page.tsx`: 영어 로컬 이미지 미리보기 화면
- `app/preview/page.tsx`: 로컬 이미지 미리보기 화면
- `app/boards/[slug]/page.tsx`: 저장된 보드 조회 화면. 현재 기본 링크 공유 흐름에서는 사용하지 않음
- `app/opengraph-image.tsx`: 루트 링크 미리보기 이미지
- `app/icon.tsx`: 사이트 아이콘 / favicon 이미지
- `app/boards/[slug]/opengraph-image.tsx`: 저장된 보드 링크 미리보기 이미지
- `app/admin/page.tsx`: 관리자 통계 화면
- `components/board-preview.tsx`: 9:16 플레이리스트 이미지 레이아웃
- `components/create-board-client.tsx`: 생성 플로우 클라이언트 UI
- `components/home-page-content.tsx`: 한국어/영어 랜딩 UI
- `components/local-preview-client.tsx`: 미리보기 이미지 생성, 저장 안내, 공유 액션
- `components/share-actions.tsx`: 공개 보드 저장/공유 액션
- `components/share-channel-buttons.tsx`: X/링크 공유 버튼
- `lib/preview-canvas.ts`: Canvas 기반 저장용 이미지 생성
- `lib/i18n/copy.ts`: 한국어/영어 UI copy dictionary
- `lib/image-file.ts`: DOM to PNG capture helper
- `lib/providers/music`: 음악 provider abstraction
- `lib/db/music-search-cache.ts`: Neon 기반 음악 검색 캐시
- `lib/analytics.ts`: 이벤트 통계 집계
- `lib/alerts.ts`: Discord 운영 알림
- `lib/maintenance.ts`: 반복 검색 오류 기반 점검 공지 gate
- `lib/db`: Neon Postgres 연결과 쿼리
