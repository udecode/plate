---
title: Document-structure prefix editing repair
review_scopes: [editing]
review_basis: [2026-09-22-editing-document-structure-post-implementation]
work_kind: implementation
---

# Document-structure prefix editing repair

Status: Completed

Objective:
Restore complete, atomic editing of schema-required document slots across Plite and the installed Plate playground.

Completion threshold:
All reproduced slice, deletion, heading and quote failures have passing public-editor and browser oracles; affected type, package, benchmark and app checks pass on the final source.

Verification surface:
Plite and Plate focused contracts, playground and forced-layout Chromium routes, matched strict schema-construction benchmark, `pnpm check:plite:dev`, `pnpm --filter www typecheck`, barrels and lint.

Constraints:
Keep the accepted schema owner, preserve complete incoming content or decline atomically, and do not recast whole-editor publication time as constant-time schema validation.

Boundaries:
No PR, release, saved-document migration, unrelated schema-architecture benchmark repair or app-owned normalization.

Blocked condition:
No active blocker; a repeated failure of the actual reporter interaction or required final-source proof would block completion.

The [post-implementation audit](artifacts/document-structure/post-implementation-audit.md) retained `schema.content.prefix` but reproduced five failures across Plite fitting/canonicalization and Plate semantic commands. This task repairs those exact interactions in the current `next` checkout and closes the original plan's missing interaction and performance proof. Product code, tests, benchmarks, and source-bound browser proof are in scope. No PR, publication or external state change is requested.

## Acceptance

| Case | Current reproduction | Required outcome | Owner/proof |
| --- | --- | --- | --- |
| Selected title closed table | `tx.slice.replace` returns true and flattens a table into heading text | Complete table survives in admitted remainder, or fit declines atomically | Plite fitter; public-editor slice test, browser clipboard path |
| Deletion across required slots | Full title-through-body selection throws `requires defaultable content` | Valid required slots are reconstructed in one edit, with mapped selection/history | Plite canonicalizer; public-editor deletion test |
| Nested prefix closed table | Collapsed paste inside prefixed box throws | Nested owner uses its content grammar; preserves complete table or declines atomically | Plite fitter; element-content test |
| Heading markdown | `##` + Space in required H1 erases syntax | An inadmissible H2 rule does not consume existing or typed input | Plate command/rule; focused package test and playground keyboard proof |
| Blockquote wrap | Toggle/markdown rule at required H1 throws | Semantic wrap declines without error or partial content | Plate command/rule; focused package test and playground proof |
| Scale/closure | One-sample prefix timings, changed span read after another edit, red strict ratio | Matched production-path p50/p95 with explicit plain control, correct changed-span attribution; no unsupported locality claim; report existing strict gate faithfully | Benchmark owner and Task integration |

## Decisions and constraints

- Keep the accepted canonical schema owner. Do not restore app-owned correction, add a title node, or generalize into a sequence grammar for these defects.
- The complete user-intent operation must preserve the incoming structure and valid document, or decline without consuming input. Raw low-level invalid updates may fail atomically with a schema diagnostic.
- Primary/named roots, nested element content, selected ranges and collapsed carets remain distinct proof shapes. Existing Yjs/history selection laws remain applicable.
- The prior plan's `completed` execution record is immutable historical evidence; this plan records a subsequent repair and its own proof, without rewriting the prior record.
- Plate package files are delegated to one writer; benchmark-only files to another. Task owns Plite core, browser tests, plan, docs/ledger reconciliation and integration.

Work Checklist:

- [x] Reproduce and add focused executable regression oracles for the Plite slice/deletion cases; repair canonical owners.
- [x] Repair Plate semantic commands/input rules and prove both installed playground cases.
- [x] Close root, named-root and nested-element slice behavior, selection and history; run affected package tests/types.
- [x] Run managed fresh-source browser proof for playground clipboard/keyboard behavior and raw Plite forced-layout regression; preserve any unexecuted case as a limit.
- [x] Establish matched production-path performance result with correct statistics and correctness guards; resolve or explicitly bound the existing red strict gate.
- [x] Inspect final implementation, reconcile editor behavior law, plan evidence, review execution outcome and generated ledger; run applicable checks.

## Outcome and proof

Plite now reconstructs displaced required slots after deletion, even when later siblings already satisfy the root's minimum length. It preserves complete closed structure when pasting over selected title text in primary, named and nested prefixed content. Generic block toggles decline an inadmissible wrapper before mutation; Plate heading and blockquote input rules keep their marker and typed space when a required title rejects the conversion. Focused tests cover selection mapping, undo/redo and remote document-change replay. The copied playground and raw Plite example both use the schema owner without app normalization.

The [verification receipt](artifacts/document-structure/repair-verification.json) records the final package, website, browser, barrel, lint and development-lane checks. The [strict construction benchmark data](artifacts/document-structure/repair-construction-benchmark.json) retains all 20 paired samples for each of eight one- and two-slot cohorts through 50,000 body siblings. Every paired p95 prefix-over-plain budget passes, with one changed prefix token at most. Garbage collection runs before each timed arm; the measured whole-editor path still grows with document length because immutable publication grows, and no exact validation-visit claim is made.

The older schema-architecture equivalent-reconfiguration strict ratio remains a separate historical red gate without a matched pre-feature control. This repair neither attributes nor changes that result. There is no saved-document migration, publication or deployment claim.

The editor behavior law is unchanged: this work restores the accepted schema-owned invariant. [Current evidence](../editor-behavior/current-evidence.md) points to the repaired executable owners. The original implementation record remains historical; this plan has its own execution outcome.

Verification evidence:
The [final verification receipt](artifacts/document-structure/repair-verification.json) names each successful command, and the [raw benchmark packet](artifacts/document-structure/repair-construction-benchmark.json) retains paired timing samples. Final package checks, three playground browser cases and two managed Plite browser cases passed after the code settled.

Open risks:
The older unrelated schema-architecture equivalent-reconfiguration strict ratio remains red; no current evidence attributes it to required-prefix editing. Full garbage-collection pauses are outside the matched prefix-over-plain p95 gate.

Next action: record and render the review-ledger execution outcome for this completed repair.
