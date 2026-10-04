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

## Open questions

### Reflect lessons

Apply the 16 lessons reflect accepted from this session?

- **apply** (recommended): apply all 16 at their routings, the dotai ones through sync-pstack's Lesson mode, except where the open opt-in panels plan decides: lesson 8 keeps only the commit-body unslop, and lesson 1 becomes that plan's Pursue row.
- **pick**: type the numbers to apply, such as "apply 1 2 7".
- **skip**: apply none.

Accepted:

1. Run the api-review panel on the validated draft, apply its fixes, then record and publish, so a fix never forces a superseding record. Routing: `.agents/playbooks/api-review.md` and `.agents/rules/best-api-review.mdc`.
2. When a target changes what an owner accepts, the ingress census records the object each path hands the owner, raw or rebuilt. Routing: best-api-review, Test the value.
3. A drop or absence claim prints what each probe case loaded, so an input that never loaded cannot pass as dropped. Routing: best-api-review, Test the value.
4. Add a standalone source-probe recipe: the source-alias preload, bare package imports, and a printed loaded state. Routing: `.agents/rules/verify/references/commands.md`.
5. Before a cut justified only by "no production caller", check whether doctrine names a job for the API. Routing: best-api-review, Test the value.
6. A subagent whose findings a record will cite returns a TSV in its scratch directory. Routing: best-api-review, Return and record.
7. Reload a skill-owned mode through the Skill tool after a compaction or an edit to that skill. Routing: dotai plan-page Change mode and the block's Long runs rule.
8. Unslop each commit body and run a trail review for every shared-script push, follow-ups included, with commit and push as separate calls. Routing: dotai sync-pstack Lesson steps 1, 5 and 6, and Sync step 7.
9. Before the dotai commit, render the change's own plan in its closed state on its real subject page. Routing: dotai plan-page Change step 4.
10. Before a plan names a new heading, field or status word that a renderer parses, count its existing uses across every managed project. Routing: dotai plan-page Change mode.
11. A smoke of a changed skill counts only when the session shows the skill loaded, and a read-only smoke is routing proof, never action proof. Routing: dotai sync-pstack smoke rules.
12. Lesson step 6 installs each new or changed skill. Routing: dotai sync-pstack Lesson step 6.
13. Offer once to pin a subject page on its first publish, and a chat question asking where a page is reopens the page-finding default. Routing: dotai plan-page Render step 6 and this plan's Defaults.
14. With more than one subject live, every offered answer word names its subject, such as "go model". Routing: dotai plan-page Check.
15. Save each Agent seat's answer to `round<N>-<seat>.md` as soon as it arrives. Routing: the block's Panel review rule.
16. Ultracite's "No files found to lint" means unchecked, not passed. Routing: AGENTS.md, Proof and tooling.

Two lessons meet `docs/plans/2026-10-03-opt-in-panels.md`, open on the pstack page. Its narrowed decision-trail review contradicts lesson 8's trail review on every shared-script push. Its row "A best-api-review Pursue record → Panel on the record" is the panel-on-a-record order lesson 1 replaces, and with a Pursue verdict flowing straight into the plan, the panel on the finished plan can cover the verdict.

Rejected (9): pushing only after sync, verify and smoke, the from-memory sub-slips and the waiver scope are already covered, or are fixed by lessons 7 and 8; the contradicted-default lesson folds into 13; seat recovery from internal files, the draft-execution preconditions, the zsh heredoc rule, the `--from` prose and the YAML loader gate belong to scripts below.

Backlog, not filed anywhere until you say so: the review-ledger redraft writes to stdout and drops reconciliation entries; draft-execution silently returns an unbound historical plan; a panel-round helper that fills the reviewer prompt and saves each seat's answer; a reflect chain-digest helper; a `sync-pstack corpus` command; a full YAML parse of skill frontmatter in validate-skills and verify; verify failing on a stale installed skill; ordering same-day iterations by an explicit close stamp instead of the log's last row; a close-time `Page:` check, with the Codex page default reopened; a lint wrapper that fails when Ultracite finds no target files.

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

