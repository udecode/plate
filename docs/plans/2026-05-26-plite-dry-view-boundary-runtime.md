# plite dry view boundary runtime

Objective:
Implement the accepted DRY Plite view-boundary runtime slice in
`Plate repo root`, complete only when public API stays stable (`<Editable root>`,
`slots.contentRoot`, `slots.contentBoundary`), duplicated content-root /
hidden-boundary navigation-selection-command-history ownership is consolidated
into one internal graph/target owner where feasible, shared conformance coverage
proves `examples/multi-root-document`, `examples/synced-blocks`, and
`examples/hidden-content-blocks` across arrow navigation, Shift selection,
Cmd/Meta boundaries, history restore, copy/delete/type behavior or explicit
degraded capability rows, focused `Plate repo root`
package/browser/typecheck/lint verification passes, autoreview has no
accepted/actionable findings, changesets exist if published package behavior
changes, and
`node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-plite-dry-view-boundary-runtime.md`
passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-05-26-plite-dry-view-boundary-runtime.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: accepted local architecture plan plus user implementation command
- id / link: `docs/plans/2026-05-26-plite-unified-view-boundary-navigation-architecture.md`
- title: DRY Plite view-boundary runtime
- acceptance criteria: public API remains stable; shared runtime owner replaces
  duplicated graph/navigation/selection target logic where feasible; conformance
  coverage spans multi-root, Synced Blocks, and hidden-content examples; focused
  package/browser/typecheck/lint/review gates pass.

Completion threshold:
- DRY runtime implementation lands in `Plate repo root` without replacing public
  `Editable root`, `slots.contentRoot`, or `slots.contentBoundary`.
- Shared tests or helpers prove the common view-boundary laws across
  `multi-root-document`, `synced-blocks`, and `hidden-content-blocks`; any
  unsupported native behavior is recorded as an explicit capability/degradation
  row.
- Focused package tests for the changed Plite React/DOM internals pass.
- Focused Playwright for the affected examples passes at least on Chromium.
- Relevant `Plate repo root` typecheck/lint gates pass or any failure is proven
  unrelated with exact evidence.
- Autoreview for the `Plate repo root` implementation diff returns no
  accepted/actionable findings.
- Package release artifact decision is closed: changeset added when published
  package behavior changes, or exact no-artifact reason recorded.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-plite-dry-view-boundary-runtime.md` passes.

Verification surface:
- `packages/plite-react/test/*projection*`,
  `*content-root*`, `*keyboard-input*`, `*clipboard*`, or new focused contract
  tests for view-boundary graph/selection/command behavior.
- `apps/www/tests/plite-browser/donor/examples/multi-root-document.test.ts`,
  `synced-blocks.test.ts`, and `hidden-content-blocks.test.ts` focused rows.
- `Plate repo root`: owning package typecheck, site typecheck if examples change,
  scoped lint/format, and final focused browser route proof.
- `plate-2`: this goal plan and final autogoal checker.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Keep one runtime editor with many views; do not implement one editor per
  block.
- Keep raw Plite unopinionated; product synced-block chrome remains example or
  Plate-owned.
- Do not add public API unless implementation proves the current stable slots
  cannot carry the behavior.
- Keep missing-DOM native affordance claims honest; degrade explicitly instead
  of pretending native parity.

Boundaries:
- Source of truth: latest user command, this goal, and
  `docs/plans/2026-05-26-plite-unified-view-boundary-navigation-architecture.md`.
- Allowed edit scope: `packages/plite-react/**`,
  `packages/plite-dom/**` if hidden-boundary helper changes are
  required, `apps/www/tests/plite-browser/donor/examples/**`,
  `apps/www/src/app/(app)/examples/plite/_examples/**` only when fixture/proof needs it,
  `Plate repo root/.changeset/**` if package behavior changes, and this plan.
- Browser surface: `/examples/multi-root-document`, `/examples/synced-blocks`,
  `/examples/hidden-content-blocks`.
- Tracker sync: N/A, no tracker item.
- Non-goals: PR creation, Notion permissions/server sync, current slate-yjs
  adapter compatibility, public product UI kits, and arbitrary public
  `ViewSelection` API exposure.

Blocked condition:
- Block only if the current Plite model cannot represent the required DRY
  behavior without a new public API or user-owned product decision after three
  distinct implementation/proof attempts, or if required `Plate repo root`
  verification cannot run because of a persistent tool/environment blocker that
  survives the repo-approved local-env retry.

Task state:
- task_type: runtime refactor / browser-visible behavior proof
- task_complexity: major-normal execution
- current_phase: closeout
- current_phase_status: done
- next_phase: final response
- goal_status: active until checker finishes

Current verdict:
- verdict: implementation, focused verification, and autoreview pass
- confidence: high after focused unit gates, repeated flaky-row stress, and the
  full three-example Chromium sweep.
- next owner: checker
- reason: internal view-boundary ownership is consolidated without public API
  churn; remaining work is mechanical closure.

Completion rule:
- Only call `update_goal(status: complete)` after autoreview has no accepted
  actionable findings and the checker command passes.
- This file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `autogoal`, `task`, and `changeset`; user explicitly invoked autogoal. |
| Active goal checked or created | yes | Active goal continued with `Plate repo root` objective and this plan. |
| Source of truth read before edits | yes | Read accepted unified view-boundary plan and current goal prompt. |
| Tracker comments and attachments read | no | N/A: no tracker item. |
| Video transcript evidence required | no | N/A: no video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Previous planning pass covered multi-root DX, native caret, rootless selection, operation-root, and DOMCoverage solution notes. |
| TDD decision before behavior change or bug fix | yes | Added/refactored focused contract tests and used browser rows as behavior proof. |
| Branch decision for code-changing task | no | N/A: no branch or PR requested; repo says no proactive git hygiene. |
| Release artifact decision | yes | Added patch changesets for `plite-react` and `plite-dom`. |
| Browser tool decision for browser surface | yes | Used focused Playwright Chromium proof for the three affected examples. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker item. |
| Browser pack selected | yes | `browser` pack applied. |
| Browser route / app surface identified | yes | `/examples/multi-root-document`, `/examples/synced-blocks`, `/examples/hidden-content-blocks`. |
| Browser tool decision recorded | yes | Playwright is the owning browser proof for `Plate repo root` integration examples. |
| Console/network caveat policy recorded | yes | Playwright page-level failures would fail the rows; no console/network failure surfaced in passed runs. |
| Package/API pack selected | yes | `package-api` pack applied. |
| Public surface or package boundary identified | yes | `plite-react` and `plite-dom` runtime behavior changed; public API names stayed stable. |
| Release artifact path selected | yes | `Plate repo root/.changeset/focused-roots-restore-selection.md` and `Plate repo root/.changeset/dom-focus-sync-selection.md`. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded `.agents/skills/changeset/SKILL.md` and used patch changesets, one package per file. |
| Barrel/export impact decision recorded | yes | No public exports or exported file layout changed; no barrel generation needed. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work updates `docs/components/changelog.mdx` instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named package/browser/lint/review/checker gates | Focused tests/typechecks/lint/browser proof and clean autoreview are recorded below; checker is the remaining command. |
| Bug reproduced before fix | yes | Record failing repro | Reproduced stale focus/selection with Playwright rows and manual instrumentation; final rows pass. |
| Targeted behavior verification | yes | Run focused test/proof | `plite-react` vitest contracts: 9 files, 59 tests passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun --filter plite-dom typecheck` and `bun --filter plite-react typecheck` passed in `Plate repo root`. |
| Package exports or file layout changed | no | Barrel generation decision | N/A: no public exports or exported file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Install graph check | N/A: no manifest or lockfile changes. |
| Agent rules or skills changed | no | Agent sync check | N/A: no agent files changed. |
| Workspace authority proof | yes | Run checks in owning repo | All package/browser commands ran from `Plate repo root`, the owning workspace. |
| Browser surface changed | yes | Prove route interactions | Playwright Chromium: 31/31 passed across the three affected example files. |
| Browser final proof | yes | Record artifact/caveat | Playwright trace would attach on failure; final passed run has command evidence and no failure artifact. |
| CI-controlled template output changed | no | Restore or record reason | N/A: no templates touched. |
| Package behavior or public API changed | yes | Add changeset or reason | Added patch changesets for `plite-react` and `plite-dom`. |
| Registry-only component work changed | no | Registry changelog decision | N/A: no registry component work. |
| Docs or content changed | yes | Verify source-backed plan edits | This goal plan was updated as execution evidence only; no user docs changed. |
| High-risk mini gate | yes | Record failure mode and proof plan | Failure mode: stale native selection overwrites model/restored root selection; proof: unit contracts, repeated flaky row, and three-example browser sweep. Boundary is right because root focus and DOM selection export own the issue, not each example. |
| Agent-native review for agent/tooling changes | no | Agent-native decision | N/A: no agent/tooling files changed. |
| Local install corruption suspected | no | Reinstall decision | N/A: failures matched runtime behavior and were fixed in code. |
| Autoreview for non-trivial implementation changes | yes | Run autoreview local mode | `Plate repo root`: local autoreview rerun clean with no accepted/actionable findings. |
| PR create or update | no | PR decision | N/A: no PR requested. |
| PR proof image hosting | no | PR image decision | N/A: no PR requested. |
| Tracker sync-back | no | Tracker decision | N/A: no tracker item. |
| Final handoff contract | yes | Fill final fields | Filled below with outcome, proof, caveats, and design decision. |
| Final lint | yes | Run scoped lint/format | `bunx biome check ... --fix` passed; `bunx eslint ...` returned 0 errors and ignored-file warnings for unmatched config files. |
| Goal plan complete | yes | Run checker | To run after autoreview evidence is added. |
| Browser interaction proof | yes | Exercise target routes | Playwright Chromium exercised hidden-content, multi-root, and synced-block interactions. |
| Browser console/network check | yes | Record result | No pageerror/console/network failure surfaced in passed Playwright rows; failure traces were used during debugging. |
| Browser final proof artifact | yes | Record proof | Final command evidence: 31 passed in 25.8s. |
| Public API / package boundary proof | yes | Source-audit public API/export impact | No public API names changed; `Editable root`, `slots.contentRoot`, and `slots.contentBoundary` remain stable. |
| Release artifact classification | yes | Classify package delta | Published runtime behavior changed in `plite-react` and `plite-dom`; patch changesets added. |
| Published package changeset | yes | Add one file per package | Added `focused-roots-restore-selection.md` and `dom-focus-sync-selection.md`; no forbidden `minor`. |
| Registry changelog | no | Registry-only decision | N/A: no registry-only changes. |
| No release artifact | no | No-artifact decision | N/A: package runtime behavior changed. |
| Package typecheck/build/test | yes | Run owning package checks | `plite-dom`/`plite-react` typecheck and build passed; `plite-react` focused tests passed. |
| Barrel/export generation | no | Barrel decision | N/A: no exports or public file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | source map below | closed |
| Implementation | done | shared `view-boundary-graph`, focus/root interaction, history, and DOM focus fixes landed | closed |
| Verification | done | focused unit/typecheck/lint/build/browser evidence below | autoreview |
| PR / tracker sync | n/a | no PR or tracker requested | closed |
| Closeout | done | changesets added; autoreview clean; checker runs before final response | final response |

Findings:
- Accepted plan verdict: keep public `Editable root`, `slots.contentRoot`, and
  `slots.contentBoundary`; consolidate internal ownership around one graph-like
  view-boundary model.
- Source map: `projection-graph` owns visible-order segmentation;
  `view-selection` owns model sidecar/history identity;
  `projected-selection-target` duplicated segment endpoint resolution and
  repeated-root ambiguity checks; `content-root-navigation` duplicated node/root
  boundary point traversal for arrow/enter/vertical navigation; DOMCoverage
  boundary contracts already covered hidden-content policy rows.
- Browser debugging found three real focus bugs: raw DOM focus could import a
  stale start selection before Plite exported its model selection, already
  focused editors skipped DOM selection export, and root chrome accepted stale
  browser event ranges instead of restoring the cached root selection.

Decisions and tradeoffs:
- DRY was applied at invariant boundaries, not by flattening product examples.
- `view-boundary-graph` is internal only; no public API was added.
- Root chrome restores captured selection targets instead of re-reading mutable
  cache during delayed focus retries.

Implementation notes:
- Added `packages/plite-react/src/view-boundary-graph.ts` as the shared owner
  for rooted points, boundary point traversal, range endpoint resolution,
  repeated-root ambiguity, and command target creation.
- Routed `view-selection`, `projected-selection-target`,
  `content-root-navigation`, `browser-handle`, and
  `projected-collab-substrate` through the shared helper.
- Fixed root focus/history behavior in `focus-plite-editable.ts`,
  `root-interaction-controller.ts`, `root-interaction-resolver.ts`,
  `use-slate-history.ts`, and `plite-dom` focus export.

Review fixes:
- First local autoreview found one unrelated generated-file churn issue:
  `site/next-env.d.ts` imported the dev-only `.next/dev/types/routes.d.ts`.
  Restored it to `.next/types/routes.d.ts`.
- Rerun local autoreview in `Plate repo root` returned clean: no
  accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Multi-root padding click selected first paragraph start | 1 | Inspect event target and focus ordering | Fixed by making Plite focus export model selection before raw fallback. |
| Root chrome restore intermittently inserted at header start | 2 | Stop accepting stale root chrome event ranges and capture focus selection once | Fixed in resolver/controller; flaky row passed 10/10 repeats. |
| Hidden-content materialize row failed once in full sweep | 1 | Repeat focused row and rerun full sweep | Focused row passed 5/5; final full sweep passed 31/31. |

Verification evidence:
- `packages/plite-react`: `bun test:vitest test/view-boundary-graph-contract.test.ts test/view-selection-contract.test.ts test/projected-command-contract.test.ts test/projected-clipboard-contract.test.ts test/content-root-navigation-contract.test.ts test/keyboard-input-strategy-contract.test.ts test/use-slate-root-chrome.test.tsx test/use-slate-history.test.tsx test/root-interaction-resolver.test.ts` -> 9 files, 59 tests passed.
- `Plate repo root`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/multi-root-document.test.ts playwright/integration/examples/synced-blocks.test.ts playwright/integration/examples/hidden-content-blocks.test.ts --project=chromium` -> 31 passed in 25.8s.
- `Plate repo root`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/multi-root-document.test.ts --project=chromium --grep "visible root chrome restores" --repeat-each=10` -> 10 passed.
- `Plate repo root`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/hidden-content-blocks.test.ts --project=chromium --grep "controls selection policy" --repeat-each=5` -> 5 passed.
- `Plate repo root`: `bun --filter plite-dom typecheck`, `bun --filter plite-react typecheck`, `bun --filter plite-dom build`, and `bun --filter plite-react build` passed.
- `Plate repo root`: scoped `bunx biome check ... --fix` passed with no fixes; scoped `bunx eslint ...` returned 0 errors and ignored-file warnings for unmatched config files.
- `Plate repo root`: local autoreview initially reported one generated
  `site/next-env.d.ts` dev-route type path; after restoring the production path,
  local autoreview rerun passed with no accepted/actionable findings.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker item.
- Confidence line: high after focused unit, typecheck/build/lint, repeated flaky-row, and full browser proof.
- Flow table:
  - Reproduced: browser rows and manual instrumentation reproduced stale focus/selection bugs.
  - Verified: focused unit contracts, typecheck/build/lint, repeated rows, and full Chromium example sweep.
- Browser check: 31/31 passed across affected examples.
- Outcome: DRY internal view-boundary owner plus root focus/DOM selection fixes landed.
- Caveat: proof is Chromium-focused per goal; no full `bun check:full` mobile/browser matrix was run.
- Design:
  - Chosen boundary: internal `view-boundary-graph` plus root focus and DOM focus owners.
  - Why not quick patch: caller-by-caller example fixes would leave command/navigation/history drift.
  - Why not broader change: public API already carries the model; no one-editor-per-block rewrite needed.
- Verified: see verification evidence.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: Playwright Chromium passed for `multi-root-document`, `synced-blocks`, and `hidden-content-blocks`.
- Caveats: no PR, no tracker, no full non-Chromium integration sweep.

Timeline:
- 2026-05-26T21:59:48.199Z Task goal plan created.
- 2026-05-26 Active goal continued with one-shot execution mode and
  `browser`/`package-api` packs.
- 2026-05-26 Source map completed; first DRY target selected as shared
  view-boundary endpoint/target helpers.
- 2026-05-26 Implemented internal `view-boundary-graph` and routed duplicated
  callers through it.
- 2026-05-26 Fixed root focus, DOM selection export, root chrome stale range,
  and history focus ownership bugs found by Playwright.
- 2026-05-26 Added patch changesets for `plite-react` and `plite-dom`.
- 2026-05-26 Autoreview finding fixed and rerun clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Checker, final response |
| What is the goal? | DRY the Plite view-boundary runtime without public API churn and prove it across the three examples. |
| What have I learned? | The shared graph was the right DRY boundary; the last visible bugs were focus/export ownership bugs. |
| What have I done? | Implemented the shared helper, fixed root focus/selection/history behavior, added changesets, and passed focused proof. |

Open risks:
- Residual risk: non-Chromium browser behavior may still expose different
  native selection timing. Mitigation: Chromium goal proof is green, and the
  DOM focus/export fix is package-owned rather than example-owned.
