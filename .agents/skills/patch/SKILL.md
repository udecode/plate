---
description: Repair Plate/Plite behavior bugs with exact reproduction, an owning fix and verified prevention; diagnose-only and explicit corpus modes preserve their scope.
argument-hint: '[<bug report> | diagnose <report> | corpus <surface or cases>]'
disable-model-invocation: true
name: patch
metadata:
  skiller:
    source: .agents/rules/patch.mdc
---

# Patch

Handle $ARGUMENTS under [the Plate workflow](../task/references/workflow.md).
Patch owns local behavior repair; Task retains scope, continuation, the current
plan and authorized delivery. Use the existing checkout and one acceptance record.

## Select the work

| Request | Method |
| --- | --- |
| One local bug, failing behavior test, or normalized repair packet | Follow the repair loop below. |
| `diagnose`, `debug only`, or cause still unresolved | Load [diagnosis](./references/diagnosis.md). Diagnosis-only stops at evidence and cause; it does not authorize a product fix. |
| Several bugs, explicit corpus, regression harness or rewrite closure | Load [corpus](./references/corpus.md) for case selection, semantic schema, receipts and affected-case replay; use this same repair loop for each case. |
| A claimed fix fails exact replay or receives a reporter contradiction | Load [failed-fix recovery](./references/failed-fix.md) before another product edit. Preserve earlier acceptance and the new evidence. |
| Workflow/rule/helper maintenance, including a request phrased `patch repair` | Use Maintain Workflow at the actual source owner. No separate Patch maintenance procedure. |

Public issue/PR requests go through Maintainer; a delegated local packet may
retain issue provenance without public-mutation authority. Timing or profiling
goes to Benchmark. Verification-only goes to Verify Plate and stays read-only
for product code. Non-product tooling fixes stay with Task. Generic feature TDD
remains a shared method; an ordinary bug does not load a second TDD lifecycle.

## Reproduce the actual failure

Read the latest report, source and supplied evidence. Record the exact
setup, active modes, route or public entry, input, expected result, observed
failure and required follow-up. Separate observed behavior from the reporter's
theory. Preserve every still-applicable acceptance item across follow-ups.

Classify the invariant and owner: Plate owns product/plugin policy; Plite owns
editor-agnostic substrate. Reproduce through the smallest honest boundary:
package proof for model behavior, real input on the reported surface for native
interaction, and both when their failures differ. A detached transform,
alternate route, synthetic click or model selection is not proof of an Enter,
pointer, native caret or focus report. Keep the complete original fixture even
when a smaller diagnostic reproduces the first fault.

Mark the acceptance as `visual` when the reported result concerns paint,
highlighting, visibility, layout, styling, clipping, position or animation.
When the failure is reproducible, capture and inspect the failing state after
the exact reporter interaction before changing product source. A reporter image
may establish the observed failure. DOM markers, computed styles, geometry and
automated assertions remain diagnostics; they do not replace looking at the
rendered pixels for a visual report.

If the exact case does not fail, record `needs-repro` and continue useful
diagnosis without calling a proxy the reproduction or the bug fixed. Repair a
diagnosed host/runner prerequisite within scope; a stub, route bypass or edited
generated file cannot certify product behavior. Use the conditional diagnosis
method when the cause remains unclear.

## Fix and prevent

Before implementation, name the violated invariant and why it escaped. Search
materially different callers for the same assumption. Compare fixing the
existing owner with deleting the condition that creates the bug before adding
compensation. The smallest durable fix is the simplest correct ownership, not
the fewest changed files. Choose one canonical owner, an impossible invalid
state, an existing reusable assertion, or a valuable behavior test. Prefer shared
selection/focus utilities in `packages/test`; keep one-use setup local.

Use Testing's value gate for new coverage. When a regression test is justified,
run it red on the reported invariant, fix the owner, then run the same proof
green. An existing test or diagnostic may supply red; do not create duplicate
tests simply to perform TDD. Native proof remains required when the lower-layer
test cannot observe the reported input, focus, selection or paint. A test helper
must reject the known bad state as well as accept the valid one.

Make the ownership decision early, and revisit it if a workaround appears:

- **Keep:** the owner and shape can enforce the invariant directly.
- **Rework:** simplify or move the fix before final proof.
- **Escalate:** unresolved ownership, a proposed cross-owner compensation
  protocol, recurring invariant failures or several caller workarounds require
  Best API Review before accepting the fix; do not wait for another failed
  attempt. Compare deleting, merging and reusing owners. Choose the next owner
  for the whole remaining job through Task's review routing. Continue necessary
  design, adoption and proof under existing repair authority.

Fix the durable package or bridge, not an example unless the example owns the
contract. Reject timing guesses, caller-specific compensation, unbounded hot
work, unreleased compatibility aliases and implementation-spelling tests.
Before accepting robustness machinery or review findings, establish the real
user job and supported input domain across the complete owning path. A helper's
synthetic extremal case cannot silently expand product requirements.

Published package edits require the applicable changeset; public API changes
also retain Best API's doctrine-repair obligation. Remove temporary probes and
obsolete workarounds after the cause is proved.

## Verify the final source

Use [Verify Plate's implementation review](../verify-plate/SKILL.md#review-the-implementation)
on the final candidate before closure, as well as its actual package/route,
runner, source identity and native evidence. Apply its ownership and complexity
gate before expensive final replay; if repair changes the candidate, review the
affected delta and rerun invalidated proof. Its conditional
[regression oracles](../verify-plate/references/regression-oracles.md) preserve
phase-specific focus, pointer, caret, paint and identity contracts; load the
applicable sections, not every domain for every bug. Testing owns test mechanics.

Re-run the full reporter interaction and follow-up against the final source.
Record the tested ref or dirty file fingerprints and, for browser proof, the
serving source. Retain failures: a passing unit test cannot close a red native
case, and a failure before the reported action leaves that interaction unproved.
Never replace Enter with click, weaken an assertion or delete a failing test to
close the same claim. Correct a faulty oracle only with source-backed evidence.

For `visual` acceptance, capture the final state immediately after the exact
interaction, open the resulting image and inspect the claimed pixels at a
legible scale. Record the screenshot and the visible result in the handoff. A
screenshot path without inspection, a passing browser test, DOM attributes,
computed styles or model state cannot close the visual claim. Keep the case
open as `visual-unverified` when no image-capable runner is available. Human
inspection complements rather than replaces any pixel classifier required by
the applicable paint oracle.

Run narrow checks during iteration and the required affected gates for the
settled change. Reuse valid evidence until relevant inputs change. Select
stability repetitions for a demonstrated intermittent risk; explicit corpus
mode retains its stricter executable stability/receipt contract. Exact browser
or device claims need the matching capability; report the missing claim while
continuing independently actionable work.

Local completion requires an accepted implementation review plus the exact case
and required checks passing on final local source. Green behavior alone cannot
accept unjustified compensation. It does not require commit or push. Follow
Task's existing review and delivery gates only when applicable; no separate
review budget or publication authority arises here.

## Handoff

Report the cause, owner, prevention, implementation-review conclusion, actual
red/green and final interaction evidence, and material limits. Keep it concise.
For a delegated or corpus case,
return its ID/source refs, exact test commands, final fingerprints, required
stability, architecture decision and unresolved gates in the existing packet.
Use `candidate-local` for uncommitted/unpushed public-issue handoffs; the public
coordinator owns pushed-ref replay and public completion wording.
