---
review_scopes: [list]
review_basis: [2026-10-10-list-review]
verdict: pursue
work_kind: implementation
review_commit: 666f02406e936864cc61e5ccb6824321df4d9a42
review_inputs: [docs/plans/2026-10-10-list-review.md, packages/platejs/src/features/list/lib/listIndex.internal.ts, packages/platejs/src/features/list/lib/BaseListPlugin.ts, packages/platejs/src/docx/import/lib/numbering/readDocxNumbering.ts, packages/platejs/src/docx/import/lib/numbering/importDocxNumbering.slow.ts, packages/platejs/src/docx/export/lib/internal/docx-document.ts, apps/www/src/__tests__/package-integration/docx/list-roundtrip.spec.tsx, packages/platejs/src/react/features/list/ListPlugin.tsx, docs/editor-behavior/markdown-editing-spec.md, content/docs/(plugins)/(serializing)/docx.mdx]
---

# Lists: Word's count and local recounts

Status: executed: step 3.2 and the trail review's two open items wait on the next list iterations
Playbook: plan

Pursue, opened by the decision-trail review of `2026-10-10-list-review`. That review found the owner's "full docx support" unmet for restarted Word instances that interleave, and found N Markdown lists still costing work in proportion to all of them. The strongest reason to pursue is new evidence. Microsoft's published algorithm for Word's numbering, MS-DOC 2.4.6.4, counts every instance of one definition in one shared sequence per level. A start override resets that sequence once, at the instance's first paragraph. MS-OI29500 adds that Word ignores `w:start` and `w:lvlRestart` inside a level override. The importer and its tests follow SuperDoc's counting instead, which gives an override instance a count of its own. So the review's demand for separate lists rested on the wrong oracle, while Plate's one list per definition already matches Word's shared count. Phase 1 moves DOCX import and export to Word's algorithm. Phase 2 keeps each list as per-level lanes stored in small chunks, so a recount walks only the numbers an edit changes and an insert copies a bounded number of references, whatever the other lists hold; that also bounds the Markdown cohorts, whose bullets the old recount walked. Phase 3 checks the writer and reruns the scale lines. Plan panel round 1 cut the Markdown list ids this plan first proposed. It also moved where a restart lives after its item is deleted, for Plate's Restart, Markdown starts and Word instances alike, to its own iteration.

## Brief

### What will change?

Word files now get the numbers Microsoft's published rules give. An edit in a long list renumbers only what changes, except mark changes across many items. Your example of N separate lists still slows inserts among Markdown lists.

### What could go wrong?

No Word run checked the numbers. A trail review flagged the Markdown gap and the mark-change cost as unmet asks. Moving a restarted list's first item still misplaces its restart. Fixes after the last review got tests, not another review.

## Teach

A Word file stores numbering as definitions and instances. Many paragraphs can use one instance, and many instances can share one definition. Plate turns each definition into one list.

Plate's importer copied the SuperDoc editor's counting, where a restarted instance counts on its own. Microsoft's own description of Word says otherwise. All instances share one count, and a restart resets it once. Where the two disagree, Plate stored SuperDoc's numbers, which then went stale after an edit. Separately, each edit recounts from its list's last forced restart to the next one, so an edit near the end of a 10,000-item list recounts all 10,000, and an edit in a numbered Markdown list walks every bullet list after it.

After the change, the importer maps Word's count onto list facts, and Plate's own count gives Word's numbers. Each level keeps its numbered items in order, so a recount starts at the edit and stops at the first number that holds.

## Public API

`importDocx` and `exportDocx` keep their calls, and the list index stays private to `features/list/lib`. What changes is the numbers an import returns where Word's count differs from SuperDoc's, here for two restarted instances of one definition that alternate.

```ts before
// packages/platejs/src/docx/import/lib/numbering/importDocxNumbering.slow.ts
expect(await importNumbers(source)).toEqual([
  'A1:1',
  'B1:1',
  'A2:2',
  'B2:2',
]);
```

```ts after
// packages/platejs/src/docx/import/lib/numbering/importDocxNumbering.slow.ts
expect(await importNumbers(source)).toEqual([
  'A1:1',
  'B1:1',
  'A2:2',
  'B2:3',
]);
```

## Document shape

Two restarted instances of one Word definition alternate here. Today the import stores B2's number as a restart, so B2 stops counting with its list.

```json before
[
  { "type": "p", "listType": "numbered", "listId": "abstract:0", "indent": 1, "children": [{ "text": "A1" }] },
  { "type": "p", "listType": "numbered", "listId": "abstract:0", "indent": 1, "listRestart": 1, "children": [{ "text": "B1" }] },
  { "type": "p", "listType": "numbered", "listId": "abstract:0", "indent": 1, "children": [{ "text": "A2" }] },
  { "type": "p", "listType": "numbered", "listId": "abstract:0", "indent": 1, "listRestart": 2, "children": [{ "text": "B2" }] }
]
```

```json after
[
  { "type": "p", "listType": "numbered", "listId": "abstract:0", "indent": 1, "listRestart": 1, "children": [{ "text": "A1" }] },
  { "type": "p", "listType": "numbered", "listId": "abstract:0", "indent": 1, "listRestart": 1, "children": [{ "text": "B1" }] },
  { "type": "p", "listType": "numbered", "listId": "abstract:0", "indent": 1, "children": [{ "text": "A2" }] },
  { "type": "p", "listType": "numbered", "listId": "abstract:0", "indent": 1, "children": [{ "text": "B2" }] }
]
```

Word shows 1, 1, 2, 3 there, the same numbers the after shape counts to. The ids pass through HTML decode, which remaps them per conversion, so the stored ids are fresh.

## What other editors do

| Delta | Editor | List model | Where the number comes from |
| --- | --- | --- | --- |
| added | Microsoft Word (MS-DOC 2.4.6.4, MS-OI29500 17.9.10 and 17.9.25) | A list per numbering definition; paragraphs reference instances of it | One sequence per definition and level shared by every instance. A shallower paragraph restarts a level within its restart limit. An instance's start override resets the sequence once, at its first paragraph at that level. Word ignores `w:start` and `w:lvlRestart` inside a level override |
| added | pandoc `bde8c29` | Lists keyed by abstract numbering definition | Its DOCX reader keys continuation on the definition and notes that Word writes "restart numbering" as a new instance on the restarted item only, with the following items back on the original instance (`src/Text/Pandoc/Readers/Docx/Parse.hs`, issue #8367) |

SuperDoc's counter, which the importer copied, reads an override instance's own record at an overridden level, so its numbers differ from Word's when a restarted instance is used again after another instance of its definition. The rdocx project reported checking Word for Mac, where two plain instances of one definition continue one count and an instance with a start override restarts it. Microsoft's Open Specifications team confirmed that list format overrides pointing to one list identifier are one list. Pandoc's `test/docx/lists_restart_8367.docx`, written by Microsoft Office Word 16, has that shape. The first item of section 2 points at a new instance with a start override, the rest stay on the style's original instance, and pandoc expects 1, 2, 3, 4. MS-DOC's shared count gives those numbers, and so does SuperDoc's; a reader that counts each instance apart, as the eigenpal editor does, gives 1, 4, 5, 6, so it misreads Word's own files. The exporter adopts Word's shape.

## Native behavior and proof

| Delta | Behavior | What happens | Proof surface |
| --- | --- | --- | --- |
| changed | Word documents | Lists keep their membership, level rules and numbers through import, an insert, export and re-import, counted the way Word counts them: instances of one definition share each level's count, and a start override restarts it once. A bullet-format paragraph inside a numbered level stays an uncounted bullet. Inserting before, deleting or moving the first paragraph of a restarted instance leaves the restart on its item, where Word moves it to the instance's first paragraph | DOCX import specs against an oracle written from MS-DOC 2.4.6.4, and round trips, before and after an insert |
| added | An edit in one long list | The recount visits the numbers the edit changes | Work-unit lines for start, middle and end edits in a 10,000-item list |
| changed | Typing, mark toggles, plain-paragraph edits anywhere | No recount and no list render; typing after a mark toggle checks the typed item's order, about 15 compares in a 10,000-item list | Scale line I8, which fails its zero-work line; work counters and the keystroke cost cases |
| changed | Markdown round trip | Each Markdown list stays in the root's default list and opens with a forced start; an insert there visits only the numbers it changes and copies at most a chunk of pointers, while its time still grows with the number of lists; serialize starts each run at its number | `deserializeMdList.spec.tsx`, `standardList.spec.ts`, `EDIT-LIST-START-MD-401`, scale line L4 |
| added | A list item at indent 0 | Counts as a level above level 1, the way Markdown nests it, and a level whose rule is 0 still never restarts | `listIndex.internal.spec.ts` and the indent-0 case in `standardList.spec.ts` |

## Main changes

- DOCX import maps Word's count, after MS-DOC 2.4.6.4, onto list facts and counts nothing itself. Each definition becomes one list, and each instance's start override becomes `listRestart` on its first paragraph at that level. Plate's own count of those facts gives Word's numbers, so the importer's Word and Plate counters and its pinned numbers are gone. An override's `w:lvl` keeps its format and level text, but not its `w:start` or `w:lvlRestart`. A bullet-format paragraph stays a bullet and does not count, also when its instance overrides a numbered level's format; MS-DOC's step list, read literally, would count it.
- DOCX export writes Word's `decimalZero` level for a `decimal-leading-zero` list, which used to fail the export. It writes a restart, or any number Word would not reach, as a new instance on that item only and returns the items after it to the list's own instance, so it writes no override that a later restart could reapply. An item with `listRestart` gets that instance even when its number already matches, so the restart survives a round trip.
- The index keeps each list as per-level lanes, each stored as a list of chunks of at most 128 entries; a chunk that drops under 16 entries merges into a neighbor. One lane per level holds the level's numbered items in document order, and another holds every item at that level. An insert copies at most a chunk plus, once in about 64 inserts, the chunk directory, and a recount walks one level's numbered lane from the edit and stops at the first number that holds, then jumps to the next changed point in that level. It finds whether an item between two numbered items closes their level with a cursor per shallower level that moves forward with the walk. A level's restart rule comes from the counted item's `listLevels`, not from the item that closes it, and a limit at or beyond the level acts as the default. Where copies of `listLevels` in one list differ, each number continues the one before it in its lane under its own item's limit; Word files never produce such copies, since Word ignores `w:lvlRestart` inside an override. The full count for encoders and builds uses the same rule in one pass. A commit that changes more than an eighth of a list filters and merges its lanes in one pass instead of placing entries one at a time. A changed item keeps its lane place only when a check shows its order held, and every other changed item is placed again. A level whose rule is 0 never restarts, and an item at indent 0 counts as a level above level 1, the way Markdown and the list commands read it.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Whose counting rules Word files follow | Microsoft's published description of Word (look) | SuperDoc's counting, which the import used until now | superdoc-count | big |
| The extra insert slowdown the review flagged | No more work in this plan, since the editor core is what grows; it stays open there (look) | Keep chasing the list part of it | chase-growth | small |
| The review's doubled-write check | Prove instead that each insert writes and visits exactly the numbers that changed | Run the doubled-write arm in the browser | doubled-write | small |
| How numbers get updated | One list per level kept in small chunks, which walks as fast as a plain list and copies the same small amount however many other lists there are (look) | One plain list per level, which copies every later item on each insert | array-lanes | small |
| How an item at indent 0 counts | As a level above level 1, the way Markdown and the list commands read it; a level whose rule is 0 still never restarts (look) | Count it as level 1, which numbered it apart from its Markdown nesting | indent-zero-as-one | small |
| Bullets inside a numbered Word level | They stay bullets and don't count, so no number is stored to go stale (look) | Count them, as a literal reading of Microsoft's text says, which needs a new marker kind across export, Markdown and plain text | count-bullets | small |
| Where a restart lives once its item is deleted | Plan it next, for Plate's Restart, Markdown starts and Word instances together (look) | Change it here for Word imports only | restart-runs-here | big |
| Drawing big renumbers | Keep today's writer, which redraws every visible list after more than 1,024 changes, and measure it | Track each view's lists and redraw only the changed ones | writer-refs | small |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DOCX numbering count | SuperDoc's counter plus a Plate counter and pinned numbers; an override `w:lvl` sets start and restart | No counter: Word's count mapped onto facts, an override as `listRestart` on its instance's first paragraph; an override `w:lvl` sets format and text only | `readDocxNumbering.ts` | MS-DOC 2.4.6.4 and MS-OI29500 17.9.10, 17.9.25; the probe found no document needing a pin with formats on definitions | Imported numbers change where SuperDoc and Word differ | Specs against an MS-DOC oracle, before and after inserts; pandoc's Word 16 restart shape | No Word install confirms it here; the oracle encodes the plan's reading | rearchitect |
| DOCX export restarts | An override instance carries every later item; an override re-applies when its level restarts; a restart that matches is dropped | A new instance on the restarted item only; later items on the list's own instance; every `listRestart` exported | `docx-document.ts` `openPlateList` | MS-DOC applies an override once; pandoc reports Word's own shape; a matching restart is intent | None | Round trips with a restarted deeper level, a matching restart, and an insert before each | None found | rearchitect |
| Recount span | From the last forced level-1 restart to the next one, or the list's end | Per-level lanes in chunks; walk one level's numbered items from the edit, stop at the first number that holds | `listNumbering.internal.ts`, used by `listIndex.internal.ts` | The owner's ask; the prototype visits 1 item instead of 30,001 for an end insert and copies 72 references instead of 29,992 among 3,000 Markdown lists | None | Work lines with known-bad arms; the seeded property test against an independent oracle | Chunk upkeep adds code the plain array did not need | rearchitect |
| Level restart rule source | The closing item's `listLevels` | The counted item's `listLevels`, chained along its lane | `listNumbering.internal.ts` | One rule source makes lanes simple; for Word files the two never differ, since Word ignores `w:lvlRestart` inside an override | Lists whose items carry different `listLevels` may number differently; export takes the first item's rules and reports `list-structure` | A spec with differing copies, and a mutant that reads the closer's rules | Inconsistent copies are rare | rearchitect |
| Markdown list identity | Every parsed list in the root's default list, with a forced start | Unchanged | `BaseListPlugin` Markdown decode | Chunked lanes stop the bullet walk and keep each insert's copy flat, and a forced start keeps parsed lists apart; ids added AI, paste and parse-equality costs for no cost benefit | None | The Markdown work lines with `moved` asserted flat | Deleting a parsed list's first item merges it into the list before, the restart question of the next iteration | keep |
| Writer payload | Writes skipped when `start` already matches; no count of writes or visits per insert | An insert writes and visits exactly the numbers it changed below 1,024; the fallback is measured | React `ListPlugin` | The review's payload gate lacked a check that could fail | None | `ListPlugin.slow.tsx` write and visit counts with mutants; a writer line with 10 and 1,000 other mounted lists | The fallback's walk grows with mounted lists | keep |

## Steps

Every step names its proof. The build runs in three phases, each ending with a keep or revert decision.

### Phase 1: count Word files the way Word does

- [x] 1.1 Add failing tests in `importDocxNumbering.slow.ts`, numbered by an independent oracle written in the spec from MS-DOC 2.4.6.4, which never calls the importer's counter. Cases: two restarted instances that alternate number 1, 1, 2, 3 and keep counting after an insert into either; three instances with two restarts number 1, 1, 1, 2, 3; an override `w:lvl` with `w:start` 5 numbers from the definition's start; an override `w:lvl` with `w:lvlRestart` 0 still restarts after a parent item, while its level text stays; a restarted deeper level reopens at the definition's start after a parent item; a list whose first paragraph is at the third level; and the structure of pandoc's `lists_restart_8367.docx` rebuilt in the spec, a style-based list whose second section restarts on its first item through a new instance, numbering 1, 2, 3 then 1, 2, 3, 4, with an insert into each section. Two more cases pin Plate's chosen reading where Microsoft's text is unsettled, and their titles say so. In the first, an instance that overrides a numbered level to bullets keeps those paragraphs as uncounted bullets. In the second, a `w:lvlRestart` naming its own or a deeper level acts as the default. Change the four existing cases that assert SuperDoc's numbers to the oracle's. Proof: `proof-worktree.mjs --expect-fail` at the build base fails each case by its title, or names the case that the base already passes.
  Done: 7 cases fail at the build base by title, and the third-level start, the pandoc 8367 structure and the own-level `w:lvlRestart` case already pass there (`artifacts/2026-10-10-list-import-identity/build/base-11-a1.log`).
- [x] 1.2 In `readDocxNumbering.ts`, map each numbered paragraph without counting: one list per definition, and each instance's start override as `listRestart` on its first paragraph at that level. Read an override's `w:lvl` for format, level text and paragraph style only. Delete `createWordCounter`, `createPlateCounter` and the pin. The pre-plan probe found this mapping equal to the MS-DOC oracle on 1,000 seeded documents whose formats belong to definitions, with `w:lvlRestart` at and beyond the level and interleaved instances, while dropping the restarts mismatched 507 and dropping the limits 32 (`artifacts/2026-10-10-list-import-identity/prototype/word-count-noformats-a5.json`, `word-count-noRestart-a4.json`, `word-count-noRestartAfter-a4.json`). Proof: the 1.1 cases pass, the other import cases and the 27 www DOCX paste fixtures still pass, and a mutant that drops the restart mapping fails a 1.1 case.
  Done: the 1.1 cases, the DOCX import and paste specs and the 27 www fixtures pass, and dropping the restart mapping fails the interleaved start-override case (`artifacts/2026-10-10-list-import-identity/build/import-specs-12-a2.log`, rerun on the final tree, `artifacts/2026-10-10-list-import-identity/build/docx-slow-12-a1.log`, `artifacts/2026-10-10-list-import-identity/build/mutate-p1/mutate/import-drops-restarts-a1.log`). Found on the way: the HTML list parser reversed an item's nested lists, fixed in `BaseListPlugin.ts` with its own case (`artifacts/2026-10-10-list-import-identity/build/mutate-p1/mutate/nested-lists-reverse-a1.log`); and iteration one had left five www slow specs and the HTML conformance set red, now fixed (`artifacts/2026-10-10-list-import-identity/build/www-slow-13-a2.log`).
- [x] 1.3 Add a seeded test to `importDocxNumbering.slow.ts` that writes 200 generated Word documents (definitions, instances with start overrides, levels with `w:lvlRestart` below the level, level jumps and lists that start deeper, interleaved paragraphs and plain paragraphs between them), imports each through `importDocx`, and compares every shown number with the MS-DOC oracle, before and after an insert of a numbered item at a seeded position. Proof: it passes, and it fails with the restart mapping dropped.
  Done: 200 documents match before and after an insert, and the test fails alone with the restart mapping dropped (`artifacts/2026-10-10-list-import-identity/build/seeded-13-a1.log`, `artifacts/2026-10-10-list-import-identity/build/mutate-p1/mutate/import-drops-restarts-seeded-a1.log`).
- [x] 1.4 In `list.ts`, map `decimal-leading-zero` to Word's `decimalZero` with `%N.` level text. In `docx-document.ts`, write a restart, or any number Word would not reach, as a new instance on that item only, and return the items after it to the list's own instance; give every item with `listRestart` that instance even when its number already matches; delete the reapplied override. Add round trips in `list-roundtrip.spec.tsx` for a restarted deeper level followed by a parent item and the same level, and for a restart whose number matches, each followed by an insert just before the restarted item, comparing `listRestart` as well as numbers, and a round trip of a `decimal-leading-zero` list. Proof: the cases fail at the build base and pass after; the other round trips pass.
  Done: at the build base the matching-restart and leading-zero cases fail and the deeper-level case passes, because the old importer pinned numbers; after 1.2 all three fail; after 1.4 all 9 round trips pass, and four mutants fail their cases (`artifacts/2026-10-10-list-import-identity/build/base-14-a1.log`, `artifacts/2026-10-10-list-import-identity/build/after12-14-a1.log`, `artifacts/2026-10-10-list-import-identity/build/after14-a1.log`, `artifacts/2026-10-10-list-import-identity/build/mutate-p1/mutate-a1.out`). `list-numbering.spec.tsx`'s Word reader moved to MS-DOC's count too.
- [x] 1.5 Through `plate-docs`, rewrite the DOCX import and export list paragraphs in `docx.mdx` and `docx.cn.mdx` to state Word's count and the restart limit, remove the interleaved-instances limit, and close the subject's two open items this answers. Proof: the docs checks `plate-docs` names pass.
  Done: both pages state Word's count and the restart limit, and the registry builds fresh (`artifacts/2026-10-10-list-import-identity/build/build-registry-15-a1.log`, `artifacts/2026-10-10-list-import-identity/build/build-registry-check-15-a1.log`).
- [x] 1.6 Phase exit: keep when 1.1 to 1.5 pass; otherwise revert the phase. Proof: decision row.
  Done: keep (decision row `1.6 phase exit`).

### Phase 2: recount only what changes

The design comes from the arena in `artifacts/2026-10-10-list-import-identity/design/` (`synthesis.md`), revised by plan panel rounds 1 and 2. The pre-acceptance prototype is `artifacts/2026-10-10-list-import-identity/prototype/lanes2.probe.spec.ts`. It failed its frozen L1 line on attempts a1 to a3 and its L3 line on a2 and a3; a1 and a2 had probe bugs (a falsy first index, a single-seed batch, work counted after the removal), and the lines were amended once before a4, as its header says. It passes on a4 (`lanes2-a4.json`), and plan panel round 3 found its batch arm seeds only the earliest item, so the build tests the multi-seed batch itself.

- [x] 2.1 Add tests. These fail at the build base: `getListIndexMetrics` reports `visited`, `compares` and `moved`; Enter at the end and in the middle of one 10,000-item three-level list visits at most the numbers it changes plus one per seeded lane; an insert into a numbered list followed by N bullet lists, and into one of N numbered Markdown lists, in one list, visits the same count at N = 10, 100, 1,000 and 3,000 and moves at most 128 plus N/64 references; a renumber of 5,000 level-2 items under one level-1 item does a flat number of compares per visit; a batch with two far-apart inserts into one level renumbers both runs; a churn of inserts and removals that splits and empties chunks keeps the directory within N/16 entries; a list whose items carry different `listLevels` numbers each level by the counted item's rule. These must still pass: the iteration-one seeded property test, extended with `restartAfter` at and above an item's level and with differing `listLevels` copies, its oracle switched to the counted item's rule. Proof: `proof-worktree.mjs --expect-fail` at the build base fails each failing case by its title, and the must-still-pass cases pass there except the rule-source case the step names.
  Done: every failing case fails at the Phase 1 freeze `c759fa9` by title, and the lanes spec fails on the missing module (`artifacts/2026-10-10-list-import-identity/build/base-21-a1.log`). Added during 2.2 and the diff panel: a moved item that keeps its number, a half-list delete, a 5,000-item paste, the 6- and 60-block property runs with group and return moves, and the cases each panel round's fixes needed.
- [x] 2.2 Add `features/list/lib/listNumbering.internal.ts`, pure: the list facts, `closes` (an item at a shallower level closes level L within the counted item's restart limit), `ordinalOf`, `countAll`, a chunked lane (chunks of at most 128 entries, split at the limit, merged into a neighbor under 16, walked with a cursor), and per-list lanes with `createLanes`, `placeEntry`, `removeEntry` and `recountLanes` over per-level seeds, whose walk stops at the first unchanged number after the inserted item and keeps a forward cursor per shallower level for the closer check. Point `listIndex.internal.ts` at it: seeds replace the touched ranges and the quarter-of-a-list batch path, `countDetached` calls `countAll`, and `countList`'s window, `countRestartsAt`, `hasLevelThatNeverRestarts` and `BATCH_SHARE` are deleted. Proof: the 2.1 cases pass, the property test and the iteration-one list specs pass, and four mutants fail their cases: a whole-list stop at the first unchanged number fails `[1. A, • B, 2. C]` after an insert before A; dropping the jump to the next seed fails a batch that changes two far-apart items of one level; reading the closer's rules instead of the counted item's fails the differing-`listLevels` case; and storing a lane as one plain array fails the flat `moved` case.
  Done, with deviations. The quarter-of-a-list batch path is replaced, not deleted: a commit that changes more than an eighth of a list filters and gallop-merges its lanes in one pass and renumbers it, because a search per entry read a lazily frozen path per comparison and cost 37 ms for I7's delete. A placed entry seeds the entry after it instead of forcing the walk on. A changed entry keeps its lane place only when a check shows its order held. In a commit that changed structure, an entry at its old path must still sit between the untouched entries within four steps of it in every level lane. Any other entry must sit between anchored immediate neighbors, and each kept entry anchors the ones checked after it. Every other changed entry is placed again. The three diff panel rounds set that rule (decision rows after each `seats` row). On the final tree ten mutants fail their cases (`artifacts/2026-10-10-list-import-identity/panel-diff-3/final/mutate-final-a1.out`), and the full list suites pass (`artifacts/2026-10-10-list-import-identity/build/final-suites-a2.log`, `artifacts/2026-10-10-list-import-identity/build/final-www-a2.log`).
- [x] 2.3 Through `plate-docs`, say in `list.mdx` and `list.cn.mdx` that a level's restart rule comes from the counted item's level rules. Proof: the docs checks `plate-docs` names pass.
  Done: both list pages say each numbered item reads its level's rule from its own `listLevels` (decision row `2.3`).
- [x] 2.4 Phase exit: keep when 2.1 to 2.3 pass; otherwise revert the phase. Proof: decision row.
  Done: keep (decision row `2.4 phase exit`).

### Phase 3: check the writer and rerun the scale lines

- [x] 3.1 In `ListPlugin.slow.tsx`, assert that an insert among N lists of 10 writes exactly the starts whose numbers changed and visits only their hosts, at every N. Proof: a mutant that writes each changed start twice fails it, and one that walks every mounted list fails it.
  Done: 5 writes and 6 list lookups at 10, 100 and 1,000 lists; a doubled write and a walk of every mounted list fail it (`artifacts/2026-10-10-list-import-identity/build/writer-31-a1.log`, `artifacts/2026-10-10-list-import-identity/build/mutate-p3/mutate-a1.out`).
- 3.2 (moved to Open work by its deviation row; approved wording kept) Through `benchmark`, freeze a budget amendment before any run, then rerun I1, I2', I4, I6, I7, I8 and I9 on the final tree with these new lines, each with a known-bad arm: Enter at the end and middle of a 10,000-item list visits at most its changed numbers plus one per seeded lane (known-bad: the whole-list recount); a renumber of 5,000 level-2 items does a flat number of compares per visit (known-bad: a binary search per step); an insert into a numbered list followed by N bullet lists visits a flat count (known-bad: the same); N parsed Markdown lists insert within 128 plus N/64 moved references and flat time across N (known-bad: a plain-array lane); a 5,000-item paste into a 30,000-item list, a removal of 5,000 items and a kind toggle of a 10,000-item run each stay within the amendment's budget (known-bad: one splice per item into a plain array); and in Chromium, the writer's time for a top insert into a 10,000-item list with 10 and with 1,000 other mounted lists of 10, report-only for the fallback, which Open work tracks. Proof: every line passes for the shipped arm and every known-bad arm fails.
- [x] 3.3 Phase exit: keep when 3.1 and 3.2 pass. Proof: decision row.
  Done: keep, with 3.2's claim narrowed (decision rows `deviation: step 3.2` and `3.3 phase exit`).

### Close

- [x] Writing passes: `deslop`, then `no-comments` on product code; `unslop` on docs and this plan.
  Done: decision rows under `writing`, one per build stage and panel round.
- [x] Panel on the diff.
  Done: three rounds, which is the cap. Round 3's critical was applied, and its warnings were deferred or dismissed (`artifacts/2026-10-10-list-import-identity/panel-diff-3/seat-sol-a1.md`, decision rows after each `seats` row).
- [x] Changesets and docs through `changeset` and `plate-docs`.
  Done: decision rows `1.5`, `2.3` and the changeset rows; the panel rounds changed no documented behavior.
- [x] `pnpm lint:fix` on this task's files, and the `pnpm check` steps the edits reach.
  Done: `pnpm lint:task` passes on all 23 task files and changes nothing on a second run, and the type errors left in task files are on lines that predate this task (`artifacts/2026-10-10-list-import-identity/build/lint-task-a5.log`, `artifacts/2026-10-10-list-import-identity/build/tsc-platejs-final-a1.log`, `artifacts/2026-10-10-list-import-identity/build/tsc-www-integration-a3.log`).
- [x] Close, fold into `docs/plans/topics/list.md`, decision-trail review when a rule triggers it.
  Done: the Close and its trail review section are written, the review's rows are under `trail`, and the subject file holds this iteration's delta (`artifacts/2026-10-10-list-import-identity/trail/seat-sol-a1.md`).

## Close

Reversals and deviations come first. Step 3.2 did not pass. In both final runs every line passed except L4's time across N and I8's zero work, so the claim narrowed and the step moved to Open work. Step 2.2 kept the quarter-of-a-list batch path's job in a new form, a one-pass rebuild past an eighth of a list, because a search per entry cost 37 ms for I7's delete. Diff panel round 3 replaced round 2's clamp of an item's level. An item at indent 0 now counts as a level above level 1, as Markdown and the list commands read it, and a level whose rule is 0 never restarts.

What landed. DOCX import gives Word's numbers by mapping each instance's start override onto its first paragraph as a restart and counting with Plate's own rule, and export writes a restarted item as its own Word instance. The list index keeps each list as per-level lanes in chunks, so an edit visits the numbers it changes and copies at most a chunk plus, about once in 64 inserts, the chunk directory. Its compares grow with the log of the list's size, and a mark change across many items does more work than the numbers it changes. The HTML list parser keeps an item's nested lists in order and a wrapper's identity.

Proof and its limits. Every step's proof is in its decision row. The final tree passes 676 package tests, the 16 list slow tests, the 21 Word import tests with 200 seeded documents and 170 www tests, and ten mutants each fail their case (`artifacts/2026-10-10-list-import-identity/panel-diff-3/final/mutate-final-a1.out`). Word's own numbers rest on Microsoft's published algorithm, not on a Word run. The writer's catch rests on source review, because jsdom runs the plugin's handler first. Work counters cannot see a snapshot walk, so only the measured probe guards the before-snapshot lookup. The counted test for the descending-levels count catches a scan that counts its steps, not the uncounted loop round 2 shipped; the timed reproduction caught that one.

Counts: 18 items, 17 done, 0 partial, 0 skipped, 0 blocked, 1 open (step 3.2).

Decision-trail review, reviewed by gpt-6.1-sol @xhigh (`artifacts/2026-10-10-list-import-identity/trail/seat-sol-a1.md`). Its attention items, each with its outcome in the decision log's `trail` rows:

- Your example of N separate lists still fails for parsed Markdown lists. Open, with both known fixes in Open work.
- A mark change across many items still does whole-list work when no number changes. Open, owned by the next list iteration.
- "Word's exact numbers" overstated the DOCX support. Corrected in the Brief.
- "Flat work" dropped the compare growth and the directory copy. Corrected in the Close.
- The counted test for the descending-levels count cannot see the uncounted loop round 2 shipped. Stated as a limit.
- The new benchmark controls had not run on the final tree. They now fail their lines there (`artifacts/2026-10-10-list-import-identity/perf/knownbad-final/mutate-a1.out`).
- The www typecheck's six errors lacked a baseline control. The pre-task copy of the test gives the same six errors (`artifacts/2026-10-10-list-import-identity/build/tsc-www-pretask-spec-a1.log`).
- The indents 1, 0, 1 Markdown limit was missing. Now in Open work.
- No write touched the authored session's files.

Review inputs. This iteration continues `docs/plans/2026-10-10-list-review.md`. It changed `packages/platejs/src/features/list/lib/listIndex.internal.ts`, `packages/platejs/src/features/list/lib/BaseListPlugin.ts`, `packages/platejs/src/docx/import/lib/numbering/readDocxNumbering.ts`, `packages/platejs/src/docx/import/lib/numbering/importDocxNumbering.slow.ts`, `packages/platejs/src/docx/export/lib/internal/docx-document.ts`, `apps/www/src/__tests__/package-integration/docx/list-roundtrip.spec.tsx`, `packages/platejs/src/react/features/list/ListPlugin.tsx` and `content/docs/(plugins)/(serializing)/docx.mdx`, and read `docs/editor-behavior/markdown-editing-spec.md` for the Markdown list rule it keeps.

Open work lists each remaining limit with its owner and stop.

## Reflect

One reviewer applied the tooling, judgment and divergent lenses to the run from your steer on (`artifacts/2026-10-10-list-import-identity/reflect/reviewer-reply.md`). No lesson was of a kind the run applies on its own, so none was applied. Each backlog item below has owner: zbeyens and stop: you take or drop it.

Backlog:

- Specs that drive list or index code should fail when the editor reports any lifecycle error, through a default test sink that throws.
- A proof log can pass every test and still hold thrown errors; `proof.mjs` could flag error lines in a passing log.
- The verify commands should say the www package-integration specs run only through `test-suite.mjs`, which isolates files that mock modules.
- The lint fix can rewrite code past its own fixes and break types, so it should run before every freeze, and `lint-task.mjs` could typecheck the packages it touched.
- Work counters miss costs they do not count. Keep a timed line on every hot path, price a prototype with the comparator production uses, and cap a large baseline probe's time and memory.
- The benchmark notes should cover four traps. A hidden browser pane gets no animation frames. A Playwright config that serves its own bundle sets no web server. A dev route that reads search params renders twice. And arms run through `mutate.mjs` assert only the line they target.
- A timing run that overlaps review seats or another process's tests is inconclusive, whatever the load reads.
- Each panel round's fixes should rerun the frozen timing probe and the long fuzz before the next freeze, and the seats should get those numbers with the packet.
- A failed line that measures your own example should reopen the plan, not narrow the claim, and a cut that serves that example should be measured on your metric first.
- An iteration's close should run the full suites of every package and app it touched, slow suites included.
- When no reference app can run, the published format spec is the oracle, and other implementations are second opinions.
- `decisions-check.mjs` could print one valid row per result word, refuse a verified benchmark row that has no checklist row, and require a writing row to cite its skill's output.
- Prompt heredocs should quote their delimiter, a later round's delta should diff untracked files one by one, and debug probes should live in the run directory.
- Unquoted zsh globs failed about 17 times; a shell helper or hook should stop them, through `/pstack:correct`.
- `plate-plugins` should trigger when work adds or renames an element property a plugin owns.
- A finding meant for you should go on the page at once, before a compaction can drop it.

Rejected:

- Diffing per-file test counts with junit output. It changes no decision a future run makes.
- The before snapshot's slow lookup of an unknown key. Open work already holds it.

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Performance pack selected | yes | The index and the recount are runtime work per commit |
| User-facing operation and runtime owner identified | yes | DOCX import and export; insert, remove and kind or start changes in long lists and in Markdown documents; owner `listIndex.internal.ts` |
| Scale variables and cohorts fixed | yes | One 10,000-item three-level list edited at start, middle and end; one list with a restart near its start; N named lists of 10; N numbered Markdown lists; one numbered list then N bullet lists; N = 10, 100, 1,000 and 3,000 |
| Budget frozen before target measurement | yes | Step 3.2's amendment, frozen before its first run |
| Baseline and target probe selected | yes | The pre-acceptance prototype `artifacts/2026-10-10-list-import-identity/prototype/lanes2.probe.spec.ts`, and `artifacts/2026-10-10-list-review/perf/list-index-production.probe.spec.ts`, `list-index-markdown.probe.spec.ts` and `list-index-bullets.probe.spec.ts`, extended in step 3.2 |
| Correctness guard selected | yes | An oracle that never reads the index after every step, and the MS-DOC oracle for DOCX |
| Production detector decision recorded | N/A | No runtime detector owns editor numbering; work counters are the guard |

## Completion Gates

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Pre-acceptance scale proof | yes | Lanes against the incumbent on matched cohorts, with frozen lines and a failing control | `artifacts/2026-10-10-list-import-identity/prototype/lanes2-a4.json`: every line passes and the no-stop control fails. At N = 3,000, chunked lanes visit 1 item for an end insert where the incumbent visits 30,001 (3 µs against 212 µs), 5,005 for a middle insert that changes 5,001 numbers (45 µs against 210 µs), 6 after a numbered list with 3,000 bullet lists (1 µs against 90 µs), and copy 72 references among 3,000 Markdown lists where plain-array lanes copy 29,992; a 3,000-item paste takes 0.59 ms against 4.9 ms for the incumbent and 12.4 ms for plain arrays |
| Large/stress scaling | yes | Phase 2 work lines flat across N and position | `artifacts/2026-10-10-list-import-identity/perf/shipped-a5.json` and `shipped-a6.json`. Visits and copies stay flat for every cohort, and L4's time grows with N, which Open work owns |
| Correctness guard | yes | Oracle lines and the DOCX oracle specs | `artifacts/2026-10-10-list-import-identity/build/final-suites-a2.log`. The property runs on 6 and 60 blocks and the 200 seeded Word documents pass |
| Payload and fan-out | yes | Step 3.1 | `artifacts/2026-10-10-list-import-identity/build/writer-31-a1.log` |
| Performance regression check | yes | Step 3.2 | `artifacts/2026-10-10-list-import-identity/perf/shipped-a5.json` and `shipped-a6.json`. Every line but I8 and L4's time passes in both runs |

## Open work

- Step 3.2's proof failed two lines in both final runs. An insert among N Markdown lists of 10 in the root's default list takes 24 to 28 µs at N = 10 and 69 to 75 µs at N = 3,000, because finding its place compares paths in one list that holds them all; its visits and copies stay flat. So your example of N separate lists holds for lists with their own ids and not yet for parsed Markdown lists. Two fixes are known: give each parsed Markdown list its own id, which plan panel round 1 cut for its cost to AI rewrites, paste joins and parse equality, or start an insert's search at its neighbor's place. Typing after a mark toggle does 15 compares where the zero-work line allows none, for the reason the next item gives. Step 3.2 keeps its approved wording in Steps. owner: zbeyens. stop: the restart-runs iteration, which revisits Markdown list identity and can start an insert's search at its neighbors.
- Which changed list items keep their lane places. Plite marks a mark split as a structural change, so an item at its old path pays an order check per level lane in that commit. Typing after a mark toggle in a 10,000-item list does about 15 compares, bolding across 2,000 of its items places most of them again and rebuilds the list, and a list with 10,000 distinct levels pays 20,000 compares. An order-preserving move of a quote that holds a whole list also places all of it again, and the pass for shifted items saves only a constant factor over placing them. owner: zbeyens. stop: the next list iteration, with a move signal from Plite's commit or a check per run of unmoved items.
- An item shallower than its list's first item, such as indents 1, 0 and 1, has no faithful Markdown form. Markdown numbers the indent-0 item as the outer list's second item, while Plate counts it as a level of its own. owner: zbeyens. stop: the restart-runs iteration, or 2026-12-31.
- A failed index update rebuilds its own root and rethrows, so a later root in the same commit stays stale until its next structural commit, and a failed rebuild replaces the first error. No update fails by contract. owner: zbeyens. stop: the next list iteration.
- Each walk opens a closer cursor for every populated shallower level, and an `indent` of NaN, which only the transaction API can write, gives a level that no comparison orders. owner: zbeyens. stop: the next list iteration.
- Plite's snapshot `pathOf` walks the whole document for a key it has not cached, so the list index asks the before snapshot only about keys it indexed; the work counters cannot see such a walk, and only the measured probe caught the round 2 code that asked about inserted keys. owner: zbeyens. stop: a Plite snapshot index plan that makes such a lookup visible or cheap.
- Where a restart lives once items are added before it, or it is deleted or moved. Plate's Restart, a Markdown list's forced start and a Word instance's start override all sit on one item, so deleting or moving that item drops the restart and the rest continues the list before, and an item added before it does not take it over. Word applies an instance's override at whichever paragraph is first, and Google Docs keeps a restarted list restarted. Markdown's forced starts also store numbers through AI rewrites and paste joins. owner: zbeyens. stop: the next list iteration, which plans restarts that follow their run.
- The writer redraws every mounted list once a commit changes more than 1,024 numbers or a view falls 64 commits behind, so that walk grows with the other mounted lists; per-view mounted refs would write only the changed lists. owner: zbeyens. stop: step 3.2's writer line above the frame budget, or the word writer-refs.
- DOCX export takes each level's format, text and restart limit from a list's first item, so an instance that overrides the format, such as `%1)` against `%1.`, or items whose `listLevels` copies differ, export with the first item's and report `list-structure`. owner: zbeyens. stop: the restart iteration, which gives Plate instances.
- An AI rewrite that spans two lists keeps only the first in its list: the paste middleware joins only the first source list to the landing list. owner: zbeyens. stop: a list command plan, or 2026-12-31.
- A bullet-format paragraph inside a numbered Word level does not count in Plate, where MS-DOC's step list, read literally, counts it, so a number after such a paragraph can show one less than that reading. No Word run settles which Word does. owner: zbeyens. stop: a Word-written file with such an instance and its displayed numbers, or the word count-bullets.
- Word's "first paragraph of an instance" is read per instance and level, which pandoc's Word 16 file cannot tell from per instance, because its restart instance covers one level. owner: zbeyens. stop: a Word-written file with a multi-level restart instance and its displayed numbers, or 2026-12-31.
- A `numFmt` `none` level imports as a numbered list that shows its numbers, where Word shows none. owner: zbeyens. stop: a list marker plan, or 2026-12-31.
- DOCX import scans every paragraph of the document part in order, so text boxes, the fallback copies of alternate content and tracked deletions join the body's count, where Word counts each story apart. owner: zbeyens. stop: a DOCX import plan, or 2026-12-31.
- A whole insert among N lists still grows with N, because Plite's own commit does (0.31 ms at N = 10 to 2.62 ms at N = 1,000 for plain paragraphs); the list share outside the index, 0.10 to 0.24 ms, is too close to the run-to-run spread to call. The owner's flat-cost ask stays unmet for the whole insert until Plite's commit is flat. Plite's transactions also grow with the nodes they touch: removing every other item of a 20,000-item list in one transaction took 112.5 s, so step 3.2 restated its removal line to I7's and did not run the kind toggle of a 10,000-item run. owner: zbeyens. stop: a Plite commit performance plan, or 2026-12-31.

## Evidence

Model: Claude Opus 5.5 (`claude-opus-5-5`), xhigh effort.

This page reopens `2026-10-10-list-review` for three of its mechanisms and retains the rest of its Pursue. Its decision-trail review raised the DOCX and Markdown findings (`artifacts/2026-10-10-list-review/trail/seat-sol-a1.md`), and the panel rule sends a mechanism the owner's ask names back to planning.

### Requirements

- The owner's steer, verbatim: "switch to the most performant algorithm for 10000items. For example N separate lists of 10 items should not affect the perf of inserting in a list. Use the most performant listing counting, with full docx support (non contiguous list items). Redesign from first principles."
- Displayed and exported numbers equal the derived number of the current document after every commit, in every view and codec, and derived numbers are never stored (`docs/vision/plate.md` lines 690 to 698).
- `ListPlugin` owns list schema and numbering (`docs/vision/plate.md` lines 1327 to 1329).
- Separate Markdown lists never count as one (`docs/editor-behavior/markdown-editing-spec.md`, `EDIT-LIST-START-MD-401`).
- Plite core and the `authored` and `suggestions` files stay out of this work.

### Current source

- [`readDocxNumbering.ts`](../../packages/platejs/src/docx/import/lib/numbering/readDocxNumbering.ts) counts with `createWordCounter`, whose doc comment says it counts "as SuperDoc's numbering manager keeps it", and applies an override `w:lvl`'s `w:start` and `w:lvlRestart` through `readLevel`.
- Microsoft's sources, saved in `artifacts/2026-10-10-list-import-identity/word/`: MS-DOC 2.4.6.4 (`ms-doc-2.4.6.4.txt`), MS-OI29500 17.9.10 and 17.9.25. MS-DOC's step list double-counts a paragraph as written; the plan reads it as a sequence that starts at the level's start, which is how Word shows a first item, and reads "encountered before" per instance and level.
- `countList` scans back to the last forced level-1 restart and forward to the next one or the list's end ([`listIndex.internal.ts`](../../packages/platejs/src/features/list/lib/listIndex.internal.ts)).
- Bullets after a numbered Markdown list recount 100 to 30,000 items at N = 10 to 3,000 (`artifacts/2026-10-10-list-review/perf/list-index-bullets-a2.json`).
- The pre-plan probe (`artifacts/2026-10-10-list-import-identity/prototype/word-count-*-a3.json`) found Plate's count of the restart mapping equal to the MS-DOC oracle on 1,000 seeded documents whose formats belong to definitions; it encodes the plan's own reading, so it proves the mapping, not Word.

### Lanes

- **Keep iteration one and record the findings as limits.** This loses, because the import stores numbers Word's algorithm contradicts and the bullets recount grows with N.
- **Give each restarted Word instance a list of its own**, the trail review's patch. This loses, because Word shares one count across instances, so separate lists would number A2 and B2 differently from Word after any edit.
- **Word's algorithm in import and export, one list per definition, and per-level lanes.** The pick.
- **Keep the importer's counters and pin what Plate's count misses.** This loses, because a pin is a stored number that goes stale after an insert, and with formats on definitions the probe finds nothing left to pin.
- **Count bullet-format paragraphs as numbered items with a bullet marker.** Plan panel round 3 rejected it, because DOCX export has no level writer for that marker and throws, and Markdown, plain text and the Decimal toggle would read the item as numbered.
- **Give parsed Markdown lists their own ids.** This loses, because lanes already bound the Markdown cost, while ids changed AI rewrites, paste joins, nested sublists and parse equality.
- **Resume the incumbent recount from a stored per-item state vector.** It bounds end edits but still walks bullets after a numbered list, which lanes skip.
- **Per-level lanes in plain arrays.** This loses on copying, because an insert copies every later entry of the lane, 29,992 references among 3,000 Markdown lists, and a 3,000-item paste takes 12.4 ms against 0.59 ms in chunks.

### Proof limits

No Word install is available, so Word's behavior rests on Microsoft's published algorithm, pandoc's note and the rdocx report, not on a Word run here. MS-DOC describes the binary format; DOCX maps instances to its list format overrides and definitions to its lists. The lanes prototype models document order as numbers, so the build's work lines rerun it on the real index. Its L1 line was amended after attempt a3, from 3 extra visits to 2 per seeded lane, because three levels seed three lanes; its control moved to a cohort that has items after the insert. A `w:lvlRestart` at or beyond its own level is read as the default limit, as Plate's rule counts only shallower closers; MS-DOC's step list, taken literally, would reset the level at its own paragraphs, which no Word UI writes. The oracle and the mapping share that reading and the per-instance-and-level reading of a first paragraph, so the probe proves the mapping against those readings, not Word.
