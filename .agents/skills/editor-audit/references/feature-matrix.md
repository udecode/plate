# Strict Source-to-Contract Matrix

Use this contract for every `full`, `all`, or `exhaustive` audit and before any
claim that Plite or Plate is superior to a reference editor overall. The
manifest defines the atomic concepts. The matrix proves the comparison and
extracts valuable parts from either architecture.

## Contents

- [Symmetric identity](#symmetric-identity)
- [Mapping contract](#mapping-contract)
- [Qualitative comparison](#qualitative-comparison)
- [Base and extraction decisions](#base-and-extraction-decisions)
- [Prior candidates](#prior-candidates)
- [Canonical table](#canonical-table)
- [Material coherence](#material-coherence)
- [Claim gate](#claim-gate)
- [Validation](#validation)

## Symmetric identity

The manifest is the union of:

- atomic concepts originating in the reference;
- relevant Plite-only, Plate-only, cross-layer, and shared concepts;
- public machinery, lifecycle and failure rules, proof topology, and material
  local debt inside the named target.

Use one of these origins for every concept: `reference`, `Plite`, `Plate`,
`Plite/Plate`, or `shared`.

- Write exactly one matrix row for every manifest concept ID.
- Copy the exact ID. Ranges, comma lists, wildcards, and grouped rows are
  invalid.
- Split a concept when its mechanisms need different preferred bases,
  adaptations, debt dispositions, or verdicts.
- Keep a source unit mapped in the coverage manifest even when it does not own
  an independent concept.
- Do not treat “the reference lacks this local feature” as permission to omit
  the local feature.

The machine-readable manifest uses this shape:

```json
{
  "concepts": [
    { "id": "WG-DOC-001", "origin": "reference" },
    { "id": "PLITE-DOC-001", "origin": "Plite" }
  ],
  "priorCandidates": [
    {
      "id": "A3",
      "conceptIds": ["WG-DOC-001"],
      "evidence": "docs/plans/prior-audit.md#a3"
    }
  ]
}
```

`priorCandidates` is required and may be empty.

## Mapping contract

Record the reference, Plite, and Plate independently:

- `exact` — the complete job and contract are traced;
- `partial` — named owners cover only part of the job;
- `absent` — a recorded source search found no applicable owner;
- `not-applicable` — evidence assigns the job outside that layer.

Every mapping needs a concrete source citation or durable evidence link.
Use these checkable forms:

```text
exact — public=`src/api.ts:10`; owner=`src/owner.ts:20`; consumers=`src/use.ts:30`; lifecycle=`src/lifecycle.ts:40`; proof=`src/owner.test.ts:50` — reason
partial — covers=`src/owner.ts:20`; missing=[gap evidence](docs/plans/audit.md#gap); proof=`src/owner.test.ts:50` — reason
absent — [source scan](docs/plans/audit.md#source-scan) found no matching owner
not-applicable — `docs/vision/owner.md:10` assigns the job to another layer
```

An `exact` mapping that names only a nearby owner is false precision. It must
trace:

1. public contract;
2. internal semantic owner;
3. representative consumers;
4. lifecycle, cleanup, transaction, and failure behavior;
5. tests or other proof.

Use `partial` when any applicable facet differs or remains unproved. Its
`covers`, `missing`, and `proof` facets must all be explicit.

## Qualitative comparison

Judge every concept on:

- correctness;
- API and types;
- data model and collaboration;
- ownership and lifecycle;
- runtime and performance;
- proof and host coverage.

Use `reference stronger`, `Plite stronger`, `Plate stronger`,
`Plite/Plate stack stronger`, `equivalent`, `different tradeoff`, or
`insufficient evidence`, followed by a concept-specific reason and source
citation. A dimension may use `not-applicable` with evidence.

Do not use aggregate numbers. Do not reuse a generic six-cell winner profile
across different concepts. A valid cell identifies the mechanism that wins or
creates the tradeoff, not merely the repository name.

The final `Classification` uses the same comparison values. `Preferred base`
uses `reference`, `Plite`, `Plate`, `Plite/Plate stack`, `tie`,
`different tradeoff`, or `insufficient evidence`. Both need evidence and must
agree. A preferred layer must have an `exact` or `partial` mapping.

## Base and extraction decisions

The preferred base is not the final action. Record all three independent
pressure decisions:

- `Reference adaptation`: `adapt`, `keep-local`, `reject`, `defer`, or
  `not-applicable`;
- `Local debt`: `material`, `non-material`, `none`, or
  `insufficient evidence`;
- `Proof adaptation`: `adapt`, `keep-local`, `reject`, `defer`, or
  `not-applicable`.

Every disposition needs a source or dossier citation. `not-applicable` is legal
for reference or proof adaptation only when the reference mapping is `absent`
or `not-applicable`.

`Proof adaptation` reconciles portable invariants and proof topology from
`editor-test-harvester`. “Tests current” is provenance, not a disposition.

A valid hybrid may say:

- Plite is the preferred base because its data model fits local constraints;
- Wordgard's centralized conflict owner should be adapted;
- Plite's caller-owned cleanup is material debt;
- Wordgard's focused invariant test should be adapted;
- the final verdict is `rearchitect — ...`, `P1`.

That is not a contradiction. It is the point of the audit.

## Prior candidates

Search durable earlier audits only after independently mapping current source.
Then reconcile every manifest candidate:

```text
`A3` reaffirm — [A3 dossier](docs/plans/prior-audit.md#a3) still matches current ownership debt
`A4` supersede — [current evidence](docs/plans/audit.md#a4) narrows the work to proof adaptation
`A5` reject — [current evidence](docs/plans/audit.md#a5) shows the old premise is gone
none — [candidate search](docs/plans/audit.md#candidate-search) found no matching P0-P3 dossier
```

Use `<br>` between several candidate clauses in one table cell. Candidate IDs
must exist in the manifest and include that concept ID. Every manifest
candidate must be reconciled exactly once. Never silently downgrade, omit, or
rename a prior candidate.

## Canonical table

```markdown
| ID           | Concept            | Origin    | Reference mapping                                                                                                                                                                                                                           | Plite mapping                                                                                                                                                                                                                                          | Plate mapping                                                                   | Correctness                                                                     | API/types                                                                      | Data/collab                                                                  | Ownership/lifecycle                                                           | Runtime/perf                                                              | Proof/host                                                                                                                | Classification                                                                   | Preferred base                                                           | Reference adaptation                                                | Local debt                                                       | Proof adaptation                                                                                            | Prior candidates                                                                 | Verdict                                                              | Priority |
| ------------ | ------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------- |
| `WG-DOC-001` | Conflict ownership | reference | exact — public=`../wordgard/src/api.ts:10`; owner=`../wordgard/src/owner.ts:20`; consumers=`../wordgard/src/use.ts:30`; lifecycle=`../wordgard/src/lifecycle.ts:40`; proof=`../wordgard/src/owner.test.ts:50` — complete reference contract | exact — public=`packages/plitejs/src/api.ts:10`; owner=`packages/plitejs/src/owner.ts:20`; consumers=`packages/plitejs/src/use.ts:30`; lifecycle=`packages/plitejs/src/lifecycle.ts:40`; proof=`packages/plitejs/src/owner.test.ts:50` — complete local contract | not-applicable — `docs/vision/plate.md:10` assigns this substrate rule to Plite | reference stronger — `../wordgard/src/owner.ts:20` centralizes conflict cleanup | Plite stronger — `packages/plitejs/src/api.ts:10` preserves structural inference | Plite stronger — `packages/plitejs/src/change.ts:10` preserves multi-root JSON | reference stronger — `../wordgard/src/lifecycle.ts:40` owns cleanup centrally | equivalent — `benchmarks/editor/result.json` shows no material difference | different tradeoff — `packages/plitejs/src/owner.test.ts:50` is broader while `../wordgard/src/owner.test.ts:50` is sharper | Plite stronger — `packages/plitejs/src/change.ts:10` is the better applicable base | Plite — `packages/plitejs/src/change.ts:10` preserves the local data model | adapt — `../wordgard/src/owner.ts:20` should replace caller cleanup | material — `packages/plitejs/src/api.ts:10` exposes caller cleanup | adapt — [Wordgard harvest](docs/editor-test-harvester/wordgard/report.md) contributes the focused invariant | `A3` reaffirm — [A3 dossier](docs/plans/prior-audit.md#a3) targets the same debt | rearchitect — keep the Plite base and move cleanup into its compiler | P1       |
```

The matrix is the complete comparison ledger. Put current/proposed shapes,
adoption, deletion, detailed proof, and planning routes in linked dossiers for
material rows.

## Material coherence

The verdict is `keep`, `steal`, `rearchitect`, `hard-cut`, `move`, `reject`, or
`defer`, with a reason.

- Any `adapt` reference mechanism, `material` local debt, or `adapt` proof
  topology requires `steal`, `rearchitect`, `hard-cut`, or `move` and
  `P0`-`P3`.
- A material verdict requires `P0`-`P3`.
- A non-material verdict requires priority `—`.
- `insufficient evidence` local debt requires `defer`.
- `reference stronger` requires `adapt` or an evidence-backed `defer`.
- A local winner still answers what the reference does better inside the
  concept and why that pressure is or is not material.

Use `P0`-`P3` only for material present work. Do not hide extracted value under
`keep` because the local architecture wins overall.

## Claim gate

A global superiority claim is legal only when:

1. the validator passes against the full current symmetric manifest;
2. every row has all three mappings, six source-backed dimensions, one final
   classification, one preferred base, three extraction/debt dispositions, one
   prior-candidate disposition cell, and one verdict;
3. every `insufficient evidence` row is resolved or explicitly excluded from
   the claim's named scope;
4. the conclusion enumerates counts and IDs for every origin, classification,
   preferred base, adaptation, debt, prior-candidate disposition, verdict, and
   priority;
5. the wording names the evaluated constraints and every exception.

A cross-reference conclusion requires every contributing matrix to pass
independently.

“Every Plite/Plate feature is superior” is stronger: every row must prefer
`Plite`, `Plate`, or `Plite/Plate stack`. A single reference win, tie, different
tradeoff, or unknown disproves it. Even when every base is local, adapted
reference submechanisms and local debt remain material findings.

An older audit without a passing current matrix is `legacy-incomplete`. A sync
may refresh provenance, tests, issues, and changed concepts, but it may not
repeat or strengthen a global superiority claim until the full matrix is
backfilled and all prior candidates are reconciled.

## Validation

```bash
node .agents/rules/editor-audit/scripts/validate-concept-matrix.mjs \
  --manifest <coverage-manifest.json> \
  --ledger <concept-matrix.md>
```

Close with exact counts and IDs for expected concepts, origins, matrix rows,
classifications, preferred bases, reference adaptations, local debt, proof
adaptations, prior candidates, duplicates, canned profiles, grouped IDs,
unknown IDs, missing IDs, and unresolved comparisons. Success means every
integrity count is zero and expected concepts equals matrix rows.
