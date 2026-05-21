---
date: 2026-05-05
topic: slate-v2-best-pasting-strategy-ralplan
status: complete
owner: slate-ralplan
source_skill: .agents/skills/slate-ralplan/SKILL.md
---

# Slate v2 Best Pasting Strategy Ralplan

## 1. Current Verdict

Hard take: Slate v2 should keep the current clipboard ownership split, but the
actual insertion engine is wrong for large paste.

Keep:

- `slate-react` owns browser paste/copy/cut/drop event dispatch.
- `slate-dom` owns `DataTransfer`, internal fragment formats, DOM coverage, and
  browser payload policy.
- `slate` owns model fragment extraction, fitting, insertion, normalization,
  history, and collaboration-ready operations.
- Product HTML/image/table paste remains app or Plate policy, not raw Slate
  core.

Change:

- Multiline plain-text paste must stop doing `splitNodes + insertText` once per
  line.
- Rich fragment paste must stop relying on many `insert_node` operations as the
  long-term path.
- Paste should compile into a single canonical insertion slice, fit once, and
  apply as one model replacement transaction.
- The public API should not grow `editor.clipboard` or a magical `editor.paste`.
  If a richer app API ships, it should be a DOM clipboard provider adapter under
  `editor.dom.clipboard`, after the internal path is proven.

Best target:

```txt
DataTransfer
  -> ordered paste candidates
  -> canonical InsertionSlice
  -> fit once against target/schema/void/readOnly policy
  -> single replace-fragment transaction/op
  -> one history item
  -> one model-owned selection repair
  -> bounded normalization over affected boundary paths
```

Not the target:

```txt
DataTransfer
  -> split text into N lines
  -> splitNodes N times
  -> insertText N times
  -> normalize and transform dirty paths through thousands of operations
```

## 2. Intent And Boundaries

Intent:

- Make paste a first-class Slate v2 runtime path, not an accidental loop over
  typing commands.
- Resolve the performance owner behind #5945 without corrupting the already good
  clipboard trust-boundary work.
- Preserve Slate's unopinionated core while giving Plate and apps a sane paste
  extension point.

Desired outcome:

- A 10,000-line plain-text paste uses one bulk model action, not roughly 30,000
  tiny editing operations.
- Rich Slate fragment paste uses a canonical fragment replacement path.
- App-owned paste behavior is explicit, ordered, cancellable when async appears,
  and unable to accidentally import foreign Slate internals.

In scope:

- Plain-text paste.
- Slate fragment paste.
- Internal paste candidate decoding.
- Internal insertion slice/fitting.
- Bulk operation/transaction design.
- Normalization and dirty-path bounds.
- Browser proof for paste, undo, selection, IME guard, and DOM coverage.
- Issue accounting for #5945, #4056, #5992, #2195, #6038, and existing
  clipboard serialization rows.

Non-goals:

- No raw Slate rich HTML/table/image serializer.
- No product-level paste cleanup API in core.
- No virtualization as a paste fix.
- No public `editor.clipboard` namespace.
- No exact issue closure without current repro plus benchmark proof.

Decision boundaries:

- This plan may decide internal architecture, operation shape, public API
  posture, and proof gates.
- It may not claim #5945, #4056, or #5992 fixed until the implementation passes
  the exact workload gates.

Unresolved user decision:

- None for planning. Execution can start with the internal engine and keep
  public provider API unstable/private until proof lands.

## 3. Decision Brief

Principles:

1. Paste is not typing. It deserves its own command and operation path.
2. Clipboard transport is a trust boundary.
3. Core should fit model content, not parse product HTML.
4. Performance claims need workload numbers, not vibes.
5. Collaboration/history must see one logical paste, not thousands of fake user
   actions.

Top drivers:

- #5945: 10,000 newline-separated rows pasted into Slate is too slow.
- Current benchmark: insertion dominates; split/encode/decode/copy are cheap.
- Ecosystem evidence: ProseMirror, Tiptap, and VS Code all use bulk replacement
  as the main paste path.

Viable options:

| Option                                                              | Verdict           | Reason                                                                                                                               |
| ------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Keep current loop and micro-optimize                                | reject            | Current 2,000-line plain-text paste is `3545.36ms`; caching inside the loop is not enough.                                           |
| Convert plain text to a fragment, then use current `insertFragment` | reject as final   | A prebuilt-fragment candidate was already slower in the bounded benchmark; current fragment insertion still emits many insertions.   |
| Batch N low-level ops under one normalization pass                  | transitional only | Better than today, but still leaves collaboration/history/path-transform pressure proportional to pasted lines.                      |
| Add a single replace-fragment transaction/op                        | choose            | Matches VS Code one edit per selection, ProseMirror one replace step, and Tiptap `replaceWith`; it is the cleanest long-term engine. |
| Use virtualization/staged rendering to hide paste cost              | reject            | Virtualization affects DOM/render cost, not model insertion or normalization cost.                                                   |

Chosen option:

- Add an internal `InsertionSlice` plus a bulk `replace_fragment` model action.
- Keep single-line text on `insertText`.
- Route multiline plain text and rich fragments through slice fitting and one
  replacement transaction.

Consequences:

- Operation schema or transaction internals need a real design pass.
- slate-yjs needs a mapping story before this can be a stable public operation.
- Browser and benchmark proof must land before any issue closure.

Follow-ups:

- Decide whether the new bulk action is a public `Operation` union member or an
  internal transaction macro that adapters can lower.
- Add a provider/candidate API only after the internal engine is green.

## 4. Confidence Scorecard

| Dimension                              | Score | Evidence                                                                                                                                                                                                                                                     |
| -------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| React 19.2 runtime performance         |  0.91 | React does not own the bottleneck; current path is in Slate DOM/core insertion. Browser contract already names paste-normalize-undo in `.tmp/slate-v2/packages/slate-browser/src/core/first-party-browser-contracts.ts:178`.                                 |
| Slate-close unopinionated DX           |  0.93 | Keeps raw Slate free of product HTML policy and keeps low-level clipboard under `editor.dom.clipboard`, matching `docs/slate-v2/references/pr-description.md:231`.                                                                                           |
| Plate and slate-yjs migration backbone |  0.89 | One logical paste maps better to collaboration/history than N fake typing actions. Replay through the collaboration import path is proven; transport-specific CRDT lowering stays adapter-owned.                                                             |
| Regression-proof testing strategy      |  0.94 | Existing unit/browser owners exist: `.tmp/slate-v2/packages/slate/test/clipboard-contract.ts:18` and browser paste-normalize-undo at `.tmp/slate-v2/packages/slate-browser/src/core/first-party-browser-contracts.ts:178`; new benchmark gates are explicit. |
| Research evidence completeness         |  0.95 | Live source read across Slate v2, Lexical, ProseMirror, Tiptap, and VS Code; mechanisms are synthesized below instead of name-dropped.                                                                                                                       |
| shadcn-style composability/minimalism  |  0.90 | Public surface stays small; richer provider API is delayed until proof, not shoved into core now.                                                                                                                                                            |

Weighted score: `0.923`.

Completion verdict: ready for execution. No public API is stable until proof
lands.

## 5. Current Slate v2 Source Grounding

Current paste dispatch:

- `.tmp/slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts:141`
  materializes DOM coverage boundaries with `selectionPolicy === 'materialize'`
  before paste.
- `.tmp/slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts:485`
  owns `applyEditablePaste`.
- The shell-backed full-document plain-text special case already exists in the
  React clipboard strategy.

Current DOM clipboard import:

- `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts:228`
  runs `dom.clipboard.insertData` handlers first.
- `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts:247`
  imports trusted Slate fragments.
- `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts:269`
  is the current plain-text fallback.
- `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts:276`
  splits text by newline.
- `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts:280`
  loops every line, splitting nodes and inserting text.

Current core fragment insert:

- `.tmp/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts:160`
  fits a single empty text-block target without inserting the fragment wrapper.
- `.tmp/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts:208`
  fits exact whole-top-level-block selections by replacing the root child slice
  while keeping structural fragments as sibling units.
- `.tmp/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts:261`
  fits compatible single text-block targets, including marked text and inline
  children, by replacing the target block children.
- `.tmp/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts:411`
  handles full-document fragment replacement through one `replace_fragment`
  operation instead of a snapshot shortcut.
- `.tmp/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts:473`
  applies single text-block fitting through one `replace_fragment` at the target
  block path.
- `.tmp/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts:491`
  applies exact whole-top-level-block structural fitting through one
  `replace_fragment` at the root path.
- `.tmp/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts:562`
  walks fragment nodes into `starts`, `middles`, and `ends`.
- `.tmp/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts:640`,
  `:653`, and `:661` insert those groups with `insertNodes` for shapes that
  still fall back to structural insertion.

Current insertion and normalization pressure:

- `.tmp/slate-v2/packages/slate/src/transforms-node/insert-nodes.ts:121` batches
  dirty-path collection, but it still applies one `insert_node` operation per
  child at `:128`.
- `.tmp/slate-v2/packages/slate/src/editor/normalize.ts:42` skips default text
  normalization only for `insert_text` and `remove_text`; multiline paste creates
  split/insert chains that miss this cheap path.
- `.tmp/slate-v2/packages/slate/src/transforms-text/insert-text.ts:89` still
  uses `replaceSnapshot` for full-document expanded text replacement; this is
  outside the current paste fragment path.

Current benchmark:

- `.tmp/slate-v2/tmp/slate-clipboard-large-payload-benchmark.json` says 2,000
  pasted lines average:
  - `plainTextSplitMs`: `0.05ms`
  - `fullSelectionCopyMs`: `5.25ms`
  - `plainTextInsertMs`: `3545.36ms`
  - `fragmentInsertMs`: `4615.83ms`
  - `plainTextInsert` operation count: `5998`

Conclusion:

- The hot path is model insertion/normalization/operation churn. The newline
  split is noise.

## 6. Ecosystem Strategy Synthesis

### Lexical

Sources:

- `../lexical/packages/lexical-clipboard/src/clipboard.ts:130`
- `../lexical/packages/lexical/src/LexicalSelection.ts:747`
- `../lexical/packages/lexical/src/LexicalUpdates.ts:253`
- `../lexical/packages/lexical/src/LexicalNormalization.ts:59`

Observed mechanism:

- Lexical prioritizes internal JSON, HTML, then plain text in clipboard import.
- Plain-text raw insertion builds nodes from text once, then inserts nodes.
- Dirty leaves and elements drive transforms; text normalization checks local
  siblings only.

Problem it avoids:

- It avoids whole-document normalization for ordinary dirty text edits.

Slate target:

- Steal dirty leaf/element buckets and local text normalization pressure.
- Do not copy the class node model or `$function` public style.
- Do not copy Lexical's rich-text plain paste loop as the final answer; Slate's
  10,000-line target needs a bulk replacement path.

Verdict: `partial`.

### ProseMirror

Sources:

- `../prosemirror/view/src/clipboard.ts:43`
- `../prosemirror/view/src/clipboard.ts:96`
- `../prosemirror/view/src/input.ts:634`
- `../prosemirror/model/src/replace.ts:24`
- `../prosemirror/transform/src/replace.ts:378`

Observed mechanism:

- Clipboard content becomes a `Slice`.
- Foreign HTML/plain-text is normalized to a coherent slice before insertion.
- Paste dispatch uses one `replaceSelection` or `replaceSelectionWith` step.
- The fitter tries to place/wrap/drop slice content into the target structure.

Problem it avoids:

- It does structural fitting once, not through repeated typing-like commands.

Slate target:

- Steal the slice/fitter idea.
- Keep Slate paths/ranges and JSON nodes; do not adopt integer positions or
  ProseMirror's schema-first mental model.

Verdict: `agree`.

### Tiptap

Sources:

- `../tiptap/packages/core/src/commands/insertContentAt.ts:127`
- `../tiptap/packages/core/src/commands/insertContentAt.ts:157`
- `../tiptap/packages/core/src/commands/insertContentAt.ts:180`
- `../tiptap/packages/core/src/commands/insertContentAt.ts:194`
- `../tiptap/packages/core/src/PasteRule.ts:114`
- `../tiptap/packages/core/src/Editor.ts:531`
- `../tiptap/packages/core/src/ExtensionManager.ts:285`

Observed mechanism:

- `insertContentAt` parses once, validates once, uses `tr.insertText` for pure
  text, and `tr.replaceWith` for structural content.
- Paste rules run over inserted ranges using transaction mapping.
- Extension transforms compose cleanly.

Problem it avoids:

- It keeps app authoring ergonomic without turning the editor core into an HTML
  policy bucket.

Slate target:

- Steal the split between text-only fast path, structural replacement, and
  post-insert paste rules.
- Reject pretending Tiptap is a distinct core algorithm; the useful part here is
  extension DX on top of ProseMirror's replace machinery.

Verdict: `agree`.

### VS Code

Sources:

- `../vscode/src/vs/editor/common/cursor/cursorTypeEditOperations.ts:654`
- `../vscode/src/vs/editor/common/cursor/cursorTypeEditOperations.ts:707`
- `../vscode/src/vs/editor/common/model/textModel.ts:1340`
- `../vscode/src/vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer.ts:243`
- `../vscode/src/vs/editor/contrib/dropOrPasteInto/browser/copyPasteController.ts:323`
- `../vscode/src/vs/editor/contrib/dropOrPasteInto/browser/copyPasteController.ts:625`
- `../vscode/src/vscode-dts/vscode.d.ts:6346`

Observed mechanism:

- Plain paste becomes one `ReplaceCommand` per selection, with undo stack
  boundaries before/after.
- The text model validates operations and applies them through a bulk text
  buffer.
- The paste-as pipeline is provider-based, MIME-filtered, cancellable, and
  falls back to the default paste handler when custom providers do not own the
  payload.
- Providers can prepare copy metadata, provide paste edits, and resolve lazy
  paste edits.

Problem it avoids:

- It does not represent a large paste as thousands of single-line commands.
- It prevents async paste providers from applying stale edits after editor state
  changes.

Slate target:

- Steal one edit per selection, undo grouping, provider cancellation, MIME
  filtering, and default fallback.
- Reject the piece tree text buffer as a Slate model replacement.
- Reject text-only assumptions for rich fragments.

Verdict: `agree`.

## 7. Public API Target

Immediate public shape:

- Keep `editor.dom.clipboard`.
- Keep low-level browser payload import/export under DOM capability ownership.
- Keep `dom.clipboard.insertData` as the currently accepted low-level escape
  hatch until the provider pipeline is proven.
- Do not add `editor.clipboard`.
- Do not add public `editor.paste`.
- Do not expose `InsertionSlice` until the internal engine passes browser and
  benchmark gates.

Future provider shape, unstable only:

```ts
type DOMClipboardPasteProvider<V extends Value = Value> = {
  id: string;
  pasteMimeTypes?: readonly string[];
  priority?: "default" | "app" | "internal";
  preparePaste?: (
    context: DOMClipboardPreparePasteContext<V>,
  ) => void | Promise<void>;
  providePaste?: (
    context: DOMClipboardPasteContext<V>,
  ) =>
    | DOMClipboardPasteCandidate<V>
    | null
    | Promise<DOMClipboardPasteCandidate<V> | null>;
  resolvePaste?: (
    candidate: DOMClipboardPasteCandidate<V>,
    context: DOMClipboardPasteContext<V>,
  ) => DOMClipboardPasteCandidate<V> | Promise<DOMClipboardPasteCandidate<V>>;
};
```

DX rules:

- Internal trusted Slate fragment candidate wins by default when the format key
  matches and the payload validates.
- App providers may override only explicitly.
- Plain text remains the final default provider.
- Provider cancellation is required before async paste ships.
- Paste rules run after canonical insertion, over the inserted model range.

## 8. Internal Runtime Target

Add an internal model:

```ts
type InsertionSlice<V extends Value = Value> = {
  fragment: Descendant[];
  openStart: number;
  openEnd: number;
  source: "slate-fragment" | "html" | "plain-text" | "file" | "custom";
  text?: string;
};
```

Add a paste plan:

```ts
type PastePlan<V extends Value = Value> = {
  at: Range;
  slice: InsertionSlice<V>;
  select: "end" | "preserve" | "range";
  source: "paste";
};
```

Add one bulk model action:

```ts
editor.update((tx) => {
  tx.fragment.replace({
    at: tx.selection.get(),
    slice,
    source: "paste",
  });
});
```

Internal operation target:

```ts
type ReplaceFragmentOperation = {
  type: "replace_fragment";
  at: Range;
  fragment: Descendant[];
  openStart: number;
  openEnd: number;
  source?: "paste" | "drop" | "insert-content";
};
```

Hard rule:

- A pasted 10,000-line payload should not create 30,000 operations.
- If collaboration cannot accept `replace_fragment` yet, the implementation may
  lower it inside the adapter, but core paste should still be one logical
  transaction and one normalization/fitting pass.

## 9. Hook, Component, And Render DX Target

No React component API is needed for this strategy.

React responsibilities:

- receive paste event;
- block browser default only after Slate owns the paste;
- materialize DOM coverage targets before model mutation;
- guard composition;
- call DOM clipboard runtime;
- request model-owned selection repair after paste;
- avoid repeated per-node React work.

React non-goals:

- no `usePaste`;
- no paste render slot;
- no app-rendered missing DOM for paste;
- no React state as paste authority.

## 10. Plate Migration Backbone

Plate needs:

- app-owned rich HTML/image/table paste providers;
- paste rules after insertion;
- analytics/debug payloads;
- schema-specific import/export;
- large paste performance without moving paste policy into Plate core.

Backbone answer:

- Raw Slate provides `InsertionSlice`, provider/candidate ordering, and bulk
  fragment replacement.
- Plate owns provider implementations and product transforms.
- Plate should not override low-level `insertText`/`insertFragment` just to
  intercept paste.

## 11. slate-yjs Migration Backbone

Collaboration risk:

- A public `replace_fragment` operation changes the shared operation contract.

Target:

- Treat paste as one logical update with one history entry.
- Define deterministic lowering for yjs before public stability:
  - either yjs consumes `replace_fragment` directly;
  - or the adapter lowers it to structural operations inside one yjs
    transaction;
  - never expose thousands of independent history-visible paste actions.

Gate:

- Round-trip local paste plus remote update replay must preserve selection,
  history grouping, and fragment structure.

## 12. Issue-Ledger Accounting

ClawSweeper status:

- Applied by reusing the completed clipboard/performance ClawSweeper pass and
  current fork dossier rows.
- No new upstream issue comments.
- #5945 moved to `Improves` after issue-size benchmark proof.
- #4056 moved to `Improves` after populated-editor copy/paste issue-size
  benchmark proof.
- No new fixed claims in this plan.
- #5992 moved to `Improves` after the 50,000-block cut benchmark and bounded
  fragment extraction proof. Exact closure still needs the remaining model
  delete/snapshot cost below an accepted target.

Existing source rows:

- `docs/slate-v2/ledgers/fork-issue-dossier.md:2455` tracks #4056.
- `docs/slate-v2/ledgers/fork-issue-dossier.md:2486` tracks #5945.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:64` keeps #5945 at
  `Improves`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:65` keeps #4056 at
  `Improves`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:66` keeps #5992 at
  `Improves`.
- `docs/slate-issues/benchmark-candidate-map.md:93` marks #5945
  benchmark-ready.
- `docs/slate-issues/benchmark-candidate-map.md:250` marks #4056
  ready with minor setup.

Target claim map:

| Issue | Current status                 | Target after execution                                                               | Reason                                                                                                                        |
| ----- | ------------------------------ | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| #5945 | Improves                       | `Fixes #5945` only if 10,000-line browser proof passes                               | The issue-size package benchmark is green; exact browser repro closure remains open.                                          |
| #4056 | Improves                       | `Fixes #4056` only with historical browser/user-path repro                           | Populated-editor copy/paste issue-size package benchmark is green; exact browser repro closure remains open.                  |
| #5992 | Improves                       | `Fixes #5992` only after remaining model delete/snapshot cost has a target and proof | The issue-size cut benchmark improved by bounding fragment extraction, but the delete lane remains above a clean closure bar. |
| #2195 | Related perf pressure          | Improves if dirty-path text-node tracking drops from the hot path                    | Dirty tracking is likely part of the paste cost.                                                                              |
| #6038 | Related perf pressure          | Improves if batch-aware apply engine lands                                           | Bulk replace directly touches this architecture pressure.                                                                     |
| #5811 | Related normalization pressure | Related only unless infinite-normalize repro is proven                               | Paste fitting must not create new normalize loops.                                                                            |

Unchanged fixed/improved clipboard rows:

- #5233 and #3486 stay fixed through custom format keys.
- #4569 stays fixed through documented insertData capability behavior.
- #1024, #4613, #4802, #4806, #5151, #5328, #4857, #4542, #3857,
  #3801, and #3469 keep their existing `Improves`/`Related` classifications.

PR description status:

- Not edited in this planning pass.
- Must be updated during execution if:
  - the accepted public API shape changes;
  - #5945/#4056/#5992 claim status changes;
  - new benchmark proof becomes release evidence;
  - provider API becomes public/unstable.

## 13. Legacy Regression Proof Matrix

| Behavior                                | Required proof                                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Single-line plain text paste            | Existing `insertText` fast path remains behavior-equivalent.                                               |
| Multiline plain text paste              | New unit proof inserts lines as the same block structure users get today, with correct final selection.    |
| Full-document replacement               | Existing `replaceSnapshot` fast path stays green; shell-backed full-doc text replacement remains explicit. |
| Slate fragment paste                    | Fragment payload preserves target-block behavior and whole-list wrappers.                                  |
| Void/inline void paste                  | Existing selected inline void copy/paste/cut proof remains green.                                          |
| Paste over expanded range               | Deletes selected content once, inserts canonical slice once, sets selection to insertion end.              |
| Paste into hidden/DOM-incomplete target | DOM coverage materializes or model-backs according to policy before mutation.                              |
| Paste while composing                   | Composition guard blocks dangerous materialization/mutation.                                               |
| Undo                                    | One paste equals one undo step.                                                                            |
| Redo                                    | Redo restores full pasted slice and selection.                                                             |
| Collaboration replay                    | One logical paste replays deterministically through local and remote updates.                              |

## 14. Browser Stress And Parity Strategy

Minimum browser rows:

- `paste-normalize-undo` stays green for `richtext`, `plaintext`, and
  `forced-layout`.
- Browser paste of 100, 1,000, and 10,000 plain-text lines:
  - model text/block count is correct;
  - native selection repairs to the insertion end;
  - follow-up typing works;
  - undo removes one paste;
  - redo restores one paste.
- DOM coverage paste:
  - hidden/materialized target does not call raw `toDOMPoint` blindly;
  - no stale DOM is used as current content.
- IME guard:
  - paste during composition does not lose composition text.
- Mobile smoke:
  - mobile/touch paste menu near boundary does not crash selection repair.

Benchmark rows:

- `10` lines: no regression.
- `100` lines: no regression.
- `1,000` lines: target `<= 150ms` p95 local.
- `2,000` lines: target `<= 250ms` p95 local.
- `10,000` lines: target `<= 1000ms` p95 local and at least `5x` faster than
  current extrapolated path.
- Operation count target for multiline plain text: `<= 3` logical operations.
- Heap target: no unbounded temporary fragment copies beyond one slice and one
  fitted fragment.

## 15. Applicable Implementation-Skill Review Matrix

| Skill/lens                    | Status              | Plan response                                                                                                                                          |
| ----------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `performance`                 | applied             | Cohorts, repeated unit, operation count, heap, and native behavior gates are explicit.                                                                 |
| `performance-oracle`          | applied by rule     | Hot path is operation/normalization complexity, not splitting. Target is O(inserted nodes) build plus O(boundary) fit, not O(lines \* path-transform). |
| `tdd`                         | applied             | Execution starts with one failing benchmark/unit proof, then implementation, then browser proof.                                                       |
| `high-risk-deliberate-pass`   | applied             | Operation/collaboration/browser blast radius is named below.                                                                                           |
| `vercel-react-best-practices` | skipped with reason | React is dispatch/repair owner here; the bottleneck is model insertion.                                                                                |
| `shadcn`                      | skipped with reason | No UI/component API is being designed.                                                                                                                 |
| `react-useeffect`             | skipped with reason | No new effect or subscription surface.                                                                                                                 |

## 16. High-Risk Deliberate Pre-Mortem

Trigger:

- Operation model, history, collaboration, browser paste, and large performance
  behavior change.

Blast radius:

- `packages/slate`
- `packages/slate-dom`
- `packages/slate-react`
- `packages/slate-history`
- future `slate-yjs` adapter
- browser contracts and benchmarks

Failure scenario 1:

- Bulk paste is fast but changes fragment shape.
- Proof: compare old and new model output for representative plaintext,
  richtext, list, void, inline, and expanded-range paste.

Failure scenario 2:

- Bulk paste is fast locally but breaks undo/history.
- Proof: one paste must undo/redo as one unit in package and browser tests.

Failure scenario 3:

- Bulk operation cannot map through collaboration.
- Proof: yjs adapter design or lowering proof before public stability.

Keep/revise/drop:

- Keep the strategy.
- Revise if `replace_fragment` cannot preserve history/collab semantics.
- Drop only if benchmark shows one logical replacement is not materially faster,
  which would be surprising given current operation counts.

## 17. Hard Cuts And Rejected Alternatives

Hard cuts:

- No line-by-line `splitNodes + insertText` for multiline paste as the final
  engine.
- No public `editor.clipboard`.
- No core rich HTML parser.
- No exact issue claim without exact proof.
- No virtualization as paste optimization.
- No effect-timed React paste state.

Rejected:

- "Just cache more in the loop": already not enough.
- "Convert plain text to fragment and call existing insertFragment": measured
  worse in bounded proof and still too many inserts.
- "Use browser default paste for performance": corrupts Slate model ownership.
- "Let apps override `insertFragment`": recreates legacy method-override chaos.

## 18. Maintainer Objection Ledger

| Objection                                                                    | Answer                                                                                                                                                             |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "This adds a high-level op, Slate ops should stay primitive."                | Paste is one user action. VS Code, ProseMirror, and Tiptap all treat it as one replacement. Primitive-only purity is not worth 30,000 operations.                  |
| "Collaboration adapters may not understand `replace_fragment`."              | Replay through Slate's collaboration import path is proven. CRDT adapters that cannot represent subtree replacement atomically lower it at their adapter boundary. |
| "Apps need HTML paste control."                                              | Yes, through providers/capabilities. Raw Slate should not own product HTML policy.                                                                                 |
| "The current fragment path already uses `replace_fragment` for some shapes." | Correct, and that is the point of this lane: keep expanding the fitted one-op shapes only where behavior is proven.                                                |
| "Why not use Lexical's raw text nodes?"                                      | Lexical's dirty runtime is useful, but Slate's issue target is huge multiline structural insertion. We need bulk replacement, not another node loop.               |
| "Why mention VS Code for Slate rich text?"                                   | VS Code is not a rich-text model. The lesson is bulk edits, undo grouping, provider cancellation, and fallback, not its text buffer.                               |

## 19. Pass Schedule And Pass-State Ledger

| Pass                    | Status   | Evidence added                                                              | Plan delta                                    | Open issues                          | Next owner |
| ----------------------- | -------- | --------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------ | ---------- |
| Current-state read      | complete | Live Slate v2 clipboard/core/benchmark files                                | Identified insertion/normalization as owner   | none                                 | done       |
| Related issue pass      | complete | Existing ClawSweeper dossier and coverage matrix rows for #4056/#5945/#5992 | Execution claim rows are synced to `Improves` | exact `Fixes` proof remains separate | done       |
| Ecosystem synthesis     | complete | Lexical, ProseMirror, Tiptap, VS Code source reads                          | Chose bulk replace-fragment path              | none                                 | done       |
| Decision/high-risk pass | complete | Operation/collab/browser risk table                                         | Public API delayed; internal engine first     | yjs proof during implementation      | ralph      |
| Closure score           | complete | Scorecard above                                                             | Plan ready for execution                      | none                                 | ralph      |

## 20. Plan Deltas From Review

Changed:

- The next Slice 6 owner is not "try another micro-optimization".
- The plan now targets a paste-specific `InsertionSlice` and one logical
  replacement transaction.
- VS Code provider and one-edit-per-selection evidence is included.
- Lexical evidence is narrowed to dirty runtime/local normalization, not copied
  wholesale.
- ProseMirror/Tiptap evidence is treated as the strongest structural insertion
  precedent.

Dropped:

- Prebuilt-fragment paste as a final fix.
- Loop-level caching as a sufficient answer.
- Any public paste provider API before internal proof.

Unchanged:

- Clipboard trust boundary.
- `editor.dom.clipboard` ownership.
- No raw Slate rich HTML parser.
- #4056/#5945/#5992 require separate exact proof before any `Fixes` claim.

## 20.1. Execution Addendum: Single Replace Fragment Pass

Status: complete for the first execution slice, pending for the full plan.

Landed in `/Users/zbeyens/git/slate-v2`:

- `replace_fragment` as a single logical model operation with inverse support,
  dirty-path classification, path/point invalidation below the replaced root,
  public-state replace classification, and internal `applyOperation` export.
- Plain-text DOM paste fast path for multiline text into one empty text block,
  replacing the per-line `splitNodes + insertText` loop for the #5945-shaped
  workload.
- Trusted Slate fragment fast path for a single empty text block, preserving the
  target block for one text-block fragments and replacing root children for
  multi-block fragments.
- Compatible and marked single text-block fragment paste into non-empty
  text-block targets now fits by replacing the target block children with one
  `replace_fragment` operation. Marked text is preserved instead of flattened.
  Structurally richer fragments still fall back.
- Issue-size benchmark command:
  `bun run bench:slate:5945:issue`.

Fresh evidence:

```bash
bun test ./packages/slate/test/clipboard-contract.ts ./packages/slate-dom/test/clipboard-boundary.ts ./packages/slate/test/operations-contract.ts
bun --filter slate typecheck
bun --filter slate-dom typecheck
bun --filter slate-react typecheck
bun lint:fix
bun run bench:slate:5945:local
bun run bench:slate:5945:issue
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/stress/generated-editing.test.ts -g "paste-normalize-undo" --project=chromium
```

Benchmark result:

- 10,000-line plaintext paste latest issue run: `34.72ms`, `1` operation.
- 2,000-line plaintext paste latest local run: `7.08ms` mean, `1` operation.
- 2,000-line trusted fragment paste latest local run: `13.69ms` mean, `1`
  operation.
- 2,000-line DOM fragment paste latest local run: `16.22ms` mean, `1`
  operation.
- Full-document fragment replacement now uses `replace_fragment` and is visible
  to history/undo instead of bypassing observers through snapshot replacement.
- Single text-block fragment fitting now covers marked text and inline children
  as one operation while preserving inline nodes.
- Selected inline-void DOM paste into a text target and selected whole
  top-level structural block replacement now both assert one operation.
- Collaboration import replays `replace_fragment` through
  `tx.operations.replay(...)` with remote metadata and skips local undo history;
  CRDT/Yjs-style lowering stays at the adapter boundary.

Do not mark the full plan done yet:

- Broader partial structural fitting still needs the real `InsertionSlice`
  fitter.
- Provider API bake-off is not started.
- #5992 cut proof was outside this first slice and is recorded in addendum 20.3.
- #5945 is now only an `Improves` claim in the ledgers/PR narrative. Exact
  `Fixes #5945` still needs a 10,000-line browser artifact for the plaintext
  example workflow.

## 20.2. Execution Addendum: Populated Editor #4056 Pass

Status: complete for the populated-editor benchmark slice, pending for the full
plan.

Landed in `/Users/zbeyens/git/slate-v2`:

- Multiline plain-text DOM fallback now builds a model fragment for populated
  text-block targets instead of looping through `splitNodes + insertText`.
- Core fragment insertion now fits top-level multi text-block fragments into a
  populated text-block target as one root `replace_fragment`, preserving
  surrounding target text and placing selection at the end of the inserted
  content.
- Focused DOM clipboard proof locks populated middle multiline paste to one
  logical operation.
- The large clipboard benchmark now has #4056-specific issue rows for
  populated full-selection copy and populated middle paste.

Fresh evidence:

```bash
bun test ./packages/slate/test/collab-history-runtime-contract.ts ./packages/slate/test/clipboard-contract.ts ./packages/slate-dom/test/clipboard-boundary.ts ./packages/slate/test/operations-contract.ts
bun --filter slate typecheck
bun --filter slate-dom typecheck
bun --filter slate-react typecheck
bun lint:fix
bun run bench:slate:5945:local
bun run bench:slate:5945:issue
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/stress/generated-editing.test.ts -g "paste-normalize-undo" --project=chromium
```

Benchmark result:

- 10,000-line empty-editor plaintext paste latest issue run: `34.72ms`, `1`
  operation.
- 10,000-block populated full-selection copy latest issue run: `25.13ms`.
- 10,000-line populated middle plaintext paste into a 10,000-block editor
  latest issue run: `194.55ms`, `1` operation, `19,999` resulting blocks.
- 2,000-line latest local run: fragment paste `13.20ms`, DOM fragment paste
  `14.84ms`, plaintext paste `7.18ms`, each with `1` operation.

Claim delta:

- #4056 moves to `Improves`.
- #5945 stays `Improves`.
- #5992 moves to `Improves` after the cut-path proof addendum below.

Do not mark the full plan done yet:

- Provider API bake-off is not started.
- Broader partial structural fitting beyond top-level multi text-block targets
  remains runnable.
- Exact `Fixes #4056` still needs the historical browser/user-path repro.

## 20.3. Execution Addendum: Cut-Path #5992 Pass

Status: complete for the #5992 issue-size benchmark slice, pending for the full
plan.

Landed in `/Users/zbeyens/git/slate-v2`:

- Core fragment extraction now fast-paths exact whole top-level block
  selections by slicing the selected root children directly.
- The fast path is intentionally narrow: partial text, mixed inline, nested
  list, and non-exact selections still use the existing range slicer.
- `clipboard-contract` locks selected top-level block extraction from a larger
  surrounding document.
- The existing top-level delete fast path remains a bounded `3` operation stream
  for exact whole top-level block range deletion.

Fresh evidence:

```bash
bun test ./packages/slate/test/collab-history-runtime-contract.ts ./packages/slate/test/clipboard-contract.ts ./packages/slate-dom/test/clipboard-boundary.ts ./packages/slate/test/delete-contract.ts ./packages/slate/test/operations-contract.ts
bun --filter slate typecheck
bun --filter slate-dom typecheck
bun --filter slate-react typecheck
bun lint:fix
bun run bench:slate:5945:local
bun run bench:slate:5945:issue
SLATE_CLIPBOARD_BENCH_HUGE_CUT_BLOCKS=50000 SLATE_CLIPBOARD_BENCH_ISSUE_TARGETS=1 bun ./scripts/benchmarks/slate/5945-large-plaintext-paste.mjs
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/stress/generated-editing.test.ts -g "paste-normalize-undo" --project=chromium
```

Benchmark result:

- 50,000-block two-node copy-plus-delete latest issue-size run: `621.26ms`,
  `3` operations.
- 50,000-block two-node edit lane latest issue-size run: `511.47ms`, `3`
  operations.
- The local pre-fast-path issue-size run measured about `4002.02ms` for
  copy-plus-delete, so the fragment extraction owner is materially improved.
- 10,000-line empty-editor plaintext paste latest issue run: `38.57ms`, `1`
  operation.
- 10,000-block populated full-selection copy latest issue run: `12.16ms`.
- 10,000-line populated middle plaintext paste into a 10,000-block editor
  latest issue run: `185.49ms`, `1` operation, `19,999` resulting blocks.

Claim delta:

- #5992 moves to `Improves`.
- #5945 stays `Improves`.
- #4056 stays `Improves`.

Remaining work after the #5992 pass:

- Remaining #5992 exact closure needs a separate model delete/snapshot cost
  target.
- Provider API bake-off is handled by the next addendum.
- Broader partial structural fitting beyond the current top-level text-block
  and exact structural block cases is not part of this paste-performance lane
  without a concrete schema-backed repro.

## 20.4. Execution Addendum: Provider API Bake-Off

Status: complete for this plan.

Live Slate v2 source:

- `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts` exposes
  `DOMClipboardInsertDataHandler<V> = (editor, data) => boolean | void`.
- `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts` runs
  `dom.clipboard.insertData` handlers before internal Slate fragment and
  plain-text fallback.
- Extension capabilities already provide ordered, synchronous app interception
  without adding a new root `editor.clipboard` namespace.

Ecosystem read:

- VS Code's provider model has `prepareDocumentPaste`,
  `provideDocumentPasteEdits`, `resolveDocumentPasteEdit`, MIME matching,
  cancellation tokens, and paste-as UI.
- ProseMirror/Tiptap use parser hooks, paste transforms, and paste rules around
  one replacement transaction.
- Lexical keeps clipboard insertion in package-level clipboard helpers and
  extension commands rather than exposing a broad editor-level clipboard
  namespace.

Decision:

- Do not add a public provider API in this plan.
- Do not add a private provider layer just to mirror VS Code terminology.
- Keep `dom.clipboard.insertData` as the current app-owned escape hatch.
- Reopen provider design only when Slate has at least one real async/lazy
  paste-as example that needs prepare/provide/resolve, cancellation, MIME
  preference, and stale-selection protection.

Rejected shape:

```ts
editor.clipboard.registerProvider(...)
```

Reason: too broad, too product-shaped, and not Slate-close.

Accepted future shape, only if the async proof appears:

```ts
type DOMClipboardPasteProvider<V extends Value = Value> = {
  mimeTypes?: readonly string[];
  prepare?: (
    context: DOMClipboardPreparePasteContext<V>,
  ) => void | Promise<void>;
  provide?: (
    context: DOMClipboardPasteContext<V>,
  ) =>
    | DOMClipboardPasteCandidate<V>
    | null
    | Promise<DOMClipboardPasteCandidate<V> | null>;
  resolve?: (
    candidate: DOMClipboardPasteCandidate<V>,
    context: DOMClipboardPasteContext<V>,
  ) => DOMClipboardPasteCandidate<V> | Promise<DOMClipboardPasteCandidate<V>>;
};
```

Hard cut for the current PR:

- Internal bulk paste/cut proof ships.
- Current synchronous DOM capability stays.
- Async provider API does not ship.
- Broad arbitrary partial structural fitting does not ship without a concrete
  schema-backed repro. The proven one-op shapes are empty text block, compatible
  text block, populated top-level text-block paste, full-document replacement,
  selected whole top-level structural blocks, and exact whole top-level fragment
  extraction.

## 21. Open Questions And Evidence That Would Change The Decision

Open questions:

- Should `replace_fragment` remain a public operation long term, or should a
  future adapter-facing macro hide it?
- Which CRDT/Yjs adapter lowering format should Plate ship first?
- Should a future async provider API sit above `dom.clipboard.insertData` once a
  real paste-as example proves the need?

Decision-changing evidence:

- If one logical replacement is not at least `5x` faster on 10,000-line paste,
  revisit the operation design.
- If yjs cannot replay `replace_fragment` deterministically, keep it internal
  and lower through a single adapter transaction.
- If provider cancellation makes the public API too heavy, keep providers out of
  raw Slate and expose only typed `insertData` for v2.

## 22. Implementation Phases

### Phase 1: red benchmark and output-lock tests

Owner: `ralph`.

Work:

- Add/extend large paste benchmark to include old vs new candidate lanes.
- Add package tests for multiline plain text output shape and one undo step.
- Add operation count assertions for the bulk path.

Gate:

- Current path reproduces high operation count and slow paste.

### Phase 2: internal InsertionSlice

Owner: `ralph`.

Work:

- Decode DataTransfer into ordered candidates.
- Convert plain text to slice once.
- Keep single-line text on `insertText`.
- Keep Slate fragment import fail-closed.

Gate:

- No public API change.
- Existing clipboard tests green.

### Phase 3: fit once

Owner: `ralph`.

Work:

- Add Slate path/range-based slice fitting.
- Preserve current target-block behavior.
- Preserve list/inline/void behavior.

Gate:

- `clipboard-contract` expanded cases green.

### Phase 4: single replacement transaction

Owner: `ralph`.

Work:

- Add internal `replace_fragment` transaction/op or macro.
- One history item.
- One selection placement.
- Bounded dirty path and normalization.

Gate:

- Operation count and timing gates pass.

### Phase 5: browser proof

Owner: `ralph`.

Work:

- Run focused browser paste rows.
- Add 10,000-line browser stress artifact if practical.
- Verify follow-up typing, undo, and selection repair.

Gate:

- No browser-visible regression.

### Phase 6: provider API bake-off

Owner: future `slate-ralplan`.

Work:

- Compare current `dom.clipboard.insertData` with VS Code-style provider
  candidates.
- Keep private unless app examples prove the DX.

Gate:

- Complete. Public provider API does not ship in this plan; today's boolean
  handler stays because no async paste-as proof exists.

## 23. Fast Driver Gates

Run from `/Users/zbeyens/git/slate-v2` during execution:

```bash
bun run bench:slate:5945:local
bun test ./packages/slate/test/clipboard-contract.ts
bun test ./packages/slate-dom/test/clipboard-boundary.ts
bun --filter slate typecheck
bun --filter slate-dom typecheck
bun --filter slate-react typecheck
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/stress/generated-editing.test.ts -g "paste-normalize-undo" --project=chromium
```

Add before claim:

```bash
bun run bench:slate:5945:issue
```

where `bench:slate:5945:issue` must cover the 10,000-line workload.

## 24. Final User-Review Handoff Outline

When execution finishes, report:

- whether the old per-line path is gone for multiline paste;
- benchmark before/after for 100, 1,000, 2,000, and 10,000 lines;
- operation count before/after;
- exact issue claim changes, if any;
- browser proof rows run;
- any yjs/history limitation still keeping public operation status unstable.

## 25. Final Completion Gates

This planning pass is complete when:

- source-backed ecosystem synthesis exists;
- current Slate v2 source owner is cited;
- benchmark evidence is incorporated;
- issue ledger status is accounted for without fake claims;
- execution phases and gates are clear enough for `ralph`;
- active completion file points to this plan.

Status: complete for this execution plan. Follow-up work is tracked as separate
lanes: exact `Fixes` browser artifacts for #5945/#4056, remaining #5992
model delete/snapshot cost, CRDT/Yjs adapter lowering, and any future async
paste provider API.
