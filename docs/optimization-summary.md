# Optimization Summary

By Degrees에서 운영 비용, Vercel 사용량, 외부 API 안정성을 줄이기 위해 적용한 최적화 작업을 정리합니다.

## Vercel 사용량 대응

### Image Optimization Transformations

- Vercel 알림: `Image Optimization - Transformations` 무료 한도 5,000건 소진
- 관련 개념: `next/image`가 이미지를 요청 크기별로 변환할 때 transformation으로 집계됨
- 위험: 한도 초과 후 새 이미지 변환 요청이 에러날 수 있음
- 적용 작업:
  - `next.config.ts`에서 `images.unoptimized = true` 설정
  - Vercel Image Optimization을 프로젝트 단위로 우회
  - 랜딩 히어로 목업 PNG를 WebP 정적 파일로 사전 압축
  - `my-playlist-angle.png` 약 1.7MB -> `my-playlist-angle.webp` 약 75KB
  - `landing-mockup.png` 약 1.8MB -> `red-velvet-angle.webp` 약 78KB
  - 원격 앨범아트는 이미 `Image unoptimized`로 처리해 Vercel 이미지 변환 사용량을 줄임
- 관련 파일:
  - `next.config.ts`
  - `components/home-page-content.tsx`
  - `components/song-card.tsx`
  - `components/search-song-dialog.tsx`
  - `public/images/hero-phone/*.webp`

### Edge Requests

- Vercel 알림: `Edge Requests` 무료 한도 1,000,000건의 75% 사용
- 관련 개념: 페이지, API, 이미지, 정적 파일 등 Vercel Edge로 들어오는 요청 수
- 위험: 무료 한도 초과 시 프로젝트가 자동 일시정지될 수 있음
- 적용 작업:
  - 페이지뷰 이벤트를 같은 브라우저 세션과 같은 경로에서는 한 번만 전송하도록 중복 방지
  - UTM/referrer 파라미터가 다른 유입은 별도 이벤트로 남겨 attribution은 유지
  - 방문 추적 요청은 `navigator.sendBeacon`을 우선 사용하고, 실패 시 `fetch(..., keepalive: true)`로 fallback
- 관련 파일:
  - `components/page-view-tracker.tsx`
  - `app/api/events/route.ts`

### Fluid Active CPU

- Vercel 알림: `Fluid Active CPU` 무료 한도 4시간의 75% 사용
- 관련 개념: Serverless/Fluid Function, API route, 동적 페이지가 실제로 CPU를 사용한 시간
- 위험: 무료 한도 초과 시 프로젝트가 자동 일시정지될 수 있음
- 적용 작업:
  - 페이지뷰 이벤트 중복 호출을 줄여 `/api/events` 함수 호출과 DB write를 감소
  - 이미지 최적화 우회로 Vercel 측 이미지 변환 작업 제거
  - 음악 검색 결과 캐시와 stale fallback으로 외부 API 재호출 및 서버 처리 부담 감소
  - 관리자 통계 화면은 실운영에 필요한 핵심 지표 위주로 정리해 불필요한 집계와 UI를 줄임
- 관련 파일:
  - `components/page-view-tracker.tsx`
  - `lib/providers/music/itunes.ts`
  - `lib/providers/music/spotify.ts`
  - `lib/db/music-search-cache.ts`
  - `lib/analytics.ts`
  - `app/admin/page.tsx`

## 외부 API 안정화

### 음악 검색 캐시

- 문제: Spotify rate limit과 외부 검색 API 장애가 생성 플로우 전체를 흔들 수 있음
- 적용 작업:
  - 음악 검색 provider를 iTunes 중심으로 전환
  - provider-neutral `/api/music/*` route 사용
  - 서버 메모리 캐시와 Neon DB 캐시 적용
  - 검색 실패 시 14일 이내 stale cache fallback 사용
  - 캐시 워밍 스크립트 추가
  - provider별 캐시 key를 분리해 Spotify/iTunes 결과가 섞이지 않도록 정리
- 효과:
  - 반복 검색의 외부 API 호출 감소
  - 검색 장애 시에도 이전 결과로 생성 플로우 유지
  - 서버 처리량과 외부 API 의존도 감소
- 관련 파일:
  - `lib/api/music-search.ts`
  - `lib/providers/music/index.ts`
  - `lib/providers/music/itunes.ts`
  - `lib/providers/music/spotify.ts`
  - `lib/db/music-search-cache.ts`
  - `scripts/seed-itunes-cache.mjs`
  - `scripts/seed-spotify-cache.mjs`

### 점검 공지 자동화

- 문제: 검색 실패가 반복될 때 사용자 경험과 운영 대응이 늦어질 수 있음
- 적용 작업:
  - 같은 route/query/error 조합이 일정 횟수 이상 반복될 때만 점검 공지 활성화
  - 단발성 실패로 바로 점검 공지가 켜지지 않도록 완화
  - Discord webhook으로 운영 알림 전송
  - 관리자 화면에서 점검 공지를 수동으로 해제 가능
- 효과:
  - 일시적 오류에 과민 반응하지 않음
  - 실제 장애에는 운영자가 빠르게 대응 가능

## 사용자 흐름 최적화

### 공유와 저장

- 문제: X 웹 intent만으로는 이미지 첨부 흐름이 환경별로 불안정함
- 적용 작업:
  - Web Share API 기반 네이티브 이미지 공유 시도
  - 지원하지 않는 브라우저에서는 기존 X intent/link copy로 fallback
  - 이미지 준비 전 공유 시도에 대한 안내 처리
- 효과:
  - 모바일에서 이미지 공유 성공률 개선
  - 링크 공유와 이미지 공유를 환경에 맞게 분기
- 관련 파일:
  - `components/local-preview-client.tsx`
  - `lib/image-file.ts`

### 랜딩 히어로

- 문제: 360도 회전 목업은 이미지 기반 구현에서 부자연스럽고, 큰 PNG는 네트워크 비용이 큼
- 적용 작업:
  - 360도 회전 대신 두 플레이리스트 화면이 자연스럽게 전환되는 목업 애니메이션 적용
  - 기존 PNG 목업을 WebP로 사전 압축
  - 이미지 전환 버전 코드는 유지하면서 현재 랜딩은 전환 목업을 사용
- 효과:
  - 랜딩 첫 화면의 시각적 설명력 유지
  - 네트워크 전송량과 이미지 변환 비용 감소
- 관련 파일:
  - `components/home-page-content.tsx`
  - `app/globals.css`
  - `public/images/hero-phone/*.webp`

## 관리자 대시보드 최적화

- 문제: 운영자가 보지 않을 통계가 많으면 실제 의사결정에 방해가 되고, 불필요한 집계도 늘어남
- 적용 작업:
  - 생성 완료, 저장 시도, 공유 같은 실운영 핵심 지표 중심으로 재구성
  - 생성 추이 막대그래프 집계 수정
  - 기온구간 인사이트와 설명성 섹션 제거
  - 방문 -> 생성 -> 저장/공유 흐름을 더 직접적으로 보이도록 퍼널 정리
- 효과:
  - 대시보드 스캔 속도 개선
  - 운영자가 실제로 볼 지표에 집중
  - 불필요한 시각화와 집계 부담 감소
- 관련 파일:
  - `app/admin/page.tsx`
  - `components/admin-chart.tsx`
  - `lib/analytics.ts`

## 앞으로 볼 것

- Vercel Usage에서 Edge Requests가 계속 빠르게 증가하면 봇/크롤러 유입 여부 확인
- 봇 유입이 크면 Vercel Firewall 또는 rate limit 적용 검토
- `/api/events`가 여전히 높으면 이벤트 sampling 또는 batch 전송 검토
- 랜딩 점검 공지 때문에 홈이 dynamic rendering을 유지 중이므로, 필요하면 공지 상태를 캐싱하거나 클라이언트 fetch로 분리 검토
- 큰 PNG 원본은 디자인 백업으로 남기되, 실제 런타임에서는 WebP/AVIF 정적 파일만 사용
