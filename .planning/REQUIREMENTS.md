# Requirements: OpenCharts KB Market Data POC

Defined: 2026-09-19
Core value: User-entered US/Korean instrument data with truthful source and freshness.

## v1 Requirements

### Query experience

- [ ] **QUERY-01**: User selects US or KR, enters a ticker and explicitly submits a lookup; US case normalization and six-digit Korean leading zeros are preserved.
- [ ] **QUERY-02**: User can inspect the submitted instrument's quote and daily candles without previously importing trades for that instrument.
- [ ] **QUERY-03**: UI displays requested market/symbol, currency, source, provider time when available, acquisition time and delayed/unknown status without claiming unverified real-time entitlement.
- [ ] **QUERY-04**: Invalid/unsupported ticker, missing configuration, provider rejection/no data, timeout and backend offline have clear bounded errors. A late response from an older request never replaces a newer result or relabels old bars.

### Backend boundary

- [ ] **DATA-01**: KB backend supports bounded, account-scoped arbitrary-symbol US quote/daily candle reads using retained credentials and fixed official read operations.
- [ ] **DATA-02**: KB backend supports the equivalent Korean quote/daily candle read with KRW, explicit market semantics and validated numeric/date fields.
- [ ] **DATA-03**: Quote/candle missing fields remain null/absent; invalid or mismatched symbol/market responses fail closed. Exchange listing and provider routing codes must not be conflated.
- [ ] **SAFE-01**: Browser receives no app secret/token/raw account/provider payload, proxy accepts only the intended local read routes, and broker operations remain read-only.
- [ ] **SAFE-02**: Connected POC is isolated from the demo feed and paper-order actions; existing demo behavior remains accessible separately.

### Delivery

- [ ] **VERIFY-01**: Focused backend and frontend tests exercise both markets, input boundaries, failures, delay labels and request ordering; production frontend build succeeds.
- [ ] **VERIFY-02**: Local browser check proves input -> backend -> normalized response -> chart for both markets where credentials/entitlements allow. Report any live prerequisite failures explicitly; no fake-live claim.
- [ ] **SHIP-01**: OpenCharts fork PR and KB backend PR contain changes, validation and live limitations; independent fresh HEAD review converges to P0=0/P1=0 and required checks are observed.

## v2 Requirements

- Streaming, periodic refresh, symbol search catalog, broader intervals and richer quote subscription behavior require later scope decisions.

## Out of Scope

| Feature | Reason |
|---|---|
| Broker orders or automatic trading | Quote/chart POC only; preserve journal analysis boundary |
| Canonical execution/ledger writes | Market data is a replaceable observation |
| New provider, new credential UI | Reuse existing KB backend configuration |
| Full market-data platform or new dependencies | Keep the connection experiment small |

## Traceability

Pending roadmap creation; map every requirement to the POC phase without dropping either market.
