# Restore Markdown root API

Objective:
Restore the sole editor-bound Markdown API at `editor.api.markdown`; migrate
all live callers and teaching, remove the scoped API duplicate, and pass
package, docs, browser, review, and stale-symbol gates.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-22-restore-markdown-root-api.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- docs
- package-api
- browser

Plate Next source:
- prompt / link: user correction: `editor.api.markdown.serialize() is cut ? why ?` followed by `go`
- mode: named public API packet
- target surface: `@platejs/markdown` editor API plus every live package, app, test, docs, and changeset caller
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: exact root/scoped Markdown API caller audit across `packages/**`, `apps/www/**`, `content/**`, and `.changeset/**`
- package review mode: no; this is a named cross-repo public API adoption packet
- package review target: N/A
- package file checklist gate: N/A
- completion threshold summary: one inferred root Markdown API, zero live scoped Markdown API calls, all named proof gates green

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
- initial confidence score: N/A: exact binary API and proof threshold
- improvement loop: implement, audit callers, type/test/docs/browser proof, review, repair
- final score / loop closure: N/A: close only when every binary gate passes

Completion threshold:
- `MarkdownPlugin` publishes `deserialize`, `deserializeInline`, and `serialize`
  only at `editor.api.markdown` through the root editor API owner.
- `editor.plugin(MarkdownPlugin)` remains the options portal but exposes no
  Markdown conversion API.
- Every live source, test, example, current-state doc, and release note uses or
  teaches the final shape; exact scoped-API searches return zero outside
  historical plans/artifacts.
- `@platejs/markdown` and affected package type/tests pass; docs parse; the
  `/docs/markdown` route renders and its console/network state is checked.
- No alias or dual publication survives.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-restore-markdown-root-api.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/markdown test`; focused AI tests if owner changes require them
- package proof: source-first typechecks for `@platejs/markdown`, `@platejs/ai`, and `www`; package build only if release-artifact verification requires it
- shared Core gate: N/A unless the root API builder contract itself changes; this packet uses the existing `extendEditorApi` owner
- source audits: exact `editor.plugin(MarkdownPlugin).api`, `editor.getApi(MarkdownPlugin)`, and `editor.api.markdown` searches over live owners
- related scoped sweep query / active scope / match count / patched count / deferred count:
  root/scoped Markdown API forms across `packages`, `apps/www`, `content`, and `.changeset`; counts recorded after edit
- package file manifest / row count / checked count / deferred count: N/A: not package review mode
- Plite/Plate gap ledger: N/A unless inference cannot survive the root publication
- broad Core drift ledger gate: N/A: named API packet, not a Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-restore-markdown-root-api.md`

Constraints:
- Keep exactly one editor-bound Markdown API: `editor.api.markdown.*`; do not
  retain a scoped alias.
- Keep Markdown options scoped at
  `editor.plugin(MarkdownPlugin).getOptions/setOptions`; this correction does
  not restore root option helpers.
- Preserve all unrelated shared schema, initialization, options-only, static
  rendering, and docs work in overlapping files.
- Preserve inline inference. Do not add casts, explicit callback parameter
  annotations, wrapper aliases, or a hand-maintained duplicate API type.
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
- allowed edit scope: Markdown plugin declaration/spec, the smallest Core
  inference owner, direct live callers in `packages/ai` and `apps/www`,
  Markdown EN/CN current-state docs, the existing Markdown changeset, the
  Markdown demo's schema-compatible registry configuration, and this plan
- package/API surfaces: `@platejs/markdown` root editor API; affected AI/app
  callers only
- docs/browser surfaces: `/docs/markdown` and the existing
  `markdown-to-plite-demo` preview; no route or nav topology change
- non-goals: HTML portal policy, generic Core portal redesign, historical
  changelogs/migration prose, generated registry/template output, unrelated
  config/options work
- out-of-scope package errors: record rather than patch unless caused by this
  Markdown API correction

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if the existing root API extension owner cannot preserve the
  Markdown contract without a Core public API redesign and the same blocker
  survives three focused attempts; otherwise repair the smallest owner.

Current verdict:
- verdict: `keep-in-plate` root feature service plus `hard-cut` scoped duplicate
- confidence: high; `origin/main` already exposes the namespaced root API and
  current Core explicitly supports `extendEditorApi`
- next owner: MarkdownPlugin and direct callers
- keep / revert / quarantine call: keep after proof
- reason: `editor.api.markdown.*` is namespaced, shorter, discoverable, and
  editor-level; descriptor scope remains appropriate for options

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact root-only API, no alias, all live adoption, options stay scoped, inference, and proof requirements are recorded above. |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read in full; root `editor.api.<owner>` is an allowed service owner. |
| Active goal checked or created | yes | Goal created for this exact plan after `get_goal` returned no active goal. |
| Mode classified as named packet vs broad Core sweep | yes | Named Markdown public API packet; broad Core and package review modes are false. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Root namespaced feature API is the sole target; scoped duplicate is a hard cut. |
| Broad Core drift ledger initialized when in scope | no | N/A: the packet touches only the owning dependency-inference types; it is not a broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; live Markdown/Core source, `origin/main`, tests, docs, and current callers. |
| Output budget strategy recorded | yes | Targeted `rg`, file lists/counts first, narrow source reads, generated/history exclusions. |
| Public API fork routing checked | yes | User directly reviewed the tradeoff and explicitly accepted this exact fork with `go`; this plan is execution, not a new proposal. |
| Gap policy checked | yes | No gap known; existing `extendEditorApi` is the root publication owner. |
| Related scoped sweep policy checked | yes | Exact scoped/root Markdown API searches over live packages/apps/content/changeset are mandatory. |
| Review-mode rename freeze checked | yes | N/A: no files or public symbols are renamed. |
| Package review checklist initialized when in scope | no | N/A: named API packet, not package review mode. |
| Docs pack selected | yes | Supporting current-state Markdown EN/CN docs are in scope. |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read in full. |
| Docs lane selected | yes | Serialization/conversion plugin page. |
| Target docs and nearest sibling docs read | yes | Markdown EN/CN targets and the HTML serialization sibling were read against live source. |
| Docs style doctrine read | yes | Current-state, source-backed, direction-split documentation rules loaded. |
| Documented source owner identified | yes | `packages/markdown/src/lib/MarkdownPlugin.ts` owns the editor API; exported helpers remain package functions. |
| Package/API pack selected | yes | Published `@platejs/markdown` API is corrected relative to `origin/main`. |
| Public surface or package boundary identified | yes | Root editor Markdown service group and direct package/app consumers. |
| Release artifact path selected | yes | Update existing `.changeset/markdown-plite-runtime.md` relative to `origin/main`. |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read in full; one-package major changeset retained. |
| Barrel/export impact decision recorded | yes | No file/export layout change; `pnpm brl` is N/A unless edits prove otherwise. |
| Browser pack selected | yes | Package/app-facing docs demo needs route proof. |
| Browser route / app surface identified | yes | `/docs/markdown`, including `markdown-to-plite-demo`; load and inspect rendered conversion preview. |
| Browser tool decision recorded | yes | Use the Browser plugin for ordinary route/DOM/console/network proof. |
| Console/network caveat policy recorded | yes | Check both; classify pre-existing infrastructure noise separately. |

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
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | 79 root calls across 21 live files; exact scoped-call and direct-helper audits return zero. |
| Broad Core drift ledger coverage | no | Record manifest counts only for a broad Core sweep | N/A: this is a named API packet with one owning Core generic. |
| Score gate | yes | Resolve every reviewed high-drift row | Root API and caller drift are fixed; no deferred in-scope row remains. |
| Best Plate v2 recommendation | yes | Record the current shape and rejected alternatives | Root service only; scoped duplicate, dual publication, and wrapper aliases rejected. |
| Plite/Plate gap ledger | no | Record blockers or N/A | N/A: `extendEditorApi` expresses the contract without a compatibility layer. |
| Related scoped sweep after correction | yes | Run same-class searches after corrections | Scoped API 0; direct helper live calls 0; JSON compatibility and media align browser failures repaired at their owners. |
| Package file checklist | no | Record package rows only in package-review mode | N/A: named cross-repo API packet. |
| Helper topology / lexical tx ownership | yes | Prove every surviving tx helper has durable reuse | `withAIBatch` is a reused history/effect boundary across AI mutation paths; no Markdown tx helper was added. |
| Package/API proof | yes | Run focused owning checks | Markdown/Core typechecks, Markdown/AI tests, docs check, changeset status, and browser proof pass. |
| Shared Core gate coverage | yes | Prove the smallest Core inference owner | `pnpm --filter @platejs/core typecheck` passes, including contract declarations. |
| Non-Core package error triage | yes | Classify unrelated proof failures | A transient shared Suggestion `skipDeletes` failure was repaired by its owner; fresh AI/www reruns pass. |
| Source audit | yes | Audit removed compatibility names | Exact scoped Markdown API search returns zero in live packages/apps/docs/changesets. |
| Rename ledger | no | Record only postponed renames | N/A: no file or public symbol rename. |
| Extracted-file inventory | yes | Classify untracked files in the named scope | Exact named target inventory is zero; five unrelated untracked Plite docs are shared WIP outside this packet. |
| Autoreview / review | yes | Run structured review | Codex autoreview exits 0, 0 findings, correctness 0.78. |
| Final lint/check | yes | Run scoped lint and diff checks | Scoped Biome passes; targeted `git diff --check` passes. Repo-wide lint is blocked by unrelated schema-checker WIP. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Ledgers below identify runtime, proof, docs, and the sole external blocker. |
| Goal plan complete | yes | Run the autogoal checker | All mechanical closeout evidence is recorded in this plan. |
| Docs source-backed claim audit | yes | Verify docs against source | Markdown EN/CN and direct examples teach only the three installed root methods and scoped options. |
| Docs links / routes / previews | yes | Verify route and anchors | `/docs/markdown` loads; all three root API anchors and the live demo render. |
| Docs MDX/content parser | yes | Run the docs source check | `pnpm --filter www check:docs` passes. |
| Plugin page specifics | yes | Apply docs-creator plugin-page rules | Kit, manual API, options, and demo are source-backed and current-state. |
| Public API / package boundary proof | yes | Audit API, exports, and package boundary | `MarkdownPlugin.extendEditorApi` owns the root group; options remain scoped; no export layout changes. |
| Release artifact classification | yes | Classify published impact | Published `@platejs/markdown` API/runtime behavior; existing package changeset updated. |
| Published package changeset | yes | Validate package/version/prose | `.changeset/markdown-plite-runtime.md` is major for `@platejs/markdown`; `changeset status` resolves it. |
| Registry changelog | no | Use only for registry-only behavior | N/A: registry edits adopt and prove the published Markdown package contract. |
| No release artifact | no | Record only when no artifact applies | N/A: a published package changeset applies. |
| Package typecheck/build/test | yes | Run owners or classify an external blocker | Markdown, Core, AI, and www typechecks pass; Markdown and AI tests pass. |
| Barrel/export generation | no | Run when exported layout changes | N/A: no exported file or barrel layout changed. |
| Browser interaction proof | yes | Exercise the docs route and conversion demo | Fresh Browser tab renders Basic/Advanced Markdown, media, and all API headings with no overlay. |
| Browser console/network check | yes | Record console and request state | Fresh tab has zero warning/error logs; dev server records `GET /docs/markdown 200`. |
| Browser final proof artifact | yes | Record the route proof | Browser DOM/accessibility proof captured; no screenshot needed because no pixel-specific claim is made. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `MarkdownPlugin` editor API | 4 | `keep-in-plate` root group + `hard-cut` scoped duplicate | `@platejs/markdown` | Main/root precedent, current `extendEditorApi`, user AX decision | Publish inferred `{ markdown: ... }`; migrate all callers |
| Markdown options portal | 0 | keep scoped | `@platejs/markdown` | Options-only Plate law | Preserve `getOptions/setOptions` portal calls |
| AI/app callers and docs | 3 | main-parity cleanup | owning callers/docs | Branch-only scoped migration conflicts with accepted root API | Rewrite only Markdown API access; preserve disjoint WIP |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Markdown editor API | `editor.api.markdown.deserialize/deserializeInline/serialize` only | `editor.plugin(MarkdownPlugin).api.*`, dual publication, wrapper alias | Shortest discoverable feature-owned service namespace; options remain explicitly scoped | accepted by user with `go` |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | None: existing root API extension supports the target | N/A | `MarkdownPlugin.extendEditorApi` | Markdown type/runtime tests | proceed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Restore sole root Markdown API | Live `packages`, `apps/www/src`, `content`, and `.changeset` excluding generated/history | Exact `editor.plugin(MarkdownPlugin).api`, `editor.getApi(MarkdownPlugin)`, and `getPluginApi(MarkdownPlugin)` search | 0 final | 15 removed diff lines | 0 | none |
| Keep live callers on the installed editor service | AI, registry, and current docs excluding specs/migration | Direct `deserializeMd`, `deserializeInlineMd`, and `serializeMd` call search | 0 final | 42 removed diff lines | 0 | exported helpers remain implementation/test boundaries only |
| Browser JSON compatibility crash | Markdown font-span deserialization | Inspect full demo result with `isEditorJsonValue` and `ContentSlice.closed` | 5 absent font properties written as `undefined` | 5 conditional property inclusions | 0 | regression test covers partial style spans |
| Browser schema validation crash | Markdown demo plus base/React align kits | Fresh route load and schema error owner audit | 3 source owners | 3 files | 0 | file alignment removed; audio/video alignment declared |

Core drift ledger:
- Applies: no
- Manifest command: N/A: named packet, not a broad Core sweep
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | N/A | N/A | Named packet; no Core manifest | N/A |

Package file checklist:
- Applies: no
- Package: N/A
- Manifest command: N/A
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
- Next package blocked until: N/A

Package file rows:
- [x] N/A: named API packet, not package review mode.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Root Markdown service | `@platejs/markdown` | Scoped conversion API is longer and duplicates an editor-level service | `MarkdownPlugin.ts`, exact caller audits | keep root group; hard-cut scoped duplicate | frozen |
| Dependency inference | `@platejs/core` | Eager/double plugin-tree expansion loses dependency API precision | owning context/runtime types plus compile-only contract | expand once at the runtime inference owner | frozen |
| AI adoption | `@platejs/ai` | Markdown calls need an honest installed dependency without runtime cycles | AIChat/Copilot dependencies, key-based reverse lookups, AI type/tests | keep explicit dependency; keep transforms cycle-free | frozen |
| Docs/demo runtime | www/docs | Public teaching and the live conversion preview must prove the sole API | Markdown EN/CN, direct examples, demo, Browser | root API only; repair invalid Markdown output/schema config | frozen |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| Exact named target set | `recover-main-owner` gate | Every target resolves to an existing owner | no extracted target files | exact `git ls-files --others --exclude-standard -- <targets>` count = 0 |
| Five untracked `content/docs/plite/**` files found by the broader inventory | out-of-scope shared WIP | No Markdown owner or API call | untouched | broad inventory only; excluded from named packet |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| Repo-wide `pnpm lint` | `tooling/scripts/check-plate-schema-adoption.mjs:422` declares `/Plugin$/` inside a function | Unrelated schema checker file; scoped packet Biome and diff checks pass | schema adoption owner |
| Shared Suggestion type state during one intermediate rerun | undefined `skipDeletes` | Disjoint concurrent WIP; its owner repaired it and fresh AI/www typechecks pass | resolved externally |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| Historical migration docs, generated registry output, and templates | migration/CI owners | Deliberately excluded historical/generated surfaces; live current-state audits are zero | none for this packet |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Root Markdown editor service; single-expansion Core dependency inference; explicit AI dependencies and cycle-free reverse lookups; root caller migration; JSON-safe font marks; audio/video align schema adoption. |
| tests/proof | Markdown root API/MDX JSON regression, Core dependency-inference contract, AI/Markdown tests, four owner typechecks, docs check, changeset status, Browser route proof. |
| docs/templates/skills | Markdown EN/CN and direct examples teach only `editor.api.markdown.*`; major Markdown changeset updated. No template/generated edits. |
| reverted/quarantined packets | Removed false branch-only scoped-API migration prose; no compatibility alias or helper wrapper retained. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Repo-wide lint is red outside this packet | Schema checker keeps a non-top-level regex | `tooling/scripts/check-plate-schema-adoption.mjs:422` | schema owner should hoist the regex; do not mix it into this API lane |

Findings:
- Partial MDX font spans emitted absent marks as explicit `undefined`, so the
  Plite content codec rejected the demo value.
- The registry declared media alignment only for images/embeds while its
  audio/video renderers and Markdown demo persisted `align`.
- No accepted actionable finding remained after structured autoreview.

Decisions and tradeoffs:
- Root `editor.api.markdown.*` is the sole editor-bound conversion surface.
  The Markdown plugin portal remains options-only.
- Keep `withAIBatch` separate because it is a reused AI history/effect
  boundary; preserve value inference and intentionally omit plugin tx groups.
- Declare align only for media renderers that consume it. Remove meaningless
  file alignment instead of weakening schema validation.
- Keep standalone Markdown helpers for package implementation/tests, but teach
  and use the installed editor service in every live consumer.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Generic `withAIBatch<E>` derived from `ValueOf/ExtensionsOf` | 1 | Narrow value inference instead of reconstructing all extensions | `<V extends Value>(editor: BaseEditor<V, any>, tx: EditorUpdateTransaction<V>)` passes concrete callers |
| Generic `withAIBatch<V, P>` with derived extensions | 1 | Do not pretend Plate plugin config is a Plite extension tuple | Same narrow value contract |
| Browser: content slice not JSON-compatible | 1 | Inspect the exact deserialized value | Omit absent font marks; regression and full-sample codec proof pass |
| Browser: `align` cannot target `file` | 1 | Audit schema consumers instead of relaxing validation | Remove file align; add audio/video targets to both kits |
| Combined graph typecheck during shared edit | 1 | Run owners directly, then rerun after owner freeze | Markdown/Core/AI/www typechecks all pass |

Verification evidence:
- Source audit: 79 `editor.api.markdown.*` calls in 21 live files; stale
  scoped API calls = 0; live direct helper calls = 0.
- `pnpm --filter @platejs/markdown typecheck` — pass.
- `pnpm --filter @platejs/core typecheck` — pass, including contract declarations.
- `pnpm --filter @platejs/ai typecheck` — pass.
- `pnpm --filter www typecheck` — pass, including docs and registry source checks.
- `pnpm --filter @platejs/markdown test` — pass.
- `pnpm --filter @platejs/ai test` — pass.
- `bun test packages/markdown/src/lib/MarkdownPlugin.spec.ts` — 10 pass, 0 fail.
- `pnpm --filter www check:docs` — pass.
- `pnpm exec changeset status` — Markdown major changeset resolves.
- Scoped Biome — pass; targeted `git diff --check` — pass.
- Browser `/docs/markdown`: title/heading/demo/all three API anchors render,
  scoped API text absent, overlay absent, fresh console warning/error list
  empty, server request 200.
- `.agents/skills/autoreview/scripts/autoreview --mode local ...` — clean,
  zero findings, correctness confidence 0.78.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Owner and API adoption | complete | Sole root API, scoped options, zero stale calls. |
| Type and behavior proof | complete | Four owner typechecks and both package test suites pass. |
| Docs and release proof | complete | Docs source parity and Markdown major changeset status pass. |
| Browser proof | complete | Fresh route renders with clean console and HTTP 200. |
| Review and freeze | complete | Structured autoreview clean; exact audits rerun. |

Final handoff contract:
- target surface and mode: named Markdown public API packet.
- files/APIs reviewed: Markdown owner/spec/rules, smallest Core inference owner,
  AI dependencies/callers, live app/docs callers, changeset, and docs demo.
- broad Core drift score coverage: N/A; no broad Core sweep.
- package file checklist coverage: N/A; no package-review mode.
- best Plate v2 recommendation: sole
  `editor.api.markdown.{serialize,deserialize,deserializeInline}`; scoped
  plugin portal owns options only.
- verdict matrix summary: root service kept; scoped duplicate hard-cut; caller
  and docs drift repaired.
- Plite/Plate gaps or blockers: none.
- related scoped sweep query/active scope/matches/patched/deferred: scoped API
  final 0 / 15 removed lines / 0 deferred; live helper final 0 / 42 removed
  lines / 0 deferred.
- out-of-scope matches discovered: historical/generated surfaces and five
  unrelated untracked Plite docs; untouched.
- changes made: API ownership, inference, dependency/cycle adoption,
  caller/docs/changeset migration, and two browser-discovered runtime repairs.
- tests/proof commands: exact commands and results are recorded above.
- old compatibility names audited: exact scoped API search returns zero.
- needs attention: only the unrelated repo-wide schema-checker lint error.
- next best Plate Next packet: none implied; source is frozen for the owning
  integration task.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Packet implemented, proven, reviewed, and source-frozen. |
| Where am I going? | Immutable handoff to the owning integration task. |
| What is the goal? | Restore `editor.api.markdown.*` as the sole editor-bound Markdown API. |
| What have I learned? | Root service ownership is cleaner, and strict Plite state/schema validation exposed two real Markdown demo defects. |
| What have I done? | Migrated every live caller, fixed inference/cycles/runtime output, proved packages/docs/browser, and completed review. |

Timeline:
- 2026-07-22T20:46:41.556Z Goal plan created.
- 2026-07-22 Checkpoint zero: user requirements, owner map, public API decision,
  docs/release/browser surfaces, and scoped proof threshold recorded.

Open risks:
- None inside the Markdown packet. Repo-wide lint remains red in unrelated
  schema-checker WIP at `tooling/scripts/check-plate-schema-adoption.mjs:422`.
