# 01-04 Native startup and shared boundaries

Status: complete at 02e227a8a6e7c24ef77ddf0324def9666d914f78. Independent Astra spec and whole-task quality reviews each passed P0=0/P1=0/P2=0.

## Delivered contracts

- The fixed startup mode is resolved before demo runtime evaluation. KB uses the original App/TradingPage shell; normal demo startup remains available. Unknown explicit modes fail closed.
- API and WS demo loading is lazy and cancellation-safe. KB rejects unsupported legacy data/trading/account/order/journal operations before effects. The separate pure browser-local drawing, preference and template paths remain available.
- KB starts with empty auth/trading state and preserves stored demo values. Demo login, Google login and session restoration cannot hydrate KB auth; logout cannot erase demo state.
- Main omits MarketDataBridge in KB. PostHog initialization/direct/platform capture is blocked even with a configured key.
- Native symbol/tick/candle, portfolio/order/metrics/health/economic-calendar automatic reads, timers, retry and focus paths are gated. The existing native layout shows explicit unavailable content for trading, fake DOM/portfolio and unsupported AI surfaces. ChartPanel receives no trading callbacks or demo tick/live data.
- Native manual snapshot input/chart rendering, accurate dates/volume and full-identity drawing storage are deliberately still 01-05 work.

## Evidence

- RED cases reproduced missing mode behavior, persisted demo hydration and demo App/bridge bootstrap.
- First task checks passed 9 tests; independent spec review found two P2s, recorded before correction in 01-04-REVIEW.md.
- Corrections reproduced direct Google-login side effects and the actual useNewsOverlay('USDF') economic-calendar call, then passed with unchanged stored demo keys, zero fetch/user hydration and no calendar calls after 30 simulated minutes/focus.
- Final command: `npm test -- src/__tests__/runtime-mode.test.ts src/__tests__/native-bootstrap.test.tsx` — 11 passed.
- The native test executes actual TradingPage/hooks, mocks heavy leaf rendering only, and observes zero legacy calls over five simulated minutes. Demo and late WS disconnect controls pass.
- Production build passed with 1,982 modules; no top-level-await/build-target change or dependency addition. The existing large-chunk warning remains.
- Full typecheck remains the known 151-diagnostic baseline; no new task diagnostics. Diff checks passed.

No application server, broker/provider, backend source, push, PR or merge action occurred. Root stopped only its own prototype frontend before execution; the real backend and unrelated original application remained untouched. All eleven planned paths were committed; root planning changes were preserved.
