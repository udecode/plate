---
date: 2026-05-14
topic: slate-v2-total-runtime-error-policy
status: done
score: 0.98
completion: .tmp/019e24a3-51de-7203-8b05-54d3914c394a/completion-check.md
supersedes: docs/plans/2026-05-14-slate-v2-production-safe-dom-error-policy-ralplan.md
current_pass: hard-cut-suppress-throw-shim
current_pass_status: complete
next_pass: none
---

# Slate v2 Total Runtime Error Policy Ralplan

## 1. Verdict

The previous plan was directionally right but too small.

Do not ship a `tryToDOMRange` family as the public fix. That still makes the
API look like JavaScript exception plumbing. The better shape is a strict vs
resolver split:

```ts
editor.dom.toDOMRange(range); // strict invariant API, may throw
editor.dom.resolveDOMRange(range); // runtime/app API, returns DOMRange | null
```

Hard cuts:

- Future public API must not teach `suppressThrow`.
- Remove public `suppressThrow`.
- Do not add public `tryTo*` helpers.
- Do not let Slate React runtime code call strict DOM projection helpers for
  recoverable browser/model gaps.
- Do not rely on React error boundaries, scrubbers, or app-authored catches as
  the recovery architecture.

`slate-react` core runtime should never throw for recoverable DOM/model
projection. Strict throws can remain in direct `slate-dom` APIs, tests,
developer misuse guards, and fatal invariant handlers. They must not be normal
edge-case handling inside selection, focus, beforeinput, Android, clipboard,
drop, overlay, or example flows.

## 2. Why `null`, Not `undefined`

Use `null`.

Reason:

- Slate already models absent selection/range as `Range | null`.
- Current resolver-like code in Slate v2 already returns `null` in places:
  `RangeApi.transform`, bookmarks, annotations, DOM coverage, and the current
  `suppressThrow` paths.
- DOM APIs and ProseMirror runtime APIs use `null` for "not resolvable" states:
  `Selection.focusNode`, `nodeDOM`, `posAtCoords`, and `selectionFromDOM`.
- `undefined` is better for optional inputs, omitted config, and cache misses.
  DOM projection failure is an explicit negative result, not an omitted value.

Public resolver rule:

```ts
type Resolve<T> = T | null;
```

No `undefined` return values for public DOM projection resolvers.

## 3. Original Source Inventory

Original public DOM surface before this plan landed:

- `DOMEditorCapability` exposes strict `findEventRange`, `findPath`,
  `toDOMNode`, `toDOMPoint`, `toDOMRange`, `toSlateNode`, `toSlatePoint`, and
  `toSlateRange` at
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:69-108`.
- `toSlatePoint` and `toSlateRange` exposed `suppressThrow` in public option
  objects at `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:94-108`
  and wrapper exports at `:1558-1580`.

Original `suppressThrow` surface:

| File                                                                            | Count | Meaning                                                               |
| ------------------------------------------------------------------------------- | ----: | --------------------------------------------------------------------- |
| `packages/slate-dom/src/plugin/dom-editor.ts`                                   |    24 | Public option plus internal branching.                                |
| `packages/slate-react/src/editable/selection-controller.ts`                     |     3 | Runtime DOM selection import.                                         |
| `packages/slate-react/src/editable/selection-reconciler.ts`                     |     5 | Runtime beforeinput, selection import, repair.                        |
| `packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts` |     2 | Android target range import.                                          |
| Tests                                                                           |    13 | Strict/null behavior assertions that must become resolver assertions. |

Current strict DOM projection calls outside `dom-editor.ts`:

| Area                         | Files                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| DOM utils                    | `range-list.ts`, `lines.ts`                                                         |
| Clipboard DOM runtime        | `dom-clipboard-runtime.ts`                                                          |
| React selection runtime      | `selection-controller.ts`, `selection-reconciler.ts`                                |
| React input runtime          | `native-input-strategy.ts`, `runtime-before-input-events.ts`, Android input manager |
| React clipboard/drop runtime | `clipboard-input-strategy.ts`                                                       |
| React validation/hooks       | `editable-text-blocks.tsx`, `use-element-selected.ts`                               |
| Examples                     | `mentions.tsx`, `images.tsx`, `embeds.tsx`, `check-lists.tsx`                       |

Hot examples of the wrong original shape:

- `ReactEditor.toSlateRange(... suppressThrow: true)` in selection controller at
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-controller.ts:284-287`,
  `:491-495`, and `:608-612`.
- Strict `ReactEditor.toDOMRange(editor, selection)` fallback in selection
  export at `.tmp/slate-v2/packages/slate-react/src/editable/selection-controller.ts:737-742`.
- Catch-and-ignore around strict `toDOMRange` in selection repair at
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts:930-935`.
- Strict `ReactEditor.toDOMPoint` in native input strategy at
  `.tmp/slate-v2/packages/slate-react/src/editable/native-input-strategy.ts:56-57`.
- Strict `ReactEditor.findEventRange` in drop handling at
  `.tmp/slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts:440-442`.
- Mentions example catch around `editor.dom.toDOMRange(target)` at
  `.tmp/slate-v2/site/examples/ts/mentions.tsx:123-129`.

## 4. Public API Target

Keep strict APIs:

```ts
editor.dom.toDOMNode(node): HTMLElement
editor.dom.toDOMPoint(point): DOMPoint
editor.dom.toDOMRange(range): DOMRange
editor.dom.toSlateNode(domNode): Node
editor.dom.toSlatePoint(domPoint, options): Point
editor.dom.toSlateRange(domRange, options): Range
editor.dom.findPath(node): Path
editor.dom.findEventRange(event): Range
```

Add resolver APIs:

```ts
editor.dom.resolveDOMNode(node): HTMLElement | null
editor.dom.resolveDOMPoint(point): DOMPoint | null
editor.dom.resolveDOMRange(range): DOMRange | null
editor.dom.resolveSlateNode(domNode): Node | null
editor.dom.resolveSlatePoint(domPoint, options): Point | null
editor.dom.resolveSlateRange(domRange, options): Range | null
editor.dom.resolvePath(node): Path | null
editor.dom.resolveEventRange(event): Range | null
editor.dom.resolveRangeRect(range): DOMRect | null
```

Future public API cuts:

- Remove `suppressThrow` from public options.
- Do not publish `tryToDOMRange`, `tryFindPath`, or `try*` aliases.
- Do not publish rich error result objects by default.
- Do not make strict APIs nullable. The strict names still mean invariant
  assertion.

Resolver names are intentionally boring. "Resolve" reads like an editor API.
"Try" reads like a catch wrapper.

## 5. Internal Resolver Target

Do not implement resolvers as naked `try { strict() } catch { return null }`.
That would preserve the bad architecture behind nicer names.

Factor strict helpers through shared resolvers:

```ts
type DOMResolvePhase =
  | "slate-node-to-dom-node"
  | "slate-point-to-dom-point"
  | "slate-range-to-dom-range"
  | "dom-node-to-slate-node"
  | "dom-point-to-slate-point"
  | "dom-range-to-slate-range"
  | "dom-event-to-slate-range"
  | "range-to-rect";

type DOMResolveReason =
  | "unmounted-node"
  | "stale-node-map"
  | "foreign-dom"
  | "nested-editor-boundary"
  | "shadow-boundary"
  | "dom-coverage-boundary"
  | "void-boundary"
  | "composition-transient"
  | "invalid-dom-selection"
  | "invalid-model-range"
  | "missing-caret-range"
  | "unsupported-app-dom"
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

Public resolvers unwrap recoverable failures to `null`.

Strict helpers unwrap success or throw a typed `DOMResolveError`.

Tests/debug can inspect `DOMResolveResult<T>` through internal helpers.

## 6. Slate React Runtime Law

`packages/slate-react/src/editable/**`,
`packages/slate-react/src/hooks/android-input-manager/**`, and browser event
strategy files must not call strict DOM projection helpers for runtime recovery.

Forbidden in runtime code:

```ts
ReactEditor.toDOMPoint(...)
ReactEditor.toDOMRange(...)
ReactEditor.toSlatePoint(...)
ReactEditor.toSlateRange(...)
ReactEditor.toSlateNode(...)
ReactEditor.findPath(...)
ReactEditor.findEventRange(...)
```

Allowed only in strict tests, dev-only missing-render validation, or direct
public API examples that intentionally demonstrate invariant failure.

Runtime replacements:

| Current strict/runtime shape                              | Target                                           |
| --------------------------------------------------------- | ------------------------------------------------ |
| `toSlateRange(... suppressThrow: true)`                   | `resolveSlateRange(...)`                         |
| `try { toDOMRange(...) } catch { return }`                | `resolveDOMRange(...) ?? return`                 |
| `toDOMPoint(...)` in input heuristics                     | `resolveDOMPoint(...) ?? false`                  |
| `toSlateNode(...)` + `findPath(...)` in event target code | `resolveSlateNode(...)` + `resolvePath(...)`     |
| `findEventRange(event)` in drop handling                  | `resolveEventRange(event) ?? fallback/drop-skip` |
| `toDOMRange(...).getBoundingClientRect()`                 | `resolveRangeRect(...)`                          |

Static proof:

```bash
cd /Users/zbeyens/git/slate-v2
rg -n "ReactEditor\\.(toDOMPoint|toDOMRange|toSlatePoint|toSlateRange|toSlateNode|findPath|findEventRange)" packages/slate-react/src/editable packages/slate-react/src/hooks/android-input-manager
```

After execution, this grep must return no runtime recovery call sites. If one
remains, it needs a line-local invariant comment and a test proving it cannot be
a recoverable browser edge case.

## 7. Surface Coverage

| Surface                   | Target behavior                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Selection import          | Foreign, nested, stale, multi-range, app-owned, and shadow selections resolve to `Range                                | null`; no thrown recoverable DOM errors.                            |
| Selection export          | Model selection projects to DOM range or returns `null`; Slate keeps model selection and waits for next stable commit. |
| Focus restore             | Unmounted or stale DOM point returns `null`; focus path schedules retry or no-ops.                                     |
| Scroll into view          | Missing DOM range/rect returns `null`; scroll is skipped for that frame.                                               |
| Beforeinput target ranges | StaticRange/Selection resolves to `Range                                                                               | null`; native/model decision uses null as "DOM target not trusted." |
| Android input manager     | Direct-DOM-sync heuristics use nullable DOM point/range; no catch wrappers.                                            |
| Clipboard copy            | If DOM range is unavailable, write model-backed Slate fragment data; visible HTML enrichment is best effort.           |
| Drop/drag                 | Event range resolves to model range or `null`; drop is skipped or uses model fallback instead of crashing.             |
| DOM coverage boundaries   | Boundaries are first-class resolver outcomes, not thrown missing-DOM errors.                                           |
| Examples                  | Menus, mentions, embeds, images, checklists use resolver helpers, not strict helpers or catch blocks.                  |
| Hooks                     | `useElementSelected` and similar hooks use resolver APIs, not strict `findPath`.                                       |
| Dev validation            | Missing editable child validation can use strict APIs only as a dev warning path, not runtime recovery.                |

## 8. What Still Throws

Keep throws for:

- invalid hook usage, missing provider, invalid editor instance;
- invalid hotkey definitions and other app configuration errors;
- strict public DOM helpers when called directly;
- `internal-invariant` resolver results;
- test assertions that intentionally prove strict behavior.

Do not throw for:

- stale node maps;
- temporarily unmounted DOM;
- DOM coverage boundaries;
- native selection owned by another editor/root;
- nested editor boundaries;
- composition/browser timing;
- shadow-root caret gaps;
- missing caret range from pointer/drop APIs;
- app-owned DOM that Slate does not own.

## 9. Ecosystem Evidence

| System      | Evidence                                                                                                                                                                                                                                      | Slate decision                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------- |
| ProseMirror | `posAtDOM` throws when direct DOM position is outside the editor, while `posAtCoords` and `selectionFromDOM` return `null` for runtime uncertainty (`../prosemirror-view/src/index.ts:373-423`, `../prosemirror-view/src/selection.ts:9-47`). | Keep strict direct APIs, but runtime bridge APIs return `null`.                                  |
| Lexical     | `onError` is fatal-error plumbing and update tags suppress DOM selection/focus/scroll side effects (`../lexical/README.md:52-55`, `../lexical/packages/lexical/src/LexicalUpdateTags.ts:45-59`).                                              | Fatal handler stays separate from recoverable DOM projection; side-effect policy stays explicit. |
| Tiptap      | `posToDOMRect` gives product UI a rect helper (`../tiptap/packages/core/src/helpers/posToDOMRect.ts:5-35`).                                                                                                                                   | Slate exposes `resolveRangeRect(range): DOMRect                                                  | null` for overlays. |

## 10. Issue Accounting

No new `Fixes #...` claim from this planning pass.

Preserve existing fixed floor:

- `Fixes #4789`: outside-to-inside native selection ignored without DOM point
  crash.
- `Fixes #4984`: parent selection crossing nested editor ignored without DOM
  point crash.

Materially improved by execution, but not auto-closed without exact proof:

- `Improves #3641`: exceptions too liberal in selection failures.
- `Improves #3948`: errors escaping app/error-boundary recovery.
- `Improves #4088`: mentions range projection crash.
- `Improves #4643`: invalid selection throws.
- `Improves #4564`: stale model-to-DOM projection after programmatic removal.
- `Improves #5697` and `#5938`: path resolution reliability.
- `Improves #5760`: zero-length text node DOM range offset.
- `Improves #5749`, `#5107`, `#4337`: shadow DOM drag/drop/event range.
- `Improves #5711`, `#5066`, `#4847`, `#5014`, `#4001`, `#3918`: IME,
  placeholder, and browser timing crash families.
- `Related #5435`, `#5355`: table/read-only/missing editable descendants; exact
  closure needs table/browser proof and DOM coverage boundary policy.

Issue evidence:

- Selection/focus/DOM bridge is the largest issue theme at `172` issues in
  `docs/slate-issues/issue-clusters.md:178-189`.
- `slate-dom-v2` owns DOM point/path translation, selection bridge, clipboard
  DOM boundaries, shadow DOM, nested editor boundary rules, and hit-testing in
  `docs/slate-issues/requirements-from-issues.md:456-466`.
- Cluster 1 is the direct DOM point crash family in
  `docs/slate-issues/gitcrawl-clusters.md:16`.
- Current open rows include `#5938`, `#5711`, `#5760`, `#5749`, `#3948`,
  `#3641`, `#5355`, `#4984`, `#4789`, `#4564`, `#4643`, `#4088`, `#3723`, and
  `#3918` in `docs/slate-issues/gitcrawl-live-open-ledger.md`.

PR reference unchanged: no implementation landed and no fixed claim changed.

## 11. Test And Proof Plan

TDD order, one vertical slice at a time:

1. Public surface contract:
   - no `suppressThrow` public option;
   - no public `tryTo*` helpers;
   - resolver signatures return `T | null`.
2. `slate-dom` resolver contract:
   - strict helpers still throw;
   - resolvers return `null` for stale/unmounted/foreign/nested/shadow/coverage
     recoverable cases;
   - internal result exposes reason data for tests.
3. Static runtime guard:
   - no strict projection calls in Slate React runtime recovery files.
4. Selection controller/reconciler:
   - import/export/repair never throws recoverable DOM projection failures.
5. Android/native input:
   - beforeinput target range and direct DOM sync heuristics fail closed.
6. Clipboard/drop:
   - copy writes model-backed data when DOM range is unavailable;
   - drop skips or uses fallback when event range is unavailable.
7. Examples:
   - mentions, hovering toolbar, images, embeds, checklists use resolver APIs.
8. Browser rows:
   - outside-to-inside selection;
   - nested editor selection;
   - mentions stale target;
   - shadow drag/drop;
   - zero-length DOM text offset;
   - Firefox table/read-only multi-range;
   - IME/mobile rows before claiming IME/mobile fixes.

Required execution greps:

```bash
cd /Users/zbeyens/git/slate-v2
rg -n "tryToDOM|tryToSlate" packages site
rg -n "suppressThrow" packages site docs --glob '!**/CHANGELOG.md' --glob '!site/out/**'
rg -n "ReactEditor\\.(toDOMPoint|toDOMRange|toSlatePoint|toSlateRange|toSlateNode|findPath|findEventRange)" packages/slate-react/src/editable packages/slate-react/src/hooks/android-input-manager
```

The `suppressThrow` grep must be zero in active source, active docs, tests, and
examples. Historical changelogs and generated `site/out` bundles are not part
of the live public API surface.

## 12. Scorecard

| Dimension                              | Score | Evidence                                                                                                                                           |
| -------------------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |  0.94 | Resolver hot paths return `T                                                                                                                       | null`; rich result objects are internal/test only. Static guard prevents catch-heavy runtime code. |
| Slate-close unopinionated DX           |  0.95 | Strict `to*` and `find*` APIs remain; `resolve*` is Slate-like and less awkward than `try*` or `suppressThrow`.                                    |
| Plate and slate-yjs migration backbone |  0.91 | Plate/Yjs consume model ranges, rects, and nulls; raw DOM failure reasons stay Slate-owned.                                                        |
| Regression-proof testing               |  0.94 | Test plan covers public surface, resolver contracts, static runtime guard, unit runtime paths, examples, and browser rows.                         |
| Research evidence completeness         |  0.94 | ProseMirror, Lexical, Tiptap, live Slate v2 source, solution notes, and issue ledgers all point to strict direct API plus nullable runtime bridge. |
| shadcn-style composability             |  0.92 | UI code asks for `DOMRect                                                                                                                          | null`; no app-authored recovery policy, no extra React component contract.                         |

Previous single-pass total: `0.94`.

Final pass-gated score after pass 12: `0.97`.

Status: `done`. The pass-state ledger now proves every required pass is
complete with evidence, issue/reference sync was checked, and the closure gate
is closed.

## 13. Implementation Phases

| Phase                       | Owner           | Work                                                                                            | Proof                                                      |
| --------------------------- | --------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1. Public surface           | `slate-dom`     | Add `resolve*`, reject `try*`, and remove public `suppressThrow` with no compatibility shim.    | Public surface/type tests.                                 |
| 2. Internal resolver core   | `slate-dom`     | Factor strict helpers through shared resolver result.                                           | Resolver contract tests.                                   |
| 3. React runtime conversion | `slate-react`   | Replace strict/catch/suppress paths in selection, focus, beforeinput, Android, clipboard, drop. | Unit contracts plus static grep guard.                     |
| 4. DOM utils and coverage   | `slate-dom`     | Route line/range/clipboard geometry through resolvers where runtime-facing.                     | DOM coverage and clipboard tests.                          |
| 5. Examples                 | `site/examples` | Replace strict/catch usage with `resolve*`.                                                     | Example tests/browser rows.                                |
| 6. Issue accounting         | `plate-2` docs  | Promote only exact proof-backed issue rows.                                                     | Coverage matrix and PR reference updates after code lands. |

## 14. Final Gates For Ralph Execution

Minimum before implementation can be called done:

```bash
cd /Users/zbeyens/git/slate-v2
bun test ./packages/slate-dom/test/bridge.ts ./packages/slate-dom/test/public-surface-contract.ts
bun test ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/selection-reconciler-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts
bun --filter slate-dom typecheck
bun --filter slate-react typecheck
```

Browser gates before issue promotion:

```bash
cd /Users/zbeyens/git/slate-v2
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/mentions.test.ts --project=chromium --grep "mention|portal|DOM range"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "outside the editor|selectionchange|repair"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "nested editor|parent selection"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/shadow-dom.test.ts --project=chromium --grep "drag|drop|range|selection"
```

Planning gate:

```bash
cd /Users/zbeyens/git/plate-2
bun run completion-check
```

Result required: complete for this plan's session-scoped completion file.

## 15. Intent Boundary And Decision Brief

### Intent

Make Slate v2 production-safe at the DOM/model/browser boundary without
turning raw Slate into an opinionated app framework.

The point is not "never throw anywhere." The point is sharper:

- public strict helpers can still assert invariants;
- runtime browser recovery paths must not throw for ordinary stale, foreign,
  unmounted, nested, shadow, composition, or coverage-boundary DOM states;
- app/product UI should receive ordinary nullable values, not exception
  plumbing.

### Desired Outcome

After a later `ralph` implementation pass:

- public `suppressThrow` is gone;
- public `try*` helpers do not exist;
- public nullable resolver APIs exist for DOM/model projection and geometry;
- `slate-react` runtime recovery uses resolver APIs rather than strict helpers,
  catch blocks, or swallowed exceptions;
- strict public helpers still throw typed invariant errors when directly called
  for programmer errors or impossible internal states;
- tests prove both sides: strict APIs assert, runtime resolvers fail closed.

### In Scope

- `slate-dom` public DOM projection API shape.
- Internal resolver core used by both strict and nullable public APIs.
- `slate-react` selection, focus, beforeinput, Android, clipboard, drop, hook,
  and example recovery paths that currently depend on strict projection,
  `suppressThrow`, or catch-and-ignore.
- Resolver return-value policy: `T | null`, not `undefined`.
- Typed internal reason data for tests/debugging, while keeping public resolver
  output boring.
- Issue-ledger policy for DOM point/path/range failures.
- Proof requirements for issue promotion.

### Non-Goals

- No "everything returns nullable" rewrite. Strict APIs stay strict.
- No public `tryToDOMRange`, `tryFindPath`, or similar aliases.
- No public `Result<T, E>` object as the default app-facing API.
- No blanket catch/swallow layer hiding real internal bugs.
- No React error-boundary or scrubber recommendation as the core recovery
  architecture.
- No guarantee that arbitrary app-rendered DOM, KaTeX output, table
  structures, or web components become Slate-owned just because a resolver
  returns `null`.
- No issue auto-close without exact matching proof.
- No implementation edits in Slate Ralplan.

### Decision Boundaries

- A recoverable browser/model projection miss returns `null`.
- A strict direct public API call may throw a typed invariant error.
- Runtime code in `slate-react` must prefer resolver APIs for recovery.
- Internal resolver result objects may carry phase/reason metadata, but public
  resolver APIs unwrap recoverable misses to `null`.
- App-owned layout gaps are not magically supported. They need a registered
  Slate-owned boundary or stay related/not claimed.
- Mobile/IME and browser-specific claims need matching device/browser proof,
  not only jsdom or package unit proof.

### Unresolved User-Decision Points

None for this pass.

Reason: repeated user direction has favored hard cuts and best long-term DX,
but the later high-risk pass proved one hard boundary: public removal still
depends on release channel. Compatibility is not the future API target; it is a
temporary release-policy constraint when shipping to a compatible line.

### Decision Brief

Principles:

- Names should describe editor intent, not JavaScript mechanics.
- Strict names should stay strict.
- Runtime recovery should be ordinary control flow.
- Public API should be boring and memorizable.
- Debug detail belongs behind internal/test APIs, not in every app call.
- Raw Slate should expose primitives, not product policies.

Top drivers:

- Production safety: recoverable browser drift cannot crash the React runtime.
- DX: app code should write `resolveDOMRange(range) ?? return`, not catch
  projection failures.
- Compatibility with Slate mental model: `to*` asserts, `resolve*` attempts.
- Issue pressure: DOM point/path/range crashes are a major open-issue family.
- Implementation discipline: strict APIs and nullable APIs should share the
  resolver core, not fork behavior.

Viable options:

| Option                                                                  | Verdict           | Why                                                                                                                |
| ----------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| Keep strict-only APIs and catch in runtime                              | reject            | Keeps production recovery dependent on exception control flow and repeats legacy Slate's failure mode.             |
| Make existing `to*`/`find*` APIs nullable                               | reject            | Breaks the meaning of strict helper names and makes programmer errors look like normal absence.                    |
| Add public `try*` APIs                                                  | reject            | Technically workable, but the name advertises exception mechanics and creates an awkward parallel API family.      |
| Add public rich `Result<T, E>` APIs                                     | reject as default | Useful internally and in tests, too heavy for common app/runtime use.                                              |
| Keep `suppressThrow` as a public option                                 | reject            | Boolean recovery policy is vague, leaks implementation detail, and makes exact type behavior harder to understand. |
| Add nullable `resolve*` public APIs backed by internal resolver results | accept            | Best split: strict APIs still assert, runtime/app APIs fail closed with `T                                         | null`, tests can inspect reason data. |

Rejected alternatives:

- `undefined` returns: rejected because DOM projection failure is explicit
  absence, and Slate already uses `Range | null` for absent selection/range.
- Error boundaries as product guidance: rejected because they catch too late
  and do not make core runtime behavior safe.
- One generic `resolve()` overload: rejected for now because discoverable
  named helpers are clearer for humans and agents.
- App-configurable recovery callbacks: rejected for the core path because
  every app would be forced to learn Slate internals before being safe.

Consequences:

- Removing `suppressThrow` is a breaking public API cleanup and the accepted
  Slate v2 path. Do not keep a compatibility option.
- Tests must cover strict throw and resolver null behavior separately.
- Runtime greps become meaningful: strict projection calls in recovery files
  are suspect unless a line-local invariant comment proves they are not a
  recoverable browser edge.
- Issue promotion gets stricter, not looser. Resolver APIs reduce crash class
  risk, but exact `Fixes` rows still need matching proof.

Follow-ups:

- Research pass must refresh ecosystem evidence for strict-vs-nullable bridge
  APIs.
- Pressure pass must confirm resolver paths do not allocate rich result objects
  in hot React runtime paths.
- Objection pass must answer the maintainer concern that adding `resolve*`
  doubles API surface.
- High-risk and ecosystem passes originally flagged release-channel risk; the
  maintainer decision resolves it by choosing the hard cut.

Asked question: none.

Remaining ambiguity: none blocking the next pass. Later passes may still change
names or proof order if ecosystem evidence contradicts the current target.

## 16. Research/Ecosystem Live-Source Refresh

Mode: `research-wiki maintain`.

Result: existing compiled research coverage is enough for this pass. No new
`docs/research` page is needed. The missing work was synthesis inside this
plan, not a corpus rebuild.

### Ecosystem Strategy Synthesis

| System           | Live/source evidence                                                                                                                                                                                                                                                                                                         | Observed mechanism                                                                                                                                                                                                                                                     | Problem it avoids                                                                                                                                      | Slate target mechanism                                                                                                                                                        | Steal                                                                                                         | Reject                                                                                               | Verdict                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------- |
| ProseMirror      | `../prosemirror-view/src/index.ts:373-423`; `../prosemirror-view/src/selection.ts:9-47`; `../prosemirror-view/src/index.ts:178-231`; `../prosemirror-view/src/index.ts:236-247`                                                                                                                                              | Direct `posAtDOM` is strict and throws when a DOM position is outside the editor; `posAtCoords`, `nodeDOM`, and `selectionFromDOM` use nullable/fail-closed runtime bridge behavior; scroll is post-update and can ignore outside selections.                          | Runtime DOM uncertainty does not become a random app crash, while direct invariant APIs still assert.                                                  | Keep strict `to*`/`find*`; add nullable `resolve*`; make `slate-react` recovery paths use resolver APIs; make scroll/geometry post-selection and nullable.                    | strict direct API plus nullable runtime bridge, one DOM import/export owner, scroll-after-selection lifecycle | integer positions, ProseMirror view tree, plugin-heavy customization as raw Slate API                | agree                                                   |
| Lexical          | `../lexical/packages/lexical/src/LexicalUpdateTags.ts:45-74`; `../lexical/packages/lexical/src/LexicalUpdates.ts:616-632`; `../lexical/packages/lexical/src/LexicalSelection.ts:3113-3159`; `../lexical/packages/lexical/src/LexicalUpdates.ts:951-1032`; `../lexical/packages/lexical/src/LexicalEditor.ts:220-248,579-670` | Update tags explicitly control DOM selection, scroll, focus, composition, history, paste, and collaboration side effects; update errors route through configured `onError` and restore state; lost-selection invariant still throws.                                   | Side-effect policy is named instead of hidden in ad hoc browser catches; fatal/invariant failure stays separate from ordinary side-effect suppression. | Add resolver APIs for recoverable DOM/model projection, keep commit tags for skip-scroll/skip-dom-selection/composition, and keep strict invariant failures typed.            | explicit side-effect tags, update-scoped DOM selection/focus/scroll policy                                    | class node model, `$` helper style, treating `onError` as normal recoverable projection architecture | partial                                                 |
| Tiptap           | `../tiptap/packages/core/src/helpers/posToDOMRect.ts:5-35`; `../tiptap/packages/core/src/commands/focus.ts:14-16,51-66`; `../tiptap/packages/core/src/commands/scrollIntoView.ts:15-20`                                                                                                                                      | Product APIs expose focus/scroll options and rect helpers while delegating core behavior to ProseMirror transactions and `coordsAtPos`.                                                                                                                                | Product UI can ask for geometry/focus without learning low-level DOM mapping.                                                                          | Expose `resolveRangeRect(range): DOMRect                                                                                                                                      | null` for UI overlays and examples; keep raw DOM projection strict/resolver split.                            | boring geometry helper and focus scroll option shape                                                 | making Tiptap product command API define raw Slate core | partial |
| React 19.2       | Context7 `/reactjs/react.dev` query on 2026-05-14 for Activity, hooks, and Performance Tracks; compiled page `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`                                                                                                                      | `Activity` can hide/preserve UI while deprioritizing hidden work; `useSyncExternalStore` is the external-store subscription primitive; `useTransition` and `useDeferredValue` split urgent vs non-urgent UI; Performance Tracks expose React render/priority evidence. | Surrounding UI can be scheduled cleanly without making editor-core invalidation depend on React.                                                       | Keep resolver/selection/DOM bridge policy below React; React consumes stable store snapshots and nullable geometry, not thrown projection failures.                           | external-store subscription and non-urgent overlay scheduling                                                 | pretending React scheduling fixes stale DOM projection or broad editor invalidation                  | agree                                                   |
| Current Slate v2 | `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:69-108`; `.tmp/slate-v2/packages/slate-react/src/editable/selection-controller.ts:284-287,492-495,609-612,737-742`; `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts:622-625,891-920,932-936`                                             | Public DOM API exposed strict helpers plus public `suppressThrow`; React runtime used strict projection, `suppressThrow`, and catch-and-ignore in recoverable paths.                                                                                                   | The original code had the exact legacy failure shape the plan cut.                                                                                     | Factor shared resolver core, add nullable public resolvers, convert runtime recovery files to resolver APIs, retain strict direct helpers, and remove public `suppressThrow`. | current runtime ownership split as the place to land the fix                                                  | boolean `suppressThrow` as future API, runtime catch wrappers, public `try*` workaround              | revise                                                  |

### Research Maintenance Verdict

- Compiled research pages are current enough for this decision:
  `prosemirror-transaction-view-dom-runtime.md`,
  `lexical-read-update-extension-runtime.md`,
  `tiptap-extension-command-react-dx.md`,
  `react-19-2-external-store-and-background-ui.md`,
  `scroll-selection-visibility-runtime.md`, and
  `slate-v2-data-model-first-react-perfect-runtime.md`.
- Local source reads confirmed the key claims; no contradiction was found.
- No `docs/research/log.md` update is needed because this pass did not add or
  revise research pages.
- The next useful research work, if any, is not more citation gathering. It is
  implementation proof after `ralph`.

## 17. Pressure Passes

Mode: applied `performance-oracle`, `performance`, `vercel-react-best-practices`,
`tdd`, and `react-useeffect`. Skipped `build-web-apps:shadcn` because this
plan does not build UI chrome or styling components; composability pressure is
handled as primitive `Range | null` / `DOMRect | null` API shape.

### Pressure Verdict

Keep the strict/resolver split, but tighten it.

The accepted architecture is still the best target, but only if the later
implementation obeys these rules:

1. Public resolvers return `T | null` and do not allocate rich result objects on
   the success hot path.
2. Rich reason data stays internal/test-only, behind shared resolver core.
3. `slate-react` runtime recovery paths may not wrap strict APIs in
   `try/catch`; they must call resolver APIs directly.
4. Resolver API width is bounded to strict-helper mirrors plus the two real DX
   helpers: `resolveEventRange` and `resolveRangeRect`.
5. Hooks and examples must consume resolver APIs when the input can be stale,
   unmounted, app-owned, or DOM-timed.

If any of those rules falls, the design slides back into the legacy Slate
failure mode with nicer names. That would be fake architecture.

### Keep / Revise / Cut

| Area                     | Pressure result                                                                                                                                                                                                                                                                         | Decision                                                                                                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Public strict APIs       | Current `DOMEditorCapability` strict helpers are still clear at `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:69-108`.                                                                                                                                                     | Keep. Strict `to*` and `find*` APIs remain invariant APIs.                                                                                                                                               |
| Public `suppressThrow`   | Originally public on `toSlatePoint` / `toSlateRange` at `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:94-108` and wrapper lines `1558-1580`.                                                                                                                               | Cut with no compatibility shim.                                                                                                                                                                          |
| Resolver API family      | Current runtime already needs nullable projection in selection import/export, Android, drop, hooks, and examples.                                                                                                                                                                       | Keep, but cap width to `resolveDOMNode`, `resolveDOMPoint`, `resolveDOMRange`, `resolveSlateNode`, `resolveSlatePoint`, `resolveSlateRange`, `resolvePath`, `resolveEventRange`, and `resolveRangeRect`. |
| Public rich results      | Useful for tests and debug assertions, not app code.                                                                                                                                                                                                                                    | Cut from public API. Internal resolver core may return tagged results. Public resolvers unwrap to `T                                                                                                     | null`. |
| Runtime catch wrappers   | Current `selection-reconciler` catches `toDOMRange` at `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts:933-936`; mentions catches `editor.dom.toDOMRange` at `.tmp/slate-v2/site/examples/ts/mentions.tsx:123-129`.                                            | Cut. Replace with resolver calls.                                                                                                                                                                        |
| Hot path allocation      | Exceptions, arrays from eager `Array.from`, rich public results, and document scans are unacceptable in selection import/export.                                                                                                                                                        | Revise implementation law: success path returns existing primitive/native object; failure path returns `null`; reason allocation only behind debug/test mode.                                            |
| Hook path lookup         | `useElementSelected` already prefers explicit/context path before fallback `ReactEditor.findPath` at `.tmp/slate-v2/packages/slate-react/src/hooks/use-element-selected.ts:33-38`.                                                                                                      | Keep the context/runtime-id shape; revise fallback to `resolvePath(element) ?? return false` when the element can be stale.                                                                              |
| Example overlay geometry | Mentions needs geometry only, not a native `Range`.                                                                                                                                                                                                                                     | Use `resolveRangeRect(target) ?? return`, then one batched style write.                                                                                                                                  |
| Plate migration          | Plate plugin code still uses strict product-level lookup in places, for example `editor.api.findPath(element)!` in `../plate/packages/table/src/lib/queries/getTableCellSize.ts:35` and nullable-aware use in `getSelectedCellsBorders.ts:86-92`.                                       | Keep raw Slate primitive; Plate can wrap it with plugin-specific policy. Do not move Plate table policy into raw Slate.                                                                                  |
| slate-yjs migration      | slate-yjs stores model operations, origins, and relative selections, not DOM projection: `../slate-yjs/packages/core/src/plugins/withYjs.ts:230-263`, `../slate-yjs/packages/core/src/plugins/withYHistory.ts:130-148`, and `../slate-yjs/packages/core/src/utils/position.ts:268-291`. | Resolver nulls must not mutate operations or collaboration state. DOM projection failure is a React/runtime concern.                                                                                     |

### Performance Lens

Applicability: `applied`.

Vercel rules used:

- `rerender-defer-reads`: resolver calls belong at usage points, not in broad
  render subscriptions.
- `client-event-listeners`: selection, beforeinput, drag/drop, and clipboard
  listeners stay root-owned, not repeated per element.
- `rerender-use-ref-transient-values`: DOM-adjacent transient flags stay in
  refs/runtime state, not React state.
- `js-early-exit`: resolver hot paths return early on missing selection, dirty
  node map, non-selectable target, or covered boundary.
- `js-set-map-lookups`: runtime-id/path ownership stays keyed, not repeated
  document scans.
- `js-batch-dom-css`: overlay style writes should not interleave geometry reads
  and writes.
- `rendering-activity`: useful for surrounding app panels only; not a fix for
  editor-body DOM projection.

Extra performance rules used:

- `cohort-segmentation`
- `repeated-unit-budget`
- `effect-subscription-budget`
- `css-layout-hotpath`
- `interaction-inp-matrix`
- `memory-dom-tagging`
- `degradation-contract`
- `editor-native-behavior-proof`
- `react-19-runtime-proof`
- `production-rum-dashboard`

Current live support:

- Existing benchmark scripts already cover core text/selection, editor store,
  refs projection, React rerender breadth, huge overlays, huge documents, and
  browser trace at `.tmp/slate-v2/package.json:11-30`.
- Current React selector runtime uses `useSyncExternalStore` in
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-generic-selector.tsx:48-108`.
- Runtime subscriptions are keyed by runtime id when available in
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:319-340`.
- Current rendering metrics already classify cohorts at
  `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:136-145`
  and emit strategy metrics at `:1682-1761`.
- Existing tests prove virtualized/staged metrics rows in
  `.tmp/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx:330-430`.

Required implementation budgets:

| Unit                     | Budget                                                                                                                                                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOM projection resolver  | `O(depth + endpoints)` for point/range projection; no whole-document scan in React runtime.                                                                                                                                 |
| Selection import/export  | constant number of resolver calls per selectionchange/beforeinput; no exception control flow.                                                                                                                               |
| Hook selected state      | keyed by explicit path, context path, or runtime id; stale element fallback returns `false`, not throw.                                                                                                                     |
| Overlay geometry         | one resolver call and one layout read; style writes batched after the read.                                                                                                                                                 |
| Degraded rendering modes | no new degradation. Resolver policy must preserve browser find, native selection, copy, paste, IME, mobile touch, undo/history, collaboration, and follow-up typing unless a later rendering-mode plan explicitly opts out. |

Bench/proof targets after implementation:

```bash
cd /Users/zbeyens/git/slate-v2
bun run bench:core:text-selection:local
bun run bench:core:refs-projection:local
bun run bench:react:rerender-breadth:local
bun run bench:react:huge-document-overlays:local
```

Browser trace proof remains targeted, not broad theater:

```bash
cd /Users/zbeyens/git/slate-v2
bun run bench:react:huge-document:browser-trace:local
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "selectionchange|repair|kernel"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "nested editor|model-selection|kernel"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/shadow-dom.test.ts --project=chromium --grep "drag|drop|selection|kernel"
```

Dashboard/RUM gap:

Local benchmarks are enough for pre-release architecture proof. Production
telemetry remains a release gap. If this becomes a hosted product claim, tag
interaction name, cohort, document size, visible DOM count, hidden boundary
count, decoration/comment count, custom renderer flag, mode, browser, mobile,
IME, and release version.

### DX Lens

Applicability: `applied`.

DX result: `resolve*` is the right public verb. `try*` is the wrong verb because
it names JavaScript mechanics, not editor intent. `suppressThrow` is worse
because it hides return-type change behind a boolean.

Public examples should teach:

```ts
const rect = editor.dom.resolveRangeRect(target);
if (!rect) return;
```

not:

```ts
let domRange: globalThis.Range;
try {
  domRange = editor.dom.toDOMRange(target);
} catch {
  return;
}
```

The hard DX rule: every resolver has exactly one absence shape: `null`.

### Raw-Core Minimalism Lens

Applicability: `applied`.

Raw Slate should expose primitives and recovery contracts, not product policy:

- no app-authored recovery callback as required safety plumbing;
- no global "ignore DOM errors" mode;
- no React error-boundary recommendation as a core fix;
- no Plate table/list/link policy in `slate-dom`;
- no slate-yjs operation semantics in DOM projection;
- no public reason object unless a later debug API is explicitly scoped.

This keeps the core unopinionated while making production runtime safe. That is
the line.

### Migration Lens

Applicability: `applied`.

Plate:

- Plate benefits from nullable geometry/path primitives for floating UI,
  tables, resize handles, and selected-cell overlays.
- Plate should still decide plugin policy locally. For example, a table cell
  size query can return zero dimensions or skip a border row when `resolvePath`
  returns `null`; raw Slate should not know table semantics.

slate-yjs:

- Current slate-yjs operates on Slate operations, origins, stored positions, and
  relative ranges.
- `relativeRangeToSlateRange` already returns `BaseRange | null` when a
  relative endpoint cannot resolve, so nullable model boundary semantics already
  fit collaboration.
- DOM projection resolver nulls must not enter the operation log, remote event
  mapping, undo metadata, or awareness updates except as "do not export DOM
  selection this frame."

### Regression And TDD Lens

Applicability: `applied`.

Use vertical red/green slices, not one giant test dump:

1. Public surface contract: `suppressThrow` absent, resolver signatures return
   `T | null`, strict helpers still throw.
2. One `slate-dom` resolver contract: stale/unmounted path returns `null`;
   strict `findPath` still throws.
3. One selection import contract: foreign/nested DOM selection returns no model
   update and no throw.
4. One selection export contract: missing DOM range preserves model selection
   and skips DOM write.
5. One beforeinput/Android target-range contract: unresolved target range fails
   closed.
6. One drop/event contract: unresolved event range skips or falls back without
   crash.
7. One example overlay contract: mentions/floating UI uses `resolveRangeRect`.
8. Browser rows only after unit behavior is green.

Tests must assert behavior through public or package-level contracts, not that a
specific internal resolver branch was called.

### Simplicity Lens

Applicability: `applied`.

The plan is clean enough, with one required cut:

- do not add both `resolve*` and `try*`;
- do not add resolver aliases;
- do not add a generic overloaded `resolve`;
- do not add public result objects;
- do not add fallback callbacks;
- do not add a resolver for every internal helper;
- do not add a benchmark script just to decorate this pass unless existing
  text-selection, refs-projection, rerender-breadth, and overlay benches fail to
  catch the implementation risk.

### Plan Delta From Pressure

- API width is now capped to strict-helper mirrors plus `resolveEventRange` and
  `resolveRangeRect`.
- Hot-path rule added: public resolver success/failure path must avoid rich
  result allocation; internal reason data is test/debug only.
- Runtime rule strengthened: no `try/catch` wrappers around strict projection
  inside recoverable `slate-react` runtime.
- Hook rule sharpened: `useElementSelected` fallback path resolution must become
  nullable.
- Benchmark/proof targets added from existing `.tmp/slate-v2` scripts.
- Plate and slate-yjs migration boundaries recorded with current source
  pointers.

## 18. Slate Maintainer Objection Ledger

Mode: applied `steelman-pass`.

Result: keep the strict/resolver split. Revise the plan only by making the
adoption and documentation contract sharper. No objection found a better public
API shape.

### Objection Rows

| Decision                                                                    | Strongest fair objection                                                                                           | Steelman antithesis                                                                                                       | Tradeoff tension                                                                                                    | Viable alternatives                                                                                                    | Why the chosen option wins                                                                                                                                                                                                                                                                                                                 | Adoption / docs / proof answer                                                                                                                                                                                   | Verdict                                                                                               |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---- |
| Add nullable `resolve*` APIs beside strict `to*` / `find*` APIs.            | "This doubles the DOM API surface. Raw Slate should not grow helper mirrors every time browser DOM gets annoying." | Keep strict APIs only, document that app/runtime code should catch projection errors, and avoid expanding public surface. | More names to document and test; users must learn strict vs resolver semantics.                                     | Keep `suppressThrow`; add public `try*`; make existing `to*` nullable; expose public `Result<T, E>`; keep strict-only. | Strict-only already produced runtime catch wrappers and `suppressThrow`; nullable existing `to*` would break the meaning of strict names; `try*` names JS mechanics; `Result` is too heavy for app code. `resolve*` is the smallest honest split.                                                                                          | Docs need one strict-vs-resolver table. Static proof must show `slate-react` recovery files call resolvers, not strict helpers.                                                                                  | keep                                                                                                  |
| Return `null` for recoverable DOM/model projection misses.                  | "`null` hides bugs that should throw. If the editor cannot map DOM, something is wrong."                           | Throw typed errors everywhere, then make apps use error boundaries or local catches.                                      | Resolver implementation must classify recoverable misses precisely; a sloppy resolver can mask internal corruption. | Always throw; return `undefined`; return `Result`; call configured `onError`.                                          | DOM projection failure is often ordinary browser timing: foreign selection, stale DOM, hidden boundary, shadow/root mismatch, composition, or unmounted node. ProseMirror returns nullable values in runtime bridge APIs like `posAtCoords`, `nodeDOM`, and `selectionFromDOM`, while still throwing for direct `posAtDOM` outside editor. | Strict direct APIs still throw typed invariant errors. Resolver tests must prove invalid internal invariants do not get swallowed.                                                                               | keep                                                                                                  |
| Exclude public `suppressThrow` from the future API.                         | "This breaks adopters and removes a working escape hatch."                                                         | Keep `suppressThrow` as deprecated compatibility and layer `resolve*` on top later.                                       | Removal costs migration work and can annoy early adopters.                                                          | Keep public boolean forever; make it internal only; hidden runtime shim; public deprecation period.                    | Public `suppressThrow` changes exception behavior through a vague boolean and makes return typing harder to trust. It is worse than a named resolver because it hides the mode switch inside options.                                                                                                                                      | Maintainer decision is hard cut: no compatibility option, no hidden runtime shim, docs/examples teach resolvers.                                                                                                 | keep, hard-cut                                                                                        |
| Ban catch wrappers and strict projection in `slate-react` runtime recovery. | "Catches are simpler and keep the strict API surface smaller."                                                     | Use `try { toDOMRange } catch { return }` at runtime boundaries and leave `slate-dom` alone.                              | Resolver core requires refactor discipline; runtime code must stop reaching for old helpers.                        | Runtime catches; React error boundaries; app-authored `onError`; Lexical-style global fatal handler.                   | Current code already has the bad shape: selection export falls back to strict `ReactEditor.toDOMRange` and repair catches it; mentions catches `editor.dom.toDOMRange`. That is not a policy, it is scattered exception plumbing.                                                                                                          | Static grep must reject strict projection calls in recovery files unless a line-local invariant comment proves the call cannot be recoverable.                                                                   | keep                                                                                                  |
| Expose only plain `T                                                        | null`, not public rich reason objects.                                                                             | "Without reason data, debugging nullable failures will be opaque."                                                        | Public `Result<T, Reason>` gives apps insight and avoids silent absence.                                            | Internal implementation needs reason data anyway; hiding it can make diagnostics weaker unless tests expose it.        | Public result objects; optional debug callback; dev-only console warnings; private/internal resolver result.                                                                                                                                                                                                                               | App/runtime code wants boring control flow. Public `Result` makes every overlay, hook, and input heuristic carry diagnostic plumbing. Reason data belongs in internal/test APIs and maybe dev diagnostics later. | Resolver contract tests should inspect reason data through internal helpers. Public docs stay simple. | keep |
| Add `resolveRangeRect`.                                                     | "A rect helper smells like product UI. Raw Slate should expose DOM ranges, not overlay conveniences."              | Keep only `resolveDOMRange`; let app code call `getBoundingClientRect`.                                                   | One extra public helper beyond strict mirrors.                                                                      | No rect helper; Plate-only rect helper; public `resolveDOMRange` only.                                                 | Mentions and floating UI commonly need geometry, not a mutable native `Range`. Tiptap exposes a product-level `posToDOMRect`; Slate can expose a lower-level nullable geometry primitive without owning overlay policy.                                                                                                                    | Document as geometry primitive, not UI policy. It returns `DOMRect                                                                                                                                               | null`, not menu placement.                                                                            | keep |
| Do not copy ProseMirror positions or Lexical `onError`.                     | "If ProseMirror and Lexical solved this, why not copy the whole pattern?"                                          | Adopt ProseMirror integer positions/view mapping or Lexical fatal `onError`/dirty-node runtime as the core answer.        | Diverging means Slate must own its own proof instead of borrowing a full engine model.                              | ProseMirror positions; Lexical onError as recovery; Tiptap commands.                                                   | Slate's model is path/range based. The thing to steal is strict direct APIs plus nullable runtime bridge and explicit side-effect tags, not the entire engine substrate. Lexical `onError` is fatal plumbing, not normal recoverable DOM projection.                                                                                       | Ecosystem synthesis stays mechanism-level: steal nullable runtime bridge and side-effect tags; reject engine-specific model.                                                                                     | keep                                                                                                  |
| Keep raw Slate unopinionated while making runtime production-safe.          | "Production-safe recovery sounds like product policy creeping into core."                                          | Keep core sharp and let Plate/apps decide all recovery behavior.                                                          | Too much core recovery can blur app-owned DOM boundaries.                                                           | App callbacks; Plate-only wrappers; docs-only warning.                                                                 | Browser/model projection is a raw editor runtime contract. Plate can decide table/link policy, but raw Slate must not crash on foreign or stale DOM selection as normal control flow.                                                                                                                                                      | Resolver null means "Slate cannot safely own this projection now", not "Slate supports arbitrary app DOM."                                                                                                       | keep                                                                                                  |

### Accepted Revisions From Objections

- The public API cap from pass 6 stays mandatory:
  `resolveDOMNode`, `resolveDOMPoint`, `resolveDOMRange`,
  `resolveSlateNode`, `resolveSlatePoint`, `resolveSlateRange`,
  `resolvePath`, `resolveEventRange`, and `resolveRangeRect`.
- Docs/examples must explain the two-lane contract:
  strict helpers assert invariants; resolvers are runtime/app projection
  attempts and return `null` for recoverable browser/model misses.
- Internal resolver reason data is required for tests and debug assertions, but
  not part of the public resolver API.
- `suppressThrow` is excluded from the public API. Public removal is a hard cut
  with no compatibility option.
- `resolveRangeRect` stays because it prevents examples from teaching
  `toDOMRange(...).getBoundingClientRect()` plus catch blocks.

### Dropped Choices

- Public `try*` names.
- Public `Result<T, E>` as default app/runtime API.
- Runtime `try/catch` wrappers around strict projection calls.
- Error-boundary or app-authored catch guidance as the core recovery strategy.
- ProseMirror integer positions or Lexical `onError` as the Slate model.

### Remaining Objection Work

No maintainer objection is unresolved in this pass.

Later passes resolved the release-channel risk and applied the wording cleanup.

## 19. High-Risk Deliberate Pass

Mode: applied `high-risk-deliberate-pass`.

Verdict: keep the resolver architecture, but revise the release rule.

Hard-cut public `suppressThrow` is correct for a Slate v2 / breaking release
line. It is not safe as an unannounced patch-style cleanup because the live
package surface is publishable and documented:

- root package has release scripts for `latest`, `next`, and `experimental` at
  `.tmp/slate-v2/package.json:47-52`;
- `slate-dom` is versioned `0.124.1` at
  `.tmp/slate-v2/packages/slate-dom/package.json:1-4`;
- `slate-react` is versioned `0.124.0` at
  `.tmp/slate-v2/packages/slate-react/package.json:1-4`;
- docs originally published `suppressThrow` in
  `.tmp/slate-v2/docs/libraries/slate-react/react-editor.md:94-100`;
- the changelog explicitly describes `suppressThrow: true` behavior in
  `.tmp/slate-v2/packages/slate-dom/CHANGELOG.md:20-24`.

So the plan stays aggressive, and the maintainer decision is to hard-cut the
old option:

| Execution lane         | `suppressThrow` policy   | Resolver policy                                                           |
| ---------------------- | ------------------------ | ------------------------------------------------------------------------- |
| Slate v2 hard-cut lane | public hard cut required | ship public `resolve*` APIs and rewrite docs/examples to the new contract |

### High-Risk Trigger

This is high risk because it changes:

- public DOM API shape;
- runtime selection/import/export behavior;
- documented options;
- first-party examples;
- issue-claim proof;
- browser-sensitive selection, drop, beforeinput, Android, clipboard, overlay,
  and focus behavior.

### Blast Radius

| Area                | Risk                                                                                                                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Packages            | `slate-dom`, `slate-react`, `site/examples`, docs, package tests, Playwright proof rows.                                                                                                      |
| Users/consumers     | App authors calling `toSlatePoint(... suppressThrow: true)`, `toSlateRange(... suppressThrow: true)`, `toDOMRange` in overlays, `findEventRange` in drops, or `findPath` from React elements. |
| Data/behavior       | Selection import/export, DOM range projection, event-to-range mapping, browser timing recovery, Android/native input, clipboard/drop fallback, and overlay geometry.                          |
| Docs/examples/tests | `react-editor.md`, examples such as mentions/images/embeds/checklists, bridge tests, selection controller/reconciler contracts, Android/input/drop contracts, browser rows.                   |
| Release process     | Release notes must call out the public option removal.                                                                                                                                        |

### Three-Scenario Pre-Mortem

| Scenario                                      | Failure                                                                                                        | Mitigation                                                                                                                                                                             |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Compatibility break surprises users           | External users on `0.124.x` lose `suppressThrow`.                                                              | Make resolver APIs the documented path and call out the hard cut in release notes.                                                                                                     |
| Resolver masks real corruption                | Invalid editor state or broken internal invariants become `null`, causing silent selection loss.               | Strict helpers stay strict; internal resolver reason tests must prove only recoverable DOM/model misses unwrap to `null`. Fatal/internal-invariant reasons still throw in strict mode. |
| Runtime becomes "safe" but behavior regresses | Crashes disappear, but selection, scroll, drop, IME, copy/paste, or follow-up typing silently no-op too often. | Unit contracts plus browser rows must prove behavior, not just absence of throws. Issue promotion stays blocked until matching proof passes.                                           |

### Expanded Proof Plan

Unit/package:

```bash
cd /Users/zbeyens/git/slate-v2
bun test ./packages/slate-dom/test/bridge.ts ./packages/slate-dom/test/public-surface-contract.ts
bun test ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/selection-reconciler-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts
bun --filter slate-dom typecheck
bun --filter slate-react typecheck
```

Static guards:

```bash
cd /Users/zbeyens/git/slate-v2
rg -n "suppressThrow|tryToDOM|tryToSlate" packages site docs --glob '!**/CHANGELOG.md' --glob '!site/out/**'
rg -n "ReactEditor\\.(toDOMPoint|toDOMRange|toSlatePoint|toSlateRange|toSlateNode|findPath|findEventRange)" packages/slate-react/src/editable packages/slate-react/src/hooks/android-input-manager
rg -n "toDOMRange\\(.*\\)\\.getBoundingClientRect|try \\{[^\\n]*toDOMRange" packages site
```

Browser:

```bash
cd /Users/zbeyens/git/slate-v2
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "selectionchange|repair|kernel"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "nested editor|model-selection|kernel"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/shadow-dom.test.ts --project=chromium --grep "drag|drop|selection|kernel"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/paste-html.test.ts --project=chromium --grep "drop|clipboard"
```

Performance:

```bash
cd /Users/zbeyens/git/slate-v2
bun run bench:core:text-selection:local
bun run bench:core:refs-projection:local
bun run bench:react:rerender-breadth:local
bun run bench:react:huge-document-overlays:local
```

Docs/adoption:

- `react-editor.md` must document strict vs resolver APIs as the current API,
  not migration chatter.
- First-party examples must use resolver APIs.
- A changeset must name the release channel and breaking/removal status.
- Public removal is allowed in this hard-cut lane.

### Rollback / Remediation Answer

- If a public release already depends on `suppressThrow`, document the
  resolver replacement. Do not re-add a compatibility option.
- If resolver null behavior causes a missed invariant, move that reason into
  strict/fatal handling and add a regression test.
- If browser rows show too many no-ops, keep resolver APIs but revise the
  runtime fallback policy per surface instead of reverting to catches.

### High-Risk Verdict

`keep with hard cut`.

Do not drop the resolver plan. Do not keep public `suppressThrow` as the future
API. Execute the public hard cut and make `resolve*` the only nullable path.

## 20. Ecosystem Maintainer Pass

Mode: ecosystem maintainer review, with `research-wiki` held in maintain mode.
No research page update is needed: the compiled editor-runtime research already
contains the evidence this pass uses, and no contradiction was found.

Verdict: keep the strict/resolver split and keep `resolve*` naming.

Do not rename the nullable bridge to `try*`, `maybe*`, `get*`, or `find*`.
Those names either expose JavaScript exception mechanics, sound optional rather
than explicitly unresolved, or collide with existing strict/direct Slate terms.
`resolve*` is the better maintainer-facing word: it says "project this editor
target into the DOM/model bridge and admit that projection can fail."

Keep direct APIs strict:

- `toDOMRange`, `toSlateRange`, `findPath`, `findEventRange`, and siblings stay
  strict programmer/invariant APIs.
- `resolveDOMRange`, `resolveSlateRange`, `resolveEventRange`, `resolvePath`,
  and `resolveRangeRect` are the app/runtime bridge.
- Bridge failures return `null`, not `undefined`.
- Fatal corruption still belongs to strict APIs and internal invariant paths,
  not nullable public projection.

Revise maintainer-facing wording after the hard-cut decision: the future public
API target is the resolver split, and public `suppressThrow` is removed.

| System           | Maintainer-facing evidence                                                                                                                                                                                                                                                                                                                                                                                | Likely maintainer objection                                      | Slate response                                                                                                                                                                                        | Decision                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------- |
| ProseMirror      | `posAtCoords` returns nullable positions, `nodeDOM` returns nullable DOM nodes, `selectionFromDOM` returns `null` for invalid/no-focus DOM selection, while direct `posAtDOM` throws outside the editor. Evidence: `../prosemirror-view/src/index.ts:373-423`, `../prosemirror-view/src/selection.ts:9-47`, `../prosemirror-view/src/domcoords.ts:275-288`.                                               | "ProseMirror does not use `resolve*` names, so why invent them?" | Slate has named path/range/node helpers, not integer positions. It needs an intent verb that does not make exceptions the concept. `resolve*` is the smallest honest split.                           | keep                                                                             |
| Lexical          | Update tags explicitly skip DOM selection, scroll, focus, and composition side effects; update errors route through `_onError`, with lost selection still treated as an invariant failure. Evidence: `../lexical/packages/lexical/src/LexicalUpdateTags.ts:45-74`, `../lexical/packages/lexical/src/LexicalUpdates.ts:616-632,951-1032`, `../lexical/packages/lexical/src/LexicalSelection.ts:3113-3160`. | "Why not just use tags or a global error handler?"               | Tags are right for commit side effects. `onError` is fatal plumbing, not normal recoverable DOM projection. Slate still needs value-level resolvers for selection/import/export and overlay geometry. | keep tags for side effects; keep resolvers for projection                        |
| Tiptap           | `posToDOMRect` gives product code a rect helper, focus accepts `scrollIntoView`, and scroll is an explicit command over ProseMirror transactions. Evidence: `../tiptap/packages/core/src/helpers/posToDOMRect.ts:5-35`, `../tiptap/packages/core/src/commands/focus.ts:10-67`, `../tiptap/packages/core/src/commands/scrollIntoView.ts:15-22`.                                                            | "A rect helper sounds like product UI, not raw Slate."           | `resolveRangeRect` is a geometry primitive, not menu placement or focus policy. Plate owns opinionated UI. Raw Slate can expose `DOMRect                                                              | null`because overlays need geometry without owning native`Range` failure policy. | keep, document as primitive |
| React runtime    | React 19.2 primitives help schedule and subscribe, but they do not define DOM/model projection failure policy. Prior compiled React/runtime research remains sufficient.                                                                                                                                                                                                                                  | "Could React error boundaries or transitions own this?"          | No. React can reduce render cost and order side effects; it should not be the recovery mechanism for editor projection misses.                                                                        | keep Slate-owned bridge policy                                                   |
| Current Slate v2 | Public docs and package surface exposed `suppressThrow`, and runtime code used strict/catch/boolean recovery in selection paths. Evidence from the original read: `.tmp/slate-v2/docs/libraries/slate-react/react-editor.md:48-100`, `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:69-108`.                                                                                                  | "A hard public cut could be hostile if this is already shipped." | Accepted as a breaking cleanup. Maintainer decision is hard cut, with resolver docs as the replacement path.                                                                                          | hard cut                                                                         |

Keep:

- `resolve*` public nullable bridge naming.
- Strict `to*` / `find*` direct APIs.
- `null`, not `undefined`, for failed public projection.
- `resolveRangeRect` as a primitive geometry helper.
- Internal/test reason objects, not public `Result` objects.
- Explicit commit/selection side-effect tags where the later implementation
  needs scroll/focus/DOM-selection policy.

Revise:

- Any top-level public `suppressThrow` wording must say hard cut.
- Implementation phase wording must reject a compatibility option.
- Docs proof must distinguish active public reference docs from historical
  changelogs.

Drop:

- public `try*` APIs;
- public `Result<T, E>` as default app/runtime API;
- global `onError`, React error boundaries, scrubbers, or app-authored catches
  as the primary recovery architecture;
- ProseMirror integer positions as Slate API;
- Lexical `_onError` as normal nullable projection;
- Tiptap command-chain/product API style in raw Slate core.

Pass verdict: `keep with hard-cut wording revision`.

The architecture still stands. The only accepted ecosystem-maintainer change is
that resolver APIs are the replacement path; compatibility shims are out.

## 21. Revision Pass

Mode: wording and consistency revision.

Verdict: the accepted architecture is unchanged. The revision pass normalizes
hard-cut language so the plan no longer keeps a public compatibility path.

Applied revisions:

| Area                                  | Before                                                          | After                                                                                                          |
| ------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Top verdict                           | "Cut every public `suppressThrow`."                             | Future public API must not teach `suppressThrow`; remove it with no compatibility option.                      |
| Public API target                     | Unconditional public removal.                                   | Hard-cut removal plus resolver-first docs/examples.                                                            |
| Test/proof plan                       | Grep implied `suppressThrow` must be zero everywhere.           | Zero in active source, tests, docs, and examples; generated `site/out` and historical changelogs are excluded. |
| Implementation phases                 | Add `resolve*`, cut public `suppressThrow`.                     | Add `resolve*`, reject `try*`, and cut `suppressThrow`.                                                        |
| Decision brief                        | Removal described as a breaking cleanup without channel policy. | Removal is a breaking cleanup and the accepted Slate v2 path.                                                  |
| Ecosystem synthesis and pressure pass | "Cut hard" wording.                                             | Future API excludes it; shipping removal is hard-cut.                                                          |
| Maintainer objection ledger           | "Hard-cut public `suppressThrow`."                              | Exclude from public API, no compatibility shim.                                                                |

Keep after revision:

- `resolve*` is still the public nullable bridge.
- Strict `to*` / `find*` APIs still throw for programmer/invariant failures.
- Public resolvers still return `T | null`, not `undefined`.
- Public `try*` and public `Result<T, E>` still stay out.
- `slate-react` recovery code still must not use strict projection or catches
  for recoverable browser/model gaps.
- `resolveRangeRect` stays as a primitive, not product UI policy.

Issue/PR accounting: unchanged in this pass. The revision changes release
wording only; no fixed/improved/related issue claim changed.

Pass verdict: `complete`.

Next pass: `issue-sync-accounting`.

## 22. Issue Sync Accounting

Mode: cache-first issue and PR reference sync.

Verdict: no ledger or PR-reference edit is required for this pass.

Reason: the revision pass changed API-removal wording only. It did not add
implementation proof, promote any issue, demote any issue, or change any exact
fixed/improved/related/not-claimed issue text.

Evidence checked:

- `docs/slate-v2/references/pr-description.md`: current PR reference carries
  `32` fixed issue claims and no `suppressThrow`, resolver, or API-removal
  claim that needs sync.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`: fixed claim rules still
  require exact implementation and proof; no row names this plan or the
  `suppressThrow` hard-cut decision.
- `docs/slate-v2/ledgers/fork-issue-dossier.md`: current DOM/runtime issue
  dossiers remain issue-proof accounting; no dossier section needs a wording
  patch for this planning-only API gate.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`: manual live sync rows remain
  keyed to fixed/improved/related/not-claimed issue status; no row uses this
  plan as proof owner or claims the hard-cut API decision.

Targeted no-match scan:

```bash
rg -n '2026-05-14-slate-v2-total-runtime-error-policy-ralplan|suppressThrow|resolveDOMRange|resolveSlateRange|tryToDOM|tryToSlate' docs/slate-v2/references/pr-description.md docs/slate-v2/ledgers/issue-coverage-matrix.md docs/slate-v2/ledgers/fork-issue-dossier.md docs/slate-issues/gitcrawl-v2-sync-ledger.md
```

Decision:

- Keep fixed issue count at `32`.
- Keep related issue matrix rows unchanged.
- Keep manual live sync rows unchanged.
- Keep fork dossier unchanged.
- Keep PR reference unchanged.

Pass verdict: `complete`.

Next pass: `closure-score-and-final-gates`.

## 23. Closure Score And Final Gates

Mode: final closure gate.

Verdict: `done`.

Closure checks:

| Gate                             | Result                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pass-state rows 1-11             | All complete with evidence. Older "open issues" cells in the schedule were historical next-work notes and are now resolved by later passes.                                                                                                                                                                                                       |
| Pass 12 legality                 | Legal: issue sync accounting is complete, and closure is the only remaining scheduled pass.                                                                                                                                                                                                                                                       |
| Required plan artifacts          | Present: verdict, nullable API rule, current source inventory, public API target, runtime law, surface coverage, throw policy, ecosystem evidence, issue accounting, proof plan, implementation phases, intent/boundary record, decision brief, pressure passes, maintainer objections, high-risk pass, revision pass, and issue sync accounting. |
| Issue/reference sync             | Checked in pass 11; no ledger or PR-reference edits required.                                                                                                                                                                                                                                                                                     |
| Slate v2 implementation boundary | Preserved. This plan pass did not edit `.tmp/slate-v2` source, tests, examples, package files, or config.                                                                                                                                                                                                                                         |
| Execution handoff                | Ready for a later `ralph` execution. This ralplan does not execute code.                                                                                                                                                                                                                                                                          |
| Completion state                 | Scoped file `.tmp/019e24a3-51de-7203-8b05-54d3914c394a/completion-check.md` can move to `done`.                                                                                                                                                                                                                                                   |

Final score: `0.97`.

Why not `1.00`: implementation and browser/package proof still belong to the
later `ralph` execution. This plan is complete as a planning artifact; it is
not proof that Slate v2 source already implements the resolver policy.

Final accepted target:

- Strict `to*` / `find*` APIs stay strict.
- Public nullable `resolve*` APIs own runtime/app projection.
- Public resolver failures return `T | null`.
- Public `try*` and public `Result<T, E>` stay out.
- `resolveRangeRect` stays as a primitive geometry helper.
- `suppressThrow` is excluded from the public API with no compatibility shim.
- `slate-react` core recovery paths should never throw for recoverable
  DOM/model projection gaps.

Pass verdict: `complete`.

Next pass: none.

## 25. Ralph Execution Start

Date: 2026-05-14.

Status: `superseded by hard-cut follow-up`.

Execution request:

- User invoked `ralph full plan`.

Control state:

- Scoped completion state moved back to `pending` at
  `.tmp/019e24a3-51de-7203-8b05-54d3914c394a/completion-check.md`.
- Continuation prompt regenerated at
  `.tmp/019e24a3-51de-7203-8b05-54d3914c394a/continue.md`.
- Existing thread goal is complete for the planning-only lane; execution now
  proceeds from the explicit Ralph request and this plan's accepted target.

Current pass:

- `current_pass: verification-and-closeout`
- `current_pass_status: complete`
- `current_pass_owner: .tmp/slate-v2`
- `current_pass_scope: DOM resolver API, slate-react runtime conversion,
examples, reference sync, verification`

First driver gates:

- `cd .tmp/slate-v2 && bun test ./packages/slate-dom/test/bridge.ts ./packages/slate-dom/test/public-surface-contract.ts`
- `cd .tmp/slate-v2 && bun --filter slate-dom typecheck`

Next owner:

- None for this Ralph lane.

## 26. Ralph Execution Evidence

Date: 2026-05-14.

Status: `complete`.

Implemented:

- Added nullable DOM resolver APIs in
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`:
  `resolveDOMNode`, `resolveDOMPoint`, `resolveDOMRange`,
  `resolveSlateNode`, `resolveSlatePoint`, `resolveSlateRange`,
  `resolvePath`, `resolveEventRange`, and `resolveRangeRect`.
- Kept strict `to*` / `find*` APIs throwing for direct invariant checks.
- Removed the deprecated `suppressThrow` compatibility shim after maintainer
  decision. Resolver APIs are the only nullable path.
- Converted Slate React runtime recovery paths to resolver APIs in selection
  import/export, beforeinput reconciliation, Android input handling, native
  input heuristics, drop target resolution, element-selection hooks, and DOM
  coverage diagnostics.
- Converted examples that previously caught strict DOM/path projection failures
  to resolver APIs: images, check-lists, mentions, and embeds.
- Updated `docs/slate-v2/references/pr-description.md` to include the resolver
  runtime policy under DOM Runtime Closure.
- Captured reusable follow-up knowledge in
  `docs/solutions/developer-experience/2026-05-14-slate-dom-runtime-recovery-needs-resolver-apis-not-suppress-throw.md`.

Issue/reference sync:

- Fixed issue claim count remains `32`.
- No issue ledger row was promoted, added, or closed by this implementation
  slice; the change is an architecture/runtime safety improvement with proof,
  not an exact new GitHub issue closure.

Static proof:

- No `try*` public DOM aliases added.
- No `suppressThrow` usage remains in `packages/slate-react/src`,
  `site/examples/ts`, `packages/slate-dom/src/utils`, or
  `packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`.
- No `suppressThrow` compatibility branch remains in active `slate-dom` or
  `slate-react` source/tests.

Verification:

- `cd .tmp/slate-v2 && bun test ./packages/slate-dom/test/bridge.ts ./packages/slate-dom/test/public-surface-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/selection-reconciler-contract.ts`
- `cd .tmp/slate-v2 && bun test ./packages/slate-dom/test/bridge.ts ./packages/slate-dom/test/clipboard-boundary.ts ./packages/slate-dom/test/dom-coverage.ts ./packages/slate-dom/test/hotkeys.ts ./packages/slate-dom/test/public-surface-contract.ts`
- `cd .tmp/slate-v2 && bun --filter slate-dom typecheck`
- `cd .tmp/slate-v2 && bun --filter slate-react typecheck`
- `cd .tmp/slate-v2 && bun typecheck:site`
- `cd .tmp/slate-v2 && bun --filter slate-react test`
- `cd .tmp/slate-v2 && bun lint:fix`
- `cd .tmp/slate-v2 && bun lint`
- `cd .tmp/slate-v2 && bun test:slate-browser:selection`
- `cd .tmp/slate-v2 && bun check`
- `cd /Users/zbeyens/git/plate-2 && bun run completion-check`

Next pass: hard-cut verification.

## 27. SuppressThrow Hard-Cut Follow-Up

Date: 2026-05-14.

Status: `complete`.

Maintainer decision:

- Do not keep deprecated shims.
- `resolveSlatePoint` / `resolveSlateRange` own nullable DOM-to-Slate
  projection.
- `toSlatePoint` / `toSlateRange` wrap the resolvers and throw when unresolved.
- Active source, tests, and reference docs must have zero `suppressThrow`
  references, excluding generated `site/out` and historical changelogs.

Implemented:

- Removed `suppressThrow` from active `toSlatePoint` and `toSlateRange`
  options in `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`.
- Kept nullable behavior only on `resolveSlatePoint` and `resolveSlateRange`.
- Updated active reference docs in
  `.tmp/slate-v2/docs/libraries/slate-react/react-editor.md`.
- Added `.tmp/slate-v2/.changeset/remove-suppress-throw-dom-projection.md`.

Verification:

- `cd .tmp/slate-v2 && bun test ./packages/slate-dom/test/bridge.ts ./packages/slate-dom/test/public-surface-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/selection-reconciler-contract.ts`
- `cd .tmp/slate-v2 && bun test ./packages/slate-dom/test/bridge.ts ./packages/slate-dom/test/clipboard-boundary.ts ./packages/slate-dom/test/dom-coverage.ts ./packages/slate-dom/test/hotkeys.ts ./packages/slate-dom/test/public-surface-contract.ts`
- `cd .tmp/slate-v2 && bun --filter slate-dom typecheck`
- `cd .tmp/slate-v2 && bun --filter slate-react typecheck`
- `cd .tmp/slate-v2 && bun typecheck:site`
- `cd .tmp/slate-v2 && bun lint:fix`
- `cd .tmp/slate-v2 && bun lint`
- `cd .tmp/slate-v2 && rg -n "suppressThrow|tryToDOM|tryToSlate" packages/slate-dom/src packages/slate-react/src packages/slate-dom/test packages/slate-react/test docs/libraries --glob '!**/CHANGELOG.md' --glob '!site/out/**'`
- `cd .tmp/slate-v2 && bun check` ran lint and all typechecks successfully, then failed in the existing `slate-react` annotation-store contract: `annotation stores refresh when root runtime order changes`, expected `1.0:8|1.0:11`, received `none`.

## 24. Updated Pass-State Ledger

Current activation: `2026-05-14`.

Runtime id: `019e24a3-51de-7203-8b05-54d3914c394a`.

Reason for reopening: the updated `slate-ralplan` skill requires a real pass
schedule and forbids marking a newly activated/rescoped plan `done` from score
alone. The prior closure row was too loose. It was not malicious, just invalid
under the stricter rule.

### Pass 1: Current-State Read And Initial Score

Status: `complete`.

Evidence added:

- Current goal state read with the goal tool. The existing goal covers the same
  DOM/React runtime error-policy target, but it was already marked complete
  under the old one-shot interpretation; this plan state now owns the reopened
  pass-gated truth.
- Original live `.tmp/slate-v2` public DOM API read:
  `packages/slate-dom/src/plugin/dom-editor.ts:69-108` still exposes strict
  `findEventRange`, `findPath`, `toDOMNode`, `toDOMPoint`, `toDOMRange`,
  `toSlateNode`, `toSlatePoint`, and `toSlateRange`.
- Original live `.tmp/slate-v2` public options exposed `suppressThrow` on
  `toSlatePoint` and `toSlateRange` in
  `packages/slate-dom/src/plugin/dom-editor.ts:94-108`.
- Original live `.tmp/slate-v2` `suppressThrow` counts were issue-facing:
  `packages/slate-dom/src/plugin/dom-editor.ts` has `26`,
  `packages/slate-react/src/editable/selection-reconciler.ts` has `5`,
  `packages/slate-react/src/editable/selection-controller.ts` has `3`,
  `packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts`
  has `2`, and tests/changelog carry the rest.
- Original live `.tmp/slate-v2` runtime had strict projection calls in
  `packages/slate-react/src/editable/selection-controller.ts`,
  `selection-reconciler.ts`, `native-input-strategy.ts`,
  `clipboard-input-strategy.ts`, and the Android input manager.
- Required ledger read completed for current-state only:
  `docs/slate-issues/gitcrawl-live-open-ledger.md` reports `630` open issues;
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md` owns current manual sync;
  `docs/slate-v2/ledgers/issue-coverage-matrix.md` owns `Fixes` vs
  `Improves` rules; `docs/slate-v2/ledgers/fork-issue-dossier.md` owns
  fork-local issue narratives; `docs/slate-v2/references/pr-description.md`
  reports `32` current fixed issue claims.

Plan delta:

- Reopened top-level status from `done` to `pending`.
- Replaced the old closure pass with `current-state-read`.
- Downgraded the active score to `0.86` until the remaining passes run.
- Preserved the API verdict: strict public APIs remain, nullable `resolve*`
  APIs become the runtime/app path, and public `suppressThrow` stays cut.

Open issues:

- No issue claim changed in this pass.
- Related issue discovery has not yet determined whether the existing
  ClawSweeper ledgers fully cover this exact resolver/error-policy surface.
- The plan still needs explicit intent/boundary, decision-brief, ecosystem
  synthesis, objection, high-risk, issue-sync, and final-gate passes under the
  updated skill.

Next owner: `slate-ralplan`.

### Pass 2: Related Issue Discovery

Status: `complete`.

Evidence added:

- Loaded `clawsweeper` and followed the cache-first rule.
- Read the existing ClawSweeper source-of-truth ledgers:
  `docs/slate-v2/ledgers/fork-issue-dossier.md`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`,
  `docs/slate-issues/gitcrawl-live-open-ledger.md`,
  `docs/slate-issues/gitcrawl-clusters.md`, and
  `docs/slate-issues/issue-clusters.md`.
- Reused the existing DOM Selection / Focus Bridge Planning Sync in
  `docs/slate-v2/ledgers/fork-issue-dossier.md:6093`, which explicitly exists
  to prevent redoing closed `#4789` / `#4984` proof and to route the remaining
  DOM selection surface.
- Reused the existing exact policy:
  - `#4789` and `#4984` stay the fixed floor;
  - `#5947`, `#5938`, `#5760`, and `#4564` stay `Improves`;
  - `#5711`, `#5749`, `#5107`, `#4337`, `#4088`, `#3918`, `#3641`, `#4643`,
    `#4842`, `#5355`, and adjacent focus/scroll/table/custom-inline rows stay
    related or not claimed until exact proof exists.
- Did not run broad `gh issue list`, broad `gh search`, or live GitHub
  discovery. The cache already covered the touched issue surface.

Pass verdict:

The strict-vs-resolver runtime error policy does not create a new issue
classification yet. It sharpens the already-classified DOM bridge/fail-closed
policy. The existing ClawSweeper dossier is sufficient for related issue
discovery. Do not edit the fork dossier, coverage matrix, sync ledger, or PR
reference in this pass because no issue claim text changed.

Plan delta:

- Marked related issue discovery complete.
- Raised the pass-gated score from `0.86` to `0.87`.
- Kept all fixed/improved/related/non-claim issue classifications unchanged.

Open issues:

- The next pass still needs the broader issue-ledger scan against the full
  `docs/slate-issues` stack to confirm there are no additional fixed,
  improved, related, or non-fix rows uniquely created by the resolver API
  policy.
- Exact issue promotion remains forbidden until implementation and matching
  proof exist.

Next owner: `slate-ralplan`.

### Pass 3: Issue-Ledger Pass

Status: `complete`.

Evidence added:

- Scanned the full required issue-ledger stack for the resolver/error-policy
  surface:
  `docs/slate-issues/gitcrawl-live-open-ledger.md`,
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`,
  `docs/slate-issues/open-issues-ledger.md`,
  `docs/slate-issues/gitcrawl-clusters.md`,
  `docs/slate-issues/issue-clusters.md`,
  `docs/slate-issues/test-candidate-map/`,
  `docs/slate-issues/benchmark-candidate-map.md`,
  `docs/slate-issues/package-impact-matrix.md`, and
  `docs/slate-issues/requirements-from-issues.md`.
- Live generated ledger rows confirm the resolver policy hits real open issue
  pressure: `#5947`, `#5938`, `#5711`, `#4851`, `#5697`, `#3834`, `#3641`,
  `#5171`, `#3836`, `#5107`, `#4984`, `#4789`, `#4842`, `#4564`, `#4643`,
  `#4485`, `#4337`, `#4323`, `#4088`, `#3723`, `#3918`, and `#3449`.
- `docs/slate-issues/gitcrawl-clusters.md:16` confirms cluster `1`
  `dom-point-resolution-crashes` maps directly to DOM bridge /
  selection import-export failures.
- `docs/slate-issues/gitcrawl-clusters.md:18` and `:35` keep adjacent focus,
  input, and invalid-selection clusters separate instead of stuffing them all
  into resolver API naming.
- `docs/slate-issues/issue-clusters.md:178-203` says Selection, Focus, And DOM
  Bridge is the largest raw theme at `172` issues and includes DOM point/path
  translation, focus restoration, inline boundaries, shadow DOM, zero-width
  offsets, table/void selection, gesture directionality, and repair after
  editor actions.
- `docs/slate-issues/requirements-from-issues.md:188-235` routes this work to
  split `slate-dom-v2` / `slate-react-v2` ownership, explicit DOM selection
  bridge, explicit outside/nested-editor ownership, and cursor behavior around
  inline voids, zero-width boundaries, tables, and shadow DOM.
- `docs/slate-issues/package-impact-matrix.md:77-81` keeps the owner as
  `slate-dom-v2` + `slate-react-v2`; `:115` says DOM point translation, native
  selection state, clipboard DOM, shadow DOM, or hit-testing starts in
  `slate-dom`.
- `docs/slate-issues/test-candidate-map/` contains exact future proof rows for
  this policy family, including `toDOMRange` zero-width offset, shadow DOM
  `findEventRange`, programmatic clear DOM point errors, outside-to-inside
  native selection, nested editor selection, placeholder/IME DOM points, void
  `findEventRange`, nested editor `DOMEditor.toSlatePoint`, `DOMEditor.findPath`
  inside `onChange`, and mentions range projection.
- `docs/slate-issues/benchmark-candidate-map.md:249` says this tranche does not
  surface a cleaner new benchmark target than existing large-document,
  selection, and batch-engine lanes. Do not invent a resolver-specific benchmark
  just to look thorough.

Pass verdict:

The nullable resolver API policy is the right architecture pressure response,
but it does not create new fixed claims on its own. It strengthens the proof
plan for existing DOM bridge rows. Exact issue promotion remains gated on
implementation plus matching unit/browser/device proof.

Issue accounting from this pass:

- Fixed: unchanged. `#4789` and `#4984` stay fixed by existing browser proof.
- Improves: unchanged. `#5947`, `#5938`, `#5760`, and `#4564` remain improves
  until exact repro proof exists.
- Related: unchanged. DOM point crash, invalid-selection, shadow DOM,
  findEventRange, mention range, focus/scroll, table boundary, and custom inline
  rows stay related unless the later implementation adds exact proof.
- Not claimed: unchanged. Ecosystem/app-owned DOM such as KaTeX-like custom
  rendering and table-model requests stay outside raw resolver closure unless
  Slate owns the boundary.

Plan delta:

- Marked the full issue-ledger pass complete.
- Raised the pass-gated score from `0.87` to `0.88`.
- Kept fork dossier, coverage matrix, sync ledger, and PR reference unchanged
  because no classification or claim text changed.
- Added a hard proof-policy consequence: implementation must add resolver
  contract rows and browser rows before any issue promotion.

Open issues:

- Intent, outcome, scope, non-goals, and decision boundaries are still not
  explicit enough for closure.
- The decision brief still needs to compare strict-only, nullable resolver,
  public `try*`, rich result object, and swallow/catch alternatives.

Next owner: `slate-ralplan`.

### Pass 4: Intent/Boundary And Decision Brief

Status: `complete`.

Skill used: `intent-boundary-pass`.

Evidence added:

- Read the active plan and session-scoped completion state.
- Reused live source inventory from pass 1 for current strict APIs,
  `suppressThrow`, and runtime strict projection call sites.
- Reused issue pressure from pass 3 for DOM point/path/range crash families.
- Applied the intent-boundary requirement directly in section 15.

Plan delta:

- Added an explicit intent record.
- Added desired outcome, in-scope rows, non-goals, and decision boundaries.
- Added a decision brief comparing strict-only, nullable resolver, public
  `try*`, public rich result, and catch/swallow alternatives.
- Recorded no user question because the repo and prior direction make the hard
  cut target clear enough.
- Raised the pass-gated score from `0.88` to `0.89`.

Open issues:

- Ecosystem evidence still needs refresh before the plan can claim the naming
  and failure-policy split is field-aligned.
- Performance and hot-path allocation pressure still need a dedicated pass.
- Public API break risk still needs high-risk deliberate review.

Next owner: `slate-ralplan`.

### Pass 5: Research, Ecosystem Strategy, And Live-Source Refresh

Status: `complete`.

Skill used: `research-wiki` in maintain mode.

Evidence added:

- Read research layer entrypoints:
  `docs/research/README.md`, `docs/research/index.md`,
  `docs/research/log.md`, and `docs/research/commands/maintain.md`.
- Read compiled source/decision pages for ProseMirror, Lexical, Tiptap,
  React 19.2, scroll/selection visibility, and Slate v2 runtime architecture.
- Re-read local official source for ProseMirror DOM strict/nullable behavior,
  Lexical tags/error/runtime behavior, Tiptap geometry/focus/scroll behavior,
  current Slate v2 DOM API and runtime call sites.
- Queried official React docs through Context7 for React 19.2 Activity,
  `useSyncExternalStore`, `useTransition`, `useDeferredValue`, and Performance
  Tracks.

Plan delta:

- Added section 16 with concrete steal/reject/diverge ecosystem synthesis.
- Confirmed no research-page edit is needed.
- Raised the pass-gated score from `0.89` to `0.90`.

Open issues:

- Performance/DX/migration/regression/simplicity pressure passes still need to
  challenge hot-path allocation, API width, and migration blast radius.
- Maintainer objections still need direct answers.
- High-risk deliberate mode still needs to review the public `suppressThrow`
  hard cut.

Next owner: `slate-ralplan`.

### Pass 6: Pressure Passes

Status: `complete`.

Skills used: `performance-oracle`, `performance`,
`vercel-react-best-practices`, `tdd`, and `react-useeffect`.

Evidence added:

- Re-read live `.tmp/slate-v2` strict/runtime projection call sites:
  `packages/slate-dom/src/plugin/dom-editor.ts:69-108,1558-1580`,
  `packages/slate-react/src/editable/selection-controller.ts:284-287,492-495,609-612,737-742`,
  `packages/slate-react/src/editable/selection-reconciler.ts:622-625,891-920,933-936`,
  `packages/slate-react/src/editable/native-input-strategy.ts:56`,
  `packages/slate-react/src/editable/clipboard-input-strategy.ts:441`,
  `packages/slate-react/src/hooks/use-element-selected.ts:33-38`, and
  `site/examples/ts/mentions.tsx:123-129`.
- Re-read live selector/rendering perf support:
  `packages/slate-react/src/hooks/use-generic-selector.tsx:48-108`,
  `packages/slate-react/src/hooks/use-editor-selector.tsx:319-340`,
  `packages/slate-react/src/components/editable-text-blocks.tsx:136-145,1682-1761`,
  and `packages/slate-react/test/rendering-strategy-and-scroll.tsx:330-430`.
- Re-read existing benchmark scripts in `.tmp/slate-v2/package.json:11-30`.
- Re-read Plate migration pressure examples in
  `../plate/packages/link/src/react/components/FloatingLink/useFloatingLinkEdit.ts:39-54`,
  `../plate/packages/table/src/lib/queries/getTableCellSize.ts:35-53`, and
  `../plate/packages/table/src/lib/queries/getSelectedCellsBorders.ts:83-92`.
- Re-read slate-yjs operation/range boundaries in
  `../slate-yjs/packages/core/src/plugins/withYjs.ts:230-263`,
  `../slate-yjs/packages/core/src/plugins/withYHistory.ts:130-148`, and
  `../slate-yjs/packages/core/src/utils/position.ts:268-291`.

Plan delta:

- Added section 17 pressure passes.
- Capped resolver API width.
- Added hot-path allocation law.
- Added existing benchmark/proof targets.
- Raised the pass-gated score from `0.90` to `0.91`.

Open issues:

- Maintainer objection ledger still needs direct accepted answers for API width,
  strict throw behavior, nullable returns, and public breaking change risk.
- High-risk deliberate pass still needs to judge the public `suppressThrow`
  cut.
- Issue sync accounting remains unchanged until implementation changes claim
  text or proof state.

Next owner: `slate-ralplan`.

### Pass 7: Slate Maintainer Objection Ledger

Status: `complete`.

Skill used: `steelman-pass`.

Evidence added:

- Re-read live `.tmp/slate-v2` public DOM API and public `suppressThrow` option
  at `packages/slate-dom/src/plugin/dom-editor.ts:69-108,1548-1581`.
- Re-read live strict event-range behavior at
  `packages/slate-dom/src/plugin/dom-editor.ts:530-604`.
- Re-read live React/runtime catch and strict projection examples at
  `packages/slate-react/src/editable/selection-controller.ts:276-290,735-744`,
  `packages/slate-react/src/editable/selection-reconciler.ts:928-938`, and
  `site/examples/ts/mentions.tsx:120-130`.
- Re-read ProseMirror strict-vs-null bridge source at
  `../prosemirror-view/src/index.ts:373-423` and
  `../prosemirror-view/src/selection.ts:1-47`.
- Re-read Lexical fatal error/update recovery source at
  `../lexical/packages/lexical/src/LexicalUpdates.ts:951-1032`.

Plan delta:

- Added section 18 maintainer objection ledger.
- Accepted no new API names.
- Strengthened the adoption/docs contract for strict helpers vs resolvers.
- Kept `suppressThrow` excluded from the future API, with high-risk follow-up
  for public removal risk.
- Raised the pass-gated score from `0.91` to `0.92`.

Open issues:

- High-risk deliberate pass still needs to judge the public `suppressThrow`
  removal risk and replacement docs.
- Ecosystem maintainer pass still needs to review final naming/failure policy.
- Issue sync accounting remains unchanged until implementation changes claim
  text or proof state.

Next owner: `slate-ralplan`.

### Pass 8: High-Risk Deliberate Mode

Status: `complete`.

Skill used: `high-risk-deliberate-pass`.

Evidence added:

- Re-read live package/release surface:
  `.tmp/slate-v2/package.json:47-52`,
  `.tmp/slate-v2/packages/slate-dom/package.json:1-4`, and
  `.tmp/slate-v2/packages/slate-react/package.json:1-4`.
- Re-read documented public `suppressThrow` API in
  `.tmp/slate-v2/docs/libraries/slate-react/react-editor.md:94-100`.
- Re-read changelog evidence that `suppressThrow: true` behavior has shipped in
  `.tmp/slate-v2/packages/slate-dom/CHANGELOG.md:20-24`.
- Re-read live runtime source showing current `suppressThrow`, strict fallback,
  and catch behavior in
  `packages/slate-dom/src/plugin/dom-editor.ts:69-108`,
  `packages/slate-react/src/editable/selection-controller.ts:276-290,735-744`,
  and `packages/slate-react/src/editable/selection-reconciler.ts:928-938`.

Plan delta:

- Added section 19 high-risk deliberate pass.
- Kept resolver architecture.
- Revised the `suppressThrow` hard cut with explicit public removal risk.
- Added three-scenario pre-mortem, blast radius, expanded proof plan, and
  rollback/remediation answer.
- Raised the pass-gated score from `0.92` to `0.93`.

Open issues:

- Revision pass must apply any high-risk/ecosystem wording changes.
- Issue sync accounting remains unchanged until implementation changes claim
  text or proof state.

Next owner: `slate-ralplan`.

### Pass 9: Ecosystem Maintainer Pass

Status: `complete`.

Skill used: `research-wiki` in maintain mode.

Evidence added:

- Re-read ProseMirror strict/nullable DOM bridge behavior:
  `../prosemirror-view/src/index.ts:373-423`,
  `../prosemirror-view/src/selection.ts:9-47`, and
  `../prosemirror-view/src/domcoords.ts:275-288`.
- Re-read Lexical side-effect tags and fatal error handling:
  `../lexical/packages/lexical/src/LexicalUpdateTags.ts:45-74`,
  `../lexical/packages/lexical/src/LexicalUpdates.ts:616-632,951-1032`,
  and `../lexical/packages/lexical/src/LexicalSelection.ts:3113-3160`.
- Re-read Tiptap geometry/focus/scroll helpers:
  `../tiptap/packages/core/src/helpers/posToDOMRect.ts:5-35`,
  `../tiptap/packages/core/src/commands/focus.ts:10-67`, and
  `../tiptap/packages/core/src/commands/scrollIntoView.ts:15-22`.
- Re-read current Slate v2 public DOM docs and surface:
  `.tmp/slate-v2/docs/libraries/slate-react/react-editor.md:48-100` and
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:69-108`.
- Re-read compiled research references for scroll/selection visibility,
  read/update runtime architecture, and lazy query API decisions.

Plan delta:

- Added section 20 ecosystem maintainer pass.
- Kept `resolve*` naming.
- Kept strict direct APIs plus nullable runtime/app bridge.
- Kept `null`, not `undefined`.
- Kept `resolveRangeRect` as a geometry primitive.
- Reaffirmed that `try*`, public `Result`, global error handlers, React error
  boundaries, ProseMirror positions, Lexical `_onError`, and Tiptap product
  commands are wrong public raw-Slate targets.
- Raised the pass-gated score from `0.93` to `0.94`.

Open issues:

- Issue sync accounting remains unchanged until implementation changes claim
  text or proof state.

Next owner: `slate-ralplan`.

### Pass 10: Revision Pass

Status: `complete`.

Evidence added:

- Re-scanned the active plan for stale release-channel wording around public
  `suppressThrow`, hard-cut language, implementation phases, proof greps,
  decision brief consequences, ecosystem synthesis, pressure pass, and
  maintainer objections.

Plan delta:

- Added section 21 revision pass.
- Raised the pass-gated score from `0.94` to `0.95`.
- Updated top verdict and public API target to the hard-cut rule.
- Updated proof greps so `suppressThrow` is zero in active source, tests, docs,
  and examples, excluding generated `site/out` and historical changelogs.
- Updated implementation phase and decision brief language to avoid implying
  compatible public removal.
- Kept issue sync unchanged because no issue claim text changed.

Open issues:

- Issue sync accounting pass verified that no manual sync ledger, fork dossier,
  coverage matrix, or PR reference update is required.

Next owner: `slate-ralplan`.

### Pass 11: Issue Sync Accounting

Status: `complete`.

Evidence added:

- Read `docs/slate-v2/references/pr-description.md`; it still carries `32`
  fixed issue claims and no `suppressThrow`, resolver, or release-channel claim
  that needs sync.
- Read `docs/slate-v2/ledgers/issue-coverage-matrix.md`; its fixed/related
  claim rules still require exact implementation and proof, and no row names
  this planning-only release-channel decision.
- Read `docs/slate-v2/ledgers/fork-issue-dossier.md` with targeted search for
  the API/release wording; current sections remain issue-proof accounting.
- Read `docs/slate-issues/gitcrawl-v2-sync-ledger.md`; manual live rows remain
  unchanged and no row uses this plan as proof owner.
- Ran a targeted no-match scan across the four sync artifacts for this plan,
  `suppressThrow`, resolver names, release-channel wording, deprecated
  compatibility, and public `try*` names.

Plan delta:

- Added section 22 issue sync accounting.
- Raised the pass-gated score from `0.95` to `0.96`.
- Kept PR reference, issue coverage matrix, fork dossier, and manual live sync
  ledger unchanged because no issue claim text changed.

Open issues:

- Closure score and final gates verified every prior pass-state row and moved
  the lane to `done`.

Next owner: `slate-ralplan`.

### Pass 12: Closure Score And Final Gates

Status: `complete`.

Evidence added:

- Verified pass-state rows 1-11 are complete with evidence.
- Verified issue/reference sync is complete and unchanged from pass 11.
- Verified the Slate v2 implementation-edit boundary was preserved.
- Verified the scoped completion state uses the active runtime id:
  `.tmp/019e24a3-51de-7203-8b05-54d3914c394a/completion-check.md`.

Plan delta:

- Added section 23 closure score and final gates.
- Raised final pass-gated score from `0.96` to `0.97`.
- Moved top-level plan status from `pending` to `done`.
- Moved scoped completion state to `done`.

Open issues:

- None for Slate Ralplan. Later implementation belongs to `ralph`.

Next owner: `ralph` when the user decides to execute.

### Pass Schedule State

|   # | Pass                                                   | Status   | Evidence added                                                                                                                                                                                                | Plan delta                                                                                                                                                                          | Open issues                                       | Next owner                          |
| --: | ------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------- |
|   1 | Current-state read and initial score                   | complete | Live `.tmp/slate-v2` DOM API, `suppressThrow`, strict runtime calls, and planning ledgers re-read.                                                                                                            | Plan reopened; score set to pass-gated `0.86`.                                                                                                                                      | No issue claim changed.                           | `slate-ralplan`                     |
|   2 | Related issue discovery                                | complete | Existing ClawSweeper DOM selection/focus dossier and coverage matrix rows reused cache-first; no broad live GitHub discovery.                                                                                 | No issue claim text changed; no dossier/matrix/PR-reference edit needed.                                                                                                            | Resolved by pass 3.                               | `slate-ralplan`                     |
|   3 | Issue-ledger pass                                      | complete | Full docs/slate-issues stack scanned for resolver/error-policy fixed, improved, related, and non-fix rows.                                                                                                    | No claim text changed; implementation proof policy strengthened.                                                                                                                    | Resolved by pass 4.                               | `slate-ralplan`                     |
|   4 | Intent/boundary and decision brief                     | complete | Intent-boundary pass applied; intent, outcome, scope, non-goals, boundaries, options, rejected alternatives, consequences, and follow-ups recorded.                                                           | Added section 15 decision brief; score raised to `0.89`.                                                                                                                            | Resolved by pass 5.                               | `slate-ralplan`                     |
|   5 | Research, ecosystem synthesis, and live-source refresh | complete | Compiled research entrypoints/pages, local PM/Lexical/Tiptap/Slate source, and official React docs refreshed.                                                                                                 | Added section 16 ecosystem synthesis; score raised to `0.90`; no research page edit needed.                                                                                         | Resolved by pass 6.                               | `slate-ralplan`                     |
|   6 | Pressure passes                                        | complete | Performance, DX, core minimalism, migration, regression, research, and simplicity lenses applied against live Slate v2, Plate, slate-yjs, and existing benchmark scripts.                                     | Added section 17 pressure pass; score raised to `0.91`; resolver API width and hot-path allocation law tightened.                                                                   | Resolved by passes 7-8.                           | `slate-ralplan`                     |
|   7 | Slate maintainer objection ledger                      | complete | Steelman rows added for API width, null returns, `suppressThrow`, runtime catches, public result objects, rect helper, ProseMirror/Lexical alternatives, and raw-core scope.                                  | Added section 18 objection ledger; score raised to `0.92`; adoption/docs contract tightened.                                                                                        | Release-channel risk resolved by passes 8 and 10. | `slate-ralplan`                     |
|   8 | High-risk deliberate mode                              | complete | Public API/removal risk, runtime behavior risk, release channel, docs/changelog exposure, pre-mortem, proof gates, and rollback/remediation reviewed.                                                         | Added section 19 high-risk pass; score raised to `0.93`; public `suppressThrow` removal is a hard cut.                                                                              | Revision wording applied by pass 10.              | `slate-ralplan`                     |
|   9 | Ecosystem maintainer pass                              | complete | ProseMirror nullable/direct bridge, Lexical tags/error handling, Tiptap geometry/focus/scroll helpers, current Slate v2 docs/API, and compiled research re-read.                                              | Added section 20 ecosystem maintainer pass; score raised to `0.94`; `resolve*`, strict direct APIs, `null`, and `resolveRangeRect` kept; release-channel wording revision required. | Revision wording applied by pass 10.              | `slate-ralplan`                     |
|  10 | Revision pass                                          | complete | Stale release-channel wording re-scanned and normalized across verdict, public API target, proof greps, implementation phases, decision brief, ecosystem synthesis, pressure pass, and maintainer objections. | Added section 21 revision pass; score raised to `0.95`; future API excludes `suppressThrow` and the execution path hard-cuts it.                                                    | Issue sync accounting completed by pass 11.       | `slate-ralplan`                     |
|  11 | Issue sync accounting                                  | complete | PR reference, issue coverage matrix, fork dossier, and manual live sync ledger read; targeted no-match scan found no API/release wording that required sync.                                                  | Added section 22 issue sync accounting; score raised to `0.96`; no ledger/reference edits required.                                                                                 | Resolved by pass 12.                              | `slate-ralplan`                     |
|  12 | Closure score and final gates                          | complete | Pass rows 1-11, issue/reference sync, edit boundary, scoped completion state, and execution handoff checked.                                                                                                  | Added section 23 closure gate; score raised to `0.97`; top-level status moved to `done`.                                                                                            | None.                                             | `ralph` when execution is requested |

Next pass: none.
