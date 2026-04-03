# Markdown Editing Reference Audit

This is the first side-by-side audit of
[markdown-editing-spec.md](./markdown-editing-spec.md) against the local
Typora corpus and the local Milkdown clone.

Primary reference: Typora.  
Companion reference: Milkdown.

Broad corpus work is done. For Batch 1, do not do more broad scanning.
Either use the locked reference-backed rows below, or use the explicit
Plate-owned decisions called out here.

## Method

- Use explicit evidence first.
- Treat silence as a gap, not as fake agreement.
- When Typora is explicit and Milkdown is merely compatible, that is enough to
  lock the `markdown_typora` profile.
- When Typora and Milkdown pull in different directions, push the behavior down
  into profile-owned policy instead of hard-coding one global default.

## Result Labels

- `agree`: both references explicitly support the direction
- `partial`: one reference is explicit or both are only indirectly supportive
- `gap`: no direct evidence worth locking
- `tension`: current draft spec is too confident for the evidence
- `diverge`: Typora and Milkdown clearly want different behavior

## Primary Moves

- Lock now:
  - `EDIT-P-ENTER-001`
  - `EDIT-H-ENTER-END-001`
  - `EDIT-LIST-ENTER-001`
  - `EDIT-LIST-ENTER-EMPTY-001`
  - `EDIT-BQ-ENTER-001`
  - `EDIT-MATH-ENTER-001`
  - `EDIT-TABLE-TAB-001`
- Revise now:
  - `EDIT-AFF-LINK-001`
  - `EDIT-AFF-MARK-001`
  - `EDIT-AFF-HARD-001`
- Lock as Plate decisions now:
  - `EDIT-LIST-ENTER-EMPTY-ROOT-001`
  - `EDIT-LIST-BS-START-001`
  - `EDIT-LIST-BS-START-EMPTY-001`
  - `EDIT-LIST-BS-START-EMPTY-ROOT-001`
  - `EDIT-BQ-ENTER-EMPTY-001`
  - `EDIT-BQ-ENTER-EMPTY-NESTED-001`
  - `EDIT-BQ-BS-START-001`
  - `EDIT-BQ-BS-START-EMPTY-NONFIRST-001`
  - `EDIT-BQ-BS-START-ONLY-001`
  - `EDIT-BQ-STAB-001`
  - `EDIT-BQ-LIST-ENTER-EMPTY-001`
  - `EDIT-BQ-LIST-BS-START-001`
  - `EDIT-BQ-LIST-STAB-001`
  - `EDIT-CB-ENTER-001`
  - `EDIT-CB-BS-START-001`
  - `EDIT-CB-BS-START-EMPTY-LINE-001`
  - `EDIT-CB-BS-START-EMPTY-001`
  - `EDIT-CB-TAB-001`
  - `EDIT-CB-STAB-001`
  - `EDIT-TABLE-STAB-001`
- Keep open:
  - paragraph and heading destructive fallback outside owned containers
  - table `Enter` and table `Backspace@start`
  - math-block tab semantics
  - expanded structural selections
  - toggle behavior

## Evidence Map

### Global Invariants

| ID | Typora | Milkdown | Audit | Move |
| --- | --- | --- | --- | --- |
| `EDIT-GLOBAL-001` | block-local commands exist for quote, list, code, math, table | tests show table, list, code, and math all own local behavior | `partial` | keep as default law, do not lock yet |
| `EDIT-GLOBAL-002` | nested quote creation and indent/outdent imply stepwise structure | nested list tests outdent one level at a time | `partial` | keep proposed |
| `EDIT-GLOBAL-003` | no direct doc | nested list double-`Enter` exits one list level, not all | `partial` | keep proposed |
| `EDIT-GLOBAL-004` | `Delete Range` explicitly deletes the current empty block instead of inventing structural lift | `transform/preserve-empty-line.spec.ts` deletes the last empty line and list tests stay stepwise when structure changes | `partial` | lock as the default destructive rule: same-container empty-block delete/merge first, structural lift second |
| `EDIT-GLOBAL-005` | no direct doc | no structural selection proof | `gap` | keep open |

### Paragraph

| ID | Typora | Milkdown | Audit | Move |
| --- | --- | --- | --- | --- |
| `EDIT-P-ENTER-001` | `Markdown Reference` and `Shortcut Keys` explicitly define `Enter` as new paragraph | `e2e/tests/shortcut/system.spec.ts` explicitly splits into two paragraphs | `agree` | lock |
| `EDIT-P-ENTER-EMPTY-001` | docs describe paragraph creation, but not the empty-root edge | `transform/preserve-empty-line.spec.ts` shows empty-doc `Enter` can serialize as `<br />` | `tension` | keep open |
| `EDIT-P-BS-START-001` | no start-`Backspace` paragraph rule | no direct test | `gap` | keep open |
| `EDIT-P-BS-START-EMPTY-001` | `Delete Range` explicitly deletes the current empty block | `transform/preserve-empty-line.spec.ts` deletes the last empty line on `Backspace` | `agree` | lock |
| `EDIT-P-TAB-001` | `Shortcut Keys` maps `Tab` to paragraph-layer indent | no plain-paragraph `Tab` proof | `partial` | align with Typora: plain paragraphs keep `Tab` editor-owned and indent |
| `EDIT-P-STAB-001` | `Shortcut Keys` maps `Shift+Tab` to paragraph-layer outdent | no plain-paragraph `Shift+Tab` proof | `partial` | align with Typora: plain paragraphs keep `Shift+Tab` editor-owned and outdent |

### Heading

| ID | Typora | Milkdown | Audit | Move |
| --- | --- | --- | --- | --- |
| `EDIT-H-ENTER-001` | heading creation is documented, middle split is not | heading input exists, middle split is not tested | `gap` | keep local policy only after direct tests |
| `EDIT-H-ENTER-END-001` | heading is created by typing `# ...` then `Return` | `input/heading.spec.ts` shows `Enter` after heading moves to the next block lane | `partial` | lock for markdown-first profile |
| `EDIT-H-BS-START-001` | paragraph reset exists as a command, not as `Backspace@start` | paragraph reset exists as a command, not as `Backspace@start` | `gap` | lock as Plate decision: one `⌫` resets a heading to paragraph before any merge |
| `EDIT-H-BS-START-EMPTY-001` | `Delete Range` implies empty heading blocks are deleted as empty blocks | no direct test | `partial` | lock as Plate decision: one `⌫` resets an empty heading to an empty paragraph before any merge |

### List Item

| ID | Typora | Milkdown | Audit | Move |
| --- | --- | --- | --- | --- |
| `EDIT-LIST-ENTER-001` | list typing model implies continuation, but the docs stop short of spelling out split rules | `input/{bullet-list,ordered-list}.spec.ts` explicitly split non-empty items | `partial` | lock |
| `EDIT-LIST-ENTER-EMPTY-001` | no explicit nested empty-item exit doc | `input/{bullet-list,ordered-list}.spec.ts` explicitly outdent one level on empty nested item | `partial` | lock |
| `EDIT-LIST-ENTER-EMPTY-ROOT-001` | no direct doc | no direct test | `gap` | lock as Plate decision: empty top-level list item exits to paragraph |
| `EDIT-LIST-BS-START-001` | no direct doc | list setup uses `Backspace` as a step-down from the current list layer before retyping | `partial` | lock as Plate decision: non-empty list item removes one list layer before dropping content |
| `EDIT-LIST-BS-START-EMPTY-001` | no direct doc | list setup uses `Backspace` from the fresh empty item lane before nested re-entry | `partial` | lock as Plate decision: empty nested list item outdents one list level |
| `EDIT-LIST-BS-START-EMPTY-ROOT-001` | `Delete Range` implies empty blocks delete in place, but does not describe list-root exit | no direct test | `gap` | lock as Plate decision: empty top-level list item exits to paragraph |
| `EDIT-LIST-TAB-001` | `Shortcut Keys` explicitly expose indent, and lists are the clearest fit | `shortcut/list.spec.ts` exposes equivalent indent via command shortcut, not `Tab` | `partial` | lock behavior, keep exact binding profile-owned |
| `EDIT-LIST-STAB-001` | `Shortcut Keys` explicitly expose outdent | `shortcut/list.spec.ts` exposes equivalent outdent via command shortcut, not `Shift+Tab` | `partial` | lock behavior, keep exact binding profile-owned |

### Blockquote

| ID | Typora | Milkdown | Audit | Move |
| --- | --- | --- | --- | --- |
| `EDIT-BQ-ENTER-001` | `Markdown Reference` explicitly says Typora inserts the proper `>` or line break | `input/blockquote.spec.ts` explicitly keeps the next paragraph inside the quote | `agree` | lock |
| `EDIT-BQ-ENTER-EMPTY-001` | no direct exit doc | no direct empty-exit test | `gap` | lock as Plate decision: empty top-level quote paragraph exits one quote level |
| `EDIT-BQ-ENTER-EMPTY-NESTED-001` | nesting is documented, nested exit is not | no direct test | `gap` | lock as Plate decision: empty nested quote paragraph exits to the parent quote level |
| `EDIT-BQ-BS-START-001` | no direct doc | no direct test | `gap` | lock as Plate decision: non-empty quoted paragraph removes one quote level from the current block only |
| `EDIT-BQ-BS-START-EMPTY-NONFIRST-001` | `Delete Range` implies an empty block should be deleted in place before a structural escape | no direct quote-specific test | `partial` | lock as Plate decision: empty non-first quoted paragraph deletes or merges inside the quote |
| `EDIT-BQ-BS-START-ONLY-001` | no direct doc | no direct test | `gap` | lock as Plate decision: first empty quote paragraph with no previous sibling exits one quote level |
| `EDIT-BQ-STAB-001` | generic outdent exists, but quote-specific outdent is not documented | no direct test | `gap` | lock as Plate decision: outdent one quote level |
| `EDIT-BQ-TAB-001` | generic indent exists, so quote paragraphs should not fall out of the editor on plain `Tab` | no direct test | `partial` | align with Typora: quoted paragraphs inherit paragraph indent behavior on plain `Tab` without changing quote depth |

#### Quote + List Interaction

| ID | Typora | Milkdown | Audit | Move |
| --- | --- | --- | --- | --- |
| `EDIT-BQ-LIST-ENTER-EMPTY-001` | no direct doc | no direct test | `gap` | lock as Plate decision: list owns the first exit step, quote owns the second |
| `EDIT-BQ-LIST-BS-START-001` | no direct doc | no direct test | `gap` | lock as Plate decision: list owns the first outdent step, quote owns the second |
| `EDIT-BQ-LIST-STAB-001` | no direct doc | no direct test | `gap` | lock as Plate decision: outdent list first, then quote |

### Code Block

| ID | Typora | Milkdown | Audit | Move |
| --- | --- | --- | --- | --- |
| `EDIT-CB-ENTER-001` | code fences are treated as an editing mode, but enter-line indentation is not directly documented | Crepe code blocks are real code editors, but there is no explicit `Enter` indentation test | `partial` | lock as Plate decision: `Enter` inserts a code line and preserves indentation |
| `EDIT-CB-BS-START-001` | `Delete Range` treats code blocks like code editors for line deletion, not paragraph-like exits | Crepe code blocks are real code-editor surfaces | `partial` | lock as Plate decision: non-empty code-line `Backspace@start` stays inside the code block |
| `EDIT-CB-BS-START-EMPTY-LINE-001` | code blocks follow code-editor line behavior | Crepe code blocks are real code-editor surfaces | `partial` | lock as Plate decision: empty non-first code line merges with the previous line |
| `EDIT-CB-BS-START-EMPTY-001` | `Delete Range` says empty code blocks are deleted as empty blocks | no direct test | `partial` | lock as Plate decision: empty code block unwraps on `Backspace@start` |
| `EDIT-CB-TAB-001` | `Code Fences` docs focus on configurable `Shift+Tab` behavior and auto-indent, not plain `Tab` | no direct test | `tension` | lock as Plate decision: `Tab` indents selected code lines |
| `EDIT-CB-STAB-001` | `Code Fences` explicitly expose `Shift+Tab` behavior for selected code, but the exact indent/outdent polarity is not clean enough to lock from docs alone | no direct test | `tension` | lock as Plate decision: `Shift+Tab` outdents selected code lines |

### Math Block

| ID | Typora | Milkdown | Audit | Move |
| --- | --- | --- | --- | --- |
| `EDIT-MATH-ENTER-001` | `Math and Academic Functions` explicitly enters math-edit mode on `$$` + `Return` and exits via arrows or mod-`Enter` | `crepe/latex.spec.ts` explicitly creates a block math editor and uses `ArrowUp` to edit | `agree` | lock |
| `EDIT-MATH-BS-START-001` | math blocks are treated like code-editing mode, not paragraph mode | `crepe/latex.spec.ts` keeps deletion inside inline math editing, not structural exit | `partial` | lock as Plate decision: non-empty math block keeps deletion inside math editing |
| `EDIT-MATH-BS-START-EMPTY-001` | `Delete Range` says empty math blocks are deleted as empty blocks | no block-math `Backspace@start` test | `partial` | lock as Plate decision: empty math block exits the block |
| `EDIT-MATH-TAB-001` | no direct doc | no direct test | `gap` | keep open |

### Table Cell

| ID | Typora | Milkdown | Audit | Move |
| --- | --- | --- | --- | --- |
| `EDIT-TABLE-TAB-001` | `Table Editing` explicitly says newer versions add rows by pressing `Tab` | `crepe/table.spec.ts` explicitly uses `Tab` to move across cells | `agree` | lock |
| `EDIT-TABLE-STAB-001` | no direct reverse-navigation doc | no explicit `Shift+Tab` test | `gap` | lock as Plate decision: `Shift+Tab` moves to the previous cell |
| `EDIT-TABLE-ENTER-001` | table docs focus on creation and row tools, not paragraph splitting inside a cell | no direct test | `gap` | keep open |
| `EDIT-TABLE-BS-START-001` | `Delete Range` and `Table Editing` keep destructive table actions row-scoped or command-scoped, not implicit escape from a cell | `input/table.spec.ts` only covers deleting a list item after a table | `partial` | lock as Plate decision: `Backspace@start` stays inside the cell and does not escape the table |

### Toggle

| ID | Typora | Milkdown | Audit | Move |
| --- | --- | --- | --- | --- |
| `EDIT-TOGGLE-ENTER-001` | not a native Typora markdown block | no markdown-native reference | `gap` | defer to non-markdown profile work |
| `EDIT-TOGGLE-BS-START-001` | not a native Typora markdown block | no markdown-native reference | `gap` | defer to non-markdown profile work |
| `EDIT-TOGGLE-TAB-001` | not a native Typora markdown block | no markdown-native reference | `gap` | defer to non-markdown profile work |

### Thematic Break And Atomic Blocks

| ID | Typora | Milkdown | Audit | Move |
| --- | --- | --- | --- | --- |
| `EDIT-HR-ENTER-001` | HR creation is documented, behavior around an existing HR is not | HR creation is tested, adjacent `Enter` is not | `gap` | keep open |
| `EDIT-ATOMIC-BS-START-001` | no direct doc | no direct test | `gap` | keep open |

### Expanded Selection Rules

| ID | Typora | Milkdown | Audit | Move |
| --- | --- | --- | --- | --- |
| `EDIT-SEL-ENTER-001` | no structural selection doc | no structural selection + `Enter` test | `gap` | keep open |
| `EDIT-SEL-BS-001` | no structural selection doc | no structural selection + `Backspace` test | `gap` | keep open |
| `EDIT-SEL-STAB-001` | no structural selection doc | no structural multi-block outdent test | `gap` | keep open |

### Affinity Rules

| ID | Typora | Milkdown | Audit | Move |
| --- | --- | --- | --- | --- |
| `EDIT-AFF-LINK-001` | `Markdown Reference` says moving into a span expands it into markdown source | `plugin/clipboard.spec.ts`, `component-link-tooltip.md`, and `crepe/top-bar/config.ts` keep link marks active and can extend a link on paste | `diverge` | resolve against the strongest mainstream editor precedent instead of inheriting a Plate-only default |
| `EDIT-AFF-MARK-001` | span elements expand into source when the cursor moves into them | `plugin/automd.spec.ts` plus `crepe/top-bar/config.ts` favor inclusive stored-mark behavior | `diverge` | resolve toward dominant rich-text boundary typing, not Typora source expansion or legacy Plate behavior |
| `EDIT-AFF-HARD-001` | Typora behaves like hard boundaries around many span elements | Milkdown defaults are soft and inclusive | `diverge` | keep source-biased hard boundaries for source-like inline nodes such as inline code |

## What This Means

### Safe Lock Set

These are safe to convert from `audit` or `proposed` into `locked` for the
`markdown_typora` profile:

- `EDIT-P-ENTER-001`
- `EDIT-P-BS-START-EMPTY-001`
- `EDIT-P-TAB-001`
- `EDIT-P-STAB-001`
- `EDIT-H-ENTER-END-001`
- `EDIT-LIST-ENTER-001`
- `EDIT-LIST-ENTER-EMPTY-001`
- `EDIT-BQ-ENTER-001`
- `EDIT-BQ-TAB-001`
- `EDIT-MATH-ENTER-001`
- `EDIT-TABLE-TAB-001`

### Immediate Revisions

These rows should be treated as explicit Plate-owned policy, not open research:

- `EDIT-LIST-ENTER-EMPTY-ROOT-001`
- `EDIT-LIST-BS-START-001`
- `EDIT-LIST-BS-START-EMPTY-001`
- `EDIT-LIST-BS-START-EMPTY-ROOT-001`
- `EDIT-BQ-ENTER-EMPTY-001`
- `EDIT-BQ-ENTER-EMPTY-NESTED-001`
- `EDIT-BQ-BS-START-001`
- `EDIT-BQ-BS-START-EMPTY-NONFIRST-001`
- `EDIT-BQ-BS-START-ONLY-001`
- `EDIT-BQ-STAB-001`
- `EDIT-BQ-LIST-ENTER-EMPTY-001`
- `EDIT-BQ-LIST-BS-START-001`
- `EDIT-BQ-LIST-STAB-001`
- `EDIT-CB-ENTER-001`
- `EDIT-CB-BS-START-001`
- `EDIT-CB-BS-START-EMPTY-LINE-001`
- `EDIT-CB-BS-START-EMPTY-001`
- `EDIT-CB-TAB-001`
- `EDIT-CB-STAB-001`
- `EDIT-MATH-BS-START-001`
- `EDIT-MATH-BS-START-EMPTY-001`
- `EDIT-TABLE-STAB-001`
- `EDIT-TABLE-BS-START-001`
- `EDIT-AFF-LINK-001`
- `EDIT-AFF-MARK-001`
- `EDIT-AFF-HARD-001`

### Best Next TDD Lane

Start with the highest-value gaps that affect real editing feel and current
major-release decisions:

1. heading `Backspace@start`
2. paragraph non-empty `Backspace@start`
3. code-block `Enter` / `Tab` / `Shift+Tab`
4. affinity behavior resolved from stronger editor precedent, not legacy Plate defaults
5. expanded structural selections

No more broad reference scanning is required for those Batch 1 rows.
