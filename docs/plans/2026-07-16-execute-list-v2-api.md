# execute list v2 api

Objective:
Execute the accepted List v2 API plan end-to-end; done when phases 1-10 and all
owner, docs, Browser, release, and review gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-16-execute-list-v2-api.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: accepted local Plate Plan
- id / link: `docs/plans/2026-07-12-list-v2-api.md`
- title: List v2 API execution
- acceptance criteria: execute accepted phases 1-10 uninterrupted; Core typed
  plugin dependency graph; List scoped API/runtime/normalization; direct owners
  and explicit exports; AI/registry/docs adoption; Core/List major changesets;
  focused and broad package proof; `/docs/list` and `/blocks/list-demo` Browser
  proof; final autoreview; no compatibility alias or public bridge.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; none requested.
- semantics: uninterrupted until final verified handoff or a real blocker.
- initial confidence score: N/A; accepted plan uses binary execution gates.
- improvement loop: phases 1-10 in order with vertical red-green slices.
- final score / loop closure: N/A; closure is binary.

Completion threshold:
- All ten accepted phases are implemented; old public surfaces and aggregate
  List package imports are absent; Core/List/AI/Indent/www/docs/registry owner
  checks pass; List fast/slow, history/replay/perf and Core graph/type laws pass;
  barrels and release artifacts are correct; Browser routes and autoreview are
  clean; no required proof or accepted finding remains.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-16-execute-list-v2-api.md` passes.

Verification surface:
- Vertical public type/runtime tests in Core and List; focused package tests;
  source-first typechecks for Core/List/Indent/AI/www; List build and `pnpm brl`;
  registry changelog generator; docs source/check; direct-import/export/old-name
  audits; `pnpm check:core`; Browser interactions on `/docs/list` and
  `/blocks/list-demo`; final local autoreview and `check-complete`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: accepted plan, current checkout, root `VISION.md`,
  `docs/vision/plate.md`, package tests/docs/registry owners, and root
  `AGENTS.md` commands.
- Allowed edit scope: accepted phase owners in `packages/core`, `packages/list`,
  `packages/ai`, direct List callers including registry/docs, package tests,
  barrels, changelog source/generated JSON, and Core/List changesets; this
  execution ledger. No Plite or Yjs source changes.
- Browser surface: `/docs/list` and `/blocks/list-demo`.
- Browser strategy: Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; local accepted plan without issue/Linear owner.
- Non-goals: Markdown rule typing, broad repo-wide direct-owner import cleanup,
  Legacy list model redesign, Plite/Yjs protocol changes, compatibility aliases,
  helper relocation for barrel convenience, PR/commit/push.

Output budget strategy:
- Read exact owners and focused `rg` filename/count results first; cap command
  output; exclude generated/build/dependency trees; use existing accepted-plan
  artifacts instead of replaying their 154 rows into context.

Blocked condition:
- Stop only after the same external/tooling blocker recurs enough to satisfy the
  goal contract and no smaller source/test/browser path remains. Code/test
  failures with an identifiable owner are work, not blockers.

Task state:
- task_type: accepted public API/runtime migration execution
- task_complexity: major, ten vertical phases
- current_phase: phase 10 verified closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: complete

Current verdict:
- verdict: phases 1-10 are implemented and verified.
- confidence: high; owner tests, typechecks, builds, export audits, Browser proof,
  release checks, `check:core`, and autoreview are clean.
- next owner: final user handoff.
- reason: no required proof or accepted review finding remains.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-16-execute-list-v2-api.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Accepted phases 1-10, uninterrupted constraint, stop rule, deliverables, proof, and handoff copied above |
| Timed checkpoint parsed | no | No duration; uninterrupted means outcome-bound, not time-bound |
| Skill analysis before edits | yes | Plate Plan, autogoal, TDD, React, docs-creator, changeset selected; registry-changelog/performance/autoreview load at their owner phase |
| Active goal checked or created | yes | New one-shot execution goal names this ledger and accepted plan outcome |
| Source of truth read before edits | yes | Accepted plan, root VISION, Plate vision, root AGENTS, live source next |
| Tracker comments and attachments read | no | N/A: no external tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | Accepted source-backed Plate Plan is the implementation oracle; docs/solutions cannot override it |
| TDD decision before behavior change or bug fix | yes | Vertical tracer bullets required for phases 1-7; TDD skill loaded |
| Branch decision for code-changing task | no | N/A: user authorized current-checkout execution, no branch/PR request |
| Release artifact decision | yes | Major Core and List changesets plus registry changelog; no AI changeset |
| Browser tool decision for browser surface | yes | Browser for both normal app routes; no native Chrome/OS behavior |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: local plan only |
| Output budget strategy recorded | yes | Exact owners, focused counts, capped outputs, existing artifacts reused |
| Docs pack selected | yes | Incidental plugin-page and guide adoption in phase 9 |
| `docs-creator` loaded | yes | Loaded before docs edits; full owner guidance reread before phase 9 |
| Docs lane selected | yes | Plugin/feature List pages plus Guide/System Plugin Rules passage |
| Target docs and nearest sibling docs read | yes | Accepted plan identifies canonical EN/CN List and Plugin Rules; live reads occur before edits |
| Docs style doctrine read | yes | Docs-creator selected; current-state reference voice required |
| Documented source owner identified | yes | `@platejs/list` public plugin/API plus Core dependency graph |
| Browser pack selected | yes | Required by visible list editing behavior |
| Browser route / app surface identified | yes | `/docs/list`, `/blocks/list-demo` |
| Browser tool decision recorded | yes | In-app Browser; Chrome/Computer N/A |
| Console/network caveat policy recorded | yes | Closure requires zero relevant console errors; network failures reported exactly |
| Package/API pack selected | yes | Core and List public API/package boundaries change |
| Public surface or package boundary identified | yes | Core plugin dependencies and List scoped read/update/export surface |
| Release artifact path selected | yes | Separate major `.changeset` files for Core/List; registry source changelog for copied toolbar |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded; main-relative, one package per file, imperative user impact |
| Barrel/export impact decision recorded | yes | List root/react allowlists change; run `pnpm brl` and retain generated exports only when intended |

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
- [x] Required video or screen-recording evidence is N/A: none supplied.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the Core dependency owner before the List product API.
- [x] Release artifact requirement recorded: Core/List major changesets and registry changelog.
- [x] Final handoff shape decided: feature/API migration with exact tests,
      Browser proof, outcome, caveats, architecture, and verification; PR/tracker N/A.
- [x] Branch handling N/A: current-checkout execution explicitly authorized; no branch action.
- [x] Local-env-rot retry policy: run `pnpm run reinstall` once only for the named corruption signatures, then rerun exact failure.
- [x] Workspace authority: every command runs at `/Users/zbeyens/git/plate-2` or owning package filter; Browser owns route proof.
- [x] High-risk note: duplicate factory execution, override ordering, type recursion, selection/history/replay, bounded normalization, export/docs drift; accepted plan defines proof and hard-cut rollback.
- [x] Review/autoreview target: final dirty local implementation diff with accepted findings repaired and owner gates rerun.
- [x] Agent-native review N/A: no agent rules/tooling in implementation scope.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: List EN/CN plugin pages and Plugin guide target the public
      `@platejs/list` and Core dependency owners; sibling docs were checked.
- [x] Docs pack: named APIs, types, options, imports, demos, and previews were
      audited against current source and the public export matrix.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: `/docs/list` and its preview render; no stale link or preview
      target remains in the changed docs.
- [x] Browser pack: `/blocks/list-demo` interactions and `/docs/list` rendered
      API/preview outcomes were recorded before final proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it. N/A here:
      no native browser or OS behavior.
- [x] Browser pack: fresh final tabs had zero relevant console warnings/errors;
      both routes returned 200.
- [x] Browser pack: route/DOM/interaction proof was sufficient; no screenshot was
      needed for this behavior and API migration.
- [x] Package/API pack: Core plugin dependencies and List scoped APIs, exports,
      consumers, and release impact are recorded below.
- [x] Package/API pack: Core/List published API changes have major changesets;
      registry toolbar work has a generated registry changelog event.
- [x] Package/API pack: `changeset` rules were applied; duplicate package entries
      were consolidated and focused release-contract tests pass.
- [x] Package/API pack: registry work uses the registry changelog source and
      generated JSON, with no registry-only package changeset.
- [x] Package/API pack: AI adoption needs no separate artifact because it only
      consumes the Core dependency API already covered by Core's changeset.
- [x] Package/API pack: hard cut is explicit: no compatibility aliases, public
      bridges, aggregate `platejs` imports, or removed List names remain.
- [x] Package/API pack: Core/List/AI/www typecheck, build, test, and integration
      proof is recorded below.
- [x] Package/API pack: `pnpm brl` and the public export matrix pass.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named proof matrix | All commands and Browser rows below pass |
| Bug reproduced before fix | yes | Record failing tracer/repro | Core inference/runtime tracers, List batching regression, and docs route failure drove owner fixes |
| Targeted behavior verification | yes | Run focused proof | Core 734, List 96 fast + 38 slow, integration 37 pass |
| TypeScript or typed config changed | yes | Run relevant typechecks | Core/List/AI/www typechecks pass; `check:core` passes |
| Package exports or file layout changed | yes | Run `pnpm brl` | `pnpm --filter @platejs/list brl` and export matrix pass |
| Package manifests, lockfile, or install graph changed | yes | Install and package checks | `pnpm install` completed; package checks pass |
| Agent rules or skills changed | no | N/A | No agent source changed |
| Workspace authority proof | yes | Run in owner workspace | All shell proof ran in `/Users/zbeyens/git/plate-2`; Browser owned route proof |
| Browser surface changed | yes | Capture Browser proof | `/blocks/list-demo` and `/docs/list` pass |
| Browser final proof | yes | Record final route/interaction state | Both routes 200 with clean final console and interaction matrix below |
| CI-controlled template output changed | no | N/A | No `templates/**` output changed |
| Package behavior or public API changed | yes | Add changesets | Core and List major changesets present and release-contract tests pass |
| Registry-only component work changed | yes | Add registry event | List toolbar registry changelog source/generated event passes generator check |
| Docs or content changed | yes | Source and rendered proof | MDX source build, www typecheck, and `/docs/list` Browser proof pass |
| High-risk mini gate | yes | Prove graph/order/types/history/perf | Accepted owner boundary and full proof matrix pass |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling change |
| Local install corruption suspected | yes | Reinstall once and rerun | `pnpm run reinstall`, explicit `pnpm install`, owner builds, and exact checks recovered env rot |
| Autoreview for non-trivial implementation changes | yes | Local autoreview until clean | Clean, zero findings, confidence 0.75 |
| PR create or update | no | N/A | User did not request PR/commit/push |
| Task-style PR body verified | no | N/A | No PR exists or was requested |
| PR proof image hosting | no | N/A | No PR body |
| Tracker sync-back | no | N/A | Local accepted plan has no tracker |
| Final handoff contract | yes | Fill fields below | Complete below; final response prepared |
| Final lint | yes | Run `pnpm lint:fix` | Pass, no fixes |
| Output budget discipline | yes | Keep broad output bounded | Focused/capped output used; one broad check output was truncated without affecting proof |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run `check-complete.mjs` | Final checker runs after this ledger update |
| Docs source-backed claim audit | yes | Audit current owners | Current API/import/options/hooks match source and export matrix |
| Docs links / routes / previews | yes | Verify rendered leaf route | `/docs/list` 200; preview and current API render |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` | Pass |
| Plugin page specifics | yes | Apply docs-creator rules | EN/CN List pages use current-state kit/manual/API structure |
| Browser interaction proof | yes | Exercise target route | Toggle, focus, indent/outdent, task-list split/exit, restart, undo/redo pass |
| Browser console/network check | yes | Check final tabs | Zero relevant warning/error; both routes 200 |
| Browser final proof artifact | yes | Record route/DOM behavior | Route and DOM interaction evidence recorded below; screenshot N/A |
| Public API / package boundary proof | yes | Audit exports and consumers | Direct import/export/old-name audits pass; aggregate `platejs` imports zero |
| Release artifact classification | yes | Classify deltas | Core/List published major; registry event; AI consumption covered by Core |
| Published package changeset | yes | Add valid changesets | Core/List major changesets; duplicate-entry check repaired and passes |
| Registry changelog | yes | Generate/check event | 24-event generator check passes |
| No release artifact | yes | Record N/A owners | AI has no independent published delta beyond Core dependency adoption |
| Package typecheck/build/test | yes | Run owner checks | Core/List/AI/www owner proof passes |
| Barrel/export generation | yes | Run List barrel generation | Pass; runtime public import matrix passes |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | accepted plan, VISION, owners, skills read | implementation complete |
| Implementation | complete | phases 1-10 landed in current checkout | verification complete |
| Verification | complete | package, integration, release, Browser, and review gates pass | closeout complete |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | complete | ledger and handoff complete | final response |

Findings:
- Core needed recursive plugin-object dependency inference and runtime installation;
  List caller casts and `.editor` escapes were symptoms, not the owner fix.
- List normalization remains linear only when ambiguous ordered markers are
  resolved in the forward batch planner.
- The docs route failure came from dot-directory alias normalization in
  `apps/www/next.config.ts`, not List runtime behavior.

Decisions and tradeoffs:
- Hard-cut old List free wrappers and wildcard exports; no compatibility aliases.
- Keep dependency portal APIs own-only while recursively aggregating dependency
  API/state/transactions on the root editor.
- Keep AI as a consumer of Core's dependency contract, with no duplicate release artifact.

Implementation notes:
- Core recursively infers, installs, orders, deduplicates, overrides, disables,
  and cycle-checks plugin-object dependencies.
- List exposes scoped read/update APIs, direct owner imports, explicit barrels,
  bounded normalization, history/replay-safe transforms, and typed targets.
- AI, registry toolbar, docs, changelog, and route aliases adopt the final API.

Review fixes:
- Final local autoreview returned zero accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Stale/corrupt local dependency output | 1 | Run the mandated reinstall once, then explicit install and owner builds | Recovered; exact checks pass |
| `/docs/list` dot-directory alias resolved as a package | 1 | Normalize non-parent aliases with `./` | Route returns 200 and renders cleanly |
| Duplicate package changeset entries | 1 | Consolidate prose into one changeset per package | Release-contract and `check:core` pass |

Verification evidence:
- Core: 734 tests pass; typecheck/build pass.
- List: 96 fast tests and 38 slow/stress tests pass; build, typecheck, `brl`,
  public runtime import matrix, old-name audit, and aggregate-import audit pass.
- Integration: seven DOCX fixtures plus AI/Markdown suites pass, 37 tests across
  11 files.
- App/docs: www typecheck, docs check, `pnpm --filter www build:source`, and the
  24-event registry changelog generator check pass.
- Broad: `pnpm check:core` and final `pnpm lint:fix` pass.
- Browser `/blocks/list-demo`: bullet/numbered pressed state, contenteditable
  focus retention, indent/outdent, task-list toggle/split/empty-exit, ordered restart,
  and undo/redo pass.
- Browser `/docs/list`: route 200, preview and current APIs/types/hooks render,
  removed APIs are absent. Both final fresh tabs have zero relevant console
  warning/error.
- Autoreview: `.agents/skills/autoreview/scripts/autoreview --mode local
  --stream-engine-output` returned `findings: []`, `patch is correct`, confidence
  0.75.

Final handoff contract:
- PR line: N/A; no PR requested or created.
- Issue / tracker line: N/A; accepted local plan has no tracker.
- Confidence line: high; every named owner, Browser, release, and review gate passes.
- Flow table:
  - Reproduced: red Core type/runtime tracers, List batch regression, and docs route failure.
  - Verified: Core 734; List 96 + 38; integration 37; Browser matrix clean.
- Browser check: `/blocks/list-demo` and `/docs/list` pass with clean final console.
- Outcome: accepted phases 1-10 complete; scoped List v2 API and typed recursive
  plugin dependencies are the only supported shape.
- Caveat: no commit, push, or PR was requested or created.
- Design:
  - Chosen boundary: Core owns recursive dependency truth; List owns scoped
    product APIs and normalization; callers use direct owners.
  - Why not quick patch: casts, `.editor` escapes, and local wrappers would preserve
    false root types and runtime drift.
  - Why not broader change: Plite/Yjs, Legacy list model, and unrelated package cleanup
    are outside the accepted plan and unnecessary for closure.
- Verified: all named package, integration, release, Browser, lint, and review gates pass.
- PR body verified: N/A; no PR exists.

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
- Issue / tracker: N/A; local plan only.
- Browser proof: `/blocks/list-demo` and `/docs/list`, interactions and clean console verified.
- Caveats: no commit/push/PR; no unresolved implementation or proof caveat.

Timeline:
- 2026-07-16T12:15:19.309Z Task goal plan created.
- 2026-07-16 Core recursive typed dependency graph and runtime laws completed.
- 2026-07-16 List scoped API, normalization, direct-owner exports, and adopters completed.
- 2026-07-16 package, integration, docs, release, Browser, and autoreview gates passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Verified closeout complete |
| Where am I going? | Final user handoff |
| What is the goal? | Complete phases 1-10 of the accepted List v2 API plan |
| What have I learned? | Core dependency truth removes downstream List escape hatches |
| What have I done? | Implemented and verified every accepted phase; see evidence and timeline |

Open risks:
- None within the accepted scope.
