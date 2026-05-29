# sync shadcn home layout styling

Objective:
Implement the accepted `sync-shadcn` home-page layout/styling slice: preserve Plate homepage content and CTAs, apply upstream-inspired spacing/container polish to English and CN home pages, record the partial sync, and verify desktop/mobile browser behavior plus focused checks.

Goal plan:
docs/plans/2026-05-28-sync-shadcn-home-layout-styling.md

Template:
docs/plans/templates/task.md with browser pack.

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser: changed visible homepage routes `/` and `/cn`

Task source:
- type: user acceptance of scoped sync-shadcn plan
- id / link: docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/plan.md
- title: Home layout polish only
- acceptance criteria: tighten hero bottom spacing, widen/contain primary editor preview, keep Plate copy/CTAs/editor preview/CN page, exclude upstream cards/create/Rhea surfaces, update partial sync state, verify browser routes.

Completion threshold:
Done when `apps/www/src/app/(app)/page.tsx` and `apps/www/src/app/cn/page.tsx` contain only layout/styling changes, `docs/sync/shadcn/status.json` records a partial sync without advancing `lastSyncedCommit`, focused lint/typecheck pass, desktop and mobile Chrome checks prove `/` and `/cn` have no horizontal overflow or console/page errors, and check-complete passes.

Verification surface:
- `pnpm --filter www exec eslint src/app/(app)/page.tsx src/app/cn/page.tsx --fix`
- `pnpm --filter www typecheck`
- Chrome/Playwright proof against `http://localhost:3003/` and `http://localhost:3003/cn` at 1200x900 and 390x844.
- `node -e` parse for `docs/sync/shadcn/status.json`.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-home-layout-styling.md`.

Constraints:
- Do not import upstream homepage cards, `/create?preset` CTA, Rhea/style/theme files, or generated registry output.
- Do not run `build:registry`.
- Do not advance `lastSyncedCommit` for this scoped partial sync.
- Preserve existing Plate homepage content, CN route, editor preview, and Pro/Potion path.

Boundaries:
- Source of truth: accepted slice 1 from the scoped home-page sync plan.
- Allowed edit scope: `apps/www/src/app/(app)/page.tsx`, `apps/www/src/app/cn/page.tsx`, `docs/sync/shadcn/status.json`, and this goal plan.
- Browser surface: English and CN home routes.
- Tracker sync: N/A, no external issue.
- Non-goals: upstream card mosaic, create flow, theme/customizer work, registry generation, package/API changes, PR creation.

Output budget strategy:
Use focused file reads, scoped lint/typecheck, JSON status parse, and small browser metric JSON. Store screenshots under `tmp/`; do not stream broad diffs.

Blocked condition:
Blocked only if focused checks fail due to unrelated repo breakage after a targeted rerun, or browser verification cannot reach the running docs server.

Task state:
- task_type: implementation
- task_complexity: small visible UI sync slice
- current_phase: closeout
- current_phase_status: complete
- next_phase: user review
- goal_status: complete after check-complete

Current verdict:
- verdict: implemented
- confidence: high
- next owner: user review
- reason: patch is class-only on the accepted home routes, checked by lint/typecheck and browser metrics.

Completion rule:
All required checklist and gate rows are closed; check-complete must pass before final response.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `sync-shadcn` plan and `task` skill read before edits |
| Active goal checked or created | yes | active goal created for accepted home layout styling slice |
| Source of truth read before edits | yes | scoped plan read before edits |
| Tracker comments and attachments read | N/A | no tracker source |
| Video transcript evidence required | N/A | no video evidence |
| `docs/solutions` checked for non-trivial existing-code work | N/A | scoped plan already carried prior decisions; no new policy research needed |
| TDD decision before behavior change or bug fix | N/A | visual styling slice; browser proof is the right verification |
| Branch decision for code-changing task | yes | no git branch action requested; no proactive git state check per repo instruction |
| Release artifact decision | yes | N/A, docs app layout only; no package release |
| Browser tool decision for browser surface | yes | used Chrome through repo Playwright dependency because in-app browser control tools were unavailable earlier in this session |
| PR expectation decision | yes | N/A, user did not ask for PR |
| Tracker sync expectation decision | N/A | no tracker |
| Output budget strategy recorded | yes | focused output only |
| Browser pack selected | yes | browser pack used |
| Browser route / app surface identified | yes | `/` and `/cn` |
| Browser tool decision recorded | yes | Chrome/Playwright fallback recorded |
| Console/network caveat policy recorded | yes | console/page errors checked; network waterfall not needed for class-only styling |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice is recorded with reason.
- [x] Release artifact requirement recorded: N/A, no package/public API/release artifact.
- [x] Final handoff shape decided: concise implementation summary plus verification.
- [x] Branch handling recorded for code-changing work: no branch action requested; no proactive git state check.
- [x] Local-env-rot retry policy recorded: N/A, checks passed without env-rot signals.
- [x] Workspace authority recorded: verification ran in `/Users/zbeyens/git/plate` against `apps/www`.
- [x] High-risk note recorded: visible browser layout risk was overflow/clipping; proof checked desktop/mobile overflow and console/page errors.
- [x] Review/autoreview target selected from actual diff state or marked N/A: N/A, small class-only styling slice with focused browser proof.
- [x] Agent-native review decision recorded: N/A, no agent/tooling files changed.
- [x] Output budget discipline recorded and followed.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses available Chrome/Playwright fallback after browser-control tool unavailability.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot and exact metrics are ready for final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused checks and browser proof | eslint, typecheck, desktop/mobile Chrome metrics passed |
| Bug reproduced before fix | N/A | Styling sync, not bug | N/A |
| Targeted behavior verification | yes | Browser proof for changed routes | `/` and `/cn` desktop/mobile no overflow/errors |
| TypeScript or typed config changed | yes | Run app typecheck | `pnpm --filter www typecheck` passed |
| Package exports or file layout changed | N/A | No package exports/file layout | N/A |
| Package manifests, lockfile, or install graph changed | N/A | No manifest/lock changes | N/A |
| Agent rules or skills changed | N/A | No agent changes | N/A |
| Workspace authority proof | yes | Run in owning repo/app | commands ran in `/Users/zbeyens/git/plate`; browser hit `localhost:3003` |
| Browser surface changed | yes | Capture route proof | Chrome metrics and screenshot files in `tmp/home-layout.png`, `tmp/home-cn-layout.png` |
| Browser final proof | yes | Record screenshot or exact caveat | screenshots saved; metrics recorded in terminal output |
| CI-controlled template output changed | N/A | No templates/registry output | N/A |
| Package behavior or public API changed | N/A | No package/API | N/A |
| Registry-only component work changed | N/A | No registry component work | N/A |
| Docs or content changed | N/A | Sync status/plan metadata only; no docs content claims changed | N/A |
| High-risk mini gate | yes | Record realistic failure mode and proof | Failure mode: home preview clips or overflows; proof: desktop/mobile overflow false and errors empty |
| Agent-native review for agent/tooling changes | N/A | No agent/tooling changes | N/A |
| Local install corruption suspected | N/A | No suspicious failures | N/A |
| Autoreview for non-trivial implementation changes | N/A | Small class-only home layout slice; focused browser proof is sufficient | N/A |
| PR create or update | N/A | User did not ask for PR | N/A |
| Task-style PR body verified | N/A | No PR | N/A |
| PR proof image hosting | N/A | No PR | N/A |
| Tracker sync-back | N/A | No tracker | N/A |
| Final handoff contract | yes | Fill final response with exact outcome/checks/caveat | final response pending |
| Final lint | yes | Run scoped eslint fix | passed |
| Output budget discipline | yes | No broad output streamed | focused reads/checks only |
| Goal plan complete | yes | Run check-complete | pending command after writing this plan |
| Browser interaction proof | yes | Exercise target routes | `/`, `/cn` loaded in Chrome |
| Browser console/network check | yes | Check console/page errors | error arrays empty; network check N/A for styling-only |
| Browser final proof artifact | yes | Record screenshots/metrics | screenshots saved under `tmp/`; metrics in verification evidence |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | source plan and files read | implementation |
| Implementation | done | home/CN route wrappers updated | verification |
| Verification | done | lint, typecheck, browser metrics passed | closeout |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | done | status JSON updated; check-complete pending then final | final response |

Findings:
- The accepted useful upstream idea was route-level spacing/container polish, not content replacement.
- Desktop preview now uses the full 1200px viewport width without horizontal overflow.
- Mobile preview remains padded at 342px in a 390px viewport without horizontal overflow.

Decisions and tradeoffs:
- Kept Plate's left-aligned copy/CTAs and editor preview.
- Did not adopt upstream centered shadcn marketing card surface or create CTA.
- Applied route-level classes instead of changing shared `PageHeader`, avoiding docs/editor page blast radius.

Implementation notes:
- `apps/www/src/app/(app)/page.tsx`: added tighter home `PageHeader` bottom padding, switched preview wrapper to `container-wrapper`, removed medium+ side padding, allowed large preview full width, and contained preview overflow.
- `apps/www/src/app/cn/page.tsx`: mirrored the English layout change.
- `docs/sync/shadcn/status.json`: appended partialSync entry; baseline unchanged.

Review fixes:
- N/A.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm --filter www exec eslint src/app/(app)/page.tsx src/app/cn/page.tsx --fix` passed.
- `pnpm --filter www typecheck` passed.
- Desktop Chrome 1200x900: `/` and `/cn` both `hasHorizontalOverflow=false`, preview width 1200, errors empty.
- Mobile Chrome 390x844: `/` and `/cn` both `hasHorizontalOverflow=false`, preview width 342, errors empty.
- `docs/sync/shadcn/status.json` parsed after partialSync update.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A.
- Confidence line: high.
- Flow table:
  - Reproduced: source plan accepted; browser before/after not required.
  - Verified: eslint/typecheck passed; browser proof passed.
- Browser check: Chrome desktop/mobile for `/` and `/cn`.
- Outcome: Home/CN layout polished while Plate content preserved.
- Caveat: Full sync baseline remains pending because this is scoped partial sync.
- Design:
  - Chosen boundary: route-level wrappers/classes on home pages.
  - Why not quick patch: avoided shared primitive changes that would affect docs/editors.
  - Why not broader change: upstream cards/create/Rhea surfaces are explicitly excluded.
- Verified: focused lint, typecheck, browser metrics.
- PR body verified: N/A.

Task-style PR body contract:
- N/A, no PR requested.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: desktop/mobile Chrome metrics plus screenshots in `tmp/`.
- Caveats: `lastSyncedCommit` unchanged.

Timeline:
- 2026-05-28T23:20:53.018Z Task goal plan created.
- 2026-05-29 Accepted sync-shadcn home layout slice read.
- 2026-05-29 Implemented home/CN route layout classes.
- 2026-05-29 Ran eslint, typecheck, desktop/mobile browser proof.
- 2026-05-29 Recorded partial sync in status JSON.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | Final response to user. |
| What is the goal? | Implement accepted home layout/styling slice. |
| What have I learned? | Route-level layout is enough; shared header primitive does not need change. |
| What have I done? | Updated English/CN home layout, verified, and recorded partial sync. |

Open risks:
- The visual preference for full-width desktop editor preview is subjective; browser proof confirms it is technically clean, but user review decides taste.
