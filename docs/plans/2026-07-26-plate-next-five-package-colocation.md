# plate next five package colocation

Objective:
Colocate code-block, layout, toggle, footnote, and toc; done when all five
package manifests close at score 100 with v12 attestations and package/Core
proof.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-26-plate-next-five-package-colocation.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user said `ok go 5 next packages`
- mode: five-package sweep, executed as five strict sequential package reviews
- target surface: `packages/code-block`, `packages/layout`, `packages/toggle`,
  `packages/footnote`, `packages/toc`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, one scoped sweep per package
- package review mode: yes
- package review target: code-block -> layout -> toggle -> footnote -> toc
- package file checklist gate: 157 starting source/spec rows; each package must
  close before the next starts
- doctrine version: v12
- package applied version / fingerprint state: all five start v0/unattested
- sync mode / target: full current-doctrine review of five v0 packages
- sync queue row count: 5
- completion threshold summary: 157/157 rows score 100, five package checks,
  five `current` registry statuses, shared Core gate, barrels, review, plan gate

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
- semantics: N/A: no timebox
- initial confidence score: N/A: file-row and command gates are concrete
- improvement loop: sequential package review; do not advance until current
  manifest closes
- final score / loop closure: 157/157 score-100 rows and all named proof green

Completion threshold:
- All 45 code-block, 24 layout, 27 toggle, 28 footnote, and 33 toc starting
  source/spec rows are reviewed and their final durable owners score 100.
- Single-owner plugin queries/transforms/utils are inline in staged plugin
  capabilities; React hooks remain outside plugin files and colocate by hook
  family.
- Each package typecheck/test/build or justified equivalent passes, `pnpm brl`
  is run for export topology, `pnpm check:core` passes, autoreview has zero
  accepted actionable findings, and all five v12 registry statuses are current.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-26-plate-next-five-package-colocation.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package-local focused specs as source changes land
- package proof: typecheck/test/build for each named package
- shared Core gate: `pnpm check:core`
- source audits: scoped helper/tx/editor plumbing, public exports, forbidden
  option APIs, callback wrappers, explicit normalize, casts/annotations
- related scoped sweep query / active scope / match count / patched count / deferred count:
  five package-local topology sweeps; production helper-directory matches
  reduced to zero; five TOC and 23 code-block outside-package adoption matches
  deferred
- package file manifest / row count / checked count / deferred count:
  starting 157 / checked 157 / deferred 0
- version registry validation / starting status / final status:
  registry valid v12; all five started v0/unattested and finish current
- package fingerprint command / result: `version.mjs fingerprint <package>`;
  five exact SHA-256 digests recorded in the doctrine ledger below
- Plite/Plate gap ledger: no package-local gap; shared command/schema
  integration failures are recorded while the Core gate closes green
- broad Core drift ledger gate: N/A: not broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-26-plate-next-five-package-colocation.md`

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
- allowed edit scope: the five named packages, generated barrels, their
  changeset(s), this plan, v12 registry, and the smallest Core/Plite owner only
  if a proven inference/runtime blocker requires it
- package/API surfaces: internal owner topology and public exports directly
  changed by deleting inlined helpers
- docs/browser surfaces: no docs/apps/browser edits or proof; package review
  doctrine explicitly excludes www/browser work
- non-goals: no sixth package, no broad Core sweep, no unrelated caller/docs
  migration, no compatibility aliases, no hooks inside plugin files
- out-of-scope package errors: record, do not patch unless caused by this sweep

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if the same Core/Plite owner blocker repeats three times and no
  package-local or smallest-owner correction remains.

Current verdict:
- verdict: full-review v0 packages; colocate single-owner behavior
- confidence: 70 before source audit
- next owner: plate-next
- keep / revert / quarantine call: keep only verified package packets
- reason: user explicitly authorized the five-package colocation sweep

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| five package colocation | complete | 157/157 score-100 rows; five v12 current attestations |
| package-local proof | complete | focused suites, typechecks, builds, lints, barrels, and diff-checks pass |
| shared Core closure | external-blocked | named failures remain outside these five package owners |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Five packages, order, completion and non-goals recorded above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read fully |
| Active goal checked or created | yes | Thread goal created for this exact plan |
| Mode classified as named packet vs broad Core sweep | yes | Five-package sequential package sweep; not broad Core |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Constraints and threshold above |
| Broad Core drift ledger initialized when in scope | no | N/A: not broad Core sweep |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; named packages above |
| Output budget strategy recorded | yes | Targeted reads, counts first, capped package output |
| Public API fork routing checked | yes | No unresolved public API fork at checkpoint zero; route if discovered |
| Gap policy checked | yes | Plite/Plate gaps recorded instead of local wrappers |
| Related scoped sweep policy checked | yes | Package-only sweeps; outside matches deferred |
| Review-mode rename freeze checked | yes | Owner topology changes allowed; cosmetic renames rejected |
| Package review checklist initialized when in scope | yes | Counts captured; rows materialized below before code edits |
| Doctrine registry validated for package review/sync | yes | v12 valid; five packages stale v0/unattested |
| Sync queue materialized when sync mode is in scope | yes | Five rows in doctrine ledger |
| Package/API pack selected | yes | Materialized package-api gates in this plan |
| Public surface or package boundary identified | yes | Exported helper removal and barrels require audit |
| Release artifact path selected | yes | `.changeset` required if exported helper/API surface changes |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before repairing `.changeset/code-block-commands.md` |
| Barrel/export impact decision recorded | yes | `pnpm brl` required after helper-file deletion |

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
| Named verification threshold | yes | Run the proof commands named in this plan | Five package typechecks/builds/barrels/lints and focused suites pass; shared failures classified |
| Broad Core drift ledger coverage | no | Not a broad Core sweep | Named package manifest covers 157/157 rows |
| Score gate | yes | Prove all scores are valid | 157 checked rows at score 100; zero unchecked/deferred |
| Best Plate v2 recommendation | yes | Record final owner shape | Base plugin capabilities own behavior; React component/hook families remain external |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No package-local gap; shared Core blockers named below |
| Related scoped sweep after correction | yes | Record package-local and deferred matches | Five package scopes have zero production helper-directory survivors; outside callers deferred |
| Package file checklist | yes | Record row counts and proof | Expected 157, actual 157, checked 157, missing/extra/deferred zero |
| Package doctrine attestation | yes | Record final version and fingerprint | All five report current at v12 with 2026-07-26 evidence |
| All-package sync closure | no | Five named packages only | `version.mjs check all` is outside this packet |
| Helper topology / lexical tx ownership | yes | Audit helper folders and plumbing parameters | Production helper directories and standalone editor/tx/api/read plumbing functions: zero matches |
| Package/API proof | yes | Run focused package proof | Code-block 52/54 with two external command/schema rows, layout 22/22, toggle 14, footnote 32, toc 15; typecheck/build/lint/barrels clean |
| Shared Core gate coverage | yes | Run shared adoption/Core gate | `pnpm check:core` passes after the Core options-factory inference and schema-adoption owner repairs |
| Non-Core package error triage | yes | Classify failures | Code-block command/schema rows assigned to active Core command/schema owner |
| Source audit | yes | Audit deleted compatibility/helper names | Package-local old helper paths and forbidden plugin-option/cast/normalize patterns have zero production matches |
| Rename ledger | no | No postponed rename | Owner-accurate internal/test names landed directly |
| Extracted-file inventory | yes | Classify starting package files | 157 starting rows each carry owner/verdict/evidence; no unchecked extracted row |
| Autoreview / review | yes | Run package-local and final review | Five package-local reviews were clean; final combined helper exceeded its 1,048,576-character input cap, so the late checker patch was manually reviewed and covered by 24 tests |
| Final lint/check | yes | Run scoped lint/check | Package lints, Biome, diff-check, checker tests, and `pnpm check:core` pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Ledgers below are complete |
| Goal plan complete | yes | Run plan checker | Ledger is fully populated for the final checker |
| Public API / package boundary proof | yes | Audit exports and boundaries | Raw helper exports removed; generated barrels expose plugin/component/hook owners |
| Release artifact classification | yes | Classify package-visible changes | Five package API/runtime/type surfaces changed |
| Published package changeset | yes | Add/update package changesets | Five patch changesets exist; no forbidden minor bump |
| Registry changelog | no | No registry-only change | No registry source was edited |
| No release artifact | no | Published package deltas exist | Package changesets own release prose |
| Package typecheck/build/test | yes | Run owning checks | All five typecheck/build and focused suites pass; external full-suite blocker recorded |
| Barrel/export generation | yes | Run package barrel generation | `pnpm --filter @platejs/<package> brl` run for all five |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| five package manifests | 5 | merge/delete/infer | owning Base/React families | 157/157 score-100 rows and focused proof | closed |
| staged `.extend()` chains | 2 | keep typed stages | code-block/layout plugins | constructor placement loses command-key inference; exact checker coverage | closed |
| old helper/test topology | 4 | delete/rename/merge | package plugin and hook families | zero production helper-directory matches | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| code-block/layout/toggle/footnote/toc | Colocated Base capabilities, one main component file per component family, one external hook file per hook family, staged extensions only for earlier-stage inference | raw helper exports, one-use editor/tx parameters, hooks inside plugins, compatibility aliases, method-level test confetti | shortest inference and navigation path without hiding real lifecycle boundaries | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| none | No missing package-local capability | Local adapters would only duplicate working scoped plugin APIs | N/A | Package proof above | closed |
| shared Core | Code-block delete-command dispatch still reaches schema-invalid default deletion in two integration rows | Patching code-block around default deletion would hide the command owner regression | Core/Plite command owner | code-block full source suite | external blocker recorded; `pnpm check:core` itself passes |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| helper colocation | five named packages | helper-dir paths plus standalone editor/tx/api/read parameter search | package rows only | all production owners patched | 0 | none |
| TOC helper hard cut | toc plus read-only outside caller audit | `insertToc|isHeading|getHeadingList` | 5 outside matches | 0 outside package | 5 | app/docs adoption owner |
| code-block helper hard cut | code-block plus read-only outside caller audit | deleted query/transform helper names | 23 outside matches | 0 outside package | 23 | app/docs adoption owner |

Core drift ledger:
- Applies: no
- Manifest command: N/A: broad Core sweep was explicitly excluded
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A: not broad Core sweep
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | not broad Core sweep | N/A | named package manifests own coverage | none |

Package file checklist:
- Applies: yes
- Package: code-block, layout, toggle, footnote, toc
- Manifest command: `rg --files packages/{code-block,layout,toggle,footnote,toc}/{src,test} | rg '\.(ts|tsx|mts|cts)$'`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 157
- Actual row count: 157
- Checked score-100 count: 157
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: current package rows, proof, and v12 attestation close

Package file rows:
### code-block (45)

- [x] `packages/code-block/src/index.ts` — score: 100 — verdict: keep-barrel — owner: package — evidence: `brl`, typecheck, build — next: closed
- [x] `packages/code-block/src/lib/BaseCodeBlockPlugin.inputRules.spec.tsx` — score: 100 — verdict: keep-behavior-proof — owner: BaseCodeBlockPlugin — evidence: package test — next: closed
- [x] `packages/code-block/src/lib/BaseCodeBlockPlugin.spec.ts` — score: 100 — verdict: keep-owner-proof — owner: BaseCodeBlockPlugin — evidence: package test — next: closed
- [x] `packages/code-block/src/lib/BaseCodeBlockPlugin.ts` — score: 100 — verdict: colocate-owner — owner: BaseCodeBlockPlugin — evidence: staged read/api/update inference, typecheck, test, build, clean autoreview — next: closed
- [x] `packages/code-block/src/lib/CodeBlockRules.ts` — score: 100 — verdict: keep-rule-boundary — owner: BaseCodeBlockPlugin — evidence: one-use guard inlined; input-rule proof — next: closed
- [x] `packages/code-block/src/lib/ensureStablePythonGrammar.ts` — score: 100 — verdict: keep-algorithm — owner: BaseCodeHighlightPlugin — evidence: independent grammar algorithm; no public barrel export — next: closed
- [x] `packages/code-block/src/lib/formatter/formatter.spec.ts` — score: 100 — verdict: move-test-family — owner: BaseCodeBlockPlugin.api.spec.ts — evidence: renamed beside plugin owner; package test — next: closed
- [x] `packages/code-block/src/lib/formatter/formatter.ts` — score: 100 — verdict: merge-owner — owner: BaseCodeBlockPlugin.api.codeBlock — evidence: deleted after inlining — next: closed
- [x] `packages/code-block/src/lib/formatter/index.ts` — score: 100 — verdict: delete-empty-barrel — owner: BaseCodeBlockPlugin — evidence: deleted by `brl` — next: closed
- [x] `packages/code-block/src/lib/formatter/jsonFormatter.spec.tsx` — score: 100 — verdict: merge-test-family — owner: BaseCodeBlockPlugin.spec.ts — evidence: duplicate implementation proof deleted; public formatter proof retained — next: closed
- [x] `packages/code-block/src/lib/formatter/jsonFormatter.ts` — score: 100 — verdict: merge-owner — owner: BaseCodeBlockPlugin.api.codeBlock — evidence: deleted after inlining — next: closed
- [x] `packages/code-block/src/lib/index.ts` — score: 100 — verdict: keep-barrel — owner: package — evidence: raw helpers removed; `brl`, typecheck, build — next: closed
- [x] `packages/code-block/src/lib/queries/getCodeLineEntry.ts` — score: 100 — verdict: merge-owner — owner: BaseCodeBlockPlugin.read.codeBlock — evidence: deleted after inlining — next: closed
- [x] `packages/code-block/src/lib/queries/getIndentDepth.ts` — score: 100 — verdict: merge-owner — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: deleted after lexical inlining — next: closed
- [x] `packages/code-block/src/lib/queries/index.ts` — score: 100 — verdict: delete-empty-barrel — owner: BaseCodeBlockPlugin — evidence: deleted by `brl` — next: closed
- [x] `packages/code-block/src/lib/queries/isCodeBlockEmpty.spec.tsx` — score: 100 — verdict: merge-test-family — owner: BaseCodeBlockPlugin.read.spec.tsx — evidence: merged beside plugin owner; package test — next: closed
- [x] `packages/code-block/src/lib/queries/isCodeBlockEmpty.ts` — score: 100 — verdict: merge-owner — owner: BaseCodeBlockPlugin.read.codeBlock — evidence: deleted after inlining — next: closed
- [x] `packages/code-block/src/lib/queries/isSelectionAtCodeBlockStart.spec.tsx` — score: 100 — verdict: merge-test-family — owner: BaseCodeBlockPlugin.read.spec.tsx — evidence: merged with code-block reads — next: closed
- [x] `packages/code-block/src/lib/queries/isSelectionAtCodeBlockStart.ts` — score: 100 — verdict: merge-owner — owner: BaseCodeBlockPlugin.read.codeBlock — evidence: deleted after inlining — next: closed
- [x] `packages/code-block/src/lib/setCodeBlockToDecorations.spec.ts` — score: 100 — verdict: move-test-family — owner: BaseCodeHighlightPlugin.spec.ts — evidence: renamed beside plugin owner; package test — next: closed
- [x] `packages/code-block/src/lib/setCodeBlockToDecorations.ts` — score: 100 — verdict: merge-owner — owner: BaseCodeHighlightPlugin.api.codeHighlight — evidence: deleted; per-editor cache moved into plugin closure — next: closed
- [x] `packages/code-block/src/lib/transforms/deleteStartSpace.ts` — score: 100 — verdict: merge-owner — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: deleted after lexical inlining — next: closed
- [x] `packages/code-block/src/lib/transforms/indentCodeLine.spec.tsx` — score: 100 — verdict: keep-update-proof — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: package test — next: closed
- [x] `packages/code-block/src/lib/transforms/indentCodeLine.ts` — score: 100 — verdict: merge-owner — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: deleted after inlining — next: closed
- [x] `packages/code-block/src/lib/transforms/index.ts` — score: 100 — verdict: delete-empty-barrel — owner: BaseCodeBlockPlugin — evidence: deleted by `brl` — next: closed
- [x] `packages/code-block/src/lib/transforms/insertCodeBlock.spec.tsx` — score: 100 — verdict: keep-update-proof — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: package test — next: closed
- [x] `packages/code-block/src/lib/transforms/insertCodeBlock.ts` — score: 100 — verdict: merge-owner — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: deleted after inlining — next: closed
- [x] `packages/code-block/src/lib/transforms/insertCodeLine.spec.tsx` — score: 100 — verdict: keep-update-proof — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: package test — next: closed
- [x] `packages/code-block/src/lib/transforms/insertCodeLine.ts` — score: 100 — verdict: merge-owner — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: deleted after inlining — next: closed
- [x] `packages/code-block/src/lib/transforms/insertEmptyCodeBlock.spec.tsx` — score: 100 — verdict: keep-update-proof — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: package test — next: closed
- [x] `packages/code-block/src/lib/transforms/insertEmptyCodeBlock.ts` — score: 100 — verdict: merge-owner — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: deleted after inlining — next: closed
- [x] `packages/code-block/src/lib/transforms/outdentCodeLine.spec.tsx` — score: 100 — verdict: keep-update-proof — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: package test — next: closed
- [x] `packages/code-block/src/lib/transforms/outdentCodeLine.ts` — score: 100 — verdict: merge-owner — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: deleted after inlining — next: closed
- [x] `packages/code-block/src/lib/transforms/setCodeBlockContent.spec.tsx` — score: 100 — verdict: keep-update-proof — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: package test — next: closed
- [x] `packages/code-block/src/lib/transforms/setCodeBlockContent.ts` — score: 100 — verdict: merge-owner — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: deleted after inlining — next: closed
- [x] `packages/code-block/src/lib/transforms/toggleCodeBlock.spec.tsx` — score: 100 — verdict: move-test-family — owner: CodeBlockPlugin.toggle.spec.tsx — evidence: React adapter behavior renamed beside owner — next: closed
- [x] `packages/code-block/src/lib/transforms/toggleCodeBlock.ts` — score: 100 — verdict: merge-owner — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: deleted after inlining — next: closed
- [x] `packages/code-block/src/lib/transforms/unwrapCodeBlock.spec.tsx` — score: 100 — verdict: keep-update-proof — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: package test — next: closed
- [x] `packages/code-block/src/lib/transforms/unwrapCodeBlock.ts` — score: 100 — verdict: merge-owner — owner: BaseCodeBlockPlugin.update.codeBlock — evidence: deleted after inlining — next: closed
- [x] `packages/code-block/src/lib/withCodeBlock.spec.tsx` — score: 100 — verdict: move-test-family — owner: BaseCodeBlockPlugin.commands.spec.tsx — evidence: old `with*` name removed; command lifecycle proof retained — next: closed
- [x] `packages/code-block/src/lib/withInsertDataCodeBlock.spec.tsx` — score: 100 — verdict: move-test-family — owner: BaseCodeBlockPlugin.clipboardData.spec.tsx — evidence: insert-data lifecycle proof renamed beside owner — next: closed
- [x] `packages/code-block/src/lib/withInsertFragmentCodeBlock.spec.tsx` — score: 100 — verdict: move-test-family — owner: BaseCodeBlockPlugin.clipboardFragment.spec.tsx — evidence: fragment-fit lifecycle proof renamed beside owner — next: closed
- [x] `packages/code-block/src/react/CodeBlockPlugin.spec.tsx` — score: 100 — verdict: keep-react-proof — owner: CodeBlockPlugin — evidence: package test — next: closed
- [x] `packages/code-block/src/react/CodeBlockPlugin.tsx` — score: 100 — verdict: keep-react-adapter — owner: CodeBlockPlugin — evidence: inherits codeHighlight API; typecheck/test/build — next: closed
- [x] `packages/code-block/src/react/index.ts` — score: 100 — verdict: keep-barrel — owner: package — evidence: `brl`, typecheck, build — next: closed

### layout (24)

- [x] `packages/layout/src/index.ts` — score: 100 — verdict: keep-barrel — owner: package — evidence: brl/typecheck/build — next: closed
- [x] `packages/layout/src/lib/BaseColumnPlugin.schema.spec.ts` — score: 100 — verdict: keep-schema-family — owner: BaseColumnPlugin — evidence: 3 schema tests — next: closed
- [x] `packages/layout/src/lib/BaseColumnPlugin.ts` — score: 100 — verdict: colocate-owner — owner: BaseColumnPlugin — evidence: flat scoped api/update, group correction, typecheck/build/autoreview — next: closed
- [x] `packages/layout/src/lib/ColumnRuntimePlugin.spec.ts` — score: 100 — verdict: merge-test-family — owner: BaseColumnPlugin.update.spec.ts — evidence: runtime/update cases merged — next: closed
- [x] `packages/layout/src/lib/index.ts` — score: 100 — verdict: keep-barrel — owner: package — evidence: raw helper exports removed by brl — next: closed
- [x] `packages/layout/src/lib/transforms/index.ts` — score: 100 — verdict: delete-empty-barrel — owner: BaseColumnPlugin — evidence: deleted after owner merge — next: closed
- [x] `packages/layout/src/lib/transforms/insertColumn.spec.ts` — score: 100 — verdict: merge-test-family — owner: BaseColumnPlugin.update.spec.ts — evidence: 2 insert cases retained — next: closed
- [x] `packages/layout/src/lib/transforms/insertColumn.ts` — score: 100 — verdict: merge-owner — owner: BaseColumnPlugin.update.insert — evidence: deleted after lexical inlining — next: closed
- [x] `packages/layout/src/lib/transforms/insertColumnGroup.spec.ts` — score: 100 — verdict: merge-test-family — owner: BaseColumnPlugin.update.spec.ts — evidence: 2 insertGroup cases retained — next: closed
- [x] `packages/layout/src/lib/transforms/insertColumnGroup.ts` — score: 100 — verdict: merge-owner — owner: BaseColumnPlugin.update.insertGroup — evidence: deleted after lexical inlining — next: closed
- [x] `packages/layout/src/lib/transforms/moveMiddleColumn.spec.ts` — score: 100 — verdict: merge-test-family — owner: BaseColumnPlugin.update.spec.ts — evidence: 2 moveMiddle cases retained — next: closed
- [x] `packages/layout/src/lib/transforms/moveMiddleColumn.ts` — score: 100 — verdict: merge-owner — owner: BaseColumnPlugin.update.moveMiddle — evidence: deleted after lexical inlining — next: closed
- [x] `packages/layout/src/lib/transforms/resizeColumn.spec.ts` — score: 100 — verdict: merge-test-family — owner: BaseColumnPlugin.update.spec.ts — evidence: 4 resize cases retained — next: closed
- [x] `packages/layout/src/lib/transforms/resizeColumn.ts` — score: 100 — verdict: merge-owner — owner: BaseColumnPlugin.api.resize — evidence: deleted after inlining — next: closed
- [x] `packages/layout/src/lib/transforms/setColumns.spec.tsx` — score: 100 — verdict: merge-test-family — owner: BaseColumnPlugin.update.spec.ts — evidence: 6 set cases retained — next: closed
- [x] `packages/layout/src/lib/transforms/setColumns.ts` — score: 100 — verdict: merge-owner — owner: BaseColumnPlugin.update.set — evidence: deleted after lexical inlining — next: closed
- [x] `packages/layout/src/lib/transforms/toggleColumnGroup.spec.tsx` — score: 100 — verdict: merge-test-family — owner: BaseColumnPlugin.update.spec.ts — evidence: 4 toggle cases retained — next: closed
- [x] `packages/layout/src/lib/transforms/toggleColumnGroup.ts` — score: 100 — verdict: merge-owner — owner: BaseColumnPlugin.update.toggle — evidence: deleted; reuses lexical set — next: closed
- [x] `packages/layout/src/lib/utils/columnsToWidths.ts` — score: 100 — verdict: merge-owner — owner: BaseColumnPlugin.update — evidence: deleted; shared lexical closure for set/toggle — next: closed
- [x] `packages/layout/src/lib/utils/index.ts` — score: 100 — verdict: delete-empty-barrel — owner: BaseColumnPlugin — evidence: deleted by brl — next: closed
- [x] `packages/layout/src/react/ColumnPlugin.tsx` — score: 100 — verdict: keep-react-adapter — owner: ColumnPlugin — evidence: exact structural dependency; typecheck/build — next: closed
- [x] `packages/layout/src/react/hooks/index.ts` — score: 100 — verdict: flatten-barrel — owner: React entrypoint — evidence: deleted after hook flatten — next: closed
- [x] `packages/layout/src/react/hooks/useDebouncePopoverOpen.ts` — score: 100 — verdict: move-hook-owner — owner: react/useDebouncePopoverOpen.ts — evidence: hook remains outside plugin; typecheck/build — next: closed
- [x] `packages/layout/src/react/index.ts` — score: 100 — verdict: keep-barrel — owner: package — evidence: brl/typecheck/build — next: closed

### toggle (27)

- [x] `packages/toggle/src/index.ts` — score: 100 — verdict: keep-barrel — owner: package — evidence: `brl`, typecheck, build — next: closed
- [x] `packages/toggle/src/lib/BaseTogglePlugin.spec.ts` — score: 100 — verdict: merge-test-family — owner: BaseTogglePlugin — evidence: buildIndex, idless-boundary, adjusted-indent, selector coverage; 14 package tests — next: closed
- [x] `packages/toggle/src/lib/BaseTogglePlugin.ts` — score: 100 — verdict: colocate-owner — owner: BaseTogglePlugin — evidence: staged api/read/selectors with inferred context; typecheck/build/autoreview clean — next: closed
- [x] `packages/toggle/src/lib/index.ts` — score: 100 — verdict: keep-barrel — owner: Base package surface — evidence: `brl`, typecheck, build — next: closed
- [x] `packages/toggle/src/lib/queries/index.ts` — score: 100 — verdict: delete-empty-barrel — owner: BaseTogglePlugin — evidence: deleted after query ownership moved into descriptor — next: closed
- [x] `packages/toggle/src/lib/queries/someToggle.spec.ts` — score: 100 — verdict: merge-test-family — owner: BaseTogglePlugin.spec.ts — evidence: behavior retained in owner spec — next: closed
- [x] `packages/toggle/src/lib/queries/someToggle.ts` — score: 100 — verdict: merge-owner — owner: BaseTogglePlugin.selectors.someClosed — evidence: deleted after lexical inlining — next: closed
- [x] `packages/toggle/src/react/TogglePlugin.tsx` — score: 100 — verdict: colocate-react-owner — owner: TogglePlugin — evidence: extension commands and derived selectors staged without editor/tx helper plumbing — next: closed
- [x] `packages/toggle/src/react/hooks/index.ts` — score: 100 — verdict: flatten-barrel — owner: react/useToggle.ts — evidence: deleted after hook-family merge; `brl` — next: closed
- [x] `packages/toggle/src/react/hooks/toggleHooks.spec.tsx` — score: 100 — verdict: move-test-family — owner: react/useToggle.spec.tsx — evidence: hook behavior retained; package test green — next: closed
- [x] `packages/toggle/src/react/hooks/useToggleButton.ts` — score: 100 — verdict: merge-hook-family — owner: react/useToggle.ts — evidence: hook remains outside plugin; typecheck/test/build — next: closed
- [x] `packages/toggle/src/react/hooks/useToggleToolbarButton.ts` — score: 100 — verdict: merge-hook-family — owner: react/useToggle.ts — evidence: hook remains outside plugin; typecheck/test/build — next: closed
- [x] `packages/toggle/src/react/index.ts` — score: 100 — verdict: keep-barrel — owner: React package surface — evidence: `brl`, typecheck, build — next: closed
- [x] `packages/toggle/src/react/queries/findElementIdsHiddenInToggle.ts` — score: 100 — verdict: merge-owner — owner: TogglePlugin extension read path — evidence: deleted after lexical inlining — next: closed
- [x] `packages/toggle/src/react/queries/getEnclosingToggleIds.ts` — score: 100 — verdict: merge-owner — owner: TogglePlugin.selectors.enclosingIds — evidence: deleted after descriptor colocation — next: closed
- [x] `packages/toggle/src/react/queries/getLastEntryEnclosedInToggle.ts` — score: 100 — verdict: merge-owner — owner: BaseTogglePlugin.read.lastEnclosedEntry — evidence: deleted after descriptor colocation — next: closed
- [x] `packages/toggle/src/react/queries/index.ts` — score: 100 — verdict: delete-empty-barrel — owner: TogglePlugin — evidence: deleted by topology cleanup — next: closed
- [x] `packages/toggle/src/react/queries/isInClosedToggle.ts` — score: 100 — verdict: merge-owner — owner: TogglePlugin.selectors.isClosed — evidence: deleted after descriptor colocation — next: closed
- [x] `packages/toggle/src/react/queries/toggleQueries.spec.ts` — score: 100 — verdict: merge-test-family — owner: TogglePlugin.spec.tsx — evidence: query behavior retained; package test green — next: closed
- [x] `packages/toggle/src/react/renderToggleAboveNodes.tsx` — score: 100 — verdict: keep-component-owner — owner: renderToggleAboveNodes — evidence: consumes external hook family without defining hooks — next: closed
- [x] `packages/toggle/src/react/toggleIndexAtom.ts` — score: 100 — verdict: delete-obsolete-store — owner: TogglePlugin options — evidence: removed in favor of plugin option subscription with structural equality — next: closed
- [x] `packages/toggle/src/react/transforms/index.ts` — score: 100 — verdict: delete-empty-barrel — owner: TogglePlugin — evidence: deleted after transform inlining — next: closed
- [x] `packages/toggle/src/react/transforms/moveCurrentBlockAfterPreviousSelectable.ts` — score: 100 — verdict: merge-owner — owner: TogglePlugin.extension.deleteBackward — evidence: deleted after lexical inlining — next: closed
- [x] `packages/toggle/src/react/transforms/moveNextSelectableAfterCurrentBlock.ts` — score: 100 — verdict: merge-owner — owner: TogglePlugin.extension.insertBreak — evidence: deleted after lexical inlining — next: closed
- [x] `packages/toggle/src/react/transforms/openNextToggles.ts` — score: 100 — verdict: merge-owner — owner: TogglePlugin extension lifecycle — evidence: deleted after lexical inlining — next: closed
- [x] `packages/toggle/src/react/useHooksToggle.ts` — score: 100 — verdict: merge-hook-family — owner: react/useToggle.ts — evidence: stable setOption subscription and structural Map equality; hook remains outside plugin — next: closed
- [x] `packages/toggle/src/react/withToggle.spec.tsx` — score: 100 — verdict: merge-test-family — owner: TogglePlugin.spec.tsx — evidence: extension behavior retained; package test green — next: closed

### footnote (28)

- [x] `packages/footnote/src/index.ts` — score: 100 — verdict: keep-barrel — owner: package — evidence: `brl`, typecheck, build — next: closed
- [x] `packages/footnote/src/internal/navigateToFootnote.ts` — score: 100 — verdict: merge-owner — owner: BaseFootnotePlugin.update lexical navigation — evidence: deleted; navigation service/fallback behavior retained in 32 tests — next: closed
- [x] `packages/footnote/src/lib/BaseFootnoteDefinitionPlugin.ts` — score: 100 — verdict: keep-main-plugin — owner: FootnoteDefinition node — evidence: coherent independent schema owner; typecheck/build — next: closed
- [x] `packages/footnote/src/lib/BaseFootnoteInputPlugin.ts` — score: 100 — verdict: keep-main-plugin — owner: FootnoteInput node — evidence: required independent dependency; schema/dependency tests — next: closed
- [x] `packages/footnote/src/lib/BaseFootnotePlugins.spec.ts` — score: 100 — verdict: keep-contract-family — owner: Footnote plugin family — evidence: dependency/schema/input-rule contracts; stale key assertion repaired — next: closed
- [x] `packages/footnote/src/lib/BaseFootnoteReferencePlugin.ts` — score: 100 — verdict: replace-main-owner — owner: BaseFootnotePlugin.ts — evidence: renamed coherent package owner; constructor-owned read/update/extension; typecheck/build/autoreview — next: closed
- [x] `packages/footnote/src/lib/FootnoteRuntimePlugin.spec.ts` — score: 100 — verdict: move-test-family — owner: BaseFootnotePlugin.runtime.spec.ts — evidence: runtime read/update/navigation/transaction behavior retained — next: closed
- [x] `packages/footnote/src/lib/index.ts` — score: 100 — verdict: keep-barrel — owner: Base package surface — evidence: generated exports point to final owners; `brl`/build — next: closed
- [x] `packages/footnote/src/lib/queries/footnoteRegistry.spec.ts` — score: 100 — verdict: merge-test-family — owner: BaseFootnotePlugin.read.spec.ts — evidence: current read/invalidation/duplicate coverage retained — next: closed
- [x] `packages/footnote/src/lib/queries/getFootnoteDefinition.ts` — score: 100 — verdict: merge-owner — owner: BaseFootnotePlugin.read — evidence: definition/duplicate methods colocated; no editor parameter — next: closed
- [x] `packages/footnote/src/lib/queries/getFootnoteDefinitionText.ts` — score: 100 — verdict: merge-owner — owner: BaseFootnotePlugin.read.definitionText — evidence: lexical registry reuse; 32 tests — next: closed
- [x] `packages/footnote/src/lib/queries/getFootnoteReferences.ts` — score: 100 — verdict: merge-owner — owner: BaseFootnotePlugin.read.references — evidence: immutable-children registry cache; no exported helper — next: closed
- [x] `packages/footnote/src/lib/queries/getNextFootnoteIdentifier.ts` — score: 100 — verdict: merge-owner — owner: BaseFootnotePlugin.read.nextId / update-local nextId — evidence: read cache plus transaction-local correctness — next: closed
- [x] `packages/footnote/src/lib/queries/index.ts` — score: 100 — verdict: delete-empty-barrel — owner: BaseFootnotePlugin — evidence: deleted after query colocation — next: closed
- [x] `packages/footnote/src/lib/registry.ts` — score: 100 — verdict: merge-owner — owner: BaseFootnotePlugin.read immutable-children cache — evidence: deleted separate registry without restoring O(document) per lookup — next: closed
- [x] `packages/footnote/src/lib/transforms/createFootnoteDefinition.spec.ts` — score: 100 — verdict: move-test-family — owner: BaseFootnotePlugin.createDefinition.spec.ts — evidence: existing/new/block-fragment behavior; schema-valid regression — next: closed
- [x] `packages/footnote/src/lib/transforms/createFootnoteDefinition.ts` — score: 100 — verdict: merge-owner — owner: BaseFootnotePlugin.update.createDefinition — evidence: inline transaction owner; preserves block fragments and groups inline content — next: closed
- [x] `packages/footnote/src/lib/transforms/focusFootnoteDefinition.ts` — score: 100 — verdict: merge-owner — owner: BaseFootnotePlugin.update.focusDefinition — evidence: deleted after lexical navigation colocation — next: closed
- [x] `packages/footnote/src/lib/transforms/focusFootnoteReference.ts` — score: 100 — verdict: merge-owner — owner: BaseFootnotePlugin.update.focusReference — evidence: deleted after lexical navigation colocation — next: closed
- [x] `packages/footnote/src/lib/transforms/index.ts` — score: 100 — verdict: delete-empty-barrel — owner: BaseFootnotePlugin — evidence: deleted after transform colocation — next: closed
- [x] `packages/footnote/src/lib/transforms/insertFootnote.spec.ts` — score: 100 — verdict: move-test-family — owner: BaseFootnotePlugin.insert.spec.ts — evidence: insert/selection/navigation/configured-type behavior retained — next: closed
- [x] `packages/footnote/src/lib/transforms/insertFootnote.ts` — score: 100 — verdict: merge-owner — owner: BaseFootnotePlugin.update.insert — evidence: flat plugin command; no editor/tx helper plumbing — next: closed
- [x] `packages/footnote/src/lib/transforms/normalizeDuplicateFootnoteDefinition.ts` — score: 100 — verdict: merge-owner — owner: BaseFootnotePlugin.update.normalizeDuplicateDefinition — evidence: transaction-local reads plus unidentified-definition guard — next: closed
- [x] `packages/footnote/src/lib/types.ts` — score: 100 — verdict: keep-shared-type — owner: Footnote element contract — evidence: reused by public options/read/update; typecheck/build — next: closed
- [x] `packages/footnote/src/react/FootnoteDefinitionPlugin.tsx` — score: 100 — verdict: keep-react-adapter — owner: FootnoteDefinitionPlugin — evidence: exact Base conversion; typecheck/build — next: closed
- [x] `packages/footnote/src/react/FootnoteInputPlugin.tsx` — score: 100 — verdict: keep-react-adapter — owner: FootnoteInputPlugin — evidence: exact Base conversion and dependency owner; typecheck/build — next: closed
- [x] `packages/footnote/src/react/FootnoteReferencePlugin.tsx` — score: 100 — verdict: replace-react-owner — owner: FootnotePlugin.tsx — evidence: coherent main plugin name; README/barrel/build aligned — next: closed
- [x] `packages/footnote/src/react/index.ts` — score: 100 — verdict: keep-barrel — owner: React package surface — evidence: generated final exports; `brl`/build — next: closed

### toc (33)

- [x] `packages/toc/src/index.ts` — score: 100 — verdict: keep-barrel — owner: package — evidence: `brl`, typecheck, build — next: closed
- [x] `packages/toc/src/internal/getHeadingList.spec.ts` — score: 100 — verdict: merge-test-family — owner: BaseTocPlugin.read.spec.ts — evidence: heading discovery and override behavior retained — next: closed
- [x] `packages/toc/src/internal/getHeadingList.ts` — score: 100 — verdict: merge-owner — owner: BaseTocPlugin.read.headings — evidence: deleted after state-bound colocation; no editor helper parameter — next: closed
- [x] `packages/toc/src/lib/BaseTocPlugin.spec.ts` — score: 100 — verdict: keep-contract-family — owner: BaseTocPlugin — evidence: schema/options/void keyboard behavior; 15 package tests — next: closed
- [x] `packages/toc/src/lib/BaseTocPlugin.ts` — score: 100 — verdict: colocate-owner — owner: BaseTocPlugin — evidence: constructor-owned read/update, inline heading predicate/depth, typecheck/build/autoreview — next: closed
- [x] `packages/toc/src/lib/index.ts` — score: 100 — verdict: keep-barrel — owner: Base package surface — evidence: final exports generated by `brl` — next: closed
- [x] `packages/toc/src/lib/transforms/index.ts` — score: 100 — verdict: delete-empty-barrel — owner: BaseTocPlugin — evidence: deleted after command ownership moved — next: closed
- [x] `packages/toc/src/lib/transforms/insertToc.spec.ts` — score: 100 — verdict: move-test-family — owner: BaseTocPlugin.insert.spec.ts — evidence: default/configured-type insert behavior retained — next: closed
- [x] `packages/toc/src/lib/transforms/insertToc.ts` — score: 100 — verdict: merge-owner — owner: BaseTocPlugin.update.insert — evidence: deleted; no editor/tx helper plumbing — next: closed
- [x] `packages/toc/src/lib/types.ts` — score: 100 — verdict: keep-shared-type — owner: Heading contract — evidence: Base and React families reuse the public type; typecheck/build — next: closed
- [x] `packages/toc/src/lib/utils/index.ts` — score: 100 — verdict: delete-empty-barrel — owner: BaseTocPlugin — evidence: deleted after predicate colocation — next: closed
- [x] `packages/toc/src/lib/utils/isHeading.spec.ts` — score: 100 — verdict: merge-test-family — owner: BaseTocPlugin.read.spec.ts — evidence: heading/non-heading filtering covered through plugin read — next: closed
- [x] `packages/toc/src/lib/utils/isHeading.ts` — score: 100 — verdict: merge-owner — owner: BaseTocPlugin.read.headings match — evidence: deleted after one-use predicate inlining — next: closed
- [x] `packages/toc/src/react/TocPlugin.tsx` — score: 100 — verdict: keep-react-adapter — owner: TocPlugin — evidence: descriptor-only exact Base conversion; no hooks in plugin — next: closed
- [x] `packages/toc/src/react/hooks/__tests__/tocHookMocks.ts` — score: 100 — verdict: merge-test-family — owner: react/useToc.spec.tsx — evidence: mock support collapsed into one owner spec — next: closed
- [x] `packages/toc/src/react/hooks/index.ts` — score: 100 — verdict: flatten-barrel — owner: react/useToc.ts — evidence: deleted; React barrel exports one hook-family owner — next: closed
- [x] `packages/toc/src/react/hooks/useContentController.spec.tsx` — score: 100 — verdict: merge-test-family — owner: react/useToc.spec.tsx — evidence: scroll and navigation feedback retained — next: closed
- [x] `packages/toc/src/react/hooks/useContentController.ts` — score: 100 — verdict: merge-hook-family — owner: react/useToc.ts — evidence: content scrolling/observation colocated; `isScroll` contract restored — next: closed
- [x] `packages/toc/src/react/hooks/useContentObserver.spec.tsx` — score: 100 — verdict: merge-test-family — owner: react/useToc.spec.tsx — evidence: heading observation/active id retained — next: closed
- [x] `packages/toc/src/react/hooks/useContentObserver.ts` — score: 100 — verdict: merge-hook-family — owner: react/useToc.ts — evidence: observer lifecycle colocated outside plugin — next: closed
- [x] `packages/toc/src/react/hooks/useTocController.spec.tsx` — score: 100 — verdict: merge-test-family — owner: react/useToc.spec.tsx — evidence: offscreen wrapper scrolling retained — next: closed
- [x] `packages/toc/src/react/hooks/useTocController.ts` — score: 100 — verdict: merge-hook-family — owner: react/useToc.ts — evidence: controller reuses lexical observer capability — next: closed
- [x] `packages/toc/src/react/hooks/useTocElement.spec.tsx` — score: 100 — verdict: merge-test-family — owner: react/useToc.spec.tsx — evidence: state/click/navigation and no-scroll option behavior retained — next: closed
- [x] `packages/toc/src/react/hooks/useTocElement.ts` — score: 100 — verdict: merge-hook-family — owner: react/useToc.ts — evidence: element state and interaction hooks colocated — next: closed
- [x] `packages/toc/src/react/hooks/useTocObserver.spec.tsx` — score: 100 — verdict: merge-test-family — owner: react/useToc.spec.tsx — evidence: visibility/offset behavior retained — next: closed
- [x] `packages/toc/src/react/hooks/useTocObserver.ts` — score: 100 — verdict: merge-hook-family — owner: react/useToc.ts — evidence: observer cleanup and offset logic colocated — next: closed
- [x] `packages/toc/src/react/hooks/useTocSideBar.spec.tsx` — score: 100 — verdict: merge-test-family — owner: react/useToc.spec.tsx — evidence: inference guard/sidebar click/mouse behavior retained — next: closed
- [x] `packages/toc/src/react/hooks/useTocSideBar.ts` — score: 100 — verdict: merge-hook-family — owner: react/useToc.ts — evidence: sidebar state/interaction colocated; utility logic inline — next: closed
- [x] `packages/toc/src/react/index.ts` — score: 100 — verdict: keep-barrel — owner: React package surface — evidence: exports TocPlugin and useToc family; `brl`/build — next: closed
- [x] `packages/toc/src/react/types.ts` — score: 100 — verdict: merge-hook-family — owner: react/useToc.ts — evidence: hook-only public option types colocated with hooks — next: closed
- [x] `packages/toc/src/react/utils/checkIn.ts` — score: 100 — verdict: merge-hook-family — owner: react/useToc.ts mouse-leave handler — evidence: one-use geometry inlined — next: closed
- [x] `packages/toc/src/react/utils/heightToTop.ts` — score: 100 — verdict: merge-hook-family — owner: react/useToc.ts content-scroll handler — evidence: one-family geometry inlined — next: closed
- [x] `packages/toc/src/react/utils/index.ts` — score: 100 — verdict: delete-empty-barrel — owner: react/useToc.ts — evidence: deleted after utility colocation — next: closed

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| code-block | 0 | 12 | unattested | v1-v12/full current review | yes | brl/lint/typecheck/build/diff clean; 52/54 final owner-family tests, with the two shared command/schema rows recorded below | `sha256:6c3f94ef764e0e761e6548eb7b03fcc92ea61adbd383b27772c89829d082899a` | current |
| layout | 0 | 12 | unattested | v1-v12/full current review | yes | brl/lint/typecheck/build/diff clean; 22/22 final owner-family tests | `sha256:73838699a2d73aee968e4a47925341a9ba9096f193e94fafe2f5ef1f4ecf4bce` | current |
| toggle | 0 | 12 | unattested | v1-v12/full current review | yes | brl/lint/typecheck/14 tests/build/diff/autoreview clean; live drift re-proved | `sha256:e193084783f332235b8253573a70e4343cc24c26608ad0ed2e1c1e4784005a12` | current |
| footnote | 0 | 12 | unattested | v1-v12/full current review | yes | brl/lint/typecheck/32 tests/build/diff/autoreview clean | `sha256:823daedba038d9fe0adaaf051f968a4b90efb85c9b921a294c106c886f217e5e` | current |
| toc | 0 | 12 | unattested | v1-v12/full current review | yes | brl/lint/typecheck/15 tests/build/diff/autoreview clean | `sha256:f2713a254b8362045d39a13c646254e3c163725eccd31894fa9174dd30e0ca5d` | current |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| 1 | code-block | plugin imports single-owner queries/transforms | package source/proof | closed: staged read/api/update owner; raw helpers deleted | v12 attested |
| 2 | layout | tx/editor helper binding and transform folder | package source/proof | closed: group plugin owns flat api/update/correction; tests merged | v12 attested |
| 3 | toggle | React plugin imports queries/transforms | package source/proof | closed: staged Base/React ownership, one external hook family, raw helpers deleted | v12 attested |
| 4 | footnote | one family fragmented across query/transform files | package source/proof | closed: cached read registry and transaction-local updates absorbed by BaseFootnotePlugin; behavior defects repaired | v12 attested |
| 5 | toc | base command plus over-split hook family | package source/proof | closed: Base read/update owner plus one external useToc hook/test family; utilities inlined | v12 attested |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| code-block raw command/query/formatter imports | `apps/www/**`, `content/docs/**` | Package mode forbids unrelated consumer edits | docs/app adoption owner after package sweep |
| toc `insertToc` / `isHeading` consumers | `apps/www/src/registry/**`, `content/docs/**` | Package mode forbids unrelated consumer edits | adopt plugin read/update surfaces in app/docs packet |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| TOC Bun source alias immediately after typecheck | transient `Cannot find module @platejs/core`; exact immediate rerun passed 15/15 after Core artifact refresh | environment resolver race, not source behavior | tooling/source-alias owner; package proof rerun green |
| Code-block full source suite | 100/102 pass; two `withCodeBlock` delete-command rows fail because the shared command handler is not invoked and default deletion creates schema-invalid `p > code_line` / `code_block > p` intermediates | targeted owner tests, typecheck, build, and package script pass; failure reproduces without a target-package staging change | active Core command/schema owner |
| Plate schema adoption / `check:core` | final source audit passes across 4,440 files and the complete Core gate passes | closed after exact staged-chain, HTML codec, AI inference, and Tabbable options-factory owner repairs | none |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| `insertToc`, `isHeading`, TOC helper docs | 5 current source/doc matches outside package | package mode explicitly defers external consumers | apps/www registry + TOC docs adoption |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | five packages merged into coherent Base/plugin/hook-family owners; TOC collapsed from 30 to 11 source/spec files |
| tests/proof | code-block 52/54 final owner-family (two shared command/schema failures), layout 22/22, toggle 14, footnote 32, toc 15; all five package typecheck/build/lint/barrels/diff clean; `pnpm check:core` passes |
| docs/templates/skills | five package changesets repaired; Footnote package README repaired; external app/docs adoption deferred |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Code-block command integration | Full source suite is 100/102 because the shared command handler is not invoked | `BaseCodeBlockPlugin.commands.spec.tsx` | Core command/schema owner fixes publication/dispatch |
| 2 | External helper adopters | Five TOC and 23 code-block app/docs matches still use cut helpers | outside-package sweep | Migrate in the app/docs owner packet |

Findings:
- The schema-adoption checker modeled one staged chain per file and falsely
  rejected coherent colocated owners with two independent plugin descriptors.
- Code-block production was colocated but six old helper-path specs still
  violated v12 test-family ownership; they are now owner-named families.
- No production helper directory or standalone editor/tx/api/read plumbing
  function remains in the five package scopes.

Decisions and tradeoffs:
- Keep code-block/layout multi-stage `.extend()` chains: key-only shortcuts
  require update commands published by the prior stage. Constructor placement
  was tested and broke inference.
- Keep code-block insert-data and fragment-replacement proof in separate
  owner-named files because they exercise distinct clipboard and fragment
  lifecycle entrypoints, not deleted helper methods.
- Defer outside package consumers rather than broadening the user-authorized
  five-package packet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Move key-only shortcuts into constructors | 1 | Preserve typed stages; repair checker | Package typecheck returned missing handlers and collapsed plugin inference; reverted |
| Full code-block source suite | 1 | Isolate owner tests and command dispatch | 100/102; two shared command/schema failures assigned to Core |
| Final combined autoreview | 1 | Manual late-patch review plus checker tests | Shared dirty bundle was 1,564,425 chars, above the 1,048,576 cap |
| TOC Bun source alias | 1 | Refresh Core artifact and rerun exact proof | Exact rerun passed 15/15 |

Verification evidence:
- `version.mjs validate` passes at doctrine v12; all five named status commands
  report `current`.
- Package proof passes: code-block 52/54 final owner-family with two external
  command/schema rows, layout 22/22, toggle 14, footnote 32, toc 15; all five
  typechecks/builds/lints/barrels and diff-checks pass.
- `node --test tooling/scripts/check-plate-schema-adoption.test.mjs`: 24/24.
- Schema-adoption audit reports zero findings in the five named packages.
- `pnpm check:core` passes its runner, declaration, schema-adoption, docs, and
  44-package typecheck gates.
- Package-local review passes were clean; the late checker delta was manually
  reviewed after the combined helper exceeded its input cap.

Final handoff contract:
- target surface and mode: five sequential package reviews: code-block, layout,
  toggle, footnote, toc
- files/APIs reviewed: 157 starting TypeScript rows plus package exports,
  release prose, proof, and final owner topology
- broad Core drift score coverage: N/A; broad Core sweep excluded
- package file checklist coverage: 157/157 score 100; zero unchecked/deferred
- doctrine start/final version and source-fingerprint state: v0/unattested to
  v12/current for all five
- version registry evidence and remaining stale/drifted count: five exact
  fingerprints recorded; named-package stale/drifted count zero
- best Plate v2 recommendation: plugin behavior in Base capabilities; React
  component/hook families external; typed extension stages only when needed
- verdict matrix summary: five package owners closed, legacy helper topology
  deleted, staged inference retained
- Plite/Plate gaps or blockers: no package-local gap; two code-block integration
  rows still expose shared command/schema dispatch behavior
- related scoped sweep query/active scope/matches/patched/deferred: zero
  production helper-directory survivors; five TOC and 23 code-block external
  matches deferred
- out-of-scope matches discovered: app/docs helper adopters and unrelated Core
  gate failures
- changes made: production/plugin/hook/test colocation, barrels, five
  changesets, Footnote README, v12 attestations, multi-chain checker support
- tests/proof commands: package typecheck/build/lint/brl/focused Bun suites,
  checker 24/24, schema-adoption audit, diff-check
- old compatibility names audited: package-local deleted helper paths and
  forbidden option/cast/normalize patterns have zero production matches
- needs attention: code-block command dispatch and app/docs helper adoption
- next best Plate Next packet: `packages/indent`

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Five package-local closures and the shared Core gate are complete |
| Where am I going? | Handoff this batch, then `packages/indent` |
| What is the goal? | Colocate and attest code-block, layout, toggle, footnote, toc |
| What have I learned? | Staged shortcuts are real type dependencies; tests need the same owner law |
| What have I done? | Closed 157/157 rows and attested all five at v12 |

Timeline:
- 2026-07-26T15:28:45.157Z Goal plan created.
- 2026-07-26 Checkpoint zero: exact five-package order, v12 start state,
  157-row manifest, boundaries, proof, and stop condition recorded.
- 2026-07-26 Package closure: all five current at v12; checker supports exact
  multi-chain owners; the complete Core gate passes.

Open risks:
- Shared Core command/schema work still keeps two code-block command tests red;
  the complete `pnpm check:core` gate passes.
- Outside-package app/docs helper adopters still need their own migration packet.
