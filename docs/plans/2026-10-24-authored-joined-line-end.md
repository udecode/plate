---
review_scopes: [authored]
verdict: pursue
review_basis: [2026-10-22-emptied-line]
work_kind: implementation
review_commit: 05b58b8c9a589fc89d7c9996d0593a24bfbb99dd
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, docs/plans/topics/authored.md, docs/plans/2026-10-22-emptied-line.md, docs/plans/2026-10-24-framed-recording-accept.md, docs/plans/2026-10-23-construction-values.md, docs/development/enforcement.md, packages/plitejs/src/authored/authored.ts, packages/plitejs/src/authored/resolve-schema.ts, packages/plitejs/src/authored/tree/alignment.ts, packages/plitejs/src/authored/tree/resolve.ts, packages/plitejs/src/authored/ledger/level.ts, packages/plitejs/src/authored/ledger/runs.ts, packages/plitejs/src/authored/ledger/preview-lens.ts, packages/plitejs/src/core/representation.ts, packages/plitejs/scripts/authored-decision-order.ts, packages/plitejs/test/authored-plugin.test.ts, packages/plitejs/test/authored-tree-recording-laws.spec.ts, packages/plitejs/test/react/authored-preview-selection.test.tsx]
review_upstreams: ['../prosemirror-changeset@e215757276357b64cf74f536552f3a5ef292fa1a']
---

# Typing at the end of a line a pending join pulls up

Status: executed
Playbook: plan

Pursue, on the map from the stored tree to the preview. Where the map cannot match content by identity, it pairs tokens by shape, and the empty lines completion builds to fill a root or a container have the same shape as stored lines. So the end of a line a pending join pulls up can pair with the closes of the line built after it, and a letter typed there lands in the built line, or the framed law throws. Two rounds of better shape rules on this task each broke other edits, and earlier sessions reverted the same family twice. The resolver already knows which nodes it built, as the same objects the map reads, and drops that fact once it has used it. The fix carries the built nodes its final children still hold to the map, each canonical copy in place of the node it copies. The map takes them out before any matching and inserts them back after, so no pass can pair a stored token with a built one. A caret in a built line has no stored place, so it is stored at the end of the text before that line, leaning forward. The preview draws it in the last built line of that run, at any depth, as next does. Commands act at the stored caret, so with the caret drawn in a built line they act at the end of the line before it. Diff panel round 3 found that a wrong value, and found that a framed write after a built line now stores a document whose accept drops that line, where next refused it. Both go back to planning in the next iteration, `docs/plans/2026-10-25-authored-added-line-caret.md`, which lands with this one. A decision moves carets as next does.

## Brief

### What will change?

For your ledger-law task, a letter typed at the end of a line that another author's pending suggestion pulls up now stays in that line, where the editor used to draw it in the empty line below. It landed together with the next plan's fixes.

### What could go wrong?

Edits beside added lines could land differently, and only tests and a random search check that, in a simulated browser. With the caret in an added line, typing and Backspace act on the line above, which the next plan kept on purpose.

## Teach

A review document keeps pending suggestions as marks on one stored tree. You edit a preview where they are all accepted. When accepting leaves a root or a quote short of lines, the preview adds empty ones.

After each edit, the recorder maps the preview back to the stored tree. Where it cannot tell a piece's source, it guesses by shape, and an added empty line looks like a stored one. So a letter typed at the end of a joined line can land in the added line after it.

The part that builds the preview knows which lines it added. Now the map sets them aside before matching, then adds them back. A caret in an added line is saved at the end of the line before it and shows in the last added line. Edits act where it is saved, on the line above, which the next plan changes. Decisions move carets as today.

## Public API

No public call changes. Inside plitejs, the map takes the resolve result's children together with the lines it built, so no caller can drop them.

```ts before
// packages/plitejs/src/authored/ledger/runs.ts, resolveRun
const { aligned, change: alignment } = changeOf(aligning, output, context);
```

```ts after
// packages/plitejs/src/authored/ledger/runs.ts, resolveRun
const { aligned, change: alignment } = changeOf(
  aligning,
  resolution ?? { children: output, unstored: NOTHING_UNSTORED },
  context
);
```

## What other editors do

Read `prosemirror-changeset` at e215757 in source. The other editors have no review mode in core, and their review features were not read.

| Editor | How it knows what an edit added | Where it matches by content | Read |
| --- | --- | --- | --- |
| ProseMirror (`prosemirror-changeset`) | Each step's map records the ranges it inserted and deleted | Only inside a changed range, to shrink it to the real difference; its own docs say that match can shift with range boundaries | Read in source |
| Lexical | No review mode in core | Not applicable | Inferred, not read |
| Slate | No review mode in core | Not applicable | Inferred, not read |
| Tiptap | Built on ProseMirror; its review features were not read | Not read | Not read |

This plan takes ProseMirror's split. What an edit added comes from the edit, and content matching runs only on what is left.

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| The resolution carries the built nodes its final children hold, each canonical copy in place of its source | Plite | `plitejs` authored, `tree/resolve.ts` | Only completion knows which nodes it added |
| The map sets built subtrees aside before matching | Plite | `plitejs` authored, `tree/alignment.ts` | The map owns pairing stored content with accepted content |
| No written-window reuse for a window holding a slot whose run built a line, at any level | Plite | `plitejs` authored, `ledger/level.ts` | A written run has no resolution, so no built set |
| A forward caret at the end of a text shows in the last built line after it | Plite | `plitejs` authored, `ledger/preview-lens.ts` | The lens maps carets between the preview and the stored tree |
| A caret mapped through a removal stops at the stored index's end, and stays on its own side when a block edge comes before any text past the removal | Plite | `plitejs` authored, `tree/record.ts` | The recorder maps each stored position through the change |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Typing at the end of a joined line, in an empty joined line, or after an inline that ends one, in a root, a quote, a titled root or a named root | The letter stays in that line in both intents | Rows P0-1, P0-2, P0-4, P0-5, P1-1, P1-2 and C1 to C5 and their suite tests, jsdom; unproven in a browser |
| Enter at the end of a line joined into a quote, then a letter | The new line lands in the quote | Row P1-3, jsdom; unproven in a browser |
| A caret in a line the page adds after a joined line | Stays in that line after an edit elsewhere; with two or more added lines, a caret in any of them shows in the last one, as on next | PR 5218's preview-selection tests in the React suite and rows S-2 to S-4, jsdom |
| A caret in an added line when the join is accepted, locally, by a peer or while another view holds the caret | Stays in that line, after a quote and in a named root too, and the next letter lands there, as on next | Rows S-1, S-2, D, R-1, RC and PK, jsdom |
| Typing or Backspace with the caret in an added line | Acts at the end of the line above, where the caret is stored, while the caret still shows in the added line; on next a typed letter shows in the added line and accepting the join moves it up. The next iteration takes it | Rows L-1 and B-1, jsdom |
| Delete at the end of a line before a line another author deletes | The caret stays at the end of that line, with one or two deleted lines | Row LD, jsdom |
| A caret before a line a rejection adds | Stays where it was, also when another preview was read first | Rows R-2 and AP, jsdom |
| The caret after both joins are accepted | Stays at the start of the line after the quote | Row G-7, jsdom |

## Main changes

- `completeLevel` adds every node completion builds to the `unstored` set, with every element inside it, because completion builds each one whole. When a later completion flattens a built element away, that element leaves the set and the elements it held stay. When the canonical pass copies a built node, such as a link given a property its new place defaults, the copy takes the source's place in the set, and so does each element the pass copies inside it. The resolution returns the members its final children still hold, so a fill a level builds and then drops is not among them. Under the test environment the resolver throws when it loses any other member (`packages/plitejs/src/authored/tree/resolve.ts`, `packages/plitejs/src/authored/resolve-schema.ts`).
- The recording map wraps its alignment chain in `settledChange`, which takes the settled children with that set. It takes the built subtrees out once, runs today's structural walk, character alignment and fallback diffs on the rest, then composes the change that inserts them. The alignment functions keep next's signatures, and a decision's own change aligns as on next. A run with a built line can now pass the structural walk, which always failed on it. Under the test environment the map throws when the children it reads hold fewer members than the set, as the framed law does; elsewhere a missing member is paired by shape as today (`packages/plitejs/src/authored/tree/alignment.ts`, `packages/plitejs/src/authored/ledger/runs.ts`).
- When a level replaces slots, each new pending slot is marked if a run it replaces built a line, and a run the commands wrote is not adopted for a window holding a marked slot, so the normal resolve supplies the set. A container shown through its own level reports a marked slot in that level as a run that builds, so the level above marks the container's slot too (`packages/plitejs/src/authored/ledger/level.ts`).
- Mapping a stored caret to the preview with an explicit forward lean, at the end of a text followed by a run of lines with no stored node at any depth, puts it at the start of the last of them, in the caret's own root. A line added after a quote counts, as one added inside the quote does. Lifting a preview caret that sits in such a line prefers a stored place that shows in one. A collapsed caret with no lean maps as today (`packages/plitejs/src/authored/ledger/preview-lens.ts`).
- Moving a mapped position forward into the next leaf stops at the end of the stored index, so a forward Delete at the end of a root's content no longer reads past it. A caret moved through a removal stays on its own side when a block edge comes before any text past the removal, as at the end of a line before a line another author deletes (`packages/plitejs/src/authored/tree/record.ts`).
- `acceptedChange`, which nothing calls, is deleted.

## Expected results

Each row runs in Editing and in Suggesting through the authored plugin and its Proposed view. "Joined" means carol's pending join of that line into the line before it. "On next" is commit 05b58b8c9a, except that rows L-1, B-1 to PK, LD, A-1, R-3 and the E rows were measured on slice 1, commit 6a059d12fb, which this slice builds on. "The law" is the framed law, which runs only in tests; the other results are the same with it off. The table check is a probe in the run folder; each failure mode a slice fixes also becomes a suite test.

| Row | Rank | Start | Operations | Result | On next |
| --- | --- | --- | --- | --- | --- |
| P0-1 | P0 | Root needs 3 lines: ab, cd joined, ef joined | Type x at the end of ef | abcdefx, then two empty lines | Fails |
| P0-2 | P0 | Root needs 2: ab, cd joined | Type x at the end of cd | abcdx, then one empty line | Fails |
| P0-3 | P0 | As P0-1 | Type x in the middle of ef; on a second copy, at the end of ab | abcdexf or abxcdef, then two empty lines | Passes |
| P0-4 | P0 | As P0-1 | Type x at the end of ef, then y | abcdefxy, then two empty lines | Fails |
| P0-5 | P0 | Two-block root: ab, cd; carol suggests Backspace at the start of cd | Alice types after d in a framed Editing step | The letter stays in the joined line, and the ledger equals the kernel | Fails |
| P1-1 | P1 | Root needs 2: ab, an empty line joined | Type x in the empty line | abx, then one empty line | Fails |
| P1-2 | P1 | Root needs 2: ab, a joined line that holds the link ef | Type x after the link | ab, the link ef, x, then one empty line | Fails |
| P1-3 | P1 | Root needs 2: quote(ab), cd joined | Enter at the end of cd, then X | quote(abcd, X), then one empty line | Fails |
| C1 | P0 | Quotes need 2: quote(ab, cd joined) | Type x at the end of cd | quote(abcdx, an empty line) | Fails |
| C1-b | P0 | Root needs 1, quotes need 2: top, quote(ab, cd joined) | Type m after a in Suggesting, then x at the end of cd | top, quote(ambcdx, an empty line) | Fails when x is typed through the editor, in either intent |
| C1-c | P0 | As C1-b with ef joined after cd, where quotes need 3 | Type m after a in Suggesting, then x at the end of ef | top, quote(ambcdefx, two empty lines) | Fails when x is typed through the editor, in either intent |
| C1-d | P1 | Quotes need 2: quote(ab, cd joined), end | Type m after a in Suggesting, then x at the end of cd | quote(ambcdx, an empty line), end | Fails when x is typed through the editor, in either intent |
| M-1 | P1 | As C1-b | Type m after a in Suggesting, delete it, then x at the end of cd | top, quote(abcdx, an empty line) | Fails when x is typed through the editor, in either intent |
| C3 | P0 | Titled root: title(ab), cd joined | Type x at the end of cd | title(abcdx), then one empty line | Fails |
| C4 | P0 | A named root that needs 2: ab, cd joined | Type x at the end of cd | abcdx, then one empty line | Fails |
| C5 | P0 | Root needs 2: ab, cd joined by alice herself | Type x at the end of cd | abcdx, then one empty line | Fails |
| L-1 | P1 | As P0-2, the caret placed through the preview in the added line | Type Y | abcdY, then the added line with the caret still in it; the law holds. The next iteration takes this row | Fails; the law throws, and without it Y shows in the added line and accepting the join moves it up, giving abcdY |
| B-1 | P1 | As L-1 | Backspace, then X | Backspace deletes d, giving abc; the next iteration takes this row | Fails; the law throws, and without it the caret stays and X lands in the added line |
| B-2 | P1 | As L-1 | Delete | Nothing changes | Passes |
| DF | P1 | As P0-2 | Delete at the end of cd | abcd, then one empty line | Passes |
| LD | P1 | Root needs 2: ab, then carol's pending deletion of cd; on a second copy, a root that needs 3 with cd and ef deleted | Delete at the end of ab, then type X | The caret stays at the end of ab, and X lands there, also in a quote, a named root and a titled root | Passes with one deleted line; with two, Delete moves the caret to the start of the first added line |
| RC | P1 | As L-1 | A peer accepts the join, then type X | abcd, X | Passes |
| AP | P1 | As R-2, with an accepted preview read first | Reject the insertion, then type X | abX, then one empty line | Passes |
| PK | P1 | As L-1, in one of two proposed views, with the other view's caret after a | Accept the join, restore the parked caret, then type X | abcd, X | Passes |
| L-2 | P1 | As P0-2 | Type x, then y | abcdxy, then one empty line | Fails |
| S-1 | P1 | As P0-2, the caret in the added line | Accept the join, then type X | abcd, X | Passes |
| S-2 | P1 | As P0-1, the caret in the last added line | Type ! at the start; on a second copy, accept both joins and type X | The caret stays in the last added line; the copy gives abcdef, an empty line, X | Passes |
| S-3 | P1 | As P0-1, a range from after a to the start of the last added line | Type ! at the start | The range keeps both ends | Passes |
| S-4 | P2 | As P0-1, the caret in the first added line | Read it back | It shows in the last added line, as on next | Passes |
| D | P1 | Root needs 2: quote(ab), cd joined; the caret placed through the preview in the line added after the quote | Type ! at the start of ab, read the caret back, accept the join, then type X | The caret stays in the added line; quote(!abcd), X | Passes |
| R-1 | P1 | A named root that needs 2: ab, cd joined; main holds MAIN, END; the caret in the root's added line | Accept the join, then type X | The root gives abcd, X, and main is unchanged | Passes |
| R-2 | P1 | Root needs 2: ab, carol's inserted line cd; the caret at the end of ab leaning forward | Reject the insertion, then type X | abX, then one empty line | Passes |
| A-1 | P1 | box(inline_box(an empty text, a link, an empty text, carol's inserted link ab, an empty text)), where carol suggests box over a paragraph; an inline box needs 4 children, a link by default, and a link in a paragraph gets a default role | Reject both, then place the caret in the last text and type x | paragraph(an empty text, a link, an empty text, a link, x) | Passes; a caret placed there before the decision lands in the link, as on next |
| R-3 | P1 | As A-1, where an inline box fills with a widget that holds a link and that a paragraph flattens | Reject both, then place the caret in the last text and type x | paragraph(an empty text, a link, an empty text, a link, x) | Passes, as A-1 |
| D-1 | P1 | A group of exactly two cells, a and b, after a paragraph; carol suggests removing a | Type x, then y at the end of b | group(bxy, an empty cell) | Fails |
| G-1 | P0 | Root needs 1: quote(ab), bold cd joined | Enter at the start of cd | quote(ab, bold cd) | Passes |
| G-2 | P0 | As G-1, root needs 2 | As G-1 | quote(ab, bold cd), then one empty line | Passes |
| G-3 | P0 | Root needs 1: an empty line, bold cd joined | Type X in the empty line | bold Xcd | Passes |
| G-4 | P0 | Root needs 2: quote(an empty line), bold cd joined | Type Y in the quote's line | quote(bold Ycd), then one empty line | Passes |
| G-5 | P1 | Quotes need 2: quote(ab, cd joined), ef joined, gh | Type y at the start of gh | quote(abcdef, an empty line), ygh | Passes |
| G-6 | P1 | quote(bold cd), an empty plain line joined | Type x at the end of cd | quote(bold cdx) | Passes |
| G-7 | P1 | As G-5 | Caret at the start of gh, accept both joins, type y | Stored quote(abcdef, an empty line), ygh | Passes |
| G-8 | P1 | quote(quote(ab)), where carol inserted ab and suggests the outer quote, which was a paragraph | Reject both together | Applied, giving one empty line | Passes; the built set must not throw |
| E-1 | P1 | As P0-2 | Enter inside ab, then X | a, Xbcd, stored a, Xb, cd; the law holds | Fails; without the law it gives the same, and in Suggesting also an empty line after |
| E-2 | P1 | As P0-2 | Enter at the end of ab, then X | ab, Xcd, stored ab, X, cd; the law holds | Fails; without the law it gives the same in Editing, and in Suggesting an empty line after and X stored with cd |
| E-3 | P1 | As P0-2 | Enter at the start of cd, then X | ab, Xcd, stored ab, an empty line, Xcd; the law holds | Fails; the law throws, and without it X is stored in cd |
| E-4 | P1 | As P0-2 | Enter at the end of cd, then X | With the caret set in Enter's update: abcd, X, stored ab, cd, X; Enter is refused and drops the caret, so X lands where a caretless insert puts it, not where the user aimed. With a caret set earlier, Enter is refused, the caret stays and X gives abcdX, then an empty line. The 2026-10-25 iteration records Enter in both (its row N-13) | Fails; the law throws, and without it X is stored in cd |
| E-5 | P1 | Root needs 3: ab, cd joined, ef joined | Enter at the end of ef, then X | With the caret set in Enter's update: abcdef, then two empty lines, stored ab, cd, ef; Enter is refused and drops the caret, and X, which lands in the last empty line, is refused too. With a caret set earlier, X is stored at the end of ef: abcdefX, then two empty lines. The 2026-10-25 iteration records Enter in both (its row N-26) | Fails; without the law it gives abcdef, an empty line, X, with X stored in ef |
| F-1 | P0 | Titled root: ab, cd, quote(ef, gh) | Suggest a break after a, then an Editing delete from a to g | Accepting everything gives what the commands wrote | Fails; the framed-recording plan fixes it |
| F-2 | P0 | The history fast-check seed 1144417495 once found | The pinned plain-editor test | Suggesting gives what a plain editor gives | The pinned test fails; the seeded law passes, because its runs no longer reach the history; the framed-recording plan fixes it |
| F-3 | P0 | Ledger seed 1936384615 | The main and titled ledger laws | The ledger equals the kernel | Fails; the framed-recording plan fixes it |
| F-4 | P1 | Ledger seed 1806324954 | The ledger law's own oracle | The oracle projects with each root's own schema and names its root | Fails, because the oracle used a schema without titles; the framed-recording plan fixes the oracle |
| K-a | P1 | quote(ab, cd), ef; alice suggests deleting from a to e | A remote edit moves a after c, then shifts a child | The remote commit's review delta names alice's change | Fails; its own task |
| K-b | P3 | Random fast-check seeds | The undo law | It compares more than 24 histories | Fails at some seeds; open work |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Built-node provenance | `completeLevel` reads `completion.built` to wait on it, then drops it (`tree/resolve.ts:2184-2192`) | The resolution carries `unstored`, a `ReadonlySet<JsonNode>` of the built nodes its final children hold, by identity, each canonical copy in place of its source | `tree/resolve.ts` | Only completion knows what it built, and its nodes reach the final children as the same objects or as copies the canonical pass makes | Internal; `AuthoredResolution` gains the set, and its one script reader is unaffected | The premise probe, G-8, A-1, then the table | A pass other than the canonical one rebuilds a built node; tests stop on it, and elsewhere it pairs by shape as today | rearchitect |
| Stored-to-accepted map | `characterAlignedChange` pairs every unmatched token by `sameShape` (`tree/alignment.ts:242`, `:284`) | The recording map wraps its alignment chain in `settledChange`, which sets built subtrees aside once, runs today's passes on the rest and composes their insertion | `tree/alignment.ts` | It removes the guess instead of ranking it | `ledger/runs.ts:403-414`; a decision's own change aligns as on next | The table's P0 and P1 rows, the laws, a seed search | A built node inside a stored element's text run | rearchitect |
| Written-window reuse | A run the commands wrote is reused without a resolve when its output fits (`ledger/level.ts:368`) | Refused for a window holding a slot whose replaced run built a line, a container's slot whose own level holds one included | `ledger/level.ts` | A written run has no resolution, so no built set | Internal | P0-4, D-1, C1-b to C1-d, M-1, the ledger law, speed lines L1 to L3 | More resolves on those slots | gate |
| A caret in a built line | The tail pairing sends the joined line's stored end into the built line (`ledger/preview-lens.ts:167-227`) | A forward lean at that stored end shows in the last built line of the run after it, at any depth and in its own root; commands act at the stored caret, and a decision moves carets as on next | `ledger/preview-lens.ts` | Separation removes the pairing that placed it | Internal | PR 5218's preview-selection tests, rows S-1 to S-4, D, R-1, R-2, RC, AP and PK | Edits at a caret drawn in a built line act on the line above, which the next iteration takes; the first of several built lines reads as the last, as on next | rearchitect |
| `acceptedChange` | Exported, no caller (`tree/alignment.ts:628`) | Deleted | None | Dead code | None | Typecheck and a `git grep` | None | cut |

The gate row's probe is the speed lines below, frozen before building. They read the ledger's work counters (`ledger/work.ts`). Each line runs on next first, and a conclusive miss sends the target back to `architect`.

- **L1.** With nothing built in a run, every counter the authored work test reads equals next's for typing, a range delete and a decision at 2,000 blocks, and a new `setAsideNodes` counter stays at 0. Control: a planted gate that refuses every written window must fail L1.
- **L2.** On a root of 2,000 paragraphs then quote(ab, cd joined), where quotes need 2, 20 letters typed inside cd in each intent resolve at most one more run per key than next does, read from `resolvedRuns`. Control: a planted arm that resolves each run twice must fail L2.
- **L3.** On L2's document and P0-1's, in the proposed and accepted previews, `setAsideNodes` per key stays at most that key's `resolvedNodes` plus `writtenNodes`, so setting lines aside reads only the run. Control: a planted pass that sets aside over the whole root must fail L3 on L2's document.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How typing beside added lines is fixed | Added lines are set aside before matching, so typing stays in its line (look) | A better guess at which lines match | shape rules | small |
| Where a caret in an added line goes | In the last added line, as today (look) | Save a place for each added line, so the first of two keeps its caret | caret number | small |
| An added line the preview loses | Tests stop on it; elsewhere the edit guesses by shape, as today (safe) | Stop everywhere | stop always | detail |
| Failures the random search finds in other parts | Each goes to its own task, so this run stays on line ends (look) | Fix them in this run | fix here | small |
| Enter beside an added line, apart from the quote case | Stays with its own task (look) | Fix every Enter case here | fix enter here | small |
| Where the table check lives | In the run folder, with each fixed failure mode also a suite test (safe) | Commit the table check as a test | commit the table | detail |
| Speed check | Count the work at 2,000 blocks against limits set before building (safe) | Also time it on a large document | time it | detail |
| How a decision moves carets | As next does, so a caret placed after a link before rejecting the link's insertion still lands in the link (look) | Move a caret that showed in an added line into the decided line, which diff panel round 1 found moved remote, parked and other previews' carets wrong | decision lean | small |
| Landing | The whole design as one slice (safe) | Land the built set alone first | split slices | detail |
| The authored page link | A new page at https://claude.ai/artifact/76WBiPNpgcW9rHMoxesgct, because https://claude.ai/artifact/C5zrU46DjyucvH1hwC3jHP no longer opens for this account (safe) | Go back to the old page | old page | detail |

## Steps

- [x] **1. Build.** The resolution's `unstored` set with the canonical carry and the flatten drop, the map's separation and its test-only throws, the written-window gate with the container level's report, the lens rule, the decision lean, and the `acceptedChange` cut. Plan round 3 adds the lean at any depth and in the caret's own root, the decision lean only for a caret a preview showed in a built line, every element inside a built element in the set, and one set-aside around each caller's alignment chain. The slot mark's carry from an already marked slot is cut, because no probe, table, law or seed fails without it. It also fixes three code nits: the cast in `besideBuilt`, the set type in `Settled`, and `acceptOwn` passing the empty set. Diff panel round 1 replaces the decision lean with the command frame's lean in core, maps decisions as next does, stops the forward walk into a leaf at the index's end, and cuts the union of built sets that `resolveAuthoredValue` returned, which nothing reads. Diff panel round 2 reverts the frame's lean, which threw or lost letters in nine cases, and refuses an edit at a caret its placing view draws in a built line instead. It also keeps a caret on its own side of a removal before a block edge. Diff panel round 3 reverts that refusal, which asked the wrong view, kept a stale placing view, missed edits that named a place and refused plugin writes that named one. Commands act at the stored caret again, and the next iteration decides where they act. Proof: the premise probe finds every surviving built node in the set, the strict check fires on A-1 without the carry and on G-8 without the flatten drop, and typecheck and lint pass.
- [x] **2. Tests.** Round 1's three alignment tests and the pinned history (P0-5) come back, the history in the ledger law's two-block root. Each failure mode the table fixes that no suite test catches gets one test, such as a container's fill (C1), a container a root window spans (C1-b), a deferred fill (D-1), a consumed built line (G-8), a copied built link (A-1), a flattened fill's link (R-3) and a caret across a decision (S-1, S-2, D, L-1, R-1, R-2). Proof: each new or restored test fails at next in a detached worktree and passes on the slice. Each that passes on next fails on the slice without the part it guards, or on the bytes diff panel round 1 reviewed. The test that types at the end of a joined line through a forward caret fails at next with the law on. LD fails without the removal rule, DF without the index bound, and D without the lens's lean or with the sibling condition back. RC, AP and PK fail on the reviewed bytes. S-1 and S-2 failed on the round-1 build without its decision lean, where decisions set built lines aside, R-1 when that lean dropped the caret's root, and R-2 when it moved every forward caret. They now pin that a decision keeps those carets where next does. P0-4, D-1 and C1-b fail without the written-window refusal, A-1 without the canonical carry, and G-8 and R-3 without the flatten drop. Since decisions move carets as on next, no test fails without the lean's root keep or the nested elements, and both stay to keep the lean's point in its root and the set equal to what completion built.
- [x] **3. Proof.** The table check passes every P0 and P1 row apart from K-a in both intents, and the Enter rows give the outcomes the table pins. The recording laws pass at the default seed and at seeds 5, 1936384615 and 1806324954 and fast-check seed 1144417495, with the plitejs Bun suite, the React vitest suite and the decision-order gate at its gate bounds, three marks and three blocks. Speed lines L1 to L3 pass, each with its control. A fresh-seed search runs in rounds of six seeds through `proof.mjs`. Proof: their logs.
- [x] **4. Ship.** Writing passes, the push panel on the diff, and one `land.mjs` run. Plan round 3 was the plan panel's last round and changed the design, so the push panel also reviews those changes. Diff round 1 found five critical cases, each reproduced, and its fixes changed the design, so round 2 reviews them. Round 2 found nine critical cases in the frame's lean and the removal map, so round 3, the last, reviews the refusal and the removal fix. Round 3 found five critical cases in the refusal, which is reverted, and two wrong values, which the next iteration takes. This slice lands with that iteration, whose panels review the whole diff. Proof: the panel's rows and the landed commit.
- [x] **5. Close.** The subject's rules gain the built set and the lens rule, then the Close, the fold and a second land. Proof: `review-ledger.mjs check` and a `--folded` render.

## Close

Reversals. Two sets of better shape rules were built on this task and reverted after panel rounds, before this design. Plan round 3 cut the slot mark's carry from an already marked slot, because nothing failed without it. Diff round 1 replaced the decision lean with a lean in core's command frame, and diff round 2 reverted that lean, which threw or lost letters in nine cases. Round 2 put a refusal of edits at a caret drawn in an added line in its place, and diff round 3 reverted the refusal, which asked the wrong view and refused plugin writes that named their place. Commands act at the stored caret, as `docs/plans/2026-10-25-authored-added-line-caret.md` decided with its word act there.

Deviations. This slice did not land alone. Diff round 3 found two wrong results, a caret drawn one line below where commands act and a framed write after an added line that next refused. Both went to the 2026-10-25 iteration, and the slice landed with it after that plan's two diff rounds reviewed both builds. Landing took four `land.mjs` runs, because a React caret file this change does not touch timed out under load.

What landed. Commit 90166d7680, "fix(plitejs): record edits beside the empty lines a review preview adds", holds this slice and the 2026-10-25 iteration. Finding 4's insert at the end of ef now records, as rows P0-1 and P0-2 pin. The resolver hands the lines it builds to the map, which sets them aside before any matching, so a letter typed at the end of a joined line stays in that line.

Proof and its limits. On the bytes that land, the diff hashing 27cca97a3800, the table check passes every P0 and P1 row apart from K-a in both intents, and the Enter rows give what the 2026-10-25 iteration's table pins. The recording laws pass at the default seed, at seeds 5, 1936384615 and 1806324954 and at fast-check seed 1144417495. The authored plugin suite passes 161 tests, the plitejs Bun suite 6,233 and the React vitest suite 1,972. The decision-order gate finds no failure at its gate bounds, three marks and three blocks. Speed lines L1 to L3 pass against next. A fresh-seed search of 12 runs found only the every-order law's floor, which next and this build both miss at fast-check seed 7, now in Open work as K-b. Everything ran in jsdom, and nobody drove the change in a browser.

Counts. 5 steps, 5 done. Six panel rounds ran, three on the plan and three on the diff, each with Opus, Astra and Sol at xhigh, and the 2026-10-25 iteration's two diff rounds reviewed this slice again. One owner message, "c", continued the run, done. No decision-trail review ran.

Inputs. The design read `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md`, `docs/plans/topics/authored.md`, `docs/plans/2026-10-22-emptied-line.md`, `docs/plans/2026-10-24-framed-recording-accept.md`, `docs/plans/2026-10-23-construction-values.md` and `docs/development/enforcement.md`. The build read or changed `packages/plitejs/src/authored/authored.ts`, `packages/plitejs/src/authored/resolve-schema.ts`, `packages/plitejs/src/authored/tree/alignment.ts`, `packages/plitejs/src/authored/tree/resolve.ts`, `packages/plitejs/src/authored/ledger/level.ts`, `packages/plitejs/src/authored/ledger/runs.ts`, `packages/plitejs/src/authored/ledger/preview-lens.ts`, `packages/plitejs/src/core/representation.ts` and `packages/plitejs/scripts/authored-decision-order.ts`. Its proof ran `packages/plitejs/test/authored-plugin.test.ts`, `packages/plitejs/test/authored-tree-recording-laws.spec.ts` and `packages/plitejs/test/react/authored-preview-selection.test.tsx`.

## Open work

- K-a. A remote commit that moves and shifts nodes under a pending range delete reports an empty review delta where the kernel counts the delete as changed, as on next. owner: zbeyens; stop: suggested task t_235e0cbb lands or is dropped; tracked: suggested task t_235e0cbb.
- K-b. The undo law's floor of 24 compared histories fails at some random fast-check seeds, because the generator sometimes samples too few undoable histories, as on next. The every-order decision law's floor of 12 compared decision orders fails the same way, and next and this build both compare exactly 12 at fast-check seed 7. owner: zbeyens; stop: the next change to either law; tracked: this plan.
- Enter beside a line the page adds, other than row P1-3, stays with suggested task t_9cb6f7a6. Enter at the end of a joined line is refused in this plan's build, as rows E-4 and E-5 say, and the 2026-10-25 iteration records it (its rows N-13 and N-26). Enter in the first line, or at the start of a joined line, records what accepting gives, rows E-1 to E-3, since the 2026-10-25 iteration lets accepting drop added lines that end their list untouched. That task starts from these results. owner: zbeyens; stop: t_9cb6f7a6 lands or is dropped; tracked: the suggested-task ledger.
- A caret placed after a link before a decision rejects the link's insertion lands in the link, as on next (rows A-1 and R-3). owner: zbeyens; stop: a report or a test that needs that caret kept out; tracked: this plan, word decision lean.
- The authored work test. Under a parallel load it ran 5,518 ms, past Bun's 5,000 ms deadline, while alone it ran 3.6 s and 3.7 s on this build and 3.4 s and 4.0 s on slice 1. owner: zbeyens; stop: a run of the test past its deadline alone; tracked: this plan.
- The first of several added lines. A caret in the first of two or more lines the page adds after a text shows in the last one, as on next. owner: zbeyens; stop: a report or a test that needs that caret; tracked: this plan, word caret number.
- Edits at a caret drawn in an added line, and a framed write after an added line. With the caret in an added line, typing lands at the end of the line above and Backspace deletes that line's last letter, while the caret still shows in the added line. A framed insert after an added line stores a document whose accept drops that line, where next refused it with `diverged`. owner: zbeyens; stop: the build of `docs/plans/2026-10-25-authored-added-line-caret.md`; tracked: that plan.

## Evidence

Model: claude-opus-5-5 at xhigh effort, from this session's lead rows.

### Requirements

- The framed law says accepting a framed recording gives what its commands wrote (`packages/plitejs/src/authored/authored.ts:466-485` at the review commit).
- The ledger law says the review ledger equals the kernel after every step, undo, redo, decision and remote commit (`packages/plitejs/test/authored-tree-recording-laws.spec.ts`).
- Completion fillers exist only in the preview, and no stored key names them ([the authored subject](topics/authored.md), line 196 at the review commit).
- The map runs for each changed run on every key, and its work stays proportional to the run. An earlier session's design where the resolver writes the map lost on 2026-10-17 because it paid a full resolve on every key (this run's recall of earlier sessions).
- Stored documents keep their shape, with no new mark kind or record.
- The decision-order baseline only shrinks (`.claude/skills/authored-decision-order/SKILL.md`).
- Each test keeps Bun's 5,000 ms deadline (`docs/development/enforcement.md:32`).

### Lanes

- **Control: keep shape matching.** It adds no artifact. Rejected, because rows P0-1, P0-2, P0-4, P0-5, P1-1 to P1-3, C1 to C5, L-1, L-2 and D-1 fail on next.
- **Better shape rules.** This task built two and reverted both after panel rounds. Closing the gap's front first missed P1-1 to P1-3. Pairing from the front with a rule for a joined first text crashed G-1 and typed plain in G-3 and G-4. Earlier sessions reverted head-first pairing on 2026-10-17 and rejected masking removed text leaves on 2026-10-19 (this run's recall). Rejected, because shape cannot tell a built line from a stored one.
- **Pair by the resolver's identity map.** Rejected, because it returns null for merged blocks, merged texts and some canonical replacements (read in `tree/resolve.ts` by two arena runners).
- **Store the built lines.** The recorder would write each fill into the stored tree. Rejected, because it changes stored documents and the cards they show, and the open construction-values plan already owns the spares completion takes.
- **Mask built tokens inside each matching pass.** Two arena candidates, scored 21 and 20 of 30 by the cross-judge. Rejected, because a masked token still sits in the gap, so pairing falls to the middle LCS.
- **Set built subtrees aside, then compose their insertion.** Picked, the arena's base at 24 of 30. Its grafts are the identity set, the gate on written windows, and the cut of `acceptedChange`, all from the 21-point candidate. The lead added the check for a missing built node. The judge also found that one mask design's written-window refusal missed deferred fills, which the slot mark covers, and that no candidate ran the decision-order gate, which step 3 runs.
- **A place number for each built line's caret.** PR 5218's arena picked it for its own design. Rejected here, because a forward lean at the stored end of the text before the line places the caret in the last built line of the run, as next does, with no new stored field. Plan round 2 found that a lean into the first built line lost a caret in the second, which next keeps, so the lean goes to the last. The first of several built lines stays unreachable, as on next.
- **Act in the added line.** Diff round 1 moved the frame's caret where the lens draws it, so commands wrote into the added line. Rejected after diff round 2, because a block type change, a paste and typing in a titled root threw, a bold letter was lost and an Editing view's caret moved into a line it does not show.
- **Refuse an edit at a caret drawn in an added line.** All three runners of round 2's `architect` picked it, so the view that placed the caret decided. Rejected after diff round 3, because it found that view by a presentation that derived views share, kept a preview as the placing view after the base editor placed the caret, let an edit through when it first named a place, sent a caught refusal nowhere, and refused plugin writes that named their place.
- **Strongest deletion: no fill lines in the preview.** Rejected, inferred: commands run on the preview under the schema, where a root below its minimum is not a valid document, and the subject keeps fillers as preview-only lines.

A prototype of this design in a scratch worktree passed every table row it ran, 28 in the first table and 15 in the second, the recording laws at every pinned seed, the authored plugin suite, the plitejs Bun suite of 6,154 tests and the React vitest suite of 1,953. Without the lens rule, three of PR 5218's 21 preview-selection tests failed. Without the survivor rule, G-8 threw. The premise probe ran on this run's tree. Every node completion built is the same object in the resolution's final children: 2 of 2 for P0-1's document, 1 of 1 for a quote's filler and 2 of 2 for a quote filler under a root filler. After plan round 2's fixes, replayed on slice 1 over next, the prototype passed every round-2 case that failed on the reviewed tree. Those were the Opus 1 case and its variants (C1-b to C1-d, M-1), the caret across a decision (S-1, S-2), the second added line (S-2, S-3) and the copied link (A-1). It also passed the tables, the laws at every pinned seed, the plitejs Bun suite of 6,199 tests, the React vitest suite of 1,972 and the decision-order gate at its gate bounds, three marks and three blocks. The strict check fired with its own message on A-1 without the canonical carry and on G-8 without the flatten drop. After plan round 3's fixes, the build passed the four round-3 cases, both tables, the Enter rows, the round-2 cases, the laws at every pinned seed, the authored plugin suite of 145 tests, the plitejs Bun suite of 6,217, the React vitest suite of 1,972, typecheck, lint and the decision-order gate at its gate bounds, three marks and three blocks. Of the 18 new suite tests, 12 fail on slice 1, and each of the other six fails on the build without the part it guards, as step 2 lists. The pinned history fails on slice 1 too. After diff round 3 reverted the refusal, the round-3 probes find no refusal left, a plugin write that names its place gives what slice 1 gives, and the two-deleted-lines Delete test passes where slice 1 fails it. The table and the laws run only in jsdom, and nobody drives the change in a browser.

### Dependents

- `ai`, `comments`, `documents`, `exports`, `html`, `layout`, `persistence`, `react`, `suggestions` and `ui` are unaffected. None imports the alignment functions or `resolveAuthoredChildren` (`git grep` at the review commit), and the documents, cards and marks they read keep their shapes. The one reader of `AuthoredResolution` outside the tree is `packages/plitejs/scripts/authored-decision-order.ts`, which step 3's gate runs. The React preview reads carets through the lens, which PR 5218's tests cover.

### History

This review retains `2026-10-22-emptied-line`, the scope's head, and leaves its rule for emptied wrappers as it is. It takes over finding 4 of `docs/plans/2026-10-24-framed-recording-accept.md`, which moved it here after two panel rounds. It fits `docs/plans/2026-10-23-construction-values.md`, building at step 6 of 13: a spare completion takes has no stored tokens, so it joins the built set as a built line does. It read `../prosemirror-changeset` at e215757.
