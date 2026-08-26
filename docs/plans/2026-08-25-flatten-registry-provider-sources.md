# flatten registry provider sources

Objective:
Flatten Plate provider authors into `bases/{base,radix}`; done when all 8
variants resolve to flat targets and registry, type, browser, and agent checks
pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-25-flatten-registry-provider-sources.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: accepted user-directed architecture cleanup
- id / link: current Codex thread; no external tracker
- title: Flatten registry provider source layout
- acceptance criteria:
  - exactly four Base and four Radix provider authors live directly under
    `apps/www/src/registry/bases/{base,radix}`;
  - no provider author remains under `components/editor` or a nested `editor`
    directory;
  - provider-neutral authors remain under `components/editor`;
  - Base remains the default, Radix remains the explicit overlay, and Aria
    remains unsupported;
  - every provider author installs to the same flat `@components/editor/*`
    target;
  - registry generation, focused tests, typecheck, browser smoke, generated
    skill sync, and review gates pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A
- initial confidence score: N/A: binary source and command gates apply
- improvement loop: repair any failed owner and rerun its focused proof
- final score / loop closure: N/A

Completion threshold:
- Source audit reports 8 provider authors, 0 `bases/*/editor` files, and 0
  provider authors under `components/editor`.
- Base and Radix registry rows both resolve to their provider source while
  retaining the same flat install target.
- Focused registry tests, provider type/bundle checks, registry build, lint,
  generated-skill sync audit, agent-native review, and Browser interaction pass.
  The full `www` typecheck must pass through registry-source closure; unrelated
  checkout errors are recorded by owner and do not invalidate focused proof.
- P1 autoreview is N/A because the user explicitly waived it on 2026-08-25.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-flatten-registry-provider-sources.md` passes.

Verification surface:
- Source audit with focused `find` and `rg` commands under
  `apps/www/src/registry`.
- Focused registry and response tests from `/Users/zbeyens/git/plate-2`.
- `pnpm --filter www typecheck`, focused provider type/bundle checks, and
  `pnpm --filter www build:registry` from the repository root.
- `pnpm install` plus source/generated `plate-ui` path-parity audit.
- Browser smoke of the standalone basic-nodes block, including toolbar
  rendering/interaction and console state.
- Agent-native parity review. P1 local autoreview is explicitly waived.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not add runtime provider switching, handwritten proxy files, Aria source,
  or preset-named provider directories.
- Preserve the generated registry payload and public install contract except
  for source provenance paths.

Boundaries:
- Source of truth: `registry-variants.ts`, `registry.ts`, provider authors,
  focused tests/scripts, `docs/vision/plate.md`, and `.agents/rules/plate-ui.mdc`.
- Allowed edit scope: `apps/www/src/registry`, focused `apps/www` scripts/tests,
  generated registry output, `.agents/rules/plate-ui.mdc`, its generated skill
  mirror via `pnpm install`, and this goal plan.
- Browser surface: standalone basic-nodes block demonstrating the toolbar.
- Browser strategy: Browser for normal app QA. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue or Linear task supplied.
- Non-goals: adding providers, changing presets, changing public component
  contracts, committing, pushing, opening a PR, or editing templates.

Output budget strategy:
- Use exact files and owner-scoped `rg`; exclude generated payloads until the
  registry build; cap command output and inspect counts before matching lines.

Blocked condition:
- Stop only if the flat provider-author invariant cannot coexist with a
  typecheckable/installable graph after exhausting build-time source resolution,
  or if the required Browser surface cannot start after one environment reset.

Task state:
- task_type: behavior-neutral registry source-ownership cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: ready_for_completion

Current verdict:
- verdict: accepted hard cut implemented and verified within task ownership
- confidence: high
- next owner: user
- reason: provider ownership, install targets, generated payloads, and local
  Radix interaction are proven; only unrelated shared-checkout failures remain.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-flatten-registry-provider-sources.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria above copy the accepted source layout, exclusions, targets, and proof requirements. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `autogoal`, `architecture-cleanup`, `plate-ui`, `shadcn`, and `agent-native-reviewer`. |
| Active goal checked or created | yes | Created the matching active goal for this plan. |
| Source of truth read before edits | yes | Read root `VISION.md`, `docs/vision/plate.md`, registry resolver/manifest/tests, provider files, and Plate UI source rule. |
| Tracker comments and attachments read | no | N/A: no tracker supplied. |
| Video transcript evidence required | no | N/A: no recording supplied. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Focused registry/provider search found no source-layout solution; init-route guidance is unrelated. |
| TDD decision before behavior change or bug fix | yes | Existing registry contracts cover source selection; the changelog provider-inference gap received a red/green generator test. |
| Branch decision for code-changing task | no | N/A: no commit or PR requested; repository policy forbids proactive branch inspection. |
| Release artifact decision | yes | Regenerate Base and Radix registry payloads plus the existing Base-first registry changelog event. |
| Browser tool decision for browser surface | yes | Use Browser on the standalone basic-nodes block; no native Chrome behavior. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker supplied. |
| Output budget strategy recorded | yes | Exact-file reads, focused counts, and capped output recorded above. |
| Agent-native pack selected | yes | `.agents/rules/plate-ui.mdc` path teaching must change. |
| Agent-facing action surface identified | yes | Plate UI source-path discovery for provider variants. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/plate-ui.mdc`; regenerate `.agents/skills/plate-ui/SKILL.md` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded before edits. |
| Browser pack selected | yes | `apps/www` registry source changes require route proof. |
| Browser route / app surface identified | yes | Standalone basic-nodes block and toolbar interaction. |
| Browser tool decision recorded | yes | Browser first; Chrome/Computer N/A. |
| Console/network caveat policy recorded | yes | Record Browser console errors; unrelated network failures stay out of scope. |
| Observable browser case captured | yes | Load the block, confirm toolbar render, open and close the Text menu, and separate provider behavior from unrelated checkout console failures; report-backed exact replay is N/A. |

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
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no recording.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the provider ownership boundary: eight physical
      authors live only in `bases/{base,radix}` and install to four flat targets.
- [x] Release artifact requirement closed: regenerated the Base public payload,
      Radix overlay, and Base-first registry changelog event.
- [x] Final handoff shape decided: concise architecture-cleanup handoff with
      source count, tests, registry build, browser proof, and residual risk;
      PR/tracker sync is N/A.
- [x] Branch handling recorded: N/A because no commit/PR was requested and
      proactive branch inspection is forbidden.
- [x] Local-env-rot retry policy recorded: use `pnpm run reinstall` once only
      for matching module/React install-corruption signals.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded: registry command-contract risk is a wrong source
      or target for one provider; both provider rows and generated payloads
      must prove the chosen boundary.
- [x] Review/P1 autoreview decision resolved: the user explicitly waived
      autoreview on 2026-08-25; no review result is claimed.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: edited `.agents/rules/plate-ui.mdc`, not its generated mirror.
- [x] Agent-native pack: the rule names provider-neutral `components/editor`
      and provider-specific `bases/*` directly.
- [x] Agent-native pack: `pnpm install` regenerated the `plate-ui` skill mirror;
      exact body diff is empty.
- [x] Agent-native pack: manual capability-map review found source ownership,
      route, discoverability, and proof complete; no actionable finding remains.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is N/A because no native surface
      is involved.
- [x] Browser pack: console checked. The existing Next prerender warning and
      concurrent Selection API lifecycle error are outside provider ownership;
      no provider-resolution or popup error was observed on open/Escape close.
- [x] Browser pack: screenshot is N/A because Browser DOM inspection directly
      proves the toolbar and popup contract; this is not a paint defect.
- [x] Browser pack: report-backed proof is N/A; this is a behavior-neutral local
      source-topology cleanup with no reported failure.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends.
      Exact pushed-ref fingerprints are N/A for this uncommitted local task.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      N/A: this is an uncommitted local architecture cleanup, so no shipped or
      exact-ref certification is claimed.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      N/A: no native browser or lifecycle behavior is claimed.
- [x] Browser pack: no temporary stub, handwritten proxy, generated-file edit,
      route bypass, or unshipped scaffolding is counted as behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Done | Eight provider authors, four flat targets, two providers, zero nested editor directories, and zero physical provider owners in `components/editor`. |
| Bug reproduced before fix | no | N/A | This is a source-ownership cleanup; the changelog inference defect separately had a failing test before repair. |
| Targeted behavior verification | yes | Done | Registry tests, response tests, provider type/browser bundles, and Browser popup interaction pass. |
| TypeScript or typed config changed | yes | Done with boundary | Registry source closure and both provider type/bundle checks pass; full `www` compilation reaches unrelated Selection API errors in `app/api/ai/command/utils.ts`. |
| Package exports or file layout changed | no | N/A | Only app registry source layout changed; no exported package folder or barrel changed, so `pnpm brl` does not apply. |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest or dependency graph edit; `pnpm install` ran only to regenerate agent mirrors. |
| Agent rules or skills changed | yes | Done | `pnpm install` regenerated `plate-ui`; source and mirror bodies have an empty diff. |
| Workspace authority proof | yes | Done | Commands ran from the repository root, `apps/www` for its cwd-sensitive response test, and the live standalone demo route. |
| Browser surface changed | yes | Done | Browser rendered `/blocks/basic-nodes-demo` and exercised the local Radix toolbar popup. |
| Browser final proof | yes | Done with caveat | Fresh tab: Text expands, one menu exposes 15 radio items, Escape closes it; unrelated Next/Selection checkout diagnostics are recorded. |
| CI-controlled template output changed | no | N/A | No template source or generated template output was touched. |
| Package behavior or public API changed | no | N/A | Installed target and component contract remain flat and unchanged; no package changeset applies. |
| Registry-only component work changed | yes | Done | Existing `2026-08-25-base-first-registry` source event was regenerated and names all eight provider authors. |
| Docs or content changed | yes | Done | Agent rule and plan claims are source-backed; rule mirror and discoverability audits pass. |
| High-risk mini gate | yes | Done | Failure mode was wrong provider source/dependency with a valid flat target; symmetric manifest tests, closure checks, payload audit, and browser interaction cover it. |
| Agent-native review for agent/tooling changes | yes | Done | `agent-native-reviewer` capability map found source ownership, routing, discoverability, mirror sync, and proof complete. |
| Local install corruption suspected | no | N/A | No module, mixed-React, or install-corruption signal occurred. |
| P1 autoreview for non-trivial implementation changes | no | User waiver | The user explicitly said `autoreview not needed`; no autoreview result is claimed. |
| PR create or update | no | N/A | No commit, push, or PR was requested. |
| Task-style PR body verified | no | N/A | No PR exists for this local task. |
| PR proof image hosting | no | N/A | No PR or hosted image is required. |
| Tracker sync-back | no | N/A | No issue or Linear task was supplied. |
| Final handoff contract | yes | Done | Outcome, design, exact proofs, browser caveats, and uncommitted status are recorded below. |
| Final lint | yes | Done | Scoped Ultracite formatting and lint pass on 18 changed source/tooling files. |
| Output budget discipline | yes | Done with recovery | One broad generated-output search was capped afterward; all later reads used exact paths and bounded output. |
| Timed checkpoint | no | N/A | No duration was requested. |
| Goal plan complete | yes | Done | `check-complete.mjs` reports `[autogoal] complete` for this plan. |
| Agent source / generated sync | yes | Done | `pnpm install` completed and exact source/mirror body diff is empty. |
| Agent action discoverability | yes | Done | Both source and generated skill explicitly name provider-neutral `components/editor` and provider-specific `bases/*`. |
| Agent-native review | yes | Done | Manual capability-map review passed with no accepted finding. |
| Browser interaction proof | yes | Done | Fresh Browser tab shows the toolbar; Text opens one 15-item menu and Escape removes it. |
| Browser console/network check | yes | Done with caveat | Console has an existing Next uncached-prerender warning; trigger re-click also exposes the concurrent Selection API lifecycle failure. No task-specific network request exists. |
| Browser final proof artifact | yes | Done | Browser DOM counts and console output are recorded in Verification evidence; paint screenshot is N/A. |
| Exact case replay | no | N/A | No report-backed behavior case exists. |
| Final ref and fingerprints | no | N/A | Work is local and uncommitted; no pushed-ref or shipped-runtime claim is made. |
| Clean final runtime | no | N/A | Work is local and uncommitted; exact-ref release certification is outside this task. |
| Retry-free stability | no | N/A | No native selection, paint, DnD, compositor, or lifecycle repair is claimed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Accepted topology and owners captured before edits. | complete |
| Implementation | complete | Eight authors moved; resolver, aliases, tests, rule, and changelog generator repaired. | complete |
| Verification | complete | Focused tests, registry build, closure check, lint, topology audit, agent audit, and Browser proof recorded. | complete |
| PR / tracker sync | not_applicable | No commit, PR, or tracker mutation was requested. | final response |
| Closeout | complete | Handoff and external shared-checkout caveats recorded. | final response |

Findings:
- Forty-four provider-neutral editor files contain 51 relative imports of the
  four provider owners, so deleting the flat authors requires an explicit
  compile-time default view.
- Shadcn's import transformer already rewrites
  `@/registry/components/editor/*` to the consumer's configured components
  alias.
- `apps/www` is a Radix shadcn app. Its four exact canonical registry module
  aliases must resolve to Radix authors even though Base remains the public
  registry default.
- Base menu authors can type against the installed `@base-ui/react` primitive
  props while importing the matching shadcn UI wrapper. This proves their
  provider-only props without adding local Base UI copies or a network fixture.
- Base context-menu and dropdown-menu import Base primitive types directly, so
  their Base variants must declare `@base-ui/react` as a direct dependency.
- Targeted provider files need provider inference in the changelog generator;
  source path alone cannot enumerate the sibling Base and Radix authors.

Decisions and tradeoffs:
- Keep author sources only in `bases/{base,radix}` and retain flat installed
  targets. Provider-neutral authors import the canonical registry module names;
  four exact local tsconfig paths select Radix for `www`. This avoids proxy
  files, wildcard override behavior, runtime switching, and install-time
  custom transforms.
- Keep Base as the public resolver default. The local app's provider and the
  public default are separate compile-time choices.

Implementation notes:
- Moved all eight provider authors directly into `bases/{base,radix}` and
  removed every nested provider `editor` directory.
- Re-keyed the variant manifest by flat install target and made Base/Radix
  source resolution symmetric.
- Replaced 51 relative provider imports in 44 neutral editor authors with the
  canonical flat registry module names.
- Fixed the two neutral floating-popover consumers that still used Radix's
  `onOpenAutoFocus` name; the common provider contract is `onInitialFocus`.
- Updated the Plate UI source rule and regenerated its skill mirror with
  `pnpm install`.
- Added direct Base dependencies for the two menu adapters so copied-file
  install closure passes.
- Repaired changelog provider inference for targeted variant files and
  regenerated the Base-first event with all eight provider authors.

Review fixes:
- Agent-native manual review tightened the Plate UI repo-surface rule from
  Base-only wording to provider-neutral `components/editor` and
  provider-specific `bases/*`.
- P1 autoreview is not claimed; the user explicitly waived it.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad generated-registry alias search streamed oversized output | 1 | Restrict follow-up reads to exact source files and upstream transformer code | Recovered; no further broad generated-output reads before regeneration. |
| Registry response test ran from the repository root | 1 | Run cwd-sensitive public payload tests from `apps/www` | Passed: 6 tests, 414 assertions. |
| `www` TypeScript checked Base authors against local Radix shadcn UI types | 1 | Point local canonical aliases to Radix and type Base adapters against Base UI primitive props | Provider files and consumers pass; only three unrelated Selection API errors remain. |
| Registry install closure rejected direct Base type imports without declared packages | 1 | Declare `@base-ui/react` on the two Base menu variants and regenerate | Registry source closure passes. |
| Full `www` TypeScript proof hit concurrent Selection API errors in `src/registry/app/api/ai/command/utils.ts` | 2 | Keep the failure boundary exact and rerun after final source stabilization | Open external blocker; no provider-layout diagnostic remains. |
| Re-clicking the open Text trigger logged a concurrent editor lifecycle error | 1 | Isolate popup behavior with open plus Escape close and inspect the server stack | Popup passes; stack ends in the concurrent Selection API focus path, outside provider ownership. |

Verification evidence:
- `bun test apps/www/src/registry/registry.test.ts`: 11 pass, 371 assertions;
  combined registry/toolbar run: 16 pass, 393 assertions.
- `pnpm --filter www check:toolbar-variants`: Base and Radix typecheck and browser bundle.
- `pnpm --filter www build:registry`: Base public registry and Radix overlay generated successfully.
- `bun test src/lib/registry-response.test.ts` from `apps/www`: 6 pass, 414 assertions.
- `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`: 19 pass;
  its new provider-inference row failed Base-only before the repair and passes
  with Base plus Radix after it.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`: 81 source
  events and generated events match.
- Generated item audit: all four Base and four Radix payloads retain the same
  flat `@components/editor/*` targets, resolve from their provider directory,
  and carry provider-specific direct dependencies.
- Source audit: 8 provider files, providers exactly `base radix`, 0 nested
  `editor` directories, and 0 physical provider owners in `components/editor`.
- Scoped Ultracite check: 18 changed registry/tooling files pass formatting and lint.
- `pnpm --filter www typecheck`: editor contract generation, API reference,
  docs parity, registry source closure, and Next route types pass; final TSC is
  blocked only by three concurrent Selection API errors in
  `src/registry/app/api/ai/command/utils.ts`.
- `pnpm install` succeeds; `plate-ui.mdc` and generated `plate-ui/SKILL.md`
  bodies are identical and both expose the new topology.
- Fresh Browser tab at `/blocks/basic-nodes-demo`: toolbar visible, Text trigger
  count 1, `aria-expanded=true`, one menu with 15 radio items, and Escape closes
  it to count 0. Console caveats are the existing Next uncached-prerender
  warning and a concurrent Selection API lifecycle error on trigger re-click;
  neither stack enters provider resolution or the moved provider authors.

Final handoff contract:
- PR line: N/A: local uncommitted work; no commit, push, or PR requested.
- Issue / tracker line: N/A: no external tracker supplied.
- Confidence line: High for the provider topology and generated install graph;
  no whole-checkout green claim because concurrent Selection work is red.
- Flow table:
  - Reproduced: changelog provider inference was Base-only before repair.
  - Verified: registry/response/generator tests, both provider bundles,
    registry generation, payload/topology audit, lint, agent mirror, and Browser.
- Browser check: local Radix toolbar opens one 15-item Text menu and Escape
  closes it on a fresh tab.
- Outcome: provider-neutral editor authors stay in `components/editor`; all
  primitive-specific authors live directly in `bases/{base,radix}` and install
  to the same four flat targets. Base is public default; Radix is explicit/local.
- Caveat: whole-`www` TSC and a focus lifecycle path are red in concurrent
  Selection API work; the standalone route also has an existing Next prerender
  warning. No provider-layout failure remains.
- Design:
  - Chosen boundary: provider-specific physical authors under `bases/*`, one
    provider-neutral flat import/target contract, compile-time provider choice.
  - Why not quick patch: proxy files or Radix fallback would preserve duplicate
    ownership and hide missing variants.
  - Why not broader change: runtime provider switching, Aria, and preset-named
    directories add machinery without a supported current job.
- Verified: exact evidence is listed above; autoreview was explicitly waived.
- PR body verified: N/A: no PR exists.

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
- PR: N/A: uncommitted local checkout.
- Issue / tracker: N/A: none supplied.
- Browser proof: fresh standalone demo tab; toolbar/Text popup open and Escape
  close pass with exact DOM counts above.
- Caveats: unrelated Selection API TSC/lifecycle failures and existing Next
  prerender warning prevent a whole-checkout clean claim.

Timeline:
- 2026-08-25T10:02:45.281Z Task goal plan created.
- 2026-08-25T10:29Z Final registry build and source-closure proof passed.
- 2026-08-25T10:36Z Agent mirror and fresh Browser interaction proof completed.
- 2026-08-25T10:42Z Closeout evidence and user autoreview waiver recorded.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | Final user handoff. |
| What is the goal? | Eight flat provider authors with Base default and Radix local/overlay selection |
| What have I learned? | Local app provider selection is independent from the public registry default |
| What have I done? | Implemented the layout, resolver, aliases, focus contract, dependency closure, changelog repair, generated output, agent teaching, and focused/browser proof. |

Open risks:
- Full `www` typecheck is red on three concurrent Selection API errors outside
  this task's ownership; the same work can log a commit-listener lifecycle error
  when the Text trigger restores editor focus.
- The standalone block route emits an existing Next uncached-prerender warning.
- Provider topology, install closure, generated payloads, and menu open/Escape
  behavior have no known residual task-owned risk.
