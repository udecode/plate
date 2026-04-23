---
title: Current kit autoformat normalization split
type: decision
status: accepted
updated: 2026-04-10
source_refs:
  - docs/research/sources/typora/markdown-shorthand-and-inline-autoformat.md
  - docs/research/sources/milkdown/input-autoformat-lanes.md
  - apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx
related:
  - docs/editor-behavior/markdown-editing-spec.md
  - docs/editor-behavior/markdown-parity-matrix.md
---

# Current kit autoformat normalization split

## Question

Which current autoformat-kit quirks should be kept as explicit Plate-owned
conveniences, and which should normalize later?

## Decision

Split them:

- keep `[] ` / `[x] ` as an explicit Plate-owned condensed todo convenience
- normalize code-fence promotion later toward an Enter-owned neighboring
  input-rule lane
- normalize horizontal-rule insertion later toward a stronger input-rule /
  command-aligned lane instead of immediate shorthand closure

## Why

- condensed todo shorthand is additive convenience; it does not block the
  canonical markdown-native `- [ ]` path
- immediate code-fence and HR insertion are further from the stronger Typora /
  Milkdown product evidence
- Enter-coupled promotions are not a clean fit for the current
  `insertText`-driven autoformat engine

## Consequences

- keep the todo shorthand explicit as a local current contract
- stop treating immediate code-fence and HR behavior as long-horizon truth
- plan those normalizations as runtime follow-up, not as more doc-only polish
