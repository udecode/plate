# Slate v2 table transform boundary ralplan

Date: 2026-05-18
Status: complete
Owner: Slate Ralplan planning only
Execution owner: `ralph` in `Plate repo root`
Completion id: `019e1fc0-dba0-7de1-9236-b484a144cda6`
Current pass: closure-final-gates
Score: 0.94, ready for Ralph execution

## Verdict

Harsh answer: the table example is currently wrong.

The public hard cut away from `Editable onCommand` was correct, but the follow-up
example rewrite overcorrected into raw `onKeyDown` for behavior that is really
old Slate transform behavior. Backspace, Delete, and Enter are not app hotkeys.
They are model transforms:

- Backspace -> `deleteBackward`
- Delete -> `deleteForward`
- Enter -> `insertBreak`

So table cell boundary behavior should be implemented as extension transform
middleware, not as `event.key` branching inside `<Editable onKeyDown>`.

## Intent And Boundary

| Field                | Record                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Intent               | Restore the Slate mental model after the `onCommand` hard cut: transform-equivalent behavior belongs in editor transforms, not raw keyboard props.                       |
| Desired outcome      | Ralph can update examples/docs/tests so model behavior uses `transforms.*`, while UI-only hotkeys remain raw `Editable onKeyDown`.                                       |
| In scope             | `site/examples/ts/tables.tsx`, adjacent markdown/richtext examples, docs for `Editable onKeyDown` vs extension transforms, and focused public-surface/example contracts. |
| Non-goals            | Reintroducing public `onCommand`; adding `editableKeyCommands`; designing a Plate keymap; implementing a complete table plugin.                                          |
| Decision boundary    | Breaking example/API guidance changes are allowed. Raw Slate stays unopinionated; Plate still owns rich table/keymap product APIs.                                       |
| User decision needed | None for this pass.                                                                                                                                                      |

## Current Live State

| Surface                   | Live source                                                               | Current shape                                                                                                                | Verdict                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Table example             | `/Users/zbeyens/git/slate-v2/site/examples/ts/tables.tsx:103`             | `<Editable onKeyDown>` branches on `event.key === 'Backspace'`, `Delete`, and `Enter`.                                       | Wrong owner. Move to table extension `transforms.deleteBackward`, `deleteForward`, `insertBreak`.       |
| Transform API             | `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:655` | `EditorTransformMiddlewareArgs` includes `deleteBackward`, `deleteForward`, `insertBreak`, and the broader transform family. | Already sufficient. No new core API needed.                                                             |
| Transform dispatch        | `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts:391`     | `deleteBackward`, `deleteForward`, and `insertBreak` route through transform middleware before defaults.                     | This is the correct hook point.                                                                         |
| Checklist example         | `/Users/zbeyens/git/slate-v2/site/examples/ts/check-lists.tsx:85`         | Checklist Backspace is already `defineEditorExtension(... transforms.deleteBackward ...)`.                                   | Good reference shape.                                                                                   |
| Markdown example          | `/Users/zbeyens/git/slate-v2/site/examples/ts/markdown-shortcuts.tsx:92`  | `onKeyDown` handles plain Enter and Backspace model behavior, while the extension already owns `insertText`.                 | Split it: Enter -> `insertBreak`, Backspace -> `deleteBackward`, keep Android flush/event escape hatch. |
| Richtext example          | `/Users/zbeyens/git/slate-v2/site/examples/ts/richtext.tsx:331`           | `handleRichTextKeyDown` mixes Enter model behavior with UI hotkeys for marks/blocks/clear formatting.                        | Move only Enter exit behavior to `transforms.insertBreak`; keep explicit hotkeys in `onKeyDown`.        |
| Images example            | `/Users/zbeyens/git/slate-v2/site/examples/ts/images.tsx:73`              | `mod+a` custom selection is keyboard-specific UI behavior.                                                                   | Keep in `onKeyDown`.                                                                                    |
| Mentions example          | `/Users/zbeyens/git/slate-v2/site/examples/ts/mentions.tsx:98`            | Arrow/Tab/Enter manage an autocomplete UI.                                                                                   | Keep in `onKeyDown`; this is widget UI behavior, not `insertBreak` model policy.                        |
| Code highlighting example | `/Users/zbeyens/git/slate-v2/site/examples/ts/code-highlighting.tsx:115`  | Hotkey converts code block and Tab indents/outdents.                                                                         | Keep as keyboard UI/app shortcut unless a future code-block extension owns it.                          |
| Inlines example           | `/Users/zbeyens/git/slate-v2/site/examples/ts/inlines.tsx:90`             | Left/right override changes navigation unit.                                                                                 | Keep in `onKeyDown`; this is keyboard navigation policy, not delete/break transform equivalence.        |
| Iframe example            | `/Users/zbeyens/git/slate-v2/site/examples/ts/iframe.tsx:86`              | Hotkeys toggle marks in a nested/editor demo.                                                                                | Keep in `onKeyDown`; this is app shortcut glue.                                                         |

## API Target

No new public API is needed.

The API law changes:

```txt
If the behavior corresponds to a Slate transform name, author it through
defineEditorExtension({ transforms: { ... } }).

If the behavior corresponds to a browser/UI shortcut with no Slate transform
equivalent, author it through Editable onKeyDown.
```

### Table Before

```tsx
<Editable
  onKeyDown={(event) => {
    if (event.key === "Backspace") {
      const start = editor.read((state) => state.points.start(cellPath));
      return PointApi.equals(selection.anchor, start);
    }

    if (event.key === "Delete") {
      const end = editor.read((state) => state.points.end(cellPath));
      return PointApi.equals(selection.anchor, end);
    }

    if (event.key === "Enter") {
      return true;
    }
  }}
/>
```

### Table After

```tsx
const table = () =>
  defineEditorExtension<CustomEditor>()({
    name: 'table',
    transforms: {
      deleteBackward({ editor, next, unit }) {
        // Read selection and active table-cell inline, then stop at the cell start.
        next({ unit })
      },
      deleteForward({ editor, next, unit }) {
        // Read selection and active table-cell inline, then stop at the cell end.
        next({ unit })
      },
      insertBreak({ editor, next }) {
        // Read selection and active table-cell inline, then stop Enter in the cell.
        next()
      },
    },
  })

const editor = useSlateEditor({
  extensions: [table()],
  initialValue,
})

<Editable renderElement={Element} renderLeaf={Leaf} />
```

Keep the example checks inline when they are only used once. Do not add a
helper pile just to hide the real Slate calls from the example.

Do not add a generic public `table()` package API in this slice. The example can
own its small `table()` extension.

## Examples To Update

| Example                                   | Change                                                                                                                                                                                           | Status   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| `site/examples/ts/tables.tsx`             | Add example-local `table()` extension with `deleteBackward`, `deleteForward`, `insertBreak`; remove `onKeyDown` entirely unless future UI navigation is added.                                   | required |
| `site/examples/ts/markdown-shortcuts.tsx` | Move Enter heading-exit logic to `transforms.insertBreak`; move Backspace block-reset logic to `transforms.deleteBackward`; keep `transforms.insertText`; keep `onDOMBeforeInput` Android flush. | required |
| `site/examples/ts/richtext.tsx`           | Move Enter exit-block logic to a `richText()` extension with `transforms.insertBreak`; keep clear-formatting, block hotkeys, and mark hotkeys in `onKeyDown`.                                    | required |
| `site/examples/ts/check-lists.tsx`        | Keep as the positive pattern for Backspace model behavior in `transforms.deleteBackward`.                                                                                                        | keep     |
| `site/examples/ts/images.tsx`             | Keep `mod+a` in `onKeyDown`; it is keyboard-specific selection behavior.                                                                                                                         | keep     |
| `site/examples/ts/mentions.tsx`           | Keep autocomplete Arrow/Tab/Enter UI routing in `onKeyDown`; it is widget state, not model `insertBreak`.                                                                                        | keep     |
| `site/examples/ts/code-highlighting.tsx`  | Keep hotkeys/Tab in `onKeyDown` for now; future code-block productization belongs to Plate or a dedicated code extension, not this table boundary slice.                                         | keep     |
| `site/examples/ts/inlines.tsx`            | Keep left/right navigation override in `onKeyDown`.                                                                                                                                              | keep     |
| `site/examples/ts/iframe.tsx`             | Keep local hotkeys in `onKeyDown`.                                                                                                                                                               | keep     |

## Docs To Update

| File                                                                             | Required change                                                                                                                                                              |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/editable.md`             | Clarify `onKeyDown` is for raw browser/UI events and shortcuts; do not use it for behaviors that map to `deleteBackward`, `deleteForward`, `insertBreak`, `insertText`, etc. |
| `/Users/zbeyens/git/slate-v2/docs/concepts/08-plugins.md`                        | Add transform middleware examples for structural edit policy such as table cells, checklist Backspace, markdown Backspace/Enter.                                             |
| `/Users/zbeyens/git/slate-v2/docs/walkthroughs/05-executing-commands.md`         | Show hotkeys calling semantic app helpers in `onKeyDown`, but show transform-equivalent behavior in `defineEditorExtension({ transforms })`.                                 |
| `/Users/zbeyens/git/slate-v2/docs/walkthroughs/04-applying-custom-formatting.md` | Keep mark hotkeys in `onKeyDown`; add a short note that model-boundary edits use transform middleware.                                                                       |

## Tests And Proof

Ralph should add or update tests around behavior, not just deleted code.

Required proof:

- `packages/slate/test/extension-methods-contract.ts`: already proves transform middleware coverage for `deleteBackward`, `deleteForward`, and `insertBreak`; extend only if table-specific behavior needs a reusable package test.
- `packages/slate-react/test/surface-contract.tsx`: update docs/example contract so the tables/markdown/richtext examples teach transform middleware for transform-equivalent model behavior.
- New focused example contract if useful: table extension prevents `deleteBackward`, `deleteForward`, and `insertBreak` from escaping the active cell when selection is at the corresponding boundary.
- `bun --filter slate-react test:vitest -- surface-contract keyboard-input-strategy-contract editable-behavior`
- `bun --filter slate typecheck`
- `bun --filter slate-react typecheck`
- `bun typecheck:site`
- `bun check`

Browser proof is not mandatory for this planning pass, but Ralph should add it
if any runtime input routing changes beyond examples/docs/tests.

## Decision Brief

Principles:

1. Raw Slate keeps transform names as the source of truth for model behavior.
2. React event props remain raw escape hatches and app/UI shortcut hooks.
3. Cutting `onCommand` must not push old Slate transform behavior into
   keyboard-only handlers.
4. Plate owns rich keymap/table/product APIs; raw Slate examples should teach
   low-level Slate primitives.

Top drivers:

1. Legacy Slate developers expect `deleteBackward`, `deleteForward`, and
   `insertBreak` override behavior to survive as the transform middleware path.
2. DOM `beforeinput`, browser handles, programmatic calls, and tests can invoke
   these transforms without a keyboard event.
3. Example code is public API pedagogy; bad examples become bad ecosystem law.

Viable options:

| Option                                                                                           | Pros                                                     | Cons                                                                                | Verdict |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------- |
| Keep `event.key` in examples                                                                     | Simple after `onCommand` cut.                            | Keyboard-only, misses beforeinput/programmatic paths, regresses Slate mental model. | reject  |
| Reintroduce public `onCommand`                                                                   | Semantic event boundary.                                 | Reopens product command DSL raw Slate just hard-cut.                                | reject  |
| Add public `editableKeyCommands`/keymap                                                          | Feature packaging convenience.                           | Plate-shaped API in raw Slate.                                                      | reject  |
| Use `transforms.*` middleware for transform-equivalent behavior and `onKeyDown` for UI shortcuts | Slate-ish, no new API, covers programmatic/native paths. | Examples split behavior across extension and component.                             | choose  |

Consequences:

- Some examples get a small local extension even when the behavior is tiny.
- `onKeyDown` docs must be more precise: it is not the replacement for
  `onCommand`.
- Table remains an example, not a full table plugin.

## Ecosystem Strategy Synthesis

| System       | Source                                                                                                   | Mechanism                                                   | Avoids                                             | Steal                                                               | Reject                                       | Slate target                                                                                | Verdict                            |
| ------------ | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| Legacy Slate | `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts:391` and transform middleware contracts | Delete/break methods route through editor-level middleware. | Keyboard-only behavior and DOM/model divergence.   | Transform override feel without monkeypatching root editor methods. | Mutable method reassignment.                 | `defineEditorExtension({ transforms })` for `deleteBackward`/`deleteForward`/`insertBreak`. | agree                              |
| ProseMirror  | `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`                  | Transactions own state changes; view/input owns DOM events. | Mixing DOM event branches with model policy.       | Keep model behavior in transaction/editor layer.                    | ProseMirror plugin complexity.               | Raw event props for UI, transforms for model edits.                                         | agree                              |
| Lexical      | `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`                     | Commands/transforms run in update lifecycle.                | App-level key events becoming the mutation engine. | Extension/runtime lifecycle discipline.                             | Public dispatch-command as app mutation API. | `editor.update` plus transform middleware.                                                  | partial                            |
| Tiptap       | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`                         | Product extensions package commands and shortcuts.          | Scattered feature setup.                           | Let Plate own rich table/keymap packaging later.                    | Raw Slate keymap/plugin DSL.                 | Example-local low-level extensions; Plate product APIs above.                               | diverge for Slate, agree for Plate |

## Issue Accounting

ClawSweeper pass: applied, ledger/cache first. No broad live GitHub read was
needed because the touched issue rows already exist in the generated live ledger,
manual sync ledger, issue coverage matrix, fork dossier, and PR reference.

Generated live rows read:

- `docs/slate-issues/gitcrawl-live-open-ledger.md:21` for `#6034`
- `docs/slate-issues/gitcrawl-live-open-ledger.md:37` for `#5961`
- `docs/slate-issues/gitcrawl-live-open-ledger.md:127` for `#4658`
- `docs/slate-issues/gitcrawl-live-open-ledger.md:167` for `#3408`
- `docs/slate-issues/gitcrawl-live-open-ledger.md:238` for `#5355`
- `docs/slate-issues/gitcrawl-live-open-ledger.md:369` for `#2558`
- `docs/slate-issues/gitcrawl-live-open-ledger.md:588` and `:589` for
  `#3586` and `#3568`
- `docs/slate-issues/gitcrawl-live-open-ledger.md:387` for `#4681`

Manual sync rows read:

- `docs/slate-issues/gitcrawl-v2-sync-ledger.md:23` for `#6034`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md:39` for `#5961`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md:129` for `#4658`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md:169` for `#3408`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md:240` for `#5355`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md:371` for `#2558`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md:389`, `:590`, and `:591`
  for `#4681`, `#3586`, and `#3568`

No new fixed or improved issue claim is accepted by this plan.

| Issue                       | Cluster                     | Claim                      | Why                                                                                                                                                                  | Proof route                                                                                             | V2 sync ledger                                                   | PR line                         |
| --------------------------- | --------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------- |
| `#6034`                     | table DOM selection         | existing `Fixes` unchanged | Existing claim is ArrowDown at the final table cell. This plan changes Backspace/Delete/Enter authoring ownership and must not broaden that claim.                   | Existing `apps/www/tests/slate-browser/donor/examples/tables.test.ts` row plus issue coverage matrix. | unchanged `fixes-claimed`                                        | existing fixed line only        |
| `#4658`                     | table boundary / DOM import | Related, unchanged         | Local table transform policy can reduce table escape routes, but the issue asks about text outside a custom table and needs its exact repro.                         | Future browser repro or DOM bridge proof.                                                               | unchanged `cluster-synced`                                       | related matrix already has row  |
| `#5355`                     | table DOM shape             | Not claimed, unchanged     | `colgroup` / `col` crash depends on app-rendered DOM without editable descendants, not Backspace/Delete/Enter transform ownership.                                   | Existing DOM selection boundary plan.                                                                   | unchanged `issue-reviewed`                                       | not-claimed row already has row |
| `#2558`                     | table selection model       | Not claimed, unchanged     | Multi-cell selection requires a real table selection model. This plan does not add one.                                                                              | Future table-selection model proof.                                                                     | unchanged `cluster-synced`                                       | not-claimed row already has row |
| `#3408`                     | structural delete           | Related, unchanged         | Delete-backward table/list replacement pressure stays structural-delete/core behavior. This plan routes example policy through middleware only.                      | Future exact repro, if any.                                                                             | unchanged `issue-reviewed`                                       | no new row                      |
| `#5961`                     | keydown render warning      | Related, not claimed       | Raw Slate still keeps `Editable onKeyDown` for UI shortcuts; moving transform-equivalent behavior out of `onKeyDown` does not reproduce or fix the DevTools warning. | Repro-first only.                                                                                       | unchanged `triage-closed` with this plan covered in fork dossier | related matrix already has row  |
| `#3568` / `#3586` / `#4681` | native input boundary       | Related, unchanged         | Public `onCommand` stays cut and `onDOMBeforeInput` stays native escape hatch; this plan only narrows examples.                                                      | Existing native input boundary proof.                                                                   | unchanged `cluster-synced`                                       | related rows already have rows  |

Fork dossier sync:

- Appended `Table Transform Boundary Ralplan - 2026-05-18` to
  `docs/slate-v2/ledgers/fork-issue-dossier.md`.

Issue coverage matrix sync:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md` unchanged. Existing rows
  cover every reviewed issue classification, and adding duplicate rows would
  make the ledger worse.

PR reference sync:

- Updated `docs/slate-v2/references/pr-description.md` summary, accepted native
  input boundary shape, and proof references. New exact fixed/improved claims:
  `0`.

## Applicable Implementation Review Matrix

| Lens                       | Applicability | Finding                                                                                                                                  | Plan delta                                                     |
| -------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Vercel React               | applied       | Moving model behavior out of `onKeyDown` reduces component-level event logic and keeps React as projection/event host, not model engine. | Docs should keep `onKeyDown` for UI-only shortcuts.            |
| performance-oracle         | applied       | Transform middleware executes only on relevant model commands; it is no worse than keydown branching and covers more ingress paths.      | No hot-path registry or keymap layer.                          |
| tdd                        | applied       | Behavior needs public-interface proof through transforms, not grep-only tests for removed `event.key` code.                              | Require table boundary behavior tests if implemented.          |
| shadcn-style composability | applied       | Minimal app component props; behavior packaged in small extension factory.                                                               | Example becomes `extensions: [table()]` plus raw render props. |
| react-useeffect            | skipped       | No effect or external-system lifecycle change.                                                                                           | No change.                                                     |

## High-Risk Pre-Mortem

| Failure                                                       | Why it could happen                                         | Mitigation                                                                    | Proof                                                                                                  |
| ------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Table delete behavior regresses for keyboard users            | Transform helper checks wrong path or boundary.             | Use one helper for active cell and boundary checks; test collapsed start/end. | Focused table behavior test plus site typecheck.                                                       |
| Beforeinput/programmatic behavior still bypasses table policy | Implementation leaves logic in `onKeyDown`.                 | Remove transform-equivalent branches from `onKeyDown`.                        | Tests call `Editor.deleteBackward`, `Editor.deleteForward`, `Editor.insertBreak`, not just key events. |
| Examples become over-abstracted                               | A tiny example turns into a fake table plugin framework.    | Keep helper local and small; no public package API.                           | Diff review and docs wording.                                                                          |
| Hotkey examples get overcorrected                             | Agent moves mark/block shortcuts into transform middleware. | Classify only transform-equivalent keys as required moves.                    | Example update matrix above.                                                                           |

## Maintainer Objection Ledger

| Change                                                           | Objection                                       | Steelman                                                | Answer                                                                                                                                                        | Verdict |
| ---------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Move table Backspace/Delete/Enter from `onKeyDown` to transforms | "This is more boilerplate for a basic example." | The current code is short and obvious.                  | It is also wrong: Backspace/Delete/Enter are Slate transform semantics and should cover beforeinput/programmatic paths. Checklist already teaches this shape. | keep    |
| Keep mark/block hotkeys in `onKeyDown`                           | "Shouldn't all commands move to transforms?"    | A fully packaged command/keymap system composes better. | That is Plate's job. Raw Slate hotkeys can call app helpers; only transform-equivalent model behavior must move.                                              | keep    |
| No new table package API                                         | "Tables deserve a real extension."              | Real table editing is complex and product-shaped.       | Correct, but this slice only fixes example architecture. Plate can own the rich table plugin.                                                                 | keep    |

## Pass-State Ledger

| Pass                              | Status   | Evidence added                                                                                                                                                           | Plan delta                                                          | Open issues | Next owner                        |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ----------- | --------------------------------- |
| current-state-read                | complete | Live `tables.tsx`, transform middleware types, transform dispatch, checklist/markdown/richtext examples, and compiled research pages.                                    | Initial API law, examples-to-update matrix, proof gates, and score. | none        | related-issue-discovery           |
| related-issue-discovery           | complete | Generated live ledger, manual sync ledger, issue coverage matrix, fork dossier, PR reference, and test-candidate map rows for table/input/keydown/delete/break surfaces. | Related issue matrix recorded.                                      | none        | issue-ledger-pass                 |
| issue-ledger-pass                 | complete | `#6034`, `#4658`, `#5355`, `#2558`, `#3408`, `#5961`, `#3568`, `#3586`, and `#4681` classified.                                                                          | No new `Fixes`/`Improves`; existing ledgers reused.                 | none        | decision/research/pressure passes |
| decision/research/pressure passes | complete | Live source, ProseMirror/Lexical/Tiptap research pages, PR reference, and API naming records.                                                                            | Score raised after evidence-backed no-new-API decision.             | none        | objection/high-risk/revision      |
| objection/high-risk/revision      | complete | Steelman and high-risk rows retained; proof plan expanded to require transform-call tests, not keydown-only tests.                                                       | Keep chosen API law; no extra keymap/command API.                   | none        | issue-sync-accounting             |
| issue-sync-accounting             | complete | Fork dossier appended; PR reference updated; coverage matrix intentionally unchanged.                                                                                    | Current issue/accounting docs synced without duplicate rows.        | none        | closure-final-gates               |
| closure-final-gates               | complete | Completion gates checked in this plan; `node tooling/scripts/completion-check.mjs` remains the hook proof after completion state update.                                 | Ready for Ralph execution.                                          | none        | none                              |

## Scorecard

| Dimension                             | Score | Evidence                                                                                                                                                                                                                     |
| ------------------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React/runtime performance             |  0.93 | Model behavior leaves component-level key branching and uses existing transform middleware dispatch at `packages/slate/src/create-editor.ts:391`; no new registry or global listener.                          |
| Slate-close unopinionated DX          |  0.96 | Keeps old Slate mental model through current `transforms.deleteBackward`, `deleteForward`, and `insertBreak` middleware at `packages/slate/src/interfaces/editor.ts:655`, without `onCommand` or a keymap DSL. |
| Plate/slate-yjs migration backbone    |  0.91 | Raw Slate stays low-level; Plate owns product keymaps/table plugins per `docs/slate-v2/references/pr-description.md:227` and `:240`. No collab/data-model change is introduced.                                              |
| Regression-proof testing strategy     |  0.94 | Tests must invoke `Editor.deleteBackward`, `Editor.deleteForward`, and `Editor.insertBreak` / equivalent public commands, plus surface docs contracts and site typecheck.                                                    |
| Research evidence completeness        |  0.93 | Ecosystem synthesis cites compiled Lexical, ProseMirror, and Tiptap pages plus live Slate v2 source and current issue ledgers.                                                                                               |
| shadcn-style composability/minimalism |  0.94 | Example-local `table()` extension, raw `Editable render*`, no nested product registry, no `editableKeyCommands`.                                                                                                             |

Total score: `0.94`.

Status is `complete` for planning. The next owner is Ralph implementation in
`Plate repo root`.

## Ralph Implementation Phases

1. Rewrite `tables.tsx` to add `table()` extension and remove
   transform-equivalent `onKeyDown` branches.
2. Rewrite `markdown-shortcuts.tsx` so Enter/Backspace behavior lives in
   `transforms.insertBreak` / `transforms.deleteBackward`.
3. Rewrite `richtext.tsx` so Enter exit behavior lives in extension
   `transforms.insertBreak`; keep mark/block shortcut hotkeys in `onKeyDown`.
4. Update docs to state the transform-vs-event boundary.
5. Add/adjust behavior contracts and surface contracts.
6. Run `/Users/zbeyens/git/slate-v2`: focused tests, package typechecks,
   `bun typecheck:site`, and `bun check`.
7. Sync `plate-2` issue/reference docs only if claims or accepted API narrative
   change.

## Hard Cuts And Rejected Alternatives

- Do not reintroduce public `Editable onCommand` or `EditableCommand*`.
- Do not add `editableKeyCommands`, `capabilities`, `keymap`, or
  `keyboardShortcuts` to raw Slate for this problem.
- Do not turn the example-local `table()` helper into a public table package API.
- Do not move UI-only hotkeys into transform middleware just to chase symmetry.
- Do not add a new fixed issue claim for this plan.

## Plan Deltas From Review

- Strengthened the verdict from "table example is wrong" to the API law:
  transform-equivalent behavior goes through `transforms.*`; UI shortcuts stay
  in `onKeyDown`.
- Added full issue accounting and fork dossier sync.
- Updated the PR reference to include the table transform boundary.
- Raised testing requirements from keydown behavior to transform-call behavior.
- Kept `onKeyDown` for mentions, image select-all, inlines navigation, iframe
  hotkeys, and code demo hotkeys.

## Open Questions

None for the planning lane.

What would change the decision:

- If Slate later adds a first-class raw table package, the example-local
  `table()` helper should move into that package.
- If a future issue proves a transform middleware path cannot cover native
  beforeinput/programmatic calls, the middleware dispatch contract is the bug,
  not a reason to go back to `onKeyDown`.

## Fast Driver Gates

- `/Users/zbeyens/git/slate-v2`: `bun --filter slate-react test:vitest -- surface-contract keyboard-input-strategy-contract editable-behavior`
- `/Users/zbeyens/git/slate-v2`: `bun --filter slate typecheck`
- `/Users/zbeyens/git/slate-v2`: `bun --filter slate-react typecheck`
- `/Users/zbeyens/git/slate-v2`: `bun typecheck:site`
- `/Users/zbeyens/git/slate-v2`: `bun check`
- `/Users/zbeyens/git/plate-2`: `node tooling/scripts/completion-check.mjs` after Slate Ralplan closure, not during pending passes.

## Ralph Execution Result

Status: implemented in `/Users/zbeyens/git/slate-v2`.

Files changed:

- `site/examples/ts/tables.tsx`
- `site/examples/ts/markdown-shortcuts.tsx`
- `site/examples/ts/richtext.tsx`
- `docs/libraries/slate-react/editable.md`
- `docs/concepts/08-plugins.md`
- `docs/walkthroughs/05-executing-commands.md`
- `docs/walkthroughs/04-applying-custom-formatting.md`
- `packages/slate-react/test/surface-contract.tsx`
- `packages/slate-react/test/editable-behavior.tsx`
- `docs/solutions/logic-errors/2026-05-09-heading-start-enter-must-normalize-split-block-type.md`

Proof:

- Red gate: `bun --filter slate-react test:vitest -- surface-contract` failed
  on the old table keydown example.
- Green gate: `bun --filter slate-react test:vitest -- surface-contract`
  passed.
- Focused gate:
  `bun --filter slate-react test:vitest -- surface-contract keyboard-input-strategy-contract editable-behavior`
  passed.
- Type gates passed:
  `bun --filter slate typecheck`, `bun --filter slate-react typecheck`,
  `bun typecheck:site`.
- Lint/format gate passed: `bun lint:fix`.
- Full fast gate passed: `bun check`.

Diff-review verdict: no must-fix issue found. Remaining `onKeyDown` rows are UI
hotkeys or tests/docs that intentionally describe UI hotkeys; no Backspace,
Delete, or Enter table/markdown/richtext model behavior remains in raw keydown.

Compound learning: updated the existing heading-start Enter solution note so it
points at `transforms.insertBreak` instead of the stale keydown owner.

## Final User-Review Handoff

Accepted handoff:

- API law: transform-equivalent behavior moves to `transforms.*`.
- Public API: no new core/slate-react API.
- Table example: `onKeyDown` boundary branches -> local `table()` extension.
- Markdown/richtext examples: Enter/Backspace model behavior -> transforms.
- Keep list: UI-only hotkeys, mentions autocomplete, inlines navigation,
  images `mod+a`, iframe hotkeys, code demo hotkeys remain `onKeyDown`.
- Proof: focused transform behavior tests, surface docs tests, site typecheck,
  and `bun check`.

Before/after shape:

```tsx
// Before: keyboard-only event branch
<Editable
  onKeyDown={(event) => {
    if (event.key === "Backspace") return isAtStartOfTableCell(editor);
    if (event.key === "Delete") return isAtEndOfTableCell(editor);
    if (event.key === "Enter") return isInTableCell(editor);
    return false;
  }}
/>
```

```tsx
// After: Slate model transform middleware
const table = () =>
  defineEditorExtension<CustomEditor>()({
    name: "table",
    transforms: {
      deleteBackward({ editor, next, unit }) {
        if (isAtStartOfTableCell(editor)) return;
        next({ unit });
      },
      deleteForward({ editor, next, unit }) {
        if (isAtEndOfTableCell(editor)) return;
        next({ unit });
      },
      insertBreak({ editor, next }) {
        if (isInTableCell(editor)) return;
        next();
      },
    },
  });
```

## Final Completion Gates

- [x] Related issue discovery complete.
- [x] Issue ledger and PR reference synced or explicitly unchanged.
- [x] ClawSweeper related-issue pass complete through existing ledgers and fork
      dossier append.
- [x] All review passes complete.
- [x] Score `>= 0.92`, no dimension below `0.85`.
- [x] No public API surface left in maybe-language.
- [x] No new fixed/improved issue claim added.
- [x] Final handoff includes accepted decisions and before/after shape.
- [x] Completion state may be marked `done` for the planning lane.
