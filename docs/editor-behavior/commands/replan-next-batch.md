---
date: 2026-04-08
topic: editor-behavior-command-replan-next-batch
---

# Command: Re-Plan Next Batch

## Lane

- implementation/runtime
- fed by doc-governance outputs when authority or gate truth changed

## When To Run

- after authority or gate changes materially and you need to choose the next
  runtime slice
- after a runtime batch changes what is actually left
- after re-interviewing open scope or authority gaps
- after doc-governance work changed what is now safe or worth implementing

## Invocation

Choose the runtime owner:

```text
plate-plan plan the next accepted Plate editor-behavior batch from docs/editor-behavior/master-roadmap.md
plite-plan plan the next accepted Plite editor-behavior batch from docs/editor-behavior/master-roadmap.md
```

When one lane already has a written supporting plan:

```text
plate-plan plan the next accepted Plate batch from docs/plans/<active-lane-plan>.md
plite-plan plan the next accepted Plite batch from docs/plans/<active-lane-plan>.md
```

## Inputs

- [docs/editor-behavior/markdown-parity-matrix.md](../markdown-parity-matrix.md)
- [docs/editor-behavior/master-roadmap.md](../master-roadmap.md)
- [docs/plans/2026-04-02-editor-behavior-major-execution.md](../../plans/2026-04-02-editor-behavior-major-execution.md)
- any active supporting lane plan under `docs/plans/`
- the accepted `best-api` decision when the batch adds, removes, or promotes a
  public plugin or extension

## Expected Outputs

- refreshed full remaining backlog order or narrower next slice
- refreshed master-roadmap lane or slice triage when reality changed
- refreshed supporting lane plan when reality changed
- refreshed execution note if reality changed
- explicit handoff into one next implementation/runtime lane
- explicit note whether a paired doc-governance pass must happen before launch
- no public behavior promotion without an accepted `best-api` target

## Refresh Afterward

- [docs/editor-behavior/master-roadmap.md](../master-roadmap.md)
- [docs/plans/2026-04-02-editor-behavior-major-execution.md](../../plans/2026-04-02-editor-behavior-major-execution.md)
- [docs/editor-behavior/markdown-parity-matrix.md](../markdown-parity-matrix.md) if the active gate wording changed
- relevant supporting plan docs under `docs/plans/`

## Common Next Step

- When the next batch is approved and concrete, run
  [execute-next-batch.md](execute-next-batch.md).
- If public behavior packaging is still unresolved, stop and run
  `best-api design` or `best-api review`; do not encode the decision in the
  implementation plan.
- If replanning shows that truth is still unstable rather than implementation
  ready, return to
  [reconsolidate-law-stack.md](reconsolidate-law-stack.md),
  [refresh-evidence-ledger.md](refresh-evidence-ledger.md),
  or
  [reinterview-open-authority-gaps.md](reinterview-open-authority-gaps.md).
