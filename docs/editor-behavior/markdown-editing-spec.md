# Markdown Editing Spec for Plate

This is the normative editing spec for Plate's markdown-first profile.

Status: current readable law for the markdown-first profile.

This file is about editing behavior, not syntax coverage. Syntax coverage lives
in [markdown-parity-matrix.md](./markdown-parity-matrix.md).

This file is also intentionally non-exhaustive. It defines the readable law:

- core invariants
- ownership order
- family-level contracts
- canonical examples
- locked policy calls

It is family-complete for the current in-scope editor behavior, but it is not
the scenario-complete matrix. Exhaustive permutations still live in
[editor-protocol-matrix.md](./editor-protocol-matrix.md).

For the exhaustive scenario backlog and future protocol-complete matrix, use
[editor-protocol-matrix.md](./editor-protocol-matrix.md).

## Profile

- target profile: `markdown_typora`
- companion reference: `markdown_milkdown`

## Authority Summary

This summary is routing guidance, not governing winner law.

Concrete sections and protocol rows choose authority per surface.

Typical candidate pools:

- syntax and serialization:
  - CommonMark
  - GFM and GitHub Docs for GFM-only constructs
  - MDX only where Plate intentionally uses MDX round-trip
- markdown-native editing:
  - often Typora
  - often Milkdown as the inspectable cross-check
- mode architecture and note-linked navigation:
  - often Obsidian
  - sometimes Google Docs or Typora for narrower document-navigation pieces
- table and document-style behavior:
  - often Google Docs
  - sometimes Obsidian, Notion, or Milkdown depending on the surface
- block-editor-native behavior:
  - often Notion
  - sometimes Milkdown or a narrower mainstream precedent
- local contract:
  - only when the stronger external refs for the concrete surface are silent or
    incompatible

Do not infer one default owner for an entire category from this summary.

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

- toggle: `::toggle[open] Title`
- callout: `::callout[info] Text`
- media/embed: `::media[url]`
- atomic block: `::atom[name]`

### Status Meanings

- `locked` = current intended rule for the markdown-first profile
- `proposed` = intended direction, still open to movement
- `audit` = waiting on stronger external grounding or more direct coverage
- `deviation` = intentionally profile-owned, not one global truth

## Global Invariants

- `EDIT-GLOBAL-001` `locked`: nearest structure wins for structural keys
- `EDIT-GLOBAL-002` `locked`: one keypress changes one structural depth
- `EDIT-GLOBAL-003` `locked`: empty `↵` exits one container level, not all levels
- `EDIT-GLOBAL-004` `locked`: `⌫` deletes or merges the current empty block in place before any structural lift
- `EDIT-GLOBAL-005` `locked`: expanded selections operate on all selected blocks without silently dropping structure

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
- rich mode must not expose a caret inside identifier or chip text that is only
  renderer chrome for an inline void atom

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
3. toggle-like container
4. list item
5. blockquote
6. indent block
7. generic block fallback

This is the current ownership order for markdown-first behavior.

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

- `EDIT-P-ENTER-EMPTY-001` `locked` `↵`

```text
|
```

note: keep generic root split behavior

- `EDIT-P-BS-START-001` `locked` `⌫`

```text
alpha
|beta
=>
alpha|beta
```

note: when merge is valid; otherwise generic fallback

- `EDIT-P-BS-START-EMPTY-001` `locked` `⌫`

```text
alpha
|
=>
alpha|
```

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

- `EDIT-LIST-ENTER-001` `locked`

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

Plugin surface:

- blockquote plugins expose `editor.tf.blockquote.toggle()` to wrap or unwrap
  blocks
- this section defines editing behavior after quoted structure already exists

Blockquote is a real container, not a flat text block.

- `EDIT-BQ-ENTER-001` `locked` `↵`

```text
> abc|def
=>
> abc
> |def
```

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

- `EDIT-BQ-TAB-001` `locked` `⇥`

```text
> |Item
=>
> indented |Item
```

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

- code-block plugins expose code-block creation, formatting, and rendering
  surfaces
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

## Math Block

Authority:

- syntax: LaTeX-style math delimiters as adopted through `remark-math`
- primary UX ref: Typora
- secondary ref: Milkdown

Ownership:

- math block should behave closer to code than paragraph
- insertion is locked
- destructive and tab ownership are still less certain than code blocks

Plugin surface:

- math plugins expose insert transforms
- this section defines current editing law and explicitly marks the weaker
  ownership rows as audit targets

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
cell with multiple paragraphs
=>
markdown cell with inline <br/> fallback
```

note: plain markdown tables do not preserve nested block structure inside one
cell
note: when a cell contains multiple paragraphs or block children, the markdown
serializer must collapse that content to inline `<br/>` fallback instead of
pretending block structure can round-trip there
note: this is a boundary policy, not a claim that `<br/>` is semantically
equivalent to nested blocks; it is the least dishonest markdown shape available
once the content must leave the editor-native table model
note: the serializer should preserve content order and paragraph boundaries, but
it must not invent fake nested-table markdown that plain GFM cannot carry
note: deserializing that markdown returns one paragraph with inline breaks, not
the original nested block tree
note: this fallback is intentional table policy, not a serializer bug
note: richer cell-local block structure remains editor-native until the surface
is converted into a representation that can actually carry it

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

- `EDIT-TABLE-*` `locked`

```text
insert row / column
delete row / column
merge / split
```

note: row and column structure changes must preserve table shape instead of
corrupting merged cells

- `EDIT-TABLE-*` `locked`

```text
copy selected cells
paste into selected cells
addMark / removeMark on selected cells
```

note: multi-cell operations stay table-scoped instead of degrading into generic
block selection behavior

## Link And Image

Authority:

- CommonMark for syntax
- Typora for markdown-native editing feel
- GitHub Docs where GFM behavior is more specific

Ownership:

- link is an inline non-void span with directional affinity
- image is a block void media atom in the current editor model
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
- math delimiter conversion now ships a safe rich-mode slice while richer
  markdown-native variants remain deferred
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

- `EDIT-AFF-LINK-001` `locked`

```text
[link|](https://platejs.org)text
=>
[linkx](https://platejs.org)text
```

note: moving in from the linked side extends the link; moving in from the plain
side stays outside it

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

note: current readable law covers boundary typing, not every link transform
permutation

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
the current Plate markdown-first profile does not define file-system side
effects in core image editing law
note: Typora's `./` prefix and relative-path policies are valid future
profile-option candidates; they are not required baseline law today
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
note: richer rendered HTML preview or block-specific chrome is deferred until a
later product lane chooses it explicitly

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

## Toggle

Authority:

- syntax: local toggle node contract
- primary UX ref: Notion
- secondary ref: Milkdown

Ownership:

- toggle is a local container contract
- toggle title rows own `↵`
- nested content still yields to stronger child owners before toggle claims tab
  or structural exit

Plugin surface:

- toggle plugins expose toggle state and block transforms
- the current implementation may still be reworked, but the expected behavior
  is defined here

Toggle is not markdown-native, but it still needs explicit behavior because it
can contain markdown-native blocks.

- `EDIT-TOGGLE-ENTER-001` `locked` `↵`

```text
::toggle[open] Title|
=>
::toggle[open] Title
  |
```

note: create an indented paragraph inside an open toggle

- `EDIT-TOGGLE-ENTER-CLOSED-001` `locked` `↵`

```text
::toggle[closed] Title|
  hidden
=>
::toggle[closed] Title
  hidden
::toggle[closed] |
```

note: insert a new toggle after the hidden range of the closed toggle

- `EDIT-TOGGLE-BS-START-001` `locked` `⌫`

```text
::toggle[open] |
```

note: remove the toggle shell and return the title row to normal block content
instead of leaving a special empty toggle wrapper behind

- `EDIT-TOGGLE-TAB-001` `locked` `⇥`

```text
::toggle[open]
  |text
```

note: lower owner wins before toggle claims it

## Drawing Blocks

Authority:

- syntax: local non-markdown contract
- primary UX ref: Notion-like board tools
- secondary ref: docs reference

Ownership:

- code drawing and Excalidraw are atomic block contracts
- surrounding delete and selection target the block boundary, not phantom text
  content

Plugin surface:

- drawing plugins expose insert transforms
- richer editing UX can still evolve later, but the baseline block law is
  defined here

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

- date plugins expose `tf.insert.date`
- this section defines current boundary and insertion law, not date-picker UI
- current canonical node payload is one `YYYY-MM-DD` calendar-day string on
  `node.date`
- current markdown contract writes canonical dates as
  `<date value="YYYY-MM-DD" />`
- current markdown read path accepts both:
  - legacy plain `<date>value</date>` child-text
  - canonical `<date value="YYYY-MM-DD" />`
- legacy child-text values that do not normalize safely stay on an explicit raw
  fallback path instead of being silently reinterpreted as canonical dates
- bundled renderers may derive relative labels or long-date display from the
  canonical node value, but that is render-layer behavior layered on top of the
  canonical payload
- locale-heavy or timezone-heavy serialized semantics and display-vs-value
  payload splits remain deferred

- `EDIT-DATE-INSERT-001` `locked`

```text
hi|
=>
hi [date] |
```

note: insert the date node followed by a trailing spacer
note: keyboard movement enters the inline void child so date stays keyboard-accessible like mention

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

- `EDIT-DATE-MDX-001` `locked`

```text
Date: <date value="2024-01-01" />
```

note: current canonical node value is `YYYY-MM-DD`
note: current writer emits canonical attribute form for normalized date values
note: current read path still accepts legacy child-text `<date>value</date>`
note: non-normalizable legacy child text stays on an explicit raw fallback path
instead of being treated as canonical date data

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
one current toc item
```

note: TOC rendering should reflect the current active heading while the user
scrolls or edits through the same document

- `EDIT-TOC-*` `locked`

```text
[toc]
```

note: delete and movement treat TOC as an atomic block, not editable inline
content

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

## Media And Caption

Authority:

- syntax: local media and caption contracts
- primary UX ref: Notion
- secondary ref: Google Docs for file-ish behavior

Ownership:

- media blocks are atomic local contracts around selection and deletion
- caption owns its focus movement only inside the media host relationship

Plugin surface:

- media plugins expose insert and embed/upload surfaces
- caption behavior is helper behavior layered on top of media hosts
- current markdown/MDX contract keeps supported MDX attributes on round-trip
- current media embed contract persists one canonical render `url` plus current
  normalized provider metadata:
  - `provider`
  - `id`
  - optional `sourceUrl` when the edit surface needs the user-facing source URL
- current allowlisted transform paths may also extract a canonical embed URL
  from selected sharing snippets such as Twitter / X embed markup
- provider-specific previews, upload placeholders, and caption UI are current
  app/render-layer behaviors layered on top of that contract
- current package behavior already includes embed-url normalization and
  placeholder-to-media replacement when the upload surface is enabled
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
- broader script-based embed behavior, PDF iframe support, richer embed chrome,
  and wider path-policy/product behavior beyond the current
  `url` / `provider` / `id` / optional `sourceUrl` contract remain deferred

Media and caption are local contracts informed by Notion-style media blocks and
Google Docs-style file behavior.

- `EDIT-MEDIA-*` `locked`

```text
insert media
=>
[media block]
```

note: media insertion creates the chosen media node shape and preserves MDX
attributes on markdown round-trip

- `EDIT-MEDIA-*` `locked`

```text
next block start + ⌫ after media
```

note: destructive movement selects the media boundary instead of deleting
through it

- `EDIT-CAPTION-*` `locked`

```text
↓ from media host
=>
caption focus
```

note: caption movement is local contract behavior, not a universal markdown
rule

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
- discussion and yjs behavior is still implementation work, but the expected
  law is defined here

- `EDIT-COMMENT-*` `locked`

```text
create / remove comment mark
```

note: comments attach metadata to text ranges and stay excluded from markdown
serialization

- `EDIT-SUGGESTION-*` `locked`

```text
insert / delete / accept / reject suggestion
```

note: suggestions wrap editing intent in metadata instead of committing content
changes immediately

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
note: current search / find-replace law is specified for the future product
surface, but the runtime implementation is intentionally deferred for now
note: until that lane is built, this section should be read as locked behavior
law, not as a claim that Plate already ships the full search surface

### Mouse Drag And Selection

- `EDIT-DRAG-*` `locked`

note: drag selection should clamp to strong container boundaries such as tables
instead of producing impossible mixed native selections

### Platform Shortcuts

- `EDIT-SHORTCUT-*` `locked`

note: shortcuts should escalate through the owning surface from local owner to
broader document owner instead of looping on one level forever

### Delete Commands

- `EDIT-CMD-DELETE-*` `locked`

note: Typora is the primary winner for delete-range semantics in paragraph,
code, and math contexts
note: Google Docs overrides Typora for table row and column destructive command
semantics

### IME And Composition

- `EDIT-IME-*` `locked`

note: IME composition should stay inside the active text owner and must not
double-apply committed text at block or inline-atom boundaries

## Thematic Break And Atomic Blocks

Authority:

- syntax: CommonMark thematic break
- primary UX ref: Typora
- secondary ref: Milkdown

Ownership:

- thematic break is atomic for editing purposes
- adjacent keypresses should create surrounding paragraphs, not content inside
  the break

Plugin surface:

- thematic break currently has markdown parse and serialize behavior
- dedicated insert UI may exist elsewhere, but this section only defines
  post-insert editing law

- `EDIT-HR-ENTER-001` `locked` `↵`

```text
---
|
```

note: create an adjacent paragraph, not content inside the HR

- `EDIT-ATOMIC-BS-START-001` `locked` `⌫`

```text
|::atom[name]
```

note: select or remove according to atomic ownership, not generic merge

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

note: replace the selection with the profile-appropriate split result

- `EDIT-SEL-BS-001` `locked` `⌫`

```text
[[> One
> Two]]
```

note: remove the selection without corrupting surrounding structure

- `EDIT-SEL-STAB-001` `locked` `⇤`

```text
[[> One
> Two]]
```

note: outdent all selected blocks one owned level

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

- highlight, subscript, and superscript expose mark toggles
- subscript and superscript are mutually exclusive by plugin design

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

- emoji shortcode support is a markdown-profile parse and serialize concern
- it does not define a separate structural owner in the editor

Plugin surface:

- the default markdown profile accepts shortcode input through `remark-emoji`
- shortcode-preserving serialization is not the current contract
- the emoji combobox package is a separate feature from markdown shortcode
  parsing

- `EDIT-EMOJI-001` `locked`

```text
:fire:
=>
🔥
```

note: the default markdown profile accepts emoji shortcodes and normalizes them to unicode text

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
- current law also chooses preview and navigation winners for future product
  surfaces
- current law now defines insert and navigation behavior
- toolbar and slash are app-surface integrations built on top of the package
  transform, not separate package-level law

Plugin surface:

- `@platejs/footnote` exposes `FootnoteReferencePlugin` and
  `FootnoteDefinitionPlugin`
- `tf.insert.footnote` inserts a reference, creates a missing definition, and
  moves focus into the definition body
- `tf.footnote.createDefinition` creates a missing definition for an existing
  identifier without inserting another reference
- `api.footnote.nextId`, `api.footnote.definition`,
  `api.footnote.definitions`, `api.footnote.definitionText`,
  `api.footnote.references`, `api.footnote.isResolved`,
  `api.footnote.hasDuplicateDefinitions`, and
  `api.footnote.duplicateIdentifiers` expose lookup and resolution helpers
- `tf.footnote.focusDefinition` and `tf.footnote.focusReference` expose
  navigation helpers
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

note: current footnote law is parse, serialize, insert, preview, and
navigation
note: dedicated toggle behavior is still not part of the footnote package law

## Profile-Adjacent Options

These are explicit profile options that may matter for Typora parity, but they
are not the one global default law for every Plate surface.

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

- no default strict-mode option is required by the current markdown profile
- if Plate exposes strict mode, it should be an explicit profile option instead
  of silent baseline behavior

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

- autoformat is profile-adjacent input assist, not parse law
- current autoformat only runs on collapsed selection
- current app kits disable autoformat inside code blocks
- resulting nodes still follow their existing block / mark contracts after the
  trigger fires
- first matching rule wins; current rule order matters when triggers overlap

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
note: this is a current-kit deviation, not the preferred long-horizon contract;
future normalization should move toward an Enter-owned neighboring input-rule
lane instead of expanding generic autoformat further

- `EDIT-PROFILE-AUTOFMT-BLOCK-006` `deviation`

```text
type --- / —- / ___ 
=>
horizontal rule + trailing paragraph
```

note: current kit inserts the HR immediately when the shorthand closes
note: this is a current-kit deviation, not the preferred long-horizon contract;
future normalization should move toward a stronger input-rule / command-aligned
lane instead of immediate closure

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

### Auto Pair

Authority:

- syntax: none
- primary UX ref: Typora
- secondary ref: mainstream code-editor pairing norms

Ownership:

- auto pair is input assist, not markdown syntax semantics
- auto pair should be configurable per profile and per enabled syntax family

Plugin surface:

- no default auto-pair law is required by the current markdown profile
- if Plate exposes auto pair, it should be an explicit profile option with
  feature-gated symbol coverage

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
- this surface belongs to typed syntax-trigger conversion or explicit profile
  input assist, not to hidden parser magic

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
note: this branch remains deferred for default rich mode and belongs to a
future markdown-native or explicitly approved profile
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

## Implementation-Deferred Lanes

The behavior law is defined for these surfaces, but implementation work may
still land later:

- toggle rewrite
- drawing and board blocks
- collaboration/editor-only product work
- IME, mouse drag selection, platform shortcuts, and clipboard hardening
- markdown-native math selection-wrap and other future-mode trigger variants

## Open Audit Targets

These are still the meaningful open areas in the readable law:

- math block destructive and tab ownership
- toggle interaction with markdown-native containers
- thematic break and atomic-block destructive behavior
- strict mode and auto pair only exist as profile-adjacent option law today
- any future rows added to the protocol matrix that prove this file is missing a
  canonical example

## TDD Rule

Do not lock a rule in this file without adding or mapping a test for it.
