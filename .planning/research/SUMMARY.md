# Project Research Summary

Date: 2026-09-19. Source: `docs/research/2026-09-19-kb-market-data-integration-research.html` and the current conversation's code/official-document investigation. Existing research is reused with the user's explicit approval; no new stack/ecosystem survey is required.

## Key Findings

- OpenCharts `src/services/api.ts` hardwires demoApi, and `src/services/ws.ts` runs a local demo feed. Its HTTP market-data facade is not active.
- KB existing chart APIs are account/subject scoped and US only; V2 does support minute bars despite older daily-only prose. Existing token/transport ownership is reusable, but arbitrary-symbol quotes and domestic data need a bounded new read path.
- KB public sample ZIP from its official API portal contains US GSS10030/GSC10060 and domestic IVM10050/IVU10070/IVS11560 candidates. GSA10020 and GSC10060 samples say 15-minute delayed. Public samples are not live entitlement evidence.
- DRAM is Cboe BZX listed. KB route codes NAS/NYS/AMX do not establish DRAM's provider mapping. Do not silently assume Nasdaq or fabricate lookup success.
- Daily refresh freshness is 24 hours; current intraday acquisition freshness is 60 seconds. Neither proves exchange real-time latency.
- Browser API protects loopback Host and mutation exact Origin; there is no bearer requirement on existing local read endpoints. Prefer the existing same-origin boundary with a narrow local read proxy.

## Implications for Roadmap

One small user-facing phase should deliver editable tickers and explicit manual quote/daily chart lookup in both repositories. Lead with an end-to-end tracer, then expand equivalent provider behavior across both markets, and verify the actual connection plus failure states. Implementation must include explicit contracts and normalized public output, not generic provider passthrough.

## Sources

Use the HTML report's immutable code anchors and official public links. OpenCharts baseline: f681cc03da1f4430e024f4e1a914dc5bc358a559. KB baseline: 0f2ab7b537c2db81f8a8a304ab5d8a98b86ad4b0.

## Verification Limits

The report did not invoke real broker operations, inspect raw credentials, or prove US/KR live readiness. Preserve this distinction until bounded live checks are completed.
