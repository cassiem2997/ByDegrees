# By Degrees

By Degrees(기온별플리)는 팬이 직접 아티스트의 곡을 기온 구간에 배치해 한 장의 공유용 플레이리스트 이미지로 만드는 Next.js App Router 서비스입니다.

현재 MVP는 로그인 없는 `생성 → 이미지 저장 → 외부 SNS 공유` 흐름에 집중합니다. 보드 수정과 공개 보드 탐색 기능은 의도적으로 제외했습니다.

제품 방향과 최신 결정 사항은 아래 문서를 우선 참고하세요.

- [Architecture](./docs/architecture.md)
- [MVP Plan](./docs/mvp-plan.md)
- [Dev Checklist](./docs/dev-checklist.md)
- [Copy Guide](./docs/copy-guide.md)

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Neon Postgres
- Spotify Web API
- Vercel deploy

## Local Setup

1. `.env.example`를 복사해 `.env.local` 생성
2. 의존성 설치
3. DB migration 실행
4. 개발 서버 실행

```bash
npm install
npm run migrate
npm run dev
```

## Environment Variables

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgres://user:password@host:5432/temptracks
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSCODE=change-me
NEXT_PUBLIC_SITE_NAME=By Degrees
```

## Deploy on Vercel

1. Git 저장소를 Vercel에 연결
2. 환경변수 등록
3. Neon Postgres 연결
4. 배포 전 CI나 로컬에서 `npm run migrate` 실행
5. 배포

## Migration Workflow

- `migrations/*.sql`에 순차 SQL 파일 추가
- `npm run migrate:status`로 적용 상태 확인
- `npm run migrate`로 미적용 migration 실행
- `pg` 기반 runner라 Neon Postgres와 Supabase Postgres 연결 문자열 둘 다 사용 가능
- 초기 스키마는 [migrations/001_init.sql](/Users/meine/dev/temptracks/migrations/001_init.sql) 기준으로 관리

## Important Files

- `docs/architecture.md`: 전체 설계안
- `docs/mvp-plan.md`: 현재 MVP 확정안
- `docs/dev-checklist.md`: 다음 작업 체크리스트
- `docs/copy-guide.md`: 제품 문구 초안
- `sql/schema.sql`: DB schema
- `migrations/001_init.sql`: 실제 DB migration 시작점
- `scripts/apply-migrations.mjs`: Neon/Supabase 공용 migration runner
- `lib/providers/music`: provider abstraction
- `app/create/page.tsx`: 보드 생성
- `app/boards/[slug]/page.tsx`: 결과/공유 페이지
- `app/admin/page.tsx`: 관리자 페이지
