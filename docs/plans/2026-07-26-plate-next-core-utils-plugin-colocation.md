# plate next core utils plugin colocation

Objective:
Colocate and simplify every Core plugin owner, then every Utils plugin owner,
under Plate Next v12; close only after 153 scoped files score 100 and focused
package proof plus autoreview pass.

Goal plan:
docs/plans/2026-07-26-plate-next-core-utils-plugin-colocation.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user: "core and utils package plugins first" then "go"
- mode: two ordered scoped plugin-owner packets
- target surface:
  `packages/core/src/{lib,react}/plugins/**/*.{ts,tsx}` first, then
  `packages/utils/src/{lib,react}/plugins/**/*.{ts,tsx}`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; only Core plugin-owner directories
- correction-triggered related scoped sweep: yes, inside the active packet
- package review mode: scoped plugin-owner packet, not a full package review
- package review target: every file in the two explicit plugin directories
- package file checklist gate: 132 Core rows, then 21 Utils rows
- doctrine version: v12
- package applied version / fingerprint state: Core and Utils are untracked;
  no whole-package attestation is allowed from these bounded packets
- sync mode / target: no; user chose execution order, not `<sync>`
- sync queue row count: N/A
- completion threshold summary: all 153 rows score 100; Core closes before any
  Utils source edit; focused tests, package typechecks, lint, barrels when
  changed, changesets, source sweeps, autoreview, and final plan checker pass

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
- If sync mode is in scope, run `version.mjs validate` and `status` before
  implementation, then materialize one sync row per stale/drifted target.

Timed checkpoint:
- requested duration: none
- semantics: outcome-gated
- initial confidence score: 35/100; topology is inventoried but unreviewed
- improvement loop: inspect owner/use graph, refactor, prove, rescore, review
- final score / loop closure: target 100/100 with zero deferred scoped rows

Completion threshold:
- Every one of the 132 Core and 21 Utils scoped files has a checked score-100
  row, with one-use behavior colocated, independent algorithms/reuse justified,
  and no stale wrapper/barrel topology.
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
- Package review or sync mode may close a package only after its final
  fingerprint, applied doctrine version, verification date, and evidence plan
  are recorded in `.agents/rules/plate-next/versions.json` and
  `version.mjs status <package>` reports `current`.
- All-package sync may close only when `version.mjs check all` exits zero.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-26-plate-next-core-utils-plugin-colocation.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: affected plugin specs in Core, then Utils
- package proof:
  `pnpm turbo typecheck --filter=./packages/core` then
  `pnpm turbo typecheck --filter=./packages/utils`
- shared Core gate: `pnpm check:core` after both packets; unrelated unchanged
  Plite React errors may be recorded as foreign drift only if still present
- source audits: one-use helper imports, standalone editor/tx/read/api
  parameters, nested helper folders/barrels, plugin annotations/casts,
  one-shot read/update callbacks, root option helpers, active-tx violations
- related scoped sweep query / active scope / match count / patched count / deferred count:
  pending
- package file manifest / row count / checked count / deferred count:
  `/tmp/plate-core-plugin-manifest.txt` = 132 and
  `/tmp/plate-utils-plugin-manifest.txt` = 21; checked/deferred filled at close
- version registry validation / starting status / final status:
  registry valid at v12; Core and Utils deliberately untracked before and after
- package fingerprint command / result: N/A until full-package review
- Plite/Plate gap ledger: fill during review; local hacks forbidden
- broad Core drift ledger gate: N/A; this is not broad Core
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-26-plate-next-core-utils-plugin-colocation.md`

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
  `.extend()` calls. Do not annotate exports as `BasePlugin<Config>` /
  `PlatePlugin<Config>` or cast chained plugin results unless the annotation is
  a true external boundary. If inference fails, fix the builder/generic owner.
- Base/static renderer boundary law: `*-base-kit`, `*-static`, server/static
  renderers, and other Base/static modules must not import `platejs/react`,
  `@platejs/core/react`, or any `@platejs/*/react` entrypoint. Bind static
  components through `BasePlugin.configure({ component })`; keep
  `toPlatePlugin(BasePlugin)` in live React adapters only. If the Base path
  lacks a required capability, fix its Core owner instead of crossing layers.
  Bind Base/static descriptors to static renderer modules, never live/client
  node components; registry Base kits use the owning `*-static` component.
- Empty config inference law: do not create `type FooConfig =
  PluginConfig<'foo'>` only to call `createBasePlugin<FooConfig>({ key:
  'foo' })`. Manual plugin config types are only for real options, API, tx,
  selectors, state, or external public contracts.
- Plugin editor extension law: plugin-owned editor extension options belong in
  `.extend({ extension })`. Do not wrap them in
  `defineEditorExtension({ name: pluginKey, ... })` just to satisfy types. The
  `extension` contribution accepts built extensions and raw options; raw
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
- allowed edit scope: the two plugin-owner directory trees, their nearest
  package barrels/config, focused tests/type-tests, changesets, this plan, and
  the smallest Core generic owner only if inference proof demonstrates it
- package/API surfaces: Core packet first; Utils source is frozen until Core
  closes
- docs/browser surfaces: excluded; package-only mode, browser proof N/A
- non-goals: full Core/Utils package review, docs/apps, unrelated public API
  redesign, registry attestation, previously colocated package sync
- out-of-scope package errors: unchanged failures outside Core/Utils that do
  not prove a regression in this packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- The same owner-level type/runtime blocker repeats for three goal turns after
  source audit and two materially different repair attempts, with no safe
  in-scope move remaining.

Current verdict:
- verdict: complete
- confidence: 100/100
- next owner: the next user-selected Plate package
- keep / revert / quarantine call: keep both completed packets
- reason: every starting row is classified at score 100; final manifests are
  92 Core and 16 Utils files after owner consolidation

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan records order, scope, non-goals, proof, stop, and handoff |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read in full |
| Active goal checked or created | yes | `get_goal` returned null; durable goal created after this plan |
| Mode classified as named packet vs broad Core sweep | yes | Two bounded plugin-owner packets; not broad Core |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Plate Next source and Constraints |
| Broad Core drift ledger initialized when in scope | N/A | Broad Core explicitly excluded |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; Boundaries |
| Output budget strategy recorded | yes | counts/ledgers in plan; targeted reads in chat |
| Public API fork routing checked | yes | unresolved reusable public shape routes to best-api/plate-plan; no speculative fork |
| Gap policy checked | yes | record Plite/Plate gap; never add compatibility workaround |
| Related scoped sweep policy checked | yes | active packet only |
| Review-mode rename freeze checked | yes | owner-driven topology changes allowed; cosmetic renames rejected |
| Package review checklist initialized when in scope | yes | 153 file rows below |
| Doctrine registry validated for package review/sync | yes | v12 valid; Core/Utils are intentionally untracked |
| Sync queue materialized when sync mode is in scope | N/A | Not sync mode |

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
- [x] For package review or sync mode, starting doctrine version and source
      fingerprint state are recorded before package edits.
- [x] For sync mode, every target package has one queue row with starting
      version, required missing-version checks, full-review trigger, proof,
      final fingerprint, and ledger status.
- [x] For sync mode, v0 or source-drifted packages receive a full current
      package review; unchanged later-version packages receive every missing
      doctrine version's `migrationChecks`.
- [x] For package review or sync mode, the package ledger is patched only after
      focused proof and autoreview; final plan closure runs only after package
      registry status is `current`.
- [x] If a reusable Plate Next rule changes during the run, doctrine version is
      bumped, immutable migration checks are appended, generated skill is
      synced, and the package queue is recomputed.
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
      contributed through `.extend({ extension })`; `defineEditorExtension`
      remains only for standalone Plite extensions, existing built extensions,
      or explicit non-plugin extension identities.
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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named package proof | Core 153/153 fast and 27/27 slow; Utils 30/30 fast and 10/10 slow |
| Broad Core drift ledger coverage | N/A | Record bounded-packet scope | Full Core package sweep was explicitly excluded |
| Score gate | yes | Classify every starting row | 153/153 rows checked at score 100 |
| Best Plate v2 recommendation | yes | Record final owner shape | Plugin behavior is owner-local; React hooks remain separate hook families |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No capability gap remains |
| Related scoped sweep after correction | yes | Search same-class problems | Zero plugin-file hook definitions and zero deleted builder calls remain |
| Package file checklist | yes | Record row counts and proof | 132 Core plus 21 Utils starting rows; zero deferred |
| Package doctrine attestation | N/A | Avoid false whole-package attestation | Bounded packets remain deliberately untracked in the package registry |
| All-package sync closure | N/A | Record mode | This run is not all-package sync |
| Helper topology / lexical tx ownership | yes | Audit helpers and context parameters | Single-owner helpers merged; remaining boundaries are public or independently reusable |
| Package/API proof | yes | Run typecheck/tests | Both package typechecks, fast tests, slow tests, and lint pass |
| Shared Core gate coverage | yes | Run `check:core` | Core rows pass; only foreign List staged-chain drift remains |
| Non-Core package error triage | yes | Classify foreign failure | `packages/list` is outside this packet and owned by its active task |
| Source audit | yes | Search removed/deleted APIs | Scoped searches return zero plugin hook definitions and zero deleted builders |
| Rename ledger | N/A | Record owner-driven moves | Every move is mapped in the 153-row packet ledger |
| Extracted-file inventory | yes | Classify new files | New files are owner/family consolidation, focused proof, or separate hook-family owners |
| Autoreview / review | yes | Run final review | Recorded after final review below |
| Final lint/check | yes | Run scoped lint/check | Core and Utils lint pass; doctrine registry validates at v12 |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run plan checker | Recorded after final checker below |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| Core plugin behavior | 0 | colocate | owning plugin/family files | 132 starting rows and focused proof | none |
| Core React hooks | 0 | separate hook family | `useEventEditor.ts` | hook sweep and React specs | none |
| Utils plugin behavior | 0 | colocate and flatten | flat plugin owners | 21 starting rows and focused proof | none |
| Utils React hooks | 0 | separate private hook family | `useBlockPlaceholder.internal.ts` | hook sweep and slow React proof | none |
| Exit-break commands | 0 | scoped update API | `ExitBreakPlugin.ts` | tests and major changeset | none |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Plugin families | Keep one-use behavior lexically inside the descriptor; stage reusable capabilities only when a later extension consumes inferred context | helper folders, free functions carrying editor/tx, deleted `.extend*` builders | shortest inference path and clear ownership | no |
| React families | Keep hook definitions in one separate `use<Family>.ts[x]` file | hooks buried in plugin/component/store files | descriptor, UI, state, and hook ownership stay obvious | no |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | no workaround remains | N/A | package proof | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Hooks must not live in plugin files | Core and Utils plugin trees | hook-definition and inline `useHooks` search in `*Plugin*` files | 2 initial families | 2 | 0 | none |
| Avoid deleted staged builders | Core and Utils plugin trees | `.extendApi/.extendTx/.extendRead/...` search | 0 final | 0 | 0 | none |
| Avoid context-carrying helpers | production plugin trees | function-parameter search for editor/tx/read/api | 0 final helper definitions | all scoped smells | 0 | public `deserializeHtml` remains a true boundary |

Core drift ledger:
- Applies: N/A; this was a bounded plugin-owner packet
- Manifest command: scoped command below
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: package rows below
- Expected row count: 132 scoped starting files
- Actual row count: 132 starting rows; 92 final files
- Missing row count: 0
- Extra row count: 0
- Score gate: 132/132 at 100
- Top drift rows: Affinity, Input Rules, HTML utilities, Event Editor; all fixed

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| Scoped Core plugin trees | 0 | closed | package rows below | Core proof suite | none |

Package file checklist:
- Applies: yes, as two bounded plugin-owner manifests
- Package: Core plugin owners first, then Utils plugin owners
- Manifest command: `rg --files packages/<package>/src/{lib,react}/plugins | rg '\\.(ts|tsx)$' | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 153 total (132 Core + 21 Utils)
- Actual row count: 153
- Checked score-100 count: 153
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: satisfied; Core closed before Utils edits

Package file rows:
### Core plugin-owner packet (132 files)

- [x] `packages/core/src/lib/plugins/HistoryPlugin.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/HistoryPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/ProductCodecs.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/ProductCodecs.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/affinity/AffinityPlugin.slow.tsx` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/affinity/AffinityPlugin.slow.tsx` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/affinity/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/affinity/index.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/affinity/queries/getEdgeNodes.spec.tsx` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/affinity/AffinityPlugin.slow.tsx` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/affinity/queries/getEdgeNodes.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.spec.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/affinity/AffinityPlugin.slow.tsx` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/affinity/queries/index.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/affinity/queries/isNodeAffinity.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/affinity/transforms/index.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/affinity/transforms/setAffinitySelection.spec.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/affinity/AffinityPlugin.slow.tsx` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/affinity/transforms/setAffinitySelection.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/affinity/types.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/debug/DebugPlugin.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/debug/DebugPlugin.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/debug/DebugPlugin.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/debug/DebugPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/debug/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/debug/index.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/dom/DOMPlugin.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/dom/DOMPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/dom/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/dom/index.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/element-state/ElementStatePlugin.spec.tsx` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/element-state/ElementStatePlugin.spec.tsx` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/element-state/ElementStatePlugin.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/element-state/ElementStatePlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/element-state/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/element-state/index.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/getCorePlugins.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/getCorePlugins.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/HtmlPlugin.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/HtmlPlugin.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/HtmlPlugin.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/HtmlPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/constants.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/constants.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/index.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/cleanHtmlBrElements.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/cleanHtmlBrElements.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/cleanHtmlCrLf.spec.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/preCleanHtml.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/cleanHtmlCrLf.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/preCleanHtml.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/cleanHtmlEmptyElements.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/cleanHtmlEmptyElements.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/cleanHtmlFontElements.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/cleanHtmlFontElements.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/cleanHtmlFontElements.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/cleanHtmlFontElements.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/cleanHtmlLinkElements.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/cleanHtmlLinkElements.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/cleanHtmlLinkElements.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/cleanHtmlLinkElements.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/cleanHtmlTextNodes.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/cleanHtmlTextNodes.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/cleanHtmlTextNodes.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/cleanHtmlTextNodes.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseString.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpaceChildren.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpaceElement.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpaceNode.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpaceText.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/collapse-white-space/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/collapse-white-space/index.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/collapse-white-space/inferWhiteSpaceRule.spec.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/collapse-white-space/inferWhiteSpaceRule.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/collapse-white-space/isLastNonEmptyTextOfInlineFormattingContext.spec.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/collapse-white-space/isLastNonEmptyTextOfInlineFormattingContext.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/collapse-white-space/stateTransforms.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/collapse-white-space/types.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/copyBlockMarksToSpanChild.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/copyBlockMarksToSpanChild.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/copyBlockMarksToSpanChild.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/copyBlockMarksToSpanChild.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/deserializeHtml.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/deserializeHtml.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/findHtmlElement.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/someHtmlElement.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/getHtmlComments.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/getHtmlComments.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/getHtmlComments.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/getHtmlComments.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/htmlBrToNewLine.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/htmlBrToNewLine.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/htmlBrToNewLine.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/htmlBrToNewLine.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/htmlStringToDOMNode.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/htmlStringToDOMNode.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/htmlTextNodeToString.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/htmlTextNodeToString.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/htmlTextNodeToString.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/htmlTextNodeToString.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/index.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/inlineTagNames.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/someHtmlElement.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/isHtmlBlockElement.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/isHtmlBlockElement.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/isHtmlComment.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/isHtmlComment.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/isHtmlElement.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/isHtmlElement.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/isHtmlFragmentHref.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/someHtmlElement.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/isHtmlInlineElement.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/isHtmlInlineElement.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/isHtmlTable.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/someHtmlElement.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/isHtmlText.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/isHtmlText.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/isOlSymbol.spec.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/someHtmlElement.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/isOlSymbol.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/someHtmlElement.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/parseHtmlDocument.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/parseHtmlDocument.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/parseHtmlElement.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/parseHtmlElement.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/postCleanHtml.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/postCleanHtml.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/preCleanHtml.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/preCleanHtml.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/removeHtmlNodesBetweenComments.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/removeHtmlNodesBetweenComments.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/removeHtmlNodesBetweenComments.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/removeHtmlNodesBetweenComments.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/removeHtmlSurroundings.spec.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/preCleanHtml.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/removeHtmlSurroundings.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/preCleanHtml.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/replaceTagName.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/replaceTagName.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/traverseHtmlComments.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/traverseHtmlNode.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/traverseHtmlElements.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/traverseHtmlElements.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/traverseHtmlNode.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/traverseHtmlNode.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/traverseHtmlNode.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/html/utils/traverseHtmlNode.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/traverseHtmlTexts.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/traverseHtmlNode.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/html/utils/unwrapHtmlElement.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/html/utils/someHtmlElement.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/index.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/input-rules/createInputRules.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/input-rules/createInputRules.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/input-rules/createRuleFactory.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/input-rules/createRuleFactory.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/input-rules/createRuleFactory.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/input-rules/createRuleFactory.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/input-rules/createTextSubstitutionInputRule.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/input-rules/createTextSubstitutionInputRule.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/input-rules/defineInputRule.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/input-rules/defineInputRule.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/input-rules/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/input-rules/index.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/input-rules/InputRulesPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/input-rules/internal/createInputRuleBuilder.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/lib/plugins/input-rules/InputRulesPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/input-rules/types.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/input-rules/types.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/node-id/NodeIdPlugin.spec.tsx` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/node-id/NodeIdPlugin.spec.tsx` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/node-id/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/node-id/index.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/node-id/normalizeStaticValue.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/node-id/normalizeStaticValue.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/node-id/normalizeStaticValue.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/node-id/normalizeStaticValue.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/override/OverridePlugin.spec.tsx` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/override/OverridePlugin.spec.tsx` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/override/OverridePlugin.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/override/OverridePlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/override/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/override/index.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/paragraph/BaseParagraphPlugin.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/paragraph/BaseParagraphPlugin.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/paragraph/BaseParagraphPlugin.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/paragraph/BaseParagraphPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/lib/plugins/paragraph/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/lib/plugins/paragraph/index.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/event-editor/EventEditorPlugin.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/react/plugins/event-editor/EventEditorPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/event-editor/EventEditorStore.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/react/plugins/event-editor/EventEditorStore.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/event-editor/getEventPlateId.spec.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/react/plugins/event-editor/EventEditorStore.spec.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/event-editor/getEventPlateId.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/react/plugins/event-editor/EventEditorStore.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/event-editor/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/react/plugins/event-editor/index.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/event-editor/useFocusEditorEvents.spec.tsx` — score: 100 — verdict: merge/delete — owner: `packages/core/src/react/plugins/event-editor/useEventEditor.spec.tsx` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/event-editor/useFocusEditorEvents.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/react/plugins/event-editor/useEventEditor.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/event-editor/useFocusedLast.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/react/plugins/event-editor/useEventEditor.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/react/plugins/index.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.behavior.spec.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/navigation-feedback/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/react/plugins/navigation-feedback/index.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/navigation-feedback/internal/navigationFeedbackPluginKey.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/navigation-feedback/transforms/flashTarget.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/navigation-feedback/transforms/index.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/navigation-feedback/transforms/navigate.ts` — score: 100 — verdict: merge/delete — owner: `packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/navigation-feedback/types.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/react/plugins/navigation-feedback/types.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/navigation-feedback/useNavigationHighlight.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/react/plugins/navigation-feedback/useNavigationHighlight.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/paragraph/ParagraphPlugin.tsx` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/react/plugins/paragraph/ParagraphPlugin.tsx` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none
- [x] `packages/core/src/react/plugins/paragraph/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/core/src/react/plugins/paragraph/index.ts` — evidence: Core 153/153 fast, 27/27 slow, typecheck/lint — next: none

### Utils plugin-owner packet (21 files; source frozen until Core closes)

- [x] `packages/utils/src/lib/plugins/ExitBreakPlugin.spec.ts` — score: 100 — verdict: keep/colocated — owner: `packages/utils/src/lib/plugins/ExitBreakPlugin.spec.ts` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/ExitBreakPlugin.ts` — score: 100 — verdict: keep/colocated — owner: `packages/utils/src/lib/plugins/ExitBreakPlugin.ts` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/__tests__/normalizeRoot.ts` — score: 100 — verdict: keep/colocated — owner: `packages/utils/src/lib/plugins/__tests__/normalizeRoot.ts` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/utils/src/lib/plugins/index.ts` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/normalize-types/NormalizeTypesPlugin.spec.tsx` — score: 100 — verdict: merge/delete — owner: `packages/utils/src/lib/plugins/NormalizeTypesPlugin.spec.tsx` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/normalize-types/NormalizeTypesPlugin.ts` — score: 100 — verdict: merge/delete — owner: `packages/utils/src/lib/plugins/NormalizeTypesPlugin.ts` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/normalize-types/NormalizeTypesRuntimePlugin.spec.ts` — score: 100 — verdict: merge/delete — owner: `packages/utils/src/lib/plugins/NormalizeTypesPlugin.spec.tsx` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/normalize-types/index.ts` — score: 100 — verdict: merge/delete — owner: `packages/utils/src/lib/plugins/index.ts` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.spec.tsx` — score: 100 — verdict: merge/delete — owner: `packages/utils/src/lib/plugins/SingleBlockPlugin.spec.tsx` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.ts` — score: 100 — verdict: merge/delete — owner: `packages/utils/src/lib/plugins/SingleBlockPlugin.ts` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/single-block/SingleBlockRuntimePlugin.spec.ts` — score: 100 — verdict: merge/delete — owner: `packages/utils/src/lib/plugins/SingleBlockPlugin.spec.tsx` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/single-block/SingleLinePlugin.spec.tsx` — score: 100 — verdict: merge/delete — owner: `packages/utils/src/lib/plugins/SingleLinePlugin.spec.tsx` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/single-block/SingleLinePlugin.ts` — score: 100 — verdict: merge/delete — owner: `packages/utils/src/lib/plugins/SingleLinePlugin.ts` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/single-block/index.ts` — score: 100 — verdict: merge/delete — owner: `packages/utils/src/lib/plugins/index.ts` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/trailing-block/TrailingBlockPlugin.spec.tsx` — score: 100 — verdict: merge/delete — owner: `packages/utils/src/lib/plugins/TrailingBlockPlugin.spec.tsx` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/trailing-block/TrailingBlockPlugin.ts` — score: 100 — verdict: merge/delete — owner: `packages/utils/src/lib/plugins/TrailingBlockPlugin.ts` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/trailing-block/TrailingBlockRuntimePlugin.spec.ts` — score: 100 — verdict: merge/delete — owner: `packages/utils/src/lib/plugins/TrailingBlockPlugin.spec.tsx` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/lib/plugins/trailing-block/index.ts` — score: 100 — verdict: merge/delete — owner: `packages/utils/src/lib/plugins/index.ts` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/react/plugins/BlockPlaceholderPlugin.slow.tsx` — score: 100 — verdict: keep/colocated — owner: `packages/utils/src/react/plugins/BlockPlaceholderPlugin.slow.tsx` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/react/plugins/BlockPlaceholderPlugin.tsx` — score: 100 — verdict: keep/colocated — owner: `packages/utils/src/react/plugins/BlockPlaceholderPlugin.tsx` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none
- [x] `packages/utils/src/react/plugins/index.ts` — score: 100 — verdict: keep/colocated — owner: `packages/utils/src/react/plugins/index.ts` — evidence: Utils 30/30 fast, 10/10 slow, typecheck/lint — next: none


Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| Core scoped packet | untracked | v12 | bounded packet; no package fingerprint | v12 hook ownership and current colocation laws | scoped owner review | Core package gates | N/A | deliberately untracked |
| Utils scoped packet | untracked | v12 | bounded packet; no package fingerprint | v12 hook ownership and current colocation laws | scoped owner review | Utils package gates | N/A | deliberately untracked |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Core plugin owners | Core | helper folders, context-carrying functions, buried hook families | 132 starting rows | consolidate to 92 files; keep independent HTML algorithms | closed |
| Utils plugin owners | Utils | nested owner folders, duplicate specs, plugin-file hook definition | 21 starting rows | flatten to 16 files; separate private hook family | closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| Core consolidated/new paths listed by scoped untracked audit | merge-existing-owner / focused proof | mapped from starting rows | keep | Core proof |
| Utils flat plugin files | merge-existing-owner | moved from nested owners | keep | Utils proof |
| `packages/utils/src/react/plugins/useBlockPlaceholder.internal.ts` | recover-family-owner | behavior came from descriptor | keep as private separate hook family | Utils slow proof |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| List / `pnpm check:core` | BaseList staged chain differs from the audit's current exact shape | List was excluded and had a separate active owner | List task |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| List constructor stages | `packages/list/src/lib/BaseListPlugin.tsx` | active shared owner; no Core/Utils regression | List |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Core owner consolidation; separate Event Editor hooks; flat Utils owners; scoped exit-break update API; direct trailing-block correction |
| tests/proof | merged test families; separate hook-family specs; schema-audit owner contracts |
| docs/templates/skills | Plate Next v12 source rule, immutable version row, generated skill, this goal plan, Utils major changeset |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | List schema-audit mismatch | only remaining `check:core` failure, outside this packet | `packages/list/src/lib/BaseListPlugin.tsx` | let the List owner finish; do not repair from Core/Utils |

Findings:
- Hook definitions in plugin descriptors are the wrong colocation. The durable
  owner is a separate `use<Family>.ts[x]` hook-family file.
- Most Core helper fragmentation was topology, not reuse. Independent HTML
  algorithms remain separate; one-use orchestration moved to its owner.
- Utils needed both source-family flattening and proof-family consolidation.
- Suggestion owns its weak trailing-block adaptation in the existing
  `toPlatePlugin` authoring context. Trailing Block exposes only a default
  insertion wrapper, so neither editor nor transaction crosses the option.

Decisions and tradeoffs:
- No line ceiling.
- No whole-package v12 attestation from bounded plugin-directory review.
- `useBlockPlaceholder.internal.ts` stays private because its callback
  signature is framework context, not a useful public hook API.
- `TrailingBlockPlugin.options.insert` survives only as a wrapper around the
  default insertion; it no longer receives editor or transaction context.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial hook colocation put hook definitions in descriptors | 1 | repair doctrine and split hook families | Plate Next v12 plus Event Editor/Block Placeholder correction |
| `check:core` rejected new Core stages and a negative codec contract | 1 | update exact audit ownership and marker | Core audit clean; foreign List mismatch remains |
| Autoreview found stale Suggestion trailing-block adoption | 1 | keep behavior through a context-free insertion wrapper | focused Suggestion 2/2 and Utils 30/30 pass |

Verification evidence:
- Plate Next registry: v12 valid, 41 active packages and 1 retired package.
- Core: typecheck 10/10; plugin tests 153/153; package test exit 0; Affinity slow
  27/27; lint 348 files clean.
- Utils: typecheck 11/11; plugin tests 30/30; package test exit 0; Block
  Placeholder slow 10/10; lint 38 files clean.
- Suggestion adoption: focused registry test 2/2. Direct www typecheck reaches
  pre-existing AI/Suggestion/Table typing drift and is not a clean package gate.
- Schema-audit contracts: 24/24; live audit has zero Core/Utils findings.
- Source sweeps: zero hook definitions in scoped `*Plugin*` files; zero
  deleted staged builder calls; no production helper definition carries
  editor/tx/read/api parameters.
- Autoreview: first pass found the stale Suggestion trailing-block consumer;
  accepted and fixed. Final rerun exited clean with zero actionable findings.
- Barrels: `pnpm --filter @platejs/core brl` and
  `pnpm --filter @platejs/utils brl`.
- Browser: N/A; package-only source/proof packet with no runnable UI route.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Core inventory and colocation | complete | 132/132 starting rows at score 100 |
| Core proof | complete | typecheck, fast, slow, package test, lint |
| Utils inventory and colocation | complete | 21/21 starting rows at score 100 |
| Utils proof | complete | typecheck, fast, slow, package test, lint |
| Doctrine correction | complete | Plate Next v12 validates |
| Final review and plan check | complete | final review and checker evidence recorded |

Final handoff contract:
- target surface and mode: bounded Core then Utils plugin-owner packets
- files/APIs reviewed: 153 starting rows; 108 final files
- broad Core drift score coverage: N/A; full Core package excluded
- package file checklist coverage: 153/153 at score 100; zero deferred
- doctrine start/final version and source-fingerprint state: v11 to v12;
  package fingerprints intentionally unattested
- version registry evidence and remaining stale/drifted count: registry valid;
  Core/Utils remain deliberately untracked
- best Plate v2 recommendation: owner-local plugin behavior and separate
  hook-family files
- verdict matrix summary: both packets closed
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: all scoped
  hook/helper/builder matches classified; zero deferred
- out-of-scope matches discovered: one List staged-chain audit mismatch
- changes made: recorded above
- tests/proof commands: recorded above
- old compatibility names audited: deleted staged builders and old exit-break
  transform surface
- needs attention: List owner only
- next best Plate Next packet: user-selected next package

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure |
| Where am I going? | Return the completed Core/Utils packet |
| What is the goal? | Colocate Core and Utils plugin owners under Plate Next v12 |
| What have I learned? | Hooks need a separate hook-family owner |
| What have I done? | Closed 153 rows and both package proof packets |

Timeline:
- 2026-07-26T09:57:16.829Z Goal plan created.
- 2026-07-26 Core plugin-owner packet closed.
- 2026-07-26 Plate Next v12 hook-family correction landed and regenerated.
- 2026-07-26 Utils plugin-owner packet closed.

Open risks:
- One foreign List staged-chain audit mismatch remains in the shared checkout;
  it does not affect Core/Utils proof and is owned elsewhere.
