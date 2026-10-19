---
review_scopes: [editing]
review_basis: [2026-09-23-editing-structural-rule-admission]
work_kind: implementation
---

# Implement structural input-rule admission

Status: Complete

Objective:

Implement the accepted direction in the [design plan](2026-09-23-structural-input-rule-admission.md): structural conversions consume markers only when the actual operation applies, and declined attempts delegate the original input without publishing partial work.

Completion threshold:

Heading, quote, generic block and list rules use one atomic accept/decline path; the shadow validator is deleted; inferred APIs and documentation match; focused package, type, lint, browser and scale evidence is recorded; current feature history is reconciled. No Git publication is requested.

Verification surface:

The owning source and existing tests named in the design plan; Plite command-spec tests; Plate input-rule, heading, quote and list tests; the managed `apps/www` autoformat browser flow. Exact proof commands follow Verify Plate's source-first recipes. A matched current/target scale probe precedes final architecture acceptance.

Constraints:

Keep Plite schema canonical, retain read-only matching and `next()` composition, preserve literal markers and typed input on decline, and avoid new public savepoint machinery. Run on the current `next` checkout; Autoreview is prohibited there.

Boundaries:

Product source, targeted tests, current public docs, generated barrels/registry when applicable, and research/plan receipts are in scope. Unrelated editing features, publication and release are out of scope.

Blocked condition:

An evidenced inability to distinguish actual structural application from no-op or to run required proof after bounded recovery would remain open in this plan; it is not a reason to publish a false pass.

## Execution checkpoints

1. Implement truthful Plite structural outcomes and focused contract proof.
2. Add Plate decline/discard semantics, migrate heading and quote, delete the helper, and prove required-title fallback.
3. Migrate generic and list rules after their compound writes have truthful outcomes; census other marker-first structural rules.
4. Update public docs and durable doctrine; run focused and integrated proof plus matched scale comparison; review final source and record outcome.

Verification evidence:

Plite `blocks.set/toggle` and `nodes.wrap/replace` return whether the canonical change builder staged a change; the mounted-view adapter preserves those results. The command-level toggle returns `false` on decline. Plate's one private `decline()` token discards the candidate spec and delegates the original command for text, break, and data; `next()` retains its prefix. Heading, quote, generic block-start, list, code-fence, and horizontal-rule conversions use actual command outcomes. The feature-owned shadow validator is gone. Quote retains its real one-block `nodes.wrap` behavior because `blocks.toggle({ wrap: true })` unwraps an active quote. Expected forbidden placements return `false` at Plite's structural operation; malformed rule or schema errors still propagate instead of being broadly caught by name.

Source-first package typechecks passed: `pnpm turbo typecheck --filter=./packages/plitejs --filter=./packages/platejs` (91 tasks) and `pnpm --filter plitejs typecheck:tests`. Relevant runtime suites passed: Plate core 523 plus one auxiliary test, basic nodes 61, code block 58, list 40, and Plite slice-fit/command-spec 119. The input-rule suite passed 36 cases after covering text, break, and data decline; the text case asserts literal input, selection, and one undo step. The required-title heading, quote, generic wrap, list, code fence, and horizontal-rule cases passed; nested quote behavior remained covered. Touched source passed targeted Oxlint and Oxfmt. Package-wide core lint remains red on unrelated existing files (`plitejs` schema and collaboration contracts; `platejs` override/exit-break files); the two diagnostics in this change were repaired and targeted lint reran clean.

The source-mode `apps/www` server returned `{"devSource":true,"plite":true}` on port 3297, and `PLAYWRIGHT_BASE_URL=http://localhost:3297 pnpm --filter www test:www-browser:chromium tests/browser/autoformat.spec.ts` passed 8/8 native interactions, including heading, list, and code fence. The server started by this task was stopped after proof. `pnpm --filter www check:docs` passed API-reference/source parity; `pnpm brl` ran; `pnpm --filter www build:registry` generated registry generation `c700fa691ec58bba0c19dae9033b5da9bbd3fcd9142d510dfc0f945efd391336`; Plate Next v233 validation and generated skill parity passed after `pnpm install`. No Autoreview was run on `next`.

The frozen heading scale probe used 10 warmups and 40 interleaved samples per variant, with identical editor construction outside timing. The baseline added the old root one-block shadow-validation operation reconstructed from compiled artifact SHA-256 `d2a01e1c32de471d8497f2608e6138b2e2600361c056cc380b28a2bee65d5289`; the candidate used final `BaseHeadingPlugins.ts` (`d78be86a7f299a4194a7b25f625ddc63d0de872eeb7669751c94f90ea06a7e5b`) plus `InputRulesPlugin.ts` (`6286086dbd0d5f4ca7a1f929dfd4bcb03f1902b8f43f6abe9e05876690874798`) and Plite public-state (`72b78a5bcae1ff77e642e479e573d8b698844b15f9c92be4559fc52980a9a43c`). The 200-block p95 was 4.32 → 3.21 ms and 2,000-block p95 was 11.70 → 3.81 ms; one full-document validation per baseline match became zero on the candidate path. At 20 blocks, p95 was 2.00 → 2.47 ms in one packet and 3.96 → 2.07 ms in a repeat, so normal-size timing is inconclusive under the frozen noise rule. This is an owner probe, not a browser latency claim: the pre-change source was untracked and only its compiled helper was recoverable, allocations were not measured reliably, and quote/list did not receive a matched timing comparison. Those limits prevent a blanket speed claim; they do not affect the direct correctness proof.

Open risks:

Compound list writes report actual list-property deltas after their attempted mutation. Schema-invalid placements in the exercised structural commands return `false`; errors from malformed rule code or unsupported malformed replacement nodes remain visible. Quote wrapping preserves the one-block nested semantics. The normal-size timing cohort and unmeasured quote/list matched timings remain performance limits.

Scale probe contract (frozen before measurement):

The matched heading action is typing the commit space after `#` at the end of a document with 20, 200, or 2,000 blocks. Compare the current production rule with the same rule preceded by the deleted shadow validator reconstructed from the pre-change compiled development artifact; construct identical editors outside the timed interval and interleave variants. This isolates the removed full-document validation cost but is not an exact old-checkout build. Use 10 warmups and 40 samples per cohort, record p50/p95, and count full-document validation calls. Candidate passes a cohort when p95 is no more than the baseline plus the greater of 10% or 0.3 ms; treat a within-noise result as inconclusive rather than a speed claim. The browser and package tests remain separate correctness guards. Record artifact hashes and any unavailable allocation metric.

Work Checklist:

- [x] Structural command outcomes are truthful and type inference holds.
- [x] Rule decline discards candidate spec and preserves existing `next()` composition.
- [x] All in-scope structural rule families migrated and shadow validator deleted.
- [x] Focused package, browser, scale, documentation, and source review gates pass or preserve exact failure limits.
- [x] Plan and ledger reflect final implementation and evidence.
