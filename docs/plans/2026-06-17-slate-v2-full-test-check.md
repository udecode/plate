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
- [ ] Run `bun check:full`.
- [ ] If failing, root-cause before patching.
- [ ] Fix safe root-cause failures or record blocker.
- [ ] Rerun focused proof after any fix.
- [ ] Rerun `bun check:full` after fixes or if first run is green.
- [ ] Record commands, results, open risks, and final verdict.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Full Slate v2 gate | yes | pending |
| Failure root-cause | pending | pending |
| Fix verification | pending | pending |
| No worktree/commit/PR | yes | current checkout only; no git mutation planned |
| Goal plan complete | yes | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | complete | Scope and explicit requirement captured. | full gate |
| Full gate | in_progress | pending | debug or close |
| Debug/fix | pending | pending | verification |
| Final verification | pending | pending | complete |

Verification evidence:
- Pending.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Before full gate. |
| Where am I going? | Run `bun check:full`, fix failures if any, close goal. |
| What is the goal? | Slate v2 full local test/check gate passes. |
| What have I learned? | Pending. |
| What have I done? | Created the goal plan and captured scope. |

Open risks:
- Pending full gate result.
