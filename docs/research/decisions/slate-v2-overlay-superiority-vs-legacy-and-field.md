---
title: Slate v2 overlay architecture beats legacy Slate and aligns with the best parts of the field
type: decision
status: accepted
updated: 2026-04-15
source_refs:
  - docs/research/systems/slate-v2-overlay-architecture.md
  - docs/research/systems/editor-architecture-landscape.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
  - docs/analysis/editor-architecture-candidates.md
related:
  - docs/research/entities/slate.md
  - docs/research/entities/prosemirror.md
  - docs/research/entities/lexical.md
  - docs/research/entities/tiptap.md
---

# Slate v2 overlay architecture beats legacy Slate and aligns with the best parts of the field

## Question

Why is the current Slate v2 overlay architecture better than legacy Slate, and
how should it be judged against the editor-architecture candidate field?

## Decision

Accept the following read:

- Slate v2 is clearly superior to legacy Slate on overlays.
- It is not “better than every editor” in the field.
- It is better described as:
  - escaping legacy Slate’s callback soup
  - converging on the strongest overlay ideas from ProseMirror, Lexical,
    Tiptap, VS Code, and TanStack DB
  - keeping a more React-native and app-owned integration story than those
    systems where that is useful

## Why it beats legacy Slate

Legacy Slate made one `decorate` callback pretend it could own:

- transient inline highlighting
- durable range-backed comments
- anchored widget UI
- browser-facing composition decoration
- large-document invalidation

That mixed incompatible ownership models into one surface.

Slate v2 fixes that by splitting the system into:

- `Decoration`
  transient, overlap-friendly, mapped or externally indexed
- `Annotation`
  durable, id-bearing, bookmark-backed
- `Widget`
  anchored UI, geometry-derived, narrower public surface

That win is not cosmetic.
It gives the system:

- explicit ownership instead of one callback owning everything
- `Bookmark` as the public durable-anchor story instead of `RangeRef` leakage
- store/controller-style annotation integration instead of render-time arrays
- widget UI that does not abuse text-decoration semantics
- corridor-scoped large-document overlay invalidation
- explicit browser-truth hardening on selection, clipboard, and IME boundaries

## Relative to the field

### ProseMirror

Slate v2 now aligns with ProseMirror on the important overlay ideas:

- mapped overlay discipline
- durable anchor/bookmark semantics
- explicit separation between document meaning and UI chrome

It still does not beat ProseMirror as the most disciplined general document
engine.
That is not the right claim.

### Lexical

Slate v2 now aligns with Lexical on:

- split ownership between text overlays, durable anchor state, and decorator UI
- narrow invalidation and runtime-local subscription thinking

Lexical is still the stronger end-to-end runtime challenger.
Slate v2 is better read as “finally using the same good ideas” than “beating
Lexical outright.”

### Tiptap

Slate v2 now beats legacy Slate more convincingly than Tiptap beats
ProseMirror.
Tiptap is still the productization and packaging benchmark.

The useful lesson from Tiptap is:

- comments, suggestions, and floating UI are distinct product lanes

not:

- copy the entire Tiptap stack

### Premirror + Pretext

Slate v2 does not solve page-layout composition the way Premirror + Pretext are
trying to.
That is a different lane.

What Slate v2 does get right is:

- keep overlay/UI semantics separate from layout composition

### VS Code + TanStack DB

Slate v2 now agrees with the strongest non-editor lessons too:

- VS Code:
  typed visual channels beat one generic overlay bucket
- TanStack DB:
  annotation metadata wants stable store/controller semantics

## What this means in practice

The honest superiority claim is:

- better than legacy Slate for overlay architecture by a wide margin
- aligned with the best overlay semantics in the field
- still not the single best engine on every axis

That is a stronger and more defensible claim than pretending the field does not
exist.
