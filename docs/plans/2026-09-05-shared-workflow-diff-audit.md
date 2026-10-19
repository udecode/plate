# Shared workflow diff audit

Audit the current Plate and Dotai workflow diff for reusable changes and Ellie
adoption. Exclude Plate/Plite product APIs, editor-specific proof and release
mechanics. This is a read-only review; source repairs and downstream installs
are recommendations.

- [x] Read the applicable workflow maintenance and audit methods.
- [x] Capture the full shared source diff and added-file inventory.
- [x] Review changed methods, supporting prompts, templates and helpers; compare retained behavior with the original source.
- [x] Trace current Ellie and global consumers, source/install parity and stale references.
- [x] Exercise relevant changed helpers and validators where the result can substantiate a finding.
- [x] Produce prioritized findings, transfer decisions, exclusions and concrete verification limits.

The shared inventory includes 269 paths across 49 skill owners, including
provenance and deleted files. Unchanged material from the earlier full pstack
audit can reuse that read coverage only after content identity is verified.
Changed methods and their active loading paths need fresh review.

Evidence: [shared inventory](./artifacts/2026-09-05-shared-workflow-diff-audit/shared-inventory.json),
[tracked diff](./artifacts/2026-09-05-shared-workflow-diff-audit/shared-tracked.diff),
[implementation baseline comparison](./artifacts/2026-09-05-shared-workflow-diff-audit/implementation-baseline-comparison.json).

No product or scope decision is pending for this audit.

## Verdict

Finish the shared executable instructions before transferring this cleanup to
Ellie. The owner consolidation is sound. Several leaf recipes still contradict
their updated entrypoints, so copying the current port also copies those
contradictions. Preserve the complete engineering method and examples, but put
the applicable conditions directly on the steps agents execute. Another broad
override paragraph would leave the same problem in place.

The audit found five substantive source defects and one small CLI documentation
defect. It also confirmed two separate installation backlogs. These are source
and instruction-chain findings; no autonomous model experiment demonstrated an
unauthorized action or a measured productivity regression.

## Findings

1. **P2 — Conditional routing is undone by mandatory playbook steps.**
   [Poteto's entrypoint](/Users/zbeyens/git/dotai/skills/poteto-mode/SKILL.md:16)
   makes How conditional on unclear ownership and Architect conditional on a
   consequential design question. [Feature](/Users/zbeyens/git/dotai/skills/poteto-mode/playbooks/feature.md:7)
   still starts with How and Architect, followed by four mandatory decomposition
   rows. [Bug fix](/Users/zbeyens/git/dotai/skills/poteto-mode/playbooks/bug-fix.md:11),
   Perf and Refactoring still trigger Architect at a function boundary.
   Feature also requires rebasing into ordered commits at line 16.
   [Opening a PR](/Users/zbeyens/git/dotai/skills/poteto-mode/playbooks/opening-a-pr.md:7)
   retains fresh-worktree/reset instructions and makes No Comments a review
   prerequisite, while the root makes it conditional. The runtime/playbook
   adapters constrain authority, which prevents treating these examples as
   permission, but agents still have to reconcile opposing active recipes.
   **Repair:** update each active trigger, delegation, history and review step;
   retain its useful diagnosis/design/proof procedure and record the adaptation.

2. **P2 — Interrogate retains a fallback that the runtime adapter forbids.**
   [Interrogate line 51](/Users/zbeyens/git/dotai/skills/interrogate/SKILL.md:51)
   says to pick the closest model after a rejected slug and open a separate PR
   to repair the default. The
   [runtime adapter](/Users/zbeyens/git/dotai/skills/poteto-mode/references/codex-runtime.md:32)
   forbids silent model substitution and requires actual publication authority.
   **Repair:** report the unavailable configured role, preserve the requested
   comparison honestly, and prepare a source correction within existing
   authority. A failed model lookup is not a PR request.

3. **P2 — Reflect's nested prompt restores removed approval and posting rules.**
   [Reflect's apply step](/Users/zbeyens/git/dotai/skills/reflect/SKILL.md:58)
   reuses existing authority and keeps backlog findings local without message
   authorization. Its synthesizer is loaded verbatim, yet
   [line 46](/Users/zbeyens/git/dotai/skills/reflect/references/synthesizer.md:46)
   requires row-by-row approval and
   [line 56](/Users/zbeyens/git/dotai/skills/reflect/references/synthesizer.md:56)
   directs the parent to file every backlog item. The final response template
   also assumes backlog items were filed. **Repair:** align the synthesizer and
   response template with the parent, including local backlog outcomes and
   authorization already supplied. Do not add another approval stage.

4. **P2 — A shared performance pack still contains Ellie-specific policy.**
   The [Dotai pack](/Users/zbeyens/git/dotai/skills/autogoal/assets/templates/packs/performance-observability.md:5)
   requires Sentry telemetry, Auto closeout and particular ingestion/notification
   canary rules. Those are project obligations, not universal performance-plan
   requirements. The shared Autogoal method itself assigns project commands and
   policy to project templates. **Repair:** keep measurement, comparable inputs,
   correctness and the owning budget in Dotai; keep the Sentry/canary contract in
   Ellie's performance pack and retarget its Auto references during the Task
   consolidation. Removing it from the shared pack must not delete Ellie's
   privacy or telemetry guarantees.

5. **P2 — The preservation checker does not validate adaptation diffs.**
   [The checker](/Users/zbeyens/git/dotai/scripts/check-pstack-preservation.py:37)
   checks only that an adapted file has nonempty reasons and a nonempty diff.
   A temporary fixture with matching file hashes and `THIS IS NOT A DIFF` returned
   exit code 0 with no errors. [Reproduction result](./artifacts/2026-09-05-shared-workflow-diff-audit/preservation-invalid-diff-repro.json).
   **Repair:** replay the recorded diff against the pinned upstream source and
   compare the reconstructed destination; reject malformed/mismatched hunks.
   This is an enforcement gap, not evidence of current content loss: a separate
   audit replay reconstructed all 99 current declared files exactly.

6. **P3 — Plan creation help promises the removed initialization side effect.**
   [CLI help](/Users/zbeyens/git/dotai/skills/autogoal/scripts/create-goal-scratchpad.mjs:623)
   still says missing generic templates are initialized before plan creation.
   The implementation deliberately removed that call, and the composition test
   confirms unrelated templates are not seeded. **Repair:** state that creation
   resolves the project template or shared fallback and initialization is an
   explicit separate command. The file-creation behavior is correct.

## Installation and transfer decisions

Both project agents were checked by whole-directory file inventory and hashes.
Generated project copies were not treated as separate source owners.

| Destination | Current result | Decision |
| --- | --- | --- |
| Plate `.agents/skills` and `.claude/skills` | All 47 present shared skills match Dotai exactly. Maintain Workflow is globally available. | No installed-copy repair. Fix the shared source findings first, then refresh only affected methods. |
| Ellie `.agents/skills` and `.claude/skills` | 37 shared trees match. Seven shared installs differ: Architect, Arena, Interrogate, Setup Pstack, Swarm, Why and Video Transcripts. | Refresh these named methods after source repair. Both agent destinations need the same update. |
| Ellie TDD | Also differs, but its canonical owner is Ellie's local rule. | Preserve the local fork and its test policy; do not overwrite it with Dotai. |
| Global `.agents/skills` and `.claude/skills` | Seven stale trees: Agent Native Reviewer, Autogoal, Orchestrator, Resolve PR Feedback, TDD, Video Transcripts and Walkthrough. Maintain Workflow and Technical Writing match. | Prepare a separate named global refresh. This is additional adoption work, not a claim that the earlier Plate-only install failed. |
| Ellie Orchestrator / Resolve PR Feedback | Neither has a project-local install; global discovery supplies them. | Prioritize the global refresh. The stale global Orchestrator still mandates worktrees and PRs to `main`; stale global Autogoal has the broad goal trigger. |

Exact per-file differences and absent destinations are in
[consumer parity](./artifacts/2026-09-05-shared-workflow-diff-audit/consumer-parity.json).
Absence is not itself a defect when global discovery or a local owner is
intentional. This audit performed no installations.

## What Ellie should adopt

| Change | Ellie owner and retained behavior |
| --- | --- |
| Fold Auto into Task autonomous mode | Move callable routing and supervision under `.agents/rules/task.mdc`. Preserve the typed runtime, packet state, retries, recovery, security proof and receipt lineage. The small Auto entrypoint is not the whole feature. |
| Separate scope from delivery authority in the compiler | `.agents/rules/auto/factory-contract.ts:2625` treats `issue`, `full` and full delivery mode as PR requirements; `validateWorkspacePolicy` then forces a sibling checkout and review packet. Carry explicit authority into those decisions. Keep real delivery gates for authorized delivery. |
| Put verification payload ownership under Verify Ellie | `DemoLoopReviewReceiptSchema` remains in `auto/factory-contract.ts:1077`, and `scripts/verify-result.ts:6` imports the factory receipt schema. Verify Ellie should own the verification payload; Task should own orchestration/envelope consumption. Preserve stored `demo_loop_review` records and candidate/artifact binding. |
| Keep one file plan and one review budget | Ordinary work uses Task. Autogoal remains explicit native-goal work. Apply only relevant template sections; carry one budget across internal owners. Retain Ellie's two-round, persisted 15-minute review contract rather than copying Plate's review policy. |
| Use generic methods for concrete questions | How for uncertain source flow, Why for rationale, Architect/Arena for consequential competing targets, Interrogate for a contested decision. Show Me Your Work links the existing typed receipts instead of duplicating them. Finish the source contradictions above first. |
| Maintain the existing verification inventory | Route Create/Maintain Verification Skill explicitly to Verify Ellie and its existing Atlas/inventory owners. Preserve complete scenario coverage, real route/state driving, cleanup and surviving evidence. A source scan or process doctor is not authentication or product-pass proof. |
| Mine objective review patterns within the current diff | The reusable method in `task/references/review-patterns.md` distinguishes clear repeats from taste-heavy proposals. This fits Ellie's Task/feedback owner without another skill or review panel. |
| Keep one prose owner | Technical Writing already supplies structure, house style and preservation. Keep the Unslop removal; preserve code, links, facts and uncertainty. Walkthrough presents the existing final evidence. |
| Offer Improve only as an explicit preset | Its transferable value is ranked whole-scope work, resumable obligations and honest iteration accounting under Task. Keep Ellie-specific lanes and production/data rules; do not import Plate's beta API policy. Creating the preset must not start a run or schedule one. |

These remain distinct jobs: To Milestone, To PRD and To Issues produce different
planning artifacts; Design, Atlas and Verify Ellie own different product and
proof concerns; Recall reconstructs context, Teach explains it, and Reflect
improves a demonstrated workflow. No further deletion is justified by skill
count alone. Ellie has no matching local Performance or Testing Review entry
to remove just because Plate consolidated those names.

## Coverage and proof

The Dotai denominator is 269 changed/added/deleted paths across 49 named skill
owners, including provenance and deleted Unslop files. Of those, 149 are method,
reference, template or helper paths. The Plate source inventory records 174
changed/added/deleted rule/template paths, with 36 containing the generic
workflow portions considered here. Product-specific portions remain excluded.

Coverage used earlier complete source readings where content identity held,
plus fresh inspection of changed instructions, their active references and
helper behavior. The implementation baseline comparison found 217 unchanged
files and 39 changed files, including provenance. There are 45 explicitly
recorded full current reads in this audit; this is not a claim that every
unchanged upstream file was reread. Every source in the captured Dotai inventory
still matched its captured hash at final revalidation.

| Owner family | Disposition |
| --- | --- |
| Poteto Mode, its 23 playbooks and two agent prompts | Keep full methods; repair active-step contradictions and preserve the native control boundary. |
| Architect, Arena, How, Why, Blast Radius, Figure It Out, Interrogate | Keep distinct source/design/evidence jobs; make invocation conditional and retain honest independence claims. |
| All 21 principle leaves | Keep the full principles. The corrected nonnegative-duration example preserves actual type/runtime laws. No name-count deletion. |
| Setup Pstack and Swarm | Keep actual model discovery, parent inheritance, bounded concurrency and explicit checkout/task authority. |
| Recall, Reflect, Teach, Show Me Your Work | Keep distinct context, retrospective, explanation and decision-trail jobs; repair Reflect's nested prompt. |
| Technical Writing and deleted Unslop | Keep the single writing owner and transferred preservation/scanner behavior. |
| TypeScript Best Practices, TDD and No Comments | Keep public-behavior/type reasoning and protected non-obvious explanations. Project test and negative-type-proof rules remain local. |
| Autogoal and template helpers | Keep explicit native goals and ordinary file-plan helpers. Compact composition works; fix shared policy leakage and stale help. |
| Create/Maintain Verification Skill and Agent Native Reviewer | Keep the existing canonical source/inventory/control route and distinguish source, runtime and deployed proof. |
| Maintain Workflow | Keep one reusable source and named downstream installation. Current global copies match. |
| Orchestrator, Resolve PR Feedback, Video Transcripts, Walkthrough | Keep their independent operational/artifact jobs; complete relevant global adoption and preserve authority at external actions. |
| Generic Plate Task, autonomous, closure, complex, Improve and template portions | Transfer the single lifecycle and useful methods through Ellie owners. Do not replace Ellie's executable factory/security contracts with generic Markdown checklists. |

Executed checks:

- Dotai skill validation passed.
- Pstack preservation passed: 40 ports, 99 declared upstream files, zero errors.
- Independent adaptation replay matched all 99 current destinations.
- Autogoal composition and Technical Writing scanner tests passed: 11/11.
- Negative preservation fixture confirmed the false-green defect above.
- Whole-tree source/install comparisons covered both project and global agent
  destinations. No generated shared Plate copy differed from its source.

Receipts: [verification](./artifacts/2026-09-05-shared-workflow-diff-audit/verification.json),
[adaptation replay](./artifacts/2026-09-05-shared-workflow-diff-audit/adaptation-replay.json),
[fresh reads](./artifacts/2026-09-05-shared-workflow-diff-audit/fresh-reads.json),
[Plate source inventory](./artifacts/2026-09-05-shared-workflow-diff-audit/plate-source-inventory.json),
[final source revalidation](./artifacts/2026-09-05-shared-workflow-diff-audit/final-source-revalidation.json).

No product/browser test, full Plate check, deployment, publication, independent
model panel or live Ellie factory migration was performed. Those are not proof
claims of this read-only workflow audit. Plate/Plite package APIs, editor
behavior, benchmarks, release lanes, generated product templates, MDX-specific
mechanics and editor proof implementations are excluded.

Next authorized action is the user's choice of implementation scope. The
concrete recommendation is shared source repair, then named global/Ellie
refreshes, then the Ellie Task/factory ownership migration with its own typed
regression proof. No workflow source was changed by this audit.
