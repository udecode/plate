# v53 to v54 automatic ast migration

Objective:
Close the automatic v53-to-v54 AST migration plan; done when API winner,
ownership, adoption, full-coverage gates, and check-complete pass; plan
docs/plans/2026-08-17-v53-to-v54-automatic-ast-migration.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-17-v53-to-v54-automatic-ast-migration.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- package-api
- browser
- agent-native

Mode:
- `standard`: the source and prior plans already settle the available runtime,
  schema, CLI, and migration mechanisms. The remaining work is one public API
  decision plus bounded adoption and proof planning.

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.
- One winner is selected among editor option, migration plugin, normalizer, and
  CLI-only execution. Every losing public surface has a cut/adoption answer.
- Skipped-version behavior is explicit: a source at v53 and target at v55 must
  execute exact target-version steps 54 then 55, with gaps and downgrades
  rejected.
- The plan defines complete first-party v53.3.6 AST inventory coverage, one
  shared runtime/CLI migration engine, History/Yjs boundaries, and exact
  regression proof without claiming mathematical regression freedom.

Verification surface:
- Live `CreatePlateEditorOptions`, root-plugin ordering,
  `transformInitialValue`, its complete production consumer set, current versioned migrations,
  `migratePlateAstIdentities`, CLI migration scaffolding, generated schema
  diffing, current migration docs, `origin/main` v53.3.6 AST identity source,
  and the active rewrite regression-harness plan.
- Planning proof: exact public-reference inventory, resolved decision ledger,
  execution slices, proof matrix, high-risk scenarios, and final
  `check-complete`.
- Execution proof: Core/Plate/CLI package tests and typechecks, migration
  manifest coverage checker, runtime/CLI parity, generated-schema validation,
  History/Yjs tests, focused Browser routes, docs checks, source/mirror sync,
  P2 autoreview, and applicable root gates.

Constraints:
- Planning only until the user explicitly accepts this exact plan and invokes
  `plate-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Preserve the clean canonical v54 AST. Migration runs only on complete
  external document input before schema fitting; normal editing and
  normalization never accept legacy shapes.
- Use one migration implementation for runtime and CLI. No copied maps,
  feature-plugin ordering contract, dual schemas, implicit source guessing, or
  silent lossy fitting.
- Persisted source identity stays in the application-owned document envelope.
  Never infer a version from AST strings or make npm package version the sole
  schema identity for custom applications.
- Scope the compatibility claim to the frozen first-party Plate v53.3.6 AST at
  `origin/main` commit `2f87593f95`. Custom application schemas require an
  application-owned migration when the v54 profile cannot prove intent.
- An explicit versioned migration plan is application policy, not a runtime
  compatibility shim. Applications may retire steps only after advancing the
  declared support floor beyond every persisted source that needs them.

Boundaries:
- In scope: the v53-to-v54 migration profile; Plate editor construction input;
  `platejs/migrations`; removal of three feature migration plugins and the
  public identity helper; CLI dry-run/check/write execution; current docs,
  migration notes, release metadata, registry/app adoption, History/Yjs
  handoff, and regression harness integration.
- Source owners: Plate Core editor input pipeline; `packages/plate` versioned
  migration profile; `packages/cli`; Basic Nodes, Media, Table, and Utils
  migration sources/tests/exports; app/registry editor composition; docs and
  agent doctrine.
- Non-goals: changing the canonical v54 schema selected by separate API work;
  a generic migration DSL or registry; automatic database adapters; live mixed
  v53/v54 Yjs rooms; migration through normalizers; compatibility aliases;
  editing CI-controlled templates or generated registry output.
- Direct Plite boundary owners: existing compiled schema assertion/fitting,
  selection mapping, History identity, and Yjs schema negotiation only. No new
  Plite migration API is planned.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if the current complete-input pipeline cannot guarantee the
  migration runs before plugin preparation/schema fitting, or if the frozen
  v53 first-party AST cannot be inventoried without unresolved semantic rows.
  Neither condition remains in planning evidence.

Plate Plan state:
- status: complete
- phase: complete
- next: none
- handoff: prepared for implementation completion

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Harsh verdict, one winner, automatic migration, editor-option-versus-plugin decision, CLI role, cuts, and full-coverage regression proof are recorded above. |
| Active goal and plan verified | yes | Active goal names this exact plan and its binary readiness threshold. |
| Current owners read | yes | Read current Core input pipeline/order, four migration APIs and tests, CLI scaffolding, schema diff/compiler, docs, generated contract, latest CLI/runtime plans, and rewrite harness. |
| Best API target resolved | yes | Research-corrected `best-api review`: hard-cut `transformInitialValue`; editor configuration is an exact target-version `migrations` plan over a versioned persisted-document envelope; `migrateDocument` is the shared pure runner; installed-plugin invariant preparation is `prepareDocument`. Migration plugins, normalizers, CLI-only, per-node versions, and scattered helpers lose. |
| Mode and execution boundary resolved | yes | Standard agent-led planning only; execution requires explicit acceptance of this exact plan. |
| Docs pack selected | yes | Current editor/migration/API teaching and registry migration notes must adopt one path. |
| `docs-creator` loaded | yes | Loaded before editing editor, controlled-value, Core API, plugin API, and Utils docs. |
| Docs lane selected | yes | Current-state editor option/API reference plus versioned migration guide and registry migration notes. |
| Target docs and nearest sibling docs read | yes | Read editor schema/migration section, controlled/deferred-load guidance, Utils identity helper docs, API transform docs, and registry migration notes. |
| Docs style doctrine read | yes | Root AGENTS and Plate Vision require current-state reference prose; versioned migration guide may state upgrade procedure without polluting ordinary docs. |
| Documented source owner identified | yes | Live Core option/type and `platejs/migrations` exports own claims; docs follow them. |
| Package/API pack selected | yes | Core editor options, `platejs/migrations`, feature migration subpaths, and CLI command surface change. |
| Public surface or package boundary identified | yes | `@platejs/core`/`platejs` editor construction and plugin authoring, `platejs/migrations`, Basic Nodes/Media/Table migration exports, Utils helper, and `@platejs/cli`. |
| Release artifact path selected | yes | Published package changesets apply; registry changelog applies only where copied upgrade guidance changes. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before repairing package release prose; duplicate Utils major metadata was consolidated. |
| Barrel/export impact decision recorded | yes | Feature migration subpaths/files and Plate migrations exports change; execution runs `pnpm brl` and package build/pack checks. |
| Browser pack selected | yes | Migrated documents must render and edit through real Plate routes. |
| Browser route / app surface identified | yes | Add one v53 migration demo/fixture route or reuse `/blocks/editor-basic` with a pinned v53 initial value; include table, media, list, code, marks, and deferred replacement. |
| Browser tool decision recorded | yes | In-app Browser for ordinary editor behavior; Chrome/Computer are N/A because no native browser/OS surface changes. |
| Console/network caveat policy recorded | yes | New migration/schema/render errors block execution; unrelated generated-registry failures remain exact caveats and do not become success. |
| Agent-native pack selected | yes | Best API, Plate Plan, plugin creator, Plate Next, and docs teaching currently encode scattered/explicit-only migration law. |
| Agent-facing action surface identified | yes | Future agents choosing migration owner, editor setup, package migration exports, CLI, and proof. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**` and relevant Vision source; regenerate `.agents/skills/**` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded after doctrine repair; API, CLI, docs, generated mirrors, and proof routes have one discoverable owner chain. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers; no bridge is selected.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, transform, and demo is source-backed or an explicit planned artifact.
- [x] Docs pack: execution will use current-state reference voice; versioned upgrade prose stays in the migration owner.
- [x] Docs pack: no new link/anchor is authored during planning; execution verifies every changed leaf route and link.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: package changesets apply; registry changelog applies only to copied migration guidance.
- [x] Package/API pack: N/A during planning; execution loads `changeset` before release prose.
- [x] Package/API pack: registry-only deltas use the registry changelog and never replace package changesets.
- [x] Package/API pack: N/A no-artifact path; published package APIs and CLI behavior change.
- [x] Package/API pack: hard cuts and the transient migration policy are explicit.
- [x] Package/API pack: execution commands are named in the slices/proof matrix; no package code changed during planning.
- [x] Package/API pack: execution runs `pnpm brl` and updates applicable release metadata.
- [x] Browser pack: migrated v53 fixture, initial/deferred loads, editing outcome, and route strategy are recorded.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it; native proof is N/A here.
- [x] Browser pack: execution must check console/network; planning records the exact blocker policy.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Agent-native pack: planning names `.agents/rules/**` as source; execution never edits generated mirrors directly.
- [x] Agent-native pack: changed migration routing/action owners are named for doctrine repair.
- [x] Agent-native pack: execution runs `pnpm install` and source/mirror parity after rule changes.
- [x] Agent-native pack: N/A during planning; execution loads agent-native reviewer and resolves findings.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | API winner, losers, owners, cuts, adoption, risks, slices, and proof gates are resolved. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Current Core option/order, migrations, CLI, schema compiler, docs, plans, and pinned main version were read this turn. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | `migrations` plus plugin-owned `prepareDocument` is selected; `migrateDocument` remains the runner verb, not a one-off option. `transformInitialValue`, migration plugins, normalizers, CLI-only, per-node versions, and parallel aliases are rejected. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Five high-risk scenarios plus docs/registry/browser/release/History/Yjs owners and N/A research/provenance/device rows are recorded. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Source evidence plus seven execution slices and eight proof claims are recorded. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff fields are complete. |
| P2 autoreview | yes | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | Final three-pass migration-scope review covered 947445 bytes and returned zero accepted/actionable P0-P2 findings. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-v53-to-v54-automatic-ast-migration.md` | Passed after the final plan audit. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Planning claims were checked against current editor/controlled/API docs and registry migration notes; execution has a zero-stale-teaching audit. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | `www` docs/source parity and app typecheck passed; `/dev/document-migration` rendered the real fixture. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `pnpm --filter www check:docs` and full `www` typecheck passed. |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: plan targets editor/migration/API docs, not a plugin page rewrite. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Bounded audit identified four cut public APIs/subpaths and the surviving Core option, Plate migration subpath, and CLI owner. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package APIs and CLI behavior change; package changesets apply, with registry changelog only for copied upgrade guidance. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing package-owned major artifacts describe the final main-to-v54 API; `pnpm exec changeset status --since=origin/main` passed with no forbidden minors. |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Added the automatic-document-migrations source event, repaired old plugin instructions, regenerated JSON, and passed `--check`. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: public package and command deltas require artifacts during execution. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Affected package suites/typechecks passed; root build/typecheck completed 60/60 packages. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl` passed after feature migration subpath deletion and Plate migration export changes. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser rendered migrated mark/media/table content and accepted an edit on `/dev/document-migration`. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Fresh client-only proof tab returned no console errors or warnings. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | DOM receipt proved strong/subscript, caption figure, row header, and edited text; native proof is N/A. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` regenerated mirrors; Plate Next doctrine v95 validation passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Plan names best-api, Plate Plan, plugin creator, Plate Next, docs creator, and Vision as adoption owners. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS: runtime configuration, offline CLI, scaffold, registry adoption, docs, release artifacts, and proof commands each have one source owner and route. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Current migration/runtime/CLI/schema/docs/main owners and latest plans read | Decide |
| Decide | complete | Editor option selected; plugin/helper/normalizer/CLI-only paths rejected | Prove and hand off |
| Prove and hand off | complete | Adoption, risks, slices, proof matrix, and handoff recorded | User review |
| Execute slices 1-7 | complete | All seven slices implemented; package, docs, Browser, doctrine, release, agent-native, and P2 review gates passed | Close |

Decision brief:
- outcome: one automatic v53-to-v54 document migration at the editor's complete
  input boundary that naturally composes through v55 and later releases, reused
  unchanged by offline CLI execution.
- chosen shape:
  `defineDocumentMigrations(EditorSchema, { sourceFingerprints, unversioned, steps })`
  binds exact target-version steps and historical fingerprints to the
  application schema lineage.
  `initialValue` and complete replacements accept either a current document or
  a persisted envelope containing `{ document, schema }`; the editor's
  `migrations` option invokes the shared `migrateDocument` runner. A source at
  v53 and target at v55 runs steps 54 then 55. Host migrations run before
  installed `prepareDocument` invariants, schema fitting, and publication. The
  CLI invokes the same plan and runner for dry-run/check/write workflows.
- strongest rejected alternative: keep Script, Media, and Table migration
  plugins plus `migratePlateAstIdentities`, then add a package migration kit or
  CLI wrapper. That exposes ordering as product composition, permits partial
  installs, duplicates traversal and ownership, and still cannot guarantee one
  complete main-to-v54 migration.
- consequence: hard-cut the three public migration plugins/subpaths and the
  public identity helper/type; hard-cut `transformInitialValue`; add the
  versioned document envelope, exact `migrations` plan, and shared
  `migrateDocument` runner; move the sole surviving production plugin invariant
  owner, Element ID, to `prepareDocument`; consolidate release migration laws;
  add CLI execution without making CLI the runtime authority; repair
  docs/doctrine that say Plate never applies a migration automatically.

Ideal public call sites:

```tsx
import {
  defineDocumentMigrations,
  migratePlateV54,
  migratePlateV55,
} from 'platejs/migrations';
import { usePlateEditor } from 'platejs/react';

export const EditorMigrations = defineDocumentMigrations(EditorSchema, {
  unversioned: 53,
  steps: {
    54: migratePlateV54,
    55: migratePlateV55,
  },
});

const editor = usePlateEditor({
  initialValue: persisted, // { document, schema }
  migrations: EditorMigrations,
  plugins: EditorKit,
  schema: EditorSchema,
});
```

Application-specific steps remain ordinary exact functions:

```tsx
export const EditorMigrations = defineDocumentMigrations(EditorSchema, {
  steps: {
    2: migratePlateV54,
    3: migrateApplicationV3,
  },
});
```

Plugin-owned preparation is a separate authoring job:

```ts
export const ElementIdPlugin = defineBasePlugin('elementId', {
  prepareDocument: ({ document, store }) =>
    prepareElementIds(document, store.get()),
});
```

Pipeline law:

```txt
external document
-> select every migration step where source < step <= current
-> migrateDocument runs those steps oldest-to-newest
-> installed prepareDocument callbacks
-> schema fit and assertion
-> publish
```

Offline bulk execution:

```bash
plate migrate run --entry src/editor/plugins.ts --check documents/*.json
plate migrate run --entry src/editor/plugins.ts --write documents/*.json
```

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `transformInitialValue` | One name is both a root editor option and plugin field; it says initial although complete `value.replace` also runs it, calls a document `value`, and mixes app migration with feature preparation | Delete the name and split its two jobs | Plate Core | The current name lies about timing, input, and ownership. Keeping it would make the migration API a historical implementation leak | Migrate root callers/docs/tests to `migrateDocument`; migrate Element ID to `prepareDocument`; remove old type/cache/editOnly/docs symbols with no alias | Compile/runtime parity, zero-symbol audit, exact order and negative type proof | Broad public beta call-site churn | cut |
| App/host migration configuration | Root transform is hidden inside plugin-shaped options; one callback has no source version or skipped-release law | `migrations?: DocumentMigrations`; an exact plan bound to the current application schema, with target-version steps and an explicit unversioned support floor | Plate Core editor input + app schema owner | The host owns source lineage and support floor. A plan, not one callback, determines 53->54->55 selection and proves no gap | Upgraded apps pass one plan; current documents are no-ops; remove retired steps only after the declared support floor advances | 53->54, 54->55, 53->55, current no-op, missing step, wrong ID, future version, downgrade, and fingerprint tests | Turning migrations into a generic registry/profile or silently accepting gaps | add |
| Persisted document input | Docs define an app envelope `{ document, schema }`, but editor inputs accept only raw documents and therefore lose source identity | Complete external inputs may be a raw current document or a `PersistedDocument` envelope containing document plus source schema identity | Plate input boundary + app storage owner | Automatic version selection is impossible without trustworthy source identity; npm version and AST sniffing are lies | Initial and deferred load paths unwrap the same envelope; v53 raw data uses explicit `unversioned: 53` only during the support window | Envelope parsing, ID/version/fingerprint checks, raw-current path, legacy-floor tests | Accidentally embedding schema identity into canonical editor JSON or making Plate own storage | rearchitect |
| Migration runner | Proposed `migrateDocument` editor option would force all future branching into one callback | Keep `migrateDocument(input, plan, context)` as the pure fail-closed runner used by runtime and CLI; it is not an editor option | `platejs/migrations` | The verb is good; the configuration shape was not. One runner can select and execute exact steps everywhere | Runtime calls automatically for versioned input; app loaders and CLI may call it directly | Runtime/CLI byte parity, applied-step report, deterministic errors | Exposing runner internals or duplicate selection logic | add |
| Installed feature preparation | Plugins currently use the same transform field; after migration cuts only Element ID remains in production | `prepareDocument?: PrepareDocument`; deterministic installed-plugin invariant preparation after host migration and before fit | Plate plugin authoring/Core compiler | Feature invariants are permanent installed behavior, not source-version migration. `prepare` states purpose without claiming canonical normalization | Rename Element ID owner and plugin cache/editOnly field; keep exact descriptor context and deterministic dependency/order law | Element ID missing/legacy/duplicate IDs, read-only, configured state, dependency order, no-op sharing | Future plugins may abuse preparation for legacy compatibility; doctrine and review must reject that | rename |
| Callback vocabulary | Current callbacks use `{ value }` despite requiring a complete editor document object | Migration steps and plugin preparation receive `{ document, editor }`; preparation additionally receives its exact plugin context | Core public types | `document` names the semantic input; `value` is overloaded across root arrays, documents, store state, and arbitrary values | Migrate implementations/tests/docs with contextual inference and no annotations/casts | Declaration/type tests for exact input/return and rejection of arrays/unknown output | Type inference regression at Base/Plate layers | rename |
| Script/Media/Table migration plugins | Three public descriptors under feature `/migrations` subpaths | Delete descriptors, exports, package subpaths when empty, and plugin-specific public setup | `platejs/migrations` release profile | They are historical steps of one v54 transition, not three user capabilities; plugin ordering/omission is the wrong correctness boundary | Move pure laws and fixtures into consolidated profile tests; remove changelog instructions that install separate plugins | Every prior fixture conserved plus aggregate/ordering tests | Losing configured-type or ambiguity behavior during move | cut |
| `migratePlateAstIdentities` | Public generic rename helper with caller-authored maps | Private implementation detail inside `migratePlateV54`; remove public function/type/docs | Plate v54 migration owner | A rename helper can produce structurally wrong documents and falsely looks like a complete migration | Replace docs/callers with the one profile; custom apps write application migrations through existing CLI scaffold | Identity rows, collisions, nested-domain preservation, configured schema identity | Custom users may have adopted the beta helper; beta hard cut plus migration docs is preferable to preserving a footgun | cut |
| Normalizers/corrections | Current-schema invariant repair after fitting/publication | Never recognize v53 shapes | Plite/current feature owners | Legacy nodes may be rejected or altered before normalization; repeated normalizers create runtime/history cost | None | Source audit plus malformed/current-schema tests | Someone may try to restore a local legacy normalizer | reject |
| CLI execution | `plate migrate new` scaffolds a pure app migration and explicitly never runs it | Add version-agnostic `plate migrate run`: dry-run by default, `--check`, and explicit `--write`; load the current schema and migration plan, then invoke the exact runtime runner | `@platejs/cli` | The chain already knows source and current versions, so a `v54` command would duplicate target identity and become stale at v55 | Preserve `migrate new` for app schema steps; add file/stdin runner and programmatic DB example, no DB adapter framework | Runtime/CLI byte parity, selected-step report, exit codes, atomic writes, no-op mtimes, invalid/gap/future input | Generic file tooling cannot own database transactions or live rooms | add secondary owner |
| Frozen source profile | Current helper tests cover 23 example renames; no complete v53 contract exists | Version-scoped v53.3.6 manifest pinned to `2f87593f95`, classifying every first-party persisted identity/property/shape | Plate migration package/test owner | A moving `main` label or representative fixtures cannot prove coverage | Generate/audit once from git source; commit as migration evidence, never expose as current AST registry | Manifest checker: expected=reviewed, zero unclassified, every changed row references tests | Recreating `NODES` as live API would reverse the identity hard cut | add historical artifact |
| Schema fitting | Migration currently relies on editor initialization to fit afterward | Migration creates lossless construction input; target fitting may add declared defaults but must not silently delete/replace data | Core/Plite schema owner | Auto migration cannot use fitting as a garbage disposal | Compare pre/post fit changes and whitelist only target-schema construction/default effects | Target `assertDocument`, no undeclared loss report, malformed fixtures | A permissive fitter can hide missing transforms | gate |
| History and Yjs | Initial-value migrations do not rewrite serialized operations or live shared rooms | App-owned offline migration or history invalidation; new schema-versioned Yjs room before v54 clients connect; mixed peers rejected | History/Yjs app boundary | A document function cannot reinterpret old operations or coordinate live peers | Current docs/examples state exact cutover procedure | History identity tests, Yjs mixed-version rejection, snapshot migration fixture | Claiming runtime plugin compatibility for collaboration would be false | gate |
| Documentation and doctrine | Docs teach four migration entrypoints, expose `transformInitialValue` as plugin/runtime vocabulary, and CLI says never automatic | Teach `migrateDocument` for host source-version upgrades, `prepareDocument` only for installed current-schema invariants, and the same CLI engine for offline storage; keep ordinary latest-state docs free of legacy shapes | Docs + best-api/Vision/workers | Each name states one owner and job; accepted change reverses reusable prior guidance | Update EN/CN editor/migration/plugin API docs, registry notes, best-api and affected worker rules; regenerate mirrors | Source/docs stale scans, docs parser, source/mirror parity, agent-native review | Migration prose leaking into ordinary current-state reference pages or `prepareDocument` becoming a compatibility dumping ground | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Frozen v53 contract | Plate migrations + test tooling | Pin v53.3.6 source; inventory every first-party persisted type/property/shape; classify unchanged/rename/structural/non-document/app-owned; attach test IDs | Accepted plan | Zero unclassified rows and no live current-schema catalog export | Manifest checker and pinned-source receipt |
| 2. Versioned input and plan | Plate Core + app schema | Add `PersistedDocument`, `DocumentMigrations`, `defineDocumentMigrations`, and editor `migrations`; bind target to current schema; select exact ascending steps; fail closed on gaps, wrong lineage, future/downgrade input, and fingerprint mismatch | Accepted API | 53->55 executes 54 then 55; raw current documents remain simple; no source guessing | Core type/declaration/runtime selection/envelope tests and generated migration type continuity |
| 3. Migration/preparation pipeline | Plate Core + `packages/plate/src/migrations` + affected feature/Utils owners | Add shared `migrateDocument` runner and plugin `prepareDocument`; use `document`; enforce migrations -> preparation -> fit/assert -> publish; implement `migratePlateV54`; remove four old migration APIs and `transformInitialValue`; migrate Element ID | Slices 1-2 complete | One runner, exact release steps, one permanent feature-preparation owner, consolidated suite, and zero rejected symbols/exports/docs setup | Core ordering/read-only/selection/rollback tests, focused migration tests, public export audit, package builds |
| 4. CLI runner | `@platejs/cli` | Add `plate migrate run`, dry-run/check/write/file/stdin handling, current editor-module and migration-plan loading, atomic publication, exact selected-step report; reuse `migrateDocument` | Runtime engine stable | CLI and runtime output are byte-identical; check writes nothing; write is explicit and crash-safe | CLI tests/typecheck/build/pack/bin plus parity/no-op/gap/future/error tests |
| 5. Persistence and app adoption | History, Yjs, registry/apps | Persist and pass `{ document, schema }`; add exact application migration plans and unversioned v53 floor; migrate/invalidate history; migrate Yjs snapshot to a new room; add fixture route | Slices 2-4 green | No mixed room path; 53->55 chains automatically; canonical documents render/edit and can be resaved | Envelope/History/Yjs tests, registry/app typecheck, Browser migration fixture |
| 6. Full regression coverage | Rewrite harness + package owners | Connect every changed manifest row to model/format/browser behavior cases; add generated/fuzz documents and runtime/CLI parity gates | Adoption stable | 100% classified/exercised first-party v53 profile; no accepted behavior regression in named scope | Coverage checker, package suites, Markdown/HTML/DOCX proofs where owned, Browser cases, applicable Plite/Plate gates |
| 7. Public/doctrine closure | Docs/release/agent owners | Cut stale migration and `transformInitialValue` teaching, add current `migrateDocument`/`prepareDocument` workflow, changesets/changelog, best-api repair, worker audit, mirror sync, lint/barrels/review/checker | Product source frozen | One discoverable path per job, no stale symbols/examples, zero accepted P0-P2 findings | Docs checks, changeset status, registry changelog checks, `pnpm install`, `pnpm brl`, lint, agent-native review, P2 autoreview, check-complete |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Versioned `migrations` is the correct host configuration | The host chooses source lineage/support floor; Dexie and Redux Persist prove ascending target-version steps solve skipped releases, while Zustand proves source version must travel with stored data | Exact plan/envelope typing plus 53->54, 54->55, 53->55, gap, future, downgrade, wrong-ID and no-op tests | passed |
| `migrateDocument` is the correct shared runner | Runtime and CLI need identical step selection/execution, validation, diagnostics, and applied-step reporting | Runtime/CLI byte parity and error parity over the same plan | passed |
| `prepareDocument` is the correct plugin owner | After migration APIs are cut, Element ID is the only production non-test plugin consumer; it enforces installed current-schema identity rather than a release migration | Element ID parity, deterministic plugin ordering, read-only and negative legacy-use proof | passed |
| `transformInitialValue` must die | Its name is false for deferred replacements, `value` hides complete-document semantics, and one channel mixes host migration with feature invariants | Zero old symbol across public types/runtime/cache/editOnly/tests/docs; no compatibility alias | passed |
| Plugin APIs are wrong | Repo production source has no installed use of the three migration descriptors; only exports/tests/migration notes remain | Delete symbols/subpaths, conserve every prior behavioral fixture in consolidated suite, zero stale matches | passed |
| Generic identity helper is incomplete | It rewrites only declared type/property names; structural Script/Media/Table laws require more | Consolidated structural cases, especially v53 `th` preserving header semantics | passed |
| CLI is secondary, not authority | Current CLI scaffolds but cannot intercept runtime/deferred documents or generic application storage | Same-function runtime/CLI parity and explicit DB/Yjs handoff | passed |
| Canonical documents pay no semantic cost | Existing migrations promise idempotence/structural sharing individually | Whole-profile canonical no-op, reference preservation, repeated-run equality, no-op CLI mtimes | passed |
| First-party v53 coverage is complete | `origin/main` v53.3.6 exposes 60 unique `NODES` identities; current tests cover only bounded subsets | Zero-unclassified manifest, every migration row test-linked, generated document laws, high-risk behavior/browser rows | passed |
| Migration is lossless inside supported scope | Existing feature tests preserve roots/custom JSON and reject ambiguity | Target schema validation, fit-loss audit, format/behavior parity, collision/unknown diagnostics | passed |
| History/Yjs claims remain honest | Existing migration lifecycle handles documents only | Offline snapshot/history receipts and mixed-schema rejection; no live-room auto-migration claim | passed |

Conditional evidence:
- High-risk scenarios:
  1. A raw rename turns v53 `th` into an ordinary cell and loses header
     semantics. Gate the ordered structural transform and visible table proof.
  2. A custom current schema legitimately owns a v53-looking identity or
     property. The migration must use compiled schema ownership and fail or
     preserve explicitly instead of guessing.
  3. Runtime and CLI drift, producing different canonical documents. Both paths
     must invoke the same exported function and pass byte-parity fixtures.
  4. Target fitting silently drops an unsupported legacy field. Compare
     migration/fitting changes and reject undeclared loss.
  5. A populated Yjs room admits old and new clients. Named schema identity and
     room cutover must fail closed before connection.
- External research: completed in
  `docs/plite/research/2026-08-17-document-schema-migrations/`. Dexie is the
  strongest version-chain precedent; Redux Persist independently confirms
  ascending target-version selection; Zustand contributes source-version
  envelope/writeback law; Sanity contributes the shared dry-run/write runner.
  Lexical, ProseMirror, and Tiptap are negative precedents against per-node
  versions, current-schema parsing as migration, and feature-local utilities.
- Issue/PR provenance: N/A. Direct user-selected beta architecture work; no
  public issue or PR mutation is authorized.
- Docs/registry/browser/release/behavior-law owners: versioned migration guide,
  editor setup/API reference, registry migration notes, package changesets,
  registry changelog, rewrite regression harness, and a migrated-fixture
  Browser route apply. Raw-device testing is N/A because persisted document
  transformation does not change native input behavior.

Findings:
- Runtime editor option wins. CLI-only cannot protect remotely fetched or
  deferred complete values, and a plugin makes data correctness depend on
  feature composition/order.
- `transformInitialValue` is not the final API. It says initial while running
  on every complete replacement, calls a complete document `value`, and uses
  one plugin-shaped hook for two different owners.
- The clean split is a versioned host/app `migrations` plan, the shared pure
  `migrateDocument` runner, and installed-plugin `prepareDocument` invariants.
  A one-off callback cannot own skipped-release selection.
- Current Core documentation guarantees deterministic reapplication across
  initialization and every complete `value.replace`. Execution must turn the
  incidental synthetic-root ordering into an explicit pipeline contract:
  host migration first, plugin preparation second, fitting third.
- Element ID is the only production non-migration plugin that currently uses
  `transformInitialValue`. Its missing-ID/duplicate-ID job is permanent feature
  preparation and cleanly validates the `prepareDocument` side of the split.
- Dexie is the best architecture precedent: target-version steps are sorted and
  applied oldest-to-newest, independent of declaration order, and old support
  floors can be retired deliberately. Redux Persist confirms the same pure
  selection rule but is too weakly typed and silently tolerates gaps.
- Zustand proves source version belongs beside persisted data and successful
  migration should be written back at the current version; Plate must keep that
  envelope app-owned because the editor does not own storage.
- Sanity has the best offline runner, not the best version model. Its one
  definition powers dry-run and writes with streaming, batching, concurrency,
  progress, and uncertain-outcome reporting.
- No editor offers a complete model. Lexical explicitly warns that flat
  per-node versions do not compose. ProseMirror only validates current-schema
  JSON. Tiptap's local math utility repeats Plate's fragmented starting point.
- Current production source installs none of the three migration plugins. Their
  live footprint is exports, tests, and migration guidance, making a beta hard
  cut materially cheaper than preserving four entrypoints.
- `migratePlateAstIdentities` proves collision-safe traversal, but it cannot
  express structural semantics. It should survive only as private code if the
  consolidated migration still benefits from it.
- The CLI's generated skeleton says Plate never runs migrations automatically.
  That sentence becomes false for an explicitly configured v54 input callback
  and must be repaired. `plate migrate new` remains explicit app-schema
  scaffolding; only the first-party v54 profile gains an executable command.
- The latest rewrite harness correctly rejects an absolute regression-free
  claim. The plan can promise complete classified/exercised first-party v53
  coverage and zero accepted regression within the named proof matrix.

Decisions and tradeoffs:
- `migrations` over one `migrateDocument` option: configuration declares a
  version chain; the singular verb remains the runner. This directly handles
  v53->v55 without branching or manual composition at every caller.
- Target-version keys over source-version keys: each step describes the schema
  it produces, so source 53 and current 55 deterministically select 54 then 55.
- `defineDocumentMigrations` over an untyped object: the builder must bind the
  plan to one schema lineage, prove step continuity from generated snapshots,
  reject gaps/excess keys, and preserve finite declaration output. It is not a
  global registry or plugin.
- App-owned `{ document, schema }` envelope over AST sniffing or embedded npm
  version: application schema identity is the real persistence boundary.
  Unversioned v53 input requires one explicit support-floor declaration.
- `migrateDocument` over `migration`, `migrate`, or `transformDocument` for the
  runner: it states the operation and object without becoming configuration.
- `prepareDocument` over `transformDocument`, `normalizeDocument`,
  `beforeDocumentFit`, or `onDocumentLoad`: prepare describes deterministic
  input work without implying every edit, canonical normalization, compiler
  taxonomy, or side-effectful events.
- Split over simple rename: app source-version policy and installed plugin
  invariants have different owners, lifetimes, composition, and omission laws.
- Editor option over plugin: migration is source-input policy. It has no
  independent omission/replacement fallback as an editing capability and
  should not appear in editor plugin discovery or composition.
- Runtime over CLI as primary: runtime is the only place that sees every
  complete value load. CLI remains essential for bulk/offline mutation but
  cannot own arbitrary databases, history, or live collaboration.
- One versioned owner over feature-owned public steps: a whole document crosses
  one release boundary and requires ordered, all-or-nothing semantics. Keep
  current feature knowledge in exact version steps and private helpers/tests;
  publish one plan and one runner rather than feature entrypoints.
- Frozen migration manifest over a live AST catalog: the artifact proves a
  historical source contract without resurrecting `NODES`, `KEYS`, or a
  universal current schema registry.
- Explicit support floor over implicit detection: applications opt unversioned
  v53 documents into the chain during upgrade. Canonical/version-current documents are no-ops;
  custom schemas never get silently reinterpreted merely because a string
  resembles v53.

Review fixes:
- Bind every historical envelope version to its generated source fingerprint;
  reject absent or mismatched identity before running a step.
- Add `@plate/editor-plugins` to the copied `editor-default` dependency graph.
- Compare CLI input/output as JSON values so formatting alone never changes
  `--check`, writes, content, or mtime.
- Resolve exact `EditorKit`, `EditorSchema`, and `EditorMigrations` exports;
  empty plugin tuples and unrelated arrays are deterministic.
- Tag internally synthesized defaults and preparation replays with current
  schema identity so non-idempotent release steps never rerun.
- Preserve and map envelope selections after every version step, through
  preparation, and in CLI output.
- Clean CLI temporary directories when bundling or evaluation fails.
- Gate legacy type/property work to known first-party element identities and
  preserve custom types, properties, and claimed legacy aliases.
- Pass media element context into direct legacy caption text so script marks
  migrate before fitting.
- Require typed step `FromVersion` to equal the decimal predecessor of its
  target key and prove adjacent output/input compatibility.
- Move feature-package consumer contract specs beside their real schema owners;
  `packages/plate/src/migrations` remains the sole profile owner and `www`
  remains the composed Browser owner.
- Repair bounded current-tree root gates: flat Plite CI paths, browser-spec
  routing, registry test imports/mocks, and the AI-menu effect lint error.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| One bounded migration search included a large generated public API JSON match | 1 | Exclude generated/public projections and read exact source owners | Subsequent reads were exact files and capped ranges; no decision depended on generated prose. |
| One `rg` pattern used backticks inside a double-quoted shell string | 1 | Use a single-quoted pattern with no shell interpolation | Corrected immediately; no file or decision impact. |

Verification evidence:
- Source review: current Core complete-input transform/type/order and exact
  `TransformInitialValue` types, the complete production callback consumer set,
  Element ID's schema generator plus duplicate/source-ID preparation,
  Script/Media/Table migration implementations and tests, public identity
  helper/tests/docs, CLI scaffold/tests, schema contract diffing, current
  editor/migration docs, v53.3.6 main AST identity source, latest runtime/CLI
  plans, and rewrite regression plan.
- Bounded public-use audit: migration descriptors have no production install
  callers; `migratePlateAstIdentities` has docs plus its package/facade export
  and tests.
- Runtime/model: Core migration/preparation/Element ID tests passed; the frozen
  v53.3.6 manifest pins commit `2f87593f95`, classifies 60 identities plus
  structural properties, and exercises aggregate and real feature schemas.
- Persistence: Plite envelope, History schema identity, and Yjs schema
  negotiation tests passed (39 focused), while docs keep history invalidation
  and Yjs room cutover app-owned.
- CLI: full 66-test package suite plus migration/scaffold regressions passed;
  runtime parity, stdin, empty kit, selection, no-op mtime, and temp cleanup are
  covered. CLI build/help and CLI/Plate package dry-runs expose the expected
  artifacts.
- Packages: eight migration-related package suites passed; root build and
  typecheck completed 60/60 packages. Fast tests passed 3096/3096; slow tests
  passed 1577 with 60 intentional skips; the slowest budget gate passed.
- Docs/registry: `www` typecheck, API manifest, MDX source parity, registry
  source, and changelog generation checks passed.
- Browser: `/dev/document-migration` rendered migrated paragraph/script marks,
  media caption, and header cell, accepted an edit, and had a clean console.
- Agent/review: source rules regenerated to skill mirrors, Plate Next doctrine
  v95 validated, agent-native review passed, and final three-pass P2 autoreview
  reported zero accepted/actionable findings across 947445 bytes.

Final handoff prepared:
- Ownership and target API: `migrations` is the Plate editor host-input
  configuration bound to a versioned persisted envelope; `migrateDocument` is
  the shared runner; `prepareDocument` is the installed-plugin invariant hook;
  `migratePlateV54` and later steps are exact target-version transforms; CLI
  invokes the same plan and runner offline.
- Public breaks and adoption: cut three migration descriptors/subpaths and the
  public identity helper/type; hard-cut `transformInitialValue`; migrate
  Element ID to `prepareDocument`; persisted applications pass
  `{ document, schema }` and one exact migration plan. The unversioned v53 floor
  is removed only when support policy advances.
- Applicable runtime/package/docs/browser decisions: Core option/order remains;
  Plate migration profile and CLI runner change; docs/release/doctrine adopt;
  one migrated-fixture browser path applies.
- Proof and execution risks: full v53 manifest coverage, structural semantics,
  configured/custom schema ambiguity, fit-loss, runtime/CLI parity, and
  History/Yjs cutover are explicit gates.
- Execution order and user attention: accept this plan, then execute slices
  1-7. No remaining API choice needs user input.

Timeline:
- 2026-08-17T09:15:48.302Z Plate Plan created.
- 2026-08-17 Read current owners and latest plans; initially selected one editor
  complete-input callback and CLI as its secondary offline executor; later
  research superseded the callback configuration with a versioned plan.
- 2026-08-17 Recorded the hard cuts, v53 coverage contract, ordered execution
  slices, proof matrix, History/Yjs boundary, and doctrine repair.
- 2026-08-17 User challenged the surviving hook name. Reopened `best-api`,
  rejected a cosmetic rename, and split host migration from installed feature
  preparation as `migrateDocument` and `prepareDocument`.
- 2026-08-17 GitHub/OSS research inspected seven repositories at exact commits.
  Dexie won version-chain architecture; Zustand supplied envelope/writeback;
  Sanity supplied offline runner law. Revised the API from one callback to
  `migrations` plus the `migrateDocument` runner and `prepareDocument` hook.
- 2026-08-17 User accepted the revised plan with `lets go`; one-shot execution
  goal created and slices 1-7 opened without changing their decisions.
- 2026-08-17 Implemented the version chain, source fingerprints, persisted
  envelope, preparation split, consolidated v54 profile, CLI runner, registry
  adoption, docs/release/doctrine closure, Browser fixture, and full proof.
- 2026-08-17 Resolved every accepted P1/P2 review finding and ended with a clean
  three-pass P2 autoreview. Root build/typecheck, fast, slow, and slowest gates
  passed after bounded current-tree CI/test routing repairs.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete |
| Where am I going? | Handoff |
| What is the goal? | One execution-ready automatic v53-to-v54 migration plan with one API and complete proof gates |
| What have I learned? | A single migration callback cannot safely own skipped versions; target-version steps and source identity are required |
| What have I done? | Implemented slices 1-7 and passed runtime, CLI, persistence, docs, Browser, package, doctrine, and review gates |

Open risks:
- No implementation blocker remains. Persisted History and populated Yjs rooms
  intentionally remain app-owned offline cutovers; runtime document migration
  does not claim mixed-room or serialized-operation compatibility.
- Applications without an existing `{ document, schema }` envelope use the
  explicit temporary `unversioned` support floor, then write back the current
  envelope and remove that floor when old raw data is retired.
