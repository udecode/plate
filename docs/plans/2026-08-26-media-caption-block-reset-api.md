# Media caption block reset API

Objective:
Add `tx.blocks.reset()` as the canonical schema-default block mutation, migrate
the proven consumers, and keep Enter in a media caption splitting into a
paragraph instead of another media node.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-media-caption-block-reset-api.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- package-api

Regression source:
- target bug / surface / corpus: `MEDIA-CAPTION-ENTER-001` plus the accepted
  `PLITE-BLOCKS-RESET-001` owner API
- lane and current source owner: Plite transaction blocks API; Plate core
  Override, media, and toggle are adoption owners
- selected executable test cases: Plite reset contract; media caption Enter;
  Override split/reset; toggle Enter conversion
- tested ref or dirty-state boundary: base ref
  `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`; current checkout already contains
  the earlier media behavior candidate, so final source fingerprints and the
  uncommitted boundary are authoritative
- route / proof host and freshness method: focused source-first package tests;
  final Browser replay on the local media demo only if the route is runnable;
  input-digest proof receipt after the last shared-owner edit
- invocation mode / timebox: one-shot, serial single-writer execution; no fixed
  timebox

First checkpoint:
- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop
  condition, deliverable, verification surface, and final handoff requirement
  into the Work Checklist before mutable work.
- Load `.agents/skills/regression/references/methodology.md`.
- Fill the selected-case, reporter-oracle, failed-fix, and architecture tables,
  then run `validate-regression-plan.mjs` before implementation.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:
- Every selected observed regression has an executable test that fails on the
  violated invariant and passes after the fix.
- Every selected case records `unit-red: <test>` or
  `e2e-required: <lower-layer limitation>`. Unit/package RED stops new E2E test
  creation; Browser may remain final verification without permanent E2E coverage.
- Every case has positive and forbidden-state assertions for model, DOM/native,
  focus, popup, geometry/paint, runtime errors, and follow-up input, with an N/A
  reason for observations that do not apply.
- Current source and every proof host are ready before behavior claims.
- Every kept case has exact reproduction, one-case Patch evidence, focused
  green proof, required retry-free stability, final ref/dirty-boundary proof,
  and no accepted P1 finding.
- Every kept case and the run are marked `completed` when those local gates
  pass. Commit and push are not local completion gates.
- Every case records `repair-now`, evidence-backed `no-change`, or
  evidence-backed `defer`.
- Every failed claimed fix invalidates its prior proof and automatically repairs
  Regression with an executable workflow test before the next product attempt.
- A second failed fix or architecture trigger has an accepted Best API and
  Plite/Plate layer plan before implementation resumes.
- Final proof has a generated receipt and affected-corpus replay after the last
  shared-owner edit.
- All canonical Work Checklist and Completion Gates rows resolve and
  both semantic validation and `check-complete.mjs` pass.

Verification surface:
- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-26-media-caption-block-reset-api.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-media-caption-block-reset-api.md`

Constraints:
- Executable tests own durable regression behavior.
- GitHub owns issue provenance/status; exact refs and runtime/CI receipts own
  integration claims.
- Regression owns selection, proof width, stability, packet decision, claim
  width, and methodology delta.
- Patch owns one normalized local repair at a time.
- The goal plan is transient coordination, not a second behavior database.
- Baselines are evidence, not law. Proxy proof never upgrades the exact case.
- No parallel writers to shared source, tests, plans, generated output, builds,
  or route hosts.
- Generated output is not a source owner.
- Mark fully proved local work `completed` and record its local ref/dirty
  fingerprints plus uncommitted/unpushed state when true. Do not widen that
  status into integrated, shipped, released, or public issue completion without
  the owning evidence and authority.
- A failed fix means a claimed candidate/kept/completed repair that fails exact
  replay/final verification or receives a reporter contradiction. Expected TDD
  red is not a failed fix.
- A failed fix always enters automatic Regression `repair-now`; prose-only
  repair, `no-change`, and `defer` cannot resume the product attempt.

Boundaries:
- allowed source owners: `packages/plite` block transaction API,
  `packages/core` Override adoption, `packages/media` caption command adoption,
  `packages/toggle` known-active conversion, current-state API docs, Plite
  Vision, Best API source rule, changesets, and this goal plan
- allowed proof/test owners: focused Plite transform contract, existing core
  Override, media contract, and toggle tests; affected package typechecks and
  final local Browser verification
- generated/source boundary: edit `.agents/rules/best-api.mdc`, never its
  generated `SKILL.md`; `pnpm install` owns skill regeneration; templates and
  registry output are out of scope
- browser/device claim width: local browser behavior only; no device,
  production, integration, release, or shipped claim
- forbidden product/API/release/public mutations: no compatibility alias, no
  code-block/list/default-creation migration, no commit, push, PR, publish,
  issue update, or generated template edit
- orchestration mode and writer ownership: one local writer in this thread;
  no subagent or parallel source/host writer

Output budget strategy:
- Start from exact owner and test files. Use runner discovery/counts before
  printing broad corpora. Cap logs and exclude generated/build trees.

Blocked condition:
- Block only when exact current behavior cannot be observed, the authoritative
  host/device/credential is unavailable, unsafe scope needs user authority, or
  the same blocker leaves no safe alternate packet.
- Repair broken commands, stale servers, generated drift, and missing proof
  hosts before treating them as product blockers.

Regression state:
- current phase: final goal-plan check
- current executable case: both selected cases
- current case status: completed locally
- next owner: user for commit/push choice
- goal status: completed locally; uncommitted and unpushed

Completion rule:
- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Explicit first-checkpoint rows below preserve the original report and every correction. |
| Regression methodology loaded | yes | `.agents/skills/regression/references/methodology.md` read in full. |
| Active goal checked or created | yes | Active goal points to this plan. |
| Current source owner and tested ref recorded | yes | Plite blocks API and three adoption owners; base ref `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`. |
| Executable test cases discovered | yes | Existing focused tests are listed in the selected-case and affected-corpus tables. |
| Cumulative reporter evidence resolved | yes | Recording, screenshots, explicit paragraph correction, unit-first correction, and accepted API/name/audit prompts are inventoried below. |
| Reporter oracle matrix resolved | yes | All seven observation classes are resolved below. |
| Regression semantic validator ready | yes | Repo-owned `validate-regression-plan.mjs` will run before implementation. |
| Route/proof-host readiness plan recorded | yes | Source-first unit/package tests first; optional final local Browser replay, never a new E2E when unit RED exists. |
| Patch delegation boundary recorded | yes | One normalized reset case, serial local Patch execution, exact allowed owners below. |
| Orchestrator writer ownership recorded | yes | N/A: one thread and one shared-state writer. |
| Output budget strategy recorded | yes | Owner files and focused test commands only; capped logs; generated/build trees excluded. |
| Claim width and blocked rules recorded | yes | Local behavior/API proof only; no integration, release, or public status. |
| Package/API pack selected | yes | `package-api`. |
| Public surface or package boundary identified | yes | Public `EditorTransactionBlocksApi` in `@platejs/plite`; Plate package consumers adopt it. |
| Release artifact path selected | yes | One patch changeset per published affected package. |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read in full. |
| Barrel/export impact decision recorded | yes | No new exported file or barrel path; method is added to an already-exported interface. |

Work Checklist:
- [x] Explicit requirement: Enter inside a direct media caption splits at the
      caret into the media's left caption and a following paragraph containing
      the right text; it must never insert a second media node.
- [x] Explicit requirement: attempt the exact owner-level unit/package RED
      before considering browser E2E coverage.
- [x] Explicit requirement: when unit/package RED reproduces the invariant, do
      not add an E2E test; E2E is allowed only with a recorded lower-layer
      limitation. Browser may still provide final local verification.
- [x] Explicit requirement: promote the reusable public API as
      `tx.blocks.reset()` / `editor.update.blocks.reset()`, with optional
      `{ at }`; do not expose a feature-specific reset command.
- [x] Explicit requirement: reset each targeted block to its immediate
      parent/root schema default while preserving children, selection, live
      NodeKey, and properties allowed by the type-change lifecycle.
- [x] Explicit requirement: apply defaults through the canonical type-change
      mutation; do not pre-unset arbitrary props or replace the whole node.
- [x] Explicit requirement: throw deterministically when the parent/root has no
      element default, and resolve defaults independently for multi-selection.
- [x] Explicit requirement: migrate the proven Plite toggle-off, Override,
      media, and Toggle consumers; Heading and Callout remain declarative
      indirect consumers.
- [x] Scope boundary: media retains its Enter command policy and guards; only
      the post-split conversion moves to `tx.blocks.reset({ at: rightPath })`.
- [x] Scope boundary: do not migrate code-block unwrap semantics, list
      semantics, or schema-default creation used for insertion, decode, Yjs,
      or HTML.
- [x] Hard cut: remove the generic Override `resetBlock` update API and its
      manual property cleanup; add no alias or compatibility shim.
- [x] Deliverables: public types/runtime/view proxy, owner-level tests,
      adoption edits, current-state docs, smallest durable Best API/Vision
      teaching, one changeset per affected package, source/mirror parity,
      focused proof, final P1 review, proof receipt, and completed goal gates.
- [x] Mutation boundary: no commit, push, PR, publish, release, public issue
      update, registry generation, or template edit.
- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [x] Current source, exact ref/dirty boundary, test runner, route/proof host,
      export/build path, and freshness method are recorded.
- [x] Generated/source drift and host readiness are repaired or block the claim.
- [x] Every selected case has a stable ID, source reference, owner, setup,
      action, expected outcome, expected-outcome authority, executable test
      path/command, tested ref, and required stability. A negative report does
      not authorize an invented positive behavior.
- [x] Every selected case records its `Red-test escalation`. Try the exact
      owner-level unit/package test first. `unit-red:` forbids a new E2E test;
      `e2e-required:` names why no exact unit/package RED is possible. Browser
      verification alone does not become permanent E2E coverage.
- [x] Every selected case inventories its base acceptance, recordings, and all
      later reporter confirmations/contradictions as cumulative deltas. Every
      still-applicable claim stays required; superseded claims cite the source
      and reason that removed them.
- [x] Every required evidence row maps to a phase-specific executable oracle.
      A final-state assertion never substitutes for a transient during-action
      caret, overlay, popup, selection, or paint assertion.
- [x] Every selected case has one or more phase-specific reporter-oracle rows
      for model, DOM/native, focus, popup, geometry/paint, runtime errors, and
      follow-up input.
- [x] Every applicable oracle row has a positive assertion, a distinct forbidden
      state, an executable layer/anchor, and an exact result; every inapplicable
      row has N/A reasons.
- [x] The smallest falsifying executable probe ran before scaling.
- [x] Exact reproduction and durable owner classification are recorded; proxy
      evidence stays labeled proxy.
- [x] The executable test is red before the fix, or the exact safe-red
      limitation and proof-host repair are explicit.
- [x] Regression delegated only one normalized case at a time to Patch.
- [x] Patch returned root cause, durable owner, changed files, exact red/green
      commands, final ref/dirty fingerprints, stability, architecture verdict,
      P1 review, and caveat.
- [x] Focused green proof passed. Final Browser verification runs when repo or
      claim policy requires it; E2E replay is required only for
      `e2e-required:` or already-existing affected-corpus E2E coverage.
- [x] Final proof ran through `capture-proof-receipt.mjs`; its ref, input digest,
      host, timestamps, retry count, and receipt ID validate.
- [x] Required retry-free stability runs passed with no retry.
- [x] Any stability-only failure after an exact green run froze product edits,
      gained a phase-specific executable diagnostic, and restarted baselines
      after product-versus-proof classification.
- [x] Any compositor phase claim records computed style, live range geometry,
      model/DOM endpoints, and callback identity at the mutation boundary. If
      those are final while pixels stay red, timing is rejected as the cause.
- [x] Every blocking pixel classifier passes a known-positive and known-negative
      control through the same capture path; a failed control invalidates prior
      results and freezes product edits until the proof helper is repaired.
- [x] Every completed applicable `geometry-paint` row names actual pixel capture
      and classification in its proof layer and records `positive-control: pass`
      plus `negative-control: pass`; computed style, DOM state, selection text,
      callback traces, and unclassified screenshots are diagnostics only.
- [x] Every shared owner was replayed against its affected exact corpus after
      the final owner edit.
- [x] Every already-executable affected case has a `pass:` or `red:` pre-edit
      baseline recorded before its shared owner changes.
- [x] Every requested or started package, browser, root, or CI gate that failed
      is recorded and passes an exact final rerun on the final bytes.
- [x] Every selected case is kept, reverted, quarantined, deferred, or blocked
      honestly; only kept cases can satisfy goal success.
- [x] No sidecar case registry, TSV, JSON manifest, or duplicate behavior
      database was created.
- [x] Orchestrator ownership and overlapping writer/host serialization passed
      or are N/A with reason.
- [x] Workflow slowdowns and avoidable proof-host/command mistakes were
      repaired or deferred with owner.
- [x] Every case records one methodology delta.
- [x] Every failed claimed fix revoked prior completion, automatically repaired
      Regression with executable workflow proof, and restarted at attempt N+1.
- [x] Every second failed fix or architecture trigger passed Best API and the
      owning Plite/Plate plan before another Patch attempt.
- [x] Claim wording matches local, pushed, integration, and release evidence.
- [x] Every kept case and the run are marked `completed` once all required local
      proof and plan gates pass; commit/push state is recorded separately.
- [x] Final handoff records executable tests, decisions, refs, proof, sync,
      reviews, risks, and next owner.
- [x] Output budget discipline was followed.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close every selected executable case and methodology row | Both cases are completed and kept; both methodology rows are resolved. |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | Receipts attest `dirty:168a4490e2ccf90dd9b1bd3230fb2f528460caa2` and current input hashes. |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | Source-first package runners passed; the refreshed local media demo passed final Browser replay. |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | Plite was RED 56/3 before the API and GREEN 61/0; Media is GREEN 12/0 with 67 assertions. |
| E2E escalation closure | yes | Prove each case uses `unit-red:` without a new E2E or records `e2e-required:` with the exact unit/package limitation | Both cases use package `unit-red:` evidence; the redundant media E2E case was deleted and no E2E command is a gate. |
| Cumulative reporter evidence closure | yes | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | All recording, screenshot, paragraph-split, unit-first, and API/name claims map below. |
| Reporter oracle closure | yes | Resolve positive and forbidden states for all seven observations and every applicable interaction phase per case | Every applicable row has passing executable evidence; inapplicable rows retain specific reasons. |
| Failed-fix interrupt closure | yes | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | Attempt 1 was invalidated; Regression source/mirrors enforce unit-first and 55 workflow tests pass. |
| Architecture pressure closure | yes | Prove every second failure or architecture trigger has Best API and layer-plan evidence | Best API and Plite Plan accepted one lifecycle-aware Plite owner and the bounded consumer migration. |
| Proof receipt closure | yes | Validate generated final receipts against unchanged issue-owned inputs | Three completed receipt rows below have current SHA-256 digests and zero retries. |
| Affected-corpus replay closure | yes | Replay all cases affected by the last shared-owner edit | Plite 61/61 and combined Media/Core/Toggle 30/30 passed after their latest input mtimes. |
| Started-gate failure closure | yes | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | Both path-discovery failures have exact passing final reruns. |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | The first exact Plite package probe failed only because `blocks.reset` was absent. |
| Patch delegation closure | yes | Read back one-case root-cause/red/green/proof evidence | Serial Patch evidence records owner, files, RED, GREEN, receipts, stability, and review. |
| Focused verification closure | yes | Run owning test and exact final-case replay | Plite, Media, Core, Toggle, and local Browser checks all pass. |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | Plite 61/61 twice and Media 12/12 twice, retry count zero. |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | Both cases are kept at local dirty scope. |
| Local completion status | yes | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | Completed locally at the receipt ref; no commit, push, integration, or release claim. |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | Only this transient goal plan was created. |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | `pnpm install` regenerated skills, resource parity is exact, and the local demo was refreshed. |
| Orchestrator writer closure | no | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | N/A: this run used one local writer and no subagent or overlapping host mutation. |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | Root-relative Bun commands replaced the two failed path forms. |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | Both rows are `repair-now` with executable proof. |
| Source/generated sync | yes | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | `pnpm install` passed; `sync-resources.mjs --check` reports exact parity. |
| Agent-native review | yes | Run for changed agent workflows or record N/A | Manual action-to-owner-to-proof review found no P1 gap; routes and feedback loops are recorded below. |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | Final handoff section is complete. |
| Autoreview | no | Run P1 autoreview for non-trivial implementation changes or record N/A | N/A: branch `next` forbids Autoreview; manual P1 code/API review passed with no accepted finding. |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-26-media-caption-block-reset-api.md --complete` | pass: `Regression plan: semantically complete.` |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-media-caption-block-reset-api.md` | pass: `[autogoal] complete`. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Existing exported interface/runtime/view owners expose one `{ at? }` method; no new file or barrel exists. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Plite public API and Media behavior are published deltas; Core/Toggle are internal adoption. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing major Plite and Media changesets carry the new API and caption behavior; no forbidden minor was added. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: no registry source is part of this packet. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Core/Toggle migration needs no extra artifact because it is internal adoption with no independent public delta from `main`. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Plite and Core/Media/Toggle typechecks passed; focused tests and `check:plite:dev` passed. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: only an existing exported interface changed; no exported file or barrel layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | requirements copied; active goal and package-api pack recorded | source/host readiness |
| Current source and proof-host readiness | completed | Plite and three Plate adoption owners; base ref and source-first runners recorded | discover executable cases |
| Executable case discovery and selection | completed | one owner API RED plus original media affected case | smallest probe |
| Cumulative reporter evidence inventory | completed | recording, screenshots, later corrections, API acceptance retained | reporter oracle expansion |
| Reporter oracle expansion | completed | all seven observation classes resolved for both cases | semantic validation |
| Pre-implementation semantic validation | completed | `validate-regression-plan.mjs` reports structurally valid | smallest probe |
| Smallest high-value probe | completed | owner-level Plite reset contract fails only on the absent runtime method | reproduce/classify |
| Reproduce, classify, and red test | completed | 56 pass, 3 fail with `transactionMethod is not a function`; owner is Plite transaction blocks API | patch delegation |
| One-case Patch delegation | completed | Plite owns reset; Core/Media/Toggle delegate the exact structural step | verification |
| Focused verification and stability | completed | receipts: Plite 61/61; consumers 30/30; two-run stability; Browser caption split and follow-up typing pass | packet decision |
| Keep/revert/quarantine | completed | both cases kept at local dirty scope; redundant E2E case deleted | methodology delta |
| Methodology repair/no-change/defer | completed | unit-first/E2E-fallback and canonical reset ownership are executable rules | closure |
| Reviews and final handoff | completed | manual P1 and agent-native review pass; no accepted P1 finding | goal-plan check |
| Final goal-plan check | completed | semantic validator and Autogoal checker pass on the completed plan | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| PLITE-BLOCKS-RESET-001 | Accepted Best API/name/audit prompts in this task | Root and nested non-default blocks with owned and lifecycle-managed props; call `tx.blocks.reset()` with implicit, explicit, and exact node-selection targets | Each block becomes its immediate grammar default; children, selection, keys, and allowed props survive; source-only props do not; missing default throws | accepted-product-law: user accepted the Best API target and Plite schema/type-change law | unit-red: packages/plite/test/transforms-contract.ts | Local source-first Bun package runner | `bun test --preload ./config/plite-source-test-setup.ts ./packages/plite/test/transforms-contract.ts` | completed | dirty:168a4490e2ccf90dd9b1bd3230fb2f528460caa2 | User for commit/push choice |
| MEDIA-CAPTION-ENTER-001 | CleanShot recording; two reporter screenshots; correction "split the caption to new paragraph" | Media caption `hello`, caret between `he` and `llo`; press Enter | Original media caption is `he`; following paragraph is `llo`; selection is in that paragraph; no second media node | reporter: recording and explicit correction | unit-red: packages/media/src/lib/BaseMediaPluginContracts.spec.ts from the initial repair; current checkout contains that candidate and must remain green through API adoption | Local source-first Bun package runner | `bun test packages/media/src/lib/BaseMediaPluginContracts.spec.ts` | completed | dirty:168a4490e2ccf90dd9b1bd3230fb2f528460caa2 | User for commit/push choice |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| MEDIA-CAPTION-ENTER-001 | base-acceptance | `/Users/zbeyens/Library/Application Support/CleanShot/media/media_yEMgMYbAYr/2026-08-26 at 01.02.47.mp4` | after-action | Enter in a caption must not insert another media node | required | model@after-action, runtime-errors@after-action | test: packages/media/src/lib/BaseMediaPluginContracts.spec.ts#splits each media caption into a following paragraph on Enter | pass: Media package contract is 12/12 and the local demo retains one image |
| MEDIA-CAPTION-ENTER-001 | latest-reporter-delta | attached screenshots plus "split the caption to new paragraph" | after-action | Split `hello` at the caret into media caption `he` and new paragraph `llo`, with the caret in the paragraph | required | model@after-action, focus@after-action, follow-up-input@follow-up | test: packages/media/src/lib/BaseMediaPluginContracts.spec.ts#splits each media caption into a following paragraph on Enter | pass: package assertions and Browser replay prove split text, selection, and follow-up typing |
| MEDIA-CAPTION-ENTER-001 | latest-reporter-delta | "e2e test only when we can't reproduce the RED unit test" | setup | Unit/package RED is mandatory first; a successful unit RED forbids a new E2E | required | runtime-errors@after-action | test: packages/media/src/lib/BaseMediaPluginContracts.spec.ts#splits each media caption into a following paragraph on Enter | pass: package unit proof owns the case and the redundant E2E file is deleted |
| PLITE-BLOCKS-RESET-001 | accepted-product-law | "$best-api ... would you promote a core api?", "blocks.reset is best name? and audit where else it could be used", "ok go" | after-action | Promote `blocks.reset` and migrate only proven semantic matches | required | model@after-action, focus@after-action, runtime-errors@after-action, follow-up-input@follow-up | test: packages/plite/test/transforms-contract.ts#blocks.reset uses the immediate schema default | pass: owner contract is 61/61 and covers nested/root defaults, exact selections, keys, lifecycle, errors, and follow-up input |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| MEDIA-CAPTION-ENTER-001 | model | after-action | yes | media caption `he`, next paragraph `llo`, stable media key, two total blocks | second media node, lost text, replaced left media, or wrong right type | package transaction test | test: packages/media/src/lib/BaseMediaPluginContracts.spec.ts#splits each media caption into a following paragraph on Enter | pass: 12/12 package contract and one-image Browser replay |
| MEDIA-CAPTION-ENTER-001 | dom-native | after-action | no | N/A: durable invariant is the editor model and command result | N/A: no DOM-specific reporter delta remains in this API-adoption packet | N/A: package model owns the exact case | N/A: no durable DOM test is required after unit RED | N/A: final Browser is verification-only if runnable |
| MEDIA-CAPTION-ENTER-001 | focus | after-action | yes | collapsed selection lands in the new paragraph at offset 0 | selection remains in media or becomes null | package selection test | test: packages/media/src/lib/BaseMediaPluginContracts.spec.ts#splits each media caption into a following paragraph on Enter | pass: selection is `[1,0]@0` in package proof and `[3,0]@0` in demo content |
| MEDIA-CAPTION-ENTER-001 | popup | after-action | no | N/A: no popup participates | N/A: no popup reporter claim | N/A: outside the interaction | N/A: no popup anchor applies | N/A: no popup behavior applies |
| MEDIA-CAPTION-ENTER-001 | geometry-paint | after-action | no | N/A: no geometry or paint claim is required | N/A: screenshots communicate model placement, not a pixel contract | N/A: outside the accepted invariant | N/A: no pixel oracle applies | N/A: no geometry-paint behavior applies |
| MEDIA-CAPTION-ENTER-001 | runtime-errors | after-action | yes | Enter completes without throwing | schema-default lookup, stale-key, or command error | package runner test | test: packages/media/src/lib/BaseMediaPluginContracts.spec.ts#splits each media caption into a following paragraph on Enter | pass: package and Browser runtime error collectors are clean |
| MEDIA-CAPTION-ENTER-001 | follow-up-input | follow-up | yes | the resulting selection is a writable paragraph text point | follow-up insertion would target media or detached content | package selection test plus final local Browser typing | test: packages/media/src/lib/BaseMediaPluginContracts.spec.ts#splits each media caption into a following paragraph on Enter | pass: Browser typing produces `X caption` in the new paragraph and advances selection to offset 1 |
| PLITE-BLOCKS-RESET-001 | model | after-action | yes | reset uses each block's immediate grammar default and preserves lifecycle-approved data | root-only default, whole-node replacement, arbitrary prop loss, or unreset selected member | package transaction test | test: packages/plite/test/transforms-contract.ts#blocks.reset uses the immediate schema default | pass: 61/61 covers nested, targeted-property, named-root, and disjoint-selection cases |
| PLITE-BLOCKS-RESET-001 | dom-native | after-action | no | N/A: public structural mutation has no DOM contract | N/A: no DOM claim | N/A: package API is renderer-independent | N/A: no DOM anchor applies | N/A: no DOM behavior applies |
| PLITE-BLOCKS-RESET-001 | focus | after-action | yes | logical selection remains valid in preserved children | selection loss or detached endpoint | package selection test | test: packages/plite/test/transforms-contract.ts#blocks.reset uses the immediate schema default | pass: selection stays at `[0,0,0]@1` after reset |
| PLITE-BLOCKS-RESET-001 | popup | after-action | no | N/A: no popup participates | N/A: no popup claim | N/A: outside the API contract | N/A: no popup anchor applies | N/A: no popup behavior applies |
| PLITE-BLOCKS-RESET-001 | geometry-paint | after-action | no | N/A: no geometry or paint contract | N/A: no paint claim | N/A: renderer-independent structural API | N/A: no geometry anchor applies | N/A: no geometry-paint behavior applies |
| PLITE-BLOCKS-RESET-001 | runtime-errors | after-action | yes | valid defaults reset; absent element defaults throw the documented deterministic error | silent no-op or unrelated runtime failure | package runner test | test: packages/plite/test/transforms-contract.ts#blocks.reset uses the immediate schema default | pass: valid rows pass and missing element default throws the expected error |
| PLITE-BLOCKS-RESET-001 | follow-up-input | follow-up | yes | preserved child and selection accept a subsequent text insertion | stale target/key or wrong insertion owner | package transaction test | test: packages/plite/test/transforms-contract.ts#blocks.reset uses the immediate schema default | pass: follow-up insert changes `one` to `oXne` after reset |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| PLITE-BLOCKS-RESET-001 | 1 | completed | "bun" "test" "--preload" "./config/plite-source-test-setup.ts" "./packages/plite/test/transforms-contract.ts" | pass: exit 0 in 343ms | dirty:168a4490e2ccf90dd9b1bd3230fb2f528460caa2 | sha256:2caddc6f2fd028fd02564604cf7b5a7246afd5de49fe6704c2f0c760de77f190 | 7 | config/plite-source-test-setup.ts,packages/plite/src/core/editor-schema.ts,packages/plite/src/core/public-state.ts,packages/plite/src/editor-runtime-view.ts,packages/plite/src/interfaces/editor.ts,packages/plite/src/transforms-node/set-nodes.ts,packages/plite/test/transforms-contract.ts | host:none - deterministic package-only API proof | 2026-08-26T09:53:34.772Z | 2026-08-26T09:54:44.447Z | 2026-08-26T09:54:44.790Z | 0 | sha256:4ba37535ed01399cfc14a4021d2302ff2b0d449732cdd5b1f4abf1babbf265aa |
| MEDIA-CAPTION-ENTER-001 | 2 | completed | "bun" "test" "packages/media/src/lib/BaseMediaPluginContracts.spec.ts" "packages/core/src/lib/plugins/override/OverridePlugin.spec.tsx" "packages/toggle/src/react/TogglePlugin.spec.tsx" | pass: exit 0 in 661ms | dirty:168a4490e2ccf90dd9b1bd3230fb2f528460caa2 | sha256:bfaa3c0e7df81ae33350d4b29a6e610dd0d81db049d8864b5493346a5e3c34f9 | 8 | packages/core/src/lib/plugins/override/OverridePlugin.spec.tsx,packages/core/src/lib/plugins/override/OverridePlugin.ts,packages/media/src/lib/BaseMediaPlugin.ts,packages/media/src/lib/BaseMediaPluginContracts.spec.ts,packages/plite/src/core/public-state.ts,packages/plite/src/interfaces/editor.ts,packages/toggle/src/react/TogglePlugin.spec.tsx,packages/toggle/src/react/TogglePlugin.tsx | host:none - deterministic affected-consumer package proof | 2026-08-26T09:41:36.960Z | 2026-08-26T09:57:05.270Z | 2026-08-26T09:57:05.931Z | 0 | sha256:add6c09d04f568c2e83dcc0348a90659b06b15dcd2ef8a7b05517dfe9091dcfc |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plite blocks transaction owner | PLITE-BLOCKS-RESET-001 | red: transforms contract 56 pass / 3 absent-method failures; existing toggle rows pass | 2026-08-26T09:53:34.772Z | `bun test --preload ./config/plite-source-test-setup.ts ./packages/plite/test/transforms-contract.ts` | sha256:2caddc6f2fd028fd02564604cf7b5a7246afd5de49fe6704c2f0c760de77f190 | pass: 61/61 after the final test/source inputs, including contextual defaults |
| Media/Core/Toggle adoption owners | PLITE-BLOCKS-RESET-001, MEDIA-CAPTION-ENTER-001 | pass: Media 12/12 and 67 assertions; Override 10/10 and 16 assertions; Toggle 8/8 and 13 assertions | 2026-08-26T09:41:36.960Z | `bun test packages/media/src/lib/BaseMediaPluginContracts.spec.ts packages/core/src/lib/plugins/override/OverridePlugin.spec.tsx packages/toggle/src/react/TogglePlugin.spec.tsx` | sha256:bfaa3c0e7df81ae33350d4b29a6e610dd0d81db049d8864b5493346a5e3c34f9 | pass: combined affected corpus 30/30 with 96 assertions |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Initial package-filter Media command | `pnpm --filter @platejs/media test -- BaseMediaPluginContracts.spec.ts` resolved the argument as a missing package-root file | command-path error, no product evidence | use root-relative direct Bun file command | pass: `bun test packages/media/src/lib/BaseMediaPluginContracts.spec.ts` is 12/12 |
| Initial Plite path filter | Bun required `./` to treat the nonstandard `transforms-contract.ts` name as an exact path | command-path error, no product evidence | use `./packages/plite/test/transforms-contract.ts` | pass: final exact command is 61/61 in the receipt |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| MEDIA-CAPTION-ENTER-001 | 1 | Reporter rejected suppressing Enter: expected a split paragraph | reporter-contradiction | yes: suppress-Enter completion and proof discarded | repair-now: `.agents/rules/regression.mdc` expected-outcome authority and unit-first/E2E-fallback rules repaired before this attempt | pass: current semantic validator enforces reporter authority and unit-red escalation | yes: duplicated-live-identity exposed a missing reusable default-reset owner | required: best-api accepted `tx.blocks.reset`; plite-plan accepted its owner and adoption boundary | reproduced: exact package test owns the corrected split invariant |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| MEDIA-CAPTION-ENTER-001 | 1 | duplicated-live-identity | escalate | required: best-api accepted `tx.blocks.reset({ at? })`, immediate parent/root defaults, lifecycle-aware type change, and no alias | plite-plan: accepted Plite ownership plus core/media/toggle adoption; Heading/Callout indirect; code-block/list/insertion excluded | accepted: source audit and explicit user approval are recorded in the first-checkpoint rows |
| PLITE-BLOCKS-RESET-001 | 0 | cross-layer-compensation | escalate | required: best-api deleted feature-local reset machinery in favor of one public Plite block mutation | plite-plan: accepted the transaction owner, minimal options, consumer boundary, and package proof | accepted: four direct owners fit; excluded reset-like calls have different semantics |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| `PLITE-BLOCKS-RESET-001` | `packages/plite` public transaction blocks API | exact source-first Bun transform contract | receipt hashes seven source/test/config inputs after the last edit | existing exported interface/runtime/view; no barrel generation | pass: receipt and 61/61 package proof are current |
| `MEDIA-CAPTION-ENTER-001` | `packages/media/src/lib/BaseMediaPlugin.ts` command policy | focused Media package test and refreshed local `/blocks/media-demo` | package receipt hashes current inputs; Browser loaded the final local route | no generated registry edit; Browser is final verification only | pass: 12/12 package proof and exact caption split/follow-up Browser replay |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| PLITE-BLOCKS-RESET-001 | red: transforms contract 56 pass / 3 fail because `transactionMethod` is undefined | Plite editor interface/runtime/view and transform contract; Core Override, Media, and Toggle consumer/test owners; docs/Vision/rule/changesets | exact RED; focused GREEN; affected consumer replay; typechecks; two retry-free focused runs; P1 review | root cause: no generic owner; current files, commands, receipt fingerprints, stability, API verdict, and local-only caveat recorded | pass: serial local Patch packet completed |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| `PLITE-BLOCKS-RESET-001` | focused Plite transform contract | two consecutive final runs | pass: 61/61 then 61/61 | 0 | keep |
| `MEDIA-CAPTION-ENTER-001` | focused media contract after last shared-owner edit | two consecutive final runs | pass: 12/12 with 67 assertions, then the same again | 0 | keep |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| PLITE-BLOCKS-RESET-001 | RED 56/3; GREEN 61/61; receipt `sha256:4ba37535ed01399cfc14a4021d2302ff2b0d449732cdd5b1f4abf1babbf265aa` | keep | local dirty public API and package behavior | uncommitted and unpushed; no integration/release claim | User for commit/push choice |
| MEDIA-CAPTION-ENTER-001 | Media 12/12 twice; combined consumers 30/30; Browser split/follow-up pass; receipt `sha256:add6c09d04f568c2e83dcc0348a90659b06b15dcd2ef8a7b05517dfe9091dcfc` | keep | local dirty caption behavior | uncommitted and unpushed; Browser proof is local only | User for commit/push choice |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| MEDIA-CAPTION-ENTER-001 | Earlier workflow reached for E2E despite an exact package-level model/selection oracle | repair-now | `.agents/rules/regression.mdc`, its methodology/validator/tests, and generated Regression/Patch mirrors require owner-level unit/package RED first and forbid new E2E after unit RED | pass: 55 workflow tests; source/mirror parity exact; redundant media E2E deleted | reporter correction closed by executable workflow enforcement |
| PLITE-BLOCKS-RESET-001 | Repeated feature-local default-reset implementations lacked a canonical structural owner | repair-now | Plite `blocks.reset` plus Best API source/mirror and Plite Vision teaching | pass: 61/61 transform contract, 30/30 consumer replay, exact resource parity, and zero stale old-signature examples | accepted architecture trigger closed by canonical owner and bounded migration |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Focused package command discovery | package runners | two sub-second path misses | wrapper/Bun interpreted bare filters relative to package/root and ignored the nonstandard Plite filename | none until corrected | pass: standardized exact root-relative Bun commands produced the final receipts |

Findings:
- The original media behavior can be reproduced at package level; permanent
  E2E coverage is unnecessary.
- Resetting to a schema default is a structural Plite mutation, not a media or
  Override command.
- `blocks.reset` is the shortest accurate name because the namespace already
  supplies the object and mutation context.

Timeline:
- 2026-08-26: reporter corrected the behavior to split the caption into a new
  paragraph and rejected unnecessary E2E coverage.
- 2026-08-26: Best API hard-cut audit accepted `blocks.reset`, the Plite owner,
  and the bounded consumer migration.
- 2026-08-26: owner RED, canonical implementation, bounded migration, package
  proof, Browser replay, methodology repair, and final receipts completed.

Decisions and tradeoffs:
- Keep only `{ at?: NodeSelectionTarget }`; type/mode/command options would mix
  schema law with caller policy.
- Resolve the immediate parent's element default for nested blocks and the root
  default for top-level blocks.
- Use canonical type-change lifecycle so schema rules decide which properties
  survive; never pre-unset arbitrary properties.
- Preserve media Enter guards and split policy; replace only its post-split
  manual default-node replacement.
- No compatibility alias for Override's generic reset update.

Review fixes:
- Added a parent-targeted default property assertion after review challenged
  context-free destination construction; canonicalization materializes the
  nested default and the focused suite remains 61/61.
- Removed the redundant media-caption E2E case and its rejected Playwright
  executable-path experiment because package RED owns the regression.
- Reworded public docs to describe accepted targets without naming the
  non-exported `NodeSelectionTarget` helper alias.
- Manual P1 review found no accepted defect. Autoreview is N/A because the
  current branch is `next`, where repo law forbids it.
- Agent-native review passed: caption Enter routes through Media policy to
  Plite reset and package/Browser feedback; public API work routes through Best
  API/Plite Plan to docs, changesets, typecheck, and tests; Regression unit-first
  policy routes through source rules to generated mirrors and 55 workflow tests.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Package-filter/Bun path discovery | 2 | Use exact root-relative file paths | pass: exact final commands are receipted |
| Rejected E2E expansion from attempt 1 | 1 | Delete redundant case and keep package test as sole durable layer | pass: file absent and Regression validator rejects unit-RED/E2E overlap |

Verification evidence:
- Pre-edit Media: 12/12 pass, 67 assertions.
- Pre-edit Core Override: 10/10 pass, 16 assertions.
- Pre-edit Toggle: 8/8 pass, 13 assertions.
- Owner RED: Plite transforms contract 56 pass, 3 fail; all failures are the
  absent `blocks.reset` runtime method.
- Owner GREEN and stability: Plite 61/61 twice; Media 12/12 with 67 assertions
  twice; Core 10/10; Toggle 8/8; combined consumer receipt 30/30 with 96
  assertions; all retries zero.
- Parent-targeted destination default `sectionTone: "nested"`, named-root
  default, exact disjoint node selections, property lifecycle, NodeKey,
  selection, missing-default error, and follow-up input are executable rows.
- Typechecks: source-first Plite passed; Core/Media/Toggle filtered graph passed
  15 tasks. `pnpm check:plite:dev` passed after 53 package typechecks, 36
  package suites, 170 runner contracts, and Chromium smoke 3/3.
- Browser: fresh local `/blocks/media-demo` split `Image caption` at offset 5
  into caption `Image` and paragraph ` caption`, kept one image, selected
  `[3,0]@0`, then typed `X` to produce `X caption` at offset 1 with no errors.
- Workflow: Regression/Patch source and generated tests pass 55/55; resource
  parity is exact after `pnpm install`; no stale old `blocks.reset` signature
  remains. The code-block `resetBlock` API is an audited distinct unwrap job.
- Formatting/lint for the seven changed TypeScript owners passed; targeted
  final `git diff --check` passed.

Final handoff:
- executable cases: `PLITE-BLOCKS-RESET-001` and
  `MEDIA-CAPTION-ENTER-001` completed and kept.
- cumulative reporter evidence, phase-specific oracles, and forbidden states:
  every required row passes; DOM/popup/paint rows are specifically N/A.
- failed-fix invalidation and automatic repair: attempt 1 is invalidated;
  Regression unit-first/E2E-fallback enforcement passes 55 workflow tests.
- proof receipts and affected-corpus replay: Plite receipt
  `sha256:4ba37535ed01399cfc14a4021d2302ff2b0d449732cdd5b1f4abf1babbf265aa`;
  Media receipt
  `sha256:add6c09d04f568c2e83dcc0348a90659b06b15dcd2ef8a7b05517dfe9091dcfc`.
- started-gate failure closure: both command-path errors have exact final pass.
- changed owners: Plite blocks interface/runtime/view/tests; Media command/test;
  Core Override; Toggle Enter; docs/Vision/Best API; Regression workflow;
  Plite/Media changesets; redundant media E2E deletion; this plan.
- design decisions: `blocks.reset` is canonical; `{ at? }` only; immediate
  parent/root default; lifecycle type change; feature guards stay local; no
  alias. Heading/paragraph/input-rule generic toggles remain indirect callers;
  code-block, list, insertion, HTML, Yjs, decode, and void-default jobs remain
  distinct.
- tests and proof: focused RED/GREEN, stability, typechecks, broad Plite dev
  check, combined consumer receipt, workflow tests, and final Browser replay.
- source/generated sync: `pnpm install` and exact resource parity passed.
- P1 and agent-native findings: no accepted P1 finding; manual review used
  because `next` forbids Autoreview; all three action/feedback routes pass.
- residual risks and next owner: none inside local scope; user owns any
  commit/push choice.
- local completion status and integration/public-status boundary: completed at
  `dirty:168a4490e2ccf90dd9b1bd3230fb2f528460caa2`; uncommitted, unpushed, not
  integrated, shipped, or released.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | local implementation and proof are complete |
| Where am I going? | final response; user decides whether to commit or push |
| What is the goal? | make `blocks.reset` canonical and preserve the exact caption-split behavior |
| What have I learned? | package tests own the exact invariant; four direct owners fit; code-block/list/insertion do not |
| What have I done? | implemented the API/migrations, deleted redundant E2E coverage, repaired Regression, and closed receipts/review/browser proof |

Open risks:
- None inside the proved local behavior/API scope. Exact disjoint selection,
  named roots, nested targeted defaults, missing defaults, toggle cleanup, and
  follow-up input are covered. Delivery remains uncommitted and unpushed.
