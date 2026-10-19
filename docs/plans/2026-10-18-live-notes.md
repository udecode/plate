# Show live stages from short notes, and other runs from their files

Status: superseded: by docs/plans/2026-10-18-page-parts.md, then docs/plans/2026-10-18-page-files.md, which keeps each run in its own page files in place of this plan's notes, deck and copies
Topic: plan-page
Playbook: plan

This plan continues `docs/plans/2026-10-17-stage-publish.md` and replaces how that plan stores notes and cards. Its task, t_fd284610, asks "whether an unattended run republishes at each stage change", because the owner had to ask "artifact?" after seven hours without a republish.

How the design got here:

- The stage-publish plan's diff panel round 2 found criticals in four mechanisms round 1 had already changed:
  - the deck's paging;
  - the beacon's 30-minute resend;
  - the records of other plans;
  - card lifetimes.
- It also found that the store grows without bound, against the page database's own contract. Only a new stored shape fixes that, so the run pivoted.
- Three architect runners answered that pivot, and a cross-judge picked the base. All three rejected overwriting one note per run in place, because the tool refuses any overwrite without the document's version.

## Brief

### What will change?

A long run still won't republish at every stage, as you asked about. Review found the saved notes piling up and losing questions, so each run's note now replaces its last, and other runs' cards come from their plan files.

### What could go wrong?

Nobody has seen the live line on a signed-in page yet, so look once after this ships. A run on another computer loses its card until its plan lands.

## Teach

Each topic has one web page, and several runs can publish to it. Each run works in its own copy of the repository. The page keeps a small database beside its HTML, for what changes between publishes.

Until now each stage saved a new note there, and each hand-back saved copies of plans. The database won't let a run overwrite a note it hasn't read first, so notes only piled up, and the page could lose a question while reading them.

Now a run saves a note at each step and deletes its previous one, so the database holds about one note per running plan. Cards move out of it. Each publish reads every copy of the repository on this computer, plus what has landed, and draws their questions and cards into the page itself.

## Main changes

These are the stage-publish plan's changes that stay, built in dotai's working tree:

- `flowOf` takes the rail's current stage from the newest work-stage row, as the stage-publish plan says. `mergedFlow` keeps the leading plan's current state.
- `plan-page.mjs` runs its CLI only as the main module. `page-live.mjs` and `page-stop.mjs` sit beside it under the `plans` gate, and `sync-pstack.mjs`'s `HELPER_FILES` lists both.
- `pageUrlOf` keeps the stage-publish plan's binding rule. A checkout uses its own `Page:` line when that line differs from the line at its fork point while `origin/<branch>` keeps the fork point's line. Otherwise it uses `origin/<branch>`'s line.
- A frame missing in this checkout resolves in the main checkout.

These replace the stage-publish plan's notes, records, deck and cards:

- **The database holds only live notes, kept in the `runs` collection.**
  - Each note is created once, with id `<plan slug>.<session8>.<ms>`, and is never rewritten. That keeps its version at 1, so its session can delete it without reading it first.
  - A note holds `v: 3`, the plan path, slug and title, the full session id, the stage, the state (`working`, `waiting` or `blocked`), `since` and `at`.
  - There are no hand-back records, records of other plans, blobs, history, `landed` flag, digests or data block. Each page still embeds the live mount and the deck script.
- **`page-live.mjs` holds `noteOf`, `linesOf` and the deck script.**
  - `linesOf` keeps each plan's newest `v: 3` note from the last seven days.
  - It replaces `handbackOf`, `asking`, `supersedes`, `deckModel` and the data block.
- **The deck reads `runs` with one subscription, `orderBy('at', 'desc').limit(1000)`, with no paging.**
  - It draws one live line per plan through `textContent`: the stage, the state, since when, and when its run last wrote.
  - A line whose plan has no `#run-<slug>` element on the page takes that id.
  - A subscription error shows in its own mount, so a redraw cannot erase it.
  - A null `claude.use('db')` handle shows a note, and with no `window.claude` the deck draws nothing.
  - It scrolls to the element `location.hash` names once, on the first draw that creates it.
- **`page-stop.mjs beacon <plan>` prints, at every trigger:**
  - an `ArtifactData set` of a new note;
  - once a note was printed before, also a separate `ArtifactData delete` of the previous note, pinned to version 1.

  Once the plan is done, it prints only the delete. A delete whose note never landed fails on its own and needs nothing. The beacon's marker in the main checkout's run directory holds the last printed note's id and page link. The marker never deletes across a page change. There is no 30-minute resend and no repeat suppression. `since` is the time of the first decision-log row in the current stage's trailing run of rows. It comes from the log, so neither a new `Page:` line nor the marker resets it. The session id and the `CLAUDECODE` gate stay as the stage-publish plan says.
- **`stagesOf` reads only the plan, its carried plans and the config.** When a carried plan is missing, it falls back to the plan alone, as `rail` does. A stop computes stages only for its own plan.
- **Waiting comes from explicit `Status:` words.** `review` and `reviewing` count as working.
- **`page-stop.mjs stop <plan> (--own <dir> | --no-db)` renders the page and prints, in one message:**
  1. one batch of deletes, each pinned to version 1, of every note of this session for this plan that the query in `<dir>` found, other than its current note, or with the current note once the plan is done;
  2. the publish;
  3. the reply, `<url>#run-<plan slug>`.

  Under `--no-db`, the publish declares `{db: {rules: [{path: "runs", read: "view", write: "admin"}]}}` together with any capability the read's header already names. `stop` writes no records and has no `.read` marker. A reused query directory only yields deletes that fail together and change nothing.
- **Other runs render as static HTML.**
  - `copiesOf` lists, once per process, every copy of the subject's plans and of its subject file:
    - Each worktree in `git worktree list` offers the files it changed since `git merge-base HEAD origin/<branch>`.
    - `origin/<branch>` offers its own copies.
  - A worktree copy unchanged since that worktree's last commit is dated by that commit's time for the path. A copy with uncommitted edits is dated by its mtime. Origin's copy is dated by its last commit to the path.
  - Per path, the newest copy wins, and a tie goes to origin.
  - The render runs its asserts on this checkout's copies and origin's. It skips a sibling worktree's copy that fails them, with a line on stderr.
  - `--pr` and `--comment` use only this checkout's files.
- **The page draws:**
  - one card per other plan that asks something, or whose winning copy changed in the last seven days (three once done). The card holds its title, `Status:`, brief, (look) and (answer) picks, and where the copy came from. Its questions show under Needs you;
  - the subject's frame from the subject file's winning copy;
  - exactly one `id="run-<plan slug>"` per plan it sees: on the header for the leading plan, on the card for a plan that has one, and on the History line for every other plan.

  Carried plans and the leading plan get no card. Needs you items lose `data-plan`, and nothing reads them.
- **`pageUrlOf` also returns `fallbacks`.** These are this checkout's own line when it differs from the bound one, then other worktrees' differing lines. When the bound link no longer opens, the lead publishes to the first fallback that opens before it makes a page.
- **The rules change to match.**
  - `rules/pages.md`:
    - A refused beacon runs nothing.
    - A publish refused because another run just published reads the page again, runs `stop` again and publishes once more.
    - Both of a beacon's calls go in the next working call's message, even when that call blocks.
  - The block's Calls bullet says "a beacon's calls".
  - The Plan pages bullet keeps the trigger.
  - The plan-page `SKILL.md`'s Render step 8 follows `fallbacks`.
  - `references/shape.md`'s Live line and Other runs section describes the notes and the static cards.
  - `rules/land.md` keeps its close stop.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How the page shows a run's stage | Each running plan gets one live line from its newest note. The page is republished only when a run hands work back or asks you something new (look) | Republish the whole page at every stage | republish stages | big |
| Where other runs' cards come from | Each publish reads every copy of the repository on this computer and what has landed, and draws their cards and questions into the page itself, so everyone sees them, signed in or not (look) | Keep each run's hand-back in the page's database | database cards | big |
| What a hand-back does to the plan that led before | The new plan goes first, and the old one shows as a card with its brief, status and picks. Its walkthrough, demo and design sections leave the page until it hands back again (look) | Merge both plans into one page at every hand-back | merge pages | big |
| A run on another computer | Its card shows once its plan lands. Until then a publish from here leaves it off (look) | Let those runs save their hand-back in the database | remote cards | small |
| Other runs' plans still being written | They show as cards with whatever they hold so far (look) | Show a card only once that run hands back | handed back only | small |
| A publish refused because another run just published | Read the page again and publish once more, which now includes that run's plan from its own copy (safe) | Send nothing more | send nothing | small |
| Whether the live line shows up for you | Ship once a test page in your Claude app reports that it drew the line. If it reports nothing, ship anyway and wait for your look (look) | Hold the build until someone has watched it work | hold for a look | small |
| Two copies of one plan | The copy changed last wins, by its last commit, or by its last save when nobody committed its edits (safe) | Always prefer the landed copy | landed first | detail |
| How fresh the live line is | Every log row and status change saves a fresh note, and each line says when its run last wrote (safe) | Save a note only when the stage changes | stage changes only | detail |
| A run that stops without finishing | Its line hides after a week. Its note stays in the database, because a run deletes only its own notes (safe) | Let a later run delete other runs' notes older than a week | prune old notes | detail |
| Two runs on one plan at once | Only the newer run's line shows (safe) | One line per run | line per run | detail |
| Pages published before this change | The first hand-back after it shows what the copies on this computer and the landed plans hold. A question only the old page showed, from a plan no copy still holds, goes away (look) | Copy the old page's questions into the page first | keep old questions | detail |
| Codex runs | Save no notes, and render their page locally, as today (safe) | Codex keeps its notes in a file, and the next Claude Code hand-back sends them | codex notes | detail |
| Pictures on the page | Stay inside the page, as today. Sending each one as its own file waits in the backlog (safe) | Send each picture once as a file beside the page | picture files | detail |
| The plan-page topic's page | https://claude.ai/artifact/RZ1v4REj24wERFqMYoktqw, a new page on this account, because neither older link opens on it (safe) | Go back to an old link | old page link | detail |
| Who reviews the plan | Two Codex reviewers and one Opus reviewer, now that Codex logs in again (safe) | Opus reviewers only | opus only | detail |

## Outcome

During an unattended run in a Claude Code desktop session, the owner can open the subject page signed in at any time without asking. The page shows each running plan's stage, when that stage began and when its run last wrote.

- A run never republishes the page because a stage changed.
- Every hand-back publish that goes through leads the page with the plan it is for, and its reply links that plan's part of the page.
- That link keeps landing on the plan's part after another run publishes, for as long as a worktree of the clone or `origin/<branch>` holds a copy of the plan.
- No publish from this clone takes another worktree's hand-back or question off the page, or a landed plan's.
- The page's database holds only live notes. Each note is created once, and only its own session deletes it.
- When a publish is refused because another run published first, the lead reads the page again, renders again from every copy and publishes once more.
- No publish passes `force`.

## Scope

- In, in dotai:
  - `skills/sync-pstack/assets/pstack/page-live.mjs`, `page-stop.mjs` and `plan-page.mjs`;
  - the `HELPER_FILES` entries in `scripts/sync-pstack.mjs`;
  - `assets/block.md`'s Calls bullet, `rules/pages.md` and `rules/land.md`;
  - the plan-page skill's `SKILL.md` and `references/shape.md`;
  - their tests.

  Then the synced copies in plate-2 and Ellie. plate-2's `origin/next` already carries the stage-publish plan's helpers and its beacon trigger, from another session's sync at b8fb01f798. Its rules route no stop through them, so no real page has a database yet. The new notes take `v: 3`, and the deck ignores anything older.
- Out, each a named limit:
  - A run on another computer, or in a cloud session, loses its card when a run here publishes. The card comes back when its plan lands.
  - Once no worktree of the clone and no `origin/<branch>` holds a copy of a plan, its hand-back link lands on the top of the page.
  - Other runs' cards change only when some run publishes. The live line is the only part that moves between publishes.
  - The live line shows only in a signed-in claude.ai view. A local copy, a Codex copy and a signed-out view show the cards but no live line.
  - Codex runs write no notes, as today.
  - A subject's live line starts at its first hand-back after this change, because a page published before it has no database.
  - The header rail shows the stage at the last hand-back while the live line moves on.
  - A note goes out with the call after the one that triggers it. A run inside one long call shows its last stage and when it last wrote.
  - A session that ends without a stop on a done plan leaves its notes in the database. Its line hides after a week.
  - When two worktrees edit one plan, the copy changed last wins.
  - When the old lead hands off, its walkthrough, demo, design sections and pictures leave the page until that plan's next hand-back. They stay in its plan file.
  - Each stop scans every worktree of the clone, which took 2.6 s for 50 worktrees here.
  - Two worktrees that both rebind before `origin/<branch>` moves publish to two pages, as they did before this plan.
  - Pictures sent as separate files, `docs/plans/backlog.md`.
  - The plate checkout, which `sync` refuses while it sits off its branch.

## Decisions

| Lane | Hand-back leads its page | Another run's asks | Writes per stage | Stored per subject | Verdict |
| --- | --- | --- | --- | --- | --- |
| Shape A, narrowed, as built (incumbent) | Yes | Cards from the database | 1 create, and again after 30 minutes on one stage | Grows with every stage and stop | Rejected by the stage-publish plan's diff panel round 2 |
| One note per run, overwritten in place (the lead's hypothesis) | Yes | Cards from the database | 1 overwrite, which the tool refuses without the version | Grows with sessions | Rejected: no write path without a read |
| A fixed pool of slots with saved receipts, no cards (cand-1 and cand-3) | Yes | Dropped for other worktrees | 1 pinned write, plus a receipt the lead saves by hand | At most 128 or 256 | Rejected: receipts by hand, pools that fill with dead runs, other worktrees' questions dropped |
| Notes created and deleted, cards read from files (cand-2) | Yes | Static cards from every worktree and from origin | 1 create and 1 delete | About one per running plan | Picked |

- The cross-judge was an Opus seat that saw the candidates by label. It scored cand-2 12 of 18, and cand-1 and cand-3 8 each. It added the four repairs and the grafts that Main changes holds: dating copies by commit, skipping sibling copies that fail the asserts, deleting every leftover note, and publishing once more after a refusal (`docs/plans/artifacts/2026-10-17-stage-publish/architect-d2/judge/answer.md`).
- The arena's synthesis names each graft's source and what was rejected (`docs/plans/artifacts/2026-10-17-stage-publish/architect-d2/synthesis.md`).
- The plan panel attacks these premises, which are the lead's own conclusions:
  - Rendering again from every copy after a fresh read is the merge the Artifact tool's contract asks for.
  - The copy changed last, by its last commit or, for uncommitted edits, by its last save, is the copy the owner means.
  - A note created once and deleted at version 1 never needs a read, and a lost write heals at the next trigger.
  - A card for another run's unfinished plan helps the owner more than it misleads.
  - Only the Opus family reached this pick, since the Codex runners picked slots and receipts, so it needs the Codex seats' attack.

## Evidence

### Requirements

- [ask] "Decide ... whether an unattended run republishes at each stage change." The owner "had to ask 'artifact?' after seven hours without a republish."
- [ask] "Decide whether the renderer leads with the plan a hand-back is for, or the reply links that plan's anchor." The earlier iteration built the lead, and every reply links the anchor.
- [ask] "The renderer and rule change in the shared source through the sync-pstack skill."
- [law] Every subject has one page, and an agent reads a page from its rendered file or its plan and subject files, never from the published page (`.agents/pstack/rules/pages.md`).
- [law] The Artifact tool's contract. A publish needs a read first. After a conflict, the publish merges onto the newer content and publishes again. It never passes `force` without the owner's word about that exact version.
- [law] The ArtifactData tool's contract: "A write to a document that already exists is refused without it; omit it only when creating a document." Probe `docs/plans/artifacts/2026-10-17-stage-publish/probes/db-probe-a2.md` step 4 hit that refusal.
- [law] The Autopilot rule stops on deleting data the run did not create, so a run deletes only its own session's notes.
- [law] The Calls rule: a beacon's calls go out with the next working call.
- [law] The page database contract, `db.d.ts` at runtime 0.2.85:
  - Queried collections stay at hundreds to low thousands of documents.
  - There is never one document per item of an unbounded stream.
  - `limit` is at most 1,000.

### Earlier critical findings

The stage-publish plan's diff panel round 2 left these critical findings open. They are listed in `docs/plans/artifacts/2026-10-17-stage-publish/panel-d2/synthesis.md` and the decision log's rows of 2026-10-18T11:32:01Z. Each one, with what this plan expects to happen to it:

- **K1, paging stalls on ties, and K2, a new note pushes a question out of the window.** Met. There is no paging, and questions are static HTML.
- **K3, a lost note is suppressed for 30 minutes.** Met. Every trigger sends a fresh note.
- **K4, fifty asking plans make a stop throw, and W1, the store grows without bound.** Met. A stop writes no records, and the store holds about one note per running plan.
- **K5, a later stop publishes the same page again after a refusal.** Met by rendering again from every copy after a fresh read. The plan panel attacks that premise.
- **K6, an anchor dies after three days, and K10, a newer copy that shows only questions hides a finished hand-back.** Met. Anchors sit on the header, a card or a History line, and the newest copy wins.
- **K7, `stagesOf` throws on a missing carried plan.** Met by its fallback.
- **K8a, two rebinds make two pages.** Stays open. The base behaves the same, and it breaks no typed ask.
- **K8b, a dead origin link makes a page per stop.** Met by `fallbacks`.
- **K9, a refused beacon runs a stop.** Met. A refused beacon runs nothing.

### Measured

- Scanning plate-2's 50 worktrees for changed plan files took 2.63 s, and 26 worktrees offered 96 files (`docs/plans/artifacts/2026-10-17-stage-publish/copies-cost-a1-a1.log`). The cross-judge timed 6.4 s on 39 worktrees.
- plate-2's `pstack` subject logged 1,431 decision rows over about 18 days, each a beacon trigger.

## Steps

Phase 1 replaces the store and the beacon (steps 1 to 3). Keep rule: the suite passes on dotai `HEAD` plus this plan's change, and no test of the stage-publish plan's records, `supersedes`, paging or resend remains.

- [ ] 1. Replace `page-live.mjs`'s records, `supersedes`, `deckModel` and data block with `noteOf`, `linesOf` and the lines-only deck. Proof: new tests fail on dotai `HEAD` and pass on the change:
  - `linesOf` keeps each plan's newest `v: 3` note from the last seven days, and drops older versions, malformed notes and notes over a week old;
  - the deck script taken from a rendered page, run in a `vm` against a stubbed `claude.use`:
    - a null handle shows the note;
    - an `onSnapshot` error stays through a later redraw;
    - a snapshot draws each line through `textContent`, with when its run last wrote;
    - a line whose plan has no anchor takes it;
    - a matching hash scrolls once;
    - with no `window.claude` it draws nothing;
  - every page embeds the live mount and the script and no data block, and `--pr` and `--comment` output hold neither.
- [ ] 2. Replace `beacon` with a create and a delete pinned at version 1 at every trigger, with `since` from the log. Proof: new tests fail on `HEAD` and pass on the change:
  - the first trigger prints one set and no delete;
  - a later trigger prints a set and a separate delete of the previous id at version 1, even when nothing moved;
  - a done plan prints only the delete;
  - a changed page link deletes nothing on the old page;
  - `since` is the first row of the current stage's trailing run, and stays put when the first `Page:` line appears;
  - `stagesOf` with a missing carried plan falls back to the plan alone;
  - a `review` status counts as working;
  - the session and `CLAUDECODE` refusals stay.
- [ ] 3. Replace `stop` with deletes of this session's leftover notes, the publish and the reply. Proof: new tests fail on `HEAD` and pass on the change:
  - with a query directory holding this session's current note and two leftovers for the plan, plus another plan's note, `stop` prints one batch deleting the two leftovers at version 1, then the publish, then the reply;
  - a done plan's batch also deletes the current note;
  - `--no-db` prints the publish with the database rule and no batch;
  - no record of any plan is written.

Phase 2 draws other runs from their files (steps 4 and 5). Keep rule: a sandbox clone with two worktrees and an origin renders each worktree's question and card on the other's page.

- [ ] 4. Add `copiesOf`, its dating, the sibling skip, the cards, the subject file's copy and the anchors. Proof: new tests fail on `HEAD` and pass on the change, in a sandbox clone with an origin and two worktrees:
  - the second worktree's render shows the first one's question under Needs you and its card;
  - a worktree that has not pulled shows origin's landed copy and origin's subject file;
  - a detached worktree's copy, unchanged since its last commit, loses to origin's newer commit, even when its mtime is newer;
  - a copy with uncommitted edits is dated by its mtime and wins over an older commit;
  - a sibling copy that fails an assert is skipped with a stderr line, and the render still exits 0;
  - every plan the render sees carries exactly one `id="run-<slug>"`;
  - `--pr` reads no sibling copy;
  - a timing run over the real plate-2 clone is saved in the run directory.
- [ ] 5. Add `pageUrlOf`'s `fallbacks`. Proof: a new test fails on `HEAD` and passes on the change. With origin rebound to one link and this checkout's own line on another, `fallbacks` lists this checkout's line first, then another worktree's differing line.

Phase 3 lands it (steps 6 to 8).

- [ ] 6. Rewrite `rules/pages.md`, the block's Calls bullet, the plan-page `SKILL.md`'s Render step 8, `references/shape.md` and `rules/land.md`. Proof: a sentence diff of the rendered rule files and block, from dotai `HEAD`, lists only these changes: the beacon's two calls, the refused beacon, the stop path, the publish again after a refusal, `fallbacks`, the live line and the static Other runs. The push block stays within its 29,300-byte budget.
- [ ] 7. Render every plan in plate-2 and Ellie with the old and new renderer, and diff the refusals and bodies. Publish the old and new render of one real plan for the owner to compare. Then run the diff panel and apply its fixes. Smoke plate-2 with the intended behavior written first, push dotai, sync plate-2 and Ellie, and run `verify` on each. Run this together with steps 7 and 8 of `docs/plans/2026-10-17-subject-page-lead.md`. Proof:
  - the corpus logs show no plan newly refused;
  - the only body changes are the live mount, the anchors, the script, the static cards, the rail's current stage and newly resolved frames;
  - each round's findings and fixes, the smoke logs, the dotai commits, the Ellie commit and the plate-2 commit that `land.mjs` pushes are all in the run directory or the repositories.
- [ ] 8. Run this run's last stop through the new path on the plan-page page: the read, the query, `stop`, the deletes, the publish and the anchored reply. Then send one beacon. Proof:
  - the saved read;
  - the batch and publish results;
  - an `ArtifactData list runs` at the viewer level that returns exactly this session's current note.

## Proof

- **Tests in dotai** prove:
  - the notes, `linesOf` and the deck script as the page emits it;
  - `beacon` and `stop`;
  - `copiesOf`, with its dating and its sibling skip;
  - the cards and anchors, the fallbacks and the frame fallback.
- **The corpus renders** prove real plans read right and none is newly refused.
- **The probe page** proves a signed-in view draws a live line, if its probe document lands.
- **The real plan-page page** proves one stop and one beacon end to end.
- **The smoke** proves routing only.

## Open work

- Look once at the plan-page page while signed in, after step 8, unless the test page reports first that it drew. owner: the owner. stop: that look, the test page's report, or the first comment about the live line. Tracked on this plan's page.
