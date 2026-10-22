---
review_scopes: [external-text]
verdict: pursue
review_basis: [2026-10-04-external-text-audit]
work_kind: implementation
review_commit: 0a5cb4f411c51a22bd494a908915b9f073fc2734
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, packages/plitejs/src/react/external-text.ts, packages/plitejs/src/react/editable/external-text-runtime.ts, packages/plitejs/src/react/editable/caret-engine.ts, packages/plitejs/src/react/editable/content-root-vertical-geometry.ts, packages/plitejs/src/react/editable/runtime-keyboard-events.ts, packages/plitejs/src/react/editable/editable-dom-runtime.ts, packages/plitejs/src/dom/plugin/dom-geometry.ts, packages/plitejs/src/interfaces/editor.ts, packages/plitejs/test/react/external-text-contract.test.tsx, packages/platejs/src/code-block/codemirror/createCodeMirrorAdapter.ts, packages/platejs/src/code-block/codemirror/createCodeMirrorAdapter.spec.ts, apps/www/src/app/(app)/examples/plite/_examples/external-text.tsx, apps/www/src/app/(app)/examples/plite/_examples/authored-changes.tsx, apps/www/tests/browser/code-block-codemirror.spec.ts, content/docs/(guides)/external-text.mdx, content/docs/plite/libraries/plite-react/external-text.mdx, docs/plans/2026-10-15-codemirror-vertical-entry.md]
review_upstreams: ['../codemirror-view@fbff59ba004d80d8c914f64c42586387b08706ac', '../prosemirror-website@a16b4ece45f135e5f001ab59d25f2d43c25974e1', '../milkdown@6a4db480b00db8dd0322b517117dfa2154f3e2e2', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../slate@945a484df2497e4c448b33f417b0de2a49840032']
---

# External text views keep the caret's column on vertical arrows

Status: executed, waiting on your commit
Playbook: plan
Page: https://claude.ai/artifact/KVbroirsDfrWfboTYSBC3Z

**Pursue. An external text view gets one optional, read-only question, `offsetAt({ edge, x })`, which Plite asks before it writes the selection, and `focus` loses its `{ edge, x }` options.** Plite owns the selection and the adapter owns its layout, so only the adapter can say which offset sits under a client x on its first or last line, and only Plite may write the answer. Today nobody asks. ArrowDown from a paragraph lands at the code's offset 0, and ArrowUp out of CodeMirror lands at the paragraph's end, although the adapter sends its x. The `{ edge, x }` options on `focus` look like the answer but never run. A probe shows that `focus` is always called with no options and with the model selection already written. The same question also serves leaving into another external view, and the Shift+Arrow extension task (`t_3608c4f4`) can use it to enter a view; that task widens it when it needs line-to-line answers inside one. This review answers suggested task `t_58c21399`, which the owner started; it is not the scope `next` returned.

## Brief

### What will change?

Up and Down now keep the caret's column moving into and out of a CodeMirror code block, like the plain code block. It's all in your working tree, uncommitted. Review cut wrapped-line handling back to a plain edge landing.

### What could go wrong?

Proof covers Chrome only. On lines CodeMirror hasn't drawn yet, the column is a guess from character width, so wide characters can land one off. The audit found only gaps in the log, now fixed, and no code problems.

## Teach

A CodeMirror code block is a small editor inside the main one. The main editor owns the text and the caret, but CodeMirror draws the text and knows where each character sits. When the caret crosses between them, someone has to turn "this far from the left" into "this character".

Today nobody does. Going in, the caret lands at the very start or end of the code. Coming out, CodeMirror reports how far from the left the caret was, but the main editor drops that number.

Now the main editor asks the code view one question before it moves the caret: which character on your first or last line is closest to this spot? The view only answers, and the main editor puts the caret there, so one place still decides. Coming out, the main editor finds the spot in the paragraph itself.

## Public API

An adapter's view loses `focus`'s options and gains the optional query (`packages/plitejs/src/react/external-text.ts`).

```ts before
export type ExternalTextView<TConfig = undefined> = Readonly<{
  destroy: () => void;
  focus: (options?: { edge?: 'end' | 'start'; x?: number }) => void;
  /** Apply patches and canonical state before returning without dispatching an action. */
  update: (input: {
    /** `null` resets from state.text; a list applies exact patches; [] acknowledges. */
    changes: readonly ExternalTextChange[] | null;
    state: ExternalTextState<TConfig>;
  }) => void;
}>;
```

```ts after
export type ExternalTextView<TConfig = undefined> = Readonly<{
  destroy: () => void;
  /** Install the delivered `state.selection`, then focus the local input. */
  focus: () => void;
  /**
   * The offset nearest client `x` on the view's first (`'start'`) or last
   * (`'end'`) visual line, in the delivered `state.text`; `null` when the view
   * cannot tell. Plite asks before a vertical arrow enters the view and writes
   * the selection itself. Read layout only: never dispatch an action, change
   * the view's text or selection, focus, scroll, or run work the view
   * deferred, such as a pending layout pass. Actions called during the query
   * are refused. Omitted, Plite enters at the first or last offset.
   */
  offsetAt?: (input: { edge: 'end' | 'start'; x: number }) => number | null;
  /** Apply patches and canonical state before returning without dispatching an action. */
  update: (input: {
    /** `null` resets from state.text; a list applies exact patches; [] acknowledges. */
    changes: readonly ExternalTextChange[] | null;
    state: ExternalTextState<TConfig>;
  }) => void;
}>;
```

The CodeMirror adapter answers the query without CodeMirror's measuring calls, scrolls the installed caret into view, and sends `x` only on vertical exits, from CodeMirror's own goal column when it has one (`packages/platejs/src/code-block/codemirror/createCodeMirrorAdapter.ts`).

```ts before
        focus({ edge, x } = {}) {
          if (current.selection) {
            writeSelection(view, current.selection);
          } else if (edge) {
            let offset = edge === 'end' ? view.state.doc.length : 0;

            if (x !== undefined) {
              const rect = view.scrollDOM.getBoundingClientRect();
              const y = edge === 'end' ? rect.bottom - 1 : rect.top + 1;

              offset = view.posAtCoords({ x, y }) ?? offset;
            }
            writeSelection(view, { anchor: offset, focus: offset });
          }
          view.focus();
        },
```

```ts after
        focus() {
          const answer = takeAnswer();

          if (current.selection) {
            installSelection(view, current.selection, {
              goalColumn:
                answer?.offset === current.selection.focus
                  ? answer.x - view.contentDOM.getBoundingClientRect().left
                  : undefined,
              scrollIntoView: true,
            });
          }
          view.focus();
        },
        offsetAt: ({ edge, x }) => rememberAnswer(readEdgeLineOffset(view, edge, x), x),
```

The textarea example drops the dead branch and answers nothing (`apps/www/src/app/(app)/examples/plite/_examples/external-text.tsx`).

```ts before
      focus({ edge } = {}) {
        if (current.selection) writeSelection(current.selection);
        else if (edge) {
          writeSelection({
            anchor: edge === 'end' ? input.value.length : 0,
            focus: edge === 'end' ? input.value.length : 0,
          });
        }
        input.focus({ preventScroll: true });
      },
```

```ts after
      focus() {
        if (current.selection) writeSelection(current.selection);
        input.focus({ preventScroll: true });
      },
```

## What other editors do

Read from local checkouts: ProseMirror website `a16b4ec`, Milkdown `6a4db48`, BlockNote `1e26f1c`, Tiptap `91c51be`, Lexical `dd5c41b`, Slate `945a484` and CodeMirror view `fbff59b` (6.41.0, the version `platejs` pins). None of them keeps the column across an embedded code editor; the ones without an embedded editor keep code as native text and let the browser move the caret. Nothing was run except CodeMirror in the demo page.

| Editor | Embedded code editor | Entry keeps column | Who maps x to an offset | Who writes the selection | Exit keeps column |
| --- | --- | --- | --- | --- | --- |
| ProseMirror CodeMirror example | yes | no, first or last offset | nobody | outer editor; node view applies it | no |
| Milkdown | yes | entry handler not found | nobody | outer editor; node view applies it | no |
| BlockNote, Tiptap | no, native text | browser-native | browser | browser, then the outer model | browser-native |
| Lexical | no, native text | browser-native | browser | browser, then Lexical | browser-native |
| Slate | no, native text | browser-native | browser | browser, then Slate | browser-native |
| CodeMirror 6 itself | n/a | n/a | CodeMirror (`posAtCoords`, `moveVertically`) | the caller dispatches what it computed | n/a |
| Plite after this plan | yes | yes | the view, through `offsetAt` | Plite | yes, Plite maps x in its own text |

ProseMirror's split is the one this plan keeps: the outer editor decides the selection and the embedded view applies it. CodeMirror separates resolving a position from committing it, which is what `offsetAt` asks of an adapter.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| `ExternalTextView.offsetAt`, `focus()` without options | Plite | `plitejs/react` | The public adapter contract; Plite owns selection and asks the view about layout |
| One resolver for a vertical landing point at an x | Plite | `plitejs/react` (`content-root-vertical-geometry.ts`, `external-text-runtime.ts`) | `resolveVerticalNavigationPoint` already serves content-root exits; it now takes a known x without a source caret and asks the view when the target Text is external |
| Entry, content-root exit and `navigateOut` call that resolver | Plite | `plitejs/react` (`caret-engine.ts`, `content-root-navigation.ts`, `external-text-runtime.ts`) | Every vertical write that can land in a view goes through one function |
| A query-only action guard, and the goal seeded at an exit's landing | Plite | `plitejs/react` (`external-text-runtime.ts`) | The runtime owns action admission and the vertical goal outside views |
| `'offsetAt'` in `EditorLifecycleError`'s external-text phases | Plite | `plitejs` (`interfaces/editor.ts`) | A throwing or invalid answer reports through the existing sink |
| CodeMirror `offsetAt`, `x` only on vertical exits | Plate | `platejs/code-block` | The adapter owns CodeMirror layout, including unrendered lines |
| Textarea example `focus()` | Plite example | `apps/www` | Shows an adapter that omits the query |

## Hard cuts and app migration

`focus`'s `{ edge?, x? }` options are deleted with no overload. `focusSelection` calls `view.focus` only when the model selection lies wholly in the view's Text and only after refreshing the view, so the delivered `state.selection` is never null there, and both built-in adapters prefer it over `edge` and `x`. Their fallback branches therefore never run, and the probe (`focus-options-probe-a3.log`) shows the common view-to-view path does not even pass the options. A command path can still pass them to an adapter that ignores the delivered selection; such an adapter loses that branch. Callers that break are adapters that declare the parameter: the CodeMirror adapter, the textarea example (which `authored-changes.tsx` reuses) and the two docs pages that list `focus({ edge?, x? }?)`. A third-party adapter that declares the parameter still type-checks, because a function with an optional parameter is assignable to `() => void`.

`navigateOut`'s `x` keeps its name and type but gains a meaning. Plite used to ignore it; now a present `x` asks for a vertical landing at that column, and an absent one keeps the edge. An adapter that sends `x` on ArrowLeft or ArrowRight, as the CodeMirror adapter did, would land mid-line, so the docs and the changeset say to send it only for ArrowUp and ArrowDown, as the view's own goal column when it has one. The CodeMirror adapter's `focus` now scrolls the caret into view when it moves it; CodeMirror's own `focus` never scrolled, and a caret entered on an undrawn last line needs it.

```ts before
// an app's adapter
focus({ edge } = {}) {
  if (current.selection) writeSelection(current.selection);
  else if (edge) writeSelection(edgeSelection(edge));
  input.focus();
},
```

```ts after
// an app's adapter
focus() {
  if (current.selection) writeSelection(current.selection);
  input.focus();
},
```

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| ArrowDown from a paragraph into CodeMirror | lands on the code's first line at the paragraph caret's column | Chromium Playwright, `code-block-codemirror.spec.ts`; hand drive |
| ArrowUp from a paragraph into CodeMirror, last line not rendered | lands on the last line at the estimated column, scrolled into view | Chromium Playwright on the 10,000-line demo, caret rect inside the code scroller |
| ArrowUp or ArrowDown out of CodeMirror into a paragraph | lands at the code caret's goal column on the paragraph's nearest line | Chromium Playwright; hand drive |
| A long code line, then a short last line, then out | lands at the long line's column, as the plain code block does | Chromium Playwright |
| ArrowLeft or ArrowRight out of CodeMirror, also right after a vertical entry | unchanged: lands at the adjacent edge | `createCodeMirrorAdapter.spec.ts` asserts no `x` on horizontal exits; jsdom contract test for the goal |
| Moving, clicking, typing or undoing inside the view before leaving | CodeMirror's goal follows the action, and the exit uses it | Chromium Playwright for vertical moves; CodeMirror's own commands otherwise |
| Entering a short first line, then ArrowDown inside the view | lands at the paragraph's column on the longer line | Chromium Playwright |
| The query while CodeMirror has a measure pending | the pending pass does not run early; nothing scrolls or redraws | `createCodeMirrorAdapter.spec.ts` |
| A nested content root's exit into an adjacent code view | lands at the view's answer | jsdom contract test with a stub adapter |
| Leaving one external view into another | lands at the other view's answer | jsdom contract test with a stub adapter |
| A throwing or out-of-range answer | lands at the edge, reports `phase: 'offsetAt'` and keeps the view's state | jsdom contract test |
| A `null` answer or no `offsetAt` | lands at the edge with no report | jsdom contract test |
| An action called during the query | refused, composition end included | jsdom contract test |
| Typing after each move | the letter lands at the caret | Playwright follow-up typing in the same cases |
| Firefox, WebKit, mobile | unproven | none |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Who decides where the caret lands | The main editor writes it after asking the code view (look) | The code view picks and tells the main editor afterwards | view picks | big |
| Unused settings on the code view's focus call | Removed, since nothing ever passes them (look) | Keep them, unused | keep options | small |
| Lines the code view has not drawn | Estimate the column from character width | Land at the line's start or end there | edge only | small |
| Column kept through a code block | The code view's own goal keeps it, seeded on entry | Start fresh from the code caret every time | fresh goal | small |
| Wrapped first or last lines | Leave as is and note it | Carry wrap side through the bridge now | wrap side | detail |
| Line-to-line answers inside the code view | Left to the Shift plus arrow task, which may reshape this question when it needs them (look) | Ask for them now, as the judge picked | from now | small |
| Release note | A release note for both packages | No note | no note | detail |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ExternalTextView.focus` options | `{ edge?, x? }`, never delivered | none | Plite | dead parameters teach a second selection authority | both adapters, two docs pages | probe log; typecheck | a third-party adapter keeps a dead branch | cut |
| Vertical entry offset | first or last offset | view answers `offsetAt`, Plite writes | Plite asks, adapter answers | layout belongs to the adapter, selection to Plite | CodeMirror adapter implements; textarea omits | Playwright entry legs | an estimate on unrendered lines | rearchitect |
| `navigateOut` `x` | sent, dropped | used for native and external targets | Plite | the adapter already sends it | CodeMirror sends it only for Up and Down | Playwright exit legs | x on horizontal keys would misplace | keep |
| Error reporting for the query | none | `phase: 'offsetAt'`, view kept valid | Plite | a read-only query that throws has not let the view drift | `EditorLifecycleError` union | contract test | a broken adapter keeps landing at edges | keep |
| Vertical landing resolver | three copies (caption case, content-root exit, none for views) | `resolveVerticalNavigationPoint` for every landing that can reach a view | Plite | one function per rule | content-root exit, `navigateOut`, entry | contract and browser tests | content-root callers with a known x and no source rect now resolve instead of returning null | merge |

## Evidence

Model: claude-opus-5-5 at high effort led this review. The architect runners were Opus at high, gpt-6-astra at xhigh and gpt-6.1-sol at xhigh, and the cross-judge was Opus at high.

This review reopens the scope's head, `2026-10-04-external-text-audit` (Stop), at the question of where a vertical arrow lands across the view boundary, which that audit did not ask; its answer on ordered canonical feedback is untouched. It builds on [the vertical entry plan](2026-10-15-codemirror-vertical-entry.md) (task `t_a5661f4b`), which made vertical arrows enter the view at its edge and named this question as open work. The contract is [external-text.ts](../../packages/plitejs/src/react/external-text.ts), the runtime is [external-text-runtime.ts](../../packages/plitejs/src/react/editable/external-text-runtime.ts), the entry is [caret-engine.ts](../../packages/plitejs/src/react/editable/caret-engine.ts) and the adapter is [createCodeMirrorAdapter.ts](../../packages/platejs/src/code-block/codemirror/createCodeMirrorAdapter.ts).

### Requirements

- The user ask, from the task title: "Decide how ArrowUp and ArrowDown keep the caret's column when entering an external text view."
- Plite owns canonical text and selection; the adapter owns its DOM, input and layout; lifecycle callbacks cannot edit the view or the canonical editor (`docs/vision/plite.md`).
- A view or query never becomes a parallel authority for state the runtime owns (`docs/vision/common.md`, Boundary Law).
- A hard cut beats an alias or a deprecated second name (`VISION.md`).
- An adapter that cannot map coordinates must keep working.
- The task `t_3608c4f4` (Shift+Arrow extension) waits on this contract, so the shape must serve it.

### Lanes

- Control, no new artifact: delete the dead options and use `navigateOut`'s `x` for native targets only. Exit keeps its column; entry still lands at the edge. Loses on the user ask.
- Revive `focus({ edge, x })`: the view would install a selection Plite learns about afterwards, and `select` is refused inside callbacks. A second selection authority. Rejected.
- Strongest deletion: delete `focus`'s options and also the `x` field of `navigateOut`, keeping edges both ways. Smallest surface, but drops the requirement and the extension task's need.
- Picked: one optional pre-commit query, as three runners proposed independently.
- Proof limits: Chromium only; unrendered lines use a character-width estimate; with line wrapping on, entry lands at the boundary line's edge.

### Design synthesis

`architect` ran three runners (Opus at high, gpt-6-astra at xhigh, gpt-6.1-sol at xhigh) and an Opus cross-judge; their answers are `architect-*.answer.md` and `judge.answer.md` in the run directory. All three runners proposed the same shape: an optional query on the view that Plite calls before it writes the selection, with `focus` losing its options. They differed on the result, the name and the extras.

- Base: the judge scored cand-1 (Opus, `verticalOffset?({ direction, from, x })`) highest, 17 to 14 and 12, mostly for extension: `from: <offset>` would also answer a Shift+Arrow step from one line of the view to the next while focus stays in Plite's root. The lead takes the judge's base but cuts `from`. No path in this run calls it, the judge itself found that nobody has traced which code handles Shift+Arrow into a view today, and `t_3608c4f4` owns that question. So the query answers entry only, as `offsetAt({ edge, x })`, and the extension task widens it when it has a caller. This is the lead's call against the judge and goes to the plan panel as a decision to attack.
- Grafts taken: Plite's existing vertical goal survives a pass through a view (cand-1); the adapter sends `x` only for ArrowUp and ArrowDown, because today it sends it for Left and Right too (cand-3); the runtime rechecks the editor version and binding after the query and drops a changed answer (cand-2); the column estimate measures the text's left inset on a rendered line and clamps (cand-2).
- Dropped: a `{ offset, affinity }` result and affinity on `ExternalTextSelection` (cand-2 and cand-3), for wrapped boundary rows that no shipped kit has; it goes to Open work.

### Plan panel round 1

Seats: claude-opus-5-5 at high, gpt-6-astra at xhigh and gpt-6.1-sol at xhigh, on frozen commit `b4becfe`; their answers are `panel-plan-r1-*.md` in the run directory. Challenge delta: improved. The pick stands, and seven critical findings changed how it is built.

- Horizontal exit picked up the vertical goal (Opus). `navigateOut` reads the goal only when `x` is present and clears it otherwise.
- The goal survived moves inside the view, because the root's keyboard and mouse handlers never see events inside the host (all three). The `select` and `dispatch` actions clear it when the incoming selection differs from the model selection, compared before the write, so the redundant `syncSelection` before an exit keeps an untouched pass-through goal.
- CodeMirror's own goal column was lost (all three). The adapter's exit sends `contentDOM`'s left plus the selection's `goalColumn` when CodeMirror has one, and its `focus` installs the entry offset with the x it last answered as `goalColumn`, so a second ArrowDown inside the view keeps the entering column.
- A nested content root's exit into an adjacent code view skipped the resolver (Astra, Sol). One resolver now serves entry, content-root exit and `navigateOut`: `resolveVerticalNavigationPoint` takes a known x without a source caret rect, and when the target Text belongs to an external view it asks that view instead of hit-testing Plite's DOM. This also removes the third copy of that logic the judge flagged, so the caption refactor is dropped; its specs never asserted a column, so they could not have caught a change (Opus, Astra).
- `posAtCoords` and `coordsAtPos` run CodeMirror's pending measure pass, which can redraw, run write callbacks and scroll (`codemirror-view/src/editorview.ts:419-494`, Sol, Astra). The query reads a rendered boundary line through `domAtPos` and DOM range rects, estimates an unrendered one from its text, and calls no CodeMirror measuring method. The earlier pick to keep `posAtCoords` is reversed.
- The query guard dismissal was wrong (Sol; Astra as a warning). A guard that holds only while `offsetAt` runs never meets teardown, and the runtime ends composition before it calls `destroy` anyway. While a query runs, every external action, `composition('end')` included, is refused and no other view refreshes.
- The benchmark N/A did not hold (all three). The Scale section now names a gate.

Warnings applied: the installed caret scrolls into view (Opus); `navigateOut`'s `x` meaning goes into the hard cuts, docs and changeset (Opus); the unrendered estimate picks the nearer side of a tab instead of `findColumn`'s overshoot (Astra, Sol); the focus-options justification now rests on the structural argument and names the command path that can still pass them (Astra, Opus); a throwing or invalid answer reports without invalidating the view, so it does not force a full reset of a 448,889-character document (Opus); mount rejects an `offsetAt` that is not a function (Opus); the docs step regenerates the registry docs mirrors (Opus). Noted: the Shift+Arrow task will probably reshape the query rather than add a field to it (Opus), recorded in Defaults.

### Plan panel round 2

Seats: claude-opus-5-5 at high, gpt-6-astra at xhigh and gpt-6.1-sol at xhigh, on frozen commit `fb3ddb8`, reviewing only round 1's changes; their answers are `panel-plan-r2-*.md` in the run directory. Challenge delta: improved. The pick stands, and five critical findings changed how it is built.

- The goal survived a click on the caret's own offset or an edit that keeps it, because CodeMirror dispatches a selection with the same offsets and the adapter forwards only offsets (all three; Astra checked `EditorSelection.eq` against installed `@codemirror/state`). The goal now also clears on a mousedown inside the host and on any dispatch with changes.
- Nothing proved the query leaves CodeMirror's pending measure alone, and the layout count could not see it run early (Opus). The adapter spec now plants a pending `requestMeasure` write and asserts it does not run.
- CodeMirror's `goalColumn` is relative to `contentDOM`'s left, and the plan said to store a client x; no leg tested an in-view move after entry (Opus critical; Astra, Sol warnings). The step now states the conversion, and a browser leg moves down inside the view after entering.
- `focus` went through a write that returns early when the offsets already match, which skipped both the goal and the scroll (Opus). `focus` now always dispatches.
- The benchmark could not see a slow scan that forces no layout (Astra critical; Sol, Opus warnings). The scan is a binary search, the gate counts range rect reads against a logarithmic budget with a linear-scan control, and it judges the median after two frames.

Warnings applied: a remembered answer is used once and cleared by `update` (Astra); a line-gap span of a long line counts as undrawn (Astra, Sol); the query guard is held per canonical editor across Editables (Astra; Opus nit); a `null` answer is silent (Astra, Sol); the resolver needs a fallback rect when it has no source rect, and returns the edge for an external target with no answer (Opus); the runtime checks the point's root before looking up an entry (Opus); the keydown probe never queries a view (Opus nit). The unrendered cohort's base dispatches the same scroll, so the scroll the plan adds on purpose does not fail the gate (Opus).

### Plan panel round 3

Seats: claude-opus-5-5 at high, gpt-6-astra at xhigh and gpt-6.1-sol at xhigh, on frozen commit `0ebe271`, reviewing only round 2's changes; their answers are `panel-plan-r3-*.md` in the run directory. Challenge delta: improved. This was the last plan round, so its fixes are reviewed in the diff panel after the build.

- Clearing the remembered answer on every `update` erased it before focus, because an entry always delivers its selection first (all three). An `update` now keeps it only when it delivers that same collapsed offset with unchanged text, and a focus without an answer leaves a matching selection alone, so the second focus the probe log shows keeps the goal.
- A same-offset keyboard command such as line end, and undo, still kept Plite's stale goal (Astra and Sol, each with a CodeMirror probe). The fix removes Plite's goal inside views instead of adding more clears. CodeMirror's `goalColumn`, seeded on entry, already follows every action inside the view, so an exit's `x` is that goal and Plite only seeds its own goal at the landing. The mousedown clear, and its risk of firing on the entry's own focus event (Opus), go with it.
- A binary search assumes x grows with the offset, which right-to-left text breaks, and arbitrary offsets can split a character (all three). Candidates are now character-cluster boundaries, and a line with right-to-left characters gets a linear pass.

Warnings applied: candidates must map to a text node, so short replacement widgets drop out (Astra, Sol); browser landings assert the nearest offset against neighbouring carets (Astra, Sol); the upward entry starts at offset 12, past the text inset (Opus); red-at-base runs per leg with soft steps in a one-off copy, and the ArrowLeft leg is labelled a guard (Opus); the counter reads only `Range` rects, and every entry cohort's base gets the same scroll (Opus); the resolver checks for an external target before it needs a rect (Opus); the hard cuts say `focus` now scrolls (Opus). Dismissed: a separate downward short-last-line exit (Sol), because both exits send the same goal expression and the downward exit leg runs it. Deferred: a long-line gap check in CI, since jsdom draws no line gaps (Opus); owner: zbeyens; stop: the benchmark gate's 5,000-character cohort, or the owner drops it.

### Diff panel round 1

Seats: Opus at high, Astra and Sol at xhigh, on frozen commit `c79c78e668`. Five critical findings, all applied. Each has a test that fails at that tree, except the goal-clearing case: its repaired assertion passes there and fails once navigateOut's goal clearing is removed.

- A vertical move asked the first mounted Editable, so a second Editable over the same root used another view's geometry (all three).
- One undrawn or remapped candidate stopped the edge-line search, and a short replaced range measured the text after it (all three).
- The estimate dropped the text inset on a blank first drawn line or a read-only view (Sol, Opus).
- The keydown probe queried the view before the app's `onKeyDown`, and a microtask cache handed the move that answer. The probe now asks no view, and the cache is gone (Astra, Sol).
- The goal-clearing test could not fail (Opus).

Warnings applied: wrapped edge rows (Opus); `scrollIntoView` only on an answered entry (Opus); the first-line check in the browser's first leg (Opus); right-to-left detection for astral scripts and bidi controls (Opus); the benchmark's undrawn cohort, landing check and exit and off-by-one controls (Astra, Sol, Opus).

The rerun of the benchmark found one more defect in the round's own fix: an undrawn edge line read a candidate from an empty list and threw, so Plite landed at the edge. A spec case now covers it.

### Diff panel round 2

Seats: Opus at high, Astra and Sol at xhigh, on frozen commit `ceb1c92`, reviewing round 1's fixes. Six critical findings, all applied, each with a test that fails at `ceb1c92`:

- The row filter ran on unwrapped lines, so a taller glyph split one line into rows (Astra).
- A wrapped line whose edge row lies in a line gap answered from a middle row; it now lands at its edge (Astra, Sol, Opus).
- The caret just before a replaced range was dropped, because `domAtPos` associates forward into the widget; the other side is tried too (Sol, Opus).
- A drawn blank wrapped line answered `null`; a blank edge line answers its only offset (Sol).
- An entry the view could not place lost its goal and scroll; the view now answers the edge offset and installs the goal there (Sol).
- `navigateOut` asked the focused Editable's runtime; it now passes its own (Sol, Opus).

Warnings applied: the wrapped start edge gets a case, proven by removing its row check (Opus); the end edge uses the same row test as the start (Opus); the beyond check uses the drawn extremes (Opus); the spec's caret stub walks widgets correctly (Opus); the judge requires finite geometry and five runs per control cohort (Astra, Sol, Opus). Deferred: an end-to-end test of a content-root vertical crossing into a view, which needs layout that jsdom lacks (Opus).

### Diff panel round 3

Seats: Opus at high, Astra and Sol at xhigh, on frozen commit `4ff65cc`, the cap. Opus found none critical; Astra and Sol found four, three of them in the wrapped-row handling rounds 1 and 2 added: a widget at a wrapped boundary forced an edge landing (Astra, Sol, Opus), tightly spaced rows overlapped (Sol, Opus), and a wrap point measured on one row only (Opus warning). Every wrapped-row claim rested on a jsdom stub's guess at where Chrome draws a wrap caret, no shipped kit wraps, and the Defaults row says to leave wrapped lines as they are. So the round deleted the wrapped-row code instead of patching it a third time: with line wrapping on, entry lands at the edge and installs its goal.

The fourth, from Astra: round 2's beyond check compared visual extremes with logical ends, so a fully drawn right-to-left line fell into the estimate. The check now asks whether `visibleRanges` stop short of the line's ends, and a right-to-left case fails at `4ff65cc`. The judge now also checks base metrics and counts the off-by-one control only on a measured nearer neighbour (Astra, Sol, Opus). No fourth round runs, as the cap says; this round's changes are a deletion back to the Defaults row and one condition, each with a test.

### Dependents

- `authored`: `apps/www/src/app/(app)/examples/plite/_examples/authored-changes.tsx` reuses the textarea adapter, whose `focus` loses a dead parameter; behavior unchanged.
- `ui`: unaffected; the example shell, client and page only route to the examples and never touch the view contract.

### Scale

A gate, not N/A, because a crossing keydown gains work. The work runs only on a vertical keydown that crosses a view boundary, never on keys inside the view. It reads one boundary line: a binary search of range rects over that line's drawn text, or an estimate over its characters. A native landing does one hit test through `getPointAtCoordinates`. Other sessions load this host, so wall time is inconclusive here and the gate counts work instead.

- Operation: one plain ArrowDown or ArrowUp that crosses into or out of the CodeMirror view.
- Cohorts: the demo's first line going down; its unrendered last line going up; a 20,000-character first line going down, scrolled to its middle so CodeMirror leaves a line gap on each side; and an exit up into a paragraph. CodeMirror draws a line whole unless the line is at least 4,000 characters and each gap would be at least 1,000, so a 5,000-character line scrolled to 20,000 px never gapped. The probe records how much of the line is drawn, and the long cohort fails when the line is drawn whole.
- Measure: Chromium CDP `Performance.getMetrics` `LayoutCount`, `RecalcStyleCount` and `TaskDuration` deltas from before the keydown to two animation frames after it, so Plite's deferred focus and CodeMirror's measure are counted. A page script also counts calls to `Range.prototype.getClientRects` and `Range.prototype.getBoundingClientRect` in the same window; element rects, which CodeMirror's own measure and scroll read, are not counted. Five runs each, at base `0a5cb4f411` in a proof worktree and on the candidate.
- Frozen budget, judged on the median of five runs on the left-to-right cohorts: the candidate's `LayoutCount` and `RecalcStyleCount` deltas are each at most the base's plus 2, and its range rect reads are at most `2 * ceil(log2(L + 1)) + 4` above the base, where `L` is the boundary line's length. Every entry cohort's base run also dispatches CodeMirror's `scrollIntoView` to the landing offset, so the budget charges the query and not the scroll the plan adds on purpose. `TaskDuration` is reported, not judged. A right-to-left line pays a linear pass and is outside the budget.
- Planted controls, each of which must fail: an `offsetAt` that alternates writing a width and reading `offsetWidth` ten times fails the layout line on every entry cohort, and the same thrash in the exit's x read fails it on the exit cohort; an `offsetAt` that scans the whole line linearly fails the rect-read line on the 20,000-character cohort; an `offsetAt` that answers one offset too far fails the landing check on an entry cohort.
- Landing check, on every candidate run: an entry lands focused on the boundary line, and no caret next to it on that line lies nearer the goal x. Each sample resets CodeMirror's scroll first, and the probe records the line's drawn state before the key: the down cohorts start drawn, the long line's drawn span starts mid-line, and the up cohort starts undrawn.
- A miss sends the query's implementation back to `architect`.

## Steps

- [x] Contract: in `packages/plitejs/src/react/external-text.ts`, make `focus` take no options, add `offsetAt?`, document `navigateOut`'s `x` as the caret's goal x for an ArrowUp or ArrowDown exit, omitted for other keys, and add `'offsetAt'` to the external-text phases of `EditorLifecycleError` in `packages/plitejs/src/interfaces/editor.ts`. Proof: `pnpm --filter plitejs typecheck`.
- [x] Runtime: in `external-text-runtime.ts`, drop the options from `focusSelection` and `focusModelSelection`, and reject a non-function `offsetAt` at mount. Add a method that answers for a point inside an external entry's Text. It returns null unless the point lies in this runtime's own root, as `focusSelection` already checks. Entry asks the runtime of the Editable that took the keydown, and the resolver asks the target editor's active runtime, so a second Editable over the same root never answers with another view's geometry. It refreshes the entry and calls `offsetAt` under a query-only guard, which refuses every external action, `composition('end')` included, and skips other views' refreshes. The guard is held per canonical editor, so it also refuses actions from views mounted by another Editable of the same editor. A `null` answer or an omitted query lands at the edge silently. A throw, or a non-null answer that is not a safe integer in `[0, text.length]`, reports `phase: 'offsetAt'`, leaves the entry valid and lands at the edge. A changed editor version or binding drops the answer and lands at the edge. Plite keeps no column goal while the caret is inside a view, because only the view sees what the user does there. The view's own goal carries the column, and an exit's `x` is that goal. In `navigateOut` with `x`, resolve through the resolver below and seed the runtime's goal at the landing point with `x`; without `x`, clear the goal and land at the edge. Proof: new cases in `packages/plitejs/test/react/external-text-contract.test.tsx` with a stub adapter, each red before the change: view-to-view landing at the stub's answer; a `null` answer landing at the edge with no report; a throw and an out-of-range answer landing at the edge with the reported phase and no reset; an action and `composition('end')` refused during the query, from the queried view, from another view, and from a view of a second Editable under the same `EditorRoot`; a horizontal exit after a vertical entry landing at the edge; a vertical exit seeding the runtime's goal at its landing point with the `x` it sent.
- [x] Resolver: in `content-root-vertical-geometry.ts`, let `resolveVerticalNavigationPoint` take no source point, as `navigateOut` has none, when it is given an x; the two content-root callers always pass a source point and keep requiring its rect (`content-root-navigation.ts:349` and `:420`). It first checks whether its fallback point's Text belongs to an external entry of the target runtime; if so it returns that entry's answer, or the fallback point when there is none, instead of hit-testing, so an external target is never skipped. Otherwise, without a source rect, it needs a usable fallback rect for the hit test's y, or it returns the fallback point, so it never hit-tests at the editor's outer edge. `content-root-navigation.ts` keeps calling it, and `navigateOut` calls it for native and external targets. The keydown probe in `runtime-keyboard-events.ts` asks only whether a content-root target exists and never queries a view, so a view is asked once per keydown. Proof: a jsdom contract case where a nested content root's exit lands at an adjacent stub view's answer, and one where a stub that returns `null` still gets the caret at its edge, each red before the change; a stub counts one query per keydown; the existing `content-root-navigation-contract` tests pass.
- [x] Entry: in `caret-engine.ts` `applyEditableCaretMovement`, after the owner target is chosen, pass a collapsed text target that lies in an external entry through the resolver once, with `preferredX`. Built instead as a direct call to the event runtime's `verticalEntryPoint`, because entry already holds its target point and the runtime that took the keydown, as the build deviation row says; the resolver serves content-root exits and `navigateOut`. Proof: the Playwright entry legs below.
- [x] CodeMirror: in `createCodeMirrorAdapter.ts`, add `offsetAt`, which calls no CodeMirror measuring method. Its candidates are the boundary line's character-cluster boundaries inside `view.visibleRanges` whose DOM position, from `domAtPos`, lies in a text node and maps back to the same offset through `posAtDOM`, so line-gap placeholders, replacement widgets and the text after a short replaced range drop out. A dropped candidate never ends the search: it takes the nearest drawn neighbour inside its interval. A read-only view puts `contenteditable="false"` on `contentDOM` itself, so only a widget inside `contentDOM` counts. At a widget's edge the caret is read from either side of `domAtPos`. A line counts as undrawn on one side only when `visibleRanges` stop short of that end, which is what a line gap is. With line wrapping on, the query answers the boundary line's edge offset without measuring, as the Defaults row for wrapped lines says, and a blank edge line answers its only offset, so every entry installs its goal. When x falls between two drawn candidates, it picks the one whose range rect is nearest: a binary search on a left-to-right line, and a linear pass on a line with right-to-left characters, where x does not grow with the offset. When x falls outside the drawn candidates, on an undrawn line or an undrawn span of a long line, it estimates the column from `defaultCharacterWidth` and the text inset of the viewport's first line, read from its drawn caret or, when that line is blank, from its line box plus border and padding, picks the nearer side of a tab and clamps to the line. The adapter remembers its last answer, offset and x. An `update` keeps it only when the text is unchanged and the delivered selection is collapsed at that offset, which is what an entry delivers before it focuses; any other `update` clears it. `focus` consumes it: with an answer it dispatches the delivered selection with `scrollIntoView` and `goalColumn` set to that x minus `contentDOM`'s left, since CodeMirror stores the column relative to it, even when CodeMirror's offsets already match. Without an answer it dispatches only when the offsets differ, so a repeated focus keeps the goal the first one installed. Send `x` only for ArrowUp and ArrowDown: `contentDOM`'s left plus `goalColumn` when set, else the caret rect's left. CodeMirror then owns the column inside the view, clearing it on clicks, typing, undo and line-end commands as it always does. Proof: cases in `createCodeMirrorAdapter.spec.ts`, each red before the change: a horizontal exit sends no `x`; the estimate before a tab's midpoint picks the offset before the tab; `offsetAt` with a pending `requestMeasure` write callback leaves the callback unrun, `scrollTop` unchanged and the DOM unmutated; `offsetAt`, then an `update` collapsed at the answer, then `focus`, then a second `focus` leaves the answered `goalColumn` installed; an `update` with a text change or a selection elsewhere between the answer and `focus` installs none. Playwright legs.
- [x] Textarea example: simplify `focus`. Proof: www typecheck; the external-text example's existing browser case. Closed by `pnpm --filter plite test:plite-browser:chromium` on the external-text cases, 23 passed, and `pnpm --filter www typecheck`, whose errors match base's in four unrelated files.
- [x] Browser proof: rewrite `code-block: vertical arrows enter CodeMirror from the paragraphs around it` in `apps/www/tests/browser/code-block-codemirror.spec.ts` to assert, with a typed letter after each move: the column on entry both ways, the unrendered last line going up with the caret inside the code scroller; the column on exit both ways; a long code line, then a short last line, then out, landing at the long line's column; entry onto a short first line, then ArrowDown inside the view onto a longer line, landing at the paragraph's column. Each landing asserts the nearest caret offset by comparing the caret's x with its neighbours' on the same line, so a neighbouring character fails it. The ArrowLeft leg after entry is a guard that passes at base; every other leg is red at base, proven by a one-off copy of the spec in the run directory that runs each leg as a `test.step` with soft assertions. Proof: the spec passes five times warm in Chromium, through `verify`.
- [x] Benchmark gate: run the Scale section's cohorts, budget and planted control through `benchmark` before acceptance. Proof: the attempt-indexed logs in the run directory and a `benchmark-checklist` pass on the result.
- [x] Docs: run `plate-docs` on `content/docs/(guides)/external-text.mdx` and `content/docs/plite/libraries/plite-react/external-text.mdx`, covering `offsetAt`, `focus()` and `navigateOut`'s `x`, then `pnpm --filter www build:registry` for the docs mirrors in `apps/www/public/r/`. Proof: their docs checks, the regenerated mirrors and a preview read.
- [x] Vision and teaching: `best-api repair` on the adapter contract, with one sentence in `docs/vision/plite.md` that a view answers layout questions and never picks the selection, and `teaching-sweep.mjs` for the removed options. Proof: the sweep log and `pnpm check knowledge`.
- [x] Changeset for `plitejs` and `platejs` through `changeset`. Proof: the changeset file.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Blast radius before code moves | decision log `how` row: both content-root callers pass a source point |
| Thermos per shared slice | skip: the `api-build` reviews row owes a panel on the diff |
| `pnpm check` steps the edits reach | plitejs and platejs typechecks; www `tsc` and package-integration `tsc` report the same 14 errors as base in four unrelated files (`base-www-tsc-a1-a1.log`); plitejs `create-editor-options.test.tsx` fails the same way at base (`base-plitejs-typecheck-a1-a1.log`); `build:registry --check`, docs parity and registry source pass (`www-parity-a2.log`); the `editor:check` link needs a built CLI this worktree lacks |
| `plate-docs` on both external-text pages | both reference tables; `build:registry` regenerated the mirrors (`build-registry-a1.log`) |
| `best-api repair` | `docs/vision/plite.md` external-text law; the old `focus({ edge?, x? })` shape survives only in finished plan history |
| Benchmark gate through `benchmark` | `bench/judge-a8.log` on the round-3 bytes: every frozen line and the landing check pass; the thrash, exit thrash, linear and off-by-one controls each fail theirs |
| Changeset | amended `.changeset/bounded-external-code-blocks.md` and `.changeset/plate-external-code-blocks.md`, both unreleased |
| Hand drive | `hand-drive-check-a2.log`: the hands-on visits came before the round-2 and round-3 changes; on the final bytes only `hand-drive.mjs check` ran, and it prints `hand drive done` |
| Typed oxlint | `lint-task-final-a1.log`: 0 warnings and 0 errors on the 12 task files, and it changed no file |
| Diff panel (`api-build`) | three rounds, the cap; every critical finding applied, round 3 by deleting the wrapped-row code; `panel-diff-r1.md` to `panel-diff-r3.md` |
| Browser proof through `verify` | `browser-acceptance-a1.log`: `code-block-codemirror.spec.ts` passes 8 of 8 five times warm in Chromium, retries 0 |
| Final unit runs | `final-unit-a1.log`: 34 adapter specs and 151 Plite contract tests pass on the final bytes |
| Review ledger check | `ledger-check-a3.log`: exit 1 on the same three older plans as `ledger-check-a2.log`; nothing in this plan |

## Close

Round 3 of the diff panel deleted the wrapped-row handling that rounds 1 and 2 added, so with line wrapping on, entry lands at the edge of the first or last line and still installs the column goal, as the Defaults row for wrapped lines asks. The build made three deviations, each logged: entry asks the runtime's query directly instead of passing through `resolveVerticalNavigationPoint`; the CodeMirror query reads candidates from `domAtPos` and range rects and uses `posAtDOM` only to reject a position that walked past a widget; and because the code block host is `contenteditable=false`, only a non-editable ancestor inside CodeMirror's content counts as a widget. The run deferred the end-to-end content-root crossing test to suggested task `t_e9670768`.

The patch landed in the main checkout without its ten generated registry files, which refused to apply because main's copies hold other sessions' changes. `pnpm --filter www build:registry` then regenerated them there from the combined sources, its `--check` passes, and the adapter specs and contract tests pass on that tree.

What landed, uncommitted, for the owner to commit:

- `ExternalTextView.focus()` takes no options, `offsetAt?({ edge, x })` is a new read-only layout query, and `navigateOut`'s `x` is the goal x of an ArrowUp or ArrowDown exit (`packages/plitejs/src/react/external-text.ts`, `packages/plitejs/src/interfaces/editor.ts`).
- Plite asks the view once per crossing, under a guard that refuses every action, from the runtime of the Editable that took the keydown, and lands at the edge on a `null`, a throw or an out-of-range answer (`external-text-runtime.ts`, `content-root-vertical-geometry.ts`, `content-root-navigation.ts`, `caret-engine.ts`, `runtime-keyboard-events.ts`).
- The CodeMirror adapter answers from drawn caret rects, estimates undrawn spans from character width, and seeds CodeMirror's goal column on entry (`createCodeMirrorAdapter.ts`).
- The textarea example, both external-text docs pages and their registry mirrors, the `docs/vision/plite.md` sentence, and amended unreleased changesets for `plitejs` and `platejs`.

Proof, each from its log row's scope:

- `code-block-codemirror.spec.ts` passes 8 of 8 in five warm Chromium runs with retries off, on the final bytes against this worktree's source (`browser-acceptance-a1.log`). Every column leg failed at base `0a5cb4f411`; the ArrowLeft guard passed there.
- 34 adapter specs and 151 tests across the external-text, content-root-navigation and keyboard-input-strategy contract files pass on the final bytes (`final-unit-a1.log`).
- On the round-3 bytes, every frozen layout, style and range-read line and the landing check pass on all four cohorts, and the thrash, exit thrash, linear and off-by-one controls each fail theirs (`bench/judge-a8.log`). The benchmark reuses attempt 6's base run, because neither the base nor the probe changed.
- `pnpm lint:task` reports 0 warnings and 0 errors on the 12 task files and edits none (`lint-task-final-a1.log`), and `hand-drive.mjs check` prints `hand drive done` on the final bytes. The last hands-on visits came before the round-2 and round-3 changes; the five browser runs drive those legs after them.
- Gates already red at base stay red the same way: www `tsc` with 14 errors in four unrelated files, plitejs `create-editor-options.test.tsx`, and `pnpm check knowledge` with 36 findings.

The proof covers Chromium only, with no Firefox or WebKit run. Only a stub covers a content-root crossing into a view. Wrapped first or last lines land at their edge. A right-to-left line pays a linear pass outside the budget. Undrawn spans are estimated, so wide characters there can land a character off.

Of 11 steps, 11 are done, 0 partial, 0 skipped, 0 blocked and 0 open. The hand-drive gate is a checker pass, logged partial. The repeated "test fails before fix" rule got one more occurrence in `docs/plans/topics/correct.md`, added by hand; `/pstack:correct` did not run, and the class's check stays the owner's open work there.

### Attention

Reviewed by gpt-6.1-sol at xhigh, on frozen commit `bea2aa7217f6`, against the session transcript (`trail-sol.md`). It found nothing wrong in the code and eight problems in the log. Each now has a row.

- Two round-3 critical findings were fixed by deleting the wrapped-row code, not by rerunning the seats' cases. The log now says so.
- The run wrote 22 paths before a `started` row named them. A late row names them now; it cannot make the earlier writes covered.
- The acceptance runs did test the final bytes, because every task file's last write predates the browser runs and lint wrote none of them.
- On the final bytes only the hand-drive checker ran; the last hands-on visits came before rounds 2 and 3.
- Attempt 1's benchmark never had a line gap, and the round-2 wrapped-row reproductions prove deleted code. Both are marked partial.
- The architect runners' shared grounding file changed while they ran.
- `/pstack:correct` was not invoked; the occurrence was added by hand, and the class's check stays the owner's call.
- The base controls ran during the build, not before it, and the Entry step now names the direct runtime call it uses.

### Review inputs

The files this plan's `review_inputs` names, which its review and proof read:

- `VISION.md`
- `docs/vision/common.md`
- `packages/plitejs/src/react/editable/external-text-runtime.ts`
- `packages/plitejs/src/react/editable/caret-engine.ts`
- `packages/plitejs/src/react/editable/content-root-vertical-geometry.ts`
- `packages/plitejs/src/react/editable/runtime-keyboard-events.ts`
- `packages/plitejs/src/react/editable/editable-dom-runtime.ts`
- `packages/plitejs/src/dom/plugin/dom-geometry.ts`
- `packages/plitejs/test/react/external-text-contract.test.tsx`
- `packages/platejs/src/code-block/codemirror/createCodeMirrorAdapter.ts`
- `packages/platejs/src/code-block/codemirror/createCodeMirrorAdapter.spec.ts`
- `apps/www/src/app/(app)/examples/plite/_examples/external-text.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/authored-changes.tsx`
- `apps/www/tests/browser/code-block-codemirror.spec.ts`
- `content/docs/(guides)/external-text.mdx`
- `content/docs/plite/libraries/plite-react/external-text.mdx`
- `docs/plans/2026-10-15-codemirror-vertical-entry.md`

## Open work

- Wrapped first or last lines: with line wrapping on, entry lands at the boundary line's edge, the bridge drops selection affinity at a wrap point, and the CodeMirror adapter still exits from a wrapped first or last line by its logical line. owner: zbeyens; stop: a kit enables line wrapping in the code view, or the owner drops it.
- Leaving a view lands on the raw point next to it, so an exit next to an image or a caption skips the owner logic that a native vertical move gets. This predates the plan. owner: zbeyens; stop: a suggested task takes it or the owner drops it.
- No test drives a content-root vertical crossing into an external view end to end, so only a stub covers the keydown probe's `askExternalViews: false`. Suggested task `t_e9670768` holds it. owner: zbeyens; stop: that task lands or the owner drops it.
- The imprecise `posAtCoords` in CodeMirror 6.41.0 multiplies by the character width (`cursor.ts:39`). An upstream report is a public message, so it waits as a draft for the owner. owner: zbeyens; stop: the owner sends or drops it.
