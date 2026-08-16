# execute inferred node query hard cut

Objective:
Hard-cut object node matchers and unchecked node generics; done when selector-driven inference, predicate matching, all adoption, doctrine, and named proof pass; plan docs/plans/2026-08-15-execute-inferred-node-query-hard-cut.md.

Flow mode:
one-shot execution of the accepted API plan

Goal plan:
docs/plans/2026-08-15-execute-inferred-node-query-hard-cut.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Major source:
- type: accepted user-directed public API hard cut
- id / link: `docs/plans/2026-08-15-audit-inferred-node-match-api.md`
- title: Inferred node query hard cut
- decision to make: already accepted; execute independent `type` selection plus function-only `match`, remove caller-selected node generics, and adopt every classified sibling API
- decision criteria: no object matcher or compatibility path; no unchecked output generic; descriptor/schema-handle/raw-type selection drives inference; additional predicate conditions compose; Plite stays plugin-free; all callers, docs, tests, exports, changesets, and doctrine agree

Major lane:
- lane: architecture and public API execution
- output type: breaking Plite/Core implementation plus repo-wide adoption and proof
- implementation expected: yes; explicitly authorized by `ok go`
- affected packages / surfaces: `packages/plite`, `packages/core`, all package/app/docs NodeMatch consumers, public release notes, Vision, and affected agent rules/mirrors
- dominant risk: conflating selector, traversal target, predicate, and output again through overloads or widening inference until exact descriptor types become `any`/broad nodes

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: binary type/runtime/adoption gates apply
- improvement loop: vertical TDD slices from Plite query law to Core descriptor inference, then callers/docs/doctrine
- final score / loop closure: N/A

Completion threshold:
- `NodeMatch` is function-only; query options expose independent structural
  `type`; every classified read, selection, transform, insert/correction, and
  static mirror surface has the accepted semantics; explicit caller-selected
  node output generics and object matchers have zero live source/docs/examples;
  focused Plite/Core tests, package checks, docs build, lint, doctrine sync,
  review, changesets, and the final goal checker pass.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-execute-inferred-node-query-hard-cut.md`
  passes.

Verification surface:
- Compile-only inference/negative tests and runtime matcher tests in Plite/Core.
- Focused package tests and source-first Plite/Core typechecks, then affected
  package/app checks discovered by adoption.
- Zero-stale source audits for object `match`, unchecked node-method type
  arguments, normalization branches, and old docs examples.
- `pnpm --filter www build:source`, `pnpm lint:fix`, changeset audit,
  `pnpm install` mirror sync, agent-native review, and final goal checker.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Execute the accepted breaking target without aliases, deprecated overloads,
  object matcher fallback, caller casts/annotations, or Plate concepts in Plite.
- Preserve predicate type guards, transaction-local behavior, schema overrides,
  declaration emit finiteness, and current runtime traversal semantics.

Boundaries:
- Source of truth: accepted audit plan, live Plite/Core declarations and runtime,
  current callers/tests/docs, root Vision, and source-owned `.agents/rules/**`.
- Allowed edit scope: owning matcher/query implementation and types, affected
  callers/tests/docs/exports, release artifacts, Vision, and affected rule owners.
- External sources: N/A: local source and accepted decision settle behavior.
- Browser surface: N/A unless adoption exposes a runnable behavior regression;
  this is a compile/runtime API contract rather than a visual UI change.
- Tracker sync: N/A: no issue or PR source.
- Non-goals: static editor API deletion, unrelated schema redesign, registry UI
  changes, compatibility bridges, and migration-only helper types.

Output budget strategy:
- Count/file-list audits before printing matches; inspect owning declarations
  and representative callers in capped slices; exclude generated registry JSON,
  build output, templates, node_modules, coverage, `.next`, and `dist` unless a
  named proof owns them.

Blocked condition:
- Block only after three evidence-backed attempts if TypeScript cannot express
  selector-driven inference without `any`, recursive app-grammar expansion, or
  a compatibility surface and no smaller owner repair remains.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A
- goal_status: complete

Current verdict:
- verdict: execute the accepted hard cut with one options grammar: structural
  `type` selector plus function-only `match`
- confidence: high; implementation proof remains open
- next owner: Plite query types/runtime first, Core descriptor lowering second,
  then repo-wide adoption and doctrine
- reason: the selector provides runtime proof and contextual inference while a
  single predicate preserves arbitrary conditions without a shallow query DSL

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-execute-inferred-node-query-hard-cut.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Hard-cut function-only `match`; independent `type`; remove unchecked generics; adopt all sibling APIs; no compatibility; tests/docs/doctrine/proof recorded above. |
| Timed checkpoint parsed | no | N/A: none requested. |
| `major-task` loaded | yes | Read `.agents/skills/major-task/SKILL.md` fully. |
| Active goal checked or created | yes | `get_goal` returned none; this static execution plan exists for goal creation. |
| Source of truth read before analysis | yes | Read accepted audit plan, `NodeMatch`, `matchesNode`, normalization, node editor/transform interfaces, and representative callers. |
| Major lane selected | yes | Architecture/public API execution. |
| Decision criteria stated | yes | Major source and completion threshold record binary criteria. |
| Existing repo patterns / prior decisions checked | yes | Accepted audit plus current Vision/Best API schema-handle and inference law. |
| Helper stack selected | yes | `plite-plan`, `plate-plan`, `hard-cut`, `tdd`, `changeset`, `docs-creator`, and `agent-native-reviewer` only when its surface is reached. |
| External research decision recorded | no | N/A: local API/runtime ownership settles the implementation. |
| Implementation expectation recorded | yes | Explicitly authorized one-shot accepted-plan execution. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2`. |
| Branch / PR expectation decided | no | N/A: no PR/commit request; current checkout only. |
| Output budget strategy recorded | yes | Count-first, capped owner reads, generated/build paths excluded. |
| Docs pack selected | yes | Public docs/examples must adopt the breaking grammar. |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md` fully. |
| Docs lane selected | yes | API reference/concept adoption only; keep current-state voice and existing topology. |
| Target docs and nearest sibling docs read | yes | Accepted audit identified Plite editor API, node, transform, and selection docs; read them alongside live source before edits. |
| Docs style doctrine read | yes | `docs-creator` current-state, exact-source, and API-reference rules loaded. |
| Documented source owner identified | yes | `packages/plite` owns raw syntax; `packages/core` owns descriptor specialization. |
| Package/API pack selected | yes | Plite/Core public query and matcher types change. |
| Public surface or package boundary identified | yes | Plite owns raw query/runtime; Core owns Plate descriptor specialization. |
| Release artifact path selected | yes | Per-package `.changeset` files after verifying the delta against `main`; no registry changelog. |
| `changeset` skill loaded when `.changeset` is required | yes | Read `.agents/skills/changeset/SKILL.md` fully. |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` only if exported file layout/barrels change; type-in-place edits alone do not require it. |
| Agent-native pack selected | yes | Accepted API law requires `best-api` source repair and dependent-rule audit. |
| Agent-facing action surface identified | yes | Matcher/query API doctrine and package author/consumer guidance. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; never generated `.agents/skills/*/SKILL.md`; run `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read `.agents/skills/agent-native-reviewer/SKILL.md`; final parity review required after rule sync. |

Work Checklist:
- [x] N/A: no duration was requested; binary proof gates apply instead.
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
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
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | Zero-stale audits pass; full tests, package graph, www, strict Plite/Chromium, lint, barrels, API reference, doctrine sync, and a clean two-pass P2 review pass. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Plite owns raw selectors/runtime; Core owns descriptor lowering; adoption and exact-get regression audit are complete. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Function-only `match`, independent `type`, inferred reads/transforms/split, and no compatibility path are implemented. One-shot exact schema projection is intentionally limited as recorded below. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Decisions and tradeoffs record the accepted grammar, rejected object DSL/unchecked generics, and measured 4 GB inference boundary. |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Final two-pass P2 `autoreview` is clean with zero accepted/actionable findings; overall correctness is `patch is correct` at 0.96 confidence. |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Every accepted P2 finding is fixed and proven. The replacement two-pass review found no remaining actionable issue. |
| External-source audit | no | Cite official/local clone/external sources when used, or record N/A | N/A: local source, runtime, tests, and the accepted API plan settle the contract. |
| Implementation gates | yes | If code changed, close primary-template and touched-surface gates; otherwise N/A | Package/API, docs, browser, and agent-source/mirror gates are closed except final agent-native review. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Recorded below with the final API law, complete proof, deliberate inference boundary, and no follow-up owner. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | `pnpm lint` exits 0: 0 errors; 15 existing oversized-artifact warnings and 19 existing ESLint warnings. Targeted Biome write reports no remaining fixes. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Count-first audits were used. The strict gate emitted large bounded test output; subsequent waits were capped and summarized. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-execute-inferred-node-query-hard-cut.md` | Pass: `[autogoal] complete`. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Zero-stale source/docs searches plus www docs source/parity checks pass. Historical plans retain historical examples by design. |
| Docs links / routes / previews | no | Verify leaf links, routes, anchors, and preview names or record N/A | N/A: no new public leaf, anchor, preview, or route was added. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | Passed inside `pnpm --filter www typecheck`. |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: no plugin page was created or structurally changed. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Plite raw selector/runtime and Core descriptor projection boundaries are covered by compile-only contracts, builds, API reference, and package graph proof. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published breaking Plite and Core API/type/runtime behavior. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing major changesets for `@platejs/plite` and `@platejs/core` teach the exact hard cut and migration call sites. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: this is package API/runtime work; registry source remained outside this task's write authority. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: published package users see a breaking delta. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Plite/Core/List Classic focused proof, 53-package graph, full fast tests, www, and strict Plite gate all pass. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl`: 56/56 tasks passed. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` applied Skiller and synced required resources; source/mirror searches and Plate Next v78 validation pass. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `best-api`, `plate-next`, and `plate-plugin-creator` each teach independent `type`, function-only `match`, and no caller result generic. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Action map is coherent: matcher hard cut -> `best-api`/`plate-next`/`plate-plugin-creator` source rules -> generated mirrors -> compile/runtime/audit gates. Plate Next v78 source/mirror validation and tests pass with zero stale teaching found. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | accepted plan, governing skills, Vision, matcher types/runtime, and representative docs/callers read | current-state map |
| Current-state map | complete | refreshed declarations/runtime and counted 283 remaining explicit node generics plus 171 object type matchers after the first vertical slice | implementation |
| Options and recommendation | complete | user accepted `type` selector plus function-only `match`, with no overload/compatibility path | implementation |
| Review / pressure pass | complete | prior `best-api` pass rejected object DSL, positional overload, and plugin-scoped traversal | implementation |
| Implementation or plan artifact | complete | Plite function-only matcher, selector normalization, read/transform/split/correction contracts, Core descriptor lowering, and repo adoption are implemented. | verification |
| Verification | complete | Focused/full tests, 53-package typechecks, www, strict Plite/Chromium, lint, barrels, API reference, zero-stale audits, doctrine sync, and two-pass P2 review pass. | closeout |
| Closeout | complete | Final source audits find zero direct caller-selected mutation generics; raw `nodes` retains only the honest type-guard and selector overloads plus its internal implementation. Final checker evidence follows. | final response |

Findings:
- Fact: the live implementation had one generic carrying traversal scope, selector, predicate input, and caller-selected output across reads and transforms.
- Fact: a schema handle can project exact element properties without expanding the application grammar; a raw string cannot safely recover those properties without reintroducing the EditorKit TS2589 failure.
- Inference: exact plugin/schema-handle selection and literal-discriminator-only raw string selection are the finite type boundary.
- Recommendation: keep runtime capabilities lightweight, lower Plate descriptors through the final compiled application schema, and reserve full schema expansion for generated/application contracts.
- Rejected: expanding every raw string through `Value` because it makes every query/update capability carry the entire recursive schema grammar.
- Rejected: keeping caller output generics, object matcher compatibility, or positional overloads because each restores an unchecked alternative path.
- Blast radius: Plite/Core public query and transform types/runtime, every package/app/docs caller, changesets, Vision, and agent doctrine.

Review boundary and measured constraints:
- Third review cycle is explicitly narrowed to the six P2 contract findings
  from the complete two-pass review: root-aware read result types, safe
  one-shot structural selector guards, generated insert split inference,
  text-path split ancestor resolution, widened parent optionality, and plural
  insert inference. No adjacent API redesign enters this cycle.
- Exact final-schema projection on every one-shot transform predicate was
  rejected after three measured forms exhausted Node's normal 4 GB heap on the
  full EditorKit. Exact final-schema inference remains on reads, transaction
  methods, and one-shot set/unset. Other one-shot structural predicates are
  broad `Element` but reject non-element plugin descriptors; this is honest and
  finite instead of exposing stale raw plugin properties.
- The narrowed third P2 review returned six accepted findings: mark-only
  generated split selectors, stale plural-insert artifact declarations,
  maybe-undefined mutation selector narrowing, unchecked singular and plural
  insert predicate narrowing, and boundary-position ancestor splitting. The
  owners now guard Plate element descriptors, keep maybe-undefined selectors
  broad, require a structural selector before split-predicate narrowing,
  preserve generic method inference through Plite extension projections,
  force explicit path-position splits after ancestor resolution, and publish
  both insertion overloads in packed declarations and API-reference output.
- One final P2 closure review is authorized only to validate those six repairs.
  New adjacent API redesign remains out of scope; any new finding must be
  classified here before another edit cycle.
- The final P2 closure review returned four reports representing three accepted
  in-scope defects: state/static selectorless `above` excluded a runtime-valid
  editor root; transaction insert retained one caller-selected split target;
  and singular/plural insertion rejected a selector union containing
  `undefined` instead of accepting it with broad predicate typing. Repair the
  shared declarations, add compile/runtime contracts, rerun affected proof,
  then run one replacement closure review. No adjacent API redesign enters
  this cycle.
- The replacement two-pass P2 review returned five reports representing three
  actionable defects and one rejected repeat. Accepted: package insertion
  wrappers disabled structural `split.type`; Table also discarded the nested
  `split` option at runtime; transaction `unset<T>()` retained one unchecked
  caller-selected target. Rejected: expanding every direct one-shot transform
  through the full application schema, because that exact owner change already
  exhausted TypeScript's normal 4 GB heap in three measured attempts. Repair
  the accepted shared owners and rerun focused proof plus one required clean
  review because the accepted fixes change code.
- The required replacement P2 review returned four accepted in-scope defects:
  selectorless static `parent` dropped its promised invariant; raw `nodes<T>`
  retained an unchecked output generic; direct Plite mutation functions still
  accepted caller-selected target generics without a runtime `type`; and Code
  Block advertised `split` while discarding it. Repair those exact owners,
  prove selector-driven/direct-call inference and runtime behavior, then run
  one clean replacement review. No adjacent matcher or schema redesign enters
  this cycle.
- That replacement review returned three current P2 defects: filtered static
  `parent` swallowed unrelated location failures; broad direct-mutation,
  state-`next`, and block-duplicate fallbacks rejected optional selector
  variables; and mapped `toArray` lost real type-guard inference. Remove the
  catch, make broad overloads accept the selector union without narrowing, add
  the missing mapper guard overload, and rerun focused plus replacement review
  proof.
- First red contract: `pnpm --filter @platejs/plite typecheck` rejected `type`, `split`, and negative matcher/generic assertions before implementation.
- Plite owns raw string/schema-handle normalization and function-only predicates; Core owns descriptor-to-final-schema lowering for direct reads, callback state, transactions, selection helpers, and correction registration.
- Focused source/test typechecks passed after the first vertical slice: Plite source, Plite test declarations, and Core source. These are interim results and must be rerun after adoption.
- Accepted audit found 319 explicit node API type arguments across 76 files,
  177 `match: { type }` candidates across 56 files, and 36 public `NodeMatch*`
  declaration references.
- Current `NodeMatchProps` is a shallow property DSL; runtime silently ignores
  `children`/`text` and interprets arrays as membership. The accepted hard cut
  removes that ambiguous behavior instead of preserving it as convenience.
- Plite must own raw structural selection and predicate execution; Core may
  specialize the same query input with exact Plate descriptors.

Decisions and tradeoffs:
- Keep one options-object grammar: `type` selects structural identity and
  drives inference; `match` is a function-only additional condition.
- Preserve a same-syntax type-guard signature when useful; reject positional
  or object-matcher overloads and every compatibility branch.
- Convert insertion's split-target matching into a distinct `split` query;
  remove dead inherited match fields where insertion already receives a Path.
- Keep direct value comparators (`ElementApi.matches` / `TextApi.matches`) only
  if independently used; do not make them query matcher languages.

Implementation notes:
- `NodeMatch` is a strict function type. Runtime selector normalization remains
  internal; public options carry `type` and an additional predicate separately.
- Selectorless/root-capable reads return a root-aware `Node`; exact selectors
  recover their exact node shape. Static parent overloads preserve the required
  unfiltered ancestor and optional filtered ancestor distinction.
- Plate resolves descriptors against the final application schema. Generated
  insertion methods retain their generic split inference through the internal
  `EditorGenericMethod` projection brand without publishing that machinery from
  Plite's main entrypoint.
- Singular and plural insertion expose a selector-driven split overload plus a
  broad selectorless fallback. Maybe-undefined selectors stay broad instead of
  claiming a narrow predicate input.
- Explicit path-position splitting resolves the selected ancestor and still
  forces boundary splits. Focused runtime rows cover interior and zero-boundary
  positions.
- One List Classic regression exposed a migrated misuse of exact `nodes.get`
  filtering as a type assertion. Removing the fake filter restored ancestor
  traversal from text selections and the editor root. A repo-wide exact-get
  audit found no sibling misuse.

Review fixes:
- Root-aware selectorless reads no longer promise descendant-only shapes.
- Generated split selectors reject mark-only Plate descriptors.
- Plural insertion packed declarations and API-reference output expose both
  inference overloads.
- Maybe-undefined selectors do not narrow mutation predicates.
- Selectorless singular and plural insertion cannot use an annotated predicate
  to select an unchecked target type.
- Explicit boundary positions split the selected ancestor instead of becoming
  a no-op.
- Compile-only query contracts are wrapped in an inert function so Bun's test
  discovery cannot execute editor operations at module load.
- Package insertion helpers preserve structural split selectors without
  pretending the selector is the inserted node type; Table forwards the nested
  split contract into its insertion plan.
- Transaction `unset` uses selector-driven and broad fallback overloads, with
  no caller-selected mutation target generic.
- Final review repairs included restoring selectorless static-parent failure,
  removing raw `nodes<T>` and direct-mutation target generics, and narrowing Code
  Block's custom insert options to the behavior it actually implements.
- Selectorless static `parent` now returns an ancestor or raises its named
  invariant; filtered calls remain optional. Raw `nodes` keeps only the honest
  type-guard generic plus selector inference. Every direct mutation function
  uses a selector-required exact overload and a broad selectorless fallback.
  Code Block's custom insert contract excludes unsupported `split` behavior.
- Filtered static `parent` no longer catches unrelated failures. Broad mutation
  overloads accept selector unions only when `undefined` is genuinely present,
  so optional variables work without letting exact selectors bypass exact
  property validation. State `next`, block duplication, and mapped `toArray`
  have matching optional-selector/type-guard contracts.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Exact final-schema projection on every direct one-shot structural mutation exhausted Node's normal 4 GB heap | 3 | Keep exact final-schema inference on reads, transactions, and direct set/unset; use broad `Element` plus descriptor guards on the remaining one-shot callbacks | Full EditorKit/www typecheck passes under the normal heap without publishing a false exact type. |
| Full strict Plite package tests executed a compile-only static parent contract at module load | 1 | Make the whole compile contract inert rather than seeding fake runtime data | Plite package tests pass 1,441/1,441 and strict proof passes. |
| List Classic lost ancestor traversal after exact `get` filtered a text/root path | 1 | Remove type-assertion filters and let `above` own ancestor selection | List Classic passes 90/90; repo-wide exact-get audit found no equivalent misuse. |

Verification evidence:
- `pnpm --filter @platejs/plite typecheck`: pass.
- `pnpm --filter @platejs/core typecheck`: pass, including declaration
  contracts.
- `pnpm --filter @platejs/list-classic typecheck`: pass.
- `pnpm --filter @platejs/list-classic test`: 90 passed.
- `bun test --preload ./config/plite-source-test-setup.ts
  ./packages/plite/test/transforms-contract.ts`: 52 passed.
- `bun run test`: 3,110 passed, 0 failed across 346 files, plus every bounded
  follow-up suite passed.
- `pnpm turbo typecheck --filter='./packages/*'`: 91/91 tasks across 53
  packages.
- `pnpm --filter www typecheck`: editor generation, API reference, docs source,
  docs parity, registry-source checks, app typecheck, and package integration
  typecheck passed.
- `pnpm check:plite`: strict pass. Package tests include Plite 1,441/1,441;
  Chromium passed 698 with 6 intentional skips across 78 bounded batches.
- Final post-review-fix proof: Plite, Core, and Code Block typechecks pass;
  Code Block passes 64/64 tests; static-parent runtime passes 12/12; the full
  53-package graph passes 91/91; `bun run test` passes 3,110/3,110 plus every
  bounded follow-up; www editor/API/docs/registry/integration checks pass;
  barrels pass 56/56; lint exits zero with only existing warnings; and the
  strict Plite gate passes again with Chromium 698 passed, 6 intentional skips,
  and 78/78 bounded batches.
- Final two-pass P2 `autoreview`: clean in both chunks, zero accepted/actionable
  findings, overall correctness `patch is correct` at 0.96 confidence.
- `pnpm lint`: exit 0 with no errors; only the existing oversized-artifact and
  React-hook warnings remain.
- `pnpm brl`: 56/56 tasks. `pnpm --filter www api-reference:check`: pass.
- `pnpm install`: Skiller source-to-mirror sync and Plate Next resources pass;
  Plate Next v78 validates with doctrine fingerprint
  `80068ae37176bf6d4457e0eb247224fda77817344612b8dfcf90d1d66d22fb64`.
- AST/source audits report only deliberate `@ts-expect-error` object matcher
  and caller-generic assertions; insertion has zero stale top-level `match`.
- `git diff --check`: pass before the final plan update; rerun at closeout.

Final handoff contract:
- Recommendation: ship one selector grammar: `type` proves structure and
  inference; `match` adds computed conditions. Keep caller generics and object
  matcher DSLs deleted.
- Confidence: high; final P2 and agent-native reviews remain.
- Evidence: source/type/runtime/adoption audits and all named proof above.
- Tests / commands: focused package proof, full fast suite, complete package
  graph, www integration, lint/barrels/API reference, and strict Plite.
- Browser proof: strict Chromium matrix passed 698 tests with 6 intentional
  skips across 78 bounded batches. Earlier manual Plite rich-text smoke also
  accepted input without route errors.
- PR / tracker: N/A: no commit, PR, or public tracker mutation was requested.
- Caveats: direct one-shot structural mutation predicates intentionally infer
  broad `Element` outside set/unset; exact final-schema projection there caused
  reproducible normal-heap exhaustion. Historical plan artifacts retain their
  historical syntax and are not live API teaching.
- Next owner: none. The hard cut and its adoption are complete.

Timeline:
- 2026-08-15T09:26:03.670Z Major-task goal plan created.
- 2026-08-15T11:27:02+02:00 Accepted execution goal created after loading the
  Plite/Plate, hard-cut, TDD, docs, changeset, best-api, and agent-native owners.
- 2026-08-15T15:40:00+02:00 Full fast tests, the 53-package typecheck graph,
  www integration, lint, barrels, API reference, doctrine sync, and strict
  Plite/Chromium proof passed after the compile-contract and List Classic
  regressions were repaired.
- 2026-08-15T17:43:53+02:00 Final direct-generic and raw-node audits, barrels,
  lint, Plate Next v78 validation/tests, diff check, and clean two-pass P2
  review closed the source and doctrine surfaces.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; final checker invocation remains. |
| Where am I going? | Goal completion and exact handoff. |
| What is the goal? | Hard-cut object matchers and unchecked node generics across the complete accepted surface. |
| What have I learned? | The object DSL has no honest surviving job; exact final-schema inference must stop where it makes every one-shot capability expand the whole EditorKit grammar. |
| What have I done? | Implemented and adopted the hard cut, repaired split/root/list regressions, synced doctrine, and passed every named source/type/runtime/browser gate before final review. |

Open risks:
- The deliberate broad `Element` boundary on some direct one-shot mutation
  callbacks is less precise than transaction inference, but it avoids a proven
  TS2589/OOM failure and never permits mark-only structural selectors.
