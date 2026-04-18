---
title: Link automd belongs to the link interaction lane
type: decision
status: accepted
updated: 2026-04-10
source_refs:
  - docs/research/sources/typora/markdown-shorthand-and-inline-autoformat.md
  - docs/research/sources/milkdown/input-autoformat-lanes.md
  - packages/autoformat/src/lib/__tests__/withAutoformat/block/singleCharTrigger.spec.tsx
related:
  - docs/editor-behavior/markdown-editing-spec.md
  - docs/editor-behavior/editor-protocol-matrix.md
---

# Link automd belongs to the link interaction lane

## Question

Should `[text](url)` automd be treated as just another autoformat family?

## Decision

No.

Treat link automd as a richer link-interaction surface that can reuse
autoformat mechanics, but should not be flattened into the same family as:

- block shorthand autoformat
- inline mark autoformat
- text-substitution autoformat

## Why

- it parses two payloads, not one trigger string
- it creates an inline non-void link span with URL payload, not just a mark or
  text substitution
- it is closer to markdown source-entry for links than to generic shorthand
  replacement
- current Plate now ships the narrow closing-`)` slice in the default current
  kits, but it still does so through the richer link interaction lane instead
  of flattening it into plain autoformat

## Consequences

- spec it separately
- keep it out of the current shipped autoformat family
- allow shared runtime reuse where helpful, but do not let the mechanical
  implementation dictate the behavior lane
