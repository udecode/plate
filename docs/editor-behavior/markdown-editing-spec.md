# Markdown Editing Spec for Plate

This is the normative editing spec for Plate's markdown-first profile.

Status: pre-reference draft. These rules define the scenarios to audit and the
default direction to challenge or confirm against Typora and Milkdown.

This file is about editing behavior, not syntax coverage. Syntax coverage lives
in [markdown-parity-matrix.md](./markdown-parity-matrix.md).

## Profile

- target profile: `markdown_typora`
- companion reference: `markdown_milkdown`

## Global Invariants

These should be treated as default laws unless a block family explicitly owns a
different behavior.

| ID | Rule | Status |
| --- | --- | --- |
| `EDIT-GLOBAL-001` | nearest structure wins for structural keys | proposed |
| `EDIT-GLOBAL-002` | one keypress changes one structural depth | proposed |
| `EDIT-GLOBAL-003` | empty `Enter` exits one container level, not all levels | proposed |
| `EDIT-GLOBAL-004` | start `Backspace` removes one structural layer before destroying content | proposed |
| `EDIT-GLOBAL-005` | expanded selections operate on all selected blocks without silently dropping structure | proposed |

## Ownership Order

For structural keys, the default ownership order is:

1. table cell
2. code block or fenced block
3. toggle-like container
4. list item
5. blockquote
6. indent block
7. generic block fallback

This order is a draft and should be validated during the audit.

## Event Semantics

These event definitions apply throughout this file:

- `Enter`: collapsed selection line split or exit behavior
- `Backspace@start`: collapsed selection at start of current block
- `Delete@end`: collapsed selection at end of current block
- `Tab`: forward tab key
- `Shift+Tab`: reverse tab key

## Paragraph

| ID | Scenario | Proposed behavior | Status |
| --- | --- | --- | --- |
| `EDIT-P-ENTER-001` | `Enter` in non-empty paragraph | split paragraph | locked |
| `EDIT-P-ENTER-EMPTY-001` | `Enter` in empty root paragraph | keep generic split behavior | proposed |
| `EDIT-P-BS-START-001` | `Backspace@start` in root paragraph | merge with previous block when valid, else fallback | proposed |
| `EDIT-P-TAB-001` | `Tab` in plain paragraph | no markdown-first structural effect by default | deviation |
| `EDIT-P-STAB-001` | `Shift+Tab` in plain paragraph | no markdown-first structural effect by default | deviation |

## Heading

| ID | Scenario | Proposed behavior | Status |
| --- | --- | --- | --- |
| `EDIT-H-ENTER-001` | `Enter` in middle of heading | split and reset next block to paragraph | proposed |
| `EDIT-H-ENTER-END-001` | `Enter` at end of non-empty heading | create paragraph below | locked |
| `EDIT-H-BS-START-001` | `Backspace@start` | reset heading to paragraph | proposed |

This already matches current Plate direction well enough.

## List Item

List behavior is already one of the strongest ownership seams in the repo and
should be treated as a baseline to emulate for other container blocks.

| ID | Scenario | Proposed behavior | Status |
| --- | --- | --- | --- |
| `EDIT-LIST-ENTER-001` | `Enter` in non-empty list item | split list item, preserve list depth and style | locked |
| `EDIT-LIST-ENTER-EMPTY-001` | `Enter` in empty nested list item | outdent one list level | locked |
| `EDIT-LIST-ENTER-EMPTY-ROOT-001` | `Enter` in empty top-level list item | exit list to paragraph | locked |
| `EDIT-LIST-BS-START-001` | `Backspace@start` in non-empty list item | remove one list layer before dropping content | locked |
| `EDIT-LIST-TAB-001` | `Tab` in list item | indent one list level | locked |
| `EDIT-LIST-STAB-001` | `Shift+Tab` in list item | outdent one list level | locked |

## Blockquote

Blockquote should behave like a real container, not a flat text block.

| ID | Scenario | Proposed behavior | Status |
| --- | --- | --- | --- |
| `EDIT-BQ-ENTER-001` | `Enter` in non-empty paragraph inside quote | split paragraph, stay in quote | locked |
| `EDIT-BQ-ENTER-EMPTY-001` | `Enter` in empty paragraph inside top-level quote | exit quote one level to paragraph | locked |
| `EDIT-BQ-ENTER-EMPTY-NESTED-001` | `Enter` in empty paragraph inside nested quote | exit to parent quote level | locked |
| `EDIT-BQ-BS-START-001` | `Backspace@start` in quoted paragraph | remove one quote level from current block only | locked |
| `EDIT-BQ-BS-START-ONLY-001` | `Backspace@start` in only child of quote | convert to paragraph outside quote | locked |
| `EDIT-BQ-STAB-001` | `Shift+Tab` in quoted paragraph | outdent one quote level | locked |
| `EDIT-BQ-TAB-001` | `Tab` in quoted paragraph | no default quote-indent behavior | deviation |

### Quote + list interaction

| ID | Scenario | Proposed behavior | Status |
| --- | --- | --- | --- |
| `EDIT-BQ-LIST-ENTER-EMPTY-001` | empty quoted list item + `Enter` | list owns first, quote second | locked |
| `EDIT-BQ-LIST-BS-START-001` | quoted list item + `Backspace@start` | list owns first, quote second | locked |
| `EDIT-BQ-LIST-STAB-001` | quoted list item + `Shift+Tab` | outdent list first, then quote | locked |

## Code Block

Code block is a strong local owner and should stay one.

| ID | Scenario | Proposed behavior | Status |
| --- | --- | --- | --- |
| `EDIT-CB-ENTER-001` | `Enter` in code line | insert code line and preserve indentation | locked |
| `EDIT-CB-BS-START-EMPTY-001` | `Backspace@start` in empty code block | unwrap code block | locked |
| `EDIT-CB-TAB-001` | `Tab` in code block | indent selected code lines | locked |
| `EDIT-CB-STAB-001` | `Shift+Tab` in code block | outdent selected code lines | locked |

## Math Block

Math block should likely behave closer to code block than paragraph, but this
needs reference validation.

| ID | Scenario | Proposed behavior | Status |
| --- | --- | --- | --- |
| `EDIT-MATH-ENTER-001` | `Enter` in block math | preserve math editing intent, avoid generic paragraph split unless profile says otherwise | locked |
| `EDIT-MATH-BS-START-001` | `Backspace@start` in empty math block | exit math block | audit |
| `EDIT-MATH-TAB-001` | `Tab` in math block | no generic ownership until reference audit | audit |

## Table Cell

Table should continue to own movement and tabbing inside cells.

| ID | Scenario | Proposed behavior | Status |
| --- | --- | --- | --- |
| `EDIT-TABLE-TAB-001` | `Tab` in cell | move to next cell | locked |
| `EDIT-TABLE-STAB-001` | `Shift+Tab` in cell | move to previous cell | locked |
| `EDIT-TABLE-ENTER-001` | `Enter` in paragraph inside cell | split block inside same cell unless another owner intercepts | proposed |
| `EDIT-TABLE-BS-START-001` | `Backspace@start` in first block inside cell | do not escape table accidentally | proposed |

## Toggle

Toggle is not native markdown, but it still needs explicit behavior since it can
contain markdown-native blocks.

| ID | Scenario | Proposed behavior | Status |
| --- | --- | --- | --- |
| `EDIT-TOGGLE-ENTER-001` | `Enter` on toggle header | create nested content according to toggle rules | audit |
| `EDIT-TOGGLE-BS-START-001` | `Backspace@start` on empty toggle header | unwrap or reset toggle according to profile | audit |
| `EDIT-TOGGLE-TAB-001` | `Tab` in toggle content | lower owner wins before toggle | proposed |

## Thematic Break And Atomic Blocks

| ID | Scenario | Proposed behavior | Status |
| --- | --- | --- | --- |
| `EDIT-HR-ENTER-001` | `Enter` around HR | create paragraph adjacent to HR, not inside it | proposed |
| `EDIT-ATOMIC-BS-START-001` | `Backspace@start` before atomic block | select or remove according to block ownership, not generic merge | proposed |

## Expanded Selection Rules

These need stronger coverage than the repo currently has.

| ID | Scenario | Proposed behavior | Status |
| --- | --- | --- | --- |
| `EDIT-SEL-ENTER-001` | expanded selection across blocks + `Enter` | replace selection with profile-appropriate split result | audit |
| `EDIT-SEL-BS-001` | expanded selection across containers + `Backspace` | remove selection without corrupting surrounding structure | audit |
| `EDIT-SEL-STAB-001` | multi-block selection + `Shift+Tab` | outdent all selected blocks one owned level | proposed |

## Affinity Rules

Affinity belongs in the editing spec because cursor behavior changes the meaning
of later typing and deletion.

| ID | Scenario | Proposed behavior | Status |
| --- | --- | --- | --- |
| `EDIT-AFF-LINK-001` | cursor crossing link edge | markdown-first profile prefers predictable outward behavior; other profiles may stay inclusive | deviation |
| `EDIT-AFF-MARK-001` | cursor crossing mark edge | markdown-first profile prefers explicit boundary semantics over fuzzy inheritance | deviation |
| `EDIT-AFF-HARD-001` | hard boundary inline nodes | use only in profiles that benefit from source-biased boundary behavior | deviation |

## Open Audit Targets

These areas are expected to move during the reference audit:

- paragraph empty-root and start-`Backspace` fallback
- heading start-`Backspace`
- math block destructive and tab ownership
- table enter/backspace behavior inside cells
- toggle interaction with markdown-native containers
- expanded selection semantics

## TDD Rule

Do not lock a rule in this file without adding or mapping a test for it.
