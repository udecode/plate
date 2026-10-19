# TipTap Test Harvest Report

status: done
score: 0.93
target: `../tiptap`
mode: report-only
generated: 2026-05-10
skill: `.agents/skills/editor-test-harvester/SKILL.md`

## Verdict

TipTap is mostly a Plate-policy source, not a raw Plite architecture source.
The useful raw pressure is narrow: paste transform ordering, mark-range
boundaries, hotkey layout fallback, host lifecycle, readOnly/focus, and a few
document/empty-node basics. The larger body of tests belongs to Plate packages,
kits, examples, docs, or backlog rows.

No `../plite` code was changed.

## Inventory

Inventory command:

```bash
rg --files ../tiptap \
  | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\.(test|spec)\.[cm]?[jt]sx?$' \
  | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)'
```

| Metric | Count |
| --- | ---: |
| Total test/support files | 276 |
| Runnable test files | 253 |
| Test-name indexed files | 239 |
| `it` / `test` call matches | 1,450 |
| Raw `describe` / `it` / `test` call matches | 1,620 |
| `expect(...)` call matches | 1,341 |
| Portable-mixed | 63 |
| Plate-owned | 184 |
| Harness / placeholder | 21 |
| Skip | 8 |
| Uncertain | 0 |

Linked appendices:

- Full inventory: `docs/editor-test-harvester/tiptap/inventory.md`
- Test-name index: `docs/editor-test-harvester/tiptap/test-index.md`
- Portable-mixed routing: `docs/editor-test-harvester/tiptap/portable-mixed-routing.md`

So: `276` is the inventory-file count, not the number of TipTap test cases.
The best rough test-case count is `1,450` `it` / `test` calls.

The 14 runnable files without extracted test names are Cypress placeholders with
only route setup and `TODO` comments. They are categorized as `harness`, not
behavior.

## Score

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| Inventory completeness | 0.20 | 0.96 | Exact command, 276 rows, full inventory appendix, no uncertain rows. |
| Behavior extraction depth | 0.20 | 0.91 | Every portable-mixed file has test-name extraction or was reclassified as placeholder harness; representative source ranges were read. |
| Skip precision and negative controls | 0.15 | 0.90 | Skip families have concrete reasons; `mergeDeep`, `nodePos`, and extension option tests were read as negative controls. |
| Plite/Plate coverage mapping accuracy | 0.20 | 0.93 | Current `../plite` and Plate owner searches were recorded and used for every action family. |
| Actionability | 0.15 | 0.92 | Each non-covered row has a target owner plus a focused verification command or backlog owner. |
| Provenance and reproducibility | 0.10 | 0.94 | All rows point to local source paths, line ranges, and generated appendices. |
| Weighted total | 1.00 | 0.93 | Passes done threshold. |

## Plite And Plate Searches

Raw Plite searches used:

```bash
rg -n "transformPastedHTML|transformPasted|paste.*transform|HTML.*paste|insertFromPaste|clipboard|data-plite-fragment" ../plite/packages ../plite/playwright/integration
rg -n "getMarkRange|extendMarkRange|mark range|link range|marks.*range|Range.*mark|toggleMark|addMark|removeMark" ../plite/packages ../plite/playwright/integration
rg -n "keyboard shortcut|hotkey|shortcut|priority|plugin.*order|extension.*order|handler.*order|preventDefault|return false" ../plite/packages ../plite/playwright/integration
rg -n "undo|redo|history|ControlOrMeta\\+Z|Meta\\+Z|russian|я" ../plite/packages ../plite/playwright/integration
rg -n "focus|preventScroll|readOnly|editable|has-focus|isFocused|selection.*focus" ../plite/packages ../plite/playwright/integration
```

Plate owner searches used:

```bash
rg --files packages | rg '(link|list|table|mention|suggestion|placeholder|markdown|collaboration|yjs|dnd|drag|serializer|html|ai)'
rg -n "transformPastedHTML|plugin order|hotkey|shortcut priority|UndoRedo|russian|aria|readOnly|preventScroll|focus" docs packages apps
```

## Behavior Matrix

| Family | TipTap source | Portable invariant | Current owner | Action | Verification |
| --- | --- | --- | --- | --- | --- |
| Clipboard HTML transform order | `../tiptap/packages/core/src/__tests__/transformPastedHTML.test.ts:8`, `:84`, `:153`, `:204`; `../tiptap/tests/cypress/integration/core/transformPastedHTML.spec.ts` | Paste HTML transforms compose deterministically: base transform first, then extension transforms by priority, chaining transformed output and skipping absent hooks. | Plite has paste HTML and clipboard boundary coverage; Plate paste pipelines own extension-level transform policy. | `refactor-existing` for raw paste rows; `plate-owned` for plugin pipelines. | Raw: `cd ../plite && bun test playwright/integration/examples/paste-html.test.ts`; Plate backlog: `packages/markdown`, `packages/docx`, HTML serializer/paste owners. |
| Mark range and mark selection extension | `../tiptap/packages/core/__tests__/getMarkRange.spec.ts:26`, `:37`, `:48`, `:67`, `:99`, `:130`; `../tiptap/packages/core/__tests__/extendMarkRange.spec.ts:10`, `:77`, `:150` | A mark range resolves from inside/start/end, stops at node boundaries, splits by attributes, and selection extension is a no-op when no matching mark exists. | Plate link/mark packages own user-facing range extension; raw Plite mark add/remove/toggle contracts are already present. | `plate-owned`; use raw tests only for generic mark boundary pressure if a Plite helper is added. | Plate backlog owner: `packages/link`, mark toolbar state. Suggested focused proof: package test for link range by href and paragraph boundary. |
| Command preflight | `../tiptap/packages/core/__tests__/can.spec.ts:18`, `:28`, `:62`, `:80`, `:98`, `:110`, `:134`, `:153`, `:165`, `:177`, `:189` | Command availability must be queryable without dispatch and must reject mark actions in code/node conflicts while allowing valid mixed selections. | Plate toolbar/shortcut enabled state owns most of this; raw Plite owns primitive history and mark operation validity. | `plate-owned`. | Plate backlog owner: mark toolbar and command state tests; raw coverage stays in `../plite/packages/plite/test/snapshot-contract.ts` and history tests. |
| Shortcut priority and handler cascade | `../tiptap/tests/cypress/integration/core/pluginOrder.spec.ts:8` | Shortcut handlers run in priority order; handlers returning false allow later handlers to run. | Plite has internal command priority coverage; Plate plugin shortcut host owns extension cascade policy. | `plate-owned` with raw row marked covered for command priority. | Raw: `cd ../plite && bun test ./packages/plite/test/transaction-contract.ts`; Plate backlog owner: plugin shortcut host tests. |
| Non-English undo/redo hotkeys | `../tiptap/demos/src/Extensions/UndoRedo/React/index.spec.js:19`, `:25`, `:33`, `:43`, `:69`, `:79` | Undo/redo works from UI buttons and keyboard shortcuts; Cyrillic `я` maps to physical undo/redo when appropriate. | Covered in `../plite/packages/plite-dom/test/hotkeys.ts`, including non-English physical-code fallback. | `covered`; optional browser-history strengthening only if a real browser row lacks physical-code proof. | `cd ../plite && bun test ./packages/plite-dom/test/hotkeys.ts` |
| Focus and readOnly browser behavior | `../tiptap/demos/src/Extensions/Focus/React/index.spec.js:6`; `../tiptap/demos/src/GuideContent/ReadOnly/React/index.spec.js:12`, `:23` | Focused block state and readOnly must be observable in the browser; readOnly prevents typing and changes focusability. | Plite React/browser owns raw focus/readOnly; Plate owns focused decorators and UI classes. | `covered` for raw behavior; `plate-owned` for decorator policy. | Raw: `cd ../plite && bun test:integration-local --grep readOnly`; Plate backlog owner: focused decorator examples if product policy changes. |
| Content parse, insert, and whitespace | `../tiptap/demos/src/Commands/InsertContent/React/index.spec.js`; `../tiptap/demos/src/Commands/SetContent/React/index.spec.js`; `../tiptap/packages/core/__tests__/createNodeFromContent.spec.ts`; `../tiptap/packages/core/__tests__/requiredAttributes.spec.ts`; `../tiptap/packages/core/__tests__/onContentError.spec.ts` | HTML/text/JSON insertion preserves deliberate whitespace, handles malformed fragments predictably, and routes invalid content through a stable error path. | Plate HTML/markdown/docx/parser packages own most policy; raw Plite owns browser paste insertion invariants only. | `plate-owned`; raw `refactor-existing` only for actual paste insertion regressions. | Plate backlog owner: parser/serializer packages. Raw: `cd ../plite && bun test playwright/integration/examples/paste-html.test.ts` when browser paste is touched. |
| Markdown and input/paste rules | `../tiptap/demos/src/Examples/MarkdownShortcuts/React/index.spec.js`; `../tiptap/demos/src/Examples/MarkdownShortcuts/Vue/index.spec.js`; `../tiptap/demos/src/Commands/InsertContentApplyingRules/React/index.spec.js` | Markdown shortcuts and paste rules apply only in the intended editing context. | Plate markdown/input-rule packages. | `plate-owned`. | Plate backlog owner: `packages/markdown` and input-rule examples. |
| Serialization and static rendering | `../tiptap/demos/src/GuideContent/ExportHTML/React/index.spec.js`; `../tiptap/demos/src/GuideContent/GenerateJSON/React/index.spec.js`; `../tiptap/demos/src/GuideContent/StaticRenderHTML/React/index.spec.js`; `../tiptap/packages/core/__tests__/generateHTML.spec.ts`; `../tiptap/packages/core/__tests__/generateText.spec.ts` | HTML/JSON/text output is stable across runtime and static rendering paths. | Plate serializer packages and docs examples. | `plate-owned`. | Plate backlog owner: `packages/markdown`, HTML serializer/docs examples. |
| Document/node basics | `../tiptap/demos/src/Nodes/Document/React/index.spec.js`; `../tiptap/demos/src/Nodes/Paragraph/React/index.spec.js`; `../tiptap/demos/src/Nodes/Text/React/index.spec.js`; `../tiptap/packages/core/__tests__/isNodeEmpty.spec.ts` | Empty-node and basic node behavior should be explicit, especially around renderable empty content and text nodes. | Raw Plite owns generic document invariants; Plate owns node kits. | `refactor-existing` only if current raw Plite tests lack the exact generic invariant. | Raw: `cd ../plite && bun test ./packages/plite/test`; Plate owner: node package tests. |
| Collaboration IDs and caret startup | `../tiptap/packages/extension-unique-id/__tests__/unique-id-collab.spec.ts:58`, `:73`, `:103`, `:128`; `../tiptap/packages/extension-collaboration-caret/__tests__/collaboration-caret.spec.ts:39`, `:102`, `:148` | Collaboration should not assign local IDs before remote sync when that would race, and caret/table initialization should not crash with HTML content. | Plate Yjs/collaboration/table packages. | `plate-owned`. | Plate backlog owner: `packages/yjs`, `packages/table`, collaboration examples. |
| Performance smoke | `../tiptap/demos/src/Examples/Performance/React/index.spec.js` | A large-editor example can load and remain usable. | Plite performance plan only if reproduced under the Plite harness. | `defer`. | Future raw proof must run in `../plite` benchmark/browser harness, not copied from a TipTap demo. |

## Skips And Negative Controls

| Source | Reason |
| --- | --- |
| `../tiptap/packages/core/__tests__/mergeDeep.spec.ts:4` | Generic deep-merge utility; no editor behavior. |
| `../tiptap/packages/core/__tests__/extensionOptions.spec.ts:4` | TipTap extension option inheritance/configuration; Plate already has its own plugin API shape. |
| `../tiptap/packages/core/__tests__/nodePos.spec.ts:38` | ProseMirror integer-position helper and query wrapper; not a Plite model. |
| `../tiptap/packages/core/__tests__/mergeAttributes.spec.ts` | HTML attribute merge helper, useful only inside TipTap render pipeline. |
| Placeholder Cypress specs | Route setup plus `TODO: Write tests`; no assertions. |

## Pass-State Ledger

| Pass | Status | Evidence added | Report delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| Intake and boundary | complete | Confirmed local `../tiptap`; report-only mode. | Target and non-goals set. | None. | Done. |
| Inventory | complete | 276-row inventory generated. | Linked `inventory.md`. | None. | Done. |
| Test-name extraction | complete | 239 runnable files indexed; 14 TODO-only placeholders reclassified as harness. | Linked `test-index.md`. | None. | Done. |
| Classification pressure | complete | All rows classified into `portable-mixed`, `plate-owned`, `skip`, or `harness`; no uncertain. | Counts updated after placeholder audit. | None. | Done. |
| Behavior extraction | complete | Representative source ranges read for paste, marks, command preflight, shortcut order, history, focus/readOnly, collaboration, and skips. | Matrix rows added. | None. | Done. |
| Plite/Plate mapping | complete | Current raw Plite and Plate searches recorded. | Action owners assigned. | None. | Done. |
| Action planning | complete | Every actionable family has target owner and verification/backlog owner. | Next-slice list added. | None. | Done. |
| Ecosystem synthesis | complete | TipTap positioned as Plate-policy and focused raw pressure source. | Synthesis added. | None. | Done. |
| Closure review | complete | Score 0.93; done gates pass. | Completion file can be `done`. | None. | Done. |

## Next Slices

1. Plate link/mark range: add package-level proof for link-range extension by
   href and paragraph boundary if current Plate link tests lack it.
2. Plate paste pipeline: add deterministic transform ordering to the relevant
   HTML/docx/markdown paste owner only if Plate exposes a comparable transform
   chain.
3. Plate collaboration: add Yjs unique-id/caret startup rows if current
   `packages/yjs` tests do not cover delayed IDs and table-content startup.
4. Raw Plite: no immediate TipTap-derived must-add row. Non-English hotkey
   fallback is already covered in `packages/plite-dom/test/hotkeys.ts`.

## Ecosystem Synthesis

Steal the invariants, not the ProseMirror machinery. TipTap gives good proof
shapes for deterministic plugin ordering, mark-boundary behavior, non-English
hotkeys, and collab-startup races. It does not justify importing command-chain
API shape, integer positions, NodeView policy, or product demo UI into raw Plite
v2.

The best next value is Plate-side, especially link range, paste pipeline,
markdown/input-rule behavior, serializer output, and Yjs collaboration policy.
Raw Plite already has stronger architecture pressure from Plite, Lexical, and
the current browser harness.
