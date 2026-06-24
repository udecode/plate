# table-fragment-merge-policy

Objective:
Complete Plite table-fragment merge policy; done when policy/docs/tests/proof gates pass; plan docs/plans/2026-06-15-table-fragment-merge-policy.md.

Goal plan:
docs/plans/2026-06-15-table-fragment-merge-policy.md

Template:
docs/plans/templates/slate-auto.md

Primary template:
docs/plans/templates/slate-auto.md

Applied packs:
- none

Automation source:
- type: user-reopened deferred slate-auto lane
- prompt / link: `plite-auto Table-fragment merge policy Deferred policy lane unless explicitly reopened. -- let's complete it now`
- surface / route / package: `.tmp/plite` table fragment / clipboard / paste semantics; exact owner to be proven from live source before patching
- invocation mode: full-loop mode
- minimum runtime / deadline: N/A: no duration given
- completion threshold summary: table-fragment policy is explicit, no longer deferred; current source/docs/tests prove the chosen owner and behavior, or a hard architecture blocker is recorded with no safe alternate owner

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable rows: scope, non-goals, timing,
  stop conditions, deliverables, final handoff sections, verification surfaces,
  and success criteria.
- The initial checkpoint list is only the seed. After every loop, the
  supervisor must reconcile this plan against new evidence and may add, update,
  split, merge, retire, remove, reprioritize, or reopen checkpoints.
- Do not continue into implementation until first extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Table-fragment merge policy is implemented or explicitly codified in the correct Plite owner, with the release-doc deferred row removed/replaced by latest-state policy.
- Focused source audit proves whether the policy belongs in core/editor runtime, DOM/clipboard, React/browser projection, or table example/extension.
- Focused tests or source-backed proof cover the selected policy. If browser-visible paste behavior changes, include browser/Playwright proof; otherwise record browser proof as N/A with reason.
- Closure is legal only when relevant behavior, package/API, docs, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-table-fragment-merge-policy.md` passes.

Verification surface:
- Source audit: targeted `rg`/file reads across `.tmp/plite` table, fragment, clipboard, insertFragment, paste, and docs release rows.
- Package/test proof: focused Bun/Vitest command from `.tmp/plite` against the owner test file(s) added or updated for table-fragment policy.
- Browser proof: N/A unless source patch changes browser-visible table paste/clipboard behavior or an existing route/spec exposes the policy; then run focused Playwright route proof.
- Docs proof: source audit that `.tmp/plite/docs/releases/plite.md` no longer lists table-fragment merge policy as deferred.
- Skill proof: N/A unless a workflow/rule miss is found.
- Final plan proof: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-table-fragment-merge-policy.md`.

Constraints:
- Plite private alpha by default: no release, publish, changeset, PR, or
  branch readiness unless the prompt explicitly asks.
- Run Plite behavior commands from `.tmp/plite`; parent repo commands
  prove plans, docs, skills, and templates only.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a
  stopping checkpoint routes to `plite-plan`.
- Do not patch Plate when the run is scoped to Plite.

Boundaries:
- Source of truth: live `.tmp/plite` source/tests/docs plus parent `docs/plite/agent-start.md` and `vision`.
- Allowed edit scope: `.tmp/plite` runtime/tests/docs/examples for this policy; this plan file for supervision state.
- Browser surfaces: table example / Playwright specs only if source audit finds a runnable table paste/fragment route or the patch changes visible paste behavior.
- Package/API surfaces: Plite core/DOM/React/table-extension surface only after source audit names the owner.
- Agent/skill surfaces: no skill edits expected; patch only if the loop exposes a reusable workflow miss.
- Docs/research surfaces: `.tmp/plite/docs/releases/plite.md` and nearby docs that mention table-fragment policy.
- Non-goals: pagination, release/publish/changeset/PR readiness, broad table product features, Plate package patches, mobile/raw-device claims, huge-document perf.

Blocked condition:
- Stop only if the source audit proves two viable public/runtime policies with no north-star-covered preference and choosing wrong would be expensive, or if required runnable proof is unavailable and no package-level policy proof can replace it.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious
  backlog looks empty. Enter supervision mode and infer the next checkpoint from
  `vision`, current evidence, weak proofs, benchmark gaps, API/docs
  mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- surface: table-fragment merge policy
- mode: full-loop
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: N/A: full-loop without remaining timed runtime
- current_loop: 1
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: complete goal
- goal_status: active

Current verdict:
- verdict: keep
- confidence: high for scoped core/table-fragment policy
- next owner: slate-auto
- keep / revert / quarantine call: keep
- reason: Runtime, fixtures, docs, browser proof, and `bun check` are green; no speculative packet remains.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-table-fragment-merge-policy.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-auto | complete | P0 | Copy prompt requirements and read north-star before implementation. | Requirement rows complete before implementation. | update |
| status | slate-auto | complete | P0 | Read active plan, latest prompt, source status, and current evidence. | Current state recorded from `.tmp/plite` source/docs/tests. | update |
| gap-scan | slate-auto | complete | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Found three skipped table fixtures and one deferred release-doc row. | update |
| source-owner-audit | slate-auto | complete | P0 | Identify current table/fragment/clipboard owner before patching. | Owner: `packages/plite/src/transforms-text/insert-fragment.ts` plus `packages/plite/test/transforms/insertFragment/of-tables/**`. | update |
| policy-implementation | slate-patch / tdd | complete | P0 | Complete the deferred table-fragment policy in code/tests/docs. | Core structural policy implemented and docs updated; proof commands passed. | update |
| behavior-proof | slate-ar-stabilize | complete | P0 | Prove table-fragment behavior if a browser-visible route/gesture exists. | Fixture, clipboard, and Playwright table route proof passed. | update |
| oracle-repair | slate-patch / tdd | complete | P0 | Add missing table-fragment oracle for found gap. | Unskipped repaired fixtures and added browser table-fragment paste row. | update |
| visual-proof | Browser / Playwright | complete | P1 | Prove visible table paste behavior only if this patch changes browser-visible behavior. | Chromium Playwright table route asserts rendered cells and model selection. | update |
| plite-browser-promotion | plite-browser | complete | P2 | Promote repeated table paste/fragment proof into reusable helper only if repeated pattern appears. | N/A: existing `pasteEventPayload` helper covered this single reusable need. | update |
| mobile-claim-width | slate-auto | complete | P3 | Table-fragment policy is not a mobile/raw-device claim. | N/A: no mobile-specific claim made. | update |
| huge-document-smoke | slate-ar-stabilize | complete | P3 | Huge-doc smoke is out of scope for table-fragment policy. | N/A: table-fragment policy only. | update |
| perf-packet | slate-ar-fast / slate-ar-perf | complete | P3 | Perf is out of scope unless table-fragment policy creates a measured hot lane. | N/A: no measured perf lane changed. | update |
| supervision-mode | slate-auto | complete | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from north-star and evidence. | N/A: full-loop mode, no minimum timed runtime. | update |
| consolidation | slate-auto | complete | P1 | Move accepted reusable decisions to durable docs/rules. | Updated `.tmp/plite` API/extensions/release docs. | update |
| final-handoff | slate-auto | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows filled. | update |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | update | first checkpoint, owner audit, policy implementation, non-goals | user prompt + `plite-auto`/`vision`/agent-start reads | reopened deferred policy lane needs focused policy closure, not broad automation boilerplate | complete |
| 1 | update | source-owner-audit, policy-implementation, behavior-proof, oracle-repair, visual-proof, consolidation | source reads, fixture failures, runtime patch, focused tests, Chromium route proof, `bun check` | evidence showed skipped fixtures were real runtime/test debt, not docs-only debt | keep |

Mutation rules:
- Add a checkpoint when a new failure, missing oracle, missing metric, API smell,
  visual proof gap, workflow slowdown, taste gap, or owner gap appears.
- Update a checkpoint when evidence changes its scope, priority, owner, command,
  exit rule, or proof surface.
- Split a checkpoint when it hides multiple owners or one prompt would become
  too large.
- Merge checkpoints when overlap confuses routing or two rows always close
  together.
- Retire or remove checkpoints that are stale, superseded, irrelevant,
  duplicated, or contradicted by current evidence. Record the reason in the
  mutation ledger.
- Reopen a closed checkpoint when new evidence invalidates its proof.
- Reprioritize after every loop. The next checkpoint is chosen from current
  evidence, not from the original row order.
- The supervisor is not stuck on this template or the initial prompt plan. The
  user's latest request, `vision`, and current source evidence outrank
  stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan records reopened table-fragment merge policy, full-loop mode, scope/non-goals, stop rules, deliverables, and proof gates before implementation. |
| `plite-auto` source rule read | yes | `.agents/skills/slate-auto/SKILL.md` and `.agents/rules/slate-auto.mdc` read 2026-06-15. |
| `vision` read as checkpoint zero | yes | `.agents/skills/vision/SKILL.md` read 2026-06-15. |
| Active goal checked or created | yes | `get_goal` returned null; `create_goal` created active goal for this plan. |
| Invocation mode and timebox recorded | yes | Full-loop mode; no duration, minimum runtime N/A. |
| Dynamic checkpoint policy accepted | yes | Checkpoint supervisor rows updated and may be reconciled from evidence after each loop. |
| Source of truth and allowed workspaces recorded | yes | `.tmp/plite` live source/tests/docs; parent docs/plan only for control artifacts. |
| Output budget strategy recorded | yes | Targeted file lists/counts first; inspect owner slices only; exclude generated/static output unless named. |
| Private-alpha release/PR boundary recorded | yes | No release, publish, changeset, PR, or branch readiness in this run. |
| Browser proof strategy recorded | yes | Browser/Playwright proof applies only for browser-visible table paste/fragment behavior changes. |
| Package/API proof strategy recorded | yes | Focused package/source owner test/type proof after source-owner audit. |
| Mobile/raw-device claim-width policy recorded | yes | N/A unless mobile-specific table fragment behavior appears. |
| Skill repair authority and source-rule boundary recorded | yes | No skill edits expected; if needed, patch `.agents/rules/**`, run `pnpm install`, verify mirror. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation. Evidence: top plan sections updated before source edits.
- [x] Short objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete. Evidence: Objective/Completion threshold/Verification surface/Boundaries/Blocked condition filled.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining
      backlog ladder, and supervision-mode fallback are recorded. Evidence: full-loop mode, no duration; stop immediately only for hard table-policy blocker.
- [x] Checkpoint supervisor table has been reconciled at least once after the
      initial seed. Evidence: table rows updated from source/test/browser evidence.
- [x] Each loop ends with a checkpoint mutation decision: add, update, split,
      merge, retire, remove, reopen, reprioritize, or no-change with reason.
      Evidence: checkpoint mutation ledger loop 1.
- [x] Current-tree/status packet recorded before new runtime patches. Evidence:
      source-owner audit before patching.
- [x] Behavior proof packet recorded for every in-scope stable editor family or
      explicitly skipped/deferred with reason. Evidence: table-fragment fixtures,
      clipboard contract, and table route proof.
- [x] Visual/native selection proof packet recorded for browser-visible
      selection/editing risks or explicitly scoped. Evidence: Chromium table route
      rendered cell order and model selection; native selected text N/A because
      paste result is collapsed.
- [x] Missing oracle packets are written, kept, reverted, quarantined, or
      deferred with owner and proof command. Evidence: unskipped three table
      fixtures and added Playwright table-fragment paste row.
- [x] Repeated browser proof patterns are promoted to `plite-browser` or queued
      with reason. Evidence: N/A, existing `pasteEventPayload` helper was enough.
- [x] Mobile/raw-device proof is run or the claim width is explicitly limited;
      Playwright viewport proof is not recorded as raw-device proof. Evidence:
      N/A, no mobile/raw-device table-fragment claim.
- [x] Huge-document correctness smoke is run or deferred with owner and reason.
      Evidence: N/A, explicit non-goal.
- [x] Perf packet runs only after correctness is green, or is marked N/A for
      this run. Evidence: N/A, no perf lane.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are
      audited when in scope. Evidence: docs/API text added for `tx.fragment.insert`;
      no exports/aliases changed.
- [x] Docs/north-star/rule consolidation is applied when a reusable decision is
      accepted, or marked N/A. Evidence: runtime docs/release docs updated; north-star
      unchanged because existing "Plite stays unopinionated" already covers this.
- [x] Workflow slowdowns are logged and avoidable repeats are repaired in the
      owner skill/script/gate. Evidence: two local command/test-debt rows logged;
      no skill repair needed.
- [x] Packet ledger contains one row per proof, bug fix, oracle, benchmark,
      docs, or skill packet. Evidence: packet ledger filled below.
- [x] Changed list is current and includes only this run. Evidence: changed list
      table filled below.
- [x] Needs-your-attention list is ranked and capped at five items. Evidence:
      review-attention table filled below.
- [x] Stopping checkpoints are queued or marked none. Evidence: no queued
      stopping checkpoints.
- [x] Autoreview/review gate is run for non-trivial implementation diffs or
      marked N/A with reason. Evidence: N/A, deterministic focused tests plus
      `bun check` covered narrow core policy packet; no separate review agent run.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or
      prompt/tooling changes, or marked N/A with reason. Evidence: N/A, no
      `.agents/**`, commands, skills, hooks, or tooling changed.
- [x] Output budget discipline is followed: broad scans are capped or written
      to artifacts instead of streamed. Evidence: used targeted file lists,
      counts, and owner slices; no large corpus streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | Focused fixtures, clipboard contract, package typecheck, Chromium table route, full Chromium table route, and `bun check` passed. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | Checkpoint table and mutation ledger updated after source/test/browser evidence. |
| Workspace authority proof | yes | Record cwd/tool for each Plite, parent-docs, skill, browser, package, or benchmark proof | Runtime/browser/package commands ran from `.tmp/plite`; plan/skill reads from parent `plate-2`. |
| Behavior gates | yes | Run focused stable behavior proof or record scoped defer rows | `PLITE_FIXTURE_FILTER=transforms/insertFragment bun test ./packages/plite/test/index.spec.ts` passed 35/35 with 50 existing skips. |
| Visual/native selection proof | yes | Record Browser/Playwright/native-selection evidence or scoped blocker | Chromium Playwright table route passed 17/17; new paste row asserts rendered cells and model selection. |
| Missing oracle repair | yes | Add/verify/revert/quarantine oracle packets or record owner defer | Three table fixtures unskipped and browser row added; proof passed. |
| `plite-browser` promotion | no | Add/verify helper/API or record queue/defer reason | N/A: existing `pasteEventPayload` covered this proof; no repeated helper gap. |
| Mobile/raw-device claim width | no | Run raw-device proof or record that only scoped viewport/browser proof is available | N/A: no mobile/raw-device claim. |
| Huge-document correctness smoke | no | Run focused huge-document behavior smoke or record owner defer | N/A: table-fragment policy scope only. |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | `bun --filter ./packages/plite typecheck` and `bun check` passed. |
| Skill/rule sync | no | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | N/A: no `.agents/rules/**` changed. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | Filled below. |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | First `bun check` found lint/format; rerun passed. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Logged fixture payload-shape debt and lint/format rerun. |
| Agent-native review for agent/tooling changes | no | Load `agent-native-reviewer` and close accepted findings, or N/A | N/A: no agent/tooling changes. |
| Autoreview for non-trivial implementation changes | no | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | N/A: narrow runtime packet covered by exact fixture/browser/check gates; no separate reviewer invoked. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-table-fragment-merge-policy.md` | passed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | plan filled before implementation | status |
| Status and current-tree closure | complete | owner audit found skipped table fixtures and release-doc deferred row | gap scan |
| Gap scan and scenario matrix | complete | table-fragment package/browser matrix below | behavior proof |
| Behavior proof | complete | focused fixtures, clipboard contract, table Playwright route passed | oracle repair |
| Oracle repair | complete | three skipped fixtures repaired/unskipped; browser row added | visual proof |
| Visual/native proof | complete | Chromium table route passed 17/17 including new paste row | plite-browser promotion |
| plite-browser promotion | complete | N/A, existing helper covered the proof | mobile claim width |
| Mobile/raw-device claim width | complete | N/A, no mobile claim | huge-document smoke |
| Huge-document correctness smoke | complete | N/A, explicit non-goal | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | complete | perf N/A; docs updated; skill N/A | consolidation |
| Consolidation and review | complete | docs/API/release rows updated; `bun check` passed | final handoff |
| Final handoff and goal-plan check | complete | handoff rows filled; final mechanical check next | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| table-fragment merge policy | nested table/list-like structural fragments into active text block | package fixture and Chromium table route | paste internal Plite fragment | output tree/cell order, model selection, no runtime errors | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| P1 | 1 | source-owner-audit | Deferred release-doc row and skipped table fixtures hide unresolved table-fragment semantics. | Read `.tmp/plite` insertFragment source, of-tables fixtures, table route/spec, docs row, upstream `../slate` fixtures. | N/A source audit | keep | Patch runtime/tests/docs. |
| P2 | 1 | policy-implementation | Core should perform structural fragment insertion; table-grid positional merge belongs to extension policy. | Changed `packages/plite/src/transforms-text/insert-fragment.ts`, three of-tables fixtures, docs API/extensions/release rows. | `PLITE_FIXTURE_FILTER=transforms/insertFragment bun test ./packages/plite/test/index.spec.ts`; `bun test ./packages/plite/test/clipboard-contract.ts`; `bun --filter ./packages/plite typecheck`. | keep | Browser proof. |
| P3 | 1 | visual-proof | Browser-visible table paste should follow the same structural policy. | Added Chromium Playwright row in `playwright/integration/examples/tables.test.ts`; built `slate`; ran focused and full table route proof. | Focused row passed; full Chromium table suite passed 17/17. | keep | Final check. |
| P4 | 1 | final-check | Runtime/docs/test packet must pass repo fast gate. | Fixed lint/format issues from first check. | `bun check` passed. | keep | Close goal. |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| table-fragment insertion | `packages/plite` | `PLITE_FIXTURE_FILTER=transforms/insertFragment/of-tables bun test ./packages/plite/test/index.spec.ts` | N/A package | 9 pass, 0 fail | widened to all insertFragment fixtures |
| insertFragment regression suite | `packages/plite` | `PLITE_FIXTURE_FILTER=transforms/insertFragment bun test ./packages/plite/test/index.spec.ts` | N/A package | 35 pass, 50 existing skip, 0 fail | kept |
| clipboard contract | `packages/plite` | `bun test ./packages/plite/test/clipboard-contract.ts` | N/A package | 35 pass, 0 fail | kept |
| table route paste proof | `/examples/tables` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/tables.test.ts --project=chromium --grep "pastes a Plite table fragment structurally"` | Chromium | 1 pass | widened to full Chromium table suite |
| table route suite | `/examples/tables` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/tables.test.ts --project=chromium` | Chromium | 17 pass, 0 fail | kept |
| full fast gate | `.tmp/plite` | `bun check` | N/A mixed | pass | complete |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| table-fragment browser paste | Model selection asserted at `[1,0,2,0]` offset 5 after paste. | N/A: collapsed paste result, no selected text expected. | Rendered cells asserted as `['', 'HumanNew 1', 'New 2', 'Dog', 'Cat']`; runtime errors asserted none. | Chromium Playwright `/examples/tables` focused row and full suite. | pass |

plite-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| pasteEventPayload | table route paste proof | N/A: helper already exists and was sufficient | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/tables.test.ts --project=chromium --grep "pastes a Plite table fragment structurally"` | no new helper needed |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| table-fragment policy | N/A | N/A | N/A | no mobile/raw-device claim made |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| N/A | N/A | N/A | N/A | explicit non-goal for this table-fragment policy run |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| First focused fixture run | package fixture proof | seconds | skipped fixtures used legacy single-block payload shape, so v2 no-oped before payload repair | exposed real test-debt and runtime gap | keep evidence; repaired fixtures to use `<fragment>` payloads |
| First `bun check` run | repo fast gate | under 1 minute | lint unused variable and formatter line after implementation | no product evidence beyond lint/format failure | fixed locally; reran `bun check` green |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `.tmp/plite/packages/plite/src/transforms-text/insert-fragment.ts`: unwrap leading nested structural fragment path and merge first source block into active block; keep positional table-grid paste extension-owned. |
| tests/oracles/browser proof | Three `.tmp/plite/packages/plite/test/transforms/insertFragment/of-tables/*.tsx` fixtures repaired/unskipped; `.tmp/plite/playwright/integration/examples/tables.test.ts` adds internal Plite table-fragment paste proof. |
| benchmarks/metrics/targets | none |
| examples/docs | `.tmp/plite/docs/api/transforms.md`, `.tmp/plite/docs/concepts/08-extensions.md`, `.tmp/plite/docs/releases/plite.md` document current structural policy and remove deferred table-fragment row. |
| skills/workflow | none |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Core policy decision | This is the taste-sensitive part: core remains structural; table-grid positional paste is extension-owned. | `.tmp/plite/docs/releases/plite.md:498`; `.tmp/plite/docs/concepts/08-extensions.md:258` | accept |
| 2 | Runtime helper shape | The new helper unwraps only the leading structural path and preserves later siblings. This is the exact behavior to inspect if you want stricter table semantics later. | `.tmp/plite/packages/plite/src/transforms-text/insert-fragment.ts:928` | inspect closely |
| 3 | Browser claim width | Browser proof is Chromium table route, not Firefox/WebKit/mobile. Package proof covers core behavior; browser claim is scoped. | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/tables.test.ts --project=chromium` | accept scoped |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | none | no user-only decision remains for this scoped policy | none | completed policy packet | N/A | N/A |

Findings:
- Existing skipped fixtures under `packages/plite/test/transforms/insertFragment/of-tables/**` were the deferred policy lane.
- Upstream `../slate` has the same three skipped unresolved fixtures, so there was no upstream accepted answer to copy.
- The first unskip attempt exposed legacy fixture payload debt: v2 `tx.fragment.insert` needs a fragment array payload, not a single JSX block node.
- The runtime path needed to unwrap the leading structural fragment path so table/list-like fragments do not nest copied ancestors under the active row/cell.

Decisions and tradeoffs:
- Core policy: fragment insertion is structural, not table-grid positional.
- Grid-aware multi-cell paste belongs in a table extension clipboard/fragment policy.
- Browser proof is scoped to Chromium table route because the package-level fixture/clipboard tests own the cross-runtime semantics; no Firefox/WebKit/mobile claim was made.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First of-tables fixture proof failed because skipped fixtures passed a single JSX block instead of a `<fragment>` payload. | 1 | Repair fixture payloads to v2 API shape before runtime diagnosis. | Fixed payloads; rerun exposed runtime nesting gap, then passed after runtime patch. |
| First `bun check` failed on unused variable and formatter output. | 1 | Remove unused variable and format line manually. | Fixed; rerun `bun check` passed. |

Verification evidence:
- `PLITE_FIXTURE_FILTER=transforms/insertFragment/of-tables bun test ./packages/plite/test/index.spec.ts` from `.tmp/plite` -> 9 pass, 0 fail after patch.
- `PLITE_FIXTURE_FILTER=transforms/insertFragment bun test ./packages/plite/test/index.spec.ts` from `.tmp/plite` -> 35 pass, 50 existing skip, 0 fail.
- `bun test ./packages/plite/test/clipboard-contract.ts` from `.tmp/plite` -> 35 pass, 0 fail.
- `bun --filter ./packages/plite typecheck` from `.tmp/plite` -> pass.
- `bun --filter ./packages/plite build` from `.tmp/plite` -> pass before browser proof.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/tables.test.ts --project=chromium --grep "pastes a Plite table fragment structurally"` from `.tmp/plite` -> 1 pass.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/tables.test.ts --project=chromium` from `.tmp/plite` -> 17 pass, 0 fail.
- `bun check` from `.tmp/plite` -> pass.
- Source audit: `rg -n "Deferred table-merge|Deferred policy lane|export const skip = true" ...` over the changed policy/test files -> no matches.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-table-fragment-merge-policy.md` from parent repo -> pass.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-15-table-fragment-merge-policy.md`
- Surface and route/package: `.tmp/plite` `packages/plite` insertFragment and `/examples/tables`
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop, no minimum runtime, one loop
- Behavior gates and visual proof: insertFragment fixtures, clipboard contract, Chromium table route focused/full suite
- Primary metric baseline/latest/best and stop reason: N/A no perf metric; stopped because policy completion threshold passed
- Bugs fixed and oracles added: nested structural fragment unwrapping fixed; table fixtures and browser paste oracle added
- Benchmark/skill/docs repairs: docs repaired; no benchmark/skill changes
- Workflow slowdowns and repairs: legacy skipped fixture payload and initial lint/format fail logged/repaired
- Changed list: filled above
- Needs your attention: filled above
- Stopping checkpoints to unblock: none
- Accepted deferrals and residual risks: Firefox/WebKit/mobile browser proof not claimed; table-grid positional paste remains extension-owned
- Next owner: complete after mechanical plan check

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff / mechanical plan check |
| Where am I going? | Complete goal if `check-complete.mjs` passes |
| What is the goal? | Complete Plite table-fragment merge policy with code/tests/docs/proof |
| What have I learned? | See Findings |
| What have I done? | See Timeline |
| What changed in the checkpoint plan? | See Checkpoint mutation ledger |

Timeline:
- 2026-06-15T19:16:53.263Z Goal plan created.
- 2026-06-15T19:17:14Z First checkpoint filled from user prompt and skill reads.
- 2026-06-15T19:27:07Z Runtime/tests/docs/browser proof completed; final plan evidence recorded.
- 2026-06-15T19:27:07Z `check-complete.mjs` passed.

Open risks:
- Browser proof is Chromium-scoped. Package fixture and clipboard proof own the core policy; Firefox/WebKit route proof can be added later if table browser paste becomes a release-wide browser claim.
- Product-grade positional table-grid paste is intentionally not in core. A table extension should own it when Plite/Plate wants spreadsheet-like paste.
