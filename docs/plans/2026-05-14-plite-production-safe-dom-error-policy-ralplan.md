---
date: 2026-05-14
topic: plite-production-safe-dom-error-policy
status: done
score: 0.93
completion: active goal state
superseded_by: docs/plans/2026-05-14-plite-total-runtime-error-policy-ralplan.md
current_pass: closure-score-and-final-gates
current_pass_status: complete
next_pass: none
---

# Plite Production-Safe DOM Error Policy Ralplan

Superseded by
`docs/plans/2026-05-14-plite-total-runtime-error-policy-ralplan.md`.

## 1. Current Verdict

Yes, rearchitect this. The current direction is half right and half ugly.

Strict DOM helpers are allowed to throw when a direct caller asks for an
impossible model/DOM mapping. Browser runtime paths, focus/scroll paths, event
range paths, and first-party examples must not use thrown exceptions as ordinary
control flow.

The mentions example shape is the smell:

```ts
let domRange: globalThis.Range;
try {
  domRange = editor.dom.toDOMRange(target);
} catch {
  return;
}
```

That is acceptable as a temporary local guard. It is bad API design if app
authors are expected to copy it. The target is:

```ts
const rect = editor.dom.getRangeRect(target);
if (!rect) return;
```

or, when the caller really needs the native `Range`:

```ts
const domRange = editor.dom.tryToDOMRange(target);
if (!domRange) return;
```

Score is `0.93`, done by Plite Ralplan rules. That means the plan is ready for a
later `ralph` execution pass, not that the Plite implementation already
landed.

## 2. Intent And Boundary Record

Intent:

- Make Plite production-safe around transient DOM/model mismatch without
  muting real programmer errors.
- Remove `try/catch { return }` from first-party examples and hot runtime code
  as the normal way to survive DOM projection gaps.

Desired outcome:

- Direct strict helper calls still fail loudly.
- Runtime-owned browser paths fail closed for recoverable DOM timing, stale
  node-map, foreign selection, nested-editor, shadow-root, composition, and
  app-owned DOM cases.
- Consumers get simple non-throwing helpers for overlay and event code.
- Tests can assert exact failure reasons without making hot paths allocate rich
  objects on every `selectionchange`.

In scope:

- `plite-dom` DOM point, range, node, path, event range, and rect projection.
- `plite-react` selection import/export, focus restore, scroll restore,
  autocomplete/portal positioning, beforeinput target ranges, and repair paths.
- Public DOM helper naming and deprecation/removal of public `suppressThrow`.
- Issue accounting for DOM resolution crash families.

Non-goals:

- Do not make every Plite core data-model API nullable.
- Do not hide invariant bugs from tests, direct library callers, or dev tooling.
- Do not use React error boundaries as the recovery plan.
- Do not claim mobile/IME/shadow/focus issues fixed without exact browser or
  device proof.
- No implementation code in this Plite Ralplan pass.

Decision boundaries:

- `to*` and `find*` helpers stay strict by default.
- `try*` helpers return `T | null` and are the public app/runtime escape hatch.
- Structured reasons are internal/test/debug data unless a later pass proves a
  public diagnostics object is worth the API cost.
- Production runtime recovers only from known recoverable classes; internal
  invariants still throw or route through the fatal error handler.

## 3. Decision Brief

Principles:

- Throw for impossible direct API contracts.
- Return `null` for recoverable browser timing and ownership gaps.
- Classify before converting DOM to model state.
- Keep hot paths primitive.
- Give tests and diagnostics richer reason data without leaking browser policy
  into app code.

Top drivers:

- The issue corpus names `Selection, Focus, And DOM Bridge` as the largest raw
  cluster at `172` issues.
- `plite-dom-v2` owns DOM point/path translation, shadow DOM ownership, nested
  editor boundaries, and selection bridge mechanics.
- `plite-react-v2` owns lifecycle, focus timing, React-facing events, and render
  timing.
- Live Plite already uses `suppressThrow: true` in some React runtime paths,
  but strict helpers and examples still require opaque catches.

Viable options:

| Option                                                                                                 | Pros                                                  | Cons                                                               | Verdict               |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------ | --------------------- |
| A. Make all DOM helpers return `null`                                                                  | Safer for apps                                        | Hides invariant bugs; weak tests; bad direct API                   | reject                |
| B. Keep strict helpers and tell users to catch                                                         | Minimal code                                          | Bad DX; examples teach cargo-cult catches; telemetry loses reasons | reject                |
| C. Keep strict helpers, add public `try*` helpers, internal classifier, and recoverable runtime policy | Clear DX; preserves invariants; matches other editors | Requires API cleanup and focused proof                             | choose                |
| D. Add only `onError` / error boundary guidance                                                        | Easy story                                            | Still crashes before recovery; treats symptoms as architecture     | reject                |
| E. Copy ProseMirror/Lexical wholesale                                                                  | Battle-tested pieces                                  | Wrong document model and runtime ownership for Plite               | partial evidence only |

Chosen direction:

- Strict helpers remain the sharp tools.
- Public app-friendly helpers become non-throwing and nullable.
- Internal runtime uses a classifier that can produce cheap primitive results on
  hot paths and detailed reason objects in tests/debug traces.
- `suppressThrow` disappears from public DX. Boolean flags that change exception
  semantics are bad discoverability.

## 4. Confidence Scorecard

| Dimension                                                | Score | Evidence                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |  0.92 | Hot path stays `Range                                                                                                                                                                                                                                                                                                                                                           | null`/`DOMRange                                                                                                                                                  | null`; rich reason objects are for diagnostics. Current source already gates selection import with `hasSelectableTarget`before`toPliteRange`in`packages/plite-react/src/editable/selection-controller.ts:278`and uses`suppressThrow: true`at`:284-287`. |
| Plite-close unopinionated DX                             |  0.95 | Strict helpers stay strict in the current public surface at `packages/plite-dom/src/plugin/dom-editor.ts:75-108`; nullable mirrors replace `suppressThrow` for app/runtime code; `getRangeRect` covers the exact mentions smell at `apps/www/src/app/(app)/examples/plite/_examples/mentions.tsx:123-129`.                                                                         |
| Plate and slate-yjs migration backbone                   |  0.90 | Runtime emits model `Range                                                                                                                                                                                                                                                                                                                                                      | null`, not raw DOM ranges, so Plate overlays and Yjs cursors do not depend on transient browser state. Collaboration still treats `internal-invariant` as fatal. |
| Regression-proof testing                                 |  0.93 | Existing bridge and selection-controller focused gate passed in `Plate repo root`; execution adds strict/nullable paired tests, public-surface contract, reconciler repair tests, mentions browser row, and shadow event-range row.                                                                                                                                               |
| Research evidence completeness                           |  0.94 | ProseMirror strict `posAtDOM` vs nullable runtime APIs is grounded in `../prosemirror-view/src/index.ts:373-423` and `../prosemirror-view/src/selection.ts:9-47`; Lexical error/update tags in `../lexical/README.md:52-55` and `../lexical/packages/lexical/src/LexicalUpdateTags.ts:45-59`; Tiptap rect helper in `../tiptap/packages/core/src/helpers/posToDOMRect.ts:5-35`. |
| shadcn-style composability and hook/component minimalism |  0.91 | No new React component props required for normal use; optional diagnostics can be centralized later. Public helpers are capability methods, not UI policy.                                                                                                                                                                                                                      |

Total: `0.93`.

Status: `done`. Closure means the planning target is precise enough to execute.

## 5. Current Source Findings

| Surface                                   | Current shape                                                                                                                                                                      | Problem                                                                                        |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `DOMEditor.toDOMPoint`                    | Throws when it cannot map a model point to mounted DOM (`packages/plite-dom/src/plugin/dom-editor.ts:91`, implementation starts at `:885`).                          | Correct for strict direct calls, unsafe for runtime projection without a non-throwing wrapper. |
| `DOMEditor.toDOMRange`                    | Calls strict `toDOMPoint` for anchor/focus (`packages/plite-dom/src/plugin/dom-editor.ts:975-981`).                                                                  | Any transient missing DOM leaf becomes a thrown exception.                                     |
| `DOMEditor.toPlitePoint` / `toPliteRange` | Already supports `suppressThrow` and returns `null` in runtime paths (`packages/plite-dom/src/plugin/dom-editor.ts:94-108`, `:1050-1080`, `:1458-1495`).             | The boolean option is awkward public DX and erases reason data.                                |
| `DOMEditor.findPath`                      | Uses runtime id fallback, then weak-map parent/index, then throws (`packages/plite-dom/src/plugin/dom-editor.ts:618-638`).                                           | `tryFindPath` is still missing for app/event code and `#5697` / `#5938` pressure.              |
| `DOMEditor.findEventRange`                | Throws for missing coordinates or unresolved DOM range, then calls `toPliteRange(... suppressThrow: false)` (`packages/plite-dom/src/plugin/dom-editor.ts:530-604`). | Drop/drag/event code should have a nullable event-range API.                                   |
| `selection-controller`                    | Imports DOM selection with ownership guards and `suppressThrow: true` (`packages/plite-react/src/editable/selection-controller.ts:278-287`).                         | Good direction, but still falls back to strict `toDOMRange` on export (`:737-742`).            |
| `selection-reconciler`                    | Uses nullable import paths in places (`packages/plite-react/src/editable/selection-reconciler.ts:618-675`) and catches `toDOMRange` during repair (`:932-935`).      | Correct recovery intent, but the catch belongs behind a named helper.                          |
| `mentions` example                        | Catches `editor.dom.toDOMRange(target)` and returns (`apps/www/src/app/(app)/examples/plite/_examples/mentions.tsx:123-129`).                                                                       | This is the public DX failure the user called out.                                             |
| `hovering-toolbar` example                | Reads native DOM selection rect directly.                                                                                                                                          | Works only when DOM selection is already the right owner; no model-to-DOM rect helper.         |
| `lines.ts`                                | Uses strict `DOMEditor.toDOMRange(...).getBoundingClientRect()`.                                                                                                                   | Internal utility needs a strict or nullable choice, not accidental throws.                     |

Key existing solution notes:

- Focus restore should fail closed on transient DOM point gaps.
- Mentions portal positioning should fail closed on transient DOM range gaps.
- Foreign DOM selections must be ignored before import.
- DOM selection bridges must stay cheap on `selectionchange`.

## 6. Ecosystem Strategy Synthesis

| Reference   | Mechanism observed                                                                                                                                   | Plite target                                                                                            | Verdict               |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------- | ----- |
| ProseMirror | `posAtDOM` throws for direct invalid DOM positions, while `posAtCoords` and `selectionFromDOM` return `null` for user/runtime uncertainty.           | Keep strict direct APIs, add nullable runtime/app APIs.                                                 | agree                 |
| ProseMirror | `selectionToDOM` owns import/export centrally and catches browser `Selection` weirdness locally.                                                     | Centralize recovery in Plite DOM/React runtime, not in every example.                                   | agree                 |
| Lexical     | `onError` is a central fatal error hook, but DOM selection code still guards nested/foreign editor selection and can return previous/null selection. | Add recoverable classification before fatal errors; do not rely on React boundaries.                    | partial               |
| Lexical     | `SKIP_DOM_SELECTION_TAG`, `SKIP_SELECTION_FOCUS_TAG`, and `SKIP_SCROLL_INTO_VIEW_TAG` separate update intent from DOM side effects.                  | Keep Plite's selection side-effect policy explicit; route recoverable DOM failures through that policy. | agree                 |
| Tiptap      | `posToDOMRect(view, from, to)` gives product code a rectangle helper for menus and suggestions.                                                      | Add `editor.dom.getRangeRect(range): DOMRect                                                            | null` for overlay DX. | agree |
| Tiptap      | Engine behavior still comes from ProseMirror.                                                                                                        | Use Tiptap as DX evidence, not as engine evidence.                                                      | partial               |

What Plite should steal:

- ProseMirror's strict-vs-runtime split.
- Lexical's central fatal `onError` plus update tags that suppress DOM side
  effects intentionally.
- Tiptap's rectangle helper for menus/suggestions.

What Plite should reject:

- ProseMirror integer positions as the public coordinate system.
- Lexical class-node/runtime replacement.
- Tiptap command-chain ceremony as the required mutation model.
- Public app-authored DOM selection classification hooks.

## 7. Public API Target

Keep strict helpers:

```ts
editor.dom.toDOMPoint(point): DOMPoint
editor.dom.toDOMRange(range): globalThis.Range
editor.dom.toPlitePoint(domPoint, options): Point
editor.dom.toPliteRange(domRange, options): Range
editor.dom.findPath(node): Path
editor.dom.findEventRange(event): Range
```

Add nullable helpers:

```ts
editor.dom.tryToDOMPoint(point): DOMPoint | null
editor.dom.tryToDOMRange(range): globalThis.Range | null
editor.dom.tryToPlitePoint(domPoint, options): Point | null
editor.dom.tryToPliteRange(domRange, options): Range | null
editor.dom.tryFindPath(node): Path | null
editor.dom.tryFindEventRange(event): Range | null
editor.dom.getRangeRect(range): DOMRect | null
```

Concrete implementation contract:

| Helper              | Implementation target                                                                                                                                                                                                                                                                                                                                                     | Strict counterpart                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `tryToDOMPoint`     | Do not implement as a naked `try { toDOMPoint } catch { null }`. Factor the resolver behind `toDOMPoint` into `resolveDOMPoint(editor, point, mode)`, where nullable mode returns `null` for `unmounted-node`, `stale-node-map`, `covered-range-boundary`, `void-boundary`, and `composition-transient`, while `invalid-model-range` and `internal-invariant` stay fatal. | `toDOMPoint` calls the same resolver in strict mode and throws typed `DOMResolveError`. |
| `tryToDOMRange`     | Resolve anchor/focus through nullable point resolution, build a native `Range`, catch only DOM `setStart` / `setEnd` mismatch caused by stale/foreign DOM, and return `null`.                                                                                                                                                                                             | `toDOMRange` stays strict and still throws for impossible model ranges.                 |
| `tryToPlitePoint`   | Rename the current `suppressThrow` behavior into a real helper. Keep `exactMatch` and `searchDirection`, but remove the exception-policy boolean from public options.                                                                                                                                                                                                     | `toPlitePoint` defaults to strict and throws typed errors for direct invalid calls.     |
| `tryToPliteRange`   | Use nullable point resolution for anchor/focus and return `null` when either endpoint is not recoverable.                                                                                                                                                                                                                                                                 | `toPliteRange` stays the invariant API.                                                 |
| `tryFindPath`       | Share `findPath` internals. Return runtime-id path when available, weak-map path when available, `null` when the node is not owned/mounted, and throw only for broken editor invariants in strict mode.                                                                                                                                                                   | `findPath` keeps the current throw-on-missing contract.                                 |
| `tryFindEventRange` | Validate coordinates and target ownership first; use `caretRangeFromPoint` / `caretPositionFromPoint`; return `null` for missing caret range or foreign/shadow mismatch; call `tryToPliteRange`.                                                                                                                                                                          | `findEventRange` remains strict for direct drag/drop callers that want failure.         |
| `getRangeRect`      | Call `tryToDOMRange`, use `getClientRects()[0] ?? getBoundingClientRect()`, normalize zero/empty rects to `null` when the range is not measurable, and never expose native `Range` when the caller only needs geometry.                                                                                                                                                   | `toDOMRange(...).getBoundingClientRect()` remains available for invariant tests.        |

Typed error shape:

```ts
class DOMResolveError extends Error {
  phase: DOMResolvePhase;
  reason: DOMResolveReason;
  recoverable: boolean;
}
```

The public API should expose nullable helpers, not this class, unless a later
debugging pass proves public diagnostics are worth the surface area.

Public cleanup:

- Remove public `suppressThrow` from `toPlitePoint` / `toPliteRange`.
- If compatibility is needed for a draft release, keep it internal or deprecated
  behind a type test that prevents docs/examples from using it.
- JSDoc must say when to use strict vs nullable:
  - strict helpers are for invariants and tests;
  - `try*` helpers are for browser events, overlays, focus, scroll, and app DOM.

Recommended first-party example:

```ts
useEffect(() => {
  if (!target || chars.length === 0 || !ref.current) return;

  const rect = editor.dom.getRangeRect(target);
  if (!rect) return;

  ref.current.style.top = `${rect.top + window.pageYOffset + 24}px`;
  ref.current.style.left = `${rect.left + window.pageXOffset}px`;
}, [chars.length, editor, target]);
```

## 8. Internal Runtime Target

Internal classifier:

```ts
type DOMResolvePhase =
  | "model-to-dom"
  | "dom-to-model"
  | "event-to-model"
  | "range-rect";

type DOMResolveReason =
  | "unmounted-node"
  | "stale-node-map"
  | "foreign-dom"
  | "nested-editor-boundary"
  | "shadow-boundary"
  | "covered-range-boundary"
  | "void-boundary"
  | "composition-transient"
  | "invalid-dom-selection"
  | "invalid-model-range"
  | "missing-caret-range"
  | "internal-invariant";

type DOMResolveResult<T> =
  | { ok: true; value: T }
  | {
      ok: false;
      phase: DOMResolvePhase;
      reason: DOMResolveReason;
      recoverable: boolean;
    };
```

Hot path policy:

- `selectionchange`, `beforeinput`, focus restore, and scroll export should use
  primitive nullable wrappers unless tracing is enabled.
- Unit tests and debug traces can request `DOMResolveResult<T>`.
- Do not allocate reason objects on every selectionchange by default.
- Do containment and ownership checks before model/DOM conversion.

Recoverability policy:

| Reason                   | Runtime action                                                   |
| ------------------------ | ---------------------------------------------------------------- |
| `foreign-dom`            | ignore import, keep model selection or null                      |
| `nested-editor-boundary` | ignore for parent, let focused child own input                   |
| `stale-node-map`         | defer or repair after commit; do not crash                       |
| `unmounted-node`         | return null for overlay/focus/scroll; strict helper still throws |
| `composition-transient`  | defer to composition/native input owner                          |
| `shadow-boundary`        | use root-aware path if supported, otherwise null                 |
| `invalid-model-range`    | strict throw for direct calls; runtime null plus recovery        |
| `internal-invariant`     | throw or route to fatal `onError`                                |

Scrubber policy:

- Keep scrubber for safe serialization of fatal errors and debug events.
- Do not treat scrubber/error-boundary guidance as runtime recovery.

## 9. Hook, Component, And Render DX Target

- No new React hook is needed for normal app code.
- `useElementSelected`, selection selectors, and overlay code should consume
  model state plus `editor.dom.getRangeRect`.
- First-party examples must not teach `try/catch` around `toDOMRange`.
- If diagnostics are exposed, prefer a single optional callback:

```ts
onRecoverableError?: (event: SlateRecoverableErrorEvent) => void
```

This callback is for telemetry and debugging only. It must not be required for
correct behavior.

## 10. Plate Migration Backbone

Plate wants stable model data, not raw DOM recovery details.

Target:

- Plate overlays can ask for `DOMRect | null`.
- Plate table/void/inline UI can rely on Plite ignoring foreign/native DOM
  selections without crashing.
- Plate does not need to author DOM-selection policy.
- Recoverable errors can feed developer diagnostics without changing Plate's
  plugin contract.

## 11. slate-yjs Migration Backbone

Collaboration adapters should never consume raw DOM ranges.

Target:

- Local DOM selection import becomes a model `Range | null`.
- Remote cursors and selections stay model-backed.
- Recoverable local DOM projection errors do not affect remote awareness.
- `internal-invariant` remains fatal, because collaboration cannot safely hide
  corrupted operation/state invariants.

## 12. Issue-Ledger Accounting

ClawSweeper status: cache-first read applied. No broad live GitHub discovery was
needed.

Fixed floor to preserve:

- `Fixes #4789`: outside-to-inside native selection is ignored without DOM point
  crash.
- `Fixes #4984`: parent selection crossing into nested editor is ignored
  without DOM point crash.

Do not add new `Fixes #...` claims from this plan.

Issues this plan should improve or classify:

| Issue                                                | Target classification               | Why                                                                                                                           |
| ---------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `#3641`                                              | Improves                            | This directly answers "exceptions too liberally" by making runtime paths non-throwing. Needs exact historical repro to close. |
| `#3948`                                              | Improves                            | Production runtime becomes less crash-prone, but the issue needs current minimal repro before exact closure.                  |
| `#4088`                                              | Improves or Fixes after browser row | Mentions portal gets `getRangeRect` / `tryToDOMRange`; exact example proof can close if replayed.                             |
| `#4643`                                              | Improves                            | Invalid selection should be classified as recoverable unless it violates invariants.                                          |
| `#4564`                                              | Improves                            | Programmatic removal stale-DOM projection returns null in runtime; exact repro still required.                                |
| `#4851`                                              | Related/Improves                    | Katex/contenteditable false DOM point needs exact app-owned DOM proof.                                                        |
| `#5697`                                              | Improves                            | Add `tryFindPath` and keep runtime-id fallback; exact performance/reliability proof required.                                 |
| `#5938`                                              | Improves                            | Same path-computation family as `tryFindPath`; no exact closure without current repro.                                        |
| `#5690`                                              | Related                             | Inline boundary double-click/delete needs browser gesture proof.                                                              |
| `#5107`, `#5749`, `#4337`                            | Related/Improves                    | Shadow DOM event-range gets nullable `tryFindEventRange`; exact rows needed.                                                  |
| `#5711`, `#5066`, `#4847`, `#5014`, `#4001`, `#3568` | Related                             | IME/mobile/keyboard rows need device/browser-specific proof.                                                                  |
| `#5435`, `#5355`                                     | Related                             | Read-only/table DOM selection crash pressure, exact table/readonly proof needed.                                              |

Issue-sync pass result:

- `docs/plite-issues/gitcrawl-live-open-ledger.md` was read for current open
  rows. Relevant rows include `#5938`, `#5697`, `#3948`, `#3641`, `#4984`,
  `#4789`, `#4564`, `#4643`, and `#4088`.
- Existing fixed floor is already synced in
  `docs/plite/ledgers/issue-coverage-matrix.md:57-58` and
  `docs/plite-issues/gitcrawl-v2-sync-ledger.md:323-347`.
- Existing related rows already cover `#4851`, `#4643`, `#4337`, `#4088`,
  `#3641`, and `#3568` in
  `docs/plite/ledgers/issue-coverage-matrix.md:236-249`.
- Existing fork dossier rows already cover `#4851`, `#4643`, `#4088`, and
  `#3641` in `docs/plite/ledgers/fork-issue-dossier.md:3386-3407`,
  `:3452-3473`, `:3609-3629`, and `:4177-4197`.
- Manual sync change in this pass: `#4088` moved from stale
  `docs/examples not-claimed` wording to the current `v2-dom-selection`
  related classification, because this plan directly targets mentions range
  geometry.
- No PR-description update in this pass. The accepted code/API shape has not
  landed in `Plate repo root`, and no new fixed issue claim exists.

## 13. Legacy Regression Proof Matrix

| Behavior family         | Required proof                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Strict helper invariant | Strict `toDOMPoint`, `toDOMRange`, `findPath`, `findEventRange` still throw in direct invalid calls.                      |
| Nullable helper DX      | `tryToDOMPoint`, `tryToDOMRange`, `tryFindPath`, `tryFindEventRange`, `getRangeRect` return `null` for recoverable cases. |
| DOM-to-model import     | Foreign/nested/stale DOM selections classify before conversion and do not throw.                                          |
| Model-to-DOM export     | Selection export and scroll restore tolerate unmounted or stale DOM.                                                      |
| Mention/overlay rect    | Mention portal and hovering/floating UI can position or skip without React error fallback.                                |
| Shadow/event range      | Shadow-root drag/drop event range returns `null` or valid range, never production crash.                                  |
| IME/composition         | Composition transient DOM mismatch is deferred to native/composition owner.                                               |
| Telemetry               | Recoverable errors can be counted in tests/debug without crashing production.                                             |

## 14. Browser Stress And Parity Strategy

Minimum browser rows before exact claims:

- Chromium outside-to-inside native selection regression floor.
- Chromium parent-to-nested editor selection regression floor.
- Mentions portal target stale DOM row for `#4088`.
- Shadow DOM drag/drop event-range row for `#5107` / `#5749` / `#4337`.
- Focus/scroll restore row for `#5538` / `#5826` only if this plan touches
  export/scroll policy.
- Firefox multi-range/table/read-only row before any table/read-only closure.
- Mobile/IME raw device row before `#5711`, `#5066`, `#4847`, or `#5014`
  closure.

## 15. Applicable Implementation-Skill Review Matrix

| Skill                       | Status  | Reason                                                                                                                           |
| --------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Vercel React best practices | skipped | No React rendering implementation in this planning pass. Later execution should apply it to `selection-controller` and examples. |
| performance-oracle          | applied | Hot path primitive return policy rejects rich object allocation on `selectionchange`.                                            |
| tdd                         | planned | Execution must start with strict-vs-nullable unit tests and one browser RED for the example/runtime path touched.                |
| shadcn                      | skipped | No UI component library work.                                                                                                    |
| react-useeffect             | planned | Example rewrites must keep effect dependencies narrow and avoid stale DOM refs.                                                  |

## 16. High-Risk Deliberate Pass

Trigger:

- Public DOM API, browser runtime behavior, focus/scroll behavior, and issue
  claims.

Blast radius:

- `packages/plite-dom/src/plugin/dom-editor.ts`
- `packages/plite-react/src/editable/selection-controller.ts`
- `packages/plite-react/src/editable/selection-reconciler.ts`
- `packages/plite-react/src/hooks/android-input-manager/android-input-manager.ts`
- `site/examples/ts/mentions.tsx`
- `site/examples/ts/hovering-toolbar.tsx`
- DOM bridge, selection, focus, shadow, and IME tests

Pre-mortem:

| Failure                   | Why it happens                                                       | Prevention                                                                   |
| ------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Silent data corruption    | `try*` hides a real model invariant bug.                             | Keep strict helpers and direct-call tests; `internal-invariant` stays fatal. |
| Hot path slowdown         | Classifier allocates reason objects on every selectionchange.        | Primitive nullable hot path; reason objects only for tests/debug.            |
| Overclaimed issue closure | Generic no-throw behavior is treated as fixing all DOM point issues. | Exact issue-shaped browser/device proof before `Fixes #...`.                 |

Verdict: keep the plan, but split implementation into API, runtime, example,
and proof phases.

## 17. Hard Rejections

- No blanket "never throw" policy.
- No public `suppressThrow` boolean as the future API.
- No raw DOM range output to collaboration adapters.
- No public app-authored DOM ownership classifier.
- No React error boundary or scrubber recommendation as the main answer.
- No exact `Fixes #...` claim without issue-shaped proof.

## 18. Plite Maintainer Objection Ledger

| Objection                                         | Answer                                                                                                                                                                               | Verdict              |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------- | ---- |
| "Throwing is how users know their DOM is broken." | Direct strict helpers still throw. Runtime paths stop turning recoverable browser timing into app crashes.                                                                           | keep                 |
| "This bloats the public API."                     | The API adds predictable `try*` mirrors for existing sharp helpers and one rect helper that examples already need. It removes the worse `suppressThrow` boolean from user-facing DX. | keep                 |
| "Null loses useful debugging context."            | Runtime hot paths return null; tests/debug traces can request structured reasons.                                                                                                    | keep                 |
| "Apps may need custom DOM policies."              | Apps get `DOMRect                                                                                                                                                                    | null`and model`Range | null`. Raw DOM policy remains Plite-owned until a concrete use case proves otherwise. | keep |
| "This could hide real bugs in production."        | Only classified recoverable reasons fail closed. `internal-invariant` stays fatal.                                                                                                   | keep                 |

## 19. Pass Schedule And Pass-State Ledger

| Pass                           | Status   | Evidence                                                                                      |
| ------------------------------ | -------- | --------------------------------------------------------------------------------------------- |
| 1. Current-state read          | complete | Live `Plate repo root` DOM editor, selection controller, selection reconciler, examples, tests. |
| 2. Related issue cache read    | complete | Cached live ledger, coverage matrix, fork dossier, requirements file.                         |
| 3. Ecosystem comparison        | complete | Local ProseMirror, Lexical, Tiptap source plus compiled editor architecture pages.            |
| 4. Intent and decision brief   | complete | Sections 2 and 3.                                                                             |
| 5. High-risk and steelman pass | complete | Sections 16 and 18.                                                                           |
| 6. Issue-sync write pass       | complete | Cache-first issue ledgers read; `#4088` stale sync row updated; no new fixed claims.          |
| 7. Closure score               | complete | Score `0.93`; plan is ready for later `ralph` execution.                                      |

## 20. Plan Deltas From Review

Accepted:

- Add `try*` helpers instead of requiring app-level catches.
- Add `getRangeRect` because overlays/suggestions need a first-class rectangle
  helper.
- Keep strict helpers strict.
- Replace public `suppressThrow` with clearer helper names.
- Keep structured reasons out of default hot paths.

Dropped:

- Blanket non-throwing DOM API.
- Public recoverable reason objects as the normal app API.
- React error boundary guidance as the main fix.

Unchanged:

- Exact issue closure still requires exact proof.
- Mobile/IME rows stay related without raw device/browser proof.

## 21. Open Questions

- Should `getRangeRect` live in `plite-dom` only, or be re-exported through
  `plite-react` capability for app ergonomics?
- Should `onRecoverableError` live on `<Plite>`, `<Editable>`, or editor
  extension options?
- Is `suppressThrow` already published to external users, or can it be removed
  outright as pre-release API?
- Do we need `tryToDOMNode` and `tryToPliteNode`, or do `tryFindPath` plus range
  helpers cover real app needs?

My take:

- Put `getRangeRect` on `editor.dom`.
- Add `onRecoverableError` only after execution proves diagnostics need public
  exposure.
- Remove `suppressThrow` hard if this is still pre-release.
- Add `tryToDOMNode` / `tryToPliteNode` only if first-party code has real call
  sites after the main helpers land.

## 22. Implementation Phases With Owners

| Phase                        | Owner                       | Work                                                                                       | Proof                                                                                           |
| ---------------------------- | --------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| 1. API contract              | `plite-dom`                 | Add `try*` helpers and `getRangeRect`; keep strict helpers. Remove public `suppressThrow`. | `public-surface-contract`, `bridge.ts`, type tests.                                             |
| 2. Internal classifier       | `plite-dom`                 | Implement shared classifier/result helpers behind strict and nullable APIs.                | Reason tests for stale, foreign, nested, shadow, invalid model range.                           |
| 3. React runtime consumption | `plite-react`               | Replace catch-based runtime export/import paths with nullable helpers.                     | `selection-controller-contract`, `selection-reconciler-contract`, `dom-repair-policy-contract`. |
| 4. Examples and app DX       | `site/examples`             | Rewrite mentions and overlay examples to `getRangeRect` / `tryToDOMRange`.                 | Mentions browser row, hovering toolbar row if needed.                                           |
| 5. Shadow and event range    | `plite-dom` + `plite-react` | Add `tryFindEventRange` and route drag/drop/event callers.                                 | Shadow DOM Playwright row.                                                                      |
| 6. Issue accounting          | `plate-2` docs              | Sync ledgers only for accepted code/proof changes.                                         | Coverage matrix, fork dossier, v2 sync ledger.                                                  |

## 23. Fast Driver Gates

Verification run during this planning pass:

```bash
cd /Users/zbeyens/git/plite
bun test ./packages/plite-dom/test/bridge.ts ./packages/plite-react/test/selection-controller-contract.ts
```

Result: passed, `30` tests, `73` assertions.

Planning-state check during this pass:

```bash
cd /Users/zbeyens/git/plate-2
bun run completion-check
```

Result after closure: passed. The active completion file is
`active goal state` with
`status: done`.

Focused Plite execution gates:

```bash
cd /Users/zbeyens/git/plite
bun test ./packages/plite-dom/test/bridge.ts ./packages/plite-dom/test/public-surface-contract.ts
bun test ./packages/plite-react/test/selection-controller-contract.ts ./packages/plite-react/test/selection-reconciler-contract.ts ./packages/plite-react/test/dom-repair-policy-contract.ts
```

Browser gates after examples/runtime changes:

```bash
cd /Users/zbeyens/git/plite
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/mentions.test.ts --project=chromium --grep "mention|portal|DOM range"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "outside the editor|selectionchange|repair"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "nested editor|parent selection"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/shadow-dom.test.ts --project=chromium --grep "drag|drop|range|selection"
```

Public API/type gate:

```bash
cd /Users/zbeyens/git/plite
bun --filter plite-dom typecheck
bun --filter plite-react typecheck
```

## 24. Final User-Review Handoff Outline

When ready for review, the handoff should say:

- Strict helpers still throw.
- Production/browser paths use nullable helpers.
- First-party examples no longer teach catch-and-return around DOM projection.
- `suppressThrow` is gone from public DX or kept internal only.
- Exact issue claims remain conservative.
- Runtime recovery is measured and tested, not hidden behind an error boundary.

## 25. Final Completion Gates

This plan is `done` for planning when:

- Issue-sync pass is complete and no new `Fixes #...` claims were added.
- The public API target has no "maybe" language.
- Execution phases list exact file/test owners.
- The implementation-proof design names each helper and strict counterpart.
- `bun run completion-check` passes with `status: done`.

Execution remains separate:

- A later `ralph` run must implement this in `Plate repo root`.
- That run must prove the implementation with the `Plate repo root` unit/type/browser
  gates named in section 23.
- Only after those gates pass may the ledgers or PR narrative promote any issue
  from related/improves to `Fixes #...`.
