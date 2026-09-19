# 01-01 Backend execution summary

Status: complete. Both markets are active and independently reviewed at backend HEAD e7f73c112b028f0ae6178a3358668cc2a375960b.

## Delivered interface

`GET /api/v1/accounts/{account_id}/market-data/snapshot` accepts exactly `market`, `exchange`, and `symbol`. The request uses the selected account's unique active live KB connection, existing credential binding, retained lease, and retirement path. It reads at most one quote and one daily series with no retry, pagination, order, history ingest, or ledger write.

The DTO carries account/market/query-market/symbol identity, USD or KRW, KB source, UTC acquisition time, nullable provider time, explicit delay, nullable decimal-string quote fields, and up to 250 validated ascending date-only candles. The query market is a provider route, not independent evidence of listing venue. Invalid/mismatched responses fail closed with bounded error codes.

## Task 1 — US

- Final reviewed implementation: `a6d732538272225b0071c946e077d2565c7fbc79`.
- Fixed operations: GSA10020 and existing sealed GSC10060 daily read, NAS/NYS/AMX.
- Actual MU/NAS candidate: quote 3/3 values, 250 daily bars, USD, 15-minute delayed; both provider statuses 0024. Provider timestamp/timezone remain unknown. Normal shutdown left the durable marker absent.
- Independent Astra spec and quality review: P0=0, P1=0, P2=0. One original UUID canonicalization P2 was fixed with a failing-then-passing HTTP regression.
- Evidence: 252 focused adapter/coordinator checks before activation, affected 17 HTTP checks, and focused activation/canonicalization checks. Static checks passed. Exact details are in 01-01-US-REVIEW.md and the backend dated POC record.

## Task 2 — KR

- Candidate implementation: `b531c5636ed00119fee3517f632c47a9d564f54d`.
- Fixed operations: IVU10070 regular quote and IVS11560 raw daily prices, explicit KOSPI/KOSDAQ. Daily window starts 180 calendar days before the current Asia/Seoul date. Returned count must equal rows, normalized daily index is 1, and unique dates are sorted after validation.
- Worker verification: API 23 passed; adapter/coordinator 260 passed; Ruff, format, mypy, OpenAPI export/type generation and diff check passed.
- Independent Astra spec and quality reviews: P0=0, P1=0, P2=0 as a closed candidate. The spec reviewer ran 33 selected KR tests; quality probes verified cross-market token reuse, descending normalization and fail-closed shared-lease retirement after an identity mismatch.
- First actual candidate returned provider_invalid_response. Official descending rows reproduce a defect in the pre-live validator; current candidate corrects that defect, but the historical live cause cannot be proven because the first run retained no operation stage or body.
- A single corrected-code diagnostic candidate was authorized within the existing user POC scope. It keeps normal ownership, permits at most one quote and one daily read, and records only schema/status/count evidence. No retry, recovery, or activation is authorized by that probe.
- Corrected candidate at b531c563 succeeded at 2026-09-19T12:28:35.608097Z: IVU10070 and IVS11560 both returned 200/A/0024; quote 3/3 values; 124 KRW daily bars covering 2026-03-23 through 2026-09-18. Actual provider rows were descending and normalized ascending. Classification/count/identity/date/OHLC checks passed. Delay and provider time remain unknown. Final durable marker was absent. No retry or additional operation occurred.
- Independent Astra spec/evidence review accepted the corrected live result at d9690a5; the compiled gate was promoted to US+KR at e7f73c112b028f0ae6178a3358668cc2a375960b. Separate spec and quality spot reviews passed with P0=0/P1=0/P2=0. Live acceptance covers 005930/KOSPI; KOSDAQ live entitlement remains unverified.
- Final promoted-HEAD verification: `uv run --frozen pytest tests/api/test_market_snapshot.py -q` — 23 passed; `uv run --frozen pytest tests/broker/test_kb_adapter.py tests/broker_sync/test_coordinator.py -q` — 260 passed; `uv run --frozen --no-sync mypy src` — 0 issues in 176 source files. No further live call was needed.

## Ownership and continuation

Sol owns implementation/fixes; Astra independently reviews spec then quality. Both implementation reviews passed at b531c563, releasing the dependent frontend task; activation reviews subsequently passed at e7f73c1. The only planned later backend edit owned by the frontend worker is the isolated fixture server. Existing application processes and original dirty trees remain preserved.
