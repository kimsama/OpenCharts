# Phase 1 Specification

Goal: Supply the original OpenCharts App → TradingPage → native symbol controls → ChartPanel with user-entered US/KR quote and daily data from the accepted KB backend. Preserve the original layout, indicators, drawings and local preferences. One index entry uses a fixed startup demo or KB mode. The standalone lookup product was an assistant misinterpretation and is superseded by the latest user correction.

## Edge Coverage

| ID | Requirement | Edge | Acceptance | Status | Verification |
|---|---|---|---|---|---|
| E-01 | QUERY-01 | Empty/malformed ticker; KR leading zero | Invalid submission is rejected before provider I/O; 005930 round-trips unchanged | resolved | explicit |
| E-02 | QUERY-04 | Older request finishes last | Only latest submitted identity/results remain visible | resolved | explicit |
| E-03 | DATA-03 | Unknown delay/missing volume/bid/ask | Missing values stay missing; unknown is visible and never claimed realtime | resolved | explicit |
| E-04 | SAFE-01 | Foreign/unknown account or no unique active connection | Reject before credential/token/provider access, no fallback to other account | resolved | explicit |
| E-05 | QUERY-04 | Backend offline/provider rejection/timeout/no data | Clear scoped error; no old bars under the new symbol or demo fallback | resolved | explicit |
| E-06 | DATA-03 | Response ticker/market differs; bad numbers/dates | Reject malformed/mismatched data and preserve sanitized failure | resolved | explicit |
| E-07 | SAFE-02 | Native KB mode mounts/unmounts or user changes market | Demo bootstrap/feed/telemetry and all trading writes cannot run; chart lifecycle disposed while native drawing and preference interactions remain usable | resolved | explicit |
| E-08 | SAFE-02 | Fixed startup mode and previously persisted demo state | KB mode cannot inherit demo balances/positions/orders/ticks or switch mode via symbol/account input; demo startup remains functional | resolved | explicit |
| E-09 | DATA-03 | Date-only bars enter numeric native chart/drawing APIs | Preserve original trading date in chart ticks/crosshair/tooltips in Seoul and US timezones; numeric midnight is a calendar coordinate, never provider-as-of | resolved | explicit |
| E-10 | QUERY-02 | Same ticker under another account/query market; local drawing actions | Full-identity chart/drawing persistence keeps markets/accounts isolated; drawing add/edit/delete and supported indicators/local layout preferences still work without broker writes | resolved | explicit |
| E-11 | DATA-03 | Missing quote side/volume/depth/portfolio and volume-dependent indicators | Quote sides/volume remain unavailable; no zero-filled histogram or legend; volume-dependent output is unavailable when required volume is missing; no synthetic portfolio/depth | resolved | explicit |

## Prohibitions

| ID | Requirement | Prohibition | Status | Verification |
|---|---|---|---|---|
| P-01 | SAFE-01 | No order TR, arbitrary provider path, credential leak, raw payload in public response | resolved | explicit |
| P-02 | SAFE-02 | No synthetic quote/volume, demo portfolio/depth or crypto replay fallback in KB mode | resolved | explicit |
| P-03 | DATA-03 | No relabelling an unverified Cboe instrument as Nasdaq | resolved | explicit |
| P-04 | SAFE-02 | No separate connected HTML/page/chart product replacing the original OpenCharts frontend | resolved | explicit |

## Completion

All 12 requirements must be mapped and reviewed. Unit/fixture checks, actual broker evidence and external CI are distinct. Missing live prerequisites must be named, not concealed. Two PRs must have fresh P0/P1-free review; preserve any remaining P2 and required-check status.
Completed 01-01 backend acceptance is retained. Earlier standalone-page review/validation stays historical and does not satisfy native-UI acceptance. Do not claim the cause of the earlier 503: it remains unconfirmed despite later successful observations. Public evidence uses configuration names only and contains no private account/connection coordinates.
