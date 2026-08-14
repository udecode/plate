# Plite Vision

Plite is the raw editor substrate. It must stay unopinionated, precise, and
boring in the best way: document model, canonical changes, runtime, input, DOM,
selection, history, browser proof, package API, and benchmarks.

Root `VISION.md` is the mandatory first read. This file carries the fuller
Plite doctrine after the lane is selected.

## Plite Source Order

1. Active goal plan.
2. Root `VISION.md`, then this file.
3. `docs/plite/agent-start.md`.
4. Relevant `plite-*` source rule under `.agents/rules`.
5. Transplanted Plite package source/tests/benchmarks in this Plate checkout:
   `packages/plite*`, `packages/browser`, `packages/yjs`,
   `apps/plite/tests/plite-browser/**`, and `benchmarks/plite/**`.
6. `docs/plite/**` for accepted claim width.
7. `benchmarks/targets/slate-v2.json` for perf target authority.

Plate repo root commands are the current Plite runtime authority. Do not use a
donor checkout as proof after the transplant.

## Plite Rules

- Preserve Plite's simple document model and canonical `DocumentChange` as the
  sole mutation and commit truth. Transactions construct canonical changes
  directly; React does not define the core ontology.
- Public API should teach `editor.read`, `editor.update`, `state`, `tx`,
  extension groups, commit listeners, and projection sources.
- Plite stays unopinionated. Plate owns product opinion.
- Do not keep legacy APIs alive just because they are familiar.
- Do not make child-count chunking foundational again.
- Plite supplies typed extension identity, composition, publication, and
  inspection. It does not supply a behavior-profile DSL. Plate specs define
  product law; named kits require real reuse, while runtime control is a
  separate proven job.
- `EditorExtension` carries one exact normalized definition. `name` is
  descriptor identity; `type` is serialized node identity. The public factory
  is `define*(name, definition)` with no caller generics. Its private typing may
  infer a small dependency environment beside the author input when TypeScript
  needs that split for contextual callbacks; do not expose it or pretend one
  self-referential generic can infer everything. Reject excess fields and
  preserve the definition through a private invariant witness without leaking
  raw callbacks into declarations. The required positional name is lower camel
  case and human-readable; a different serialized identity belongs in `type`.
- Public roots expose author contracts, not `Any*`, `Internal*`, compiler and
  normalization graphs, accumulators, or witnesses. An unparameterized editor
  exposes only guaranteed Core capabilities; package consumers carry concrete
  editor or extension generics. Plite's public runtime type is `Editor`;
  `BaseEditor` and `PlateEditor` belong to Plate.
- Root `EditorExtensionDependencyReference` is a shallow, non-generic identity
  value with `name` and optional `enabled`. `EditorExtensionTypeProvider` is the
  sole public value-sensitive capability bridge. Its higher-kinded encoding,
  normalized installed-capability carrier, and transitive dependency expansion
  are internal-only; they do not recursively materialize exact dependency
  ancestry.
- Schema is the sole first-party AST-shape truth. Plite derives exact root,
  child, text/property, default/requiredness, named-root, recursive, and
  open-world value types; Plate lowers its installed plugin graph into that
  compiler once. Normal Plate code uses `PlateEditor<typeof Kit>` and the
  existing `ValueOf`/`ElementOf`/`TextOf` extractors, never a parallel value
  generic or central node map. Raw schema-less Plite may still own an explicit
  `createEditor<ExternalValue>` generic. Feature aliases may name an inferred
  owner result but never restate schema fields. Property-only plugins do not
  become element identity handles; Plate may project their compiled property
  capabilities onto broad elements or text while preserving aliases, prefixes,
  defaults, and exact value domains from Plite descriptors.
- Static portals require a unique literal name and mutually assignable
  descriptor/installed capabilities. Runtime portals require exact installed
  descriptor identity, so a same-name object is not an interchangeable token.
- React context retrieval is non-generic. `useEditor()` returns the mounted
  React editor contract, and selector hooks infer only their selected result.
  Exact extension capabilities come from `editor.extension(Extension)`. Keep
  editor generics only on constructors or hooks whose typed input actually
  correlates with the result.
- Low-level React composition receives the actual DOM dependency as
  `react({ dom })`. Its implementation may erase exactly one invariant-union
  boundary when TypeScript 7 cannot reduce it; the public call stays one exact
  object with no caller generics.
- `DefinitionOf<typeof FooExtension>` is the sole public definition extractor;
  name the alias `FooDefinition`, never `FooConfig`. True domain/runtime
  config types remain valid.
- Layering beats feature buckets: document truth, DOM transport, React runtime,
  browser proof, projections/services, layout, lightweight surfaces, and
  productization need clear owners.
- Page layout is not core editor truth. Pagination, deterministic measurement,
  occlusion, and scroll stability live above document semantics; active caret,
  selection, and composition stay on the native/browser editing path.

## Plite API Direction

- Plite uses `editor.read(fn)`, direct `editor.update.group.method(...)`,
  configured `editor.update(policy).group.method(...)`, and atomic
  `editor.update(policy?, fn)` as the public lifecycle.
- Extensions install through `editor.install(...)`; DOM/React views use
  `createEditorView(editor, options)`. Do not expose an editor runtime wrapper
  or `editor.extend(...)`. Keep root standalone utilities to truly
  editor-independent value operations such as `NodeApi`, `PathApi`, and
  `isEditor`.
- `state` is the normal read view; `tx` is the normal write view and can read
  transaction-local state.
- Extension-owned factories are `read` and `update`; the compiler projects
  their methods under `definition.name` onto the read view, active `tx`, and
  direct update surface. Use `txOnly(...)` for controls that require an active
  transaction. Do not restore descriptor `state`/`tx` authoring.
- `EditorExtension` stays flat except for the coherent `on.*` event family.
  Lifecycle and host/DOM observation use prefixless child names; Plate extends
  the same family with names such as `keyDown`, `paste`, `nodeChange`,
  `textChange`, and capture variants instead of adding `handlers`. Pure
  core-read policy composes through descriptor-owned `readMiddleware` over
  `editorReads`; app policy does not earn a special root hook.
- Typed ordered values are extension-point `contributions`, not outputs.
  Extension declarations use explicit low-level nouns: `stateFields`,
  `effectTypes`, `facetProviders`, and `selectionKinds`.
- Extensions have no `config` channel. Immutable construction inputs and
  opaque runtime resources stay in factory closures or honest host owners.
  `validate` checks assembled context without a configuration argument.
  Activation schedules publication-dependent work with `afterPublish`.
- One descriptor-owned `api` projects under `name` to
  `editor.api.<name>` and `editor.extension(Extension).api`. Do not root-merge
  methods or expose `getApi`. `api` is always a factory, even for
  context-free values, and receives one context object.
- Public update policy is semantic and narrow: history behavior plus ordered
  tags. Raw provenance and normalization authority stay internal to runtime and
  adapter owners.
- Public updates are synchronous and cannot nest. Helpers inside an update use
  the active `tx`.
- The primary document root is implicit in public API and docs. Do not expose a
  public `main` root key, config option, or example. Explicit roots are only for
  additional roots.
- Inferred values preserve the primary/named root grammar and every element's
  legal child variants without an arbitrary depth cliff. Canonical output
  requiredness follows runtime defaults; construction input may omit defaulted
  fields. Open or dynamic rules widen only their undecidable branch. Runtime
  schema—not tuple-length types—owns child cardinality.
- Structurally owned editable content stays in normal node `children`.
  Conditional mounting and selection use DOM coverage without changing the
  persisted model. Selection kinds distinguish owner selection from child-text
  focus; that distinction alone does not justify a persisted child wrapper.
  Structural child elements require their own grammar, properties, commands,
  or multiple real semantic regions. Explicit roots require independent
  addressing, lifecycle, sharing, or transaction semantics.
- Primitive editor methods are power/runtime tools, not the final normal
  authoring story.
- `tx.*` is the current public API authority for normal writes. Primitive
  `editor.*` writes may remain internal or advanced bridge tools, but do not
  use them to justify old docs/examples as final DX.
- Unscoped `api` methods are too vague, and `tf` is too Plate-shaped for raw
  Plite core naming. Descriptor APIs remain namespaced by `name`.
- Whole-document replacement should be a transaction write, not public
  `Editor.replace`, `editor.replace`, or `editor.reset` as app-author API.
- Active transactions expose direct named extension groups such as
  `tx.writer.method()`. Plite has no `tx.extension(...)` portal. Plate may layer
  descriptor-aware `tx.plugin(Plugin)` selection without expanding Plite's
  public surface.
- `EditorCommit` is the local runtime fact for history, collaboration, React,
  DOM repair, proof, and subscribers.
- Overlay architecture is split into Decoration, Annotation, and Widget lanes.
- Anchors are live editor-scoped handles created through `editor.anchor` or
  `tx.anchor`. Serialized durable positions are a separate concern; low-level
  refs are runtime machinery.
- `NodeKey` is the sole live descendant identity. Resolve it with
  `editor.key`, coherent `state.key`, or active `tx.key`; resolve back through
  `nodes.path`. It covers elements and text, stays editor-local, and never
  enters schema or serialized data. A foreign editor's key fails closed even
  when public editor IDs or local allocation order match; ownership is private
  and the string representation is opaque. Do not publish runtime-ID aliases
  or a second identity namespace. Pure detached transaction-spec builders may
  consume existing keys but do not allocate them. Keys are unique across one
  editor's roots and may target node operations across roots, while
  `nodes.path(key)` remains scoped to the current editor or view root because a
  `Path` carries no root. Base-editor path inputs always address the main root;
  view path inputs address that view's root.
- Lightweight text problems do not automatically deserve the full editor stack.

## Plite Browser And Behavior Proof

- Browser editing claims require model, DOM, selection/caret where observable,
  focus owner, commit metadata when mutating, legal trace, replayability, and
  follow-up typing.
- Use `@platejs/browser` to the maximum reasonable extent for browser-facing
  proof.
- Route-local Playwright is acceptable for first reproduction only. If the same
  action/assertion appears twice, move it into `@platejs/browser` or record why
  the abstraction would be fake.
- Require screenshots/geometry checks for text movement, blank windows,
  overlap, wrong caret line, wrong margin click, or wrong scroll anchoring.
- Do not claim full selection/navigation coverage from one route row.
- Native mobile, semantic mobile, Playwright mobile viewport, and Appium raw
  device proof are distinct claim classes.

## Plite Runtime Loop

```txt
status -> gap scan -> behavior proof -> missing oracle repair -> visual proof
-> benchmark -> patch one hot lane -> verify -> keep/revert -> log -> reassess
```

- Behavior before perf.
- Visual proof before green visible-UI claims.
- Keep perf packets only when correctness stays green.
- After two or three local fixes around one owner, escalate to deeper owner.
- Fix suspect metrics before code.
- Fix unfair benchmarks before gates.
- Reject packets that improve metrics but weaken selection, typing, copy,
  paste, IME, focus, undo, follow-up input, native find, or scroll/caret
  behavior.
- Escalate to `plite-plan` when the next useful win is API/runtime boundary.
- Each mounted `Editable` owns one bounded DOM phase scheduler. Queued root
  work runs in `model -> DOM read -> DOM/React write -> selection/repair`
  order, coalesces by semantic key, and reports recursive loop-limit hits.
- Browser/OS policy clocks such as composition guard lifetimes and native event
  settling may use timers, but DOM mutation, scroll restoration, focus writes,
  and selection repair re-enter the root scheduler. Standalone internal test
  adapters may create a disposable fallback scheduler.

## Plite Perf And Degraded Modes

- Benchmark target control state: `benchmarks/targets/slate-v2.json`.
- Perf packets need one target id, one primary metric, one correctness command
  or browser proof, `METRIC` output when optimizing, and a keep/discard
  decision.
- If `worst_p95_ms` or a summary hides a hot lane, fix the metric before code.
- Huge-document truth is corridor-first, semantic islands, occlusion,
  projection stores, and fair direct comparison against legacy where claimed.
- DOM-present auto is the safe default direction for huge documents until
  shell/occlusion modes prove browser find, screen reader, native selection,
  copy/paste, IME, mobile, undo/history, and collaboration behavior.
- Degraded modes until native behavior is proved: virtualization, shell
  islands, model-backed selection, staged mounting, hidden DOM.

## Plite Skill Topology

- `maintainer`: public GitHub issue/PR/security queue control plane for the
  merged Plate + Plite repo; routes work to narrower owners and stops at
  authority boundaries.
- `auto`: internal Plate/Plite overnight supervisor and checkpoint cadence; use
  the Plite lane for Plite package/runtime/browser/proof work.
- `autoclosure`: post-merge/current-tree until-clean closure after Plite work is
  already applied.
- `plite-research`: external discovery, OSS/GitHub source synthesis, durable
  research ledgers, and promotion into owners.
- `editor-audit`: exhaustive comparison of selected local editor source trees,
  verified commit tracking, incremental sync, and material change dossiers
  routed to `best-api`, `plite-plan`, or `plate-plan`.
- `resolve-slate-issue`: one public Slate issue coordinated through a local
  Plite repair, Plate PR targeting `next`, verified issue update, and honest
  integration/release state.
- `patch`: sole local Plate/Plite behavior-bug and regression owner; the Plite
  lane provides reproduction, class-level behavior coverage, durable substrate
  repair, architecture pressure, proof, and P2 autoreview without public
  GitHub mutation.
- `best-api`: concrete public API design, review, and P0/P1/P2/P3 debt
  ranking.
- `plite-plan`: substrate architecture, adoption/proof planning, and accepted
  plan execution after the target API is clear.
- `slate-migration`: migration closure and stale API audits.
- `tdd`: missing oracle/test design when the proof itself does not exist.

Do not merge distinct owners into one vague mega-skill. Repair confusing
routing in source rules. Create narrow owners only when evidence shows no clear
owner exists.
