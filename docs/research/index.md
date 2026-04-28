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
- [systems/editor-architecture-landscape.md](docs/research/systems/editor-architecture-landscape.md)
  Compiled comparison map for the editor architecture candidate lane behind the
  Slate v2 overlay rewrite.
- [systems/slate-v2-overlay-architecture.md](docs/research/systems/slate-v2-overlay-architecture.md)
  Stable research-layer architecture map for the Slate v2 overlay system.
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
- editor architecture lane now also includes:
  - [sources/editor-architecture/README.md](docs/research/sources/editor-architecture/README.md)
  - [decorations-annotations-overlay-corpus.md](docs/research/sources/editor-architecture/decorations-annotations-overlay-corpus.md)
  - narrower source clusters for:
    ProseMirror,
    Lexical,
    Tiptap,
    local Slate v2 proof,
    layout/measurement/IME,
    lightweight editable surfaces,
    and service/store models
  - [systems/editor-architecture-landscape.md](docs/research/systems/editor-architecture-landscape.md)
  - [systems/slate-v2-perfect-plan-steal-reject-defer-map.md](docs/research/systems/slate-v2-perfect-plan-steal-reject-defer-map.md)
  - [systems/slate-v2-overlay-architecture.md](docs/research/systems/slate-v2-overlay-architecture.md)
  - [slate-v2-overlay-architecture-cuts.md](docs/research/decisions/slate-v2-overlay-architecture-cuts.md)
  - [slate-v2-overlay-superiority-vs-legacy-and-field.md](docs/research/decisions/slate-v2-overlay-superiority-vs-legacy-and-field.md)
  - [react-19-2-external-store-and-background-ui.md](docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md)
  - [slate-v2-react-19-2-perf-architecture-vs-field.md](docs/research/decisions/slate-v2-react-19-2-perf-architecture-vs-field.md)
  - [source-scoped-overlay-invalidation.md](docs/research/concepts/source-scoped-overlay-invalidation.md)
  - [slate-v2-source-scoped-overlay-invalidation.md](docs/research/decisions/slate-v2-source-scoped-overlay-invalidation.md)
  - [slate-v2-data-model-first-react-perfect-runtime.md](docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md)
  - [read-update-runtime-corpus-ledger.md](docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md)
  - [lexical-read-update-extension-runtime.md](docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md)
  - [prosemirror-transaction-view-dom-runtime.md](docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md)
  - [tiptap-extension-command-react-dx.md](docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md)
  - [slate-v2-read-update-runtime-architecture.md](docs/research/decisions/slate-v2-read-update-runtime-architecture.md)
  - [slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md](docs/research/decisions/slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md)
  - [slate-v2-state-tx-public-api-and-extension-namespaces.md](docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md)
  - [slate-v2-post-closure-architecture-review.md](docs/research/decisions/slate-v2-post-closure-architecture-review.md)
  - [slate-v2-architecture-verdict-after-human-stress-sweep.md](docs/research/decisions/slate-v2-architecture-verdict-after-human-stress-sweep.md)
  - [node-text-mark-render-dx-corpus-ledger.md](docs/research/sources/editor-architecture/node-text-mark-render-dx-corpus-ledger.md)
  - [editor-node-text-mark-dx-landscape.md](docs/research/systems/editor-node-text-mark-dx-landscape.md)
  - [editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md](docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md)
  - concept pages for:
    [overlay-lane-separation](docs/research/concepts/overlay-lane-separation.md),
    [durable-anchor-vs-live-handle](docs/research/concepts/durable-anchor-vs-live-handle.md),
    [runtime-identity-vs-tree-address](docs/research/concepts/runtime-identity-vs-tree-address.md),
    and
    [source-scoped-overlay-invalidation](docs/research/concepts/source-scoped-overlay-invalidation.md)
  - entity pages for:
    [ProseMirror](docs/research/entities/prosemirror.md),
    [Lexical](docs/research/entities/lexical.md),
    [Tiptap](docs/research/entities/tiptap.md),
    [Premirror](docs/research/entities/premirror.md),
    [Pretext](docs/research/entities/pretext.md),
    [Slate](docs/research/entities/slate.md),
    [edix](docs/research/entities/edix.md),
    [use-editable](docs/research/entities/use-editable.md),
    [rich-textarea](docs/research/entities/rich-textarea.md),
    [VS Code](docs/research/entities/vscode.md),
    [TanStack DB](docs/research/entities/tanstack-db.md),
    and
    [EditContext](docs/research/entities/editcontext.md)
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
