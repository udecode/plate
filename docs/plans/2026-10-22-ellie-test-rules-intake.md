# Intake: Ellie's t3code-style test rules

Status: done: 10 items, 1 chip offered, 1 folded
Playbook: verdict

Ellie rewrote its test rules after t3code's big cut. It has a short, closed list of what a test may guard, a check that blocks six junk test shapes, and a cut map proved by one planted bug per shape. Plate already has most of this in a stronger form. Where Ellie uses a shape script, Plate uses lint rules with a baseline that only shrinks. Where Ellie used a panel, Plate asks for a planted bug per cut. Two things are worth taking. The first is the closed list, rewritten for a library so public API and editor behavior stay on it, and any test outside the list needs its own named defect. The second is three small tools for the test audit. They are a lint for tests with no assertion, a coverage check after each cut batch, and planted bugs that run from a patch in a fresh worktree.

## Brief

### What will change?

No code changes yet. One new task decides whether Plate keeps tests only for a closed list of reasons. The test audit task gains three small tools that make each batch of cuts safer.

### What could go wrong?

A closed list can cut a test that guards something the list forgot. Each cut still needs a planted bug that a stronger test catches, and every public API test stays on the list.

## Pushback

- **Built for an app, not a library.** Ellie keeps tests for access, numbers a person acts on and payloads sent to outside services. Plate's users are developers calling its API, so a straight copy would cut the public API and editor behavior tests the owner wants kept. Only the form of the rule carries over. That form is a closed list, with the burden of proof on every test outside it.
- **Shapes claim more than they prove.** Ellie's first shape listing showed a 5.4% cut. One planted bug per shape brought it down to 3.0%, because the schema, library and no-check members caught their bugs (Ellie's test cut map, Close). A shape names a candidate, not a cut, which is why Plate asks for a planted bug per cut.
- **Being on the list is not proof.** Ellie's own audit found a kept case that still passes a local-day bug (Ellie's test-suite subject, Open work). A test can name a list item and catch nothing. Plate's two-edit bar catches that, and Ellie's list alone does not.
- **Its review is still open.** Three of Ellie's cut commits shipped without a panel, and that review is still listed as open work (Ellie's test-suite subject, Open work). Nobody has reviewed the final number in full.
- **The cut was small.** The whole cut removed 5.0% of Ellie's test lines plus the code only those tests used. Expect a Plate cut of that order, not t3code's 43%.

## Items

| # | Item | Outcome | Scope | Strongest reason | Evidence | Next |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | A closed list of what a test may guard, with every other test needing its own named defect (Ellie's `AGENTS.md`, Testing, App bar) | Open question | none | Plate's keep list is open, so an internal-only test that passes both edits stays. Closing it flips the burden, which changes the standing Tests rule. Public API tests stay on the list whatever the answer | test-audit's Retention bar; Ellie's `AGENTS.md` Testing section | t_4c22d0d5 |
| 2 | Block tests with no assertion and tests that only render (Ellie's `check:test-shapes`, assertion-free and render-smoke) | Bug, P3 | none | The Tests rule moves static invariants to lint, yet Plate has no rule for a test with no assertion. Ultracite's vitest preset has `vitest/expect-expect`, and Plate's config does not extend it | `oxlint.config.ts:151`; `tooling/oxlint/plate-plugin.mjs` | folded on t_8ea0d74e |
| 3 | Block type restatements, copied lists, tests that read plans or docs, and wall-clock asserts (Ellie's `check:test-shapes`) | Settled | none | test-audit's junk list names copied lists, and the Tests rule adds no test for a defect a type already catches. Plate's `no-source-text-test`, `no-wall-clock-bound` and `no-fixed-sleep` rules already block the rest, with their old hits in the baseline | test-audit's Junk patterns; the Tests rule; `tooling/oxlint/plate-baseline.json` | none |
| 4 | Run coverage after each cut batch, because a line that drops out lost its only test (Ellie's test cut map, coverage baseline) | Bug, P3 | none | A planted bug proves that the cut test was weak. It does not show that a batch removed a line's only test, and test-audit's Validate step has no check for that | test-audit's Validate | folded on t_8ea0d74e |
| 5 | Run each planted bug from a patch in a fresh worktree (Ellie's `proof-worktree.mjs --patch`) | Bug, P3 | none | Verify runs proof in a detached worktree plus a saved patch. Plate's runner takes copied files but no patch, so this session's planted-bug scripts edited the checkout and had to restore it | `tooling/scripts/proof-worktree.mjs:51`; verify's Completion boundary | folded on t_8ea0d74e |
| 6 | Scripts that list each shape's members (Ellie's `scripts/test-cut/`) | Settled | none | The owner had `cut-tests.mjs` deleted. Agents cut by hand, and the lint baseline is the list | commit 653ac0cad7 | none |
| 7 | A panel over each batch of cuts, which restored five cases in Ellie | Settled | none | Ellie's panel caught cuts made on reader judgment. Plate allows no such cut, because each one needs a planted bug and a stronger test that catches it | test-audit's Candidate evidence | none |
| 8 | Flaky and slow are never reasons to cut (Ellie's `AGENTS.md`, App bar) | Settled | none | test-audit says the same in its opening paragraph | test-audit's opening | none |
| 9 | Bun runs pure tests and Vitest runs only DOM work (Ellie's `AGENTS.md`, Testing) | Settled | none | Plate's runner already does this. Bun runs every package test, and Vitest runs only the named suites. Ellie's database rule has no Plate equivalent | `tooling/config/test-suites.mjs:29` | none |
| 10 | A case whose title names the contract it guards (Ellie's test cut map, title contracts) | Settled | none | Plate's editor-behavior tests carry `[EDIT-...]` rule tags in their titles, and `pnpm kb` maps them to the spec | `CODING_STANDARDS.md`, Tests | none |

## Order

1. t_4c22d0d5 first. It is one decision, and its answer sets which internal tests the audit may cut.
2. t_8ea0d74e next, starting with platejs. Its first batch adds the assertion lint, the coverage check and the patch flag, so every later batch uses them.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the three tools go | Into the test audit task | Their own small task | split the tools | small |

## Close

This run landed this page and its decision log, offered one task and folded three findings into t_8ea0d74e. It wrote no code and no test.

It read Ellie's `AGENTS.md` Testing section, its test-suite subject, its test cut map and its shape check, and compared each with Plate's Tests rule, test-audit, lint config and baseline. The 3.0% and 5.0% numbers are Ellie's own, and this run did not rerun them. Twenty tracked test files under `docs/research` and `docs/plite` match no test pattern, so no runner collects them. The fold tells the audit to leave them out of its count.
