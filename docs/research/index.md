# Research Index

This is the entrypoint for the compiled agent research layer.

## Top Level

- [README.md](docs/research/README.md)
  Source of truth for the research pattern, operating rules, and layer boundaries.
- [log.md](docs/research/log.md)
  Append-only operational history for research ingests and restructures.
- [schema.md](docs/research/schema.md)
  Minimal metadata contract for the research page types.

## Directories

- [commands/README.md](docs/research/commands/README.md)
  Operational command specs for running the research workflows.
- [sources/README.md](docs/research/sources/README.md)
  Compiled summaries of raw evidence.
- [decisions/README.md](docs/research/decisions/README.md)
  Canonical repo-relevant choices and policy calls.
- [concepts/README.md](docs/research/concepts/README.md)
  Shared vocabulary and abstractions.
- [systems/README.md](docs/research/systems/README.md)
  Architecture and authority maps.
- [editor-behavior-architecture.md](docs/research/systems/editor-behavior-architecture.md)
  Long-horizon architecture for profile-driven editor behavior.
- [entities/README.md](docs/research/entities/README.md)
  Concrete named things like editors, packages, and plugins.
- [entities/typora.md](docs/research/entities/typora.md)
  Seed entity page for the first editor-reference corpus.
- [open-questions/README.md](docs/research/open-questions/README.md)
  Known ambiguity that should not be flattened into fake certainty.

## First Targets

- operational baseline:
  [commands/full-pipeline.md](docs/research/commands/full-pipeline.md)
- upkeep baseline:
  [commands/maintain.md](docs/research/commands/maintain.md)
- Typora compiled source pages derived from `../raw/typora`, starting in
  [sources/typora/README.md](docs/research/sources/typora/README.md)
- first compiled Typora source pages:
  [corpus-overview.md](docs/research/sources/typora/corpus-overview.md)
  and
  [editor-behavior-priority-map.md](docs/research/sources/typora/editor-behavior-priority-map.md)
- first Typora source-cluster syntheses:
  [markdown-native-editing-foundations.md](docs/research/sources/typora/markdown-native-editing-foundations.md),
  [clipboard-and-delete-behavior.md](docs/research/sources/typora/clipboard-and-delete-behavior.md),
  [links-images-and-html-behavior.md](docs/research/sources/typora/links-images-and-html-behavior.md),
  [media-authoring-and-path-policy.md](docs/research/sources/typora/media-authoring-and-path-policy.md),
  [navigation-search-outline-and-toc.md](docs/research/sources/typora/navigation-search-outline-and-toc.md),
  and
  [code-math-table-and-task-surfaces.md](docs/research/sources/typora/code-math-table-and-task-surfaces.md)
  plus
  [math-delimiter-triggers.md](docs/research/sources/typora/math-delimiter-triggers.md)
  plus
  [markdown-shorthand-and-inline-autoformat.md](docs/research/sources/typora/markdown-shorthand-and-inline-autoformat.md)
- Typora system map:
  [typora-behavior-map.md](docs/research/systems/typora-behavior-map.md)
- first Typora-derived concepts and decisions now exist under:
  [concepts/](docs/research/concepts/README.md),
  [decisions/](docs/research/decisions/README.md),
  and
  [open-questions/](docs/research/open-questions/README.md)
- newer date/media expansion follow-up now also includes:
  - [media-authoring-follows-the-image-path-policy-family.md](docs/research/decisions/media-authoring-follows-the-image-path-policy-family.md)
  - [date-mdx-payload-contract.md](docs/research/open-questions/date-mdx-payload-contract.md)
  - [math-delimiter-trigger-authority.md](docs/research/open-questions/math-delimiter-trigger-authority.md)
- Milkdown compiled source pages derived from `../raw/milkdown`, starting in
  [sources/milkdown/README.md](docs/research/sources/milkdown/README.md)
- Obsidian compiled source pages derived from `../raw/obsidian`, starting in
  [sources/obsidian/README.md](docs/research/sources/obsidian/README.md)
- Obsidian now also has:
  - [footnotes-and-block-links.md](docs/research/sources/obsidian/footnotes-and-block-links.md)
  - [math-delimiters-and-pair-settings.md](docs/research/sources/obsidian/math-delimiters-and-pair-settings.md)
  - [obsidian-authority-scope.md](docs/research/open-questions/obsidian-authority-scope.md)
- Milkdown now also has:
  - [latex-trigger-surface.md](docs/research/sources/milkdown/latex-trigger-surface.md)
  - [input-autoformat-lanes.md](docs/research/sources/milkdown/input-autoformat-lanes.md)
- autoformat follow-up now also includes:
  - [autoformat-families-are-profile-adjacent-input-assist-surfaces.md](docs/research/decisions/autoformat-families-are-profile-adjacent-input-assist-surfaces.md)
  - [link-automd-belongs-to-the-link-interaction-lane.md](docs/research/decisions/link-automd-belongs-to-the-link-interaction-lane.md)
  - [current-kit-autoformat-normalization-split.md](docs/research/decisions/current-kit-autoformat-normalization-split.md)
  - [text-substitution-autoformat-authority.md](docs/research/open-questions/text-substitution-autoformat-authority.md)
- input-rule docs IA follow-up now also includes:
  - [sources/tiptap/input-rules-and-extension-doc-patterns.md](docs/research/sources/tiptap/input-rules-and-extension-doc-patterns.md)
  - [sources/prosemirror/guide-reference-and-example-doc-patterns.md](docs/research/sources/prosemirror/guide-reference-and-example-doc-patterns.md)
  - [sources/lexical/markdown-package-and-shortcuts-doc-patterns.md](docs/research/sources/lexical/markdown-package-and-shortcuts-doc-patterns.md)
  - [sources/slate/walkthrough-concepts-and-api-doc-patterns.md](docs/research/sources/slate/walkthrough-concepts-and-api-doc-patterns.md)
  - [systems/plugin-input-rule-doc-pattern-landscape.md](docs/research/systems/plugin-input-rule-doc-pattern-landscape.md)
  - [decisions/plugin-input-rules-guide-should-lead-with-runtime-first-then-feature-owners-then-api-reference.md](docs/research/decisions/plugin-input-rules-guide-should-lead-with-runtime-first-then-feature-owners-then-api-reference.md)
- one-to-one Typora source-card layer now lives in:
  `../raw/typora/page-cards/` and `../raw/typora/catalog.md`
- cross-links from Typora pages into existing
  [docs/editor-behavior](docs/editor-behavior)
  source-of-truth docs
