# Native startup task review

## Original spec findings — before remediation

Independent Astra reviewed 82a18b2..51f95d895c58b38e8a89e8a3169b37d74c0c898f, all eleven 01-04 files. Verdict: P0=0/P1=0/P2=2. Native data/date/volume/drawing persistence remain 01-05 scope.

- **N04-S1 / P2:** `src/services/store.tsx:63-84,131-165` leaves exported authentication actions outside the KB boundary. An in-memory KB-mode probe with fake storage/fetch showed logout deleting all five persisted demo keys and googleLogin making one direct POST and hydrating a user. No current native button exposes them, but they violate non-destructive storage and direct-call isolation. Guard googleLogin, logout and restoreSession before fetch/state/storage effects; regress direct calls with unchanged demo storage and zero fetch.
- **N04-S2 / P2:** `src/services/queries.ts:255` leaves the economic-calendar hook enabled for currencies-bearing symbols. Actual ChartPanel → useNewsOverlay invokes it; the blank startup symbol and mocked chart test miss the path. Add the KB mode guard and focused currency/timer/focus evidence. The shared facade prevents a backend escape, so this is not a demonstrated live-data write or network exposure.

The remaining startup/API/ws/telemetry/native unavailable-panel boundaries align with the plan. Same Sol owner handles the corrections, then independent spec recheck precedes quality review. No native quote/chart completion is claimed here.

## Dispositions

Both findings were corrected at 02e227a8a6e7c24ef77ddf0324def9666d914f78. N04-S1's direct Google login/restore actions now reject before side effects; logout returns before mutating API/state/storage. A regression preserves all five seeded demo keys and observes zero fetch/user hydration. N04-S2's actual useNewsOverlay('USDF') reproduced an economic-calendar call before the guard and observes zero calls after 30 simulated minutes and focus events.

The two focused suites passed 11 tests, production build passed, and full TypeScript still reports the unchanged 151-diagnostic baseline. No server/provider/backend action occurred. Independent correction review and subsequent whole-task quality review are pending.

Independent spec correction review and separate whole-task quality review both passed P0=0/P1=0/P2=0 at 02e227a8a6e7c24ef77ddf0324def9666d914f78. The quality reviewer inspected all eleven original changed files and relevant native/API/ws/store callers, retaining focused test/build/type evidence. 01-05 is released; this acceptance does not claim native quote/chart completion yet.
