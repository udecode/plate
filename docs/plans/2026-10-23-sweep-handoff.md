---
review_scopes: [proof]
review_basis: []
work_kind: workflow
review_commit: fc8d0eb88eb22808cf48d33787299e9fb8ee1117
review_inputs: [.agents/rules/verify/references/sweep.md, tooling/scripts/page-health.mjs, tooling/scripts/page-health.test.mjs, docs/plans/2026-10-15-regression-sweep.md, docs/plans/2026-10-19-sweep-r1.md, AGENTS.md, .agents/playbooks/bug-fix.md, docs/plans/topics/proof.md]
---

# Sweep: page tiers R1 to R5, a tester and a fixer, one task per domain

Status: executed: the handoff is written and smoked; its first real run waits on natamox's next filed domain
Playbook: build

## Brief

### What will change?

Page tiers are now R1 to R5, so P0 to P3 only ever means how urgent a bug is. natamox tests the pages, groups the bugs and files the issues. You fix them. Each filed domain shows up on your board as one task.

### What could go wrong?

Nobody has run the handoff between two people yet. If natamox's agent takes the task itself or skips the ledger push, the task stays on natamox's machine. The smoke runs only show that both agents read the rules right, and they ran on your setup, not natamox's.

## Teach

The sweep tests every beta page beside the page it should match. Pages sit in five tiers, from Slate examples to gaps against other editors. Each tested domain's bugs are grouped by cause and fixed in one run.

The tiers were called P1 to P5, the same names the task board uses for how urgent a bug is. So a crash on a new Plite example looked low priority, and fixes went in tier order. Nothing said who does which part, and the fixes reached the board as a pile of one-issue tasks.

Now the tiers are R1 to R5, and every priority is a board priority. natamox tests, groups and files. You fix and babysit. Filing a domain offers one task for it, and when that domain needs a formal check, the fix run builds the check first.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Page tier names | R1 to R5, and fixing is no tier at all (look) | Keep P1 to P6 | p tiers | big |
| Fix order | By how urgent the bug is, the lower tier first between equals (look) | Tier order, R1 first, as picked on 10-15 | tier order | big |
| Who does what | natamox tests, triages and files; you fix, babysit and keep the formal checks | Leave the roles unwritten | no roles | big |
| How a domain reaches you | Filing it offers one task, which your chips board takes over | You read the round plan yourself | read plan | small |
| Round 1's autoformat tasks | One design task for the two rule-order bugs, which now waits for the autoformat check, though the formal-check intake said they need not wait. The arrow bug stays its own urgent task, because folding it in would put its failing test behind that wait too, and nobody knows its cause (look) | Keep every task separate, or fold the arrow bug in too | split autoformat; merge arrow | small |
| Round plan file names | sweep-round-2 and on, so R1 never reads as round 1 | Keep sweep-r2 | r file names | detail |
| A domain with no urgent bug | No task; the round plan's open work lists it for you | A task anyway | low domain tasks | detail |
| Plan review | No panel, since this changes the workflow and no public API | Run a panel on the plan | panel | detail |

## Main changes

- The sweep's page tiers are R1 to R5. P0 to P3 is only a bug's priority, as the chips board ranks it, and domain fix runs go in that order.
- The sweep names two roles. The tester runs rounds, triage and filing. The fixer runs the domain fix runs, babysits them and keeps the formal checks. natamox is the tester and zbeyens the fixer.
- Filing a domain offers one suggested task for its fix run. The tester's session leaves it uncarded, as `AGENTS.md`'s new Sweep handoff line says, and pushes the ledger at once, and the fixer's `/chips all` takes it over. The fix run builds a missing M6 check before its fix, and the task waits on a check task that is already open. The task runs at `high` once triage has traced every kind to its owner.
- Triage takes a session logged blocked, which runs again next round. The tester closes each issue once its recheck passes on beta, and the next round waits only for the fixes the domain runs landed.

## Steps

The execution playbook is Build (`.agents/playbooks/build.md`).

- [x] 1 Rename the page tiers to R1 to R5 in `sweep.md`, `page-health.mjs` and its test, and run `pnpm run prepare`. Proof: the page-health test passes, `sync-resources.mjs --check` exits 0, and no live guide or script names a page tier P1 to P5.
- [x] 2 Write the roles, the domain task at the end of triage, the fix order and the check-first wait into `sweep.md`, and round plans' new file name. Proof: `sync-resources.mjs --check` exits 0 after `pnpm run prepare`, and pstack's `check-playbooks.mjs` passes.
- [x] 3 Point the open steps and the `Status:` lines of the sweep plan and round 1's plan at the tiers and roles. Proof: `review-ledger.mjs check` on each plan exits 0.
- [x] 4 Merge round 1's autoformat tasks into the rule-order design task and make it wait on the autoformat check. Proof: `chips brief` shows the design task waiting on the check, covering the three others, and the check showing the domain's priority. It merged two. The arrow regression stays its own P0 task until someone finds its cause, as the decision log says.
- [x] 5 Smoke the tester's and the fixer's routes in Claude Code and Codex with plain prompts. Proof: the smoke log and its sorts file in the run folder.
- [x] 6 Run the writing passes and land through `land.mjs`. Proof: the `writing` row and `land.mjs`'s log.

## Proof

Each step names its proof, and the decision log cites each log by path.

## Close

Reversals and deviations first. Step 4 merged two tasks, not three, and that reverses the formal-check intake plan's call that t_167ab658 and t_dceb960e need not wait for the autoformat check. They now wait inside t_c4407e94. t_01a87aed, the `->` arrow drop, stays its own P0 task, because folding it in would put its failing test behind that wait, and nobody knows its cause. The first landing's writing row claimed a bro pass and its build rows claimed verified proof without either skill loaded after a compaction; reflect caught both, and the decision log grades them again. Ten smoke rounds found 27 clashes in the rules this change touched or leaned on. This run fixed 26 and lists the last in Open work. Step 6's effort and fold sentences took three tries each, because the first two tries invented chips rules that chips.md contradicts; the final text restates chips.md's Title rule and leaves folds to its Offer. The biggest was the handoff itself. The tester's session would have carded its own offer at its chips Close or in any `/chips` sweep, which keeps the task on natamox's machine. `AGENTS.md`'s Plate overrides now hold a Sweep handoff line, because only `AGENTS.md` outside the pstack block and the project playbooks outrank chips.md. `sweep.md` also has the tester push the ledger right after the offer. Other fixes:

- triage takes a session logged blocked, and that session runs again next round;
- an agent publishes or closes an issue only when the tester's request names that action;
- the tester closes each issue once its recheck passes on beta and `maintainer`'s proof gates hold;
- an issue tag may cover one numbered repro;
- the next round waits only for the fixes the runs landed;
- the tie-break between equal domains reads the lowest tier with a bug;
- Bug fix skips a second triage for sweep issues;
- round 1's plan triages each domain as its sessions finish and no longer holds fixes until every page has its session;
- a domain task runs at `high` when triage traced every kind to its owner, and at `xhigh` otherwise;
- step 6 names `session:` only where a session tool exists;
- a find the retest sent as a spec question goes to `verdict`;
- the tester also closes an issue whose recheck left the hand list;
- the handoff's Open-work stop accepts a task listed as `start <id>`, since the card pass shows at most 10.

Round 1's plan keeps its P1 to P5 tier labels, which match natamox's shared record, and now says they are the R tiers.

This run landed the R1 to R5 tiers in `sweep.md` and `page-health.mjs`, the tester and fixer roles with their names in the proof subject, triage step 6's one task per domain, the priority order with the M6 check first, `sweep-round-<N>` plan names, the Sweep handoff override, the fixes above, and the sweep plans' Status lines and open steps. In the ledger, which no commit holds, t_167ab658 and t_dceb960e folded into t_c4407e94, which now waits on t_30422a81. t_30422a81 shows P1 because t_c4407e94 waits on it. A second landing has the fixes from rounds six to ten, the reflect record and this Close.

Proof and its limits. `verify` ran after the first landing, and the page-health test and the playbook anchor check passed again on the final bytes. The skill mirrors match after each `pnpm run prepare`, and both sweep plans pass the review ledger check. `chips brief` shows the merged autoformat tasks. Ten smoke rounds ran a plain tester prompt and a plain fixer prompt in Claude Code and Codex: the fifth and tenth with the tester prompt only, and the sixth, on the first landing's bytes, with the fixer prompt only. In every answer the tester triaged, filed and offered one task, and the fixer took it with `/chips all`, ordered domains by priority and built a missing M6 check first. From the fifth round on, both runtimes left the task uncarded and pushed the ledger. The sorts file gives each numbered conflict its fix or its reason. The smoke proves routing only, and it ran on zbeyens's setup, not natamox's. No tester and fixer have run the handoff between two machines, and nothing in `append` refuses a card from the tester's session.

The review covered `.agents/rules/verify/references/sweep.md`, `tooling/scripts/page-health.mjs`, `tooling/scripts/page-health.test.mjs`, `docs/plans/2026-10-15-regression-sweep.md`, `docs/plans/2026-10-19-sweep-r1.md`, `AGENTS.md`, `.agents/playbooks/bug-fix.md` and `docs/plans/topics/proof.md`.

The owner asked for the tiers renamed with one cut, the five fixes proposed, and harsh honest feedback. The rename, the R6 cut and the five fixes are done. The feedback is in the reply, and each finding in it that needs work is in Open work.

## Open work

- The other round 1 domains get their tasks as natamox files them, as `sweep.md`'s Triage a domain now says. owner: natamox. stop: every round 1 domain filed.
- Nobody has run the handoff between two people. natamox's first filed domain shows whether its task reaches zbeyens's board. owner: natamox and zbeyens. stop: the first domain task reaches zbeyens's board, carded or listed as `start <id>`.
- A fix run has no recheck row to write `covered-by` on for a find first filed this round, until the next round plan lists its recheck. owner: zbeyens. stop: round 2's plan lists round 1's rechecks.
- The fixer's order now trusts the board's priorities, and the board holds 22 Ready P0 and 48 Ready P1 tasks, most without a card. owner: zbeyens. stop: a `/chips all` sweep judges each Ready P0's priority again.
- No R5 session has run, so nobody knows yet whether gaps against other editors earn a tier. owner: natamox and zbeyens. stop: round 2's tally shows an R5 session, or zbeyens cuts R5.

## Reflect

One reviewer applied the judgment, tooling and divergent lenses to this run's transcript, and the lead sorted the findings. No lesson met the two kinds the lead applies without the owner, so every accepted lesson waits in Backlog.

Fixed in this run. The writing row claimed a bro pass, and the build rows claimed verified proof, with neither skill loaded after the compaction. Both skills now ran on the final text, and the decision log grades the rows again. The last smoke round had run only the tester prompt after the Sweep handoff line changed, so the fixer prompt ran again on the landed bytes. That round found the runtimes disagreeing on a domain task's effort, which four more rounds settled. The Close now names the intake plan's call this run reversed and the setup the smoke ran under. The autoformat Defaults row gives the reason that matters, and Open work holds the board and R5 findings.

Backlog, each with owner: zbeyens and stop: the owner takes or drops it.

- `decisions-check.mjs append` refuses a `writing` row that names bro, unslop, deslop or no-comments, and a Build plan's `verified` proof row, when the session transcript shows no matching skill call since the last compaction. It already reads that transcript to stamp the lead.
- A handoff offer names the role that takes it, and chips Close and `/chips` sweeps skip carding it. That would replace the Sweep handoff line and the tester's manual `setup.mjs` push.
- `append` refuses a `dismissed dup` that moves an `owns:` check onto a keeper that waits on another task.
- `sync-pstack smoke` opens each prompt with a fixed preamble that names the uncommitted worktree, the harness's plan mode and the person the prompt plays. The Smoke step reruns every prompt whose route reads a line changed after its last pass, applies known fixes before the first round, and names whose setup it ran under when the rule's consumer is someone else.
- `plan-page.mjs` stops printing "Page in" lines for detached proof worktrees whose subject file predates a page move.
- User-scope hooks deny an unquoted word that starts with `=` and `git grep -E` with `\b`.
- `no-comments` skips a diff that adds, changes or removes no comment line, as panel-round fixes already do.

Rejected.

- One P scale across the repo. This run's `sweep.md` Pages text already says it.
- The rank of an exception to a pstack rule. `AGENTS.md`'s precedence line and Playbooks paragraph already say it.
- Check a handoff's transport and permissions first. The run did, and no rule lacks it.
- The app refuses Write in the run directory. `land.md`'s Worktrees rule already says to use the shell.
- A pipe hides a check's exit status. The Plans and trails rule already runs proof through `proof.mjs`.
- The `git grep` repetition cap and BSD `cat -A`. Too specific to help a later run.
- `biome` is not the formatter. `CODING_STANDARDS.md` and `lintFix` already say it.
- How the ledger travels. `sweep.md`'s Who does what and `setup.mjs` already say it.
- Put the feedback on the page, and name reversals first. The Plan pages rule and the plan-page skill already require both, and this run fixed its own page.
- The no-panel default after 19 clashes. The reviews list, not risk, decides a panel, and no row applies.
- A truncated read before an earlier publish. The Plan pages rule already requires a whole read.
