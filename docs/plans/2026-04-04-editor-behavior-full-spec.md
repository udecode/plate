# Editor Behavior Full Spec

## Goal

Write the full readable editor-behavior spec without blowing up the doc stack.

The spec should cover every in-scope family at the family-law level, while the
protocol matrix continues to own exhaustive permutations.

## Doc Decision

Keep the current split.

- `docs/editor-behavior/markdown-editing-spec.md`
  - readable law
  - family-complete
  - authority summary
  - canonical examples
  - explicit local-contract notes where needed
- `docs/editor-behavior/editor-protocol-matrix.md`
  - exhaustive scenario rows
  - row-level authority/evidence/status
- `docs/editor-behavior/markdown-parity-matrix.md`
  - release gate

Do **not** add another “full spec” doc unless the current split actually fails.

## Scope Order

First finish markdown-native and markdown-extension families.

1. paragraph
2. heading
3. unordered list
4. ordered list
5. task list
6. blockquote
7. code block
8. math block
9. table
10. link
11. image
12. inline code / hard inline nodes
13. thematic break
14. hard line break
15. MDX mark extensions:
    - highlight
    - subscript
    - superscript
16. emoji shortcode
17. footnote

Only after that, expand the non-markdown families:

18. callout
19. mention
20. date
21. TOC
22. columns
23. media / caption
24. styling / layout

Deferred lanes stay deferred:

- toggle rewrite
- collaboration/editor-only
- code drawing / Excalidraw
- IME / clipboard / drag / platform shortcuts

## What The Readable Spec Must Say For Each Family

For every family, `markdown-editing-spec.md` should include:

1. authority
   - syntax authority
   - primary UX ref
   - secondary ref
   - whether the result is local contract
2. ownership
   - what key owner wins first
3. insertion / creation
   - if supported
   - if not supported, say that plainly
4. destructive behavior
   - `⌫`
   - `⌦` if meaningfully different
5. split / continuation
   - `↵`
6. indentation / movement
   - `⇥`
   - `⇤`
   - arrows when meaningfully special
7. selection/escalation
   - only the family-level law, not every permutation
8. canonical examples
   - 1-3 high-signal examples
9. plugin-surface note
   - whether insert/toggle/toolbar/slash exists or not

## Markdown-First Batches

### Batch 1: Structural Core

- paragraph
- heading
- unordered list
- ordered list
- task list
- blockquote

Exit criteria:

- each family has explicit authority + ownership + `↵` + `⌫` + `⇥/⇤` law
- no family is only implied by examples from another family

### Batch 2: Strong Owners

- code block
- math block
- table

Exit criteria:

- table is split into cell navigation and table structure
- code and math clearly say what is local policy vs externally grounded

### Batch 3: Inline Markdown

- link
- image
- inline code / hard inline nodes
- thematic break
- hard line break

Exit criteria:

- link/image semantics stop leaking into generic paragraphs
- hard-boundary behavior is stated once, not scattered

### Batch 4: Extension Layer

- highlight
- subscript
- superscript
- emoji shortcode
- footnote

Exit criteria:

- extension marks and syntax are first-class sections, not hidden inside markdown docs elsewhere
- plugin-surface gaps are explicit

### Batch 5: Block-Editor-Native Existing Features

- callout
- mention
- date
- TOC
- columns
- media / caption
- styling / layout

Exit criteria:

- every family is labeled honestly as either standard-backed or local contract

## Protocol Matrix Follow-Up

After each readable-spec batch:

1. ensure the family rows exist in `editor-protocol-matrix.md`
2. ensure the family row in `markdown-parity-matrix.md` matches the law
3. add any missing `Spec ID` links
4. downgrade fake-standard wording to local contract where needed

## Plugin Surface Rule

If a package does **not** expose a transform or insert action, the spec must say
that plainly.

Do not imply:

- insert toolbar support
- slash command support
- toggle support
- creation transforms

unless those surfaces actually exist.

## Deliverable

When this plan is finished:

- `markdown-editing-spec.md` reads like the full family-level law
- `editor-protocol-matrix.md` remains the exhaustive row ledger
- `markdown-parity-matrix.md` stays the ship gate
- plugin docs and editor-behavior docs no longer contradict each other
