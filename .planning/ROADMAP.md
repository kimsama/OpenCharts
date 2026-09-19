# Roadmap: OpenCharts KB Market Data POC

## Overview

**Milestone:** v0.1 — KB Market Data POC
**Granularity:** coarse
**Milestone branch / OpenCharts PR base:** `milestone/kb-market-data-poc`

기존 OpenCharts와 KB backend를 연결해 사용자가 US/KR 시장과 티커를 직접 입력하고 조회 버튼으로 현재가와 일봉 차트를 확인한다. 기존 앱을 확장하는 하나의 작은 수직 슬라이스이며, 출처·시각·지연 상태와 실패 원인을 정확히 표시한다. 승인된 HTML 연구를 재사용하고, 두 저장소의 검증 및 독립 리뷰를 마친 PR을 제공한다.

## Phases

- [ ] **Phase 1: US·KR 수동 시세 조회 POC** - 입력한 종목의 현재가와 일봉을 KB backend에서 조회하고 연결·실패 상태를 검증한다.

## Phase Details

### Phase 1: US·KR 수동 시세 조회 POC

**Goal**: 사용자가 US/KR 시장을 선택하고 티커를 자유롭게 편집해 수동 조회하면, 기존 KB backend를 통해 해당 종목의 현재가와 일봉 차트를 확인하고 출처·시각·지연 여부 및 오류 상태를 구분할 수 있다.
**Depends on**: Nothing (first phase); 기존 OpenCharts 및 KB backend의 인증·읽기 전용 전송 경계를 재사용한다.
**Requirements**: QUERY-01, QUERY-02, QUERY-03, QUERY-04, DATA-01, DATA-02, DATA-03, SAFE-01, SAFE-02, VERIFY-01, VERIFY-02, SHIP-01
**Success Criteria** (what must be TRUE):

  1. 사용자가 US/KR 시장과 임의의 지원 티커를 입력해 명시적으로 조회하면 기존 거래 내역 없이도 선택 계정의 KB 연결을 통해 현재가와 일봉 차트를 확인한다. US 대소문자 정규화와 한국 6자리 코드의 선행 0이 유지되며, 요청·재시도·반환 봉 수는 제한된다. (QUERY-01, QUERY-02, DATA-01, DATA-02)
  2. UI에서 요청 시장·종목, 통화, 출처, 제공된 공급자 시각, 수집 시각과 지연/미확인 상태를 확인할 수 있다. 누락된 가격·거래량·시각은 만들어 채우지 않으며, 잘못된 숫자·날짜 또는 다른 시장·종목의 응답과 검증되지 않은 거래소 라우팅을 정상 결과로 표시하지 않는다. (QUERY-03, DATA-02, DATA-03)
  3. 사용자가 잘못된/미지원 티커, 설정 누락, 공급자 거절·데이터 없음, 시간 초과, backend 오프라인을 구분할 수 있다. 연속 조회 시 이전 요청의 늦은 응답이 새 결과를 덮거나 이전 봉을 새 종목으로 표시하지 않는다. (QUERY-04)
  4. 연결된 POC에서 조회할 때 브라우저에 비밀키·토큰·원본 계좌번호·공급자 원문이 전달되지 않고, 허용된 로컬 읽기 경로로만 접근한다. 해당 화면에는 데모 피드나 모의 주문 동작이 섞이지 않으며 기존 데모는 별도로 이용할 수 있다. (SAFE-01, SAFE-02)
  5. 사용자가 양 시장의 입력 경계·실패·지연 표기·요청 순서를 다룬 테스트와 frontend production build 결과, 실제 로컬 브라우저의 입력 → backend → 정규화 응답 → 차트 검증 기록을 확인할 수 있다. 실제 연결의 자격·권한 부족은 명시적으로 기록되며, 두 PR은 현재 HEAD 독립 리뷰에서 P0=0/P1=0에 도달하고 required checks 상태 및 남은 P2를 보고한다. (VERIFY-01, VERIFY-02, SHIP-01)

**Plans**: 3 plans

Plans:
**Wave 1**

- [ ] 01-01-PLAN.md — US HTTP backend tracer and KR snapshot expansion

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 01-02-PLAN.md — Both-market connected page, fixed proxy and browser path

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 01-03-PLAN.md — Browser/live evidence and two reviewed open PRs

**UI hint**: yes

### Delivery Boundaries

- `$gsd-plan-phase 1`로 기존 앱에 맞는 구체적인 계획을 작성한다. 별도 초기 골격이나 일반 broker 추상화를 추가하지 않는다.
- 계획 실행은 `$executing-plans`의 subagents mode, `$subagent-driven-development`, TDD를 사용한다. 각 task는 구현 → 독립 spec-compliance review → 독립 code-quality review 순서로 통과한다.
- 계획·advisor·독립 리뷰는 `gpt-6-astra`, 구현·수정은 `gpt-5.6-sol`을 사용하며 임의 대체하지 않는다.
- OpenCharts phase branch는 `milestone/kb-market-data-poc`에서 만들고 동일 branch를 PR base로 사용한다. KB backend는 별도 worktree의 `feat/opencharts-market-data-poc`에서 변경하고 PR base는 `dev`로 둔다. 두 원본 dirty worktree와 기존 프로세스를 보존한다.
- 두 저장소의 요청/응답 계약을 먼저 확정한다. 파일·프로세스 소유권과 의존성이 분리된 작업만 병렬로 실행하고 실제 연결 검증은 양쪽 구현 이후 수행한다.
- PR 반복 리뷰마다 원래 findings를 수정 전에 게시하고, 수정 내용·commit·검증 근거를 별도 comment에 남긴다. 새 HEAD를 다시 리뷰하며 required checks가 있으면 최종 리뷰 HEAD에서 통과한 것을 확인한다.
- 이번 전달 범위는 검토를 마친 **열린 PR 두 개**까지다. 병합과 branch 삭제는 별도 통합 요청 이후에 수행한다.
- 실주문, WebSocket, 자동 polling, 전역 종목 검색·자동완성, 새 자격 증명 UI는 범위 밖이다. 공개 API 예제나 모의 테스트를 live 권한·실시간 시세 성공의 증거로 취급하지 않는다.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. US·KR 수동 시세 조회 POC | 0/3 | Not started | - |

## Coverage

v1 요구사항 **12/12**를 Phase 1에 각각 한 번 매핑했다. 미매핑 및 중복 요구사항은 없다. 상세 추적은 `REQUIREMENTS.md`의 Traceability를 따른다.
