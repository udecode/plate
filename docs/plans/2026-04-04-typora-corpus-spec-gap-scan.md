# Typora Corpus Spec Gap Scan

## Goal
Scan the local Typora corpus broadly enough to find concrete editor-behavior signals that should tighten Plate's spec docs and protocol matrix.

## Phases
- [x] Inventory the local Typora corpus for editing-behavior signals across all cached pages
- [x] Compare those signals to the current spec stack
- [x] List spec gaps, weak wording, and missing protocol rows
- [x] Decide whether to patch docs now or write a precise follow-up plan

## Working Notes
- Source corpus is the local Typora cache under `$HOME/.cache/plate/editor-behavior/typora/pages`.
- This pass is about completeness and missed behavior clues, not just markdown syntax.
- Likely targets: navigation, click/hover/jump, copy-paste, delete semantics, outline/TOC behavior, image/media interactions, search, auto-pair, and release-note drift.

## Findings

### Strong Typora signals we are underusing
- `Copy and Paste` is a real behavior doc, not fluff:
  - copy exports multiple clipboard formats at once: HTML, RTF, plain text
  - paste into Typora prefers HTML and converts it to Markdown
  - `Paste as Plain Text` is explicitly “Paste as Markdown Source”
  - `Copy as Markdown` and `Copy without Theme Styling` are explicit product behaviors
- `Delete Range` is a real editing authority:
  - delete paragraph/block is block-scoped
  - delete line/sentence is owner-specific:
    - paragraph: sentence
    - table: row
    - code/math: line
    - empty block: delete current empty block
- `Outline / Catalog` gives navigation law:
  - clicking an outline item navigates to the target header
  - current header is highlighted while scrolling/editing
  - outline supports filter/search
- `TOC` gives insertion plus live-update law:
  - `[toc]` + `Return` inserts TOC
  - TOC updates automatically as headings change
- `Images in Typora` and `Media` give insertion/path behavior:
  - image insertion supports markdown syntax, drag-drop, menu insert, clipboard image paste
  - image insert can generate relative paths and `./` prefixes
  - media/video drag-drop follows the same path rules as images
  - image click/edit-source semantics are documented in Typora's image docs and `Markdown Reference`
- `Auto Pair` is explicit:
  - normal brackets/quotes
  - markdown-symbol pairing
  - selection-wrap behavior for some markdown pairs
- `Math` is stronger than our current usage:
  - `$$` + `Return` enters math input
  - `Up/Down` or `Ctrl`/`Command` + `Return` exits math editing
- Release notes add interaction drift the static docs miss:
  - footnote quick jump and backlink
  - outline row click target widened
  - search starts from current caret in at least one release
  - copy/cut whole line when no selection became an option
  - table `Tab` row creation and table paste fixes show product expectations

### Where our current spec stack is thin
- `editor-protocol-matrix.md` row schema names `click` and `drag`, but there is no normalized interaction lane for:
  - hover preview
  - mod-click navigation
  - click-to-edit-source
  - outline / TOC navigation
  - clipboard representation policy
- `markdown-editing-spec.md` has only broad clipboard notes and no explicit Typora-derived clipboard contract.
- Footnotes are still modeled only as parse/serialize in the spec, even though Typora provides hover and jump semantics.
- TOC is specified mainly as an inserted node family, but Typora gives automatic update semantics that should be called out in the law.
- Image/media sections are likely too light on insertion-path behavior, drag-drop, and source-edit interactions.
- Delete semantics rely on ad hoc references, but Typora has a dedicated `Delete Range` page that should be cited more directly.
- Auto-pair and strict-mode behavior are not part of the spec shape today, even though Typora documents both clearly enough to justify either:
  - explicit adoption
  - explicit non-goal / divergence notes

## Recommended Spec Improvements

### 1. Add an interaction lane to the protocol docs
- Extend `editor-protocol-matrix.md` beyond pure text editing rows with first-class rows for:
  - `hover`
  - `plain-click`
  - `mod-click`
  - `focus-jump`
  - `tooltip-preview`
  - `copy`
  - `paste-as-markdown-source`
- This is the cleanest fix for footnote/link/image/TOC/outline gaps.

### 2. Add explicit Typora-backed clipboard law
- In `markdown-editing-spec.md`, add a stronger clipboard section covering:
  - multi-format copy surface
  - HTML-first paste into live editor
  - plain-text / markdown-source paste path
  - structure-preserving expectations for tables and rich blocks

### 3. Add navigation / preview semantics for interactive nodes
- Add protocol/spec rows for:
  - link click vs mod-click
  - footnote hover preview, ref-to-def jump, def-to-ref backlink
  - image click/source-edit behavior
  - HTML block click/cursor entry into edit mode
  - TOC item click navigation
  - outline item click navigation and current-heading highlight

### 4. Strengthen deletion-command docs
- Add a “Delete Range / Delete Line / Delete Block” subsection or companion matrix.
- Today we mostly model keystroke delete; Typora also defines menu/command delete behaviors with owner-sensitive meaning.

### 5. Decide what to do with Typora-only mode features
- `Strict Mode` and `Auto Pair` deserve explicit treatment:
  - either add them as profile-adjacent documented lanes
  - or state plainly that they are out of scope for the markdown-first behavior spec

### 6. Add release-note drift as a maintenance lane
- Release notes carry real behavior changes not visible in static docs.
- We should keep a short “Typora drift watchlist” section in the reference audit or a dedicated note.
