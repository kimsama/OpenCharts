# Native Phase 1 Plan Check Request

## Correction and active inputs

Latest user instruction requires the original App → TradingPage → ChartToolbar → ChartPanel frontend, layout, indicators, drawings and local preferences supplied by KB. Standalone kb.html/custom lookup was an assistant misinterpretation. Corrected PROJECT/REQUIREMENTS/ROADMAP/CONTEXT/SPEC/UI-SPEC and SOURCE-AUDIT are canonical.

Review new active plans 01-04, 01-05, 01-06, 01-07. Completed 01-01 and its summary are an accepted backend dependency; do not re-execute it or revert accepted KR semantics to pre-live candidates. DATA-01/02 remain complete and their evidence is preserved by 01-07. Old 01-02/03 now use -SUPERSEDED.md; their historical reviews and old 01-PLAN-CHECK verdict do not approve the corrected native plans.

## Required checks

- Full 12 REQ, D-01..D-08, E-01..E-11, P-01..P-04 and UI-01..UI-08 coverage; structured prohibitions and no silent scope reduction.
- Native component path, fixed startup mode before demo/engine/feed/telemetry evaluation; generic legacy API writes/unsupported reads denied; every automatic path disabled; fake portfolio/depth absent.
- KB safe accounts never enter demo Account/auth/tick state. Preserve local drawing CRUD/undo/redo with full identity scope, existing browser-local preferences/templates and price indicators.
- Date-only DTO → numeric chart coordinate is explicitly separate from provider time; native axis/crosshair AND tooltip/delta-tooltip formatters preserve original dates in Asia/Seoul and America/New_York, including DST cases.
- Missing volume is unavailable in histogram/legend and strict KB VWAP; actual zero stays zero; demo default behavior remains unchanged.
- Plans have 11, 13, 9 (including deletions), 5 owned paths; internal active groups ≤5 except enumerated deletion batch split ≤4. Shared files and Vite/build resources serialize across waves.
- Each automated command has repository cwd and immediate fails_when. New named tests are explicit produced artifacts; existing package scripts are npm test=vitest run and npm run build=vite build. Required no-test/skipped-case failures are specified.
- Browser suite uses real proxy/backend/provider-transport fixtures, no normalized snapshot response intercept; desktop/390px native/tools/timezone checks and one final HTML entry.
- Review pipeline is executing-plans subagents/SDD/TDD, Sol implementation, Astra independent spec then quality per whole task. PR original findings precede remediation and dispositions follow; final P0/P1 zero/current-head required checks; two OPEN PRs, no merge.
- Historical 503 cause remains unconfirmed; accepted backend/normal-browser history is distinct from native evidence. Public configuration is names only. No live provider reads during implementation; final native normal check only under existing bounded authorization/ownership.

## Ownership and validation status

Planner changed only assigned canonical planning and active/superseded plan files. Root-owned STATE.md and 01-EXECUTION.md, source code, historical reviews/summaries/validation remain unedited. No plan commit/push/PR occurred.

Root owns formal checker/hooks and runtime coordination. This file requests independent review; it does not claim a passing verdict or executed application tests. Current GSD init is coarse/yolo, TDD true, research reused, checker true, Nyquist false, auto advance false; explicit user models take precedence.
