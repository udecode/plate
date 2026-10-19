# Keep each run's part in the page, and republish at every stage

Status: superseded: by docs/plans/2026-10-18-page-files.md, which keeps each run's part in its own page files in place of this plan's in-page parts
Topic: plan-page
Playbook: plan

This plan continues `docs/plans/2026-10-18-live-notes.md` and replaces its notes, deck and copies. Its task, t_fd284610, asks "whether an unattended run republishes at each stage change", because the owner had to ask "artifact?" after seven hours without a republish.

How the design got here:

- The live-notes plan's panel round 1 rejected it in all three seats. The notes still grew with ended sessions and could void their own cleanup. Mixing copies from every worktree broke the renderer's checks, and squash dates picked stale copies. Only a new stored shape fixes both, so the run pivoted.
- Architect round d3 ran three runners from three starts: the lead's clone-local store, the strongest database design, and first principles. All three make the refusal a merge onto the page version the Artifact tool hands back, and two of three republish at every stage. The cross-judge picked the first-principles candidate, where the page itself holds one part per running plan, with eight repairs.

## Brief

### What will change?

Yes, a long run now republishes its page at every stage. Each running plan owns one part of the page, and a publish copies the other parts unchanged. The plan that handed back last stays on top.

### What could go wrong?

Each plan adds about a dozen page versions, and a stage publish reloads the page if you have it open. Half-typed answers come back after the reload. Nobody has yet watched a link open a folded part inside claude.ai.

## Teach

Each topic has one web page, and several runs publish to it, each from its own copy of the repository. Until now every publish rebuilt the whole page from one copy, so it dropped whatever only the other copies knew.

Now the page is split into parts, one per running plan. A run rebuilds only its own part and copies every other part byte for byte from the last version of the page it saw. If another run published in between, the Artifact tool refuses and hands back the newer version, and the run rebuilds on that.

Because a publish no longer erases another run's work, a stage change can republish the page, and the database line goes away. The page also records which plan handed back last. Only another hand-back takes that spot.

## Main changes

These are the stage-publish plan's changes that stay, built in dotai's working tree:

- `flowOf` takes the rail's current stage from the newest work-stage row. `mergedFlow` keeps the leading plan's current state.
- `plan-page.mjs` runs its CLI only as the main module, and `page-stop.mjs` sits beside it under the `plans` gate.
- `pageUrlOf` keeps the stage-publish plan's binding rule. A checkout uses its own `Page:` line when that line differs from the line at its fork point while `origin/<branch>` keeps the fork point's line. Otherwise it uses `origin/<branch>`'s line.
- A frame missing in this checkout resolves in the main checkout.

These replace the live-notes plan's notes, deck and copies:

- **The published page holds one part per running plan.**
  - A part is `<!--part {json}-->`, then the plan's rendered body, then `<!--/part-->`. Its key is the plan's repository path, so a page holds at most one part per plan.
  - The JSON holds `v: 1`, the plan path, slug, title, `Status:` sentence, state (`working`, `waiting`, `blocked` or `done`), stage, checked steps, `since`, `at` and `handback`, the time of the plan's last stop or null. `<`, `>` and `&` are escaped.
  - A page comment, `<!--page {"v":1,"lead":"<plan path>"}-->`, names the leading plan.
  - The data block, the live mount, the deck script and `page-live.mjs` go away. No page has a database.
- **`plan-page.mjs`'s `render(plan, {live, stop})` composes the page.**
  - It renders this plan's part from this checkout and runs the asserts only on this checkout's files.
  - It carries every other part of the `live` version byte for byte.
  - A carried part folds into an anchor-only History line once it is done and its `at` is more than 3 days old, or once its `at` is more than 30 days old.
  - A stop sets `lead` to its plan, and a stage keeps the live page's `lead`. When the lead's part is gone, the part with the newest `handback` leads, and with none, this plan's part does.
  - Order: the lead's part, open; waiting and blocked parts, open; working parts, folded, newest `at` first; done parts, folded; then History.
  - A strip under the title lists every part with its stage, checked steps, state, since when and when its run last published, each linking `#run-<slug>`. History plans that wait follow as Also waiting.
  - History comes from this checkout's plan files, as today, on every page, brief pages included. Each plan the live page names but this checkout lacks keeps an anchor-only line, unless this checkout's own history shows its file deleted.
  - Exactly one `id="run-<slug>"` exists per plan, on its part or its History line.
  - Each part's Needs you holds only its plan's questions. A waiting History line shows its plan's questions.
  - Only the lead's part, or a part rendered by a stop, carries the subject's sections.
  - Without `live`, `render` gives this checkout alone, which is the local file agents read, as today.
- **`partsOf(html)` never throws.** A page with no part markers becomes one folded legacy part, carried for 7 days, so the first publish after this change drops nothing the old page held.
- **The page's scripts work per part.**
  - Answer inputs are named `<slug>-q<n>`, and the answer script binds to its own part.
  - A draft answer is kept in the viewer's browser storage, keyed by the page and slug, and comes back after a reload. Every read and write of it is wrapped, so the page works without storage.
  - A short script opens the part or line that `location.hash` names and scrolls to it, on load and on `hashchange`.
- **`page-stop.mjs` has two commands, `stage <plan>` and `stop <plan>`.**
  - It finds what this session last saw of the page in this session's transcript, `~/.claude/projects/*/<CLAUDE_CODE_SESSION_ID>.jsonl`. It scans backward and stops at the newest Artifact result whose URL is the page's:
    - a publish that went through gives the file it published;
    - a refusal gives the live version's saved file;
    - an "identical content" refusal points back to the file the refusal before it saved;
    - a read gives its saved file;
    - a refusal without a version, such as no access or not found, gives `refused`;
    - nothing, or wording the scan cannot classify, gives `unseen`, and the command prints a read and asks to be run again.
  - `stage` prints a publish only when this plan's part in that version is missing or differs in stage, state, checked steps, status or title. Otherwise it prints "Nothing to send". A publish that never went out stays due, because the transcript still names the last version that did.
  - `stop` always prints the publish, then the reply, `<url>#run-<slug>`, to send once the publish goes through.
  - When the last result is an "identical content" refusal, the command prints the same publish again. The tool's own refusal says that a resend whose content already holds the live version goes through.
  - Each output file is `<main checkout>/<plans>/artifacts/pages/<page key>.<digest>.html`, named by its content's digest, so a file a past publish named still holds the bytes that went out.
  - It prints which parts it carried unchanged, and the instruction to send the publish first in the next message and start any long call in the background.
- **A page that does not open is an access failure.** `stage` prints nothing to send and says so. `stop` prints no publish, and its reply says the page could not be reached. Only a stop on a subject with no `Page:` line, or whose page was not found, prints a publish without `url`, and the lead writes the `Page:` line from its result. When the command finds that new page in the transcript, it writes `<main checkout>/<plans>/artifacts/pages/<subject>.binding.json` with the new URL and the URL it replaced. `pageUrlOf` uses that file while `origin/<branch>`'s line still names the replaced URL, so the clone's other worktrees publish to the same new page.
- **The triggers run `stage`.** The trunk Plan pages bullet's trigger and `decisions-check.mjs append` outside trunk delivery call `page-stop.mjs stage <plan>` in place of `beacon`. `beacon`, `--own` and `--no-db` go away.
- **The rules change to match.**
  - `rules/pages.md`: a stage change publishes too; the publish goes first in the next message, and long calls start in the background; after a refusal the lead runs the same command again; only `page-stop.mjs` starts from the published page, and it reads nothing in another run's part but its JSON.
  - The block's Calls bullet says "a page publish" in place of "a beacon's set". The trunk Plan pages bullet names `page-stop.mjs stage`.
  - The plan-page `SKILL.md`'s Render steps 7 and 8 publish through `page-stop.mjs` in Claude Code. `references/shape.md` replaces Live line and Other runs with Parts. `rules/land.md` keeps its close stop.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How the page shows a run's stage | Every stage change republishes the page, with one line per running plan at the top, for every viewer (look) | A line from the page's database between hand-backs, for signed-in viewers only | database line | big |
| Where other runs' work comes from | The page itself. Each running plan owns one part, and a publish copies the other parts unchanged, whichever clone or computer wrote them (look) | Copies read from every worktree on this computer | read worktrees | big |
| What leads the page | The plan of the newest hand-back. A stage publish never takes the lead (safe) | Whichever plan published last | last publish leads | small |
| Needs you | Each part shows only its own plan's questions, and other plans that wait show theirs in History (look) | One list of every plan's questions at the top | one list | small |
| How the helper knows what the page holds | It reads this session's transcript for the last Artifact result on the page. With none, it asks for a read (look) | The lead passes each saved file's path by hand, one more message per publish | pass paths | small |
| Reading the helper's output before publishing | The lead skips reading it in full. Its own part comes from files the renderer checked, and every other part is an exact copy of a page version the tool already showed it (look) | Read the whole file first, up to 649 KB | read in full | small |
| A page that no longer opens | Report it. Only a stop makes a new page, and a file in the main checkout keeps this clone's other worktrees on that page (look) | Try other worktrees' links first | try fallbacks | small |
| A run that stops without finishing | Its part stays, showing when it last published, and folds into a History line after 30 days, or 3 days once done (safe) | Keep every part until its plan file is gone | keep parts | detail |
| After a refusal | Build on the version the tool handed back and publish again. When the tool says the content already holds that version, send it once more unchanged, as its refusal allows (safe) | Send nothing | send nothing | detail |
| Answers half-typed when the page reloads | Your browser keeps the draft and puts it back (safe) | Leave drafts unsaved | no drafts | detail |
| Page versions | About 10 to 15 per plan, one per stage change (safe) | Republish only at hand-backs | hand-backs only | detail |
| Pages published before this change | The first publish after it keeps the old page as one folded part for a week (safe) | Drop what only the old page held | drop old page | detail |
| Codex runs | Render their page locally and publish nothing, as today (safe) | Codex publishes through a Claude Code session | codex publishes | detail |
| Pictures on the page | Stay inside the page, as today. Sending each one as its own file waits in the backlog (safe) | Send each picture once as a file beside the page | picture files | detail |
| The plan-page topic's page | https://claude.ai/artifact/RZ1v4REj24wERFqMYoktqw, a new page on this account, because neither older link opens on it (safe) | Go back to an old link | old page link | detail |
| Who reviews the plan | Two Codex reviewers and one Opus reviewer (safe) | Opus reviewers only | opus only | detail |

## Outcome

During an unattended run in a Claude Code desktop session, the owner can open the subject page at any time, signed in or not, without asking. It shows each running plan's stage, when that stage began and when its run last published.

- A running plan's stage change republishes its subject page with that run's next message. A publish that never went out stays due until one does.
- Every hand-back publish that goes through leads the page with its plan, and later stage publishes keep that lead.
- The reply links `#run-<slug>`. That anchor stays on the page after other runs publish, on the plan's part, or on a History line once the part folds.
- No publish drops another run's part, from any clone or computer, except by folding it on the stated clock.
- After a refusal, the next publish builds on the version the tool handed back. No publish passes `force`.
- No page has a database.

## Scope

- In, in dotai:
  - `skills/sync-pstack/assets/pstack/plan-page.mjs` and `page-stop.mjs`, and the removal of `page-live.mjs`;
  - `decisions-check.mjs`'s append trigger and `scripts/sync-pstack.mjs`'s `HELPER_FILES`;
  - `assets/block.md`'s Calls and Plan pages bullets, `rules/pages.md` and `rules/land.md`;
  - the plan-page skill's `SKILL.md` and `references/shape.md`;
  - their tests.

  Then the synced copies in plate-2 and Ellie. plate-2's `origin/next` carries the stage-publish plan's helpers and beacon trigger from b8fb01f798, and no real page has a database, so nothing needs migrating.
- Out, each a named limit:
  - A run inside one long blocking call shows its last stage and when it last published.
  - A History line shows its plan as the publishing checkout has it.
  - Two clones that each make a new page for one subject at once end with two pages.
  - Worktrees still on the old helper publish whole pages without parts until they rebase. A part they drop comes back at its run's next publish.
  - The transcript scan depends on Claude Code's transcript layout and the Artifact tool's wording. Wording it cannot classify falls back to a read.
  - How a link opens a folded part inside claude.ai's frame shows only in a signed-in view.
  - Pictures sent as separate files, `docs/plans/backlog.md`.
  - The plate checkout, which `sync` refuses while it sits off its branch.

## Decisions

| Lane | Stage visible | Other runs' work | Stored outside the page | Verdict |
| --- | --- | --- | --- | --- |
| Shape A, as built (incumbent) | Live line, signed in only | Database cards | Grows with every stage and stop | Rejected by the stage-publish plan's diff panel round 2 |
| Live notes (the live-notes plan) | Live line, signed in only | Copies from every worktree and origin | About one note per run, plus leaks | Rejected by its plan panel round 1 |
| Shape S, a clone-local store (the lead's hypothesis) | Republish | Snapshots in the main checkout | One file per plan | Rejected by all three runners: its coverage test proves no merge, and other clones go dark |
| Slots plus a static fallback (cand-1) | Live line, static when slots run out | Snapshots merged from the live version | 256 slots | Rejected: two paths, and a hand-copied read at every stage |
| A stage strip merged at the publish (cand-2) | Republish | Per-session files merged from the live version | Per-session files and full candidate pages | Rejected: the page and its files grow without bound |
| The page holds the parts (cand-3) | Republish | The page itself | A binding file, and output files named by digest | Picked, with eight repairs |

- The cross-judge was an Opus seat on blinded copies. The scores tied at 11 of 18 each, and it picked cand-3 because each of its defects is local to one rule (`docs/plans/artifacts/2026-10-18-live-notes/architect-d3/judge/answer.md`).
- The synthesis names each repair and its source, and what was rejected (`docs/plans/artifacts/2026-10-18-live-notes/architect-d3/synthesis.md`).
- The plan panel attacks these premises, which are the lead's own conclusions:
  - Composing onto the version the tool handed back, with every other part carried byte for byte, is the merge the Artifact tool asks for.
  - The transcript names the version this session last saw, so a lost publish stays due and a compaction loses nothing.
  - Carrying parts the lead has not read in full is allowed, because each is byte-identical to a version the tool counts as viewed.
  - History lines from this checkout alone, with anchor-only lines for plans it lacks, keep every hand-back link landing.
  - The part grammar, the transcript scan and the byte-for-byte carry came only from the Opus family, the Opus runner and the Opus judge.

## Evidence

### Requirements

- [ask] "Decide ... whether an unattended run republishes at each stage change." The owner "had to ask 'artifact?' after seven hours without a republish."
- [ask] "Decide whether the renderer leads with the plan a hand-back is for, or the reply links that plan's anchor." The earlier iteration built the lead, and every reply links the anchor.
- [ask] "The renderer and rule change in the shared source through the sync-pstack skill."
- [law] Every subject has one page (`.agents/pstack/rules/pages.md`). This plan changes that rule's other half: only `page-stop.mjs` starts from the published page, and it reads nothing in another run's part but its JSON.
- [law] The Artifact tool's contract. A publish needs a read of the page in this conversation first. After a refusal, the lead merges into the version handed back and never resends refused content unchanged. The refusal itself adds: "if, checked against that source, it genuinely already includes that version's changes, publish it again unchanged and it will go through" (`docs/plans/artifacts/2026-10-17-stage-publish/architect/artifact-refusals-a1.txt`, line 5). `force` needs the owner's word about that exact version.
- [law] The Autopilot rule stops on deleting data the run did not create. A part only folds, and the run deletes nothing.
- [law] The Calls rule: a page publish goes out with the next working call.

### Earlier critical findings

The live-notes plan's panel round 1 left these critical findings open (`docs/plans/artifacts/2026-10-18-live-notes/panel-p1/synthesis.md`, and that plan's decision log at 2026-10-18T12:29:18Z). Each one, with what this plan expects to happen to it:

- **P1, a delete pinned at version 1 without a read; P2, a delete landing while its create fails; P3, notes of ended sessions; P4, one stale note voiding the cleanup batch; P11, no database on any real page.** No longer apply. The design writes no database.
- **P5, an unchanged re-render after a refusal.** Met. The next publish composes onto the version the tool handed back, so it carries that version's parts. When the tool still calls it identical, the tool's own wording allows one resend.
- **P6, squash dating; P7, mixed copies breaking the checks; P13, scans rewriting sibling indexes.** No longer apply. Nothing reads another worktree, and nothing is dated by git.
- **P8, anchors dying.** Met. Every page has History, and a folded part keeps its id on its line.
- **P9, a fallback that the beacon and reply never follow.** Met. There are no fallbacks, and the reply uses the URL the publish went to.
- **P10 and K8a, two rebinds giving two pages.** Narrowed. The binding file keeps one clone's worktrees on one page. Two clones that each make a page at once still end with two, as they did before this plan.
- **P12, a publish stuck behind a long call.** Met by the rule and the printed instruction: the publish goes first in the next message, and long calls start in the background.

### Measured

- Rendering plate-2's dnd page took 0.40 s and wrote 98 KB. `--index` took 18.5 s.
- `CLAUDE_CODE_SESSION_ID` is set in Bash, and a backward scan of this session's 58 MB transcript found the last Artifact publish and read with their results in 0.03 s (`docs/plans/artifacts/2026-10-18-live-notes/probes/seen-probe-a1.log`).
- Real refusal and read results, with the paths where they save the live version, are in `docs/plans/artifacts/2026-10-17-stage-publish/architect/artifact-refusals-a1.txt` and `artifact-results-a1.txt`.

## Steps

Phase 1 puts the parts in the page (steps 1 to 3). Keep rule: the suite passes on dotai `HEAD` plus this plan's change, and no test of notes, the deck, records, paging or the beacon remains.

- [ ] 1. Add `partsOf`, the composition, the strip, History anchors, per-part answers and the hash script to `plan-page.mjs`, and remove the data block and the deck. Proof: new tests fail on dotai `HEAD` and pass on the change:
  - `partsOf` round-trips a page, including a title holding `-->` and a body holding the text `<!--/part-->`; a page with no markers becomes one legacy part; a malformed marker becomes a legacy part, never a drop;
  - composing carries every other part byte-identical, replaces only this plan's part, folds an expired part into a line with the same id, and keeps exactly one `id="run-<slug>"` per plan;
  - a stop sets the lead, a stage keeps it, and a missing lead falls to the newest hand-back;
  - only the lead's part or a stop's part carries the subject's sections;
  - a plan the live page names but this checkout lacks keeps an anchor-only line, and drops it once this checkout's history shows the file deleted;
  - answer inputs carry the plan's slug, and the script binds per part;
  - a render without `live` matches this checkout alone.
- [ ] 2. Model the Artifact tool's version check and prove that no accepted publish drops a part. Proof: a test with a fake page store that accepts a publish only when it was built on the live version, and three sessions in sandbox worktrees that run scripted interleavings of stages, stops, refusals, a printed publish never sent, and a compaction that loses the lead's memory. After each accepted publish it checks that every plan's newest accepted part is present, that the lead is the newest stop's plan, and that each plan has one id. A mutation that drops one carried part makes it fail.
- [ ] 3. Rewrite `page-stop.mjs` as `stage` and `stop`, with the transcript scan, the due check, the digest-named output and the binding file, and remove `page-live.mjs`, `beacon`, `--own` and `--no-db`. Proof: new tests fail on `HEAD` and pass on the change, on fixture transcripts built from the real results:
  - a publish that went through, a refusal with its saved file, an "identical content" refusal pointing back, a read, a refusal without a version, unknown wording read as unseen, and another page's URL ignored;
  - a 450 MB synthetic transcript is found from its tail, with its time logged;
  - `stage` is due on every changed field and on a missing part, prints nothing when nothing moved, and stays due after a publish that never went out;
  - `stop` prints the publish and the reply, and on a refused page prints no publish;
  - the binding file wins while origin's line names the replaced URL, and loses once origin's line moves;
  - the session and `CLAUDECODE` refusals stay, and `HELPER_FILES` no longer lists `page-live.mjs`.

Phase 2 rewrites the rules (step 4).

- [ ] 4. Rewrite `rules/pages.md`, the block's Calls and Plan pages bullets, the plan-page `SKILL.md`'s Render steps 7 and 8, `references/shape.md` and `rules/land.md`. Proof: a sentence diff of the rendered rule files and block, from dotai `HEAD`, lists only these changes: a stage publishes, the publish goes first and long calls run in the background, a refusal reruns the command, only the helper starts from the published page, the binding file, Parts in place of Live line and Other runs, and `stage` in place of `beacon`. The push block stays within its 29,300-byte budget.

Phase 3 lands it (steps 5 to 7).

- [ ] 5. Render every plan in plate-2 and Ellie with the old and new renderer, and diff the refusals and bodies. Time `stage`'s path with nothing to send on the largest transcript, and `render` with a live page on dnd and on the largest live page. Publish the old and new render of one real plan for the owner to compare. Then run the diff panel and apply its fixes. Smoke plate-2 with the intended behavior written first, push dotai, sync plate-2 and Ellie, and run `verify` on each. Run this together with steps 7 and 8 of `docs/plans/2026-10-17-subject-page-lead.md`. Proof:
  - the corpus logs show no plan newly refused;
  - the only body changes are the markers, the strip, History on brief pages, the per-part answers, the scripts and the removed deck;
  - the timing logs;
  - each round's findings and fixes, the smoke logs, the dotai commits, the Ellie commit and the plate-2 commit that `land.mjs` pushes, all in the run directory or the repositories.
- [ ] 6. Smoke two sessions on the scratch page https://claude.ai/artifact/6SENDve2jbjWH6paycxRt5: this session publishes a stage, a second Claude Code session started through `cross.mjs` publishes a stop, and this session's next stage is refused, runs again and goes through. Proof: every Artifact result saved, the second session's part byte-identical in this session's file, and a final read.
- [ ] 7. Run this run's last stop through the new path on the plan-page page, then one stage publish. Proof: the saved results and the two rendered files.

## Proof

- **Tests in dotai** prove the part grammar, the composition, the lead, the anchors, the scripts' per-part binding, the transcript scan, the due check and the binding file.
- **The version-check model** proves that no accepted publish drops a part across three sessions.
- **The corpus renders** prove real plans read right and none is newly refused.
- **The two-session smoke** proves a refusal and a rebuild against the real Artifact tool.
- **The real plan-page page** proves one stop and one stage publish end to end.
- **The smoke** proves routing only.

## Open work

- Look once at the plan-page page while signed in, after step 7: a `#run-<slug>` link opens a folded part and scrolls to it, a half-typed answer survives a stage publish, and comments survive several publishes. owner: the owner. stop: that look, or the first comment about the page. Tracked on this plan's page.
