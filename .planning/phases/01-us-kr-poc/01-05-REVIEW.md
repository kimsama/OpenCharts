# Native data/chart task review

## Original independent spec findings — before remediation

Independent Astra reviewed all thirteen files in 63346e5..f4064de339e4f0bd5ec92954164b29979e1688f6. Verdict: P0=0/P1=2/P2=4. No application/server/provider/build action was taken; focused offline probes and diff checks were used alongside worker evidence.

- **N05-S1 / P1:** ChartToolbar:491 closes the symbol popup immediately, while its only status/error live region is inside at :556. Invalid input and asynchronous failures/loading become invisible/unannounced until reopening. Keep feedback in a persistent native surface or retain the popup appropriately, and test failures without reopening it.
- **N05-S2 / P1:** ChartPanel:1609,1819 restores legendVolRef on crosshair leave, but manual data never populates this ref and its default/reset is zero. Missing and positive volumes therefore become V0. Restore the corresponding last candle's nullable volume; exercise crosshair enter/leave for missing, zero and positive values.
- **N05-S3 / P2:** useIndicators:35 returns on empty data before clearing old series (independent hook probe added SMA and removed zero on empty). ChartPanel:1722,1972 recreates on snapshot precision changes, while indicator/plugin setup does not follow actual chartEpoch. Clear old indicators on failure/empty and preserve/rebind overlays through precision/lifecycle changes.
- **N05-S4 / P2:** Strict missing-volume VWAP produces no false points but silently disappears. Add the required native unavailable explanation while preserving price indicators.
- **N05-S5 / P2:** Native tests do not mount actual ChartPanel or test factory/axis/crosshair/legend/lifecycle wiring. Request cases omit account/query-route/unmount and error clearing; drawing cases omit edit, clear, remount reload and late-load rejection. Extend existing suites through actual native components/hooks; do not substitute private plugin-option inspection for integration evidence.
- **N05-S6 / P2:** ChartPanel:986 committed provenance omits market and query-market routing, which are visible only in the editable popup. Show committed market and explicitly labelled query market from manualSnapshot outside the popup.

Same Sol owner fixes within the thirteen task-owned paths, with failing regressions first. No new screen/debug endpoint or dependency is needed. Full spec recheck precedes independent quality review and 01-06. Standalone removal and real browser proof remain 01-06 scope.

## Remediation disposition

Sol corrected the six findings at 5e802dce661ff545d4810acc82deeebb54b22aaf, changing five owned paths. Persistent toolbar feedback now survives closing the popup; actual crosshair tests preserve missing, zero and positive volume; indicator empty-data removal and chartEpoch lifecycle plus plugin reattachment are covered; missing-volume VWAP has an explanation; committed market/query-market labels are visible. Existing suites now exercise actual ChartPanel against engine/browser stubs, request identity/error transitions and drawing edit/clear/undo/remount/late-load paths.

The four required suites passed 45 tests; production build passed; full TypeScript remains the known 151-diagnostic baseline. No server/browser/provider/backend operation occurred. Corrected whole-task spec recheck and subsequent independent quality review are pending.

## Spec recheck — residual findings before next correction

At 5e802dc, P0=0/P1=0/P2=2. N05-S1/S2/S4/S6 are resolved. Two bounded gaps remain:

- N05-S3: ChartPanel's candle/volume population effect (:1898) omits chartEpoch. Recreating with stable nonempty data and identity leaves new primary series empty, even though indicator/plugin reattachment is fixed. An independent in-memory test variant used distinct chart/series instances and observed zero setData calls on the new candle series. Add the lifecycle trigger and a distinct-instance/stable-data regression.
- N05-S5: request tests assert account/unmount abort flags but do not complete those ignored-abort requests afterward; same-symbol query-market invalidation is missing. Add explicit late completion rejection and route-change evidence. Strengthen chart recreation tests with active indicators/plugins and per-epoch assertions instead of shared instances/cumulative counts.

The residuals were corrected at f96203c14592d6669ae69d2ef4fa18244f6b03d4. Candle/volume population now follows chartEpoch; distinct-instance tests hold nonempty data/identity stable while precision changes and verify new primary data and active overlays. Request tests complete ignored-abort responses after account/query-route/unmount transitions, including MU NAS-to-NYS ownership. The four suites passed 47 tests (native chart 12, native market 6, snapshot 18, proxy 11), production build passed and TypeScript remains the 151 baseline. No real runtime action occurred. Final spec spot review and whole-task quality review are pending.

Final independent spec review at f96203c passed P0/P1/P2=0. A separate whole-task quality review then reported P0=0/P1=0/P2=1:

**N05-Q1 / P2 (original before fix):** TradingPage:126 restores saved tf_<symbol> after manual submission sets 1d. An independent in-memory native-market regression seeded tf_MU=15m and observed ChartPanel receiving timeframe15m for daily data, with disabled interval controls. This changes native labels/drawing interval math. Keep KB timeframe fixed to 1d through initialization/restoration and preserve the saved demo interval unchanged. Add the stored-preference regression. No other actionable quality finding was reported.

N05-Q1 was fixed at 4b6b256a66f8cc1d0bed7eeb86ed01bd939333b3. RED reproduced saved 15m overriding both the real toolbar and ChartPanel; GREEN keeps KB initialization/restoration and direct callbacks at 1d while retaining tf_MU=15m unchanged. The four suites passed 48 tests, production build passed and the 151 TypeScript baseline is unchanged with no new changed-span diagnostics. Bounded spec/quality correction reviews are pending; no real runtime calls were made.

Final spec and quality correction reviews both passed P0=0/P1=0/P2=0 at 4b6b256a66f8cc1d0bed7eeb86ed01bd939333b3, retaining their prior complete thirteen-file inspections. The task is accepted for 01-06 browser/entry verification. No runtime calls were made by reviewers.
