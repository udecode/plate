# Test runners run stale spec copies

Status: executed, waiting on PR review
Page: https://claude.ai/artifact/54MpwC1HhHons4z7xJWvcR
Playbook: bug-fix

## Brief

### What will change?

The local test and check commands stop running old test copies left in
ignored folders. A local check then passes or fails on the real tests only.

### What could go wrong?

A test file that git ignores no longer runs, even inside a package folder. Two
rare path spellings could hide a real test; that stays open with an owner.

## Teach

The test runners find the repository's spec files, then hand their paths to
Bun to run them.

Two things let old copies in. Bun reads a plain relative path as a search
word and runs every file whose path contains it, so copies kept in ignored
plan folders ran too. And the file search also picked up ignored folders
inside packages, such as build output.

Now the fast runner marks each path as relative to the current folder, which
Bun treats as one exact file, and all three runners keep only files that git
does not ignore.

## Scope

Brief `task_2c0eded9`, written 2026-10-13, asked to make test discovery in
`tooling/scripts/test-fast.mjs` and the test-slowest script skip git-ignored
paths, to add a test that fails when a test file under `docs/plans/artifacts/`
is discovered, and to prove `pnpm check` passes in a checkout that holds such a
snapshot.

The tree on 2026-10-14 showed the brief's mechanism was only half right. Discovery globs are rooted at `apps/`, `packages/` and
`tooling/scripts/`, and on this checkout they listed zero git-ignored files.
The copies under `docs/plans/artifacts/` ran because `runFiles` passed bare
paths, which Bun reads as substring filters over every file path. The panel
then showed that ignore rules such as `**/build` do match folders inside the
roots, so discovery also filters by git as the brief asked.
`test-slowest.mjs` runs through `test-fast.mjs`, so it needs no change of its
own.

## Main changes

- `test-fast.mjs` passes `./`-prefixed paths to `bun test`, as `test-slow.mjs`
  and `test-deferred.mjs` already did.
- `findGitVisibleTestFiles` in `tooling/config/test-suites.mjs` keeps only
  glob matches that `git ls-files --cached --others --exclude-standard` lists.
  The fast, slow and deferred runners use it.
- `tooling/scripts/**/*.slow.test.mjs` joins the slow lane, and the fast lane
  ignores it through `TEST_FAST_IGNORE_PATTERNS`.
- `tooling/scripts/test-fast.slow.test.mjs` runs the real fast runner on a
  temp git fixture, once with a failing copy under `docs/plans/artifacts/` and
  once with a failing spec under an ignored `packages/demo/build/`.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the fix goes | Exact paths to Bun and a git ignore filter | Only exact paths to Bun | pathsonly | small |
| Runner test lane | Slow lane, since each case takes over 100 ms | Fast lane over its 75 ms limit | fastlane | detail |

## Steps

- [x] Reproduce. Proof: `bun test packages/markdown/src/lib/plugins/remarkMdx.spec.ts` ran 3 files with 2 failures, two of them under `docs/plans/artifacts/pr-5159-babysit/`; `bun test ./packages/markdown/src/lib/plugins/remarkMdx.spec.ts` ran 1 file.
- [x] Write the failing test first. Proof: the first version of the regression test failed with `stale copy ran` before the fix.
- [x] Fix `runFiles` and route the test to the slow lane. Proof: `bun tooling/scripts/test-slow.mjs tooling/scripts/test-fast` passed; `bun tooling/scripts/test-fast.mjs tooling/scripts/test-fast` matched nothing.
- [x] Panel round 1 and its fixes. Proof: `docs/plans/artifacts/test-fast-explicit-paths/mutate/bare-paths-a1.log` and `docs/plans/artifacts/test-fast-explicit-paths/mutate/no-git-filter-a1.log` each fail only their own test with the fix removed.
- [x] Base control with one Bun on this checkout. Proof: `docs/plans/artifacts/test-fast-explicit-paths/base-fast-a2.log` exits 1 on the artifact copies; `docs/plans/artifacts/test-fast-explicit-paths/candidate-fast-a1.log` exits 0.
- [x] Panel round 2 on the round-1 fixes. Proof: `docs/plans/artifacts/test-fast-explicit-paths/panel-r2-opus.md`, `docs/plans/artifacts/test-fast-explicit-paths/panel-r2-astra.md` and `docs/plans/artifacts/test-fast-explicit-paths/panel-r2-sol.md` report no critical findings.
- [x] Full `pnpm check` in this checkout, which holds the snapshots. Proof: `docs/plans/artifacts/test-fast-explicit-paths/pnpm-check-a1.log` ends `exit=0` and names no artifact path.
- [x] Commit on `codex/test-fast-explicit-paths` and open a PR into `main`. Proof: the PR that carries this plan.

## Open work

- The fast-lane overflow advice in `test-slowest.mjs` and `test-suites.mjs` names only `*.slow.ts[x]`, not `*.slow.test.mjs`. owner: zbeyens. stop: a tooling test first crosses the fast limit. Tracked here and in the PR body.
- Discovery compares git's path spelling with the file system's, so a spec renamed by case alone without `git mv`, or one with a decomposed Unicode name on macOS, would drop out of its lane. owner: zbeyens. stop: a spec reported missing from a lane, or the next edit to `findGitVisibleTestFiles`. Tracked here and in the PR body.
- `pnpm test:coverage` still runs a bare `bun test --coverage`, which scans ignored copies. owner: zbeyens. stop: the next edit to `test:coverage`. Tracked here and in the PR body.

## Close

Landed: the fast runner passes exact paths to Bun, and the fast, slow and
deferred runners skip every file git ignores. `test-slowest` gets both through
the fast runner. One regression file holds a test per failure mode.

Reversal: the brief said discovery was the cause. It was half the cause. Bun's
substring matching ran the `docs/plans/artifacts/` copies, and the git filter
only matters for ignored folders inside the discovery roots, such as `build/`.

Proof and its limits:

- Same Bun 1.3.9 on this checkout with its snapshots: `main`'s fast runner
  exits 1 and cites artifact paths 18 times; this branch exits 0 and cites
  none.
- `pnpm check` exits 0 on the reviewed tree, frozen as `1bfed81334`.
- Each fix, removed alone, fails only its own test.
- Not proven: other machines, CI, and the two path-spelling cases in Open work,
  which no seat reproduced.

Counts: two panel rounds with three seats each, none missing. One critical
finding applied, one warning applied, two warnings deferred, three nits
applied, two deferred and three dismissed.
