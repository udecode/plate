# Implement Slate v2 synced content roots

Objective:
Implement the accepted Slate v2 Synced Blocks / content-root projection plan in
`.tmp/slate-v2`. The implementation must add the canonical
`props.slots.contentRoot('body', options)` React DX, add runtime-local active
projection identity for repeated mounts of one root, add a Notion-style
`/examples/synced-blocks` route with duplicate/share and unsync behavior, and
prove the simple-editor-like writing flow with focused unit and browser tests.

Goal plan:
docs/plans/2026-05-26-implement-slate-v2-synced-content-roots.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Major source:
- type: accepted local architecture plan
- id / link: `docs/plans/2026-05-26-slate-v2-synced-content-roots.md`
- title: Slate v2 synced content roots
- decision to make: implement the accepted content-root slot, active projection
  identity, Synced Blocks example, and proof gates without changing ordinary
  void semantics.
- decision criteria: canonical example uses `props.slots.contentRoot(...)`;
  duplicate synced copies share one root; unsync clones only one copy; focus,
  selection, undo/redo, ArrowUp/Down, click-outside, delete, clipboard, and
  editable-void regressions are proven in the owning workspace.

Major lane:
- lane: architecture/public API plus browser implementation
- output type: code, example route, tests, release artifact if required, and
  execution evidence
- implementation expected: yes
- affected packages / surfaces: `.tmp/slate-v2/packages/slate-react`,
  `.tmp/slate-v2/packages/slate`, `.tmp/slate-v2/site/examples`,
  `.tmp/slate-v2/site/pages/examples/[example].tsx`,
  `.tmp/slate-v2/site/constants/examples.ts`,
  `.tmp/slate-v2/playwright/integration/examples`, and this execution plan.
- dominant risk: same-root multiple projections focusing or restoring history
  to the wrong mounted copy.

Completion threshold:
- The accepted plan is implemented in `.tmp/slate-v2`: content-root slot API,
  active projection identity, Synced Blocks route, duplicate/share and unsync
  behavior, focused unit tests, focused Playwright tests, and no ordinary-void
  behavior regression.
- Package/public API proof, release artifact classification, barrel/export
  handling, browser proof, lint/typecheck/test evidence, and review findings are
  recorded in this plan.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-implement-slate-v2-synced-content-roots.md`
  passes.

Verification surface:
- Source audit and implementation in `.tmp/slate-v2`.
- Focused package tests for `slate-react` content-root slots, active projection
  lookup, content-root navigation, and history focus restoration.
- `site` typecheck/lint or owning repo equivalents.
- Playwright proof for `/examples/synced-blocks` and relevant
  `/examples/editable-voids` regressions.
- Source DX audit:
  `rg "useSlate(ContentRoot|ChildRoot)|<Editable[^>]*root" site/examples/ts/synced-blocks.tsx`
  must show the canonical renderer does not teach hook plumbing.
- Completion checker for this plan.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- This goal explicitly includes implementation.
- Keep default voids atomic. Only content-root elements get document-flow root
  projection behavior.
- Keep Synced Blocks product chrome example-local; raw Slate owns the substrate,
  not Notion permissions, server sync, comments, or workspace copy policy.
- Prefer the durable runtime/API boundary over a route-local hack.

Boundaries:
- Source of truth: accepted plan
  `docs/plans/2026-05-26-slate-v2-synced-content-roots.md`.
- Allowed edit scope: `.tmp/slate-v2/packages/slate/**`,
  `.tmp/slate-v2/packages/slate-react/**`, `.tmp/slate-v2/site/**`,
  `.tmp/slate-v2/playwright/**`, `.tmp/slate-v2/.changeset/**` if required,
  this execution plan, and issue/reference ledgers only if implementation proof
  changes claim accounting.
- External sources: N/A unless current local repo and accepted plan disagree.
- Browser surface: `http://localhost:3100/examples/synced-blocks` and
  `http://localhost:3100/examples/editable-voids`.
- Tracker sync: no live tracker; issue/reference ledgers only if proof changes
  fixed/improved claims.
- Non-goals: slate-yjs adapter work, cross-workspace/server sync, Notion
  product parity, Plate wrappers, changing all void semantics, and PR creation.

Blocked condition:
- Block only if current `.tmp/slate-v2` source makes the accepted architecture
  impossible without changing a user-owned boundary, or a required package or
  browser gate fails in a way that cannot be reduced after three distinct fix
  attempts. Do not mark blocked while source reads, implementation, targeted
  tests, browser proof, or plan updates remain runnable.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: complete

Current verdict:
- verdict: implemented Option A from the accepted plan: one runtime, keyed roots
  as content identity, runtime-local projection identity for DOM focus, and
  `props.slots.contentRoot(...)` as the canonical renderer DX.
- confidence: 0.93 after package, browser, full fast check, and scoped review.
- next owner: user review or follow-up polish.
- reason: same-root mounted copies now have active-view focus routing, the
  canonical example hides low-level root plumbing, and browser rows prove shared
  edit, undo/redo focus, ArrowUp/Down, click-outside, duplicate/share, unsync,
  and editable-void regressions.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-implement-slate-v2-synced-content-roots.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `major-task` loaded | yes | `.agents/skills/major-task/SKILL.md` read before implementation. |
| Active goal checked or created | yes | Active goal created for implementation with this plan as durable state. |
| Source of truth read before analysis | yes | Accepted plan `docs/plans/2026-05-26-slate-v2-synced-content-roots.md` read before code edits. |
| Major lane selected | yes | architecture/public API plus browser implementation. |
| Decision criteria stated | yes | Criteria recorded under Major source and Completion threshold. |
| Existing repo patterns / prior decisions checked | yes | Accepted plan records current roots, slots, navigation, history, editable-voids, and issue accounting evidence; live source will be re-read before edits. |
| Helper stack selected | yes | `major-task` + `autogoal`; browser and package-api packs are materialized. `testing`, `tdd`, `changeset`, and browser tool will be loaded only when their gate is reached. |
| External research decision recorded | yes | N/A: accepted plan already used local sibling/source research; implementation starts from repo evidence. |
| Implementation expectation recorded | yes | This goal explicitly includes implementation. |
| Workspace authority selected | yes | `.tmp/slate-v2` owns source, package, site, and browser behavior; `plate-2` owns this execution plan and issue/reference ledgers. |
| Branch / PR expectation decided | yes | No PR requested; do not commit, push, or open PR. |
| Browser pack selected | yes | Browser pack selected for `/examples/synced-blocks` and editable-void regression proof. |
| Browser route / app surface identified | yes | `http://localhost:3100/examples/synced-blocks`; `http://localhost:3100/examples/editable-voids`. |
| Browser tool decision recorded | yes | Use repo-approved in-app Browser/browser-use first for local route proof; Playwright is still the test runner for committed browser tests. |
| Console/network caveat policy recorded | yes | Check console/network state during browser proof or record exact browser-tool blocker. |
| Package/API pack selected | yes | Package/API pack selected because `slate-react` public render props/slots change. |
| Public surface or package boundary identified | yes | `packages/slate-react` render-element slots and runtime projection lookup; possible `packages/slate` type touch. |
| Release artifact path selected | yes | `.changeset` expected if `slate-react` public behavior/types change; classify again after final diff. |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` loaded before adding `.tmp/slate-v2/.changeset/synced-content-root-slots.md`. |
| Barrel/export impact decision recorded | yes | No new exported file expected yet; run `bun`/repo barrel command only if exports or exported folders change. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
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
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | `bun check`, focused Playwright, in-app browser proof, scoped autoreview, and plan checker evidence recorded below |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | runtime, slot, history, route, type, and test owners re-read before edits |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | satisfied for slot DX, active projection identity, shared edit, unsync clone, browser navigation/focus, and editable-void regression rows |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | accepted-plan Option A implemented; ordinary voids and nested independent editors stayed rejected |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | autoreview final scoped run clean |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | accepted mouse-up activation finding fixed; unrelated branch-wide findings left out of scoped closeout |
| External-source audit | yes | Cite official/local clone/external sources when used, or record N/A | N/A: implementation used accepted local plan and live repo source |
| Implementation gates | yes | If code changed, close primary-template and touched-surface gates; otherwise N/A | code, example, tests, changeset, browser proof, and `bun check` complete |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | `.tmp/slate-v2`: `bun lint:fix` passed |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-implement-slate-v2-synced-content-roots.md` | final checker evidence below |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | in-app Browser and Playwright evidence recorded below |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Playwright runtime error guard passed for Synced Blocks undo/redo focus row; no in-app route/runtime error surfaced during manual proof |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | route proof is DOM/interaction evidence plus Playwright pass; no screenshot needed |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `slate-react` slot type changed in existing exported file; no new export/barrel needed |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | published `slate-react` API/runtime delta |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | `.tmp/slate-v2/.changeset/synced-content-root-slots.md` adds a `slate-react` minor; forbidden `@platejs/*` rule does not apply |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, update `docs/components/changelog.mdx` and do not add a package changeset | N/A: not registry-only |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: release artifact added |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `.tmp/slate-v2`: `bun --filter slate-react typecheck`, focused Vitest, and `bun check` passed |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no new exported file or exported folder layout change |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | accepted plan and live source owners read | current-state map |
| Current-state map | complete | slot, runtime, history, route, editable-voids, and tests mapped | implementation |
| Options and recommendation | complete | accepted-plan Option A implemented; rejected alternatives stayed out | review |
| Review / pressure pass | complete | autoreview scoped final run clean after fixing mouse-up activation | implementation decision |
| Implementation or plan artifact | complete | runtime active view tracking, content-root slot, Synced Blocks example/tests, route registration, custom type, and changeset added | verification |
| Verification | complete | focused unit/browser gates and `bun check` passed | closeout |
| Closeout | complete | final checker evidence recorded | final response |

Findings:
- `slate-react` had two runtime providers that both resolved a root to the
  first mounted view. Both now keep a runtime-local active view per root and
  rotate safely on unmount.
- A render-element content root must isolate its chrome from the parent
  `contenteditable`; the Synced Blocks example sets the owner section
  `contentEditable={false}` while the projected root remains editable.
- The canonical example can stay simple: `props.slots.contentRoot('body',
  options)` hides `useSlateContentRoot`, `useSlateChildRoot`, and manual
  `<Editable root>` plumbing.

Decisions and tradeoffs:
- Implemented active projection identity in runtime context rather than
  persisted document data. Root key remains content identity; mounted view
  identity remains DOM/runtime state.
- Implemented `props.slots.contentRoot(...)` instead of a public
  `<ContentRoot />` component. The slot has renderer-local access to the owner
  element, placeholder children, inherited renderers, and DOM coverage.
- Added duplicate/share and unsync as route-local example commands. Raw Slate
  does not own Notion permissions or server sync.
- Kept ordinary void semantics unchanged; editable-voids regression rows still
  pass.

Implementation notes:
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx` and
  `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx`: active mounted
  view tracking, active fallback, and unmount rotation.
- `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx`: editable
  roots mark their view active on focus, mouse-down, and mouse-up.
- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`:
  `EditableElementSlots.contentRoot(slot, options)` plus internal
  `EditableContentRootSlot` / `EditableContentRootView`.
- `.tmp/slate-v2/site/examples/ts/synced-blocks.tsx`: Notion-style local
  chrome, two shared copies, duplicate/share, and unsync clone.
- `.tmp/slate-v2/playwright/integration/examples/synced-blocks.test.ts`: route,
  shared edit, active-copy undo/redo, ArrowUp/Down, click outside,
  duplicate/share, and unsync proof.

Review fixes:
- Autoreview first reported one actionable finding in touched runtime code:
  `EditableDOMRoot` activated on focus and mouse-down but not mouse-up. Fixed by
  activating on mouse-up too.
- Autoreview also surfaced unrelated branch-wide `slate-layout` /
  `slate-browser` findings. They were outside this task's touched-file scope and
  were not accepted for this slice.
- Final scoped autoreview reported no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial Synced Blocks Playwright focus rows failed | 1 | Isolate content-root owner chrome from parent `contenteditable` | Added `contentEditable={false}` to the synced block owner section; Chromium route rows passed. |
| Initial `bun check` saw stale `slate-layout` type output | 1 | Run direct package check and rerun full check | `bun --filter slate-layout typecheck` and rerun `bun check` passed. |
| Codex autoreview helper hung with no output | 2 | Stop stale helper processes and use helper's no-tools engine fallback with explicit scope | Final scoped autoreview clean. |

Verification evidence:
- `.tmp/slate-v2`: `bun lint:fix` passed.
- `.tmp/slate-v2`: `bun lint` passed.
- `.tmp/slate-v2`: `bun --filter slate-react typecheck` passed.
- `.tmp/slate-v2/packages/slate-react`:
  `bun test:vitest -- test/slate-runtime-provider-contract.test.tsx test/use-slate-history.test.tsx`
  passed, `41` tests.
- `.tmp/slate-v2`: `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium`
  passed, `6` tests.
- `.tmp/slate-v2`: `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/synced-blocks.test.ts`
  passed, `18` passed and `6` intentionally skipped geometry/click rows outside
  Chromium.
- `.tmp/slate-v2`: `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "content root|vertically|clicking outside"`
  passed, `3` tests.
- `.tmp/slate-v2`: source DX audit
  `rg -n "useSlate(ContentRoot|ChildRoot)|<Editable[^>]*root" site/examples/ts/synced-blocks.tsx`
  returned no matches.
- In-app Browser at `http://localhost:3100/examples/synced-blocks`: route showed
  two synced blocks; typing `Live ` in the first synced root updated the second;
  clicking `p2` made the active root `main`.
- `.tmp/slate-v2`: `bun check` passed.
- `.tmp/slate-v2`: final scoped autoreview command:
  `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local --engine claude --no-tools --prompt "<touched-file scope>"`
  returned `autoreview clean: no accepted/actionable findings reported`.
- `plate-2`: final checker passed:
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-implement-slate-v2-synced-content-roots.md`
  returned
  `[autogoal] complete: docs/plans/2026-05-26-implement-slate-v2-synced-content-roots.md`.

Final handoff contract:
- Recommendation: accept the implementation for review. The architecture matches
  the accepted plan: root identity stays data-owned, projection identity stays
  runtime-local, and the example teaches the public slot API.
- Confidence: 0.93.
- Evidence: runtime, public API, route, tests, changeset, browser proof,
  `bun check`, and scoped autoreview are complete.
- Tests / commands: recorded under Verification evidence.
- Browser proof: Playwright plus in-app Browser proof recorded.
- PR / tracker: no PR requested; no live tracker sync required.
- Caveats: slate-yjs adapter work, Plate product wrappers, cross-workspace sync,
  and issue fixed/improved claim promotion remain non-goals.
- Next owner: user review or follow-up polish.

Timeline:
- 2026-05-26T09:38:22.573Z Major-task goal plan created.
- 2026-05-26T09:50Z Implemented runtime active view tracking and content-root
  slot API.
- 2026-05-26T10:05Z Added Synced Blocks example, route registration, custom
  type, Playwright coverage, and changeset.
- 2026-05-26T10:18Z Fixed browser focus failures by isolating the synced block
  owner section from the parent editable.
- 2026-05-26T10:58Z `bun check` passed.
- 2026-05-26T11:25Z Accepted autoreview mouse-up activation finding fixed and
  scoped autoreview rerun clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Implementation and closeout are complete. |
| Where am I going? | Final response after plan checker and goal closure. |
| What is the goal? | Implement the accepted Slate v2 Synced Blocks content-root projection plan. |
| What have I learned? | Same-root projection needs both active runtime view identity and DOM isolation from the parent editable. |
| What have I done? | Added runtime active view tracking, content-root slot DX, Synced Blocks example/tests, changeset, browser proof, `bun check`, and scoped autoreview closure. |

Open risks:
- slate-yjs root-keyed adapter work remains a future non-claim.
- Plate-level synced-block product wrappers, persistence, permissions, and
  cross-page sync remain future work.
