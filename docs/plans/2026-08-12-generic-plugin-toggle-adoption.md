# Generic plugin toggle adoption

Objective:
Add generic plugin element `update.toggle()` and restore handlerless shortcuts and descriptor-scoped toggle calls; done when the bounded adoption audit and focused type/runtime/browser gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-12-generic-plugin-toggle-adoption.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- browser (docs/plans/templates/packs/browser.md)
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Major source:
- type: user request plus live repository source
- id / link: current Codex task; no external tracker
- title: Generic plugin toggle adoption
- decision to make: implement the already accepted descriptor-owned generic
  element `update.toggle()` contract and remove downstream handler glue
- decision criteria: same-name `shortcuts.toggle` dispatches a real plugin
  update; public portal typing infers `toggle`; all compatible shortcut and
  toggle consumers use the short descriptor-scoped shape; structural plugins
  retain feature semantics; focused proof passes

Major lane:
- lane: architecture / public API execution
- output type: verified source implementation and adoption
- implementation expected: yes, explicitly authorized by “ok we need the
  generic toggle then, then recover all shortcuts and .toggle calls”
- affected packages / surfaces: `packages/core`, feature packages that own
  element toggle semantics, registry kits/examples, focused tests, release
  artifact, and one representative browser demo
- dominant risk: exposing a generic operation on incompatible element schemas
  or silently changing structural toggle semantics

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no duration requested
- initial confidence score: N/A: binary type/runtime/adoption gates exist
- improvement loop: N/A: no timed loop requested
- final score / loop closure: N/A: no timed loop requested

Completion threshold:
- Core exposes and resolves generic descriptor-owned element `update.toggle()`
  without casts or explicit callback annotations.
- Every bounded compatible `shortcuts.toggle` declaration is keys-only, and
  custom handlers survive only when the shortcut name does not map to the
  plugin command or the handler performs distinct behavior.
- Every bounded generic block-toggle call uses
  `editor.plugin(Plugin).update.toggle(...)`; feature-semantic custom toggle
  methods remain descriptor-scoped.
- Core type/runtime tests, affected package checks, static adoption searches,
  lint, representative browser proof, changeset classification, and P2
  autoreview close with zero accepted findings.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-12-generic-plugin-toggle-adoption.md`
  passes.

Verification surface:
- Public type tests for inferred element `update.toggle()` and negative
  applicability where the schema contract can distinguish it.
- Core runtime tests proving descriptor portal invocation and keys-only
  shortcut dispatch.
- Focused tests/typechecks for every changed package and the registry app.
- Bounded `rg` audits for `shortcuts.toggle` handlers and generic block-toggle
  calls, with every survivor classified.
- A standalone `/blocks/[id]-demo` route chosen from the affected registry
  surface, including visible behavior and console/network inspection.
- P2 `autoreview` over the final local diff.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.
- Preserve structural semantics such as wrap/unwrap or child conversion; a
  generic toggle must not flatten them into raw type changes.
- Keep the one obvious public path: descriptor portal updates and handlerless
  same-name shortcuts. Add no compatibility alias or root alternative.
- Preserve unrelated shared-checkout work and do not edit templates. Regenerate
  committed editor contracts through `plate generate` when the mutation map
  changes; never hand-edit generated output.
- Repair the owning reusable API doctrine only if its live rule contradicts
  the accepted generic toggle law.

Boundaries:
- Source of truth: latest user request, current `packages/core` plugin runtime
  and types, current feature plugin owners, current tests and registry call
  sites, plus Plate/Common Vision doctrine.
- Allowed edit scope: owning Core types/runtime/tests, affected feature plugin
  declarations/tests, production shortcuts and toggle consumers, one
  changeset per published package when required, and this plan.
- External sources: N/A: no third-party behavior is needed.
- Browser surface: representative affected standalone registry block demo;
  exact id selected from the live manifest during the bounded audit.
- Tracker sync: N/A: no issue or PR supplied; no git mutation authorized.
- Non-goals: redesign shortcut naming, add root `editor.update.toggle`, change
  unrelated element CRUD, refactor component families, regenerate templates,
  or fix unrelated checkout failures.

Output budget strategy:
- Read exact Core owners and bounded feature/registry matches. Count and list
  filenames before printing matches. Exclude generated outputs, templates,
  dependencies, build artifacts, plans, and archives from adoption searches.
  Cap ordinary command output at 12k tokens and save any larger audit as a
  temporary artifact instead of streaming it.

Blocked condition:
- Stop only if the live schema/runtime cannot distinguish a safe generic
  element-toggle applicability law without a new public schema decision, or if
  the same environment/browser blocker repeats three times and no narrower
  owning proof remains.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A: implementation and closeout complete
- goal_status: complete

Current verdict:
- verdict: rearchitect Core generic element updates and adopt the portal
- confidence: high; focused runtime, generated-contract, docs, lint, and review
  gates closed, with unrelated checkout blockers recorded below
- next owner: none
- reason: shortcut dispatch already assumes same-name plugin commands, so the
  missing generic command belongs in the descriptor portal rather than every
  kit handler

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-12-generic-plugin-toggle-adoption.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Generic toggle, recover all shortcuts, recover all `.toggle` calls, preserve semantic exceptions, and proof are explicit above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `major-task` loaded | yes | `.agents/skills/major-task/SKILL.md` read completely |
| Active goal checked or created | yes | `get_goal` returned no goal; creation follows this completed checkpoint |
| Source of truth read before analysis | yes | User request, relevant prior Core ownership memory, `VISION.md` and `docs/vision/{common,plate}.md` are the required live reads before implementation |
| Major lane selected | yes | Architecture/public API execution |
| Decision criteria stated | yes | Major source and completion threshold above |
| Existing repo patterns / prior decisions checked | yes | Prior generic CRUD and plugin-schema portal decision entries identified; live verification remains in current-state phase |
| Helper stack selected | yes | `best-api`, `plate-plan`, `major-task`, `autogoal`, `tdd`, `changeset`, P2 `autoreview` |
| External research decision recorded | no | N/A: local runtime owns the contract |
| Implementation expectation recorded | yes | Explicit user authorization |
| Workspace authority selected | yes | Current `/Users/zbeyens/git/plate-2` checkout only |
| Branch / PR expectation decided | no | N/A: no PR/git mutation requested |
| Output budget strategy recorded | yes | Scoped/capped strategy above |
| Package/API pack selected | yes | Public Core portal and package behavior change |
| Public surface or package boundary identified | yes | Core portal type/runtime plus affected feature packages and registry consumers |
| Release artifact path selected | yes | Updated Core, CLI, Basic Nodes, Toggle, and List Classic release artifacts; no registry-only changelog applies |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read completely |
| Barrel/export impact decision recorded | yes | No file/export topology change expected; rerun `pnpm brl` only if the audit changes that |
| Browser pack selected | yes | `apps/www` registry shortcut behavior is affected |
| Browser route / app surface identified | yes | Standalone affected `/blocks/[id]-demo`; exact live id selected before launch |
| Browser tool decision recorded | yes | In-app Browser for ordinary interaction proof |
| Console/network caveat policy recorded | yes | Inspect and report errors; unrelated build blocker is evidence, not a reason to change scope |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: this is published package behavior, not a registry-only feature.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: published package deltas have changesets.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no exported file topology changed; changesets were updated.
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
| Named verification threshold | complete | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | 120/120 focused runtime tests; 23/23 CLI generation tests; generated editor check and docs check pass |
| Current-state source audit | complete | Map current owner, boundaries, constraints, and affected surfaces | Core compiler/runtime/type owners and every bounded shortcut/toggle survivor classified |
| Decision criteria closure | complete | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Generic toggle is exact, shortcuts are keys-only when same-named, and structural commands retain ownership |
| Options / tradeoffs / rejection record | complete | Record viable options, chosen recommendation, and why alternatives lose | Recorded below |
| Review / pressure pass | complete | Run selected reviewer/lens or record N/A with reason | P2 autoreview completed |
| Review findings closure | complete | Fix or explicitly reject accepted/actionable findings and record closure proof | Four accepted applicability/generation findings fixed; sole final transaction-portal finding rejected with runtime and 3/3 behavioral proof |
| External-source audit | complete | Cite official/local clone/external sources when used, or record N/A | N/A: local Core and Plite sources completely own the behavior |
| Implementation gates | complete | If code changed, close primary-template and touched-surface gates; otherwise N/A | Runtime, types, generation, packages, docs, rule sync, changesets, and browser attempt recorded |
| Final handoff contract | complete | Record recommendation, evidence, caveats, residual risk, and next owner | Recorded below |
| Final lint | complete | Run `pnpm lint:fix` or scoped equivalent when files changed | Scoped Biome check passed for all task implementation/adoption files |
| Output budget discipline | complete | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Audits were glob-scoped and capped; one combined search truncated, then narrower owner searches classified survivors |
| Timed checkpoint | complete | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-12-generic-plugin-toggle-adoption.md` | Run after this closeout update |
| Public API / package boundary proof | complete | Source-audit public API, exports, and package boundary impact | Core owns the portal/generation law; feature packages only adopt it; no export topology changed |
| Release artifact classification | complete | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published Core/CLI/Basic Nodes/Toggle/List Classic API and behavior delta |
| Published package changeset | complete | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing major changesets updated; no forbidden minor entry added |
| Registry changelog | complete | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: registry edits are adoption examples of package behavior |
| No release artifact | complete | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: release artifacts exist |
| Package typecheck/build/test | complete | Run owning package checks or record N/A with reason | CLI passes; Core/Basic Nodes/Toggle/List Classic reach only unrelated `plite-react/src/plugin/with-react.ts:178` error after task-owned errors were fixed |
| Barrel/export generation | complete | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no public file or barrel topology changed |
| Browser interaction proof | complete | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser attempted `/blocks/basic-blocks-demo`; unrelated stale registry index import blocked compilation before interaction |
| Browser console/network check | complete | Record console/network state or why it is not applicable | Build console reports missing `@/registry/components/editor/plate-types.ts`; no product interaction/network request could start |
| Browser final proof artifact | complete | Record screenshot/trace/route/native proof or exact caveat | Visual waiver: app did not compile because of unrelated generated registry drift; runtime tests cover shortcut dispatch and toggling |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Requirements, skills, Vision, prior decision, and live owners read | current-state map |
| Current-state map | complete | Core types expose element insert/remove/set; runtime lowers the same three; shortcuts already auto-dispatch same-name update commands; Plite owns `blocks.toggle`; compiled schema owns exact `textBlock` membership | options |
| Options and recommendation | complete | Add schema-gated generic toggle in Core, emit exact eligibility in generated mutation maps, and retain authored structural overrides | review |
| Review / pressure pass | complete | P2 review findings verified against the live source | implementation |
| Implementation or plan artifact | complete | Core generic command, generation, shortcuts, consumers, docs, rules, and release artifacts updated | verification |
| Verification | complete | Focused runtime 120/120; CLI 23/23; transaction portal 3/3; generated/editor/docs/lint pass | closeout |
| Closeout | complete | Known unrelated type/browser blockers and review rejection recorded | final response |

Findings:
- `shortcuts.toggle` is designed to dispatch the plugin portal command with the
  same name; workaround handlers indicate the descriptor is missing its
  expected update capability.
- Core currently synthesizes only `insert`, `remove`, and `set` for elements;
  mark plugins already synthesize `toggle`.
- Plite already owns the primitive `tx.blocks.toggle(type, options)`, so Plate
  needs a typed descriptor projection rather than a second implementation.
- The compiled schema derives exact `textBlock` membership, including closed
  application overrides. Generated mutation maps currently omit that fact.
- Structural owners are materially different: blockquote toggles wrapping,
  while code block/list/layout owners perform feature transformations.

Decisions and tradeoffs:
- Add a real descriptor-owned generic element toggle, not shortcut-only magic
  and not repeated kit handlers -> keeps one discoverable command and preserves
  keys-only shortcut configuration -> risk is applicability, proven against
  schema and structural plugin owners.
- Expose the generic command only for compiled `textBlock` elements -> avoids
  polluting table/void/container portals while covering paragraph and headings.
- Emit a `toggle` eligibility bit in generated mutation contracts -> keeps
  closed-editor autocomplete exact without attaching the recursive grammar to
  every capability.
- Infer raw descriptor eligibility conservatively from authored text-accepting
  element grammar -> raw kits stay useful; generated kits remain the exact
  application boundary.
- Reject an all-element `toggle` -> tables and voids would gain a nonsense
  command.
- Reject shortcut-only routing to `blocks.toggle` -> shortcut behavior would
  diverge from the public plugin portal and retain duplicate handlers.
- Keep authored structural `update.toggle()` methods -> their wrap/convert
  semantics cannot be represented by a raw discriminator swap.

Implementation notes:
- Runtime publication can classify final element types from the compiled
  schema before shortcut compilation; the update factory can gate its default
  command through the transaction schema.
- Type projection needs one non-recursive eligibility bit. The CLI can derive
  it from `EditorSchemaContractElement.groups`, while raw definitions can infer
  direct text-accepting grammar without carrying the full schema grammar.

Review fixes:
- Require no required construction properties before synthesizing toggle.
- Exclude authored `toggle` semantics from generated eligibility.
- Infer raw eligibility only from the canonical `schema.element.textBlock()`
  declaration, not any lookalike text grammar; migrated Toggle and Todo List to
  that canonical declaration so their raw portals remain exact.
- Treat application schema overrides as a generation boundary for exact
  mutation eligibility.
- Carry the final schema source through portal and transaction update typing
  without recursively expanding the grammar.
- Rejected the final P2 finding that `tx.plugin` lacks a runtime selector:
  `withPlite.ts` installs it through `setEditorTransactionViewTransform`, and
  focused tests prove descriptor, string, direct capability, rollback,
  descriptor-family, and missing-plugin behavior.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Browser app build stopped on missing generated `plate-types.ts` registry import | 1 | Keep source scope fixed and use owning runtime/generation proof | Recorded as unrelated visual blocker |
| Package typechecks stop at `plite-react/src/plugin/with-react.ts:178` | 1 | Verify every task-owned diagnostic disappears and record shared blocker | Only the unrelated DOM API cast remains |
| Final reviewer omitted unchanged `withPlite.ts` from its focused bundle | 1 | Verify live runtime owner and focused behavioral tests | Finding rejected with source plus 3/3 tests |

Verification evidence:
- `/Users/zbeyens/git/plate-2`: 120/120 tests across seven focused runtime and
  adoption files; 427 expectations.
- `/Users/zbeyens/git/plate-2`: 23/23 CLI generation tests; 73 expectations.
- `/Users/zbeyens/git/plate-2`: 3/3 focused transaction portal behavior tests.
- `pnpm --filter www editor:check`: all three committed editor contracts match.
- `pnpm --filter www check:docs`: API reference, source build, and parity pass.
- `pnpm --filter @platejs/cli typecheck`: pass.
- Scoped Biome check: pass.
- Core and affected feature package typechecks: task-owned diagnostics clear;
  blocked only by unrelated `packages/plite-react/src/plugin/with-react.ts:178`.
- Static searches find `toggleParagraph` only in historical migration/changelog
  artifacts, no Plate root block-toggle alternative, and only intentional Plite
  primitive/internal structural toggle calls.

Final handoff contract:
- Recommendation: keep generic `update.toggle()` limited to canonical,
  default-constructible text-block descriptors; authored domain toggles win.
- Confidence: high.
- Evidence: compiler/runtime/type/generator owners plus bounded adoption audit.
- Tests / commands: focused runtime 120/120, CLI 23/23, transaction portal 3/3,
  editor generation, docs, CLI typecheck, and scoped lint pass.
- Browser proof: attempted `/blocks/basic-blocks-demo`; unrelated generated
  registry index import prevents app compilation before the editor renders.
- PR / tracker: N/A: no PR or tracker mutation authorized.
- Caveats: unrelated Plite React type error and registry-generation blocker
  remain outside this task.
- Next owner: none for generic toggle; the two unrelated blockers stay with
  their existing shared-checkout owners.

Timeline:
- 2026-08-12T16:59:06.907Z Major-task goal plan created.
- 2026-08-12 Requirements captured before implementation; helper stack and
  public/browser/package proof gates selected.
- 2026-08-12 Generic toggle, generation, shortcut recovery, portal adoption,
  docs/rules, release artifacts, proof, and P2 review closed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final handoff |
| What is the goal? | Add generic element `update.toggle()` and restore all compatible shortcuts/calls to the portal |
| What have I learned? | Canonical `schema.element.textBlock()` is both runtime compiler law and the conservative raw type witness |
| What have I done? | Implemented and verified generic toggle, restored compatible shortcuts/calls, and preserved structural owners |

Open risks:
- Browser visual proof remains unavailable until the unrelated generated
  registry index stops importing missing `plate-types.ts`.
- Broad package typechecks remain blocked by the unrelated Plite React DOM API
  cast diagnostic at `packages/plite-react/src/plugin/with-react.ts:178`.
