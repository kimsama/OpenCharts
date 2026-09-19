---
phase: 01-us-kr-poc
plan: "07"
status: complete
ship_01: complete
---

# Native validation and companion delivery draft

Task 1 produced the accepted native validation index, sanitized public report
and changelog at the final reviewed tree. Its independent spec and quality
reviews ended P0=0/P1=0/P2=0. The record distinguishes current native runtime
backend production `2f3d73f3...`, historical activation acceptance
`e7f73c1...`, current 123-bar KOSPI evidence and historical 124-bar evidence.

## Published source status

| Repository | PR/base | Reviewed source head | Review anchor | Current check state |
| --- | --- | --- | --- | --- |
| OpenCharts | [#1](https://github.com/kimsama/OpenCharts/pull/1), base `milestone/kb-market-data-poc` | `c582a8b14051092f6a3cefb1fbda4f6d8a247254` | [P0=0/P1=0/P2=0](https://github.com/kimsama/OpenCharts/pull/1#issuecomment-5744115837) | No configured workflows, protection, rulesets or required checks |
| KB journal | [#195](https://github.com/kimsama/kb-us-stock-trading-journal/pull/195), base `dev`, merge state CLEAN | `efe1f1f96cca85466617b8e90933df51ca1e1ed3` | [P0=0/P1=0/P2=0](https://github.com/kimsama/kb-us-stock-trading-journal/pull/195#issuecomment-5744105514) | Final run 35460523435: all four jobs passed |

Both PRs are OPEN and non-draft at their reviewed source heads. The stable
acceptance comment on PR #1 is the source-review anchor for the coordinated
metadata-only final commit, avoiding a self-referential commit hash. Root adds
the metadata SHA to that comment after fresh metadata review.

## Clean publication history

Before publication, OpenCharts preserved the old unpublished head
`e632990c...` under a local-only backup ref and created one clean phase commit
`c582a8b...` on approved milestone parent `c089aec...`. Both heads have the
identical tree `72c7da1f82e02b9828eee21d4d2300f4fab8caa7`. The sensitive unpublished
commit is not a published ancestor, the backup ref was not pushed, and the
final public diff contains no private machine paths or owned runtime ports.

Historical local `a957cd00...` identifies the validated production runtime
source, while `a707c186...` identifies the final E2E/tests/config state. They
are scoped test/review evidence and are not claimed to be ancestors of the
clean public commit or to have the complete tree `72c7da1f...`. Full-tree
identity applies strictly to `e632990c...` and `c582a8b...`.

## CI correction and final result

Initial KB run 35459216004 failed nine logging-capture assertions after 6,855
tests passed. Root posted [CI-01](https://github.com/kimsama/kb-us-stock-trading-journal/pull/195#issuecomment-5744168994)
before remediation. Alembic test `fileConfig` had left the imported coordinator
logger disabled; a seven-line test-only fixture isolates/restores that flag.
Production source and live behavior did not change. The separate
[disposition](https://github.com/kimsama/kb-us-stock-trading-journal/pull/195#issuecomment-5744254229)
records focused checks and the fix review.

Final run 35460523435 completed at `2026-09-19T18:23:40Z`: all four jobs
passed. Python reported 6,864 passed, 20 skipped, one deselected and 30 warnings
in 543.51 seconds. No job was skipped; the passing frontend job conditionally
skipped distribution, `installChromium`, packaged-Chromium tests and
installed-browser verification steps. Required-check query reports none. A
direct branch-policy query returned 403, which is a policy-inspection limit and
not a qualification of the green configured CI result.

## Validated product outcome

- One original OpenCharts index/App/TradingPage/ChartPanel product supports
  fixed demo or KB startup modes; the superseded standalone product is removed.
- Frontend focused tests passed 61, the real HTTP browser suite passed 6, and
  both production builds passed with 1,979 modules and only `index.html`.
- Current native live observations used exactly one MU/NAS and one
  005930/KOSPI submission. US returned quote 3/3 and 250 delayed-15 USD bars;
  Korea returned quote 3/3 and 123 KRW bars with unknown/null delay.
- Original layout, 390px controls, SMA, drawings/templates, nullable volume,
  read-only isolation and native axis/crosshair/OHLCV/Delta dates are accepted.
- Backend production and fixture reviews, native tasks 01-04 through 01-06,
  Task 1 documents and both current PR source ranges all ended
  P0=0/P1=0/P2=0.

## Remaining limits

The earlier 503 cause, KOSDAQ live entitlement and DRAM live route remain
unverified. Provider time is unavailable. Streaming, polling, intraday data and
trading remain outside scope. The repository-wide TypeScript result remains the
known 151-occurrence baseline and is not a pass.

## Completion boundary

`SHIP-01` and Plan 07 are complete with both reviewed PRs OPEN, OpenCharts' no-
check policy and green configured KB CI. The coordinated metadata-only commit
is reviewed and linked through the stable OpenCharts acceptance comment; it
does not replace the reviewed source head. No merge or cleanup is part of this
plan.
