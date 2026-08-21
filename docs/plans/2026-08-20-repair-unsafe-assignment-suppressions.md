# repair unsafe assignment suppressions

Objective:
Resolve the `typescript/no-unsafe-assignment` suppression category; done when
all 134 file-header occurrences are audited, safe repairs are applied, remaining
owners are classified, and `pnpm check` passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-20-repair-unsafe-assignment-suppressions.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user continuation
- id / link: current Codex task
- title: repair the next Oxlint category without weakening correctness policy
- acceptance criteria: work one rule category at a time; ignore diagnostic
  volume as a policy reason; for each occurrence choose the best durable fix,
  exact inline/file ownership, structural pattern, or global policy; never
  introduce a regression merely to satisfy lint; keep risky cases for a later
  phase; run full CI-equivalent verification before completion.

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
- initial confidence score: N/A: completion uses exact occurrence accounting
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Every baseline file-header occurrence of
  `typescript/no-unsafe-assignment` is classified as safe code repair,
  narrow local exception, structural path condition, or genuine whole-file
  boundary.
- All safe code repairs and scope narrowings are applied; any risky or
  assertion-laundering rewrite is rejected and recorded instead of forced.
- The rule stays enabled in production. No global disable is added because the
  rule remains a correctness owner.
- Final occurrence counts, files changed, retained owners, and rejected fixes
  are recorded.
- Targeted Oxlint/typecheck, `pnpm lint:fix`, full `pnpm check`, and P1
  autoreview pass with zero accepted findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-repair-unsafe-assignment-suppressions.md` passes.

Verification surface:
- Exact source audit of all `typescript/no-unsafe-assignment` file headers and
  any remaining local directives.
- Targeted Oxlint and source-first typecheck for every changed owner.
- `pnpm lint:fix`, full `pnpm check`, config structure check, and P1 local
  exact-slice autoreview.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Diagnostic volume is never a reason to disable a correctness rule.
- Do not invent types, wrappers, assertions, casts, validators, or production
  APIs whose only purpose is hiding an unvalidated value.
- Preserve runtime, serialized-data, editor, test, package, and browser
  behavior.
- Work only this rule category; do not silently repair the other unsafe rules.

Boundaries:
- Source of truth: current 134 file-header occurrences, effective Oxlint
  diagnostics after temporarily removing each suppression, installed dependency
  declarations, nearby type owners, and the Ultracite migration rule policy.
- Allowed edit scope: files currently suppressing
  `typescript/no-unsafe-assignment`, their direct internal type owners,
  `oxlint.config.ts` only if a proven structural pattern is missing, the
  classification ledger, and this goal plan.
- Browser surface: N/A by design: this packet permits type/exception ownership
  repairs only and rejects runtime behavior changes.
- Browser strategy: N/A. If a proposed fix changes rendered/runtime behavior,
  reject it from this packet or add the browser pack before implementation.
- Tracker sync: N/A: direct local request.
- Non-goals: globally disabling unsafe assignment, broadening test unsafe
  exceptions, fixing unsafe argument/call/member/return categories, public API
  redesign, behavioral refactors, commits, pushes, or PR creation.

Output budget strategy:
- Count and list filenames first. Save the 134-row classification ledger under
  `docs/plans/artifacts/2026-08-20-repair-unsafe-assignment-suppressions/` and
  inspect capped owner batches rather than streaming full lint output.

Blocked condition:
- Stop only if a value cannot be typed or validated without changing a public
  or runtime contract, and every narrower honest exception shape has been
  evaluated. Retain and record that owner rather than forcing a risky fix.

Task state:
- task_type: ordered lint-debt repair batch
- task_complexity: normal non-trivial
- current_phase: verification
- current_phase_status: in_progress
- next_phase: closeout
- goal_status: active

Current verdict:
- verdict: valid; `no-unsafe-assignment` remains valuable, so repair ownership
  instead of changing global policy
- confidence: 95% before detailed occurrence classification
- next owner: task
- reason: the rule catches erased-value propagation; only source and dependency
  evidence can distinguish real debt from upstream or generated boundaries

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-repair-unsafe-assignment-suppressions.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | one-category scope, regression choice, no volume rationale, risky deferral, and full-check requirement recorded above |
| Timed checkpoint parsed | no | N/A: none requested |
| Skill analysis before edits | yes | task, autogoal, migrate-to-ultracite, migration playbook, and rule policy read |
| Active goal checked or created | yes | prior goal absent; this plan is the static shell for the new goal |
| Source of truth read before edits | yes | prior final audit established 134 file-header occurrences; exact ledger is the first implementation input |
| Tracker comments and attachments read | no | N/A: no tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: current lint diagnostics and installed types are the direct owners |
| TDD decision before behavior change or bug fix | no | N/A: behavior changes are forbidden; typecheck and lint own proof |
| Branch decision for code-changing task | no | N/A: user authorized the current checkout; no PR requested |
| Release artifact decision | no | N/A: packet forbids public API/runtime behavior changes; revisit if scope changes |
| Browser tool decision for browser surface | no | N/A: type/exception ownership only |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | file ledger plus capped owner batches recorded above |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
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
      N/A: no video.
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
      Run `pnpm run reinstall` once only for documented install-corruption
      signals; otherwise fix the real diagnostic.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk is assertion laundering; the ledger, typecheck,
      full check, and P1 review own it.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
      Review the exact files changed by this category, isolated from the larger
      migration diff.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent source changes.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context. One dev-server shutdown emitted a truncated 753k-token backlog;
      it is recorded below and was not repeated.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | 134 rows, 602 diagnostics, 101 retained, 33 resolved, zero pending; `pnpm check` passed |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: lint-debt classification; removed-header Oxlint run was the red oracle |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | focused lint and typechecks passed; full tests passed |
| TypeScript or typed config changed | yes | Run relevant typecheck | core 10/10, package group 38/38, www/depset 61/61, full 60-package typecheck passed |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exports or file layout changed |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest, lockfile, or install change |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent source changed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | all commands ran in `/Users/zbeyens/git/plate-2`; package/app filters named above |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | attempted `/blocks/code-drawing-demo` and `/docs`; both blocked before render by stale CI-owned registry imports |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: type-only packet; attempted proof was blocked before render by unrelated generated output, with exact caveat recorded |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output changed |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: type/lint ownership only; no runtime or public API behavior changed |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: only callback and fixture type declarations changed |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: internal goal plan and ledger only |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | risky generic/runtime rewrites were deferred; full check and exact ledger own the safe subset |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent-action source changed |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install-corruption signal |
| P1 autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | isolated one-pass P1 review reported one unrelated pre-existing `path` API migration finding and explicitly no other P0/P1; rejected as outside this lint category |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR requested |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: direct local task |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | completed below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` and final `pnpm check` passed |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | one truncated dev-server backlog recorded; later commands remained capped |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-repair-unsafe-assignment-suppressions.md` | completion checker passes after final status update |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | 134-row baseline ledger and installed owner types read | implementation |
| Implementation | complete | 33 file owners repaired or eliminated; 101 risky owners classified and retained exactly | verification |
| Verification | complete | full `pnpm check` passed; P1 review had zero accepted in-scope findings | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested | final response |
| Closeout | complete | final counts, proof, review verdict, and caveats recorded | final response |

Findings:
- Baseline is exactly 134 files with a file-header
  `typescript/no-unsafe-assignment` suppression.
- The largest owners are `apps/www/src` (38), `packages/core/src` (34),
  `packages/plite/src` (26), `packages/plite-react/src` (7), and
  `packages/yjs/src` (5). The remaining 24 span config, tooling, scripts, and
  smaller packages.
- Oxlint has no CLI switch to ignore suppression directives. The honest
  diagnostic inventory therefore starts by mechanically removing only this
  rule from every affected header, then running the rule over the exact 134
  files.
- Turbowatch's published dependency types are valid, but Oxlint treated the
  imported `globSync` result as `any` and contaminated the entire config. A
  typed Node directory read preserves the same one-level package discovery and
  removes all five unsafe-rule suppressions from the file.
- Removing the 134 headers exposed 602 assignments. Repairs removed or
  structurally owned 183 diagnostics across 33 files. The remaining 419
  diagnostics belong to 101 exact files and are deferred in the ledger by
  runtime owner, not by count.
- Classic JSX fixtures were the largest fake propagation source: their
  expressions compile as erased JSX values despite returning editor arrays.
  Declaring the owning exports as `Value` removed 123 consumer diagnostics
  without adding casts or wrappers.
- Fumadocs source regeneration restored generated collection declarations and
  made three old generated-boundary suppressions obsolete; all were removed.

Decisions and tradeoffs:
- Keep `typescript/no-unsafe-assignment` enabled globally because it catches
  erased-value propagation. High occurrence count is debt evidence, not a
  negative-sum rule premise.
- Remove the category suppression everywhere first. This exposes the actual
  assignment sites without changing runtime code and gives every later repair
  a red-capable lint oracle.

Implementation notes:
- First boundary batch: added a structural Next config override backed by
  Next's declared `(config: any) => any` callback; repaired the local workspace
  source-entry declaration; replaced Turbowatch's glob call with typed Node
  directory discovery; retained Bun's explicit test-bootstrap owner; narrowed
  the CLI evaluation exception to its dynamic-import line.
- Removed an unnecessary `Link as any` component cast and replaced the obsolete
  Node `Global` augmentation with the actual `globalThis` variable contract.
- Replaced overbroad casts in screenshot paths and syntax themes, and typed the
  hotkey dictionaries so dynamic lookup no longer erases values.
- Typed classic JSX fixture exports at their source, repaired the diff
  generator's `any` return channel, narrowed Gray Matter and JSON inputs through
  `unknown`, typed external file-picker callbacks, and validated untyped CLI
  prompt responses with the existing Zod owner.
- Replaced the dynamic card component union with explicit `Link` and `div`
  branches after www typecheck proved the inferred union unsound.
- Retained exact file headers for 101 risky owners: schema-generic editor
  kernels, plugin renderers, collaboration codecs, cross-realm benchmark data,
  untyped AST/virtual-DOM dependencies, generated app data, and unvalidated
  request JSON. No directory-wide or global exception was added.

Review fixes:
- Rejected one isolated-review P1 about removal of the public `path` prop. That
  architectural change predates this category; this packet only narrowed HTML
  attribute casts in the same file. The reviewer explicitly found no other
  P0/P1 issue in the isolated bundle.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| One 134-file patch exceeded the patch channel | 1 | Apply the same mechanical edit in 20-file batches | All category headers were removed without source-code mutation |
| Generated patch mixed a stderr count into its terminator | 1 | Emit patch text on stdout only | Batched patch applied |
| Final removal batch treated `rg` no-match as an exception | 1 | Verify the zero count directly | Zero category headers confirmed; prior batches remained applied |
| Ledger pipeline used stdin for both JSON and the Node program | 1 | Pass the Node program with `-e` | 134-row ledger created |
| Core typecheck exposed `apple && fn` as a string-or-function union | 1 | Use an explicit conditional producing function or undefined | Hotkey behavior preserved and types narrowed |
| Combined code/plan patch used a stale plan context | 1 | Patch the code and error ledger separately | No partial edit; hotkey fix applied |
| First generator-type repair exposed optional proxy characters in diff code | 1 | Represent both proxy characters as one nullable object | Ordering and runtime behavior preserved; diff typecheck passed |
| Two generated fixture patches used incomplete lines or out-of-order hunks | 2 | Generate full-line hunks sorted by source position | All 76 fixture declarations were patched atomically |
| `InitialValue` was too broad for fragment fixtures | 1 | Use the precise array owner `Value` | www typecheck reduced to one readonly test annotation, then passed |
| In-app Browser could not compile app routes | 2 | Retry a fresh tab and a docs route, then record the source blocker | Both routes were blocked by stale `src/__registry__/index.tsx` imports and pre-existing client-page metadata errors; local `build:registry` is CI-only and was not run |
| Dev-server shutdown flushed a very large buffered compiler log | 1 | Keep the caveat from Browser logs and avoid another server-output poll | Output was truncated automatically; no retry |
| First full check ran after Browser dev mode rewrote Fumadocs declarations | 1 | Regenerate normal `.source` declarations, rerun lint, then restart the full check | `pnpm --filter www build:source`, `pnpm lint`, and the second full check passed |
| Whole-checkout autoreview exceeded its eight-pass cap | 1 | Build an isolated git snapshot for this category's actual files | Isolated review fit one pass |
| First isolated snapshot included all current files as additions | 1 | Seed tracked files from `HEAD` before copying current category files | Final bundle shrank to 247,197 bytes and one pass |
| Final plan-only Oxfmt check matched no files because plan artifacts are ignored | 1 | Use the autogoal completion checker as the owning plan validation | Completion checker passed |

Verification evidence:
- `pnpm lint:fix` passed; Ultracite formatted 4,165 files and
  `check-oxlint-config.mjs` passed with 169 root rules and 167 selector/rule
  pairs.
- `pnpm turbo typecheck --filter=@platejs/core` passed 10/10 tasks.
- `pnpm turbo typecheck --filter=@platejs/diff --filter=@platejs/markdown
  --filter=platejs` passed 38/38 tasks.
- `pnpm turbo typecheck --filter=www --filter=depset` passed 61/61 tasks.
- Effective Oxlint over every ledger file passes with warnings denied.
- Full `pnpm check` passed: lint/config, 60 package builds/typechecks, 3,242
  fast tests, 1,529 slow tests with 60 skips, and the slowest-suite gate.
- P1 isolated autoreview command used the project helper with
  `--mode local --max-priority P1`; its only finding was rejected as unrelated
  pre-existing API migration work in `plate-nodes.tsx`.
- Browser proof is blocked before render by stale CI-owned registry index
  imports and existing registry page metadata errors unrelated to this packet.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct local task
- Confidence line: 95%; static and test proof are green, Browser is blocked by unrelated generated output
- Flow table:
  - Reproduced: 602 diagnostics across 134 suppressed files
  - Verified: full check green; Browser blocked before render by unrelated output
- Browser check: blocked before render by stale CI-owned registry output; exact
  missing-module and client-metadata errors recorded above
- Outcome: 33 owners resolved; 101 risky owners retained exactly; global rule stays enabled
- Caveat: Browser proof unavailable and 101 deferred owners remain for behavior-proven phases
- Design:
  - Chosen boundary: source types/validation for safe cases, exact file headers for risky generic owners
  - Why not quick patch: casts and wrappers would hide rather than type erased values
  - Why not broader change: global or directory disables would hide unrelated regressions
- Verified: lint, focused typechecks, full check, exact ledger audit, P1 review
- PR body verified: N/A: no PR

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
- PR: N/A: no PR requested
- Issue / tracker: N/A: direct local task
- Browser proof: blocked by stale CI-owned registry imports and pre-existing client metadata exports
- Caveats: 101 exact deferred file owners remain; one unrelated P1 API migration finding rejected

Timeline:
- 2026-08-20T12:43:13.696Z Task goal plan created.
- 2026-08-20T12:48:00Z Confirmed 134 affected files and recorded owner groups;
  selected remove-then-diagnose as the category oracle.
- 2026-08-20T13:26:00Z Completed the 134-row ledger, passed lint/config and
  focused typechecks, and recorded the Browser blocker before full check.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Verification |
| Where am I going? | Full check, P1 autoreview, closeout |
| What is the goal? | Resolve every baseline unsafe-assignment header without weakening global policy |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- The 101 retained owners still need behavior-proven contract repair in later
  phases. Their exact paths and reasons are in the ledger.
- Browser rendering remains blocked by stale CI-owned registry output; this
  task did not run the forbidden local registry build.
