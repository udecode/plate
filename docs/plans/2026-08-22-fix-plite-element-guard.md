# Fix Plite Element Guard

Objective:
Make `ElementApi.isElement` faithfully narrow `BaseElement`; done when guard, NodeApi, package, doctrine-sync, changeset, and P1 review gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-22-fix-plite-element-guard.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: direct user authorization after source-backed harsh review of finding 2
- id / link: `/Users/zbeyens/.codex/attachments/a518a0e5-1836-4aff-a426-e2a2852dacd9/pasted-text.txt`, finding 2
- title: Repair the public Plite `Element` guard contract
- acceptance criteria: reproduce the false positive; make `ElementApi.isElement` reject missing/non-string `type` while accepting valid elements; preserve editor exclusion, shallow/deep semantics, and schema ownership; cover `ElementApi`, `ElementApi.isElementList`, `ElementApi.isElementType`, and transitive `NodeApi` guards with active tests; audit the 12 source-owner files for legitimate pre-canonical use; update stale fixtures, API doctrine, generated mirrors, and one `@platejs/plite` changeset; pass focused tests, source-first typecheck, Plite development proof, lint, agent-native review, and P1 autoreview.

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
- initial confidence score: N/A: binary red/green and review thresholds exist
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- The runtime false positive is observed red before the fix and the final public guard validates the required base `Element` shape without becoming a schema validator. Active guard tests, package typecheck/test, affected Plite proof, changeset, source/generated doctrine parity, zero stale typeless-positive fixtures, agent-native review, and P1 autoreview all pass with zero accepted actionable findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-fix-plite-element-guard.md` passes.

Verification surface:
- focused active `ElementApi`/`NodeApi` contract test, red then green
- `pnpm turbo typecheck --filter=./packages/plite`
- `pnpm --filter @platejs/plite test`
- `pnpm check:plite:dev`
- `pnpm install` plus source/generated best-api parity audit
- scoped or root lint fix and `git diff --check`
- `agent-native-reviewer` for rule/skill changes
- P1 `autoreview --mode local --max-priority P1`
- source audit of all 12 production files using `ElementApi.isElement`, public exports/docs, stale fixtures, and changeset.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve `BaseElement.type: string`, editor exclusion, shallow child-array checking, and recursive validation only under `deep: true`.
- Keep complete document/fragment vocabulary validation on `schema.assertDocument` and `schema.assertFragment`.
- Do not add a new public structural helper, weaken the public model, or patch 121 callers individually.

Boundaries:
- Source of truth: `packages/plite/src/interfaces/element.ts`, `node.ts`, current public model/docs, active and stale interface tests, Plite Vision, and best-api doctrine.
- Allowed edit scope: owning Plite guard/tests/fixtures, dependent Plite React fixtures exposed by the affected-graph proof, one `@platejs/plite` changeset, `.agents/rules/best-api.mdc` and its source reference, `docs/vision/plite.md`, generated best-api resources from `pnpm install`, and this plan.
- Browser surface: N/A: pure-data runtime predicate with no visible route or DOM behavior.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: direct request without tracker.
- Non-goals: full schema validation inside `ElementApi`, unrelated interface cleanup such as `isElementProps`, package/API renames, app/docs UI changes, commit, push, or PR.

Output budget strategy:
- Limit searches to `packages/plite`, best-api/Plite doctrine, the exact attachment, and changesets; count callers before reading them; cap command output; exclude generated/build/dependency trees except the generated best-api mirror audit.

Blocked condition:
- Stop only if a legitimate supported input domain requires typeless values to satisfy the public `Element` predicate and the target contract therefore needs a new user decision, or the same focused proof/review failure repeats with no safe in-scope repair.

Task state:
- task_type: Plite public predicate bug and API-contract repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: confirmed P0/publication-blocking type-guard defect; strict base-shape validation is the accepted target.
- confidence: high from public type, executable runtime crash, public export/docs, schema boundary, and caller inventory.
- next owner: patch
- reason: one local Plite behavior bug has a settled best-api target and durable owner.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-fix-plite-element-guard.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Scope, non-goals, proof, deliverables, handoff, and stop conditions are copied above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | `patch` owns the bug, `tdd` owns red/green, `best-api repair` owns doctrine, `autogoal` owns closure, and `changeset` owns release prose. |
| Active goal checked or created | yes | `get_goal` returned null; goal created with this plan path. |
| Source of truth read before edits | yes | Read attachment finding 2, VISION, Plite/common doctrine, best-api doctrine/reference, public guard/types/export/docs, NodeApi delegation, schema assertion boundary, fixtures, and caller counts. |
| Tracker comments and attachments read | yes | Supplied attachment finding 2 read; tracker N/A. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Scoped search found only canonical-node call sites and unrelated generic type-guard notes; no solution overrides the live owner. |
| TDD decision before behavior change or bug fix | yes | Add one active public-contract test and observe the current `true` false positive before implementation, then extend class coverage. |
| Branch decision for code-changing task | no | N/A: local checkout only; user did not request branch, commit, push, or PR. |
| Release artifact decision | yes | Add or update one `@platejs/plite` patch changeset relative to `main`; verify current changeset inventory first. |
| Browser tool decision for browser surface | no | N/A: no browser-visible behavior or runnable route owns this predicate. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Narrow owner-only reads and capped output are recorded above. |
| Docs pack selected | yes | Internal Plite/best-api doctrine changes require source-backed current-state prose. |
| `docs-creator` loaded | no | N/A: no public teaching docs; best-api owns internal API doctrine repair. |
| Docs lane selected | yes | Internal durable doctrine, not public docs/content. |
| Target docs and nearest sibling docs read | yes | Read `docs/vision/plite.md`, root/common Vision, best-api main rule, and schema/identity reference. |
| Docs style doctrine read | yes | Current-state active voice and source-owner law come from repo instructions and best-api. |
| Documented source owner identified | yes | Plite Vision owns substrate model law; best-api owns reusable public predicate judgment. |
| Agent-native pack selected | yes | `.agents/rules/**` change regenerates a skill mirror. |
| Agent-facing action surface identified | yes | Future best-api reviews must reject public predicates that do not validate their promised required base shape. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/best-api.mdc` and source reference only; `pnpm install` regenerates `.agents/skills/best-api/**`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Will load before agent-native closeout because agent doctrine changes. |
| Package/API pack selected | yes | Public root-exported `ElementApi` runtime/type contract changes. |
| Public surface or package boundary identified | yes | `@platejs/plite` root `ElementApi.isElement` and transitive `NodeApi` predicates. |
| Release artifact path selected | yes | One `.changeset` for `@platejs/plite`; registry changelog N/A. |
| `changeset` skill loaded when `.changeset` is required | yes | Read changeset skill before edits. |
| Barrel/export impact decision recorded | yes | No export or exported file-layout change; `pnpm brl` is N/A. |

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
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: one `@platejs/plite` changeset; registry changelog N/A.
- [x] Final handoff shape decided: root cause, changed owners, red/green and broad proof, doctrine sync/review, changeset, and local-only caveat; PR/tracker/browser N/A.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: local checkout only.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. Run `pnpm run reinstall` once only for matching corruption signals.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior. All proof runs from `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Strict classification can alter malformed/pre-canonical internal paths; audit all 12 source files and prove schema boundaries before keeping.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. Dirty local P1 after final code and generated sync.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling. Required because best-api doctrine changes.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason. Named guard/schema APIs were read from source; routes/components/demos/previews are N/A.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason. N/A: no links, anchors, or previews changed.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded. `pnpm install` regenerated both best-api mirrors.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason. Review passed with no findings.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: update the existing `@platejs/plite` major changeset; registry changelog N/A.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: published package runtime behavior changed.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: an existing major changeset was updated.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. Harden the runtime to the existing required type; migrate invalid test fixtures only.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. Changeset updated; barrels N/A because exports and file layout are unchanged.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof surface | Focused, package, affected-graph, doctrine, release, lint, and review gates pass. |
| Bug reproduced before fix | yes | Record failing test | Focused test failed `true !== false` before the product edit. |
| Targeted behavior verification | yes | Run focused test | 7 focused guard tests pass. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/plite` passes; affected graph typechecks 54 workspaces. |
| Package exports or file layout changed | no | N/A | No exports or exported file topology changed; `pnpm brl` N/A. |
| Package manifests, lockfile, or install graph changed | no | N/A | Task changed no manifest or lockfile; `pnpm install` ran only for rule generation. |
| Agent rules or skills changed | yes | Regenerate and audit | `pnpm install` passes; source/reference mirror checks pass. |
| Workspace authority proof | yes | Run in owning checkout | Every command ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | N/A | Pure-data predicate has no route or DOM surface. |
| Browser final proof | no | N/A | Direct browser proof N/A; affected graph still passed 3 Chromium smoke tests. |
| CI-controlled template output changed | no | N/A | No `templates/**` output changed. |
| Package behavior or public API changed | yes | Update changeset | Existing `@platejs/plite` major changeset records the strict predicate behavior. |
| Registry-only component work changed | no | N/A | No registry files changed. |
| Docs or content changed | yes | Audit internal doctrine | Plite Vision and best-api doctrine match source; no public MDX/content changed. |
| High-risk mini gate | yes | Audit failure mode and boundary | 121 calls/12 files audited; only invalid typeless fixtures failed and were migrated. Schema grammar remains separate. |
| Agent-native review for agent/tooling changes | yes | Run review | PASS capability map with no findings. |
| Local install corruption suspected | no | N/A | No corruption signals occurred; reinstall N/A. |
| P1 autoreview for non-trivial implementation changes | yes | Run local P1 | One invocation exited clean with no findings and 0.99 confidence. |
| PR create or update | no | N/A | User did not request PR work. |
| Task-style PR body verified | no | N/A | No PR exists or was requested. |
| PR proof image hosting | no | N/A | No PR and no browser image. |
| Tracker sync-back | no | N/A | Direct request without tracker. |
| Final handoff contract | yes | Fill fields below | Completed below. |
| Final lint | yes | Run scoped equivalent | Scoped Ultracite fixes pass for all changed code; `git diff --check` passes. Plan Markdown is ignored by Ultracite. |
| Output budget discipline | yes | Record recovery | One PTY affected-graph run was noisy and truncated; the final non-TTY rerun emitted an authoritative passing JSON summary. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run final checker | Final checker is the next command after this table resolves. |
| Docs source-backed claim audit | yes | Verify claims | Public type, implementation, NodeApi delegation, schema assertions, callers, and generated rules read directly. |
| Docs links / routes / previews | no | N/A | No links, routes, anchors, or previews changed. |
| Docs MDX/content parser | no | N/A | No MDX or public content changed. |
| Plugin page specifics | no | N/A | No plugin page changed. |
| Agent source / generated sync | yes | Regenerate and compare | `pnpm install` plus exact reference `cmp` and main-rule searches pass. |
| Agent action discoverability | yes | Audit route | Predicate law appears in best-api source and generated top-level skill. |
| Agent-native review | yes | Close findings | PASS; no accepted/actionable findings. |
| Public API / package boundary proof | yes | Audit API and transitive calls | Root-exported `ElementApi` and NodeApi behavior covered by focused and package tests; all 121 production calls audited. |
| Release artifact classification | yes | Classify delta | Published `@platejs/plite` runtime behavior inside the package's existing major-from-main release. |
| Published package changeset | yes | Update one package changeset | Existing single-package `@platejs/plite: major` changeset updated; no forbidden minor. |
| Registry changelog | no | N/A | Not registry-only work. |
| No release artifact | no | N/A | Published runtime behavior requires the existing package changeset. |
| Package typecheck/build/test | yes | Run owning proof | 1,493 Plite tests, 1,080 Plite React tests, package typecheck, affected graph, contracts, builds, and smoke pass. |
| Barrel/export generation | no | N/A | No exports or exported file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Source owners, runtime failure, caller inventory, fixtures, doctrine, and proof boundary read; first checkpoint complete. | implementation |
| Implementation | complete | Strict base-shape guard, active tests, stale fixtures, dependent fixtures, doctrine, mirrors, and changeset complete. | verification |
| Verification | complete | Focused/package/affected graph, lint, parity, agent-native, and P1 review pass. | closeout |
| PR / tracker sync | complete | N/A: neither requested. | final response |
| Closeout | complete | Final handoff recorded; goal checker and completion update next. | final response |

Findings:
- No remaining findings. P1 autoreview returned no P0/P1 issues at 0.99 confidence.

Decisions and tradeoffs:
- The public predicate validates the required base `Element` fields only. Empty string remains a string at this boundary; schema assertions own vocabulary, required schema properties, and content grammar.
- All 121 production calls across 12 Plite source files operate on canonical nodes/slices or intentional validation boundaries. No supported caller requires typeless values to narrow to `Element`.
- `@platejs/plite` does not exist on `main`; update the existing package-major changeset instead of inventing a branch-local patch release note.
- Scope baseline for P1 review: the violated invariant is an unsound `unknown -> Element` predicate on branch `next`; the owner is `packages/plite/src/interfaces/element.ts`, with transitive NodeApi behavior, dependent fixtures, best-api/Plite doctrine, generated mirrors, and the existing major changeset. Unrelated dirty checkout work is excluded.

Implementation notes:
- Red tracer: `bun test --preload ./config/plite-source-test-setup.ts ./packages/plite/test/element-interface-contract.test.ts` failed with `true !== false` for `{ children: [] }` before the product edit.
- Owning repair: require `typeof value.type === 'string'` inside the public `ElementApi.isElement` predicate before validating children. Empty strings remain base-shape values; schema assertions own vocabulary and grammar.
- The first affected-graph run exposed 65 dependent Plite React failures from typeless test elements. Adding the already-required `type` field to those fixtures restored all 1,080 Plite React tests without product compatibility code.

## Agent-Native Review

### Verdict

PASS

### Capability Map

| User action | Agent route | Source owner | Mirror/lock/doc | Proof | Status |
|---|---|---|---|---|---|
| Judge or repair a public predicate contract | `best-api repair`, then `patch` | `.agents/rules/best-api.mdc`, its schema reference, and `packages/plite/src/interfaces/element.ts` | `.agents/skills/best-api/**` and `docs/vision/plite.md` | `pnpm install`, exact source/mirror audit, red/green guard test, affected Plite proof | pass |

### Findings

- None.

### Accepted / Rejected

- Accepted: no findings.
- Rejected: no findings.

### Verification

- `pnpm install` regenerated the best-api mirror.
- Exact source/mirror searches found the new predicate law in both owners and both generated resources.
- The current Element guard repair is the forward test of the agent action; it uses the public type, implementation, production callers, active tests, and schema boundary.

### Needs Attention

- None.

Review fixes:
- None: P1 autoreview and agent-native review found no actionable issue.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First `pnpm check:plite:dev` | 1 | Treat strict-guard failures as fixture migration evidence, not compatibility pressure. | Added required `type` to dependent Plite React test elements; 1,080 tests and final affected graph pass. |

Verification evidence:
- RED: focused active guard test failed before the fix because the typeless value returned `true` (1 test, 1 failure).
- GREEN: 7 focused guard tests, 1,493 Plite tests, and 1,080 Plite React tests pass.
- `pnpm check:plite:dev` passes all five lanes: 54-workspace typecheck, Plite-family package tests, Browser core tests, contracts, and 3 Chromium smoke tests.
- `pnpm install`, exact best-api source/mirror parity, stale-fixture audit, scoped Ultracite, and `git diff --check` pass.
- Agent-native review passes with no findings.
- P1 local autoreview passes in one invocation with no findings and 0.99 confidence.

Final handoff contract:
- PR line: N/A: no PR requested or created.
- Issue / tracker line: N/A: direct request without tracker.
- Confidence line: 99% from executable red/green, package and affected-graph proof, source audit, and clean P1 review.
- Flow table:
  - Reproduced: focused test red; browser N/A.
  - Verified: focused/package/affected graph green; browser surface N/A, incidental Chromium smoke green.
- Browser check: N/A for pure-data predicate; 3 affected-graph Chromium smoke tests passed.
- Outcome: `ElementApi.isElement` rejects values missing the required string `type`; transitive NodeApi predicates inherit the honest contract.
- Caveat: Local checkout only; no commit, push, or PR. Unrelated pre-existing changes remain untouched.
- Design:
  - Chosen boundary: validate required base fields in the public predicate owner; keep schema grammar in schema assertions.
  - Why not quick patch: caller-specific guards would leave the exported type predicate unsound.
  - Why not broader change: no new helper or schema validation belongs in this base-shape predicate.
- Verified: exact commands and results recorded above.
- PR body verified: N/A: no PR.

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
- PR: N/A: not requested.
- Issue / tracker: N/A: none.
- Browser proof: N/A for behavior; 3 Chromium smoke tests pass incidentally.
- Caveats: local uncommitted work only; unrelated existing checkout changes preserved.

Timeline:
- 2026-08-22T22:02:35.206Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; final goal checker next. |
| Where am I going? | Mark goal complete and hand off. |
| What is the goal? | Make `ElementApi.isElement` faithfully narrow `BaseElement` with full package/doctrine/review proof. |
| What have I learned? | Strict base-shape validation is compatible with production callers; only invalid test fixtures depended on the lie. |
| What have I done? | Implemented, migrated fixtures, synced doctrine/mirrors/release note, and passed all proof gates. |

Open risks:
- None.
