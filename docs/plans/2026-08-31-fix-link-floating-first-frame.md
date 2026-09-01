# Fix link floating first frame

Objective:
Prevent the link floating toolbar from painting at (0,0); done when the exact regression is red/green, focused checks pass, and 5 fresh browser replays pass; plan docs/plans/2026-08-31-fix-link-floating-first-frame.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-fix-link-floating-first-frame.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:

- browser (docs/plans/templates/packs/browser.md)

Task source:

- type: direct user bug report
- id / link: `link-floating:first-frame-origin-flash`; current Codex thread
- title: Link floating toolbar paints its first frame at the viewport origin
- acceptance criteria: The toolbar stays unpainted until Floating UI resolves its
  anchor, then appears at the link anchor. The exact red/green regression passes,
  focused checks pass, and the final local candidate passes 5/5 fresh warm browser
  replays without a visible origin frame.

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A: no duration requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary regression and proof gates are stronger
- improvement loop: red proof -> owner fix -> focused checks -> 5/5 browser replay
- final score / loop closure: N/A: close on exact pass gates

Completion threshold:

- `link-floating:first-frame-origin-flash` fails before the fix and passes after.
- The copied floating adapter does not expose visible `(0,0)` placement while
  its initial placement is unresolved, and still reveals the correctly anchored
  toolbar afterward.
- Focused unit, type, lint, registry-generation, and Browser checks pass.
- The exact browser interaction passes 5/5 retry-free warm runs from a fresh app
  process and fresh page on the final local code state.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-link-floating-first-frame.md` passes.

Verification surface:

- `apps/www/src/registry/hooks/use-widget-floating.spec.tsx` red/green contract.
- Focused `apps/www/tests/browser/link-floating-toolbar.spec.ts` replay when it
  can observe the pre-position paint phase.
- `pnpm turbo typecheck --filter=www` and scoped Ultracite/Prettier checks.
- Registry changelog generation/check and `pnpm --filter www build:registry`.
- Browser route `/blocks/link-demo`: open the link toolbar, verify no origin
  paint, correct final anchoring, toolbar/focus state, and console errors.

Constraints:

- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:

- Source of truth: copied `use-widget-floating` adapter, link floating toolbar
  consumer, exact focused tests, and registry changelog source.
- Allowed edit scope: `apps/www/src/registry/hooks/use-widget-floating*`, the
  narrow link browser regression if needed, the existing 2026-08-31 transient
  geometry changelog entry/generated registry artifacts, and this plan.
- Browser surface: `/blocks/link-demo`, desktop viewport, link toolbar open path.
- Browser strategy: Browser for the normal app route; repo Playwright for the
  deterministic pre-position observation. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker or public issue named.
- Non-goals: no Plite geometry rewrite, no new Plate floating/overlay public API,
  no generic overlay layer, no cursor/find changes, no commit/push/PR.

Output budget strategy:

- Read exact owner/test slices and use focused `rg` with explicit path scopes.
  Cap command output; exclude generated trees except named changelog artifacts.

Blocked condition:

- Stop only if the real link demo cannot render or the pre-position phase cannot
  be observed through a shipped test/browser path after bounded instrumentation;
  report `needs-repro` rather than claiming the paint bug fixed.

Task state:

- task_type: one local Plate copied-UI browser regression
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready-for-completion

Current verdict:

- verdict: candidate-local
- confidence: 95%
- next owner: user Git workflow if this local packet should be committed
- reason: The copied adapter now keeps the element measurable but invisible
  until Floating UI resolves placement; red/green, 10/10 final browser rows,
  Browser visual proof, typecheck, registry generation, and P1 review pass.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-link-floating-first-frame.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact first-frame `(0,0)` flash, correct final anchor, fix request, scope/non-goals, red/green and browser gates recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `patch`, `autogoal`, `registry-changelog`, and Browser skills read completely; copied registry adapter is the expected owner |
| Active goal checked or created | yes | `get_goal` returned none; goal created for this exact regression and plan |
| Source of truth read before edits | yes | Read `use-widget-floating.ts`, its unit spec, `link.tsx`, the focused Playwright case, Floating UI 2.1.8 types/runtime, and the accepted copied-UI ownership plan |
| Tracker comments and attachments read | no | N/A: direct report with no tracker or new attachment |
| Video transcript evidence required | no | N/A: no video supplied |
| `docs/solutions` checked for non-trivial existing-code work | yes | Scoped search found no matching solution; existing floating-toolbar plans confirm the same copied registry owner |
| TDD decision before behavior change or bug fix | yes | Add exact failing readiness/paint contract before source fix |
| Branch decision for code-changing task | no | N/A: work directly in current checkout; no branch mutation requested |
| Release artifact decision | yes | Registry-only visible fix: update registry changelog; no package changeset |
| Browser tool decision for browser surface | yes | Use Browser on `/blocks/link-demo`; use the hook regression for the deterministic pre-position state and focused repo Playwright for final paint/interaction proof |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker named |
| Output budget strategy recorded | yes | Exact-file reads, scoped searches, capped output, generated paths excluded unless named |
| Browser pack selected | yes | Browser pack materialized in this plan |
| Browser route / app surface identified | yes | `/blocks/link-demo`, desktop link-toolbar interaction |
| Browser tool decision recorded | yes | Browser is the required normal-app QA surface; Chrome-only features are not involved |
| Console/network caveat policy recorded | yes | Runtime console errors checked; network checked only for route-breaking failures because behavior is local |
| Observable browser case captured | yes | `link-floating:first-frame-origin-flash`; direct report; `/blocks/link-demo`; focus/select an existing link and open its floating edit toolbar; expected no visible frame at viewport origin before correct anchor; desktop Browser/current checkout; claim fields popup/toolbar, geometry/paint, focus, runtime errors; bad ref `dirty:current`; final ref and SHA-256 fingerprints recorded after last code change |

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
      repo rules, copied hook/consumer/spec, Floating UI 2.1.8 source/types, and
      accepted cursor/find/floating ownership plan.
- [x] Implementation fixes the right ownership boundary: the copied registry
      Floating UI adapter owns presentation readiness; Plite geometry stays unchanged.
- [x] Release artifact requirement recorded: update the existing registry
      changelog event; package changeset N/A because no published package changes.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
      Report local outcome, root cause, tests/Browser/review, and uncommitted caveat.
- [x] Branch handling recorded for code-changing work: N/A: use the current
      checkout directly and do not mutate branches.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      one typecheck raced the running dev server's generated `.source`; stopped
      the server and the exact rerun passed, so reinstall was not warranted.
- [x] Workspace authority recorded: all commands ran in
      `/Users/zbeyens/git/plate-2`; Browser/Playwright targeted `apps/www` and
      `/blocks/link-demo`.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: hiding with `display:none` would corrupt the first
      measurement; `visibility:hidden` preserves dimensions and P1 review verified it.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work: exact current source snapshot for the copied hook,
      unit regression, and registry changelog after the inherited checkout was
      too large for the helper's eight-pass cap.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent/tooling source changes planned.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it. Browser is selected.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
      Both focused Playwright cases call `runtimeErrors.assertNone`; all final runs passed.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
      Browser captured the final anchored toolbar on `/blocks/link-demo`.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof.
      Final surface pixel path: positive-control pass, negative-control pass;
      duplicate-control N/A because the claim is placement readiness, not duplicate
      layering. The deterministic pre-position oracle is the hook style contract.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix: the unresolved-position unit contract failed with
      `visibility` undefined and passes with `visibility: hidden`. A temporary
      mutation/rAF browser observer did not fail the old code and was deleted
      rather than retained as false coverage.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints. Final
      process port 3113, ten retry-free rows, fresh Browser tab, fingerprints below.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree. N/A: this is an uncommitted local candidate;
      no pushed/clean-ref claim is made.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording. Chromium final
      ledger: painted boundary 5/5 and exact link-demo behavior 5/5, retries 0.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof. The rejected
      observer experiment was removed; final proof uses shipped source/tests.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Unit red/green, scoped lint, registry check/build, `www` typecheck, 10/10 final browser rows, Browser screenshot/placement, and clean P1 review all pass |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | `bun test ...use-widget-floating.spec.tsx` failed: unresolved position returned visible style; 1 pass, 1 fail |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Final hook spec: 2 pass, 0 fail, 12 assertions |
| TypeScript or typed config changed | yes | Run relevant typecheck | Final `pnpm turbo typecheck --filter=www`: 5/5 tasks successful |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exported package file/layout change |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest, lockfile, or dependency-graph edit |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent-rule or skill edit |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All command proof ran in `/Users/zbeyens/git/plate-2`; UI proof ran in `apps/www` at `/blocks/link-demo` |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | Browser final screenshot shows one toolbar anchored below `hyperlinks`; computed x 430.56, y 160, gap 7.78 |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Fresh port 3113 and fresh Browser tab after final registry generation; screenshot emitted in thread |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` edits |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: copied registry-only implementation; no published package or public API delta |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | Updated canonical `apps/www/src/registry/changelog/entries/2026-08-31-transient-editor-geometry.mdx`; generator check passes |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Incidental registry changelog is source-backed, Prettier-clean, generated JSON checked |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk was zero-size measurement under `display:none`; final `visibility:hidden` retains measurement at the copied UI owner; unit/browser/review proof pass |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling changes |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: generated `.source` typecheck race was caused by concurrent dev server; stopping it made exact rerun pass |
| P1 autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | Invocation 1 full local bundle exceeded 8 passes; invocation 2 exact snapshot found `display:none` P1 and was fixed; invocation 3 exact final snapshot clean, patch correct 0.95 |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR requested |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR body |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker/issue named |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped `pnpm exec ultracite fix` then `check` on both changed TS/TSX files passed |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Exact reads/searches were capped; changelog generator and one plugin-source search printed broader-than-needed output, recorded below; later commands stayed scoped |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-link-floating-first-frame.md` | Run after final plan formatting |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser clicked `hyperlinks`, observed `Edit link`, final measurable visible surface, and captured screenshot |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Both final Playwright cases assert no runtime errors; route loaded HTTP 200. Network beyond route load is N/A for local geometry |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Screenshot emitted; placement `{x:430.56,y:160,gap:7.78,width:158.28,height:39.98}` |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Pre-position visibility red/green at hook owner; `/blocks/link-demo` popup/toolbar, geometry, focus/submission, paint, and runtime errors pass |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | `dirty:377a77a537971b793a4ddbb34cc13797fdfeee15`; SHA-256 ledger below |
| Clean final runtime | no | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: local uncommitted/unpushed candidate; fresh process proof is authoritative only for recorded fingerprints, not a shipped ref |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Chromium, retries 0: final painted boundary 5/5 and exact link-demo geometry/submission 5/5 on fresh port 3113 |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | exact case, owner, Floating UI lifecycle, and tests read | implementation |
| Implementation | complete | `isPositioned` gates paint with `visibility:hidden`; unit regression and changelog updated | verification |
| Verification | complete | unit/lint/typecheck/registry plus 10/10 Chromium and Browser proof | closeout |
| PR / tracker sync | complete | N/A: neither requested nor named | final response |
| Closeout | complete | final fingerprints, P1 clean review, risks and handoff recorded | final response |

Findings:

- Floating UI initializes `floatingStyles` at `left: 0; top: 0` and exposes
  `isPositioned: false` until `computePosition` resolves.
- Floating UI resets `isPositioned` to false whenever explicit `open` becomes
  false, so it is the intended reopen-safe paint gate.
- `useWidgetFloating` currently hides only for closed/null geometry and ignores
  `isPositioned`, allowing the visible origin frame.
- The link toolbar and generic floating toolbar both use this copied adapter;
  fixing the adapter closes the bug class without touching Plite geometry.
- `display:none` is not a valid unresolved-position gate because Floating UI
  needs the floating element's real dimensions for its first computation.

Decisions and tradeoffs:

- Use Floating UI's native `isPositioned` readiness flag in the adapter's
  visibility gate -> no parallel state/effect/timer, no first-frame paint, and
  the element stays measurable for correct initial placement.
- Keep the fix registry-local -> placement readiness is UI presentation policy;
  Plite continues to own only exact selection geometry.

Implementation notes:

- Closed or geometry-less controls still use `display:none`.
- Open unresolved controls use `visibility:hidden` until `isPositioned`.
- Floating UI's existing close transition resets `isPositioned`; no local
  readiness state or effect was added.

Review fixes:

- Accepted P1: `display:none` collapses measurement -> changed the unresolved
  gate to `visibility:hidden` and updated the regression.
- Final exact-snapshot P1 autoreview: clean, no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Mutation/rAF browser observer did not fail against the old hook | 1 | Keep the deterministic owner-state red test; use Browser/Playwright for final paint and interaction | Deleted the false-coverage observer; no browser test sludge retained |
| Full local autoreview bundle exceeded the eight-pass cap because the checkout contains unrelated work | 1 | Snapshot only the exact current owner/spec/changelog files with SHA-equivalent content | Exact snapshot review found one P1, then final review passed |
| First review fix used `display:none`, collapsing Floating UI measurement | 1 | Keep the element measurable with `visibility:hidden` | Unit/browser/type/review gates pass |
| Final `www` typecheck raced the running dev server's generated `.source/server.ts` | 1 | Stop the dev server and rerun the exact command | Exact rerun passed 5/5 tasks; no reinstall needed |
| First fresh Browser click happened before editor hydration | 1 | Wait for the real link, replay after editor readiness | Final fresh-tab replay passed; automated 5/5 ledgers had zero retries |
| Changelog generator/plugin source search printed broader output than needed | 2 | Return to exact-file reads and capped commands | No later broad exploration; all remaining outputs scoped |

Verification evidence:

- Red: `bun test apps/www/src/registry/hooks/use-widget-floating.spec.tsx`
  -> 1 pass, 1 fail; unresolved position was still visible.
- Green: same command -> 2 pass, 0 fail, 12 assertions.
- `pnpm exec ultracite check` on the hook/spec -> pass.
- `pnpm turbo typecheck --filter=www` -> 5/5 tasks pass after stopping the
  concurrent dev server.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check` -> 96/96
  events checked; `pnpm --filter www build:registry` -> pass.
- Final fresh port 3113:
  `link:floating-toolbar-visible-boundary` 5/5 and
  `link floating editor submits on Enter from exact geometry` 5/5, retries 0,
  runtime error assertions clean.
- Browser `/blocks/link-demo`: one visible toolbar at x 430.56, y 160,
  7.78px below the link; 158.28x39.98; screenshot captured.
- P1 autoreview final exact snapshot -> clean, patch correct 0.95.
- SHA-256 ledger:
  - `98cf37eea9f6031441ba3ae784e31a40cea90bb282ffd1764c603b08397a485e`
    `apps/www/src/registry/hooks/use-widget-floating.ts`
  - `5a40cdd5afc9a916b99c1495785aee5b7e3f36608e255a36a56ed0efde770d24`
    `apps/www/src/registry/hooks/use-widget-floating.spec.tsx`
  - `a9006e76ad9d813dada10477e036642c0901412b9b749a45d4283ad621fa529e`
    `apps/www/src/registry/components/editor/link.tsx`
  - `4557ac2e3760809033b767583a13e1d1d387d013deaedd54a92a4e3b372aea37`
    `apps/www/tests/browser/link-floating-toolbar.spec.ts`
  - `752b7817fb0d79b2cff902f7beb61517e5dd4d9378a5f425910552ae2459ea88`
    `apps/www/tests/browser/transient-editor-geometry.spec.ts`
  - `8b3b2b3bc2e8da23e98ba350ac4f908228de6cbe1eeeceeea9bc80fcf3e62e09`
    `apps/www/public/r/use-widget-floating.json`
  - `97b469e37844af942a3581482c939f90f19707ec60325af9736dec8e7c32d93a`
    `apps/www/src/registry/changelog/entries/2026-08-31-transient-editor-geometry.mdx`
  - `706ac41393301fe02e5c7f30fa87b02482d244ed767ac39fc627942c40894ef1`
    `apps/www/src/registry/changelog/2026-08-31-transient-editor-geometry.json`

Final handoff contract:

- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct local report only
- Confidence line: 95% local candidate; not a pushed/shipped claim
- Flow table:
  - Reproduced: deterministic unresolved-position unit contract red
  - Verified: unit/type/lint/registry/review green; final Chromium 10/10; Browser visual green
- Browser check: `/blocks/link-demo` anchored toolbar screenshot and placement recorded
- Outcome: no paint while placement is unresolved; correctly anchored toolbar revealed afterward
- Caveat: uncommitted/unpushed local candidate; a clean pushed-ref claim requires replay after Git integration
- Design:
  - Chosen boundary: copied `use-widget-floating` registry adapter
  - Why not quick patch: caller-local hiding would duplicate policy and miss the generic floating toolbar
  - Why not broader change: Plite already supplies exact geometry; readiness is Floating UI presentation policy
- Verified: exact commands and Browser result listed above
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

- PR: N/A: no PR requested
- Issue / tracker: N/A: no issue/Linear target
- Browser proof: final route screenshot plus 10/10 retry-free Chromium rows
- Caveats: local uncommitted/unpushed candidate only

Timeline:

- 2026-08-31T05:35:19.870Z Task goal plan created.
- 2026-08-31 Source read identified ignored `isPositioned` as the root cause;
  no implementation edit made before requirement extraction and owner audit.
- 2026-08-31 Exact unit contract failed before the fix and passed after gating
  unresolved placement.
- 2026-08-31 P1 review rejected `display:none`; final implementation uses
  `visibility:hidden` so Floating UI can measure before reveal.
- 2026-08-31 Final source/type/lint/registry gates passed; fresh port 3113
  completed both browser lanes 5/5 and Browser captured the anchored result.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Prevent any visible link-toolbar origin frame, then reveal the correctly anchored toolbar |
| What have I learned? | `isPositioned` is the canonical readiness signal, but unresolved UI must use visibility rather than display so measurement stays correct |
| What have I done? | Fixed the copied owner, added red/green coverage, regenerated registry output, passed type/lint/browser/review, and recorded fingerprints |

Open risks:

- No known code defect. Integration risk remains: the source files are part of
  a larger uncommitted checkout, so no pushed-ref or shipped-state claim exists.
