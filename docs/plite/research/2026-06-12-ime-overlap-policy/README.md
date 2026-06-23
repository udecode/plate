# Plite IME Overlap Policy

Date: 2026-06-12

## Question

When app, remote, or model updates overlap an active IME composition, should
Plite cancel composition, let the app edit win, commit composition first, or
try to merge/rebase the two edits?

## Scope

- Inspect source-level behavior in ProseMirror, Lexical, and VS Code.
- Convert external behavior into a Plite-native policy proposal.
- Do not patch runtime from external snippets.
- Do not claim raw mobile coverage.

## Verdict

The strongest precedent is ProseMirror: overlapping model changes cancel the
active composition, while edits elsewhere leave composition alive. That is the
right default shape for Plite, but it still needs an explicit Plite policy
review before runtime work because this is taste-bearing editor law.

Recommended Plite policy:

- If a model/app/remote edit overlaps the active composition range, terminate
  composition ownership before applying the edit.
- The app/model edit wins the document state.
- A later stale `compositionend` must be idempotent and must not insert the
  stale composed text a second time.
- If the edit is outside the active composition range, keep composition alive
  and preserve native/browser ownership.
- Avoid renderer/normalizer transforms that rewrite the active composing node
  unless the overlap policy intentionally ends composition.

This should become a `plite-plan` row before a runtime patch.

## Evidence Summary

- ProseMirror has explicit tests for full-overlap, partial-overlap, and
  inside-overlap cancellation, plus a non-overlap case that keeps composition
  running (`../prosemirror-view/test/webtest-composition.ts:238-268`).
- ProseMirror protects focused composition DOM during desc updates and marks
  composition nodes dirty only through explicit composition handling
  (`../prosemirror-view/src/viewdesc.ts:767-826`,
  `../prosemirror-view/src/input.ts:502-525`).
- Lexical tracks a composition key, marks previous and current composition nodes
  writable on key changes, skips transforms on the active composition node, and
  flushes synchronously when composition ownership changes
  (`../lexical/packages/lexical/src/LexicalUtils.ts:487-514`,
  `../lexical/packages/lexical/src/LexicalUpdates.ts:198-330`,
  `../lexical/packages/lexical/src/LexicalUpdates.ts:965-986`).
- VS Code models composition as explicit input/controller state, stops IME-owned
  keys from propagating, ignores duplicate stale `compositionend`, synthesizes
  composition end when blur/off-DOM or Android tap would otherwise strand
  composition, and avoids writing native textarea content while composing
  (`../vscode/src/vs/editor/browser/controller/editContext/textArea/textAreaEditContextInput.ts:199-319`,
  `../vscode/src/vs/editor/browser/controller/editContext/textArea/textAreaEditContextInput.ts:453-482`,
  `../vscode/src/vs/editor/browser/controller/editContext/textArea/textAreaEditContextInput.ts:639-645`,
  `../vscode/src/vs/editor/browser/controller/editContext/native/nativeEditContext.ts:221-235`).

## Plite-Native Proposal

Add a policy contract before code:

1. Define an active composition ownership range in Plite terms.
2. Define overlap as any app/model/remote operation whose affected text range
   intersects that composition range.
3. On overlap, end/cancel the active composition session and mark subsequent
   native `compositionupdate`/`compositionend` events stale.
4. Apply the model/app/remote operation once.
5. Assert that stale composition events do not double insert, resurrect removed
   text, or move selection into a detached DOM node.
6. Assert that non-overlap edits do not cancel composition.
7. Assert that render/selection/caret/textarea writes are suppressed or
   intentionally routed through composition cancellation while a composition
   session is active.
8. Assert duplicate or missing native composition-end events are idempotent and
   do not strand composition ownership.

Expected proof owner:

- `plite-plan` first for semantics.
- `plite-browser` for scenario naming and stepwise IME helper coverage.
- `plite-react` runtime only after the policy is accepted.

## Stopping Checkpoint

`ime-overlap-cancellation-taste`

Question for the user:

Should Plite adopt ProseMirror-style overlap cancellation as the default:
app/model/remote overlap wins, stale composition commits are ignored, and
non-overlap edits preserve composition?

Recommended answer:

Yes. This is the least magical policy and easiest to prove. Trying to merge
IME composition with overlapping app edits gets fragile fast.

## Claim Width

This packet narrows the missing taste with source-backed policy research.
VS Code adds lifecycle and active-DOM protection gates, but it does not make
the runtime decision for Plite. This packet does not patch runtime, does not
add a browser contract row, and does not claim that Plite already handles
overlapping app/remote edits during active IME.
