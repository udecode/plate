---
name: test-audit
description: "Prune low-value, internal, flaky, slow or duplicated tests and bloated CI checks in coherent batches while keeping E2E, public boundary and invariant coverage intact. Not for writing new tests."
---

# Test audit

Adapted from openclaw's `test-audit` skill (MIT, OpenClaw Foundation; see [LICENSE](LICENSE)).

Read `AGENTS.md` and `.agents/pstack/rules/tests.md` first. Stay read-only when asked only for candidates or gaps, and skip third-party skills or vendor code.

## Default bar

Internal, helper and post-hoc unit tests are guilty until they name a real user defect that E2E, public boundary, type, lint or zero-baseline invariant checks miss. Keep a test only when breaking public behavior fails it and refactoring internals keeps it passing (`principle-test-behavior-not-implementation`).

## Hard safety net

- Never cut E2E, deterministic concurrency/sync or public golden tests without an explicit replacement.
- Never silently delete an unwired security, access, auth, PHI, consent or customer-send guard whose only caller is a test; flag it as a finding so production wires or retires it intentionally.
- Never delete a test failing on the current tree to make CI green; reproduce and fix the bug or fixture first.

## Batch deletion

Cut coherent package or owner batches without per-test scratch mutation courtrooms:

1. **Internal and test-only entries:** `*.internal.*` files and tests importing non-public or test-only exports. Delete the dead test-only exports and helpers with them (find test-only importers via `knip --production` or `git grep`).
2. **Low-signal shapes:** mock-verifying, constant-pinning (unless user-promised with the promise named), source-text/grep, assertion-free, self-comparing, snapshot and exhaustive-matrix tests.
3. **Timing bounds:** wall-clock assertions outside dedicated benchmarks.
4. **Duplicate coverage:** unit tests whose user behavior is already exercised by a kept E2E, golden or public boundary test.

Reserve targeted scratch mutant or refactor checks only for genuinely uncertain edge cases, never as mandatory paperwork on clear cuts.

## Flaky and slow tests

- **Flaky:** fix deterministically in one pass or cut and replace the test. Never leave flakes running or raise timeouts.
- **Slow:** cut slow tests that duplicate boundary coverage instead of parking them in a slow tier; shrink inputs on unique slow tests.

## CI and baseline pass

Audit `check.mjs`, CI steps and formal baseline files against recent CI failure history (`events.jsonl` or equivalent):

- Demote multi-hundred-line known-bad baseline sweeps out of blocking CI into on-demand audit commands.
- Fold real static invariants into types or lint and delete redundant micro-scripts.

## Full mode and validation

In `/test-audit full`, write an area ledger in the run directory (files, line counts, coupling signals, state) and process one area per batch, largest and most internally coupled first.

Validate every deleted batch:
1. Run the package's remaining tests, boundary/E2E suite, typecheck and unused-import/lint checks.
2. When removing files or exports, run the project's full check to catch stale contract lists, quarantine lists or manifests.
3. Report removed categories, production deletions unlocked, kept edge cases, commands run, and separate production vs. test line counts.
