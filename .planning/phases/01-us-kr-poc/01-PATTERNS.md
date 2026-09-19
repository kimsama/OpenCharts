# Phase 1: US/KR Manual Market Lookup POC - Pattern Map

**Mapped:** 2026-09-19
**Scope:** OpenCharts 연결 화면 중심의 최소 패턴 지도. KB는 RESEARCH의 지정 seam만 확인했다. 아래 새 파일명은 제안이며 PLAN에서 확정한다.
**Files classified:** 17 (선택적 CSS 수정 포함)
**Analogs:** 13 matched / 17; exact 7, role-match 6, none 4.

## File Classification

`OC` = OpenCharts worktree, `KB` = kb-us-stock-trading-journal/.worktrees/opencharts-market-data-poc. 모든 기존 경로는 해당 repository의 `git ls-files -- <path>`로 tracked임을 확인했다.

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| OC `src/main.tsx` | config | event-driven | 동일 파일 66–79 | exact |
| OC `src/App.tsx` | component | event-driven | 동일 파일 12–44 | exact |
| OC `src/pages/MarketLookupPage.tsx` (new) | component | request-response | `src/App.tsx` 13–33의 state/cancellation만 | role-match |
| OC `src/components/MarketSnapshotChart.tsx` (new) | component | transform | `src/pages/trading/ChartPanel.tsx` 1435–1468, 1563–1571, 1632–1647, 1790–1799 | role-match |
| OC `src/services/marketSnapshot.ts` (new; DTO 포함) | service | request-response | 전용 account-scoped HTTP snapshot analog 없음 | none |
| OC `vite.config.ts` | config | request-response | 동일 파일 37–48 | exact |
| OC `src/styles/global.css` (필요한 경우만) | config | transform | 동일 파일 1–32 | exact |
| OC `src/__tests__/market-lookup.test.tsx` (new) | test | event-driven | `src/__tests__/button.test.tsx` 1–18 | role-match |
| OC `src/__tests__/market-snapshot.test.ts` (new) | test | request-response | 전용 HTTP contract 검증 analog 미확인 | none |
| KB `src/kb_journal/api/router.py` | route | request-response | 동일 파일 31–45 | exact |
| KB `src/kb_journal/api/market_snapshot.py` (new) | route | request-response | 등록 패턴만 확인, account snapshot endpoint 신규 | none |
| KB `src/kb_journal/broker_sync/coordinator.py` | service | request-response | 동일 파일 `_kb_lease` 883–892 | exact |
| KB `src/kb_journal/broker_sync/adapters/kb/adapter.py` | service | request-response | 동일 파일 `read_retained_daily_prices` 291–301 | exact |
| KB `src/kb_journal/broker/adapters/kb/adapter.py` | service | request-response | 기존 `_read_daily_prices` 425–470 | role-match |
| KB `tests/broker/test_kb_adapter.py` | test | request-response | 동일 파일 (RESEARCH 지정 테스트 소유권) | role-match |
| KB `tests/broker_sync/test_coordinator.py` | test | request-response | 동일 파일 (RESEARCH 지정 테스트 소유권) | role-match |
| KB `tests/api/test_market_snapshot.py` (new) | test | request-response | 신규 route contract; 기존 fixture는 구현 시 좁게 확인 | none |

`persistence.py:get_single_active_kb_connection_for_account`는 수정 대상이 아니라 호출 재사용 대상이다. DTO를 별도 파일로 나누기보다 기존 타입 소유권에 맞춰 배치하고, 필요시 PLAN의 files_modified에 실제 타입 파일을 명시한다. `vitest.config.ts`와 `src/__tests__/setup.ts`는 기존 설정을 재사용한다.

## Pattern Assignments

### 연결 진입점: `src/main.tsx`, `src/App.tsx`, `MarketLookupPage.tsx`

**Imports/source:** `src/App.tsx:1–3`:

```tsx
import { useEffect, useState } from "react";
import { TradingPage } from "./pages/TradingPage.tsx";
import { useAuthStore, useTradingStore } from "./services/store.tsx";
```

**현재 부팅 경계:** `src/App.tsx:18–21`:

```tsx
useEffect(() => {
  let cancelled = false;
  async function boot() {
    await demoLogin();
```

실제 24–27행은 `localStorage.setItem("is_demo", "false")`, `useAuthStore.setState`, `loadSymbols()/loadAccounts()`와 `if (!cancelled) setReady(true)`이다. cancellation 기법은 수명주기 참고용이며 여러 요청의 순서를 보장하지 않는다. 연결 화면은 제출 시 identity를 snapshot으로 저장하고 request sequence 또는 AbortController와 commit guard로 이전 응답을 배제한다. edit 상태로 결과 제목을 렌더링하지 않는다.

**전역 mount:** `src/main.tsx:70–74`:

```tsx
<BrowserRouter>
  <MarketDataBridge />
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
```

별도 connected entry 또는 entry 수준 dynamic import 분기로 demo 트리의 import/mount 전 분리한다. App 내부 JSX 분기만 추가하면 위 bridge mount와 아래 PostHog 모듈 평가가 남는다. 작은 demo shell은 기존 초기화 동작을 그대로 소유하게 하고 연결 페이지는 demo stores, queries, feed, paper engine에 의존하지 않는다. 기존 demo 접근 경로를 유지한다.

### 차트: `MarketSnapshotChart.tsx`

**Analog:** `src/pages/trading/ChartPanel.tsx`; 전체 terminal component를 가져오지 않는다.

생성 guard `1435–1440`:

```tsx
useEffect(() => {
  if (!containerRef.current) return;

  const minMove = getMinMove(pipDigits);

  const chart = createChart(containerRef.current, {
```

크기 변경 `1563–1571`:

```tsx
const ro = new ResizeObserver((entries) => {
  for (const entry of entries) {
    chart.applyOptions({
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    });
  }
});
ro.observe(containerRef.current);
```

정리의 필요한 문장만 `1635`, `1640–1643`에서 재사용:

```tsx
ro.disconnect();
chart.remove();
chartRef.current = null;
candleSeriesRef.current = null;
volumeSeriesRef.current = null;
```

데이터 교체 `1797–1798`:

```tsx
series.setData(chartData);
volumeSeriesRef.current?.setData(volumeData);
```

기존 empty-array early return(1792)과 `vol?.value || 0`(1558)은 복사하지 않는다. 새로운 identity/error/empty 결과에 이전 차트를 지우고, 없는 volume은 histogram에서 제외한다. 일봉 날짜는 거래일 그대로 사용하고 UTC 시각으로 임의 변환하지 않는다. 숫자 변환 전에 decimal string, finite 값, OHLC 관계 및 날짜 유일성 검증을 통과시킨다. StrictMode 재마운트에서 chart/observer 누수가 없어야 한다.

### 서비스와 proxy: `marketSnapshot.ts`, `vite.config.ts`

**기존 설정 analog:** `vite.config.ts:37–43`:

```ts
server: {
  port: 5173,
  proxy: {
    "/api": {
      target: "http://localhost:3000",
      changeOrigin: true,
    },
```

이것은 proxy 문법 analog일 뿐 read allowlist 보장이 아니다. 새 연결용 prefix를 고정 loopback KB 대상과 고정 snapshot path에만 연결하고 method/path/query를 검증한다. 클라이언트가 upstream URL/TR/계정 원문을 지정하는 전달 구조는 만들지 않는다. 기존 `/api` 및 `/ws` 설정의 범용 권한을 연결 모드에 그대로 노출하지 않는다. 계정 선택은 허용된 별칭/opaque identity로 제한한다.

신규 service는 native `fetch`와 typed DTO로 충분하다. 성공 payload의 제출 identity 일치, nullable fields와 제한된 bars를 검증하며 raw body를 UI 오류에 붙이지 않는다. 수동 조회만 실행하고 retry/polling/focus refetch를 추가하지 않는다. main의 QueryClient 기본 retry=2(11–18)는 수동 조회 정책으로 무심코 상속하지 않는다.

### UI 스타일과 테스트

`src/styles/global.css:1–3`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

같은 파일 8–24의 background/card/muted/destructive/border/input 변수를 쓰는 기존 Tailwind utilities를 재사용한다. 전용 디자인 시스템이나 새 패키지는 불필요하다.

`src/__tests__/button.test.tsx:1–4`, `12–17`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";
```

```tsx
it("handles click events", async () => {
  const user = userEvent.setup();
  let clicked = false;
  render(<Button onClick={() => (clicked = true)}>Go</Button>);
  await user.click(screen.getByRole("button"));
  expect(clicked).toBe(true);
```

`vitest.config.ts:8–13`은 jsdom, `src/__tests__/setup.ts`, `src/**/*.test.{ts,tsx}`를 이미 설정한다. setup은 jest-dom/vitest import 하나다. 위 테스트 구조를 그대로 쓰되 실제 의미 있는 확인은 선행 0, 수동 제출, US/KR 식별자, delayed/unknown, 오류/빈 데이터, 늦은 이전 응답, demo/telemetry 미초기화다. 차트는 jsdom에서 API를 최소 stub하고 resize/remove 호출과 데이터 전달을 확인한다. 기존 KB 테스트 두 파일은 RESEARCH에서 지정한 소유권만 확인했으며 이 지도는 읽지 않은 fixture 이름을 만들지 않는다.

### KB account guard, lease, fixed read

**재사용, 수정 불필요:** `src/kb_journal/broker_sync/persistence.py:648–673`. 쿼리는 account 연결 join 및 live/non-synthetic/active KB 조건을 모두 적용한다. 끝부분 `671–673`:

```python
if len(connections) != 1:
    raise BrokerSyncError("no single active KB connection")
return _connection_record(session, connections[0])
```

**Coordinator analog:** `src/kb_journal/broker_sync/coordinator.py:883–892`:

```python
def _kb_lease(self, session: Session, record: ConnectionRecord) -> _ActiveKbLease:
    active = self._active.get(record.connection_id)
    if active is None:
        if record.connection_id in self._kb_manual_sync_required:
            raise BrokerSyncError("KB refresh failed; run an explicit broker sync")
        return self._acquire_new_kb_lease(session, record)
    refusal = self._active_kb_lease_refusal(session, record, active)
    if refusal is None:
        return active
    raise BrokerSyncError(refusal)
```

snapshot read는 기존 lock/session 및 failure retirement 경로 안에서 이 lease를 사용한다. 단순 성공 후 close하거나 별도 token 저장소를 만들지 않는다. 새 quote/daily 메서드도 auth failure quarantine와 manual-sync latch를 우회하지 않는다.

**Retained wrapper:** `src/kb_journal/broker_sync/adapters/kb/adapter.py:297–301`:

```python
return self._read_retained(
    credential_context,
    binding_id,
    lambda token: token.read_daily_prices(request),
)
```

**Fixed provider body:** `src/kb_journal/broker/adapters/kb/adapter.py:447–454`:

```python
"krx_cd": request.market,
"is_cd": request.symbol,
"chrt_clsf": "3",
"bndl": "",
"mdfy_stk_prc_use_f": "0",
"rcrd_c": str(request.limit),
"srch_strt_dy": "",
"clsf": "1",
```

같은 파일 432–441은 request type/token/credential/market/limit를 검사하고 실패 시 `BrokerReadError()`를 낸다. 463–469는 provider resultCode/processFlag/processCode를 검사한다. 새 고정 quote/KR read도 이 trust boundary 형식을 따른다. US daily body를 KR schema로 재사용하지 않는다. KR 운영값은 공식 metadata가 확인되기 전 guessed literal로 활성화하지 않는다.

**Router 등록:** `src/kb_journal/api/router.py:38`:

```python
api_router.include_router(chart_v2_router)
```

새 전용 router를 같은 등록 방식으로 연결하되 기존 chart subject 및 cross-account price-source fallback을 snapshot 조회에 가져오지 않는다. route에서 validation/sanitized exception mapping을 명시적으로 구현한다.

## Shared Patterns

### Telemetry boundary — source-backed, scoped

`src/App.tsx:2`의 정적 TradingPage import → `src/pages/TradingPage.tsx:20`의 PostHog import → `src/lib/posthog.ts:7–13`:

```ts
if (apiKey) {
  posthog.init(apiKey, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
  });
}
```

API key가 설정되면 모듈 평가 때 초기화된다. 계정 별칭이 있는 연결 페이지는 이 import chain을 실행하지 않게 entry에서 분리한다. `person_profiles`가 모든 수집을 비활성화한다는 해석은 금지한다. 별칭을 URL/query나 analytics properties에 넣지 않는다. 위 코드는 가능한 수집 경로의 증거이며 실제 유출 관측은 아니다. demo의 analytics 전체를 재설계할 근거는 없으므로 entry 격리와 이를 검증하는 테스트로 범위를 제한한다. demo에서 연결 페이지로 이동할 때 이미 초기화된 런타임을 공유하지 않는 경계도 확인한다.

### Validation / Error handling

UI의 문자열 identity를 보존하고 backend가 최종 검증한다. KR 6자리, US bounded ticker 및 명시적 routing exchange만 허용한다. unsupported venue를 다른 거래소로 조용히 바꾸지 않는다. acquired-at와 provider timestamp는 서로 대체하지 않는다. quote/bar가 없으면 missing 그대로 표시하며 0으로 보정하지 않는다. backend 실패 응답은 credential/provider payload를 포함하지 않는 고정 메시지다.

## No Analog Found

| File | Role / Data Flow | Reason |
|---|---|---|
| OC `src/services/marketSnapshot.ts` | service / request-response | demo facade와 분리된 account-bound KB DTO/HTTP contract 신규 |
| OC `src/__tests__/market-snapshot.test.ts` | test / request-response | identity/nullable/bar validation 전용 테스트 신규 |
| KB `src/kb_journal/api/market_snapshot.py` | route / request-response | 거래 subject 없이 arbitrary ticker 조회하는 전용 route 신규 |
| KB `tests/api/test_market_snapshot.py` | test / request-response | 새 route contract; 구현 시 기존 API fixture를 좁게 선택 |

## Metadata

- Analog search scope: OpenCharts entry/chart/styles/test setup/telemetry, RESEARCH가 지목한 KB seam.
- 5개 핵심 frontend analog family: entry, chart lifecycle, test, style, proxy. 전역 bridge/telemetry는 격리 경계 증거다.
- KB 테스트 파일은 tracked 확인 및 RESEARCH의 지정만 활용; fixture 내용 검증은 이 지도 범위 밖이다.
- No source edits, dependency changes, test execution, commits, or runtime/live validation performed.
- Pattern extraction date: 2026-09-19.
