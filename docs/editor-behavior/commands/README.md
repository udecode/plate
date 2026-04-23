# Editor Behavior Commands

This is the operator surface for resuming and maintaining
[docs/editor-behavior](docs/editor-behavior).

Use it when you do **not** want to rediscover the workflow from scattered plans,
spec docs, and `.omx` artifacts.

This pack has two lanes:

- doc-governance:
  maintain standards, spec, protocol, parity, audit, and evidence truth
- implementation/runtime:
  choose, launch, and close real code/test/product batches from the roadmap

## Canonical Artifacts

- law stack:
  - [markdown-standards.md](docs/editor-behavior/markdown-standards.md)
  - [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
  - [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
  - [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)
  - [markdown-editing-reference-audit.md](docs/editor-behavior/markdown-editing-reference-audit.md)
- active execution notes:
  - [2026-04-02-editor-behavior-major-execution.md](docs/plans/2026-04-02-editor-behavior-major-execution.md)
  - [2026-04-03-editor-protocol-matrix-completion.md](docs/plans/2026-04-03-editor-protocol-matrix-completion.md)
- canonical remaining implementation roadmap:
  - [master-roadmap.md](docs/editor-behavior/master-roadmap.md)
- active supporting implementation plans:
  - [2026-04-10-math-delimiter-trigger-implementation-plan.md](docs/plans/2026-04-10-math-delimiter-trigger-implementation-plan.md)
  - [2026-04-10-autoformat-runtime-alignment-and-extension-plan.md](docs/plans/2026-04-10-autoformat-runtime-alignment-and-extension-plan.md)
  - [2026-04-09-date-media-expansion-consensus-plan.md](docs/plans/2026-04-09-date-media-expansion-consensus-plan.md)
- historical OMX artifacts:
  - [prd-editor-behavior-major.md](.omx/plans/prd-editor-behavior-major.md)
  - [test-spec-editor-behavior-major.md](.omx/plans/test-spec-editor-behavior-major.md)
  - [deep-interview-editor-behavior-major.md](.omx/specs/deep-interview-editor-behavior-major.md)

## Command Set

### Doc-Governance Lane

- [reconsolidate-law-stack.md](docs/editor-behavior/commands/reconsolidate-law-stack.md)
  Re-sync the standards/spec/protocol/parity/audit stack when truth drifted,
  including after runtime work changed behavior.
- [refresh-evidence-ledger.md](docs/editor-behavior/commands/refresh-evidence-ledger.md)
  Refresh the evidence layer from research when doc truth or runtime planning is
  blocked on weak authority.
- [reinterview-open-authority-gaps.md](docs/editor-behavior/commands/reinterview-open-authority-gaps.md)
  Re-open authority questions when the law stack cannot answer them and either
  doc maintenance or implementation planning is blocked by that ambiguity.

### Implementation / Runtime Lane

- [replan-next-batch.md](docs/editor-behavior/commands/replan-next-batch.md)
  Turn current truth plus the roadmap into one concrete next runtime batch.
- [launch-next-ralph-batch.md](docs/editor-behavior/commands/launch-next-ralph-batch.md)
  Execute the active approved runtime lane, not just the old major plan.

## Fast Routing

### If You Are In A Doc-Governance Problem

- If the docs disagree with each other, or a runtime batch changed behavior
  without the law stack catching up, start with
  [reconsolidate-law-stack.md](docs/editor-behavior/commands/reconsolidate-law-stack.md).
- If the audit or research feels stale, or an implementation lane is blocked on
  weak evidence, start with
  [refresh-evidence-ledger.md](docs/editor-behavior/commands/refresh-evidence-ledger.md).
- If the lane cannot answer “what should win here?”, “what next?”, or “what
  should move up/down in priority?”, run
  [reinterview-open-authority-gaps.md](docs/editor-behavior/commands/reinterview-open-authority-gaps.md)
  before planning.

### If You Are In An Implementation / Runtime Problem

- After authority is clear and you need the next executable runtime slice, run
  [replan-next-batch.md](docs/editor-behavior/commands/replan-next-batch.md).
- If the gate is already closed but you still need the remaining backlog order
  or a narrower next slice, run
  [replan-next-batch.md](docs/editor-behavior/commands/replan-next-batch.md).
- When the next runtime batch is approved and concrete, run
  [launch-next-ralph-batch.md](docs/editor-behavior/commands/launch-next-ralph-batch.md).
- If runtime work exposes law drift, evidence debt, or unresolved authority,
  bounce back to the doc-governance lane instead of forcing more code work.
