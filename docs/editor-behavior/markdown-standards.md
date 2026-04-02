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

Typora is the primary behavioral north star for the markdown-first profile.

Why:

- markdown-first product, not rich text with markdown on the side
- cohesive editing model
- broad Markdown feature surface

### Milkdown

Milkdown is the open-source companion reference.

Why:

- markdown-first intent
- editor-engine architecture we can inspect directly
- useful counterweight when Typora's public docs or observed behavior are thin

## Authority Order

Use this order when deciding Plate behavior.

1. syntax spec
2. Typora
3. Milkdown
4. Plate-owned decision

### 1. Syntax spec

For parse and serialize semantics, prefer the syntax spec first:

- CommonMark
- GFM where explicitly supported
- math syntax conventions where explicitly adopted
- MDX where Plate intentionally uses MDX for custom round-trip support

### 2. Typora

For editing behavior, Typora is the primary product reference.

### 3. Milkdown

Use Milkdown as the open-source companion reference for markdown-first
behavior, especially when validating architecture or inspectable decisions.

### 4. Plate-owned decision

If the specs are silent or the references disagree, Plate must choose
explicitly and own that choice in the spec and tests.

## Decision Rules

### When Typora and Milkdown agree

Default to that behavior unless it directly conflicts with syntax correctness or
Plate's document model.

### When they disagree

Document:

- the scenario
- what Typora does
- what Milkdown does
- the Plate choice
- why the Plate choice wins

### When both are silent

Make a Plate decision and tag it as a repo-owned rule, not an implied standard.

### When current Plate behavior differs

Do not treat current behavior as a tie-breaker. Existing behavior is evidence,
not authority.

## Scope

This standards lane covers:

- markdown-first editing behavior
- markdown parse and serialize parity
- markdown-aware autoformat
- markdown streaming and partial syntax handling

It does not claim that every Plate block is native markdown.

## Major Release Bias

During this major, defer minor new-feature work in the markdown lane unless it
is required to unlock parity, cleanup, or profile architecture.

Spend the major budget on:

- breaking wrong behavior cleanly
- normalizing existing constructs
- aligning parse, serialize, editing, and streaming semantics
- removing accidental behavior drift between plugins

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

### MDX-backed custom constructs

Examples:

- mention
- date
- custom JSX-backed elements

### Non-markdown Plate constructs

Examples:

- suggestion
- comment marker
- discussion marker
- editor-only helper blocks

These still need explicit parity decisions:

- unsupported
- lossy
- MDX-backed
- profile-specific extension

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

When Plate differs from Typora or Milkdown, record:

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

Bad reasons:

- "the plugin already did this"
- "changing it is annoying"
- "we have tests for it already"

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
