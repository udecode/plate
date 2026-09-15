# Plite document boundary patch

Objective:
Make every public Plite document ingress reject malformed `meta` and `roots`
containers before construction, schema fitting, or editor replacement can accept
or discard them.

Completion threshold:
One shared private document-shape owner is used by initial-value normalization,
`schema.assertDocument`, and schema fitting. A focused regression proves the
current mismatch red and the repaired behavior green for raw and closed schemas,
including schema fitting and atomic direct and persisted replacement. Changeset
applicability, the decision record, decision trail, and applicable Plite checks
are complete.

Verification surface:
`packages/plitejs/src/core/initial-value.ts`, `editor-schema.ts`, the compiled
slice fitter, public replacement paths, and
`packages/plitejs/test/schema-identity-contract.test.ts`. Run the focused test,
adjacent schema/value tests, source-first `plitejs` typecheck, scoped lint, and
`pnpm check:plite:dev`.

Constraints:
Preserve the public JSON document shape, schema identity, runtime node keys, and
optional persisted element IDs as separate concerns. Keep constructor array
shorthand. Add no public API, compatibility wrapper, browser claim, or generated
registry/barrel work. Work stays in the current checkout with no commit, push,
PR, or external message.

Boundaries:
This is one Plite model-boundary repair. It does not redesign nodes, persistence,
identity, collaboration, history, or the compiled grammar. The malformed inputs
are strict-JSON values whose `meta` is not a record, whose `roots` is not a
record, or whose named-root value is not an array.

Blocked condition:
The public ingress paths cannot share one shape contract without a dependency
cycle or a public behavior conflict. Continue independent proof and report the
exact remaining conflict before considering the goal blocked.

Work Checklist:

- [x] Record the exact mismatch and source owner; add the focused regression.
- [x] Run the regression red and verify it fails for the observed acceptance.
- [x] Implement one private document-shape validator and route all three owners.
- [x] Run the focused and adjacent behavior checks green.
- [x] Resolve changeset applicability and update the accepted decision record.
- [x] Run source-first typecheck, scoped lint, and `check:plite:dev`.
- [x] Reconcile the decision trail, plan obligations, evidence, and goal state.

Method obligations:
Task owns scope, authority, proof, and closure. Patch requires symptom evidence,
root cause, red-before-green proof, a durable owner, focused verification, and a
changeset when the current `main` release baseline has a package delta. Autogoal
retains this checklist through completion.
Show Me Your Work records only material decisions and verified checkpoints.
The accepted Best API Review target in
`docs/research/decisions/model-document-boundary.md` governs the shape: reject
malformed containers consistently without creating another document model.
Autoreview does not run on `next`; browser proof does not apply to this pure
model boundary.

Case:
`model-document-boundary:malformed-containers`. Setup: create raw and closed
editors with a valid paragraph document. Action: pass eight strict-JSON documents
covering malformed `meta`, `roots`, primary-root redefinition, and one named root to construction,
`assertDocument`, schema fitting, direct replacement, and persisted-envelope replacement.
Outcome: every ingress rejects; replacement leaves the prior document unchanged.

Verification evidence:
The focused test failed red with `raw: numeric metadata: assertion` because
`assertDocument` accepted the malformed document while construction rejected it.
The same focused file and four adjacent files pass after routing all ingress
paths through the shared shape validator: 33 tests total. The full `plitejs`
source-first typecheck and scoped formatting/lint pass. The
[verification receipt](artifacts/model-document-boundary-patch/verification.md)
records source fingerprints and the unrelated failures reached by the aggregate
checkout check.

Open risks:
The whole checkout's aggregate test lane remains red in concurrently edited
React rendering and bootstrap initializer cases. The exact patch behavior,
static surface, formatting, and atomicity checks pass; no broader checkout-green
claim is made.

Next action:
Hand off the completed local patch. Resolve the unrelated aggregate failures in
their owning work before any release-quality whole-checkout claim.
