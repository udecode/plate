# cut expect defined

Objective:
Cut the copied `expectDefined` helper; done when all 19 callers use explicit
contextual null checks, the registry item is gone, and source, generated,
typecheck, lint, changelog, and Browser checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-28-cut-expect-defined.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user request
- id / link: N/A: no tracker item
- title: Cut `expectDefined`
- acceptance criteria: delete the helper and its registry item; inline explicit
  contextual null checks at all 19 source callers; remove dependency metadata
  and generated payloads; preserve successful runtime behavior.

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
- initial confidence score: N/A: binary hard-cut threshold
- improvement loop: N/A: one-shot source, generation, and proof loop
- final score / loop closure: N/A: completion is command- and source-audited

Completion threshold:
- Zero `expectDefined` / `expect-defined` matches remain in authoritative
  runtime source, registry metadata, or generated install payloads. The removal
  name remains only in the required registry changelog event and this plan.
- All 19 former calls use explicit `value == null` checks with the same
  contextual error messages and no replacement helper or compatibility alias.
- Registry generation/changelog checks, www typecheck, scoped lint, one
  representative Browser route, and the goal-plan checker pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-28-cut-expect-defined.md` passes.

Verification surface:
- Exact `rg` source/generated audit and review of all 19 rewritten call sites.
- `pnpm --filter www typecheck`, scoped `ultracite fix/check`, registry
  changelog write/check, and `pnpm --filter www build:registry`.
- Browser `/blocks/editor-basic`: editor renders and console stays clear.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: the four registry component callers, registry metadata, and
  the existing canonical editor API changelog event.
- Allowed edit scope: `apps/www/src/registry/**`, generated registry output,
  and this goal plan.
- Browser surface: `/blocks/editor-basic` as the representative composed editor.
- Browser strategy: in-app Browser for route/render/console proof; Chrome and
  Computer are N/A because no native browser or OS behavior changes.
- Tracker sync: N/A: no tracker or PR.
- Non-goals: package APIs, new helper abstractions, error-message redesign,
  editor semantics, commit/push/PR work.

Output budget strategy:
- Search authoritative registry source first with filename/count output;
  exclude generated payload content until the final zero-match audit. Read only
  the four caller ranges and cap all command output. The initial generated-tree
  search accidentally streamed oversized payload snippets; all later searches
  stay source-scoped or filename-only.

Blocked condition:
- Stop only if a former call cannot preserve its null-only failure semantics
  without introducing another shared helper, or registry generation/browser
  proof remains unavailable after the repo's single install-corruption retry.

Task state:
- task_type: registry hard cut
- task_complexity: micro
- current_phase: closeout
- current_phase_status: complete
- next_phase: user handoff
- goal_status: complete

Current verdict:
- verdict: delete the helper and inline every domain check
- confidence: high
- next owner: user review
- reason: the helper only shortens null checks and creates copied-code
  dependency/registry overhead without owning behavior.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-28-cut-expect-defined.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | The single hard-cut request is copied into the objective, threshold, boundary, and checklist. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `hard-cut`, `autogoal`, `registry-changelog`, and Browser instructions. |
| Active goal checked or created | yes | Goal tool returned no active goal; this plan supplies the new objective path. |
| Source of truth read before edits | yes | Read helper, 19 callers across four files, registry metadata, and current changelog entry. |
| Tracker comments and attachments read | no | N/A: direct request with no tracker or attachment. |
| Video transcript evidence required | no | N/A: no video or recording. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Exact search found no solution owning this registry helper cut. |
| TDD decision before behavior change or bug fix | no | N/A: behavior-preserving helper inline; typecheck, generation, source audit, and Browser render are the honest proof. |
| Branch decision for code-changing task | yes | Work stays on the current `next` checkout; no branch, commit, or PR was requested. |
| Release artifact decision | yes | Registry copied-code install shape changes; update the existing registry changelog event. No package changeset applies. |
| Browser tool decision for browser surface | yes | Use in-app Browser on `/blocks/editor-basic`; native Chrome/OS tooling is inapplicable. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Source-scoped counts/ranges first; generated payload content excluded until final audit. |
| Browser pack selected | yes | Registry component dependencies and copied output change. |
| Browser route / app surface identified | yes | `/blocks/editor-basic`, render the composed editor and inspect console. |
| Browser tool decision recorded | yes | In-app Browser is the correct ordinary app QA surface. |
| Console/network caveat policy recorded | yes | Require no task-caused console errors; external network behavior is unchanged. |
| Observable browser case captured | no | N/A: direct structural hard cut, not a report-backed behavior defect. |

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
- [x] Required video or screen-recording evidence is N/A: no recording supplied.
- [x] Nearby repo instructions, helper, callers, metadata, and changelog pattern were read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: registry changelog applies; package changeset does not.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy is N/A: no install-corruption signal occurred.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] P1 autoreview is N/A: this micro cut is on `next`, where repo law forbids autoreview.
- [x] Agent-native review is N/A: no agent instructions or tooling changed.
- [x] Output budget discipline recorded and followed after the initial generated-payload overrun: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: `/blocks/editor-basic` renders the composed editor with no task-caused console errors.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console warnings/errors were checked and the result was empty; network behavior is unchanged.
- [x] Browser pack: the DOM exposed the full rendered state, so no screenshot was needed.
- [x] Browser pack: paint proof is N/A because this change makes no paint claim.
- [x] Browser pack: report-backed red-before-green proof is N/A because this is a direct structural cut.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the local uncommitted proof boundary.
- [x] Browser pack: pushed-ref certification is N/A because no commit or push was requested.
- [x] Browser pack: retry-free native stability is N/A because no selection, focus, DnD interaction, compositor, or lifecycle behavior changed.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Zero runtime/metadata/generated matches, 19 explicit checks, and every named command/browser gate passed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: direct helper removal, not a reported behavior bug. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | www typecheck, registry build, exact source audit, and Browser render passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed after the explicit-check rewrite. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: registry item removal does not change package barrels. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest or lockfile edit. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent source changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2`; Browser used its local www server. |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | In-app Browser rendered `/blocks/editor-basic`. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | DOM contained Basic Editor content and console warnings/errors were empty. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` output changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: registry-only copied-code install change; no package changeset. |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | Registry uses the source-owned changelog system; `2026-08-28-inline-required-value-checks.mdx` was generated and checked. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Incidental registry changelog source matches the final copied-code shape and generator check passed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk was lost null-only semantics or missing copied dependency; explicit `== null` checks, typecheck, generation, audit, and Browser cover it. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent or user-action tooling changed. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: the only failure was a real TypeScript narrowing error and the source fix resolved it. |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: micro structural cut on `next`; repository law forbids autoreview on `next`. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: user did not request a PR. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR exists. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR or proof image. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below with local/no-PR boundaries and exact proof. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped `ultracite fix` then `ultracite check` passed on 10 source files. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Initial generated-payload search overran; all subsequent searches used source scopes, counts, filenames, or explicit output caps. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-28-cut-expect-defined.md` | Plan is fully resolved; final checker result is recorded after this edit. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Fresh in-app Browser tab loaded `/blocks/editor-basic` from the final local source. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Warning/error log query returned `[]`; dev server returned HTTP 200. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | DOM snapshot recorded the Basic Editor heading, editable textbox, headings, blockquote, and marks. |
| Exact case replay | no | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | N/A: no report-backed behavior case. |
| Final ref and fingerprints | no | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | N/A: local uncommitted request; no pushed-ref claim. |
| Clean final runtime | no | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: fresh local process proved the candidate; no immutable release claim. |
| Retry-free stability | no | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | N/A: no native interaction or lifecycle behavior changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read 19 calls, helper, registry metadata, changelog, and governing skills | implementation |
| Implementation | complete | Inlined 19 explicit contextual null checks; deleted helper and dependencies | verification |
| Verification | complete | Typecheck, lint, changelog, registry build, zero-match audit, and Browser passed | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested | final response |
| Closeout | complete | Goal plan resolved and final handoff prepared | final response |

Findings:
- `expectDefined` owned no behavior beyond `value == null` plus
  `throw new Error(message)`.
- The helper had 19 calls across `dnd`, `inline-combobox`,
  `block-discussion`, and `use-chat`, plus four copied registry dependencies.
- Registry regeneration removed the standalone item and reduced canonical
  payloads from 379 to 378 while retaining 15 sparse overlays.

Decisions and tradeoffs:
- Inline each check at its domain owner. A renamed helper, assertion function,
  or compatibility registry item would preserve the same useless dependency.
- Preserve null-only semantics with `== null`; do not turn valid falsy values
  such as empty suggestion text into errors.
- Keep one removal changelog event even though runtime/generated install output
  must contain zero helper references.

Implementation notes:
- `dnd` resolves DOM nodes and parents into locals, then throws before use.
- `inline-combobox` checks each Ariakit store at the consuming component.
- `block-discussion` validates type-specific suggestion fields after hooks and
  carries narrowed local strings into JSX; its mounted block path is checked
  after all hooks.
- `use-chat` validates streaming payload fields before applying updates.

Review fixes:
- First www typecheck rejected property narrowing across JSX callbacks in
  `BlockSuggestionCard`; accepted and fixed by retaining type-specific checked
  local strings. Fresh typecheck passed.
- Manual source review preserved every original contextual error message and
  found no replacement abstraction or compatibility path.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial memory/source sweep streamed generated registry payload bodies | 1 | Restrict later searches to source paths, filenames, or counts | No product impact; subsequent output stayed bounded. |
| First source zero-match glob still included changelog output | 1 | Search runtime, metadata, and generated install roots explicitly | Final audit passed while preserving the required removal changelog. |
| First www typecheck found four `string \| undefined` JSX arguments | 1 | Narrow checked type-specific fields into stable locals | Fresh www typecheck passed. |

Verification evidence:
- Source audit in `/Users/zbeyens/git/plate-2`: zero `expectDefined` or
  `expect-defined` matches in registry components/lib/metadata,
  `apps/www/src/__registry__`, or `apps/www/public/r`; helper source and public
  payload do not exist.
- Manual call-site audit: 19 former helper calls are explicit `== null` checks
  with their original contextual messages; the twentieth nearby throw is the
  pre-existing inline-combobox provider guard.
- `pnpm --filter www typecheck` passed after the narrowing repair.
- Scoped `pnpm exec ultracite fix` followed by scoped
  `pnpm exec ultracite check` passed on 10 files.
- Registry changelog `--write` and `--check` passed with 92 events.
- `pnpm --filter www build:registry` passed: 378 canonical payloads and 15
  sparse overlays.
- `git diff --check` passed for the touched source scope.
- Fresh local www server returned HTTP 200 for `/blocks/editor-basic`; Browser
  DOM showed the complete Basic Editor and warning/error logs returned `[]`.
- P1 autoreview: N/A because the current branch is `next`, where repository law
  forbids autoreview.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-28-cut-expect-defined.md` passed.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct user request
- Confidence line: high; source, generated, typecheck, lint, changelog, and Browser proof agree
- Flow table:
  - Reproduced: N/A: structural cut, not a behavior bug
  - Verified: www typecheck, source/generated audit, registry build, and Browser passed
- Browser check: `/blocks/editor-basic` rendered; HTTP 200; zero warning/error logs
- Outcome: shared helper and copied dependency are gone; all 19 owners throw contextual errors directly
- Caveat: local uncommitted proof only; no release or pushed-ref claim
- Design:
  - Chosen boundary: the four consuming registry components
  - Why not quick patch: renaming or hiding the helper would keep the needless install dependency
  - Why not broader change: other domain guards already have truthful local ownership
- Verified: exact commands and Browser result are recorded above
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
- Issue / tracker: N/A: no tracker
- Browser proof: `/blocks/editor-basic`, full editor DOM, HTTP 200, no warning/error logs
- Caveats: local uncommitted state only

Timeline:
- 2026-08-28T06:11:11.406Z Task goal plan created.
- 2026-08-28T06:12Z Goal activated after the 19-call ownership sweep.
- 2026-08-28T06:15Z Helper, registry item, dependencies, and callers cut.
- 2026-08-28T06:17Z First typecheck exposed JSX narrowing; local-value repair applied.
- 2026-08-28T06:20Z Typecheck, lint, changelog, registry build, source audit, and Browser proof passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | User handoff |
| What is the goal? | Cut `expectDefined` without a replacement helper and prove copied output stays valid |
| What have I learned? | All 19 calls belong cleanly to their local domains |
| What have I done? | Deleted the helper/item/dependencies, inlined checks, regenerated output, and passed final proof |

Open risks:
- Local uncommitted state is not release certification. No runtime or source
  risk remains inside the requested hard-cut scope.
