# Requirements: OpenCharts KB Market Data POC

Defined: 2026-09-19
Core value: User-entered US/Korean instrument data with truthful source and freshness.

## v1 Requirements

### Query experience

- [x] **QUERY-01**: In the original OpenCharts symbol controls, the user selects an existing safe account, US/KR and provider query market, enters an arbitrary supported ticker and explicitly submits 조회; US case normalization and six-digit Korean leading zeros are preserved.
- [x] **QUERY-02**: The original TradingPage/ChartPanel displays the submitted instrument's quote and daily candles without prior trade import, retaining its native layout, price indicators and drawings.
- [x] **QUERY-03**: UI displays requested market/symbol, currency, source, provider time when available, acquisition time and delayed/unknown status without claiming unverified real-time entitlement.
- [x] **QUERY-04**: Invalid/unsupported ticker, missing configuration, provider rejection/no data, timeout and backend offline have clear bounded errors. A late response from an older request never replaces a newer result or relabels old bars.

### Backend boundary

- [x] **DATA-01**: KB backend supports bounded, account-scoped arbitrary-symbol US quote/daily candle reads using retained credentials and fixed official read operations.
- [x] **DATA-02**: KB backend supports the equivalent Korean quote/daily candle read with KRW, explicit market semantics and validated numeric/date fields.
- [x] **DATA-03**: Quote/candle missing fields remain null/absent; invalid or mismatched symbol/market responses fail closed. Exchange listing and provider routing codes must not be conflated. Native chart date encoding round-trips the original trading day, and absent volume stays absent in histogram, legend and volume-dependent indicators.
- [x] **SAFE-01**: Browser receives no app secret/token/raw account/provider payload, proxy accepts only the intended local read routes, and broker operations remain read-only.
- [x] **SAFE-02**: One original index/App/TradingPage uses a fixed startup demo or KB mode. KB mode blocks demo bootstrap/feed/telemetry and every trading mutation, polling/history/live refresh; no fabricated portfolio/depth appears. Demo mode keeps existing behavior. The standalone kb.html/page/chart product is removed.

### Delivery

- [x] **VERIFY-01**: Focused backend and frontend tests exercise both markets, input boundaries, failures, delay labels and request ordering; production frontend build succeeds.
- [x] **VERIFY-02**: A local browser proves the original OpenCharts controls -> backend -> normalized response -> original ChartPanel for both markets, including native indicators/drawings, desktop/mobile layout, read-only isolation and date/volume correctness. Keep existing accepted live evidence separate from new native-UI checks; report live limits and leave the historical 503 cause unclaimed.
- [x] **SHIP-01**: OpenCharts fork PR and KB backend PR contain changes, validation and live limitations; independent fresh HEAD review converges to P0=0/P1=0 and required checks are observed.

## v2 Requirements

- Streaming, periodic refresh, symbol search catalog, broader intervals and richer quote subscription behavior require later scope decisions.

## Out of Scope

| Feature | Reason |
|---|---|
| Broker orders or automatic trading | Quote/chart POC only; preserve journal analysis boundary |
| Canonical execution/ledger writes | Market data is a replaceable observation |
| New provider, new credential UI | Reuse existing KB backend configuration |
| Full market-data platform or new dependencies | Keep the connection experiment small |
| Separate connected HTML/page/chart product | Latest user correction requires the existing OpenCharts frontend |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| QUERY-01 | Phase 1 | Complete - 01-05/06 |
| QUERY-02 | Phase 1 | Complete - 01-05/06 |
| QUERY-03 | Phase 1 | Complete - 01-05/06 |
| QUERY-04 | Phase 1 | Complete - 01-05/06 |
| DATA-01 | Phase 1 | Complete — 01-01 |
| DATA-02 | Phase 1 | Complete — 01-01; KOSDAQ live entitlement unverified |
| DATA-03 | Phase 1 | Complete - 01-01/05/06 |
| SAFE-01 | Phase 1 | Complete - 01-01/04/06 |
| SAFE-02 | Phase 1 | Complete - 01-04/06 |
| VERIFY-01 | Phase 1 | Complete - 01-01/04/05/06/07 |
| VERIFY-02 | Phase 1 | Complete - 01-06/07 |
| SHIP-01 | Phase 1 | Complete - 01-07; two OPEN reviewed PRs and exact-head checks |

Coverage: 12/12 v1 requirements mapped exactly once; no orphaned or duplicated requirements.
