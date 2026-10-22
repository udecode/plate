---
name: test-audit
description: "Audit existing tests for low-value, duplicated or implementation-coupled cases and the test-only code they keep alive, then remove or rewrite them on evidence. /test-audit full covers the whole suite and also lists public contracts no test guards. Use for test-audit, /test-audit <scope>, /test-audit full, a test sweep, or pruning tests. Not for writing a new test; the project's Tests rule gates that."
---

# Test audit

Adapted from openclaw's `test-audit` skill (MIT, OpenClaw Foundation; see [LICENSE](LICENSE)).

Judge the result by how much the remaining tests can be trusted, never by how many were deleted. A test is worth keeping when it protects observable behavior, a credible regression, or an independent contract: a public API, protocol, config, migration, storage, security, platform, default, generated, package, release or architecture contract. Static, slow or flaky is never a reason to delete.

## The bar

Judge each test by the two edits of pstack's `principle-test-behavior-not-implementation`:

- **Break the behavior.** Make the code return a wrong value, skip an effect or do it twice. The test must fail. One that passes proves nothing.
- **Change the internals.** Restructure the code under the test and keep every result its users observe. The test must pass. One that fails is pinned to the implementation. Its failure reports no bug, and every refactor has to rewrite it.

Keep a test that passes both. Rewrite or cut the rest, as the sections below say.

An internal entry is an export that no production code outside its own module calls. A dead-code tool in production mode, such as `knip --production`, lists them. Each failure mode keeps one test, at the outermost entry a cheap test can call, such as the projection a screen reads rather than the helper inside it. When a kept boundary test catches a mistake, every other test of that mistake goes, even one that reads no private state.

## Scope

Take the user's scope, or the files they name; `full` takes every tracked test file, as [Full mode](#full-mode) says. Read the root and scoped `AGENTS.md` first; their Tests rule is the bar for every test this audit keeps, rewrites or moves. A request that only asks which tests are weak or what is untested stays read-only and reports its candidates and gaps. Leave out skills and code installed from another repository.

## Discover without editing the checkout

1. For a broad scope, split it into read-only lanes by owner area and run them in parallel.
2. Sort the scope into the tiers of [Evidence tiers](#evidence-tiers), listing shape and duplicate members with scripts.
3. For each Test-tier candidate, read the whole test, its production owner, the owner's callers, the overlapping tests, CI routing and history. When a test claims behavior a dependency provides, read that dependency.
4. Prove the first edit by mutating a scratch copy of the owner so the behavior breaks, and run the test against it, never by editing the checkout.
5. Prove the second edit for a test that reads private state, imports an internal entry, spies on or counts an internal call, or asserts an order no user sees. Refactor a scratch copy of the owner without changing anything its users observe, such as renaming a private helper, inlining a collaborator or reordering independent internal calls, and run the test. A failure shows the coupling.
6. For the Test tier, prefer a few high-confidence candidates over a long speculative list. Report the evidence before editing.

## Junk patterns

- Assertion-free coverage probes.
- Self-comparisons and identity copiers.
- Copied fixtures, inventories, manifests or export lists.
- Exact source, import or string greps, and regexes over prose.
- Tests of private state, internal entries or internal calls that fail the second edit. Rewrite one through the public interface when no public test covers its behavior, and cut it when one does.
- Table rows whose planted bug another kept row also fails on.
- Duplicate invocations of the same contract, including a test this run just added and a test that builds its own fixture to recheck what a shared fixture already covers.
- Tests whose only purpose is keeping a test-only export, global or wrapper alive.
- Dead production code whose only callers are tests.
- Expected values produced by the helper or renderer under test.
- Mocks that implement the asserted behavior, or one mock standing in for different APIs.
- Fixtures that supply what the owner should produce, or persistence asserted against a store the path never writes.
- Assertions on a value the code returns as a constant, unless users are promised that value.
- Negative controls that pass for an unrelated reason, such as a crash or a denial from a different guard.
- Names or fixtures that promise more than the input exercises.
- Tests coupled to historical documents or plans whose content keeps changing.

## Retention bar

Keep a test that independently enforces one of the contracts listed at the top, and keep:

- call ordering when the order is observable behavior;
- the payload a mocked external service receives, because that service observes it;
- a regression with a credible failure mode;
- logic driven by a fake or deterministic clock, such as a credential expiring, which is not a timing test;
- a pin on a constant users are promised, such as a documented default, when the test names that promise;
- a source inspection that is the cheapest independent guard, failing when the user-facing key, byte or path changes and surviving an identifier rename; when the project's Tests rule bans source-text tests, the guard moves to its lint or a check script;
- a test that fails on the current tree. Treat it as a possible bug, reproduce it and repair the owner or the fixture instead of deleting it.

A slow test is never a cut either. Shrink its input to the smallest size at which its mutant still fails, or move it to the project's slow tier when the project keeps one. A flaky test goes to the flaky lane in [Full mode](#full-mode), never to a cut. A test that resembles the implementation may still be the independent contract. Prove otherwise before removing it.

## Evidence tiers

Every cut cites one of these proofs. A reader's verdict is not one, and neither is several readers agreeing.

- **Shape.** Some shapes cannot catch a behavior break: a test with no assertion and no call that throws on failure, an assertion the owner's declared type makes always true, such as `toBeDefined` on a value the type never leaves undefined, `toBeTruthy` on an object or `typeof` on an export, and a wall-clock bound outside the project's benchmark lane. A test is a member only when every assertion in it has the shape, because one real assertion beside a junk one still catches its break. A test whose only check is an awaited call that throws on failure is a real test; give it an explicit assertion instead of cutting it. Prove the shape once per batch: a script that lists every member, one member that still passes against a mutant, and the type or rule that makes the rest the same. When that member fails its mutant, the shape is wrong, and its members move to the Test tier. Membership is the proof, so a member stays only with a keep's evidence, the contract it enforces and the mutant it fails. When the project lints the shape, the lint's baseline is the member list.
- **Duplicate.** Two places hold the same input and the same expected result. Prove it with a script that matches them, and keep the copy at the owner the project picks.
- **Covered.** A kept case catches the same mistake: the mutant this case catches also fails the kept case. A per-case coverage run that lists this case's lines as a subset of another's only nominates the pair, because two cases on the same lines with different inputs and expected results catch different mistakes, such as a send plan that must say yes for email and no for portal-only.
- **Internal.** The case reaches the code only through an export or file that the dead-code tool lists as used by tests alone. The code goes with the case when no production caller remains.
- **Test.** Everything else, such as mock-call assertions, internal imports, schema parses, copied lists, tables with distinct inputs and contract-shaped tests, gets both edits one test at a time and every field of Candidate evidence. A schema case can catch a broken refinement, a call count can be the reads a server sees, and a copied list can be the value users are promised, so none of them is a shape.

## Candidate evidence

A shape or duplicate batch records its proof, its member list, the production deletion it unlocks and its validation command. A Test-tier candidate records every field below before editing; a missing field means it is not ready:

- the exact test name and location;
- the failure it can actually detect, shown by a mutant;
- for a test cut or rewritten as pinned to the implementation, the refactor that broke it;
- the non-test callers of the covered code;
- the stronger owner-boundary proof that remains, or why none is needed;
- the history and the reason the test or seam exists;
- the production or test-support deletion it unlocks;
- the risk and the focused validation command.

## Edit shape

Change one coherent owner-boundary batch at a time. Delete obsolete test-only exports, globals, wrappers and dead production paths instead of keeping aliases. Move a retained regression to its canonical owner, and fold near-duplicates into the shared fixture. Prefer a change that removes more production lines than it adds. Cut each case with the project's delete-by-title codemod when it has one, or by hand, then remove the imports and top-level helpers the project's unused-code lint reports. Add no replacement test that restates the implementation, and never turn an uncertain candidate into a deletion to raise the count. Before the first edit to a file that holds another session's work, copy it to scratch.

## Full mode

`full` audits the whole suite across sessions. It edits one owner area at a time and never holds the whole tree's paths at once.

1. **Inventory.** List every tracked test file with the project's own test patterns and group the files by owner area, such as a package or an app. Write a ledger in the run directory with one row per area: its files, line count, signals (internal imports, mocks and spies, snapshots) and state. A later session resumes from the ledger and never restarts an area the ledger marks done.
2. **Suite health.** Before the lanes, scan for skipped and focused tests, commented-out tests, tests that import another test file, placeholder titles, and snapshot files that keep dead keys. Report only what is worth fixing.
3. **Lanes.** Take the areas in the order the ledger ranks, largest and most internally coupled first. Each lane runs this skill on one area with a file budget it states before it starts. It lists the area's shape and duplicate members with scripts and cuts them one batch per shape, then reads the remaining files in full for the Test tier, with its edit batch when the request asks for repairs. In a project with a task ledger, each area's edits go out as their own task.
4. **Flaky lane.** A test that fails only sometimes is a defect in the test or the code. Reproduce it, then repair it or quarantine it in the project's own way with its owner named.
5. **Gaps.** From fresh coverage and the public exports, list the public contracts whose break no test catches, ranked by the named defect a test would catch. Skip barrels, declarations, type-only and generated files. List a contract that only a browser can prove under the project's browser proof, not as a unit-test gap. Stop when what remains is wrappers, glue or code due for a rewrite. The list writes no test; the project's Tests rule gates each one.

## Validate

1. Run the owner's and its siblings' tests with the project's own runners.
2. Run each rewritten test against its named mutant and see it fail, and against its named refactor and see it pass. Rerun each shape batch's listing script and see it list only the members kept with evidence.
3. For a removed grep or plan assertion, run the executable that owns the real contract.
4. Regenerate anything the edited files feed, such as skill mirrors or a manifest, and run its check.
5. Report production and test line counts separately, measured against the scratch copies when the index holds other sessions' work.

Review and delivery follow the project's `AGENTS.md`.

## Handoff

Report the removed low-value categories, the production simplifications, the retained false positives and why they stay, the proof actually run, production and test line counts, the commit or PR state, and named follow-ups with owners. In full mode, also name the ledger and each area's state. In a project with plan pages, write this in the plan's `## Close`.
