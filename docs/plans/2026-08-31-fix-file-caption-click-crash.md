# Fix file caption click crash

Objective:
Fix the File figcaption click crash; done when the exact repro turns red-to-green, focused checks pass, and Browser replay passes 5/5; plan docs/plans/2026-08-31-fix-file-caption-click-crash.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-fix-file-caption-click-crash.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user bug report plus local MP4 attachment
- id / link: `/Users/felixfeng/Library/Application Support/CleanShot/media/media_r3yWt4OGKW/CleanShot 2026-08-31 at 22.25.46.mp4`
- title: Clicking a File element and then its text crashes the browser
- acceptance criteria: reproduce the reported `NotFoundError` at `figcaption`; fix the durable File/caption owner; add regression coverage; pass focused tests and lint; run the applicable review gate; and pass 5/5 retry-free Browser replays with no matching console error. The repo-wide typecheck may close with an unrelated-baseline caveat after the mandated reinstall retry.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A: the user did not request a timed run
- initial confidence score: N/A: completion uses binary red/green and 5/5 replay gates
- improvement loop: N/A: no timed checkpoint
- final score / loop closure: N/A: no timed checkpoint

Completion threshold:
- The reporter's click path fails before the fix and passes after it.
- A behavior-level regression test and focused owning-package checks pass.
- A fresh Browser session completes the click path 5/5 times without `NotFoundError`, `removeChild`, a React DOM crash, or broken follow-up text interaction.
- P1 autoreview is clean, or is N/A with a direct diff review because the current `next` branch explicitly forbids autoreview.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-file-caption-click-crash.md` passes.

Verification surface:
- Normalized MP4 transcript and targeted frame inspection.
- Focused File/caption unit and browser tests, attempted `www` typecheck, and scoped lint.
- Browser replay on the exact local route discovered from the recording/current app, including console errors and follow-up text interaction.
- P1 autoreview when branch policy allows it; otherwise direct review of the exact local diff.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: attached recording, the user's `Uncaught NotFoundError`, current File/caption implementation, and current tests.
- Allowed edit scope: the owning File/caption component or plugin, its focused test/proof, required changeset, and this plan.
- Browser surface: local File example/route identified by the recording and source trace; the ambient `localhost:3001` tab is a lead, not reporter evidence by itself.
- Browser strategy: use Browser for exact reproduction and final replay. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no public issue or PR was provided.
- Non-goals: unrelated editor behavior, public API redesign, PR/commit/push, public tracker mutation, and broad repo cleanup.

Output budget strategy:
- Search exact `figcaption`, File, caption, and `removeChild` owners first. Cap source reads to named files and command output to 20k tokens. Exclude generated output, dependencies, build folders, and binaries from broad searches. Save transcript/frame artifacts outside streamed output when needed.

Blocked condition:
- Stop only if the attached video cannot be read and no exact route/action can be reconstructed, or the local app cannot render the reporter path after three distinct setup attempts. A package-only proxy cannot upgrade that state to fixed.

Task state:
- task_type: Plate browser behavior regression
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: candidate-local verified
- confidence: high
- next owner: user Git workflow if commit or PR is wanted
- reason: the exact case is red-before-green, focused tests and lint pass, and both Playwright and Browser pass 5/5 on a fresh process; only unrelated repo-wide typecheck errors remain.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-file-caption-click-crash.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User report, exact error, MP4 path, scope, non-goals, proof, and handoff rows recorded above before implementation |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Read `patch`, `autogoal`, `video-transcripts`, `unslop`, `learnings-researcher`, Browser, registry changelog, and autoreview rules as applicable |
| Active goal checked or created | yes | Created goal for this plan after `get_goal` returned none |
| Source of truth read before edits | yes | MP4 transcript/frames, live Browser error, `caption.tsx`, File, TOC, DOM coverage, and tests read |
| Tracker comments and attachments read | yes | Local MP4 attachment read; N/A for tracker comments because no tracker was provided |
| Video transcript evidence required | yes | Normalized XML generated from the supplied MP4 and frames inspected |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read two matching React DOM ownership learnings; critical-patterns file is absent |
| TDD decision before behavior change or bug fix | yes | Browser red repro and failing Playwright case recorded before the fix |
| Branch decision for code-changing task | yes | Kept the current `next` checkout; no branch switch or Git mutation authorized |
| Release artifact decision | yes | Registry-only change: registry changelog required; package changeset N/A |
| Browser tool decision for browser surface | yes | Browser for exact UI path; Chromium Playwright for durable regression; Chrome/Computer N/A because no exact browser family or native OS surface was reported |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no public tracker provided |
| Output budget strategy recorded | yes | Exact-file searches and output caps recorded above; two noisy reads are recorded under Error attempts |
| Browser pack selected | yes | `browser` pack applied |
| Browser route / app surface identified | yes | Reporter root `http://localhost:3001/`; isolated proof route `/blocks/editor-ai` |
| Browser tool decision recorded | yes | Browser and Playwright roles recorded above |
| Console/network caveat policy recorded | yes | Final proof rejects `NotFoundError`; external PDF navigation proved unnecessary and was excluded from the oracle |
| Observable browser case captured | yes | `media-caption:file-selection-to-toc-navigation`: load editor-ai, click `sample.pdf`, click TOC `Images and Media`, click heading, keep editor usable with zero runtime errors; dirty ref and fingerprints recorded below |

Work Checklist:
- [x] N/A: no duration was requested. If a duration was requested, it is recorded as minimum active work unless
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
- [x] Release artifact requirement recorded: registry changelog added; changeset N/A because no published package changed.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: current `next` checkout retained; no Git mutation requested.
- [x] Local-env-rot retry policy recorded and exercised: `pnpm run reinstall` ran once, then the exact typecheck reran with the same unrelated errors.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded: risk was another React DOM ownership crash; shared Caption is the narrow owner and exact Browser replay is the proof.
- [x] Review/P1 autoreview marked N/A: the current branch is `next`, where repo rules forbid autoreview; direct review covered all 9 issue-owned files.
- [x] N/A: no `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling changed.
- [x] Output budget discipline recorded and followed after two recorded noisy reads: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console errors checked; external PDF network navigation is out of scope because the crash reproduces without it.
- [x] Browser pack: screenshot is N/A because this is a runtime-crash claim; DOM visibility plus captured runtime-error ledger proves the outcome.
- [x] N/A: no paint claim. Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] N/A for pushed-ref wording: no commit/push was requested. A fresh isolated `.next-plite` process on the final local code and file fingerprints proves the candidate-local state.
- [x] Browser pack: React DOM lifecycle case passed 5/5 retry-free in Chromium Playwright and 5/5 in Browser on a fresh process.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named focused proof | Unit 9/9, lint pass, Playwright 5/5, Browser 5/5, changelog check pass |
| Bug reproduced before fix | yes | Record failing test/repro | Manual Browser and Playwright both failed with the exact `NotFoundError` before the fix |
| Targeted behavior verification | yes | Run focused test/proof | Exact case, follow-up title input, and undo pass |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./apps/www` ran twice, once after required reinstall; it remains blocked by 27 unrelated errors in 7 existing AI API/browser files and reports no issue-owned file |
| Package exports or file layout changed | no | N/A | No package export or file-layout change |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest or lockfile change; reinstall was diagnostic only |
| Agent rules or skills changed | no | N/A | No agent source changed |
| Workspace authority proof | yes | Use owning repo/app/route | All commands ran in `/Users/felixfeng/Desktop/repos/plate`; browser proof used `/blocks/editor-ai` |
| Browser surface changed | yes | Capture Browser proof | Fresh-process Browser ledger 5/5 with editor and heading visible |
| Browser final proof | yes | Record final Browser evidence | Five runs, zero `NotFoundError`, exact click path, final fingerprints below |
| CI-controlled template output changed | no | N/A | No `templates/**` change |
| Package behavior or public API changed | no | N/A | Registry-only implementation; no package changeset |
| Registry-only component work changed | yes | Add registry changelog and regenerate | MDX plus generated changelog JSON and `public/r/caption.json`; generator check passes |
| Docs or content changed | no | N/A | Only generated registry changelog artifacts and this internal plan |
| High-risk mini gate | yes | Record failure mode and owner | Deferred selection caused React/Plite DOM ownership conflict; shared Caption keeps one DOM subtree mounted |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling change |
| Local install corruption suspected | yes | Reinstall once and rerun | `pnpm run reinstall` passed; identical unrelated typecheck failures remained |
| P1 autoreview for non-trivial implementation changes | no | N/A | Current branch is `next`; repo rule explicitly forbids autoreview. Direct review of the exact 9-file local bundle found no actionable issue |
| PR create or update | no | N/A | User did not request PR or Git mutation |
| Task-style PR body verified | no | N/A | No PR |
| PR proof image hosting | no | N/A | No PR |
| Tracker sync-back | no | N/A | No public tracker |
| Final handoff contract | yes | Fill final fields | Filled below |
| Final lint | yes | Run scoped equivalent | `pnpm exec ultracite check` passes for all changed code/test files |
| Output budget discipline | yes | Record misses and recovery | Two noisy reads and one verbose generator output recorded; all later searches were scoped/capped |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run final checker | `[autogoal] complete: docs/plans/2026-08-31-fix-file-caption-click-crash.md` |
| Browser interaction proof | yes | Exercise exact path | Browser fresh-process exact replay 5/5 |
| Browser console/network check | yes | Check runtime errors | Zero `NotFoundError`; PDF network path excluded because it is not required to reproduce |
| Browser final proof artifact | yes | Record route/runtime ledger | `/blocks/editor-ai`, five rows with editorVisible=true, headingVisible=true, notFoundErrors=0 |
| Exact case replay | yes | Prove end state | File click -> TOC click -> heading click; editor remains usable; Playwright additionally types and undoes `!` |
| Final ref and fingerprints | yes | Record ref/hashes | `dirty:12d875e8ad4beea9463d9da9ab4f590bdfac63b1`; hashes below |
| Clean final runtime | no | N/A for pushed-ref wording | No commit/push requested; fresh isolated process proves only the fingerprinted local candidate |
| Retry-free stability | yes | Record 5/5 | Playwright 5/5 and Browser 5/5, retries disabled |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | MP4 transcript/frames, exact Browser repro, source and prior-learning audit | implementation |
| Implementation | completed | Shared Caption keeps direct children mounted and toggles native `hidden`; focused tests and registry entry added | verification |
| Verification | completed | Unit 9/9, lint pass, Playwright 5/5, Browser 5/5, generator check pass; unrelated typecheck caveat recorded | closeout |
| PR / tracker sync | completed | N/A: neither requested | final response |
| Closeout | completed | Direct diff review, ref and fingerprints recorded | final response |

Findings:
- Normalized video transcript: the user opens `sample.pdf`, returns to the homepage editor, then interacts with the Table of Contents before the page shows "This page couldn't load".
- Frame inspection narrows the visible path: after return, File remains selected; the next relevant click is the Table of Contents button "Images and Media".
- Browser red repro `file-caption-node-selection-to-toc`: on `http://localhost:3001/`, reload, click the `sample.pdf` link, then click the Table of Contents button "Images and Media". The page immediately becomes "This page couldn't load" and logs `NotFoundError: Failed to execute 'removeChild' on 'Node'` from React DOM.
- The PDF navigation is not required. Browser reproduced the crash while the current page stayed at `http://localhost:3001/`.
- File renders the shared registry `Caption`; inactive empty captions use `slots.contentBoundary({ mounted: false, reason: 'app-hidden' })`. Existing unit tests cover each static state but not the selected-to-unselected transition in the real editor.
- Relevant prior learning: React `removeChild` means browser/editor code changed a DOM child React still believed it owned. Fix the ownership boundary, not the thrown deletion call. `docs/solutions/patterns/critical-patterns.md` is absent in this checkout.
- Root cause: File node selection is delivered through a deferred selector. The empty caption changed between an unmounted DOM-coverage placeholder and a live editable `<figcaption>` during a later navigation/render commit. React and Plite then reconciled different parentage for the same editable child and React threw `removeChild`.
- Fixed owner: shared registry `Caption`, so File, audio, video, image, and embed captions use one stable DOM lifetime. Empty inactive captions stay mounted but use the native `hidden` attribute.

Decisions and tradeoffs:
- Keep the fix in shared `Caption` -> every media caller used the same failing lifetime policy; a File-only guard would leave the bug class intact.
- Keep empty caption content mounted -> it is an empty direct text child, so hidden DOM adds no copy/find text while avoiding a deferred mount/unmount race.
- Do not modify Plite `useElementSelected` -> deferred selection is an intentional shared performance contract and the bug came from app-owned conditional DOM lifetime.
- No package changeset -> only copied registry code changed; use the registry changelog instead.

Implementation notes:
- `Caption` always renders one `<figcaption>` and obtains canonical children from `slots.children()`.
- `hidden={!active && empty}` preserves the existing visual behavior without removing the editable subtree.
- Browser case `media-caption:file-selection-to-toc-navigation` covers File click, TOC navigation, heading click, follow-up input, undo, and runtime errors.
- `next` registry output rebuilt with `pnpm --filter www build:registry`.

Review fixes:
- Direct 9-file review: no accepted actionable finding. Public generated `caption.json` matches the source; changelog source/generated JSON agree; `git diff --check` passes.
- Autoreview N/A: current branch `next` forbids it.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `ffmpeg` build lacks `drawtext` | 1 | Extract untitled high-frequency frames | Resolved with tiled frames and individual timestamps |
| Broad source search included one-line generated `apps/www/public/tailwind.css` | 1 | Exclude `public`, generated output, and dependencies | Resolved; later searches are named-file scoped |
| Browser heading click timed out after the TOC click | 1 | Inspect page state and error logs instead of retrying | Resolved: the TOC click had already crashed the page |
| First post-fix follow-up assertion could not find exact old heading name | 1 | Inspect screenshot, then use stable `h3` locator | Resolved: screenshot showed successful `Images and Media!` input; locator fixed |
| Fresh normal Next dev process on 3101 refused the second lock | 1 | Use repo-isolated `.next-plite` mode without stopping the user's 3001 process | Resolved: fresh 3101 process served the exact block route |
| First 3101 Browser tab remained on Chromium's connection-error data URL | 1 | Create a fresh Browser tab after the server was ready | Resolved: fresh tab completed 5/5 |
| `www` typecheck missing multiple unrelated `@platejs/*` modules | 2 | Run mandated reinstall once, rerun exact command, then stop broad repair | Unresolved baseline: identical 27 errors in 7 non-issue files; no issue-owned file reported |

Verification evidence:
- Red browser proof, cwd `/Users/felixfeng/Desktop/repos/plate`, Browser at `http://localhost:3001/`: File click then TOC `Images and Media` click -> crash page plus exact `NotFoundError`.
- Red test: `PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm --filter www test:www-browser:chromium tests/browser/media-caption.spec.ts` -> editor locator disappears after exact TOC click.
- Unit: `bun test apps/www/src/registry/components/editor/caption.spec.tsx` -> 9 pass, 0 fail.
- Lint: `pnpm exec ultracite check apps/www/src/registry/components/editor/caption.tsx apps/www/src/registry/components/editor/caption.spec.tsx apps/www/tests/browser/media-caption.spec.ts` -> pass.
- Browser test: `PLAYWRIGHT_BASE_URL=http://localhost:3101 pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/media-caption.spec.ts --repeat-each=5` -> 5/5, retries disabled.
- Browser plugin: fresh isolated process `http://localhost:3101/blocks/editor-ai`; 5/5 rows have `editorVisible=true`, `headingVisible=true`, `notFoundErrors=0`.
- Registry: `pnpm --filter www build:registry` and changelog generator `--check` -> pass.
- Typecheck caveat: `pnpm turbo typecheck --filter=./apps/www` fails with 27 unrelated errors both before and after `pnpm run reinstall`; no issue-owned file is in the error set.
- Final ref: `dirty:12d875e8ad4beea9463d9da9ab4f590bdfac63b1`.
- Production `caption.tsx`: `d956468a04aeb380fe043a95c3a453fd3534178c3d93ee6bb31151dbb69bbc41`.
- Unit test `caption.spec.tsx`: `d4e748e3f88ad8e431795eba9acc8275659e204b74cf7680b9989fa90e735e77`.
- Browser harness `media-caption.spec.ts`: `c6d3871f234d75703a5d67127211fe480844aabc4f6d9eb8c21944da6959f6dc`.
- Fixture `plate-editor.tsx`: `8b2587d9bdc99be3735f7300d79e6ec712c7d8704c3653be4de50dc251b5dc69`.
- Generated registry `caption.json`: `94f1ef564d94602777309d8e198ab6f02a8d2b286dccf5635bbb66780fd0daef`.
- Goal checker: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-file-caption-click-crash.md` -> complete.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no public tracker supplied
- Confidence line: high for the fingerprinted local candidate; exact reporter path passes 5/5 in two browser lanes
- Flow table:
  - Reproduced: Playwright red, Browser red with exact `NotFoundError`
  - Verified: unit 9/9, Playwright 5/5, Browser 5/5, lint and registry checks pass
- Browser check: fresh isolated process; exact File -> TOC text -> heading click path; zero matching runtime errors
- Outcome: shared Caption DOM lifetime fixed; empty inactive captions remain visually hidden
- Caveat: repo-wide `www` typecheck has 27 unrelated baseline errors after the required reinstall retry; no commit or push was requested
- Design:
  - Chosen boundary: shared registry `Caption`
  - Why not quick patch: a File-only catch would leave other empty media captions exposed
  - Why not broader change: Plite's deferred selector is intentional; stable app-owned DOM fixes the failing contract
- Verified: commands, browser ledgers, ref, and fingerprints recorded above
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
- PR: N/A: not requested
- Issue / tracker: N/A: none provided
- Browser proof: exact case 5/5 in Playwright and 5/5 in Browser on fresh process
- Caveats: unrelated `www` typecheck baseline; local uncommitted candidate only

Timeline:
- 2026-08-31T14:26:50.610Z Task goal plan created.
- 2026-08-31 Exact Browser and Playwright repro captured red.
- 2026-08-31 Shared Caption DOM lifetime fixed and tests added.
- 2026-08-31 Registry changelog and generated payload rebuilt on `next`.
- 2026-08-31 Reinstall retry completed; unrelated typecheck baseline persisted.
- 2026-08-31 Final unit, lint, Playwright 5/5, Browser 5/5, generator, diff, and fingerprint checks recorded.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Fix the File-to-text `figcaption` crash with durable coverage and 5/5 Browser proof |
| What have I learned? | Deferred File selection exposed an app-owned caption DOM lifetime race |
| What have I done? | Fixed shared Caption, added tests/changelog/generated output, and recorded red/green proof plus caveat |

Open risks:
- Repo-wide `www` typecheck remains red from 27 existing errors in 7 unrelated files after the required reinstall retry.
- The work is uncommitted and unpushed; proof applies only to the recorded dirty ref and hashes.
