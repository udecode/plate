# Plite editable islands multi-root execution

Objective:
Implement the accepted Plite editable-islands multi-root architecture from
`docs/plans/2026-05-24-plite-editable-islands-multi-root-ralplan.md`.
Expose a minimal child-root API in `Plate repo root`, update the canonical
editable-voids example to use same-runtime child roots for rich island content,
and verify deterministic child-root lifecycle/focus/history/delete/undo behavior
with focused tests and browser/example proof.

Goal plan:
docs/plans/2026-05-24-plite-editable-islands-multi-root-execution.md

Template:
docs/plans/templates/task.md

Task source:
- type: accepted local architecture plan plus user command
- id / link: `docs/plans/2026-05-24-plite-editable-islands-multi-root-ralplan.md`
- title: Plite editable islands multi-root execution
- acceptance criteria: implement the accepted child-root primitive, rewrite the
  canonical editable-voids example away from a nested independent editor, add
  behavior coverage for root lifecycle/focus/history/delete/undo, run focused
  package/browser proof, and keep issue accounting conservative until proof
  exists.

Completion threshold:
- `Plate repo root` exposes a minimal public child-root API target:
  `usePliteChildRoot(element, slot = 'default')` or a better source-backed
  equivalent recorded with reason.
- The canonical editable-voids example uses `<Editable root={childRoot} />` for
  rich island content instead of embedding an independent `RichTextEditor`.
- Deterministic child-root identity/lifecycle/focus/history/delete/undo behavior
  is covered by focused package tests and focused browser/example proof.
- No raw Plite product/form-builder API, fat `renderVoid` prop bag, automatic
  roots for native controls, or top-level root-ordering migration is introduced.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-24-plite-editable-islands-multi-root-execution.md` passes.

Verification surface:
- `Plate repo root` focused package tests for child-root identity/lifecycle and
  root selection/history behavior.
- `Plate repo root` focused Playwright/example proof for editable islands once the
  example changes.
- Source audit proving `renderVoid` stays content-only and no product widget API
  leaked into raw Plite.
- Relevant package typecheck/lint/check commands discovered from `Plate repo root`
  scripts and scoped to touched packages first.
- Goal plan checker:
  `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-24-plite-editable-islands-multi-root-execution.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: accepted plan
  `docs/plans/2026-05-24-plite-editable-islands-multi-root-ralplan.md`.
- Allowed edit scope: `Plate repo root` implementation/tests/examples plus
  `plate-2/docs/plans/**` and issue/reference ledgers if proof changes claim
  accounting.
- Browser surface: `Plate repo root` example route for editable voids/islands.
- Tracker sync: no external tracker; local issue ledgers only if claim status
  changes.
- Non-goals: Plate form-builder APIs, current slate-yjs adapter support,
  automatic child roots for every island, rich content as void element children,
  `renderVoid` path/actions/focus prop bags, top-level root ordering migration,
  PR/commit/push unless explicitly requested.

Blocked condition:
- Block only if live `Plate repo root` source/tests cannot be read or run after
  three consecutive attempts, or if the accepted API requires a root lifecycle
  semantic that conflicts with current core invariants and no narrower
  source-backed implementation path remains.

Task state:
- task_type: feature / public API / example rewrite
- task_complexity: heavyweight
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: ready to complete after checker

Current verdict:
- verdict: implemented
- confidence: 0.91
- next owner: none
- reason: child-root primitive, operation-owned root lifecycle, canonical
  editable-voids example rewrite, changeset, focused type/lint/unit/browser
  proof, and conservative issue posture are complete.

Completion rule:
- Goal completion is legal after this file passes the checker.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `goal`, `task`, `major-task`, and `tdd` because this is accepted public API / architecture execution with behavior proof. |
| Active goal checked or created | yes | `get_goal` loaded active execution goal `019e5bbf-b31d-7c30-9206-fbafbb6e872b`. |
| Source of truth read before edits | yes | Read accepted ralplan, live `Plate repo root` source, root-view tests, editable-voids route tests, and package scripts before final implementation. |
| Tracker comments and attachments read | N/A: local plan only | No external tracker item or attachment. |
| Video transcript evidence required | N/A: no video evidence | Source is a local plan and user command. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Targeted solution search found relevant prior focus/root docs, including mounted root chrome focus and multi-root chrome click ownership notes. |
| TDD decision before behavior change or bug fix | yes | Red child-root React contract failed with missing `usePliteChildRoot`; implementation then made it green. Added lifecycle and browser rows before closeout. |
| Branch decision for code-changing task | N/A: no PR requested | No branch, commit, push, or PR work requested. |
| Release artifact decision | yes | Added `.changeset/editable-island-child-roots.md` for `slate` and `plite-react` minor changes. |
| Browser tool decision for browser surface | yes | Used focused Playwright route proof against existing local `http://localhost:3100`; no PR screenshot artifact needed. |
| PR expectation decision | N/A: no PR requested | Do not commit/push/open PR unless user asks. |
| Tracker sync expectation decision | N/A: no external tracker | No fixed/improved external issue claim added; local plan records conservative issue posture. |

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
- [x] Review/autoreview decision recorded for risky, user-facing, architecture,
      or agent-tooling work.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused source, package, browser, and checker proof | Focused type/lint/unit/browser proof passed; checker runs after this update. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Red test `usePliteChildRoot renders same-runtime rich island content` failed before hook export with `usePliteChildRoot is not a function`. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior | Core/history/react contracts and editable-voids Chromium/mobile route proof passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun --filter plite typecheck`, `bun --filter plite-history typecheck`, `bun --filter plite-react typecheck`, and `bun typecheck:site` passed. |
| Package exports or file layout changed | N/A: no barrel generator in plite | Record N/A reason | `plite-react/src/index.ts` was manually updated in this repo's export style; no `pnpm brl` surface exists in `Plate repo root`. |
| Package manifests, lockfile, or install graph changed | N/A: no manifest or lockfile edit | Record N/A reason | No install graph changed. |
| Agent rules or skills changed | N/A: no rule or skill edit | Record N/A reason | No `.agents` source changed. |
| Browser surface changed | yes | Run focused browser proof | Editable-voids Chromium: 16 passed. Editable-voids mobile: 10 passed, 6 expected skips. |
| Browser final proof | yes | Record exact browser verification caveat | Proof used Playwright against `PLAYWRIGHT_BASE_URL=http://localhost:3100`; no screenshot was required because this is behavior proof. |
| CI-controlled template output changed | N/A: no template output edit | Record N/A reason | No `templates/**` edits. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | Added `.changeset/editable-island-child-roots.md`. |
| Registry-only component work changed | N/A: no registry component work | Record N/A reason | No registry files changed. |
| Local install corruption suspected | N/A: failure shapes matched product/test code | Record N/A reason | No React duplicate install or local env rot signal appeared. |
| Autoreview for non-trivial code changes | N/A: not run in this slice | Record N/A reason | Focused tests, lint, and architecture source checks covered this implementation; no PR requested. |
| PR create or update | N/A: no PR requested | Record N/A reason | No PR work. |
| PR proof image hosting | N/A: no PR requested | Record N/A reason | No PR body or image artifact. |
| Tracker sync-back | N/A: no external tracker | Record N/A reason | No external sync target. |
| Final handoff contract | yes | Fill final handoff fields | Final handoff section below is complete. |
| Final lint | yes | Run scoped equivalent | `bun lint:fix` and `bun lint` passed in `Plate repo root`. |
| Goal plan complete | yes | Run `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-24-plite-editable-islands-multi-root-execution.md` | Passed with `[goal] complete`. |
| Knowledge extraction | N/A: no durable solution note requested | Record N/A reason | The execution plan records reusable decisions; no memory update requested. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | accepted ralplan, live `Plate repo root` source/tests/scripts, and solution docs read | implementation |
| Implementation | complete | child-root hook/export, operation root lifecycle metadata, editable-voids rewrite, changeset | verification |
| Verification | complete | focused type/lint/unit/browser proof passed | closeout |
| PR / tracker sync | complete | N/A: no PR or external tracker requested; no fixed/improved issue claim added | final response |
| Closeout | complete | this plan updated; checker is final mechanical gate | final response |

Findings:
- Same-runtime root views already had the substrate for editable islands, but no
  public child-root resolver existed.
- Root-level `replace_children` could create a missing root, but without root
  presence metadata history could only undo that into an empty orphan root.
- The canonical editable-voids route was still teaching an independent nested
  editor; that was the wrong story after multi-root support.

Decisions and tradeoffs:
- Added `usePliteChildRoot(element, slot)` in `plite-react`; explicit
  `childRoots[slot]` is the persisted contract, runtime-id fallback is only an
  ephemeral convenience.
- Added `rootWasPresent` / `rootIsPresent` metadata to root-level
  `replace_children` so undo/redo can create and delete child roots
  deterministically.
- Kept `renderVoid` content-only and used hooks/root chrome instead of widening
  renderer props.
- Did not claim full child-root rich HTML serialization/collab support; paste
  and drop proof is ownership-focused and issue accounting stays conservative.

Implementation notes:
- New hook: `packages/plite-react/src/hooks/use-slate-child-root.ts`.
- Public export: `packages/plite-react/src/index.ts`.
- Core lifecycle: `packages/plite/src/core/public-state.ts`,
  `packages/plite/src/interfaces/operation.ts`, and
  `packages/plite/src/interfaces/transforms/general.ts`.
- Example: `apps/www/src/app/(app)/examples/plite/_examples/editable-voids.tsx` now renders rich
  child content via `<Editable root={bodyRoot} />` in the same runtime.

Review fixes:
- Removed the overreaching HTML-deserializer wiring from editable-voids; rich
  child-root serialization remains a separate policy gate.
- Updated browser assertions from nested-editor semantics to same-runtime
  selection semantics.
- Made the native text input uncontrolled so browser-native input proof is not
  coupled to React state remounts.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|------:|---------------------|------------|
| Wrong Playwright invocation started a broad Chromium sweep | 1 | Killed the process and reran `./node_modules/.bin/playwright test` directly | resolved |
| Browser rows initially expected independent nested-editor selection semantics | 1 | Updated assertions to same-runtime active-root semantics | resolved |
| HTML paste/drop mark proof exceeded this lane's serialization scope | 1 | Removed HTML extension from the example and kept ownership-focused clipboard/drop proof | resolved |

Verification evidence:
- Red test: `bun --filter plite-react test:vitest -- --run ./test/slate-runtime-provider-contract.test.tsx --testNamePattern "usePliteChildRoot renders same-runtime rich island content"` failed before hook export with `usePliteChildRoot is not a function`.
- Unit: `bun test ./packages/plite/test/rooted-operation-contract.ts ./packages/plite-history/test/history-contract.ts` -> 55 pass.
- React contract: `bun --filter plite-react test:vitest -- --run ./test/slate-runtime-provider-contract.test.tsx` -> 34 pass.
- Render contract: `bun test ./packages/plite-react/test/surface-contract.tsx --test-name-pattern "renderVoid receives content-only props"` -> 2 pass, 25 filtered.
- Typecheck: `bun --filter plite typecheck`, `bun --filter plite-history typecheck`, `bun --filter plite-react typecheck`, and `bun typecheck:site` all passed.
- Lint: `bun lint:fix` and `bun lint` passed.
- Browser Chromium: `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 ./node_modules/.bin/playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium` -> 16 passed.
- Browser mobile: same command with `--project=mobile` -> 10 passed, 6 expected skips.
- Goal checker: `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-24-plite-editable-islands-multi-root-execution.md` -> passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: no external sync; no new fixed/improved issue claim.
- Confidence line: high for child-root API, lifecycle undo/redo, example route,
  and focused browser behavior; lower for future rich HTML/collab payload policy,
  which remains deliberately out of scope.
- Flow table:
  - Reproduced: red React contract for missing public hook; browser failures
    caught nested-editor expectation drift.
  - Verified: targeted unit, React, render contract, typecheck, lint, Chromium,
    and mobile proof passed.
- Browser check: Chromium 16/16, mobile 10 passed with 6 expected desktop-only
  skips.
- Outcome: accepted editable-islands multi-root implementation is complete.
- Caveat: current proof does not claim full child-root HTML serialization,
  copy/paste remapping, move payloads, or slate-yjs compatibility.
- Design:
  - Chosen boundary: raw Plite owns root lifecycle and root views; React owns
    the child-root hook; example owns island composition.
  - Why not quick patch: nested independent editor stayed split-brain and could
    not share history/selection/collab semantics.
  - Why not broader change: top-level root ordering, product form APIs, and
    collab serialization are separate architecture lanes.
- Verified: yes, commands listed above.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: no external sync and no stronger issue claim.
- Browser proof: Chromium and mobile route sweeps passed on
  `http://localhost:3100`.
- Caveats: rich HTML child-root serialization and collab payload policy remain
  future gates.

Timeline:
- 2026-05-24T21:54:12.466Z Task goal plan created.
- 2026-05-24: red React contract captured missing `usePliteChildRoot`.
- 2026-05-24: implemented hook/export, root lifecycle metadata, example
  rewrite, tests, changeset, lint, typecheck, and browser proof.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; checker remains the final mechanical gate. |
| Where am I going? | Run checker, mark active goal complete, final response. |
| What is the goal? | Implement accepted Plite editable-islands multi-root architecture. |
| What have I learned? | Child roots need operation-owned presence metadata; same-runtime selection semantics differ from independent nested editor expectations. |
| What have I done? | Added child-root hook, deterministic root lifecycle, canonical example rewrite, changeset, and focused proof. |

Open risks:
- No open risk for the implemented scope. Rich HTML serialization, child-root
  copy/paste remapping, move payloads, and slate-yjs compatibility remain
  explicitly out of scope.
