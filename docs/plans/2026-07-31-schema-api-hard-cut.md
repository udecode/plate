# schema api hard cut

Objective:
Ship the accepted Plite and Plate schema API hard cut; done when all P0-P2
rows are adopted, stale surfaces are absent, and source, tests, docs, browser,
review, and checker gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-31-schema-api-hard-cut.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- docs
- package-api
- browser
- agent-native

Mode:
- `standard` accepted-plan execution

Completion threshold:
- All 13 accepted P0-P2 rows are implemented with one public shape and no
  compatibility aliases.
- Stale names and rejected public carriers have zero applicable matches outside
  migration prose or explicitly justified internal compiler storage.
- Plite/Core typechecks and focused schema/Core tests pass, docs parse, barrels
  and generated skills are synced, affected browser routes render without new
  console/network failures, autoreview and agent-native review have zero
  accepted findings, changesets describe the delta from `main`, and
  `check-complete` passes.

Verification surface:
- Source audits across `packages/**`, `apps/**`, `content/**`, `.agents/rules`,
  generated skill mirrors, exports, changesets, and tests.
- Focused Plite schema/type/inference/validation tests; Core plugin schema and
  editor creation tests; package source-first typechecks; `pnpm brl`;
  `pnpm install`; `pnpm lint:fix`; docs source build/check.
- Browser proof on the actual Plite schema example route and one Plate registry
  demo that installs the migrated schema plugins, with console/network checks.
- Structured autoreview plus agent-native parity review, then the plan checker.

Constraints:
- The user explicitly accepted the audited P0-P2 program with “go all”; execute
  without another planning pause.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Preserve explicit non-void grammar, void canonical children, schema identity,
  unknown-preserve semantics, atomic reconfiguration, history/Yjs identity,
  multi-root ownership, slice fitting, host-codec separation, and descriptor
  inference.
- Edit `.agents/rules/**` owners, never generated `.agents/skills/**` mirrors;
  regenerate with `pnpm install`.

Boundaries:
- In scope: all accepted P0-P2 schema API rows; package source, tests, type
  tests, public exports, apps/registry callers, current docs, source agent
  rules, generated mirrors, changesets, and required proof.
- Source owners: `@platejs/plite` schema interfaces/definition/compiler/runtime;
  `@platejs/core` plugin definition/compiler/lowering/editor facade; Plite/Core
  docs/tests/exports; package/app consumers; NodeId/HTML/ElementState metadata;
  source agent rules teaching these shapes.
- Non-goals: ordered regular grammar, new preset families, implicit text-block
  defaults for arbitrary elements, compatibility aliases, unrelated plugin
  cleanup, commits, push, PR, or release publication.
- Direct Plate/collaboration adoption owners: Core, package plugin declarations,
  apps/www examples/registry, Plite History/Yjs schema identity proofs, and
  host codec consumers.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only after three consecutive turns hit the same external/tooling blocker
  and no smaller source/test/docs/browser/review move remains. Type failures,
  migration breadth, or review findings are work, not blockers.

Plite Plan state:
- status: done
- phase: prove and hand off
- next: user review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | “go all” means all 13 accepted P0-P2 rows, full adoption/proof, no unrelated ordered-grammar work. |
| Active goal and plan verified | yes | One-shot goal `019f9471-98c6-7e01-ad02-cc4de59f34e1`; this plan is its ledger. |
| Current owners read | yes | Accepted full audit plus live Plite interfaces/builders/compiler/runtime and Core definition/lowering/facade owners. |
| Best API target resolved | yes | Accepted `best-api`/`editor-audit` verdict in `docs/plans/2026-07-31-full-schema-api-audit.md`. |
| Mode and execution boundary resolved | yes | Standard one-shot execution explicitly authorized by “go all”. |
| Docs pack selected | yes | Schema/API reference and walkthrough callers change. |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md` completely before docs edits. |
| Docs lane selected | yes | API reference plus guide/system concept; current-state voice only. |
| Target docs and nearest sibling docs read | yes | Schema concept, editor API, extension concept, and database walkthrough read during accepted audit; reread touched pages before editing. |
| Docs style doctrine read | yes | Full `docs-creator` skill loaded. |
| Documented source owner identified | yes | Plite schema source is authoritative; Core docs teach only Plate lowering/facade. |
| Package/API pack selected | yes | Public Plite and Core API/types/exports break. |
| Public surface or package boundary identified | yes | Plite owns raw schema; Core owns plugin authoring and Plate descriptor facade. |
| Release artifact path selected | yes | One package changeset each for `@platejs/plite` and `@platejs/core`; registry changelog N/A because this is not registry-only. |
| `changeset` skill loaded when `.changeset` is required | yes | Read completely before changeset work. |
| Barrel/export impact decision recorded | yes | Public type/method removals require `pnpm brl` and import-smoke proof. |
| Browser pack selected | yes | Apps/docs/package callers change and repo policy requires route proof. |
| Browser route / app surface identified | yes | Discover exact existing Plite schema example and one standalone Plate registry demo before starting servers; record final URLs in proof. |
| Browser tool decision recorded | yes | Use Browser for ordinary route/render/interaction proof; Chrome/Computer are unnecessary unless Browser is blocked. |
| Console/network caveat policy recorded | yes | New errors fail closure; unrelated existing noise is named with exact evidence. |
| Agent-native pack selected | yes | Source rules teach old schema names and must be updated with generated mirrors. |
| Agent-facing action surface identified | yes | `plate-next`, `plate-plugin-creator`, `best-api`, `docs-creator`, and any other source rule matching cut names. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; run `pnpm install`; never edit generated `SKILL.md` directly. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read completely before source-rule edits. |

Work Checklist:
- [x] P0: make unvalidated `property.json()` infer only
      `PropertyJsonValue`; narrow types require `validate` and
      `validationVersion`.
- [x] P0: remove `schemaModel` from public normalized definitions and hide
      schema compiler/provider carriers from public barrels while preserving
      inference internally.
- [x] P0: repair all current schema docs, including invalid void/content,
      missing `property.enum`, defaults, and external assertion guidance.
- [x] P1: add `schema.element.textBlock()` with inference and rejection of
      conflicting structural options; adopt common callers.
- [x] P1: flatten primary/named roots from `{ content }` to direct
      `SchemaContent` across declarations, compiler, callers, docs, and tests.
- [x] P1: default omitted complete-schema `unknown` to `reject` and omitted
      `elements` to `{}` while keeping normalized compiled definitions exact.
- [x] P1: rename Plate creation `schema` lineage option to `schemaIdentity`.
- [x] P1: rename Plate element `topLevel` to `blockContent`.
- [x] P1: rename schema runtime `createAndFill` to `create`.
- [x] P1: replace `validateDocument/validateFragment` with assertion methods
      accepting `unknown` and narrowing to the installed schema value.
- [x] P2: move value-level `significant` to placement-level
      `role: 'metadata'`; adopt NodeId, HTML, and ElementState.
- [x] P2: remove Plate `schema.handle(Plugin)` and complete direct descriptor
      overloads for remaining schema queries.
- [x] P2: rename `markableVoid` to `isMarkableVoid`.
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
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
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All 13 rows implemented; stale applicable API audit is clean. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final source, public barrel, docs, rule, and changeset audits recorded below. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding | Accepted 13-row audit implemented without aliases. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/docs work | Identity, assertions, metadata, History/Yjs, docs, and Browser proofs pass; benchmarks remain out of scope because no performance claim changed. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact commands and counts recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section is complete. |
| Autoreview | yes | Run implementation review | Local autoreview reports zero accepted/actionable findings; generated registry JSON finding rejected because repo policy reserves that CI output. |
| Goal plan complete | yes | Run `check-complete` | `[autogoal] complete` after the final ledger update. |
| Docs source-backed claim audit | yes | Verify docs claims against current source | Schema concept/editor API and Core docs match final source names and semantics. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names | Docs source parity and live schema example route pass. |
| Docs MDX/content parser | yes | Run docs source build/check | `www build:source`, `check:docs`, and full `www typecheck` pass. |
| Plugin page specifics | no | Apply plugin-page kit when applicable | N/A: changed pages are schema/API concepts, not plugin installation pages. |
| Public API / package boundary proof | yes | Audit public API, exports, and package boundary | Compiler/provider aliases exist only under `@platejs/plite/internal`; Core consumes that internal path. |
| Release artifact classification | yes | Classify the published delta | Published breaking API/type/runtime changes in Plite and Core. |
| Published package changeset | yes | Add package changesets | Patch changesets added for `@platejs/plite` and `@platejs/core`; no forbidden minor entries. |
| Registry changelog | no | Use only for registry-only changes | N/A: the registry demo is adoption proof for package API changes, not a registry-only feature. |
| No release artifact | no | Record reason when no artifact applies | N/A: package changesets apply. |
| Package typecheck/build/test | yes | Run owning package checks | 52/52 affected graph tasks, schema 91/91, Core 65/65, History 125/125, Yjs 217/217. |
| Barrel/export generation | yes | Run `pnpm brl` | 55/55 barrel tasks pass. |
| Browser interaction proof | yes | Exercise target routes | Rich descriptor load and standalone table demo render pass in Browser. |
| Browser console/network check | yes | Check fresh route errors | Fresh proof tabs report zero warnings/errors; both routes return 200. |
| Browser final proof artifact | yes | Record route/visible proof | DOM proof records rich text/table/media output and the full editable table. Screenshot waived because DOM and console exposed the complete required state. |
| Agent source / generated sync | yes | Regenerate source rules | `pnpm install` completed; source and generated skill text match. |
| Agent action discoverability | yes | Audit skill/rule routes | Four owning rules and their generated skills name every final schema action. |
| Agent-native review | yes | Close agent-facing findings | Manual parity/discoverability review plus Plate Next v35 validation pass with no accepted finding. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | done | Accepted audit and live owners read | Decide |
| Decide | done | All 13 P0-P2 shapes accepted and locked | Prove and hand off |
| Prove and hand off | done | Source/tests/docs/browser/reviews/checker complete | User review |

Decision brief:
- outcome: one smaller, truthful schema API from author declaration through
  compiled runtime and Plate plugin adoption.
- chosen shape: explicit raw grammar plus `schema.element.textBlock()`, direct
  roots, safe defaults, assertion boundaries, honest names, private compiler
  witnesses, and placement-owned metadata roles.
- strongest rejected alternative: make every non-void block implicitly a text
  block; rejected because it hides missing grammar in structural elements.
- consequence: one intentional public hard cut across Plite/Core and every
  current caller, with no aliases.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| JSON property typing | narrow generic without runtime proof | generic JSON unless a versioned predicate narrows it | Plite | restore type/runtime trust | type tests/docs/callers | inference + runtime rejection | generic overload recursion | rearchitect |
| Compiler type privacy | public `schemaModel` and provider aliases | internal witnesses only | Core/Plite | public definitions should expose authored concepts | barrels/type tests | public import and definition-shape proofs | inference regression | cut |
| Common text blocks | repeated raw grammar | `schema.element.textBlock()` | Plite | remove honest repetition without implicit structure | package/app/docs declarations | compiler/inference/runtime tests | preset overreach | rearchitect |
| Root grammar | `{ content }` wrapper | direct `SchemaContent` | Plite | wrapper has no second law | all complete/named roots | compiler, identity, roots tests | broad mechanical blast radius | rearchitect |
| Complete defaults | required `unknown` and `elements` | reject and `{}` defaults | Plite | safe dominant semantics | all schema definitions/docs | normalization/identity/inference | input/output type split | rearchitect |
| Plate lineage | `schema` | `schemaIdentity` | Core | option carries lineage, not grammar | Core/apps/docs | editor creation/history/Yjs tests | caller breadth | rename |
| Plate block membership | `topLevel` | `blockContent` | Core | semantic group membership, not depth | structural plugins/docs/rules | lowering/group tests | accidental inverted adoption | rename |
| Canonical construction | `createAndFill` | `create` | Plite/Core | only one valid constructor exists | runtime/docs/apps/tests | construction/default tests | name collision/overload inference | rename |
| External validation | typed `validate*(): void` | `assert*(unknown): asserts ...` | Plite/Core | boundary should prove and narrow input | runtime/docs/host callers | malformed JSON + grammar + type tests | assertion generic soundness | rearchitect |
| Property meaning | value-level `significant` | placement-level `role: 'metadata'` | Plite/Core | meaning belongs to usage, not JSON law | NodeId/HTML/ElementState/tests/docs | codec/empty/collab tests | identity fingerprint change | move |
| Plate plugin handle | `schema.handle(Plugin)` | direct descriptor overloads | Core | duplicate path | facade/type tests/docs | compile/runtime descriptor tests | lost optional ownership proof | cut |
| Void predicate | `markableVoid` | `isMarkableVoid` | Plite/Core | consistent predicate naming | all callers/docs | focused runtime tests | pure churn | rename |
| Docs/rules/releases | stale or invalid old shapes | current final API only | docs/agents/changesets | humans and agents must learn shipped truth | content/rules/generated mirrors | docs build/source audit/install | generated drift | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Trust and private types | Plite/Core | JSON typing and schema-model witness privacy | accepted audit | public types compile with no lie/leak | type tests + public import smoke |
| 2. Plite declaration API | Plite | preset, direct roots, safe defaults, metadata placement | slice 1 | compiler/runtime definitions use final shape | schema definition/compiler/identity tests |
| 3. Plite runtime API | Plite | `create`, assertion boundaries, predicate rename | slice 2 | runtime exports and all Plite callers use final names | schema/runtime/slice tests + typecheck |
| 4. Core lowering/facade | Core | `schemaIdentity`, `blockContent`, direct descriptors, metadata consumption | Plite green | Core exposes only final Plate shape | Core type tests/plugin/editor tests + typecheck |
| 5. Adoption | packages/apps | all declarations and calls | Plite/Core green | zero stale applicable matches | affected package/app typechecks/tests |
| 6. Teaching/release | docs/rules/changesets | current docs, source rules, generated skills, release prose | shipped source final | docs/rules match source | docs build/check + install + source audit |
| 7. Closure | repo/browser/review | format, barrels, focused/broad proof, routes, reviews | all code/docs final | every gate green and no accepted findings | lint/brl/checks/Browser/autoreview/checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Narrow JSON property types are runtime-proven | current overload and tests show unsound branch | compile-only accepted/rejected cases + runtime validator tests | done |
| Common text block has one semantic authoring owner | repeated caller/source audit | builder/compiler/inference tests and adopted callers | done |
| Structural/void grammar remains explicit | compiler law and accepted audit | negative declaration tests + schema contract suites | done |
| Schema identity remains stable and complete | compiler/identity source | derived/named/History/Yjs identity suites | done |
| External assertions narrow unknown safely | runtime validation source | type tests + malformed JSON/document/fragment tests | done |
| Plate lowering preserves final Plite schema | Core compiler source | Core schema contract/type tests | done |
| Metadata role preserves HTML/empty behavior | NodeId/HTML/ElementState source | focused codec and emptiness tests | done |
| No stale public surface remains | scoped source inventory | zero applicable matches after adoption | done |
| Docs and agent routes teach source truth | docs/rule inventory | docs build/check, install, generated mirror audit | done |
| Browser consumers still initialize/render | current example/demo routes | Browser interaction + clean console proof | done |

Conditional evidence:
- High-risk scenarios: (1) direct-root normalization changes schema identity;
  (2) assertion generics claim a narrower value than runtime proves;
  (3) metadata-role movement changes HTML persistence or emptiness. Each has
  focused identity/type/runtime proof above.
- External research: N/A for execution; accepted audit already refreshed the
  local ProseMirror/Wordgard/Lexical evidence and target shape is settled.
- Issue/PR provenance: N/A: direct user request, no tracker or PR.
- Browser/benchmark/docs/release/behavior-law owners: Browser, docs, changesets,
  and schema laws apply; benchmarks are N/A because no performance claim or
  algorithmic expansion is planned.

Findings:
- Accepted audit: `docs/plans/2026-07-31-full-schema-api-audit.md` maps 82
  exported schema types, all 27 runtime methods, declaration/docs/proof caller
  families, and exact P0-P3 decisions. User accepted every P0-P2 row.
- The generated plan was regenerated once before implementation to materialize
  the agent-native pack because source rules also teach the renamed API.

Decisions and tradeoffs:
- Hard cut all public names and shapes; no alias period.
- Keep raw algebra and structural explicitness; add only one semantic preset.
- Internal compiler witnesses may remain structurally similar but cannot leak
  through public definitions or barrels.
- Registry callers are adoption surfaces, not a registry-only feature; package
  changesets own release prose.

Review fixes:
- Browser caught duplicate `TablePlugin` installation in the no-merge registry
  demo. The demo now configures the already-installed descriptor through the
  editor override and renders successfully.
- Broad History proof caught the old root wrapper in
  `config/plite-test-jsx.js`; the shared fixture now authors direct root
  content and all 125 History tests pass.
- Autoreview reported no accepted/actionable findings. It mentioned stale
  `apps/www/public/r/*.json`; rejected because those are CI-generated registry
  outputs that repo policy forbids editing or rebuilding locally.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| TS7 runtime parser exposed no `ScriptTarget.Latest` while running the bounded root codemod | 2 | Parse TS/TSX with the installed Babel parser | Resolved; direct primary and named roots were flattened without reformatting callers. |
| First Plite typecheck exposed assertion-call TS2775 sites and incomplete metadata/default normalization | 1 | Type assertion owners explicitly, keep assertion methods public, and complete normalized fields | Resolved; fresh Plite source/test typecheck passes. |
| Hidden unique-symbol schema carrier failed declaration emit with TS4023 | 1 | Try an internal string carrier to test declaration ownership | Rejected; public declarations could not name the private symbol. |
| Internal string schema carrier passed Core but failed downstream declaration emit | 1 | Remove the carrier and infer from the honest authored `schema` field | Resolved; Core plus Toc/Comment/Indent declaration builds pass without a carrier. |
| Broad `textBlock` return type erased exact option property keys | 1 | Add const-generic overloads while retaining the zero-argument default | Resolved; Media and Core inference contracts pass. |
| Final History run rejected `config/plite-test-jsx.js` old `{ content }` root | 1 | Migrate the shared fixture to direct root content | Resolved; History 125/125. |
| First Browser load of table no-merge demo rejected duplicate `table` descriptors | 1 | Configure the existing EditorKit table through the editor override | Resolved; standalone route renders with zero fresh console errors. |
| `www typecheck` raced concurrently with `pnpm brl` and temporarily lost `@platejs/comment` declarations | 1 | Rerun after barrel generation completes | Resolved; sequential full www typecheck passes. |
| Root `pnpm lint:fix` reached unrelated existing agent-audit script diagnostics | 1 | Run exact affected-surface Biome and record the root caveat | Resolved for this task: 2,572 affected files plus final fixture/demo checks pass; 217 unrelated shared diagnostics remain outside this schema hard cut. |

Verification evidence:
- `bun test --preload ./config/plite-source-test-setup.ts` on the nine schema
  files: 91 passed, 0 failed.
- Core plugin/editor focused suite: 65 passed, 0 failed.
- `pnpm --filter @platejs/plite-history test`: 125 passed, 0 failed.
- `pnpm --filter @platejs/yjs test`: 217 passed, 0 failed.
- Affected source-first graph: 52 successful tasks across 14 packages.
- Full `pnpm --filter www typecheck`, `www check:docs`, docs source parity, and
  registry source checks pass.
- `pnpm brl`: 55/55 tasks; Plate Next v35 registry validation: 42 active, 1
  retired.
- Required root `pnpm lint:fix` applied safe fixes but stops on 217 unrelated
  shared agent-audit diagnostics. Exact affected-surface Biome passes across
  2,572 files; final fixture/demo check passes 2/2.
- Source audit has zero applicable `schemaModel`, `createAndFill`, public
  `validateDocument`/`validateFragment`, public `.markableVoid`, `topLevel`,
  value `significant`, Plate `schema.handle(Plugin)`, or authored root-wrapper
  matches. Remaining `validateDocument` and `markableVoid` identifiers are
  internal publication/codec switches or raw schema declaration data, not the
  removed public runtime methods.
- Browser: `/examples/plite/plate-schema-descriptors` loads the rich descriptor
  document and renders rich text, link, list, table, code, image, and media;
  `/blocks/table-nomerge-demo` renders the editable table. Fresh tabs report no
  warnings/errors and both routes return HTTP 200.
- Source/generated agent rule parity is present for `best-api`,
  `plate-plugin-creator`, `plate-next`, and `docs-creator`; no accepted
  agent-native finding remains.

Final handoff prepared:
- Ownership and target API/runtime: Plite owns schema algebra/compiler/runtime;
  Core owns Plate descriptor lowering and the descriptor-scoped facade.
- Public breaks and Plate/collaboration adoption: all 13 rows are hard-cut and
  adopted through packages, apps, docs, History, and Yjs without aliases.
- Applicable browser/benchmark/docs/provenance decisions: Browser and docs
  proof pass; benchmark and tracker provenance are out of scope for this
  direct architecture request.
- Proof and execution risks: identity, assertion narrowing, metadata behavior,
  downstream declaration emit, and collaboration persistence are covered.
  Root lint retains only unrelated shared-script diagnostics.
- Execution order and user attention: implementation is complete; review the
  two changesets and the final public call shapes. No source action remains.

Timeline:
- 2026-07-31T12:21:25.989Z Plite Plan created.
- 2026-07-31 User accepted all P0-P2 rows; one-shot execution goal created.
- 2026-07-31 Plan regenerated before source edits with docs, package-api,
  browser, and agent-native packs; governing skills loaded.
- 2026-07-31 Direct-root migration and first Plite declaration/runtime packet
  landed; `pnpm turbo typecheck --filter=./packages/plite` passes.
- 2026-07-31 Plite/Core adoption, docs, metadata roles, private compiler type
  ownership, changesets, rules, and generated mirrors completed.
- 2026-07-31 Browser found and verified the no-merge demo integration repair;
  broad History proof found and verified the final fixture adoption.
- 2026-07-31 Final tests, type graph, docs, barrels, Browser, autoreview, and
  agent-native review pass; handoff prepared.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Executing Core privacy/facade and package adoption slices |
| Where am I going? | Plite declarations/runtime, Core lowering, adoption, teaching/release, closure |
| What is the goal? | Ship all accepted P0-P2 schema improvements with no stale public surface and full proof. |
| What have I learned? | The final API is settled; migration breadth and inference preservation are the execution risks. |
| What have I done? | Activated the goal, locked all decisions, landed the Plite JSON/root/default/runtime foundation, and restored a green Plite typecheck. |

Open risks:
- Public compiler-witness removal may expose hidden `DefinitionOf` inference
  dependencies; fix the owner generics, never re-add the public field.
- Assertion signatures must narrow only what the compiled schema actually
  proves under both reject and preserve policies.
- Direct-root normalization and metadata-role placement both contribute to
  schema identity; migration must be atomic across identity proofs.
