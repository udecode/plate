---
date: 2026-04-15
topic: slate-v2-example-parity-matrix
status: active
---

# Slate v2 Example Parity Matrix

## Purpose

Exact inventory for legacy/current example parity.

This is not a deletion ledger.
It answers:

- which legacy examples already have current same-path owners
- which legacy examples still lack direct parity owners
- which current-only examples are rewrite unlocks that need `extended` or
  `explicit cut` classification

## Why The Old Ledger Missed Real Drift

- rows were getting promoted to `paired parity row` once any current + legacy
  proof existed
- replacement-compatibility mostly proves narrow behavior seams, not
  contributor-facing source shape or control-surface parity
- the matrix had no explicit source/UI parity read, so scratch rewrites could
  hide behind green tokenization, selection, or typing rows
- same-path current files were being treated as ambient closure instead of
  being held to the closer standard: the nearest honest legacy source shape

## Source-First Rule

Same-path example rows are now classified from the source diff first.

- if the current file still reads like a close legacy port, it can be
  `recovered`
- if the shell is close but important behavior or interaction proof is still
  narrow, it is `mixed`
- if the file still reads like a rewrite in diff, it is `open` even when a
  browser row is green

Runtime proof can confirm a source-close row.
It cannot rescue a source-drifted row.

## Current Counts

- legacy TS example surfaces: `24`
- current TS example surfaces: `61`
- legacy Playwright example tests: `23`
- current Playwright example tests: `61`

## Legacy TS Example Inventory

| Legacy example | Current same-path example | Current replacement-compat owner | Current read |
| --- | --- | --- | --- |
| `android-tests` | `site/examples/ts/android-tests.tsx` | current + legacy rows present; current row is explicitly extended with the legacy manual case picker plus the new IME hub links | `extended parity row` |
| `check-lists` | `site/examples/ts/check-lists.tsx` | source now reads close to legacy after the actual port (`0.861` similarity); the earlier `as CustomEditor` and test-only `id` drift are gone; remaining source drift is limited to the current `EditableBlocks` surface not exposing legacy `spellCheck` / `autoFocus` plus the current type/module syntax around imports and props; standalone current checkbox proof is still red and explicitly deferred to the later test-fix pass | `recovered` |
| `code-highlighting` | `site/examples/ts/code-highlighting.tsx` | current shell/proof exists, but the file is still full drift in source (`0.062` similarity, `674` diff lines) | `open` |
| `custom-placeholder` | `site/examples/ts/custom-placeholder.tsx` | current + legacy rows exist, but the source diff is still materially rewritten (`0.234` similarity, `77` diff lines) | `open` |
| `editable-voids` | `site/examples/ts/editable-voids.tsx` | the source is now much closer than before (`0.568` similarity, `194` diff lines), but the current proof only closes the restored shell/insertion lane, not the full legacy embedded-form interaction story | `mixed` |
| `embeds` | `site/examples/ts/embeds.tsx` | source now reads close to legacy (`0.763` similarity, `122` diff lines); current proof closes the restored embed shell | `recovered` |
| `forced-layout` | `site/examples/ts/forced-layout.tsx` | source now reads close to legacy again after restoring the in-file layout normalizer, legacy initial copy, and contributor-facing title/paragraph shell; remaining drift is limited to the current `EditableBlocks` surface replacing legacy `Editable`; current browser proof for initial layout and full-delete restoration is green | `recovered` |
| `hovering-toolbar` | `site/examples/ts/hovering-toolbar.tsx` | source now reads close to legacy (`0.856` similarity, `135` diff lines); current browser proof for menu reveal/hide and mark toggle is green | `recovered` |
| `huge-document` | `site/examples/ts/huge-document.tsx` | benchmark-owned parity owner via `bench:replacement:huge-document:local` and `bench:replacement:huge-document:overlays:local` | `extended benchmark-owned parity row` |
| `iframe` | `site/examples/ts/iframe.tsx` | source now reads very close to legacy (`0.917` similarity, `117` diff lines); current iframe editing proof is green | `recovered` |
| `images` | `site/examples/ts/images.tsx` | source now reads fairly close to legacy (`0.699` similarity, `192` diff lines), but current proof only closes the restored shell, not the full prompt/delete interaction lane | `mixed` |
| `inlines` | `site/examples/ts/inlines.tsx` | source now reads close to legacy (`0.850` similarity, `334` diff lines); current browser proof for the seeded inline link is green | `recovered` |
| `markdown-preview` | `site/examples/ts/markdown-preview.tsx` | current + legacy rows exist, but the source diff still reads like a rewrite (`0.082` similarity, `286` diff lines) | `open` |
| `markdown-shortcuts` | `site/examples/ts/markdown-shortcuts.tsx` | current + legacy rows exist, but the source diff still reads like a rewrite (`0.086` similarity, `440` diff lines) | `open` |
| `mentions` | `site/examples/ts/mentions.tsx` | source now reads very close to legacy (`0.970` similarity, `233` diff lines); current browser proof for chips, portal, and insertion is green | `recovered` |
| `paste-html` | `site/examples/ts/paste-html.tsx` | source now reads close to legacy (`0.820` similarity, `233` diff lines), but current proof still has one red explicit-formatting row | `mixed` |
| `plaintext` | `site/examples/ts/plaintext.tsx` | current + legacy rows exist, but the source diff still reads materially rewritten (`0.322` similarity, `42` diff lines) | `open` |
| `read-only` | `site/examples/ts/read-only.tsx` | current + legacy rows exist, but the source diff still reads materially rewritten (`0.301` similarity, `42` diff lines) | `open` |
| `richtext` | `site/examples/ts/richtext.tsx` | source now reads close to legacy (`0.874` similarity, `225` diff lines), but current proof still has red multi-block transform rows | `mixed` |
| `scroll-into-view` | `site/examples/ts/scroll-into-view.tsx` | current dedicated row exists in `scroll-into-view.test.ts`; source is still not close (`0.232` similarity, `194` diff lines) and the mirrored legacy/current action is still red | `open` |
| `search-highlighting` | `site/examples/ts/search-highlighting.tsx` | source now reads close to legacy again after restoring the legacy search/decorate flow, `Slate` wrapper, and contributor-facing input shell; remaining forced drift is the current `projectionStore` + `renderSegment` wiring instead of legacy `decorate` + `renderLeaf`; current browser proof for two highlighted matches is green | `recovered` |
| `shadow-dom` | `site/examples/ts/shadow-dom.tsx` | current + legacy rows exist, but the source diff still reads materially rewritten (`0.120` similarity, `86` diff lines) | `open` |
| `styling` | `site/examples/ts/styling.tsx` | current + legacy rows exist, but the source diff still reads materially rewritten (`0.384` similarity, `103` diff lines) | `open` |
| `tables` | `site/examples/ts/tables.tsx` | current + legacy rows exist, but the source diff still reads like a rewrite (`0.036` similarity, `270` diff lines) | `open` |

## 2026-04-15 Git-Diff Rebaseline

This pass invalidates or upgrades rows from the source diff itself instead of
from browser feel.

| Example | Source-diff read | Ledger result |
| --- | --- | --- |
| `code-highlighting` | still full rewrite in diff | stays `open` |
| `check-lists` | now source-close after the actual port; remaining source drift is limited to the current `EditableBlocks` surface gap (`spellCheck` / `autoFocus`) plus current type/module syntax | upgraded back to `recovered` |
| `custom-placeholder` | still materially rewritten in diff | invalidated back to `open` |
| `forced-layout` | rebaseline invalidated it as `open`, but the continuation batch restored the legacy source flow and green delete proof | upgraded to `recovered` |
| `markdown-preview` | still full rewrite in diff | invalidated back to `open` |
| `markdown-shortcuts` | still full rewrite in diff | invalidated back to `open` |
| `plaintext` | still materially rewritten in diff | invalidated back to `open` |
| `read-only` | still materially rewritten in diff | invalidated back to `open` |
| `shadow-dom` | still materially rewritten in diff | invalidated back to `open` |
| `styling` | still materially rewritten in diff | invalidated back to `open` |
| `tables` | still full rewrite in diff | invalidated back to `open` |
| `embeds` | now source-close after the actual port | upgraded to `recovered` |
| `hovering-toolbar` | now source-close after the actual port | upgraded to `recovered` |
| `iframe` | now source-close after the actual port | upgraded to `recovered` |
| `inlines` | now source-close after the actual port | upgraded to `recovered` |
| `mentions` | now source-close after the actual port | upgraded to `recovered` |
| `paste-html` | now source-close, but proof still incomplete | `mixed` |
| `richtext` | now source-close, but proof still incomplete | `mixed` |
| `search-highlighting` | continuation batch restored the legacy search/decorate shape and green highlight proof | upgraded to `recovered` |
| `editable-voids` | now much closer in diff, but proof still incomplete | `mixed` |
| `images` | now much closer in diff, but proof still incomplete | `mixed` |

## Source-Diff Stats

Exact paired same-path source stats from the 2026-04-15 rebaseline:

| Example | Similarity | Legacy lines | Current lines | Diff lines |
| --- | --- | --- | --- | --- |
| `android-tests` | `0.732` | `266` | `281` | `209` |
| `check-lists` | `0.861` | `198` | `203` | `122` |
| `code-highlighting` | `0.062` | `473` | `277` | `674` |
| `custom-placeholder` | `0.234` | `36` | `61` | `77` |
| `editable-voids` | `0.568` | `166` | `168` | `194` |
| `embeds` | `0.763` | `160` | `168` | `122` |
| `forced-layout` | `0.043` | `121` | `151` | `240` |
| `hovering-toolbar` | `0.856` | `178` | `157` | `135` |
| `huge-document` | `0.021` | `1040` | `574` | `1492` |
| `iframe` | `0.917` | `183` | `182` | `117` |
| `images` | `0.699` | `222` | `224` | `192` |
| `inlines` | `0.850` | `454` | `432` | `334` |
| `markdown-preview` | `0.082` | `138` | `182` | `286` |
| `markdown-shortcuts` | `0.086` | `247` | `287` | `440` |
| `mentions` | `0.970` | `746` | `747` | `233` |
| `paste-html` | `0.820` | `305` | `294` | `233` |
| `plaintext` | `0.322` | `24` | `34` | `42` |
| `read-only` | `0.301` | `25` | `35` | `42` |
| `richtext` | `0.874` | `328` | `349` | `225` |
| `scroll-into-view` | `0.232` | `136` | `116` | `194` |
| `search-highlighting` | `0.170` | `141` | `197` | `278` |
| `shadow-dom` | `0.120` | `48` | `58` | `86` |
| `styling` | `0.384` | `47` | `68` | `103` |
| `tables` | `0.036` | `215` | `145` | `270` |

## Stable Or Explicitly Owned Rows After Git-Diff Rebaseline

- `android-tests`: explicit `extended` parity row
- `huge-document`: explicit benchmark-owned row, not a same-shape source target
- `check-lists`: source-close recovered row
- `embeds`: source-close recovered row
- `forced-layout`: source-close recovered row
- `hovering-toolbar`: source-close recovered row
- `iframe`: source-close recovered row
- `inlines`: source-close recovered row
- `mentions`: source-close recovered row
- `search-highlighting`: source-close recovered row
- `scroll-into-view`: still open, and now explicitly open on source diff too

## Legacy Playwright Drift

| Legacy test | Current owner | Current read |
| --- | --- | --- |
| `select.test.ts` | `richtext.test.ts` | `recovered`, but still needs explicit example-parity classification |
| `huge-document.test.ts` | benchmark lanes | `explicit cut` in deletion closure, but still needs explicit example-parity sign-off |

## Current-Only TS Example Surfaces

These are rewrite unlocks or split-out proof surfaces and need explicit
`extended`, `mixed`, `explicit cut`, or `open` classification:

- `android-empty-rebuild`
- `android-remove-range`
- `android-special-structural`
- `android-split-join`
- `check-list-unit-rich-inline`
- `complex-list-units-rich-inline`
- `deep-wrapper-rich-inline`
- `drag-drop-cleanup`
- `external-decoration-sources`
- `firefox-nested-editable-focus`
- `highlighted-text`
- `inline-edge`
- `links`
- `list-rich-inline`
- `list-unit-quote-rich-inline`
- `list-unit-rich-inline`
- `mark-placeholder`
- `mixed-inline`
- `mixed-inline-multiblock`
- `multi-block-complex-list-units-rich-inline`
- `nested-complex-list-units-rich-inline`
- `nested-list-rich-inline`
- `nested-list-unit-quote-rich-inline`
- `nested-list-unit-rich-inline`
- `nested-mixed-inline`
- `nested-multi-block-complex-list-units-rich-inline`
- `nested-quote`
- `nested-rich-inline`
- `ordered-list-unit-rich-inline`
- `persistent-annotation-anchors`
- `placeholder`
- `placeholder-no-feff`
- `review-comments`
- `rich-inline`
- `table-multi-range-firefox`
- `void-edge`
- `zero-width-matrix`

## Current-Only Browser / Proof Surfaces

These are current-only Playwright/proof surfaces and also need explicit
classification instead of being left as ambient drift:

- `firefox-direct-ime`
- `ime-proxy`
- `inline-edge-ime`
- `placeholder-ime`
- `replacement-compatibility`
- `void-edge-ime`
- `webkit-direct-ime-ceiling`

## Next Recovery Batch

Highest-signal immediate recoveries after the git-diff invalidation:

1. recover the still-full-rewrite rows first:
   - `code-highlighting`
   - `custom-placeholder`
   - `markdown-preview`
   - `markdown-shortcuts`
   - `tables`
2. recover the remaining materially rewritten same-path rows:
   - `plaintext`
   - `read-only`
   - `shadow-dom`
   - `styling`
3. finish the mixed rows:
   - `editable-voids`
   - `images`
   - `paste-html`
   - `richtext`
4. finish the already-open parity row:
   - `scroll-into-view`
5. classify current-only rewrite unlocks as `extended`, `mixed`, `explicit cut`,
   or `open`
