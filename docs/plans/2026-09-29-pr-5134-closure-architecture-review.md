# PR 5134 closure architecture review

Objective:
Close PR #5134 with the simplest durable comment-composer placement solution.
Determine whether the submitted virtual-range placement is an unnecessary hack;
prove the current design or repair it within the existing behavior contract.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-29-pr-5134-closure-architecture-review.md

Template:
docs/plans/templates/autoclosure.md

Primary template:
docs/plans/templates/autoclosure.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Completion threshold:
- The architecture verdict is backed by the current source, direct placement
  owners, and focused behavior proof rather than diff aesthetics.
- Any accepted defect is repaired without expanding beyond PR #5134's draft
  comment placement contract.
- The closure matrix is fully resolved; the final live-feedback inventory has
  zero actionable P1-or-higher items; every lower-priority item is classified;
  the exact-head terminal receipt is verified; the goal checker passes.
- No new product scope. Completion requires every applicable lane below to have
  fresh evidence, `pnpm check` passing, review findings closed, authorized
  GitHub delivery complete, and the goal checker passing.

Verification surface:
- Immutable PR head `9d720980341522eec2e37e2809decb20c08786ce`,
  focused source/diff audit, relevant browser behavior, targeted tests/types,
  registry changelog contract, `pnpm lint:fix`, `pnpm check`, structured
  `autoreview`, GitHub feedback/read-back APIs, and the goal-plan checker.

Constraints:
- Finish the intended delta; do not invent the next feature.
- Preserve source/generated/package/docs ownership.
- Use a different diagnostic after repeated failure signatures.
- Preserve existing-discussion and suggestion placement behavior unless direct
  source evidence proves they share the draft-placement defect.
- Do not merge: the user asked for the best solution and invoked autoclosure,
  but did not authorize a merge override.

Boundaries:
- intended delta: PR #5134 draft comment composer placement and its verified
  task-plan/release evidence
- allowed repairs: files already changed by PR #5134, their direct placement
  owners, focused proof, registry changelog source, and this closure ledger
- unrelated files: preserve; do not treat as blockers
- non-goals: new comment features, wholesale popover framework replacement,
  unrelated existing-thread behavior, merge/release

Output budget strategy:
- Read exact changed files and direct owners only; exclude generated/build/cache
  trees. Count/list broad GitHub feedback before printing bodies, cap shell
  output, and save any noisy verification logs outside streamed context.

Blocked condition:
- Stop only if required GitHub feedback/receipt operations are unavailable, a
  product-placement choice cannot be bounded from source and proof, or distinct
  repair attempts reproduce the same environment blocker.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Existing PR or local future-PR slice resolved | yes | Existing open PR https://github.com/udecode/plate/pull/5134 |
| Dedicated task invocation and plan for exact PR | yes | PR body names `docs/plans/2026-09-28-plate-5134-main-comment-selection.md` |
| Task evidence verified at PR head | yes | fetched `refs/pr/5134`; `git show` proved the plan exists and states “This plan belongs only to existing PR #5134.” |
| Active source/plan reconstructed | yes | PR body plus exact-head task plan define draft range placement, existing-discussion exclusion, and main target |
| Intended delta and exclusions recorded | yes | Boundaries and constraints above |
| Closure matrix classified | yes | Preliminary applicability recorded below; statuses remain open until proof |
| Live PR feedback target resolved | yes | Full `resolve-pr-feedback` mode for PR #5134 |
| Feedback proof checkout bound to PR head | yes | managed worktree created at immutable PR head; equality rechecked immediately before source triage |
| Unfiltered feedback inventory | yes | helper: 0 threads, 2 included top-level comments, 0 review bodies; raw API: 5 top-level comments, 0 reviews; all-thread GraphQL: 0 resolved/unresolved threads, no next page |
| GitHub delivery expectation recorded | yes | update existing PR if versioned fixes are required; commit/push whole worktree per repo policy; no merge without explicit instruction |
| Active goal checked or created | yes | native goal created for this exact plan and threshold |
| Agent-native pack selected | yes | materialized by the autoclosure helper as required by the governing skill |
| Agent-facing action surface identified | no | N/A: product UI placement only; the closure ledger does not change an agent action contract |
| Source rule versus generated mirror boundary identified | no | N/A: no `.agents/rules/**` or generated skill mirror change is in scope |
| `agent-native-reviewer` loaded or waiver recorded | no | N/A unless later repair changes an agent surface |

Closure matrix:
| Lane | Applies | Owner/proof | Status |
| --- | --- | --- | --- |
| per-PR task ownership | yes | exact PR + dedicated task plan | complete |
| noncompliant close | no | N/A: task evidence passed all three checks | complete |
| source behavior | yes | merged live draft-leaf rects + Radix collision/scroll strategy; real-demo geometry | complete |
| package/API/build | no | N/A: final diff changes registry app code and plans; no package source/export/API | complete |
| CI-controlled template output | no | N/A: no `templates/**` path changed; registry changelog JSON is generator-owned and verified separately | complete |
| docs/content | yes | registry changelog source plus task/closure plans | pending final delivery sync |
| registry/changelog | yes | existing MDX entry; `--write` clean and `--check` passed | complete |
| browser | yes | `/blocks/editor-ai` short/bottom/backward-multiblock/scroll proof at 900×450; zero console/request/page errors | complete |
| changeset | no | N/A: registry-only app behavior uses the registry changelog, not a package changeset | complete |
| agent workflow | no | N/A: no agent workflow change in intended delta | complete |
| live PR feedback | conditional | compliant: `resolve-pr-feedback` + final P1 read-back; noncompliant: N/A with comment/CLOSED receipts | pending |
| cleanup/review | yes | focused cleanup plus two-pass structured autoreview | complete |
| repository check | yes | `pnpm check` | complete |
| GitHub delivery | yes | existing PR branch, body, checks, terminal receipt; no merge | pending |

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
- [ ] Each lane is proven or N/A with a concrete reason.
- [x] Generated output was changed through its owner and regenerated.
- [x] Package/docs/registry/template/browser/changeset contracts are synchronized.
- [ ] Full `resolve-pr-feedback` ran for the exact compliant PR; every
      actionable P1-or-higher finding was fixed, proved, replied to, and
      resolved or received the required top-level reply receipt.
- [ ] For a compliant PR, local committed `HEAD`, fetched PR ref, and live
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
- [ ] Every P1-or-higher proof reran after the final material branch push,
      regardless of file type, including resolved or outdated threads that
      disappear from the helper's unresolved-thread output.
- [ ] Feedback was re-fetched after the last push/reply/resolution and shows
      zero unresolved actionable P1-or-higher findings.
- [ ] After all versioned plan/source updates were pushed, the exact-head P1
      proof/read-back receipt was posted to the PR and read back; no terminal
      receipt-only branch push was created. A post-comment `headRefOid` fetch
      matches the OID recorded in that receipt, and a post-comment helper/raw
      feedback fetch still shows zero actionable P1-or-higher items and no new
      URL lacking a verdict or explicit deferral, except the verified receipt.
- [x] Any remaining P2-or-lower item has its exact URL plus the user's explicit
      priority deferral recorded; no feedback was silently ignored.
- [x] Accepted cleanup and review findings are closed.
- [ ] PR body and check state match the final evidence.
- [ ] Residual blocker/waiver has exact evidence and next owner.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors (N/A: no agent workflow file changed).
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text (N/A: product UI only).
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded (N/A: no rule changed).
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason (N/A: no agent surface and no agent-native findings).

Error attempts:
| Failure signature | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Direct `pnpm --filter www typecheck` cannot resolve workspace packages such as `platejs` and `@platejs/test-utils`, followed by cascading implicit-any/JSX errors | 1 | Use the exact recovery already proven in the PR task plan: build workspace declarations once with `pnpm g:build`, then rerun the unchanged website typecheck. Do not edit unrelated source-entry plumbing in this scoped closeout. | `pnpm g:build` passed (54/54), then the unchanged website typecheck passed. |
| First `dev-browser` connection found no debug Chrome on 9222 | 1 | Use the skill's fallback setup with the separate `udecode.dev` profile cloned into a dedicated debug directory. | Persistent debug Chrome launched; browser proof completed. |
| First route navigation detached while Turbopack compiled | 1 | Wait for `curl -I` 200, then retry the same route after compilation. | Subsequent loads and interactions passed. |
| Virtual range did not reposition after programmatic editor scroll | 1 | Use Radix's draft-only `updatePositionStrategy="always"` instead of application-owned scroll listeners or popover self-measurement. | 100px scroll moved mark y404.8→304.8 and flipped popup from top to bottom with 2.2px clearance. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Per-PR task ownership | yes | Record exact PR and dedicated task-plan path | PR body names `docs/plans/2026-09-28-plate-5134-main-comment-selection.md`; fetched head contains it and it names only PR #5134. |
| Noncompliant PR disposition | no | Verify task evidence or comment then close and read back | N/A: all three compliance checks passed before source review. |
| Targeted behavior proof | yes | Run smallest missing owning proof | Website typecheck plus real `/blocks/editor-ai` browser proof passed. |
| Source/generated audit | yes | Prove correct source and regenerated mirrors | Only registry app/plans changed locally; changelog `--write` left no tracked delta and `--check` passed. |
| Package/docs/registry/browser closure | yes | Run every applicable local contract | Package/changeset N/A; task plan synced; registry and browser gates passed. |
| Feedback proof checkout | conditional | Compliant PR only: require local committed `HEAD` = fetched PR ref = live `headRefOid` before proof/reply/resolution and at terminal verification | pending |
| Live PR feedback resolution | conditional | Compliant PR only: run full `resolve-pr-feedback` and close every actionable P1-or-higher finding; otherwise N/A with noncompliant stop receipts | pending |
| Feedback priority classification | conditional | Compliant PR only: persist P0-P3 plus rationale for every actionable item; classify ambiguous P1-versus-lower as P1 | pending |
| Final P1 proof replay | conditional | Compliant PR only: after the final material branch push, rerun every P1-or-higher proof, including resolved/outdated items | pending |
| Final live feedback read-back | conditional | Compliant PR only: re-fetch helper plus unfiltered top-level/all-thread inventories; require zero actionable P1-or-higher and explicit P2-or-lower deferrals | pending |
| External terminal receipt | conditional | Compliant PR only: post/read exact-head receipt; require receipt/live/fetched/local OID equality and no unrecorded helper/raw URL except that verified receipt | pending |
| Cleanup | yes | Run bounded cleanup or N/A | Removed self-measurement, popover-element state, duplicate collision constants, and last-fragment fallback; 61 net runtime lines removed before metadata. |
| Agent-native reviewer | no | Run for workflow changes or N/A | N/A: no agent action, workflow, rule, skill, hook, command, or prompt changed. |
| Final lint | yes | Run `pnpm lint:fix` | Passed; 3,304 files checked, no fixes applied. |
| Repository check | yes | Run `pnpm check` | Passed; one pre-existing sidebar hook warning, zero errors, all typechecks and tests green. |
| GitHub delivery | pending | Commit/push/open or update PR and read back | pending |
| Autoreview | yes | Resolve every accepted actionable finding | First pass found missing `@platejs/floating` registry dependency; fixed in source metadata. Second pass: zero findings, patch correct (0.86). |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-29-pr-5134-closure-architecture-review.md` | pending |
| Agent source / generated sync | no | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | N/A: no agent source or mirror changed. |
| Agent action discoverability | no | Source-audit the skill/rule path an agent will read | N/A: product UI change only. |
| Agent-native review | no | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | N/A: no agent-facing action surface changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Inventory | complete | compliance, exact-head source, and all feedback surfaces inventoried | repair |
| Repair | complete | live draft rectangles + Radix placement; install dependency declared | review |
| Review/checks | complete | browser/typecheck/registry/lint/root check and clean second autoreview | delivery |
| Delivery | pending | | final audit |
| Closeout | pending | | final |

Verification evidence:
- `gh pr view 5134`: OPEN, head `9d720980341522eec2e37e2809decb20c08786ce`, exactly one task-plan body line.
- `git show refs/pr/5134:docs/plans/2026-09-28-plate-5134-main-comment-selection.md`: plan exists at head and explicitly owns PR #5134.
- `get-pr-comments 5134`: zero unresolved inline threads, two included top-level
  comments, zero review bodies; raw comparison found five top-level comments,
  zero reviews, and zero resolved/unresolved threads.
- Exact-head equality before source triage: local committed `HEAD` = fetched
  `refs/pr/5134` = live `headRefOid` =
  `9d720980341522eec2e37e2809decb20c08786ce`.
- Raw feedback inventory: five top-level comments, zero review submissions,
  zero inline threads, GraphQL `hasNextPage: false`.
- `pnpm exec biome check` on both changed runtime files passed. The first direct
  website typecheck reproduced the task plan's missing workspace-declaration
  signature; no diagnostic pointed at the changed file before the cascading
  dependency failures.
- `pnpm g:build`: 54/54 package builds passed; the unchanged
  `pnpm --filter www typecheck` then passed, including docs/registry source
  parity and package-integration TypeScript.
- Registry changelog: `--write` regenerated 26 events without tracked changes;
  `--check` passed for all 26.
- Registry install contract: `block-discussion` declares
  `@platejs/floating`; website registry-source/type checks passed.
- Real browser route `http://localhost:3000/blocks/editor-ai`, 900×450:
  top mark y169.6–189.6 with popup y192–257; bottom mark y404.8–434.8
  with popup y336–401; after 100px editor scroll the mark moved to
  y304.8–334.8 and popup flipped to y337–402; backward multi-block marks
  y320.2–434.8 with popup y251–316. Composer focus was active and the run had
  zero console warnings/errors, failed requests, or page errors.
- `pnpm lint:fix`: 3,304 files checked, no fixes applied.
- `pnpm check`: exit 0; lint had one pre-existing `sidebar.tsx` hook warning,
  package builds/typechecks passed, and all fast/slow/slowest tests passed.
- First closure autoreview found the missing `@platejs/floating` registry
  dependency. After the metadata fix and focused replay, the second review
  returned zero findings and rated the patch correct (0.86 confidence).

Findings:
- Issue #5127 requires the inactive marked selection to remain visibly clear;
  it does not require a special last-line fallback when neither viewport side
  can contain the full selection and composer.
- The PR's self-measuring reference made anchor geometry depend on floating
  geometry, duplicating Radix/Floating UI collision policy and creating a
  layout feedback loop.
- Plate already owns the correct rectangle primitive:
  `@platejs/floating#getBoundingClientRect` merges multiple Slate locations.
- Radix Popper owns offset, shift, flip, size, and viewport collision; its
  `always` update strategy is the narrow mechanism for a moving virtual range.

Decisions and tradeoffs:
- Merge live draft-mark leaf rectangles through `@platejs/floating` and keep
  Radix as the only placement policy owner -> removes 43 lines of measurement
  and fallback logic -> draft mode pays an animation-frame position check while
  open so the virtual range tracks editor scrolling.
- Keep `commentingBlock` captured before selection collapse -> preserves the
  correct wrapper owner for forward and backward multi-block selections.
- Drop the last-client-rect fallback -> it was outside issue acceptance and
  forced application code to predict middleware behavior -> when neither side
  fits, Radix's normal shift/available-height behavior applies.

Review fixes:
- Browser scroll proof found a stale virtual position -> accepted -> added
  draft-only `updatePositionStrategy="always"`; replay passed.
- Autoreview found the copied registry item omitted the new
  `@platejs/floating` dependency -> accepted -> added it to
  `registry-ui.ts`; registry-source/type/changelog checks passed and the
  second autoreview was clean.

Autoreview scope baseline:
- Request: determine and ship the non-hacky solution for compliant PR #5134
  under `autoclosure`.
- Target: existing PR #5134 against `main`; issue #5127's draft-selection
  visibility behavior; no merge.
- Owner boundary: `comment-kit.tsx`, `block-discussion.tsx`, registry changelog,
  and the PR's task/closure evidence.
- Local runtime delta before final review: the placement file plus registry
  dependency metadata; the remaining local changes are the existing task plan
  and required closure plan.
- Non-goals: new comment UX, new package API, custom floating framework,
  existing-discussion behavior, release-process changes.

Feedback ledger:
| URL | Source | Priority | Verdict and rationale | Proof/reply/resolution |
| --- | --- | --- | --- | --- |
| https://github.com/udecode/plate/pull/5134#issuecomment-5787152308 | top-level comment | N/A | `not-addressing`: CodeSandbox preview links contain no correctness claim, request, or question. | No reply mechanism needed; URL ledgered. |
| https://github.com/udecode/plate/pull/5134#issuecomment-5787152787 | top-level comment | N/A | `not-addressing`: source audit confirms registry-only app behavior, so the bot's conditional package-release premise is false; the required artifact is the registry changelog. | `git diff --name-status origin/main...HEAD` plus local diff; changelog `--check` passed. |
| https://github.com/udecode/plate/pull/5134#issuecomment-5860601460 | top-level author comment | N/A | `already-handled`: status report for the superseded `next` candidate, not review feedback. | Current PR head/plan target `main`; URL ledgered. |
| https://github.com/udecode/plate/pull/5134#issuecomment-5874697880 | top-level maintainer comment | P1 | `fixed`: targeting `next` would invalidate the requested deliverable because that lane has no release path; the PR was rebuilt on `main`. | PR task plan and current head identify `main`; replay after final push. |
| https://github.com/udecode/plate/pull/5134#issuecomment-5880117205 | top-level author comment | N/A | `already-handled`: publication/proof status, not an external finding or question. | Current source and fresh proof will independently verify the claim. |

Feedback counts:
- helper: 0 review threads, 2 top-level comments, 0 review bodies;
- raw: 5 top-level comments, 0 reviews, 0 threads;
- priority: P1 1 already-fixed base-target item, P0/P2/P3 0,
  non-actionable/conditional/status 4;
- replies/resolutions: none yet; top-level items cannot be resolved.

Timeline:
- 2026-09-29T10:42:25.470Z Autoclosure plan created.
- 2026-09-29 Task compliance passed before source review; managed exact-head worktree created; native goal activated.
- 2026-09-29 Exact-head equality and unfiltered GitHub feedback inventory passed; all five raw comment URLs ledgered before source triage.
- 2026-09-29 Replaced self-referential popover measurement with the existing `@platejs/floating` range-rectangle utility over live draft-mark paths; focused Biome passed; direct website typecheck hit the recorded declaration-state prerequisite.
- 2026-09-29 Built workspace declarations, passed website typecheck, passed registry generation/check, and completed clean real-demo browser proof including scroll and backward multi-block selection.
- 2026-09-29 Accepted the missing registry dependency from first autoreview; replayed registry/type proof; second autoreview returned zero findings; `pnpm lint:fix` and `pnpm check` passed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Delivery |
| Where am I going? | Commit/push, exact-head feedback proof, terminal receipt, final audit |
| What is the goal? | Prove or replace PR #5134's placement architecture, then close every applicable autoclosure gate without merging. |
| What have I learned? | The PR's measured fallback is outside issue acceptance; live draft-leaf rectangles plus Radix placement are simpler and pass the same real behavior. |
| What have I done? | Verified compliance/feedback, simplified the anchor, fixed scroll tracking and install metadata, then passed browser/type/registry/lint/root checks and clean autoreview. |

Open risks:
- Cross-repository PR push authority and final CI remain to be verified during
  delivery. No merge is authorized.
