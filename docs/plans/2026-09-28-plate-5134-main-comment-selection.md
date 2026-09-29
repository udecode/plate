# Keep comment selections visible on Plate main

Objective:
Port the user-visible fix from [PR #5134](https://github.com/udecode/plate/pull/5134) onto current `main` so opening a draft comment keeps a wrapped or multi-block text selection visible. The [maintainer's comment](https://github.com/udecode/plate/pull/5134#issuecomment-5874697880) requests `main` because `next` has no release lane.

Completion threshold:
A main-based candidate fixes the reproduced placement failure, keeps the marked range clear whenever either side fits, preserves existing discussion behavior, passes the required root check and website typecheck, receives structured review, and is published to the existing PR.

Verification surface:
`/Users/minwook/Documents/Codex/2026-09-24/new-chat-2/work/plate-5134`; `apps/www/src/registry/ui/block-discussion.tsx` and `apps/www/src/registry/components/editor/plugins/comment-kit.tsx`; isolated in-app Browser Use proof of the real main components; `pnpm check`, `pnpm --filter www typecheck`, changelog generator check, and structured Codex autoreview.

Constraints:
Preserve the old `next` branch and original checkout, change only the main comment owner and required release artifact, and keep temporary browser routes/build output out of the commit. The current autoclosure follow-up owns the final PR branch, body, feedback receipts, and checks; merge remains outside scope.

Boundaries:
The local branch `codex/keep-comment-selection-visible-main` starts at `origin/main` `babb3c2a733f821a33569d288e45da3f54eaf643`, confirmed against the live remote on 2026-09-28. The old next candidate remains at `3c9a8df3`. This plan belongs only to existing PR #5134.

Blocked condition:
If the full repository gate fails after one local-artifact correction, stop broad repairs and report exact unchanged baseline diagnostics. If browser placement cannot be observed in current main components, report the limitation before publishing.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| PR and feedback source | yes | Read PR #5134 and all comments; maintainer requested main target. |
| Branch and scope | yes | New main branch from live `babb3c2`; old next branch preserved. |
| Reproduction challenge | yes | Same fixture, text, forward two-block selection, and 900×330 viewport: original main covered the first selected line's full 21px height near the viewport top; the candidate left a 2.5px gap below the last mark. Near the bottom, the original composer was detached by 156.5px; the candidate left a 3.5px gap above the first mark. |
| Browser route | yes | Temporary `/blocks/comment-proof` route used main registry plugins/components; removed before commit. |
| Registry release artifact | yes | Main registry UI behavior changed; MDX changelog source and generated JSON required. |
| Package changeset | no | No package source, exports, or published package behavior changed. |

Work Checklist:
- [x] Read PR #5134, maintainer feedback, main AGENTS and the task, feedback, browser, registry changelog, and autoreview contracts.
- [x] Reproduce the main placement failure before editing; reject a wholesale next-port because its architecture is absent on main.
- [x] Keep the draft focus block before collapsing a multi-block selection and anchor the popover to the merged live rectangles of all draft-marked leaves.
- [x] Let Radix own side, flip, shift, viewport collision, and available-height behavior; do not derive the virtual reference from the popover's measured height.
- [x] Verify short, wrapped, forward/backward multi-block, typing, Escape, scroll, and existing-discussion behavior in the browser.
- [x] Generate and verify the registry changelog; keep package changesets out of this registry-only diff.
- [x] Run the exact root check and post-build website typecheck; preserve logs and classify local-artifact failures separately.
- [x] Run structured autoreview, fix the missing copied-registry dependency, reject only the CI-owned output request, then rerun clean.
- [x] Prepare the local candidate and evidence for the parent; GitHub publication and reply remain parent-owned.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Required root check | yes | Run the exact root command | `pnpm check` exit 0, `work/plate-main-followup/root-check-clean.log`. |
| Website typecheck | yes | Build workspace declarations then typecheck | `pnpm g:build` and `pnpm --filter www typecheck` exit 0, `work/plate-main-followup/www-typecheck-final.log`. |
| Browser placement | yes | Check draft range placement and recovery | Final `/blocks/editor-ai` proof at 900×450: top selection popup y192–257 below mark y169.6–189.6; bottom selection popup y336–401 above mark y404.8–434.8; backward two-block popup y251–316 above marks y320.2–434.8. |
| Browser scroll and existing discussion | yes | Check positioning and preserved thread UI | 100px editor scroll moved the bottom mark y404.8–434.8 to y304.8–334.8 and flipped the popup from y336–401 above to y337–402 below; existing-thread behavior remains outside the draft-only branch. |
| Browser console | yes | Inspect current real-demo proof | Zero console warnings/errors, failed requests, or page errors on `http://localhost:3000/blocks/editor-ai`. |
| Registry changelog | yes | Generate source JSON and check | `generate-ui-changelog-entries.mjs --write` and `--check` passed; source/layout of generator unchanged. |
| Source formatting/lint | yes | Run targeted and root lint | Targeted Biome/ESLint and the root lint stage passed. |
| Autoreview | yes | Structured local Codex review | Accepted the missing `@platejs/floating` registry dependency, rejected only the request to commit CI-owned `public/r` output, then reran clean with zero findings. |
| PR update/comment | yes | Autoclosure follow-up | Existing PR #5134 targets `main`; final body/receipt update remains in the current closure ledger. |
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
- Matched A/B: original `babb3c2` and candidate source used the same temporary route, text, viewport (900×330), selection action, and selected DOM range. Near the top, marked text occupied y46.5–123.5; original popup y4–70 covered the first line y46.5–67.5, while candidate popup y126–192 cleared all marks. Near the bottom, marks occupied y226.5–303.5; original popup y4–70 was detached by 156.5px, while candidate popup y157–223 left a 3.5px gap. The wrapped single-block case showed the same bottom-placement improvement. Source was restored exactly and the temporary route/server removed after comparison.
- Before: on the full `editor-ai` demo at 900×450, selecting wrapped text and pressing ⌘⇧M placed the draft popup at y−130 to −65 while marked text occupied y170–214.
- After: on the isolated current-main components at 900×330, the two-line selected text occupied y226.5–271.5 and the flipped popup ended at y223. A short selected phrase occupied y226.5–247.5 and the popup ended at y223. At 900×450, the same short phrase placed the popup below at y250–316.
- Forward two-block draft: selected marks extended to y303.5; popup ended at y223. Backward two-block draft: focus was in the first block, anchor in the second, both marks persisted and popup began at y146 after selected text ended at y143.5.
- Final architecture follow-up: removed the content-height state, self-measuring virtual reference, and last-client-rect fallback. `@platejs/floating` merges the live rectangles of every draft-marked leaf; Radix owns flip/shift/collision. Draft mode uses Radix's `always` position strategy so the virtual range follows editor scrolling without application-owned scroll listeners.
- Final real-demo proof at 900×450: top mark y169.6–189.6 with popup y192–257; bottom mark y404.8–434.8 with popup y336–401; after 100px editor scroll the mark moved to y304.8–334.8 and the popup flipped to y337–402. Backward multi-block marks occupied y320.2–434.8 and the popup ended at y316. The composer owned focus in every case.
- Existing discussion: clicking `discussion1` showed both existing comments and the reply input. Its Escape behavior is unchanged from main: `open` remains true while the discussion is selected; this is outside the draft-placement fix.
- Commands/logs: targeted Biome and ESLint passed; registry `--check` passed; `pnpm check` exit 0 (`work/plate-main-followup/root-check-clean.log`); post-build `pnpm --filter www typecheck` exit 0 (`work/plate-main-followup/www-typecheck-final.log`). The first exact check was blocked by a preserved inherited `.next-plite` cache with 834,305 generated-file formatter diagnostics; moving that untracked cache outside the repo allowed the unchanged command to pass. The first direct website typecheck lacked package declarations; root build produced them. Temporary stale `.next` route types were removed before the final green website check.

Review outcome:
The closure autoreview found one real install-contract defect: `block-discussion.tsx` imported `@platejs/floating` without declaring it in the registry item. The source metadata now declares it, website typecheck and registry-source checks pass, and the second structured autoreview returned zero findings. Generated `apps/www/public/r` payloads remain CI-owned under `AGENTS.md`; no local registry build output is committed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Verified local candidate ready for parent handoff. |
| What is the goal? | Prepare the verified main-based candidate for existing PR #5134. |
| What have I learned? | Main anchors the draft popup to one text node and collapses the selection before storing its focus block; merged draft-leaf geometry fixes placement without making reference geometry depend on floating-content measurement. |
| What have I done? | Fixed the owner, simplified the virtual anchor, verified real-demo geometry and scroll tracking, generated the registry changelog, and triaged structured review. |
| What is next? | Current autoclosure publishes the final plan/source follow-up to PR #5134, reruns checks/feedback, and posts the exact-head receipt. |

Open risks:
The pre-existing existing-thread Escape behavior is unchanged. When neither viewport side can fit the complete selected range, Radix's standard shift and available-height behavior applies; PR #5127 does not require a custom fragment fallback. Final GitHub delivery and CI remain in the active autoclosure ledger.
