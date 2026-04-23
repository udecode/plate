---
date: 2026-04-08
topic: editor-behavior-command-refresh-evidence-ledger
---

# Command: Refresh Evidence Ledger

## Lane

- doc-governance
- supporting lane for implementation/runtime when evidence is the blocker

## When To Run

- when the audit feels stale
- when a new external reference pass landed
- when the law stack has unresolved `gap`, `partial`, or `tension` rows that may already be answerable from compiled research
- when a runtime batch exposes weak authority, thin product pressure, or shaky
  winner claims

## Invocation

Default:

```sh
research-maintain editor behavior references
```

Escalate when compiled coverage is too thin or stale:

```sh
research-full editor behavior references
```

## Inputs

- [docs/research/README.md](docs/research/README.md)
- [docs/research/commands/maintain.md](docs/research/commands/maintain.md)
- [docs/research/commands/full-pipeline.md](docs/research/commands/full-pipeline.md)
- relevant `docs/research/sources/**`, `docs/research/entities/**`, and `docs/research/systems/**`
- [docs/editor-behavior/markdown-editing-reference-audit.md](docs/editor-behavior/markdown-editing-reference-audit.md)

## Expected Outputs

- refreshed compiled research where safe
- refreshed audit history and gap notes
- explicit evidence changes recorded instead of fake certainty
- clear signal whether law docs need reconsolidation

## Refresh Afterward

- [docs/editor-behavior/markdown-editing-reference-audit.md](docs/editor-behavior/markdown-editing-reference-audit.md)
- [docs/editor-behavior/markdown-standards.md](docs/editor-behavior/markdown-standards.md) if authority moved
- [docs/editor-behavior/markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md) if readable law moved
- [docs/editor-behavior/editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md) if scenario rows moved
- [docs/editor-behavior/markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md) if gate status moved
- [docs/editor-behavior/master-roadmap.md](docs/editor-behavior/master-roadmap.md) if the refreshed evidence changes implementation priority or lane triage

## Common Next Step

- If research closed the gap, run
  [reconsolidate-law-stack.md](docs/editor-behavior/commands/reconsolidate-law-stack.md).
- If research still cannot answer the open question, run
  [reinterview-open-authority-gaps.md](docs/editor-behavior/commands/reinterview-open-authority-gaps.md).
- If research clarified implementation priority or unblocked a real runtime
  slice, run
  [replan-next-batch.md](docs/editor-behavior/commands/replan-next-batch.md).
