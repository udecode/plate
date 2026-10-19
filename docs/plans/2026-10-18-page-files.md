# Keep each run's part in its own page files, and republish at every stage

Status: executed: landed on next; your look at the new page waits
Topic: plan-page
Playbook: plan

This plan continues `docs/plans/2026-10-18-page-parts.md` and replaces how it stores each run's part. Its task, t_fd284610, asks "whether an unattended run republishes at each stage change", because the owner had to ask "artifact?" after seven hours without a republish.

How the design got here:

- The page-parts plan's panel round 1 rejected it in all three seats. Keeping every run's part inside the page made each publish resend other runs' content the lead had not read, and a worktree on the old helper erased every part with one whole-page publish. Only a new stored shape fixes both, so the run pivoted.
- A probe showed that a claude.ai page keeps every file a publish leaves out.
- Architect round d4 ran three runners. All three store each run in its own supporting files. The cross-judge picked a small run list in the page file with one header file and one body file per run.
- This plan's panel ran three rounds. They added a journal, a queue, two locks, a transcript guard, a digest between two markers, recorded supersession and a rebuild word.
- The owner then cut all of that: "ok go cut fast". The design keeps the per-run files, the list in the page file, the lead by hand-back serial and a publish at every stage, and accepts two limits in place of the machinery.

## Brief

### What will change?

A run republishes its page at every stage. Each run keeps its work in its own files there, and a publish sends only those and the page file. The latest hand-back leads.

### What could go wrong?

A crash mid-publish leaves an old stage line until the next publish. Until a worktree rebases, its old helper can hide other runs. Two runs of one plan both show their questions. Nobody has seen the new viewer on a real page yet.

## Teach

Each topic has one web page, and several runs publish to it from their own copies. Until now every publish rebuilt the whole page from one copy, so it dropped whatever only the other copies knew.

A claude.ai page can hold more files than its page file, and a publish keeps every file it does not name. So each run now writes its own files: a small header with its stage at every publish, and its full body at a hand-back. The page file only lists the runs, and the browser fetches each run's files and builds the page.

The list is the only thing two runs both write. When another run published first, the Artifact tool refuses and saves the newer page. The lead runs the helper again on that saved page, and the helper adds its run to the list there. Each hand-back takes the next number on the list, and the highest number leads the page, so a stage publish never takes the lead.

## Main changes

These are the stage-publish plan's changes that stay, built in dotai's working tree:

- `flowOf` takes the rail's current stage from the newest work-stage row. `mergedFlow` keeps the leading plan's current state.
- `plan-page.mjs` runs its CLI only as the main module, and `page-stop.mjs` sits beside it under the `plans` gate.
- `pageUrlOf` keeps the stage-publish plan's binding rule. A checkout uses its own `Page:` line when that line differs from the line at its fork point while `origin/<branch>` keeps the fork point's line. Otherwise it uses `origin/<branch>`'s line.
- A frame missing in this checkout resolves in the main checkout.

These replace the page-parts plan's parts:

- **A subject page is a set of files.**
  - `index.html`, the page file: the title, a link to `code/<v>.css`, a data block, a static list of the runs with their titles, stages and anchors, lead first, a mount, and `<script src="code/<v>.js">`.
  - The data block is `{v: 1, code, subject, runs: [entry]}`, one entry per line. An entry is `{key, session, plan, slug, title, added, at, handback, done}`. `handback` is the run's hand-back serial or null. Entries never expire.
  - `code/<v>.js` and `code/<v>.css`: the viewer for renderer code version `v`.
  - `runs/<key>.json`, the run's header: `{v, code, key, session, plan, slug, title, status, state, stage, occurrence, since, at, steps, asks, picks, handback}`. `state` is `working`, `waiting`, `blocked` or `done`, `occurrence` names one entry into a stage, `asks` holds the run's open questions and `picks` is a digest of its `look` and `answer` Defaults rows.
  - `runs/<key>.html`, the run's body: this checkout's render of the plan with its subject frame and History.
  - `shots/<sha256>.<ext>`: each picture a body shows.
  - The key is `<plan slug>.<session id>`, with the full session id.
- **The viewer builds the page.**
  - It fetches every listed header and shows a strip under the subject title: each run's stage, steps, state, since when and when it last published, waiting and blocked runs first. Each row links that entry's own anchor.
  - The lead plan is the plan of the entry with the highest `handback` serial, ties broken by `added`. Its section opens with its bodies, newest first. Other plans' bodies load when their section opens or when the URL's hash names them. A done run whose last publish is more than 3 days old shows folded.
  - `run-<slug>` goes to the plan's section, and `run~<slug>~<session id>` to each entry. `slugOf` maps `~` to `-`, so the two never collide.
  - Each body's Needs you holds only its own plan's questions, with input names and answer bindings scoped by the run's key. A draft answer stays in the viewer's browser storage, and every read and write of it is wrapped. The copied answer is `go <subject>/<slug> @<digest>`.
  - When a fetch fails, the static list still names each run and lands each anchor, and the page says which files did not load.
- **`plan-page.mjs` renders the pieces.** `render(plan)` without options still gives this checkout's whole page, which is the local file agents read. `runHeader`, `runBody` and `pageFile` render one run's header and body and the page file from a list, and `parsePageFile` reads the data block and the static list from a page as the tool stores it. A body links each picture as `shots/<sha256>.<ext>` in place of inlining it. The data block's live mount and the deck script go away, and no page has a database.
- **`page-stop.mjs` has two commands, `stage <plan>` and `stop <plan>`, with `--base <file>` and `--new`.**
  - It writes the page file and this run's files under this checkout's `<plans>/artifacts/pages/<subject>/`, inside the session's working directory, and prints the Artifact call with `root` set to that folder, then every file in it to read in full.
  - The base list is the `--base` file, which is the page as the tool saved it after a refusal or a read, or else this checkout's last page file. `--new` starts from an empty list and prints a create with no URL.
  - A stop gives this run's entry the base list's highest serial plus one. A stage keeps the serial the base list holds for this run.
  - A stage sends nothing when the base lists this run's last publish and the header's occurrence, state, status, title, asks and picks are unchanged. The body goes at a stop, when the page does not show this run's last publish, and when asks or picks changed. Pictures go with the body, and the code files go when the base's code version is older.
  - A stop prints the reply line, `<url>#run-<slug>`, to send once the publish goes through.
  - A base without a data block, such as a page an old helper published, lists only this run, and the helper says so.
- **The triggers run `stage`.** The trunk Plan pages bullet's trigger and `decisions-check.mjs append` outside trunk delivery call `page-stop.mjs stage <plan>` in place of `beacon`, and the append prints the helper's output. `beacon`, `--own`, `--no-db` and `page-live.mjs` go away.
- **The rules change to match.** `rules/pages.md` sends every publish through `page-stop.mjs`, reruns it with `--base` after a refusal and with `--new` for a page that no longer opens, and states the two limits. The block's Calls bullet says "a page publish", and the trunk Plan pages bullet names `page-stop.mjs stage`. The plan-page `SKILL.md`'s Render step publishes through the helper and keeps its rule for a dead link. `references/shape.md` replaces Live line and Other runs with Runs. `rules/land.md` holds back one close check for the final stop's publish.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How the page shows a run's stage | Every stage change republishes the page, with one line per run at the top (look) | A line from the page's database between hand-backs, for signed-in viewers only | database line | big |
| Where each run's work lives | In that run's own files on the page. A publish sends only those and the page file (look) | All runs inside the page file, copied at every publish | one page file | big |
| How the page finds the runs | A list in the page file. After a refusal the helper adds its run to the saved page's list and the lead publishes once more (look) | The browser lists the page's files, which claude.ai pages cannot do | none | big |
| Old worktrees | Keep each subject's link. Until a worktree rebases, its old helper's whole-page publish hides other runs. Settled by your word "ok go cut fast" (safe) | Move each subject to a new link at its first new publish | new links | big |
| What leads the page | The plan of the newest hand-back, by the number it took on the list. A stage publish never takes the lead (safe) | Whichever plan published last | last publish leads | small |
| Two runs of one plan | Both show their bodies, newest first (safe) | Hide the older run's questions | hide older runs | small |
| When a stage is due | A new stage, state, status, title, question or pick. A checked step alone does not publish (safe) | Every checked step publishes too | publish steps | small |
| What the lead reads before a publish | Every file the helper prints, in full, and every picture (safe) | Only the files that changed since the last publish | changed files only | small |
| A crash mid-publish | The stage line stays old until the next publish (safe) | A journal that finds the lost publish | journal | small |
| Pictures on the page | Each picture goes as its own file beside the page, and a body links it (safe) | Inline each picture in every body that shows it | inline pictures | small |
| Running out of room | Nothing deletes a run's files. A page holds about 250 runs before its 511-file limit (look) | Delete done runs' files after a while | prune parts | small |
| Viewer code | Versioned files, sent only when the page's copy is older (safe) | Code inside every page file | inline code | detail |
| Answers half-typed when the page reloads | Your browser keeps the draft, keyed to its question, and puts it back (safe) | Leave drafts unsaved | no drafts | detail |
| Codex runs | Render their page locally and publish nothing, as today (safe) | Codex publishes through a Claude Code session | codex publishes | detail |
| Sync to projects | Ship on the tests and this run's own stop on the real page. Your look comes after (look) | Wait for your look at a scratch page first | look first | small |
| The plan-page topic's page | A new page on this account, https://claude.ai/artifact/XrSoiwxSJ5mPKpw4KMp192, made at this run's last stop, because neither https://claude.ai/artifact/QLPuWXTpAuCKDdhm6jX34Z nor https://claude.ai/artifact/RZ1v4REj24wERFqMYoktqw opens on it (safe) | Go back to the old link | old page link | detail |

## Outcome

During an unattended run in a Claude Code desktop session, the owner can open the subject page at any time without asking. It shows each run's stage, when that stage began and when the run last published.

- A run's stage change republishes its subject page with the next working call after the lead reads the printed files.
- Every hand-back publish that goes through leads the page with its plan, and later stage publishes keep that lead.
- The reply links `#run-<slug>`, and that anchor lands for as long as the page lists the run.
- No publish sends another run's files, and no publish deletes a file.
- After a refusal, the next publish builds on the page the tool saved. No publish passes `force`.
- No new publish adds a database.

## Scope

- In, in dotai: `plan-page.mjs` and `page-stop.mjs`, the removal of `page-live.mjs`, `decisions-check.mjs`'s append trigger, `scripts/sync-pstack.mjs`'s `HELPER_FILES`, `assets/block.md`'s Calls and Plan pages bullets, `rules/pages.md`, `rules/land.md`, the plan-page skill's `SKILL.md` and `references/shape.md`, and their tests. Then the synced copies in plate-2 and Ellie.
- Out, each a named limit:
  - A crash mid-publish leaves a stale stage line until the next publish.
  - Until a worktree rebases, its old helper's whole-page publish hides other runs and their anchors. 49 worktrees share plate-2's main checkout: 34 carry no `page-stop.mjs` and 15 carry the beacon helper.
  - Two runs of one plan both show their bodies and their questions.
  - An old helper's stop may add a database to the page, which new publishes keep and never use.
  - A run inside one long blocking call shows its last stage and when it last published.
  - A run's body needs scripts. Without them, the page shows the static list of runs and their anchors.
  - Codex runs publish nothing.
  - A prune command for the 511-file limit.
  - The plate checkout, which `sync` refuses while it sits off its branch.

## Decisions

| Lane | Other runs' work | Discovery | Verdict |
| --- | --- | --- | --- |
| Shape A, as built (incumbent) | Database cards | Database queries | Rejected by the stage-publish plan's diff panel round 2 |
| Live notes | Copies from every worktree and origin | Worktree scans | Rejected by its plan panel round 1 |
| Page parts | Carried inside the page | The page's own markers | Rejected by its plan panel round 1 |
| No shared file (cand-2) | A stage file and a hand-back file per run | The browser lists the files | Rejected: no claude.ai API lists a page's files |
| Catalogue and 64 bundles (cand-3) | Records in shared bundle files | A catalogue file | Rejected: every stage and stop reads files that grow with every run |
| A run list in the page file (cand-1) | A header and a body file per run | The list | Picked |
| cand-1 with the panel's guards | The same | The list, checked by a digest, a journal, locks and a transcript guard | Cut by the owner: "ok go cut fast" |

- The cross-judge was an Opus seat on blinded copies (`docs/plans/artifacts/2026-10-18-page-parts/architect-d4/judge/answer.md`).
- The panel's three syntheses are in `docs/plans/artifacts/2026-10-18-page-files/panel-p1/`, `panel-p2/` and `panel-p3/synthesis.md`. The owner's cut drops the findings whose fixes were the guards, and the two limits above take their place.

## Evidence

### Requirements

- [ask] "Decide ... whether an unattended run republishes at each stage change." The owner "had to ask 'artifact?' after seven hours without a republish."
- [ask] "Decide whether the renderer leads with the plan a hand-back is for, or the reply links that plan's anchor." The earlier iteration built the lead, and every reply links the anchor.
- [ask] "The renderer and rule change in the shared source through the sync-pstack skill."
- [ask] The owner's cut, relayed by the parent session: keep the per-run files, the list-only page file, own-files publishes, the highest serial leading, a publish at every stage and the viewer; cut the journal, the queue, both locks, the transcript guard, the digest markers and the edit check, blob-history supersession and rebuild; after a refusal, add this run's entry to the page the tool hands back and publish once more.
- [law] Every subject has one page (`.agents/pstack/rules/pages.md`). Only `page-stop.mjs` starts from the published page, and it reads only the page file's list.
- [law] The Artifact tool's contract. A publish needs a read of the page in this conversation first. After a refusal, the lead merges into the version handed back. "Claude reads the whole file before publishing it." Files a publish leaves out are kept, and their sources must be under the working directory or the scratchpad. `force` needs the owner's word about that exact version.
- [law] The Autopilot rule stops on deleting data the run did not create. No publish deletes a file.

### Measured

- A publish keeps every supporting file it leaves out, must include the page file, and stores author comments and JSON data blocks exactly. The stored page is 531 bytes of the tool's skeleton, the sent bytes, then `\n</body></html>`, and a real refusal's saved copy also holds a 607 KB highlight runtime before that ending (`docs/plans/artifacts/2026-10-18-page-parts/probes/files-probe-a1.md`). The fixtures in dotai's `skills/sync-pstack/scripts/fixtures/page-files/` record these shapes.
- 49 worktrees share plate-2's main checkout: 34 carry no `page-stop.mjs` and 15 carry the beacon helper.
- The dnd plans of 2026-10-15 logged 13 to 19 stage changes each (Opus seat, round 1).

## Steps

- [x] 1. Save the stored page shapes as fixtures, and add the header, body and page-file renders and the viewer's code files to `plan-page.mjs`. Send pictures as files, and remove the live mount and the deck. Proof: `node --test skills/sync-pstack/scripts/page-files.test.mjs` passes 12 tests, among them the page file round trip, reading runs from each stored fixture, the viewer model's lead, anchors, fold and Also waiting, separate answer inputs per body, the body's pictures and questions, the header's asks and picks, drafts and the local render.
- [x] 2. Rewrite `page-stop.mjs` as `stage` and `stop` with `--base` and `--new`, and remove `page-live.mjs`, `beacon`, `--own` and `--no-db`. Proof: the same file's page-stop tests. The first stage sends the body, its picture and the code; an unchanged stage sends nothing; a new status sends only the header; a stop takes serial 1 and prints the reply. A refused page's other run stays, the stop's serial follows the highest, and no code is resent. A page without a data block lists only this run, and `--new` prints a create.
- [x] 3. Rewrite `rules/pages.md`, the block's Calls and Plan pages bullets, the plan-page `SKILL.md`'s Render step, `references/shape.md` and `rules/land.md`. Proof: `scripts/validate-skills` exits 0 (`docs/plans/artifacts/2026-10-18-page-files/validate-final-a1.log`), and the push block stays at 29,298 of its 29,300 bytes.
- [x] 4. Push dotai, sync plate-2 and Ellie, and run `verify` on each. Proof: dotai `af4cf9e`, `6af30a7` and `2d0eb27`, Ellie `fba2e7f6c`, plate-2's sync in `32c34c8df5`, and `verify-ellie-a1.log` and `verify-plate-2-a1.log`, both exit 0.
- [x] 5. Run this run's last stop through the new helper with `--new` on the plan-page topic, write the new `Page:` line, and publish. Proof: the helper's output and the Artifact result, version 1 of https://claude.ai/artifact/XrSoiwxSJ5mPKpw4KMp192.

This ships fast. No diff panel or seat round runs, and no-comments closes as "skip: fast".

## Close

- Reversal first. The owner's cut removed the guards the panel had added, so the design ships without the journal, the locks, the transcript guard, the digest check, supersession and rebuild. Two accepted limits take their place, and the Scope names them.
- Landed: dotai `af4cf9e` with the renderer, the helper, the rules and the tests, `6af30a7`, which drops an unused fixture, and `2d0eb27`, which refreshes the manifest. dotai `1e2e092` puts back a space the viewer dropped from each run heading, and Ellie carries it in `6bfa7a6a2` after `fba2e7f6c`. plate-2's synced helpers came from another session's `32c34c8df5` at dotai `af4cf9e`, and this plan's own commit lands the plans, the subject fold and the `1e2e092` resync.
- Deviation. `af4cf9e` also carries another session's uncommitted dotai edits to `land.mjs`, `trunk.test.mjs`, sync-pstack's `SKILL.md` and `references/interview.md`, which belonged in a separate commit after this one. validate-skills passes on the pushed tree with them.
- Proof: validate-skills exits 0 on the pushed tree, the page-files suite passes 12 of 12, and sync-pstack `verify` exits 0 on Ellie and plate-2. The logs are `validate-final-a1.log`, `page-files-test-a1.log`, `verify-ellie-a1.log` and `verify-plate-2-a1.log` in `docs/plans/artifacts/2026-10-18-page-files/`.
- Where the proof stops. No browser has loaded the viewer on a real page with a second run, and no second session has published to one page, so a refusal and the rerun with `--base` are proven only in tests. This run's last stop made version 1 of https://claude.ai/artifact/XrSoiwxSJ5mPKpw4KMp192, and no browser has loaded it yet.
- Open work: the old-helper limit and your look at the page, both below and in the subject file.

## Open work

- Until every plate-2 and Ellie worktree rebases onto the synced helpers, an old helper's whole-page publish can hide other runs. owner: the owner. stop: the last old-helper worktree rebased. Tracked on this plan's page.
- Look at the plan-page page while signed in: both runs' strip lines, a body with its picture, a `#run-<slug>` link opening its run, and a half-typed answer surviving a stage publish. owner: the owner. stop: that look, or the first comment about the page. Tracked on this plan's page.
