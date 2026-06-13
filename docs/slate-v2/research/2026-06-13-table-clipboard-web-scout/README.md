# Table Clipboard Web Scout

Date: 2026-06-13

## Question

Does recent external table-copy/paste discussion change the Slate v2 table
fragment owner or proof plan?

## Scope

- Targeted web/GitHub discovery around table clipboard, cell selection, strict
  table schema, and custom view-layer paste bridges.
- No runtime patch from web snippets.
- Promote only owner/proof-shape decisions that map to current Slate v2.

## Verdict

Keep the existing Slate v2 table-fragment decision.

The strongest sources agree on the same shape:

- table clipboard is a dedicated table owner, not generic nested block
  insertion;
- copy/paste correctness depends on cell selection, rectangular slices,
  `rowspan`/`colspan`, schema parsing, and well-formed table invariants;
- strict/custom table schemas make copy/paste harder, not easier;
- custom rendering layers should still reuse schema/model serialization where
  possible instead of inventing a separate clipboard content model.

## Slate Decision

Do not unskip the anonymous `insertFragment/of-tables` fixtures. Replace them
with typed table-area contracts only after Slate has an internal table-area or
cell-selection owner.

No current runtime patch in this packet.

## Local Proof Anchor

```bash
cd .tmp/slate-v2
SLATE_FIXTURE_FILTER='transforms/insertFragment/of-tables' SLATE_FIXTURE_DEBUG=1 bun test ./packages/slate/test/index.spec.ts
```

Result: `3 pass`, `6 skip`, `0 fail`.

## Source Links

- https://github.com/ProseMirror/prosemirror-tables
- https://discuss.prosemirror.net/t/broken-table-pasting/5117
- https://discuss.prosemirror.net/t/prosemirror-table-with-strict-schema-and-copy-paste/8473
- https://discuss.prosemirror.net/t/building-a-canvas-based-editor-on-top-of-prosemirror-s-state-and-plugin-system/8982

