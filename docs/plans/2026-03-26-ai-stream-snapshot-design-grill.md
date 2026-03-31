# AI Stream Snapshot Design Grill

## Goal

Stress-test the next-step design for AI insert-mode preview state, especially whether snapshot state should live in plugin state, what the public surface should be, and how to avoid a performance regression on long documents.

## Checklist

- [in_progress] Inspect current AI/plugin state patterns in the repo
- [pending] Decide whether preview state should live in plugin state, transform state, or private module state
- [pending] Decide whether the public surface should be `api`, `tf`, or package-private helpers
- [pending] Walk the remaining design forks with explicit recommendations

## Findings

- The current implementation stores preview state in a module-level `WeakMap` keyed by editor.
- The current helper surface is low-level snapshot terminology, not workflow terminology.
