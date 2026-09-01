# Fix command menu duplicate route key

Objective:
Fix command menu duplicate route key; done when red/green regression coverage passes and browser proof shows no duplicate-key error; plan docs/plans/2026-08-31-fix-command-menu-duplicate-route-key.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-fix-command-menu-duplicate-route-key.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user console-error report
- id / link: N/A: no external tracker target
- title: Duplicate `/docs/components/fixed-toolbar` React key in the command menu
- acceptance criteria: reproduce the reported duplicate-key condition; fix the
  canonical command-menu data/render owner; add durable regression coverage;
  pass focused tests, typecheck/lint, Browser interaction proof, and P1 review.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.
- Captured requirements:
  - Remove the duplicate React child key
    `/docs/components/fixed-toolbar` reported from `CommandItems` in
    `apps/www/src/components/command-menu-dialog.tsx`.
  - Preserve command-menu results and navigation behavior for distinct items.
  - Verify against Next.js 16.3.2 with Turbopack through the real `apps/www`
    command-menu interaction.
  - Deliver a local fix only; no commit, push, PR, or tracker mutation was
    requested.
  - Stop when focused red/green coverage, typed/scoped checks, Browser console
    proof, and P1 autoreview are closed; otherwise report the exact blocker.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary regression threshold is stronger
- improvement loop: N/A: one-shot repair loop
- final score / loop closure: N/A: completion is evidence-gated

Completion threshold:
- The exact duplicate route fails a focused regression assertion before the
  fix and passes afterward.
- The real `apps/www` command menu opens on a fresh page without the reported
  duplicate-key console error, while distinct results remain available.
- Focused test, relevant typecheck/lint, and P1 autoreview pass with zero
  accepted actionable findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-command-menu-duplicate-route-key.md` passes.

Verification surface:
- Focused command-menu regression test in `apps/www` using the repository's
  existing test owner discovered during intake.
- Relevant `apps/www` typecheck and scoped Ultracite check for changed files.
- Fresh `apps/www` dev process and Browser replay on `/docs`: open the site
  command menu, inspect visible results, and check console errors.
- P1 `autoreview --max-priority P1` over the actual local diff.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user report and current `apps/www` command-menu source/data.
- Allowed edit scope: canonical command-menu data/render code and focused test
  coverage under `apps/www`; this goal plan only outside product code.
- Browser surface: `apps/www` site header command menu on `/docs`.
- Browser strategy: Browser on a fresh local page/process. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker target or mutation authority.
- Non-goals: public API changes, package behavior changes, docs/content edits,
  registry generation, release artifacts, git mutation, and unrelated warnings.

Output budget strategy:
- Read exact component/test/data owners first. Use scoped `rg` paths and capped
  output; exclude generated output, `node_modules`, `.next`, `.turbo`, logs,
  coverage, and templates unless a named check proves they own the defect.

Blocked condition:
- Stop only if the exact command-menu case cannot be rendered/reproduced after
  exhausting the current source/test/browser path, or required local Browser
  control remains unavailable after the documented fallback.

Task state:
- task_type: local Plate website behavior bug
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: candidate-local complete
- confidence: high; red/green, typed, Browser, stability, and P1 review gates pass
- next owner: patch
- reason: the report identifies one observable local React rendering defect.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-command-menu-duplicate-route-key.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Captured above from the user's report, including scope, proof, handoff, and stop conditions |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Read `autogoal` and `patch`; patch owns one local Plate behavior repair and requires red proof, Browser proof, and P1 autoreview |
| Active goal checked or created | yes | `get_goal` returned none; created the active goal with this plan path |
| Source of truth read before edits | yes | Read the reported component, focused tests, nav types, lazy-nav loader, and `content/docs/meta.json`; exact Browser replay confirmed the same-key warnings |
| Tracker comments and attachments read | no | N/A: no tracker or attachments supplied |
| Video transcript evidence required | no | N/A: no video supplied |
| `docs/solutions` checked for non-trivial existing-code work | yes | Focused filename search found no relevant command-menu duplicate-route solution |
| TDD decision before behavior change or bug fix | yes | Add a focused red regression case before the product fix |
| Branch decision for code-changing task | no | N/A: patch authority is the current checkout; user did not request branch or git mutation |
| Release artifact decision | no | N/A: expected owner is unpublished `apps/www` UI/test code |
| Browser tool decision for browser surface | yes | Use in-app Browser for ordinary `apps/www` interaction and console proof |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker target supplied |
| Output budget strategy recorded | yes | Exact-file reads, scoped searches, and capped output; generated/build trees excluded |
| Browser pack selected | yes | Materialized browser pack in this plan |
| Browser route / app surface identified | yes | `/docs`, site-header command menu |
| Browser tool decision recorded | yes | Browser first; native Chrome/Computer is not required for this React console warning |
| Console/network caveat policy recorded | yes | Reported duplicate-key console error must be absent; unrelated existing network noise will be named, not hidden |
| Observable browser case captured | yes | `www-command-menu:duplicate-fixed-toolbar-route-key`; fresh `/docs` page, open header command menu, render results, expect one identity per item and no duplicate-key error; macOS Browser/Chromium; current bad state from user report; production/test fingerprints recorded for final local replay |

Work Checklist:
- [x] N/A: no duration was requested; binary evidence gates apply.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] N/A: no video or screen recording was supplied.
- [x] Nearby repo instructions and implementation patterns read before edits:
      `command-menu-dialog.tsx`, its focused test, `command-menu.tsx`, nav
      types, lazy sidebar loading, docs-nav key handling, and source metadata.
- [x] Implementation fixes the command-menu identity owner: keys combine the
      stable source route and titles, while valid shared-route entries remain.
- [x] Release artifact requirement recorded: N/A because only private
      `apps/www` component/test code is in scope.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded: N/A because the patch skill owns the current
      checkout and no git mutation was requested.
- [x] Local-env-rot retry policy recorded: run `pnpm run reinstall` once only
      if a surprising failure matches the repo's install-corruption signals.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note: this changes React child identity only. The realistic
      failure is collapsing or remounting two legitimate labels that share a
      route; the test must keep both visible while removing both warnings.
- [x] P1 autoreview target selected: the final local diff for the command-menu
      component, its focused test, and this plan.
- [x] Agent-native review: N/A because no agent/tooling files are changing.
- [x] Output budget discipline recorded and followed after one contained miss:
      an exact route search included generated `public/r` JSON; subsequent
      searches exclude generated/build paths and remain capped.
- [x] Browser pack: `/docs` -> header “Search documentation...” -> rendered
      command groups; expect both fixed-toolbar labels and no same-key errors.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: the final fresh tab logged no errors or warnings. Network
      mutation is N/A; the loaded sidebar options prove the existing nav fetch
      completed and this repair does not change requests.
- [x] Browser pack screenshot/visual waiver: N/A because the observable is a
      console warning plus preserved DOM entries, not a pixel claim.
- [x] Browser pack paint controls: N/A because no paint claim is made.
- [x] Browser pack: exact pre-fix replay failed at 2026-08-31T05:28:02Z with
      same-key errors for `/docs/components/fixed-toolbar` and the adjacent
      `/docs/components/floating-toolbar`; both legitimate labels rendered.
- [x] Browser pack: final proof used a fresh page on a freshly restarted
      Next.js 16.3.2 Turbopack process, rechecked all four toolbar labels and
      console state, and recorded ref plus file fingerprints below.
- [x] Browser pack clean-checkout rule: N/A for the requested local uncommitted
      repair. Proof is explicitly `dirty:377a77a53797`; no pushed/shipped claim
      is made.
- [x] Browser pack: the React render case passed 5/5 retry-free warm opens in
      the in-app Chromium browser; each run kept both fixed-toolbar labels and
      recorded zero same-key errors.
- [x] Browser pack: final proof used only production source, the focused test,
      the real metadata, and the real `/docs` route; no stub, alias, generated
      edit, route bypass, or temporary scaffolding participated.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named red/green, typed, lint, Browser, and review proof | All named gates below pass |
| Bug reproduced before fix | yes | Record failing test and exact Browser repro | Focused test: 1 failed; Browser logged fixed- and floating-toolbar same-key errors at 05:28:02Z |
| Targeted behavior verification | yes | Run focused green proof | Focused test: 3 passed, 0 failed; Browser: 5/5 |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www exec tsc --noEmit -p tsconfig.json`: exit 0 |
| Package exports or file layout changed | no | Run `pnpm brl` when applicable | N/A: no package export or file-layout change |
| Package manifests, lockfile, or install graph changed | no | Run install graph checks when applicable | N/A: no manifest, lockfile, or dependency change |
| Agent rules or skills changed | no | Run skill sync when applicable | N/A: no agent rule or skill change |
| Workspace authority proof | yes | Verify in owning app/workspace | Commands ran in `/Users/zbeyens/git/plate-2`; Browser used the `apps/www` `/docs` route |
| Browser surface changed | yes | Capture Browser proof | In-app Browser replayed the real site-header command menu |
| Browser final proof | yes | Record final Browser result | Fresh Next.js 16.3.2 process/page; four toolbar labels present; zero console issues |
| CI-controlled template output changed | no | Restore templates when applicable | N/A: no `templates/**` edit |
| Package behavior or public API changed | no | Add changeset when applicable | N/A: private `apps/www` React identity only; no changeset |
| Registry-only component work changed | no | Update registry changelog when applicable | N/A: command-menu app component, not registry UI |
| Docs or content changed | no | Verify user-facing docs when applicable | N/A: no user-facing docs/content edit; only this internal plan |
| High-risk mini gate | yes | Record failure mode and boundary | Preserved both shared-route labels; rejected data deletion and positional keys; test and Browser prove identity |
| Agent-native review for agent/tooling changes | no | Run when applicable | N/A: no agent/tooling change |
| Local install corruption suspected | no | Reinstall only for matching signals | N/A: no install-corruption signal; focused checks passed |
| P1 autoreview for non-trivial implementation changes | yes | Run scoped `--max-priority P1` review | Full local bundle refused at 142 files; exact two-file patch reviewed in temporary `next` clone: clean, 0 findings, correctness 0.95 |
| PR create or update | no | Run PR workflow when requested | N/A: no PR requested |
| Task-style PR body verified | no | Verify PR body when applicable | N/A: no PR |
| PR proof image hosting | no | Host proof when applicable | N/A: no PR and no screenshot claim |
| Tracker sync-back | no | Sync tracker when applicable | N/A: no tracker target |
| Final handoff contract | yes | Fill fields below | Filled with local status, exact proof, design, and caveat |
| Final lint | yes | Run scoped equivalent | `pnpm exec ultracite check` on both changed code files: pass |
| Output budget discipline | yes | Record any miss and recovery | One generated-JSON search overproduced; recorded and corrected with scoped exclusions |
| Timed checkpoint | no | Honor requested duration when applicable | N/A: none requested |
| Goal plan complete | yes | Run final mechanical checker | `check-complete.mjs` exit 0: plan complete |
| Browser interaction proof | yes | Exercise exact route and interaction | `/docs` -> Search documentation -> command groups rendered |
| Browser console/network check | yes | Record console/network state | Final fresh tab: zero error/warn logs; network mutation N/A and sidebar data loaded |
| Browser final proof artifact | yes | Record trace/result or caveat | Timestamped DOM-count and console ledgers below; screenshot N/A for console-only defect |
| Exact case replay | yes | Replay reporter case | Both fixed-toolbar entries count 1; both floating-toolbar entries count 1; zero same-key logs |
| Final ref and fingerprints | yes | Record local ref and hashes | `dirty:377a77a537971b793a4ddbb34cc13797fdfeee15`; hashes below |
| Clean final runtime | no | Use clean pushed ref for shipped claim | N/A: local uncommitted candidate; fresh process used, but no commit/push was requested |
| Retry-free stability | yes | Record 5/5 warm runs | Runs 1-5 passed without retry; each retained both fixed-toolbar labels and logged zero same-key errors |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | exact source/data read plus Browser repro | red proof and implementation |
| Implementation | completed | composite command-menu identity plus focused regression | verification |
| Verification | completed | test, typecheck, lint, 5/5 Browser, P1 review | closeout |
| PR / tracker sync | completed | N/A: neither requested nor authorized | final response |
| Closeout | completed | final evidence recorded and all human-readable gates closed | mechanical goal check |

Findings:
- `content/docs/meta.json` intentionally exposes two named component entries
  for each toolbar page: Buttons and Toolbar share one `href`.
- `CommandItems` and `CommandMenuGroup` use `href` alone as sibling identity,
  so valid aliases collide. Browser reproduced errors for both fixed and
  floating toolbar routes while all four labels remained visible.
- Classification: rendering/projection in private `apps/www` UI. The docs data
  is valid; deleting aliases would hide searchable components instead of
  repairing identity.

Decisions and tradeoffs:
- Use route plus stable source title for command-menu tree identity. Preserve
  both labels and navigation targets. Do not mutate docs metadata or index-only
  keys; those either delete user-visible discovery or make identity positional.

Implementation notes:
- Added one local key helper and applied it at every command-menu map boundary.
  A command entry's identity is its source `href`, `title`, and `titleCn`, not
  destination alone.
- Added a behavior regression that renders both real fixed-toolbar labels,
  asserts both remain available, and rejects React same-key diagnostics.

Review fixes:
- No code fixes requested. P1 autoreview returned zero findings and rated the
  scoped patch correct at 0.95 confidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Exact-route `rg` included generated `apps/www/public/r` JSON and overproduced output | 1 | Exclude `public/r`, `__registry__`, build, and generated trees | Scoped follow-up reads identified `content/docs/meta.json` without further broad output |
| P1 local autoreview exceeded eight passes because 142 unrelated dirty files were present | 1 | Review the exact two-file patch against the same `next` commit in a temporary clone | Scoped helper completed in one pass with zero findings |
| First goal-plan check found `Closeout=in_progress` | 1 | Close the already-finished phase and rerun the exact checker | Closeout status corrected before final rerun |

Verification evidence:
- Command, cwd `/Users/zbeyens/git/plate-2`: `bun test
  apps/www/src/components/command-menu-dialog.test.tsx` before fix -> exit 1,
  exact same-key assertion received two fixed-toolbar diagnostics.
- Command, same cwd: the same focused test after fix -> exit 0, 3 passed,
  0 failed, 9 assertions.
- Command, same cwd: `pnpm --filter www exec tsc --noEmit -p
  tsconfig.json` -> exit 0.
- Command, same cwd: `pnpm exec ultracite check
  apps/www/src/components/command-menu-dialog.tsx
  apps/www/src/components/command-menu-dialog.test.tsx` -> exit 0; formatting
  and lint pass. Existing package module-type warnings were non-actionable.
- Browser, `http://localhost:3000/docs`, pre-fix at 05:28:02Z -> errors for
  `/docs/components/fixed-toolbar` and `/docs/components/floating-toolbar`.
- Browser, fresh Next.js 16.3.2 Turbopack process and page from 05:37:39Z ->
  Fixed Toolbar Buttons 1, Fixed Toolbar 1, Floating Toolbar Buttons 1,
  Floating Toolbar 1, zero error/warn console entries.
- Browser warm ledger -> runs 1-5 all passed without retry; every run kept both
  fixed-toolbar entries and recorded zero same-key errors.
- Review: scoped two-file P1 autoreview command used `--mode local
  --max-priority P1` in `/tmp/plate-command-menu-review.lLpZCt/repo` -> clean,
  zero accepted/actionable findings, correctness 0.95.
- Ref/fingerprints:
  - local ref: `dirty:377a77a537971b793a4ddbb34cc13797fdfeee15`
  - production `command-menu-dialog.tsx`:
    `95b2ebce219ddaa23cf275dc8bd31a4a11532aea77a4261bd316a6ff28a279b9`
  - test `command-menu-dialog.test.tsx`:
    `eb5de1b9b9a479618faf7ef17559435e9793a14261187e3b4186b9bf257c15ab`
  - source fixture `content/docs/meta.json`:
    `5114d79c698653018d2dcfa04e46f59f56e25f7b57278cd76d632af9631d08cf`

Final handoff contract:
- PR line: N/A: no commit, push, or PR requested
- Issue / tracker line: N/A: no external target supplied
- Confidence line: high for this exact local repair
- Flow table:
  - Reproduced: focused test red; exact Browser console red
  - Verified: focused test/typecheck/lint green; Browser 5/5; P1 review clean
- Browser check: fresh process/page, four labels present, zero console issues
- Outcome: shared-route command entries retain stable distinct React identity
- Caveat: local uncommitted repair only; no pushed/shipped claim
- Design:
  - Chosen boundary: private command-menu item identity and focused test
  - Why not quick patch: deleting one metadata alias would hide a legitimate
    searchable component and leave the key assumption broken
  - Why not broader change: other navigation renderers did not reproduce in the
    exact fresh tab; no public nav identity contract was needed
- Verified: exact red/green, typed/lint, fresh Browser 5/5, clean P1 review
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
- PR: N/A: no git mutation requested
- Issue / tracker: N/A: no target supplied
- Browser proof: complete; fresh process/page and 5/5 warm ledger
- Caveats: local uncommitted state only

Timeline:
- 2026-08-31T05:21:24.820Z Task goal plan created.
- 2026-08-31T05:28:02Z Exact `/docs` Browser replay opened the command
  menu and captured same-key errors for fixed and floating toolbar routes.
- 2026-08-31T05:29:00Z Classified the owner as command-menu React identity;
  docs metadata aliases remain valid input.
- 2026-08-31T05:31:00Z Focused regression moved from 1 failing test to
  3 passing tests; scoped TypeScript and Ultracite checks passed.
- 2026-08-31T05:37:39Z Restarted `apps/www` on Next.js 16.3.2 and opened a
  fresh `/docs` page for final proof.
- 2026-08-31T05:38:05Z Completed 5/5 retry-free command-menu opens with both
  fixed-toolbar entries present and zero same-key errors.
- 2026-08-31T05:44:00Z Exact two-file P1 autoreview completed clean with zero
  findings after the unrelated 142-file local bundle was scoped out.
- 2026-08-31T05:47:00Z Final autogoal checker passed after closing the completed
  closeout phase.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Goal complete; preparing final response |
| Where am I going? | Concise local handoff |
| What is the goal? | Remove duplicate command-menu keys without dropping valid shared-route entries |
| What have I learned? | Shared routes are valid; href-only React identity is the defect |
| What have I done? | Implemented the durable key, added red/green coverage, passed typed/lint proof, Browser 5/5, and P1 review |

Open risks:
- None inside the supported nav contract. Exact duplicate source entries with
  identical route and titles remain invalid input rather than distinct jobs.
- Shipping state remains local and uncommitted because no commit/push was
  requested.
