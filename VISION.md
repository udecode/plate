# Vision

This is the mandatory first read for Plate and Plite direction.

Root `VISION.md` keeps the essential doctrine every agent must see. Detailed
owner doctrine lives in `docs/vision/*.md`; read only the relevant detail file
after this root file.

The `vision` skill is only a router. Durable product doctrine belongs here and
in `docs/vision/*.md`; operational skills may own the compact method that
applies it. When reusable taste, architecture, proof, or automation doctrine
changes, update this file and the relevant detail owner.

## Detail Files

- `docs/vision/common.md`: shared taste, proof, automation, research,
  maintainer policy, correction patterns, repair, and consolidation.
- `docs/vision/plite.md`: Plite substrate, API/runtime/browser/perf doctrine,
  proof hierarchy, and Slate skill topology.
- `docs/vision/plate.md`: Plate framework/product doctrine, plugin/component
  policy, docs/API ownership, security, AI, setup, and non-merge lines.
- `docs/vision/sync.md`: `sync-vision`, baseline advancement, classification,
  and taste capture.

## How To Use

Read this before changing reusable architecture, public APIs, editor behavior,
automation loops, maintainer issue/PR policy, or Slate/Plate boundaries.

Use active plans for run-specific evidence. Use this file and the relevant
detail file for durable direction.

## Common Essentials

- Best long-term architecture beats the nearest symptom patch.
- Package/runtime ownership beats example glue when the bug is systemic.
- Breaking changes are acceptable when they produce the better API, behavior,
  or performance shape.
- No fake aliases, no fake compatibility, no hidden migration story in docs.
- Public docs describe the current API only.
- Names, flags, config keys, output shapes, docs examples, and workflow
  conventions are API surface. Add fewer conventions, make them clearer, and
  do not churn them casually.
- Public API design starts from ideal call sites. Current code, compatibility,
  machinery, ecosystem precedent, and accepted plans are evidence and adoption
  cost, not requirements. Use `best-api` to choose or review the target before
  a layer plan turns it into implementation.
- Do not hide latency behind debounce, delayed repair, or benchmark tricks.
- Do not call browser/editor behavior correct from model-only proof.
- Do not call perf closed from rerender/locality evidence alone.
- Do not call a live/external behavior fixed without live proof or an
  equivalent local proof. If proof is blocked, name the exact missing access,
  account, credential, device, route, or command.
- Be blunt. If the current tactic is weak, pivot instead of polishing it.

### Boundary Law

- Plite packages are the raw editor substrate: model, canonical document changes, runtime,
  DOM/input, selection, history, browser proof, and unopinionated APIs.
- Plate packages are the product/editor framework layer: plugins, React
  wrappers, components, kits, opinionated UX, examples, and app-facing docs.
- When Plate API names or runtime habits conflict with Slate v2, Slate v2 wins.
  Break Plate instead of bending Slate or hiding the conflict behind aliases.
- Do not fix a Plate product concern by polluting Slate core.
- Do not hide a Slate primitive gap in Plate glue.
- Cross-boundary work must name both owners and prove the handoff.

### Evidence Order

1. Live source/tests/benchmarks for current behavior.
2. Real browser proof for visible local routes.
3. Replayable Playwright or package tests for the bug class.
4. Benchmark targets with fair legacy/current comparison for perf claims.
5. Current docs for accepted claim width.
6. Research decisions for durable architecture context.
7. Old plans only as historical context unless they are active.
8. Chat memory last.

Executable tests outrank prose docs for behavior claims. Prose docs outrank
tests for ownership, API intent, and public teaching surfaces.

### Automation Essentials

- Long-running automation must repair tests, metrics, skills, and docs while it
  works. A plan note without a future behavior change is archaeology.
- Public repo maintenance is owned by `$maintainer`: issue/PR/security queue,
  heartbeat, VISION fit, duplicate/claim guard, owner routing, proof gates, and
  authority boundaries. `$auto` owns long internal Plate/Slate quality loops.
  `$autoclosure` owns post-merge/current-tree until-clean closure of already
  applied work.
- `$auto` may be the user-facing front door. `auto PR #123`,
  `auto issue #123`, `auto all PRs/issues`, and `auto security` immediately
  route to `$maintainer`; `auto current tree` and `auto post-merge`
  immediately route to `$autoclosure`; `auto slate` and `auto plate packages`
  stay in `$auto`. This is routing convenience, not an ownership merge.
- Public issue and PR bodies are maintainer-agent input contracts. Plate/Slate
  maintenance runs through local Codex sessions in maintainer checkouts, not a
  hosted API bot that can infer private context. Require enough public repro,
  proof, risk, and next-action state to route or stop cleanly.
- Maintainer heartbeat state should be durable and boring: queue snapshot,
  candidate matrix, selected owner, proof path, authority boundary, run note
  when useful, and next heartbeat. Chat memory is not the queue ledger.
- Private security advisory details must not leak into versioned queue docs.
  Keep public/versioned ledgers redacted and read sensitive details from live
  GitHub or local ignored artifacts.
- Source-backed pure improvements may be applied autonomously when they stay
  inside this vision. Ask only when the change alters taste, product/API
  direction, human authority, skill topology, security, release policy, or an
  irreversible side effect.
- Multi-step automation must carry resumable state and stop at real approval
  boundaries. Never auto-approve payments, external sends/posts, credential
  use, destructive operations, or other irreversible user-authority actions.
- Agent/harness integrations must preserve the harness's authentication,
  session, permission, and tool boundary. Do not reimplement model transport or
  claim stronger isolation than the underlying harness provides.
- All issue/test harvests are issue-by-issue when the prompt says "all".
  Clusters and matrices are routing checkpoints, not completion.
- Every relevant issue needs a checkmark: existing local test linked and
  verified, new test written and verified, Plate-owned proof linked, or
  explicit defer owner recorded.
- External editors are pressure sources, not architecture to clone.
- Research is a compiled agent layer, not a scrapbook.

### User Correction Patterns

- "This is still slow" usually means the measured lane missed the visible user
  operation.
- "WTF" on editor behavior means reproduce with real mouse/keyboard/browser
  interactions before theory.
- "Only uncommitted" means do not summarize older branch history.
- "No debounce bullshit" means a faster-looking metric is rejected if the user
  can still see delayed work.
- "Long term most precise and performant" means choose architecture/API owner,
  not another local example condition.
- "Bug report" means patch/repro first unless the user explicitly asks for a
  plan.
- "Make it perfect" means stabilize behavior first, then improve perf, then
  clean API/DX, then prove readiness.
- Repeated "go next" expects one best next owner, not a menu.
- "Batch loop" means keep working through safe alternate owners and collect
  unblock questions for the end.

## Plite Essentials

Plite is the raw editor substrate. It must stay unopinionated, precise, and
boring in the best way: document model, canonical changes, runtime, input, DOM,
selection, history, browser proof, package API, and benchmarks.

- Preserve Plite's simple document model and canonical `DocumentChange` as the
  sole mutation and commit truth. Transactions construct canonical changes
  directly; React does not define the core ontology.
- Public API should teach `editor.read`, `editor.update`, `state`, `tx`,
  extension groups, commit listeners, and projection sources.
- Primary-root APIs do not expose a public `main` key. The primary document is
  addressed by omission; explicit roots are for additional roots only.
- Plite stays unopinionated. Plate owns product opinion.
- Do not keep legacy APIs alive just because they are familiar.
- Plite extensions are exact, `name`-identified definitions. Plate plugin
  `name` identifies a capability only. Element plugins own a persisted `type`;
  mark/property plugins own a persisted `key`. Each defaults to `name` when
  omitted but may differ at definition time, and behavior plugins expose
  neither. Uninstalled portals preserve an exact schema descriptor's identity,
  while runtime strings use the string as conventional `.type`/`.key`;
  `installed` guards behavior, not identity. These identities
  are immutable after construction. Plugins have no
  `config`; immutable construction
  inputs and runtime resources stay in factory closures or honest host owners.
- Extension-owned document capabilities are `read` and `update`; pure
  core-read policy is `readMiddleware`. One descriptor-owned `api` projects to
  `editor.api.<name>` and `editor.extension(Extension).api`; do not root-merge
  methods or add `getApi`. The `api` field is always a one-context-object
  factory, including for context-free values.
- Lifecycle and host/DOM events share one root `on.*` family with prefixless
  child names. There is no second `handlers` bucket.
- Behavior specs define law; ordinary plugin and extension arrays compose
  accepted capabilities. Name a reusable kit only after real reuse, and treat
  runtime control as a separate proven job. Do not add a behavior-profile DSL.
- Page layout is not core editor truth. Active caret, selection, and
  composition stay on the native/browser editing path.
- Browser editing claims require model, DOM, selection/caret where observable,
  focus owner, legal trace, replayability, and follow-up typing.
- Behavior before perf. Visual proof before green visible-UI claims. Keep perf
  packets only when correctness stays green.
- Degraded huge-document modes stay degraded until native behavior is proved.

Read `docs/vision/plite.md` for the full Plite doctrine.

## Plate Essentials

Plate is the editor framework that ships in apps. It owns plugins, wrappers,
components, kits, app-facing docs, product ergonomics, and opinionated UX built
on top of Slate-first primitives.

- Plate should make Slate-based editors practical to build and maintain without
  taking away schema, UI, or app ownership.
- Keep Plate core unopinionated enough for framework use. Opinionated product
  behavior belongs in packages, kits, examples, or docs.
- A behavior, API, or gate change needs an adoption story. "Cleaner" alone is
  not enough.
- Public docs must be source-backed, current-state only, and readable by humans
  and agents.
- Plugin and feature pages are headless first. UI components are render
  examples unless source proves they own behavior.
- Plugin authoring keeps one-owner behavior colocated and inferred. Every
  public builder or configuration method must represent a distinct user job;
  current assembly machinery is never doctrine.
- Plate plugins are exact opinionated definitions lowered onto Plite once.
  Native Plite fields live directly at the plugin root; there is no nested
  `extension` grammar, parallel `PluginConfig`, public `__config`, or
  `pluginApi`.
- Classify behavior before packaging it: invariants stay with their owner,
  runtime parameters stay in `initialState` and the scoped store, proven
  substitutable capabilities may become plugins, and product policy stays
  app- or kit-owned.
- Plugin capability names encode execution boundaries: `selectors` are pure
  store projections, `read` is a pure supplied-state document query, `api` is a
  non-snapshot plugin service, `update` owns active-transaction document
  mutation, and flat native fields own genuine editor-wide substrate.
- Public factories are one object call with no caller generics and preserve one
  exact normalized definition. Their private typing may infer a small
  dependency/initial-state environment beside the author input when TypeScript
  needs that split for contextual callbacks; do not expose it or pretend one
  self-referential generic can infer everything. `.extend()` widens the
  definition and `.configure()` is terminal and non-widening. `component` is
  ordinary render publication data accepted by Base and Plate constructors for
  static/RSC and live consumers; Base extension stages reject it, while
  terminal configuration may replace it. `toPlatePlugin()` belongs at the
  owning React adapter when it publishes a reusable Plate-layer descriptor or
  adds genuine Plate-only authoring; terminal consumers never insert it merely
  to set `component`. Factories replace `clone()`.
- `DefinitionOf<typeof FooPlugin>` is the sole public definition extractor,
  and its alias is `FooDefinition`, never `FooConfig`. True domain/runtime
  config types remain valid.
- Root dependency references are shallow, non-generic identity values.
  `EditorExtensionTypeProvider` is the sole public value-sensitive capability
  bridge. Its higher-kinded encoding, normalized installed-capability carrier,
  and transitive dependency expansion stay under `@platejs/plite/internal`,
  never recursively encode exact ancestry, and never replace runtime
  exact-descriptor identity. Plate's author-source to canonical-lowered type
  split is internal too.
- Low-level React composition is `react({ dom })`: one object, one exact DOM
  descriptor, and at most one explicit erased implementation boundary for the
  TypeScript 7 invariant-union reduction limit.
- Format compilers own intrinsic syntax and compile installed feature-owned
  codec declarations. Feature conversion tables do not belong in central
  registries or mutable plugin state.
- Plate can re-export Slate surface where it improves DX, but bugs that
  reproduce in plain Slate belong to Slate.
- If a Plate public API collides with Plite runtime names such as `api`,
  `read`, `update`, `state`, or `tx`, cut or rename the Plate API. Do not
  compromise Plite substrate names for Plate compatibility.
- Security is about explicit trust boundaries and sane defaults. Do not hide
  trust decisions behind convenience abstractions.
- AI support stays optional, composable, and plugin-first.

Read `docs/vision/plate.md` for the full Plate doctrine.

## Decision Consolidation

Use the smallest durable target:

- active goal plan for run-specific findings;
- root `VISION.md` for mandatory essential taste and routing;
- `docs/vision/*.md` for owner-specific reusable doctrine;
- Slate docs for accepted Slate v2 architecture/proof/release claim width;
- Plate docs for accepted Plate behavior/API/docs decisions;
- research docs for durable architecture conclusions and vocabulary;
- benchmark target registries for metric/control-plane truth;
- `.agents/rules/**` for reusable agent workflow policy.

Write latest-state rules, accepted tradeoffs, rejected alternatives, proof
commands, and next owners. Do not write public changelog prose. Consolidate
only reusable decisions.
If code changes reveal or change durable subsystem intent, update the smallest
owning spec, vision detail, skill, or docs owner instead of burying the "why"
only in PR text or a final handoff.
