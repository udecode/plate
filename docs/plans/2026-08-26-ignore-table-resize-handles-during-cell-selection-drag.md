# Ignore table resize handles during cell selection drag

Objective:
Ignore table resize handles during cell-selection drag; done when exact repro turns red-to-green and passes 5/5 browser runs; plan docs/plans/2026-08-26-ignore-table-resize-handles-during-cell-selection-drag.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-ignore-table-resize-handles-during-cell-selection-drag.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user regression report
- id / link: `table-selection:ignore-resize-handle-hover`
- title: Ignore resize handles during an active table cell-selection drag
- acceptance criteria: While mouse-down cell selection is active, moving the
  pointer over a resize handle preserves the last valid cell range and does not
  begin resizing; returning to cells continues normal selection before mouse-up.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: exact red/green and 5/5 threshold is stronger
- improvement loop: reproduce, fix the literal owner, replay focused proof
- final score / loop closure: N/A: close only on the named pass gates

Completion threshold:
- The exact real-pointer regression fails before the product fix, passes after
  it, and passes 5/5 retry-free warm browser runs.
- Focused owning-package tests, typecheck, scoped lint, Browser proof, changeset
  decision, and P1 review close with zero accepted actionable findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-ignore-table-resize-handles-during-cell-selection-drag.md` passes.

Verification surface:
- Exact browser row in `apps/www/tests/browser/table-selection.spec.ts` on the
  standalone table demo, including drag-time range and no-resize assertions.
- Focused controller/component unit coverage at the literal event owner when
  the failure is expressible below the browser.
- Owning package typecheck/test, scoped Ultracite, fresh-process Browser replay,
  5/5 warm runs, file fingerprints, and P1 current-diff review.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve normal column-resize hover/drag behavior when cell selection is not
  active, and preserve normal cell-selection contraction/expansion on cells.

Boundaries:
- Source of truth: direct user report plus current table DOM/event ownership and
  the current exact browser test.
- Allowed edit scope: the literal table resize-handle / Plite interaction owner,
  adjacent focused tests, the existing table-selection browser spec, one package
  changeset, and this plan.
- Browser surface: Plite-mode standalone table demo used by
  `apps/www/tests/browser/table-selection.spec.ts`.
- Browser strategy: use Browser for visible inspection and the repository's
  Chromium browser row for deterministic real-pointer replay. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no public issue or tracker mutation requested.
- Non-goals: no public API redesign, table selection rewrite, generated-template
  edits, unrelated cleanup, commit, push, PR, or public status mutation.

Output budget strategy:
- Read exact table/controller/test owners and use capped `rg` results; exclude
  generated output, `node_modules`, `.next`, logs, coverage, and templates.
  Keep test output focused first and summarize broad proof instead of streaming it.

Blocked condition:
- Stop only if the exact current demo cannot expose both a selection gesture and
  a resize handle after three distinct evidence-backed attempts, or the required
  Browser/Chromium runtime cannot execute the real-pointer case.

Task state:
- task_type: browser-visible Plate/Plite selection regression
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: candidate-local complete
- confidence: high on the recorded dirty ref
- next owner: final pushed-ref replay when shipping is authorized
- reason: exact red/green, package proof, 5/5 Chromium, Browser QA, artifacts, and P1 review pass

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-ignore-table-resize-handles-during-cell-selection-drag.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact hover-ignore, preservation, non-resize, follow-up cell drag, proof, and handoff rows recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Read Patch and Autogoal completely; Patch owns this one-case behavior repair and browser pack applies |
| Active goal checked or created | yes | `get_goal` returned none; goal created with this plan path |
| Source of truth read before edits | yes | Read the direct report, exact table demo/spec, table resize controller/markup, Plite root interaction controller/resolver/tests, and internal-control ownership solution |
| Tracker comments and attachments read | no | N/A: direct user report, no tracker target or new attachment |
| Video transcript evidence required | no | N/A: this follow-up is fully specified by the direct pointer contract; prior video is not needed to define handle hover |
| `docs/solutions` checked for non-trivial existing-code work | yes | `docs/solutions/logic-errors/2026-04-22-plite-react-internal-controls-must-be-native-owned.md` confirms marked internal controls stay app/native-owned at every root event boundary |
| TDD decision before behavior change or bug fix | yes | Exact browser RED required before product edit; add focused unit RED if literal owner supports it |
| Branch decision for code-changing task | yes | Work in the user-provided current checkout; no branch switch, commit, or push |
| Release artifact decision | yes | Update the existing Plite React changeset if that package owns the fix; otherwise add the one owning-package changeset required by the final diff |
| Browser tool decision for browser surface | yes | Browser for visible QA plus repository Chromium real-pointer test; no native Chrome-only surface |
| PR expectation decision | no | N/A: user did not request a PR |
| Tracker sync expectation decision | no | N/A: no tracker target |
| Output budget strategy recorded | yes | Exact files, capped searches, focused commands; generated and build trees excluded |
| Browser pack selected | yes | Browser pack materialized into this plan |
| Browser route / app surface identified | yes | Plite-mode standalone table demo owned by current exact table-selection spec; resolve literal URL during source read |
| Browser tool decision recorded | yes | Browser plus Chromium test runner; Chrome/Computer N/A |
| Console/network caveat policy recorded | yes | Browser proof checks unexpected console errors; network is out of scope unless it blocks the demo |
| Observable browser case captured | yes | `table-selection:ignore-resize-handle-hover`; current checkout, macOS/Chromium, mouse-down in cell, drag to another cell, enter resize handle, expect unchanged multi-cell range/no resize, return to cells, mouse-up; model/DOM/native selection, geometry, focus, errors, and follow-up input recorded; final dirty ref plus SHA-256 fingerprints required |

Work Checklist:
- [x] N/A: no duration was requested; exact pass gates replace a scorecard.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] N/A: the direct follow-up defines the handle-hover case without video evidence.
- [x] Nearby repo instructions and implementation patterns read before edits:
      exact controller/resolver/unit tests, table resize controller/DOM, browser
      spec, changeset, changelog, and internal-control solution.
- [x] Implementation fixes the right ownership boundary: Plite preserves the
      selection over marked interactive chrome; the table marks its resize controls
      and suppresses hover preview while a pointer button is held.
- [x] Release artifact requirement recorded: owning published-package changeset;
      update the current related changeset if it is the same release owner.
- [x] Final handoff shape decided: root cause/owner, exact red/green, 5/5 browser,
      focused tests/typecheck/lint, changeset, P1 review, and honest local caveat.
- [x] Branch handling recorded for code-changing work: current user checkout;
      no branch switch, commit, push, or PR.
- [x] Local-env-rot retry policy recorded: run `pnpm run reinstall` once only if
      the documented React/package-resolution corruption shape appears.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded: pointer-event ownership is runtime/browser behavior;
      failure risks are swallowing legitimate resize gestures or mutating selection
      while over non-cell UI, so proof covers both active-selection ignore and idle resize.
- [x] Review/P1 autoreview target selected: manually review the exact task-owned
      current diff at P1 because repo policy forbids `autoreview` on `next`.
- [x] Agent-native review decision recorded: N/A unless `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: one capped search still
      expanded minified registry JSON lines; broad searching stopped immediately,
      the miss is recorded below, and all later reads are exact-file slices.
- [x] Browser pack: `/blocks/table-demo`; drag cell 0 to cell 4, enter cell 4's
      column handle, preserve exact range/count and hidden preview, then continue
      to cell 8; idle hover must still show the preview.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console has only React DevTools/HMR informational logs;
      network was out of scope and did not block the local demo.
- [x] Browser pack: held-drag screenshot captured through the in-app Browser.
- [x] N/A: this case claims stable model/range state and suppressed resize
      preview, not native selection-paint pixels; the adjacent native-highlight
      row still passes its classified-pixel oracle in the full table spec.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] N/A for fixed/completed wording: this is an uncommitted, unpushed local
      candidate. A fresh process/session proved the recorded dirty ref and
      fingerprints; no clean pushed ref exists.
- [x] Browser pack: native selection/focus behavior passed 5/5 retry-free warm
      Chromium runs on the fresh process; release-on-handle and ordinary resize
      were also replayed manually in Browser.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Exact RED became GREEN; 5/5 retry-free browser, full 3/3 table spec, package/full tests, types, lint, Browser, review all closed |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Browser focus offset changed 2 -> 7; unit focus offset changed 2 -> 5 |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Focused unit 14/14, exact browser 5/5, full table spec 3/3 |
| TypeScript or typed config changed | yes | Run relevant typecheck | Plite React typecheck passed; direct `tsc --noEmit -p apps/www/tsconfig.json` passed |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no export or file-layout change |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no dependency or manifest change |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent-rule or skill edit |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2`; Browser used `http://localhost:3001/blocks/table-demo` |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | Fresh in-app Browser real-pointer replay and screenshot passed |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Held range stayed at 2 cells over handle with hidden indicator, continued to 3, idle hover visible, no runtime errors |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` edit; registry output was generated by its owner command |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | `.changeset/calm-cells-contract.md` covers `@platejs/plite-react` pointer-drag behavior |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: mixed package/registry work; canonical registry changelog MDX and generated JSON updated through Registry Changelog owner |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Incidental changelog source generated with `--write`; `--check` passed for 82/82 events |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk was breaking ordinary resize or swallowing selection; exact drag, release-on-handle, idle hover, and 100 -> 124px resize all passed |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling surface changed |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no documented install-corruption signal |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: branch is `next`, where repo policy forbids autoreview. Skill loaded; manual P1 review of the exact owner/test bundle found zero accepted actionable findings |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR requested |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR requested |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker target |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped Ultracite fix then check passed; `git diff HEAD --check` passed on the task bundle |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One capped minified-JSON expansion and required generator output recorded; later reads were exact and capped |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-ignore-table-resize-handles-during-cell-selection-drag.md` | Final checker passed |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Fresh Browser tab replayed held handle crossing, continuation, release-on-handle, idle hover, and real resize |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Only React DevTools and HMR informational logs; no runtime error; network N/A beyond successful local route |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Held-drag Browser screenshot emitted; exact automated row is the durable artifact |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Range/count/indicator/resizing/focus/native selection and follow-up cell drag all checked |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | `dirty:168a4490e2ccf90dd9b1bd3230fb2f528460caa2`; controller `21ac4591...`, unit `5e007107...`, table `6ea56595...`, browser spec `fd9c69c8...` |
| Clean final runtime | no | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: uncommitted/unpushed local candidate; fresh local process and exact dirty fingerprints recorded, no shipped/fixed claim |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Chromium exact row passed 5/5 with retries disabled |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | direct report, source owners, exact spec, solution doctrine | implementation |
| Implementation | complete | central drag-target guard plus table chrome marker/preview guard and red tests | verification |
| Verification | complete | package 1104/1104, types/lint, exact Chromium 5/5, full table 3/3, Browser proof | closeout |
| PR / tracker sync | complete | N/A: neither requested | final response |
| Closeout | complete | artifacts, fingerprints, manual P1 review, and handoff fields complete | final response |

Findings:
- Exact browser RED: entering the resize handle changed the live focus offset
  from 2 to 7 before any preview assertion ran.
- Exact unit RED: marked root chrome changed focus offset from 2 to 5.
- Root cause: drag move/up bypassed the root target classifier, so the existing
  `data-plite-root-chrome-ignore="true"` policy applied only at gesture start.
- The table resize group lacked that canonical marker, and `setResizePreview`
  showed the hover indicator even when `PointerEvent.buttons !== 0`.

Decisions and tradeoffs:
- Keep one selection authority in Plite: reuse the existing root target resolver
  during active drag instead of adding table-selection state or a caller callback.
- Keep table-only visual policy in the registry component: pointer-button hover
  suppression does not belong in the editor model.
- Mark the resize-control group once rather than annotating each handle.
- Architecture pressure verdict: keep. The change reuses an existing canonical
  internal-control contract, adds no public API, and deletes no viable owner.

Implementation notes:
- `packages/plite-react/src/editable/root-interaction-controller.ts` prevents
  default and preserves the current range when an active drag crosses ignored
  chrome, including pointer-up on that target.
- `apps/www/src/registry/components/editor/table.tsx` marks the resize-control
  group as ignored root chrome and skips hover preview while a button is held.

Review fixes:
- Manual P1 review on `next`: no accepted actionable findings. The existing
  ignored-chrome owner is reused, table-only preview policy stays local, move and
  release are both guarded, and normal resize remains functional.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Plite-only browser runner could not enumerate a www spec | 1 | Use the owning www Chromium lane with explicit fresh-process URL | Correct lane reproduced the bug |
| Initial unit RED used an out-of-document offset | 1 | Use a valid distinct offset | Valid RED changed focus 2 to 5 |
| First green browser run used `endPoint.height`, which does not exist | 1 | Move to the already-resolved cell center | Exact browser row passed 1/1 |
| Capped source search printed long registry JSON lines | 1 | Stop broad search and use exact source files only | No further broad/generated output |

Verification evidence:
- RED command in `/Users/zbeyens/git/plate-2`: `PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm --filter www test:www-browser:chromium table-selection.spec.ts --grep "table:ignore-resize-handle-hover-during-cell-selection-drag"` -> failed because live focus changed offset 2 to 7.
- RED command in `/Users/zbeyens/git/plate-2`: `pnpm --filter @platejs/plite-react test root-interaction-controller.test.tsx` -> failed because ignored chrome changed focus offset 2 to 5.
- GREEN unit command in `/Users/zbeyens/git/plate-2`: same focused package test -> 14/14 passed.
- GREEN browser iteration command in `/Users/zbeyens/git/plate-2`: same exact www Chromium row -> 1/1 passed.
- `pnpm --filter @platejs/plite-react test` -> 75 files, 1104 tests passed.
- `pnpm --filter @platejs/plite-react typecheck` -> passed.
- `pnpm exec tsc --noEmit -p apps/www/tsconfig.json` -> passed.
- `pnpm --filter www build:registry` -> generated 380 canonical payloads and 15 sparse overlays; generated `table.json` contains both required markers exactly once.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check` -> 82/82 source/generated events agree.
- Fresh-process exact Chromium row with `--repeat-each=5` -> 5/5 passed, no retries.
- Fresh-process full `table-selection.spec.ts` -> 3/3 passed, including native-highlight and contraction neighbors.
- In-app Browser `/blocks/table-demo` -> held handle crossing kept 2 cells and hidden indicator, continuation selected 3, release-on-handle cleared native range, idle hover showed indicator, ordinary resize changed width 100 -> 124px, no runtime errors.
- Scoped Ultracite check and `git diff HEAD --check` -> passed.

Final handoff contract:
- PR line: N/A: no PR requested; no commit or push performed
- Issue / tracker line: N/A: direct local report, no public target
- Confidence line: high for the dirty local candidate; exact red/green, full package, 5/5 browser, and manual Browser proof passed
- Flow table:
  - Reproduced: unit RED offset 2 -> 5; browser RED offset 2 -> 7
  - Verified: unit 14/14 and full 1104/1104; exact browser 5/5 and full table 3/3
- Browser check: fresh in-app Browser proof passed with no runtime error
- Outcome: active cell-selection drags ignore resize handles without freezing later cell movement; ordinary resize still works
- Caveat: local candidate only; composite www typecheck still stops on a wider-checkout stale API-reference manifest, while direct www TypeScript passes
- Design:
  - Chosen boundary: canonical Plite ignored-root-chrome lifecycle plus table-owned marker/preview policy
  - Why not quick patch: a table-only event stop cannot run before root capture and would leave mouse-up vulnerable
  - Why not broader change: existing target classification already owns the contract; no new plugin, selection state, or public API is needed
- Verified: exact commands and Browser evidence listed above
- PR body verified: N/A: no PR requested

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
- Issue / tracker: N/A: none
- Browser proof: passed on fresh `http://localhost:3001/blocks/table-demo`
- Caveats: dirty local candidate; no commit/push; composite www typecheck has unrelated stale API-reference manifest

Timeline:
- 2026-08-26T10:26:23.621Z Task goal plan created.
- 2026-08-26 exact browser and unit RED proved selection mutation over the handle.
- 2026-08-26 central root-target and table-preview owners repaired; focused proof green.
- 2026-08-26 package 1104/1104, TypeScript, lint, registry/changelog generation,
  fresh Chromium 5/5 and full 3/3, Browser QA, and manual P1 review passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | All implementation, proof, generated-artifact, and review gates are closed |
| Where am I going? | Final goal checker, stop owned dev server, final response |
| What is the goal? | Ignore table resize handles throughout active cell-selection drag without breaking idle resize hover |
| What have I learned? | The drag lifecycle bypassed the existing ignored-chrome classifier after mouse-down |
| What have I done? | Added exact RED tests, fixed both literal owners, passed full package/types/lint, fresh 5/5 and 3/3 Chromium, Browser QA, generated artifacts, and manual P1 review |

Open risks:
- No task-owned correctness risk remains in the dirty local candidate.
- A clean pushed-ref replay remains required before shipped/fixed wording.
- The wider checkout's composite www typecheck is blocked by a stale API-reference manifest unrelated to this table repair; direct www TypeScript passes.
