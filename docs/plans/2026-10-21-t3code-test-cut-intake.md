# Intake: t3code's 11k test cut

Status: done: 10 items, 3 chips offered, 1 folded
Playbook: verdict

t3code deleted 43% of its tests in one PR, picked by cheap-model votes. Plate should copy the speed and refuse the votes. Plate's audit holds the right bar and moves too slowly to matter. Its first plitejs pass read 84 of 1,363 files and removed about 800 lines, against about 552k lines of tests. The fix is structure, not a stricter principle. Lint the banned shapes so the baseline becomes the cut list, prove a junk shape once instead of once per test, and give the legacy fixtures one owner.

## Brief

### What will change?

No code changes yet. Three new tasks and one updated task cover how Plate can cut many more tests, faster, without guessing which ones matter.

### What could go wrong?

Proving a junk shape once, instead of test by test, can cut a test that mattered. Each cut still lands through its own reviewed task, and until then the lint baseline lists every current hit.

## Pushback

- **Votes, not proof.** Haiku agents picked the cuts. Two agreeing votes counted as proof, and about half the files got one read. Two cheap readers that agree tend to make the same mistake.
- **Their own review caught the misses.** It restored 22 auth tests the swarm had cut as timing tests. Those tests ran on a fake clock and guarded credential expiry, so the rubric could not tell a contract from a shape that looks like junk.
- **Cost measured, signal not.** The PR reports test counts and wall time. It reports no mutation run and no coverage change, so "low signal" is the voters' claim.
- **The pain and the cut don't match.** Flaky browser tests failing release runs were the stated reason. The cut hit unit tests in every package, and the PR does not show that release runs got greener.
- **A probe nobody can rerun.** The PR calls its remaining server failures old because they fail the same way on the author's machine.

## Items

| # | Item | Outcome | Scope | Strongest reason | Evidence | Next |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Cut by category: tests that types already guarantee, trivial logic, mock-call mirrors, smoke tests, duplicate table cases and wall-clock asserts (How the tests were picked) | Settled | none | Plate's Tests rule and test-audit's junk list already ban each one. Nobody has checked most of Plate's suite against them yet, which item 4 owns | `.agents/pstack/rules/tests.md`; `.agents/skills/test-audit/SKILL.md` Junk patterns | none |
| 2 | Blanket cuts of timer tests, basic DOM tests and flaky browser tests (opening paragraph, How the tests were picked) | Stop | none | Plate is a DOM editor, so focus, selection, IME and timing are what it ships. t3code's own review restored 22 fake-clock tests this category cut, and a flaky test is a defect to repair, not a cut | the PR body's Verification section; test-audit's Retention bar and flaky lane | none |
| 3 | Pick cuts by Haiku votes, two passes and a tie vote (How the tests were picked) | Stop | none | Plate never runs Haiku, and two cheap readers agreeing is not proof that a test catches nothing | `AGENTS.md` How work runs; the PR body's 22 restored tests | none |
| 4 | Cut the whole suite in one pass, applied by an AST codemod (whole PR) | Bug, P3 | none | test-audit asks for a mutant per test, which its own full mode cannot afford at Plate's size. The first plitejs pass read 84 of 1,363 files and removed about 800 lines net | test-audit's Candidate evidence and Full mode; `rubric-a1.log` and `shapes-a1.log` in the run directory | t_deab5f08 |
| 5 | Where the rubric fits Plate (How the tests were picked, the keep list) | Defer | none | The shapes t3code cut cluster in platejs and apps/www, but only reading those areas tells a mirror from a contract | `shapes-a1.log` counts 1,025 call-assertion lines and 172 module-mock lines | folded on t_8ea0d74e |
| 6 | Un-export or delete what only deleted tests used (Follow-on cleanup) | Defer | none | Plate has no check that lists exports only tests import, so the size of this cut is unknown | no knip config in the repository; 282 test files import an internal entry, per `rubric.tsv` | folded on t_8ea0d74e |
| 7 | Duplicate table cases, which in Plate means the legacy Slate fixtures (How the tests were picked) | Open question | none | 933 fixture files repeat rows the v2 contract files also hold, and one owner must keep each row | `rubric-a1.log`; `packages/plitejs/test/query-contract.ts:1709`, as t_7d270da1 found | t_3799c6f4 |
| 8 | Speed as the reason to cut, with rebalanced shard weights (Verification) | Settled | none | Plate already cut test time by moving to one lane and bounding the heavy laws, and time is never a reason to cut | `docs/plans/2026-10-19-slow-lane.md`; test-audit's opening | none |
| 9 | Harden pstack's test-behavior principle (owner's question) | Stop | none | The principle already demands both edits, and the Tests rule already asks every extra case for its own failure mode. The weak point is enforcement, which item 10 owns | `principle-test-behavior-not-implementation`; `.agents/pstack/rules/tests.md` | none |
| 10 | Make the banned test shapes impossible to add (owner's question) | Bug, P3 | none | The Tests rule says a static invariant belongs in lint, yet only source-text tests and raised timeouts have rules | `oxlint.config.ts:504`; `shapes-a1.log` counts 90 toBeDefined, 181 toBeTruthy and 52 fixed-sleep lines | t_8d4fe683 |

## Order

1. t_8d4fe683 first. It is small, it stops new junk the day it lands, and its baseline turns today's hits into a list.
2. t_deab5f08 next, because the whole-suite audit stays out of reach without it.
3. t_8ea0d74e once t_deab5f08 lands, starting with platejs and apps/www, where the tests look most like t3code's.
4. t_3799c6f4 can run any time. It holds the largest single cut in plitejs, and it needs its owner pick before any fixture goes.

The earlier tasks t_cea6c521 and t_7d270da1 stay as they were.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Old hits of the new lint rules | Kept in the lint baseline as the cut list | Fixed before the rules land | fix hits first | small |
| Priority of the new tasks | Tooling at P3, the fixture question at P2 | Every test cut at P2 | raise test cuts | detail |

## Close

This run landed this page and its decision log, offered three tasks and folded one finding into t_8ea0d74e. It wrote no code and no test.

The counts come from text patterns over every tracked test file, not from reading each test, so each count bounds a shape rather than proving a cut. The static case count misses generated cases, such as the 3,604 tests one plitejs partition ran from 72 files. Recent CI runs on next record no pass or fail, so Plate's flake rate stays unmeasured. GitHub refused the PR's diff because it touches more than 300 files, so this intake read the PR's body, comments and first 100 changed files, not its code.
