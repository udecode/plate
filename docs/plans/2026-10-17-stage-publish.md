# Show a long run's stage live on its subject page

Status: superseded: by docs/plans/2026-10-18-live-notes.md, then docs/plans/2026-10-18-page-parts.md and docs/plans/2026-10-18-page-files.md, which keeps this plan's rail, binding, frame and helper changes and replaces its notes, records, deck and cards
Topic: plan-page
Playbook: plan

This plan continues `docs/plans/2026-10-17-subject-page-lead.md`. Its task, t_fd284610, asks "whether an unattended run republishes at each stage change", because the owner had to ask "artifact?" after seven hours without a republish.

How the design got here:
- Architect round 1 picked a republish at each stage start. Plan panel round 1 killed it.
- Architect round 2 replaced it with a note per stage plus a check at each stop. Plan panel round 2 killed the stop half: under trunk delivery, each session works in its own worktree, so nearly every stop's check would have held the page.
- Architect round 3 picked shape A: each run writes notes into the page's own database, and a stop leads the page with its own plan. Plan panel round 3, the last round before the build, cut what that shape carried from the live page, moved the stage trigger into the always-loaded block and made every hand-back link its own part of the page.

## Brief

### What will change?

You asked if a long run should republish its page at every stage. No. It saves a short note per stage, shown live at the top. A run handing work back puts its plan first, and its link jumps there.

### What could go wrong?

Nobody has yet seen the live notes and other runs' cards show up on a signed-in page, so look once after this ships. Codex runs still save no notes.

## Teach

Each topic has one web page, and several runs can publish to it. Each run works in its own copy of the repository, so a run that simply replaced the page would hide another run's questions.

So the page keeps a small database beside its HTML. Each run saves its own notes there and never touches another run's. Whenever a run's stage or state changes, it saves a short note, and the page shows one live line per run under its header.

When a run hands work back, it first saves a note with its summary, status and questions. Then it publishes the page with its own plan first. Other runs' newest notes show as cards further down. The link the run sends you jumps to its own part of the page, so it still lands there after another run publishes.

## Main changes

- `flowOf` takes the rail's current stage from the newest decision-log row whose stage is a work stage: Design, Plan review, Build, Writing, Code review, Verify or Ship. Audit and Reflect rows only mark their stage done, and rows with no stage are skipped, and so is a `writing` row before the first `build` row, which cleans the plan's prose. With no work row the current stage is Build once a step is checked, and Plan otherwise. `mergedFlow` keeps the leading plan's current state. A page published mid-run no longer shows its current stage as done.
- `plan-page.mjs` runs its CLI only as the main module, and exports what the new helpers need. Two helpers go beside it under the `plans` gate:
  - `page-live.mjs`, pure, holds:
    - the hand-back record: plan path, title, blob, the blobs of its last 20 committed versions, whether its blob is committed on `origin/<branch>`, `Status:`, brief, every open question as a parsed memo, and the (look) and (answer) Defaults rows;
    - `supersedes`;
    - `deckModel` and the deck script;
    - the data block, which names the leading plan, shown whole, and each other iteration, shown only by its questions, with each one's blob.
  - `page-stop.mjs` is the CLI for `beacon` and `stop`.
- `supersedes` says one copy replaces another when its history holds the other's blob, when both come from one session and it is later, or when its blob is committed on `origin/<branch>` and it is later. Ties fall to the later time.
- Every page embeds the data block, a live line mount after the header, an Other runs mount after Needs you, and the deck script. The leading plan's header carries `id="run-<plan slug>"`, and each Needs you item carries `data-plan`. Each other plan's first Needs you item also carries `id="run-<plan slug>"`. `--pr` and `--comment` output carry none of these.
- The deck draws, with `textContent` only:
  - one live line per plan and session, from its newest note;
  - one card per plan copy that no newer copy supersedes and that the body does not show whole, with its brief, `Status:`, questions unless the body shows that version's, and (look) and (answer) picks, and `id="run-<plan slug>"` when no other element has that id;
  - a "changed since" mark on a body item when a note holds a newer copy of its plan.

  It reads the newest 1,000 notes live and, when they fill that window, the older ones once, page by page. It scrolls to the element `location.hash` names once a snapshot draws it. A null `claude.use('db')` handle shows a note, and an `onSnapshot` error shows a reload note.
- `page-stop.mjs beacon <plan>` computes the rail's current stage and the plan's state. It compares them, and the page link, with this session's last note, saved in the main checkout's run directory. It prints one create-only `ArtifactData set`, to collection `runs` with id `<plan slug>.b.<session8>.<ms>`, when any of them moved. It prints one again after 30 minutes on one stage, because a printed set may never reach the page. Each note carries `since`, when its stage and state began, which a repeat keeps. The session comes from `--session` or `CLAUDE_CODE_SESSION_ID`, and the command refuses without one. Without `CLAUDECODE=1` it prints that Codex sends no notes.
- `page-stop.mjs stop <plan> --own <dir> [--no-db]` renders the page and reads this session's documents from `<dir>`, which an `ArtifactData query` of `runs` where `session` equals this session's id saved with `out_dir`. A query leaves the files an earlier query saved in its directory, so `stop` marks the directory read and refuses it a second time. It prints:
  - one batch, when it has writes, and one publish line, in the order to send them. The batch holds the stop record and one record for each other plan the page shows that this checkout changed since its fork point or that asks something, plus deletes of this session's older documents for those plans, each pinned to its listed version, within 50 writes. The stop record's id holds a digest of the record without its times, so a repeat saves nothing new and still publishes. A committed copy of another plan dates from its commit. On a page with a database the batch goes first, and the publish only once it commits. With `--no-db` the publish goes first with `{db: {rules: [{path: "runs", read: "view", write: "admin"}]}}` and any capability the read's header already names, then the batch.
  - the reply, `<url>#run-<plan slug>`.
- A plain render prints `Page: <url>` from `pageUrlOf`, and `--rail` returns that URL. A checkout uses its own `Page:` line when that line differs from the line at its fork point, `git merge-base HEAD origin/<branch>`, while `origin/<branch>` keeps the fork point's line, and otherwise `origin/<branch>`'s line. When the bound link no longer opens, the render's list of other worktrees' differing lines names where to publish instead of making another page.
- A frame whose path under the plans artifacts directory is missing in this checkout resolves in the main checkout, the first `git worktree list` entry, where plate-2's Plans and trails rule writes run directories.
- `sync-pstack.mjs`'s `HELPER_FILES` gains `'page-live.mjs': ['plans']` and `'page-stop.mjs': ['plans']`.
- Each decision-log append and each `Status:` change runs `page-stop.mjs beacon <plan>` in the same command, and the set it prints goes out with the next working call, before any long wait. Under trunk delivery the block's Plan pages bullet, which every session keeps through a compaction, says so. Elsewhere every append already goes through `decisions-check.mjs append`, so that helper runs the beacon and prints its `ArtifactData` call itself, and `rules/pages.md` names the `Status:` trigger. The push block had no room for the sentence, because it rendered 29,430 bytes against its 29,300-byte budget. `rules/pages.md` routes every stop through the read, the query, `stop`, the batch and the publish. A new Needs you item or (look) or (answer) row still runs a stop. A refused publish sends nothing more, except under `--no-db`, where nothing was saved yet. There the lead reads the page again, sends only the batch once the page has a database, and otherwise publishes nothing more and says so. An append or `Status:` change never shares a message with a call that blocks. Every hand-back reply is `<url>#run-<plan slug>`. "Never from the published page" stays, with the reason a stop still reads it. The plan-page `SKILL.md`'s Render step 8, `references/shape.md`'s page order and a new Live line and Other runs section, and `rules/land.md`'s close stop follow.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How the page shows a run's stage | Each run gets one live line from its notes. The page is republished only when a run hands work back or asks you something new (look) | Republish the whole page at every stage | republish stages | big |
| What a hand-back does to the plan that led before | The new plan goes first, and other runs' questions and picks show as cards from their own notes. The plan that led before loses its walkthrough, demo and design sections on the page until it hands back again (look) | Merge both runs' plan files into one page at every hand-back | merge pages | big |
| The link a hand-back sends you | Always the page link plus a jump to that plan's part, so it still lands there after another run publishes (safe) | Just the page link | bare link | small |
| A hand-back's publish refused because another run just published | Send nothing more. Its notes are already saved, so the newer page shows it as a card and the link jumps there. On a page with no database yet nothing was saved, so it reads the page again and saves its notes only if that page now has a database (safe) | Always read again and publish again | publish again | small |
| A finished plan's picks on another run's page | Its card shows for three days after its copy's time, like any finished card. Only a question or a waiting or blocked plan keeps a card past that (look) | Keep a finished plan's card until a newer copy shows | keep finished cards | detail |
| Whether the live notes show up for you | Ship once a test page opened in your Claude app reports that it drew them. If it reports nothing, ship anyway and wait for your look (look) | Hold the build until someone has watched it work | no cards | small |
| What a hand-back sends first | Save the notes first, and publish the page only once they're saved. A hand-back then takes four calls instead of two (safe) | Send both together and save a call | batch with publish | detail |
| Pages published before this change | The first hand-back after it shows only what that run's copy renders. A question only the old page showed, from a plan no copy still holds, goes away (look) | Copy the old page's questions into cards first | keep old questions | detail |
| Codex runs | Save no notes, and render their page locally, as today (safe) | Codex keeps its notes in a file, and the next Claude Code hand-back sends them | codex notes | detail |
| A run that goes quiet | After a day its line says when it last wrote, and after a week the line goes away. A card that asks you something stays until a newer pushed copy of its plan shows up or you drop it (safe) | Drop a quiet run's cards after a week too | drop quiet asks | detail |
| Pictures on the page | Stay inside the page, as today. Sending each one as its own file waits in the backlog (safe) | Send each picture once as a file beside the page | picture files | detail |
| The plan-page topic's page | https://claude.ai/artifact/RZ1v4REj24wERFqMYoktqw, a new page on this account, because neither https://claude.ai/artifact/QLPuWXTpAuCKDdhm6jX34Z nor https://claude.ai/artifact/KUhUAAaj8o4Ud8UeXjbh7w opens on it (safe) | Go back to an old link | old page link | detail |
| Who reviews the plan | Opus reviewers, because both Codex reviewers fail to log in. One of round 3's three reviewers timed out and returned nothing (safe) | Wait until the Codex login is fixed | wait for codex | detail |

## Outcome

During an unattended run in a Claude Code desktop session, the owner can open the subject page at any time and see each run's current stage and when it began, without asking. A run never republishes the page because a stage changed. Every hand-back publish that goes through leads the page with the plan it is for. Every hand-back link lands on that plan's part of the page, even after another run publishes. No publish takes another run's hand-back off the page. Its brief, `Status:`, questions and (look) and (answer) picks stay as a card until a newer copy of that plan shows, or for three days once the plan is done and asks nothing. No publish passes `force` or resends refused content.

## Scope

- In, in dotai:
  - `skills/sync-pstack/assets/pstack/page-live.mjs` and `page-stop.mjs`, new;
  - `plan-page.mjs`: the main-module guard and exports, `flowOf` and `mergedFlow`, the data block, the mounts and anchors, the frame fallback, the bound URL;
  - the `HELPER_FILES` entries in `scripts/sync-pstack.mjs`;
  - `assets/block.md`'s Plan pages bullet, `rules/pages.md` and `rules/land.md`;
  - the plan-page skill's `SKILL.md` and `references/shape.md`;
  - their tests.

  Then the synced copies in plate-2 and Ellie.
- Out, each a named limit:
  - When another plan leads, the old lead's walkthrough, demo, design sections and pictures leave the page until that plan's next hand-back, or for good once that plan is done. They stay in its plan file.
  - Another worktree's uncommitted edits to the subject file leave the page at the next hand-back from elsewhere, and come back at that worktree's own next hand-back.
  - The live line and the cards show only in a signed-in claude.ai view. A local copy, a Codex copy and a signed-out view show neither.
  - Codex runs write no notes, as today.
  - A subject's live line starts at its first hand-back after this change, because a page published before it has no database.
  - The header rail shows the stage at the last hand-back while the live line moves on.
  - A stage note goes out with the call after the one that triggers it, and a lost one goes out again with the first trigger 30 minutes later.
  - A question a page showed only before this change, from a plan whose run saved no notes, can leave the page when a checkout that lacks that plan publishes.
  - A dead session's card that asks something stays until a later landed copy of its plan shows or the owner drops it. A renamed plan's old cards stay until dropped.
  - Pictures sent as separate files, `docs/plans/backlog.md`.
  - The plate checkout, which `sync` refuses while it sits off its branch.

## Decisions

| Lane | Hand-back leads its page | Another run's asks | Messages per stop | New parts | Verdict |
| --- | --- | --- | --- | --- | --- |
| Stops only, as today (incumbent) | Yes | Dropped under trunk; a refused publish has no move | 2 | None | Rejected: the seven-hour gap, and trunk drops other runs' questions |
| Round 2's stop check (Seen, `--live`, Kept) | No: under trunk nearly every stop is held | Kept | 3 or 4 | Units, Seen, held copies, an overwrite word | Rejected by plan panel round 2 |
| Each page carries every copy's files and every stop merges them (round 3, shape B) | Yes | Merged into the body | 4, plus 3 per refusal | A carry format, a merge engine, priors, forks, recovery | Rejected: cost and size |
| One writer publishes the body; every other stop sends a card (round 3, shape C) | No for a worktree stop under trunk | Kept | 2 for a card | A provenance manifest, coverage verdicts, writer roles | Rejected: misses the task's own case |
| The database holds every hand-back, carried from the live page at each stop (round 3, shape A as picked) | Yes | Cards under Other runs | 3, plus 1 once per old page | `page-live.mjs`, a data block, a carry, an outbox, a legacy scrape | Narrowed by plan panel round 3 |
| Each run's own notes hold its hand-backs (shape A, narrowed) | Yes, and every link lands on its plan | Cards under Other runs | 4 | `page-live.mjs`, `page-stop.mjs`, a small data block | Picked |

- Challenge delta: `improved`. Plan panel round 3 deleted the carry from the live page, the Codex outbox, the legacy scrape and the data block's records. The stage trigger moved into the block, and the binding became one rule for every delivery mode. `docs/plans/artifacts/2026-10-17-stage-publish/panel-p3/synthesis.md` holds each change and the finding behind it.
- The cross-judge, an Opus seat that saw the candidates by label, scored shape A 18, shape C 17 and shape B 15. Shape A is the only one where every stop that publishes leads with its own plan in every delivery mode, plate-2's trunk with push included (`docs/plans/artifacts/2026-10-17-stage-publish/architect-r3/judge.md`).
- The diff panel attacks these premises, which are the lead's own conclusions:
  - Replacing the old lead's walkthrough, demo and design sections counts as building on the live version, because every run's hand-back reaches the database at its own stop, before its publish.
  - Cards drawn from the database reach the owner.
  - Under trunk, every plan a page shows that no live run's notes hold is committed, so every later render shows it.
  - A stop keyed by its render's digest never publishes the same hand-back twice.
  - Only Opus seats reached this design, so it needs another model family's attack.
- The probes settle the platform facts (`probes/stop-probes-a1.md`):
  - The data block and data attributes come back byte for byte after a publish.
  - A create and a pinned delete commit as one batch, and a pinned delete of a missing document refuses the whole batch.
  - A list on a page without a database names that cause.
  - `CLAUDECODE` and `CLAUDE_CODE_SESSION_ID` are set in a desktop session's shell.
  - Earlier probes settled create-only writes, carried-forward capabilities and the `runs` rule (`probes/db-probe-a1.md` to `a4.md`).

## Evidence

### Requirements

- [ask] "Decide ... whether an unattended run republishes at each stage change." The owner "had to ask 'artifact?' after seven hours without a republish."
- [ask] "Decide whether the renderer leads with the plan a hand-back is for, or the reply links that plan's anchor." This plan does both: the earlier iteration built the lead, and every reply now links the anchor.
- [law] Every subject has one page, and an agent reads a page from its rendered file or its plan and subject files, never from the published page (`.agents/pstack/rules/pages.md`).
- [law] The Artifact tool's contract. A publish needs a read first. A publish over a newer version merges onto it, never resends refused content, and never passes `force` without the owner's word about that exact version.
- [law] The Autopilot rule stops on deleting data the run did not create, so a stop deletes only its own session's documents, and dropping another session's card waits on the owner.
- [law] The Calls rule: the beacon's set call goes out with the next working call.

### Lanes

Plan panel round 3's prompt, answers and synthesis are in `docs/plans/artifacts/2026-10-17-stage-publish/panel-p3/`. Architect round 3's grounding, prompts, three answers, the judge's verdict and its synthesis are in `architect-r3/`. Plan panel round 2's answers are in `panel-p2/`. Round 2's architect files are in `architect-r2/`, round 1's in `architect/`, and plan panel round 1's answers in `panel-p1/`. The probes are in `probes/`.

## Steps

Phase 1 fixes the rail (step 1). It is worth keeping alone, because every page published mid-run today shows its current stage as done. Keep rule: the rail replayed over every real plan in plate-2 and Ellie shows a current stage that matches each plan's `Status:`.

- [ ] 1. In dotai, take the rail's current stage from the newest work-stage row. Proof: new tests fail on dotai `HEAD` and pass on the change:
  - with rows build, the rail shows Build now and Writing not yet run;
  - with rows build, verify, panel and build, it shows Build now and Verify done;
  - a plan-only log whose `Status:` waits on the owner shows Plan waiting;
  - a log ending in `trail`, `plan` or `owner` rows after a panel row shows Plan review now;
  - a `writing` row after an `architect` row and before any build shows Design now, and a log of only `trail` rows shows Plan now;
  - a plan with a `Plans:` line keeps its current stage;
  - a replay of `--rail` over every plan in plate-2 and Ellie, saved in the run directory, lists each current stage beside its `Status:`, and each one that disagrees is explained.

Phase 2 shows each run's stage live and keeps other runs' hand-backs as cards (steps 2 to 6). Neither half works without the other, because a beacon needs the database that a stop declares. Keep rule: a scratch page opened in the owner's app pane draws a live line and a card, and its script writes a probe document that the lead reads back. When the probe writes nothing, the phase ships and the owner's look stays open.

- [ ] 2. Add the main-module guard and exports, `page-live.mjs`'s record, `supersedes` and data block, `pageUrlOf`, and both `HELPER_FILES` entries. Proof: new tests fail on `HEAD` and pass on the change:
  - `handbackOf` keeps every memo part, attention, recommended and multi included, keeps only (look) and (answer) picks, and takes the blob, history and landed flag from a sandbox repo with three commits of the plan and an origin;
  - `supersedes` decides by history both ways, orders one session by time, lets a later landed copy win, answers neither for diverged copies and breaks a both-ways history on time;
  - `pageUrlOf` uses a line changed since the fork point after a mid-run commit, uses origin's line in a worktree that has not pulled, and lists another worktree's differing line;
  - importing `plan-page.mjs` runs no CLI;
  - a synced helper that imports a relative file `HELPER_FILES` does not list is refused.
- [ ] 3. Add the data block, the mounts, the anchors, `deckModel` and the deck script. Proof: new tests fail on `HEAD` and pass on the change:
  - every page embeds the block, both mounts, the script, the header anchor and each Needs you item's `data-plan`, and `--pr` and `--comment` output hold none;
  - a JSON string holding `</script>` and U+2028 round-trips through the block;
  - `deckModel`:
    - a database-only plan shows a card;
    - a plan whose newest copy is in the body shows none;
    - a body item whose plan has a newer note is marked changed, and its card shows;
    - two diverged copies both show;
    - waiting cards sort first;
    - a finished card that asks nothing leaves after three days or once the body shows it done;
    - a card that asks never leaves by age, and leaves once a later landed copy shows;
    - a quiet working line is marked after a day and hidden after seven;
  - the script text taken from a rendered page, run in a `vm` against a stubbed `claude.use`: a null handle shows the note, an `onSnapshot` error shows the reload note, a snapshot draws through `textContent`, a matching hash scrolls to its card, and with no `window.claude` it draws nothing.
- [ ] 4. Add `page-stop.mjs beacon` and `stop`. Proof: new tests fail on `HEAD` and pass on the change:
  - `beacon` prints one set with no delete and no `if_version` when the stage or state moved, and nothing when neither did;
  - it prints nothing to send without `CLAUDECODE=1`, even with `CODEX_SESSION_ID` set, and it refuses without a session id;
  - `decisions-check.mjs append` prints the beacon's call when its row moves the plan's stage, nothing when it does not or outside Claude Code, and still writes the row when the beacon cannot run;
  - `stop` from a sandbox worktree prints a batch holding the stop record and a record for each plan the worktree changed since its fork point, and none for a committed plan;
  - its deletes cover only this session's older documents for those plans, each pinned to its listed version, within 50 writes;
  - rerun against its own query after the batch, it prints "publish nothing" with the reply link, and a changed render prints a new stop;
  - it prints the batch before the publish with a database, and after it with `--no-db` along with the capabilities;
  - two sandbox worktrees stopping in turn on one subject: the second's batch and render leave the first's stop record untouched, and `deckModel` over both shows the first's question as a card on the second's page.
- [ ] 5. Resolve a frame missing in this checkout from the main checkout. Proof: a new test fails on `HEAD` and passes on the change. A sandbox worktree whose plan's frame exists only in the main checkout's run directory inlines it, and one that exists nowhere shows its path.
- [ ] 6. Rewrite the block's Plan pages bullet, `rules/pages.md`, the plan-page `SKILL.md`'s Render step 8, `references/shape.md` and `rules/land.md`. Proof: a sentence diff of the rendered rule files and block from dotai `HEAD` lists only the beacon trigger, the stop path, the refused stop, the anchor reply, the read's reason, the live line and Other runs, and the close stop. Then the probe page from Phase 2's keep rule, opened in the owner's app pane, writes its probe document, and the lead reads it back.

Phase 3 lands it (steps 7 and 8).

- [ ] 7. Render every plan in plate-2 and Ellie with the old and new renderer and diff the refusals and bodies. Publish the old and new render of one real plan for the owner to compare. Then run the diff panel and apply its fixes. Smoke plate-2 with the intended behavior written first, push dotai, sync plate-2 and Ellie, and run `verify` on each, together with steps 7 and 8 of `docs/plans/2026-10-17-subject-page-lead.md`. Proof:
  - the corpus logs show no plan newly refused, and the only body changes are the data block, the mounts, the anchors, the script, the `data-plan` attributes, the rail's current stage and newly resolved frames;
  - each round's findings and fixes, the smoke logs, the dotai commits, the Ellie commit and the plate-2 commit land.mjs pushes.
- [ ] 8. Run this run's last stop through the new path on the plan-page page, a new page on this account: the read, the query, `stop`, the batch, the publish and the anchored reply. Proof: the saved read, the batch and publish results, and an `ArtifactData list runs` at the viewer level that returns this run's stop record.

## Proof

Tests in dotai prove the rail, the record, `supersedes`, the binding, the data block, `deckModel` and the deck script run as the page emits it, `beacon` and `stop`, and the frame fallback. The rail replay and the corpus renders prove real plans read right and none is newly refused. The probe page proves a signed-in view draws the deck, if its probe document lands. The real plan-page page proves one stop end to end. The smoke proves routing only.

## Open work

- The Codex reviewers can't run, because Codex is logged in with a ChatGPT account ("model is not supported when using Codex with a ChatGPT account"). Only you can fix it, since it uses your key. Run `printenv OPENAI_API_KEY | codex login --with-api-key`. owner: the owner. stop: a Codex ping answers. Tracked on this plan's page.
- Look once at the plan-page page while signed in, after step 8, unless the test page reports first that it drew. owner: the owner. stop: that look, the test page's report, or the first comment about the cards. Tracked on this plan's page.
