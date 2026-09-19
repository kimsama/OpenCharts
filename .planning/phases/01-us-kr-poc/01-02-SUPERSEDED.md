---
phase: 01-us-kr-poc
plan: "02"
status: superseded
superseded_by: ["01-04", "01-05", "01-06"]
type: execute
wave: 2
depends_on: ["01-01"]
files_modified:
  - kb.html
  - index.html
  - vite.config.ts
  - src/kb-main.tsx
  - src/pages/MarketLookupPage.tsx
  - src/components/MarketSnapshotChart.tsx
  - src/services/marketSnapshot.ts
  - src/__tests__/market-lookup.test.tsx
  - src/__tests__/market-snapshot.test.ts
  - src/__tests__/market-proxy.test.ts
  - e2e/market-lookup.spec.ts
  - playwright.kb.config.ts
  - kb-us-stock-trading-journal/tests/market_snapshot_fixture_server.py
autonomous: true
requirements: [QUERY-01, QUERY-02, QUERY-03, QUERY-04, DATA-03, SAFE-01, SAFE-02, VERIFY-01]
estimate:
  tokens: 24000
  raw_tokens: 24000
  tasks: 1
  confidence: low
must_haves:
  truths:
    - "D-01/D-02/UI-01: A labelled account alias, US/KR and query-market selector plus editable ticker trigger quote/daily chart only by explicit button/Enter submission."
    - "E-01: Invalid input causes no snapshot call and Korean 005930 retains its leading zero through the real browser/backend path."
    - "D-04/E-03/UI-03: Submitted identity, USD/KRW, source, acquisition time, available provider time and actual delayed/unknown status are visible; missing values remain absent."
    - "E-02/UI-02: Edited input does not relabel a prior result; only the latest submitted account/market/query-market/symbol can own a completed result."
    - "E-05/E-06/UI-05: Offline/refused/timeout/empty and mismatched/malformed replies show announced scoped errors and clear incompatible bars."
    - "D-05/E-07: Connected bootstrap and full-document navigation isolate demo/feed/paper/telemetry initialization while the original demo remains reachable."
    - "UI-04: Keyboard focus, explicit labels, status announcement, 390px no-overflow layout and disposed chart/observer lifecycle work."
  prohibitions:
    - statement: "P-01: No order TR, arbitrary provider path, credential leak, raw payload in public response"
      status: resolved
      verification: explicit
    - statement: "P-02: No synthetic quote/volume or crypto replay fallback in connected mode"
      status: resolved
      verification: explicit
    - statement: "P-03: No relabelling an unverified Cboe instrument as Nasdaq"
      status: resolved
      verification: explicit
  artifacts:
    - path: kb.html
      provides: "Independent connected document entry"
    - path: src/pages/MarketLookupPage.tsx
      provides: "Both-market manual form and committed result ownership"
    - path: src/components/MarketSnapshotChart.tsx
      provides: "Validated date-only candles and nullable-volume display"
    - path: src/services/marketSnapshot.ts
      provides: "Native fetch and validated normalized DTO"
    - path: vite.config.ts
      provides: "Fixed loopback GET-only read allowlist in kb mode"
    - path: e2e/market-lookup.spec.ts
      provides: "Actual browser/proxy/backend/coordinator/adapter path for both markets"
    - path: kb-us-stock-trading-journal/tests/market_snapshot_fixture_server.py
      provides: "Loopback actual FastAPI test server with only provider transport/credential substitution"
  key_links:
    - from: kb.html
      to: src/kb-main.tsx
      via: "Independent entry before demo imports"
    - from: src/pages/MarketLookupPage.tsx
      to: src/services/marketSnapshot.ts
      via: "Explicit validated submission and monotonic result ownership"
    - from: src/services/marketSnapshot.ts
      to: vite.config.ts
      via: "Exact /kb-api/accounts and account snapshot GET paths"
    - from: vite.config.ts
      to: kb-us-stock-trading-journal/src/kb_journal/api/market_snapshot.py
      via: "Fixed loopback target and /api/v1 rewrite to reviewed 01-01 route"
    - from: playwright.kb.config.ts
      to: kb-us-stock-trading-journal/tests/market_snapshot_fixture_server.py
      via: "Owned fixture backend process; frontend HTTP responses are not intercepted"
---

<objective>
HISTORICAL ONLY: the user corrected the assistant's separate-page interpretation. This plan is superseded by the native OpenCharts plans 01-04 through 01-06. Its original implementation/review records remain dated evidence, not acceptance of the corrected UI.
검토된 01-01 backend를 재사용하여 D-01부터 D-06의 US/KR 수동 조회 화면과 차트를 연결한다. 두 시장은 동일 DTO/컴포넌트의 선택값이므로 한 frontend task에서 함께 구현·검증하고 독립 리뷰한다. 01-01의 실제 API tracer 위에 브라우저 경로를 확장하며 기능 축소 없이 전체 입력/오류/접근성 경계를 완료한다.
</objective>

<execution_context>
실행: executing-plans의 subagents mode + subagent-driven-development + test-driven-development. gsd-execute-phase로 대체하지 않는다.
Implementer/fixer: gpt-5.6-sol. Advisor/spec reviewer/code-quality reviewer: gpt-6-astra. 모델 사용 불가 시 대체하지 않고 정확한 제한을 보고한다.
각 task의 RED → GREEN → REFACTOR 및 검증 후 독립 spec review, 다음 독립 quality review를 수행한다. 지적을 수정하고 재검토한 뒤 다음 계획을 시작한다. 다른 worker의 변경을 보존한다.
이 계획은 동일 frontend 파일과 DTO를 사용하는 한 응집된 UI task로 실행한다. US 후 KR 자동화 순서는 하나의 RED/GREEN/review 단위 안에서 수행하며 형식적인 별도 UI task/review cycle을 추가하지 않는다.
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-us-kr-poc/01-CONTEXT.md
@.planning/phases/01-us-kr-poc/01-SPEC.md
@.planning/phases/01-us-kr-poc/01-UI-SPEC.md
@.planning/phases/01-us-kr-poc/01-RESEARCH.md
@.planning/phases/01-us-kr-poc/01-PATTERNS.md
@.planning/phases/01-us-kr-poc/OFFICIAL-CONTRACT.md
@.planning/phases/01-us-kr-poc/COVERAGE.md
@.planning/phases/01-us-kr-poc/01-01-PLAN.md
@.planning/phases/01-us-kr-poc/01-01-SUMMARY.md
</context>

<repository_map>
OC is OpenCharts; KB is kb-us-stock-trading-journal. kb-us-stock-trading-journal/ is an external-owner prefix, not an OC subdirectory. The only KB edit in this plan is tests/market_snapshot_fixture_server.py; any production backend correction returns to its 01-01 owner and review gate before dependent verification.
Each automated command runs in its preceding cwd. Playwright is the sole owner of its Vite/fixture-backend processes and ports; KB_REPO_DIR is the assigned KB workdir and KB_MARKET_BACKEND_PORT is the test-owned loopback port. Configuration values remain local and are not published. Preserve both original worktrees/processes per D-08.
</repository_map>

<interfaces>
Use the reviewed 01-01 MarketSnapshot DTO and GET /api/v1/accounts plus GET /api/v1/accounts/{account_id}/market-data/snapshot wire contract unchanged. Public proxy prefix is /kb-api with only those two GET paths. Identity is the complete account_id/market/query_market/symbol tuple; prices stay decimal strings until chart-boundary validation. New service exports: MarketSnapshot, fetchMarketAccounts, fetchMarketSnapshot, validateMarketSnapshot. Vite addition: kbReadProxy. UI components: MarketLookupPage, MarketSnapshotChart; entry: mountConnectedMarketLookup.
</interfaces>

## Artifacts this phase produces

| Repository | New/modified file or symbol | Purpose |
|---|---|---|
| OC | kb.html, src/kb-main.tsx: mountConnectedMarketLookup; index.html link | Independent connected entry and preserved demo navigation |
| OC | MarketLookupPage, MarketSnapshotChart | Both-market native form and isolated daily chart |
| OC | marketSnapshot.ts: MarketSnapshot, fetchMarketAccounts, fetchMarketSnapshot, validateMarketSnapshot | Reviewed wire contract and bounded native fetch |
| OC | vite.config.ts: kbReadProxy and kb mode | Exact fixed loopback read proxy and multi-page build |
| OC | three market tests, e2e/market-lookup.spec.ts, playwright.kb.config.ts | Both-market behavior, proxy boundary and real HTTP browser tests |
| KB | tests/market_snapshot_fixture_server.py | Existing create_app test server; no production read-method changes |

## Bounded execution chunks

The same sole Sol worker completes all rows inside the one US/KR frontend task. These are working-set boundaries, not extra product tasks, handoffs to another implementer or independent review cycles. The 13 paths include four entry/build files, three production page/chart/client files, three unit tests, and three browser/config/fixture-harness files. At most six files are active in one row; prior-group contracts are carried as compact summaries, not reopened wholesale.

The phase's real API tracer is already reviewed in 01-01. This task expands it to the browser, keeps both markets together and finishes with the existing whole-task real HTTP verification. Read only each row's files and the exact existing analog spans needed by that row. OC and KB cwd values are defined in repository_map.

| Order | Active files/read scope (maximum 6) | Focused RED → GREEN command / output |
|---|---|---|
| F-A: DTO and exact proxy | OC `src/services/marketSnapshot.ts`; `vite.config.ts`; `src/__tests__/market-snapshot.test.ts`; `src/__tests__/market-proxy.test.ts` | In OC: `npm test -- src/__tests__/market-snapshot.test.ts src/__tests__/market-proxy.test.ts`. First fail both-market identity/null/malformed and proxy-denial cases, then make them GREEN using the reviewed backend DTO. |
| F-B: separate entry, form and chart | OC `kb.html`; `index.html`; `src/kb-main.tsx`; `src/pages/MarketLookupPage.tsx`; `src/components/MarketSnapshotChart.tsx`; `src/__tests__/market-lookup.test.tsx` | In OC: `npm test -- src/__tests__/market-lookup.test.tsx`. First fail both-market manual submission, request ownership, missing-volume, error/accessibility and cleanup cases, then make them GREEN. Consume F-A's summarized exports/proxy contract. |
| F-C: real HTTP browser and build | OC `e2e/market-lookup.spec.ts`; `playwright.kb.config.ts`; KB `tests/market_snapshot_fixture_server.py`; OC `vite.config.ts` only for the final multi-entry build wiring | In OC: `npm exec -- playwright test --config playwright.kb.config.ts` proves required US/KR/390px/isolation paths after their initial failing assertions. Then separately run `npm run build` and the existing verify block's two-entry output assertion. Reopen only a concrete failing file from F-A/F-B, not all earlier groups. |

After each row, retain a compact worker progress message containing current OC/KB HEAD SHAs, changed/uncommitted files, command and RED/GREEN result, agreed DTO/proxy/entry facts, unresolved contract/live limits, and next row. Do not add a checkpoint file or an extra commit. Zero collected tests or skipped required browser cases do not pass. Once all rows and the whole-task verify block pass, run independent spec review followed by independent quality review exactly once for the completed task; resolve findings before 01-03 starts. Internal chunk progress is never reported as a reviewed or completed product task.

<tasks>
<task type="tracer" tdd="true">
  <name>Task 1: US/KR 수동 입력을 실제 proxy/backend와 quote·일봉 차트에 연결한다</name>
  <reversibility rating="reversible">Separate entry, narrow dev proxy and UI using reviewed API; no database or broker lifecycle change.</reversibility>
  <files>kb.html, index.html, vite.config.ts, src/kb-main.tsx, src/pages/MarketLookupPage.tsx, src/components/MarketSnapshotChart.tsx, src/services/marketSnapshot.ts, src/__tests__/market-lookup.test.tsx, src/__tests__/market-snapshot.test.ts, src/__tests__/market-proxy.test.ts, e2e/market-lookup.spec.ts, playwright.kb.config.ts, kb-us-stock-trading-journal/tests/market_snapshot_fixture_server.py</files>
  <read_first>Both AGENTS.md; 01-01-SUMMARY.md and reviewed DTO/fixture hooks; 01-UI-SPEC.md, 01-PATTERNS.md, SPEC E/P tables; OC package.json, vite.config.ts, existing chart/test/style analog spans. Apply repository UI guidance already represented by approved UI-SPEC; no design restart. Reuse existing KB API test setup in the new fixture server.</read_first>
  <behavior>
    - RED first: real browser submits mixed-case US ticker, reaches actual Vite proxy/FastAPI/coordinator/adapter fixed reads and renders USD quote/candles; the same route handles 005930/KOSPI and a KOSDAQ fixture with KRW.
    - Buttons/Enter submit, keystrokes cause zero snapshot calls, US ticker normalizes, KR remains exactly six digits, and 조회 시장 never claims independently verified listing exchange.
    - Latest submission wins despite an aborted request resolving; late US after KR, KR after US, account change and unmount cannot commit stale results. Ordinary input edits keep the submitted title unchanged.
    - Fixed safe account listing and proxy reject disallowed methods/paths, escapes/traversal/encoded slash/duplicate keys/redirects before upstream I/O; malformed or mismatched DTOs fail closed.
    - Missing bid/ask/time/volume remains missing; failed/empty/new-identity results clear old candles and volume. Delay derives only from validated response.
    - A configured telemetry-key spy, browser request log and full-document navigation prove demo/feed/paper/telemetry never initializes on connected entry.
    - Labels, keyboard focus, announced errors, 390px no-overflow, ResizeObserver cleanup and chart removal work including StrictMode remount.
  </behavior>
  <action>
    Per D-01/D-02/D-03/D-04/D-05/D-06 begin with failing Vitest and real HTTP Playwright checks for the reviewed API contract. Add tests/market_snapshot_fixture_server.py by reusing the existing actual create_app test setup: temporary synthetic account/connection and mock only provider transport/credential storage. The fixture process binds loopback, never reads real credential configuration, and cannot activate production market gates; test-only injection supplies accepted-market fixtures. It must expose both-market success and malformed/delayed/error scenarios without adding production debug endpoints. Playwright owns fixture-backend and Vite kb-mode processes with reuseExistingServer disabled, assigned unused ports and 45-second per-test timeout. Browser routing must not intercept normalized snapshot responses; tests exercise actual frontend, proxy, route, coordinator and adapter.

    Add kb.html and src/kb-main.tsx as a separate React entry importing only the new page/service/chart and existing global style. Keep src/main.tsx and App.tsx demo initialization unchanged. Add an ordinary full-document navigation link from index.html to kb.html and a return link; do not use SPA navigation that retains a loaded telemetry runtime. Build both HTML entries using Vite rollup input. Connected import graph must exclude TradingPage/PostHog/MarketDataBridge/demo stores; verify this with a browser module/telemetry spy including a configured test telemetry key.

    Make Vite mode kb loopback-only with one fixed backend target built from host 127.0.0.1 and server-owned numeric KB_MARKET_BACKEND_PORT (no arbitrary URL). In this mode remove the legacy broad /api and /ws proxy permissions. Permit only exact GET /kb-api/accounts and GET /kb-api/accounts/{UUID}/market-data/snapshot with the declared query keys/values; validate decoded path once and reject malformed escapes, traversal, encoded slash, duplicate keys and redirect responses. Rewrite only to the matching /api/v1 path. Deny other prefix paths and non-GET methods before upstream I/O. Preserve backend host/origin protections; do not strip Origin to evade them or enable wildcard CORS. Send only required headers, no client authorization/cookies to the broker, and use no-store responses. Default demo dev mode keeps its existing behavior and does not gain the KB proxy.

    Render the UI contract with native labelled account alias/US-KR/query-market/ticker controls, no credential entry; fetch safe accounts once on mount but never quote automatically. Use native fetch, AbortController plus monotonic commit guard, committed request identity, loading/error aria-live text, USD-or-KRW/source/time/delay display, bid/ask only when supplied, and one lightweight-charts view. Keep result title bound to submitted identity while editing. Limit/validate DTO before Number conversion, check finite chart numbers, use BusinessDay date strings, omit missing histogram rows, clear both series on transition and dispose ResizeObserver/chart on cleanup/StrictMode. Form wraps at 390px without horizontal document overflow. Submit remains available after bounded failures. Treat an invalid route/unsupported exchange explicitly; no guessed DRAM venue mapping.

    Add market US/KR selector and market-specific query-market options (NAS/NYS/AMX versus KOSPI/KOSDAQ), preserving editable ticker and account alias. Label the selector 조회 시장 so it does not claim listing verification. Market/account changes invalidate pending result ownership and clear incompatible result/chart state; ordinary ticker edits leave the last submitted title unchanged until new submission. Complete delayed/unknown/error/accessibility/390px/chart-cleanup tests and real HTTP browser checks for both markets within this same task. Reuse the reviewed KB DTO and generated contracts without changing them. Run affected checks and one OC production build; obtain independent spec then quality review per D-07 before 01-03.

    Verify P-01 with proxy denial/DTO secret-sentinel tests; P-02 with no-data/missing-volume and connected-module/telemetry tests; P-03 with an unsupported routing or invented listing-venue claim that is rejected, while a supported provider query (including DRAM) remains labelled only as 조회 시장 without any hardcoded ticker ban. A failure in any negative case blocks task completion. This one both-market component/DTO task retains the full E-01..E-07 and UI-01..UI-05 behavior without introducing a second market pipeline.
  </action>
  <acceptance_criteria>The actual browser → exact read proxy → reviewed backend → normalized response → quote/chart path passes for US/KR fixtures. All E/P/UI rows have behavior evidence, original demo stays reachable, unsupported and blocked live markets are honest errors, and both independent reviews pass. Fixture wiring is never labelled live entitlement.</acceptance_criteria>
  <verify>
    <cwd repository="OC">OpenCharts</cwd>
    <automated>npm test -- src/__tests__/market-lookup.test.tsx src/__tests__/market-snapshot.test.ts src/__tests__/market-proxy.test.ts</automated>
    <fails_when>Vitest exits nonzero, reports no test files/tests, or any manual-submission, race, null preservation, identity, proxy-denial or isolation assertion fails. Do not enable passWithNoTests.</fails_when>
    <cwd repository="OC">OpenCharts</cwd>
    <automated>npm exec -- playwright test --config playwright.kb.config.ts</automated>
    <fails_when>Playwright exits nonzero, reports no tests, times out, fails to launch either owned server, or a required US/KR/390px/negative-path assertion fails. Both-market cases must run; skipped expected cases do not count as a pass.</fails_when>
    <cwd repository="OC">OpenCharts</cwd>
    <automated>npm run build</automated>
    <fails_when>Build exits nonzero, including TypeScript/Vite errors; dist/kb.html and dist/index.html must both be produced (confirmed by the following output assertion).</fails_when>
    <cwd repository="OC">OpenCharts</cwd>
    <automated>node -e "const fs=require('node:fs'); for(const p of ['dist/kb.html','dist/index.html']) if(!fs.existsSync(p)) throw new Error('Missing build entry: '+p)"</automated>
    <fails_when>Node exits nonzero naming a missing connected or demo build entry.</fails_when>
  </verify>
  <done>A user can manually enter either market's supported ticker and view that submitted quote/daily chart with truthful source/time/delay and safe errors. Both-market real application wiring and all boundary/race/UI tests pass; live validation and reviewed PR delivery remain 01-03.</done>
</task>
</tasks>

<threat_model>
ASVS level 1; high/critical findings block delivery.

| Boundary | Description |
|---|---|
| Browser → Vite → fixed local API | Strict GET/path/query allowlist and fixed target |
| Normalized DTO → displayed identity/chart | Validate values and identity before committing current request |
| Demo document → connected document | Independent import graph and full-document navigation |
| Test harness → runtime | Synthetic account/credential transport only; dedicated owned processes |

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-01-02 | Tampering | kbReadProxy | high | mitigate | Behavioral deny tests before upstream I/O; no redirect forwarding or origin bypass |
| T-01-03 | Information Disclosure | page/import graph | high | mitigate | Secret-sentinel and configured-key telemetry initialization tests |
| T-01-05 | Spoofing | result ownership | high | mitigate | Full submitted identity, abort plus monotonic commit guard and late-response tests |
| T-01-06 | Tampering | chart | medium | mitigate | Validate Decimal/date/bounds, omit missing volume and clear both series on failure |
| T-01-12 | Elevation of Privilege | fixture server | high | mitigate | Never reads real bindings; isolated transport-only fixtures and owned loopback processes |
| T-01-SC | Tampering | dependency supply chain | low | accept | Reuse installed locked React/Vite/Playwright/lightweight-charts; no installs |
</threat_model>

<verification>
Each command uses the immediately preceding repository cwd and its following failure signal. The new test/config paths are created in this task; no path-only probe counts as behavior verification. P-01 maps to market-proxy.test.ts and market-snapshot.test.ts; P-02 to market-lookup.test.tsx and the no-demo/telemetry Playwright cases; P-03 to market-snapshot.test.ts and labelled query-market Playwright checks. Backend prohibition coverage is recorded by 01-01. Prohibition YAML preserves the canonical resolved/explicit projection; verification must inspect actual passing negative evidence rather than infer a pass from descriptor absence.
01-03 owns the actual desktop/390px visual pass and separately labelled live acceptance. Reuse existing passing 01-01 evidence when code/config/dependencies are unchanged; record the exact combined tested SHAs for final review.
</verification>

<success_criteria>
QUERY-01..QUERY-04, UI portions of DATA-03/SAFE-01, SAFE-02 and frontend VERIFY-01 have actual passing evidence and independent reviews. Browser automation reaches the real backend, and both market options remain fully implemented even when production live prerequisites are blocked.
</success_criteria>

<output>
Create .planning/phases/01-us-kr-poc/01-02-SUMMARY.md with both repository SHAs, task review results, commands and full E/P/UI mapping. Do not merge either repository.
</output>
