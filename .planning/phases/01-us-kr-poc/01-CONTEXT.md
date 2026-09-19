# Phase 1 Context: US/KR Manual Market Lookup

<domain>
The user wants a small real connection POC, using OpenCharts with the existing KB journal backend, for both US and domestic stocks. They explicitly changed the proposal from fixed examples to a user-editable ticker. They approved GSD initialization, personal fork, separate frontend/backend PRs and the P0/P1 review loop.
</domain>

<decisions>
## Implementation Decisions

- **D-01**: Users select US or KR, type a ticker, choose a supported US provider routing market when needed, and explicitly press 조회. Keep leading zeros and preserve the submitted identity throughout the request/result lifecycle.
- **D-02**: The POC returns a quote and a bounded daily OHLCV series for arbitrary supported symbols, without needing a pre-existing journal trade subject. It uses one selected account's single active KB connection and retained token; no fallback to another account.
- **D-03**: Only fixed KB quote/candle read operations are callable. No generic TR/path forwarding, broker orders, ledger writes, new credential UI, background polling or WebSocket.
- **D-04**: Source, currency, acquired-at and delayed/unknown status are visible. Missing provider times, bid/ask and volume remain missing. The actual API response, not a public example, determines delay. Unsupported/ambiguous venue mapping is explicit; DRAM must not be silently relabelled Nasdaq.
- **D-05**: A dedicated connected page/mode can keep this small and isolate demo bootstrap/feed/paper trading. The existing demo remains available. Reuse installed React, CSS and lightweight-charts; no new dependency or full terminal migration is needed.
- **D-06**: Backends are reached through a fixed loopback same-origin read proxy; validate requested path/method and account/symbol inputs. Secrets/raw account data/provider payloads never appear in frontend responses or source.
- **D-07**: Use GSD plan/check, executing-plans subagents and TDD. Astra plans and independently reviews; Sol implements/fixes. Each task passes spec then quality review before dependent work. PR findings are published before remediation; final two PR HEADs require P0=0/P1=0. P2 is reported, not made an extra gate.
- **D-08**: Original dirty roots and processes remain untouched. OpenCharts milestone base is milestone/kb-market-data-poc; backend PR base is dev. Stop delivery with reviewed open PRs; no merge is requested.

### Agent's Discretion

- Exact connected-page route, compact layout, normalized DTO names, error codes and file boundaries.
- Test ownership and task decomposition, while respecting the tracer-first plan and per-task review gates.
- Use public provider schema plus sanitized deterministic fixtures before a bounded live check; report credentials/entitlement/market-hours limitations rather than inventing live success.
</decisions>

<specifics>
Use the approved HTML research as context. US public GSA10020 quote includes a delay field, GSC10060 existing daily body uses chart class 3, and domestic IVU10070/IVS11560 need exact official field semantics before their operational values are fixed. Public sample ovtm_mkt_clsf=1 is NOT proof of the regular-session parameter. Use the existing backend transport/lease; preserve its auth failure quarantine/manual-sync latch.
</specifics>

<deferred>
Global catalog/autocomplete, intraday interval UI, streaming, periodic refresh, automatic portfolio import and all order functions.
</deferred>
