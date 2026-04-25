---
date: 2026-04-08
topic: editor-behavior-command-launch-next-ralph-batch
---

# Command: Launch Next Ralph Batch

## Lane

- implementation/runtime
- fed by approved outputs from `replan-next-batch`

## When To Run

- when the next editor-behavior batch is already decided
- when the law stack is coherent enough to execute instead of interviewing
- when the remaining work belongs in code/tests/docs, not another authority pass
- when the active lane is a real implementation/runtime batch, not just doc
  maintenance

## Invocation

```sh
$ralph "Execute /absolute/path/to/approved-editor-behavior-lane-plan.md"
```

## Inputs

- the active approved lane plan under `docs/plans/`
  or `.omx/plans/`
- [docs/editor-behavior/master-roadmap.md](docs/editor-behavior/master-roadmap.md)
- [docs/plans/2026-04-02-editor-behavior-major-execution.md](docs/plans/2026-04-02-editor-behavior-major-execution.md)
- current law stack in `docs/editor-behavior/`
- the actual package/app/docs surfaces owned by the active lane

## Expected Outputs

- one runtime batch completed or materially advanced
- same-turn verification evidence
- code/tests/docs updated for the active lane
- law stack, roadmap, and supporting plans updated if the batch changed truth

## Refresh Afterward

- [docs/editor-behavior/master-roadmap.md](docs/editor-behavior/master-roadmap.md) if the batch changed lane status, slice status, or what remains next
- [docs/plans/2026-04-02-editor-behavior-major-execution.md](docs/plans/2026-04-02-editor-behavior-major-execution.md)
- the active supporting lane plan under `docs/plans/`
  or `.omx/plans/`
- [docs/editor-behavior/markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md) if law changed
- [docs/editor-behavior/editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md) if scenario rows changed
- [docs/editor-behavior/markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md) if gate status changed
- [docs/editor-behavior/markdown-editing-reference-audit.md](docs/editor-behavior/markdown-editing-reference-audit.md) if evidence changed
- public package/app docs when the runtime lane changed a shipped surface

## Common Next Step

- If the batch changed law truth, run
  [reconsolidate-law-stack.md](docs/editor-behavior/commands/reconsolidate-law-stack.md).
- If the batch exposed evidence debt, run
  [refresh-evidence-ledger.md](docs/editor-behavior/commands/refresh-evidence-ledger.md).
- If the batch exposed unresolved authority instead of plain implementation
  debt, run
  [reinterview-open-authority-gaps.md](docs/editor-behavior/commands/reinterview-open-authority-gaps.md).
- If the batch changed what remains, run
  [replan-next-batch.md](docs/editor-behavior/commands/replan-next-batch.md).
