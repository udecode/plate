# plate-next media full colocation

Objective:
Fully colocate @platejs/media by durable plugin/component/hook ownership; done
when every manifest row scores 100, package/Core gates pass, and autoreview has
0 accepted findings.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-23-plate-next-media-full-colocation.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user said `go` after selecting `@platejs/media` as the next
  package
- mode: package review with implementation
- target surface: `packages/media`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, inside `packages/media` plus
  only the smallest blocking Core/Plite owner
- package review mode: yes
- package review target: `@platejs/media`
- package file checklist gate: all 102 baseline rows must score 100; zero
  unchecked or deferred rows
- completion threshold summary: owner-first production and React topology,
  package typecheck/tests/build, barrels when exports move, lint, `check:core`,
  exact source audits, and zero accepted final review findings

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
- requested duration: N/A: user set no duration
- semantics: one-shot completion threshold
- initial confidence score: N/A: per-file score gate is the metric
- improvement loop: audit, colocate, prove, review, repair until all rows reach
  100
- final score / loop closure: 102/102 baseline rows plus every final added row
  at 100

Completion threshold:
- Every baseline and final `packages/media` manifest row is checked at score
  `100`; zero unchecked/deferred rows.
- Every one-use plugin transform, query, utility, `with*`, parser, command, and
  tx-accepting helper is inline in its durable plugin owner. Separate functions
  survive only with multiple production consumers or a real independent
  algorithm/lifecycle owner.
- React is organized by main component and hook family: family-only
  subcomponents/subhooks are merged, taxonomy-only folders/barrels are removed,
  and independent stores/providers/lifecycles remain separate.
- Public API call-shape changes, if any, use flat scoped plugin verbs and are
  hard-cut only after a source-backed call-site decision; no compatibility
  aliases.
- Package typecheck, tests, build, barrels when exports change, lint,
  `pnpm check:core`, exact topology/legacy audits, and final autoreview pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-plate-next-media-full-colocation.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package-local focused tests during implementation
- package proof: `pnpm turbo typecheck --filter=./packages/media`;
  `pnpm --filter @platejs/media test`; `pnpm --filter @platejs/media build`
- shared Core gate: `pnpm check:core`; `media` is already listed in
  `reviewedPackageSlugs`
- source audits: exact `rg` audits for deleted helper paths/exports, standalone
  tx parameters, nested update calls, normalization, option access, type casts,
  and stale API names
- related scoped sweep query / active scope / match count / patched count / deferred count:
  Media source topology and removed API sweep / `packages/media/src` / 0
  surviving stale matches / 0 package matches to patch / 16 documentation
  matches deferred across 4 out-of-scope files
- package file manifest / row count / checked count / deferred count: baseline
  102 / 102 / 0; final manifest 47 / 47 / 0; 9 added final paths inventoried
- Plite/Plate gap ledger: required; record N/A if no blocker survives
- broad Core drift ledger gate: N/A: named package mode, not broad Core
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-plate-next-media-full-colocation.md`

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
- allowed edit scope: `packages/media`, its package-local proof, generated
  barrels affected by Media exports, one Media changeset, this plan, and only
  the smallest blocking Core/Plite owner if proven necessary
- package/API surfaces: headless Media/Image/Embed/Placeholder plugins and
  Media React component/hook/store families
- docs/browser surfaces: out of scope; package mode must not start `apps/www`
  or edit content/registry callers
- non-goals: no next package, no unrelated package migration, no broad docs or
  caller rewrite, no compatibility preservation, no line ceiling, no messages
  to the other Codex task
- out-of-scope package errors: classify and record; do not repair unless the
  current Media/Core change caused them

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- Read Media by durable owner family in bounded chunks; count caller/import
  graphs before printing matches; exclude `dist`, generated output,
  `node_modules`, coverage, and app build artifacts.

Blocked condition:
- Stop only if the clean owner topology requires an unresolved public API
  decision or missing Core/Plite primitive that cannot be fixed inside the
  smallest allowed owner; record three repeated blocker turns before marking
  the goal blocked.

Current verdict:
- verdict: `merge-existing-owner` / `hard-cut`, complete
- confidence: high after source graph, 62 tests, package/Core/build proof, and
  clean structured autoreview
- next owner: the next Plate Next package; Media is closed
- keep / revert / quarantine call: keep all four proven packets; no quarantined
  packet
- reason: 99 source files collapsed to 43 coherent source owners without helper
  taxonomy folders, while independently reused algorithms, stores, providers,
  and data owners remain separate

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | `go` resumes the selected Media package; exact topology, proof, scope, and no-message boundary recorded above |
| `plate-next` skill/rule read | yes | Read complete `.agents/skills/plate-next/SKILL.md` |
| Active goal checked or created | yes | No prior goal; created goal for this exact plan |
| Mode classified as named packet vs broad Core sweep | yes | Named `packages/media` package review; broad Core sweep N/A |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Objective and constraints above |
| Broad Core drift ledger initialized when in scope | no | N/A: package mode |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; package boundaries above |
| Output budget strategy recorded | yes | Bounded owner-family reads and counted audits above |
| Public API fork routing checked | yes | Route any discovered fork through `best-api` before changing call shape |
| Gap policy checked | yes | Missing substrate becomes a named Plite/Plate gap, never a local bridge |
| Related scoped sweep policy checked | yes | Media-only correction sweeps; broader matches deferred |
| Review-mode rename freeze checked | no | N/A: owner-driven merge/delete/move is explicitly required; cosmetic churn rejected |
| Package review checklist initialized when in scope | yes | 102 baseline rows materialized below before implementation |

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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Media typecheck, 62/62 tests, build/artifact checks, `check:core`, lint, and clean review pass |
| Broad Core drift ledger coverage | N/A | Record manifest counts only when broad Core sweep applies | Package review mode; no Core source file was edited |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred | 102/102 baseline rows and 9/9 added rows are checked at 100 |
| Best Plate v2 recommendation | yes | Record current shape and rejected legacy alternatives | Flat scoped verbs and owner-family topology recorded below |
| Plite/Plate gap ledger | yes | Record blockers or N/A | N/A; no substrate gap survived |
| Related scoped sweep after correction | yes | Record same-class search results | Four correction rows plus final zero-match Media source audit recorded below |
| Package file checklist | yes | Record baseline/final manifests and proof | Baseline 102, final 47, nine added paths, zero missing/extra/deferred |
| Helper topology / lexical tx ownership | yes | Audit helper folders and tx parameters | Zero helper-taxonomy files survive; four tx functions share one primitive with proven production reuse |
| Package/API proof | yes | Run focused typecheck/test/build | Direct typecheck, 62 tests, package build, artifact audit all pass |
| Shared Core gate coverage | yes | Include reviewed package in Core gate | `media` already exists in `reviewedPackageSlugs`; `pnpm check:core` passes |
| Non-Core package error triage | N/A | Classify proof failures | No unresolved package failure |
| Source audit | yes | Audit removed compatibility names | Zero stale names in `packages/media/src` and emitted non-map artifacts |
| Rename ledger | N/A | Record postponed cosmetic renames | Every owner-driven move landed; no postponed rename |
| Extracted-file inventory | yes | Inventory every added path | Nine paths classified below; all score 100 |
| Autoreview / review | yes | Run structured review to clean | Final local Codex autoreview: zero findings, patch correct |
| Final lint/check | yes | Run scoped lint/check | Media lint clean; exact tooling Biome clean; Core gate clean |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Ledgers below are complete; docs adoption is the sole deferred owner |
| Goal plan complete | yes | Run the mechanical goal checker | Final checker is the next and last command after this evidence is saved |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| Image clipboard/file insertion graph | 4 | merge-existing-owner | `BaseImagePlugin` | `withImageEmbed`, `withImageUpload`, and `insertImageFromFiles` have one plugin owner; `insertImage` and `isImageUrl` are public/independent survivors | inline extension and file-reader behavior; merge specs |
| Media URL parser graph | 3 | merge-existing-owner | `parseMediaUrl` family | four public parsers form one coherent algorithm family; registry has real `parseTwitterUrl`/`parseVideoUrl` consumers | merge implementation/spec files while preserving exports |
| Base placeholder transforms | 4 | merge-existing-owner / hard-cut | `BasePlaceholderPlugin` | plugin repeats its noun and four variants; three raw tx helpers have two real registry consumers; `setMediaNode` is test-only | flat scoped `insert(mediaType)`; colocate surviving shared tx helpers; delete dead helpers |
| React placeholder upload graph | 5 | merge-existing-owner | `PlaceholderPlugin` | one plugin owns `transforms/`, seven validation utils, public upload types, and all runtime calls; standalone tx helper exists only to ferry context | inline algorithm in `.extendTx`; merge proof; retain one MIME data owner |
| MIME database taxonomy | 4 | merge-existing-owner | `mimeTypes` data module | six category files plus `mimes` and `utils` are consumed only as one lookup database; 3,700+ data lines justify depth, not taxonomy files | merge mechanically into one data/lookup owner |
| Floating Media React family | 4 | merge-existing-owner | `FloatingMedia.tsx` + `useFloatingMedia.ts` | namespace component, two subcomponents, three subhooks, submit behavior, and spec are split across six files; store has a real external consumer | merge component and hook families; keep independent store |
| Image Preview React family | 3 | merge-existing-owner | `Image.tsx`, `PreviewImage.tsx`, `useImagePreview.ts` | nested component taxonomy and three hook/behavior files serve one preview family; store has external consumers | flatten family; inline `openImagePreview`; merge hooks |
| Dead React exports | 4 | hard-cut | none | `mediaStore`, `useMediaController*`, and Placeholder state hooks have no production consumer or current docs owner | delete files/exports/tests |
| Package tests | 4 | merge-existing-owner | plugin/parser/component/hook families | helper-named specs mirror implementation fragments and contain migrated `any` fixtures | consolidate by durable behavior family |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Headless placeholder insertion | `editor.plugin(BasePlaceholderPlugin).update.insert(mediaType, options)` and grouped `tx.placeholder.insert(mediaType, options)` | nested `placeholder.audioPlaceholder`, four noun-first verbs, root transform aliases | scoped owner already says placeholder; one typed insert is the user intent and scales without verb growth | none: follows the accepted flat scoped-verb doctrine |
| React placeholder upload | `editor.plugin(PlaceholderPlugin).update.insertMedia(files, options)` with the algorithm lexical inside `.extendTx` | exported `insertMediaWithTx(editor, tx, context, ...)`, nested updates, helper ferry types | one plugin owns validation, options, after-commit publication, and placeholder insertion | none |
| Image insertion | keep public `insertImage` for current independent callers; colocate clipboard/file ingestion in `BaseImagePlugin` | exported `withImage*` extensions and `insertImageFromFiles` | only the plugin owns ingestion policy; direct image insertion remains a real public algorithm | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No missing substrate identified | N/A | N/A | package proof and inference audits | proceed in Media |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Initial topology cut | `packages/media/src` | `find` over `transforms`, `queries`, `utils`, `components`, `hooks` | 0 final files | all baseline helper files merged/deleted | 0 | none |
| Placeholder store review finding | `packages/media/src/react/placeholder` | `rg` for `placeholderStore` and `usePlaceholder*` exports/consumers | 1 leaking owner | 1 | 0 | only `PlaceholderProvider` survives in its own file |
| Floating embed metadata review finding | Floating Media family | inspect `provider` / `sourceUrl` set/unset behavior and add regression | 1 bug | 1 | 0 | 4/4 focused regression proof |
| Image file API review finding | repo source callers + Media changeset | `rg` for `imageFromFiles` / `insertImageFromFiles` | 0 live consumers; 1 release-accounting gap | 1 changeset | 0 | app-boundary upload replacement documented |
| Shared build-root review finding | build config + Core/Media builds | real `cwd` / `INIT_CWD` reproduction, resolver tests, filtered builds | 1 P1 bug | 1 owner + 1 test | 0 | Core and Media artifact builds pass |
| Final stale API sweep | `packages/media/src` | removed names, nested updates, root options, casts, required reads, normalization | 0 | 0 | 16 docs matches in 4 files | docs adoption remains out of package scope |

Core drift ledger:
- Applies: no: package mode
- Manifest command: N/A: named package mode; no broad Core manifest
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | keep-in-plate | N/A | package mode; no Core source edit planned | N/A |

Package file checklist:
- Applies: yes
- Package: `@platejs/media`
- Manifest command:
  `rg --files packages/media -g '*.{ts,tsx,mts,cts,json}' | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 102
- Actual row count: 102
- Checked score-100 count: 102 baseline rows plus 9 added final rows
- Unchecked/deferred count: 0 / 0
- Missing row count: 0
- Extra row count: 0
- Final manifest expected/actual/missing/extra: 47 / 47 / 0 / 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: every baseline and final Media row is score 100,
  focused/shared proof passes, and final review has zero accepted findings

Package file rows:
Evidence key `M1`: exact topology/API audits, Media lint and direct typecheck,
62/62 package tests, package build plus artifact audit, `pnpm check:core`, and
the final structured autoreview with zero findings.

- [x] `packages/media/package.json` — score: 100 — verdict: keep-in-plate — owner: Media package metadata — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: Media package barrel/plugin owner — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/BaseAudioPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: Media package barrel/plugin owner — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/BaseFilePlugin.ts` — score: 100 — verdict: keep-in-plate — owner: Media package barrel/plugin owner — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/BaseMediaPluginContracts.spec.ts` — score: 100 — verdict: keep-in-plate — owner: Media package barrel/plugin owner — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/BaseVideoPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: Media package barrel/plugin owner — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/image/BaseImagePlugin.ts` — score: 100 — verdict: keep-in-plate — owner: Image plugin/algorithm family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/image/index.ts` — score: 100 — verdict: keep-in-plate — owner: Image plugin/algorithm family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/image/transforms/index.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Image plugin/algorithm family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/image/transforms/insertImage.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Image plugin/algorithm family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/image/transforms/insertImageFromFiles.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Image plugin/algorithm family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/image/utils/index.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Image plugin/algorithm family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/image/utils/isImageUrl.spec.tsx` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Image plugin/algorithm family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/image/utils/isImageUrl.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Image plugin/algorithm family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/image/withImageEmbed.spec.tsx` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Image plugin/algorithm family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/image/withImageEmbed.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Image plugin/algorithm family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/image/withImageUpload.spec.tsx` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Image plugin/algorithm family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/image/withImageUpload.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Image plugin/algorithm family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/index.ts` — score: 100 — verdict: keep-in-plate — owner: Media package barrel/plugin owner — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/media-embed/BaseMediaEmbedPlugin.spec.ts` — score: 100 — verdict: keep-in-plate — owner: Media Embed plugin family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/media-embed/BaseMediaEmbedPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: Media Embed plugin family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/media-embed/index.ts` — score: 100 — verdict: keep-in-plate — owner: Media Embed plugin family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/media-embed/parseIframeUrl.spec.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Media Embed plugin family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/media-embed/parseIframeUrl.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Media Embed plugin family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/media-embed/parseTwitterUrl.spec.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Media Embed plugin family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/media-embed/parseTwitterUrl.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Media Embed plugin family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/media-embed/parseVideoUrl.spec.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Media Embed plugin family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/media-embed/parseVideoUrl.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Media Embed plugin family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/media-embed/transforms/index.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Media Embed plugin family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/media-embed/transforms/insertMediaEmbed.spec.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Media Embed plugin family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/media-embed/transforms/insertMediaEmbed.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Media Embed plugin family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/media/index.ts` — score: 100 — verdict: keep-in-plate — owner: Media parser/insertion family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/media/insertMedia.spec.ts` — score: 100 — verdict: keep-in-plate — owner: Media parser/insertion family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/media/insertMedia.ts` — score: 100 — verdict: keep-in-plate — owner: Media parser/insertion family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/media/parseMediaUrl.spec.ts` — score: 100 — verdict: keep-in-plate — owner: Media parser/insertion family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/media/parseMediaUrl.ts` — score: 100 — verdict: keep-in-plate — owner: Media parser/insertion family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/media/types.ts` — score: 100 — verdict: keep-in-plate — owner: Media parser/insertion family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/placeholder/BasePlaceholderPlugin.spec.ts` — score: 100 — verdict: keep-in-plate — owner: headless Placeholder plugin — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/placeholder/BasePlaceholderPlugin.ts` — score: 100 — verdict: keep-in-plate — owner: headless Placeholder plugin — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/placeholder/index.ts` — score: 100 — verdict: keep-in-plate — owner: headless Placeholder plugin — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/lib/placeholder/transforms/index.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: headless Placeholder plugin — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/placeholder/transforms/insertPlaceholder.spec.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: headless Placeholder plugin — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/placeholder/transforms/insertPlaceholder.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: headless Placeholder plugin — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/placeholder/transforms/setMediaNode.spec.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: headless Placeholder plugin — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/lib/placeholder/transforms/setMediaNode.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: headless Placeholder plugin — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/image/ImagePreviewStore.ts` — score: 100 — verdict: keep-in-plate — owner: Image React family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/react/image/components/Image.tsx` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Image React family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/image/components/PreviewImage.tsx` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Image React family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/image/components/index.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Image React family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/image/components/useScaleInput.tsx` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Image React family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/image/index.ts` — score: 100 — verdict: keep-in-plate — owner: Image React family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/react/image/openImagePreview.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Image React family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/image/useImagePreview.ts` — score: 100 — verdict: keep-in-plate — owner: Image React family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/react/image/useZoom.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Image React family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/index.ts` — score: 100 — verdict: keep-in-plate — owner: Media package barrel/plugin owner — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/react/media/FloatingMedia/FloatingMedia.tsx` — score: 100 — verdict: keep-in-plate — owner: Floating Media React family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/react/media/FloatingMedia/FloatingMediaEditButton.tsx` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Floating Media React family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/media/FloatingMedia/FloatingMediaStore.ts` — score: 100 — verdict: keep-in-plate — owner: Floating Media React family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/react/media/FloatingMedia/FloatingMediaUrlInput.tsx` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Floating Media React family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/media/FloatingMedia/index.ts` — score: 100 — verdict: keep-in-plate — owner: Floating Media React family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/react/media/FloatingMedia/submitFloatingMedia.spec.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Floating Media React family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/media/FloatingMedia/submitFloatingMedia.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Floating Media React family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/media/index.ts` — score: 100 — verdict: keep-in-plate — owner: Media React family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/react/media/mediaStore.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Media React family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/media/useMediaController.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: Media React family — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/media/useMediaState.spec.ts` — score: 100 — verdict: keep-in-plate — owner: Media React family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/react/media/useMediaState.ts` — score: 100 — verdict: keep-in-plate — owner: Media React family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/react/media/useMediaToolbarButton.ts` — score: 100 — verdict: keep-in-plate — owner: Media React family — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/react/placeholder/PlaceholderPlugin.spec.ts` — score: 100 — verdict: keep-in-plate — owner: React Placeholder plugin/provider — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/react/placeholder/PlaceholderPlugin.tsx` — score: 100 — verdict: keep-in-plate — owner: React Placeholder plugin/provider — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/react/placeholder/hooks/index.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/hooks/usePlaceholderElement.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/hooks/usePlaceholderPopover.spec.tsx` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/hooks/usePlaceholderPopover.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/index.ts` — score: 100 — verdict: keep-in-plate — owner: React Placeholder plugin/provider — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/src/react/placeholder/internal/application.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: MIME data owner — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/internal/audio.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: MIME data owner — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/internal/image.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: MIME data owner — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/internal/mimes.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: MIME data owner — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/internal/misc.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: MIME data owner — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/internal/text.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: MIME data owner — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/internal/utils.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: MIME data owner — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/internal/video.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: MIME data owner — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/placeholderStore.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/transforms/index.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/transforms/insertMedia.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/type.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/utils/createUploadError.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/utils/fileSizeToBytes.spec.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/utils/fileSizeToBytes.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/utils/getMediaType.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/utils/groupFilesByType.spec.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/utils/groupFilesByType.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/utils/index.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/utils/matchFileType.spec.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/utils/matchFileType.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/utils/validateFileItem.spec.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/utils/validateFileItem.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/placeholder/utils/validateFiles.ts` — score: 100 — verdict: merge-existing-owner / hard-cut — owner: React Placeholder plugin/provider — evidence: M1; baseline path removed after owner merge or dead API cut — next: closed
- [x] `packages/media/src/react/plugins.ts` — score: 100 — verdict: keep-in-plate — owner: Media package barrel/plugin owner — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/tsconfig.build.json` — score: 100 — verdict: keep-in-plate — owner: Media package config — evidence: M1; final owner retained and audited — next: closed
- [x] `packages/media/tsconfig.json` — score: 100 — verdict: keep-in-plate — owner: Media package config — evidence: M1; final owner retained and audited — next: closed

Added final file rows:

- [x] `packages/media/src/lib/image/BaseImagePlugin.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: Image plugin proof — evidence: M1; URL, upload, fallback, and option behavior are owner-tested — next: closed
- [x] `packages/media/src/lib/image/isImageUrl.spec.tsx` — score: 100 — verdict: merge-existing-owner — owner: image URL algorithm proof — evidence: M1; moved beside its algorithm with uppercase-extension coverage — next: closed
- [x] `packages/media/src/lib/image/isImageUrl.ts` — score: 100 — verdict: merge-existing-owner — owner: independent public image URL algorithm — evidence: M1; flattened and case-insensitive — next: closed
- [x] `packages/media/src/react/image/Image.tsx` — score: 100 — verdict: merge-existing-owner — owner: Image component family — evidence: M1; flattened and preview opening colocated — next: closed
- [x] `packages/media/src/react/image/PreviewImage.tsx` — score: 100 — verdict: merge-existing-owner — owner: Preview Image component family — evidence: M1; flattened without a taxonomy folder — next: closed
- [x] `packages/media/src/react/media/FloatingMedia/useFloatingMedia.spec.ts` — score: 100 — verdict: merge-existing-owner — owner: Floating Media hook proof — evidence: M1; four focused behavior cases pass — next: closed
- [x] `packages/media/src/react/media/FloatingMedia/useFloatingMedia.ts` — score: 100 — verdict: merge-existing-owner — owner: Floating Media hook family — evidence: M1; submit/edit/input/escape behavior colocated — next: closed
- [x] `packages/media/src/react/placeholder/PlaceholderProvider.tsx` — score: 100 — verdict: recover-main-owner — owner: independent provider component — evidence: M1; dead store surface removed while the live provider remains — next: closed
- [x] `packages/media/src/react/placeholder/internal/mimeTypes.ts` — score: 100 — verdict: merge-existing-owner — owner: independent MIME data/lookup boundary — evidence: M1; category shards collapsed into one lazy lookup owner — next: closed

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| 1 | Headless Media | one-owner extensions/transforms and parser test confetti | `src/lib/image`, `src/lib/media-embed`, `src/lib/placeholder` | keep: owner tests and full Media proof pass | closed |
| 2 | React Media | component/hook family splits and dead exports | `src/react/image`, `src/react/media` | keep: component/hook families flattened and proof passes | closed |
| 3 | React Placeholder | tx ferry, validation utilities, MIME taxonomy, dead hooks | `src/react/placeholder` | keep: flat scoped update, lexical validation, one data owner, 62-test suite | closed |
| 4 | Package closure | barrels, changeset, manifest rescore, package/Core/review gates | package root, tooling build owner, plan | keep: all named gates and clean review pass | closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `src/lib/image/BaseImagePlugin.spec.tsx` | merge-existing-owner | replaces two helper-named specs | keep owner-family proof | 62/62 |
| `src/lib/image/isImageUrl.spec.tsx` | merge-existing-owner | same public algorithm proof, flattened | keep | 62/62 |
| `src/lib/image/isImageUrl.ts` | merge-existing-owner | same public algorithm, flattened | keep | typecheck/build |
| `src/react/image/Image.tsx` | merge-existing-owner | moved from `components/` | keep main component owner | typecheck/build |
| `src/react/image/PreviewImage.tsx` | merge-existing-owner | moved from `components/` | keep main component owner | typecheck/build |
| `src/react/media/FloatingMedia/useFloatingMedia.spec.ts` | merge-existing-owner | replaces submit-only spec | keep hook-family proof | 4/4 focused; 62/62 full |
| `src/react/media/FloatingMedia/useFloatingMedia.ts` | merge-existing-owner | merges three hooks and submit behavior | keep hook family | typecheck/build/review |
| `src/react/placeholder/PlaceholderProvider.tsx` | recover-main-owner | live provider extracted from dead store surface | keep provider only | app caller audit; typecheck/build |
| `src/react/placeholder/internal/mimeTypes.ts` | merge-existing-owner | merges eight MIME category/assembly files | keep independent data owner | 62/62; typecheck/build |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | No unresolved package failure | All named package/Core/tooling gates pass | closed |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| `withImageUpload`, `withImageEmbed`, old nested Placeholder updates | Media EN/CN docs and DnD EN/CN docs: 16 matches in 4 files | Package review explicitly excludes `content/**` adoption | Media documentation adoption packet |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Headless Image/Embed/Placeholder owners; React Image/FloatingMedia/Placeholder families; one MIME data owner; package dependency cleanup; shared tsdown package-root fix |
| tests/proof | Ten final Media spec files, 62 tests; build-root contract test; emitted-artifact audits |
| docs/templates/skills | Existing Media major changeset and this goal plan only; no content/apps/templates edit |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Four stale Media/DnD docs pages | They still teach deleted helpers and nested update shapes | out-of-scope match ledger | update in the docs owner before release |

Findings:
- Baseline manifest is 102 rows: 99 source files plus package metadata and two
  tsconfigs; all 102 score 100. Final manifest is 47 rows: 43 source files plus
  package metadata and two tsconfigs; missing/extra are zero.
- `media` is already covered by `reviewedPackageSlugs` in
  `tooling/scripts/check-core.mjs`.
- Origin/main confirms the migration preserved old `with*`, transform-folder,
  and nested transform topology; it is behavior evidence, not the final owner
  shape.
- Three raw placeholder tx helpers have two real registry consumers each, so
  their tx parameter is justified reuse; `insertImagePlaceholder`,
  `setMediaNode`, `insertMediaWithTx`, validation utils, and other helper files
  do not.
- Current docs and registry contain outside-scope stale/current API matches;
  package mode records these but does not patch them.
- Two structured-review runtime findings were fixed: dead Placeholder store
  exports and stale Floating Media provider metadata.
- The build investigation found and repaired a real shared tsdown root bug:
  package-local builds prefer a validated package `cwd`; shared `plate-pkg`
  builds fall back to a validated `INIT_CWD`.

Decisions and tradeoffs:
- Keep public standalone algorithms with real callers (`insertImage`,
  `insertMedia`, media URL parsers) while eliminating their taxonomy folders.
- Keep independent public stores with external consumers; delete unused stores
  and hooks rather than preserving exports as hypothetical API.
- One large MIME data module is cheaper than nine category/assembly files.
- Public Placeholder scoped update becomes one flat `insert(mediaType)` verb;
  no aliases for the rejected nested method family.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Unescaped backticks in a shell `rg` pattern triggered command substitution and broad docs output | 1 | Use single-quoted literal patterns or plain symbol alternatives with capped paths | No files changed; stopped the broad output and resumed with exact bounded searches |
| Initial shared tsdown fix preferred `INIT_CWD` blindly | 1 | Reproduce lifecycle environment, validate both candidates, prefer package `cwd` | Filtered Core and Media builds plus 5/5 build contracts pass |
| Structured review returned actionable findings | 4 cycles | Verify each against source, patch only same-owner blockers, rerun focused proof | Final fifth run exits clean with zero findings |

Verification evidence:
- `pnpm --filter @platejs/media typecheck` — pass.
- `pnpm turbo typecheck --filter=./packages/media` — 13/13 graph tasks pass.
- `bun test packages/media/src` — 62 pass, 0 fail, 135 assertions.
- `bun test packages/media/src/react/media/FloatingMedia/useFloatingMedia.spec.ts`
  — 4 pass, 0 fail.
- `pnpm --filter @platejs/media lint:fix` — 47 files clean.
- Exact Biome check on the three tooling build-owner files — clean.
- `pnpm --filter @platejs/media brl` — pass.
- Media clean/build plus artifact checker — pass; removed exports absent from
  non-map emitted runtime/declarations.
- `node --test tooling/scripts/check-package-build-artifacts.test.mjs` — 5/5.
- `pnpm --filter @platejs/core build` from repo root — pass.
- Core artifact checker — pass.
- `pnpm check:core` — pass across contracts, 45 reviewed package typechecks
  and lint gates, Core/Plite/reviewed package tests.
- Structured autoreview command: `.agents/skills/autoreview/scripts/autoreview
  --mode local --thinking high --stream-engine-output --prompt <Media scope>`;
  final result: zero findings, patch correct.
- Browser proof: N/A by package-review boundary; no `apps/www` or `content`
  source was changed.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Headless owner colocation | done | Image, Embed, parser, and Placeholder families merged; tests pass |
| React owner colocation | done | component/hook/provider families flattened; tests and typecheck pass |
| Package and build closure | done | lint, barrels, builds, artifacts, Core gate pass |
| Structured review | done | final helper run reports zero findings |
| Manifest and handoff | done | 102 baseline plus 9 added rows score 100 |

Final handoff contract:
- target surface and mode: `@platejs/media`, package review with implementation
- files/APIs reviewed: every baseline/final Media manifest row; flat Image,
  Embed, headless Placeholder, React Placeholder, Floating Media, and Image
  Preview surfaces
- broad Core drift score coverage: N/A; named package mode, no Core source edit
- package file checklist coverage: 102/102 baseline and 9/9 added rows at 100;
  zero unchecked/deferred
- best Plate v2 recommendation: owner-first colocation, flat scoped mutation
  verbs, no async fake tx wrapper, independent data/store/provider owners only
- verdict matrix summary: nine owner families merged/hard-cut; no bridge or
  compatibility alias
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred: zero stale
  Media source matches; four review findings patched; 16 docs matches deferred
- out-of-scope matches discovered: Media/DnD EN/CN docs only
- changes made: 99 source files reduced to 43; build-root owner repaired;
  changeset and generated barrels aligned
- tests/proof commands: exact list in Verification evidence
- old compatibility names audited: absent from Media source and emitted
  non-map artifacts
- needs attention: docs adoption before release
- next best Plate Next packet: select a new package only after this goal closes

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure |
| Where am I going? | Mechanical plan check, then goal completion |
| What is the goal? | Fully colocate `@platejs/media` with every row at 100 and all gates clean |
| What have I learned? | Large coherent owners beat taxonomy shards; package-root build context must be validated |
| What have I done? | Closed four packets, fixed four review findings, and proved the final package |

Timeline:
- 2026-07-23T10:59:47.536Z Goal plan created.
- 2026-07-23 Media headless and React owner families merged; dead helpers and
  taxonomy folders hard-cut.
- 2026-07-23 Package tests, typecheck, lint, barrels, builds, artifact audits,
  and Core gate passed.
- 2026-07-23 Four accepted review findings repaired; final structured review
  clean.
- 2026-07-23 Baseline and added manifests scored 100 with zero deferred rows.

Open risks:
- No source blocker. Sixteen stale examples/headings across four EN/CN Media
  and DnD docs files remain for the separate docs adoption owner.
