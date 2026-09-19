# Frontend Task Review

## Original spec findings — before remediation

Reviewer: independent gpt-6-astra. OC 7329e18..9bf906035b8e7538dfcd7f113bd8ae68119afbb0; KB e7f73c1..7888ff0a77924b266972c455fd37d717be638164. All 12 OC files and the KB fixture were reviewed. Verdict: P0=0, P1=1, P2=4.

- **FE-S1 / P1:** KB `tests/market_snapshot_fixture_server.py:136` passes `_env_file=None`, which still permits inherited process settings. OC `playwright.kb.config.ts:31` inherits the operator environment. A synthetic settings-only probe enabled chart-command, local-alert and Namuh flags; application lifespan can start auxiliary listeners. Isolate settings sources to explicit constructor values/defaults, including aliased variables, and prove isolation with hostile synthetic environment variables.
- **FE-S2 / P2:** OC `src/services/marketSnapshot.ts:52` validates volume digits but not finite Number conversion. A 309-digit value was accepted and becomes non-finite at `MarketSnapshotChart.tsx:88`. Add finite conversion validation and a regression.
- **FE-S3 / P2:** Required late US-to-KR/KR-to-US completion, pending-account invalidation, unmount completion, malformed dates/full identity mismatch, and real HTTP malformed/refusal/timeout cases lack evidence. Extend existing focused suites and fake provider transport without mocking normalized API responses.
- **FE-S4 / P2:** Missing Node declarations cause six diagnostics in the new proxy test and 17 in the changed Vite config. Treat these as task-owned. Add platform dev-only typings and resolve task-owned diagnostics; preserve unrelated baseline.
- **FE-S5 / P2:** OC `playwright.kb.config.ts:8,11` commits machine-specific backend/browser defaults. Require `KB_REPO_DIR` and use a browser channel or explicit local override.

Implementation and targeted regression fixes are assigned to the same Sol owner. Re-review the corrected task before independent quality review. No PR exists yet; this is the internal task gate, and later PR review findings will be posted on the actual PR before any PR-loop fix.

## Documented implementation exception

The orchestrator approves `@types/node@24` as a development-only declaration dependency. The installed tree/lock has no reusable Node declarations; Vite/Vitest expose it only as an optional peer. This narrow exception to the plan's no-new-dependencies working assumption checks the native Node proxy without handwritten ambient shims or suppressions. It adds no browser/runtime library and does not authorize unrelated dependency upgrades or TS baseline repairs.

## Initial visual evidence

Root inspected synthetic-account US/KR desktop images and the 390px form/result viewport. Desktop quotes and candles are visible; the mobile form/result fits without horizontal overflow in the browser assertion. The existing mobile image ends before the chart, so the next required affected browser run will include full scrollable content. Console, forbidden request, HTTP failure and telemetry arrays in the isolated connected-entry record are empty. This is fixture/browser evidence, not a new live-provider call.

## Remediation disposition

OC fix commit: 86d23ea302663fb2976fc4ded868ec79e2b0093e. KB fix commit: 653a148cc82c3f1719d7762b44ee8ed1edc20c2e.

- FE-S1: fixture settings now consume constructor values only. The synthetic hostile-environment test passes without starting listeners. Fixture Ruff/format/mypy pass for both files. The initial claim that a supplied OS-variable allowlist isolates child environments was incorrect: Playwright merges that object onto its inherited environment. Constructor-only Settings sources provide the effective application-setting isolation.
- FE-S2: finite Number validation rejects oversized volume; regression, full identity-tuple and invalid-calendar-date negatives pass.
- FE-S3: added US-to-KR/KR-to-US, pending-account and unmount races. Separate synthetic fixture accounts exercise malformed identity, provider refusal and timeout through the actual API/coordinator/adapter. No normalized response is intercepted.
- FE-S4: added only @types/node 24.13.6 and its declaration dependency. No existing package version changed. All task-owned TS diagnostics are resolved; full typecheck still fails in unchanged baseline files.
- FE-S5: KB_REPO_DIR is required; browser uses the Chrome channel or a local override. Missing backend configuration is explicitly rejected; machine paths are absent from final configuration.

After fixes, 38 focused Vitest tests and 5 real HTTP Playwright cases passed, along with the production build and two-entry assertion. Root inspected the updated 390x1144 mobile image, including the full chart. Current isolation arrays remain empty. Independent spec re-review and subsequent quality review are pending.

## Spec recheck — residual finding before correction

At OC 86d23ea / KB 653a148, FE-S2..S5 are closed and FE-S1's P1 service-activation risk is resolved. One **FE-S1a / P2** remains: `_fixture_settings` no longer passes `_env_file=None`. Installed pydantic-settings constructs and loads its dotenv source before the customized source tuple discards it, so a local `.env` can still be read. The reviewer proved this with mocked file existence and `_read_env_file`, without reading any real configuration. Keep init-only sources and explicitly disable dotenv creation/read; add a no-dotenv-read regression. Current recheck counts: P0=0/P1=0/P2=1 pending that correction.

FE-S1a was corrected at KB b7cd48e00a88b153ae757dcf393cfc51281954f7: init-only Settings sources are retained and `_env_file=None` explicitly prevents dotenv loading. RED observed one reader call against a synthetic temporary `.env`; GREEN observed zero. Both isolation regressions plus Ruff/format/mypy passed. No server, app listener or provider call was made; unchanged frontend/browser/build evidence was reused. Final spec spot review is pending.

Final independent spec verdict at OC 86d23ea / KB b7cd48e: P0=0/P1=0/P2=0. All original and residual findings are resolved.

## Original independent quality finding — before remediation

A separate gpt-6-astra reviewer inspected the entire final task range at OC 86d23ea / KB b7cd48e. Verdict: P0=0/P1=0/P2=1. Both range diff checks passed.

**FE-Q1 / P2:** `src/services/marketSnapshot.ts:16` accepts invalid offsets such as `2026-09-19T12:00:00+99:99` through installed Zod datetime validation. The actual validator accepted the value in an independent in-memory probe; `MarketLookupPage.tsx:334` then throws `RangeError: Invalid time value` during formatting. Malformed acquired_at or non-null provider_as_of can crash rendering instead of producing scoped invalid_response. Add finite Date.parse validation to the shared timestamp schema and regress both fields. This is malformed-response handling; no current backend emission of invalid timestamps was observed.

The separate original-vs-current TypeScript comparison is complete. Original f681cc03da1f4430e024f4e1a914dc5bc358a559 and current 86d23ea each exited 2 with exactly 151 unique diagnostics. Raw logs and normalized diagnostic sets are identical: introduced=0, removed=0, timer/NodeJS diagnostics=0. No original or current repository files were changed by that check. The timestamp correction had not yet been applied during capture. This establishes the pre-existing baseline without relying only on unchanged filenames.

FE-Q1 was fixed at cabc519df1f44a84ad3e93ff00187bd281aae822. Both invalid timestamp fields failed first, then the shared finite Date.parse guard passed the affected snapshot suite (18 tests). Production build and both-entry assertion passed. At 67f437a01cdeb9d03bf8d88d3b7b17698cae771e, the redundant environment helper was removed while explicit port/telemetry overrides remained; all five browser cases collected with explicit local configuration.

Final independent spec and quality correction reviews each passed P0=0/P1=0/P2=0 at OC 67f437a01cdeb9d03bf8d88d3b7b17698cae771e and KB b7cd48e00a88b153ae757dcf393cfc51281954f7. Prior whole-task reviews and unchanged passing checks were retained. No reviewer repeated a live provider call.
