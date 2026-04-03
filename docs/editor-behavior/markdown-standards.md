# Markdown Standards for Plate

This is the master standards file for Plate's markdown-first editing work.

It exists to stop two common failure modes:

- treating "markdown support" as only parse and serialize
- treating editor behavior as whatever the current plugin implementation happens
  to do

This file is intentionally written before the full Typora and Milkdown audit.
It defines the methodology first so later reference digging has a stable target.

## Goal

Define the standards process for Plate's markdown-first profile so we can:

- audit real reference editors consistently
- make explicit decisions when references disagree
- drive TDD from stable spec IDs
- justify breaking changes during the major release

## North Stars

### Typora

Typora is the primary behavioral north star for markdown-native editing.

Use it for:

- paragraph
- heading
- list
- blockquote
- link
- markdown-native marks
- code
- hard breaks

### Notion

Notion is the primary behavioral north star for block-editor-native elements.

Use it for:

- toggle
- callout
- mention
- date mentions
- TOC-like blocks
- columns
- media / file blocks

### Google Docs

Google Docs is the primary behavioral north star for document-style editing.

Use it for:

- table cell behavior
- selection and multi-cell expectations
- indentation and alignment feel
- comment / suggestion / review behavior

### GitHub

GitHub is the primary product authority for GFM-only syntax and rendered
semantics.

Use it for:

- task list semantics
- autolink literal semantics
- footnote semantics
- GFM table syntax and rendered rules

Do not use GitHub as the main WYSIWYG editing authority for generic text
behavior. That still belongs to Typora for markdown-native editing and Google
Docs for table-feel and document-feel.

### Milkdown

Milkdown is the open-source companion reference and architecture cross-check.

Use it to inspect:

- markdown-first editing choices
- editor-engine tradeoffs
- cases where Typora or Notion behavior is hard to inspect directly

## Authority Order

Use this order when deciding Plate behavior.

1. syntax spec
2. strongest feature-family UX authority
3. Milkdown as inspectable cross-check
4. explicit fallback only when the others are silent or incompatible

### 1. Syntax spec

For parse and serialize semantics, prefer the syntax spec first:

- CommonMark
- GFM spec plus GitHub Docs for GFM-only constructs
- LaTeX / KaTeX-style math delimiter conventions where explicitly adopted
- MDX where Plate intentionally uses MDX for custom round-trip support

### 2. Strongest feature-family UX authority

Pick the most standard or popular reference for the feature family:

- Typora for markdown-native editing
- Notion for block-editor-native elements
- Google Docs for tables, styling, and review-like collaboration
- GitHub for GFM-only syntax and rendered behavior where Typora is not the
  product authority

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

When Plate differs from Typora, Google Docs, Notion, or Milkdown, record:

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

- [editor-behavior-architecture.md](./editor-behavior-architecture.md)
  defines the long-term behavior engine direction
- [markdown-editing-spec.md](./markdown-editing-spec.md)
  defines editing behavior for the markdown-first profile
- [markdown-parity-matrix.md](./markdown-parity-matrix.md)
  defines syntax support and round-trip status

## Immediate Next Step

Run the reference audit with Typora and Milkdown against the spec IDs in the
editing spec and parity matrix. Do not skip straight to implementation.
