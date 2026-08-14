# Make Plate skills self-repair on API changes

Objective:
Make Plate skills repair themselves when related APIs change; done when source rules, generated mirrors, and stale-pattern audits pass.

Goal plan:
docs/plans/2026-08-14-make-plate-skills-self-repair-on-api-changes.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:

- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:

- type: direct user request
- id / link: current Codex task
- title: Make related Plate skills self-repair on API changes
- acceptance criteria: API-breaking or API-updating work automatically audits and repairs the owning doctrine and affected worker skills, regenerates mirrors, and proves zero stale teaching for the changed pattern.

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
- initial confidence score: N/A: binary rule and sync checks are sufficient
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:

- The shared source rule and the relevant Plate API/package/registry skills state the automatic self-repair contract without duplicating API doctrine.
- Generated skill mirrors match their `.agents/rules/**` owners.
- Focused source audits find the contract in every intended owner and no contradictory opt-in-only wording.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-make-plate-skills-self-repair-on-api-changes.md` passes.

Verification surface:

- `pnpm install` for rule-to-skill regeneration.
- Focused `rg` audits across `.agents/AGENTS.md`, `.agents/rules/**`, and generated `.agents/skills/**`.
- Plate Next doctrine version validation and focused helper tests if its source changes.
- `git diff --check` and scoped formatting checks.
- Agent-native review of the final instruction diff.

Constraints:

- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:

- Source of truth: `.agents/AGENTS.md` and `.agents/rules/*.mdc`; generated `SKILL.md` files are mirrors only.
- Allowed edit scope: agent rules, their generated mirrors, Plate Next version metadata if required, and this goal plan.
- Browser surface: N/A: no product, docs site, or UI behavior changes.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no external tracker request.
- Non-goals: no `packages/**`, `apps/**`, `content/**`, runtime, API, commit, push, or PR changes.

Output budget strategy:

- Read only the named skill owners and focused matching sections; use counts/file lists before line output; cap command output and exclude generated/product trees unless verifying mirrors.

Blocked condition:

- Stop only if source-generation tooling cannot run after one evidence-backed retry or if current owner rules fundamentally conflict with the requested automatic repair contract.

Task state:

- task_type: agent-instruction repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: active

Current verdict:

- verdict: implement the automatic repair contract at the shared owner, then add concise lane-specific duties to the affected skills
- confidence: high
- next owner: task
- reason: relying on humans to remember cross-skill repair is exactly how stale API doctrine returns.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-make-plate-skills-self-repair-on-api-changes.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Automatic self-update/self-repair on related API updates and breaking changes; no additional scope requested |
| Timed checkpoint parsed | no | No duration requested |
| Skill analysis before edits | yes | Loaded `autogoal` and `skill-creator`; relevant Plate skill owners will be read before edits |
| Active goal checked or created | yes | Active goal created for this exact plan and threshold |
| Source of truth read before edits | yes | Repo AGENTS declares `.agents/AGENTS.md` and `.agents/rules/*.mdc` authoritative |
| Tracker comments and attachments read | no | N/A: direct local request |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: agent-rule-only repair |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior |
| Branch decision for code-changing task | no | N/A: no git operation requested |
| Release artifact decision | no | N/A: agent rules are not package release artifacts |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Focused reads/searches with explicit output caps |
| Agent-native pack selected | yes | `agent-native` pack materialized in this plan |
| Agent-facing action surface identified | yes | API design, package-plugin, registry-UI, adoption, and cleanup skill rules |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` via `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded the complete skill before the capability-map and forward-test review |

Work Checklist:

- [x] N/A: no duration was requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] N/A: no video or screen recording was supplied.
- [x] Nearby repo instructions and the complete affected skill owners were read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifacts are N/A: no package or registry product surface changed.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling is N/A: no commit, push, or PR was requested.
- [x] Local-env-rot retry is N/A: no install-corruption signal occurred.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] P2 autoreview is N/A under its prose-only skill/rule exception; agent-native review is the owning behavior review.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced after `.agents/rules/**` changed.
- [x] Agent-native pack: the independent forward test discovered the full repair chain with no seeded expected answer.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Plate Next validate, 10/10 helper tests, source/mirror stale-pattern audit, and diff check pass |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: workflow rule enhancement, not a product bug |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Root route plus source, Codex mirror, and Claude mirror audits expose the automatic repair action |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TypeScript or typed product config changed |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package export or file topology change |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: install ran only to regenerate agent mirrors; dependency graph stayed current |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` completed; `version.mjs validate` proves required generated parity |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: no product/UI/docs route changed |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: no browser surface |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` edits |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: only agent workflow doctrine changed |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component change |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only the internal goal plan changed outside agent rules |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure: workers keep teaching a rejected API. Boundary: root trigger plus `best-api` owner and narrow worker duties. Proof: mirror/stale scans and forward test. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Complete skill loaded; capability map passes; independent forward test found every required owner and proof class |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal |
| P2 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P2` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings; use P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: autoreview explicitly exempts prose-only skill/rule diffs; agent-native review owns this behavior surface |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR or image |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Source Markdown/JSON and `git diff --check` pass; generated mirrors are verified by exact source parity rather than hand-formatting |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Searches were file-scoped and capped; one combined skill read truncated, then continued in bounded chunks |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-make-plate-skills-self-repair-on-api-changes.md` | Final checker rerun after every plan row closed |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Codex and Claude mirrors contain the same automatic repair contract; v73 validate passes |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Root `AGENTS.md` routes every reusable API change to automatic `best-api repair`; each affected worker names its duty |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS: action route, source owner, mirrors, proof, and forward-test discoverability all present |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Required skills and source owners read; requirements captured | implementation |
| Implementation | completed | Shared owner plus Plate Plan, Plugin Creator, UI, and Next rules repaired; doctrine v73 added | verification |
| Verification | completed | Mirror sync, v73 validate, 10/10 tests, stale-pattern audit, and independent forward test pass | closeout |
| PR / tracker sync | completed | N/A: no PR or tracker requested | final response |
| Closeout | completed | Final checker rerun from the completed plan | final response |

Findings:

- The shared AGENTS rule already names `best-api repair`, but it does not state strongly enough that API-changing tasks trigger it automatically without another user prompt.

Decisions and tradeoffs:

- Keep one canonical repair contract in AGENTS/best-api; dependent skills get a short trigger and duty, not copied API doctrine.

Implementation notes:

- Root AGENTS owns the automatic trigger. `best-api` owns the repair procedure. Worker skills state only their lane-specific duty.
- Plate Next doctrine advanced from v72 to v73; package attestations were intentionally not mass-updated.

Review fixes:

- Fixed a Markdown code span that wrapped `best-api repair` across two lines in Plate Plan before the final mirror sync.
- Independent forward test found the exact `best-api`, `plate-plan`, `plate-plugin-creator`, `docs-creator`, versioning, mirror, stale-audit, package-proof, changeset, and browser closeout chain from root AGENTS alone.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Prettier could not infer an `.mdc` parser | 1 | Use generated-mirror parity validation instead of treating `.mdc` as an ordinary Markdown extension | Source/skill parity passes; generated mirrors remain generator-owned |
| Formatting `.mdc` sources temporarily changed the doctrine fingerprint | 1 | Regenerate mirrors, recompute the canonical source fingerprint, and update only the new v73 entry | Canonical v73 fingerprint is `sha256:3ad6debcf50121614a735b42d464f9d6f089683b58676f00a9b9793419df876d` |

Verification evidence:

- `pnpm install` in `/Users/zbeyens/git/plate-2` -> Skiller and required resource sync completed.
- `node .agents/rules/plate-next/scripts/version.mjs validate` -> v73 registry valid, 42 active and 1 retired.
- `node --test .agents/rules/plate-next/scripts/version.test.mjs` -> 10/10 passing.
- Focused `rg` over root/source/Codex/Claude owners -> automatic repair contract present; no affirmative opt-in-only/defer wording found.
- `git diff --check` over agent sources, generated mirrors, and this plan -> pass.
- Fresh read-only forward test -> independently recovered the full repair/adoption/proof chain from root AGENTS without reading the changed skill bodies.

Final handoff contract:

- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker requested
- Confidence line: high; source/mirror parity and forward-test evidence
- Flow table:
  - Reproduced: N/A: no product bug; browser N/A
  - Verified: v73 tests 10/10; browser N/A
- Browser check: N/A: no browser surface
- Outcome: related API changes automatically repair doctrine and affected skills in the same task.
- Caveat: v73 intentionally leaves package attestations stale until each package is actually re-proven.
- Design:
  - Chosen boundary: one root trigger, one `best-api` repair owner, narrow worker duties.
  - Why not quick patch: changing only Plugin Creator or UI would miss API changes entered through plans, docs, or migration work.
  - Why not broader change: copying full doctrine into every skill would create the same drift problem again.
- Verified: source owners, both generated mirror families, doctrine registry/tests, stale-pattern scan, and agent-native forward test.
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

- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: package attestations remain stale by design; no package source was reviewed or re-attested.

Timeline:

- 2026-08-14T11:45:07.702Z Task goal plan created.
- 2026-08-14 Active goal created after prompt requirements, boundaries, threshold, and proof surface were recorded.
- 2026-08-14 Automatic repair contract added to root, API, plan, package-plugin, registry-UI, and migration owners; Plate Next bumped to v73.
- 2026-08-14 Codex/Claude mirrors regenerated; doctrine, parity, stale-pattern, and independent forward-test proof passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closeout |
| Where am I going? | Run the goal checker and close the active goal |
| What is the goal? | Make related Plate skills automatically self-repair when APIs change |
| What have I learned? | See Findings |
| What have I done? | Implemented and synced the automatic self-repair contract; see Verification evidence |

Open risks:

- No implementation risk remains. Package attestations are intentionally stale under v73 until package-specific sync proves them; no mass attestation was performed.
