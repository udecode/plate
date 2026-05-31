# sync shadcn editors shell parity

Objective:
Implement the accepted `sync-shadcn` `/editors` shell parity slice: make
`/editors` follow upstream shadcn `/blocks` page framing while preserving Plate
editor demos and excluding the category nav, v0 actions, Browse all blocks, and
Browse more editors.

Goal plan:
docs/plans/2026-05-29-sync-shadcn-editors-shell-parity.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: accepted sync-shadcn implementation slice
- id / link: `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-efdec3c-editors-blocks-style/plan.md`
- title: Editors page shell parity
- acceptance criteria: centered upstream-style `PageHeader`, `section-soft`
  content band, upstream block-list spacing, Plate demos retained, rejected
  upstream controls absent, partial sync status updated without advancing
  `lastSyncedCommit`, focused lint/typecheck and browser proof complete.

Completion threshold:
- `/editors` renders with the approved upstream `/blocks` shell rhythm.
- `docs/sync/shadcn/status.json` records the implementation as a partial sync
  and leaves `lastSyncedCommit` unchanged.
- Focused eslint, `pnpm --filter www typecheck`, and desktop/mobile browser
  proof pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-sync-shadcn-editors-shell-parity.md` passes.

Verification surface:
- `pnpm --filter www exec eslint 'src/app/(app)/editors/layout.tsx' 'src/app/(app)/editors/editor-description.tsx' 'src/app/(app)/editors/page.tsx' --fix`
- `pnpm --filter www typecheck`
- Playwright browser proof against `http://localhost:3003/editors` at
  `1175x1239` and `390x844`, with screenshots saved in the sync run folder.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth:
  `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-efdec3c-editors-blocks-style/plan.md`
- Allowed edit scope: `/editors` route files, this goal plan, sync run plan,
  and `docs/sync/shadcn/status.json`.
- Browser surface: `http://localhost:3003/editors`.
- Tracker sync: N/A, no external issue or PR requested.
- Non-goals: no `PageNav`/`BlocksNav`, no `Open in v0`, no `Browse all blocks`,
  no `Browse more editors`, no full sync baseline advancement.

Output budget strategy:
- Use targeted file reads, focused eslint/typecheck output, compact browser
  metrics, and saved screenshots instead of broad patch dumps.

Blocked condition:
- Block only if the local dev route cannot be loaded, focused checks fail for
  causes outside this slice after one honest retry, or browser evidence shows
  excluded controls still present.

Task state:
- task_type: visual shell sync
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: implemented
- confidence: high
- next owner: user review
- reason: approved slice shipped with checks and desktop/mobile browser proof

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-sync-shadcn-editors-shell-parity.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `sync-shadcn`, `autogoal`, and `task`; accepted plan read before patching. |
| Active goal checked or created | yes | `create_goal` created the accepted `/editors` implementation goal. |
| Source of truth read before edits | yes | Read `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-efdec3c-editors-blocks-style/plan.md`. |
| Tracker comments and attachments read | no | N/A: no tracker item. |
| Video transcript evidence required | no | N/A: no video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: source of truth was the fresh `sync-shadcn` plan and route code. |
| TDD decision before behavior change or bug fix | no | N/A: visual shell sync, verified by lint/typecheck/browser proof. |
| Branch decision for code-changing task | yes | N/A: user did not request branch or PR; edited current checkout only. |
| Release artifact decision | no | N/A: docs app route/status changes only; no package release artifact. |
| Browser tool decision for browser surface | yes | Used Playwright against the local dev server because no direct Browser tool was callable in this session. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Targeted reads and compact command/browser outputs only. |
| Docs pack selected | yes | `docs` pack applied because sync status and plan artifacts changed. |
| `docs-creator` loaded | no | N/A: this is sync bookkeeping, not user-facing MDX content. |
| Docs lane selected | yes | Supporting docs/status artifact update under `sync-shadcn`. |
| Target docs and nearest sibling docs read | yes | Read accepted sync plan and status JSON before edits. |
| Docs style doctrine read | no | N/A: no user-facing docs prose changed. |
| Documented source owner identified | yes | Source owner is `sync-shadcn` plan/status under `docs/sync/shadcn`. |
| Browser pack selected | yes | `browser` pack applied because `/editors` UI changed. |
| Browser route / app surface identified | yes | Route is `http://localhost:3003/editors`. |
| Browser tool decision recorded | yes | Playwright used for desktop/mobile screenshots and assertions. |
| Console/network caveat policy recorded | yes | Known Potion iframe X-Frame-Options/sandbox warnings recorded; no page errors or failed requests. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
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
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named lint, typecheck, browser proof, and status JSON source audit | Focused eslint passed, `pnpm --filter www typecheck` passed, browser proof passed, status JSON updated. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: accepted visual sync slice, not a bug repro. |
| Targeted behavior verification | yes | Run focused proof for changed behavior | Browser proof on `/editors` desktop/mobile asserted centered header, `section-soft`, retained demos, and excluded controls absent. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed. |
| Package exports or file layout changed | no | Run `pnpm brl` or record N/A | N/A: no package exports or barrels changed. |
| Package manifests, lockfile, or install graph changed | no | Run install checks or record N/A | N/A: no manifest or lockfile changes. |
| Agent rules or skills changed | no | Run generated skill sync or record N/A | N/A: no agent rules or skills changed. |
| Workspace authority proof | yes | Run proof in owning app/repo | Commands ran from `/Users/zbeyens/git/plate`; browser proof hit `apps/www` dev route at `localhost:3003`. |
| Browser surface changed | yes | Capture browser proof | Saved `plate-editors-desktop-after.png` and `plate-editors-mobile-after.png`. |
| Browser final proof | yes | Attach screenshot or exact browser caveat | Screenshots saved under the sync run folder; known Potion iframe warnings only. |
| CI-controlled template output changed | no | Restore generated template output or record N/A | N/A: no template output changed. |
| Package behavior or public API changed | no | Add changeset or record N/A | N/A: docs app route only. |
| Registry-only component work changed | no | Update changelog or record N/A | N/A: no registry component change. |
| Docs or content changed | yes | Verify docs/status claims | Sync status and run plan updated with source-backed implementation result. |
| High-risk mini gate | yes | Record realistic failure mode and proof plan | Risk: accidentally adding rejected shadcn controls or losing Plate demos; proof asserts excluded controls absent and demos retained. |
| Agent-native review for agent/tooling changes | no | Run review or record N/A | N/A: no agent/tooling changes. |
| Local install corruption suspected | no | Retry reinstall or record N/A | N/A: checks passed; no install-corruption signal. |
| Autoreview for non-trivial implementation changes | no | Run review or record N/A | N/A: narrow visual shell sync with targeted browser proof and no package/API changes. |
| PR create or update | no | Run check before PR work or record N/A | N/A: no PR requested. |
| Task-style PR body verified | no | Verify PR body or record N/A | N/A: no PR. |
| PR proof image hosting | no | Host images or record N/A | N/A: no PR body. |
| Tracker sync-back | no | Post tracker sync or record N/A | N/A: no tracker. |
| Final handoff contract | yes | Fill final handoff fields | Final handoff fields completed with checks and caveat. |
| Final lint | yes | Run scoped equivalent | `pnpm --filter www exec eslint ... --fix` passed. |
| Output budget discipline | yes | Verify scoped output | Output stayed targeted; browser evidence saved as screenshots. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-sync-shadcn-editors-shell-parity.md` | To run after this plan fill. |
| Docs source-backed claim audit | yes | Verify docs claims against source | Claims point to accepted sync plan, status JSON, route files, and browser screenshots. |
| Docs links / routes / previews | yes | Verify route/anchors/previews | `/editors` and `#blocks` verified in browser proof; no new leaf links. |
| Docs MDX/content parser | no | Run content parser or record N/A | N/A: no MDX content changed. |
| Plugin page specifics | no | Apply plugin page rules or record N/A | N/A: not a plugin page. |
| Browser interaction proof | yes | Exercise target route | Playwright loaded `/editors` at desktop/mobile and checked layout/exclusions. |
| Browser console/network check | yes | Record console/network state | No page errors or failed requests; known Potion iframe warnings recorded. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof | Screenshots saved in `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-efdec3c-editors-blocks-style/screenshots/`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Accepted sync plan and target route files read. | implementation |
| Implementation | complete | `/editors` layout, description, and page patched; sync status/run plan updated. | verification |
| Verification | complete | Focused eslint, typecheck, and browser proof passed. | closeout |
| PR / tracker sync | N/A | No PR or tracker requested. | final response |
| Closeout | complete | Plan filled; final response ready after `check-complete` and `update_goal`. | final response |

Findings:
- `/editors` had the old route-local container and left-aligned header rhythm.
- The approved shadcn parity slice only needed page shell/list changes; Plate
  editor demo content stayed owned by Plate.

Decisions and tradeoffs:
- Kept the `Browse Editors` hero action because the plan only excluded the
  bottom `Browse more editors` CTA and upstream category/action controls.
- Did not touch `BlockViewer`; toolbar cleanup remains deferred unless the user
  wants that second slice.

Implementation notes:
- `layout.tsx` now wraps children in `container-wrapper flex-1 section-soft md:py-12`.
- `editor-description.tsx` now renders through shared `PageHeader`.
- `page.tsx` now uses `flex flex-col gap-12 md:gap-24`.

Review fixes:
- Added centered `PageActions` styling after confirming the shared component's
  default is left-aligned in Plate.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Node ESM/require ambiguity in first browser script | 1 | Rerun script as ESM with `--input-type=module` | Browser proof passed |

Verification evidence:
- `pnpm --filter www exec eslint 'src/app/(app)/editors/layout.tsx' 'src/app/(app)/editors/editor-description.tsx' 'src/app/(app)/editors/page.tsx' --fix` passed.
- `pnpm --filter www typecheck` passed.
- Browser proof on `http://localhost:3003/editors` passed at `1175x1239` and
  `390x844`.
- Screenshots:
  `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-efdec3c-editors-blocks-style/screenshots/plate-editors-desktop-after.png`
  and
  `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-efdec3c-editors-blocks-style/screenshots/plate-editors-mobile-after.png`.
- Browser assertions: centered PageHeader present, `section-soft` present,
  Plate demos retained, no PageNav/BlocksNav, no category nav labels, no
  Browse all blocks, no Open in v0, no Browse more editors, and no horizontal
  overflow.
- Console caveat: known external Potion iframe X-Frame-Options/sandbox warnings
  appeared; there were no page errors or failed requests.

Reboot status:
- Current and complete as of 2026-05-29: implementation, sync bookkeeping, and
  browser verification are done; only final handoff remains.

Open risks:
- None requiring more work for this slice. Optional BlockViewer toolbar density
  cleanup remains deferred by the sync plan.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high; checks and browser proof passed.
- Flow table:
  - Reproduced: N/A for bug repro; source plan and before screenshots already
    captured the visual delta.
  - Verified: focused eslint/typecheck passed; desktop/mobile browser proof passed.
- Browser check: `/editors` desktop/mobile screenshots saved; rejected controls absent.
- Outcome: `/editors` now follows the approved shadcn `/blocks` shell rhythm.
- Caveat: Potion iframe emits known external warnings during full-page capture.
- Design:
  - Chosen boundary: route shell files plus sync status/run plan.
  - Why not quick patch: route-level layout owns the header/content band.
  - Why not broader change: BlockViewer toolbar cleanup and full sync baseline
    are separate deferred slices.
- Verified: focused eslint, typecheck, browser desktop/mobile.
- PR body verified: N/A, no PR.

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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: screenshots saved in the sync run folder.
- Caveats: known Potion iframe warnings only.

Timeline:
- 2026-05-29T13:19:16.820Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete after implementation and verification |
| Where am I going? | Final response |
| What is the goal? | Ship the accepted `/editors` shell parity slice and record partial sync state |
| What have I learned? | Route shell parity was owned by `/editors` layout/header/list files; BlockViewer cleanup remains separate |
| What have I done? | Patched route shell, updated sync status/run plan, ran lint/typecheck/browser proof |

Open risks:
- None for the accepted slice; optional toolbar density cleanup remains deferred.
