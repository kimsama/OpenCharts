---
phase: 01-us-kr-poc
status: approved-scope
---
# UI Contract: Original OpenCharts Frontend with KB Market Data

The latest user correction requires the actual existing OpenCharts frontend: App → TradingPage → ChartToolbar → ChartPanel, its dark palette, split layout, panels, indicators, drawing tools and local preferences. Feed that UI from the reviewed KB snapshot API. Do not create a substitute lookup page or chart. Select a validated demo or KB mode once at startup through the single index entry.

## Layout and Interaction

- Keep the original index/App/TradingPage and existing navigation/layout. Remove the standalone HTML, mount, lookup-page and chart implementation from the final product; preserve demo behavior under demo startup mode.
- Extend the existing ChartToolbar symbol popup/control with safe account alias, US/KR and provider query-market selection, editable ticker text and 조회. The current selector filters a demo symbol list and has no account selector: add manual capability there without substituting a new screen. Keep opaque KB account identity out of the demo trading-account store.
- Submit via Enter or button. No request per keystroke, automatic polling or account credential inputs. Disable/label a pending duplicate submission or cancel/ignore older requests correctly.
- Results appear in the native toolbar/legend or existing chart status surface: submitted market/symbol, currency, latest price and available bid/ask, source, acquisition time, provider time when available, and actual delayed/unknown label. Edited but unsubmitted input never relabels old data.
- The existing ChartPanel renders bounded daily candles. Preserve price indicators, drawing interactions and local chart/layout preferences. Daily-only data disables unsupported interval controls; scroll/history/live/stale/focus refresh cannot request more data. Clear candles, volume and legend together on invalidated identity, error or empty data.
- Keep provider trading dates as strings in the DTO. If the existing numeric drawing/chart API needs a UTC-midnight coordinate, native tick/crosshair/tooltip formatters must display the original calendar date in both Asia/Seoul and US timezones; never show the coordinate as provider-as-of.
- Missing volume remains absent in histogram and legend. Volume-dependent indicators show unavailable when the required input is absent; price-only indicators still work. Do not inject fake bid/ask, balances, orders, positions or depth to satisfy demo types.
- Preserve native panel layout; unavailable trading/depth/portfolio surfaces use an explicit read-only/unavailable state and make zero corresponding requests. Disable trading mutations at both UI and shared service boundaries, while local drawing/layout/preferences remain interactive.
- At 390px the native controls remain reachable, chart fits and there is no document overflow. Use visible labels, keyboard focus and announced errors; retain the original responsive layout rather than a replacement form page.

## UI Considerations

| ID | Consideration | Acceptance | Status | Verification |
|---|---|---|---|---|
| UI-01 | Editable ticker and market | Keyboard users can submit US/KR codes and identify labels/errors | resolved | explicit |
| UI-02 | Request/result identity | Editing without submitting does not relabel an old result; late requests cannot overwrite latest | resolved | explicit |
| UI-03 | Data provenance | Source/time/delay or unknown is visible with no fabricated realtime claim | resolved | explicit |
| UI-04 | Small viewport | Form and chart work at 390px; no page overflow | resolved | explicit |
| UI-05 | Provider failure | Error is announced; no crypto/demo fallback appears | resolved | explicit |
| UI-06 | Original frontend identity | Existing native TradingPage, toolbar, ChartPanel, panels, indicators and drawings remain recognizable and usable; no standalone lookup product | resolved | explicit |
| UI-07 | Read-only data with local interactivity | Order/account-trading actions and fabricated panels are blocked, while drawing add/edit/delete, price indicators and chart/layout preferences work | resolved | explicit |
| UI-08 | Native date and unavailable values | Seoul/US chart labels show original trading days, nullable quote/volume and volume-derived output stay unavailable, provider time remains distinct | resolved | explicit |
