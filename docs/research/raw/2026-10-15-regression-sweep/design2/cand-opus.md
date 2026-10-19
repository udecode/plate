# Candidate: the move deck

My recommendation is to stop using cards to find unknown bugs. The tester's unit is a recorded, timed session on one page. In that session the tester applies a fixed set of six "moves" to every control on the page, with the reference page open beside beta as the oracle.

**One bias to flag first:** I wrote the move deck after reading both trial keys. So how well it fits those keys is not evidence. Q6 measures it without that bias. I did not read the other runners' `cand-*.md` files. `tooling/scripts/page-health.mjs` doesn't exist yet; I treated it as planned. The package is also saved at `/Users/zbeyens/.claude/plans/you-are-one-runner-misty-wall.md`.

## Problem

When agents wrote cards ahead of a round, the cards held a held-out bug's exact actions once in 60 chances. The two keys show why: every bug is one control on the page plus one variation of how it is used:
- **Then something else right after:** `/quote`, then type without clicking; replace a handle-selected block, undo, then type.
- **A second time somewhere else:** reopen the block context menu lower on the page.
- **Started at a boundary:** Shift+Right at a cell's end; click beside a table.
- **Done another way:** Undo from the browser's context menu, plain-text paste, the native color picker, the row handle.
- **Done inside another block:** Enter in a list item while suggesting.
- **Done after the layout moved:** a scrolled table; a paragraph taller than the viewport.

A page has about 10 to 15 controls, each with dozens of variations, so five cards cover a few percent of them. Cards also spend effort predicting the expected result, which a person with the reference page open doesn't need.

Fixed constraints:
- P1 to P5 by hand comes first.
- Finds go through issue-draft, P6 runs the Bug fix playbook, and fix tests carry `[plate#N]`.
- Round 1 is two tester days, on a Mac (Chrome, Safari, Firefox) and a real iPhone.
- No new skill unless a trial shows it is needed.

## Usage

**Round 1, P1 `hovering-toolbar`, Chrome, 8-minute box.**
- natamox starts a screen recording, with slatejs.org/examples/hovering-toolbar on the left and its beta twin on the right.
- The round plan's row lists the controls: select text, toolbar Bold/Italic/Underline, typing, Cmd+Z.
- natamox does each move on Slate first, then on beta:
  - **then-type:** Bold from the toolbar, type `x` without clicking, Cmd+Z, type again.
  - **again-elsewhere:** select a word in another paragraph and see where the toolbar opens.
  - **other-route:** Cmd+B, and Undo from the browser's Edit menu.
  - **edge-start:** select across a paragraph break; Bold a word that is already bold.
  - **moved-ground:** scroll so the selection sits at the top edge, then narrow the window.
- Throughout, natamox watches for paint flashes, the caret and where menus land.
- At 03:12, Cmd+Z after a word delete restores nothing on beta but works on Slate. natamox writes one line: `03:12 chrome: undo after word delete restores nothing; Slate restores`. That is all natamox writes.

**Round 1, P2 `table`, Safari, 14-minute box.**
- platejs.org/docs/table is on the left, beta on the right.
- Controls from the plan: cell typing, Shift+Arrow, cell drag-select, row handle, block handle, column resize, table toolbar, context menu, the scroll container.
- edge-start on Shift+Arrow means Shift+Right at a cell's end. On beta a blue range flashes before the cell highlight (`06:40`).
- moved-ground on the block handle means narrow the window, scroll the table right, then drag. The drag preview's offset is wrong (`11:05`).

**Round plan before** (`docs/plans/<date>-sweep-r1.md`, written by `verify`):
- **Pages table:**

  | page | tier | engine | box | controls |
  |---|---|---|---|---|
  | hovering-toolbar | P1 | chrome | 8 | select, toolbar B/I/U, type, undo |
  | table | P2 | safari | 14 | cell type, Shift+Arrow, cell drag, row handle, block handle, resize, toolbar, context menu, scroll |

- **Re-checks:** the probe's forced-layout Enter, the eight-page undo class, #5149 and the other open issues, and the iPhone Bold drift.
- **Sealed:** the hash of the seed file (see Q6).

**After the round**, each row gains:
- `used`: the minutes spent.
- `finds`: for example `rec-r1-07.mov@03:12 → #5201`.
- `move`: which move found it, for example `then-type`.

**Round 2:**
- `hovering-toolbar` had a find. It keeps 8 minutes and moves to Safari, and #5201 becomes a re-check row until its gated test lands.
- `table` keeps 14 minutes and moves to Firefox.
- A P2 page with no finds drops from 12 to 6 minutes.

## Shape

**Q1, the unit is the page session.** One recorded, timed visit to one page in one engine, with the reference side by side for P1 and P2. The tester applies the move deck to every control in the page's list:

1. **then-type:** after the action, without clicking, type a letter, then Backspace, Enter, Cmd+Z, and type again.
2. **again-elsewhere:** do it again at a second spot, after Escape, and after undo.
3. **other-route:** do it another way: keyboard, toolbar, slash, block menu, the browser's context and Edit menus, native pickers, plain-text paste, paste from another site or Notes, the iPhone keyboard's clipboard and dictation.
4. **edge-start:** start at a boundary: the start or end of a block or cell, an empty block showing its placeholder, beside a void, table or image, across a mark, or a command whose result already holds.
5. **inside-other:** do it in each other block on the page (list, cell, quote, code, heading), and in suggesting or read-only mode.
6. **moved-ground:** do it scrolled, with the container scrolled, with a narrow window, or with content taller than the viewport.

What to watch during every move: caret, selection paint, transitions, focus after a click, where a menu lands, layout jumps.

The oracle:
- In P1 and P2, any difference from the reference page is a find, so nobody writes expected results.
- P3 and P4 have no reference page, so the oracle is the behavior spec plus the tester's judgment.
- The last fifth of each box is free play.

**Why this should catch what cards missed:**
- A card picks a variation ahead of time, from source.
- The deck makes each variation something the tester applies live to every control, at roughly four attempts a minute.
- Watching both pages also catches failures no step aimed at.
- Both keys fit this pattern: each bug is one control on its page combined with one or two moves. The two Android-only bugs (Slate K5 and K8) are the exception. Per the bias note above, this fit is not evidence.

**Files:**
- **`.agents/rules/verify/references/hand-drive.md`** gets a new section, `## Tester pass`. It holds the deck, the watch list, the one-line find format, the engine rotation and the time rule. It is their only home: the round plan cites it rather than copying it, and the later agent-run plan can reuse the same deck.
- **The round plan** (`docs/plans/<date>-sweep-r<N>.md`) has four sections:
  - `Pages`: page, tier, engine, box, controls, used, finds, move.
  - `Re-checks`: find, issue, steps, engines, covering test and its hash.
  - `Sealed`: the seed file's hash.
  - `Sessions`: recording files and find lines.
- **`page-health.mjs --boxes <previous round plan>`** prints the next round's Pages rows, so the time rule runs as code rather than as a judgment call.
- **Re-check rows** follow the existing rule unchanged: a find stays until its test runs gated with an unchanged source hash.

**Q2, time.**

Round 1 sets each page's box from its control count `c`:
- P1 and P2: `clamp(c, 6, 20)` minutes.
- P3 and P4: `clamp(c/2, 4, 12)` minutes.
- All boxes scale down together to fit 600 minutes.

The rest of the two days:
- 60 minutes of re-checks.
- One 60-minute P5 session: the deck on the playground against Google Docs, with gaps going to `verdict`.
- iPhone setup.

Engines rotate Chrome → Safari → Firefox → iPhone by page, and each page moves to the next engine every round. Every page sees every engine within four rounds.

Between rounds:
- A page with any find keeps its box.
- A page with no find halves its box, down to a 3-minute floor.
- After two rounds at the floor with no find, the page leaves the hand pass, and only `page-health` opens it from then on.
- A page comes back at its round-1 box when an issue, a user report or a P6 fix names it.

Hand time falls geometrically wherever pages go quiet.

**Q3, prepared checks** are for known bugs only:
- Each find, until its test is gated.
- The probe findings and open issues.
- Device setups too costly to improvise: the Japanese input method in Firefox, the iPhone keyboard.

They never aim at unknown bugs.

**Q4, the census's kinds of miss** reach the tester as the deck itself, never as aiming per page:

| census kind | becomes |
|---|---|
| features used together | inside-other |
| focus and first click | then-type and again-elsewhere |
| caret and selection paint | the watch list |
| native keys, clipboard | other-route |
| layout that moves during a gesture | moved-ground |
| drag and drop | edge-start (drop on itself or a void) |
| input methods and mobile | the iPhone in the rotation |
| demo wiring | the side-by-side mirror plus `page-health` |
| tests that pinned the bug | not the tester's job |

The trials showed that choosing specific cases ahead of time fails. The deck moves that choice to the moment of testing.

**Q5, recording.**
- Every session is screen-recorded, with both pages in frame for P1 and P2.
- A find is one line: `mm:ss engine: what differed`.
- An agent runs issue-draft on the clip at that timestamp. issue-draft already handles video. Its baseline needs the fix the plan already lists: accept a Slate or stable recording instead of assuming `main`.
- The agent reproduces the find via Bug fix's reporter-surface step before natamox publishes it.
- A find the agent can't reproduce becomes a re-check row marked `steps?`, and natamox replays its clip's moves next round.
- The next round keeps the re-check row, the page's box under the time rule, and the move tag.

**Q6, measuring whether it works.** Both measures are frozen, and the deck and control lists are hashed before any seed exists.

- **Paper check, before round 1** (a cheap filter, not proof):
  - A separate agent writes a fresh key of 12 bugs that neither existing key holds, and replies with only the file path.
  - A blind `gpt-6-astra` grader counts a bug as caught only if its control is in that page's list and one move explicitly includes the triggering variation.
  - Keep the deck if it covers at least 6 of 12, against the cards' 1 in 60.
  - This only shows the bug was reachable, not that the tester would run it. It stops a bad deck before it costs tester days.
- **Seeded round 1, the real decision:**
  - A separate seeder agent works on its own branch. It randomly draws 8 behavioral fix commits from `next` before 2026-08-15, with a recorded random seed. That pool is outside the census and both keys.
  - It only draws fixes whose revert applies to the round's build and touches a page in the round.
  - It reverts them into a preview deployment and seals the list, replying with only its hash.
  - natamox tests that preview for the whole round.
  - Afterwards a blind grader matches finds to the planted bugs.
  - Keep the pass at 3 or more of 8. Redesign at 0 or 1. At 2, rerun with fresh seeds.
- **Why the lead can't bias it:** the deck freezes before the draw, the lead never sees the key or the seeds before grading, and the grader is blind. Real finds on the preview count too, since it is beta plus the reverts.

**Q7, the smallest version:**
- The `## Tester pass` section.
- One round plan.
- Screen recordings.
- issue-draft's fix to accept the reference page's recording as the comparison baseline.
- `page-health.mjs --boxes`.
- The seeded preview.

No discovery cards, no new skill or playbook, no new file kind.

## Tradeoffs accepted

- **No record of which combinations the tester actually ran:** in exchange, the minutes go to hands-on testing rather than paperwork. The recording is the audit trail.
- **Planted bugs were all found once before, so they are easier to catch than real escapes:** in exchange, the measure uses a key the lead can't shape.
- **Not every page gets every engine each round:** in exchange, about 114 pages fit into two days.
- **Android stays out:** until a real Android phone joins the rotation.

## Alternatives considered

- **Keep prepared cards as the main unit, expanded to about 40 per page by combining controls with moves.** This loses on the trial evidence:
  - The agent would write expected results for about 4,500 cards.
  - The tester would read instead of look.
  - The variation is still fixed ahead of time from source, which is exactly the step that went 1 in 60.
  - The deck generates the same combinations without the prose.
- **Free exploration with recording (today's flow).** It has no time rule, no deck, no move tags and no measure, and it's the flow that shipped the census bugs.
- **Boxes sized by the git diff since the last round.** v2 touches every package each round, so every page would look changed.

## Open questions and risks

- Do enough `next` fixes from before 2026-08-15 revert cleanly onto today's build to draw 8 across tiers? If not, can the seeder draw from Slate fixes ported into Plite?
- Is four combinations a minute realistic? Should round 1's actual minutes against each box refit the scale factor?
- Can the side-by-side comparison justify a floor below 6 minutes for small P1 pages?
- Recordings may capture private screen content. issue-draft's `--allow-public-video` gate already covers publishing them.

## Next implementation step

Write `## Tester pass` in `hand-drive.md`, freeze its hash, and brief a separate agent to write the fresh key for the paper check.
exit=0
