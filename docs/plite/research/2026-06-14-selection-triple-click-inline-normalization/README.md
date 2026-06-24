# Selection Triple-Click Inline Normalization

Date: 2026-06-14
Owner: slate-auto / slate-research
Status: promoted-kept

## Verdict

Triple-click and inline/link selection proof should treat browser-native
`Selection.toString()` whitespace as a serialization detail. The durable
invariant is stricter and more useful: model selection endpoints select the
intended block, native selected text normalizes to the block text, no double
highlight is visible, and screenshot proof exists.

This shard promoted a Plite-native visual smoke repair: the inline triple-click
paragraph visual row now runs on Firefox instead of skipping it for native
selection text differences.

## Best Leads

| Lead | Source | Plite status | Decision |
|------|--------|-----------------|----------|
| Triple-click selection can hang or over-select into the next block and needs editor-level correction | Lexical `LexicalEvents.ts`; classic Plite `Editor.unhangRange` docs and changelog | Covered by Plite `inlines`, `richtext`, and `select` triple-click rows | promoted-covered |
| Firefox may map DOM ranges to element points, so imported native selections need normalization | Lexical `LexicalSelection.ts` and normalization tests | Covered by strict Plite model endpoint checks plus normalized native text in inline-boundary rows | promoted-covered |
| Inline/link transforms should preserve and normalize selection around element boundaries | Lexical link transform selection normalization | Covered by Plite inline route rows and visual-native smoke | promoted-covered |

## Local Promotion

- Removed the stale Firefox skip from
  `.tmp/plite/playwright/integration/examples/visual-native-selection-smoke.test.ts`
  for `inline triple-click paragraph selection matches native text`.
- Added local normalization for inline-boundary native selected text.
- Kept strict model selection endpoints and no-double-highlight assertions.
- Inspected the Firefox screenshot artifact; it showed one paragraph highlight
  and no duplicate highlight.

## Proof

```bash
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts --project=firefox --grep "inline triple-click paragraph selection matches native text"
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts --project=chromium --project=firefox --project=webkit --grep "inline triple-click paragraph selection matches native text"
```

Result: Firefox focused proof passed 1/1; desktop focused proof passed 3/3.

## Raw Artifacts

- `docs/research/raw/2026-06-14-selection-triple-click-inline-normalization/source-ledger.tsv`

## Workflow Notes

- Run external repo scans from `/Users/zbeyens/git/plate-2` or use absolute
  sibling repo paths; `.tmp/plite` makes `../lexical` point at the wrong
  directory.
- Do not dump broad `rg` results from docs/research or external repos into the
  chat. Read exact source slices and write a compact source ledger.
