# One owner for each test rule

Page: https://claude.ai/artifact/GHQuB996Hfdg6obqEDf8T5

Status: done
Playbook: refactoring

## Brief

### What will change?

Fast tests have their five second limit back in CI. A local run on a shared machine stops a test only after 30 seconds, as a hang. The table benchmark checks its time and memory budgets only when someone runs `pnpm bench:table`. Test-audit is now the one audit. It judges each test by both edits of the behavior principle, and its full mode covers the whole suite.

### What could go wrong?

A test that takes more than five seconds passes on your machine and fails only in CI. A slower table grid no longer blocks a landing, so it shows up only in `pnpm bench:table`. Test-audit's full mode has not run on a real suite yet. The smoke proved only that requests reach it.

## Teach

Test rules live in several places. pstack's principle says a good test fails when the behavior breaks and still passes when only the internals change. The shared Tests rule says when a test earns its place. Verify's testing reference says how to write and run one here. Two audits split the cleanup: verify's coverage audit hunts for untested files, and test-audit cuts weak tests.

Test-audit only checks the first half of the principle, and its name is easy to confuse with verify's testing audit. The last landing also gave every test 30 seconds. That made the five second rule false, so nothing judged test speed anymore.

Now CI holds each fast test to five seconds, as it did before the last landing, and a local run only stops a hung test, at 30 seconds. A first try scaled five seconds by the machine's load. It failed in the landing check, because the check's own parallel steps added load after the runner read it. Test-audit checks both halves, gains a whole-suite mode that also lists untested contracts, and verify's coverage audit goes away.

## Main changes

- `BUN_TEST_TIMEOUT_MS` in `tooling/config/test-suites.mjs`, which both Bun runners pass as `--timeout`, is `FAST_TEST_TIMEOUT_MS`, 5,000 ms, when `CI` is set and 30,000 ms otherwise. `plate/no-raised-test-timeout` reads `FAST_TEST_TIMEOUT_MS`, so CI enforces the lint's 5,000 ms promise.
- `packages/platejs/src/features/table/lib/internal/mutation.benchmark.slow.ts` checks its wall-clock and heap budgets only under `BENCH_MEASURE=1`, which the new `pnpm bench:table` sets, as the enforcement row on measured runs says. Its operation counts, cache counts, lookup identity and retained-table bound still block `test-slow`.
- `test-audit` in dotai judges a test by both edits of `principle-test-behavior-not-implementation`. It proves the second edit with a refactor of a scratch copy that keeps every observable result. Its full mode covers every tracked test file. It runs the suite-health scans and lists public contracts no test guards, with browser-only contracts under the browser proof, and it never writes a test. A request that only asks what is weak or missing stays read-only. The user-scope copy in `~/.agents/skills` is refreshed too, because the first smoke's Claude Code session loaded that old copy instead of the project's.
- `verify`'s `references/testing-audit.md` is deleted. `verify testing audit` now runs `test-audit`'s full mode, and `references/testing.md` keeps only mechanics and the commands the full mode reads.

## Capabilities moved

| Capability in `testing-audit.md` | Now owned by |
| --- | --- |
| Fresh `lcov` coverage as the gap source | `test-audit` full mode's gap list; the Bun command in `verify`'s testing reference |
| Fast-lane timing with `test:profile` and `test:slowest` | `verify`'s testing reference, which already holds both |
| Scans for skipped, commented-out and cross-spec tests | `test-audit` full mode's suite-health scans |
| Ranking files by the named defect a test would catch | `test-audit` full mode's gap list |
| Exclusions: barrels, declarations, type-only and generated files | `test-audit` full mode's gap list |
| Stop conditions | `test-audit` full mode's gap list stop rule, which lists browser-only contracts under the browser proof instead of dropping them |
| Architecture-safety targets | `test-audit` full mode's gap list, ranked by the defect a test would catch |
| Title debt scans | `test-audit` full mode's suite-health scans, as names that promise more than the input |
| Plate React `createEditor` allowlist scan | `verify`'s testing reference, Owner Selection |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Fast test time limit | Five seconds in CI, a 30 second hang limit on local runs (look) | Five seconds stretched by the host's load, which failed in the landing check | load scaled | big |
| Table benchmark budgets | Check time and heap only in `pnpm bench:table`, because they failed the landing at load 26 and passed at load 12 to 15 (look) | Keep them blocking and land when the host is quiet | table budgets block | small |
| Other timed slow tests | Offer moving their budgets to a measured run as a task | Move them now | gate all timers | small |
| Where the audit lives | Test-audit alone, shared with other projects (look) | Fold the audit into verify | audit in verify | big |
| Shared Tests rule wording | Leave it; offer the principle line as its own task | Change it now and sync every project | tests rule now | small |
| Other projects with test-audit | Offer their reinstall as a task | Reinstall in ellie and plate now | reinstall everywhere | small |
| Snapshot advice in verify | Drop the lines that allow snapshots, since the shared rule bans them; keep how to regenerate an existing snapshot file | Keep them as a Plate exception | keep snapshots | small |
| Review panel | Skipped, the change touches test tooling and agent docs, no public API or Plite core | Run a panel on the diff | panel | detail |

## Steps

- [x] Restore the five second limit in CI, with a 30 second hang limit locally, and point the lint at the same constant.
- [x] Move the table benchmark's time and heap budgets to a measured run.
- [x] Cut verify's coverage audit and move each job it did.
- [x] Teach test-audit both edits and a whole-suite mode in dotai, then push it.
- [x] Reinstall test-audit here and regenerate the skill copies.
- [x] Smoke the changed routes.
- [x] Land through `land.mjs --check 'pnpm check --affected'`.

## Open work

- Name the principle in the shared Tests rule. owner: suggested task. stop: none.
- Reinstall the new test-audit in ellie and plate. owner: suggested task. stop: none.
- Move the budgets of the other timed slow tests to a measured run. owner: suggested task. stop: none.

## Close

Landed in one commit on `next`, beside dotai commits 660c627, b9d2a41 and 067216b for test-audit.

- Both Bun runners give each case `BUN_TEST_TIMEOUT_MS`, 5,000 ms in CI and 30,000 ms on a local run. `plate/no-raised-test-timeout` reads the same 5,000 ms constant.
- The table benchmark's time and heap budgets run only in `pnpm bench:table`. Its work counts still block `test-slow`.
- Test-audit judges both edits and keeps a findings-only request read-only. Its full mode keeps a ledger by owner area, scans suite health, runs a flaky lane and lists untested public contracts, with browser-only ones under the browser proof. Verify's coverage audit is deleted, and `verify testing audit` runs test-audit's full mode.

Proof. A probe of the config printed 30,000 ms without `CI` and 5,000 ms with `CI=1`. The lint plugin tests passed 124 of 124 and the runner routing tests 9 of 9. The table benchmark passed blocking, 4 tests with the cold budget test skipped, and measured, 5 of 5 at load 12 to 15. Three smoke rounds in Claude Code and Codex routed a scoped prune and a whole-repo question to test-audit; that proves routing, not an audit run. The landing ran `pnpm check --affected`. CI's 5,000 ms limit has not run in CI yet.

Deviations. The first landing design scaled five seconds by the host's load. The landing check failed it twice: a layout case that takes 2.3 s alone took 6.4 s against a 5.4 s limit, because the check's own parallel steps loaded the host after the runner read the load. The same landing failed the table benchmark's sparse budget, which an earlier landing that day also failed. The comment review renamed the first design's constant, which this design replaced. The first smoke round found three clashes in the changed rules, which b9d2a41, 067216b and a reworded snapshot line in verify's testing reference fixed. The user-scope copy of test-audit was refreshed, because the first round's Claude Code session loaded that old copy.

The request had one ask, the test-rule cleanup with the timeout fix first, and it is done. The owner's "fast" dropped the Codex review for the rest of the run. Open work above waits on suggested tasks.
