# Hard Cut Selection Compatibility Residue

Objective:
Hard-cut Selection compatibility residue; done when zero unjustified redirects,
aliases, duplicate routes or ids, fallbacks, or stale tests remain and checks
pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-hard-cut-selection-compatibility-residue.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user correction to the completed Selection consolidation
- id / link: current Codex task and
  `docs/plans/2026-08-31-consolidate-selection-documentation.md`
- title: Remove useless Selection backward compatibility
- acceptance criteria: audit every file and generated artifact owned by the
  Selection consolidation and native inactive-selection packet; delete every
  redirect, alias, duplicate route/id, fallback, stale test, public helper, or
  compatibility comment without a proven hard contract; preserve only the
  canonical `/docs/selection` guide, `inactive-selection-demo`, native data
  attribute, and private runtime owner; prove zero residue and rerun affected
  checks.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no duration requested
- initial confidence score: N/A: the completion threshold is binary
- improvement loop: N/A: one bounded hard-cut sweep
- final score / loop closure: N/A: no timed loop

Completion threshold:
- Every compatibility artifact introduced or retained by the Selection
  consolidation or native inactive-selection packet is classified keep/cut
  with source evidence.
- Zero unjustified old Selection guide routes, ids, imports, aliases, fallbacks,
  duplicate docs, generated payloads, public runtime helpers, tests, or
  explanatory comments remain.
- Canonical `/docs/selection`, `/cn/docs/selection`, and
  `/blocks/inactive-selection-demo` owners remain intact.
- Focused stale-name audit, config formatting/type proof, docs/registry checks,
  and browser route proof pass after the cut.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-hard-cut-selection-compatibility-residue.md` passes.

Verification surface:
- Source audit of the prior Selection plans, their named files, current diff,
  route config, registry metadata/source/generated output, Plite/Plate public
  barrels, runtime owners, tests, and exact old names.
- Scoped formatter plus `www` docs/type/registry checks selected from the actual
  cut.
- Browser proof that the canonical guide and demo still render, while the old
  guide URL no longer redirects to the canonical route.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- No deprecation, migration note, compatibility alias, redirect, fallback, or
  deleted-behavior test may replace a hard deletion.
- Do not cut unrelated historical behavior merely because its name contains
  selection or retention.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: the prior Selection and native inactive-selection goal plans,
  their concrete changed owners, current `apps/www` route/registry
  configuration, Plite/Plate public barrels, and live Browser behavior.
- Allowed edit scope: files and generated artifacts owned by the Selection
  consolidation or native inactive-selection packet plus this plan. Adjacent
  code may change only when reference tracing proves it is compatibility glue
  for those packets.
- Browser surface: `/docs/selection`, `/cn/docs/selection`,
  `/blocks/inactive-selection-demo`, and the removed old guide URL.
- Browser strategy: Browser for route and rendered UI proof. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue or tracker was requested.
- Non-goals: no repository-wide purge of established compatibility outside the
  recent Selection/inactive-selection work; no runtime/API redesign; no PR,
  commit, push, or tracker mutation.

Output budget strategy:
- Inspect named files and count/file-list searches first. Exclude
  `node_modules`, `.next`, `.turbo`, logs, and unrelated generated trees.
  Inspect generated registry output only for exact Selection ids. Cap every
  command output and split diff/search reads by owner.

Blocked condition:
- Stop only if source proves an old Selection URL/id is a current external hard
  contract, or canonical route verification cannot run after one in-scope
  environment recovery attempt.

Task state:
- task_type: bounded hard cut and compatibility audit
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: complete
- goal_status: complete

Current verdict:
- verdict: the two old-guide redirects were the only compatibility mistake;
  hard-cut them and keep the canonical-only runtime/docs shape
- confidence: high; the full bounded source/generated/public-barrel sweep and
  runtime proof agree
- next owner: task
- reason: no serialized-data, native-behavior, security, or shipped URL contract
  has been shown for this unreleased `next` rename

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-hard-cut-selection-compatibility-residue.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Current correction, bounded packet scope, hard-cut rule, non-goals, proof surface, and final handoff are recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `hard-cut` for delete-through-reference-graph behavior and `autogoal` for measurable closure. |
| Active goal checked or created | yes | `get_goal` returned none; created the active goal naming this plan. |
| Source of truth read before edits | yes | Prior Selection plan is read; named current owners and diff are the next read-only audit before product edits. |
| Tracker comments and attachments read | no | N/A: no tracker or attachment. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: this is a bounded correction to the immediately preceding packet with its full source/proof plan available. |
| TDD decision before behavior change or bug fix | no | N/A: deleting config-only compatibility should not gain a deleted-behavior test; surviving route behavior receives Browser proof. |
| Branch decision for code-changing task | yes | Work directly in the existing `next` checkout; no branch or worktree creation. |
| Release artifact decision | no | N/A unless the audit finds a public registry artifact change beyond regenerated output; config-only deletion needs no changeset/changelog. |
| Browser tool decision for browser surface | yes | Browser will prove the canonical routes survive and the removed old route no longer redirects. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker requested. |
| Output budget strategy recorded | yes | Named-owner, count-first, capped search strategy recorded above. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
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
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits:
      root/project instructions, `hard-cut`, prior Selection plans, route config,
      registry owners, Plite inactive-selection runtime, public barrels, and
      exact tests.
- [x] Implementation fixes the right ownership boundary: the compatibility
      lived only in `apps/www/next.config.ts`, so both redirect entries were
      deleted there with no tombstone or replacement test.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. N/A for the known redirect deletion; reassess only if
      the audit changes a public registry artifact beyond generated output.
- [x] Final handoff shape decided: bounded hard-cut outcome, exact cut count,
      zero-residue audit, test/browser proof, no PR/tracker mutation.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: direct existing `next`
      checkout as explicitly required; no worktree or new branch.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      N/A: no install-corruption signal occurred.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: the removed old URL could still redirect through
      framework behavior or another config owner; source and Browser proof must
      show a real 404/non-canonical result while canonical routes stay green.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: `git branch
      --show-current` returned `next`, where repo law forbids `autoreview`; the
      surviving product delta is deletion of two config objects and final
      `next.config.ts` matches `HEAD`.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: none are in scope.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Zero exact public-old-name matches; config/type/changelog/Chromium/Browser gates pass. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Source showed two permanent old-guide redirects; the user identified the concrete unwanted behavior. No deleted-behavior test was added. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Browser proved both old paths stay on their own URL with no guide heading, while canonical EN/CN guides and demo remain reachable. |
| TypeScript or typed config changed | no | Run relevant typecheck | No surviving `next.config.ts` diff against `HEAD`; full `pnpm --filter www typecheck` nevertheless passed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: this correction changes no package export or package file layout. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: none changed. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: none changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Shell checks ran in `/Users/zbeyens/git/plate-2`; Browser used its live `apps/www` server. |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | Canonical EN h1 1, CN h1 `选择`, demo editor 1; each old URL retained its old path with zero h1; zero console errors. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Browser proof recorded below. Fresh `127.0.0.1` host avoided the browser cache created by the removed permanent redirect. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package/API change; no changeset. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: the prior registry rename remains canonical and its existing changelog passes; this correction only deletes route config. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: no product docs changed in this correction; full docs source/parity/type proof passed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode was a hidden second redirect owner or broken canonical route; exact source/generated searches plus Browser falsified both. The route config was the sole compatibility owner. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling change. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal. |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: branch is `next`, where repo law forbids `autoreview`; final config matches `HEAD`. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm exec ultracite check apps/www/next.config.ts` passed. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Four oversized/truncated reads are recorded below. The audit then switched to exact patterns, named owners, exit codes, and capped output; no conclusion relies on truncated data. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-hard-cut-selection-compatibility-residue.md` | Passed: `[autogoal] complete` for this plan. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Prior plans, route config, registry/docs/runtime owners, public barrels, tests, and exact references audited. | implementation |
| Implementation | complete | Deleted both old-guide redirect objects; no alias, tombstone, or deleted-behavior test added. | verification |
| Verification | complete | Source/generated/public-barrel audit, formatter, typecheck, changelog, Chromium, and Browser passed. | closeout |
| PR / tracker sync | complete | N/A: neither requested. | final response |
| Closeout | complete | Final goal-plan checker passed. | final response |

Findings:
- `apps/www/next.config.ts` contained the only two compatibility artifacts in
  the Selection docs packet: permanent EN/CN redirects from the deleted route.
- No `selection-retention-demo`, `SelectionRetentionKit`,
  `showInactiveSelection`, old guide URL, public inactive-selection helper
  export, generated alias, deprecated path, or fallback remains.
- `packages/plitejs/src/react/inactive-selection.ts` is a private runtime owner;
  neither `plitejs/react` nor `platejs/react` reexports it. The public control is
  the canonical `data-plite-keep-selection-visible` DOM attribute.
- The sole remaining broad `selection-retention` match is
  `dom-strategy-expanded-selection-retention`, an unrelated virtualization test
  id describing a current behavior, not compatibility glue.
- The development docs catch-all renders an empty shell with HTTP 200 for an
  unknown docs slug. It no longer redirects or serves Selection content; that
  generic not-found behavior predates and sits outside this hard cut.

Decisions and tradeoffs:
- Delete both redirects with no replacement -> the old URL has no hard contract
  and compatibility would preserve a second public name forever.
- Keep the virtualization test id -> it names surviving selection behavior and
  has no route, export, alias, or migration role.
- Keep private runtime exports inside their owning module -> they are internal
  composition, absent from package barrels, and not backward compatibility.

Implementation notes:
- The final `apps/www/next.config.ts` matches `HEAD`; this task removes the bad
  uncommitted addition instead of replacing it with different config.
- No generated artifact changed because redirects do not participate in the
  registry generator.

Review fixes:
- Initial scope covered the docs consolidation. Expanded the audit to the recent
  native inactive-selection runtime/API packet after pressure-testing the user's
  “all such mistakes” wording; no extra runtime cut was justified.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Combined skill read exceeded output | 1 | Read missing instruction ranges separately | Full required instructions were read before edits. |
| Staged/untracked inventory streamed a large staged file list | 1 | Stop broad state inventory; use named prior-plan owners and exact terms | Unrelated staged work was preserved and excluded. |
| Canonical generated JSON matches printed whole long lines | 1 | Use old-name-only exit-code searches | Generated old-name audit returned zero matches. |
| One `rg --files` call omitted its final filename filter | 1 | Stop broad file output; rely on the earlier filtered filename audit | Filtered audit found no old filename in the worktree. |
| Reused Browser tab had been closed | 1 | Create a fresh tab from the existing browser binding | Browser proof completed. |
| Browser had cached the removed permanent localhost redirect | 1 | Use the fresh `127.0.0.1` host and raw local HTTP check | Fresh-host Browser stayed on both old URLs with no Selection content; raw HTTP had no redirect destination. |

Verification evidence:
- Cwd `/Users/zbeyens/git/plate-2`: exact old public route/id/API search across
  `apps/www`, `content`, Plite/Plate source, tooling, generated `/r` and `/rd`,
  registry index, and changelog returned exit 1 with zero matches.
- Cwd `/Users/zbeyens/git/plate-2`: public-barrel search for
  `inactive-selection` returned exit 1; the private runtime is not package API.
- `git diff HEAD -- apps/www/next.config.ts` returned no output.
- `pnpm exec ultracite check apps/www/next.config.ts` passed.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check` checked 97
  events and passed.
- `pnpm --filter www typecheck` passed editor generation, API reference, MDX
  source, docs parity, registry source, Next route types, and both TypeScript
  projects.
- `pnpm --filter www test:www-browser:chromium
  tests/browser/transient-editor-geometry.spec.ts --grep "inactive selection"`
  passed 1/1; the test exercised expanded and collapsed selection five times.
- Browser: canonical English h1 count 1, Chinese h1 `选择`, demo editor count 1,
  each old URL stayed unchanged with zero h1, and console error count was zero.

Final handoff contract:
- PR line: N/A: no PR requested or created
- Issue / tracker line: N/A: no tracker requested or mutated
- Confidence line: high; all named source, generated, type, Chromium, and Browser
  gates agree
- Flow table:
  - Reproduced: two explicit permanent redirects in route config
  - Verified: exact search zero, typecheck green, Chromium 1/1, Browser canonical
    routes green and old paths dead
- Browser check: passed on EN/CN guide, demo, both removed old paths, and console
- Outcome: cut two redirects; found zero other unjustified compatibility in the
  recent Selection/inactive-selection work
- Caveat: unknown docs slugs use the existing empty development docs shell with
  HTTP 200; no redirect or Selection content remains
- Design:
  - Chosen boundary: delete the two objects from the owning route config
  - Why not quick patch: this is the complete reference-graph cut, not a redirect
    tweak, alias, deprecation, or test tombstone
  - Why not broader change: the bounded audit proved runtime and registry owners
    are canonical-only; repository-wide compatibility is unrelated scope
- Verified: exact source/generated/barrel audit, lint, typecheck, changelog,
  Chromium, and Browser
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
- PR: N/A: no PR
- Issue / tracker: N/A: none
- Browser proof: passed
- Caveats: generic unknown-doc dev response noted above

Timeline:
- 2026-08-31T13:43:11.104Z Task goal plan created.
- 2026-08-31 deleted both Selection guide compatibility redirects.
- 2026-08-31 widened the audit through Plite/Plate runtime and public barrels;
  found no extra compatibility artifacts.
- 2026-08-31 source/generated audits, formatter, typecheck, changelog,
  Chromium, and Browser verification passed.
- 2026-08-31 autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Complete the active goal and hand off. |
| What is the goal? | Remove every unjustified compatibility artifact from the Selection consolidation and prove zero residue. |
| What have I learned? | The redirects were the only compatibility mistake; runtime and registry surfaces are canonical-only. |
| What have I done? | Cut both redirects and passed every named audit and runtime gate. |

Open risks:
- None inside the Selection hard-cut scope. The generic development docs shell's
  HTTP 200 response for unknown slugs is an existing routing concern, not a
  compatibility path.
