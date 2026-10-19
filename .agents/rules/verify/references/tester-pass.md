# Tester pass

A sweep is a series of hands-on rounds over beta's pages. In each round a person tests every page for a few recorded minutes beside the page it should match, each find becomes an issue and then a fix with a test, and the next round starts once beta serves those fixes. This reference holds how a round runs, how the next one is prepared and when the sweep is done. `docs/plans/2026-10-15-regression-sweep.md` is the plan that set it up.

## Pages

`node tooling/scripts/page-health.mjs --list` prints the round's session pages by priority, each with its beta address and its reference page. `--base <url>` points the addresses at another build, such as a preview.

- P1 is each visible upstream Slate example, beside its page on slatejs.org. The hidden Android page belongs to the Android device lane.
- P2 is each Plate docs page with a live demo, each example page no docs page shows and the playground, beside the same page on platejs.org.
- P3 is every other Plite example, hidden and experimental ones included. It has no reference page.
- P4 is a Plate page only beta has.
- P5 is the gaps against other editors. The round plan names its areas.
- A page whose platejs.org twin the script cannot settle prints as unresolved and keeps the round open until the script's `STABLE_TWINS` names its twin or its `BETA_ONLY` lists it as a page only beta has.

Without `--list`, the script opens every docs and example route on beta in Chromium, Firefox and WebKit and prints each page error, rendered Not Found, failed status and missing editor. Run it at the start of every round.

## A session

A session is one recorded, timed visit to one page and scope in one browser. It lasts 8 minutes for a P1 or P2 page and 6 for a P3 or P4 page.

- In a P1 or P2 session, the reference page sits beside beta and the session covers the behavior both share. A paired page whose beta adds features gets a second session for those features, in P3 for a Plite page and P4 for a Plate page. A difference that is a beta-only feature is not a find.
- Build state instead of resetting it. Follow anything odd at once. Never click to repair focus, because a lost caret is itself a find.
- During every move, watch the caret, the selection paint, focus, where menus land and the layout.

## The six moves

Apply them live to each control you find. They are a candidate until round 1's planted-bug trial decides. Until then, a page uses them only when the round plan's Arm column says so, and the other pages get free clicking.

- **then-type.** Act, then type without clicking: a letter, Backspace, Enter, undo, a letter again.
- **again-elsewhere.** Repeat the action at a second spot, after Escape and after undo.
- **other-route.** Reach the same result by the keyboard, the toolbar, the slash menu, the block menu, the browser's own menus, native pickers, plain-text paste and paste from another app.
- **edge-start.** Start at a block, cell or mark boundary, in an empty block, or beside a void, table or image.
- **inside-other.** Repeat inside each other block type on the page, and in suggesting or read-only mode.
- **moved-ground.** Repeat scrolled, inside a scrolled container, in a narrow window, or with content taller than the screen.

Each move covers a kind of bug that past fixes missed. Features used together go to inside-other, focus and first click to then-type and again-elsewhere, native keys and clipboard to other-route, layout during a gesture to moved-ground, drag and drop to edge-start, and caret and selection paint to the watch list above.

## Browsers

Browsers take turns along Chrome, Safari, Firefox, iPhone. In round 1, the first page in the list starts in Chrome, the second in Safari, the third in Firefox, the fourth on the iPhone, and so on. Each later round moves every page one step along, so each round covers all four browsers and each page sees all four in four rounds.

## Find notes

A find note is one line, `mm:ss browser: what differed`, written during the session at the recording's timestamp. After the round, the tester rechecks each find on live beta, and an agent drafts each one that reproduces with `maintainer`'s issue-draft mode from the clip, with the reference recording as its baseline when the page has one. The tester publishes each confirmed draft before its fix starts, so the fix's test can carry the issue number.

## Rechecks

A recheck exists only for a known bug: an open issue, a probe find, or a find whose test CI does not yet run. Each one names its issue, its minutes, its `covered-by` and the browsers it runs in, which are every browser and device unless the issue names the ones where the bug shows. The Bug fix playbook writes `covered-by` as the test's path, its title and the hash `pnpm kb plate#N` prints.

A recheck leaves the hand list when its test is present, not skipped, gated at the bug's layer or above, with the same hash, and, for a browser-layer recheck, gated in every engine it names. `pnpm kb plate#N` prints each tagged test with its gate and hash. A changed hash keeps the recheck due until `tooling/scripts/proof-worktree.mjs --expect-fail <the assertion's message>` shows the changed test failing at the fix's parent; then write the new hash. A deleted, skipped or ungated test puts its recheck back.

## Preparing round N

`verify` prepares each round as a plan, `docs/plans/<date>-sweep-r<N>.md`, written under the Plan playbook.

1. List the pages with `page-health.mjs --list`, run against the build the round tests.
2. Give each page and scope its session, browser and time box, by the rotation above.
3. Carry every due recheck, with `pnpm kb`'s output for its issue tag.
4. Reserve time, in this order, for setup and breaks, the rechecks, find notes, the P5 sessions against other editors and the iPhone page checks on P1 pages.
5. State how many tester days the round takes. Every page gets its session before any fix starts.

## After a round

The tester rechecks and publishes the finds, as Find notes says. The fixes then run one at a time, P1 first, through the Bug fix playbook, and P5 gaps go to `verdict` as proposals. The next round starts once beta serves every fix.

The sweep is done when a round gives every page and scope its session, finds no new P1 to P4 bug, leaves no recheck blocked and no page unresolved, and every P5 gap has a verdict. At the 2026-12-15 handoff, every open find, blocked recheck and unvisited or unresolved page moves to the proof subject's Open work in `docs/plans/topics/proof.md`.
