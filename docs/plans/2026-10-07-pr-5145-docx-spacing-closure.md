# PR 5145 docx spacing closure

Objective:
Review and close out PR #5145's CSS line-height conversion into DOCX paragraph spacing. Deliver proof and an exact-head feedback receipt. Do not merge.

Goal plan:
docs/plans/2026-10-07-pr-5145-docx-spacing-closure.md

Template:
docs/plans/templates/autoclosure.md

Primary template:
docs/plans/templates/autoclosure.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Completion threshold:
- Zero accepted actionable findings, passing package tests, source-first types, structured autoreview, root check, compliant task ownership, and verified GitHub receipt.
- No new product scope. Completion requires every applicable lane below to have
  fresh evidence, `pnpm check` passing, review findings closed, authorized
  GitHub delivery complete, and the goal checker passing.

Verification surface:
- DOCX XML regression tests, package typecheck, structured branch review, `pnpm lint:fix`, `pnpm check`, complete raw/helper feedback inventories, and exact-head receipt read-back.

Constraints:
- Finish the intended delta; do not invent the next feature.
- Preserve source/generated/package/docs ownership.
- Use a different diagnostic after repeated failure signatures.

Boundaries:
- intended delta: absolute CSS heights use twips and `atLeast`; relative values use 240ths of a line and `auto`; unsupported values retain defaults.
- allowed repairs: defects in that conversion, writer, focused tests, changeset, or proof. Append-only delivery on the existing fork branch.
- unrelated files: preserve; do not treat as blockers
- non-goals: merge, release, broader DOCX conversion, new CSS units, workflow changes, rebase, and force-push.

Output budget strategy:
- Bound source review to the PR diff and direct callers. Summarize test/check logs, preserve exact failure output outside the checkout when needed.

Blocked condition:
- Stop for missing fork write access, unavailable feedback/receipt APIs, out-of-scope design decisions, or a reproduced environment blocker after distinct diagnostics.

Versioned evidence freezes before the append-only delivery commit. Post-push OID equality, feedback freshness, and the terminal receipt are external completion gates. This file records their required checks, not an assertion that future actions already happened. The native goal completes only after those checks succeed.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Existing PR or local future-PR slice resolved | yes | Existing OPEN PR #5145. |
| Dedicated task invocation and plan for exact PR | yes | Head task plan identifies #5145; no batch substitution. |
| Task evidence verified at PR head | yes | One exact task-plan body line and fetched head file verified. |
| Active source/plan reconstructed | yes | Five-file PR diff and direct conversion/writer owners inspected. |
| Intended delta and exclusions recorded | yes | Boundaries above; no merge or new CSS-layout contract. |
| Closure matrix classified | yes | Applicable rows below; concrete N/A reasons retained. |
| Live PR feedback target resolved | yes | Full resolve-pr-feedback mode, udecode/plate#5145. |
| Feedback proof checkout bound to PR head | yes | 72e98b76ad37e16801c7e3f6abbd888a9e8aca69 three-way match before proof. |
| Unfiltered feedback inventory | yes | 2 raw comments, 0 reviews, 0 threads; helper 1 comment. |
| GitHub delivery expectation recorded | yes | Append commit and push to vincent69001/fix/docx-io-line-height-units; external receipt. No merge. |
| Active goal checked or created | yes | Native goal created; one-shot run. |
| Agent-native pack selected | yes | Materialized agent-native pack retained. |
| Agent-facing action surface identified | no | N/A. Product converter and proof plans only. |
| Source rule versus generated mirror boundary identified | no | N/A. No rule, skill, or helper edits. |
| `agent-native-reviewer` loaded or waiver recorded | no | N/A. No changed agent action or workflow. |

Closure matrix:
| Lane | Applies | Owner/proof | Status |
| --- | --- | --- | --- |
| per-PR task ownership | yes | Body/head/exact-owner | done |
| noncompliant close | no | N/A. Task evidence valid; keep PR OPEN. | N/A |
| source behavior | yes | 107 package tests; 14 focused XML cases; 3 red assertions before repair | done |
| package/API/build | yes | Package types pass after existing dist-backed docx peer build; root check builds release artifacts | done |
| CI-controlled template output | no | N/A. Templates untouched; no registry build run. | N/A |
| docs/content | no | N/A. No user-facing docs API change. Task/closure plans record caveats. | N/A |
| registry/changelog | no | N/A. No registry source change. | N/A |
| browser | yes | Local demo loaded; Word export blocked upstream in Juice. Tracked #5146. No download/rendering claim. | documented blocker |
| changeset | yes | .changeset/docx-io-line-height-units.md covers final package delta from main | done |
| agent workflow | no | N/A. No workflow change; pack proof rows retained. | N/A |
| live PR feedback | yes | Initial full/raw inventory has 0 actionable items; final post-push read-back required externally | external-gate |
| cleanup/review | yes | 2 narration comments deleted; branch and local structured Codex reviews clean | done |
| repository check | yes | pnpm lint:fix and pnpm check exit 0 | done |
| GitHub delivery | yes | Append-only fork push, body sync, exact-head external receipt | External append-only delivery gate. No rebase, force-push, merge, or release. |

Work Checklist:
- [x] Every PR has its own `task` invocation and dedicated task plan; a batch
      plan or aggregate autoclosure is not used as a substitute.
- [x] Existing-PR and no-PR entry paths were distinguished before source
      review. A no-PR local slice has a dedicated current `task` plan and defers
      feedback/merge until delivery creates the exact PR, records it in the
      plan at head, and passes the task compliance gate.
- [x] Task evidence was verified from the PR body, fetched head, and exact PR
      ownership; otherwise the required comment and `CLOSED` state were read
      back and no source review, repair, merge, or release work continued.
- [x] Intended behavior and exclusions are reconstructed from real sources.
- [x] Each lane is proven or N/A with a concrete reason.
- [x] Generated output was changed through its owner and regenerated.
- [x] Package/docs/registry/template/browser/changeset contracts are synchronized.
- [x] Full `resolve-pr-feedback` ran for the exact compliant PR; every
      actionable P1-or-higher finding was fixed, proved, replied to, and
      resolved or received the required top-level reply receipt.
- [x] The exact-head equality protocol is recorded below. For a compliant PR, local committed `HEAD`, fetched PR ref, and live
      `headRefOid` matched before proof/reply/resolution and after every push.
      For a noncompliant PR, this and all feedback gates are N/A with the
      required remediation-comment and `CLOSED` receipts.
- [x] Unfiltered top-level PR comments and review bodies were fetched through
      the GitHub API, compared by ID/URL with helper output, and every excluded
      bot/author item was ledgered; identity alone never dismissed feedback.
      Only the exact terminal receipt produced/read back by this run is exempt
      from the versioned ledger.
- [x] All inline review threads were fetched with GraphQL cursor pagination
      without filtering resolved/outdated items; every thread has priority,
      rationale, relocation, and proof state in the ledger.
- [x] Every actionable feedback item has a persisted P0-P3 priority and
      one-sentence rationale from the autoclosure rubric; ambiguous P1-versus-
      lower items fail closed as P1.
- [x] The external replay gate is recorded. Every P1-or-higher proof must rerun after the final material branch push,
      regardless of file type, including resolved or outdated threads that
      disappear from the helper's unresolved-thread output.
- [x] The external freshness gate is recorded. Feedback must be re-fetched after the last push/reply/resolution and show
      zero unresolved actionable P1-or-higher findings.
- [x] The external receipt gate is recorded. After all versioned plan/source updates are pushed, the exact-head P1
      proof/read-back receipt must be posted to the PR and read back; no terminal
      receipt-only branch push was created. A post-comment `headRefOid` fetch
      matches the OID recorded in that receipt, and a post-comment helper/raw
      feedback fetch still shows zero actionable P1-or-higher items and no new
      URL lacking a verdict or explicit deferral, except the verified receipt.
- [x] Any remaining P2-or-lower item has its exact URL plus the user's explicit
      priority deferral recorded; no feedback was silently ignored.
- [x] Accepted cleanup and review findings are closed.
- [x] PR body synchronization is an external delivery gate. Local check state matches the evidence; body text will preserve the task-plan line and disclose browser/CSS caveats.
- [x] Browser blocker has exact evidence and follow-up #5146. It is before the changed converter. Package XML proof is complete.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Error attempts:
| Failure signature | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Initial typecheck missing @platejs/docx dist | 1 | Inspect paths/peer graph; build intentionally dist-backed peer | Package types pass |
| Browser navigation timeout | 1 | Read the existing tab after compilation | Demo loaded |
| Browser Word download timeout | 1 | Read browser console and owning call order | Juice failure before converter; #5146 |
| cm/in precision assertions fail | 1 | Convert to points without early integer rounding | 3 red assertions; 107 green tests |

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Per-PR task ownership | yes | Record exact PR and dedicated task-plan path | Body/head task plan verified at incoming exact head; replay after push required. |
| Noncompliant PR disposition | no | Verify task evidence or comment then close and read back | N/A. Valid task evidence. No close action. |
| Targeted behavior proof | yes | Run smallest missing owning proof | pnpm test packages/docx-io passes 107; focused XML tests pass 14. |
| Source/generated audit | yes | Prove correct source and regenerated mirrors | Only owning converter/tests and plans changed. No generated exports or layout changes; brl N/A. |
| Package/docs/registry/browser closure | yes | Run every applicable local contract | Types and package tests pass; changeset existing. Browser attempted, blocked in unchanged Juice before conversion, tracked #5146. |
| Feedback proof checkout | yes | Compliant PR only: require local committed `HEAD` = fetched PR ref = live `headRefOid` before proof/reply/resolution and at terminal verification | Incoming committed HEAD=fetched=live verified; terminal equality remains externally required. |
| Live PR feedback resolution | yes | Compliant PR only: run full `resolve-pr-feedback` and close every actionable P1-or-higher finding; otherwise N/A with noncompliant stop receipts | Initial full/raw inventory has zero actionable findings. Final external read-back required. |
| Feedback priority classification | yes | Compliant PR only: persist P0-P3 plus rationale for every actionable item; classify ambiguous P1-versus-lower as P1 | 2 informational comments; no actionable P0-P3 items. Exact URL/verdict ledger below. |
| Final P1 proof replay | no | Compliant PR only: after the final material branch push, rerun every P1-or-higher proof, including resolved/outdated items | N/A. Zero P1-or-higher items. Final receipt must state zero and repeat package proof. |
| Final live feedback read-back | yes | Compliant PR only: re-fetch helper plus unfiltered top-level/all-thread inventories; require zero actionable P1-or-higher and explicit P2-or-lower deferrals | External completion gate after push; require fresh helper/raw inventory with no unledgered items. |
| External terminal receipt | yes | Compliant PR only: post/read exact-head receipt; require receipt/live/fetched/local OID equality and no unrecorded helper/raw URL except that verified receipt | External completion gate. Post/read exact-head receipt and require receipt=live=fetched=local, then re-inventory. No receipt-only commit. |
| Cleanup | yes | Run bounded cleanup or N/A | Bounded deslop/no-comments pass; 2 comments deleted, no flags or broadened design. |
| Agent-native reviewer | no | Run for workflow changes or N/A | N/A. No agent action or workflow changes. |
| Final lint | yes | Run `pnpm lint:fix` | pnpm lint:fix exit 0; root pnpm check lint also passes. |
| Repository check | yes | Run `pnpm check` | pnpm check exit 0. Package tests, build/typecheck, lint and slow lanes passed. |
| GitHub delivery | yes | Commit/push/open or update PR and read back | External append-only delivery gate. No rebase, force-push, merge, or release. |
| Autoreview | yes | Resolve every accepted actionable finding | Structured Codex branch and follow-up local runs exit 0, zero actionable findings. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-10-07-pr-5145-docx-spacing-closure.md` | Run checker before commit; native completion also requires external gates. |
| Agent source / generated sync | no | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | N/A. No agent source change. pnpm install generated no tracked drift. |
| Agent action discoverability | no | Source-audit the skill/rule path an agent will read | N/A. No changed agent action. |
| Agent-native review | no | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | N/A. No changed workflow; no waiver of product proof. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Inventory | done | Task ownership and exact head verified | proof |
| Repair | done | cm/in precision; no signature change | review |
| Review/checks | done | Branch/local autoreview and pnpm check pass | delivery |
| Delivery | external-gate | Commit/push/body read-back required | final audit |
| Closeout | external-gate | Exact-head receipt and fresh feedback required | final |

Verification evidence:
- Task evidence passes at `72e98b76ad37e16801c7e3f6abbd888a9e8aca69`. The PR body names `docs/plans/2026-10-07-fix-docx-io-line-height-units.md`; its head file identifies #5145 exactly.
- Before source/feedback proof, local committed HEAD = refs/pr/5145 = live headRefOid = `72e98b76ad37e16801c7e3f6abbd888a9e8aca69`.
- Native goal created. Primary template is autoclosure with the agent-native pack. This is one-shot execution, not a new task or PR.
- No .env or .env.local files found in the source checkout. No environment copy applies.
- Forge is GitHub CLI. Origin CLI is unavailable. No other agent owns this PR.

Requirements ledger:
| Requirement | Authority | Proof |
| --- | --- | --- |
| Finish #5145 only | User's exact URL and autoclosure | Scope baseline and closure matrix |
| Preserve unit meaning | Dedicated task plan | DOCX XML tests |
| No new product scope or merge | Autoclosure and no merge request for #5145 | Append-only branch delivery and OPEN read-back |
| Inspect all feedback | Autoclosure full mode | Raw and helper inventories |
| Commit/push follow-up evidence | Autoclosure and open-PR policy | Delivered head and task-body read-back |
| Genuine structured review and root check | Autoreview and repository rules | Helper exit and pnpm check |

Throughput checkpoint:
- Work unit is this one PR. Parent owns all writes. One read-only how explainer reviews the spacing data shape while the parent inventories feedback and runs proof. No polling loop or CI retrigger is authorized by this run.

Timeline:
- 2026-10-07T16:35:38.713Z Autoclosure plan created.
- 2026-10-07 Local checks complete. Branch and follow-up structured reviews pass. Fractional-unit repair is green. Browser follow-up is #5146. Final delivery and receipt remain externally enforced.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Local proof complete; external delivery gates next |
| Where am I going? | Repair, review/checks, delivery, final audit |
| What is the goal? | Close #5145 review with verified exact-head receipt, no merge |
| What have I learned? | See closure matrix |
| What have I done? | See timeline |

Open risks:
- Browser Word export is blocked in upstream Juice before this converter. Follow-up https://github.com/udecode/plate/issues/5146 records observed evidence; baseline reproduction and root cause remain unverified.
- Relative values are Word line-multiplier approximations. Exact CSS font-size/inheritance fidelity is outside the requested minimal fix.
- Absolute atLeast allows larger content to expand. Exact CSS heights below natural font height are not guaranteed.
- Post-push freshness and receipt are required externally. Do not report completion from this versioned file alone.

Feedback ledger:
| Exact URL | Source | Verdict | Priority/rationale | Proof/reply/resolution |
| --- | --- | --- | --- | --- |
| https://github.com/udecode/plate/pull/5145#issuecomment-6039858665 | Raw top-level; helper omitted | Informational | N/A. CodeSandbox editor/preview links only; no requested change or correctness claim. | Content inspected. No reply or resolution needed. |
| https://github.com/udecode/plate/pull/5145#issuecomment-6039859250 | Raw and helper top-level | Informational | N/A. Confirms existing docx-io patch changeset; no requested change. | Changeset file verified. No reply or resolution needed. |

Review evidence:
- `autoreview --mode branch --base origin/main` reviewed incoming PR and exited 0. No actionable findings.
- `autoreview --mode local` reviewed the fractional-unit repair and task evidence, exited 0. No actionable findings. One follow-up review, no rejected findings.
- Scope baseline was 5 files and 39 added/22 deleted production lines. Follow-up remains in the same converter with no new signature, exported type, or public API. Package barrel generation is N/A because only an existing test and an internal implementation changed.
- Model the Domain informed retaining `LineSpacing { line, lineRule }`. It prevents the writer from interpreting a twip height as a line multiplier. No broader abstraction or font inheritance redesign is justified here.
- Browser-use connector discovery found none. The in-app browser was used. The local demo rendered. Export as Word reached Juice and rejected before conversion; no DOCX download claim.

Terminal protocol:
1. Run plan checker and inspect the entire worktree; commit/push all authorized follow-up changes after passing check.
2. Require delivered HEAD, fetched refs/pr/5145, live headRefOid and task ownership to match.
3. Replay package XML proof and fetch helper, raw comments/reviews, and all GraphQL threads.
4. Update the PR body without removing the exact task-plan line or auto-release block.
5. Post a single terminal receipt with exact OID, proof, counts, URL/verdict ledger, browser caveat and no deferrals.
6. Read the receipt with gh pr view --comments, fetch head and feedback again, and verify zero unrecorded items except that exact receipt. Only then complete the native goal.
