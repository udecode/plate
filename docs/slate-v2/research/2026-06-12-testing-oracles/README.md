# Slate v2 Testing Oracles

Date: 2026-06-12

## Question

Which external editor testing patterns should Slate v2 promote into durable
browser/native-selection/IME/paste oracles instead of relying on ad hoc
route-local Playwright code?

## Scope

- Inspect current Slate v2 `slate-browser` proof APIs.
- Compare against ProseMirror view tests and Tiptap Cypress helpers.
- Promote only source-inspected, Slate-native proof actions.
- Do not patch runtime from external snippets.

## Verdict

Slate v2 already has stronger reusable browser primitives than the external
samples read in this packet: selection snapshots, native selected text,
displayed projected selection, double-highlight detection, clipboard native
and synthetic fallbacks, IME transports, scenario traces, reduction candidates,
and warm-loop helpers.

The useful gap was higher-level contract naming. The promoted operation-family
rows are now kept as existing first-party coverage: `slate-browser` scenario
contracts name the row families, and the active automation plan records the
route/package proof bundle behind them.

## Promoted Packet

- `testing-oracle:huge-doc-repeated-vertical-selection:contract-row`
  - owner: `slate-browser`
  - action: kept existing first-party browser contract row
  - proof command: `cd .tmp/slate-v2/packages/slate-browser && bun test test/core/scenario.test.ts`
  - behavior proof already backing this row:
    `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "repeated Shift\\+ArrowDown"`
- `testing-oracle:ime-composition-edge-matrix:contract-row`
  - owner: `slate-browser`
  - action: kept existing first-party browser contract row
  - proof command:
    `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "IME composition|active mark|multiple formatted"`
  - WebKit cleanup proof command:
    `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/richtext.test.ts --project=webkit --grep "WebKit compositionend"`
- `testing-oracle:ime-composition-rapid-crossparagraph:contract-row`
  - owner: `slate-browser`
  - action: kept existing first-party browser contract row
  - proof command:
    `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "rapid consecutive IME|cross-paragraph rich text"`
  - helper repair: synthetic IME transport no longer mutates React-owned
    expanded DOM ranges or double-commits after semantic fallback
- `testing-oracle:ime-composition-decoration-refresh:contract-row`
  - owner: `slate-browser`
  - action: kept existing first-party browser contract row
  - proof command:
    `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/decorations-async.test.ts --project=chromium --grep "interrupting active IME"`

## Next Leads

- Remaining ProseMirror composition overlap rows are deferred to
  `docs/plans/2026-06-12-ime-overlap-policy-contract.md`. They are not a
  separate testing-oracle queue until the overlap-cancellation policy is
  accepted.
- ProseMirror selection tests map to existing Slate v2 geometry coverage:
  `slate-browser` selection browser tests cover RTL DOM selections and
  wrapped-line rectangles, while `slate-dom` bridge tests cover wrapped
  right-edge event ranges and RTL physical-to-logical edge mapping.
- ProseMirror DOM-change tests are useful for native-edit repair pressure:
  selection adjustment after DOM text mutation and ambiguous
  selection-deletion step extraction.

## Closure Proof

```bash
cd .tmp/slate-v2/packages/slate-browser
bun test test/core/scenario.test.ts
```

Result: 21 passed.

## Rejected Leads

- Tiptap Cypress paste helper is too weak to copy. It dispatches a synthetic
  `ClipboardEvent` with `DataTransfer`; Slate v2 already owns that pattern plus
  native clipboard access, event-payload helpers, paste fallbacks, trace checks,
  and model/native selection accounting.
- ProseMirror clipboard parsing tests are good semantic pressure but not the
  highest next oracle owner because Slate v2 already has clipboard helpers and
  the table-fragment packet owns the strongest clipboard-adjacent gap.
- Do not force package-level geometry tests into the current first-party
  `routes` contract registry. A future package-level oracle registry would be
  cleaner if this pattern repeats.

## Claim Width

This packet promotes first-party `slate-browser` contract rows for
huge-document vertical selection, formatted-boundary IME,
rapid/cross-paragraph IME, decoration-refresh IME, DOM-change target-range
repair, and external clipboard slice context. It defers IME overlap
cancellation to the policy plan. It does not claim full browser parity, raw
mobile proof, or completion of all ProseMirror-inspired IME/geometry rows.
