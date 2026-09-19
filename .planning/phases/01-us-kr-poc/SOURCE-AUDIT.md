# Phase 1 Source Audit

Planning date: 2026-09-19. Three sequential plans, five tasks: 01-01 owns the US HTTP backend tracer and KR expansion (14 files); 01-02 owns the coherent both-market connected page/proxy/browser path and fixture server (13 files); 01-03 owns actual validation and two reviewed open PRs (5 files). Every plan/task owns fewer than 15 changed files. US/KR functionality and all source decisions remain in scope.

| SOURCE | ID | Feature/Requirement | Plan/task | Status | Notes |
|---|---|---|---|---|---|
| GOAL | Phase 1 | Editable US/KR manual quote/daily lookup with trustworthy provenance and errors | 01-01/1-2, 01-02/1, 01-03/1 | COVERED | Real API tracer first, KR API expansion, then both-market browser |
| REQ | QUERY-01 | Market, query market, free ticker, manual submit and normalization | 01-02/1 | COVERED | US uppercase, KR leading zeros |
| REQ | QUERY-02 | Quote/daily arbitrary symbol without trade subject | 01-01/1-2, 01-02/1 | COVERED | Direct snapshot route |
| REQ | QUERY-03 | Currency/source/time/delay truthfulness | 01-02/1 | COVERED | Undocumented provider time stays null |
| REQ | QUERY-04 | Invalid/config/provider/no-data/timeout/offline and late response | 01-01/1-2, 01-02/1 | COVERED | Fixed errors and request ownership |
| REQ | DATA-01 | Account-scoped US fixed quote/daily reads | 01-01/1 | Existing KB seams and approved US contract; actual credentials only for bounded acceptance | Real US FastAPI HTTP → lease → fixed quote/daily → normalized response | None; true external failures stay explicit |
| 01-01/2 | Reviewed US API tracer and shared adapter/coordinator | Equivalent KR API and generated combined contracts | None; unresolved live semantics stay closed |
| 01-02/1 | Reviewed both-market backend DTO and fixture hooks | Editable US/KR browser path, exact proxy, provenance/chart/race/accessibility behavior | None; one coherent frontend task |
| 01-03/1 | Reviewed complete frontend/backend behavior | Actual visual/live evidence with precise operational limits | None; agent-operated browser |
| 01-03/2 | Reviewed evidence and scoped commits | Two open PRs at fresh reviewed HEADs and observed required checks | None; publishing explicitly authorized |

Plans are serialized 01-01 → 01-02 → 01-03 because the UI consumes the reviewed backend contract and final verification consumes both. Backend tasks share adapter/coordinator files; fixture/backend/credential/process and build resources have one owner. No same-wave plans race on files/resources. Individual independent read-only reviewer work may run in parallel only when it does not bypass the task's spec-before-quality sequence.

## Discovery and planning probes

- Existing research/pattern/official-contract artifacts satisfy discovery; no new dependency or broad research is needed.
- GSD init: coarse/yolo, TDD=true, Nyquist=false, plan checker=true. No previous phase history; no .planning graph or project-local skill folders found.
- estimate-calibration: factor=1, sample_count=0, confidence=low. Plans use raw 28000, 24000 and 18000 tokens; calibrated values are identical.
- Assumption-delta detector returned detected=false. Runtime identity still explicitly includes account, market, query_market and symbol; no cache/schema generalization is introduced.
- No schema/migration files are in scope. Schema-push gate is not applicable.
- No package installs are in scope. Installed React/Vite/lightweight-charts/Playwright and backend dependencies are reused.
- Each automated invocation now has separate repository cwd metadata and an immediately following fails_when within verify. Test commands must collect/run the expected cases; no-test exits and skipped required cases do not pass. Path-only/not_applicable probes are not behavior evidence. External KB paths retain explicit ownership rather than OC-relative lookup.
- PR view commands retrieve evidence only; 01-03 explicitly requires agent-executed OPEN/base/final-reviewed-SHA comparisons and actual required-check policy verification before SHIP-01 completion.

## Pending concrete evidence, not omitted scope

US new quote business-success/entitlement and KR date-based direction/status/entitlement need bounded actual-account evidence. The fixed KR candidate is inq_clsf=1 with current Asia/Seoul date and 250 rows. Existing same-account lease ownership may reject a second process; ownership must not be bypassed. Each market remains fail-closed if prerequisites fail, and runtime/PR reporting must name that limitation. Fixture passing does not imply broker or browser live success. Separate execution-history/provider-ingest activation gates remain untouched.

Excluded per approved scope: orders, streaming, polling, catalog/autocomplete, intraday UI, automatic import, new credentials UI and broad broker platform. No required source item is missing.
