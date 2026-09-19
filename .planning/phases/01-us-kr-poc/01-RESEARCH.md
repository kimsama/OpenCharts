# Phase 1 Research

Reuse `.planning/research/SUMMARY.md` and the approved HTML report. Focused preflight on current KB source identifies the minimum route/service/provider chain below; proposed names are not claims of existing symbols.

## Existing backend seams

- `src/kb_journal/api/router.py`: register a bounded account-scoped market snapshot route beside current APIs.
- `src/kb_journal/broker_sync/persistence.py:get_single_active_kb_connection_for_account`: same-account connection selection; do not use the chart's cross-account configured price-source fallback.
- `src/kb_journal/broker_sync/coordinator.py:_kb_lease`: retained token selection and revalidation inside the existing lock/session. Keep successful lease; use existing failure retirement/manual-sync behavior on applicable provider/auth errors.
- `src/kb_journal/broker_sync/adapters/kb/adapter.py`: retained-token read wrapper. `src/kb_journal/broker/adapters/kb/adapter.py`: fixed HTTPS requests, bounded response body and strict parsers.
- Existing US daily GSC10060 fixed body and parser can be reused. Add only typed request/read DTOs and fixed quote/KR daily methods required by this POC. No new generic broker capability framework.
- Avoid reusing symbol-only daily cache keys for KR data; a direct bounded manual snapshot avoids a migration and cross-market cache collision.

## Proposed API contract to finalize in PLAN

Account-scoped snapshot query takes `market=US|KR`, provider routing exchange and editable symbol. KR accepts an exact six-digit string; US uses a bounded normalized ticker. One successful response identifies requested market/provider routing/symbol/currency/timezone, source `kb`, current quote with nullable bid/ask/time, and bounded daily bars with nullable volume. Prices use decimal strings; observer timestamp is provider acquisition time. Delay is delayed/realtime/unknown from validated provider evidence, never a default assumption. Reject identity mismatches, invalid OHLC, duplicate dates and oversized results. Do not turn empty data into zero values.

## Public read candidates (not live evidence)

- GSA10020: US quote, rcrd_c=1, krx_cd and is_cd; response delay classification exists in public sample.
- GSC10060: preserve current sealed daily body (chrt_clsf=3, 250 rows); sample ZIP is not a replacement for this verified existing implementation.
- IVU10070: KR current price/bid1/ask1; verify regular-session value of ovtm_mkt_clsf against official metadata before live activation.
- IVS11560: KR chart, published daily example chrt_clsf=D, minute_tck_indx=일, info_ccd=1, mkt_clsf=0, inq_cnt=500; validate metadata and row/date fields.
- Cboe listing identity is separate from provider NAS/NYS/AMX query routing; unsupported or unverified mapping must not be silently guessed.

## Validation Architecture

- Backend focused tests should cover new fixed provider reads/parsers, coordinator isolation/lease behavior, route validation and sanitized failures. Reuse existing `tests/broker/test_kb_adapter.py` and `tests/broker_sync/test_coordinator.py`; add a focused API test file.
- Backend verify in the KB worktree: `uv run --frozen pytest` with only named changed test targets; relevant Ruff and mypy.
- Frontend verify in OpenCharts worktree: affected Vitest files and `npm run build`, then one desktop/mobile browser pass for editable tickers, both market fixtures, error handling and response ordering.
- Live check is bounded and separately labelled. Existing credentials may be used only inside the KB runtime, with no secret output. Do not claim official samples/mocks prove live readiness.
- Reviewer models and PR publication/revision rules come from the explicit user pipeline.
