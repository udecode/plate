# unified extend list hard cut

Objective:
Prove unified `.extend()` in `packages/list/src/lib/BaseListPlugin.tsx` only; done when its four specialized usages are gone with no type, declaration, runtime, or browser regression.

Goal plan:
docs/plans/2026-07-24-unified-extend-list-hard-cut.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user correction in the active API-design task
- id / link: N/A
- title: unified extend packages/list canary
- acceptance criteria:
  - `packages/list/src/lib/BaseListPlugin.tsx` uses repeated `.extend()` for
    plugin API, update, and editor-extension stages.
  - Remove only the two `.extendApi`, one `.extendTx`, and one named
    `.extendExtension` usages in that file.
  - Keep every specialized Core builder and every usage outside that file.
  - Stop and retain the specialized builders if unified `.extend()` cannot
    preserve current inferred editor/plugin/transaction contracts without
    casts, `any`, callback parameter annotations, `satisfies`, or ferry types.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A; no timed request
- initial confidence score: N/A; exact binary source/type/runtime gates exist
- improvement loop: migrate capability families, typecheck, repair owner
  generic, then delete surface and prove zero matches
- final score / loop closure: N/A; close only on exact gates

Completion threshold:
- Zero `.extendApi`, `.extendTx`, or `.extendExtension` builder usages remain
  in `packages/list/src/lib/BaseListPlugin.tsx`.
- No file outside that owner changes for this canary except this plan.
- `@platejs/list` source-first typecheck, package tests, declaration build,
  scoped lint, Browser proof, autoreview, and goal checker pass or any
  pre-existing/shared failure is exact old/new A/B classified.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-unified-extend-list-hard-cut.md` passes.

Verification surface:
- Scoped `rg` audit for the four removed usages in the one file.
- `@platejs/list` source-first typecheck, tests, and declaration build.
- Browser `/blocks/playground-demo` render plus console/HTTP inspection;
  package tests own list-mutation behavior because this canary changes only
  authoring spelling.
- Scoped Biome, final autoreview, and goal checker.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- No compatibility aliases, deprecated builders, forwarding wrappers, casts,
  `any`, explicit callback parameter annotations, `satisfies` patches, or
  helper/config types created only to ferry inference.
- Preserve shared WIP, every Core builder, every outside usage, and existing
  codec-specific builders.

Boundaries:
- Source of truth: the full 1,741-line list owner and already-proven unified
  Core builder contract.
- Allowed edit scope: only
  `packages/list/src/lib/BaseListPlugin.tsx` and this plan.
- Browser surface: `/blocks/playground-demo` using `ListKit`.
- Browser strategy: Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; direct local request.
- Non-goals: Core API deletion, any other package/caller migration, skill/rule
  edits, codec builder consolidation, git/PR actions, and unrelated repairs.

Output budget strategy:
- Read the one complete owner and use scoped searches/tests only. Exclude
  unrelated packages, generated output, and shared diffs.

Blocked condition:
- Stop and restore the four usages if the package type/declaration contract
  regresses and cannot be repaired in the existing unified Core generic without
  a workaround; do not begin a hard cut.

Task state:
- task_type: one-file inference canary
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A
- goal_status: complete

Current verdict:
- verdict: one-file canary passed; retain every specialized builder elsewhere
- confidence: high; package types, declarations, build, 51 tests, browser
  render, and scoped autoreview are green
- next owner: `best-api` design, then `plate-plan` only after user acceptance
- reason: the user explicitly forbids a hard cut from this canary

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-unified-extend-list-hard-cut.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Newest correction narrows work to four usages in one file, forbids hard cut, and retains the stop-on-type-regression rule |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Loaded autogoal, hard-cut, plate-plugin-creator plus its three required rules, and changeset |
| Active goal checked or created | yes | Goal `019f89e5-1b47-7f02-b27b-293bbd49566d` created for this exact plan |
| Source of truth read before edits | yes | Read full 1,741-line list owner plus Core unified/specialized types and runtime owners |
| Tracker comments and attachments read | no | N/A: direct local request |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read Core type-test build/export solution; migration must update its stale specialized-builder example |
| TDD decision before behavior change or bug fix | yes | No behavior change; existing list tests/type/declaration are preservation gates |
| Branch decision for code-changing task | no | N/A: no git/PR action requested |
| Release artifact decision | no | N/A: internal authoring-call migration with no package consumer delta |
| Browser tool decision for browser surface | yes | Browser plugin on `/blocks/playground-demo`; no native Chrome surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Count/list-first AST audit and bounded failed-owner reads recorded above |
| Package/API pack selected | yes | Package declaration inference is the risk even though public Core surface stays unchanged |
| Public surface or package boundary identified | yes | `@platejs/list` emitted plugin/editor contracts must remain identical |
| Release artifact path selected | no | N/A: no published delta from main |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset |
| Barrel/export impact decision recorded | yes | No file/export topology expected; run `pnpm brl` only if final diff changes generated exports |
| Browser pack selected | yes | Package source changes require browser proof |
| Browser route / app surface identified | yes | `/blocks/playground-demo`, registry `ListKit` |
| Browser tool decision recorded | yes | In-app Browser |
| Console/network caveat policy recorded | yes | Record every error and A/B any failure that overlaps known shared list/schema baseline |

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
      is recorded with reason. Four calls changed only in the named list owner;
      no Core or outside caller changed.
- [x] Release artifact requirement recorded: N/A, no published delta.
- [x] Final handoff shape decided: hard-cut outcome, exact source audit,
      type/runtime/declaration/browser proof, baseline caveats, no PR/tracker.
      Bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: N/A, no git action.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command runs in
      `/Users/zbeyens/git/plate-2` or its package/browser owner.
      Every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded: staged API/update/extension declaration
      inference can regress even when runtime behavior is unchanged.
      Public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected: dirty local current checkout, accept
      only current-line findings for Core builders and migrated callers.
- [x] Agent-native review decision recorded: N/A, no agent source may change.
      `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: `@platejs/list` declaration-inference impact recorded; Core API remains unchanged.
- [x] Package/API pack: release artifact matrix selects N/A because final public behavior/types remain unchanged.
- [x] Package/API pack: changeset work is N/A.
- [x] Package/API pack: registry-only rule is N/A; this changes package source.
- [x] Package/API pack: no artifact because consumer-facing editor/plugin behavior and types remain unchanged.
- [x] Package/API pack: hard cut is explicitly forbidden in this canary.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded:
      typecheck and build pass; 51/51 focused tests pass.
- [x] Package/API pack: generated barrels or release notes are N/A because no
      files, exports, or public package contract changed.
- [x] Browser pack: `/blocks/playground-demo` renders the Plate playground and
      list docs link; HTTP 200 and zero console errors. Package tests own the
      unchanged mutation behavior.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it. N/A beyond
      Browser: no native browser/OS surface.
- [x] Browser pack: console and network errors are checked: zero console errors
      and HTTP 200.
- [x] Browser pack: screenshot is N/A because no visual output changed; DOM
      render and console/HTTP evidence cover the package-facing route.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run all named one-file gates | Zero specialized matches; typecheck/build/tests/browser/review green |
| Bug reproduced before fix | no | N/A: behavior-neutral authoring canary | Existing contracts are preservation oracles |
| Targeted behavior verification | yes | Run focused package tests | 51 pass, 0 fail, 105 assertions |
| TypeScript or typed config changed | yes | Run relevant typecheck and inspect declaration emit | `@platejs/list` typecheck/build pass; emitted API/read/update names remain typed with no emitted `any` |
| Package exports or file layout changed | no | N/A | No topology or export change |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest or lockfile change |
| Agent rules or skills changed | no | N/A | No agent source change |
| Workspace authority proof | yes | Run proof in owning checkout | All commands and Browser route use `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | Verify affected package-facing route still renders | `/blocks/playground-demo` renders at HTTP 200 |
| Browser final proof | yes | Record route/console evidence | Playground/editor/list link rendered; zero console errors |
| CI-controlled template output changed | no | N/A | No template output touched |
| Package behavior or public API changed | no | N/A: internal authoring spelling only | Runtime and emitted contracts unchanged |
| Registry-only component work changed | no | N/A | No registry source edit |
| Docs or content changed | no | N/A | Only internal goal ledger changed |
| High-risk mini gate | yes | Prove inference and runtime shape | Typecheck, declaration inspection, tests, build, Browser, autoreview |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling edit |
| Local install corruption suspected | no | N/A | No corruption signal |
| Autoreview for non-trivial implementation changes | yes | Run scoped local review | Clean: no accepted/actionable findings; patch correctness 0.79 |
| PR create or update | no | N/A | User did not request git/PR work |
| Task-style PR body verified | no | N/A | No PR |
| PR proof image hosting | no | N/A | No PR or image |
| Tracker sync-back | no | N/A | No tracker |
| Final handoff contract | yes | Fill exact outcome/proof/caveat | Completed below |
| Final lint | yes | Run scoped equivalent | Biome check/write passed on target |
| Output budget discipline | yes | Keep source/proof bounded | One owner, scoped searches; one accidental log truncation was not used as evidence |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run checker | Run after this ledger update |
| Public API / package boundary proof | yes | Inspect declaration/public shape | API, read, update, extension identity preserved |
| Release artifact classification | yes | Classify delta | No user-visible package delta from the authoring-only canary |
| Published package changeset | no | N/A | No published behavior/API/type delta |
| Registry changelog | no | N/A | Not registry-only work |
| No release artifact | yes | Record exact reason | Internal authoring spelling only; declarations and behavior unchanged |
| Package typecheck/build/test | yes | Run owning checks | Typecheck/build pass; 51/51 tests pass |
| Barrel/export generation | no | N/A | No export or layout change |
| Browser interaction proof | yes | Verify package-facing route | Playground renders editor and list surface at HTTP 200 |
| Browser console/network check | yes | Inspect console and HTTP result | Zero console errors; HTTP 200 |
| Browser final proof artifact | yes | Record exact route proof | DOM snapshot contains playground editor and list link; no screenshot needed for non-visual change |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Full 1,741-line list owner, Core unified/specialized types/runtime, plugin rules, and 644-call count | Core contract |
| Scope correction | complete | User explicitly said no hard cut; reverted the only out-of-scope Core type-test edit | one-file migration |
| One-file migration | complete | Two `.extendApi`, one `.extendTx`, and one named `.extendExtension` replaced by repeated `.extend()` | verification |
| Verification | complete | Zero target matches; typecheck/build; 51/51 tests; declaration inspection; HTTP 200 Browser render; zero console errors; clean autoreview | closeout |
| PR / tracker sync | N/A | No PR or tracker requested | closeout |
| Closeout | complete | Goal ledger updated; checker is the remaining mechanical command | final response |

Findings:
- `packages/list/src/lib/BaseListPlugin.tsx` contains two `.extendApi`, one
  `.extendTx`, and one named `.extendExtension`; these were missed because the
  previous packet deliberately stopped at the list-classic canary.
- A broad audit found many outside usages, but the newest correction makes
  every one of them out of scope. No Core or skill source may change.
- This list owner needs only plugin-scoped API, own update, and a named raw
  extension. The previous list-classic canary already proved those unified
  runtime destinations; package-specific declaration inference remains the
  decisive gate.

Decisions and tradeoffs:
- Newest user scope wins: prove only this second canary and leave the dual
  builder surface intact.
- Convert the named extension to unified `extension` with `key: 'behavior'`;
  this preserves its normalized runtime identity without touching Core.
- If package type/declaration output regresses, restore the four usages and
  report the exact missing generic. No local workaround.

Implementation notes:
- Perform four direct structural edits in the one file; no codemod and no
  outside edits.

Review fixes:
- None. Scoped autoreview found no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| New www dev command found an existing server and exited | 1 | Reuse the reported owner server on port 3017 | Route returned HTTP 200 |
| Browser opened port 3000 before the existing server route was known | 1 | Open a fresh tab on ready port 3017 | Final Browser render passed |

Verification evidence:
- `rg -n "\.extend(?:Api|Tx|Extension)\b" packages/list/src/lib/BaseListPlugin.tsx`: zero matches.
- `pnpm --filter @platejs/list typecheck`: pass.
- `pnpm --filter @platejs/list build`: pass.
- Emitted `packages/list/dist/lib/BaseListPlugin.d.ts` preserves `getNext`,
  `getPrevious`, `expandItemsWithChildren`, `isActive`, `indent`, `outdent`,
  and `toggle`; no emitted contract `any`.
- `bun test packages/list/src/lib/BaseListPlugin.spec.tsx packages/list/src/react/ListPlugin.spec.tsx`:
  51 pass, 0 fail, 105 assertions.
- `pnpm exec biome check --write packages/list/src/lib/BaseListPlugin.tsx`:
  pass after one formatting fix.
- Browser `http://127.0.0.1:3017/blocks/playground-demo`: HTTP 200; editor and
  list link rendered; zero console errors; transient exploratory edits were
  removed by reload.
- `.agents/skills/autoreview/scripts/autoreview --mode local --prompt <scoped
  one-file contract>`: clean, no accepted/actionable findings.
- `git diff --check` on the target and plan: pass before final ledger update;
  rerun after it.

Final handoff contract:
- PR line: N/A; no git/PR action requested
- Issue / tracker line: N/A; direct local request
- Confidence line: high for this one-file canary; no claim about repo-wide hard cut
- Flow table:
  - Reproduced: four specialized builder usages existed in the target
  - Verified: zero remain; type/declaration/runtime/browser/review gates pass
- Browser check: playground editor/list surface rendered, HTTP 200, zero console errors
- Outcome: only `packages/list/src/lib/BaseListPlugin.tsx` uses unified repeated
  `.extend()` for its four authoring stages
- Caveat: every Core specialized method and every outside caller remains; this
  is evidence, not authorization for a hard cut
- Design:
  - Chosen boundary: one plugin owner canary
  - Why not quick patch: the unified form uses the existing Core compiler and
    proves real declaration inference
  - Why not broader change: the user explicitly prohibited the hard cut
- Verified: exact commands listed above
- PR body verified: N/A; no PR

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
- PR: N/A; no git/PR action requested
- Issue / tracker: N/A; direct local request
- Browser proof: `/blocks/playground-demo` HTTP 200, editor/list surface
  rendered, zero console errors
- Caveats: one-file canary only; no Core hard cut or outside migration

Timeline:
- 2026-07-24T21:55:15.573Z Task goal plan created.
- 2026-07-24 Scope corrected to one file before broad implementation.
- 2026-07-24 Four specialized usages migrated; package and browser proof passed.
- 2026-07-24 Scoped autoreview returned clean with no actionable findings.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete |
| Where am I going? | Final response; broader API design remains a separate accepted-target decision |
| What is the goal? | Prove unified `.extend()` in `packages/list/src/lib/BaseListPlugin.tsx` without a hard cut |
| What have I learned? | The unified path preserves this plugin's API, update, named extension, and declaration inference |
| What have I done? | Migrated four usages and closed type/build/test/browser/review gates |

Open risks:
- None inside the one-file canary. Repo-wide parity and deletion remain
  deliberately unproven and unauthorized.
