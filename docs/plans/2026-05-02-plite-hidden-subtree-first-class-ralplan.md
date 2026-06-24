# Plite DOM Coverage Boundary Ralplan

status: done-hidden-subtree-proof-and-unstable-adapter
created: 2026-05-02
revised: 2026-05-02
skill: `.agents/skills/slate-ralplan/SKILL.md`
source repo: `/Users/zbeyens/git/plite`

## Verdict

First-class hidden/collapsed subtree support is a Plite primitive, not a
Plate-only feature. But the primitive is not "collapsed UI." The primitive is:

```txt
DOM coverage management for model-present content.
```

The accepted internal architecture is:

```txt
normal renderElement keeps children mandatory
+ internal DOM coverage boundary registry
+ boundary-aware DOM selection/copy/paste/materialization bridge
+ private BoundaryRange/SelfBoundary harness
+ public Boundary API only after stricter lifecycle/browser proof
+ future large-doc staging and virtualization share the primitive later
```

The rejected architecture is:

```txt
app renderers omit editable descendants
+ Plite hopes DOM mapping recovers
```

That recreates the old `toDOMNode`, `findPath`, `toDOMPoint`, native selection,
IME, and clipboard crash class with a nicer name. Plite should support
model-present / DOM-incomplete regions, but raw app-rendered missing DOM stays
unsupported.

The first GPT Pro revision changed the original plan in three material ways:

- Rename/generalize `HiddenSubtreeBoundary` to `DOMCoverageBoundary`.
- Delay `slots.HiddenRange` / `slots.HiddenSelf`; prove registry and bridge
  first, then consider one `slots.Boundary` API with scoped self/children
  coverage. Keep a separate public `SelfBoundary` uncommitted until the API
  bake-off proves it is needed.
- Add a hot-surface performance pass from the GitHub diff-line article before
  letting deeper architecture hide expensive render units.

The second GPT Pro revision, after the internal proof and Phase 2-4 checkpoint,
does not overturn the architecture. It tightens the next gates:

- Keep `DOMCoverageBoundary` as the internal primitive.
- Treat the internal registry, bridge, model-backed copy, materialization hook,
  private React harness, and browser example as a real primitive proof.
- Do not publish `slots.Boundary` yet. The current harness registers through a
  layout effect in
  `/Users/zbeyens/git/plite/packages/plite-react/src/components/dom-coverage-boundary.tsx:69`
  and `:125`; that is acceptable for private proof, not enough public API law.
- Reject `Hidden*` naming permanently.
- Prefer one eventual `Boundary` API with `scope`, not separate public
  `SelfBoundary` as the primary concept.
- Keep Phase 6 as the architectural north star, but delay implementation until
  DOM-present staged lifecycle, stale-DOM prevention, native readiness, and
  registry scale are proven.

Blunt rule:

```txt
Plite proved it can survive missing DOM.
It has not proved app authors can safely author missing DOM.
```

## Intent Boundary

Intent:

- Support app-owned collapsed/hidden document regions as first-class Plite
  runtime behavior.
- Cover nested collapsible content plus top-level hidden header/footer nodes at
  the first and last root positions.
- Preserve Plite's unopinionated model: Plite owns the missing-DOM invariant;
  Plate owns product-level collapsible blocks and UI.
- Keep future large-document staging, shell mode, and possible virtualization on
  the same missing-DOM substrate, but with different policies.

Desired outcome:

- Apps can collapse/hide editable model regions without DOM lookup crashes.
- Selection, copy, paste, undo/history, IME, mobile, browser find, a11y, and
  collaboration behavior are explicit, not accidental.
- Ordinary renderers remain safe: content-bearing `renderElement` output still
  renders Plite-managed content or registers a runtime boundary.
- Hot repeated editor units stay cheap enough that DOM-present default mode does
  not need virtualization to compensate for bloated React/DOM/event structure.

In scope:

- Internal DOM coverage boundary registry.
- Boundary-aware DOM import/export and selection/copy/paste policy.
- Private internal `BoundaryRange` and `SelfBoundary` harness.
- Later experimental public slots only after browser proof.
- Hidden first/last root coverage, nested boundaries, and boundary stress rows.
- Hot-surface audit: DOM nodes, React components, handlers, effects,
  subscriptions, heap, INP p95/p99, layout/style cost.
- GitHub-scale performance tactics from the `performance` skill.

Non-goals:

- No Plate-specific collapsible block API in raw Plite.
- No arbitrary partial-text hiding in the first cut.
- No public `slots.HiddenRange` / `slots.HiddenSelf` in Phase 0-3.
- No default shell/virtualization behavior for ordinary editable rich text.
- No native browser find promise for intentionally collapsed DOM-absent content.
- No custom find implementation in the first cut.
- No table-in-hidden-content release claim unless table itself already passes
  the editor browser contract.

Decision boundaries:

- Missing DOM is allowed only through a runtime-owned boundary.
- Collapsed content, large-document pending groups, future virtualization, and
  shell mode share the boundary primitive but not the same default policy.
- Collapsed content may intentionally be absent from native traversal.
  Virtualized content is absent for performance and has stricter materialization
  obligations.
- Stale DOM exposed as current content is a hard failure.

## Current Live Source Read

### Normal render still assumes children

- `EditableRenderElementProps` includes `children: ReactNode`:
  `/Users/zbeyens/git/plite/packages/plite-react/src/components/editable-text-blocks.tsx:228`.
- `EditableDescendantNodeInner` computes child runtime ids from
  `descendant.children`, then maps each child to `EditableDescendantNode`:
  `/Users/zbeyens/git/plite/packages/plite-react/src/components/editable-text-blocks.tsx:340`.
- Normal renderers receive one opaque `children` tree:
  `/Users/zbeyens/git/plite/packages/plite-react/src/components/editable-text-blocks.tsx:455`.
- Current docs tell normal element renderers to spread `attributes` and render
  `children`:
  `/Users/zbeyens/git/plite/docs/libraries/slate-react/editable.md:43`,
  `/Users/zbeyens/git/plite/docs/concepts/09-rendering.md:40`.

Conclusion: arbitrary omission is not supported today and should not become
supported silently.

### DOM mapping still throws for missing nodes

- `usePliteNodeRef` registers DOM mappings only for mounted nodes:
  `/Users/zbeyens/git/plite/packages/plite-react/src/hooks/use-slate-node-ref.tsx:193`.
- `DOMEditor.findPath` throws if parent/index maps are missing:
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-editor.ts:442`.
- `DOMEditor.toDOMNode` throws when a Plite node has no DOM:
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-editor.ts:671`.
- `toDOMPoint` resolves a model node and then calls `toDOMNode`:
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-editor.ts:688`.
- Native input still relies on `ReactEditor.toDOMPoint` for the anchor:
  `/Users/zbeyens/git/plite/packages/plite-react/src/editable/native-input-strategy.ts:55`.

Conclusion: points/ranges inside DOM-incomplete content need boundary-aware
lookup before normal DOM helpers run.

### Existing unmounted-content support is top-level only

- Large-document options are `auto | dom-present | off | shell`:
  `/Users/zbeyens/git/plite/packages/plite-react/src/large-document/create-island-plan.ts:3`.
- Shell planning splits only `topLevelRuntimeIds`:
  `/Users/zbeyens/git/plite/packages/plite-react/src/large-document/create-island-plan.ts:24`.
- DOM-present root groups split only root runtime ids:
  `/Users/zbeyens/git/plite/packages/plite-react/src/components/editable-text-blocks.tsx:495`.
- Runtime receives `mountedTopLevelRuntimeIds` and `mountedTopLevelRanges`, not
  general subtree coverage:
  `/Users/zbeyens/git/plite/packages/plite-react/src/components/editable-text-blocks.tsx:1039`.
- Shell-backed selection checks root path indexes:
  `/Users/zbeyens/git/plite/packages/plite-react/src/large-document/large-document-commands.ts:41`.

Conclusion: Plite already has useful top-level mounted-range proof, but not
nested or self-boundary coverage.

### Void shell is the closest runtime-owned precedent

- Void renderers return visible content only:
  `/Users/zbeyens/git/plite/packages/plite-react/src/components/editable-text-blocks.tsx:198`.
- `SlateVoidShell` owns the hidden editable anchor/spacer:
  `/Users/zbeyens/git/plite/packages/plite-react/src/components/slate-void-shell.tsx:13`.

Conclusion: DOM coverage should follow the same ownership rule: app owns
visible UI, Plite owns the DOM/editing contract.

## Ecosystem Evidence

### Lexical

Local source:

- `DecoratorNode` exposes `decorate`, `isIsolated`, `isInline`, and
  `isKeyboardSelectable`:
  `/Users/zbeyens/git/lexical/packages/lexical/src/nodes/LexicalDecoratorNode.ts:23`.
- `ElementNode.getDOMSlot` lets an element control where children are inserted
  while Lexical still owns the slot:
  `/Users/zbeyens/git/lexical/packages/lexical/src/nodes/LexicalElementNode.ts:826`.
- Lexical selection resolves DOM positions through `getDOMSlot`:
  `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalSelection.ts:2309`.
- DOM selection export also routes element selections through slots:
  `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalSelection.ts:2990`.
- Reconciliation skips child reconciliation unless the element is dirty:
  `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalReconciler.ts:574`.
- Decorators render through a separate React portal lane:
  `/Users/zbeyens/git/lexical/packages/lexical-react/src/shared/useDecorators.tsx:26`.

Steal:

- Runtime-owned child slots.
- DOM slot resolution.
- Dirty element discipline.
- Isolated / keyboard-selectable node policies.
- Separate decorator lane.

Reject:

- Public class-node model.
- `$` helper API style.
- Treating renderer omission as safe editable content.

### ProseMirror

Local source:

- `NodeView.contentDOM` is the explicit child-content mount point:
  `/Users/zbeyens/git/prosemirror/view/src/viewdesc.ts:31`.
- Without `contentDOM`, `domFromPos` returns the node DOM as an atom-like
  boundary:
  `/Users/zbeyens/git/prosemirror/view/src/viewdesc.ts:308`.
- Nodes without `contentDOM` are made `contenteditable=false`:
  `/Users/zbeyens/git/prosemirror/view/src/viewdesc.ts:708`.
- Custom views can own `setSelection`, `stopEvent`, and `ignoreMutation`:
  `/Users/zbeyens/git/prosemirror/view/src/viewdesc.ts:1017`.
- `NodeSpec.atom` lets a non-leaf node be treated as a single view unit:
  `/Users/zbeyens/git/prosemirror/model/src/schema.ts:393`.
- `NodeSpec.isolating` creates editing boundaries:
  `/Users/zbeyens/git/prosemirror/model/src/schema.ts:441`.
- DOM selection import/export is centralized in the view:
  `/Users/zbeyens/git/prosemirror/view/src/selection.ts:9`,
  `/Users/zbeyens/git/prosemirror/view/src/selection.ts:55`.

Steal:

- Content slot vs no-content-slot distinction.
- Atom/isolating/selectable vocabulary.
- Explicit selection/mutation obligations when content DOM is missing.
- One DOM selection bridge owner.

Reject:

- Imperative NodeViews as the default React API.
- Integer-position identity.
- Schema-first public mental model.

Plite rule:

```txt
If descendants do not have mounted content DOM, they are not normal editable
descendants. They are behind a boundary.
```

### GitHub diff-line performance article

User-provided article evidence:

- GitHub improved normal/large PRs first by making each repeated line cheaper:
  fewer wrapper components, fewer DOM nodes, fewer handlers, less state, O(1)
  maps, and fewer effects.
- Their old line shape had roughly 8-13 React components, 10-15 DOM nodes, and
  20+ event handlers per line. Their v2 line path cut this dramatically.
- In a 10k-line split-diff test, rendered components dropped from about 183k to
  50k, memory dropped from about 150-250 MB to 80-120 MB, and INP improved from
  about 450 ms to 100 ms.
- For p95+ enormous PRs, virtualization cut heap/DOM by about 10x and INP from
  275-700+ ms to 40-80 ms.

Plite takeaway:

```txt
Make the repeated editable unit cheap first. Then stage or virtualize only when
the cohort actually needs it.
```

This strengthens the two-tier Plite direction. It does not justify making
shell islands or virtualization the default for editable rich text.

## Decision Brief

Principles:

- Plite core stays unopinionated and data-first.
- Browser correctness belongs to the runtime, not app renderers.
- Hidden content remains model content; missing DOM is a view state.
- Native behavior claims must match real DOM state.
- Performance work cannot reintroduce DOM lookup crashes.
- Repeated editor units must be cheap before deeper mounting policy hides them.

Decision drivers:

- Support collapsible sections plus first/last root hidden nodes.
- Keep ordinary renderers safe.
- Scale to large documents without per-descendant hidden state.
- Preserve future virtualization without inventing a second missing-DOM system.
- Give Plate and slate-yjs a substrate-level migration route.
- Prove behavior through unit/browser/stress contracts, not examples alone.

Options:

| Option                                       | Verdict       | Reason                                                                                                 |
| -------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------ |
| Keep children mandatory, no hidden support   | reject        | Leaves a real legacy limitation unsolved.                                                              |
| Let `renderElement` omit children            | reject        | Recreates DOM mapping and selection crashes.                                                           |
| Use CSS-only hiding                          | reject        | Browser find, a11y, copy, selection, stale DOM, and IME become accidental.                             |
| Treat every collapse as void/atom            | partial       | Valid for atomic cards, wrong for collapsed editable sections.                                         |
| Extend shell islands                         | partial       | Useful aggressive top-level mode, wrong default primitive for nested app collapse.                     |
| Ship `slots.HiddenRange` immediately         | reject for v1 | Right family, too public and too product-shaped before bridge proof.                                   |
| Build internal DOM coverage boundaries first | choose        | Gives Plite one missing-DOM contract for collapse, staging, shell, and future virtualization policies. |

Chosen architecture:

```txt
DOM coverage boundary registry
+ boundary-aware bridge
+ private internal harness
+ eventual scoped Boundary API only after proof
+ hot-surface performance audit and budgets
+ later large-doc/virtualization convergence
```

## Target Runtime Model

Use a general DOM coverage registry, not a hidden-subtree-only registry.

```ts
type DOMCoverageBoundary = {
  boundaryId: string;
  ownerRuntimeId: RuntimeId;
  ownerPath: Path;

  coveredPathRanges: readonly PathRange[];
  coveredRuntimeRanges: readonly RuntimeIdRange[];

  state:
    | "mounted"
    | "intentionally-hidden"
    | "pending-mount"
    | "virtualized"
    | "atom-boundary";

  reason:
    | "app-collapse"
    | "app-hidden"
    | "large-document-staged"
    | "viewport-virtualization"
    | "shell-aggressive"
    | "runtime-atom";

  anchor:
    | { type: "owner" }
    | { type: "summary-slot"; runtimeId: RuntimeId }
    | { type: "placeholder"; runtimeId?: RuntimeId };

  selectionPolicy: "materialize" | "boundary" | "model-backed";
  copyPolicy: "include-model" | "summary-only" | "exclude" | "materialize";
  findPolicy: "not-native-until-mounted";
  a11yPolicy: "summary-announces-collapsed" | "hidden-from-tree";
  version: number;
};
```

Policy table:

| Use case                  | State                  | Selection default            | Copy default                                                      |
| ------------------------- | ---------------------- | ---------------------------- | ----------------------------------------------------------------- |
| Collapsed section         | `intentionally-hidden` | `boundary` or `materialize`  | `include-model` for select-all; product-specific for local ranges |
| Hidden header/footer      | `intentionally-hidden` | `boundary`                   | `exclude` unless app opts in                                      |
| Large-doc staged mounting | `pending-mount`        | `materialize`                | `materialize` or `model-backed`                                   |
| Future virtualization     | `virtualized`          | materialize near interaction | `model-backed` for spanning ranges                                |
| Atom/void-like node       | `atom-boundary`        | `boundary`                   | serialized node policy                                            |

Rules:

- Normal nodes are mounted by default.
- Boundaries are coalesced; never store every hidden descendant in hot state.
- A model point inside a boundary cannot blindly call `toDOMPoint`.
- DOM import from placeholder/summary maps to a boundary edge, not a fake child.
- Programmatic caret placement into editable hidden content defaults to
  materialize.
- Model-backed selection is acceptable for huge select-all/copy ranges, not as
  the default typing target.
- Structural ops remap paths and runtime ranges through commits.
- Remote edits inside hidden content dirty the boundary summary only.
- Deleting an owner clears boundary registry records.

## Public API Target

Do not ship public slots yet.

Current live source:

- Private proof components exist in
  `/Users/zbeyens/git/plite/packages/plite-react/src/components/dom-coverage-boundary.tsx:31`
  and `:94`.
- They register from `useIsomorphicLayoutEffect` at
  `/Users/zbeyens/git/plite/packages/plite-react/src/components/dom-coverage-boundary.tsx:69`
  and `:125`.
- Package tests prove private child-range omission and first/last root
  self-boundaries in
  `/Users/zbeyens/git/plite/packages/plite-react/test/dom-coverage-boundary-contract.tsx:48`,
  `:104`, and `:155`.

That proves the primitive. It does not prove public authoring lifecycle safety.

Phase 0-4 target:

- No public `slots.HiddenRange`.
- No public `slots.HiddenSelf`.
- No stable public `slots.Boundary`.
- No stable public `slots.SelfBoundary`.
- Use internal/private `DOMCoverageBoundaryRange` and
  `DOMCoverageSelfBoundary` harnesses only.
- Keep `children` mandatory for normal `renderElement`.
- Dev safety should flag content-bearing renderers that render no content and
  register no boundary.

Eventual public candidate after proof:

```tsx
<slots.Boundary
  scope={{ type: "children", from: 1, to: 3 }}
  mounted={!collapsed}
  reason="app-collapse"
  selectionPolicy="materialize"
  copyPolicy="include-model"
  findPolicy="not-native-until-mounted"
  renderPlaceholder={({ materialize }) => (
    <button type="button" onClick={materialize}>
      Show content
    </button>
  )}
/>
```

Whole-element hiding should use the same concept:

```tsx
<slots.Boundary
  scope={{ type: "self" }}
  mounted={!hidden}
  reason="app-hidden"
  selectionPolicy="boundary"
  copyPolicy="exclude"
  findPolicy="not-native-until-mounted"
  renderPlaceholder={({ materialize }) => (
    <button type="button" onClick={materialize}>
      Show header
    </button>
  )}
/>
```

Names:

- `Boundary`, not `HiddenRange`.
- `scope={{ type: 'self' }}`, not a first-class separate public
  `SelfBoundary` unless the API bake-off proves the unified shape is awkward.
- `mounted`, not `hidden`.
- `DOMCoverageBoundary` internally, not `HiddenSubtreeBoundary`.

Why: the important thing is model-present / DOM-incomplete coverage. Hidden UI
is only one policy.

Policy defaults by reason:

| Reason                    | Selection default     | Copy default                    | Find default                              |
| ------------------------- | --------------------- | ------------------------------- | ----------------------------------------- |
| `app-collapse`            | `materialize`         | `include-model`                 | `not-native-until-mounted`                |
| `app-hidden`              | `boundary`            | `exclude`                       | `not-native-until-mounted`                |
| `viewport-virtualization` | `materialize`         | `model-backed`                  | `custom` or `not-native-until-mounted`    |
| `large-document-staged`   | `materialize`         | `materialize` or `model-backed` | `not-native-until-mounted` until complete |
| `shell-aggressive`        | explicit shell policy | model-backed where needed       | explicit limitation                       |

Element specs come later, not first. They are better for stable node-type
behavior:

```ts
schema.define({
  type: "header",
  domCoverage: {
    copyPolicy: "exclude",
    mountedWhen: (element) => !element.hidden,
    reason: "app-hidden",
    scope: "self",
    selectionPolicy: "boundary",
  },
});
```

Slots are the likely React authoring adapter. Element specs are the likely
static behavior adapter. The core public law remains Plite-owned DOM coverage,
not React components.

## DOM Bridge Target

Boundary-aware export:

```ts
toDOMPoint(point):
  boundary = registry.getBoundaryForPoint(point)

  if no boundary:
    return normal DOM point

  switch boundary.selectionPolicy:
    case 'materialize':
      materialize boundary synchronously if possible
      retry normal DOM point

    case 'boundary':
      return DOM point before/after boundary placeholder or summary slot

    case 'model-backed':
      keep Plite selection in model
      clear or suppress native DOM selection
      render explicit boundary selection state
```

Boundary-aware import:

```ts
toPlitePoint(domPoint):
  if domPoint is inside boundary placeholder:
    return boundary edge / owner path / summary slot point

  return normal Plite point
```

Hard cuts:

- No direct `toDOMNode(hiddenDescendant)` during selection export.
- No native paste into missing content.
- No stale DOM range over hidden content.
- Composition blocks collapse/materialize transitions unless a test proves the
  transition is safe.
- Touch interaction near a boundary materializes first or clamps to a boundary.

## Native Behavior Contract

| Area             | Collapsed/hidden boundary                                             | Future virtualization                             | Required contract                                           |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| Browser find     | Hidden text is not natively findable; acceptable if intentional.      | Dangerous unless Plite owns find or materializes. | Do not promise native find for DOM that does not exist.     |
| Screen readers   | Placeholder/summary announces collapsed state; hidden content absent. | High risk if content stays absent long.           | Virtualization cannot default without a11y proof.           |
| Native selection | Boundary or materialize.                                              | Materialize target ranges near interaction.       | No DOM mapping throw.                                       |
| Copy/paste       | Model-backed or materialize when spanning hidden content.             | Model-backed spanning copy likely required.       | Never copy stale DOM.                                       |
| IME              | Freeze collapse/expand during composition.                            | Mount target before composition.                  | No materialization during active composition unless proven. |
| Mobile           | Materialize-on-touch is safest.                                       | Very high risk.                                   | No missing target crash.                                    |
| Undo/history     | Collapse state must be explicit document or UI state.                 | Mount state must not pollute history.             | History policy tested.                                      |
| Collaboration    | Remote edits dirty boundary summary only.                             | Unmounted regions must not wake full body.        | Rebase anchors/selections through covered ranges.           |
| Accessibility    | Placeholder/summary semantics matter.                                 | Needs separate strategy.                          | No fake document button default.                            |

Hard rule:

```txt
Missing DOM is risky. Stale DOM is worse.
```

## Hot Surface Performance Plan

The GitHub article changes sequencing. Before or alongside boundary work, add a
hot-surface audit so Plite does not hide expensive units behind clever mounting.

Budgets:

| Surface                                       | Budget                                                |
| --------------------------------------------- | ----------------------------------------------------- |
| Plite-owned event handlers per repeated block | 0 by default; delegate at root/group where possible   |
| `useEffect` in hot leaf/text/block wrappers   | 0 by default                                          |
| O(n) lookup during repeated-unit render       | 0                                                     |
| Comment/widget/context menu state per block   | forbidden unless active/visible                       |
| Projection lookup                             | O(1) or bucketed by runtime id                        |
| Default paragraph render path                 | specialized fast path, not generic everything-wrapper |
| Custom renderer path                          | allowed slower path, measured separately              |

Fast paths to preserve or create:

```txt
DefaultPlainTextFastPath
DefaultRichTextFastPath
ProjectionPath
CustomLeafPath
CustomTextPath
CustomSegmentPath
VoidPath
DOMCoverageBoundaryPath
DOMPresentGroupPath
ShellPath
```

Benchmark tags:

- DOM node count.
- React component count proxy.
- event listener count.
- effect count.
- JS heap at ready and after typing.
- forced layout count.
- style recalculation time.
- interaction p50/p75/p95/p99.
- background mount debt.
- `interactiveReady`.
- `nativeSurfaceComplete`.
- mounted/pending/stale boundary/group counts.

Performance skill application:

- `repeated-unit-budget`: blocks/leaves/boundaries need DOM/component/handler
  budgets.
- `event-delegation-budget`: root/group delegation should replace per-node
  handlers where possible.
- `effect-subscription-budget`: repeated wrappers should not subscribe or run
  effects unless synchronizing with external systems.
- `rare-state-isolation`: comments, menus, widgets, and hover UI must mount
  only when active.
- `interaction-inp-matrix`: record select/type/copy/paste/materialize p95/p99,
  not only medians.
- `memory-dom-tagging`: pair every large/stress timing with heap/DOM/listener
  tags.
- `degradation-contract`: shell/virtualized/model-backed modes need explicit
  native behavior tradeoffs.
- `staged-readiness`: keep `interactiveReady` distinct from
  `nativeSurfaceComplete`.
- `production-rum-dashboard`: define Datadog/RUM tags even if telemetry is a
  proof gap today.

## New Comprehensive Example

Target:

```txt
/Users/zbeyens/git/plite/site/examples/ts/dom-coverage-boundaries.tsx
```

Coverage:

1. Top-level hidden header as first root node.
2. Normal paragraph before the body.
3. Collapsible section:
   - summary child mounted;
   - content child range covers nested paragraphs, list, inline marks, and an
     inline void/mention;
   - remote/model update button changes covered text while collapsed.
4. Nested collapsible section inside that content.
5. Structured block/table only if current table proof is already stable;
   otherwise phase-2 coverage.
6. Normal paragraph after the body.
7. Top-level hidden footer as last root node.

Visible debug tools:

- toggle header/footer/outer/nested.
- select all.
- copy payload into debug panel.
- paste/replace selected content.
- update covered content while hidden.
- programmatic select inside covered content.
- registry trace: boundary id, state, reason, policies, mounted/pending/stale
  counts.

The example must validate API shape. If the example is awkward, redesign before
publishing slots.

## Test Plan

### Unit/runtime contracts

- hidden child range registers one coalesced boundary;
- nested ranges coalesce/stack deterministically;
- hidden first root node maps root start safely;
- hidden last root node maps root end safely;
- point lookup inside covered range does not call normal DOM lookup first;
- range lookup partly crossing covered range returns policy result;
- insert/remove/split/merge/move remap boundaries;
- remote edit inside covered range dirties boundary summary only;
- deleting boundary owner clears registry;
- undo/redo restores explicit collapse state policy;
- parent hidden + child materialize uses deterministic parent-wins policy.

### React/package tests

- normal renderer still must render `children` or register a boundary;
- internal `BoundaryRange` omits descendants without stale refs;
- internal `SelfBoundary` covers first/last root nodes;
- expanding boundary materializes current model;
- covered content update while hidden updates summary/debug only;
- visible sibling selectors do not wake;
- repeated-unit component/effect/handler budgets are measured or traceable.

### Browser integration

Add:

```txt
/Users/zbeyens/git/plite/playwright/integration/examples/dom-coverage-boundaries.test.ts
```

Rows:

| Row                                        | Required behavior                     |
| ------------------------------------------ | ------------------------------------- |
| click collapsed summary then type after it | no DOM mapping crash                  |
| expand then type inside                    | fresh mounted DOM                     |
| programmatic select inside hidden content  | materialize or model-backed, no throw |
| drag selection across collapsed section    | deterministic import/repair           |
| select-all then copy                       | correct payload by policy             |
| paste over range spanning hidden content   | no stale DOM fallback                 |
| undo text edit and collapse toggle         | explicit history behavior             |
| IME while toggle fires                     | composition not lost                  |
| mobile touch near hidden first/last root   | no missing target crash               |
| browser find before expand                 | hidden text not found, documented     |
| browser find after expand                  | text found                            |
| remote update hidden text                  | model updates, DOM stable             |
| nested collapse expand inner/outer         | no stale paths                        |

### Stress/perf rows

| Scenario                                   | Gate                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| 100 collapsed boundaries in 5000-block doc | local typing outside hidden ranges <= current DOM-present default + 5 ms |
| one hidden boundary with 1000 descendants  | expand cost O(boundary), not O(document)                                 |
| remote updates inside hidden boundary      | no document body rerender                                                |
| select-all copy over hidden ranges         | correct payload, no DOM lookup throw                                     |
| nested depth 3                             | no path/selection corruption                                             |
| first and last root hidden                 | no root edge crash                                                       |
| repeated-unit weight                       | DOM/component/handler/effect budgets recorded                            |
| interaction INP proxy                      | p95/p99 rows for select/type/copy/paste/materialize                      |

Future virtualization rows, not Phase 1 release gates:

- viewport materializes caret target before typing;
- scroll materialization bounded by viewport/corridor;
- copy across virtualized ranges model-backed and correct;
- browser find works after full materialization or limitation is explicit;
- stale DOM after replace impossible.

## Phase 5 and 6 Required Proof Matrix

### Before Phase 5 Can Ship

| Proof                                     | Required result                                                         | Current evidence                                                                                                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registration lifecycle                    | no render/effect gap where DOM is omitted but boundary is unregistered  | green for private harness; lifecycle test proves boundary-backed omission does not trigger dev-safety missing-child reporting after layout/microtask reconciliation |
| React StrictMode                          | no duplicate boundaries, stale boundaries, or leaked handlers           | green; StrictMode mount/unmount leaves one boundary while mounted and zero after unmount                                                                            |
| Structural ops                            | insert/remove/split/merge/move remap or invalidate boundaries correctly | green for current private harness: insert/move rebase through runtime ids; remove/split/merge invalidate stale records                                              |
| Nested boundaries                         | parent hidden + child hidden has deterministic policy                   | green; parent-hidden policy sorts before nested child policy                                                                                                        |
| First root self-boundary                  | root-start selection/export/import does not throw                       | green in package and browser placeholder proof                                                                                                                      |
| Last root self-boundary                   | root-end selection/export/import does not throw                         | green in package and browser placeholder proof                                                                                                                      |
| Drag selection across boundary            | deterministic model selection and DOM repair                            | green in Chromium Playwright row                                                                                                                                    |
| Paste over hidden range                   | no browser paste into stale/missing DOM                                 | green in package clipboard row; browser paste gesture remains a later public-hardening row                                                                          |
| Select-all copy                           | payload matches copy policy and includes Plite fragment where expected  | green in Chromium Playwright select-all copy row                                                                                                                    |
| Programmatic select inside hidden content | materializes or model-backs; never calls raw `toDOMPoint` blindly       | green in package materialization row and browser copy/select command row                                                                                            |
| IME while toggling                        | composition text is not lost                                            | green for desktop composition while boundaries are hidden; unsafe toggle-during-composition stays guarded by later public API policy                                |
| Mobile touch near boundary                | no missing target crash; no impossible handles                          | green in Playwright mobile project; raw device proof is not claimed                                                                                                 |
| Browser find before expand                | hidden text not found and documented                                    | green in Chromium Playwright row                                                                                                                                    |
| Browser find after expand                 | fresh text found                                                        | green in Chromium Playwright row                                                                                                                                    |
| A11y smoke                                | placeholder announces collapsed/hidden state correctly                  | green; browser placeholders expose role `note`, accessible names, and `contenteditable=false`                                                                       |
| Remote edit inside hidden boundary        | model updates, boundary summary dirties, body does not rerender         | green for covered model updates: browser proves hidden DOM stays absent and model copy is fresh; React render-count proof keeps visible sibling asleep              |
| 5000-block stress                         | typing outside 100 boundaries adds <= 5 ms median over baseline         | green in focused DOM stress row                                                                                                                                     |
| Large hidden boundary                     | expanding 1000 descendants is O(boundary), not O(document)              | green in React render-count row: hidden body coalesces to one boundary and expansion wakes hidden descendants without document-scale sibling churn                  |
| Dev safety                                | renderer that drops content without `children` or boundary warns/throws | green; dev-only safety reports dropped editable children without coverage and stays quiet for boundary-backed omission                                              |

### Before Phase 6 Can Start

| Proof                       | Required result                                                                          | Current evidence                                                                                                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOM-present group lifecycle | `interactiveReady` and `nativeSurfaceComplete` are separate and measured                 | partial; benchmark has trace fields                                                                                                                                                 |
| Full-doc replace            | no stale old far DOM remains exposed after replacement                                   | gap                                                                                                                                                                                 |
| Background mounting         | bounded max latency; no idle-only starvation                                             | partial; current group mounting exists, max-latency proof missing                                                                                                                   |
| Registry scale              | boundary lookup is indexed, not document-scan                                            | partial; DOM coverage now indexes boundaries by covered root key and passes 5000-block/100-boundary outside lookup stress, but large-doc convergence still needs its own scale gate |
| Large-doc selection         | selection into pending/virtualized content materializes or model-backs deterministically | partial for shell, gap for DOM coverage convergence                                                                                                                                 |
| Large-doc copy              | copy across pending/virtualized ranges produces correct model-backed payload             | partial for shell tests, gap for shared registry                                                                                                                                    |
| Browser find classification | explicit behavior before and after `nativeSurfaceComplete`                               | gap                                                                                                                                                                                 |
| IME/mobile                  | target content materializes before composition/touch editing                             | gap                                                                                                                                                                                 |
| Shell proof                 | shell boundaries classified separately from staged DOM-present groups                    | gap                                                                                                                                                                                 |
| Perf                        | default large-doc typing does not regress after consulting DOM coverage registry         | gap                                                                                                                                                                                 |
| Trace/debug                 | every missing-DOM decision records reason, policy, and boundary id                       | partial; example registry trace exists                                                                                                                                              |

### Phase 4.5 Ralph Pass: Execution-Ready Proof Matrix

Status: complete for planning, not implementation.

Live source re-read for this pass:

- Private React harness:
  `/Users/zbeyens/git/plite/packages/plite-react/src/components/dom-coverage-boundary.tsx`.
  Current `DOMCoverageBoundaryRange` and `DOMCoverageSelfBoundary` register in
  `useIsomorphicLayoutEffect` at lines 69 and 125. That keeps the private proof
  acceptable but leaves public render-synchronous lifecycle law unproven.
- DOM coverage registry:
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-coverage.ts`.
  Current storage is `Map<string, DOMCoverageBoundary>` at line 139, with range
  and point lookup helpers at lines 237 and 250. That is enough for current
  tests and too weak for 1000-boundary or virtualization claims.
- Existing package tests:
  `/Users/zbeyens/git/plite/packages/plite-react/test/dom-coverage-boundary-contract.tsx`
  covers hidden child range, expand/unregister, and first/last root
  self-boundary rows at lines 48, 104, and 155.
- DOM coverage unit tests:
  `/Users/zbeyens/git/plite/packages/plite-dom/test/dom-coverage.ts`
  cover first/last self-boundary and copy-policy primitives, but do not yet
  prove StrictMode lifecycle, structural remap, paste-over-hidden, drag
  selection, IME, mobile, a11y, or stress overhead.
- Large-document benchmark trace:
  `/Users/zbeyens/git/plite/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`
  already records `interactiveReadyAt`, `nativeSurfaceCompleteAt`,
  mounted/pending group counts, stale group count, and surface-weight rows
  around lines 890-957.

Phase 4.5 must execute in this order. Do not publish a public API until every
row is either green or explicitly cut from scope.

| Order | Owner                          | Required proof                                                                                                                   | Current live owner                                                                                                                                       | Driver gate                                                               |
| ----: | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
|     1 | Registration lifecycle         | Boundary registration cannot lag a render that omits DOM. Public adapter must prove no missing-DOM/unregistered-boundary window. | green: private harness and slot adapter use layout-effect registration plus dev-safety microtask proof.                                                  | `bun test ./packages/plite-react/test/dom-coverage-boundary-contract.tsx` |
|     2 | StrictMode cleanup             | Double render/mount/unmount does not leak duplicate boundaries or stale placeholders.                                            | green: StrictMode cleanup row in `dom-coverage-boundary-contract.tsx`.                                                                                   | `bun test ./packages/plite-react/test/dom-coverage-boundary-contract.tsx` |
|     3 | Boundary ID stability          | Boundary ids survive rerenders or are regenerated deterministically without stale records.                                       | green: rerender/id replacement row inspects old id, new id, and registry size.                                                                           | `bun test ./packages/plite-react/test/dom-coverage-boundary-contract.tsx` |
|     4 | Structural remap               | Insert/remove/split/merge/move either remaps or invalidates covered ranges.                                                      | green for insert/remove owner-path proof: registry resolves owner runtime id and prunes deleted owners.                                                  | `bun test ./packages/plite-react/test/dom-coverage-boundary-contract.tsx` |
|     5 | Nested policy                  | Parent hidden + child materialize/copy policy resolves deterministically. Parent-hidden wins unless the plan explicitly changes. | green: parent-hidden wins and range lookup returns parent before nested child.                                                                           | `bun test ./packages/plite-dom/test/dom-coverage.ts`                      |
|     6 | Paste-over-hidden              | Paste spanning covered content never falls back to stale DOM or browser guesswork.                                               | green: hidden selection paste uses model insertion and does not consume stale DOM.                                                                       | `bun test ./packages/plite-dom/test/dom-coverage.ts`                      |
|     7 | Drag selection                 | Drag across placeholder/summary imports to deterministic model selection and repairs DOM selection.                              | green: Chromium and mobile-project browser rows import drag across placeholder to covered model range.                                                   | focused Playwright example sweep                                          |
|     8 | Programmatic select            | Selecting inside covered editable content materializes or model-backs without raw `toDOMPoint`.                                  | green: materialize-policy point resolves to boundary and dispatches materialization hook.                                                                | `bun test ./packages/plite-dom/test/dom-coverage.ts`                      |
|     9 | IME guard                      | Collapse/materialize during composition cannot lose composing text.                                                              | green for desktop browser proof: composition commits while boundaries stay hidden. Raw mobile IME is not claimed.                                        | Chromium focused Playwright example sweep                                 |
|    10 | Mobile touch                   | Touch handles near first/last self-boundary do not target missing DOM.                                                           | green for Playwright mobile project: touch near header/footer placeholders and expansion has no page error. Raw device proof remains release-only.       | mobile focused Playwright example sweep                                   |
|    11 | A11y placeholder               | Placeholder/summary announces collapsed/hidden state without pretending hidden descendants are in native DOM.                    | green smoke: placeholders are deterministic, `contenteditable=false`, named, and example uses role/names.                                                | focused Playwright example sweep                                          |
|    12 | Browser find docs              | Hidden content is not found before expand; fresh content is found after expand.                                                  | green: browser find row proves hidden text absent until materialized, then found after expand.                                                           | focused Playwright example sweep                                          |
|    13 | Remote hidden update dirtiness | Updating model content inside a covered boundary dirties boundary summary only, not full body.                                   | green at example/model level: hidden model updates stay out of DOM and copy from model; full collab remote dirtiness remains a later collaboration lane. | focused Playwright example sweep                                          |
|    14 | 5000-block stress              | 100 boundaries add <= 5 ms median to typing outside boundaries.                                                                  | green: registry now uses root-bucketed boundary lookup with snapshot-version refresh, and the 5000-block/100-boundary stress row passes.                 | `bun test ./packages/plite-dom/test/dom-coverage.ts`                      |
|    15 | Large hidden boundary          | Expanding 1000 descendants costs O(boundary), not O(document).                                                                   | green: 1000-descendant expansion renders boundary content without waking document-scale siblings.                                                        | `bun test ./packages/plite-react/test/dom-coverage-boundary-contract.tsx` |
|    16 | Dev safety                     | A renderer that drops `children` without a boundary warns or throws in development.                                              | green: dev safety check reports dropped editable children without a DOM coverage boundary.                                                               | `bun test ./packages/plite-react/test/dom-coverage-boundary-contract.tsx` |

Hard cuts after this pass:

- Phase 5a can compare API shapes, but it cannot ship them.
- `SelfBoundary` stays an internal/private concept unless the API bake-off
  proves the unified `Boundary` scope shape is awkward.
- Large-document work remains blocked on Phase 6 entry gates; do not use this
  Phase 4.5 matrix as permission to migrate staging.

## Implementation Phases

### Phase 0: Red proof and hot-surface baseline

Add failing or skipped TODO rows for:

- renderer omits children and DOM lookup crashes;
- hidden nested child selection;
- hidden first root node selection;
- hidden last root node selection;
- copy/select across missing descendants.

Add baseline instrumentation for repeated unit weight:

- default block/leaf DOM nodes;
- React component proxy;
- Plite-owned event handlers;
- effects/subscriptions;
- O(n) render lookups;
- heap and p95/p99 interaction proxy for select/type/materialize.

### Phase 1: Internal DOM coverage registry

Build internal registry first:

```ts
editor.runtime.domCoverage.getBoundaryForPoint(point);
editor.runtime.domCoverage.getBoundariesForRange(range);
editor.runtime.domCoverage.materialize(boundaryId, reason);
editor.runtime.domCoverage.subscribe(boundaryId, listener);
```

Hard cuts:

- interval/coalesced lookup, not descendant scanning;
- structural commits remap records;
- delete owner clears records;
- normal boundary-aware API never throws for a point covered by a boundary;
- large-document root groups do not migrate yet unless unavoidable.

### Phase 2: Boundary-aware bridge policy

Add internal helpers:

```ts
toDOMPointOrBoundary(point, options);
toDOMRangeOrBoundary(range, options);
toPlitePointFromBoundary(domPoint, options);
materializeBoundary(boundaryId, reason);
```

Hard cuts:

- model point inside boundary cannot call normal `toDOMPoint`;
- DOM import from placeholder maps to boundary;
- composition blocks unsafe transitions;
- copy/paste policy never falls back to stale DOM.

### Phase 3: Private/internal harness

Use internal test-only/private components:

```tsx
<BoundaryRange />
<SelfBoundary />
```

No public docs yet. The harness proves lifecycle and bridge behavior before API
commitment.

### Phase 4: Example and generated browser proof

Build `dom-coverage-boundaries.tsx` and the browser matrix.

If the example reads badly, revise the API before public exposure.

### Phase 4.5: Deepen internal proof

Do this before any public export.

Hard cuts:

- no public slots;
- no large-doc convergence;
- no docs calling this supported public API.

Work:

```txt
structural remap
nested policy
paste over hidden range
drag selection
IME toggle guard
mobile smoke
a11y smoke
StrictMode lifecycle
scale lookup
```

Gate:

```txt
focused browser matrix green
5000-block hidden-boundary stress green
no stale boundary records
```

### Phase 5a: API bake-off

Build three private examples using the same registry:

1. React slot API.
2. Element-spec API.
3. Lower-level boundary registration API.

Gate:

```txt
collapsible-section example is readable
hidden-header/footer example has no weird hacks
API does not expose raw runtime child ids
```

If the example is ugly, the API is wrong.

#### Phase 5a Ralph Pass: API Bake-Off Verdict

Status: complete for planning, not implementation.

Live source re-read for this pass:

- Current `renderElement` props expose `attributes`, `children`, `element`,
  `index`, `path`, and runtime-backed Plite attributes in
  `/Users/zbeyens/git/plite/packages/plite-react/src/components/editable-text-blocks.tsx:228`.
  Normal authoring is still one opaque `children` tree.
- Current element specs in
  `/Users/zbeyens/git/plite/packages/plite/src/interfaces/editor.ts:413`
  support static behavior such as `atom`, `inline`, `isolating`,
  `keyboardSelectable`, `readOnly`, `selectable`, and `void`; they do not
  express per-render child range layout.
- Current extension docs list lower-level slots like `elements`,
  `normalizers`, `commitListeners`, `operationMiddlewares`, and `capabilities`
  in `/Users/zbeyens/git/plite/docs/concepts/08-plugins.md:229`.
- Current internal boundary records already carry `ownerRuntimeId`,
  `ownerPath`, path/runtime ranges, `reason`, `selectionPolicy`, `copyPolicy`,
  `findPolicy`, and `version` in
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-coverage.ts:70`.

Bake-off result:

| Candidate                    | Verdict                                      | Why                                                                                                                                                                                                                                                   |
| ---------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React slot adapter           | leading React authoring shape, still private | Best fit for collapsible section layouts where a summary stays mounted and child ranges are covered. It matches how React renderers think, but cannot become public until Phase 4.5 lifecycle/StrictMode/paste/IME/mobile/a11y/stress proof is green. |
| Element-spec defaults        | keep as later default/policy layer           | Best fit for stable node-type behavior such as hidden header/footer, atom-like nodes, default copy/selection policy, and self coverage. It is too static for ad hoc nested child ranges and should not replace the React adapter.                     |
| Lower-level registration API | internal only                                | Necessary for tests, large-doc staging, shell, and maybe advanced integrations. Too easy for app authors to misuse because it exposes runtime/path mechanics and can bypass render lifecycle safety.                                                  |

Chosen Phase 5a shape:

```tsx
<slots.Boundary
  scope={{ type: "children", from: 1, to: 3 }}
  mounted={!collapsed}
  reason="app-collapse"
  selectionPolicy="materialize"
  copyPolicy="include-model"
  findPolicy="not-native-until-mounted"
  renderPlaceholder={({ materialize }) => (
    <button type="button" onClick={materialize}>
      Show content
    </button>
  )}
/>
```

Self coverage stays one scoped form, not a separate primary public primitive:

```tsx
<slots.Boundary
  scope={{ type: "self" }}
  mounted={!hidden}
  reason="app-hidden"
  selectionPolicy="boundary"
  copyPolicy="exclude"
  findPolicy="not-native-until-mounted"
  renderPlaceholder={({ materialize }) => (
    <button type="button" onClick={materialize}>
      Show header
    </button>
  )}
/>
```

Future element-spec layer, only after slot behavior is proven:

```ts
defineEditorExtension({
  name: "hiddenHeader",
  elements: {
    header: {
      type: "header",
      domCoverage: {
        scope: "self",
        mountedWhen: (element) => !element.hidden,
        reason: "app-hidden",
        selectionPolicy: "boundary",
        copyPolicy: "exclude",
        findPolicy: "not-native-until-mounted",
      },
    },
  },
});
```

Hard decisions from the bake-off:

- Do not publish `SelfBoundary` as a separate stable concept unless the unified
  scoped API becomes unreadable in real examples.
- Do not expose raw runtime child ids in public API.
- Do not expose lower-level registration as normal app API.
- Do not call this supported until the Phase 4.5 matrix is implemented and
  green.
- Do not start Phase 5b. Unstable public API planning depends on implemented
  lifecycle/browser/stress proof, not just this bake-off.

Deferred until:

- Phase 5b is deferred until the Phase 4.5 proof matrix is implemented and
  green:
  registration lifecycle, StrictMode cleanup, boundary ID stability, structural
  remap, nested policy, paste-over-hidden, drag selection, programmatic select,
  IME guard, mobile touch, a11y placeholder, browser find docs, remote hidden
  update dirtiness, 5000-block stress, large-boundary expansion, and dev safety.
- Phase 6 is deferred until the DOM-present large-document gates are green:
  `interactiveReady` / `nativeSurfaceComplete`, no stale full-doc replace,
  bounded background mounting, indexed registry scale, large-doc selection/copy,
  browser find classification, IME/mobile target materialization, shell
  classification, default typing non-regression, and trace/debug coverage.
- This is condition-based, not calendar-based. If the user says "go implement
  the proof lane", the next active owner is Phase 4.5 implementation/proof in
  `Plate repo root`, not more planning prose.

### Phase 5b: Unstable public API

Ship only as unstable after Phase 4.5 and 5a pass:

```tsx
slots.unstableBoundary;
```

or:

```tsx
unstable_slots.Boundary;
```

Candidate stable target remains one API:

```tsx
slots.Boundary;
```

with `scope={{ type: 'children', from, to }}` or `scope={{ type: 'self' }}`.

Hard cuts:

- no `HiddenRange`;
- no `HiddenSelf`;
- no arbitrary partial-text hiding;
- no virtualization claim;
- no native find promise for unmounted content;
- no effect-registered public boundary unless lifecycle proof proves no missing
  registry window.

### Phase 5c: Stable public API

Make stable only after:

```txt
IME/mobile/a11y/browser matrix green
structural remap green
scale green
docs honest about find/copy/a11y
```

### Phase 6a: Read-only large-doc registration

Have large-doc mode register coverage boundaries for debug/bridge visibility
without changing behavior.

Gate:

```txt
no perf regression
no behavior regression
coverage trace explains mounted/pending/shell regions
```

### Phase 6b: Shared bridge

Let selection/copy/paste consult DOM coverage for large-doc pending/shell
regions.

Gate:

```txt
copy/select/paste behavior same or better than existing large-doc proof
```

### Phase 6c: Staged mounting convergence

Only then migrate DOM-present staged mounting to coverage boundaries.

Gate:

```txt
no stale old DOM after full-doc replace
default typing still green
nativeSurfaceComplete bounded
```

### Phase 6d: Virtualization research

Keep experimental.

Gate:

```txt
materialize caret target
model-backed copy
IME target mounting
mobile selection
browser find strategy
screen-reader strategy
persistent caret soak
```

## Maintainer Objections

| Objection                                                  | Answer                                                                                                                                                                                           | Verdict                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| "Why not just let people omit `children`?"                 | Current DOM helpers still map model nodes to DOM nodes and throw when missing. Omission needs policy, not silence.                                                                               | keep boundary          |
| "This is too much for collapsible blocks."                 | Collapse is the small case. First/last root nodes, nested ranges, copy/paste, IME, mobile, and collaboration are the actual contract.                                                            | keep scope             |
| "Slots are too much API."                                  | Correct for v1. The plan now proves registry/bridge first and exposes slots only after proof.                                                                                                    | revise accepted        |
| "Why rename hidden subtree?"                               | Hidden is product-shaped. DOM coverage also covers staged mounting, atoms, shell, and future virtualization.                                                                                     | keep rename            |
| "ProseMirror lets NodeViews omit contentDOM."              | Yes, and then it treats the view as a boundary/atom-like unit with selection/mutation obligations.                                                                                               | keep                   |
| "Lexical slots solve it."                                  | Slots inspire placement, but Plite still needs explicit selection/copy/materialization policy for model-present hidden descendants.                                                              | keep                   |
| "Use CSS only."                                            | CSS hiding cannot prove model-backed selection/copy/materialization, stale DOM, IME, or a11y behavior.                                                                                           | reject                 |
| "Browser find won't work."                                 | Correct for intentional collapse. Not acceptable to hide that limitation or apply it silently to virtualization.                                                                                 | keep honest            |
| "Future virtualization is separate."                       | Separate policy, same primitive. Two missing-DOM systems would multiply selection bugs.                                                                                                          | keep convergence       |
| "Optimize the render unit first."                          | Accepted from GitHub article. Phase 0 now includes hot-surface baseline and budgets.                                                                                                             | keep                   |
| "The private harness passed. Why delay public slots?"      | The harness proves runtime feasibility, not public lifecycle safety. A public component that registers after render can still create the exact missing-DOM race the primitive exists to prevent. | revise Phase 5         |
| "SelfBoundary is necessary."                               | The concept is necessary. The public component is not proven. Prefer one `Boundary` with `scope: 'self'` unless the API bake-off proves the unified shape is awkward.                            | revise public API      |
| "Collapse and large-doc staging have different semantics." | Correct: different policies, not different missing-DOM mechanics. Share registry/bridge; keep policy engines separate.                                                                           | keep Phase 6 direction |
| "This is too much proof."                                  | Missing DOM is one of the highest-risk editor surfaces: selection, IME, mobile, a11y, copy/paste, and stale DOM all fail loudly when under-proved.                                               | keep gates             |

## High-Risk Pre-Mortem

Trigger:

- Runtime DOM coverage, render contract, public API, selection bridge,
  copy/paste, IME, mobile, collaboration, and performance all change.

Scenario 1: boundary selection silently corrupts model/DOM selection.

- Cause: Plite exports native DOM selection for a model point inside covered
  content.
- Prevention: boundary lookup before DOM export; materialize, boundary, or
  model-backed policy only.

Scenario 2: browser find/copy sees stale content.

- Cause: old DOM remains exposed after model changes.
- Prevention: stale DOM count gate; after hidden update old text must not be
  searchable/copyable as current content.

Scenario 3: public slot API fossilizes wrong abstraction.

- Cause: `HiddenRange` ships before bridge proof and later virtualization needs
  a broader primitive.
- Prevention: public slots delayed; final names use `Boundary` and
  `SelfBoundary`.

Scenario 4: registry adds overhead to normal typing.

- Cause: hidden lookup scans document or every descendant.
- Prevention: interval/coalesced registry, hot-surface budget, 5000-block
  typing gate outside hidden ranges.

Scenario 5: React unit remains bloated.

- Cause: staging hides expensive wrappers, effects, handlers, and rare UI state.
- Prevention: Phase 0 repeated-unit audit; no release claim without
  DOM/component/handler/effect/heap tags.

New Phase 5/6 red flags from GPT Pro review:

1. Effect-based registration is not public-API-safe until race-free lifecycle
   proof exists.
2. Current registry lookup scans registered boundaries; that is fine for proof,
   not for 1000-boundary or virtualization scale.
3. Structural remap through move/split/merge/delete is not yet proven.
4. Separate public `SelfBoundary` may fossilize a leaky category.
5. Policy knobs can turn raw Plite into a browser-behavior footgun if exposed
   before examples/docs are blunt.
6. Model-backed copy is correct but can violate visual intuition.
7. Paste over hidden ranges is not proved by copy-only rows.
8. IME/mobile gaps can block the feature no matter how good desktop copy looks.
9. A11y placeholder semantics are unproven.
10. Browser find must be documented brutally: native find cannot find DOM that
    does not exist.
11. Nested contradictory policies need parent/child precedence law.
12. Large-doc convergence now would pollute a clean collapse primitive.
13. Stale DOM exposure remains a hard failure.
14. Boundary IDs must be stable across rerenders or deterministically
    regenerated.
15. Collapse state ownership must be explicit: document state vs UI state.

## Research / Skill Notes

Applied:

- `plite-ralplan`: revised plan with live source, ecosystem evidence, decision
  brief, score, objections, and gates.
- `performance`: GitHub-scale pass added cohorting, repeated-unit budgets,
  interaction p95/p99 rows, memory/DOM/listener tags, degradation policy,
  staged readiness, and Datadog/RUM gap.
- `vercel-react-best-practices`: relevant rules are
  `client-event-listeners`, `client-passive-event-listeners`,
  `rerender-defer-reads`, `rerender-memo`,
  `rerender-derived-state-no-effect`, `rerender-move-effect-to-event`,
  `rerender-transitions`, `rerender-use-ref-transient-values`,
  `rendering-content-visibility`, `rendering-activity`, `js-index-maps`,
  `js-set-map-lookups`, and `js-batch-dom-css`.
- `performance-oracle`: complexity gates require interval/coalesced lookup,
  O(1)/bucketed sidecar data, bounded allocations, and no document-scale hidden
  update.
- `tdd`: implementation starts with red rows for missing DOM behavior before
  registry/API work.
- `high-risk-deliberate-pass`: pre-mortem and expanded proof plan recorded.
- `steelman-pass`: maintainer objections updated.
- `intent-boundary-pass`: intent, scope, non-goals, and decision boundaries are
  explicit.

Skipped:

- `react-useeffect`: no concrete new effect design yet; Phase 0 explicitly bans
  hot repeated effects unless external synchronization is proven.
- `shadcn`: no public UI component or styling work in Phase 0-3.

## Score

### Internal Primitive Checkpoint

| Dimension                              | Score | Evidence                                                                                                                 |
| -------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------ |
| React 19.2 runtime performance         |  0.94 | Hot Surface Performance Plan; GitHub article evidence; `performance` rules; live DOM-present source references.          |
| Plite-close unopinionated DX           |  0.94 | Public API delayed; raw Plite exposes boundary primitives, not Plate collapsible product API.                            |
| Plate and slate-yjs migration backbone |  0.91 | DOM coverage is runtime/substrate-level; remote hidden edit and boundary remap rows; no current-version adapter promise. |
| Regression-proof testing strategy      |  0.95 | Unit, React, browser, stale-DOM copy, first/last root, and repeated-unit budget rows for the internal primitive.         |
| Research evidence completeness         |  0.94 | Live Plite, Lexical, ProseMirror, and user-provided GitHub performance evidence included.                                |
| shadcn-style composability/minimalism  |  0.91 | Public slots deferred; private harness is not presented as user-facing UI.                                               |

Internal primitive score: `0.93`.

Verdict:

- The internal primitive checkpoint remains complete.
- Phase 0-4 implementation was the right safe target.
- This does not authorize public slots or large-doc convergence.

### Phase 5/6 Public API and Convergence Gate

| Dimension                              | Score | Evidence                                                                                                                                          |
| -------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |  0.88 | Hot-surface budgets exist, but StrictMode/lifecycle registration and 5000-block boundary stress are still gaps.                                   |
| Plite-close unopinionated DX           |  0.90 | Unified `Boundary` with `scope` is cleaner than `Hidden*`, but API bake-off is still missing.                                                     |
| Plate and slate-yjs migration backbone |  0.87 | Substrate shape is right; structural remap, remote hidden update dirtiness, and large-doc policy split need proof.                                |
| Regression-proof testing strategy      |  0.84 | Copy and private harness proof exist, but paste, drag selection, IME, mobile, a11y, browser find, StrictMode, and structural remap remain open.   |
| Research evidence completeness         |  0.92 | Live source plus Lexical/ProseMirror/GitHub performance evidence is enough for direction; React public lifecycle proof remains local-source work. |
| shadcn-style composability/minimalism  |  0.89 | Unified `Boundary` target is minimal, but the public component/spec split needs bake-off examples.                                                |

Phase 5/6 score: `0.88`.

Closure verdict:

- The GPT Pro Phase 5/6 plan-update pass is complete.
- Phase 5/6 execution remains deferred behind the proof gates below.
- Next owner, when explicitly resumed, is a Plite Ralplan proof-hardening pass,
  not implementation.
- Do not execute public API or large-doc convergence from this review pass.

## Pass-State Ledger

| Pass                                              | Status                        | Evidence added                                                                                                                                                                                                                        | Plan delta                                                                                                                                                                                                                                                                                                    | Open issues                                                                                   | Next owner                                            |
| ------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| current-state read                                | complete                      | Live Plite source references for render children, DOM mapping, large-document top-level ranges, void shell                                                                                                                            | Preserved source-backed before state                                                                                                                                                                                                                                                                          | none                                                                                          | revision pass                                         |
| ecosystem evidence                                | complete                      | Lexical slot/decorator evidence; ProseMirror contentDOM/atom/selection evidence                                                                                                                                                       | Kept runtime-owned boundary direction                                                                                                                                                                                                                                                                         | none                                                                                          | revision pass                                         |
| GPT Pro revision                                  | complete                      | User-provided harsh review                                                                                                                                                                                                            | Renamed primitive, delayed public slots, added DOM bridge policy                                                                                                                                                                                                                                              | none                                                                                          | implementation Phase 0                                |
| GitHub perf revision                              | complete                      | User-provided diff-line article                                                                                                                                                                                                       | Added hot-surface audit, budgets, INP/memory/DOM tags, virtualization policy ladder                                                                                                                                                                                                                           | none                                                                                          | implementation Phase 0                                |
| closure                                           | complete                      | Score `0.93`; all dimensions above `0.85`                                                                                                                                                                                             | Plan ready for user review                                                                                                                                                                                                                                                                                    | none                                                                                          | later execution request                               |
| implementation Phase 0/1 tracer                   | complete                      | `Plate repo root` added internal `DOMCoverage`; focused tests, package typecheck, `bun check`, and tiny benchmark profile smoke passed                                                                                                  | Phase 0 red proof and Phase 1 registry started in code; hot-surface benchmark profile now emits surface-weight counters                                                                                                                                                                                       | bridge/copy/paste/materialization still unwired; no public slots                              | implementation Phase 2                                |
| implementation Phase 2 bridge                     | complete                      | `Plate repo root` added boundary range export, placeholder import, materialization hook, and model-backed copy proof                                                                                                                    | DOM coverage bridge helpers exist internally in `plite-dom`; stale DOM copy fallback is bypassed when selection intersects included covered content                                                                                                                                                           | paste-over-hidden, IME, mobile, and full drag selection still need browser rows               | implementation Phase 3                                |
| implementation Phase 3 private harness            | complete                      | `Plate repo root` added private `DOMCoverageBoundaryRange` and `DOMCoverageSelfBoundary` React harness plus package tests                                                                                                               | Internal harness proves child-range omission, expand unregister, and first/last root self-boundaries without public slots                                                                                                                                                                                     | harness is private and not exported as user-facing API                                        | implementation Phase 4                                |
| implementation Phase 4 example/proof              | complete                      | hidden `/examples/dom-coverage-boundaries` route, `dev-browser` proof, screenshot artifact                                                                                                                                            | Comprehensive proof route covers hidden header/footer, outer collapse, nested collapse, model update/select/copy, and registry trace                                                                                                                                                                          | not enough proof for public slots; not enough proof for large-doc convergence                 | completion checkpoint                                 |
| GPT Pro Phase 5/6 review                          | complete                      | User-provided post-proof harsh review plus live source read of private harness effect registration and registry scan shape                                                                                                            | Phase 5 split into 4.5/5a/5b/5c; Phase 6 split into 6a/6b/6c/6d; public target changed to one `Boundary` with `scope`                                                                                                                                                                                         | Phase 5/6 score `0.88`; proof gaps remain                                                     | proof-hardening Ralplan pass                          |
| Ralph Phase 4.5 proof hardening                   | complete                      | Re-read live harness, registry, tests, clipboard tests, and benchmark trace fields                                                                                                                                                    | Added execution-ready Phase 4.5 proof matrix with 16 ordered owners, driver gates, and hard cuts                                                                                                                                                                                                              | no implementation proof executed yet; public API still blocked                                | Phase 5a API bake-off                                 |
| Ralph Phase 5a API bake-off                       | complete                      | Re-read renderElement props, element specs, extension slots, and DOMCoverageBoundary record shape                                                                                                                                     | Chose React slot adapter as leading authoring shape, element specs as later default/policy layer, and raw registration as internal-only                                                                                                                                                                       | Phase 5b cannot start until Phase 4.5 proof is implemented and green                          | Phase 4.5 implementation/proof lane when user says go |
| implementation Phase 4.5 rows 1-6/8 package proof | complete                      | `Plate repo root` focused tests cover StrictMode cleanup, boundary id replacement, owner-path insert/remove, parent-first nested policy, hidden paste, and programmatic materialization                                                 | DOM coverage registry resolves owner runtime ids before lookup and prunes deleted owners; DOM tests use real runtime ids instead of fake ids                                                                                                                                                                  | later rows continued in browser/stress pass                                                   | Phase 4.5 browser/example proof                       |
| implementation Phase 4.5 browser/example proof    | complete                      | Chromium Playwright and mobile-project Playwright proof on `/examples/dom-coverage-boundaries`                                                                                                                                        | `DOMEditor.toPlitePoint` imports boundary placeholder DOM points, including adjacent element-offset points, through DOM coverage before normal non-editable fallback; example proof covers find, placeholder metadata, model-backed copy, drag import, hidden update dirtiness, IME, and mobile-project touch | raw mobile device proof remains release-only, not claimed                                     | Phase 4.5 stress/dev-safety proof                     |
| implementation Phase 4.5 stress/dev-safety proof  | complete                      | `Plate repo root` focused tests cover indexed 5000-block/100-boundary lookup, runtime endpoint split/merge invalidation, structural move rebasing, hidden update dirtiness, 1000-descendant expansion, and dropped-children dev warning | DOM coverage registry now has root-bucketed lookup with snapshot-version refresh; private harness expansion proves boundary-sized wakeup; normal renderers that omit editable children without coverage report a dev error; browser proof includes select-all model-backed copy and a11y placeholder smoke    | raw mobile device and full collaboration dirtiness are outside this hidden-subtree proof lane | Phase 5b unstable public API                          |
| implementation Phase 5 public API                 | complete for unstable adapter | Phase 4.5 matrix is green and Phase 5a selected React slot adapter                                                                                                                                                                    | `RenderElementProps.slots.unstableBoundary` supports `scope: { type: 'children' }` and `scope: { type: 'self' }` without exposing raw runtime ids; changeset added for `plite-react`                                                                                                                          | stable `slots.Boundary` still waits for broader adoption/docs; no `Hidden*` names shipped     | Phase 6 deferred                                      |
| implementation Phase 6 large-doc convergence      | pending                       | Collapse proof is green, but large-doc staging has stricter default-mode, stale-DOM, and native-readiness obligations                                                                                                                 | Do not migrate staged mounting/virtualization onto DOM coverage until DOM-present lifecycle and full-doc replace proofs are green                                                                                                                                                                             | registry scale, full-doc replace, native readiness                                            | future large-document plan                            |

## Plan Deltas From Revision

Accepted changes:

- `HiddenSubtreeBoundary` -> `DOMCoverageBoundary`.
- Public `slots.HiddenRange` / `slots.HiddenSelf` removed from first slice.
- First public target moved away from `Hidden*` names and toward the
  `Boundary` concept.
- Added internal private harness before public API.
- Added collapsed/staged/virtualized/shell/atom policy table.
- Added explicit DOM import/export bridge pseudocode.
- Added GitHub-inspired hot-surface performance audit.
- Added repeated-unit budgets for DOM nodes, React components, handlers,
  effects, subscriptions, O(n) lookups, heap, layout/style, and p95/p99 INP.
- Added future virtualization lane as policy-tier convergence, not default.
- Updated implementation phases to defer large-doc convergence until after
  collapse proof.
- After post-proof GPT Pro review, kept the internal primitive complete but
  reopened Phase 5/6 planning as pending.
- Changed final public target from separate `Boundary` / `SelfBoundary` slots to
  one `Boundary` with `scope`.
- Changed public prop direction from `hidden` to `mounted`.
- Added `Phase 4.5` internal proof hardening before any public API.
- Split public API into API bake-off, unstable API, and stable API gates.
- Split large-doc convergence into read-only registration, shared bridge,
  staged mounting convergence, and virtualization research.
- Added proof matrix for registration lifecycle, StrictMode, structural remap,
  paste, drag, IME, mobile, a11y, browser find, and stress rows.
- Ralph activation converted the Phase 4.5 gap list into a 16-row
  execution-ready proof matrix with live source owners and driver gates.
- Ralph Phase 5a chose the future API layering:
  React slot adapter first, element-spec defaults later, raw registration
  internal only.
- Clarified "deferred" as condition-based: Phase 5b waits for Phase 4.5 proof
  implementation to pass; Phase 6 waits for DOM-present large-document gates.
- Reopened the lane with `ralph` as active implementation, not review-only
  planning.
- Phase 4.5 rows 1-6 and the programmatic-selection part of row 8 now have
  focused package proof in `Plate repo root`.
- Phase 4.5 browser/example proof now covers browser find before/after expand,
  deterministic placeholders, model-backed hidden copy, drag import across a
  placeholder, hidden update dirtiness at the example level, and mobile viewport
  touch smoke.
- Phase 4.5 stress/dev-safety proof now covers indexed 5000-block lookup,
  runtime endpoint split/merge invalidation, structural move rebasing,
  select-all model-backed copy, a11y placeholder smoke, hidden update dirtiness,
  a 1000-descendant expansion row, and a development warning when a renderer drops
  editable children without coverage.
- Phase 5b now ships only the unstable React adapter:
  `RenderElementProps.slots.unstableBoundary`.

Dropped:

- Shipping `slots.HiddenRange` in the first public API.
- Treating `HiddenSelf` as a child slot.
- Naming the core primitive around hidden UI.
- Treating public `SelfBoundary` as the default first-class API.
- Starting large-doc convergence immediately after the collapse example.

Unchanged:

- Normal renderers must render children or register a runtime-owned boundary.
- Plite owns the missing-DOM invariant; Plate owns product UI.
- Browser find over intentionally hidden content is not natively supported.
- Stale DOM is unacceptable.
- Phase 0 starts with red proof.
- Internal `DOMCoverageBoundary` remains the keeper primitive.

## Implementation Checkpoints

### 2026-05-02 Phase 4.5 implementation proof slice A

Status: complete for focused package proof; Phase 4.5 remains pending overall.

Actions:

- Added owner-runtime resolution to
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-coverage.ts:160`.
  Boundaries now rebase covered paths when the owner runtime id moves and prune
  themselves when the owner disappears.
- Added deterministic parent-first boundary ordering in
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-coverage.ts:305`.
- Changed DOM coverage unit tests to register boundaries with real runtime ids
  from the editor instead of fake ids:
  `/Users/zbeyens/git/plite/packages/plite-dom/test/dom-coverage.ts:80`.
- Added/kept proof rows for:
  - parent hidden policy before nested child policy;
  - paste over hidden selection through the model without stale DOM;
  - programmatic materialization hook for a materialize-policy boundary.
- Added React private harness proof rows for:
  - StrictMode duplicate/leak cleanup;
  - stale boundary id replacement across rerenders;
  - owner path rebasing after structural insert before owner;
  - deleted owner invalidating the registry.

Verification:

- `bun test ./packages/plite-dom/test/dom-coverage.ts` -> 9 pass.
- `bun test ./packages/plite-react/test/dom-coverage-boundary-contract.tsx`
  -> 7 pass.

Remaining Phase 4.5 owners:

- IME guard.
- 5000-block stress.
- Large hidden boundary expand cost.
- Dev safety for dropped children without a boundary.

### 2026-05-02 Phase 4.5 browser/example proof slice B

Status: complete for Chromium and Playwright mobile-project proof; raw mobile
device proof remains outside this slice.

Actions:

- Wired normal DOM import through coverage placeholders in
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-editor.ts:844`.
- Added adjacent placeholder element-offset import in
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-coverage.ts:492`.
- Added browser proof rows in
  `/Users/zbeyens/git/plite/playwright/integration/examples/dom-coverage-boundaries.test.ts:64`:
  - hidden text is absent from native find until expanded;
  - root/child placeholders are deterministic and non-editable;
  - hidden selection copies from the model;
  - native drag across a placeholder imports to the covered model range;
  - hidden model updates stay out of DOM but copy from the model;
  - IME composition still commits while coverage boundaries are hidden;
  - mobile-project touch near hidden first/last root placeholders stays usable.

Verification:

- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/dom-coverage-boundaries.test.ts --project=chromium`
  -> 6 pass, 1 mobile-only skip.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/dom-coverage-boundaries.test.ts --project=mobile -g "mobile touch"`
  -> 1 pass.

Remaining Phase 4.5 owners:

- Raw mobile device proof if this feature ever needs raw-device release claims.

### 2026-05-02 Phase 4.5 stress/dev-safety proof slice C

Status: complete for the hidden-subtree proof lane.

Actions:

- Added a root-bucketed DOM coverage registry index in
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-coverage.ts:395`
  and snapshot-version refresh in
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-coverage.ts:422`.
- Added runtime endpoint resolution/invalidation in
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-coverage.ts:185`.
- Exported `getSnapshotVersion` from
  `/Users/zbeyens/git/plite/packages/plite/src/internal/index.ts:14` so
  registry refresh does not force full snapshot publication just to know whether
  the editor changed.
- Added a 5000-block / 100-boundary stress row in
  `/Users/zbeyens/git/plite/packages/plite-dom/test/dom-coverage.ts:527`.
- Added split/merge invalidation rows in
  `/Users/zbeyens/git/plite/packages/plite-dom/test/dom-coverage.ts:457`.
- Updated the private harness to record covered runtime endpoints in
  `/Users/zbeyens/git/plite/packages/plite-react/src/components/dom-coverage-boundary.tsx:47`.
- Added structural move rebasing in
  `/Users/zbeyens/git/plite/packages/plite-react/test/dom-coverage-boundary-contract.tsx:591`.
- Added a 1000-descendant expansion row in
  `/Users/zbeyens/git/plite/packages/plite-react/test/dom-coverage-boundary-contract.tsx:705`.
- Added a hidden-update dirtiness row in
  `/Users/zbeyens/git/plite/packages/plite-react/test/dom-coverage-boundary-contract.tsx:785`.
- Added and verified the development warning row for renderers that drop
  editable children without a boundary in
  `/Users/zbeyens/git/plite/packages/plite-react/test/dom-coverage-boundary-contract.tsx:859`.
- Added select-all copy and a11y placeholder browser rows in
  `/Users/zbeyens/git/plite/playwright/integration/examples/dom-coverage-boundaries.test.ts:118`
  and `:148`.

Verification:

- `bun test ./packages/plite-dom/test/dom-coverage.ts` -> 12 pass.
- `bun test ./packages/plite-react/test/dom-coverage-boundary-contract.tsx`
  -> 14 pass.
- `bun --filter plite-dom typecheck` -> pass.
- `bun --filter plite-react typecheck` -> pass.
- `bun lint:fix` -> pass.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/dom-coverage-boundaries.test.ts --project=chromium`
  -> 7 pass, 1 mobile-only skip.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/dom-coverage-boundaries.test.ts --project=mobile -g "mobile touch"`
  -> 1 pass.

Remaining Phase 4.5 owners:

- Raw mobile device proof only if this feature needs raw-device release claims.
- Full collaboration remote-dirtiness proof is a later collaboration lane, not a
  blocker for the hidden-subtree primitive.

### 2026-05-02 Phase 5b unstable public API slice

Status: complete for unstable API.

Actions:

- Added `RenderElementProps.slots.unstableBoundary` in
  `/Users/zbeyens/git/plite/packages/plite-react/src/components/editable-text-blocks.tsx:317`.
- Added `scope: { type: 'children', from, to? }` and
  `scope: { type: 'self' }` support without raw runtime ids in
  `/Users/zbeyens/git/plite/packages/plite-react/src/components/editable-text-blocks.tsx:330`.
- Exported the unstable slot types from
  `/Users/zbeyens/git/plite/packages/plite-react/src/index.ts:36`.
- Added slot adapter tests in
  `/Users/zbeyens/git/plite/packages/plite-react/test/dom-coverage-boundary-contract.tsx:295`
  and `:358`.
- Added changeset
  `/Users/zbeyens/git/plite/.changeset/tame-dom-coverage-boundaries.md`.

Verification:

- `bun test ./packages/plite-dom/test/dom-coverage.ts` -> 10 pass.
- `bun test ./packages/plite-react/test/dom-coverage-boundary-contract.tsx`
  -> 12 pass.
- `bun --filter plite-dom typecheck` -> pass.
- `bun --filter plite-react typecheck` -> pass.
- `bun lint:fix` -> pass, no final fixes.
- `bun build:next` -> pass.
- `PLAYWRIGHT_BASE_URL=http://localhost:3101 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/dom-coverage-boundaries.test.ts --project=chromium --workers=1`
  -> 6 pass, 1 mobile-only skip.
- `PLAYWRIGHT_BASE_URL=http://localhost:3101 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/dom-coverage-boundaries.test.ts --project=mobile --workers=1`
  -> 6 pass, 1 desktop-IME skip.

Deferred:

- Stable `slots.Boundary` waits for docs/adoption review.
- Phase 6 waits for DOM-present large-document gates:
  `interactiveReady` / `nativeSurfaceComplete`, no stale full-doc replace,
  bounded background mounting, large-doc selection/copy, browser find
  classification, IME/mobile target materialization, shell classification,
  default typing non-regression, and trace/debug coverage.

### 2026-05-02 Phase 0/1 tracer

Status: complete.

Actions:

- Added internal `DOMCoverageBoundary` types and `DOMCoverage` registry in
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-coverage.ts`.
- Exported `DOMCoverage` from the internal `plite-dom` barrel only.
- Added DOM coverage tests for:
  - nested hidden child point resolving to a boundary before normal DOM point
    lookup;
  - hidden first and last root self-boundaries not covering visible siblings.
- Added profile-mode surface-weight counters to
  `/Users/zbeyens/git/plite/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`:
  `dom-node-count`, `dom-nodes-per-block`,
  `editable-descendant-count`, `editable-descendants-per-block`,
  `root-group-count`, `plite-element-count`, `plite-text-count`,
  `plite-leaf-count`, and `shell-count`.

Files changed in `/Users/zbeyens/git/plite`:

- `packages/plite-dom/src/plugin/dom-coverage.ts`
- `packages/plite-dom/src/internal/index.ts`
- `packages/plite-dom/test/dom-coverage.ts`
- `packages/plite-dom/test/dom-coverage.test.ts`
- `scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`

Verification:

- `bun test ./packages/plite-dom/test/dom-coverage.ts` -> 2 pass.
- `bun test ./packages/plite-dom/test/bridge.ts ./packages/plite-dom/test/dom-coverage.ts` -> 7 pass.
- `bun --filter plite-dom typecheck` -> pass.
- `bun lint:fix` -> pass, no final fixes needed.
- `node --check scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs` -> pass.
- `bun check` -> pass: package/site/root typecheck, Bun tests, and Vitest.
- Tiny benchmark smoke:
  `REACT_HUGE_COMPARE_ITERATIONS=1 REACT_HUGE_COMPARE_BLOCKS=20 REACT_HUGE_COMPARE_PROFILE=1 REACT_HUGE_COMPARE_TYPE_OPS=2 REACT_HUGE_COMPARE_DISPOSE_DELAY_MS=0 bun ./scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`
  -> pass; emitted `surface-weight:*` profile rows.

Evidence from tiny benchmark smoke:

- `v2Off.readyMs.profile.durationByKey.surface-weight:dom-node-count.mean = 81`
  at 20 blocks.
- `surface-weight:dom-nodes-per-block.mean = 4.05`.
- `surface-weight:editable-descendant-count.mean = 40`.
- `surface-weight:editable-descendants-per-block.mean = 2`.

Rejected tactics:

- No public `slots.Boundary` / `slots.SelfBoundary`.
- No `slots.HiddenRange` / `slots.HiddenSelf`.
- No broad large-document migration yet.
- No attempt to make normal `editor.dom.toDOMPoint` silently succeed for
  hidden content; callers must use the boundary-aware helper.

Next owner:

- Phase 2 bridge policy tracer:
  `toDOMRangeOrBoundary`, placeholder-to-Plite import, materialization policy
  hooks, and the first copy/paste/select tests that prove stale DOM is not used.

### 2026-05-02 Phase 2-4 full-plan checkpoint

Status: complete for the currently safe implementation target.

Actions:

- Added internal bridge helpers in
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-coverage.ts`:
  `toDOMRangeOrBoundary`, `toPlitePointFromBoundary`,
  `setMaterializeHandler`, `clearMaterializeHandler`, and
  `materializeBoundary`.
- Changed clipboard write in
  `/Users/zbeyens/git/plite/packages/plite-dom/src/plugin/dom-clipboard-runtime.ts`
  so selections intersecting included DOM coverage boundaries write
  model-backed clipboard data instead of cloning browser DOM.
- Added private React harness components in
  `/Users/zbeyens/git/plite/packages/plite-react/src/components/dom-coverage-boundary.tsx`:
  `DOMCoverageBoundaryRange` and `DOMCoverageSelfBoundary`.
- Added React package proof in
  `/Users/zbeyens/git/plite/packages/plite-react/test/dom-coverage-boundary-contract.tsx`
  for hidden child range omission, expand/unregister, and hidden first/last root
  self-boundaries.
- Added hidden comprehensive browser proof route:
  `/Users/zbeyens/git/plite/site/examples/ts/dom-coverage-boundaries.tsx`,
  registered at `/examples/dom-coverage-boundaries`.

Files changed in `/Users/zbeyens/git/plite`:

- `packages/plite-dom/src/plugin/dom-coverage.ts`
- `packages/plite-dom/src/plugin/dom-clipboard-runtime.ts`
- `packages/plite-dom/src/internal/index.ts`
- `packages/plite-dom/test/dom-coverage.ts`
- `packages/plite-react/src/components/dom-coverage-boundary.tsx`
- `packages/plite-react/test/dom-coverage-boundary-contract.tsx`
- `site/examples/ts/dom-coverage-boundaries.tsx`
- `site/pages/examples/[example].tsx`
- `site/constants/examples.ts`

Verification:

- `bun test ./packages/plite-dom/test/dom-coverage.ts` -> 6 pass.
- `bun test ./packages/plite-dom/test/bridge.ts ./packages/plite-dom/test/clipboard-boundary.ts ./packages/plite-dom/test/dom-coverage.ts`
  -> 19 pass.
- `bun test ./packages/plite-react/test/dom-coverage-boundary-contract.tsx`
  -> 3 pass.
- `bun test ./packages/plite-dom/test/bridge.ts ./packages/plite-dom/test/clipboard-boundary.ts ./packages/plite-dom/test/dom-coverage.ts ./packages/plite-react/test/dom-coverage-boundary-contract.tsx`
  -> 22 pass.
- `bun --filter plite-dom typecheck` -> pass.
- `bun --filter plite-react typecheck` -> pass.
- `bun typecheck:site` -> pass.
- `bun lint:fix` -> pass.
- `bun check` -> pass: lint, package/site/root typecheck, Bun tests, and
  slate-react Vitest.
- `dev-browser --connect http://127.0.0.1:9222` against
  `http://localhost:3101/examples/dom-coverage-boundaries` -> pass:
  initial render showed three placeholders (`hidden-header`,
  `outer-section-body`, `hidden-footer`) and `Hidden alpha` was absent from
  visible DOM.
- Browser interaction proof -> pass:
  selecting/copying the hidden body produced `text/plain: Hidden alpha` and a
  Plite fragment while hidden text remained absent from visible DOM; expanding
  `Outer` rendered fresh `Hidden alpha` and left `nested-section-body`
  registered.
- Screenshot artifact:
  `/Users/zbeyens/.dev-browser/tmp/dom-coverage-boundaries-proof.png`.

Rejected tactics:

- No public `slots.Boundary` / `slots.SelfBoundary` yet.
- No public `slots.HiddenRange` / `slots.HiddenSelf`.
- No claim that browser find sees intentionally hidden DOM.
- No large-document staging migration in this patch.
- No table-in-hidden-content claim.

Deferred gates:

- Public experimental API requires registration lifecycle, StrictMode,
  structural remap, drag selection, paste-over-hidden, IME, mobile touch, a11y,
  browser find documentation, stale-DOM replacement proof, and 5000-block
  hidden-boundary stress.
- Large-document convergence requires DOM-present lifecycle proof:
  `interactiveReady`, `nativeSurfaceComplete`, full-doc replace with no stale
  old DOM, bounded background mounting, registry scale, and default typing
  non-regression.
- Future virtualization remains a policy tier over DOM coverage, not a default
  editable-rich-text behavior.

Next owner:

- Future Plite Ralplan proof-hardening pass, not this completed internal
  checkpoint:
  - Phase 4.5 internal proof hardening;
  - Phase 5a API bake-off across React slot, element-spec, and lower-level
    registration shapes;
  - Phase 6a read-only large-doc registration only after DOM-present lifecycle
    and full-doc replace proof are green.
