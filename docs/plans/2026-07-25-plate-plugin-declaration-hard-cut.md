# Plate plugin declaration hard cut

Objective:
Hard-cut Plate plugin declaration API; done when Core, repo adoption,
doctrine, docs, release and browser gates pass with zero stale public APIs;
plan docs/plans/2026-07-25-plate-plugin-declaration-hard-cut.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-25-plate-plugin-declaration-hard-cut.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- agent-native
- package-api
- browser

Mode:
- `standard`

Completion threshold:
- Core creators accept the complete inferred declaration vocabulary; Plate
  declarations/configuration expose root `component`; public
  `.withComponent()` and `render.node` authoring have zero remaining source,
  test, docs, or example callers.
- Specialized `.extendX()` APIs remain hard-cut, ordinary declaration fields
  stay in constructors by default, and repeated `.extend()` stages survive
  only when a later stage consumes an earlier inferred capability.
- Core/package/docs/registry tests, declaration emit, source audits, Browser
  proof, agent-native review, autoreview, release artifact checks, and
  `check-complete` pass.

Verification surface:
- Focused Core runtime and compile-only tests for constructor, `.extend()`,
  component normalization, terminal configuration, dependency composition,
  typed portals, negative leakage, and declaration emit.
- Repo-wide source audits for `.withComponent`, public `render.node`,
  specialized `.extendX`, constructor-vs-extend topology, and stale teaching.
- Source-first package typechecks/tests plus published declaration builds for
  Core and representative dependent packages.
- Relevant registry demo route with Browser, including console/network state.
- `pnpm install` generated-skill sync, agent-native review, autoreview,
  changeset validation, and final goal checker.

Constraints:
- User accepted the target and explicitly authorized full repo-wide execution.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Preserve unrelated shared WIP. Inspect uncommitted changes only after the
  target manifest is captured, then re-read overlapping files before edits.
- Do not edit generated `.agents/skills/**/SKILL.md` directly; edit
  `.agents/rules/**` and regenerate with `pnpm install`.
- Do not manually edit `templates/**`.

Boundaries:
- In scope: Core plugin declaration/configuration types and runtime; every
  package, app, registry, test, doc, example, release note, and skill/rule
  caller of the changed public shape.
- Source owners: `packages/core/src/lib/plugin`,
  `packages/core/src/react/plugin`, affected `packages/**`, `apps/www/**`,
  `content/**`, `.agents/rules/**`, `docs/vision/plate.md`, and `.changeset/**`.
- Non-goals: compatibility aliases, deprecations, unrelated plugin behavior,
  unrelated Plite runtime changes, package/file-topology cleanup not required
  by this hard cut.
- Direct Plite boundary owners: N/A; this changes Plate descriptor authoring
  and React component binding without changing Plite editor semantics.

Output budget strategy:
- Read named Core owners first. Count/file-list broad matches before printing
  lines; exclude generated/build/vendor paths; cap normal reads to a few
  thousand tokens. Save large migration manifests under `/tmp`, inspect
  slices, and keep exact counts in this plan.

Blocked condition:
- Block only if three distinct implementation/proof attempts expose the same
  unsolved TypeScript/runtime law or required Browser/tooling access remains
  unavailable after the documented fallback; ordinary migration volume and
  failing tests are not blockers.

Plate Plan state:
- status: complete
- phase: prove-and-handoff
- next: handoff
- handoff: source-frozen

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | This plan records every accepted constructor, `.extend`, component, configuration, hard-cut, proof, and shared-WIP requirement. |
| Active goal and plan verified | yes | Goal tool objective names this exact plan and auditable threshold. |
| Current owners read | yes | `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, Core creator/plugin types/runtime, and representative callers read. |
| Best API target resolved | yes | `best-api review`: complete constructor, one follow-up widening verb, terminal configure, root Plate `component`, internal-only `render.node`, delete `.withComponent`. |
| Mode and execution boundary resolved | yes | Standard one-shot execution; user said “ok go all”. |
| Docs pack selected | yes | Public docs/examples change repo-wide. |
| `docs-creator` loaded | yes | Loaded before the public docs sweep. |
| Docs lane selected | yes | Current-state API/reference docs plus migration/release prose. |
| Target docs and nearest sibling docs read | yes | Plugin methods/context/components, API reference, HTML/Markdown, migration, and EN/CN siblings were audited. |
| Docs style doctrine read | yes | Current-state reference voice and source-backed examples applied. |
| Documented source owner identified | yes | Core public declaration types and package descriptors are the source owner; docs teach only compiled current shape. |
| Agent-native pack selected | yes | Reusable API doctrine and worker guidance change. |
| Agent-facing action surface identified | yes | `best-api`, `plate-next`, and `plate-plugin-creator` authoring rules. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; regenerate `.agents/skills/*/SKILL.md` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded; parity map and mirror/source audit completed. |
| Package/API pack selected | yes | `@platejs/core` public plugin authoring API and declarations change. |
| Public surface or package boundary identified | yes | `@platejs/core` Base/Plate plugin creators, methods, configuration, conversion, and published types. |
| Release artifact path selected | yes | `.changeset` required for breaking `@platejs/core` API/type change. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded; one-package frontmatter and forbidden-bump audit passed. |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` only if exported files move/add/delete; symbol changes inside existing exported files do not by themselves require barrel generation. |
| Browser pack selected | yes | `apps/www` registry kits/examples are migrated. |
| Browser route / app surface identified | yes | Choose one representative `/blocks/<id>-demo` route after the affected registry kit manifest is known. |
| Browser tool decision recorded | yes | Use Browser for ordinary registry demo QA; Chrome/Computer not required. |
| Console/network caveat policy recorded | yes | Record all console/network errors and distinguish pre-existing noise from regression with source/runtime evidence. |

Work Checklist:
- [x] Skill analysis complete: `autogoal`, `best-api repair`, `plate-plan`, and `hard-cut` govern lifecycle, doctrine, execution, and deletion.
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Capture the complete current caller/declaration/test/docs manifest before editing.
- [x] Inspect uncommitted changes after the manifest and preserve/reconcile every overlapping user/shared edit.
- [x] Make constructor declarations complete and inference-preserving for `api`, `read`, `selectors`, `update`, `extension`, `codecs`, and ordinary static fields.
- [x] Keep `inject`, advanced `render`, handlers, rules, shortcuts, and other independent declaration fields in constructors by default.
- [x] Add Plate root `component`, normalize it internally to resolved `render.node`, and keep it off `createBasePlugin`.
- [x] Hard-delete `.withComponent()` and public `render.node` authoring with no alias, shim, deprecation, or stale tests/docs.
- [x] Preserve one `.extend()` widening verb; merge independent stages and retain repeated stages only for proven earlier-type dependencies.
- [x] Keep `.configure()` terminal, non-widening, component-capable on Plate descriptors, and schema-replacement-free.
- [x] Migrate every package, registry kit, app, example, test, and doc caller to the accepted shape.
- [x] Repair `best-api` source doctrine, Plate vision, and contradictory worker rules; regenerate skills.
- [x] Add the breaking Core changeset and current-state documentation.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
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
| Gate | Applies | Evidence |
| --- | --- | --- |
| Binary readiness | yes | All accepted source, type, runtime, docs, doctrine, release, and browser conditions are resolved. |
| Fresh source evidence | yes | Final source/docs/skill scans and live package declarations were reread after formatting and shared edits. |
| Best API review | yes | Final shape matches the accepted constructor/extend/configure/component contract; no open P0/P1. |
| Conditional risk and adoption | yes | Repo callers, docs, agent assets, emitted declarations, static HTML, and Browser runtime are covered. |
| Verification recorded | yes | Exact commands and results are recorded below. |
| Handoff prepared | yes | Ownership, breaks, adoption, proof, and the shared-www caveat are recorded. |
| Autoreview | yes | Structured local review ran; three accepted findings and two stale doctrine findings were repaired, then the final rerun was clean. |
| Goal plan complete | yes | Final `check-complete` command is the last mechanical closure gate. |
| Docs source-backed claim audit | yes | `check-plate-doc-code-contracts` passed across 363 current docs files. |
| Docs links / routes / previews | yes | Existing leaf routes and examples were retained; no new links, anchors, or preview IDs were introduced. |
| Docs MDX/content parser | yes | www source generation/parity passed during the www typecheck/dev startup path. |
| Plugin page specifics | yes | Current API examples use constructor codecs, root component, exceptional extend, and terminal configure. |
| Agent source / generated sync | yes | `pnpm install` regenerated rule-backed skills; non-generated sidecar assets were separately audited and repaired. |
| Agent action discoverability | yes | `best-api`, `plate-next`, `plate-plugin-creator`, `plate-ui`, and `docs-creator` all route to the same shape. |
| Agent-native review | yes | Capability map passes: route, source owner, mirror/sidecar, proof command, and handoff are present. |
| Public API / package boundary proof | yes | Core typecheck/contracts/build and dependent List/AI declaration builds passed. |
| Release artifact classification | yes | Breaking published Core/plugin authoring API with dependent package adoption; package changesets apply. |
| Published package changeset | yes | `changeset status --since=main` passed; every changeset has one package and no forbidden core minor bump. |
| Registry changelog | no | This is not registry-only work; package changesets own the public API delta. |
| No release artifact | no | Published package users observe a breaking API/type change. |
| Package typecheck/build/test | yes | Core plus 22 affected package typecheck/test/build lanes passed; List emitted twice and AI emit passed. |
| Barrel/export generation | no | No exported file was added, removed, moved, or rebarreled; existing exported declarations changed in place. |
| Browser interaction proof | yes | Browser loaded `/dev/table-perf`; the live 10×10 editor table rendered with one editable surface. |
| Browser console/network check | yes | Fresh direct-route server returned 200 twice; prior `/blocks` RSC error is unchanged source and outside this API lane. |
| Browser final proof artifact | yes | Browser DOM proof recorded heading, 10 rows, 110 cells, and one editable surface. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Manifest captured before shared-diff inspection; owners and constraints recorded | Done |
| Decide | complete | User accepted final call shape; decision ledger below | Implement |
| Implement | complete | Core, packages, apps, docs, doctrine, checks, and changesets migrated | Done |
| Prove and hand off | complete | Type/test/build/static/browser/review gates recorded | Final user handoff |

Decision brief:
- outcome: one complete inferred plugin declaration model with a truthful
  React component field and no duplicate builder/component channels.
- chosen shape: full constructor; `.extend()` only for later inferred
  augmentation; terminal `.configure()`; Plate root `component`; internal
  resolved `render.node`.
- strongest rejected alternative: keep `.withComponent()` as kit sugar or
  expose `render.node` publicly.
- consequence: broad breaking Core/package/docs/registry migration, repaid by
  one discoverable declaration vocabulary and shorter type-inference paths.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Constructor declaration | Narrowed to identity/schema/dependencies/options; ordinary and widening fields pushed into `.extend()` | Accept complete inferred declaration vocabulary and keep independent static fields at creation | Core | Constructor is the coherent owner and best autocomplete entrypoint | Move package descriptor contributions into creation where no later inferred dependency exists | Compile-only inference, declaration emit, package builds | Recursive contextual inference and `any` regression | rearchitect |
| Follow-up authoring | `.extend()` is the only surviving widening verb but overused mechanically | Keep one `.extend()` only for imported descriptors or earlier-stage inferred dependencies | Core + packages | One concept, no compiler-destination verbs | Merge independent stages; preserve proven ordered stages | Type parity and negative leakage tests | Stage merge can erase dependency inference | keep |
| Component binding | `.withComponent()` facade; public `render.node` rejected | Plate root `component`; delete facade; normalize internally to `render.node` | Core React plugin layer | User intent is component binding, not renderer registry mutation | Creator folds binding into object; kit/consumer uses converted Plate descriptor `.configure({ component })` | Runtime resolve tests, type tests, registry browser | Base/Plate boundary and terminal configuration adoption | rearchitect |
| Terminal configuration | One `.configure()` override after authoring, currently sometimes chained after `.withComponent()` | One terminal non-widening configuration object including Plate `component` | Core + consumers | One consumer override channel | Merge chained component/config calls | Type/runtime terminality tests | Base descriptor must convert before React configuration | keep |
| Public `render.node` | Resolved internal slot and rejected authoring path | Internal resolved storage only | Core | Advanced renderer registry is not the common public noun | Replace public docs/callers with root component; retain internal assertions | Zero public authoring matches; runtime normalization proof | False positives in internal runtime/tests | keep internal |
| Doctrine and docs | Rules currently bless `.withComponent()` and constructor narrowing | Teach complete constructor, root component, one widening verb, terminal configure | Vision + rule owners + public docs | Prevents the same migration mistake | Repair source rules, regenerate skills, sweep docs | Agent-native review and docs source audit | Generated mirrors can drift | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Manifest and shared-diff reconciliation | Root | Core symbols, all callers, tests, docs, skills, changeset, current uncommitted edits | Goal active | Exact counts and overlap map recorded | Bounded `rg`, diff inspection |
| 2. Core types/runtime | Core | Creator inputs, plugin methods/config, conversion, resolution, type/runtime tests | Slice 1 complete | Accepted API compiles and old API is absent | Focused Core tests/typecheck/declaration emit |
| 3. Package/app adoption | Package and registry owners | Descriptors, kits, apps, examples, tests | Core green | Zero production/test callers of cut APIs | Source audits, affected package typechecks/tests |
| 4. Doctrine/docs/release | Vision/rules/docs/release owners | Rules, generated skills, docs, changeset | Call shape stable | Current-state teaching and release artifact align | `pnpm install`, docs checks, changeset audit |
| 5. Integrated proof and review | Root | Browser, broad type/test/build, autoreview, agent-native review | All edits complete | Every completion gate and checker pass | Named commands and Browser evidence |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Constructor is complete and inferred | Current Core types/runtime plus representative plugin declarations | Compile-only tests, Core typecheck, declaration emit, dependent package builds | pass |
| `component` is the sole public binding field | Current method/types/callers | Runtime normalization tests and zero stale public caller audit | pass |
| `.extend()` remains inference-safe and exceptional | Current builder generics and package stages | Repeated-stage/dependency/portal negative tests and package builds | pass |
| Terminal `.configure()` owns consumer override | Current configured-plugin types/runtime | Core terminality tests and migrated kit examples | pass |
| Public docs/skills teach one shape | Current docs/rules | Source audits, docs parser, generated skill sync, agent-native review | pass |
| Registry consumers still render | Current selected demo route | Browser direct client route, 200 responses, rendered editor/table | pass |

Conditional evidence:
- High-risk scenarios: constructor inference degrades to `any`; Base descriptors
  accidentally import React ownership; component configuration is lost during
  conversion/terminal merge; declaration emit differs from source-first tests.
- External research: N/A; target was settled from current Plate ownership and
  user requirements.
- Issue/PR provenance: N/A; user-directed current-tree architecture hard cut.
- Docs/registry/browser/release/behavior-law owners: docs, registry Browser,
  Core changeset, and agent doctrine all apply; no Plite behavior-law change.

Findings:
- Current doctrine and generated worker skills still explicitly require
  `.withComponent()` and reject public component binding.
- Current `createPlatePlugin` creator input exposes only
  dependencies/enabled/key/options/schema/targetPluginNames/type, explaining the
  poor autocomplete shown by the user.
- `BasePlugin` currently owns React-specific `.withComponent()`, while
  `toPlatePlugin` already provides the honest Base-to-Plate boundary.
- Current resolved plugin storage uses `render.node`; that remains an internal
  implementation detail and runtime assertion surface.
- Pre-edit bounded audit excluding `templates`, dependencies, build output, and
  Next output found 583 `.withComponent(` occurrences across 230 files,
  131 specialized `.extendX(` occurrences, 133 literal `render.node`
  references, and 2,199 creator references. These totals include historical
  plans, generated skills, generated public registry JSON, internal runtime
  assertions, and current source; adoption classification must separate those
  owners instead of mechanically editing all matches.

Decisions and tradeoffs:
- Delete `.withComponent()` despite shorter component-only kit calls: one
  permanent duplicate authoring channel costs more than
  `.configure({ component })`.
- Do not expose `render.node`: root `component` expresses user intent while
  internal normalization preserves renderer runtime structure.
- Keep `component` Plate-only: Base descriptors do not own React components;
  React kits convert with `toPlatePlugin` before terminal configuration.
- Constructor completeness is mandatory; `.extend()` is not a dumping ground
  for independent fields. Repeated stages require an actual inferred
  capability dependency.

Review fixes:
- Accepted: static HTML Base descriptors were converted with
  `toPlatePlugin(...).configure({ component })`.
- Accepted: stale plugin-creator and Plate UI sidecars were repaired or
  deleted so no referenced agent rule teaches `.withComponent()` or
  constructor-independent codecs in `.extend()`.
- Partially accepted: stale `render.node` authoring JSDoc was removed and the
  retained resolved slot marked `@internal`; the broader type finding was
  rejected because every authoring input omits the field and runtime/checkers
  reject it by contract.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Initial combined manifest `rg` had a zsh unmatched quote | 1 | Remove the shell-sensitive mixed quote pattern and use fixed-string `render.node` audit | Resolved; bounded counts captured |

Verification evidence:
- Core: focused runtime/compile suite 133/133; Core source-first typecheck,
  compile contracts, and package build pass.
- Affected packages: 22-package source-first typecheck matrix 46/46 tasks;
  package test matrix 22/22; build matrix green after the AI declaration owner
  fix; List emitted successfully twice from rebuilt Core declarations.
- Static HTML: migrated component binding suite 5/5.
- Structural: schema adoption audit passed across 4,698 source/docs files;
  docs contract audit passed across 363 current docs files; checker suites
  46/46.
- Doctrine: `pnpm install` sync passed; Plate Next v8 validates with
  `sha256:d138105df48d714d17d97e27426dad173713f58f39022c84e0519642690a44aa`.
- Release: `changeset status --since=main` passes; one package per file; no
  forbidden `minor` for `@platejs/core`, `@platejs/slate`, or `platejs`.
- Browser: clean www dev start; `/dev/table-perf` returned 200 twice and
  rendered heading `Table performance`, 10 rows, 110 cells, and one editable.
- Hygiene: `pnpm lint:fix` passes with one unrelated large-file warning;
  `git diff --check` passes; no `templates/**` edits.
- Integrated www typecheck reaches only eight pre-existing shared readonly
  `Value` fixture mutations outside this API lane; no plugin declaration error
  remains.
- Review: structured autoreview accepted and closed the static-test and stale
  agent-asset findings; final rerun reported no accepted/actionable finding.

Final handoff prepared:
- Ownership and target API: Core constructors own independent declarations;
  exceptional/staged widening uses `.extend()`; consumers end with
  `.configure()`; Plate owns root `component`.
- Public breaks and adoption: `.withComponent`, specialized `.extendX`, and
  public `render.node` authoring are deleted repo-wide with no shims.
- Runtime/package/docs/browser decisions: internal resolved `render.node`
  remains private; docs, release prose, rules, mirrors, and apps use one shape.
- Proof and execution risks: emitted declarations, static HTML, package
  matrices, source audits, and Browser proof are green.
- User attention: the shared www readonly-fixture failures remain outside this
  lane; they do not contain plugin declaration regressions.

Timeline:
- 2026-07-25T13:12:52.901Z Plate Plan created.
- 2026-07-25T13:17Z Goal created; accepted requirements and proof gates
  materialized.
- 2026-07-25T13:19Z Pre-edit API manifest captured before inspecting shared
  uncommitted changes, per user instruction.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete: source-frozen handoff |
| Where am I going? | Final user handoff |
| What is the goal? | Complete constructor + root component hard cut with zero stale APIs |
| What have I learned? | Constructor completeness shortens inference; sidecar agent assets need an explicit audit beyond `pnpm install` |
| What have I done? | Hard-cut Core/API, migrated repo callers, repaired doctrine/docs/release, and passed structural/package/browser/review proof |

Open risks:
- No open risk in the plugin declaration hard-cut.
- Shared checkout caveat: the www aggregate typecheck still reports eight
  unrelated readonly-fixture mutations; this lane preserved those edits and
  did not claim a globally clean www typecheck.
