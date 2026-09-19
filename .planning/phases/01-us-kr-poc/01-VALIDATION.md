# Phase 1 validation evidence

Validation date: 2026-09-19

Status: Task 1 validation evidence and current MU/KOSPI interactive verification complete. SHIP-01, pull requests and remote CI remain pending.

## Current interactive status — 2026-09-19

Normal development-server startup and safe account listing were observed, but the first lookup using the default-bound selection failed. The user reported the failure and root separately reproduced MU as HTTP 503 `connection_unavailable`. Which account was selected and the exact refusal stage or root cause of that earlier request remain unconfirmed.

Backend revision `2f3d73f` added fixed-stage diagnostics and passed independent spec and quality review with P0=0/P1=0/P2=0, 90 coordinator checks, 23 API checks and static checks. After the earlier servers closed gracefully and their owner marker was absent, a separate isolated normal runtime completed two connected-browser lookups without a forced clear, sync or recovery:

- MU/NAS acquired at `2026-09-19T14:05:49.696897Z`: quote 3/3, 250 USD daily bars, 15-minute delayed.
- 005930/KOSPI acquired at `2026-09-19T14:09:10.346522Z`: quote 3/3, 124 KRW daily bars, delay/provider time unknown/null, coverage `2026-03-23` through `2026-09-18`.

Both charts were visible with seven canvases total, zero console errors, exactly one snapshot request per lookup and zero new diagnostic stage events. The normal runtime servers were left running for user handoff. This later success verifies the two tested current flows but does not establish the cause of the earlier 503 or justify claiming it was fixed. The earlier bounded live acceptances and fixture/browser results remain valid independent evidence. PR publication may proceed after this factual update and its spot reviews; SHIP-01 still requires actual PR/CI evidence.

## Validated revisions

| Surface | Revision | Role |
| --- | --- | --- |
| OpenCharts connected UI | `67f437a01cdeb9d03bf8d88d3b7b17698cae771e` | Separate entry, exact proxy, DTO validation, UI/chart and browser tests |
| KB browser fixture | `b7cd48e00a88b153ae757dcf393cfc51281954f7` | Source-isolated synthetic account/provider harness |
| KB production backend | `e7f73c112b028f0ae6178a3358668cc2a375960b` | Reviewed and activated fixed US/KR snapshot reads |
| KB fixed-stage diagnostics | `2f3d73f` | Reviewed sanitized refusal-stage evidence without changing snapshot semantics |

The original final validation task made no provider call and reused the accepted bounded observations from 01-01. The subsequent independent runtime verification made the two single snapshot requests described above and changed no credential, token, account, quarantine, ledger or order state.

## Evidence classes

| Class | Result | Scope and limit |
| --- | --- | --- |
| Focused unit/component | PASS | 40 tests across the three market suites at the final OC revision |
| Real HTTP fixture/browser | PASS | Five Chrome cases traversed Vite proxy, FastAPI, coordinator and KB adapter with only credential/provider transport substituted |
| Visual | PASS | Root inspected US/KR desktop images and the full 390 x 1144 fixture image; the later live browser run displayed both charts with seven canvases and zero console errors |
| Live provider — US | ACCEPTED, current and historical | Current normal browser MU/NAS returned quote 3/3 and 250 USD bars, delayed 15 minutes; earlier accepted status 0024 remains historical evidence |
| Live provider — KR | ACCEPTED, current and historical | Current normal browser 005930/KOSPI returned quote 3/3 and 124 KRW bars, unknown/null delay/time and the accepted date coverage; earlier 200/A/0024 evidence remains historical |
| Live provider — other routes | UNVERIFIED | KOSDAQ entitlement and DRAM routing were not probed; no listing venue or entitlement claim is made |
| Production build | PASS, reused | Final build-relevant source emitted both `dist/index.html` and `dist/kb.html`; the existing large demo chunk warning remains |
| Remote PR/CI | PENDING | No PR exists in Task 1; local results are not CI evidence |

## Final commands

Commands are shown with placeholders rather than local coordinates.

### OpenCharts

```powershell
npm test -- src/__tests__/market-lookup.test.tsx src/__tests__/market-snapshot.test.ts src/__tests__/market-proxy.test.ts
$env:KB_REPO_DIR='<assigned-backend-worktree>'
npm exec -- playwright test --config playwright.kb.config.ts
git diff --check
```

Results:

- Vitest: 3 files, 40 tests passed. This includes both invalid-offset timestamp regressions.
- Playwright: 5 tests passed with no skipped case.
- Playwright-owned fixture processes closed after the run; both owned listeners were confirmed absent before documentation work began.
- OC diff check passed.

The production build was last run after the timestamp correction and passed, emitting both HTML entries. The later Playwright environment cleanup did not affect production build inputs.

### KB backend and fixture

```powershell
uv run --frozen --no-sync ruff check src/kb_journal/api/market_snapshot.py src/kb_journal/api/router.py src/kb_journal/broker/contracts.py src/kb_journal/broker/adapters/kb/adapter.py src/kb_journal/broker_sync/adapters/kb/adapter.py src/kb_journal/broker_sync/coordinator.py tests/broker/test_kb_adapter.py tests/broker_sync/test_coordinator.py tests/api/test_market_snapshot.py tests/market_snapshot_fixture_server.py tests/test_market_snapshot_fixture_server.py
uv run --frozen --no-sync ruff format --check src/kb_journal/api/market_snapshot.py src/kb_journal/api/router.py src/kb_journal/broker/contracts.py src/kb_journal/broker/adapters/kb/adapter.py src/kb_journal/broker_sync/adapters/kb/adapter.py src/kb_journal/broker_sync/coordinator.py tests/broker/test_kb_adapter.py tests/broker_sync/test_coordinator.py tests/api/test_market_snapshot.py tests/market_snapshot_fixture_server.py tests/test_market_snapshot_fixture_server.py
git diff --check
```

Results:

- Ruff: all 11 selected production/test files passed.
- Ruff format: all 11 selected files already formatted.
- KB diff check passed.
- Reused unchanged final backend evidence: API 23 passed; adapter/coordinator 260 passed; mypy reported no issues in 176 source files; OpenAPI export/type generation and diff check passed.
- Reused fixture evidence at `b7cd48e`: two Settings-isolation tests, fixture/test Ruff and format, and direct mypy passed.

The recorded full TypeScript comparison between original `f681cc03da1f4430e024f4e1a914dc5bc358a559` and compared revision `86d23ea302663fb2976fc4ded868ec79e2b0093e` contained the same 151 diagnostics on both sides, with zero introduced or removed. Later task-owned changes passed their focused tests/build and introduced no task-file diagnostic; this project-wide baseline is not reported as a passing typecheck.

## Local visual and isolation artifacts

These ignored local files were refreshed by the final Playwright run and are not committed evidence or live-provider captures:

- `test-results/market-lookup-us-desktop.png`
- `test-results/market-lookup-kr-desktop.png`
- `test-results/market-lookup-kr-mobile-390.png`
- `test-results/market-lookup-isolation.json`

The isolation record contains empty console-error, forbidden-request, HTTP-failure and telemetry-call arrays. Its connected module set is limited to the connected entry, lookup page, snapshot chart, snapshot service and shared global style. Screenshots use synthetic fixture labels only.

## Edge, prohibition and UI trace

| ID | Status | Concrete evidence |
| --- | --- | --- |
| E-01 | PASS | Invalid form submissions perform no request; US normalization and Korean `005930` round-trip pass unit and real HTTP browser checks |
| E-02 | PASS | Same-market, US-to-KR, KR-to-US, account-change and unmount late-completion regressions enforce latest submitted identity |
| E-03 | PASS | Nullable bid/ask/provider time/volume remain absent; fixture UI shows delayed and unknown states; live classifications remain separate |
| E-04 | PASS | Backend account/connection guards reject unavailable, foreign, ambiguous and inactive contexts before provider access; UI invalidates pending account ownership |
| E-05 | PASS | Offline/safe error unit paths and actual empty, provider refusal and timeout fixture paths announce errors and clear incompatible charts |
| E-06 | PASS | Full identity tuple, calendar date, finite decimal/volume, OHLC, ordering and both timestamp fields fail closed; malformed provider identity is exercised over real HTTP |
| E-07 | PASS | Separate import graph, full-document navigation, StrictMode remount, ResizeObserver disconnect and chart removal are verified |
| P-01 | PASS | Exact GET/path/query proxy allowlist, unsafe-request denial, header minimization, redirect denial, fixed backend reads and secret-sentinel tests |
| P-02 | PASS | No-data/null behavior plus module/network/telemetry evidence proves no crypto replay, demo feed or paper engine fallback on the connected entry |
| P-03 | PASS | UI says “조회 시장”; supported routing is explicit and no response is relabelled as a verified listing venue; DRAM live routing remains unverified |
| UI-01 | PASS | Native labelled account/market/query-market/ticker controls support button and Enter submission for both markets |
| UI-02 | PASS | Result title is committed identity; edits do not relabel it and all stale completion directions are covered |
| UI-03 | PASS | Currency, source, acquisition time and delay/unknown are visible; provider time appears only when supplied |
| UI-04 | PASS | Keyboard-native controls, live status/error roles, 390px no-overflow assertion and full mobile chart inspection |
| UI-05 | PASS | Provider/no-data errors are announced with words, leave submit available and expose no demo fallback |

## Requirement trace

| Requirement | Task 1 status | Evidence and boundary |
| --- | --- | --- |
| QUERY-01 | COMPLETE | Both market selectors, editable ticker, explicit button/Enter and leading-zero browser evidence |
| QUERY-02 | COMPLETE | Arbitrary supported symbols use the account-scoped snapshot route without journal subject/import state |
| QUERY-03 | COMPLETE | Submitted identity, USD/KRW, KB source, acquisition time and delayed/unknown labels; no realtime claim |
| QUERY-04 | COMPLETE | Input, no-data, malformed, refusal, timeout, offline and request-order behavior is covered |
| DATA-01 | COMPLETE | Reviewed US fixed quote/daily implementation and accepted MU/NAS bounded live observation |
| DATA-02 | COMPLETE WITH LIMIT | Reviewed KR fixed quote/daily implementation and accepted 005930/KOSPI live observation; KOSDAQ live entitlement unverified |
| DATA-03 | COMPLETE | Nullable values and strict identity/date/number/timestamp validation; provider route is not a listing venue |
| SAFE-01 | COMPLETE | Fixed read-only backend/proxy, opaque account projection and secret/raw-payload negative evidence |
| SAFE-02 | COMPLETE | Connected entry is isolated from demo/feed/paper/telemetry and demo remains reachable by full navigation |
| VERIFY-01 | COMPLETE | Backend 283 focused tests, frontend 40 focused tests, fixture isolation/static checks and production build evidence |
| VERIFY-02 | COMPLETE WITH NAMED LIMITS | Both-market real application fixture/browser path and current normal connected-browser MU/NAS plus 005930/KOSPI observations; earlier 503 cause and KOSDAQ/DRAM live status remain unverified |
| SHIP-01 | PENDING | Two open PRs, final remote HEAD review and required-check observation belong to Task 2 |

## Operational boundary

- Snapshot success does not open execution history, ingest, holdings, order, schedule, streaming or ledger-write capability.
- The query market is provider routing input. It is not independent proof of the instrument's listing venue.
- Fixture results prove wiring and failure handling. They are never described as live entitlement.
- Local tests and successful pushes do not prove remote CI. Task 2 must record actual PR state, reviewed remote SHA and required-check policy.
