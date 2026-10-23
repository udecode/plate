# Sweep

A sweep is a series of rounds over beta's pages. In each round agents test every page beside the page it should match, and a person confirms what they find. Each domain's finds are then grouped by cause, filed as one issue per cause and fixed in one run that also closes the gap that let them through. The next round starts once beta serves those fixes. This reference holds how a round runs, how a domain is triaged and fixed, how the next round is prepared and when the sweep is done. `docs/plans/2026-10-15-regression-sweep.md` set the sweep up, and `docs/plans/2026-10-23-sweep-loop.md` moved it to agents first and fixes by domain.

## Who does what

The sweep has two roles, and the proof subject, `docs/plans/topics/proof.md`, names who holds each.

- **The tester** runs the rounds: the page list, the sessions and retests, the rechecks, Triage a domain with its publishing, closing each issue once its recheck passes on a beta build that serves its fix, or its recheck left the hand list as Rechecks says, and `maintainer`'s proof gates hold, Preparing round N and the verification-skill pass After a round.
- **The fixer** runs Fix a domain and babysits each fix run until it lands. The fixer also keeps the formal checks, through `/pstack:create-formal-verification-skill` and `/pstack:maintain-formal-verification-skill`, and runs the `/pstack:correct` passes this reference calls for.

The roles meet at one handoff. Triage a domain ends by offering the domain's fix run as one suggested task. `setup.mjs` syncs the ledger between clones through `refs/pstack/ledger`, and the fixer's `/chips all` takes the task over and cards it, as chips.md's Owner says.

## Pages

`node tooling/scripts/page-health.mjs --list` prints the round's session pages by tier, each with its beta address and its reference page. `--base <url>` points the addresses at another build, such as a preview. A tier says which pages a session covers and what they are compared with, never how urgent a bug on them is. A bug's priority is the P0 to P3 of chips.md's Priority, whatever its page's tier.

- R1 is each visible upstream Slate example, beside its page on slatejs.org. The hidden Android page belongs to the Android device lane.
- R2 is each Plate docs page with a live demo, each example page no docs page shows and the playground, beside the same page on platejs.org.
- R3 is every other Plite example, hidden and experimental ones included. It has no reference page.
- R4 is a Plate page only beta has.
- R5 is the gaps against other editors, in the areas the round plan names. Its sessions produce proposals for `verdict`, not bugs.
- A page whose platejs.org twin the script cannot settle prints as unresolved and keeps the round open until the script's `STABLE_TWINS` names its twin or its `BETA_ONLY` lists it as a page only beta has.

Without `--list`, the script opens every docs and example route on beta in Chromium, Firefox and WebKit and prints each page error, rendered Not Found, failed status and missing editor. Run it at the start of every round.

## A session

A session is one visit to one page and scope in one browser. An agent runs it first, and a person retests what it finds.

- **The agent pass.** The agent drives the page beside its reference page the way the [playtest](./playtest.md)'s Run steps 2 to 4 drive a feature: every row of the page's scenario catalog in `docs/editor-behavior/scenarios/` when its feature has one, then improvisation with the six moves below, reproducing each find once in a fresh tab before it logs it. It drives the browser the session names. Codex computer use drives desktop Chrome, Safari and Firefox; Claude's built-in browser is Chromium only and suits comparing pixels and paint. It types key by key and checks frames as `.agents/pstack/rules/browser.md` says. The round plan sets each page's budget.
- **The retest.** A person reruns each find on live beta and marks it a bug, intended design or not reproduced, with the browser and the beta build. A find marked intended design that neither `docs/vision/` nor `docs/editor-behavior/markdown-editing-spec.md` decides goes to triage as a spec question.
- **The person's own sessions.** A person runs what no agent can drive: the iPhone page checks, OS input methods, paste from another app and native drag images. Such a session lasts 8 minutes for an R1 or R2 page and 6 for an R3 or R4 page.

In an R1 or R2 session, the reference page sits beside beta and the session covers the behavior both share. A paired page whose beta adds features gets a second session for those features, in R3 for a Plite page and R4 for a Plate page. A difference that is a beta-only feature is not a find.

Build state instead of resetting it. Follow anything odd at once. Never click to repair focus, because a lost caret is itself a find. During every move, watch the caret, the selection paint, focus, where menus land and the layout.

## The six moves

Apply them live to each control you find. Round 1 skipped the planted-bug trial that was to measure them against free clicking, so no trial backs them; they are the improvisation list for agents and people alike.

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

A find note is one line, `mm:ss browser: what differed`, written during the session at the recording's timestamp, in the record the round plan names, such as a shared sheet. Each note keeps its clip and, after the retest, its mark.

## Triage a domain

A domain is the review scope whose owners or members hold the page's demo, as the review ledger maps it, and the round plan names each page's domain. Triage a domain once every page of it has its session, or a session logged blocked with its reason, and every find of it its retest. A blocked session runs again in the next round. Nothing from a domain is filed before its triage, because two finds with one cause belong in one issue.

1. Save the round record's export for the domain in the round's run folder. Gather the domain's finds marked bug and its open issues labeled `target:beta`. A find the retest sent as a spec question goes to `verdict`, like an R5 gap.
2. Group them into failure kinds. A kind is one wrong result that one fix removes, as the Bug fix playbook's Redesign runs define it. Trace each kind to the code that owns it, with its `path:line`, and label the cause read or inferred. A kind whose owner sits outside the domain, such as Plite's input handling under a mark toggle, joins the owner's domain.
3. Give each kind every miss class from the next section that applies, and the cheapest test layer that would have failed on it.
4. Draft one issue per kind with `maintainer`'s issue-draft, each member find a numbered repro with its clip. When an open issue already covers the kind, the draft adds the new members to that issue instead. The tester publishes, and closes any other open issue of the kind as a duplicate of the kind's issue. An agent publishes or closes an issue only when the tester's request names that action, as `AGENTS.md`'s Messages rule says.
5. Write the triage in the round plan, one row per kind: its issue, members, owner, miss classes, what each class adds, and its priority by chips.md's Priority.
6. Once the tester has published the domain's issues, offer its fix run as one suggested task through the `chips` skill's Offer mode. The task's priority is its worst kind's, its `repro:` names the issues, whose numbered repros hold the exact steps, its `writes:` names the owner files from step 2, and its `session:` names the tester's session where the runtime's session tool gives one. When step 2 traced every kind to its owner, the task runs at `high`, and otherwise its title ends in `(xhigh)`, as chips.md's Title rule says. When an open task builds the check a kind needs, the domain task waits on it. A domain whose kinds are all P2 or P3 gets no task, and the round plan's Open work lists it with the fixer as its owner. The tester's session never cards the task, as `AGENTS.md`'s Sweep handoff says, and runs `node .agents/pstack/setup.mjs` from the main checkout after the offer, which pushes the ledger to `refs/pstack/ledger` at once. The fixer's `/chips all` takes the task over, because the tester's sessions never appear in the fixer's session list.

## Why tests missed it

The class decides what the domain's fix run adds besides the fix.

| Class | What happened | What closes it |
| --- | --- | --- |
| M1 no test | Nothing at any layer runs the behavior | The fix's test at the lowest layer that sees the bug, and a row in the feature's scenario catalog, so the next agent pass drives it |
| M2 wrong layer | A model or unit test passes, and the bug lives in DOM, event or browser handling | A Plite browser test, or a Plate browser test in `apps/www/tests/browser/regressions/` |
| M3 wrong assertion | A test runs the path but checks something else, or expects the bug | The test fixed to assert what users see, and `test-audit` on the area when it holds more tests like it |
| M4 engine gap | Only Firefox, Safari or iOS shows it, and no gated test runs there | A test gated in that engine; until a lane runs it, its recheck stays in that browser |
| M5 wiring gap | The tested setup differs from what the shipped kit or demo installs | A check over the shipped kits or demos, through `/pstack:correct` |
| M6 composition gap | Each feature is tested alone, and the bug needs two together | A generated check over the combinations. For a rule set or state machine whose bug shows without a browser, a formal check through `/pstack:create-formal-verification-skill`, as its own small skill |
| M7 spec gap | No law says what should happen | A row in `docs/editor-behavior/markdown-editing-spec.md` first, then the test |

When two kinds, in one round or across rounds, missed for the same reason, such as two tests marked expected to fail, the fixer runs `/pstack:correct` on that reason. It encodes the reason as architecture, a type, a lint or a test before any rule text.

## Fix a domain

A triaged domain gets one Bug fix run over all its kinds, never one issue at a time, so the run sees every kind its owner shares. Two or more kinds with one owner make it a redesign run, as that playbook's Redesign runs say, and the triage rows seed its expected-results table. Each test carries the `[plate#N]` tag of every issue it checks in full, or whose one numbered repro it checks in full, as the Bug fix playbook says. Before it closes, the run adds what each kind's miss classes call for. The exception is an M6 check the tree lacks, which the run builds before the fix, so it tests the fix against that check. When it changes code a formal check covers, it follows that check's own skill, such as `authored-decision-order`. The fixer takes domains by priority, P0 first, and between two domains of one priority, the one with a bug on the lower tier first. A domain's fix may start while other domains are still in sessions. R5 gaps go to `verdict` as proposals.

## Rechecks

A recheck exists only for a known bug: an open issue, a probe find, or a find whose test CI does not yet run. Each one names its issue, its minutes, its `covered-by` and the browsers it runs in, which are every browser and device unless the issue names the ones where the bug shows. The Bug fix playbook writes `covered-by` as the test's path, its title and the hash `pnpm kb plate#N` prints.

A recheck leaves the hand list when its test is present, not skipped, gated at the bug's layer or above, with the same hash, and, for a browser-layer recheck, gated in every engine it names. `pnpm kb plate#N` prints each tagged test with its gate and hash. A changed hash keeps the recheck due until `tooling/scripts/proof-worktree.mjs --expect-fail <the assertion's message>` shows the changed test failing at the fix's parent; then write the new hash. A deleted, skipped or ungated test puts its recheck back.

## Preparing round N

`verify` prepares each round as a plan, `docs/plans/<date>-sweep-round-<N>.md`, written under the Plan playbook.

1. List the pages with `page-health.mjs --list`, run against the build the round tests.
2. Give each page and scope its domain, its session, browser and agent budget, by the rotation above.
3. Carry every due recheck, with `pnpm kb`'s output for its issue tag.
4. Reserve person time, in this order, for setup and breaks, the retests, the rechecks, the R5 sessions against other editors and the iPhone page checks on R1 pages.
5. Name the round's record and state how many tester days the person's part takes.

## After a round

A round ends when every domain is triaged, and each domain is fixed as Fix a domain says. Before the next round, the tester runs `/pstack:maintain-verification-skill` on `verify`'s inventory for each feature an agent could not drive. The fixer runs `/pstack:maintain-formal-verification-skill` once over every formal check, to catch a change to covered code that skipped the check's own skill. The next round starts once beta serves every fix the round's domain runs landed. A kind a run leaves open, such as a P2 row of a redesign run, stays an open issue, so the next round rechecks it.

The sweep is done when a round gives every page and scope its session, finds no new bug on an R1 to R4 page, leaves no recheck blocked and no page unresolved, and every R5 gap has a verdict. At the 2026-12-15 handoff, every open find, blocked recheck and unvisited or unresolved page moves to the proof subject's Open work in `docs/plans/topics/proof.md`.
