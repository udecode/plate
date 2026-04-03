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

For the exhaustive scenario backlog and future protocol-complete matrix, use
[editor-protocol-matrix.md](./editor-protocol-matrix.md).

## Profile

- target profile: `markdown_typora`
- companion reference: `markdown_milkdown`

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

- `EDIT-GLOBAL-001` `proposed`: nearest structure wins for structural keys
- `EDIT-GLOBAL-002` `proposed`: one keypress changes one structural depth
- `EDIT-GLOBAL-003` `proposed`: empty `↵` exits one container level, not all levels
- `EDIT-GLOBAL-004` `locked`: `⌫` deletes or merges the current empty block in place before any structural lift
- `EDIT-GLOBAL-005` `proposed`: expanded selections operate on all selected blocks without silently dropping structure

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

- `EDIT-P-ENTER-001` `locked` `↵`

```text
abc|def
=>
abc
|def
```

- `EDIT-P-ENTER-EMPTY-001` `proposed` `↵`

```text
|
```

note: keep generic root split behavior

- `EDIT-P-BS-START-001` `proposed` `⌫`

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

- `EDIT-H-ENTER-001` `proposed` `↵`

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

## List Item

List is the strongest current ownership seam. Other containers should behave
this cleanly.

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

## Blockquote

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

Math block should behave closer to code than paragraph.

- `EDIT-MATH-ENTER-001` `locked` `↵`

```text
$$
|x = 1
$$
```

note: preserve math-editing intent; avoid generic paragraph split

- `EDIT-MATH-BS-START-001` `audit` `⌫`

```text
$$
|x = 1
$$
```

note: stay inside math editing

- `EDIT-MATH-BS-START-EMPTY-001` `audit` `⌫`

```text
$$
|
$$
=>
|
```

- `EDIT-MATH-TAB-001` `audit` `⇥`

```text
$$
|x = 1
$$
```

note: no generic ownership until the reference audit settles it

## Table Cell

Table owns movement and tabbing inside cells.

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

- `EDIT-TABLE-ENTER-001` `proposed` `↵`

```text
| A |
| - |
| x| |
```

note: split inside the same cell unless a stronger owner intercepts

- `EDIT-TABLE-BS-START-001` `proposed` `⌫`

```text
| A |
| - |
| |x |
```

note: stay inside the cell; no accidental table escape

## Callout

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

- `EDIT-TOGGLE-BS-START-001` `audit` `⌫`

```text
::toggle[open] |
```

note: unwrap or reset toggle according to profile

- `EDIT-TOGGLE-TAB-001` `proposed` `⇥`

```text
::toggle[open]
  |text
```

note: lower owner wins before toggle claims it

## Mention

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

## Date

- `EDIT-DATE-INSERT-001` `locked`

```text
hi|
=>
hi [date] |
```

note: insert the date node followed by a trailing spacer
note: keyboard movement enters the inline void child so date stays keyboard-accessible like mention

## TOC

- `EDIT-TOC-INSERT-001` `locked`

```text
paragraph
=>
paragraph
[toc]
```

note: insert a void TOC block at the requested position
note: TOC keyboard behavior is a local contract informed by Notion-like block conventions

## Columns

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

## Thematic Break And Atomic Blocks

- `EDIT-HR-ENTER-001` `proposed` `↵`

```text
---
|
```

note: create an adjacent paragraph, not content inside the HR

- `EDIT-ATOMIC-BS-START-001` `proposed` `⌫`

```text
|::atom[name]
```

note: select or remove according to atomic ownership, not generic merge

## Expanded Selection Rules

- `EDIT-SEL-ENTER-001` `audit` `↵`

```text
[[> One
> Two]]
```

note: replace the selection with the profile-appropriate split result

- `EDIT-SEL-BS-001` `audit` `⌫`

```text
[[> One
> Two]]
```

note: remove the selection without corrupting surrounding structure

- `EDIT-SEL-STAB-001` `proposed` `⇤`

```text
[[> One
> Two]]
```

note: outdent all selected blocks one owned level

## Affinity Rules

Affinity belongs here because cursor behavior changes the meaning of later
typing and deletion.

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

## Open Audit Targets

These are still the meaningful open areas in the readable law:

- math block destructive and tab ownership
- toggle interaction with markdown-native containers
- thematic break and atomic-block destructive behavior
- any future rows added to the protocol matrix that prove this file is missing a
  canonical example

## TDD Rule

Do not lock a rule in this file without adding or mapping a test for it.
