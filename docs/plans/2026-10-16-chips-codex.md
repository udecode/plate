# Card sessions hand Codex the coding, and Claude judges

Status: planning: a real card tests the handoff on t_527d5edc
Topic: pstack
Playbook: plan

The owner's words: "i'd like to extend /chips skill to support running those chips in codex instead to spare tokens, but only for non critical designs. we still want critical ones (xhigh effort ones) to be run in claude, while those explicit enough could be run in codex. either i copy a prompt to codex or you could spawn --bypass one. harsh honest feedback", then "indeed we basically want opus for judgement like poteto does. so codex does the worktree patch. would it save a lot of tokens ? dry run now to test it would work before modifying the workflow", then "ok nah for codex we can use xhigh all time. whats final plan?", then "what about i start all chips here on claude as worktree, and it would use codex to run on those same worktrees, then review the output + patch ?? so we can leverage chips on claude / a thorough review/cleanup on test written by codex is done by claude since we assume codex tests tend to low quality. / for when cause is not found: can't we use open to plan/find it, then it spawns codex to code ? only when its worth it / not straigthforward (otherwise its a loss of token)", then "we'll test on a real card now. and even patch it if its green.", then "oh and UI design (especially screenshot judgement , pixel perfect etc) stays in opus."

## Brief

### What will change?

Chips keep their Claude cards. Each card session still finds the cause and plans, then hands Codex the coding in its own copy of the code when that is worth it. Claude reviews the patch and rewrites weak tests.

### What could go wrong?

The saving is about a third to a half of a session, not most of it, because planning, browser checks and review stay in Claude. A rushed review would let weak Codex code land.

## Teach

A chip is side work you start from a card. Its Claude session finds the cause, plans the fix, writes the code, runs the tests, checks the result in the browser and lands the patch. In one measured session, writing code and running tests took 45 percent of the Claude cost, and command runs alone took 56 percent.

In the dry run, Codex wrote one fix and its test in three and a half minutes for 2.4 million mostly cached tokens. Opus then reviewed the diff, and the patch passed.

After this change, the card session keeps every judgment: the cause, the plan, the review and the landing. When the coding is more than a small edit, it writes a short brief and lets Codex do the coding and its test runs in the same copy of the code. Claude then reviews every line, rewrites weak tests and finishes the proof.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| When a session hands Codex the coding | When the change is more than a few lines or needs its own test loop; I write it myself when the brief would be longer than the diff (look) | Hand Codex every change | always codex | big |
| Which checks Claude reruns | The task's own failing check, and I read Codex's logs for the rest | Rerun every check Codex ran | rerun all | small |
| A patch that fails review | I send it back to Codex once with my findings, then finish it myself | I finish it myself straight away | no send-back | small |
| Sessions outside chips | Any Claude session may hand Codex the coding the same way | Only card sessions | chips only | small |
| The trial patch | It lands after the real card's test, with my test review | Drop it and let a card redo the task | drop trial | small |
| The real card test | A plain fix whose cause is known, keeping a slot's fixed values, started now in its own session | The trial's task again | retest trial | detail |
| How long a Codex coding run may take | Up to 6 hours, so a long fix finishes, while a hung run still ends (look) | No limit at all | no cap | small |
| Review of this plan | No panel on the plan; a decision-trail review runs before the shared rules are pushed | A panel on the plan first | panel | detail |

## Main changes

- No ledger, card or board change. Every chip still starts as a Claude card in its own worktree, and xhigh design questions stay in Claude for their design.
- UI design stays in Opus. That covers layout, styling and visual polish, and every judgment made from a screenshot, such as a pixel match or a visual review. A session never hands Codex a change whose result is judged by how it looks. Codex may still code the logic inside a UI component, and the Claude session runs the browser proof and judges its screenshots.
- A session that has located the cause and planned the change, at any effort, may hand Codex the coding. It fills the shared brief `.agents/pstack/codex-build.md` with the task, the located cause, the planned change, the files and the checks to run. Then it runs `node .agents/pstack/cross.mjs --to codex --bypass --effort xhigh --timeout 21600 --prompt-file <brief>` in the background from its own working directory and waits for it to exit.
- A Codex coding run is exempt from the Time budget rule's hour, because some fixes take hours and stopping one wastes its work. `cross.mjs` accepts a timeout up to 6 hours under `--bypass` without `--stress`. Proofs, seats and measurements keep the hour. The Claude session sits idle while Codex runs, so a long run costs Codex time, not Claude tokens.
- The brief, taken from the dry run, has Codex write the fix and its regression test, see the test fail before the fix and pass after, and run the named checks. Its final message lists the files, the root cause, and each command with its exit status. It forbids plans, decision logs, panels, seats, ledger writes, commits and worktree changes, and says to stop on any design choice the plan does not settle.
- The session reviews the whole diff, runs the task's own check, and reads the callers of each changed symbol. It then runs `deslop` and `no-comments`, the browser proof, any panel the reviews list names, and the landing, as today.
- Claude reviews every test Codex wrote against the Tests rule. Each test must name the defect it catches, fail before the fix, assert public behavior against literal values, and repeat no other test's boundary. Claude rewrites or cuts each one that falls short.
- The block's Codex workers rule changes in two ways. A session may hand Codex the coding of its own planned change without the owner's word. A Codex worker may write the tests of the change it codes, which replaces "A worker never writes or changes a test" for that case, while docs and changesets stay with Claude. Codex runs at `xhigh` every time, as the owner said.

## Steps

- [x] Run the handoff on one real card, `t_527d5edc`, in its own session, and land its patch if every check is green. Proof: the session's report, its ledger rows and its token totals.
- [ ] Let `cross.mjs` take a timeout up to 21600 seconds under `--bypass` without `--stress`, with a test that it refuses 21601 and refuses over 3600 without `--bypass`, and exempt Codex coding runs in the Time budget rule. Proof: the dotai suite log.
- [ ] Write `codex-build.md` in dotai's shared helpers from the dry run's brief, with slots for the task, cause, plan, files and checks. Proof: the dotai diff.
- [ ] Rewrite the block's Codex workers rule, with UI design and screenshot judgment kept in Opus, and the Tests rule's review of Codex tests, and add one line to the chips rule that card sessions use it. Proof: the dotai diff.
- [ ] Run `unslop` on the rule text. Proof: the writing row.
- [ ] Run dotai's suite and `validate-skills`. Proof: the logs.
- [ ] Run the decision-trail review on this plan's log and the rule diff. Proof: its answer.
- [ ] Commit and push dotai, sync plate-2 and ellie from the pushed commit, and run `verify` on each. Proof: the commits and verify logs.
- [ ] Land `t_cf6a9e03`'s trial patch after a test review, then measure the next two card sessions that hand Codex the coding, each with its Claude and Codex tokens beside the 5.7 million weighted baseline. Proof: the token logs.
