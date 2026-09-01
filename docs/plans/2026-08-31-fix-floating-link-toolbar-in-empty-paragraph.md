# Fix floating link toolbar in empty paragraph

Objective:
Open the floating link toolbar from an empty paragraph; done when the exact
ControlOrMeta+K regression and browser proof pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-fix-floating-link-toolbar-in-empty-paragraph.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:

- browser (docs/plans/templates/packs/browser.md)

Task source:

- type: direct user bug report
- id / link: `floating-link-empty-paragraph`
- title: Floating link toolbar does not open in an empty paragraph
- acceptance criteria: With the caret in an empty paragraph on the link demo,
  ControlOrMeta+K visibly opens the link insert toolbar at the caret and focuses
  the URL input without runtime errors.

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
- initial confidence score: N/A: binary regression gate is stronger
- improvement loop: reproduce, add red proof, fix owner, verify 5/5
- final score / loop closure: N/A: exact pass threshold below

Completion threshold:

- A focused regression fails before the product fix and passes afterward.
- `/blocks/link-demo` passes the exact empty-paragraph ControlOrMeta+K flow 5/5
  without retries, with the URL input visible and focused at a non-zero editor
  anchor and no recorded runtime errors.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-floating-link-toolbar-in-empty-paragraph.md` passes.

Verification surface:

- Focused owner test selected after reproduction.
- `apps/www/tests/browser/transient-editor-geometry.spec.ts` exact case.
- Focused typecheck/lint for every changed owner.
- Browser replay on `http://localhost:<port>/blocks/link-demo`.

Constraints:

- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:

- Source of truth: direct user report plus current Link registry and Plite
  selection-geometry owners.
- Allowed edit scope: `apps/www` Link/geometry registry source and tests;
  `packages/plitejs` geometry only if reproduction proves it owns the defect.
- Browser surface: `apps/www`, `/blocks/link-demo`.
- Browser strategy: in-app Browser for exact keyboard/focus/visibility QA. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker or public issue was supplied.
- Non-goals: no new public API, positioning package, plugin, broad Link redesign,
  commit, push, PR, or unrelated UI changes.

Output budget strategy:

- Read exact Link, geometry, test, and route files; use capped `rg` queries that
  exclude generated registry output; keep command output below 12k tokens.

Blocked condition:

- Stop as `needs-repro` only if the exact current route/action does not fail
  after source inspection and three distinct honest replay attempts, or if the
  route cannot run after the documented single reinstall recovery.

Task state:

- task_type: Plite selection-geometry browser behavior bug
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:

- verdict: local fix verified on the exact empty-paragraph interaction
- confidence: high; owner contract, exact Chromium regression, broad Plite gate,
  fresh Browser replay, and 5/5 warm runs pass
- next owner: user for any commit or PR request
- reason: the Link store opens and mounts the inputs, but the native collapsed
  Range on the empty `<br>` reports `(0,0,0,0)` while the `<br>` itself is at
  the real caret line; Plite now rejects the unusable rect and publishes the
  zero-width line rect to Floating UI.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-floating-link-toolbar-in-empty-paragraph.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | One requirement: fix Link insert toolbar opening from an empty paragraph; exact action and outcome are recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `patch`, `autogoal`, and Browser workflows loaded; TDD and browser proof apply |
| Active goal checked or created | yes | Goal created for this exact bug and plan |
| Source of truth read before edits | yes | User report; current `link.tsx`, `use-widget-floating.ts`, Plite geometry hook, and existing browser spec |
| Tracker comments and attachments read | no | N/A: no tracker target |
| Video transcript evidence required | no | N/A: no video supplied |
| `docs/solutions` checked for non-trivial existing-code work | yes | Focused search found no matching Link/Floating UI solution |
| TDD decision before behavior change or bug fix | yes | Add exact failing browser row first; add focused owner coverage if the cause is deterministic below the browser |
| Branch decision for code-changing task | yes | Use the current checkout exactly as provided; no branch inspection or switch |
| Release artifact decision | yes | Package behavior is absent from `main`; changeset and registry changelog are N/A for this branch-only implementation fix |
| Browser tool decision for browser surface | yes | In-app Browser; no native browser/OS surface requires Chrome |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker target |
| Output budget strategy recorded | yes | Exact-file reads and capped generated-output-excluding searches only |
| Browser pack selected | yes | Browser pack materialized in this plan |
| Browser route / app surface identified | yes | `apps/www` `/blocks/link-demo` |
| Browser tool decision recorded | yes | In-app Browser for route replay; Playwright spec is durable automation, not substitute proof |
| Console/network caveat policy recorded | yes | Runtime errors must be empty; unrelated dev asset noise, if any, is recorded separately |
| Observable browser case captured | yes | `floating-link-empty-paragraph`: `/blocks/link-demo`; focus editor, select all, delete to one empty paragraph, press ControlOrMeta+K; expect visible focused Paste link input anchored inside editor; current pre-edit checkout is bad ref; final source/test fingerprints recorded after proof |

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
- [x] Required video or screen-recording evidence is N/A: no video supplied.
- [x] Nearby repo instructions and implementation patterns read before edits:
      Link owner, Widget geometry owner, registry floating adapter, existing browser spec.
- [x] Implementation fixes the right ownership boundary: Plite selection Widget
      geometry rejects an unusable native Range rect and resolves its rendered
      empty-line anchor once for every consumer.
- [x] Release artifact requirement recorded. N/A: the changed Plite geometry
      owner does not exist on `main`, so this branch-only behavior repair is not
      a release delta from `main`; no registry source changed.
- [x] Final handoff shape decided: local bug-fix handoff with exact tests,
      browser proof, architecture boundary, and uncommitted caveat; PR and
      tracker lines are N/A.
- [x] Branch handling recorded for code-changing work: current checkout is the
      authorized target; no branch operation is requested.
- [x] Local-env-rot retry policy recorded. N/A: no install-corruption signal;
      all focused and broad checks passed without reinstalling.
- [x] Workspace authority recorded: package commands and browser automation ran
      from `/Users/zbeyens/git/plate-2`; the live route was
      `http://localhost:3000/blocks/link-demo`.
- [x] High-risk note recorded. Failure mode: accepting an origin-zero native
      rect can mount every selection Widget against the viewport; owner proof
      covers both the geometry contract and the real Link consumer.
- [x] Review/P1 autoreview target selected from actual diff state. N/A: the
      current branch is `next`, whose repo rule forbids running `autoreview`;
      direct scoped review found no actionable issue.
- [x] Agent-native review decision recorded. N/A: no agent/tooling source was
      changed for this task.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it. This normal
      app surface required Browser only.
- [x] Browser pack: console errors are empty; network is in scope only for route
      loading, which succeeded.
- [x] Browser pack: Browser directly inspected visibility and exact DOM bounds;
      no screenshot or Chrome/Computer fallback was required.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof. N/A:
      the claim is popup visibility and geometry, not paint-layer identity.
- [x] Browser pack: report-backed proof failed on the exact observable case
      before the fix: ControlOrMeta+K mounted the toolbar at viewport origin.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records ref `377a77a537971b793a4ddbb34cc13797fdfeee15` plus the
      production/test fingerprints below. Browser-client restores locator
      focus after `press`; Chromium Playwright independently proves URL-input
      focus 5/5.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree. N/A for pushed certification: this is an
      explicitly local, uncommitted candidate; a fresh page proved the exact
      current fingerprints.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording. Browser popup
      visibility and anchor geometry passed 5/5; Chromium Playwright visibility,
      anchor geometry, URL focus, Escape, and root-focus restoration passed 5/5.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof. The registry
      rebuild only refreshed existing generated output and is not proof for this fix.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Owner contract 20/20, exact Link browser rows 2/2, React typecheck, scoped lint, `check:plite:dev`, fresh Browser exact replay, and Browser 5/5 pass |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Owner test failed expected `30,40,0`, received `0,0,0`; Browser mounted the toolbar at x=0 while its empty line was x=361.11 |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Exact empty-paragraph Chromium row passes and performs five complete open/close/focus cycles |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter plitejs typecheck:entrypoint:react` and the broader source-first gate passed |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no export or file-layout change |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no task-owned manifest, lockfile, or dependency change |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no task-owned agent source changed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All package and app commands ran in `/Users/zbeyens/git/plate-2`; Browser exercised the canonical local route |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | Fresh Browser tab opened the Link toolbar from one empty paragraph at its actual line anchor |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Fresh Browser geometry ledger passed 5/5 with wrapper x=361.11,y=90 and empty line x=361.11,y=63.30,height=18.89 |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` output changed |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | No public API change. N/A changeset: `main` has no `packages/plitejs/src/react/widget-geometry.ts`, so this behavior is not a release delta from `main` |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: production fix is in Plite; no registry component source changed |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only this internal goal plan changed |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk is broader selection Widgets anchoring at the viewport origin; fix stays in canonical geometry resolution and is covered below the Link UI plus through the consumer |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling change |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no matching corruption signal and every gate passed |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: loaded the complete skill, then confirmed branch `next`; repo law says never run `autoreview` on `next`. Direct scoped diff review found no actionable finding |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker target |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Completed below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped `pnpm exec ultracite check` passed for both code/test owners and this plan |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Commands were path-scoped or output-capped; broad gate output was capped and summarized from its machine-readable result |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-floating-link-toolbar-in-empty-paragraph.md` | Final mechanical gate is run after this evidence update |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Exact select-all, Backspace, ControlOrMeta+K, visible anchored popup, Escape flow exercised in a fresh Browser tab |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Browser error log is empty; route loaded successfully |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Exact Browser DOM/geometry ledger recorded below; screenshot is N/A because the required popup and bounds were directly inspectable |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Exact `/blocks/link-demo` empty-paragraph ControlOrMeta+K case passed; Chromium also proved focus, Escape close, and root-focus restoration |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Ref `377a77a537971b793a4ddbb34cc13797fdfeee15`; three task-owned hashes are listed below |
| Clean final runtime | no | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: local uncommitted/unpushed candidate in an inherited dirty checkout; proof binds to exact task-owned hashes, not a shipped ref |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Browser visibility/geometry passed 5/5; Chromium Playwright complete focus/open/close cycle passed 5/5 with retry count zero |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Browser exact repro: mounted toolbar at x=0,y=7.78; empty BR at x=361.11,y=63.30 | red proof complete |
| Red proof | completed | Owner test received `0,0,0`; exact Chromium row failed viewport-origin placement | implementation complete |
| Implementation | completed | Plite falls back from an unusable native Range rect to the rendered zero-width line rect | verification complete |
| Verification | completed | owner 20/20, Link Chromium 2/2, typecheck, lint, broad Plite gate, fresh Browser 5/5 | closeout complete |
| PR / tracker sync | completed | N/A: neither requested nor targeted | final response |
| Closeout | completed | release decision, direct review, hashes, and handoff recorded | final response |

Findings:

- Browser exact repro on `/blocks/link-demo`: after select-all, Backspace, and
  ControlOrMeta+K, `Paste link` exists but the toolbar rect is
  `{x:0,y:7.78,width:330,height:64.95}` and the URL input is not focused.
- The native selection is collapsed on the empty paragraph `<br>`. Its Range
  rect is `{x:0,y:0,width:0,height:0}`; the `<br>` rect is
  `{x:361.11,y:63.30,width:0,height:18.89}`.
- Root owner: Plite collapsed-selection geometry must reject the unusable native
  Range rect and resolve the empty-line caret from its DOM point.

Decisions and tradeoffs:

- Fix Plite Widget geometry, not Link or Floating UI -> every consumer receives
  a valid empty-caret anchor -> risk is limited to collapsed empty-leaf geometry.

Implementation notes:

- `resolveRangeGeometry` keeps the native collapsed Range rect when usable.
- When that rect is all-zero, it reads the closest rendered
  `[data-plite-zero-width]` line and publishes that immutable viewport rect.
- If neither rect is usable, geometry stays unavailable instead of publishing
  a fake origin anchor.

Review fixes:

- Direct scoped review: keep. The fallback is lazy, owned by Plite geometry,
  limited to an unusable native rect, and does not add public API or Link policy.
- P1 helper: N/A because the current branch is `next` and repository law
  expressly forbids running `autoreview` there.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `ownerDocument.getSelection()` unavailable in Browser evaluate scope | 1 | use `ownerDocument.defaultView.getSelection()` | resolved; exact DOM/Range evidence captured |
| Vitest was first pointed at non-test implementation filename | 1 | run the generated `.test.tsx` contract entry | resolved; red then green owner proof captured |
| Browser spec first used the editor harness hotkey helper, which omits `KeyboardEvent.code` | 1 | send the physical hotkey through the editable root | resolved; reporter-valid command path exercised |
| First placement assertion sampled the Floating UI entrance animation | 1 | poll the settled relation between popup and empty-line rect | resolved; exact geometry passes without retry |
| Generated registry index referenced the already-renamed inactive-selection demo | 1 | run the required `pnpm --filter www build:registry` source generator | resolved; unrelated current registry output refreshed, not counted as Link proof |

Verification evidence:

- Browser pre-fix reproduction, in-app Browser, cwd `/Users/zbeyens/git/plate-2`,
  route `/blocks/link-demo` -> fail: toolbar anchored at viewport origin.
- Red owner command:
  `pnpm --filter plitejs exec vitest run --config ./vitest.config.mjs test/react/widget-layer-contract.test.tsx -t "selection geometry anchors a collapsed empty paragraph"`
  -> expected `30,40,0`, received `0,0,0`.
- Green owner contract: the same full test file -> 20 passed.
- Exact Chromium regression:
  `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --filter www test:www-browser:chromium transient-editor-geometry.spec.ts --grep "link floating editor"`
  -> 2 passed; the empty-paragraph row performs 5/5 open, placement, URL-focus,
  Escape-close, and editor-focus-restoration cycles with zero retries.
- `pnpm --filter plitejs typecheck:entrypoint:react` -> passed.
- Scoped `pnpm exec ultracite check` on production, owner test, browser test,
  and goal plan -> passed.
- `pnpm check:plite:dev` -> passed in 25.447s: 86 entrypoint typechecks,
  entrypoint tests, 221 Node contracts, 25 Bun contracts, public types,
  www integration typecheck, and Chromium smoke all green.
- Fresh Browser `/blocks/link-demo` -> five of five runs visible and anchored:
  empty line `{x:361.11,y:63.30,height:18.89}`, wrapper
  `{x:361.11,y:90}`, no error logs. Browser-client restores locator focus after
  its `press` call; the Chromium regression above independently proves URL focus.
- Ref: `377a77a537971b793a4ddbb34cc13797fdfeee15` plus local uncommitted changes.
- SHA-256: `widget-geometry.ts`
  `f371905e0153f8b8a1aa540ab0184393ce359f41a023eae18e9f2909e82b7f2c`;
  `widget-layer-contract.tsx`
  `df7f7d2271154ce0897dabad9c899a366835638a81b6ce7b71d862072c48788f`;
  `transient-editor-geometry.spec.ts`
  `9d03d062bd130e0c383606c977bccff7a8ab50afe093a57c8031edb4014abc89`.

Final handoff contract:

- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker target
- Confidence line: high for the exact local interaction; not a pushed or released claim
- Flow table:
  - Reproduced: owner test red; Browser exact empty-paragraph case at viewport origin
  - Verified: owner and Link browser regressions green; fresh Browser 5/5 green
- Browser check: complete on a fresh tab; exact bounds valid and error log empty
- Outcome: ControlOrMeta+K opens the Link toolbar from an empty paragraph at the caret line
- Caveat: local uncommitted/unpushed checkout; Browser-client does not preserve
  input focus after locator `press`, so actual URL-focus proof comes from the
  exact Chromium Playwright row
- Design:
  - Chosen boundary: Plite selection Widget geometry
  - Why not quick patch: Link-side fake coordinates would leave every other selection Widget broken
  - Why not broader change: no new public API, plugin, or Floating UI policy is needed
- Verified: owner contract, Link browser regression, typecheck, lint, broad Plite gate, and Browser 5/5
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
- Issue / tracker: N/A: none
- Browser proof: exact fresh-tab replay and 5/5 warm ledger passed with final hashes
- Caveats: local uncommitted/unpushed candidate; P1 autoreview is forbidden on `next`

Timeline:

- 2026-08-31T13:18:44.110Z Task goal plan created.
- 2026-08-31 Exact Browser replay and owner inspection identified the all-zero native collapsed Range rect.
- 2026-08-31 Owner and Chromium regressions were red before the Plite geometry fix and green afterward.
- 2026-08-31 Typecheck, lint, broad Plite development gate, fresh Browser replay, and 5/5 warm stability passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Open the Link toolbar from an empty paragraph at its caret line |
| What have I learned? | Chrome returns an all-zero collapsed Range rect for the empty `<br>` while the rendered zero-width line has valid geometry |
| What have I done? | Added red/green owner and browser coverage, fixed Plite geometry, and proved the exact interaction |

Open risks:

- Local candidate only; commit, PR, integration, and release are outside this request.
