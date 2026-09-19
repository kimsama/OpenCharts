# Phase 1 Specification

Goal: One local manual lookup page for user-entered US/KR symbols showing a current quote and daily chart from the KB backend. Scope and acceptance are defined in REQUIREMENTS.md and CONTEXT.md. This is an additive POC; keep the original demo route intact.

## Edge Coverage

| ID | Requirement | Edge | Acceptance | Status | Verification |
|---|---|---|---|---|---|
| E-01 | QUERY-01 | Empty/malformed ticker; KR leading zero | Invalid submission is rejected before provider I/O; 005930 round-trips unchanged | resolved | explicit |
| E-02 | QUERY-04 | Older request finishes last | Only latest submitted identity/results remain visible | resolved | explicit |
| E-03 | DATA-03 | Unknown delay/missing volume/bid/ask | Missing values stay missing; unknown is visible and never claimed realtime | resolved | explicit |
| E-04 | SAFE-01 | Foreign/unknown account or no unique active connection | Reject before credential/token/provider access, no fallback to other account | resolved | explicit |
| E-05 | QUERY-04 | Backend offline/provider rejection/timeout/no data | Clear scoped error; no old bars under the new symbol or demo fallback | resolved | explicit |
| E-06 | DATA-03 | Response ticker/market differs; bad numbers/dates | Reject malformed/mismatched data and preserve sanitized failure | resolved | explicit |
| E-07 | SAFE-02 | Connected route mounts/unmounts or user changes market | Demo feed/order engine cannot run in the connected page; chart lifecycle disposed | resolved | explicit |

## Prohibitions

| ID | Requirement | Prohibition | Status | Verification |
|---|---|---|---|---|
| P-01 | SAFE-01 | No order TR, arbitrary provider path, credential leak, raw payload in public response | resolved | explicit |
| P-02 | SAFE-02 | No synthetic quote/volume or crypto replay fallback in connected mode | resolved | explicit |
| P-03 | DATA-03 | No relabelling an unverified Cboe instrument as Nasdaq | resolved | explicit |

## Completion

All 12 requirements must be mapped and reviewed. Unit/fixture checks, actual broker evidence and external CI are distinct. Missing live prerequisites must be named, not concealed. Two PRs must have fresh P0/P1-free review; preserve any remaining P2 and required-check status.
