---
date: 2026-04-11
topic: markdown-editing-modes
---

# Markdown Editing Modes

## Problem Frame

Plate should not think about "markdown mode" as one thing.

Towards markdown editing, we can identify many levels: from source-first to
rich-first. The important distinction is not just how much markdown is visible,
but whether markdown is still the source of truth or only an input shortcut.

## Requirements

**Mode Taxonomy**

- R1. Plate should expose a small set of named editing modes or presets that a
  developer can pick from.
- R2. Each mode should make three things clear:
  - whether markdown is the source of truth
  - whether markdown syntax stays visible
  - whether markdown can come back during editing after conversion
- R3. The mode list should feel continuous, not like unrelated product ideas.

**Modes**

- R4. `source-first`
  - Markdown only, without inline rich rendering.
  - Preview is separate.
  - Example: GitHub.

- R5. `source-first live preview`
  - Markdown, with inline rendering, without giving up markdown as the source
    of truth.
  - Syntax may disappear visually when not focused, but the editor still thinks
    in markdown.
  - Example: Obsidian live preview, Typora-ish territory.

- R6. `reversible rich`
  - Rich rendering, with markdown-to-rich conversion, but without losing
    markdown as a reversible editing surface.
  - After conversion, syntax is hidden, but editing actions like backspace can
    still bring markdown back.
  - Example: `$e=mc2$` -> equation node -> backspace -> text `$e=mc2$`.

- R7. `rich with markdown shortcuts`
  - Rich structure is now the source of truth, with markdown still available as
    an input shortcut.
  - After conversion, syntax is hidden and usually does not come back during
    normal editing.

- R8. `rich-first`
  - Rich structure is the real editing model, with markdown reduced to optional
    shorthand.
  - Syntax is hidden from the user as much as possible, and UI controls are the
    main path.
  - This is nice when target users do not know markdown and would be confused
    to see `$e=mc2$` come back on backspace.
  - Tradeoff: autoformatting must stay more conservative, because aggressive
    markdown triggers get annoying fast when syntax is more conflicting.

## Success Criteria

- A Plate developer can pick one mode and immediately understand:
  - what the source of truth is
  - whether markdown is reversible
  - how aggressive markdown shortcuts should be
- We stop talking about "markdown support" like it is one flat feature.

## Scope Boundaries

- This doc defines product modes, not implementation.
- This doc does not decide the exact plugin API yet.

## Key Decisions

- The main behavioral boundary is between `reversible rich` and `rich with
  markdown shortcuts`.
  - In `reversible rich`, markdown still matters after conversion.
  - In `rich with markdown shortcuts`, markdown matters only at insertion time.

- The difference between `rich with markdown shortcuts` and `rich-first` is
  mostly product posture.
  - Both are rich-authoritative.
  - `rich-first` hides markdown more aggressively and should prefer more
    conservative triggers.

- There are really two families here:
  - `source-authoritative`: `source-first`, `source-first live preview`
  - `rich-authoritative`: `reversible rich`, `rich with markdown shortcuts`,
    `rich-first`

## Outstanding Questions

### Resolve Before Planning

- None.

### Deferred to Planning

- [Affects R1][Technical] Should Plate expose these as named presets, a
  capability profile, or both?
- [Affects R8][Technical] Which markdown triggers are safe by default in
  `rich-first` without becoming too aggressive?
- [Affects R6][Technical] Which features should be reversible in
  `reversible rich`, and which should stay rich once converted?

## Next Steps

-> `/ce:plan` for structured implementation planning if we want to turn these
into real Plate editor profiles.
