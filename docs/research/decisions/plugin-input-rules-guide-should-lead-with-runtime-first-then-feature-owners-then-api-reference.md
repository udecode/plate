---
title: Plugin input rules guide should lead with runtime first then feature owners then API reference
type: decision
status: accepted
updated: 2026-04-15
source_refs:
  - docs/research/sources/tiptap/input-rules-and-extension-doc-patterns.md
  - docs/research/sources/prosemirror/guide-reference-and-example-doc-patterns.md
  - docs/research/sources/lexical/markdown-package-and-shortcuts-doc-patterns.md
  - docs/research/sources/slate/walkthrough-concepts-and-api-doc-patterns.md
  - docs/solutions/style.md
  - .agents/rules/docs-plugin.mdc
related:
  - docs/research/systems/plugin-input-rule-doc-pattern-landscape.md
---

# Plugin input rules guide should lead with runtime first then feature owners then API reference

## Question

What documentation structure gives Plate the best DX for the new Plugin Input
Rules guide while staying close to Plate's own docs style?

## Decision

Use this order:

1. runtime mental model
2. quick start
3. feature-owned rule families
4. local copied shortcuts
5. custom rules
6. execution model
7. API reference

## Why

- Tiptap proves the concept deserves its own page.
- Slate proves the teaching flow should be progressive, not reference-first.
- Lexical proves package wiring should stay explicit and scannable.
- ProseMirror proves the exact primitive definitions belong in a final
  reference section, not in the opening.
- Plate's own `style.md` and `docs-plugin.mdc` favor tutorial-first,
  approachable, example-led documentation.

## Consequences

- The new guide should not read like a renamed API dump.
- `AutoformatKit` should appear as one local-copy example, not the conceptual
  center.
- Feature pages should link back to the guide for runtime explanations.
- The final `## API Reference` should be the place for exact helper-level
  details.
