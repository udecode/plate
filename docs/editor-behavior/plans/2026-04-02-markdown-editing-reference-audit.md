# Markdown Editing Reference Audit

## Task

- Source: direct user request
- Title: `Audit Typora and Milkdown side-by-side against markdown-editing-spec.md`
- Type: research and standards audit
- Goal: decide which `EDIT-*` rules in the markdown-first editing spec can be locked, which need revision, and which are still genuine gaps

## Plan

1. Read the draft standards and editing spec.
2. Mine the local Typora corpus for explicit editing behavior.
3. Mine the local Milkdown clone for matching docs, e2e tests, and source seams.
4. Write a side-by-side audit keyed by spec IDs.
5. Coverage-check the audit against the spec file.
6. Call out the next TDD lane instead of pretending the references answer everything.

## Findings

- Typora is strongest on documented input and shortcut behavior:
  - paragraph split vs line break
  - heading creation and paragraph reset shortcuts
  - blockquote creation
  - generic indent and outdent shortcuts
  - code fence and math block entry
  - table creation plus forward `Tab` row growth
- Typora is weak on destructive edge cases:
  - `Backspace@start`
  - empty-container exit rules
  - multi-block selection behavior
  - reverse table navigation
- Milkdown is strongest on executable behavior through e2e tests:
  - paragraph `Enter` and `Shift+Enter`
  - list splitting and nested exit
  - blockquote input and multi-paragraph continuation
  - heading input
  - mark parsing and link extension on paste
  - table next-cell movement in Crepe
  - latex block entry and edit mode
- Milkdown is still weak on destructive-key semantics:
  - blockquote outdent and exit
  - list `Backspace@start`
  - expanded structural selections
  - explicit `Shift+Tab` in tables
- The draft spec is too confident about plain-paragraph `Tab` and quoted-paragraph `Tab` being no-ops.
  - Typora documents generic indent and outdent shortcuts at the paragraph layer.
  - That is pressure against hard-locking no-op semantics in the markdown-first profile.
- Affinity is a real architectural seam, not a cleanup detail.
  - Typora leans toward source expansion at span boundaries.
  - Milkdown keeps marks active and can extend links on paste at a collapsed selection.
  - That is a profile difference, not a tiny bug.
- Toggle behavior is not meaningfully grounded by either reference and should stay out of the markdown-first lock set.

## Risks

- Over-locking silent areas based on “common editor intuition” would bake guesswork into the major release.
- Treating Typora menu commands as proof of every collapsed-selection key case would overstate the docs.
- Treating Crepe-only UX as commonmark base behavior would smear profile boundaries.

## Progress

- 2026-04-02: Read `markdown-standards.md` and `markdown-editing-spec.md` to set the audit target.
- 2026-04-02: Re-checked repo learnings and confirmed blockquote/code-block/table notes are relevant pressure, not direct reference truth.
- 2026-04-02: Mined Typora local cache pages:
  - `Markdown Reference`
  - `Shortcut Keys`
  - `Whitespace and Line Breaks`
  - `Table Editing`
  - `Math and Academic Functions`
  - `Task List`
  - `Delete Range`
  - `Auto Pair`
  - `Copy and Paste`
- 2026-04-02: Mined Milkdown local clone seams:
  - `e2e/tests/input/**`
  - `e2e/tests/shortcut/**`
  - `e2e/tests/transform/**`
  - `e2e/tests/crepe/**`
  - `e2e/tests/plugin/{automd,clipboard}.spec.ts`
  - `packages/core/src/internal-plugin/keymap.test.ts`
  - `packages/crepe/src/feature/top-bar/config.ts`
  - `docs/api/component-link-tooltip.md`
- 2026-04-02: Identified the main unresolved lanes before writing the audit:
  - destructive quote behavior
  - reverse table navigation
  - block-level expanded selections
  - profile-owned affinity rules
- 2026-04-02: Wrote the side-by-side audit under `docs/editor-behavior/markdown-editing-reference-audit.md`.
- 2026-04-02: Coverage check passed:
  - no `EDIT-*` IDs are missing from the audit
  - no extra `EDIT-*` IDs appear in the audit
