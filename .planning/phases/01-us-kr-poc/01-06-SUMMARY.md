---
phase: 01-us-kr-poc
plan: "06"
status: complete
implementation_head: a707c186cbe6cdcf5e6612fe9c4a9e2186b24f4d
backend_fixture_head: 671c3bf5571ec2e653040ba9fcf1eab555171f89
---

# Native single-entry and actual browser verification

The product now has one index.html/src/main.tsx entry. The separate kb.html, kb-main, MarketLookupPage, MarketSnapshotChart and standalone component test were removed. Default mode retains demo startup; mode kb uses the original App/TradingPage/ChartToolbar/ChartPanel path. The narrow read proxy and normalized snapshot client remain.

## Corrections exposed by actual native use

The native tooltip host now has relative positioning. Plugin preferences persist outside React's StrictMode state updater, preventing a cross-component render warning. The KB-only chart header wraps within the actual plot boundaries so the drawing rail and price scale do not hide provenance on 390px screens. KB mobile focuses the real ticker input and submits it with Enter, while demo search behavior stays unchanged.

Original findings were recorded before remediation in 01-06-REVIEW.md. The same Sol owner corrected them with regressions. Independent spec and whole-task quality reviews both passed P0/P1/P2=0 at a707c186. Backend fixture spec/quality both passed P0/P1/P2=0 at 671c3bf.

## Verification

- Six focused unit files: 61 passed. Runtime/bootstrap, native market/chart, snapshot and proxy contracts are covered.
- Actual Vite-to-FastAPI/provider-transport-fixture Playwright: six cases passed together in 1.3 minutes. The final timezone-only correction also passed its focused test in 39.4 seconds.
- Native browser cases cover US/KOSPI/KOSDAQ, quote/candles, nullable data/VWAP, original SMA and local templates, drawing add/edit/delete/undo/redo/reload/identity isolation, failures and stale responses, forbidden reads/writes/telemetry, 390px keyboard controls and a 31-second no-poll check.
- Seoul and New York date cases separately observe real canvas axis/crosshair text with plugins disabled, then actual OHLCV Tooltip and dragged Delta Tooltip dates/percentage around March 6/9. Captures are reset between stages.
- Default and KB production builds each passed with 1,979 modules and the existing large-chunk warning. Both emit index.html as the only HTML entry. Obsolete runtime references are absent.
- Full TypeScript still exits 2 with 151 existing diagnostics. A multiplicity-preserving comparison of file/code/full-message signatures at final production-source a957cd00 against pre-native86d23ea found the same 151 occurrences/48 signatures, zero introduced/resolved occurrences or signatures, and only position shifts. The later a707c186 changes E2E only.

Root visually inspected the original desktop layout, clean native candles/SMA, fixed mobile provenance, focused mobile ticker controls and both timezone tooltip screenshots. Evidence images are ignored local artifacts under test-results/native-kb. The isolation JSON covers its exporting mobile scenario; other cases have separate assertions and intentional-error exemptions. It is not an aggregate zero-error log for the entire suite.

## Fixture and runtime boundaries

The isolated backend fixture adds browser-only data and a fixed April 1 clock, preserving production validators and base fixtures. Its 22 US trading sessions support SMA20 and March 6/9 DST verification; Korean cases include zero/missing/positive volume. Fixture tests passed 3, with Ruff, formatting, mypy and diff checks passing. The fixture builder patches globals only within the separately spawned fixture process; it is not a reversible shared-process app fixture.

Owned fixture ports are closed. This task made no real broker calls and did not change the accepted live backend. Historical prototype provider successes and the unresolved first-lookup503 remain separate evidence. Plan01-07 must record the bounded actual native live observation, final public validation and two reviewed OPEN PRs; no PR, push, merge or native live success is claimed by this summary.
