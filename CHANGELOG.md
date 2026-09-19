# Changelog

## 2026-09-19

- Restored one native `index.html`/`main.tsx` product entry for both demo and fixed KB startup modes; the superseded `kb.html`, custom lookup page and custom snapshot chart were removed from the final product.
- Connected the reviewed KB snapshot client to the original `TradingPage`, `ChartToolbar` and `ChartPanel`, preserving native indicators, drawings and local templates while blocking demo feeds, telemetry, polling, trading and fabricated portfolio/depth data in KB mode.
- Added actual native-browser coverage for desktop and 390px controls, US/KOSPI/KOSDAQ data and failure paths, full-identity drawing isolation, nullable volume, configured telemetry denial, and separately captured axis/crosshair/OHLCV/Delta dates across Seoul and New York DST contexts.
- Recorded the final bounded native-UI MU/NAS and 005930/KOSPI observations separately from fixture results and historical backend-only evidence; the earlier `connection_unavailable` cause, KOSDAQ live entitlement and DRAM routing remain unconfirmed.
- Added a separate `kb.html` connected entry for explicit US/KR account, query-market and ticker lookup with truthful quote, provenance, delay and daily-chart states.
- Added `kb` development mode with a fixed loopback GET-only proxy, full-document navigation back to the original demo, and isolated real-HTTP fixture/browser verification.
- Added strict normalized snapshot validation for identity, calendar dates, finite decimal/volume values, OHLC relationships and acquisition/provider timestamps.
- Added the development-only `@types/node` 24 declaration package so the native Node proxy and its tests are type-checked; no browser/runtime dependency was added.
- Documented accepted MU/NAS and 005930/KOSPI bounded live observations, while leaving KOSDAQ entitlement, DRAM routing, PR delivery and remote CI explicitly unverified or pending.
- Recorded successful isolated normal-runtime browser lookups for MU/NAS and 005930/KOSPI after an earlier unexplained `connection_unavailable`, without claiming the earlier root cause was fixed.
- Initialized GSD for the approved US/Korean ticker-input KB connection POC using the existing HTML research.
- Recorded isolated milestone/phase delivery, separate frontend/backend PRs, Astra planning/review and Sol implementation, and the requested P0/P1 review gate.
- Preserved `executing-plans` with subagents as the implementation workflow.
