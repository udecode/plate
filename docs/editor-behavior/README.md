# Editor Behavior Docs

This directory is the source of truth for editor-behavior standards and
coverage.

Use it to answer three different questions:

1. What is the decision model?
2. What behavior do we want?
3. What is actually covered right now?

## Start Here

- Read [markdown-standards.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-standards.md) first.
  It defines the authority model:
  - syntax specs first
  - Typora for markdown-native behavior
  - GitHub for GFM-only semantics
  - Notion for block-editor-native behavior
  - Google Docs for table / styling / review behavior
  - Milkdown as the OSS cross-check

## File Guide

- [markdown-parity-matrix.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-parity-matrix.md)
  The family-level coverage gate.
  Use this to see:
  - which existing feature families are covered
  - what evidence exists
  - what is deferred
  - what still blocks a release

- [editor-protocol-matrix.md](/Users/zbeyens/git/plate/docs/editor-behavior/editor-protocol-matrix.md)
  The exhaustive scenario matrix.
  Use this to see:
  - the protocol schema for scenario-complete behavior coverage
  - row-level scenarios, authorities, and evidence mapping
  - scenario dimensions for full behavior coverage
  - which rows are tested, specified, partial, or deferred
  - which interaction classes are still deferred into the integration red suite

- [markdown-editing-spec.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-editing-spec.md)
  The normative behavior spec.
  Use this to see:
  - invariants
  - ownership rules
  - canonical behavior examples
  - locked policy calls

- [markdown-editing-reference-audit.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-editing-reference-audit.md)
  Reference evidence.
  Use this to see:
  - what Typora says
  - what Milkdown says
  - where they diverge
  - where Plate had to choose

- [editor-behavior-architecture.md](/Users/zbeyens/git/plate/docs/editor-behavior/editor-behavior-architecture.md)
  Long-horizon architecture.
  Use this when the question is:
  - should behavior stay plugin-scattered?
  - what would a profile-driven model look like?
  - how would Plate support Typora / Notion / Docs-style profiles cleanly?

## Supporting Dirs

- execution notes live under [docs/plans](/Users/zbeyens/git/plate/docs/plans)
  The active editor-behavior execution notes are:
  [2026-04-02-editor-behavior-major-execution.md](/Users/zbeyens/git/plate/docs/plans/2026-04-02-editor-behavior-major-execution.md)
  and
  [2026-04-03-editor-protocol-matrix-completion.md](/Users/zbeyens/git/plate/docs/plans/2026-04-03-editor-protocol-matrix-completion.md).
  This cleanup pass is tracked in
  [2026-04-03-editor-behavior-doc-structure.md](/Users/zbeyens/git/plate/docs/plans/2026-04-03-editor-behavior-doc-structure.md)

- [references](/Users/zbeyens/git/plate/docs/editor-behavior/references)
  Inventories and local reference corpora for Typora and Milkdown.

- [solutions](/Users/zbeyens/git/plate/docs/editor-behavior/solutions)
  Reusable learnings discovered during this lane.

## Reading Order

### If you want the big picture

1. [markdown-standards.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-standards.md)
2. [editor-behavior-architecture.md](/Users/zbeyens/git/plate/docs/editor-behavior/editor-behavior-architecture.md)
3. [markdown-parity-matrix.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-parity-matrix.md)

### If you want the current release gate

1. [markdown-parity-matrix.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-parity-matrix.md)
2. [2026-04-02-editor-behavior-major-execution.md](/Users/zbeyens/git/plate/docs/plans/2026-04-02-editor-behavior-major-execution.md)

### If you want concrete behavior rules

1. [markdown-editing-spec.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-editing-spec.md)
2. [markdown-editing-reference-audit.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-editing-reference-audit.md)

### If you want exhaustive protocol coverage

1. [editor-protocol-matrix.md](/Users/zbeyens/git/plate/docs/editor-behavior/editor-protocol-matrix.md)
2. [markdown-editing-spec.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-editing-spec.md)
3. [markdown-parity-matrix.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-parity-matrix.md)

## Practical Rule

- Use the spec to define behavior.
- Use the protocol matrix to enumerate exhaustive scenarios.
- Use the parity matrix to decide whether a family is covered enough.
- Use the audit when a rule needs external grounding.
- Use the architecture doc only when the question is structural, not behavioral.
- If two docs appear to say the same thing, the spec wins for law, the protocol
  matrix wins for exhaustive cases, and the parity matrix wins for ship gate.
