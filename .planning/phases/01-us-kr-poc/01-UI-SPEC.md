---
phase: 01-us-kr-poc
status: approved-scope
---
# UI Contract: Manual KB Lookup

Use the existing OpenCharts dark palette and system font. Build a compact read-only connected page/mode, without importing demo/paper-order initialization. Reuse installed lightweight-charts for the daily candle/volume display and native accessible form controls.

## Layout and Interaction

- Entry link between the unchanged demo and the KB lookup page.
- Top form: account alias selector backed by opaque IDs, market selector US/KR, US provider routing market selector if needed, labelled ticker text input, 조회 submit button. Free text editing is required; MU/005930 may be examples but never the only accepted values.
- Submit via Enter or button. No request per keystroke, automatic polling or account credential inputs. Disable/label a pending duplicate submission or cancel/ignore older requests correctly.
- Results: submitted market/symbol, currency, latest price and available bid/ask; source, acquisition timestamp, provider timestamp if available and a plain-language delay/unknown label. Display the actual response identity, not the currently edited unsubmitted input.
- Chart: bounded daily candles; omit missing volume rather than plotting zero; resize and dispose cleanly. Errors/empty state carry words, not color alone.
- Mobile: form wraps to one column, chart fits viewport, no horizontal document scrolling. All fields have explicit labels, keyboard focus and status announcement.

## UI Considerations

| ID | Consideration | Acceptance | Status | Verification |
|---|---|---|---|---|
| UI-01 | Editable ticker and market | Keyboard users can submit US/KR codes and identify labels/errors | resolved | explicit |
| UI-02 | Request/result identity | Editing without submitting does not relabel an old result; late requests cannot overwrite latest | resolved | explicit |
| UI-03 | Data provenance | Source/time/delay or unknown is visible with no fabricated realtime claim | resolved | explicit |
| UI-04 | Small viewport | Form and chart work at 390px; no page overflow | resolved | explicit |
| UI-05 | Provider failure | Error is announced; no crypto/demo fallback appears | resolved | explicit |
