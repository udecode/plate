# Intake: where formal checks pay off before beta

Page: https://claude.ai/artifact/H53SYtfn2wQTgkbpC6bJkw
Status: done: 12 items, 5 chips offered, 0 folded
Playbook: verdict

The owner asked three things. Are we using formal checks everywhere they pay off? Should a new skill or playbook drive the product toward a beta with no regressions, without slowing the dev loop? What would we cut? Today one formal check exists, the decision-order check of the suggestion review tree. Three more places earn one. Autoformat has 5 of the 18 open Beta bugs. Suggestion recording keeps failing one random seed at a time. Yjs peers end up with different documents, and no tester or test reaches that case. Each check gets its own small skill, the way the decision-order check has. No new playbook and no umbrella skill, because pstack's two formal-check skills already say how to build and maintain a check. Nothing in the rules is worth cutting. The time worth cutting is in the sampled law tests, and the recording check can replace their small cases. The 8 Beta bugs that need a real browser stay with the hands-on sweep.

## Brief

### What will change?

No code changes and no new playbook. Three tasks add exhaustive checks for autoformat, suggestion recording and Yjs peers. Two more add a daily run of their deeper sizes and a Bug fix rule once two checks exist.

### What could go wrong?

A check covers only small documents, and bugs that need a real browser stay with the hands-on sweep. A check that grows past about 15 seconds slows every landing that touches its code.

## Pushback

- **"Regression-free" is not a claim any check can make.** A formal check proves its property only for the documents its bound builds. A release is ready when a sweep round finds no new P1 to P4 bug, which is the sweep's own rule, and the checks guard what earlier rounds fixed. The checks shrink what people have to find. They do not replace the sweep for the 8 open Beta bugs that need a real browser.
- **"Everywhere" is the wrong target.** A formal check pays off where the code makes a promise you can check without a browser and something says what the right answer is. Selection paint and Tab behavior fail one of those two tests today, so they get no check (items 4 and 5).
- **The sweep already found why written checks miss.** Lists written ahead held a past bug's exact steps in 1 of 60 tries, because each bug needed a sequence nobody wrote down (regression sweep plan, Teach). An exhaustive check tries every sequence up to its bound, so nobody has to guess it. That is why it helps the sweep instead of competing with it, but only for logic a test can see without a browser.
- **The slow part of the loop is the sampled tests, not formal checks.** On the last landing, measured on a loaded machine, the decision-order check took 5 s of 874 s. The test step took 383 s and the Plite test step 171 s. The slow lane cut the heavy law tests to fewer random cases, and its own brief says a rare bug can now take days to show. The board shows the cost. The proposed-children law has two open tasks, one per failing seed.
- **Generated checks already get built, and then nothing runs them.** The cut-join chain check that found 13 order cases for t_44385dec lives only in a run folder that git ignores, and no gate runs it. A check stays in use only with a coverage record, a gate and a skill, which is what pstack's formal-check skill leaves behind.

## Items

| # | Item | Outcome | Scope | Strongest reason | Evidence | Next |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | An exhaustive check of the www autoformat kit. It tries every short typed sequence over the rules' delimiters, and a shorthand must apply whole or stay literal and never touch another block | Defer, P2 | none | 5 of the 18 open Beta bugs are autoformat (#5201, #5202, #5203, #5204, #5226), and t_167ab658 and t_dceb960e are two rule-order bugs the slow lane found only by typing key by key. Each test checks one string, so rule pairs collide unseen. Its first run decides. Keep it if it finds those seven cases in under 15 s | `apps/www/src/__tests__/package-integration/autoformat/current-kit.spec.tsx:127` already types key by key without a browser; the rules it checks against start at `docs/editor-behavior/markdown-editing-spec.md:3678` | t_30422a81 |
| 2 | An exhaustive check of suggestion recording. On every small document and for every suggesting command, accepting everything gives the plain edit and rejecting everything gives the original | Defer, P2 | none | The sampled recording laws find bugs one seed at a time. Three open tasks name a seed (t_51daafb8, t_2a5844dd, t_9fd560fb), t_820a6175 holds two more failing laws, and five recording and undo mutants survive every law (t_78e51eb0). #5194 is this kind of bug. The check reuses the decision-order generator. Keep it if it reproduces those seeds' failures and catches those mutants in under 15 s | `packages/plitejs/test/authored-tree-recording-laws.spec.ts:4425`; `packages/plitejs/scripts/authored-decision-order.ts` | t_a998edbb |
| 3 | An exhaustive check that two Yjs peers end with the same document for every interleaving of short command pairs | Defer, P2 | none | Two of the five newest commits on next fix peers that end up different (9545f7976b, 15ce336b9d), and three Yjs mutants survive every law (t_78e51eb0). The Yjs specs check named scenarios. No beta tester runs a second peer, so neither people nor tests reach this. Keep it if it catches those mutants or finds peers that end up different, in under 15 s | `packages/plitejs/test/yjs/admission-lifecycle-contract.spec.ts:735` | t_dd929413 |
| 4 | A formal check of selection and the caret | Stop | none | The sweep's census puts 34 of 88 missed fixes in focus, paint and native keys, which no model sees. The model side already has laws | `docs/plans/2026-10-15-regression-sweep.md:168`; `packages/plitejs/test/document-change-laws.test.ts`; `packages/plitejs/test/history/anchor-history-contract.ts` | none |
| 5 | A formal check of Tab, Enter and Backspace in every block type (#5199, #5200) | Stop | none | Nothing written says what Tab should do in each block, so a check could only catch crashes and broken documents. The one crash in this area on the Beta list, #5064, is closed. The open Tab bugs are about which action runs, so they need that rule written first | `docs/editor-behavior/markdown-editing-spec.md` has no Tab or indent section; #5064 closed | none |
| 6 | A new playbook or umbrella skill for formal checks or regressions | Stop | none | pstack's create and maintain skills already say how to build and keep a check, and each check keeps its own skill with its coverage record, as the decision-order check does. The sweep cut its own rule, playbook and card script after a tied trial, and chose no sweep skill | `docs/plans/2026-10-15-regression-sweep.md:42`, `:88`; `.agents/rules/authored-decision-order.mdc` | none |
| 7 | A bug fix in an area that has a formal check makes that check catch the bug, not only a new example test | Defer, P3 | none | The owner's rule is that each bug means a test is missing or wrong. A check that missed a bug and still misses it after the fix is that case. With one check a rule is too early, and with two it is a pattern. It waits for tasks 1 and 2 to land | `docs/plans/2026-10-15-regression-sweep.md:144`; `.agents/playbooks/bug-fix.md` | t_589db800 |
| 8 | Keep the fast dev loop | Settled | none | On the last landing, the decision-order check took 5 s of 874 s of check steps, while the test step took 383 s and the Plite test step 171 s. Each new check keeps its gate size under about 15 s and runs only when its own files change | this run's `land-step-times.txt`; `tooling/scripts/check.mjs:160` | none |
| 9 | Deeper sizes of the formal checks run nowhere on their own | Bug, P3 | none | Two of the bugs planted in the resolver pass the gate and fail only at a deeper size, and no check step runs one. A daily run has to match the known failures, because the deeper sizes fail on them today | `.agents/rules/authored-decision-order.mdc`, What a pass proves; `tooling/scripts/check.mjs:160` | t_df2f315f |
| 10 | Cut skills or rules to make room | Stop | none | Nothing material to cut. The skill audit finds three sentences that repeat pstack's commit format and one test sentence, and cutting them saves nothing. The sweep already removed its own rule, playbook and card script | this run's `skill-audit.txt`; `docs/plans/2026-10-15-regression-sweep.md:88` | none |
| 11 | Cut test time instead, by dropping the sampled recording laws' small cases once the exhaustive check covers them | Defer, P2 | none | The test step is the slow part of every landing. Once the recording check catches every mutant the sampled laws catch at the same sizes, their small cases repeat its work. Their large cases stay, because no bound reaches them | `docs/plans/2026-10-19-slow-lane.md`, Brief; t_78e51eb0's mutants | t_a998edbb |
| 12 | Compare with the open Beta issues | Settled | none | Going by title, 8 of the 18 open Beta bugs are editor logic a check without a browser can see, 8 need a real browser and 2 are unclear. Items 1 and 2 cover 6 of those 8. The sweep keeps every open Beta bug as a recheck | this run's `beta-issues.tsv`; `docs/plans/2026-10-15-regression-sweep.md:48` | none |

## Order

1. Start with t_30422a81. It is the cheapest, a test already types key by key without a browser, and it covers five open Beta bugs and two ready P1 fixes. Those two fixes, t_167ab658 and t_dceb960e, do not wait for it.
2. t_a998edbb is next. It has the biggest pool of bugs, reuses the decision-order generator, and ends by trimming the sampled cases it covers, which wins back landing time.
3. t_dd929413 after that. Peers that end up different lose data, and nothing else watches for it.
4. t_df2f315f can run any time.
5. t_589db800 waits until tasks 1 and 2 land.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which check goes first | Autoformat, the cheapest one that covers the most Beta bugs | Suggestion recording first | recording first | big |
| Skills for the checks | One small skill per check, holding what it covers | One skill for every check | umbrella skill | small |
| Where the sampled-test trim goes | Inside the recording check task, after it compares mutants | Its own task | split the trim | small |

## Close

This run landed this page and its decision log and offered five tasks. It wrote no code and no test.

It read the regression sweep plan, the head of round 1's plan, the slow-lane plan, all 41 Beta issues on GitHub, the open-task board, the check runner and the decision-order skill. The board holds 534 open tasks. The split of Beta bugs into browser and non-browser comes from their titles only, so it is inferred. The step times come from one landing on a loaded machine. Each new check's 15-second budget is a target, not a measurement.
