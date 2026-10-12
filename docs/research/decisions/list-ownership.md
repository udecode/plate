---
title: Lists and indentation
type: decision
status: accepted
updated: 2026-10-11
source_refs:
  - ../../plans/2026-10-11-list-first-principles.md
  - ../../plans/2026-10-11-ai-list-landing.md
  - ../../plans/2026-10-10-list-import-identity.md
  - ../../plans/2026-10-10-list-review.md
  - ../../../packages/platejs/src/features/list/lib/BaseListPlugin.ts
  - ../../../packages/platejs/src/features/list/lib/listIndex.internal.ts
  - ../../../packages/platejs/src/features/list/lib/listIdentity.internal.ts
  - ../../../packages/platejs/src/ai/react/aiOutputLanding.internal.ts
  - ../../../packages/platejs/src/features/indent/lib/BaseIndentPlugin.ts
related:
  - ../review-scopes/list.json
  - ../../plans/topics/list.md
  - ../../plans/2026-09-30-content-root-locations.md
---

# Lists and indentation

**Review of 2026-10-11.** Pursue, narrowed: no full redesign. The [first-principles pass](../../plans/2026-10-11-list-first-principles.md) found the 2026-10-10 model's requirements unchanged and one premise false. HTML decode gave each list its own `listId`, while Markdown decode put every list in the root's default list behind a forced `listRestart`, so Backspace or a move at a Markdown list's first item, a paste or a raw insert made one list count on from another. That plan holds its proof, its accepted limits and the work it left open.

**A list is an identity, not a container.** List items stay flat properties on ordinary blocks: `listType`, one shared `indent` depth, `listStyle`, `listId`, Word's `listLevels`, a conditional `listStart`, a forced `listRestart` and a task's `checked`. Items that share a `listId` are one list whatever blocks sit between them; an item without one belongs to its root's default list. Numbers are derived, never stored. Each runtime keeps one index per root that counts each list in per-level lanes, and the React writer keeps each mounted list's `start` current after commits ([list review](../../plans/2026-10-10-list-review.md)). DOCX import and export count the way Word does: one sequence per definition and level, and a start override restarts it once ([import identity](../../plans/2026-10-10-list-import-identity.md)).

**One encoding for a separate list.** HTML decode, Markdown decode and Word HTML paste give each list they read a fresh `listId`. Markdown writes a start other than 1 as `listStart`, so `listRestart` only ever means a restart the author forced. Ids never repeat across parses, so two parses of one text are equal up to their list ids, and content moves between editors without lists merging. The Markdown serializer writes task and bullet items of one id as one list, keeps starts within the nine digits CommonMark reads, and reports a forced restart or list membership Markdown cannot carry.

**Commands assign identity; corrections do not.** The `children` correction that gave an id-less item a neighbor's list on every structural edit is gone, because a correction cannot tell creation from undo, and undo then changed numbers. The list's `insert` and `upsert` give the item they create the list the neighbor join rule resolves. A raw write keeps the identity it carries.

**Inserted content lands through one rule.** Paste and every AI write name where their content lands: below a block, over whole blocks, inside a block's text or on an empty line. One private landing function in `features/list` groups the content's list items by source id, tables included, and lets only the first top-level group join a compatible landing item, one with the same list kind, style and heading role. Every other group keeps a fresh id. AI output also takes the landing's depth and moves a replaced item's start to the joined item, while paste keeps its pasted depths and starts ([AI list landing](../../plans/2026-10-11-ai-list-landing.md)). A suggestion that keeps its source's Markdown shape edits those blocks' text in place and pairs them by index.

**Indent keeps one depth and two commands.** Indent's `update` is `increase` and `decrease`; Tab and Shift+Tab are its shortcut handlers, and the list's outdent clears its own list facts when an item leaves the top level.

**Kept on evidence.** The chunked per-level lanes stay, because one list still reaches 10,000 items and 5,000-item pastes. HTML decode still joins an `<ol start=N>` to the list before it whose next number is N, for Google Docs paste.

## Open questions

- Does a whole insert among N lists stay flat once Plite's commit is? The index's own work is flat, but the commit grows with the document, and a named root's index rebuilds on each commit. Owner: zbeyens. Closes with a Plite commit and named-root index plan and a rerun of the list scale lines.
- Where does a restart live once items are added before it, or it is deleted or moved? Word applies an instance's override at whichever paragraph comes first; Plate keeps it on one item. Owner: zbeyens. Closes with the restart iteration, which plans restarts that follow their run.
- Should an AI rewrite of a list a paragraph interrupts keep one list? Markdown writes the two parts as two lists and the landing joins only the first. Owner: zbeyens. Closes with an AI correspondence plan that maps output runs back to their source lists, which would also pair a suggestion's blocks by source instead of by index.
- Should a replace land on the first list item it covers instead of its first block? Landing on a plain first block splits the list after it, as before these plans. Owner: zbeyens. Closes with a landing that knows which blocks the slice fitter keeps, listed in the AI list landing plan's Open work.

Earlier verdicts: the [2026-09-24 audit](../review-records/2026-09-24-list-audit.json) kept the flat model, and the [2026-10-04 triage](../../plans/2026-10-04-ledger-triage-audit.md) found that live numbering had no per-view owner, which the 2026-10-10 review gave it. The [content-root design](../../plans/2026-09-30-content-root-locations.md) supplies the root reader that `ordinal(at)` uses for any existing node target.
