# Use canonical selection hook

Objective:
Use canonical Plite selection hook in selection-only example subscribers; done
when 3 redundant selector callers are removed and type/browser proof passes;
plan docs/plans/2026-08-25-use-canonical-selection-hook.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-25-use-canonical-selection-hook.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user instruction following an accepted Best API review
- id / link: N/A
- title: Replace redundant selection-only selectors
- acceptance criteria: replace all 3 exact
  `useEditorSelector(editor => editor.read.selection())` callers with
  `useEditorSelection()`; keep behavior unchanged; prove types, source census,
  lint, and the affected browser routes

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.
- Extracted requirement: execute the accepted canonical-hook cleanup now.
- Scope: the one hovering-toolbar caller and two comment-mode callers identified
  in the source census.
- Non-goals: no hook implementation, public API, package, docs, registry,
  commit, push, PR, or tracker change.
- Deliverable: three direct hook calls plus verification and a concise handoff.
- Stop condition: all three stale call shapes are absent and named proof passes,
  or a focused type/browser failure proves the substitution is not equivalent.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: exact binary refactor
- improvement loop: N/A: stop at the explicit three-call threshold
- final score / loop closure: N/A

Completion threshold:
- Exactly 0 selection-only `useEditorSelector` callers remain in authored Plite
  example source, both affected files import/use `useEditorSelection`, scoped
  lint and www typecheck pass, and Browser confirms the hovering toolbar and
  comment-mode selection UI still respond on final local bytes.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-use-canonical-selection-hook.md` passes.

Verification surface:
- `rg` exact caller/import census under the Plite examples.
- Scoped Ultracite check for the two changed TSX files.
- `pnpm --filter www typecheck` in `/Users/zbeyens/git/plate-2`.
- Browser on `/examples/plite/hovering-toolbar` and
  `/examples/plite/comment-mode`, including selection-driven UI and console
  errors.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: the accepted review plus `use-editor-selection.tsx` and the
  three live caller locations.
- Allowed edit scope: the two named example TSX files and this goal receipt.
- Browser surface: hovering-toolbar and comment-mode Plite examples.
- Browser strategy: in-app Browser for normal rendered UI. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker source.
- Non-goals: changing selection semantics, public hook shape, docs, registry,
  packages, release artifacts, or git publication.

Output budget strategy:
- Read only the two callers and hook owner; use exact file-scoped searches and
  capped focused command output. Do not stream broad generated or test trees.

Blocked condition:
- Block only if focused type or fresh Browser proof establishes that
  `useEditorSelection()` is not behaviorally equivalent for these selection-only
  subscribers and no owner-level repair is evident.

Task state:
- task_type: behavior-preserving React/API adoption refactor
- task_complexity: micro
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: complete

Current verdict:
- verdict: valid; use the dedicated hook
- confidence: high from literal hook implementation and caller census
- next owner: task
- reason: `useEditorSelection()` owns the exact read plus structural range
  equality; the generic selector defaults to reference equality

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-use-canonical-selection-hook.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | The three-call scope, proof, non-goals, and handoff are recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Used Task, Autogoal, Browser, Best API, and React best-practice guidance; no broader owner is needed |
| Active goal checked or created | yes | New matching goal created after confirming no active goal |
| Source of truth read before edits | yes | Read the canonical hook implementation, selector implementation, docs teaching, tests, and all 3 callers |
| Tracker comments and attachments read | no | N/A: direct user instruction |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: micro mechanical adoption of an existing canonical hook |
| TDD decision before behavior change or bug fix | no | N/A: behavior-preserving refactor with existing hook contract tests |
| Branch decision for code-changing task | yes | Keep the current shared checkout; user requested execution, not branch or PR work |
| Release artifact decision | no | N/A: app examples only; no package or registry release surface |
| Browser tool decision for browser surface | yes | Use in-app Browser because both changed files render app routes |
| PR expectation decision | no | N/A: user did not request a PR |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Exact file-scoped reads/searches and capped focused proof only |
| Browser pack selected | yes | Browser pack materialized in this plan |
| Browser route / app surface identified | yes | `/examples/plite/hovering-toolbar` and `/examples/plite/comment-mode` |
| Browser tool decision recorded | yes | Browser for normal UI; no native Chrome/OS behavior |
| Console/network caveat policy recorded | yes | Check console errors; network is only relevant if route assets fail |
| Observable browser case captured | no | N/A: cleanup is not a report-backed behavior fix; verify equivalent selection-driven UI |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
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
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: N/A because only app example
      consumers change.
- [x] Final handoff shape decided: concise outcome plus source/type/lint/Browser
      proof; PR and tracker fields are N/A.
- [x] Branch handling recorded for code-changing work: current shared checkout,
      no branch/PR action requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      N/A unless a surprising unrelated failure appears; then reinstall once
      and rerun the exact command.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. N/A: no public/runtime/browser contract changes.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: three mechanical
      call-site substitutions.
- [x] Agent-native review decision recorded: N/A because no agent/tooling files
      change.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: routes and selection-driven toolbar/comment outcomes are
      recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: both route consoles had zero errors; owned dev-server logs
      recorded HTTP 200 for both routes.
- [x] Browser pack: screenshot is N/A because Browser DOM inspection can prove
      the toolbar/comment state directly.
- [x] Browser pack: report-backed red proof is N/A because this is a
      behavior-preserving API-adoption cleanup, not a reported behavior bug.
- [x] Browser pack: final proof used an owned fresh dev process and new Browser
      tabs on final code; hovering selection moved the toolbar onscreen, while
      comment mode rendered selection state and its exact pointer row passed.
      The generic requirement is that final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: clean pushed-ref proof is N/A because this remains an
      uncommitted local candidate; final proof will use a fresh local process.
      The generic requirement is: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: 5/5 native stability is N/A because no native selection,
      focus, DnD, compositor, or lifecycle behavior changes.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named source, lint, type, Browser, and exact pointer proof | Zero stale callers; 3 canonical calls; all named proof passed |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: behavior-preserving API adoption, not a bug fix |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior | Browser hovering selection passed; exact comment pointer row passed 1/1 |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package files or exports changed |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest or install change |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent source changed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd | All commands ran in `/Users/zbeyens/git/plate-2`; Browser used the local www routes |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces | Fresh local Browser proof completed on both affected routes |
| Browser final proof | yes | Attach Browser proof or exact caveat | Hover drag selected `u can make a hovering` and moved Bold to x=522; comment route rendered cleanly and its exact pointer test passed |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output changed |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: existing public hook adopted by app examples only |
| Registry-only component work changed | no | Update registry changelog or record N/A | N/A: no registry source changed |
| Docs or content changed | no | Verify docs/content or record N/A | N/A: no `content/**` or public docs source changed |
| High-risk mini gate | no | Record high-risk note or N/A | N/A: no public API/runtime/package/browser contract changed |
| Agent-native review for agent/tooling changes | no | Run agent-native review or record N/A | N/A: no agent/tooling surface changed |
| Local install corruption suspected | no | Reinstall once or record N/A | N/A: failure was a real missing import and was fixed directly |
| P1 autoreview for non-trivial implementation changes | no | Run P1 or record N/A | N/A: three mechanical calls in two example components; scoped review and proof are proportional |
| PR create or update | no | Run `check` and sync PR body | N/A: no PR requested |
| Task-style PR body verified | no | Verify PR body | N/A: no PR |
| PR proof image hosting | no | Host proof images or record N/A | N/A: no PR |
| Tracker sync-back | no | Post tracker sync or record N/A | N/A: no tracker |
| Final handoff contract | yes | Fill exact handoff fields | Filled below |
| Final lint | yes | Run scoped equivalent | Ultracite passed on both TSX files |
| Output budget discipline | yes | Verify output stayed bounded | Exact files/searches and capped focused commands only |
| Timed checkpoint | no | Continue until duration or N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-use-canonical-selection-hook.md` | Passed on final plan bytes |
| Browser interaction proof | yes | Exercise target route/interaction with Browser | Both routes loaded from a fresh server; hovering pointer selection moved toolbar onscreen |
| Browser console/network check | yes | Record console/network state | Zero console errors; both route requests returned HTTP 200 |
| Browser final proof artifact | yes | Record route proof or exact caveat | Exact observations recorded in Verification evidence; screenshot not needed for the claim |
| Exact case replay | no | Prove report case or N/A | N/A: not report-backed; exact existing comment pointer row passed as regression proof |
| Final ref and fingerprints | no | Record final ref/fingerprints or N/A | N/A: uncommitted local candidate, no public fixed/completed claim |
| Clean final runtime | no | Prove pushed clean ref or N/A | N/A: uncommitted local candidate; fresh owned local process used |
| Retry-free stability | no | Run 5/5 for native behavior or N/A | N/A: no native selection/focus/DnD/lifecycle behavior changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Canonical hook, selector mechanics, docs, tests, and 3 callers read | implementation |
| Implementation | completed | Replaced the one hovering-toolbar and two comment-mode generic selectors | verification |
| Verification | completed | Zero-stale census, 3 canonical calls, Ultracite, www typecheck, Browser, exact comment pointer test, diff check | closeout |
| PR / tracker sync | completed | N/A: neither requested nor sourced from a tracker | final response |
| Closeout | completed | Goal checker and concise handoff recorded | final response |

Findings:
- `useEditorSelection()` is the literal wrapper for this read and adds
  structural `RangeApi.equals` comparison plus the selection profiler identity.
- The generic selector defaulted to reference equality while the public
  selection projection returns fresh frozen range objects.

Decisions and tradeoffs:
- Delete the three generic-selector call shapes; retain `useEditorSelector`
  only for genuinely derived or editor/runtime-specific jobs.

Implementation notes:
- Updated imports and replaced exactly three call sites; no hook, package, API,
  docs, or registry code changed.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Replaced the hovering-toolbar selector import although the file also uses it for derived mark state | 1 | Restore only the legitimate derived-selector import | Selection read stays on `useEditorSelection`; exact www typecheck rerun passed |

Verification evidence:
- Source audit: the exact selection-only `useEditorSelector` shape returned no
  matches; the two changed files contain exactly 3 `useEditorSelection()` calls.
- `pnpm exec ultracite check <two changed TSX files>` passed.
- `pnpm --filter www typecheck` passed after its editor/API/docs/registry source
  checks, route type generation, and both TypeScript projects.
- Fresh owned www dev server on port 3112 returned HTTP 200 for both routes.
- Browser `/examples/plite/hovering-toolbar`: real pointer drag selected
  `u can make a hovering`; Bold moved from the offscreen parking position to
  x=522.27, y=124.5. Console errors: 0.
- Browser `/examples/plite/comment-mode`: route, both editors, selection labels,
  and controls rendered. Console errors: 0. Browser semantic double-click could
  not create the read-only pointer range, so the repo-owned exact pointer row
  supplied the interaction proof.
- `pnpm --filter plite exec playwright test
  tests/plite-browser/donor/examples/comment-mode.test.ts --project=chromium
  --grep "allows real pointer selection to add a comment in the read-only
  editor"` passed 1/1.
- React best-practice review: canonical specialized subscription, structural
  range equality, unchanged component/accessibility shape, and inferred types.
- `git diff --check` passed.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct user task
- Confidence line: high; exact source/type/lint/browser proof passed
- Flow table:
  - Reproduced: N/A: no behavior bug
  - Verified: www typecheck and exact pointer row passed; both Browser routes clean
- Browser check: hovering pointer selection passed; comment route rendered with
  zero errors and exact pointer Playwright passed
- Outcome: all 3 redundant selection-only generic selectors use the canonical hook
- Caveat: Browser semantic double-click could not create the read-only comment
  selection; repo-owned exact pointer proof passed
- Design:
  - Chosen boundary: dedicated `useEditorSelection()` for raw selection reads
  - Why not quick patch: this is the smallest truthful canonical API adoption
  - Why not broader change: generic selectors remain correct for derived values
- Verified: source census, Ultracite, www typecheck, Browser, exact pointer row,
  and diff check
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
- Browser proof: passed with the read-only comment selection caveat above
- Caveats: local uncommitted candidate; no public delivery claim

Timeline:
- 2026-08-25T13:32:32.583Z Task goal plan created.
- 2026-08-25 Replaced all three identified selection-only generic selectors.
- 2026-08-25 Source census, Ultracite, www typecheck, Browser routes, exact
  comment pointer row, and diff check passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete |
| Where am I going? | Final handoff only |
| What is the goal? | Zero redundant selection-only selectors in the two examples |
| What have I learned? | The dedicated hook is semantically and render-wise stronger |
| What have I done? | Replaced all 3 call sites and completed all named proof |

Open risks:
- No product risk found. This is an uncommitted local candidate; Browser's
  semantic double-click limitation was closed with the repo-owned exact pointer
  row rather than weakened proof.
