# 업데이트 로그

- 기온별플리 / By Degrees의 주요 변경사항을 날짜별로 정리합니다.
- 커밋 단위 전체 목록 X 운영과 제품 관점에서 의미 있는 묶음 기준 O

## 2026-06-08

- 음악 provider 타입을 정식화
  - 내부 음악 결과 타입을 `spotify` / `itunes` provider로 분리
  - iTunes 검색 결과가 실제로 `provider: itunes`를 가지도록 수정
  - 검색 캐시 조회 / 저장을 provider별로 분리해 iTunes와 Spotify 캐시가 섞이지 않도록 정리
  - 기존 `itunes:*` 곡 데이터의 provider를 보정하고, 이전 구조의 iTunes 검색 캐시를 비우는 migration 추가
- 관리자 퍼널 시각화 개선
  - 방문 -> 생성 완료를 메인 퍼널 막대로 표시
  - 생성 전 이탈 수를 함께 표시
  - 저장 시도 / 공유는 생성 완료 이후의 분기 행동으로 따로 표시
  - 평균 선택 곡 수를 같은 퍼널 카드 안에서 확인할 수 있게 정리

## 2026-06-04

- 관리자 통계의 퍼널 기준을 명확히 분리
  - 상단 KPI는 생성 완료 이용자와 보드 수를 함께 표시
  - 퍼널은 방문자 / 생성 완료 이용자 / 저장 시도 이용자 / 공유 이용자처럼 고유 세션 기준으로 표시
  - 방문 -> 생성 전환율은 생성 완료 건수가 아니라 생성 완료 고유 세션 기준으로 계산
  - 관리자 숫자는 축약하지 않고 전체 숫자로 표시
- 인기 곡 TOP 10 집계를 곡 제목만이 아니라 provider track id 기준으로 분리
  - 제목이 같아도 아티스트나 실제 트랙이 다르면 별도 곡으로 집계
  - 관리자 화면에서 인기 곡 제목 아래 아티스트명을 함께 표시
- `/preview`, `/en/preview`에도 방문 이벤트 트래킹 추가
  - 같은 세션의 생성 플로우는 방문자수에 중복 반영되지 않음

## 2026-06-03

- 임시 음악 provider를 iTunes Search API 중심 전환 
  - iTunes 아티스트 / 곡 검색 provider 추가 
  - 기존 Spotify route는 alias로 유지하고, 클라이언트는 provider-neutral `/api/music/*` route를 사용하도록 정리
  - iTunes 검색 결과에 메모리 캐시와 Neon 캐시 적용 
  - 검색 실패 시 14일 이내 stale cache fallback을 사용하도록 보강
  - iTunes 검색 캐시 워밍 스크립트 추가 
- 검색 오류 운영 대응 개선
  - 단일 검색 실패 한 번으로 바로 점검 공지를 켜지 않고, 같은 route/query/error 조합이 일정 횟수 이상 반복될 때만 랜딩 점검 공지를 켭니다.
  - 점검 공지가 켜질 때 Discord webhook으로 운영 알림 전송 
  - 관리자 화면에서 점검 공지를 수동으로 내릴 수 있게 설정
- 점검 완료 알림 기능 추가 및 운영 방식 개선 
  - 랜딩 점검 공지 안에서 이메일로 점검 완료 알림 신청을 받을 수 있게 했습니다.
  - `maintenance_subscribers`에 이메일을 저장하고, 개인정보 안내 문구 추가. 
  - Resend 자동 발송 대신 관리자 화면에서 미발송 이메일 목록을 복사하고 Gmail 작성창을 BCC prefill로 열도록 변경
  - 발송 완료 후 `notified_at`을 기록하는 수동 운영 흐름 사용 
  - 발송 완료 후 3일이 지난 알림 신청자는 Vercel Cron으로 삭제하도록 cleanup API 추가 
- 관리자 대시보드 개선 
  - 일일 / 주간 / 월간 탭을 누르면 각각 오늘 / 이번 주 / 이번 달로 자동 이동
  - 국가별 / 대륙별 방문자 수와 생성 완료 이용자 수를 donut chart로 표시
  - 완성 기준 인기 아티스트를 TOP 10으로 확장
  - 검색 / 탐색 기준 통계를 제거하고 생성 완료 기준 지표에 집중
  - 관리자 로고 클릭 시 `by-degrees.vercel.app`을 새 탭으로 열도록 했습니다.
- 한국어 / 영어 플로우를 추가했습니다.
  - `/en`, `/en/create`, `/en/preview` route를 추가했습니다.
  - 랜딩 좌상단에 `KOR | ENG` 토글을 추가했습니다.
  - 영어권 국가 방문자는 언어 선택 쿠키가 없을 때 `/en`으로 soft redirect하도록 설정했습니다.
  - 생성 플로우, 검색 모달, 미리보기, 공유 문구를 locale copy dictionary로 분리했습니다.
  - X 공유 해시태그는 한국어 / 영어 플로우 모두 동일한 정책을 사용합니다.
- 공유 및 저장 UX 개선 
  - iTunes / Spotify 검색 결과 안내 문구를 필요에 따라 제거하거나 provider에 맞게 조정
  - 랜딩 페이지에 문의하기 mailto 버튼 추가
  - 랜딩 목업과 시작 버튼 간격 조정 
- 운영 비용 대응
  - 원격 앨범아트 이미지 최적화를 비활성화해 Vercel Image Optimization 사용량 초과를 줄였습니다.
  - favicon artwork 교체 
- 문서를 현재 운영 상태에 맞게 갱신
  - README, architecture, checklist, copy guide, MVP plan, design guide, env example을 iTunes 중심 운영 기준으로 업데이트

## 2026-06-02

- Spotify rate limit 대응 강화
  - Spotify 검색 결과를 Neon에 캐싱했습니다.
  - rate limit 상황에서 stale cache fallback을 사용했습니다.
  - rate limit 발생 시 사용자 안내 문구를 표시했습니다.
  - Spotify 호출 pause / cooldown 처리를 추가했습니다.
  - Discord webhook rate limit 알림을 추가했습니다.
- 운영용 점검 공지와 캐시 seed script 추가
- 생성 완료 보드를 DB에 저장해 analytics 집계 기반 안정화
- 관리자 퍼널 지표 개선 
  - 생성 완료 수, 저장 시도, 공유 지표 집계 
  - 퍼널 전환율을 세션 기준으로 계산
- 이미지 저장 트래킹 개선 
  - 실제 저장 완료 대신 저장용 이미지를 길게 누른 시도를 기준으로 기록
- 공유 UX 정리 
  - X 공유와 링크 복사 분리
  - 링크 공유 URL을 서비스 홈 URL로 고정

## 2026-06-01

- 관리자 대시보드 확장 
  - 기간 네비게이션 추가
  - 방문 / 생성 / 저장 / 공유 퍼널 지표 추가 
  - 인기 아티스트 / 곡 통계 추가 
  - 관리자 화면 디자인 개선 
  - 관리자 트래픽은 analytics에서 제외하도록 처리
- 랜딩과 결과 이미지 UI 개선 
  - 랜딩 hero mockup과 CTA 정리 
  - 긴 preview title 처리와 브랜드 header 정렬 개선 
- 제품 문서 업데이트

## 2026-05-31

- 모바일 생성 플로우와 preview 저장 UX 안정화
  - preview image rendering과 모바일 저장 흐름 보강 
  - 곡 중복 추가 확인, 빈 구간 안내 등 선택 가드레일 추가 
  - 생성 화면 UI와 preview 공유 액션을 다듬었습니다.
- 사이트 naming, metadata, Open Graph preview 정리 
- 관리자 analytics를 dynamic rendering으로 전환

## 2026-05-29

- Next.js App Router 기반 프로젝트 초기 구축 
- 기온별 플레이리스트 생성 / 미리보기 / 공유 MVP 구현 
- 음악 검색 API, playlist data, social sharing, mobile image save 흐름 추가 
- analytics와 관리자 대시보드 초안 구현 
- README와 배포 / 개발 워크플로 문서 작성 
