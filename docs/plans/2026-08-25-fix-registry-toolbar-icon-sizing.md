# Fix registry toolbar icon sizing

Objective:
Fix oversized registry toolbar icons; done when exact editor preview geometry,
focused coverage, and fresh Browser proof pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-25-fix-registry-toolbar-icon-sizing.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: user screenshot and local visual bug report
- id / link: `codex-clipboard-7766cc3a-8f81-4cf8-9cee-b8defbb0ce28.png`
- title: Registry editor toolbar icons render far larger than their controls
- acceptance criteria: reproduce the attached toolbar on its exact route;
  restore the intended icon geometry without shrinking text or controls;
  preserve toolbar interactions and layout; add focused coverage when sane;
  finish with a fresh Browser screenshot and zero task-owned console errors.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; none requested
- semantics: N/A
- initial confidence score: N/A; exact binary visual and geometry proof exists
- improvement loop: reproduce, identify the first wrong owner, patch it, and
  rerun the same route plus adjacent generated-output proof
- final score / loop closure: N/A

Completion threshold:
- The exact screenshot surface reproduces at least one oversized toolbar SVG
  before the fix and renders every affected toolbar SVG at its intended control
  size after the fix.
- The durable registry/component owner has focused regression coverage or a
  recorded reason why Browser geometry is the only honest proof.
- Any registry output affected by the owner is regenerated through
  `pnpm --filter www build:registry`; generated files are never hand-edited.
- A fresh Browser process/page on the final runtime files proves the toolbar,
  neighboring text/controls, and interactions with zero task-owned errors.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-fix-registry-toolbar-icon-sizing.md` passes.

Verification surface:
- Exact Browser route and SVG bounding boxes before and after the fix.
- Focused registry/component test that owns icon sizing, when sane.
- Scoped Ultracite, affected typecheck, and registry generation when applicable.
- Source audit that no caller-specific icon-size workaround or template edit
  entered the patch.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve typography, button dimensions, toolbar overflow, and editor behavior.
- Do not edit `templates/**`, generated registry JSON by hand, public APIs,
  packages, docs, or agent rules unless the root cause proves they own the bug.
- Do not commit, push, create a PR, or contact another task/chat.

Boundaries:
- Source of truth: the attached screenshot, exact local route, canonical
  registry toolbar/button/icon source, and generated registry materializer.
- Allowed edit scope: the smallest canonical `apps/www` registry/component
  source and focused test needed to repair icon geometry.
- Browser surface: exact local page containing `Preview`, `Code`, and
  `An AI editor`; resolve its route from current source before editing.
- Browser strategy: Browser for DOM geometry, interaction, console, and final
  screenshot. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; no issue or tracker was named.
- Non-goals: redesigning the toolbar, changing registry provider semantics,
  fixing unrelated shared-package failures, or touching templates.

Output budget strategy:
- Search exact screenshot copy and icon selectors first. Exclude generated
  payload bodies, templates, node_modules, build output, and unrelated package
  trees. Cap reads to owning files and save long server/test logs under `/tmp`.

Blocked condition:
- Stop only if the exact route cannot be identified or rendered from current
  source after three distinct owner/route checks, or if another process changes
  the same runtime owner repeatedly enough to invalidate final proof.

Task state:
- task_type: local Plate registry UI visual regression
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: actionable visual defect
- confidence: high from the attached screenshot
- next owner: patch
- reason: toolbar SVGs visibly scale like surrounding text instead of fitting
  their buttons; current source and browser geometry can falsify the fix.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-fix-registry-toolbar-icon-sizing.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact visual defect, preservation constraints, proof, and no-public-mutation boundary are recorded above. |
| Timed checkpoint parsed | N/A | No duration was requested. |
| Skill analysis before edits | yes | `patch` owns one local visual behavior bug; `autogoal` owns the measurable browser-backed lifecycle. |
| Active goal checked or created | yes | A new matching goal was created for this plan. |
| Source of truth read before edits | yes | Exact route is `/`; `PlaygroundPreview` renders the aliased site toolbar over canonical Base/Radix sources. |
| Tracker comments and attachments read | yes | The supplied PNG was inspected at original resolution; no tracker exists. |
| Video transcript evidence required | N/A | The evidence is a still screenshot, not video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | No existing solution owns registry marker materialization or toolbar icon geometry. |
| TDD decision before behavior change or bug fix | yes | Capture failing SVG geometry on the exact Browser route; add a focused source/transform test if that owner can express the invariant. |
| Branch decision for code-changing task | N/A | Work stays in the user-authorized current checkout; no PR or branch operation was requested. |
| Release artifact decision | N/A | Website adapter and sync artifact only; installed registry toolbar payloads were already correct and regeneration produced no task-owned toolbar payload diff. |
| Browser tool decision for browser surface | yes | Use Browser; no native Chrome or OS behavior is involved. |
| PR expectation decision | N/A | No PR was requested. |
| Tracker sync expectation decision | N/A | No tracker was named. |
| Output budget strategy recorded | yes | Exact-string and selector searches only; generated bodies and unrelated trees excluded. |
| Browser pack selected | yes | The defect is visual DOM geometry. |
| Browser route / app surface identified | yes | `http://localhost:3000/`; adjacent style route `/create-preview?base=base&editor=editor-ai&style=luma`. |
| Browser tool decision recorded | yes | Browser owns reproduction and final proof. |
| Console/network caveat policy recorded | yes | Record task-owned warning/error logs; unrelated known docs errors do not certify or block this route. |
| Observable browser case captured | yes | `registry-toolbar-icons-oversized`; source is the attached PNG; exact route to resolve; load the AI editor preview and assert toolbar SVG boxes fit their controls instead of rendering near text height. |

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
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | 26 unclassed icons are 14x14; 45 total icons have max dimension 16px; toolbar controls retain at least 28px height. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Browser measured unclassed SVGs at 24x24 inside 24px controls; focused class-materialization test failed red on missing `h-7`. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Toolbar suite 6/6; style transform suite 7/7; Browser geometry and Table menu pass. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed on final source. |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | No package export or layout change. |
| Package manifests, lockfile, or install graph changed | N/A | Run `pnpm install` and relevant package checks | No manifest, lockfile, or install change. |
| Agent rules or skills changed | N/A | Run `pnpm install` and verify generated skill sync | No agent files changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Tests, registry build, lint, and typecheck ran from `/Users/zbeyens/git/plate-2`; Browser ran the owning `www` route. |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | Fresh `www` process and fresh Browser tabs verified `/` and Base/Luma create preview. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | `/tmp/plate-toolbar-icons-fixed.png`; fresh homepage geometry and interaction ledger recorded below. |
| CI-controlled template output changed | N/A | Restore generated template output or record why it is intentionally kept | No `templates/**` edit. |
| Package behavior or public API changed | N/A | Add a changeset or record why no changeset applies | Website-only internal adapter; no package/public API change. |
| Registry-only component work changed | N/A | Update `docs/components/changelog.mdx` or record N/A | Installed registry payload was already correct; no user-installable toolbar payload changed. |
| Docs or content changed | N/A | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | No user docs/content change. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk was cross-style class collision. Provider carries the selected style; Nova homepage and Base/Luma preview prove distinct mappings. |
| Agent-native review for agent/tooling changes | N/A | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | No agent/tooling surface changed. |
| Local install corruption suspected | N/A | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | No install-corruption signature occurred. |
| P1 autoreview for non-trivial implementation changes | N/A | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | Repo rule forbids `autoreview` on `next`; scoped lint, typecheck, tests, generated-output build, and Browser proof replace it. |
| PR create or update | N/A | Run `check` before PR work and sync PR body to the task-style final handoff | User did not request a PR. |
| Task-style PR body verified | N/A | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | No PR. |
| PR proof image hosting | N/A | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | No PR. |
| Tracker sync-back | N/A | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped `pnpm exec ultracite check` passed all seven changed source/test files. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One generated JSON diff read was accidentally large and truncated; all later reads were scoped to names, stats, or owning files. |
| Timed checkpoint | N/A | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | No duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-fix-registry-toolbar-icon-sizing.md` | Run after this ledger update. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Table menu `aria-expanded`: false -> true -> false; geometry stayed max 16px, toolbar height 41px. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Fresh Browser logs contain only React DevTools info and HMR connection; fresh server returned HTTP 200 with no task-owned error. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Screenshot `/tmp/plate-toolbar-icons-fixed.png`. |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Exact homepage labels `Preview`, `Code`, `An AI editor`; 45 toolbar SVGs, 26 unclassed at 14x14, explicit at 14/16. |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Base ref `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`; fingerprints recorded below. |
| Clean final runtime | N/A | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | Local uncommitted candidate in the shared checkout; fresh process/page proof is valid locally but is not pushed delivery proof. |
| Retry-free stability | N/A | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Static toolbar sizing and menu state, not a native lifecycle case. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Exact route, before geometry, raw-marker adapter, and installed payload boundary identified | implementation |
| Implementation | complete | Site provider carries style; toolbar/popover adapters materialize selected marker classes; create preview delegates to adapter | verification |
| Verification | complete | Focused suites, scoped lint, registry build, www typecheck, Browser geometry/interaction/logs | closeout |
| PR / tracker sync | N/A | Neither requested | final response |
| Closeout | complete | Final ledger, fingerprints, screenshot, and caveat recorded | final response |

Findings:
- Installed Base/Radix style payloads already contained the upstream icon-size
  selectors. The defect existed only on the website, which rendered raw
  `cn-*` markers without adding the selected style's static classes.
- The preview-class generator deliberately removed nested SVG selectors, so the
  adapter could not recover default icon geometry.
- Applying a Nova fallback inside canonical registry toolbar source would leak
  Nova into every generated style and create conflicting size rules.

Decisions and tradeoffs:
- Keep provider semantics unchanged: implicit site provider remains Radix; the
  existing `/create` registry default remains Base.
- Add selected style to the internal site-provider context and materialize
  toolbar, tooltip, and popover marker classes in the site adapters.
- Preserve upstream style variation: Nova small icons resolve to 14px while
  Luma preview icons remain 16px.

Implementation notes:
- Expanded generated preview markers to all toolbar size/variant and tooltip
  classes, and retained upstream nested SVG selectors.
- Removed manual style assembly from `CreatePreview`; the adapter owns it.
- `pnpm --filter www build:registry` completed: 380 canonical payloads and 15
  sparse overlays. It produced no task-owned toolbar payload change, confirming
  the install surface was already correct.

Review fixes:
- Removed the attempted implicit Base provider switch after fresh runtime proof
  exposed an unrelated Base UI accessibility warning on the full homepage.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Ran `bun test` from `apps/www`, bypassing the root DOM preload | 1 | Use the root fast-suite runner | Red test then passed through `pnpm test <file>`. |
| Used nonexistent `ultracite format` command | 1 | Read CLI help and use `ultracite fix` | Scoped fix/check passed. |
| Tried a text-dropdown selection whose locator timed out | 1 | Exercise the accessible Table menu instead | Table menu opened and closed with exact ARIA proof. |
| Tried unsupported Browser element screenshot API | 1 | Capture the visible page with `tab.screenshot()` | Screenshot saved to `/tmp/plate-toolbar-icons-fixed.png`. |

Verification evidence:
- Before: exact `/` route had 45 SVGs; unclassed Lucide icons measured 24x24
  and collapsed their controls to 24px.
- Tests: toolbar suite 6/6 and registry style-transform suite 7/7.
- Static gates: scoped Ultracite clean; final `pnpm --filter www typecheck`
  passed; registry build completed.
- Final Browser: 45 icons, 26 unclassed icons all 14x14, explicit icons 14x14
  or 16x16, max SVG 16px, minimum icon-control height 28px, toolbar 41px.
- Interaction: Table menu false -> true -> false; post-interaction geometry
  unchanged. Base/Luma create preview reports base `base`, style `luma`, 32px
  control, 16px icon.
- Fresh logs: React DevTools info and HMR only; no warning/error.
- Runtime fingerprints:
  - provider `4268bf441ea01207cbab89be65fa3283b50af8a59b538481e14f3604fe0cf1dc`
  - toolbar adapter `0088ca612b31a62ff4d97eb55425355f743582b2929b11dd895f250b9be75b6b`
  - popover adapter `1da00314f0514c2a6d232db4a310ae1de2d6dec4434e8df6fb550cbbf8ca4b99`
  - create preview `b39bd11c635e8a8322c8b51645a154846bb1ea8b0373b8249852cbf1dec9771d`
  - preview classes `18ad8f305076b5ffd6fe1db7f11e2cbaf9870d42d301437c795d280f08b7b69d`
  - sync harness `f622c9c701ae790b79bce138286b6c60179651c9a4271ec0083482b04c42f2d0`
  - toolbar test `0fae016fbd4a1dfd3825b4713e77ae1b71cb44f46ab6096aef7bb1fb73181af9`
  - transform test `8d22285811ae48c45d5288e0795bdd3dd84287e4f9d54312343d57b4cea254ec`

Final handoff contract:
- PR line: N/A; no PR requested.
- Issue / tracker line: N/A; none named.
- Confidence line: high for the local candidate; exact geometry, interaction,
  tests, build, typecheck, and fresh logs pass.
- Flow table:
  - Reproduced: focused test red; Browser 24x24 unclassed SVGs.
  - Verified: focused suites green; Browser 14x14 unclassed SVGs.
- Browser check: passed on `/` and Base/Luma create preview.
- Outcome: Site registry toolbar icons inherit the selected shadcn style again.
- Caveat: Local uncommitted candidate; no pushed/deployed claim.
- Design:
  - Chosen boundary: website registry adapters plus their generated style map.
  - Why not quick patch: caller-specific icon classes would erase style-specific sizing.
  - Why not broader change: canonical registry and installed payloads were already correct.
- Verified: exact commands and Browser evidence listed above.
- PR body verified: N/A; no PR.

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
- PR: N/A; not requested.
- Issue / tracker: N/A; none named.
- Browser proof: passed; screenshot `/tmp/plate-toolbar-icons-fixed.png`.
- Caveats: local candidate only; shared checkout contains unrelated work.

Timeline:
- 2026-08-25T21:49:10.174Z Task goal plan created.
- 2026-08-25T22:07:00Z Exact red, adapter repair, focused tests, registry
  generation, typecheck, lint, fresh Browser geometry, interaction, logs, and
  screenshot completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Restore exact toolbar icon geometry on the website without changing installed style variants. |
| What have I learned? | See Findings |
| What have I done? | Repaired selected-style materialization and proved the exact visual case. |

Open risks:
- No task-owned runtime risk remains in local proof. Delivery is unverified
  because the work is not committed, pushed, or deployed.
