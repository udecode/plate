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

Default:

```sh
$ralplan --consensus --direct docs/editor-behavior/master-roadmap.md
```

When one lane already has a written supporting plan:

```sh
$ralplan --consensus --direct docs/plans/<active-lane-plan>.md
```

## Inputs

- [docs/editor-behavior/markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)
- [docs/editor-behavior/master-roadmap.md](docs/editor-behavior/master-roadmap.md)
- [docs/plans/2026-04-02-editor-behavior-major-execution.md](docs/plans/2026-04-02-editor-behavior-major-execution.md)
- any active supporting lane plan under `docs/plans/`
- any active lane-specific planning artifact under `.omx/plans/`

## Expected Outputs

- refreshed full remaining backlog order or narrower next slice
- refreshed master-roadmap lane or slice triage when reality changed
- refreshed supporting lane plan when reality changed
- refreshed execution note if reality changed
- explicit handoff into one next implementation/runtime lane
- explicit note whether a paired doc-governance pass must happen before launch

## Refresh Afterward

- [docs/editor-behavior/master-roadmap.md](docs/editor-behavior/master-roadmap.md)
- [docs/plans/2026-04-02-editor-behavior-major-execution.md](docs/plans/2026-04-02-editor-behavior-major-execution.md)
- [docs/editor-behavior/markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md) if the active gate wording changed
- relevant supporting plan docs under `docs/plans/`
- relevant lane-specific OMX planning artifacts under `.omx/plans/`

## Common Next Step

- When the next batch is approved and concrete, run
  [launch-next-ralph-batch.md](docs/editor-behavior/commands/launch-next-ralph-batch.md).
- If replanning shows that truth is still unstable rather than implementation
  ready, return to
  [reconsolidate-law-stack.md](docs/editor-behavior/commands/reconsolidate-law-stack.md),
  [refresh-evidence-ledger.md](docs/editor-behavior/commands/refresh-evidence-ledger.md),
  or
  [reinterview-open-authority-gaps.md](docs/editor-behavior/commands/reinterview-open-authority-gaps.md).
