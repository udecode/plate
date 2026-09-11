# Research Index

This is the entrypoint for the compiled agent research layer.

## Feature review and prior work

- [Feature review ledger](reviews.md): current-source membership, preliminary
  payoff, dependency order, AI last, and independent review/adoption/proof states.
- [Review-history schema and commands](schema.md#review-history): automatic
  repeat review, immutable records, source reuse and cross-run research lookup.
- [Comments data ownership](decisions/comments-data-ownership.md),
  [code text ownership](decisions/code-text-ownership.md),
  [authored changes](decisions/authored-change-ownership.md),
  [structural comparison](decisions/structural-comparison.md), and
  [performance candidate reuse](decisions/performance-candidate-reuse.md).
- [September 9 performance iteration 2](../plite/research/2026-09-09-editor-performance-iteration-2/README.md),
  [September 10 authored-change research](../plite/research/2026-09-10-authored-changes/README.md),
  and [September 10 structural diff research](../plite/research/2026-09-10-structural-diff-oss/README.md)
  retain their original reads, rejected candidates, experiments and proof limits.

## Top Level

- [README.md](README.md)
  Source of truth for the research pattern, operating rules, and layer boundaries.
- [log.md](log.md)
  Append-only operational history for research ingests and restructures.
- [schema.md](schema.md)
  Minimal metadata contract for the research page types.

## Directories

- [commands/README.md](commands/README.md)
  Operational command specs for running the research workflows.
- [sources/README.md](sources/README.md)
  Compiled summaries of raw evidence.
- [decisions/README.md](decisions/README.md)
  Canonical repo-relevant choices and policy calls.
- [concepts/README.md](concepts/README.md)
  Shared vocabulary and abstractions.
- [systems/README.md](systems/README.md)
  Architecture and authority maps.
- [editor-behavior-architecture.md](systems/editor-behavior-architecture.md)
  Long-horizon architecture for behavior ownership, capability promotion, and
  plugin composition.
- [systems/editor-architecture-landscape.md](systems/editor-architecture-landscape.md)
  Compiled comparison map for the editor architecture candidate lane behind the
  Slate v2 overlay rewrite.
- [systems/slate-v2-overlay-architecture.md](systems/slate-v2-overlay-architecture.md)
  Stable research-layer architecture map for the Slate v2 overlay system.
- [entities/README.md](entities/README.md)
  Concrete named things like editors, packages, and plugins.
- [entities/typora.md](entities/typora.md)
  Seed entity page for the first editor-reference corpus.
- [open-questions/README.md](open-questions/README.md)
  Known ambiguity that should not be flattened into fake certainty.

## First Targets

- operational baseline:
  [commands/full-pipeline.md](commands/full-pipeline.md)
- upkeep baseline:
  [commands/maintain.md](commands/maintain.md)
- Typora compiled source pages derived from `../raw/typora`, starting in
  [sources/typora/README.md](sources/typora/README.md)
- first compiled Typora source pages:
  [corpus-overview.md](sources/typora/corpus-overview.md)
  and
  [editor-behavior-priority-map.md](sources/typora/editor-behavior-priority-map.md)
- first Typora source-cluster syntheses:
  [markdown-native-editing-foundations.md](sources/typora/markdown-native-editing-foundations.md),
  [clipboard-and-delete-behavior.md](sources/typora/clipboard-and-delete-behavior.md),
  [links-images-and-html-behavior.md](sources/typora/links-images-and-html-behavior.md),
  [media-authoring-and-path-policy.md](sources/typora/media-authoring-and-path-policy.md),
  [navigation-search-outline-and-toc.md](sources/typora/navigation-search-outline-and-toc.md),
  and
  [code-math-table-and-task-surfaces.md](sources/typora/code-math-table-and-task-surfaces.md)
  plus
  [math-delimiter-triggers.md](sources/typora/math-delimiter-triggers.md)
  plus
  [markdown-shorthand-and-inline-autoformat.md](sources/typora/markdown-shorthand-and-inline-autoformat.md)
- Typora system map:
  [typora-behavior-map.md](systems/typora-behavior-map.md)
- first Typora-derived concepts and decisions now exist under:
  [concepts/](concepts/README.md),
  [decisions/](decisions/README.md),
  and
  [open-questions/](open-questions/README.md)
- newer date/media expansion follow-up now also includes:
  - [media-authoring-follows-the-image-path-policy-family.md](decisions/media-authoring-follows-the-image-path-policy-family.md)
  - [date-mdx-payload-contract.md](open-questions/date-mdx-payload-contract.md)
  - [math-delimiter-trigger-authority.md](open-questions/math-delimiter-trigger-authority.md)
- editor architecture lane now also includes:
  - [sources/editor-architecture/README.md](sources/editor-architecture/README.md)
  - [decorations-annotations-overlay-corpus.md](sources/editor-architecture/decorations-annotations-overlay-corpus.md)
  - [cursor-find-and-widget-geometry.md](sources/editor-architecture/cursor-find-and-widget-geometry.md)
  - narrower source clusters for:
    ProseMirror,
    Lexical,
    Tiptap,
    local Slate v2 proof,
    layout/measurement/IME,
    lightweight editable surfaces,
    and service/store models
  - [systems/editor-architecture-landscape.md](systems/editor-architecture-landscape.md)
  - [systems/slate-v2-perfect-plan-steal-reject-defer-map.md](systems/slate-v2-perfect-plan-steal-reject-defer-map.md)
  - [systems/slate-v2-overlay-architecture.md](systems/slate-v2-overlay-architecture.md)
  - [slate-v2-overlay-architecture-cuts.md](decisions/slate-v2-overlay-architecture-cuts.md)
  - [slate-v2-overlay-superiority-vs-legacy-and-field.md](decisions/slate-v2-overlay-superiority-vs-legacy-and-field.md)
  - [react-19-2-external-store-and-background-ui.md](sources/editor-architecture/react-19-2-external-store-and-background-ui.md)
  - [tanstack-virtual-and-github-large-surface-virtualization.md](sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md)
  - [pretext-pagination-page-virtualization.md](sources/editor-architecture/pretext-pagination-page-virtualization.md)
  - [slate-v2-react-19-2-perf-architecture-vs-field.md](decisions/slate-v2-react-19-2-perf-architecture-vs-field.md)
  - [source-scoped-overlay-invalidation.md](concepts/source-scoped-overlay-invalidation.md)
  - [slate-v2-source-scoped-overlay-invalidation.md](decisions/slate-v2-source-scoped-overlay-invalidation.md)
  - [slate-v2-collaborative-annotation-channels.md](decisions/slate-v2-collaborative-annotation-channels.md)
  - [slate-v2-data-model-first-react-perfect-runtime.md](decisions/slate-v2-data-model-first-react-perfect-runtime.md)
  - [read-update-runtime-corpus-ledger.md](sources/editor-architecture/read-update-runtime-corpus-ledger.md)
  - [lexical-read-update-extension-runtime.md](sources/editor-architecture/lexical-read-update-extension-runtime.md)
  - [prosemirror-transaction-view-dom-runtime.md](sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md)
  - [tiptap-extension-command-react-dx.md](sources/editor-architecture/tiptap-extension-command-react-dx.md)
  - [slate-v2-read-update-runtime-architecture.md](decisions/slate-v2-read-update-runtime-architecture.md)
  - [slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md](decisions/slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md)
  - [slate-v2-state-tx-public-api-and-extension-namespaces.md](decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md)
  - [slate-v2-post-closure-architecture-review.md](decisions/slate-v2-post-closure-architecture-review.md)
  - [slate-v2-architecture-verdict-after-human-stress-sweep.md](decisions/slate-v2-architecture-verdict-after-human-stress-sweep.md)
  - [node-text-mark-render-dx-corpus-ledger.md](sources/editor-architecture/node-text-mark-render-dx-corpus-ledger.md)
  - [scroll-selection-visibility-runtime.md](sources/editor-architecture/scroll-selection-visibility-runtime.md)
  - [editor-node-text-mark-dx-landscape.md](systems/editor-node-text-mark-dx-landscape.md)
  - [editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md](decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md)
  - concept pages for:
    [overlay-lane-separation](concepts/overlay-lane-separation.md),
    [durable-anchor-vs-live-handle](concepts/durable-anchor-vs-live-handle.md),
    [runtime-identity-vs-tree-address](concepts/runtime-identity-vs-tree-address.md),
    and
    [source-scoped-overlay-invalidation](concepts/source-scoped-overlay-invalidation.md)
  - entity pages for:
    [ProseMirror](entities/prosemirror.md),
    [Lexical](entities/lexical.md),
    [Tiptap](entities/tiptap.md),
    [Premirror](entities/premirror.md),
    [Pretext](entities/pretext.md),
    [Slate](entities/slate.md),
    [edix](entities/edix.md),
    [use-editable](entities/use-editable.md),
    [rich-textarea](entities/rich-textarea.md),
    [VS Code](entities/vscode.md),
    [TanStack DB](entities/tanstack-db.md),
    and
    [EditContext](entities/editcontext.md)
- Milkdown compiled source pages derived from `../raw/milkdown`, starting in
  [sources/milkdown/README.md](sources/milkdown/README.md)
- Obsidian compiled source pages derived from `../raw/obsidian`, starting in
  [sources/obsidian/README.md](sources/obsidian/README.md)
- Obsidian now also has:
  - [footnotes-and-block-links.md](sources/obsidian/footnotes-and-block-links.md)
  - [math-delimiters-and-pair-settings.md](sources/obsidian/math-delimiters-and-pair-settings.md)
  - [obsidian-authority-scope.md](open-questions/obsidian-authority-scope.md)
- Milkdown now also has:
  - [latex-trigger-surface.md](sources/milkdown/latex-trigger-surface.md)
  - [input-autoformat-lanes.md](sources/milkdown/input-autoformat-lanes.md)
- autoformat follow-up now also includes:
  - [autoformat-families-are-input-assist-surfaces.md](decisions/autoformat-families-are-input-assist-surfaces.md)
  - [link-automd-belongs-to-the-link-interaction-lane.md](decisions/link-automd-belongs-to-the-link-interaction-lane.md)
  - [current-kit-autoformat-normalization-split.md](decisions/current-kit-autoformat-normalization-split.md)
  - [text-substitution-autoformat-authority.md](open-questions/text-substitution-autoformat-authority.md)
- input-rule docs IA follow-up now also includes:
  - [sources/tiptap/input-rules-and-extension-doc-patterns.md](sources/tiptap/input-rules-and-extension-doc-patterns.md)
  - [sources/prosemirror/guide-reference-and-example-doc-patterns.md](sources/prosemirror/guide-reference-and-example-doc-patterns.md)
  - [sources/lexical/markdown-package-and-shortcuts-doc-patterns.md](sources/lexical/markdown-package-and-shortcuts-doc-patterns.md)
  - [sources/slate/walkthrough-concepts-and-api-doc-patterns.md](sources/slate/walkthrough-concepts-and-api-doc-patterns.md)
  - [systems/plugin-input-rule-doc-pattern-landscape.md](systems/plugin-input-rule-doc-pattern-landscape.md)
  - [decisions/plugin-input-rules-guide-should-lead-with-runtime-first-then-feature-owners-then-api-reference.md](decisions/plugin-input-rules-guide-should-lead-with-runtime-first-then-feature-owners-then-api-reference.md)
- one-to-one Typora source-card layer now lives in:
  `../raw/typora/page-cards/` and `../raw/typora/catalog.md`
- cross-links from Typora pages into existing
  [docs/editor-behavior](../editor-behavior)
  source-of-truth docs
