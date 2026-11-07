---
description: Check that Backspace, Delete, Return, typing, paste, cut and bold keep the text outside their range in order over every caret and range of every small document, with a link, a read-only inline, a required title and a one-text code block among them, that the result stays canonical and that one undo gives back the document. Use before and after changing packages/plitejs/src/transforms-text/delete-text.ts, merge-nodes.ts, slice landing or another file in its coverage record, when the delete-paste-ranges step of pnpm check fails, or when fixing a delete, join or paste bug a tester found.
argument-hint: '[check | deep | lower | case <identity> | update]'
name: delete-paste-ranges
metadata:
  skiller:
    source: .agents/rules/delete-paste-ranges.mdc
---

# Delete and paste over ranges

Handle $ARGUMENTS. `check`, or no argument, runs the gate bound. `deep` runs `--blocks=3 --lines=3` and compares its failures with Findings. `lower` runs `--lower` after a fix removes a known finding. `case <identity>` runs `--case=<identity>` to print one case's full detail. `update` brings the verification in line with changed code, as Coverage record says.

**The property.** A user puts the caret anywhere, or selects any range, and presses Backspace, Delete or Return, types a letter, pastes, cuts and pastes back, bolds the range, or presses Cmd+B at the caret and types a letter. The text before the range and the text after it stay, in order, around what the command inserts, and the lines split and join only where the range and the fragment say. A read-only inline changes only whole, as `EDIT-INLINE-READONLY-DELETE-001` in the Delete Commands section of `docs/editor-behavior/markdown-editing-spec.md` says. A required title keeps its slot. An element whose schema holds one text, such as Plate's code block, never gets a second text, as `EDIT-CB-RANGE-MARK-001` says. The result is the value loading it into a fresh editor gives, one undo gives back the document before, and a cut pasted back at the caret it leaves gives back the document.

**The harm.** A delete or paste that drops, copies or moves text outside the selection destroys what the user did not select. Three open P1 bugs sit in these commands, t_31726070, t_b2ddef38 and t_ea3f0bf2. Eight fixes landed in the same commands between 2026-10-24 and 2026-11-02, each found one case at a time: efbc6d54d2, 02e4705837, 1b4aa31709, 7587a84c1e, fa33511739, 4fa60a34c7, e2116bf1b8 and 887caefa1b. Two more fixed a second text in a code block: 03cbb1bb61, where Cmd+B on part of its text threw, and 9b3552d0ca, where the letter typed after Cmd+B at a caret there was lost.

## What it checks

`packages/plitejs/scripts/delete-paste-ranges.ts` runs the real Plite editor commands on every case up to a bound. It checks the TypeScript code itself, not a model of it.

1. **Documents.** Every document of up to `--blocks` top-level blocks and `--lines` lines. Each block is a paragraph, a quote of one or two paragraphs, or a `code` block, whose schema content is `schema.content.text({ min: 1, max: 1 })` like Plate's code block. Each line is empty, two letters, or a letter, an inline of two letters and a letter, where the inline is a `link` or a read-only `guard`. A document holds at most one inline. The `titled` world puts a required `title` first, through `schema.content.prefix`, and neither the title nor a code block holds an inline. Letters run from `a` in document order, so each one names its place. Texts may carry a `bold` mark.
2. **Places.** Every offset of every text, an inline's own text included, so the caret before an inline and the caret at its inside start are two places. A range runs from each place to each later one.
3. **Commands.** At a caret: `editorCommands.delete` backward and forward by character, `insertBreak`, `insertText` of `X`, `replaceSlice` of three slices, and `toggleMark` of `bold` followed by `insertText` of `X` in a second update. Over a range: `deleteFragment` backward, the same `insertBreak`, `insertText` and `replaceSlice`, `addMark` of `bold`, and a cut, which reads `state.slice.get()`, runs `deleteFragment` and pastes the slice back with `replaceSlice`. The slices are `text`, one open paragraph `X`; `lines`, open paragraphs `X` and `Y`; and `quote`, an open paragraph `X` and a quote whose open paragraph is `Y`. `deleteFragment` forward gave the same findings as backward at the gate, so ranges run only Backspace.
4. **Oracle.** The oracle is a line model of the document before. It holds each text block's text, in order, with the read-only inline's span. Each command gives the lines it may leave:
   - A range or a caret command replaces the text from its start to its end with what it inserts, and the text before the range ends the first inserted line and the text after it starts the last. Cmd+B and a letter at a caret insert `X`, like typing.
   - `EDIT-CB-RANGE-MARK-001`: bold over a range keeps every line's text. Where the range covers part of a code block's text, that text stays unmarked, and the rest of the range takes the mark.
   - Backspace at a line's start joins it into the line before, and Delete at a line's end joins the next line into it. At the first or last line nothing changes.
   - A range from a text's start to the start of a later line may also end at the end of the line before, because `deleteText` unhangs such a range, unless the range ends at the end of the document. No spec rule names this case. The `EDIT-SEL-BS-001` note covers only a range over all of one block's text, which leaves that block empty.
   - `EDIT-INLINE-READONLY-DELETE-001`: a command with the caret or both edges inside the read-only inline, its edges included, changes nothing, and so does a delete with either edge inside it. Backspace or Delete from the text beside it removes it whole. Typing, Return or paste over a range with one edge inside it replaces the range with the inline included.
   - In the titled world, a command that joins every body line into the title may leave one empty body line, because the body keeps an occupant. Backspace or Delete at a caret may instead change nothing, as fa33511739 keeps an empty title only when no block must be built in place of the joined one.
   - Plite core has no quote rules. The spec's blockquote rules, such as `EDIT-BQ-ENTER-EMPTY-001`, belong to Plate's blockquote plugin, so a quote here is a plain container.
5. **Laws.** After each command the script compares the editor with the oracle. A case records its first failure:
   - `range-read-only`: a read-only inline whose text changed but not whole, or a changed document where the oracle says nothing changes.
   - `range-slot`: a titled document whose first block is not a `title`.
   - `range-canonical`: a document that loading would change: an element with no children, two texts with the same marks side by side, an empty text no inline needs, or an inline without text on both sides. Inside an inline the same holds, so a bolded part of a link is a text of its own. An inline may hold no text after any command except typing or paste at a caret, because loading keeps an empty link and `EDIT-INLINE-BS-EMPTY-001` says how Backspace removes one. Typing or paste at a caret never leaves one.
   - `range-text`: the text, read across all lines, differs from every form the oracle allows. The command lost, copied or reordered text.
   - `range-lines`: the text matches but the lines split or join elsewhere.
   - `range-undo`: one undo does not give back the document before.
   - `range-cut-paste`: the cut's slice, pasted back at the caret the cut leaves, does not give back the document. Ranges with an edge inside the read-only inline get no cut, because the spec says such a cut removes nothing.
   - `range-throws`: a command or its undo throws an error other than a refusal, or the editor refuses bold over a range. `EDIT-CB-RANGE-MARK-001` says the mark still applies outside a code block's partly covered text, so a refusal there loses the user's Cmd+B.
6. A refusal the editor gives to any other command counts in the summary's `refused`, and the laws then compare the document it kept.
7. It compares the findings with two baselines through `tooling/scripts/finding-baseline.mjs`: documents without a code block with `packages/plitejs/scripts/delete-paste-ranges-baseline.json`, and documents with one with `packages/plitejs/scripts/delete-paste-ranges-code-baseline.json`. The code documents have a baseline of their own because most of their findings repeat the first baseline's causes under new identities, and a baseline never grows. Every finding is filed under `packages/plitejs/src/transforms-text`. An identity names the document, the command and its places as `[path]:offset`, never the result.

## Run it

Run every command from the repository root.

- `pnpm check:delete-paste-ranges` checks the gate bound of two blocks and two lines. It compares 20,410 cases on the 84 documents without a code block and 7,824 cases on the 42 with one. Before the code block and bold, its 17,792 cases cost 209 s of processor time, about 12 ms a case, spread over 16 workers, so they needed about 13 s on a machine with 16 free cores. The 28,234 cases took 26 s at a load average of 42. Most of a case is the command, because one `deleteFragment` on a two-paragraph editor costs about 5 ms. It prints one JSON summary line for each baseline, whose `code` field says which, then each finding that baseline does not list. `pnpm check delete-paste-ranges` runs the same step through the check runner, and `pnpm check --affected` runs it for a change under `packages/plitejs/src/`, to the script, `check-harness.ts` or `authored-documents.ts`, to a file under `packages/plitejs/test/support/`, to `config/plite-source-aliases.ts` or to `tooling/scripts/finding-baseline.mjs`.
- `--blocks` and `--lines` raise the bound. Three blocks need three lines, so the gate holds one and two blocks, and `--blocks=3 --lines=3` is the deep run. A bound other than the gate's or `--case` skips the baseline and exits 1 on any failure.
- `--case='<identity or part of one>'` runs only the matching cases and prints each failure's full stack, such as `'--case=paragraph("ab") paragraph("cd") :: paste quote at [0,0]:1'`.
- `--jobs=<n>` sets the number of worker processes, the machine's cores up to 16 by default.
- Exit 0 is a pass and exit 1 a finding. Exit 2 is a bad flag or a crashed worker. At the gate the run also fails when either baseline's documents give a case count other than its pin, the `cases` field of its `GATES` entry, now 20,410 and 7,824. So a change that stops documents or places from generating cannot shrink the gate while the baselines still match. Update a count only with the reason it moved.
- After a fix removes a known finding, the gate fails until you run `pnpm check:delete-paste-ranges --lower`, which lowers both baselines. A baseline never grows. `--init` seeds only a rule a baseline lacks and checks the other baseline as usual, and `--lower` and `--init` write nothing to a baseline whose case count misses its pin.

## Read a failure

A finding prints its rule, identity and the first line of its detail:

```text
range-lines paragraph("a" link("bc") "d") paragraph("") :: Backspace over [0,1,0]:0..[1,0]:0
  gives the lines ["","a"], not ["a"]

range-text paragraph("ab") paragraph("cd") :: paste quote at [0,0]:1
  gives the text "abcd", not "aXYbcd"
```

Both are known findings. The first deletes from the link's inside start to the start of the empty last line and leaves the empty line first, which is t_31726070. The second pastes a slice that ends in a quote between `a` and `b`, and `replaceSlice` returns false and pastes nothing. Run `--case` on the identity for the full detail.

Tell a real bug from a modeling error before you change code:

- **Real bug.** A user can make the selection and press the key, and the document loses, copies or moves text, or keeps a shape the oracle rules out. Fix the command, then run `--lower`.
- **Modeling error.** The oracle claims one result where the spec allows another, such as a structural rule of a block type this schema does not have. Fix the oracle in the script with the spec rule that allows it, and give the rule ID in its comment.
- **Intended change.** A spec change to what a command does to its lines changes the oracle too. Change the spec rule and the oracle together. Never weaken a law or add a baseline entry to get green.

## Findings

The first baseline lists 3,195, all with one of thirteen causes:

- **A slice that ends in a quote.** `replaceSlice` of `quote` mid-line returns false and pastes nothing, as `paragraph("ab") paragraph("cd") :: paste quote at [0,0]:1` shows. At a line's end its first line does not join the line, so `paragraph("ab") paragraph("cd") :: paste quote at [0,0]:2` gives `["ab","X","Y","cd"]`, which is t_ea3f0bf2. Its open end never joins the text after the caret. 773 findings.
- **Typing, Return or paste writes into part of a read-only inline.** `paragraph("") paragraph("a" guard("bc") "d") :: paste lines over [1,0]:1..[1,1,0]:1` leaves the inline holding `c`. The spec's ownership note says these commands remove a selection through `removeText`, which skips the read-only test. 639 `range-read-only` findings.
- **Typing, Return or paste over a range with an edge in a read-only inline splits the lines.** `paragraph("") paragraph("a" guard("bc") "d") :: type X over [0,0]:0..[1,1,0]:1` gives `["X","d"]`, not `["Xd"]`. 631 findings.
- **A cut at a link's edge copies an empty link.** `paragraph("") paragraph("a" link("bc") "d") :: cut over [1,0]:0..[1,1,0]:0 and paste it back` gives `a`, an empty link and the link, so pasting it back splits the link. 532 `range-cut-paste` findings.
- **A join out of a quote whose paragraph holds an inline leaves the quote.** `paragraph("") quote(paragraph("a" link("bc") "d")) :: Backspace at [1,0,0]:0` gives `["abcd",""]`, an empty quote after the joined line, where the twin without an inline removes the quote. `hasSingleChildNest` in `merge-nodes.ts` fails for a paragraph with more than one child. This is t_b2ddef38. 152 findings.
- **Paste at an inline's inside edge splits it.** `paragraph("") paragraph("a" link("bc") "d") :: paste text at [1,1,0]:0` gives `a`, an empty link, `X`, the link and `d`. 104 `range-canonical` findings.
- **A range from the title into the only body block does nothing.** `title("ab") paragraph("cd") :: Backspace over [0,0]:0..[1,0]:1` keeps `abcd`, and so do Return, typing and paste over the same range. 94 findings.
- **A cut of a range that hangs into the next line copies the line break it does not delete.** `paragraph("") paragraph("ab") :: cut over [0,0]:0..[1,0]:0 and paste it back` gives an extra empty line, because `deleteText` unhangs the range and the slice read does not. 88 findings.
- **A range out of or into a quote at a paragraph that holds an inline does nothing.** `quote(paragraph("a" link("bc") "d")) paragraph("") :: Backspace over [0,0,1,0]:0..[1,0]:0` keeps `abcd`, and so does `paragraph("") quote(paragraph("a" link("bc") "d")) :: paste text over [0,0]:0..[1,0,0]:1`. 66 findings.
- **A cut across a quote's or the title's edge does not paste back in place.** `paragraph("ab") quote(paragraph("cd")) :: cut over [0,0]:2..[1,0,0]:0 and paste it back` gives one paragraph `abcd` and loses the quote, and `title("ab") paragraph("cd") :: cut over [0,0]:1..[1,0]:0 and paste it back` adds an empty line. 42 findings.
- **Return or paste over a range that ends at the start of the empty last line keeps that line.** `paragraph("") paragraph("") :: paste text over [0,0]:0..[1,0]:0` gives `["X",""]`, where Backspace over the same range leaves one line. 40 findings.
- **Paste over a range that ends inside a link in a quote does not join the lines.** `paragraph("ab") quote(paragraph("c" link("de") "f")) :: paste text over [0,0]:0..[1,0,1,0]:1` gives `["X","ef"]`. 20 findings.
- **A range from an inline's edge to the start of the empty last line puts the empty line first.** `paragraph("a" link("bc") "d") paragraph("") :: Backspace over [0,1,0]:0..[1,0]:0` gives `["","a"]`. This is t_31726070. 14 findings.

Bold gives none of them. The code baseline lists 1,358 findings. Of these, 1,149 are a cause above, because the same document with a paragraph in place of the code block has a listed finding for the same command and places. The other 209 come from three causes of the code block:

- **A line that holds an inline never joins into a code block.** `code("ab") paragraph("c" link("de") "f") :: Backspace at [1,0]:0` keeps `["ab","cdef"]`, and a range from the code block into that line deletes its text but keeps two lines, as `code("ab") paragraph("c" link("de") "f") :: Backspace over [0,0]:2..[1,0]:1` gives `["ab","def"]`. The code block allows one text, so it cannot take the inline, and no spec rule says whether the join should drop the inline or do nothing. 90 findings.
- **A code block never joins into a quote's paragraph.** `quote(paragraph("ab")) code("cd") :: Backspace at [1,0]:0` keeps `["ab","cd"]`, where a paragraph in place of the code block joins. 76 findings.
- **A cut across a code block's edge pastes back with the other block's type.** `code("ab") paragraph("cd") :: cut over [0,0]:0..[1,0]:1 and paste it back` gives two paragraphs. 43 findings.

The deep run compares 206,836 cases on 588 documents and finds 41,909. It ran before the code block and bold. It took 703 s at a load average near 130. None is a `range-throws`, `range-undo` or `range-slot` failure. It prints only the 38,702 the gate baseline does not list. Sorted by shape, all but 612 of those fall under the gate's causes, and those 612 come from two causes that need a third line:

- **A range from an empty line's start to the end of a later line removes the empty line before it too.** `paragraph("") paragraph("") paragraph("ab") :: Backspace over [1,0]:0..[2,0]:2` gives `[""]`, not `["",""]`. 400 findings.
- **A command that empties a quote's first paragraph also removes an empty paragraph after it in the quote.** `paragraph("") quote(paragraph("") paragraph("")) :: Backspace at [1,0,0]:0` gives `[""]`, not `["",""]`, and Delete, Return and typing do the same. 212 findings.

It ran before the oracle let a titled caret join change nothing, so its counts include those cases.

## What a pass proves

Bugs planted on this tree showed where the gate holds:

- A mutant where `deleteText` in `packages/plitejs/src/transforms-text/delete-text.ts` no longer asks `hasEdgeInReadOnlyInline` gives 683 new `range-read-only` findings, such as `paragraph("") paragraph("a" guard("bc") "d") :: Backspace at [1,1,0]:0` deleting `b`.
- A mutant where `mergeNodes` in `packages/plitejs/src/transforms-node/merge-nodes.ts` never removes the ancestor a join empties gives 394 new `range-lines` and 37 new `range-cut-paste` findings, such as `paragraph("ab") quote(paragraph("cd")) :: Backspace at [1,0,0]:0` leaving `["abcd",""]`.
- Reverting 03cbb1bb61 in `packages/plitejs/src/transforms-node/set-nodes.ts` gives 129 new `range-throws` findings, such as `code("") code("ab") :: bold over [1,0]:1..[1,0]:2` refused with `Editor element "code" at [1] allows at most 1 children.`
- Reverting 9b3552d0ca in `packages/plitejs/src/transforms-text/insert-text.ts` gives 69 new `range-text` findings, such as `code("") code("ab") :: bold then type X at [1,0]:1` giving the text `ab`, not `aXb`.

t_96b80fff, a paste over a node selection of blocks, and t_dc841e4f, a join into an empty prefix occupant under the authored plugin, are out of reach, because no case makes a node selection and the editor here has no authored plugin.

## Coverage record

Synced at `test(plitejs): run the delete and paste range check over a code block and bold`. The verification describes these files as they stand there:

| File | What the check exercises |
| --- | --- |
| `packages/plitejs/src/core/editor-commands.ts` | `delete`, `deleteFragment`, `insertBreak`, `insertText`, `replaceSlice`, `addMark` and `toggleMark` |
| `packages/plitejs/src/transforms-text/delete-text.ts` | deletes by character and over a range, the unhang and the read-only refusal |
| `packages/plitejs/src/transforms-node/set-nodes.ts` | the split a mark over a range makes, which 03cbb1bb61 keeps out of a one-text element |
| `packages/plitejs/src/transforms-text/insert-text.ts` | typing with pending marks, and the one-text rule of 9b3552d0ca |
| `packages/plitejs/src/transforms-node/merge-nodes.ts` | joins and the emptied ancestor they remove |
| `packages/plitejs/src/editor/element-read-only.ts` | which edge is inside a read-only inline |
| `packages/plitejs/src/core/slice-landing.ts` | `planPaste` and `writePaste` |
| `packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` | where a slice's lines land |
| `packages/plitejs/src/core/public-state.ts` | `state.slice.get()` and the slice landing it calls |
| `packages/plitejs/src/history` | the one undo |
| `packages/plitejs/test/support/recording-laws.ts` | `editorFor`, `rootChildren` and `isRefusal` |
| `packages/plitejs/scripts/check-harness.ts` | the flags, workers and gate |
| `packages/plitejs/scripts/authored-documents.ts` | `story`, which names each document |

To see whether the verification needs another look, find the sync commit with `git log --oneline -1 --grep "range check over a code block and bold"`, then run `git log --oneline <that commit>..HEAD --` with the table's files and `packages/plitejs/scripts/delete-paste-ranges.ts`. For each commit it lists, read the diff and confirm three things. A new rule for a command at a line edge, an inline or a slot is in the oracle, with its spec rule ID. A refusal the editor gives on purpose is still an `EditorRefusalError`. The oracle still reads the document before the command, not the editor's own result. Move the sync commit in this file forward, naming its subject, only after that check and a run of `pnpm check:delete-paste-ranges`.

## What it does not cover

- Plate's block plugins. Quote, list, table, code and title rules from the editing spec, such as `EDIT-BQ-ENTER-EMPTY-001`, live in Plate plugins that this Plite schema does not load. The table check, t_3ebc1211, owns table commands.
- Word, line and block deletes, Delete over a range, a backward selection, and the caret after a command. Only character deletes run at a caret, and the laws read the document, not the selection.
- Marks other than bold, removing or toggling a mark over a range, voids, atoms, nested inlines, named roots and a document of more than one inline. The laws read text and lines, so they do not check which texts carry bold.
- A code block inside a quote, and Plate's code-block rules, such as `EDIT-CB-ENTER-001`.
- A node selection, so t_96b80fff, and the authored plugin, so t_dc841e4f and Suggesting.
- The browser: `beforeinput`, the native clipboard, Plate's clipboard writer and the DOM.

`/pstack:maintain-formal-verification-skill` brings this verification back in line after changes that did not recheck it.
