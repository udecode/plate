# Slate v2 Lexical API Steal Review Ralplan

Date: 2026-04-30
Status: pending implementation after ralph activation
Code repo: `/Users/zbeyens/git/slate-v2`
Reference repos: `/Users/zbeyens/git/lexical`, `/Users/zbeyens/git/prosemirror`, `/Users/zbeyens/git/tiptap`, `/Users/zbeyens/git/milkdown`
Plan repo: `/Users/zbeyens/git/plate-2`
Skill: `.agents/skills/slate-ralplan/SKILL.md`

## 1. Current Verdict

Slate v2 already stole the right big idea from Lexical: `editor.read` /
`editor.update` with transaction-owned writes.

The next useful steals are narrower and more internal:

1. listener partitions, not one broad `subscribe`
2. typed update tags with a fixed core vocabulary
3. dirty transform scheduling as a deterministic normalization lane
4. extension lifecycle phases and cleanup signals
5. extension-local reactive state, but not public signals as Slate core law
6. decorator/atom isolation semantics, adapted to runtime-owned void/atom shells
7. error handling hooks around update/reconcile/extension runtime

Do not steal:

- class-based nodes
- `$` helper style
- `dispatchCommand` as normal app authoring
- opaque `NodeState` as the main data model
- React plugin/composer ceremony as raw Slate API

Current review score: `0.92` after closing the source/listener partition,
ProseMirror pressure, tag-vocabulary, and public-proof cleanup questions in
section 27.

Gate result: current-state/read, decision-brief pressure, maintainer objection,
proof-matrix, closure-score, live-source correction, whole-API external-editor,
and source/listener closure passes are complete. The corrected decisions in
sections 24, 26, and 27 supersede stale shapes from earlier wording where they
disagree. The planning lane is closed; ralph reopened the lane for implementation
in section 28.

## 2. Intent And Boundaries

Intent:

- Answer what else Slate v2 should steal from local Lexical after the editor
  namespace/runtime hard cut.
- Keep Slate v2 unopinionated, JSON/operation-first, and migration-backbone
  friendly for Plate and slate-yjs.
- Avoid copying Lexical product shape just because its runtime is good.

Desired outcome:

- A ranked set of Lexical-derived API/runtime decisions.
- Clear keep/reject/defer rows.
- Follow-up implementation plan items only where the steal improves Slate v2
  architecture or DX.

In scope:

- `packages/slate` public state/tx/extension/update surfaces.
- `packages/slate-react` subscription/render and atom/void shell pressure.
- `slate-browser` proof contracts for any behavior-facing steal.
- Lexical source under `/Users/zbeyens/git/lexical`.

Non-goals:

- implementing this pass
- current-version Plate adapter support
- current-version slate-yjs adapter support
- copying Lexical node classes
- adding a public command catalog to raw Slate
- adopting signals as a required app-facing dependency
- replacing React projection with a Lexical-style DOM reconciler

Decision boundaries:

- Breaking changes are allowed.
- Internal compatibility is not required before publish.
- Slate can adopt internal runtime patterns even if public naming stays
  Slate-close.
- Any new public API must beat the existing `state` / `tx` shape, not merely
  coexist with it.

Unresolved user-decision points:

- None for this pass.

## 3. Decision Brief

Principles:

- Keep one public lifecycle: `editor.read((state) => ...)` and
  `editor.update((tx) => ...)`.
- Runtime policies may be sophisticated; app APIs should stay small.
- Plugin power belongs in named extension groups, not flat editor clutter.
- Browser behavior gets proof contracts, not example-specific patches.
- React renders projections; it does not own the editing engine.

Top drivers:

- React 19.2 hot-path performance.
- Slate-close DX without legacy Slate footguns.
- Plate/slate-yjs migration backbone.
- Browser regression proof for selection, IME, voids, decorations, and tables.

Viable options:

| Option                                                            | Pros                                                           | Cons                                                                       | Verdict                      |
| ----------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------- |
| Copy Lexical command bus as public API                            | Battle-tested priority/handled semantics                       | Turns raw Slate into command-catalog DX and competes with `tx`             | reject                       |
| Keep Slate `tx` public, add internal prioritized runtime commands | Preserves tx DX while giving first-party event policy ordering | Needs strict boundary docs/tests                                           | keep                         |
| Keep one broad `editor.subscribe`                                 | Simple and already implemented                                 | Encourages broad React wakeups and store recompute                         | revise                       |
| Add named listener/source subscriptions                           | Matches Lexical listener partitioning and React selector goals | More API surface if public too early                                       | keep internal first          |
| Copy Lexical NodeState                                            | Less node subclass boilerplate                                 | Opaque class-node pressure and `$` serialization fights Slate JSON clarity | reject as main model         |
| Add spec-backed JSON attrs/metadata helpers                       | Gets NodeState's boilerplate win without class model           | Needs schema/spec design                                                   | defer                        |
| Copy Lexical Extension lifecycle                                  | Strong dependency/config/cleanup story                         | Lexical phases/names are not Slate vocabulary                              | keep adapted                 |
| Copy Lexical signals                                              | Good extension-local reactivity                                | Extra reactive primitive in core app API is too much                       | keep internal/optional only  |
| Copy DecoratorNode                                                | Strong isolated node lane                                      | Class model and decorator map do not fit Slate DOM contract                | keep semantics, reject shape |

Chosen first-pass target:

- Keep `state` / `tx` as public law.
- Add plan work for internal extension lifecycle phases.
- Add plan work for named source/listener partitions.
- Add plan work for canonical update tags.
- Add plan work for deterministic dirty transform/normalizer scheduling.
- Add plan work for atom/void isolation policy as runtime-owned shell semantics.

Rejected alternatives:

- `editor.dispatchCommand(...)` as normal user mutation.
- `editor.commands.*`.
- class node inheritance.
- public `$getState` / `$setState` style helpers.
- public signals as the default subscription story.

Consequences:

- Existing Slate v2 command-registry should be reviewed as internal middleware,
  not product API.
- `editor.subscribe` should probably remain low-level but stop being the only
  runtime notification primitive used by React.
- Extension API may need a second hard-cut cleanup around lifecycle/config
  phases before publish.
- Browser contracts must prove any atom/decorator-shell policy.

## 4. Confidence Scorecard

| Dimension                                | Score | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| React 19.2 runtime performance           |  0.92 | Section 27 turns broad upstream refresh into a friend/internal source bus target; live Slate v2 already has root selector gates at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/root-selector-sources.ts:24`, projection source/runtime subscribers at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts:84`, and the remaining broad fan-in is isolated at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts:398` and `/Users/zbeyens/git/slate-v2/packages/slate-react/src/annotation-store.ts:668`. |
| Slate-close unopinionated DX             |  0.93 | `BaseEditor` stays small; section 27 rejects root `editor.onSelection` and public `editor.sources`; extension `state` / `tx` / `editor` groups remain the authoring backbone; `setup(ctx)` stays deferred until source subscriptions prove they deserve lifecycle glue.                                                                                                                                                                                                                                                                                                  |
| Plate/slate-yjs migration backbone       |  0.92 | Section 27 defines tag/source interaction for history, collab, paste, and IME without requiring current-version adapters; live commit metadata already carries classes, touched runtime ids, selection impact ids, decoration impact ids, node impact ids, and tags in `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:485` and `:1508`.                                                                                                                                                                                                            |
| Regression-proof strategy                |  0.92 | Section 27 lists red tests for commit/source routing, projection fan-in removal, root hook render stability, targeted refresh, typed tags, and DOM/bookmark pressure; existing proofs already cover selection-only dirtiness, placeholder non-rerender, annotation bookmark rebasing, scoped projection recompute, and targeted source refresh.                                                                                                                                                                                                                          |
| Research evidence completeness           |  0.93 | Section 26 uses local Lexical, ProseMirror, Tiptap, Milkdown, and Obsidian/CodeMirror evidence; section 27 converts it into Slate-owned decisions instead of copying public command chains, class nodes, integer positions, or NodeViews.                                                                                                                                                                                                                                                                                                                                |
| shadcn-style composability/minimal hooks |  0.91 | Section 27 keeps UI/product commands above raw Slate, narrows React hot paths through selectors/source subscriptions, and avoids turning editor chrome or Tiptap chain UX into Slate core API.                                                                                                                                                                                                                                                                                                                                                                           |

Weighted score: `0.92`.

Why not higher:

- This is still a plan, not implementation proof.
- Exact TypeScript signatures can be tightened during implementation.
- The source bus is still an implementation target, not fresh runtime proof.

## 4A. Decision-Brief Pressure Pass Result

Status: complete.

Final keep/drop/defer calls for this pass:

| Candidate                               | Decision     | Slate-shaped boundary                                                                                   |
| --------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| Read/update lifecycle                   | keep         | already public as `editor.read((state) => ...)` and `editor.update((tx) => ...)`                        |
| Public command dispatch                 | drop         | no `editor.dispatchCommand`, no `editor.commands`, no public command catalog                            |
| Internal prioritized command middleware | keep         | friend/internal core policy only; not exposed through `EditorExtension` or root exports                 |
| Public `EditorExtension.commands`       | drop         | remove the field; keep explicit `tx` / `state` / `editor` groups and defer lifecycle helpers            |
| Listener partitions                     | keep         | extension-context/internal sources, plus React hooks/stores; no root `editor.onSelection` method sprawl |
| Canonical update tags                   | keep         | type the core tag vocabulary; keep arbitrary string escape hatch only if scoped as advanced             |
| Dirty transform scheduling              | revise       | call it a normalization scheduler, not Lexical transforms; preserve Slate normalization semantics       |
| Extension lifecycle phases              | revise/defer | keep current declarative slots; consider narrow lifecycle helpers only after source partitions exist    |
| Extension-local reactive state          | defer        | optional internal store/signal-like primitive later; not a required public core dependency              |
| NodeState as user model                 | drop         | plain JSON node attrs/specs remain the Slate data model                                                 |
| Spec-backed attr helpers                | defer        | possibly useful, but only after collab/operation proof                                                  |
| Decorator/atom isolation                | keep         | runtime-owned void/atom shell policy, not class `DecoratorNode`                                         |
| Error hook discipline                   | keep         | runtime/extension error reporter; exact public `onError` shape deferred to maintainer pass              |

Pressure conclusions:

- The existing public extension `commands` field is the wrong part of Lexical
  to copy. It should be hard-cut before publish.
- A private command registry can stay only as internal transform/event policy
  plumbing. If public docs can reach it, the boundary failed.
- Listener partitions should exist, but not as a dozen new root editor methods.
  The clean public place is current extension groups plus React hooks/stores;
  a lifecycle callback is a later source-partition decision, not the first cut.
- Lexical's extension lifecycle is too phased for Slate. The useful part is
  dependencies, conflicts, config, cleanup, and typed registration helpers.
- NodeState's boilerplate reduction is real, but Slate's plain JSON operation
  model matters more. Defer any attr helper until collab proof exists.

Plan delta:

- Public `EditorExtension.commands` moved from unresolved to hard-cut target.
- Listener partitions moved from vague candidate to extension-context/internal
  target.
- Extension lifecycle target changed from Lexical-style phases to a deferred
  source-partition lifecycle pass.
- Dirty transform scheduling renamed to normalization scheduler to avoid
  importing Lexical semantics accidentally.

## 5. Source-Backed Architecture North Star

Slate v2 should be:

```txt
plain JSON Slate model
operation/commit authority in core
editor.read((state) => ...)
editor.update((tx) => ...)
extension groups for state/tx/editor host capabilities
runtime-owned DOM/void/selection policy
React as projection/subscription layer
slate-browser generated contracts for browser behavior
```

Lexical improves this north star by proving the value of:

- dirty-node scheduling below rendering
- lifecycle tags
- extension dependency/config phases
- partitioned listeners
- decorator isolation

Lexical does not improve the north star when it asks Slate to adopt:

- class nodes
- `$` active-context helper style
- public command dispatch as app mutation
- framework composer/plugin ceremony

## 6. Public API Target

Keep:

```ts
editor.read((state) => {
  state.selection.get();
  state.value.get();
});

editor.update((tx) => {
  tx.text.insert("x");
  tx.nodes.set({ type: "heading" });
});
```

Live extension-state correction:

The current extension backbone already exists as declarative slots:

- `state`, `tx`, `editor`, `elements`, `capabilities`, `normalizers`,
  `commitListeners`, and `operationMiddlewares` in
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:745`.
- typed state/tx extension groups in
  `/Users/zbeyens/git/slate-v2/packages/slate/test/generic-extension-namespace-contract.ts:22`
  and usage through `editor.read((state) => state.link...)` /
  `editor.update((tx) => tx.media...)` in the same file at lines 132-148.

Do not replace that proven declarative shape with a broad invented
`setup(ctx)` surface. The hard cut is narrower:

- remove public `EditorExtension.commands`
- keep declarative `state` / `tx` / `editor` / `elements` slots
- keep `commitListeners` and `operationMiddlewares` until a source-partition
  design proves a better typed replacement
- defer `config`, `conflictsWith`, and `setup(ctx)` to an extension-lifecycle
  pass that starts from the live registry instead of from Lexical vocabulary

Current shape to keep:

```ts
editor.extend({
  name: "image",
  elements: [{ type: "image", void: "block" }],
  tx: {
    image(tx) {
      return {
        insert(src: string) {
          tx.nodes.insert({ type: "image", src, children: [{ text: "" }] });
        },
      };
    },
  },
});
```

Possible future lifecycle shape, only after source partitions exist:

```ts
editor.extend({
  name: "history",
  dependencies: ["selection"],
  setup(ctx) {
    return ctx.source("selection").subscribe((selection) => {});
  },
});
```

That future shape is a target, not current source. It must not duplicate the
existing declarative slots, and it must not invent helper names like
`ctx.onTextChange` before the runtime source-partition API exists.

Do not add:

```ts
editor.dispatchCommand(...)
editor.commands.*
$getState(...)
$setState(...)
```

Hard-cut target:

- remove public `EditorExtension.commands`
- remove root public exports of `registerCommand` and `executeCommand`
- keep command-registry in the `slate/internal` friend API for first-party core
  transform/event policy only
- expose plugin power through `state`, `tx`, `editor.<capability>`, `elements`,
  commit listeners, and operation middleware until a narrower lifecycle API is
  proven

## 7. Internal Runtime Target

Steal internally:

- listener partitions:
  - commit/update
  - selection
  - text content
  - node/runtime-id mutation
  - decorator/atom shell
  - root/host DOM
  - editable/focus
- prioritized internal command middleware for browser event policy
- canonical update tags:
  - `history-push`
  - `history-merge`
  - `paste`
  - `collaboration`
  - `skip-collaboration`
  - `skip-dom-selection`
  - `skip-scroll-into-view`
  - `skip-selection-focus`
  - `focus`
  - `composition-start`
  - `composition-end`
- dirty transform scheduler:
  - text leaves first
  - elements after leaves
  - root/finalizer last
  - loop guard
  - transform precondition documentation

## 8. Hook/Component/Render DX Target

Steal:

- subscription hook shape where selector result equality controls rerender
- node-scoped selection hooks
- decorator/atom isolation as runtime shell, not renderer child/spacer API

Do not steal:

- React composer/plugin ceremony as raw Slate app API
- signals as the standard app hook story

Slate target:

```ts
const selected = useElementSelected();
const text = useTextSelector(({ text }) => text?.text ?? "");
const canUndo = useEditorState((state) => state.history.canUndo());
```

Live hook correction:

- `useEditorState(selector, options?)` exists and wraps `editor.read(...)`
  internally in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:110`.
- `useNodeSelector(selector, equalityFn?, { runtimeId?, deferred? })` and
  `useTextSelector(selector, equalityFn?, { runtimeId?, deferred? })` exist in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-node-selector.tsx:108`
  and `:127`. The closure appendix must not flip the argument order.
- `useElementSelected(target?)` exists and is selection-impact filtered in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-element-selected.ts:10`.
- `useEditorFocused()` exists. `useElementFocused()` does not.
- `useDecorationSelector(selector, equalityFn?, { runtimeId? })` exists in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-decoration-selector.tsx:42`.
  `useDecorationSource` does not.

Open issue:

- None for plan closure after this correction. Implementation should keep the
  live hook names above unless a new source-backed perf issue proves a better
  shape.

## 9. Plate Migration-Backbone Target

Plate can migrate if Slate provides:

- extension dependencies/conflicts/config
- installed editor/state/tx groups
- deterministic commit tags
- named listener/source partitions
- runtime-owned atom/void shell contracts
- no product command catalog in raw Slate

Plate should own:

- command palettes
- toolbar actions
- rich product plugin commands
- shadcn UI surfaces
- feature kits

## 10. slate-yjs Migration-Backbone Target

slate-yjs can migrate if Slate provides:

- deterministic operations
- transaction tags for local/remote/collab/paste/history
- replay through `tx.operations.replay`
- runtime id/path snapshot mapping
- operation middleware that is not app-facing command soup
- clear commit metadata for local vs remote application

Do not require a current slate-yjs adapter in raw Slate.

## 11. Legacy Regression Proof Matrix

Any accepted Lexical steal must map to generated proof:

| Steal                         | Regression class                                                      |
| ----------------------------- | --------------------------------------------------------------------- |
| listener partitions           | broad React rerenders, focus loss after search/decorations            |
| normalization scheduler       | normalization loops, stale decorations, tables/inline void navigation |
| update tags                   | paste/history/collab/IME policy drift                                 |
| decorator/atom isolation      | image/void spacer layout, editable void child bugs                    |
| extension lifecycle follow-up | duplicated listener cleanup, dependency order bugs                    |

## 12. Browser Stress / Parity Strategy

Keep fast CI small:

- unit contracts for API shape and scheduler ordering
- focused slate-react selector/render contracts
- small Chromium rows for high-risk edit families

Put broad replay in sparse gates:

- `test:stress` generated operation families
- `bun check:full` for local release-quality sweep
- persistent-profile soak only outside default `bun check`

## 13. Implementation-Skill Review Matrix

| Lens               | Applicability   | Result                                                                                              |
| ------------------ | --------------- | --------------------------------------------------------------------------------------------------- |
| Vercel React       | applied         | Lexical listener partitions reinforce narrow source subscriptions and avoiding broad render wakeups |
| performance-oracle | applied         | dirty leaves/elements and transform fixed-point guard are the highest-value perf/runtime steal      |
| tdd                | applied         | any accepted steal needs behavior contracts through public state/tx or slate-browser replay         |
| shadcn             | skipped         | no UI component surface in this pass                                                                |
| react-useeffect    | skipped for now | next hook/subscription API pass may trigger it                                                      |

## 14. High-Risk Deliberate Pre-Mortem

Failure 1: command bus leaks into public app API and recreates Tiptap/Plate in
raw Slate.

Proof: public docs/examples forbid `editor.commands` and `dispatchCommand`.

Failure 2: listener partitions become more APIs but React still wakes broadly.

Proof: selector contracts assert node/selection/text changes wake only affected
runtime ids or named sources.

Failure 3: dirty transform scheduler changes normalization semantics and causes
loops or hidden order bugs.

Proof: scheduler unit contracts, loop guard tests, replayed normalization
families, and generated browser follow-up typing.

Failure 4: NodeState-inspired metadata becomes opaque and harms collaboration.

Proof: keep plain JSON attrs/specs as the only accepted public data model until
a separate collab-proof metadata plan exists.

## 15. Hard Cuts And Rejected Alternatives

Reject:

- public `editor.dispatchCommand`
- public `editor.commands`
- public `EditorExtension.commands`
- class nodes
- `$` helper style
- required signals dependency in raw Slate
- NodeState as the main user data API
- React composer as raw Slate setup API

Hard-cut target:

- broad `editor.subscribe` use on React hot paths where a named source/listener
  exists.
- public extension `commands` field.

Internal-only allowances:

- friend/internal command middleware for core transform/event policy
- advanced broad `editor.subscribe` as a low-level primitive when no narrower
  source exists

## 16. Slate Maintainer Objection Ledger

Status: maintainer objection pass complete.

These rows are accepted as planning decisions, not implementation completion.
The proof matrix below attaches executable contracts to each behavior claim.

### 16.1 Hard-Cut Public `EditorExtension.commands`

- Pain owner: raw Slate extension authors and Plate maintainers who need command
  surfaces without turning core into a product command catalog.
- Strongest objection: "Plugin authors need one obvious place to define
  keyboard, toolbar, and paste commands."
- Steelman antithesis: Lexical proves prioritized commands are useful for
  editor policy, and Tiptap proves command catalogs are approachable for app
  authors.
- Tradeoff tension: cutting `commands` removes a convenient looking extension
  field, but keeping it creates a second mutation language beside `tx`.
- Why this is not change-for-change-sake: the current Slate v2 direction already
  says writes live inside `editor.update((tx) => ...)`; public commands make
  users ask whether to use `tx`, `editor.commands`, or extension commands.
- Evidence: live Slate v2 has state/tx/editor extension groups; local Lexical
  uses commands as prioritized runtime dispatch; the decision brief rejects
  `editor.dispatchCommand` and `editor.commands`.
- Rejected alternative: keep `EditorExtension.commands` but call it advanced.
  That fails because TypeScript autocomplete still teaches the wrong API.
- Migration answer: document extension power as `tx.<group>` for writes,
  `state.<group>` for reads, and `editor.<group>` for host/controller actions.
  Lifecycle helpers are deferred until the source-partition API exists.
- Docs/example answer: examples should show toolbar actions calling
  `editor.update((tx) => tx.<group>.<verb>())`, not command lookup.
- Regression proof: public surface tests should reject `EditorExtension.commands`,
  `editor.dispatchCommand`, and `editor.commands`; docs grep should reject those
  as normal public API.
- Ecosystem answer: Plate can keep its product command layer above raw Slate;
  slate-yjs stays on operations/commits and does not depend on command catalogs.
- Verdict: keep the hard cut.

### 16.2 Friend/Internal Command Middleware Only

- Pain owner: Slate core maintainers who still need ordered event/transform
  policy for keyboard, input, composition, and DOM repair.
- Strongest objection: "Saying no command API while keeping a command registry
  internally is incoherent."
- Steelman antithesis: if the registry is useful internally, plugin authors may
  reasonably ask for it too.
- Tradeoff tension: internal middleware gives policy ordering without exposing a
  public dispatch language; publicizing it would reintroduce the command
  catalog this plan rejects.
- Why this is not change-for-change-sake: the boundary is about authorship.
  Runtime policy can use internal routing; app authors mutate through `tx`.
- Evidence: Lexical command priority is useful for runtime behavior; Slate v2
  command registry exists as implementation plumbing; the public API law is
  `read`/`update`.
- Rejected alternative: export a command registry and mark it low-level. That
  makes it ecosystem API by accident.
- Migration answer: first-party packages can move event policy through internal
  middleware; external extensions use `state` / `tx` / `editor` groups and
  source hooks until a narrower lifecycle helper is proven.
- Docs/example answer: no user docs for the internal registry; implementation
  docs may mention it only as runtime policy machinery.
- Regression proof: package export tests should prove command registry helpers
  are not public; extension typing should not expose a `commands` field.
- Ecosystem answer: Plate can map higher-level UI commands to `editor.update`
  calls; current-version adapter compatibility is explicitly not required.
- Verdict: keep as friend/internal only, and remove root public exports.

### 16.3 Listener Partitions Through Source APIs And Hooks

- Pain owner: React users and large editors where every selection, decoration,
  focus, or placeholder change cannot wake the whole editor tree.
- Strongest objection: "Named listeners add more API than Slate needs."
- Steelman antithesis: one broad `subscribe` is simpler, easier to explain, and
  flexible enough for non-React integrations.
- Tradeoff tension: named sources increase runtime surface, but broad
  subscriptions make React 19.2 performance depend on every caller being
  disciplined.
- Why this is not change-for-change-sake: the user has already reported
  selection/focus/void regressions where broad policy and React wakeups blur
  ownership. Partitioning is the architecture response.
- Evidence: Lexical partitions update/text/content-editable/decorator/root
  listeners; Slate v2 already has node-scoped selectors and dirty runtime-id
  metadata; broad `editor.subscribe` remains low-level.
- Rejected alternative: add root methods like `editor.onSelectionChange`,
  `editor.onDecorationsChange`, and `editor.onFocusChange`. That clutters the
  editor instance and repeats the method-sprawl problem.
- Migration answer: extensions keep declarative groups today; future source
  listeners should be added only after source partitions are designed. React
  code uses named hooks/stores for selected root facts and node/runtime-id facts.
- Docs/example answer: teach "subscribe where the fact lives": root facts via
  root hooks, node facts by runtime id, extension facts through extension stores.
- Regression proof: render-count tests should prove selection changes dirty only
  affected node/root sources; search decoration updates must not steal focus.
- Ecosystem answer: Plate can attach UI plugin state through extension stores;
  slate-yjs can listen to commit/operation sources without React involvement.
- Verdict: keep source partitions and hooks; defer exact extension lifecycle
  callback names.

### 16.4 Slate Extension Lifecycle Follow-Up Instead Of Lexical Phases

- Pain owner: extension authors who need dependencies, conflicts, config,
  cleanup, and typed listener registration without framework ceremony.
- Strongest objection: "A lifecycle callback is too frameworky for Slate."
- Steelman antithesis: old Slate plugins are mostly functions over editor
  behavior, and that minimal shape is a huge part of Slate's appeal.
- Tradeoff tension: lifecycle solves real extension cleanup/config problems, but
  copying Lexical's phases would make raw Slate feel like a framework.
- Why this is not change-for-change-sake: dependency order, cleanup leaks, and
  event registration are real runtime concerns; a narrow lifecycle callback may
  be the Slate-shaped place to put only the parts declarative slots cannot own.
- Evidence: Lexical extensions have dependency/config/init/output/cleanup
  structure; Slate v2 already has `editor.extend(...)` and extension groups.
- Rejected alternative: copy Lexical's full extension lifecycle names. That
  imports a foreign mental model and too much ceremony.
- Migration answer: raw Slate extensions keep existing declarative slots first.
  If source partitions require imperative lifecycle, add one callback with
  cleanup only after the source API is proven.
- Docs/example answer: do not document lifecycle helpers until they exist.
  Existing docs should teach `state` / `tx` / `editor` groups.
- Regression proof: tests cover dependency order, conflict detection, config
  typing, cleanup on unregister, and abort cleanup after setup failure.
- Ecosystem answer: Plate gets a stable substrate for plugins; slate-yjs can
  install commit/operation listeners without React.
- Verdict: revise/defer. Do not implement broad `setup(ctx)` as phase one.

### 16.5 Normalization Scheduler Instead Of Lexical Transforms

- Pain owner: core maintainers trying to keep normalization deterministic while
  avoiding full-tree recompute and example-specific browser patches.
- Strongest objection: "This is Lexical node transforms dressed up as Slate
  normalization."
- Steelman antithesis: Slate already has `normalizeNode`; adding a scheduler can
  duplicate concepts and make ordering harder to reason about.
- Tradeoff tension: dirty scheduling improves performance and determinism, but
  it must not replace Slate's normalization contract with Lexical semantics.
- Why this is not change-for-change-sake: the useful Lexical idea is dirty
  leaves/elements/root ordering below rendering, not public node transforms.
- Evidence: Lexical dirty-node scheduling is runtime-internal; Slate v2 already
  computes operation dirtiness and dirty runtime ids.
- Rejected alternative: expose Lexical-style user node transforms. That competes
  with `normalizeNode` and invites hidden document writes.
- Migration answer: keep `normalizeNode` as author-facing policy; runtime
  scheduler decides when and in what dirty scope normalization runs.
- Docs/example answer: normalizing docs stay Slate-like; advanced docs describe
  scheduler guarantees, not a new transform authoring API.
- Regression proof: tests cover leaf/element/root order, loop guards, fallback
  element behavior, and deterministic operations from repeated replay.
- Ecosystem answer: Plate normalization remains normal Slate normalization;
  slate-yjs sees deterministic operations, not hidden transform state.
- Verdict: keep as scheduler design, not Lexical transforms.

### 16.6 Runtime-Owned Decorator/Atom Isolation

- Pain owner: app authors who should not need to understand hidden anchors,
  spacers, contentEditable boundaries, or browser IME quirks to render an image
  or mention.
- Strongest objection: "Legacy Slate renderers are flexible; owning the shell in
  runtime reduces React freedom."
- Steelman antithesis: some products need custom DOM structure around voids,
  inline atoms, and editable islands.
- Tradeoff tension: runtime ownership removes footguns but must still allow
  advanced DOM ownership with explicit proof burden.
- Why this is not change-for-change-sake: current regressions came from spacer,
  selection, and inline-void DOM contracts leaking into user renderers.
- Evidence: Lexical `DecoratorNode` isolates rendered content; Slate v2 already
  targets runtime-owned void/atom shells and node-scoped renderers.
- Rejected alternative: keep `{children}`/spacer as normal app renderer
  responsibility. That is exactly the legacy footgun.
- Migration answer: normal elements keep Slate-style content rendering; atoms
  and voids use content-only renderers, with an ugly unsafe shell escape hatch.
- Docs/example answer: image, mention, and editable-island docs should never ask
  authors to place hidden text children for normal use.
- Regression proof: slate-browser contracts cover non-layout spacers, keyboard
  navigation before/on/after atoms, IME mention movement, editable islands, and
  copy/paste around atoms.
- Ecosystem answer: Plate components get simpler visible-content renderers;
  slate-yjs remains model/operation-oriented and does not care about DOM shell.
- Verdict: keep.

### 16.7 Defer NodeState-Like Attr Helpers

- Pain owner: extension authors who want typed attrs, defaults, parsing, and
  boilerplate reduction without losing Slate's plain JSON model.
- Strongest objection: "Lexical NodeState solves boilerplate; deferring it keeps
  raw Slate too manual."
- Steelman antithesis: schema-backed attr helpers could improve DX and agent
  discoverability.
- Tradeoff tension: typed attr helpers are attractive, but hidden state or
  serializer magic can poison operation replay and collab.
- Why this is not change-for-change-sake: this review is about stealing only
  what strengthens Slate v2 now. NodeState is too entangled with Lexical's class
  model to copy as a core data API.
- Evidence: Lexical NodeState attaches data to class-node keys; Slate's north
  star is plain JSON nodes plus deterministic operations/commits.
- Rejected alternative: add public `node.state` or `$getState` / `$setState`
  style helpers. That imports Lexical's active-context and hidden-state pressure.
- Migration answer: keep node attrs in JSON. Revisit spec-backed helpers only
  after a separate collab/replay plan proves serialization, operations, and
  defaults.
- Docs/example answer: document node attrs directly; do not introduce metadata
  helpers in the main API.
- Regression proof: future helper proposal must prove operation replay,
  undo/redo, copy/paste serialization, and slate-yjs compatibility at the
  substrate level.
- Ecosystem answer: Plate can provide richer schema helpers above Slate; raw
  Slate keeps the durable model simple.
- Verdict: defer.

## 16A. Proof Matrix Pass Result

Status: proof-matrix pass complete.

These rows are the execution contract. They are not optional nice-to-haves. If a
future implementation cannot satisfy one row, the architecture decision behind
that row needs to be reopened instead of patched around.

| Contract                            | Must fail when                                                                                                                  | Fast lane                                                                                                                                         | Browser/stress lane                                                                                                    | Evidence owner                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Public surface hard cut             | `EditorExtension.commands`, `editor.dispatchCommand`, public `editor.commands`, or docs/examples teaching those APIs reappear   | Type/export law tests under `packages/slate`; docs grep in repo tooling                                                                           | none; this is API surface, not browser behavior                                                                        | rows 16.1-16.2                     |
| Package-private command middleware  | command registry helpers are exported from public barrels or accepted by external extension types                               | Package export tests plus TypeScript negative fixtures                                                                                            | none                                                                                                                   | row 16.2                           |
| Extension lifecycle follow-up       | future lifecycle helpers duplicate declarative slots, leak command APIs, or clean up listeners nondeterministically             | Extension registry tests for dependency order, unregister cleanup, and command hard-cut; lifecycle helper tests only after source API is designed | stress row with repeated mount/extend/unextend cycles if lifecycle helpers land                                        | row 16.4 plus section 24           |
| Listener/source partitions          | selection, focus, placeholder, decoration, or node updates wake unrelated node renderers or broad React roots                   | Store/source tests with source ids and render-count assertions                                                                                    | slate-browser replay for selection, search highlight focus retention, hovering toolbar, table arrows, image navigation | row 16.3                           |
| Canonical update tags               | history, paste, collab, composition, replay, or skip-DOM-selection metadata disappears before commit/runtime policy             | Commit metadata unit tests and transaction tag typing tests                                                                                       | browser copy/paste/composition replay where tag policy affects DOM selection and history                               | decision brief plus rows 16.2-16.5 |
| Normalization scheduler             | normalization order differs across replay, loop guards fail, fallback elements drift, or dirty scope misses a required ancestor | Unit replay tests for leaf/element/root order, loop guards, fallback element behavior, deterministic operations                                   | stress replay with nested inline/void/table normalization families                                                     | row 16.5                           |
| Runtime-owned atom/decorator shells | spacer is visible/layout-affecting, hidden anchor leaks into app UI, or keyboard/IME movement breaks before/on/after atoms      | DOM contract unit tests for shell shape and non-layout hidden anchor                                                                              | slate-browser rows for image, editable-void, mention IME, keyboard before/on/after, copy/paste around atoms            | row 16.6                           |
| Collab/replay substrate             | `tx.operations.replay` plus commit tags produce nondeterministic model state, hidden attrs, or non-serializable metadata        | Operation replay tests, undo/redo tests, copy/paste serialization tests                                                                           | optional stress replay over generated operation families; no current-version slate-yjs adapter required                | rows 16.1, 16.5, 16.7              |

Fast CI split:

- API/type law tests run in the fast package test lane.
- Lifecycle, tags, normalization, and replay unit tests run in package tests.
- Render-count/source tests run in focused React package tests.
- Docs/API grep runs in `check` or a cheap package-script gate.

Slow proof split:

- Browser parity rows run in focused slate-browser suites during iteration.
- Full generated operation-family browser replay belongs in `test:stress` or
  release-quality `check:full`, not default `bun check`.
- Mobile/device proof is separate; viewport simulation cannot satisfy raw-device
  claims.

Closure criteria from this matrix:

- Every accepted Lexical steal has at least one fast proof row.
- Every behavior-facing steal has at least one browser or stress row.
- No row depends on current-version Plate or slate-yjs adapters.
- No row blesses example-specific fixes as the main safety net.

## 16B. Closure Naming Appendix

Status: closure naming pass complete.

These are the names the execution lane should start from. Changing them later
requires implementation evidence, not taste.

### Extension Lifecycle Helpers

Correction: do not treat broad `setup(ctx)` helper names as current API or as
the first implementation slice.

Current live extension shape:

- `editor.extend(extension)`
- `defineEditorExtension(extension)`
- declarative `state`, `tx`, `editor`, `elements`, `capabilities`,
  `normalizers`, `commitListeners`, and `operationMiddlewares`
- public `commands` field still exists and is the hard-cut target

Decision:

- keep the declarative slots as the main extension shape
- hard-cut public `commands`
- move `registerCommand` / `executeCommand` out of root public exports
- defer `setup(ctx)`, `config`, and `conflictsWith` until a dedicated
  extension-lifecycle pass proves the exact source API
- if `setup(ctx)` lands, it is narrow lifecycle glue for source subscriptions
  and cleanup, not a second way to define state/tx/editor groups

Do not add Lexical-style public phases such as `init`, `build`, `register`, or
`afterRegistration`.

### Source Partitions

Use these source names in runtime contracts and tests:

- `commit`
- `selection`
- `text`
- `node`
- `decoration`
- `atom-shell`
- `root`
- `focus`

Keep broad `editor.subscribe` as an advanced low-level public primitive. It is
currently part of `BaseEditor` and the public-surface contract expects
`extend`, `read`, `subscribe`, and `update` only. React hot paths should still
prefer named source/hooks over broad subscription fanout.

### React Hooks

Public hook names:

- `useEditorState(selector, options?)`
- `useNodeSelector(selector, equalityFn?, { runtimeId?, deferred? })`
- `useTextSelector(selector, equalityFn?, { runtimeId?, deferred? })`
- `useElementSelected(target?)`
- `useEditorFocused()`
- `useDecorationSelector(selector, equalityFn?, { runtimeId? })`

Renderer-scoped overloads may omit `runtimeId` only when the renderer context
already provides it. That keeps JSX clean without creating broad subscriptions.

### Closure Verdict

The naming issue no longer blocks execution. This closure verdict is superseded
by section 26 because the review scope reopened to the whole rewrite API.

## 17. Pass Schedule And Pass-State Ledger

| Pass                                    | Status   | Evidence added                                                                                                                                                   | Plan delta                                                                                                                                                                            | Open issues                                                       | Next owner                                |
| --------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| current-state Lexical API read          | complete | local Lexical source, compiled research refresh, live Slate v2 source                                                                                            | new plan lane and research update                                                                                                                                                     | naming/proof unresolved                                           | decision-brief pressure pass              |
| decision-brief pressure pass            | complete | live Slate command registry, extension registry, Lexical command/lifecycle evidence                                                                              | hard-cut public extension commands; classify listener partitions; lifecycle helpers later revised by section 24                                                                       | maintainer ledger unresolved                                      | maintainer objection pass                 |
| maintainer objection pass               | complete | accepted objection rows for public commands, private middleware, listener partitions, setup lifecycle, scheduler, atom isolation, and NodeState deferment        | hard-cut and keep/defer choices now have maintainer-facing adoption/proof answers                                                                                                     | proof rows still not executable                                   | proof-matrix pass                         |
| proof-matrix pass                       | complete | executable API/unit/browser/stress rows for every accepted behavior/API decision                                                                                 | regression-proof score no longer capped at `0.80`; closure can review against concrete gates                                                                                          | helper names resolved by closure appendix                         | closure score pass                        |
| closure score pass                      | complete | closure naming appendix and final score gate                                                                                                                     | previously set plan status to done; superseded by section 26                                                                                                                          | none for that pass                                                | live-source correction pass               |
| live-source correction pass             | complete | live `/Users/zbeyens/git/slate-v2` source and tests for public editor, extension slots, renderVoid, hooks, callbacks, command exports, tags, DOM host capability | stale before/after shapes corrected; `setup(ctx)` revised to deferred lifecycle target; hook names fixed; already-done renderVoid/onChange/onKeyCommand decisions moved to guard-only | none for that pass                                                | whole-API external-editor research pass   |
| whole-API external-editor research pass | complete | live Slate v2 source plus local Lexical, ProseMirror, Tiptap, Milkdown, Obsidian/CodeMirror compiled evidence                                                    | previous ready verdict reopened; command hard cut, `tx.value.replace`, and schema specs marked already done; next P0 is source/listener partitions before lifecycle sugar             | source/listener partition design and DOM/bookmark pressure remain | source-listener-partition-design          |
| source/listener partition closure pass  | complete | live Slate v2 source for commit metadata, root selector gates, projection/annotation stores, existing narrow tests, plus section 26 external editor pressure     | source categories, visibility, red tests, tag/history/collab/paste/IME interaction, ProseMirror DOM/bookmark pressure, and `setup(ctx)` residue are recorded in section 27            | no planning P0/P1 remains                                         | implementation-source-listener-partitions |

## 18. Plan Deltas From Review

Added:

- New plan lane for Lexical API steal review.
- Local Lexical source refresh in compiled research.
- Initial keep/reject/defer map.
- Whole-API external-editor pass in section 26.
- ProseMirror DOM-selection/bookmark pressure as a first-class next review
  owner, not a footnote under "transactions".
- Tiptap/Milkdown/Obsidian evidence for product/package/test boundaries.
- Source/listener partition closure in section 27.
- Exact source categories, visibility, implementation red tests, tag
  vocabulary, and DOM/bookmark pressure decisions.

Dropped:

- Any idea of public Lexical-style command dispatch.
- Any idea of copying NodeState wholesale.
- Public `EditorExtension.commands` as raw Slate extension API.
- Treating the command hard cut, `tx.value.replace`, or schema element specs as
  future implementation work. They are already live in current source.

Strengthened:

- Listener partitions and dirty transform scheduling are now explicit
  candidates, not vague "runtime inspiration".
- Extension lifecycle is no longer copied from Lexical's multi-phase model;
  section 24 defers a narrow lifecycle helper until source partitions exist.
- Public `EditorExtension.commands` hard-cut now has migration, docs, proof, and
  ecosystem answers.
- Runtime-owned decorator/atom isolation is framed as the Slate answer to
  Lexical `DecoratorNode`, not a class-node copy.
- NodeState-like helpers are deferred behind an explicit operation/collab proof
  requirement.
- Proof matrix now separates fast package/API laws from slate-browser/stress
  rows, so this does not dump slow human-like tests into default CI.
- Closure naming appendix resolves source partition and React hook names enough
  for implementation to start; section 24 revises `setup(ctx)` to deferred.
- Source/listener partitions are now the next P0 because current React projection
  stores have runtime/source listeners but still subscribe through broad
  `editor.subscribe`.
- The test-support cleanup target is narrower: move public-facing seed/replace
  examples away from internal `Editor.replace` where they are not testing the
  friend API.
- Source/listener partitions are no longer an open review question; they are the
  first implementation slice.

## 19. Open Questions

No user question blocks this pass.

Open implementation issues:

- Replace projection/annotation store broad upstream `editor.subscribe` fan-in
  with the friend/internal source bus defined in section 27.
- Add typed canonical tags while preserving the current `tag?: string |
string[]` option.
- Keep ProseMirror-grade DOM-selection and bookmark pressure in the first
  implementation slice, especially around history, collab replay, paste, IME,
  overlays, and DOM repair.
- Clean public-facing tests/docs away from internal `Editor.replace` when the
  target is public API proof. Friend/internal tests may keep it.

Implementation may still refine exact TypeScript parameter shapes for source
listeners and hooks, but the public ownership direction is closed.

What would change the decision:

- A live Slate v2 source proof that current broad subscribe paths are already
  fully replaced by named selectors.
- A collab proof that a NodeState-like helper can serialize through operations
  without hidden state.
- A simpler extension lifecycle that gives dependency/config/cleanup without
  extra phases.
- A proof matrix showing any accepted behavior-facing steal cannot be tested
  without expanding the public API more than planned.

## 20. Implementation Phases With Owners

Not executed in this pass.

Execution phases:

1. Implement friend/internal source bus and route projection/annotation stores
   through it.
2. Add ProseMirror DOM-selection, bookmark, and decoration-mapping pressure
   contracts for the same slice.
3. Add canonical tag vocabulary and public options cleanup.
4. Clean public-facing test-support/docs away from internal `Editor.replace`
   where public API proof is the target.
5. Refine extension lifecycle only after phase 1 proves source-partition
   names; do not start by adding broad `setup(ctx)`.
6. Normalization scheduler prototype with contracts.
7. Atom/decorator isolation proof.
8. Docs and examples rewrite.

## 21. Fast Driver Gates

For this planning lane:

- plan file exists
- research refresh recorded
- completion state done after section 27 records the concrete source/listener
  API choice and closure score

For future implementation:

- focused package typecheck
- focused API law tests
- selector/render contracts
- generated slate-browser proof rows for accepted behavior changes

## 22. Final User-Review Handoff

Accepted:

- keep `editor.read((state) => ...)` and `editor.update((tx) => ...)`
- keep extension `state` / `tx` / `editor.<capability>` groups
- keep content-only `renderVoid({ element, target })`; this is already done in
  live source and should be guarded, not migrated again
- keep `<Slate onChange(value, change)>`,
  `<Slate onValueChange(value, change)>`, and
  `<Slate onSelectionChange(selection, change)>`; `onSnapshotChange` and
  `onKeyCommand` are stale targets, not live API
- add named source partitions and narrow React hooks
- revise `setup(ctx)` from accepted immediate API to deferred lifecycle target;
  current extension slots stay declarative
- keep command registry in `slate/internal` friend API only
- add normalization scheduler contracts, not public Lexical transforms
- keep runtime-owned atom/decorator shell semantics
- defer NodeState-like attr helpers until operation/collab proof exists

Hard cuts:

- no public `EditorExtension.commands`
- no public `editor.dispatchCommand`
- no public `editor.commands`
- no root public `registerCommand` / `executeCommand`
- no class nodes, `$` helpers, or React composer ceremony in raw Slate
- no current-version Plate/slate-yjs adapter requirement

Proof:

- fast API/type/export laws for public surface
- lifecycle, tag, scheduler, and replay unit tests
- React source/render-count tests
- slate-browser rows for selection, focus, search, tables, images, mentions,
  editable islands, copy/paste, and keyboard before/on/after atoms
- `test:stress` / release-quality lanes for broad generated operation-family
  replay

## 23. Final Completion Gates

This plan is done only when:

- total score is at least `0.92`
- no dimension below `0.85`
- every accepted Lexical steal has a Slate-shaped API or internal boundary
- every rejected Lexical feature has a concrete reason
- maintainer ledger rows are accepted
- browser/unit proof rows exist
- `.tmp/<session-id>/completion-check.md` points here with status `done`

Current state: `done` after section 27 closed the source/listener partition,
ProseMirror pressure, tag-vocabulary, and public-proof cleanup questions.

## 24. Live-Source Correction Pass

Status: complete.

This pass exists because stale before/after examples made earlier wording look
more confident than the live checkout supports. The current source wins.

### 24.1 Source Evidence Read

| Surface                    | Current owner                                                                                                                                                                                                                                                                | Live shape                                                                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Public editor instance     | `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:390` and `/Users/zbeyens/git/slate-v2/packages/slate/test/public-surface-contract.ts:132`                                                                                                               | instance methods are `extend`, `read`, `subscribe`, `update`                                                                                      |
| Internal static editor API | `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:953` and `/Users/zbeyens/git/slate-v2/packages/slate/src/internal/index.ts:18`                                                                                                                          | `Editor` is internal/friend API via `slate/internal`, not root public API                                                                         |
| Root command leak          | `bun -e` against `/Users/zbeyens/git/slate-v2/packages/slate/src/index.ts` and `/Users/zbeyens/git/slate-v2/packages/slate/src/core/index.ts:2`                                                                                                                              | root source currently exposes `registerCommand` and `executeCommand`; hard-cut target remains valid                                               |
| Extension shape            | `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:745`                                                                                                                                                                                                    | declarative `state`, `tx`, `editor`, `elements`, `capabilities`, `normalizers`, `commitListeners`, `operationMiddlewares`, plus public `commands` |
| Extension namespace proof  | `/Users/zbeyens/git/slate-v2/packages/slate/test/generic-extension-namespace-contract.ts:56` and `:132`                                                                                                                                                                      | extension groups already compose through `editor.read((state) => ...)` and `editor.update((tx) => ...)` without mutating editor instances         |
| State/tx public proof      | `/Users/zbeyens/git/slate-v2/packages/slate/test/state-tx-public-api-contract.ts:30` and `:161`                                                                                                                                                                              | grouped state reads and tx writes are already live                                                                                                |
| Void render contract       | `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:194` and `:229`                                                                                                                                                                    | `renderVoid({ element, target })`; runtime owns block/inline shell and spacer                                                                     |
| Void contract proof        | `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx:401` and `:451`                                                                                                                                                                                  | tests assert no `attributes`, `children`, `selected`, `focused`, or `actions` in void render props                                                |
| Example void shape         | `/Users/zbeyens/git/slate-v2/site/examples/ts/images.tsx:50` and `:122`                                                                                                                                                                                                      | image example uses `renderVoid` and opt-in `useEditorFocused()` / `useElementSelected(target)` inside visible content                             |
| React callbacks            | `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate.tsx:38` and `:129`                                                                                                                                                                                    | `onChange(value, change)` fires every commit; `onValueChange` and `onSelectionChange` are filtered callbacks                                      |
| Editable events            | `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx:81`                                                                                                                                                                                            | `onKeyDown` exists; `onKeyCommand` does not                                                                                                       |
| Hooks                      | `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-node-selector.tsx:108`, `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-decoration-selector.tsx:42`, `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-element-selected.ts:10` | current names are selector-first, options-last; no `useElementFocused`, no `useDecorationSource`                                                  |
| Tags                       | `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:593`, `/Users/zbeyens/git/slate-v2/packages/slate/test/commit-metadata-contract.ts:24`, `/Users/zbeyens/git/slate-v2/packages/slate/test/migration-backbone-contract.ts:147`                            | update option is singular `tag?: string                                                                                                           | string[]`; commits store `tags` |
| DOM host capability        | `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/with-dom.ts:37`, `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:51`, `/Users/zbeyens/git/slate-v2/packages/slate-react/src/plugin/react-editor.ts:8`                                    | `withDOM` adds `editor.dom`; `DOMEditor.*` / `ReactEditor.*` remain host/friend namespaces                                                        |

Verification during this pass:

- `bun test ./packages/slate/test/public-surface-contract.ts` passes in
  `/Users/zbeyens/git/slate-v2`.
- `bun -e "import * as Slate from './packages/slate/src/index.ts'; ..."`
  shows root exports include `createEditor`, `defineEditorExtension`,
  `registerCommand`, and `executeCommand`, but not root `Editor`.

### 24.2 Corrected Decision List And Shapes

|   # | Decision                                                                     | Current shape                                                                                                                                                  | Target shape                                                                                                                                                              |
| --: | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Keep `editor.read` / `editor.update` as public law.                          | `BaseEditor` exposes `read`, `update`, `subscribe`, `extend`; state/tx groups are proven by tests.                                                             | No new write/read namespace. App code reads via `editor.read((state) => state.selection.get())`; writes via `editor.update((tx) => tx.nodes.set(...))`.                   |
|   2 | Keep `editor.subscribe` public but advanced.                                 | `subscribe` is part of current `BaseEditor` and provider wiring.                                                                                               | Do not remove it in this plan. Do not use it as hot React authoring API when a source or node selector exists.                                                            |
|   3 | Keep extension `state` / `tx` / `editor` groups.                             | Declarative groups already exist and are type-tested.                                                                                                          | This remains the plugin backbone. Plate can compile richer plugin APIs to these groups.                                                                                   |
|   4 | Hard-cut public extension commands.                                          | `EditorExtension.commands?: readonly EditorExtensionCommand[]` still exists.                                                                                   | Remove the field from public extension input. Commands belong either in product layers above Slate or internal runtime policy below Slate public API.                     |
|   5 | Hard-cut root command exports.                                               | Root source currently exposes `registerCommand` and `executeCommand`.                                                                                          | Move command registry helpers out of root public exports. Keep them only in `slate/internal` friend API or deeper internal modules for first-party runtime policy.        |
|   6 | Revise `setup(ctx)` from accepted API to deferred lifecycle target.          | No `setup`, no `config`, no `conflictsWith`, no `ctx.onSelectionChange` helpers exist.                                                                         | First design source partitions. Add `setup(ctx)` only if it is narrow lifecycle glue for source subscriptions/cleanup and does not duplicate `state`/`tx`/`editor` slots. |
|   7 | Keep runtime-owned void/atom shell as already done.                          | `renderVoid({ element, target })`; runtime owns shell/spacer/hidden anchor.                                                                                    | Guard with docs/tests/browser contracts. Do not write a migration plan from `{attributes, children}` void renderers because that is no longer the live shape.             |
|   8 | Keep selected/focused as opt-in hooks, not eager void props.                 | `renderVoid` receives no `selected` or `focused`; image example opts into `useEditorFocused()` and `useElementSelected(target)`.                               | Keep this shape. Add no eager selected/focused props to void renderers.                                                                                                   |
|   9 | Keep React callback names as live Slate DX.                                  | `<Slate onChange(value, change)>`, `onValueChange`, `onSelectionChange`; no `onSnapshotChange`.                                                                | Keep `onChange` as every-commit callback with `change.valueChanged` / `change.selectionChanged`; keep filtered callbacks for ergonomics.                                  |
|  10 | Keep `onKeyDown`; drop stale `onKeyCommand` discussion.                      | `<Editable onKeyDown>` exists; `onKeyCommand` does not.                                                                                                        | No public key-command API in raw Slate unless a later model-command plan proves it.                                                                                       |
|  11 | Fix hook targets to live names and order.                                    | `useNodeSelector(selector, equalityFn?, options?)`, `useTextSelector(...)`, `useDecorationSelector(...)`, `useElementSelected(target?)`, `useEditorFocused()`. | Keep current names. Do not invent `useElementFocused` or `useDecorationSource`; do not flip runtime id to first positional argument.                                      |
|  12 | Keep update option name `tag`, commit field `tags`.                          | `editor.update(fn, { tag: 'remote-import' })`; commits expose `tags`.                                                                                          | Type or document a core tag vocabulary, but do not rename the option to `tags` unless a separate API pass proves the tradeoff.                                            |
|  13 | Keep `Editor` static API out of root public API, but acknowledge friend API. | Root `slate` does not export `Editor`; `slate/internal` exports it for first-party packages.                                                                   | Do not document `Editor.*` for app authors. Keep friend API only as long as `slate-dom` / `slate-react` need cross-package runtime access.                                |
|  14 | Keep DOM/React host helpers off root editor core, but keep host capability.  | `withDOM` adds `editor.dom`; `DOMEditor.*` and `ReactEditor.*` exist as host namespaces.                                                                       | Do not move DOM helpers onto raw core. A future Slate DOM pass may refine `editor.dom` vs namespace duplication, but this Lexical pass should not churn it.               |
|  15 | Keep NodeState-like attr helpers deferred.                                   | Slate model is plain JSON attrs plus operations/commits.                                                                                                       | Defer typed attr helpers until operation replay, undo/redo, copy/paste serialization, and collab substrate proof exist.                                                   |
|  16 | Keep normalization scheduler as internal target.                             | Dirty runtime ids and operation dirtiness already exist; no public Lexical transform API.                                                                      | Improve scheduling below normalization/rendering. Do not expose Lexical-style node transforms as public authoring API.                                                    |

### 24.3 Dropped Or Revised Prior Decisions

Dropped:

- `useElementFocused(runtimeId?)` as a public hook target.
- `useDecorationSource(sourceId, selector, options?)`.
- `useNodeSelector(runtimeId, selector, options?)` and
  `useTextSelector(runtimeId, selector, options?)` argument order.
- `ctx.onTextChange`, `ctx.onNodeChange`, `ctx.onDecorationChange`,
  `ctx.onRootChange`, and `ctx.onFocusChange` as claimed current/final helper
  names.
- treating void renderer migration from `{ attributes, children }` as remaining
  implementation work.
- treating `onSnapshotChange` or `onKeyCommand` as live public API problems.

Revised:

- `setup(ctx)` is no longer an immediate closure target. It is a possible
  extension-lifecycle follow-up after source partitions are designed.
- `editor.subscribe` is no longer described as internal-only. It is public
  low-level API today and should be treated as advanced, not normal hot-path
  React authoring.
- command middleware is not truly package-private while root exports leak
  `registerCommand` and `executeCommand`. The corrected hard cut is root export
  cleanup plus friend/internal boundary tests.

Kept:

- read/update lifecycle
- state/tx/editor extension groups
- content-only void rendering
- opt-in selected/focused hooks
- runtime-owned void/atom shell policy
- tags as commit metadata
- normalization scheduler as internal architecture
- NodeState deferment

## 25. Implementation Slice 1: Command Hard Cut

Status: complete.

Owner:

- `/Users/zbeyens/git/slate-v2/packages/slate` public command surface.

Changes:

- Removed `EditorExtension.commands` from the public extension type in
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts`.
- Removed `extension.commands` registration from
  `/Users/zbeyens/git/slate-v2/packages/slate/src/core/editor-extension.ts`.
- Removed `export * from './command-registry'` from
  `/Users/zbeyens/git/slate-v2/packages/slate/src/core/index.ts`.
- Kept command middleware available through `slate/internal` by exporting
  `executeCommand` and `registerCommand` from
  `/Users/zbeyens/git/slate-v2/packages/slate/src/internal/index.ts`.
- Moved first-party `slate-history` command usage to `slate/internal` in
  `/Users/zbeyens/git/slate-v2/packages/slate-history/src/with-history.ts`.
- Added public-surface proof that root `slate` does not expose
  `registerCommand` or `executeCommand` in
  `/Users/zbeyens/git/slate-v2/packages/slate/test/public-surface-contract.ts`.
- Added type-level proof that `defineEditorExtension(...)` rejects `commands`
  in
  `/Users/zbeyens/git/slate-v2/packages/slate/test/generic-extension-namespace-contract.ts`.

Verification:

- `bun test ./packages/slate/test/public-surface-contract.ts` passed.
- `bun run typecheck` passed in `/Users/zbeyens/git/slate-v2/packages/slate`.
- `bun test ./packages/slate/test/transaction-contract.ts` passed.
- `bun check` passed in `/Users/zbeyens/git/slate-v2`.

Next owner:

- Source/listener partition design, before any broad extension lifecycle helper.

## 26. Whole-API External-Editor Research Pass

Status: complete.

Trigger:

- The user asked for a deeper now-or-never review of the whole rewrite API, not
  only the Lexical command/API cut.

Scope:

- Live `/Users/zbeyens/git/slate-v2` API/source/tests.
- Local Lexical, ProseMirror, and Tiptap source.
- Compiled Milkdown and Obsidian/CodeMirror research where useful for package,
  extension, and proof-boundary pressure.

### 26.1 Harsh Verdict

The rewrite API is mostly pointed at the right spine. Do not panic-pivot to
another editor model now.

The good spine is:

```txt
small editor instance
read/update lifecycle
transaction-owned writes
extension state/tx/editor groups
runtime-owned DOM and void shell policy
React as projection layer
generated browser/stress proof for risky browser behavior
```

The weak spots are not more public methods. The weak spots are underneath:

1. Source/listener partitions are still not first-class enough.
2. ProseMirror-grade DOM-selection ownership and bookmark pressure is underused
   in the plan.
3. Canonical tags are stringly typed.
4. Some public-proof tests still seed through internal `Editor.replace`, which
   muddies the story even when the root public API is clean.
5. Extension lifecycle sugar is tempting, but adding `setup(ctx)` before source
   partitions would be backwards. That would create a nice-looking dumping
   ground.

Blunt call: the rewrite should steal less from Tiptap's public command UX and
more from ProseMirror's boring, brutal transaction and DOM discipline. That is
where editor engines live or die.

### 26.2 Live Slate v2 Current State

| Surface                      | Current owner                                                                                                                                                                      | Current read                                                                                                                                                                 | Plan call                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------- |
| Editor instance API          | `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:390` and `/Users/zbeyens/git/slate-v2/packages/slate/test/public-surface-contract.ts:132`                     | public instance methods are `read`, `update`, `subscribe`, `extend`                                                                                                          | keep                                                |
| Extension shape              | `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:736` and `/Users/zbeyens/git/slate-v2/packages/slate/src/core/editor-extension.ts:132`                        | extension slots are `capabilities`, `commitListeners`, `dependencies`, `editor`, `elements`, `normalizers`, `operationMiddlewares`, `state`, `tx`; no public `commands` slot | already done                                        |
| Command public hard cut      | `/Users/zbeyens/git/slate-v2/packages/slate/test/public-surface-contract.ts:205` and `/Users/zbeyens/git/slate-v2/packages/slate/test/generic-extension-namespace-contract.ts:130` | root `slate` does not expose `registerCommand` / `executeCommand`; extension `commands` is a type error                                                                      | already done                                        |
| Transaction document replace | `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:933` and `/Users/zbeyens/git/slate-v2/packages/slate/test/state-tx-public-api-contract.ts:242`                | `tx.value.replace(...)` exists and is tested                                                                                                                                 | already done; cleanup docs/tests only               |
| Schema/spec predicates       | `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:795` and `/Users/zbeyens/git/slate-v2/packages/slate/test/schema-contract.ts:7`                               | `state.schema` and `tx.schema` expose spec-backed predicates                                                                                                                 | already done; keep                                  |
| Tags                         | `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:593` and `:780`                                                                                               | update option is `tag?: string                                                                                                                                               | string[]`; commits expose `tags: readonly string[]` | keep name; add typed vocabulary |
| Editor selectors             | `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:110` and `:146`                                                                                | `useEditorState` wraps `editor.read`, but selector fanout still starts from one broad context listener set                                                                   | revise below                                        |
| Projection store             | `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts:297` and `:454`                                                                                          | projection stores have runtime/source subscribers and dirtiness checks, but root refresh still subscribes through broad `editor.subscribe` at `:398`                         | next P0                                             |
| Stress proof                 | `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:78`, `:680`, `:915`, `:964`, `:1001`                                                                      | stress families cover paste, voids, overlays, mouse toolbar, and IME repair                                                                                                  | keep and expand per new source partitions           |

### 26.3 External Evidence Ledger

| Corpus                | Evidence read                                                                                                                                                                           | Strongest thing to steal                                                                                                                     | Thing to reject                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Lexical               | `LexicalEditor.ts:862-917`, `:950-994`, `LexicalUpdateTags.ts:17-90`, `LexicalUpdates.ts:595-708`                                                                                       | partitioned update/decorator/text/root listeners, typed update tag vocabulary, dirty leaves/elements, listener trigger order after reconcile | public command dispatch as app mutation, class-node model, `$` helper culture                                     |
| ProseMirror           | `state/src/transaction.ts:22-42`, `:67-77`, `:185-195`; `state/src/selection.ts:173-203`; `view/src/selection.ts:55-101`; `view/src/index.ts:153-223`; `view/src/decoration.ts:105-140` | transaction metadata, selection mapping through steps, bookmarks, centralized DOM selection import/export, mapped decorations                | integer positions as app API, schema-first identity, plugin ceremony as normal Slate authoring                    |
| Tiptap                | `CommandManager.ts:28-110`; `Extendable.ts:66-130`, `:142-214`, `:382-424`; `useEditorState.ts:13-27`, `:157-168`; `ReactNodeViewRenderer.tsx:20-52`, `:78-99`, `:197-240`              | extension packaging, option/storage/shortcut/input/paste/plugin registration, selector hook ergonomics, product UI evidence                  | required `chain().focus().run()` ceremony, React NodeView wrapper/contentDOM handoff as normal raw Slate renderer |
| Milkdown              | `docs/research/sources/milkdown/docs-and-package-surface-map.md`, `behavior-test-lanes.md`                                                                                              | docs map package ownership, tests prove behavior; useful executable cross-check for markdown and shortcut surfaces                           | using docs alone as behavior proof                                                                                |
| Obsidian / CodeMirror | `docs/research/sources/obsidian/developer-editor-extension-surface.md`                                                                                                                  | split edit-mode editor extensions from reading-view post processors                                                                          | mixing reading-view customization into the raw editing runtime                                                    |

### 26.4 Updated Steal / Reject / Defer Map

Steal now:

- Lexical listener categories, but as Slate source partitions rather than root
  `editor.onSelection` method sprawl.
- Lexical update-tag vocabulary shape: typed common tags plus custom string
  escape hatch.
- Lexical dirty-leaf/dirty-element discipline, translated to Slate runtime ids,
  dirty paths, and commit dirtiness.
- ProseMirror transaction metadata discipline. Slate already has commit tags and
  operation classes; use them harder before inventing more callback APIs.
- ProseMirror bookmark semantics. Slate v2 has bookmark contracts; the plan
  should pressure them against history, collab replay, overlays, and DOM repair.
- ProseMirror DOM-selection ownership. One owner imports/exports DOM selection;
  app renderers never get to improvise selection plumbing.
- Tiptap package ergonomics: options, storage, shortcuts, paste/input rules,
  nested feature packages, and docs that make extension authors fast.
- Tiptap selector posture, but go beyond it with dirty commit facts instead of
  only broad transaction counters.
- Milkdown's proof posture: executable behavior lanes beat docs claims.
- Obsidian/CodeMirror's split between editing extensions and reading-view post
  processing.

Reject now:

- Public `editor.commands`, `editor.dispatchCommand`, or `chain().focus().run()`
  as raw Slate's main mutation story.
- Public Lexical class-node subclasses as Slate's node model.
- Tiptap React NodeViews as the default raw Slate renderer contract.
- ProseMirror's integer-position model and plugin world as normal app-facing
  Slate API.
- "Add `setup(ctx)` now" as lifecycle progress. Without source partitions, it is
  just a prettier junk drawer.

Defer:

- NodeState-like typed attrs. Keep the idea, but only after operation replay,
  undo/redo, copy/paste serialization, and Yjs proof say it does not hide state.
- Optional command sugar above raw Slate. This likely belongs in Plate or feature
  kits, not `packages/slate`.
- Full extension lifecycle helpers. Design source partitions first, then add the
  narrow cleanup/config/dependency API that remains.
- EditContext. Track it, but do not let a future platform primitive delay current
  DOM/selection contracts.

### 26.5 Decision Deltas

Changed:

- Section 26 reopened the plan from `done` to `pending` because the broader
  review found runnable architecture work. Section 27 later closed that work.
- Source/listener partition design became the next P0 and is now recorded in
  section 27.
- ProseMirror DOM-selection/bookmark pressure became a named closure topic, not
  background inspiration.
- `tx.value.replace` moved from target to already-done evidence.
- Schema/spec predicates moved from target to already-done evidence.
- Command hard cut moved from implementation target to completed slice.

Kept:

- `editor.read((state) => ...)` and `editor.update((tx) => ...)`.
- Small public editor instance.
- Extension `state` / `tx` / `editor` groups.
- Runtime-owned void/atom shell policy.
- Tags as update options and commit metadata.
- Advanced low-level `editor.subscribe`, but not as the hot React authoring path.

New hard rule:

- Do not add lifecycle sugar until source partitions exist and have proof rows.

### 26.6 Revised Scorecard

| Dimension                                | Score | Evidence                                                                                                                                                                                                                                                                    |
| ---------------------------------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance           |  0.89 | Slate has `useEditorState` and projection-store runtime/source subscribers, but `projection-store.ts:398` and `use-editor-selector.tsx:146` still show broad upstream subscription/fanout. Lexical dirty lanes and ProseMirror child-view discipline keep pressure on this. |
| Slate-close unopinionated DX             |  0.91 | `BaseEditor` is still tiny; command public leakage is cut; extension groups are typed and scoped. Tiptap command/chain UX is explicitly rejected for raw Slate.                                                                                                             |
| Plate/slate-yjs migration backbone       |  0.88 | State/tx/editor groups, tags, operations, schema specs, and commit metadata are strong. Source partitions and canonical tags remain unfinished substrate for collab/product packages.                                                                                       |
| Regression-proof testing strategy        |  0.88 | API contracts and stress families exist for public surface, schema, tx replace, paste, voids, overlays, toolbar selection, and IME repair. New source partitions need fresh render/recompute proof rows.                                                                    |
| Research evidence completeness           |  0.90 | Live Slate source plus local Lexical/ProseMirror/Tiptap source were read; Milkdown and Obsidian/CodeMirror compiled evidence were used for package/proof boundaries. Premirror/EditContext remain tracked rather than decisive for this API pass.                           |
| shadcn-style composability/minimal hooks |  0.87 | Tiptap product UI and shadcn posture reinforce that Plate owns UI kits; raw Slate keeps hooks minimal. The plan still needs a sharper doc story for product commands living above Slate.                                                                                    |

Weighted score: `0.89`.

Why not `0.92` anymore:

- The broader request exposed real next work.
- The plan was too Lexical-centered.
- Source partitions are not finished enough to bless extension lifecycle sugar.
- ProseMirror DOM/bookmark discipline deserves a direct pressure pass.

### 26.7 Implementation-Lens Notes

`vercel-react-best-practices`: applied.

- Finding: split subscriptions by source/runtime id before claiming render
  excellence. `useSyncExternalStore` selectors are useful only if upstream
  invalidation is not dumb.
- Delta: next P0 is source/listener partition design.

`performance-oracle`: applied.

- Finding: projection recompute and dirty-id propagation must stay bounded at
  10x/100x/1000x document scale. Metrics in `projection-store.ts` are good;
  they need gates tied to source partitions.
- Delta: add recompute-count and subscriber-wake-count proofs to the next pass.

`tdd`: applied as planning constraint.

- Finding: future implementation slices must be vertical: one public/source
  contract, one implementation, one proof. Do not write dead-code removal tests.
- Delta: source partitions need a red contract for "selection-only update does
  not wake text/source subscribers" before implementation.

`build-web-apps:shadcn`: applied as boundary lens.

- Finding: menus, toolbars, command palettes, bubbles, and floating UI stay in
  Plate/product packages. Raw Slate should expose substrate and hooks, not
  shadcn components.
- Delta: Tiptap UI ergonomics are product-layer evidence, not a core Slate API
  target.

`react-useeffect`: applied.

- Finding: subscriptions to editor/projection stores are real external
  synchronization. Derived state should stay selector-based, not effect-copied.
- Delta: source partitions should prefer external-store selectors and event
  handlers over effect-driven mirroring.

### 26.8 Next Pass

Next pass: `source-listener-partition-design`.

Required answers:

1. What are the source categories?
   - update/commit
   - selection
   - text
   - node/runtime id
   - decoration/projection source
   - root/host DOM
   - focus/editable/composition
2. Which are public, advanced public, React-only, extension-only, or internal?
3. How do projection stores subscribe without broad `editor.subscribe` fanout?
4. What red test proves a selection-only commit does not wake unrelated text,
   decoration, or node subscribers?
5. How do tags and source partitions interact with collab/history/paste/IME?
6. What remains of `setup(ctx)` after the source API exists?

That pass is recorded in section 27, which is the closure pass for this planning
lane.

## 27. Source/Listener Partition, ProseMirror Pressure, And Closure Pass

Status: complete.

Trigger:

- The stop hook found `.tmp/<session-id>/completion-check.md` still `pending`.
- Section 26 correctly left the plan open until source/listener partition design,
  ProseMirror DOM/bookmark pressure, canonical tags, and public-proof cleanup
  were explicit.

### 27.1 Closure Verdict

Close the planning lane now.

The remaining fix is not another public method hunt. The core already publishes
enough commit facts. React/projection code already has narrow local
subscribers. The missing thing is routing: projection, annotation, root, and
future extension lifecycle code should subscribe through a friend/internal
source bus instead of every hot store fanning in through broad
`editor.subscribe`.

Do **not** add public `editor.sources`, `editor.onSelection`, or Tiptap-style
command chains. That is API noise. Keep raw Slate small, make the runtime
smarter, and let Plate/product packages own command palettes, toolbar actions,
menus, and higher-level UI vocabulary.

### 27.2 Live Current State

| Surface               | Current owner                                                                                                                                                                                                                                                                                                                                                               | Current shape                                                                                                                                                                                                | Closure call                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| Commit metadata       | `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:485`, `:1434`, `:1474`, `:1508`, `:1642`                                                                                                                                                                                                                                                               | commits classify replace/selection/text/structural/mark, compute dirty paths, touched runtime ids, selection impact ids, decoration impact ids, node impact ids, and tags, then notify one root listener set | enough substrate exists; route it better      |
| Public subscribe      | `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:1842`                                                                                                                                                                                                                                                                                                  | one broad `SnapshotListener` set behind public `editor.subscribe`                                                                                                                                            | keep as advanced public low-level             |
| Root selector sources | `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/root-selector-sources.ts:24`, `:31`, `:38`, `:42`                                                                                                                                                                                                                                                            | root/runtime/placeholder/editable wakeups already gate by operation class                                                                                                                                    | keep and move upstream trigger to source bus  |
| Projection store      | `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts:25`, `:84`, `:160`, `:212`, `:398`, `:454`, `:466`                                                                                                                                                                                                                                                | dirtiness classes, runtime subscribers, source subscribers, and metrics exist; the store still receives editor changes through broad `editor.subscribe`                                                      | first implementation target                   |
| Annotation store      | `/Users/zbeyens/git/slate-v2/packages/slate-react/src/annotation-store.ts:516`, `:556`, `:668`, `:711`                                                                                                                                                                                                                                                                      | annotation candidates and runtime listeners exist; selection-only changes are ignored; upstream still uses broad `editor.subscribe`                                                                          | route through annotation/source subscriptions |
| Existing proof        | `/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts:1416`, `/Users/zbeyens/git/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx:465`, `/Users/zbeyens/git/slate-v2/packages/slate-react/test/annotation-store-contract.tsx:185`, `/Users/zbeyens/git/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx:542`, `:618` | selection-only dirtiness, placeholder non-rerender, annotation bookmark rebasing, scoped source recompute, and targeted source refresh are already covered                                                   | keep; add source-bus red tests                |

### 27.3 Source Categories And Visibility

| Source        | Fires from                                                                       | Visibility                                                                                               | Consumers                                                              | Notes                                                                                |
| ------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `commit`      | every committed snapshot change                                                  | advanced public through existing `editor.subscribe`; friend/internal source bus for first-party packages | diagnostics, devtools, rare app-level sync, extension commit listeners | Do not remove `editor.subscribe`. Do not make it the React hot path.                 |
| `selection`   | `change.selectionChanged` or non-empty `selectionImpactRuntimeIds`               | friend/internal and React hooks                                                                          | selected/focused hooks, selection overlays, root selected-island state | Selection-only must not wake text/node/root subscribers by default.                  |
| `text`        | `change.classes.includes('text')`                                                | friend/internal and React/projection                                                                     | leaves, text selectors, text-scoped decorations, spellcheck/search     | Scope by `decorationImpactRuntimeIds` / touched runtime ids.                         |
| `node`        | `change.nodeImpactRuntimeIds` or structural/replace fallback                     | friend/internal and React selectors                                                                      | element renderers, node selectors, void/atom shells                    | Structural/replace may full-fallback; text edits should target impacted runtime ids. |
| `decoration`  | `change.decorationImpactRuntimeIds`, source refresh, or external source id       | friend/internal; public only through decoration-source APIs                                              | projection stores, decoration selectors, search, comments, highlights  | Keep source id and runtime id routing; this is the main React perf win.              |
| `annotation`  | annotation source refresh or editor change that can rebase tracked bookmarks     | React/product store API                                                                                  | comments, review ranges, sidebars, inline annotation projections       | Backed by bookmarks; ignore pure selection changes.                                  |
| `root`        | top-level runtime id, placeholder, editable-root, structural, or replace changes | React-internal                                                                                           | `<Editable>` root, large-document islands, placeholder                 | Current root selector gates already define the behavior.                             |
| `focus`       | DOM/React focus state                                                            | React/DOM host only                                                                                      | focus hooks, toolbar visibility, selection UX                          | Not raw core document state.                                                         |
| `composition` | IME composition start/update/end                                                 | React/DOM host only, commit tags where needed                                                            | IME guards, DOM repair, input handling                                 | Do not pretend IME is just a document commit.                                        |
| `external`    | explicit refresh or product source invalidation                                  | friend/internal plus product store APIs                                                                  | async decorations, annotations, search, spellcheck                     | Should carry `sourceId`; no global wakeup unless requested.                          |

API visibility decision:

- Public normal authoring: `editor.read`, `editor.update`, typed extension
  groups, React hooks.
- Advanced public: current broad `editor.subscribe`.
- Friend/internal: source bus used by `slate-react`, `slate-dom`,
  first-party history/collab/runtime packages, and maybe devtools.
- Product/public React: decoration/annotation source APIs and selectors, not raw
  commit routing knobs.
- Do not add root public `editor.sources` in this plan. If a later lifecycle API
  exposes subscriptions, it should expose narrow `ctx.sources.*` inside
  extension setup, after this bus exists.

### 27.4 Target Shape

Implementation target:

```ts
type EditorCommitSource =
  | "commit"
  | "selection"
  | "text"
  | "node"
  | "decoration"
  | "annotation"
  | "root"
  | "focus"
  | "composition"
  | "external";
```

The exact TypeScript entrypoint can change during implementation, but the
ownership cannot:

- `editor.subscribe(listener)` remains broad and public.
- `slate/internal` or a first-party runtime module owns source-bus routing.
- `slate-react` projection and annotation stores stop directly subscribing to
  broad root updates except through that adapter.
- Runtime/source subscribers receive `SnapshotChange` plus scoped runtime ids
  or `sourceId` where relevant.
- Full fallback is explicit: `replace` / `structural` can notify broad node and
  decoration lanes; selection-only cannot.

### 27.5 ProseMirror Pressure Applied

Steal:

- Transaction metadata discipline: Slate commit `tags`, `classes`,
  `dirtyPaths`, impact runtime ids, and `command` data are the Slate version of
  ProseMirror transaction meta. Use them as routing facts.
- Bookmark pressure: annotation stores already use bookmarks; history, collab,
  paste, IME, overlays, and DOM repair must preserve or intentionally remap
  them through operations.
- DOM-selection ownership: one DOM/React owner imports and exports DOM
  selection. App renderers never get selection plumbing authority.
- Mapped decorations: current projection stores already map ranges into runtime
  buckets; source routing should feed those buckets instead of waking every
  projection source.

Reject:

- Integer positions as app API.
- Plugin ceremony as normal Slate authoring.
- React NodeViews/contentDOM as the default raw Slate render contract.

### 27.6 Tags, History, Collab, Paste, IME

Canonical tag vocabulary:

```ts
export type EditorUpdateTag =
  | "history-push"
  | "history-merge"
  | "historic"
  | "paste"
  | "collaboration"
  | "skip-collab"
  | "skip-dom-selection"
  | "skip-scroll-into-view"
  | "skip-selection-focus"
  | "focus"
  | "composition-start"
  | "composition-end"
  | (string & {});
```

Keep the current option name:

```ts
editor.update(fn, { tag: "paste" });
editor.update(fn, { tag: ["paste", "history-push"] });
```

Interaction rules:

- History reads tags to decide push/merge/historic replay; it should not infer
  history intent from operation shape alone.
- Collab reads `collaboration` / `skip-collab` and operation locality; it should
  not leak remote replay into normal local source wakeups.
- Paste uses `paste` plus normal text/node/decoration lanes; paste is not a
  separate source category unless a host integration needs extra DOM data.
- IME uses DOM/React composition source plus commit tags where a committed
  change needs history/collab/selection policy.
- Selection/focus/scroll tags are policy gates for DOM repair and host behavior,
  not excuses to expose DOM selection as raw core public API.

### 27.7 Public-Proof Cleanup

`Editor.replace` is fine in friend/internal tests. It is not fine as the default
public story.

Rule:

- Public API tests, examples, and docs should seed through `editor.update((tx)
=> tx.value.replace(...))` or a public-facing helper built on that shape.
- Friend/internal tests may keep `Editor.replace` when proving friend API,
  runtime snapshot, history, or low-level commit behavior.
- This cleanup is an implementation/docs task, not a planning blocker.

### 27.8 Red Tests For Implementation

Add tests before or with implementation:

1. Core source bus: selection-only commit invokes `commit` and `selection`, not
   `text`, `node`, `decoration`, or `root`.
2. Text edit invokes `commit`, `text`, and impacted `node` / `decoration`
   runtime buckets only.
3. Structural/replace full fallback invokes `root`, `node`, and `decoration`
   lanes explicitly.
4. Projection store no longer owns broad upstream `editor.subscribe` outside the
   source-bus adapter.
5. Annotation store subscribes through annotation/source routing and keeps the
   existing selection-only and bookmark-rebase behavior.
6. Placeholder/root hook contract still proves selection-only commits do not
   rerender the placeholder source.
7. Targeted source refresh still wakes only the matching `sourceId` and impacted
   runtime bucket.
8. Typed tag contract proves canonical tags autocomplete while custom strings
   remain accepted.
9. DOM-selection/browser contract proves selection repair has one owner during
   paste, IME, void/atom interaction, and overlay updates.

### 27.9 What Remains Of `setup(ctx)`

Almost nothing until the source bus exists.

After the source bus lands, `setup(ctx)` may return as narrow lifecycle glue:

```ts
setup(ctx) {
  return ctx.sources.selection.subscribe(...)
}
```

Rules:

- It may provide cleanup, dependency/config validation, and source
  subscriptions.
- It must not duplicate `state`, `tx`, or `editor` extension groups.
- It must not become a dumping ground for product commands, toolbar actions, or
  UI menus.
- If the source bus makes lifecycle unnecessary for a slice, do not add
  lifecycle sugar just to look like Lexical or Tiptap.

### 27.10 Closure Scorecard

| Dimension                                | Score | Evidence                                                                                                                                       |
| ---------------------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance           |  0.92 | Source categories, routing rules, existing root selector gates, projection metrics, and red tests directly target broad fanout removal.        |
| Slate-close unopinionated DX             |  0.93 | Public authoring stays `read` / `update` plus typed extension groups; public source method sprawl and command chains are rejected.             |
| Plate/slate-yjs migration backbone       |  0.92 | Tags, source categories, operation dirtiness, bookmark pressure, and collab/history interaction are explicit without current-adapter coupling. |
| Regression-proof testing strategy        |  0.92 | Existing narrow tests are cited and the implementation red tests cover source routing, tags, public-proof cleanup, and DOM-selection pressure. |
| Research evidence completeness           |  0.93 | Section 26 external-editor evidence is converted into Slate decisions; section 27 names what is stolen and what is rejected.                   |
| shadcn-style composability/minimal hooks |  0.91 | UI/product commands stay above raw Slate; React hooks and source APIs stay minimal and selector-first.                                         |

Weighted score: `0.92`.

Completion gates:

- total score is at least `0.92`: pass
- no dimension below `0.85`: pass
- no unplanned P0/P1 planning issue: pass
- public API surface has no remaining "maybe" language: pass
- implementation acceptance criteria exist: pass
- pass schedule is complete: pass

Next owner:

- `implementation-source-listener-partitions`, started by a later execution
  skill/run. This slate-ralplan lane should not mutate Slate v2 runtime code.

## 28. Ralph Execution Activation

Status: implementation lane complete.

Started: `2026-04-30T14:51:26Z`.
Closed: `2026-04-30T15:05:55Z`.

Skill owner:

- `.agents/skills/ralph/SKILL.md`
- `.agents/skills/continue/SKILL.md`
- `.agents/skills/tdd/SKILL.md`
- `.agents/skills/learnings-researcher/SKILL.md`
- `.agents/skills/ce-compound/SKILL.md`

Task statement:

- Activate the closed plan and execute `implementation-source-listener-partitions`.

Desired outcome:

- Add a friend/internal source bus in `.tmp/slate-v2/packages/slate`.
- Route projection and annotation stores in `.tmp/slate-v2/packages/slate-react`
  through source-specific editor subscriptions where this slice owns them.
- Prove selection-only commits wake `commit` and `selection`, not unrelated
  `text`, `node`, `decoration`, or `root` subscribers.
- Add ProseMirror-pressure coverage for bookmark remapping and mapped
  runtime-bucket behavior.
- Add canonical typed update tags while preserving custom string tags.

Completed passes:

- `source-bus-implementation-slice`: complete.
- `prosemirror-dom-bookmark-pressure-contracts`: complete.
- `canonical-tag-vocabulary`: complete.
- `ce-compound-closeout`: complete.

Actions taken:

- Added friend/internal `Editor.subscribeSource(...)` in
  `.tmp/slate-v2/packages/slate`.
- Added core source routing so selection-only commits notify `commit` and
  `selection`, not unrelated `text`, `node`, `decoration`, or `root`
  subscribers.
- Routed `.tmp/slate-v2/packages/slate-react/src/projection-store.ts` through
  source-bus subscriptions selected by projection dirtiness.
- Routed `.tmp/slate-v2/packages/slate-react/src/annotation-store.ts` through a
  source-bus `commit` subscription while preserving candidate filtering.
- Added tests that make projection and annotation stores throw if they fall back
  to broad instance `editor.subscribe` fan-in.
- Added mapped projection runtime-bucket proof for structural path moves.
- Added remote-operation replay proof that local bookmark ranges survive and
  rebase.
- Added canonical update tag types plus a custom string escape hatch.
- Captured the implementation learning in
  `docs/solutions/performance-issues/2026-04-30-slate-v2-source-bus-routing-must-prove-upstream-fan-in-and-runtime-bucket-locality-separately.md`.

Changed files:

- `.tmp/slate-v2/packages/slate/src/core/public-state.ts`
- `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`
- `.tmp/slate-v2/packages/slate/test/snapshot-contract.ts`
- `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts`
- `.tmp/slate-v2/packages/slate/test/commit-metadata-contract.ts`
- `.tmp/slate-v2/packages/slate-react/src/projection-store.ts`
- `.tmp/slate-v2/packages/slate-react/src/annotation-store.ts`
- `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`
- `.tmp/slate-v2/packages/slate-react/test/annotation-store-contract.tsx`
- `docs/solutions/performance-issues/2026-04-30-slate-v2-source-bus-routing-must-prove-upstream-fan-in-and-runtime-bucket-locality-separately.md`
- `.tmp/<session-id>/completion-check.md`
- `.tmp/continue.md`

Verification:

- `bun test ./packages/slate/test/snapshot-contract.ts ./packages/slate-react/test/projections-and-selection-contract.tsx ./packages/slate-react/test/annotation-store-contract.tsx`
  passed in `.tmp/slate-v2`.
- `bun test ./packages/slate/test/collab-history-runtime-contract.ts ./packages/slate-react/test/projections-and-selection-contract.tsx ./packages/slate/test/bookmark-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx`
  passed in `.tmp/slate-v2`.
- `bun test ./packages/slate/test/commit-metadata-contract.ts -t "types canonical update tags while preserving custom tags"`
  passed in `.tmp/slate-v2`.
- `bun test ./packages/slate/test/snapshot-contract.ts ./packages/slate/test/collab-history-runtime-contract.ts ./packages/slate/test/commit-metadata-contract.ts ./packages/slate/test/bookmark-contract.ts ./packages/slate-react/test/projections-and-selection-contract.tsx ./packages/slate-react/test/annotation-store-contract.tsx ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx`
  passed in `.tmp/slate-v2`.
- `bun --filter slate typecheck` passed in `.tmp/slate-v2`.
- `bun --filter slate-react typecheck` passed in `.tmp/slate-v2`.
- `bun lint:fix` passed in `.tmp/slate-v2`; after it fixed one file, the final
  touched-contract test set and both package typechecks passed again.
- Fresh closeout after compact recovery:
  `bun test ./packages/slate/test/snapshot-contract.ts ./packages/slate/test/collab-history-runtime-contract.ts ./packages/slate/test/commit-metadata-contract.ts ./packages/slate/test/bookmark-contract.ts ./packages/slate-react/test/projections-and-selection-contract.tsx ./packages/slate-react/test/annotation-store-contract.tsx ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx`
  passed in `.tmp/slate-v2` with 240 tests.
- Fresh closeout after compact recovery: `bun --filter slate typecheck`,
  `bun --filter slate-react typecheck`, and `bun lint:fix` passed in
  `.tmp/slate-v2`; lint reported no fixes.

Rejected tactics:

- No public `editor.sources` API.
- No public lifecycle helper.
- No command-chain or command-map API.
- No claim that source recompute selectivity alone proves subscriber locality.
- No closed tag enum that blocks app-specific metadata.

Completion verdict:

- Execution target met.
- No next autonomous pass remains for this activated lane.
- `.tmp/<session-id>/completion-check.md` can move to `done` after the checkpoint and
  continuation prompt are updated.
