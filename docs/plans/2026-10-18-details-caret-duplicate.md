# Duplicate at a caret inside a Details child

Status: executed: landed on next, waits on your review
Topic: callout
Playbook: bug-fix

## Brief

### What will change?

The block menu's Duplicate no longer fails in an empty Details title or body line, or on a line you selected whole. It copies just that line. Tests and a playground check show it; Chrome itself wasn't tried.

### What could go wrong?

A selection from above a Details into it now copies the upper block into the body, where it used to fail; a suggested task decides that. Beyond the ask, a block change aimed at a deleted block does nothing.

## Teach

Duplicate copies blocks and puts the copies after the last one. The block menu first picks the block you right-click, unless your cursor or selection already covers that whole block, as a cursor on an empty line does.

With the cursor in a block, Duplicate asked for every block around it. Inside a Details that is the Details and your line, so the copy held that line twice, and the editor refused it as "cannot be repeated or cyclic".

Now Duplicate asks only for the innermost blocks, using the same lookup that changing a block's type uses. A cursor in the title copies it as a body paragraph, and one in the body copies that line. The lookup also skips a saved selection whose blocks were deleted, as the other lookups do.

## Main changes

- Plite's Duplicate reads the blocks of a caret or text range through the same blocks read that block set, reset and toggle use, so it takes the innermost blocks by default. It used to list every enclosing block as well, and a container with its own child in one copy made it throw.
- Plite's blocks read returns no blocks for a range or point whose path no longer exists, and skips each picked block that no longer exists, as the other node reads do. So Duplicate, block set, reset and toggle change nothing for a deleted block.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What a cursor Duplicate copies | The block the cursor is in | The whole Details or other container around it | copy the container | small |
| A selection across the edge of a Details | Copies go after the last innermost block, as they already do for picked blocks, until t_c032c798 decides | Copy the touched blocks at one level as one run in this fix | copy one level | small |
| A saved selection whose blocks were deleted | Setting, resetting or toggling a deleted block does nothing, as Duplicate and the other lookups do | Keep changing the surviving block or throwing | keep stale writes | detail |
| Release note | None, because this Duplicate never shipped | A patch note for the core editor package | add a release note | detail |
| Behavior spec | Add the cursor case to the Details title landing rule | Leave the rule naming only a picked title | leave the spec | detail |
| The callout page | A new page at https://claude.ai/artifact/Tyhb89oz7EQTvETPc7g74a, because the old one at https://claude.ai/artifact/BqosrKxyq52ofShbAKD48L no longer opens | Drop the new page and keep the old link | drop the new page | detail |

## Close

The block menu's Duplicate now copies an empty Details title or body line, or a line selected whole, instead of throwing "cannot be repeated or cyclic". A copied title becomes the first body paragraph, and a body line's copy lands below it. In Plite, Duplicate now finds blocks the way block set, reset and toggle do, which takes only the innermost blocks. That lookup now finds nothing when the selected block was deleted.

Reversals and deviations. The first review round found that the new lookup, given a saved selection whose end block was deleted, copied the remaining block or failed. Before, Duplicate did nothing there. I added the check to the lookup itself, so block set, reset and toggle also stopped hitting the remaining block. That goes past the ask, and the Defaults word "keep stale writes" reverses it. The second round found the same failure for a saved block pick, and no Details test behind the spec's Duplicate claim. Both now have tests that fail on the old code. It also asked to send the lookup through the general node lookup. I dismissed that, because each such lookup in the file does its own check. Two changes the panel raised wait as suggested tasks: where copies go for a selection across a Details edge, and where a closed title's copy lands. The work was rebased onto next at b7374a94c9 before the last runs.

Proof and its limits. The new Details spec case fails at 6515b98a62 with the reported throw and passes here. The lookup test and the two deleted-block Duplicate tests failed before their fixes. On the rebased tree, the Duplicate suites (121 tests), the Plite test and core typechecks and the whole Plite suite (4,181 tests) pass. The Plate suite fails 6 cases, and the same 6 fail the same way at b7374a94c9; suggested tasks already own them. Three slow cases timed out once under load and passed on another run. In the built-in browser on the playground, Duplicate copied an empty body line and a whole-line title with no error, on the final code and again after the rebase. The pane was hidden, so each screenshot came after a short wait for the page to paint. Chrome and a closed Details were not driven.

Counts: 1 ask, done. Round 1 of the diff panel had 1 critical finding, applied, and 7 warnings. Round 2 had 4 warnings, 3 applied and 1 dismissed. Nothing was skipped or blocked, and two follow-ups stay under Open work.

## Open work

- t_c032c798 Decide where Duplicate puts copies of blocks at different depths (xhigh). owner: zbeyens. stop: its suggested task runs or the owner drops it. The suggested-tasks ledger tracks it.
- t_90da8176 Land a Duplicate of a closed Details title after the Details. owner: zbeyens. stop: its suggested task runs or the owner drops it. The suggested-tasks ledger tracks it.
