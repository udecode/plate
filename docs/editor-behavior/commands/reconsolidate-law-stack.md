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

```text
auto reconsolidate the editor-behavior law stack from current source and evidence
```

## Inputs

- [docs/editor-behavior/README.md](../README.md)
- [docs/editor-behavior/markdown-standards.md](../markdown-standards.md)
- [docs/editor-behavior/markdown-editing-spec.md](../markdown-editing-spec.md)
- [docs/editor-behavior/editor-protocol-matrix.md](../editor-protocol-matrix.md)
- [docs/editor-behavior/markdown-parity-matrix.md](../markdown-parity-matrix.md)
- [docs/editor-behavior/master-roadmap.md](../master-roadmap.md)
- [docs/editor-behavior/markdown-editing-reference-audit.md](../markdown-editing-reference-audit.md)
- [docs/research/systems/editor-behavior-architecture.md](../../research/systems/editor-behavior-architecture.md)
- active execution notes under `docs/plans/`
- the relevant changed runtime/code/docs surface when the contradiction came
  from implementation work

## Expected Outputs

- refreshed law stack with contradictions removed
- refreshed winner map if authority moved
- refreshed current gate wording if parity changed
- refreshed protocol rows when the readable law changed
- explicit behavior packaging classification when changed law affects
  invariant, option, capability, or app-policy ownership

## Refresh Afterward

- [docs/editor-behavior/README.md](../README.md)
- [docs/editor-behavior/markdown-standards.md](../markdown-standards.md)
- [docs/editor-behavior/markdown-editing-spec.md](../markdown-editing-spec.md)
- [docs/editor-behavior/editor-protocol-matrix.md](../editor-protocol-matrix.md)
- [docs/editor-behavior/markdown-parity-matrix.md](../markdown-parity-matrix.md)
- [docs/editor-behavior/master-roadmap.md](../master-roadmap.md) if the contradiction changed implementation sequencing or lane triage
- [docs/editor-behavior/markdown-editing-reference-audit.md](../markdown-editing-reference-audit.md)

## Common Next Step

- If evidence drift caused the contradiction, run
  [refresh-evidence-ledger.md](refresh-evidence-ledger.md).
- If the stack is coherent again and the next batch is still unclear, run
  [replan-next-batch.md](replan-next-batch.md).
- If the stack is coherent again and the next runtime batch is already approved,
  run
  [execute-next-batch.md](execute-next-batch.md).
- If the contradiction changes reusable packaging doctrine, run
  `best-api repair`. If it proposes a public plugin, obtain an accepted
  `best-api design` or `best-api review` decision before replanning execution.
