---
title: ProseMirror guide, reference, and example doc patterns
type: source
status: partial
updated: 2026-04-15
source_refs:
  - https://prosemirror.net/docs/guide/
  - https://prosemirror.net/docs/ref/#inputrules.InputRule
  - https://prosemirror.net/examples/markdown/
  - /Users/zbeyens/git/prosemirror/README.md
related:
  - docs/research/systems/plugin-input-rule-doc-pattern-landscape.md
---

# ProseMirror guide, reference, and example doc patterns

## Purpose

This page compiles how ProseMirror splits guide material, reference material,
and runnable examples around the input-rules lane.

## Strongest explicit signals

- ProseMirror keeps conceptual docs, API reference, and examples as clearly
  separate surfaces.
- `InputRule` lives in the reference docs, not in the guide.
- The markdown example acts as the practical bridge between theory and API.

## Documentation pattern

- **Guide** teaches the editor model and plugin model.
- **Reference** defines precise API objects and helper functions.
- **Examples** show what the stack looks like in a real editor.

## Plate-relevant takeaways

- The reference-first surface is strong for exactness but weak for onboarding.
- ProseMirror’s split is great for the final `## API Reference` section of a
  Plate guide.
- ProseMirror’s split is not enough on its own for best-DX docs because the
  reader has to reconstruct the practical story across multiple pages.

## What ProseMirror does especially well

- Clean separation between guide, reference, and example.
- Precise API naming and object-level documentation.
- Strong “go read the exact primitive” reference posture.

## What ProseMirror does less well for Plate's needs

- It does not hold the reader’s hand through a modern docs flow.
- It is too low-level and decomposed to be the opening posture for Plate’s
  guide.
- It assumes readers are comfortable jumping between guide/reference/example
  pages themselves.

## High-value pages

- `https://prosemirror.net/docs/guide/`
- `https://prosemirror.net/docs/ref/#inputrules.InputRule`
- `https://prosemirror.net/examples/markdown/`

## What this source cluster is good for

Use it when deciding:

- how to structure the final API Reference section
- how much precision to give helper docs
- where the boundary should be between tutorial flow and primitive reference
