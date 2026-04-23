---
date: 2026-04-08
topic: editor-behavior-command-reconsolidate-law-stack
---

# Command: Reconsolidate Law Stack

## Lane

- doc-governance
- also used after implementation/runtime batches when shipped behavior moved

## When To Run

- after any batch that changes editor-behavior truth
- after any pass where standards, spec, protocol, parity, or audit drift apart
- after any branch merge that makes the roadmap or gate status disagree with the law stack
- after runtime/code work lands before the law stack is updated to match

## Invocation

```sh
$editor-spec docs/editor-behavior law-stack reconsolidation
```

## Inputs

- [docs/editor-behavior/README.md](docs/editor-behavior/README.md)
- [docs/editor-behavior/markdown-standards.md](docs/editor-behavior/markdown-standards.md)
- [docs/editor-behavior/markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
- [docs/editor-behavior/editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
- [docs/editor-behavior/markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)
- [docs/editor-behavior/master-roadmap.md](docs/editor-behavior/master-roadmap.md)
- [docs/editor-behavior/markdown-editing-reference-audit.md](docs/editor-behavior/markdown-editing-reference-audit.md)
- active execution notes under `docs/plans/`
- the relevant changed runtime/code/docs surface when the contradiction came
  from implementation work

## Expected Outputs

- refreshed law stack with contradictions removed
- refreshed winner map if authority moved
- refreshed current gate wording if parity changed
- refreshed protocol rows when the readable law changed

## Refresh Afterward

- [docs/editor-behavior/README.md](docs/editor-behavior/README.md)
- [docs/editor-behavior/markdown-standards.md](docs/editor-behavior/markdown-standards.md)
- [docs/editor-behavior/markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
- [docs/editor-behavior/editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
- [docs/editor-behavior/markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)
- [docs/editor-behavior/master-roadmap.md](docs/editor-behavior/master-roadmap.md) if the contradiction changed implementation sequencing or lane triage
- [docs/editor-behavior/markdown-editing-reference-audit.md](docs/editor-behavior/markdown-editing-reference-audit.md)

## Common Next Step

- If evidence drift caused the contradiction, run
  [refresh-evidence-ledger.md](docs/editor-behavior/commands/refresh-evidence-ledger.md).
- If the stack is coherent again and the next batch is still unclear, run
  [replan-next-batch.md](docs/editor-behavior/commands/replan-next-batch.md).
- If the stack is coherent again and the next runtime batch is already approved,
  run
  [launch-next-ralph-batch.md](docs/editor-behavior/commands/launch-next-ralph-batch.md).
