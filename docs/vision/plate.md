# Plate Vision

Plate is the editor framework that ships in apps. It owns plugins, wrappers,
components, kits, app-facing docs, product ergonomics, and opinionated UX built
on top of Plite-first primitives.

Root `VISION.md` is the mandatory first read. This file carries the fuller
Plate doctrine after the lane is selected.

## Direction

Plate started as a way to make Plite-based editors practical to build and
maintain in real products.

The goal: a rich-text editor framework that is composable, production-ready,
and easy to adapt without giving up ownership of your editor, schema, or UI.

Current priorities:

- bug fixes and stability;
- docs, setup reliability, and first-run UX;
- performance on real editor workloads;
- better plugin and component ergonomics;
- better migration from Plite and a clearer Plite boundary;
- serialization, import, and export reliability;
- stronger registry, templates, and docs coverage;
- collaboration, AI, and advanced workflows where they fit cleanly;
- better testing infrastructure and confidence around edge-case editor
  behavior.

## Plate Rules

- Keep Plate core unopinionated enough for framework use. Feature capability
  belongs in its package; product policy belongs in app/registry kits and
  examples.
- A behavior, API, or gate change needs an adoption story. "Cleaner" alone is
  not enough.
- For current Plate features, parity and protocol matter. For deferred
  features, record the owner instead of pretending coverage exists.
- Public docs must be source-backed, current-state only, and readable by humans
  and agents.
- Plugin and feature pages are headless first. UI components are render
  examples unless source proves they own the behavior.
- Never document plugin APIs or transforms the source does not actually ship.

## Plugin And Component Doctrine

- Core stays lean. Keep invariants in their owner, parameters in `options`, and
  product policy app- or kit-owned; proven substitutable capabilities use
  ordinary plugins or packages.
- Plugin authoring keeps one-owner behavior colocated and inferred. Public
  builders, configuration paths, and contribution namespaces each need a
  distinct user job; current assembly machinery is evidence, not doctrine.
- Builder consolidation targets the fewest inference-preserving, semantically
  distinct authoring stages, not the fewest method names. Before merging,
  overloading, renaming, or deleting a builder, prove the surviving path widens
  every affected type accumulator across repeated calls, named groups,
  dependencies, plugin conversion, terminal configuration, root/portal
  projection, and declaration emit. If it only carries a type through, fix the
  owning generic or keep the stage; callback annotations, casts, and `any` are
  not parity.
- Plugin constructors own every independent author contribution: `api`,
  `read`, `selectors`, `update`, `extension`, `codecs`, and ordinary static
  fields and their context callbacks. Codec maps use the constructor callback's context-bound
  `defineCodecs`: one argument for self/product maps, or
  `defineCodecs(TargetPlugin, map)` for a foreign contribution with injected
  targets. This is the one inline codec inference anchor; do not expose direct
  maps, manual targets, or a global helper. Constructor context alone never
  justifies `.extend()`. Use `.extend()` only for an imported/prebuilt
  declaration, a shared factory the constructor cannot access, or a real
  earlier-stage type dependency. Keep `.configure()` terminal and non-widening.
  `createPlatePlugin()` accepts root-level `component`; existing Plate
  descriptors bind it with `.configure({ component })`. Base/static consumers
  bind static components through `BasePlugin.configure({ component })` without
  importing the React plugin layer; Base constructors stay renderer-neutral.
  Do not expose `.withComponent()` or the renderer registry shape.
- Plugin schema is creation-owned. Declare it in the plugin constructor, using
  a schema factory over typed options for authored variability; neither
  `.extend()` nor terminal `.configure()` replaces it. Schema-derived callbacks
  may belong to that plugin or a foreign contributor, and TypeScript cannot
  retroactively re-typecheck either. Preserve unrelated authoring and
  configuration. Values resolved only after configuration, such as a
  configured node type, stay truthfully broad in the author callback and exact
  at runtime.
- Classify behavior before exposing composition: invariants stay in their
  owner, parameters stay in `options`, substitutable capabilities may become
  ordinary plugins, and product policy stays app- or kit-owned.
- A public capability plugin needs a real omission/replacement job or a hard
  ownership boundary, valid fallback semantics, closed dependencies, and
  independent proof. Protocol rows, handlers, and extension blocks do not map
  one-to-one to plugins.
- Plugin identity does not force another file. Keep one-owner descriptors
  colocated. Public packages export individual capability descriptors;
  inseparable multi-plugin structure uses an honest owner with
  `dependencies`. App and registry source own named plugin-array kits after
  real reuse; package-local tuples stay private implementation details. A
  package grouping array is still the wrong owner even when it replaces a fake
  grouping plugin or saves repeated imports.
- Plugin relationships stay singular and truthful: required structure or
  capability uses transitive `dependencies`. Optional capabilities are
  ordinary plugins included by the consumer; an enhancement may depend on its
  host, but the host does not bundle the enhancement. Pure grouping, defaults,
  and product policy use app/registry-owned readonly arrays. Do not add an
  optional-child field or `{ optional: Plugin }` wrapper; omission from the
  consumer array already expresses optionality.
- Base and live consumers do not automatically justify parallel kits. Share
  one runtime-neutral app/registry policy kit when its descriptors, options,
  and behavior are identical; each consuming preset composes its own static,
  React, native, or other renderer-specific peer kits. Split only the owner
  whose renderer or platform behavior genuinely differs.
- Configure a target descriptor directly only when the caller owns that
  target's membership in the final composition. Import access alone does not
  establish membership ownership. A complete same-key descriptor customizes an
  installed dependency or framework default. Required dependencies cannot be
  disabled, and two enabled descriptors still conflict. Optional product
  membership changes in the owning app/registry array, not through a disabled
  tombstone.
- A plugin that does not own another capability's membership in the consumer's
  final composition may use `override.plugins[KEY]` as a weak peer: adapt only
  an already-installed target, no-op when absent, never install or mutate
  topology, never disable a required dependency, and yield to the target's
  terminal configuration. This applies even when the adapting plugin can
  import the target. An independently optional plugin or kit must not install
  another independently optional peer merely to adapt it. Prove adapting-only,
  target-only, both, and both with explicit target configuration. Bare-key use
  is intentionally erased; exact target-option inference requires importing
  the descriptor or config type. Keep component replacement and typed
  root-level `component` binding and typed foreign codec contributions authored
  as `defineCodecs(TargetPlugin, map)` inside the owning declaration callback
  as distinct paths. The
  codec helper injects the target. Do not add a central key registry, ancestor
  reach-through methods, recursive child registries, or add/replace verbs.
- Resolve peer conflicts at the smallest behavior surface. Remove or replace
  one conflicting shortcut, handler, parser, or render contribution instead of
  disabling its whole plugin. Required dependencies cannot be disabled, and
  one conflicting member does not become a public plugin without independently
  passing the capability-promotion bar.
- A concrete inferred editor exposes every non-empty plugin API through
  `editor.api.<pluginKey>` for complete autocomplete and agent discovery.
  Generic package code may use `editor.plugin(Plugin).api`; both paths expose
  the same immutable plugin-owned API. Keep plugin keys human-readable and
  split serialized node `type` when needed. Do not duplicate implementations
  through root editor extensions, add API-key aliases, or move mutations
  outside `editor.update`.
- Generic code that accepts an optional descriptor checks
  `editor.plugin(Plugin).installed` before using that portal. Disabled plugins
  count as absent. Do not infer plugin availability from root `editor.api`,
  node types, schema properties, caches, or caught access errors.
- Keep operation hooks flat when their parent namespace already fixes format
  and flow. `parsers.html` directly owns `query`, `transformData`, and
  `transformFragment`; an `ingress`/`egress` bucket needs a distinct
  independently consumed lifecycle.
- Multiple callers of one plugin operation reuse its plugin-owned API; they do
  not justify a parallel raw helper. Keep the algorithm in the plugin.
  Standalone functions need a real cross-plugin, cross-layer, or
  transaction-composition job that one plugin cannot own honestly.
- Express intra-plugin capability dependencies through ordered builder stages.
  The constructor publishes the smallest honest `api`, `read`, or `update`
  capability whenever possible; later stages and required dependents consume the
  accumulated inferred surface. New scoped methods take domain inputs instead
  of threading `editor`, `api`, `read`, `tx`, resolved plugin option values, or
  resolved plugin types through helper signatures; operation options remain
  valid domain input. A later update stage reuses an earlier mutation through
  the active `tx[plugin.key]` group, never a portal one-shot that opens another
  transaction. Do not publish a private implementation fragment merely to
  share it between stages: keep it lexical/private, coalesce stages, or name a
  builder gap. Keep an explicit active-state boundary only when uncommitted
  transaction semantics require it, and prove that case rather than falling
  back to stale `editor.read`.
- React files follow durable families rather than individual symbols or
  implementation kinds. Keep a component family in one `<Family>.tsx` file,
  including its family-only hooks, store, state, controller, lifecycle,
  subcomponents, and public primitives. Exporting or documenting those symbols,
  or importing them from an app wrapper that composes the same family, proves
  public access rather than independent source ownership. Create a
  `use<Family>.ts`, provider, or store file only when it has a standalone job
  meaningful and independently consumed beyond that component family. Sibling
  composition inside one family is not reuse evidence for more files.
- Keep feature-package React roots flat by default. A nested component/hook
  directory earns its keep only as a real public subsystem with multiple
  cross-family owners, not as taxonomy or a response to file size.
- Treat each independently installable registry item as a source-distribution
  owner. Keep its copied UI self-contained. Short repeated presentation JSX is
  cheaper than another shared registry file/dependency; extract only for an
  independently useful registry item or real behavior owner.
- Registry surfaces dedicated to `*-classic`, including `list-classic`, are
  maintenance-only pending deprecation. Do not add parity work, new variants,
  shared abstractions, polish, demos, adoption, or API investment. Touch them
  only for a user-facing regression, security or release blocker, or an
  explicitly authorized deprecation/removal. New work targets the modern
  registry surface; planned deprecation alone does not authorize deletion.
- Preferred extension path is npm package distribution plus local app
  composition and registry usage for development.
- If you build a plugin or component pack, host and maintain it in your own
  repository.
- The bar for adding optional capability to core is intentionally high.
- New app-specific components should usually live in your own app or registry,
  not in core by default.
- Core UI additions should be rare and require broad demand, clear reuse, or a
  real API reason.

## Public API And Plugin Doctrine

- If work touches a reusable public/editor-platform API, use root `VISION.md`
  and this file first, then use `best-api` to choose or review the call shape.
- If work touches runtime/service-boundary architecture, use root `VISION.md`
  and this file first.
- If work is ambiguous between reusable API design and implementation, route
  API shape to `best-api`; route adoption and implementation to the layer
  owner after the target is clear.
- If the public pattern is settled and the task is plugin execution, hand off
  to `plate-plugin-creator`.
- App-local convenience, one-off demos, and package-local mechanics do not need
  doctrine unless they create a reusable public pattern.
- Every lane that introduces or materially changes a reusable public API,
  runtime boundary, builder/factory pattern, or extension contract must include
  root/detail vision updated or reaffirmed evidence.

Owner map:

| Concern                                              | Owner                                   |
| ---------------------------------------------------- | --------------------------------------- |
| public GitHub issue/PR/security queue control plane  | `maintainer`                            |
| internal Plate/Plite long quality loops              | `auto`                                  |
| post-merge/current-tree until-clean closure          | `autoclosure`                           |
| reusable architecture doctrine                       | root `VISION.md` and `docs/vision/*.md` |
| durable public API doctrine                          | root `VISION.md` and `docs/vision/*.md` |
| concrete public API design, review, and debt ranking | `best-api`                              |
| Plate API adoption, rollout, and proof plan          | `plate-plan`                            |
| runtime/service-boundary patterns                    | root `VISION.md` and `docs/vision/*.md` |
| layering / ownership law                             | root `VISION.md` and `docs/vision/*.md` |
| performance/scalability law                          | root `VISION.md` and `docs/vision/*.md` |
| anti-pattern catalog                                 | root `VISION.md` and `docs/vision/*.md` |
| plugin file placement / wrappers / typing mechanics  | `plate-plugin-creator`                  |
| plugin authoring execution flow                      | `plate-plugin-creator`                  |
| app-local sugar                                      | local app/kits                          |
| public docs shape                                    | `docs-creator`                          |
| UI/component registry shape                          | `plate-ui`                              |

## Matcher Extraction Heuristic

When scanning a reusable API family, aggressively inspect repeated `resolve()`
and `apply()` bodies before inventing more package-level wrappers.

Pull into core when repeated logic is mostly trigger gating, collapsed-selection
gating, block-start / text-before lookup, delimiter / prefix / regex matching,
range or payload construction, or other feature-agnostic editor-state
inspection.

Keep local when repeated logic is mostly node creation, mark toggling, list
transforms, link validation or insertion, equation insertion, code-block
insertion, or any semantic transform owned by a feature package.

Core owns matcher primitives and shared input-state access. Feature packages
own semantic apply behavior.

## Plite Boundary

Plate is built on top of Plite.

Migration from Plite to Plate should be straightforward, and Plate can
re-export Plite surface where it improves DX. But Plate is not a dumping ground
for bugs that reproduce in plain Plite. If the same issue happens in plain
Plite without Plate-specific code, it belongs there.

When Plate API names or runtime habits conflict with Plite, Plite wins.
Break Plate instead of bending Plite or hiding the conflict behind aliases.
If a Plate public API collides with Plite runtime names such as `api`,
`getApi`, `state`, or `tx`, cut or rename the Plate API.

## Security

Security in Plate is about explicit trust boundaries and sane defaults. Plate
is a framework, not a hosted service.

Keep risky paths obvious and operator-controlled:

- HTML and markdown parsing;
- import/export boundaries;
- uploads and embedded content;
- server/client boundaries;
- untrusted content and app-specific integrations.

Use safe defaults where possible. Do not add convenience abstractions that hide
where trust decisions are actually made.

## AI

AI support stays optional, composable, and plugin-first. Core editor APIs
should not contort around provider churn or hype-cycle abstractions.

## Setup

Plate is code-first by design. Users should see plugin config, editor schema,
serialization boundaries, and component ownership up front.

Improve onboarding through templates, docs, CLI, and registry flows. Do not add
convenience wrappers that hide critical editor decisions from users.

## What We Will Not Merge For Now

- Refactor-only PRs with no concrete user, API, or docs value.
- Fixes for bugs that reproduce in plain Plite without Plate-specific code.
- Public PRs that change user-visible behavior without real behavior proof.
- Issues or PRs that are too incomplete for a local maintainer Codex run to
  reproduce, route, or review from public context.
- Core UI/components that are app-specific, one-off, or design-opinionated
  without broad reuse.
- Optional plugins/features that can live as separate packages or app-local
  code.
- Convenience abstractions that hide editor ownership, schema design, or trust
  boundaries.
- Large framework detours that dilute the Plate-on-Plite model.
- Heavy AI-specific orchestration in core when the existing plugin/package
  surface is enough.
- Full-doc translation sets beyond English and Chinese for now.

Strong user demand and strong technical rationale can change this list.
