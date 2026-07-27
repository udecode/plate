# Versioned AST migration plugins

Objective:
Ship versioned opt-in Plate AST migration plugins; done when script/media legacy
data migrate pre-fit, exports/docs/registry and focused package/browser/review
gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-26-versioned-ast-migration-plugins.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- package-api
- browser

Mode:
- `standard`

Completion threshold:
- `ScriptV54MigrationPlugin` is an opt-in headless export from
  `@platejs/basic-nodes/migrations`; the latest `ScriptPlugin` and default kits
  contain no historical migration branch.
- Legacy `subscript`/`superscript` data migrates before schema fitting across
  primary and named roots, preserves no-op identity, and rejects ambiguous
  states with a path-bearing error.
- Media's legacy persisted-caption conversion is removed from the latest media
  plugin and provided through an opt-in versioned migration export.
- Package exports, barrels, changesets, upgrade-facing registry metadata, and
  source-backed documentation agree with the shipped API.
- Focused package tests/typechecks, lint, applicable browser proof,
  `autoreview`, and `check-complete` pass with zero accepted findings left.

Verification surface:
- Focused tests for basic-nodes and media migration behavior, followed by
  source-first typechecks for both packages.
- `pnpm brl`, `pnpm lint:fix`, registry changelog generation/check, and the
  applicable docs source check.
- Browser proof on the standalone/basic-marks demo when it can exercise the
  current Script renderer; source/test proof records the migration-specific
  behavior because no persisted-v53 fixture route currently exists.
- Source audits proving migration exports are absent from normal package/react
  barrels and default registry kits.

Constraints:
- The user accepted the decision-ready audit with `ok go`; execute without
  another planning pause.
- New installations import only current feature plugins and see no migration
  condition or migration configuration.
- Migration is not normalization. Do not put legacy branches in
  `ScriptPlugin`, `MediaPlugin`, current schema repair, or default kits.
- Do not add a global migration registry, `migrations:` option, compatibility
  alias, dual API, or Plite substrate change.
- Version package-authored migrations by their target major release.
- Do not invent a blockquote migration: current source/tests retain nested
  block content despite stale changeset wording.
- No public compatibility aliases or runtime shims.
- Preserve current canonical Script and Media behavior, HTML codecs,
  multi-root documents, selection mapping, history boundaries, and Yjs schema
  identity rules.

Boundaries:
- In scope: `packages/basic-nodes`, `packages/media`, their package exports and
  tests, the existing package changesets, upgrade-facing registry changelog
  source/generated output, and the smallest source-backed docs correction.
- Source owners: Plate package migration descriptors and the existing Core
  `transformInitialValue` lifecycle.
- Non-goals: global document-migration DSL, populated-room Yjs migration,
  persisted history transcoding, registry-kit installation of migration
  plugins, blockquote AST changes, and unrelated migration cleanup.
- Direct Plite boundary owners: read-only verification of complete-document
  input transformation and schema fitting; no Plite implementation change.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only if the current transform lifecycle cannot safely produce
  schema-valid primary/named-root documents before fitting, or package exports
  cannot expose opt-in migration code without polluting normal entrypoints
  after three distinct owning-layer attempts.

Plate Plan state:
- status: complete
- phase: handoff
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Accepted audit plus latest `ok go` copied into Objective, Completion threshold, Constraints, and Boundaries |
| Active goal and plan verified | yes | Goal tool objective names this exact plan; one-shot execution selected |
| Current owners read | yes | `BaseScriptPlugin`, `MediaPlugin.internal`, Core transform lifecycle, package exports, tests, changeset, registry entry, schema/Yjs docs |
| Best API target resolved | yes | Accepted `best-api` verdict: versioned opt-in feature migration plugin under `/migrations`; no generic registry |
| Mode and execution boundary resolved | yes | Standard accepted-plan execution; implementation authorized by `ok go` |
| Docs pack selected | yes | Supporting upgrade/docs work; `docs` pack materialized in this plan |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read completely |
| Docs lane selected | yes | Package upgrade/release artifact plus focused source-reference corrections; no new feature page |
| Target docs and nearest sibling docs read | yes | Existing basic-nodes changeset, script plugin pages, Plite schema identity docs, and registry changelog entry |
| Docs style doctrine read | yes | `docs-creator`, `docs/vision/common.md`, and `docs/vision/plate.md` |
| Documented source owner identified | yes | Versioned migration exports in owning feature packages; app envelope owns schema lineage |
| Package/API pack selected | yes | Public package subpath/export is changed; `package-api` pack materialized |
| Public surface or package boundary identified | yes | `@platejs/basic-nodes/migrations` and `@platejs/media/migrations`; normal root/react exports stay canonical-only |
| Release artifact path selected | yes | Existing basic-nodes changeset updated; separate media changeset if media delta from `main` is user-visible; registry source entry updated and regenerated |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read completely |
| Barrel/export impact decision recorded | yes | New public subpaths/files require `pnpm brl`; normal barrels must not re-export migrations |
| Browser pack selected | yes | Package renderer and registry/docs surfaces trigger Browser proof; pack materialized |
| Browser route / app surface identified | yes | Prefer standalone basic-marks demo route; discover exact route before launch |
| Browser tool decision recorded | yes | Use Browser; Chrome/Computer not applicable because no native browser/OS surface |
| Console/network caveat policy recorded | yes | Record console/network state; migration-specific proof remains package-owned if no legacy fixture route exists |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: package changesets plus registry changelog.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the existing registry changelog source/generator.
- [x] Package/API pack: no-artifact path is N/A because two published package APIs changed.
- [x] Package/API pack: compatibility, migration, and hard-cut decisions are explicit.
- [x] Package/API pack: package-owned build/test proof is recorded; source-first typecheck blockers are isolated below.
- [x] Package/API pack: generated barrels and release notes are updated.
- [x] Browser pack: `/blocks/basic-marks-demo` and `/docs/installation/plate-ui` were attempted with Browser.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console/runtime errors were inspected and traced to unrelated shared Core/options WIP.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every scoped readiness condition | Migration packages build and import through the new subpaths; root entrypoints remain clean |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final source sweeps found migration symbols only in migration/release owners and no media legacy transform in the current plugin |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding | Accepted versioned opt-in plugin shape implemented without a generic registry |
| Conditional risk and adoption | yes | Complete risk/docs/browser/provenance work | Ambiguity, configured types, initial/deferred loads, primary/named roots, exports, release teaching, and browser caveat covered |
| Verification recorded | yes | Record exact execution gates | Verification evidence below |
| Handoff prepared | yes | Prepare ownership, breaks, proof, risks, and execution order | Final handoff section complete |
| Autoreview | yes | Run for implementation changes | Scoped local review clean with zero findings, correctness 0.82 |
| Goal plan complete | yes | Run plan checker | Checker command recorded below |
| Docs source-backed claim audit | yes | Verify docs claims against current source | Changesets and registry notes match the two public migration exports and temporary-install contract |
| Docs links / routes / previews | yes | Verify links/routes/previews or scope them out | No new docs links or plugin pages; registry JSON route returned 200; standalone demo route was blocked by unrelated Core WIP |
| Docs MDX/content parser | no | Run for content MDX changes | No `content/**` source changed; registry source uses its own generator/check |
| Plugin page specifics | no | Apply plugin-page rules | No plugin reference page changed; latest-only pages intentionally omit migration instructions |
| Public API / package boundary proof | yes | Audit exports and package boundary | Runtime imports pass from both `/migrations` subpaths; root imports expose neither migration |
| Release artifact classification | yes | Classify published user-visible delta | Published package API/runtime change for basic-nodes and media, plus upgrade-facing registry metadata |
| Published package changeset | yes | Update package changesets | `.changeset/basic-nodes-plugin-kits.md` and `.changeset/media-v54-runtime.md` teach explicit temporary migration-plugin installation |
| Registry changelog | yes | Update and regenerate registry entries | Generator check covers 39/39 source events |
| No release artifact | no | Record exact reason | N/A: published package behavior changed |
| Package typecheck/build/test | yes | Run owning package checks | 12/12 migration tests, both package suites, both direct-declaration builds; source-first package typechecks are blocked upstream by current Core/options WIP and recorded below |
| Barrel/export generation | yes | Generate affected barrels | Both package `brl` commands pass; tooling contract proves migrations stay opt-in |
| Browser interaction proof | yes | Exercise target route or record blocker | Browser attempted basic-marks and Plate UI docs routes; current shared WIP prevents app rendering before the changed surface |
| Browser console/network check | yes | Inspect console/network state | Runtime assertion rejects configure callbacks with options; docs build also reports current Core hook/export fallout; registry JSON request returned HTTP 200 |
| Browser final proof artifact | yes | Record visible proof or exact caveat | Browser screenshot showed the unrelated Next error overlay; no migration-specific legacy fixture route exists |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Accepted audit and live owners recorded | Execute |
| Decide | complete | Versioned opt-in feature migration plugins; generic registry rejected | Execute |
| Execute | complete | Both migration plugins, package subpaths, release teaching, and barrel owner implemented | Prove and hand off |
| Prove and hand off | complete | Scoped proof and autoreview clean; unrelated shared-WIP failures isolated | Final handoff |

Decision brief:
- outcome: persisted pre-v54 AST loads safely without teaching migration
  machinery to new installations.
- chosen shape: headless `ScriptV54MigrationPlugin` and
  `MediaV54MigrationPlugin`, exported only from package `/migrations`
  subpaths and implemented through the existing pre-fit complete-document
  transform lifecycle.
- strongest rejected alternative: a global version graph or `migrations:`
  editor option; it duplicates adequate lifecycle machinery and couples
  independently installed packages.
- consequence: upgraders explicitly install temporary versioned migration
  plugins; canonical applications and default kits remain migration-free.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Script persisted AST | No migration; closed schema can reject legacy boolean marks | Opt-in `ScriptV54MigrationPlugin` maps legacy booleans into one enum mark pre-fit | `@platejs/basic-nodes` | Correctness plus clean latest-install DX | New subpath export; upgrade-only import; no default kit adoption | Primary/named-root, no-op identity, conflicts, selection/load tests | Full-document traversal on upgrade loads | rearchitect |
| Media persisted caption AST | Historical conversion lives in normal `MediaPlugin` and scans every complete load | Opt-in `MediaV54MigrationPlugin`; latest Media plugin has no historical branch | `@platejs/media` | Removes permanent historical cost/ownership pollution | New subpath export and upgrade changeset | Existing legacy cases moved to migration tests; current construction remains green | Apps with unmigrated captions must opt in | move |
| Migration execution | Existing `transformInitialValue` runs complete documents pre-fit and maps selection | Keep lifecycle; migration plugins privately own pure structural-sharing traversal | `@platejs/core` | Adequate generic substrate already exists | No public Core/Plite change | Existing Core contracts plus package behavior | Plugin ordering must remain explicit | keep |
| Migration distribution | Historical logic can be embedded in current plugins | Export migration descriptors only through `/migrations`, never normal root/react barrels or kits | Feature package | New users avoid obsolete concepts and bundle cost | Package exports/barrels/docs | Export/source audit and consumer typecheck | Versioned exports accumulate intentionally | rearchitect |
| Global migration framework | No dedicated registry | No new registry/DSL until ordered cross-package evidence appears | N/A | Avoid speculative machinery and coupling | None | Source audit | Future bulk/offline migration may reopen | defer |
| Blockquote note | Changeset claims direct inline children; live schema/tests use nested block content | Correct release text; no blockquote migration | `@platejs/basic-nodes` | Prevent a false migration instruction | Changeset/registry wording only | Source/test audit | None | cut |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1 | Basic nodes | Add private migration traversal, `ScriptV54MigrationPlugin`, focused tests, migration-only public subpath | Accepted shape and Core lifecycle proven | Legacy/current/conflict/multi-root contracts pass; normal plugin stays clean | Focused package tests |
| 2 | Media | Extract historical caption transform into `MediaV54MigrationPlugin`; preserve current construction/API | Slice 1 pattern proven | Latest plugin contains no legacy branch; migrated data stays equivalent | Focused media tests |
| 3 | Package/docs/registry | Generate barrels/exports; repair changesets and registry migration note without polluting default kits/docs | Source APIs settled | Imports compile; generated artifacts agree; stale blockquote claim removed | `pnpm brl`, changelog check, docs checks |
| 4 | Closure | Typecheck, lint, Browser route proof, source sweeps, autoreview, checker | Slices 1-3 green | Zero accepted findings; goal gates and plan checker green | Package/root scoped proof plus Browser |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| New installs see only `ScriptPlugin` | Existing root/react exports and kits audited | Root import and source sweeps expose no migration plugin | complete |
| Legacy script data migrates before fitting | Core lifecycle and closed-schema source read | 5 focused basic-nodes migration contracts | complete |
| Legacy media migration is opt-in | Current embedded transform sourced | 7 focused media migration contracts plus current-plugin source sweep | complete |
| Versioned migrations remain headless/multi-root | `createBasePlugin` and complete-document transform sourced | Runtime subpath imports plus primary/named-root tests | complete |
| Release teaching is truthful | Changeset and registry source read | Changeset review and 39/39 changelog generator check | complete |
| Current Script render remains correct | Existing HTML codec and demo source | Existing package suite passes; Browser route blocked before editor creation by unrelated Core/options WIP | scoped-complete |

Conditional evidence:
- High-risk scenarios: ambiguous dual legacy marks; named-root migration;
  migration omitted for legacy data; plugin ordering; old Yjs/history identity.
  Package tests and explicit fail-closed boundaries cover these.
- External research: accepted narrow editor-audit compared clean Tiptap
  `91c51be53c4655ef07e29ec489471524debfa0ca` and Lexical
  `d52f66e250e031a6c6fd8836d160373b0df557c7`; no refresh required during
  immediate accepted-plan execution.
- Issue/PR provenance: N/A: user-directed current-tree architecture work.
- Docs/registry/browser/release/behavior-law owners: changeset,
  registry-changelog source/generator, focused migration contracts, and Browser
  proof apply.

Findings:
- Plate's complete-document transform already runs before schema fitting for
  initialization and every complete value replacement, including selection
  mapping and named roots.
- Plate schema uses `unknown: 'reject'`, so legacy script fields cannot wait for
  current-schema normalization.
- Tiptap supports opt-in migration utilities but runs its math example after
  JSON schema parsing; Lexical imports through node classes and recommends
  backward-compatible optional fields over a flat version property.
- Current blockquote source/tests keep paragraph children, contradicting the
  current changeset's inline-child claim.

Decisions and tradeoffs:
- Target-version naming (`ScriptV54MigrationPlugin`) makes the upgrade
  destination explicit and avoids unversioned legacy surfaces.
- Feature-specific migration ownership beats `BasicNodesV54MigrationPlugin`
  because applications install capabilities independently and only Script has
  a proven basic-nodes persisted-shape break.
- Migration code may remain available in the package subpath for direct
  upgraders, but it never enters current plugin bundles or default kits.
- Persisted history and populated Yjs rooms remain strict schema-identity
  boundaries; migrate documents offline and start a compatible room/history
  rather than silently transcoding them.

Review fixes:
- None. Scoped `autoreview --mode local` returned zero accepted/actionable
  findings and rated the patch correct with 0.82 confidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Broad source search streamed generated research output | 1 | Cap output and scope every later search to named owners | Subsequent source sweeps remained bounded |
| Package subpath build initially emitted no migration JS | 1 | Add package-local tsdown entries | Both `/migrations` runtime imports pass |
| New subpath declarations were initially absent | 1 | Enable direct declarations for the additional entry | Both package builds and artifact checks pass |
| Root barrels initially re-exported migration files | 1 | Fix the shared barrel generator and add a contract test | Root imports are clean; 6/6 tooling contracts pass |
| First dev-server command forwarded `--` as a Next project directory | 1 | Pass `--port 3025` directly through the package script | Server started normally |
| Browser editor demo failed before changed behavior ran | 1 | Inspect console and try the changed docs/registry surface | Shared Core/options WIP blocks rendering; registry JSON request returned 200 |
| Focused tests lost `@platejs/core` runtime artifacts | 1 | Build the artifact-facing Core package once | 12/12 focused migration tests pass |
| Focused tests inherited the unrelated NodeId schema-context regression | 1 | Disable NodeId in migration-only fixtures | Tests exercise only the migration contract; Core owns NodeId coverage |
| Root lint failed on existing editor-audit artifacts | 1 | Run targeted Biome on every changed implementation/tooling file | 10 scoped files pass with no fixes |
| Source-first typecheck failed in shared Core/options migration | 2 | Prove scoped declarations through owning package builds and record upstream failures | Both package builds pass; broad typecheck remains externally blocked |
| Direct file typecheck inherited the same shared plugin generic failures | 1 | Stop expanding the unrelated options hard cut | No migration-owned type error was reported; package declaration builds remain green |

Verification evidence:
- `bun test packages/basic-nodes/src/migrations/ScriptV54MigrationPlugin.spec.ts packages/media/src/migrations/MediaV54MigrationPlugin.spec.ts`
  passes 12/12 tests with 19 assertions.
- `pnpm --filter @platejs/basic-nodes --filter @platejs/media test` passes
  both owning package suites.
- `pnpm --filter @platejs/basic-nodes build` and
  `pnpm --filter @platejs/media build` pass with direct declarations for both
  public migration subpaths.
- Both package artifact checker invocations pass; runtime imports from
  `@platejs/basic-nodes/migrations` and `@platejs/media/migrations` pass; root
  package imports expose neither migration plugin.
- `node --test tooling/scripts/brl.test.mjs tooling/scripts/check-package-build-artifacts.test.mjs`
  passes 6/6 tooling contracts.
- Both package `brl` commands pass and generate migration-only barrels.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check` verifies
  39/39 registry changelog source events.
- Targeted Biome checks 10 changed implementation/tooling files with no
  diagnostics. Root `pnpm lint:fix` remains blocked by 170 unrelated errors in
  multi-editor audit artifacts.
- Source-first package typecheck reaches unrelated shared-WIP failures:
  `@platejs/utils` still declares removed `options`/`getOptions`/
  `usePluginOption` APIs, while the direct basic-nodes check hits current Core
  TS2589 generic recursion. Both owning package declaration builds pass.
- Browser inspected `/blocks/basic-marks-demo` and
  `/docs/installation/plate-ui`. Current shared WIP fails before the changed
  surface through the Core configure/options assertion and hook/export fallout;
  the registry event JSON request returned HTTP 200. No persisted-v53 browser
  fixture exists, so migration semantics remain package-test-owned.
- Scoped autoreview command:
  `.agents/skills/autoreview/scripts/autoreview --mode local --stream-engine-output --prompt <scoped migration contract>`
  exits clean with zero findings.

Final handoff prepared:
- Ownership and target API: feature packages own
  `ScriptV54MigrationPlugin` and `MediaV54MigrationPlugin` under explicit
  `/migrations` subpaths; Core/Plite gains no migration registry.
- Public breaks and adoption: upgraders temporarily install the matching
  versioned plugin before the current feature plugin, resave every document,
  then remove it. New applications install only current plugins.
- Applicable runtime/package/docs/browser decisions: transforms run pre-fit on
  initial and deferred complete-document loads; package changesets and registry
  notes teach only this upgrade path.
- Proof and execution risks: scoped package behavior, build artifacts, barrels,
  release metadata, and review are green. Shared Core/options WIP prevents a
  clean source-first typecheck and live app render but is outside this owner.
- Execution order and user attention: migration work is complete; repair the
  independent Core/options hard cut before claiming the entire checkout green.

Timeline:
- 2026-07-26T21:11:26.279Z Plate Plan created.
- 2026-07-26T21:24Z Script and Media migration plugins implemented with
  versioned package subpaths and focused contracts.
- 2026-07-26T21:30Z Release teaching, registry metadata, barrels, build
  configuration, and artifact contracts completed.
- 2026-07-26T21:42Z Scoped package/tooling proof and autoreview completed;
  unrelated shared-WIP typecheck/browser blockers isolated.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Final handoff |
| Where am I going? | No migration-owned work remains |
| What is the goal? | Ship opt-in versioned AST migration plugins without polluting latest feature APIs |
| What have I learned? | Existing pre-fit lifecycle is sufficient; migrations need separate build/barrel ownership; blockquote note was stale |
| What have I done? | Implemented both plugins, removed the permanent media branch, shipped opt-in exports, repaired release teaching, and completed scoped proof/review |

Open risks:
- Apps that fail to install the versioned migration before loading old data
  will correctly fail closed under the current schema.
- Populated Yjs rooms and persisted history require app-owned offline migration
  and compatible schema lineage; these plugins intentionally do not transcode
  live collaboration/history state.
- The current checkout still has unrelated Core/options-store migration
  failures in source-first typecheck and Browser rendering. They do not change
  the migration package result but block a whole-repo green claim.
