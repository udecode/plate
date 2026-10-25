# Markdown Editing Spec for Plate

This is the normative editing spec for Plate's markdown-first behavior
contract.

Status: current readable law for the markdown-first behavior contract.

`markdown_typora` is a specification and test label. It does not imply a public
profile registry or a second behavior runtime. A reusable shipped profile is an
ordinary plugin kit only after real reuse earns that API.

This file is about editing behavior and the round-trip rules its families state; ordinary Markdown syntax law lives in `docs/vision/plate.md` (Ordinary Markdown is CommonMark with GFM and math) and in each family's `syntax:` Authority line below.

This file is also intentionally non-exhaustive. It defines the readable law:

- core invariants
- ownership order
- family-level contracts
- canonical examples
- locked policy calls

It is family-complete for the current in-scope editor behavior. Scenario permutations live as notes under each family, and [current-evidence.md](./current-evidence.md) maps spec families to their proof owners and lists the matrix-era evidence gaps.

Before closing accepted editor-behavior work, reconcile it with this law. When the implementation or proof changed or clarified intended behavior, edit the affected family section, including its Authority lines when the winning reference moved and the behavior classification `docs/vision/plate.md` requires, and tag the proving test as `CODING_STANDARDS.md`'s Tests section says. Record in [current-evidence.md](./current-evidence.md) only what a tag cannot say, such as a rule family or a surface limit. A rule whose test is missing or renamed is listed there as an evidence gap, never as tested. When the change alters reusable packaging doctrine, run `best-api repair`. When it only restored settled law, tag the proof and update the affected coverage without rewriting the normative law. When the work changed a shipped surface, update its public docs through `plate-docs` in the same change. Verdict may flag this duty but stays read-only.

## Behavior Contract

- contract id: `markdown_typora`
- companion reference: `markdown_milkdown`

## Authority

This section is the method for choosing authority. Concrete family sections and their notes choose authority per surface; do not infer one default owner for an entire category.

### Scope

This spec covers markdown-first editing behavior, markdown parse and serialize parity, existing block-editor-native behavior, markdown-aware autoformat, and markdown streaming and partial syntax handling. It does not claim that every Plate block is native markdown; it does claim that every existing content-affecting feature has an explicit authority here and a proof status in [current-evidence.md](./current-evidence.md). It does not cover AI workflows, slash-menu and toolbar UI, DOCX, HTML or CSV export quality unless it changes editor behavior, or browser chrome around the editor.

### Spec IDs

Every meaningful rule has a stable spec ID with the `EDIT` prefix, such as `EDIT-BQ-ENTER-EMPTY-001`.

### Law To Packaging

This spec defines behavior law, scenario evidence, and correctness invariants. It does not decide public plugin count. When law exposes a packaging question, classify the behavior as `docs/vision/plate.md` requires (invariant, parameter, substitutable capability or product policy), run `best-api design` or `best-api review` before naming a public plugin, run `best-api repair` when the classification changes reusable doctrine, and hand an accepted public target to the Plan playbook; do not encode an unresolved packaging decision in an implementation plan. Do not infer one plugin from one spec note, handler, extension block, or non-universal behavior.

### Authority Order

Use this order when deciding Plate behavior.

1. syntax spec
2. explicit surface definition and node model
3. strongest surface-specific UX authority with real evidence
4. inspectable cross-check and strongest adjacent precedent
5. explicit fallback only when the others are silent or incompatible

### Applying The Order

#### 1. Syntax spec

For parse and serialize semantics, prefer the syntax spec first:

- CommonMark
- GFM spec plus GitHub Docs for GFM-only constructs
- LaTeX / KaTeX-style math delimiter conventions where explicitly adopted
- MDX where Plate intentionally uses MDX for custom round-trip support

#### 2. Strongest surface-specific UX authority

Pick the strongest reference for the concrete surface you are actually
specifying, not for the broad family label wrapped around it.

Family labels are routing hints only.

Examples:

- one markdown-extension row may land on Typora
- another markdown-extension row may land on Obsidian
- a third may land on Google Docs or GitHub Docs

That is normal. Do not force one owner across the whole family unless the
evidence genuinely supports it.

#### 3. Milkdown

Use Milkdown as the open-source companion reference for inspectable markdown
behavior and engine-level cross-checking.

#### 4. Explicit fallback

If the specs are silent or the references disagree, first look for the
strongest adjacent mainstream precedent instead of inheriting legacy Plate
behavior.

Only when that still fails should Plate choose explicitly and record that
choice in the spec and tests.

Do not cite stale `editor-protocol` GitHub issues as authority; port a useful scenario from an older issue into this spec in Plate's current vocabulary and drop the link.

### Reference Pools

#### Typora

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

#### Obsidian

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

#### Notion

Notion is a high-signal reference pool for many block-editor-native elements.

Use it for:

- details
- callout
- mention
- date mentions
- TOC-like blocks
- columns
- media / file blocks
- slash-style or block-menu insertion feel for non-markdown blocks
- inline chip and page-reference interactions

#### Google Docs

Google Docs is a high-signal reference pool for document-style editing.

Use it for:

- table cell behavior
- selection and multi-cell expectations
- indentation and alignment feel
- table row and column structure operations
- document-navigation chrome such as outline-like heading jumps
- comment / suggestion / review behavior

#### GitHub

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

#### Milkdown

Milkdown is the inspectable open-source cross-check.

Use it to inspect:

- markdown-first editing choices
- editor-engine tradeoffs
- cases where Typora or Notion behavior is hard to inspect directly

When Milkdown's tests and docs disagree, its e2e input, shortcut and transform
tests and package unit tests win for behavior, and its docs win for ownership
and API mapping ([behavior test lanes](../research/sources/milkdown/behavior-test-lanes.md)).

### Candidate Reference Pools

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
  - sometimes Obsidian, Notion, or Milkdown depending on the surface
- block-editor-native shell behavior:
  - often Notion
  - sometimes Milkdown or a narrower mainstream precedent
- comments, suggestions, and review semantics:
  - often Google Docs
- clipboard:
  - often Typora for general markdown-first copy / paste semantics
  - often Google Docs when table or document-fidelity expectations are stronger
- open-source cross-check:
  - Milkdown
- behavior-policy options:
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

### Decision Rules

#### Surface-first rule

Do not let a category label decide the winner.

Each concrete surface, family split, or protocol row should choose the
strongest authority it can actually justify.

#### When the primary and secondary references agree

Default to that behavior unless it directly conflicts with syntax correctness or
Plate's document model.

An explicit primary reference with a merely compatible secondary reference is enough to lock a rule. Treat a reference's silence as a gap, not as agreement.

#### When the primary and secondary references disagree

Document:

- the scenario
- what the primary reference does
- what the secondary reference does
- the Plate choice
- why the Plate choice wins

When the references pull in different directions, push the behavior into plugin- or kit-owned policy instead of hard-coding one global default.

#### When both are silent

Only then make an explicit fallback decision. Do not smuggle it in as if it
were a standard.

#### When current Plate behavior differs

Do not treat current behavior as a tie-breaker. Existing behavior is evidence,
not authority.

#### When to rerun reference research

Rerun broad reference research only when a concrete authority question is unresolved, compiled research is stale or contradictory, or a new surface appears that this spec does not cover.

### Deviation Policy

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
- cleaner capability composition
- stronger mainstream editor precedent
- assigning reference behavior to an explicit owner option or app-kit policy
  after classification instead of forcing one global default

Bad reasons:

- "the plugin already did this"
- "changing it is annoying"
- "we have tests for it already"
- "it was Plate's old default"

### Required Scenario Shape

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

## Legend

### Core

- `|` = caret
- `[[text]]` = inline selection
- `[[` on one line and `]]` on a later line = multi-block selection
- each line = one block unless the example shows a fenced block or table
- blank line = block boundary
- `=>` = result after one keypress
- numbered chains = repeated keypresses

### Keys

- `↵` = `Enter`
- `⌫` = `Backspace`
- `⌦` = `Delete`
- `⇥` = `Tab`
- `⇤` = `Shift+Tab`

### Block Shorthand

- paragraph: `text`
- heading: `# text`, `## text`
- blockquote: `> text`, `>> text`
- unordered list: `- text`
- ordered list: `1. text`
- task list: `- [ ] text`, `- [x] text`
- quoted list: `> - text`
- thematic break: `---`
- code block:

````text
```ts
|code
```
````

- math block:

```text
$$
|x = 1
$$
```

- table:

```text
| A | B |
| - | - |
| x | y |
```

- details: `::details[open] Summary`
- callout: `::callout[info] Text`
- media/embed: `::media[url]`
- atomic block: `::atom[name]`

### Status Meanings

- `locked` = current intended rule for the markdown-first behavior contract
- `proposed` = intended direction, still open to movement
- `audit` = waiting on stronger external grounding or more direct coverage
- `deviation` = intentionally contract- or kit-owned, not one global truth

## Global Invariants

- `EDIT-GLOBAL-001` `locked`: nearest structure wins for structural keys
- `EDIT-GLOBAL-002` `locked`: one keypress changes one structural depth
- `EDIT-GLOBAL-003` `locked`: empty `↵` exits one container level, not all levels
- `EDIT-GLOBAL-004` `locked`: `⌫` deletes or merges the current empty block in place before any structural lift
- `EDIT-GLOBAL-005` `locked`: expanded selections operate on all selected blocks without silently dropping structure

- `EDIT-HISTORY-CROSS-ROOT-SELECTION-001` `proposed` `undo or redo through a root view`: replay may change content belonging to another root, but must not restore that other root's saved selection into the invoking view or move the invoking view's caret. A content batch restores its saved selection only in the root that owns that selection and participates in the batch.

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: none checked; secondary ref: none checked. This is a local root-ownership contract, not a claimed reference-editor behavior.
Source: c70bacbd4a:docs/plans/2026-05-20-plite-non-node-editor-state-architecture-ralplan.md:106-114
Proof: `packages/plitejs/src/history/history-selection.ts` checks the saved selection's root and the batch's changed roots before restoration, and restoreHistoricSelection writes only when the saved root equals the view root. `apps/plite/tests/plite-browser/donor/examples/multi-root-document.test.ts` "document undo keeps the focused root caret when undoing another root's batch" undoes body content, then header content, and asserts identical body DOM selection and focus across the header undo; subsequent typing stays in the body. This is Plite browser-example proof for undo. That case does not exercise redo or Plate's plugin stack. Test read, not run.

- `EDIT-SELECTION-ASYNC-DECORATION-001` `proposed` `delayed highlight refresh after typing`: a highlight that restructures text DOM preserves the model caret or range and leaves browser selection representing the same model positions. Highlight presentation changes no document content or history. Active composition follows the separate composition repair policy.

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: none checked; secondary ref: none checked. This is a local presentation invariant, not an observed reference-editor rule.
Source: docs/plans/2026-05-23-plite-async-decoration-caret-cluster-proof.md:18-25,47-50
Proof: `apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts` "keeps the caret at the typed end when delayed decorations restructure text" types a suffix, waits for highlight count to rise from two to three, and asserts the unchanged model caret and matching DOM text offset. It covers a collapsed caret, not an expanded range or history. Mobile uses the harness insertion method. `packages/plitejs/src/react/editable/decoration-repair-bridge.ts` requests model-owned selection repair after changed decoration DOM commits and skips active composition. Only a Plite example supplies browser proof. Test read, not run.

## Node Model And Affinity Classes

Use these model classes everywhere in this stack:

- `block non-void`: editable block/container content
- `block void atom`: atomic block surface with no caret inside its body in rich
  mode
- `inline non-void span`: editable inline content such as links
- `inline void atom`: atomic inline surface with no editable rich-text body
- `leaf mark`: text mark carried by leaves, not by separate inline elements
- `text token`: syntax-preserving text behavior such as hard breaks after parse
- `overlay / no node`: editor chrome with no document node ownership

Use these affinity classes when inline typing can cross a boundary:

- `directional`: typing from the formatted side extends it; typing from the
  plain side stays out
- `hard`: boundary typing stays out instead of extending the formatted span
- `outward`: metadata ranges bias away from accidental growth
- `none / n-a`: block nodes, void atoms, text tokens, and overlays do not own
  inline affinity

Rules:

- every current feature family must declare one node model
- every inline non-void span or leaf mark must declare one affinity class
- inline void atoms do not rely on mark/link affinity; they own arrow, delete,
  and navigation behavior as atoms
- an inline void atom declares one keyboard-access policy: arrows enter it, or arrows skip it as one unit (`selectable: false`). Sibling inline atoms share one policy unless a named product decision splits them, a change to one inline atom's arrow behavior reruns its sibling atoms' arrow rows, and skipping is never a default fix for an arrow bug
- rich mode must not expose a caret inside identifier or chip text that is only
  renderer chrome for an inline void atom
- do not infer atomicity from UI chrome
- do not infer voidness from DOM `contentEditable={false}`
- use the editor node contract, not the rendered DOM trick

### Entity Model Map

This is the canonical model map for the current feature set. Family sections below inherit the entity model from this table unless a section says otherwise. Use the same taxonomy across docs and tests.

| Family              | Entity                    | Node Model                            | Affinity / Boundary Policy |
| ------------------- | ------------------------- | ------------------------------------- | -------------------------- |
| markdown-native     | paragraph                 | block non-void                        | `n/a`                      |
| markdown-native     | heading                   | block non-void                        | `n/a`                      |
| markdown-native     | blockquote                | block non-void container              | `n/a`                      |
| markdown-native     | list item                 | block non-void container              | `n/a`                      |
| markdown-native     | link                      | inline non-void span                  | `directional`              |
| markdown-native     | image                     | non-void object owner with editable children | node-selected asset / text-selected caption |
| markdown-native     | soft mark                 | leaf mark                             | `directional`              |
| markdown-native     | hard mark                 | leaf mark                             | `hard`                     |
| markdown-native     | code block                | block non-void owner                  | `n/a`                      |
| markdown-native     | thematic break            | block void atom                       | `n/a`                      |
| markdown-native     | hard line break           | text token                            | `n/a`                      |
| markdown-extension  | task list item            | block non-void container              | `n/a`                      |
| markdown-extension  | table                     | block non-void grid owner             | `n/a`                      |
| markdown-extension  | inline math               | inline void atom                      | `n/a`                      |
| markdown-extension  | block math                | block void atom                       | `n/a`                      |
| markdown-extension  | autolink literal          | inline non-void link span             | `directional`              |
| markdown-extension  | footnote reference        | inline void atom                      | `n/a`                      |
| markdown-extension  | footnote definition       | block non-void container              | `n/a`                      |
| markdown-extension  | emoji shortcode           | text token after parse                | `n/a`                      |
| block-editor-native | mention                   | inline void atom                      | `n/a`                      |
| block-editor-native | date                      | inline void atom                      | `n/a`                      |
| block-editor-native | callout                   | block non-void container              | `n/a`                      |
| block-editor-native | details                   | block non-void container              | `n/a`                      |
| block-editor-native | TOC                       | block void atom                       | `n/a`                      |
| block-editor-native | column group / item       | block non-void container              | `n/a`                      |
| block-editor-native | media embed               | isolating non-void keyboard-selectable media owner | node-selected asset / text-selected caption |
| block-editor-native | media block               | isolating non-void keyboard-selectable media owner | node-selected asset / text-selected caption |
| block-editor-native | caption                   | direct inline media children          | `TextSelection`            |
| block-editor-native | excalidraw                | block void atom                       | `n/a`                      |
| styling/layout      | block style property      | block non-void property               | `n/a`                      |
| styling/layout      | style mark                | leaf mark                             | `directional`              |
| collaboration       | comment                   | leaf metadata mark                    | `outward`                  |
| collaboration       | suggestion                | leaf metadata mark plus block wrapper | `outward`                  |
| collaboration       | discussion                | overlay / anchor surface              | `n/a`                      |
| collaboration       | yjs cursor overlay        | overlay / no node                     | `n/a`                      |

### `⌫` Hierarchy

```text
1. nearest strong owner wins
2. if the current block is empty and can die inside the same container, let it die there
3. otherwise remove one structural layer
4. never escape code, math, or table just because the caret is at offset 0
```

## Ownership Order

For structural keys, the default ownership order is:

1. table cell
2. code block or fenced block
3. details container
4. list item
5. blockquote
6. indent block
7. generic block fallback

This is the current ownership order for markdown-first behavior.

Where Markdown has a real structural representation, the editor uses it instead of a visual-only shortcut or local fake structure.

## Paragraph

Authority:

- syntax: CommonMark
- primary UX ref: Typora
- secondary ref: Milkdown

Ownership:

- paragraph is the generic block fallback after stronger owners yield
- paragraph owns plain `⇥` / `⇤` indentation when the caret is not inside a
  stronger container owner

Plugin surface:

- no dedicated paragraph insert or toggle transform is required by this law
- paragraph creation uses the generic editor block path

- `EDIT-P-ENTER-001` `locked` `↵`

```text
abc|def
=>
abc
|def
```

- `EDIT-P-ENTER-MARKED-END-501` `proposed` `↵`: with a collapsed caret at the end of a paragraph whose final text is formatted, Enter creates the next empty paragraph and puts the collapsed caret at its start. The original paragraph keeps its text and formatting; its separate text leaves must not leave the caret behind. This rule does not choose which marks subsequent typing inherits.

```text
plain **marked|**
=>
plain **marked**
|
```

Classification: invariant, by the tests in docs/vision/plate.md:150-160; the split must leave a usable caret in the new paragraph
Authority: syntax: CommonMark; primary UX ref: Typora; secondary ref: Milkdown; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-05-07-plite-core-caret-movement-word-insert-break-ralplan.md:19-20
Proof: packages/plitejs/test/snapshot-contract.ts, 'insertBreak after marked text moves selection into the new block', asserts the unchanged plain and bold leaves, an empty following paragraph and both caret endpoints at its start. packages/plitejs/src/editor/insert-break.ts performs the split and preserves applicable typing marks on the caret. Raw Plite model proof only; no Plate browser keypress was rerun.

- `EDIT-P-ENTER-EMPTY-001` `locked` `↵`

```text
|
```

note: keep generic root split behavior

- `EDIT-P-SOFT-BREAK-401` `proposed` `Shift+Enter`: at a collapsed caret in ordinary paragraph text, Shift+Enter inserts one newline character in the same paragraph and advances the caret past it. It does not split the paragraph. A stronger feature owner may claim the gesture first.

```text
paragraph: abc|def
=>
paragraph: abc\n|def
```

Classification: invariant, by the tests in docs/vision/plate.md:150-160; the ordinary soft-break input must preserve its distinction from a paragraph split
Authority: syntax: CommonMark paragraph text; primary UX ref: Typora; secondary ref: Milkdown; inherited family references, with no reference editor checked for this case
Source: c70bacbd4a:docs/plans/2026-07-05-plite-soft-break-newline-semantics.md:19-23
Proof: packages/plitejs/test/snapshot-contract.ts, 'insertSoftBreak inserts a newline through its own command', asserts newline insertion into an existing paragraph and both caret endpoints after it. packages/plitejs/src/dom/utils/hotkeys.ts maps Shift+Enter to soft break, and packages/plitejs/src/editor/insert-soft-break.ts inserts the newline. Raw Plite model proof; the test does not press the physical shortcut.

- `EDIT-P-SOFTBREAK-LINE-001` `proposed` `consecutive soft breaks, a trailing soft break, then click and type`: each soft break leaves its own editable paragraph line, including an empty intervening line and the final trailing line. Clicking either line places the caret at its corresponding model offset; typing inserts there. Rendering support characters never become document text, and the soft breaks do not create separate paragraph blocks.

```text
one paragraph: alpha\n\nbeta\n
click the empty line, then type middle
=>
one paragraph: alpha\nmiddle|\nbeta\n
click the trailing line, then type tail
=>
one paragraph: alpha\nmiddle\nbeta\ntail|
```

Classification: invariant, by the tests in docs/vision/plate.md:151-160; every retained soft-break line must remain editable without introducing document text for rendering support.
Authority: syntax: CommonMark paragraph text; primary UX ref: Typora; secondary ref: Milkdown. These inherit the Paragraph family's references; no reference editor was checked for this case.
Source: docs/plans/2026-09-02-wordgard-diff-proof-closure.md:126-138
Proof: `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts`, "keeps consecutive soft-break lines and a trailing break clickable", types alpha, two Shift+Enter breaks, beta and a final break; clicks the empty and trailing lines; and asserts exact model text and caret offsets after inserting middle and tail. It skips mobile. `packages/plitejs/src/react/components/editable-text.tsx` marks the final newline segment as trailing, and `packages/plitejs/src/react/components/text-string.tsx` appends a rendering newline while declaring the logical text length; `packages/plitejs/src/dom/plugin/dom-editor.ts` uses that declared length when resolving model points. This is Plite example proof, not Plate product or physical-device proof. Test read, not run.

- `EDIT-P-BS-START-001` `locked` `⌫`

```text
alpha
|beta
=>
alpha|beta
```

note: when merge is valid; otherwise generic fallback

- `EDIT-P-BS-START-FIRST-401` `proposed` `⌫`: with a collapsed caret at the start of a top-level paragraph that has no previous block, empty or not, nothing changes and the caret stays at the paragraph start

```text
|alpha
beta
=>
|alpha
beta
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: CommonMark; primary UX ref: Typora; secondary ref: Milkdown
Source: c70bacbd4a7523ae3ebfd820cec0ea8ec228e9ad:docs/editor-behavior/markdown-parity-matrix.md:82
Proof: no Plate test runs it. For an empty first paragraph, Plite proves it: `packages/plitejs/test/delete-contract.ts:1444` "keeps Backspace at the start of leading empty paragraphs as a no-op", run by `packages/plitejs/test/runtime-contracts.test.ts`, runs `tx.text.deleteBackward()` in the first of two empty paragraphs before `text` and asserts the children and the caret unchanged, a tag candidate at Plite core level, and `apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts:1209` "keeps Backspace in an empty first block from deleting it" presses Backspace in an empty first block before `second` on Plite's plaintext example and asserts the block texts and the caret. For a non-empty one, `packages/platejs/src/lib/plugins/override/OverridePlugin.spec.tsx:237` "leaves document-start deletion inside nested blocks to their owner" covers only a paragraph nested in a wrapper, and `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:5966` "keeps the first heading unchanged on Backspace at the start" covers a heading. Model probes on 2026-10-08 (Bun, package source) ran `deleteBackward` on Plate's `createEditor` at the start of the first of two paragraphs, of a lone paragraph, of a lone empty paragraph, of an empty paragraph before `beta` and of the first of two empty paragraphs before `text`, and left the value and caret unchanged each time, while the same call after an empty or a non-empty paragraph changed the value, so the shipped code agrees. This states the document-start case of the fallback that `EDIT-P-BS-START-001`'s note leaves unstated; a paragraph after an empty one follows `EDIT-P-BS-START-AFTER-EMPTY-001`. Checked 2026-10-08.

- `EDIT-P-BS-START-AFTER-EMPTY-001` `proposed` `⌫`: with a collapsed caret at the start of a top-level paragraph whose previous sibling is an empty paragraph, only that empty paragraph is removed; the current paragraph keeps its text and the caret stays at its start, and every empty paragraph before the removed one stays. When the previous paragraph holds only whitespace, `⌫` merges into it as `EDIT-P-BS-START-001` says, and the empty paragraphs before that one still stay

```text
(empty paragraph)
(empty paragraph)
|text
=>
(empty paragraph)
|text
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: CommonMark; primary UX ref: Typora; secondary ref: Milkdown
Source: c70bacbd4a7523ae3ebfd820cec0ea8ec228e9ad:docs/solutions/developer-experience/2026-05-21-plite-layout-source-entry-and-paged-editable-dx.md:17-19, :417-426, :458-462
Proof: Plite core's `getPreviousEmptyBlockPathAtBlockStart` (`packages/plitejs/src/transforms-text/delete-text-collapsed-path-targets.ts:58-102`), which a one-character backward delete calls (`packages/plitejs/src/transforms-text/delete-text.ts:308-320`), path-deletes the previous empty, non-void, editable top-level block. In `packages/plitejs/test/delete-contract.ts`, run by `packages/plitejs/test/runtime-contracts.test.ts`, "removes one preceding empty paragraph at a time on Backspace" (:1403) and "keeps earlier empty paragraphs when Backspace merges after a space block" (:1472) assert both clauses, with the caret, through `tx.text.deleteBackward()` on a raw Plite editor; they are tag candidates. A scratch probe on 2026-10-08 ran `deleteBackward` from `packages/platejs/src/testing` on Plate's `createEditor` with `BaseBlockquotePlugin` and `BaseHeadingPlugin`, loading package source: three empty paragraphs then `text`, with the caret at the start of `text`, left two empty paragraphs and `text` with the caret at `[2, 0]` offset 0, and two empty paragraphs, a ` ` paragraph and `text` left the two empty paragraphs and ` text` with the caret after the space, so the shipped code agrees. No browser row presses Enter, Space, Enter, Backspace, the native path the source note says programmatic coverage misses. The first-block case, empty or not, belongs to `EDIT-P-BS-START-FIRST-401`. Checked 2026-10-08.

- `EDIT-P-BS-START-EMPTY-001` `locked` `⌫`

```text
alpha
|
=>
alpha|
```

- `EDIT-P-DEL-EMPTY-001` `proposed` `⌦`: in an empty top-level paragraph whose next sibling is a list or blockquote, `⌦` removes the empty paragraph, keeps the following wrapper whole and puts the caret at the start of that wrapper's first text, instead of unwrapping the wrapper's first child to the top level

```text
|
> quoted
=>
> |quoted
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: CommonMark; primary UX ref: Typora; secondary ref: ProseMirror (#1309)
Source: c70bacbd4a:docs/editor-issue-harvester/prosemirror/full/checkpoints/issues-1292-1329.md:22
Proof: Plite core proves it for a nested list wrapper: `packages/plitejs/test/delete-contract.ts:983` "preserves following list and block quote wrappers on Delete from an empty paragraph", run by `packages/plitejs/test/runtime-contracts.test.ts`, asserts the wrappers unchanged and the caret at the start of their first text; its block-quote case is a text block, not a wrapper. No Plate test covers it; a model probe on 2026-10-08 (Bun, package source, happy-dom) pressed `deleteForward` in an empty paragraph before a flat list item and before a blockquote holding two paragraphs, and both kept the following block whole with the caret at its first text's start. Checked 2026-10-08.

- `EDIT-P-TAB-001` `locked` `⇥`

```text
|alpha
=>
  |alpha
```

- `EDIT-P-STAB-001` `locked` `⇤`

```text
indented |alpha
=>
|alpha
```

- `EDIT-P-SPACE-WRAP-001` `proposed` `type ordinary spaces between paragraph words`: the paragraph preserves every typed space and wraps a long space run within the editor's available width without horizontal overflow. The spaces remain paragraph text, and the caret advances through them in typing order. Code-block whitespace follows its own owner.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; ordinary prose input must remain preserved and usable within its wrapping surface
Authority: syntax: CommonMark paragraph text; primary UX ref: Typora; secondary ref: Milkdown; inherited family references, with no reference editor checked for this case
Source: c70bacbd4a:docs/plans/4637-fix-editor-space-wrapping.md:211-214
Proof: apps/www/src/registry/components/editor/editor.spec.tsx checks whitespace-break-spaces classes on mocked editable, view and static surfaces. It measures neither wrapping nor retained spaces or caret movement. apps/www/src/registry/components/editor/editor.tsx and apps/www/src/registry/components/editor/editor-static.tsx apply that CSS mode; the editable also disables default inline styles. No inspected current browser test proves the long-space-run geometry.

## Heading

Authority:

- syntax: CommonMark heading syntax
- primary UX ref: Typora
- secondary ref: Milkdown

Ownership:

- heading owns split and start-delete while the caret is inside the heading
- heading yields back to generic paragraph behavior after reset

Plugin surface:

- heading plugins expose block toggles for heading levels
- this section defines post-creation editing law, not heading creation UI

- `EDIT-H-ENTER-001` `locked` `↵`

```text
# abc|def
=>
# abc
|def
```

- `EDIT-H-ENTER-END-001` `locked` `↵`

```text
# Heading|
=>
# Heading
|
```

- `EDIT-H-ENTER-START-001` `proposed` `↵`: with a collapsed caret at the start of a non-empty heading, `↵` inserts an empty paragraph above the heading and leaves the caret at the start of the heading, which keeps its type, level and text

```text
# |Heading
=>
(empty paragraph)
# |Heading
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: CommonMark heading syntax; primary UX ref: Typora; secondary ref: Lexical's `TextEntry.spec.mjs`
Source: c70bacbd4a:docs/editor-test-harvester/lexical/plite-processing-ledger.md:770
Proof: no Plate heading test runs it. The Plate path: headings declare `break.splitReset` (`packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts:25`), which resets the empty block above when the split starts at the block start (`packages/platejs/src/internal/plugin/OverridePlugin.ts:189-203`), and `packages/platejs/src/lib/plugins/override/OverridePlugin.spec.tsx:273` "resets the empty block inserted at the start of a splitReset block" runs it on a callout stand-in and asserts no caret. A model probe on 2026-10-08 with `BaseHeadingPlugin` (Bun, package source) gave an empty paragraph, then the level-1 heading `Heading`, with the caret at offset 0 of `[1, 0]`. In a browser, only Plite's markdown-shortcuts example proves it, under its own Enter policy rather than Plate's plugin: `apps/plite/tests/plite-browser/donor/examples/markdown-shortcuts.test.ts:479` "inserts a paragraph before a heading from the heading start" asserts block texts `['', 'Heading']` and the caret at offset 0 of `[1, 0]`. Checked 2026-10-08.

- `EDIT-H-BS-START-001` `locked` `⌫`

```text
# |Heading
=>
|Heading
```

- `EDIT-H-BS-START-EMPTY-001` `locked` `⌫`

```text
# |
=>
|
```

note: `⌫` on an expanded selection inside one heading deletes the selection in place and keeps the heading type

## List

Authority:

- syntax: CommonMark for ordered and unordered lists
- syntax extension: GFM for task-list checkboxes
- primary UX ref: Typora
- secondary ref: Milkdown

Ownership:

- list is the strongest current structural owner
- list owns `↵`, `⌫`, `⇥`, and `⇤` before blockquote or generic paragraph
- nested list items change one list depth per keypress
- an item's family is the item and the blocks after it that sit deeper, up to the next block at its depth or shallower, such as its nested items and continuation paragraphs
- `⇥`, `⇤`, outdent, drag and cut move the family together, and `↵` or `⌫` that takes a root item out of its list lifts its family one level

Plugin surface:

- list creation and toggling belong to the list plugins and surrounding editor
  UI
- this section defines how existing list items behave under structural keys

List is the cleanest current structural seam. Other containers should behave
this predictably.

- `EDIT-LIST-ENTER-001` `locked` `↵`

```text
- abc|def
=>
- abc
- |def
```

- `EDIT-LIST-START-ENTER-402` `proposed` `↵`: with a collapsed caret inside a non-empty ordered list item that carries an explicit start or restart number, the item splits, the first half keeps that number, and the new item carries none, continues the sequence and takes the caret at its start

```text
7. One|Two
=>
7. One
8. |Two
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: CommonMark; primary UX ref: Typora; secondary ref: Milkdown
Source: c70bacbd4a7523ae3ebfd820cec0ea8ec228e9ad:docs/editor-behavior/markdown-parity-matrix.md:86
Proof: `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx:469` "clears an explicit start from the sibling created by a split" runs `break.insert` at offset 3 of `OneTwo` with `listStart: 7` and asserts `listStart: 7` on the first item, none on the second and ordinal 8, without the split text or the caret; `:494` "drops an explicit start for direct node splits" and `:515` "drops a forced restart from split siblings" split with `nodes.split`, not `↵`. A model probe on 2026-10-08 (Bun, package source) ran `↵` on a `listRestart: 4` item and on a `listStart: 7` item and got ordinals 4 and 5, and 7 and 8, with the caret at offset 0 of `[1, 0]` both times. Tag candidate for the `listStart` structure; the caret and the restart case have no test. Code: the schema drops `listStart` and `listRestart` from the new item on any split, `↵` included (`packages/platejs/src/features/list/lib/BaseListPlugin.ts:359-380`). Checked 2026-10-10.

- `EDIT-LIST-ID-403` `proposed` `⌫`, `↵`, `⇤` and toggling a list off: taking an item out of a numbered list leaves one list, so the items after it count on from the item before it

```text
1. One
2. |Two
3. Three
=> ⌫
1. One
|Two
2. Three
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: list identity: Word and Google Docs, where a list continues past a paragraph between its items; syntax: CommonMark, whose list ends at the paragraph, so serialize starts the next ordered list at its shown number
Deviation: Markdown has no list identity, so a paragraph between items splits the source list in two. Plate keeps the item's list and numbers past the paragraph, as Word and Google Docs do. That is the stronger mainstream precedent for a numbered document, and it was the owner's direction on 2026-10-10.
Proof: `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx:825` "keeps the next items counting after %s takes an item out" takes the middle item out by `deleteBackward` at its start, `break.insert` on it while empty, `list.outdent` and `list.toggle`, and asserts the numbers 1, none, 2. Checked 2026-10-10.

- `EDIT-LIST-ENTER-EMPTY-001` `locked` `↵`

```text
  - |
=>
- |
```

- `EDIT-LIST-ENTER-EMPTY-ROOT-001` `locked` `↵`

```text
- |
=>
|
```

- `EDIT-LIST-BS-START-001` `locked` `⌫`

```text
- |Item
=>
|Item
```

- `EDIT-LIST-BS-START-EMPTY-001` `locked` `⌫`

```text
  - |
=>
- |
```

- `EDIT-LIST-BS-START-EMPTY-ROOT-001` `locked` `⌫`

```text
- |
=>
|
```

- `EDIT-LIST-TAB-001` `locked` `⇥`

```text
- |Item
=>
  - |Item
```

- `EDIT-LIST-STAB-001` `locked` `⇤`

```text
  - |Item
=>
- |Item
```

- `EDIT-LIST-TAB-002` `proposed` `⇥`: an item moves one level deeper with its family, and a selected item inside a selected item's family moves once

```text
- A
- |B
  Continuation
  - C
=>
- A
  - |B
    Continuation
    - C
```

Proof: `packages/platejs/src/react/features/list/ListPlugin.spec.tsx` "nests an item with its continuation blocks on Tab" and "moves a selected child of a selected item once".

- `EDIT-LIST-STAB-002` `proposed` `⇤`: an item moves one level out with its family

```text
- A
  - |B
    Continuation
=>
- A
- |B
  Continuation
```

Proof: `packages/platejs/src/react/features/list/ListPlugin.spec.tsx` "outdents an item with its continuation blocks on Shift+Tab".

- `EDIT-LIST-FAMILY-LIFT-001` `proposed` `↵` and `⌫`: when `↵` in an empty root item or `⌫` at a root item's start takes the item out of its list, its family moves up one level with it

```text
- |Item
  Body
=>
|Item
Body
```

Proof: `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx` "takes a root item out of the list with its body on %s".

- `EDIT-LIST-MOVE-001` `proposed` drag, copy and cut: moving, copying or cutting an item takes its family, and a moved item lands after the blocks deeper than itself that follow the drop point, so it never takes another item's nested blocks as its own

Proof: `packages/platejs/src/react/features/list/ListPlugin.spec.tsx` "moves an item with its continuation blocks" moves the blocks `editor.read.transfer.nodes()` returns, which the registry's drag handle and block-menu Cut read.

- `EDIT-LIST-DROP-001` `proposed` `text move, block copy or block move of list items`: moved list items keep their own list and its level rules, unless the first moved list joins the drop item's list, which needs the same kind and heading role. So a move inside a list that Word continues past a paragraph keeps its numbering. A block drag that copies keeps each item's depth, and at most one copied list joins a list beside the drop edge. It tries the item before the edge at the copy's top level, then the item after it when the copy ends in a list item and that item does not restart, then the shallower item the copy lands under. A join beside an item needs the kind and heading role of the copied item at the copy's top level nearest that edge. A joined copy's first item drops its copied start and restart, so the list keeps counting. A copied list that sets a start or a restart on any item after its first never joins. Every other copied list starts its own list and keeps its starts. A block move, by drag or keyboard step, joins a list beside its edge by the same search, which skips the moving blocks, and a joined moved list takes what a joined copy takes. A move that lands beside an item of its own list in the same root changes nothing, and a moved list that joins no list keeps its id and its starts.

```text
1. A
para
2. B
3. C
4. D
drag the text from the start of C to the end of D onto the end of "para"
=>
1. A
paraC
2. D
3. B
```

Classification: invariant, by the tests in docs/vision/plate.md's Plugin and component doctrine
Authority: primary UX ref: Word and Google Docs list numbering, not run; secondary ref: ProseMirror and Lexical, read in source, where a dropped item joins the list it lands in or starts one
Source: docs/plans/2026-10-15-list-drag-landing.md List's landing rules and Defaults; docs/plans/2026-10-15-list-move-landing.md List's rule for moves
Proof: the tagged "BaseListPlugin text moves" and "BaseListPlugin block transfers" cases in `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx`, where "walks only the deeper run beside the gap for a block %s, with 10 or 300 other list items" and "walks nothing after the gap for a block copy that joins the list before it" bound the join's work. The "list drop" text move, handle copy and handle move cases and "list keys: a keyboard move into another list joins it" in `apps/www/tests/browser/list-keys.spec.ts` drive Chromium on `/blocks/list-demo` and assert rendered numbers; the text move dispatches DOM drag events, the handle cases drag with Playwright's mouse, the copy with the copy modifier, and the keyboard case presses `Mod+Shift+ArrowDown`. A step back out of a list right next to its own stays in the list it joined, since the gap's neighbors cannot tell where it came from. Checked 2026-10-15.

- `EDIT-LIST-START-MD-401` `proposed` `Markdown parse and serialize`: an ordered list keeps its explicit start number, including `0` and the start of a list that follows an interrupting paragraph, through parse, value replacement and serialize. Parse gives each list its own new `listId` and a start other than 1 as `listStart`, so separate Markdown lists never count as one, even after `⌫` or a move at a list's first item, a raw insert, a paste or a move into another editor. Serialize writes a Markdown list from 1 and reports it when its numbers would go negative or pass the nine digits CommonMark reads. A list in a table cell, which serialize writes as HTML, keeps its start. Serialize also reports a forced restart or list membership that Markdown cannot carry

```text
1. First list item

Break between lists.

2. Second list item
3. Third list item
=>
the same markdown after parse, value replacement and serialize
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: CommonMark ordered-list start numbers; primary UX ref: Typora; secondary ref: Milkdown
Source: c70bacbd4a7523ae3ebfd820cec0ea8ec228e9ad:docs/editor-behavior/markdown-parity-matrix.md:86 and :225
Proof: `packages/platejs/src/markdown/lib/deserializer/deserializeMdList.spec.tsx:16` "preserves ordered-list starts after setValue normalizes the value" parses the scenario and asserts `listRestart: 2` on `Second list item` before and after `value.replace`; `:84` "preserves an ordered list that starts at zero" asserts `listRestart: 0` and serializes exactly `0. Zero` and `1. One`; and `packages/platejs/src/markdown/lib/serializer/standardList.spec.ts:272` "serialize restarted ordered lists separated by a paragraph" writes the parsed shape back to the scenario's markdown. Together they prove the rule, though no single test runs parse, replacement and serialize; tag candidates. Checked 2026-10-08; the parse shape moved from `listStart` to `listRestart` on 2026-10-10, because parsed lists carry no list id.

## Task List

Task list follows the same owner rules as normal lists plus checked-state
preservation.

Authority:

- syntax: GFM task-list syntax
- primary UX ref: Typora
- secondary ref: Milkdown

Plugin surface:

- task-list behavior currently rides on the list owner plus the todo metadata
- no separate footnote-style insert surface is implied here

- `EDIT-TASK-ENTER-001` `locked`

```text
- [x] done|
=>
- [x] done
- [x] |
```

note: preserve todo formatting and checked-state on continuation

- `EDIT-TASK-*` `locked`

```text
- [ ] todo
```

note: markdown round-trip preserves checked and unchecked task-list state

## Blockquote

Authority:

- syntax: CommonMark blockquote syntax
- primary UX ref: Typora
- secondary ref: Milkdown

Ownership:

- blockquote is a real container, not a flat text block
- blockquote owns one-level structural exit after stronger local owners yield
- quoted lists still let list own the first step and quote own the second

Editor surface:

- use `editor.update.blockquote.toggle()` to wrap or unwrap selected blocks
- this section defines editing behavior after quoted structure already exists

Blockquote is a real container, not a flat text block.

- `EDIT-BQ-ENTER-001` `locked` `↵`

```text
> abc|def
=>
> abc
> |def
```

note: in a nested quote, the split keeps both blocks inside the same inner quote

- `EDIT-BQ-ENTER-EMPTY-001` `locked` `↵`

```text
> |
=>
|
```

- `EDIT-BQ-ENTER-EMPTY-NESTED-001` `locked` `↵`

```text
>> |
=>
> |
```

- `EDIT-BQ-BS-START-001` `locked` `⌫`

```text
> |Item
=>
|Item
```

- `EDIT-BQ-BS-START-EMPTY-NONFIRST-001` `locked` `⌫`

```text
> Lead
> |
=>
> Lead|
```

- `EDIT-BQ-BS-START-ONLY-001` `locked` `⌫`

```text
> |
> Tail
=>
|
> Tail
```

- `EDIT-BQ-STAB-001` `locked` `⇤`

```text
> |Item
=>
|Item
```

note: an indented quoted paragraph loses its indent before `⇤` lifts it out of the quote

- `EDIT-BQ-TAB-001` `locked` `⇥`

```text
> |Item
=>
> indented |Item
```

- `EDIT-BQ-PASTE-EMPTY-001` `proposed` `paste of several paragraphs`: with a collapsed caret in an empty quoted paragraph, pasting two or more copied paragraphs keeps every pasted paragraph inside that quote, in order and in the empty paragraph's place among any other quoted blocks, and leaves the caret at the end of the last one

```text
copy two paragraphs, a and b
paste into an empty quoted paragraph: > |
=>
> a
> b|
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: CommonMark blockquote syntax; primary UX ref: Typora; secondary ref: Milkdown
Source: c70bacbd4a7523ae3ebfd820cec0ea8ec228e9ad:docs/solutions/logic-errors/2026-05-09-empty-target-fragment-paste-keeps-first-block-wrapper.md:20-34
Proof: no test pins it. A scratch probe on 2026-10-08 (Bun, package source, happy-dom) copied paragraphs `a` and `b` with Plate's own clipboard writer and pasted them through `insertData` into a lone empty quoted paragraph between `x` and `y`, into an empty quoted paragraph after a quoted `lead`, and into one between `lead` and `tail`; each time both landed inside the quote in that place and order, with the caret at the end of `b`. External HTML `<p>a</p><p>b</p>` and plain text `a`, newline, `b` landed the same way, the same paste into an empty top-level paragraph stayed at the top level, and an earlier probe that replaced the selection through `tx.fragment.replace` and through an open `ContentSlice` (`openStart: 1`, `openEnd: 1`) gave the same quote, so the shipped code agrees. The empty-target cases in `packages/plitejs/test/clipboard-contract.ts` (:1373, :1420) paste into an empty paragraph, where the copied block types win, and none pastes into a quoted paragraph; the Plite example test `apps/plite/tests/plite-browser/donor/examples/markdown-shortcuts.test.ts:59` "keeps pasted text inside an empty markdown quote" pastes one line, not several paragraphs, and no Plate browser paste row covers it. The source note's fix kept only the first pasted paragraph in the quote and put the rest after it, as the Lexical row it ported does (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:825`); that shape follows from a quote that holds text rather than blocks, while this section makes the quote a real container, and Plite no longer has the function that produced it. Typora, the section's primary reference, was not checked. Checked 2026-10-08.

### Quote + List Interaction

- `EDIT-BQ-LIST-ENTER-EMPTY-001` `locked` `↵`

```text
> - |
=>
> |

↵ again
=>
|
```

- `EDIT-BQ-LIST-BS-START-001` `locked` `⌫`

```text
> - |Item
=>
> |Item

⌫ again
=>
|Item
```

- `EDIT-BQ-LIST-STAB-001` `locked` `⇤`

```text
>   - |Item
=>
> - |Item

⇤ again
=>
|Item
```

## Code Block

Authority:

- syntax: CommonMark fenced code blocks
- primary UX ref: Typora
- secondary ref: Milkdown

Ownership:

- code block is a strong local owner
- code block owns `↵`, `⌫`, `⇥`, `⇤`, and local selection expansion before
  generic paragraph fallback
- code editing stays line-local until the block is actually empty

Plugin surface:

- code-block plugins expose code-block creation and rendering surfaces;
  optional JSON prettifying belongs to the copied UI action
- this section defines editor behavior once the caret is already inside the code
  block

Code block is a strong local owner.

- `EDIT-CB-ENTER-001` `locked` `↵`

````text
```ts
  foo|
```
=>
```ts
  foo
  |
```
````

note: markdown round trip keeps the code fence language

note: `↵` on an expanded selection inside one code line replaces the selection with a code-local line split

- `EDIT-CB-BS-START-001` `locked` `⌫`

````text
```ts
|foo
```
=>
stay in code-editor behavior, do not structurally exit
````

- `EDIT-CB-BS-START-EMPTY-LINE-001` `locked` `⌫`

````text
```ts
foo
|
bar
```
=>
```ts
foo|
bar
```
````

- `EDIT-CB-BS-START-EMPTY-001` `locked` `⌫`

````text
```ts
|
```
=>
|
````

- `EDIT-CB-TAB-001` `locked` `⇥`

````text
```ts
[[foo
bar]]
```
=>
```ts
[[  foo
  bar]]
```
````

- `EDIT-CB-STAB-001` `locked` `⇤`

````text
```ts
[[  foo
  bar]]
```
=>
```ts
[[foo
bar]]
```
````

For `⇥` and `⇤`, an expanded selection ending exactly at the next physical
line start excludes that untouched line in either selection direction.

note: the first `⌘+A` inside a code block selects the whole code block

- `EDIT-CB-BLOCK-SELECTION-001` `proposed`: Code on a block selection turns each run of adjacent selected blocks into one code block, one line per block, and leaves the blocks between runs as they were. The block selection then holds the new code blocks. When any run cannot become a code block where it sits, Code changes nothing. Proof: `packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.spec.tsx` "codes each run of a sparse block selection and leaves the blocks between them", "codes a sparse block selection around a code block it does not hold" and "codes no run of a block selection when one run cannot become code".

- `EDIT-CB-SELECT-ALL-ESCALATE-001` `proposed` `Mod+A`: inside a code block, the first press selects the block's complete text. When that complete text is already selected, the code-block handler yields to document-wide Select All instead of selecting the block again. Neither press changes content.

Classification: substitutable capability, by the tests in docs/vision/plate.md:150-160; without code-local selection expansion, ordinary document Select All remains a complete fallback
Authority: syntax: CommonMark fenced code blocks; primary UX ref: Typora; secondary ref: Milkdown; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-07-09-plate-next-code-block-drift-closure.md:370
Proof: packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.spec.tsx, 'expands the selection to the whole code block', asserts both selection endpoints; 'falls through after the whole code block is selected' asserts Mod+A registration, a false handler result and unchanged selection. packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts implements that fallthrough. This is model proof of local expansion and delegation, not proof of the second physical keypress or its document-wide result.

## Math Block

Authority:

- syntax: LaTeX-style math delimiters as adopted through `remark-math`
- primary UX ref: Typora
- secondary ref: Milkdown

Ownership:

- math block should behave closer to code than paragraph
- insertion is locked

Plugin surface:

- math plugins expose insert transforms

Math block should behave closer to code than paragraph.

- `EDIT-MATH-ENTER-001` `locked` `↵`

```text
$$
|x = 1
$$
```

note: preserve math-editing intent; avoid generic paragraph split

- `EDIT-MATH-BS-START-001` `locked` `⌫`

```text
$$
|x = 1
$$
```

note: stay inside math editing as a local math-owner rule

- `EDIT-MATH-BS-START-EMPTY-001` `locked` `⌫`

```text
$$
|
$$
=>
|
```

- `EDIT-MATH-TAB-001` `locked` `⇥`

```text
$$
|x = 1
$$
```

note: keep tab owned by math editing unless a stronger math-specific surface overrides it

- `EDIT-MATH-INLINE-INSERT-001` `locked`: inserting an inline equation inserts an inline void equation and uses the selected text as its default expression

- `EDIT-MATH-INLINE-ARROW-001` `locked`: `ArrowLeft` and `ArrowRight` at the edges of an inline equation's input hand control back to the editor

- `EDIT-MATH-INLINE-OPEN-001` `proposed` `one primary click on an inline equation from outside editor focus`: the first click opens the equation editor and focuses its textarea without changing the stored expression merely by opening. Editing, closing and one-click reopening remain usable. The same change must preserve the block equation's existing one-click opening behavior.

Classification: invariant within equation editing, by the tests in docs/vision/plate.md:151-160
Authority: syntax: LaTeX-style math delimiters adopted through remark-math; primary UX ref: Typora; secondary ref: Milkdown. These inherit the Math Block family's authority; no reference editor was checked for this click case.
Source: docs/plans/2026-08-29-date-calendar-single-click-regression.md:416
Proof: `apps/www/tests/browser/inline-void-first-click.spec.ts` "inline equation opens from the first focus-owning click" starts outside editor focus, verifies physical pointerdown and mousedown, opens with one click, asserts textarea focus, edits and commits, then reopens with one click and reads the edited expression. "block equation remains a one-click control" checks the block case still opens. The inline test does not compare the document immediately before and after opening. `apps/www/src/registry/components/editor/math.tsx` opens local popover state on click, focuses the textarea after opening, and writes latex only when a changed draft commits. These are Plate browser proof owners, read and not run; no device claim is established.

- `EDIT-MATH-INLINE-EXIT-001` `proposed` `ArrowLeft at the start of an inline equation's input`: with a collapsed input caret at offset zero and no composition active, close the popover, focus the editor and place its collapsed caret immediately before the inline equation. Popover focus restoration must preserve that landing point. Leaving the input does not delete or relocate the equation.

```text
before [inline equation x; input caret |x] after
ArrowLeft
=>
before |[inline equation x] after
popover closed; editor focused
```

Classification: invariant within inline-equation edge navigation, by the tests in docs/vision/plate.md:151-160; leaving through the left edge must produce the corresponding usable editor position.
Authority: syntax: LaTeX-style math delimiters as adopted through remark-math; primary UX ref: Typora; secondary ref: Milkdown. These inherit the Math Block family's references; no reference editor was checked for this exact landing.
Source: c70bacbd4a:docs/plans/5071-fix-inline-equation-arrowleft-dismissal.md:28-30
Proof: `apps/www/src/registry/components/editor/math.tsx` checks both input endpoints are zero, calls close(true, 'before'), selects the point before the equation, focuses the editor and prevents the inline popover's final-focus restoration. Its composition guard yields before edge handling. The inspected `apps/www/src/registry/components/editor/math.spec.tsx` and `apps/www/src/registry/components/editor/math.lifecycle.spec.tsx` cover dismissal, draft lifecycle and composition submission, but neither presses ArrowLeft or asserts the before-equation landing. No inspected current test proves this complete gesture; support is source inspection only, and no test was run.

- `EDIT-MATH-BLOCK-INSERT-001` `locked`: inserting an equation inserts a void block equation at the requested path

- `EDIT-MATH-BLOCK-BS-START-001` `locked` `⌫`: at the start of the block after a block equation, the selection moves onto the equation instead of deleting through it

- `EDIT-MATH-SELECTION-LAYOUT-001` `proposed` `select a block equation or close its equation editor`: the copied block-equation surface keeps the equation in normal full-row flow, with the formula horizontally centered at its natural size and the following block's normal spacing preserved. Selection must not compress the formula or create an extra caret row inside the block atom.

Classification: product policy, by the tests in docs/vision/plate.md:150-160; full-row centered presentation belongs to this copied editor surface rather than every possible math renderer
Authority: syntax: LaTeX-style math delimiters as adopted through remark-math; primary UX ref: Typora; secondary ref: Milkdown; inherited family references, with no reference editor checked for this layout
Source: docs/plans/2026-08-29-block-void-layout-regression-attempt-3.md:49-64
Proof: apps/www/tests/browser/block-void-caret.spec.ts, 'block-void:native-caret-not-painted-below-void', asserts full-row button width, button centering and formula size before and after opening the equation editor and clicking Done; it also checks that the selection anchor is outside the equation. It does not directly measure the following block's spacing or the formula's center. apps/www/src/registry/components/editor/math.tsx uses a full-width centered flex button. The browser test was read, not rerun.

## Table

Authority:

- GFM for syntax
- Google Docs for table feel
- Notion and Milkdown as secondary checks

Ownership:

- table owns navigation, selection, and structure inside the grid
- cell behavior beats generic paragraph behavior while the caret is inside a
  cell
- structural commands must preserve grid integrity instead of leaking into
  generic block editing

Plugin surface:

- table plugins expose insert, delete, merge, split, and selection transforms
- this section defines the readable family law, not every multi-cell
  permutation

Table owns navigation, selection, and structure inside the grid.

### Cell Content Policy

- `EDIT-TABLE-*` `locked`

```text
cell with paragraphs and list paragraphs
=>
markdown cell: Intro<ul><li><input type="checkbox" checked disabled /> ship</li></ul><ol start="3"><li>step</li></ol>
```

note: a GFM row is one line of inline content, so the serializer writes a
cell's blocks inline on that line, in content order, and never changes a
cell's column
note: the serializer writes list paragraphs as inline `<ul>`, `<ol start="n">`
and `<li>` HTML, with a disabled checkbox leading each task item; the parser
reads them back as list paragraphs when the editor has the List plugin, and
without it they stay literal text
note: the serializer joins other paragraphs with `<br/>` and reports that
boundary as a lossy warning, because the parser returns one paragraph with
inline breaks and cannot tell a paragraph boundary from a line break
note: a heading or quote keeps its inline content and a code or math block
keeps its text, each with a lossy warning; childless registered block tags,
including an image with width, remain tags on the cell line and read back as
blocks; the serializer drops other unsupported blocks, such as a horizontal
rule or a captioned image, and reports it under the loss policy
note: the serializer writes a merged cell in its first slot and empty cells in
the slots it covers, and reports its span as an omitted property
note: the parser keeps images as image blocks when it reads a cell back

### Cell Navigation

- `EDIT-TABLE-TAB-001` `locked` `⇥`

```text
| A | B |
| - | - |
| x| | y |
=>
| A | B |
| - | - |
| x | |y |
```

- `EDIT-TABLE-STAB-001` `locked` `⇤`

```text
| A | B |
| - | - |
| x | |y |
=>
| A | B |
| - | - |
| x| | y |
```

- `EDIT-TABLE-ENTER-001` `locked` `↵`

```text
| A |
| - |
| x| |
```

note: split inside the same cell unless a stronger owner intercepts

- `EDIT-TABLE-BS-START-001` `locked` `⌫`

```text
| A |
| - |
| |x |
```

note: stay inside the cell; no accidental table escape

- `EDIT-TABLE-ARROWDOWN-MULTIBLOCK-001` `locked` `↓`: from the last visual line of a cell, the caret moves to the cell below

- `EDIT-TABLE-ARROWUP-MULTIBLOCK-001` `locked` `↑`: from the first visual line of a cell, the caret moves to the cell above

note: `⌫` at the start of the block after a table moves the selection toward the table instead of deleting through a cell boundary

### Selection And Structure

- `EDIT-TABLE-*` `locked`

```text
⌘+A inside a cell
=>
select table

⌘+A again
=>
select document
```

note: table selection escalates from cell to table to document

note: `⇧+arrow` from a cell range extends the selection by whole cells

- `EDIT-TABLE-*` `locked`

```text
insert row / column
delete row / column
merge / split
```

note: row and column structure changes must preserve table shape instead of
corrupting merged cells

- `EDIT-TABLE-ROW-INSERT-001` `locked`: inserting a row after the current row adds a row of empty cells and moves the selection into it when requested

- `EDIT-TABLE-ROW-INSERT-002` `locked`: inserting a row before the current row adds a row of empty cells and moves the selection into it when requested

- `EDIT-TABLE-COL-INSERT-001` `locked`: inserting a column after the current column adds a column of empty cells and moves the selection into it when requested

- `EDIT-TABLE-COL-INSERT-002` `locked`: inserting a column before the current column adds a column of empty cells and moves the selection into it when requested

- `EDIT-TABLE-ROW-DELETE-001` `locked`: deleting the current row removes it and repairs row spans instead of corrupting a merged table

- `EDIT-TABLE-COL-DELETE-001` `locked`: deleting the current column removes it and repairs column spans instead of corrupting a merged table

- `EDIT-TABLE-*` `locked`

```text
copy selected cells
paste into selected cells
addMark / removeMark on selected cells
```

note: multi-cell operations stay table-scoped instead of degrading into generic
block selection behavior

note: copying a cell range puts those cells on the clipboard as a subtable

note: reading marks on a cell range returns only the marks every selected text node shares

note: deleting a cell-range selection clears the selected cells' contents and keeps the table shape

- `EDIT-TABLE-RANGE-EDGE-001` `proposed` `delete, type, Enter or paste over a range with one end outside a table`: the table keeps every row and cell. A cell the range covers whole keeps only its first block, emptied, when that block is an editable text block, and otherwise becomes one empty paragraph, as a cell that starts with an image, an atom or a read-only block does. A cell at the range's edge loses only the covered text. The part of the range outside the table is removed as a range of its own, so nothing joins into or out of a cell. A range that covers a table and reaches past one of its edges removes the table, and when it covers the whole document it leaves one empty paragraph, or one paragraph holding the typed text. A range that spans a table exactly keeps it and clears its cells. A read-only or atom table is removed or kept whole like any read-only block, and a read-only or atom cell keeps its content when the range crosses its edge. The caret, and any typed or pasted text, land at the range's start, in the first cell the range covers that can take text, or right after or right before what it removed, whichever comes first and can take text. A range that covers whole top-level blocks, such as a paragraph and the table after it, removes them as blocks, so the caret and typed text land at the start of the block after them. When nothing can take text, typing and paste refuse and change nothing. The range's edges never move into or out of a cell, and a merge after the removal stops at a cell's edge. A text move over such a range refuses instead of copying rows.

Classification: invariant, by the tests in docs/vision/plate.md:150-158, because a removal that drops a cell or joins outside text into one leaves an invalid grid
Authority: syntax: none, since GFM rows hold inline content only; primary UX ref: Google Docs for table feel; no reference editor was checked for a partial range. A partial range reaches removal from a mouse drag, whose selection import writes through `tx.selection.set` and skips Table's clamp (a drag from a paragraph into a cell, checked by hand in Chromium on `/docs/table`, 2026-10-19), from an explicit `at` target and from `tx.selection.set` inside a transaction, while `editor.update.selection.set` from a paragraph into a cell widens to the whole table; fallback: the Ownership rule above that structural commands preserve grid integrity
Source: docs/plans/2026-10-18-table-boundary-delete.md and docs/plans/2026-10-19-table-boundary-delete-repair.md
Proof: `packages/platejs/src/features/table/lib/BaseTablePlugin.delete.spec.tsx`, describe "ranges that cross a table edge": "keeps every row and cell when an explicit range runs from a paragraph into the first cell", "types over a transaction range from a cell into trailing text without joining the text into the cell" and "pastes over an explicit range from a paragraph into the first cell without removing the cell" assert the kept grid with only covered text gone and the typed or pasted text at the range start; "removes a document-leading table when select-all deletes everything" and "leaves two empty paragraphs when Enter replaces a select-all over a document-leading table" assert the emptied document. `packages/plitejs/test/grid-removal-contract.test.ts` proves the Plite rule on a schema-declared grid: a grid removed whole from its first point with the caret at the start, two grids each kept, a row-spanning edge cell cleared once, a node insert, Enter, node merge and paste that continue at the removal caret, a grid spanned exactly and kept with its cells cleared, a one-cell grid spanned exactly and kept, whole blocks that end at a grid's last point removed whole, a covered cell holding only a void, an atom or a read-only block cleared, a cleared cell keeping a required text property, a covered cell with no default child emptied, an untouched cell's blocks kept when the edge cell loses text across runs, typing over an explicit range that removes two grids whole, a merge that continues after a grid removed whole, a document of grids emptied to one paragraph, and a text move refused. The Plate delete spec's "into a table whose last row is covered by row spans" covers a delete and a paste over an explicit range and the selection widening there. The contract's describes "range removal next to a grid", "range removal in a grid whose last row is covered by row spans", "merges after a range removal next to a grid", "range removal next to cells that may hold nothing", "range removal from a container into a grid", "typing and pastes over a range that reaches a grid" and "range removal inside one block of a container" pin where written content lands, the refusal when no spot can take text, a merge stopping at a cell's edge, edges that stay in their cell, cleanup of only the blocks a delete emptied at its end, and reads of a grid whose last row holds no cells. The row-span describe also keeps the grid when `fragment.delete` with an explicit `at` or the `text.insert` command runs from a paragraph to the grid's last text, the childless-cells describe removes a grid of childless cells that lies between a range end and the grid it plans, and "whole-document typing over a leading block" changes nothing when the typed text has nowhere to go. Known gap: a range that also reaches a read-only or atom table takes the ordinary removal for every table it reaches, so an editable table among them can lose cells. `fragment.delete` with an explicit `at` still removes a table the range spans exactly, and the `text.insert` command replaces it with a paragraph holding the typed text. Typing inside a transaction over a range that covers the whole document still types into its first block, so it throws when the document starts with a table. Outside this rule's scope, a delete or typing inside one read-only or atom cell removes that cell, and a paste there writes into it. The Open work of `docs/plans/topics/table.md` tracks each gap.

- `EDIT-TABLE-RESIZE-COMMIT-001` `proposed` `column or row boundary drag`: dragging a table column or row boundary previews the new size only in the view being dragged; releasing the pointer commits the new width or height to the document in one change, and cancelling the drag discards the preview without changing the document

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none, since GFM tables carry no widths; primary UX ref: Google Docs for table feel; secondary ref: Notion
Source: docs/plite/research/2026-09-17-table-substrate-ownership/REPORT.md:20-22
Proof: `packages/platejs/src/react/features/table/useTableResize.spec.tsx:128` "previews without writes and commits one complete undoable gesture" asserts two previews with unchanged children, then one `columnWidths` write, one undo entry and one `onResizeEnd` on pointerup, and `:149` "ignores other pointers and discards a cancelled gesture" asserts `pointercancel` writes nothing and adds no undo entry; the www browser tests "table resize previews, commits, and undoes at ${width}px" and "table resize cancellation restores the rendered sizes" in `apps/www/tests/browser/table-resize.spec.ts` (Chromium, Firefox and WebKit, `/blocks/table-demo`) cover a column and a row commit with undo, and cancellation. No test mounts two views, so the preview staying in the dragged view is unproven, and the row drag asserts no absence of writes during the drag. Code: the preview stays in the caller's `onResize`, and pointerup calls one `update.resize` (`packages/platejs/src/react/features/table/useTableResize.ts:105`, `:115`). Checked 2026-10-08.

- `EDIT-TABLE-COPY-CROSSING-301` `proposed` `copy an ordinary document text range across a table`: when a text range starts before a table and ends after it, the copied content keeps the complete table and its cells in document order. Cell-selection projection must not replace or discard that table. Copy leaves the source content and selection unchanged.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; omitting selected table structure loses document content
Authority: syntax: GFM tables; primary UX ref: Google Docs for table feel; secondary refs: Notion and Milkdown; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-07-14-plate-next-table-no-drift-re-audit.md:738-741; c70bacbd4a:docs/plans/2026-07-27-plate-next-sync-all-packages-v17.md:1563
Proof: packages/platejs/src/features/table/lib/BaseTablePlugin.clipboard.spec.tsx, 'preserves a table inside an ordinary document range', exports a range from before a two-cell table to after it and asserts that the slice contains a table. It does not compare every cell or assert native clipboard serialization. The slice middleware in packages/platejs/src/features/table/lib/BaseTablePlugin.ts returns the ordinary slice when no table selection resolves. Model slice-export proof only.

- `EDIT-TABLE-BORDER-UNDO-001` `proposed` `change borders across selected cells, then Undo`: one border action changes all affected cell edges in one undo step. One Undo restores every border changed by that action without changing table content or shape.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; a partial replay would leave one logical formatting action only partly undone
Authority: syntax: none for borders, which GFM does not represent; primary UX ref: Google Docs for table feel; secondary refs: Notion and Milkdown; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-07-14-plate-next-table-package-review.md:749-750
Proof: packages/platejs/src/features/table/lib/BaseTablePlugin.borders.spec.tsx, 'toggles the left border for every selected non-first-column cell in a multi-row selection', asserts the changed adjacent borders, one undo entry and restoration of the original children after Undo. packages/platejs/src/features/table/lib/BaseTablePlugin.ts applies the selected edges through one transaction. Model proof; the test does not drive a native toolbar.

- `EDIT-TABLE-RESIZE-AFTER-EDIT-001` `proposed` `column-boundary drag after a cell edit or its Undo`: resizing still previews and commits from the table's current state after editing a cell, including after undoing that edit. Undo restores the previous widths. After explicitly refocusing a cell, typing remains usable; this rule does not require the drag to restore text focus automatically.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; ordinary editing must not disable the installed resize capability
Authority: syntax: none for widths, which GFM does not represent; primary UX ref: Google Docs for table feel; secondary refs: Notion and Milkdown; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-09-09-editor-performance-phase-5.md:400-406
Proof: packages/platejs/src/react/features/table/useTableResize.spec.tsx, 'starts from current table state after a cell edit (undo: %s)', covers both branches with synthetic pointer events, asserts a preview without document writes, committed widths and exact restoration after Undo. It does not test subsequent typing. packages/platejs/src/react/features/table/useTableResize.ts resolves the current table by its stable key at pointerdown. The inspected apps/www/tests/browser/table-resize.spec.ts covers ordinary resize and Undo, without the preceding edit sequence.

- `EDIT-TABLE-SELECTION-CURSOR-001` `proposed` `hold a selection drag across table resize handles`: ignored resize handles show the text-selection cursor before pointer entry and throughout the crossing. Crossing preserves the held cell selection, starts no resize or preview and permits further selection extension. After release, idle handles regain their resize cursor and normal resizing remains available.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; ignored chrome must neither interrupt selection nor advertise an action it will not perform
Authority: syntax: none for pointer feedback; primary UX ref: Google Docs for table feel; secondary refs: Notion and Milkdown; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-08-26-table-selection-cursor-regression.md:398-410
Proof: apps/www/tests/browser/table-selection.spec.ts, 'table:ignore-resize-handle-hover-during-cell-selection-drag', asserts the pre-entry and target-capture computed cursor, unchanged selection, absent preview and resize state, continued drag extension and restored idle hover. It does not perform a subsequent resize or capture OS cursor pixels. apps/www/src/registry/components/editor/table.tsx supplies the held-pointer cursor CSS and declines hover previews while buttons are held. The test was read, not rerun.

- `EDIT-TABLE-SELECTION-HANDLES-001` `proposed` `drag-select cells in different table rows, then release`: block, selected-cell and row drag affordances stay absent over or beside the selected content during the held drag and after release. Releasing the pointer preserves the selected cells. This rule does not forbid the row handle for a selection confined to one row.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; drag chrome must not obscure or compete with the active multi-row cell selection
Authority: syntax: none for drag affordances; primary UX ref: Google Docs for table feel; secondary refs: Notion and Milkdown; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-08-26-table-selection-drag-handle-regression-repair.md:359-369
Proof: apps/www/tests/browser/table-selection.spec.ts, 'table:hide-block-handles-during-cell-selection', checks absent Drag block and Move selected cells controls during and after same-row and multi-row drags. It explicitly permits one hovered row handle in the same-row case and requires none in the multi-row case. apps/www/src/registry/components/editor/dnd.tsx hides block handles for a cell selection; apps/www/src/registry/components/editor/table.tsx hides row handles for multi-row selections. The browser test was read, not rerun.

- `EDIT-TABLE-MERGE-RICH-001` `proposed` `merge selected cells, then split the merged cell`: merging preserves every source cell's rich content in row-major order, including media-only content, nested tables, marks and semantically meaningful empty objects. Only default empty placeholders may be discarded. The retained anchor cell becomes selected. Splitting keeps the merged content in that anchor cell, creates empty peer cells and keeps the anchor selected without duplicating its content.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; changing table structure must not lose or duplicate semantic content
Authority: syntax: GFM tables, with local rich-cell and merged-cell extensions; primary UX ref: Google Docs for table feel; secondary refs: Notion and Milkdown; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-09-17-table-api-design.md:248
Proof: packages/platejs/src/features/table/lib/BaseTablePlugin.merge-split-remove.spec.tsx asserts row-major text order, preservation of a nested table, empty split peers and content retained in the first cell. It does not prove media-only sources, marks or semantic empty objects. packages/platejs/src/features/table/lib/BaseTablePlugin.ts moves complete child nodes by key, removes only a structurally default placeholder, and selects the retained anchor after merge and split. Model proof only.

- `EDIT-TABLE-DRAG-HIGHLIGHT-001` `proposed` `hold a pointer drag selecting more than one table cell`: native text-selection highlight stays hidden throughout the table, including intervening cells outside the projected cell selection. Pointer release preserves the selected cells, clears the temporary native range and leaves the editor focused.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; native range paint must not contradict the editor's cell selection
Authority: syntax: none for selection paint; primary UX ref: Google Docs for table feel; secondary refs: Notion and Milkdown; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-08-26-table-native-highlight-reporter-contradiction-regression.md:296-307
Proof: apps/www/tests/browser/table-selection.spec.ts, 'table:hide-native-highlight-during-multi-cell-drag', holds a real pointer drag, checks two projected cells while a native range crosses intervening text, compares pixels with transparent and positive highlight controls, then asserts retained cells, no native range and editor focus after release. apps/www/src/registry/components/editor/table.tsx applies transparent native selection paint table-wide when several cells are selected. The browser test was read, not rerun.

- `EDIT-TABLE-SELECTION-PAINT-001` `proposed` `select table cells or the whole table`: selection paints one layer inside each selected cell and no table-wide layer in the wrapper or gutter. Whole-table selection uses the same cell-only paint. The selection model, applicable toolbar and subsequent cell editing remain usable.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; selection paint must identify selected content without adding a misleading outer layer
Authority: syntax: none for selection paint; primary UX ref: Google Docs for table feel; secondary refs: Notion and Milkdown; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-08-26-table-cell-only-selection-paint-regression.md:102-106
Proof: apps/www/tests/browser/table-selection.spec.ts, 'table:paint-only-selected-cells', selects the whole table with Mod+A, checks all 16 cells selected and a visible popup, compares pixels with cell-only, absent and duplicate controls, then edits a cell and undoes the edit. The same file's mixed-block-selection cases cover the table without an outer overlay. apps/www/src/registry/components/editor/table.tsx paints selected cells and routes a table block highlight through cell pseudo-elements. The browser tests were read, not rerun.

- `EDIT-TABLE-DRAG-PAINT-001` `proposed` `pointer drag within or across table cells`: ordinary text selection confined to one cell retains its normal native highlight. Once the drag selects several cells, native text-selection paint stays hidden throughout the table. Releasing preserves the selected cells and editor focus without leaving a competing native highlight. Painting changes no document content.

Classification: invariant within table selection, by the tests in docs/vision/plate.md:151-160; native text paint must remain usable for text selection and must not misrepresent a cell selection.
Authority: syntax: GFM tables; primary UX ref: Google Docs for table feel; secondary refs: Notion and Milkdown. These inherit the Table family's references; no reference editor was checked for this case.
Source: docs/plans/2026-08-26-hide-native-table-highlight-during-drag.md:300-314
Proof: `apps/www/tests/browser/table-selection.spec.ts`, "table:hide-native-highlight-during-multi-cell-drag", checks a nontransparent selection background before dragging, holds a real multi-cell drag, compares native-highlight pixels against transparent and positive controls, and asserts two selected cells, no native range and editor focus after release. It does not perform a separate within-cell text-selection drag or compare exact selection endpoints after release. `apps/www/src/registry/components/editor/table.tsx` applies transparent selection backgrounds only when the table has an expanded cell selection; `packages/platejs/src/react/features/table/TablePlugin.tsx` imports the released native range as a cell selection. This extends the existing multi-cell highlight rule with the ordinary single-cell paint requirement. Test read, not run.

- `EDIT-TABLE-DRAG-CONTRACT-001` `proposed` `move a held table-cell selection drag back toward its origin`: the selected rectangle contracts to the current pointer position. Returning inside the origin cell restores a text selection confined to that cell, with no expanded-cell highlight before or after release. Document content stays unchanged, and release leaves editor focus usable.

```text
start in cell r1c1; drag to r3c2
selected rectangle: rows 1 to 3, columns 1 to 2
move back inside r1c1 while still held
=>
text selection confined to r1c1; no expanded-cell highlight
release
=>
the selection remains confined to r1c1
```

Classification: invariant within table selection, by the tests in docs/vision/plate.md:151-160; the selected rectangle must follow the current drag rather than its greatest extent.
Authority: syntax: GFM tables; primary UX ref: Google Docs for table feel; secondary refs: Notion and Milkdown. These inherit the Table family's references; no reference editor was checked for this case.
Source: docs/plans/2026-08-26-shrink-table-cell-selection-on-drag-back.md:295-315
Proof: `apps/www/tests/browser/table-selection.spec.ts`, "table:contract-selection-on-drag-back", drags from Plugin to a six-cell rectangle, returns to the origin while held, and asserts both model endpoints lie in one text path, native selected text is empty or belongs to Plugin, and no cells carry the expanded-selection marker. After release it again asserts no expanded-cell markers and editor focus. It does not compare every intermediate rectangle or exact final offsets. `packages/plitejs/src/react/editable/root-interaction-controller.ts` applies each newly resolved live drag range without retaining its earlier maximum extent; `packages/platejs/src/react/features/table/TablePlugin.tsx` projects only multi-cell ranges as cell selections. Test read, not run.

- `EDIT-TABLE-DRAG-RESIZE-IGNORE-001` `proposed` `enter or release over a resize handle during a table-cell selection drag`: the handle preserves the last valid cell range and starts no resize. Resize hover preview remains hidden while the pointer button is held. Returning to cells continues selection from the same anchor. Release preserves the range; subsequent idle hover and a new resize gesture remain available. Crossing the handle changes no document content or caret ownership.

Classification: invariant within table selection and resizing, by the tests in docs/vision/plate.md:151-160; resize chrome must not redirect an existing selection gesture.
Authority: syntax: none for resize chrome; primary UX ref: Google Docs for table feel; secondary refs: Notion and Milkdown. These inherit the Table family's references; no reference editor was checked for this case.
Source: docs/plans/2026-08-26-ignore-table-resize-handles-during-cell-selection-drag.md:261-269
Proof: `apps/www/tests/browser/table-selection.spec.ts`, "table:ignore-resize-handle-hover-during-cell-selection-drag", crosses a column handle while held and asserts exact preservation of the saved selection, two selected cells, no preview or resizing row, then extends to three cells and verifies restored idle hover. It releases over a cell, not the handle, and performs no subsequent resize. `apps/www/src/registry/components/editor/table.tsx` marks resize chrome to be ignored and suppresses hover preview while buttons are held; `packages/plitejs/src/react/editable/root-interaction-controller.ts` ignores interactive drag targets on both move and release. The release-over-handle clause has source support but no exact proof in the inspected browser case. Test read, not run.

- `EDIT-TABLE-BORDER-LEFT-401` `proposed` `toggle the left border of a multi-row cell selection`: update every cell edge on the selection's left boundary, including when that boundary is after the table's first column. Keep the table's content, shape and selected range. A shared edge may be stored on the adjacent cell without changing which visible boundary is toggled.

```text
2 × 2 table; select the second-column cells in both rows
Toggle left border
=>
the left edge of both selected cells toggles; both rows remain selected
```

Classification: invariant within table border formatting, by the tests in docs/vision/plate.md:151-160; one selected boundary must be formatted consistently across its rows.
Authority: syntax: none for borders, which GFM does not represent; primary UX ref: Google Docs for table feel; secondary refs: Notion and Milkdown. These inherit the Table family's references; no reference editor was checked for this case.
Source: docs/plans/4798-fix-table-left-border-multirow-selection.md:5-18
Proof: `packages/platejs/src/features/table/lib/BaseTablePlugin.borders.spec.tsx`, "toggles the left border for every selected first-column cell in a multi-row selection", asserts left borders on both selected first-column cells. "toggles the left border for every selected non-first-column cell in a multi-row selection" asserts the shared edges as right borders on both adjacent cells, one undo entry and restoration after Undo. Neither separately asserts the resulting selection. `packages/platejs/src/features/table/lib/BaseTablePlugin.ts` filters anchors to the selected left boundary and resolves shared physical edges before applying the border updates. Model proof only; tests read, not run.

- `EDIT-TABLE-ROW-HANDLE-401` `proposed` `select several cells in one row or across several rows`: in the editable table surface, a selection confined to one row keeps that row's Select or move row control available on its normal control-column hover. A selection spanning at least two rows hides row drag handles. Generic block handles and the selected-cell move control remain absent during expanded cell selection in both cases, including after release. These affordances do not change the selected range or document content.

Classification: product policy, by the tests in docs/vision/plate.md:151-160; this copied table surface chooses which drag controls remain available for each selection shape.
Authority: syntax: none for drag controls; primary UX ref: Google Docs for table feel; secondary refs: Notion and Milkdown. These inherit the Table family's references; no reference editor was checked for this policy.
Source: docs/plans/2026-08-26-keep-row-drag-handle-for-one-row-selection.md:3-25
Proof: `apps/www/tests/browser/table-selection.spec.ts`, "table:hide-block-handles-during-cell-selection", performs same-row and multi-row drags, requires Drag block and Move selected cells absent during and after each drag, then hovers the control column and asserts one row handle for the same-row selection and none for the multi-row selection. It checks selected-cell counts, not exact range endpoints or document equality. `apps/www/src/registry/components/editor/table.tsx` hides row handles when canonical rectangular bounds span several rows; `apps/www/src/registry/components/editor/dnd.tsx` suppresses generic gutters for cell selections while distinguishing a whole-table block pick. Test read, not run.

### Rectangular Paste

- `EDIT-TABLE-PASTE-EXPAND-001` `locked`

```text
copy a 2 × 2 cell rectangle
paste into the bottom-right cell
=>
preserve all four source cells
add the minimum required row and column
select the pasted 2 × 2 rectangle
```

note: a closed table slice pasted at one cell starts at that cell
note: when table expansion is enabled, paste adds every required row and column
instead of truncating the source rectangle at the existing edge
note: structural growth and column-width metadata commit together, so every
logical column has a usable rendered column and pasted text does not collapse
vertically
note: in-bounds paste preserves the existing table dimensions
note: one paste creates one history action; undo restores the exact prior table
content, dimensions, and widths, and redo restores the complete paste

- `EDIT-TABLE-PASTE-REJECT-001` `locked`

```text
paste a cell rectangle that crosses the table edge
with expansion disabled
=>
reject the complete paste
```

note: disabled expansion rejects overflow atomically; it must not apply a
partial rectangle or leave changed content, widths, or selection

- `EDIT-TABLE-PASTE-FILL-001` `proposed` `paste into a selected cell rectangle`: pasting a copied cell range into a rectangular selection of several cells fills exactly that rectangle: a smaller source repeats across it in both directions, a partial last tile is clipped, a larger source is clipped to the selection, and the table never grows; a non-rectangular selection refuses a table source, a source that is not a table fills every selected cell with the same content, the filled cells end selected, and one paste is one undo step

```text
copy cells x | y
paste into a selected 2 × 3 rectangle
=>
x | y | x
x | y | x
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: GFM tables; primary UX ref: Google Docs for table paste; secondary ref: Notion
Source: c70bacbd4a7523ae3ebfd820cec0ea8ec228e9ad:docs/editor-behavior/editor-protocol-matrix.md:264
Proof: `packages/platejs/src/features/table/lib/BaseTablePlugin.paste.spec.tsx:421` "pastes $name and replays it through history", case "a partial source tile across the selected rectangle", pastes a 1 × 2 source into a selected 2 × 3 rectangle and asserts `x y x` in both rows, one commit, no grid problems, an undo back to the exact prior value and selection and a redo back to the paste; `packages/platejs/src/features/table/lib/internal/paste.spec.ts:340` "9. clips and repeats a partial source tile" and `:386` "keeps each repeated source tile as an independent placement group" prove repeat and clip at the planner level, `packages/platejs/src/features/table/lib/BaseTablePlugin.insert-fragment.spec.tsx:192` "replace these cells (allowCellSpanEditing: $allowCellSpanEditing)" repeats a 1 × 2 source down a selected 2 × 2 rectangle, and `:1184` "fits closed text against every selected cell grammar" fills every selected cell with text. No test asserts the refused non-rectangular selection or the selection after a fill. Code: a multi-cell target fixes the fill bounds to the selection and starts the plan at its top-left cell (`packages/platejs/src/features/table/lib/BaseTablePlugin.ts:2427-2457`, `packages/platejs/src/features/table/lib/internal/paste.ts:346-360`), a non-table source fills each selected cell (`packages/platejs/src/features/table/lib/BaseTablePlugin.ts:2408-2425`), and several placements end as a cell selection from the top-left to the bottom-right filled cell (`:2489-2513`). Checked 2026-10-08.

## Link And Image

Authority:

- CommonMark for syntax
- Typora for markdown-native editing feel
- GitHub Docs where GFM behavior is more specific

Ownership:

- link is an inline non-void span with directional affinity
- image is a non-void object media owner with editable children;
  `NodeSelection` focuses its asset and `TextSelection` edits its direct caption
  children
- image markdown syntax is still a serializer / parser concern, not a direct
  plain-text key owner

Plugin surface:

- links expose insert and transform surfaces in the link package
- images currently have markdown parse and serialize rules, but no dedicated
  markdown-first insert law in this file

### Source-Entry Surface

- source-entry surface is the rendered-content subfamily of the broader
  source-preserving conversion family

- `EDIT-INTERACT-*` `locked`

```text
rendered markdown-native source surface
=>
plain click edits or expands source-oriented entry
mod-click opens or jumps
```

note: markdown-native links, directly editable markdown images, and HTML blocks
share one interaction family: source-entry surfaces
note: a source-entry surface is rendered content that still preserves a clear
path back into source-like editing instead of behaving like passive preview-only
chrome
note: Typora is the primary owner for this family
note: node model still decides the exact behavior per entity; this family only
locks the shared interaction shape
note: current Plate HTML-block behavior is still the thin version of this
family: preserve HTML as editable source text instead of pretending the product
already has a richer rendered HTML-block editor surface

### Source-Preserving Conversion Surface

Authority:

- Typora for source-oriented editing and explicit conversion feel
- Obsidian for conservative markdown-sensitive conversion pressure
- Milkdown for inspectable trigger / input-rule conversion mechanics

Ownership:

- source-preserving conversion is the broader family that covers:
  - rendered source-entry surfaces
  - typed syntax-trigger conversions
- incomplete or ambiguous source should stay literal
- conversion should only happen at an explicit, unambiguous boundary
- after conversion, the user should still have either:
  - a source-oriented edit seam
  - or an explicit structured editor

Plugin surface:

- current Plate ships the rendered source-entry subfamily more than the typed
  syntax-trigger subfamily
- link automd now ships in the current rich-mode kits as a typed conversion
  member of this family
- math delimiter conversion ships the explicit-completion rich-mode slice; markdown-native variants such as selection-wrap are outside this contract
- this family is not generic autoformat and not hidden parser magic
- this family does not imply one monolithic runtime host:

  - rendered source-entry surfaces belong in the owning feature package and
    render/edit-entry layer
  - typed syntax-trigger conversions belong in shared input infrastructure near
    the owning feature package, not in parser-only code and not in generic
    autoformat by default

- `EDIT-CONVERT-001` `locked`

```text
incomplete or ambiguous markdown-native source
=>
keep the source literal
```

note: do not erase raw syntax before the conversion boundary is explicit

- `EDIT-CONVERT-002` `locked`

```text
completed source syntax or explicit source-edit target
=>
structured surface with source-preserving re-entry
```

note: conversion is allowed once the boundary is explicit and the resulting UX
does not trap the user in passive preview-only chrome

### Link

note: typing at a link boundary follows `EDIT-AFF-LINK-001` under Affinity Rules

- `EDIT-LINK-CLICK-001` `locked`

```text
click rendered link
=>
expand link source or link edit surface
```

note: plain click on a rendered markdown link should prefer in-editor editing
over immediate external navigation

- `EDIT-LINK-CLICK-002` `locked`

```text
mod-click rendered link
=>
open target
```

note: command / control click should navigate to the link target

note: the notes below cover boundary typing, URL paste, autolink and the upsert and unwrap transforms

note: typing a space or `↵` at the end of a whole token that the link plugin's `parseUrl` recognizes, and whose result `allowedSchemes` allows, finalizes it as a link, and a link whose text is its URL serializes back to bare URL markdown

note: the default `parseUrl` recognizes a token with an explicit scheme, such as `https://example.com` or `tel:+15551234`; placeholders such as `http://...`, `https://…`, `http:foo` and `tel://` stay text

note: after a token that is not recognized or not allowed, the space or `↵` goes in as typed

note: pasting a URL into plain text inserts a link whose text is the URL

note: inside a link or after unfinished `[label](` source, a pasted URL goes in as typed, even when the clipboard also holds HTML; other pastes there go to the next handler

note: pasting a URL over selected text keeps the selected text as the link text by default

note: with `keepSelectedTextOnPaste: false`, pasting a URL over selected text replaces it with the URL text

note: when `parseUrl` maps visible text to an href, a space typed at the end of that text wraps it and uses the returned href

note: typing a space inside an existing link never wraps it again

note: `↵` at the end of an autolink candidate finalizes the link before creating the next block

note: normalization removes a link wrapper that deletion left empty

note: link upsert updates the href or text and keeps marks, and unwrap removes the link, each according to the transform's intent

note: linking selected text that crosses or touches a link's edge, or covers whole links, relinks only the selection, and the unselected part of each link keeps its old link; a selection inside one link updates that whole link

note: unlinking selected text in split mode removes the link only from the selection, and at a caret removes the whole link

note: a link never lands in a block that cannot hold one, such as a code block, or around an inline it cannot hold, such as a mention; Cmd+K keeps the link form closed in such a block, and a URL pasted over a selection where no block can take the link goes in as text

- `EDIT-LINK-EDGE-DELETE-001` `proposed` `⌫ or ⌦ at a link edge, then typing`: deleting a selected first or last character of a link with `⌫` or `⌦`, then typing, puts the typed text outside the surviving link; typing over a selected link character keeps the new text inside the link; and a collapsed `⌫` from just after the link deletes its last character and keeps later typing inside it, since the caret is then on the linked side under `EDIT-AFF-LINK-001`

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: CommonMark; primary UX ref: Typora for markdown-native link editing; secondary ref: the WPT editing tests for deletion at a link edge
Source: c70bacbd4a:docs/plite/research/2026-06-13-wpt-editing-oracles/README.md:291-297
Proof: only a Plite example proves it in a browser: `apps/plite/tests/plite-browser/donor/examples/inlines.test.ts:672` "keeps typing outside a surviving inline link after deleting edge text" (Backspace on the selected first character and Delete on the selected last character, then `XY`, with the caret asserted outside the link), `:643` "keeps replacement text inside selected link text" and `:773` "keeps typing after a link-boundary Backspace inside the link" run in Chromium, Firefox and WebKit on Plite's inlines example; the last two assert no selection. No Plate test covers any clause. Drift: a model probe on 2026-10-08 with the real `BaseLinkPlugin` and `AffinityPlugin` (Bun, package source, no browser) met the first two clauses, but after a collapsed `⌫` from just after the link the caret sat inside the link at its end and typed `tail` landed outside it, because the link plugin's `insertText` override exits the link from any collapsed caret at its end (`packages/platejs/src/features/link/lib/BaseLinkPlugin.ts:670-703`, `:364-397`), and `AffinityPlugin` never acts on an element edge (`packages/platejs/src/lib/plugins/affinity/AffinityPlugin.ts:270-283`). The same override breaks `EDIT-AFF-LINK-001` for the shipped plugin; see current-evidence's Open work. Checked 2026-10-08.

- `EDIT-LINK-WRAP-SEL-001` `proposed` `toolbar link`: wrapping selected text in a link from the toolbar keeps that text selected, while inserting a link at a collapsed caret leaves later typing outside the link

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: CommonMark; primary UX ref: Typora for markdown-native link editing; secondary ref: ProseMirror (#1338, #83)
Source: c70bacbd4a:docs/editor-issue-harvester/prosemirror/full/checkpoints/issues-1330-1370.md:27
Proof: in a browser only a Plite example proves it: `apps/plite/tests/plite-browser/donor/examples/inlines.test.ts:146` "keeps selected text selected after toolbar link wrapping" asserts the native selected text but not the model selection, and `:117` "inserts a toolbar link at a collapsed selection" asserts later typing stays out of the link, both under that example's own `wrapLink`. Plate's link specs check the wrapped children but not the selection afterwards (`packages/platejs/src/features/link/lib/BaseLinkPlugin.spec.tsx:574`, `:824`), and `:873` "creates and selects a text leaf after a terminal link" shows typing at a link's end lands after it. A model probe on 2026-10-08 (Bun, package source, happy-dom) found `link.upsert` and `link.wrap` over `world` keep `world` selected, and a collapsed upsert leaves the caret at the link's end, where typing lands outside it. The copied toolbar submit path (`apps/www/src/registry/components/editor/link.tsx:128-146`) has no browser proof. Checked 2026-10-08.

- `EDIT-LINK-EMPTY-SHORTCUT-001` `proposed` `Mod+K in an empty paragraph, then Escape`: with a collapsed caret in an empty paragraph that admits links, Mod+K opens the link insertion toolbar at that paragraph's caret line and focuses its URL input. Opening changes no document content. Escape closes the toolbar and restores editor focus and the empty-paragraph caret.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; the installed link-entry shortcut must provide a usable editing target even in an empty paragraph
Authority: syntax: CommonMark links; primary UX ref: Typora for markdown-native editing feel; secondary ref: GitHub Docs where GFM is more specific; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-08-31-fix-floating-link-toolbar-in-empty-paragraph.md:334-369
Proof: apps/www/tests/browser/transient-editor-geometry.spec.ts, 'link floating editor opens from an empty paragraph 5/5', covers normal and reduced motion, checks placement relative to the empty line, URL-input focus and typing, Tab movement, Escape, restored editor focus and follow-up typing, ending at the empty caret. apps/www/src/registry/components/editor/link.tsx owns Mod+K, selection geometry and focus restoration. The browser test was read, not rerun.

### Image

- `EDIT-IMG-*` `locked`

```text
![Caption](/image.png "Title")
```

note: plain markdown images carry alt, src, and optional title only
note: width and height remain HTML or MDX-only, not plain markdown

note: image title comes from `node.title`; caption or alt does not synthesize a
markdown title
note: Typora is the winner for markdown-native image authoring behavior such as
drag-drop, clipboard image insertion, relative-path generation, and source-edit
expectations
note: when a markdown-native image surface is directly editable, plain click
should prefer source editing over passive rendered chrome behavior
note: Typora also exposes path-rewrite actions such as move and copy image, but
the current Plate markdown-first behavior contract does not define file-system side
effects in core image editing law
note: Typora's `./` prefix and relative-path policies are valid future
app-kit policy candidates; they are not required baseline law today
note: rich media block UI still belongs to the media contract, not this
markdown-native image subsection

### HTML Block

- `EDIT-INTERACT-*` `locked`

```text
<figure class="hero">
  <img src="/image.png" />
</figure>
```

note: current Plate html-block behavior preserves raw HTML block source as
editable source text
note: this current surface is source-canonical, not preview-first
note: the contract has no rendered HTML preview or block-specific chrome

## Callout

Authority:

- syntax: local MDX callout contract
- primary UX ref: Notion
- secondary ref: Milkdown

Ownership:

- callout is a local container contract
- callout owns its own enter and start-delete behavior before yielding back to
  generic paragraph behavior

Plugin surface:

- callout plugins expose insertion and rendering surfaces
- this section defines current editing law once a callout block already exists

Callout is block-editor-native, but its current editor behavior is explicit
enough to lock.

- `EDIT-CALLOUT-ENTER-001` `locked` `↵`

```text
::callout[info] one|two
=>
::callout[info] one
two
```

note: insert a soft break inside the same callout block
note: local callout contract informed by Notion-style block behavior, not a strongly documented cross-editor standard

- `EDIT-CALLOUT-ENTER-EMPTY-001` `locked` `↵`

```text
::callout[info] |
=>
|
```

note: reset an empty callout to a paragraph

- `EDIT-CALLOUT-BS-START-001` `locked` `⌫`

```text
::callout[info] |text
=>
|text
```

note: reset the callout at block start instead of merging through it

## Details

Authority:

- syntax: HTML `<details>` and `<summary>`
- primary UX ref: Notion
- secondary ref: Milkdown

Ownership:

- details is a local container contract: one Summary followed by direct body blocks, held by the Details schema
- open state is transient view state and never persists in the document
- nested containers keep their own structural keys before Details claims them

- `EDIT-DETAILS-ENTER-001` `locked` `↵`: at the end of an open Summary, the caret moves into the first body block, and a Details with no body block gets a new empty body paragraph first; trailing Summary text moves into a new first body paragraph
- `EDIT-DETAILS-ENTER-CLOSED-001` `locked` `↵`: in a closed Summary, the caret moves after the whole Details
- `EDIT-DETAILS-ENTER-EXIT-001` `locked` `↵`: in the final empty body block, a paragraph is inserted after the Details and the empty body block stays
- `EDIT-DETAILS-BS-START-001` `locked` `⌫`: at the Summary start, the Details unwraps
- `EDIT-DETAILS-BS-BODY-001` `locked` `⌫`: at the start of the first body block, the caret moves to the end of the Summary
- `EDIT-DETAILS-DEL-CLOSED-001` `locked` `⌦`: at the Summary end with a closed body, the caret skips the hidden body without changing content
- `EDIT-DETAILS-BS-AFTER-CLOSED-001` `locked` `⌫`: in an empty block after a closed Details, the block goes and the caret moves to the end of the Summary; deleting a whole block after a closed Details, as a text range or a selected block, also leaves the caret at the Summary end, never in the hidden body
- `EDIT-DETAILS-TITLE-LEVEL-001` `locked`: a heading shortcut or a Markdown heading prefix in the Summary gives it that `level` and keeps it the first child with its node key; the same shortcut again removes the level, and a heading prefix typed into a Summary that already has the level stays text
- `EDIT-DETAILS-TITLE-LIST-001` `proposed`: a list command, Turn into or a list marker typed at the Summary start turns the Summary into a list item at the Details' depth and each body block into a block one level deeper, so the body is the item's family; only that Details goes and an enclosing Details stays. When a body block cannot take an indent or the result does not fit the parent, the command changes nothing and a typed marker stays text. Other selected blocks stay unchanged too. Proof: `packages/platejs/src/features/details/lib/BaseDetailsConversion.spec.ts` "converts a title when its list marker is typed", "keeps a typed list marker when the body cannot be indented", "refuses a selection around a section that cannot convert" and the cases under "a Details title conversion that cannot finish".
- `EDIT-DETAILS-TITLE-CODE-001` `proposed`: Code from the Summary alone turns it into a code block and leaves the body as the blocks after it, and only that Details goes; Code is refused when the selection holds the Summary and more blocks, a code block included. Code on a block selection converts only the selected blocks, so a Details between them stays whole. Proof: `packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.spec.tsx` "converts a nested Details title to code and preserves its body and parent", and `packages/platejs/src/features/details/lib/BaseDetailsCodeConversion.spec.ts` "refuses a selection that holds the title and its body", "refuses a selection that holds the title and a code block" and "codes two selected blocks and leaves a Details between them whole".
- `EDIT-DETAILS-INSERT-CLOSED-001` `proposed`: a block inserted from a closed Summary, by an insert command, the slash menu, a file pasted or submitted there or AI, lands after the whole Details; from an open Summary it lands at the start of the body. An explicit target stays where it points, and an empty Summary keeps its place and key. Proof: `packages/platejs/src/features/details/lib/BaseDetailsLanding.spec.ts`, `packages/platejs/src/ai/react/AIChatPlugin.details.spec.ts`, `packages/platejs/src/react/features/upload/UploadPlugin.spec.ts` "submits a file from a closed details title after the section" and `apps/www/src/registry/components/editor/slash.spec.tsx` "inserts ${option} after a closed Details with title %j".
- `EDIT-DETAILS-TITLE-TYPE-001` `proposed`: Quote, Callout, Columns, Paragraph, `blocks.set` and three typed dashes on a Summary change nothing, because the schema refuses another block in the title's place; the Summary keeps its place, text and node key, and the paragraph shortcut only drops its level. Code and List still apply as `EDIT-DETAILS-TITLE-CODE-001` and `EDIT-DETAILS-TITLE-LIST-001` say. A refused Quote toggle returns `false`, so the copied menus leave a selected body list item alone. Proof: `packages/platejs/src/features/details/lib/BaseDetailsPlugin.spec.ts` "Details title slot", `packages/platejs/src/features/layout/lib/BaseColumnPlugin.spec.ts` "changes nothing when Columns cannot replace a Details title" and `apps/www/src/registry/components/editor/turn-into-toolbar-button.behavior.spec.tsx` "keeps a body list item when Quote is refused on its Details title".
- `EDIT-DETAILS-TITLE-LAND-001` `proposed`: a block made from a Summary lands as a body paragraph. Enter in the middle of a Summary or over a selection in it splits off a body paragraph; each line after the first of a plain-text paste, and Duplicate of a picked Summary or of one holding the caret become body paragraphs, and a copied Summary pasted into a body line joins that line; an open slice pasted at a Summary's end stays inside it. An AI answer that rewrites a picked Summary keeps the first block as the title, and a table answer goes below the title. Proof: `packages/platejs/src/features/details/lib/BaseDetailsCommands.spec.ts` "splits a title over a selection or around an inserted block into a body paragraph", `BaseDetailsPlugin.spec.ts` "Details title slot", whose "duplicates the title or body line holding the caret" covers the caret, and `packages/platejs/src/ai/react/AIChatPlugin.details.spec.ts` "AIChatPlugin over a Details title".

- `EDIT-DETAILS-CLOSE-SELECTION-001` `proposed` `close Details`: each mounted view owns its Details open state. Before hiding a Details body, a writable closing view moves the selection to the Summary end when a text-selection endpoint or selected block lies in that body and the closing view owns the caret or no view owns it. Closing from another view, or from a read-only view, must not move the caret owner's selection. Closing changes no document content.

```text
::details[open] Summary
  bo|dy
close in the writable caret-owning view
=>
::details[closed] Summary|
  body (hidden)
```

Classification: invariant, by the tests in docs/vision/plate.md:150-160; a view must not strand its caret in hidden content or steal another view's caret
Authority: syntax: HTML details and summary; primary UX ref: Notion; secondary ref: Milkdown; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-08-29-semantic-details-hard-cut.md:79-83; docs/plans/2026-08-29-replace-toggle-with-semantic-details.md:242-255
Proof: packages/platejs/src/features/details/lib/BaseDetailsViews.spec.ts and packages/platejs/src/features/details/lib/BaseDetailsViews.mounted.spec.tsx assert the closing owner's Summary-end caret, preservation of another view's body caret and the no-owner case. The mounted other-view case also checks native selection and focus. packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts performs selection repair before changing its view store and guards writability and caret ownership. The inspected cases do not separately prove an expanded endpoint, selected block or read-only close; no browser replay ran.

## Drawing Blocks

Authority:

- syntax: local non-markdown contract
- primary UX ref: Notion-like board tools
- secondary ref: docs reference

Ownership:

- Excalidraw is an atomic block contract
- surrounding delete and selection target the block boundary, not phantom text
  content
- a code-generated diagram is a code block in a diagram language, so the Code
  Block family governs its editing; its picture is presentation, not document
  content

Plugin surface:

- drawing plugins expose insert transforms
- this section defines the baseline block law; richer drawing UX is outside it

- `EDIT-DRAWING-*` `locked`

```text
insert drawing
=>
[drawing block]
```

note: insertion creates one atomic drawing block

- `EDIT-DRAWING-*` `locked`

```text
next block start + ⌫ after drawing
```

note: destructive movement targets the drawing boundary instead of generic
paragraph merge

## Mention

Authority:

- syntax: local mention markdown contract
- primary UX ref: Notion
- secondary ref: Milkdown

Ownership:

- mention is an inline atom contract
- mention is an inline void atom, not editable inline rich text
- mention owns adjacency delete and keyboard-access movement at its boundary

Plugin surface:

- mention plugins expose mention insertion and combobox behavior
- this section defines current mention-boundary law, not the whole combobox UX

- `EDIT-MENTION-INSERT-END-001` `locked`

```text
hi|
=>
hi @Ada |
```

note: when configured to insert a trailing space and the mention lands at block end

- `EDIT-MENTION-INSERT-MID-001` `locked`

```text
he|llo
=>
he @Ada llo
```

note: do not insert the trailing space when the mention lands mid-block

- `EDIT-MENTION-BS-START-001` `locked`

```text
text[@Ada]|
```

note: deleting backward at the boundary removes the whole mention atom

- `EDIT-MENTION-DEL-END-001` `locked`

```text
|[@Ada]text
```

note: deleting forward at the boundary removes the whole mention atom

- `EDIT-MENTION-*` `locked`

```text
text|[@Ada]more
```

note: left and right movement enters the mention child so the inline void stays
keyboard-accessible

- `EDIT-MENTION-MD-401` `proposed` `Markdown parse and serialize`: a mention serializes as the link `[label](mention:ref)`, writing its ref as the label when it has no label and percent-encoding the ref; such a link parses back to a mention with that ref and label, an ordinary link stays a link even when its text starts with `@`, and a bare `@handle` stays text

```text
Hello [Jane Smith](mention:jane_smith) and @bob!
=>
the same markdown after parse and serialize
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: local mention markdown contract; primary UX ref: Notion; secondary ref: Milkdown
Source: c70bacbd4a7523ae3ebfd820cec0ea8ec228e9ad:docs/editor-behavior/markdown-parity-matrix.md:116
Proof: the mapping is `BaseMentionPlugin`'s `markdown` format (`packages/platejs/src/features/mention/lib/BaseMentionPlugin.ts:95-135`), whose writer percent-encodes the ref, also encoding `(` and `)`, and writes `label ?? ref`. `packages/platejs/src/markdown/lib/serializer/serializeMention.spec.ts:88` "round-trips link mentions and keeps bare handles as text" asserts the scenario's markdown after parse and serialize but not that the parsed node is a mention; `packages/platejs/src/markdown/lib/deserializer/deserializeMentionLink.spec.tsx:30` "parses mentions with spaces in ID" reads `mention:jane%20smith` as ref `jane smith`, `:109` "does not convert regular links to mentions even with @ in text" keeps `[@mention](/docs/mention)` a link, and `:47` "keeps bare @handles as text beside link mentions" keeps `@bob` text. No test writes a ref that needs encoding or a mention without a label; a model probe on 2026-10-08 (Bun, package source) wrote ref `a b)c` with no label as `[a b)c](mention:a%20b%29c)` and read it back unchanged. Tag candidates for the parse clauses. Checked 2026-10-08.

## Date

Authority:

- syntax: local MDX date contract
- primary UX ref: Notion
- secondary ref: Google Docs

Ownership:

- date is an inline atom contract like mention
- date is an inline void atom, not editable inline rich text
- date owns adjacency delete and keyboard-access movement at its boundary

Plugin surface:

- date plugins expose `editor.update.date.insert`
- this section defines current boundary and insertion law, not date-picker UI
- the node payload is one required `value` string that holds a `YYYY-MM-DD`
  calendar day or authored text, such as `sometime next week`, and
  `parseCanonicalDateValue` tells them apart
- `insert` stores a `Date` as its local day and a string as written, trimmed
- v1's `toDateString()` text, such as `Mon Mar 23 2026`, converts to its day
  only in the v54 migration and the Markdown reader, and only when its weekday
  matches; other text stays as written
- the Markdown writer emits `<date value="YYYY-MM-DD" />` for a day and
  `<date text="…" />` for any other text, because Markdown can change child
  text, such as a blank line or an emoji shortcode; a day the host zone
  skipped writes as a `text` attribute and reads back the same
- the Markdown reader accepts `<date value>`, `<date>` child text and
  `<date text>`, and keeps a `text` attribute as written
- the copied live renderer computes Today, Yesterday or Tomorrow during render,
  from the server's clock in server HTML and the viewer's clock in the browser,
  and prints other days as the full date; the copied
  static renderer always prints the full date, so an export never goes stale
- both renderers print a day in UTC from the stored string, so the printed day
  does not depend on the host zone, except a day the host zone skipped, which
  prints as stored text; both print authored text literally
- the contract has no locale- or timezone-aware serialized semantics and no display-vs-value payload split

- `EDIT-DATE-INSERT-001` `locked`

```text
hi|
=>
hi [date] |
```

note: insert the date node followed by a trailing spacer
note: keyboard movement crosses the date atom without stopping inside it; issue 5125 chose this split from mention's arrow-entry policy

- `EDIT-DATE-BS-START-001` `locked`

```text
text[date]|
```

note: deleting backward at the boundary removes the whole date atom

- `EDIT-DATE-DEL-END-001` `locked`

```text
|[date]text
```

note: deleting forward at the boundary removes the whole date atom

- `EDIT-DATE-OPEN-001` `proposed` `primary click on an editable Date`: with a text caret already in ordinary editor text and external feedback capture inactive, one click opens the Date's calendar in that gesture. A second click is unnecessary. Opening alone preserves the stored date; choosing a day changes it.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; the editable Date control must act on its first activation
Authority: syntax: local MDX date contract; primary UX ref: Notion; secondary ref: Google Docs; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-08-29-date-calendar-single-click-regression.md:51-66
Proof: apps/www/tests/browser/inline-void-first-click.spec.ts, 'date opens from the first physical click after a text caret', places the preceding text caret, clicks through page mouse input, checks the complete gesture, aria-expanded and a visible calendar. It does not assert the stored value. apps/www/src/registry/components/editor/date.tsx preserves the opening gesture and writes the value only from Calendar onSelect. The browser test was read, not rerun.

- `EDIT-DATE-MDX-001` `locked`

```text
Date: <date value="2024-01-01" />
```

note: a stored day writes the `value` attribute form and reads back as the same day
note: the reader also accepts `<date>` child text and `<date text="…" />`, and
reads `toDateString()` text in child text or a `value` attribute as its day when
the weekday matches
note: authored text writes as a `text` attribute and reads back as written

## TOC

Authority:

- syntax: local MDX TOC contract
- primary UX ref: Notion for block shell and insertion
- secondary refs: Typora for token-style TOC expectations, Google Docs for
  heading navigation

Ownership:

- TOC is a local atomic block contract
- TOC is a block void atom
- TOC owns atomic selection and destructive behavior around its boundary
- generated TOC entries are overlay / no-node controls hosted by the TOC block
- generated TOC entries are navigation controls, not editor text positions or
  block-selection targets

Plugin surface:

- TOC plugins expose insertion and observer/rendering surfaces
- this section defines current block behavior after a TOC already exists

- `EDIT-TOC-INSERT-001` `locked`

```text
paragraph
=>
paragraph
[toc]
```

note: insert a void TOC block at the requested position
note: TOC boundary keyboard behavior is a local contract informed by
Notion-like block conventions

- `EDIT-TOC-NAV-001` `locked`

```text
plain activate generated toc item
=>
jump to heading
```

note: TOC entries should navigate to their target headings and stay live as the
heading set changes
note: TOC navigation should also use the shared navigation-feedback primitive
note: the TOC lists a Details title that has a heading level as a heading of
that level, in document order
note: activating an entry inside a collapsed Details opens every Details whose
body holds it, then jumps to it; the Details whose title is the entry stays as
it is
note: in both editable and readonly documents, plain TOC activation is
navigation-only
note: plain TOC activation must not place a caret in the landed heading,
synthesize block selection, or switch the editor into another editing mode

- `EDIT-TOC-NAV-002` `locked`

```text
focus generated toc item
press ↵ / Space
=>
jump to heading
```

note: generated TOC items should be keyboard-focusable controls with the same
navigation result as pointer activation
note: keyboard activation should not trap focus in hidden editor-selection
helpers or fabricate a landed text selection

- `EDIT-TOC-NAV-003` `locked`

```text
scroll / edit in same document
=>
no toc item marked current
```

note: the TOC block lists every heading in one style; it does not mark or
highlight the heading in view while the user scrolls or edits

- `EDIT-TOC-*` `locked`

```text
[toc]
```

note: delete and movement treat TOC as an atomic block, not editable inline
content

note: `⌫` at the start of the block after a TOC moves the selection onto the TOC instead of deleting through it

note: `↑` from the start of the block after a TOC selects the TOC instead of entering its empty child

note: `⇥` on a selected TOC moves focus onward or falls through; it never tabs into TOC text

- `EDIT-TOC-ENTER-201` `proposed` `↵`: with the selection on a TOC block, whether a caret in its empty child or the whole TOC selected, `↵` keeps the TOC atomic: it creates no text inside the TOC, inserts an empty block of the parent's declared default type after it and puts the caret at that block's end; when the parent cannot hold another block, `↵` changes nothing

```text
[toc] (selected)
next
=>
[toc]
|
next
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: local MDX TOC contract; primary UX ref: Notion for the block shell; secondary ref: `EDIT-HR-ENTER-001`, where `↵` on an atomic block creates the parent's declared default block after it
Source: c70bacbd4a7523ae3ebfd820cec0ea8ec228e9ad:docs/editor-behavior/editor-protocol-matrix.md:340
Proof: `packages/platejs/src/features/toc/lib/BaseTocPlugin.spec.ts:137` "inserts a paragraph after the toc on Enter" puts the caret in the TOC's empty child, runs `break.insert` and asserts the TOC, an empty paragraph and `after`, with the caret at offset 0 of `[1, 0]`, which proves the rule at model level, with no keydown; tag candidate. Code: `packages/plitejs/src/editor/insert-break.ts:69` hands a caret in a block void to `packages/plitejs/src/editor/block-void-break.ts`, which inserts the parent's default block after it and selects it. Drift: a node selection on the TOC makes `↵` do nothing (`packages/plitejs/src/editor/insert-break.ts:54`), so only the caret-in-child form of a selected TOC meets the rule. Checked 2026-10-08.

## Columns

Authority:

- syntax: local MDX column contract
- primary UX ref: Notion
- secondary ref: docs reference

Ownership:

- columns are local layout containers
- columns yield to stronger child owners before claiming tab or delete behavior

Plugin surface:

- column plugins expose toggle and set-column transforms
- this section defines current container law, not the full layout UI surface

- `EDIT-COLUMN-TOGGLE-001` `locked`

```text
paragraph
=>
[column-group]
  [column] paragraph
  [column] |
```

note: toggling a paragraph into columns moves the original content into the first column and creates empty siblings
note: column keyboard ownership and select-all escalation are local layout-contract choices, not a proven public editor standard

- `EDIT-COLUMN-SET-001` `locked`

```text
[column-group 2]
=>
[column-group N]
```

note: updating the column count preserves existing content and redistributes widths

note: the first `⌘+A` with the selection in a column's text selects that column

note: a second `⌘+A` with a column selected selects its column group

note: `↵` in a paragraph inside a column splits it inside the same column and keeps the column group intact

## Media And Caption

Authority:

- syntax: local media and caption contracts
- primary UX ref: Notion
- secondary ref: Google Docs for file-ish behavior

Ownership:

- media blocks are non-void object owners around asset
  selection, direct inline caption editing, and deletion
- `NodeSelection` at the media path focuses the asset
- `TextSelection` inside the media children edits the caption
- a media object remains meaningful with an empty caption; generic split does
  not duplicate its owner
- `NodeSelection` copies or cuts the complete media owner, while caption
  `TextSelection` transfers only its open child content
- Enter in the caption moves its unselected suffix to a fresh paragraph after
  the media owner; the same rule applies to expanded selections starting in
  the caption, including selections extending into the following paragraph

Plugin surface:

- media plugins expose insert and embed/upload surfaces
- media schema and behavior own direct inline caption children; no caption
  plugin, node type, key, or content root exists
- renderers keep only the asset chrome non-editable and render the ordinary
  media child slot as the caption
- renderers keep an empty `[{ text: '' }]` caption hidden until a
  `TextSelection` enters it, so selecting the asset does not shift the layout;
  placeholder visibility does not change the document
- current markdown/MDX contract keeps supported MDX attributes on round-trip
- current media embed contract persists one canonical render `url` plus current
  normalized provider metadata:
  - `provider`
  - `id`
  - optional `sourceUrl` when the edit surface needs the user-facing source URL
- current allowlisted transform paths may also extract a canonical embed URL
  from selected sharing snippets such as Twitter / X embed markup
- provider-specific previews, upload draft slots, and caption UI are current
  app/render-layer behaviors layered on top of that contract
- current package behavior includes embed-url normalization and keyed
  upload draft completion when the upload surface is enabled
- current Plate media law does not define Typora-style file-system actions such
  as delete image file, move image file, copy image file, or bulk path rewrites
  from editor chrome
- media embeds and dropped video/audio sources should follow the same
  path-policy family as images when the current package surface supports it
- richer media authoring should stay in that same family instead of splitting
  image, local video/audio, upload, and current embed insertion into unrelated
  path models
- selected script-based embed support may exist through explicit allowlisted
  extraction into canonical embed URLs
- broader script-based embed behavior should stay explicit and sandboxed /
  allowlisted instead of becoming open-ended executable embed behavior
- PDF-in-iframe should not be assumed as a baseline supported path just because
  generic iframe syntax exists
- broader script-based embed behavior, PDF iframe support, richer embed chrome, and path-policy or product behavior beyond the current `url` / `provider` / `id` / optional `sourceUrl` contract are outside the contract

Media and caption are local contracts informed by Notion-style media blocks and
Google Docs-style file behavior.

- `EDIT-MEDIA-*` `locked`

```text
insert media
=>
[media block]
```

note: media insertion creates the chosen media node shape and preserves MDX
attributes on markdown round-trip; it stores direct inline children and uses
`[{ text: '' }]` when the caption is absent

note: an upload batch from a picker, paste or drop is validated whole before mutation, inserts its keyed `upload` drafts atomically and starts transport only after commit

note: completing an upload keeps the draft and child keys, replaces the draft with the installed media type in skipped history, and lets undo and redo replay the document without restarting transport

note: an unresolved upload draft keeps `{ type, kind, children }` in document-owned formats, gets a fresh runtime identity on copy, and is omitted from HTML, plain-text and static output

- `EDIT-MEDIA-*` `locked`

```text
next block start + ⌫ after media
```

note: destructive movement creates a `NodeSelection` on the media asset instead
of deleting through it

note: inserting an embed with a selection places it at the selection's parent path as the next block

note: inserting an embed with no selection changes nothing

- `EDIT-MEDIA-UPLOAD-UNCONFIGURED-301` `proposed` `paste or drop of image files`: with no upload transport configured, the files are ignored: nothing is inserted and the document stays unchanged

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: local media and caption contracts; primary UX ref: Notion; secondary ref: Google Docs for file-ish behavior
Source: c70bacbd4a7523ae3ebfd820cec0ea8ec228e9ad:docs/editor-behavior/editor-protocol-matrix.md:428
Proof: the image owner reads only `text/plain` on paste and passes files on (`packages/platejs/src/features/media/lib/image/BaseImagePlugin.ts:432-451`), and the upload owner rejects a batch with no client as a `missing-client` configuration failure after its file-type check, inserting nothing (`packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts:707-722`). `packages/platejs/src/features/upload/lib/BaseUploadPlugin.lifecycle.spec.ts:136` "reports missing client without inserting a slot or creating a task" asserts the value unchanged, no task and one `missing-client` failure, but calls `submit` directly with a `.txt` file; `packages/platejs/src/react/features/upload/UploadPlugin.spec.ts:71` "leaves native file drops to the DnD owner by default" drops an image on an unconfigured upload owner and asserts only that the drop is not prevented. A model probe on 2026-10-08 (Bun, package source) pasted `image.png` with an unconfigured upload owner, and with none, and both inserted nothing. No test pastes or drops an image file without a client, and the copied `UploadKit` always configures one. Checked 2026-10-08.

- `EDIT-MEDIA-UPLOAD-NOFILES-301` `proposed` `paste or drop with the upload owner installed`: data that carries no files passes the upload owner untouched and continues to the editor's ordinary insert-data handling

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: local media and caption contracts; primary UX ref: Notion; secondary ref: Google Docs for file-ish behavior
Source: c70bacbd4a7523ae3ebfd820cec0ea8ec228e9ad:docs/editor-behavior/editor-protocol-matrix.md:429
Proof: the upload owner calls `next()` when no files arrive (`packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts:880-887`), and a model probe on 2026-10-08 (Bun, package source) pasted `text/plain` `hello` with a configured upload owner and got the text inserted; none of the nine specs that install the upload owner pastes file-less data. The image owner's own pass-through is proven by `packages/platejs/src/features/media/lib/image/BaseImagePlugin.spec.tsx:246` "leaves clipboard data without files to the next handler" and `:213` "leaves non-image text to the next clipboard handler: %s", without an upload owner. Checked 2026-10-08.

- `EDIT-MEDIA-SELECTALL-CHROME-001` `proposed` `Mod+A from document text`: an expanded document text selection that crosses images must not activate each image's individual asset-selection ring. The document range remains a text selection; selecting image content as part of that range is distinct from picking its asset.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; asset focus must not misrepresent an expanded document text selection
Authority: syntax: local media and caption contracts; primary UX ref: Notion; secondary ref: Google Docs for file-ish behavior; inherited family references, with no reference editor checked for this case
Source: c70bacbd4a:docs/plans/2026-05-12-plite-use-element-selected-collapsed-mode-ralplan.md:153-164
Proof: apps/plite/tests/plite-browser/donor/examples/images.test.ts, 'selects image editor text content from text focus with keyboard select all', presses Mod+A and asserts the document range, selected text and boxShadow: none on both images. This proves a raw Plite block-void example only. Current Plate apps/www/src/registry/components/editor/media-image.tsx gates the ring on useElementSelected({ mode: 'object' }); packages/plitejs/src/react/hooks/use-element-selected.ts rejects text ranges in that mode. No inspected browser case proves this exact gesture for Plate's non-void media owners.

- `EDIT-CAPTION-NAV-001` `locked`

```text
↓ from media NodeSelection
with caption text the page draws
=>
TextSelection at caption start

↓ from media NodeSelection
with caption text the page does not draw
=>
the next block's first keyboard stop, or the same media NodeSelection when
nothing follows
```

note: `ArrowDown` moves from asset focus into the media element's direct inline
children while the page draws them. The stock caption hides an empty caption
even while its media is selected, so `ArrowDown` from stock media enters only a
populated caption. Whether the page draws the caption comes from the mounted
DOM, not from its text.

- `EDIT-CAPTION-NAV-002` `locked`

```text
↑ from caption-start TextSelection
=>
media NodeSelection
```

note: `ArrowUp` at the caption start returns focus to the asset

- `EDIT-CAPTION-NAV-003` `locked`

```text
text before media + →
=>
media NodeSelection + →
=>
TextSelection at caption start
```

note: horizontal movement treats the owner as a separate keyboard stop before
its editable children. Forward movement from the owner enters caption text the
page draws and otherwise moves on to the next stop. Reverse movement visits
caption end, then the owner, then the preceding text. Caption text the page
does not draw, empty or populated, has no stop, so reverse movement stops on the
owner. The physical arrow keys follow
the computed direction of the block that holds the caret, or of the selected
media. They reverse in an RTL block inside an LTR editable, and this logical
order stays the same.

- `EDIT-CAPTION-NAV-004` `locked`

```text
↓ from the final visual line of text immediately before media
with a populated caption
=>
media NodeSelection + ↓
=>
the caption entry of EDIT-CAPTION-NAV-001
```

note: vertical movement through earlier lines stays in the text block. The
selectable asset is a keyboard stop before its direct caption children.

- `EDIT-CAPTION-NAV-005` `locked`

```text
↑ from the first visual line of text immediately after media
with caption text the page draws
=>
TextSelection in the caption + ↑ from its first visual line
=>
media NodeSelection
```

note: the caption text may be populated or empty. Vertical movement through
later lines stays in the following text block. Caret geometry chooses a caption
offset from the horizontal position, and vertical movement through a wrapped
caption remains in its text until its first visual line.

- `EDIT-CAPTION-NAV-006` `locked`

```text
↑ from the first visual line of text immediately after media,
or from a media NodeSelection immediately after it,
with caption text the page does not draw
=>
media NodeSelection + ↓
=>
the caption entry of EDIT-CAPTION-NAV-001
```

note: the stock caption hides an empty caption until it holds the caret, so
reverse vertical entry stops on the selectable asset and the next `ArrowDown`
moves past the hidden caption. The media toolbar's Caption button puts the
caret in an empty caption. Captions an app
hides with CSS follow the same rule. Whether the page draws the caption comes
from the mounted DOM, not from its text.

- `EDIT-CAPTION-DELETE-001` `locked`

```text
select all caption text + Delete
=>
empty caption TextSelection; same media owner remains; placeholder visible
```

note: a text range wholly inside direct caption children edits those children,
even when it spans all their text. Deleting the media owner requires its
`NodeSelection`.

- `EDIT-CAPTION-EMPTY-001` `locked`

```text
media children = [{ text: '' }]
=>
placeholder visible during caption TextSelection or asset NodeSelection;
caption hidden after focus leaves the media
```

note: empty-caption visibility is render state; copy, cut, delete, undo,
collaboration, and serialization keep the direct children with their media
owner

- `EDIT-CAPTION-ENTER-001` `locked`

```text
media caption = he|llo + ↵
=>
media caption = he; next paragraph = llo
```

note: Enter moves the open caption suffix without creating a second media
owner or inheriting media properties on the paragraph

## Styling And Layout

Authority:

- syntax: local style contracts
- primary UX ref: Google Docs
- secondary ref: Notion

Ownership:

- styling and layout do not replace stronger structural owners
- they layer style state onto blocks or marks after the active structure owner
  resolves

Plugin surface:

- indent and style plugins expose set, clear, and mark/block transforms
- this section defines the current law for those transforms, not every toolbar
  or UI surface

Styling and layout use Google Docs as the strongest UX reference, but the
stored shape is still local contract.

- `EDIT-INDENT-*` `locked`

```text
⇥ / ⇤ on paragraph
```

note: paragraph indent stays editor-owned unless a stronger local owner wins

- `EDIT-ALIGN-*` `locked`

```text
set text align
clear text align
```

note: alignment is a block-style contract informed by document editors

- `EDIT-TEXT-INDENT-*` `locked`

```text
set text indent
clear text indent
```

- `EDIT-LINE-HEIGHT-*` `locked`

```text
set line height
clear line height
```

- `EDIT-STYLE-*` `locked`

```text
font family / size / weight / color / background
```

note: these are local mark-style contracts informed by document-style formatting

- `EDIT-STYLE-FIELD-COMMIT-ONCE-001` `proposed` `Enter, size choice or blur in the font-size field`: committing a valid uncommitted font-size draft consumes it once and applies formatting to the retained editor selection. If Undo reverses that formatting, a later blur caused by restoring editor focus must not apply the consumed draft again.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; focus changes must not silently undo the user's Undo
Authority: syntax: local style contracts; primary UX ref: Google Docs; secondary ref: Notion; inherited family references, with no reference editor checked for this case
Source: c70bacbd4a:docs/plans/2026-09-08-multi-editor-architecture-and-api-review.md:179
Proof: apps/www/src/registry/components/editor/font-size-toolbar-button.tsx clears inputDirtyRef before applying a size and ignores clean drafts on blur. apps/www/src/registry/components/editor/mark-toolbar-button.spec.tsx tests input and size-choice commits with mocked plugin calls; apps/www/tests/browser/multi-editor.spec.ts tests a blur commit to the correct editor. Neither inspected test performs the required commit, Undo and later-blur sequence. The complete history requirement currently rests on source inspection, not a current replay.

- `EDIT-STYLE-FONT-SIZE-SELECTION-001` `proposed` `change font size through the toolbar`: formatting preserves the selected text and selection direction. While focus remains in toolbar chrome, the editor paints one inactive selection fitted to the resized text, without an additional native highlight or stale old-size paint. Choosing a size closes the size popup.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; formatting must retain its target and show that target without misleading selection paint
Authority: syntax: local style contracts; primary UX ref: Google Docs; secondary ref: Notion; inherited family references, with no reference editor checked for this case
Source: docs/plans/5091-current-stale-selection-paint-regression.md:259-285
Proof: tooling/e2e/font-size-selection.test.ts, 'font-size command refreshes expanded selection paint (#5091)', contains assertions for resized text, one painted layer, preserved selection direction and empty native selection. Proof drift: its input[data-editor-focus="true"][value="16"] locator no longer matches apps/www/src/registry/components/editor/font-size-toolbar-button.tsx, whose Input uses data-editor-keep-selection-visible. That test cannot currently be treated as browser proof without repair and replay. apps/www/src/registry/components/editor/mark-toolbar-button.spec.tsx proves only mocked formatting calls without forced editor focus.

- `EDIT-STYLE-SELECTION-PAINT-001` `proposed` `change the font size of text represented by an expanded native selection`: preserve the selection's model endpoints and direction, and make the settled native highlight fit the resized text. Correct model offsets or DOM Range rectangles alone do not satisfy the paint requirement. The selection stays expanded; only the requested formatting changes. While toolbar chrome owns focus, inactive presentation instead follows EDIT-STYLE-FONT-SIZE-SELECTION-001.

```text
abc[[def]]ghi, with an expanded native selection at font size 16
set the selected text to font size 24 while editor selection remains native
=>
abc[[def]]ghi, with the same anchor and focus
selected text and its native highlight use the new size
```

Classification: invariant within formatting and selection presentation, by the tests in docs/vision/plate.md:151-160; formatting must retain its target and accurately display the retained selection.
Authority: syntax: local style contracts; primary UX ref: Google Docs; secondary ref: Notion. These inherit Styling And Layout's references; no reference editor was checked for this paint case.
Source: docs/plans/5091-stale-selection-geometry-after-font-size-change.md:225-233
Proof: `tooling/e2e/font-size-selection.test.ts`, "font-size command refreshes expanded selection paint (#5091)", checks selected text and direction before and after toolbar formatting, but its final oracle requires an inactive overlay and an empty native selection. Its input[data-editor-focus="true"][value="16"] locator also disagrees with the current marker in `apps/www/src/registry/components/editor/font-size-toolbar-button.tsx`. It therefore does not prove this native-highlight requirement. `packages/plitejs/src/react/editable/selection-controller.ts` exports model endpoints in selection direction, but `packages/plitejs/src/dom/utils/selection-writes.ts` deliberately skips a native selection write when endpoints already match; source inspection cannot establish whether the browser repaints correctly after resizing. No inspected current test proves the native pixels. Test read, not run.

## Collaboration And Review

Authority:

- syntax: editor-only contract
- primary UX ref: Google Docs
- secondary ref: Notion

Ownership:

- collaboration markers are metadata layers over normal editing, not standalone
  structural owners
- suggestion and comment behavior wraps normal editing instead of replacing it

Plugin surface:

- comment and suggestion packages expose real plugin surfaces today
- discussion anchors and Yjs presence follow the law below; [current-evidence.md](./current-evidence.md) records which of it has current proof

- `EDIT-COMMENT-*` `locked`

```text
create / remove comment mark
```

note: comments attach metadata to text ranges and stay excluded from markdown
serialization

- `EDIT-COMMENT-HISTORY-PENDING-001` `locked`: when comment creation sits at the undo head and its live-session removal is awaiting persistence, typing, repeated undo or a remote update keeps editor changes live, returns `busy` for the overlapping replay, settles the claimed comment entry in call order, and preserves the same head after a refusal or a failed settlement

- `EDIT-COMMENT-EDIT-301` `proposed` `typing, deleting, splitting, merging or moving commented text`: the comment stays attached to what remains of its range, text typed at either edge of the range stays outside it, and comments whose ranges overlap each keep their own range through the same edits

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion
Source: c70bacbd4a7523ae3ebfd820cec0ea8ec228e9ad:docs/editor-behavior/editor-protocol-matrix.md:396
Proof: `packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts:1325` "maps attachments through block move, split and merge without a view" asserts one comment range keeps covering `lph` through `nodes.move`, `nodes.split` and `nodes.merge` calls rather than keys, and the browser tests in `apps/www/tests/browser/comment.spec.ts` "interior insertion and deletion keep overlapping comments exact through history" (two overlapping comments both gain a typed `X` and lose a deleted character, through undo and redo) and "inward comment boundaries exclude text inserted on either side" (text typed at both edges of one comment stays outside) prove typing, deleting, the edges and overlap; tag candidates. Overlapping ranges through a move, split or merge are unproven, and the browser suite runs outside `pnpm check`. Checked 2026-10-08.

- `EDIT-COMMENT-DELETE-HISTORY-001` `proposed` `delete all text targeted by a published comment, then Undo or Redo`: complete deletion keeps the conversation discoverable with an unavailable target and highlights no unrelated text. Undo restores the comment's exact former range; Redo restores the deleted-target state. Repeated cycles must not move the attachment onto other text.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; deleting a target must neither lose its conversation nor attach it to unrelated content
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-09-03-plite-comment-anchor-edit-and-history.md:217-246
Proof: apps/www/tests/browser/comment.spec.ts, 'a fully deleted comment stays reachable and exact through repeated history', deletes a one-character target, checks its unavailable conversation and absent highlight, types unrelated text without reattaching it, and checks exact restoration and deletion over five history cycles. packages/platejs/src/features/comments/BaseCommentsPlugin.ts retains the thread and reports a collapsed attachment as unavailable. This is an inspected browser test, not a rerun.

- `EDIT-COMMENT-COMPOSER-FIRST-KEY-001` `proposed` `open New comment from the fixed toolbar, selection toolbar or native shortcut`: opening the composer transfers focus and the native caret to its inner editor before the first printable key after the trigger. That key inserts exactly once in the composer without another click or refocus. Opening preserves the source document and its selected range.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; opening an editing control must not send its first character into the source document
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion; inherited family references, with no reference editor checked for this case
Source: c70bacbd4a:docs/plans/2026-09-14-issue-5127-comments-inactive-selection-regression.md:499-503
Proof: apps/www/tests/browser/comment.spec.ts, 'Issue 5127 keeps a multi-line selection visibly painted while the comment composer owns focus', covers all three entry paths, waits for composer focus, inserts x and asserts unchanged source value. That wait does not prove immediate first-key delivery or exactly-once native input. apps/www/src/registry/components/editor/discussion.tsx enables autofocus after popup placement; packages/plitejs/src/react/editable/runtime-root-engine.ts applies it in a layout effect, and packages/plitejs/src/dom/plugin/dom-editor.ts owns native focus settlement. The trigger-to-first-key timing remains unproved by the inspected current test.

- `EDIT-COMMENT-COMPOSER-SELECTION-VISIBILITY-001` `proposed` `focus New comment over a source selection`: while the composer owns focus, the complete visible source range retains one inactive-selection paint layer. The composer clears every selected line, including the final line of a multiline selection, and remains within the viewport. The source content and selected range stay unchanged.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; the composer must not hide or duplicate the selection it annotates
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion; inherited family references, with no reference editor checked for this case
Source: c70bacbd4a:docs/plans/2026-09-14-issue-5127-comments-inactive-selection-regression.md:535-537
Proof: apps/www/tests/browser/comment.spec.ts, 'Issue 5127 keeps a multi-line selection visibly painted while the comment composer owns focus', asserts the selected text, composer focus, popup placement below the selected bounds, vertical viewport bounds and pixels against single, absent and duplicate paint controls. Its fixture does not cover every viewport or selection geometry. apps/www/src/registry/components/editor/discussion.tsx anchors to the last nonempty client rect and constrains popup dimensions. The browser test was read, not rerun.

- `EDIT-REVIEW-HOVER-SCROLL-001` `proposed` `scroll upward across comments or suggestions beneath a stationary pointer`: with the editor selection elsewhere in the document, an annotation entering beneath the pointer retains hover feedback without snapping the viewport back toward that selection. Hover changes neither document content nor selection or focus, and subsequent upward scrolling remains usable.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; passive annotation feedback must not take over document navigation
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-08-29-comment-suggestion-scroll-jump-regression.md:377-399
Proof: source inspection only for this complete interaction. apps/www/src/registry/components/editor/comment.tsx and apps/www/src/registry/components/editor/suggestion.tsx implement the relevant feedback with native CSS hover. The source plan's annotation-hover component test is no longer present at its cited path, and its recorded Chrome result is not current proof. No current scroll sequence was replayed.

- `EDIT-COMMENT-CANCEL-301` `proposed` `click document text to dismiss an unsubmitted comment`: dismissal discards the pending comment, preserves existing comments and keeps the live collapsed caret created by the click. It must not restore the earlier expanded comment target. Typing without another click inserts at that caret.

```text
pending composer targets [[modern]] elsewhere
click rich-t|ext, then type X
=>
rich-tX|ext
pending comment discarded; existing comments retained
```

Classification: invariant, by the tests in docs/vision/plate.md:150-160; canceling a draft must not overwrite the user's newer caret
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion; inherited family references, with no reference editor checked for this case
Source: docs/plans/5112-comment-popover-lifecycle-regression.md:267-270
Proof: packages/platejs/src/features/comments/BaseCommentsPlugin.ts cancels by releasing the pending anchor and publishing no pending composer, without setting selection. apps/www/src/registry/components/editor/discussion.tsx invokes cancellation on dismissal and avoids final-focus restoration when another connected target owns focus. The historical named cancellation case is absent from the inspected current apps/www/tests/browser/comment.spec.ts. Source inspection supports ownership; no current test inspected proves the complete click, caret and follow-up typing sequence.

- `EDIT-COMMENT-HISTORY-ORDER-501` `proposed` `create a local comment, then Undo or Redo`: successful local comment creation joins document undo order after persistence commits. For document edit A, comment creation B and document edit C, Undo visits C, B, A and Redo visits A, B, C. Replaying B restores the same comment identity without changing unrelated document text. Remote comment changes do not enter this local order. This rule concerns live-session creation, not persisted undo or reply/edit history.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; local history must preserve action order and comment identity
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-09-19-taskhub-22-comment-creation-undo-redo-regression.md:168-177
Proof: packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts, 'orders successful local thread creation with document undo and redo', asserts three entries, both replay orders and one restored thread with the same ID. apps/www/tests/browser/comment.spec.ts, 'local comment creation shares document undo order and keeps composer history local', drives the corresponding native shortcuts. packages/platejs/src/features/comments/BaseCommentsPlugin.ts emits its creation-history effect only after an applied local commit. The inspected ordering cases do not independently prove remote-history exclusion. Tests were read, not rerun.

- `EDIT-COMMENT-HISTORY-FOCUS-501` `proposed` `Undo or Redo shortcut`: while the comment composer owns focus, history shortcuts act on its inner editor and leave outer document history untouched. From the main editor or its page history route, the shortcuts act on outer document history, including successful local comment creation.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; history must follow the active editor instead of undoing another editor's work
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-09-19-taskhub-22-comment-creation-undo-redo-regression.md:178-179
Proof: apps/www/tests/browser/comment.spec.ts, 'local comment creation shares document undo order and keeps composer history local', undoes composer typing without changing the document, then drives outer creation Undo and Redo after returning to the main editor. It does not exercise composer Redo or a page-only shortcut route. apps/www/src/registry/components/editor/comment.tsx creates a separate composer editor; apps/www/src/registry/components/editor/history-toolbar-button.tsx targets its supplied editor. The browser test was read, not rerun.

- `EDIT-COMMENT-RESOLVE-TOOLBAR-001` `proposed` `resolve a submitted comment, then select and format text`: successful resolution closes its discussion without changing document text or leaving an invalid native selection. A subsequent valid expanded text selection can open the floating toolbar, and a formatting action there applies to that new selection.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; resolving a conversation must not disable subsequent text editing
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion; inherited family references, with no reference editor checked for this case
Source: docs/plans/5112-resolve-comment-floating-toolbar-regression.md:285-309
Proof: packages/platejs/src/features/comments/BaseCommentsPlugin.ts changes thread resolution metadata; apps/www/src/registry/components/editor/discussion.tsx owns discussion visibility and focus settlement, and apps/www/src/registry/components/editor/floating-toolbar.tsx opens from a valid expanded native range and scoped editor focus. The historical resolve-then-Bold case is absent from the inspected current apps/www/tests/browser/comment.spec.ts. No inspected test proves this complete recovery sequence, and no browser replay ran.

- `EDIT-COMMENT-ACTIVE-CLEAR-146` `proposed` `click unmarked content inside the editor`: clear the active comment group without deleting conversations or changing document content. Comment activation must not replace the caret or text selection produced by ordinary click handling.

Classification: product policy, by the tests in docs/vision/plate.md:151-160; clearing comment activation on an unmarked click is this editor's interaction policy.
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion. These inherit Collaboration And Review's references; no reference editor was checked for this activation policy.
Source: docs/plans/2026-09-02-comments-discussion-product-recovery.md:155
Proof: `packages/platejs/src/react/features/comments/CommentsPlugin.spec.tsx`, "activates the ordered group at the clicked point and clears outside comments", invokes the click pipeline on an unmarked span inside the editor root and asserts an empty activeIds array. It does not assert document content, conversation retention or the resulting caret. `packages/platejs/src/react/features/comments/CommentsPlugin.ts` calls setActive([]) when the click has no contained comment element and makes no selection or document write. This is handler-level DOM proof, not a native browser click replay. Test read, not run.

- `EDIT-COMMENT-OVERLAP-ACTIVATE-146` `proposed` `click commented text at a resolved model point`: activate every comment covering that point in deterministic source order. A single comment identifier on the clicked DOM element must not reduce an overlapping group to one thread. Activation changes neither document content nor the selection produced by the click. This rule does not decide unresolved-point fallback.

Classification: invariant within point-based comment-group activation, by the tests in docs/vision/plate.md:151-160; the activated group must represent the complete hit result.
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion. These inherit Collaboration And Review's references; no reference editor was checked for this case.
Source: docs/plans/2026-09-02-comments-discussion-product-recovery.md:197
Proof: `packages/platejs/src/react/features/comments/CommentsPlugin.spec.tsx`, "activates the ordered group at the clicked point and clears outside comments", mocks point resolution inside two overlapping ranges, clicks an element carrying only the overlap ID, and asserts activeIds ['first', 'overlap'] and active decoration attributes for both. `packages/platejs/src/react/features/comments/CommentsPlugin.ts` uses idsAt at the resolved point; `packages/platejs/src/features/comments/BaseCommentsPlugin.ts` sorts indexed hits by sourceOrder. The test does not assert caret or content preservation and supplies a mocked DOM-to-model resolution. Test read, not run.

- `EDIT-COMMENT-COMPOSER-ENTER-001` `proposed` `Enter in a comment composer`: outside composition, unshifted Enter invokes the submission path and never inserts a paragraph, including for an empty draft, a refused submission or a pending submission. A refused submission retains the draft; pending submission admits no duplicate request. The key creates no split-related caret movement. Shift+Enter retains the composer's line-break behavior, and composition Enter does not submit.

Classification: product policy, by the tests in docs/vision/plate.md:151-160; Enter-to-submit and Shift+Enter-to-break belong to this comment-composer interaction policy.
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion. These inherit Collaboration And Review's references; no reference editor was checked for this key policy.
Source: docs/plans/2026-09-05-comments-improve.md:67
Proof: `apps/www/src/registry/components/editor/comment.spec.tsx`, "keeps the paragraph intact when Enter submits a comment (%s)", covers empty, rejected, invalid, stale, error and pending outcomes with a mounted composer. It dispatches Enter, asserts one paragraph and unchanged text, checks submission counts, and verifies that a pending form submission adds no duplicate request. It does not assert caret endpoints or exercise Shift+Enter and composition Enter. `apps/www/src/registry/components/editor/comment.tsx` prevents default and returns true for handled Enter, guards Shift and native composition, and protects pending submission with a ref and read-only composer state. Mounted synthetic-event proof only; test read, not run.

- `EDIT-SUGGESTION-*` `locked`

```text
insert / delete / accept / reject suggestion
```

note: suggestions wrap editing intent in metadata instead of committing content
changes immediately

- `EDIT-SUGGESTION-MD-301` `proposed` `Markdown serialization of a document holding suggestions`: the output carries document text only and never suggestion metadata

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion
Source: c70bacbd4a7523ae3ebfd820cec0ea8ec228e9ad:docs/editor-behavior/editor-protocol-matrix.md:398
Proof: `packages/platejs/src/markdown/lib/MarkdownPlugin.spec.ts:68` "exports authored documents only through explicit semantic projections" proposes the insertion ` draft` into `Base` and asserts that serializing without a projection throws, that the `accepted` projection writes `Base` with an `authored-lossy-projection` diagnostic, and that the `proposed` projection writes `Base draft` with no `plate-authored` markup, which proves the exclusion for an inserted suggestion; no test serializes a suggested deletion, mark or block change. Tag candidate. Code: the serializer requires the caller to name an `accepted` or `proposed` projection for any authored document (`packages/platejs/src/markdown/lib/MarkdownPlugin.ts:394-403`). Checked 2026-10-08.

- `EDIT-SUGGESTION-SELF-CANCEL-001` `proposed` `delete one's own pending inserted text`: deletion withdraws the selected part of the insertion instead of creating a deletion suggestion. When the insertion becomes empty, its review card and discussion trigger disappear, including from an open discussion. The caret remains at the deletion point. Undo restores the insertion and its review identity; Redo cancels them again. Another author's pending contribution remains independently reviewable.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; withdrawing one's proposal must not create a second proposal to delete it
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-09-13-suggestion-self-edit-regression.md:91
Proof: packages/plitejs/test/authored-tree-record.test.ts, 'removes one’s own pending insertion for real when deleting it', asserts partial withdrawal. apps/www/tests/browser/suggestion.spec.ts, 'removes a canceled own insertion from its open discussion and restores it through undo', asserts complete cancellation, model and DOM caret, absent deletion markup, card and trigger removal, and the same review ID after Undo before Redo cancels it. packages/plitejs/src/authored/tree/record.ts withdraws the writer's innermost insertion during deletion. Tests were read, not rerun.

- `EDIT-SUGGESTION-SPLIT-CANCEL-001` `proposed` `↵ followed immediately by ⌫ in Suggesting`: after suggesting a paragraph break in ordinary text, Backspace at the new paragraph's start restores the original paragraph and caret position. The canceled break's review card and discussion trigger disappear, including from an open card, and subsequent typing works at the restored caret. This simple inverse does not prescribe withdrawal across other pending structural changes.

```text
ab|cd (Suggesting)
↵, then ⌫
=>
ab|cd (no break suggestion)
```

Classification: invariant, by the tests in docs/vision/plate.md:150-160; canceling the writer's immediate structural proposal must not leave a residual review
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-09-13-suggestion-self-edit-regression.md:94
Proof: packages/plitejs/test/authored-tree-record.test.ts, 'withdraws one’s own pending split for real on Backspace', asserts the joined paragraph. apps/www/tests/browser/suggestion.spec.ts, 'clears an inserted paragraph break when Backspace immediately rejoins it', drives Enter and Backspace with the review open, asserts original blocks and model/DOM caret, absent card, trigger and deletion markup, and successful follow-up typing. packages/plitejs/src/authored/tree/record.ts owns structural withdrawal. Tests were read, not rerun.

- `EDIT-SUGGESTION-FOREIGN-RESTORATION-001` `proposed` `type matching text beside another author's pending deletion in Suggesting mode`: record the typed text as a separate contribution by the current author, even when it matches a prefix, suffix or all of the deleted text. Typing alone must not accept, reject or rewrite the other author's proposal. The caret follows the inserted text, and the two contributions remain subject to explicit review decisions.

```text
Bob's pending deletion: mark text
Alice types the matching prefix mark
=>
Bob's deletion remains pending and unchanged
Alice's mark is a separate pending insertion, with the caret after it
```

Classification: invariant, by the tests in docs/vision/plate.md:151-160; typing must not silently decide or rewrite another author's independently reviewable contribution.
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion. These inherit Collaboration And Review's references; no reference editor was checked in this pass for matching foreign deletion text.
Source: docs/plans/2026-09-14-suggestion-restoration-resolver.md:159
Proof: `packages/plitejs/src/authored/tree/record.ts` defines ownership by writer identity and records inserted text through suggestedTextProps with an insertion mark rather than deciding a foreign deletion. The inspected `packages/plitejs/test/authored-tree-record.test.ts` case "records a replacement as struck text followed by the new text" asserts separate delete and insert marks for one writer; "leaves already struck text unchanged when deleting it again" preserves another author's deletion under repeated deletion. Neither types matching text as a different author or checks the resulting caret and independent review sequence. The former exact matching-prefix test is retired. This rule has source support and adjacent Plite model tests, but no inspected current test proves its complete scenario; no test was run.

- `EDIT-DISCUSSION-*` `locked`

```text
anchor discussion to content
```

note: discussion anchors are editor-only references and stay outside markdown
serialization

- `EDIT-COLLAB-*` `locked`

```text
show remote cursor / presence
```

note: Yjs presence and remote cursor overlays are runtime collaboration state,
not persisted markdown content

- `EDIT-COLLAB-CURSOR-RENDER-401` `proposed` `receive or update remote presence`: an expanded remote selection paints every visible selected segment, including multiline, backward and RTL ranges, and shows one caret and label at its logical focus endpoint. A collapsed remote selection shows its caret and label without selection fill. Presence rendering changes neither document content nor the local selection.

Classification: invariant, by the tests in docs/vision/plate.md:150-160; presence must represent the remote range and its focus without misrepresenting a collapsed caret
Authority: syntax: editor-only contract; primary UX ref: Google Docs; secondary ref: Notion; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-08-30-cursor-find-overlay-architecture.md:1020
Proof: source inspection supports the intended ownership: packages/platejs/src/yjs/react/YjsPlugin.tsx excludes collapsed ranges from selection decorations, and apps/www/src/registry/components/editor/remote-cursor-overlay.tsx places the caret and label from focusRect. packages/plitejs/test/yjs/remote-cursor-geometry.spec.ts tests keyed geometry with mocked DOM rectangles, not multiline or RTL paint. No inspected test proves the complete rendering rule, and no browser replay ran.

## Cross-Surface Interaction Classes

These are editor-wide behaviors that cut across block families.

### Clipboard

- `EDIT-CLIPBOARD-*` `locked`

note: Typora is the primary winner for general markdown-first clipboard
behavior: copy should expose rich and plain forms together, and paste into the
editor should prefer the richest trusted source before falling back to markdown
source or plain text
note: Google Docs overrides Typora when table or broader document-fidelity
expectations are stronger than markdown-first text expectations
note: clipboard behavior should preserve the strongest available structure for
the current selection instead of flattening rich content to plain text by
default

note: pasting a link, image or media with an unsafe URL drops only the destination or source, keeps the label, alt text or caption and reports the removal; removing a script URL is lossless

note: paste reports content it left out once to the initiating editor after commit, or when nothing inserts; copied UI warns for lossy loss and stays silent for lossless cleanup

- `EDIT-CLIPBOARD-COVERAGE-EXCLUDE-001` `proposed` `copy across hidden content`: copying a selection that crosses content the app has hidden with an `exclude` copy policy leaves that content out of the plain text, the HTML and the editor fragment, while hidden content with a `model` copy policy is copied from the document even though it is not mounted

Classification: parameter, by the tests in docs/vision/plate.md:129-137; the app picks the copy policy for each hidden range, and copy honoring that policy is an invariant
Authority: syntax: none; primary UX ref: Google Docs for document-fidelity copy; secondary ref: the 2026-09-11 large-documents contract
Source: docs/plite/research/2026-09-11-large-documents-contract/promoted-ledger.tsv:5
Proof: Plite level only: `packages/plitejs/test/dom/clipboard-boundary.ts:1624` "composes model and exclude coverage into every clipboard mimeType", run by `packages/plitejs/test/dom/clipboard-boundary.test.ts`, registers `model` and `exclude` boundaries by hand, calls `writeDOMRangeData` and asserts plain text without the excluded block, HTML without it and a fragment of blocks 0, 1 and 3, but every block is mounted, so it misses the unmounted clause; `apps/plite/tests/plite-browser/donor/examples/dom-coverage-boundaries.test.ts:267` "keeps hidden model updates out of the DOM but available to model-backed copy" proves `model` copy of unmounted content through the example's Copy button, and no browser test covers `exclude`. Code: `packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts:243-275` cuts `exclude` ranges out of the copied slice. Plate reaches the policy only through Plite's `slots.contentBoundary({ copyPolicy })`, its copied details component uses `copyPolicy: 'model'` (`apps/www/src/registry/components/editor/details.tsx:61-74`), and no Plate test copies across a boundary. The source row's note that mixed copy includes excluded text is stale. Checked 2026-10-08.

- `EDIT-CLIPBOARD-BLOCK-TYPE-001` `proposed` `paste of whole blocks`: pasting copied whole text blocks into an empty block, or into a document whose only block is empty, lands them with their copied type and properties, so a copied heading pasted into an empty paragraph stays a heading and copied block-void attributes survive; pasting a single block's text over selected text inside a non-empty block keeps the target block's type

```text
copy the whole block # Title
paste into an empty paragraph |
=>
# Title|
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: HTML clipboard input; primary UX ref: Typora for markdown-first paste, with Google Docs where document fidelity is stronger; secondary ref: ProseMirror (#231, #570, #788)
Source: c70bacbd4a:docs/editor-issue-harvester/prosemirror/full/checkpoints/issues-0219-0271.md:22
Proof: Plite core proves it for closed slices: `packages/plitejs/test/clipboard-contract.ts:1373` "slice replacement preserves a copied text-block type over an empty target block", `:1554` "slice replacement preserves a copied text-block type over a single empty document block", `:1648` "slice replacement preserves copied block void attributes over an empty target block" and `:2034` "preserves the target block type when replacing its selected text with a single text-block fragment", run by `packages/plitejs/test/architecture-contracts.test.ts`; `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:6048` "pastes a copied heading into an empty paragraph as a heading" passes only because that example's schema sets `slice.preserveContext` on headings. Drift: a model probe on 2026-10-08 (Bun, package source, happy-dom) copied a heading's text with Plate's own clipboard writer and pasted it into an empty paragraph, and into a document whose only block is empty, and both landed as paragraphs, because Plate's headings do not set `slice.preserveContext`, so the copied slice stays open; a node-selection copy, a closed `fragment.replace` and external `<h1>` HTML keep the heading, an image's attributes survive, and text pasted over a heading's selected text keeps the heading. The tagged Plate list-paste cases now prove the list-led multi-block and closed-slice exception in empty paragraphs and headings at any depth, as EDIT-CLIPBOARD-LIST-LANDING-001 defines. The tagged closed-object cases in `packages/plitejs/test/slice-fit-contract.test.ts` prove replacement of a semantically empty block inside a container or content root, whole-sequence schema admission, copied roots, metadata controls and history. They exclude a target that itself owns content roots. The single open heading example remains unproved and this broader rule stays proposed. Checked 2026-10-14.

- `EDIT-CLIPBOARD-LIST-LANDING-001` `locked` `paste or text drop of list items`: copied items whose parent was not copied land at the caret item's depth, or level one in a plain paragraph. A child keeps its depth offset from its nearest earlier copied parent. A plain block ends that ancestry and keeps its own indent. Only the first copied list may join a target of the same kind and heading role; joined roots take its marker style and continue its numbering. Copied starts remain unless an empty target supplies its own start or restart.

A list-led paste of two or more top-level blocks, or a closed slice, keeps its first item's type and properties in an empty paragraph or heading at any depth in the main document, when that position's schema admits the copied type. An empty plain line immediately below a compatible list continues it. A single open item's text, plain text and a selected block retain ordinary paste behavior. Open List promotion does not apply to callouts, toggles or targets in a content root. Generic closed-object placement can still replace an ordinary empty text block inside a container or content root when the complete copied sequence fits. It does not replace a block that itself owns content roots. Copies that omit an object's required roots stay on the open paste path and do not guarantee object type or list numbering. Text joins at an occupied caret, and one undo restores the pre-paste document. Under `maxLength`, the paste lands what fits. When the limit cuts the first copied item, the items left land at the caret's depth, and a wrapped list whose text no longer fits pastes nothing. A text drag lands at its drop point as this paste would, whether it copies or moves. A drag copies when it comes from another editor or a read-only view, or uses the copy modifier. A move keeps its lists as `EDIT-LIST-DROP-001` says, and a move that the length limit would cut lands nothing.

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: Plate's flat list model; primary UX ref: Notion for copied nesting and occupied text joins; secondary ref: ProseMirror and Lexical for sibling landing; empty-line type and restart precedence are the owner's accepted product policy
Source: docs/plans/2026-10-13-list-paste.md Design and Defaults, with the landing and length-limit Defaults of docs/plans/2026-10-14-pr-5168-redo.md, and the text move Defaults of docs/plans/2026-10-15-list-drag-landing.md
Proof: tagged cases in `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx` cover the six comparison fixtures and empty targets in paragraphs, headings, quotes, table cells and columns. `apps/www/tests/browser/list-keys.spec.ts` covers native Chromium copy/paste of depth-three siblings into an empty Roman item, rendered IV and V, caret, typing, source preservation and history. The same native suite covers an image-led list pasted into a nested empty paragraph or heading, with rendered image, caret, typing, unchanged source and one-step history. Tagged raw Plite cases cover empty lines inside named and element-owned roots. `packages/plitejs/test/slice-landing-contract.test.ts` covers the landing read: an admitted proposal with its discarded key and undo, a refused proposal with copied roots, proposals on forged targets, `maxLength`, kept target properties and a named-root view. Two tagged List cases cover the length limit at a list-item caret and over a wrapped list. Cross-quote-edge slices remain outside List promotion; partial rooted-object copies can omit the body or lose list numbering. For copied text drops, the tagged cross-editor drop in that List spec covers caret depth, child offset and a fresh list. The "list drop" case in `apps/www/tests/browser/list-keys.spec.ts` dispatches drag events for a Chromium copy drop on `/blocks/list-demo` and compares the result with a native paste at the same caret. For text moves, the tagged "BaseListPlugin text moves" cases in that List spec cover the drop item's depth, removal of the emptied source items and a moved image item, and the "text moves" cases in `packages/plitejs/test/transfer-contract.test.ts` cover a move the length limit cuts. The "list drop" move case in `list-keys.spec.ts` dispatches the same Chromium drag without the copy modifier and asserts the depths and rendered numbers. Checked 2026-10-15.

- `EDIT-CLIPBOARD-HTML-BLANK-001` `proposed` `HTML paste with blank lines`: pasting HTML keeps its blank lines: a `<br>` that stands alone as a line, such as `<div><br></div>` or the leading and trailing `<br>`s in `<div><br><br><div>CCC</div><div>DDD</div><br><br></div>`, becomes an empty paragraph, so `<div>a</div><div><br></div><div>b</div>` pastes as three paragraphs, `a`, an empty one and `b`

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: HTML clipboard input; primary UX ref: Typora for markdown-first paste, with Google Docs where document fidelity is stronger; secondary ref: ProseMirror (#1218, #1332)
Source: c70bacbd4a:docs/editor-issue-harvester/prosemirror/full/checkpoints/issues-1188-1218.md:46-48
Proof: Plate's HTML reader has the matching rule: `shouldBrBecomeEmptyParagraph` (`packages/platejs/src/lib/plugins/html/HtmlPlugin.ts:1710-1737`) turns a `<br>` outside `<p>` and `<span>` with no non-blank text-node sibling into an empty default block, and a model probe on 2026-10-08 (Bun, package source, happy-dom) pasted both inputs through `insertData` and got `a`, an empty paragraph and `b`, and two empty paragraphs, `CCC`, `DDD` and two empty paragraphs. No Plate test covers these inputs. The Plite browser tests `apps/plite/tests/plite-browser/donor/examples/paste-html.test.ts:1188` "preserves blank lines from contenteditable-style multiline HTML paste" and `:1236` "preserves leading and trailing br-only lines from rich HTML paste" run the paste-html example's own deserializer, not Plite core or Plate. Checked 2026-10-08.

- `EDIT-CLIPBOARD-HTML-LIST-WS-001` `proposed` `HTML paste of nested lists`: pasting nested HTML lists, including mixed ordered and unordered levels, drops the source's structural indentation whitespace between list elements and trims multiline item text, so no source whitespace leaks into list-item text

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: HTML clipboard input; primary UX ref: Typora for markdown-first paste, with Google Docs where document fidelity is stronger; secondary ref: ProseMirror (#1247)
Source: c70bacbd4a:docs/editor-issue-harvester/prosemirror/full/checkpoints/issues-1220-1259.md:19-20
Proof: Plate does not meet it. A model probe on 2026-10-08 (Bun, package source, happy-dom) pasted ProseMirror's mixed nested-list fixture and got an item reading `xxxx human ` with a trailing space and `human` moved ahead of its nested items, plus an extra empty list item for an `<li>` that only wraps a nested `<ol>`; `apps/www/src/__tests__/package-integration/list/ListPlugin.spec.tsx:153` "handle li with nested ul correctly" asserts the trailing-space leak (`Item 1 `). `packages/platejs/src/lib/plugins/html/HtmlPlugin.dom.spec.ts:44` "removes whitespace between block elements" covers only `<p>` siblings. The only proof, `apps/plite/tests/plite-browser/donor/examples/paste-html.test.ts:1882` "imports mixed nested ordered and unordered lists from rich HTML paste", runs the paste-html example's own deserializer. Checked 2026-10-08.

- `EDIT-CLIPBOARD-HTML-MARK-001` `proposed` `HTML paste of nested style resets`: when pasted HTML nests an element with an explicit normal style (`font-style: normal` or a non-bold `font-weight`) inside a bold or italic parent, such as a nested list item, that element's text takes its explicit style and does not inherit the parent's mark, while the parent's own text keeps it

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: HTML clipboard input; primary UX ref: Typora for markdown-first paste, with Google Docs where document fidelity is stronger; secondary ref: ProseMirror (#1347)
Source: c70bacbd4a:docs/editor-issue-harvester/prosemirror/full/checkpoints/issues-1330-1370.md:28
Proof: Plate meets it for bold and not for the other marks. Bold reads each element's own `font-weight`, so a weight below 600 turns bold off for that element's text only, and `packages/platejs/src/features/basic-nodes/lib/BaseMarkPlugins.spec.tsx:165` "pastes %s with only the reset text plain" pastes `<b>a<span style="font-weight: 400">b</span>c</b>` and the same with `initial`, and keeps `a` and `c` bold. The italic, underline and strikethrough HTML readers still veto the mark for the whole matched element when any element inside it resets the style (`someHtmlElement` in `packages/platejs/src/features/basic-nodes/lib/BaseMarkPlugins.ts:311`, `:385`, `:413`); `BaseMarkPlugins.spec.tsx:143` "vetoes %s parsing when a descendant resets the style" asserts that veto on fixtures with no parent text of their own. Checked 2026-10-19. ProseMirror's nested-list fixture passes in Plate only because each item becomes its own block. `apps/plite/tests/plite-browser/donor/examples/paste-html.test.ts:1610` "does not leak parent list item marks into nested pasted list items" runs the paste-html example's own deserializer and never checks the parent items. Checked 2026-10-08.

- `EDIT-CLIPBOARD-SOFTWRAP-COPY-001` `proposed` `copy, then plain-text paste`: copying a paragraph that wraps only because of viewport width preserves its logical text without layout-wrap newlines. Pasting that plain text into an empty paragraph restores the same paragraph text; copying leaves the source unchanged.

```text
one paragraph displayed on several visual lines
copy its text, then paste as plain text into an empty paragraph
=>
one paragraph with the same logical text and no layout-wrap newlines
```

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: plain-text clipboard representation; primary UX ref: Typora for general markdown-first clipboard behavior; secondary ref: none checked. No reference editor was checked for this case.
Source: c70bacbd4a:docs/plans/2026-06-10-plite-8h-automation.md:774
Proof: `apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts` "copies a visually wrapped long paragraph without hard-wrap newlines" narrows the editor to 220px, copies a selected paragraph, asserts exact clipboard text without a newline, deletes the document text and pastes it back as one paragraph. It excludes WebKit clipboard reads and mobile, and asserts no final caret. `packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts` serializes selected logical content rather than visual line boxes. Only a Plite plaintext example supplies browser proof; Plate's product surface is unproven. Test read, not run.

- `EDIT-CLIPBOARD-PLAIN-ACTIVE-MARKS-001` `proposed` `plain-text paste at a collapsed caret`: every pasted line carries the caret's active marks, including when several lines replace an empty paragraph. The caret lands after the last pasted character, before any surviving suffix. This rule applies when plain text is the accepted paste format.

```text
Hello | (bold active)
paste plain text world, newline, Next
=>
Hello **world**
**Next|**
```

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: plain-text clipboard representation; primary UX ref: Typora for general markdown-first paste; secondary ref: none checked. No reference editor was checked for active-mark inheritance.
Source: docs/plans/2026-06-13-plite-10h-auto-proof-transport-selection.md:851-854
Proof: `packages/plitejs/test/dom/clipboard-boundary.ts` "applies collapsed active marks to plain text fallback", "applies collapsed active marks to multiline plain text fallback" and "applies collapsed active marks to multiline plain text replacing an empty block" assert bold on inserted text and the exact final caret. `packages/plitejs/src/dom/plugin/data-transfer-format.ts` applies active marks while constructing inline text and line blocks; `packages/platejs/src/lib/plugins/dom/DOMPlugin.ts` installs the shared DOM path. This is Plite decoder and DOM-boundary proof, not native Plate browser paste through arbitrary plugin configurations. Tests read, not run.

- `EDIT-CLIPBOARD-PROJECTED-ORDER-001` `proposed` `copy across rendered content roots`: copy emits selected content in visible document order. Each selected occurrence of a shared root contributes its selected content, even when several occurrences share storage identity. Copy changes neither source content nor selection.

```text
selected tail of shared root, selected Between paragraph, selected head of the same root's next occurrence
copy
=>
tail, Between and head in that order, with both root occurrences represented
```

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: clipboard representations of the local content-root model; primary UX ref: Google Docs for document-fidelity copy; secondary ref: none checked. No reference editor was checked for repeated shared-root occurrences.
Source: docs/plans/2026-05-26-plite-projection-selection-architecture.md:519
Proof: `packages/plitejs/test/react/projected-clipboard-contract.test.ts` "serializes repeated content-root owners as visible clipboard fragments" asserts a slice containing side, Between and Insi, plain text in that order, and the same decoded exact fragment. `packages/plitejs/src/react/editable/projected-clipboard.ts` appends every ordered selection segment without deduplicating by root identity. This is Plite contract proof; it does not establish native clipboard transport or Plate browser parity. Test read, not run.

- `EDIT-CLIPBOARD-MIDDLE-BLOCKS-401` `proposed` `paste compatible ordinary text blocks inside a paragraph`: with a collapsed caret between a paragraph's prefix and suffix, the first pasted block joins the prefix, the last joins the suffix, and intermediate pasted blocks remain separate. The caret lands after the last pasted text and before the surviving suffix.

```text
before |after
paste paragraphs one and two
=>
before one
two|after
```

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: ordinary block clipboard structure; primary UX ref: Typora for markdown-first paste; secondary ref: none checked. No reference editor was checked for this insertion shape.
Source: c70bacbd4a:docs/plans/2026-05-07-plite-multiblock-fragment-middle-insert-ralplan.md:31-40
Proof: `packages/plitejs/test/clipboard-contract.ts` "preserves block separation for a multi-block fragment inserted in the middle of a text block" asserts the scenario through slice replacement. `packages/plitejs/test/dom/clipboard-boundary.ts` "preserves block separation when a rich multi-block fragment is pasted in the middle of a text block" copies an exact fragment and asserts both resulting paragraphs and the caret after two. Current slice replacement is owned by `packages/plitejs/src/core/public-state.ts` and its canonical fitter. These are Plite core and DOM-boundary contracts, not native browser clipboard proof or a rule for arbitrary nested wrappers. Tests read, not run.

- `EDIT-CLIPBOARD-EMPTY-EXACT-001` `proposed` `paste a valid empty exact editor slice over selected content`: consume the paste without deleting selected content, changing selection or trying another format. An invalid or unfit exact envelope may fall back to an eligible format, but refusal by every format preserves the document and selection.

```text
before [[selected]] after
paste a valid empty exact slice, also carrying plain text Z
=>
before [[selected]] after
no fallback text inserts
```

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: the exact editor clipboard envelope and local slice contract; primary UX ref: none checked; secondary ref: none checked. The valid-empty versus invalid distinction is an explicit local decision.
Source: docs/plans/2026-09-13-clipboard-transfer-policy.md:285-289
Proof: `packages/plitejs/test/react/projected-command-contract.test.ts` "preserves projected selection for an empty Plite fragment paste so typing can replace it" preserves content and projected selection when no fallback text is present; "declining clipboard handlers preserve unsupported projected paste payloads" preserves both when handlers refuse. Drift: "falls back to plain text for empty Plite fragments over projected selections" supplies a valid empty exact envelope plus Z and asserts replacement with Z, contrary to the no-fallback clause. `packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts` tries host formats when exact replaceSlice returns false; `packages/plitejs/src/core/public-state.ts` returns false for an empty slice at a collapsed range. The projected adapter in `packages/plitejs/src/react/editable/mutation-controller.ts` preserves its deletion prefix on refusal but publishes it with an accepted fallback. Thus the intended rule lacks complete proof and current code and test explicitly drift for projected paste with plain text. Tests read, not run; no native Plate browser proof is mapped.

### Interactive Preview And Navigation

- `EDIT-INTERACT-*` `locked`

note: plain click, mod-click, hover preview, and focus-jump behavior should use
the strongest surface owner instead of one global rule
note: Typora wins for plain markdown-native spans, footnotes, image-source
editing, and HTML-block edit entry
note: Obsidian wins for dual-mode preview/source behavior, link autocomplete,
backlinks, block references, and note-centric outline surfaces
note: Google Docs wins for linear document-navigation chrome and
heading-derived jump behavior
note: Notion wins for block-editor-native references and block-shell
interactions
note: document-navigation controls such as TOC and outline items are
navigation-owned overlay controls; plain activation should navigate without
creating text caret or block-selection state at the landed heading unless a
separate explicit edit-entry gesture is defined
note: keyboard-accessible navigation controls should expose the same activation
result on `↵` / `Space` as on pointer activation

note: the TOC block never highlights the current heading while the user edits or scrolls through the document (`EDIT-TOC-NAV-003`)

- `EDIT-FOCUS-REFOCUS-SCROLL-001` `proposed` `refocus a scrollable editor`: when the saved collapsed caret is near the bottom of a scrolled editor, refocusing restores that caret visibly without jumping to the document's top. Scrolling needed to reveal the caret is allowed; refocusing changes no document content.

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: Google Docs for document navigation; secondary ref: none checked. No reference editor was checked for this case.
Source: c70bacbd4a:docs/plans/2026-06-10-plite-8h-automation.md:1327-1339
Proof: `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts` "does not scroll to top when refocusing a scrollable editor" places a caret in the final block, scrolls to the bottom, focuses an outside input and refocuses the editor. It asserts caret visibility and final scrollTop at least 75 percent of the previous value, rather than exact scroll preservation. Mobile is skipped. `packages/plitejs/src/react/hooks/focus-plite-editable.ts` focuses with preventScroll, and `packages/plitejs/src/react/components/editable.tsx` reveals the selection through its scroll walker. Only a Plite richtext example supplies browser proof. Test read, not run.

- `EDIT-ROOT-CHILD-ARROW-001` `proposed` `ArrowLeft or ArrowRight at an embedded editable-root boundary`: for a content root declared to participate in document navigation, horizontal caret movement follows document flow. In LTR flow, ArrowRight from the preceding text's end enters the child at its first valid point, and ArrowLeft from the following text's start enters at its last valid point. Moving beyond either child edge returns to the corresponding parent-flow position and focuses that editable. A repeated shared root exits beside its active owner occurrence. Ordinary atomic voids stay atomic, and native controls inside the owner keep their own keys. Content stays unchanged.

```text
before| [owner with editable child: child] after
ArrowRight
=>
before [owner with editable child: |child] after
ArrowLeft
=>
before| [owner with editable child: child] after
```

Classification: invariant within declared document-flow navigation, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: Google Docs for document navigation; secondary ref: Notion for block-shell interaction. No reference editor was checked for embedded-root traversal; this is an explicit local contract.
Source: docs/plans/2026-05-25-plite-editable-void-keyboard-click-navigation.md:139-153; docs/plans/2026-05-25-plite-void-roots-and-editable-islands.md:305-310
Proof: `apps/plite/tests/plite-browser/donor/examples/editable-voids.test.ts` "moves across editable void child-root boundaries with keyboard" asserts forward entry, backward exit and forward exit with model endpoints, native entry endpoints and parent focus; mobile is skipped. `packages/plitejs/test/react/content-root-navigation-contract.test.ts` "moves forward from the previous sibling into the content root start" checks entry and focus dispatch, and the two active repeated-content-root cases check exits beside the selected occurrence. `packages/plitejs/src/react/editable/content-root-navigation.ts` selects the rooted target and focuses its mounted owner view. The browser proof is a Plite example; native-control isolation and every atomic-void variant are not established by those cases. Tests read, not run.

- `EDIT-INTERACT-HIDDEN-TAB-001` `proposed` `ArrowRight from the end of a visible tab panel`: navigation leaves an inactive panel closed under skip or model selection policy. If the app enables materialize policy, navigation into that panel requests its activation and places the caret in its editable content. Navigation changes no document content.

Classification: parameter, by the tests in docs/vision/plate.md:151-160; the app chooses selection policy, and navigation honoring it is an invariant
Authority: syntax: none; primary UX ref: Notion for block-shell interaction; secondary ref: none checked. No reference editor was checked for this hidden-panel policy; the policy split is local.
Source: c70bacbd4a:docs/plans/2026-05-26-plite-hidden-content-policy-controls.md:11-13
Proof: `apps/plite/tests/plite-browser/donor/examples/hidden-content-blocks.test.ts` "controls selection policy for inactive tab navigation" asserts inactive tabs stay inactive under skip and model, then activate under materialize. "materializes inactive tab keyboard selection matrix forward" asserts one ArrowRight lands at offset zero in the activated panel. `packages/plitejs/src/react/editable/caret-engine.ts` skips skip boundaries; `packages/plitejs/src/react/editable/dom-coverage-selection.ts` requests materialization only for materialize boundaries. This is Plite example proof, not a Plate product or physical-device claim. Tests read, not run.

- `EDIT-NAV-CONTENT-ROOT-VERTICAL-001` `proposed` `plain ArrowUp or ArrowDown across an embedded editable-root boundary`: with a collapsed caret on the adjacent terminal visual line, the arrow moves focus and caret into the neighboring mounted editable root near the same horizontal column, as its text permits. ArrowDown enters from the parent text above and exits below the child's last visual line; ArrowUp enters from below and exits above the child's first visual line. Crossing must not force offset zero. Movement inside a root stays browser-native until a boundary requires root navigation; content stays unchanged.

Classification: invariant within declared document-flow navigation, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: Google Docs for document navigation; secondary ref: Notion for block-shell interaction. No reference editor was checked for embedded-root column preservation; this is a local contract.
Source: c70bacbd4a:docs/plans/2026-05-25-plite-vertical-content-root-navigation.md:242-245,406-450; c70bacbd4a:docs/plans/2026-06-15-beta-public-release-readiness.md:344
Proof: `apps/plite/tests/plite-browser/donor/examples/editable-voids.test.ts` "moves vertically across editable void child-root boundaries with keyboard" checks focus, model destination and visual-column geometry for downward entry, upward exit and downward exit; the upward exit must have a nonzero offset. It skips mobile and does not exercise upward entry from below. `packages/plitejs/src/react/editable/content-root-navigation.ts` claims visual-boundary crossings, and `packages/plitejs/src/react/editable/content-root-vertical-geometry.ts` resolves the destination using horizontal geometry. Ordinary local movement yields when no crossing target exists. Only a Plite desktop example supplies browser proof. Test read, not run.

- `EDIT-INTERACT-AI-CLOSE-001` `proposed` `Escape in an unapplied Ask AI prompt`: cancellation closes the prompt, preserves document content and the editor selection, and returns keyboard focus to the mounted editor that opened it. Immediate typing without another click edits that editor, and undo reverses that follow-up edit.

Classification: invariant for editor focus restoration on cancellation, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: none checked; secondary ref: none checked. This local rule governs editor input after cancellation, not the AI workflow or response-acceptance policy.
Source: docs/plans/2026-09-10-editor-performance-follow-through.md:419-443
Proof: the Ask AI case in `apps/www/tests/browser/link-floating-toolbar.spec.ts` opens the prompt from selected text, presses Escape, asserts editor focus, exact selection and unchanged model value, then types and undoes back to the original value. `packages/platejs/src/ai/react/AIChatPlugin.ts` hide resets the session and focuses the bound command editor. This is a Plate product browser test; physical-device behavior and all alternative prompt hosts are unproven. Test read, not run.

- `EDIT-TOOLBAR-CAPTURED-MOUNT-001` `proposed` `open an editor toolbar interaction, then invoke its action`: opening captures the mounted editor target. Focusing another editor must not redirect the action. Removing or replacing the captured mount must not redirect it to a replacement. The action obeys the captured view's current permission and installed capabilities, changing only that admitted target's content or selection; a refused action changes nothing.

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: none checked; secondary ref: none checked. This local rule governs editor mutation targeting, not toolbar appearance or menu design.
Source: c70bacbd4a:docs/plans/2026-09-08-multi-editor-architecture-and-api-review.md:130
Proof: `apps/www/src/registry/components/editor/toolbar-overlay.tsx` captures the editor when the first overlay opens and provides it through EditorProvider until the overlays close. `packages/platejs/src/react/components/EditorProvider.tsx` retains that editor's target. `packages/platejs/src/react/components/PlateController.lifecycle.spec.tsx` "replacing the editable DOM retires the captured command view" asserts a replacement has a different command view, the retired view becomes read-only and its insertion throws rather than targeting the replacement. This is Plate lifecycle proof, not an end-to-end toolbar proof of focus switching, live permission changes or every installed-capability check. Those clauses lack mapped proof in this pass. Test read, not run.

- `EDIT-FOCUS-NATIVE-HANDOFF-001` `proposed` `native focus handoff after an editor focus request`: once the request has focused its editor, moving native focus to an input or button supersedes that request's deferred retries. After settlement, the next key without another click remains with the newly focused control and leaves editor content unchanged.

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: platform native-control focus ownership; secondary ref: none checked. No reference editor was checked.
Source: c70bacbd4a:docs/plans/2026-09-08-multi-editor-architecture-and-api-review.md:188
Proof: `packages/plitejs/test/react/focus-plite-editable-contract.test.ts` "keeps a native %s focus handoff through pending retries" covers input and button, schedules editor focus, focuses the control, flushes scheduled phases and asserts control focus. It stubs DOMEditor.focus and types no follow-up key, so input routing and unchanged editor content remain unproven. `packages/plitejs/src/react/hooks/focus-plite-editable.ts` snapshots the native focus owner and refuses retries after that owner changes. This is Plite DOM-contract proof, not a native browser typing test. Test read, not run.

### Navigation Feedback

- `EDIT-NAV-FEEDBACK-*` `locked`

note: successful navigation actions should do three things in order:

1. land focus or caret according to the owning surface
2. scroll the target into view
3. briefly highlight the landed target

note: the highlight is a transient shared feedback primitive, not package-local
state
note: TOC jumps, footnote ref/def jumps, and search jumps should reuse the same
primitive instead of inventing one-off flashes
note: a new navigation action should replace the previous target state
note: the target flash should clear automatically after a short interval
note: document-navigation controls may keep focus in chrome or preserve prior
focus, but they must not fabricate editor caret or block-selection state at the
landed target just to show that navigation succeeded

### Search And Find-Jump

- `EDIT-SEARCH-*` `locked`

note: current-file search, next / previous match movement, jump-to-selection,
and outline-assisted heading lookup are document-level navigation behaviors, not
block-local editing rules
note: Typora is the primary winner for current-file markdown-first find behavior
and caret-relative search expectations inside one document
note: Obsidian is the primary winner for selected-text search kickoff, richer
markdown-workspace query behavior, backlinks-adjacent search, and outline as a
persistent markdown navigation surface
note: Google Docs is the primary winner for linear document outline and
heading-oriented jump behavior
note: replace behavior belongs to the same search surface and should preserve
document structure while updating only the matched content range
note: cross-file search and open-quickly are app-shell behaviors, not core
content-editing law, but when Plate needs a product precedent for those
surfaces, Obsidian is stronger than Typora
note: search jumps should also use the shared navigation-feedback primitive
note: `platejs/find` ships current-document literal search, next and previous match movement, and active-match selection (`packages/platejs/src/features/find/lib/BaseFindPlugin.ts`), and the copied Find bar seeds its query from an expanded text selection (`apps/www/src/registry/components/editor/find.tsx`, `EDIT-SEARCH-FIND-005`); replace, jump-to-selection and outline header search are locked law with no shipped surface

- `EDIT-SEARCH-INLINE-507` `proposed` `current-document literal find`: within one text block, a literal query matches across consecutive text leaves and editable inline descendants, including formatting boundaries. Each match retains its model endpoints, and searching the inline subtree does not duplicate that match. Finding changes neither document content nor the editor selection.

```text
hello [world](https://example.com) again
find HELLO world again
=>
one match from before hello to after again; content and selection unchanged
```

Classification: invariant within literal find, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: Typora for current-document find; secondary ref: none checked. These inherit Search And Find-Jump's authority; no reference editor was checked for this case.
Source: docs/plans/2026-07-12-plate-next-excalidraw-find-replace-floating-package-reviews.md:594-596
Proof: `packages/platejs/src/features/find/lib/BaseFindPlugin.spec.ts` "finds literal case-insensitive text across inline nodes without document writes" asserts one match across plain text, a link and following text, its exact endpoints, and unchanged children. It changes selection only through the subsequent explicit select command. `packages/plitejs/src/interfaces/node.ts` searches a complete inline text run once and returns before descending again; `packages/plitejs/src/internal/text-run.ts` collects schema-inline descendants. This is model proof, not browser Find proof; no test separately asserts duplicate suppression for a query wholly inside the inline. Tests were read, not run.

- `EDIT-SEARCH-BLOCK-507` `proposed` `current-document literal find`: find never creates a match by concatenating different blocks or parent text across a nested block boundary. Nested blocks are searched independently, and searching changes neither document content nor selection.

```text
foo
bar
find foobar
=>
no match; both paragraphs and the selection stay unchanged
```

Classification: invariant within literal find, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: Typora for current-document find; secondary ref: none checked. These inherit Search And Find-Jump's authority; no reference editor was checked for this case.
Source: docs/plans/2026-07-12-plate-next-excalidraw-find-replace-floating-package-reviews.md:602-604
Proof: `packages/plitejs/test/find-text-ranges-contract.ts` "does not join separate text runs" rejects foobar across adjacent paragraphs; "joins text through schema inline descendants for live editor roots" also rejects againoutside across paragraphs. `packages/plitejs/src/internal/text-run.ts` rejects a joined run containing any block child, and `packages/plitejs/src/interfaces/node.ts` then visits the children independently. Plate's `packages/platejs/src/features/find/lib/BaseFindPlugin.ts` uses that traversal. The adjacent-block case has Plite model proof; the nested-block clause has source inspection only. Tests were read, not run.

- `EDIT-SEARCH-INPUT-FOCUS-001` `proposed` `type in a document-search input`: updating a query and its document highlights keeps keyboard focus in that input, including after the editor previously held focus. Typing the query changes no document content and does not replace the editor's saved selection with a search-input selection.

Classification: invariant within document search, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: Typora for current-document find; secondary ref: Obsidian for search chrome. No reference editor was checked for this focus case.
Source: c70bacbd4a:docs/plans/2026-04-27-plite-search-highlighting-input-focus.md:48-58
Proof: `apps/plite/tests/plite-browser/donor/examples/search-highlighting.test.ts` "keeps focus in search input after the editor was focused" focuses the editor, clicks the query input, types t and asserts input focus, value t and nonempty highlights. It does not assert unchanged content or the saved model range. The copied Plate Find input in `apps/www/src/registry/components/editor/find.tsx` updates search state without selecting a match, and `apps/www/tests/browser/transient-editor-geometry.spec.ts` "Find scrolls distant ranges while retaining input focus and selection" asserts retained input focus and unchanged editor selection during navigation. The typing-specific browser case is a Plite example. Tests read, not run.

- `EDIT-SEARCH-FIND-005` `proposed` `Mod+F, Enter, Shift+Enter or Escape in Find`: Mod+F in an Editable opens that view's Find bar and seeds its query from an expanded text selection. Enter moves to the next match and Shift+Enter to the previous match, wrapping through available results, scrolling the active result into view, keeping focus in the Find input and leaving editor selection unchanged. Escape closes Find and restores editor focus without inventing a selection. Finding changes no document content.

Classification: substitutable capability, by the tests in docs/vision/plate.md:151-160; an editor without Find retains ordinary editing and browser search fallback
Authority: syntax: none; primary UX ref: Typora for current-document find and Obsidian for selected-text kickoff; secondary ref: Google Docs for document navigation. These inherit Search And Find-Jump's authority; no reference editor was checked for these exact keys.
Source: docs/plans/2026-08-30-cursor-find-overlay-architecture.md:853-855,1022
Proof: `apps/www/src/registry/components/editor/find.tsx` owns view-local open state, selected-text seeding, match movement, scrolling and close focus. `apps/www/tests/browser/transient-editor-geometry.spec.ts` "Find highlights, wraps, closes, and returns editor input 5/5" checks seeding, forward and backward wrap, closing, editor focus and follow-up typing with undo. "Find scrolls distant ranges while retaining input focus and selection" checks distant-result visibility, input focus and unchanged selection in two viewport sizes. These are Plate browser tests, read and not run. Spec drift: the existing Search And Find-Jump note still says selection-seeded search has no shipped surface, despite this implementation and proof.

- `EDIT-SEARCH-FIND-VISIBLE-001` `proposed` `Mod+F in a focused Editable`: the installed Find surface opens exactly one complete, visible Find bar above overlapping editor chrome and focuses its search input. Enter moves to the next match. Escape closes the bar and restores editor focus without changing document content or inventing a new editor selection.

Classification: invariant within the installed Find capability, by the tests in docs/vision/plate.md:151-160; the search control must remain visible and operable.
Authority: syntax: none; primary UX ref: Typora for current-document find; secondary refs: Obsidian for search chrome and Google Docs for document navigation. These inherit Search And Find-Jump's references; no reference editor was checked for this visibility case.
Source: docs/plans/2026-08-31-fix-hidden-find-bar.md:22-27
Proof: `apps/www/tests/browser/transient-editor-geometry.spec.ts`, "Find highlights, wraps, closes, and returns editor input 5/5", presses Mod+F, asserts one search surface and focused input, checks that the bar wins hit testing at a sampled toolbar overlap, navigates with Enter, checks horizontal viewport containment at narrow width, closes with Escape or the close button, and types and undoes in the editor. The stacking check passes vacuously when no overlap exists and does not inspect every pixel of the complete bar. `apps/www/src/registry/components/editor/find.tsx` owns one view-local open state, a z-[60] bar, input focus and key handling. Test read, not run.

### Mouse Drag And Selection

- `EDIT-DRAG-*` `locked`

note: drag selection should clamp to strong container boundaries such as tables
instead of producing impossible mixed native selections
note: Google Docs is the primary winner for document selection drag and Notion for block drag semantics
note: forward drag-select from a table cell past the table clamps focus to the end of the table, and backward drag-select from after the table into a cell clamps focus to the point before the table
note: `editor.update.selection.set` from a cell of a table that opens or closes the document clamps like any other, and a selection whose ends are the document's first and last points keeps them, so select-all is never clamped; a native mouse drag never reaches this clamp, because its selection import writes through `tx.selection.set`, which the `docs/plans/topics/table.md` Open work tracks
note: a block or text drag inside one document moves the content present at
drop in one update and one undo entry, and refuses with nothing published when
the source vanished, the edge lies inside the payload, or corrections would
rewrite the moved content
note: a drag from another editor, a read-only view or a document view copies and
keeps the source; Alt on Apple platforms and Ctrl elsewhere copy inside one
editor
note: a copy carries owned content roots with the copied blocks; a copy that does not fit lands what fits and reports the loss
note: a text drag lands at its drop point as a paste there, whether it copies or moves, so dropped list items follow `EDIT-CLIPBOARD-LIST-LANDING-001` and `EDIT-LIST-DROP-001`; a block drag keeps its blocks' depths, and a block copy or move joins the list beside it, or else a copy starts its own list and a move keeps its own
note: a text move may change only the properties a plugin declares to follow the drop, such as list depth and list membership; when landing it would change its text or marks, or the type or another property of a block it carries, it refuses with nothing published; it does not check the block the moved text joins at the drop point or the blocks that contain it, and it checks every other block it carries, an empty last block included; a closed block, such as a title, joins nothing, and in an empty block the moved block may take properties from the block it replaces
note: a text move carries exactly what deleting its selection removes: a selection that starts or ends inside a mention or another inline void takes the void, a selection that still has an edge inside any other non-editable element once an end at a line's start is pulled back to the line before refuses with nothing published, a selection from a line's start to the start of a later line moves only its text, leaving that later line and any line it empties in place, except when it ends at the document's end, and a selection whose deletion removes nothing, such as one empty line, refuses with nothing published, as does a drop at either edge of what the deletion removes
note: a drag into another application never deletes the source
note: a block lands wherever the target's schema accepts it, at any depth, such
as inside a blockquote, a details body, a column or a table cell; within 8px of
a container's top or bottom edge a drop lands beside that container, and an
edge inside collapsed content is refused
note: features keep only what the schema cannot state: a list item lands after
the family it would adopt, column items and table rows reorder within their own
container, cells stay in place, the details summary stays first, footnote
definitions land only at the top level, a row move never splits a row span, and
an upload draft never leaves its root
note: a block drag starts from a handle and releases the source view's focus,
so no caret paints while it runs; each view paints one indicator on the edge a
drop would use, and Escape, leaving the editor or a refused edge clears every
indicator and changes nothing; dropped files land on the same edges and a
refused file landing inserts nothing
note: every drag has a non-drag equivalent: handle actions on click, tap, Enter or Space, the right-click block menu, and `Mod+Shift+ArrowUp` / `Mod+Shift+ArrowDown`, which move the blocks containing the selection past the previous or next admitted sibling edge in one update and one undo entry, keep the caret, announce the move once however many views of the document are mounted, step a list item over its whole family, and refuse blocks under different parents; the shortcut replaces native select-to-boundary while the DnD kit is installed

note: block handles offer Move up, Move down and Cut; column handles offer Move left and Move right; row handles offer Select row, Move up and Move down; the right-click block menu offers Move up, Move down and Cut

- `EDIT-MOUSE-CLICK-001` `proposed` `click or Shift+click`: a plain click inside an expanded text selection collapses it to the clicked offset, and Shift+click extends a collapsed selection from the caret to the clicked offset; the model and native selections agree, and only one highlight paints

```text
a[[bc]]d
click between b and c
=>
ab|cd
Shift+click after d
=>
ab[[cd]]
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Google Docs for document selection; secondary ref: the WPT primary-button mouse selection tests
Source: c70bacbd4a:docs/plite/research/2026-06-13-wpt-editing-oracles/README.md:312-318
Proof: only a Plite example proves it: `apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts:197` "Shift+click extends a collapsed text selection" (Plite's plaintext example, Chromium, Firefox and WebKit) asserts the model and native selected text, anchor and focus and no double highlight, and `:130` "clicking inside selected text collapses the selection" asserts an empty native selection and a collapsed model selection but not the clicked offset or the highlight. No Plate or www test clicks inside a selection or Shift+clicks. Checked 2026-10-08.

- `EDIT-SEL-CLICK-READONLY-001` `proposed` `click in a read-only editor`: in a read-only editor, a click inside an expanded selection collapses both the native selection and the editor selection to the click point, so a native click after a programmatic selection never leaves the stale editor selection in place

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Google Docs for document selection; secondary ref: ProseMirror (#1563)
Source: c70bacbd4a:docs/editor-issue-harvester/prosemirror/full/checkpoints/issues-1523-1568.md:24-30
Proof: only Plite proves it: `apps/plite/tests/plite-browser/donor/examples/read-only.test.ts:48` "clicking inside a read-only selection collapses DOM and Plite selection" (a plain read-only Editable, Chromium, Firefox and WebKit) selects `This example` programmatically, clicks at text offset 5 and asserts an empty native selection and a collapsed model selection, not that it collapsed at the click point. `packages/plitejs/test/react/read-only-press-selection.test.tsx` "a click inside a read-only selection keeps its caret through a render on click" (jsdom) asserts the model selection at the click point after a render that runs before the selectionchange, not the native selection. No Plate or www test clicks inside a read-only selection, and Plate's editor content adds its own pointer plugins around the same Editable. Checked 2026-10-24.

- `EDIT-MOUSE-DOUBLECLICK-DRAG-001` `proposed` `double-click and hold the second press, then drag`: in editable paragraph text, dragging extends the word selection beyond the clicked word. The model and native selections agree on the resulting text and endpoints, and one selection highlight paints. Word boundaries may follow each browser's native behavior; document content stays unchanged.

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: Google Docs for document selection; secondary ref: browser-native word selection. No reference editor was checked for this case.
Source: c70bacbd4a:docs/plans/2026-06-10-plite-8h-automation.md:1261-1273
Proof: `apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts` "extends a double-click word selection while dragging" performs the held second-click drag, asserts selected text starts with editable plain, native text equals model text, exact model endpoints derived from that text, and no double highlight. Mobile is skipped. `packages/plitejs/src/react/editable/root-interaction-controller.ts` leaves native text multi-click interactions browser-owned. This is Plite plaintext desktop proof, with no Plate product or physical-device proof. Test read, not run.

- `EDIT-ROOT-CHILD-MOUSE-EXIT-001` `proposed` `click parent text or an empty parent block after editing a child root`: clicking in the parent moves focus and selection to the clicked parent position and clears the child root's active selection. Clicking inside the child keeps selection ownership there. Neither click changes document content.

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: Google Docs for document selection; secondary ref: Notion for block-shell interaction. No reference editor was checked for this embedded-root case.
Source: docs/plans/2026-05-25-plite-editable-void-mouse-unfocus.md:4,138-151
Proof: `apps/plite/tests/plite-browser/donor/examples/editable-voids.test.ts` "unfocuses editable void child root when clicking outside it" first clicks a child text position and asserts its selection, then clicks parent text and asserts parent focus, null child selection and the exact parent caret. It skips mobile and does not click an empty parent block. `packages/plitejs/src/react/editable/root-interaction-controller.ts` routes pointer placement by the editable root, with selection reconciliation in `packages/plitejs/src/react/editable/selection-controller.ts`. Only a Plite desktop example proves the populated-parent case; empty-block placement remains unproven. Test read, not run.

- `EDIT-SELECTION-SCROLL-CLICK-TYPE-001` `proposed` `scroll, click visible paragraph text, then type`: typing inserts at the newly clicked caret and reveals that caret instead of returning to an older selection. Repeating scroll, click and type keeps using the latest clicked position. Only the typed content changes.

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: Google Docs for document selection and navigation; secondary ref: browser-native caret placement. No reference editor was checked.
Source: docs/plans/2026-05-11-plite-scroll-selection-visibility-ralplan.md:31-35
Proof: `packages/plitejs/src/react/editable/selection-controller.ts` imports native-user selection, and `packages/plitejs/src/react/components/editable.tsx` reveals the current selection through the scroll walker. No inspected current test proves the repeated scroll-click-type sequence. The plan's former browser path is absent; the nearby richtext typing-visibility and refocus tests do not perform this gesture sequence. This rule has source inspection only, with no current exact browser proof, no Plate product proof and no raw-mobile or RTL proof. No test was run.

- `EDIT-SELECTION-NESTED-POINTER-001` `proposed` `primary pointer press into a nested editable`: clear the outer editor's inactive selection paint before mousedown, while retaining its model range for later restoration. A secondary or non-primary press, a press inside contentEditable=false chrome, or a press on a marked selection-preserving control keeps that paint. Presentation changes neither document content nor the retained range.

Classification: invariant within inactive-selection presentation, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: none checked; secondary ref: none checked. This is a local focus and presentation contract.
Source: docs/plans/2026-09-10-editor-performance-execution.md:94-97
Proof: `packages/plitejs/test/react/editable-behavior.tsx` "resolves inactive selection before mousedown for $name" dispatches pointerdown and mousedown into a nested editable, secondary and non-primary variants, embedded noneditable chrome and marked controls, then asserts visibility at mousedown. The fixture uses a selection-paint store without a model range, so range preservation is not asserted there. `packages/plitejs/src/react/inactive-selection.ts` installs capture-phase pointerdown handling and changes only paint-store state. This is a Plite DOM contract with synthetic events, not native browser paint proof. Test read, not run.

- `EDIT-SELECTION-RETAIN-002` `proposed` `blur into selection-preserving chrome`: when an Editable loses focus to a control marked data-editor-keep-selection-visible, or its descendant, keep one visual representation of that Editable's live selection: fill for an expanded range or a caret for a collapsed selection. Keep it while focus moves within marked chrome; clear it when focus returns to the editor, enters unmarked content or leaves the window. Painting reads the canonical selection without copying or changing it, the document or history.

Classification: substitutable capability, by the tests in docs/vision/plate.md:151-160; without opt-in chrome, ordinary blurred-selection presentation remains defined
Authority: syntax: none; primary UX ref: none checked; secondary ref: none checked. This is a local opt-in presentation contract.
Source: docs/plans/2026-08-30-cursor-find-overlay-architecture.md:241-280
Proof: `packages/plitejs/test/react/editable-behavior.tsx` tests expanded selection under a marked ancestor, updates to the live range, unmarked focus, return to the Editable and window blur. `apps/www/tests/browser/transient-editor-geometry.spec.ts` "inactive selection paints expanded and collapsed selections 5/5" asserts one fill or one caret, never both, and their removal at an unmarked control. `packages/plitejs/src/react/inactive-selection.ts` reads canonical selection into decoration output and coordinates visibility; `packages/plitejs/src/react/components/editable-text-blocks.tsx` renders the collapsed caret. These prove DOM presentation and focus transitions, not classified pixels or unchanged history in every case. Tests read, not run.

- `EDIT-SEL-DRAG-AUTOSCROLL-001` `proposed` `hold the primary button during an ordinary native text-selection drag`: holding beyond the editor's upper or lower scrolling boundary visibly scrolls in that direction while native selection remains live and the model follows it. Further scrolling and pointer movement extend or shrink the selection without jumping the viewport back to its anchor. Model-to-DOM selection export must not interrupt the drag, and the floating text-selection toolbar stays hidden until release. Releasing stops continued scrolling and permits the next editor interaction. Projected selection and root-chrome gestures retain their separate owners.

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: Google Docs for document selection; secondary ref: the browser's ordinary contenteditable drag behavior. No reference editor was checked.
Source: c70bacbd4a:docs/plans/2026-08-27-outside-editor-native-autoscroll-failed-fix-repair.md:434-435; docs/plans/5113-selection-drag-scrolling-regression.md:318-346
Proof: `apps/www/tests/browser/selection-drag-scroll.spec.ts` "keeps native selection drag scrolling outside the editor" drives held-button downward and upward drags, asserts directional scroll, substantial native selected text, model selection, no premature release and no floating Ask AI toolbar, then checks scrolling stops after release and the next click and arrow work. It checks model movement explicitly upward, but does not assert exact native/model endpoint equality throughout both drags or every shrink step. `packages/plitejs/src/react/editable/root-interaction-controller.ts` leaves ordinary native text dragging browser-owned, and `packages/plitejs/src/react/editable/selection-controller.ts` skips model selection export while an unprojected native drag is active. This is a Plate browser proof owner, read and not run; the source's desktop Chrome result does not establish other engines or devices.

- `EDIT-DRAG-CHROME-SELECTION-001` `proposed` `drag a native text selection across visible block-handle chrome`: the handle and its gutter remain excluded from native selection paint and selected text. Document text remains selectable, and the handle's actions, editor focus and subsequent typing remain usable. The chrome does not introduce document text or move the selection's model boundaries.

Classification: invariant within document text selection, by the tests in docs/vision/plate.md:151-160; editor controls must not become selected document content.
Authority: syntax: none; primary UX ref: Google Docs for document selection; secondary ref: Notion for block drag semantics. These inherit Mouse Drag And Selection's references; no reference editor was checked for this case.
Source: docs/plans/2026-08-25-fix-drag-handle-selection-paint.md:22-29
Proof: `apps/www/tests/browser/dnd.spec.ts`, "dnd:drag-handle-excluded-from-native-selection", drags from preceding text into Collaborative Editing on the homepage, asserts the native selected text includes that heading and excludes the handle glyph, and checks computed user-select: none on the handle. It does not inspect highlight pixels, assert the gutter separately or exercise handle actions and subsequent typing in that case. `apps/www/src/registry/components/editor/dnd.tsx` applies select-none and contentEditable=false to the shared Gutter while retaining its controls. This is partial Plate browser-test coverage, read and not run.

### Platform Shortcuts

- `EDIT-SHORTCUT-*` `locked`

note: shortcuts should escalate through the owning surface from local owner to
broader document owner instead of looping on one level forever

- `EDIT-SHORTCUT-TRANSPOSE-001` `proposed` `Ctrl+T or insertTranspose`: on Apple platforms, with a collapsed caret inside a text, `Ctrl+T` or a native `insertTranspose` input swaps the characters before and after the caret and leaves the caret after the swapped pair

```text
a|bc
Ctrl+T
=>
ba|c
Ctrl+T
=>
bca|
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137; it applies on Apple platforms, whose text system sends this input
Authority: syntax: none; primary UX ref: the macOS text system's `Ctrl+T` transpose; secondary ref: Lexical's `Keyboard.spec.mjs`
Source: c70bacbd4a:docs/editor-test-harvester/lexical/plite-processing-ledger.md:726
Proof: only Plite proves it: `apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts:2350` "applies insertTranspose beforeinput as adjacent character transpose" (Plite's plaintext example, Chromium and WebKit, two synthetic `insertTranspose` events from `a|bc`) asserts `bca` with the caret at 3, and `packages/plitejs/test/react/model-input-strategy-contract.test.ts:634` "transposes adjacent characters from insertTranspose beforeinput" (vitest) asserts `bac` with the caret at 2, then `bca` at 3. Both use synthetic events; no test presses `Ctrl+T`, whose Apple-only keydown maps to the same command only in browsers without `beforeinput` (`packages/plitejs/src/react/editable/keyboard-input-strategy.ts:1134`, `:1158`). Plate renders Plite's Editable, so Plate editors get the `beforeinput` path; Plate's own `transposeCharacter` hotkey (`packages/platejs/src/lib/utils/hotkeys.ts:53`) has no caller, and no Plate test covers it. Code: the editable's `transpose-character` command (`applyEditableCommand` in `packages/plitejs/src/react/editable/mutation-controller.ts`) dispatches `editorCommands.transposeCharacter` (`packages/plitejs/src/core/editor-commands.ts`), which swaps the characters around the caret, swaps the two characters before it only at the end of the document, and does nothing at the end of any other block or leaf. Checked 2026-10-13.

- `EDIT-SHORTCUT-OPEN-LINE-001` `proposed` `Ctrl+O`: on Apple platforms, `Ctrl+O` with a collapsed caret at the start of a block opens an empty paragraph before that block and keeps the caret on the new empty line, so the following text does not move under the caret; the mid-block case stays open

```text
foo
|bar
=>
foo
|
bar
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137; it applies on Apple platforms, whose text system sends this input
Authority: syntax: none; primary UX ref: the macOS text system's `Ctrl+O` open line; secondary ref: Lexical regression #399
Source: c70bacbd4a:docs/editor-test-harvester/lexical/plite-processing-ledger.md:875
Proof: only a Plite example proves it: `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:5032` "opens a line with Mac Ctrl+O without moving past following text" (Chromium desktop with a Mac user agent) asserts `foo`, an empty block and `bar`, the model caret in the empty block, the DOM location and an `open-line` kernel trace. Plate has no binding or test of its own and inherits Plite's. Mid-block, read from the code and not run, Plite opens the empty paragraph above the whole block instead of splitting it (`packages/plitejs/src/react/editable/mutation-controller.ts:136-192`). Checked 2026-10-08.

- `EDIT-SEL-WORD-LEAVES-501` `proposed` `word-forward caret movement`: from the start of a word, movement crosses adjacent differently formatted text leaves to the logical word boundary. A formatting edge introduces no extra stop, and document content stays unchanged.

```text
**|he**llo world
word-forward
=>
**he**llo| world
```

Classification: invariant within word movement, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: platform text-navigation conventions; secondary ref: none checked. No reference editor or native platform shortcut was checked; punctuation policy is not decided here.
Source: docs/plans/2026-05-07-plite-core-caret-movement-word-insert-break-ralplan.md:21-23
Proof: `packages/plitejs/test/transaction-contract.ts` "moves word selection across initial sibling text leaves" starts before bold he followed by plain llo and world, calls selection.move with unit word, and asserts a collapsed caret after hello. `packages/plitejs/src/transforms-selection/move.ts` resolves word movement through editorBefore/editorAfter rather than treating a leaf edge as a stop. This is Plite model proof; platform-specific keyboard transport is unproven. Test read, not run.

- `EDIT-HISTORY-EXTERNAL-CONTROL-FOCUS-001` `proposed` `keyboard undo or redo in an external control wired to editor history`: replay keeps focus in the control. Repeated undo that reaches an earlier editor-content change still keeps that control focused and raises no editor focus-repair error. Replayed editor content may change, but its saved caret must not steal the control's native focus.

Classification: invariant within a control that participates in editor history, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: platform focus ownership for native controls; secondary ref: none checked. No reference editor was checked; unrelated native inputs are outside this rule.
Source: docs/plans/2026-05-20-plite-document-state-undo-selection-bug.md:52-57,67-84
Proof: `apps/plite/tests/plite-browser/donor/examples/document-state.test.ts` "keeps title input undo redo outside editor focus repair" asserts title undo and redo retain input focus and leave earlier body typing intact. "keeps title input focused while repeated undo crosses editor history" then undoes the earlier body edit while asserting title focus, editor blur and no focus-repair error. Both skip mobile. The title handler in `apps/www/src/app/(app)/examples/plite/_examples/document-state.tsx` invokes the history portal and restores title focus. This is Plite example proof, not a framework guarantee for controls that omit that wiring. Tests read, not run.

### Delete Commands

- `EDIT-CMD-DELETE-*` `locked`

note: Typora is the primary winner for delete-range semantics in paragraph,
code, and math contexts
note: Google Docs overrides Typora for table row and column destructive command
semantics

note: a delete command in a paragraph deletes the current sentence instead of acting like block removal

note: a delete command in a table deletes the current row instead of applying generic text deletion inside the active cell

note: a delete command in a code block deletes the current code line like a code editor instead of structurally exiting the block

note: a delete command in a math block deletes the current math line like a code-like editing surface instead of structurally exiting the block

- `EDIT-INLINE-BS-EMPTY-001` `proposed` `Backspace at the start of an empty editable inline`: with a collapsed caret there, Backspace removes that inline alone, preserves preceding text and any required inline spacers, and places the caret at a surviving adjacent editable point.

```text
an [empty editable inline: |]!
⌫
=>
an |!
```

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: Typora for text deletion; secondary ref: none checked. No reference editor was checked for empty-inline removal.
Source: c70bacbd4a:docs/plans/2026-05-07-plite-inline-delete-boundary-repro-ralplan.md:283-298
Proof: `packages/plitejs/test/delete-contract.ts` "removes an empty editable inline on Backspace without deleting preceding text" asserts an ! and the caret after an after deleting the inline. `apps/plite/tests/plite-browser/donor/examples/inlines.test.ts` "removes an empty editable inline with Backspace without deleting preceding text" empties an editable button, presses Backspace again, and checks the preceding character survives and native selection stays collapsed and usable; mobile is skipped. `packages/plitejs/src/transforms-text/delete-text-collapsed-path-targets.ts` targets an empty schema-inline parent only when it is editable and non-void. Browser proof belongs to a Plite example; nested-inline and Plate browser behavior remain unproven. Tests read, not run.

- `EDIT-DELETE-LEAF-DOM-001` `proposed` `Backspace, Delete, word deletion, range deletion or cut across formatting boundaries`: removing text must not introduce blank visual lines into a surviving nonempty paragraph. After an emptied leaf is removed, the caret resolves to surviving editable text or a required inline spacer. An empty paragraph retains a caret-addressable placeholder.

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: Typora for paragraph deletion; secondary ref: none checked. No reference editor was checked for this DOM representation case.
Source: c70bacbd4a:docs/plans/2026-04-25-plite-leaf-lifecycle-dom-shape-conformance-plan.md:104-159
Proof: `packages/plitejs/test/leaf-lifecycle-contract.ts` "removes removable empty marked leaves after destructive word deletes" asserts no empty text leaves and an exact surviving caret after four word deletes. `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts` "keeps rendered DOM shape after repeated leaf-boundary word-delete" checks Chromium innerText against model text, no unexpected zero-width breaks, a collapsed editable DOM selection and subsequent insertion. It does not cover every deletion transport or the empty-paragraph placeholder. `packages/plitejs/src/core/representation.ts` canonicalizes inline children; resolveTextZeroWidth in `packages/plitejs/src/react/components/editable-text-blocks.tsx` reserves a line-break placeholder for an empty block rather than an empty leaf in a nonempty block. This is partial Plite model and browser-example proof; no pixel or raw-mobile claim is established. Tests read, not run.

### Autocomplete

Authority:

- syntax: none; a trigger and its query stay ordinary document text until completion
- primary UX ref: Notion for typed mention and slash menus, with the WAI-ARIA Authoring Practices combobox pattern for the popup's keys and announcements
- secondary ref: Lexical's typeahead menu, cross-checked against Atlassian's type-ahead, ProseKit, Tiptap and BlockNote

Ownership:

- one private combobox owner per mounted Editable opens, maps and ends an occurrence: a typed trigger and the query after it, anchored over the trigger
- each feature, such as mention, slash, emoji or footnote, keeps its trigger predicate, query policy, options and completed-node insertion; the Mention section owns a completed mention's spacing, deletion and keyboard access
- the popup's key, Escape, blur and IME behavior below applies to every feature that opens one

Plugin surface:

- a feature opens its popup through `useCombobox` from `platejs/combobox/react`, and the copied `inline-combobox` component renders it

- `EDIT-AUTOCOMPLETE-OPEN-001` `proposed` `typed trigger`: only a trigger typed locally in an Editable opens a popup. Caret placement, undo, redo, paste, yank, drop, a replacement and remote edits never open one, so one collaborator's edit never opens another user's popup

```text
Hi @jo| (loaded, not typed)
type h
=>
Hi @joh| with no popup
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Notion for typed mention and slash menus; secondary ref: Tiptap's `shouldShow` (PR #7384), added after its menus opened for collaborators, as Plate's did before #1461 and PR #4762
Source: docs/plite/research/2026-10-02-autocomplete-query-representation/shards/005-plate-history.md:111
Proof: the owner opens an occurrence only from `api.react.subscribeTypedText` (`packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts:427-431`), and Plite reports typed text only for `insertText` and composition commits that end at the caret: `packages/plitejs/test/react/typed-text.test.tsx:343-361` "%s with string data reports nothing" excludes `insertFromPaste`, `insertFromYank`, `insertFromDrop` and `insertReplacementText`, and `:363` "history replay and remote edits report nothing" covers redo and remote inserts, both at the Plite level. At the Plate level, `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx:590` "opens only for typed triggers, never for a caret placed after one" (happy-dom: `Hi @jo` loaded with the caret after it, typing `h` opens nothing) proves the caret clause, and `:170` asserts no match after undo; no Plate test pastes or applies a remote edit that inserts a trigger. Drift: an Android keyboard-clipboard paste arrives as `insertText` with no paste signal (`packages/plitejs/src/react/hooks/android-input-manager/android-input-manager.ts:1018-1023`), so it reports typed text and opens a popup; no test or device run covers it. Plan hard law 5 (`docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md:240`). Checked 2026-10-08.

- `EDIT-AUTOCOMPLETE-OPEN-002` `proposed` `trigger committed with following text`: a trigger committed together with following text in one insertion, as an IME or Gboard commit can land it, still opens the popup with the following text as its query, and a trigger committed alone through IME composition opens it too

```text
Hi |
one insertion of @jo
=>
Hi @jo| with the popup open on the query jo
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Notion for typed mention and slash menus; secondary ref: Lexical's typeahead menu, which reads the trigger from the text before the caret
Source: docs/plite/research/2026-10-03-autocomplete-arena/judge.md:42 and :72
Proof: `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx:208` "opens on a trigger inside one longer insertion, as an IME commit lands" (happy-dom: one `insertText` of `@jo` gives the query `jo`) proves the first clause through `insertText`, not a composition, and the www browser test "combobox:an IME-committed trigger opens the popup" in `apps/www/tests/browser/combobox.spec.ts` (Chromium only, CDP composition of `@`) proves the second. No browser case commits `@jo` in one IME commit, and no Gboard device run exists. Code: the trigger scan reads the typed length plus the longest trigger plus one character and accepts a trigger that ends inside the typed text (`packages/platejs/src/features/combobox/lib/combobox.internal.ts:124-151`). Checked 2026-10-08.

- `EDIT-AUTOCOMPLETE-SPAN-001` `proposed` `trigger and query`: a trigger and its query match across adjacent, differently formatted text in one editable text region, and the match stops at a root or block boundary, an inline atom or other inline element, non-editable content and a hard line break

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Notion for typed mention and slash menus; secondary ref: Lexical's typeahead menu, cross-checked against BlockNote and CKEditor 5, which read the query from the text before the caret
Source: docs/plite/research/2026-10-03-autocomplete-arena/contract.md:11
Proof: `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx:225` "matches a trigger typed across formatted leaves" and `:240` "finds a trigger split across leaves when the scan stops short of the run start" (happy-dom) prove a two-character trigger split across leaves, with an empty query; no test covers a query that spans formatting or any of the stops. Code: the trigger scan walks back over sibling text leaves and stops at the first non-text sibling (`packages/platejs/src/features/combobox/lib/combobox.internal.ts:32-47`), the query must share the trigger's root and parent with only text siblings between them (`:191-210`), and a newline ends it (`:77`); non-editable content stops the match only as a non-text element. Drift: a query typed across a format change closes the occurrence; a scratch probe on 2026-10-08 (happy-dom, package source) typed `@j`, turned bold on and typed `o`, and the match ended, because the typed-extent anchor (`packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts:310-313`) does not grow into the new leaf. Plan hard law 3 (`docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md:238`). Checked 2026-10-08.

- `EDIT-AUTOCOMPLETE-POLICY-001` `proposed` `query characters`: each feature keeps its own query character policy within a bounded query: a mention or command label may hold spaces after its first character, an emoji query accepts only shortcode characters, a trigger followed directly by whitespace stays prose, and the first-party features cap a query at 75 characters

Classification: parameter, by the tests in docs/vision/plate.md:129-137; each feature sets its own character policy and length cap; a bounded query is an invariant
Authority: syntax: none; primary UX ref: Notion for typed mention and slash menus; secondary ref: quill-mention's `allowedChars`, whose ASCII-only default ends a query on a space or a non-ASCII letter (#358)
Source: docs/plite/research/2026-10-03-autocomplete-arena/contract.md:12
Proof: `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx:599` "treats a trigger followed by whitespace as prose" (happy-dom) and the www browser test "combobox:a slash inside prose leaves Enter as a line break" in `apps/www/tests/browser/combobox.spec.ts` prove the prose clause, and "combobox:emoji completes a closed shortcode" proves only that `:` passes the emoji pattern. No test types a multiword label, a non-shortcode emoji character, a newline in a query or a query past 75 characters; `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx:565` types a 75-character query but asserts only the next trigger. Code: `isComboboxQuery` (`packages/platejs/src/features/combobox/lib/combobox.internal.ts:69-81`) and the read-time length cap (`:204-206`); the 75-character `maxQueryLength` of the mention and footnote base plugins (`packages/platejs/src/features/mention/lib/BaseMentionPlugin.ts:49`, `packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.ts:364`) and of the copied `SlashPlugin` and `EmojiPlugin` (`apps/www/src/registry/components/editor/slash.tsx:363`, `apps/www/src/registry/components/editor/emoji.tsx:68`), where the emoji kit also keeps its shortcode pattern. The copied popup also dismisses a query that ends in whitespace once no option matches (`apps/www/src/registry/components/editor/inline-combobox.tsx:164-169`). Plan hard law 4 (`docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md:239`). Checked 2026-10-19.

- `EDIT-AUTOCOMPLETE-PRECEDENCE-001` `proposed` `several triggers in one insertion`: when several installed features find a trigger in the same typed text, the trigger that starts latest wins, and plugin order breaks a tie at one position; each feature keeps its own trigger predicate, veto and insertion

```text
Hi |
one insertion of @x /
=>
Hi @x /| with the slash popup open, not the mention popup
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137; plugin order is the parameter that breaks a tie
Authority: syntax: none; primary UX ref: Notion for typed mention and slash menus; secondary ref: BlockNote, which opens on the longest registered trigger that typed text matches
Source: docs/plite/research/2026-10-03-autocomplete-arena/contract.md:19
Proof: `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx:216` "opens the most recently typed trigger when one insertion holds two" (happy-dom: `@x /` opens slash, not mention) proves the first clause; no test covers a tie at one position or a vetoed later trigger. Code: the owner scans its mounted popups in mount order, takes a candidate only when its trigger starts strictly later than the current winner, and lets a feature's `triggerQuery` veto it (`packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts:284-302`); a scratch probe on 2026-10-08 (happy-dom) found a vetoed later trigger falls back to the earlier one. Drift: mount order equals plugin order only on first mount, because a popup that remounts when its plugin or Editable ref changes joins the end of the list, so a tie then follows remount order. Plan hard law 11 (`docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md:246`). Checked 2026-10-08.

- `EDIT-AUTOCOMPLETE-VIEW-001` `proposed` `two views of one document`: only the Editable where the trigger was typed shows or activates its popup. Another mounted Editable of the same document shows no popup and no combobox ARIA, and focusing it ends the occurrence; another root, an inactive projection and a read-only view never open or adopt one

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Notion for typed mention and slash menus; secondary ref: Lexical's typeahead menu, which belongs to one editor instance
Source: docs/plite/research/2026-10-03-autocomplete-arena/contract.md:17
Proof: `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx:383` "keeps an occurrence in the view where the trigger was typed" (happy-dom, two Editables over one editor) asserts the first view's query `jo`, no match and no `aria-controls` in the second, and no match in either after the second takes focus; it does not assert the second root's role, `aria-expanded` or `aria-haspopup`. No test covers another root, an inactive projection or a read-only view, and no browser case mounts two views of one document. Code: an occurrence opens only from a typed-text report naming the owner's own element, in a focused, connected, writable view that is its own DOM root (`packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts:260-266`, `:281`, `:427-431`), the query must share the trigger's root (`packages/platejs/src/features/combobox/lib/combobox.internal.ts:193-195`), and focus in another `[data-editor]` element ends it (`packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts:251-258`). Plan hard law 9 (`docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md:244`). Checked 2026-10-08.

- `EDIT-AUTOCOMPLETE-OCCURRENCE-001` `proposed` `option completion`: an offered option belongs to its feature, its occurrence and its query. Replacing or deleting the trigger ends the occurrence, and an option offered for an earlier occurrence never completes a later one, even when the trigger and query text are equal

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Notion for typed mention and slash menus; secondary ref: ProseKit, which maps its match range through each transaction
Source: docs/plite/research/2026-10-03-autocomplete-arena/contract.md:14
Proof: `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx:676` "refuses a match from a dismissed occurrence on a newer one with equal text" and `:722` "ends the occurrence when the trigger is replaced in one change" (happy-dom) prove the equal-text and replacement clauses; no test deletes the trigger alone or completes one feature's option through another popup. Code: a range anchor covers the trigger, each match maps to its occurrence, which `complete` compares, and changed trigger text ends the match (`packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts:62-63`, `:100-107`, `:315`; `packages/platejs/src/features/combobox/lib/combobox.internal.ts:207`). Plan hard law 6 (`docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md:241`). Checked 2026-10-08.

- `EDIT-AUTOCOMPLETE-KEYS-001` `proposed` `Enter, Tab, ArrowUp, ArrowDown or Escape`: while a popup is open, it takes unmodified Enter, Tab, ArrowUp, ArrowDown and Escape before any Plate plugin key handler or shortcut; Shift, Alt, Ctrl and Meta chords pass through, and an IME-confirming key follows `EDIT-AUTOCOMPLETE-IME-001`. While the popup is hidden or closed, those keys keep their editor behavior

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Notion for typed mention and slash menus; secondary ref: Lexical's typeahead, whose keys competed with table selection until `lexical-table` checked the root's `aria-controls` (#5819, PR #5820)
Source: docs/plite/research/2026-10-02-autocomplete-query-representation/lead-ledger.tsv:21
Proof: `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx:357` "gives the open popup its keys before the shortcut table, but not Shift chords" (happy-dom) proves Tab against the shortcut table and Shift+Enter passing through, and `:340` "leaves keys to the editor while the popup is hidden" proves the hidden case for ArrowDown; in `apps/www/tests/browser/combobox.spec.ts`, "combobox:mention completes typed text and undo restores it" and "combobox:arrow keys scroll the active option into view" cover Enter and the arrows with the popup open, and "combobox:moving past the typed query closes the popup" and "combobox:a slash inside prose leaves Enter as a line break" cover Enter once it is closed, in Chromium, Firefox and WebKit. No test checks a plugin key handler, an Alt, Ctrl or Meta chord, or a popup inside a table cell, code block or list. Code: the claimed key handler runs before the piped plugin handlers (`packages/platejs/src/react/components/EditorContentView.internal.tsx:241-242`), and the owner offers only those keys (`packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts:52`, `:323-342`). Drift: the copied popup refuses every key while it renders no options (`apps/www/src/registry/components/editor/inline-combobox.tsx:93`), so with only "No results" showing, Enter falls through and splits the block. Checked 2026-10-08.

- `EDIT-AUTOCOMPLETE-ESC-001` `proposed` `Escape`: Escape ends the open occurrence and leaves the trigger and query as literal text. The popup stays closed while the user keeps typing, moves the caret away and back, or receives a remote edit, until a trigger is typed again

```text
Hi @jo| (popup open)
Escape, type an
=>
Hi @joan| with no popup
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Notion for typed mention and slash menus; secondary ref: ProseKit's mapped ignore list (#976) and Draft.js mention's `escapedSearch`, against Tiptap, whose menu reopens after Escape and arrow keys (#7371)
Source: docs/plite/research/2026-10-02-autocomplete-query-representation/lead-ledger.tsv:11
Proof: the www browser test "combobox:Escape keeps the query as text without reopening" in `apps/www/tests/browser/combobox.spec.ts` (Chromium, Firefox and WebKit: `/h`, Escape, `1` gives `/h1` with no `aria-controls`) proves the first three clauses with a real key, and `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx:609` "keeps the literal query when dismissed and does not reopen" and `:622` "stays closed after Escape through a remote edit and a caret return" (happy-dom) prove the typing, remote-edit and caret-return clauses through `dismiss()`, not an Escape key; `:676` shows a newly typed trigger opens again. Escape reaches the owner only while the popup shows (`packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts:327`, `:337-342`), so a hidden popup, such as emoji's with an empty query, leaves Escape to the editor. Plan hard law 5 (`docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md:240`). Checked 2026-10-08.

- `EDIT-AUTOCOMPLETE-BLUR-001` `proposed` `outside click or focus moving away`: an outside click, or focus moving to another editor, ends the open occurrence and closes its popup. The trigger and query stay as literal text, typing back inside them does not reopen it, and a click past the query leaves the caret where the click landed

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Notion for typed mention and slash menus; secondary ref: BlockNote, whose menu closes on blur, and Draft.js mention, whose list closes when the editor loses focus
Source: docs/plite/research/2026-10-02-autocomplete-query-representation/shards/005-plate-history.md:112
Proof: `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx:463` "ends when another editor takes focus" (happy-dom) proves the focus clause, and the www browser tests "combobox:an outside click closes the popup and keeps the query" and "combobox:a click past the query closes the popup at the clicked caret" in `apps/www/tests/browser/combobox.spec.ts` (Chromium, Firefox and WebKit) prove the outside click, the literal text, no reopening after typing back inside and the clicked caret. Drift: the package owner does not end an occurrence when focus leaves for a non-editor target; the copied popup closes it through Ariakit's `hideOnInteractOutside` (`apps/www/src/registry/components/editor/inline-combobox.tsx:179-181`, `:218-221`), so a custom popup built on `useCombobox` stays open after an outside click. Plan hard law 12 (`docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md:247`). Checked 2026-10-08.

- `EDIT-AUTOCOMPLETE-REMOTE-001` `proposed` `remote edit before the trigger`: a remote edit before the trigger maps the open occurrence, which keeps its trigger, its query text and its popup

```text
Hi @jo| (popup open on jo)
remote insert of Oh at the start
=>
Oh Hi @jo| with the popup still open on jo
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Notion for typed mention and slash menus; secondary ref: BlockNote, which tracks the query start as a Yjs relative position, and ProseKit, which maps its range through `tr.mapping`
Source: docs/plite/research/2026-10-02-autocomplete-query-representation/lead-ledger.tsv:13
Proof: `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx:278` "keeps the occurrence through a remote edit before the trigger" (happy-dom: a local update tagged `collaboration` inserts `Oh ` at the start, and the text reads `Oh Hi @jo` with the query `jo`) proves the query and match survive; it does not assert the trigger range or the popup's `aria-controls`, and no test runs a real Yjs peer. Code: range anchors over the trigger and the typed extent (`packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts:309-316`). Plan hard law 5 (`docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md:240`). Checked 2026-10-08.

- `EDIT-AUTOCOMPLETE-UNDO-001` `proposed` `completion, undo and redo`: completing an option replaces the trigger and query in one update and one undo step. Undo restores the typed trigger, query and caret without reopening the popup, and redo restores the completed content; for a mention, completing `@jo` gives one mention node, undo gives back `@jo` with the caret after it and no popup, and redo gives back the mention

```text
Hi @jo| (popup open)
complete Joan
=>
Hi [@Joan]|
undo
=>
Hi @jo| with no popup
redo
=>
Hi [@Joan]|
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Notion for typed mention and slash menus; secondary ref: quill-mention, whose History merge can fold a fast completion into the typing before it, and Plate's v33 undo crash (#3103)
Source: docs/plite/research/2026-10-02-autocomplete-query-representation/shards/005-plate-history.md:109-110
Proof: `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx:170` "opens on a typed trigger and completes the query as one undo step" (happy-dom) completes `@jo` with a mention and asserts `Hi `, the mention and an empty text, then after undo `Hi @jo` with the caret at offset 6 and no match, then after redo the mention again, which proves every clause but the caret after redo; the www browser test "combobox:mention completes typed text and undo restores it" in `apps/www/tests/browser/combobox.spec.ts` (Chromium, Firefox and WebKit) completes `@biggs` with Enter and asserts the literal query after undo with no mention and no `aria-controls`, without a caret check or redo. Code: `complete` writes in one `new-batch` update (`packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts:120-157`). Plan hard laws 7 and 8 (`docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md:242`, `:243`). Checked 2026-10-08.

- `EDIT-AUTOCOMPLETE-PREEDIT-001` `proposed` `IME preedit`: while an IME composes the query after a typed trigger, the popup filters by the live preedit, and the preview writes nothing into the document, moves neither focus nor selection and creates no history

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Notion for typed mention and slash menus; secondary ref: Atlassian's type-ahead, which keeps the composing query out of the document
Source: docs/plite/research/2026-10-03-autocomplete-arena/contract.md:10
Proof: the www browser test "combobox:IME preedit filters without publishing text" in `apps/www/tests/browser/combobox.spec.ts` (Chromium only, CDP `Input.imeSetComposition` on `/blocks/mention-demo`) asserts that the options follow the preedit `biggs` while the model text stays `@Mention`, and `@biggsMention` after the commit; no test checks focus, selection or history during the preview, and no physical IME has run. Code: while composing, the owner previews the DOM text from the trigger end to the caret and keeps it only when it passes the feature's query policy (`packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts:390-400`). Plan hard law 2 (`docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md:237`). Checked 2026-10-08.

- `EDIT-AUTOCOMPLETE-IME-001` `proposed` `IME-confirming key`: while an autocomplete popup is open, a key that confirms an IME composition never selects or completes an option; the composition commits instead. A confirming key is a keydown with `isComposing` set or with keyCode 229, which Safari sends after `compositionend` and virtual keyboards send while composing. Completion also refuses while a composition is active

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Notion for typed mention and slash menus; secondary ref: Atlassian's `isComposing` plus keyCode 229 guard, Lexical's keydown gate while composing, and ProseKit's open PR #1743, where Pinyin's commit Enter selected an item
Source: docs/plite/research/2026-10-02-autocomplete-query-representation/lead-ledger.tsv:7
Proof: none. No test in `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx` or `apps/www/tests/browser/combobox.spec.ts` presses an IME-confirming key with a popup open; `packages/platejs/src/react/utils/dispatchPlateShortcut.spec.ts` "runs no shortcut for a composing key or an IME-confirm Enter" proves only the shortcut table's guard. Code: the popup's key claim skips `isImeConfirmKeyEvent` (`packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts:323-342`, `packages/platejs/src/react/utils/dispatchPlateShortcut.internal.ts:44-47`), `complete` refuses while `isComposing()` holds (`packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts:108-111`), and Plite runs no Editable `onKeyDown` while it is composing (`packages/plitejs/src/react/editable/keyboard-input-strategy.ts:692-698`). Risk: Plite has no keyCode 229 guard, and a scratch probe on 2026-10-08 (happy-dom) sent Enter with keyCode 229 while a popup was open after the composition ended; the popup did not take it, and Plite split the block, which ends the occurrence. Whether WebKit's real 229 Enter after `compositionend` splits too is unproven; WebKit's confirming Enter on a real IME is open work in `docs/plans/topics/autocomplete.md`. Plan hard law 10 (`docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md:245`). Checked 2026-10-08.

- `EDIT-AUTOCOMPLETE-IME-002` `proposed` `click or tap on an option during composition`: clicking or tapping an option while an IME composes the query completes that option: the pointer press lets the editor blur, which ends the composition, and the completed node replaces the trigger and the composed text with the caret after it

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Notion for typed mention and slash menus; secondary ref: Atlassian's type-ahead, whose blur commits the raw query before an item is inserted
Source: docs/plite/research/2026-10-03-autocomplete-arena/contract.md:18
Proof: the www browser test "combobox:clicking an option during IME composition completes it" in `apps/www/tests/browser/combobox.spec.ts` (Chromium only, CDP composition of `biggs`, then a click on "Biggs Darklighter") asserts one mention node, model text `Mention`, the caret at offset 0 of `[0, 2]` and no `aria-controls`; it does not assert the blur or focus afterwards. Code: the copied popup prevents an option's `mousedown` only while no composition is active (`apps/www/src/registry/components/editor/inline-combobox.tsx:223-226`), and `complete` settles native input and still refuses while a composition is active (`packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts:108-113`). Known gap: under Pixel 5 emulation the blur leaves Plite's model caret past the committed text and the tap refuses (`2e865a0bc4:docs/research/decisions/autocomplete-ownership.md:186-193`); no Android device or iOS run exists. Plan hard law 10 (`docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md:245`). Checked 2026-10-08.

- `EDIT-AUTOCOMPLETE-A11Y-001` `proposed` `screen reader`: while an autocomplete popup is open, assistive technology announces the caret as inside a combobox and follows the active option, while focus and IME stay in the editor

Classification: invariant, by the tests in docs/vision/plate.md:129-137; without it the popup is inaccessible to screen-reader users
Authority: syntax: none; primary UX ref: the WAI-ARIA Authoring Practices combobox pattern; secondary ref: Atlassian's type-ahead, which gives the focused query element combobox ARIA
Source: docs/plite/research/2026-10-02-autocomplete-query-representation/shards/005-plate-history.md:103-108
Proof: none: no screen reader has run (VoiceOver with Safari and Chrome, NVDA with Chrome), and an accessibility-tree read proves only the exposed node. Code: while an occurrence has a match, even with its popup hidden, the editor root takes `role=combobox`, `aria-haspopup=listbox`, `aria-autocomplete=list` and `aria-expanded` and drops `aria-multiline`, takes `aria-controls` while the popup shows and `aria-activedescendant` while an option is active, and gets its own values back afterwards unless the app changed them (`packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts:199-239`). `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx:294` "makes the editor root a combobox for the occurrence and restores it after" (happy-dom) asserts the role, `aria-expanded`, `aria-haspopup` and `aria-multiline` and their restore, not `aria-autocomplete`, `aria-controls` or `aria-activedescendant`; the www mention test finds the root by `getByRole('combobox', { expanded: true })`. Origin: the 2024 reason for Plate's input element (udecode/plate#3168). Checked 2026-10-08.

### IME And Composition

- `EDIT-IME-*` `locked`

note: IME composition should stay inside the active text owner and must not
double-apply committed text at block or inline-atom boundaries

note: platform text-editing norms decide IME behavior, with product-specific owner behavior at atoms, code blocks and tables

- `EDIT-IME-REPLACEMENT-UNDO-001` `proposed` `IME composition replacing an expanded text selection, then undo or redo`: one composition forms one undo action, including replacement across marked leaves, a composition longer than ordinary typing's grouping delay, and compositionend before terminal input. One undo restores the exact prior content, marks and expanded selection, including its direction. One redo restores the exact composed content and selection, with no duplicate committed text.

```text
This is [[editable **rich** text]], done
replace the selection with one composition of すし
=>
This is すし|, done
undo
=>
This is [[editable **rich** text]], done
redo
=>
This is すし|, done
```

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: platform text-editing norms for composition; secondary ref: none checked. No reference editor or physical IME was checked.
Source: docs/plans/2026-05-07-plite-mobile-ime-input-runtime-ralplan.md:2349-2359; docs/plans/2026-08-22-plite-long-ime-history-atomicity-regression.md:295-306
Proof: `packages/plitejs/test/react/composition-state-contract.test.ts` "keeps a marked multi-leaf composition replacement in one history unit" asserts complete prior value and selection after one undo, and composed value and selection after redo. Its fixture is forward-selected. `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts` "keeps long expanded marked composition atomic when compositionend precedes final input" waits 1100ms during a synthetic desktop Chromium composition, dispatches compositionend before final beforeinput, and asserts exact value and selection through one undo and redo. `packages/plitejs/src/react/editable/composition-state.ts` carries replacement history merging through the composition session. Backward direction has source support from saved-selection restoration but is not asserted by these inspected current cases. Browser proof is a Plite example, not physical IME, mobile or Plate product proof. Tests read, not run.

- `EDIT-IME-NONOVERLAP-KEEP-001` `proposed` `app, model or remote edit outside the composition`: an edit whose range lies outside the active IME composition leaves the composition running under browser ownership, and the composition commits once, at the caret that edit adjusted

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: platform text-editing norms for an IME composition; secondary ref: ProseMirror, which keeps a composition alive through edits elsewhere
Source: c70bacbd4a:docs/plite/research/2026-06-12-ime-overlap-policy/README.md:32-37
Proof: only a Plite example proves it: `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:2687` "preserves native IME composition when model text changes before it" (Chromium only, real CDP composition on Plite's richtext example) inserts `>` at offset 0 while `段` composes at offset 4 and asserts `>one 段two three`, the selection after the composed text and an allowed `compositionend` in the kernel trace; `:2756` "keeps native IME composition coherent when model delete starts at composition point" deletes `two` from the composition point and asserts the composition still commits, giving `one 段 three`. No test covers a remote-tagged edit, an edit in another block, another browser or Plate. Code: while composing outside Android, DOM writes to the composing node wait until the composition ends (`packages/plitejs/src/react/editable/editable-dom-runtime.ts:785-806`), and the composition target is anchored so it follows the edit (`packages/plitejs/src/react/editable/composition-state.ts:882-895`). An edit that intersects the composition is the open policy question in current-evidence's Open work. Checked 2026-10-08.

- `EDIT-IME-ENTER-COMPOSING-001` `proposed` `↵ during composition`: Enter pressed during an active IME composition belongs to the browser and the IME: the editor neither calls `preventDefault()` nor splits the block or runs any other model command on that keydown, and the IME decides how the composition commits

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: platform text-editing norms for an IME composition; secondary ref: the contenteditable catalog oracles of 2026-06-13
Source: c70bacbd4a:docs/plite/research/2026-06-13-contenteditable-catalog-oracles/README.md:17-21
Proof: while Plite is composing, its keydown strategy returns the event handled without `preventDefault()` before any Editable or Plate `onKeyDown` runs (`packages/plitejs/src/react/editable/keyboard-input-strategy.ts:692-698`), and Plate's shortcut table skips a keydown with `isComposing` set or keyCode 229 (`packages/platejs/src/react/utils/dispatchPlateShortcut.internal.ts:44-55`). `packages/plitejs/test/react/keyboard-input-strategy-contract.test.ts:1116` "keeps Enter during active composition browser-owned" (vitest, a mocked composing editor and an `isComposing` event) asserts the event handled, `onKeyDown` not called, no `preventDefault()` and unchanged children, and `packages/platejs/src/react/utils/dispatchPlateShortcut.spec.ts` "runs no shortcut for a composing key or an IME-confirm Enter" proves the shortcut guard; `apps/www/tests/browser/code-block-codemirror.spec.ts` "code-block: composing ${key} leaves code unchanged" proves it for the CodeMirror code view only, with synthetic composition events. No browser test presses Enter during a real composition in a contenteditable paragraph, and no test covers an `insertParagraph` beforeinput during composition. Risk, read from the code and not run: WebKit sends the confirming Enter after `compositionend` with keyCode 229 and `isComposing` false, Plite then clears its composing state and runs its line-break path (`packages/plitejs/src/react/editable/keyboard-input-strategy.ts:692`, `packages/plitejs/src/react/editable/editing-kernel.ts:850`), and Plite has no keyCode 229 guard. Checked 2026-10-08.

- `EDIT-IME-ANDROID-AUTOCORRECT-001` `proposed` `space that accepts an autocorrection`: on Android Chrome with Gboard auto-correction on, the space that accepts a correction replaces the misspelled word in place, so the corrected word appears once and the word typed next follows it with the caret after it

```text
|
type becuase, space, go
=>
Because go|
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Android platform text editing, where a plain `<textarea>` and a bare `contenteditable` on the same device receive `deleteContentBackward` and then `insertText` `because ` for that space, with no composition; secondary ref: Slate #5891
Source: docs/plite/research/2026-10-02-agentic-e2e-testing/issue-drafts/android-gboard-autocorrect-append.md:27-31
Proof: none passes. `apps/plite/tests/device/autocorrect-empty.device.ts` "autocorrect on space in an empty editor replaces the word and keeps typing after it (Slate #5891)" runs on Plite's `custom-placeholder` example and declares the rule's failure as a known failure (desired `Because go`, observed `BecuasegoBecause `); `device.knownFailure` passes only while the failure still reproduces (`packages/test/src/device/lane.ts:624-672`). It reproduced in five of five runs on one Android emulator (Pixel 9, API 36, Chrome 146, Gboard 17.0.14) on 2026-10-02 (`docs/plite/research/2026-10-02-agentic-e2e-testing/sources/device-runs/2026-10-02T2315Z-final/five-runs-summary.json`); the device lane is manual, no physical phone has run it, and nothing runs it on a Plate editor. The neutral-page census is `docs/plite/research/2026-10-02-agentic-e2e-testing/shards/010-android-lane-probes.md:59`, `:65-67`. Checked 2026-10-08.

- `EDIT-IME-ANDROID-HANGUL-001` `proposed` `Korean jamo and ↵`: with Gboard Korean 두벌식 on Android Chrome, jamo typed into an empty paragraph under its placeholder, or at the end of a text block, compose into syllables, as Gboard composes a whole word across jamo in a plain `<textarea>`; Enter then ends the composition and splits after the composed word, leaving an empty second block with the caret

```text
|
type ㅇ ㅏ ㄴ ㄴ ㅕ ㅇ, then ↵
=>
안녕
|
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Android platform text editing, where a plain `<textarea>` and a bare `contenteditable` on the same device compose `한글` across jamo; secondary ref: Slate #5493 and #5883
Source: docs/plite/research/2026-10-02-agentic-e2e-testing/issue-drafts/android-gboard-korean-composition.md:28-34
Proof: none passes. `apps/plite/tests/device/korean-placeholder.device.ts` "commits a Korean word typed under the placeholder once, then Enter splits after it (Slate #5493, #5883)" runs on Plite's `custom-placeholder` example, asserts a `compositionstart` was seen and declares two known failures: Plite reads `ㅇㅏㄴㄴㅕㅇ` instead of `안녕`, and Enter splits before the composing jamo. It reproduced in five of five runs on the same Android emulator and Gboard build as `EDIT-IME-ANDROID-AUTOCORRECT-001` on 2026-10-02 (`docs/plite/research/2026-10-02-agentic-e2e-testing/sources/device-runs/2026-10-02T2315Z-final/five-runs-summary.json`); the end-of-text clause rests on one probe trace of Plite's `plaintext` example, not a repeating case, and nothing runs on a Plate editor or a physical phone. The neutral-page census is `docs/plite/research/2026-10-02-agentic-e2e-testing/shards/010-android-lane-probes.md:62-66`. Checked 2026-10-08.

- `EDIT-IME-ANDROID-EMPTY-LEAF-001` `proposed` `first composed keys in an empty paragraph`: on Android Chrome, the keys a Japanese romaji or Chinese Pinyin IME composes into an empty paragraph under its placeholder stay in one composition and commit once, so `h`, `a` gives `は` and never `hあ` or a doubled first letter; Korean jamo follow `EDIT-IME-ANDROID-HANGUL-001`

```text
| (placeholder shown)
type h, a with Gboard Japanese romaji, then confirm
=>
は|
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: platform text-editing norms for an IME composition, though no neutral-page census has typed Japanese or Pinyin on the device; secondary ref: Slate #5883 (Gboard 14.2 Japanese romaji, `hあ`), Slate #5493 and Slate PR 6096, which names Pinyin
Source: docs/plite/research/2026-10-02-agentic-e2e-testing/shards/005-android-scenarios-from-slate.md:21 and :44-45
Proof: none. No device, browser or package case composes Japanese or Pinyin on Android: the device lane's keyboard types only English and Korean (`packages/test/src/device/android.ts:32`), and the shard's case 1 (`docs/plite/research/2026-10-02-agentic-e2e-testing/shards/005-android-scenarios-from-slate.md:93`) runs Korean only, which `EDIT-IME-ANDROID-HANGUL-001` states. That Korean case, `apps/plite/tests/device/korean-placeholder.device.ts`, fails under the same placeholder in another way: each jamo commits on its own, as a probe also saw at the end of a text block, rather than a first character doubling. The nearest proof is desktop Chromium on Plite's `custom-placeholder` example: `apps/plite/tests/plite-browser/donor/examples/placeholder.test.ts:133` "commits IME composition from the custom placeholder empty state" composes `a`, `ab` and `abc` through CDP `Input.imeSetComposition` from the placeholder's empty state and asserts `abc` once, the caret at offset 3 and the placeholder hidden; it uses no Android keyboard, Japanese or Pinyin. Nothing runs on a Plate editor or a physical phone. Checked 2026-10-08.

- `EDIT-IME-ANDROID-STRIP-REPLACE-001` `proposed` `suggestion-strip tap`: on Android Chrome, tapping a suggestion-strip candidate that corrects the misspelled word just typed replaces that word in place: exactly one corrected word appears, with no duplicated prefix, the text before it stays unchanged, and the corrected word keeps the marks of the word it replaces, so a word typed at the end of a bold run stays bold, as `EDIT-AFF-MARK-001` says; a collapsed caret follows the word and any space the keyboard commits with it, and the soft keyboard stays shown

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Android platform text editing, where on a neutral page on the same device Gboard answers a tap on `hello` after `helo` with `deleteContentBackward` and then `insertText` `lo `, the corrected suffix and a space; secondary ref: Slate #5643, #5130, #4602 and #5371
Source: docs/plite/research/2026-10-02-agentic-e2e-testing/shards/005-android-scenarios-from-slate.md:94
Proof: only a Plite route proves it, on one Android emulator: `apps/plite/tests/device/strip-replace.device.ts` "a suggestion-strip replacement after a bold leaf commits one corrected word (Slate #5643, #5130)" taps the end of the `bold` leaf on Plite's `richtext` example, types ` helo` with Gboard English, taps the `hello` candidate and asserts that the tap sent `deleteContentBackward` then `insertText`, that the paragraph holds `bold hello`, one `hello` and no repeated `hel` prefix, that its bold leaf starts with `bold hello`, a collapsed caret whose preceding text ends in `hello` once a trailing space is trimmed, and the keyboard still shown. It passed five of five warm runs on one Android emulator (Pixel 9, API 36, Chrome 146, Gboard 17.0.14) on 2026-10-02 (`docs/plite/research/2026-10-02-agentic-e2e-testing/sources/device-runs/2026-10-02T2315Z-final/five-runs-summary.json`). It checks the text before the word only as far as `bold `, and the text after it not at all. The case starts from a misspelled prefix because a candidate that only extends the typed prefix sends no replacement (`docs/plans/2026-10-02-proof-device-lane.md:86`); the neutral-page probe is `docs/plite/research/2026-10-02-agentic-e2e-testing/shards/010-android-lane-probes.md:46-48`. The shard's case 2 oracle keeps the bold leaf unchanged; the case expects the bold run to continue instead, which `EDIT-AFF-MARK-001` and `EDIT-AFF-MARK-DELETE-001` both give, since the replaced and the typed text sit at the end of the bold run. The device lane is manual, and nothing runs on a Plate editor or a physical phone. Checked 2026-10-08.

- `EDIT-IME-ANDROID-MARK-TOGGLE-001` `proposed` `toolbar mark at a collapsed caret, then typing`: on Android Chrome, tapping a toolbar mark button such as Bold at a collapsed caret keeps the soft keyboard shown, and the characters typed next land in one leaf carrying that mark, with the caret at the end of that leaf

```text
plain|
tap Bold, type ab, then c
=>
plain**abc|**
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: platform text-editing norms on Android, where formatting the caret does not dismiss the soft keyboard; secondary ref: Slate #6022 and PR 6027, and Slate #4405
Source: docs/plite/research/2026-10-02-agentic-e2e-testing/shards/005-android-scenarios-from-slate.md:96
Proof: only a Plite route proves it, on one Android emulator: `apps/plite/tests/device/bold-toggle.device.ts` "a collapsed Bold toggle keeps the keyboard and types one bold run (Slate #6022)" taps the end of the first block on Plite's `richtext` example, taps that example's own Bold button, whose pointerdown handler prevents the default and toggles the mark (`apps/www/src/app/(app)/examples/plite/_examples/richtext.tsx:577-583`), asserts the keyboard still shown, types `ab` and then `c`, and asserts the block text gains `abc`, one bold leaf `abc`, a collapsed caret in a bold leaf after `abc` and the keyboard still shown. It passed five of five warm runs on one Android emulator (Pixel 9, API 36, Chrome 146, Gboard 17.0.14) on 2026-10-02 (`docs/plite/research/2026-10-02-agentic-e2e-testing/sources/device-runs/2026-10-02T2315Z-final/five-runs-summary.json`). At model level, `packages/plitejs/test/react/android-input-manager-contract.test.ts:1202` "keeps selection on the marked inserted leaf after collapsed mark typing" (vitest, a mocked DOM point) adds bold at a collapsed caret, sends `insertText` through the Android input manager and asserts a bold leaf `w` with the caret at its end. No mark but Bold has run, nothing runs Plate's copied toolbar or a Plate editor on a device, and physical phones are unproven. Checked 2026-10-08.

- `EDIT-IME-ANDROID-MENTION-TAP-001` `proposed` `touch on a mention option`: on Android Chrome, after a mention query typed on the soft keyboard with no composition active, a touch on a combobox option replaces the trigger and query with exactly one mention and leaves a collapsed caret after it with the soft keyboard still shown; Backspace then removes the mention as one atom, as `EDIT-MENTION-BS-START-001` says, without multiplying text, and the keyboard stays shown. A touch during a composition follows `EDIT-AUTOCOMPLETE-IME-002`

```text
Mention @bi| (popup open)
touch Biggs Darklighter
=>
Mention [@Biggs Darklighter]|
⌫
=>
Mention |
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Notion for typed mention and slash menus; secondary ref: plate#1230 and Slate #5680, #5357, #5052 and #5540
Source: docs/plite/research/2026-10-02-agentic-e2e-testing/shards/005-android-scenarios-from-slate.md:97
Proof: one device case runs it on a Plate editor, on one Android emulator: `apps/plite/tests/device/mention-taps.device.ts` "a mention option tap commits once and Backspace removes the mention (autocomplete Android gate)" opens www's `/blocks/mention-demo`, taps the end of its first block, types ` @bi` with Gboard English, which composes nothing there, touches "Biggs Darklighter" and asserts one more mention node than before, the keyboard shown and a collapsed caret; it then presses Backspace twice and asserts the mention count back at its start with the keyboard shown. It reads no text, so it shows neither that the trigger and query are gone nor that no text multiplied, and it does not show which Backspace removed the mention. It passed five of five warm runs on one Android emulator (Pixel 9, API 36, Chrome 146, Gboard 17.0.14) on 2026-10-02 (`docs/plite/research/2026-10-02-agentic-e2e-testing/sources/device-runs/2026-10-02T2315Z-final/five-runs-summary.json`) and again on 2026-10-04 (`docs/research/review-records/2026-10-04-autocomplete-occurrence-host-phase-1b.json`). The planned tap during a Korean composition was cut because no option matches a Korean query (`docs/plans/2026-10-02-proof-device-lane.md:88`), so a touch during a composition stays unproven on a device, and no physical phone has run. Checked 2026-10-08.

- `EDIT-IME-ANDROID-PENDING-TOOLBAR-001` `proposed` `toolbar block-type tap during composition`: on Android Chrome, tapping a toolbar block-type button while a word is still composing, such as a Gboard Korean word, keeps the composing text in the model, applies the block type to its block and removes no block

```text
text 한| (한 still composing)
next
tap the toolbar's heading button
=>
# text 한
next
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: platform text-editing norms for an IME composition, where acting on another control never discards the composed text; secondary ref: Slate #5019, #4861, #5078 and #5893
Source: docs/plite/research/2026-10-02-agentic-e2e-testing/shards/005-android-scenarios-from-slate.md:98
Proof: only a Plite route proves it, on one Android emulator: `apps/plite/tests/device/pending-korean-toolbar.device.ts` "a pending Korean word survives a toolbar block-type tap (Slate #5019)" taps the end of the first block on Plite's `richtext` example, types `ㅎㅏㄴ` with Gboard Korean, checks that the last composition event is a `compositionstart` or `compositionupdate`, so the tap lands while the word still composes, taps that example's own heading-one button and asserts the block becomes `heading-one`, its text equals the model text read before the tap, and the block count stays the same. It passed five of five warm runs on one Android emulator (Pixel 9, API 36, Chrome 146, Gboard 17.0.14) on 2026-10-02 (`docs/plite/research/2026-10-02-agentic-e2e-testing/sources/device-runs/2026-10-02T2315Z-final/five-runs-summary.json`). It asserts no text value, and given the `EDIT-IME-ANDROID-HANGUL-001` failure the model likely holds separate jamo rather than `한` (inferred, not read). Code: Plite's DOM plugin maps its pending Android text diffs, selection and action through every transaction change (`packages/plitejs/src/dom/plugin/with-dom.ts:68-106`, `:234-236`). No other language has run, nothing runs Plate's copied toolbar or a Plate editor on a device, and physical phones are unproven. Checked 2026-10-08.

- `EDIT-IME-SWIPE-BACKSPACE-001` `proposed` `⌫ after a swiped word`: after a word entered by swipe typing on a virtual keyboard, in iOS Safari or Android Chrome, the first Backspace keeps the browser's `deleteWordBackward` intent and deletes that whole word exactly once, and later Backspaces delete one character each

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: iOS and Android virtual-keyboard platform behavior, where the first Backspace after a swiped word deletes the word; secondary ref: none inspected; the requirement comes from the 2026-07-25 architecture audit's harvest list (`docs/plans/2026-07-25-multi-editor-full-architecture-audit.md:2609-2614`)
Source: docs/plite/research/2026-10-02-agentic-e2e-testing/read-log.tsv:356
Proof: none: no device, browser or package test has run swipe input (a search for `swipe` and `glide` in `apps/plite/tests`, `apps/www/tests`, `packages/plitejs` and `packages/platejs/src` found only the device lane's adb `input swipe` helper on 2026-10-08), and no iOS device lane exists. Checked 2026-10-08.

## Thematic Break And Atomic Blocks

Authority:

- syntax: CommonMark thematic break
- primary UX ref: Typora
- secondary ref: Milkdown

Ownership:

- thematic break is atomic for editing purposes
- `↵` and `⇧↵` on the break create a block of the parent's declared default
  type after it, not content inside the break

Plugin surface:

- thematic break currently has markdown parse and serialize behavior
- dedicated insert UI may exist elsewhere, but this section only defines
  post-insert editing law

- `EDIT-HR-ENTER-001` `locked` `↵`

```text
---
|
```

note: create the parent's declared default block after the HR, not content
inside it; when the parent cannot hold another block, `↵` changes nothing

- `EDIT-ATOMIC-ENTER-SELECTED-001` `proposed` `↵ or ⇧↵`: with a block atom selected, whether by a click or by arrow keys, `↵` or `⇧↵` inserts an empty block of the parent's declared default type after the atom and puts the caret at its end; when the parent cannot hold another block, the key changes nothing; it creates no text inside the atom

```text
::atom[name] (selected)
next
=>
::atom[name]
|
next
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: none checked; the rule generalizes `EDIT-HR-ENTER-001` and `EDIT-TOC-ENTER-201`, which state only the thematic-break and TOC cases, to every block atom
Source: 52625e85025313eebd4eeb9be2254249ded58676:docs/solutions/logic-errors/2026-04-26-plite-selectable-voids-should-be-atomic-navigation-points.md:91-96
Proof: only a Plite example proves it in a browser: `apps/plite/tests/plite-browser/donor/examples/images.test.ts:911` "inserts a paragraph after a clicked selected image on Enter" and `:941` (Shift+Enter) click the first image, which leaves the caret in its child `[1, 0]`, press the key, type and assert the typed text in its own block with the DOM caret after it; mobile skips both. Plite model tests: `packages/plitejs/test/snapshot-contract.ts:1428` (tagged `EDIT-HR-ENTER-001`) and `:1468` for `insertSoftBreak`, and `:1508` "a break on a selected block void lands its parent default", which covers a container's default, a declared prefix slot and a full parent for both keys. Code: `packages/plitejs/src/editor/insert-break.ts:69` hands a caret in a block void to `packages/plitejs/src/editor/block-void-break.ts`, which asks the schema for the parent's default child at that index and changes nothing when `canPlaceAt` refuses it. A model probe on 2026-10-08 (Bun, package source, no DOM) with a `void: 'block'` plugin and the caret in the void's child got an empty paragraph after the void with the caret at `[2, 0]`. Drift: a node selection on the atom makes `↵` do nothing (`packages/plitejs/src/editor/insert-break.ts:54`), the drift `EDIT-TOC-ENTER-201` records, so only the caret-in-child form meets the rule. Plate's only test of the rule is the TOC's (`packages/platejs/src/features/toc/lib/BaseTocPlugin.spec.ts:137`). Checked 2026-10-08.

- `EDIT-ATOMIC-BS-START-001` `locked` `⌫`

```text
|::atom[name]
```

note: select or remove according to atomic ownership, not generic merge

- `EDIT-ATOMIC-BS-AFTER-EMPTY-001` `proposed` `⌫`: with a collapsed caret in an empty paragraph directly after a block atom, `⌫` removes that empty paragraph and selects the atom; the same keypress never deletes the atom

```text
::atom[name]
|
next
=>
::atom[name] (selected)
next
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: none checked; the rule narrows `EDIT-ATOMIC-BS-START-001` ("select or remove according to atomic ownership") and the media rule for `⌫` at the start of the block after media to an empty paragraph, which neither decides
Source: 52625e85025313eebd4eeb9be2254249ded58676:docs/solutions/logic-errors/2026-04-26-plite-selectable-voids-should-be-atomic-navigation-points.md:82-90
Proof: only a Plite example proves it in a browser: `apps/plite/tests/plite-browser/donor/examples/images.test.ts:828` "removes an empty paragraph after an image before deleting the image" presses Backspace in the empty paragraph after the first image and asserts both images kept, the caret in the image's child `[1, 0]` and the image's selected style, on Chromium and WebKit; Firefox and mobile skip it. No Plate test covers it. A model probe on 2026-10-08 (Bun, package source, no DOM) with a `void: 'block'` plugin ran `deleteBackward` in the empty paragraph after the void: the paragraph was removed and the caret landed in the void's child `[1, 0]`, the selection form that `packages/platejs/src/lib/plugins/override/OverridePlugin.spec.tsx:50` asserts for `EDIT-ATOMIC-BS-START-001`. Checked 2026-10-08.

- `EDIT-ATOMIC-VOID-CARET-001` `proposed` `select a horizontal rule or block equation`: the atom remains selected without an extra editable blank row or a painted text caret below it. Any hidden text anchor exists only to support selection and focus; subsequent deletion, navigation and typing remain usable without changing content merely to hide the caret.

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: CommonMark thematic break and adopted math delimiters; primary UX ref: Typora; secondary ref: Milkdown. These inherit the atomic-block and math families' authority; no reference editor was checked for caret paint.
Source: c70bacbd4a:docs/plans/2026-08-29-block-void-caret-regression-attempt-2.md:496-500
Proof: `apps/www/tests/browser/block-void-caret.spec.ts` "block-void:native-caret-not-painted-below-void" clicks a horizontal rule, checks editor focus, selected state, transparent spacer caret and a zero-width node without br, then deletes and undoes it. Closing the block-equation editor checks its block selection, transparent caret and no br; later click, typing and undo remain usable. `packages/plitejs/src/react/components/editable-text-blocks.tsx` wraps block-void children in a spacer and renders void zero-width text without a line-break placeholder; `packages/plitejs/src/react/shell-runtime.ts` makes that spacer zero-height with transparent caret. This is a current Plate browser test with DOM/style assertions, not inspected pixel proof that no native caret paints. Test read, not run; Safari paint is unproven.

## Hard Line Break

Authority:

- syntax: CommonMark hard line break plus HTML fallback where needed
- primary UX ref: Typora
- secondary ref: Milkdown

Ownership:

- hard line breaks are inline syntax, not structural block owners
- the main law here is round-trip preservation inside paragraphs and blockquotes

Plugin surface:

- hard line breaks currently enter through markdown parse and serialize paths
- no dedicated insert transform is defined in this file
- prefer CommonMark hard-break syntax when one explicit inline break can still
  round-trip as markdown text
- use HTML `<br />` fallback only when the break semantics would otherwise be
  lost or normalized away, such as standalone or repeated trailing breaks

- `EDIT-HARD-*` `locked`

```text
alpha\\
beta
```

note: explicit hard breaks preserve their markdown meaning through round-trip
note: one inline break between visible text runs should stay in markdown-native
hard-break form instead of being eagerly rewritten to HTML

- `EDIT-HARD-*` `locked`

```text
> alpha\\
> beta
```

note: quoted hard breaks preserve the same meaning inside blockquotes, including
trailing break cases
note: HTML fallback is intentional only for preservation depth, not because
`<br />` is the preferred canonical form for ordinary hard-break text

## Expanded Selection Rules

- `EDIT-SEL-ENTER-001` `locked` `↵`

```text
[[> One
> Two]]
```

note: replace the selection with the owning behavior contract's split result

- `EDIT-SEL-BS-001` `locked` `⌫`

```text
[[> One
> Two]]
```

note: remove the selection without corrupting surrounding structure

note: `⌦` on an expanded selection, and `⌫` on a backward expanded selection, use the same structural cleanup as forward `⌫`; inside one paragraph the selected text is deleted in place and the paragraph wrapper stays

- `EDIT-SEL-TYPE-BLOCKS-001` `proposed` `typing over several whole blocks`: typing over an expanded selection that covers several whole sibling blocks replaces them with one block holding the typed text, with the caret after it, and the blocks after the selection stay

```text
[[one
two]]
three
type x
=>
x|
three
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Google Docs for document selection; secondary ref: ProseMirror (#112)
Source: c70bacbd4a:docs/editor-issue-harvester/prosemirror/full/checkpoints/issues-0086-0126.md:44-52
Proof: only a Plite example proves it in a browser: `apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts:726` "replaces a multi-paragraph selection with typed text" selects from the start of `one` to the end of `two`, types `replacement` and asserts `replacement`, `three` and the caret at offset 11; every block there is a paragraph, so it cannot show which block type wins. No Plate or www test types over whole blocks. Plate routes typing through Plite's `insertText` command (`packages/plitejs/src/react/editable/mutation-controller.ts:1166`), whose whole-block path (`getFullBlockTextReplacement` with `fillDefaultRootChild`, `packages/plitejs/src/core/editor-commands.ts:407-465`) builds the root's default block; a model probe on 2026-10-08 (Bun, package source, happy-dom) turned a fully selected heading and paragraph into one paragraph `X`, two whole list items into a plain paragraph without `listType` or `indent`, and a fully selected blockquote into a bare paragraph, while a selection starting one character into the heading kept the heading. Which type the replacement block takes, and whether list membership or a wholly selected wrapper survives, is open work under `EDIT-GLOBAL-005`. Checked 2026-10-08.

- `EDIT-SEL-TYPE-MARK-001` `proposed` `typing over marked text`: typing over an expanded selection whose selected text all carries the same marks gives the typed text those marks instead of falling back to unmarked text

```text
plain **[[bold]]** rest
type x
=>
plain **x|** rest
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Google Docs for document selection; secondary ref: ProseMirror (#399)
Source: c70bacbd4a:docs/editor-issue-harvester/prosemirror/full/checkpoints/issues-0345-0431.md:9-14
Proof: Plite proves it for one whole marked leaf: `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:819` "preserves selected text marks when typing a replacement" (Plite's richtext example) and `packages/plitejs/test/primitive-method-runtime-contract.ts:334` "insertText inherits consistent marks from a replaced selected range", run by `packages/plitejs/test/runtime-contracts.test.ts`. No Plate test covers it; a model probe on 2026-10-08 (Bun, package source, happy-dom) gave bold typed text over a bold leaf, over consistently bold text across two blocks and over whole bold blocks, and unmarked text over a mixed selection. Code: `getConsistentRangeTextMarks` requires every non-empty selected leaf to carry the same text properties (`packages/plitejs/src/internal/range-text-marks.ts:35-52`, used by `packages/plitejs/src/transforms-text/insert-text.ts:236-240`). Checked 2026-10-08.

- `EDIT-SEL-CUT-ALL-001` `proposed` `⌫, ⌦ or cut over the whole document`: deleting or cutting a selection that covers the whole document leaves one empty paragraph, never an empty shell of the removed block's type such as an empty heading, and the cut payload pastes back with its original block type

```text
[[# Title
body]]
⌫
=>
|
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Google Docs for document selection; secondary ref: ProseMirror (#570)
Source: c70bacbd4a:docs/editor-issue-harvester/prosemirror/full/checkpoints/issues-0526-0580.md:13-15
Proof: Plite proves the empty-paragraph clause: `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:729` "normalizes select-all Backspace to one empty paragraph" (Ctrl+A and Backspace over a heading and a paragraph leave one empty paragraph with the caret at its start) and `:6095` "cuts and pastes a fully selected heading as a heading", whose paste-back passes only because that example's schema sets `slice.preserveContext` on headings. No Plate test covers it. `apps/www/tests/browser/suggestion.spec.ts:280` "homepage select-all deletion stays editable" deletes in Editing beside another author's pending deletion and asserts one empty live block below that author's struck line, with the caret at its start. It does not check the block's type. Drift: a model probe on 2026-10-08 (Bun, package source, happy-dom) cut a selected heading and pasted it back as a paragraph, because Plate's headings do not set `slice.preserveContext` and the copied slice stays open; the browser delete path passes `at` (`packages/plitejs/src/react/editable/mutation-controller.ts:886-892`) and leaves an empty paragraph, but `editor.update.fragment.delete()` without `at` leaves an empty heading shell (`packages/plitejs/src/transforms-text/delete-text-whole-blocks.ts:85-126`). Checked 2026-10-08.

- `EDIT-SEL-STAB-001` `locked` `⇤`

```text
[[> One
> Two]]
```

note: outdent all selected blocks one owned level

- `EDIT-SEL-TRIPLE-SELECT-001` `proposed` `triple-click`: a triple-click in a block selects exactly that block's content, from its start to its end, and the model selection never reaches into the block below, even where the browser's own triple-click selection would hang into it

```text
one|
two
triple-click one
=>
[[one]]
two
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: none checked; secondary ref: Slate #3871
Source: c70bacbd4a:docs/plite/references/pr-description.md:91-92
Proof: only a Plite example proves it in a browser: `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:7254` "selects the current block on browser triple click" triple-clicks the first paragraph and asserts the model selection from `{ path: [0, 0], offset: 0 }` to `{ path: [0, 6], offset: 1 }`, the selected text and a non-collapsed DOM selection inside the editor; mobile skips it. The owner is Plite's click handler, which on `event.detail === 3`, unless an app `onClick` handled the event, sets the model selection to the range of the nearest block above the click target (`packages/plitejs/src/react/editable/selection-reconciler.ts:348-385`), so Plate inherits it. No Plate or www test triple-clicks (search of `apps/www/tests`, `tooling/e2e` and `packages/platejs/src`, 2026-10-08).

- `EDIT-SEL-TRIPLE-BS-001` `proposed` `⌫ after triple-click`: after a triple-click selects a block, `⌫` removes the whole block, so the block below moves up with the caret at its start; it never leaves the emptied block behind

```text
one|
two
triple-click one, ⌫
=>
|two
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: none checked; secondary ref: Slate #5847
Source: c70bacbd4a:docs/plite/references/pr-description.md:93-94
Proof: only a Plite example proves it in a browser: `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:7310` "removes the current block after browser triple click and Backspace" triple-clicks the first paragraph, presses Backspace, asserts that the first block now holds the second paragraph's text and the removed text is gone, then types `Z` and asserts it lands at offset 1 of that block; mobile skips it. The delete-fragment command keeps the event-time selection for this case (`packages/plitejs/src/react/editable/mutation-controller.ts:860-880`; plate-notes/selection-and-editing.md, 'Delete-fragment commands carry the event-time selection'). Typing after a triple-click instead replaces the block's text and keeps the block (`:7353`). No Plate or www test covers it.

- `EDIT-SEL-BLOCK-ARROW-001` `proposed` `↑ or ↓ with selected blocks`: when every selected block has one parent, `↑` or `↓` selects only the previous or next sibling block and scrolls it into view; at the first or last sibling, or before a sibling that a content boundary leaves unmounted, the block selection stays

- `EDIT-SEL-BLOCK-SHIFT-001` `proposed` `⇧↑ or ⇧↓ with selected blocks`: Shift extends or contracts the block selection one sibling block at a time from its anchor block, through objects such as images

- `EDIT-SEL-BLOCK-YIELD-001` `proposed` `arrows on table cells or an object pick`: a table cell selection keeps `⇧+arrow` cell extension, and `↓` on an image picked by clicking or arrowing onto it enters its caption; a block pick of the same image moves to the next block instead

- `EDIT-SEL-BLOCK-ONE-001` `proposed` `block gesture over one object`: a marquee drag, a drag-handle click or a Block Menu right-click over one image, file, audio, video or embed paints the shared block highlight with no asset ring and no media toolbar, the same as a selection of several blocks; clicking the asset itself shows its ring and toolbar

- `EDIT-SEL-BLOCK-HORIZONTAL-001` `proposed` `← or → with selected blocks`: `←` leaves before the first selected block and `→` leaves after the last, in reading direction; a neighboring object becomes an object pick instead of a caret in its hidden caption; at the document edge the key does nothing and the block selection stays; on a table cell selection the caret lands inside the first or last selected cell

Classification: substitutable capability, by the tests in docs/vision/plate.md:129-137; without these rules, `↑` and `↓` leave a block selection for a caret beside it (inferred from `getSelectableOwnerVerticalNavigationTarget` in `packages/plitejs/src/react/editable/caret-engine.ts`)
Authority: syntax: none; primary UX ref: none checked; secondary ref: none checked
Proof: `apps/www/tests/browser/node-selection-input.spec.ts` drives real keys in Chromium: Details body and top-level block moves, Shift extension and contraction, the first-body-block edge, a block range through an image, a stop before an unmounted sibling (`packages/platejs/src/react/components/NodeSelection.spec.tsx`), the reveal of each newly selected block in a short viewport, and table cell `⇧↓`; `apps/www/tests/browser/media-caption.spec.ts:412` covers `↓` into an image caption. `EDIT-SEL-BLOCK-ONE-001`: `apps/www/tests/browser/media-caption.spec.ts` "a marquee over one media block paints it blue with no ring or toolbar" and "clicking an image makes an object pick that block gestures turn blue" in Chromium, which also covers `↓` from a block-picked image to the next block. `EDIT-SEL-BLOCK-HORIZONTAL-001`: `packages/plitejs/test/react/object-selection.test.tsx` "a block pick of one object leaves it with arrows instead of entering it", "horizontal arrows on a block pick pick a neighboring object and stop at the document edge" and "RTL block picks leave in reading direction" in jsdom, and `packages/platejs/src/react/features/table/TablePlugin.navigation.spec.tsx` "lands Left and Right inside a cell pick"; no browser case drives `←` or `→` on a block pick. Code: `packages/platejs/src/react/components/NodeSelection.tsx` `onKey` in `NodeSelectionDrag`; `getNodeSelectionExitTarget` in `packages/plitejs/src/react/editable/caret-engine.ts`.

- `EDIT-SEL-UNDO-RANGE-501` `proposed` `undo after a destructive edit over a text range`: undo restores the previous content and the original expanded selection, including its anchor, focus and direction. Clearing selection and refocusing between the edit and undo must not replace that saved range with a collapsed caret.

```text
abcdef with anchor after d and focus before b
remove the selected bcd, then undo
=>
abcdef with the same backward selection over bcd
```

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: Google Docs for document selection; secondary ref: none checked. No reference editor was checked for this history case.
Source: docs/plans/2026-05-06-plite-core-history-selection-undo-ralplan.md:216-220
Proof: `packages/plitejs/test/history/history-contract.ts` "reselects the restored text after deleteFragment and undo" restores a forward range. "restores the saved expanded selection after deleteFragment, blur, refocus, and undo" deletes backward-selected Hello, clears and replaces selection, then asserts the exact restored content and backward range. These simulate blur and refocus through model selection writes. `packages/plitejs/src/history/history-selection.ts` clones saved anchor and focus without reversing them and restores them only in their owning root. This is Plite model proof, not native focus or Plate browser proof. Tests read, not run.

- `EDIT-SEL-VERTICAL-001` `proposed` `repeated Shift+ArrowDown or Shift+ArrowUp`: text selection extends or contracts through visual lines while preserving its anchor. With equal text and layout, explicit virtualization preserves the target sequence of the complete DOM across mounted boundaries. Reversing to the anchor collapses the model selection and any native range representing it; content stays unchanged.

Classification: invariant, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: Google Docs for document selection; secondary ref: native selection in the complete DOM as the local comparison. No reference editor was checked.
Source: c70bacbd4a:docs/plans/2026-06-05-plite-huge-doc-native-shift-down-parity.md:407-412
Proof: `apps/plite/tests/plite-browser/donor/examples/huge-document.test.ts` "keeps virtualized repeated Shift+ArrowDown and Shift+ArrowUp aligned with complete and bounded" compares 24 downward and 12 upward steps in complete and virtualized 5000-block examples, asserts the original anchor, and compares target paths with offset tolerance of one character. Virtualized selection uses projected markers with empty native selected text. It never reverses fully to the anchor, so collapse and exact offset equality remain unproven. Current visual targeting and boundary handling are in `packages/plitejs/src/react/editable/dom-coverage-vertical-selection.ts` and `packages/plitejs/src/react/editable/caret-engine.ts`. This is a Plite desktop example, not Plate product or device proof. Test read, not run; no performance result is claimed.

- `EDIT-SEL-HIDDEN-CHROME-001` `proposed` `Shift+ArrowRight or shifted word-right across skipped hidden content`: extension preserves the selection anchor and advances through visible editable text without selecting intervening controls or opening inactive content. The native or projected selection represents the visible selected text; document content stays unchanged.

```text
Intro visible before hidden bloc[[ks.]]
[collapsed content and tab controls]
Overview tab visible text
Shift+ArrowRight
=>
Intro visible before hidden bloc[[ks.
O]]verview tab visible text
hidden content stays closed; controls are not selected
```

Classification: invariant under skip selection policy, by the tests in docs/vision/plate.md:151-160
Authority: syntax: none; primary UX ref: Google Docs for document selection; secondary ref: Notion for block-shell interaction. No reference editor was checked for hidden-content extension.
Source: docs/plans/2026-05-26-plite-shift-boundary-selection.md:173-199
Proof: `apps/plite/tests/plite-browser/donor/examples/hidden-content-blocks.test.ts` "keeps shifted boundary navigation out of shadcn chrome selection" asserts the unchanged anchor, native selected text ks. followed by O and Ov, then Control+Shift+ArrowRight selecting Overview, while hidden accordion and inactive-tab text remain absent. `packages/plitejs/src/react/editable/caret-engine.ts` skips boundaries while preserving the anchor, and `packages/plitejs/src/react/editable/dom-coverage-selection.ts` projects the resulting range. This is Plite example proof; the earlier empty-native-highlight result is not the current oracle. Test read, not run.

- `EDIT-SEL-MARQUEE-001` `proposed` `gutter drag across selectable blocks`: a visible marquee follows the pointer and crossed blocks become structurally selected. Native text selection and the floating text toolbar stay absent, with focus held by the editor's structural-selection owner. Release hides the marquee and preserves a usable block selection; the gesture changes no document content.

Classification: substitutable capability, by the tests in docs/vision/plate.md:151-160; ordinary text and explicit block selection remain defined without marquee gestures
Authority: syntax: none; primary UX ref: Notion for block drag semantics; secondary ref: Google Docs for document-selection interaction. No reference editor was checked for marquee paint.
Source: c70bacbd4a:docs/plans/5088-block-marquee-paint.md:103-106,345-355
Proof: `tooling/e2e/node-selection.test.ts` "marquee selection stays editor-owned through focus, clipboard, input, delete, and undo" drags from the gutter, asserts selected block paths, visible marquee dimensions and nontransparent fill and border, then asserts release hides it while preserving selection, editable focus, no native range and no floating toolbar. Copy, typing, deletion and undo establish a usable resulting selection. `packages/platejs/src/react/components/NodeSelection.tsx` owns the pointer gesture, rectangle and structural selection and focuses the editable. The current owner is the editable, not the retired shadow input. This is Plate browser-test coverage of geometry and computed styles, not inspected pixel proof; its synthetic touch segment proves no physical touch behavior. Test read, not run.

- `EDIT-SEL-BLOCK-MARQUEE-CONTRACT-001` `proposed` `move a held block-selection marquee back toward its anchor`: blocks selected by the current marquee cease to be selected when the shrinking marquee no longer intersects them. Contraction happens before pointer release. The gesture retains structural selection ownership and changes no document content; it creates no text caret.

```text
marquee starts above blocks A and B
held drag covers A and B
move back until the marquee covers only A
=>
A selected; B unselected, while the pointer remains held
```

Classification: invariant within marquee selection, by the tests in docs/vision/plate.md:151-160; a live marquee must represent its current covered blocks.
Authority: syntax: none; primary UX ref: Notion for block drag semantics; secondary ref: Google Docs for document-selection interaction. These inherit the existing marquee rule's references; no reference editor was checked for contraction.
Source: docs/plans/2026-08-26-extract-node-selection-primitives.md:265
Proof: `packages/platejs/src/react/components/NodeSelection.spec.tsx`, "contracts the live selection when a drag returns toward its anchor", supplies mocked block rectangles, dispatches pointer events, asserts blocks [0] and [1] selected, moves back while held, and asserts only [0] selected before pointerup. `packages/platejs/src/react/components/NodeSelection.tsx` recomputes intersecting candidates from the current rectangle and publishes the resulting paths. This is a mounted DOM contract with synthetic events and mocked geometry, not native browser drag or pixel proof. Test read, not run.

- `EDIT-SEL-SYNCED-001` `proposed` `Shift+Arrow expansion or mouse selection across visible synced-content roots`: selection follows displayed sibling order in either direction and preserves its gesture anchor. Repeated occurrences of one shared root are distinguished by the displayed occurrence where the gesture began or entered that root; selection must not jump to another occurrence with the same storage identity. Ordinary Shift+Arrow inside a paragraph remains a local text selection. Selection changes no document content.

```text
before | [first occurrence of shared text] between [second occurrence of shared text] after
Shift+ArrowRight into the first occurrence
=>
selection extends into the first occurrence; the second remains unpainted
```

Classification: invariant within selection across displayed content roots, by the tests in docs/vision/plate.md:151-160; shared storage identity must not replace displayed document order or gesture ownership.
Authority: syntax: none; primary UX ref: Google Docs for document selection; secondary ref: Notion for block-shell interaction. These inherit the adjacent selection and content-root rules' references; no reference editor was checked for synced roots.
Source: docs/plans/2026-05-27-synced-blocks-sibling-selection.md:3-13
Proof: `apps/plite/tests/plite-browser/donor/examples/synced-blocks.test.ts`, "extends Shift+Arrow through synced blocks like sibling blocks" and "extends Shift+ArrowLeft and Shift+ArrowRight through synced blocks like sibling text", assert forward and backward projected endpoints with occurrence owners. "renders projected Shift+ArrowRight selection on the active synced block copy" asserts paint text only in the first shared copy. "mouse selection across synced blocks becomes the same visible-order selection as sibling blocks" checks forward mouse crossings, and "keeps ordinary Shift+Arrow selection local inside normal paragraphs" asserts the local model and native range. The inspected mouse case does not prove reverse mouse dragging. `packages/plitejs/src/react/editable/content-root-navigation.ts` constructs projected selections from occurrence-aware boundaries and retains their anchor. Proof belongs to Plite examples and does not establish native-selection parity or Plate product coverage. Tests read, not run.

## Affinity Rules

Affinity belongs here because cursor behavior changes the meaning of later
typing and deletion.

- `EDIT-AFF-MARK-001` `locked`

```text
**bold|**text
=>
**boldx**text
```

note: directional affinity for soft inline marks and style spans such as bold,
italic, strikethrough, highlight, subscript, superscript, underline, and
document-style text styling marks

- `EDIT-AFF-MARK-DELETE-001` `proposed` `⌫ or ⌦ over marked text`: when Backspace or Delete removes a marked run, or removes an expanded selection whose text all carries the same marks, the collapsed caret keeps those marks active so the next typed text carries them

```text
plain **[[bold]]**
⌫, then type x
=>
plain **x|**
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137
Authority: syntax: none; primary UX ref: Typora for markdown-native marks; secondary ref: ProseMirror (#517, #1013)
Source: c70bacbd4a:docs/editor-issue-harvester/prosemirror/full/checkpoints/issues-0480-0524.md:17-18
Proof: Plite proves it when the marked run is the whole block: `packages/plitejs/test/delete-contract.ts:1520` "keeps marks from deleted text active after Backspace removes the marked run" and `:1557` "keeps consistently selected marks active after deleting a marked range", run by `packages/plitejs/test/runtime-contracts.test.ts`, and `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:1139` "keeps selected bold as the active mark after deleting its text" on Plite's richtext example; none deletes a mid-paragraph run, uses Delete or crosses blocks. No Plate test covers it; a model probe on 2026-10-08 (Bun, package source, happy-dom) gave bold typed text after Backspace and after Delete over a bold run inside a paragraph, and after deleting a bold range in both directions and across blocks; marks other than bold were not probed. Code: `setDeletedMarks` stores the deleted text's consistent marks (`packages/plitejs/src/transforms-text/delete-text.ts:1289-1306`). Checked 2026-10-08.

- `EDIT-AFF-LINK-001` `locked`

```text
[link|](https://platejs.org)text
=>
[linkx](https://platejs.org)text
```

note: directional affinity; moving in from the linked side extends the link, moving in from the plain-text side stays outside it

- `EDIT-AFF-HARD-001` `locked`

```text
`code|`text
=>
`code`xtext
```

note: hard affinity for source-biased inline nodes like inline code and kbd
note: inline void atoms such as mention, date, footnote reference, and inline
math do not use mark/span affinity; their boundaries are owned by atom rules

## MDX Mark Extensions

Authority:

- syntax: local MDX mark contract
- primary UX ref: Typora
- secondary ref: Milkdown

Ownership:

- these marks currently matter at round-trip and rendering level
- this file does not currently claim separate structural key ownership for them

Plugin surface:

- highlight exposes a boolean mark toggle
- subscript and superscript use `editor.update.script.toggle('sub' | 'sup')`
  over one enum-valued mark

- `EDIT-MARK-MDX-001` `locked`

```text
<mark>highlight</mark>
```

note: preserve highlight marks as `<mark>` MDX text elements during markdown round-trip

- `EDIT-MARK-MDX-002` `locked`

```text
H<sub>2</sub>O
```

note: preserve subscript marks as `<sub>` MDX text elements during markdown round-trip

- `EDIT-MARK-MDX-003` `locked`

```text
E=mc<sup>2</sup>
```

note: preserve superscript marks as `<sup>` MDX text elements during markdown round-trip

## Emoji Shortcodes

Authority:

- syntax: local remark-plugin contract
- primary UX ref: Typora
- secondary ref: GitHub Docs

Ownership:

- emoji shortcode support belongs to the markdown behavior contract's parse and
  serialize policy
- it does not define a separate structural owner in the editor

Plugin surface:

- the default markdown kit accepts shortcode input through `remark-emoji`
- shortcode-preserving serialization is not the current contract
- the emoji combobox package is a separate feature from markdown shortcode
  parsing

- `EDIT-EMOJI-001` `locked`

```text
:fire:
=>
🔥
```

note: the default markdown kit accepts emoji shortcodes and normalizes them to unicode text

## Footnotes

Authority:

- syntax: GFM and GitHub Docs
- primary UX ref: Typora
- secondary ref: Milkdown

Ownership:

- current law covers dedicated footnote nodes and markdown round-trip
- footnote reference is an inline void atom whose identifier is element
  metadata, not editable rich text
- footnote definition is a block non-void container
- current law also chooses preview and navigation winners for product surfaces that expose them
- current law now defines insert and navigation behavior
- toolbar and slash are app-surface integrations built on top of the package
  transform, not separate package-level law

Plugin surface:

- `platejs/footnote` exposes `BaseFootnotePlugin` and `BaseFootnoteDefinitionPlugin`, and `platejs/footnote/react` exposes `FootnotePlugin` and `FootnoteDefinitionPlugin`
- `editor.update.footnote.insert` inserts a reference, creates a missing definition, and moves focus into the definition body
- `editor.update.footnote.createDefinition` creates a missing definition for an existing identifier without inserting another reference
- `editor.read.footnote.nextRef`, `definition`, `definitions`, `definitionText`, `references`, `refs`, `isResolved` and `isDuplicateDefinition` expose lookup and resolution helpers, and `anchor` gives each footnote element its fragment id and the id it links to
- `editor.api.footnote.focusDefinition` and `editor.api.footnote.focusReference` expose navigation helpers over `editor.update.footnote.selectDefinition` and `selectReference`; in a read-only view they scroll to the target and flash it without moving the selection, and return `true`
- `BaseFootnoteDefinitionPlugin` declares `slice.endMatter`, so a pasted definition lands after every block already in the document and before the empty paragraph `TrailingBlockPlugin` keeps, while its references land at the caret; a definition saved inside another block stays there, words copied from inside a definition paste as words, and a dragged definition lands where it is dropped
- toolbar and slash-command entry points are valid app-surface integrations for
  the same insert transform
- lookup helpers should resolve through one lazy registry-backed index per
  editor instance
- definition content is the canonical source of truth; references must not
  cache copied preview text
- duplicate-definition state is current package law: the surface may detect and
  warn on duplicate identifiers
- duplicate-definition normalization now keeps the first definition in document
  order canonical and treats later duplicates as explicit invalid siblings
- duplicate-definition repair remains explicit user action; Plate must not
  silently merge or renumber on the user's behalf

- `EDIT-FOOTNOTE-REF-001` `locked`

```text
[^1]
```

note: preserve footnote references as dedicated inline footnote nodes instead of plain fallback text
note: rich mode must not expose the footnote identifier as editable body text

- `EDIT-FOOTNOTE-PREVIEW-001` `locked`

```text
hover footnote reference
=>
show footnote content preview
```

note: Typora wins for footnote preview behavior when the product surface
supports it
note: Obsidian adds a separate constraint that inline footnotes belong to
reading-view surfaces, not live-preview editing surfaces; that is informative
for future dual-mode products but not the default `markdown_typora` law

- `EDIT-FOOTNOTE-NAV-001` `locked`

```text
mod-click footnote reference
=>
jump to definition
```

note: Typora wins for reference-to-definition navigation when the product
surface supports it
note: navigation should scroll the target into view and land a collapsed caret
at the start of the target definition body
note: if no matching definition exists, the same deliberate ref-navigation
surface may create the missing definition at the end of the document and focus
its body instead of failing silently
note: Obsidian belongs in the adjacent block-reference family, not as proof that
all footnote navigation should become note-link navigation
note: successful ref-to-definition jumps should also use the shared
navigation-feedback primitive
note: in a read-only view, a plain click or Enter on the reference scrolls the
definition into view and flashes it, the selection stays, and focus lands on
the definition's back link; an unresolved reference does nothing there

- `EDIT-FOOTNOTE-DEF-001` `locked`

```text
[^1]: Footnote text
```

note: preserve footnote definitions as dedicated block nodes with an identifier and block children

- `EDIT-FOOTNOTE-DUP-001` `locked`

```text
two or more footnote definitions share the same identifier
```

note: current shipped law requires duplicate-definition detection, not silent
normalization on edit
note: the first definition in document order remains canonical and later
duplicates stay explicit invalid definitions until the user repairs them
note: repair may renumber a later duplicate, but it should never silently merge
or auto-renumber behind the user's back

- `EDIT-FOOTNOTE-NAV-002` `locked`

```text
click footnote backlink
=>
jump to matching reference
```

note: when a backlink surface exists, it should navigate back to the matching
reference instead of editing the definition body
note: backlink navigation should scroll the target into view and prefer the
nearest stable insertion point adjacent to the reference instead of opening
generic edit chrome
note: in a read-only view, a click or Enter on the backlink scrolls the
reference into view and flashes it, the selection stays, and focus lands on the
reference; a definition cited several times opens its picker with focus inside
it
note: if the runtime must fall back to atom selection for a footnote reference,
it should show an explicit selected state and suppress generic formatting
toolbar chrome
note: successful definition-to-reference jumps should also use the shared
navigation-feedback primitive

- `EDIT-FOOTNOTE-INSERT-001` `locked`

```text
insert footnote
=>
reference inline + definition block
```

note: insert creates the reference at the current selection, creates the
definition if missing, and focuses the definition body

note: when the selection is expanded, the inserted definition is seeded from the selected content

note: current footnote law is parse, serialize, insert, preview, and
navigation
note: dedicated toggle behavior is still not part of the footnote package law

- `EDIT-FOOTNOTE-CREATE-201` `proposed` `create definition`: for an identifier whose references have no definition, `editor.update.footnote.createDefinition` creates one definition block for that identifier without inserting another reference and, unless the caller turns focus off, lands a collapsed caret at the start of the definition body; for an identifier that already has a definition, it creates none and moves the caret to that definition instead

Classification: invariant, by the tests in docs/vision/plate.md:129-137; turning focus off is a parameter
Authority: syntax: GFM and GitHub Docs; primary UX ref: Typora; secondary ref: the unresolved-reference repair under `EDIT-FOOTNOTE-NAV-001`
Source: c70bacbd4a7523ae3ebfd820cec0ea8ec228e9ad:docs/editor-behavior/editor-protocol-matrix.md:301
Proof: `packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.spec.ts:392` "creates one definition and reuses it on later requests" calls `createDefinition` with `focus: false` and asserts the definition at `[1]`, no inserted reference and the selection kept, then calls it again with the default focus and asserts the same definition and the caret at offset 0 of `[1, 0, 0]`, which proves creation, no reference, focus off and reuse; the default focus on a fresh creation is asserted only through `insert`, by `:464` "uses selected content as the initial definition body [EDIT-FOOTNOTE-INSERT-001]", and a model probe on 2026-10-08 (Bun, package source) confirmed it for a direct call. Code: the reuse branch at `packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.ts:415-439` and the fresh creation at `:467-479`, which never checks that a reference exists. The Plugin surface line for `editor.update.footnote.createDefinition` under Footnotes states the creation half. Checked 2026-10-08.

- `EDIT-FOOTNOTE-CARET-507` `proposed` `insert footnote with focusDefinition: false`: at a collapsed current text selection, insertion creates the reference and any missing definition, then leaves a collapsed caret immediately after the reference in its source paragraph. If no following text position exists there, insertion creates one. The default insertion still focuses the definition.

```text
|text
insert footnote with focusDefinition: false
=>
[^1]|text

[^1]:
```

Classification: invariant, by the tests in docs/vision/plate.md:150-160; choosing whether insertion focuses the definition is a parameter
Authority: syntax: GFM and GitHub Docs; primary UX ref: Typora; secondary ref: Milkdown; inherited family references, with no reference editor checked for this case
Source: docs/plans/2026-07-12-plate-next-footnote-indent-juice-package-reviews.md:630
Proof: packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.spec.ts, 'keeps the caret after a reference inserted at the start of text', asserts the reference and the selection anchor in the following text. It does not independently assert the focus endpoint or terminal-spacer creation. packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.ts calls selectAfterInline in packages/platejs/src/internal/plugin/inlineInsertion.ts, which selects following sibling text or inserts and selects an empty text sibling. Model proof only; no browser gesture was rerun.

## Behavior-Policy Options

These are explicit plugin or kit policy candidates that may matter for Typora
parity, but they are not the one global default law for every Plate surface.

### Strict Mode

Authority:

- syntax: CommonMark / GFM strict syntax expectations where applicable
- primary UX ref: Typora
- secondary ref: GitHub Docs for strict markdown shape

Ownership:

- strict mode changes input acceptance and parsing expectations
- strict mode does not become a generic structural owner after content already
  exists

Plugin surface:

- no default strict-mode option is required by the current markdown behavior
  contract
- if Plate exposes strict mode, it should be an explicit plugin or kit option
  instead of silent baseline behavior

- `EDIT-PROFILE-STRICT-001` `deviation`

```text
###Header
=>
stay plain text in strict mode
```

note: strict mode requires whitespace after heading markers instead of
auto-promoting malformed source

- `EDIT-PROFILE-STRICT-002` `deviation`

```text
1. aaa
··bbb
```

note: strict mode should require list-following paragraph indentation that
matches strict markdown structure instead of accepting a looser Typora-style
continuation

### Autoformat Families

Authority:

- syntax:
  - CommonMark / GFM shorthand where applicable
  - existing local current contract for non-markdown text substitutions
- primary UX refs:
  - Typora for markdown shorthand and markdown-delimiter autoformat
- secondary refs:
  - Milkdown for executable input lanes and invalid-match guardrails
  - Obsidian for conservative selection-wrap pressure on markdown-sensitive
    symbols
  - mainstream typographic substitution norms for smart quotes and punctuation

Ownership:

- autoformat is plugin- or kit-owned input assist, not parse law
- current autoformat only runs on collapsed selection
- the code block keeps every input rule out, autoformat included, through
  `inputRuleVeto`; no kit or rule gates itself against code blocks
- resulting nodes still follow their existing block / mark contracts after the
  trigger fires
- first matching rule wins; current rule order matters when triggers overlap

### Input-Rule Execution

- `EDIT-INPUT-RULE-001` `locked`

```text
enabled / resolve declines
=>
no transaction and no published change
```

note: policy and syntax matching are read-only; a rule must decline before an
apply transaction exists

- `EDIT-INPUT-RULE-002` `locked`

```text
first resolved rule
=>
one apply transaction
=>
consume input or continue the original command once after that prefix
```

note: `apply` mutates only its supplied transaction; returning no continuation
consumes the input, while a typed continuation composes the original text,
break, or data command after the prefix

- `EDIT-INPUT-RULE-003` `locked`

```text
apply throws
=>
no rule mutation publishes and no continuation runs
```

note: an accepted input-rule attempt is atomic and produces at most one history
step for its mutation prefix

### Block Shorthand Autoformat

Ownership:

- block shorthand can:
  - retag the current block
  - wrap the current block in a container
  - build list structure
  - insert a new owned block
- not every block shorthand has the same authority strength
- task shorthand, immediate code-fence promotion, and immediate HR insertion
  are current-kit behavior, not pure markdown standards

- `EDIT-PROFILE-AUTOFMT-BLOCK-001` `deviation`

```text
type #
=>
heading block
```

note: heading shorthand follows markdown block-start syntax

- `EDIT-PROFILE-AUTOFMT-BLOCK-002` `deviation`

```text
type >
=>
blockquote container
```

note: quote shorthand wraps containers; it is not just a flat retag
note: the current app rule allows same-type nesting for repeated quote entry

- `EDIT-PROFILE-AUTOFMT-BLOCK-003` `deviation`

```text
type -  / *  / 1.  / 1)
=>
list item
```

note: ordered-list shorthand should preserve explicit start numbers when the
trigger supplies one

- `EDIT-PROFILE-AUTOFMT-BLOCK-004` `deviation`

```text
type []  / [x]
=>
todo item
```

note: this condensed task trigger is current-kit behavior, not the raw
markdown-native `- [ ]` source form
note: keep it as an explicit Plate-owned convenience instead of treating it as
the canonical markdown-native task trigger

- `EDIT-PROFILE-AUTOFMT-BLOCK-005` `deviation`

```text
type third `
=>
code block owner
```

note: current kit promotes into a code block on the closing backtick trigger
itself, not on a later `↵`
note: this is a current-kit deviation; an Enter-owned input rule is the preferred shape, and changing it needs its own plan

- `EDIT-PROFILE-AUTOFMT-BLOCK-006` `deviation`

```text
type --- / —- / ___
=>
horizontal rule + trailing paragraph
```

note: current kit inserts the HR immediately when the shorthand closes
note: this is a current-kit deviation; a command-aligned input rule is the preferred shape, and changing it needs its own plan

- `EDIT-AUTOFMT-BLOCK-NBSP-001` `proposed` `no-break space after a block marker`: a block shorthand accepts a no-break space (U+00A0) after its marker as the trigger space, so `#`, `>`, `-` or `1.` followed by a no-break space converts the block as an ordinary space does

```text
type # then a no-break space
=>
heading block
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137; it holds within the block shorthand rules, which are themselves kit policy (`EDIT-PROFILE-AUTOFMT-BLOCK-*`)
Authority: syntax: CommonMark / GFM shorthand where applicable; primary UX ref: Typora for markdown shorthand; secondary ref: ProseMirror (#598)
Source: c70bacbd4a:docs/editor-issue-harvester/prosemirror/full/checkpoints/issues-0582-0602.md:15-22
Proof: Plate does not meet it. Its block input rules declare `trigger: ' '` (`packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts:95`; `packages/platejs/src/features/basic-nodes/lib/BaseBlockPlugins.ts:30`, `:79`; `packages/platejs/src/features/list/lib/BaseListPlugin.ts:1850`, `:1870`, `:1903`), the resolved rules are indexed by that exact trigger string (`packages/platejs/src/internal/plugin/resolvePlugins.ts:1835-1847`), and `InputRulesPlugin` looks up the typed text by exact string (`packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts:370-373`); a model probe on 2026-10-08 (Bun, package source, happy-dom) typed `#`, `>` and `-` followed by U+00A0 and each stayed literal text. The only browser proof, `apps/plite/tests/plite-browser/donor/examples/markdown-shortcuts.test.ts:104` "treats non-breaking space as markdown shortcut whitespace", runs the Plite markdown-shortcuts example's own handler, whose trailing-whitespace pattern matches U+00A0, not Plite core or Plate. Checked 2026-10-08.

- `EDIT-AUTOFMT-BLOCK-ACTIVE-SET-001` `proposed` `block marker + space in a block that already has the rule's target type`: a block shorthand that sets its type (not a `toggle` or `wrap` rule) never toggles the block off; when the block already has the target type and level, the rule declines, the block keeps its type and the typed marker and space stay as text with the caret after the space; a heading marker of another level changes only the level

```text
## ##|x (heading 2), type space
=>
## ## |x (heading 2)
```

Classification: invariant, by the tests in docs/vision/plate.md:129-137; it holds within the block shorthand rules, which are themselves kit policy (`EDIT-PROFILE-AUTOFMT-BLOCK-*`)
Authority: syntax: CommonMark / GFM shorthand where applicable; primary UX ref: Typora for markdown shorthand; secondary ref: Milkdown for executable input lanes and invalid-match guardrails
Source: c70bacbd4a:docs/plans/2026-07-04-plate-next-nodes-set-block-toggle-sweep.md:234
Proof: the code meets it, and no test pins it. `HeadingRules.markdown()` declines when the block already has the heading type and the matched level (`packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts:113-115`), and `createBlockStartInputRule` without a mode applies `tx.blocks.set` and declines when it reports no change (`packages/platejs/src/lib/plugins/input-rules/createInputRules.ts:249`), which it does when every block already matches (`packages/plitejs/src/core/public-state.ts:5363-5392`); a declined rule's draft is discarded ('discards a declined rule's draft before inserting the typed input', `packages/platejs/src/react/utils/inputRules.spec.tsx:997`). A model probe on 2026-10-08 (Bun, package source through `config/plite-source-aliases.ts`, `BaseHeadingPlugin` with `HeadingRules.markdown()`) gave: heading 2 `##|x` plus space stays heading 2 `## x` with the caret at offset 3; heading 2 `###|x` plus space becomes heading 3 `x`; a paragraph `##|x` plus space becomes heading 2 `x`. A rule in `toggle` mode keeps toggling, as the public guide states (`content/docs/(guides)/plugin-input-rules.mdx:821`). Checked 2026-10-08.

### Inline Mark Autoformat

Ownership:

- mark autoformat closes a valid delimiter run and removes the wrappers
- invalid, escaped, intra-word, or trim-sensitive mismatches stay text
- nested delimiter compositions are a separate current contract from plain
  one-mark shorthand

- `EDIT-PROFILE-AUTOFMT-MARK-001` `deviation`

```text
type **word**
=>
bold word
```

note: the same family covers emphasis, strong, inline code, and strikethrough
when the closing delimiter completes a valid span

- `EDIT-PROFILE-AUTOFMT-MARK-002` `deviation`

```text
type ==word== / H~2~O / X^2^
=>
highlight / subscript / superscript mark
```

note: these symbols are markdown-sensitive and deserve their own row even when
they still end as marks

- `EDIT-PROFILE-AUTOFMT-MARK-003` `deviation`

```text
type ***word***
=>
combined marks
```

note: current rules also support composed delimiter families such as `__*`,
`__**`, and `___***`

- `EDIT-PROFILE-AUTOFMT-MARK-004` `deviation`

```text
type a**word**
=>
leave text literal
```

note: invalid or intra-word delimiter runs must not silently become marks

- `EDIT-PROFILE-AUTOFMT-MARK-005` `deviation`

```text
type ==word==
=>
highlight mark, not equality-symbol substitution
```

note: current app rule order lets mark autoformat win before text-substitution
rules for overlapping `==` input

### Text-Substitution Autoformat

Ownership:

- text substitutions mutate characters in place without changing node model
- smart quotes and punctuation are stronger normative lanes than symbol tables
- symbol-table shorthand is a thinner current contract and should stay explicit
- text substitutions can support undo-on-delete when enabled

- `EDIT-PROFILE-AUTOFMT-TEXT-001` `deviation`

```text
type " / '
=>
smart quotes
```

note: quote substitution follows typing conventions, not markdown syntax

- `EDIT-PROFILE-AUTOFMT-TEXT-002` `deviation`

```text
type -- / ... / >> / <<
=>
— / … / » / «
```

note: punctuation substitution is typographic input assist, not markdown parse
law

- `EDIT-PROFILE-AUTOFMT-TEXT-003` `deviation`

```text
type -> / (tm) / 1/2 / >=
=>
symbol replacement
```

note: arrows, legal symbols, fractions, and operator replacements are current
text-shorthand contract with thinner external authority than markdown
delimiter-based autoformat

- `EDIT-PROFILE-AUTOFMT-TEXT-004` `deviation`

```text
type 1/4
=>
¼
press ⌫
=>
1/4
```

note: undo-on-delete is part of the current text-substitution contract when the
option is enabled

### Link Automd Boundary

Authority:

- syntax: CommonMark inline link syntax
- primary UX refs:
  - Typora for markdown-native link source entry
- secondary refs:
  - Milkdown for executable `[text](url)` automd proof

Ownership:

- link automd is not plain mark autoformat
- link automd is not text-substitution autoformat
- it creates an inline non-void link span with parsed URL payload
- it is the typed syntax-trigger subfamily of source-preserving conversion for
  links
- it belongs to the richer link/source-entry interaction lane even if shared
  runtime helpers reuse autoformat-like mechanics

Plugin surface:

- current Plate package tests prove the mechanic is possible
- current default app kits now ship this through the shared typed-input lane,
  while still keeping it out of the plain autoformat families

- `EDIT-INTERACT-LINK-AUTOMD-001` `deviation`

```text
type [text](url)
close with )
=>
structured link span
```

note: spec it separately from block shorthand, mark closure, and text
substitution
note: current rich-mode kits now ship the narrow closing-`)` slice

note: the slice does not claim nested markdown-link grammar, link titles, or broader source-entry expansion

note: a destination with no scheme, such as `example.com/a%20path`, makes a relative link

note: when `allowedSchemes` refuses the destination, the typed source and the `)` stay text

note: image source, `![alt](src)`, stays text

### Auto Pair

Authority:

- syntax: none
- primary UX ref: Typora
- secondary ref: mainstream code-editor pairing norms

Ownership:

- auto pair is input assist, not markdown syntax semantics
- auto pair should be configurable by the owning plugin or kit and by enabled
  syntax family

Plugin surface:

- no default auto-pair law is required by the current markdown behavior contract
- if Plate exposes auto pair, it should be an explicit plugin or kit option
  with feature-gated symbol coverage

- `EDIT-PROFILE-AUTOPAIR-001` `deviation`

```text
type (
=>
()
```

note: normal brackets and quotes should follow standard editor pairing behavior

- `EDIT-PROFILE-AUTOPAIR-002` `deviation`

```text
select word
type =
=>
=word=
```

note: for markdown-sensitive pairs such as `~`, `=`, and `^`, selection-wrap is
safer than blindly inserting a closing pair on empty input

### Math Delimiter Triggers

Authority:

- syntax: LaTeX / KaTeX-style math delimiter conventions
- row-level UX refs:
  - selected text + `$`: Obsidian explicit
  - empty selection + `$` pair-on-type: Typora primary, Milkdown explicit
    cross-check
  - `$$` block trigger: Typora primary, Milkdown explicit cross-check,
    Obsidian explicit for line-shaped block detection and preview

Ownership:

- math delimiter triggers are input assist, not parse law
- math delimiter triggers are the typed syntax-trigger subfamily of
  source-preserving conversion for math
- selection-wrap, completed inline conversion, and block trigger are separate
  sub-surfaces
- inline rich-mode completion and block `$$` promotion are separate surfaces
- this surface belongs to typed syntax-trigger conversion or explicit plugin or
  kit input assist, not to hidden parser magic

Plugin surface:

- current rich-mode kits now ship:
  - explicit-completion inline conversion for `$...$`
  - `$$` + `Enter` block promotion
- current repo still does not ship selection-wrap math conversion by default
- current repo intentionally does not ship default selection-wrap because `$`
  and `$$` already compete inside the same rich-editor symbol family
- if Plate exposes this surface, it should live in shared input infrastructure
  instead of app-only toolbar code

- `EDIT-PROFILE-MATH-TRIGGER-001` `deviation`

```text
select word
type $
=>
$word$
```

note: Obsidian is explicit that `$` belongs in the markdown auto-pair family
and that a conservative selection-wrap policy is a real product choice
note: default rich mode does not ship this branch; only a markdown-native or explicitly approved app kit may
note: for Plate's default rich editor, `$` / `$$` collision pressure is strong
enough that selection-wrap stays out of the shipped contract

- `EDIT-PROFILE-MATH-TRIGGER-002` `deviation`

```text
type closing $
for $x$
=>
inline math node
```

note: default rich mode converts on explicit completion instead of opening
delimiter commitment
note: this keeps raw syntax out of editor content while still allowing safe
rich-mode conversion

- `EDIT-PROFILE-MATH-TRIGGER-003` `deviation`

```text
type $$
press ↵
=>
block math editor
```

note: `$$` + `Enter` is a separate block-math trigger, not generic auto pair
note: Typora and Milkdown are explicit for promotion; Obsidian is still useful
here because it explicitly documents `$$` line-shaped block detection and block
preview even if it does not document the same `Enter` promotion shape
note: current rich mode ships this as the explicit block-completion boundary

## TDD Rule

Do not lock a rule in this file without adding or mapping a test for it. Map each locked rule to one or more tests, its owning package or integration surface and its owning behavior contract in [current-evidence.md](./current-evidence.md) and its `docs/vision/plate.md` classification (invariant, parameter, substitutable capability or product policy); name an important test after its spec ID so the mapping survives refactors.
