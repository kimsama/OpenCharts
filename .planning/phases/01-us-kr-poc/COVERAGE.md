# API Coverage — KB manual market snapshot

Full capability consideration; exclusions below are the user's approved read-only quote/daily POC boundary (D-02/D-03/D-05 and PROJECT Out of Scope). This is not an assertion of full KB broker integration or live entitlement. Exact broker operation inventory in scope is OFFICIAL-CONTRACT.md.

| capability | decision | reason |
|---|---|---|
| US quote GSA10020 | INTEGRATE | One fixed arbitrary-symbol quote read, observed delay only; market-specific evidence before activation |
| US daily GSC10060 | INTEGRATE | Reuse existing fixed raw-price daily request and parser with 250-row cap |
| KR regular quote IVU10070 | INTEGRATE | Fixed regular-session mode 0; request identity preserved because official quote schema lacks echo |
| KR daily IVS11560 | INTEGRATE | Explicit KOSPI/KOSDAQ routing and date-based bounded candidate; verified semantics required before activation |
| Retained KB authentication/credential binding | INTEGRATE | Reuse existing same-account coordinator lease, failure quarantine and manual-sync latch; no new auth flow |
| Safe local account listing/selection | INTEGRATE | Existing GET accounts alias/opaque-ID projection; never list broker account identifiers |
| Local account-scoped normalized snapshot | INTEGRATE | New read-only route through an exact loopback proxy allowlist |
| Order placement/amendment/cancellation/execution | OPT-OUT | User explicitly excludes every broker order operation |
| Execution history/fills/transaction ingestion | OPT-OUT | Existing separate evidence/activation gates stay unchanged; quote success cannot approve ingestion |
| Holdings/balances/buying power/account financial information | OPT-OUT | User asks for public-instrument quotes/charts, not portfolio/broker account queries |
| Account creation/editing/credential registration UI | OPT-OUT | User explicitly chooses existing backend-owned binding and safe selector |
| Independent token issue/revoke/credential fallback | OPT-OUT | Existing token owner handles its lifecycle; this POC adds no parallel auth implementation or account fallback |
| Intraday/tick/weekly/monthly/adjusted chart modes | OPT-OUT | Explicit bounded daily raw-price slice only; no interval platform |
| WebSocket/streaming/realtime replay/subscriptions | OPT-OUT | User explicitly excludes streaming and background work |
| Scheduled polling/focus refresh/automatic retry/pagination | OPT-OUT | Manual bounded single submission only; existing finite transport timeout remains |
| Instrument catalog/search/autocomplete/symbol enumeration | OPT-OUT | User explicitly requires editable ticker plus chosen query market, not global search |
| Foreign venues beyond NAS/NYS/AMX or domestic KOSPI/KOSDAQ | OPT-OUT | No verified provider routing contract; unsupported venue must be explicit rather than invented |
| News/fundamentals/rankings/indices/derivatives/other unrelated market operations | OPT-OUT | Outside the approved public-equity quote/daily connection experiment |
| Generic TR/path/URL passthrough | OPT-OUT | Prohibited trust boundary; only fixed typed reads are allowed |
| Canonical ledger writes/import commit/AI analysis | OPT-OUT | User-approved POC is read-only observation, not journal or assisted trading workflow |

No new external service or package is selected. New npm/pip/cargo installation is absent, so a package-install legitimacy checkpoint is not applicable.
