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

| Legacy example        | Current same-path example                  | Current replacement-compat owner                                                                                                                                                                                                                                                                                                          | Current read          |
| --------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `android-tests`       | `site/examples/ts/android-tests.tsx`       | current + legacy rows present; current row is explicitly extended with the legacy manual case picker plus the new IME hub links                                                                                                                                                                                                           | `extended parity row` |
| `check-lists`         | `site/examples/ts/check-lists.tsx`         | source now reads close to legacy after the actual port (`0.861` similarity); the earlier `as CustomEditor` and test-only `id` drift are gone; remaining source drift is limited to current type/module syntax around imports and props; standalone current checkbox proof is still red and explicitly deferred to the later test-fix pass | `recovered`           |
| `code-highlighting`   | `site/examples/ts/code-highlighting.tsx`   | extended parity row: source intentionally owns a v2 code-line model, decoration-source runtime scoping, current API toolbar conversion, and Prism token rendering; desktop proof covers token projections, language retokening after edits, conversion, code-line editing, selection/navigation, paste, undo, and boundary deletion.          | `extended`            |
| `custom-placeholder`  | `site/examples/ts/custom-placeholder.tsx`  | source is now equivalent to the legacy example aside from current type-only import syntax, and Chromium proof covers custom placeholder rendering plus editor height                                                                                                                                                                      | `recovered`           |
| `editable-voids`      | `site/examples/ts/editable-voids.tsx`      | source is much closer than before (`0.568` similarity, `194` diff lines), and Chromium proof now covers shell elements, insertion/duplication, plain input editing, and nested editor editing inside the void                                                                                                                             | `recovered`           |
| `embeds`              | `site/examples/ts/embeds.tsx`              | source now reads close to legacy (`0.763` similarity, `122` diff lines); current proof closes the restored embed shell                                                                                                                                                                                                                    | `recovered`           |
| `forced-layout`       | `site/examples/ts/forced-layout.tsx`       | source now reads close to legacy again after restoring the in-file layout normalizer, legacy initial copy, and contributor-facing title/paragraph shell; current browser proof for initial layout and full-delete restoration is green                                                                                                    | `recovered`           |
| `hovering-toolbar`    | `site/examples/ts/hovering-toolbar.tsx`    | source now reads close to legacy (`0.856` similarity, `135` diff lines); current browser proof for menu reveal/hide and mark toggle is green                                                                                                                                                                                              | `recovered`           |
| `huge-document`       | `site/examples/ts/huge-document.tsx`       | explicit cut for replacement parity: the same-path example intentionally remains the legacy chunking playground and should not be treated as the v2 runtime owner; v2 huge-doc truth is owned by `large-document-runtime`, `bench:react:huge-document-overlays:local`, and the 5000-block legacy compare gate                             | `explicit cut`        |
| `iframe`              | `site/examples/ts/iframe.tsx`              | source now reads very close to legacy (`0.917` similarity, `117` diff lines); current iframe editing proof is green                                                                                                                                                                                                                       | `recovered`           |
| `images`              | `site/examples/ts/images.tsx`              | source now reads fairly close to legacy (`0.699` similarity, `192` diff lines), and Chromium proof covers the restored shell plus invalid prompt handling and selected-image deletion                                                                                                                                                     | `recovered`           |
| `inlines`             | `site/examples/ts/inlines.tsx`             | source now reads close to legacy (`0.850` similarity, `334` diff lines); current browser proof for the seeded inline link is green                                                                                                                                                                                                        | `recovered`           |
| `markdown-preview`    | `site/examples/ts/markdown-preview.tsx`    | recovered: source is an intentional v2 decoration-source rewrite of the legacy Prism markdown preview, using `useSlateRangeDecorationSource` and `renderSegment`; desktop proof now checks rendered preview classes before and after editing instead of only text containment.                                                              | `recovered`           |
| `markdown-shortcuts`  | `site/examples/ts/markdown-shortcuts.tsx`  | extended parity row: source intentionally ports the legacy shortcut behavior into a v2 editor extension and adds ordered-list starts, NBSP whitespace, adjacent list merge, undo/redo, and caret contracts; desktop proof passed after fake mobile returns became explicit skips.                                                             | `extended`            |
| `mentions`            | `site/examples/ts/mentions.tsx`            | source now reads very close to legacy (`0.970` similarity, `233` diff lines); current browser proof for chips, portal, and insertion is green                                                                                                                                                                                             | `recovered`           |
| `paste-html`          | `site/examples/ts/paste-html.tsx`          | source now reads close to legacy (`0.820` similarity, `233` diff lines), and Chromium proof for the supported explicit formatting subset is green for bold and code                                                                                                                                                                       | `recovered`           |
| `plaintext`           | `site/examples/ts/plaintext.tsx`           | source now reads close to legacy again after dropping the extra type-only drift and restoring the minimal example shell; current browser proof for typing is green                                                                                                                                                                        | `recovered`           |
| `read-only`           | `site/examples/ts/read-only.tsx`           | source now reads close to legacy again after dropping the extra type-only drift and preserving the minimal readOnly shell; current browser proof for non-editability is green                                                                                                                                                             | `recovered`           |
| `richtext`            | `site/examples/ts/richtext.tsx`            | source now reads close to legacy (`0.874` similarity, `225` diff lines), and Chromium proof is green for render, browser text insertion, and undo restoring deleted selected rich text                                                                                                                                                    | `recovered`           |
| `scroll-into-view`    | deleted in v2                             | explicit cut: the legacy example was a temporary scroll helper surface and was deleted with its Playwright file in `f6dfd994`; current behavior is owned by `slate-react` scroll/selection side-effect contracts, not a same-path example. Focused package proof is green for default scroll measurement, shadow-root outer scrolling, app-owned `scrollSelectionIntoView`, and remote skip-scroll metadata. | `explicit cut`        |
| `search-highlighting` | `site/examples/ts/search-highlighting.tsx` | source now reads close to legacy again after restoring the legacy search/decorate flow, `Slate` wrapper, and contributor-facing input shell; remaining forced drift is the current `projectionStore` + `renderSegment` wiring instead of legacy `decorate` + `renderLeaf`; current browser proof for two highlighted matches is green     | `recovered`           |
| `shadow-dom`          | `site/examples/ts/shadow-dom.tsx`          | recovered: source keeps the legacy nested-shadow structure and text while using the current `useSlateEditor` API instead of legacy `createEditor` / `withReact` / `withHistory`; cross-browser proof covers render, editing, generated typing gauntlet, native caret helper, ArrowLeft movement, RTL deletion where supported, and Enter/follow-up typing. | `recovered`           |
| `styling`             | `site/examples/ts/styling.tsx`             | recovered: source keeps the legacy two-editor styling shape and copy while using `useSlateEditor`; browser proof covers `style` prop defaults, `className` plus `disableDefaultStyles`, and Chromium drag/undo selected-text behavior. | `recovered`           |
| `tables`              | `site/examples/ts/tables.tsx`              | extended parity row: source intentionally keeps the legacy rendering example while adding conservative v2 cell-boundary editing, Tab navigation, native/model selection, drag, paste, RTL direction, and render-count proof; table-fragment merge semantics remain a separate package policy checkpoint.                                    | `extended`            |

## 2026-04-15 Git-Diff Rebaseline

This pass invalidates or upgrades rows from the source diff itself instead of
from browser feel.

| Example               | Source-diff read                                                                                                       | Ledger result                |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `code-highlighting`   | intentional v2 code-line/decorations-source rewrite with desktop token/editing proof                                    | upgraded to `extended`       |
| `check-lists`         | now source-close after the actual port; remaining source drift is limited to current type/module syntax                | upgraded back to `recovered` |
| `custom-placeholder`  | source now reads as the legacy example with current import syntax, and custom placeholder proof is green               | upgraded to `recovered`      |
| `forced-layout`       | rebaseline invalidated it as `open`, but the continuation batch restored the legacy source flow and green delete proof | upgraded to `recovered`      |
| `markdown-preview`    | current decoration-source rewrite over the legacy Prism markdown preview; desktop proof checks rendered preview classes | upgraded to `recovered`      |
| `markdown-shortcuts`  | intentional v2 editor-extension rewrite with desktop shortcut, history, list, paste, and caret proof                   | upgraded to `extended`       |
| `plaintext`           | source-close again after the minimal same-path cleanup                                                                 | upgraded to `recovered`      |
| `read-only`           | source-close again after the minimal same-path cleanup                                                                 | upgraded to `recovered`      |
| `shadow-dom`          | current API wrapper over the legacy nested-shadow example shape; cross-browser proof is green                           | upgraded to `recovered`      |
| `styling`             | current API wrapper over the legacy two-editor styling shape; desktop proof is green                                    | upgraded to `recovered`      |
| `tables`              | intentional conservative table-editing extension with desktop rendering, selection, paste, navigation proof            | upgraded to `extended`       |
| `embeds`              | now source-close after the actual port                                                                                 | upgraded to `recovered`      |
| `hovering-toolbar`    | now source-close after the actual port                                                                                 | upgraded to `recovered`      |
| `iframe`              | now source-close after the actual port                                                                                 | upgraded to `recovered`      |
| `inlines`             | now source-close after the actual port                                                                                 | upgraded to `recovered`      |
| `mentions`            | now source-close after the actual port                                                                                 | upgraded to `recovered`      |
| `paste-html`          | now source-close and formatting proof is green                                                                         | upgraded to `recovered`      |
| `richtext`            | now source-close and undo/typing proof is green                                                                        | upgraded to `recovered`      |
| `search-highlighting` | continuation batch restored the legacy search/decorate shape and green highlight proof                                 | upgraded to `recovered`      |
| `editable-voids`      | now much closer in diff and embedded-form proof is green                                                               | upgraded to `recovered`      |
| `images`              | now much closer in diff and prompt/delete proof is green                                                               | upgraded to `recovered`      |

## Source-Diff Stats

Exact paired same-path source stats from the 2026-04-15 rebaseline:

| Example               | Similarity | Legacy lines | Current lines | Diff lines |
| --------------------- | ---------- | ------------ | ------------- | ---------- |
| `android-tests`       | `0.732`    | `266`        | `281`         | `209`      |
| `check-lists`         | `0.861`    | `198`        | `203`         | `122`      |
| `code-highlighting`   | `0.062`    | `473`        | `277`         | `674`      |
| `custom-placeholder`  | `0.234`    | `36`         | `61`          | `77`       |
| `editable-voids`      | `0.568`    | `166`        | `168`         | `194`      |
| `embeds`              | `0.763`    | `160`        | `168`         | `122`      |
| `forced-layout`       | `0.043`    | `121`        | `151`         | `240`      |
| `hovering-toolbar`    | `0.856`    | `178`        | `157`         | `135`      |
| `huge-document`       | `0.021`    | `1040`       | `574`         | `1492`     |
| `iframe`              | `0.917`    | `183`        | `182`         | `117`      |
| `images`              | `0.699`    | `222`        | `224`         | `192`      |
| `inlines`             | `0.850`    | `454`        | `432`         | `334`      |
| `markdown-preview`    | `0.082`    | `138`        | `182`         | `286`      |
| `markdown-shortcuts`  | `0.086`    | `247`        | `287`         | `440`      |
| `mentions`            | `0.970`    | `746`        | `747`         | `233`      |
| `paste-html`          | `0.820`    | `305`        | `294`         | `233`      |
| `plaintext`           | `0.322`    | `24`         | `34`          | `42`       |
| `read-only`           | `0.301`    | `25`         | `35`          | `42`       |
| `richtext`            | `0.874`    | `328`        | `349`         | `225`      |
| `scroll-into-view`    | `N/A`      | legacy temp example | deleted in v2 | explicit cut |
| `search-highlighting` | `0.170`    | `141`        | `197`         | `278`      |
| `shadow-dom`          | `0.120`    | `48`         | `58`          | `86`       |
| `styling`             | `0.384`    | `47`         | `68`          | `103`      |
| `tables`              | `0.036`    | `215`        | `145`         | `270`      |

## Stable Or Explicitly Owned Rows After Git-Diff Rebaseline

- `android-tests`: explicit `extended` parity row
- `huge-document`: explicit cut for parity; same-path source is the legacy
  chunking playground, while v2 huge-doc runtime truth is owned by
  `large-document-runtime` and benchmark gates
- `check-lists`: source-close recovered row
- `custom-placeholder`: source-close recovered row
- `embeds`: source-close recovered row
- `forced-layout`: source-close recovered row
- `hovering-toolbar`: source-close recovered row
- `iframe`: source-close recovered row
- `inlines`: source-close recovered row
- `markdown-preview`: recovered; current source owns the same Prism markdown
  preview behavior through v2 decoration sources and `renderSegment`, and
  desktop proof checks rendered preview classes before and after editing.
- `mentions`: source-close recovered row
- `plaintext`: source-close recovered row
- `read-only`: source-close recovered row
- `search-highlighting`: source-close recovered row
- `scroll-into-view`: explicit cut; the same-path example/test are no longer
  live current owners. Keep scroll behavior proof in package contracts.
- `shadow-dom`: recovered; current source uses `useSlateEditor` but keeps the
  legacy nested-shadow shape and text, and desktop cross-browser proof is green.
- `styling`: recovered; current source uses `useSlateEditor` but keeps the
  legacy two-editor `style`/`className` demonstration and desktop proof is
  green.

## Legacy Playwright Drift

| Legacy test             | Current owner                                      | Current read                                                                                                                                                  |
| ----------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `select.test.ts`        | `richtext.test.ts`                                 | `recovered`; the triple-click paragraph-selection intent is explicitly owned on the current richtext browser seam                                             |
| `huge-document.test.ts` | benchmark lanes + `large-document-runtime.test.ts` | `explicit cut`; the legacy test asserts old chunking internals, while v2 huge-doc behavior is owned by the runtime browser rows and 5000-block benchmark gate |

## Current-Only TS Example Surfaces

All currently live current-only TS example surfaces in `Plate repo root` are
classified here.

Broader draft-only names that do not currently map to live files in
`apps/www/src/app/(app)/examples/slate/_examples/**` stay in the draft docs until they exist in
the repo.

- already classified current-only v2 north-star rows:
  - `search-highlighting`: `extended`
    current explicit decoration-source owner; Chromium proof is green and the
    surface is deliberate v2 overlay value rather than same-path parity debt
  - `code-highlighting`: `extended`
    current code-token decoration owner; Chromium proof is green and the surface
    owns code-line edit/navigation behavior on the kept model
  - `decorations-async`: `extended`
    current async decoration owner; Chromium proof is green for delayed prop and
    hook decoration updates preserving the typed-end caret
  - `persistent-annotation-anchors`: `extended`
    current durable-annotation anchor example; Chromium proof is green and the
    surface is deliberate v2 value beyond the legacy example set
  - `comment-mode`: `extended`
    current comment/review UI owner; Chromium proof is green for pointer
    selection, sidebar state, inline review slices, and annotation-backed widget
    visibility
- deleted draft-only rows:
  - `highlighted-text`, `external-decoration-sources`, and `review-comments`
    were deleted from `.tmp/slate-v2` and are not current file/proof owners.
    Keep historical claims in draft history only; do not cite them as live
    runnable rows.
- broader browser/input parity rows that do not currently map to live example
  or Playwright files stay tracked in
  `true-slate-rc-proof-ledger.md`, not here

## Next Recovery Batch

Highest-signal immediate recoveries after the git-diff invalidation:

1. recover the still-full-rewrite rows first:
   - none
2. recover the remaining materially rewritten same-path rows:
   - none
3. finish the remaining open rows:
   - none
4. keep `scroll-into-view` out of the live parity backlog unless a current
   example is intentionally reintroduced.
5. classify current-only rewrite unlocks as `extended`, `mixed`, `explicit cut`,
   or `open`
