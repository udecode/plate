---
name: test-audit
description: "Audit existing tests for low-value, duplicated or implementation-coupled cases and the test-only code they keep alive, then remove or rewrite them on evidence. Use for test-audit, /test-audit <scope>, a test sweep, or pruning tests. Not for writing a new test; the project's Tests rule gates that."
---

# Test audit

Adapted from openclaw's `test-audit` skill (MIT, OpenClaw Foundation; see [LICENSE](LICENSE)).

Judge the result by how much the remaining tests can be trusted, never by how many were deleted. A test is worth keeping when it protects observable behavior, a credible regression, or an independent contract: a public API, protocol, config, migration, storage, security, platform, default, generated, package, release or architecture contract. Static or slow is never a reason to delete.

## Scope

Take the user's scope, or the files they name. Read the root and scoped `AGENTS.md` first; their Tests rule is the bar for any test this audit rewrites. Leave out skills and code installed from another repository.

## Discover, read-only

1. For a broad scope, split it into read-only lanes by owner area and run them in parallel.
2. For each candidate, read the whole test, its production owner, the owner's callers, the overlapping tests, CI routing and history. When a test claims behavior a dependency provides, read that dependency.
3. Prove what a test catches by mutating a scratch copy of its owner and running the test against it, never by editing the checkout.
4. Prefer a few high-confidence candidates over a long speculative list. Report the evidence before editing.

## Junk patterns

- Assertion-free coverage probes.
- Self-comparisons and identity copiers.
- Copied fixtures, inventories, manifests or export lists.
- Exact source, import or string greps, and regexes over prose.
- Private predicate or call-shape tests that a test at the real boundary duplicates.
- Duplicate invocations of the same contract, including a test this run just added and a test that builds its own fixture to recheck what a shared fixture already covers.
- Tests whose only purpose is keeping a test-only export, global or wrapper alive.
- Dead production code whose only callers are tests.
- Expected values produced by the helper or renderer under test.
- Mocks that implement the asserted behavior, or one mock standing in for different APIs.
- Fixtures that supply what the owner should produce, or persistence asserted against a store the path never writes.
- Assertions on a value the code returns as a constant.
- Negative controls that pass for an unrelated reason, such as a crash or a denial from a different guard.
- Names or fixtures that promise more than the input exercises.
- Tests coupled to historical documents or plans whose content keeps changing.

## Retention bar

Keep a test that independently enforces one of the contracts listed at the top, and keep:

- call ordering when the order is observable behavior;
- a regression with a credible failure mode;
- a source inspection that is the cheapest independent guard, failing when the user-facing key, byte or path changes and surviving an identifier rename;
- a test that fails on the current tree. Treat it as a possible bug, reproduce it and repair the owner or the fixture instead of deleting it.

A test that resembles the implementation may still be the independent contract. Prove otherwise before removing it.

## Candidate evidence

Record every field before editing; a missing field means the candidate is not ready:

- the exact test name and location;
- the failure it can actually detect, shown by a mutant;
- the non-test callers of the covered code;
- the stronger owner-boundary proof that remains, or why none is needed;
- the history and the reason the test or seam exists;
- the production or test-support deletion it unlocks;
- the risk and the focused validation command.

## Edit shape

Change one coherent owner-boundary batch at a time. Delete obsolete test-only exports, globals, wrappers and dead production paths instead of keeping aliases. Move a retained regression to its canonical owner, and fold near-duplicates into the shared fixture. Prefer a change that removes more production lines than it adds. Add no replacement test that restates the implementation, and never turn an uncertain candidate into a deletion to raise the count. Before the first edit to a file that holds another session's work, copy it to scratch.

## Validate

1. Run the owner's and its siblings' tests with the project's own runners.
2. Run each rewritten test against its named mutant and see it fail.
3. For a removed grep or plan assertion, run the executable that owns the real contract.
4. Regenerate anything the edited files feed, such as skill mirrors or a manifest, and run its check.
5. Report production and test line counts separately, measured against the scratch copies when the index holds other sessions' work.

Review and delivery follow the project's `AGENTS.md`.

## Handoff

Report the removed low-value categories, the production simplifications, the retained false positives and why they stay, the proof actually run, production and test line counts, the commit or PR state, and named follow-ups with owners.
