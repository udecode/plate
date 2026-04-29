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

## [2026-04-24] maintain | Slate v2 post-closure architecture review

- added a post-closure architecture decision:
  [slate-v2-post-closure-architecture-review.md](docs/research/decisions/slate-v2-post-closure-architecture-review.md)
- accepted that the architecture direction remains right:
  Slate model + operations, `editor.read` / `editor.update`, transaction and
  DOM-selection authority, extension methods, React 19.2 live-read runtime, and
  generated browser gauntlets
- recorded the remaining non-absolute gaps:
  compatibility auto-transactions, internal `Transforms.*` lanes, read-only
  public mirrors, explicit kernel bridges, scoped mobile proof, and the
  accepted huge-document middle-shell caveat

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

## [2026-04-23] maintain | editor architecture raw availability check

- checked whether Lexical, ProseMirror, Tiptap, and Tiptap docs have normalized
  raw evidence families under `../raw`
- confirmed no normalized `../raw/lexical`, `../raw/prosemirror`,
  `../raw/tiptap`, or `../raw/tiptap/docs` family currently exists
- confirmed strongest local evidence exists as official local clones under:
  `../lexical`, `../prosemirror`, `../tiptap`, and the sibling
  `../tiptap-docs` docs clone that later moved under `../raw/tiptap/docs`
- updated
  [sources/editor-architecture/README.md](docs/research/sources/editor-architecture/README.md)
  with the explicit raw availability / structure-gap status

## [2026-04-23] full | read/update runtime architecture raw ingest

- normalized full raw source families for:
  - Lexical: `../raw/lexical/repo`
  - ProseMirror umbrella plus package repos:
    `../raw/prosemirror/repo` and `../raw/prosemirror/packages/*`
  - Tiptap source and docs: `../raw/tiptap/repo` and `../raw/tiptap/docs`
- generated raw `README.md` and `catalog.md` files for each family

- appended raw evidence updates to `../raw/log.md`
- added the per-corpus evidence ledger:
  [read-update-runtime-corpus-ledger.md](docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md)
- added source summaries:
  - [lexical-read-update-extension-runtime.md](docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md)
  - [prosemirror-transaction-view-dom-runtime.md](docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md)
  - [tiptap-extension-command-react-dx.md](docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md)
- accepted the read/update lifecycle decision:
  [slate-v2-read-update-runtime-architecture.md](docs/research/decisions/slate-v2-read-update-runtime-architecture.md)
- updated [index.md](docs/research/index.md) and
  [sources/editor-architecture/README.md](docs/research/sources/editor-architecture/README.md)

## [2026-04-23] full | deeper steal reject defer architecture analysis

- deepened the Lexical / ProseMirror / Tiptap architecture lane from raw
  evidence already normalized under `../raw`
- added the system map:
  [slate-v2-perfect-plan-steal-reject-defer-map.md](docs/research/systems/slate-v2-perfect-plan-steal-reject-defer-map.md)
- accepted the sharper architecture decision:
  [slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md](docs/research/decisions/slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md)
- updated [index.md](docs/research/index.md) with the new system and decision

## [2026-04-23] maintain | Slate v2 perfect architecture pause review

- rechecked the active perfect architecture plan against the compiled
  Lexical / ProseMirror / Tiptap research lane after the browser proof substrate
  exposed more cursor and selection regressions
- kept the accepted architecture direction unchanged:
  Slate model + operations, Lexical-style `read`/`update`, ProseMirror-style
  transaction and DOM-selection discipline, Tiptap-style extension ergonomics,
  and React 19.2 optimized runtime APIs
- recorded the remaining risk as proof-discipline risk, not a reason to pivot
  into a different editor model:
  fixture honesty, generated browser gauntlets, cross-browser closure, and
  model + DOM + commit assertions still decide whether the plan is
  battle-tested

## [2026-04-26] maintain | Slate v2 architecture verdict after human stress sweep

- rechecked the accepted Slate v2 architecture lane against the latest
  human-like browser editing sweep
- kept the architecture direction unchanged:
  Slate model + operations, `editor.read` / `editor.update`,
  transaction-owned primitive methods, `EditorCommit`, extension methods,
  React 19.2 live reads, and generated browser proof
- recorded the sharper verdict:
  current Slate v2 is the right architecture bet, but not regression-free or
  battle-tested yet because the sweep still found a multiline paste regression,
  a route-map crash, and an unfixed `mentions` invalid DOM nesting warning
- added:
  [slate-v2-architecture-verdict-after-human-stress-sweep.md](docs/research/decisions/slate-v2-architecture-verdict-after-human-stress-sweep.md)

## [2026-04-27] full | node text mark render DX architecture

- deepened the ProseMirror / Lexical / Tiptap architecture lane for node,
  text, mark, and render DX
- confirmed the normalized raw source families remain sufficient for this
  scoped pass:
  - `../raw/prosemirror`
  - `../raw/lexical`
  - `../raw/tiptap`
- added the per-corpus evidence ledger:
  [node-text-mark-render-dx-corpus-ledger.md](docs/research/sources/editor-architecture/node-text-mark-render-dx-corpus-ledger.md)
- added the system map:
  [editor-node-text-mark-dx-landscape.md](docs/research/systems/editor-node-text-mark-dx-landscape.md)
- accepted the node DX decision:
  [editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md](docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md)
- updated [index.md](docs/research/index.md) and
  [sources/editor-architecture/README.md](docs/research/sources/editor-architecture/README.md)

## [2026-04-27] maintain | Slate v2 architecture verdict after item 4/5/6 closure

- refreshed the accepted Slate v2 architecture verdict after the item 4/5/6
  hard-cut lane completed
- recorded the stronger current proof:
  public write/read escape hatches cut or fenced, compatibility aliases guarded
  by release discipline, generated browser contracts covering reported
  operation families, and `bun check:full` passing
- kept the harsh verdict unchanged at the top level:
  the architecture direction is right and stronger than before, but not yet
  absolute, regression-free, or battle-tested without runtime ownership
  extraction, Plate/Yjs migration proof, longer soak, and real-device coverage
- updated:
  [slate-v2-architecture-verdict-after-human-stress-sweep.md](docs/research/decisions/slate-v2-architecture-verdict-after-human-stress-sweep.md)

## [2026-04-27] maintain | Slate v2 architecture verdict after selector/live-read hard cut

- refreshed the accepted Slate v2 architecture verdict after the selector and
  live-read runtime hard-cut lane completed
- recorded the stronger current proof:
  public node/text selectors are model-truth-only, synced-text render skipping
  is internal to mounted render selector hooks, direct `slate/internal` live
  reads in `slate-react/src` are limited to runtime facade modules, focused
  browser regression rows pass, and `bun check:full` passes with one recorded
  retry that passed alone without retries
- kept the harsh verdict unchanged:
  Slate v2 remains the right architecture bet, but still not absolute or
  battle-tested until hot selection/repair/composition policy leaves
  `Editable`, broad hot React subscriptions shrink further, Plate/Yjs adapter
  rows exist, and raw-device proof covers mobile claims
- updated:
  [slate-v2-architecture-verdict-after-human-stress-sweep.md](docs/research/decisions/slate-v2-architecture-verdict-after-human-stress-sweep.md)

## [2026-04-27] maintain | Slate v2 architecture verdict after live runtime review

- rechecked the live `../slate-v2` runtime and proof surface against the
  React 19.2, DX, legacy-regression, and Lexical/ProseMirror/Tiptap criteria
- recorded the stronger current fact:
  `Editable` and `EditableTextBlocks` no longer carry generic
  `useSlateSelector` hot paths, direct kernel/selection/repair calls moved into
  runtime modules, root selector reads are named in
  `editable/root-selector-sources.ts`, and generated stress rows include render
  budget assertions
- kept the harsh verdict unchanged:
  Slate v2 is the right architecture bet, but not absolute until event-runtime
  ownership shrinks `Editable` further and generated browser parity runs the
  same operation-family scenarios against legacy `../slate` and v2 examples
- updated:
  [slate-v2-architecture-verdict-after-human-stress-sweep.md](docs/research/decisions/slate-v2-architecture-verdict-after-human-stress-sweep.md)

## [2026-04-28] maintain | Slate v2 root-runtime verdict refresh

- refreshed the Slate v2 architecture verdict after the root runtime selector
  guard lane completed
- updated
  [slate-v2-architecture-verdict-after-human-stress-sweep.md](docs/research/decisions/slate-v2-architecture-verdict-after-human-stress-sweep.md)
  so it no longer treats `EditableDOMRoot` root policy ownership as the top
  current blocker
- recorded the new remaining priority: runtime-owned public void shells,
  generated legacy browser parity, Plate/Yjs migration proof, and real-device
  soak

## [2026-04-28] maintain | Slate v2 state/tx API naming and extension namespaces

- refreshed the read/update architecture lane for the sharper public naming
  question around `state`, `tx`, `api`, `tf`, extension groups, and schema
  predicate placement
- checked the local official Lexical, ProseMirror, and Tiptap clones plus the
  compiled read/update evidence pages
- accepted the API decision:
  [slate-v2-state-tx-public-api-and-extension-namespaces.md](docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md)
- updated [index.md](docs/research/index.md) with the new decision page

## [2026-04-28] maintain | Slate v2 React 19.2 evidence refresh

- refreshed the React 19.2 evidence used by the Slate v2 architecture review
  against the official React 19.2 release page
- accepted
  [react-19-2-external-store-and-background-ui.md](docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md)
  as current enough for the review lane
- confirmed the same conclusion: React 19.2 helps the projection layer and
  non-urgent UI, but Slate still needs editor-owned dirty commits and
  node-scoped subscriptions for hot editing paths

## [2026-04-28] maintain | Slate v2 state/tx decision drift cleanup

- found stale wording in
  [slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md](docs/research/decisions/slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md)
  that still described primitive `editor.*` methods as the power API inside
  `editor.update`
- marked the newer
  [slate-v2-state-tx-public-api-and-extension-namespaces.md](docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md)
  decision as the current authority for public naming and extension namespaces
- kept the older page accepted for the broader steal/reject/defer conclusion,
  but stopped it from being used as evidence for flat editor method DX

## [2026-04-28] maintain | Slate v2 state/tx live-source refresh

- refreshed
  [slate-v2-state-tx-public-api-and-extension-namespaces.md](docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md)
  against live `../slate-v2` source, tests, docs, and examples
- recorded the current split:
  `state` / `tx` exists and is tested, but author-facing docs/examples still
  teach primitive `editor.*` writes inside `editor.update`
- kept the accepted decision unchanged:
  `editor.update((tx) => tx.*)` is the normal public write target; primitive
  editor writes need either advanced/internal classification or docs/examples
  migration before the API can be called final

## [2026-04-28] maintain | Slate v2 node-DX command example cleanup

- refreshed
  [editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md](docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md)
  during the whole-rewrite review Pass 2
- updated its extension command example to use
  `editor.update((tx) => tx.nodes.insert(...))`
- kept the decision unchanged:
  runtime-owned shells and spec-first renderers are still accepted, but public
  command examples must follow the newer `state` / `tx` naming decision

## [2026-04-28] maintain | Slate v2 overlay local proof refresh

- refreshed
  [slate-v2-local-proof-substrate.md](docs/research/sources/editor-architecture/slate-v2-local-proof-substrate.md)
  against current `../slate-v2` projection, annotation, widget, hook, test, and
  benchmark files during the decoration/annotation rewrite review
- removed stale `decoration-sources.ts` source references because live source
  still routes decoration sources through `projection-store.ts`
- kept the conclusion unchanged:
  Slate v2 has strong runtime-id subscription proof, but source-scoped
  recompute and annotation/widget perf still need lower-level runtime work
