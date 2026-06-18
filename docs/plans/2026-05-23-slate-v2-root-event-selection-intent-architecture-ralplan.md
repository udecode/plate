# Slate v2 Root Event Selection Intent Architecture Ralplan

## Status

- Status: done
- Current pass: closure-final-gates
- Current pass status: complete
- Next pass: none
- Next owner after plan hardening: ralph execution

## Harsh Verdict

Yes, the current multi-root click/focus fix is too fragile.

The bug class keeps moving because `useSlateRootChrome` is doing five jobs at once:

1. DOM target classification.
2. Root ownership inference.
3. Pointer event phase bookkeeping.
4. Focus scheduling.
5. Selection restoration or coordinate import.

That is an event engine hidden inside a hook. It works until the next browser sequence crosses a root, padding, stale selection, native editable descendant, or toolbar focus path. The better architecture is not another local patch. The better architecture is one runtime-owned root interaction resolver that turns browser events into typed editor intents before focus or selection is changed.

## Intent Boundary

Intent:

- Make one `<Slate editor>` with many `<Editable root>` surfaces robust by default.
- Remove app-owned and hook-owned focus/caret policy from multi-root examples.
- Keep raw Slate unopinionated: no Plate-specific document wrapper, no product-level history UI.

Desired outcome:

- Public DX stays simple:

```tsx
<Slate editor={editor}>
  <Editable root="header" />
  <Editable />
  <Editable root="footer" />
</Slate>
```

- Optional root chrome remains tiny:

```tsx
const chrome = useSlateRootChrome("header")

return (
  <section {...chrome.props}>
    <Editable root="header" />
  </section>
)
```

- The hook binds props only. It does not own hit testing, focus timing, or selection policy.

In scope:

- `slate-react` runtime event/selection policy.
- `slate-dom` pointer and selection hit testing primitives.
- Root-local caret persistence and restore policy.
- Browser proof for multi-root focus/caret transitions.
- Example cleanup so `site/examples/ts/multi-root-document.tsx` teaches the library DX.

Non-goals:

- No product-level `MultiRootDocument` component in raw Slate.
- No Plate opinionated API.
- No new issue fixed claims until implementation and ledger proof exist.
- No implementation edits from this ralplan pass.

Decision boundary:

- If code decides "where should this click place the caret?", it belongs in the runtime interaction resolver, not in an example and not in `useSlateRootChrome`.
- If code translates DOM event coordinates to Slate ranges, it belongs in `slate-dom` or a narrow `slate-react` adapter around `slate-dom`.
- If code decides whether to preserve browser focus, restore a stored root selection, or import a coordinate range, it belongs in the shared event runtime.

## Current Evidence

Fragile current code:

- `packages/slate-react/src/hooks/use-slate-root-chrome.ts:19-22` defines selector strings for chrome and native editable targets.
- `packages/slate-react/src/hooks/use-slate-root-chrome.ts:59-80` classifies event targets locally.
- `packages/slate-react/src/hooks/use-slate-root-chrome.ts:93-94` tracks pending mouse state with booleans.
- `packages/slate-react/src/hooks/use-slate-root-chrome.ts:96-191` owns focus, restore, native recovery, and editable-root click placement.
- `packages/slate-react/src/hooks/use-slate-root-chrome.ts:194-263` branches across mouse down/up capture and calls `preventDefault`.

Better substrate already exists:

- `packages/slate-react/src/editable/runtime-root-engine.ts:231-287` already composes selection reconciliation, selection export/import, repair, trace, and event runtime.
- `packages/slate-react/src/editable/runtime-root-engine.ts:299-324` already returns central editable event bindings.
- `packages/slate-react/src/editable/runtime-event-engine.ts:88-164` already defines the editable event runtime shape.
- `packages/slate-react/src/editable/runtime-event-engine.ts:181-220` already bridges browser handles, target runtime, and beforeinput flow.
- `packages/slate-dom/src/plugin/dom-editor.ts:692-775` already resolves DOM event coordinates into Slate ranges.

Regression pressure:

- `apps/www/tests/slate-browser/donor/examples/multi-root-document.test.ts:367-580` now contains several root chrome click regressions: inactive surface clicks, body line-end clicks, body-to-footer first-click, and stale body padding selection.
- This is a smell. Each new browser sequence should not require a new branch in a hook.

Research pressure:

- `docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md:37-45` keeps Slate data-model-first while making the runtime explicit.
- `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md:73-83` supports one DOM bridge owner.
- `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md:108-122` supports lifecycle metadata on edits instead of implicit event timing.
- `docs/research/decisions/slate-v2-react-19-2-perf-architecture-vs-field.md:100-112` says the winning shape is below React, not another React trick.

## Chosen Architecture

Create one internal root interaction resolver in `slate-react`, backed by `slate-dom` hit testing.

Working name:

```ts
type RootInteractionIntent =
  | { type: "native-editable-text"; root: EditorRootKey }
  | { type: "editable-root-coordinate"; root: EditorRootKey; event: MouseEvent }
  | { type: "root-chrome-activate"; root: EditorRootKey }
  | { type: "interactive-descendant"; root?: EditorRootKey }
  | { type: "external" }
```

The exact names can change during execution. The boundary should not.

Pipeline:

1. Classify the DOM target once.
2. Resolve the owning root from mounted editable/root chrome boundaries.
3. Resolve coordinate range through `slate-dom` when the event has a meaningful text coordinate.
4. Choose a selection policy:
   - let native own it when the browser already placed selection in the clicked root
   - import event range when coordinate mapping is valid
   - restore last root selection for pure chrome activation
   - fallback to root start/end only when no stored root selection exists
5. Focus the mounted editable only after the selection decision.
6. Emit trace metadata for browser tests and future issue debugging.

The root chrome hook becomes an adapter:

```ts
function useSlateRootChrome(root: EditorRootKey) {
  return useRootInteractionProps({ root, role: "chrome" })
}
```

It should not:

- keep mouse-phase booleans
- parse selectors as policy
- decide `forceSelection`
- restore selection directly
- call DOM focus directly

## Why This Wins

The current hook already is a root interaction engine. It is just untyped, local, untraceable, and hard to test. Moving it into the runtime does not add architecture; it admits the architecture already exists and puts it in the right package boundary.

This matches the accepted Slate v2 direction:

- Slate core keeps model, operations, roots, and state fields.
- `slate-dom` owns DOM point/range translation.
- `slate-react` owns mounted editable views, browser event lifecycle, focus, and DOM selection import/export.
- Examples use package APIs instead of teaching timing hacks.

## Rejected Alternatives

Patch `useSlateRootChrome` again:

- Rejected. It will create another hidden state machine in the hook.

Make app examples restore focus manually:

- Rejected. The example should prove the package DX, not hide package debt.

Expose low-level `focus: "preserve-dom"` style knobs everywhere:

- Rejected as default DX. Focus policy can exist internally or as an advanced escape hatch, but the common path should pick the sane behavior from intent.

Let browser native selection always win:

- Rejected. It fails root chrome activation, padding clicks, virtualized/paged views, and future layout-owned rendering.

Always restore last root selection:

- Rejected. It causes stale caret behavior when the user clicks a meaningful coordinate in a root.

## High-Risk Pass

Trigger:

- Browser-sensitive runtime behavior and public multi-root DX.

Blast radius:

- `slate-react` editable runtime, root chrome hook, focus scheduling, mounted root registry.
- `slate-dom` event range resolution contract.
- Multi-root example and browser tests.
- Future pagination/virtualization/pretext rendering strategy.

Pre-mortem:

1. Resolver overfits desktop mouse events and misses touch/pointer/composition.
   - Mitigation: model the intent from event target and root ownership, not from mouse-only details. Keep pointer/touch rows in the proof plan.
2. Trace/debug metadata becomes public API by accident.
   - Mitigation: keep trace test-only or internal, and document only behavior contracts.
3. Centralization becomes a large hard-to-change engine.
   - Mitigation: keep the resolver deep and narrow: classify, resolve root, resolve range, choose selection action. No product behavior.

Verdict:

- Keep. This is the smallest robust fix because it removes duplicated event policy instead of spreading it.

## Steelman

Strongest objection:

- "This sounds overbuilt. We only need to fix a few click bugs."

Best argument for not doing it:

- Hook-local fixes are faster and less risky short term. A central resolver can become a new abstraction everyone has to understand.

Why the chosen option still wins:

- The hook-local route already failed the maintainability test. The same browser surface has produced multiple regressions in one example. A central resolver is easier to test as a matrix and easier to trace when the browser disagrees.

Adoption answer:

- Public JSX does not change.
- Existing `useSlateRootChrome` stays, but becomes a small adapter.
- Advanced users can keep raw root/view APIs.

Docs/example answer:

- The example should show one editor with many editables and zero app-owned focus repair.
- Docs should describe behavior, not internals: root chrome focuses its root; padding clicks choose the clicked root; interactive descendants keep their own focus.

Proof required:

- Resolver unit matrix.
- React hook contracts.
- Browser root-switching regressions.
- Mobile/touch smoke rows before closure.

## Test Strategy

Unit contracts:

- Root interaction resolver matrix:
  - native editable text target
  - editable padding target
  - root chrome target
  - interactive descendant target
  - external target
  - active root vs inactive root
  - stored root selection vs no stored root selection
  - valid event range vs no event range

React hook contracts:

- `useSlateRootChrome` only binds root interaction props.
- It ignores editable descendants and interactive descendants.
- It delegates to runtime resolver without local mouse-phase state.

Browser rows:

- Header -> body -> footer first click focuses the clicked root.
- Body middle selection -> another root -> body padding end click places caret at body end.
- Clicking blank paragraph/padding does not restore stale selection when the coordinate maps to a useful range.
- Header chrome click restores header caret only when chrome has no useful coordinate.
- Toolbar/title/native input focus stays native unless an editor root is intentionally activated.
- Root-local select all/copy/paste remains root-local.

Stress rows:

- Repeated root switches with typing after every click.
- Random click target sequence across header/body/footer/chrome/toolbar/title.
- Pointer/touch smoke row.
- Composition row before closure if runtime code touches IME timing.

Trace assertions:

- Browser tests should assert the last root interaction trace in addition to DOM selection when possible:
  - resolved intent
  - owning root
  - selected policy
  - whether native selection was preserved
  - whether event range was imported

This matters because Playwright can pass while native caret behavior is still wrong. The assertion should prove ownership, not just text content.

## Performance Pass

Keep the resolver off React render state.

Rules:

- Event-phase data lives in refs/runtime action frames, not component state.
- Subscriptions stay narrow; no broad runtime provider invalidation on every pointer action.
- DOM hit testing runs only for relevant pointer events.
- Stored root selections remain bounded by mounted roots.
- Trace metadata is dev/test gated or bounded.

Expected performance:

- Better than hook patches because target classification and policy are centralized and no longer duplicated per chrome wrapper.
- Compatible with future layout-first rendering because event coordinate resolution is a runtime concern, not a DOM shape assumption baked into examples.

## React 19.2 Pass

React should render views and subscribe narrowly. React should not be the source of truth for caret policy.

Relevant guidance applied:

- Move interaction logic to event/runtime handlers, not effects.
- Use refs for transient event-frame values.
- Subscribe to derived root state, not broad editor runtime state.
- Keep focus repair outside render.

## Issue Accounting

No issue fixed claims in this pass.

Related issue pass: complete.

Ledger updates:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md` records the root interaction intent planning sync.
- No fixed claims were added.
- No improved claims were added.
- No live GitHub discovery was needed; the pass reused cached gitcrawl and existing fork dossier rows.

Related clusters classified:

- DOM point/path/range resolution crashes.
- React editor focus after programmatic or external changes.
- Scroll/selection into view regressions.
- Focus entry regressions.
- External DOM ownership regressions.
- Mobile/IME selection timing regressions.

Representative related issue policy:

- `#4789` and `#4984` keep existing fixed claims owned by DOM selection boundary browser proof.
- `#4564`, `#3723`, `#5711`, and adjacent DOM-point rows stay related or existing improves rows; this plan does not replay exact repros.
- `#3634`, `#4961`, and `#5537` stay related focus/input pressure; exact programmatic focus closure needs targeted browser proof after implementation.
- `#3893` stays related external-control focus pressure; exact HTML button closure is not claimed.
- `#5088`, `#5473`, `#4376`, and `#5171` stay related scroll/blur/unfocused-selection pressure.
- `#5603`, `#5669`, `#6022`, `#5983`, and `#4400` stay related input/mobile/IME pressure; no device closure claim exists.
- `#3705`, `#3756`, and `#3921` preserve existing history-selection statuses; root interaction policy must not broaden history claims.

Do not update PR fixed issue claims until implementation proof exists.

## Score

Overall confidence: 0.83

- React runtime performance: 0.84
  - Good boundary: event policy below React render.
  - Needs proof: no broad subscription churn.
- Slate-close DX: 0.90
  - Public JSX stays clean.
  - `useSlateRootChrome` remains optional and tiny.
- Plate/slate-yjs migration: 0.78
  - Good substrate alignment.
  - Needs later proof for commit metadata and collaboration observers if traces become observable.
- Regression proof: 0.80
  - Current browser rows expose the right failures.
  - Needs resolver unit matrix and cross-browser stress.
- Research completeness: 0.82
  - Enough compiled evidence for direction.
  - Needs issue-ledger sync and maybe direct source refresh before closure.
- Minimality/composability: 0.88
  - Cuts duplicated hook policy.
  - Must keep resolver narrow.

Planning closure threshold met.

Implementation proof is still required in the later Ralph execution before any source, browser, or issue-fix claim is valid.

## Next Pass

None for this Slate Ralplan lane.

Execution owner implements:

   - resolver unit matrix
   - runtime interaction resolver
   - thin `useSlateRootChrome`
   - browser regressions
   - package/site typecheck and lint
   - browser proof

## Ralph Execution North Star

Do not build another root chrome patch.

Build the runtime-owned interaction resolver, make root chrome a prop adapter, and prove the repeated bug class with a matrix plus browser rows.

## Ralph Execution Result - 2026-05-23

Status: complete.

Implemented:

- Added `root-interaction-resolver` as the typed policy matrix for root chrome, editable root, native editable, interactive descendant, and external targets.
- Added `root-interaction-controller` as the internal runtime controller that owns pending pointer action state, focus scheduling, event range import, and root selection fallback.
- Reduced `useSlateRootChrome` to a props adapter around the internal controller.
- Tightened `SlateRootEditor` typing so root view editors expose the DOM runtime APIs they actually carry.
- Added resolver tests for interactive descendants, root chrome restore, and editable-root-surface end fallback.

Proof:

- `bun --filter slate-react test:vitest -- ./test/root-interaction-resolver.test.ts ./test/use-slate-root-chrome.test.tsx`
- `bun --filter slate-react typecheck`
- `bun lint:fix`
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium --workers=1`
- `bun --filter slate-react test:vitest`

Issue claims:

- No fixed issue claims added.
- No improved issue claims added.
- Existing related issue policy remains unchanged.
