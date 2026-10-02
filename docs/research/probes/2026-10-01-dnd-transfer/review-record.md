# DnD transfer design reviews

Plan: `docs/plans/2026-10-01-dnd-transfer-consolidation.md`. Every reviewer below was an Opus run, the same model family as the author. Their full returns live only in the session transcript. This file keeps each finding's identifier, a one-line summary and its disposition, so the decision log's references can be checked.

## Arena

| Candidate | Lead rubric total | Cross-judge total | Result |
| --- | --- | --- | --- |
| Native-first | 20 | 21 | Base |
| Command-first, pointer gestures | 22 | 20 | Grafted |
| React DnD gesture adapters | 19 | 17 | Rejected |

The lead's own rubric ranked command-first first. Its lead came from two criteria: job coverage, where it scored 5 for an Android touch drag that has no consumer or device proof, and adoption, whose phase 1 adapter was grafted into the base. The pick followed the cross-judge and the rule that an added concept needs a proven job. Command-first's pointer gesture is a second gesture system whose only extra job is unproven. Candidate 3 also read the rubric before writing, because the lead left it in the runners' directory.

## Interrogate pass 1

Reviewers A, B and C attacked design pass 1. "Applied" means design pass 2 or 3 changed the plan; "noted" means the plan records it as an open finding or limit.

| ID | Finding | Disposition |
| --- | --- | --- |
| A1, B1, C1 | Destination-undo session effect cannot share the landing entry; blocked entries wedge undo | Applied: effect deleted, then independent editors copy |
| B2 | Persisted history drops session effects | Applied: independent editors copy |
| A2, C2 | Remove and reinsert keeps keys but collapses anchors | Applied: same-root block moves use `tx.nodes.move` |
| A3, B5 | A card can move into its own body | Applied: law 7 covers reachable roots |
| A4, B3, C3 | Steps resolve intent after building the move | Applied: step order rewritten |
| A5, B6, C4 | `transfer` cannot express text | Applied: point target and range payload |
| A6 | Blocked entry wedges history; re-landing not idempotent | Applied: coupling deleted |
| A7, B7, C9 | Tests at a missing API cannot fail for their defect; browser specs and readers of the `dragging` class missing | Applied: tests at today's entry points; specs listed |
| A8, B9 | Removed-source terminal path, double dragstart on media, session guard | Applied: one claimant, revised terminal paths |
| A9, C16 | Gap fallback ejects drops from containers | Applied: in-container nearest host |
| A10 | Landing read lacks inputs, mixes axis and model | Applied: materialized payload, axis in the DOM layer |
| A11 | Ancestor plus descendant duplicates | Applied: descendant pruning |
| A12, B12, C12 | Lossless copies and collision-only remap change paste | Applied: copy follows paste; remap cut |
| A13, B13, C6 | Yjs has no move operation | Noted: open finding 2 |
| A14, B11, C10, C11 | Non-drag move lacks a pointer path; shortcut collision; list adoption | Applied: handle actions, List rule, shortcut decision |
| A15, B14 | Doctrine edits overreach | Applied: narrowed repairs |
| A16, B15, B16, C15, C17 | Scratch evidence gone; touch-backend claim overstated | Applied: repository probe; claim corrected |
| A17, B17, C18 | Missing replacements, stale docs, deletion list gaps | Applied |
| B4, C13 | "Same object" check and fallback mint keys | Applied: no fallback for same-root moves |
| B8 | Upload rule owner, orphan slots, drop claim | Applied: Upload rule with relation and intent; yields to sessions |
| B10 | Containers open up; List landing missing | Applied: default keeps today's depth |
| C5 | `deleteByDrag` removes sources unchecked | Applied: law 9 |
| C7 | Authoring intent missing from identity | Applied |
| C8 | Listener law misquoted | Applied |
| C14 | Refusal announcement publishes a commit | Applied |
| C19 | Column rule ambiguous; phase dependency | Applied |

## Interrogate replay

Fresh reviewers A2, B2 and C2 attacked design pass 2.

| ID | Finding | Disposition |
| --- | --- | --- |
| A2-1, B2-5, C2-6 | Cut-and-paste undo relabels an open data-loss defect | Applied: independent editors copy |
| B2-1, A2-6, C2-10 | `nodes.move` collapses anchors across parents (T13); text moves keep nothing | Applied: phase 1 anchor mapping; law 8 narrowed; open finding 1 |
| B2-2, C2-5, A2-4 | Corrections run after the fit; property and span loss | Applied: move postcondition after corrections, move lifecycle, TableRow span rule |
| B2-3, C2-1 | Text moves land the dragstart snapshot | Applied: re-extract from an `inward` anchor at drop |
| B2-4, A2-5 | `maxLength` counts a move twice (T12) | Applied: draft budget |
| B2-6, C2-2, A2-2 | List rule needs retargeting | Applied: landing may retarget |
| B2-7, A2-3 | Middleware composition; schema legality skipped | Applied: Plite checks after the chain |
| B2-8, C2-4, A2-7 | Removed-host terminal path breaks virtualized drags | Applied: keyed sessions, pointer sentinel |
| B2-9, C2-7 | `deleteByDrag` guard in the wrong branch | Applied |
| B2-10, C2-9 | Yjs premise partly false; wrong scenario | Applied: open finding 2 corrected |
| B2-11 | Doctrine citation clipped | Applied |
| B2-12, A2-11 | Phase 2 hover cost unmeasured | Applied: hover Benchmark lane |
| B2-13, A2-9, C2-8 | WCAG covers only the block handle | Applied: column and row actions, Cut |
| B2-14, C2-15 | Type gaps, drag-image offset, read-only reachability | Applied |
| B2-15, C2-13 | Copy intent stale and inconsistent across platforms | Applied: platform modifier, reset at drag start |
| B2-16 | Stale and contradictory text | Applied |
| B2-17, A2-12 | Deletion list and citation gaps | Applied |
| A2-8 | "Cross-document" ambiguous | Applied: DOM-document drops go to paste |
| A2-10 | New loss types duplicate the paste result API | Applied: `DataTransferDiagnostic` |
| C2-3 | Hover paints drops that will refuse | Applied: hover dry pass |
| C2-11 | Phases 1 and 2 integrate twice | Applied: one internal transfer in phase 1 |
| C2-12 | Multi-block order unspecified | Applied: chained moves |
| C2-14 | Phase 1 changes behavior without law | Applied: `EDIT-DRAG-*` in phase 1 |

## Cross-model review

Codex (gpt-6.1-sol) reviewed design pass 3 after the trail review, replayed T1-T13 identically and raised ten findings. It found no issue with copying between independent editors, document identity, the Plite repairs' independent value, the shortcut trade or `deleteByDrag`.

| ID | Finding | Disposition |
| --- | --- | --- |
| X1 | Whole-subtree equality rejects text moves into existing paragraphs and skips named-root contents | Applied: interval and root-closure check at `registerEditorTransactionGuard` (T14) |
| X2 | Admission can override refusals and skip later vetoes | Applied: `transferVetoes` run on the final edge; one revalidated retarget |
| X3 | Phase 1 lacks column and table policy | Applied: private policy port in phase 1 |
| X4 | The dry pass cannot predict `maxLength` or correction refusals; cache key too thin | Applied: narrowed guarantee; full memo key; still-pointer cases |
| X5 | A refused file drop falls through to `insertData` | Applied: refused drops are consumed |
| X6 | An `inward` anchor does not vanish when its text is deleted | Applied: `deletion: 'drop'`; delete-before-drop test |
| X7 | The read-only lock test stops discriminating once editors copy | Applied: replaced by a two-view case |
| X8 | Retirement never releases the anchor; window exit keeps autoscrolling | Applied |
| X9 | `plitejs/internal` is published, so the phase 1 bridge is not private | Applied: `editor.api.transfer` ships in phase 1 |
| X10 | "No consumer of supplied managers" is false | Applied: claim qualified; example migration named |

## Decision-trail review

A fresh Opus reviewer read the plan, log and probe. It reran the probe byte-identically and flagged twelve items, handled in the decision log's `trail` rows.
