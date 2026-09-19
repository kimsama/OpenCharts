# Native single-entry browser task review

## Fixture dependency

The original fixture only supplied September bars, insufficient for the planned New York DST and SMA20 browser checks. Root authorized a narrow fixture-only change in the KB repository: browser-specific data sections, a consistent private clock, and one regression. Production validators, original base fixtures and real provider behavior remain unchanged.

KB b0d4c8a..671c3bf5571ec2e653040ba9fcf1eab555171f89 changes exactly tests/fixtures/kb_market_snapshot.json, tests/market_snapshot_fixture_server.py and tests/test_market_snapshot_fixture_server.py. The fixture clock is 2026-04-01. US has 22 real sessions from February 5 through March 9, including March 6/9 around DST; volume covers positive, zero and missing. Korean examples preserve the same date boundary and missing/zero/positive cases. RED failed on the absent clock; GREEN fixture tests passed 3, with Ruff, format, fixture-server mypy and diff checks passing.

Independent Astra spec and quality both passed P0=0/P1=0/P2=0. Isolation is process-scoped: the pre-existing builder patches module globals without restoring them, and the browser runner invokes it in a separate Python process. The pytest tests import constants/settings helpers, never the builder. This is not a reusable, reversible in-process app fixture. No production provider or server action occurred during these reviews.

## Original browser findings before remediation

- Native local template saving logs React's cross-component update-during-render error involving ChartTemplatesMenu and TradingPage.
- Enabling OHLCV Tooltip logs that its chart element must use relative or absolute positioning.

The first native HTTP case reached the console gate after successful quote, SMA and local template interactions, with zero forbidden requests. Root returned both defects to the same native implementation owner for minimal source corrections and existing regression coverage; suppressing the console errors is prohibited. The final task's independent reviews must include these corrections.

The required six-suite unit run separately found 58 passing tests and one stale bootstrap assertion expecting a legacy chartDrawings.list call before any KB identity was committed. Root authorized changing that assertion to zero calls, consistent with reviewed tuple-scoped local storage. Existing drawing CRUD/history tests remain required.

## Final native review

Implementation is at f8d4c46743dc355340bf0aea5ecdf92634fb0ee4. The 95b14bd..HEAD task range changes/deletes fourteen files (394 additions, 1,013 deletions). Required native/client/proxy tests pass 60 across six files; real HTTP Playwright passes all six cases in one 1.2-minute run. Default and KB production builds each pass with 1,979 modules and exactly index.html as the only HTML entry. Owned fixture ports are closed. Independent spec then quality review is pending.

At c8f00d70883a5d61a218e6614e15a78af1bfcb72, the plugin toggle persists preferences after the state update rather than inside its StrictMode updater; a new StrictMode regression is GREEN. The chart host is positioned relatively and the real tooltip browser case passes without its prior error. The obsolete bootstrap drawing-list assertion now expects zero calls. The independent TypeScript comparison against pre-native 86d23ea found identical 151 diagnostic occurrences across 48 signatures, with no introduced or resolved signature/occurrence; only locations shifted. Because the final mobile JSX layout changed afterward, the same comparison is being repeated at final HEAD.

## Root visual finding before remediation

**N06-V1 / P2:** In the actual native 390px Korean-chart screenshot, the drawing rail covers the selected-symbol/market labels and the beginning of the acquisition timestamp, while provenance overlaps the right price scale. ChartLegendHeader at ChartPanel.tsx:972 starts at left-3 and its manual row at :989 uses a viewport-based maximum width rather than the usable chart width. Keep the native tools and demo appearance; constrain and wrap the KB header/provenance inside the chart area without hiding required fields. Add a mobile geometry/readability regression and recapture clean desktop/mobile views plus the mobile symbol controls. Root assigned this bounded correction to the existing Sol owner before final independent task reviews.

N06-V1 RED measured provenance x=12 while the drawing rail ended at x=54. The bounded KB-only layout correction in f8d4c46 is GREEN: labels start after the rail, finish before the plot's right price scale and retain the full timestamp inside plot bounds. Demo header classes are unchanged. Root inspected refreshed clean US desktop, Korean mobile and mobile controls images, plus the Seoul/New York tooltip images. The metadata overlap is resolved; original native layout, candles, tools and SMA remain visible. The six-case browser pass includes actual drawing CRUD/history/reload/identity isolation, both Korean routes, error/race boundaries, a 31-second no-poll check and both timezone contexts. The saved isolation JSON is a scenario-specific record, not an asserted aggregate of intentional-error cases.

## Original independent spec findings before remediation

At f8d4c46743dc355340bf0aea5ecdf92634fb0ee4, independent Astra inspected the complete fourteen-file task range and returned P0=0/P1=0/P2=3:

- **N06-S1 / P2:** ChartToolbar.tsx:202 autofocuses the mobile Search symbols input, which updates only demo symbolFilter while KB renders a separate manual form. Typing MU and Enter in that prominent input does nothing. Remove/replace it in KB mode or wire it to actual submission; verify mobile keyboard focus/Enter through the visible ticker control.
- **N06-S2 / P2:** playwright.kb.config.ts:46 sets VITE_POSTHOG_KEY but lib/posthog.ts:4 consumes VITE_POSTHOG_API_KEY. The synthetic configured-key browser isolation assertion is therefore ineffective. Use the consumed key and rerun affected isolation evidence.
- **N06-S3 / P2:** e2e/market-lookup.spec.ts:205,335 enables only OHLCV Tooltip and reads DOM text in both timezone cases. Delta Tooltip and actual canvas axis/crosshair boundary-date rendering remain unproven. Extend actual browser rendering evidence around March 6/9 in both zones; prior unit formatter configuration and the existing OHLCV screenshots do not cover these other surfaces.

The saved isolation JSON applies to its exporting mobile scenario only. Other cases have their own assertions and expected-error exemptions. Root assigned these acceptance gaps to the existing Sol owner; quality review follows complete spec remediation/recheck. Final f8d4c467 TypeScript comparison separately confirmed the same 151 diagnostics/48 signatures as the pre-native baseline, with zero introduced/resolved occurrences or signatures.

## Spec remediation disposition

Sol committed a957cd00e097d8468d1f06f0b5ba3bd5862e91e2 in four authorized paths. N06-S1 now removes the inert demo search only in KB mobile mode, labels the popup and focuses the real ticker input; unit and actual 390px Enter submission regressions pass. N06-S2 configures the consumed VITE_POSTHOG_API_KEY with a synthetic value; the 31-second browser isolation case passes. N06-S3 instruments real canvas fillText before application load, observes rendered time-axis/crosshair boundary dates and drags real Delta Tooltip endpoints in both timezone contexts. Root viewed the updated popup with ticker focus and the actual New York Delta Tooltip showing March 6/9 with its rendered price/percentage difference.

Required unit checks pass 61 across six files; the complete six-case real HTTP suite passes in 1.3 minutes. Default and KB builds pass with 1,979 modules and one index.html entry; fixture ports are closed. The worker's typecheck remains 151 with no diagnostics in its four changed files; an exact normalized final comparison is pending because that run did not retain its raw log. Independent spec recheck precedes whole-task quality review.

### Residual spec finding before correction

At a957cd00, N06-S1/S2 are resolved. N06-S3 retains one P2 evidence flaw: the timezone case enables both tooltip plugins before collecting its supposed native crosshair text. Those plugins explicitly hide native crosshair labels; Delta Tooltip can also draw a one-point date during ordinary mouse movement. Captured canvas dates therefore do not distinguish native crosshair from plugin output. The updated screenshots do prove OHLCV and dragged Delta Tooltip dates/percentages. Add a first stage with neither plugin active that observes the actual native axis/crosshair labels, then enable the plugins for the existing checks. No production defect is alleged and only the E2E evidence needs correction.

The E2E-only correction a707c186cbe6cdcf5e6612fe9c4a9e2186b24f4d separates the surfaces and clears captures between stages: native axis dates with plugins confirmed off; native crosshair March 6/9 dates with plugins still off; OHLCV dates after enabling plugins; and actual Delta Tooltip drag dates/percentage. The targeted timezone test passes (39.4 seconds) and the complete six-case suite passes (1.3 minutes). Production source/config are unchanged, so accepted unit/build results are reused. The final source TypeScript comparison at a957cd00 confirms 151 occurrences/48 signatures identical to baseline86d23ea, with zero introduced/resolved occurrences or signatures. Spec spot recheck and whole-task quality are pending.

Final spec and independent whole-task quality both PASS at a707c186cbe6cdcf5e6612fe9c4a9e2186b24f4d with P0=0/P1=0/P2=0. The complete final task range contains fifteen affected/deleted files. All original findings are closed; no actionable regression or security finding remains. Task01-06 is accepted for bounded native live verification and final delivery documentation.
