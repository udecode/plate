---
title: Slate walkthrough, concepts, and API doc patterns
type: source
status: partial
updated: 2026-04-15
source_refs:
  - /Users/zbeyens/git/slate/docs/Introduction.md
  - /Users/zbeyens/git/slate/docs/Summary.md
  - /Users/zbeyens/git/slate/docs/walkthroughs/05-executing-commands.md
  - /Users/zbeyens/git/slate/docs/api/transforms.md
  - https://docs.slatejs.org/
  - https://docs.slatejs.org/walkthroughs/01-installing-slate
related:
  - docs/research/systems/plugin-input-rule-doc-pattern-landscape.md
---

# Slate walkthrough, concepts, and API doc patterns

## Purpose

This page compiles how Slate structures progressive docs versus raw API
reference.

## Strongest explicit signals

- Slate opens with a narrative introduction and examples.
- The docs table of contents clearly separates:
  - walkthroughs
  - concepts
  - API
  - libraries
- The commands walkthrough teaches a user problem first, then extracts the
  abstraction.

## Documentation pattern

- **Narrative first**: explain the editor model and why the abstraction exists.
- **Walkthrough second**: build from a concrete user problem.
- **API last**: use transforms/reference pages for exact signatures.

## Plate-relevant takeaways

- The tutorial half of the new guide should feel more like Slate than like
  ProseMirror.
- Progressive build-up is especially useful for the custom-rule section.
- Exact helper details should still move to the final reference section.

## What Slate does especially well

- Introduces abstractions through problems, not just names.
- Keeps the docs tree easy to scan.
- Makes “walkthroughs vs concepts vs API” obvious in the information
  architecture.

## What Slate does less well for Plate's needs

- It is framework-level, not package-family-oriented.
- It does not need to teach feature-owned rule families the way Plate does.
- The current site is older and less productized than the docs polish target
  Plate wants.

## High-value pages

- `/Users/zbeyens/git/slate/docs/Introduction.md`
- `/Users/zbeyens/git/slate/docs/Summary.md`
- `/Users/zbeyens/git/slate/docs/walkthroughs/05-executing-commands.md`
- `/Users/zbeyens/git/slate/docs/api/transforms.md`

## What this source cluster is good for

Use it when deciding:

- how tutorial-first the opening sections should be
- how to stage mental model, examples, and API reference
- how to keep the guide readable for non-expert readers
