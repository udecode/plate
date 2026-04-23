---
title: Layout, measurement, and IME lanes
type: source
status: partial
source_refs:
  - ../premirror/README.md
  - ../pretext/README.md
  - ../edit-context/dev-design.md
updated: 2026-04-14
related:
  - docs/research/entities/premirror.md
  - docs/research/entities/pretext.md
  - docs/research/entities/editcontext.md
  - docs/research/systems/editor-architecture-landscape.md
---

# Layout, measurement, and IME lanes

## Purpose

Compile the evidence that layout and IME formatting are their own lanes, not
generic overlay leftovers.

## Strongest evidence

- Premirror splits snapshot, measure, compose, and viewport rendering.
- Pretext splits one-time text preparation from hot-path layout arithmetic.
- EditContext makes text updates, selection updates, layout updates, and
  text-format feedback explicit.

## What this means

### 1. Layout stays derived

Premirror and Pretext both say the same thing:

- layout is computed from document state
- layout should not become the editor model itself

That argues against mixing pagination/layout concerns into the overlay
ownership model.

### 2. Measurement is not “just another decoration”

Pretext proves measurement wants its own precompute/hot-path split.

That matters for huge-doc and page-layout lanes later, even if it is not the
current blocker.

### 3. IME formatting is a separate platform lane

EditContext makes explicit something web editors often blur:

- text input services can request formatting feedback
- geometry and selection synchronization are explicit responsibilities

That is useful because it shows browser/IME formatting pressure is not well
modeled as ordinary app decorations.

## Take for Slate v2

- keep layout derived
- keep IME/platform formatting pressure distinct from normal overlay API design
- do not let future pagination work distort the current overlay ownership model
