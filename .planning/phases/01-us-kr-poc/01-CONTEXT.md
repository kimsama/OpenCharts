# Phase 1 Context: US/KR Manual Market Lookup

<domain>
The user wants a small real connection POC, using OpenCharts with the existing KB journal backend, for both US and domestic stocks. They explicitly changed the proposal from fixed examples to a user-editable ticker. They approved GSD initialization, personal fork, separate frontend/backend PRs and the P0/P1 review loop.
The latest correction makes the UI ownership explicit: retain the actual original App → TradingPage → ChartToolbar/symbol selector → ChartPanel and layout. The assistant's separate lookup-page interpretation was incorrect. This correction supersedes the old D-05 and standalone entry/UI choices without reopening the accepted backend contract.
</domain>

<decisions>
## Implementation Decisions

- **D-01:** Extend the existing native ChartToolbar symbol controls so users choose a safe account, US/KR and NAS/NYS/AMX or KOSPI/KOSDAQ query routing, type an arbitrary supported ticker and explicitly press 조회/Enter. The current selector is list-only and has no account selector; add these controls within that native surface. Keep leading zeros and the full submitted account/market/query-market/symbol identity. Query routing is not verified listing exchange.
- **D-02:** The POC returns a quote and a bounded daily OHLCV series for arbitrary supported symbols, without needing a pre-existing journal trade subject. It uses one selected account's single active KB connection and retained token; no fallback to another account.
- **D-03:** Only fixed KB quote/candle read operations are callable. In KB mode block all existing broker/paper order and account-trading mutations at the shared service boundary as well as the UI; disable automatic tick/candle/history/stale/focus polling and WebSocket/demo feed. No generic TR/path forwarding, ledger writes or new credential UI. Unprovided portfolio/depth remains unavailable.
- **D-04:** Source, currency, acquired-at and delayed/unknown status are visible. Missing provider times, bid/ask and volume remain missing. The actual API response, not a public example, determines delay. Unsupported/ambiguous venue mapping is explicit; DRAM must not be silently relabelled Nasdaq.
- **D-05:** Preserve the original single index → App → TradingPage → ChartToolbar → ChartPanel frontend, visual layout, indicators and drawings. Select demo or KB once at startup using a fixed validated mode; the KB native UI must never initialize demo data, paper trading or telemetry. Existing demo remains operational in demo mode. Reuse the reviewed marketSnapshot client, narrow proxy and fixtures. Remove kb.html, src/kb-main.tsx, MarketLookupPage and MarketSnapshotChart from the final product and restore one build entry. No replacement lookup UI or new runtime dependency.
- **D-06:** Backends are reached through a fixed loopback same-origin read proxy; validate requested path/method and account/symbol inputs. Secrets/raw account data/provider payloads never appear in frontend responses or source.
- **D-07:** Use GSD plan/check, executing-plans subagents and TDD. Astra plans and independently reviews; Sol implements/fixes. Each task passes spec then quality review before dependent work. PR findings are published before remediation; final two PR HEADs require P0=0/P1=0. P2 is reported, not made an extra gate.
- **D-08:** Original dirty roots and processes remain untouched. OpenCharts milestone base is milestone/kb-market-data-poc; backend PR base is dev. Stop delivery with reviewed open PRs; no merge is requested.

### Agent's Discretion

- Small additions inside existing native controls and panels, normalized DTO names, error codes and file boundaries; replacing the native layout or introducing a separate connected page is not discretionary.
- Preserve backend trading-day strings; map them at the native numeric-time boundary with a tested calendar-date round trip. Namespace KB drawing/result state by the complete submitted identity rather than leaking across account/query markets.
- Test ownership and task decomposition, while respecting the tracer-first plan and per-task review gates.
- Use public provider schema plus sanitized deterministic fixtures before a bounded live check; report credentials/entitlement/market-hours limitations rather than inventing live success.
</decisions>

<specifics>
Use the approved HTML research as context and the newer focused `OFFICIAL-CONTRACT.md` for exact provider fields. Official metadata confirms domestic regular quote ovtm_mkt_clsf=0 and daily market codes KOSPI=0/KOSDAQ=1; the example value 1 for quote is not defined. GSC10060 existing daily body uses chart class 3. Use the existing backend transport/lease; preserve its auth failure quarantine/manual-sync latch.
01-01 is complete and its later accepted KR forward-date window/descending normalization remain authoritative; do not revert to earlier candidate semantics. Both markets have successful normal-browser observations supplied by the orchestrator. Those are not yet native-UI validation. Historical 503 cause remains unconfirmed; diagnostic code or subsequent success must not be presented as proof of its cause. Public artifacts describe configuration names only and keep private connection/account coordinates local.
</specifics>

<deferred>
Global catalog/autocomplete, intraday interval UI, streaming, periodic refresh, automatic portfolio import and all order functions.
</deferred>
