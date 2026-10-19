# Footnote Editor Ref Research

## Goal
Decide whether Plate has enough real editor-reference evidence to specify footnote insert and creation behavior beyond markdown parse and serialize.

## Phases
- [x] Audit local Typora and Milkdown reference corpora for footnote editing evidence
- [x] Compare that evidence to the current footnote spec rows and package-surface gap
- [x] Record what is explicit, what is only adjacent precedent, and what still needs a Plate-owned decision
- [x] Summarize the research outcome and recommend the next spec/implementation step

## Working Notes
- Current spec already locks footnote reference and definition round-trip.
- Open question is product behavior: insert flow, toolbar/slash semantics, automatic definition creation, and cursor landing.

## Findings

### Typora
- `Markdown Reference` documents footnote syntax and rendered behavior, not creation UX:
  - supports `[^fn]` references plus `[^fn]: ...` definitions
  - hover over the superscript shows footnote content
  - source: local cache page `markdown-reference.json` (`/Markdown-Reference/`)
- `Typora 0.9.9.32 (0.9.84) beta` adds one real editor behavior:
  - clicking the appended `↩` after a definition jumps back to references
  - `Ctrl` / `Command` click on a footnote reference jumps to its definition
  - source: local cache page `what-s-new-0-9-84.json` (`/What's-New-0.9.84/`)
- `Typora 1.3` mentions a live-preview fix for footnotes, which is weak evidence that footnotes participate in the live editor surface, but it does not define insertion or deletion semantics.

### Milkdown
- `docs/api/preset-gfm.md` exposes only `footnoteDefinitionSchema` and `footnoteReferenceSchema`.
- `packages/plugins/preset-gfm/src/node/footnote/reference.ts` and `definition.ts` define parse/serialize schema support only.
- `plugin-automd` treats `footnote_definition` as a global node in inline sync config, which is supporting infrastructure, not a user-facing insert rule.
- The local Milkdown inventories showed no footnote e2e lane in the old repo-safe
  catalogs, which now live in:
  - `../raw/milkdown/e2e-catalog.tsv`
  - `../raw/milkdown/unit-test-catalog.tsv`
- Repo-wide search found no dedicated footnote command, input rule, keymap, slash flow, or insert transform in the local clone.

### Research Take
- Strong editor-ref support exists for:
  - footnote syntax and round-trip node semantics
  - hover preview in Typora
  - navigation between reference and definition in Typora
- The editor refs are still weak or silent on:
  - one-step footnote insertion UX
  - automatic definition creation flow
  - id allocation strategy
  - selection landing after insert
  - toolbar/slash behavior
  - destructive editing rules around footnote reference or definition nodes

## Recommendation
- Keep `EDIT-FOOTNOTE-REF-001` and `EDIT-FOOTNOTE-DEF-001` as locked.
- Do not claim `EDIT-FOOTNOTE-PKG-001` is fully research-backed yet.
- If we add `tf.insert.footnote`, treat it as a Plate-owned product decision informed by:
  - Typora's navigation model
  - GitHub/GFM syntax constraints
  - Notion/Docs-style insertion expectations for “insert object + move into editable content”
