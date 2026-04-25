# Pattern Catalog

## Plugin / Extension Patterns

Prefer:

- package-owned canonical semantics
- explicit ownership per feature
- localized helpers for common extension jobs
- owner-scoped defaults when they reduce repetition without hiding work

Avoid:

- one global bag of cross-feature semantics
- making app-local sugar look canonical

## Builder / Factory Patterns

Prefer:

- object-shaped inline declarations for small declarative surfaces
- scoped builders when the owner can provide meaningful defaults
- fluent chaining only when the domain is truly sequential and staged typing
  materially helps

Avoid:

- chain theater for small declarations
- giant switch-based DSLs pretending to be elegant
- local wrappers that only hide one repeated key

## Config Patterns

Prefer:

- explicit, copyable config
- short local names in the owning scope
- activation through the owning surface, not a hidden host

Avoid:

- punctuation keys
- verbose names that repeat the owner
- hidden defaults triggered by install alone

## Runtime / Service Patterns

Prefer:

- explicit service boundaries
- projections instead of ad hoc recomputation
- protocolized diagnostics/analyzers/services
- layout and measurement as separate architectural concerns

Avoid:

- tangling services directly into rendering/plugin glue
- recomputing large derived state from scratch on hot paths

## Small-Surface Patterns

Prefer:

- lighter primitives for small editable surfaces
- separate answers for “text surface” versus “structured editor”

Avoid:

- dragging the full platform into a glorified textarea
