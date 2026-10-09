# Fix plugin rules demo crash

Objective:
Fix the crashing /docs/plugin-rules demo (void hr with empty children) and guard every demo value against empty-children elements; open the PR.

Goal plan:
docs/plans/2026-10-09-fix-plugin-rules-demo-crash.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)

Task source:
- type: user report (chat), no tracker
- id / link: https://platejs.org/cn/docs/plugin-rules (also /docs/plugin-rules)
- title: Plugin rules docs demo stuck on "Loading..."
- exact PR ownership: https://github.com/udecode/plate/pull/5154 (#5154); this task invocation owns only that PR.
- acceptance criteria: plugin-rules demo renders without runtime error; demo values contain no element with empty `children`; regression test fails before and passes after; PR opened.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: outcome-based
- initial confidence score: 90%; prod stack trace pins slate-react void render
- improvement loop: N/A: single fix slice
- final score / loop closure: 97%; red/green test + browser before/after

Completion threshold:
- `demo-values.spec.tsx` empty-children guard green; `/blocks/plugin-rules-demo` and `/blocks/code-block-demo` render with no page errors; registry changelog generated and `--check` passes; `pnpm check` run; PR opened with task-style body.
- If a PR is created or updated, this exact task plan exists at the PR head,
  identifies that exact PR, and the PR body names it exactly once.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-10-09-fix-plugin-rules-demo-crash.md` passes.

Verification surface:
- `bun test apps/www/src/registry/examples/values/demo-values.spec.tsx` (cwd repo root); dev-browser headless on local `apps/www` dev server; `node tooling/scripts/generate-ui-changelog-entries.mjs --check`; `pnpm check`; `gh pr view --json body`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user report + production console stack on platejs.org.
- Allowed edit scope: `apps/www/src/registry/examples/values/**`, its spec, registry changelog entry + generated JSON, this plan.
- Browser surface: `/blocks/plugin-rules-demo`, `/blocks/code-block-demo`.
- Tracker sync: N/A: no tracker item.
- Non-goals: restoring implicit initial-value normalization in core/NodeIdPlugin (separate decision, see caveat).

Output budget strategy:
- Scoped greps to values/registry/core init; logs (build, dev, check) saved to session scratchpad, tailed only.

Blocked condition:
- Stop if local env cannot render the demo route after one env repair attempt, or GitHub push/PR access fails.

Task state:
- task_type: bug-fix
- task_complexity: trivial-to-small (demo data + guard test)
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: active

Current verdict:
- verdict: valid, reproduced
- confidence: 97%
- next owner: task
- reason: `<element type="hr" />` builds a void with `children: []`; slate-react void render does `const [[text]] = Node.texts(element)` and throws. Since 68560ccc9e NodeIdPlugin assigns initial ids as a pure value transform (no `setNodes` ops), so Slate no longer normalizes the invalid node before render.

Pre-solution issue challenge:
- reporter claim: /cn/docs/plugin-rules is broken.
- suggested diagnosis or fix: none.
- repro ladder:
  - tests / source-level repro: new spec lists `plugin-rules [20] hr` and 5 `code-block` `code_line`s with empty children (red).
  - Playwright / automated browser: N/A: no repo harness for this demo.
  - Browser plugin: Claude in Chrome on prod: `TypeError: undefined is not iterable`, demo stuck on Loading; Chrome could not reach localhost, so dev-browser (repo `dev-browser` skill) used locally: plugin-rules editor absent + destructure error before fix; code-block blank lines 0px with no text node before fix.
  - screenshot / visual proof: dev-browser screenshots saved locally; DOM assertions are authoritative.
- reproduction verdict: reproduced on main 6f3815d465 and prod
- validity verdict: valid
- best long-term fix boundary: demo data must be valid Slate (every element has >=1 child) + spec guarding all demo values; Slate contract does not normalize initial values.
- harsh honest feedback: the demo shipped invalid data and only worked because NodeIdPlugin accidentally normalized it.
- hard-stop decision: proceed

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-10-09-fix-plugin-rules-demo-crash.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | task, autogoal, registry-changelog, dev-browser read |
| Active goal checked or created | yes | this plan; no prior goal |
| Source of truth read before edits | yes | prod page + console stack, plugin-rules-value, NodeIdPlugin history, slate-react void render |
| Tracker comments and attachments read | no | N/A: chat report, no tracker |
| Video transcript evidence required | no | N/A: no video |
| Pre-solution issue challenge required | yes | valid; see Pre-solution issue challenge |
| Reproduction verdict before implementation | yes | prod console TypeError + local dev-browser repro before fix |
| Repro escalation ladder selected | yes | spec red, browser prod + local |
| Suggested fix reviewed against durable boundary | yes | no suggested fix; data validity + guard spec chosen |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: trivial demo data fix |
| TDD decision before behavior change or bug fix | yes | guard spec written, red with 6 empty elements, then data fixed |
| Branch decision for code-changing task | yes | codex/fix-plugin-rules-demo-hr from main |
| Release artifact decision | yes | registry changelog only; no package change |
| Browser tool decision for browser surface | yes | Claude in Chrome for prod; dev-browser for localhost (Chrome could not reach localhost) |
| PR expectation decision | yes | user asked to open PR |
| Dedicated task plan selected for exact PR | yes | this plan owns #5154 only |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | logs in scratchpad, tailed |
| Browser pack selected | yes | --with browser |
| Browser route / app surface identified | yes | /blocks/plugin-rules-demo, /blocks/code-block-demo |
| Browser tool decision recorded | yes | dev-browser headless |
| Console/network caveat policy recorded | yes | pageerror + console.error captured; network out of scope |
| Registry changelog pack selected | yes | --with registry-changelog |
| User-visible registry impact classified | yes | plugin-rules-demo and code-block-demo example values change |
| Source entry path selected | yes | apps/www/src/registry/changelog/entries/2026-10-09-fix-empty-demo-elements.mdx |
| Generator command selected | yes | --new, manual edit, --write, --check |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless N/A: no duration.
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized N/A: no video.
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] For public tracker bug reports, behavior claims, technical diagnoses, or
      suggested fixes, reporter claims are challenged before implementation
      with a recorded verdict: `valid`, `not reproduced`, `invalid`,
      `wont-fix`, `partially valid`, or `platform limitation`. Feature, docs,
      support, or cleanup requests with no bug claim may mark reproduction
      `N/A` with reason.
- [x] Repro escalation ladder followed for bug/behavior claims: focused
      test/source-level repro first when applicable; existing repo-owned
      Playwright regression/test harness next when available and useful as
      executable coverage; do not use standalone Playwright, Puppeteer, or raw
      DevTools as a substitute for the repo Browser policy;
      `[@Browser](plugin://browser@openai-bundled)` next when tests or
      Playwright cannot reproduce or cannot model the surface honestly;
      screenshot or explicit visual-proof waiver when visual/native state
      matters.
- [x] Hard-stop rule followed for bug/behavior claims: no code when the issue
      is not reproduced, invalid, or won't-fix; partial validity pivots to the
      best long-term fix and records what was wrong or incomplete in the issue's
      proposed path.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Every PR has its own `task` invocation and dedicated plan; this plan is
      not aggregate evidence for another PR.
- [x] If a PR exists, its body has exactly one
      `🧭 Task plan: docs/plans/<plan>.md` line, this file exists at the exact PR
      head, and this plan records that exact PR number or URL.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary, N/A: demo data + test only.
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial N/A: trivial fix.
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`, N/A: no agent/tooling change.
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.
- [x] Registry changelog pack: user-visible registry impact is recorded.
- [x] Registry changelog pack: source entry exists under `apps/www/src/registry/changelog/entries/*.mdx` or N/A reason is recorded.
- [x] Registry changelog pack: entry frontmatter follows the contract in `.agents/skills/registry-changelog/SKILL.md`.
- [x] Registry changelog pack: row bullets name real registry item ids in backticks.
- [x] Registry changelog pack: generated `/registry/changelog/*.json`, `index.json`, and `components.json` are updated by the generator, not by hand.
- [x] Registry changelog pack: package changeset decision is separate when package code also changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | spec green, browser proof, changelog --check, pnpm check EXIT 0 |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | valid, recorded above |
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | spec red; prod + local browser repro |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | spec listed 6 empty elements; local plugin-rules editor absent + destructure error; code lines 0px |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | bun test demo-values.spec.tsx: 2 pass |
| TypeScript or typed config changed | yes | Run relevant typecheck | pnpm check typecheck passed (clean worktree) |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package change |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | repo root bun test; apps/www dev server; clean worktree pnpm check |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | dev-browser proof on both demo routes |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | DOM assertions + local screenshots; no page errors |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: templates untouched |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: www registry only, no changeset |
| User-visible registry output changed | yes | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | entry added, --write and --check run |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for supporting public docs/content/API/example changes, load `docs-creator` and close the docs pack; for typo/link-only edits, record the explicit reason and proportional proof | N/A: no content/** change |
| High-risk mini gate | no | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | N/A: demo data + test only |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling change |
| Local install corruption suspected | yes | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | stale package dist + untracked local dirs broke local tests/lint; rebuilt packages, ran pnpm check in clean worktree instead of reinstall |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: trivial demo data fix + guard spec |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | pnpm check EXIT 0 before PR; #5154 opened |
| Per-PR task ownership | yes | Verify one task-plan body line, plan at exact head, and exact PR ownership in this plan | one task-plan line in #5154 body; plan at head names #5154 |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | gh pr view --json body checked |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no images in PR body |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | biome check on changed dirs clean; pnpm check lint passed |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | bounded output |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-10-09-fix-plugin-rules-demo-crash.md` | passes |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | loaded both demos; typed into blank code line |
| Browser console/network check | yes | Record console/network state or why it is not applicable | 0 pageerrors / console errors after fix |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | DOM assertion output recorded in Verification evidence |
| Registry impact classification | yes | Record user-visible registry delta or N/A reason | user-visible example value fix |
| Registry changelog source | yes | Add/update `apps/www/src/registry/changelog/entries/*.mdx` or record N/A | entries/2026-10-09-fix-empty-demo-elements.mdx |
| Registry changelog generation | yes | Run `node tooling/scripts/generate-ui-changelog-entries.mjs --write` when a source entry is required | --write regenerated index.json, components.json, entry json |
| Registry changelog check | yes | Run `node tooling/scripts/generate-ui-changelog-entries.mjs --check` | --check exit 0 |
| Registry generator test | no | If generator/schema/source layout changed, run `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`; otherwise N/A | N/A: generator untouched |
| Registry package release split | yes | Record `.changeset`, registry changelog, both, or N/A with reason | registry changelog only |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | prod stack + source read | implementation |
| Implementation | complete | 08c29e55e8 | verification |
| Verification | complete | spec, browser, changelog, pnpm check | closeout |
| PR / tracker sync | complete | #5154; tracker N/A | final response |
| Closeout | complete | plan gates closed | final response |

Findings:
- `plugin-rules-value.tsx` had `<element type="hr" />` → void with `children: []`.
- slate-react void render `const [[text]] = Node.texts(element)` throws on it (same code in 0.126.4 and 0.127.1).
- Before 68560ccc9e, NodeIdPlugin `normalizeInitialValue` used `setNodes`, dirtying nodes so Slate normalization inserted `{text:''}`. Now ids are a pure value transform; no normalization.
- `code-block-value.tsx` had 5 `<hcodeline />` with empty children; blank lines rendered at 0px.

Decisions and tradeoffs:
- Fix demo data, not core: Slate contract does not normalize initial values; restoring implicit repair in core is a separate perf/behavior decision.
- Guard spec covers DEMO_VALUES plus en/cn i18n values.

Implementation notes:
- Added `<htext />` children; spec `DEMO_VALUES > gives every element at least one child`.

Review fixes:
- N/A: no review findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Local bun tests resolved stale package dist (`@platejs/plite`) | 1 | `pnpm build` | fixed |
| Local dev CSS parse error from Tailwind scanning untracked `apps/www/.next-plite` | 1 | temp `.git/info/exclude` entry, reverted | fixed |
| Local `pnpm check` lint scanned untracked junk dirs (2.6M diagnostics) | 1 | clean worktree check | EXIT 0 |
| Chrome extension could not reach localhost | 2 | dev-browser headless | fixed |

Verification evidence:
- `bun test apps/www/src/registry/examples/values/demo-values.spec.tsx` (repo root): red with 6 empty elements before; 2 pass after.
- dev-browser `/blocks/plugin-rules-demo`: before fix no editor + `Invalid attempt to destructure non-iterable instance`; after 24 blocks, hr rendered, 0 errors.
- dev-browser `/blocks/code-block-demo`: before 5 blank lines 0px, no text node; after 16px each, typing `x` lands in blank line, 0 errors.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`: exit 0.
- `pnpm check` in clean worktree at 08c29e55e8: EXIT 0 (3582 fast tests pass).

Final handoff contract:
- PR line: https://github.com/udecode/plate/pull/5154
- Issue / tracker line: 🐛 Fixes ➖ N/A
- Confidence line: 🟢 97% confidence
- Flow table:
  - Reproduced: tests 🔴 6 empty elements, browser 🔴 demo crash / 0px lines
  - Verified: tests 🟢 guard spec, browser 🟢 both demos render
- Browser check: dev-browser on local dev server
- Outcome: plugin rules demo loads; blank code lines render
- Caveat: invalid user initial values no longer auto-repaired since NodeIdPlugin perf change
- Design:
  - Chosen boundary: demo data validity + guard spec
  - Why not quick patch: guard spec prevents recurrence across all demo values
  - Why not broader change: core normalization on init is a separate perf decision
- Verified: spec, browser, changelog check, pnpm check
- PR body verified: gh pr view --json body

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  exactly one `🧭 Task plan: docs/plans/<plan>.md` line, then an emoji
  confidence line like `🟢 95-100% confidence`. The plan must exist at the
  exact PR head and identify that exact PR.
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
- PR: https://github.com/udecode/plate/pull/5154
- Task plan at exact PR head: yes
- Issue / tracker: N/A
- Browser proof: dev-browser DOM assertions
- Caveats: core no longer repairs invalid initial values

Timeline:
- 2026-10-09T09:37:43.848Z Task goal plan created.
- 2026-10-09 Fix committed 08c29e55e8, pnpm check passed, PR #5154 opened.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Done |
| What is the goal? | Fix crashing plugin-rules demo + guard demo values; PR #5154 |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Invalid user initial values with empty void children crash slate-react (core caveat, out of scope).
