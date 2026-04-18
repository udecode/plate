# Editor Behavior Docs

This directory is the source of truth for editor-behavior standards and
coverage.

Use it to answer three different questions:

1. What is the decision model?
2. What behavior do we want?
3. What is actually covered right now?

## Start Here

- Read [markdown-standards.md](docs/editor-behavior/markdown-standards.md) first.
  It defines the authority methodology:
  - syntax specs first
  - choose references per concrete surface, not by broad category default
  - use candidate pools such as Typora, Obsidian, Google Docs, Notion,
    GitHub, and Milkdown as routing hints, not governing winners
- If you want to resume or operate this lane without re-reading everything,
  start with
  [commands/README.md](docs/editor-behavior/commands/README.md).

## File Guide

- [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)
  The family-level coverage gate.
  Use this to see:

  - which existing feature families are covered
  - what evidence exists
  - what is deferred
  - what still blocks a release

- [master-roadmap.md](docs/editor-behavior/master-roadmap.md)
  The canonical remaining implementation roadmap.
  Use this to see:

  - what is already closed
  - what still remains to implement
  - lane order and next-batch sequencing
  - which supporting plans own each remaining lane

- [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
  The exhaustive scenario matrix.
  Use this to see:

  - the protocol schema for scenario-complete behavior coverage
  - row-level scenarios, authorities, and evidence mapping
  - scenario dimensions for full behavior coverage
  - which rows are tested, specified, partial, or deferred
  - which interaction classes are still deferred into the integration red suite

- [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
  The normative behavior spec.
  Use this to see:

  - invariants
  - ownership rules
  - canonical behavior examples
  - locked policy calls

- [markdown-editing-reference-audit.md](docs/editor-behavior/markdown-editing-reference-audit.md)
  Reference evidence.
  Use this to see:

  - what the first Typora / Milkdown audit says
  - where that first audit still matters
  - where newer Obsidian research adds stronger product pressure
  - where Plate had to choose

- [editor-behavior-architecture.md](docs/research/systems/editor-behavior-architecture.md)
  Long-horizon architecture.
  Use this when the question is:
  - should behavior stay plugin-scattered?
  - what would a profile-driven model look like?
  - how would Plate support Typora / Obsidian / Notion / Docs-style profiles cleanly?

## Supporting Dirs

- execution notes live under [docs/plans](docs/plans)
  The main historical editor-behavior execution notes are:
  [2026-04-02-editor-behavior-major-execution.md](docs/plans/2026-04-02-editor-behavior-major-execution.md)
  and
  [2026-04-03-editor-protocol-matrix-completion.md](docs/plans/2026-04-03-editor-protocol-matrix-completion.md).
  Use them for batch history, not as the current gate source.
  Current gate truth belongs to
  [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md).
  Current implementation-roadmap truth belongs to
  [master-roadmap.md](docs/editor-behavior/master-roadmap.md).
  This cleanup pass is tracked in
  [2026-04-03-editor-behavior-doc-structure.md](docs/plans/2026-04-03-editor-behavior-doc-structure.md)
- operator commands live under
  [commands](docs/editor-behavior/commands)
  Use this as the resume surface for reconsolidation, evidence refresh,
  re-interview, re-planning, and batch launch.

- [docs/research](docs/research)
  Compiled external-reference research.
  Use this for Typora-, Obsidian-, and Milkdown-derived source summaries,
  concepts, decisions, and system maps.

- `../raw`
  Private raw evidence layer.
  Use this for full third-party corpora when deeper verification is needed.

- [docs/solutions](docs/solutions)
  Reusable learnings, including the editor-behavior methodology docs that were
  moved out of this folder.

## Reading Order

### If you want the big picture

1. [markdown-standards.md](docs/editor-behavior/markdown-standards.md)
2. [editor-behavior-architecture.md](docs/research/systems/editor-behavior-architecture.md)
3. [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)
4. [master-roadmap.md](docs/editor-behavior/master-roadmap.md)

### If you want the current release gate

1. [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)
2. [commands/README.md](docs/editor-behavior/commands/README.md)
3. [2026-04-02-editor-behavior-major-execution.md](docs/plans/2026-04-02-editor-behavior-major-execution.md) only when you need the historical execution trail

### If you want to resume or maintain the lane

1. [commands/README.md](docs/editor-behavior/commands/README.md)
2. [master-roadmap.md](docs/editor-behavior/master-roadmap.md)
3. [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)
4. [2026-04-02-editor-behavior-major-execution.md](docs/plans/2026-04-02-editor-behavior-major-execution.md) when you need batch history

### If you want concrete behavior rules

1. [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
2. [markdown-editing-reference-audit.md](docs/editor-behavior/markdown-editing-reference-audit.md)
3. [docs/research](docs/research) when you need the
   compiled external-reference layer behind the audit

### If you want exhaustive protocol coverage

1. [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
2. [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
3. [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)

## Practical Rule

- Use the spec to define behavior.
- Use the protocol matrix to enumerate exhaustive scenarios.
- Use the parity matrix to decide whether a family is covered enough.
- Use the audit when a rule needs external grounding.
- Use the architecture doc only when the question is structural, not behavioral.
- If two docs appear to say the same thing, the spec wins for law, the protocol
  matrix wins for exhaustive cases, and the parity matrix wins for ship gate.
