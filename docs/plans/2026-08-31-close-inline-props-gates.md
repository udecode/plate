# close inline props gates

Objective:
Close all remaining inline-props gate failures and preserve durable agent guidance; done when lint, Plite dev checks, and source/mirror parity pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-close-inline-props-gates.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user request following the inline component-props audit
- id / link: current Codex thread; no external tracker
- title: fix all remaining gates and keep the inline-props rule in AGENTS or its owning skill
- acceptance criteria: format the four named files; fix both `no-promise-executor-return` diagnostics; remove the nine forbidden www Plite runtime aliases at their owner; keep the inline-props law discoverable from an authoritative agent source; make root lint, focused alias proof, www typecheck, `pnpm check:plite:dev`, and agent source/mirror checks pass.

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
- initial confidence score: N/A: pass/fail commands are the stronger metric
- improvement loop: fix each named owner, rerun its focused gate, then rerun combined gates
- final score / loop closure: N/A: close only on all named green gates

Completion threshold:
- Zero findings from `pnpm lint`; zero failures from the focused Plite alias contract; www typecheck passes; `pnpm check:plite:dev` passes; the inline-props rule is present in an authoritative source skill/rule and any generated mirror matches.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-close-inline-props-gates.md` passes.

Verification surface:
- `pnpm lint`; `node --test tooling/scripts/plite-source-aliases.test.mjs`; `pnpm --filter www typecheck`; `pnpm check:plite:dev`; targeted `rg` over `.agents/rules/plate-ui*` and `.agents/skills/plate-ui/**`; agent-native source/mirror review.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: the named failing source files, `tooling/scripts/plite-source-aliases.test.mjs`, root/package tsconfig ownership, `.agents/rules/plate-ui*`, and generated Plate UI skill mirrors.
- Allowed edit scope: the four named format files, transient geometry browser spec, www tsconfig and only consumers/config owners required to remove forbidden aliases, this plan, and agent source/mirrors only if the existing rule is insufficient.
- Browser surface: N/A: no user-visible behavior change; the browser spec edit is lint-only control flow.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue or PR requested.
- Non-goals: no API redesign, no unrelated lint cleanup, no runtime feature change, no commit/push/PR, and no weakening the alias or lint contracts.

Output budget strategy:
- Read exact files and narrow `rg` matches only; cap command output; use focused gates before broad checks; do not scan generated/build/vendor trees.

Blocked condition:
- Stop only if removing the forbidden aliases exposes an ownership decision that cannot be resolved from current entrypoints/tests, or the same external/concurrent failure blocks the required gate three times after focused diagnosis.

Task state:
- task_type: bounded code/config/agent-guidance repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: fix every named red gate at its owner; do not suppress checks or duplicate the inline-props law
- confidence: high; every named verification gate is green
- next owner: none
- reason: the current tree contains the fixes, the deterministic gates pass, and the exact law already lives in the canonical Plate UI source and generated skill.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-close-inline-props-gates.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | The first checkpoint records every named failure, the rule requirement, non-goals, and exact closure commands. |
| Timed checkpoint parsed | no | No duration requested. |
| Skill analysis before edits | yes | Loaded `task`, `autogoal`, global `oxlint`, and `agent-native-reviewer` completely. |
| Active goal checked or created | yes | Created goal for this exact plan and pass/fail threshold. |
| Source of truth read before edits | yes | Read the transient geometry spec, www tsconfig, Plite alias contract, four formatted files, Plate UI source rule, generated skill, and root lint scripts. |
| Tracker comments and attachments read | no | No tracker or attachments. |
| Video transcript evidence required | no | No video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read `docs/solutions/developer-experience/2026-03-12-typescript-workspace-subpath-aliases-in-apps-www.md`; it confirms exact Plate source aliases while the newer Plite contract forbids raw Plite app aliases. |
| TDD decision before behavior change or bug fix | no | Current-tree closure only; no remaining behavior change was required after inspection. Existing deterministic lint, alias, typecheck, and Plite contracts are the proof. |
| Branch decision for code-changing task | no | Use the current checkout as requested by repo policy; no branch mutation. |
| Release artifact decision | no | Lint/config/agent-guidance closure does not change package behavior or registry behavior. |
| Browser tool decision for browser surface | no | No visible behavior changes; browser-spec edit preserves behavior. |
| PR expectation decision | no | User did not request a PR. |
| Tracker sync expectation decision | no | No tracker. |
| Output budget strategy recorded | yes | Exact files, narrow searches, capped output, focused gates first. |
| Agent-native pack selected | yes | Materialized `agent-native` pack. |
| Agent-facing action surface identified | yes | Plate component authors/agents choosing inline versus named props. |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/plate-ui*` is source; `.agents/skills/plate-ui/**` is generated. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded the complete skill before edits. |

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
- [x] Output budget discipline recorded; the Plite dev gate emitted one oversized completion payload, which is recorded below and was not repeated.
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors. N/A: no new rule edit was needed; the authoritative rule already contains the exact requested law.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text. `plate-ui` is routed from `.agents/AGENTS.md`, and both source and generated skill name the inline rule and audit command.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded. `cmp` proves the detailed source/mirror pair is byte-identical; no source changed in this closure packet.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason. Review found no missing route, duplicate owner, stale mirror, or unverifiable action.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm lint`, focused alias contract, www typecheck, `pnpm check:plite:dev`, and agent parity all passed in `/Users/zbeyens/git/plate-2`. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: this continues a prior audit whose named red diagnostics were already recorded; the current tree was green on first focused rerun. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `node --test tooling/scripts/plite-source-aliases.test.mjs`: 10/10 passed; `pnpm lint`: inline audit passed over 1,809 TSX files. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed, including app and package-integration tsconfigs. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no export or file-layout change in this closure packet. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest/install-graph change in this closure packet. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: the requested rule was already in the authoritative Plate UI rule and generated skill; byte parity passed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Every command ran in `/Users/zbeyens/git/plate-2`; www typecheck ran through the `www` workspace owner. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: no visible behavior changed. |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: deterministic lint/config/contract closure only. `check:plite:dev` still passed its Chromium smoke lane. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package behavior or public API change. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry behavior changed. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only this execution ledger changed in the closure packet. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk was duplicate/stale agent doctrine or weakening the alias contract. Kept one Plate UI owner, rejected duplication, proved the route/mirror, and ran the real contract. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded reviewer; route -> source owner -> generated skill -> executable audit chain is complete with no accepted finding. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install-corruption signal. |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: current branch is `next`, where repo policy forbids `autoreview`; this packet required no product-source patch. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR or image proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint` passed with zero formatting/lint findings and the inline-props audit passed. No fix-mode rewrite was necessary. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One `check:plite:dev` completion payload exceeded the cap; recorded below. No further broad output was requested. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-close-inline-props-gates.md` | Final mechanical validation command recorded and run after the completed ledger was formatted. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | No source changed in this packet; `cmp` passed for detailed Plate UI source/mirror, and matching rule/audit lines exist in source and generated SKILL. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `.agents/AGENTS.md` routes component shape to `plate-ui`; `.agents/skills/plate-ui/SKILL.md` states the exact rule and command. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded and applied; no accepted/actionable findings remain. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read every named failure owner, repo solution, lint entrypoint, and agent source/mirror. | implementation |
| Implementation | complete | Current tree already contained the four formatting fixes and Plite-alias removal; exact inline-props law already existed in the owning skill, so no duplicate patch was added. | verification |
| Verification | complete | Root lint, focused alias contract, www typecheck, Plite dev lane, and agent parity passed. | closeout |
| PR / tracker sync | complete | N/A: user requested neither PR nor tracker mutation. | final response |
| Closeout | complete | Plan records evidence, risks, review, and final handoff. | final response |

Findings:
- The stale handoff listed four formatting failures and two lint diagnostics, but current `pnpm exec ultracite check` passed on its first rerun.
- `apps/www/tsconfig.json` currently exposes zero `plitejs*` paths; the focused ten-test contract passes.
- The exact requested rule already lives in `.agents/rules/plate-ui.mdc` and `.agents/rules/plate-ui/rules/component-shape.md`, with matching generated Plate UI skill copies.
- `.agents/AGENTS.md` routes all Plate React/component shape work to `plate-ui`; adding another copy would create competing doctrine.

Decisions and tradeoffs:
- Keep the rule in the owning `plate-ui` skill instead of duplicating it in AGENTS -> one canonical owner with a clear route is safer than two prose copies -> agents still discover it through the owner table.
- Preserve the strict Plite-alias contract -> raw Plite app aliases violate the Plate facade boundary -> exact Plate source aliases remain intact for www source-first typechecking.
- Do not manufacture edits for already-green files -> current-tree proof is the honest closure boundary -> final handoff distinguishes existing fixes from this packet's verification.

Implementation notes:
- No product-source edit was required in this closure packet. The current tree already held every named source fix.
- This plan is the only file authored by this packet.

Review fixes:
- Agent-native review: accepted zero findings. The action is routed, the source owner is authoritative, the mirror matches, and the audit command is executable from root lint.
- Oxlint review: accepted zero policy changes. The beneficial rule remains enabled; current code passes it without suppression.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `check:plite:dev` completion output exceeded the requested display cap | 1 | Stop printing broad contract details; retain only the runner's final status/timing summary in the plan | Command passed exit 0; no further broad-output command was run. |
| Oxfmt rejected the goal-plan path because `docs/plans/**` is ignored | 1 | Run the plan checker directly; do not force-format an intentionally ignored execution ledger | Checker passed; root lint remains the actual formatted-source gate. |

Verification evidence:
- `pnpm exec ultracite check` in `/Users/zbeyens/git/plate-2` -> exit 0; all 4,156 matched files formatted and no lint diagnostic.
- `pnpm lint` -> exit 0; inline component-prop audit passed with 20 retained exported contracts across 1,809 TSX files.
- `node --test tooling/scripts/plite-source-aliases.test.mjs` -> exit 0; 10/10 passed, including zero www Plite runtime aliases.
- `pnpm --filter www typecheck` -> exit 0; editor generation check, API-reference check, docs/source parity, registry source, Next typegen, app tsconfig, and package-integration tsconfig passed.
- `pnpm check:plite:dev` -> exit 0 in 55.007 seconds; 86/86 entrypoint typechecks, app/www typechecks, 134/134 entrypoint tests, contracts, public types, and Chromium smoke passed.
- `cmp` plus targeted `rg` across Plate UI source/mirrors -> exit 0; detailed rule mirror is byte-identical and the short rule/audit command exists in both source and generated SKILL.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-close-inline-props-gates.md` -> exit 0.

Final handoff contract:
- PR line: N/A: none requested or created
- Issue / tracker line: N/A: no external tracker
- Confidence line: 100% on the named local gates; no claim about commit, push, PR, or release
- Flow table:
  - Reproduced: stale red handoff inspected; current focused gates were green on first rerun; browser N/A
  - Verified: root lint, alias contract, www typecheck, Plite dev lane, and agent parity green; Browser N/A for no visible change
- Browser check: N/A: no visible behavior changed; Plite dev Chromium smoke still passed
- Outcome: every named remaining gate passes, and the inline-props rule is present in the owning skill with generated parity
- Caveat: this packet verified source fixes already present in the current tree; it did not create a commit or release
- Design:
  - Chosen boundary: Plate UI owns component prop-shape doctrine; the Plite alias contract owns application boundary enforcement
  - Why not quick patch: no suppression or test weakening; the real lint/type/contract paths pass
  - Why not broader change: duplicating the rule in AGENTS would make a second doctrine owner without improving discoverability
- Verified: exact commands and counts are listed above
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
- Browser proof: N/A: no visible change; Chromium smoke passed inside `check:plite:dev`
- Caveats: current-tree proof only; no commit/push/release claim

Timeline:
- 2026-08-31T12:30:09.051Z Task goal plan created.
- 2026-08-31T12:31Z Read exact failure owners, alias architecture solution, and Plate UI source/mirror doctrine.
- 2026-08-31T12:32Z Focused alias contract and Ultracite both passed on first current-tree rerun.
- 2026-08-31T12:33Z Root lint, www typecheck, and agent parity passed.
- 2026-08-31T12:34Z Full `check:plite:dev` passed all phases in 55.007 seconds.
- 2026-08-31T12:35Z Agent-native review closed with zero findings; duplicate AGENTS doctrine rejected.
- 2026-08-31T12:36Z Mechanical goal-plan validation passed; ignored-plan formatting attempt recorded and not forced.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after all named gates passed |
| Where am I going? | Mechanical plan validation, then final response |
| What is the goal? | Close every remaining inline-props gate and preserve one discoverable agent-rule owner |
| What have I learned? | The fixes and exact Plate UI skill rule already exist in the current tree; the red handoff was stale |
| What have I done? | Verified lint, alias, typecheck, Plite dev, mirror parity, and agent-native routing |

Open risks:
- None for the named local gates. Uncommitted current-tree state is intentionally outside this request's proof boundary.
