# Comments suggestion lifecycle cut

Objective:
Implement the Comments audit's first phase; done when suggestion replies use subject identity, survive accept/reject undo/redo, preserve explicit resolution and pass focused UI, type, scale and browser proof.

Goal plan:
docs/plans/2026-09-04-comments-suggestion-lifecycle-cut.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- docs (docs/plans/templates/packs/docs.md)
- performance-observability (docs/plans/templates/packs/performance-observability.md)

Task source:
- type: user continuation approving the preceding audit's named next action
- id / link: docs/plans/artifacts/comments-source-api-audit/audit.md
- title: Execute phase 1: suggestion reply lifecycle
- acceptance criteria: one subject lifecycle; no independent suggestion reply anchor or automatic resolveSubject; all current authoring, reply, explicit resolution, history and combined Floating Discussion jobs preserved.

First checkpoint:
- [x] Interpret "go" as authority to implement the named next action: phase 1 of the completed full Comments audit.
- [x] Use Auto continuity and the accepted challenged target; do not repeat the full audit.
- [x] Start with the missing Accept -> Undo -> existing reply browser regression and retain model/DOM evidence.
- [x] Move attached-reply composition into Discussion; keep Suggestion document commands independent from Comments data.
- [x] Use exclusive range or suggestion targets; subject replies allocate no independent comment anchor.
- [x] Preserve rich bodies, explicit user resolution, draft/AI workflows, overlap ordering, focus and the current combined Floating Discussion design.
- [x] Verify accept, reject, undo, redo, direct document commands and source disappearance/reappearance.
- [x] Measure subject association at normal/large/stress cohorts before accepting added recurring work; reuse canonical owners rather than adding a data framework.
- [x] Complete copied consumers, examples, registry metadata, docs and required Best API source/mirror repair.
- [x] No Git publication or external messages authorized; no timebox requested.
- [x] Report exact local proof and remaining audit phases; do not imply the other C2-C7 findings are fixed by this packet.
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no timed loop
- semantics: complete the accepted first adoption phase
- initial confidence score: C1 reproduced in model and real Browser during the audit
- improvement loop: red proof, one owning cut, focused proof and final browser replay
- final score / loop closure: all applicable gates must pass; no numerical architecture score

Completion threshold:
- Suggestion replies retain immutable app records and explicit resolution while visibility follows the suggestion's presence. Accept/reject followed by undo restores the same rich replies; redo hides them; direct commands agree. The redundant reply anchor and mirrored lifecycle action are absent from current runtime/API/docs. Focused tests, source type/lint, exact Browser replay and matched subject association scale receipts pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-comments-suggestion-lifecycle-cut.md` passes.

Verification surface:
- apps/www/tests/browser/comment.spec.ts, colocated comment/discussion/suggestion behavior tests, current source typecheck and lint, live /blocks/discussion-demo, registry generation when applicable, source/mirror parity, and a disposable 100/1k/10k subject association probe.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: current registry owners and the accepted audit C1/phase 1; Plite owns suggestion document mutation/history.
- Allowed edit scope: comment.tsx, discussion.tsx, suggestion.tsx, their direct consumers, fixtures, tests, docs/registry metadata, required source doctrine and generated mirrors, this plan and artifacts.
- Browser surface: /blocks/discussion-demo, /view/editor-ai and relevant docs/install route.
- Browser strategy: Browser for the real combined Discussion route. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: local user request, no public issue or PR.
- Non-goals: audit phases 2/3 (projection rebinding, activation IDs, storage rewrite, async save integration); changing the combined Floating UI design; Git/PR/release work; new backend framework.

Output budget strategy:
- Reuse the complete prior audit. Read exact owning sections and keep logs/receipts under artifacts/comments-suggestion-lifecycle-cut. Initial combined skill output truncated; recover only necessary sections with bounded output.

Blocked condition:
- Exact browser surface cannot run after repairing the local environment, or a destructive persistence policy needs an explicit product decision. Retain app records when a subject disappears; no destructive archive policy is required here.

Task state:
- task_type: accepted architecture implementation / history bug
- task_complexity: major, bounded copied UI/API packet
- current_phase: closeout
- current_phase_status: blocked
- next_phase: final handoff
- goal_status: blocked; shared runtime inputs change during final proof

Current verdict:
- verdict: delete duplicated suggestion reply lifecycle; preserve app entities and mixed Discussion composition
- confidence: 24 owner/scale tests, focused types and 16+10 browser behaviors pass; final unchanged-input certification is blocked
- next owner: this active verification goal after the shared archi task settles; no phase 2 execution yet
- reason: app thread resolution is not editor history and must not mirror a UI-triggered suggestion mutation

Accepted packet:
- Case ID: comments-suggestion-history. Exact route /blocks/discussion-demo, seeded tighten suggestion and Charlie's rich reply; add a reply, Accept, native Undo, reopen suggestion. Expected same seeded and added replies, then Redo hides the suggestion. Reject and direct commands must agree.
- Red proof: existing browser case extended at apps/www/tests/browser/comment.spec.ts:924; failed at the missing seeded reply after Undo. See artifacts/comments-suggestion-lifecycle-cut/browser-red.log and baseline-source.json.
- Challenge refinement: SuggestionReviewCard has only one terminal consumer, Discussion. Move the complete copied review card into that owner, keeping it private, instead of adding header/user/date props solely to invert its Comments dependency. Suggestion package commands still own document mutations.
- CommentTarget is an exclusive range-anchor or suggestion-ID union. Only range targets enter Comments annotations or release anchor handles. Explicit user resolution remains app-owned; suggestion disappearance does not mutate thread records.
- Associate reply IDs while Discussion already visits visible threads; attach them to the existing suggestion items. Do not add a second store or per-card scan.
- Frozen scale contract: source-bound association algorithm probe with 100/1k/10k threads and subjects; 5 warmups, 15 samples; old per-subject filter versus one existing-item construction pass. Target p95 <= 5 ms and <= baseline + max(0.05 ms, 10%). Count record visits, prove identical associations including multiple replies and absent subjects. This isolates association work; final Browser remains the full UI correctness gate.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-comments-suggestion-lifecycle-cut.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint and accepted packet recorded before edits. |
| Timed checkpoint parsed | no | N/A: no timebox requested. |
| Skill analysis before edits | yes | Auto, Patch, Best API, Plate UI; docs, changelog, Unslop and agent-native workers applied in their layers. |
| Active goal checked or created | yes | Active phase 1 implementation goal created; previous audit goal already complete. |
| Source of truth read before edits | yes | Completed source audit, current copied owners, package commands, Vision and worker law. |
| Tracker comments and attachments read | no | N/A: local continuation; prior weekly plan inventory and audit already read. |
| Video transcript evidence required | no | N/A: no reporter recording. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Prior full audit and source-backed plan inventory supply existing context; no relevant solution owner supersedes C1. |
| TDD decision before behavior change or bug fix | yes | Exact existing browser handler case made red first; direct owner command tests supplement it. |
| Branch decision for code-changing task | no | N/A: user requires current checkout; next observed mid-task; no branch or worktree changes. |
| Release artifact decision | yes | Copied registry change: generated draft changelog; no package changeset. |
| Browser tool decision for browser surface | yes | In-app Browser plus existing Chromium corpus. No native Chrome/profile/OS requirement. |
| PR expectation decision | no | N/A: no publication requested. |
| Tracker sync expectation decision | no | N/A: no public ticket or tracker. |
| Output budget strategy recorded | yes | Bounded source reads and artifacted logs. Truncated combined reads were recovered with smaller reads. |
| Browser pack selected | yes | Yes: combined Discussion, AI and docs routes. |
| Browser route / app surface identified | yes | /blocks/discussion-demo, /view/editor-ai, /docs and /cn/docs comment/suggestion/discussion. |
| Browser tool decision recorded | yes | Browser for manual visual/action proof; repository Playwright suite for executable replay. |
| Console/network caveat policy recorded | yes | Existing runtime-error recorder remains blocking; no swallowed app compilation errors. |
| Observable browser case captured | yes | comments-suggestion-history; tighten seed + rich reply, add reply, accept/reject, native undo/redo; exact route and fingerprints in accepted packet. |
| Docs pack selected | yes | Yes: four English/Chinese copied API pages plus draft changelog. |
| `docs-creator` loaded | yes | Applied current-state plugin/API teaching rules. |
| Docs lane selected | yes | Incidental source-backed plugin reference update. |
| Target docs and nearest sibling docs read | yes | Comment, Discussion and Suggestion reference pages and copied examples. |
| Docs style doctrine read | yes | Docs Creator and Unslop applied; protected literal samples preserved. |
| Documented source owner identified | yes | Copied comment.tsx target union and private Discussion composition; package Suggestion command owner unchanged. |
| Performance pack selected | yes | Yes: changed subject association law only; complete controller timing remains diagnostic. |
| User-facing operation and runtime owner identified | yes | Show attached replies in Floating Discussion after suggestion membership/history changes; existing Discussion controller owns association. |
| Scale variables and cohorts fixed | yes | 100/1k/10k subjects and threads; multiple/absent subjects and unrelated range rows; one concentrated block is the stress fixture. |
| Budget frozen before target measurement | yes | Algorithm p95 <=5ms and baseline+max(0.05ms,10%); five warmups, 15 samples. No later relaxation. |
| Baseline and target probe selected | yes | association-probe.mjs; old per-card filter against one grouping pass; actual mounted controller count proof follows. |
| Correctness guard selected | yes | Exact associations, rich body retention, explicit resolution, direct commands, history and full existing browser corpus. |
| Production detector decision recorded | no | N/A: local copied reference UI; deterministic source tests and runtime-error recorder, no telemetry/backend. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [ ] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [ ] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Docs pack: every created or edited docs artifact completed the required `unslop` file-edit pass after claims stabilized, with protected literals and technical claims preserved.
- [x] Docs pack: requirement language, when present, separates hard compatibility, layer-specific setup, recommendations, and repo-only implementation details against live owners.
- [x] Performance pack: capture a comparable current-owner receipt before accepting a scale-sensitive target or optimizing an existing path.
- [x] Performance pack: measure the complete user-facing operation and isolate deterministic cost indicators such as iterations, visited units, renders, wakes, listeners, queries, or bytes.
- [x] Performance pack: exercise normal, large, stress, and pathological cohorts where applicable; a single convenient size cannot prove scaling.
- [x] Performance pack: record warm percentiles, cold duration, sample/warmup counts, noise, payload bytes, and deterministic work counters when the harness supports them.
- [x] Performance pack: when the proposed path does not exist, build only the smallest disposable target prototype needed to test the claimed owner and scaling law before architecture acceptance.
- [x] Performance pack: compare current and proposed paths using matched source identity, fixture, action, environment, sampling, and correctness guard.
- [x] Performance pack: inspect query/render/subscription fan-out, result cardinality, pagination, repeated reads, and retained work before adding infrastructure.
- [x] Performance pack: optimize the measured owner; do not add pooling, caches, indexes, projections, stores, or schedulers without evidence that they own the work.
- [x] Performance pack: keep transaction-scoped database work serial unless the transaction owner explicitly supports parallel reads.
- [x] Performance pack: evidence contains no SQL, inputs, headers, credentials, tenant/person identifiers, or protected data.
- [x] Performance pack: add or extend a deterministic regression harness when the changed path lacked one.
- [x] Performance pack: record every budget override with baseline, owner, reason, and expiry; permanent unexplained exceptions are forbidden.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | pending: final unchanged-input receipt. Latest focused typecheck passes; browser behaviors pass 16/16 plus 5/5 history and 5/5 narrow screens, but external-text-runtime.ts changed during proof. Earlier receipts are historical. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | browser-red.log: seeded suggestion reply absent after native Undo on baseline source. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | tests-final.log: 24 pass, 268 assertions; browser-receipt.log: 16 plus 5 pass. |
| TypeScript or typed config changed | yes | Run relevant typecheck | pending: final unchanged-input receipt. Latest focused typecheck passes; browser behaviors pass 16/16 plus 5/5 history and 5/5 narrow screens, but external-text-runtime.ts changed during proof. Earlier receipts are historical. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package export/layout changes in this packet; copied private component relocation needs no brl. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | pnpm install passed for doctrine sync. Concurrent dependency edits were retained; plitejs build refreshed required type declarations. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | install.log, Codex/Claude Best API rule parity and doctrine-current.log pass at v143. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in /Users/zbeyens/git/plate-2 or its www package; receipt binds explicit localhost:3000 and server PID. |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | Manual Browser inspected the combined review card and native Undo; existing browser suite checks affected routes. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | pending: final unchanged-input receipt. Latest focused typecheck passes; browser behaviors pass 16/16 plus 5/5 history and 5/5 narrow screens, but external-text-runtime.ts changed during proof. Earlier receipts are historical. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template source/output edited by this packet. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A for package changeset: changed API is copied registry source. Draft registry changelog generated. |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | Canonical registry changelog entry and generated JSON; changelog --write and --check passed. The current registry owner supersedes the generic old docs/components/changelog instruction. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Four EN/CN source-backed pages; prose-audit.json has zero findings; docs-build.log passes; leaf routes rendered in browser corpus. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: reply loss through document history. Exclusive target and retained app records remove the duplicate lifecycle; exact handler RED, direct command/history and browser proofs cover it. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | review.md parity map: existing route, source owner, generated mirrors, executable proof and public docs agree; no action/authority changes. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: missing registry during regeneration and stale built declarations were diagnosed as host/build inputs. No React corruption signal; no destructive reinstall. |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: AGENTS explicitly prohibits autoreview on next. Current source review recorded in review.md. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: not requested; no Git publication. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR or external upload. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: local request, no external message authority. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Local phase 1 outcome, exact tests, current type caveat, remaining phases and no publication are recorded below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | lint-current.log: scoped ultracite check passes for all 11 changed code/test/consumer roots. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Logs artifacted and source reads scoped. Two overlarge combined reads were truncated, then reduced; no secrets printed. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-comments-suggestion-lifecycle-cut.md` | pending: final unchanged-input receipt. Latest focused typecheck passes; browser behaviors pass 16/16 plus 5/5 history and 5/5 narrow screens, but external-text-runtime.ts changed during proof. Earlier receipts are historical. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Fresh Browser page at /blocks/discussion-demo: Accept removed seeded reply; native Undo restored Charlie rich reply with editor focus retained. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Existing app runtime-error guard passes in final 16+5 replay; earlier generated-registry error was rejected, repaired and replayed. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | pending: final unchanged-input receipt. Latest focused typecheck passes; browser behaviors pass 16/16 plus 5/5 history and 5/5 narrow screens, but external-text-runtime.ts changed during proof. Earlier receipts are historical. |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | pending: final unchanged-input receipt. Latest focused typecheck passes; browser behaviors pass 16/16 plus 5/5 history and 5/5 narrow screens, but external-text-runtime.ts changed during proof. Earlier receipts are historical. |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | pending: final unchanged-input receipt. Latest focused typecheck passes; browser behaviors pass 16/16 plus 5/5 history and 5/5 narrow screens, but external-text-runtime.ts changed during proof. Earlier receipts are historical. |
| Clean final runtime | no | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A for pushed-tree certification: local, uncommitted, unpushed. Fresh task-owned server plus immutable input receipt supports local source only. |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | pending: final unchanged-input receipt. Latest focused typecheck passes; browser behaviors pass 16/16 plus 5/5 history and 5/5 narrow screens, but external-text-runtime.ts changed during proof. Earlier receipts are historical. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | CommentTarget, channel.createThread, DiscussionSlots and existing Suggestion commands traced to current owners; stale rejected names absent from runtime/docs/affected worker rules. |
| Required Unslop pass | yes | Run `unslop` in file-edit mode on every created or edited docs artifact; name each file and confirm protected literal content and claims survived | Four EN/CN docs, draft changelog, changed Vision paragraph, review and final plan prose checked in file-edit mode. Already-clear prose retained; code and links protected. |
| Requirements disclosure | yes | Classify requirement claims against package, copied-source, runtime, or build owners, or record N/A | Copied channel is an in-memory application example; package commands own document changes. No backend/persistence guarantee added. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | English/Chinese Comment, Suggestion and Discussion leaves render in final browser corpus; Discussion demo and install IDs exist. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | docs-build.log: pnpm --filter www build:source passes. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Docs Creator kit/manual/API guidance applied; example uses the same Comments plugin and Suggestion kit consumed by Discussion. |
| Pre-acceptance scale proof | yes | Before accepting a scale-sensitive API/architecture, record the executable current-versus-target comparison across applicable cohorts, frozen budget, deterministic cost, timing/noise, source identities, and correctness result | association-probe.json: all 100/1k/10k cohorts pass the frozen algorithm budget with identical associations and matched input construction. |
| Warm latency budget | yes | Prove the changed operation stays within its warm percentile budget using the owning harness | Changed association algorithm passes <=5ms at all cohorts; 10k isolated p95 1.563ms. Whole-controller timing is explicitly outside this isolated budget and remains slow. |
| Large/stress scaling | yes | Prove cost stays within the declared growth/budget across applicable large, stress, and pathological cohorts | 10k subject association visits 10k records rather than 100m; actual production controller adds one reply with 10001 reads and body edit with zero. |
| Cold and failure paths | yes | Measure cold behavior and prove failure handling remains owned; do not classify no traffic as healthy | discussion-scale.json records actual cold controller mounts; owner tests cover absent/restored subjects and explicit resolution without losing records. |
| Payload and fan-out | yes | Record payload bytes plus query/render/subscription/cardinality evidence; add bounded reads or work only when the measured owner needs them | No network/SQL payload. Channel list identity and per-thread subscriptions retained; grouping runs once per visible membership change. |
| Production-path rerun | yes | After implementation, rerun the same cohort/budget contract on the final production path and source identity; planning-only work records N/A with the exact future owner and command | tests-final.log reruns actual mounted Discussion at 100/1k/10k on current source; deterministic read counts pass. Card DOM/layout excluded from timing. |
| Correctness guard | yes | Run the selected behavior/native/data-integrity guard on the measured final path | Owner/direct-history tests, exact association equality and full browser corpus pass. |
| Before/after receipt | yes | Record comparable baseline and final evidence, or N/A only when no runtime behavior or cost can change | association-probe.json baseline/target matched algorithm receipt plus discussion-scale.json actual source fingerprints. No full UI speedup claim. |
| Detector and privacy | no | Prove the owning runtime detector covers the changed operation without protected data, or record N/A | N/A for production telemetry: copied in-memory UI; local synthetic Alice/Bob/Charlie fixtures only, no protected data. |
| Performance regression check | yes | Run the deterministic performance harness and relevant checks in the owning workspace | Actual controller scale harness passes with current tests; whole-controller 10k p95 82.9ms remains a reported limitation, not a waived budget. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Accepted audit C1 and first checkpoint | implementation |
| Implementation | complete | Exclusive targets and private Discussion card | verification |
| Verification | blocked | Current behavior/type checks pass; final receipt rejects shared runtime edits during the run | stable framework replay |
| PR / tracker sync | N/A | No publication or external messages requested | final response |
| Closeout | blocked | Third consecutive shared-input blocker; completion is unproven | resume after framework tasks settle |

Findings:
- C1 fixed locally: UI suggestion commands no longer mutate application thread resolution.
- The private combined card belongs in Discussion; no public replacement card API is justified by current consumers.
- Reply association no longer repeats an entire visible-thread scan per suggestion card.
- C2-C7 remain open in the original audit; this packet does not repair shared-editor projection, activation after edits, channel storage or async persistence.

Decisions and tradeoffs:
- Preserve app records when suggestions disappear. The same restored ID restores unresolved replies; explicit user resolution remains authoritative.
- Use one exclusive target. Range comments own anchors; suggestion replies reuse suggestion identity and location.
- Keep grouping inside the existing controller pass; no new store, cache, package, backend or compatibility adapter.
- Keep the current combined Floating Discussion appearance and rich editor body behavior.

Implementation notes:
- Updated copied owners, all current createThread consumers, fixtures, focused owner/browser tests, registry metadata, four EN/CN docs and draft registry changelog.
- Best API and Vision record the general attached-entity law; v143 and generated Codex/Claude mirrors are in sync.
- Product changes are registry-only. This task did not edit package runtime, template source, Git state or public trackers.
- Repository shared compiler/schema work continued in another task. Its source changes and the lockfile were retained.

Review fixes:
- Chose the maximum-value cut: remove the second location and mirrored lifecycle, rather than adding Undo handlers or document-to-app rollback.
- Removed the one-consumer SuggestionReviewCard API instead of creating injection props for profile/header/reply presentation.
- No actionable source-review finding remains in the phase 1 edit. Existing broader findings retain their original scope.
- Autoreview is prohibited on next. See artifacts/comments-suggestion-lifecycle-cut/review.md for source review and agent parity.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Exact suggestion history RED | 1 | Remove duplicated lifecycle | Expected pre-fix missing reply; final 16+5 browser replay passes |
| Default app TSC heap exhausted | 1 | Use 16GB heap | Expanded app check produced real diagnostics |
| Scale harness cold commit assumption and 5s timeout | 2 | Measure real commit count; 60s harness timeout | Product unchanged; actual mounted tests pass; algorithm budget unchanged |
| Generated registry disappeared during final browser replay | 1 | Automatic Regression host repair, fresh server, exact layout probe, full corpus and five repetitions | Runtime guard retained; 16+5 final pass and 50 unchanged inputs |
| Shared compiler export temporarily unavailable | 1 | Preserve concurrent source; wait for export and restart proof | Runtime available; no Comments product edits |
| TSC resolved stale built Plite declarations | 2 | Build current Plite dependency, rerun focused typecheck | plite-declarations-build.log and typecheck-rebuilt.log pass |
| App Yjs test imports missing moved fixture | 1 | Classify outside phase 1; rerun expanded app diagnostic on current bytes | Current app diagnostic recorded separately; no global-green claim |

Verification evidence:
- Previous goal turn classification: progress and verified wait. It cleared the focused type error, replayed the two failed browser cases, ran 24 current owner/scale tests, verified live Browser Undo and polled a confirmed active architecture task for 45 seconds. This turn collected the running proof result and identified the exact external input mutation.
- Current doctrine validation passes at v144; the attached-record paragraph matches source, Codex and Claude mirrors. The original v143 addition remains historical provenance.
- CURRENT STATUS OVERRIDE: blocked on shared input stability, not current behavior/type failures. continuation-owner-scale.log passes 24 tests and 268 assertions; continuation-typecheck-final.log passes. continuation-browser-probe.log passes both prior failing cases. continuation-browser-receipt.log passes 16/16 and then 10/10 repetitions (five history, five narrow-screen), but rejects changed inputs. external-text-runtime.ts changed at 22:09:25 UTC during the replay started at 22:08:25 UTC. Earlier green receipts remain historical, not current completion authority.
- Root cwd: /Users/zbeyens/git/plate-2. Product base: a6afd55c30e97c74fe895d1ad005ca75413110f3, local uncommitted/unpushed input hashes in final-source.json.
- tests-final.log: `bun test packages/platejs/src/react/features/comments/CommentsPlugin.spec.tsx apps/www/src/registry/components/editor/comment.spec.tsx apps/www/src/registry/components/editor/discussion.spec.tsx docs/plans/artifacts/comments-suggestion-lifecycle-cut/discussion-scale.test.tsx` -> 24 pass, 268 assertions.
- browser-receipt.log: final-browser-proof.py http://localhost:3000 runs the entire comment.spec.ts corpus and five fresh suggestion history cases -> 16 + 5 pass, zero retries. Host PID 12630, started 21:39:32 UTC. Proof 21:42:10-21:43:18 UTC; 50 inputs unchanged; digest sha256:d5bfdf0952729952b88dd5cbeb4f719db4884b216e5e0e8e959605c2a2e79a57.
- Receipt ID: sha256:3a40e0bb7b8d009193a45ce337b9332b181a64d3579b7f697f19a4fbc279ba75. final-source.json rechecked the digest after dependency declaration build.
- Browser manual proof: fresh in-app page, second block trigger, Alice tighten suggestion and Charlie rich reply, Accept, native super+z; restored reply and bold text verified, editor focus retained. Inline screenshot inspected after state settled; no invented exported image path.
- typecheck-rebuilt.log: `NODE_OPTIONS=--max-old-space-size=16384 pnpm exec tsc --noEmit -p docs/plans/artifacts/comments-suggestion-lifecycle-cut/tsconfig.json` -> pass. Eleven changed roots plus normal transitive dependencies; no stub, override or suppressed type diagnostic.
- typecheck-app-final.log: whole-app diagnostic remains red in unrelated route types, the generated compiler-provider import, moved Yjs test helper and dev-route jotai-x import. Required task type proof is focused source and transitive dependencies; no whole-app green or current-tree closure is claimed.
- lint-current.log, registry-build.log, registry-source-check.log, changelog-check.log, docs-build.log, install.log and doctrine-current.log pass. Current doctrine v143. No package changeset/brl applies.
- association-probe.json: 100/1k/10k matched algorithm comparison passes absolute and relative budgets, same associations, five warmups/15 samples. At 10k: 100m -> 10k visits, isolated p95 2581.3 -> 1.563ms.
- discussion-scale.json: final actual mounted controller visits N+1 records on reply membership and zero on body edit. 10k cold 197.1ms and render p95 82.9ms exclude card DOM/layout. No frame-budget or full-UI speedup claim.
- review.md and prose-audit.json record source, docs, Unslop and agent-native review. Zero rejected API names remain in current runtime/docs/affected worker rules.
- Methodology decision: repair-now for shared proof-host interruption. Generated inputs and compiler exports were diagnosed on frozen Comments bytes; the unchanged exact layout oracle passed before full final replay. No product failed-fix attempt or new runtime compensation was fabricated.

Final handoff contract:
- Current caveat overrides earlier green summary: implementation, focused types and browser behaviors pass; final verification is blocked because shared inputs change during the run. Do not claim phase 1 completed or clean until a final unchanged-input receipt passes.
- PR line: N/A: local changes only; no commit, push or PR.
- Issue / tracker line: N/A: no public ticket or external message.
- Confidence line: high for phase 1 lifecycle and copied API; broader audit findings remain open.
- Flow table:
  - Reproduced: original UI handler loses seeded reply after Undo, browser-red.log.
  - Verified: 24 owner/scale tests; 16 browser cases plus five history repetitions; manual Browser; focused typecheck/lint and registry/docs/doctrine checks.
- Browser check: final explicit localhost host, fresh pages, runtime-error guard and 50-file receipt.
- Outcome: suggestion replies use subject identity and survive document history without changing explicit app resolution.
- Caveat: this is phase 1 only; current whole-app diagnostic is recorded separately; complete controller scale still exceeds a frame budget at 10k.
- Design:
  - Chosen boundary: Suggestion owns the document; app channel owns messages/resolution; Discussion combines them.
  - Why not quick patch: compensating Undo or repeated resolve calls retain two conflicting lifecycle owners.
  - Why not broader change: projection, activation, storage and persistence have independent accepted audit findings and later phases.
- Verified: source-only local proof; no integration, release, packed install or deployed claim.
- PR body verified: N/A: no PR.

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: N/A: not requested.
- Issue / tracker: N/A: no public source ticket.
- Browser proof: 16-case final corpus + five retry-free history runs and manual in-app Browser.
- Caveats: phase 1 only; other concurrent framework edits and app diagnostics are not certified by this packet.

Timeline:
- 2026-09-04T21:08:54Z Created accepted phase 1 plan and recorded the scope before implementation.
- 2026-09-04T21:11:52Z Captured exact missing reply RED after native Undo.
- 2026-09-04T21:23:20Z Completed owning copied-source cut and focused behavior proof.
- 2026-09-04T21:25:23Z Generated registry/changelog/skills and validated doctrine v143.
- 2026-09-04T21:34:26Z Rejected browser final run after generated registry interruption; kept product bytes frozen.
- 2026-09-04T21:39:32Z Restarted own server; exact failed layout case passed after shared schema export became available.
- 2026-09-04T21:43:18Z Final full corpus and five history runs passed with unchanged source/generated inputs.
- 2026-09-04 Rebuilt stale dependency declarations; final owner/scale, focused type and lint proof passed.

Reboot status:
- Active final-verification goal replaced the prematurely completed implementation goal. Blocked audit: turn 1 discovered repeated shared source changes and later browser/type failures; turn 2 cleared those failures and ran the 56-input replay while shared tasks stayed active; turn 3 collected that replay, confirmed another input change and revalidated both task handles as active. The same external-state blocker has now persisted across three consecutive goal turns.
- Resume after archi (01a06de0-87c4-79b2-8ffb-d4f5feab42a6) and Audit code-block external-text plans (01a06de3-3bd0-7e10-8609-a915d78617dd) settle. Inspect their current handles first; do not restart a live process because an observation timed out. The own server is session 34814 / PID 38118. Rerun focused types and final-browser-proof.py under capture-proof-receipt with the same 56 inputs; it runs all 16 cases plus five history and five narrow-screen repetitions. Keep product bytes unchanged unless a stable exact replay proves an owning defect. Guard goal completion on successful commands, a matching current input digest and check-complete.
| Question | Answer |
|----------|--------|
| Where am I? | Phase 1 implementation retained; goal blocked after three shared-input turns |
| Where am I going? | Current type and exact browser replay, then guarded completion |
| What is the goal? | One suggestion reply lifecycle with retained rich records through history |
| What have I learned? | Duplicate app resolution caused history loss; shared build changes can invalidate a browser run |
| What have I done? | Owning source cut, consumers/docs/generation, red/green/stability and final source receipt |

Open risks:
- Required final receipt is not valid for a single current input state. The latest transitive typecheck and all browser behavior/stability assertions pass; shared runtime edits invalidate certification.
- C2-C7 in the original audit remain outside this phase.
- Full controller work at 10k is still slow; the association loop improvement is not a complete UI performance claim.
- API is intentionally breaking for copied source consumers; current repo callers and docs are migrated, external copied applications are not changed.
- Any later shared input change invalidates the corresponding captured receipt for that new input set. No pushed/hosted proof exists.
- Earlier whole-app diagnostics failed in unrelated route/compiler/Yjs/dev fixtures. No current app-wide check or closure is claimed by focused Comments proof.

Applicability notes:
- Final freshness interruption: after the passing 50-input receipt, concurrent work changed packages/platejs/src/lib/editor/withPlite.ts and packages/plitejs/src/create-editor.ts. The original Comments owner hashes remain unchanged. Goal completion was invoked despite the failing freshness command; that completion is revoked and a fresh verification goal is active. Final closeout must guard completion on command exit status and a current receipt.
- N/A: pushed-tree, PR, external tracker, exact native Chrome/profile and OS proof. None was requested; local Browser and Chromium proof is labeled explicitly.
- N/A: a new pixel-classifier claim. This phase fixes suggestion reply history, not a reported paint defect. Existing layout, overlap and paint checks remain in the replayed corpus; no pixel-level preservation claim is inferred from a screenshot alone.
- N/A: full-route latency, database transactions, payload bytes and production telemetry. The frozen performance contract covers subject association; the actual controller count proof and separately reported render timings do not claim card DOM/layout or complete route speed.
