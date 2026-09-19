# 01-02 Connected frontend execution summary

Status: complete. Independent spec and quality reviews each ended P0=0/P1=0/P2=0.

Final reviewed implementation: OC 67f437a01cdeb9d03bf8d88d3b7b17698cae771e; KB fixture b7cd48e00a88b153ae757dcf393cfc51281954f7. Backend production code remains the reviewed e7f73c1 implementation.

## Delivered behavior

The separate kb.html entry exposes a labelled account/US-KR/query-market/ticker form, explicit button or Enter submission, committed result identity, quote/provenance/delay information and a daily candle chart. Existing demo navigation uses full document loads. Native fetch cancellation plus request ownership prevents stale results; chart and observer resources are disposed. Missing values remain absent, and malformed identity, dates, numbers and timestamps fail before rendering.

The kb-mode dev proxy uses a fixed loopback target and exact GET-only account/snapshot paths. It rejects invalid methods, paths, queries and redirects, filters sensitive headers, preserves Origin and emits no-store responses. The test harness exercises actual Vite/FastAPI/coordinator/adapters with synthetic accounts and only fake credential/provider transport. Its settings use constructor values only and explicitly disable dotenv; no real configuration or listener is activated by the isolation regressions.

## Verification and findings

- Initial RED/GREEN implementation: 29 focused unit tests and four real HTTP browser cases, followed by spec remediation.
- Expanded focused suites: 38 tests passed. The final timestamp correction added two regressions; the affected snapshot suite passed 18/18. Unchanged passing checks were reused pending the final validation task.
- Expanded real HTTP browser suite: five cases passed for US, KOSPI, KOSDAQ, empty data, malformed provider identity, refusal/timeout, proxy denial, isolation and 390px layout. No normalized API response is intercepted.
- Build emitted both dist/index.html and dist/kb.html; output assertion passed. The pre-existing large demo chunk warning remains.
- Fixture isolation: two pytest regressions, Ruff, format and mypy passed.
- The final Playwright config collected all five cases with explicit KB_REPO_DIR; machine-specific defaults and the ineffective environment helper were removed.
- Original and changed full TypeScript runs have the identical 151 diagnostics, with zero introduced or removed. Only platform declaration dependencies were added; no runtime dependency or unrelated baseline repair was introduced.
- Root visually inspected US/KR desktop and the full 390x1144 mobile chart. Isolation evidence has no console errors, forbidden requests, HTTP failures or telemetry calls. Screenshots contain synthetic aliases only.

Original findings, before-fix records, dispositions and exact review stages are in 01-02-REVIEW.md. The P1 fixture environment inheritance issue, its residual dotenv-read P2, four other spec P2s and the quality timestamp P2 were all resolved and independently rechecked. No new live broker read was made in this task.

## Acceptance mapping

| ID | Evidence |
|---|---|
| E-01 | Service/form input tests; actual US and six-digit KR HTTP browser paths |
| E-02 | Same-market and US/KR races, pending-account invalidation, unmount and committed-title tests |
| E-03 | Nullable quote/volume tests and delayed/unknown fixture UI; backend live evidence remains distinct |
| E-04 | Reviewed backend account/connection guards; frontend identity-tuple rejection and pending-account invalidation |
| E-05 | Network/error unit cases plus actual empty/refusal/timeout fixture paths; old result clearing |
| E-06 | Full identity, calendar date, finite numeric/volume and invalid timestamp regressions; actual malformed provider fixture |
| E-07 | Independent entry module/network record, full-document navigation and StrictMode/chart cleanup tests |
| P-01 | Exact proxy denial/header/redirect tests and backend fixed-read/secret-projection guards |
| P-02 | Null/no-data tests and independent no-demo/no-telemetry connected entry |
| P-03 | Provider routing labelled query market; strict supported route validation, no guessed listing mapping or ticker ban |
| UI-01 | Labelled native controls, button/Enter and editable US/KR tests |
| UI-02 | Committed identity and complete late-request ownership cases |
| UI-03 | Source/currency/acquisition and delayed/unknown display with nullable provider time |
| UI-04 | Actual 390px no-overflow browser assertion and full mobile visual inspection |
| UI-05 | Announced scoped errors and actual provider failure paths with result clearing |

## Next

01-03 owns final validation records, development server handoff and two open reviewed PRs. Preserve original processes and dirty roots. Reuse accepted MU/NAS and 005930/KOSPI live observations; KOSDAQ live entitlement and DRAM routing remain unverified. Do not merge.
