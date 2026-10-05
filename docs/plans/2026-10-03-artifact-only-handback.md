# The page is the only hand-back

Status: executed: dotai 0c75037 and 6a5ddf2 and ellie 1c50a58ea and b4eec582f are pushed; plate-2's sync, skill install and playbook edits are uncommitted for the owner.
Topic: plan-page

The owner asked "how did you forget artifact? we need to repair the skill?" after the `model` review ended with its verdict only in the terminal, then said "i do want an artifact for any topic plan, assume i never read claude outputs so my worfklow should work via artifact only". Pages exist only for plans today. A review verdict, a "next" answer and every playbook close end in a terminal reply, so the owner never sees them. This iteration makes the page the hand-back. Every stop that hands work to the owner publishes a page first, and the reply is the link alone.

## Main changes

- Every stop that hands work back publishes a page before it replies, and the reply holds only the link. A stop is a "next" answer, a review verdict, a plan written or revised, a build, bug fix, refactor, perf or babysit close, a blocked run's ask, and reflect's list awaiting approval. A question still goes to `AskUserQuestion` as well as Needs you.
- Topic work stays on its subject's page through the whole loop. "next" writes the chosen scope's iteration as `proposed`, with its prior-work summary and a question to review it. The verdict turns that iteration `planning`, waiting on "plan", for Pursue, `closed` for Stop, or `blocked` on the named evidence for Defer, and adds the call sites, the Defaults and the panel's rounds. "plan" continues the same file, and Build executes and folds it. Work with no subject writes a one-off plan file and gets its own page.
- A plan's `## Outcome` (built as `## Close`, because 45 plate-2 and 25 ellie plans already use Outcome for their goal) carries what the close reply carried: what landed, the proof and its limits, the done, skipped, blocked and open counts, reversals and deviations first, and open work with owners. The renderer shows the newest iteration's Close right after Needs you, open, even once that iteration is executed, until a newer one opens.
- `decisions-check.mjs` refuses a decision log under the plans directory that holds `panel` rows and has no plan beside it. That is how this run's two panel rounds stayed off every page.
- The block's Plan pages rule drops the reply content it lists today ("the page link, the panel's result for big work and the questions", and the execution close's extra report). Every reply that hands work back holds the page link alone. The Todo list and close, Blocked and reflect lines point their reports at the page.
- plate-2's playbooks gain the page step at each stop: api-review for "next" and the verdict, and Build, Bug fix, Perf issue and Refactoring for their close. Babysit already routes its questions and reply to the page; its wording moves into the shared rule.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| How the owner finds pages | The claude.ai artifact gallery, newest first; every stop republishes, so the latest page is on top | A pinned index page the renderer writes from the plans directory | index |
| Conversation replies | A direct question or one-file edit answered in the conversation stays in chat | Every reply gets a page | every reply |
| Questions | Needs you on the page, mirrored to `AskUserQuestion` | The page only | page only |
| "next" answers | The chosen scope's subject page, as a `proposed` iteration | A one-off page per "next" | one-off next |
| Stop and Defer verdicts | A `closed` or `blocked` iteration on the scope's page | No page | skip stop pages |
| Notification | None; gallery order shows the change | A push notification when Needs you gains a question | push |
| Codex sessions | Keep skipping pages; the lead republishes when the owner returns | Codex writes the page files and the next Claude session publishes them | codex pages |

## Steps

- [x] dotai, through sync-pstack's Lesson mode: the block's Plan pages, Todo list and close, Blocked and reflect lines; `skills/plan-page` Render triggers and the Outcome and loop-stage shapes in `references/shape.md`; the renderer leading with the newest Outcome; and the orphan-log refusal in `decisions-check.mjs`. Each refusal and behavior gets a test that fails on the old renderer or check. Proof: `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs` and the old-versus-new corpus diff over every managed project. Closed by dotai 0c75037, `node --test` 81 of 81, and the corpus rows in the decision log.
- [x] plate-2 playbooks: api-review, Build, Bug fix, Perf issue, Refactoring and Babysit. Proof: `sync-pstack playbook plate-2 <name>` for each, read in full. Closed by `sync-pstack playbook plate-2 <name>` for api-review, build, perf-issue, refactoring and babysit.
- [x] Paired trials per pstack's Eval playbook, baseline against revised in fresh read-only sessions: "next", "go <scope>" ending in a verdict, and a bug-fix close. A trial passes when the revised run names a page publish before its reply and the reply is the link alone, and the baseline does not. Closed by the baseline and revised-trial rows in `docs/plans/2026-10-03-artifact-only-handback.decisions.tsv`, logged partial because the runs were read-only.
- [x] `apply`, `verify` and the smoke in both runtimes; deliver dotai and ellie by push, and leave plate-2 uncommitted for the owner. Closed by `sync-pstack verify` exit 0 in plate-2 and ellie, and ellie 1c50a58ea.
- [x] Backfill topic stops that ended in the terminal: the `model` verdict is on https://claude.ai/artifact/UVZPkbkyn372oVZATQYYPg; list any other this session left. Closed by https://claude.ai/artifact/UVZPkbkyn372oVZATQYYPg; no other topic stop in this session ended in the terminal.

## Proof

- The renderer and check tests, each failing first on the old copy for its named defect.
- The corpus diff: the plans each project's renderer newly refuses or renders differently, listed with owners.
- The paired trials' transcripts and verdicts, in scratch.
- The smoke answers from both runtimes.

## Close

- Reversal: the close report section is `## Close`, not the `## Outcome` this plan approved, because 45 plate-2 and 25 ellie plans already use Outcome for their goal.
- No arena or architect ran, and the panel round had zero of three seats: you stopped them and picked "Build without panel". The Defaults' alternatives were never argued out.
- Landed in dotai 0c75037 and 6a5ddf2, pushed: the block's hand-back rule, the plan-page skill's triggers and Close shape, the renderer's Close and Needs you from the leading iteration, the `--folded` Close refusal, the decisions-check refusal of a panel row with no plan beside its log, a validate-skills check for a stray quote in quoted frontmatter, and same-day iterations ordered by their decision log's latest row. This Close needed that last fix to reach the top of its own page.
- Landed in ellie 1c50a58ea and b4eec582f, pushed: the synced block, helpers and skill. plate-2 holds the synced block, helpers and skill and edits to five playbooks (api-review, build, perf-issue, refactoring, babysit), uncommitted for you.
- Proof: dotai tests pass 82 of 82, and each new behavior fails on the old helpers. Across all 3141 plans in plate-2 and ellie, the new renderer refuses nothing new and changes 15 pages, which only reorder their same-day iterations. In the paired trials, the three baseline Claude runs reply with content, and the revised runs load plan-page, say they would write and publish the page, and reply with the link alone. `sync-pstack verify` passes in both projects.
- Limits: the trials were read-only, so no fresh session has yet published a page under the new rule. Codex sessions still reply in chat, as the Codex default picks.
- Trail review (gpt-6.1-sol) raised four flags, all fixed: the skill's broken YAML, Needs you hidden once a plan executes, chat answers carrying topic news, and an overstated trial row. Three pushed commit bodies (ellie 1c50a58ea, dotai 6a5ddf2, ellie b4eec582f) skipped their unslop pass; the audits found them accurate, and b4eec582f has a stray space before a comma.
- Counts: 5 steps, 5 done, 0 skipped, 0 blocked, 0 open.
- Open work: a fresh session's first real hand-back should be checked on its page. owner: zbeyens, tracked in `docs/plans/topics/plan-page.md` Open work.

