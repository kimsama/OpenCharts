---
phase: 01-us-kr-poc
validated_frontend_head: a707c186cbe6cdcf5e6612fe9c4a9e2186b24f4d
validated_production_source: a957cd00e097d8468d1f06f0b5ba3bd5862e91e2
validated_backend_head: 2f3d73f3edac495970a0b2e6112ee645c3d328bd
validated_fixture_head: 671c3bf5571ec2e653040ba9fcf1eab555171f89
status: complete
---

# Native OpenCharts validation

This record validates the final product requested by the user: the original
`index.html` -> `App` -> `TradingPage` -> `ChartToolbar` -> `ChartPanel` path in
fixed KB startup mode. The earlier `kb.html` lookup page and custom chart remain
dated historical evidence only; they were removed and are not counted as native
acceptance.

## Evidence boundaries

| Evidence class | Revision and result | What it proves |
| --- | --- | --- |
| Backend current native runtime | `2f3d73f3edac495970a0b2e6112ee645c3d328bd` | Retained startup production revision, including accepted safe diagnostics, that served both current native observations. Root verified no production-source difference through the current companion evidence head. |
| Backend historical activation acceptance | `e7f73c112b028f0ae6178a3358668cc2a375960b` | Historical US+KR activation acceptance for the reviewed account-scoped fixed quote/daily reads. API 23, adapter/coordinator 260 and mypy over 176 source files passed; independent reviews ended P0=0/P1=0/P2=0. |
| Backend dated native-live record | `8f8fd8f10a77e1a451cb09c78ad0d13530f9a40d` | Companion repository record naming the production revision that served both current native submissions and the bounded aggregate failure-count uncertainty; contains sanitized normalized outcomes only. |
| Native production source | `a957cd00e097d8468d1f06f0b5ba3bd5862e91e2` | Single native entry, fixed runtime boundaries, native controls/chart/data semantics and mobile correction. |
| Final native browser evidence | `a707c186cbe6cdcf5e6612fe9c4a9e2186b24f4d` | Final E2E-only separation of native axis/crosshair evidence from OHLCV and Delta Tooltip evidence. Independent spec and quality reviews ended P0=0/P1=0/P2=0. |
| Dedicated browser fixture | `671c3bf5571ec2e653040ba9fcf1eab555171f89` | Real Vite -> proxy -> FastAPI -> coordinator -> adapter flow with only credential/provider transport synthetic. Three fixture tests and static checks passed; independent reviews ended P0=0/P1=0/P2=0. |
| Current normal runtime | final native frontend at `a707c186` with backend production `2f3d73f3` | Exactly one MU/NAS and one 005930/KOSPI manual submission through the native UI. This is distinct from fixture evidence and from the earlier backend-only live acceptance. |

The fixture builder patches module globals in its dedicated Python process. It
is process-scoped isolation and is not a reversible fixture for reuse in a
shared application process.

## Current bounded native live observation

The runtime owner made exactly two sequential default-account submissions. No
retry, alternate-account fallback, recovery, state clear, sync, holdings,
history or order operation was used.

| Route | Normalized native result |
| --- | --- |
| MU / NAS | Quote 3/3, 250 USD daily bars from `2025-09-22` through `2026-09-18`, 15-minute delayed, acquired `2026-09-19T17:31:17.783385Z` |
| 005930 / KOSPI | Quote 3/3, 123 KRW daily bars from `2026-03-24` through `2026-09-18`, delay unknown with null minutes, acquired `2026-09-19T17:31:18.221962Z` |

Both native charts rendered seven canvases. The observation recorded zero
console errors, forbidden requests, snapshot HTTP failures and backend
diagnostic-stage events. Aggregate instrumentation retained one failed
non-snapshot request but retained neither its URL nor cause. It is consistent
with earlier development account-list cancellation behavior, but this run does
not independently establish that attribution. Both actual snapshot requests
succeeded, and this record does not call the whole network error-free. The
native development server was left running by its owner for user inspection.

The accepted historical backend-only Korean observation returned 124 bars from
`2026-03-23` through `2026-09-18`. The current native observation returned 123
bars from `2026-03-24`; the later rolling window is recorded as a new result,
not a contradiction or rewrite of the historical acceptance.

The earlier first-lookup HTTP 503 `connection_unavailable` cause remains
unconfirmed. Later success and fixed-stage diagnostics do not prove that cause
or prove a specific repair.

## Reviewed correction chain

| Task | Accepted revision | Independent result |
| --- | --- | --- |
| Native startup and shared boundaries (01-04) | `02e227a8a6e7c24ef77ddf0324def9666d914f78` | Spec and quality P0=0/P1=0/P2=0 |
| Native lookup/chart integration (01-05) | `4b6b256a66f8cc1d0bed7eeb86ed01bd939333b3` | Spec and quality P0=0/P1=0/P2=0 |
| Single entry and actual browser verification (01-06) | `a707c186cbe6cdcf5e6612fe9c4a9e2186b24f4d` | Spec and quality P0=0/P1=0/P2=0 |

All production corrections have affected unit or browser regressions. The
01-07 Task 1 document spec and quality reviews also ended P0=0/P1=0/P2=0.
Task 2 published the reviewed source trees; only final CI/metadata bookkeeping
remains pending.

## Publication draft

| Repository | Open PR/base | Reviewed public source head | Stable review |
| --- | --- | --- | --- |
| OpenCharts | [#1](https://github.com/kimsama/OpenCharts/pull/1), `milestone/kb-market-data-poc` | `c582a8b14051092f6a3cefb1fbda4f6d8a247254` | [P0=0/P1=0/P2=0](https://github.com/kimsama/OpenCharts/pull/1#issuecomment-5744115837) |
| KB journal | [#195](https://github.com/kimsama/kb-us-stock-trading-journal/pull/195), `dev`, merge state CLEAN | `efe1f1f96cca85466617b8e90933df51ca1e1ed3` | [P0=0/P1=0/P2=0](https://github.com/kimsama/kb-us-stock-trading-journal/pull/195#issuecomment-5744105514) |

OpenCharts source publication used one clean commit on approved milestone
parent `c089aec...`. Its tree
`72c7da1f82e02b9828eee21d4d2300f4fab8caa7` is byte-identical to unpublished
final-record head `e632990c...`. The old unpublished head is preserved only
under a local backup ref and was never pushed. Historical `a957cd00...` scopes
the validated production runtime source; `a707c186...` scopes the final
E2E/tests/config evidence. Their complete trees are not claimed equal to
`72c7da1f...`, and neither is claimed as an ancestor of the clean public
commit.

The OpenCharts repository has no configured workflows, protected milestone
base, rulesets or required checks. That is a no-check policy, not a green CI
run. Initial KB run 35459216004 failed nine logging-capture assertions after
6,855 tests passed. [CI-01](https://github.com/kimsama/kb-us-stock-trading-journal/pull/195#issuecomment-5744168994)
was posted before the seven-line test-only logger-state fixture; the separate
[disposition](https://github.com/kimsama/kb-us-stock-trading-journal/pull/195#issuecomment-5744254229)
records focused checks and review. Production source/live behavior did not
change. Final exact-head run 35460523435 completed with all four jobs passing:
Python 6,864 passed, 20 skipped, one deselected and 30 warnings in 543.51
seconds. No job was skipped; conditional frontend steps are recorded in
`01-PR-REVIEW.md`. Required-check query reports none, while direct branch-policy
inspection returned 403. The stable OpenCharts acceptance comment above is the
source-review anchor for the metadata-only final commit, avoiding a
self-referential commit hash; root adds the metadata SHA after fresh review.

## Final automated and visual evidence

- Six focused Vitest files passed 61 tests: runtime mode, native bootstrap,
  native market, native chart, snapshot client and proxy.
- Six real HTTP Playwright cases passed together. They use the native index and
  do not intercept normalized responses.
- Default and KB production builds each passed with 1,979 modules and emitted
  `index.html` as the only HTML entry. The existing large-chunk warning remains.
- Full TypeScript still exits 2. A multiplicity-preserving comparison of final
  production source `a957cd00` against pre-native baseline `86d23ea` found the
  same 151 diagnostic occurrences across 48 full file/code/message signatures,
  with zero introduced or resolved occurrences or signatures. This is not a
  passing typecheck.
- Root visually accepted the original desktop layout, native candles and SMA,
  clean Korean chart, 390px provenance and focused ticker controls, plus Seoul
  and New York Delta Tooltip captures.
- Local ignored artifacts are named `native-market-us-desktop.png`,
  `native-market-kr-desktop.png`, `native-market-kr-mobile-390.png`,
  `native-market-mobile-controls-390.png`, `native-market-dates-seoul.png`,
  `native-market-dates-new-york.png` and `native-market-isolation.json`.
  They contain only synthetic fixture labels. The JSON describes its exporting
  mobile scenario only; other cases have their own assertions and intentional
  failure exemptions.

## Edge coverage

| ID | Status | Exact evidence and limit |
| --- | --- | --- |
| E-01 | PASS | Native unit/browser checks reject empty/malformed inputs before snapshot I/O, uppercase US input and preserve Korean `005930`; the mobile KB popup focuses the real ticker and Enter submits it. |
| E-02 | PASS | Account, market, query-market, same-symbol and unmount races resolve ignored-abort responses without stale commit; actual fixture failure/race paths clear old chart state. |
| E-03 | PASS | Missing bid/ask/provider time/volume remain absent. US displays delayed 15; Korean displays unknown/null and never realtime. |
| E-04 | PASS | Backend rejects foreign, unknown, inactive or non-unique connection contexts before provider access; the UI never falls back to another account. |
| E-05 | PASS | Invalid input, empty data, malformed provider identity, refusal, timeout and offline/proxy errors are announced and clear incompatible native data. |
| E-06 | PASS | Full identity, market/route compatibility, calendar date, finite decimal/volume, OHLC ordering and both timestamps fail closed. |
| E-07 | PASS | KB startup omits demo bridge/feed/telemetry/trading effects; native chart and observers dispose safely while drawings/preferences remain local. |
| E-08 | PASS | Runtime mode is fixed before module evaluation. Persisted demo auth/accounts/ticks/intervals do not hydrate or get overwritten in KB mode; demo startup behavior is retained. |
| E-09 | PASS | With plugins disabled, actual canvas axis text and native crosshair labels retain the trading date in Seoul and New York. Separate cleared captures prove OHLCV and dragged Delta Tooltip dates/percentage across March 6/9 DST. |
| E-10 | PASS | Real native drawing add/edit/lock/delete/undo/redo/reload works. Account/market/query-market/symbol tuple changes isolate local drawings; SMA and templates remain usable without broker writes. |
| E-11 | PASS | Missing quote sides and latest volume stay unavailable in legend/histogram. Strict KB VWAP explains missing-volume unavailability; zero and positive volume remain real values. Portfolio/depth stay unavailable rather than fabricated. |

## Prohibition coverage

| ID | Status | Exact evidence |
| --- | --- | --- |
| P-01 | PASS | Backend/proxy permit only fixed account-list and snapshot GET routes; method/path/query/redirect/header and secret/raw-payload checks pass. No order TR or arbitrary provider path is exposed. |
| P-02 | PASS | Native browser/network evidence shows no demo candle/tick/feed, crypto replay, synthetic quote/volume, fabricated portfolio/depth or trading mutation in KB mode. |
| P-03 | PASS | Query market is displayed as provider routing input. No Cboe or other response is relabelled as independently verified Nasdaq listing evidence. |
| P-04 | PASS | Only the original index/App/TradingPage/ChartPanel product remains. Standalone HTML/page/chart files and build entry were removed. |

## UI coverage

| ID | Status | Exact evidence |
| --- | --- | --- |
| UI-01 | PASS | Native popup has labelled account, market, query market and ticker controls. Button/Enter work for both markets; mobile focuses the real ticker rather than an inert demo search. |
| UI-02 | PASS | Draft and submitted identity are separate. Editing does not relabel old data, and late requests cannot replace the latest result. |
| UI-03 | PASS | Native legend shows committed market/query market, currency, KB source, acquisition time, optional provider time and delayed/unknown status. |
| UI-04 | PASS | Original responsive UI works at 390px with keyboard focus, no document overflow and provenance constrained between drawing rail and price scale. |
| UI-05 | PASS | Errors remain visible after the popup closes, use live alert semantics and never substitute demo data. |
| UI-06 | PASS | Root accepted the recognizable original TradingPage, toolbar, ChartPanel, panels, indicators and drawing rail on desktop and mobile. |
| UI-07 | PASS | Trading/depth/portfolio/AI surfaces are explicitly unavailable. Native drawings, price indicators, plugins and local templates remain interactive with zero corresponding broker calls. |
| UI-08 | PASS | Actual axis, native crosshair, OHLCV and Delta Tooltip dates preserve calendar days in both zones. Nullable sides/volume and volume-derived output remain unavailable; provider time is distinct. |

## Requirement traceability

| Requirement | Status | Evidence and remaining boundary |
| --- | --- | --- |
| QUERY-01 | COMPLETE | Native account/US-KR/query-market/ticker controls, explicit button/Enter, US normalization and Korean leading-zero evidence |
| QUERY-02 | COMPLETE | Original ChartPanel renders quote/daily candles, native SMA and drawings without trade import |
| QUERY-03 | COMPLETE | Submitted identity, USD/KRW, source, acquisition/provider time and delayed/unknown labels without realtime invention |
| QUERY-04 | COMPLETE | Input, configuration/offline, rejection, timeout, no-data and latest-request ownership coverage |
| DATA-01 | COMPLETE | Reviewed fixed US read and both historical/current MU/NAS bounded live observations |
| DATA-02 | COMPLETE WITH LIMIT | Reviewed fixed KR read and historical/current 005930/KOSPI observations; KOSDAQ live entitlement remains unverified |
| DATA-03 | COMPLETE | Nullable fields, strict identity/date/numeric/timestamp validation, date round-trip and routing/listing separation |
| SAFE-01 | COMPLETE | Account-scoped fixed reads, exact loopback proxy, secret/raw-payload negative evidence and no trading operation |
| SAFE-02 | COMPLETE | One native entry, fixed startup mode, demo/feed/telemetry/trading/poll/history isolation and explicit unavailable panels |
| VERIFY-01 | COMPLETE | Backend 283 focused tests, frontend 61 focused tests, fixture 3 tests/static checks and both production builds |
| VERIFY-02 | COMPLETE WITH NAMED LIMITS | Real native fixture/browser plus exactly two current normal-runtime submissions; historical 503 cause, KOSDAQ entitlement and DRAM routing remain unverified |
| SHIP-01 | COMPLETE | Both companion PRs are OPEN/non-draft, final whole-PR reviews are P0/P1/P2=0, OC has no configured checks, and all four configured KB CI jobs passed at reviewed head `efe1f1f...` |

## Local operation by configuration name

No value below is a distributable credential or machine coordinate.

```powershell
# Default demo startup
npm run dev

# KB startup against an already configured reviewed backend
$env:KB_MARKET_BACKEND_PORT = "<loopback-backend-port>"
npm run dev -- --mode kb --host 127.0.0.1 --port <frontend-port> --strictPort

# Dedicated fixture browser verification
$env:KB_REPO_DIR = "<backend-worktree>"
$env:PLAYWRIGHT_CHROME_PATH = "<optional-browser-path>"
npm exec -- playwright test --config playwright.kb.config.ts
```

The frontend never receives the backend credential values. Backend startup and
credential configuration follow the companion repository's reviewed local
instructions.

## Remaining limits

- KOSDAQ is implemented and fixture-verified, but live account entitlement was
  not observed.
- DRAM provider routing was not live-verified.
- Provider timestamps remain unavailable in the accepted observations.
- This is manual daily snapshot data. Streaming, polling, symbol catalog search,
  intraday intervals and trading are outside the POC.
- `SHIP-01` is complete. Both PRs remain OPEN; the metadata-only commit is
  linked after fresh review through the stable OpenCharts acceptance comment.
  No merge or cleanup is authorized.
