# A panel cannot wave off an old bug in what the ask names

Status: done: dotai and ellie pushed; plate-2 waits on the owner's commit
Topic: pstack
Playbook: verdict

Suggested task `t_c50c7700`, carded by a `/chips all` sweep: "Decide in the Panel review rule whether such a dismissal must keep the law sentence true or state the limit, when a critical that survives three rounds escalates, and whether seat briefs quote the ask's named mechanisms as invariants a scope dismissal cannot cover. The rule's shared source changes through the sync-pstack skill's Lesson mode."

Verdict: Pursue. A finding's age says who caused it, not whether the ask needs it fixed, and the Panel review rule gives a real critical finding outside the ask no honest outcome: it forbids deferring one, so the list landing run logged a known hole in the move guard as dismissed four times and left the Vision sentence it breaks unqualified.

## Brief

### What will change?

Reviews can no longer wave off a serious bug for predating the task. A bug in what you asked for, or one the run causes, gets fixed. Others stay open with an owner, and the docs they break say so. It's live in dotai and ellie. plate-2 has it too, waiting for your commit.

### What could go wrong?

A run may now switch into a large fix the reviewers found in what you asked for, which costs hours. The lead still judges what your ask covers, but against your own words, which reviewer briefs now quote. Until that fix lands, a Vision or doc sentence the bug breaks still promises what the code doesn't do, and `t_cba6027b` decides whether it should say so. The trial runs showed how agents read the rule, not that they'll follow it.

## Teach

When a panel of reviewers finds a serious bug, the lead must fix it or prove it is not a real bug. It may not push it to later.

Today the lead can also wave a serious bug off as outside the ask when the bug is older than the task. In the list landing run, the lead did that four times for one bug in the move guard, the very thing the task named, while a vision sentence still promised the guard catches it.

After this change, a serious bug in what the ask promised, or one the run causes, gets fixed, or the run switches to fixing it, whatever its age. Any other real one stays open with an owner, and every sentence it makes false says so. Reviewer briefs list each outcome your ask states in your own words, so the lead cannot shrink it later. When reviewers raise a bug again, your page flags it red.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| An old serious bug in what you asked for | Fixed now, or the run switches to fixing it (look) | Handed to a later task, as the list landing run did | hand it off | big |
| An old serious bug outside what you asked for | Kept open with an owner, and each sentence it breaks says so | Waved off, as today | wave off | big |
| When a disputed bug flags red | The first time reviewers raise it again | After three rounds, as the task suggested | three rounds | small |
| Stopping the run on a disputed bug | No, it flags red and the run goes on, since runs stop only for releases, pushes to main and deletes | Stop and ask you | stop on dispute | small |
| Reviewer briefs | List each outcome your ask states, in your words, never narrow one later, and show later rounds every serious bug the lead waved off or left open | Leave briefs as they are, since they already mark what you asked for | keep briefs | small |
| Who decides a disputed bug | You, while the lead's pick stands and the run goes on | A reviewer raising it again flips the pick to fixing it, which lets a reviewer widen your ask | flip on re-raise | small |
| A check on the words in the log | None; the refusal message now points to keeping the bug open instead | Refuse the words outside the ask, which a lead dodges by rewording | word check | detail |
| Review of this change | Panel rounds on the change up to the cap, a smoke in plate-2 and ellie, then the trail review | Skip the panel, since it is rule text | skip panel | detail |
| Syncing plate | Waits for its own run, since it carries older changes and opens a public PR | Sync it now | sync plate | detail |

## Main changes

- **A critical finding's age is not scope.** Under the Panel review rule in `.agents/pstack/rules/panel.md`, the lead dismisses a critical finding only on the proof the rule already asks for, that the case is no defect or is rare, never because it lies outside the ask or predates the run. A no-defect dismissal may instead quote a law line that requires the case's behavior, older than the run or one the ask has the run write, when the case meets every outcome the ask states; a line that only permits it never excuses a case that worked on the base. The user's typed ask includes the task text of the card or brief that started the session. The lead applies a critical, or pivots the run to it, unless three conditions hold. The seat's own case fails the same way on the run's base, and the run neither causes it, worsens it nor exposes more of it. It breaks no outcome the ask states, nor a property the ask gives a mechanism it asks the run to change. It shows no requirement of the run's own design unmet in the Autopilot rule's sense. The lead judges this against the verbatim ask, never a brief's tags. Only such a finding stays `open`, with `patch: none`, `owner:`, `stop:`, the lines it limits, `proof: none` and the base run, and its case reruns on the built tree before the first diff round. Each law line, doc sentence or claim it makes false, found by searching for its predicate and paraphrases, states the limit in the same change; law files and plans also name the owner. The finding's Defaults row is rated `look`, or `answer` once a later round or the decision-trail review raises it again, and the pick stays `open` for the owner to decide. Only a finding that meets all three conditions gets that `open` pick, however often it is raised, and a dismissed critical raised again keeps its dismissal as the pick of the same `answer` row. A pivot writes a new plan iteration with its own log and rounds, and the old log points at it. A finding's row waits for the work its result claims: a fix and its reproduction, a dismissal's proof, or what the rule that leaves it open asks for first. At the round cap, a critical the lead must apply is applied or pivots, the replacement loop and the finished-removal route apply only to such a critical, and a finished removal's later finding of that kind pivots instead of narrowing.
- **Briefs quote what the ask states.** Every seat brief lists each outcome the typed ask states, and each property it gives a mechanism it asks the run to change or settle, as an `[ask]` invariant in the ask's words, and a later round's brief never narrows one. A later round's brief also lists each earlier critical the lead dismissed or left `open`, with its reason, for the seats to attack.
- **Review can finish with an open critical.** The Review rule fixes the real criticals the Panel review rule does not leave `open`, and stops once every remaining one is dismissed on that rule's proof or left `open` as it allows.
- **Trail criticals follow the same rule.** `close.md` sends every critical the decision-trail review raises through the Panel review rule, not only one about code. A critical that says only that the log misstates the transcript is dismissed only on the transcript line that refutes it, and is otherwise corrected; one that disputes a product finding's logged outcome is that finding raised again.
- **The refusals name the open route.** When `decisions-check.mjs` refuses a deferred critical row, its message now says to apply it or pivot the run to it, dismiss it on proof that it is no defect or is rare, or, when the three open conditions hold, log it `open` with `patch: none`, `owner:`, `stop:`, the lines it limits and `proof: none`. The old message said "applied or dismissed", which steered a real critical outside the ask into a dismissal. The cap refusal names `stop:`, dismissal on proof, and a diff's next gate.

## Evidence

Model: claude-opus-5-5 @xhigh.

### Requirements

- The task's three questions, quoted above.
- The Panel review rule's lesson from dotai `76376b4` (2026-10-02): a critical finding is never deferred. This change partly reverses it: a critical that meets the three conditions now waits on an owner as `open`, beside the two `open` cases the rule already had, the round cap and a finished removal. The status word `deferred` stays refused.
- The Autopilot rule: a finding that the accepted design cannot meet a requirement pivots the run and never waits in Open work, a suggested task or a deferred row.
- The Plan pages rule: an option that leaves the user's stated goal unmet is never a default, and only the Autopilot stops go under Open questions.
- `decisions-check.mjs append` refuses an `open` panel row without `patch:` and `owner:`.

### What happened

- The move-landing log `docs/plans/2026-10-15-move-landing-guard.decisions.tsv` dismissed one critical, a correction that deletes moved text beside identical text slipping past the move guard, as outside the ask in plan rounds 1, 2 and 3 and after the trail review (its rows 13, 23, 29 and 47 after the header). Every round's two Codex seats raised it, and round 3's seats said the ask's guard outcome needs it fixed whatever its age.
- That run's seat brief tagged the guard's outcome as the ask's own invariant: "[ask] A move that re-bases depths has its guard settled: the guard refuses any change to the moved content other than what a plugin declares to follow the drop" (`docs/plans/artifacts/2026-10-15-move-landing-guard/trail/prompt.md`, Invariants to attack, 1). That brief happened to do what the task's third question asks, and the dismissal ignored it; the rule did not require it, so panel round 1 showed a later brief could narrow it.
- The trail reviewer: "Pre-existence establishes attribution; it does not satisfy the requested guard outcome" (`docs/plans/artifacts/2026-10-15-move-landing-guard/trail/answer.md`). The reflect reviewers routed the same lesson to this rule (`docs/plans/artifacts/2026-10-15-move-landing-guard/reflect/answer.md`, Judgment 1 to 3 and 6, Divergent 3).
- The hole was fixed later by the text-move landing plan, which carried `t_33ab69a9` through `t_8b0aa6dc`, and `docs/vision/plite.md` now says the guard reads the landing through the update's own steps. Until then the Vision sentence promised what the code did not do.
- The rows 39 and 40 dismissals of that run, "the ask does not reach a move that carries no characters", are the same scope argument in other words, and the trail review flagged them as a warning.

### Lanes

| Lane | Verdict |
| --- | --- |
| Keep the rule and rely on the decision-trail review | Stop. The trail review rejected the scope argument in both plans of that run, and the lead dismissed it again, because the rule forbids deferring a critical and offers no other honest outcome. |
| Delete "never deferred", so a critical defers like a warning | Stop. It reverses the 2026-10-02 lesson and lets a critical in what the ask names wait in a suggested task, which the Autopilot rule forbids. |
| Allow the scope dismissal but make the law state the limit | Stop alone. Narrowing the law does not deliver an ask that names the mechanism, which the first plan's trail review said of that run's narrowed guard sentence. Kept as the outcome for a critical outside the ask. |
| Age is not scope: a critical is applied or pivots unless it fails the same way on the base, breaks no outcome the ask states and leaves no requirement unmet; that one stays open with the limit stated, and a repeat raise rates its row answer | Pursue. It uses the `open` grammar the helper already checks, and the trails rule already words every commit body and PR claim an `open` finding contests as open. |
| Stop the run under Open questions when a finding is raised again | Stop. The Autopilot rule keeps runs going except for releases, pushes to `main`, force-pushes and deletes; an `answer` row is published at once. |
| A check that refuses a critical row dismissed as outside the ask | Stop. A text match trains rewording; the refusal message for a deferred critical now names the `open` route instead. |
| Seat briefs list the ask's named mechanisms | Pursue, added after panel round 1. All three seats showed that a test on the brief's tags lets a lead tag a requirement `[law]` or narrow its `[ask]` paraphrase in a later round, so briefs now list each outcome the ask states, and each property it gives a mechanism it asks the run to change, in the ask's words, and the test reads the verbatim ask. |

### Escalation timing

A re-review checks only what changed, so a seat that raises a logged finding again has read the lead's reason and rejected it. Waiting for three rounds puts the escalation at the plan's round cap, after the plan is frozen for its build, which is where that run's critical sat as a `look` row.

## Steps

- [x] 1. Write the verdict and this plan. Proof: this file and `docs/plans/2026-10-17-panel-scope-dismissal.decisions.tsv`.
- [x] 2. Edit `panel.md` and the `decisions-check.mjs` refusal message in the dotai checkout, after the retired-policy search. Proof: `docs/plans/artifacts/2026-10-17-panel-scope-dismissal/retired-search-a2.log` and the saved dotai patch `dotai-a7.patch`.
- [x] 3. Run `deslop` and `no-comments` on the helper message and `unslop` on the rule and this plan. Proof: the writing rows.
- [x] 4. Run dotai's suite, `validate-skills` and `corpus` on plate-2 and ellie. Proof: `docs/plans/artifacts/2026-10-17-panel-scope-dismissal/proof/dotai-suite-a5.log`, `docs/plans/artifacts/2026-10-17-panel-scope-dismissal/proof/validate-skills-a6.log` and the corpus verify row.
- [x] 5. Run panel rounds on the dotai diff, up to the cap, and apply what each accepts. Proof: the panel rows. The seats' answers are in `docs/plans/artifacts/2026-10-17-panel-scope-dismissal/panel/r1/`, `docs/plans/artifacts/2026-10-17-panel-scope-dismissal/panel/r2/` and `docs/plans/artifacts/2026-10-17-panel-scope-dismissal/panel/r3/`.
- [x] 6. Smoke plate-2 and ellie from the uncommitted tree, against intended behavior written before any trial. Proof: `docs/plans/artifacts/2026-10-17-panel-scope-dismissal/smoke/new-plate-2-a3.md`, `docs/plans/artifacts/2026-10-17-panel-scope-dismissal/smoke/new-ellie-a3.md` and the judge rows.
- [x] 7. Commit dotai, run the decision-trail review and apply its findings, then push dotai. Proof: the commit, the reviewer's answer and the push. dotai `7ab75fc` and `0d84845`, `docs/plans/artifacts/2026-10-17-panel-scope-dismissal/trail/sol.md` and the delivery row.
- [x] 8. Sync ellie from the pushed commit and land plate-2's copy as a patch in its working tree. Proof: the ellie commit, the patch and `sync-pstack verify` on both. ellie `44fac92`, `docs/plans/artifacts/chips/t_c50c7700.patch`, `docs/plans/artifacts/2026-10-17-panel-scope-dismissal/sync/ellie-verify-a1.log` and `docs/plans/artifacts/2026-10-17-panel-scope-dismissal/sync/plate-2-verify-a1.log`.


## Close

Reversals and deviations first.

- This change partly reverses dotai `76376b4`'s lesson that a critical finding is never deferred. The word `deferred` stays refused, but a critical finding that meets the three conditions now waits on an owner as `open`. Design row 5 first called it no reversal, and a later design row corrected that.
- After panel round 1, the plan's own Defaults pick flipped, so seat briefs now list what the ask states in its own words, instead of staying as they were.
- The first `panel.md` and `decisions-check.mjs` edits ran a minute before the verdict and this plan were written, and panel round 1 launched before the first test and validation results were read, both of which failed, and before `corpus` first ran. Later passing reruns repair the proof, not the order. The deviation rows record both.
- Another session's chore commit, dotai `b9c1ed1`, committed and pushed this run's round 3 rule text before the smoke and the decision-trail review, which the Lesson order puts first. The run kept that commit, since reverting it would undo that session's own edits and no project had synced from it.
- The smoke named clashes after the panel's cap. The lead fixed four sentences with no further panel round: when a finding's row is appended, what condition 3 exempts, why a re-raise rates `answer`, and that only a finding meeting all three conditions keeps the re-raise row's `open` pick. The smoke reran after each fix. The decision-trail review covered the first three, in `b9c1ed1` and `7ab75fc`; the fourth, `0d84845`, came after it.
- The text written after the compaction got its `unslop` pass only after the trail review flagged it. The pass left the rule and guide sentences as smoked and rewrote the fix commit's body, amended from `5d43a63` to `7ab75fc` with the same tree before the push.

What landed:

- dotai [`b9c1ed1`](https://github.com/udecode/dotai/commit/b9c1ed1a6a6b4e3fdb41c0f501d180f47b78d881), [`7ab75fc`](https://github.com/udecode/dotai/commit/7ab75fc30f7aaf6eed333ad2ab43adbf3f1e3a84) and [`0d84845`](https://github.com/udecode/dotai/commit/0d8484581dcbbb236cd8a2cb86fd2543446f5867) change the Panel review rule, the Review rule, one decision-trail sentence in the close rule and two refusal messages in `decisions-check.mjs`, as Main changes says.
- ellie [`44fac92`](https://github.com/InformedMedical/ellie/commit/44fac92d148985516a77e1d41a3fee9632068fda) syncs from `0d84845` and adds one sentence to its workflow guide.
- plate-2 gets the sync as an uncommitted patch in its working tree, `docs/plans/artifacts/chips/t_c50c7700.patch`, with this plan, its log and the subject fold. plate-2's workflow guide needed no edit, since it sends readers to the panel rules.
- Both projects synced from a detached dotai worktree at `0d84845`, because the shared dotai checkout held other sessions' uncommitted asset edits that `apply` would have rendered.

Proof and its limits:

- This run's dotai commits pass dotai's suite, 290 of 290, and `validate-skills` alone in a detached worktree. The shared checkout with other sessions' edits passed 297 of 297 before the last fix, then failed two of their Stage message tests mid-edit, then passed 300 of 300. `corpus` showed no difference in plate-2 or ellie, before the change and again right before each sync.
- Three panel rounds on the dotai diff, each with Opus, gpt-6-astra and gpt-6.1-sol at xhigh, raised fourteen critical findings, and the lead applied every one.
- The smoke ran prompts A and B in Claude Code and Codex in plate-2 and ellie, and prompt Ad, prompt A with the guard's property worded as the card worded it, in plate-2. The baseline dismissed B's old bug as outside the ask in all four answers. The final run, on exports byte-identical to what each project ships, passes every required part in both runtimes.
- A3 gets only partial credit: during a pivot, the false Vision line stays as written until the pivot's build makes it true, and an owner's hold before that build leaves it unqualified. `t_cba6027b` decides that.
- Prompt Ad shows the final rule handles the card's descriptive wording, but the baseline also fixes or pivots on it, and no arm renders round 2's text, so no smoke shows that round 2's text failed it.
- The revised arms carry other sessions' instruction edits that the baseline arms lack, so the pair shows how the shipped tree reads, not which change caused each answer. A search of those edits finds no panel, critical or dismissal wording, so the run infers this change caused them.
- The rule is text that agents read, so the smoke shows how it is read, not that a later run follows it.

Counts: 8 of 8 steps done.

Attention, from the decision-trail review:

reviewed by gpt-6.1-sol @xhigh

- warning: A3 remains a known gap, and the final verified rows should keep that limit. The A3 gap row keeps it, and `t_cba6027b` owns it.
- warning: round 3's "states" critical had no reproduction that exercised it, since prompt A says "must refuse". Prompt Ad now exercises the descriptive wording, with the limit above.
- warning: the final comparison does not isolate this change, and the trail snapshot did not freeze other sessions' instruction files. The limit is stated above.
- warning: the "plan written" and "built" rows reverse the actual order of the first edits and the plan. A deviation row records it.
- warning: panel round 1 ran before the first tests passed and before `corpus` ran. A deviation row records it.
- warning: the text written after the compaction had no writing pass. The pass ran, and the commit body changed.

Open work:

- plate-2's sync, this plan, its log, the subject fold and the ledger rows wait on the owner's commit. owner: zbeyens. stop: the owner commits them.
- plate syncs this change at its own next sync, which also opens its PR. owner: zbeyens. stop: plate's next sync.
- `t_cba6027b` decides whether a pivot that stops before its build states its limit, `t_7b084db3` whether fixes made after a panel cap get a panel round, `t_0647e245` adds a helper check that refuses a deferred decision-trail critical, and `t_9682d488` splits the Panel review rule into short labeled bullets. owner: zbeyens. stop: the owner starts or drops each. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- Other sessions' dotai edits to the plan-page renderer, the Stage message and the interview reference landed as dotai [`c15b13f`](https://github.com/udecode/dotai/commit/c15b13fba4daf8c06fad455a398c8c5dad71c424) once they passed 300 of 300 and `validate-skills`, as dotai's `AGENTS.md` asks; ellie and plate-2 get them at their next sync. owner: zbeyens. stop: the next sync of each project.
