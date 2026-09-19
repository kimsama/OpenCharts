# Dated KB Read-Only Market POC Contract Evidence

Date: 2026-09-19. Evidence: publicly downloadable KB API schema and example JSON. This document is technical planning evidence, not a live success report or proof of entitlement. Implement only the small quote/daily read allowlist below; do not alter execution-history provider activation gates.

## Fixed operations

| Operation | Fixed method/path | Request semantics | Output validation |
|---|---|---|---|
| US quote GSA10020 | POST /api/v1/gsa10020 | krx_cd NAS/NYS/AMX, is_cd bounded ticker <=16 chars, rcrd_c=1 | top-level is_cd/krx_cd echo; out2 max 1 row; now_prc_p4, b_askprc_p4, s_askprc_p4 |
| US daily GSC10060 | Existing fixed adapter path/body | Reuse existing sealed daily request chrt_clsf=3 and existing raw-price setting; 250 row cap | Existing strict daily parser; preserve validated response delay separately where available |
| KR quote IVU10070 | POST /api/v1/ivu10070 | is_cd exact 6-digit string, ovtm_mkt_clsf=0 (regular only) | now_prc, b1_aprc, s1_aprc; no symbol echo/time/delay in official output schema |
| KR daily IVS11560 | POST /api/v1/ivs11560 | is_cd, mkt_clsf 0=KOSPI/1=KOSDAQ, info_ccd=1 raw price, chrt_clsf=D, minute_tck_indx=일, bounded inq_cnt <=500, inq_clsf explicit below | out2 dt, opn_prc_p2, hgh_prc_p2, lw_prc_p2, cls_prc_p2, vlm; check echoed request fields |

KR daily inq_clsf=1 is date-based (strt_dy=YYYYMMDD); 2 is record-count-based. Direct public-sample comparison on 2026-09-19 shows input strt_dy=20260601/inq_cnt=500 and output 15 rows from 20260601 through 20260622 with inq_cnt=15. This is evidence of a forward date window and a returned row count, not an echo of the requested cap. Use the documented date-based form with strt_dy set to the current Asia/Seoul calendar date minus 180 calendar days, inq_cnt=250, one request and no pagination. Validate dates inside that requested window and count equality with the returned rows (at most 250). Bounded live evidence must still confirm the intended recent series before activation.

The same public example sends minute_tck_indx=일 but returns minute_tck_indx=1. Validate daily chrt_clsf=D and the observed normalized daily index 1; do not require literal request/response equality for that field. Identity and semantic echoes is_cd/mkt_clsf/chrt_clsf/inq_clsf/info_ccd must still match. A requested cap of 250 must not reject a valid shorter history simply because returned inq_cnt is smaller.

## Normalization constraints

- Prices: finite nonnegative Decimal, with strictly positive candle OHLC; enforce low <= open/close <= high. Nullable missing quote bid/ask and volume; zero volume is valid only when actually reported. Empty/no-data responses are not success-shaped zero data.
- KR quote has no echo: attach the already validated request identity and require the KR daily identity/market echoes for the combined snapshot. Do not misuse indx_id (an index ID) as a ticker echo.
- GSA10020 delay text exactly `15분지연` -> delayed/15; all undocumented values -> unknown/null. KR delay -> unknown/null. Do not infer realtime from recent acquisition time or an unlisted string.
- GSA date/time names do not define timezone/offset. Provider-as-of stays null until supported by an authoritative contract. Acquisition time is UTC and may always be shown.
- US route code is a provider query market, not independent proof of actual listing venue. No Cboe-to-Nasdaq mapping is invented. Unsupported provider routes are errors; display query routing as such.
- The schemas expose raw rate fields requestLimit=200, refreshPeriod=5, waitingPeriod=3 without units. Do not reinterpret these as an SLA. Manual requests are serialized through existing coordinator ownership; bounded timeout/retry only.
- Schema prose says processCode=0000; public successful examples and current code use 0024. Retain the existing known success rule; verify new reads with bounded POC and record actual safe status codes without loosening acceptance to arbitrary business responses.

## Official sources

- https://openapi.kbsec.com/api/apis/public/b9ee1f51-9220-4551-91f2-0865c082e00b/tr-list — GSA10020
- https://openapi.kbsec.com/api/apis/public/585001e1-8b5c-467d-8134-7e1dbd97c958/tr-list — IVU10070
- https://openapi.kbsec.com/api/apis/public/6de8f4b4-9782-4df3-b94f-c85186de0b10/tr-list — IVS11560
- https://openapi.kbsec.com/api/kbs/guide/json/b2c — public samples

## Bounded live acceptance to perform

Under the user's approved connection-test scope, use the selected account's existing KB connection and fixed read allowlist only. One quote and one daily read for MU/NAS, then 005930/KOSPI; do not enumerate holdings/history or submit orders. A further KOSDAQ or user-entered DRAM routing check is conditional on a supported verified provider route. Do not print credentials, raw account data, provider payloads, local configuration or private connection coordinates. Record only requested public instrument, normalized counts, accepted status, currency, delay classification, UTC check time and sanitized outcome. Failures are explicitly recorded and investigated; no claim of complete live US/KR support from fixtures alone.
