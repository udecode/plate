# table staged capability refactor

Objective:
Refactor the `BaseTablePlugin` owner graph to staged inferred capabilities;
done when every runtime-plumbing helper is classified, accepted edits pass
focused tests/typecheck/build/lint/review, and this goal plan closes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-24-table-staged-capability-refactor.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- package-api

Plate Next source:
- prompt / link: user correction: "`BaseTablePlugin.ts`
  `readEditorTableSelection` etc." followed by "go"
- mode: named file/API owner-graph packet
- target surface: `packages/table/src/lib/BaseTablePlugin.ts`, its directly
  imported Table-owned runtime-plumbing graph, focused Table specs/type tests,
  generated barrels only if exports move, and the owning Table changeset
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes; every standalone function in
  the target owner graph accepting `editor`, `api`, `read`, `tx`,
  `getOptions`, resolved plugin options, or resolved plugin type
- package review mode: no; this is the user-named `BaseTablePlugin` owner graph,
  not a new full-package review
- package review target: N/A
- package file checklist gate: N/A; named-file/API source map and helper ledger
  apply
- completion threshold summary: every scoped helper has an owner/verdict;
  single-owner plumbing is lexical or an honest staged API/tx capability;
  active tx reuse and lazy extension API publication are proved; focused Table
  tests, typecheck, build, lint, source audit, review, and the final plan
  checker pass

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.
- If package review mode is in scope, generate the package file manifest and
  materialize one checkbox per reviewed file in this plan before
  implementation. A file checkbox may be checked only when its score is `100`.

Timed checkpoint:
- requested duration: none
- semantics: N/A
- initial confidence score: N/A; auditable helper ledger and command gates own
  completion
- improvement loop: audit -> focused red/compile proof -> staged refactor ->
  scoped same-class sweep -> package proof -> review
- final score / loop closure: N/A; close only at zero unclassified scoped rows

Completion threshold:
- Every standalone declaration in the `BaseTablePlugin` owner graph that
  accepts runtime plumbing is classified; every single-owner survivor is
  lexical or an honest scoped staged capability, including
  `readEditorTableSelection` and the creation chain.
- New scoped methods accept domain inputs, not `editor`, `api`, `read`, `tx`,
  `getOptions`, resolved plugin options, or resolved plugin type.
- Later tx stages reuse earlier mutations through the active
  `tx[plugin.key]`; runtime extension callbacks access `context.api` lazily.
- Existing Table behavior, public method names, operation options, inferred
  plugin type, and one-transaction/history semantics are preserved.
- Focused Table tests, Table source-first typecheck, package build, package
  lint, exact source audits, and final review pass.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related scoped sweep row.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- Package review mode may close only when every package file row is either
  checked at score `100` or explicitly deferred for user review with reason,
  owner, proof needed, and next action. Do not move to the next package while
  unchecked package rows remain.
- Core-adjacent package review may close only after
  `tooling/scripts/check-core.mjs` is updated to include that package, or the
  plan records why the package is product-only and does not belong in
  `check:core`.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- Any file capped by the bridge scoring law must name the bridge dependency,
  the real owner, and the deletion path. It cannot be raised to 100 from
  `check:core` alone.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-table-staged-capability-refactor.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: focused `BaseTablePlugin` API/selection/creation/
  transaction/extension specs and type tests selected from current source
- package proof: `pnpm turbo typecheck --filter=./packages/table`;
  `pnpm --filter @platejs/table test`; `pnpm --filter @platejs/table build`;
  package-scoped lint
- shared Core gate: only if a Core builder/generic owner must change; otherwise
  N/A for a Table-only named packet
- source audits: exact target-scope searches for runtime-plumbing parameters,
  nested/one-shot updates inside active tx, stale raw helpers, plugin export
  annotations/casts, and eager extension `api` capture
- related scoped sweep query / active scope / match count / patched count / deferred count:
  eight bounded rows recorded below with per-row counts and zero deferred
  runtime-plumbing matches
- package file manifest / row count / checked count / deferred count: N/A;
  named owner-graph helper ledger instead
- Plite/Plate gap ledger: exact gap owner/proof if staged composition cannot
  express a required private capability; otherwise explicit N/A
- broad Core drift ledger gate: N/A
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-table-staged-capability-refactor.md`

Constraints:
- Review mode targets the best Plate v2 shape: clean Plate product layer on top
  of Plite, no legacy compatibility goal.
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under Plate names.
- No public compat aliases, old Slate shims, or docs for old API names.
- No local hacks: do not hide migration difficulty in bridge dumps, helper
  dumps, `any` casts, duplicated wrappers, command fallbacks, or fake aliases.
- If clean migration is blocked, record a `Plite gap` or `Plate gap` instead of
  inventing a compatibility workaround.
- After every correction, run a related sweep only inside the active mode
  scope. Package review mode is scoped to the named package plus the smallest
  Plite/Core owner needed to unblock that package. Broader matches become
  deferred rows or next-package candidates, not edits.
- In package review mode, do not update docs, examples, package callers outside
  the named package, unrelated packages, generated registries, or broad repo
  surfaces unless the user explicitly broadens scope with `all packages`,
  `current tree`, `full-loop`, `sweep`, or the broader owner name.
- Implementation topology is not frozen. Rename, merge, or delete internal
  helper files, exports, and proof filenames when the active packet restores a
  durable owner. Reject cosmetic synonym churn, but do not preserve one-use
  topology or defer it to `pre-renaming.md` merely to reduce diff noise.
- Extracted-file recovery gate: every untracked/extracted Core/Plate source,
  spec, type-test, and config file in scope must be inventoried and classified
  as `recover-main-owner`, `merge-existing-owner`, `move-to-plite`,
  `justify-new-proof-tooling`, or `delete-duplicate`.
- No file or packet can score `100` while an extracted/untracked file in scope
  lacks a ledger row and one of those buckets.
- Private bridges require owner, deletion gate, and proof.
- Private bridges cannot collect displaced product/plugin behavior. A bridge
  file that centralizes input-rules, node-id, affinity, DOM, command, or change
  listener behavior scores `0` until deleted.
- Any file importing or installing a forbidden bridge is capped at `25`.
- Owner files whose runtime behavior lives in a forbidden bridge are capped:
  `InputRulesPlugin` `<=5`, `NodeIdPlugin` `<=45`, `AffinityPlugin` `<=55`,
  `PliteExtensionPlugin` `<=45`.
- Public type/plugin/editor files touched while a forbidden bridge remains are
  capped at `75`.
- If a helper exists only because migration was hard, cut it.
- Colocation has no line ceiling. A large coherent plugin owner is preferable
  to `transforms/`, `queries/`, `utils/`, `helpers/`, `with*`, `decorate*`, or
  similar one-use files. In package review, inventory every such production
  file and every standalone production function accepting `tx`; inline/delete
  single-owner rows or record concrete multiple-consumer/independent-boundary
  evidence.
- React colocation is family-owned. One component family belongs in one
  `<Family>.tsx` file; one hook family belongs in one `use<Family>.ts` file.
  Related exported primitives/state/behavior hooks may share that file.
  Sibling use inside the family is internal composition, not independent
  reuse. Keep feature-package React roots flat by default and reject
  `components/`, `hooks/`, nested family folders, or nested barrels that only
  classify one owner.
- A separate React file needs reuse across durable families, a standalone
  public owner, or an independent provider/store/lifecycle boundary. A public
  export name, file size, or two sibling consumers inside one family is not
  enough.
- Do not use a narrow representative file to close a broad Core sweep.
- Package review mode is review-first, not migration-first. Freeze scope to the
  named package plus the smallest Plite/Core owner needed to remove a blocker.
- Package hard cuts land package by package. A broad audit can discover
  outside-scope callers, but the plan must record them as deferred rows instead
  of patching them in the current package packet.
- Package file rows can be checked `[x]` only at score `100`: no behavior
  regression versus `origin/main`, no type regression, inline inference
  preserved, no inferred local type annotations, no fake casts/local helper
  types, no compat sludge, correct Plite/Plate ownership, accepted
  owner/name/path drift, and focused proof or justified source audit.
- Green package tests alone do not score a file `100`.
- Do not move to the next package until every package file row is checked at
  `100` or explicitly deferred for user review.
- Core-adjacent package review must update `check:core` coverage before
  closeout, or explicitly classify the package as not belonging in that gate.
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.
- Direct one-shot Plite API law: prefer `editor.update.foo.bar(...)` and
  `editor.read.foo(...)` over callback wrappers for one-line reads/writes.
  Callback form is only for grouped transaction/snapshot logic, shared
  intermediate state, branching/looping, or missing direct API that is recorded
  as a Plite gap.
- Live node target law: if a caller already has a live descendant, pass it as
  the `NodeTarget` / `at` value or use `editor.read.nodes.path(node)` only when
  a `Path` is required. Do not rediscover it with a type/ID query. Handle an
  unresolved public path instead of asserting it.
- Property matcher law: exact shallow equality uses property objects such as
  `match: { type }`, `match: { id }`, and array-valued one-of matchers.
  Property matchers intentionally ignore `text` and `children`; content and
  structure checks remain predicates. Predicates also remain for computed
  schema policy, path-dependent logic, truthiness semantics, or consumed type
  narrowing.
- Flat node-query aliases are forbidden: no `editor.api.findPath`,
  `editor.api.some`, `read.nodes.pathOf`, Plate wrappers, or implicit type/ID
  scans. Use `editor.read.nodes.path`, `editor.read.nodes.some`, and direct
  node targets.
- Boolean node-query law: when an entry-producing collection query is used only
  for truthiness and `nodes.some` has the same target/match/traversal semantics,
  use `editor.read.nodes.some`. Keep `above`, `block`, `parent`, `previous`, and
  `next` when their ancestor/current-block/relative traversal is the actual
  question, and keep any entry-producing query when the node/path is consumed.
- Optional public-read law: Plate feature-package source handles unresolved
  Plite reads with an early return/no-op. `{ required: true }` is reserved for
  Plite internals with a proven runtime invariant; fixture assertions are the
  test-only exception.
- Explicit normalization law: bare `tx.normalize()` /
  `editor.update.normalize()` is an explicit full-root pass in Plite. Feature
  code may keep it only for a named full-root semantic invariant. Do not use it
  to coalesce equivalent text leaves or preserve old fixture shape. Prefer
  transaction dirty-path normalization, repair a universal invariant in Plite,
  and classify every match in the active scope as `cut`,
  `semantic-dirty-path`, `semantic-full-root`, `explicit-normalizer-test`,
  `lifecycle-option`, or `Plite-owner-gap`.
- Active transaction law: no `editor.update.*` call may appear inside an
  `editor.update(...)`, `editor.update.withoutNormalizing(...)`, transform
  middleware, or other active transaction callback. The callback must receive
  and use the active `tx`; `withoutNormalizing` callbacks should be
  `({ tx }) => { ... }`.
- Lexical transaction ownership law: do not extract single-owner plugin logic
  into `foo(editor, tx, ...)`, `fooWithTx(...)`, or paired one-shot/tx
  wrappers. Inline it in the plugin tx group, command, correction, or
  middleware callback so `tx` and plugin context infer lexically. A separate
  transaction-accepting function needs multiple production consumers or a real
  independent algorithm boundary, recorded in the package rows.
- Plugin export inference law: plugin constants should infer from
  `createBasePlugin`, `createPlatePlugin`, `toPlatePlugin`, and chained
  `.extend*` methods. Do not annotate exports as `BasePlugin<Config>` /
  `PlatePlugin<Config>` or cast chained plugin results unless the annotation is
  a true external boundary. If inference fails, fix the builder/generic owner.
- Empty config inference law: do not create `type FooConfig =
  PluginConfig<'foo'>` only to call `createBasePlugin<FooConfig>({ key:
  'foo' })`. Manual plugin config types are only for real options, API, tx,
  selectors, state, or external public contracts.
- Plugin editor extension law: plugin-owned editor extension options should be
  returned directly from `extendExtension`. Do not wrap them in
  `defineEditorExtension({ name: pluginKey, ... })` just to satisfy types.
  `extendExtension` must accept both built extensions and raw options; raw
  options without `name` default to the owning plugin key. Keep explicit names
  only for genuinely separate extension identities.
- Inferred local type law: do not annotate local variables whose initializer
  should infer the type. Smells like `const entries: NodeEntry<T>[] =
  editor.read...` or `const value: Value = [...]` hide type regressions at the
  owner API. Remove the annotation and fix the source API if inference is weak.
  Keep annotations only for uninferrable locals such as empty arrays,
  deliberate narrowing/widening, exported/public signatures, or external
  boundary callbacks.
- Plugin option law: root plugin option helpers are forbidden public API. Do
  not use or re-add `editor.getOption(...)`, `editor.getOptions(...)`,
  `editor.setOption(...)`, or `editor.setOptions(...)`. Package code should use
  scoped plugin portals by default (`editor.plugin(FooPlugin).getOption(...)`,
  `editor.plugin(FooPlugin).getOptions()`,
  `editor.plugin(FooPlugin).setOption(...)`,
  `editor.plugin(FooPlugin).setOptions(...)`). `usePluginOption(FooPlugin, ...)`
  remains the render-subscription path. Key+generic fallbacks need an owner
  reason: plugin self-definition cycle, React hook/component imported by the
  plugin itself, non-React layer that must not import a React plugin, or
  intentionally decoupled cross-package code. Inline single-owner plugin
  behavior in the builder context. Only a proven shared or independent helper
  should receive a narrow plugin context or required `tx` parameter.

Boundaries:
- allowed edit scope: Table base plugin owner, the smallest directly owned
  internal helper/type/test graph needed for the refactor, Table type tests,
  generated barrels if file exports change, one Table changeset, and this plan
- package/API surfaces: preserve the accepted flat Table portal methods and
  operation-option contracts; implementation staging may change builder order
  and inferred capability ownership
- docs/browser surfaces: no docs, registry, www, or browser work
- non-goals: no broad Table React/package re-review, no unrelated package/API
  migration, no public compatibility aliases, no messages to other Codex tasks
- out-of-scope package errors: record, do not repair, unless directly caused by
  this Table packet

Output budget strategy:
- Read the large owner by semantic ranges found with targeted `rg -n`; first
  count declarations/matches, then inspect only relevant ranges. Exclude
  generated output, `dist`, dependencies, broad plans, and unrelated packages.
- Save exhaustive helper names/counts in this plan rather than streaming the
  whole 3k-line source repeatedly.

Blocked condition:
- Stop only if the accepted staged capability graph requires a missing Core
  builder type/runtime primitive that cannot be safely repaired in the smallest
  owner, or focused proof exposes a behavior decision outside the accepted
  Table shape. Record the exact Plate/Plite gap and needed decision.

Current verdict:
- verdict: keep
- confidence: high
- next owner: the next user-selected Plate package; Table React component/hook
  family cleanup remains a separate packet
- keep / revert / quarantine call: keep the staged Table owner graph and pure
  paste subsystem; no quarantine
- reason: `BaseTablePlugin` owns inferred API/tx capabilities in dependency
  order, every later stage consumes the typed owner, active transactions reuse
  the active snapshot, and only six pure validation/projection/codec helpers
  remain at module scope

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Full owner graph including `readEditorTableSelection`; staged capabilities; avoid runtime-plumbing parameters; preserve domain options, inference, behavior, active tx, and lazy extension API; no other task messages; exact proof/handoff |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read completely |
| Active goal checked or created | yes | `get_goal` returned none; current objective created with this plan |
| Mode classified as named packet vs broad Core sweep | yes | Named `BaseTablePlugin` owner-graph packet; not broad Core or full package |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Accepted staged capability graph; no compatibility wrappers |
| Broad Core drift ledger initialized when in scope | no | N/A: no broad Core sweep |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; target boundaries above |
| Output budget strategy recorded | yes | Targeted range reads/count-first searches above |
| Public API fork routing checked | yes | No new naming/composition fork; preserve already accepted flat Table portal surface |
| Gap policy checked | yes | Exact builder/substrate gap required before any workaround |
| Related scoped sweep policy checked | yes | Full runtime-plumbing declaration class in target owner graph |
| Review-mode rename freeze checked | yes | No cosmetic rename; owner-driven moves/deletions only |
| Package review checklist initialized when in scope | no | N/A: named owner-graph packet |
| Package/API pack selected | yes | `package-api` materialized |
| Public surface or package boundary identified | yes | `@platejs/table` inferred plugin API/tx surface |
| Release artifact path selected | yes | Owning existing/new `.changeset` for `@platejs/table` if public behavior/types change |
| `changeset` skill loaded when `.changeset` is required | yes | Existing Table changesets were inspected under the loaded changeset rules; no duplicate artifact added |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` only if exported files move/delete; builder-only edits need no barrel generation |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
- [x] After every correction, related scoped sweep row is added with query,
      active scope, match count, patched count, deferred count, and remaining
      risk. In package review mode, broader matches are deferred, not patched.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [x] For package review mode, the package file checklist is generated before
      implementation, with one checkbox per reviewed file.
- [x] For package review mode, every production `transforms/`, `queries/`,
      `utils/`, `helpers/`, `with*`, `decorate*`, similar helper file, and
      standalone `tx`-parameter function has an owner-topology row; every
      survivor has multiple-production-consumer or independent-boundary proof.
- [x] For package review mode, every package file row is either checked at
      score `100` with evidence or left unchecked with deferral reason, owner,
      proof needed, and next action for user review.
- [x] For package review mode, no next package is started before the current
      package checklist closes or the user explicitly redirects.
- [x] For Core-adjacent package review, `tooling/scripts/check-core.mjs` is
      updated to include the package, or the plan records why the package is
      product-only and outside `check:core`.
- [x] Direct one-shot API audit closed: single-operation
      `editor.update((tx) => tx.*)` and single-read
      `editor.read((state) => state.*)` wrappers are replaced with direct
      methods when available, or each remaining callback is justified as grouped
      transaction/snapshot logic.
- [x] Live node target and matcher audit closed: no supplied live node is
      rediscovered by type/ID, no flat `api.findPath` / `api.some` alias remains
      in scope, equality-only callbacks use property matchers, and every
      remaining predicate has computed/path/truthiness/narrowing semantics.
- [x] Optional public-read audit closed: feature-package production code does
      not use `{ required: true }` or non-null assertions to hide unresolved
      Plite reads; each match handles `undefined` or records a Plite-internal
      invariant reason.
- [x] Explicit normalization audit closed: every `tx.normalize(...)` and
      `editor.update.normalize(...)` match in scope has a ledger verdict;
      feature production calls have a named full-root semantic invariant or are
      cut/moved to the Plite owner; explicit normalizer tests remain test-only
      evidence rather than production precedent.
- [x] Plugin export inference audit closed: plugin export annotations/casts
      such as `: BasePlugin<Config>`, `: PlatePlugin<Config>`, and
      `as BasePlugin<Config>` are removed when inference should own the result,
      or each remaining annotation is justified as a real external boundary.
- [x] Empty config inference audit closed: `PluginConfig<'key'>` aliases and
      `createBasePlugin<Config>` generics are removed when the config has no
      typed options, API, tx, selectors, state, or external public contract.
- [x] Plugin extension options audit closed: plugin-owned extension options are
      returned directly from `extendExtension`; `defineEditorExtension` remains
      only for standalone Plite extensions, existing built extensions, or
      explicit non-plugin extension identities.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run all named Table proof | 175/175 fast/drop/internal tests; 127/127 slow tests; package test/typecheck/build/lint; Turbo 15/15 |
| Broad Core drift ledger coverage | no | N/A for a Table-only named packet | No Core source touched |
| Score gate | yes | Classify every scoped owner | Review matrix is complete; no unresolved high-drift row |
| Best Plate v2 recommendation | yes | Record ideal owner shape | Staged inferred API/tx capabilities; pure independent algorithms stay private |
| Plite/Plate gap ledger | yes | Record blockers or N/A | N/A; existing Core builders express every required dependency |
| Related scoped sweep after correction | yes | Record exact same-class searches | Five rows below; zero deferred runtime-plumbing matches |
| Package file checklist | no | N/A for named owner-graph mode | Scoped source/helper ledger used |
| Helper topology / lexical tx ownership | yes | Eliminate single-owner plumbing helpers | Six top-level Base helpers remain, all pure; active tx reads use `api.getSelection(..., tx)` |
| Package/API proof | yes | Run Table-owned proof | All named tests, typecheck, build, lint, and graph typecheck pass |
| Shared Core gate coverage | no | N/A when Core is unchanged | `table` already exists in `tooling/scripts/check-core.mjs`; no gate edit |
| Non-Core package error triage | yes | Classify proof drift | One transient shared utils failure resolved; final Turbo graph is 15/15 |
| Source audit | yes | Audit stale helper and cast names | Exact `rg` returned zero stale runtime-plumbing names/casts |
| Rename ledger | no | N/A without deferred rename | No rename was postponed |
| Extracted-file inventory | yes | Classify every new in-scope file | Five files below; all absent on `origin/main`, preserved as source/proof owners |
| Autoreview / review | yes | Run scoped review | First pass found raw drop lookup and was fixed; a stale diff-context parse claim was rejected with exact source/typecheck; final current-source pass was clean |
| Final lint/check | yes | Run scoped lint and diff check | Package lint and scoped `git diff --check` pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below; no attention item |
| Goal plan complete | yes | Run completion checker | Final checker command recorded below |
| Public API / package boundary proof | yes | Audit inferred plugin surface | `getSelection(at?, state?)` is inferred through dependent plugins and active tx type test |
| Release artifact classification | yes | Classify published delta | Existing Table major changeset owns the flat API; grid/paste changeset owns runtime behavior |
| Published package changeset | yes | Inspect owning release artifacts | `.changeset/table-block-insert.md` covers the flat API plus paste/grid behavior; no duplicate added |
| Registry changelog | no | N/A outside registry work | No registry files touched |
| No release artifact | no | N/A because existing package artifacts apply | Existing Table artifacts already cover the published delta |
| Package typecheck/build/test | yes | Run owning package checks | `@platejs/table` test/typecheck/build all exit 0 |
| Barrel/export generation | no | N/A without export/file-layout changes | No public file export moved or changed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `BaseTablePlugin` API/tx graph | 100 | keep | Table base plugin | Ordered `.extendApi`/`.extendTx`; dependent type proof; zero raw runtime-plumbing helpers | Keep as the package model |
| `getSelection(at?, state?)` | 100 | keep | Table selection capability | One typed owner reused by later API, active tx, clipboard, and React drag/drop | No duplicate reader |
| `internal/context.ts`, `grid.ts`, `mutation.ts`, `selection.ts` | 100 | keep | Independent deterministic Table algorithms | Multiple Table owner consumers; no plugin runtime plumbing | Keep private |
| `internal/paste.ts` | 100 | keep | Independent paste/drop planner | Shared by Base clipboard and React drop; caller supplies only factories and expansion policy | Keep private |
| `TablePlugin` drag/drop handlers | 100 | keep | React Table plugin | One scoped plugin portal; one-use capture/warning logic is handler-local | Keep flat |
| focused specs and type tests | 100 | keep | Table proof owners | 175 fast/drop/internal and 127 slow pass; compile-only staged dependency proof | Keep |
| existing Table changesets | 100 | keep | Table release owner | Flat API and paste/grid runtime deltas already covered | No duplicate artifact |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Table plugin queries and mutations | Multiple ordered inferred `.extendApi()` / `.extendTx()` stages; later consumers call typed prior capabilities | Top-level `foo(editor, api, tx, type)` helpers; `bindFirst`/`OmitFirst`; public private-helper fragments; raw key lookup/casts | It keeps state ownership and inference at the plugin builder while preserving active snapshots | none |
| Table selection | Scoped `table.api.getSelection(at?, state?)`, with active `tx` supplied only when uncommitted state matters | Duplicate `readEditorTableSelection`; direct `readTableSelection` calls across stages; editor re-reads inside tx | One query owner serves Base and React dependents without passing a read facade | none |
| Table paste/drop planner | Independent private algorithm receiving domain factories and `disableExpand` from the resolved owner | Planner resolving `KEYS.table` with `as never`; publishing planner internals as plugin API | The algorithm remains reusable without owning plugin discovery | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | Existing repeated builder stages infer prior API/tx and expose active-state queries | N/A | Package type/build/type-test proof | No Plite or Plate gap |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| User named `readEditorTableSelection` and peers | `BaseTablePlugin.ts` plus imported Table runtime graph | Babel top-level declaration inventory plus exact caller reads | 43 legacy runtime-plumbing declarations | 43 | 0 | Six module declarations remain; all are pure validation/projection/codec algorithms |
| Selection query must be an inferred dependency capability | Base plugin and React Table plugin | `rg 'readTableSelection\\('` and `rg 'readSelection'` | 4 direct reads plus 2 tx-local wrappers | 5 merged; 1 canonical owner kept | 0 | Only `getSelection` implementation calls `readTableSelection` |
| Active tx reuse | Every `.extendTx` semantic range | Audit for `editor.read`, `editor.update`, `editor.plugin`, and nested update calls | 0 stale editor I/O; 1 later-to-earlier tx call | 0 stale; 1 kept | 0 | `tx[plugin.key].setBorderSizes` intentionally preserves the active transaction |
| Lazy extension publication | Every `.extendExtension` in Base owner | Exact destructured-context search | 2 eager destructures | 2 | 0 | Runtime callbacks read `context.api` lazily |
| Paste-source correction | Base clipboard extension | Top-level paste-source function inventory | 4 single-owner plumbing helpers | 4 | 0 | Shared WeakMap remains as required cross-extension state |
| Review correction: raw drop ownership | `internal/paste.ts` and `TablePlugin.tsx` | Raw `KEYS.table`, `as never`, root API lookup audit | 2 raw lookups plus 1 lookup helper | 3 | 0 | Planner receives only node factories and expansion policy |
| React peer correction | `TablePlugin.tsx` drag/drop owner | Top-level functions accepting `editor` plus single-use caller audit | 3 | 3 | 0 | Reused pure `consumeTableDragEvent` remains |
| Stale-name closure | Named packet files | Exact `rg` for removed helper names, casts, and wrappers | 0 | 0 | 0 | none |

Core drift ledger:
- Applies: no
- Manifest command: N/A; named Table packet
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A; no Core source changed
- Top drift rows: none

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | no Core packet | Core | Final Table graph typecheck passed without Core edits | none |

Package file checklist:
- Applies: no; user named the Base Table owner graph rather than a full package
- Package: `@platejs/table`
- Manifest command: N/A; scoped helper/packet inventories below
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: N/A
- Actual row count: N/A
- Checked score-100 count: N/A
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: this named packet passes review and plan closure

Package file rows:
- [x] N/A — named owner-graph mode; review matrix and packet ledger carry the
      scoped score/evidence instead of pretending this was a full-package audit.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Staged API creation/grid/selection | `BaseTablePlugin` | Raw helpers hid dependency order and weakened inference | Base plugin plus type test | Merge into ordered `.extendApi()` stages; publish `getSelection` once | keep |
| Staged transactions | `BaseTablePlugin` | Extracted helpers could re-read editor state or nest updates | Every `.extendTx` range and presentation history proof | Use lexical `tx`; later stage calls `tx[plugin.key]` | keep |
| Lazy extensions and paste | Base clipboard owner | Eager API capture and standalone source plumbing could predate publication | Base extension ranges and paste specs | Retain whole context; inline single-owner source logic | keep |
| Named-root selection | Table move-selection tx | End-of-table move could drop the named root | slow named-root regression | Select a root-preserving text point from the active tx | keep |
| React drop adoption | `TablePlugin` + private paste planner | Duplicate selection reader and raw plugin lookup bypassed capabilities | drop spec, typecheck, review | Reuse `table.api.getSelection`; pass domain planner inputs | keep |
| Proof | Table specs/type tests | Runtime success alone would not prove inferred staged dependencies | 302 runtime tests plus type/build/lint/graph | Keep focused proof | close |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/table/src/lib/internal/paste.ts` | recover-main-owner | Absent on `origin/main`; concurrent Table paste owner | Keep as independent planner shared by Base clipboard and React drop | paste/drop specs, typecheck, build |
| `packages/table/src/lib/internal/paste.spec.ts` | justify-new-proof-tooling | Absent on `origin/main` | Keep with planner owner | included in 175/175 fast run |
| `packages/table/src/lib/internal/paste.benchmark.slow.ts` | justify-new-proof-tooling | Absent on `origin/main` | Preserve concurrent benchmark owner; not edited semantically here | source inventory and package build |
| `packages/table/src/lib/BaseTablePlugin.paste.spec.tsx` | justify-new-proof-tooling | Absent on `origin/main` | Keep Base adoption proof | included in 175/175 fast run |
| `packages/table/src/react/TablePlugin.drop.spec.tsx` | justify-new-proof-tooling | Absent on `origin/main` | Keep React drop proof | included in 175/175 fast run |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| Initial Turbo graph | Shared utils build briefly reported a trailing-block mismatch during concurrent source activity | Exact final graph rerun passed 15/15 without a Table workaround | resolved shared drift |
| Direct Bun after reinstall | `@platejs/core` was missing because workspace `dist` output was empty | Required source graph build restored the intended package resolution; all exact reruns pass | resolved environment/artifact state |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| Table React component/hook family topology | `packages/table/src/react/**` beyond `TablePlugin` drag/drop | User named the Base owner; only the directly dependent duplicate reader/drop path entered scope | future Table React-family packet |
| Concurrent Table codec/mutation/selection proof edits | Shared Table source/spec files outside this semantic packet | Preserved rather than rewriting unrelated live work | current shared-tree owners |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `BaseTablePlugin.ts`: ordered inferred API/tx stages, one `getSelection` owner, active-state reuse, lazy extension context, named-root movement; `internal/paste.ts` and `TablePlugin.tsx`: typed drop ownership with no raw key/cast |
| tests/proof | presentation one-commit assertion, named-root/clipboard adoption, drop/paste specs, and compile-only staged dependency coverage |
| docs/templates/skills | this goal plan only; no user docs, template output, skill source, or generated registry |
| reverted/quarantined packets | none; concurrent independent paste/proof files preserved and classified |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| — | none | Named packet is closed with no blocker | proof ledger | move to the next user-selected package |

Findings:
- `readEditorTableSelection` was not an isolated smell. The same selection
  knowledge was repeated in API stages, active transactions, extensions, and
  React drag/drop.
- Repeated `.extendApi()` / `.extendTx()` is the clean dependency graph:
  inference stays local, dependents see prior capabilities, and no runtime
  facade parameters are needed.
- `internal/paste.ts` earns a separate file because it is a deterministic
  planner shared across Base clipboard and React drop. Plugin discovery does
  not belong inside that planner.
- File size was not a problem. Scattered ownership was.

Decisions and tradeoffs:
- Added one honest scoped capability, `getSelection(at?, state?)`, rather than
  keeping private duplicate readers. The optional state exists solely for
  active transaction/snapshot correctness.
- Kept six top-level Base helpers because they are pure validation,
  projection, or codec algorithms; none carries editor/plugin runtime state.
- Kept `consumeTableDragEvent` because it is a tiny pure operation reused by
  multiple handlers. One-use capture and warning helpers were inlined.
- Passed node factories and the expansion policy into the private drop planner
  instead of passing a plugin portal or making the planner a public API.
- Reused `tx[plugin.key].setBorderSizes` from the later tx stage so the whole
  mutation remains one transaction/history batch.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad plan search streamed excessive output | 1 | Restrict every read/search to exact owner paths and semantic ranges | Subsequent audits were count-first and bounded |
| TypeScript compiler API module unavailable for AST inventory | 2 | Use the installed Babel TypeScript parser | Exact top-level inventory succeeded |
| Direct Bun could not resolve empty workspace `dist` after reinstall | 1 | Build through the source/package graph | All Table tests and checks passed |
| Initial graph hit transient shared utils drift | 1 | Preserve shared work and rerun the exact final graph | Final Turbo typecheck passed 15/15 |
| Old slow clipboard expectations disagreed with the adopted paste oracle | 1 run / 4 rows | Verify current planner law, fix named-root bug, reconcile stale identity/selection expectations | Final slow suite passed 127/127 |
| Lint found unused `MutableRow` | 1 | Delete the stale type and rerun | Package lint passes |
| First autoreview found raw Table drop lookup/cast | 1 | Resolve `BaseTablePlugin` in the handler and pass domain planner inputs | Raw lookup/helper removed; all proof rerun |
| Second autoreview misread deleted diff context as a duplicate return at line 1305 | 1 | Inspect exact current lines and rerun package typecheck, then demand current-source review | Line 1305 is `columnIndex++`; typecheck passed; final review rejected the stale claim |
| Drop factory accepted readonly children wider than public `createCell` | 1 | Copy planner children at the boundary | Typecheck and build pass |

Verification evidence:
- Baseline before semantic edits:
  `pnpm turbo typecheck --filter=./packages/table` — 15/15 tasks.
- Fast/API/internal/drop:
  `bun test ./packages/table/src/lib/BaseTablePlugin.*.spec.tsx
  ./packages/table/src/lib/internal/mutation.spec.ts
  ./packages/table/src/lib/internal/paste.spec.ts
  ./packages/table/src/react/TablePlugin.drop.spec.tsx` — 175 pass, 0 fail,
  5,649 expectations across 15 files.
- Slow behavior:
  `bun test ./packages/table/src/lib/BaseTablePlugin.*.slow.tsx` — 127 pass,
  0 fail, 608 expectations across 7 files.
- Package script:
  `pnpm --filter @platejs/table test` — exit 0.
- Package types:
  `pnpm --filter @platejs/table typecheck` — exit 0.
- Package artifact:
  `pnpm --filter @platejs/table build` — exit 0.
- Required source graph:
  `pnpm turbo typecheck --filter=./packages/table` — 15/15 tasks.
- Formatting/lint:
  `pnpm --filter @platejs/table lint:fix` then
  `pnpm --filter @platejs/table lint` — 56 files, no remaining fixes.
- Diff hygiene:
  scoped `git diff --check` — exit 0.
- AST/source audit:
  top-level Base function inventory is exactly
  `clampTableSelection`, `isTableCellSelection`, `getTableAnchorPoint`,
  `isRecord`, `isTableCellBorder`, and `parseHtmlCssNumber`; all are pure.
  Exact stale-name/raw-cast query returned zero.
- Transaction audit:
  zero `editor.read`, `editor.update`, or raw plugin lookup in active tx
  stages; later border mutation intentionally calls
  `tx[plugin.key].setBorderSizes`.
- Export audit:
  no file export or public file-layout change, so `pnpm brl` is N/A.
- Release audit:
  `.changeset/table-block-insert.md` owns the accepted flat Table API and
  paste/grid behavior.
- Review:
  first scoped autoreview found one P2 raw drop lookup and it was fixed; a
  second stale diff-context parse claim was rejected with exact source and a
  fresh typecheck; final current-source autoreview was clean with no accepted
  actionable findings (`patch is correct`, confidence 0.83).

Final handoff contract:
- target surface and mode: named `BaseTablePlugin` owner-graph packet plus its
  direct paste/drop dependent
- files/APIs reviewed: Base staged API/tx/extension graph,
  `internal/paste.ts`, React drag/drop adoption, focused specs, type tests, and
  existing release artifacts
- broad Core drift score coverage: N/A; no Core source touched
- package file checklist coverage: N/A; named packet, with complete helper,
  packet, review, and extracted-file ledgers
- best Plate v2 recommendation: multiple inferred builder stages; one
  `getSelection(at?, state?)` query owner; private deterministic planners
- verdict matrix summary: seven score-100 keep rows; zero unresolved rows
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: eight rows
  above; zero deferred runtime-plumbing matches
- out-of-scope matches discovered: broader Table React component/hook family
  topology and unrelated concurrent Table proof/source edits
- changes made: removed raw helpers/facades/casts, staged inferred
  capabilities, reused active tx state, preserved named roots, and adopted the
  capability in drag/drop
- tests/proof commands: 175 fast/drop/internal, 127 slow, package
  test/typecheck/build/lint, Turbo 15/15, source/diff audits, scoped autoreview
- old compatibility names audited: exact stale helper/cast query returned zero
- needs attention: none
- next best Plate Next packet: next user-selected package; Table React family
  colocation only if explicitly selected

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure |
| Where am I going? | Goal checker, then immutable handoff |
| What is the goal? | Keep Table runtime ownership inside inferred staged plugin capabilities |
| What have I learned? | Selection was the shared capability; paste is the independent algorithm boundary |
| What have I done? | Refactored, proved, audited, and reviewed the named owner graph |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Ground | complete | Skills, Vision, exact owner graph, and goal plan loaded |
| Implement | complete | Staged API/tx/query/extension and drop adoption landed |
| Prove | complete | 302 focused runtime tests plus package and graph gates pass |
| Review | complete | First P2 fixed; stale diff-context claim rejected; final current-source review clean |
| Close | complete | Ledgers filled; completion checker is the last command |

Timeline:
- 2026-07-24T18:31:05.610Z Goal plan created.
- Baseline Table graph typecheck passed 15/15.
- Classified and merged the Base runtime-plumbing helper graph into inferred
  staged capabilities.
- Proved creation, selection, presentation, mutation, clipboard, paste, and
  named-root behavior.
- Removed the duplicate React selection reader and raw drop plugin lookup after
  scoped review.
- Final fast, slow, package, graph, lint, source, and diff gates passed.

Open risks:
- None inside the named packet.
- Browser proof is N/A under the explicit package-local boundary; React
  drag/drop behavior has focused event-level proof.
- Concurrent untracked paste/proof files remain preserved and explicitly
  classified rather than silently claimed or deleted.
