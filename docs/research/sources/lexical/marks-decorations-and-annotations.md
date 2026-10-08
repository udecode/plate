# Lexical: marks decorations and annotations

## Clear formatting

- **Clear formatting.** `ClearFormatting.spec.mjs` expects clearing to:
  - remove bold, italic, underline and code marks from the selection only, so a selection from mid-paragraph to mid-paragraph leaves the unselected ends formatted;
  - reset left, center, right and justify alignment, and clear indent;
  - keep semantic blocks such as quotes;
  - keep the default styling of links, hashtags and mentions.

  Plate's spec has no clear-formatting row. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:512-518`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: not rerun.

## Mark formatting

- **TextFormatting e2e.** `TextFormatting.spec.mjs` covers:
  - bold, italic, underline and code hotkeys at a collapsed caret: they format the next typed text and stop after a toggle-off;
  - toggling marks off an expanded selection;
  - partly overlapping marks, and backward formatting at a text-node edge;
  - underline together with strikethrough;
  - lowercase, uppercase and capitalize formats, which Space, Tab and Enter reset (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:500`), and font-size and font-family controls;
  - formatting at the edge of a date-time decorator (#2523);
  - toolbar active state, including underline over a multi-line selection.

  Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:688-696`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: row families only, not rerun.

## Text tokens

- **Hashtags and keywords are text tokens recomputed from the text.** In Lexical's playground a hashtag or a keyword is a styled text token derived from the plain text, so edits near it grow, shrink or remove the token. `Hashtags.spec.mjs` deletes the space between `#hello` and `world` so the token grows to `#helloworld`, then types the space back so it shrinks (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:90`); the ledger adds that deleting the leading `#` drops the token. The file also covers the hashtag grammar, invalid matches, markdown import and export, and format inheritance. `Keywords.spec.mjs` styles the fixed word `congrats`, with bracket and team-token variants, and tests editing, merging and splitting at delimiters and caret movement around the token. Three regressions pin the same class:
  - #221 types Space, Delete and Backspace inside a hashtag (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/regression/221-editing-hashtags.spec.mjs:22-106`);
  - #230 moves right into a hashtag after a text node before it was inserted and removed (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/regression/230-navigation-around-hashtags.spec.mjs:22`);
  - #231 deletes backward through a hashtag typed after `a` until the paragraph is empty, the case that once raised a segment error (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/regression/231-empty-text-nodes.spec.mjs:26`).

  Plite ports only #231, as a delete over a `token: true` leaf that ends in one empty text leaf with the caret at `[0, 0]` offset 0 (`packages/plitejs/test/delete-contract.ts:849`). The ledger's Plite proofs for the other rows lived in a `highlighted-text` example this repository never had (`git log --all` finds no such file), and `git grep -i hashtag` over `apps/plite/tests` and `packages/plitejs/test` finds only a mark-typing row (`apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:1293`), so no current Plite test covers editing a decoration-derived token. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:801`, `:803`, `:313`, `:871-872`; Plite side checked on 2026-10-08. Limit: Lexical's files were not rerun, and the Keywords rows were read only through the ledger.

## Text styles

- **Selection helpers own inline CSS styles.** The `lexical-selection` package holds `$setBlocksType`, block-selection movement, and helpers that patch the inline CSS style string of text nodes through a style cache. Its tests also resolve the selection to a sibling element when a selected node, or a selected node's child, is removed (`facebook/lexical@dd5c41b1:packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:1973-2089`). Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:815-816`. Limit: not rerun.

## Comments

- Lexical's playground `CommentPlugin` keeps threads in an external store, removes marks through document mutation listeners and asynchronous cleanup, and indexes the active comment IDs (facebook/lexical@83e8b4925c6c4f5ecb884036bdfaa2c1a0bb2349:packages/lexical-playground/src/plugins/CommentPlugin/index.tsx:730-905; read 2026-09-21). The external metadata store is sound, but the listener-and-async cleanup is playground glue, not a cleaner reusable annotation engine (docs/plite/research/2026-09-21-annotation-architecture-oss/read-log.tsv:12).
