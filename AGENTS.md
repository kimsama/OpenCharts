<!-- GSD:project-start source:PROJECT.md -->

## Project

**OpenCharts KB Market Data POC**

A local, read-only proof of connection between OpenCharts and the existing KB US Stock Trading Journal backend. The user selects the US or Korean market, types a ticker, and clicks 조회 to inspect an actual provider quote and daily price chart. This extends the existing OpenCharts checkout; it does not replace the journal UI.

**Core Value:** Show the requested instrument's provider data with truthful source, time and delay labels, without routing orders or exposing broker credentials.

### Constraints

- Keep credentials, raw account numbers and provider payloads on the backend. Only normalized market data crosses the frontend API.
- Preserve currency, Korean leading zeros, market identity, exchange time/date and nullable missing fields. Do not relabel DRAM's Cboe listing as Nasdaq; verify provider routing separately.
- Query on explicit submission only. Bound provider requests, retries and returned bars.
- Preserve both original dirty worktrees and existing processes. Implement in isolated worktrees.
- Main scope is a small POC; use existing libraries/components and avoid new general-purpose broker abstractions.
- All advisors/planners/independent reviewers use gpt-6-astra; implementers and fixers use gpt-5.6-sol. No substitutions.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->

## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `$gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `$gsd-debug` for investigation and bug fixing
- `$executing-plans` with subagent-driven-development for this approved phase (explicit user override; do not substitute `$gsd-execute-phase`)

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.

The user approved GSD initialization from the existing research and the complete implementation -> separate PRs -> P0/P1 review loop. Do not repeat generic mode, execution, or PR-choice questions. Use gpt-6-astra for planning and independent review, gpt-5.6-sol for implementation and fixes. Read `.planning/PROJECT.md` for current branch ownership and scope.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `$gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
