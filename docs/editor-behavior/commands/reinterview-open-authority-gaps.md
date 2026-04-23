---
date: 2026-04-08
topic: editor-behavior-command-reinterview-open-authority-gaps
---

# Command: Re-Interview Open Authority Gaps

## Lane

- bridge lane between doc-governance and implementation/runtime

## When To Run

- when the law stack still cannot answer a winner question cleanly
- when parity says `locked` but audit evidence still feels hand-wavy
- when the lane no longer answers “what should win here?”, “what next?”, or
  “what should move up/down in priority?” without guesswork
- when roadmap or priority reevaluation is blocked on unresolved authority or
  scope questions instead of plain execution reality
- when implementation/runtime planning is blocked because the law stack is still
  too ambiguous to choose or shape a batch honestly

## Invocation

```sh
$deep-interview --quick editor-behavior remaining authority gaps after latest batch
```

## Inputs

- [docs/editor-behavior/markdown-standards.md](docs/editor-behavior/markdown-standards.md)
- [docs/editor-behavior/markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
- [docs/editor-behavior/editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
- [docs/editor-behavior/markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)
- [docs/editor-behavior/master-roadmap.md](docs/editor-behavior/master-roadmap.md)
- [docs/editor-behavior/markdown-editing-reference-audit.md](docs/editor-behavior/markdown-editing-reference-audit.md)
- latest batch findings and browser proof
- current implementation/runtime lane blockers when the ambiguity came from a
  real code or product surface

## Expected Outputs

- refreshed authority boundaries
- explicit remaining non-goals and unresolved gaps
- refreshed roadmap/priority guidance when ambiguity was the blocker
- explicit master-roadmap triage when the interview changes lane order, slice
  order, or what should move up/down next
- clear handoff into either law reconsolidation or batch replanning

## Refresh Afterward

- latest editor-behavior interview/spec artifact under `.omx/specs/`
- [docs/editor-behavior/markdown-standards.md](docs/editor-behavior/markdown-standards.md) if winners changed
- [docs/editor-behavior/markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
- [docs/editor-behavior/editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
- [docs/editor-behavior/markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md) if gate language moved
- [docs/editor-behavior/master-roadmap.md](docs/editor-behavior/master-roadmap.md) if the interview changed implementation priority, lane ordering, or slice triage

## Common Next Step

- If the interview changed authority or law, run
  [reconsolidate-law-stack.md](docs/editor-behavior/commands/reconsolidate-law-stack.md).
- If the interview mostly changed roadmap order or priority, run
  [replan-next-batch.md](docs/editor-behavior/commands/replan-next-batch.md).
- If the interview resolves the blocker down to one concrete approved runtime
  batch, launch it through
  [launch-next-ralph-batch.md](docs/editor-behavior/commands/launch-next-ralph-batch.md).
