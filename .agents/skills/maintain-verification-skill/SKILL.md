---
name: maintain-verification-skill
description: "Repair a verification workflow or audit its feature coverage when requested."
---

# Maintain a verification skill

Find the verification skill's source owner, inventory and proof harness. Edit
owned sources and regenerate installed copies; preserve protected dependencies.
Use the active request to choose the work:

- **Workflow audit or escaped defect:** trace the reported acceptance through
  discovery, setup, real action, assertion, runner result and completion claim.
  Find the first missing or misleading boundary. Inspect actual tests and failed
  evidence, not just the skill's wording. Repair that owner and re-exercise the
  affected decision or command. This scope does not require launching every
  product feature or certify product readiness.
- **Product feature coverage:** use the full [feature pass](references/feature-pass.md).
  The default denominator is the canonical inventory; narrow it only for an
  explicitly scoped request. Source inspection and live execution cover each
  selected entry. An unreachable prerequisite remains a coverage gap.

For platform-specific commands or delegation, read the
[Codex runtime adapter](../poteto-mode/references/codex-runtime.md).

## Repair the escape mechanism

Distinguish missing behavior, missing proof, misleading proof and an execution
mistake. A passing substitute cannot close a failed or unexecuted reported
interaction. Preserve the failure and its exact input/consumer boundary.

Prefer a canonical owner, a stronger existing assertion/helper or a runner
that rejects invalid evidence over another instruction or wrapper. Reuse the
project's existing test inventory and receipt format. Where a helper changes,
show it accepts valid evidence and rejects the known false positive. Do not add
source-text tests merely to freeze wording. If the current rule already forbids
the mistake, diagnose why it was missed instead of duplicating that rule.

Product defects remain open; do not rewrite the inventory to hide them. Product
repairs proceed only when the active request authorizes them. A recurring owner
or invariant failure may justify the project's architecture review; the verifier
does not invent a redesign or new public API on its own.

## Verify and report

Follow Maintain Workflow for shared-source changes, provenance and installation.
Use source/link checks for prose changes, actual execution for changed helpers,
and the affected live recipe for browser-driving changes. Broad changes to
routing or completion use its paired behavioral trials. Reuse valid evidence.

Report **clean**, **changed** or **blocked**, with the scope, source/proof
coverage and remaining gaps. A clean workflow audit is not clean product
coverage. Keep conclusions in the existing plan/artifact and preserve original
failed evidence through cleanup. Continue authorized corrections to their
required proof; publish only under actual publication authority.
