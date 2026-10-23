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

Page tiers are now R1 to R5, so P0 to P3 only ever means how urgent a bug is. natamox tests, triages and files. You fix. Each filed domain shows up on your board as one task.

### What could go wrong?

Nobody has run the handoff between two people yet. If natamox's agent takes the task itself or skips the ledger push, the task stays on natamox's machine. The smoke runs only show that both agents read the rules right.

## Teach

The sweep tests every beta page beside the page it should match. Pages sit in five tiers, from Slate examples to gaps against other editors. Each tested domain's bugs are grouped by cause and fixed in one run.

The tiers were called P1 to P5, the same names the task board uses for how urgent a bug is. So a crash on a new Plite example looked low priority, and fixes went in tier order. Nothing said who does which part, and the fixes reached the board as a pile of one-issue tasks.

Now the tiers are R1 to R5, and every priority is a board priority. natamox tests, triages and files. You fix and babysit. Filing a domain offers one task for it, and when that domain needs a formal check, the check lands first.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Page tier names | R1 to R5, and fixing is no tier at all (look) | Keep P1 to P6 | p tiers | big |
| Fix order | By how urgent the bug is, the lower tier first between equals (look) | Tier order, R1 first, as picked on 10-15 | tier order | big |
| Who does what | natamox tests, triages and files; you fix, babysit and keep the formal checks | Leave the roles unwritten | no roles | big |
| How a domain reaches you | Filing it offers one task, which your chips board takes over | You read the round plan yourself | read plan | small |
| Round 1's autoformat tasks | One design task for the two rule-order bugs, which waits for the autoformat check. The arrow bug came from the test suite, not from round 1's testing, and nobody knows its cause, so it stays its own urgent task (look) | Keep every task separate, or fold the arrow bug in too | split autoformat; merge arrow | small |
| Round plan file names | sweep-round-2 and on, so R1 never reads as round 1 | Keep sweep-r2 | r file names | detail |
| A domain with no urgent bug | No task; the round plan's open work lists it for you | A task anyway | low domain tasks | detail |
| Plan review | No panel, since this changes the workflow and no public API | Run a panel on the plan | panel | detail |

## Main changes

- The sweep's page tiers are R1 to R5. P0 to P3 is only a bug's priority, as the chips board ranks it, and domain fix runs go in that order.
- The sweep names two roles. The tester runs rounds, triage and filing. The fixer runs the domain fix runs, babysits them and keeps the formal checks. natamox is the tester and zbeyens the fixer.
- Filing a domain offers one suggested task for its fix run. The tester's session leaves it uncarded, as `AGENTS.md`'s new Sweep handoff line says, and pushes the ledger at once, and the fixer's `/chips all` takes it over. The fix run builds a missing M6 check before its fix, and the task waits on a check task that is already open.
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

Reversals and deviations first. Step 4 merged two tasks, not three. t_01a87aed, the `->` arrow drop, stays its own P0 task, because it came from the www suite failures on `next`, not from round 1's triage, and nobody knows its cause. Five smoke rounds found 19 clashes in the rules this change touched or leaned on, and this run fixed each one. The biggest was the handoff itself. The tester's session would have carded its own offer at its chips Close or in any `/chips` sweep, which keeps the task on natamox's machine. `AGENTS.md`'s Plate overrides now hold a Sweep handoff line, because only `AGENTS.md` outside the pstack block and the project playbooks outrank chips.md. `sweep.md` also has the tester push the ledger right after the offer. Other fixes:

- triage takes a session logged blocked, and that session runs again next round;
- an agent publishes or closes an issue only when the tester's request names that action;
- the tester closes each issue once its recheck passes on beta and `maintainer`'s proof gates hold;
- an issue tag may cover one numbered repro;
- the next round waits only for the fixes the runs landed;
- the tie-break between equal domains reads the lowest tier with a bug;
- Bug fix skips a second triage for sweep issues;
- round 1's plan triages each domain as its sessions finish and no longer holds fixes until every page has its session.

Round 1's plan keeps its P1 to P5 tier labels, which match natamox's shared record, and now says they are the R tiers.

This run landed the R1 to R5 tiers in `sweep.md` and `page-health.mjs`, the tester and fixer roles with their names in the proof subject, triage step 6's one task per domain, the priority order with the M6 check first, `sweep-round-<N>` plan names, the Sweep handoff override, the fixes above, and the sweep plans' Status lines and open steps. In the ledger, which no commit holds, t_167ab658 and t_dceb960e folded into t_c4407e94, which now waits on t_30422a81. t_30422a81 shows P1 because t_c4407e94 waits on it.

Proof and its limits. The page-health test passes with the R labels. The skill mirrors match after `pnpm run prepare`, every project playbook still anchors, and both sweep plans pass the review ledger check. `chips brief` shows the merged autoformat tasks. Five smoke rounds ran a plain tester prompt and a plain fixer prompt in Claude Code and Codex, the fifth with the tester prompt only. In every answer the tester triaged, filed and offered one task, and the fixer took it with `/chips all`, ordered domains by priority and built a missing M6 check first. In the fifth round both runtimes also left the task uncarded and pushed the ledger. The sorts file gives each numbered conflict its fix or its reason. The smoke proves routing only. No tester and fixer have run the handoff between two machines, and nothing in `append` refuses a card from the tester's session.

The review covered `.agents/rules/verify/references/sweep.md`, `tooling/scripts/page-health.mjs`, `tooling/scripts/page-health.test.mjs`, `docs/plans/2026-10-15-regression-sweep.md`, `docs/plans/2026-10-19-sweep-r1.md`, `AGENTS.md`, `.agents/playbooks/bug-fix.md` and `docs/plans/topics/proof.md`.

The owner asked for the tiers renamed with one cut, the five fixes proposed, and harsh honest feedback. The rename, the R6 cut and the five fixes are done, and the feedback is in the reply.

## Open work

- The other round 1 domains get their tasks as natamox files them, as `sweep.md`'s Triage a domain now says. owner: natamox. stop: every round 1 domain filed.
- Nobody has run the handoff between two people. natamox's first filed domain shows whether its task reaches zbeyens's board. owner: natamox and zbeyens. stop: the first domain task is carded on zbeyens's board.
