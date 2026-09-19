# Phase 1 Source Audit — Corrected Native Frontend

The latest user correction supersedes the assistant's standalone-page interpretation. Current plan set: completed backend 01-01, then sequential native 01-04 → 01-05 → 01-06 → 01-07. Historical 01-02/03 use -SUPERSEDED.md suffixes; their reviews/summaries/validation remain untouched. Planning baseline supplied by root: OC 85d3a55, KB b0d4c8a. These are baseline identities, not future verification claims.

## Mandatory four-source coverage

| SOURCE | ID | Feature/constraint | Plan/task | Status | Evidence/implementation owner |
|---|---|---|---|---|---|
| GOAL | Phase 1 | Original OpenCharts native manual US/KR quote/chart, provenance/errors and local chart tools | 01-04/1, 01-05/1, 01-06/1, 01-07/1 | COVERED | Native App/TradingPage/toolbar/ChartPanel, no replacement product |
| REQ | QUERY-01 | Arbitrary manual ticker, safe account and query market | 01-05/1, 01-06/1 | COVERED | Extend existing list-only toolbar controls |
| REQ | QUERY-02 | Quote/daily without trade subject, retain native layout/indicators/drawings | completed 01-01, 01-05/1, 01-06/1 | COVERED | Accepted API plus original ChartPanel |
| REQ | QUERY-03 | Currency/source/provider/acquisition/delay truth | 01-05/1, 01-06/1 | COVERED | Private native legend/toolbar nullable quote inputs |
| REQ | QUERY-04 | Invalid/config/provider/no-data/timeout/offline and late results | completed 01-01, 01-05/1, 01-06/1 | COVERED | Reused strict client/errors and full request ownership |
| REQ | DATA-01 | Fixed account-scoped US quote/daily reads | completed 01-01; 01-07/1 preserves evidence | COVERED | No backend reimplementation |
| REQ | DATA-02 | Equivalent KR reads and KRW | completed 01-01; 01-07/1 preserves evidence | COVERED | Accepted forward window/descending normalization; KOSDAQ live limit retained |
| REQ | DATA-03 | Null/identity/Decimal/date and listing versus routing | 01-05/1, 01-06/1 | COVERED | Native date/plugin formatting and strict reported-volume input |
| REQ | SAFE-01 | Fixed local read allowlist, no leaks/orders/passthrough | completed 01-01, 01-04/1, 01-06/1 | COVERED | Shared service denial plus actual proxy/browser checks |
| REQ | SAFE-02 | Fixed native mode, no demo/telemetry/fake panels; demo intact | 01-04/1, 01-05/1, 01-06/1 | COVERED | Startup guards; single final entry; local tools remain allowed |
| REQ | VERIFY-01 | Meaningful both-market focused tests and builds | 01-04/1, 01-05/1, 01-06/1, 01-07/1 | COVERED | Real native tests, real HTTP browser, default/KB builds |
| REQ | VERIFY-02 | Actual native browser and honest live limits | 01-06/1, 01-07/1 | COVERED | Native desktop/mobile/timezone/tools; accepted provider evidence separate |
| REQ | SHIP-01 | Two open reviewed PRs/current heads/checks | 01-07/2 | COVERED | Findings-before-fixes and per-finding evidence, no merge |
| RESEARCH | R-01 | Router→same-account selector→lease→retained wrapper→fixed adapter | completed 01-01 | COVERED | Accepted interface remains reused |
| RESEARCH | R-02 | Existing US daily fixed body/parser, 250 cap | completed 01-01 | COVERED | No new read framework |
| RESEARCH | R-03 | No KR collision in symbol-only US cache/DB | completed 01-01, 01-05/1 | COVERED | Direct API and full native submitted identity |
| RESEARCH | R-04 | Decimal/null/identity/time/date contract | 01-05/1, 01-06/1 | COVERED | Strict client plus chart-boundary calendar-coordinate mapping |
| RESEARCH | R-05 | Exact official fixed US/KR quote/daily operations | completed 01-01 | COVERED | Current accepted backend supersedes pre-live candidate uncertainty |
| RESEARCH | R-06 | KR direction/status/entitlement require actual evidence | completed 01-01; 01-07/1 | COVERED | Accepted dated result retained; no original-candidate reversion |
| RESEARCH | R-07 | Cboe listing is not NAS/NYS/AMX routing proof | 01-05/1, 01-06/1 | COVERED | Query-market label and strict reused validation; no inferred route |
| RESEARCH | R-08 | Focused backend/frontend, browser and live are distinct | 01-04..01-07 | COVERED | No fixtures-as-live, no redundant accepted backend reruns |
| RESEARCH | R-09 | User workflow/models/PR loop | 01-04..01-07 | COVERED | Sol implementation, Astra spec then quality, executing-plans/SDD/TDD |
| RESEARCH | R-10 | Native bootstrap/static demo/feed/telemetry imports | 01-04/1 | COVERED | Source map in 01-04; guard before module evaluation |
| RESEARCH | R-11 | Native auto reads/history/stale/live paths and nullable volume | 01-04/1, 01-05/1 | COVERED | queries/TradingPage/ChartPanel and indicator policy |
| RESEARCH | R-12 | Numeric drawing time and local plugin formatters | 01-05/1, 01-06/1 | COVERED | Explicit date formatter injection and actual Seoul/US browser cases |
| RESEARCH | R-13 | Drawing CRUD enumerates demo symbols; prefs/templates already local | 01-05/1 | COVERED | Small full-scope drawing helper, retain existing local preferences |
| CONTEXT | D-01 | Original selector, safe account/routing/arbitrary manual ticker | 01-05/1, 01-06/1 | COVERED | Native control extension, not replacement form |
| CONTEXT | D-02 | Same-account retained lease/no trade subject | completed 01-01, 01-05/1 | COVERED | Existing client/API, KB identity outside trading store |
| CONTEXT | D-03 | Fixed reads only, all trading/automatic work denied | 01-04/1, 01-05/1, 01-06/1 | COVERED | Service and UI boundaries; local annotation remains permitted |
| CONTEXT | D-04 | Actual provenance/null/date/routing truthfulness | 01-05/1, 01-06/1 | COVERED | Native legend, reported volume and plugin dates |
| CONTEXT | D-05 | Original frontend, fixed startup mode, remove standalone product | 01-04/1, 01-05/1, 01-06/1 | COVERED | Latest user correction overrides old assistant choice |
| CONTEXT | D-06 | Narrow loopback proxy and no leaks | completed 01-01, 01-04/1, 01-06/1 | COVERED | Reuse reviewed proxy; native service/network tests |
| CONTEXT | D-07 | Spec→quality tasks, named models, findings/PR loop | all new tasks, 01-07/2 | COVERED | No gsd-execute-phase substitution |
| CONTEXT | D-08 | Preserve roots/processes/bases; reviewed OPEN PRs only | all new plans, 01-07/2 | COVERED | No merge/cleanup; root owns runtime coordination and STATE/EXECUTION |

R-10..R-13 are the current bounded native source maps supplied by existing Astra/Sol agents, with exact file:line spans embedded in 01-04/05. They supplement existing RESEARCH; they do not replace accepted backend evidence.

## Edge, prohibition and UI coverage

| IDs | Implementation/test owner | Final observation |
|---|---|---|
| E-01 | 01-05 native input + existing client/backend | 01-06 actual US/KOSPI/KOSDAQ |
| E-02 | 01-05 full-tuple request/drawing ownership | 01-06 account/market/late-response scenarios |
| E-03 | 01-05 quote/volume/provenance | 01-06 missing/unknown native UI |
| E-04 | completed 01-01 guard; 01-04/05 identity separation | 01-06 forbidden/identity regressions |
| E-05 | 01-05 scoped failure/clear | 01-06 offline/refused/empty/timeout cases |
| E-06 | existing strict DTO plus 01-05 native conversion | 01-06 malformed provider fixture |
| E-07 | 01-04 startup/service; 01-05 chart lifecycle | 01-06 real native no-demo/no-write observations |
| E-08 | 01-04 mode/persisted-state isolation | 01-06 KB versus demo controls |
| E-09 | 01-05 numeric bridge + axis/plugin formatters | 01-06 Seoul/New York actual date surfaces |
| E-10 | 01-05 scoped local drawing CRUD/undo/redo | 01-06 same/different identity and reload |
| E-11 | 01-04 unavailable panels; 01-05 null/strict VWAP | 01-06 no fabricated volume/depth/portfolio |
| P-01 | backend/client/proxy + 01-04 direct service denial | 01-06 network/privacy; 01-07 public scrub |
| P-02 | 01-04 fake-panel/demo block + 01-05 null/volume | 01-06 real native data absence checks |
| P-03 | unchanged DTO/backend routing + native labels | 01-06 unverified venue handling |
| P-04 | 01-04 original chain + 01-06 standalone deletion | Actual native component path and one-entry build |
| UI-01/UI-02/UI-03/UI-05 | 01-05 controls/ownership/provenance/errors | 01-06 native keyboard/HTTP cases |
| UI-04/UI-06/UI-07/UI-08 | 01-04/05 original layout/tools/date/null semantics | 01-06 desktop/390px/timezone/tool interaction |

All new plans carry P-01..P-04 as structured must_haves.prohibitions with statement/status/verification. No missing test descriptor or historical review is treated as automatic enforcement success. 01-07 records all rows and remaining limits at final tested SHAs.

## Dependencies and bounded ownership

| Plan | Needs | Owns | File scope | Outcome/review |
|---|---|---|---|---|
| 01-01 | Existing backend | Completed fixed snapshot API | Historical 14 | Preserve reviewed acceptance |
| 01-04 | Completed 01-01 | Native startup/service/store/query/privacy guards | 11 modified, ≤5 active per chunk | Safe actual native shell, then spec→quality |
| 01-05 | Reviewed 01-04 | Original query/quote/chart/indicators/drawings/date plugins | 13 modified, ≤5 active per chunk | Both-market native functionality, then spec→quality |
| 01-06 | Reviewed 01-05 | Single entry, obsolete file removal, native E2E | 4 modified + 5 deleted, bounded chunks | Real native HTTP/build evidence, then spec→quality |
| 01-07 | Reviewed 01-06 | Sanitized native evidence and two reviewed PRs | 5 evidence paths | Validation review then PR loops/current HEAD checks |

Shared TradingPage and runtime/build resources make execution serial. One Sol worker owns each coherent task; chunk summaries preserve SHA, changed files, test states and unresolved contracts without extra product/checkpoint files. No dependent task advances before whole-task spec and quality findings are resolved.

## Discovery, verification and resource limits

- Current research plus targeted native maps suffice; no new library/integration choice or broad research.
- GSD init: coarse/yolo, TDD on, plan checker on, Nyquist off, auto advance off. Explicit Astra/Sol user roles override inherited runtime defaults.
- Estimate calibration factor 1, sample_count 0, confidence low: raw/calibrated projections 24000, 38000, 14000, 18000 for 04..07.
- Every automated invocation has separate repository cwd and adjacent observable fails_when. No tests collected/required skipped cases fail; path probes are not runtime evidence. PR retrieval is separate from mandatory OPEN/base/HEAD/check comparisons.
- Root gracefully stops only its own prototype frontend before native source/fixture/build work, keeps the accepted backend and unrelated original apps alive, and restarts the native frontend only after final browser verification. Never run multiple Vite/build processes sharing the same cache concurrently.
- No live provider reads during implementation. Reuse accepted backend evidence; only 01-07 may perform the approved bounded final normal native-US/KR check if needed and ownership permits.
- No package install/schema/migration; no secrets/raw payload/configuration coordinates in public artifacts. Configuration names only.

## Honest prior evidence and exclusions

The backend US/KR API and current normal-browser results are accepted existing evidence; native frontend acceptance must still be performed. Prior standalone-page success is not native-UI evidence. The cause of the historical 503 remains unconfirmed, and new safe diagnostics/later success cannot establish it retrospectively. Preserve KOSDAQ live entitlement and DRAM routing limits.

Deferred/excluded: orders, streaming, polling, catalog/autocomplete, intraday UI, automatic imports, new credential UI, full platform parity and runtime dependencies. Retaining original local layout/tools/preferences is required and is not deferred. No required source item is missing.
