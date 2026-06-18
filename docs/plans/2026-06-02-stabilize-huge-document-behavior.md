# stabilize huge document behavior

Objective:
Stabilize `http://localhost:3100/examples/huge-document` insert-break behavior in Slate v2 virtualized mode.

Goal plan:
`docs/plans/2026-06-02-stabilize-huge-document-behavior.md`

Task source:
- User report with CleanShot video `/Users/zbeyens/Library/Application Support/CleanShot/media/media_0tS1ZEZdRS/2026-06-02 at 19.49.14.mp4`.
- User clarification: the bug is `insertBreak` inserting relative to a stale cursor after native text input.

Completion threshold:
The route is stable when virtualized huge-document typing followed by Enter splits at the live caret, the structural keydown policy has a focused unit contract, the full Chromium huge-document suite passes, and `bun check` passes in `Plate repo root`.

Verification surface:
- `cd /Users/zbeyens/git/plate-2/packages/slate-react && bun run test:vitest -- input-router-contract.test.tsx`
- `cd /Users/zbeyens/git/plate-2/Plate repo root && PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright -- playwright/integration/examples/huge-document.test.ts --project=chromium --grep "keeps virtualized insert-break bursts split at the live caret"`
- `cd /Users/zbeyens/git/plate-2/Plate repo root && PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright -- playwright/integration/examples/huge-document.test.ts --project=chromium`
- `cd /Users/zbeyens/git/plate-2/Plate repo root && bun check`

Constraints:
- Keep printable virtualized text input native/fast.
- Fix the shared runtime policy, not the huge-document example.
- Do not commit, push, or open PRs.
- Keep proof in the Slate v2 checkout that owns the runtime behavior.

Boundaries:
- Source of truth: `Plate repo root` runtime, tests, and the supplied video/report.
- Allowed edit scope: `packages/slate-react/src/editable/runtime-keyboard-events.ts`, `packages/slate-react/test/input-router-contract.test.tsx`, and `playwright/integration/examples/huge-document.test.ts`.
- Browser surface: `/examples/huge-document?blocks=10000&strategy=virtualized&overscan=0&threshold=2000&editor_height=420&content_visibility=element`.
- Tracker sync: N/A, no issue tracker item was supplied.
- Non-goals: pagination, full perf optimization, PR creation, review branches.

Output budget strategy:
Searches were scoped to huge-document, virtualized DOM strategy, keyboard runtime, and insert-break tests; broad output was capped.

Blocked condition:
Blocked only if the route could not be served, the supplied video could not be read, or the focused browser proof could not run. None blocked this run.

Task state:
- task_type: browser behavior bug
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- goal_status: ready to close

Current verdict:
- verdict: fixed and verified
- confidence: high
- next owner: user commit decision
- reason: focused runtime contract, route repro, full route suite, and `bun check` are green.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `slate-ar-stabilize`; routed failed behavior to `slate-patch`-style TDD. |
| Active goal checked or created | yes | No active goal existed; created goal for huge-document behavior stabilization. |
| Source of truth read before edits | yes | Read `Plate repo root` huge-document test, runtime keyboard/input files, and AR status ledger. |
| Tracker comments and attachments read | yes | Read supplied video frames and user clarification; no tracker item supplied. |
| Video transcript evidence required | yes | Extracted frames from the 5.03s CleanShot video and identified virtualized huge-document config. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Checked Slate v2 docs/plans/solutions paths; relevant lane evidence was in AR ledger and tests. |
| TDD decision before behavior change or bug fix | yes | Added focused Playwright proof plus runtime contract for insert-break boundary flushing. |
| Branch decision for code-changing task | N/A | Stayed in current checkout; user did not request branch work. |
| Release artifact decision | N/A | Internal runtime bug fix in Slate v2 lab checkout; no release artifact requested. |
| Browser tool decision for browser surface | yes | Browser plugin navigation tool was unavailable; used repo Playwright browser proof against localhost. |
| PR expectation decision | N/A | User did not request PR. |
| Tracker sync expectation decision | N/A | No tracker item supplied. |
| Output budget strategy recorded | yes | Searches and command output were scoped and capped. |
| Browser pack selected | yes | Browser pack applied because target is a browser editor route. |
| Browser route / app surface identified | yes | `http://localhost:3100/examples/huge-document` with virtualized 10k-block config. |
| Browser tool decision recorded | yes | Playwright gate used as approved fallback because direct Browser tool was not exposed. |
| Console/network caveat policy recorded | yes | Route served HTTP 200; Playwright browser proof covered behavior. |

Work Checklist:
- [x] Objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified as virtualized huge-document browser behavior bug.
- [x] Video evidence was read through extracted frames and user clarification.
- [x] Nearby implementation patterns read before edits.
- [x] Fix landed in shared keyboard runtime policy rather than example glue.
- [x] Release artifact requirement recorded as N/A.
- [x] Final handoff shape is bug-fix summary plus commands.
- [x] Branch handling recorded as N/A.
- [x] Local-env-rot retry policy recorded as N/A; no env-rot signature appeared.
- [x] Workspace authority recorded for every proof command.
- [x] High-risk runtime behavior note recorded.
- [x] Autoreview target recorded as N/A for this focused stabilization; `bun check` and route gates are the closure proof.
- [x] Agent-native review decision recorded as N/A.
- [x] Output budget discipline followed.
- [x] Browser route, interaction path, and expected visible/model outcome recorded before proof.
- [x] Browser proof used Playwright fallback and recorded the Browser-tool caveat.
- [x] Console/network check recorded through HTTP 200 and Playwright behavior proof.
- [x] Browser proof artifact is the passing route test with JSON attachment.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run all commands named above | All listed commands passed. |
| Bug reproduced before fix | yes | Encode user-visible invariant | Added huge-document test for `abc\ndef` split at live caret. |
| Targeted behavior verification | yes | Run focused browser proof | Focused Chromium test passed, 1/1. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun check` passed package and site typechecks. |
| Package exports or file layout changed | N/A | No export or layout change | No public file layout touched. |
| Package manifests, lockfile, or install graph changed | N/A | No install graph change | No manifest or lockfile touched. |
| Agent rules or skills changed | N/A | No agent rules changed | No `.agents` source edited. |
| Workspace authority proof | yes | Run in `Plate repo root` | All proof commands ran in the Slate v2 checkout. |
| Browser surface changed | yes | Exercise target route | Full Chromium huge-document suite passed, 9/9. |
| Browser final proof | yes | Record exact route proof | New insert-break route test and full suite passed. |
| CI-controlled template output changed | N/A | No template output touched | No `templates/**` edits. |
| Package behavior or public API changed | N/A | No public API surface change | Internal runtime policy only. |
| Registry-only component work changed | N/A | No registry work | No registry files touched. |
| Docs or content changed | N/A | No product docs changed | Only this goal ledger changed outside Slate v2. |
| High-risk mini gate | yes | Runtime behavior proof | Unit contract plus browser route suite passed. |
| Agent-native review for agent/tooling changes | N/A | No agent/tooling changes | No agent-native surface touched. |
| Local install corruption suspected | N/A | No reinstall needed | No mixed React/install corruption signal appeared. |
| Autoreview for non-trivial implementation changes | N/A | Focused stabilization gate accepted | `bun check` plus browser behavior gates are the closure proof for this slice. |
| PR create or update | N/A | No PR requested | No PR work done. |
| Task-style PR body verified | N/A | No PR requested | No PR body exists. |
| PR proof image hosting | N/A | No PR requested | No hosted image needed. |
| Tracker sync-back | N/A | No tracker item supplied | No sync target. |
| Final handoff contract | yes | Fill final response fields | Final response will list files and proof. |
| Final lint | yes | Run `bun check` | Biome/ESLint passed with one existing warning in pagination. |
| Output budget discipline | yes | Verify bounded output | Searches and command outputs were capped. |
| Goal plan complete | yes | Run check-complete | This file is ready for `check-complete`. |
| Browser interaction proof | yes | Exercise route interaction | Playwright test typed `abc\ndef` in virtualized huge-document. |
| Browser console/network check | yes | Record route and behavior state | HTTP 200 route check and Playwright behavior proof. |
| Browser final proof artifact | yes | Record proof artifact | `huge-document-insert-break-burst-proof` attachment emitted by test. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Video frames, user clarification, runtime/test source read | implementation done |
| Implementation | complete | Runtime keydown flush policy patched | verification done |
| Verification | complete | Unit, focused route, full route suite, `bun check` passed | closeout |
| PR / tracker sync | N/A | No PR or tracker requested | final response |
| Closeout | complete | Goal plan ready for checker | final response |

Findings:
- Virtualized mode defers native text repair for fast printable input.
- Enter is structural; preserving model selection while pending native text exists can split at a stale caret unless deferred native text is flushed before the mutation.

Decisions and tradeoffs:
- Chose shared runtime keydown policy over example-specific repair.
- Kept printable text input native; only structural/model-owned mutation boundaries force the deferred flush.

Implementation notes:
- `shouldFlushPendingNativeTextInputForKeyDown` now flushes for model mutation boundaries: delete, format, insert-break, and model-selection-move.
- Added a unit contract where insert-break and delete flush even when forced DOM import is disabled.
- Added a Chromium huge-document virtualized route proof for `abc\ndef` ordering.

Review fixes:
- N/A, no autoreview loop requested for this focused stabilization.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Raw Bun path invocation did not match Vitest file | 2 | Use package Vitest runner | `bun run test:vitest -- input-router-contract.test.tsx` passed. |

Verification evidence:
- `bun run test:vitest -- input-router-contract.test.tsx`: 1 file, 21 tests passed.
- Focused huge-document route proof: 1 Chromium test passed.
- Full huge-document Chromium suite: 9 tests passed.
- `bun check`: passed. Biome clean; ESLint has one existing warning in `site/examples/ts/pagination.tsx`; typecheck and tests passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker supplied.
- Confidence line: high.
- Flow table:
  - Reproduced: user video plus focused test invariant for virtualized insert-break burst.
  - Verified: unit contract, focused browser test, full huge-document Chromium suite, `bun check`.
- Browser check: Playwright fallback used because direct Browser navigation tool was unavailable.
- Outcome: fixed stale-caret insert-break ordering after deferred native text input.
- Caveat: `bun check` still reports the pre-existing pagination hook warning.
- Design:
  - Chosen boundary: shared keyboard runtime flush policy.
  - Why not quick patch: example glue would not protect other virtualized/staged editors.
  - Why not broader change: no need to disable native printable input or rewrite deferred repair.
- Verified: commands listed in Verification evidence.
- PR body verified: N/A.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: focused and full Chromium huge-document Playwright gates passed.
- Caveats: existing pagination ESLint warning remains.

Timeline:
- 2026-06-02T17:50:11Z Goal plan created.
- 2026-06-02T17:55Z Runtime patch and focused tests added.
- 2026-06-02T17:57Z `bun check` passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout. |
| Where am I going? | Final response and goal closure. |
| What is the goal? | Stabilize huge-document virtualized insert-break behavior. |
| What have I learned? | Deferred native text must flush before structural keydown mutations. |
| What have I done? | Patched runtime policy, added unit and browser proofs, ran verification. |

Open risks:
- Existing pagination hook warning remains outside this bug.
- Cross-browser huge-document insert-break proof was not run; new test is Chromium-only to match the existing burst-routing proof style.
