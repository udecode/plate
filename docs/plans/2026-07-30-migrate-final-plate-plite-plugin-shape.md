# Migrate final Plate Plite plugin shape

Objective:
Migrate the accepted Plate/Plite plugin shape; done when all 12 HTML packets
plus unified `on.*` authoring are adopted, stale APIs are zero, and package,
docs, browser, release, and review gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-30-migrate-final-plate-plite-plugin-shape.md

Template:
docs/plans/templates/major-task.md

Applied packs:
- docs
- package-api
- agent-native
- browser

Major source:
- type: accepted local architecture/code-diff artifact plus later user
  corrections
- id / link:
  `/Users/zbeyens/.codex/visualizations/2026/07/24/019f9471-98c6-7e01-ad02-cc4de59f34e1/plate-plite-code-diff.html`
- title: Plate vs Plite - Final Code Diff
- decision to make: N/A; implement the accepted hard cut
- decision criteria: one definition-derived Plate-on-Plite grammar, exact
  inference and declaration emit, zero rejected shapes, complete repository
  adoption, and green behavior/release proof

Major lane:
- lane: architecture/public API migration
- output type: verified repository implementation
- implementation expected: yes
- affected surfaces: Plite extensions, Plate Core, every feature package,
  apps/registry, tests, docs, tooling, exports, changesets, Vision, and
  agent-facing rules
- dominant risk: simplifying the visible API while losing exact inference,
  finite declarations, runtime ordering, portal ownership, or browser behavior

Accepted implementation checkpoints:
- [x] Packet 1: descriptor identity is `name`; serialized node identity is
      `type`; definitions and descriptors retain exact inferred identity.
- [x] Packet 2: Plite `config` and its generic/context plumbing are deleted;
      Plate runtime values live in `initialState`, options, or scoped stores.
- [x] Packet 3: Plite authoring uses `read`, `update`, and `readMiddleware`.
- [x] Packet 4: one definition-owned API projects through the root and scoped
      extension/plugin portals; the parallel `pluginApi` channel is deleted.
- [x] Packet 5: Plate native extension fields live at the plugin root; the
      nested `extension` wrapper is deleted.
- [x] Packet 6: lifecycle and React DOM observation use one root, prefixless
      `on` family, including capture variants.
- [x] Packet 7: validation uses `validate` without a fictional config argument.
- [x] Packet 8: the Plate author root directly owns dependencies, conflicts,
      middleware, read/update, contributions, lifecycle, codecs, render, rules,
      shortcuts, and other native feature fields.
- [x] Packet 9: `PluginConfig`, `__config`, parallel public compiler types, and
      `InferConfig` are deleted; `DefinitionOf` is the sole public extractor.
- [x] Packet 10: factories take one object with no caller-supplied generics;
      small inferred environments remain private inference machinery.
- [x] Packet 11: `clone` is deleted; `.extend()` widens, `.configure()` is
      terminal, and `toPlatePlugin()` preserves the exact definition.
- [x] Packet 12: package, app, registry, test, docs, tooling, export, skill,
      Vision, and release consumers use the final grammar.
- [x] Static renderer correction: Base constructors and `.extend()` stay
      renderer-neutral; terminal `BasePlugin.configure({ component })` binds
      static/server renderers, while `toPlatePlugin(Base).configure()` is
      reserved for live React plugins.
- [x] Exact registry correction: every `*-base-kit.tsx`, including
      `basic-blocks-base-kit.tsx`, binds static components directly with Base
      `.configure({ component })`; no `toPlatePlugin` or React adapter import.
- [x] Hard cut: no compatibility alias, dual signature, stale public type, or
      current-state docs for the rejected grammar.
- [x] Preserve unrelated shared work and do not commit, push, or open a PR.
- [x] Prove types, tests, declarations, barrels, docs, changesets, skills,
      browser behavior, release artifacts, and zero-residual reviews.

Timed checkpoint:
- requested duration: N/A; none requested
- semantics: binary completion gates
- initial confidence score: N/A
- improvement loop: owner packet, proof, residual audit, repair, repeat
- final score / loop closure: all accepted gates closed

Completion threshold:
- All 12 packets, unified `on.*`, and the static renderer correction are
  implemented.
- Current source, tests, apps, docs, tools, exports, and release artifacts
  contain zero semantic uses of rejected plugin grammar.
- Core, Plite, affected packages, WWW, declaration, barrel, docs, browser,
  release, agent-native, and final P0/P1 review gates are green.
- The goal-plan completeness checker passes.

Verification surface:
- Exact Plite/Core type contracts, declaration builds, runtime suites, and
  package typechecks.
- Repository adoption and docs AST audits across current source.
- Real Browser workflow on static HTML, AI, and Markdown streaming routes.
- Packed release consumers under NodeNext and Bundler, Node runtime, package
  direction, and tree-shaking.
- Changeset coverage, barrel generation, v34 skill registry/parity, and two
  independent final read-only audits.

Constraints:
- Hard cut only; no aliases, shims, dual signatures, or migration helpers.
- Fix inference at its owner; no consumer casts or callback annotations.
- Preserve runtime behavior and unrelated shared work.
- Never edit `templates/**` or run `build:registry`.
- Do not commit, push, create a branch, open a PR, or mutate an external
  tracker.

Boundaries:
- Source of truth: accepted HTML, later user corrections, and current
  repository runtime/type owners.
- Allowed edit scope: affected packages, apps, current docs, tooling,
  changesets, public barrels, Vision, and `.agents/rules/**`.
- External sources: N/A; this is a repository-owned architecture.
- Browser surface: `/blocks/plate-to-html`, `/blocks/editor-ai`, and
  `/blocks/markdown-streaming-demo`.
- Tracker sync: N/A; no external mutation requested.
- Non-goals: unrelated product behavior, templates, release publication, git
  publication, and compatibility.

Output budget strategy:
- Broad audits were split by owner and reported as counts; generated, build,
  cache, template, historical migration, and changelog paths were excluded
  where they do not describe current APIs.
- Three early oversized searches were discarded and replaced with bounded
  file lists, exact slices, or dedicated checker output.

Blocked condition:
- Stop only for an unresolvable owner-generic/runtime conflict or external
  shared-writer conflict after three distinct repair attempts. Neither
  condition remains.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: user handoff
- goal_status: complete

Current verdict:
- verdict: accepted hard cut implemented
- confidence: high
- next owner: user or release owner
- reason: current source, declarations, packages, docs, browser workflows,
  packed artifacts, and residual audits agree on one grammar

Completion rule:
- Every required checklist item and gate is resolved below.
- The final completeness checker is the last ledger gate.
- This file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Twelve packets, unified events, static-renderer correction, hard cut, proof, and no-git boundary were checklisted |
| Timed checkpoint parsed | no | No duration was requested |
| `major-task` loaded | yes | Major-task instructions owned execution and closure |
| Active goal checked or created | yes | Goal points to this exact plan |
| Source of truth read before analysis | yes | Accepted HTML, current source, prior plan, Vision, and relevant skills were read |
| Major lane selected | yes | Architecture/public API migration |
| Decision criteria stated | yes | Completion threshold names API, inference, runtime, adoption, and release proof |
| Existing patterns checked | yes | Current Plite, Core, feature packages, apps, docs, tooling, and prior decisions were inventoried |
| Helper stack selected | yes | Autogoal, major-task, best-api, plate-plan, advanced types, testing, docs, changeset, browser, and review owners |
| External research decision | no | Repository source and the accepted artifact own the decision |
| Implementation expectation | yes | User explicitly authorized the complete migration |
| Workspace authority | yes | `/Users/zbeyens/git/plate-2` |
| Branch or PR expectation | no | No git publication requested |
| Output budget recorded | yes | Owner-scoped counts and bounded reads were used |

Work Checklist:
- [x] Every explicit packet, correction, scope boundary, non-goal, proof
      surface, and handoff requirement is recorded.
- [x] Current owners and prior decisions were mapped before implementation.
- [x] Facts, inference, recommendation, tradeoffs, and rejection reasons are
      separated in this record.
- [x] Advanced TypeScript, runtime, agent-native, release/docs, and final P0/P1
      pressure passes were completed.
- [x] Accepted findings were fixed; rejected findings carry source/type
      evidence.
- [x] Broad output was bounded after early oversized attempts.
- [x] Current docs use source-backed API names, imports, routes, options, and
      examples in current-state reference voice.
- [x] Docs links/routes and EN/CN parity checks pass.
- [x] Public API, export, declaration, compatibility, and package boundaries
      are explicit.
- [x] Each changed public package has a one-package changeset; effective bumps
      are 55 major and 2 patch, with zero minor.
- [x] Package typecheck, build, runtime, declaration, and release artifact
      proof is recorded.
- [x] `pnpm brl` regenerated all 58 package scopes successfully.
- [x] Agent rules were edited at `.agents/rules/**`, generated mirrors were
      synced with `pnpm install`, and v34 parity/fingerprint checks pass.
- [x] Browser routes, interactions, visible outcomes, and console state are
      recorded.
- [x] The shared checkout and no-git/no-template boundaries were preserved.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Close all accepted packets and residuals | Adoption audit passes 4,203 current files; final residual audits report P0 0, P1 0, P2 0 |
| Current-state source audit | yes | Map owners and consumers | Plite, Core, 38 feature packages, apps, docs, tooling, and releases were audited |
| Decision criteria closure | yes | Resolve every accepted packet | All twelve packets, unified `on.*`, and static renderer correction are checked above |
| Options and tradeoffs | yes | Record chosen and rejected shapes | One definition-derived grammar won; aliases, recursive public ancestry, and parallel channels were rejected |
| Review and pressure pass | yes | Run type/runtime/API reviewers | Advanced TypeScript, agent-native, residual, code/API, and release/docs reviews completed |
| Review findings closure | yes | Fix or reject grounded findings | Exact generics, finite dependency witnesses, React construction, AI ownership, checkers, docs, and static kits were repaired |
| External-source audit | no | Record ownership | No external factual dependency |
| Implementation gates | yes | Close package, docs, browser, release, and agent packs | All pack evidence is recorded below |
| Final handoff contract | yes | Record recommendation and caveats | Contract below is complete |
| Final lint | yes | Run scoped lint and record broad baseline | Scoped Biome and diff checks pass; root `lint:fix` retains unrelated shared baseline diagnostics |
| Output budget discipline | yes | Bound broad output | Early oversized output was discarded; closure used counts and dedicated checkers |
| Timed checkpoint | no | Record reason | No duration requested |
| Goal plan complete | yes | Run the plan checker | Completeness checker passes after this record |
| Docs source-backed audit | yes | Check current docs against source | 363 docs contracts and Plite docs audit pass |
| Docs links/routes/previews | yes | Validate current docs and registry sources | WWW docs parity and registry source checks pass |
| Docs parser | yes | Build content source | `pnpm --filter www typecheck` includes successful `build:source` |
| Plugin page specifics | yes | Apply current plugin reference rules | EN/CN plugin pages and feature docs use final source-backed grammar |
| Public API boundary proof | yes | Build and inspect declarations | Core privacy matrix covers 52 package trees; packed declaration consumers pass |
| Release artifact classification | yes | Cover published deltas | All 57 current changed public packages are covered |
| Published package changeset | yes | Validate one package per entry and bump policy | 77 files contain 77 one-package rows across 57 unique release packages; changeset status reports 55 major, 2 patch, zero minor |
| Registry changelog | no | Record reason | Registry edits adopt package APIs rather than define a registry-only release |
| No release artifact | no | Record reason | Published package deltas require changesets |
| Package proof | yes | Run owning checks | Strict Plite, Core, AI, Basic Nodes, feature matrix, and WWW checks pass |
| Barrel generation | yes | Run `pnpm brl` | 55 barrel tasks across 58 scoped packages succeed |
| Agent source/generated sync | yes | Sync generated resources | v34 registry and resource parity pass |
| Agent discoverability | yes | Audit owning rules | Plate Next, plugin creator, best-api, docs, UI, Vision, and resources agree |
| Agent-native review | yes | Close reviewer findings | Final agent-native/release audit reports no accepted P0/P1 |
| Browser interaction proof | yes | Exercise representative routes | Static HTML, AI dialog, and Markdown streaming workflows pass |
| Browser console/network | yes | Check app errors | No app runtime errors; known browser-extension injection excluded |
| Browser final artifact | yes | Record visible result | Static nodes render; Mod+J opens AI; Markdown streams 0/33 to 33/33 and renders `paragraph123paragraph` |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Accepted artifact, corrections, source, plans, skills, and Vision read | Current-state map |
| Current-state map | complete | Every runtime/type/docs/tooling/release owner inventoried | Implementation |
| Options and recommendation | complete | Accepted hard cut and later corrections recorded | Review |
| Review and pressure pass | complete | Type/runtime/API and agent-native pressure findings closed | Implementation |
| Implementation | complete | Plite, Core, packages, apps, docs, tooling, exports, rules, and changesets adopted | Verification |
| Verification | complete | Package, declaration, browser, docs, release, and residual gates pass | Closeout |
| Closeout | complete | Final ledger, plan checker, frozen source, and handoff ready | User handoff |

Findings:
- Plate is an opinionated authoring layer over Plite, not a parallel plugin
  model.
- Public recursively exact dependency ancestry explodes declaration size and
  recursion. Shallow public references plus a private finite installed
  capability witness preserve exact authoring without leaking compiler types.
- TypeScript needs a small private inferred environment to contextually type
  dependency-aware callbacks; pretending one self-referential input generic
  can do both jobs loses inference.
- Static renderer ownership belongs to terminal Base `.configure()`.
  `toPlatePlugin()` is wrong for server/static base kits.
- The package runner bug was repaired and every retained behavior claim comes
  from test invocations that report real files/assertions.

Decisions and tradeoffs:
- Hard cut over compatibility.
- One public descriptor generic and `DefinitionOf` over parallel public
  compiler/config types.
- Shallow public dependency references and private finite capabilities over
  recursive public descriptor graphs.
- Ordered `.extend()` stages over helper functions that pass `read`, `update`,
  or transaction objects around.
- Direct Base static configuration over React adaptation.
- Full Plate editor types remain where callbacks intentionally expose arbitrary
  installed plugin capabilities; narrow capability readers are used only where
  the implementation actually consumes a narrow surface.

Implementation notes:
- Plite owns extension definition/runtime, read/update, API projection,
  validation, lifecycle, DOM, React, History, Layout, Browser, and Yjs laws.
- Core owns exact Base/Plate definitions, stage accumulation, lowering,
  portal typing, unified `on.*`, static terminal configuration, and runtime
  materialization.
- Feature packages own domain APIs, flat commands, colocated helpers, and
  React component/hook families.
- Current docs/tooling/changesets and agent rules describe only the final
  grammar.

Review fixes:
- Exact normalized field presence, sole factory, public generic privacy, and
  finite declaration requirements were repaired at Plite/Core owners.
- Zero-argument React construction was cut; only `createReactEditor` owns the
  default DOM descriptor.
- AI dependency recursion was broken without weakening public editor callback
  contracts.
- Adoption/docs checkers now reject prefixed events and real stale plugin
  shapes without false positives on unrelated code.
- Static registry base kits use direct terminal Base configuration; the
  `basic-blocks-base-kit.tsx` correction contains nine direct bindings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Oversized broad searches | 3 | Split by owner and request counts | Later audits were bounded and dedicated checkers own residual proof |
| Cosmetic one-self-referential-generic prototypes | 3 | Preserve a private inferred environment | Exact contextual inference and declarations pass |
| Recursive public dependency ancestry | 4 | Publish shallow refs and keep finite capability witness private | D22/D32/D64 and privacy declaration contracts pass |
| Package runner false green | 1 | Repair invocation and require real assertion counts | Package and feature matrices report executed tests |

Verification evidence:
- `pnpm check:plite`: strict source/type/package/contract/browser lane passes;
  Chromium reports 698 passed, 6 skipped, and 78 of 78 bounded batches.
- `pnpm plite:release:artifacts`: 10 packed packages and 34 public subpaths
  pass NodeNext/Bundler declarations, Node runtime, direction, and bare/named
  DCE.
- Core runtime: 674/674; Core declaration/privacy: 52 package trees; AI:
  65/65; feature matrix: 1,496 tests across 36 packages.
- Post-barrel `pnpm turbo typecheck` passes Core, AI, and Basic Nodes with all
  required source builds.
- `pnpm --filter www typecheck` passes content generation, docs parity,
  registry source, main TypeScript, and package-integration TypeScript.
- `pnpm brl`: 55 successful tasks across 58 package scopes.
- Adoption audit: 4,203 current source/docs files. Checker tests: 67/67. Docs
  contracts: 363. Plite docs audit: pass.
- `pnpm changeset status`: 55 major, 2 patch, zero minor. Final release audit:
  all 57 current changed public packages are covered by 77/77 one-package
  changeset rows.
- Plate Next v34 registry validates with 42 active packages and one retired
  package; required skill resources are exact.
- Browser: `/blocks/plate-to-html` renders static editor/HTML; Mod+J opens the
  AI dialog; Markdown streaming reaches 33/33 and the expected output with no
  app runtime errors.
- `git diff --check` and all migration-scoped Biome checks pass.
- Independent final code/API and agent-native/release audits report no
  accepted P0/P1.

Final handoff contract:
- Recommendation: ship the one-grammar migration as the next breaking release.
- Confidence: high.
- Evidence: exact type/declaration contracts, real runtime suites, repository
  residual audits, docs/tooling checks, browser workflows, packed artifacts,
  and independent final reviews agree.
- Tests / commands: listed in Verification evidence.
- Browser proof: static HTML, AI dialog, and Markdown streaming routes pass.
- PR / tracker: N/A; no commit, push, PR, release, or tracker mutation was
  authorized.
- Caveats: root `pnpm lint:fix` still reports roughly 240 unrelated/shared
  baseline diagnostics; all migration-scoped lint and diff checks pass. Plate
  Next v34 has 42 intentionally stale package attestations and zero drifted
  attestations, so this is not a claim that `plate-next sync` ran across every
  package. The in-app Browser backend used its connected Chrome backend.
- Next owner: user or release owner.

Timeline:
- 2026-07-30: accepted artifact and corrections captured; owner migration
  started.
- 2026-07-31: source adoption, proof, renderer correction, release artifacts,
  and final audits completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | User handoff |
| What is the goal? | One final Plate-on-Plite plugin grammar with exact inference and zero stale consumers |
| What have I learned? | Shallow public identity plus private finite capabilities is the only compact exact dependency model; static renderers belong to Base configure |
| What have I done? | Migrated every packet and consumer, repaired the static kits, and closed package/docs/browser/release/review proof |

Open risks:
- Residual release risk is limited to the unrelated root lint baseline and the
  intentionally stale v34 package attestations documented above. No accepted
  migration P0/P1 remains.
