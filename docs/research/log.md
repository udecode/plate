# Research Log

## [2026-04-04] bootstrap | initialize docs/research

- moved the agent-reference-wiki pattern from `docs/plans/` to
  [README.md](docs/research/README.md)
- established `docs/research` as the compiled layer
- established `../raw` as the expected private raw evidence layer
- created the initial research directory scaffold

## [2026-04-04] ingest | Typora corpus bootstrap

- copied the cached Typora corpus into `../raw/typora`
- created the first compiled Typora pages:
  - [corpus-overview.md](docs/research/sources/typora/corpus-overview.md)
  - [editor-behavior-priority-map.md](docs/research/sources/typora/editor-behavior-priority-map.md)
- generated `123` one-to-one Typora source cards plus `../raw/typora/catalog.md`
- promoted the highest-value Typora pages into themed source-cluster syntheses
  and a system map
- promoted the strongest recurring Typora ideas into concept pages, decision
  pages, and one explicit open-question page
- compared the new research-layer output against the older repo-safe Typora
  reference subtree before pruning it

## [2026-04-04] ingest | Milkdown corpus bootstrap

- cloned the upstream Milkdown repo into `../raw/milkdown/repo`
- created the first compiled Milkdown pages:
  - [corpus-overview.md](docs/research/sources/milkdown/corpus-overview.md)
  - [editor-behavior-priority-map.md](docs/research/sources/milkdown/editor-behavior-priority-map.md)
  - [behavior-test-lanes.md](docs/research/sources/milkdown/behavior-test-lanes.md)
  - [docs-and-package-surface-map.md](docs/research/sources/milkdown/docs-and-package-surface-map.md)
- created the Milkdown system/concept/decision layer
- compared the new research-layer output against the older repo-safe Milkdown
  inventory subtree before pruning it

## [2026-04-04] ingest | Obsidian corpus bootstrap

- cloned the official Obsidian help and developer-docs repos into `../raw/obsidian`
- generated English-first raw catalogs for both repos
- created the first compiled Obsidian pages:
  - [corpus-overview.md](docs/research/sources/obsidian/corpus-overview.md)
  - [editor-behavior-priority-map.md](docs/research/sources/obsidian/editor-behavior-priority-map.md)
  - [editing-modes-and-markdown-surface.md](docs/research/sources/obsidian/editing-modes-and-markdown-surface.md)
  - [linking-navigation-and-search.md](docs/research/sources/obsidian/linking-navigation-and-search.md)
  - [developer-editor-extension-surface.md](docs/research/sources/obsidian/developer-editor-extension-surface.md)
- added a narrower footnote/block-link source page and one explicit
  authority-scope open question
- created the Obsidian system map

## [2026-04-09] maintain | date and media expansion follow-up

- compiled a new Typora source summary for richer media authoring and path
  policy:
  [media-authoring-and-path-policy.md](docs/research/sources/typora/media-authoring-and-path-policy.md)
- promoted one decision from that evidence:
  [media-authoring-follows-the-image-path-policy-family.md](docs/research/decisions/media-authoring-follows-the-image-path-policy-family.md)
- opened one explicit unresolved question for the thinner date lane:
  [date-mdx-payload-contract.md](docs/research/open-questions/date-mdx-payload-contract.md)
- updated the research index and Typora source entrypoint to include the new
  pages

## [2026-04-09] maintain | math delimiter trigger surface

- compiled a new Typora source summary for `$` / `$$` trigger behavior:
  [math-delimiter-triggers.md](docs/research/sources/typora/math-delimiter-triggers.md)
- compiled a new Obsidian source summary for math delimiter syntax and pair
  settings:
  [math-delimiters-and-pair-settings.md](docs/research/sources/obsidian/math-delimiters-and-pair-settings.md)
- compiled a new Milkdown source summary for latex trigger mechanics:
  [latex-trigger-surface.md](docs/research/sources/milkdown/latex-trigger-surface.md)
- opened one explicit unresolved question for broader authority coverage:
  [math-delimiter-trigger-authority.md](docs/research/open-questions/math-delimiter-trigger-authority.md)
- updated the research index and Typora source entrypoint to include the new
  pages

## [2026-04-09] maintain | Obsidian math trigger authority correction

- corrected the Obsidian math-trigger read after rechecking the official
  release-note corpus
- updated
  [math-delimiters-and-pair-settings.md](docs/research/sources/obsidian/math-delimiters-and-pair-settings.md)
  to include explicit `$` selection-wrap, live-preview auto-pair, and `$$`
  block-detection evidence
- reframed
  [math-delimiter-trigger-authority.md](docs/research/open-questions/math-delimiter-trigger-authority.md)
  around row choice instead of fake Obsidian absence

## [2026-04-09] maintain | Obsidian math trigger rerun with local-raw exhaustiveness

- reran the Obsidian side under the tightened `research-wiki full` rule
- recorded the official source entrypoints checked plus the direct raw files
  actually read
- confirmed the current law still stands:
  Obsidian is explicit for selection-wrap and block detection / preview, while
  Typora and Milkdown still own the more aggressive pair-on-type / promotion
  rows

## [2026-04-09] full | inline and block autoformat surface

- compiled a new Typora source summary for markdown shorthand and inline
  autoformat:
  [markdown-shorthand-and-inline-autoformat.md](docs/research/sources/typora/markdown-shorthand-and-inline-autoformat.md)
- compiled a new Milkdown source summary for executable autoformat input lanes:
  [input-autoformat-lanes.md](docs/research/sources/milkdown/input-autoformat-lanes.md)
- accepted one decision for family modeling:
  [autoformat-families-are-profile-adjacent-input-assist-surfaces.md](docs/research/decisions/autoformat-families-are-profile-adjacent-input-assist-surfaces.md)
- opened one explicit unresolved question for thinner symbol-substitution
  authority:
  [text-substitution-autoformat-authority.md](docs/research/open-questions/text-substitution-autoformat-authority.md)

## [2026-04-10] maintain | autoformat authority closure follow-up

- accepted a boundary decision for `[text](url)` automd:
  [link-automd-belongs-to-the-link-interaction-lane.md](docs/research/decisions/link-automd-belongs-to-the-link-interaction-lane.md)
- accepted a normalization split for current autoformat-kit quirks:
  [current-kit-autoformat-normalization-split.md](docs/research/decisions/current-kit-autoformat-normalization-split.md)
- tightened the text-substitution authority open question with a usable current
  split between mainstream typographic norms and thinner local symbol-table
  contract

## [2026-04-15] full | plugin input rules documentation pattern landscape

- compiled new source pages for four documentation corpora:
  - [tiptap/input-rules-and-extension-doc-patterns.md](docs/research/sources/tiptap/input-rules-and-extension-doc-patterns.md)
  - [prosemirror/guide-reference-and-example-doc-patterns.md](docs/research/sources/prosemirror/guide-reference-and-example-doc-patterns.md)
  - [lexical/markdown-package-and-shortcuts-doc-patterns.md](docs/research/sources/lexical/markdown-package-and-shortcuts-doc-patterns.md)
  - [slate/walkthrough-concepts-and-api-doc-patterns.md](docs/research/sources/slate/walkthrough-concepts-and-api-doc-patterns.md)
- added a cross-corpus synthesis page:
  [plugin-input-rule-doc-pattern-landscape.md](docs/research/systems/plugin-input-rule-doc-pattern-landscape.md)
- accepted one doc-structure decision for Plate:
  [plugin-input-rules-guide-should-lead-with-runtime-first-then-feature-owners-then-api-reference.md](docs/research/decisions/plugin-input-rules-guide-should-lead-with-runtime-first-then-feature-owners-then-api-reference.md)
- updated the research index with the new docs IA lane
