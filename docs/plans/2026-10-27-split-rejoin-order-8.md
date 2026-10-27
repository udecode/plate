# A rejected Enter rejoins the same way in every click order, eighth iteration

Status: partial: the editor fix waits for your pick between saved waits and deferring only the cut
Topic: cut-join
Playbook: plan

Pivot from iteration 7, `docs/plans/2026-10-27-split-rejoin-order-7.md`. Its stored-waits build failed the order check on two links, and the owner asked for harsh honest feedback after seven iterations. The run parked that build and prototyped one more design, the Enter deciding last, with a stop rule. If the prototype failed, the run would land only the order check's new family and a stated limit, and leave the fix to the owner. It failed, and this iteration is that landing.

## Brief

### What will change?

Nothing in the editor changes. Rejecting an Enter still rejoins differently by click order in some cases. Both fixes broke other orders, so this lands a check that shows the bug and a docs warning.

### What could go wrong?

Reviewers can still get different documents by click order when suggestions remove or unwrap pieces of a cut link. The check proves only small documents, and the parked fix gets harder to apply as next changes.

## Teach

A suggested Enter inside a link cuts the link into pieces. Rejecting the Enter should join the pieces back. Other suggestions can remove, unwrap or sit between those pieces, and the result should not depend on which suggestion a reviewer decides first.

On next it does. Take a link cut twice, with two other suggestions that each remove a different piece. Rejecting the Enter and then deciding one removal leaves a piece apart. Deciding both together joins every piece.

Two fixes failed. Saving which Enter each decision waits for fixed the small cases, but two links then waited on each other. Deciding the Enter last broke the cases where the Enter's suggestion also changes other text. So nothing ships in the editor, and the order check gains a family that shows the bug.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| The editor fix | Ship nothing in the editor for now, and warn in the docs (answer) | Build saved waits, which still fail on two links until one more change; defer only the cut part of the Enter's suggestion, never tried, which the words cut only start; or decide an Enter and its link's other suggestions as one card, never tried, which the words one card start | stored waits | big |
| The check that shows the bug | It runs only when asked, outside the merge gate, because next still fails it (look) | Put it in the gate with its 12 failures in a baseline that only shrinks, so a resolver change that fixes or adds one shows | lift gate | small |
| The subject's page | Keep the new page NHiZFfaVWxKpJN8s6awMWL, since the old pages Y77WFp5kARVDo1GrdNAxH5, 3QjHNd3Zgoh42nB8DCGYHt and FMQi4YLD6BWqunYB84k26w no longer open | Go back to an old page once it opens again | old page | detail |

## The rejoin answers

The task asked three questions. Iterations 4 to 7 settled the answers, and every fix tried builds them, but next does not give them yet.

- An element between the pieces keeps them apart while it stands after the decision. A pending unwrap of it waits with the Enter. Accepted in the same call, its text stays between the pieces, which stay two links, and an element the decision both unwraps and empties lets them rejoin.
- An accepted unwrap of one piece makes only that piece plain text. The other piece keeps the link and any value the rejected Enter gives back.
- Moved text and an unset property read their final place. An accepted unset of the ref on the right piece leaves the key empty, so the ref the rejected Enter gives back fills it, as next does at once.

## Close

The reversals come first. Iteration 7's stored-waits build does not land. At two changes and two operations, its two-link starts made 1,440 coupled sets each that next lacks, and the fix for that, amendment 32, was never built. The Enter-last prototype does not land either. It took the lift family's default bound from 12 failures to 0, but the gate's give-back family went from 0 failures to 1,272 with 6 new coupled sets, two links went from 36 failures to 432 with 7,780 new coupled sets, and 20 authored tests failed. Both patches stay in the run directory, as the decision log's rows name.

What landed is the order check's lift family and its continued-editor walk, ported onto next, merged with next's generated-id give-back and run only with `--family=lift`. The suggestion page and its Chinese twin warn that this case still depends on order. The `authored-decision-order` skill documents the family and its findings.

Each proof below comes from the decision log's own scope. The gate passes with the baseline unchanged, at 4,467 documents and 17,472 comparisons for quotes and 890 scripts and 9,741 comparisons for give-back. Next's own check makes the same 9,741 comparisons, so the port changes nothing there. The one-block generated-elements run passes, as do the laws spec, the authored typecheck and the lint. The lift family fails 12 orders with 96 coupled sets at its default bound, the open bug. The deeper lift numbers in the skill come from commit `8733523c81`, not this base.

## Open work

- Fix the click-order rejoin. Owner: zbeyens. Stop: the word "stored waits", which rebuilds iteration 7 from its saved patch plus amendment 32, or "cut only", which prototypes deferring only the cut part of an Enter's suggestion.
- Two reviewers who decide the same suggestions differently while offline, then each reject the Enter, both land, and the synced link drops accepted values that deciding everything at once keeps. Iteration 7 reproduced it on next. Owner: zbeyens. Stop: a two-peer test where the synced link equals the at-once result.
- When an edit moves one piece of a cut link into a card's own root, rejecting the Enter gives the dropped ref to both pieces, on next too. Owner: zbeyens. Stop: a test where only the left piece takes the ref.
- An Enter in the text of a block that owns an exclusive content root, such as a card, gives the root two owners, which the schema refuses, so the Enter throws. It refused 5 of 1,422 random steps at iteration 7's base. Owner: zbeyens. Stop: a report of a refused Enter in such a block.
- On next, an Editing join into a block that holds a cut link, or into a struck block before one, fails the recording law, because accepting what it recorded does not put the caret where its commands did. It failed 4 of 5 probe cases at iteration 7's base. Owner: zbeyens. Stop: a report of a caret that moves after such a join.
- The lift family's code reads only through its comments. Fifteen number flags carry hand-written rules on which ones combine, a bridge start depends on a later operation, `follow` packs three states into one value, and `descend` takes eight positional parameters. Start shapes as one union and a named walk state would let most of those comments go. Owner: zbeyens. Stop: the next change to the lift family.
- Workflow backlog from this run's reflect. Read "it's getting long" followed by a direction question as a request for a verdict that also prices stopping and landing the check. Once a check reproduces a bug, prototype each candidate design against it, with a stop rule and a fallback landing, before another plan round. When a design amendment dismisses a reviewer's finding by argument, add that case to the check. Give every comment-sicko brief CODING_STANDARDS.md's comment rule. Make `page-stop.mjs stage` render the run's page again when only its status changes. Print `decisions-check.mjs`'s append forms in its usage. Have `guard.mjs` refuse an unquoted word that starts with `=`, an inline `sed -i` and a `pkill -f` by script name. Have long sweep briefs append each result to the report file as it lands. Owner: zbeyens. Stop: the owner takes or drops each.
