# Markdown Standards for Plate

This is the master standards file for Plate's markdown-first editing work.

It exists to stop two common failure modes:

- treating "markdown support" as only parse and serialize
- treating editor behavior as whatever the current plugin implementation happens
  to do

This file records the methodology and authority model after the current
reference pass. It exists so later behavior work does not drift back into
guesswork.

## Goal

Define the standards process for Plate's markdown-first profile so we can:

- audit real reference editors consistently
- make explicit decisions when references disagree
- drive TDD from stable spec IDs
- justify breaking changes during the major release

## Reference Pools

### Typora

Typora is a high-signal reference pool for many markdown-first surfaces.

It is not a governing default owner for every markdown-native row.

Use it for:

- paragraph
- heading
- list
- blockquote
- link
- markdown-native marks
- code
- hard breaks
- markdown-native click-to-edit behavior for links and image-like source syntax
- footnote preview and reference navigation
- HTML-block edit entry
- clipboard text expectations for markdown-first editing
- token-style TOC insertion

### Obsidian

Obsidian is a high-signal reference pool for dual-mode and
note-linked-navigation surfaces.

Use it for:

- live preview vs source mode
- link autocomplete for files, headings, and block references
- rename-updating internal links
- backlinks and unlinked mentions
- outline-as-navigation chrome
- markdown-workspace search chrome
- block-reference product behavior
- product constraints around inline footnotes in dual-mode editors

Do not treat Obsidian as a broad default owner for:

- plain markdown-native typing and structural keys
- generic markdown-first source-entry behavior for rendered links, images, or
  HTML blocks
- low-level destructive-key law where Typora is stronger and more explicit

### Notion

Notion is a high-signal reference pool for many block-editor-native elements.

Use it for:

- toggle
- callout
- mention
- date mentions
- TOC-like blocks
- columns
- media / file blocks
- slash-style or block-menu insertion feel for non-markdown blocks
- inline chip and page-reference interactions

### Google Docs

Google Docs is a high-signal reference pool for document-style editing.

Use it for:

- table cell behavior
- selection and multi-cell expectations
- indentation and alignment feel
- table row and column structure operations
- document-navigation chrome such as outline-like heading jumps
- comment / suggestion / review behavior

### GitHub

GitHub is a high-signal product reference for GFM-only syntax and rendered
semantics.

Use it for:

- task list semantics
- autolink literal semantics
- footnote semantics
- GFM table syntax and rendered rules

Do not use GitHub as the main WYSIWYG editing authority for generic text
behavior. Those surfaces usually point toward Typora for markdown-native
editing and Google Docs for table-feel and document-feel, but the concrete row
still has to choose its own authority.

### Milkdown

Milkdown is the inspectable open-source cross-check.

Use it to inspect:

- markdown-first editing choices
- editor-engine tradeoffs
- cases where Typora or Notion behavior is hard to inspect directly

## Authority Order

Use this order when deciding Plate behavior.

1. syntax spec
2. explicit surface definition and node model
3. strongest surface-specific UX authority with real evidence
4. inspectable cross-check and strongest adjacent precedent
5. explicit fallback only when the others are silent or incompatible

## Node Model And Affinity Requirement

Every current feature family in the readable spec, parity matrix, and protocol
docs must state:

- node model:
  - `block non-void`
  - `block void atom`
  - `inline non-void span`
  - `inline void atom`
  - `leaf mark`
  - `text token`
  - `overlay / no node`
- affinity class when inline typing can cross its boundary:
  - `directional`
  - `hard`
  - `outward`
  - `none / n-a`

Rules:

- do not infer atomicity from UI chrome
- do not infer voidness from DOM `contentEditable={false}`
- use the editor node contract, not the rendered DOM trick
- if a feature is non-void and participates in inline typing, the spec must say
  which affinity class it uses
- inline void atoms do not get link/mark affinity; they own navigation and
  boundary delete as atoms instead

## Candidate Reference Pools

Do not treat this section as governing law.

Use it to route a pass toward likely sources. Concrete sections and protocol
rows still choose authority explicitly.

- parse / serialize semantics:
  - CommonMark for native markdown
  - GFM spec plus GitHub Docs for GFM-only constructs
  - local MDX contract only for intentionally local MDX round-trip
- markdown-native typing, boundary, and source-expansion behavior:
  - often Typora
  - sometimes Milkdown as the stronger inspectable check
- markdown-native interactive preview and navigation:
  - often Typora for plain markdown-native spans, footnotes, image-source
    editing, and HTML-block edit entry
- source-preserving conversion behavior:
  - often Typora for source-entry editing and explicit source-to-structure
    conversion feel
  - often Obsidian for conservative markdown-sensitive conversion pressure such
    as selection-wrap-first delimiter handling
  - often Milkdown as the inspectable cross-check for input-rule conversion
    mechanics
- mode architecture and note-linked navigation:
  - often Obsidian
  - sometimes Google Docs or Typora for narrower document-navigation pieces
- search and navigation chrome:
  - often Obsidian for markdown-workspace search, backlinks, outline, and
    linked-note navigation
  - often Google Docs for linear document outline and heading-jump behavior
- navigation feedback after successful jumps:
  - local shared contract
  - informed by the strongest owner for the target surface
- table navigation, selection, and structure:
  - often Google Docs
- block-editor-native shell behavior:
  - often Notion
- comments, suggestions, and review semantics:
  - often Google Docs
- clipboard:
  - often Typora for general markdown-first copy / paste semantics
  - often Google Docs when table or document-fidelity expectations are stronger
- open-source cross-check:
  - Milkdown
- profile-adjacent options:
  - Typora is often the primary reference for markdown shorthand and
    markdown-delimiter autoformat
  - Typora is often a useful reference for strict-mode and more aggressive
    pair-on-type behavior
  - Obsidian is often a useful reference for conservative markdown-sensitive
    selection-wrap and live-preview-sensitive trigger behavior
  - Milkdown is often a useful inspectable cross-check for input-rule-backed
    trigger behavior
  - mainstream typographic norms are useful for smart quotes and punctuation
    substitutions
  - local current contract may temporarily own thinner symbol-substitution
    tables when stronger editor-level proof is absent
  - `[text](url)` automd and math delimiter triggers belong with
    source-preserving conversion behavior, not with plain mark or
    text-substitution autoformat
- fallback:
  - explicit Plate decision only after the stronger refs for the concrete
    surface are silent or incompatible

### 1. Syntax spec

For parse and serialize semantics, prefer the syntax spec first:

- CommonMark
- GFM spec plus GitHub Docs for GFM-only constructs
- LaTeX / KaTeX-style math delimiter conventions where explicitly adopted
- MDX where Plate intentionally uses MDX for custom round-trip support

### 2. Strongest surface-specific UX authority

Pick the strongest reference for the concrete surface you are actually
specifying, not for the broad family label wrapped around it.

Family labels are routing hints only.

Examples:

- one markdown-extension row may land on Typora
- another markdown-extension row may land on Obsidian
- a third may land on Google Docs or GitHub Docs

That is normal. Do not force one owner across the whole family unless the
evidence genuinely supports it.

### 3. Milkdown

Use Milkdown as the open-source companion reference for inspectable markdown
behavior and engine-level cross-checking.

### 4. Explicit fallback

If the specs are silent or the references disagree, first look for the
strongest adjacent mainstream precedent instead of inheriting legacy Plate
behavior.

Only when that still fails should Plate choose explicitly and record that
choice in the spec and tests.

## Decision Rules

### Surface-first rule

Do not let a category label decide the winner.

Each concrete surface, family split, or protocol row should choose the
strongest authority it can actually justify.

### When the primary and secondary references agree

Default to that behavior unless it directly conflicts with syntax correctness or
Plate's document model.

### When the primary and secondary references disagree

Document:

- the scenario
- what the primary reference does
- what the secondary reference does
- the Plate choice
- why the Plate choice wins

### When both are silent

Only then make an explicit fallback decision. Do not smuggle it in as if it
were a standard.

### When current Plate behavior differs

Do not treat current behavior as a tie-breaker. Existing behavior is evidence,
not authority.

## Scope

This standards lane covers:

- markdown-first editing behavior
- markdown parse and serialize parity
- existing block-editor-native behavior that the major may break
- markdown-aware autoformat
- markdown streaming and partial syntax handling

It does not claim that every Plate block is native markdown. It does claim that
every existing content-affecting feature should have an explicit authority and
coverage status.

## Major Release Bias

During this major, defer minor new-feature work in the markdown lane unless it
is required to unlock parity, cleanup, or profile architecture.

Spend the major budget on:

- breaking wrong behavior cleanly
- normalizing existing constructs
- aligning parse, serialize, and editing semantics for current features
- removing accidental behavior drift between plugins

Treat streaming as regression coverage for this major, not as a proactive work
queue, unless an active current-feature change breaks it.

Do not dilute the release with "nice to have" syntax or extension work while
core existing behavior is still inconsistent.

## Taxonomy

Use the same taxonomy across docs and tests.

### Native markdown constructs

Examples:

- paragraph
- heading
- blockquote
- ordered and unordered list
- inline code
- fenced code block
- emphasis
- strong
- thematic break
- link

### Extension markdown constructs

Examples:

- task list
- table
- strikethrough
- footnote
- autolink literal
- math

### Block-editor-native constructs

Examples:

- mention
- callout
- toggle
- date
- TOC
- columns
- media / file blocks

### Collaboration and editor-only constructs

Examples:

- suggestion
- comment marker
- discussion marker
- editor-only collaboration helpers

These still need explicit behavior decisions:

- supported in the markdown-first release gate
- supported but non-blocking for the major
- deferred to a later minor
- intentionally editor-only

## Spec ID Scheme

Every meaningful rule must have a stable spec ID.

Examples:

- `EDIT-BQ-ENTER-EMPTY-001`
- `EDIT-LIST-BACKSPACE-START-002`
- `PARITY-GFM-TASKLIST-001`
- `PARITY-MATH-BLOCK-003`
- `STREAM-BQ-PARTIAL-001`

### Prefixes

- `EDIT` editing behavior
- `PARITY` parse/serialize/round-trip parity
- `STREAM` streaming or incremental markdown behavior
- `DEV` intentional Plate deviation

## Test Mapping

The end goal is TDD from these docs.

Every locked rule should map to:

- one or more tests
- the owning package or integration surface
- the active behavior profile

Test names should reference spec IDs directly when the behavior is important
enough to survive refactors.

## Lock Levels

Use these labels in the spec docs and parity matrix:

- `draft` pre-reference framing
- `audit` reference research in progress
- `proposed` likely decision, not locked
- `locked` accepted target behavior
- `deviation` intentionally different from the reference

## Deviation Policy

Deviations are allowed. Hidden deviations are not.

When Plate differs from Typora, Obsidian, Google Docs, Notion, or Milkdown,
record:

- spec ID
- scenario
- reference behavior
- Plate behavior
- reason

Good reasons:

- syntax correctness
- document model safety
- better multi-block consistency
- better streaming stability
- better profile composability
- stronger mainstream editor precedent
- exposing a reference behavior as an explicit profile option instead of forcing
  it as the one global default

Bad reasons:

- "the plugin already did this"
- "changing it is annoying"
- "we have tests for it already"
- "it was Plate's old default"

## Research Methodology

This is the order for the later audit.

1. Lock the architecture and standards docs first.
2. Audit reference behavior by scenario, not by random browsing.
3. Audit current Plate behavior and tests against the same scenarios.
4. Mark conflicts.
5. Add failing spec-keyed tests.
6. Refactor behavior seams.
7. Upgrade lock levels from `proposed` to `locked`.

## Required Scenario Shape

When auditing a rule, always capture:

- block family
- nesting context
- selection shape
- triggering key or syntax
- expected structural result
- expected cursor result
- parse / serialize effect if relevant
- streaming effect if relevant

Without that, the audit will drift into vague prose.

## Relationship To Other Docs

- [editor-behavior-architecture.md](docs/research/systems/editor-behavior-architecture.md)
  defines the long-term behavior engine direction
- [markdown-editing-spec.md](./markdown-editing-spec.md)
  defines editing behavior for the markdown-first profile
- [markdown-parity-matrix.md](./markdown-parity-matrix.md)
  defines syntax support and round-trip status

## Immediate Next Step

Do not rerun the broad markdown-first reference audit by default.

Use the live command pack and roadmap first:

- [commands/README.md](docs/editor-behavior/commands/README.md)
- [master-roadmap.md](docs/editor-behavior/master-roadmap.md)

Rerun research or audit only when:

- a concrete authority lane is still unresolved
- compiled research is stale or contradictory
- a new surface appears that the current stack does not honestly cover
