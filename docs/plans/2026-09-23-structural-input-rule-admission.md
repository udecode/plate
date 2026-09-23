---
review_scopes: [editing]
review_basis: [2026-09-23-editing-structural-rule-admission]
work_kind: design
---

# Structural input-rule admission

Status: Complete

Objective:

Settle the target and adoption order for schema-safe structural input rules. This is a design deliverable; no product source or public docs are changed here. The governing [review](../research/review-records/2026-09-23-editing-structural-rule-admission.json) pursues deleting the feature-owned shadow-document admission helper.

Completion threshold:

The plan must name the canonical admission owner, the exact consume/decline behavior, public call shape, all in-scope marker-first rule families, removal order, failure and performance gates, and proof that would change the choice. Completing this plan does **not** claim implementation or browser behavior.

Verification surface:

Current [rule executor](../../packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts), [rule types](../../packages/platejs/src/lib/plugins/input-rules/types.ts), [Plite transaction API](../../packages/plitejs/src/interfaces/editor.ts), [Plite structural commands](../../packages/plitejs/src/core/public-state.ts), [heading](../../packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts), [quote](../../packages/platejs/src/features/basic-nodes/lib/BaseBlockPlugins.ts), [generic block rule](../../packages/platejs/src/lib/plugins/input-rules/createInputRules.ts), [list rules](../../packages/platejs/src/features/list/lib/BaseListPlugin.ts), and [schema law](../vision/plite.md) were inspected. The September 22 [repair receipt](../research/review-records/2026-09-22-editing-document-structure-repair-execution.json) proves only the current required-title heading/quote fallbacks on its then-current source.

Constraints:

- One read-only rule match, one detached transaction spec for a matched rule, and one published command result. Preserve rule priority and `next(...)` composition.
- Plite's compiled schema owns document validity. Plate owns markdown matching and feature semantics. No speculative user-facing transaction/savepoint API.
- Preserve `# ` and `> ` as literal text when conversion is forbidden by `schema.content.prefix`; preserve the typed space and selection. Do not swallow unrelated exceptions.
- `next` permits breaking API changes. No compatibility alias is required.

Boundaries:

- Source of truth: the [editing decision](../research/decisions/editing-command-ownership.md), [Plate rule doctrine](../vision/plate.md), [Plite schema/command doctrine](../vision/plite.md), and live source above.
- This plan may edit only planning and feature-history records. Product code, docs, browser verification, Git publication, and external research are outside this design turn.
- External editor comparison is not needed: the unsettled question is the actual Plate/Plite transaction and command contract, not a missing external behavior law.

Blocked condition:

Implementation readiness is blocked if the new command outcome cannot truthfully distinguish a declined structural operation from an applied one, or a matched current/target scale probe shows material regression. Neither blocks completing this bounded design.

## Current behavior and hard cut

`InputRulesPlugin` builds an isolated spec and either consumes the original command or composes it after that spec. Its `next()` token **keeps** prior draft mutations. `EditorStateView.transaction` takes a `void` callback, and `blocks.toggle`, `blocks.set`, and `nodes.wrap` return `void`. A marker-first rule thus cannot tell whether a later structural method silently declined. [Heading](../../packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts) and [quote](../../packages/platejs/src/features/basic-nodes/lib/BaseBlockPlugins.ts) avoid two known failures by calling [canApplyBlockChanges](../../packages/platejs/src/features/basic-nodes/lib/canApplyBlockChanges.internal.ts), which reconstructs a guessed document and runs full-document validation before the real command. [Generic block rules](../../packages/platejs/src/lib/plugins/input-rules/createInputRules.ts) and [list rules](../../packages/platejs/src/features/list/lib/BaseListPlugin.ts) still delete markers before commands with possible no-op paths. These latter paths are source risks, not reproduced failures.

The strongest cut is to delete `canApplyBlockChanges` and give **the actual structural operation** an outcome. Do not move the shadow validator, add a parallel `schema.canApply...` query, or introduce a public `tx.attempt` savepoint. `schema.canContainAt` checks local slot/category admissibility, not the complete eventual operation. A boolean preflight would merely preserve the same two-source problem.

## Target contract

The *proposed* rule API gains one explicit `decline()` token. It means “discard every mutation in this rule's detached spec and delegate the original command against the unchanged base.” It is distinct from `next()`, which deliberately composes any draft prefix. A rule returns `undefined` to consume, `next(...)` to compose, or `decline()` to discard and delegate. The executor selects the outcome **after** building the candidate spec; it never publishes the discarded spec. First resolved rule remains first: a decline delegates the original command rather than trying a lower-priority rule.

The proposed Plite `tx.blocks.toggle(...)` and `tx.blocks.set(...)` return `boolean`: `true` only when their requested structural mutation is staged; `false` on no target, forbidden schema placement, or an unchanged result. They remain ordinary transaction methods, not new commands. Plate `tx.heading.toggle(...)` forwards that result. Plate `tx.list.toggle(...)` returns a truthful all-or-nothing result for its compound mutation; if its underlying node writes cannot guarantee that, fix the canonical structural write/result contract before exposing the boolean. This is an *outcome*, not another admission query. Exceptions other than expected schema rejection propagate.

An illustrative call site (final names/types must survive source implementation and inference checks):

```ts
apply: ({ decline, tx }, match) => {
  tx.text.delete({ at: match.range });
  if (!tx.heading.toggle({ level: match.level })) return decline();
}
```

The heading's existing same-level guard remains a feature choice. Quote should use the canonical `tx.blocks.toggle({ type }, { at: match.blockPath, wrap: true })` outcome if this preserves the exact one-block wrap semantics; otherwise make the actual `tx.nodes.wrap` operation report success. Do **not** infer success from a guessed wrapper. The executor treats an expected `EditorSchemaValidationError` from candidate-spec construction/finalization as a decline only for a structural attempt, after confirming the error cannot be a malformed rule declaration; unrelated errors remain visible. This classification needs a focused executable test before broad adoption. Do not use `error.name` string matching.

For a valid conversion, the same candidate spec contains marker deletion and the structural mutation and is published once. For a declined conversion, the spec is discarded; the original typed input runs once, leaving the marker intact. This also means no marker-only history step, collaboration op, or selection drift. Empty specs that intentionally consume remain distinct from declines.

## Alternatives rejected and limits

| Alternative | Decision |
| --- | --- |
| Keep or move `canApplyBlockChanges` | Reject: one extra document model, guessed replacement, whole-document validation, incomplete family coverage. |
| `schema.canContainAt` in each rule | Reject: local admissibility is not full command success. |
| Return `false` from a rule | Reject as proposed public shape: `false` is terminal in `around` command middleware and is easy to misread. `decline()` says exactly which spec is discarded. |
| Redefine `next()` to discard | Reject: existing rules intentionally mutate then delegate; it would break prefix composition. |
| Add public `tx.attempt` or nested transactions | Reject unless a measured, otherwise unsolved case proves a general transaction job. The executor already owns a detached spec boundary. |
| Infer success by comparing whole documents or operation counts | Reject: expensive and ambiguous for compound list operations or corrections. |

The outstanding technical risk is that Plite's low-level `nodes.set`/`nodes.wrap` still return `void`, while list toggle is compound. A fake `true` from its wrapper would recreate this bug under a cleaner name. The implementation must either obtain truthful per-write outcomes from the canonical writer or keep `list.toggle` outside the accepted conversion path until it can do so. If quote's toggle differs from the existing wrap semantics, keep quote on a truthful `nodes.wrap` result. These are proof gates, not permission to retain shadow preflight.

## Adoption and proof plan

1. **Plite owner:** make `blocks.toggle`/`blocks.set` report actual staged success consistently across root, nested, selected, wrapper, active-toggle, and no-target paths. Verify no partial draft on a `false` result. Resolve low-level node-write outcomes only where the list/quote implementation demonstrably requires them. Preserve full schema validation on transaction finalization.
2. **Plate executor:** add one typed decline token and discard branch for matched `insertText` rules; do not alter `next()` semantics. Extend to `insertBreak`/`insertData` only if a real structural caller needs it, keeping the published rule contract coherent. Confirm expected schema rejection and programmer-error separation with direct tests.
3. **Feature rules:** migrate heading and quote first while deleting the helper; then generic block-start and bulleted/ordered/task list rules. Census code-block fence and horizontal-rule conversions plus custom `apply` paths for marker-first structural writes; migrate only paths that can decline or fail after consuming text. Keep unrelated link, inline-mark, substitution, and media rules out of this repair.
4. **Public surface:** update inferred TypeScript callback types, the input-rule guide and relevant source doctrine for the final return contract. Apply Best API doctrine repair if the reusable rule/command taste changes; no old-signature alias on `next`. Run barrels if exports change.
5. **Direct proof:** test required-title `# ` and `> ` fallback, generic/list forbidden-slot fallback, valid heading/quote/list conversion, same-level/active-toggle semantics, nested/root placements, and a custom rule that mutates then declines. Verify marker, typed input, selection, one history step, replay/collaboration change identity, priority, and unchanged `next()` prefix composition. Use the existing package test and managed playground browser owners; a green package test cannot replace the real typed browser interaction.
6. **Scale gate before target lock:** freeze the current and candidate source revisions and comparable no-trigger typing, matched heading/quote/list, and long/nested document cohorts. Measure allocations and p95 end-to-end command time with the same fixture and correctness oracle. The target should remove whole-document shadow validation and add no per-keystroke scan or extra published transaction. Set the acceptance budget from the current baseline before running; an inconclusive or regressed cohort reopens the mechanism, not the correctness requirement. Rerun on final production code.

Rollback during execution is a single revert of the new outcomes and rule migration before removing the helper; after verified adoption, delete the helper and do not retain dual paths. No saved-document migration is needed: only command admission and rule dispatch change.

Verification evidence:

This plan is a source-backed design review, not an executable candidate. The current detached-spec boundary, `void` structural methods, shadow validator, and marker-first families were verified in the linked live files. Prior required-title browser proof is historical and does not prove this target. The performance comparison, schema-error classification, list truthfulness, and final browser behavior are explicit execution gates, not claimed passes.

Open risks:

The low-level node-write outcome and list compound-write truthfulness are unproved. Schema-error classification and matched performance remain execution gates. The quote `blocks.toggle({ wrap: true })` substitution requires an exact behavior test before deleting the existing wrap call.

Work Checklist:

- [x] Reconciled the governing review, September 21 atomic-rule direction, and September 22 required-title repair without treating stale proof as current proof.
- [x] Challenged delete, move, local schema-query, savepoint, and return-token alternatives against the actual executor and command contracts.
- [x] Specified accepted/declined outcomes, public call shape, owner boundary, migration order, failure contract, and proof gates.
- [x] Scoped this turn to a durable design plan and excluded product mutation, app run, and publication.
- [x] Separated source facts, proposed API, and unverified scale/runtime claims.
