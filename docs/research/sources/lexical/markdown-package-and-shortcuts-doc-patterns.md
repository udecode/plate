---
title: Lexical markdown package and shortcuts doc patterns
type: source
status: partial
updated: 2026-04-15
source_refs:
  - /Users/zbeyens/git/lexical/README.md
  - /Users/zbeyens/git/lexical/packages/lexical-markdown/README.md
  - /Users/zbeyens/git/lexical/packages/lexical-markdown/src/MarkdownTransformers.ts
  - https://lexical.dev/docs/intro
  - https://lexical.dev/docs/packages/lexical-markdown
related:
  - docs/research/systems/plugin-input-rule-doc-pattern-landscape.md
---

# Lexical markdown package and shortcuts doc patterns

## Purpose

This page compiles how Lexical documents markdown shortcuts and the package
surface around them.

## Strongest explicit signals

- Lexical frames markdown as a package (`@lexical/markdown`), not a broad
  editor-wide “autoformat” page.
- The package docs split the surface by use case:
  - import/export
  - shortcuts
  - transformers
- React plugin usage and manual registration are shown side by side.

## Documentation pattern

- **Intro site** sets the high-level architecture and navigation.
- **Package page** is task-oriented and concise.
- **Source/API detail** lives separately in typed source and generated API docs.

## Plate-relevant takeaways

- A package/runtime page should group examples by use case, not only by helper
  type.
- Showing “React plugin” and “manual registration” as sibling paths is strong
  DX.
- A list of built-in transformer bundles or rule families is highly scannable
  when the system has many moving parts.

## What Lexical does especially well

- Concise split between “what the package does” and “how to wire it”.
- Explicit React-vs-manual setup examples.
- Clear inventory of built-in transformer families.

## What Lexical does less well for Plate's needs

- It is package-centric, not guide-centric.
- It assumes the surrounding architecture is learned elsewhere.
- It is terser and less progressive than the doc style Plate wants.

## High-value pages

- `/Users/zbeyens/git/lexical/packages/lexical-markdown/README.md`
- `/Users/zbeyens/git/lexical/packages/lexical-markdown/src/MarkdownTransformers.ts`
- `https://lexical.dev/docs/packages/lexical-markdown`

## What this source cluster is good for

Use it when deciding:

- how to split “quick path” vs “manual path”
- how to inventory rule families without drowning the reader
- how to present React/plugin usage and lower-level registration together
