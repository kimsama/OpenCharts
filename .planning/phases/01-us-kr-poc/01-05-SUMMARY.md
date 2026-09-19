# 01-05 Native market lookup and chart integration

Status: complete at 4b6b256a66f8cc1d0bed7eeb86ed01bd939333b3. Independent Astra spec and whole-task quality reviews each ended P0=0/P1=0/P2=0.

## Native contracts delivered

- The existing TradingPage and ChartToolbar symbol popup own safe account, market, query-market and arbitrary ticker controls. Explicit submit uses the existing validated client; typing performs no quote call. KB identities remain separate from demo trading accounts/ticks.
- Draft and submitted identities are separate. Abort plus sequence ownership covers cross-market, account, route, same-symbol and unmount races, including ignored-abort completions. Persistent native feedback remains visible after the popup closes.
- The original ChartPanel accepts manual-daily data and full identity, plus normalized quote/provenance. It displays committed market and query-market labels, currency/source/acquisition/provider time and delay, without inventing missing quote sides or TickEntry data.
- Numeric UTC-midnight values are calendar coordinates only. Explicit UTC date formatters are wired to native axis/crosshair and tooltip/delta-tooltip factories; provider-as-of is separate. Precision is validated before state commit and bounded to the chart-supported policy.
- Manual mode blocks history/depth/stale/gap/live updates. Empty/error/identity transitions clear primary and indicator series; primary data and overlays follow actual chartEpoch, including distinct-instance recreation with stable input data.
- Missing volume stays null/omitted through histogram, hover/leave legend and strict KB VWAP; actual zero is retained. VWAP explains missing-volume unavailability; price-only indicators and demo calculation defaults remain.
- The existing drawing hook retains CRUD/history and selects small tuple-scoped local persistence for KB. Edit/delete/clear/undo/redo/reload and late scope results are isolated. Native local preferences/templates remain independent of broker writes.
- KB stays at 1d through startup, symbol restoration and direct callbacks, while stored demo intervals remain untouched.

## Verification

`npm test -- src/__tests__/native-market.test.tsx src/__tests__/native-chart.test.tsx src/__tests__/market-snapshot.test.ts src/__tests__/market-proxy.test.ts` passed 48 tests after all corrections. The tests include actual ChartPanel with engine/browser stubs, fresh per-epoch instances and active overlays; they do not substitute a custom chart as the product.

Production build passed with 1,983 modules and the existing large-chunk warning. Full TypeScript retains the existing 151 diagnostics; no new diagnostics were introduced in changed spans. Scoped diff checks passed. Source changes stayed within the thirteen assigned paths, with no dependency/backend/server/provider action.

Original findings and before-fix dispositions are in 01-05-REVIEW.md: two initial P1s, four P2s, two residual coverage/lifecycle P2s and one quality interval-restoration P2 were resolved and independently rechecked. This is component/transport evidence; actual native browser and single-entry product evidence remains 01-06.

## Continuation

01-06 removes the superseded kb.html/custom mount/page/chart and standalone tests, restores a single native index entry, and runs real native HTTP/browser, timezone/tool/mobile and demo-compatibility checks. The real backend remains untouched. No PR or native live completion is claimed yet; historical prototype broker evidence remains distinct.
