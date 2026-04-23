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

## [2026-04-14] full | editor architecture overlay corpus ingest

- created a new compiled source-family lane for the Slate v2
  decorations / annotations architecture work:
  [sources/editor-architecture/README.md](docs/research/sources/editor-architecture/README.md)
  and
  [decorations-annotations-overlay-corpus.md](docs/research/sources/editor-architecture/decorations-annotations-overlay-corpus.md)
- created a new cross-corpus system map:
  [editor-architecture-landscape.md](docs/research/systems/editor-architecture-landscape.md)
- created a normalized decision page for the overlay-plan cuts:
  [slate-v2-overlay-architecture-cuts.md](docs/research/decisions/slate-v2-overlay-architecture-cuts.md)
- added entity pages for the core candidate set actually used in the overlay
  research:
  ProseMirror, Lexical, Tiptap, Premirror, Pretext, Slate, edix,
  use-editable, rich-textarea, VS Code, TanStack DB, and EditContext
- recorded the current structure gap honestly:
  most evidence for this lane exists in official local repo clones under `../`,
  but has not yet been normalized into dedicated `../raw/<corpus>` families

## [2026-04-14] maintain | decompact overlay research lane

- split the editor-architecture overlay lane into narrower source pages for:
  ProseMirror, Lexical, Tiptap, local Slate v2 proof, layout/measurement/IME,
  lightweight editable surfaces, and service/store models
- added a scoped system page:
  [slate-v2-overlay-architecture.md](docs/research/systems/slate-v2-overlay-architecture.md)
- added reusable concepts:
  [overlay-lane-separation.md](docs/research/concepts/overlay-lane-separation.md),
  [durable-anchor-vs-live-handle.md](docs/research/concepts/durable-anchor-vs-live-handle.md),
  and
  [runtime-identity-vs-tree-address.md](docs/research/concepts/runtime-identity-vs-tree-address.md)
- rewired the overlay corpus overview page so it acts as a ledger/index instead
  of pretending to be the whole lane

## [2026-04-15] maintain | overlay superiority and field-position read

- updated
  [systems/slate-v2-overlay-architecture.md](docs/research/systems/slate-v2-overlay-architecture.md)
  to reflect the implemented lane as accepted instead of partial
- updated
  [systems/editor-architecture-landscape.md](docs/research/systems/editor-architecture-landscape.md)
  with the current Slate v2 position in the candidate field
- added
  [slate-v2-overlay-superiority-vs-legacy-and-field.md](docs/research/decisions/slate-v2-overlay-superiority-vs-legacy-and-field.md)
  to state the durable “better than legacy Slate, aligned with the best ideas
  from the field, but not universally better than every engine” decision

## [2026-04-15] full | perf-architecture lane vs ProseMirror, Lexical, VS Code, and React 19.2

- deepened the editor-architecture research lane on the direct perf-architecture
  compare set:
  ProseMirror, Lexical, VS Code, local Slate v2, and React 19.2
- added a dedicated React 19.2 source page:
  [react-19-2-external-store-and-background-ui.md](docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md)
- strengthened the ProseMirror, Lexical, and VS Code source summaries with
  update/invalidation details instead of only overlay-lane summaries
- updated the landscape/system pages to state the sharper verdict:
  React 19.2 makes Slate v2 a first-class React-native perf architecture, but
  does not by itself prove blanket superiority over ProseMirror, Lexical, or
  VS Code
- added the explicit decision page:
  [slate-v2-react-19-2-perf-architecture-vs-field.md](docs/research/decisions/slate-v2-react-19-2-perf-architecture-vs-field.md)

## [2026-04-15] full | source-scoped overlay invalidation extension

- deepened the overlay perf-architecture lane into the concrete next reshape:
  source-scoped invalidation, source dirtiness declarations, and indexed
  projection recompute below the React layer
- added the concept page:
  [source-scoped-overlay-invalidation.md](docs/research/concepts/source-scoped-overlay-invalidation.md)
- added the decision page:
  [slate-v2-source-scoped-overlay-invalidation.md](docs/research/decisions/slate-v2-source-scoped-overlay-invalidation.md)
- extended the decoration roadmap with Waves 9-11 as the active next-step
  perfection tranche rather than another examples/docs polish pass

## [2026-04-21] maintain | data-model-first React-perfect runtime synthesis

- deepened the editor architecture lane against the current Slate v2
  huge-document perf work and Ian's data-model-first feedback
- inspected strongest local clone evidence across ProseMirror, Lexical, VS Code,
  Pretext/Premirror, TanStack DB, EditContext, and local Slate v2
- added the decision page:
  [slate-v2-data-model-first-react-perfect-runtime.md](docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md)
- accepted the revised target:
  data-model-first core, operation/collaboration-friendly model,
  transaction-first local execution, renderer-optimized live read APIs, and
  React-optimized `slate-react`
- recorded the main risk:
  the huge-doc perf win is real, but direct DOM text sync, shell activation,
  shell-backed paste, and shell accessibility must be hardened before calling
  the runtime "perfect"
