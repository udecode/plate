# staged pagination perf

Objective:
One-shot execution: optimize staged pagination typing for
`/examples/pagination?page_layout=single&strategy=staged` in the 15-page
document. Completion requires a fresh Chromium proof with p95 event-to-paint
<= 16 ms, max event-to-paint <= 50 ms, model/DOM settle <= 250 ms for a
burst of at least 36 characters, no dropped or reordered text, and final model
selection matching the visible caret. Existing virtualized typing proofs must
still pass.

Goal plan:
`.tmp/slate-v2/docs/plans/2026-05-31-staged-pagination-perf.md`

Template:
`docs/plans/templates/task.md` with browser pack.

Task source:
- type: user-reported performance bug
- id / link: chat request, 2026-05-31
- title: staged pagination burst typing visible perf
- acceptance criteria: staged route meets the Objective metrics without
  regressing virtualized typing correctness or package/runtime contracts.

Completion threshold:
- Staged pagination browser proof on
  `/examples/pagination?page_layout=single&strategy=staged` records p95
  event-to-paint <= 16 ms, max event-to-paint <= 50 ms, model/DOM settle
  <= 250 ms, final text correct, and selection at `[43, 0]` offset `67`.
- Existing 1000-page virtualized middle-document and fast-burst typing rows
  pass in the same browser file.
- Focused `slate-react` unit contracts, typecheck, and lint pass.
- `node /Users/zbeyens/git/plate-2/.agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-staged-pagination-perf.md`
  passes from `.tmp/slate-v2`.

Verification surface:
- Browser: Playwright Chromium against `http://localhost:3100`, focused on
  staged pagination and virtualized regression rows.
- Tests: focused `slate-react` contracts for DOM repair, input routing,
  native input strategy, and provider hooks.
- Typecheck: `bun --filter slate-react typecheck`.
- Lint: `bun lint:fix`.

Constraints:
- Preserve public Slate API/DX.
- Keep edits in the runtime/input ownership path and pagination proof surface.
- No commit, PR, tracker comment, or release artifact was requested.

Boundaries:
- Source of truth: `.tmp/slate-v2`.
- Runtime owner: `packages/slate-react/src/editable/**` and selector hooks.
- Browser owner: `playwright/integration/examples/pagination.test.ts`.
- Example owner: `site/examples/ts/pagination.tsx` only for staged strategy
  setup.

Blocked condition:
Block only if the metric target requires changing product behavior or browser
tooling cannot provide reliable proof after repeated focused attempts.

Task state:
- task_type: performance bug
- task_complexity: normal
- current_phase: complete
- current_phase_status: complete
- goal_status: ready for closeout

Current verdict:
- verdict: complete
- confidence: high
- next owner: final response
- reason: All named metrics and focused gates passed.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `autogoal` loaded and used for measurable goal lifecycle |
| Active goal checked or created | yes | `get_goal` confirmed active staged pagination perf goal |
| Source of truth read before edits | yes | Plan, input router, DOM repair queue, selector hooks, and pagination tests read |
| Tracker comments and attachments read | no | N/A: chat-only request |
| Video transcript evidence required | no | N/A: no video attached for this request |
| TDD decision before behavior change or bug fix | yes | Added/activated focused unit contracts and staged browser perf proof |
| Release artifact decision | yes | N/A: no public package API or release artifact change |
| Browser route / app surface identified | yes | `/examples/pagination?page_layout=single&strategy=staged` |
| Browser tool decision recorded | yes | Playwright Chromium owns the perf proof for this route |

Work Checklist:
- [x] Objective includes outcome, threshold, verification surface, constraints,
      boundaries, and blocked condition.
- [x] Source and nearby runtime patterns read before edits.
- [x] Baseline staged typing metrics recorded before implementation.
- [x] Implementation fixes the runtime ownership boundary: selector fanout,
      projected native text, deferred repair reconciliation, and idle flush.
- [x] DOM repair contracts are included in Vitest via
      `dom-repair-policy-contract.test.ts`.
- [x] Browser proof covers staged visible typing, model text, and selection.
- [x] Virtualized typing regression rows pass.
- [x] Release artifact requirement recorded as N/A.
- [x] Branch, PR, and tracker handling recorded as N/A.
- [x] Agent-native review recorded as N/A: no agent/tooling files changed.
- [x] Review gate handled through focused source inspection plus unit, type,
      lint, and browser proof; no separate PR autoreview requested.
- [x] Final handoff evidence recorded below.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run staged browser proof | Final JSON: 46-char burst, settle 169.6 ms, p95 event-to-paint 8.2 ms, max event-to-paint 8.2 ms |
| Bug reproduced before fix | yes | Record failing baseline | Baseline staged proof failed: p95 142 ms, max 142 ms, settle 1459 ms, about 2041 element-path selector checks per insert |
| Targeted behavior verification | yes | Run focused unit and browser proof | 4 Vitest files / 58 tests passed; staged Playwright row passed |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun --filter slate-react typecheck` passed |
| Package exports or file layout changed | no | Barrel update not needed | N/A: no package export/barrel change |
| Package manifests, lockfile, or install graph changed | no | Install not needed | N/A: dependency graph unchanged |
| Agent rules or skills changed | no | Skill sync not needed | N/A: no `.agents`, `.codex`, or `.claude` edits |
| Workspace authority proof | yes | Run commands in owning checkout | All commands ran from `/Users/zbeyens/git/plate-2/.tmp/slate-v2` |
| Browser surface changed | yes | Run browser proof | Chromium staged and virtualized regression rows passed |
| Browser final proof | yes | Record exact metric proof | Final staged JSON metric: settle 169.6 ms, p95 8.2 ms, max 8.2 ms |
| CI-controlled template output changed | no | Restore output if touched | N/A: no template output intentionally changed |
| Package behavior or public API changed | yes | Changeset decision | N/A: internal runtime behavior/test change, no public API surface |
| Docs or content changed | no | Docs proof not needed | N/A: docs diffs are unrelated existing workspace state |
| High-risk mini gate | yes | Record failure mode and proof | Failure mode was stale deferred repair clobbering live native text; covered by DOM repair tests and staged burst browser proof |
| Agent-native review for agent/tooling changes | no | Review not needed | N/A: no agent-native files changed |
| Local install corruption suspected | no | Reinstall not needed | N/A: failures matched runtime/test behavior, not install rot |
| Autoreview for non-trivial implementation changes | yes | Close with focused review/proof | Focused source inspection plus unit/type/lint/browser gates passed; no PR review requested |
| PR create or update | no | PR work not needed | N/A: no PR requested |
| Tracker sync-back | no | Tracker sync not needed | N/A: no tracker |
| Final lint | yes | Run lint fix gate | `bun lint:fix` passed after fixing the whitespace regex lint and Playwright literal key lint |
| Goal plan complete | yes | Run autogoal checker | To run after this ledger update |
| Browser interaction proof | yes | Exercise target interaction | Staged burst typing test typed incremental text and 46-char burst into block `[43, 0]` |
| Browser console/network check | no | Console/network not primary | N/A: no console/network failure surfaced; perf proof owns this bug |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Baseline and source owner identified | done |
| Implementation | complete | Runtime selector/input/repair scheduler patched | done |
| Verification | complete | Unit, type, lint, staged, and virtualized browser gates passed | done |
| PR / tracker sync | n/a | No PR/tracker requested | done |
| Closeout | complete | Plan ready for checker and goal completion | final response |

Findings:
- Baseline staged typing was slow because plain text edits woke too much
  runtime path work: p95 event-to-paint 142 ms, max 142 ms, settle 1459 ms,
  3779 elements, and about 2041 `selector-element-path` checks per insert.
- After selector scoping, projected native text, and deferred repair changes,
  final staged proof is: 46-char burst, settle 169.6 ms, p95 event-to-paint
  8.2 ms, max event-to-paint 8.2 ms, p95 compose 2.9 ms.
- A first-input max timer was the wrong shape: it can flush while Chrome is
  still delivering a burst and corrupt the native buffer. A resettable idle
  flush is the durable boundary for staged text input.

Decisions and tradeoffs:
- `useElementPath` opts into root-order changes instead of all runtime-node
  changes, so text edits stay scoped while structural moves keep paths fresh.
- Projected text hosts can use native single-character input, which makes
  visible typing immediate in staged pagination.
- Deferred repair targets carry captured inserts, but repair reconciles against
  current Slate text so partial prior flushes do not duplicate text.
- Stale captured targets update model text without repairing the live caret;
  only the latest target that still owns the DOM selection moves the caret.
- Deferred staged/virtualized text uses a resettable 24 ms idle flush plus a
  long guard, avoiding first-input timer clobber during fast bursts.

Implementation notes:
- Added `native-text-input-delta.ts` so input target capture and DOM repair use
  the same text-delta logic.
- Renamed `dom-repair-policy-contract.ts` to
  `dom-repair-policy-contract.test.ts` so the DOM repair contracts actually run.
- Collapsed the staged final readiness poll into one in-page sample to avoid
  measuring Playwright round-trip overhead as editor settle time.

Review fixes:
- `bun lint:fix` initially failed on a non-top-level whitespace regex and
  literal-key access in the new Playwright helper. Both are fixed and lint now
  passes.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| 150 ms first-input max flush corrupted active bursts | 1 | Switch to resettable idle flush | Fixed with 24 ms idle flush |
| 16 ms idle flush fired too aggressively between delivered chars | 1 | Raise idle boundary | Fixed at 24 ms |
| Default Playwright final poll inflated settle metrics | 1 | Collapse final readiness into one in-page sample | Fixed |

Verification evidence:
- `bun --filter slate-react test -- dom-repair-policy-contract input-router-contract native-input-strategy-contract provider-hooks-contract`: passed, 4 files / 58 tests.
- `bun --filter slate-react typecheck`: passed.
- `bun lint:fix`: passed, no fixes applied on final run.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/pagination.test.ts --project=chromium --grep "middle-document typing|fast burst typing|staged burst typing" --reporter=line`: passed, 3 tests.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/pagination.test.ts --project=chromium --grep "staged burst typing" --reporter=json`: passed with staged metrics: burst length 46, settle 169.6 ms, p95 event-to-paint 8.2 ms, max event-to-paint 8.2 ms, p95 compose 2.9 ms.

Open risks:
None for the staged 15-page target. The longer-term risk is sustained typing
for much longer than the tested burst; the idle-flush contract is intentionally
safer than a first-input max timer, but a future live-collab lane may want a
true non-clobbering model sync during continuous typing.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker requested.
- Confidence line: High for staged pagination burst typing target.
- Browser check: Chromium staged and virtualized focused rows passed.
- Outcome: staged typing now stays visibly instant and settles under the
  named 250 ms model/DOM gate.
- Caveat: no full-browser sweep was run; this was a focused perf lane.
- Design:
  - Chosen boundary: shared Slate React input/repair runtime.
  - Why not quick patch: example-only throttling would hide the bug and keep
    stale deferred repair unsafe.
  - Why not broader change: pagination architecture was not the bottleneck
    after selector fanout and input repair were fixed.
- Verified: unit, typecheck, lint, staged browser proof, virtualized browser
  regression proof.

Final handoff / sync:
- PR: N/A
- Issue / tracker: N/A
- Browser proof: staged JSON metrics and focused regression rows recorded
- Caveats: no full suite and no PR sync requested

Timeline:
- 2026-05-31T11:42Z Goal plan created.
- 2026-05-31T11:46Z Baseline staged perf proof failed: p95 142 ms, max 142 ms,
  settle 1459 ms.
- 2026-05-31T12:33Z Final staged proof passed: settle 169.6 ms, p95 8.2 ms,
  max 8.2 ms.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Autogoal checker, mark goal complete, final response |
| What is the goal? | Make staged 15-page pagination burst typing fast under the named metrics |
| What have I learned? | Selector fanout and deferred repair ownership caused the visible lag/corruption |
| What have I done? | Patched runtime ownership, added tests, and passed focused proof |
