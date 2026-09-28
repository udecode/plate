# Keep comment selections visible on Plate main

Objective:
Port the user-visible fix from [PR #5134](https://github.com/udecode/plate/pull/5134) onto current `main` so opening a draft comment keeps a wrapped or multi-block text selection visible. The [maintainer's comment](https://github.com/udecode/plate/pull/5134#issuecomment-5874697880) requests `main` because `next` has no release lane.

Completion threshold:
A main-based candidate fixes the reproduced placement failure, keeps the composer usable when the full selection cannot fit, preserves existing discussion behavior, passes the required root check and website typecheck, receives structured review, and is committed locally for the parent task to publish to the existing PR.

Verification surface:
`/Users/minwook/Documents/Codex/2026-09-24/new-chat-2/work/plate-5134`; `apps/www/src/registry/ui/block-discussion.tsx` and `apps/www/src/registry/components/editor/plugins/comment-kit.tsx`; isolated in-app Browser Use proof of the real main components; `pnpm check`, `pnpm --filter www typecheck`, changelog generator check, and structured Codex autoreview.

Constraints:
Preserve the old `next` branch and original checkout, change only the main comment owner and required release artifact, and keep temporary browser routes/build output out of the commit. The parent task owns PR retargeting, force-with-lease push, PR body, and a necessary one- or two-line English reply.

Boundaries:
The local branch `codex/keep-comment-selection-visible-main` starts at `origin/main` `babb3c2a733f821a33569d288e45da3f54eaf643`, confirmed against the live remote on 2026-09-28. The old next candidate remains at `3c9a8df3`. This plan belongs only to existing PR #5134.

Blocked condition:
If the full repository gate fails after one local-artifact correction, stop broad repairs and report exact unchanged baseline diagnostics. If browser placement cannot be observed in current main components, report the limitation before publishing.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| PR and feedback source | yes | Read PR #5134 and all comments; maintainer requested main target. |
| Branch and scope | yes | New main branch from live `babb3c2`; old next branch preserved. |
| Reproduction challenge | yes | On main before the fix, a wrapped draft selection at y170–214 mounted the composer offscreen at y−130 to −65 in the full editor demo. The report is valid as a placement failure; main's manifestation differs from the next-based diagnosis. |
| Browser route | yes | Temporary `/blocks/comment-proof` route used main registry plugins/components; removed before commit. |
| Registry release artifact | yes | Main registry UI behavior changed; MDX changelog source and generated JSON required. |
| Package changeset | no | No package source, exports, or published package behavior changed. |

Work Checklist:
- [x] Read PR #5134, maintainer feedback, main AGENTS and the task, feedback, browser, registry changelog, and autoreview contracts.
- [x] Reproduce the main placement failure before editing; reject a wholesale next-port because its architecture is absent on main.
- [x] Keep the draft focus block before collapsing a multi-block selection and use a live DOM range virtual anchor for placement.
- [x] Keep the complete selected range clear when one side fits; fall back to the last selected line when neither side fits.
- [x] Verify short, wrapped, forward/backward multi-block, oversized, typing, Escape, scroll, and existing-discussion behavior in the browser.
- [x] Generate and verify the registry changelog; keep package changesets out of this registry-only diff.
- [x] Run the exact root check and post-build website typecheck; preserve logs and classify local-artifact failures separately.
- [x] Run structured autoreview, reject its CI-owned output finding using repository policy, and commit only the scoped candidate.
- [x] Prepare the local candidate and evidence for the parent; GitHub publication and reply remain parent-owned.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Required root check | yes | Run the exact root command | `pnpm check` exit 0, `work/plate-main-followup/root-check-clean.log`. |
| Website typecheck | yes | Build workspace declarations then typecheck | `pnpm g:build` and `pnpm --filter www typecheck` exit 0, `work/plate-main-followup/www-typecheck-final.log`. |
| Browser placement | yes | Check draft range placement and recovery | 900×330 viewport: flipped short popup bottom 223px vs mark top 226.5px; wrapped and two-block selections clear; oversized last-line fallback kept the popup visible. |
| Browser scroll and existing discussion | yes | Check positioning and preserved thread UI | 66px editor scroll moved short popup from above to below while retaining a 2.5px gap; existing thread showed two comments and reply field. |
| Browser console | yes | Inspect current isolated proof | No console errors or warnings. |
| Registry changelog | yes | Generate source JSON and check | `generate-ui-changelog-entries.mjs --write` and `--check` passed; source/layout of generator unchanged. |
| Source formatting/lint | yes | Run targeted and root lint | Targeted Biome/ESLint and the root lint stage passed. |
| Autoreview | yes | Structured local Codex review | One generated-output finding rejected under `AGENTS.md:36` and CI ownership in `.github/workflows/registry.yml`; zero accepted actionable findings. |
| PR update/comment | no | Parent-owned publication | Candidate is local; parent will retarget existing #5134 and update its body/comment after handoff. |
| Package changeset | no | Classify release artifact | Registry-only change uses registry changelog, no package changeset. |
| Generated outputs | yes | Exclude temporary proof/build files | Browser route removed and ignored caches kept out of commit; inherited untracked artifacts preserved in task work area. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and reproduction | complete | Main owner and before geometry recorded. | Main implementation |
| Implementation | complete | Two-source-file change plus registry changelog. | Verification |
| Verification | complete | Root check, website typecheck, Browser Use geometry. | Review and commit |
| Review and local handoff | complete | Structured review triaged; scoped candidate prepared for local commit. | Parent publication |

Verification evidence:
- Before: on the full `editor-ai` demo at 900×450, selecting wrapped text and pressing ⌘⇧M placed the draft popup at y−130 to −65 while marked text occupied y170–214.
- After: on the isolated current-main components at 900×330, the two-line selected text occupied y226.5–271.5 and the flipped popup ended at y223. A short selected phrase occupied y226.5–247.5 and the popup ended at y223. At 900×450, the same short phrase placed the popup below at y250–316.
- Forward two-block draft: selected marks extended to y303.5; popup ended at y223. Backward two-block draft: focus was in the first block, anchor in the second, both marks persisted and popup began at y146 after selected text ended at y143.5.
- Oversized draft: range occupied y42.5–269.5 in a 330px viewport; last-line fallback placed the popup at y181–247, ending before the last marked line at y250.5. Typing kept focus and draft marks; Escape cleared the draft.
- Scroll: moving the editor scroll top 0→66px moved the short mark y226.5→160.5 and the popup from y157–223 above to y184–250 below, with no overlap.
- Existing discussion: clicking `discussion1` showed both existing comments and the reply input. Its Escape behavior is unchanged from main: `open` remains true while the discussion is selected; this is outside the draft-placement fix.
- Commands/logs: targeted Biome and ESLint passed; registry `--check` passed; `pnpm check` exit 0 (`work/plate-main-followup/root-check-clean.log`); post-build `pnpm --filter www typecheck` exit 0 (`work/plate-main-followup/www-typecheck-final.log`). The first exact check was blocked by a preserved inherited `.next-plite` cache with 834,305 generated-file formatter diagnostics; moving that untracked cache outside the repo allowed the unchanged command to pass. The first direct website typecheck lacked package declarations; root build produced them. Temporary stale `.next` route types were removed before the final green website check.

Review outcome:
Structured Codex autoreview raised one P2 request to commit generated `apps/www/public/r` payloads. Rejected as contrary to `AGENTS.md:36` (never run `build:registry` outside CI; output does not belong in local agent commits). `.github/workflows/registry.yml` runs PR validation with `regenerate: true` at lines 46–53, then builds and commits generated registry output after a main push at lines 115 and 142–157. The reviewer found no source correctness issue; zero accepted actionable findings. The review log and JSON are in `work/plate-main-followup/autoreview.*`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Verified local candidate ready for parent handoff. |
| What is the goal? | Prepare the verified main-based candidate for existing PR #5134. |
| What have I learned? | Main anchors the draft popup to one text node and collapses the selection before storing its focus block; a live full-range anchor corrects placement. |
| What have I done? | Fixed the owner, verified browser geometry and repo gates, generated the registry changelog, and triaged structured review. |
| What is next? | Parent publishes the committed branch to existing #5134 with the PR body naming this plan. |

Open risks:
GitHub PR publication and CI are parent-owned. The pre-existing existing-thread Escape behavior is unchanged. The browser proof used a temporary isolated route that imported the real main registry components; the route was removed before commit.
