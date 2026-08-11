# normalize first-party override plugin names

Objective:
Normalize all concrete first-party `override.plugins` keys to `PLUGINS.*`;
done when the four audited drifts are fixed and focused source, type, and docs
checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-11-normalize-first-party-override-plugin-names.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user said "go" after accepting the four-row audit
- mode: named API cleanup packet
- target surface: concrete first-party `override.plugins` keys
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes; all production and current-doc
  `override.plugins` declarations under `packages`, `apps/www/src`, and `content`
- package review mode: no
- package review target: N/A: named cross-package identity cleanup
- package file checklist gate: N/A: not package review mode
- doctrine version: 67; no doctrine edit
- package applied version / fingerprint state: N/A: not package review or sync
- sync mode / target: no
- sync queue row count: N/A: not sync mode
- completion threshold summary: four audited drift sites use `PLUGINS.*`; all
  remaining raw keys are synthetic tests or generic/historical prose

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
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: exact four-row threshold
- improvement loop: patch, source-audit, typecheck touched packages, lint
- final score / loop closure: four of four drift rows fixed with zero unexplained
  concrete first-party raw keys

Completion threshold:
- The three package keys and one Chinese API reference identified by the audit
  use `PLUGINS.*`, with no behavior or public API change.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-11-normalize-first-party-override-plugin-names.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: touched package source-first typechecks and scoped lint
- package proof: list and utils typechecks
- shared Core gate: N/A: no Core API/runtime change
- source audits: enumerate every concrete `override.plugins` declaration and
  classify production, tests, current docs, generic prose, and generated output
- related scoped sweep query / active scope / match count / patched count / deferred count:
  Babel AST enumeration over `packages` and `apps/www/src`, plus exact current-doc
  `rg`; 17 source declarations, 5 production, 12 tests, 4 drift rows patched,
  0 deferred production rows
- package file manifest / row count / checked count / deferred count: N/A: not
  package review mode
- version registry validation / starting status / final status: N/A: no doctrine
  or package attestation
- package fingerprint command / result: N/A: not package review mode
- Plite/Plate gap ledger: none expected; the catalog already owns all four names
- broad Core drift ledger gate: N/A: named packet, not broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-11-normalize-first-party-override-plugin-names.md`

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
- Base/static renderer boundary law: Base constructors stay renderer-neutral.
  Base `.extend()` also rejects component authoring. Static/base kits bind the
  owning server-safe `*-static` renderer through terminal
  `BasePlugin.configure({ component })` without importing a Plate React
  entrypoint. Live React adapters use
  `toPlatePlugin(BasePlugin).configure({ component })`.
- Definition inference law: do not create `PluginConfig`, pass a whole-plugin
  factory generic, or call an extracted descriptor definition `FooConfig`.
  Let `createBasePlugin({ name: 'foo' })` infer the descriptor and use
  `DefinitionOf<typeof FooPlugin>` only when a real exported definition
  contract is needed, named `FooDefinition`.
- Plugin capability boundary law: classify every contribution against the
  canonical `plate-plugin-creator` protocol. `initialState` declares defaults;
  `store` owns live editor-local state; `selectors` are pure store projections;
  `api` owns non-snapshot plugin services; `read` owns pure supplied-state
  queries; `update` owns active-transaction document mutation; flat native
  Plite fields own genuine editor-wide substrate; `codecs` own format
  declarations.
  Reject document reads in `api`, document mutations outside `update`, impure
  selectors/reads, plugin-scoped behavior hidden in native fields, and
  unclassifiable contributions.
- Plugin authoring stage law: keep every independent contribution in
  `createBasePlugin()` / `createPlatePlugin()`. Keep `.extend()` only for
  imported/prebuilt adaptation, a shared factory unavailable to the
  constructor, or a real earlier-capability type dependency. Keep
  `.configure()` terminal and non-widening. Native Plite fields stay flat on
  the plugin; independently reusable standalone Plite descriptors use
  `defineEditorExtension`.
- Dependency type boundary law: root
  `EditorExtensionDependencyReference` is shallow and non-generic. Keep finite
  name-keyed capability/provider carriers and their value-sensitive HKT under
  `@platejs/plite/internal`, never recursively encode exact dependency
  ancestry, and require static name+capability equivalence plus runtime exact
  descriptor identity.
- Core lowering law: author-source-to-canonical-lowered aliases are internal.
  Do not export or teach an intermediate plugin type between the one author
  object and its exact descriptor.
- React bridge law: low-level composition is exactly `react({ dom })` with one
  required object and the exact DOM descriptor. Permit one explicit erased
  implementation boundary only for the TypeScript 7 invariant-union reduction
  limit.
- Inferred local type law: do not annotate local variables whose initializer
  should infer the type. Smells like `const entries: NodeEntry<T>[] =
  editor.read...` or `const value: Value = [...]` hide type regressions at the
  owner API. Remove the annotation and fix the source API if inference is weak.
  Keep annotations only for uninferrable locals such as empty arrays,
  deliberate narrowing/widening, exported/public signatures, or external
  boundary callbacks.
- Plugin state law: plugin defaults use `initialState`; descriptor overrides
  use `.configure({ initialState })`; builder callbacks use inferred `store`;
  consumers use `editor.plugin(FooPlugin).store.get/set/subscribe`; React
  subscriptions use `usePluginStore` or `useEditorPluginStore`. Do not use or
  re-add root or scoped `getOption`, `getOptions`, `setOption`, `setOptions`,
  `usePluginOption`, or a parallel immutable `config` channel. Name-only
  portals need an owner reason: plugin self-definition cycle, React
  hook/component imported by the plugin itself, non-React layer that must not
  import a React plugin, or intentionally decoupled cross-package code. Inline
  single-owner plugin behavior in the builder context. Only a proven shared or
  independent helper should receive a narrow plugin context or required `tx`
  parameter.

Boundaries:
- allowed edit scope: the three audited package declarations, one Chinese docs
  row, and this goal plan
- package/API surfaces: `packages/list`, `packages/utils`; no API shape change
- docs/browser surfaces: one reference-table identity spelling; browser proof is
  N/A because rendering and behavior are unchanged
- non-goals: do not alter Core weak-override semantics, tests with synthetic
  plugin names, generic prose, migrations, generated registry output, or skills
- out-of-scope package errors: report without fixing unless caused by this packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- A touched package fails for a source-owned reason that cannot be resolved
  without changing the accepted `override.plugins` API or expanding scope.

Current verdict:
- verdict: main-parity-cleanup
- confidence: high; all four names already exist in `PLUGINS`
- next owner: plate-next
- keep / revert / quarantine call: keep after proof
- reason: replaces duplicated first-party literals with the accepted identity owner

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact four-row scope and non-goals recorded above |
| `plate-next` skill/rule read | yes | Read generated v67 skill completely |
| Active goal checked or created | yes | Goal created for this plan after confirming none active |
| Mode classified as named packet vs broad Core sweep | yes | Named API cleanup packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | First-party capability names resolve through `PLUGINS` |
| Broad Core drift ledger initialized when in scope | no | N/A: no broad Core sweep |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; source map recorded above |
| Output budget strategy recorded | yes | Targeted AST enumeration and capped `rg`/`sed` reads |
| Public API fork routing checked | no | N/A: accepted API shape is unchanged |
| Gap policy checked | yes | No Plite or Plate gap; constants already exist |
| Related scoped sweep policy checked | yes | Repo source/current-doc declaration sweep required after patch |
| Review-mode rename freeze checked | no | N/A: no files or public symbols renamed |
| Package review checklist initialized when in scope | no | N/A: not package review mode |
| Doctrine registry validated for package review/sync | no | N/A: no rule change or package attestation |
| Sync queue materialized when sync mode is in scope | no | N/A: not sync mode |

Work Checklist:
- Applicability: broad Core, package-review, sync, schema, transaction,
  helper-topology, rename, barrel, and compatibility-cut rows are checked as
  N/A because this packet changes only three computed first-party name keys and
  one matching docs reference. Applicable identity, sweep, proof, and handoff
  rows are evidenced below.
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
      focused proof and P2 autoreview; final plan closure runs only after package
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
- [x] Definition inference audit closed: `PluginConfig`, caller-supplied
      whole-plugin generics, `InferConfig`, and extracted `*Config` aliases are
      removed; real exported definitions use
      `DefinitionOf<typeof FooPlugin>` and the `FooDefinition` name.
- [x] Plugin capability boundary audit closed: every plugin contribution has
      exactly one canonical `initialState` / `store` / `selectors` / `api` /
      `read` / `update` / flat native field / `codecs` owner and obeys that
      owner's purity, snapshot, transaction, and editor-scope boundary.
- [x] Plugin authoring stage audit closed: independent contributions are in the
      constructor; every `.extend()` names an imported/prebuilt adaptation,
      constructor-inaccessible shared factory, or earlier capability type; no
      `.configure()` call widens the descriptor.
- [x] Dependency type boundary audit closed: root references are shallow and
      non-generic; internal carriers/HKTs stay internal and finite; static
      portals prove name+capability equivalence; runtime portals prove exact
      descriptor identity.
- [x] Core lowering / React bridge audit closed: author-source normalization
      aliases are internal, and every low-level React composition call is the
      exact `react({ dom })` object form with no extra erasure.
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
| Named verification threshold | yes | Run the proof commands named in this plan | 4/4 drift rows fixed; 61/61 focused tests pass; focused type probe and MDX compilation pass |
| Broad Core drift ledger coverage | no | N/A | Named packet; no Core sweep |
| Score gate | no | N/A | No broad/package scoring mode |
| Best Plate v2 recommendation | yes | Record accepted shape | Concrete first-party weak-peer keys use `PLUGINS.*`; synthetic consumer tests retain descriptor names |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No product gap; unrelated verification blockers recorded below |
| Related scoped sweep after correction | yes | Audit all current declarations | 5 production declarations all use `PLUGINS.*`; 12 synthetic test declarations retained |
| Package file checklist | no | N/A | Not package review mode |
| Package doctrine attestation | no | N/A | No doctrine or attestation work |
| All-package sync closure | no | N/A | Not sync mode |
| Helper topology / lexical tx ownership | no | N/A | No helper or transaction behavior touched |
| Package/API proof | yes | Focused behavior and type proof | 61 tests pass; focused computed-key TypeScript probe passes; package typecheck attempted and hit unrelated Plite React error |
| Shared Core gate coverage | no | N/A | No Core API/runtime change |
| Non-Core package error triage | yes | Classify unrelated proof failures | `packages/plite-react/src/plugin/with-react.ts:178` generic cast error is outside this packet |
| Source audit | yes | Enumerate and classify declarations | AST audit: production 5, tests 12, total 17; zero raw first-party override keys |
| Rename ledger | no | N/A | No rename |
| Extracted-file inventory | no | N/A | No extracted source files; generated goal plan is deliberate proof state |
| P2 autoreview / review | no | N/A | Four token-level identity substitutions; exact audit and focused tests are proportional |
| Final lint/check | yes | Run scoped checks | Biome checked 3 TS files; `git diff --check` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below; only external proof blockers need mention |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-11-normalize-first-party-override-plugin-names.md` | Run after final plan evidence |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `BaseListPlugin.override.plugins` | 1 | main-parity-cleanup | `PLUGINS.indent` | AST audit and 61 focused tests | keep |
| `SingleBlockPlugin.override.plugins` | 1 | main-parity-cleanup | `PLUGINS.trailingBlock` | AST audit and 61 focused tests | keep |
| `SingleLinePlugin.override.plugins` | 1 | main-parity-cleanup | `PLUGINS.trailingBlock` | AST audit and 61 focused tests | keep |
| Chinese Single Block API reference | 1 | main-parity-cleanup | current docs | MDX compilation passed | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Concrete first-party weak-peer keys | `[PLUGINS.<name>]` | raw duplicated literals; closed `keyof PLUGINS` API | Keeps first-party identity centralized while preserving consumer-defined descriptors | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | no workaround needed | existing owners | focused proof above | no gap |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Replace concrete raw first-party names | `packages`, `apps/www/src`, current `content` docs | Babel AST enumeration plus exact `rg` for raw `indent` / `trailingBlock` override keys | 17 declarations: 5 production, 12 tests | 4 drift rows | 0 | Synthetic tests and generic/historical prose intentionally remain outside `PLUGINS` syntax |

Core drift ledger:
- Applies: no; named packet
- Manifest command: N/A: no Core sweep
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
| N/A | N/A | N/A | N/A | N/A | N/A |

Package file checklist:
- Applies: no; named cross-package packet
- Package: N/A
- Manifest command: N/A
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: N/A
- Actual row count: N/A
- Checked score-100 count: N/A
- Unchecked/deferred count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A

Package file rows:
- [x] N/A: not package review mode.

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| N/A | N/A | 67 | N/A | N/A | N/A | N/A | N/A | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| First-party override-name normalization | list, utils, current docs | duplicated raw first-party names | source audit, focused tests, type probe, MDX compile | keep | hand off exact blockers |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | N/A | N/A |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `pnpm turbo typecheck --filter=./packages/list --filter=./packages/utils` | existing `with-react.ts:178` generic cast incompatibility | Error owner is Plite React and predates/does not depend on computed key substitutions | Plite React owner |
| Browser `/cn/docs/single-block` | existing missing generated `apps/www/src/registry/components/editor/plate-types.ts` import | MDX source compiles; route cannot render until registry source is restored by its owner | www registry owner |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| Synthetic Core weak-override names | Core tests | Prove the open consumer plugin-name set | keep with test owner |
| Generic `override.plugins[name]` prose | API rules, migrations, plans | Describes arbitrary descriptors, not a concrete first-party target | keep with docs/rule owner |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Three computed first-party override keys normalized to `PLUGINS.*` |
| tests/proof | No test source changed; 61 focused tests and focused type probe passed |
| docs/templates/skills | Chinese Single Block API row normalized; goal plan added; no skill change |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Full package typecheck blocked outside packet | Plite React generic cast error | `packages/plite-react/src/plugin/with-react.ts:178` | leave to owning task |
| 2 | Browser rendering blocked outside packet | generated registry imports missing `plate-types.ts` | `apps/www/src/__registry__/index.tsx:2963` | leave to registry owner; MDX compile is green |

Findings:
- All five production `override.plugins` declarations now use computed
  `PLUGINS.*` keys.
- The 12 remaining source declarations are synthetic Core tests and correctly
  exercise consumer-defined descriptor names.
- Current docs use `PLUGINS.*`; generic API prose and migration history remain
  deliberately name-generic.

Decisions and tradeoffs:
- Keep `override.plugins` open to consumer descriptors, but require concrete
  first-party callers to use the central `PLUGINS` capability-name constants.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Package typecheck reached unrelated Plite React generic error | 1 | Run focused tests and a standalone computed-key type probe | Focused proof passed; owner recorded, no out-of-scope patch |
| Standalone whole-file `tsc` lacked workspace source mapping | 1 | Narrow probe to the actual `PLUGINS` computed-key contract | Probe passed |
| Browser docs route failed on missing generated registry source | 1 | Use successful MDX source compilation and record route blocker | No registry build or out-of-scope source edit |

Verification evidence:
- `bun test packages/list/src/lib/BaseListPlugin.spec.tsx packages/utils/src/lib/plugins/SingleBlockPlugin.spec.tsx packages/utils/src/lib/plugins/SingleLinePlugin.spec.tsx` -> 61 pass, 0 fail.
- focused TypeScript probe importing the live `PLUGINS` source -> pass.
- `PLATE_WWW_DYNAMIC_DOCS=1 pnpm --dir apps/www build:source:dev` -> MDX generated successfully.
- `pnpm exec biome check --write <three touched TS files>` -> checked, no fixes.
- `git diff --check -- <packet files>` -> pass.
- AST source audit -> production 5, tests 12, total 17; every production key is
  `PLUGINS.indent` or `PLUGINS.trailingBlock`.
- Browser `/cn/docs/single-block` -> blocked by existing missing
  `@/registry/components/editor/plate-types.ts` import in generated registry.

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Normalize first-party weak-override keys | complete | Four drift rows fixed; focused proof and full declaration audit recorded above | mechanical plan check |

Final handoff contract:
- target surface and mode: named first-party weak-override identity packet
- files/APIs reviewed: all 17 source declarations plus current docs references
- broad Core drift score coverage: N/A
- package file checklist coverage: N/A
- doctrine start/final version and source-fingerprint state: v67 unchanged
- version registry evidence and remaining stale/drifted count: N/A
- best Plate v2 recommendation: concrete first-party targets use `PLUGINS.*`;
  consumer-defined plugins use descriptor `.name`
- verdict matrix summary: four `main-parity-cleanup`, no gap or hard cut
- Plite/Plate gaps or blockers: no product gap; package/browser proof blockers
  are owned outside this packet
- related scoped sweep query/active scope/matches/patched/deferred: AST audit over
  packages/apps source, plus exact current-doc `rg`; 17 source matches, 4 drift
  rows patched, 0 deferred production rows
- out-of-scope matches discovered: 12 synthetic test declarations and generic
  prose intentionally retained
- changes made: three source keys and one Chinese docs reference
- tests/proof commands: 61 focused tests, type probe, MDX compile, Biome,
  diff-check, AST audit
- old compatibility names audited: N/A; this removes duplicated literals, not
  a compatibility API
- needs attention: unrelated Plite React typecheck and generated registry route
  blockers
- next best Plate Next packet: return to the user-selected API review

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure |
| Where am I going? | Mechanical plan check and goal completion |
| What is the goal? | Normalize all concrete first-party weak-override keys to `PLUGINS.*` |
| What have I learned? | Five production declarations exist; twelve remaining declarations are synthetic tests |
| What have I done? | Fixed four drift rows and completed focused proof |

Timeline:
- 2026-08-11T08:43:43.229Z Goal plan created.
- 2026-08-11 Applied the three source-key and one docs-reference corrections.
- 2026-08-11 Focused tests passed 61/61; type probe, MDX compile, Biome, diff
  check, and full declaration audit passed.
- 2026-08-11 Recorded unrelated package typecheck and browser route blockers
  without expanding scope.

Open risks:
- The broader package typecheck and rendered docs route remain blocked by
  unrelated shared-checkout errors named above. The changed identity keys and
  MDX source have direct focused proof.
