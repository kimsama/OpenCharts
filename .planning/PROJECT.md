# OpenCharts KB Market Data POC

## What This Is

A local, read-only proof of connection between OpenCharts and the existing KB US Stock Trading Journal backend. The user selects the US or Korean market, types a ticker, and clicks 조회 to inspect an actual provider quote and daily price chart. This extends the existing OpenCharts checkout; it does not replace the journal UI.

## Core Value

Show the requested instrument's provider data with truthful source, time and delay labels, without routing orders or exposing broker credentials.

## Requirements

### Validated

- Existing OpenCharts renders bundled crypto candles with lightweight-charts and an in-browser demo feed.
- Existing KB backend owns credential bindings, token reuse, bounded US daily/minute chart reads, account isolation and local browser protections.

### Active

- User-entered US and Korean tickers with explicit market selection, manual query and daily candles/current quote.
- Reuse KB's server-owned authentication and read-only transport; arbitrary-symbol lookup must not require an existing trade subject.
- Clear errors and missing/delayed/unknown data states; no fabricated quotes or OHLCV.
- Focused tests, actual local browser integration, independent review, and separate PRs for the two repositories until P0=0 and P1=0.

### Out of Scope

- Broker orders, live account trading, automatic canonical import/commit, new AI features.
- WebSocket streams, background polling, global instrument search/autocomplete, multi-symbol subscriptions.
- A production market-data service, commercial redistribution, changing the existing journal's data model.

## Context

The user approved initialization from `docs/research/2026-09-19-kb-market-data-integration-research.html`, a personal OpenCharts fork and the implementation/PR/review workflow on 2026-09-19. They explicitly require editable tickers rather than hardcoded MU and 005930. Both US and domestic Korean markets remain in scope. Prior research found public KB quote/chart candidates, US sample delay labels and existing US-only subject-scoped backend APIs. Official public samples are not proof of live entitlement.

## Constraints

- Keep credentials, raw account numbers and provider payloads on the backend. Only normalized market data crosses the frontend API.
- Preserve currency, Korean leading zeros, market identity, exchange time/date and nullable missing fields. Do not relabel DRAM's Cboe listing as Nasdaq; verify provider routing separately.
- Query on explicit submission only. Bound provider requests, retries and returned bars.
- Preserve both original dirty worktrees and existing processes. Implement in isolated worktrees.
- Main scope is a small POC; use existing libraries/components and avoid new general-purpose broker abstractions.
- All advisors/planners/independent reviewers use gpt-6-astra; implementers and fixers use gpt-5.6-sol. No substitutions.

## Delivery Context

- OpenCharts fork: `kimsama/OpenCharts`; milestone and PR base: `milestone/kb-market-data-poc`; phase implementation branch created from that milestone after planning.
- KB backend: `kimsama/kb-us-stock-trading-journal`; integration/PR base: `dev`; phase branch: `feat/opencharts-market-data-poc`.
- Execute GSD plans using `executing-plans` with `subagent-driven-development` and TDD. Do not substitute `gsd-execute-phase`.
- Each task passes implementation, independent spec review, then independent quality review. PR findings are posted before fixes; fix dispositions follow; final reviewed HEAD must have P0=0/P1=0. Report P2 without inventing a zero-P2 gate.
- Current requested endpoint is open, reviewed PRs. Do not merge or remove working branches without a later explicit integration request.

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Manual refresh and editable ticker | User requested a quick connection test with freely entered symbols | Approved |
| US and Korean markets in one POC | User explicitly added domestic equities | Approved |
| Existing HTML as research input | User approved reuse rather than repeated broad research | Approved |
| Two PRs with isolated worktrees | Separate code ownership and remote repositories | Approved |
| ASTRA planning/review, SOL implementation | Explicit user model choice | Approved |

## Evolution

Update delivered requirement status only with current test/runtime evidence. Preserve unverified provider behavior as unverified; do not call simulated tests a live broker success.

---
Last updated: 2026-09-19 after user-approved GSD initialization.
