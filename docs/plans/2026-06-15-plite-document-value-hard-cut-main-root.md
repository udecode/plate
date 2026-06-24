# plite document value hard cut main root

Objective:
Hard cut Plite public main root; done when value uses children plus extra
roots only and main root has no public API path.

Goal plan:
docs/plans/2026-06-15-plite-document-value-hard-cut-main-root.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user prompt
- id / link: current Codex thread
- title: Hard cut public `"main"` root from Plite document value
- acceptance criteria:
  - Normal editor value remains the Plite-compatible block array.
  - Full document value shape is `{ children, roots?, state? }`.
  - `children` is the primary Plite document.
  - `roots` contains extra named roots only.
  - Public APIs use `root?: string`; `undefined` means the primary document.
  - There is no public way to spell the primary document as `"main"`.
  - Hard cut compatibility aliases, docs, examples, tests, comments, and
    fallback parsing for public `"main"` root.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Source audit finds no public `"main"` root API path in Plite code, docs, or
  examples, except internal/private implementation details explicitly recorded
  as non-public.
- Plite public document value supports array shorthand and
  `{ children, roots?, state? }`.
- Focused type/tests/docs checks pass in the owning Plite workspace.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-plite-document-value-hard-cut-main-root.md` passes.

Verification surface:
- Source audit over `.tmp/plite` for `"main"`, `roots.main`, `main root`,
  document value, and root option usage.
- Focused package tests for document value/root normalization and public root
  access.
- Owning Plite typecheck/check command after implementation.
- Docs/examples grep and build/type proof when docs/examples change.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: latest user prompt plus `vision`, live
  `.tmp/plite` source/tests/docs, and this plan.
- Allowed edit scope: `.tmp/plite` Plite source/tests/docs/examples and
  this plan. Parent repo skill/docs changes only if workflow misses are found.
- Browser surface: only if changed docs/examples expose a browser route or
  source audit shows behavior needs browser proof.
- Tracker sync: N/A: no tracker item.
- Non-goals: no release/publish/PR/commit unless explicitly requested; no
  backward compatibility for public `"main"` root; no migration-story docs.

Output budget strategy:
- Use filename/count searches first, then narrow `sed` reads on owning files.
- Exclude generated/build artifacts unless a changed owner requires them.
- Cap broad command output and record exact grep queries instead of streaming
  full matches.

Blocked condition:
- Block only if live source proves `"main"` is required by an unavoidable
  external contract and cutting it would need a user product decision, or if
  local install/tooling corruption persists after the repo-prescribed retry.

Task state:
- task_type: public API hard cut
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: ready for complete

Current verdict:
- verdict: complete
- confidence: high after source audit, full check, and accepted review fixes
- next owner: task
- reason: public value shape is `{ children, roots?, state? }`, public primary
  root inputs reject `"main"`, internal operation/collab sentinels still use
  `"main"` where needed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-plite-document-value-hard-cut-main-root.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria above copy every explicit user requirement before implementation. |
| Skill analysis before edits | yes | Loaded `autogoal`, `hard-cut`, `vision`, `docs-creator`, and `autoreview`; task uses package-api/docs packs. |
| Active goal checked or created | yes | `get_goal` returned none; created active goal pointing to this plan. |
| Source of truth read before edits | yes | User prompt, skill/north-star instructions, and live `.tmp/plite` source/tests/docs read before and during edits. |
| Tracker comments and attachments read | N/A: no tracker item | User prompt only. |
| Video transcript evidence required | N/A: no video | Prompt has no media. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: Plite public API source owns current truth | North-star says live `.tmp/plite` source outranks old docs for current API. |
| TDD decision before behavior change or bug fix | yes | Added/updated focused contract tests for value shape, public `"main"` rejection, readonly root reads, collab targets, history root, and layout root options. |
| Branch decision for code-changing task | N/A: user did not ask branch work | Stay on current checkout; no git branch/commit/PR. |
| Release artifact decision | N/A: Plite private alpha | User asked hard cut, not release/publish; continuous private alpha rule says no changeset/release handoff unless explicitly requested. |
| Browser tool decision for browser surface | N/A: package API/docs/examples type surface | No browser route behavior changed; `bun check` covers site type and package tests. |
| PR expectation decision | N/A: no PR requested | No PR. |
| Tracker sync expectation decision | N/A: no tracker item | No sync-back. |
| Output budget strategy recorded | yes | Output budget strategy section filled before broad source audit. |
| Docs pack selected | yes | Plan created with docs pack because public docs/examples may change. |
| `docs-creator` loaded | yes | Loaded before docs edits; docs written as current-state reference, not migration/changelog prose. |
| Docs lane selected | yes | Incidental docs under task template; docs pack protects docs proof. |
| Target docs and nearest sibling docs read | yes | Read and patched Plite docs under `.tmp/plite/docs/**` for editor value, roots, state, hooks, saving, transforms, locations, and examples. |
| Docs style doctrine read | yes | Used `docs-creator` doctrine: latest-state reference, no migration-story docs. |
| Documented source owner identified | yes | Source owners are `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/core/public-state.ts`, React root hooks, layout root API, and docs/examples. |
| Package/API pack selected | yes | Plan created with package-api pack. |
| Public surface or package boundary identified | yes | Public surfaces: Plite document value, `state.value.root`, public root options, public locations, React root/history/chrome hooks, layout root options, docs/examples. |
| Release artifact path selected | N/A: no release requested | Private alpha hard cut; no changeset/release artifact. |
| `changeset` skill loaded when `.changeset` is required | N/A: no changeset | No release/publish work requested. |
| Barrel/export impact decision recorded | N/A: no exported file layout change | Type signatures changed in existing exported files; no barrel generation needed. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation. Evidence: Task source,
      completion threshold, verification surface, constraints, boundaries, and
      blocked condition are filled.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: normalize/serialize in
      Plite core, public root validation in shared core/layout/root-hook owners,
      React public hooks map primary root to `undefined`, and tests/docs follow.
- [x] Release artifact requirement recorded: N/A, Plite private alpha and no
      release/publish requested.
- [x] Final handoff shape decided: changed list, proof commands, accepted review
      fixes, caveats, and needs-review items.
- [x] Branch handling recorded for code-changing work: N/A, no branch/commit/PR
      requested.
- [x] Local-env-rot retry policy recorded: N/A, failures were real formatter,
      type, test, or review findings; no install corruption signal.
- [x] Workspace authority recorded: all proof commands run in
      `/Users/zbeyens/git/plate-2/.tmp/plite`; plan check run in parent repo.
- [x] High-risk note recorded: public API/runtime/package boundary hard cut;
      proof includes typecheck, full check, grep audits, and autoreview fixes.
- [x] Review/autoreview target selected: dirty local Plite diff reviewed with
      `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local`.
- [x] Agent-native review decision recorded: N/A, no `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling
      changed.
- [x] Output budget discipline recorded and followed; one misquoted grep caused
      noisy output and was rerun safely with scoped patterns/excludes.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: no changeset because
      Plite is private alpha and user did not request release/publish.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules; N/A, no changeset.
- [x] Package/API pack: registry-only work updates `docs/components/changelog.mdx`; N/A, no registry-only work.
- [x] Package/API pack: no-artifact decision states why the diff has no release artifact: private alpha hard cut, no release requested.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit: hard cut public `"main"` root, no legacy `{ roots: { main } }` loader.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded.
- [x] Package/API pack: generated barrels or release notes are updated when required; N/A, no export layout/barrel change.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Ran source audits and Plite gates; `bun check` green; grep audits recorded in Verification evidence. |
| Bug reproduced before fix | N/A: design hard cut | No external bug report; review findings produced deterministic failures/gaps and tests were added. |
| Targeted behavior verification | yes | Focused Plite, React history/collab, and layout tests passed. |
| TypeScript or typed config changed | yes | `bun check` includes package/site/root typecheck; focused package typechecks also passed. |
| Package exports or file layout changed | N/A: no export layout change | Existing exported type signatures changed; no barrel file layout change. |
| Package manifests, lockfile, or install graph changed | N/A: none changed | No manifest/lockfile/install graph edit. |
| Agent rules or skills changed | N/A: none changed | No agent rules/skills changed. |
| Workspace authority proof | yes | All Plite checks run in `/Users/zbeyens/git/plate-2/.tmp/plite`. |
| Browser surface changed | N/A: API/docs/examples type surface | No runtime browser route behavior changed; site typecheck covers examples. |
| Browser final proof | N/A: no browser proof required | No UI behavior route changed. |
| CI-controlled template output changed | N/A: none changed | No `templates/**` output touched. |
| Package behavior or public API changed | yes | Private alpha hard cut; no release/publish requested, so no changeset. |
| Registry-only component work changed | N/A: none | No registry component edit. |
| Docs or content changed | yes | Docs/examples updated to current `{ children, roots? }` shape and audited for public `"main"` mentions. |
| High-risk mini gate | yes | Failure mode was public/internal root boundary leakage; proof is tests, grep audits, and review-driven fixes. |
| Agent-native review for agent/tooling changes | N/A: none | No agent tooling changed. |
| Local install corruption suspected | N/A: no signal | Failures mapped to real code/type/format/review issues. |
| Autoreview for non-trivial implementation changes | yes | Multiple autoreview passes found and drove fixes; final contextual pass overran after 32m and was stopped, then deterministic audits plus full `bun check` closed the boundary. |
| PR create or update | N/A: no PR requested | No PR. |
| Task-style PR body verified | N/A: no PR | No PR body. |
| PR proof image hosting | N/A: no PR/browser proof | No hosted image needed. |
| Tracker sync-back | N/A: no tracker item | No sync-back. |
| Final handoff contract | yes | Final response includes changed list, proof, accepted review fixes, and review attention. |
| Final lint | yes | `bun check` ran `biome check . && eslint .`; `bun lint:fix` used after formatter nits. |
| Output budget discipline | yes | Misquoted grep caused noisy output; reran safe scoped audits and ignored noise. |
| Goal plan complete | yes | This plan update precedes `check-complete`; result recorded in final response. |
| Docs source-backed claim audit | yes | Grep audits and typecheck cover updated docs/examples; docs follow source shape. |
| Docs links / routes / previews | N/A: no new links/routes/previews | Existing docs links only; no new route/preview added. |
| Docs MDX/content parser | N/A: no contentlayer app command required | Plite `bun check` includes site typecheck; no MDX parser gate in this workspace check. |
| Plugin page specifics | N/A: no plugin page | Not plugin page work. |
| Public API / package boundary proof | yes | Public root/value grep audits and typechecks passed. |
| Release artifact classification | yes | Private alpha package/API hard cut; no release artifact. |
| Published package changeset | N/A: no release/publish requested | No `.changeset`. |
| Registry changelog | N/A: no registry work | No registry changelog. |
| No release artifact | yes | Plite continuous private alpha; user did not request release/publish/PR. |
| Package typecheck/build/test | yes | `bun check` green in `.tmp/plite`. |
| Barrel/export generation | N/A: no export layout change | No `pnpm brl` needed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Skills/source/docs/tests read and plan created | implementation |
| Implementation | complete | Core, React, layout, docs, examples, and tests patched | verification |
| Verification | complete | Focused tests, full `bun check`, source/docs grep audits, autoreview-driven fixes | closeout |
| PR / tracker sync | N/A | No PR/tracker requested | final response |
| Closeout | complete | Plan updated; check-complete run next | final response |

Findings:
- `EditorDocumentValue` public shape should be `{ children, roots?, state? }`;
  internal runtime still stores the primary root under private `"main"` for
  operation/projection/collab mechanics.
- Public primary root must be omitted everywhere: value reads, transform
  locations, initial selections, React hooks, history controller, layout options,
  and examples/docs.
- `state.value.root()` is live state and must be readonly at type level; callers
  clone before writing/replacing.
- `getRootKeyedCollabTargets` still needs internal `{ root: "main" }` because
  operations and remote selections are root-keyed internally.

Decisions and tradeoffs:
- Reject legacy loader compatibility for `{ roots: { main } }`: user asked for a
  hard cut and Plite is private alpha. Docs describe the latest state only.
- Keep internal/private `"main"` sentinel for operation replay, projection graph,
  remote selection, view internals, and low-level tests; public callers cannot
  pass it as the primary root.
- No changeset/release artifact: no release/publish/PR requested and Plite is
  continuous private alpha.
- No browser proof: changed surface is package API/docs/examples type behavior,
  not an interactive browser route.

Implementation notes:
- Core: updated `EditorDocumentValue`, `InitialValue`, document normalization,
  serialization, public root reads, public read/write location guards, and
  `createEditorView` public root validation.
- React: mapped public primary root to `undefined` for runtime/root/history/chrome
  hooks; added internal helpers where root identity must stay `"main"`.
- Layout: rejects public `root: "main"` for layout and projection options while
  keeping snapshot/internal roots root-keyed.
- Docs/examples: switched full document examples to `{ children, roots?, state? }`
  and removed public primary `"main"` root guidance.

Review fixes:
- Autoreview finding: optional `roots` direct indexes in tests. Fixed with
  `state.value.root(extraRoot)` or optional `roots?.[...]`; typechecks passed.
- Autoreview finding: collab target discovery dropped primary root. Fixed by
  including internal `{ root: "main" }` before sorted extra roots and added test.
- Autoreview finding: public transform locations accepted `root: "main"`. Fixed
  public location validation and tests for initial selection, text insertion,
  selection set, mixed roots.
- Autoreview finding: `usePliteHistory()` leaked `root: "main"`. Fixed return
  type/value to `undefined` for primary and updated test/docs.
- Autoreview finding: stale public `"main"` tests. Converted to omitted root
  while keeping assertions that emitted operations are internally root-keyed.
- Autoreview finding: `state.value.root()` returned mutable type. Changed to
  readonly and updated generic type tests/examples to clone before mutation.
- Autoreview finding: layout public options accepted `root: "main"`. Added guard
  and layout tests.
- Autoreview finding: read APIs accepted `root: "main"`. Added read-location
  guard and read-side contract tests.
- Final contextual autoreview pass overran after 32 minutes and was stopped.
  Closure uses the accepted review fixes already completed, deterministic grep
  audits, and green full `bun check`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Bun test path without `./` matched no files | 1 | Use `bun test ./path` | Reran focused tests with `./` paths. |
| Vitest `--runInBand` unsupported | 1 | Use package Vitest command without unsupported flag | Reran `bun --filter plite-react test:vitest`. |
| Raw Bun test on jsdom React test owner | 1 | Use Vitest owner for React tests | Reran package Vitest rows. |
| Misquoted grep around backticks caused shell command substitution and noisy output | 1 | Rerun safe single-quoted/scoped grep with excludes | Safe audits passed. |
| Parent repo `bun lint:fix` accidentally formatted unrelated harvester scripts | 1 | Restore those files and run formatting only in `.tmp/plite` | Restored targeted parent files; later formatter runs were nested repo only. |
| Full `bun check` formatter/type/test failures | several | Patch exact owner, rerun focused proof, then full gate | Final `bun check` green. |
| Final contextual autoreview exceeded 30-minute window | 1 | Stop the overrun and replace with deterministic audits plus full check | No live review process left; audits and `bun check` green. |

Changed list:
- Core Plite API/runtime:
  `packages/plite/src/interfaces/editor.ts`,
  `packages/plite/src/core/public-state.ts`,
  `packages/plite/src/editor-runtime-view.ts`.
- React runtime/root API:
  `packages/plite-react/src/hooks/use-slate-runtime.tsx`,
  `packages/plite-react/src/hooks/use-slate-history.ts`,
  `packages/plite-react/src/hooks/use-slate-root-chrome.ts`,
  `packages/plite-react/src/view-boundary-graph.ts`,
  projected/content-root/selection helpers.
- Layout:
  `packages/plite-layout/src/index.ts`.
- Docs/examples:
  `docs/api/**`, `docs/concepts/**`, `docs/libraries/slate-react/**`,
  `docs/walkthroughs/**`, `site/examples/ts/{pagination,synced-blocks,editable-voids,multi-root-document}.tsx`.
- Tests:
  focused contract updates across `packages/plite/test/**`,
  `packages/plite-react/test/**`, `packages/plite-history/test/**`,
  `packages/plite-dom/test/**`, and `packages/plite-layout/test/**`.

Verification evidence:
- `cwd=/Users/zbeyens/git/plate-2/.tmp/plite`
- Focused core/type proof:
  `bun test ./packages/plite/test/state-tx-public-api-contract.ts
  ./packages/plite/test/rooted-operation-contract.ts
  ./packages/plite-history/test/history-contract.ts` -> 93 pass, 0 fail.
- Focused React/layout proof:
  `cd packages/plite-react && bun test:vitest --run
  test/use-slate-history.test.tsx` -> 6 pass, 0 fail.
  `cd packages/plite-react && bun test:vitest --run
  test/projected-collab-substrate-contract.test.ts` -> 3 pass, 0 fail.
  `bun --filter ./packages/plite-layout test` -> 51 pass, 0 fail.
- Type proof:
  `bun --filter plite typecheck`, `bun --filter plite-react typecheck`,
  `bun --filter plite-history typecheck`, and
  `bun --filter ./packages/plite-layout typecheck` passed during focused loops.
- Full gate:
  `bun check` in `.tmp/plite` passed: lint; package/site/root typecheck;
  Bun suite 1256 pass, 91 skip, 0 fail; slate-layout 51 pass, 0 fail;
  slate-react Vitest 59 files and 825 tests passed.
- Public main-root audit:
  `rg` for `roots: { main`, `roots.main`, `state.value.root('main')`,
  `value.root('main')`, `createEditorView(...root: 'main')`,
  `usePliteRoot*/usePliteHistory(...'main')` across docs/examples/source/tests
  found only deliberate rejection tests and one error string.
- Docs/source prose audit:
  safe `rg` for `main root`, `root 'main'`, and `root "main"` across
  docs/examples/source excluding old plans and generated output returned no
  matches.

Reboot status:
- Current state is ready for handoff. If resumed, start by running
  `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-06-15-plite-document-value-hard-cut-main-root.md` from
  `/Users/zbeyens/git/plate-2`, then complete the active goal if it passes.

Open risks:
- Internal APIs and low-level tests still use `"main"` as the private operation,
  projection, collaboration, and view-root sentinel. This is intentional. Public
  callers should omit the root for the primary document.
- Final contextual autoreview did not complete after 32 minutes. Earlier review
  passes found and drove accepted fixes; closure relies on full `bun check` plus
  deterministic audits for the remaining boundary.
