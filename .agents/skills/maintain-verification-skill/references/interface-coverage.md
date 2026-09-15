# External interface coverage

Use this check when the selected feature depends on an external read, write or callback. Preserve the project's existing capability and source maps; an operation register is supporting evidence, not a second feature roadmap.

For the selected entities, discover the provider's relevant operations from its versioned specification independently of legacy callers. Record the complete operation denominator when interface completeness is requested. Every operation needs an outcome and an explicit disposition; a documented operation does not automatically authorize a new product feature. Preserve accepted exclusions and human assignments.

Keep four facts separate:

- What the accepted product outcome requires, including conditions attached to newly added behavior.
- What the provider contract supports, with exact method/path, scopes and lifecycle.
- What the legacy and replacement code actually call. A copied specification, generated client method or similarly named local write is not a caller.
- What current evidence proves about access, submission, provider state and the final product consequence.

Trace each write through local persistence, dispatch, provider acceptance, pending/rejected/failed outcomes, final provider identity, reconciliation and retry behavior. Include callbacks or status reads needed to finish the operation. A returned job or pending ID is not a final resource ID. Do not infer approval, expiry, deletion, cancellation or rejection from an undocumented status or a failed read.

Use the existing outcome dispositions: `COVERED`, `REPAIR_EXISTING`, `PRD_READY`, `DECISION_REQUIRED`, `CUSTOMER_CONDITIONAL`, `DEFERRED`, `REJECTED`. A missing provider call for an accepted outcome is an implementation gap even when the legacy app never made that call. Unknown facility usage cannot waive an explicit product requirement. An unused operation outside the accepted product scope needs an attributable disposition, not speculative implementation.

## OpenAPI evidence check

For an OpenAPI 3 specification, run the read-only helper against the project-owned coverage register:

```sh
node scripts/check-interface-coverage.mjs --spec <openapi.json> --coverage <coverage.json>
node scripts/check-interface-coverage.mjs --spec <openapi.json> --coverage <coverage.json> --tag '<exact API tag>' --require-reviewed
node scripts/check-interface-coverage.mjs --spec <openapi.json> --coverage <coverage.json> --tag '<exact API tag>' --require-covered
```

Resolve the script relative to this skill directory. The register has `schemaVersion: 1`, `specSha256` and an `operations` array. Each reviewed row contains `operationId`, `outcomeId`, `disposition`, `authorityRef`, `legacy` (`called`, `not_found`, or `unknown`), `implementation` (`present`, `partial`, or `missing`), `access` (`verified` or `unverified`), `proof` (`source`, `fixture`, or `native`), a nonempty `evidence` string array, `gap`, and `nextOwner`. References identify evidence in the existing source map or current plan; they must not contain credentials or customer data.

The helper discovers method/path/scopes from the specification, detects missing/duplicate/unknown operation records and stale specification bindings, and reports review completeness separately from product coverage. Unlisted operations remain unreviewed. `COVERED` requires recorded native proof, verified access, present implementation and no remaining gap; excluded/deferred rows require a reason. Inspect the actual cited evidence before accepting those fields. The helper validates the register's structure and claims, not the truth or freshness of its receipts.

Use `--require-reviewed` for a claim that the selected interface audit is complete. Use `--require-covered` only when claiming its retained product behavior works. A successful inventory check does not close missing product behavior. Run the existing feature's live recipe and record unavailable prerequisites under the parent maintenance method. These flags grant no provider mutation authority.
