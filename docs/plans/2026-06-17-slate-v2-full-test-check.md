# slate-v2 full test check

Objective:
Make sure the Slate v2 current checkout passes the full local test/check gate.

Completion threshold:
- `bun check:full` passes in `/Users/zbeyens/git/plate-2/.tmp/slate-v2`, or
  every failure is root-caused, fixed when safe, and the full gate reruns green.
- If a failure is external or unavailable-environment-only, record the exact
  command, failure, reason, and next owner.

Verification surface:
- Primary command: `bun check:full` in `.tmp/slate-v2`.
- If it fails, run the smallest failing subcommand/test needed to root-cause the
  failure, then rerun the affected focused proof and the full gate.

Constraints:
- Current checkout only.
- Do not commit, push, create PR, switch branches, or use worktrees.
- Do not widen to parent Plate repo tests unless the Slate v2 full gate proves
  parent code is required.
- Use systematic debugging before patching any failure.

Boundaries:
- Target repo: `/Users/zbeyens/git/plate-2/.tmp/slate-v2`.
- Plan owner: `/Users/zbeyens/git/plate-2/docs/plans/2026-06-17-slate-v2-full-test-check.md`.
- Allowed edits: only safe fixes required to make the Slate v2 full gate honest
  and green.

Blocked condition:
- Stop only if the full gate needs unavailable browser/device/provider state,
  credentials, external service access, or a broad product/API decision.

Work Checklist:
- [x] First checkpoint captured: user asked for a last full check and all tests
      passing.
- [x] Scope resolved as Slate v2 `.tmp/slate-v2`, because the previous closure
      and changed files were there.
- [x] Run `bun check:full`.
- [x] Root-cause the only failure before patching.
- [x] Fix the safe root-cause failure.
- [x] Rerun focused proof after the fix.
- [x] Rerun `bun check:full` after the fix.
- [x] Record commands, results, open risks, and final verdict.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Full Slate v2 gate | yes | Final `bun check:full` passed in `.tmp/slate-v2`. |
| Failure root-cause | yes | Duplicate patch changesets tripped `release-scripts-contract.ts`: `slate-dom:patch:slate-dom-patch.md` and `slate-react:patch:slate-react-patch.md`. |
| Fix verification | yes | Focused release contract passed after consolidating duplicate changeset notes. |
| No worktree/commit/PR | yes | current checkout only; no git mutation planned |
| Goal plan complete | yes | All rows closed with command evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | complete | Scope and explicit requirement captured. | full gate |
| Full gate | complete | First run reached release discipline and failed on duplicate changesets; final run passed. | debug/fix |
| Debug/fix | complete | Consolidated duplicate `slate-dom` and `slate-react` patch changesets into the canonical package patch files. | verification |
| Final verification | complete | Focused release contract and full gate both passed. | complete |

Verification evidence:
- `bun check:full` in `.tmp/slate-v2` initially passed lint, typecheck,
  package/unit tests, and Vitest, then failed at `bun test:release-discipline`.
- Failure:
  - `packages/slate/test/release-scripts-contract.ts`
  - duplicate release rows:
    - `slate-dom:patch:slate-dom-patch.md`
    - `slate-react:patch:slate-react-patch.md`
- Root cause:
  - `.changeset/fresh-ranges-bow.md` duplicated the canonical `slate-dom`
    patch changeset.
  - `.changeset/silent-placeholders-smile.md` duplicated the canonical
    `slate-react` patch changeset.
- Fix:
  - Merged the structural-edit selection note into
    `.changeset/slate-dom-patch.md`.
  - Merged the inline placeholder note into
    `.changeset/slate-react-patch.md`.
  - Deleted the duplicate patch changeset files.
- Focused verification:
  - `bun test ./packages/slate/test/release-scripts-contract.ts`
  - Result: 8 pass, 0 fail.
- Final full verification:
  - `bun check:full`
  - Result: green.
  - Included lint, package/site/root typecheck, Bun tests, slate-react Vitest,
    release discipline, slate-browser proof contracts, scoped mobile proof, and
    `bun test:integration-local`.
  - Integration result: 2036 passed, 564 skipped across Chromium, Firefox,
    mobile, and WebKit in 12.0m.
- Mobile raw-device proof:
  - The full gate ran scoped semantic/proxy mobile proof.
  - Raw Android/iOS device proof is not claimed by this command; the command
    prints the explicit environment flag and artifact requirements for that
    separate lane.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Full Slate v2 gate is green. |
| Where am I going? | Close the autogoal after `check-complete`. |
| What is the goal? | Slate v2 full local test/check gate passes. |
| What have I learned? | The only blocker was duplicate patch changesets, not runtime test failure. |
| What have I done? | Consolidated duplicate changesets and reran focused plus full verification. |

Open risks:
- None for the Slate v2 local full gate.
- Raw Android/iOS device proof remains a separate device-lane claim, not part of
  this local full gate.
