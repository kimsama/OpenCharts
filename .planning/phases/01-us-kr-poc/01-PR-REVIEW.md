---
phase: 01-us-kr-poc
status: complete
oc_pr: https://github.com/kimsama/OpenCharts/pull/1
kb_pr: https://github.com/kimsama/kb-us-stock-trading-journal/pull/195
ship_01: complete
---

# Companion PR review and check record

Both source ranges have current independent P0/P1/P2=0 reviews. The companion
KB exact-head CI completed with all configured jobs passing. `SHIP-01` is
complete at the reviewed-source/check boundary; both PRs remain OPEN and no
merge or cleanup is authorized.

## Published source heads

| Repository | PR | State/base | Reviewed source head | Stable acceptance anchor | Review |
| --- | --- | --- | --- | --- | --- |
| OpenCharts | [#1](https://github.com/kimsama/OpenCharts/pull/1) | OPEN, non-draft; base `milestone/kb-market-data-poc` | `c582a8b14051092f6a3cefb1fbda4f6d8a247254` | [source acceptance comment](https://github.com/kimsama/OpenCharts/pull/1#issuecomment-5744115837) | P0=0/P1=0/P2=0 |
| KB journal | [#195](https://github.com/kimsama/kb-us-stock-trading-journal/pull/195) | OPEN, non-draft; base `dev`; merge state CLEAN | `efe1f1f96cca85466617b8e90933df51ca1e1ed3` | [final acceptance comment](https://github.com/kimsama/kb-us-stock-trading-journal/pull/195#issuecomment-5744105514) | P0=0/P1=0/P2=0 |

The acceptance comments are stable anchors for the reviewed source heads. The
documentation-only final metadata commit links the OpenCharts comment rather
than embedding its own commit SHA, which would create a self-referential hash
loop. Root will add the metadata commit SHA to that stable comment after fresh
metadata-only review.

## OpenCharts unpublished-history cleanup

- Approved milestone parent/base:
  `c089aec10b4bfa0aa310fd2cd05c52d383050bde`.
- Old unpublished local head:
  `e632990c034b738a3f64a7806abb9d5c56723c94`.
- Local-only backup ref:
  `refs/backup/feat-kb-market-data-poc-prepublish-20260920`. It was never
  pushed.
- Published clean head:
  `c582a8b14051092f6a3cefb1fbda4f6d8a247254`, one commit above the approved
  milestone parent.
- Old and clean head tree:
  `72c7da1f82e02b9828eee21d4d2300f4fab8caa7` in both cases.
- Old unpublished commit `9bf9060` contained machine-specific path defaults;
  it is not an ancestor of the published head. Final diff sanitization found no private
  machine path or owned runtime port, and the local backup namespace is absent
  from the remote.

The historical local task SHA `a957cd00...` identifies the validated production
runtime source. `a707c186...` identifies the final E2E/tests/config state after
the date-surface correction. They are exact scoped execution/review evidence,
but their complete trees are not claimed equal to `72c7da1f...` and they are
not represented as published ancestors after the authorized cleanup. Full-tree
identity applies only to unpublished `e632990c...` and clean published
`c582a8b...`.

## Original findings and dispositions

The implementation pipeline recorded original findings before correction and
then recorded per-finding commit/test dispositions in:

- `01-04-REVIEW.md` for startup/API/WS/store/query isolation;
- `01-05-REVIEW.md` for native identity, chart lifecycle, dates, nullable
  volume and drawings;
- `01-06-REVIEW.md` for single-entry browser, telemetry, native date surfaces
  and mobile visual acceptance;
- `01-07-REVIEW.md` for live/document evidence precision and backend revision
  provenance.

Those task reviews all ended P0=0/P1=0/P2=0 before publication. Fresh whole-PR
reviews then inspected the actual public source ranges. The first KB CI run
exposed CI-01 after source acceptance. Root posted the [original finding](https://github.com/kimsama/kb-us-stock-trading-journal/pull/195#issuecomment-5744168994)
before remediation and a separate [disposition](https://github.com/kimsama/kb-us-stock-trading-journal/pull/195#issuecomment-5744254229)
after the test-only fix. Fresh final whole-PR reviews ended P0=0/P1=0/P2=0 at
the heads and stable comments above. There are no current PR findings awaiting
remediation.

## Check policy and current status

### OpenCharts PR #1

- `statusCheckRollup` is empty and `gh pr checks --required` reports no checks.
- The milestone base is not protected, repository rulesets are empty, and the
  fork has no configured workflows.
- Therefore configured required checks are **none**. This is a repository
  policy fact, not a claim that a CI suite ran green.

### KB PR #195

- First CI run [35459216004](https://github.com/kimsama/kb-us-stock-trading-journal/actions/runs/35459216004)
  failed nine logging-capture assertions after 6,855 tests passed, with 20
  skipped and one deselected.
- Root cause was Alembic test `fileConfig` leaving the already imported
  coordinator logger disabled. A seven-line test-only fixture isolates and
  restores that logger flag; production source and live behavior are unchanged.
- The fix passed independent spec and quality P0=0/P1=0/P2=0, migration-order
  10, coordinator 90, lint, format and supported mypy over 176 source files.
- Final exact-head CI run [35460523435](https://github.com/kimsama/kb-us-stock-trading-journal/actions/runs/35460523435)
  completed at `2026-09-19T18:23:40Z`. All four jobs passed. Python reported
  6,864 passed, 20 skipped, one deselected and 30 warnings in 543.51 seconds.
- No job was skipped. Within the passing frontend job, distribution,
  `installChromium`, packaged-Chromium tests and installed-browser verification
  steps were conditionally skipped.
- The required-check query reports none. A direct branch-policy query returned
  403, so that policy-inspection limitation is recorded separately from the
  green configured CI result.

## Remaining delivery limits

- Historical first-lookup `connection_unavailable` cause remains unconfirmed.
- KOSDAQ live account entitlement and DRAM live routing remain unverified.
- The current Korean native observation has 123 rolling-window bars; the
  earlier backend-only acceptance has 124. Both dated observations remain.
- The TypeScript command still exits 2 with 151 baseline occurrences across 48
  normalized signatures. Exact comparison found zero introduced/resolved
  occurrences or signatures; this is not a passing typecheck.
- Both PRs remain OPEN. No merge, branch deletion, worktree cleanup or further
  live query is authorized by this record.

## Completion boundary

`SHIP-01` is complete with both PRs OPEN, current whole-PR P0/P1/P2=0 reviews,
OpenCharts' explicit no-check policy and green configured KB CI at reviewed head
`efe1f1f...`. The coordinated metadata-only commit/push does not reopen source
acceptance; its SHA is recorded in the stable OpenCharts acceptance comment
after fresh metadata review. No merge is part of Plan 07.
