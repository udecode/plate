---
title: Strict mode and auto pair need independent packaging decisions
type: decision
status: accepted
updated: 2026-07-23
source_refs:
  - docs/research/sources/typora/markdown-native-editing-foundations.md
related:
  - docs/research/concepts/behavior-packaging-candidates.md
  - docs/research/systems/editor-behavior-architecture.md
  - docs/editor-behavior/markdown-editing-spec.md
---

# Strict mode and auto pair need independent packaging decisions

## Question

How should Plate model strict mode and auto pair?

## Decision

Do not make either behavior silent universal law, and do not assume both belong
in one profile or options bag.

Classify them independently:

- strict mode changes parse and input acceptance policy; keep it with that owner
  unless a real replacement job or hard boundary earns a capability plugin;
- auto pair is coherent input assistance and may be an app-kit policy or plugin
  candidate, but public promotion still needs fallback, dependency, caller, and
  proof evidence.

## Why

Typora treats both as optional behavior:

- strict mode changes parsing/input acceptance
- auto pair changes input assistance

Those are real behaviors, but they should not silently redefine the default
editing contract for every surface. Neither requires a profile runtime.
