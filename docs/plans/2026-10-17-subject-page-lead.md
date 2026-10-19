# Lead a subject page with the plan it hands back

Status: superseded: by docs/plans/2026-10-17-stage-publish.md after review round 6, then by docs/plans/2026-10-18-page-files.md, which built the lead by hand-back number
Topic: plan-page
Playbook: plan

Verdict: Pursue. A subject page leads with its newest open iteration whichever plan renders it, so one stale open plan leads the page of every later hand-back on its subject. All 12 executed plans checked on the dnd, pstack and plan-page subjects render a page led by another plan, and the three plans that lead them are dated 2026-10-05, 2026-10-07 and 2026-10-13 and still open. The plan passed to the renderer is the plan the hand-back is for, so it leads; every other iteration's open questions still show under Needs you. The task also asks whether an unattended run republishes at each stage change. Review rounds 4 and 5 killed both guards the build tried, and round 6 found that the "no" left after them answered that question by revert, not on its merits, so the stage publish moved to its own plan, `docs/plans/2026-10-17-stage-publish.md`, which this run builds next.

## Brief

### What will change?

When a run hands you work, its page now opens with that run's plan, not an older plan still waiting on you. Other plans' questions and waits still show under Needs you. Stage updates moved to the next plan.

### What could go wrong?

If two runs share a topic, the page opens with whichever published last. A publish shows only its own copy's plans, so it can hide another run's questions, as before; the next plan fixes that.

## Teach

A subject page is one web page per topic, such as drag and drop. Each plan for that topic adds to it. When a run finishes, it publishes the page and sends you the link.

Today the page always opens with the newest plan that is still open, whichever run publishes it. So one old plan still waiting on an answer opens every later hand-back's page. I checked 12 recent hand-backs on three topics, and all 12 opened on another run's plan.

Now the page opens with the plan the run hands back. Other plans' questions, and what they wait on, still show under Needs you. Updating the page at each stage of a long run is the next plan's job, because an update over another run's newer page can hide that run's questions.

## Main changes

- The plan passed to `plan-page.mjs` leads its subject's page, and the header names it, because a hand-back is for that plan. Needs you still lists every other iteration's open questions under its plan's name. `--rail` reports the passed plan's own rail, so pstack-pulse shows each session's plan, and drops `leadingPlan`, which now always equals `requestedPlan`.
- `--index` renders each subject led by its newest open iteration, or its newest iteration when none is open, as every render did before.
- Needs you parses each Open questions section on its own, and the plain-words and Defaults checks read every section of their title.
- On a page with a brief, Needs you also shows each other open iteration's `Status:` sentence under its plan's name, because a Status holds the asks that are not decisions, such as a commit or a push. Another iteration's lines without a `###` heading now follow the question cards instead of preceding them.
- The stage line that `append` prints names every stage a batch enters, such as `Stage: Build, then Writing`, where it named only a changed last stage before.
- A Codex session copies the printed file into its run directory, names that copy in a progress message or its reply, and the lead renders the plan again before it publishes, because a later render on the subject rewrites the printed file.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which plan a subject page opens with | The plan the run hands back (look) | The newest open plan, as today; the plan with the latest log entry; a link to the plan's spot on today's page | newest open | big |
| When a run updates its page mid-run | At each new stage too, built next by the stage-publish plan so it keeps another run's newer page (look) | Only at stops and new questions, as before this run | stops only | small |
| Which plan the local topic index opens each page with | The newest open plan, as today | The newest plan | newest | detail |
| Design round before the build | Build now; four options were already compared | Run a design bakeoff first | architect | detail |
| Where the plan-page topic's page lives | A new page at https://claude.ai/artifact/KUhUAAaj8o4Ud8UeXjbh7w, because https://claude.ai/artifact/QLPuWXTpAuCKDdhm6jX34Z no longer opens | Drop the new page and keep the old link | drop new page | detail |
| When Ellie gets the change | After the session now editing Ellie's copy lands | Now, alongside that session | write now | detail |
| When the decision-trail review runs | Before the dotai push, as close.md says for a changed shared script (look) | After the push, apply and verify, as sync-pstack Lesson step 1 lists; suggested task t_bb8d837e settles the two | review after push | detail |
| Fixes the smoke found after the third panel round | A fourth diff round, after a build row restarts the round count, because the panel rule gives a change made for another reason its own review | No fourth round, reading the three-round cap as final | no fourth round | small |

## Outcome

The owner opens a hand-back link and sees the plan that run handed back first: its brief, rail, status, demo and close.

## Scope

- In: the dotai renderer `skills/sync-pstack/assets/pstack/plan-page.mjs` and its tests in `skills/sync-pstack/scripts/sync-pstack.test.mjs`, the stage line in `skills/sync-pstack/assets/pstack/decisions-check.mjs`, which keeps its wording from before this run and now names every stage a batch enters, the review-phase helper in `skills/sync-pstack/assets/pstack/status.mjs`, the shared rule `skills/sync-pstack/assets/pstack/rules/pages.md`, the plan-page skill's `SKILL.md` and `references/shape.md`, sync-pstack's `references/interview.md`, and the synced copies in plate-2 and Ellie.
- Out: closing the stale open plans that lead pages today (`docs/plans/2026-10-05-plate-beside-pstack.md`, `docs/plans/2026-10-07-dnd-translucent-drag-image.md`, `docs/plans/2026-10-13-plan-page-pr-body.md`); their own owners close them. The plate checkout, which sits off its branch with uncommitted edits, so `sync` refuses it.

## Decisions

| Lane | Owner sees at hand-back | Pulse rail | Deterministic | Verdict |
| --- | --- | --- | --- | --- |
| Keep the newest open iteration leading | Another plan's brief, rail and status | Another plan's | Yes, one page per subject | Rejected: 12 of 12 hand-backs checked open on another plan |
| The passed plan leads | Its own brief, rail, status and close; other questions under Needs you | Its own | Yes, per rendered plan | Picked |
| The iteration whose log moved last leads | Usually its own, but another session's newer row wins | The subject's busiest plan | Yes | Rejected: a proxy for what the caller already passes |
| Keep the leader and link the plan's anchor | The same wrong header and brief; a brief page has no section for an executed plan to anchor | Another plan's | Yes | Rejected: whether claude.ai forwards a fragment is unverified, a guess |

- The one-page invariant came from 7923c7f (2026-10-02), when a subject page showed the whole topic with the open delta on top. Since 60d19c4 (2026-10-05) a page with a brief shows only the leading plan's sections, so the leader decides the whole page, and the invariant now hides the hand-back. 6a5ddf2's same-day order still decides the index and History.
- The build first published the page at each stage change, which 656de09 had cut to save bookkeeping turns. Review rounds 4 and 5 showed that a stage publish can replace another session's newer page. A render holds only its own checkout's plans, questions and frames, so a fresh render is not a merge. A guard that publishes a stage only over the run's own last version depends on the lead remembering that version, because the Artifact tool accepts the next publish once it has handed over the newer version, and a compaction erases that memory. A compare at stops that looks for missing plans misses a question added to a plan both checkouts hold. The panel rule allows each mechanism one replacement, so after round 5 the guard came out, and the stage publish with it. Review round 6 found that this answered the ask by revert: the panel rule says a mechanism the ask names is always needed, and the risk the revert cited applies to the stop publishes that remain. The run pivots to `docs/plans/2026-10-17-stage-publish.md`, and suggested task t_cfe36f32, which held that design, is dismissed.
- Round 6 also took out the read this run had added before a publish over another version, because publishing this checkout's render after that read resends refused content unchanged, which the Artifact tool's contract forbids. `rules/pages.md` is back to base's "never from the published page", and the stage-publish plan settles what any publish does when the tool reports a newer version.

## Evidence

### Requirements

- The task's ask, quoted: "Decide whether the renderer leads with the plan a hand-back is for, or the reply links that plan's anchor, and whether an unattended run republishes at each stage change."
- Every subject has one page, published at each hand-back, and the reply is its link alone (`.agents/pstack/rules/pages.md`).
- Needs you collects every iteration's open questions, so no change hides a question waiting on the owner (shape.md, Page order). It holds only the iterations on disk in the rendering checkout, as before this run; the stage-publish plan owns what a publish does over another checkout's newer page.

### Lanes

The Decisions table compares four lanes; the strongest deletion is the picked lane, which removes the newest-open search from every render but the index. The rail check reads plate-2's plans as of 2026-10-17, and Ellie's plans join the corpus render diff.

- Base leaders: `docs/plans/artifacts/2026-10-17-subject-page-lead/base-leaders-a1.log`, 12 of 12 executed plans led by another plan.

## Steps

- [x] 1. In dotai, make the passed plan lead its subject page, name it in the header, drop `leadingPlan` from `--rail`, and keep `--index` on the newest open iteration. Proof: the new tests fail on the old renderer and pass on the new one, and the whole sync-pstack test file passes. Done: the lead tests fail on `HEAD` and pass on the change (`tests-old-renderer-a2.log`, `tests-new-renderer-a2.log`), and all 302 tests pass after the third review round (`panel-r3/tests-full-r3-a1.log`).
- [x] 2. Make the stage line that `append` prints name every stage a batch enters, with its wording from before this run. Proof: a sandbox log whose batch enters a stage prints the line, a batch that leaves a stage and comes back prints it too, and a batch that stays in one stage prints none. Done: the tests "decisions-check append names the stage a batch moves the log into" and "decisions-check append names the stage when a batch leaves the stage and comes back to it" pass in the full file (`panel-r6/tests-full-r6-a1.log`, 308 of 308). The publish clause the build first added to the line came out after review round 5; the stage-publish plan, `docs/plans/2026-10-17-stage-publish.md`, owns any publish at a stage.
- [x] 3. Update `rules/pages.md`, the plan-page skill and its `references/shape.md` to the new lead. Proof: the sentences changed since base 4ed7591 are only the lead's and the Codex hand-back's. Done: `panel-r6/rules-diff-r6-a1.log` lists them after round 5 took out the stage publish and round 6 took out the read before a publish over another version.
- [x] 4. Render every plan in plate-2 and Ellie with the old and new renderer and diff the refusals and bodies. Proof: the diff log lists each page whose leader changed and each newly refused plan with why the lead rule refuses it. Done: plate-2 changes 162 subject pages and newly refuses one open plan rendered directly, which now owes its own brief; Ellie changes 14 pages and plate none (`corpus-plate-2-a2.log`, `corpus-ellie-a2.log`, `corpus-plate-a2.log`). The refactor after review changes no page in any of the three (`refactor-same-*-a1.log`).
- [x] 5. Render the dnd subject from `docs/plans/2026-10-15-list-move-landing.md` with both renderers, open the changed header and brief, and publish both for the owner to compare. Proof: both artifact links and the rendered files. Done: the old page opens on the 2026-10-07 plan's question (https://claude.ai/artifact/81meQ5vddA8JCkPBuHnL4J), the new one on the executed list-move plan, its rail, models and brief (https://claude.ai/artifact/AwDSY2fHsoR3n3jDqXaAVc); files `compare/dnd-old.html` and `compare/dnd-new.html`.
- [x] 6. Run one panel round on the helper diff and apply what it accepts. Proof: the round's rows in this plan's log. Done: three rounds ran, the cap, because rounds 1 and 2 each applied a critical; each round's seats, critical, warning and writing rows are in this plan's log, and round 3's two deferred warnings are suggested tasks t_110408eb and t_0e9b6d2c. After a build row restarted the count for the smoke's fixes, rounds 4 and 5 each applied a critical, and round 6 is that diff's last round; round 5's deferred warning is suggested task t_ae8ff5f1. Round 6 applied two criticals, the revert of the read before a publish over another version and the Status of other open plans under Needs you, and pivoted the third, the stage publish, to `docs/plans/2026-10-17-stage-publish.md`.
- [ ] 7. Smoke plate-2 in both runtimes, baseline and paired, with the intended behavior written first. Proof: the smoke logs and their sort rows.
- [ ] 8. Push dotai, sync Ellie and plate-2, and run `verify` on each. Proof: the dotai commit, the Ellie commit and plate-2's patch.
- [ ] 9. Run the decision-trail review, then land plate-2's patch and log the chip landed. Proof: the review's Attention section in Close and the ledger row.

## Proof

Tests in `skills/sync-pstack/scripts/sync-pstack.test.mjs` prove the render behavior. Corpus render diffs prove what changes on real pages. The smoke proves routing only.
