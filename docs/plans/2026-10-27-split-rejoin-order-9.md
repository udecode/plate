# A rejected Enter rejoins the same way in every click order, ninth iteration

Status: partial: one card passed its stop rule, and building it waits for the word build one card
Topic: cut-join
Playbook: plan

Continues `docs/plans/2026-10-27-split-rejoin-order-8.md`. The owner picked "one card": prototype deciding an Enter and its link's other suggestions together, against the lift family, with a stop rule. A prototype request builds nothing, so this iteration lands only its plan and decision log, and the patch stays in the run directory.

## Brief

### What will change?

Nothing in the editor. The prototype makes a reviewer decide an Enter in a link with every other suggestion on its pieces at once. It passed every stop condition, and the 22 tests it breaks decide part of a card.

### What could go wrong?

The zeros overstate it. Where next went wrong, the card takes every suggestion, so three setups and the give-back check compare nothing. Six other setups compare 736 to 46,456 orders each and find no bug.

## Teach

A suggested Enter inside a link cuts the link into pieces. Rejecting the Enter joins the pieces back, and other suggestions can remove, unwrap or empty those pieces first. On next, which pieces rejoin depends on the order a reviewer decides those suggestions in.

One card removes the order. The Enter and every pending suggestion on a piece of its link, inside one or between its first and last piece, form one card. A reviewer gives each suggestion on the card its own accept or reject, but the editor applies the whole card at once and refuses a decision that takes only part of it. Cards that share a suggestion merge.

The decision-order check then treats a card as one step. It still compares every order of the cards and of the suggestions outside any card, so a card only proves something where some suggestions sit outside it.

## Stop rule

The prototype passes only when all of these hold, with the card reaching the pieces and what lies between them:

- The lift family fails nothing at its default bound and at its deeper starts: `--lift-pair=1`, `--lift-pair=3`, `--lift-quote=1`, `--lift-bridge=1`, `--lift-outside=1`, `--lift-enter=paragraph`, `--lift-inserts=1` and `--lift-place=1`.
- The gate adds no failure and no coupled set the baseline lacks, and the one-block generated-elements run fails nothing.
- Every authored test that fails decides part of a card and now gets `blocked`.
- The deeper lift starts still compare orders across cards, so the pass is not empty.

A failure caused by a suggestion outside the card widens the card's reach, at most twice: first to the lines and containers that hold the pieces, then to the neighboring marked blocks, as iteration 7's units read them. Any failure left after that stops the prototype.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| The editor fix | Ship nothing for now, because you asked only for a prototype (answer) | Build one card from the saved patch: show each card as one item in the review list, change the 22 tests to decide whole cards, time how long a decision takes, and give the give-back check something to compare | build one card | big |
| The card's reach | The pieces, what they hold and what lies between them, widened only when the check shows a suggestion outside the card changing the rejoin (look) | Start from iteration 7's units, which take every neighboring marked block | wide card | big |
| Where a partial decision stops | The editor refuses it as blocked and names the card's other suggestions (safe) | Decide the rest of the card as pending, which no reviewer asked for | none | small |
| The review list | Leave the card sequence as it is in the prototype, since only deciding is under test (safe) | Show each cut card as one card in the review list, which a build needs | none | detail |

## Close

There is no reversal or deviation. No start failed, so the card kept its first reach, and the patch stays in the run directory, as the decision log's last row says. The owner's one ask, a one-card prototype against the lift family with a stop rule, is done.

Each proof below comes from the decision log and ran on the prototype patch:

- The authored typecheck passes.
- The gate finds no failure and no coupled set the baseline lacks. Its baseline still lists 2 quote and 1,105 give-back coupled sets that a card now holds, which a build would drop with `--lower`.
- The one-block generated-elements run fails nothing.
- The lift family fails nothing at its default bound or at its eight deeper starts. On next the default bound fails 12 orders, and at commit `8733523c81` pair=1 failed 36, quote=1 148 and bridge=1 180.
- The authored tests fail 22 of 1,520. With the refusal turned into a throw, 63 tests in the two failing files reach it, all 22 among them, so every failure is a decision on part of a card.

The pass proves less than its zeros. On the default start, enter=paragraph and inserts=1, and in the gate's give-back family, every script with two changes is one card, so the check compares no orders there. The comparisons come from the starts where some suggestion sits outside the card: 46,456 at pair=3, 23,004 at bridge=1, 11,740 at pair=1, 7,804 at quote=1, 2,744 at outside=1 and 736 at place=1. Quote=1 still finds 20 coupled sets across cards, down from 602, and the lift family keeps no baseline for them. No order law checks what deciding a card produces, since a card has no orders left to compare it with. Only the tests that pin values check it, and the 22 a build rewrites are among them.

## Open work

- Build one card. Owner: zbeyens. Stop: the word "build one card". The build applies the saved patch, shows each cut card as one card in the review list, rewrites the 22 tests to decide whole cards, measures decide latency, since the refusal walks the whole document on every call, and gives the give-back family a check that still compares something.
- Quote=1 finds 20 coupled sets across cards. Owner: zbeyens. Stop: the build, which keeps or drops each one.
- Plan 8's other open items stand as written there.
